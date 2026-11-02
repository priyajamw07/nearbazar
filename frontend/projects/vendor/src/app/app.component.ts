import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { ApiService } from '@shared/services/api.service';
import { User } from '@shared/models/models';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="vendor-shell" [class.auth-shell]="isLoginPage">
      <!-- Sidebar -->
      <aside class="vendor-sidebar" *ngIf="!isLoginPage">
        <div class="sidebar-brand">
          <div class="brand-badge">
            <span class="logo-icon">🏪</span>
            <div class="brand-text">
              <span class="brand-title">NearbyBazaar</span>
              <span class="brand-sub">Vendor Hub</span>
            </div>
          </div>
        </div>

        <nav class="sidebar-nav">
          <a routerLink="/dashboard" routerLinkActive="active" class="nav-item">
            <span class="icon">📊</span>
            <span>Dashboard</span>
          </a>
          <a routerLink="/products" routerLinkActive="active" class="nav-item">
            <span class="icon">🏷️</span>
            <span>Products</span>
          </a>
          <a routerLink="/orders" routerLinkActive="active" class="nav-item">
            <span class="icon">📦</span>
            <span>Orders Queue</span>
          </a>
          <a routerLink="/inventory" routerLinkActive="active" class="nav-item">
            <span class="icon">📋</span>
            <span>Inventory</span>
          </a>
        </nav>

        <div class="sidebar-footer">
          <div class="shop-badge" *ngIf="currentUser">
            <div class="avatar">{{ (currentUser.full_name || 'V')[0] }}</div>
            <div class="user-meta">
              <span class="uname">{{ currentUser.full_name }}</span>
              <span class="role">Verified Merchant</span>
            </div>
          </div>
          <button class="btn-logout" (click)="logout()">
            <span class="icon">🚪</span>
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      <!-- Main Layout -->
      <div class="vendor-main">
        <header class="vendor-topbar" *ngIf="!isLoginPage">
          <div class="topbar-left">
            <span class="portal-tag">VENDOR HUB — GHAR TAK</span>
            <span class="live-dot">● STORE OPEN</span>
          </div>
          <div class="topbar-right">
            <a href="http://localhost:4200" target="_blank" class="storefront-link">
              <span>🌐 View Live Storefront</span>
            </a>
            <div class="notify-icon">🔔</div>
          </div>
        </header>

        <main class="vendor-content">
          <router-outlet></router-outlet>
        </main>
      </div>
    </div>
  `,
  styles: [`
    :host {
      display: block;
      min-height: 100vh;
      background: #f4f7fa;
      font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      color: #1e293b;
    }
    .vendor-shell {
      display: flex;
      min-height: 100vh;
      &.auth-shell {
        display: block;
      }
    }
    .vendor-sidebar {
      width: 250px;
      background: #ffffff;
      border-right: 1px solid #e2e8f0;
      display: flex;
      flex-direction: column;
      position: sticky;
      top: 0;
      height: 100vh;
      z-index: 50;
    }
    .sidebar-brand {
      padding: 24px 20px;
      border-bottom: 1px solid #f1f5f9;
      .brand-badge {
        display: flex;
        align-items: center;
        gap: 12px;
      }
      .logo-icon {
        font-size: 28px;
        background: #f0fdf4;
        border: 1px solid #bbf7d0;
        width: 44px;
        height: 44px;
        border-radius: 10px;
        display: flex;
        align-items: center;
        justify-content: center;
      }
      .brand-title {
        display: block;
        font-size: 16px;
        font-weight: 800;
        color: #06172b;
        letter-spacing: -0.3px;
      }
      .brand-sub {
        display: block;
        font-size: 11px;
        font-weight: 700;
        color: #0879d1;
        text-transform: uppercase;
        letter-spacing: 0.5px;
      }
    }
    .sidebar-nav {
      flex: 1;
      padding: 20px 12px;
      display: flex;
      flex-direction: column;
      gap: 6px;
    }
    .nav-item {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 10px 14px;
      border-radius: 8px;
      font-size: 14px;
      font-weight: 600;
      color: #64748b;
      text-decoration: none;
      transition: all 0.15s ease;
      .icon {
        font-size: 18px;
      }
      &:hover {
        background: #f8fafc;
        color: #0879d1;
      }
      &.active {
        background: #e0f2fe;
        color: #0369a1;
      }
    }
    .sidebar-footer {
      padding: 16px;
      border-top: 1px solid #f1f5f9;
      background: #fafafa;
    }
    .shop-badge {
      display: flex;
      align-items: center;
      gap: 10px;
      margin-bottom: 12px;
      .avatar {
        width: 36px;
        height: 36px;
        border-radius: 50%;
        background: #0879d1;
        color: white;
        font-weight: 700;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 14px;
      }
      .uname {
        display: block;
        font-size: 13px;
        font-weight: 700;
        color: #0f172a;
      }
      .role {
        display: block;
        font-size: 11px;
        color: #16a34a;
        font-weight: 600;
      }
    }
    .btn-logout {
      width: 100%;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 8px;
      padding: 8px;
      background: white;
      border: 1px solid #e2e8f0;
      border-radius: 6px;
      font-size: 12px;
      font-weight: 600;
      color: #dc2626;
      cursor: pointer;
      &:hover {
        background: #fef2f2;
      }
    }
    .vendor-main {
      flex: 1;
      display: flex;
      flex-direction: column;
      min-width: 0;
    }
    .vendor-topbar {
      height: 64px;
      background: #ffffff;
      border-bottom: 1px solid #e2e8f0;
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 0 32px;
      position: sticky;
      top: 0;
      z-index: 40;
    }
    .portal-tag {
      font-size: 12px;
      font-weight: 800;
      color: #06172b;
      letter-spacing: 0.5px;
      margin-right: 12px;
    }
    .live-dot {
      font-size: 11px;
      font-weight: 700;
      color: #16a34a;
      background: #dcfce7;
      padding: 3px 8px;
      border-radius: 12px;
    }
    .topbar-right {
      display: flex;
      align-items: center;
      gap: 16px;
    }
    .storefront-link {
      font-size: 13px;
      font-weight: 600;
      color: #0879d1;
      text-decoration: none;
      background: #f0f9ff;
      border: 1px solid #bae6fd;
      padding: 6px 12px;
      border-radius: 6px;
      &:hover {
        background: #e0f2fe;
      }
    }
    .notify-icon {
      font-size: 18px;
      cursor: pointer;
      padding: 6px;
    }
    .vendor-content {
      flex: 1;
      padding: 32px;
    }
    @media (max-width: 900px) {
      .vendor-sidebar {
        width: 70px;
        .brand-text, .nav-item span:not(.icon), .shop-badge .user-meta, .btn-logout span:not(.icon) {
          display: none;
        }
      }
      .vendor-content {
        padding: 16px;
      }
    }
  `]
})
export class AppComponent implements OnInit {
  currentUser: User | null = null;

  get isLoginPage(): boolean {
    return this.router.url.includes('/login');
  }

  constructor(private api: ApiService, private router: Router) {}

  ngOnInit(): void {
    this.api.currentUser$.subscribe((user: User | null) => {
      this.currentUser = user;
    });
  }

  logout(): void {
    this.api.logout();
    this.router.navigate(['/login']);
  }
}
