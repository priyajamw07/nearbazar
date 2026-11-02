import { Routes } from '@angular/router';
import { AdminDashboardComponent } from './pages/dashboard/admin-dashboard.component';
import { AdminApplicationsComponent } from './pages/applications/admin-applications.component';
import { AdminUsersComponent } from './pages/users/admin-users.component';
import { AdminShopsComponent } from './pages/shops/admin-shops.component';
import { AdminAuditComponent } from './pages/audit/admin-audit.component';
import { AdminLoginComponent } from './pages/login/admin-login.component';

export const routes: Routes = [
  { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
  { path: 'dashboard', component: AdminDashboardComponent },
  { path: 'applications', component: AdminApplicationsComponent },
  { path: 'users', component: AdminUsersComponent },
  { path: 'shops', component: AdminShopsComponent },
  { path: 'audit-logs', component: AdminAuditComponent },
  { path: 'login', component: AdminLoginComponent },
  { path: '**', redirectTo: 'dashboard' }
];
