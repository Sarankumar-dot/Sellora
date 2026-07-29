import { Router } from 'express';
import { verifyToken, authorize } from '../middleware/auth.middleware.js';
import { getAllOrders, updateOrderStatus } from '../controllers/admin.controller.js';

const adminRouter = Router();

adminRouter.get('/orders', verifyToken, authorize('admin'), getAllOrders);
adminRouter.put('/orders/:id/status', verifyToken, authorize('admin'), updateOrderStatus);
export default adminRouter;
