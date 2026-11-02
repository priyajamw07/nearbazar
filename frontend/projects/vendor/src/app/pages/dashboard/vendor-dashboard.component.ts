import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../../../../shared/services/api.service';
import { SellerOrder } from '../../../../../shared/models/models';

@Component({
  selector: 'app-vendor-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  template: `
    <div class="dashboard-content">
      <!-- Page Top Header Bar -->
      <div class="d-flex justify-between align-center mb-4">
        <div>
          <h1 class="page-main-title">Shopkeeper Dashboard</h1>
          <p class="text-sm text-muted">Daily operations, incoming order queue, and local sales</p>
        </div>
        <div class="d-flex align-center gap-2">
          <button (click)="openAddProductModal()" class="btn-primary">
            <i class="fa-solid fa-plus mr-1"></i> Add New Product
          </button>
        </div>
      </div>

      <!-- KPI Stat Cards matching reference image: ₹12,450 / 18 / 312 -->
      <div class="kpi-cards-grid mb-4">
        <!-- Total Sales -->
        <div class="kpi-card">
          <div>
            <span class="text-xs text-muted font-bold d-block mb-1">Total Sales</span>
            <h2 class="kpi-val text-blue">{{ kpiData.total_sales_formatted || '₹12,450' }}</h2>
            <small class="text-success text-xs font-bold"><i class="fa-solid fa-arrow-trend-up mr-1"></i> +14.2% this week</small>
          </div>
          <div class="kpi-icon-bubble bubble-blue">
            <i class="fa-solid fa-indian-rupee-sign"></i>
          </div>
        </div>

        <!-- New Orders -->
        <div class="kpi-card">
          <div>
            <span class="text-xs text-muted font-bold d-block mb-1">New Orders</span>
            <h2 class="kpi-val text-purple">{{ kpiData.new_orders || 18 }}</h2>
            <small class="text-muted text-xs">Ready for packing</small>
          </div>
          <div class="kpi-icon-bubble bubble-purple">
            <i class="fa-solid fa-receipt"></i>
          </div>
        </div>

        <!-- Products Live -->
        <div class="kpi-card">
          <div>
            <span class="text-xs text-muted font-bold d-block mb-1">Products Live</span>
            <h2 class="kpi-val text-green">{{ kpiData.products_live || 312 }}</h2>
            <small class="text-muted text-xs">In local marketplace</small>
          </div>
          <div class="kpi-icon-bubble bubble-green">
            <i class="fa-solid fa-boxes-stacked"></i>
          </div>
        </div>
      </div>

      <!-- Sales Performance Chart Mini Preview -->
      <div class="chart-summary-card mb-4 p-3">
        <div class="d-flex justify-between align-center mb-2">
          <h3 class="text-sm font-bold text-dark-blue">Weekly Sales Activity</h3>
          <span class="text-xs text-muted">Daily Store Revenue</span>
        </div>
        <div class="bars-container d-flex gap-3 align-end">
          <div class="chart-bar-item flex-1 text-center" *ngFor="let s of salesChart">
            <div class="bar-fill" [style.height.px]="s.sales / 30"></div>
            <span class="bar-label text-xs mt-1 d-block">{{ s.day }}</span>
            <strong class="bar-val text-xs text-blue">₹{{ s.sales }}</strong>
          </div>
        </div>
      </div>

      <!-- Recent Orders Table matching reference image -->
      <div class="data-table-container">
        <div class="table-header-bar d-flex justify-between align-center">
          <div>
            <h3 class="text-md font-bold text-dark-blue">Recent Orders</h3>
            <small class="text-muted text-xs">Orders from customers nearby waiting for Ghar Tak pickup</small>
          </div>
          <a routerLink="/orders" class="btn-text text-sm font-bold text-blue">View All Orders</a>
        </div>

        <table class="clean-table">
          <thead>
            <tr>
              <th>Order ID</th>
              <th>Customer</th>
              <th>Items</th>
              <th>Amount</th>
              <th>Status</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            <tr *ngFor="let order of recentOrders">
              <td><strong>{{ order.parent_order_number.split('-')[2] || order.parent_order_number }}</strong></td>
              <td>{{ order.customer_name }}</td>
              <td>
                <span class="text-xs font-semibold" *ngIf="order.items && order.items.length > 0">
                  {{ order.items[0].name }} <span *ngIf="order.items.length > 1">+{{ order.items.length - 1 }} more</span>
                </span>
              </td>
              <td><strong class="text-blue">₹{{ (order.total_cents / 100).toFixed(0) }}</strong></td>
              <td>
                <span class="badge-status" [ngClass]="'status-' + order.status.toLowerCase()">
                  {{ order.status === 'CONFIRMED' ? 'Packed' : order.status }}
                </span>
              </td>
              <td>
                <button (click)="openStatusModal(order)" class="btn-status-action">
                  Update Status
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Modal: Update Order Status -->
      <div class="modal-backdrop" *ngIf="selectedOrder">
        <div class="modal-box">
          <div class="modal-header d-flex justify-between align-center mb-3">
            <h3>Update Fulfillment Status</h3>
            <button class="modal-close" (click)="selectedOrder = null">&times;</button>
          </div>
          <p class="text-sm mb-3">
            Order: <strong>{{ selectedOrder.parent_order_number }}</strong><br>
            Current Status: <span class="badge-status status-processing">{{ selectedOrder.status }}</span>
          </p>

          <div class="status-options-list mb-3">
            <button class="btn-status-choice" (click)="transitionStatus('CONFIRMED')">
              <i class="fa-solid fa-box-archive mr-2 text-green"></i> Mark as Packed (Confirmed)
            </button>
            <button class="btn-status-choice" (click)="transitionStatus('PROCESSING')">
              <i class="fa-solid fa-spinner mr-2 text-blue"></i> Mark as Processing
            </button>
            <button class="btn-status-choice" (click)="transitionStatus('SHIPPED')">
              <i class="fa-solid fa-motorcycle mr-2 text-orange"></i> Hand Over to Rider (Shipped)
            </button>
            <button class="btn-status-choice" (click)="transitionStatus('DELIVERED')">
              <i class="fa-solid fa-check mr-2 text-success"></i> Mark as Delivered
            </button>
          </div>
        </div>
      </div>

      <!-- Modal: Quick Add Product -->
      <div class="modal-backdrop" *ngIf="showAddModal">
        <div class="modal-box">
          <div class="modal-header d-flex justify-between align-center mb-3">
            <h3>Add New Product to Shop</h3>
            <button class="modal-close" (click)="showAddModal = false">&times;</button>
          </div>
          <form (ngSubmit)="submitProduct()">
            <div class="form-group mb-2">
              <label class="text-xs font-bold">Product Name *</label>
              <input type="text" [(ngModel)]="newProd.name" name="name" class="form-input" required />
            </div>
            <div class="form-row d-flex gap-2 mb-2">
              <div class="flex-1">
                <label class="text-xs font-bold">Price (₹) *</label>
                <input type="number" [(ngModel)]="newProd.price" name="price" class="form-input" required />
              </div>
              <div class="flex-1">
                <label class="text-xs font-bold">Compare Price (₹)</label>
                <input type="number" [(ngModel)]="newProd.comparePrice" name="comparePrice" class="form-input" />
              </div>
            </div>
            <div class="form-row d-flex gap-2 mb-2">
              <div class="flex-1">
                <label class="text-xs font-bold">Stock Quantity *</label>
                <input type="number" [(ngModel)]="newProd.stock" name="stock" class="form-input" required />
              </div>
              <div class="flex-1">
                <label class="text-xs font-bold">Unit *</label>
                <input type="text" [(ngModel)]="newProd.unit" name="unit" class="form-input" placeholder="e.g. 1 kg, 1 pc" required />
              </div>
            </div>
            <div class="form-group mb-3">
              <label class="text-xs font-bold">SKU Code *</label>
              <input type="text" [(ngModel)]="newProd.sku" name="sku" class="form-input" placeholder="e.g. SHM-010" required />
            </div>
            <button type="submit" class="btn-primary w-100 py-2">Create Product</button>
          </form>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .page-main-title { font-size: 1.6rem; font-weight: 800; color: #0B2D4D; }
    .kpi-cards-grid {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 20px;
    }
    .kpi-val { font-size: 1.85rem; font-weight: 900; line-height: 1.1; margin: 0; }
    .text-purple { color: #9333EA; }
    .text-green { color: #16A34A; }
    .align-end { align-items: flex-end; }
    .w-100 { width: 100%; }
    .flex-1 { flex: 1; }

    .chart-summary-card {
      background: #FFFFFF;
      border: 1px solid #E2E8F0;
      border-radius: 12px;
    }
    .bars-container {
      height: 120px;
      padding-top: 10px;
    }
    .bar-fill {
      background: linear-gradient(180deg, #35D9FF, #0879D1);
      border-radius: 4px 4px 0 0;
      margin: 0 auto;
      width: 32px;
      min-height: 10px;
      transition: height 0.3s;
    }

    .btn-status-action {
      background: rgba(8, 121, 209, 0.1);
      color: #0879D1;
      padding: 6px 12px;
      border-radius: 6px;
      font-size: 0.78rem;
      font-weight: 700;
      border: 1px solid rgba(8, 121, 209, 0.2);
      &:hover { background: #0879D1; color: #FFF; }
    }

    .modal-backdrop {
      position: fixed;
      inset: 0;
      background: rgba(0,0,0,0.5);
      backdrop-filter: blur(4px);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 1000;
    }
    .modal-box {
      background: #FFF;
      border-radius: 12px;
      padding: 24px;
      width: 100%;
      max-width: 440px;
      box-shadow: 0 10px 30px rgba(0,0,0,0.2);
    }
    .modal-close { background: none; font-size: 1.5rem; cursor: pointer; }
    .btn-status-choice {
      display: block;
      width: 100%;
      text-align: left;
      padding: 10px 14px;
      background: #F8FAFC;
      border: 1px solid #E2E8F0;
      border-radius: 8px;
      font-size: 0.88rem;
      font-weight: 600;
      margin-bottom: 8px;
      cursor: pointer;
      &:hover { background: #0879D1; color: #FFF; }
    }
    .form-input {
      width: 100%;
      padding: 8px 12px;
      border: 1px solid #CBD5E1;
      border-radius: 6px;
      font-size: 0.88rem;
    }

    @media (max-width: 900px) {
      .kpi-cards-grid { grid-template-columns: 1fr; }
    }
  `]
})
export class VendorDashboardComponent implements OnInit {
  kpiData: any = {};
  salesChart: any[] = [];
  recentOrders: SellerOrder[] = [];
  selectedOrder: SellerOrder | null = null;
  showAddModal = false;

  newProd = {
    name: '',
    price: 50,
    comparePrice: 65,
    stock: 50,
    unit: '1 kg',
    sku: 'SHM-' + Math.floor(Math.random() * 900 + 100)
  };

  constructor(private apiService: ApiService, private router: Router) {}

  ngOnInit(): void {
    this.loadDashboard();
  }

  loadDashboard(): void {
    this.apiService.getVendorAnalytics().subscribe({
      next: (res) => {
        if (res.success) {
          this.kpiData = res.kpi;
          this.salesChart = res.sales_chart || [];
          this.recentOrders = res.recent_orders || [];
        }
      },
      error: () => this.router.navigate(['/login'])
    });
  }

  openStatusModal(order: SellerOrder): void {
    this.selectedOrder = order;
  }

  transitionStatus(status: string): void {
    if (!this.selectedOrder) return;
    this.apiService.transitionVendorOrder(this.selectedOrder.id, status).subscribe({
      next: (res) => {
        if (res.success) {
          alert(`Order transitioned to ${status}!`);
          this.selectedOrder = null;
          this.loadDashboard();
        }
      },
      error: (err) => alert(err.error?.message || 'Transition failed.')
    });
  }

  openAddProductModal(): void {
    this.showAddModal = true;
  }

  submitProduct(): void {
    const payload = {
      name: this.newProd.name,
      category_id: 'vegetables',
      category_name: 'Groceries',
      description: 'Fresh local product',
      sku: this.newProd.sku,
      price_cents: Math.round(this.newProd.price * 100),
      compare_price_cents: Math.round((this.newProd.comparePrice || this.newProd.price) * 100),
      stock_quantity: this.newProd.stock,
      unit: this.newProd.unit,
      is_available: true
    };

    this.apiService.createVendorProduct(payload).subscribe({
      next: () => {
        alert('Product added successfully!');
        this.showAddModal = false;
        this.loadDashboard();
      },
      error: (err) => alert(err.error?.message || 'Failed to create product.')
    });
  }
}
