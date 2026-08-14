# Sellora — Frontend Product Requirements Document (PRD)

## 1. Overview
Sellora is a multi-vendor ecommerce platform. The backend (Node.js/Express + MySQL) is complete and exposes REST APIs for auth, sellers, products, categories, cart, orders, and admin operations. This document defines the scope of the frontend web application to be built on top of that backend.

## 2. Goals
- Give buyers a smooth browse → cart → checkout experience.
- Give sellers a dashboard to manage their store, products, and orders.
- Give admins a panel to manage categories, sellers, and platform-wide orders.
- Ship a production-quality, responsive UI reusing the backend as-is (with noted gaps tracked separately).

## 3. User Roles
| Role | Capabilities |
|---|---|
| **Guest** | Browse products/categories, view product details, register/login |
| **User (buyer)** | Everything a guest can do + cart, checkout, order history, profile, password management |
| **Seller** | Everything a user can do + seller profile, product CRUD, view own orders (pending backend fix — see Known Gaps) |
| **Admin** | Manage categories, view/update all orders (pending backend fix for full admin scope — see Known Gaps) |

## 4. Core Features (by module)

### 4.1 Authentication
- Register, Login, Logout
- Forgot password / Reset password / Change password
- Persistent session via access + refresh token
- "Sessions" view (list & revoke active sessions) — maps to `GET /auth/sessions`, `POST /auth/logout-all`
- Route protection based on JWT + role

### 4.2 Storefront (Buyer-facing)
- Home page — featured/latest products, category navigation
- Product listing — search, filter by category, sort (price asc/desc), pagination
- Product detail page
- Cart — add/update/remove items, quantity control, subtotal
- Checkout — order summary, address entry (pending backend field — see Known Gaps), Razorpay payment
- Order history & order detail/tracking
- User profile & password management

### 4.3 Seller Dashboard
- Seller onboarding (create seller profile: store name, GST, PAN, address, logo, description)
- Seller profile view/edit
- Product management — create/edit/delete/deactivate own products, image upload (Cloudinary)
- Orders for their products (pending backend endpoint — see Known Gaps)

### 4.4 Admin Panel
- Category management (CRUD)
- Platform order management (view all orders, update order status)
- (Seller/user management — not currently exposed by backend; flagged as a future addition)

## 5. Known Backend Gaps Affecting Frontend Scope
These were identified reviewing the current backend and will shape what the frontend can/can't do at launch:

1. `GET /categories` is currently admin-protected — needs to be public for storefront browsing (blocking for category filters).
2. No seller-facing "my orders" endpoint — seller order management will need to be stubbed or deferred.
3. Products support only a single image — product galleries deferred until multi-image support exists.
4. No address fields on orders / no address book endpoints — checkout will need a minimal inline address form persisted with the order once the backend supports it, or held client-side short-term.
5. No Razorpay verify/webhook endpoint — payment confirmation flow needs backend support before going live; frontend will build against the expected flow but final wiring depends on this.
6. No reviews, wishlist, or cancellation/refund endpoints — out of scope for v1 frontend.

## 6. Out of Scope (v1)
- Product reviews & ratings
- Wishlist
- Order cancellation/refunds UI
- Admin seller/user management
- Multi-image product galleries
- Multi-language/i18n

## 7. Success Criteria
- Buyer can register, browse, add to cart, and complete a checkout end-to-end against the real backend.
- Seller can onboard, list a product, and see it appear in the storefront.
- Admin can manage categories and update order statuses.
- Fully responsive (mobile-first), matches design system built in Phase 2.
