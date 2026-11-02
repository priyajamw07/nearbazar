import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '@shared/services/api.service';
import { Shop } from '@shared/models/models';

@Component({
  selector: 'app-admin-shops',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="shops-page">
      <div class="page-header">
        <div>
          <h2>Merchant Shops & Storefront Control</h2>
          <p class="subtitle">Platform shop directory, operating licenses, and status governance.</p>
        </div>
        <button class="btn btn-outline" (click)="loadShops()">🔄 Refresh</button>
      </div>

      <div class="table-card">
        <div *ngIf="loading" class="loading-state">
          <div class="spinner"></div>
          <p>Loading shop registry...</p>
        </div>

        <table *ngIf="!loading" class="data-table">
          <thead>
            <tr>
              <th>Storefront</th>
              <th>Category</th>
              <th>City / Area</th>
              <th>Rating</th>
              <th>Operating Status</th>
              <th>Verification</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr *ngFor="let s of shops">
              <td>
                <div class="shop-cell">
                  <img [src]="s.logo || 'assets/placeholder.jpg'" alt="" class="s-logo" />
                  <div>
                    <strong>{{ s.name }}</strong>
                    <span class="s-slug">/shops/{{ s.slug }}</span>
                  </div>
                </div>
              </td>
              <td><span class="badge cat">{{ s.category_name || 'Retail' }}</span></td>
              <td>{{ s.city }}</td>
              <td>⭐ {{ s.rating || 4.5 }}</td>
              <td>
                <span class="badge" [ngClass]="s.is_active ? 'badge-live' : 'badge-paused'">
                  {{ s.is_active ? 'Active' : 'Suspended' }}
                </span>
              </td>
              <td>
                <span class="badge" [ngClass]="s.is_verified ? 'badge-verified' : 'badge-unverified'">
                  {{ s.is_verified ? 'Verified' : 'Pending' }}
                </span>
              </td>
              <td>
                <button class="btn btn-sm" [ngClass]="s.is_active ? 'btn-warn' : 'btn-success'" (click)="toggleShopStatus(s)">
                  {{ s.is_active ? 'Suspend' : 'Reinstate' }}
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  `,
  styles: [`
    .shops-page { max-width: 1300px; margin: 0 auto; }
    .page-header {
      display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px;
      h2 { margin: 0; font-size: 24px; font-weight: 700; color: var(--navy-deep); }
      .subtitle { margin: 4px 0 0 0; color: #64748b; font-size: 14px; }
    }
    .table-card {
      background: white; border-radius: 12px; border: 1px solid #e2e8f0; overflow: hidden;
      box-shadow: 0 1px 3px rgba(0,0,0,0.05);
    }
    .data-table {
      width: 100%; border-collapse: collapse; text-align: left; font-size: 13px;
      th { padding: 12px 16px; background: #f8fafc; color: #475569; font-weight: 600; border-bottom: 2px solid #e2e8f0; }
      td { padding: 14px 16px; border-bottom: 1px solid #f1f5f9; vertical-align: middle; }
    }
    .shop-cell {
      display: flex; align-items: center; gap: 12px;
      .s-logo { width: 38px; height: 38px; border-radius: 8px; object-fit: cover; border: 1px solid #e2e8f0; }
      .s-slug { display: block; font-size: 11px; color: #94a3b8; }
    }
    .badge {
      display: inline-block; padding: 3px 8px; border-radius: 4px; font-size: 11px; font-weight: 700;
      &.cat { background: #f1f5f9; color: #475569; }
      &.badge-live { background: #dcfce7; color: #15803d; }
      &.badge-paused { background: #fee2e2; color: #b91c1c; }
      &.badge-verified { background: #e0f2fe; color: #0369a1; }
      &.badge-unverified { background: #fef3c7; color: #b45309; }
    }
    .btn {
      padding: 6px 12px; border-radius: 6px; font-weight: 600; cursor: pointer; border: none; font-size: 12px;
      &.btn-outline { background: white; border: 1px solid #cbd5e1; color: #334155; }
      &.btn-warn { background: #fed7aa; color: #9a3412; }
      &.btn-success { background: #dcfce7; color: #15803d; }
      &.btn-sm { padding: 4px 10px; }
    }
    .loading-state { text-align: center; padding: 40px; color: #94a3b8; }
    .spinner {
      width: 28px; height: 28px; border: 3px solid #e2e8f0; border-top-color: #0879D1;
      border-radius: 50%; animation: spin 1s linear infinite; margin: 0 auto 12px auto;
    }
    @keyframes spin { to { transform: rotate(360deg); } }
  `]
})
export class AdminShopsComponent implements OnInit {
  shops: Shop[] = [];
  loading = true;

  constructor(private api: ApiService) {}

  ngOnInit(): void {
    this.loadShops();
  }

  loadShops(): void {
    this.loading = true;
    this.api.getAdminShops().subscribe({
      next: (res) => {
        this.shops = res.results || [];
        this.loading = false;
      },
      error: () => {
        this.loading = false;
      }
    });
  }

  toggleShopStatus(shop: Shop): void {
    const newActive = !shop.is_active;
    const statusStr = newActive ? 'APPROVED' : 'SUSPENDED';
    this.api.updateShopStatus(shop.id, statusStr).subscribe({
      next: () => {
        shop.is_active = newActive;
      }
    });
  }
}
