import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '@shared/services/api.service';
import { Product } from '@shared/models/models';

@Component({
  selector: 'app-vendor-inventory',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="inventory-page">
      <div class="page-header">
        <div>
          <h2>📦 Inventory & Stock Control</h2>
          <p class="subtitle">Monitor real-time stock levels, update availability, and respond to low-stock alerts.</p>
        </div>
        <div class="header-actions">
          <button class="btn btn-outline" (click)="loadProducts()">🔄 Refresh</button>
        </div>
      </div>

      <!-- Quick Stats -->
      <div class="stats-row">
        <div class="stat-card">
          <span class="label">Total SKUs</span>
          <span class="val">{{ products.length }}</span>
        </div>
        <div class="stat-card warning">
          <span class="label">Low Stock (< 10)</span>
          <span class="val">{{ lowStockCount }}</span>
        </div>
        <div class="stat-card danger">
          <span class="label">Out of Stock</span>
          <span class="val">{{ outOfStockCount }}</span>
        </div>
        <div class="stat-card success">
          <span class="label">Active / Live</span>
          <span class="val">{{ activeCount }}</span>
        </div>
      </div>

      <!-- Filter Controls -->
      <div class="table-card">
        <div class="controls-bar">
          <div class="search-box">
            <span class="icon">🔍</span>
            <input type="text" [(ngModel)]="searchQuery" (input)="filterProducts()" placeholder="Filter by title or SKU..." />
          </div>
          <div class="filter-actions">
            <select [(ngModel)]="stockFilter" (change)="filterProducts()">
              <option value="all">All Stock Statuses</option>
              <option value="low">Low Stock (< 10)</option>
              <option value="out">Out of Stock</option>
              <option value="in">In Stock (10+)</option>
            </select>
          </div>
        </div>

        <div *ngIf="loading" class="loading-state">
          <div class="spinner"></div>
          <p>Syncing inventory records with database...</p>
        </div>

        <table *ngIf="!loading && filteredProducts.length > 0" class="data-table">
          <thead>
            <tr>
              <th>Product Details</th>
              <th>Category</th>
              <th>Price</th>
              <th>Current Stock</th>
              <th>Quick Adjustment</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr *ngFor="let p of filteredProducts">
              <td>
                <div class="product-cell">
                  <img [src]="p.image_url || 'assets/placeholder.jpg'" alt="" class="p-thumb" />
                  <div>
                    <strong class="p-title">{{ p.name }}</strong>
                    <span class="p-sku">SKU: {{ p.sku || 'SKU-' + p.id.substring(0, 6).toUpperCase() }}</span>
                  </div>
                </div>
              </td>
              <td><span class="cat-badge">{{ p.category_name || 'General' }}</span></td>
              <td><strong>₹{{ p.price_cents / 100 }}</strong></td>
              <td>
                <span class="stock-pill" [ngClass]="{
                  'pill-danger': p.stock_quantity <= 0,
                  'pill-warning': p.stock_quantity > 0 && p.stock_quantity < 10,
                  'pill-success': p.stock_quantity >= 10
                }">
                  {{ p.stock_quantity }} {{ p.unit || 'units' }}
                </span>
              </td>
              <td>
                <div class="stock-adjuster">
                  <button class="adj-btn" (click)="adjustStock(p, -5)">-5</button>
                  <button class="adj-btn" (click)="adjustStock(p, -1)">-1</button>
                  <input type="number" [(ngModel)]="p.stock_quantity" min="0" class="stock-input" />
                  <button class="adj-btn" (click)="adjustStock(p, 1)">+1</button>
                  <button class="adj-btn" (click)="adjustStock(p, 5)">+5</button>
                </div>
              </td>
              <td>
                <span class="status-indicator" [class.live]="p.is_available" [class.paused]="!p.is_available">
                  {{ p.is_available ? 'Live' : 'Paused' }}
                </span>
              </td>
              <td>
                <div class="action-buttons">
                  <button class="btn btn-sm btn-primary" (click)="saveStock(p)" [disabled]="savingId === p.id">
                    {{ savingId === p.id ? 'Saving...' : '💾 Save' }}
                  </button>
                  <button class="btn btn-sm btn-outline" (click)="toggleActive(p)">
                    {{ p.is_available ? 'Pause' : 'Activate' }}
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>

        <div *ngIf="!loading && filteredProducts.length === 0" class="empty-state">
          <p>No products match the selected criteria.</p>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .inventory-page {
      max-width: 1200px;
      margin: 0 auto;
    }
    .page-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 24px;
      h2 { margin: 0; font-size: 24px; color: var(--navy-dark); font-weight: 700; }
      .subtitle { margin: 4px 0 0 0; color: #64748b; font-size: 14px; }
    }
    .stats-row {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 16px;
      margin-bottom: 24px;
    }
    .stat-card {
      background: white;
      border-radius: 12px;
      padding: 18px 20px;
      border: 1px solid #e2e8f0;
      box-shadow: 0 1px 3px rgba(0,0,0,0.05);
      .label { display: block; font-size: 13px; font-weight: 600; color: #64748b; margin-bottom: 8px; }
      .val { font-size: 28px; font-weight: 800; color: var(--navy-dark); }
      &.warning .val { color: #d97706; }
      &.danger .val { color: #dc2626; }
      &.success .val { color: #16a34a; }
    }
    .table-card {
      background: white;
      border-radius: 14px;
      border: 1px solid #e2e8f0;
      padding: 20px;
      box-shadow: 0 1px 3px rgba(0,0,0,0.05);
    }
    .controls-bar {
      display: flex;
      justify-content: space-between;
      align-items: center;
      gap: 16px;
      margin-bottom: 20px;
      flex-wrap: wrap;
    }
    .search-box {
      display: flex;
      align-items: center;
      background: #f8fafc;
      border: 1px solid #cbd5e1;
      border-radius: 8px;
      padding: 8px 12px;
      min-width: 280px;
      .icon { margin-right: 8px; font-size: 14px; }
      input { border: none; background: transparent; outline: none; width: 100%; font-size: 14px; }
    }
    select {
      padding: 8px 12px;
      border: 1px solid #cbd5e1;
      border-radius: 8px;
      background: white;
      font-size: 14px;
      color: #334155;
    }
    .data-table {
      width: 100%;
      border-collapse: collapse;
      text-align: left;
      font-size: 14px;
      th {
        padding: 12px 14px;
        background: #f8fafc;
        color: #475569;
        font-weight: 600;
        border-bottom: 2px solid #e2e8f0;
      }
      td {
        padding: 14px;
        border-bottom: 1px solid #f1f5f9;
        vertical-align: middle;
      }
    }
    .product-cell {
      display: flex;
      align-items: center;
      gap: 12px;
      .p-thumb {
        width: 44px;
        height: 44px;
        border-radius: 8px;
        object-fit: cover;
        border: 1px solid #e2e8f0;
      }
      .p-title { display: block; color: #1e293b; font-size: 14px; }
      .p-sku { display: block; font-size: 11px; color: #94a3b8; margin-top: 2px; }
    }
    .cat-badge {
      background: #f1f5f9;
      color: #475569;
      padding: 4px 8px;
      border-radius: 6px;
      font-size: 12px;
      font-weight: 500;
    }
    .stock-pill {
      display: inline-block;
      padding: 4px 10px;
      border-radius: 20px;
      font-weight: 700;
      font-size: 12px;
      &.pill-success { background: #dcfce7; color: #15803d; }
      &.pill-warning { background: #fef3c7; color: #b45309; }
      &.pill-danger { background: #fee2e2; color: #b91c1c; }
    }
    .stock-adjuster {
      display: flex;
      align-items: center;
      gap: 4px;
      .adj-btn {
        background: #f1f5f9;
        border: 1px solid #cbd5e1;
        border-radius: 4px;
        font-size: 11px;
        padding: 4px 6px;
        cursor: pointer;
        &:hover { background: #e2e8f0; }
      }
      .stock-input {
        width: 60px;
        text-align: center;
        padding: 4px;
        border: 1px solid #cbd5e1;
        border-radius: 4px;
        font-weight: 700;
      }
    }
    .status-indicator {
      display: inline-flex;
      align-items: center;
      font-size: 12px;
      font-weight: 600;
      &:before {
        content: '';
        display: inline-block;
        width: 8px;
        height: 8px;
        border-radius: 50%;
        margin-right: 6px;
      }
      &.live { color: #16a34a; &:before { background: #16a34a; } }
      &.paused { color: #94a3b8; &:before { background: #94a3b8; } }
    }
    .action-buttons {
      display: flex;
      gap: 8px;
    }
    .btn {
      padding: 8px 16px;
      border-radius: 8px;
      font-weight: 600;
      cursor: pointer;
      border: none;
      transition: all 0.2s;
      &.btn-primary { background: var(--blue-primary); color: white; &:hover { background: #0662ab; } }
      &.btn-outline { background: white; border: 1px solid #cbd5e1; color: #334155; &:hover { background: #f8fafc; } }
      &.btn-sm { padding: 6px 10px; font-size: 12px; }
      &:disabled { opacity: 0.6; cursor: not-allowed; }
    }
    .loading-state, .empty-state {
      text-align: center;
      padding: 40px;
      color: #64748b;
    }
    .spinner {
      width: 32px;
      height: 32px;
      border: 3px solid #e2e8f0;
      border-top-color: var(--blue-primary);
      border-radius: 50%;
      animation: spin 1s linear infinite;
      margin: 0 auto 12px auto;
    }
    @keyframes spin { to { transform: rotate(360deg); } }
  `]
})
export class VendorInventoryComponent implements OnInit {
  products: Product[] = [];
  filteredProducts: Product[] = [];
  loading = true;
  savingId: string | null = null;
  searchQuery = '';
  stockFilter = 'all';

  get lowStockCount(): number {
    return this.products.filter(p => p.stock_quantity > 0 && p.stock_quantity < 10).length;
  }

  get outOfStockCount(): number {
    return this.products.filter(p => p.stock_quantity <= 0).length;
  }

  get activeCount(): number {
    return this.products.filter(p => p.is_available).length;
  }

  constructor(private api: ApiService) {}

  ngOnInit(): void {
    this.loadProducts();
  }

  loadProducts(): void {
    this.loading = true;
    this.api.getVendorProducts().subscribe({
      next: (res) => {
        this.products = res.results || [];
        this.filterProducts();
        this.loading = false;
      },
      error: () => {
        this.loading = false;
      }
    });
  }

  filterProducts(): void {
    this.filteredProducts = this.products.filter(p => {
      const matchesSearch = !this.searchQuery ||
        p.name.toLowerCase().includes(this.searchQuery.toLowerCase()) ||
        (p.sku && p.sku.toLowerCase().includes(this.searchQuery.toLowerCase()));

      let matchesStock = true;
      if (this.stockFilter === 'low') matchesStock = p.stock_quantity > 0 && p.stock_quantity < 10;
      if (this.stockFilter === 'out') matchesStock = p.stock_quantity <= 0;
      if (this.stockFilter === 'in') matchesStock = p.stock_quantity >= 10;

      return matchesSearch && matchesStock;
    });
  }

  adjustStock(p: Product, delta: number): void {
    p.stock_quantity = Math.max(0, (p.stock_quantity || 0) + delta);
  }

  saveStock(p: Product): void {
    this.savingId = p.id;
    this.api.updateVendorProduct(p.id, { stock_quantity: p.stock_quantity }).subscribe({
      next: () => {
        this.savingId = null;
      },
      error: () => {
        this.savingId = null;
      }
    });
  }

  toggleActive(p: Product): void {
    const newState = !p.is_available;
    this.api.updateVendorProduct(p.id, { is_available: newState }).subscribe({
      next: () => {
        p.is_available = newState;
      }
    });
  }
}
