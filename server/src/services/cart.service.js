import { findProductById } from '../models/product.model.js';
import ApiError from '../errors/ApiError.js';
import {
  findCartItem,
  addToCartInDB,
  updateCartQuantity,
  getCartItems,
  findCartById,
  deleteCartItem,
} from '../models/cart.model.js';

export const addToCartService = async (userId, productId, quantity) => {
  if (!quantity) {
    throw new ApiError(400, 'Quantity is required');
  }

  const product = await findProductById(productId);

  if (!product) {
    throw new ApiError(404, 'Product not found');
  }

  if (!product.is_active) {
    throw new ApiError(400, 'Product is inactive');
  }

  // Check stock against total quantity (existing + incoming)
  const existingItem = await findCartItem(userId, productId);
  const totalQuantity = (existingItem?.quantity || 0) + quantity;

  if (totalQuantity > product.stock) {
    throw new ApiError(400, 'Insufficient stock');
  }

  // Upsert: INSERT or increment quantity via ON DUPLICATE KEY UPDATE
  return await addToCartInDB(userId, productId, quantity);
};

export const getCartService = async (userId) => {
  const cart = await getCartItems(userId);

  if (cart.length === 0) {
    throw new ApiError(404, 'Cart is empty');
  }

  return cart;
};

export const updateCartService = async (userId, cartId, quantity) => {
  const cart = await findCartById(cartId);

  if (!cart) {
    throw new ApiError(404, 'Cart item not found');
  }

  if (cart.user_id !== userId) {
    throw new ApiError(403, 'Unauthorized');
  }

  const product = await findProductById(cart.product_id);

  if (!product) {
    throw new ApiError(404, 'Product not found');
  }

  if (!product.is_active) {
    throw new ApiError(400, 'Product is inactive');
  }

  if (quantity <= 0) {
    throw new ApiError(400, 'Quantity must be greater than 0');
  }

  if (quantity > product.stock) {
    throw new ApiError(400, 'Insufficient stock');
  }

  await updateCartQuantity(cartId, quantity);

  return await findCartById(cartId);
};

export const deleteCartService = async (userId, cartId) => {
  const cart = await findCartById(cartId);

  if (!cart) {
    throw new ApiError(404, 'Cart item not found');
  }

  if (cart.user_id !== userId) {
    throw new ApiError(403, 'Unauthorized');
  }

  await deleteCartItem(cartId);
};
