# Sellora Architecture Reference

This document captures the backend conventions and implementation patterns currently used in Sellora. Use it as the reference for future code generation unless the user asks for a different approach.

## Stack

- Backend: Express 5
- Database: MySQL using `mysql2/promise`
- Language: ES Modules
- Common middleware: `helmet`, `cors`, `morgan`, `cookie-parser`
- Auth and utilities: `bcrypt`, `jsonwebtoken`, `nodemailer`

## Startup Flow

- `src/server.js` loads environment variables.
- The MySQL connection is tested before the server starts.
- `src/app.js` creates the Express app, registers middleware, mounts routes, and then attaches the global error handler.

## Route Mounting

- `/api` -> health
- `/api/auth` -> authentication
- `/api/seller` -> seller profile
- `/api/products` -> products
- `/api/categories` -> categories
- `/api/cart` -> cart
- `/api/orders` -> orders
- `/api/admin` -> admin actions

## Layering Rules

- Routes define the HTTP surface.
- Controllers stay thin and only adapt request/response data.
- Services contain business logic, validation-by-rule, and authorization checks.
- Models contain raw SQL only.
- Shared helpers live in `src/utils`.
- Expected failures use `ApiError`.
- Success responses use `ApiResponse`.
- Async controllers are wrapped in `asyncHandler`.

## Authentication and Authorization

- JWT is sent in the `Authorization: Bearer <token>` header.
- `verifyToken` validates the JWT and stores the decoded payload on `req.user`.
- `authorize(...roles)` checks the caller role against the allowed list.
- JWT payload includes `id`, `email`, and `role`.

## Auth Flows

- Register: checks for duplicate email, hashes password, creates the user.
- Login: validates credentials and returns a JWT plus user profile data.
- Forgot password: generates OTP, stores it in `otp_verifications` with `PASSWORD_RESET`, and emails it to the user.
- Reset password: validates OTP, marks it verified, hashes the new password, and updates the user.
- Change password: validates the old password, prevents password reuse, and updates the user.

## Domain Modules

- Users are the base identity record.
- Seller profiles are tied to users by `user_id`.
- Categories are managed by admins.
- Products belong to sellers and categories, and are soft-deleted with `is_active`.
- Cart stores user-product quantities.
- Orders are created from cart checkout and expanded into order items.
- Admin can list orders and transition order status.

## Database Tables

- `users`
- `otp_verifications`
- `seller_profiles`
- `categories`
- `products`
- `cart`
- `orders`
- `order_items`

## Transactions

- Checkout uses a dedicated MySQL connection transaction.
- The flow is: read cart items -> validate stock and product state -> create order -> create order items -> reduce stock -> clear cart -> commit.
- Errors trigger rollback.

## API Response Pattern

- Success responses are serialized through `ApiResponse`.
- Error responses are centralized in the global error middleware.
- Error payload shape: `{ success: false, statusCode, message }`

## Coding Conventions

- Use camelCase for functions and variables.
- Prefer default exports for single-purpose modules.
- Use named exports for controller actions and many service/model helpers.
- Keep business logic in services.
- Reuse existing utilities instead of creating duplicates.
- Prefer explicit, minimal SQL queries over abstractions.

## Future Development Rule

When generating new code for this project, follow the existing architecture, folder structure, naming conventions, response format, and service/model separation unless the user explicitly asks to change them.
