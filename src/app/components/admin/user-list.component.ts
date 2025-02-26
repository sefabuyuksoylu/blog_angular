import { Component, OnInit } from '@angular/core';
import { AuthService } from '../../services/auth.service';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

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

      <table>
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
              <img [src]="user.avatar_url" [alt]="user.full_name" class="avatar">
            </td>
            <td>{{user.full_name}}</td>
            <td>{{user.email}}</td>
            <td>
              <select [(ngModel)]="user.role" (change)="updateUserRole(user)">
                <option value="user">Kullanıcı</option>
                <option value="admin">Admin</option>
              </select>
            </td>
            <td>{{user.blog_count}}</td>
            <td>{{user.created_at | date}}</td>
            <td>
              <button (click)="deleteUser(user.id)" class="delete-btn">Sil</button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  `,
  styles: [`
    .user-list {
      padding: 2rem;
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
export class UserListComponent implements OnInit {
  users: any[] = [];
  filteredUsers: any[] = [];
  searchTerm: string = '';
  roleFilter: string = '';

  constructor(private auth: AuthService) {}

  async ngOnInit() {
    await this.loadUsers();
  }

  async loadUsers() {
    const { data } = await this.auth.getAllUsers();
    this.users = data || [];
    this.filterUsers();
  }

  filterUsers() {
    this.filteredUsers = this.users.filter(user => {
      const matchesSearch = !this.searchTerm || 
        user.full_name.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        user.email.toLowerCase().includes(this.searchTerm.toLowerCase());
      
      const matchesRole = !this.roleFilter || user.role === this.roleFilter;
      
      return matchesSearch && matchesRole;
    });
  }

  async updateUserRole(user: any) {
    try {
      await this.auth.updateUserRole(user.id, user.role);
    } catch (error) {
      console.error('Rol güncelleme hatası:', error);
      // Hata durumunda eski role geri dön
      user.role = user.role === 'admin' ? 'user' : 'admin';
    }
  }

  async deleteUser(userId: string) {
    if (confirm('Bu kullanıcıyı silmek istediğinizden emin misiniz?')) {
      try {
        await this.auth.deleteUser(userId);
        await this.loadUsers();
      } catch (error) {
        console.error('Kullanıcı silme hatası:', error);
      }
    }
  }
} 