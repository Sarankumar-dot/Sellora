import asyncHandler from '../utils/asyncHandler.js';
import {
  registerUser,
  loginUser,
  refreshTokenService,
  logoutService,
  listActiveSessionsService,
  logoutAllSessionsService,
  forgotPasswordService,
  resetPasswordService,
  changePasswordService,
  getRefreshTokenMaxAge,
} from '../services/auth.service.js';
import ApiResponse from '../utils/ApiResponse.js';

const refreshTokenCookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'strict',
  path: '/api/auth',
};

const getRefreshTokenCookieOptions = () => ({
  ...refreshTokenCookieOptions,
  maxAge: getRefreshTokenMaxAge(),
});

const register = asyncHandler(async (req, res) => {
  const result = await registerUser(req.body);

  return res.status(201).json(new ApiResponse(201, result, 'user registered successfully'));
});

const login = asyncHandler(async (req, res) => {
  const result = await loginUser(req.body, {
    userAgent: req.headers['user-agent'],
    ipAddress: req.headers['x-forwarded-for']?.split(',')[0]?.trim() || req.ip || null,
  });
  const { refreshToken, ...responseData } = result;

  res.cookie('refreshToken', refreshToken, getRefreshTokenCookieOptions());

  return res.status(200).json(new ApiResponse(200, responseData, 'Login successful'));
});

const refreshToken = asyncHandler(async (req, res) => {
  const result = await refreshTokenService(req.cookies.refreshToken);
  const { refreshToken: newRefreshToken, token } = result;

  res.cookie('refreshToken', newRefreshToken, getRefreshTokenCookieOptions());

  return res.status(200).json(new ApiResponse(200, { token }, 'Token refreshed successfully'));
});

const logout = asyncHandler(async (req, res) => {
  await logoutService(req.cookies.refreshToken);

  res.clearCookie('refreshToken', refreshTokenCookieOptions);

  return res.status(200).json(new ApiResponse(200, null, 'Logout successful'));
});

const listSessions = asyncHandler(async (req, res) => {
  const sessions = await listActiveSessionsService(req.user.id);

  return res.status(200).json(new ApiResponse(200, sessions, 'Active sessions fetched successfully'));
});

const logoutAll = asyncHandler(async (req, res) => {
  await logoutAllSessionsService(req.user.id);

  res.clearCookie('refreshToken', refreshTokenCookieOptions);

  return res.status(200).json(new ApiResponse(200, null, 'Logged out from all devices successfully'));
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

export { register, login, refreshToken, logout, listSessions, logoutAll, getMe };
