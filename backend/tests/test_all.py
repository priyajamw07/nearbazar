import uuid
from django.test import TestCase
from rest_framework.test import APIClient
from rest_framework import status
from apps.common.mongo import get_db, serialize_doc, to_object_id, now_utc
from apps.common.auth import hash_password

class NearbyBazaarBackendTests(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.db = get_db()

    def test_01_public_catalog_endpoints(self):
        """Verify public categories and products endpoints return database-backed items."""
        resp = self.client.get('/api/v1/categories/')
        self.assertEqual(resp.status_code, status.HTTP_200_OK)
        self.assertTrue(resp.data['success'])
        self.assertGreaterEqual(resp.data['count'], 1)

        resp = self.client.get('/api/v1/products/')
        self.assertEqual(resp.status_code, status.HTTP_200_OK)
        self.assertTrue(resp.data['success'])
        self.assertGreaterEqual(resp.data['count'], 1)

    def test_02_generic_login_failure(self):
        """Security: Generic failure response on wrong credentials to prevent account enumeration."""
        resp = self.client.post('/api/v1/auth/login/', {
            'email': 'nonexistent_random_user@nearbybazaar.com',
            'password': 'WrongPassword123'
        }, format='json')
        self.assertEqual(resp.status_code, status.HTTP_401_UNAUTHORIZED)
        self.assertFalse(resp.data['success'])
        self.assertEqual(resp.data['message'], 'Invalid email or password.')

    def test_03_customer_registration_and_login(self):
        """Customer can register and obtain valid JWT tokens."""
        unique_email = f"test_cust_{uuid.uuid4().hex[:8]}@nearbybazaar.com"
        reg_resp = self.client.post('/api/v1/auth/register/', {
            'email': unique_email,
            'password': 'SecurePassword@123',
            'full_name': 'Test New Customer',
            'phone': '+91 99999 11111',
            'role': 'CUSTOMER'
        }, format='json')
        self.assertEqual(reg_resp.status_code, status.HTTP_201_CREATED)
        self.assertTrue('access_token' in reg_resp.data)

        # Login with newly created user
        login_resp = self.client.post('/api/v1/auth/login/', {
            'email': unique_email,
            'password': 'SecurePassword@123'
        }, format='json')
        self.assertEqual(login_resp.status_code, status.HTTP_200_OK)
        self.assertTrue('access_token' in login_resp.data)

    def test_04_vendor_cross_shop_isolation(self):
        """Security: Vendor A attempting to access or modify Vendor B's product must be denied with 403 Forbidden."""
        # 1. Login as Sharma Kirana vendor
        sharma_login = self.client.post('/api/v1/auth/login/', {
            'email': 'vendor@sharmakirana.com',
            'password': 'Vendor@123'
        }, format='json')
        self.assertEqual(sharma_login.status_code, status.HTTP_200_OK)
        sharma_token = sharma_login.data['access_token']

        # 2. Find a product belonging to Kumar Electronics
        kumar_shop = self.db.shops.find_one({'slug': 'kumar-electronics'})
        self.assertIsNotNone(kumar_shop)
        kumar_prod = self.db.products.find_one({'shop_id': kumar_shop['_id']})
        self.assertIsNotNone(kumar_prod)

        # 3. Sharma vendor attempts to PATCH Kumar's product
        self.client.credentials(HTTP_AUTHORIZATION=f"Bearer {sharma_token}")
        patch_resp = self.client.patch(f"/api/v1/vendor/products/{str(kumar_prod['_id'])}/", {
            'price_cents': 999
        }, format='json')
        self.assertEqual(patch_resp.status_code, status.HTTP_403_FORBIDDEN)
        self.assertIn("Access denied", patch_resp.data['message'])

    def test_05_customer_cart_and_multi_vendor_checkout(self):
        """Customer adds items from multiple shops and performs atomic multi-vendor checkout."""
        # 1. Login customer
        cust_login = self.client.post('/api/v1/auth/login/', {
            'email': 'customer@nearbybazaar.com',
            'password': 'Customer@123'
        }, format='json')
        self.assertEqual(cust_login.status_code, status.HTTP_200_OK)
        token = cust_login.data['access_token']
        self.client.credentials(HTTP_AUTHORIZATION=f"Bearer {token}")

        # 2. Clear existing cart
        self.client.delete('/api/v1/cart/')

        # 3. Add 1 vegetable from Sharma Kirana and 1 cable from Kumar Electronics
        tomatoes = self.db.products.find_one({'slug': 'farm-fresh-tomatoes'})
        cable = self.db.products.find_one({'slug': 'fast-charging-braided-type-c-cable'})
        self.assertIsNotNone(tomatoes)
        self.assertIsNotNone(cable)

        add1 = self.client.post('/api/v1/cart/items/', {'product_id': str(tomatoes['_id']), 'quantity': 2}, format='json')
        self.assertEqual(add1.status_code, status.HTTP_200_OK)

        add2 = self.client.post('/api/v1/cart/items/', {'product_id': str(cable['_id']), 'quantity': 1}, format='json')
        self.assertEqual(add2.status_code, status.HTTP_200_OK)

        # 4. View cart and check per-shop grouping
        cart_resp = self.client.get('/api/v1/cart/')
        self.assertEqual(cart_resp.status_code, status.HTTP_200_OK)
        cart = cart_resp.data['cart']
        self.assertEqual(len(cart['shops']), 2)  # Two distinct shops
        self.assertEqual(cart['delivery_fee_cents'], 6000)  # ₹30 per shop * 2 shops = ₹60

        # 5. Checkout
        stock_before_tom = tomatoes['stock_quantity']
        checkout_resp = self.client.post('/api/v1/checkout/', {
            'shipping_address': {'street': 'Flat 101, Green View', 'city': 'Delhi NCR', 'pincode': '110001'},
            'payment_method': 'ONLINE',
            'idempotency_key': f"idempotent_key_{uuid.uuid4().hex}"
        }, format='json')
        self.assertEqual(checkout_resp.status_code, status.HTTP_201_CREATED)
        self.assertTrue(checkout_resp.data['success'])
        order = checkout_resp.data['order']
        self.assertEqual(len(order['seller_order_ids']), 2)

        # 6. Verify atomic stock reduction
        tomatoes_after = self.db.products.find_one({'_id': tomatoes['_id']})
        self.assertEqual(tomatoes_after['stock_quantity'], stock_before_tom - 2)

    def test_06_super_admin_application_approval_workflow(self):
        """Super Admin reviews pending shop application, approves it, automatically promoting vendor."""
        # 1. Login as Super Admin
        admin_login = self.client.post('/api/v1/auth/login/', {
            'email': 'admin@nearbybazaar.com',
            'password': 'Admin@123'
        }, format='json')
        self.assertEqual(admin_login.status_code, status.HTTP_200_OK)
        admin_token = admin_login.data['access_token']
        self.client.credentials(HTTP_AUTHORIZATION=f"Bearer {admin_token}")

        # 2. Ensure a pending application exists
        pending_app = self.db.shop_applications.find_one({'status': 'PENDING'})
        if not pending_app:
            test_applicant = {
                'email': f"app_{uuid.uuid4().hex[:6]}@testshop.com",
                'password_hash': hash_password('Vendor@123'),
                'full_name': 'Test Applicant',
                'phone': '+91 98999 88888',
                'role': 'CUSTOMER',
                'is_active': True,
                'created_at': now_utc()
            }
            app_u_res = self.db.users.insert_one(test_applicant)
            app_doc = {
                'vendor_id': app_u_res.inserted_id,
                'shop_name': f"Test Shop {uuid.uuid4().hex[:4].upper()}",
                'business_type': 'Groceries',
                'owner_name': 'Test Applicant',
                'phone': '+91 98999 88888',
                'email': test_applicant['email'],
                'address': 'Sector 15, Market',
                'documents': ['doc1.pdf'],
                'status': 'PENDING',
                'review_notes': '',
                'created_at': now_utc()
            }
            app_res = self.db.shop_applications.insert_one(app_doc)
            app_doc['_id'] = app_res.inserted_id
            pending_app = app_doc

        # 3. Approve application
        decision_resp = self.client.post(f"/api/v1/admin/applications/{str(pending_app['_id'])}/decision/", {
            'decision': 'APPROVED',
            'review_notes': 'All compliance documentation verified and approved.'
        }, format='json')
        self.assertEqual(decision_resp.status_code, status.HTTP_200_OK)

        # 4. Verify shop was created and user role upgraded to VENDOR_ADMIN
        updated_app = self.db.shop_applications.find_one({'_id': pending_app['_id']})
        self.assertEqual(updated_app['status'], 'APPROVED')

        vendor_user = self.db.users.find_one({'_id': pending_app['vendor_id']})
        self.assertEqual(vendor_user['role'], 'VENDOR_ADMIN')
        self.assertIsNotNone(vendor_user.get('shop_id'))

        created_shop = self.db.shops.find_one({'_id': vendor_user['shop_id']})
        self.assertIsNotNone(created_shop)
        self.assertEqual(created_shop['status'], 'APPROVED')

    def test_07_customer_cannot_access_admin_endpoints(self):
        """Security: Customer role must be denied access to Super Admin endpoints with 403 Forbidden."""
        cust_login = self.client.post('/api/v1/auth/login/', {
            'email': 'customer@nearbybazaar.com',
            'password': 'Customer@123'
        }, format='json')
        self.assertEqual(cust_login.status_code, status.HTTP_200_OK)
        token = cust_login.data['access_token']
        self.client.credentials(HTTP_AUTHORIZATION=f"Bearer {token}")

        # Attempt to access Super Admin applications
        resp = self.client.get('/api/v1/admin/applications/')
        self.assertEqual(resp.status_code, status.HTTP_403_FORBIDDEN)

        # Attempt to access audit logs
        audit_resp = self.client.get('/api/v1/admin/audit-logs/')
        self.assertEqual(audit_resp.status_code, status.HTTP_403_FORBIDDEN)

    def test_08_vendor_order_status_transitions(self):
        """Vendor transitions an order through the fulfillment pipeline."""
        # Login vendor
        v_login = self.client.post('/api/v1/auth/login/', {
            'email': 'vendor@sharmakirana.com',
            'password': 'Vendor@123'
        }, format='json')
        token = v_login.data['access_token']
        self.client.credentials(HTTP_AUTHORIZATION=f"Bearer {token}")

        # Ensure a known PENDING order exists for Sharma Kirana
        sharma_shop = self.db.shops.find_one({'slug': 'sharma-kirana'})
        test_order_doc = {
            'parent_order_number': f"ORD-{uuid.uuid4().hex[:6].upper()}",
            'shop_id': sharma_shop['_id'],
            'shop_name': 'Sharma Kirana',
            'customer_id': to_object_id('000000000000000000000001'),
            'customer_name': 'Demo Customer',
            'items': [{'name': 'Wheat Atta', 'quantity': 1, 'price_cents': 38000}],
            'subtotal_cents': 38000,
            'delivery_fee_cents': 3000,
            'total_cents': 41000,
            'status': 'PENDING',
            'status_history': [],
            'created_at': now_utc()
        }
        res = self.db.seller_orders.insert_one(test_order_doc)
        order_id = str(res.inserted_id)

        # Transition from PENDING -> CONFIRMED
        trans_resp = self.client.post(f"/api/v1/vendor/orders/{order_id}/transition/", {
            'status': 'CONFIRMED',
            'note': 'Order confirmed by store manager.'
        }, format='json')
        self.assertEqual(trans_resp.status_code, status.HTTP_200_OK)
        self.assertEqual(trans_resp.data['order']['status'], 'CONFIRMED')

        # Invalid transition attempt: CONFIRMED directly to DELIVERED (must fail with 400)
        invalid_resp = self.client.post(f"/api/v1/vendor/orders/{order_id}/transition/", {
            'status': 'DELIVERED',
            'note': 'Premature delivery skip.'
        }, format='json')
        self.assertEqual(invalid_resp.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn("Invalid status transition", invalid_resp.data['message'])

