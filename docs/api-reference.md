# NearbyBazaar: REST API Reference & Endpoints Contract

API Base URL: `/api/v1/`

### 1. Authentication & Identity
- `POST /api/v1/auth/register/` - Register customer or vendor applicant
- `POST /api/v1/auth/login/` - Authenticate with email and password, returns JWT tokens & user profile
- `POST /api/v1/auth/logout/` - Invalidate session
- `POST /api/v1/auth/token/refresh/` - Refresh expired access token
- `POST /api/v1/auth/password-reset/` - Request password reset link
- `GET  /api/v1/auth/me/` - Retrieve authenticated user profile and permissions

### 2. Public Marketplace Catalog
- `GET  /api/v1/categories/` - List all active marketplace categories
- `GET  /api/v1/products/` - List & filter products (supports `q`, `category`, `min_price`, `max_price`, `shop_id`, `in_stock`, `sort`, `page`)
- `GET  /api/v1/products/{id}/` - Product details with stock status and seller details
- `GET  /api/v1/shops/` - List approved neighborhood shops with ratings and opening hours
- `GET  /api/v1/shops/{id}/` - Detailed shop profile & policies
- `GET  /api/v1/shops/{id}/products/` - Products offered by a specific shop
- `GET  /api/v1/search/` - Universal search across shops, categories, and items

### 3. Customer Operations
- `GET    /api/v1/cart/` - Retrieve multi-vendor cart with itemized shop grouping and delivery fees
- `POST   /api/v1/cart/items/` - Add item to cart (validates shop status and stock)
- `PATCH  /api/v1/cart/items/{id}/` - Update item quantity
- `DELETE /api/v1/cart/items/{id}/` - Remove item from cart
- `POST   /api/v1/checkout/` - Server-authoritative checkout with idempotency check, creates parent order & seller fulfillment orders
- `GET    /api/v1/orders/` - List customer's purchase history
- `GET    /api/v1/orders/{id}/` - Order details with split fulfillment timeline
- `POST   /api/v1/orders/{id}/cancel/` - Customer cancellation (allowed if order is pending)
- `GET    /api/v1/orders/{id}/tracking/` - Real-time rider delivery status
- `GET    /api/v1/addresses/` - Saved customer addresses
- `POST   /api/v1/addresses/` - Add new delivery address
- `GET    /api/v1/wishlist/` - User's saved favorite products
- `POST   /api/v1/reviews/` - Submit product/shop review

### 4. Vendor Operations (Scoped by Vendor's Shop ID)
- `GET   /api/v1/vendor/shop/` - View current vendor shop profile
- `PATCH /api/v1/vendor/shop/` - Update shop hours, description, open/close status
- `GET   /api/v1/vendor/products/` - List vendor's own catalog with SKU, stock, and status
- `POST  /api/v1/vendor/products/` - Create a new product listing
- `GET   /api/v1/vendor/products/{id}/` - Product details
- `PATCH /api/v1/vendor/products/{id}/` - Update price, stock, SKU, and availability
- `DELETE /api/v1/vendor/products/{id}/` - Archive product
- `GET   /api/v1/vendor/orders/` - Incoming seller order fulfillment queue
- `GET   /api/v1/vendor/orders/{id}/` - Order details for fulfillment
- `POST  /api/v1/vendor/orders/{id}/transition/` - Transition fulfillment status (Pending -> Confirmed -> Processing -> Shipped -> Delivered)
- `GET   /api/v1/vendor/analytics/` - Gross sales, order count, bestsellers, low-stock warnings
- `GET   /api/v1/vendor/inventory/` - Inventory alerts & stock editor
- `GET   /api/v1/vendor/discounts/` - Shop-level promotions
- `POST  /api/v1/vendor/discounts/` - Create promotion
- `POST  /api/v1/vendor/uploads/` - Safe image upload with MIME validation & thumbnail generation

### 5. Shop Applications & Administration
- `POST /api/v1/shop-applications/` - Submit vendor onboarding application
- `GET  /api/v1/shop-applications/mine/` - Vendor checks status of own application
- `GET  /api/v1/admin/applications/` - List pending shop applications
- `GET  /api/v1/admin/applications/{id}/` - Inspect application details & documents
- `POST /api/v1/admin/applications/{id}/decision/` - Approve, reject, or request changes
- `GET  /api/v1/admin/users/` - Platform user directory with role filters
- `PATCH /api/v1/admin/users/{id}/status/` - Activate or suspend user account
- `GET  /api/v1/admin/shops/` - Global shop directory
- `PATCH /api/v1/admin/shops/{id}/status/` - Suspend or reactivate shop
- `GET  /api/v1/admin/orders/` - Platform-wide order monitoring
- `GET  /api/v1/admin/analytics/` - Platform GMV, active vendors, fulfillment rate
- `GET  /api/v1/admin/support/` - Support ticket queue
- `PATCH /api/v1/admin/support/{id}/` - Resolve ticket
- `GET  /api/v1/admin/audit-logs/` - Append-only security audit log stream
