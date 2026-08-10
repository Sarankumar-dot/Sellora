# Sellora — Application Flow

**Status:** Documentation only. No frontend or backend code was modified, no components/routes/services were created, no packages were installed.
**Primary source:** `SELLORA_FRONTEND_REQUIREMENTS.md` (FPRD). Where a flow touches something the FPRD already flagged, this document reuses that finding rather than re-deriving it.

**Tagging convention used throughout:**
- **BACKEND CONFIRMED** — verified against actual backend behavior.
- **BACKEND DISCREPANCY** — backend's real behavior differs from what was originally documented/expected.
- **BACKEND BLOCKED** — the flow cannot be built as originally envisioned because no backend support exists.
- **UI ONLY** — client-side behavior with no server dependency (validation, focus management, transitions, etc.).

---

## 1. Application Flow Overview

```
Visitor
  ↓
Home (public)
  ↓
Products (public)
  ↓
Product Details (public)
  ↓
Login / Register (guest)
  ↓
Authenticated Customer
  ↓
Cart → Checkout → Order → Account
```

Branches from Authenticated Customer:

```
Customer → Seller Onboarding → Seller Dashboard
Admin (separate login) → Admin Dashboard
```

Five distinct access states drive every route and nav decision in this document:

| State | Description |
|---|---|
| Public | No auth required, no auth checked. |
| Guest | No auth required, but the route is meaningless if already authenticated (login/register/forgot/reset). |
| Authenticated Customer | Valid access token, `role: customer`. |
| Authenticated Seller | Valid access token, `role: seller`. |
| Authenticated Admin | Valid access token, `role: admin`. |

---

## 2. Application Entry Flow

On load of `/` (or any deep link), the app resolves auth **before** rendering role-dependent UI:

```
App boots
  ↓
AuthContext state = "loading"
  ↓
Restore access token from existing in-memory/storage mechanism (UI ONLY)
  ↓
Token present?
  ├─ No  → state = "unauthenticated" → render guest/public UI
  └─ Yes → GET /api/auth/me (BACKEND CONFIRMED — returns JWT payload, not a fresh DB record)
             ├─ 200 → state = "authenticated", role from payload → render role-aware UI
             └─ 401 → attempt ONE POST /api/auth/refresh-token (§8)
                        ├─ success → state = "authenticated"
                        └─ failure → state = "unauthenticated"
```

**Requirement (UI ONLY):** while state is `"loading"`, render a neutral loading shell — never the logged-out navbar. An authenticated user must never see a flash of "Login / Register" before restoration completes, per the FPRD's session-persistence requirement.

Only once state leaves `"loading"` does the router decide which navbar and which routes are reachable.

---

## 3. Global Navigation Flow

| State | Navbar items |
|---|---|
| Logged out | Home, Products, Login, Register |
| Customer | Home, Products, Cart, Account, Logout |
| Seller | Home, Products, Cart, Account, Seller Dashboard, Logout |
| Admin | Home, Products, Account, Admin Dashboard, Logout |

**BACKEND CONFIRMED requirement carried from the FPRD:** navigating Dashboard → Home → Products → Account → Dashboard must never re-trigger a login prompt. Auth state lives in `AuthContext` for the lifetime of the session and is not re-derived per route; only the initial entry flow (§2) and the 401 interceptor (§8) touch it.

---

## 4. Authentication Flow (index)

This section indexes §5–§10 below; each is a self-contained flow with its own API dependency.

```
Register (§5) → Login (§6) → Session Restoration (§7) → Token Refresh (§8) → Logout (§9) / Logout-All (§10)
```

---

## 5. Registration Flow

```
/register
  ↓
Enter name, email, password, mobileNumber
  ↓
Client-side validation (UI ONLY):
  password: 8–30 chars, upper+lower+digit+special
  mobileNumber: exactly 10 digits
  ↓
POST /api/auth/register (BACKEND CONFIRMED)
  ↓
201 → success feedback → navigate to /login
409 (duplicate email) → inline error, do not clear form
400 (validation) → field-level errors
```

**BACKEND CONFIRMED:** registration does **not** authenticate the browser. There is no token, no cookie, no auto-login. The user must proceed to Login explicitly.

---

## 6. Login Flow

