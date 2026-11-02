import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../../../../shared/services/api.service';

@Component({
  selector: 'app-vendor-apply',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  template: `
    <div class="apply-page-bg py-5">
      <div class="container">
        <div class="apply-card">
          <div class="apply-header text-center mb-4">
            <span class="badge badge-warning text-xs font-bold mb-2">SELL ON NEARBYBAZAAR</span>
            <h1 class="apply-title">Expand Your Local Dukaan Digitally</h1>
            <p class="text-muted text-sm">Join hundreds of neighborhood shops offering 30-min delivery Ghar Tak</p>
          </div>

          <div class="benefits-row d-flex justify-between gap-3 mb-4">
            <div class="benefit-box">
              <i class="fa-solid fa-motorcycle text-orange"></i>
              <strong>Free Rider Fleet</strong>
              <small>NearbyBazaar riders pick up from your counter</small>
            </div>
            <div class="benefit-box">
              <i class="fa-solid fa-chart-line text-blue"></i>
              <strong>Daily Payouts</strong>
              <small>Transparent settlements directly to bank</small>
            </div>
            <div class="benefit-box">
              <i class="fa-solid fa-users text-success"></i>
              <strong>Local Footfall</strong>
              <small>Connect with 10,000+ neighborhood households</small>
            </div>
          </div>

          <form (ngSubmit)="onSubmit()" class="onboarding-form">
            <div class="form-row d-flex gap-3 mb-3">
              <div class="form-group flex-1">
                <label>Shop / Dukaan Name *</label>
                <input type="text" [(ngModel)]="shopName" name="shopName" class="form-input" placeholder="e.g. Verma Kirana Store" required />
              </div>
              <div class="form-group flex-1">
                <label>Business Category *</label>
                <select [(ngModel)]="businessType" name="businessType" class="form-input" required>
                  <option value="Groceries">Groceries & Daily Provisions</option>
                  <option value="Fresh Vegetables">Fresh Vegetables & Fruits</option>
                  <option value="Electronics">Electronics & Mobile Care</option>
                  <option value="Fashion & Clothes">Fashion & Apparel</option>
                  <option value="Snacks & Namkeen">Snacks & Confectionery</option>
                </select>
              </div>
            </div>

            <div class="form-row d-flex gap-3 mb-3">
              <div class="form-group flex-1">
                <label>Owner / Proprietor Full Name *</label>
                <input type="text" [(ngModel)]="ownerName" name="ownerName" class="form-input" placeholder="Ramesh Verma" required />
              </div>
              <div class="form-group flex-1">
                <label>Phone Number *</label>
                <input type="tel" [(ngModel)]="phone" name="phone" class="form-input" placeholder="+91 98111 22334" required />
              </div>
            </div>

            <div class="form-group mb-3">
              <label>Business Email *</label>
              <input type="email" [(ngModel)]="email" name="email" class="form-input" placeholder="contact@vermakirana.com" required />
            </div>

            <div class="form-group mb-4">
              <label>Shop Physical Address in Neighborhood *</label>
              <textarea [(ngModel)]="address" name="address" class="form-input" rows="3" placeholder="Shop #12, Subzi Mandi, Main Market, Sector 14, Delhi NCR" required></textarea>
            </div>

            <div class="error-alert mb-3" *ngIf="errorMessage">
              <i class="fa-solid fa-circle-exclamation mr-1"></i> {{ errorMessage }}
            </div>

            <div class="success-alert mb-3" *ngIf="successMessage">
              <i class="fa-solid fa-circle-check mr-1"></i> {{ successMessage }}
            </div>

            <button type="submit" class="btn-orange w-100 py-3" [disabled]="loading">
              <i class="fa-solid fa-paper-plane mr-2"></i>
              {{ loading ? 'Submitting Application...' : 'Submit Shopkeeper Application' }}
            </button>

            <p class="text-xs text-muted text-center mt-3">
              Super Admin reviews all merchant compliance and KYC before approving live selling permissions.
            </p>
          </form>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .apply-page-bg {
      background: radial-gradient(ellipse at top, #0B2D4D 0%, #06172B 75%);
      min-height: calc(100vh - 120px);
      padding: 40px 16px;
    }
    .container { max-width: 800px; margin: 0 auto; }
    .apply-card {
      background: #FFFFFF;
      border-radius: 16px;
      padding: 36px;
      box-shadow: 0 10px 40px rgba(0,0,0,0.3);
    }
    .apply-title { font-size: 1.8rem; font-weight: 800; color: #0B2D4D; }
    .benefits-row {
      background: #F8FAFC;
      border: 1px solid #E2E8F0;
      border-radius: 10px;
      padding: 16px;
    }
    .benefit-box {
      flex: 1;
      text-align: center;
      i { font-size: 1.4rem; display: block; margin-bottom: 6px; }
      strong { font-size: 0.88rem; display: block; color: #0B2D4D; }
      small { font-size: 0.75rem; color: #64748B; }
    }
    .form-group label { display: block; font-size: 0.82rem; font-weight: 600; color: #475569; margin-bottom: 6px; }
    .form-input {
      width: 100%;
      padding: 10px 14px;
      border: 1px solid #CBD5E1;
      border-radius: 8px;
      font-size: 0.9rem;
      &:focus { border-color: #0879D1; outline: none; }
    }
    .error-alert {
      background: rgba(220, 53, 69, 0.1);
      border: 1px solid rgba(220, 53, 69, 0.3);
      color: #DC3545;
      padding: 10px;
      border-radius: 6px;
      font-size: 0.85rem;
    }
    .success-alert {
      background: rgba(25, 135, 84, 0.1);
      border: 1px solid rgba(25, 135, 84, 0.3);
      color: #198754;
      padding: 10px;
      border-radius: 6px;
      font-size: 0.85rem;
    }
  `]
})
export class VendorApplyComponent {
  shopName = '';
  businessType = 'Groceries';
  ownerName = '';
  phone = '';
  email = '';
  address = '';
  loading = false;
  errorMessage = '';
  successMessage = '';

  constructor(private apiService: ApiService, private router: Router) {}

  onSubmit(): void {
    if (!this.shopName || !this.ownerName || !this.phone || !this.email || !this.address) {
      this.errorMessage = 'Please complete all required fields.';
      return;
    }

    this.loading = true;
    this.errorMessage = '';
    this.successMessage = '';

    const payload = {
      shop_name: this.shopName,
      business_type: this.businessType,
      owner_name: this.ownerName,
      phone: this.phone,
      email: this.email,
      address: this.address,
      documents: ['gst_registration.pdf', 'shop_license.pdf']
    };

    this.apiService.submitShopApplication(payload).subscribe({
      next: (res) => {
        this.loading = false;
        if (res.success) {
          this.successMessage = 'Your shop application has been submitted successfully to the Super Admin review queue.';
          setTimeout(() => {
            alert('Application submitted! You can track approval in Super Admin panel (:4202).');
            this.router.navigate(['/']);
          }, 1500);
        }
      },
      error: (err) => {
        this.loading = false;
        if (err.status === 401) {
          this.router.navigate(['/login']);
        } else {
          this.errorMessage = err.error?.message || 'Submission failed. You may already have an active application.';
        }
      }
    });
  }
}
