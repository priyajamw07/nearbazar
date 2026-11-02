import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { ApiService } from '../../../../../shared/services/api.service';
import { CartDetails } from '../../../../../shared/models/models';

@Component({
  selector: 'app-cart',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="cart-page-bg py-5">
      <div class="container">
        <h1 class="cart-headline mb-4">
          <i class="fa-solid fa-cart-shopping text-orange mr-2"></i>
          Your Multi-Vendor Cart
        </h1>

        <div class="cart-layout" *ngIf="cart && cart.items && cart.items.length > 0; else emptyCart">
          <!-- Left: Grouped by Local Shop -->
          <div class="cart-items-column">
            <!-- Alert Banner -->
            <div class="multi-vendor-notice mb-3 d-flex align-center gap-2">
              <i class="fa-solid fa-circle-info text-blue"></i>
              <span>Items from <strong>{{ cart.shops.length }} local shops</strong> in your neighborhood will be consolidated into a single seamless Ghar Tak delivery.</span>
            </div>

            <!-- Per-Shop Accordion / Group -->
            <div class="shop-cart-card mb-4" *ngFor="let shopGroup of cart.shops">
              <div class="shop-cart-header d-flex justify-between align-center">
                <div class="d-flex align-center gap-2">
                  <div class="shop-badge-icon"><i class="fa-solid fa-store"></i></div>
                  <div>
                    <h3 class="shop-title">{{ shopGroup.shop_name }}</h3>
                    <small class="text-muted">Neighborhood fulfillment</small>
                  </div>
                </div>
                <div class="shop-delivery-pill">
                  <i class="fa-solid fa-motorcycle text-orange mr-1"></i> Delivery: ₹{{ (shopGroup.delivery_fee_cents / 100).toFixed(0) }}
                </div>
              </div>

              <div class="shop-cart-items-list">
                <div class="cart-item-row d-flex justify-between align-center" *ngFor="let item of shopGroup.items">
                  <div class="item-visual-info d-flex align-center gap-3">
                    <div class="item-img-box">
                      <img [src]="item.image_url" [alt]="item.name" (error)="onImgError($event)" />
                    </div>
                    <div>
                      <h4 class="item-name">{{ item.name }}</h4>
                      <p class="item-unit text-xs text-muted">{{ item.unit }}</p>
                      <span class="item-unit-price text-sm font-bold text-dark-blue">₹{{ (item.price_cents / 100).toFixed(0) }}</span>
                    </div>
                  </div>

                  <div class="item-qty-actions d-flex align-center gap-4">
                    <!-- Qty Modifier -->
                    <div class="qty-control d-flex align-center">
                      <button class="qty-btn" (click)="updateQuantity(item.product_id, item.quantity - 1)">
                        <i class="fa-solid fa-minus"></i>
                      </button>
                      <span class="qty-number">{{ item.quantity }}</span>
                      <button class="qty-btn" (click)="updateQuantity(item.product_id, item.quantity + 1)">
                        <i class="fa-solid fa-plus"></i>
                      </button>
                    </div>

                    <div class="item-total-price">
                      <strong>₹{{ (item.total_cents / 100).toFixed(0) }}</strong>
                    </div>

                    <button class="btn-remove-item" (click)="removeItem(item.product_id)" title="Remove item">
                      <i class="fa-solid fa-trash-can"></i>
                    </button>
                  </div>
                </div>
              </div>

              <!-- Shop Subtotal Bar -->
              <div class="shop-subtotal-bar d-flex justify-between align-center">
                <span class="text-sm text-muted">Shop Subtotal ({{ shopGroup.items.length }} items):</span>
                <span class="font-bold text-dark-blue">₹{{ (shopGroup.shop_subtotal_cents / 100).toFixed(0) }}</span>
              </div>
            </div>
          </div>

          <!-- Right: Order Summary Card -->
          <div class="cart-summary-column">
            <div class="summary-card">
              <h3 class="summary-title mb-3">Order Summary</h3>

              <div class="summary-row d-flex justify-between py-2">
                <span>Items Subtotal ({{ cart.item_count }} items)</span>
                <strong>₹{{ (cart.subtotal_cents / 100).toFixed(0) }}</strong>
              </div>

              <div class="summary-row d-flex justify-between py-2">
                <span>Delivery Charges ({{ cart.shops.length }} Shops)</span>
                <strong class="text-orange">₹{{ (cart.delivery_fee_cents / 100).toFixed(0) }}</strong>
              </div>

              <div class="summary-row d-flex justify-between py-2 text-success" *ngIf="cart.discount_cents > 0">
                <span>Promotional Discount</span>
                <strong>-₹{{ (cart.discount_cents / 100).toFixed(0) }}</strong>
              </div>

              <hr class="summary-divider my-3">

              <div class="summary-total-row d-flex justify-between align-center mb-4">
                <span class="total-label">Total Amount</span>
                <span class="total-amount">₹{{ (cart.total_cents / 100).toFixed(0) }}</span>
              </div>

              <button class="btn-primary w-100 py-3" (click)="proceedToCheckout()">
                <span>Proceed to Checkout</span>
                <i class="fa-solid fa-arrow-right ml-2"></i>
              </button>

              <div class="security-guarantee d-flex align-center justify-center gap-2 mt-3 text-xs text-muted">
                <i class="fa-solid fa-shield-halved text-success"></i>
                <span>Direct Neighborhood Delivery • Ghar Tak Guarantee</span>
              </div>
            </div>
          </div>
        </div>

        <ng-template #emptyCart>
          <div class="empty-cart-card text-center py-5">
            <i class="fa-solid fa-cart-shopping empty-cart-icon mb-3"></i>
            <h2>Your Cart is Empty</h2>
            <p class="text-muted mt-2">Discover fresh fruits, vegetables, groceries, and electronics from neighborhood shops.</p>
            <a routerLink="/products" class="btn-primary mt-4">
              <i class="fa-solid fa-store mr-2"></i> Start Shopping Local
            </a>
          </div>
        </ng-template>
      </div>
    </div>
  `,
  styles: [`
    .cart-page-bg {
      background: #F8FAFC;
      min-height: calc(100vh - 120px);
    }
    .container { max-width: 1240px; margin: 0 auto; padding: 0 16px; }
    .py-5 { padding-top: 36px; padding-bottom: 48px; }
    .mb-3 { margin-bottom: 16px; }
    .mb-4 { margin-bottom: 24px; }
    .my-3 { margin: 16px 0; }
    .py-2 { padding: 8px 0; }
    .py-3 { padding: 12px 0; }
    .w-100 { width: 100%; }
    .cart-headline { font-size: 1.8rem; font-weight: 800; color: #0B2D4D; }

    .cart-layout {
      display: grid;
      grid-template-columns: 1fr 380px;
      gap: 28px;
    }
    .multi-vendor-notice {
      background: rgba(8, 121, 209, 0.08);
      border: 1px solid rgba(8, 121, 209, 0.2);
      border-radius: 8px;
      padding: 12px 16px;
      font-size: 0.88rem;
      color: #0B2D4D;
    }
    .shop-cart-card {
      background: #FFFFFF;
      border: 1px solid #E2E8F0;
      border-radius: 12px;
      overflow: hidden;
      box-shadow: 0 2px 8px rgba(0,0,0,0.04);
    }
    .shop-cart-header {
      background: #F1F5F9;
      padding: 12px 18px;
      border-bottom: 1px solid #E2E8F0;
    }
    .shop-badge-icon {
      width: 32px;
      height: 32px;
      background: #0879D1;
      color: #FFF;
      border-radius: 6px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 0.9rem;
    }
    .shop-title { font-size: 1.05rem; font-weight: 700; color: #0B2D4D; margin: 0; }
    .shop-delivery-pill {
      font-size: 0.82rem;
      font-weight: 700;
      color: #0B2D4D;
      background: #FFFFFF;
      padding: 4px 10px;
      border-radius: 20px;
      border: 1px solid #CBD5E1;
    }
    .shop-cart-items-list {
      padding: 8px 18px;
    }
    .cart-item-row {
      padding: 14px 0;
      border-bottom: 1px solid #F1F5F9;
      &:last-child { border-bottom: none; }
    }
    .item-img-box {
      width: 60px;
      height: 60px;
      border: 1px solid #E2E8F0;
      border-radius: 8px;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 4px;
      img { max-height: 100%; max-width: 100%; object-fit: contain; }
    }
    .item-name { font-size: 0.95rem; font-weight: 700; color: #1E293B; margin: 0; }
    .qty-control {
      border: 1px solid #CBD5E1;
      border-radius: 6px;
      overflow: hidden;
    }
    .qty-btn {
      background: #F8FAFC;
      border: none;
      padding: 6px 10px;
      cursor: pointer;
      color: #475569;
      &:hover { background: #E2E8F0; color: #0879D1; }
    }
    .qty-number {
      padding: 0 12px;
      font-weight: 700;
      font-size: 0.9rem;
    }
    .item-total-price { font-size: 1.05rem; font-weight: 800; color: #0B2D4D; min-width: 70px; text-align: right; }
    .btn-remove-item {
      background: none;
      border: none;
      color: #94A3B8;
      font-size: 1rem;
      cursor: pointer;
      &:hover { color: #DC3545; }
    }
    .shop-subtotal-bar {
      background: #F8FAFC;
      border-top: 1px solid #E2E8F0;
      padding: 10px 18px;
    }

    // Summary Card
    .summary-card {
      background: #FFFFFF;
      border: 1px solid #E2E8F0;
      border-radius: 12px;
      padding: 24px;
      box-shadow: 0 4px 15px rgba(0,0,0,0.05);
      position: sticky;
      top: 90px;
    }
    .summary-title { font-size: 1.25rem; font-weight: 800; color: #0B2D4D; }
    .summary-row { font-size: 0.92rem; color: #475569; }
    .summary-divider { border: none; border-top: 1px dashed #CBD5E1; }
    .total-label { font-size: 1.1rem; font-weight: 800; color: #0B2D4D; }
    .total-amount { font-size: 1.5rem; font-weight: 900; color: #0879D1; }

    .empty-cart-card {
      background: #FFFFFF;
      border: 1px solid #E2E8F0;
      border-radius: 16px;
      padding: 60px 20px;
    }
    .empty-cart-icon { font-size: 4rem; color: #CBD5E1; }

    @media (max-width: 900px) {
      .cart-layout { grid-template-columns: 1fr; }
    }
  `]
})
export class CartComponent implements OnInit {
  cart: CartDetails | null = null;

  constructor(private apiService: ApiService, private router: Router) {}

  ngOnInit(): void {
    this.loadCart();
  }

  loadCart(): void {
    this.apiService.getCart().subscribe({
      next: (res) => {
        if (res.success) {
          this.cart = res.cart;
        }
      },
      error: (err) => {
        if (err.status === 401) {
          this.router.navigate(['/login']);
        }
      }
    });
  }

  updateQuantity(productId: string, qty: number): void {
    this.apiService.updateCartItem(productId, qty).subscribe({
      next: (res) => {
        if (res.success) {
          this.cart = res.cart;
        }
      }
    });
  }

  removeItem(productId: string): void {
    this.apiService.removeCartItem(productId).subscribe({
      next: (res) => {
        if (res.success) {
          this.cart = res.cart;
        }
      }
    });
  }

  proceedToCheckout(): void {
    this.router.navigate(['/checkout']);
  }

  onImgError(event: any): void {
    event.target.src = 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="60" height="60" viewBox="0 0 60 60"><rect width="60" height="60" fill="%23F1F5F9"/><text x="30" y="35" font-family="Arial" font-size="20" text-anchor="middle">🛍️</text></svg>';
  }
}