```
/login
  ↓
Enter email, password
  ↓
POST /api/auth/login (BACKEND CONFIRMED, rate-limited 5/15min)
  ↓
200 → { token, user } + HttpOnly refresh cookie set by backend
  ↓
Store access token via existing AuthContext mechanism (never the refresh token)
  ↓
Auth state = authenticated, role = user.role
  ↓
Redirect:
  customer → /account
  seller   → /seller
  admin    → /admin
  (or the originally-requested protected route, if the user was redirected to /login from one — UI ONLY)
```

Errors: 401 invalid credentials → inline error, no field-level blame. 429 → rate-limit message. Network failure → generic retry message.

---

## 7. Session Restoration Flow

Identical to §2's token-present branch — repeated here as its own flow because it also runs on hard refresh, not just first boot:

```
App has an access token in memory/storage
  ↓
GET /api/auth/me (BACKEND CONFIRMED)
  ↓
200 → authenticated
401 → POST /api/auth/refresh-token (§8) → success: authenticated / failure: unauthenticated
```

**UI ONLY:** the refresh token itself is never read by JavaScript at any point in this flow — it travels solely via the HttpOnly cookie.

---

## 8. Token Refresh Flow

```
Any protected request
  ↓
401 response
  ↓
Has this request already attempted a refresh? (UI ONLY guard flag)
  ├─ Yes → clear auth state → redirect to /login where the route requires it. STOP. (no second attempt)
  └─ No  → POST /api/auth/refresh-token, withCredentials: true (BACKEND CONFIRMED — rotates refresh token, rejects reuse of an already-rotated one)
             ├─ 200 → replace access token → retry the ORIGINAL request exactly once
             └─ failure → clear auth state → redirect to /login where required
```

**BACKEND CONFIRMED constraint:** never call refresh from a request against `/api/auth/refresh-token` itself, and never allow a retried request's own 401 to trigger a second refresh — this is the exact infinite-loop case the FPRD's Axios requirements warn against.

---

## 9. Logout Flow

```
User clicks Logout
  ↓
POST /api/auth/logout (BACKEND CONFIRMED — deletes only the current session's refresh-token row; missing/unknown cookie → 401)
  ↓
Regardless of API success or failure:
  clear access token
  clear AuthContext state → unauthenticated
  ↓
Navigate to /
  ↓
Navbar switches to logged-out state
```

**Requirement:** a failed logout call must not leave the user visibly authenticated — client-side state is always cleared.

---

## 10. Logout-All-Sessions Flow

```
/account/security
  ↓
Active Sessions list (GET /api/auth/sessions — BACKEND CONFIRMED: no "current session" flag, lastUsedAt only updates at creation/rotation)
  ↓
Click "Logout All Sessions"
  ↓
Confirmation dialog (UI ONLY — required, per FPRD)
  ↓
Confirmed → POST /api/auth/logout-all (BACKEND CONFIRMED)
  ↓
200 → refresh local session list / clear it → success toast
  ↓
Note: this also invalidates the CURRENT session's refresh cookie, so if the access token later expires, the next refresh attempt will fail and the user will be signed out.
```

---

## 11. Forgot Password Flow

```
/login → "Forgot Password?" → /forgot-password
  ↓
Enter email
  ↓
POST /api/auth/forgot-password (BACKEND CONFIRMED, rate-limited 3/15min)
  ↓
200 → generic success message ("if an account exists, an OTP was sent") → navigate to /reset-password
400 → invalid email format
404 → BACKEND CONFIRMED the endpoint can return unknown-user 404; UI should still show a neutral message rather than confirming/denying account existence, to avoid email enumeration
429 → rate-limit feedback
500 / network → generic error, allow retry
```

---

## 12. Reset Password OTP Flow

```
/reset-password
  ↓
Fields: email, OTP (6 boxes), new password
  ↓
OTP box behavior (UI ONLY):
  one digit per box, numeric only
  auto-advance focus forward on entry
  backspace moves focus back and clears
  paste of a full 6-digit string fills all boxes
  reject >6 digits
  keyboard accessible, aria-labeled
  ↓
POST /api/auth/reset-password (BACKEND CONFIRMED — OTP 6 digits, 10-minute expiry, single-use)
  ↓
200 → password updated, ALL refresh sessions revoked server-side → navigate to /login with success message
400 (bad/expired OTP) → inline OTP error, allow re-entry, do not clear email/password fields
404 (unknown email) → neutral error, same enumeration caution as §11
```

---

## 13. Change Password Flow

