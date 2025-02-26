import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { BlogService } from '../../services/blog.service';
import { AuthService } from '../../services/auth.service';
import { Category } from '../../models/blog.model';

@Component({
  selector: 'app-blog-editor',
  template: `
    <div class="editor-container">
      <h1>Yeni Blog Yazısı</h1>
      <form [formGroup]="blogForm" (ngSubmit)="onSubmit()">
        <div class="form-group">
          <label>Başlık</label>
          <input type="text" formControlName="title" placeholder="Blog başlığı">
        </div>

        <div class="form-group">
          <label>Kategori</label>
          <select formControlName="category_id">
            <option value="">Kategori seçin</option>
            <option *ngFor="let cat of categories" [value]="cat.id">
              {{cat.name}}
            </option>
          </select>
        </div>

        <div class="form-group">
          <label>Görsel URL</label>
          <input type="text" formControlName="image" placeholder="Blog görseli için URL">
        </div>

        <div class="form-group">
          <label>İçerik</label>
          <textarea formControlName="content" rows="10" placeholder="Blog içeriği"></textarea>
        </div>

        <button type="submit" [disabled]="blogForm.invalid || isLoading">
          {{ isLoading ? 'Yayınlanıyor...' : 'Yayınla' }}
        </button>
      </form>
    </div>
  `,
  styleUrls: ['./blog-editor.component.scss']
})
export class BlogEditorComponent implements OnInit {
  blogForm: FormGroup;
  categories: Category[] = [];
  isLoading: boolean = false;

  constructor(
    private fb: FormBuilder,
    private blogService: BlogService,
    private router: Router,
    private auth: AuthService
  ) {
    this.blogForm = this.fb.group({
      title: ['', Validators.required],
      content: ['', Validators.required],
      image: ['', Validators.required],
      category_id: ['', Validators.required]
    });
  }

  async ngOnInit() {
    const { data } = await this.blogService.getCategories();
    if (data) this.categories = data;
  }

  async onSubmit() {
    if (this.blogForm.valid) {
      const user = await this.auth.getCurrentUser();
      if (!user) return;

      const blog = {
        ...this.blogForm.value,
        author_id: user.id
      };

      this.isLoading = true;
      await this.blogService.createBlog(blog);
      this.router.navigate(['/my-posts']);
    }
  }
} 