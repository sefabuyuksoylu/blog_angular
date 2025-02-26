import { Component, OnInit } from '@angular/core';
import { BlogService } from '../../services/blog.service';
import { Blog, Category } from '../../models/blog.model';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-blog-list',
  templateUrl: './blog-list.component.html',
  styleUrls: ['./blog-list.component.scss'],
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule]
})
export class BlogListComponent implements OnInit {
  blogs: Blog[] = [];
  categories: Category[] = [];
  selectedCategory: string = '';
  sortBy: 'newest' | 'popular' = 'newest';

  constructor(
    private blogService: BlogService,
    private router: Router
  ) {}

  async ngOnInit() {
    await this.loadBlogs();
    await this.loadCategories();
  }

  async loadBlogs() {
    const data = await this.blogService.getBlogs();
    this.blogs = data || [];
  }

  async loadCategories() {
    const { data } = await this.blogService.getCategories();
    this.categories = data || [];
  }

  async filterByCategory() {
    if (this.selectedCategory) {
      const { data } = await this.blogService.getBlogsByCategory(this.selectedCategory);
      this.blogs = data || [];
    } else {
      await this.loadBlogs();
    }
    this.sortBlogs();
  }

  sortBlogs() {
    if (this.sortBy === 'popular') {
      this.blogs.sort((a, b) => (b.views_count || 0) - (a.views_count || 0));
    } else {
      this.blogs.sort((a, b) => 
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      );
    }
  }

  readBlog(id: string) {
    this.router.navigate(['/blog', id]);
  }
} 