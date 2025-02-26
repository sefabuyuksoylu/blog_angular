import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { BlogService } from '../../services/blog.service';
import { AuthService } from '../../services/auth.service';
import { Blog } from '../../models/blog.model';

@Component({
  selector: 'app-blog-detail',
  template: `
    <div class="blog-detail-container" *ngIf="blog">
      <div class="hero">
        <img [src]="blog.image" [alt]="blog.title">
        <h1>{{blog.title}}</h1>
      </div>

      <div class="meta">
        <span class="author">{{blog.author?.email}}</span>
        <span class="date">{{blog.created_at | date}}</span>
        <span class="category">{{blog.categories?.name}}</span>
        <span class="views">{{blog.views_count}} görüntülenme</span>
      </div>

      <div class="content">
        {{blog.content}}
      </div>
    </div>
  `,
  styles: [`
    .blog-detail-container {
      max-width: 800px;
      margin: 0 auto;
      padding: 2rem;

      .hero {
        position: relative;
        margin-bottom: 2rem;

        img {
          width: 100%;
          height: 400px;
          object-fit: cover;
          border-radius: 12px;
        }

        h1 {
          font-size: 2.5rem;
          margin: 1rem 0;
          color: #333;
        }
      }

      .meta {
        display: flex;
        gap: 1.5rem;
        color: #666;
        margin-bottom: 2rem;
      }

      .content {
        line-height: 1.8;
        color: #333;
        font-size: 1.1rem;
      }
    }
  `]
})
export class BlogDetailComponent implements OnInit {
  blog?: Blog;

  constructor(
    private route: ActivatedRoute,
    private blogService: BlogService,
    private auth: AuthService
  ) {}

  async ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      const blog = await this.blogService.getBlogById(id);
      this.blog = blog;

      await this.blogService.incrementViews(id);
      
      const user = await this.auth.getCurrentUser();
      if (user) {
        await this.blogService.addToReadingHistory(user.id, id);
      }
    }
  }
} 