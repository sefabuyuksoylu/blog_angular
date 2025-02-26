import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-register',
  template: `
    <div class="register-container">
      <div class="register-box">
        <h1>Kayıt Ol</h1>
        <form [formGroup]="registerForm" (ngSubmit)="onSubmit()">
          <div class="form-group">
            <label>Ad Soyad</label>
            <input 
              type="text" 
              formControlName="fullName" 
              placeholder="Adınız ve Soyadınız"
            >
            <div class="error" *ngIf="registerForm.get('fullName')?.touched && registerForm.get('fullName')?.invalid">
              Ad soyad giriniz
            </div>
          </div>

          <div class="form-group">
            <label>E-posta</label>
            <input 
              type="email" 
              formControlName="email" 
              placeholder="E-posta adresiniz"
            >
            <div class="error" *ngIf="registerForm.get('email')?.touched && registerForm.get('email')?.invalid">
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
            <div class="error" *ngIf="registerForm.get('password')?.touched && registerForm.get('password')?.invalid">
              En az 6 karakterli bir şifre giriniz
            </div>
          </div>

          <div class="form-group">
            <label>Şifre Tekrar</label>
            <input 
              type="password" 
              formControlName="confirmPassword" 
              placeholder="Şifrenizi tekrar giriniz"
            >
            <div class="error" *ngIf="registerForm.get('confirmPassword')?.touched && registerForm.errors?.['passwordMismatch']">
              Şifreler eşleşmiyor
            </div>
          </div>

          <button type="submit" [disabled]="registerForm.invalid || isLoading">
            {{ isLoading ? 'Kayıt Yapılıyor...' : 'Kayıt Ol' }}
          </button>
        </form>

        <div class="links">
          Zaten hesabınız var mı? 
          <a routerLink="/login">Giriş Yapın</a>
        </div>
      </div>

      <div class="success-message" *ngIf="successMessage">
        {{ successMessage }}
      </div>

      <div class="error-message" *ngIf="errorMessage">
        {{ errorMessage }}
      </div>
    </div>
  `,
  styles: [`
    .register-container {
      display: flex;
      align-items: center;
      justify-content: center;
      min-height: calc(100vh - 150px);
      background-color: #f8f9fa;
    }

    .register-box {
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

        .error {
          color: #ff4444;
          font-size: 0.8rem;
          margin-top: 0.5rem;
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

        &:hover:not(:disabled) {
          background: darken(#ff1a75, 10%);
        }

        &:disabled {
          background: #ccc;
          cursor: not-allowed;
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

    .success-message {
      color: #4CAF50;
      text-align: center;
      margin-bottom: 1rem;
      font-size: 0.9rem;
    }

    .error-message {
      color: #ff4444;
      text-align: center;
      margin-bottom: 1rem;
      font-size: 0.9rem;
    }
  `]
})
export class RegisterComponent {
  registerForm: FormGroup;
  isLoading = false;
  errorMessage = '';
  successMessage = '';

  constructor(
    private fb: FormBuilder,
    private auth: AuthService,
    private router: Router
  ) {
    this.registerForm = this.fb.group({
      fullName: ['', [Validators.required]],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', [Validators.required]]
    }, { validator: this.passwordMatchValidator });
  }

  passwordMatchValidator(g: FormGroup) {
    return g.get('password')?.value === g.get('confirmPassword')?.value
      ? null : { 'passwordMismatch': true };
  }

  async onSubmit() {
    if (this.registerForm.valid) {
      this.isLoading = true;
      this.errorMessage = '';
      this.successMessage = '';

      try {
        const { email, password, fullName } = this.registerForm.value;
        
        const result = await this.auth.signUp(email, password, {
          full_name: fullName
        });

        if (result.user) {
          this.successMessage = 'Kayıt başarıyla tamamlandı! Yönlendiriliyorsunuz...';
          
          // 2 saniye bekleyip login sayfasına yönlendir
          setTimeout(() => {
            this.router.navigate(['/login']);
          }, 2000);
        }
      } catch (error: any) {
        this.errorMessage = error.message || 'Kayıt sırasında bir hata oluştu.';
      } finally {
        this.isLoading = false;
      }
    }
  }
} 