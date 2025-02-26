import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { RouterModule } from '@angular/router';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { LoginComponent } from './components/login/login.component';
import { BlogListComponent } from './components/blog-list/blog-list.component';
import { RegisterComponent } from './components/register/register.component';
import { BlogEditorComponent } from './components/blog-editor/blog-editor.component';
import { CategoryBlogsComponent } from './components/category-blogs/category-blogs.component';
import { BlogDetailComponent } from './components/blog-detail/blog-detail.component';
import { ReadingListComponent } from './components/reading-list/reading-list.component';
import { CategoryListComponent } from './components/category-list/category-list.component';
import { SupabaseService } from './services/supabase.service';
import { BlogService } from './services/blog.service';
import { MyBlogsComponent } from './components/my-blogs/my-blogs.component';
import { AuthService } from './services/auth.service';
import { AdminStatsComponent } from './components/admin/admin-stats.component';
import { UserListComponent } from './components/admin/user-list.component';

@NgModule({
  declarations: [],
  imports: [
    BrowserModule.withServerTransition({ appId: 'serverApp' }),
    CommonModule,
    AppRoutingModule,
    FormsModule,
    ReactiveFormsModule,
    HttpClientModule,
    RouterModule,
    AppComponent,
    BlogDetailComponent,
    BlogEditorComponent,
    UserListComponent,
    AdminStatsComponent,
    ReadingListComponent,
    BlogListComponent,
    LoginComponent,
    RegisterComponent,
    MyBlogsComponent,
    CategoryBlogsComponent,
    CategoryListComponent
  ],
  providers: [
    SupabaseService,
    AuthService,
    BlogService
  ]
})
export class AppModule { }
