import { Component, OnInit, OnDestroy } from '@angular/core';
import { AuthService } from '../../services/auth.service';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { SupabaseService } from '../../services/supabase.service';

@Component({
  selector: 'app-user-list',
  template: `
    <div class="user-list">
      <h1>Kullanıcılar</h1>
      
      <div class="filters">
        <input 
          type="text" 
          [(ngModel)]="searchTerm" 
          (input)="filterUsers()" 
          placeholder="Kullanıcı ara...">
          
        <select [(ngModel)]="roleFilter" (change)="filterUsers()">
          <option value="">Tüm Roller</option>
          <option value="user">Kullanıcı</option>
          <option value="admin">Admin</option>
        </select>
      </div>

      <div *ngIf="isLoading" class="loading">Yükleniyor...</div>

      <table *ngIf="!isLoading">
        <thead>
          <tr>
            <th>Avatar</th>
            <th>Ad Soyad</th>
            <th>Email</th>
            <th>Rol</th>
            <th>Blog Sayısı</th>
            <th>Kayıt Tarihi</th>
            <th>İşlemler</th>
          </tr>
        </thead>
        <tbody>
          <tr *ngFor="let user of filteredUsers">
            <td>
              <img [src]="user.avatar_url || '/assets/images/varsayilanprofilresmi.png'" [alt]="user.full_name" class="avatar">
            </td>
            <td>{{user.full_name}}</td>
            <td>{{user.email}}</td>
            <td>
              <select [(ngModel)]="user.role" (change)="updateUserRole(user)">
                <option value="user">Kullanıcı</option>
                <option value="admin">Admin</option>
              </select>
            </td>
            <td>{{user.blog_count || 0}}</td>
            <td>{{user.created_at | date}}</td>
            <td>
              <button (click)="deleteUser(user.id)" class="delete-btn">Sil</button>
            </td>
          </tr>
        </tbody>
      </table>

      <div *ngIf="!isLoading && filteredUsers.length === 0" class="no-results">
        Kullanıcı bulunamadı.
      </div>
    </div>
  `,
  styles: [`
    .user-list {
      padding: 2rem;
    }

    h1 {
      margin-bottom: 2rem;
      color: #333;
    }

    .loading {
      text-align: center;
      padding: 2rem;
      color: #666;
    }

    .no-results {
      text-align: center;
      padding: 2rem;
      color: #666;
    }

    .filters {
      display: flex;
      gap: 1rem;
      margin-bottom: 2rem;

      input, select {
        padding: 0.5rem;
        border: 1px solid #ddd;
        border-radius: 4px;
      }

      input {
        flex: 1;
      }
    }

    table {
      width: 100%;
      border-collapse: collapse;
      background: white;
      border-radius: 12px;
      overflow: hidden;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);

      th, td {
        padding: 1rem;
        text-align: left;
        border-bottom: 1px solid #eee;
      }

      th {
        background: #f8f9fa;
        font-weight: 500;
        color: #666;
      }

      .avatar {
        width: 40px;
        height: 40px;
        border-radius: 50%;
        object-fit: cover;
      }

      select {
        padding: 0.3rem;
        border: 1px solid #ddd;
        border-radius: 4px;
      }

      .delete-btn {
        padding: 0.5rem 1rem;
        background: #e2e2e2;
        color: #4a4a4a;
        border: none;
        border-radius: 4px;
        cursor: pointer;

        &:hover {
          background: #d1d1d1;
        }
      }
    }
  `],
  imports: [FormsModule, CommonModule],
  standalone: true
})
export class UserListComponent implements OnInit, OnDestroy {
  users: any[] = [];
  filteredUsers: any[] = [];
  searchTerm: string = '';
  roleFilter: string = '';
  isLoading: boolean = true;
  private subscription: any;

  constructor(private supabase: SupabaseService) {}

  ngOnInit() {
    this.loadUsers();
    this.setupRealtimeSubscription();
  }

  setupRealtimeSubscription() {
    this.subscription = this.supabase.client
      .channel('profiles-changes')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'profiles' }, 
        (payload) => {
          if (payload.eventType === 'UPDATE') {
            this.users = this.users.map(user => 
              user['id'] === payload.new['id'] ? payload.new : user
            );
            this.filterUsers();
          } else if (payload.eventType === 'DELETE') {
            this.users = this.users.filter(user => user['id'] !== payload.old['id']);
            this.filterUsers();
          }
        }
      )
      .subscribe();
  }

  ngOnDestroy() {
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
  }

  async loadUsers() {
    try {
      this.isLoading = true;
      const { data, error } = await this.supabase.client
        .from('profiles')
        .select(`
          *,
          blogs!author_id (count)
        `);

      if (error) throw error;

      if (data) {
        this.users = data.map(user => ({
          ...user,
          blog_count: user.blogs?.[0]?.count || 0
        }));
        this.filteredUsers = this.users;
      }
    } catch (error) {
      console.error('Kullanıcılar yüklenirken hata:', error);
    } finally {
      this.isLoading = false;
    }
  }

  filterUsers() {
    this.filteredUsers = this.users.filter(user => {
      const matchesSearch = !this.searchTerm || 
        user.full_name?.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        user.email?.toLowerCase().includes(this.searchTerm.toLowerCase());
      
      const matchesRole = !this.roleFilter || user.role === this.roleFilter;
      
      return matchesSearch && matchesRole;
    });
  }

  async updateUserRole(user: any) {
    try {
      const { error } = await this.supabase.client
        .from('profiles')
        .update({ role: user.role })
        .eq('id', user.id);

      if (error) throw error;
    } catch (error) {
      console.error('Rol güncelleme hatası:', error);
      user.role = user.role === 'admin' ? 'user' : 'admin';
    }
  }

  async deleteUser(userId: string) {
    if (confirm('Bu kullanıcıyı silmek istediğinizden emin misiniz?')) {
      try {
        const { error } = await this.supabase.client
          .from('profiles')
          .delete()
          .eq('id', userId);

        if (error) throw error;
        await this.loadUsers();
      } catch (error) {
        console.error('Kullanıcı silme hatası:', error);
      }
    }
  }
} 