import { Router } from 'express';
import { verifyPayment } from '../controllers/payment.controller.js';
import { verifyToken } from '../middleware/auth.middleware.js';
import validate from '../middleware/validation.middleware.js';
import { verifyPaymentSchema } from '../validations/payment.validation.js';

const paymentRouter = Router();

paymentRouter.post('/verify', verifyToken, validate({ body: verifyPaymentSchema }), verifyPayment);

export default paymentRouter;
