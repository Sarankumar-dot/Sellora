# Sellora Backend: Architectural Analysis

Analysis date: 2026-08-07. Scope: `server/` and its runtime contracts. This is an analysis only; no backend behaviour was changed.

## 1. Project overview

Sellora is a REST backend for a basic multi-role e-commerce marketplace. A user can register and authenticate, become a seller by creating a store profile, list products, add active products to a personal cart, check out into an order, and view their orders. Administrators manage categories and progress orders. Password recovery is email-OTP based. There is no payment, address-at-checkout, delivery, review, wishlist, or image-upload implementation.

The implementation is a **layered MVC/service-layer** application:

```text
HTTP route -> middleware -> controller -> service -> model (raw SQL) -> MySQL
                              |              |
                              |              -> business and ownership rules
                              -> ApiResponse / cookie adaptation
```

Controllers are deliberately thin; services carry business rules; models carry SQL. `ApiError` represents expected failures, `asyncHandler` forwards rejected promises, and the global error handler serializes them.

| Technology / library | Purpose in this project |
|---|---|
| Node.js, ES modules | Runtime and module system (`"type": "module"`). |
| Express 5 | HTTP app, routers, middleware pipeline. |
| MySQL + `mysql2/promise` | Relational persistence, pooled async queries and transactions. |
| Joi | Environment and request validation/coercion. |
| `jsonwebtoken` | Stateless access and refresh JWT signing/verification. |
| `bcrypt` | Password hashing/comparison (10 rounds). |
| `cookie-parser` | Reads the refresh-token cookie. |
| `cors` | Allows exactly `CLIENT_URL` and credentials. |
| Helmet | Sets HTTP security headers. |
| `express-rate-limit` | Brute-force throttles selected auth endpoints. |
| Nodemailer/Gmail | Sends password-reset OTP email. |
| Swagger JSDoc/UI | OpenAPI document and `/api/docs` UI. |
| Morgan | Development request logging. |
| Docker | Node 22 Alpine deployment image and development compose setup. |
| Multer, Cloudinary | Declared dependencies but unused; no upload endpoint exists. |

## 2. Project structure

The repository root also has a Vite React scaffold in `client/`, but it is not integrated with this backend beyond the configured `CLIENT_URL`. The operational backend is `server/`.

| Location | Purpose, files, and interaction |
|---|---|
| `server/src/server.js` | Process entry point. Validates environment through imports, tests MySQL, then listens on `PORT`. |
| `server/src/app.js` | Express composition root: global middleware, Swagger, all route mounts, final error middleware. |
| `server/src/routes/` | HTTP surface per module: `auth`, `seller`, `product`, `category`, `cart`, `order`, `admin`, `health`. Routes declare middleware order then select controllers. |
| `server/src/controllers/` | HTTP adapters. They read `req`, call a service, set status/cookies, and return `ApiResponse`. `health.controller.js` is the exception and writes its own shape. |
| `server/src/services/` | Domain logic for auth, seller, product, category, cart, order, admin. Performs ownership, state, inventory, and duplicate checks. |
| `server/src/models/` | Persistence gateway functions using parameterized `pool.execute`. `order.model.js` also accepts a transaction connection. `admin.model.js` is unused; the admin service uses `order.model.js`. |
| `server/src/middleware/` | JWT verification/role authorization, Joi validation, auth rate limits, and error serialization. |
| `server/src/validations/` | Joi schemas per domain plus shared primitives. `admin.validation.js` is unused. |
| `server/src/config/` | Environment schema, MySQL pool/retry attempt code, and hand-authored OpenAPI definition. |
| `server/src/utils/` | Shared JWT, OTP, email, async wrapper, and response helpers. |
| `server/src/errors/` | `ApiError`, the expected-error class. |
| `server/src/constants/`, `database/`, `uploads/` | Present but empty/unreferenced. No migrations, schema definition, seeds, uploads, or constants live here. |
| `server/.env.example` | Required configuration template; real `.env` must remain private. |
| `server/Dockerfile`, `docker-compose.yml` | Production-style image and local container development setup. |
| `ARCHITECTURE.md` | Useful convention reference, but it misses the `refresh_tokens` table and has a simplified error shape. |

