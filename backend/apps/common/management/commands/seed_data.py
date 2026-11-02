
from datetime import datetime, timezone
from django.core.management.base import BaseCommand
from apps.common.mongo import get_db, now_utc
from apps.common.auth import hash_password

class Command(BaseCommand):
    help = 'Seeds authentic demonstration data for NearbyBazaar matching visual reference.'

    def handle(self, *args, **options):
        db = get_db()
        self.stdout.write("Seeding NearbyBazaar database...")

        # Clear existing collections
        db.users.delete_many({})
        db.shops.delete_many({})
        db.shop_applications.delete_many({})
        db.categories.delete_many({})
        db.products.delete_many({})
        db.orders.delete_many({})
        db.seller_orders.delete_many({})
        db.carts.delete_many({})
        db.promotions.delete_many({})
        db.audit_logs.delete_many({})

        # 1. Categories
        categories_data = [
            {'name': 'Groceries', 'slug': 'groceries', 'icon': 'shopping-basket', 'image_url': 'assets/images/cat_groceries.jpg', 'item_count': 12, 'is_active': True},
            {'name': 'Fresh Vegetables', 'slug': 'vegetables', 'icon': 'leaf', 'image_url': 'assets/images/cat_veggies.jpg', 'item_count': 8, 'is_active': True},
            {'name': 'Electronics', 'slug': 'electronics', 'icon': 'cpu', 'image_url': 'assets/images/cat_electronics.jpg', 'item_count': 6, 'is_active': True},
            {'name': 'Fashion & Clothes', 'slug': 'fashion', 'icon': 'tag', 'image_url': 'assets/images/cat_fashion.jpg', 'item_count': 8, 'is_active': True},
            {'name': 'Packaged Goods', 'slug': 'packaged-goods', 'icon': 'box', 'image_url': 'assets/images/cat_packaged.jpg', 'item_count': 10, 'is_active': True},
            {'name': 'Snacks & Namkeen', 'slug': 'snacks', 'icon': 'coffee', 'image_url': 'assets/images/cat_snacks.jpg', 'item_count': 7, 'is_active': True},
        ]
        cat_map = {}
        for c in categories_data:
            res = db.categories.insert_one(c)
            cat_map[c['slug']] = res.inserted_id

        # 2. Super Admin
        admin_doc = {
            'email': 'admin@nearbybazaar.com',
            'password_hash': hash_password('Admin@123'),
            'full_name': 'Super Administrator',
            'phone': '+91 98000 00001',
            'role': 'SUPER_ADMIN',
            'is_active': True,
            'shop_id': None,
            'created_at': now_utc(),
            'updated_at': now_utc()
        }
        admin_res = db.users.insert_one(admin_doc)

        # 3. Vendors & Shops
        # Vendor 1: Sharma Kirana
        sharma_vendor = {
            'email': 'vendor@sharmakirana.com',
            'password_hash': hash_password('Vendor@123'),
            'full_name': 'Ram Sharma',
            'phone': '+91 98111 22334',
            'role': 'VENDOR_ADMIN',
            'is_active': True,
            'shop_id': None,
            'created_at': now_utc(),
            'updated_at': now_utc()
        }
        sharma_res = db.users.insert_one(sharma_vendor)

        sharma_shop = {
            'vendor_id': sharma_res.inserted_id,
            'name': 'Sharma Kirana & General Store',
            'slug': 'sharma-kirana',
            'category': 'Groceries',
            'description': 'Serving the neighborhood with pure grains, dairy, fresh spices, and daily essentials for 25 years.',
            'address': {'street': 'Shop #4, Main Market, Sector 14', 'city': 'Delhi NCR', 'pincode': '110001'},
            'phone': '+91 98111 22334',
            'status': 'APPROVED',
            'rating': 4.8,
            'review_count': 324,
            'opening_time': '07:30',
            'closing_time': '21:30',
            'is_open': True,
            'image_url': 'assets/images/sharma_kirana.jpg',
            'created_at': now_utc()
        }
        sharma_shop_res = db.shops.insert_one(sharma_shop)
        db.users.update_one({'_id': sharma_res.inserted_id}, {'$set': {'shop_id': sharma_shop_res.inserted_id}})

        # Vendor 2: Kumar Electronics
        kumar_vendor = {
            'email': 'vendor@kumarelec.com',
            'password_hash': hash_password('Vendor@123'),
            'full_name': 'Sunil Kumar',
            'phone': '+91 98222 33445',
            'role': 'VENDOR_ADMIN',
            'is_active': True,
            'shop_id': None,
            'created_at': now_utc(),
            'updated_at': now_utc()
        }
        kumar_res = db.users.insert_one(kumar_vendor)

        kumar_shop = {
            'vendor_id': kumar_res.inserted_id,
            'name': 'Kumar Electronics & Mobile Care',
            'slug': 'kumar-electronics',
            'category': 'Electronics',
            'description': 'Genuine phone chargers, headphones, smart cables, home electricals, and rapid repair services.',
            'address': {'street': 'Shop #12, Commercial Complex, Sector 14', 'city': 'Delhi NCR', 'pincode': '110001'},
            'phone': '+91 98222 33445',
            'status': 'APPROVED',
            'rating': 4.6,
            'review_count': 188,
            'opening_time': '10:00',
            'closing_time': '20:30',
            'is_open': True,
            'image_url': 'assets/images/kumar_electronics.jpg',
            'created_at': now_utc()
        }
        kumar_shop_res = db.shops.insert_one(kumar_shop)
        db.users.update_one({'_id': kumar_res.inserted_id}, {'$set': {'shop_id': kumar_shop_res.inserted_id}})

        # Vendor 3: Clothes Trendz
        trendz_vendor = {
            'email': 'vendor@clothestrendz.com',
            'password_hash': hash_password('Vendor@123'),
            'full_name': 'Pooja Verma',
            'phone': '+91 98333 44556',
            'role': 'VENDOR_ADMIN',
            'is_active': True,
            'shop_id': None,
            'created_at': now_utc(),
            'updated_at': now_utc()
        }
        trendz_res = db.users.insert_one(trendz_vendor)

        trendz_shop = {
            'vendor_id': trendz_res.inserted_id,
            'name': 'Clothes Trendz & Matching Center',
            'slug': 'clothes-trendz',
            'category': 'Fashion & Clothes',
            'description': 'Trendy casual shirts, traditional cotton kurtas, dupattas, and seasonal apparel for the family.',
            'address': {'street': 'Shop #28, Fashion Lane, Sector 14', 'city': 'Delhi NCR', 'pincode': '110001'},
            'phone': '+91 98333 44556',
            'status': 'APPROVED',
            'rating': 4.7,
            'review_count': 94,
            'opening_time': '10:30',
            'closing_time': '21:00',
            'is_open': True,
            'image_url': 'assets/images/clothes_trendz.jpg',
            'created_at': now_utc()
        }
        trendz_shop_res = db.shops.insert_one(trendz_shop)
        db.users.update_one({'_id': trendz_res.inserted_id}, {'$set': {'shop_id': trendz_shop_res.inserted_id}})

        # 4. Pending Vendor Applicant (for Admin review demo)
        applicant_user = {
            'email': 'applicant@leelabazaar.com',
            'password_hash': hash_password('Vendor@123'),
            'full_name': 'Leela Ram',
            'phone': '+91 98444 55667',
            'role': 'CUSTOMER',
            'is_active': True,
            'shop_id': None,
            'created_at': now_utc(),
            'updated_at': now_utc()
        }
        app_user_res = db.users.insert_one(applicant_user)

        pending_app = {
            'vendor_id': app_user_res.inserted_id,
            'shop_name': 'Leela Bazaar Fresh Veggies & Fruits',
            'business_type': 'Fresh Vegetables',
            'owner_name': 'Leela Ram',
            'phone': '+91 98444 55667',
            'email': 'applicant@leelabazaar.com',
            'address': 'Stall 2, Subzi Mandi, Main Road',
            'documents': ['gstin_certificate.pdf', 'fssai_mandate.pdf'],
            'status': 'PENDING',
            'review_notes': '',
            'created_at': now_utc()
        }
        db.shop_applications.insert_one(pending_app)

        # 5. Customer User
        customer_user = {
            'email': 'customer@nearbybazaar.com',
            'password_hash': hash_password('Customer@123'),
            'full_name': 'Aarav Gupta',
            'phone': '+91 98555 66778',
            'role': 'CUSTOMER',
            'is_active': True,
            'shop_id': None,
            'created_at': now_utc(),
            'updated_at': now_utc()
        }
        cust_res = db.users.insert_one(customer_user)

        # 6. Real Products (matching reference image cards)
        products_data = [
            # Sharma Kirana (Veggies & Packaged)
            {
                'shop_id': sharma_shop_res.inserted_id,
                'shop_name': 'Sharma Kirana & General Store',
                'name': 'Farm Fresh Tomatoes (Tamatar)',
                'slug': 'farm-fresh-tomatoes',
                'category_id': cat_map['vegetables'],
                'category_name': 'Fresh Vegetables',
                'description': 'Direct from local farms, ripe juicy red tomatoes suitable for daily Indian curries.',
                'sku': 'SHM-VEG-TOM-01',
                'price_cents': 3500,  # ₹35.00
                'compare_price_cents': 4500,
                'stock_quantity': 150,
                'unit': '1 kg',
                'is_available': True,
                'image_url': 'assets/images/prod_tomatoes.jpg',
                'created_at': now_utc(),
                'updated_at': now_utc()
            },
            {
                'shop_id': sharma_shop_res.inserted_id,
                'shop_name': 'Sharma Kirana & General Store',
                'name': 'Fresh Green Cauliflower (Phool Gobhi)',
                'slug': 'fresh-cauliflower',
                'category_id': cat_map['vegetables'],
                'category_name': 'Fresh Vegetables',
                'description': 'Crisp, pesticide-free fresh white cauliflower with vibrant green leaves.',
                'sku': 'SHM-VEG-GOB-02',
                'price_cents': 4000,  # ₹40.00
                'compare_price_cents': 5000,
                'stock_quantity': 80,
                'unit': '1 pc (approx 700g)',
                'is_available': True,
                'image_url': 'assets/images/prod_cauliflower.jpg',
                'created_at': now_utc(),
                'updated_at': now_utc()
            },
            {
                'shop_id': sharma_shop_res.inserted_id,
                'shop_name': 'Sharma Kirana & General Store',
                'name': 'Aashirvaad Shudh Chakki Atta',
                'slug': 'aashirvaad-shudh-chakki-atta-5kg',
                'category_id': cat_map['groceries'],
                'category_name': 'Groceries',
                'description': '100% pure whole wheat flour chakki milled for soft fluffy rotis.',
                'sku': 'SHM-GRO-ATT-05',
                'price_cents': 23500,  # ₹235.00
                'compare_price_cents': 27000,
                'stock_quantity': 45,
                'unit': '5 kg bag',
                'is_available': True,
                'image_url': 'assets/images/prod_atta.jpg',
                'created_at': now_utc(),
                'updated_at': now_utc()
            },
            {
                'shop_id': sharma_shop_res.inserted_id,
                'shop_name': 'Sharma Kirana & General Store',
                'name': 'Haldiram Nagpur Bhujia Sev',
                'slug': 'haldiram-nagpur-bhujia-sev',
                'category_id': cat_map['snacks'],
                'category_name': 'Snacks & Namkeen',
                'description': 'Crispy spicy tepary bean and chickpea flour noodles with a touch of red chili.',
                'sku': 'SHM-SNK-BHU-01',
                'price_cents': 9500,  # ₹95.00
                'compare_price_cents': 11000,
                'stock_quantity': 90,
                'unit': '400g pouch',
                'is_available': True,
                'image_url': 'assets/images/prod_bhujia.jpg',
                'created_at': now_utc(),
                'updated_at': now_utc()
            },
            {
                'shop_id': sharma_shop_res.inserted_id,
                'shop_name': 'Sharma Kirana & General Store',
                'name': 'Fortune Sunlite Refined Sunflower Oil',
                'slug': 'fortune-sunlite-sunflower-oil-1l',
                'category_id': cat_map['packaged-goods'],
                'category_name': 'Packaged Goods',
                'description': 'Enriched with Vitamin A and D, light and healthy cooking medium.',
                'sku': 'SHM-PKG-OIL-01',
                'price_cents': 14500,  # ₹145.00
                'compare_price_cents': 16500,
                'stock_quantity': 60,
                'unit': '1 Litre pouch',
                'is_available': True,
                'image_url': 'assets/images/prod_oil.jpg',
                'created_at': now_utc(),
                'updated_at': now_utc()
            },

            # Kumar Electronics
            {
                'shop_id': kumar_shop_res.inserted_id,
                'shop_name': 'Kumar Electronics & Mobile Care',
                'name': 'Fast Charging Braided Type-C Cable',
                'slug': 'fast-charging-braided-type-c-cable',
                'category_id': cat_map['electronics'],
                'category_name': 'Electronics',
                'description': '65W Dash/VOOC ultra-durable nylon braided charging cable for Android devices.',
                'sku': 'KMR-ELE-CAB-01',
                'price_cents': 19900,  # ₹199.00
                'compare_price_cents': 39900,
                'stock_quantity': 75,
                'unit': '1.5 meter',
                'is_available': True,
                'image_url': 'assets/images/prod_cable.jpg',
                'created_at': now_utc(),
                'updated_at': now_utc()
            },
            {
                'shop_id': kumar_shop_res.inserted_id,
                'shop_name': 'Kumar Electronics & Mobile Care',
                'name': 'boAt BassHeads 100 Wired Earphones',
                'slug': 'boat-bassheads-100-earphones',
                'category_id': cat_map['electronics'],
                'category_name': 'Electronics',
                'description': 'Hawk-inspired in-ear stereo headphones with built-in mic and super extra bass.',
                'sku': 'KMR-ELE-EAR-02',
                'price_cents': 39900,  # ₹399.00
                'compare_price_cents': 59900,
                'stock_quantity': 40,
                'unit': '1 unit with carry pouch',
                'is_available': True,
                'image_url': 'assets/images/prod_earphones.jpg',
                'created_at': now_utc(),
                'updated_at': now_utc()
            },

            # Clothes Trendz
            {
                'shop_id': trendz_shop_res.inserted_id,
                'shop_name': 'Clothes Trendz & Matching Center',
                'name': 'Casual Pure Cotton Checked Shirt',
                'slug': 'casual-pure-cotton-checked-shirt',
                'category_id': cat_map['fashion'],
                'category_name': 'Fashion & Clothes',
                'description': 'Breathable pre-washed pure cotton regular fit shirt with chest pocket.',
                'sku': 'TRZ-FAS-SHT-01',
                'price_cents': 59900,  # ₹599.00
                'compare_price_cents': 89900,
                'stock_quantity': 35,
                'unit': 'Size: L (40)',
                'is_available': True,
                'image_url': 'assets/images/prod_shirt.jpg',
                'created_at': now_utc(),
                'updated_at': now_utc()
            }
        ]
        db.products.insert_many(products_data)

        # 7. Seed Sample Orders for Sharma Kirana (matching reference image metrics & table)
        # Orders: 220101, 220102, 220103, 220104 with Status "Packed"
        recent_vendor_orders = [
            {'order_id': '220101', 'customer': 'Deepak Verma', 'items_desc': 'Packaged Provisions (Atta 5kg, Oil 1L)', 'amount_cents': 11000, 'status': 'PROCESSING'},
            {'order_id': '220102', 'customer': 'Sunita Devi', 'items_desc': 'Fresh Veggies (Tomatoes, Cauliflower)', 'amount_cents': 7500, 'status': 'CONFIRMED'},
            {'order_id': '220103', 'customer': 'Rahul Mehta', 'items_desc': 'Snacks (Haldiram Bhujia x 2)', 'amount_cents': 19000, 'status': 'CONFIRMED'},
            {'order_id': '220104', 'customer': 'Sonia Sethi', 'items_desc': 'Daily Grocery items', 'amount_cents': 5000, 'status': 'CONFIRMED'},
        ]
        for ro in recent_vendor_orders:
            db.seller_orders.insert_one({
                'parent_order_number': f"NBZ-20261029-{ro['order_id']}",
                'shop_id': sharma_shop_res.inserted_id,
                'shop_name': 'Sharma Kirana & General Store',
                'customer_id': cust_res.inserted_id,
                'customer_name': ro['customer'],
                'items': [{'name': ro['items_desc'], 'quantity': 1, 'price_cents': ro['amount_cents']}],
                'subtotal_cents': ro['amount_cents'],
                'delivery_fee_cents': 3000,
                'total_cents': ro['amount_cents'] + 3000,
                'status': ro['status'],
                'status_history': [
                    {'status': 'PENDING', 'timestamp': now_utc(), 'note': 'Order received'},
                    {'status': ro['status'], 'timestamp': now_utc(), 'note': 'Items packed by shopkeeper'}
                ],
                'created_at': now_utc()
            })

        # 8. Seed Audit Log Event
        db.audit_logs.insert_one({
            'actor_id': admin_res.inserted_id,
            'actor_email': 'admin@nearbybazaar.com',
            'actor_role': 'SUPER_ADMIN',
            'action': 'SYSTEM_INITIALIZED',
            'target_type': 'platform',
            'target_id': 'nearbybazaar_core',
            'ip_address': '127.0.0.1',
            'metadata': {'message': 'Platform seeded with local Indian neighborhood demo data.'},
            'created_at': now_utc()
        })

        self.stdout.write(self.style.SUCCESS("Database successfully seeded with demo accounts, shops, categories, and products!"))
