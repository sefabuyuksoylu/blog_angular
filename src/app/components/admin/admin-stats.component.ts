import { Component, OnInit, OnDestroy } from '@angular/core';
import { SupabaseService } from '../../services/supabase.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-admin-stats',
  template: `
    <div class="admin-stats">
      <h1>İstatistikler</h1>
      
      <div class="stats-grid">
        <div class="stat-card">
          <h3>Toplam Blog</h3>
          <p>{{stats.totalBlogs}}</p>
        </div>
        <div class="stat-card">
          <h3>Toplam Okuma</h3>
          <p>{{stats.totalViews}}</p>
        </div>
        <div class="stat-card">
          <h3>Toplam Kullanıcı</h3>
          <p>{{stats.totalUsers}}</p>
        </div>
      </div>

      <div class="category-stats">
        <h2>Kategori İstatistikleri</h2>
        <table>
          <thead>
            <tr>
              <th>Kategori</th>
              <th>Blog Sayısı</th>
              <th>Toplam Okunma</th>
              <th>Ortalama Okunma</th>
            </tr>
          </thead>
          <tbody>
            <tr *ngFor="let cat of categoryStats">
              <td>{{cat.name}}</td>
              <td>{{cat.blog_count}}</td>
              <td>{{cat.total_views}}</td>
              <td>{{cat.total_views / (cat.blog_count || 1) | number:'1.0-0'}}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  `,
  styles: [`
    .admin-stats {
      padding: 2rem;
    }

    .stats-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
      gap: 2rem;
      margin-bottom: 3rem;
    }

    .stat-card {
      background: white;
      padding: 2rem;
      border-radius: 12px;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
      text-align: center;

      h3 {
        color: #666;
        margin-bottom: 1rem;
      }

      p {
        font-size: 2rem;
        font-weight: bold;
        color: #333;
      }
    }

    .category-stats {
      background: white;
      padding: 2rem;
      border-radius: 12px;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);

      h2 {
        margin-bottom: 2rem;
        color: #333;
      }

      table {
        width: 100%;
        border-collapse: collapse;

        th, td {
          padding: 1rem;
          text-align: left;
          border-bottom: 1px solid #eee;
        }

        th {
          font-weight: 500;
          color: #666;
        }

        td {
          color: #333;
        }
      }
    }
  `],
  standalone: true,
  imports: [CommonModule]
})
export class AdminStatsComponent implements OnInit, OnDestroy {
  stats = {
    totalBlogs: 0,
    totalViews: 0,
    totalUsers: 0
  };
  
  categoryStats: any[] = [];
  private subscription: any;

  constructor(private supabase: SupabaseService) {}

  ngOnInit() {
    this.loadStats();
    this.setupRealtimeSubscription();
  }

  async loadStats() {
    try {
      // Toplam blog ve görüntülenme sayısı
      const { data: blogs } = await this.supabase.client
        .from('blogs')
        .select('views_count');

      const totalBlogs = blogs?.length || 0;
      const totalViews = blogs?.reduce((sum, blog) => sum + (blog.views_count || 0), 0) || 0;

      // Toplam kullanıcı sayısı
      const { count: totalUsers } = await this.supabase.client
        .from('profiles')
        .select('*', { count: 'exact', head: true });

      // Kategori istatistikleri
      const { data: categories } = await this.supabase.client
        .from('category_stats')
        .select('*')
        .order('blog_count', { ascending: false });

      this.stats = {
        totalBlogs,
        totalViews,
        totalUsers: totalUsers || 0
      };

      this.categoryStats = categories || [];

    } catch (error) {
      console.error('İstatistik yükleme hatası:', error);
    }
  }

  setupRealtimeSubscription() {
    this.subscription = this.supabase.client
      .channel('db-changes')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'blogs' },
        () => this.loadStats()
      )
      .on('postgres_changes',
        { event: '*', schema: 'public', table: 'profiles' },
        () => this.loadStats()
      )
      .subscribe();
  }

  ngOnDestroy() {
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
  }
} 