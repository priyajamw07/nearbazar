# NearbyBazaar: Security Hardening & Implementation Standards

### 1. Identity & Credential Protection
- **Password Storage**: Uses PBKDF2 with SHA-256 and salt via Django's secure password hasher. Passwords are never logged or stored in plaintext.
- **JWT Architecture**: Cryptographically signed HMAC-SHA256 tokens with short expiration (60 minutes) for access tokens and 7-day refresh tokens.
- **Account Enumeration Defense**: Login failures return generic responses (`"Invalid email or password"`) without indicating whether the email exists.
- **Suspension Enforcement**: Inactive or suspended accounts are rejected at token validation.

### 2. Multi-Vendor Isolation
- **Boundary Enforcement**: Every vendor endpoint resolves `shop_id` from the verified JWT token claims and database user record, never from client-controlled URLs or request bodies.
- **Object-Level Authorization**: Attempting to view, update, or transition another vendor's order, product, or inventory returns `403 Forbidden`.
- **Status Machine Checks**: Fulfillment transitions are strictly enforced (`PENDING` -> `CONFIRMED` -> `PROCESSING` -> `SHIPPED` -> `DELIVERED`). Invalid transitions are rejected.

### 3. Server-Authoritative Financial & Order Calculations
- **Cart & Checkout Pricing**: Cart calculations, taxes, delivery fees, and discounts are recomputed server-side against current database prices. Client-submitted prices are discarded.
- **Idempotent Checkout**: A unique idempotency key is required for order creation, preventing duplicate debits and duplicate orders on network retries.
- **Stock Reservation**: Stock counts are validated and atomically decremented upon order placement. If stock is insufficient, checkout fails cleanly.

### 4. Image Upload Security Pipeline
- **Validation Layers**: File size limit (max 5MB), image signature magic bytes verification (via Pillow), and MIME type whitelist (`image/jpeg`, `image/png`, `image/webp`).
- **Filename Sanitization**: Uploaded filenames are never used directly. Random UUID-based keys are generated to prevent path traversal and arbitrary code execution.
- **Metadata Stripping**: Image files are re-encoded through Pillow to strip EXIF GPS location data and sanitize potential embedded payloads.

### 5. Audit Trail & Sensitive Logging
- **Append-Only Audit Logs**: Administrative events (shop approval, suspension, user status changes, refund interventions) are recorded with timestamp, actor ID, action, target, and IP address.
- **Sanitized Logs**: Passwords, card numbers, and secret tokens are strictly scrubbed from all logging outputs.
