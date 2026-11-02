import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '@shared/services/api.service';
import { ShopApplication } from '@shared/models/models';

@Component({
  selector: 'app-admin-applications',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="applications-page">
      <div class="page-header">
        <div>
          <h2>Merchant Applications & KYC</h2>
          <p class="subtitle">Evaluate seller registration requests, verification documents, and business credentials.</p>
        </div>
        <button class="btn btn-outline" (click)="loadApplications()">🔄 Refresh</button>
      </div>

      <div class="filter-bar">
        <button class="filter-tab" [class.active]="filterStatus === 'ALL'" (click)="setFilter('ALL')">All Applications ({{ applications.length }})</button>
        <button class="filter-tab" [class.active]="filterStatus === 'PENDING'" (click)="setFilter('PENDING')">Pending Review</button>
        <button class="filter-tab" [class.active]="filterStatus === 'APPROVED'" (click)="setFilter('APPROVED')">Approved Merchants</button>
        <button class="filter-tab" [class.active]="filterStatus === 'REJECTED'" (click)="setFilter('REJECTED')">Rejected</button>
      </div>

      <div class="table-card">
        <div *ngIf="loading" class="loading-state">
          <div class="spinner"></div>
          <p>Fetching merchant applications...</p>
        </div>

        <table *ngIf="!loading" class="data-table">
          <thead>
            <tr>
              <th>Business Name</th>
              <th>Applicant</th>
              <th>Category</th>
              <th>Contact & Location</th>
              <th>Submitted Date</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr *ngFor="let app of filteredApplications">
              <td>
                <strong>{{ app.business_name }}</strong>
                <span class="sub-detail">GSTIN: {{ app.tax_id || 'VERIFIED-0192' }}</span>
              </td>
              <td>{{ app.applicant_name }}</td>
              <td><span class="cat-pill">{{ app.category || 'General Store' }}</span></td>
              <td>
                <span class="loc-text">{{ app.address }}, {{ app.city }}</span>
                <span class="phone-text">{{ app.phone || '+91 98765 43210' }}</span>
              </td>
              <td>{{ app.created_at ? (app.created_at | date:'mediumDate') : 'Recently' }}</td>
              <td>
                <span class="status-badge" [ngClass]="app.status.toLowerCase()">
                  {{ app.status }}
                </span>
              </td>
              <td>
                <div class="actions" *ngIf="app.status === 'PENDING'">
                  <button class="btn btn-sm btn-success" (click)="decide(app, 'APPROVED')">Approve</button>
                  <button class="btn btn-sm btn-danger" (click)="decide(app, 'REJECTED')">Reject</button>
                </div>
                <span *ngIf="app.status !== 'PENDING'" class="text-muted">Settled</span>
              </td>
            </tr>
            <tr *ngIf="filteredApplications.length === 0">
              <td colspan="7" class="empty-cell">No applications found in this view.</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  `,
  styles: [`
    .applications-page { max-width: 1300px; margin: 0 auto; }
    .page-header {
      display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px;
      h2 { margin: 0; font-size: 24px; font-weight: 700; color: var(--navy-deep); }
      .subtitle { margin: 4px 0 0 0; color: #64748b; font-size: 14px; }
    }
    .filter-bar {
      display: flex; gap: 8px; margin-bottom: 20px;
    }
    .filter-tab {
      background: white; border: 1px solid #e2e8f0; padding: 8px 16px; border-radius: 8px;
      font-size: 13px; font-weight: 600; color: #64748b; cursor: pointer;
      &.active { background: #0879D1; color: white; border-color: #0879D1; }
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
    .sub-detail { display: block; font-size: 11px; color: #94a3b8; font-family: monospace; }
    .loc-text { display: block; color: #334155; }
    .phone-text { display: block; font-size: 11px; color: #64748b; }
    .cat-pill { background: #f1f5f9; color: #334155; padding: 3px 8px; border-radius: 4px; font-weight: 600; font-size: 11px; }
    .status-badge {
      display: inline-block; padding: 4px 10px; border-radius: 12px; font-size: 11px; font-weight: 700;
      &.pending { background: #fef3c7; color: #b45309; }
      &.approved { background: #dcfce7; color: #15803d; }
      &.rejected { background: #fee2e2; color: #b91c1c; }
    }
    .actions { display: flex; gap: 6px; }
    .btn {
      padding: 6px 12px; border-radius: 6px; font-weight: 600; cursor: pointer; border: none; font-size: 12px;
      &.btn-outline { background: white; border: 1px solid #cbd5e1; color: #334155; }
      &.btn-success { background: #16a34a; color: white; }
      &.btn-danger { background: #dc2626; color: white; }
    }
    .loading-state, .empty-cell { text-align: center; padding: 40px; color: #94a3b8; }
    .spinner {
      width: 28px; height: 28px; border: 3px solid #e2e8f0; border-top-color: #0879D1;
      border-radius: 50%; animation: spin 1s linear infinite; margin: 0 auto 12px auto;
    }
    @keyframes spin { to { transform: rotate(360deg); } }
  `]
})
export class AdminApplicationsComponent implements OnInit {
  applications: ShopApplication[] = [];
  filteredApplications: ShopApplication[] = [];
  filterStatus = 'ALL';
  loading = true;

  constructor(private api: ApiService) {}

  ngOnInit(): void {
    this.loadApplications();
  }

  loadApplications(): void {
    this.loading = true;
    this.api.getAdminApplications().subscribe({
      next: (res) => {
        this.applications = res.results || [];
        this.setFilter(this.filterStatus);
        this.loading = false;
      },
      error: () => {
        this.loading = false;
      }
    });
  }

  setFilter(status: string): void {
    this.filterStatus = status;
    if (status === 'ALL') {
      this.filteredApplications = this.applications;
    } else {
      this.filteredApplications = this.applications.filter(a => a.status === status);
    }
  }

  decide(app: ShopApplication, status: 'APPROVED' | 'REJECTED'): void {
    this.api.decideApplication(app.id, status, `Evaluated by Super Admin: ${status}`).subscribe({
      next: () => {
        app.status = status;
        this.setFilter(this.filterStatus);
      }
    });
  }
}
