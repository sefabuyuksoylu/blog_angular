import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { BlogListComponent } from './components/blog-list/blog-list.component';
import { LoginComponent } from './components/login/login.component';
import { RegisterComponent } from './components/register/register.component';
import { BlogEditorComponent } from './components/blog-editor/blog-editor.component';
import { BlogDetailComponent } from './components/blog-detail/blog-detail.component';
import { CategoryBlogsComponent } from './components/category-blogs/category-blogs.component';
import { ReadingListComponent } from './components/reading-list/reading-list.component';
import { MyBlogsComponent } from './components/my-blogs/my-blogs.component';
import { AuthGuard } from './guards/auth.guard';
import { CategoryListComponent } from './components/category-list/category-list.component';
import { AdminGuard } from './guards/admin.guard';
import { AdminStatsComponent } from './components/admin/admin-stats.component';
import { UserListComponent } from './components/admin/user-list.component';

export const routes: Routes = [
  { path: '', component: BlogListComponent },
  { path: 'latest', component: BlogListComponent },
  { path: 'login', component: LoginComponent },
  { path: 'register', component: RegisterComponent },
  { path: 'blog/:id', component: BlogDetailComponent },
  { path: 'topics', component: CategoryListComponent },
  { path: 'category/:id', component: CategoryBlogsComponent },
  { path: 'my-posts', component: MyBlogsComponent, canActivate: [AuthGuard] },
  { path: 'reading-list', component: ReadingListComponent, canActivate: [AuthGuard] },
  { path: 'new-post', component: BlogEditorComponent, canActivate: [AuthGuard] },
  { path: 'admin/categories', component: CategoryListComponent, canActivate: [AuthGuard, AdminGuard] },
  { path: 'admin/stats', component: AdminStatsComponent, canActivate: [AuthGuard, AdminGuard] },
  { path: 'admin/users', component: UserListComponent, canActivate: [AuthGuard, AdminGuard] },
  { path: '**', redirectTo: '' }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
