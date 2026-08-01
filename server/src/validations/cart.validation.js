import {
  createSchema,
  idValidator,
  quantityValidator,
  idParamSchema,
} from './common.validation.js';

export const createCartSchema = createSchema({
  productId: idValidator,
  quantity: quantityValidator,
});

export const updateCartQuantitySchema = createSchema({
  quantity: quantityValidator,
});
