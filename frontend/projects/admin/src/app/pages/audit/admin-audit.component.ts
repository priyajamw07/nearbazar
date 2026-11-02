import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '@shared/services/api.service';
import { AuditLog } from '@shared/models/models';

@Component({
  selector: 'app-admin-audit',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="audit-page">
      <div class="page-header">
        <div>
          <h2>Platform Audit Trail & Security Ledger</h2>
          <p class="subtitle">Cryptographically verified append-only activity log for platform events.</p>
        </div>
        <button class="btn btn-outline" (click)="loadLogs()">🔄 Refresh</button>
      </div>

      <div class="table-card">
        <div class="filter-bar">
          <input type="text" [(ngModel)]="searchQuery" (input)="filterLogs()" placeholder="Search action, actor email, or target..." />
        </div>

        <div *ngIf="loading" class="loading-state">
          <div class="spinner"></div>
          <p>Decrypting audit logs...</p>
        </div>

        <table *ngIf="!loading" class="data-table">
          <thead>
            <tr>
              <th>Timestamp (UTC)</th>
              <th>Action Key</th>
              <th>Actor Identity</th>
              <th>Target / Resource</th>
              <th>Details & Metadata</th>
            </tr>
          </thead>
          <tbody>
            <tr *ngFor="let l of filteredLogs">
              <td><code>{{ l.timestamp ? (l.timestamp | date:'medium') : 'Realtime' }}</code></td>
              <td><span class="action-tag" [ngClass]="getActionClass(l.action)">{{ l.action }}</span></td>
              <td><strong>{{ l.actor_email || 'System Daemon' }}</strong></td>
              <td><code>{{ l.target || 'GLOBAL' }}</code></td>
              <td><span class="details-text">{{ l.details }}</span></td>
            </tr>
            <tr *ngIf="filteredLogs.length === 0">
              <td colspan="5" class="empty-cell">No matching audit logs found.</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  `,
  styles: [`
    .audit-page { max-width: 1300px; margin: 0 auto; }
    .page-header {
      display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px;
      h2 { margin: 0; font-size: 24px; font-weight: 700; color: var(--navy-deep); }
      .subtitle { margin: 4px 0 0 0; color: #64748b; font-size: 14px; }
    }
    .table-card {
      background: white; border-radius: 12px; border: 1px solid #e2e8f0; overflow: hidden;
      box-shadow: 0 1px 3px rgba(0,0,0,0.05);
    }
    .filter-bar {
      padding: 16px 20px; border-bottom: 1px solid #f1f5f9;
      input { width: 100%; max-width: 400px; padding: 8px 14px; border: 1px solid #cbd5e1; border-radius: 8px; font-size: 14px; }
    }
    .data-table {
      width: 100%; border-collapse: collapse; text-align: left; font-size: 13px;
      th { padding: 12px 16px; background: #f8fafc; color: #475569; font-weight: 600; border-bottom: 2px solid #e2e8f0; }
      td { padding: 12px 16px; border-bottom: 1px solid #f1f5f9; vertical-align: middle; }
    }
    code { font-family: 'Consolas', monospace; font-size: 11px; color: #64748b; }
    .action-tag {
      font-size: 11px; font-weight: 700; padding: 3px 8px; border-radius: 4px; display: inline-block;
      &.info { background: #e0f2fe; color: #0369a1; }
      &.warn { background: #fef3c7; color: #b45309; }
      &.danger { background: #fee2e2; color: #b91c1c; }
    }
    .details-text { color: #334155; font-size: 12px; }
    .btn { padding: 6px 12px; border-radius: 6px; font-weight: 600; cursor: pointer; border: 1px solid #cbd5e1; background: white; font-size: 12px; }
    .loading-state, .empty-cell { text-align: center; padding: 40px; color: #94a3b8; }
    .spinner {
      width: 28px; height: 28px; border: 3px solid #e2e8f0; border-top-color: #0879D1;
      border-radius: 50%; animation: spin 1s linear infinite; margin: 0 auto 12px auto;
    }
    @keyframes spin { to { transform: rotate(360deg); } }
  `]
})
export class AdminAuditComponent implements OnInit {
  logs: AuditLog[] = [];
  filteredLogs: AuditLog[] = [];
  searchQuery = '';
  loading = true;

  constructor(private api: ApiService) {}

  ngOnInit(): void {
    this.loadLogs();
  }

  loadLogs(): void {
    this.loading = true;
    this.api.getAdminAuditLogs().subscribe({
      next: (res) => {
        this.logs = res.results || [];
        this.filterLogs();
        this.loading = false;
      },
      error: () => {
        this.loading = false;
      }
    });
  }

  filterLogs(): void {
    const q = this.searchQuery.toLowerCase();
    this.filteredLogs = this.logs.filter(l => {
      return !q ||
        l.action.toLowerCase().includes(q) ||
        (l.actor_email && l.actor_email.toLowerCase().includes(q)) ||
        (l.details && l.details.toLowerCase().includes(q));
    });
  }

  getActionClass(action: string): string {
    if (action.includes('FAIL') || action.includes('REJECT') || action.includes('SUSPEND') || action.includes('ERROR')) return 'danger';
    if (action.includes('WARN') || action.includes('TIMEOUT') || action.includes('PENDING')) return 'warn';
    return 'info';
  }
}
