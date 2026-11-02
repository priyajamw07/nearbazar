import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../../../../shared/services/api.service';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  template: `
    <div class="auth-page-bg py-5">
      <div class="auth-card">
        <div class="auth-header text-center mb-4">
          <div class="auth-logo-badge mb-2">N</div>
          <h2>Create Account</h2>
          <p class="text-sm text-muted">Join NearbyBazaar for neighborhood shopping</p>
        </div>

        <form (ngSubmit)="onSubmit()" class="auth-form">
          <div class="form-group mb-3">
            <label>Full Name *</label>
            <input type="text" [(ngModel)]="fullName" name="fullName" class="form-input" placeholder="Ramesh Kumar" required />
          </div>

          <div class="form-group mb-3">
            <label>Email Address *</label>
            <input type="email" [(ngModel)]="email" name="email" class="form-input" placeholder="you@example.com" required />
          </div>

          <div class="form-group mb-3">
            <label>Mobile Number *</label>
            <input type="tel" [(ngModel)]="phone" name="phone" class="form-input" placeholder="+91 98765 43210" required />
          </div>

          <div class="form-group mb-4">
            <label>Password (min 6 characters) *</label>
            <input type="password" [(ngModel)]="password" name="password" class="form-input" placeholder="••••••••" required />
          </div>

          <div class="error-alert mb-3" *ngIf="errorMessage">
            <i class="fa-solid fa-circle-exclamation mr-1"></i> {{ errorMessage }}
          </div>

          <button type="submit" class="btn-primary w-100 py-3" [disabled]="loading">
            {{ loading ? 'Creating Account...' : 'Register Account' }}
          </button>
        </form>

        <div class="auth-footer text-center mt-4">
          <p class="text-sm text-muted">
            Already have an account? <a routerLink="/login" class="text-blue font-bold">Sign In</a>
          </p>
          <div class="vendor-prompt mt-3 pt-3">
            <a routerLink="/apply-vendor" class="text-orange text-xs font-bold">
              Want to sell your products? Apply for a Shopkeeper Account <i class="fa-solid fa-arrow-right ml-1"></i>
            </a>
          </div>
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
      max-width: 460px;
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
    .vendor-prompt { border-top: 1px solid #E2E8F0; }
  `]
})
export class RegisterComponent {
  fullName = '';
  email = '';
  phone = '';
  password = '';
  loading = false;
  errorMessage = '';

  constructor(private apiService: ApiService, private router: Router) {}

  onSubmit(): void {
    if (!this.fullName || !this.email || !this.password) return;
    this.loading = true;
    this.errorMessage = '';

    this.apiService.register({
      full_name: this.fullName,
      email: this.email,
      phone: this.phone,
      password: this.password,
      role: 'CUSTOMER'
    }).subscribe({
      next: (res) => {
        this.loading = false;
        if (res.success) {
          alert('Account registered successfully! Welcome to NearbyBazaar.');
          this.router.navigate(['/']);
        }
      },
      error: (err) => {
        this.loading = false;
        this.errorMessage = err.error?.message || 'Registration failed. Email may already be in use.';
      }
    });
  }
}