```
/account/security → Change Password
  ↓
Old password, new password (UI ONLY: same password complexity validation as registration)
  ↓
PUT /api/auth/change-password (BACKEND CONFIRMED)
  ↓
200 → ALL refresh sessions revoked server-side (current access token remains valid until its own expiry) → success toast
  ↓
UI requirement: inform the user that other devices/sessions have been signed out, since the access token elsewhere won't refresh anymore
400 (old password wrong) → inline error on old-password field only
```

---

## 14. Public Home Flow

```
/  (public)
  ↓
Hero: what Sellora is, what a visitor can do, why shop here (no generic placeholder copy)
  ↓
Product-discovery CTA → /products
  ↓
Trust/value-proposition section
  ↓
Footer
```

**BACKEND BLOCKED:** no category-discovery section — there is no public category-read endpoint (see FPRD §2.4/§7). **No fabricated "featured products" section** unless backed by a real, confirmed endpoint; none currently exists for this purpose.

---

## 15. Product Discovery Flow

```
/products
  ↓
GET /api/products?page=&limit=&search= (BACKEND CONFIRMED for page/limit/search)
  ↓
Loading → results grid → pagination controls
```

**BACKEND DISCREPANCY (carried from FPRD §2.5):** `categoryId` sent by the frontend is never read by the service (it reads `query.category` internally), and the sort values Joi accepts do not correspond to what the service implements — only `price_asc`/`price_desc` work server-side, and any other value silently falls back to newest-first. **Do not wire a working category filter or price-sort control** until this is fixed backend-side; if a sort/filter control is shown at all, it must be visibly marked limited/best-effort.

---

## 16. Search Flow

```
/products search box
  ↓
Minimum 2 characters (UI ONLY)
  ↓
Debounce (UI ONLY, e.g. 300–400ms)
  ↓
GET /api/products?search=<term> (BACKEND CONFIRMED)
  ↓
States: Typing → Loading → Results
  ↓
No matches → "No products found for '<term>'" empty state with a "Clear search" action
```

---

## 17. Product Details Flow

```
Product card click → /products/:id
  ↓
GET /api/products/:id (BACKEND CONFIRMED — public, active products only)
  ↓
Display: image, name, description, price, stock, category, quantity selector, Add to Cart
```

**BACKEND BLOCKED:** no reviews, ratings, wishlist, or related products — none of these exist server-side.

---

## 18. Add-to-Cart Flow

```
Product Details → select quantity → click "Add to Cart"
  ↓
Authenticated?
  ├─ No  → redirect to /login (optionally carry a return-to reference so the user lands back on this product page after login — UI ONLY)
  └─ Yes → POST /api/cart { productId, quantity } (BACKEND CONFIRMED — existing line for the same product is incremented, not duplicated; response is HTTP 201)
             ↓
             success → update in-memory cart count/state → success toast → update navbar cart indicator
             failure (e.g. out of stock) → inline error, do not update cart state
```

---

## 19. Cart Flow

```
/cart
  ↓
GET /api/cart (BACKEND CONFIRMED)
  ├─ 200 → render line items: product, image, quantity, price, subtotal, remove control, total
  └─ 404 → render Empty Cart state — this is NOT an error (BACKEND CONFIRMED behavior)
  ↓
Quantity change → PUT /api/cart/:id { quantity } → on success, re-fetch or optimistically update + re-derive total
Remove line → DELETE /api/cart/:id → on success, re-fetch or remove locally; if cart becomes empty, show Empty Cart state
```

Stock validation on quantity change only where the backend response provides that data (per FPRD §2.6) — do not invent a client-side stock ceiling beyond what's returned.

---

## 20. Checkout Flow

```
/cart → "Checkout" → /checkout
  ↓
Review order (cart contents, computed total — client display only, backend recomputes authoritatively)
  ↓
"Place Order" → POST /api/orders  (BACKEND CONFIRMED: NO request body)
  ↓
201 → { orderId, totalAmount, status: 'PLACED' } → Order Confirmation screen
```

**BACKEND BLOCKED, never simulate:** payment step, payment confirmation, delivery-address form, coupon/discount entry, order cancellation. The checkout screen must not present any of these as functional.

---

## 21. Order Creation Flow

