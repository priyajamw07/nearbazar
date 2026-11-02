import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../../../../shared/services/api.service';
import { CartDetails, Address } from '../../../../../shared/models/models';

@Component({
  selector: 'app-checkout',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  template: `
    <div class="checkout-page-bg py-5">
      <div class="container">
        <h1 class="checkout-title mb-4">
          <i class="fa-solid fa-truck-fast text-orange mr-2"></i>
          Secure Checkout • Ghar Tak
        </h1>

        <div class="checkout-grid" *ngIf="cart">
          <!-- Left: Address & Payment Details -->
          <div class="checkout-form-column">
            <!-- Step 1: Delivery Address -->
            <div class="checkout-card mb-4">
              <div class="card-step-header d-flex align-center gap-3">
                <span class="step-num">1</span>
                <div>
                  <h3>Delivery Address</h3>
                  <small class="text-muted">Where should our neighborhood rider deliver your goods?</small>
                </div>
              </div>

              <div class="address-form mt-4">
                <div class="form-row d-flex gap-3 mb-3">
                  <div class="form-group flex-1">
                    <label>Address Title</label>
                    <input type="text" [(ngModel)]="address.title" class="form-input" placeholder="e.g. Home, Office" />
                  </div>
                  <div class="form-group flex-1">
                    <label>Phone Number *</label>
                    <input type="text" [(ngModel)]="address.phone" class="form-input" placeholder="+91 98765 43210" required />
                  </div>
                </div>

                <div class="form-group mb-3">
                  <label>House / Flat / Street *</label>
                  <input type="text" [(ngModel)]="address.street" class="form-input" placeholder="Flat 302, Palm Heights, Main Market Road" required />
                </div>

                <div class="form-row d-flex gap-3 mb-3">
                  <div class="form-group flex-1">
                    <label>Landmark (Optional)</label>
                    <input type="text" [(ngModel)]="address.landmark" class="form-input" placeholder="Near Shiv Mandir" />
                  </div>
                  <div class="form-group flex-1">
                    <label>City *</label>
                    <input type="text" [(ngModel)]="address.city" class="form-input" placeholder="Delhi NCR" required />
                  </div>
                  <div class="form-group flex-1">
                    <label>Pincode *</label>
                    <input type="text" [(ngModel)]="address.pincode" class="form-input" placeholder="110001" required />
                  </div>
                </div>
              </div>
            </div>

            <!-- Step 2: Payment Selection -->
            <div class="checkout-card mb-4">
              <div class="card-step-header d-flex align-center gap-3">
                <span class="step-num">2</span>
                <div>
                  <h3>Payment Method</h3>
                  <small class="text-muted">Select how you prefer to pay for your local order</small>
                </div>
              </div>

              <div class="payment-options-grid mt-4">
                <label class="payment-option-card d-flex align-center gap-3" [class.selected]="paymentMethod === 'ONLINE'">
                  <input type="radio" name="paymentMethod" value="ONLINE" [(ngModel)]="paymentMethod" />
                  <div class="payment-icon-box text-blue"><i class="fa-solid fa-credit-card"></i></div>
                  <div>
                    <strong>Online Payment (UPI, Cards, NetBanking)</strong>
                    <p class="text-xs text-muted">Instant cryptographic verification via payment gateway sandbox</p>
                  </div>
                </label>

                <label class="payment-option-card d-flex align-center gap-3 mt-3" [class.selected]="paymentMethod === 'COD'">
                  <input type="radio" name="paymentMethod" value="COD" [(ngModel)]="paymentMethod" />
                  <div class="payment-icon-box text-orange"><i class="fa-solid fa-hand-holding-dollar"></i></div>
                  <div>
                    <strong>Cash on Delivery (Ghar Tak COD)</strong>
                    <p class="text-xs text-muted">Pay the delivery rider in cash or UPI upon delivery</p>
                  </div>
                </label>
              </div>
            </div>
          </div>

          <!-- Right: Order Review & Placement -->
          <div class="checkout-review-column">
            <div class="checkout-card sticky-card">
              <h3 class="review-title mb-3">Order Summary</h3>

              <div class="items-mini-list mb-3">
                <div class="mini-item-row d-flex justify-between" *ngFor="let item of cart.items">
                  <span>{{ item.quantity }}x {{ item.name }}</span>
                  <strong>₹{{ (item.total_cents / 100).toFixed(0) }}</strong>
                </div>
              </div>

              <hr class="divider mb-3">

              <div class="summary-line d-flex justify-between py-1">
                <span>Items Subtotal</span>
                <strong>₹{{ (cart.subtotal_cents / 100).toFixed(0) }}</strong>
              </div>

              <div class="summary-line d-flex justify-between py-1">
                <span>Delivery ({{ cart.shops.length }} Shops)</span>
                <strong class="text-orange">₹{{ (cart.delivery_fee_cents / 100).toFixed(0) }}</strong>
              </div>

              <hr class="divider my-3">

              <div class="total-line d-flex justify-between align-center mb-4">
                <span class="total-tag">Final Total</span>
                <span class="total-val">₹{{ (cart.total_cents / 100).toFixed(0) }}</span>
              </div>

              <button
                class="btn-orange w-100 py-3"
                (click)="placeOrder()"
                [disabled]="isSubmitting"
              >
                <i class="fa-solid fa-lock mr-2"></i>
                {{ isSubmitting ? 'Processing Order...' : 'Confirm & Place Order' }}
              </button>

              <div class="mt-3 text-center text-xs text-muted">
                Server-authoritative pricing & stock check verified.
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .checkout-page-bg { background: #F8FAFC; min-height: calc(100vh - 120px); }
    .container { max-width: 1200px; margin: 0 auto; padding: 0 16px; }
    .py-5 { padding-top: 36px; padding-bottom: 48px; }
    .mb-3 { margin-bottom: 16px; }
    .mb-4 { margin-bottom: 24px; }
    .mt-3 { margin-top: 14px; }
    .mt-4 { margin-top: 20px; }
    .py-1 { padding: 4px 0; }
    .py-3 { padding: 12px 0; }
    .w-100 { width: 100%; }
    .flex-1 { flex: 1; }
    .checkout-title { font-size: 1.8rem; font-weight: 800; color: #0B2D4D; }

    .checkout-grid {
      display: grid;
      grid-template-columns: 1fr 380px;
      gap: 28px;
    }
    .checkout-card {
      background: #FFFFFF;
      border: 1px solid #E2E8F0;
      border-radius: 12px;
      padding: 24px;
      box-shadow: 0 2px 8px rgba(0,0,0,0.04);
    }
    .card-step-header h3 { font-size: 1.15rem; font-weight: 800; color: #0B2D4D; margin: 0; }
    .step-num {
      width: 32px;
      height: 32px;
      background: #0879D1;
      color: #FFF;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: 800;
      font-size: 0.95rem;
    }
    .form-group label {
      display: block;
      font-size: 0.82rem;
      font-weight: 600;
      color: #475569;
      margin-bottom: 6px;
    }
    .form-input {
      width: 100%;
      padding: 10px 14px;
      border: 1px solid #CBD5E1;
      border-radius: 8px;
      font-size: 0.9rem;
      &:focus { border-color: #0879D1; outline: none; }
    }
    .payment-option-card {
      border: 2px solid #E2E8F0;
      border-radius: 10px;
      padding: 14px;
      cursor: pointer;
      transition: all 0.2s;
      &.selected {
        border-color: #0879D1;
        background: rgba(8, 121, 209, 0.04);
      }
    }
    .payment-icon-box {
      font-size: 1.5rem;
    }

    .sticky-card { position: sticky; top: 90px; }
    .review-title { font-size: 1.2rem; font-weight: 800; color: #0B2D4D; }
    .mini-item-row { font-size: 0.85rem; color: #475569; margin-bottom: 6px; }
    .divider { border: none; border-top: 1px solid #E2E8F0; }
    .summary-line { font-size: 0.9rem; color: #475569; }
    .total-tag { font-size: 1.1rem; font-weight: 800; color: #0B2D4D; }
    .total-val { font-size: 1.45rem; font-weight: 900; color: #0879D1; }

    @media (max-width: 900px) {
      .checkout-grid { grid-template-columns: 1fr; }
    }
  `]
})
export class CheckoutComponent implements OnInit {
  cart: CartDetails | null = null;
  paymentMethod = 'ONLINE';
  isSubmitting = false;

