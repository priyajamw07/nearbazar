import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterModule, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../../../../shared/services/api.service';
import { Product, Category } from '../../../../../shared/models/models';

@Component({
  selector: 'app-product-list',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  template: `
    <div class="product-page-container">
      <div class="container py-4">
        <!-- Breadcrumbs -->
        <div class="breadcrumbs mb-3">
          <a routerLink="/"><i class="fa-solid fa-house mr-1"></i> Home</a>
          <span class="mx-2">/</span>
          <span class="text-orange font-bold">Local Market Catalog</span>
          <span class="mx-2" *ngIf="selectedCategory">/</span>
          <span class="text-muted" *ngIf="selectedCategory">{{ selectedCategory }}</span>
        </div>

        <div class="catalog-layout">
          <!-- Left Sidebar Filters -->
          <aside class="filters-sidebar">
            <div class="filter-card">
              <h3 class="filter-title"><i class="fa-solid fa-sliders mr-2 text-blue"></i> Categories</h3>
              <ul class="cat-list">
                <li (click)="filterByCategory('')" [class.active]="!selectedCategory">
                  <span>All Categories</span>
                </li>
                <li *ngFor="let cat of categories" (click)="filterByCategory(cat.slug)" [class.active]="selectedCategory === cat.slug">
                  <span>{{ cat.name }}</span>
                  <span class="cat-count">({{ cat.item_count || 0 }})</span>
                </li>
              </ul>
            </div>

            <div class="filter-card mt-3">
              <h3 class="filter-title"><i class="fa-solid fa-indian-rupee-sign mr-2 text-orange"></i> Price Range</h3>
              <div class="price-inputs d-flex gap-2 align-center">
                <input type="number" [(ngModel)]="minPrice" placeholder="Min ₹" class="price-input" />
                <span>to</span>
                <input type="number" [(ngModel)]="maxPrice" placeholder="Max ₹" class="price-input" />
              </div>
              <button (click)="applyFilters()" class="btn-primary w-100 mt-2">Apply Filters</button>
            </div>
          </aside>

          <!-- Right Products Catalog -->
          <main class="products-main">
            <!-- Catalog Header -->
            <div class="catalog-header-bar d-flex justify-between align-center mb-3">
              <div>
                <h2>Neighborhood Products</h2>
                <p class="text-muted text-sm">Showing {{ products.length }} items available for immediate Ghar Tak delivery</p>
              </div>
              <div class="sort-selector d-flex align-center gap-2">
                <label class="text-sm">Sort by:</label>
                <select [(ngModel)]="sortBy" (change)="applyFilters()" class="sort-dropdown">
                  <option value="created_at_desc">Featured / Newest</option>
                  <option value="price_asc">Price: Low to High</option>
                  <option value="price_desc">Price: High to Low</option>
                </select>
              </div>
            </div>

            <!-- Products Grid -->
            <div class="products-grid" *ngIf="products.length > 0; else noProducts">
              <div class="product-card" *ngFor="let p of products">
                <div class="prod-tag">{{ p.category_name }}</div>
                <div class="prod-img-box" (click)="viewProduct(p.id)">
                  <img [src]="p.image_url" [alt]="p.name" (error)="onImgError($event)" />
                </div>
                <div class="prod-details">
                  <span class="shop-badge"><i class="fa-solid fa-store mr-1 text-orange"></i> {{ p.shop_name }}</span>
                  <h3 class="prod-title" (click)="viewProduct(p.id)">{{ p.name }}</h3>
                  <div class="unit-text text-xs text-muted">{{ p.unit }}</div>

                  <div class="price-rating-row d-flex justify-between align-center mt-2">
                    <div class="price-box">
                      <span class="curr-price">₹{{ (p.price_cents / 100).toFixed(0) }}</span>
                      <span class="compare-price" *ngIf="p.compare_price_cents && p.compare_price_cents > p.price_cents">
                        ₹{{ (p.compare_price_cents / 100).toFixed(0) }}
                      </span>
                    </div>
                    <div class="stock-status text-xs" [class.text-success]="p.stock_quantity > 0" [class.text-danger]="p.stock_quantity === 0">
                      {{ p.stock_quantity > 0 ? (p.stock_quantity < 10 ? 'Low Stock' : 'In Stock') : 'Out of Stock' }}
                    </div>
                  </div>

                  <button
                    class="btn-orange w-100 mt-3"
                    (click)="addToCart(p)"
                    [disabled]="p.stock_quantity === 0"
                  >
                    <i class="fa-solid fa-cart-plus mr-1"></i>
                    {{ p.stock_quantity === 0 ? 'Out of Stock' : 'ADD TO CART' }}
                  </button>
                </div>
              </div>
            </div>

            <ng-template #noProducts>
              <div class="empty-state text-center py-5">
                <i class="fa-solid fa-basket-shopping text-muted empty-icon mb-3"></i>
                <h3>No products found</h3>
                <p class="text-muted">Try adjusting your category filter or search keywords.</p>
                <button (click)="clearFilters()" class="btn-primary mt-3">Reset All Filters</button>
              </div>
            </ng-template>
          </main>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .product-page-container {
      background: #F8FAFC;
      min-height: calc(100vh - 120px);
    }
    .container { max-width: 1320px; margin: 0 auto; padding: 0 16px; }
    .py-4 { padding-top: 24px; padding-bottom: 32px; }
    .breadcrumbs { font-size: 0.85rem; color: #475569; }
    .catalog-layout {
      display: grid;
      grid-template-columns: 280px 1fr;
      gap: 28px;
    }
    .filter-card {
      background: #FFFFFF;
      border: 1px solid #E2E8F0;
      border-radius: 10px;
      padding: 18px;
      box-shadow: 0 1px 3px rgba(0,0,0,0.05);
    }
    .filter-title { font-size: 1rem; font-weight: 700; margin-bottom: 12px; color: #0B2D4D; }
    .cat-list {
      list-style: none;
      padding: 0;
      li {
        padding: 8px 12px;
        border-radius: 6px;
        cursor: pointer;
        font-size: 0.88rem;
        display: flex;
        justify-content: space-between;
        color: #334155;
        &:hover, &.active {
          background: rgba(8, 121, 209, 0.08);
          color: #0879D1;
          font-weight: 600;
        }
      }
    }
    .price-input {
      width: 100%;
      padding: 8px;
      border: 1px solid #CBD5E1;
      border-radius: 6px;
      font-size: 0.85rem;
    }
    .sort-dropdown {
      padding: 6px 12px;
      border: 1px solid #CBD5E1;
      border-radius: 6px;
      font-size: 0.88rem;
    }

    .products-grid {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 20px;
    }
    .product-card {
      background: #FFFFFF;
      border: 1px solid #E2E8F0;
      border-radius: 12px;
      padding: 16px;
      position: relative;
      transition: all 0.2s;
      box-shadow: 0 2px 6px rgba(0,0,0,0.04);
      &:hover {
        transform: translateY(-4px);
        box-shadow: 0 8px 20px rgba(8, 121, 209, 0.12);
        border-color: #0879D1;
      }
    }
    .prod-tag {
      position: absolute;
      top: 12px;
      left: 12px;
      background: rgba(8, 121, 209, 0.1);
      color: #0879D1;
      font-size: 0.7rem;
      font-weight: 700;
      padding: 2px 8px;
      border-radius: 4px;
    }
    .prod-img-box {
      height: 160px;
      display: flex;
      align-items: center;
      justify-content: center;
      margin: 16px 0 10px 0;
      cursor: pointer;
      img { max-height: 100%; max-width: 100%; object-fit: contain; }
    }
    .shop-badge { font-size: 0.75rem; color: #64748B; font-weight: 500; }
    .prod-title {
      font-size: 1rem;
      font-weight: 700;
      color: #1E293B;
      margin: 4px 0 2px 0;
      cursor: pointer;
      &:hover { color: #0879D1; }
    }
    .curr-price { font-size: 1.25rem; font-weight: 800; color: #0B2D4D; }
    .compare-price {
      font-size: 0.85rem;
      color: #94A3B8;
      text-decoration: line-through;
      margin-left: 6px;
    }
    .w-100 { width: 100%; }
    .empty-icon { font-size: 3rem; }

    @media (max-width: 900px) {
      .catalog-layout { grid-template-columns: 1fr; }
      .products-grid { grid-template-columns: repeat(2, 1fr); }
    }
  `]
})
export class ProductListComponent implements OnInit {
  products: Product[] = [];
  categories: Category[] = [];
  selectedCategory = '';
  searchQuery = '';
  minPrice: number | null = null;
  maxPrice: number | null = null;
  sortBy = 'created_at_desc';

