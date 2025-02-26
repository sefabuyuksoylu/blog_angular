import { Component, OnInit } from '@angular/core';
import { AuthService } from './services/auth.service';
import { Router } from '@angular/router';
import { BehaviorSubject } from 'rxjs';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-root',
  template: `
    <div class="app-container">
      <header class="main-header">
        <div class="container">
          <div class="left-menu">
            <h1 class="logo" routerLink="/">Blog</h1>
            <nav class="main-nav">
              <a routerLink="/" routerLinkActive="active" [routerLinkActiveOptions]="{exact: true}" class="nav-link">
                Ana Sayfa
              </a>
            </nav>
          </div>
          
          <div class="right-menu">
            <ng-container *ngIf="isLoggedIn$ | async">
              <div class="user-section">
                <a routerLink="/my-posts" routerLinkActive="active">Yazılarım</a>
                <a routerLink="/reading-list" routerLinkActive="active">Okuma Listem</a>
                <a routerLink="/new-post" class="new-post-btn">Yeni Yazı</a>
              </div>

              <div class="user-menu">
                <span class="welcome-text">
                  <i class="fas fa-user"></i>
                  {{ (userProfile$ | async)?.full_name || 'Kullanıcı' }}
                </span>
                
                <ng-container *ngIf="isAdmin$ | async">
                  <div class="admin-menu">
                    <a routerLink="/admin/categories">Kategoriler</a>
                    <a routerLink="/admin/users">Kullanıcılar</a>
                    <a routerLink="/admin/stats">İstatistikler</a>
                  </div>
                </ng-container>
                
                <button (click)="logout()" class="logout-btn">Çıkış Yap</button>
              </div>
            </ng-container>
            
            <ng-container *ngIf="!(isLoggedIn$ | async)">
              <div class="auth-buttons">
                <a routerLink="/login" routerLinkActive="active">Giriş</a>
                <a routerLink="/register" routerLinkActive="active">Kayıt Ol</a>
              </div>
            </ng-container>
          </div>
        </div>
      </header>
      <main>
        <div class="container">
          <router-outlet></router-outlet>
        </div>
      </main>
    </div>
  `,
  styles: [`
    .app-container {
      min-height: 100vh;
      background: white;
    }

    .main-header {
      background: #f8f9fa;
      padding: 1rem 0;
      border-bottom: 1px solid #eee;
      position: sticky;
      top: 0;
      z-index: 100;
    }

    .container {
      max-width: 1200px;
      margin: 0 auto;
      padding: 0 1rem;
    }

    .main-header .container {
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .logo {
      font-size: 1.5rem;
      font-weight: bold;
      color: #333;
      text-decoration: none;
      cursor: pointer;
    }

    .left-menu {
      display: flex;
      align-items: center;
      gap: 2rem;
    }

    .main-nav .nav-link {
      padding: 0.5rem 1rem;
      border-radius: 6px;
      background: #f0f0f0;
      color: #333;
      font-weight: 500;
      text-decoration: none;
      
      &:hover, &.active {
        background: #e0e0e0;
      }
    }

    .right-menu {
      display: flex;
      align-items: center;
      gap: 2rem;
    }

    .user-section {
      display: flex;
      gap: 1.5rem;
      align-items: center;

      a {
        text-decoration: none;
        color: #666;
        font-weight: 500;
        transition: color 0.3s;

        &:hover {
          color: #333;
        }
      }
    }

    .new-post-btn {
      background: #e2e2e2 !important;
      color: #4a4a4a !important;
      padding: 0.5rem 1rem;
      border-radius: 20px;
      text-decoration: none;

      &:hover {
        background: #d1d1d1 !important;
      }
    }

    .user-menu {
      display: flex;
      align-items: center;
      gap: 1.5rem;
      padding-left: 1.5rem;
      border-left: 1px solid #eee;
    }

    .welcome-text {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      color: #333;
      font-weight: 500;
      
      i {
        color: #666;
      }
    }

    .admin-menu {
      display: flex;
      gap: 1rem;
      
      a {
        font-size: 0.9rem;
        padding: 0.3rem 0.8rem;
        background: #f8f9fa;
        border-radius: 4px;
        color: #666;
        text-decoration: none;
        
        &:hover {
          background: #e9ecef;
          color: #333;
        }
      }
    }

    .auth-buttons {
      display: flex;
      gap: 1rem;
      
      a {
        padding: 0.5rem 1rem;
        border-radius: 6px;
        text-decoration: none;
        color: #666;
        font-weight: 500;
        
        &:last-child {
          background: #e2e2e2;
          color: #4a4a4a;
        }

        &:hover {
          color: #333;
          
          &:last-child {
            background: #d1d1d1;
            color: #4a4a4a;
          }
        }
      }
    }

    .logout-btn {
      background: none;
      border: none;
      color: #666;
      cursor: pointer;
      font-size: 1rem;
      padding: 0;

      &:hover {
        color: #333;
      }
    }
  `],
  standalone: true,
  imports: [CommonModule, RouterModule]
})
export class AppComponent implements OnInit {
  isLoggedIn$ = this.auth.authState$;
  userProfile$ = new BehaviorSubject<any>(null);
  isAdmin$ = new BehaviorSubject<boolean>(false);

  constructor(
    private auth: AuthService,
    private router: Router
  ) {}

  async ngOnInit() {
    // Sayfa yüklendiğinde mevcut kullanıcıyı kontrol et
    const user = await this.auth.getCurrentUser();
    if (user) {
      this.auth.authState.next(true);
      const profile = await this.auth.getUserProfile();
      this.userProfile$.next(profile);
      const isAdmin = await this.auth.isAdmin();
      this.isAdmin$.next(isAdmin);
    }

    // Auth durumu değişikliklerini dinle
    this.auth.authState$.subscribe(async (isLoggedIn) => {
      if (isLoggedIn) {
        const user = await this.auth.getCurrentUser();
        if (user) {
          await this.auth.handleEmailConfirmation(user);
          const profile = await this.auth.getUserProfile();
          this.userProfile$.next(profile);
          const isAdmin = await this.auth.isAdmin();
          this.isAdmin$.next(isAdmin);
        }
      } else {
        this.userProfile$.next(null);
        this.isAdmin$.next(false);
      }
    });
  }

  async logout() {
    await this.auth.signOut();
    this.userProfile$.next(null);
    this.isAdmin$.next(false);
    this.router.navigate(['/']);
  }
}