```
POST /api/orders
  ↓
Backend transaction (BACKEND CONFIRMED): read cart → validate active/in-stock items → total current prices
  → create order → create order_items → decrement stock → clear cart → commit
  ↓
Success → { orderId, totalAmount, status: 'PLACED' }
  ↓
Order Confirmation → "View Order" (→ /account/orders/:id) or "Continue Shopping" (→ /products)
  ↓
Failure (e.g. item went out of stock mid-checkout, empty cart) → rollback occurred server-side → show the specific error returned, do not assume the order was partially created
```

---

## 22. Customer Account Flow

```
/account
  ↓
Sub-nav: Profile, Orders, Security
  ↓
(If shown at all) Wishlist, Addresses, Settings → BACKEND BLOCKED, rendered as clearly-labeled "Not available yet" — never backed by fake local persistence
```

---

## 23. Customer Order History Flow

```
/account/orders
  ↓
GET /api/orders (BACKEND CONFIRMED)
  ├─ 200 → list of order summaries
  └─ 404 → "No Orders Yet" empty state with a "Shop Products" action — NOT an error
  ↓
Click an order → /account/orders/:id (or equivalent) → §24
```

---

## 24. Customer Order Details Flow

```
GET /api/orders/:id (BACKEND CONFIRMED — scoped to the caller, 404 if not owned/not found)
  ↓
Display: Order ID, status, date, total, itemized list (product, quantity, price)
```

**BACKEND DISCREPANCY to reflect in copy:** `order_items` stores a price snapshot but **not** a product-name snapshot. If a seller renames a product after purchase, the order detail will show the current name, not the name at time of purchase. Do not label the displayed name as "as purchased."

---

## 25. Seller Onboarding Flow

```
Authenticated Customer → "Become a Seller" → /seller/onboarding
  ↓
Enter storeName, gstNumber, panNumber, address, description, logo
  ↓
POST /api/seller/profile (BACKEND CONFIRMED — authenticated, any role; no customer-only gate exists server-side; creates the profile then updates users.role — these two writes are not transactional)
  ↓
201 → profile created, but the CURRENT access token still says role: customer
  ↓
MANDATORY: refresh the session (re-login or trigger a token refresh per the app's existing mechanism) BEFORE calling any seller-protected endpoint
  ↓
AuthContext role updated to seller
  ↓
Navigate to /seller
```

**BACKEND DISCREPANCY, explicit warning:** calling a seller-protected endpoint immediately after profile creation, using the pre-onboarding token, will fail authorization. This refresh step is not optional UI polish — it is required for the flow to work at all.

---

## 26. Seller Dashboard Flow

```
/seller
  ↓
Store overview (from GET /api/seller/profile) + product list summary
  ↓
Actions: Create Product, Edit Product, Deactivate Product — all scoped to products owned by this seller (BACKEND CONFIRMED ownership check happens server-side on update/delete)
```

---

## 27. Seller Profile Flow

```
/seller/profile
  ↓
GET /api/seller/profile (BACKEND CONFIRMED, seller role required) → display storeName, GST, PAN, address, description, logo
  ↓
Edit → PUT /api/seller/profile (BACKEND CONFIRMED — full body required)
  ↓
Success → updated profile reflected immediately in UI
```

---

## 28. Seller Product Management Flow

```
Create: /seller/products/create → POST /api/products (BACKEND CONFIRMED, requires existing seller profile)
Edit:   /seller/products/:id/edit → PUT /api/products/:id (BACKEND CONFIRMED, ownership enforced)
Delete: confirmation dialog (UI ONLY, required) → DELETE /api/products/:id (BACKEND CONFIRMED — soft delete, sets is_active=false)
```

**BACKEND DISCREPANCY, explicit:** the create endpoint's INSERT omits `image_url` even though the response includes it — an image entered at creation time is **not actually persisted** until the product is subsequently updated. The Create Product success screen must not claim the image was saved; direct the seller to confirm/re-save the image on the edit screen, or design the create flow to immediately chain into an update call for the image field.

---

## 29. Admin Dashboard Flow

```
/admin
  ↓
Sections: Orders, Categories — admin role required for both (route-level and API-level gate)
```

---

## 30. Admin Order Management Flow

```
/admin/orders
  ↓
GET /api/admin/orders (BACKEND CONFIRMED) → table: Order ID, Customer, Total, Status, Date
  ↓
Status change control, limited to CURRENTLY VALID transitions only (BACKEND CONFIRMED service rules):
  PLACED  → SHIPPED or CANCELLED
  SHIPPED → DELIVERED
  DELIVERED / CANCELLED → no further transition
  ↓
PUT /api/admin/orders/:id/status { status }
```

