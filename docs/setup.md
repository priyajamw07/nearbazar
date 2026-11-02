# NearbyBazaar: Local Setup & Operational Guide

### 1. Prerequisites
- **Python**: 3.12+ (Python 3.13 supported)
- **Node.js**: v18+ / v20+ / v22+
- **MongoDB**: Standalone or Docker service (fallback in-memory adapter automatically active if MongoDB server is offline)

### 2. Environment Configuration
Create `.env` inside `NearbyBazaar/backend/`:
```env
DEBUG=True
SECRET_KEY=django-insecure-nearbybazaar-ghartak-super-secret-key-2026
ALLOWED_HOSTS=localhost,127.0.0.1
CORS_ALLOWED_ORIGINS=http://localhost:4200,http://localhost:4201,http://localhost:4202,http://127.0.0.1:4200,http://127.0.0.1:4201,http://127.0.0.1:4202

# MongoDB configuration (or local fallback)
MONGODB_URI=mongodb://localhost:27017/nearbybazaar
MONGODB_DB_NAME=nearbybazaar

# Storage & Uploads
MEDIA_ROOT=media/
MEDIA_URL=/media/
```

### 3. Backend Setup & Run
```bash
cd NearbyBazaar/backend
python -m pip install -r requirements.txt
python manage.py seed_data
python manage.py runserver 8000
```
Backend API will be active at: `http://localhost:8000/api/v1/`

### 4. Frontend Setup & Run
Run each portal on its dedicated port:

**Customer Storefront (Port 4200)**:
```bash
cd NearbyBazaar/frontend
npm run start:customer
```
Accessible at: `http://localhost:4200/`

**Vendor Dashboard (Port 4201)**:
```bash
npm run start:vendor
```
Accessible at: `http://localhost:4201/`

**Super Admin Control Center (Port 4202)**:
```bash
npm run start:admin
```
Accessible at: `http://localhost:4202/`

### 5. Default Demonstration Credentials
- **Customer**: `customer@nearbybazaar.com` / `Customer@123`
- **Vendor (Sharma Kirana)**: `vendor@sharmakirana.com` / `Vendor@123`
- **Vendor Applicant (Pending)**: `applicant@kumarelec.com` / `Vendor@123`
- **Super Admin**: `admin@nearbybazaar.com` / `Admin@123`