Representative request flow (`PUT /api/products/41`):

```text
React + Authorization bearer token
  -> app: helmet/CORS/body parser/cookie parser/morgan
  -> product router: verifyToken -> authorize('seller') -> Joi params/body validation
  -> product controller
  -> product service: resolve seller profile; find active product; verify seller ownership
  -> product model: parameterized UPDATE, then SELECT
  -> ApiResponse 200
  -> any throw/rejection -> error middleware -> standard error JSON
```

## 3. Request lifecycle

1. Node imports `env.config.js`; invalid/missing required variables print their names and exit. `server.js` calls `testConnection()` before binding the port.
2. Express receives the request. Helmet runs first; CORS admits the single configured origin with credentials; JSON and URL-encoded parsers create `req.body`; cookie-parser creates `req.cookies`; Morgan logs.
3. `/api/docs` is served directly. Every other API path is dispatched to its module router.
4. A route may apply a rate limiter, `verifyToken`, `authorize`, and `validate`, in exactly that listed order. Validation rejects unknown keys and replaces/coerces valid body/params/query values.
5. A controller wrapped with `asyncHandler` awaits a service. The service calls models and raises `ApiError` for expected conditions.
6. Models issue SQL via the pool, except checkout and refresh-token rotation, which use a leased connection transaction.
7. Success normally returns `{ success, statusCode, message, data }`. Errors return `{ success:false, statusCode, message, errors }` (empty `errors` unless validation failed). Unhandled errors become 500 and their raw `message` is exposed.

Important exception: synchronous throws in `verifyToken`/`authorize` are normally handled by Express 5, but unlike controllers they are not explicitly wrapped. Health has a different response format and logs the user agent.

## 4. Database analysis

There is **no DDL, migration, or schema dump in the repository**. The following tables and columns are inferred from executed SQL; PK/FK/index declarations and delete rules are not verifiable until the live schema is inspected. Application code assumes integer IDs and common timestamp columns.

```text
users 1 -- 0..1 seller_profiles 1 -- * products * -- 1 categories
  | 1 -- * refresh_tokens
  | 1 -- * otp_verifications
  | 1 -- * cart * -- 1 products
  | 1 -- * orders 1 -- * order_items * -- 1 products
```

| Table | Purpose and inferred columns | Relationships / business expectations |
|---|---|---|
| `users` | `id`, `name`, `email`, `password`, `mobile_number`, `role` (and possibly timestamps via `SELECT *`). | PK `id`; `email` must be unique in practice. Base identity; roles are customer/seller/admin. |
| `seller_profiles` | `id`, `user_id`, `store_name`, `gst_number`, `pan_number`, `address`, `description`, `logo` (possibly timestamps). | `user_id -> users.id`; code enforces one profile per user, so this should have a unique index. Its `id` is product seller identity. |
| `categories` | `id`, `name`, `description`. | `name` must be unique in practice. Referenced by products; category deletion does not exist. |
| `products` | `id`, `seller_id`, `name`, `description`, `price`, `stock`, `category_id`, `image_url`, `is_active`, `created_at`. | `seller_id -> seller_profiles.id`; `category_id -> categories.id`. Soft deletion sets `is_active=false`; public reads exclude inactive products. |
| `cart` | `id`, `user_id`, `product_id`, `quantity`, `created_at`. | `user_id -> users.id`, `product_id -> products.id`. Code expects one row per `(user_id, product_id)`; enforce that unique index to prevent concurrent duplicate rows. |
| `orders` | `id`, `user_id`, `total_amount`, `status`, `created_at`. | `user_id -> users.id`. Created as `PLACED`, then transitioned by admin. |
| `order_items` | inferred `id`, `order_id`, `product_id`, `quantity`, `price`. | `order_id -> orders.id`; `product_id -> products.id`. Stores the price snapshot. Product names are not snapshotted, so detail history displays a later product-name change. |
| `refresh_tokens` | `id`, `user_id`, `token` (SHA-256 digest, despite name), `expires_at`, `device_info`, `ip_address`, `last_used_at`, `created_at`. | `user_id -> users.id`; token digest should be unique/indexed; active session list excludes expired rows. |
| `otp_verifications` | `id`, `user_id`, `otp`, `purpose`, `expires_at`, `is_verified`, `verified_at`, `resend_count`, `created_at`. | `user_id -> users.id`; only `PASSWORD_RESET` is used. OTP is stored plaintext. |

