import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { BlogService } from '../../services/blog.service';
import { AuthService } from '../../services/auth.service';
import { Blog } from '../../models/blog.model';

@Component({
  selector: 'app-my-blogs',
  template: `
    <div class="my-blogs-container">
      <div class="header">
        <h1>Yazılarım</h1>
        <button routerLink="/new-post">
          <i class="fas fa-plus"></i> Yeni Yazı
        </button>
      </div>

      <div class="blog-grid">
        <article *ngFor="let blog of blogs" class="blog-card">
          <img [src]="blog.image" [alt]="blog.title">
          <div class="content">
            <h2>{{blog.title}}</h2>
            <p>{{blog.content | slice:0:150}}...</p>
            <div class="meta">
              <span class="date">{{blog.created_at | date}}</span>
              <span class="views">{{blog.views_count}} görüntülenme</span>
              <span class="category">{{blog.categories?.name}}</span>
            </div>
            <div class="actions">
              <button (click)="editBlog(blog.id)">Düzenle</button>
              <button (click)="deleteBlog(blog.id)" class="delete">Sil</button>
            </div>
          </div>
        </article>
      </div>
    </div>
  `,
  styles: [`
    .my-blogs-container {
      max-width: 1200px;
      margin: 0 auto;
      padding: 2rem;
    }

    .header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 2rem;

      button {
        background: #ff1a75;
        color: white;
        border: none;
        padding: 0.8rem 1.5rem;
        border-radius: 8px;
        cursor: pointer;
      }
    }

    .blog-card {
      display: grid;
      grid-template-columns: 300px 1fr;
      gap: 2rem;
      background: white;
      border-radius: 12px;
      overflow: hidden;
      margin-bottom: 2rem;

      img {
        width: 100%;
        height: 200px;
        object-fit: cover;
      }

      .content {
        padding: 1.5rem;

        .meta {
          display: flex;
          gap: 1rem;
          color: #666;
          margin: 1rem 0;
        }

        .actions {
          display: flex;
          gap: 1rem;

          button {
            padding: 0.5rem 1rem;
            border: none;
            border-radius: 4px;
            cursor: pointer;

            &.delete {
              background: #ff4444;
              color: white;
            }
          }
        }
      }
    }
  `]
})
export class MyBlogsComponent implements OnInit {
  blogs: Blog[] = [];

  constructor(
    private blogService: BlogService,
    private auth: AuthService,
    private router: Router
  ) {}

  async ngOnInit() {
    const user = await this.auth.getCurrentUser();
    if (user) {
      const { data } = await this.blogService.getMyBlogs(user.id);
      if (data) this.blogs = data;
    }
  }

  editBlog(id: string) {
    this.router.navigate(['/edit-blog', id]);
  }

  async deleteBlog(id: string) {
    if (confirm('Bu yazıyı silmek istediğinizden emin misiniz?')) {
      await this.blogService.deleteBlog(id);
      this.blogs = this.blogs.filter(blog => blog.id !== id);
    }
  }
} 