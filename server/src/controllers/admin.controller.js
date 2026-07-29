import asyncHandler from '../utils/asyncHandler.js';
import ApiResponse from '../utils/ApiResponse.js';
import { getAllOrdersService, updateOrderStatusService } from '../services/admin.service.js';

export const getAllOrders = asyncHandler(async (req, res) => {
  const orders = await getAllOrdersService();

  return res.status(200).json(new ApiResponse(200, orders, 'Orders fetched successfully'));
});

export const updateOrderStatus = asyncHandler(async (req, res) => {
  const result = await updateOrderStatusService(req.params.id, req.body.status);

  return res.status(200).json(new ApiResponse(200, result, 'Order status updated successfully'));
});
