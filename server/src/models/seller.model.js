import pool from '../config/db.config.js';

const findSellerByUserId = async (userId) => {
  const [rows] = await pool.execute('SELECT * FROM seller_profiles WHERE user_id = ?', [userId]);

  return rows[0];
};

const insertSellerProfile = async (sellerData) => {
  const { user_id, store_name, gst_number, pan_number, address, description, logo } = sellerData;

  const [result] = await pool.execute(
    `INSERT INTO seller_profiles
(
    user_id,
    store_name,
    gst_number,
    pan_number,
    address,
    description,
    logo
)
VALUES (?, ?, ?, ?, ?, ?, ?)`,
    [user_id, store_name, gst_number, pan_number, address, description, logo]
  );

  return result.insertId;
};

const updateSellerProfileInDB = async (sellerData) => {
  const { user_id, store_name, gst_number, pan_number, address, description, logo } = sellerData;

  await pool.execute(
    `
        UPDATE seller_profiles
        SET
            store_name=?,
            gst_number=?,
            pan_number=?,
            address=?,
            description=?,
            logo=?
        WHERE user_id=?
        `,
    [store_name, gst_number, pan_number, address, description, logo, user_id]
  );
};

export const updateUserRole = async (userId, role) => {
  await pool.execute(
    `UPDATE users
     SET role = ?
     WHERE id = ?`,
    [role, userId]
  );
};

export const findOrdersBySellerId = async (sellerId) => {
  const [rows] = await pool.execute(
    `
    SELECT
      o.id            AS order_id,
      o.total_amount,
      o.status        AS order_status,
      o.payment_status,
      o.created_at    AS order_created_at,
      oi.product_id,
      p.name          AS product_name,
      oi.quantity,
      oi.price,
      u.name          AS customer_name
    FROM order_items oi
    INNER JOIN products p
      ON oi.product_id = p.id
    INNER JOIN orders o
      ON oi.order_id = o.id
    INNER JOIN users u
      ON o.user_id = u.id
    WHERE p.seller_id = ?
    ORDER BY o.created_at DESC
    `,
    [sellerId]
  );

  return rows;
};

export { findSellerByUserId, insertSellerProfile, updateSellerProfileInDB };