  address: Address = {
    title: 'Home',
    street: 'Flat 302, Palm Heights, Main Market Road',
    city: 'Delhi NCR',
    pincode: '110001',
    phone: '+91 98765 43210',
    landmark: 'Near Shiv Mandir'
  };

  constructor(private apiService: ApiService, private router: Router) {}

  ngOnInit(): void {
    this.apiService.getCart().subscribe({
      next: (res) => {
        if (res.success && res.cart && res.cart.items.length > 0) {
          this.cart = res.cart;
        } else {
          this.router.navigate(['/cart']);
        }
      },
      error: () => this.router.navigate(['/login'])
    });
  }

  placeOrder(): void {
    if (!this.address.street || !this.address.city || !this.address.pincode || !this.address.phone) {
      alert('Please fill out all required address fields.');
      return;
    }

    this.isSubmitting = true;
    const idempotencyKey = `idemp_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;

    const payload = {
      shipping_address: this.address,
      payment_method: this.paymentMethod,
      idempotency_key: idempotencyKey
    };

    this.apiService.checkout(payload).subscribe({
      next: (res) => {
        this.isSubmitting = false;
        if (res.success && res.order) {
          this.router.navigate(['/orders', res.order.id, 'tracking']);
        }
      },
      error: (err) => {
        this.isSubmitting = false;
        alert(err.error?.message || 'Checkout failed. Please try again.');
      }
    });
  }
}
