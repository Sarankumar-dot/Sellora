import mysql from 'mysql2/promise';
import env from './env.config.js';

const pool = mysql.createPool({
  host: env.DB_HOST,
  port: env.DB_PORT,
  user: env.DB_USER,
  password: env.DB_PASSWORD,
  database: env.DB_NAME,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

export const testConnection = async () => {
  try {
    const connection = await pool.getConnection();
    console.log('✅ Connected to MySQL Database');
    connection.release();
  } catch (e) {
    console.log(e.message);
    console.log('Database Connection failed');
    process.exit(1);
  }
};

export default pool;
