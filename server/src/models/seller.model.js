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

export { findSellerByUserId, insertSellerProfile, updateSellerProfileInDB };
