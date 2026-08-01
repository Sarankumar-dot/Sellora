import { Router } from 'express';
import { getAllOrders, updateOrderStatus } from '../controllers/admin.controller.js';
import validate from '../middleware/validation.middleware.js';
import { verifyToken, authorize } from '../middleware/auth.middleware.js';
import { updateOrderStatusSchema } from '../validations/order.validation.js';
import { idParamSchema } from '../validations/common.validation.js';

const adminRouter = Router();

adminRouter.get('/orders', verifyToken, authorize('admin'), getAllOrders);
adminRouter.put(
  '/orders/:id/status',
  verifyToken,
  authorize('admin'),
  validate({ params: idParamSchema, body: updateOrderStatusSchema }),
  updateOrderStatus
);
export default adminRouter;
