import { Router } from 'express';
import { checkout, getMyOrders, getOrderById } from '../controllers/order.controller.js';
import { verifyToken } from '../middleware/auth.middleware.js';
import validate from '../middleware/validation.middleware.js';
import { idParamSchema } from '../validations/common.validation.js';

const orderRouter = Router();

orderRouter.post('/', verifyToken, checkout);

orderRouter.get('/', verifyToken, getMyOrders);

orderRouter.get('/:id', verifyToken, validate({ params: idParamSchema }), getOrderById);

export default orderRouter;