Recommended/assumed indexes: all PKs; unique `users.email`, `seller_profiles.user_id`, `categories.name`, `cart(user_id, product_id)`, `refresh_tokens.token`; FK indexes; `products(is_active, category_id, created_at)` and `orders(user_id, created_at)`. These are recommendations, not evidence of existing indexes.

## 5. Authentication system

### Register and login

`POST /auth/register` validates and lowercases email, converts `mobileNumber` to `mobile_number`, checks email, bcrypt-hashes password at cost 10, and creates a default-role user (the database default must be `customer` for the flow to work). Registration does not authenticate the browser.

Login checks the email and bcrypt comparison, signs two JWTs with `{ id, email, role }`, returns the access token and safe user object in JSON, hashes the refresh token with SHA-256 before persistence, and sets the raw refresh JWT in a cookie.

```text
Browser                     API                         MySQL
POST login -> validate -> compare password -> user lookup
                              -> sign access + refresh JWT
                              -> save SHA-256(refresh), device/IP, expiry
<- JSON data.token,user + Set-Cookie(refreshToken; HttpOnly) -
```

### Tokens, cookies, sessions, and refresh rotation

Access tokens use `JWT_SECRET` and `JWT_EXPIRES_IN` (template: 15m) and must be sent as `Authorization: Bearer <token>`. Refresh tokens use an independent secret and duration (template: 7d). The `refreshToken` cookie is `HttpOnly`, `SameSite=Strict`, scoped to `/api/auth`, `Secure` only in production, and receives `maxAge` matching the refresh duration. The frontend cannot read it and must send credentialed requests.

`POST /auth/refresh-token` reads the cookie, validates its JWT and stored digest/expiry/user, generates both fresh tokens, then transactionally deletes the old digest and inserts the new digest. Reusing an already-rotated refresh token is rejected. `GET /auth/sessions` lists unexpired token records; it does not identify the current session and `lastUsedAt` is only set at creation/rotation.

`POST /auth/logout` deletes only the cookie's token row and clears the cookie; absent/unknown cookies produce 401. `POST /auth/logout-all` requires a valid access token, deletes all of that user's token rows, and clears the current browser cookie. Password reset and change password also revoke every refresh session, but leave the existing access token usable until it expires.

### Password reset / OTP

```text
Forgot password: email -> find user -> delete prior PASSWORD_RESET OTP
 -> generate six digits -> store plaintext, expires in 10m -> send Gmail email

Reset password: email + OTP + new password -> find unverified unexpired OTP
 -> mark verified -> bcrypt hash -> update user password -> revoke all refresh tokens
```

Only reset uses OTP; there is no registration-email verification, OTP resend endpoint, or OTP-attempt limit beyond endpoint IP throttling. `markOTPVerified`, password update, and token revocation are not one transaction.

## 6. Role-based authorization

Roles are `customer`, `seller`, and `admin`; JWT role is trusted until token expiry. `verifyToken` verifies the access JWT and sets `req.user`; `authorize(...roles)` tests `req.user.role`.

