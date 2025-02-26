import { Component, OnInit } from '@angular/core';
import { AuthService } from './services/auth.service';
import { Router } from '@angular/router';
import { BehaviorSubject } from 'rxjs';

@Component({
  selector: 'app-root',
  template: `
    <div class="app-container">
      <header class="main-header">
        <div class="container">
          <h1 class="logo" routerLink="/">Blog</h1>
          <nav>
            <a routerLink="/" routerLinkActive="active" [routerLinkActiveOptions]="{exact: true}">Ana Sayfa</a>
            
            <ng-container *ngIf="isLoggedIn$ | async">
              <span class="welcome-text">
                Hoş geldin, {{ (userProfile$ | async)?.full_name || 'Kullanıcı' }}
              </span>
              <a routerLink="/my-posts" routerLinkActive="active">Yazılarım</a>
              <a routerLink="/reading-list" routerLinkActive="active">Okuma Listem</a>
              <a routerLink="/new-post" class="new-post-btn">Yeni Yazı</a>
              <button (click)="logout()" class="logout-btn">Çıkış Yap</button>
            </ng-container>
            
            <ng-container *ngIf="!(isLoggedIn$ | async)">
              <a routerLink="/login" routerLinkActive="active">Giriş</a>
              <a routerLink="/register" routerLinkActive="active">Kayıt Ol</a>
            </ng-container>
          </nav>
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
    nav {
      display: flex;
      gap: 1.5rem;
      align-items: center;
    }
    nav a {
      text-decoration: none;
      color: #666;
      font-weight: 500;
      transition: color 0.3s;
      &:hover, &.active {
        color: #333;
      }
    }
    .new-post-btn {
      background: #ff1a75;
      color: white !important;
      padding: 0.5rem 1rem;
      border-radius: 20px;
      &:hover {
        background: #e6165a;
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
    main {
      padding: 2rem 0;
    }
    .welcome-text {
      color: #666;
      font-weight: 500;
      margin-right: 1rem;
    }
  `]
})
export class AppComponent implements OnInit {
  isLoggedIn$ = this.auth.authState$;
  userProfile$ = new BehaviorSubject<any>(null);

  constructor(
    private auth: AuthService,
    private router: Router
  ) {
    console.log('App Component Yüklendi');
  }

  async ngOnInit() {
    // Auth durumu değiştiğinde profil bilgisini güncelle
    this.auth.authState$.subscribe(async (isLoggedIn) => {
      if (isLoggedIn) {
        const profile = await this.auth.getUserProfile();
        console.log('Güncel profil:', profile); // Debug için
        this.userProfile$.next(profile);
      } else {
        this.userProfile$.next(null);
      }
    });

    // Sayfa yüklendiğinde mevcut kullanıcı varsa profil bilgisini al
    const profile = await this.auth.getUserProfile();
    if (profile) {
      this.userProfile$.next(profile);
    }
  }

  async logout() {
    await this.auth.signOut();
    this.userProfile$.next(null);
    this.router.navigate(['/']);
  }
}
