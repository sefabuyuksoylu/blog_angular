import { Injectable } from '@angular/core';
import { SupabaseService } from './supabase.service';
import { Blog, Category } from '../models/blog.model';
import { Observable, from } from 'rxjs';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class BlogService {
  constructor(private supabase: SupabaseService) {}

  async createBlog(blog: Partial<Blog>) {
    const { data, error } = await this.supabase.client
      .from('blogs')
      .insert(blog)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async getBlogs() {
    try {
      console.log('Blog verileri yükleniyor...');
      const { data, error } = await this.supabase.client
        .from('blogs')
        .select(`
          *,
          categories (*),
          profiles:author_id (*)
        `)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Supabase hatası:', error);
        throw error;
      }

      console.log('Yüklenen blog verileri:', data);
      return data;
    } catch (error) {
      console.error('Blog yükleme hatası:', error);
      throw error;
    }
  }

  async getBlogsByCategory(categoryId: string) {
    const { data, error } = await this.supabase.client
      .from('blogs')
      .select(`
        *,
        categories (*),
        profiles:author_id (*)
      `)
      .eq('category_id', categoryId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return { data };
  }

  async incrementViews(blogId: string) {
    const { error } = await this.supabase.client
      .rpc('increment_blog_views', { blog_id: blogId });
    
    if (error) throw error;
  }

  async addToReadingHistory(userId: string, blogId: string) {
    const { error } = await this.supabase.client
      .from('reading_history')
      .upsert({
        user_id: userId,
        blog_id: blogId,
        read_at: new Date().toISOString()
      });

    if (error) throw error;
  }

  async getCategories() {
    return await this.supabase.client
      .from('categories')
      .select('*')
      .order('name');
  }

  async createCategory(category: Partial<Category>) {
    const { data: userRole } = await this.supabase.client
      .from('profiles')
      .select('role')
      .eq('id', category.id)
      .single();

    if (!userRole) {
      throw new Error('User not found');
    }

    if (userRole.role === 'admin') {
      return await this.supabase.client
        .from('categories')
        .insert(category)
        .single();
    } else {
      throw new Error('Only admins can create categories');
    }
  }

  async getBlogById(id: string) {
    const { data, error } = await this.supabase.client
      .from('blogs')
      .select(`
        *,
        categories (*),
        profiles:author_id (*)
      `)
      .eq('id', id)
      .single();

    if (error) throw error;
    return data;
  }

  async getCategory(id: string) {
    return await this.supabase.client
      .from('categories')
      .select(`
        *,
        blogs:blogs (count)
      `)
      .eq('id', id)
      .single();
  }

  async getMyBlogs(userId: string) {
    return await this.supabase.client
      .from('blogs')
      .select(`
        *,
        categories (*),
        profiles:author_id (*)
      `)
      .eq('author_id', userId)
      .order('created_at', { ascending: false });
  }

  async getUserReadPosts(userId: string) {
    return await this.supabase.client
      .from('reading_history')
      .select(`
        blog_id,
        read_at,
        blogs:blog_id (
          id,
          title,
          content,
          image,
          views_count,
          created_at,
          author:author_id (*)
        )
      `)
      .eq('user_id', userId)
      .order('read_at', { ascending: false });
  }

  async deleteBlog(id: string) {
    return await this.supabase.client
      .from('blogs')
      .delete()
      .eq('id', id);
  }
} 