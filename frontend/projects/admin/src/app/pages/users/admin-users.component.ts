import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '@shared/services/api.service';
import { User } from '@shared/models/models';

@Component({
  selector: 'app-admin-users',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="users-page">
      <div class="page-header">
        <div>
          <h2>User Accounts & Access Management</h2>
          <p class="subtitle">Govern consumer identities, merchant credentials, and platform security access.</p>
        </div>
        <button class="btn btn-outline" (click)="loadUsers()">🔄 Refresh</button>
      </div>

      <div class="table-card">
        <div class="search-bar">
          <input type="text" [(ngModel)]="searchQuery" (input)="filterUsers()" placeholder="Search user by name, email, or role..." />
        </div>

        <div *ngIf="loading" class="loading-state">
          <div class="spinner"></div>
          <p>Loading user database...</p>
        </div>

        <table *ngIf="!loading" class="data-table">
          <thead>
            <tr>
              <th>User</th>
              <th>Email</th>
              <th>Assigned Role</th>
              <th>Phone</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr *ngFor="let u of filteredUsers">
              <td>
                <div class="user-cell">
                  <div class="avatar">{{ (u.full_name || 'U')[0] }}</div>
                  <div>
                    <strong>{{ u.full_name }}</strong>
                    <span class="user-id">UID: {{ u.id.substring(0, 8) }}</span>
                  </div>
                </div>
              </td>
              <td>{{ u.email }}</td>
              <td>
                <span class="role-badge" [ngClass]="u.role.toLowerCase()">
                  {{ u.role }}
                </span>
              </td>
              <td>{{ u.phone || 'N/A' }}</td>
              <td>
                <span class="status-indicator" [class.active]="u.is_active" [class.suspended]="!u.is_active">
                  {{ u.is_active ? 'Active' : 'Suspended' }}
                </span>
              </td>
              <td>
                <button class="btn btn-sm" [ngClass]="u.is_active ? 'btn-warn' : 'btn-success'" (click)="toggleUserStatus(u)">
                  {{ u.is_active ? 'Suspend' : 'Activate' }}
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  `,
  styles: [`
    .users-page { max-width: 1300px; margin: 0 auto; }
    .page-header {
      display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px;
      h2 { margin: 0; font-size: 24px; font-weight: 700; color: var(--navy-deep); }
      .subtitle { margin: 4px 0 0 0; color: #64748b; font-size: 14px; }
    }
    .table-card {
      background: white; border-radius: 12px; border: 1px solid #e2e8f0; overflow: hidden;
      box-shadow: 0 1px 3px rgba(0,0,0,0.05);
    }
    .search-bar {
      padding: 16px 20px; border-bottom: 1px solid #f1f5f9;
      input {
        width: 100%; max-width: 400px; padding: 8px 14px; border: 1px solid #cbd5e1; border-radius: 8px; font-size: 14px; outline: none;
      }
    }
    .data-table {
      width: 100%; border-collapse: collapse; text-align: left; font-size: 13px;
      th { padding: 12px 16px; background: #f8fafc; color: #475569; font-weight: 600; border-bottom: 2px solid #e2e8f0; }
      td { padding: 14px 16px; border-bottom: 1px solid #f1f5f9; vertical-align: middle; }
    }
    .user-cell {
      display: flex; align-items: center; gap: 10px;
      .avatar { width: 34px; height: 34px; border-radius: 50%; background: #e0f2fe; color: #0369a1; display: flex; align-items: center; justify-content: center; font-weight: 700; }
      .user-id { display: block; font-size: 11px; color: #94a3b8; font-family: monospace; }
    }
    .role-badge {
      display: inline-block; padding: 3px 8px; border-radius: 4px; font-size: 11px; font-weight: 700;
      &.customer { background: #f1f5f9; color: #475569; }
      &.vendor_admin { background: #e0f2fe; color: #0369a1; }
      &.super_admin { background: #fef3c7; color: #b45309; }
    }
    .status-indicator {
      display: inline-flex; align-items: center; font-weight: 600; font-size: 12px;
      &.active { color: #16a34a; }
      &.suspended { color: #dc2626; }
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
export class AdminUsersComponent implements OnInit {
  users: User[] = [];
  filteredUsers: User[] = [];
  searchQuery = '';
  loading = true;

  constructor(private api: ApiService) {}

  ngOnInit(): void {
    this.loadUsers();
  }

  loadUsers(): void {
    this.loading = true;
    this.api.getAdminUsers().subscribe({
      next: (res) => {
        this.users = res.results || [];
        this.filterUsers();
        this.loading = false;
      },
      error: () => {
        this.loading = false;
      }
    });
  }

  filterUsers(): void {
    this.filteredUsers = this.users.filter(u => {
      const q = this.searchQuery.toLowerCase();
      return !q ||
        u.email.toLowerCase().includes(q) ||
        (u.full_name && u.full_name.toLowerCase().includes(q)) ||
        (u.role && u.role.toLowerCase().includes(q));
    });
  }

  toggleUserStatus(user: User): void {
    const newStatus = !user.is_active;
    this.api.updateUserStatus(user.id, newStatus).subscribe({
      next: () => {
        user.is_active = newStatus;
      }
    });
  }
}
