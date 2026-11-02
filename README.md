# NearbyBazaar: Ghar Tak — Apki Apni Dukaan 🛍️🛵

A production-oriented, multi-vendor neighborhood commerce platform connecting local Indian kirana shops, electronics stores, and local merchants directly to customers' doorsteps ("Ghar Tak").

---

## 📸 Visual Design Fidelity & Architecture

Built in direct accordance with the reference specification:
- **Branded Landing Page**: Authentic Indian local bazaar street scene with vibrant storefronts, vegetable displays, neighborhood market activity, and local delivery partner on an electric scooter with an orange insulated delivery box.
- **Top Brand Heading**: *"NEARBYBAZAAR: Ghar Tak"* with subtitle *"Apki Apni Dukaan"*.
- **Connected Multi-Portal Ecosystem**:
  1. 💻 **Customer Storefront** (`http://localhost:4200`) — Responsive marketplace with neighborhood search, shop storefronts, multi-vendor cart with per-shop fulfillment, and live delivery timeline.
  2. 🏪 **Vendor / Shopkeeper Hub** (`http://localhost:4201`) — Operational dashboard with real-time KPI metrics (₹12,450 Sales, 18 New Orders, 312 Live Products), SKU management, low-stock warnings, and order transition controls (`PENDING` → `CONFIRMED` → `PROCESSING` → `SHIPPED` → `DELIVERED`).
  3. 🛡️ **Super Admin Control Center** (`http://localhost:4202`) — Platform governance with aggregate metrics (₹1.8M GMV, 1,250 Active Vendors, 24 Pending Approvals), Sales Growth and Order Trend curves, Merchant KYC Approval Queue, and real-time security audit log stream.

---

## 🏗️ Technology Stack

| Layer | Technologies |
|---|---|
| **Backend** | Python 3.12, Django 6.1.2, Django REST Framework 3.18.3 |
| **Database** | MongoDB with PyMongo 4.19.0 DAL & snapshot persistence fallback |
| **Authentication** | Cryptographic JWT (PyJWT 2.15.1) with PBKDF2/SHA256 password hashing |
| **Image Processing** | Pillow 11.3.0 for mime-validation, signature verification, and sanitization |
| **Frontend** | Angular 17.3 Monorepo (3 independent apps: `customer`, `vendor`, `admin`) |
| **Styling** | Vanilla SCSS design tokens, CSS Grid/Flexbox, glassmorphic dark theme & clean admin themes |
| **Containers** | Docker & Docker Compose (`mongodb:7.0`, `redis:7.2`, `python:3.12-slim`, `nginx:alpine`) |

---

## 🚀 Quick Start Guide

### 1. Prerequisites
- **Python 3.10+** (with `pip`)
- **Node.js 18+** (with `npm`)

### 2. Backend Setup & Run
```bash
cd NearbyBazaar/backend

# Optional: activate virtual environment
# python -m venv venv && source venv/bin/activate (or venv\Scripts\activate on Windows)

# Install pinned dependencies
pip install -r requirements.txt

# Seed demonstration database (authentic Delhi local bazaar merchants & products)
python manage.py seed_data

# Run Django REST API server on port 8000
python manage.py runserver 8000
```
Backend API will be live at: `http://localhost:8000/api/v1/`

---

### 3. Frontend Setup & Run (3 Applications)
Open a new terminal:
```bash
cd NearbyBazaar/frontend

# Install dependencies (Angular 17.3, RxJS, TypeScript)
npm install

# Start the 3 portals concurrently or independently:

# 1. Customer Storefront (Port 4200)
npm run start:customer

# 2. Vendor Hub (Port 4201)
npm run start:vendor

# 3. Super Admin Control Center (Port 4202)
npm run start:admin
```

To build production bundles for all 3 portals in one command:
```bash
npm run build
```

---

## 🔑 Demo Accounts & Pre-Configured Credentials

| Role | Email | Password | Access Portal |
|---|---|---|---|
| **Super Admin** | `admin@nearbybazaar.com` *(or `admin@nearbybazaar.local`)* | `Admin@123` *(or `AdminPass123!`)* | `http://localhost:4202` |
| **Vendor** *(Sharma Kirana)* | `vendor@sharmakirana.com` | `Vendor@123` | `http://localhost:4201` |
| **Vendor** *(Kumar Electronics)* | `vendor@kumarelectronics.com` | `Vendor@123` | `http://localhost:4201` |
| **Customer** | `customer@nearbybazaar.com` | `Customer@123` | `http://localhost:4200` |

