import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterModule, Router } from '@angular/router';
import { ApiService } from '../../../../../shared/services/api.service';
import { Shop, Product } from '../../../../../shared/models/models';

@Component({
  selector: 'app-shop-detail',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="shop-detail-page py-5" *ngIf="shop">
      <div class="container">
        <!-- Shop Profile Header Card -->
        <div class="shop-banner-card mb-4">
          <div class="d-flex justify-between align-center">
            <div class="d-flex align-center gap-3">
              <div class="shop-large-icon"><i class="fa-solid fa-store"></i></div>
              <div>
                <span class="badge badge-warning text-xs">{{ shop.category }}</span>
                <h1 class="shop-title mt-1">{{ shop.name }}</h1>
                <p class="text-sm text-light-muted">
                  <i class="fa-solid fa-location-dot text-orange mr-1"></i> {{ shop.address.street }}, {{ shop.address.city }}
                </p>
              </div>
            </div>

            <div class="shop-quick-stats text-right">
              <div class="stat-rating">
                <i class="fa-solid fa-star text-warning"></i>
                <strong>{{ shop.rating }}</strong> / 5.0
              </div>
              <small class="text-light-muted">({{ shop.review_count }} community reviews)</small>
              <div class="mt-2">
                <span class="status-pill" [class.open]="shop.is_open">
                  <i class="fa-solid fa-circle mr-1"></i> {{ shop.is_open ? 'Open Now (Ghar Tak Delivery Active)' : 'Closed' }}
                </span>
              </div>
            </div>
          </div>
        </div>

        <!-- Shop Products Catalog -->
        <div class="shop-products-section">
          <h2 class="section-title mb-3">Products from {{ shop.name }}</h2>

          <div class="products-grid" *ngIf="products.length > 0; else noProducts">
            <div class="product-card" *ngFor="let p of products">
              <div class="prod-img-box" [routerLink]="['/products', p.id]">
                <img [src]="p.image_url" [alt]="p.name" (error)="onImgError($event)" />
              </div>
              <div class="prod-info">
                <span class="prod-cat text-xs text-orange font-bold">{{ p.category_name }}</span>
                <h3 class="prod-name" [routerLink]="['/products', p.id]">{{ p.name }}</h3>
                <small class="text-muted d-block mb-2">{{ p.unit }}</small>
                <div class="d-flex justify-between align-center">
                  <span class="prod-price font-bold">₹{{ (p.price_cents / 100).toFixed(0) }}</span>
                  <button class="btn-orange text-xs" (click)="addToCart(p)">
                    ADD TO CART
                  </button>
                </div>
              </div>
            </div>
          </div>

          <ng-template #noProducts>
            <div class="empty-products text-center py-5">
              <p class="text-muted">No products currently listed for this shop.</p>
            </div>
          </ng-template>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .shop-detail-page { background: #F8FAFC; min-height: calc(100vh - 120px); }
    .container { max-width: 1240px; margin: 0 auto; padding: 0 16px; }
    .py-5 { padding-top: 36px; padding-bottom: 48px; }
    .mb-3 { margin-bottom: 16px; }
    .mb-4 { margin-bottom: 24px; }
    .mt-1 { margin-top: 4px; }
    .mt-2 { margin-top: 8px; }
    .text-light-muted { color: #CBD5E1; }

    .shop-banner-card {
      background: linear-gradient(135deg, #06172B 0%, #0B2D4D 100%);
      color: #FFFFFF;
      border-radius: 16px;
      padding: 32px;
      box-shadow: 0 6px 20px rgba(6, 23, 43, 0.15);
    }
    .shop-large-icon {
      width: 64px;
      height: 64px;
      background: rgba(53, 217, 255, 0.2);
      border: 2px solid #35D9FF;
      color: #35D9FF;
      border-radius: 14px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 2rem;
    }
    .shop-title { font-size: 1.8rem; font-weight: 800; color: #FFF; margin: 0; }
    .stat-rating { font-size: 1.25rem; font-weight: 800; color: #FFF; }
    .status-pill {
      background: rgba(255,255,255,0.1);
      padding: 4px 12px;
      border-radius: 20px;
      font-size: 0.75rem;
      font-weight: 700;
      &.open { background: rgba(25, 135, 84, 0.3); color: #4ADE80; }
    }

    .section-title { font-size: 1.4rem; font-weight: 800; color: #0B2D4D; }
    .products-grid {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 20px;
    }
    .product-card {
      background: #FFFFFF;
      border: 1px solid #E2E8F0;
      border-radius: 12px;
      padding: 14px;
      box-shadow: 0 2px 6px rgba(0,0,0,0.04);
      transition: all 0.2s;
      &:hover { transform: translateY(-3px); border-color: #0879D1; }
    }
    .prod-img-box {
      height: 140px;
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      img { max-height: 100%; max-width: 100%; object-fit: contain; }
    }
    .prod-name {
      font-size: 0.92rem;
      font-weight: 700;
      color: #1E293B;
      cursor: pointer;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
      margin: 4px 0;
    }
    .prod-price { font-size: 1.15rem; color: #0B2D4D; }

    @media (max-width: 900px) {
      .products-grid { grid-template-columns: repeat(2, 1fr); }
    }
  `]
})
export class ShopDetailComponent implements OnInit {
  shop: Shop | null = null;
  products: Product[] = [];

  constructor(private route: ActivatedRoute, private apiService: ApiService, private router: Router) {}

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id') || '';
    if (id) {
      this.apiService.getShop(id).subscribe(res => {
        if (res.success) this.shop = res.shop;
      });
      this.apiService.getShopProducts(id).subscribe(res => {
        if (res.success) this.products = res.results || [];
      });
    }
  }

  addToCart(product: Product): void {
    this.apiService.addToCart(product.id, 1).subscribe({
      next: () => alert(`Added ${product.name} to cart!`),
      error: () => this.router.navigate(['/login'])
    });
  }

  onImgError(event: any): void {
    event.target.src = 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100" viewBox="0 0 100 100"><rect width="100" height="100" fill="%23F1F5F9"/><text x="50" y="55" font-family="Arial" font-size="28" text-anchor="middle">🛒</text></svg>';
  }
}