| Role | Effective permissions |
|---|---|
| Customer | Public product browsing; authenticated cart, checkout, orders, sessions/password actions. Can call seller-profile creation and thereby become a seller. |
| Seller | All customer capabilities plus seller profile read/update and product create/update/soft-delete—but only products linked to their seller profile. |
| Admin | Category CRUD (without delete), all-order listing and status update. Admin has no bypass for seller/customer-only route role checks. |

Security flow is bearer token -> verified signature/expiry -> decoded identity and role -> route role gate -> service-level ownership check where needed. Seller profile creation is authenticated but notably has **no** `authorize('customer')` gate, so an existing seller/admin could attempt it; duplicate profile handling stops duplicate sellers, but an admin with no seller profile could downgrade their DB role to seller.

## 7. Modules and implementation contracts

All normal successes use the `ApiResponse` envelope. All documented payloads below are `data` content; validation failures are 400 with `{errors:[{field,message}]}`.

### Authentication

Register body `{name,email,password,mobileNumber}`; password 8–30 chars with upper/lower/digit/special; mobile exactly ten digits. Login `{email,password}` is limited to five requests/15m. Login responds `{token,user}` and a refresh cookie. Refresh has no body. Forgot `{email}` (3/15m) and reset `{email,otp,newPassword}` (5/15m). Change password `{oldPassword,newPassword}` requires bearer auth. Sessions returns records `{id,deviceInfo,ipAddress,createdAt,lastUsedAt,expiresAt}`. Auth errors include 401 invalid credentials/token, 404 unknown user (forgot/reset), 409 duplicate email, and OTP/password-rule 400s.

### Seller

Create/read/update the current profile only. Body has `storeName` (3–100), GST format, PAN format, address 10–255, optional description (max 500) and URL/null/empty `logo`. Creation checks profile absence, inserts it, then changes `users.role` to seller. Those two writes are not transactional. The create route is merely authenticated; read/update require seller role. A frontend should immediately replace cached user role after successful create; the current access token still says `customer`, so it must refresh/login before calling seller-protected endpoints.

### Categories

Admin-only create/list/get/update. Body requires `name` (3–50) even for update because update schema equals create schema; description is optional/max 500. Duplicate names produce 409; fetching an empty collection produces 404 rather than `200 []`; update rejects unchanged values. There is no customer-visible category endpoint and no deletion.

### Products

Public list/detail reads only active products. Sellers create/update/delete; creation requires an existing seller profile, while update/delete also verify profile-to-product ownership. Product body requires name 3–100, description 10–1000, positive price, nonnegative integer stock, `categoryId`, and optional `imageUrl`; image URLs are stored only on update due to a model omission (create SQL omits `image_url`, even though service returns it). Delete is soft delete.

List is paginated: intended query is `page`, `limit`, `search`, `categoryId`, `sort`. In implementation it reads `query.category` and accepts only service sort values `price_asc`/`price_desc`; Joi accepts `categoryId` and sorts `price`, `-price`, `name`, `-name`, `createdAt`, `-createdAt`. Consequently category filtering and requested price sorting do not work; other valid sorts silently fall back to newest. The frontend should not promise working filters/sorts until fixed.

### Cart

Authenticated customers/sellers/admins can add `{productId,quantity}`, list their cart, set a line quantity, or delete a line. Services resolve active product, enforce stock and cart ownership, increment an existing matching line, and return joined fields for list: `{cartId,productId,productName,price,image_url,quantity,subtotal}`. An empty cart is a 404—not an empty array—so the UI should treat it as its empty state. Cart prices and stock are revalidated only when changed or checked out.

### Orders

`POST /orders` is a body-less authenticated checkout. In one DB transaction it reads cart/products, rejects an empty cart/inactive item/insufficient stock, totals current prices, inserts order/items, decrements stock, clears cart, commits, and returns `{orderId,totalAmount,status:'PLACED'}`. `GET /orders` returns the caller's summary rows; zero results are 404. `GET /orders/:id` additionally scopes `o.user_id` to caller and formats an itemised order. There is no payment, delivery address, cancellation endpoint, idempotency key, or checkout request validation.

