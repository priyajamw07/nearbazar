import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { ApiService } from '@shared/services/api.service';

@Component({
  selector: 'app-admin-login',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="login-wrapper">
      <div class="login-box">
        <div class="brand-header">
          <div class="brand-icon">🛡️</div>
          <h2>NearbyBazaar Control Center</h2>
          <p class="subtitle">Platform Governance & Security Administration</p>
        </div>

        <div *ngIf="errorMessage" class="error-banner">
          {{ errorMessage }}
        </div>

        <form (ngSubmit)="onSubmit()" class="login-form">
          <div class="form-group">
            <label>Administrator Email</label>
            <input type="email" [(ngModel)]="email" name="email" required placeholder="admin@nearbybazaar.local" />
          </div>

          <div class="form-group">
            <label>Master Passphrase</label>
            <input type="password" [(ngModel)]="password" name="password" required placeholder="••••••••••••" />
          </div>

          <button type="submit" class="btn btn-primary btn-block" [disabled]="loading">
            {{ loading ? 'Verifying Credentials...' : 'Access Control Center 🔐' }}
          </button>
        </form>

        <div class="quick-creds">
          <p><strong>Demo Root Administrator:</strong></p>
          <code>admin&#64;nearbybazaar.local / AdminPass123!</code>
          <button type="button" class="btn-fill" (click)="fillDemoCreds()">Auto-Fill Root Admin</button>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .login-wrapper {
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      background: #06172B;
      padding: 20px;
    }
    .login-box {
      background: #ffffff;
      border-radius: 16px;
      padding: 40px;
      width: 100%;
      max-width: 440px;
      box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5);
    }
    .brand-header {
      text-align: center;
      margin-bottom: 28px;
      .brand-icon { font-size: 40px; margin-bottom: 12px; }
      h2 { margin: 0; font-size: 22px; color: #06172B; font-weight: 800; }
      .subtitle { margin: 6px 0 0 0; color: #64748B; font-size: 13px; }
    }
    .error-banner {
      background: #fee2e2;
      color: #b91c1c;
      padding: 12px;
      border-radius: 8px;
      margin-bottom: 20px;
      font-size: 13px;
      text-align: center;
      font-weight: 500;
    }
    .form-group {
      margin-bottom: 20px;
      label { display: block; font-size: 13px; font-weight: 600; color: #334155; margin-bottom: 6px; }
      input {
        width: 100%;
        padding: 10px 14px;
        border: 1px solid #cbd5e1;
        border-radius: 8px;
        font-size: 14px;
        outline: none;
        &:focus { border-color: #0879D1; box-shadow: 0 0 0 3px rgba(8, 121, 209, 0.15); }
      }
    }
    .btn {
      padding: 12px;
      border-radius: 8px;
      font-weight: 700;
      cursor: pointer;
      border: none;
      font-size: 14px;
      &.btn-primary { background: #0879D1; color: white; &:hover { background: #0662ab; } }
      &.btn-block { width: 100%; }
      &:disabled { opacity: 0.6; cursor: not-allowed; }
    }
    .quick-creds {
      margin-top: 24px;
      padding: 16px;
      background: #f8fafc;
      border-radius: 8px;
      border: 1px dashed #cbd5e1;
      font-size: 12px;
      text-align: center;
      p { margin: 0 0 4px 0; color: #475569; }
      code { display: block; color: #0879D1; margin-bottom: 8px; font-weight: 600; }
      .btn-fill {
        background: white; border: 1px solid #cbd5e1; padding: 4px 10px; border-radius: 4px;
        font-size: 11px; font-weight: 600; color: #0879D1; cursor: pointer;
        &:hover { background: #f1f5f9; }
      }
    }
  `]
})
export class AdminLoginComponent {
  email = '';
  password = '';
  errorMessage = '';
  loading = false;

  constructor(private api: ApiService, private router: Router) {}

  fillDemoCreds(): void {
    this.email = 'admin@nearbybazaar.local';
    this.password = 'AdminPass123!';
  }

  onSubmit(): void {
    this.errorMessage = '';
    this.loading = true;
    this.api.login({ email: this.email, password: this.password }).subscribe({
      next: (res) => {
        if (res.user.role !== 'SUPER_ADMIN') {
          this.errorMessage = 'Access denied. Account lacks SUPER_ADMIN credentials.';
          this.loading = false;
          return;
        }
        this.loading = false;
        this.router.navigate(['/dashboard']);
      },
      error: (err) => {
        this.errorMessage = err.error?.detail || 'Invalid administrator credentials.';
        this.loading = false;
      }
    });
  }
}
