# NearbyBazaar: Testing Strategy & Verification Guide

### 1. Test Architecture
The test suite validates the core security boundaries, multi-vendor isolation, and transaction consistency:
1. **Authentication & RBAC Tests**:
   - Registration with password hashing
   - Generic failure responses on invalid credentials
   - JWT token issuance and expiration
   - Route and endpoint protection by role (`CUSTOMER`, `VENDOR_ADMIN`, `SUPER_ADMIN`)
2. **Multi-Vendor Isolation Tests**:
   - Vendor A accessing Vendor B's products returns `403 Forbidden`
   - Vendor A attempting to transition Vendor B's order returns `403 Forbidden`
   - Vendor cannot mark an order `DELIVERED` prematurely
3. **Cart & Financial Tests**:
   - Server-side price recalculation (rejecting client price tampering)
   - Stock reduction on checkout
   - Duplicate checkout rejection via idempotency key
4. **Administrative Workflow Tests**:
   - Super admin reviewing shop application
   - Approval creating live shop profile and granting vendor permissions
   - Audit trail creation on approval/suspension

### 2. Running Automated Tests
```bash
cd NearbyBazaar/backend
python manage.py test tests
```