The transaction alone does not prevent a stock race: its cart query does not use `FOR UPDATE` and stock decrement has no `stock >= quantity` condition. Two concurrent checkouts can both pass validation and make stock negative.

### Admin

`GET /admin/orders` lists every order with customer identity and summary. `PUT /admin/orders/:id/status` accepts one of `PLACED`, `PROCESSING`, `SHIPPED`, `DELIVERED`, `CANCELLED`, but service transitions only permit `PLACED -> SHIPPED|CANCELLED` and `SHIPPED -> DELIVERED`. `PROCESSING` is a validation/UI dead state: no state can transition into it. All admin actions require admin role.

## 8. API documentation summary

Base URL is `${SERVER_URL || http://localhost:5000}/api` in Swagger. Runtime does not validate or require `SERVER_URL`.

| Method | Endpoint | Auth / role | Request body or query | Success data / codes |
|---|---|---|---|---|
| GET | `/health` | Public | — | health object; 200 |
| POST | `/auth/register` | Public | registration body | new user; 201 |
| POST | `/auth/login` | Public | email/password | token, user; 200 + cookie |
| POST | `/auth/refresh-token` | Refresh cookie | — | new access token; 200 + rotated cookie |
| POST | `/auth/logout` | Refresh cookie | — | null; 200 |
| GET | `/auth/sessions` | Bearer | — | active sessions; 200 |
| POST | `/auth/logout-all` | Bearer | — | null; 200 |
| GET | `/auth/me` | Bearer | — | JWT payload, not fresh DB user; 200 |
| POST | `/auth/forgot-password` | Public | email | null; 200 |
| POST | `/auth/reset-password` | Public | email, OTP, new password | null; 200 |
| PUT | `/auth/change-password` | Bearer | old/new password | null; 200 |
| POST | `/seller/profile` | Bearer | seller profile | created profile; 201 |
| GET | `/seller/profile` | Bearer / seller | — | current profile; 200 |
| PUT | `/seller/profile` | Bearer / seller | complete seller profile | profile; 200 |
| POST | `/categories` | Bearer / admin | category | category; 201 |
| GET | `/categories` | Bearer / admin | — | categories; 200 or empty=404 |
| GET | `/categories/:id` | Bearer / admin | positive `id` | category; 200 |
| PUT | `/categories/:id` | Bearer / admin | complete category | category; 200 |
| POST | `/products` | Bearer / seller | product | product; 201 |
| GET | `/products` | Public | `page`, `limit`, `search`, `categoryId`, `sort` | `{products,pagination}`; 200 |
| GET | `/products/:id` | Public | positive `id` | product; 200 |
| PUT | `/products/:id` | Bearer / owner seller | complete product | product; 200 |
| DELETE | `/products/:id` | Bearer / owner seller | — | null; 200 |
| POST | `/cart` | Bearer | productId, quantity | cart item; HTTP 201 but envelope says 200 |
| GET | `/cart` | Bearer | — | cart rows; 200 or empty=404 |
| PUT | `/cart/:id` | Bearer / owner | quantity | cart row; 200 |
| DELETE | `/cart/:id` | Bearer / owner | — | null; 200 |
| POST | `/orders` | Bearer | — | new order; 201 |
| GET | `/orders` | Bearer | — | own order summaries; 200 or none=404 |
| GET | `/orders/:id` | Bearer / owner | positive `id` | itemised order; 200 |
| GET | `/admin/orders` | Bearer / admin | — | all order summaries; 200 |
| PUT | `/admin/orders/:id/status` | Bearer / admin | status | transition result; 200 |

Swagger is served but should not be treated as the sole contract: it describes product list `categoryId` while service reads `category`, and its generalized success schemas can differ from real field casing.

