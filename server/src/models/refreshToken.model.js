import crypto from 'crypto';
import pool from '../config/db.config.js';

const hashRefreshToken = (token) => crypto.createHash('sha256').update(token).digest('hex');

const getDatabase = (connection) => connection || pool;

export const saveRefreshToken = async (
  userId,
  token,
  expiresAt,
  deviceInfo = null,
  ipAddress = null,
  lastUsedAt = new Date(),
  connection
) => {
  const db = getDatabase(connection);
  const tokenHash = hashRefreshToken(token);

  const [result] = await db.execute(
    `
    INSERT INTO refresh_tokens (
      user_id,
      token,
      expires_at,
      device_info,
      ip_address,
      last_used_at
    )
    VALUES (?, ?, ?, ?, ?, ?)
    `,
    [userId, tokenHash, expiresAt, deviceInfo, ipAddress, lastUsedAt]
  );

  return result.insertId;
};

export const findRefreshToken = async (token, connection) => {
  const db = getDatabase(connection);
  const tokenHash = hashRefreshToken(token);

  const [rows] = await db.execute(
    `
    SELECT id, user_id, token, expires_at, device_info, ip_address, last_used_at, created_at
    FROM refresh_tokens
    WHERE token = ?
    LIMIT 1
    `,
    [tokenHash]
  );

  return rows[0];
};

export const deleteRefreshToken = async (token, connection) => {
  const db = getDatabase(connection);
  const tokenHash = hashRefreshToken(token);

  const [result] = await db.execute(
    `
    DELETE FROM refresh_tokens
    WHERE token = ?
    `,
    [tokenHash]
  );

  return result;
};

export const deleteAllRefreshTokensForUser = async (userId, connection) => {
  const db = getDatabase(connection);

  const [result] = await db.execute(
    `
    DELETE FROM refresh_tokens
    WHERE user_id = ?
    `,
    [userId]
  );

  return result;
};

export const deleteAllRefreshTokensForUserExcept = async (userId, currentToken, connection) => {
  const db = getDatabase(connection);
  const tokenHash = crypto.createHash('sha256').update(currentToken).digest('hex');

  const [result] = await db.execute(
    `
    DELETE FROM refresh_tokens
    WHERE user_id = ? AND token != ?
    `,
    [userId, tokenHash]
  );

  return result;
};

export const deleteExpiredRefreshTokens = async (connection) => {
  const db = getDatabase(connection);

  const [result] = await db.execute(
    `
    DELETE FROM refresh_tokens
    WHERE expires_at <= NOW()
    `
  );

  return result;
};

export const findActiveRefreshTokensForUser = async (userId, connection) => {
  const db = getDatabase(connection);

  const [rows] = await db.execute(
    `
    SELECT id, user_id, device_info, ip_address, last_used_at, created_at, expires_at
    FROM refresh_tokens
    WHERE user_id = ?
      AND expires_at > NOW()
    ORDER BY created_at DESC
    `,
    [userId]
  );

  return rows;
};
