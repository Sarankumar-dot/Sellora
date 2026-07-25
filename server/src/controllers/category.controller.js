import asyncHandler from '../utils/asyncHandler.js';
import ApiResponse from '../utils/ApiResponse.js';
import {
  createCategoryService,
  getCategoryService,
  getCategoryByIdService,
  updateCategoryByIdService,
} from '../services/category.service.js';

export const createCategory = asyncHandler(async (req, res) => {
  const category = await createCategoryService(req.body);

  return res.status(201).json(new ApiResponse(201, category, 'Category created successfully'));
});

export const getCategory = asyncHandler(async (req, res) => {
  const getCat = await getCategoryService();

  return res.status(200).json(new ApiResponse(200, getCat, 'All categories fetched successfully'));
});

export const getCategoryById = asyncHandler(async (req, res) => {
  const category = await getCategoryByIdService(req.params.id);

  return res.status(200).json(new ApiResponse(200, category, 'category fetched successfully'));
});

export const updateCategoryById = asyncHandler(async (req, res) => {
  const updatedCategory = await updateCategoryByIdService(req.body, req.params.id);

  return res
    .status(200)
    .json(new ApiResponse(200, updatedCategory, 'Category updated successfully'));
});
