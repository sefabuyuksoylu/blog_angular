import { Component, OnInit } from '@angular/core';
import { BlogService } from '../../services/blog.service';
import { AuthService } from '../../services/auth.service';
import { CommonModule } from '@angular/common';  // date pipe için

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
              <td>{{cat.blogs.count}}</td>
              <td>{{cat.total_views}}</td>
              <td>{{cat.total_views / cat.blogs.count | number:'1.0-0'}}</td>
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
export class AdminStatsComponent implements OnInit {
  stats = {
    totalBlogs: 0,
    totalViews: 0,
    totalUsers: 0
  };
  
  categoryStats: any[] = [];

  constructor(
    private blogService: BlogService,
    private auth: AuthService
  ) {}

  async ngOnInit() {
    await this.loadStats();
  }

  async loadStats() {
    try {
      // Kategori istatistikleri
      const { data: categories } = await this.blogService.getCategoryStats();
      this.categoryStats = categories || [];

      // Toplam blog ve görüntülenme sayısı
      let totalBlogs = 0;
      let totalViews = 0;
      this.categoryStats.forEach(cat => {
        totalBlogs += cat.blogs.count;
        totalViews += cat.total_views || 0;
      });

      // Kullanıcı sayısı
      const { count } = await this.auth.getUserCount();

      this.stats = {
        totalBlogs,
        totalViews,
        totalUsers: count || 0
      };
    } catch (error) {
      console.error('İstatistik yükleme hatası:', error);
    }
  }
} 