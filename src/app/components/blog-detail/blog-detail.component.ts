import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { BlogService } from '../../services/blog.service';
import { AuthService } from '../../services/auth.service';
import { Blog } from '../../models/blog.model';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-blog-detail',
  template: `
    <div class="blog-container" *ngIf="blog">
      <!-- Hero Section -->
      <div class="hero-section" [style.backgroundImage]="'url(' + blog.image + ')'">
        <div class="hero-overlay">
          <div class="hero-content">
            <div class="category-badge">{{blog.categories?.name}}</div>
            <h1>{{blog.title}}</h1>
            <div class="meta-info">
              <div class="author">
                <img [src]="blog.profiles?.avatar_url" [alt]="blog.profiles?.full_name" class="author-avatar">
                <div class="author-details">
                  <span class="author-name">{{blog.profiles?.full_name}}</span>
                  <span class="post-date">{{blog.created_at | date:'longDate'}}</span>
                </div>
              </div>
              <div class="post-stats">
                <span class="stat">
                  <i class="far fa-eye"></i>
                  {{blog.views_count}} okuma
                </span>
                <span class="stat">
                  <i class="far fa-clock"></i>
                  {{getReadingTime()}} dk okuma süresi
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Content Section -->
      <div class="content-section">
        <div class="content-wrapper">
          <article class="blog-content" [innerHTML]="blog.content"></article>

          <!-- Share Section -->
          <div class="share-section">
            <h3>Bu içeriği paylaş</h3>
            <div class="share-buttons">
              <button class="share-button twitter">
                <i class="fab fa-twitter"></i>
              </button>
              <button class="share-button facebook">
                <i class="fab fa-facebook-f"></i>
              </button>
              <button class="share-button linkedin">
                <i class="fab fa-linkedin-in"></i>
              </button>
              <button class="share-button copy" (click)="copyLink()">
                <i class="far fa-copy"></i>
              </button>
            </div>
          </div>

          <!-- Author Section -->
          <div class="author-section">
            <img [src]="blog.profiles?.avatar_url" [alt]="blog.profiles?.full_name" class="author-large-avatar">
            <div class="author-info">
              <div class="author-header">
                <h3>{{blog.profiles?.full_name}}</h3>
                <div class="author-social">
                  <a href="#" class="social-link"><i class="fab fa-twitter"></i></a>
                  <a href="#" class="social-link"><i class="fab fa-github"></i></a>
                  <a href="#" class="social-link"><i class="fab fa-linkedin-in"></i></a>
                </div>
              </div>
              <p class="author-bio">Yazılım geliştirici ve teknoloji tutkunu. Web teknolojileri, mobil uygulama geliştirme ve yapay zeka konularında içerik üretiyor.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .blog-container {
      background: #fff;
      min-height: 100vh;
    }

    .hero-section {
      height: 70vh;
      min-height: 600px;
      background-size: cover;
      background-position: center;
      position: relative;
    }

    .hero-overlay {
      position: absolute;
      inset: 0;
      background: linear-gradient(to bottom, rgba(0,0,0,0.2), rgba(0,0,0,0.8));
      display: flex;
      align-items: flex-end;
    }

    .hero-content {
      max-width: 900px;
      margin: 0 auto;
      padding: 60px 24px;
      color: white;
      width: 100%;
    }

    .category-badge {
      display: inline-block;
      background: #2563eb;
      color: white;
      padding: 6px 12px;
      border-radius: 20px;
      font-size: 0.9rem;
      margin-bottom: 1.5rem;
      font-weight: 500;
    }

    h1 {
      font-size: 3.5rem;
      margin-bottom: 2rem;
      line-height: 1.2;
      font-weight: 700;
      letter-spacing: -0.02em;
    }

    .meta-info {
      display: flex;
      justify-content: space-between;
      align-items: center;
      gap: 2rem;
    }

    .author {
      display: flex;
      align-items: center;
      gap: 1rem;
    }

    .author-avatar {
      width: 48px;
      height: 48px;
      border-radius: 50%;
      object-fit: cover;
      border: 2px solid white;
    }

    .author-details {
      display: flex;
      flex-direction: column;
      gap: 0.25rem;
    }

    .author-name {
      font-weight: 600;
    }

    .post-date {
      font-size: 0.9rem;
      opacity: 0.9;
    }

    .post-stats {
      display: flex;
      gap: 1.5rem;
      font-size: 0.95rem;
    }

    .stat {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      
      i {
        font-size: 1.1rem;
      }
    }

    .content-section {
      max-width: 900px;
      margin: 0 auto;
      padding: 4rem 24px;
    }

    .blog-content {
      font-size: 1.25rem;
      line-height: 1.8;
      color: #1f2937;
      margin-bottom: 3rem;
    }

    .share-section {
      border-top: 1px solid #e5e7eb;
      padding-top: 2rem;
      margin-bottom: 3rem;

      h3 {
        font-size: 1.25rem;
        margin-bottom: 1.5rem;
        color: #1f2937;
      }
    }

    .share-buttons {
      display: flex;
      gap: 1rem;
    }

    .share-button {
      width: 40px;
      height: 40px;
      border: none;
      border-radius: 50%;
      color: white;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 1.1rem;
      transition: transform 0.2s;

      &:hover {
        transform: translateY(-2px);
      }

      &.twitter { background: #1DA1F2; }
      &.facebook { background: #4267B2; }
      &.linkedin { background: #0077b5; }
      &.copy { 
        background: #6B7280;
        &:active {
          transform: scale(0.95);
        }
      }
    }

    .author-section {
      background: #f8fafc;
      border-radius: 16px;
      padding: 2rem;
      display: flex;
      gap: 2rem;
      margin-bottom: 4rem;
    }

    .author-large-avatar {
      width: 120px;
      height: 120px;
      border-radius: 50%;
      object-fit: cover;
    }

    .author-info {
      flex: 1;

      .author-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 1rem;

        h3 {
          font-size: 1.5rem;
          color: #1f2937;
          margin: 0;
        }
      }
    }

    .author-social {
      display: flex;
      gap: 1rem;

      .social-link {
        color: #4b5563;
        font-size: 1.2rem;
        transition: color 0.2s;

        &:hover {
          color: #1f2937;
        }
      }
    }

    .author-bio {
      color: #4b5563;
      line-height: 1.6;
      margin: 0;
    }

    @media (max-width: 768px) {
      .hero-section {
        height: auto;
        min-height: 500px;
      }

      h1 {
        font-size: 2.5rem;
      }

      .meta-info {
        flex-direction: column;
        align-items: flex-start;
      }

      .author-section {
        flex-direction: column;
        text-align: center;

        .author-header {
          flex-direction: column;
          gap: 1rem;
        }
      }

      .content-section {
        padding: 2rem 20px;
      }
    }
  `],
  standalone: true,
  imports: [CommonModule]
})
export class BlogDetailComponent implements OnInit {
  blog?: Blog;
  isLoading = false;

  constructor(
    private route: ActivatedRoute,
    private blogService: BlogService,
    private auth: AuthService
  ) {}

  async ngOnInit() {
    this.isLoading = true;
    try {
      const id = this.route.snapshot.paramMap.get('id');
      if (id) {
        // Blog detayını al
        const blog = await this.blogService.getBlogById(id);
        this.blog = blog;

        // Görüntülenme sayısını artır
        await this.blogService.incrementViews(id);

        // Okuma geçmişine ekle
        const user = await this.auth.getCurrentUser();
        if (user) {
          const { error } = await this.blogService.addToReadingHistory(user.id, id);
          if (error) {
            console.error('Okuma geçmişi eklenirken hata:', error);
          }
        }
      }
    } catch (error) {
      console.error('Blog detay hatası:', error);
    } finally {
      this.isLoading = false;
    }
  }

  getReadingTime(): number {
    if (!this.blog?.content) return 0;
    const wordsPerMinute = 200;
    const words = this.blog.content.trim().split(/\s+/).length;
    return Math.ceil(words / wordsPerMinute);
  }

  copyLink() {
    const url = window.location.href;
    navigator.clipboard.writeText(url);
    // TODO: Kullanıcıya kopyalandı bildirimi göster
  }
} 