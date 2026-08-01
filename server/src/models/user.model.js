import pool from '../config/db.config.js';

const findUserByEmail = async (email) => {
  const [rows] = await pool.execute('SELECT * FROM users WHERE email = ?', [email]);

  return rows[0];
};

const createUser = async ({ name, email, password, mobile_number }) => {
  const [result] = await pool.execute(
    `INSERT INTO users(name,email,password,mobile_number) values(?,?,?,?)`,
    [name, email, password, mobile_number]
  );

  return result.insertId;
};

export const updateUserPassword = async (userId, password) => {
  await pool.execute(
    `
    UPDATE users
    SET password = ?
    WHERE id = ?
    `,
    [password, userId]
  );
};

export const findUserById = async (userId) => {
  const [rows] = await pool.execute(
    `
    SELECT *
    FROM users
    WHERE id = ?
    `,
    [userId]
  );

  return rows[0];
};
export { findUserByEmail, createUser };
