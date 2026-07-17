import asyncHandler from '../utils/asyncHandler.js';
import { registerUser, loginUser } from '../services/auth.service.js';
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

export { register, login, getMe };
