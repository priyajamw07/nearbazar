import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../../../../shared/services/api.service';
import { User } from '../../../../../shared/models/models';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  template: `
    <header class="marketplace-header">
      <!-- Top Micro Banner -->
      <div class="top-bar">
        <div class="container d-flex justify-between align-center">
          <div class="location-picker">
            <i class="fa-solid fa-location-dot text-orange"></i>
            <span>Deliver to: <strong>Sector 14, Delhi NCR 110001</strong></span>
            <i class="fa-solid fa-chevron-down text-xs ml-1"></i>
          </div>
          <div class="top-nav-links d-flex align-center gap-3">
            <a routerLink="/apply-vendor" class="link-highlight">
              <i class="fa-solid fa-store mr-1 text-orange"></i> Sell on NearbyBazaar
            </a>
            <span class="divider">|</span>
            <!-- Direct switchers to other portals -->
            <a href="http://localhost:4201" target="_blank" class="portal-badge vendor-badge">
              <i class="fa-solid fa-chart-line mr-1"></i> Vendor Hub
            </a>
            <a href="http://localhost:4202" target="_blank" class="portal-badge admin-badge">
              <i class="fa-solid fa-shield-halved mr-1"></i> Admin Panel
            </a>
          </div>
        </div>
      </div>

      <!-- Main Navigation Bar -->
      <div class="main-bar">
        <div class="container d-flex align-center justify-between gap-3">
          <!-- Brand Logo matching visual reference -->
          <a routerLink="/" class="brand-logo d-flex align-center gap-2">
            <div class="logo-icon">
              <span class="icon-awning"></span>
              <span class="logo-letter">N</span>
            </div>
            <div class="brand-text">
              <div class="brand-title">
                <span class="text-orange">NEARBY</span><span class="text-blue">BAZAAR</span><span class="brand-colon">:</span> <span class="text-dark-blue">Ghar Tak</span>
              </div>
              <div class="brand-subtitle">Apki Apni Dukaan</div>
            </div>
          </a>

          <!-- Global Marketplace Search -->
          <div class="global-search-container">
            <form (ngSubmit)="onSearch()" class="search-form d-flex align-center">
              <span class="search-prefix"><i class="fa-solid fa-magnifying-glass"></i></span>
              <input
                type="text"
                [(ngModel)]="searchQuery"
                name="searchQuery"
                placeholder="Search local kirana, fresh vegetables, electronics..."
                class="search-input"
              />
              <button type="submit" class="search-submit-btn">
                <span>Search</span>
              </button>
            </form>
          </div>

          <!-- Account & Cart Actions -->
          <div class="header-actions d-flex align-center gap-3">
            <!-- Account -->
            <ng-container *ngIf="currentUser; else guestAuth">
              <div class="user-menu-dropdown">
                <button class="account-btn d-flex align-center gap-2">
                  <div class="avatar-circle">
                    <i class="fa-solid fa-user"></i>
                  </div>
                  <div class="text-left user-label">
                    <span class="hello-text text-xs">Namaste,</span>
                    <strong class="user-name text-sm">{{ currentUser.full_name.split(' ')[0] }}</strong>
                  </div>
                </button>
                <div class="dropdown-content">
                  <a routerLink="/orders"><i class="fa-solid fa-box mr-2"></i> My Orders</a>
                  <a routerLink="/apply-vendor" *ngIf="currentUser.role === 'CUSTOMER'"><i class="fa-solid fa-shop mr-2"></i> Apply for Shop</a>
                  <a href="http://localhost:4201" *ngIf="currentUser.role === 'VENDOR_ADMIN'"><i class="fa-solid fa-store mr-2"></i> Go to Shop Dashboard</a>
                  <a href="http://localhost:4202" *ngIf="currentUser.role === 'SUPER_ADMIN'"><i class="fa-solid fa-shield mr-2"></i> Go to Admin Panel</a>
                  <hr>
                  <button (click)="logout()" class="logout-link"><i class="fa-solid fa-right-from-bracket mr-2"></i> Logout</button>
                </div>
              </div>
            </ng-container>

            <ng-template #guestAuth>
              <a routerLink="/login" class="login-btn d-flex align-center gap-1">
                <i class="fa-regular fa-user"></i>
                <span>Sign In</span>
              </a>
            </ng-template>

            <!-- Orders Shortcut -->
            <a routerLink="/orders" class="action-item d-flex align-center gap-1">
              <i class="fa-solid fa-clock-rotate-left"></i>
              <span class="action-label">Orders</span>
            </a>

            <!-- Cart Shortcut -->
            <a routerLink="/cart" class="cart-pill-btn d-flex align-center gap-2">
              <div class="cart-icon-wrapper">
                <i class="fa-solid fa-cart-shopping"></i>
                <span class="cart-count-badge" *ngIf="cartItemCount > 0">{{ cartItemCount }}</span>
              </div>
              <span class="cart-label">Cart</span>
            </a>
          </div>
        </div>
      </div>

      <!-- Categories Navigation Strip -->
      <nav class="categories-strip">
        <div class="container d-flex align-center gap-4">
          <a routerLink="/products" class="nav-pill" routerLinkActive="active" [routerLinkActiveOptions]="{exact: true}">
            <i class="fa-solid fa-border-all mr-1"></i> All Products
          </a>
          <a routerLink="/shops" class="nav-pill" routerLinkActive="active">
            <i class="fa-solid fa-store mr-1 text-orange"></i> Neighborhood Shops
          </a>
          <a routerLink="/products" [queryParams]="{category: 'vegetables'}" class="nav-pill">
            <i class="fa-solid fa-leaf mr-1 text-success"></i> Fresh Veggies
          </a>
          <a routerLink="/products" [queryParams]="{category: 'groceries'}" class="nav-pill">
            <i class="fa-solid fa-basket-shopping mr-1 text-orange"></i> Kirana & Atta
          </a>
          <a routerLink="/products" [queryParams]="{category: 'electronics'}" class="nav-pill">
            <i class="fa-solid fa-bolt mr-1 text-cyan"></i> Electronics Care
          </a>
          <a routerLink="/products" [queryParams]="{category: 'fashion'}" class="nav-pill">
            <i class="fa-solid fa-shirt mr-1"></i> Fashion Trendz
          </a>
          <span class="express-badge ml-auto">
            <i class="fa-solid fa-bolt-lightning text-orange mr-1"></i> Ghar Tak in 30 Mins
          </span>
        </div>
      </nav>
    </header>
  `,
  styles: [`
    .marketplace-header {
      background: #FFFFFF;
      box-shadow: 0 2px 10px rgba(6, 23, 43, 0.08);
      position: sticky;
      top: 0;
      z-index: 1000;
    }
    .container {
      max-width: 1320px;
      margin: 0 auto;
      padding: 0 16px;
    }
    .d-flex { display: flex; }
    .align-center { align-items: center; }
    .justify-between { justify-content: space-between; }
    .gap-1 { gap: 6px; }
    .gap-2 { gap: 12px; }
    .gap-3 { gap: 18px; }
    .gap-4 { gap: 24px; }
    .ml-auto { margin-left: auto; }
    .text-xs { font-size: 0.75rem; }
    .text-sm { font-size: 0.875rem; }
    .text-orange { color: #FF8A24; }
    .text-blue { color: #0879D1; }
    .text-dark-blue { color: #0B2D4D; }
    .text-cyan { color: #35D9FF; }
    .text-success { color: #198754; }

    .top-bar {
      background: #06172B;
      color: #F4F7FA;
      font-size: 0.8rem;
      padding: 6px 0;
      border-bottom: 1px solid rgba(255, 255, 255, 0.1);
    }
    .location-picker {
      cursor: pointer;
      display: flex;
      align-items: center;
      gap: 6px;
    }
    .divider { opacity: 0.4; }
    .portal-badge {
      padding: 3px 8px;
      border-radius: 4px;
      font-size: 0.72rem;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }
    .vendor-badge {
      background: rgba(8, 121, 209, 0.25);
      color: #35D9FF;
      border: 1px solid #0879D1;
      &:hover { background: #0879D1; color: #FFF; }
    }
    .admin-badge {
      background: rgba(255, 138, 36, 0.2);
      color: #FF8A24;
      border: 1px solid #FF8A24;
      &:hover { background: #FF8A24; color: #FFF; }
    }

    .main-bar {
      padding: 12px 0;
      border-bottom: 1px solid #E2E8F0;
    }
    .brand-logo {
      text-decoration: none;
    }
    .logo-icon {
      width: 44px;
      height: 44px;
      background: linear-gradient(135deg, #FF8A24 0%, #0879D1 100%);
      border-radius: 10px;
      display: flex;
      align-items: center;
      justify-content: center;
      color: #FFFFFF;
      font-family: 'Outfit', sans-serif;
      font-weight: 900;
      font-size: 24px;
      box-shadow: 0 4px 10px rgba(255, 138, 36, 0.3);
    }
    .brand-title {
      font-family: 'Outfit', sans-serif;
      font-weight: 800;
      font-size: 1.35rem;
      line-height: 1.1;
      letter-spacing: -0.5px;
    }
    .brand-colon {
      color: #0879D1;
      margin: 0 2px;
    }
    .brand-subtitle {
      font-size: 0.75rem;
      color: #64748B;
      font-weight: 500;
      letter-spacing: 0.5px;
    }

    .global-search-container {
      flex: 1;
      max-width: 580px;
    }
    .search-form {
      border: 2px solid #0879D1;
      border-radius: 8px;
      background: #FFFFFF;
      overflow: hidden;
    }
    .search-prefix {
      padding: 0 12px;
      color: #0879D1;
      font-size: 0.95rem;
    }
    .search-input {
      border: none;
      outline: none;
      padding: 10px 4px;
      width: 100%;
      font-size: 0.92rem;
      font-family: inherit;
    }
    .search-submit-btn {
      background: #FF8A24;
      color: #FFFFFF;
      padding: 10px 22px;
      font-weight: 700;
      font-size: 0.92rem;
      &:hover { background: darken(#FF8A24, 7%); }
    }

    .header-actions {
      .login-btn, .action-item {
        color: #0B2D4D;
        font-weight: 600;
        font-size: 0.9rem;
        padding: 6px 12px;
        border-radius: 6px;
        &:hover { background: #F4F7FA; color: #0879D1; }
      }
    }
    .cart-pill-btn {
      background: #0879D1;
      color: #FFFFFF;
      padding: 8px 18px;
      border-radius: 8px;
      font-weight: 700;
      font-size: 0.92rem;
      box-shadow: 0 4px 12px rgba(8, 121, 209, 0.25);
      &:hover { background: darken(#0879D1, 8%); transform: translateY(-1px); }
    }
    .cart-icon-wrapper {
      position: relative;
    }
    .cart-count-badge {
      position: absolute;
      top: -8px;
      right: -10px;
      background: #FF8A24;
      color: #FFFFFF;
      font-size: 0.7rem;
      font-weight: 800;
      padding: 1px 5px;
      border-radius: 10px;
      border: 1px solid #FFFFFF;
    }

    .user-menu-dropdown {
      position: relative;
      display: inline-block;
      &:hover .dropdown-content { display: block; }
    }
    .account-btn {
      background: none;
      padding: 4px 8px;
      border-radius: 6px;
      color: #0B2D4D;
    }
    .avatar-circle {
      width: 32px;
      height: 32px;
      background: rgba(8, 121, 209, 0.1);
      color: #0879D1;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
    }
    .dropdown-content {
      display: none;
      position: absolute;
      right: 0;
      background: #FFFFFF;
      min-width: 200px;
      box-shadow: 0 10px 25px rgba(0,0,0,0.15);
      border-radius: 8px;
      padding: 8px 0;
      z-index: 100;
      border: 1px solid #E2E8F0;
      a, button {
        display: block;
        padding: 8px 16px;
        color: #1E293B;
        font-size: 0.88rem;
        width: 100%;
        text-align: left;
        background: none;
        &:hover { background: #F8FAFC; color: #0879D1; }
      }
      hr { margin: 6px 0; border: none; border-top: 1px solid #E2E8F0; }
    }

    .categories-strip {
      background: #F8FAFC;
      border-bottom: 1px solid #E2E8F0;
      padding: 8px 0;
      font-size: 0.88rem;
    }
    .nav-pill {
      color: #475569;
      font-weight: 500;
      padding: 4px 8px;
      border-radius: 4px;
      &:hover, &.active { color: #0879D1; font-weight: 600; background: rgba(8, 121, 209, 0.08); }
    }
    .express-badge {
      font-size: 0.82rem;
      font-weight: 700;
      color: #0B2D4D;
    }
  `]
})
export class HeaderComponent implements OnInit {
  currentUser: User | null = null;
  searchQuery = '';
  cartItemCount = 0;

  constructor(private apiService: ApiService, private router: Router) {}

  ngOnInit(): void {
    this.apiService.currentUser$.subscribe(user => {
      this.currentUser = user;
      if (user) {
        this.loadCartCount();
      }
    });
    this.loadCartCount();
  }

  loadCartCount(): void {
    this.apiService.getCart().subscribe({
      next: (res) => {
        if (res.success && res.cart) {
          this.cartItemCount = res.cart.item_count || 0;
        }
      },
      error: () => {}
    });
  }

  onSearch(): void {
    if (this.searchQuery.trim()) {
      this.router.navigate(['/products'], { queryParams: { q: this.searchQuery.trim() } });
    }
  }

  logout(): void {
    this.apiService.logout();
    this.router.navigate(['/']);
  }
}
