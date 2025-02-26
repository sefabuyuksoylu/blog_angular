import { Category } from './blog.model';
import { Profile as User } from './blog.model';  // Profile'ı User olarak yeniden adlandırıyoruz

export interface Post {
  id: string;
  title: string;
  content: string;
  slug: string;
  image: string;
  category_id: string;
  author_id: string;
  views_count: number;
  created_at: string;
  updated_at: string;
  categories?: Category;
  author?: User;
} 