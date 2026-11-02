import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { ApiService } from '../../../../../shared/services/api.service';

@Component({
  selector: 'app-tracking',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="tracking-page-bg py-5">
      <div class="container">
        <!-- Breadcrumb -->
        <div class="breadcrumb mb-4">
          <a routerLink="/orders"><i class="fa-solid fa-arrow-left mr-1"></i> Back to Orders</a>
        </div>

        <div class="tracking-card">
          <!-- Rider & Status Hero Strip -->
          <div class="rider-hero-strip d-flex justify-between align-center">
            <div class="d-flex align-center gap-3">
              <div class="rider-scooter-icon">
                <i class="fa-solid fa-motorcycle"></i>
              </div>
              <div>
                <span class="delivery-badge-tag"><i class="fa-solid fa-bolt text-orange mr-1"></i> Ghar Tak Express</span>
                <h2 class="tracking-headline">Delivery Partner is on the way!</h2>
                <p class="text-sm text-light-muted">Your order from local neighborhood stores is en route</p>
              </div>
            </div>
            <div class="eta-box text-right">
              <span class="text-xs text-light-muted d-block">Estimated Arrival</span>
              <strong class="eta-time">~20 Mins</strong>
            </div>
          </div>

          <!-- Rider Profile Box -->
          <div class="rider-profile-bar d-flex justify-between align-center p-3">
            <div class="d-flex align-center gap-3">
              <div class="rider-avatar">
                <i class="fa-solid fa-user-astronaut"></i>
              </div>
              <div>
                <h4 class="rider-name">Vikram Singh</h4>
                <p class="text-xs text-muted">NearbyBazaar Verified Rider • DL-3S-8291</p>
                <div class="rider-badge mt-1">
                  <i class="fa-solid fa-box text-orange mr-1"></i> Carrying Orange Insulated Ghar Tak Bag
                </div>
              </div>
            </div>
            <a href="tel:+919871100223" class="btn-call-rider">
              <i class="fa-solid fa-phone mr-1"></i> Call Rider
            </a>
          </div>

          <!-- Real-Time Fulfillment Timeline -->
          <div class="tracking-timeline-section p-4">
            <h3 class="timeline-title mb-4">Live Order Timeline</h3>

            <div class="timeline-track">
              <div class="timeline-step completed">
                <div class="step-icon-circle"><i class="fa-solid fa-check"></i></div>
                <div class="step-details">
                  <h4>Order Placed & Verified</h4>
                  <p class="text-xs text-muted">Your payment was confirmed and routed to local stores</p>
                </div>
              </div>

              <div class="timeline-step completed">
                <div class="step-icon-circle"><i class="fa-solid fa-box-open"></i></div>
                <div class="step-details">
                  <h4>Stores Packed Items</h4>
                  <p class="text-xs text-muted">Sharma Kirana & local shops packed genuine products</p>
                </div>
              </div>

              <div class="timeline-step active">
                <div class="step-icon-circle"><i class="fa-solid fa-motorcycle"></i></div>
                <div class="step-details">
                  <h4>Out for Delivery (Ghar Tak)</h4>
                  <p class="text-xs text-muted">Rider Vikram Singh is on his scooter heading to your address</p>
                </div>
              </div>

              <div class="timeline-step pending">
                <div class="step-icon-circle"><i class="fa-solid fa-house-chimney"></i></div>
                <div class="step-details">
                  <h4>Delivered at Doorstep</h4>
                  <p class="text-xs text-muted">Delivery at Sector 14, Delhi NCR</p>
                </div>
              </div>
            </div>
          </div>

          <div class="tracking-footer p-3 text-center">
            <a routerLink="/products" class="btn-primary">
              <i class="fa-solid fa-basket-shopping mr-2"></i> Continue Shopping
            </a>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .tracking-page-bg { background: #F8FAFC; min-height: calc(100vh - 120px); }
    .container { max-width: 800px; margin: 0 auto; padding: 0 16px; }
    .py-5 { padding-top: 36px; padding-bottom: 48px; }
    .mb-4 { margin-bottom: 24px; }
    .p-3 { padding: 16px; }
    .p-4 { padding: 24px; }
    .mt-1 { margin-top: 4px; }
    .text-light-muted { color: #CBD5E1; }
    .text-muted { color: #64748B; }

    .tracking-card {
      background: #FFFFFF;
      border: 1px solid #E2E8F0;
      border-radius: 16px;
      overflow: hidden;
      box-shadow: 0 4px 20px rgba(0,0,0,0.06);
    }
    .rider-hero-strip {
      background: linear-gradient(135deg, #06172B 0%, #0B2D4D 100%);
      color: #FFFFFF;
      padding: 24px;
    }
    .rider-scooter-icon {
      width: 52px;
      height: 52px;
      background: rgba(53, 217, 255, 0.2);
      border: 2px solid #35D9FF;
      color: #35D9FF;
      border-radius: 12px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 1.5rem;
    }
    .delivery-badge-tag {
      background: rgba(255, 138, 36, 0.2);
      color: #FF8A24;
      font-size: 0.72rem;
      font-weight: 800;
      padding: 2px 8px;
      border-radius: 4px;
      text-transform: uppercase;
    }
    .tracking-headline { font-size: 1.35rem; font-weight: 800; margin: 4px 0 0 0; }
    .eta-time { font-size: 1.6rem; font-weight: 900; color: #35D9FF; }

    .rider-profile-bar {
      background: #F1F5F9;
      border-bottom: 1px solid #E2E8F0;
    }
    .rider-avatar {
      width: 44px;
      height: 44px;
      background: #0879D1;
      color: #FFF;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 1.2rem;
    }
    .rider-name { font-size: 1.05rem; font-weight: 800; color: #0B2D4D; margin: 0; }
    .rider-badge { font-size: 0.75rem; color: #1E293B; font-weight: 600; }
    .btn-call-rider {
      background: #198754;
      color: #FFF;
      padding: 8px 16px;
      border-radius: 8px;
      font-weight: 700;
      font-size: 0.85rem;
      text-decoration: none;
      &:hover { background: darken(#198754, 8%); }
    }

    .timeline-track {
      position: relative;
      padding-left: 20px;
      &::before {
        content: '';
        position: absolute;
        left: 35px;
        top: 20px;
        bottom: 20px;
        width: 3px;
        background: #E2E8F0;
      }
    }
    .timeline-step {
      display: flex;
      align-items: flex-start;
      gap: 16px;
      margin-bottom: 24px;
      position: relative;
      z-index: 1;
    }
    .step-icon-circle {
      width: 34px;
      height: 34px;
      border-radius: 50%;
      background: #E2E8F0;
      color: #94A3B8;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 0.9rem;
      flex-shrink: 0;
    }
    .timeline-step.completed .step-icon-circle {
      background: #198754;
      color: #FFF;
    }
    .timeline-step.active .step-icon-circle {
      background: #FF8A24;
      color: #FFF;
      box-shadow: 0 0 12px rgba(255, 138, 36, 0.5);
      animation: pulseRider 1.5s infinite;
    }
    .step-details h4 { font-size: 0.95rem; font-weight: 700; color: #0B2D4D; margin: 0; }

    @keyframes pulseRider {
      0% { transform: scale(1); }
      50% { transform: scale(1.1); }
      100% { transform: scale(1); }
    }
  `]
})
export class TrackingComponent implements OnInit {
  orderId = '';
  trackingData: any = null;

  constructor(private route: ActivatedRoute, private apiService: ApiService) {}

  ngOnInit(): void {
    this.orderId = this.route.snapshot.paramMap.get('id') || '';
    if (this.orderId) {
      this.apiService.getOrderTracking(this.orderId).subscribe(res => {
        if (res.success) {
          this.trackingData = res.tracking;
        }
      });
    }
  }
}
