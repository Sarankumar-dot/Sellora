import {
  checkoutService,
  getMyOrdersService,
  getOrderByIdService,
} from '../services/order.service.js';
import asyncHandler from '../utils/asyncHandler.js';
import ApiResponse from '../utils/ApiResponse.js';

export const checkout = asyncHandler(async (req, res) => {
  const order = await checkoutService(req.user.id);

  return res.status(201).json(new ApiResponse(201, order, 'Order placed successfully'));
});

export const getMyOrders = asyncHandler(async (req, res) => {
  const orders = await getMyOrdersService(req.user.id);

  return res.status(200).json(new ApiResponse(200, orders, 'Orders fetched successfully'));
});

export const getOrderById = asyncHandler(async (req, res) => {
  const order = await getOrderByIdService(req.params.id, req.user.id);

  return res.status(200).json(new ApiResponse(200, order, 'Order fetched successfully'));
});
