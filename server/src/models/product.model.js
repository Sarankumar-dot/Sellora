import pool from '../config/db.config.js';

export const findSellerProfileByUserId = async (userId) => {
  const [rows] = await pool.execute(`SELECT id FROM seller_profiles WHERE user_id = ?`, [userId]);

  return rows[0];
};

export const findProductById = async (productId) => {
  const [rows] = await pool.execute(
    `
    SELECT *
    FROM products
    WHERE id = ? AND is_active = TRUE
    `,
    [productId]
  );

  return rows[0];
};

export const createProductInDB = async (productData, connection) => {
  const db = connection || pool;
  const { seller_id, name, description, price, stock, category_id } = productData;

  const [result] = await db.execute(
    `INSERT INTO products
    (seller_id, name, description, price, stock, category_id)
    VALUES (?, ?, ?, ?, ?, ?)`,
    [seller_id, name, description, price, stock, category_id]
  );

  return result.insertId;
};

export const getProductsFromDB = async (limit, offset, search, category, sort) => {
  const conditions = ['is_active = TRUE'];
  const values = [];

  if (search) {
    conditions.push('name LIKE ?');
    values.push(`%${search}%`);
  }

  if (category) {
    conditions.push('category_id = ?');
    values.push(category);
  }

  let query = `
        SELECT *
        FROM products
        WHERE ${conditions.join(' AND ')}
    `;

  switch (sort) {
    case 'price_asc':
      query += ' ORDER BY price ASC';
      break;

    case 'price_desc':
      query += ' ORDER BY price DESC';
      break;

    default:
      query += ' ORDER BY created_at DESC';
  }

  query += ` LIMIT ${limit} OFFSET ${offset}`;

  const [rows] = await pool.execute(query, values);

  return rows;
};

export const getProductsCountFromDB = async (search, category) => {
  let query = `
    SELECT COUNT(*) AS total
    FROM products
    WHERE is_active = TRUE
  `;

  const values = [];

  if (search) {
    query += ` AND name LIKE ?`;
    values.push(`%${search}%`);
  }

  if (category) {
    query += ` AND category_id = ?`;
    values.push(category);
  }

  const [rows] = await pool.execute(query, values);

  return rows[0].total;
};

export const updateProductInDB = async (productId, productData, connection) => {
  const db = connection || pool;
  const { name, description, price, stock, category_id } = productData;

  const [result] = await db.execute(
    `
    UPDATE products
    SET
      name = ?,
      description = ?,
      price = ?,
      stock = ?,
      category_id = ?
    WHERE id = ?
    `,
    [name, description, price, stock, category_id, productId]
  );

  return result;
};

export const deleteProductInDB = async (productId) => {
  const [result] = await pool.execute(
    `
    UPDATE products
    SET is_active = FALSE
    WHERE id = ?
    `,
    [productId]
  );

  return result;
};
