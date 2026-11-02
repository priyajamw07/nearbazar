import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../../../../shared/services/api.service';
import { Product, Shop, Category } from '../../../../../shared/models/models';

@Component({
  selector: 'app-landing',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  template: `
    <div class="landing-ecosystem">
      <!-- Top Brand Header matching reference image -->
      <section class="brand-hero-header text-center">
        <div class="hero-brand-badge d-inline-flex align-center gap-2">
          <div class="hero-logo-box">
            <span class="awning-stripe"></span>
            <span class="logo-n">N</span>
          </div>
          <div class="text-left">
            <h1 class="master-title">
              <span class="text-orange">NEARBY</span><span class="text-blue">BAZAAR</span><span class="text-blue">:</span>
              <span class="text-light-blue"> Ghar Tak</span>
            </h1>
            <p class="master-subtitle">Apki Apni Dukaan</p>
          </div>
        </div>
      </section>

      <!-- Center Showcase with Indian Bazaar Street Backdrop & Rider -->
      <section class="master-visual-stage">
        <!-- Background Indian Bazaar Street Scene -->
        <div class="bazaar-backdrop-container">
          <img src="assets/reference_hero.jpg" alt="Indian Bazaar Street Scene" class="bazaar-bg-image" />
          <div class="backdrop-dark-gradient"></div>
        </div>

        <!-- Central Laptop Mockup: Live Storefront -->
        <div class="central-laptop-wrapper">
          <div class="laptop-chassis">
            <div class="laptop-screen">
              <!-- Inside Screen: Top Nav -->
              <div class="screen-header d-flex justify-between align-center">
                <div class="d-flex align-center gap-2">
                  <div class="screen-logo">N</div>
                  <div class="screen-brand-text">
                    <strong>NEARBYBAZAAR: Ghar Tak</strong>
                    <small>Apki Apni Dukaan</small>
                  </div>
                </div>
                <div class="screen-user-actions d-flex align-center gap-3">
                  <span><i class="fa-regular fa-user"></i> Account</span>
                  <span><i class="fa-solid fa-box"></i> Orders</span>
                  <span class="cart-pill"><i class="fa-solid fa-cart-shopping"></i> Cart ({{ cartCount }})</span>
                  <span class="delivery-flag"><i class="fa-solid fa-bolt text-orange"></i> Ghar Tak</span>
                </div>
              </div>

              <!-- Inside Screen: Hero Banner & Search -->
              <div class="screen-search-hero">
                <h2 class="search-hero-title">Local Shops, Delivered Home</h2>
                <div class="screen-search-box d-flex">
                  <input
                    type="text"
                    [(ngModel)]="searchQuery"
                    placeholder="Search local markets, kirana, fresh veggies..."
                    (keyup.enter)="onSearch()"
                  />
                  <button (click)="onSearch()" class="screen-search-btn">
                    <i class="fa-solid fa-magnifying-glass"></i>
                  </button>
                </div>
              </div>

              <!-- Inside Screen: Category Quick Pills -->
              <div class="screen-categories d-flex gap-2">
                <div class="cat-chip active"><i class="fa-solid fa-basket-shopping"></i> Groceries</div>
                <div class="cat-chip"><i class="fa-solid fa-leaf text-success"></i> Fresh Veggies</div>
                <div class="cat-chip"><i class="fa-solid fa-bolt text-cyan"></i> Electronics</div>
                <div class="cat-chip"><i class="fa-solid fa-shirt"></i> Fashion</div>
                <div class="cat-chip"><i class="fa-solid fa-cookie"></i> Snacks</div>
              </div>

              <!-- Inside Screen: Product Showcase Grid -->
              <div class="screen-products-grid">
                <div class="product-mini-card" *ngFor="let p of featuredProducts">
                  <div class="prod-badge-tag">{{ p.category_name }}</div>
                  <div class="prod-img-container">
                    <img [src]="p.image_url" [alt]="p.name" (error)="onImgError($event, p.category_name)" />
                  </div>
                  <div class="prod-info">
                    <h4 class="prod-name" [title]="p.name">{{ p.name }}</h4>
                    <p class="prod-shop"><i class="fa-solid fa-store mr-1 text-orange"></i> {{ p.shop_name }}</p>
                    <div class="d-flex justify-between align-center mt-1">
                      <div class="rating-stars">
                        <i class="fa-solid fa-star text-warning"></i>
                        <span>4.8</span>
                      </div>
                      <div class="prod-price">₹{{ (p.price_cents / 100).toFixed(0) }}</div>
                    </div>
                    <button class="add-to-cart-mini-btn" (click)="addToCart(p)">
                      ADD TO CART
                    </button>
                  </div>
                </div>
              </div>
            </div>
            <!-- Laptop Hinge & Base -->
            <div class="laptop-hinge"></div>
            <div class="laptop-base">
              <div class="laptop-trackpad"></div>
            </div>
          </div>

          <!-- Bottom Label for Laptop -->
          <div class="showcase-caption">
            <h3>CUSTOMER STOREFRONT</h3>
            <p>Responsive Indian Neighborhood Marketplace</p>
          </div>
        </div>

        <!-- Glowing Neon Circuits & Junction Nodes connecting to the 3 Portals -->
        <div class="circuits-overlay">
          <svg class="circuit-svg" width="100%" height="180" viewBox="0 0 1200 180" preserveAspectRatio="none">
            <!-- Left Branch Line to Customer -->
            <path d="M 600 0 L 600 60 L 220 60 L 220 180" stroke="#35D9FF" stroke-width="3" fill="none" class="pulse-line" />
            <!-- Middle Trunk Line to Vendor -->
            <path d="M 600 0 L 600 180" stroke="#35D9FF" stroke-width="3" fill="none" class="pulse-line" />
            <!-- Right Branch Line to Super Admin -->
            <path d="M 600 0 L 600 60 L 980 60 L 980 180" stroke="#35D9FF" stroke-width="3" fill="none" class="pulse-line" />

            <!-- Glowing Nodes -->
            <circle cx="600" cy="0" r="6" fill="#35D9FF" class="node-glow" />
            <circle cx="600" cy="60" r="6" fill="#35D9FF" class="node-glow" />
            <circle cx="220" cy="60" r="6" fill="#35D9FF" class="node-glow" />
            <circle cx="980" cy="60" r="6" fill="#35D9FF" class="node-glow" />
            <circle cx="220" cy="180" r="6" fill="#35D9FF" class="node-glow" />
            <circle cx="600" cy="180" r="6" fill="#35D9FF" class="node-glow" />
            <circle cx="980" cy="180" r="6" fill="#35D9FF" class="node-glow" />
          </svg>
        </div>
      </section>

      <!-- Three Connected Interface Panels matching Reference Image -->
      <section class="three-portals-section">
        <div class="container-wide">
          <div class="portals-grid">
            <!-- PANEL 1: CUSTOMER STOREFRONT -->
            <div class="portal-panel neon-card-hover" (click)="navigateTo('/products')">
              <div class="panel-device-header">
                <span class="device-dot dot-red"></span>
                <span class="device-dot dot-yellow"></span>
                <span class="device-dot dot-green"></span>
                <span class="panel-device-title">customer-storefront :4200</span>
              </div>
              <div class="panel-screen-body">
                <div class="storefront-preview">
                  <div class="preview-hero-strip d-flex justify-between align-center">
                    <div>
                      <h5>Local Shops, Delivered Home</h5>
                      <small>Kirana, Fresh Veggies, Electronics & Fashion</small>
                    </div>
                    <span class="badge badge-success"><i class="fa-solid fa-circle-check mr-1"></i> Live</span>
                  </div>
                  <div class="preview-mini-categories d-flex gap-2 my-2">
                    <span class="tag-pill"><i class="fa-solid fa-carrot text-orange"></i> Subzi</span>
                    <span class="tag-pill"><i class="fa-solid fa-bowl-rice text-blue"></i> Dal & Atta</span>
                    <span class="tag-pill"><i class="fa-solid fa-mobile-screen text-cyan"></i> Mobile</span>
                  </div>
                  <div class="preview-cards-row d-flex gap-2">
                    <div class="preview-thumb-card" *ngFor="let p of featuredProducts.slice(0, 3)">
                      <div class="thumb-img">
                        <img [src]="p.image_url" [alt]="p.name" (error)="onImgError($event, p.category_name)" />
                      </div>
                      <div class="thumb-text">
                        <strong>{{ p.name }}</strong>
                        <div class="d-flex justify-between align-center mt-1">
                          <span class="text-orange text-xs font-bold">₹{{ (p.price_cents / 100).toFixed(0) }}</span>
                          <span class="btn-micro">Add</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div class="panel-footer-label">
                <h3>CUSTOMER STOREFRONT</h3>
                <p>Responsive UI • Indian Marketplace</p>
                <a routerLink="/products" class="portal-access-btn btn-cyan mt-2">
                  <span>Enter Storefront</span> <i class="fa-solid fa-arrow-right ml-1"></i>
                </a>
              </div>
            </div>

            <!-- PANEL 2: VENDOR/SHOPKEEPER DASHBOARD -->
            <div class="portal-panel neon-card-hover">
              <div class="panel-device-header">
                <span class="device-dot dot-red"></span>
                <span class="device-dot dot-yellow"></span>
                <span class="device-dot dot-green"></span>
                <span class="panel-device-title">vendor-dashboard :4201</span>
              </div>
              <div class="panel-screen-body">
                <div class="vendor-preview">
                  <!-- Vendor Header with Metrics matching reference image: ₹12,450 / 18 / 312 -->
                  <div class="vendor-kpi-row d-flex gap-2">
                    <div class="vendor-kpi-box kpi-blue">
                      <small>Total Sales</small>
                      <h4>₹12,450</h4>
                    </div>
                    <div class="vendor-kpi-box kpi-purple">
                      <small>New Orders</small>
                      <h4>18</h4>
                    </div>
                    <div class="vendor-kpi-box kpi-green">
                      <small>Products Live</small>
                      <h4>312</h4>
                    </div>
                  </div>

                  <!-- Add New Product Button -->
                  <div class="d-flex justify-between align-center my-2">
                    <strong class="text-xs text-dark-blue">Recent Orders</strong>
                    <button class="btn-mini-add"><i class="fa-solid fa-plus mr-1"></i> Add New Product</button>
                  </div>

                  <!-- Recent Orders Table matching reference image -->
                  <div class="vendor-table-wrapper">
                    <table class="vendor-mini-table">
                      <thead>
                        <tr>
                          <th>Order #</th>
                          <th>Customer</th>
                          <th>Items</th>
                          <th>Amount</th>
                          <th>Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr>
                          <td>220101</td>
                          <td>Verma</td>
                          <td>Atta, Oil</td>
                          <td>₹110</td>
                          <td><span class="badge-packed">Packed</span></td>
                        </tr>
                        <tr>
                          <td>220102</td>
                          <td>Devi</td>
                          <td>Tomatoes</td>
                          <td>₹75</td>
                          <td><span class="badge-packed">Packed</span></td>
                        </tr>
                        <tr>
                          <td>220103</td>
                          <td>Mehta</td>
                          <td>Bhujia x2</td>
                          <td>₹190</td>
                          <td><span class="badge-packed">Packed</span></td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
              <div class="panel-footer-label">
                <h3>VENDOR/SHOPKEEPER DASHBOARD</h3>
                <p>Vendor Hub • Operations & Inventory</p>
                <a href="http://localhost:4201" target="_blank" class="portal-access-btn btn-orange mt-2">
                  <span>Open Vendor Hub (:4201)</span> <i class="fa-solid fa-arrow-up-right-from-square ml-1"></i>
                </a>
              </div>
            </div>

            <!-- PANEL 3: SUPER ADMIN PANEL -->
            <div class="portal-panel neon-card-hover">
              <div class="panel-device-header">
                <span class="device-dot dot-red"></span>
                <span class="device-dot dot-yellow"></span>
                <span class="device-dot dot-green"></span>
                <span class="panel-device-title">super-admin :4202</span>
              </div>
              <div class="panel-screen-body">
                <div class="admin-preview">
                  <!-- Admin Metrics matching reference image: ₹1.8M / 1,250 / 24 -->
                  <div class="admin-kpi-row d-flex gap-2">
                    <div class="admin-kpi-box">
                      <small>Total Revenue</small>
                      <h4>₹1.8M</h4>
                    </div>
                    <div class="admin-kpi-box">
                      <small>Active Vendors</small>
                      <h4>1,250</h4>
                    </div>
                    <div class="admin-kpi-box kpi-alert">
                      <small>Pending Approvals</small>
                      <h4>24</h4>
                    </div>
                  </div>

                  <!-- Charts Mini Preview -->
                  <div class="charts-mini-grid d-flex gap-2 my-2">
                    <div class="chart-mini-card">
                      <div class="chart-header-row"><small>Sales Growth</small></div>
                      <div class="chart-mockup-curve curve-growth"></div>
                    </div>
                    <div class="chart-mini-card">
                      <div class="chart-header-row"><small>Order Trends</small></div>
                      <div class="chart-mockup-curve curve-trends"></div>
                    </div>
                  </div>

                  <!-- Vendor Approval Queue Snippet -->
                  <div class="admin-queue-snippet">
                    <div class="d-flex justify-between align-center mb-1">
                      <strong class="text-xs">Vendor Approval Queue</strong>
                      <span class="badge badge-warning text-xs">Action Required</span>
                    </div>
                    <div class="queue-row d-flex justify-between align-center">
                      <div>
                        <strong>Leela Bazaar Veggies</strong>
                        <small class="d-block text-muted">Applicant: Leela Ram • GST Verified</small>
                      </div>
                      <span class="btn-micro-review">Review</span>
                    </div>
                  </div>
                </div>
              </div>
              <div class="panel-footer-label">
                <h3>SUPER ADMIN PANEL</h3>
                <p>Control Center • Platform Governance</p>
                <a href="http://localhost:4202" target="_blank" class="portal-access-btn btn-cyan mt-2">
                  <span>Open Control Center (:4202)</span> <i class="fa-solid fa-arrow-up-right-from-square ml-1"></i>
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- Neighborhood Shops Showcase Section -->
      <section class="shops-showcase-section py-5">
        <div class="container">
          <div class="section-title-bar d-flex justify-between align-center mb-4">
            <div>
              <h2 class="section-heading text-white">Your Neighborhood Shops</h2>
              <p class="section-sub text-muted">Shop directly from trusted local stores with 30-min doorstep delivery</p>
            </div>
            <a routerLink="/shops" class="btn-outline">View All Shops <i class="fa-solid fa-chevron-right ml-1"></i></a>
          </div>

          <div class="shops-grid">
            <div class="shop-card-clean" *ngFor="let s of featuredShops" (click)="navigateToShop(s.id)">
              <div class="shop-badge-status" [class.open]="s.is_open">
                <i class="fa-solid fa-circle mr-1"></i> {{ s.is_open ? 'OPEN NOW' : 'CLOSED' }}
              </div>
              <div class="shop-card-header d-flex align-center gap-3">
                <div class="shop-avatar">
                  <i class="fa-solid fa-shop"></i>
                </div>
                <div>
                  <h4 class="shop-name">{{ s.name }}</h4>
                  <p class="shop-cat text-xs text-orange">{{ s.category }}</p>
                </div>
              </div>
              <p class="shop-desc text-sm">{{ s.description }}</p>
              <div class="shop-meta-footer d-flex justify-between align-center mt-3 pt-2">
                <div class="shop-rating">
                  <i class="fa-solid fa-star text-warning"></i>
                  <strong>{{ s.rating }}</strong>
                  <span class="text-xs text-muted">({{ s.review_count }} reviews)</span>
                </div>
                <span class="delivery-time text-xs"><i class="fa-solid fa-clock mr-1"></i> ~25 mins</span>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  `,
  styles: [`
    .landing-ecosystem {
      background-color: #06172B;
      color: #FFFFFF;
      min-height: 100vh;
      overflow-x: hidden;
    }
    .container {
      max-width: 1280px;
      margin: 0 auto;
      padding: 0 16px;
    }
    .container-wide {
      max-width: 1420px;
      margin: 0 auto;
      padding: 0 20px;
    }
    .d-flex { display: flex; }
    .d-inline-flex { display: inline-flex; }
    .align-center { align-items: center; }
    .justify-between { justify-content: space-between; }
    .gap-2 { gap: 10px; }
    .gap-3 { gap: 16px; }
    .my-2 { margin-top: 8px; margin-bottom: 8px; }
    .mt-1 { margin-top: 4px; }
    .mt-2 { margin-top: 8px; }
    .mt-3 { margin-top: 14px; }
    .pt-2 { padding-top: 8px; }
    .mb-1 { margin-bottom: 4px; }
    .mb-4 { margin-bottom: 24px; }
    .py-5 { padding-top: 48px; padding-bottom: 48px; }
    .text-center { text-align: center; }
    .text-left { text-align: left; }
    .text-xs { font-size: 0.75rem; }
    .text-sm { font-size: 0.85rem; }
    .text-muted { color: #94A3B8; }
    .text-orange { color: #FF8A24; }
    .text-blue { color: #0879D1; }
    .text-light-blue { color: #35D9FF; }
    .text-dark-blue { color: #0B2D4D; }
    .text-cyan { color: #35D9FF; }
    .text-success { color: #198754; }
    .text-warning { color: #FFC107; }

    // Top Brand Hero Header
    .brand-hero-header {
      padding: 24px 16px 10px 16px;
      background: radial-gradient(ellipse at top, #0B2D4D 0%, #06172B 75%);
    }
    .hero-brand-badge {
      background: rgba(11, 45, 77, 0.8);
      padding: 10px 24px;
      border-radius: 16px;
      border: 1px solid rgba(53, 217, 255, 0.4);
      box-shadow: 0 0 25px rgba(53, 217, 255, 0.25);
    }
    .hero-logo-box {
      width: 52px;
      height: 52px;
      background: linear-gradient(135deg, #FF8A24 0%, #0879D1 100%);
      border-radius: 12px;
      display: flex;
      align-items: center;
      justify-content: center;
      color: #FFF;
      font-size: 30px;
      font-weight: 900;
      font-family: 'Outfit', sans-serif;
      box-shadow: 0 4px 15px rgba(255, 138, 36, 0.4);
    }
    .master-title {
      font-family: 'Outfit', sans-serif;
      font-size: 2.2rem;
      font-weight: 900;
      letter-spacing: -0.5px;
      line-height: 1.1;
    }
    .master-subtitle {
      font-size: 0.95rem;
      color: #CBD5E1;
      letter-spacing: 1px;
      font-weight: 500;
    }

    // Visual Stage
    .master-visual-stage {
      position: relative;
      padding: 20px 16px 0 16px;
      overflow: hidden;
    }
    .bazaar-backdrop-container {
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      z-index: 1;
      opacity: 0.45;
      pointer-events: none;
    }
    .bazaar-bg-image {
      width: 100%;
      height: 100%;
      object-fit: cover;
      filter: saturate(1.2) contrast(1.1);
    }
    .backdrop-dark-gradient {
      position: absolute;
      inset: 0;
      background: linear-gradient(180deg, rgba(6, 23, 43, 0.4) 0%, rgba(6, 23, 43, 0.85) 75%, #06172B 100%);
    }

    // Central Laptop Mockup
    .central-laptop-wrapper {
      position: relative;
      z-index: 2;
      max-width: 900px;
      margin: 0 auto;
    }
    .laptop-chassis {
      background: #0B1E36;
      border: 3px solid #35D9FF;
      border-radius: 18px 18px 4px 4px;
      box-shadow: 0 0 35px rgba(53, 217, 255, 0.45), 0 20px 50px rgba(0, 0, 0, 0.6);
      padding: 12px;
    }
    .laptop-screen {
      background: #FFFFFF;
      color: #1E293B;
      border-radius: 10px;
      padding: 14px;
      overflow: hidden;
      box-shadow: inset 0 2px 8px rgba(0, 0, 0, 0.15);
    }
    .screen-header {
      border-bottom: 1px solid #E2E8F0;
      padding-bottom: 8px;
    }
    .screen-logo {
      width: 26px;
      height: 26px;
      background: linear-gradient(135deg, #FF8A24, #0879D1);
      border-radius: 6px;
      color: #FFF;
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: 900;
      font-size: 14px;
    }
    .screen-brand-text {
      line-height: 1.1;
      strong { font-size: 0.82rem; color: #0879D1; display: block; }
      small { font-size: 0.65rem; color: #64748B; }
    }
    .screen-user-actions {
      font-size: 0.72rem;
      font-weight: 600;
      color: #475569;
      .cart-pill {
        background: #0879D1;
        color: #FFF;
        padding: 3px 8px;
        border-radius: 6px;
      }
      .delivery-flag {
        background: rgba(255, 138, 36, 0.15);
        color: #FF8A24;
        padding: 3px 8px;
        border-radius: 6px;
        font-weight: 700;
      }
    }

    .screen-search-hero {
      background: linear-gradient(135deg, #0879D1, #0B2D4D);
      border-radius: 8px;
      padding: 14px 20px;
      color: #FFFFFF;
      margin: 10px 0;
      text-align: center;
    }
    .search-hero-title {
      font-size: 1.15rem;
      font-weight: 800;
      margin-bottom: 8px;
      letter-spacing: -0.3px;
    }
    .screen-search-box {
      max-width: 480px;
      margin: 0 auto;
      background: #FFF;
      border-radius: 6px;
      overflow: hidden;
      input {
        flex: 1;
        border: none;
        outline: none;
        padding: 8px 12px;
        font-size: 0.82rem;
      }
      .screen-search-btn {
        background: #FF8A24;
        color: #FFF;
        padding: 0 16px;
        border: none;
        cursor: pointer;
      }
    }

    .screen-categories {
      margin-bottom: 12px;
    }
    .cat-chip {
      background: #F1F5F9;
      color: #334155;
      font-size: 0.72rem;
      font-weight: 600;
      padding: 4px 10px;
      border-radius: 20px;
      cursor: pointer;
      &.active {
        background: #0879D1;
        color: #FFF;
      }
    }

    .screen-products-grid {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 10px;
    }
    .product-mini-card {
      border: 1px solid #E2E8F0;
      border-radius: 8px;
      padding: 8px;
      position: relative;
      background: #FFFFFF;
      transition: all 0.2s;
      &:hover { border-color: #0879D1; box-shadow: 0 4px 10px rgba(0,0,0,0.06); }
    }
    .prod-badge-tag {
      position: absolute;
      top: 6px;
      left: 6px;
      background: rgba(8, 121, 209, 0.1);
      color: #0879D1;
      font-size: 0.6rem;
      font-weight: 700;
      padding: 1px 5px;
      border-radius: 4px;
    }
    .prod-img-container {
      height: 75px;
      display: flex;
      align-items: center;
      justify-content: center;
      margin: 12px 0 6px 0;
      img {
        max-height: 100%;
        max-width: 100%;
        object-fit: contain;
      }
    }
    .prod-name {
      font-size: 0.75rem;
      font-weight: 700;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
      color: #1E293B;
    }
    .prod-shop {
      font-size: 0.65rem;
      color: #64748B;
    }
    .rating-stars {
      font-size: 0.65rem;
      font-weight: 700;
    }
    .prod-price {
      font-weight: 800;
      font-size: 0.85rem;
      color: #0B2D4D;
    }
    .add-to-cart-mini-btn {
      width: 100%;
      margin-top: 6px;
      background: #FF8A24;
      color: #FFFFFF;
      font-size: 0.68rem;
      font-weight: 800;
      padding: 5px 0;
      border-radius: 4px;
      border: none;
      cursor: pointer;
      &:hover { background: darken(#FF8A24, 7%); }
    }

    .laptop-hinge {
      height: 8px;
      background: #06172B;
      margin: 0 auto;
      width: 25%;
      border-radius: 0 0 4px 4px;
    }
    .laptop-base {
      height: 14px;
      background: linear-gradient(180deg, #1A385C, #0B2444);
      border-radius: 0 0 16px 16px;
      border: 2px solid #35D9FF;
      border-top: none;
      position: relative;
    }
    .laptop-trackpad {
      width: 60px;
      height: 4px;
      background: rgba(53, 217, 255, 0.4);
      border-radius: 2px;
      margin: 2px auto 0 auto;
    }

    .showcase-caption {
      text-align: center;
      margin-top: 14px;
      h3 {
        font-size: 1.1rem;
        color: #35D9FF;
        letter-spacing: 2px;
        font-weight: 800;
      }
      p {
        font-size: 0.82rem;
        color: #94A3B8;
      }
    }

    // Glowing Circuit SVG
    .circuits-overlay {
      position: relative;
      z-index: 2;
      margin-top: -10px;
      margin-bottom: 10px;
    }
    .pulse-line {
      filter: drop-shadow(0 0 6px #35D9FF);
      stroke-dasharray: 8 4;
      animation: circuitFlow 20s linear infinite;
    }
    .node-glow {
      filter: drop-shadow(0 0 8px #35D9FF);
    }
    @keyframes circuitFlow {
      to { stroke-dashoffset: -1000; }
    }

    // Three Connected Interface Panels
    .three-portals-section {
      position: relative;
      z-index: 3;
      padding-bottom: 40px;
    }
    .portals-grid {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 24px;
    }
    .portal-panel {
      background: #0B2444;
      border: 2px solid #35D9FF;
      border-radius: 14px;
      box-shadow: 0 0 25px rgba(53, 217, 255, 0.35);
      padding: 12px;
      display: flex;
      flex-direction: column;
      transition: all 0.3s cubic-bezier(0.165, 0.84, 0.44, 1);
      cursor: pointer;
      &:hover {
        transform: translateY(-6px);
        box-shadow: 0 0 35px rgba(53, 217, 255, 0.65);
      }
    }
    .panel-device-header {
      display: flex;
      align-items: center;
      gap: 6px;
      padding-bottom: 8px;
      border-bottom: 1px solid rgba(53, 217, 255, 0.2);
      margin-bottom: 10px;
    }
    .device-dot {
      width: 8px;
      height: 8px;
      border-radius: 50%;
    }
    .dot-red { background: #FF5F56; }
    .dot-yellow { background: #FFBD2E; }
    .dot-green { background: #27C93F; }
    .panel-device-title {
      font-size: 0.72rem;
      color: #94A3B8;
      font-family: monospace;
      margin-left: 6px;
    }

    .panel-screen-body {
      background: #FFFFFF;
      color: #1E293B;
      border-radius: 8px;
      padding: 12px;
      flex: 1;
      min-height: 230px;
      font-size: 0.82rem;
    }

    // Storefront Preview
    .preview-hero-strip {
      background: #0879D1;
      color: #FFF;
      padding: 8px 12px;
      border-radius: 6px;
      h5 { font-size: 0.85rem; font-weight: 700; margin: 0; }
      small { font-size: 0.65rem; opacity: 0.9; }
    }
    .tag-pill {
      background: #F1F5F9;
      font-size: 0.68rem;
      font-weight: 600;
      padding: 2px 8px;
      border-radius: 12px;
    }
    .preview-thumb-card {
      flex: 1;
      border: 1px solid #E2E8F0;
      border-radius: 6px;
      padding: 6px;
      .thumb-img {
        height: 48px;
        display: flex;
        align-items: center;
        justify-content: center;
        img { max-height: 100%; max-width: 100%; object-fit: contain; }
      }
      strong {
        font-size: 0.68rem;
        display: block;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      }
    }
    .btn-micro {
      background: #FF8A24;
      color: #FFF;
      font-size: 0.6rem;
      padding: 1px 6px;
      border-radius: 3px;
      font-weight: 700;
    }

    // Vendor Preview matching reference image
    .vendor-kpi-row {
      margin-bottom: 8px;
    }
    .vendor-kpi-box {
      flex: 1;
      padding: 6px 8px;
      border-radius: 6px;
      text-align: center;
      small { font-size: 0.62rem; display: block; }
      h4 { font-size: 0.98rem; font-weight: 800; margin: 0; line-height: 1.1; }
    }
    .kpi-blue { background: rgba(8, 121, 209, 0.12); color: #0879D1; }
    .kpi-purple { background: rgba(147, 51, 234, 0.12); color: #9333EA; }
    .kpi-green { background: rgba(25, 135, 84, 0.12); color: #198754; }

    .btn-mini-add {
      background: #0879D1;
      color: #FFF;
      font-size: 0.65rem;
      font-weight: 700;
      padding: 3px 8px;
      border-radius: 4px;
      border: none;
    }

    .vendor-mini-table {
      width: 100%;
      border-collapse: collapse;
      font-size: 0.68rem;
      th { text-align: left; color: #64748B; padding: 3px 4px; border-bottom: 1px solid #E2E8F0; }
      td { padding: 4px; border-bottom: 1px solid #F1F5F9; }
    }
    .badge-packed {
      background: rgba(25, 135, 84, 0.15);
      color: #198754;
      padding: 2px 6px;
      border-radius: 4px;
      font-weight: 700;
      font-size: 0.62rem;
    }

    // Admin Preview matching reference image
    .admin-kpi-row {
      margin-bottom: 8px;
    }
    .admin-kpi-box {
      flex: 1;
      background: #F8FAFC;
      border: 1px solid #E2E8F0;
      padding: 6px 8px;
      border-radius: 6px;
      text-align: center;
      small { font-size: 0.62rem; color: #64748B; display: block; }
      h4 { font-size: 0.95rem; font-weight: 800; color: #0F172A; margin: 0; }
      &.kpi-alert {
        border-color: #FF8A24;
        background: rgba(255, 138, 36, 0.08);
        h4 { color: #FF8A24; }
      }
    }
    .chart-mini-card {
      flex: 1;
      background: #F8FAFC;
      border: 1px solid #E2E8F0;
      border-radius: 6px;
      padding: 4px 6px;
    }
    .chart-mockup-curve {
      height: 34px;
      border-radius: 3px;
      margin-top: 4px;
    }
    .curve-growth {
      background: linear-gradient(135deg, rgba(8, 121, 209, 0.1), rgba(53, 217, 255, 0.35));
      border-top: 2px solid #0879D1;
    }
    .curve-trends {
      background: linear-gradient(135deg, rgba(147, 51, 234, 0.1), rgba(168, 85, 247, 0.35));
      border-top: 2px solid #9333EA;
    }
    .admin-queue-snippet {
      background: #F8FAFC;
      border: 1px solid #E2E8F0;
      border-radius: 6px;
      padding: 6px;
      font-size: 0.68rem;
    }
    .btn-micro-review {
      background: #0879D1;
      color: #FFF;
      padding: 2px 8px;
      border-radius: 3px;
      font-weight: 700;
    }

    .panel-footer-label {
      text-align: center;
      padding-top: 12px;
      h3 {
        font-size: 0.95rem;
        font-weight: 800;
        color: #FFFFFF;
        letter-spacing: 0.5px;
      }
      p {
        font-size: 0.72rem;
        color: #94A3B8;
      }
    }
    .portal-access-btn {
      display: block;
      width: 100%;
      text-align: center;
      font-size: 0.8rem;
      padding: 8px 12px;
      border-radius: 6px;
      text-decoration: none;
    }

    // Neighborhood Shops Showcase
    .shop-card-clean {
      background: #0B2444;
      border: 1px solid rgba(53, 217, 255, 0.3);
      border-radius: 12px;
      padding: 16px;
      position: relative;
      transition: all 0.2s;
      cursor: pointer;
      &:hover {
        border-color: #35D9FF;
        transform: translateY(-3px);
        box-shadow: 0 0 20px rgba(53, 217, 255, 0.3);
      }
    }
    .shops-grid {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 20px;
    }
    .shop-avatar {
      width: 44px;
      height: 44px;
      background: rgba(8, 121, 209, 0.2);
      border-radius: 10px;
      color: #35D9FF;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 1.2rem;
    }
    .shop-badge-status {
      position: absolute;
      top: 12px;
      right: 12px;
      font-size: 0.68rem;
      font-weight: 700;
      color: #94A3B8;
      &.open { color: #4ADE80; }
    }
    .shop-name {
      font-size: 1.05rem;
      color: #FFF;
      font-weight: 700;
      margin: 0;
    }
    .shop-desc {
      color: #94A3B8;
      line-height: 1.4;
      margin-top: 8px;
    }
    .shop-meta-footer {
      border-top: 1px solid rgba(255, 255, 255, 0.08);
    }

    // Mobile responsiveness
    @media (max-width: 992px) {
      .portals-grid { grid-template-columns: 1fr; }
      .screen-products-grid { grid-template-columns: repeat(2, 1fr); }
      .shops-grid { grid-template-columns: 1fr; }
      .circuits-overlay { display: none; }
    }
  `]
})
export class LandingComponent implements OnInit {
  featuredProducts: Product[] = [];
  featuredShops: Shop[] = [];
  cartCount = 0;
  searchQuery = '';

