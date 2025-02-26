import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { BlogService } from '../../services/blog.service';
import { Blog, Category } from '../../models/blog.model';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-category-blogs',
  template: `
    <div class="category-blogs">
      <header *ngIf="category">
        <h1>{{category.name}}</h1>
        <p>{{blogs.length}} yazı bulunuyor</p>
      </header>
      <div class="blog-grid">
        <article *ngFor="let blog of blogs" class="blog-card">
          <img [src]="blog.image" [alt]="blog.title">
          <div class="content">
            <h2>{{blog.title}}</h2>
            <p>{{blog.content | slice:0:150}}...</p>
            <button (click)="readBlog(blog.id)">Devamını Oku</button>
          </div>
        </article>
      </div>
    </div>
  `,
  styles: [`
    .category-blogs {
      padding: 2rem;
    }

    header {
      margin-bottom: 2rem;
      text-align: center;

      h1 {
        font-size: 2rem;
        color: #333;
        margin-bottom: 0.5rem;
      }

      p {
        color: #666;
      }
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

        button {
          background: #e2e2e2;
          color: #4a4a4a;
          border: none;
          padding: 0.5rem 1rem;
          border-radius: 20px;
          cursor: pointer;

          &:hover {
            background: #d1d1d1;
          }
        }
      }
    }
  `],
  standalone: true,
  imports: [CommonModule]
})
export class CategoryBlogsComponent implements OnInit {
  category: Category | null = null;
  blogs: Blog[] = [];

  constructor(
    private route: ActivatedRoute,
    private blogService: BlogService,
    private router: Router
  ) {}

  async ngOnInit() {
    const categoryId = this.route.snapshot.paramMap.get('id');
    if (categoryId) {
      const { data: categoryData } = await this.blogService.getCategory(categoryId);
      if (categoryData) {
        this.category = categoryData;
      }
      const { data: blogsData } = await this.blogService.getBlogsByCategory(categoryId);
      if (blogsData) {
        this.blogs = blogsData;
      }
    }
  }

  readBlog(id: string) {
    this.router.navigate(['/blog', id]);
  }
}