## 9. Middleware analysis

| Middleware | Behaviour and frontend consequence |
|---|---|
| Helmet | Adds security headers. No custom CSP is configured. |
| CORS | Exact `CLIENT_URL`, `credentials:true`; use Axios `withCredentials:true` for auth-cookie calls. Multiple frontends/origins are unsupported without config change. |
| Express body parsers | JSON and URL-encoded requests accepted; no explicit size limit, so Express defaults apply. |
| Cookie parser | Makes `req.cookies.refreshToken` available. |
| Morgan `dev` | Logs request method/path/status in all environments currently. |
| `loginLimiter`, `forgotPasswordLimiter`, `resetPasswordLimiter` | Per default key (normally IP), rolling 15-minute fixed windows: limits 5/3/5. 429 JSON omits `errors`, unlike global errors. |
| `verifyToken` | Requires `Authorization: Bearer <accessJWT>`, verifies it, stores decoded payload. Invalid/missing is 401. |
| `authorize` | Accepts specific roles after verification; mismatch is 403. |
| `validate` | Joi validates supplied body/params/query with coercion and unknown-key rejection. Collects errors across segments. |
| Error handler | Last middleware. Emits expected standardized errors but does not log errors or hide unexpected error messages. |

## 10. Configuration, database, documentation, and deployment

Required environment values: `NODE_ENV` (`development|production|test`), `PORT`, `DB_HOST`, `DB_PORT`, `DB_USER`, `DB_PASSWORD`, `DB_NAME`, access/refresh secrets and compact durations (`15m`, `7d`), Gmail `EMAIL_USER`/`EMAIL_PASS`, and absolute `CLIENT_URL`. Unknown environment variables are allowed. `SERVER_URL` is optional and Swagger-only. No environment variable configures TLS on/off, pool size, cookie domain, proxy trust, mail provider, or log level.

The MySQL pool has SSL with `rejectUnauthorized:false`, waits for connections, has `connectionLimit:10`, unlimited queue, and uses prepared parameter values for most data. Startup nominally has up to 12 exponential retries, but the catch block calls `process.exit(1)` before retry code, so it actually exits on its first failed connection.

Swagger is built in code and mounted at `/api/docs`; the actual OpenAPI server value uses `SERVER_URL`, then localhost. It does not derive the current host or guaranteed production URL.

Docker image: Node 22 Alpine, `npm ci --omit=dev`, copies app, exposes 5000, starts `npm start`, and health-checks `/api/health`. Compose is explicitly a development setup: source bind mount, `node --watch`, .env file, and no MySQL service. README says Railway MySQL backs Docker and Render deployment, but there is no Render Blueprint, Railway config, CI/CD manifest, or migration/deployment automation in the repository. Production must set the hosting service start command, every environment variable, outbound SMTP access, and CORS target manually.

## 11. Business rules and implementation gaps

- Email registration is checked before insertion; only a DB unique key makes this race-safe.
- One seller profile is checked per user and promotion to seller occurs after insert; the profile and role update should be transactional.
- Categories are name-unique in code; product category existence is **not** checked before product write (the database FK must enforce it).
- Product visibility and cart eligibility require `is_active=true`; product deletion is soft.
- A cart item can be manipulated only by its `user_id`; adding same product increments quantity; stock is checked.
- Checkout snapshots price in `order_items`, totals current product prices, reduces product stock, and clears cart atomically—except concurrent stock reads are not locked.
- Order ownership is enforced for customer detail reads; admin alone changes status under the limited transition map.
- Refresh tokens are server-revocable, hashed at rest, and single-use after rotation; all sessions are revoked on password reset/change.
- Reset OTPs expire after 10 minutes; each forgotten-password request deletes the prior OTP. They are plaintext and only one valid OTP is accepted once.

## 12. Security review

