import pool from '../config/db.config.js';

export const findAllOrders = async () => {
  const [rows] = await pool.execute(
    `
    SELECT
        o.id AS order_id,
        u.id AS user_id,
        u.name AS customer_name,
        u.email AS customer_email,
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
