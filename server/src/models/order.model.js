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

export const createOrder = async (userId, totalAmount, connection) => {
  const [result] = await connection.execute(
    `
    INSERT INTO orders (user_id, total_amount)
    VALUES (?, ?)
    `,
    [userId, totalAmount]
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
    SELECT id, status
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
