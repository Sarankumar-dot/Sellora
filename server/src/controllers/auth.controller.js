import asyncHandler from '../utils/asyncHandler.js';
import {
  registerUser,
  loginUser,
  forgotPasswordService,
  resetPasswordService,
  changePasswordService,
} from '../services/auth.service.js';
import ApiResponse from '../utils/ApiResponse.js';

const register = asyncHandler(async (req, res) => {
  const result = await registerUser(req.body);

  return res.status(201).json(new ApiResponse(201, result, 'user registered successfully'));
});

const login = asyncHandler(async (req, res) => {
  const result = await loginUser(req.body);

  return res.status(200).json(new ApiResponse(200, result, 'Login successful'));
});

const getMe = asyncHandler(async (req, res) => {
  return res.status(200).json(new ApiResponse(200, req.user, 'Profile fetched successfully'));
});

export const forgotPassword = asyncHandler(async (req, res) => {
  await forgotPasswordService(req.body.email);

  return res.status(200).json(new ApiResponse(200, null, 'OTP sent successfully'));
});

export const resetPassword = asyncHandler(async (req, res) => {
  const { email, otp, newPassword } = req.body;

  await resetPasswordService(email, otp, newPassword);

  return res.status(200).json(new ApiResponse(200, null, 'Password reset successful'));
});

export const changePassword = asyncHandler(async (req, res) => {
  const { oldPassword, newPassword } = req.body;

  await changePasswordService(req.user.id, oldPassword, newPassword);

  return res.status(200).json(new ApiResponse(200, null, 'Password changed successfully'));
});

export { register, login, getMe };
