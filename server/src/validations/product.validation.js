import Joi from 'joi';
import {
  createSchema,
  idValidator,
  nameValidator,
  descriptionValidator,
  positiveNumberValidator,
  nonNegativeIntegerValidator,
  pageValidator,
  limitValidator,
  searchValidator,
} from './common.validation.js';

const productSortValidator = Joi.string()
  .valid('price', '-price', 'name', '-name', 'createdAt', '-createdAt')
  .optional()
  .messages({
    'any.only': 'Sort must be one of: price, -price, name, -name, createdAt, -createdAt',
  });

const productImageSchema = Joi.object({
  url: Joi.string().uri().required().messages({
    'string.uri': 'Image URL must be a valid URL',
    'string.empty': 'Image URL is required',
    'any.required': 'Image URL is required',
  }),
  displayOrder: Joi.number().integer().min(0).optional().messages({
    'number.base': 'Display order must be an integer',
    'number.integer': 'Display order must be an integer',
    'number.min': 'Display order must be 0 or greater',
  }),
});

const imagesValidator = Joi.array().items(productImageSchema).min(1).max(10).required().messages({
  'array.min': 'A product must have at least 1 image',
  'array.max': 'A product can have at most 10 images',
  'any.required': 'Product images are required',
});

export const createProductSchema = createSchema({
  name: nameValidator('Product Name'),
  description: descriptionValidator('Product Description', {
    required: true,
    min: 10,
    max: 1000,
  }),
  price: positiveNumberValidator,
  stock: nonNegativeIntegerValidator,
  categoryId: idValidator,
  images: imagesValidator,
});

export const updateProductSchema = createProductSchema;

export const productQuerySchema = createSchema({
  page: pageValidator,
  limit: limitValidator,
  search: searchValidator,
  categoryId: idValidator.optional(),
  sort: productSortValidator,
});

