import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { BlogService } from '../../services/blog.service';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-reading-list',
  template: `
    <div class="reading-list">
      <h1>Okuma Listem</h1>
      <div class="blog-grid">
        <article *ngFor="let blog of readBlogs" class="blog-card">
          <img [src]="blog.image" [alt]="blog.title">
          <div class="content">
            <h2>{{blog.title}}</h2>
            <p>{{blog.content | slice:0:150}}...</p>
            <div class="meta">
              <span>{{blog.read_at | date}}</span>
              <button (click)="readBlog(blog.id)">Tekrar Oku</button>
            </div>
          </div>
        </article>
      </div>
    </div>
  `,
  styles: [`
    .reading-list {
      padding: 2rem;
    }

    h1 {
      margin-bottom: 2rem;
      color: #333;
      text-align: center;
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
          margin-bottom: 1rem;
          color: #333;
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
  `]
})
export class ReadingListComponent implements OnInit {
  readBlogs: any[] = [];

  constructor(
    private blogService: BlogService,
    private auth: AuthService,
    private router: Router
  ) {}

  async ngOnInit() {
    const user = await this.auth.getCurrentUser();
    if (user) {
      const { data } = await this.blogService.getUserReadPosts(user.id);
      if (data) this.readBlogs = data;
    }
  }

  readBlog(id: string) {
    this.router.navigate(['/blog', id]);
  }
} 