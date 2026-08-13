import ApiError from '../errors/ApiError.js';
import {
  insertSellerProfile,
  findSellerByUserId,
  updateSellerProfileInDB,
  updateUserRole,
  findOrdersBySellerId,
} from '../models/seller.model.js';

const createSellerProfileService = async (data) => {
  const { user_id } = data;

  const existingSeller = await findSellerByUserId(user_id);

  if (existingSeller) {
    throw new ApiError(409, 'Seller profile already exists');
  }

  const dbSeller = {
    user_id: data.user_id,
    store_name: data.storeName,
    gst_number: data.gstNumber,
    pan_number: data.panNumber,
    address: data.address,
    description: data.description,
    logo: data.logo ?? null,
  };
  const sellerId = await insertSellerProfile(dbSeller);

  await updateUserRole(data.user_id, 'seller');

  return {
    id: sellerId,
    ...dbSeller,
  };
};

const getSellerProfileService = async (userId) => {
  const seller = await findSellerByUserId(userId);

  if (!seller) {
    throw new ApiError(404, 'Seller profile not found');
  }

  return seller;
};

const updateSellerProfileService = async (data) => {
  const existingSeller = await findSellerByUserId(data.user_id);

  if (!existingSeller) {
    throw new ApiError(404, 'Seller profile not found');
  }

  const dbSeller = {
    user_id: data.user_id,
    store_name: data.storeName,
    gst_number: data.gstNumber,
    pan_number: data.panNumber,
    address: data.address,
    description: data.description,
    logo: data.logo ?? null,
  };

  await updateSellerProfileInDB(dbSeller);

  return {
    ...existingSeller,
    ...dbSeller,
  };
};

const getSellerOrdersService = async (userId) => {
  const seller = await findSellerByUserId(userId);

  if (!seller) {
    throw new ApiError(404, 'Seller profile not found');
  }

  const rows = await findOrdersBySellerId(seller.id);

  if (rows.length === 0) {
    throw new ApiError(404, 'No orders found for your products');
  }

  // Group flat rows by order_id
  const ordersMap = new Map();

  for (const row of rows) {
    if (!ordersMap.has(row.order_id)) {
      ordersMap.set(row.order_id, {
        orderId: row.order_id,
        totalAmount: row.total_amount,
        orderStatus: row.order_status,
        paymentStatus: row.payment_status,
        customerName: row.customer_name,
        createdAt: row.order_created_at,
        items: [],
      });
    }

    ordersMap.get(row.order_id).items.push({
      productId: row.product_id,
      productName: row.product_name,
      quantity: row.quantity,
      price: row.price,
    });
  }

  return Array.from(ordersMap.values());
};

export {
  createSellerProfileService,
  getSellerProfileService,
  updateSellerProfileService,
  getSellerOrdersService,
};
