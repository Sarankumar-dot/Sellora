import Joi from 'joi';
import {
  createSchema,
  nameValidator,
  descriptionValidator,
  requiredStringValidator,
} from './common.validation.js';

const gstNumberValidator = Joi.string()
  .trim()
  .uppercase()
  .required()
  .pattern(/^\d{2}[A-Z]{5}\d{4}[A-Z][A-Z\d][Z][A-Z\d]$/)
  .messages({
    'string.empty': 'GST Number is required',
    'string.pattern.base': 'GST Number must be a valid GST number',
    'any.required': 'GST Number is required',
  });

const panNumberValidator = Joi.string()
  .trim()
  .uppercase()
  .required()
  .pattern(/^[A-Z]{5}\d{4}[A-Z]$/)
  .messages({
    'string.empty': 'PAN Number is required',
    'string.pattern.base': 'PAN Number must be a valid PAN number',
    'any.required': 'PAN Number is required',
  });

const addressValidator = requiredStringValidator('Address').min(10).max(255).messages({
  'string.min': 'Address must be at least 10 characters long',
  'string.max': 'Address must be at most 255 characters long',
});

const logoValidator = Joi.string().trim().uri().allow('', null).optional().messages({
  'string.uri': 'Logo must be a valid URI',
});

export const createSellerSchema = createSchema({
  storeName: nameValidator('Store Name'),
  gstNumber: gstNumberValidator,
  panNumber: panNumberValidator,
  address: addressValidator,
  description: descriptionValidator('Store Description'),
  logo: logoValidator,
});

export const updateSellerSchema = createSellerSchema;
