import express from 'express';
import { addToCart, getCart, updateCart, deleteCart } from '../controllers/cart.controller.js';
import { verifyToken } from '../middleware/auth.middleware.js';
import validate from '../middleware/validation.middleware.js';
import { createCartSchema, updateCartQuantitySchema } from '../validations/cart.validation.js';
import { idParamSchema } from '../validations/common.validation.js';

const cartRouter = express.Router();

cartRouter.post('/', verifyToken, validate({ body: createCartSchema }), addToCart);
cartRouter.get('/', verifyToken, getCart);
cartRouter.put(
  '/:id',
  verifyToken,
  validate({ params: idParamSchema, body: updateCartQuantitySchema }),
  updateCart
);
cartRouter.delete('/:id', verifyToken, validate({ params: idParamSchema }), deleteCart);

export default cartRouter;
