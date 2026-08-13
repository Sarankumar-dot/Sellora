import { findAllOrders, findOrderByIdForAdmin, updateOrderStatus } from '../models/order.model.js';
import ApiError from '../errors/ApiError.js';

export const getAllOrdersService = async () => {
  return await findAllOrders();
};

export const updateOrderStatusService = async (orderId, status) => {
  const order = await findOrderByIdForAdmin(orderId);

  if (!order) {
    throw new ApiError(404, 'Order not found');
  }

  const validTransitions = {
    PENDING: ['PLACED', 'CANCELLED'],
    PLACED: ['SHIPPED', 'CANCELLED'],
    SHIPPED: ['DELIVERED'],
    DELIVERED: [],
    CANCELLED: [],
  };

  if (!validTransitions[order.status].includes(status)) {
    throw new ApiError(400, `Cannot change order status from ${order.status} to ${status}`);
  }

  await updateOrderStatus(orderId, status);

  return {
    orderId,
    oldStatus: order.status,
    newStatus: status,
  };
};
