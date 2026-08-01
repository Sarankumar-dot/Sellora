import Joi from 'joi';
import { createSchema } from './common.validation.js';

const orderStatusValidator = Joi.string()
  .valid('PLACED', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'CANCELLED')
  .required()
  .messages({
    'any.only': 'Order status must be one of: PLACED, PROCESSING, SHIPPED, DELIVERED, CANCELLED',
    'string.empty': 'Order status is required',
    'any.required': 'Order status is required',
  });

export const updateOrderStatusSchema = createSchema({
  status: orderStatusValidator,
});
