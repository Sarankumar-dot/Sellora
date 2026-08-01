import express from 'express';
import validate from '../middleware/validation.middleware.js';
import { verifyToken, authorize } from '../middleware/auth.middleware.js';
import {
  createSellerProfile,
  getSellerProfile,
  updateSellerProfile,
} from '../controllers/seller.controller.js';
import { createSellerSchema, updateSellerSchema } from '../validations/seller.validation.js';

const sellerRouter = express.Router();

sellerRouter.post(
  '/profile',
  verifyToken,
  validate({ body: createSellerSchema }),
  createSellerProfile
);
sellerRouter.get('/profile', verifyToken, authorize('seller'), getSellerProfile);
sellerRouter.put(
  '/profile',
  verifyToken,
  authorize('seller'),
  validate({ body: updateSellerSchema }),
  updateSellerProfile
);

export default sellerRouter;
