import pool from '../config/db.config.js';

export const findCategoryByName = async (name) => {
  const [rows] = await pool.execute(
    `
      SELECT id, name, description
      FROM categories
      WHERE name = ?
    `,
    [name]
  );

  return rows[0];
};

export const findCategoryById = async (categoryId) => {
  const [rows] = await pool.execute(
    `
      SELECT id, name, description
      FROM categories
      WHERE id = ?
    `,
    [categoryId]
  );

  return rows[0];
};

export const createCategoryInDB = async ({ name, description }) => {
  const [result] = await pool.execute(
    `
      INSERT INTO categories (name, description)
      VALUES (?, ?)
    `,
    [name, description]
  );

  return {
    id: result.insertId,
    name,
    description,
  };
};

export const findAllCategories = async () => {
  const [rows] = await pool.execute(
    `
      SELECT id, name, description
      FROM categories
      ORDER BY name ASC
    `
  );

  return rows;
};

export const updateCategoryByIdInDB = async (data, categoryId) => {
  await pool.execute(
    `
      UPDATE categories
      SET
        name = ?,
        description = ?
      WHERE id = ?
    `,
    [data.name, data.description, categoryId]
  );
};
