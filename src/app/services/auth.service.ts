import { Injectable } from '@angular/core';
import { SupabaseService } from './supabase.service';
import { BehaviorSubject } from 'rxjs';
import { User } from '@supabase/supabase-js';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  public authState = new BehaviorSubject<boolean>(false);
  private currentUser = new BehaviorSubject<User | null>(null);
  
  authState$ = this.authState.asObservable();
  currentUser$ = this.currentUser.asObservable();

  constructor(private supabase: SupabaseService) {
    // Oturum durumunu dinle
    this.supabase.client.auth.onAuthStateChange((event, session) => {
      this.authState.next(!!session);
      if (session?.user) {
        this.currentUser.next(session.user);
      } else {
        this.currentUser.next(null);
      }
    });
  }

  async signUp(email: string, password: string, metadata: any = {}) {
    try {
      
      const { data: authData, error: authError } = await this.supabase.client.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/login`,
          data: {
            full_name: metadata.full_name 
          }
        }
      });

      if (authError) throw authError;

      
      if (authData.user) {
        const initials = metadata.full_name
          .split(' ')
          .map((n: string) => n[0])
          .join('')
          .toUpperCase();

        const defaultAvatarUrl = `https://api.dicebear.com/7.x/initials/svg?seed=${initials}&backgroundColor=random`;
        
        const profileData = {
          id: authData.user.id,
          email: email,
          full_name: metadata.full_name,
          avatar_url: defaultAvatarUrl,
          role: 'user',
          created_at: new Date().toISOString()
        };

        // Profil verilerini önce oluşturalım
        const { error: profileError } = await this.supabase.client
          .from('profiles')
          .insert(profileData);

        if (profileError) {
          console.error('Profil oluşturma hatası:', profileError);
        }
      }

      return authData;
    } catch (error) {
      console.error('Kayıt hatası:', error);
      throw error;
    }
  }

  async signIn(email: string, password: string) {
    try {
      const { data, error } = await this.supabase.client.auth.signInWithPassword({
        email,
        password
      });

      if (error) throw error;

      if (data.user) {
        console.log('Auth user:', data.user); 

        // Profil bilgisini al
        const { data: profile, error: profileError } = await this.supabase.client
          .from('profiles')
          .select('*')
          .eq('id', data.user.id)
          .single();

        console.log('Profile data:', profile); 
        console.log('Profile error:', profileError); 

        if (profileError) {
          console.error('Profil bilgisi alınamadı:', profileError);
        }

        this.authState.next(true);
        this.currentUser.next(data.user);
      }

      return data;
    } catch (error) {
      console.error('Giriş hatası:', error);
      throw error;
    }
  }

  async signOut() {
    await this.supabase.client.auth.signOut();
    this.authState.next(false);
    this.currentUser.next(null);
  }

  async getCurrentUser() {
    try {
      const { data: { user } } = await this.supabase.client.auth.getUser();
      if (user) {
        this.currentUser.next(user);
      }
      return user;
    } catch (error) {
      console.error('Kullanıcı bilgisi alınırken hata:', error);
      return null;
    }
  }

  async isAdmin() {
    try {
      const user = await this.getCurrentUser();
      if (!user) return false;
      
      const { data, error } = await this.supabase.client
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single();
        
      if (error) {
        console.error('Admin kontrolü hatası:', error);
        return false;
      }

      return data?.role === 'admin';
    } catch (error) {
      console.error('Admin kontrolü hatası:', error);
      return false;
    }
  }

  async getUserProfile() {
    try {
      const user = await this.getCurrentUser();
      console.log('Current user:', user); // Debug için

      if (!user) return null;

      const { data, error } = await this.supabase.client
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      console.log('Profile query result:', { data, error }); // Debug için

      if (error) {
        console.error('Profil bilgisi alınırken hata:', error);
        return null;
      }

      return data;
    } catch (error) {
      console.error('Profil bilgisi alınırken hata:', error);
      return null;
    }
  }

  async handleEmailConfirmation(user: any) {
    try {
      // Profil var mı kontrol et
      const { data: existingProfile } = await this.supabase.client
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (!existingProfile) {
        const initials = user.user_metadata.full_name
          .split(' ')
          .map((n: string) => n[0])
          .join('')
          .toUpperCase();

        const defaultAvatarUrl = `https://api.dicebear.com/7.x/initials/svg?seed=${initials}&backgroundColor=random`;
        
        const profileData = {
          id: user.id,
          email: user.email,
          full_name: user.user_metadata.full_name,
          avatar_url: defaultAvatarUrl,
          role: 'user',
          created_at: new Date().toISOString()
        };

        await this.supabase.client
          .from('profiles')
          .upsert(profileData);
      }
    } catch (error) {
      console.error('Profil güncelleme hatası:', error);
    }
  }
} 