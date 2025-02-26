import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { BlogService } from '../../services/blog.service';
import { AuthService } from '../../services/auth.service';
import { Category } from '../../models/blog.model';
import { FormGroup, FormBuilder } from '@angular/forms';
import { Validators } from '@angular/forms';

@Component({
  selector: 'app-category-list',
  template: `
    <div class="category-container">
      <header>
        <h1>Kategoriler</h1>
        <button *ngIf="isAdmin" (click)="showAddForm = true" class="add-btn">
          <i class="fas fa-plus"></i> Yeni Kategori
        </button>
      </header>

      <!-- Kategori Ekleme Formu -->
      <form *ngIf="showAddForm && isAdmin" [formGroup]="categoryForm" (ngSubmit)="addCategory()" class="category-form">
        <div class="form-group">
          <input type="text" formControlName="name" placeholder="Kategori Adı">
          <input type="text" formControlName="slug" placeholder="Slug">
          <button type="submit" [disabled]="categoryForm.invalid || isLoading">
            {{ isLoading ? 'Ekleniyor...' : 'Ekle' }}
          </button>
          <button type="button" (click)="showAddForm = false">İptal</button>
        </div>
      </form>

      <!-- Kategori Listesi -->
      <div class="category-grid">
        <div *ngFor="let category of categories" class="category-card">
          <div class="card-content">
            <h2>{{category.name}}</h2>
            <p>{{category.blog_count || 0}} yazı</p>
          </div>
          <div class="card-actions">
            <button (click)="viewCategory(category.id)">Yazıları Gör</button>
            <div *ngIf="isAdmin" class="admin-actions">
              <button (click)="editCategory(category)">Düzenle</button>
              <button (click)="deleteCategory(category.id)" class="delete">Sil</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .category-container {
      max-width: 1200px;
      margin: 0 auto;
      padding: 2rem;

      header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 2rem;

        h1 {
          font-size: 2rem;
          color: #333;
        }

        .add-btn {
          background: #ff1a75;
          color: white;
          border: none;
          padding: 0.8rem 1.5rem;
          border-radius: 8px;
          cursor: pointer;
        }
      }

      .category-form {
        background: white;
        padding: 1.5rem;
        border-radius: 12px;
        margin-bottom: 2rem;
        box-shadow: 0 2px 4px rgba(0,0,0,0.1);

        .form-group {
          display: flex;
          gap: 1rem;

          input {
            flex: 1;
            padding: 0.8rem;
            border: 1px solid #ddd;
            border-radius: 8px;
          }

          button {
            padding: 0.8rem 1.5rem;
            border: none;
            border-radius: 8px;
            cursor: pointer;

            &[type="submit"] {
              background: #ff1a75;
              color: white;
            }

            &[type="button"] {
              background: #f0f0f0;
            }
          }
        }
      }

      .category-grid {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
        gap: 2rem;
      }

      .category-card {
        background: white;
        border-radius: 12px;
        padding: 1.5rem;
        box-shadow: 0 2px 4px rgba(0,0,0,0.1);

        h2 {
          color: #333;
          margin-bottom: 0.5rem;
        }

        p {
          color: #666;
          margin-bottom: 1rem;
        }

        .card-actions {
          display: flex;
          gap: 1rem;

          button {
            flex: 1;
            padding: 0.8rem;
            border: none;
            border-radius: 8px;
            cursor: pointer;
            background: #ff1a75;
            color: white;

            &.delete {
              background: #ff4444;
            }
          }
        }
      }
    }
  `]
})
export class CategoryListComponent implements OnInit {
  categories: Category[] = [];
  isAdmin = false;
  showAddForm = false;
  isLoading = false;
  categoryForm: FormGroup;

  constructor(
    private blogService: BlogService,
    private auth: AuthService,
    private router: Router,
    private fb: FormBuilder
  ) {
    this.categoryForm = this.fb.group({
      name: ['', Validators.required],
      slug: ['', Validators.required]
    });
  }

  async ngOnInit() {
    this.isAdmin = await this.auth.isAdmin();
    await this.loadCategories();
  }

  async loadCategories() {
    const { data } = await this.blogService.getCategories();
    if (data) this.categories = data;
  }

  async addCategory() {
    if (this.categoryForm.valid) {
      try {
        this.isLoading = true;
        await this.blogService.createCategory(this.categoryForm.value);
        this.showAddForm = false;
        this.categoryForm.reset();
        await this.loadCategories();
      } catch (error) {
        console.error('Kategori ekleme hatası:', error);
        alert('Kategori eklenirken bir hata oluştu');
      } finally {
        this.isLoading = false;
      }
    }
  }

  viewCategory(id: string) {
    this.router.navigate(['/category', id]);
  }

  editCategory(category: Category) {
    // Düzenleme işlemi için modal veya form gösterilebilir
  }

  async deleteCategory(id: string) {
    if (confirm('Bu kategoriyi silmek istediğinizden emin misiniz?')) {
      try {
        await this.blogService.deleteCategory(id);
        await this.loadCategories();
      } catch (error) {
        console.error('Kategori silme hatası:', error);
        alert('Kategori silinirken bir hata oluştu');
      }
    }
  }
} 