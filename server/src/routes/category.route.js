import express from 'express';

import {
  createCategory,
  getCategory,
  getCategoryById,
  updateCategoryById,
} from '../controllers/category.controller.js';

import { verifyToken, authorize } from '../middleware/auth.middleware.js';
import validate from '../middleware/validation.middleware.js';
import { createCategorySchema, updateCategorySchema } from '../validations/category.validation.js';
import { idParamSchema } from '../validations/common.validation.js';

const categoryRouter = express.Router();

categoryRouter.post(
  '/',
  verifyToken,
  authorize('admin'),
  validate({ body: createCategorySchema }),
  createCategory
);
categoryRouter.get('/', verifyToken, authorize('admin'), getCategory);
categoryRouter.get(
  '/:id',
  verifyToken,
  authorize('admin'),
  validate({ params: idParamSchema }),
  getCategoryById
);
categoryRouter.put(
  '/:id',
  verifyToken,
  authorize('admin'),
  validate({ params: idParamSchema, body: updateCategorySchema }),
  updateCategoryById
);
export default categoryRouter;
