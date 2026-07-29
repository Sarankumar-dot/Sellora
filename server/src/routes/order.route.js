import { Router } from 'express';
import { authorize, verifyToken } from '../middleware/auth.middleware.js';
import { checkout, getMyOrders, getOrderById } from '../controllers/order.controller.js';

const orderRouter = Router();

orderRouter.post('/', verifyToken, checkout);

orderRouter.get('/', verifyToken, getMyOrders);

orderRouter.get('/:id', verifyToken, getOrderById);

export default orderRouter;
