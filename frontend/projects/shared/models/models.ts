export type UserRole = 'CUSTOMER' | 'VENDOR_ADMIN' | 'SUPER_ADMIN';

export interface User {
  id: string;
  email: string;
  full_name: string;
  first_name?: string;
  last_name?: string;
  role: UserRole;
  phone?: string;
  shop_id?: string;
  shop?: Shop;
  is_active?: boolean;
}

export interface Address {
  id?: string;
  title: string;
  street: string;
  landmark?: string;
  city: string;
  state?: string;
  pincode: string;
  phone?: string;
  is_default?: boolean;
}

export interface Shop {
  id: string;
  vendor_id?: string;
  name: string;
  slug: string;
  category: string;
  category_name?: string;
  description: string;
  address: {
    street: string;
    city: string;
    pincode: string;
  };
  city?: string;
  phone: string;
  status: 'PENDING' | 'APPROVED' | 'SUSPENDED' | 'REJECTED';
  is_active?: boolean;
  is_verified?: boolean;
  rating: number;
  review_count: number;
  opening_time: string;
  closing_time: string;
  is_open: boolean;
  image_url: string;
  logo?: string;
  created_at?: string;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  icon: string;
  image_url: string;
  item_count: number;
  is_active: boolean;
}

export interface Product {
  id: string;
  shop_id: string;
  shop_name: string;
  name: string;
  slug: string;
  category_id: string;
  category_name: string;
  description: string;
  sku: string;
  price_cents: number;
  compare_price_cents?: number;
  stock_quantity: number;
  unit: string;
  is_available: boolean;
  image_url: string;
  created_at?: string;
}

export interface CartItem {
  product_id: string;
  shop_id: string;
  shop_name: string;
  name: string;
  image_url: string;
  price_cents: number;
  unit: string;
  quantity: number;
  stock_quantity: number;
  in_stock: boolean;
  total_cents: number;
}

export interface CartShopGroup {
  shop_id: string;
  shop_name: string;
  items: CartItem[];
  shop_subtotal_cents: number;
  delivery_fee_cents: number;
}

export interface CartDetails {
  items: CartItem[];
  shops: CartShopGroup[];
  subtotal_cents: number;
  delivery_fee_cents: number;
  discount_cents: number;
  total_cents: number;
  item_count: number;
}

export type OrderStatus = 'PENDING' | 'CONFIRMED' | 'PROCESSING' | 'SHIPPED' | 'DELIVERED' | 'CANCELLED';

export interface OrderStatusHistory {
  status: OrderStatus;
  timestamp: string;
  note: string;
}

export interface SellerOrder {
  id: string;
  parent_order_id?: string;
  parent_order_number: string;
  shop_id: string;
  shop_name: string;
  customer_id: string;
  customer_name: string;
  items: Array<{
    name: string;
    quantity: number;
    price_cents: number;
  }>;
  subtotal_cents: number;
  delivery_fee_cents: number;
  total_cents: number;
  status: OrderStatus;
  status_history: OrderStatusHistory[];
  created_at: string;
}

export interface Order {
  id: string;
  order_number: string;
  customer_id: string;
  customer_name: string;
  customer_phone: string;
  shipping_address: Address;
  items: CartItem[];
  subtotal_cents: number;
  delivery_fee_cents: number;
  discount_cents: number;
  total_cents: number;
  payment_status: 'PENDING' | 'PAID' | 'FAILED';
  payment_method: 'ONLINE' | 'COD';
  fulfillment_status: OrderStatus;
  seller_order_ids: string[];
  seller_orders?: SellerOrder[];
  created_at: string;
}

export interface ShopApplication {
  id: string;
  vendor_id?: string;
  shop_name?: string;
  business_name?: string;
  business_type?: string;
  owner_name?: string;
  applicant_name?: string;
  applicant_email?: string;
  category?: string;
  city?: string;
  tax_id?: string;
  phone?: string;
  email?: string;
  address?: string;
  documents?: string[];
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  review_notes?: string;
  created_at?: string;
}

export interface AuditLog {
  id: string;
  actor_id?: string;
  actor_email?: string;
  actor_role?: string;
  action: string;
  target?: string;
  target_type?: string;
  target_id?: string;
  ip_address?: string;
  details?: string;
  metadata?: any;
  created_at?: string;
  timestamp?: string;
}

export interface VendorAnalyticsKPI {
  total_sales: number;
  total_sales_formatted: string;
  new_orders: number;
  products_live: number;
}

export interface AdminAnalyticsKPI {
  total_revenue: number;
  total_revenue_formatted: string;
  active_vendors: number;
  pending_approvals: number;
}
