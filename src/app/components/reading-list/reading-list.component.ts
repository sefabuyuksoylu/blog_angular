import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { BlogService } from '../../services/blog.service';
import { AuthService } from '../../services/auth.service';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-reading-list',
  template: `
    <div class="reading-history">
      <header>
        <h1>Okuma Geçmişim</h1>
        <p *ngIf="readingHistory.length > 0">{{readingHistory.length}} yazı okudunuz</p>
      </header>

      <div *ngIf="isLoading" class="loading">
        <p>Yükleniyor...</p>
      </div>

      <div *ngIf="errorMessage" class="error-alert">
        {{errorMessage}}
      </div>

      <div *ngIf="!isLoading && readingHistory.length === 0" class="empty-state">
        <i class="far fa-book-open"></i>
        <h2>Henüz hiç blog okumamışsınız</h2>
        <p>Blogları okudukça burada listelenecektir</p>
        <button routerLink="/">Bloglara Göz At</button>
      </div>

      <div class="blog-grid" *ngIf="!isLoading && readingHistory.length > 0">
        <div *ngFor="let item of readingHistory" class="history-card">
          <div class="card-image" [style.backgroundImage]="'url(' + item.blogs?.image + ')'">
            <span class="date">{{item.read_at | date:'dd MMM yyyy'}}</span>
          </div>
          <div class="content">
            <div class="category-badge" *ngIf="item.blogs?.categories">
              {{item.blogs.categories.name}}
            </div>
            <h3>{{item.blogs?.title}}</h3>
            <p>{{item.blogs?.content | slice:0:150}}...</p>
            <div class="card-footer">
              <div class="author" *ngIf="item.blogs?.profiles">
                <img [src]="item.blogs.profiles.avatar_url" [alt]="item.blogs.profiles.full_name" class="author-avatar">
                <span>{{item.blogs.profiles.full_name}}</span>
              </div>
              <button (click)="readAgain(item.blog_id)">Tekrar Oku</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .reading-history {
      max-width: 1200px;
      margin: 0 auto;
      padding: 2rem;
    }

    header {
      text-align: center;
      margin-bottom: 3rem;

      h1 {
        font-size: 2.5rem;
        color: #333;
        margin-bottom: 0.5rem;
      }

      p {
        color: #666;
      }
    }

    .loading {
      text-align: center;
      padding: 3rem;
      color: #666;
    }

    .empty-state {
      text-align: center;
      padding: 4rem 2rem;
      background: white;
      border-radius: 12px;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);

      i {
        font-size: 3rem;
        color: #ccc;
        margin-bottom: 1rem;
      }

      h2 {
        color: #333;
        margin-bottom: 1rem;
      }

      p {
        color: #666;
        margin-bottom: 2rem;
      }

      button {
        padding: 0.8rem 2rem;
        background: #e2e2e2;
        color: #4a4a4a;
        border: none;
        border-radius: 8px;
        cursor: pointer;
        font-size: 1rem;

        &:hover {
          background: #d1d1d1;
        }
      }
    }

    .blog-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
      gap: 2rem;
    }

    .history-card {
      background: white;
      border-radius: 12px;
      overflow: hidden;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
      transition: transform 0.2s;

      &:hover {
        transform: translateY(-4px);
      }

      .card-image {
        height: 200px;
        background-size: cover;
        background-position: center;
        position: relative;

        .date {
          position: absolute;
          top: 1rem;
          right: 1rem;
          background: rgba(0,0,0,0.7);
          color: white;
          padding: 0.4rem 0.8rem;
          border-radius: 20px;
          font-size: 0.85rem;
          backdrop-filter: blur(4px);
        }
      }

      .content {
        padding: 1.5rem;

        .category-badge {
          display: inline-block;
          background: #e2e2e2;
          color: #4a4a4a;
          padding: 0.3rem 0.8rem;
          border-radius: 20px;
          font-size: 0.85rem;
          margin-bottom: 1rem;
        }

        h3 {
          font-size: 1.25rem;
          color: #333;
          margin-bottom: 1rem;
          line-height: 1.4;
        }

        p {
          color: #666;
          line-height: 1.6;
          margin-bottom: 1.5rem;
        }

        .card-footer {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding-top: 1rem;
          border-top: 1px solid #eee;

          .author {
            display: flex;
            align-items: center;
            gap: 0.5rem;

            .author-avatar {
              width: 30px;
              height: 30px;
              border-radius: 50%;
              object-fit: cover;
            }

            span {
              color: #666;
              font-size: 0.9rem;
            }
          }

          button {
            padding: 0.5rem 1rem;
            background: #e2e2e2;
            color: #4a4a4a;
            border: none;
            border-radius: 6px;
            cursor: pointer;
            font-size: 0.9rem;

            &:hover {
              background: #d1d1d1;
            }
          }
        }
      }
    }

    @media (max-width: 768px) {
      .blog-grid {
        grid-template-columns: 1fr;
      }

      header h1 {
        font-size: 2rem;
      }
    }

    .error-alert {
      background-color: #fee2e2;
      color: #dc2626;
      padding: 1rem;
      border-radius: 8px;
      margin: 1rem;
      text-align: center;
    }
  `],
  standalone: true,
  imports: [CommonModule, RouterModule]
})
export class ReadingListComponent implements OnInit {
  readingHistory: any[] = [];
  isLoading = true;
  errorMessage = '';

  constructor(
    private blogService: BlogService, 
    private authService: AuthService, 
    private router: Router
  ) {}

  async ngOnInit() {
    this.isLoading = true;
    this.errorMessage = '';

    try {
      const user = await this.authService.getCurrentUser();
      console.log('Mevcut kullanıcı:', user);

      if (user) {
        console.log('Okuma geçmişi getiriliyor...');
        const { data, error } = await this.blogService.getUserReadPosts(user.id);
        console.log('Okuma geçmişi verileri:', data);

        if (error) {
          console.error('Okuma geçmişi hatası:', error);
          this.errorMessage = 'Okuma geçmişi yüklenirken bir hata oluştu';
        } else if (!data || data.length === 0) {
          console.log('Okuma geçmişi boş');
          this.readingHistory = [];
        } else {
          this.readingHistory = data;
          console.log('Okuma geçmişi yüklendi:', this.readingHistory);
        }
      } else {
        this.errorMessage = 'Oturum açmanız gerekiyor';
        this.router.navigate(['/login']);
      }
    } catch (error) {
      console.error('Okuma geçmişi yüklenirken hata:', error);
      this.errorMessage = 'Beklenmeyen bir hata oluştu';
    } finally {
      this.isLoading = false;
    }
  }

  readAgain(blogId: string) {
    this.router.navigate(['/blog', blogId]);
  }
}