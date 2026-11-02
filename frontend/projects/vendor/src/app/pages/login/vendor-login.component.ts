import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../../../../shared/services/api.service';

@Component({
  selector: 'app-vendor-login',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  template: `
    <div class="vendor-auth-bg">
      <div class="auth-card">
        <div class="text-center mb-4">
          <div class="vendor-icon-badge mb-2"><i class="fa-solid fa-store"></i></div>
          <h2>Vendor Hub Portal</h2>
          <p class="text-sm text-muted">Shopkeeper Login • NearbyBazaar</p>
        </div>

        <div class="quick-demo-box mb-3">
          <small class="d-block text-muted font-bold mb-1">Demo Shopkeeper Accounts:</small>
          <div class="d-flex gap-2">
            <button class="btn-demo" (click)="fill('vendor@sharmakirana.com', 'Vendor@123')">Sharma Kirana</button>
            <button class="btn-demo" (click)="fill('vendor@kumarelec.com', 'Vendor@123')">Kumar Electronics</button>
          </div>
        </div>

        <form (ngSubmit)="onLogin()">
          <div class="form-group mb-3">
            <label class="text-xs font-bold text-muted">Vendor Email</label>
            <input type="email" [(ngModel)]="email" name="email" class="form-input" required />
          </div>
          <div class="form-group mb-4">
            <label class="text-xs font-bold text-muted">Password</label>
            <input type="password" [(ngModel)]="password" name="password" class="form-input" required />
          </div>
          <div class="error-msg mb-3" *ngIf="errorMsg">{{ errorMsg }}</div>
          <button type="submit" class="btn-primary w-100 py-2">Log In to Vendor Hub</button>
        </form>

        <div class="text-center mt-3">
          <a href="http://localhost:4200" class="text-xs text-blue">← Back to Customer Storefront (:4200)</a>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .vendor-auth-bg {
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      background: #F1F5F9;
      padding: 20px;
    }
    .auth-card {
      background: #FFF;
      border: 1px solid #E2E8F0;
      border-radius: 12px;
      padding: 32px;
      width: 100%;
      max-width: 420px;
      box-shadow: 0 4px 20px rgba(0,0,0,0.06);
    }
    .vendor-icon-badge {
      width: 48px;
      height: 48px;
      background: #0879D1;
      color: #FFF;
      border-radius: 12px;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      font-size: 1.5rem;
    }
    .quick-demo-box {
      background: #F8FAFC;
      border: 1px dashed #CBD5E1;
      padding: 8px 12px;
      border-radius: 6px;
    }
    .btn-demo {
      flex: 1;
      background: #FFF;
      border: 1px solid #CBD5E1;
      padding: 4px 8px;
      border-radius: 4px;
      font-size: 0.75rem;
      font-weight: 700;
      color: #0879D1;
      cursor: pointer;
      &:hover { background: #0879D1; color: #FFF; }
    }
    .form-input {
      width: 100%;
      padding: 10px;
      border: 1px solid #CBD5E1;
      border-radius: 6px;
      font-size: 0.9rem;
    }
    .error-msg { color: #DC3545; font-size: 0.82rem; }
    .w-100 { width: 100%; }
    .py-2 { padding: 10px 0; }
  `]
})
export class VendorLoginComponent {
  email = 'vendor@sharmakirana.com';
  password = 'Vendor@123';
  errorMsg = '';

  constructor(private apiService: ApiService, private router: Router) {}

  fill(e: string, p: string): void {
    this.email = e;
    this.password = p;
  }

  onLogin(): void {
    this.apiService.login({ email: this.email, password: this.password }).subscribe({
      next: (res) => {
        if (res.success) {
          this.router.navigate(['/dashboard']);
        }
      },
      error: (err) => {
        this.errorMsg = err.error?.message || 'Login failed.';
      }
    });
  }
}
