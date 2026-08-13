import asyncHandler from '../utils/asyncHandler.js';
import ApiResponse from '../utils/ApiResponse.js';
import { verifyPaymentService } from '../services/payment.service.js';

export const verifyPayment = asyncHandler(async (req, res) => {
  const { razorpayOrderId, razorpayPaymentId, razorpaySignature } = req.body;

  const result = await verifyPaymentService(req.user.id, razorpayOrderId, razorpayPaymentId, razorpaySignature);

  return res.status(200).json(new ApiResponse(200, result, 'Payment verified successfully'));
});
