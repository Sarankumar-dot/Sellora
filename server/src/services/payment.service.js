import crypto from 'crypto';
import env from '../config/env.config.js';
import ApiError from '../errors/ApiError.js';
import {
  findOrderByRazorpayOrderId,
  updatePaymentVerification,
  updateOrderStatus,
} from '../models/order.model.js';

/**
 * Verifies the Razorpay payment signature using HMAC SHA256.
 * Razorpay's standard approach: the signature is computed over
 * `razorpay_order_id|razorpay_payment_id` using the key secret.
 */
export const verifyPaymentService = async (
  userId,
  razorpayOrderId,
  razorpayPaymentId,
  razorpaySignature
) => {
  // 1. Verify signature
  const expectedSignature = crypto
    .createHmac('sha256', env.RAZORPAY_KEY_SECRET)
    .update(`${razorpayOrderId}|${razorpayPaymentId}`)
    .digest('hex');

  if (expectedSignature !== razorpaySignature) {
    throw new ApiError(400, 'Invalid payment signature');
  }

  // 2. Look up the order by razorpay_order_id
  const order = await findOrderByRazorpayOrderId(razorpayOrderId);

  if (!order) {
    throw new ApiError(404, 'Order not found for the given Razorpay order ID');
  }

  // 3. Ownership check
  if (order.user_id !== userId) {
    throw new ApiError(403, 'You do not have permission to verify this order');
  }

  // 4. Idempotency check: if already PAID, return success without re-processing
  if (order.payment_status === 'PAID') {
    return {
      orderId: order.id,
      paymentStatus: 'PAID',
      orderStatus: order.status,
    };
  }

  // 5. Mark payment as PAID
  await updatePaymentVerification(order.id, razorpayPaymentId, 'PAID');

  // 6. Move order status from PENDING to PLACED
  if (order.status === 'PENDING') {
    await updateOrderStatus(order.id, 'PLACED');
  }

  return {
    orderId: order.id,
    paymentStatus: 'PAID',
    orderStatus: 'PLACED',
  };
};
