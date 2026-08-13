import pool from '../config/db.config.js';

export const findCartItem = async (userId, productId) => {
  const [rows] = await pool.execute(
    `
      SELECT *
      FROM cart
      WHERE user_id = ?
      AND product_id = ?
    `,
    [userId, productId]
  );

  return rows[0];
};

export const findCartById = async (cartId) => {
  const [rows] = await pool.execute(
    `
      SELECT *
      FROM cart
      WHERE id = ?
    `,
    [cartId]
  );

  return rows[0];
};

export const addToCartInDB = async (userId, productId, quantity) => {
  const [result] = await pool.execute(
    `
      INSERT INTO cart (user_id, product_id, quantity)
      VALUES (?, ?, ?)
      ON DUPLICATE KEY UPDATE quantity = quantity + VALUES(quantity)
    `,
    [userId, productId, quantity]
  );

  // insertId is the new row id on INSERT, or 0 on UPDATE
  const cartItem = await findCartItem(userId, productId);

  return cartItem;
};

export const updateCartQuantity = async (cartId, quantity) => {
  await pool.execute(
    `
      UPDATE cart
      SET quantity = ?
      WHERE id = ?
    `,
    [quantity, cartId]
  );
};

export const getCartItems = async (userId) => {
  const [rows] = await pool.execute(
    `
    SELECT
      c.id AS cartId,
      p.id AS productId,
      p.name AS productName,
      p.price,
      p.image_url,
      c.quantity,
      (p.price * c.quantity) AS subtotal
    FROM cart c
    INNER JOIN products p
      ON c.product_id = p.id
    WHERE c.user_id = ?
    ORDER BY c.created_at DESC
    `,
    [userId]
  );

  return rows;
};

export const deleteCartItem = async (cartId) => {
  const [result] = await pool.execute(
    `
      DELETE FROM cart
      WHERE id = ?
    `,
    [cartId]
  );

  return result;
};
