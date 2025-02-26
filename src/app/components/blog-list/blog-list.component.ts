import { Component, OnInit } from '@angular/core';
import { BlogService } from '../../services/blog.service';
import { Blog, Category } from '../../models/blog.model';
import { Router } from '@angular/router';

@Component({
  selector: 'app-blog-list',
  template: `
    <div class="blog-list-container">
      <header class="list-header">
        <h1>Blog Yazıları</h1>
        <div class="filters">
          <select [(ngModel)]="selectedCategory" (change)="filterByCategory()">
            <option value="">Tüm Kategoriler</option>
            <option *ngFor="let cat of categories" [value]="cat.id">
              {{cat.name}}
            </option>
          </select>
          
          <select [(ngModel)]="sortBy" (change)="sortBlogs()">
            <option value="date">En Yeni</option>
            <option value="views">En Çok Okunan</option>
          </select>
        </div>
      </header>

      <div class="blog-grid">
        <article *ngFor="let blog of blogs" class="blog-card">
          <img [src]="blog.image || 'assets/default-blog.jpg'" [alt]="blog.title">
          <div class="content">
            <div class="meta">
              <span class="category">{{blog.categories?.name}}</span>
              <span class="views">{{blog.views_count}} görüntülenme</span>
            </div>
            <h2>{{blog.title}}</h2>
            <p>{{blog.content | slice:0:150}}...</p>
            <div class="author">
              <img [src]="blog.profiles?.avatar_url" alt="author" class="avatar">
              <span>{{blog.profiles?.full_name}}</span>
            </div>
            <button (click)="readBlog(blog.id)">Devamını Oku</button>
          </div>
        </article>
      </div>

      <div *ngIf="blogs.length === 0" class="no-blogs">
        <p>Henüz blog yazısı bulunmuyor.</p>
      </div>
    </div>
  `,
  styleUrls: ['./blog-list.component.scss']
})
export class BlogListComponent implements OnInit {
  blogs: Blog[] = [];
  categories: Category[] = [];
  selectedCategory: string = '';
  sortBy: 'date' | 'views' = 'date';

  constructor(
    private blogService: BlogService,
    private router: Router
  ) {}

  async ngOnInit() {
    await this.loadCategories();
    await this.loadBlogs();
  }

  async loadCategories() {
    const { data } = await this.blogService.getCategories();
    if (data) this.categories = data;
  }

  async loadBlogs() {
    try {
      const blogs = await this.blogService.getBlogs();
      this.blogs = blogs || [];
      this.sortBlogs();
    } catch (error) {
      console.error('Blog yükleme hatası:', error);
    }
  }

  async filterByCategory() {
    if (this.selectedCategory) {
      const { data } = await this.blogService.getBlogsByCategory(this.selectedCategory);
      this.blogs = data || [];
    } else {
      await this.loadBlogs();
    }
  }

  sortBlogs() {
    if (this.sortBy === 'views') {
      this.blogs.sort((a, b) => (b.views_count || 0) - (a.views_count || 0));
    } else {
      this.blogs.sort((a, b) => 
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      );
    }
  }

  readBlog(id: string) {
    this.router.navigate(['/blog', id]);
  }
} 