**BACKEND DISCREPANCY, explicit:** validation accepts `PROCESSING` as a status value, but no service transition ever produces or accepts it. The status dropdown/action list must never offer `PROCESSING` as a selectable option, regardless of what the validation schema would technically accept.

---

## 31. Admin Category Management Flow

```
/admin/categories
  ↓
GET /api/categories (BACKEND CONFIRMED — admin-only, NOT public)
  ├─ 200 → list
  └─ 404 → "No categories yet" empty state — not an error
  ↓
Create → POST /api/categories { name (3–50), description (optional, ≤500) } — duplicate name → 409
Edit   → PUT /api/categories/:id — full body required (update schema = create schema)
```

**BACKEND BLOCKED:** no delete endpoint exists for categories — do not add a delete action to this screen.

---

## 32. Unauthorized Access Flow

```
ProtectedRoute wrapper
  ↓
Auth state still "loading"? → render loading shell, do not decide access yet
  ↓
Unauthenticated + protected route → redirect to /login (optionally carrying the intended destination — UI ONLY)
  ↓
Authenticated but wrong role → redirect to the user's own dashboard (or an access-denied screen), never render the protected content first and hide it after
```

Examples explicitly covered: Customer → `/admin` (denied), Seller → editing another seller's product (denied server-side via ownership check, must also be prevented client-side by not exposing edit controls on products the current seller doesn't own), Unauthenticated → `/account` (redirect to `/login`).

---

## 33. Error Handling Flow

| Status | Handling |
|---|---|
| 400 | Field-level or form-level validation message from response. |
| 401 | On a protected request: attempt refresh once (§8). On login itself: "invalid credentials," no refresh attempt. |
| 403 | Do NOT attempt token refresh — this is an authorization failure, not an expired-token failure. Show access-denied messaging. |
| 404 (context-sensitive — BACKEND CONFIRMED design, not a bug) | `GET /cart` → empty cart. `GET /orders` → no orders. `GET /categories` → no categories. `GET /products/:id` or `/orders/:id` → genuinely not found. |
| 409 | Conflict (duplicate email, duplicate category name) → inline message. |
| 429 | Rate-limit message, discourage immediate retry. |
| 500 | Generic "something went wrong" — never surface the raw backend `message` (per BACKEND CONFIRMED behavior that 500s expose raw internal error text; the frontend must not relay that to the user). |
| Network error | Generic connectivity message, offer retry. |

---

## 34. Loading States

Required for: login, register, products list, product details, cart, checkout submission, orders list, order details, seller profile fetch/save, product create/update, admin orders list, admin category list/create/update, session restoration (§2).

**UI ONLY requirement:** every mutating action (submit, checkout, delete, status change) disables its trigger control for the duration of the request to prevent duplicate submissions.

---

## 35. Empty States

| Context | Trigger | Message + action |
|---|---|---|
| Cart | `GET /cart` → 404 | "Your cart is empty" → Continue Shopping |
| Orders | `GET /orders` → 404 | "No Orders Yet" → Shop Products |
| Products search | 0 results | "No products found for '<term>'" → Clear search |
| Products (no search) | 0 results | "No products available" |
| Admin categories | `GET /categories` → 404 | "No categories yet" → Create Category |
| Seller products | 0 owned products | "You haven't listed any products yet" → Create Product |

---

## 36. Mobile Navigation Flow

```
Hamburger icon (UI ONLY)
  ↓
Navigation drawer opens (respects prefers-reduced-motion per DESIGN.md)
  ↓
Role-aware item list — same items as §3, in drawer form
  ↓
Select route → drawer closes → navigate
```

Cart and Account must remain one tap away for authenticated users on every screen width; they are not buried deeper in mobile than in desktop nav.

---

## 37. Complete End-to-End User Journeys

**Journey A — First-time purchase**
```
Visitor → Home → Products → Product Details → Register → Login →
Product Details → Add to Cart → Cart → Checkout → Order Confirmation →
Account → Orders
```

**Journey B — Password recovery**
```
Login → Forgot Password → enter email → OTP screen → enter OTP + new password →
Reset success → Login → Account
```

**Journey C — Becoming a seller**
```
Customer → Seller Onboarding form → POST /seller/profile →
Session/role refresh (mandatory) → Seller Dashboard →
Create Product → Edit Product (to persist image, per §28 discrepancy) → Deactivate Product
```

