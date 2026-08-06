import mysql from 'mysql2/promise';
import env from './env.config.js';

const pool = mysql.createPool({
  host: env.DB_HOST,
  port: Number(env.DB_PORT),
  user: env.DB_USER,
  password: env.DB_PASSWORD,
  database: env.DB_NAME,

  ssl: {
    rejectUnauthorized: false,
  },

  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

const MAX_CONNECTION_ATTEMPTS = 12;
const INITIAL_RETRY_DELAY_MS = 1000;
const MAX_RETRY_DELAY_MS = 5000;
const retryableDatabaseErrorCodes = new Set([
  'ECONNREFUSED',
  'ECONNRESET',
  'EHOSTUNREACH',
  'ETIMEDOUT',
  'PROTOCOL_CONNECTION_LOST',
  'ER_SERVER_SHUTDOWN',
]);

const wait = (duration) => new Promise((resolve) => setTimeout(resolve, duration));

const getRetryDelay = (attempt) =>
  Math.min(INITIAL_RETRY_DELAY_MS * 2 ** (attempt - 1), MAX_RETRY_DELAY_MS);

export const testConnection = async () => {
  for (let attempt = 1; attempt <= MAX_CONNECTION_ATTEMPTS; attempt += 1) {
    try {
      const connection = await pool.getConnection();

      console.log('✅ Connected to MySQL Database');
      connection.release();
      return;
    } catch (error) {
      const shouldRetry =
        retryableDatabaseErrorCodes.has(error.code) && attempt < MAX_CONNECTION_ATTEMPTS;

      console.error('Database connection error:', {
        code: error.code,
        errno: error.errno,
        sqlState: error.sqlState,
        message: error.message,
        stack: error.stack,
      });

      process.exit(1);

      console.error(error);

      const delay = getRetryDelay(attempt);

      console.warn(
        `Database connection attempt ${attempt}/${MAX_CONNECTION_ATTEMPTS} failed. Retrying in ${delay}ms...`
      );
      await wait(delay);
    }
  }
};

export default pool;
