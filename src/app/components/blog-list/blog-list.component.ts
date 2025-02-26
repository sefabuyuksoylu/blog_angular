import { Component, OnInit } from '@angular/core';
import { BlogService } from '../../services/blog.service';
import { Blog } from '../../models/blog.model';
import { Router } from '@angular/router';

@Component({
  selector: 'app-blog-list',
  template: `
    <div class="blog-list">
      <h1>Popular Posts</h1>
      <div class="blog-grid">
        <article *ngFor="let blog of blogs" class="blog-card">
          <img [src]="blog.image || 'https://via.placeholder.com/400x200'" [alt]="blog.title">
          <div class="content">
            <h2>{{blog.title}}</h2>
            <p>{{blog.content | slice:0:150}}...</p>
            <div class="meta">
              <span>{{blog.created_at | date}}</span>
              <button (click)="readBlog(blog.id)">Devamını Oku</button>
            </div>
          </div>
        </article>
      </div>
      <div *ngIf="blogs.length === 0" class="no-blogs">
        <p>Henüz blog yazısı bulunmuyor.</p>
      </div>
    </div>
  `,
  styles: [`
    .blog-list {
      padding: 2rem;
    }

    .blog-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
      gap: 2rem;
    }

    .blog-card {
      background: white;
      border-radius: 8px;
      overflow: hidden;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);

      img {
        width: 100%;
        height: 200px;
        object-fit: cover;
      }

      .content {
        padding: 1.5rem;

        h2 {
          color: #333;
          margin-bottom: 1rem;
        }

        p {
          color: #666;
          margin-bottom: 1rem;
        }

        .meta {
          display: flex;
          justify-content: space-between;
          align-items: center;
          color: #666;

          button {
            background: #ff1a75;
            color: white;
            border: none;
            padding: 0.5rem 1rem;
            border-radius: 20px;
            cursor: pointer;

            &:hover {
              background: darken(#ff1a75, 10%);
            }
          }
        }
      }
    }

    .no-blogs {
      text-align: center;
      padding: 3rem;
      color: #666;
    }
  `]
})
export class BlogListComponent implements OnInit {
  blogs: Blog[] = [];

  constructor(
    private blogService: BlogService,
    private router: Router
  ) {}

  async ngOnInit() {
    try {
      const blogs = await this.blogService.getBlogs();
      console.log('Yüklenen bloglar:', blogs);
      this.blogs = blogs || [];
    } catch (error) {
      console.error('Blog yükleme hatası:', error);
    }
  }

  readBlog(id: string) {
    this.router.navigate(['/blog', id]);
  }
} 