import pool from '../config/db.config.js';

export const getCartItemsForCheckout = async (userId, connection) => {
  const [rows] = await connection.execute(
    `
    SELECT
      c.product_id,
      c.quantity,
      p.price,
      p.stock,
      p.is_active
    FROM cart c
    INNER JOIN products p
      ON c.product_id = p.id
    WHERE c.user_id = ?
    `,
    [userId]
  );

  return rows;
};

/**
 * Creates an order with shipping address and optional Razorpay fields.
 *
 * NOTE: The shipping_* columns use NOT NULL DEFAULT '' at the DB level.
 * Those defaults exist only to keep the migration non-breaking for rows
 * created before this change — they are NOT a substitute for validation.
 * Joi enforces that all shipping fields are present and non-empty at
 * checkout time.
 */
export const createOrder = async (
  userId,
  totalAmount,
  shippingAddress,
  connection,
  { status = 'PENDING', razorpayOrderId = null } = {}
) => {
  const [result] = await connection.execute(
    `
    INSERT INTO orders (
      user_id, total_amount,
      shipping_name, shipping_address, shipping_city,
      shipping_state, shipping_pincode, shipping_phone,
      status, razorpay_order_id
    )
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `,
    [
      userId,
      totalAmount,
      shippingAddress.name,
      shippingAddress.address,
      shippingAddress.city,
      shippingAddress.state,
      shippingAddress.pincode,
      shippingAddress.phone,
      status,
      razorpayOrderId,
    ]
  );

  return result.insertId;
};

export const createOrderItem = async (orderId, productId, quantity, price, connection) => {
  await connection.execute(
    `
    INSERT INTO order_items (
      order_id,
      product_id,
      quantity,
      price
    )
    VALUES (?, ?, ?, ?)
    `,
    [orderId, productId, quantity, price]
  );
};

export const reduceProductStock = async (productId, quantity, connection) => {
  await connection.execute(
    `
    UPDATE products
    SET stock = stock - ?
    WHERE id = ?
    `,
    [quantity, productId]
  );
};

export const clearCart = async (userId, connection) => {
  await connection.execute(
    `
    DELETE FROM cart
    WHERE user_id = ?
    `,
    [userId]
  );
};

export const findOrdersByUserId = async (userId) => {
  const [rows] = await pool.execute(
    `
    SELECT
      id,
      total_amount,
      status,
      payment_status,
      shipping_name,
      shipping_address,
      shipping_city,
      shipping_state,
      shipping_pincode,
      shipping_phone,
      created_at
    FROM orders
    WHERE user_id = ?
    ORDER BY created_at DESC
    `,
    [userId]
  );

  return rows;
};

export const findOrderById = async (orderId, userId) => {
  const [rows] = await pool.execute(
    `
    SELECT
      o.id AS order_id,
      o.total_amount,
      o.status,
      o.payment_status,
      o.shipping_name,
      o.shipping_address,
      o.shipping_city,
      o.shipping_state,
      o.shipping_pincode,
      o.shipping_phone,
      o.created_at,
      p.id AS product_id,
      p.name AS product_name,
      oi.price,
      oi.quantity
    FROM orders o
    INNER JOIN order_items oi
      ON o.id = oi.order_id
    INNER JOIN products p
      ON oi.product_id = p.id
    WHERE o.id = ?
      AND o.user_id = ?
    `,
    [orderId, userId]
  );

  return rows;
};

export const findAllOrders = async () => {
  const [rows] = await pool.execute(
    `
    SELECT
      o.id AS order_id,
      u.id AS user_id,
      u.name,
      u.email,
      o.total_amount,
      o.status,
      o.payment_status,
      o.created_at
    FROM orders o
    INNER JOIN users u
      ON o.user_id = u.id
    ORDER BY o.created_at DESC
    `
  );

  return rows;
};

export const findOrderByIdForAdmin = async (orderId) => {
  const [rows] = await pool.execute(
    `
    SELECT id, status, payment_status
    FROM orders
    WHERE id = ?
    `,
    [orderId]
  );

  return rows[0];
};

export const updateOrderStatus = async (orderId, status) => {
  await pool.execute(
    `
    UPDATE orders
    SET status = ?
    WHERE id = ?
    `,
    [status, orderId]
  );
};

export const findOrderByRazorpayOrderId = async (razorpayOrderId) => {
  const [rows] = await pool.execute(
    `
    SELECT id, user_id, status, payment_status, razorpay_order_id
    FROM orders
    WHERE razorpay_order_id = ?
    `,
    [razorpayOrderId]
  );

  return rows[0];
};

export const updatePaymentVerification = async (orderId, razorpayPaymentId, paymentStatus) => {
  await pool.execute(
    `
    UPDATE orders
    SET
      razorpay_payment_id = ?,
      payment_status = ?
    WHERE id = ?
    `,
    [razorpayPaymentId, paymentStatus, orderId]
  );
};

