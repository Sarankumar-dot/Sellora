import pool from '../config/db.config.js';

export const insertProductImages = async (productId, images, connection) => {
  const db = connection || pool;

  if (!images || images.length === 0) {
    return;
  }

  const placeholders = images.map(() => '(?, ?, ?)').join(', ');
  const values = images.flatMap((img, index) => [
    productId,
    img.url,
    img.displayOrder ?? index,
  ]);

  await db.execute(
    `INSERT INTO product_images (product_id, image_url, display_order) VALUES ${placeholders}`,
    values
  );
};

export const findImagesByProductId = async (productId) => {
  const [rows] = await pool.execute(
    `
    SELECT id, image_url, display_order
    FROM product_images
    WHERE product_id = ?
    ORDER BY display_order ASC, id ASC
    `,
    [productId]
  );

  return rows;
};

export const findImagesByProductIds = async (productIds) => {
  if (!productIds || productIds.length === 0) {
    return [];
  }

  const placeholders = productIds.map(() => '?').join(', ');

  const [rows] = await pool.execute(
    `
    SELECT id, product_id, image_url, display_order
    FROM product_images
    WHERE product_id IN (${placeholders})
    ORDER BY display_order ASC, id ASC
    `,
    productIds
  );

  return rows;
};

export const deleteImagesByProductId = async (productId, connection) => {
  const db = connection || pool;

  await db.execute(
    `
    DELETE FROM product_images
    WHERE product_id = ?
    `,
    [productId]
  );
};
