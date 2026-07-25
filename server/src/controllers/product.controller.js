import asyncHandler from '../utils/asyncHandler.js';
import ApiResponse from '../utils/ApiResponse.js';
import {
  createProductService,
  getProductsService,
  getProductByIdService,
  updateProductService,
  deleteProductService,
} from '../services/product.service.js';

export const createProduct = asyncHandler(async (req, res) => {
  const product = await createProductService(req.user.id, req.body);

  return res.status(201).json(new ApiResponse(201, product, 'Product created successfully'));
});

export const getProducts = asyncHandler(async (req, res) => {
  const data = await getProductsService(req.query);

  return res.status(200).json(new ApiResponse(200, data, 'Products fetched successfully'));
});

export const getProductById = asyncHandler(async (req, res) => {
  const product = await getProductByIdService(req.params.id);

  return res.status(200).json(new ApiResponse(200, product, 'Product fetched successfully'));
});

export const updateProduct = asyncHandler(async (req, res) => {
  const updatedProduct = await updateProductService(req.user.id, req.params.id, req.body);

  return res.status(200).json(new ApiResponse(200, updatedProduct, 'Product updated successfully'));
});

export const deleteProduct = asyncHandler(async (req, res) => {
  await deleteProductService(req.user.id, req.params.id);

  return res.status(200).json(new ApiResponse(200, null, 'Product deleted successfully'));
});
