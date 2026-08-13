import Joi from 'joi';
import { createSchema } from './common.validation.js';

export const verifyPaymentSchema = createSchema({
  razorpayOrderId: Joi.string().trim().required().messages({
    'string.empty': 'Razorpay order ID is required',
    'any.required': 'Razorpay order ID is required',
  }),
  razorpayPaymentId: Joi.string().trim().required().messages({
    'string.empty': 'Razorpay payment ID is required',
    'any.required': 'Razorpay payment ID is required',
  }),
  razorpaySignature: Joi.string().trim().required().messages({
    'string.empty': 'Razorpay signature is required',
    'any.required': 'Razorpay signature is required',
  }),
});
