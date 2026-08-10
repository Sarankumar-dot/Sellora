# Sellora — Implementation Plan

**Status:** Documentation only. No frontend or backend code was modified, no components/routes/services were created, no packages were installed, no commands were run against the repository while producing this document.
**Purpose:** The final, phase-by-phase blueprint for completing the existing Sellora frontend. This plan governs *how* implementation proceeds later — it does not itself implement anything.
**Sources used:** `SELLORA_FRONTEND_REQUIREMENTS.md` (FPRD), `APP_FLOW.md`, `UI_UX_DESIGN_BRIEF.md`, and the backend architectural analysis those documents were built from.

---

## 0. Governing Rules (apply to every phase below, without exception)

1. **Incremental, not wholesale.** The existing frontend already contains significant work. No phase replaces `AuthContext`, the Axios interceptor, the router, the design system, the navbar architecture, existing reusable components, the animation system, or the layouts wholesale. Extend, don't rewrite.
2. **Read before writing.** Every file gets read in full before it is touched. No blind overwrites.
3. **Backend source is the only authority for API existence.** Before any endpoint is wired up: find the route → controller → service → validation schema → request body → response shape → auth middleware → role restriction. If any step can't be confirmed against actual source, integration stops and the gap is recorded as **BACKEND API NOT CONFIRMED** — never guessed.
4. **One phase at a time.** Each phase: inspect → identify what's missing → change the minimum files → lint → build → manually verify the affected flow → inspect `git diff` → checkpoint. No phase starts before the previous one is verified.
5. **Git safety.** Before implementation begins: `git status`, `git branch`, `git log --oneline -10`. Never `git reset --hard`, `git clean -fd`, `git checkout .`, or `git restore .` unless the user explicitly asks for it in that moment. Uncommitted user changes are never discarded.
6. **No automatic commits.** Each phase produces a *recommended* commit message; the assistant reports it and waits rather than committing on its own initiative, unless the user has explicitly asked for auto-commit in this project.
7. **Never fake what the backend doesn't support.** Every "not implemented" item from the FPRD/APP_FLOW/Design Brief stays not-implemented in the UI — shown as unavailable where relevant, never simulated.

---

## 1. Current-State Baseline (to be captured in Phase 0, not assumed here)

This plan does not presuppose the current state of the repository — that is the explicit output of Phase 0. What follows is the audit *method*, not the result:

- Enumerate `client/src/{api,components,context,hooks,layouts,pages,routes,services,utils}` and compare against the structure documented in the FPRD.
- For each backend-confirmed endpoint (FPRD §2), check whether a corresponding service function already exists, and whether it's actually called from a page/component.
- For each route in the FPRD's routing map, check whether it's registered in the router and whether it renders a real page or a stub.
- Record `npm run lint` and `npm run build` output verbatim as the baseline — later phases are judged against this, not against a hypothetical clean state.
- Classify every discovered piece of functionality as: **working**, **partially working**, **broken**, **missing**, **UI-only (no backend dependency)**, **backend-supported but not wired up**, or **backend-unsupported (do not build)**.

**Phase 0 acceptance criteria**
- [ ] Existing application state documented (the classification above, per route/page)
- [ ] No user changes lost (working tree diffed and preserved, nothing discarded)
- [ ] Backend APIs re-verified against source, not just against the FPRD
- [ ] Existing frontend routes documented against the FPRD's routing map, discrepancies flagged
- [ ] Baseline `npm run build` output recorded
- [ ] Baseline `npm run lint` output recorded

---

## 2. Architecture Strategy

Preserve the existing layered structure end to end:

```
Router → Layouts (Public/Guest/Customer/Seller/Admin) → Pages → Shared components
                                     ↑
                              AuthContext + Axios client (single instance, single interceptor)
                                     ↑
                              services/ (one file per domain, matching FPRD §2's grouping)
```

