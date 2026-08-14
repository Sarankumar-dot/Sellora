# Sellora — Frontend Technical Requirements Document (TRD)

## 1. Tech Stack
| Layer | Choice | Why |
|---|---|---|
| Framework | React + Vite | Fast dev server, simple SPA setup, matches CSR needs of a dashboard + storefront |
| Routing | React Router v6 | Standard for Vite SPAs |
| Data fetching / caching | TanStack Query (React Query) | Maps cleanly to REST, handles caching/loading/refetch for cart, orders, products |
| HTTP client | Axios | Interceptors for attaching Bearer token + handling 401 → refresh-token flow |
| Styling | Tailwind CSS | Utility-first, fast to build consistent design system |
| UI components | shadcn/ui | Accessible, customizable, pairs with Tailwind |
| Forms & validation | React Hook Form + Zod | Zod schemas mirror backend Joi validation shapes |
| State (auth/cart UI state) | React Context + React Query (server state) | Avoid heavier state libs; app doesn't need Redux-scale complexity |
| Icons | lucide-react | Matches shadcn/ui ecosystem |

## 2. Architecture

```
sellora-frontend/
├── src/
│   ├── api/              # axios instance + one file per resource (auth.js, products.js, cart.js, orders.js, seller.js, admin.js, categories.js)
│   ├── components/
│   │   ├── ui/            # shadcn primitives
│   │   ├── common/         # Navbar, Footer, ProtectedRoute, RoleGuard, Loader, ErrorState
│   │   └── [feature]/       # ProductCard, CartItem, OrderRow, etc.
│   ├── pages/
│   │   ├── storefront/      # Home, ProductList, ProductDetail, Cart, Checkout, Orders, Profile
│   │   ├── auth/           # Login, Register, ForgotPassword, ResetPassword
│   │   ├── seller/          # SellerOnboarding, SellerDashboard, SellerProducts, SellerOrders
│   │   └── admin/          # AdminCategories, AdminOrders
│   ├── hooks/              # useAuth, useCart, useProducts, useOrders (React Query wrappers)
│   ├── context/            # AuthContext
│   ├── layouts/            # StorefrontLayout, SellerLayout, AdminLayout
│   ├── lib/                # zod schemas, constants, formatters
│   ├── routes/             # route config + guards
│   └── main.jsx / App.jsx
├── .env                   # VITE_API_BASE_URL
└── tailwind.config.js
```

## 3. API Integration Layer
- Single Axios instance (`src/api/client.js`) with:
  - `baseURL` from `VITE_API_BASE_URL`
  - Request interceptor: attach `Authorization: Bearer <accessToken>`
  - Response interceptor: on `401`, attempt `POST /auth/refresh-token`, retry original request once; on failure, force logout
- Every backend response follows `{ success, statusCode, message, data }` / `{ success: false, statusCode, message, errors }` — a shared `unwrapResponse` helper normalizes this so hooks/components only deal with `data` or a thrown `ApiError`.

## 4. Auth & Route Protection
- Tokens stored based on backend's actual issuance mechanism (httpOnly cookie if backend sets one, else access token in memory + refresh flow via `/auth/refresh-token`) — confirm cookie vs. bearer approach before Phase 3.
- `AuthContext` exposes `{ user, isAuthenticated, isLoading, login, logout }`, hydrated via `GET /auth/me` on app load.
- `ProtectedRoute` — redirects to `/login` if unauthenticated.
- `RoleGuard` — wraps seller/admin routes, checks `user.role`.

## 5. Data Fetching Conventions
- One React Query hook per resource/action, e.g. `useProducts(filters)`, `useProduct(id)`, `useCart()`, `useAddToCart()`, `useCreateOrder()`.
- Query keys namespaced by resource: `['products', filters]`, `['cart']`, `['orders', orderId]`.
- Mutations invalidate related queries on success (e.g. adding to cart invalidates `['cart']`).

## 6. Environment Variables
```
VITE_API_BASE_URL=http://localhost:5000/api
VITE_RAZORPAY_KEY_ID=<public key only>
```

## 7. Non-Functional Requirements
- Mobile-first responsive layout (Tailwind breakpoints)
- Loading/empty/error states on every data-driven view
- Form validation errors surfaced inline (Zod + React Hook Form)
- Basic accessibility: semantic HTML, focus states, alt text on product images
- Centralized error boundary for uncaught render errors

## 8. Development Phases

**Phase 1 — Project Setup & Folder Structure**
Vite + React scaffold, Tailwind + shadcn/ui installed and configured, folder structure above created, Axios instance + env config, React Router base setup, ESLint/Prettier.

**Phase 2 — Design System (via Stitch)**
Generate design direction/screens in Stitch for key pages (Home, Product Listing, Product Detail, Cart, Checkout, Seller Dashboard, Admin Panel), translate into Tailwind design tokens (colors, spacing, typography) and reusable shadcn-based components (Button, Card, Input, Badge, Modal, Table).

**Phase 3 — Authentication**
Login, Register, Forgot/Reset Password pages, AuthContext + token handling, ProtectedRoute/RoleGuard, `/auth/me` hydration on load.

**Phase 4 — Storefront Core**
Home page, Product Listing (search/filter/sort/pagination), Product Detail page, category navigation (blocked until backend `GET /categories` is made public — build with mock data if needed in the meantime).

**Phase 5 — Cart & Checkout**
Cart page (add/update/remove), Checkout flow, Razorpay integration, Order confirmation page.

**Phase 6 — Buyer Account**
Order history, order detail, profile management, session management (view/revoke sessions).

**Phase 7 — Seller Dashboard**
Seller onboarding form, profile management, product CRUD with Cloudinary image upload, seller orders view (once backend endpoint exists).

**Phase 8 — Admin Panel**
Category CRUD, platform order management with status updates.

**Phase 9 — Polish & QA**
Responsive pass, loading/error states audit, accessibility pass, cross-browser check, production build & deploy config.

## 9. Open Decisions (confirm before Phase 3)
- Token storage: httpOnly cookie (set by backend) vs. client-held access token — determines whether `cookie-parser`'s presence in the backend means cookies are actually used for auth.
- Whether Next.js is preferred over Vite for SEO on product pages (current recommendation: Vite, since this reads as an SPA-style dashboard-heavy app rather than an SEO-first storefront).
