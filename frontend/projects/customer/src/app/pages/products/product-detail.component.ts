import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterModule, Router } from '@angular/router';
import { Title, Meta } from '@angular/platform-browser';
import { ApiService } from '../../../../../shared/services/api.service';
import { Product } from '../../../../../shared/models/models';

@Component({
  selector: 'app-product-detail',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="product-detail-page py-5" *ngIf="product">
      <div class="container">
        <!-- Breadcrumbs -->
        <div class="breadcrumbs mb-4">
          <a routerLink="/"><i class="fa-solid fa-house mr-1"></i> Home</a>
          <span class="mx-2">/</span>
          <a routerLink="/products">Products</a>
          <span class="mx-2">/</span>
          <span class="text-muted">{{ product.name }}</span>
        </div>

        <div class="product-detail-card">
          <div class="detail-grid">
            <!-- Product Image -->
            <div class="product-gallery-box d-flex align-center justify-center">
              <img [src]="product.image_url" [alt]="product.name" (error)="onImgError($event)" />
            </div>

            <!-- Product Information -->
            <div class="product-info-col">
              <div class="shop-line mb-2 d-flex align-center gap-2">
                <span class="badge badge-info"><i class="fa-solid fa-store mr-1"></i> {{ product.shop_name }}</span>
                <span class="badge badge-success" *ngIf="product.is_available"><i class="fa-solid fa-circle-check mr-1"></i> Available Now</span>
              </div>

              <h1 class="product-title">{{ product.name }}</h1>
              <p class="product-unit text-muted mb-3">Unit: {{ product.unit }} • SKU: {{ product.sku }}</p>

              <!-- Price Box -->
              <div class="price-strip d-flex align-center gap-3 p-3 mb-3">
                <span class="current-price">₹{{ (product.price_cents / 100).toFixed(0) }}</span>
                <span class="original-price" *ngIf="product.compare_price_cents && product.compare_price_cents > product.price_cents">
                  ₹{{ (product.compare_price_cents / 100).toFixed(0) }}
                </span>
                <span class="discount-badge" *ngIf="product.compare_price_cents && product.compare_price_cents > product.price_cents">
                  {{ getDiscountPercent(product.price_cents, product.compare_price_cents) }}% OFF
                </span>
              </div>

              <div class="stock-status-bar mb-3">
                <span *ngIf="product.stock_quantity > 0" class="text-success font-bold">
                  <i class="fa-solid fa-boxes-stacked mr-1"></i> {{ product.stock_quantity }} units available in local inventory
                </span>
                <span *ngIf="product.stock_quantity === 0" class="text-danger font-bold">
                  <i class="fa-solid fa-triangle-exclamation mr-1"></i> Currently Out of Stock
                </span>
              </div>

              <p class="product-desc mb-4">{{ product.description }}</p>

              <!-- Quantity Selector & Add to Cart -->
              <div class="purchase-action-row d-flex align-center gap-3 mb-4">
                <div class="qty-stepper d-flex align-center">
                  <button class="step-btn" (click)="qty = qty > 1 ? qty - 1 : 1"><i class="fa-solid fa-minus"></i></button>
                  <span class="step-val">{{ qty }}</span>
                  <button class="step-btn" (click)="qty = qty + 1"><i class="fa-solid fa-plus"></i></button>
                </div>
                <button
                  class="btn-orange flex-1 py-3"
                  (click)="addToCart()"
                  [disabled]="product.stock_quantity === 0"
                >
                  <i class="fa-solid fa-cart-plus mr-2"></i>
                  {{ product.stock_quantity === 0 ? 'Out of Stock' : 'Add to Ghar Tak Cart' }}
                </button>
              </div>

              <!-- Shop Trust Feature -->
              <div class="shop-trust-card p-3 d-flex align-center gap-3">
                <div class="trust-icon"><i class="fa-solid fa-shield-halved"></i></div>
                <div>
                  <h4 class="text-sm font-bold">Sold & Fulfilled by {{ product.shop_name }}</h4>
                  <p class="text-xs text-muted">Genuine neighborhood shop item • Delivered to your doorstep in 30 mins</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .product-detail-page { background: #F8FAFC; min-height: calc(100vh - 120px); }
    .container { max-width: 1200px; margin: 0 auto; padding: 0 16px; }
    .py-5 { padding-top: 36px; padding-bottom: 48px; }
    .mb-2 { margin-bottom: 8px; }
    .mb-3 { margin-bottom: 16px; }
    .mb-4 { margin-bottom: 24px; }
    .p-3 { padding: 16px; }
    .py-3 { padding: 12px 0; }
    .flex-1 { flex: 1; }
    .breadcrumbs { font-size: 0.85rem; color: #475569; }

    .product-detail-card {
      background: #FFFFFF;
      border: 1px solid #E2E8F0;
      border-radius: 16px;
      padding: 32px;
      box-shadow: 0 4px 20px rgba(0,0,0,0.05);
    }
    .detail-grid {
      display: grid;
      grid-template-columns: 1fr 1.2fr;
      gap: 40px;
    }
    .product-gallery-box {
      background: #F8FAFC;
      border: 1px solid #E2E8F0;
      border-radius: 12px;
      height: 380px;
      padding: 24px;
      img { max-height: 100%; max-width: 100%; object-fit: contain; }
    }
    .product-title {
      font-size: 1.8rem;
      font-weight: 800;
      color: #0B2D4D;
      line-height: 1.2;
    }
    .price-strip {
      background: #F1F5F9;
      border-radius: 10px;
    }
    .current-price { font-size: 2rem; font-weight: 900; color: #0879D1; }
    .original-price { font-size: 1.2rem; color: #94A3B8; text-decoration: line-through; }
    .discount-badge {
      background: #FF8A24;
      color: #FFF;
      font-size: 0.75rem;
      font-weight: 800;
      padding: 3px 8px;
      border-radius: 4px;
    }
    .product-desc { color: #475569; line-height: 1.6; font-size: 0.95rem; }

    .qty-stepper {
      border: 2px solid #CBD5E1;
      border-radius: 8px;
      overflow: hidden;
    }
    .step-btn {
      background: #F8FAFC;
      border: none;
      padding: 10px 16px;
      cursor: pointer;
      color: #1E293B;
      font-size: 0.9rem;
      &:hover { background: #E2E8F0; }
    }
    .step-val { padding: 0 16px; font-weight: 800; font-size: 1.1rem; }

    .shop-trust-card {
      background: #F8FAFC;
      border: 1px solid #E2E8F0;
      border-radius: 10px;
    }
    .trust-icon {
      font-size: 1.5rem;
      color: #0879D1;
    }

    @media (max-width: 900px) {
      .detail-grid { grid-template-columns: 1fr; }
    }
  `]
})
export class ProductDetailComponent implements OnInit {
  product: Product | null = null;
  qty = 1;

  constructor(
    private route: ActivatedRoute,
    private apiService: ApiService,
    private router: Router,
    private titleService: Title,
    private metaService: Meta
  ) {}

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('slug') || '';
    if (id) {
      this.apiService.getProduct(id).subscribe({
        next: (res) => {
          if (res.success && res.product) {
            this.product = res.product;
            this.titleService.setTitle(`${res.product.name} — NearbyBazaar: Ghar Tak`);
            this.metaService.updateTag({ name: 'description', content: res.product.description });
            this.metaService.updateTag({ property: 'og:title', content: res.product.name });
            this.metaService.updateTag({ property: 'og:image', content: res.product.image_url });
          }
        }
      });
    }
  }

  getDiscountPercent(priceCents: number, comparePriceCents: number): number {
    return Math.round(((comparePriceCents - priceCents) / comparePriceCents) * 100);
  }

  addToCart(): void {
    if (this.product) {
      this.apiService.addToCart(this.product.id, this.qty).subscribe({
        next: () => {
          alert(`Added ${this.qty}x ${this.product?.name} to cart!`);
          this.router.navigate(['/cart']);
        },
        error: (err) => {
          if (err.status === 401) {
            this.router.navigate(['/login']);
          } else {
            alert(err.error?.message || 'Failed to add item to cart.');
          }
        }
      });
    }
  }

  onImgError(event: any): void {
    event.target.src = 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="200" height="200" viewBox="0 0 200 200"><rect width="200" height="200" fill="%23F1F5F9"/><text x="100" y="110" font-family="Arial" font-size="40" text-anchor="middle">🛍️</text></svg>';
  }
}