  constructor(
    private apiService: ApiService,
    private route: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.apiService.getCategories().subscribe(res => {
      if (res.success) this.categories = res.results;
    });

    this.route.queryParams.subscribe(params => {
      this.selectedCategory = params['category'] || '';
      this.searchQuery = params['q'] || '';
      this.applyFilters();
    });
  }

  applyFilters(): void {
    const params: any = {};
    if (this.selectedCategory) params.category = this.selectedCategory;
    if (this.searchQuery) params.q = this.searchQuery;
    if (this.minPrice) params.min_price = this.minPrice;
    if (this.maxPrice) params.max_price = this.maxPrice;
    if (this.sortBy) params.sort = this.sortBy;

    this.apiService.getProducts(params).subscribe(res => {
      if (res.success) this.products = res.results;
    });
  }

  filterByCategory(slug: string): void {
    this.selectedCategory = slug;
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: { category: slug || null },
      queryParamsHandling: 'merge'
    });
  }

  clearFilters(): void {
    this.selectedCategory = '';
    this.searchQuery = '';
    this.minPrice = null;
    this.maxPrice = null;
    this.router.navigate(['/products']);
  }

  viewProduct(id: string): void {
    this.router.navigate(['/products', id]);
  }

  addToCart(product: Product): void {
    this.apiService.addToCart(product.id, 1).subscribe({
      next: () => {
        alert(`Added ${product.name} to cart!`);
      },
      error: (err) => {
        if (err.status === 401) {
          this.router.navigate(['/login']);
        } else {
          alert(err.error?.message || 'Could not add to cart.');
        }
      }
    });
  }

  onImgError(event: any): void {
    event.target.src = 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100" viewBox="0 0 100 100"><rect width="100" height="100" fill="%23F1F5F9"/><text x="50" y="55" font-family="Arial" font-size="28" text-anchor="middle">🛒</text></svg>';
  }
}