No phase introduces a second Axios client, a second auth context, a second router, a second component library, or a parallel design-token set. Where the existing implementation is thinner than the FPRD requires (e.g., a service function that doesn't exist yet), it is *added* in the matching file/location, not restructured around.

---

## 3. Phase-by-Phase Implementation Order

Each phase below lists: scope, backend APIs touched, acceptance criteria, and the FPRD/APP_FLOW/Design-Brief sections it's grounded in. Phases are ordered so that nothing depends on a phase that comes after it.

### Phase 0 — Baseline Audit
Scope: inspect only, per §1 above. No code changes.
**Acceptance:** see §1.

### Phase 1 — Frontend Foundation
Scope: verify Vite/React/Tailwind boot correctly; verify router → layouts → pages → shared-components chain renders; confirm `PublicLayout`, `GuestLayout`, `CustomerLayout`, `SellerLayout`, `AdminLayout` are correctly separated per the FPRD's folder structure (FPRD §4).
**Acceptance:**
- [ ] App starts
- [ ] Router works
- [ ] All five layouts render for a representative route each
- [ ] Existing design tokens (DESIGN.md / UI_UX_DESIGN_BRIEF §2–4) untouched
- [ ] No duplicated components introduced
- [ ] Lint passes
- [ ] Build passes

### Phase 2 — Authentication Foundation
Scope: `AuthContext`, Axios client + interceptor, `ProtectedRoute`/`GuestRoute`, token storage, refresh flow, logout flow (APP_FLOW §2, §6–10).
APIs: `POST /auth/register`, `POST /auth/login`, `POST /auth/refresh-token`, `POST /auth/logout`, `GET /auth/me`, `GET /auth/sessions`, `POST /auth/logout-all`, `POST /auth/forgot-password`, `POST /auth/reset-password`, `PUT /auth/change-password`.
Rules carried forward as hard constraints: refresh token is never read from JS; a 401 on a protected request triggers exactly one refresh attempt and one retry, never a loop; public auth endpoints (`login`, `register`, `forgot-password`, `reset-password`) never trigger the protected-refresh interceptor path.
**Acceptance:** interceptor tested against a deliberately expired token; confirmed no infinite loop; confirmed public endpoints unaffected by the interceptor.

### Phase 3 — Login / Register
Scope: `/login`, `/register` (FPRD §8, APP_FLOW §5–6, Design Brief §15–16).
APIs: `POST /auth/register`, `POST /auth/login`.
**Acceptance:**
- [ ] Register works, including 8–30 char / upper / lower / digit / special password validation and 10-digit mobile validation
- [ ] Register does not auto-authenticate (backend-confirmed behavior)
- [ ] Login works, sets access token + auth state, redirects by role
- [ ] Loading and error states work per Design Brief §19–20
- [ ] No auth flash on subsequent navigation
- [ ] Existing navigation remains intact

### Phase 4 — Password Recovery
Scope: `/forgot-password`, `/reset-password` (APP_FLOW §11–12, Design Brief §17–18).
APIs: `POST /auth/forgot-password`, `POST /auth/reset-password`.
**Acceptance:** OTP six-box UI (numeric-only, auto-advance, backspace-back, 6-digit paste, accessible labels, invalid/loading states) works; password reset revokes sessions server-side and the UI reflects that by returning to `/login`.

### Phase 5 — Global Navigation
Scope: navbar (desktop + mobile drawer), role-aware item sets, active-route indication (APP_FLOW §3, §36; Design Brief §6–7).
**Acceptance:** all four nav states (logged out, customer, seller, admin) match the FPRD's table exactly; navigating Dashboard → Home → Products → Account → Dashboard never loses auth state or forces re-login; no duplicate nav systems; desktop navbar uses full container width (Design Brief §5–6).

### Phase 6 — Home Page
Scope: `/` (APP_FLOW §14, Design Brief §8–10).
**Acceptance:** hero explains what/why/what-you-can-do without placeholder copy; no category-discovery section (backend has no public category endpoint); no fabricated featured-products section; trust section only lists real capabilities.

### Phase 7 — Public Product Discovery
Scope: `/products`, `/products/:id` (APP_FLOW §15–17, Design Brief §11–13).
APIs: `GET /products` (search + pagination only — category/sort are backend-broken per FPRD §2.5, do not wire them as functional), `GET /products/:id`.
**Acceptance:** search (min 2 chars, debounced), pagination, loading/empty/error states, image fallback, out-of-stock state all work; no reviews/ratings/wishlist/related-products UI.

### Phase 8 — Cart
Scope: `/cart` (APP_FLOW §18–19, Design Brief §22).
APIs: `POST /cart`, `GET /cart`, `PUT /cart/:id`, `DELETE /cart/:id`.
**Acceptance:** add/update/remove work; **`GET /cart` returning 404 renders the empty-cart state, not an error** (this is the single most important contract to get right in this phase — test it explicitly, don't infer it); navbar cart indicator updates; duplicate-submission prevented via disabled-during-request buttons.

### Phase 9 — Checkout
Scope: `/checkout` (APP_FLOW §20–21, Design Brief §23–24).
APIs: `POST /orders` (no request body).
**Acceptance:** review → Place Order → confirmation with `orderId`, `totalAmount`, `status: PLACED`; no payment/coupon/address UI anywhere on this page; duplicate submission prevented.

### Phase 10 — Customer Account
Scope: `/account`, `/account/orders`, `/account/security` (APP_FLOW §22–24, Design Brief §25–29).
APIs: `GET /auth/me`, `PUT /auth/change-password`, `GET /auth/sessions`, `POST /auth/logout-all`, `GET /orders`, `GET /orders/:id`.
**Acceptance:** profile (read-only, since no profile-update endpoint exists), orders list (**`GET /orders` 404 → "No Orders Yet"**), order detail (no false "as purchased" name claim), security section with confirmation-gated logout-all. Wishlist/Addresses/Settings, if shown at all, marked "Not available yet," never backed by fake local persistence.

### Phase 11 — Seller Onboarding
Scope: `/seller/onboarding` (APP_FLOW §25, Design Brief §30).
APIs: `POST /seller/profile`.
**Acceptance:** form submits → **mandatory session/role refresh before any seller-protected call** (this is a backend-confirmed requirement, not optional polish — the token issued at login still says `customer` after this call succeeds) → redirect to `/seller`. Test explicitly that a seller-protected call made with the pre-onboarding token fails, and that the flow recovers via the refresh step rather than surfacing that failure to the user.

### Phase 12 — Seller Profile
Scope: `/seller/profile` (Design Brief §not explicitly numbered but covered under seller sections).
APIs: `GET /seller/profile`, `PUT /seller/profile`.
**Acceptance:** read + full-body update work; no fields implied editable beyond what the backend accepts.

### Phase 13 — Seller Product Management
Scope: `/seller`, `/seller/products`, `/seller/products/create`, `/seller/products/:id/edit` (APP_FLOW §26–28, Design Brief §31–32).
APIs: `POST /products`, `GET /products` (own), `GET /products/:id`, `PUT /products/:id`, `DELETE /products/:id`.
**Acceptance:** create/edit/deactivate work; deactivate requires confirmation; ownership enforced server-side and respected client-side (no edit controls shown for products the seller doesn't own); **image URL is not actually persisted on create (confirmed backend bug)** — the create-success UI must not falsely confirm the image was saved; direct the seller to the edit screen or chain an update call, per Design Brief §32.

### Phase 14 — Admin Dashboard
Scope: `/admin`, `/admin/orders`, `/admin/categories` (APP_FLOW §29–31, Design Brief §33–35).
APIs: `GET /admin/orders`, `PUT /admin/orders/:id/status`, `GET /categories`, `GET /categories/:id`, `POST /categories`, `PUT /categories/:id`.
**Acceptance:** admin-only access enforced; orders list + status update work; categories list/create/edit work; **no delete action** anywhere on categories (no such endpoint exists); no fake analytics/revenue charts anywhere on this dashboard.

### Phase 15 — Order Status Management
Scope: the status-change control introduced in Phase 14, isolated here because it has a specific, easy-to-get-wrong contract.
**Rule:** valid transitions are exactly `PLACED → SHIPPED`, `PLACED → CANCELLED`, `SHIPPED → DELIVERED`. `PROCESSING` passes backend validation but has no real transition — **it must never appear as a selectable option**, regardless of what the validation schema would technically accept. The control derives its options from the row's current status, not from the full enum.

### Phase 16 — Category Management
Scope: re-confirmation step, not new UI — before wiring `GET /categories` anywhere, re-verify against actual backend source (not just this plan or the FPRD) that it remains admin-only. **Do not build public category browsing** unless that re-check shows the route has actually been changed. If documentation and the live backend disagree at implementation time, stop and document the discrepancy rather than resolving it by assumption.

### Phase 17 — Error Handling
Scope: cross-cutting, applied to every phase above as those phases are built, then re-verified as a pass here.
Rules: 401 on a protected request → refresh once (Phase 2's interceptor); 403 → never refresh, show access-denied; 404 → interpreted contextually (cart/orders/categories = empty state; product/order-by-id = genuinely not found); 429 → rate-limit message; 500 → generic friendly message, **raw backend `message` text is never shown to the user** (backend-confirmed to expose raw internal error text on 500s — the frontend must intercept, not relay). Never display SQL errors, stack traces, API keys, or credentials under any circumstance.

### Phase 18 — Loading States
Scope: cross-cutting audit pass. Skeletons for products/cart/orders/dashboard-tables/profile; spinners for buttons/small actions; a neutral loading shell during session restoration so an authenticated user never sees a flash of the logged-out navbar (APP_FLOW §2, §34).

### Phase 19 — Empty States
Scope: cross-cutting audit pass against the table in APP_FLOW §35 / Design Brief §37 — empty cart, no orders, no products, no search results, no seller products, no admin categories, each with icon/visual + message + one next action.

### Phase 20 — Responsive Polish
Scope: verify every page from Phases 6–14 at 320/375/390/414/768/1024/1280/1440px (Design Brief §40). Specifically check for the "desktop narrow-column problem" flagged in Design Brief §5 — content must use the available width at 1280/1440px, not just add side padding to a phone-width column.

### Phase 21 — Accessibility
Scope: cross-cutting audit pass — keyboard navigation, focus visibility, ARIA labels on icon-only controls, semantic HTML, contrast, OTP accessibility, modal focus trapping, drawer keyboard operability + Escape-to-close, `prefers-reduced-motion` respected everywhere motion appears (Design Brief §41).

### Phase 22 — Performance
Scope: only where a real problem is found — no premature optimization. Check for: duplicate/unnecessary API calls (e.g., re-fetching `/auth/me` on every route change instead of once per session), unnecessary re-renders, unoptimized large images, repeated component instantiation, stale state after mutations (e.g., cart count not updating after checkout). Do not introduce a new state-management library unless the existing architecture demonstrably can't handle a specific, identified problem.

### Phase 23 — Full Integration Test
Scope: run the five journeys from APP_FLOW §37 end to end against the real backend, in order:
1. Register → Login → Home → Products → Product Details → Add Cart → Cart → Checkout → Order → Account → Orders
2. Forgot Password → OTP → Reset Password → Login
3. Customer → Seller Onboarding → Role Refresh → Seller Dashboard → Create Product → Edit Product → Deactivate Product
4. Admin → Orders → Status Update → Categories → Create → Edit
5. Authenticated User → Dashboard → Home → Products → Account → Dashboard (auth must remain intact throughout)

### Phase 24 — Final Quality Audit
Scope: the checklist in §11 below, run in full.

### Phase 25 — Final Verification
Scope: `npm run lint`, `npm run build`, then `git status`, `git diff`, `git diff --stat`. Check specifically for accidental files, temp files, debug logging left in, hardcoded secrets, unintended `.env` changes, and any modification outside the phase's declared scope. **Never commit** `.env`, API keys, passwords, tokens, or credentials.

---

## 4. API Dependency Summary

All endpoints used across the plan, grouped by phase, exactly as confirmed in the FPRD — no endpoint appears here that wasn't verified against actual backend source in that document:

| Domain | Endpoints | Phase(s) |
|---|---|---|
| Auth | register, login, refresh-token, logout, me, sessions, logout-all, forgot-password, reset-password, change-password | 2, 3, 4, 10 |
| Seller | POST/GET/PUT `/seller/profile` | 11, 12 |
| Categories | POST/GET/GET:id/PUT `/categories` (admin-only — re-verify before Phase 16) | 14, 16 |
| Products | POST/GET/GET:id/PUT/DELETE `/products` | 7, 13 |
| Cart | POST/GET/PUT:id/DELETE:id `/cart` | 8 |
| Orders | POST/GET/GET:id `/orders` | 9, 10 |
| Admin Orders | GET `/admin/orders`, PUT `/admin/orders/:id/status` | 14, 15 |

No other endpoints are referenced anywhere in this plan. Anything not in this table is **BACKEND API NOT CONFIRMED** and out of scope until it is.

---

## 5. Files Likely to Change (by phase, kept minimal per §0 rule 1)

This is a *likely-touch* map, not a rewrite target list — actual files depend on Phase 0's findings:

| Phase | Likely files |
|---|---|
| 2 | `api/axios.js`, `context/AuthContext.jsx`, `routes/router.jsx` (ProtectedRoute/GuestRoute wrappers), `services/auth.service.js` |
| 3 | `pages/auth/LoginPage`, `pages/auth/RegisterPage`, `services/auth.service.js` |
| 4 | `pages/auth/ForgotPasswordPage`, `pages/auth/ResetPasswordPage`, an OTP input component |
| 5 | `components/layout/Navbar`, mobile drawer component |
| 6 | `pages/public/HomePage` |
| 7 | `pages/public/ProductsPage`, `pages/public/ProductDetailsPage`, `services/product.service.js`, `components/product/*` |
| 8 | `pages/customer/CartPage`, `services/cart.service.js`, `components/cart/*`, cart-count consumer in Navbar |
| 9 | `pages/customer/CheckoutPage`, `services/order.service.js` |
| 10 | `pages/customer/{Profile,Orders,Security}Page`, `services/{auth,order}.service.js` |
| 11 | `pages/seller/OnboardingPage`, `services/seller.service.js`, `context/AuthContext.jsx` (role refresh) |
| 12 | `pages/seller/ProfilePage`, `services/seller.service.js` |
| 13 | `pages/seller/{ProductList,ProductCreate,ProductEdit}Page`, `services/product.service.js` |
| 14–16 | `pages/admin/{Orders,Categories}Page`, `services/admin.service.js`, `services/category.service.js` |
| 17–22 | Cross-cutting: shared `Alert`/`LoadingSpinner`/`Skeleton`/empty-state components, error-handling logic in `api/axios.js` |

---

## 6. Testing Strategy

- **Per-phase manual verification** against that phase's acceptance criteria, using the real backend (no mocking of confirmed endpoints — mocking would hide exactly the discrepancies this whole document chain exists to surface).
- **Contract checks** for the known-tricky responses: cart-empty-is-404, orders-empty-is-404, categories-empty-is-404, login 429, refresh-token reuse rejection, seller-role-not-in-token-immediately.
- **Regression check** after each phase: re-run the previous phases' acceptance criteria for anything touching shared files (Navbar, AuthContext, axios client) — those are the highest blast-radius files in the app.
- **Full integration test** (Phase 23) as the final functional gate before Phase 24/25.
- Automated test tooling is not assumed to exist; if it does (discovered in Phase 0), reuse it — do not introduce a new test framework as part of this plan.

---

## 7. Git Checkpoint Strategy

One checkpoint per completed, verified phase-group (not literally every phase — group related phases so checkpoints stay meaningful):

| Checkpoint | Covers | Suggested message |
|---|---|---|
| 1 | Phase 0–1 | `chore(frontend): baseline audit and foundation verification` |
| 2 | Phase 2–4 | `feat(frontend): complete authentication flow` |
| 3 | Phase 5–7 | `feat(frontend): complete public storefront` |
| 4 | Phase 8–9 | `feat(frontend): complete cart and checkout` |
| 5 | Phase 10 | `feat(frontend): complete customer account` |
| 6 | Phase 11–13 | `feat(frontend): complete seller workflow` |
| 7 | Phase 14–16 | `feat(frontend): complete admin workflow` |
| 8 | Phase 17–22 | `fix(frontend): polish integration, error/loading/empty states, responsive and a11y` |
| 9 | Phase 23–25 | `test(frontend): full integration verification` |

Each checkpoint: lint → build → manual verification → `git diff` inspection → **report the recommended message and wait** rather than committing automatically, unless the user has asked for auto-commit in the current session.

---

## 8. Rollback Strategy

- Because work proceeds in small, checkpointed increments (§7), rollback is always "return to the last checkpoint commit," never a full-project revert.
- If a phase's changes cause a regression discovered in a later phase, first attempt a targeted fix within the current branch; only fall back to `git revert` of the specific offending commit if the fix isn't quickly identifiable — never `git reset --hard` past commits containing verified, working phases.
- Before any revert, re-confirm `git status` is clean of unrelated uncommitted work, so a revert doesn't take unrelated changes with it.
- If a phase turns out to depend on a backend capability that doesn't actually exist (a **BACKEND API NOT CONFIRMED** finding), the correct rollback is to leave that specific feature unbuilt/marked-unavailable and continue with the rest of the phase — not to revert the whole phase.

---

## 9. Risk Register

| # | Risk | Cause | Prevention | Detection | Recovery |
|---|---|---|---|---|---|
| 1 | Authentication refresh loop | Interceptor retries refresh on every 401 without a "already attempted" guard | Single-attempt guard flag per request, verified in Phase 2 before any other phase proceeds | Network tab shows repeated `/refresh-token` calls; app hangs or spams requests | Add/fix the guard flag; add a regression test case in Phase 2's acceptance criteria |
| 2 | Stale role after seller onboarding | Access token still says `customer` right after `POST /seller/profile` succeeds | Mandatory session/role refresh step built into the onboarding flow itself (Phase 11) | Seller-protected call immediately after onboarding returns 403 | Trigger refresh/re-login before retrying the seller call; never silently swallow the 403 |
| 3 | Public vs. protected routes confused | Assuming `/categories` is public because early planning docs said so | Re-verify against actual backend source before wiring any category read (Phase 16) | 401/403 on a call the UI assumed was public | Gate the call behind admin auth or remove it from customer-facing surfaces |
| 4 | Navbar auth flash | Navbar renders before `AuthContext` finishes restoring session | Loading state gates navbar rendering (Phase 1–2) | Logged-out nav briefly visible to an authenticated user on refresh | Render a neutral shell until auth state leaves "loading" |
| 5 | Cart 404 misread as failure | Treating any non-2xx as an error | Explicit 404-is-empty handling wired in Phase 8, tested directly against a real empty cart | Error toast/page shown for a legitimately empty cart | Add the contextual 404 handling per APP_FLOW §33's table |
| 6 | Orders 404 misread as failure | Same pattern as #5 | Same as #5, applied in Phase 10 | "Something went wrong" shown instead of "No Orders Yet" | Same as #5 |
| 7 | Backend image-persistence bug surfaces as a frontend bug report | Create-product image not actually saved server-side | Document and design around it explicitly in Phase 13 (don't confirm image save on create) | Seller reports "my product image disappeared" | Confirm against backend source it's the known create-omits-image_url bug, not a new regression; direct seller to re-save via edit |
| 8 | Unsupported product filters treated as functional | Building category-filter/sort UI against the Joi-documented values instead of the actual service implementation | Phase 7 explicitly limits to search + pagination only | QA notices category filter or price sort does nothing | Remove or clearly label the non-functional control; do not attempt a client-side substitute without flagging it |
| 9 | Unsupported wishlist/address/payment features implied as working | Building UI for routes mentioned in early planning without checking backend support | FPRD §7 / Design Brief §50 checked before building any account sub-page | User tries to save a wishlist item and nothing persists | Mark the feature "Not available yet" instead of building silent-failure UI |
| 10 | Invalid admin order-status transition offered | Building the status control off the full Joi enum instead of the service's real transition table | Phase 15 derives options from current status against the confirmed transition table | Admin selects `PROCESSING` or an invalid transition and gets a 400 | Restrict the control's option set; add the specific transition table as a lookup, not a hardcoded per-row guess |
| 11 | Accidental frontend-wide rewrite | Treating "polish" as license to restructure | Governing rule §0.1 — no wholesale replacement of core architecture without explicit user approval | Huge, unrelated diff in `git diff --stat` | Revert to last checkpoint; re-scope the change to the minimum needed |
| 12 | Environment variable mistakes | Editing `.env` or committing secrets while wiring API base URLs | `.env` never modified as part of a UI phase; `.env` never committed (Phase 25 check) | `git diff` shows `.env` changes or a secret-looking string | Remove from the commit/diff immediately; rotate any credential that was exposed |
| 13 | API base URL mismatch | Local dev pointed at the wrong backend instance | Confirm `baseURL` against the existing Axios client config in Phase 1/2, don't hardcode a new one | Requests succeed against the wrong environment, or fail with CORS errors | Point back to the existing configured base URL; do not introduce a second config source |
| 14 | Local vs. production frontend confusion | Testing acceptance criteria against the wrong build | Explicitly state which environment each phase's manual verification ran against | Behavior differs between what was verified and what ships | Re-verify against the correct target before checkpointing |
| 15 | Duplicate Vite dev servers / ports | Multiple terminal sessions each starting `npm run dev` | Check for a running dev server before starting a new one in each session | Port-in-use errors, or two different app instances open simultaneously | Stop the stray process; confirm only one dev server is running before continuing |
| 16 | Uncommitted user changes overwritten | A phase starts without checking `git status` first | Governing rule §0.5 — `git status` checked before every phase begins | Work the user didn't ask to be touched shows up modified/missing | Restore from git history / reflog if not yet committed elsewhere; never proceed without confirming the working tree was clean or the changes were the user's own for this phase |

---

## 10. Change Control Rule (restated for implementation-time reference)

- Before every code modification: read the file in full.
- Before every architectural modification: state why it's necessary, in terms of a specific missing/broken piece of confirmed functionality — not preference.
- Before modifying an existing *working* feature: verify it is actually broken (against a real test, not assumption) before touching it.

---

## 11. Final QA Checklist

**Frontend**
- [ ] No broken routes
- [ ] No dead buttons (every control either does something real or is visibly disabled/marked unavailable)
- [ ] No fake API calls
- [ ] No invented endpoints
- [ ] No duplicate components
- [ ] No unnecessary new dependencies
- [ ] No console errors
- [ ] No avoidable console warnings
- [ ] No authentication loops
- [ ] No stale auth state after role changes (seller onboarding in particular)

**Design**
- [ ] `UI_UX_DESIGN_BRIEF.md` followed
- [ ] Existing `DESIGN.md` tokens preserved (no new colors/fonts introduced)
- [ ] 8px spacing system preserved
- [ ] JetBrains Mono preserved as the only typeface
- [ ] Navbar uses available desktop width
- [ ] Hero uses available desktop width
- [ ] Product grid responsive per the documented column table
- [ ] Customer/Seller/Admin dashboards visually differentiated
- [ ] Animations restrained (opacity/transform only, documented durations, reduced-motion respected)

**Backend**
- [ ] Only backend-confirmed APIs used anywhere in the app
- [ ] Auth requirements (Bearer/cookie) respected per endpoint
- [ ] Role requirements respected per endpoint
- [ ] Known backend limitations respected (category filter/sort, image-on-create, PROCESSING dead state, no category delete, no public category read)
- [ ] No fake persistence for wishlist/addresses/settings/payment

---

## 12. Final Implementation Principle

Build Sellora like a production application: small phase → test → verify → checkpoint → next phase, never the whole thing in one pass. Never rewrite working code to satisfy a stylistic preference. Never guess backend behavior — confirm it against source, every time. Never fake an unsupported feature. Never touch a file outside the current phase's declared scope. The existing frontend is valuable, verified-working effort; the job is to finish it safely, not to start over.

---

*End of document.*

---

## Report

1. `06_IMPLEMENTATION_PLAN.md` created.
2. Existing architecture reviewed at the planning level (structure and conventions from the FPRD/APP_FLOW/Design Brief) — actual current-repo state is deferred to Phase 0, which is the plan's first real inspection step, not yet run.
3. Implementation phases defined: 26 phases (0–25), each with scope, APIs, and acceptance criteria.
4. API dependencies mapped in §4, restricted to only what the FPRD verified against backend source.
5. Risks documented in §9 — 16 entries, each with Risk/Cause/Prevention/Detection/Recovery.
6. Verification strategy documented in §6 (testing) and §11 (final QA checklist).
7. Rollback strategy documented in §8.

No implementation has begun. Waiting for explicit approval before starting Phase 0.
