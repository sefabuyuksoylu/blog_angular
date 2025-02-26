export interface Blog {
  id: string;
  title: string;
  content: string;
  image: string;
  author_id: string;
  category_id: string;
  views_count: number;
  created_at: string;
  categories?: Category;
  profiles?: {
    full_name: string;
    avatar_url: string;
    email: string;
  };
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  blog_count?: number;
}

export interface Profile {
  id: string;
  email: string;
  avatar_url?: string;
  role: 'user' | 'admin';
}

export interface UserReadingHistory {
  user_id: string;
  blog_id: string;
  read_at: Date;
} 