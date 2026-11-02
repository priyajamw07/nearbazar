import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { ApiService } from '../../../../../shared/services/api.service';
import { Shop } from '../../../../../shared/models/models';

@Component({
  selector: 'app-shop-list',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="shops-page-bg py-5">
      <div class="container">
        <div class="page-header mb-4">
          <h1 class="page-title"><i class="fa-solid fa-shop text-orange mr-2"></i> Local Neighborhood Shops</h1>
          <p class="text-muted">Browse trusted community shops in Delhi NCR delivering Ghar Tak</p>
        </div>

        <div class="shops-grid" *ngIf="shops.length > 0; else noShops">
          <div class="shop-card" *ngFor="let s of shops" (click)="viewShop(s.id)">
            <div class="shop-status-tag" [class.open]="s.is_open">
              <i class="fa-solid fa-circle mr-1"></i> {{ s.is_open ? 'Open Now' : 'Closed' }}
            </div>

            <div class="shop-card-content">
              <div class="d-flex align-center gap-3 mb-3">
                <div class="shop-icon-circle"><i class="fa-solid fa-store"></i></div>
                <div>
                  <h3 class="shop-name">{{ s.name }}</h3>
                  <span class="shop-category-badge">{{ s.category }}</span>
                </div>
              </div>

              <p class="shop-desc text-sm">{{ s.description }}</p>

              <div class="shop-address text-xs text-muted mt-2">
                <i class="fa-solid fa-location-dot mr-1 text-orange"></i> {{ s.address.street }}, {{ s.address.city }}
              </div>

              <div class="shop-footer-bar d-flex justify-between align-center mt-3 pt-3">
                <div class="rating-info">
                  <i class="fa-solid fa-star text-warning"></i>
                  <strong>{{ s.rating }}</strong>
                  <span class="text-xs text-muted">({{ s.review_count }} ratings)</span>
                </div>
                <div class="opening-hours text-xs text-muted">
                  <i class="fa-regular fa-clock mr-1"></i> {{ s.opening_time }} - {{ s.closing_time }}
                </div>
              </div>

              <button class="btn-primary w-100 mt-3">
                <span>Visit Storefront</span> <i class="fa-solid fa-arrow-right ml-1"></i>
              </button>
            </div>
          </div>
        </div>

        <ng-template #noShops>
          <div class="empty-shops text-center py-5">
            <i class="fa-solid fa-store-slash empty-icon mb-3"></i>
            <h3>No shops found</h3>
          </div>
        </ng-template>
      </div>
    </div>
  `,
  styles: [`
    .shops-page-bg { background: #F8FAFC; min-height: calc(100vh - 120px); }
    .container { max-width: 1240px; margin: 0 auto; padding: 0 16px; }
    .py-5 { padding-top: 36px; padding-bottom: 48px; }
    .mb-3 { margin-bottom: 16px; }
    .mb-4 { margin-bottom: 24px; }
    .mt-2 { margin-top: 8px; }
    .mt-3 { margin-top: 14px; }
    .pt-3 { padding-top: 14px; }
    .w-100 { width: 100%; }
    .page-title { font-size: 1.8rem; font-weight: 800; color: #0B2D4D; }

    .shops-grid {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 24px;
    }
    .shop-card {
      background: #FFFFFF;
      border: 1px solid #E2E8F0;
      border-radius: 14px;
      overflow: hidden;
      position: relative;
      cursor: pointer;
      box-shadow: 0 2px 8px rgba(0,0,0,0.04);
      transition: all 0.2s;
      &:hover {
        transform: translateY(-4px);
        box-shadow: 0 8px 24px rgba(8, 121, 209, 0.12);
        border-color: #0879D1;
      }
    }
    .shop-status-tag {
      position: absolute;
      top: 14px;
      right: 14px;
      font-size: 0.68rem;
      font-weight: 700;
      color: #94A3B8;
      &.open { color: #198754; }
    }
    .shop-card-content { padding: 20px; }
    .shop-icon-circle {
      width: 44px;
      height: 44px;
      background: rgba(8, 121, 209, 0.1);
      color: #0879D1;
      border-radius: 10px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 1.2rem;
    }
    .shop-name { font-size: 1.05rem; font-weight: 800; color: #0B2D4D; margin: 0; }
    .shop-category-badge {
      background: #F1F5F9;
      color: #FF8A24;
      font-size: 0.7rem;
      font-weight: 700;
      padding: 2px 6px;
      border-radius: 4px;
    }
    .shop-desc { color: #475569; line-height: 1.5; min-height: 42px; }
    .shop-footer-bar { border-top: 1px solid #F1F5F9; }

    @media (max-width: 900px) {
      .shops-grid { grid-template-columns: 1fr; }
    }
  `]
})
export class ShopListComponent implements OnInit {
  shops: Shop[] = [];

  constructor(private apiService: ApiService, private router: Router) {}

  ngOnInit(): void {
    this.apiService.getShops().subscribe(res => {
      if (res.success) this.shops = res.results;
    });
  }

  viewShop(id: string): void {
    this.router.navigate(['/shops', id]);
  }
}
