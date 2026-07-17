import express from 'express';
import { verifyToken, authorize } from '../middleware/auth.middleware.js';
import {
  createSellerProfile,
  getSellerProfile,
  updateSellerProfile,
} from '../controllers/seller.controller.js';

const sellerRouter = express.Router();

sellerRouter.post('/profile', verifyToken, authorize('seller'), createSellerProfile);
sellerRouter.get('/profile', verifyToken, authorize('seller'), getSellerProfile);
sellerRouter.put('/profile', verifyToken, authorize('seller'), updateSellerProfile);

export default sellerRouter;
