import swaggerJsdoc from 'swagger-jsdoc';

const jsonContent = (schema) => ({
  'application/json': {
    schema,
  },
});

const successResponse = (description, dataSchema) => ({
  description,
  content: jsonContent({
    allOf: [
      { $ref: '#/components/schemas/ApiResponse' },
      {
        type: 'object',
        properties: {
          data: dataSchema,
        },
      },
    ],
  }),
});

const errorResponse = (description) => ({
  description,
  content: jsonContent({ $ref: '#/components/schemas/ErrorResponse' }),
});

const validationErrorResponse = errorResponse('Request validation failed');
const unauthorizedResponse = errorResponse('Authentication is missing, invalid, or expired');
const forbiddenResponse = errorResponse('Authenticated user does not have the required role');
const notFoundResponse = errorResponse('Requested resource was not found');

const idParameter = {
  name: 'id',
  in: 'path',
  required: true,
  description: 'Positive numeric resource identifier',
  schema: {
    type: 'integer',
    minimum: 1,
  },
};

const bearerSecurity = [{ BearerAuth: [] }];

const swaggerDefinition = {
  openapi: '3.0.3',
  info: {
    title: 'Sellora API',
    version: '1.0.0',
    description: 'REST API for Sellora E-Commerce Platform',
  },
  servers: [
    {
      url: `${process.env.SERVER_URL || 'http://localhost:5000'}/api`,
    },
  ],
  tags: [
    { name: 'Health', description: 'Service health status' },
    {
      name: 'Authentication',
      description: 'Registration, login, sessions, and password management',
    },
    { name: 'Seller', description: 'Seller profile and order management' },
    { name: 'Categories', description: 'Category browsing and admin management' },
    { name: 'Products', description: 'Product catalog management' },
    { name: 'Cart', description: 'Authenticated shopping cart operations' },
    { name: 'Orders', description: 'Authenticated checkout and order history' },
    { name: 'Payments', description: 'Razorpay payment verification' },
    { name: 'Admin', description: 'Admin order management' },
  ],
  components: {
    securitySchemes: {
      BearerAuth: {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        description: 'Paste the access token returned by login or refresh-token.',
      },
    },
    schemas: {
      ApiResponse: {
        type: 'object',
        required: ['success', 'statusCode', 'message', 'data'],
        properties: {
          success: { type: 'boolean', example: true },
          statusCode: { type: 'integer', example: 200 },
          message: { type: 'string', example: 'Success' },
          data: { nullable: true },
        },
      },
      ErrorResponse: {
        type: 'object',
        required: ['success', 'statusCode', 'message', 'errors'],
        properties: {
          success: { type: 'boolean', example: false },
          statusCode: { type: 'integer', example: 400 },
          message: { type: 'string', example: 'Validation Error' },
          errors: {
            type: 'array',
            items: { $ref: '#/components/schemas/ValidationError' },
          },
        },
      },
      ValidationError: {
        type: 'object',
        properties: {
          field: { type: 'string', example: 'email' },
          message: { type: 'string', example: 'Email must be a valid email address' },
        },
      },
      User: {
        type: 'object',
        properties: {
          id: { type: 'integer', example: 1 },
          name: { type: 'string', example: 'Jane Doe' },
          email: { type: 'string', format: 'email', example: 'jane@example.com' },
          role: { type: 'string', enum: ['customer', 'seller', 'admin'], example: 'customer' },
        },
      },
      RegisterRequest: {
        type: 'object',
        required: ['name', 'email', 'password', 'mobileNumber'],
        properties: {
          name: { type: 'string', minLength: 3, maxLength: 100, example: 'Jane Doe' },
          email: { type: 'string', format: 'email', example: 'jane@example.com' },
          password: { type: 'string', format: 'password', minLength: 8, example: 'Passw0rd!' },
          mobileNumber: { type: 'string', pattern: '^\\d{10}$', example: '9876543210' },
        },
      },
      LoginRequest: {
        type: 'object',
        required: ['email', 'password'],
        properties: {
          email: { type: 'string', format: 'email', example: 'jane@example.com' },
          password: { type: 'string', format: 'password', example: 'Passw0rd!' },
        },
      },
      LoginData: {
        type: 'object',
        properties: {
          token: { type: 'string', description: 'JWT access token' },
          user: { $ref: '#/components/schemas/User' },
        },
      },
      TokenData: {
        type: 'object',
        properties: {
          token: { type: 'string', description: 'JWT access token' },
        },
      },
      Session: {
        type: 'object',
        properties: {
          id: { type: 'integer', example: 12 },
          deviceInfo: { type: 'string', nullable: true },
          ipAddress: { type: 'string', nullable: true, example: '127.0.0.1' },
          createdAt: { type: 'string', format: 'date-time' },
          lastUsedAt: { type: 'string', format: 'date-time' },
          expiresAt: { type: 'string', format: 'date-time' },
        },
      },
      ForgotPasswordRequest: {
        type: 'object',
        required: ['email'],
        properties: { email: { type: 'string', format: 'email' } },
      },
      ResetPasswordRequest: {
        type: 'object',
        required: ['email', 'otp', 'newPassword'],
        properties: {
          email: { type: 'string', format: 'email' },
          otp: { type: 'string', pattern: '^\\d{6}$', example: '123456' },
          newPassword: {
            type: 'string',
            format: 'password',
            minLength: 8,
            example: 'NewPassw0rd!',
          },
        },
      },
      ChangePasswordRequest: {
        type: 'object',
        required: ['oldPassword', 'newPassword'],
        properties: {
          oldPassword: { type: 'string', format: 'password' },
          newPassword: { type: 'string', format: 'password', minLength: 8 },
        },
      },
      SellerProfileRequest: {
        type: 'object',
        required: ['storeName', 'gstNumber', 'panNumber', 'address'],
        properties: {
          storeName: { type: 'string', example: 'Jane Store' },
          gstNumber: { type: 'string', example: '22AAAAA0000A1Z5' },
          panNumber: { type: 'string', example: 'ABCDE1234F' },
          address: { type: 'string', minLength: 10, example: '123 Market Street, Chennai' },
          description: { type: 'string', nullable: true },
          logo: { type: 'string', format: 'uri', nullable: true },
        },
      },
      SellerProfile: {
        allOf: [
          { $ref: '#/components/schemas/SellerProfileRequest' },
          { type: 'object', properties: { id: { type: 'integer' }, user_id: { type: 'integer' } } },
        ],
      },
      Category: {
        type: 'object',
        required: ['name'],
        properties: {
          id: { type: 'integer', example: 1 },
          name: { type: 'string', example: 'Electronics' },
          description: {
            type: 'string',
            nullable: true,
            example: 'Electronic devices and accessories',
          },
        },
      },
      CategoryRequest: {
        type: 'object',
        required: ['name'],
        properties: {
          name: { type: 'string', minLength: 3, maxLength: 50, example: 'Electronics' },
          description: { type: 'string', maxLength: 500, nullable: true },
        },
      },
      ProductImage: {
        type: 'object',
        properties: {
          url: { type: 'string', format: 'uri', example: 'https://example.com/image.jpg' },
          displayOrder: { type: 'integer', minimum: 0, example: 0 },
        },
      },
      ProductRequest: {
        type: 'object',
        required: ['name', 'description', 'price', 'stock', 'categoryId'],
        properties: {
          name: { type: 'string', minLength: 3, maxLength: 100, example: 'Wireless Mouse' },
          description: { type: 'string', minLength: 10, maxLength: 1000 },
          price: { type: 'number', format: 'float', minimum: 0.01, example: 799.99 },
          stock: { type: 'integer', minimum: 0, example: 25 },
          categoryId: { type: 'integer', minimum: 1, example: 1 },
          images: {
            type: 'array',
            items: { $ref: '#/components/schemas/ProductImage' },
            maxItems: 10,
          },
        },
      },
      Product: {
        type: 'object',
        properties: {
          id: { type: 'integer' },
          seller_id: { type: 'integer' },
          name: { type: 'string' },
          description: { type: 'string' },
          price: { type: 'number' },
          stock: { type: 'integer' },
          category_id: { type: 'integer' },
          image_url: { type: 'string', nullable: true, description: 'Legacy field — use images array' },
          images: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                id: { type: 'integer' },
                image_url: { type: 'string' },
                display_order: { type: 'integer' },
              },
            },
          },
          is_active: { type: 'boolean' },
          created_at: { type: 'string', format: 'date-time' },
        },
      },
      CartItemRequest: {
        type: 'object',
        required: ['productId', 'quantity'],
        properties: {
          productId: { type: 'integer', minimum: 1 },
          quantity: { type: 'integer', minimum: 1 },
        },
      },
      CartQuantityRequest: {
        type: 'object',
        required: ['quantity'],
        properties: { quantity: { type: 'integer', minimum: 1 } },
      },
      CartItem: {
        type: 'object',
        properties: {
          id: { type: 'integer' },
          cartId: { type: 'integer' },
          productId: { type: 'integer' },
          productName: { type: 'string' },
          price: { type: 'number' },
          image_url: { type: 'string', nullable: true },
          quantity: { type: 'integer' },
          subtotal: { type: 'number' },
        },
      },
      ShippingAddress: {
        type: 'object',
        required: ['name', 'address', 'city', 'state', 'pincode', 'phone'],
        properties: {
          name: { type: 'string', example: 'Jane Doe' },
          address: { type: 'string', example: '123 Market Street, Chennai' },
          city: { type: 'string', example: 'Chennai' },
          state: { type: 'string', example: 'Tamil Nadu' },
          pincode: { type: 'string', pattern: '^\\d{6}$', example: '600001' },
          phone: { type: 'string', pattern: '^\\d{10}$', example: '9876543210' },
        },
      },
      CheckoutRequest: {
        type: 'object',
        required: ['shippingAddress'],
        properties: {
          shippingAddress: { $ref: '#/components/schemas/ShippingAddress' },
        },
      },
      Order: {
        type: 'object',
        properties: {
          orderId: { type: 'integer' },
          totalAmount: { type: 'number' },
          status: {
            type: 'string',
            enum: ['PENDING', 'PLACED', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'CANCELLED'],
          },
          paymentStatus: { type: 'string', enum: ['PENDING', 'PAID', 'FAILED'] },
          shippingAddress: { $ref: '#/components/schemas/ShippingAddress' },
          createdAt: { type: 'string', format: 'date-time' },
          items: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                productId: { type: 'integer' },
                productName: { type: 'string' },
                price: { type: 'number' },
                quantity: { type: 'integer' },
              },
            },
          },
        },
      },
      OrderStatusRequest: {
        type: 'object',
        required: ['status'],
        properties: {
          status: {
            type: 'string',
            enum: ['PENDING', 'PLACED', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'CANCELLED'],
          },
        },
      },
      VerifyPaymentRequest: {
        type: 'object',
        required: ['razorpayOrderId', 'razorpayPaymentId', 'razorpaySignature'],
        properties: {
          razorpayOrderId: { type: 'string' },
          razorpayPaymentId: { type: 'string' },
          razorpaySignature: { type: 'string' },
        },
      },
      SellerOrder: {
        type: 'object',
        properties: {
          orderId: { type: 'integer' },
          totalAmount: { type: 'number' },
          orderStatus: { type: 'string' },
          paymentStatus: { type: 'string' },
          customerName: { type: 'string' },
          createdAt: { type: 'string', format: 'date-time' },
          items: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                productId: { type: 'integer' },
                productName: { type: 'string' },
                quantity: { type: 'integer' },
                price: { type: 'number' },
              },
            },
          },
        },
      },
    },
  },
  paths: {
    '/health': {
      get: {
        tags: ['Health'],
        summary: 'Check API health',
        description: 'Returns the current health status of the Sellora API.',
        security: [],
        responses: {
          200: successResponse('API is running', { type: 'object' }),
          500: errorResponse('Unexpected server error'),
        },
      },
    },
    '/auth/register': {
      post: {
        tags: ['Authentication'],
        summary: 'Register a user',
        description:
          'Creates a customer account. `mobileNumber` is normalized to the database field internally.',
        security: [],
        requestBody: {
          required: true,
          content: jsonContent({ $ref: '#/components/schemas/RegisterRequest' }),
        },
        responses: {
          201: successResponse('User registered', { $ref: '#/components/schemas/User' }),
          400: validationErrorResponse,
          409: errorResponse('Email is already registered'),
        },
      },
    },
    '/auth/login': {
      post: {
        tags: ['Authentication'],
        summary: 'Log in',
        description:
          'Returns an access token and sets the refresh token as an HTTP-only cookie. Limited to 5 attempts per 15 minutes.',
        security: [],
        requestBody: {
          required: true,
          content: jsonContent({ $ref: '#/components/schemas/LoginRequest' }),
        },
        responses: {
          200: successResponse('Login successful', { $ref: '#/components/schemas/LoginData' }),
          400: validationErrorResponse,
          401: unauthorizedResponse,
          429: errorResponse('Too many login attempts'),
        },
      },
    },
    '/auth/refresh-token': {
      post: {
        tags: ['Authentication'],
        summary: 'Refresh access token',
        description:
          'Rotates the HTTP-only refresh-token cookie and returns a new access token. No request body is required.',
        security: [],
        responses: {
          200: successResponse('Token refreshed', { $ref: '#/components/schemas/TokenData' }),
          401: unauthorizedResponse,
        },
      },
    },
    '/auth/logout': {
      post: {
        tags: ['Authentication'],
        summary: 'Log out current session',
        description: 'Revokes the refresh token in the HTTP-only cookie and clears that cookie.',
        security: [],
        responses: {
          200: successResponse('Logout successful', { nullable: true }),
          401: unauthorizedResponse,
        },
      },
    },
    '/auth/sessions': {
      get: {
        tags: ['Authentication'],
        summary: 'List active sessions',
        description: 'Lists active refresh-token sessions for the authenticated user.',
        security: bearerSecurity,
        responses: {
          200: successResponse('Active sessions', {
            type: 'array',
            items: { $ref: '#/components/schemas/Session' },
          }),
          401: unauthorizedResponse,
        },
      },
    },
    '/auth/logout-all': {
      post: {
        tags: ['Authentication'],
        summary: 'Log out all sessions',
        description:
          'Revokes every refresh-token session for the authenticated user and clears the current cookie.',
        security: bearerSecurity,
        responses: {
          200: successResponse('All sessions logged out', { nullable: true }),
          401: unauthorizedResponse,
        },
      },
    },
    '/auth/me': {
      get: {
        tags: ['Authentication'],
        summary: 'Get current user',
        description: 'Returns the JWT payload for the authenticated access token.',
        security: bearerSecurity,
        responses: {
          200: successResponse('Profile fetched', { $ref: '#/components/schemas/User' }),
          401: unauthorizedResponse,
        },
      },
    },
    '/auth/forgot-password': {
      post: {
        tags: ['Authentication'],
        summary: 'Request password reset OTP',
        description:
          'Sends a password-reset OTP to the user email. Limited to 3 requests per 15 minutes.',
        security: [],
        requestBody: {
          required: true,
          content: jsonContent({ $ref: '#/components/schemas/ForgotPasswordRequest' }),
        },
        responses: {
          200: successResponse('OTP sent', { nullable: true }),
          400: validationErrorResponse,
          404: notFoundResponse,
          429: errorResponse('Too many password reset requests'),
        },
      },
    },
    '/auth/reset-password': {
      post: {
        tags: ['Authentication'],
        summary: 'Reset password with OTP',
        description:
          'Verifies the OTP, updates the password, and revokes all refresh-token sessions. Limited to 5 attempts per 15 minutes.',
        security: [],
        requestBody: {
          required: true,
          content: jsonContent({ $ref: '#/components/schemas/ResetPasswordRequest' }),
        },
        responses: {
          200: successResponse('Password reset', { nullable: true }),
          400: validationErrorResponse,
          404: notFoundResponse,
          429: errorResponse('Too many reset attempts'),
        },
      },
    },
    '/auth/change-password': {
      put: {
        tags: ['Authentication'],
        summary: 'Change password',
        description:
          'Changes the authenticated user password and revokes all refresh-token sessions.',
        security: bearerSecurity,
        requestBody: {
          required: true,
          content: jsonContent({ $ref: '#/components/schemas/ChangePasswordRequest' }),
        },
        responses: {
          200: successResponse('Password changed', { nullable: true }),
          400: validationErrorResponse,
          401: unauthorizedResponse,
          404: notFoundResponse,
        },
      },
    },
    '/seller/profile': {
      post: {
        tags: ['Seller'],
        summary: 'Create seller profile',
        description:
          'Creates a seller profile for the authenticated user and promotes the user to seller.',
        security: bearerSecurity,
        requestBody: {
          required: true,
          content: jsonContent({ $ref: '#/components/schemas/SellerProfileRequest' }),
        },
        responses: {
          201: successResponse('Seller profile created', {
            $ref: '#/components/schemas/SellerProfile',
          }),
          400: validationErrorResponse,
          401: unauthorizedResponse,
          409: errorResponse('Seller profile already exists'),
        },
      },
      get: {
        tags: ['Seller'],
        summary: 'Get seller profile',
        description: 'Returns the authenticated seller profile. Requires seller role.',
        security: bearerSecurity,
        responses: {
          200: successResponse('Seller profile fetched', {
            $ref: '#/components/schemas/SellerProfile',
          }),
          401: unauthorizedResponse,
          403: forbiddenResponse,
          404: notFoundResponse,
        },
      },
      put: {
        tags: ['Seller'],
        summary: 'Update seller profile',
        description: 'Updates the authenticated seller profile. Requires seller role.',
        security: bearerSecurity,
        requestBody: {
          required: true,
          content: jsonContent({ $ref: '#/components/schemas/SellerProfileRequest' }),
        },
        responses: {
          200: successResponse('Seller profile updated', {
            $ref: '#/components/schemas/SellerProfile',
          }),
          400: validationErrorResponse,
          401: unauthorizedResponse,
          403: forbiddenResponse,
          404: notFoundResponse,
        },
      },
    },
    '/categories': {
      post: {
        tags: ['Categories'],
        summary: 'Create category',
        description: 'Creates a category. Requires admin role.',
        security: bearerSecurity,
        requestBody: {
          required: true,
          content: jsonContent({ $ref: '#/components/schemas/CategoryRequest' }),
        },
        responses: {
          201: successResponse('Category created', { $ref: '#/components/schemas/Category' }),
          400: validationErrorResponse,
          401: unauthorizedResponse,
          403: forbiddenResponse,
          409: errorResponse('Category already exists'),
        },
      },
      get: {
        tags: ['Categories'],
        summary: 'List categories',
        description: 'Returns every category. Public endpoint for storefront browsing.',
        security: [],
        responses: {
          200: successResponse('Categories fetched', {
            type: 'array',
            items: { $ref: '#/components/schemas/Category' },
          }),
          404: notFoundResponse,
        },
      },
    },
    '/categories/{id}': {
      get: {
        tags: ['Categories'],
        summary: 'Get category by ID',
        description: 'Returns one category. Public endpoint.',
        security: [],
        parameters: [idParameter],
        responses: {
          200: successResponse('Category fetched', { $ref: '#/components/schemas/Category' }),
          400: validationErrorResponse,
          404: notFoundResponse,
        },
      },
      put: {
        tags: ['Categories'],
        summary: 'Update category',
        description: 'Updates a category. Requires admin role.',
        security: bearerSecurity,
        parameters: [idParameter],
        requestBody: {
          required: true,
          content: jsonContent({ $ref: '#/components/schemas/CategoryRequest' }),
        },
        responses: {
          200: successResponse('Category updated', { $ref: '#/components/schemas/Category' }),
          400: validationErrorResponse,
          401: unauthorizedResponse,
          403: forbiddenResponse,
          404: notFoundResponse,
          409: errorResponse('Category already exists'),
        },
      },
    },
    '/products': {
      post: {
        tags: ['Products'],
        summary: 'Create product',
        description: 'Creates a product for the authenticated seller. Requires seller role.',
        security: bearerSecurity,
        requestBody: {
          required: true,
          content: jsonContent({ $ref: '#/components/schemas/ProductRequest' }),
        },
        responses: {
          201: successResponse('Product created', { $ref: '#/components/schemas/Product' }),
          400: validationErrorResponse,
          401: unauthorizedResponse,
          403: forbiddenResponse,
          404: notFoundResponse,
        },
      },
      get: {
        tags: ['Products'],
        summary: 'List products',
        description:
          'Returns active products with pagination, optional search, category, and sorting.',
        security: [],
        parameters: [
          { name: 'page', in: 'query', schema: { type: 'integer', minimum: 1, default: 1 } },
          {
            name: 'limit',
            in: 'query',
            schema: { type: 'integer', minimum: 1, maximum: 100, default: 10 },
          },
          { name: 'search', in: 'query', schema: { type: 'string', minLength: 2, maxLength: 100 } },
          { name: 'categoryId', in: 'query', schema: { type: 'integer', minimum: 1 } },
          {
            name: 'sort',
            in: 'query',
            schema: {
              type: 'string',
              enum: ['price', '-price', 'name', '-name', 'createdAt', '-createdAt'],
            },
          },
        ],
        responses: {
          200: successResponse('Products fetched', {
            type: 'object',
            properties: {
              products: { type: 'array', items: { $ref: '#/components/schemas/Product' } },
              pagination: { type: 'object' },
            },
          }),
          400: validationErrorResponse,
        },
      },
    },
    '/products/{id}': {
      get: {
        tags: ['Products'],
        summary: 'Get product by ID',
        description: 'Returns one active product.',
        security: [],
        parameters: [idParameter],
        responses: {
          200: successResponse('Product fetched', { $ref: '#/components/schemas/Product' }),
          400: validationErrorResponse,
          404: notFoundResponse,
        },
      },
      put: {
        tags: ['Products'],
        summary: 'Update product',
        description: 'Updates a product owned by the authenticated seller. Requires seller role.',
        security: bearerSecurity,
        parameters: [idParameter],
        requestBody: {
          required: true,
          content: jsonContent({ $ref: '#/components/schemas/ProductRequest' }),
        },
        responses: {
          200: successResponse('Product updated', { $ref: '#/components/schemas/Product' }),
          400: validationErrorResponse,
          401: unauthorizedResponse,
          403: forbiddenResponse,
          404: notFoundResponse,
        },
      },
      delete: {
        tags: ['Products'],
        summary: 'Delete product',
        description:
          'Soft-deletes a product owned by the authenticated seller. Requires seller role.',
        security: bearerSecurity,
        parameters: [idParameter],
        responses: {
          200: successResponse('Product deleted', { nullable: true }),
          400: validationErrorResponse,
          401: unauthorizedResponse,
          403: forbiddenResponse,
          404: notFoundResponse,
        },
      },
    },
    '/cart': {
      post: {
        tags: ['Cart'],
        summary: 'Add item to cart',
        description: 'Adds a product to the authenticated user cart, or increases its quantity.',
        security: bearerSecurity,
        requestBody: {
          required: true,
          content: jsonContent({ $ref: '#/components/schemas/CartItemRequest' }),
        },
        responses: {
          201: successResponse('Item added to cart', { $ref: '#/components/schemas/CartItem' }),
          400: validationErrorResponse,
          401: unauthorizedResponse,
          404: notFoundResponse,
        },
      },
      get: {
        tags: ['Cart'],
        summary: 'Get cart',
        description: 'Returns all cart items for the authenticated user.',
        security: bearerSecurity,
        responses: {
          200: successResponse('Cart fetched', {
            type: 'array',
            items: { $ref: '#/components/schemas/CartItem' },
          }),
          401: unauthorizedResponse,
          404: errorResponse('Cart is empty'),
        },
      },
    },
    '/cart/{id}': {
      put: {
        tags: ['Cart'],
        summary: 'Update cart item quantity',
        description: 'Updates quantity for a cart item owned by the authenticated user.',
        security: bearerSecurity,
        parameters: [idParameter],
        requestBody: {
          required: true,
          content: jsonContent({ $ref: '#/components/schemas/CartQuantityRequest' }),
        },
        responses: {
          200: successResponse('Cart updated', { $ref: '#/components/schemas/CartItem' }),
          400: validationErrorResponse,
          401: unauthorizedResponse,
          403: forbiddenResponse,
          404: notFoundResponse,
        },
      },
      delete: {
        tags: ['Cart'],
        summary: 'Remove cart item',
        description: 'Removes a cart item owned by the authenticated user.',
        security: bearerSecurity,
        parameters: [idParameter],
        responses: {
          200: successResponse('Cart item removed', { nullable: true }),
          400: validationErrorResponse,
          401: unauthorizedResponse,
          403: forbiddenResponse,
          404: notFoundResponse,
        },
      },
    },
    '/orders': {
      post: {
        tags: ['Orders'],
        summary: 'Checkout cart',
        description:
          'Creates an order from the authenticated user cart with a shipping address. Creates a Razorpay order and returns details for frontend payment.',
        security: bearerSecurity,
        requestBody: {
          required: true,
          content: jsonContent({ $ref: '#/components/schemas/CheckoutRequest' }),
        },
        responses: {
          201: successResponse('Order placed', {
            type: 'object',
            properties: {
              orderId: { type: 'integer' },
              totalAmount: { type: 'number' },
              status: { type: 'string', example: 'PENDING' },
              paymentStatus: { type: 'string', example: 'PENDING' },
              razorpayOrderId: { type: 'string' },
              razorpayKeyId: { type: 'string' },
              amount: { type: 'integer', description: 'Amount in paise' },
              currency: { type: 'string', example: 'INR' },
            },
          }),
          400: errorResponse('Cart is empty, stock unavailable, or validation error'),
          401: unauthorizedResponse,
        },
      },
      get: {
        tags: ['Orders'],
        summary: 'Get my orders',
        description: 'Returns order history for the authenticated user.',
        security: bearerSecurity,
        responses: {
          200: successResponse('Orders fetched', {
            type: 'array',
            items: { $ref: '#/components/schemas/Order' },
          }),
          401: unauthorizedResponse,
          404: errorResponse('No orders found'),
        },
      },
    },
    '/orders/{id}': {
      get: {
        tags: ['Orders'],
        summary: 'Get order by ID',
        description: 'Returns an order and its items when owned by the authenticated user.',
        security: bearerSecurity,
        parameters: [idParameter],
        responses: {
          200: successResponse('Order fetched', { $ref: '#/components/schemas/Order' }),
          400: validationErrorResponse,
          401: unauthorizedResponse,
          404: notFoundResponse,
        },
      },
    },
    '/admin/orders': {
      get: {
        tags: ['Admin'],
        summary: 'List all orders',
        description: 'Returns all orders across users. Requires admin role.',
        security: bearerSecurity,
        responses: {
          200: successResponse('Orders fetched', {
            type: 'array',
            items: { $ref: '#/components/schemas/Order' },
          }),
          401: unauthorizedResponse,
          403: forbiddenResponse,
        },
      },
    },
    '/admin/orders/{id}/status': {
      put: {
        tags: ['Admin'],
        summary: 'Update order status',
        description:
          'Transitions an order status according to allowed state changes. Requires admin role.',
        security: bearerSecurity,
        parameters: [idParameter],
        requestBody: {
          required: true,
          content: jsonContent({ $ref: '#/components/schemas/OrderStatusRequest' }),
        },
        responses: {
          200: successResponse('Order status updated', {
            type: 'object',
            properties: {
              orderId: { type: 'integer' },
              oldStatus: { type: 'string' },
              newStatus: { type: 'string' },
            },
          }),
          400: validationErrorResponse,
          401: unauthorizedResponse,
          403: forbiddenResponse,
          404: notFoundResponse,
        },
      },
    },
    '/seller/orders': {
      get: {
        tags: ['Seller'],
        summary: 'Get seller orders',
        description:
          'Returns all orders containing products owned by the authenticated seller. Requires seller role.',
        security: bearerSecurity,
        responses: {
          200: successResponse('Seller orders fetched', {
            type: 'array',
            items: { $ref: '#/components/schemas/SellerOrder' },
          }),
          401: unauthorizedResponse,
          403: forbiddenResponse,
          404: errorResponse('No orders found or seller profile not found'),
        },
      },
    },
    '/payments/verify': {
      post: {
        tags: ['Payments'],
        summary: 'Verify Razorpay payment',
        description:
          'Verifies the Razorpay payment signature after checkout. On success, marks payment_status as PAID and order status as PLACED.',
        security: bearerSecurity,
        requestBody: {
          required: true,
          content: jsonContent({ $ref: '#/components/schemas/VerifyPaymentRequest' }),
        },
        responses: {
          200: successResponse('Payment verified', {
            type: 'object',
            properties: {
              orderId: { type: 'integer' },
              paymentStatus: { type: 'string', example: 'PAID' },
              orderStatus: { type: 'string', example: 'PLACED' },
            },
          }),
          400: errorResponse('Invalid payment signature or already verified'),
          401: unauthorizedResponse,
          404: notFoundResponse,
        },
      },
    },
  },
};

const swaggerSpec = swaggerJsdoc({
  definition: swaggerDefinition,
  apis: [],
});

export default swaggerSpec;
