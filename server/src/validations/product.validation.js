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

const imageUrlValidator = Joi.string().uri().allow('', null).optional().messages({
  'string.uri': 'Image URL must be a valid URL',
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
  imageUrl: imageUrlValidator,
});

export const updateProductSchema = createProductSchema;

export const productQuerySchema = createSchema({
  page: pageValidator,
  limit: limitValidator,
  search: searchValidator,
  categoryId: idValidator.optional(),
  sort: productSortValidator,
});
