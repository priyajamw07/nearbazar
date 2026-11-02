import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { ApiService } from '../../../../../shared/services/api.service';
import { Order } from '../../../../../shared/models/models';

@Component({
  selector: 'app-orders',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="orders-page-bg py-5">
      <div class="container">
        <h1 class="orders-title mb-4">
          <i class="fa-solid fa-box-open text-orange mr-2"></i>
          Your Order History
        </h1>

        <div class="orders-list" *ngIf="orders.length > 0; else noOrders">
          <div class="order-card mb-4" *ngFor="let o of orders">
            <div class="order-card-header d-flex justify-between align-center">
              <div>
                <span class="order-num-label">Order #<strong>{{ o.order_number }}</strong></span>
                <span class="order-date text-xs text-muted ml-3">Placed on {{ formatDate(o.created_at) }}</span>
              </div>
              <div class="d-flex align-center gap-2">
                <span class="badge" [ngClass]="getStatusBadgeClass(o.fulfillment_status)">
                  {{ o.fulfillment_status }}
                </span>
                <a [routerLink]="['/orders', o.id, 'tracking']" class="btn-track">
                  <i class="fa-solid fa-motorcycle mr-1"></i> Track Live
                </a>
              </div>
            </div>

            <div class="order-card-body">
              <div class="items-summary d-flex gap-4">
                <div class="order-item-chip" *ngFor="let item of o.items">
                  <strong>{{ item.quantity }}x</strong> {{ item.name }}
                  <span class="item-shop-tag">({{ item.shop_name }})</span>
                </div>
              </div>

              <div class="order-card-footer d-flex justify-between align-center mt-3 pt-3">
                <div class="payment-info text-sm">
                  <span>Payment: <strong>{{ o.payment_method }} ({{ o.payment_status }})</strong></span>
                  <span class="ml-3">Delivery: <strong>Sector 14, Delhi NCR</strong></span>
                </div>
                <div class="total-box">
                  <span class="text-sm text-muted mr-2">Total Paid:</span>
                  <strong class="order-total-price">₹{{ (o.total_cents / 100).toFixed(0) }}</strong>
                </div>
              </div>
            </div>
          </div>
        </div>

        <ng-template #noOrders>
          <div class="empty-orders-card text-center py-5">
            <i class="fa-solid fa-clock-rotate-left empty-icon mb-3"></i>
            <h3>No past orders found</h3>
            <p class="text-muted">Place an order from any local shop in your neighborhood.</p>
            <a routerLink="/products" class="btn-primary mt-3">Browse Marketplace</a>
          </div>
        </ng-template>
      </div>
    </div>
  `,
  styles: [`
    .orders-page-bg { background: #F8FAFC; min-height: calc(100vh - 120px); }
    .container { max-width: 1000px; margin: 0 auto; padding: 0 16px; }
    .py-5 { padding-top: 36px; padding-bottom: 48px; }
    .mb-3 { margin-bottom: 16px; }
    .mb-4 { margin-bottom: 24px; }
    .mt-3 { margin-top: 14px; }
    .pt-3 { padding-top: 14px; }
    .ml-3 { margin-left: 12px; }
    .mr-1 { margin-right: 4px; }
    .mr-2 { margin-right: 8px; }
    .orders-title { font-size: 1.8rem; font-weight: 800; color: #0B2D4D; }

    .order-card {
      background: #FFFFFF;
      border: 1px solid #E2E8F0;
      border-radius: 12px;
      overflow: hidden;
      box-shadow: 0 2px 8px rgba(0,0,0,0.04);
    }
    .order-card-header {
      background: #F1F5F9;
      padding: 14px 20px;
      border-bottom: 1px solid #E2E8F0;
    }
    .order-num-label { font-size: 0.95rem; color: #0B2D4D; }
    .btn-track {
      background: #0879D1;
      color: #FFF;
      font-size: 0.8rem;
      font-weight: 700;
      padding: 6px 14px;
      border-radius: 6px;
      text-decoration: none;
      &:hover { background: darken(#0879D1, 8%); }
    }
    .order-card-body { padding: 18px 20px; }
    .items-summary { flex-wrap: wrap; }
    .order-item-chip {
      background: #F8FAFC;
      border: 1px solid #E2E8F0;
      padding: 6px 12px;
      border-radius: 6px;
      font-size: 0.85rem;
      color: #1E293B;
    }
    .item-shop-tag { font-size: 0.75rem; color: #0879D1; margin-left: 4px; }
    .order-card-footer { border-top: 1px solid #F1F5F9; }
    .order-total-price { font-size: 1.25rem; font-weight: 900; color: #0B2D4D; }

    .empty-orders-card {
      background: #FFF;
      border-radius: 12px;
      border: 1px solid #E2E8F0;
      padding: 60px 20px;
    }
    .empty-icon { font-size: 3.5rem; color: #CBD5E1; }
  `]
})
export class OrdersComponent implements OnInit {
  orders: Order[] = [];

  constructor(private apiService: ApiService, private router: Router) {}

  ngOnInit(): void {
    this.apiService.getCustomerOrders().subscribe({
      next: (res) => {
        if (res.success) {
          this.orders = res.results;
        }
      },
      error: () => this.router.navigate(['/login'])
    });
  }

  formatDate(dateStr: string): string {
    if (!dateStr) return '';
    const d = new Date(dateStr);
    return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
  }

  getStatusBadgeClass(status: string): string {
    switch (status) {
      case 'DELIVERED': return 'badge-success';
      case 'SHIPPED': return 'badge-info';
      case 'PROCESSING': return 'badge-warning';
      default: return 'badge-info';
    }
  }
}
