import pool from '../config/db.config.js';
import ApiError from '../errors/ApiError.js';
import {
  getCartItemsForCheckout,
  createOrder,
  createOrderItem,
  reduceProductStock,
  clearCart,
  findOrdersByUserId,
  findOrderById,
} from '../models/order.model.js';

export const checkoutService = async (userId) => {
  const connection = await pool.getConnection();

  try {
    await connection.beginTransaction();

    // Remaining code goes here
    const cartItems = await getCartItemsForCheckout(userId, connection);

    if (cartItems.length === 0) {
      throw new ApiError(400, 'Cart is empty');
    }

    let totalAmount = 0;

    for (const item of cartItems) {
      if (!item.is_active) {
        throw new ApiError(400, 'One or more products are inactive');
      }

      if (item.quantity > item.stock) {
        throw new ApiError(400, 'Insufficient stock for one or more products');
      }

      totalAmount += item.price * item.quantity;
    }

    const orderId = await createOrder(userId, totalAmount, connection);

    for (const item of cartItems) {
      await createOrderItem(orderId, item.product_id, item.quantity, item.price, connection);

      await reduceProductStock(item.product_id, item.quantity, connection);
    }

    await clearCart(userId, connection);

    await connection.commit();

    return {
      orderId,
      totalAmount,
      status: 'PLACED',
    };
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
};

export const getMyOrdersService = async (userId) => {
  const orders = await findOrdersByUserId(userId);

  if (orders.length === 0) {
    throw new ApiError(404, 'No orders found');
  }

  return orders;
};

export const getOrderByIdService = async (orderId, userId) => {
  const order = await findOrderById(orderId, userId);

  if (order.length === 0) {
    throw new ApiError(404, 'Order not found');
  }

  // Format the response
  return {
    orderId: order[0].order_id,
    totalAmount: order[0].total_amount,
    status: order[0].status,
    createdAt: order[0].created_at,
    items: order.map((item) => ({
      productId: item.product_id,
      productName: item.product_name,
      price: item.price,
      quantity: item.quantity,
    })),
  };
};
