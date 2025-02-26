import { Component, OnInit } from '@angular/core';
import { BlogService } from '../../services/blog.service';

@Component({
  selector: 'app-admin-dashboard',
  template: `
    <div class="admin-dashboard">
      <h1>Admin Paneli</h1>
      
      <div class="stats-grid">
        <div class="stat-card">
          <h3>Toplam Blog</h3>
          <p>{{stats.totalBlogs}}</p>
        </div>
        <div class="stat-card">
          <h3>Toplam Kategori</h3>
          <p>{{stats.totalCategories}}</p>
        </div>
        <div class="stat-card">
          <h3>Toplam Kullanıcı</h3>
          <p>{{stats.totalUsers}}</p>
        </div>
      </div>

      <div class="category-stats">
        <h2>Kategori İstatistikleri</h2>
        <table>
          <tr>
            <th>Kategori</th>
            <th>Blog Sayısı</th>
            <th>Toplam Görüntülenme</th>
          </tr>
          <tr *ngFor="let cat of categoryStats">
            <td>{{cat.name}}</td>
            <td>{{cat.blogs.count}}</td>
            <td>{{cat.total_views}}</td>
          </tr>
        </table>
      </div>
    </div>
  `
})
export class AdminDashboardComponent implements OnInit {
  stats = {
    totalBlogs: 0,
    totalCategories: 0,
    totalUsers: 0
  };
  
  categoryStats: any[] = [];

  constructor(private blogService: BlogService) {}

  async ngOnInit() {
    const { data } = await this.blogService.getCategoryStats();
    this.categoryStats = data || [];
  }
} 