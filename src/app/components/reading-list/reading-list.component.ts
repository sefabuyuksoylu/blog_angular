import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { BlogService } from '../../services/blog.service';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-reading-list',
  template: `
    <div class="reading-history">
      <h2>Okuma Geçmişim</h2>
      <div class="blog-grid">
        <div *ngFor="let item of readingHistory" class="history-card">
          <img [src]="item.blogs.image" [alt]="item.blogs.title">
          <div class="content">
            <span class="date">{{item.read_at | date}}</span>
            <h3>{{item.blogs.title}}</h3>
            <p>{{item.blogs.content | slice:0:150}}...</p>
            <button (click)="readAgain(item.blog_id)">Tekrar Oku</button>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .reading-history {
      padding: 2rem;
    }

    h2 {
      margin-bottom: 2rem;
      color: #333;
    }

    .blog-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
      gap: 2rem;
    }

    .history-card {
      background: white;
      border-radius: 12px;
      overflow: hidden;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);

      img {
        width: 100%;
        height: 200px;
        object-fit: cover;
      }

      .content {
        padding: 1.5rem;

        .date {
          color: #666;
          font-size: 0.9rem;
          display: block;
          margin-bottom: 0.5rem;
        }

        h3 {
          margin-bottom: 1rem;
          color: #333;
        }

        p {
          color: #666;
          margin-bottom: 1rem;
        }

        button {
          width: 100%;
          padding: 0.8rem;
          background: #ff1a75;
          color: white;
          border: none;
          border-radius: 8px;
          cursor: pointer;

          &:hover {
            background: darken(#ff1a75, 10%);
          }
        }
      }
    }
  `]
})
export class ReadingListComponent implements OnInit {
  readingHistory: any[] = [];

  constructor(
    private blogService: BlogService,
    private auth: AuthService,
    private router: Router
  ) {}

  async ngOnInit() {
    const user = await this.auth.getCurrentUser();
    if (user) {
      const { data } = await this.blogService.getUserReadPosts(user.id);
      this.readingHistory = data || [];
    }
  }

  readAgain(blogId: string) {
    this.router.navigate(['/blog', blogId]);
  }
} 