import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import ApiError from '../errors/ApiError.js';
import {
  findUserByEmail,
  createUser,
  updateUserPassword,
  findUserById,
} from '../models/user.model.js';
import {
  createOTP,
  deleteOTPByPurpose,
  findValidOTP,
  deleteOTP,
  markOTPVerified,
} from '../models/otp.model.js';
import { sendEmail } from '../utils/email.service.js';
import { generateOTP } from '../utils/otp.js';

const registerUser = async (userData) => {
  const { name, email, password, mobile_number } = userData;

  const existingUser = await findUserByEmail(email);

  if (existingUser) {
    throw new ApiError(409, 'User already exist');
  }

  const hashPassword = await bcrypt.hash(password, 10);

  const result = await createUser({ name, email, password: hashPassword, mobile_number });

  return {
    id: result,
    name,
    email,
    mobile_number,
  };
};

const loginUser = async (userData) => {
  const { email, password } = userData;

  const existingUser = await findUserByEmail(email);

  if (!existingUser) {
    throw new ApiError(401, 'Invalid email or password');
  }

  const isPasswordValid = await bcrypt.compare(password, existingUser.password);

  if (!isPasswordValid) {
    throw new ApiError(401, 'Invalid email or password');
  }

  const token = jwt.sign(
    {
      id: existingUser.id,
      email: existingUser.email,
      role: existingUser.role,
    },
    process.env.JWT_SECRET,
    {
      expiresIn: process.env.JWT_EXPIRES_IN,
    }
  );

  return {
    token,
    user: {
      id: existingUser.id,
      name: existingUser.name,
      email: existingUser.email,
      role: existingUser.role,
    },
  };
};

export const forgotPasswordService = async (email) => {
  const user = await findUserByEmail(email);

  if (!user) {
    throw new ApiError(404, 'User not found');
  }

  const otp = generateOTP();

  const expiresAt = new Date(Date.now() + 10 * 60 * 1000);

  await deleteOTPByPurpose(user.id, 'PASSWORD_RESET');
  await createOTP(user.id, otp, 'PASSWORD_RESET', expiresAt);

  await sendEmail(
    user.email,
    'Sellora Password Reset OTP',
    `
  <div style="
      max-width:600px;
      margin:40px auto;
      font-family:Arial,Helvetica,sans-serif;
      background:#ffffff;
      border:1px solid #e5e5e5;
      border-radius:12px;
      overflow:hidden;
      box-shadow:0 4px 10px rgba(0,0,0,0.08);
  ">

      <div style="
          background:#2563eb;
          padding:20px;
          text-align:center;
      ">
          <h1 style="
              color:white;
              margin:0;
              font-size:28px;
          ">
              Sellora
          </h1>
      </div>

      <div style="padding:30px;">

          <h2 style="
              color:#222;
              margin-top:0;
          ">
              Password Reset
          </h2>

          <p style="
              color:#555;
              font-size:16px;
          ">
              Hello <strong>${user.name}</strong>,
          </p>

          <p style="
              color:#555;
              font-size:16px;
              line-height:1.6;
          ">
              We received a request to reset your password.
              Use the OTP below to continue.
          </p>

          <div style="
              text-align:center;
              margin:35px 0;
          ">
              <span style="
                  display:inline-block;
                  background:#f3f4f6;
                  color:#2563eb;
                  font-size:34px;
                  font-weight:bold;
                  letter-spacing:10px;
                  padding:18px 35px;
                  border-radius:10px;
                  border:2px dashed #2563eb;
              ">
                  ${otp}
              </span>
          </div>

          <p style="
              color:#555;
              font-size:15px;
          ">
              This OTP is valid for
              <strong>10 minutes</strong>.
          </p>

          <p style="
              color:#777;
              font-size:14px;
              line-height:1.6;
          ">
              If you didn't request a password reset,
              you can safely ignore this email.
          </p>

      </div>

      <div style="
          background:#f9fafb;
          padding:18px;
          text-align:center;
          color:#888;
          font-size:13px;
      ">
          © 2026 Sellora. All Rights Reserved.
      </div>

  </div>
  `
  );

  return;
};

export const resetPasswordService = async (email, otp, newPassword) => {
  const user = await findUserByEmail(email);

  if (!user) {
    throw new ApiError(404, 'User not found');
  }

  const otpRecord = await findValidOTP(user.id, otp, 'PASSWORD_RESET');

  if (!otpRecord) {
    throw new ApiError(400, 'Invalid or expired OTP');
  }

  // Mark OTP as verified
  await markOTPVerified(otpRecord.id);

  // Hash the new password
  const hashedPassword = await bcrypt.hash(newPassword, 10);

  // Update the password
  await updateUserPassword(user.id, hashedPassword);
};

export const changePasswordService = async (userId, oldPassword, newPassword) => {
  const user = await findUserById(userId);

  if (!user) {
    throw new ApiError(404, 'User not found');
  }

  const isPasswordCorrect = await bcrypt.compare(oldPassword, user.password);

  if (!isPasswordCorrect) {
    throw new ApiError(400, 'Old password is incorrect');
  }

  // Prevent using the same password again
  const isSamePassword = await bcrypt.compare(newPassword, user.password);

  if (isSamePassword) {
    throw new ApiError(400, 'New password must be different from the old password');
  }

  const hashedPassword = await bcrypt.hash(newPassword, 10);

  await updateUserPassword(userId, hashedPassword);
};

export { registerUser, loginUser };
