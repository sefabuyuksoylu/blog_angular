import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { BlogService } from '../../services/blog.service';
import { AuthService } from '../../services/auth.service';
import { Category } from '../../models/blog.model';

@Component({
  selector: 'app-category-list',
  template: `
    <div class="category-list">
      <h1>Kategoriler</h1>
      
      <div class="categories">
        <div *ngFor="let category of categories" class="category-card">
          <h2>{{category.name}}</h2>
          <p>{{category.blog_count}} yazı</p>
          <button (click)="goToCategory(category.id)">Görüntüle</button>
        </div>
      </div>

      <button *ngIf="isAdmin" (click)="showAddForm = true" class="add-button">
        Yeni Kategori Ekle
      </button>

      <form *ngIf="showAddForm && isAdmin" (ngSubmit)="addCategory()" class="add-form">
        <input type="text" [(ngModel)]="newCategory.name" name="name" placeholder="Kategori Adı">
        <input type="text" [(ngModel)]="newCategory.slug" name="slug" placeholder="Slug">
        <button type="submit">Ekle</button>
      </form>
    </div>
  `,
  styles: [`
    .category-list {
      padding: 2rem;
    }

    h1 {
      margin-bottom: 2rem;
      color: #333;
      text-align: center;
    }

    .categories {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
      gap: 2rem;
    }

    .category-card {
      background: white;
      padding: 1.5rem;
      border-radius: 8px;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
      text-align: center;

      h2 {
        color: #333;
        margin-bottom: 0.5rem;
      }

      p {
        color: #666;
        margin-bottom: 1rem;
      }

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

    .add-button {
      margin: 2rem auto;
      display: block;
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

    .add-form {
      max-width: 400px;
      margin: 2rem auto;
      padding: 1.5rem;
      background: white;
      border-radius: 8px;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);

      input {
        width: 100%;
        padding: 0.8rem;
        margin-bottom: 1rem;
        border: 1px solid #ddd;
        border-radius: 4px;
      }

      button {
        width: 100%;
        background: #ff1a75;
        color: white;
        border: none;
        padding: 0.8rem;
        border-radius: 4px;
        cursor: pointer;

        &:hover {
          background: darken(#ff1a75, 10%);
        }
      }
    }
  `]
})
export class CategoryListComponent implements OnInit {
  categories: Category[] = [];
  isAdmin = false;
  showAddForm = false;
  newCategory: Partial<Category> = {};

  constructor(
    private blogService: BlogService,
    private auth: AuthService,
    private router: Router
  ) {}

  async ngOnInit() {
    this.isAdmin = await this.auth.isAdmin();
    const { data } = await this.blogService.getCategories();
    if (data) this.categories = data;
  }

  async addCategory() {
    if (this.newCategory.name && this.newCategory.slug) {
      await this.blogService.createCategory(this.newCategory);
      this.showAddForm = false;
      this.newCategory = {};
      const { data } = await this.blogService.getCategories();
      if (data) this.categories = data;
    }
  }

  goToCategory(id: string) {
    this.router.navigate(['/category', id]);
  }
} 