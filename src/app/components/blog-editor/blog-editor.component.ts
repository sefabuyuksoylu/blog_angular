import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { BlogService } from '../../services/blog.service';
import { AuthService } from '../../services/auth.service';
import { Category } from '../../models/blog.model';
import { ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-blog-editor',
  template: `
    <div class="editor-container">
      <h1>{{ isEditing ? 'Blog Yazısını Düzenle' : 'Yeni Blog Yazısı' }}</h1>
      
      <form [formGroup]="blogForm" (ngSubmit)="onSubmit()">
        <div class="form-group">
          <label>Başlık</label>
          <input type="text" formControlName="title" placeholder="Blog başlığı">
          <div class="error" *ngIf="blogForm.get('title')?.touched && blogForm.get('title')?.invalid">
            Başlık gereklidir
          </div>
        </div>

        <div class="form-group">
          <label>Kategori</label>
          <select formControlName="category_id">
            <option value="">Kategori seçin</option>
            <option *ngFor="let cat of categories" [value]="cat.id">
              {{cat.name}}
            </option>
          </select>
          <div class="error" *ngIf="blogForm.get('category_id')?.touched && blogForm.get('category_id')?.invalid">
            Kategori seçimi gereklidir
          </div>
        </div>

        <div class="form-group">
          <label>Kapak Görseli</label>
          <input type="file" (change)="onFileSelected($event)" accept="image/*">
          <div class="preview" *ngIf="selectedImage">
            <img [src]="imagePreview" alt="Preview">
          </div>
        </div>

        <div class="form-group">
          <label>İçerik</label>
          <textarea formControlName="content" rows="10" placeholder="Blog içeriği"></textarea>
          <div class="error" *ngIf="blogForm.get('content')?.touched && blogForm.get('content')?.invalid">
            İçerik gereklidir
          </div>
        </div>

        <div class="actions">
          <button type="button" (click)="preview()" class="preview-btn">Önizle</button>
          <button type="submit" [disabled]="blogForm.invalid || isLoading">
            {{ isLoading ? 'Kaydediliyor...' : (isEditing ? 'Güncelle' : 'Yayınla') }}
          </button>
        </div>
      </form>

      <!-- Önizleme Modal -->
      <div class="preview-modal" *ngIf="showPreview">
        <div class="preview-content">
          <h2>{{blogForm.get('title')?.value}}</h2>
          <img [src]="imagePreview" *ngIf="imagePreview">
          <div class="blog-content">{{blogForm.get('content')?.value}}</div>
          <button (click)="showPreview = false">Kapat</button>
        </div>
      </div>

      <div class="success-message" *ngIf="successMessage">{{successMessage}}</div>
      <div class="error-message" *ngIf="errorMessage">{{errorMessage}}</div>
    </div>
  `,
  styleUrls: ['./blog-editor.component.scss'],
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule]
})
export class BlogEditorComponent implements OnInit {
  blogForm: FormGroup;
  categories: Category[] = [];
  isLoading = false;
  showPreview = false;
  selectedImage: File | null = null;
  imagePreview: string | ArrayBuffer | null = null;
  isEditing = false;
  successMessage: string = '';
  errorMessage: string = '';

  constructor(
    private fb: FormBuilder,
    private blogService: BlogService,
    private router: Router,
    private auth: AuthService
  ) {
    this.blogForm = this.fb.group({
      title: ['', Validators.required],
      content: ['', Validators.required],
      category_id: ['', Validators.required],
      image: ['']
    });
  }

  async ngOnInit() {
    try {
      const { data } = await this.blogService.getCategories();
      if (data) {
        this.categories = data;
      }
    } catch (error) {
      console.error('Kategoriler yüklenirken hata:', error);
    }
  }

  async onSubmit() {
    if (this.blogForm.valid) {
      try {
        this.isLoading = true;
        const user = await this.auth.getCurrentUser();
        if (!user) {
          throw new Error('Kullanıcı girişi gerekli');
        }

        const blogData = {
          ...this.blogForm.value,
          author_id: user.id
        };

        if (this.selectedImage) {
          await this.blogService.createBlog(blogData, this.selectedImage);
        } else {
          await this.blogService.createBlog(blogData);
        }

        this.router.navigate(['/my-posts']);
      } catch (error) {
        console.error('Blog yayınlama hatası:', error);
      } finally {
        this.isLoading = false;
      }
    }
  }

  onFileSelected(event: Event) {
    const target = event.target as HTMLInputElement;
    if (target.files) {
      const file = target.files[0];
      this.selectedImage = file;
      this.imagePreview = URL.createObjectURL(file);
    }
  }

  preview() {
    this.showPreview = true;
  }
} 