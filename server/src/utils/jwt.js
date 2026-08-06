import jwt from 'jsonwebtoken';
import env from '../config/env.config.js';

const getAccessSecret = () => env.JWT_SECRET;
const getRefreshSecret = () => env.JWT_REFRESH_SECRET;

const getAccessExpiresIn = () => env.JWT_EXPIRES_IN;
const getRefreshExpiresIn = () => env.JWT_REFRESH_EXPIRES_IN;

const buildPayload = (user) => ({
  id: user.id,
  email: user.email,
  role: user.role,
});

const signToken = (payload, secret, expiresIn) =>
  jwt.sign(payload, secret, {
    expiresIn,
  });

export const generateAccessToken = (user) =>
  signToken(buildPayload(user), getAccessSecret(), getAccessExpiresIn());

export const generateRefreshToken = (user) =>
  signToken(buildPayload(user), getRefreshSecret(), getRefreshExpiresIn());

export const verifyAccessToken = (token) => jwt.verify(token, getAccessSecret());

export const verifyRefreshToken = (token) => jwt.verify(token, getRefreshSecret());