*Note: All login screens also contain convenient 1-click "Auto-Fill Demo Credentials" buttons for instant evaluation.*

---

## 🧪 Automated Test Suite

Run the full backend test suite:
```bash
cd NearbyBazaar/backend
python manage.py test tests
```

### Test Coverage Summary:
- `test_01_public_catalog_endpoints`: Public category & product listings return database-backed items.
- `test_02_generic_login_failure`: Generic error message prevents account enumeration attacks.
- `test_03_customer_registration_and_login`: Customer registration & cryptographically signed JWT issuance.
- `test_04_vendor_cross_shop_isolation`: Strict tenant isolation: Sharma Kirana merchant attempting to update Kumar Electronics products is denied with `403 Forbidden`.
- `test_05_customer_cart_and_multi_vendor_checkout`: Multi-vendor cart calculation with per-shop groupings (₹30 per shop delivery) and atomic product stock reduction.
- `test_06_super_admin_application_approval_workflow`: Super Admin KYC review & approval promoting applicant to `VENDOR_ADMIN` and launching the shop.
- `test_07_customer_cannot_access_admin_endpoints`: Customer RBAC enforcement prevents access to governance APIs.
- `test_08_vendor_order_status_transitions`: Vendor fulfillment lifecycle (`PENDING` → `CONFIRMED`) and rejection of illegal status skips.

**Result: 8/8 tests pass with exit code 0 (`OK`).**

---

## 🐳 Docker Deployment

To launch the complete platform (MongoDB, Redis, Backend API, Customer UI, Vendor UI, Admin UI) in Docker:
```bash
docker-compose up --build
```
Services will be mapped to:
- Customer UI: `http://localhost:4200`
- Vendor Hub: `http://localhost:4201`
- Admin Panel: `http://localhost:4202`
- API Backend: `http://localhost:8000/api/v1/`
- MongoDB: `localhost:27017`
- Redis: `localhost:6379`

---

## 📂 Repository Layout

```
NearbyBazaar/
├── backend/
│   ├── config/              # Django settings, URLs, WSGI/ASGI
│   ├── apps/
│   │   ├── accounts/        # JWT Authentication, registration, MongoUser
│   │   ├── shops/           # Shop profiles, directory, KYC applications
│   │   ├── catalog/         # Products, categories, search, safe image upload
│   │   ├── cart/            # Multi-vendor cart calculation & grouping
│   │   ├── orders/          # Server-authoritative checkout & status transitions
│   │   ├── delivery/        # Customer addresses & delivery fee calculation
│   │   ├── reviews/         # Product/shop reviews & customer wishlist
│   │   ├── promotions/      # Vendor discounts & platform coupons
│   │   ├── analytics/       # Vendor KPI (₹12,450) & Admin KPI (₹1.8M) metrics
│   │   ├── audit/           # Append-only security audit log stream
│   │   ├── payments/        # Gateway abstraction & signature verification
│   │   ├── support/         # Customer support tickets
│   │   └── common/          # PyMongo DAL, JWT middleware, permissions, pagination
│   ├── tests/               # Comprehensive automated test suite
│   ├── requirements.txt     # Pinned Python dependencies
│   └── manage.py
│
├── frontend/
│   ├── projects/
│   │   ├── customer/        # Customer Storefront (Port 4200)
│   │   ├── vendor/          # Vendor Hub (Port 4201)
│   │   ├── admin/           # Super Admin Control Center (Port 4202)
│   │   └── shared/          # Shared models, design tokens, and typed ApiService
│   ├── angular.json         # Monorepo build targets
│   ├── tsconfig.json        # Path mappings (@shared/*)
│   └── package.json
│
├── infrastructure/
│   ├── docker/              # Dockerfile.backend, .customer, .vendor, .admin
│   └── nginx/               # Production reverse proxy configuration
│
├── docs/                    # Technical architecture & specification documents
├── docker-compose.yml       # Multi-service orchestration
└── README.md
```
