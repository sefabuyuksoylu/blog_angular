import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

@Injectable({
  providedIn: 'root'
})
export class AdminGuard implements CanActivate {
  constructor(
    private auth: AuthService,
    private router: Router
  ) {}

  async canActivate(): Promise<boolean> {
    const isAdmin = await this.auth.isAdmin();
    
    if (!isAdmin) {
      this.router.navigate(['/']);
      return false;
    }
    
    return true;
  }
} 