Strengths: bcrypt password storage; distinct JWT secrets; short configurable access-token lifetime; hashed persisted refresh tokens; rotation transaction; HttpOnly refresh cookie; `SameSite=Strict`; explicit credentialed CORS; Helmet; endpoint-specific rate limits; parameterized SQL values; Joi unknown-key rejection; service-level cart/product ownership checks; transactions for checkout.

Priority improvements (not implemented):

1. Lock/decrement inventory atomically (`SELECT ... FOR UPDATE` or conditional `UPDATE stock = stock - ? WHERE stock >= ?`) to prevent overselling.
2. Fix product query contract, product image insertion, admin order-state graph, and create seller profile role/transaction vulnerability.
3. Enforce and document database constraints/FKs/indexes through checked-in migrations; add transaction/unique protection to email, profile, category, cart writes.
4. Store a hash of OTPs, add OTP attempt accounting, and avoid account-enumerating 404s on forgot password.
5. Add CSRF protection appropriate to cookie refresh endpoints, cookie-domain/same-site configuration for cross-site deployments, `app.set('trust proxy', 1)` when behind Render proxy, and secure cookie verification in deployed topology.
6. Do not expose raw 500 messages; structured error logging/monitoring and correlation IDs are missing.
7. Add request body limits, production logging policy, integration tests, dependency/security scanning, secret rotation policy, and API versioning.
8. Validate that a category exists on product create/update, define pricing precision using `DECIMAL`, and preserve product-name/image snapshots in order items.

## 13. Frontend requirements

### Shared application shell and API layer

Use a single Axios/fetch client with `baseURL=<API>/api`, JSON parsing, and `withCredentials:true` for every request (necessary for refresh/logout). Keep the access token in memory—not local storage if avoiding XSS persistence—and attach it to bearer-protected calls. On a 401 from a protected call, make one `POST /auth/refresh-token` credentialed attempt, replace the in-memory token, retry once, then clear client auth and go to login. Never try to read `refreshToken` client-side.

Normalise API errors from the common envelope; field errors should render next to the relevant form inputs. Treat 404 as an empty state for cart/orders/categories where the service uses it that way. Every query/mutation needs loading, disabled-submit, retryable error, and accessible success feedback states. Re-fetch/invalidate cart after any cart mutation and after checkout; re-fetch product data after seller mutations; re-fetch user/session data after auth mutation.

### Pages, components, and flows by module

| Area | Pages/components/forms/state and expected flow |
|---|---|
| Auth | Register, Login, Forgot Password, Reset Password, Change Password, Sessions, and profile menu/logout. Client validation must match password/mobile/OTP rules; display 429 countdown guidance. App bootstrap calls `/auth/me` only if an access token is present, otherwise tries refresh once. After seller-profile creation, refresh token/access state before dashboard navigation. |
| Public catalog | Product list with pagination, search (minimum 2 chars), product card, detail page, quantity selector, add-to-cart. Show stock/active availability. Do not expose category/sort controls as functional until backend query drift is resolved; categories endpoint is admin-only. |
| Cart | Protected Cart page with line rows, totals computed from returned subtotals, quantity editor and remove confirmation, empty-cart 404 handling. Checkout button posts body-less order request, handles inventory failure by refreshing cart/product view, and navigates to order detail on success. |
| Orders | Protected My Orders list, Order Detail, success receipt. Recognise `PLACED/SHIPPED/DELIVERED/CANCELLED`; no customer cancellation UI because no endpoint exists. Treat `GET /orders` 404 as first-order empty state. |
| Seller | Seller onboarding profile form; protected seller profile/settings; Seller dashboard; product create/edit form and product management list. There is no “my products” endpoint, so a dashboard cannot reliably list seller-owned products using the current API. Image field is URL-only and creation does not persist it—label accordingly or wait for backend fix. |
| Admin | Admin route guard; category list/create/edit UI; all-orders table and status action. Hide impossible `PROCESSING` selection and derive next action from actual graph: placed -> shipped/cancelled, shipped -> delivered. Admin needs a navigation model separate from customer/seller since roles do not inherit permissions. |

