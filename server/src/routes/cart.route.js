import express from 'express';
import { verifyToken, authorize } from '../middleware/auth.middleware.js';
import { addToCart, getCart, updateCart, deleteCart } from '../controllers/cart.controller.js';
const cartRouter = express.Router();

cartRouter.post('/', verifyToken, addToCart);
cartRouter.get('/', verifyToken, getCart);
cartRouter.put('/:id', verifyToken, updateCart);
cartRouter.delete('/:id', verifyToken, deleteCart);

export default cartRouter;
