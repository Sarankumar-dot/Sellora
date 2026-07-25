import express from 'express';

import {
  createCategory,
  getCategory,
  getCategoryById,
  updateCategoryById,
} from '../controllers/category.controller.js';

import { verifyToken, authorize } from '../middleware/auth.middleware.js';

const categoryRouter = express.Router();

categoryRouter.post('/', verifyToken, authorize('admin'), createCategory);
categoryRouter.get('/', verifyToken, authorize('admin'), getCategory);
categoryRouter.get('/:id', verifyToken, authorize('admin'), getCategoryById);
categoryRouter.put('/:id', verifyToken, authorize('admin'), updateCategoryById);
export default categoryRouter;
