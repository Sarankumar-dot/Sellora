import jwt from 'jsonwebtoken';

const getAccessSecret = () => process.env.JWT_ACCESS_SECRET || process.env.JWT_SECRET;
const getRefreshSecret = () => process.env.JWT_REFRESH_SECRET || process.env.JWT_SECRET;

const getAccessExpiresIn = () =>
  process.env.JWT_ACCESS_EXPIRES || process.env.JWT_EXPIRES_IN || '15m';
const getRefreshExpiresIn = () => process.env.JWT_REFRESH_EXPIRES || '7d';

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
