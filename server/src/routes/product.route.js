import express from 'express';

import {
  createProduct,
  getProducts,
  getProductById,
  updateProduct,
  deleteProduct,
} from '../controllers/product.controller.js';

import { verifyToken, authorize } from '../middleware/auth.middleware.js';
import validate from '../middleware/validation.middleware.js';
import {
  createProductSchema,
  updateProductSchema,
  productQuerySchema,
} from '../validations/product.validation.js';
import { idParamSchema } from '../validations/common.validation.js';

const productRouter = express.Router();

productRouter.post(
  '/',
  verifyToken,
  authorize('seller'),
  validate({ body: createProductSchema }),
  createProduct
);
productRouter.get('/', validate({ query: productQuerySchema }), getProducts);
productRouter.get('/:id', validate({ params: idParamSchema }), getProductById);
productRouter.put(
  '/:id',
  verifyToken,
  authorize('seller'),
  validate({ params: idParamSchema, body: updateProductSchema }),
  updateProduct
);
productRouter.delete(
  '/:id',
  verifyToken,
  authorize('seller'),
  validate({ params: idParamSchema }),
  deleteProduct
);

export default productRouter;
