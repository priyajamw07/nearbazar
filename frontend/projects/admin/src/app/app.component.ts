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
    <div class="admin-shell" [class.auth-shell]="isLoginPage">
      <!-- Dark/Neutral Admin Sidebar matching reference -->
      <aside class="admin-sidebar" *ngIf="!isLoginPage">
        <div class="sidebar-brand">
          <div class="brand-badge">
            <span class="logo-shield">🛡️</span>
            <div class="brand-text">
              <span class="brand-title">NearbyBazaar</span>
              <span class="brand-sub">Control Center</span>
            </div>
          </div>
        </div>

        <nav class="sidebar-nav">
          <a routerLink="/dashboard" routerLinkActive="active" class="nav-item">
            <span class="icon">📊</span>
            <span>Overview</span>
          </a>
          <a routerLink="/applications" routerLinkActive="active" class="nav-item">
            <span class="icon">📝</span>
            <span>Sellers & KYC</span>
          </a>
          <a routerLink="/users" routerLinkActive="active" class="nav-item">
            <span class="icon">👥</span>
            <span>Customers & Users</span>
          </a>
          <a routerLink="/shops" routerLinkActive="active" class="nav-item">
            <span class="icon">🏬</span>
            <span>Storefronts</span>
          </a>
          <a routerLink="/audit-logs" routerLinkActive="active" class="nav-item">
            <span class="icon">🔒</span>
            <span>Security & Audit</span>
          </a>
        </nav>

        <div class="sidebar-footer">
          <div class="admin-profile" *ngIf="currentUser">
            <div class="avatar">{{ (currentUser.full_name || 'A')[0] }}</div>
            <div class="user-meta">
              <span class="uname">{{ currentUser.full_name }}</span>
              <span class="role">Root Super Admin</span>
            </div>
          </div>
          <button class="btn-logout" (click)="logout()">
            <span class="icon">🚪</span>
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      <!-- Main Content Area -->
      <div class="admin-main">
        <header class="admin-topbar" *ngIf="!isLoginPage">
          <div class="topbar-left">
            <span class="topbar-title">SUPER ADMIN PANEL — Control Center</span>
            <span class="cluster-tag">US-EAST-WORKER ● HEALTHY</span>
          </div>
          <div class="topbar-right">
            <a href="http://localhost:4200" target="_blank" class="hub-link">
              <span>🌐 Customer Storefront</span>
            </a>
            <a href="http://localhost:4201" target="_blank" class="hub-link">
              <span>🏪 Vendor Hub</span>
            </a>
            <div class="admin-badge">ROOT ACCESS</div>
          </div>
        </header>

        <main class="admin-content">
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
      color: #0f172a;
    }
    .admin-shell {
      display: flex;
      min-height: 100vh;
      &.auth-shell { display: block; }
    }
    .admin-sidebar {
      width: 250px;
      background: #06172b;
      color: #f1f5f9;
      display: flex;
      flex-direction: column;
      position: sticky;
      top: 0;
      height: 100vh;
      z-index: 50;
      border-right: 1px solid #0b2d4d;
    }
    .sidebar-brand {
      padding: 22px 20px;
      border-bottom: 1px solid rgba(255, 255, 255, 0.08);
      .brand-badge { display: flex; align-items: center; gap: 12px; }
      .logo-shield {
        font-size: 24px;
        background: rgba(53, 217, 255, 0.15);
        border: 1px solid rgba(53, 217, 255, 0.3);
        width: 42px;
        height: 42px;
        border-radius: 10px;
        display: flex;
        align-items: center;
        justify-content: center;
      }
      .brand-title {
        display: block;
        font-size: 16px;
        font-weight: 800;
        color: #ffffff;
        font-family: 'Outfit', sans-serif;
      }
      .brand-sub {
        display: block;
        font-size: 11px;
        font-weight: 700;
        color: #35d9ff;
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
      padding: 11px 14px;
      border-radius: 8px;
      font-size: 14px;
      font-weight: 600;
      color: #94a3b8;
      text-decoration: none;
      transition: all 0.15s ease;
      .icon { font-size: 18px; }
      &:hover {
        background: rgba(255, 255, 255, 0.06);
        color: #35d9ff;
      }
      &.active {
        background: #0879d1;
        color: #ffffff;
        box-shadow: 0 4px 12px rgba(8, 121, 209, 0.3);
      }
    }
    .sidebar-footer {
      padding: 16px;
      border-top: 1px solid rgba(255, 255, 255, 0.08);
      background: rgba(0, 0, 0, 0.2);
    }
    .admin-profile {
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
      .uname { display: block; font-size: 13px; font-weight: 700; color: #ffffff; }
      .role { display: block; font-size: 11px; color: #35d9ff; font-weight: 600; }
    }
    .btn-logout {
      width: 100%;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 8px;
      padding: 8px;
      background: rgba(220, 53, 69, 0.15);
      border: 1px solid rgba(220, 53, 69, 0.3);
      border-radius: 6px;
      font-size: 12px;
      font-weight: 600;
      color: #f87171;
      cursor: pointer;
      &:hover { background: rgba(220, 53, 69, 0.25); }
    }
    .admin-main {
      flex: 1;
      display: flex;
      flex-direction: column;
      min-width: 0;
    }
    .admin-topbar {
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
    .topbar-title {
      font-size: 13px;
      font-weight: 800;
      color: #06172b;
      margin-right: 12px;
    }
    .cluster-tag {
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
      gap: 12px;
    }
    .hub-link {
      font-size: 12px;
      font-weight: 600;
      color: #0879d1;
      background: #f0f9ff;
      border: 1px solid #bae6fd;
      padding: 6px 12px;
      border-radius: 6px;
      &:hover { background: #e0f2fe; }
    }
    .admin-badge {
      background: #06172b;
      color: #35d9ff;
      font-size: 11px;
      font-weight: 800;
      padding: 5px 10px;
      border-radius: 6px;
      letter-spacing: 0.5px;
    }
    .admin-content {
      flex: 1;
      padding: 32px;
    }
    @media (max-width: 900px) {
      .admin-sidebar {
        width: 70px;
        .brand-text, .nav-item span:not(.icon), .admin-profile .user-meta, .btn-logout span:not(.icon) {
          display: none;
        }
      }
      .admin-content { padding: 16px; }
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