  constructor(private apiService: ApiService, private router: Router) {}

  ngOnInit(): void {
    this.loadCatalogData();
  }

  loadCatalogData(): void {
    this.apiService.getProducts({ page_size: 4 }).subscribe({
      next: (res) => {
        if (res.success && res.results) {
          this.featuredProducts = res.results;
        }
      },
      error: () => {}
    });

    this.apiService.getShops().subscribe({
      next: (res) => {
        if (res.success && res.results) {
          this.featuredShops = res.results.slice(0, 3);
        }
      },
      error: () => {}
    });

    this.apiService.getCart().subscribe({
      next: (res) => {
        if (res.success && res.cart) {
          this.cartCount = res.cart.item_count || 0;
        }
      },
      error: () => {}
    });
  }

  addToCart(product: Product): void {
    this.apiService.addToCart(product.id, 1).subscribe({
      next: (res) => {
        this.cartCount = res.cart?.item_count || (this.cartCount + 1);
        alert(`Added ${product.name} to your cart!`);
      },
      error: (err) => {
        if (err.status === 401) {
          this.router.navigate(['/login']);
        } else {
          alert(err.error?.message || 'Could not add item.');
        }
      }
    });
  }

  onSearch(): void {
    if (this.searchQuery.trim()) {
      this.router.navigate(['/products'], { queryParams: { q: this.searchQuery.trim() } });
    }
  }

  navigateTo(path: string): void {
    this.router.navigate([path]);
  }

  navigateToShop(shopId: string): void {
    this.router.navigate(['/shops', shopId]);
  }

  onImgError(event: any, category?: string): void {
    // High quality themed SVG fallback icons
    event.target.src = 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100" viewBox="0 0 100 100"><rect width="100" height="100" fill="%23F1F5F9"/><text x="50" y="55" font-family="Arial" font-size="30" text-anchor="middle">🛒</text></svg>';
  }
}
