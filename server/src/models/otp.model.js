import pool from '../config/db.config.js';

export const createOTP = async (userId, otp, purpose, expiresAt) => {
  await pool.execute(
    `
    INSERT INTO otp_verifications
    (user_id, otp, purpose, expires_at)
    VALUES (?, ?, ?, ?)
    `,
    [userId, otp, purpose, expiresAt]
  );
};

export const findOTP = async (userId, otp, purpose) => {
  const [rows] = await pool.execute(
    `
    SELECT *
    FROM otp_verifications
    WHERE user_id = ?
      AND otp = ?
      AND purpose = ?
    ORDER BY created_at DESC
    LIMIT 1
    `,
    [userId, otp, purpose]
  );

  return rows[0];
};

export const deleteOTP = async (id) => {
  await pool.execute(
    `
    DELETE FROM otp_verifications
    WHERE id = ?
    `,
    [id]
  );
};

export const deleteOTPByPurpose = async (userId, purpose) => {
  await pool.execute(
    `
    DELETE FROM otp_verifications
    WHERE user_id = ?
      AND purpose = ?
    `,
    [userId, purpose]
  );
};

export const findValidOTP = async (userId, otp, purpose) => {
  const [rows] = await pool.execute(
    `
    SELECT *
    FROM otp_verifications
    WHERE user_id = ?
      AND otp = ?
      AND purpose = ?
      AND is_verified = FALSE
      AND expires_at > NOW()
    LIMIT 1
    `,
    [userId, otp, purpose]
  );

  return rows[0];
};

export const markOTPVerified = async (otpId) => {
  await pool.execute(
    `
    UPDATE otp_verifications
    SET
      is_verified = TRUE,
      verified_at = NOW()
    WHERE id = ?
    `,
    [otpId]
  );
};

export const incrementResendCount = async (otpId) => {
  await pool.execute(
    `
    UPDATE otp_verifications
    SET resend_count = resend_count + 1
    WHERE id = ?
    `,
    [otpId]
  );
};

export const findLatestOTP = async (userId, purpose) => {
  const [rows] = await pool.execute(
    `
    SELECT *
    FROM otp_verifications
    WHERE user_id = ?
      AND purpose = ?
    ORDER BY created_at DESC
    LIMIT 1
    `,
    [userId, purpose]
  );

  return rows[0];
};
