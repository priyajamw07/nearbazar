import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { BehaviorSubject, Observable, tap } from 'rxjs';
import {
  User, Shop, Category, Product, CartDetails, Order,
  SellerOrder, ShopApplication, AuditLog, VendorAnalyticsKPI, AdminAnalyticsKPI
} from '../models/models';

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  private baseUrl = 'http://localhost:8000/api/v1';

  private currentUserSubject = new BehaviorSubject<User | null>(null);
  public currentUser$ = this.currentUserSubject.asObservable();

  constructor(private http: HttpClient) {
    this.loadStoredUser();
  }

  private loadStoredUser(): void {
    if (typeof window !== 'undefined') {
      const userStr = localStorage.getItem('nbz_user');
      if (userStr) {
        try {
          this.currentUserSubject.next(JSON.parse(userStr));
        } catch (e) {
          localStorage.removeItem('nbz_user');
        }
      }
    }
  }

  public getToken(): string | null {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('nbz_token');
    }
    return null;
  }

  public getHeaders(): HttpHeaders {
    let headers = new HttpHeaders({ 'Content-Type': 'application/json' });
    const token = this.getToken();
    if (token) {
      headers = headers.set('Authorization', `Bearer ${token}`);
    }
    return headers;
  }

  public getCurrentUser(): User | null {
    return this.currentUserSubject.value;
  }

  // ================= AUTH =================
  register(data: any): Observable<any> {
    return this.http.post(`${this.baseUrl}/auth/register/`, data).pipe(
      tap((res: any) => {
        if (res.access_token && res.user) {
          this.storeSession(res.access_token, res.user);
        }
      })
    );
  }

  login(data: any): Observable<any> {
    return this.http.post(`${this.baseUrl}/auth/login/`, data).pipe(
      tap((res: any) => {
        if (res.access_token && res.user) {
          this.storeSession(res.access_token, res.user);
        }
      })
    );
  }

  logout(): void {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('nbz_token');
      localStorage.removeItem('nbz_user');
    }
    this.currentUserSubject.next(null);
  }

  private storeSession(token: string, user: User): void {
    if (typeof window !== 'undefined') {
      localStorage.setItem('nbz_token', token);
      localStorage.setItem('nbz_user', JSON.stringify(user));
    }
    this.currentUserSubject.next(user);
  }

  // ================= CATALOG =================
  getCategories(): Observable<{ success: boolean; results: Category[] }> {
    return this.http.get<{ success: boolean; results: Category[] }>(`${this.baseUrl}/categories/`);
  }

  getProducts(params?: any): Observable<any> {
    let httpParams = new HttpParams();
    if (params) {
      Object.keys(params).forEach(k => {
        if (params[k] !== undefined && params[k] !== null && params[k] !== '') {
          httpParams = httpParams.set(k, params[k]);
        }
      });
    }
    return this.http.get(`${this.baseUrl}/products/`, { params: httpParams });
  }

  getProduct(id: string): Observable<{ success: boolean; product: Product }> {
    return this.http.get<{ success: boolean; product: Product }>(`${this.baseUrl}/products/${id}/`);
  }

  getShops(params?: any): Observable<{ success: boolean; results: Shop[] }> {
    let httpParams = new HttpParams();
    if (params) {
      Object.keys(params).forEach(k => {
        if (params[k]) httpParams = httpParams.set(k, params[k]);
      });
    }
    return this.http.get<{ success: boolean; results: Shop[] }>(`${this.baseUrl}/shops/`, { params: httpParams });
  }

  getShop(id: string): Observable<{ success: boolean; shop: Shop }> {
    return this.http.get<{ success: boolean; shop: Shop }>(`${this.baseUrl}/shops/${id}/`);
  }

  getShopProducts(shopId: string): Observable<any> {
    return this.http.get(`${this.baseUrl}/shops/${shopId}/products/`);
  }

  search(q: string): Observable<any> {
    return this.http.get(`${this.baseUrl}/search/`, { params: { q } });
  }

  // ================= CART =================
  getCart(): Observable<{ success: boolean; cart: CartDetails }> {
    return this.http.get<{ success: boolean; cart: CartDetails }>(`${this.baseUrl}/cart/`, { headers: this.getHeaders() });
  }

  addToCart(productId: string, quantity = 1): Observable<any> {
    return this.http.post(`${this.baseUrl}/cart/items/`, { product_id: productId, quantity }, { headers: this.getHeaders() });
  }

  updateCartItem(productId: string, quantity: number): Observable<any> {
    return this.http.patch(`${this.baseUrl}/cart/items/${productId}/`, { quantity }, { headers: this.getHeaders() });
  }

  removeCartItem(productId: string): Observable<any> {
    return this.http.delete(`${this.baseUrl}/cart/items/${productId}/`, { headers: this.getHeaders() });
  }

  clearCart(): Observable<any> {
    return this.http.delete(`${this.baseUrl}/cart/`, { headers: this.getHeaders() });
  }

  // ================= CHECKOUT & ORDERS =================
  checkout(payload: any): Observable<any> {
    return this.http.post(`${this.baseUrl}/checkout/`, payload, { headers: this.getHeaders() });
  }

  getCustomerOrders(): Observable<{ success: boolean; results: Order[] }> {
    return this.http.get<{ success: boolean; results: Order[] }>(`${this.baseUrl}/orders/`, { headers: this.getHeaders() });
  }

  getOrderDetails(id: string): Observable<{ success: boolean; order: Order }> {
    return this.http.get<{ success: boolean; order: Order }>(`${this.baseUrl}/orders/${id}/`, { headers: this.getHeaders() });
  }

  cancelOrder(id: string): Observable<any> {
    return this.http.post(`${this.baseUrl}/orders/${id}/cancel/`, {}, { headers: this.getHeaders() });
  }

  getOrderTracking(id: string): Observable<any> {
    return this.http.get(`${this.baseUrl}/orders/${id}/tracking/`, { headers: this.getHeaders() });
  }

  // ================= ADDRESSES =================
  getAddresses(): Observable<any> {
    return this.http.get(`${this.baseUrl}/addresses/`, { headers: this.getHeaders() });
  }

  addAddress(address: any): Observable<any> {
    return this.http.post(`${this.baseUrl}/addresses/`, address, { headers: this.getHeaders() });
  }

  // ================= VENDOR OPERATIONS =================
  getVendorShop(): Observable<any> {
    return this.http.get(`${this.baseUrl}/vendor/shop/`, { headers: this.getHeaders() });
  }

  updateVendorShop(data: any): Observable<any> {
    return this.http.patch(`${this.baseUrl}/vendor/shop/`, data, { headers: this.getHeaders() });
  }

  getVendorProducts(): Observable<{ success: boolean; results: Product[] }> {
    return this.http.get<{ success: boolean; results: Product[] }>(`${this.baseUrl}/vendor/products/`, { headers: this.getHeaders() });
  }

  createVendorProduct(data: any): Observable<any> {
    return this.http.post(`${this.baseUrl}/vendor/products/`, data, { headers: this.getHeaders() });
  }

  updateVendorProduct(id: string, data: any): Observable<any> {
    return this.http.patch(`${this.baseUrl}/vendor/products/${id}/`, data, { headers: this.getHeaders() });
  }

  deleteVendorProduct(id: string): Observable<any> {
    return this.http.delete(`${this.baseUrl}/vendor/products/${id}/`, { headers: this.getHeaders() });
  }

  getVendorOrders(): Observable<{ success: boolean; results: SellerOrder[] }> {
    return this.http.get<{ success: boolean; results: SellerOrder[] }>(`${this.baseUrl}/vendor/orders/`, { headers: this.getHeaders() });
  }

  transitionVendorOrder(orderId: string, status: string, note?: string): Observable<any> {
    return this.http.post(`${this.baseUrl}/vendor/orders/${orderId}/transition/`, { status, note }, { headers: this.getHeaders() });
  }

  getVendorInventory(): Observable<any> {
    return this.http.get(`${this.baseUrl}/vendor/inventory/`, { headers: this.getHeaders() });
  }

  getVendorAnalytics(): Observable<any> {
    return this.http.get(`${this.baseUrl}/vendor/analytics/`, { headers: this.getHeaders() });
  }

  submitShopApplication(data: any): Observable<any> {
    return this.http.post(`${this.baseUrl}/shop-applications/`, data, { headers: this.getHeaders() });
  }

  getMyApplication(): Observable<any> {
    return this.http.get(`${this.baseUrl}/shop-applications/mine/`, { headers: this.getHeaders() });
  }

  // ================= ADMIN OPERATIONS =================
  getAdminApplications(statusFilter?: string): Observable<{ success: boolean; results: ShopApplication[] }> {
    let params = new HttpParams();
    if (statusFilter) params = params.set('status', statusFilter);
    return this.http.get<{ success: boolean; results: ShopApplication[] }>(`${this.baseUrl}/admin/applications/`, {
      headers: this.getHeaders(),
      params
    });
  }

  decideApplication(id: string, decision: 'APPROVED' | 'REJECTED', review_notes: string): Observable<any> {
    return this.http.post(`${this.baseUrl}/admin/applications/${id}/decision/`, { decision, review_notes }, { headers: this.getHeaders() });
  }

  getAdminShops(): Observable<{ success: boolean; results: Shop[] }> {
    return this.http.get<{ success: boolean; results: Shop[] }>(`${this.baseUrl}/admin/shops/`, { headers: this.getHeaders() });
  }

  updateShopStatus(shopId: string, status: string, reason?: string): Observable<any> {
    return this.http.patch(`${this.baseUrl}/admin/shops/${shopId}/status/`, { status, reason }, { headers: this.getHeaders() });
  }

  getAdminUsers(): Observable<{ success: boolean; results: User[] }> {
    return this.http.get<{ success: boolean; results: User[] }>(`${this.baseUrl}/admin/users/`, { headers: this.getHeaders() });
  }

  updateUserStatus(userId: string, is_active: boolean): Observable<any> {
    return this.http.patch(`${this.baseUrl}/admin/users/${userId}/status/`, { is_active }, { headers: this.getHeaders() });
  }

  getAdminOrders(): Observable<{ success: boolean; results: Order[] }> {
    return this.http.get<{ success: boolean; results: Order[] }>(`${this.baseUrl}/admin/orders/`, { headers: this.getHeaders() });
  }

  getAdminAnalytics(): Observable<any> {
    return this.http.get(`${this.baseUrl}/admin/analytics/`, { headers: this.getHeaders() });
  }

  getAdminAuditLogs(): Observable<any> {
    return this.http.get(`${this.baseUrl}/admin/audit-logs/`, { headers: this.getHeaders() });
  }
}