**Journey D — Admin order + category management**
```
Admin Login → Admin Dashboard → View Orders → Update Order status (valid transition only) →
Categories → Create Category → Edit Category
```

**Journey E — Session persistence check**
```
Authenticated User → Home → Products → own Dashboard → Home
(auth state must remain intact at every step — no re-login prompt)
```

---

## 38. Route Access Matrix

| Route | Public | Guest | Customer | Seller | Admin | API dependency |
|---|:---:|:---:|:---:|:---:|:---:|---|
| `/` | ✓ | ✓ | ✓ | ✓ | ✓ | none (public) |
| `/products` | ✓ | ✓ | ✓ | ✓ | ✓ | `GET /products` |
| `/products/:id` | ✓ | ✓ | ✓ | ✓ | ✓ | `GET /products/:id` |
| `/login` | – | ✓ | – | – | – | `POST /auth/login` |
| `/register` | – | ✓ | – | – | – | `POST /auth/register` |
| `/forgot-password` | – | ✓ | – | – | – | `POST /auth/forgot-password` |
| `/reset-password` | – | ✓ | – | – | – | `POST /auth/reset-password` |
| `/account` | – | – | ✓ | ✓ | ✓ | `GET /auth/me` |
| `/account/orders` | – | – | ✓ | ✓ | ✓ | `GET /orders` |
| `/account/security` | – | – | ✓ | ✓ | ✓ | `GET /auth/sessions`, `PUT /auth/change-password`, `POST /auth/logout-all` |
| `/cart` | – | – | ✓ | ✓ | – | `GET/PUT/DELETE /cart` |
| `/checkout` | – | – | ✓ | ✓ | – | `POST /orders` |
| `/seller` | – | – | – | ✓ | – | `GET /seller/profile` |
| `/seller/onboarding` | – | – | ✓ | – | – | `POST /seller/profile` |
| `/seller/profile` | – | – | – | ✓ | – | `GET/PUT /seller/profile` |
| `/seller/products` | – | – | – | ✓ | – | `GET /products` (own) |
| `/seller/products/create` | – | – | – | ✓ | – | `POST /products` |
| `/seller/products/:id/edit` | – | – | – | ✓ | – | `PUT /products/:id` |
| `/admin` | – | – | – | – | ✓ | none directly |
| `/admin/orders` | – | – | – | – | ✓ | `GET /admin/orders`, `PUT /admin/orders/:id/status` |
| `/admin/categories` | – | – | – | – | ✓ | `GET/POST/PUT /categories` |

