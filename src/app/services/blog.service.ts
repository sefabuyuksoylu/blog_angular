import { Injectable } from '@angular/core';
import { SupabaseService } from './supabase.service';
import { Blog, Category } from '../models/blog.model';
import { Observable, from } from 'rxjs';
import { environment } from '../../environments/environment';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root'
})
export class BlogService {
  constructor(
    private supabase: SupabaseService,
    private auth: AuthService
  ) {}

  async createBlog(blog: Partial<Blog>, image?: File) {
    try {
      let imageUrl = blog.image;

      if (image) {
        imageUrl = await this.uploadImage(image);
      }

      // Kullanıcı bilgilerini al
      const user = await this.auth.getCurrentUser();
      if (!user) throw new Error('Kullanıcı girişi gerekli');

      // Profil bilgilerini kontrol et
      const { data: profile } = await this.supabase.client
        .from('profiles')
        .select('avatar_url')
        .eq('id', user.id)
        .single();

      // Eğer profil resmi yoksa varsayılan avatar ekle
      if (!profile?.avatar_url) {
        const defaultAvatar = '/assets/images/varsayılanprofilresmi.png';

        await this.supabase.client
          .from('profiles')
          .update({ avatar_url: defaultAvatar })
          .eq('id', user.id);
      }

      const { data, error } = await this.supabase.client
        .from('blogs')
        .insert({
          ...blog,
          image: imageUrl,
          views_count: 0,
          created_at: new Date().toISOString(),
          author_id: user.id
        })
        .select()
        .single();

      if (error) throw error;

      // Blog sayısını güncelle
      if (blog.category_id) {
        await this.updateCategoryBlogCount(blog.category_id);
      }

      return data;
    } catch (error) {
      console.error('Blog oluşturma hatası:', error);
      throw error;
    }
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
    try {
      const { data, error } = await this.supabase.client
        .from('reading_history')
        .upsert({
          user_id: userId,
          blog_id: blogId,
          read_at: new Date().toISOString()
        }, {
          onConflict: 'user_id,blog_id'
        })
        .select()
        .single();

      if (error) {
        console.error('Okuma geçmişi ekleme hatası:', error);
        return { data: null, error };
      }

      // Blog görüntülenme sayısını artır
      await this.incrementViews(blogId);

      return { data, error: null };
    } catch (error) {
      console.error('Okuma geçmişi ekleme hatası:', error);
      return { data: null, error };
    }
  }

  async getCategories() {
    return await this.supabase.client
      .from('categories')
      .select('*')
      .order('name');
  }

  async createCategory(category: Partial<Category>) {
    try {
      console.log('Kategori ekleniyor:', category); // Debug için

      // Önce RLS politikalarını kontrol edelim
      const user = await this.supabase.client.auth.getUser();
      if (!user) {
        return { data: null, error: new Error('Oturum açmanız gerekiyor') };
      }

      // Kategori eklemeyi deneyelim
      const { data, error } = await this.supabase.client
        .from('categories')
        .insert({
          name: category.name,
          slug: category.slug,
          created_at: new Date().toISOString()
        })
        .select('*')
        .single();

      if (error) {
        // Supabase hata detaylarını yazdıralım
        console.error('Supabase detaylı hata:', {
          code: error.code,
          message: error.message,
          details: error.details,
          hint: error.hint
        });
        return { 
          data: null, 
          error: new Error(error.message || 'Kategori eklenirken bir hata oluştu') 
        };
      }

      console.log('Eklenen kategori:', data);
      return { data, error: null };
    } catch (error: any) {
      console.error('Kategori oluşturma hatası:', error);
      return { 
        data: null, 
        error: new Error(error?.message || 'Beklenmeyen bir hata oluştu') 
      };
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
    try {
      const { data, error } = await this.supabase.client
        .from('reading_history')
        .select(`
          *,
          blogs:blog_id (
            *,
            categories (*),
            profiles:author_id (*)
          )
        `)
        .eq('user_id', userId)
        .order('read_at', { ascending: false });

      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      console.error('Okuma geçmişi alma hatası:', error);
      return { data: null, error };
    }
  }

  async deleteBlog(id: string) {
    return await this.supabase.client
      .from('blogs')
      .delete()
      .eq('id', id);
  }

  async uploadImage(file: File): Promise<string> {
    try {
      // Dosya boyutunu kontrol et
      if (file.size > 5 * 1024 * 1024) { // 5MB limit
        throw new Error('Dosya boyutu 5MB\'dan küçük olmalıdır');
      }

      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}.${fileExt}`;

      // Resmi yükle
      const { error: uploadError } = await this.supabase.client
        .storage
        .from('blog-images')
        .upload(fileName, file, {
          cacheControl: '3600',
          upsert: false
        });

      if (uploadError) {
        console.error('Upload error:', uploadError);
        throw uploadError;
      }

      // Public URL al
      const { data: { publicUrl } } = this.supabase.client
        .storage
        .from('blog-images')
        .getPublicUrl(fileName);

      console.log('Uploaded image URL:', publicUrl);
      return publicUrl;
    } catch (error) {
      console.error('Resim yükleme hatası:', error);
      throw new Error('Resim yüklenirken bir hata oluştu');
    }
  }

  async deleteCategory(id: string) {
    const { data: userRole } = await this.supabase.client
      .from('profiles')
      .select('role')
      .single();

    if (userRole?.role !== 'admin') {
      throw new Error('Only admins can delete categories');
    }

    return await this.supabase.client
      .from('categories')
      .delete()
      .eq('id', id);
  }

  async updateCategory(id: string, data: Partial<Category>) {
    const { data: userRole } = await this.supabase.client
      .from('profiles')
      .select('role')
      .single();

    if (userRole?.role !== 'admin') {
      throw new Error('Only admins can update categories');
    }

    return await this.supabase.client
      .from('categories')
      .update(data)
      .eq('id', id);
  }

  async getCategoryStats() {
    return await this.supabase.client
      .from('categories')
      .select(`
        *,
        blogs:blogs(count),
        total_views:blogs(sum(views_count))
      `);
  }

  async updateCategoryBlogCount(categoryId: string) {
    try {
      // Kategorideki blog sayısını hesapla
      const { count } = await this.supabase.client
        .from('blogs')
        .select('*', { count: 'exact' })
        .eq('category_id', categoryId);

      // Kategoriyi güncelle
      await this.supabase.client
        .from('categories')
        .update({ blog_count: count })
        .eq('id', categoryId);
    } catch (error) {
      console.error('Blog sayısı güncelleme hatası:', error);
    }
  }

  async getBlogStats() {
    try {
      // En çok okunan blogları al
      const { data: topBlogs } = await this.supabase.client
        .from('blogs')
        .select(`
          *,
          categories (*),
          profiles:author_id (*),
          reading_count:reading_history(count)
        `)
        .order('views_count', { ascending: false })
        .limit(5);

      // Toplam blog sayısı
      const { count: totalBlogs } = await this.supabase.client
        .from('blogs')
        .select('*', { count: 'exact', head: true });

      // Toplam okuma sayısı
      const { count: totalReads } = await this.supabase.client
        .from('reading_history')
        .select('*', { count: 'exact', head: true });

      return {
        topBlogs: topBlogs || [],
        totalBlogs: totalBlogs || 0,
        totalReads: totalReads || 0
      };
    } catch (error) {
      console.error('İstatistik alma hatası:', error);
      throw error;
    }
  }
} 