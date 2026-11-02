import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../../../../shared/services/api.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  template: `
    <div class="auth-page-bg py-5">
      <div class="auth-card">
        <div class="auth-header text-center mb-4">
          <div class="auth-logo-badge mb-2">N</div>
          <h2>Welcome Back</h2>
          <p class="text-sm text-muted">Sign in to your NearbyBazaar account</p>
        </div>

        <!-- Quick Demo Credentials Selector -->
        <div class="demo-creds-box mb-4">
          <small class="d-block text-muted mb-2 font-bold"><i class="fa-solid fa-key mr-1 text-orange"></i> Quick Demo Login:</small>
          <div class="demo-buttons-grid">
            <button type="button" class="btn-demo-chip" (click)="fillDemo('customer@nearbybazaar.com', 'Customer@123')">
              Customer
            </button>
            <button type="button" class="btn-demo-chip" (click)="fillDemo('vendor@sharmakirana.com', 'Vendor@123')">
              Vendor
            </button>
            <button type="button" class="btn-demo-chip" (click)="fillDemo('admin@nearbybazaar.com', 'Admin@123')">
              Admin
            </button>
          </div>
        </div>

        <form (ngSubmit)="onSubmit()" class="auth-form">
          <div class="form-group mb-3">
            <label>Email Address</label>
            <input type="email" [(ngModel)]="email" name="email" class="form-input" placeholder="you@example.com" required />
          </div>

          <div class="form-group mb-4">
            <div class="d-flex justify-between align-center mb-1">
              <label>Password</label>
              <a href="javascript:void(0)" class="text-xs text-blue">Forgot?</a>
            </div>
            <input type="password" [(ngModel)]="password" name="password" class="form-input" placeholder="••••••••" required />
          </div>

          <div class="error-alert mb-3" *ngIf="errorMessage">
            <i class="fa-solid fa-circle-exclamation mr-1"></i> {{ errorMessage }}
          </div>

          <button type="submit" class="btn-primary w-100 py-3" [disabled]="loading">
            {{ loading ? 'Signing in...' : 'Sign In' }}
          </button>
        </form>

        <div class="auth-footer text-center mt-4">
          <p class="text-sm text-muted">
            New to NearbyBazaar? <a routerLink="/register" class="text-blue font-bold">Create Account</a>
          </p>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .auth-page-bg {
      background: radial-gradient(ellipse at top, #0B2D4D 0%, #06172B 75%);
      min-height: calc(100vh - 120px);
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 40px 16px;
    }
    .auth-card {
      background: #FFFFFF;
      border-radius: 16px;
      padding: 36px;
      width: 100%;
      max-width: 440px;
      box-shadow: 0 10px 40px rgba(0, 0, 0, 0.3);
    }
    .auth-logo-badge {
      width: 48px;
      height: 48px;
      background: linear-gradient(135deg, #FF8A24, #0879D1);
      border-radius: 12px;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      color: #FFF;
      font-weight: 900;
      font-size: 24px;
    }
    .auth-header h2 { font-size: 1.5rem; font-weight: 800; color: #0B2D4D; }
    .demo-creds-box {
      background: #F8FAFC;
      border: 1px dashed #CBD5E1;
      border-radius: 8px;
      padding: 10px 12px;
    }
    .demo-buttons-grid { display: flex; gap: 8px; }
    .btn-demo-chip {
      flex: 1;
      background: #FFF;
      border: 1px solid #CBD5E1;
      padding: 6px 0;
      border-radius: 6px;
      font-size: 0.78rem;
      font-weight: 700;
      color: #0879D1;
      cursor: pointer;
      &:hover { background: #0879D1; color: #FFF; border-color: #0879D1; }
    }
    .form-group label { display: block; font-size: 0.82rem; font-weight: 600; color: #475569; margin-bottom: 6px; }
    .form-input {
      width: 100%;
      padding: 10px 14px;
      border: 1px solid #CBD5E1;
      border-radius: 8px;
      font-size: 0.9rem;
      &:focus { border-color: #0879D1; outline: none; }
    }
    .error-alert {
      background: rgba(220, 53, 69, 0.1);
      border: 1px solid rgba(220, 53, 69, 0.3);
      color: #DC3545;
      padding: 10px;
      border-radius: 6px;
      font-size: 0.85rem;
    }
    .w-100 { width: 100%; }
    .py-3 { padding: 12px 0; }
  `]
})
export class LoginComponent {
  email = '';
  password = '';
  loading = false;
  errorMessage = '';

  constructor(private apiService: ApiService, private router: Router) {}

  fillDemo(e: string, p: string): void {
    this.email = e;
    this.password = p;
    this.errorMessage = '';
  }

  onSubmit(): void {
    if (!this.email || !this.password) return;
    this.loading = true;
    this.errorMessage = '';

    this.apiService.login({ email: this.email, password: this.password }).subscribe({
      next: (res) => {
        this.loading = false;
        if (res.success) {
          if (res.user.role === 'VENDOR_ADMIN') {
            window.location.href = 'http://localhost:4201';
          } else if (res.user.role === 'SUPER_ADMIN') {
            window.location.href = 'http://localhost:4202';
          } else {
            this.router.navigate(['/']);
          }
        }
      },
      error: (err) => {
        this.loading = false;
        this.errorMessage = err.error?.message || 'Login failed. Please verify your credentials.';
      }
    });
  }
}
