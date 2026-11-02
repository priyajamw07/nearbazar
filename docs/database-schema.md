# NearbyBazaar: MongoDB Database Schema & Collection Specifications

### 1. Design Principles
- **Document Model**: PyMongo-based repository layer with BSON ObjectIds, strict JSON schema validation, and UTC timestamps.
- **Monetary Storage**: Monetary values are stored as integer minor units (`price_cents`, `subtotal_cents`, `total_cents` representing Paisa/cents) to avoid IEEE 754 binary floating-point rounding inaccuracies. E.g., ₹120.50 is stored as `12050`.
- **Multi-Vendor Partitioning**: Orders are modeled as a Parent Order (customer-facing) and Seller Orders (fulfillment-facing), guaranteeing atomic vendor isolation.

### 2. Primary Collections

#### `users`
```json
{
  "_id": "ObjectId",
  "email": "user@example.com",
  "password_hash": "pbkdf2_sha256$...",
  "full_name": "Ramesh Kumar",
  "role": "CUSTOMER | VENDOR_ADMIN | SUPER_ADMIN",
  "phone": "+91 9876543210",
  "is_active": true,
  "shop_id": "ObjectId (null for non-vendors)",
  "created_at": "ISODate",
  "updated_at": "ISODate"
}
```
**Indexes**:
- `email`: Unique
- `role`: Sparse
- `phone`: Sparse

#### `shops`
```json
{
  "_id": "ObjectId",
  "vendor_id": "ObjectId (User)",
  "name": "Sharma Kirana & General Store",
  "slug": "sharma-kirana",
  "category": "Groceries",
  "description": "Daily essentials, spices, fresh dal and dairy.",
  "address": {
    "street": "Shop 4, Market Complex, Sector 12",
    "city": "Gurugram",
    "state": "Haryana",
    "pincode": "122001",
    "coordinates": [77.0266, 28.4595]
  },
  "phone": "+91 9811223344",
  "status": "APPROVED | PENDING | SUSPENDED | REJECTED",
  "rating": 4.8,
  "review_count": 142,
  "opening_time": "08:00",
  "closing_time": "21:30",
  "is_open": true,
  "image_url": "/assets/shops/sharma_kirana.jpg",
  "created_at": "ISODate"
}
```
**Indexes**:
- `vendor_id`: Unique
- `slug`: Unique
- `status`: Secondary
- `address.pincode`: Geospatial / location queries

#### `shop_applications`
```json
{
  "_id": "ObjectId",
  "vendor_id": "ObjectId (User)",
  "shop_name": "Kumar Electronics & Repairs",
  "business_type": "Electronics",
  "owner_name": "Sunil Kumar",
  "phone": "+91 9899112233",
  "email": "sunil@kumarelec.com",
  "address": "Booth 18, Commercial Belt",
  "documents": ["/uploads/gst_doc.pdf", "/uploads/fssai_cert.pdf"],
  "status": "PENDING | APPROVED | REJECTED",
  "review_notes": "All documents verified.",
  "reviewed_by": "ObjectId (Super Admin)",
  "created_at": "ISODate",
  "reviewed_at": "ISODate"
}
```

#### `categories`
```json
{
  "_id": "ObjectId",
  "name": "Fresh Vegetables & Fruits",
  "slug": "vegetables-fruits",
  "icon": "leaf",
  "image_url": "/assets/categories/veggies.jpg",
  "item_count": 48,
  "is_active": true
}
```

#### `products`
```json
{
  "_id": "ObjectId",
  "shop_id": "ObjectId (Shop)",
  "shop_name": "Sharma Kirana",
  "name": "Farm Fresh Tomatoes (Tamatar)",
  "slug": "farm-fresh-tomatoes",
  "category_id": "ObjectId (Category)",
  "category_name": "Vegetables",
  "description": "Locally grown, hand-picked ripe red tomatoes.",
  "sku": "VEG-TOM-001",
  "price_cents": 3500,
  "compare_price_cents": 4500,
  "stock_quantity": 80,
  "unit": "1 kg",
  "is_available": true,
  "image_url": "/assets/products/tomatoes.jpg",
  "created_at": "ISODate",
  "updated_at": "ISODate"
}
```
**Indexes**:
- `shop_id, sku`: Unique compound index
- `category_id`: Secondary
- `price_cents`: Secondary for sorting/filtering
- `is_available`: Filtering

#### `carts`
```json
{
  "_id": "ObjectId",
  "user_id": "ObjectId (User)",
  "items": [
    {
      "product_id": "ObjectId",
      "shop_id": "ObjectId",
      "quantity": 2,
      "price_cents": 3500,
      "name": "Farm Fresh Tomatoes",
      "image_url": "/assets/products/tomatoes.jpg"
    }
  ],
  "updated_at": "ISODate"
}
```

#### `orders` (Parent Order)
```json
{
  "_id": "ObjectId",
  "order_number": "NBZ-20261029-9812",
  "customer_id": "ObjectId",
  "customer_name": "Pooja Sharma",
  "customer_phone": "+91 9876543210",
  "shipping_address": {
    "title": "Home",
    "street": "Flat 302, Palm Heights",
    "city": "Gurugram",
    "pincode": "122001"
  },
  "items": [...],
  "subtotal_cents": 11500,
  "delivery_fee_cents": 3000,
  "discount_cents": 1000,
  "total_cents": 13500,
  "payment_status": "PAID | PENDING | FAILED",
  "payment_method": "ONLINE | COD",
  "fulfillment_status": "PROCESSING | CONFIRMED | DELIVERED | CANCELLED",
  "seller_order_ids": ["ObjectId(SellerOrder1)", "ObjectId(SellerOrder2)"],
  "idempotency_key": "checkout_token_uuid",
  "created_at": "ISODate"
}
```

#### `seller_orders` (Vendor Fulfillment Order)
```json
{
  "_id": "ObjectId",
  "parent_order_id": "ObjectId",
  "parent_order_number": "NBZ-20261029-9812",
  "shop_id": "ObjectId",
  "shop_name": "Sharma Kirana",
  "customer_id": "ObjectId",
  "items": [
    {
      "product_id": "ObjectId",
      "name": "Farm Fresh Tomatoes",
      "quantity": 2,
      "price_cents": 3500,
      "total_cents": 7000
    }
  ],
  "subtotal_cents": 7000,
  "delivery_fee_cents": 1500,
  "total_cents": 8500,
  "status": "PENDING | CONFIRMED | PROCESSING | SHIPPED | DELIVERED | CANCELLED",
  "status_history": [
    { "status": "PENDING", "timestamp": "ISODate", "note": "Order placed" },
    { "status": "CONFIRMED", "timestamp": "ISODate", "note": "Accepted by shopkeeper" }
  ],
  "created_at": "ISODate"
}
```

#### `audit_logs` (Append-Only)
```json
{
  "_id": "ObjectId",
  "actor_id": "ObjectId",
  "actor_email": "admin@nearbybazaar.com",
  "actor_role": "SUPER_ADMIN",
  "action": "SHOP_APPROVAL",
  "target_type": "shop_applications",
  "target_id": "ObjectId",
  "ip_address": "127.0.0.1",
  "metadata": { "reason": "All KYC verified" },
  "created_at": "ISODate"
}
```
