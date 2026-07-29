import {
  addToCartService,
  getCartService,
  updateCartService,
  deleteCartService,
} from '../services/cart.service.js';
import ApiResponse from '../utils/ApiResponse.js';
import asyncHandler from '../utils/asyncHandler.js';

export const addToCart = asyncHandler(async (req, res) => {
  const { productId, quantity } = req.body;
  const result = await addToCartService(req.user.id, productId, quantity);

  return res.status(201).json(new ApiResponse(200, result, 'item added to cart successfully'));
});

export const getCart = asyncHandler(async (req, res) => {
  const cart = await getCartService(req.user.id);

  return res.status(200).json(new ApiResponse(200, cart, 'Cart fetched successfully'));
});

export const updateCart = asyncHandler(async (req, res) => {
  const { quantity } = req.body;

  const result = await updateCartService(req.user.id, req.params.id, quantity);

  return res.status(200).json(new ApiResponse(200, result, 'Cart updated successfully'));
});

export const deleteCart = asyncHandler(async (req, res) => {
  await deleteCartService(req.user.id, req.params.id);

  return res.status(200).json(new ApiResponse(200, null, 'Item removed from cart successfully'));
});