(Seller and Admin cells for Cart/Checkout are marked ✓/– based on whether a seller can also shop as a customer — sellers retain customer capabilities per the FPRD's role table; admins do not have a defined cart/checkout use case in the backend and are left unmarked (–) rather than assumed.)

---

## 39. API Dependency Matrix

| Page / Action | API | Method | Auth | Success | Failure | Frontend behavior |
|---|---|---|---|---|---|---|
| Health check | `/health` | GET | Public | 200 | — | Deployment check only, not user-facing |
| Register | `/auth/register` | POST | Public | 201 | 400/409 | Navigate to login on success |
| Login | `/auth/login` | POST | Public | 200 | 401/429 | Set auth state, redirect by role |
| Refresh | `/auth/refresh-token` | POST | Refresh cookie | 200 | 401 | Retry original request once / clear auth |
| Logout | `/auth/logout` | POST | Refresh cookie | 200 | 401 | Always clear local state |
| Sessions | `/auth/sessions` | GET | Bearer | 200 | 401 | Render session list |
| Logout all | `/auth/logout-all` | POST | Bearer | 200 | 401 | Confirm first, then clear/refresh session list |
| Get current user | `/auth/me` | GET | Bearer | 200 | 401 | JWT payload only, drives auth state |
| Forgot password | `/auth/forgot-password` | POST | Public | 200 | 400/404/429 | Neutral messaging, navigate to reset |
| Reset password | `/auth/reset-password` | POST | Public | 200 | 400/404 | Navigate to login on success |
| Change password | `/auth/change-password` | PUT | Bearer | 200 | 400/401 | Warn other sessions signed out |
| Create seller profile | `/seller/profile` | POST | Bearer | 201 | 400/409 | Force session refresh before seller routes |
| Get seller profile | `/seller/profile` | GET | Bearer+seller | 200 | 401/403 | Populate dashboard/profile |
| Update seller profile | `/seller/profile` | PUT | Bearer+seller | 200 | 400/401/403 | Reflect update immediately |
| Create category | `/categories` | POST | Bearer+admin | 201 | 400/409 | Refresh admin list |
| List categories | `/categories` | GET | Bearer+admin | 200 | 404 | 404 → empty state |
| Get category | `/categories/:id` | GET | Bearer+admin | 200 | 404 | Detail/edit form |
| Update category | `/categories/:id` | PUT | Bearer+admin | 200 | 400 | Reflect update |
| Create product | `/products` | POST | Bearer+seller | 201 | 400/403 | Image not persisted yet (§28) |
| List products | `/products` | GET | Public | 200 | — | Search/pagination only reliable |
| Get product | `/products/:id` | GET | Public | 200 | 404 | Product details page |
| Update product | `/products/:id` | PUT | Bearer+owner | 200 | 401/403 | Reflect update |
| Delete product | `/products/:id` | DELETE | Bearer+owner | 200 | 401/403 | Confirm first, soft delete |
| Add to cart | `/cart` | POST | Bearer | 201 | 400/401 | Update cart indicator |
| Get cart | `/cart` | GET | Bearer | 200 | 404 | 404 → empty cart |
| Update cart item | `/cart/:id` | PUT | Bearer+owner | 200 | 400 | Re-derive total |
| Remove cart item | `/cart/:id` | DELETE | Bearer+owner | 200 | 401/403 | Re-fetch cart |
| Checkout | `/orders` | POST | Bearer | 201 | 400 | No body; navigate to confirmation |
| Order history | `/orders` | GET | Bearer | 200 | 404 | 404 → "No Orders Yet" |
| Order detail | `/orders/:id` | GET | Bearer+owner | 200 | 404 | Itemized display |
| Admin order list | `/admin/orders` | GET | Bearer+admin | 200 | 401/403 | Table view |
| Admin order status | `/admin/orders/:id/status` | PUT | Bearer+admin | 200 | 400 | Only valid transitions offered |

---

## 40. Final Flow Validation Checklist

**Authentication**
- [ ] Register works
- [ ] Login works
- [ ] Session restoration works
- [ ] Refresh works exactly once, no loop
- [ ] Logout works, always clears local state
- [ ] Logout-all works, requires confirmation
- [ ] Forgot password works, neutral messaging
- [ ] OTP reset works, all OTP UI behaviors implemented
- [ ] Change password works, warns about session revocation

**Public**
- [ ] Home renders without category browsing or fabricated featured products
- [ ] Products list works (search + pagination); category/sort not falsely presented as working
- [ ] Search works with debounce and empty state
- [ ] Product details works, no reviews/wishlist/related products shown

**Customer**
- [ ] Add to cart works, redirects unauthenticated users to login
- [ ] Cart works
- [ ] Empty cart (404) renders as empty state, not an error
- [ ] Checkout works with no payment/address/coupon step
- [ ] Order creation works
- [ ] Order history works, 404 renders "No Orders Yet"
- [ ] Order details works, does not claim snapshotted product name

**Seller**
- [ ] Seller onboarding works
- [ ] Role/session refresh happens before any seller-protected call
- [ ] Seller dashboard works
- [ ] Seller profile GET/PUT works
- [ ] Create product works, image-persistence caveat handled
- [ ] Edit product works
- [ ] Deactivate product works, requires confirmation

**Admin**
- [ ] Admin dashboard works
- [ ] Admin orders list works
- [ ] Only valid status transitions are offered (`PROCESSING` never shown)
- [ ] Categories CRUD works (no delete action present)
- [ ] Empty categories (404) renders as empty state

**Navigation**
- [ ] Public navigation works
- [ ] Protected navigation works
- [ ] Role-based navigation works
- [ ] No authentication loss navigating Home ↔ Products ↔ Dashboard ↔ Account
- [ ] Mobile drawer navigation works, cart/account remain reachable

**Error handling**
- [ ] 400 handled
- [ ] 401 handled (refresh-then-redirect logic, no loop)
- [ ] 403 handled (no refresh attempt)
- [ ] 404 handled per-context (empty states vs. genuine not-found)
- [ ] 409 handled
- [ ] 429 handled
- [ ] 500 handled (raw backend message never shown to user)
- [ ] Network failures handled

---

*End of document.*
