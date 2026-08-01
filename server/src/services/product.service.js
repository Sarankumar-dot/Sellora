import ApiError from '../errors/ApiError.js';
import {
  findSellerProfileByUserId,
  createProductInDB,
  getProductsFromDB,
  getProductsCountFromDB,
  findProductById,
  updateProductInDB,
  deleteProductInDB,
} from '../models/product.model.js';

export const createProductService = async (userId, productData) => {
  const seller = await findSellerProfileByUserId(userId);

  if (!seller) {
    throw new ApiError(404, 'Seller profile not found');
  }

  const dbProduct = {
    seller_id: seller.id,
    name: productData.name,
    description: productData.description,
    price: productData.price,
    stock: productData.stock,
    category_id: productData.categoryId,
    image_url: productData.imageUrl ?? null,
  };

  const productId = await createProductInDB(dbProduct);

  return {
    id: productId,
    ...dbProduct,
  };
};

export const getProductsService = async (query) => {
  const page = Math.max(Number(query.page) || 1, 1);

  const limit = Math.min(Number(query.limit) || 10, 100);

  const offset = (page - 1) * limit;

  const search = query.search || '';

  const category = query.category || null;

  const sort = query.sort || 'latest';

  const products = await getProductsFromDB(limit, offset, search, category, sort);

  const totalProducts = await getProductsCountFromDB(search, category);

  const totalPages = Math.ceil(totalProducts / limit);

  return {
    products,
    pagination: {
      page,
      limit,
      totalProducts,
      totalPages,
      hasNextPage: page < totalPages,
      hasPreviousPage: page > 1,
    },
  };
};

export const getProductByIdService = async (productId) => {
  const product = await findProductById(productId);

  if (!product) {
    throw new ApiError(404, 'Product not found');
  }

  return product;
};

export const updateProductService = async (userId, productId, productData) => {
  const seller = await findSellerProfileByUserId(userId);

  if (!seller) {
    throw new ApiError(404, 'Seller profile not found');
  }

  const product = await findProductById(productId);

  if (!product) {
    throw new ApiError(404, 'Product not found');
  }

  if (seller.id !== product.seller_id) {
    throw new ApiError(403, 'You are not allowed to update this product');
  }

  const dbProduct = {
    name: productData.name,
    description: productData.description,
    price: productData.price,
    stock: productData.stock,
    category_id: productData.categoryId,
    image_url: productData.imageUrl ?? null,
  };

  await updateProductInDB(productId, dbProduct);

  return await findProductById(productId);
};

export const deleteProductService = async (userId, productId) => {
  const seller = await findSellerProfileByUserId(userId);

  if (!seller) {
    throw new ApiError(404, 'Seller profile not found');
  }

  const product = await findProductById(productId);

  if (!product) {
    throw new ApiError(404, 'Product not found');
  }

  if (seller.id !== product.seller_id) {
    throw new ApiError(403, 'You are not allowed to delete this product');
  }

  await deleteProductInDB(productId);
};
