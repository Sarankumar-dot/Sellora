import Joi from 'joi';
import { createSchema } from './common.validation.js';

const roleValidator = Joi.string().valid('customer', 'seller', 'admin').required().messages({
  'any.only': 'Role must be one of: customer, seller, admin',
  'string.empty': 'Role is required',
  'any.required': 'Role is required',
});

const verificationStatusValidator = Joi.boolean().required().messages({
  'boolean.base': 'isVerified must be a boolean',
  'any.required': 'isVerified is required',
});

export const updateUserRoleSchema = createSchema({
  role: roleValidator,
});

export const updateVerificationSchema = createSchema({
  isVerified: verificationStatusValidator,
});
