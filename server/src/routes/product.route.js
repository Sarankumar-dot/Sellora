import express from 'express';

import {
  createProduct,
  getProducts,
  getProductById,
  updateProduct,
  deleteProduct,
} from '../controllers/product.controller.js';

import { verifyToken, authorize } from '../middleware/auth.middleware.js';

const productRouter = express.Router();

productRouter.post('/', verifyToken, authorize('seller'), createProduct);
productRouter.get('/', getProducts);
productRouter.get('/:id', getProductById);
productRouter.put('/:id', verifyToken, authorize('seller'), updateProduct);
productRouter.delete('/:id', verifyToken, authorize('seller'), deleteProduct);

export default productRouter;
