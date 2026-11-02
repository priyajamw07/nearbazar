import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../../../../shared/services/api.service';
import { Product } from '../../../../../shared/models/models';

@Component({
  selector: 'app-vendor-products',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  template: `
    <div class="products-management">
      <div class="d-flex justify-between align-center mb-4">
        <div>
          <h1>Product Catalog</h1>
          <p class="text-sm text-muted">Manage your shop's stock, prices, SKUs, and availability</p>
        </div>
        <button (click)="showNewModal = true" class="btn-primary">
          <i class="fa-solid fa-plus mr-1"></i> Add Product
        </button>
      </div>

      <div class="data-table-container">
        <table class="clean-table">
          <thead>
            <tr>
              <th>SKU</th>
              <th>Product Name</th>
              <th>Category</th>
              <th>Price</th>
              <th>Stock</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr *ngFor="let p of products">
              <td><code>{{ p.sku }}</code></td>
              <td><strong>{{ p.name }}</strong></td>
              <td><span class="badge badge-info">{{ p.category_name }}</span></td>
              <td><strong>₹{{ (p.price_cents / 100).toFixed(0) }}</strong></td>
              <td>
                <span class="stock-pill" [class.low]="p.stock_quantity < 10">
                  {{ p.stock_quantity }} {{ p.unit }}
                </span>
              </td>
              <td>
                <span class="badge-status" [class.status-confirmed]="p.is_available" [class.status-cancelled]="!p.is_available">
                  {{ p.is_available ? 'Live' : 'Hidden' }}
                </span>
              </td>
              <td>
                <button (click)="deleteProduct(p.id)" class="btn-del" title="Delete product">
                  <i class="fa-solid fa-trash-can"></i>
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Add Product Modal -->
      <div class="modal-backdrop" *ngIf="showNewModal">
        <div class="modal-box">
          <div class="modal-header d-flex justify-between align-center mb-3">
            <h3>Add Product to Catalog</h3>
            <button class="modal-close" (click)="showNewModal = false">&times;</button>
          </div>
          <form (ngSubmit)="saveProduct()">
            <div class="form-group mb-2">
              <label class="text-xs font-bold">Product Name *</label>
              <input type="text" [(ngModel)]="prodForm.name" name="name" class="form-input" required />
            </div>
            <div class="form-row d-flex gap-2 mb-2">
              <div class="flex-1">
                <label class="text-xs font-bold">Category</label>
                <input type="text" [(ngModel)]="prodForm.category_name" name="cat" class="form-input" />
              </div>
              <div class="flex-1">
                <label class="text-xs font-bold">Price (₹) *</label>
                <input type="number" [(ngModel)]="prodForm.price" name="price" class="form-input" required />
              </div>
            </div>
            <div class="form-row d-flex gap-2 mb-2">
              <div class="flex-1">
                <label class="text-xs font-bold">Stock Quantity *</label>
                <input type="number" [(ngModel)]="prodForm.stock" name="stock" class="form-input" required />
              </div>
              <div class="flex-1">
                <label class="text-xs font-bold">Unit *</label>
                <input type="text" [(ngModel)]="prodForm.unit" name="unit" class="form-input" placeholder="e.g. 1 kg" required />
              </div>
            </div>
            <div class="form-group mb-3">
              <label class="text-xs font-bold">SKU Code *</label>
              <input type="text" [(ngModel)]="prodForm.sku" name="sku" class="form-input" required />
            </div>
            <button type="submit" class="btn-primary w-100 py-2">Save Product</button>
          </form>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .stock-pill {
      font-weight: 700;
      color: #16A34A;
      &.low { color: #DC2626; }
    }
    .btn-del {
      background: none;
      border: none;
      color: #EF4444;
      cursor: pointer;
      font-size: 0.95rem;
      &:hover { color: #B91C1C; }
    }
    .modal-backdrop {
      position: fixed; inset: 0; background: rgba(0,0,0,0.5);
      display: flex; align-items: center; justify-content: center; z-index: 1000;
    }
    .modal-box {
      background: #FFF; border-radius: 12px; padding: 24px; width: 100%; max-width: 440px;
    }
    .modal-close { background: none; font-size: 1.5rem; cursor: pointer; }
    .form-input { width: 100%; padding: 8px 12px; border: 1px solid #CBD5E1; border-radius: 6px; }
  `]
})
export class VendorProductsComponent implements OnInit {
  products: Product[] = [];
  showNewModal = false;

  prodForm = {
    name: '',
    category_name: 'Groceries',
    price: 40,
    stock: 50,
    unit: '1 kg',
    sku: 'SKU-' + Math.floor(Math.random() * 900 + 100)
  };

  constructor(private apiService: ApiService, private router: Router) {}

  ngOnInit(): void {
    this.loadProducts();
  }

  loadProducts(): void {
    this.apiService.getVendorProducts().subscribe({
      next: (res) => {
        if (res.success) this.products = res.results;
      },
      error: () => this.router.navigate(['/login'])
    });
  }

  saveProduct(): void {
    const payload = {
      name: this.prodForm.name,
      category_id: 'vegetables',
      category_name: this.prodForm.category_name,
      price_cents: Math.round(this.prodForm.price * 100),
      compare_price_cents: Math.round(this.prodForm.price * 120),
      stock_quantity: this.prodForm.stock,
      unit: this.prodForm.unit,
      sku: this.prodForm.sku,
      is_available: true
    };

    this.apiService.createVendorProduct(payload).subscribe({
      next: () => {
        alert('Product created successfully!');
        this.showNewModal = false;
        this.loadProducts();
      },
      error: (err) => alert(err.error?.message || 'Failed to save product.')
    });
  }

  deleteProduct(id: string): void {
    if (confirm('Are you sure you want to delete this product?')) {
      this.apiService.deleteVendorProduct(id).subscribe({
        next: () => {
          this.loadProducts();
        },
        error: (err) => alert(err.error?.message || 'Delete failed.')
      });
    }
  }
}