Suggested client state: `AuthContext` (user, token, initialized, login/refresh/logout); server cache (React Query/SWR) for products/cart/orders/seller/categories/admin orders; a small cart count derived after `GET /cart`; and UI-local form/modal/toast state. Role guards should use current `user.role`, but server remains authoritative. Route guards: authenticated for cart/orders/account; seller-only for product/profile management; admin-only for admin pages; public for catalog/auth pages.

## 14. React frontend roadmap

1. **Foundation**: Vite routing, environment-based API URL, Axios client/interceptors, API response/error types, AuthContext, credentialed requests, query cache, layouts, toast/error/empty/loading components, role-route guards.
2. **Authentication and account**: registration/login, silent refresh, logout, forgot/reset/change password, sessions; test expiry/retry and server validation errors.
3. **Customer catalog**: home/product listing/detail/search/pagination, add-to-cart and cart badge. Defer broken category/sort controls or feature-flag them.
4. **Cart and orders**: cart editing/checkout, success state, orders list/detail and all associated empty/inventory error flows.
5. **Seller experience**: onboarding/profile forms and product create/edit/delete. Explicitly plan around missing seller inventory-list API or request it before building a complete dashboard.
6. **Admin experience**: categories and order operations with transition-aware controls.
7. **Quality/deployment**: accessibility and responsive passes, API-mocking/integration tests, error monitoring, production variables/CORS alignment, deployment preview and smoke test (`/api/health`, `/api/docs`).

## 15. Missing features

- Payments, payment state, webhooks, refunds, invoices, tax/shipping calculation.
- Shipping/billing addresses, delivery tracking, customer order cancellation/returns.
- Product images/uploads/gallery (current dependencies do not implement them), variants, SKU, brands, attributes.
- Public category browsing, seller storefronts, and a seller-owned-products endpoint/dashboard analytics.
- Product reviews/ratings, wishlists, recommendations, recently viewed items.
- Coupon/promotions, saved carts, stock reservations/inventory history and low-stock alerts.
- Notifications (email/order events/in-app), admin user/seller management and seller verification.
- Pagination/filtering for orders/categories/admin, audit logs, exports, privacy/account deletion.
- Schema migrations/seeds, automated tests, API versioning, health checks that verify dependencies, observability and CI/CD.

## 16. Project quality review

| Dimension | Assessment |
|---|---|
| Architecture | Good foundation: clear route/controller/service/model separation, centralized responses/errors, and small cohesive modules. Some unused files/dependencies and duplicated order-query models reduce clarity. |
| Code organization | Generally readable and conventionally organized. Lack of migrations/tests, empty directories, stale `ARCHITECTURE.md` details, and Swagger/runtime drift make the contract less dependable. |
| Scalability | MySQL pool and transactional checkout are sound starting points. Query pagination exists for products, but missing indexes/DDL proof, no cache/background jobs, no observability, and inventory race conditions limit scale readiness. |
| Maintainability | Service boundaries make change approachable. Integration/unit tests, consistent naming/casing, a generated OpenAPI contract, and checked-in schema are necessary before a larger team can rely on it. |
| Production readiness | Partial: environment validation, Docker, health check, Docker dependency lock, security headers, and rate limits exist. Deployment manifest, robust DB startup retry, secret/SMTP operations, proxy config, monitoring, migrations, backups, and CI are absent. |
| Security | Better than a basic demo in password/JWT/session design. Remaining high-impact concerns are inventory concurrency, plaintext OTP, raw error leakage, incomplete cookie/CSRF/proxy configuration, and reliance on unverified database constraints. |

Overall: a promising learning-to-early-product backend with a clean basic shape. A production React frontend can safely implement the documented working paths, but should account for 404-as-empty semantics and avoid relying on the identified broken/missing contracts until the backend is corrected.
