import { Component } from '@angular/core';
import { AuthService } from '../../services/auth.service';
import { Router } from '@angular/router';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';

@Component({
  selector: 'app-login',
  template: `
    <div class="login-container">
      <div class="login-box">
        <h1>Giriş Yap</h1>
        <form [formGroup]="loginForm" (ngSubmit)="onSubmit()">
          <div class="form-group">
            <label>E-posta</label>
            <input 
              type="email" 
              formControlName="email" 
              placeholder="E-posta adresiniz"
            >
            <div class="error" *ngIf="loginForm.get('email')?.touched && loginForm.get('email')?.invalid">
              Geçerli bir e-posta adresi giriniz
            </div>
          </div>

          <div class="form-group">
            <label>Şifre</label>
            <input 
              type="password" 
              formControlName="password" 
              placeholder="Şifreniz"
            >
            <div class="error" *ngIf="loginForm.get('password')?.touched && loginForm.get('password')?.invalid">
              Şifrenizi giriniz
            </div>
          </div>

          <div class="error-message" *ngIf="errorMessage">
            {{ errorMessage }}
          </div>

          <button type="submit" [disabled]="loginForm.invalid || isLoading">
            {{ isLoading ? 'Giriş Yapılıyor...' : 'Giriş Yap' }}
          </button>
        </form>

        <div class="links">
          Hesabınız yok mu? 
          <a routerLink="/register">Kayıt Olun</a>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .login-container {
      display: flex;
      align-items: center;
      justify-content: center;
      min-height: calc(100vh - 150px);
      background-color: #f8f9fa;
    }

    .login-box {
      background: white;
      padding: 2rem;
      border-radius: 12px;
      box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
      width: 100%;
      max-width: 400px;

      h1 {
        text-align: center;
        color: #333;
        margin-bottom: 2rem;
        font-size: 1.8rem;
      }

      .form-group {
        margin-bottom: 1.5rem;

        label {
          display: block;
          margin-bottom: 0.5rem;
          color: #666;
          font-size: 0.9rem;
        }

        input {
          width: 100%;
          padding: 0.8rem;
          border: 1px solid #ddd;
          border-radius: 8px;
          font-size: 1rem;
          transition: border-color 0.3s ease;

          &:focus {
            outline: none;
            border-color: #ff1a75;
          }
        }
      }

      button {
        width: 100%;
        padding: 1rem;
        background: #ff1a75;
        color: white;
        border: none;
        border-radius: 8px;
        font-size: 1rem;
        cursor: pointer;
        transition: background 0.3s ease;

        &:hover {
          background: darken(#ff1a75, 10%);
        }
      }

      .links {
        text-align: center;
        margin-top: 1.5rem;
        color: #666;

        a {
          color: #ff1a75;
          text-decoration: none;
          margin-left: 0.5rem;

          &:hover {
            text-decoration: underline;
          }
        }
      }
    }

    .error-message {
      color: #ff4444;
      text-align: center;
      margin-bottom: 1rem;
      font-size: 0.9rem;
    }

    button:disabled {
      background: #ccc;
      cursor: not-allowed;
    }
  `]
})
export class LoginComponent {
  loginForm: FormGroup;
  isLoading = false;
  errorMessage = '';

  constructor(
    private fb: FormBuilder,
    private auth: AuthService,
    private router: Router
  ) {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required]]
    });
  }

  async onSubmit() {
    if (this.loginForm.valid) {
      this.isLoading = true;
      this.errorMessage = '';

      try {
        const { email, password } = this.loginForm.value;
        const result = await this.auth.signIn(email, password);
        
        if (result.user) {
          this.router.navigate(['/']);
        }
      } catch (error: any) {
        this.errorMessage = error.message || 'Giriş yapılamadı. Lütfen bilgilerinizi kontrol edin.';
      } finally {
        this.isLoading = false;
      }
    }
  }
} 