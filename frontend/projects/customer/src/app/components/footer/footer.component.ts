import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-footer',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <footer class="marketplace-footer">
      <div class="container footer-grid">
        <div class="footer-col brand-col">
          <div class="d-flex align-center gap-2 mb-3">
            <div class="footer-logo-icon">N</div>
            <div>
              <h3 class="footer-brand-title">NEARBYBAZAAR: Ghar Tak</h3>
              <p class="footer-tagline">Apki Apni Dukaan</p>
            </div>
          </div>
          <p class="brand-desc">
            Empowering neighborhood Indian kirana, fresh produce vendors, and local shops with 30-minute hyper-local doorstep delivery.
          </p>
          <div class="delivery-pledge mt-3">
            <i class="fa-solid fa-shield-heart text-orange mr-2"></i> 100% Genuine Neighborhood Products
          </div>
        </div>

        <div class="footer-col">
          <h4>Customer Care</h4>
          <ul>
            <li><a routerLink="/orders">Track My Order</a></li>
            <li><a routerLink="/cart">View Cart</a></li>
            <li><a routerLink="/products">All Categories</a></li>
            <li><a routerLink="/shops">Neighborhood Shops</a></li>
          </ul>
        </div>

        <div class="footer-col">
          <h4>Partner With Us</h4>
          <ul>
            <li><a routerLink="/apply-vendor">Apply as Shopkeeper / Vendor</a></li>
            <li><a href="http://localhost:4201" target="_blank">Vendor Portal Login</a></li>
            <li><a href="http://localhost:4202" target="_blank">Super Admin Control Center</a></li>
          </ul>
        </div>

        <div class="footer-col">
          <h4>Ghar Tak Ecosystem</h4>
          <p class="text-sm text-muted mb-2">Connected multi-portal platform:</p>
          <div class="portal-links-stack">
            <a href="http://localhost:4200" class="portal-chip customer-chip">
              <i class="fa-solid fa-bag-shopping"></i> Customer Storefront (:4200)
            </a>
            <a href="http://localhost:4201" target="_blank" class="portal-chip vendor-chip">
              <i class="fa-solid fa-store"></i> Vendor Dashboard (:4201)
            </a>
            <a href="http://localhost:4202" target="_blank" class="portal-chip admin-chip">
              <i class="fa-solid fa-shield-halved"></i> Super Admin Panel (:4202)
            </a>
          </div>
        </div>
      </div>

      <div class="bottom-credit">
        <div class="container d-flex justify-between align-center">
          <p>© 2026 NearbyBazaar: Ghar Tak — Apki Apni Dukaan. All rights reserved.</p>
          <p class="text-xs text-muted">Designed for Indian Neighborhood Commerce • Delhi NCR</p>
        </div>
      </div>
    </footer>
  `,
  styles: [`
    .marketplace-footer {
      background: #06172B;
      color: #E2E8F0;
      padding-top: 48px;
      margin-top: 60px;
      border-top: 3px solid #0879D1;
    }
    .container {
      max-width: 1320px;
      margin: 0 auto;
      padding: 0 16px;
    }
    .footer-grid {
      display: grid;
      grid-template-columns: 2fr 1fr 1fr 1.5fr;
      gap: 36px;
      padding-bottom: 40px;
    }
    .footer-logo-icon {
      width: 38px;
      height: 38px;
      background: linear-gradient(135deg, #FF8A24, #0879D1);
      border-radius: 8px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: 900;
      font-size: 20px;
      color: #FFF;
    }
    .footer-brand-title {
      font-size: 1.2rem;
      font-weight: 800;
      color: #FFF;
      line-height: 1.1;
    }
    .footer-tagline {
      font-size: 0.75rem;
      color: #35D9FF;
    }
    .brand-desc {
      font-size: 0.88rem;
      color: #94A3B8;
      line-height: 1.6;
    }
    .footer-col h4 {
      color: #FFF;
      font-size: 1.05rem;
      margin-bottom: 16px;
      font-weight: 700;
      border-left: 3px solid #FF8A24;
      padding-left: 8px;
    }
    .footer-col ul {
      list-style: none;
      padding: 0;
      li {
        margin-bottom: 10px;
        a {
          color: #94A3B8;
          font-size: 0.88rem;
          &:hover { color: #35D9FF; text-decoration: underline; }
        }
      }
    }
    .portal-chip {
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 6px 12px;
      border-radius: 6px;
      font-size: 0.82rem;
      font-weight: 600;
      margin-bottom: 8px;
      text-decoration: none;
      transition: all 0.2s;
    }
    .customer-chip { background: rgba(8, 121, 209, 0.2); color: #35D9FF; border: 1px solid rgba(53, 217, 255, 0.3); }
    .vendor-chip { background: rgba(255, 138, 36, 0.15); color: #FF8A24; border: 1px solid rgba(255, 138, 36, 0.3); }
    .admin-chip { background: rgba(25, 135, 84, 0.2); color: #4ADE80; border: 1px solid rgba(74, 222, 128, 0.3); }
    .portal-chip:hover { transform: translateX(4px); filter: brightness(1.2); }

    .bottom-credit {
      border-top: 1px solid rgba(255, 255, 255, 0.1);
      padding: 16px 0;
      font-size: 0.82rem;
      color: #64748B;
    }
    @media (max-width: 900px) {
      .footer-grid { grid-template-columns: 1fr; }
    }
  `]
})
export class FooterComponent {}
