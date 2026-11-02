import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { ApiService } from '../../../../../shared/services/api.service';
import { SellerOrder } from '../../../../../shared/models/models';

@Component({
  selector: 'app-vendor-orders',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="vendor-orders-view">
      <div class="d-flex justify-between align-center mb-4">
        <div>
          <h1>Order Fulfillment Queue</h1>
          <p class="text-sm text-muted">Incoming orders requiring packing and handover to delivery partner</p>
        </div>
      </div>

      <div class="data-table-container">
        <table class="clean-table">
          <thead>
            <tr>
              <th>Order Number</th>
              <th>Customer</th>
              <th>Items & Qty</th>
              <th>Total Amount</th>
              <th>Current Status</th>
              <th>Fulfillment Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr *ngFor="let o of orders">
              <td><strong>{{ o.parent_order_number }}</strong></td>
              <td>{{ o.customer_name }}</td>
              <td>
                <div *ngFor="let it of o.items">
                  <strong>{{ it.quantity }}x</strong> {{ it.name }}
                </div>
              </td>
              <td><strong class="text-blue">₹{{ (o.total_cents / 100).toFixed(0) }}</strong></td>
              <td>
                <span class="badge-status" [ngClass]="'status-' + o.status.toLowerCase()">
                  {{ o.status === 'CONFIRMED' ? 'Packed' : o.status }}
                </span>
              </td>
              <td>
                <div class="d-flex gap-2">
                  <button
                    *ngIf="o.status === 'PENDING'"
                    class="btn-mini btn-confirm"
                    (click)="transition(o.id, 'CONFIRMED')"
                  >
                    Pack Order
                  </button>
                  <button
                    *ngIf="o.status === 'CONFIRMED'"
                    class="btn-mini btn-ship"
                    (click)="transition(o.id, 'SHIPPED')"
                  >
                    Hand to Rider
                  </button>
                  <button
                    *ngIf="o.status === 'SHIPPED'"
                    class="btn-mini btn-deliver"
                    (click)="transition(o.id, 'DELIVERED')"
                  >
                    Mark Delivered
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  `,
  styles: [`
    .btn-mini {
      padding: 4px 10px;
      border-radius: 4px;
      font-size: 0.75rem;
      font-weight: 700;
      border: none;
      cursor: pointer;
    }
    .btn-confirm { background: #0879D1; color: #FFF; }
    .btn-ship { background: #FF8A24; color: #FFF; }
    .btn-deliver { background: #16A34A; color: #FFF; }
  `]
})
export class VendorOrdersComponent implements OnInit {
  orders: SellerOrder[] = [];

  constructor(private apiService: ApiService, private router: Router) {}

  ngOnInit(): void {
    this.loadOrders();
  }

  loadOrders(): void {
    this.apiService.getVendorOrders().subscribe({
      next: (res) => {
        if (res.success) this.orders = res.results;
      },
      error: () => this.router.navigate(['/login'])
    });
  }

  transition(id: string, status: string): void {
    this.apiService.transitionVendorOrder(id, status).subscribe({
      next: () => {
        alert(`Order updated to ${status}!`);
        this.loadOrders();
      },
      error: (err) => alert(err.error?.message || 'Transition failed.')
    });
  }
}
