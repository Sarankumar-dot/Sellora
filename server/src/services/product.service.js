import pool from '../config/db.config.js';
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
import {
  insertProductImages,
  findImagesByProductId,
  findImagesByProductIds,
  deleteImagesByProductId,
} from '../models/productImage.model.js';

export const createProductService = async (userId, productData) => {
  const seller = await findSellerProfileByUserId(userId);

  if (!seller) {
    throw new ApiError(404, 'Seller profile not found');
  }

  const connection = await pool.getConnection();

  try {
    await connection.beginTransaction();

    const dbProduct = {
      seller_id: seller.id,
      name: productData.name,
      description: productData.description,
      price: productData.price,
      stock: productData.stock,
      category_id: productData.categoryId,
    };

    const productId = await createProductInDB(dbProduct);

    if (productData.images && productData.images.length > 0) {
      await insertProductImages(productId, productData.images, connection);
    }

    await connection.commit();

    const images = await findImagesByProductId(productId);

    return {
      id: productId,
      ...dbProduct,
      images,
    };
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
};

export const getProductsService = async (query) => {
  const page = Math.max(Number(query.page) || 1, 1);

  const limit = Math.min(Number(query.limit) || 10, 100);

  const offset = (page - 1) * limit;

  const search = query.search || '';

  const category = query.categoryId || null;

  const sort = query.sort || '-createdAt';

  const products = await getProductsFromDB(limit, offset, search, category, sort);

  const totalProducts = await getProductsCountFromDB(search, category);

  const totalPages = Math.ceil(totalProducts / limit);

  // Batch-fetch images for all products in one query
  const productIds = products.map((p) => p.id);
  const allImages = await findImagesByProductIds(productIds);

  // Group images by product_id
  const imageMap = new Map();

  for (const img of allImages) {
    if (!imageMap.has(img.product_id)) {
      imageMap.set(img.product_id, []);
    }

    imageMap.get(img.product_id).push({
      id: img.id,
      image_url: img.image_url,
      display_order: img.display_order,
    });
  }

  const productsWithImages = products.map((product) => ({
    ...product,
    images: imageMap.get(product.id) || [],
  }));

  return {
    products: productsWithImages,
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

  const images = await findImagesByProductId(productId);

  return {
    ...product,
    images,
  };
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

  const connection = await pool.getConnection();

  try {
    await connection.beginTransaction();

    const dbProduct = {
      name: productData.name,
      description: productData.description,
      price: productData.price,
      stock: productData.stock,
      category_id: productData.categoryId,
    };

    await updateProductInDB(productId, dbProduct);

    // Replace images: delete old, insert new
    if (productData.images !== undefined) {
      await deleteImagesByProductId(productId, connection);

      if (productData.images.length > 0) {
        await insertProductImages(productId, productData.images, connection);
      }
    }

    await connection.commit();

    const updatedProduct = await findProductById(productId);
    const images = await findImagesByProductId(productId);

    return {
      ...updatedProduct,
      images,
    };
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
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

