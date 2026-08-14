import Razorpay from 'razorpay';
import pool from '../config/db.config.js';
import env from '../config/env.config.js';
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

const razorpay = new Razorpay({
  key_id: env.RAZORPAY_KEY_ID,
  key_secret: env.RAZORPAY_KEY_SECRET,
});

export const checkoutService = async (userId, shippingAddress) => {
  const connection = await pool.getConnection();

  try {
    await connection.beginTransaction();

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

    const orderId = await createOrder(userId, totalAmount, shippingAddress, connection, {
      status: 'PENDING',
    });

    // Create Razorpay order (amount in paise) using the actual order ID as the receipt
    const razorpayOrder = await razorpay.orders.create({
      amount: Math.round(totalAmount * 100),
      currency: 'INR',
      receipt: `sellora_${orderId}`,
    });

    // Update the DB order with the Razorpay order ID
    await connection.execute(`UPDATE orders SET razorpay_order_id = ? WHERE id = ?`, [razorpayOrder.id, orderId]);

    for (const item of cartItems) {
      await createOrderItem(orderId, item.product_id, item.quantity, item.price, connection);

      await reduceProductStock(item.product_id, item.quantity, connection);
    }

    await clearCart(userId, connection);

    await connection.commit();

    return {
      orderId,
      totalAmount,
      status: 'PENDING',
      paymentStatus: 'PENDING',
      razorpayOrderId: razorpayOrder.id,
      razorpayKeyId: env.RAZORPAY_KEY_ID,
      amount: Math.round(totalAmount * 100),
      currency: 'INR',
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
    paymentStatus: order[0].payment_status,
    shippingAddress: {
      name: order[0].shipping_name,
      address: order[0].shipping_address,
      city: order[0].shipping_city,
      state: order[0].shipping_state,
      pincode: order[0].shipping_pincode,
      phone: order[0].shipping_phone,
    },
    createdAt: order[0].created_at,
    items: order.map((item) => ({
      productId: item.product_id,
      productName: item.product_name,
      price: item.price,
      quantity: item.quantity,
    })),
  };
};

