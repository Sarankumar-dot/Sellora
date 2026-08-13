import { Router } from 'express';
import { checkout, getMyOrders, getOrderById } from '../controllers/order.controller.js';
import { verifyToken } from '../middleware/auth.middleware.js';
import validate from '../middleware/validation.middleware.js';
import { idParamSchema } from '../validations/common.validation.js';
import { checkoutSchema } from '../validations/order.validation.js';

const orderRouter = Router();

orderRouter.post('/', verifyToken, validate({ body: checkoutSchema }), checkout);

orderRouter.get('/', verifyToken, getMyOrders);

orderRouter.get('/:id', verifyToken, validate({ params: idParamSchema }), getOrderById);

export default orderRouter;

