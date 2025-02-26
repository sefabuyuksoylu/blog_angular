import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { BlogService } from '../../services/blog.service';
import { AuthService } from '../../services/auth.service';
import { Blog } from '../../models/blog.model';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-my-blogs',
  template: `
    <div class="my-blogs-container">
      <div class="header">
        <h1>Yazılarım</h1>
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
      margin-bottom: 2rem;

      h1 {
        font-size: 2rem;
        color: #333;
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
            background: #e2e2e2;
            color: #4a4a4a;
            border: none;
            border-radius: 4px;
            cursor: pointer;

            &:hover {
              background: #d1d1d1;
            }

            &.delete {
              background: #e2e2e2;
            }
          }
        }
      }
    }
  `],
  standalone: true,
  imports: [CommonModule, RouterModule]
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