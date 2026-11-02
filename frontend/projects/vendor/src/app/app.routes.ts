import { Routes } from '@angular/router';
import { VendorDashboardComponent } from './pages/dashboard/vendor-dashboard.component';
import { VendorProductsComponent } from './pages/products/vendor-products.component';
import { VendorOrdersComponent } from './pages/orders/vendor-orders.component';
import { VendorInventoryComponent } from './pages/inventory/vendor-inventory.component';
import { VendorLoginComponent } from './pages/login/vendor-login.component';

export const routes: Routes = [
  { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
  { path: 'dashboard', component: VendorDashboardComponent },
  { path: 'products', component: VendorProductsComponent },
  { path: 'orders', component: VendorOrdersComponent },
  { path: 'inventory', component: VendorInventoryComponent },
  { path: 'login', component: VendorLoginComponent },
  { path: '**', redirectTo: 'dashboard' }
];
