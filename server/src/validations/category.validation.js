import Joi from 'joi';
import {
  createSchema,
  nameValidator,
  idValidator,
  descriptionValidator,
} from './common.validation.js';

const categoryNameValidator = nameValidator('Category Name').max(50);

export const createCategorySchema = createSchema({
  name: categoryNameValidator,
  description: descriptionValidator('Category Description'),
});

export const updateCategorySchema = createCategorySchema;

export const categoryIdParamSchema = createSchema({
  id: idValidator,
});
