import express from 'express';
import {
  register,
  login,
  refreshToken,
  logout,
  listSessions,
  logoutAll,
  getMe,
  forgotPassword,
  resetPassword,
  changePassword,
} from '../controllers/auth.controller.js';
import validate from '../middleware/validation.middleware.js';
import { verifyToken } from '../middleware/auth.middleware.js';
import {
  registerSchema,
  loginSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
  changePasswordSchema,
} from '../validations/auth.validation.js';

const router = express.Router();

router.post('/register', validate({ body: registerSchema }), register);
router.post('/login', validate({ body: loginSchema }), login);
router.post('/refresh-token', refreshToken);
router.post('/logout', logout);
router.get('/sessions', verifyToken, listSessions);
router.post('/logout-all', verifyToken, logoutAll);
router.get('/me', verifyToken, getMe);
router.post('/forgot-password', validate({ body: forgotPasswordSchema }), forgotPassword);
router.post('/reset-password', validate({ body: resetPasswordSchema }), resetPassword);
router.put(
  '/change-password',
  verifyToken,
  validate({ body: changePasswordSchema }),
  changePassword
);

export default router;
