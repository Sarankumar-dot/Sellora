import Joi from 'joi';
import { createSchema } from './common.validation.js';

const orderStatusValidator = Joi.string()
  .valid('PENDING', 'PLACED', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'CANCELLED')
  .required()
  .messages({
    'any.only':
      'Order status must be one of: PENDING, PLACED, PROCESSING, SHIPPED, DELIVERED, CANCELLED',
    'string.empty': 'Order status is required',
    'any.required': 'Order status is required',
  });

export const updateOrderStatusSchema = createSchema({
  status: orderStatusValidator,
});

const shippingAddressSchema = Joi.object({
  name: Joi.string().trim().min(2).max(100).required().messages({
    'string.empty': 'Shipping name is required',
    'string.min': 'Shipping name must be at least 2 characters long',
    'string.max': 'Shipping name must be at most 100 characters long',
    'any.required': 'Shipping name is required',
  }),
  address: Joi.string().trim().min(10).max(500).required().messages({
    'string.empty': 'Shipping address is required',
    'string.min': 'Shipping address must be at least 10 characters long',
    'string.max': 'Shipping address must be at most 500 characters long',
    'any.required': 'Shipping address is required',
  }),
  city: Joi.string().trim().min(2).max(100).required().messages({
    'string.empty': 'City is required',
    'string.min': 'City must be at least 2 characters long',
    'string.max': 'City must be at most 100 characters long',
    'any.required': 'City is required',
  }),
  state: Joi.string().trim().min(2).max(100).required().messages({
    'string.empty': 'State is required',
    'string.min': 'State must be at least 2 characters long',
    'string.max': 'State must be at most 100 characters long',
    'any.required': 'State is required',
  }),
  pincode: Joi.string()
    .trim()
    .pattern(/^\d{6}$/)
    .required()
    .messages({
      'string.empty': 'Pincode is required',
      'string.pattern.base': 'Pincode must be exactly 6 digits',
      'any.required': 'Pincode is required',
    }),
  phone: Joi.string()
    .trim()
    .pattern(/^\d{10}$/)
    .required()
    .messages({
      'string.empty': 'Phone number is required',
      'string.pattern.base': 'Phone number must be exactly 10 digits',
      'any.required': 'Phone number is required',
    }),
});

export const checkoutSchema = createSchema({
  shippingAddress: shippingAddressSchema.required().messages({
    'any.required': 'Shipping address is required',
    'object.base': 'Shipping address must be an object',
  }),
});

