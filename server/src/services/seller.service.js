import ApiError from '../errors/ApiError.js';
import {
  insertSellerProfile,
  findSellerByUserId,
  updateSellerProfileInDB,
} from '../models/seller.model.js';

const createSellerProfileService = async (data) => {
  const { user_id } = data;

  const existingSeller = await findSellerByUserId(user_id);

  if (existingSeller) {
    throw new ApiError(409, 'Seller profile already exists');
  }

  const sellerId = await insertSellerProfile(data);

  return {
    id: sellerId,
    ...data,
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

  await updateSellerProfileInDB(data);

  return {
    ...existingSeller,
    ...data,
  };
};

export { createSellerProfileService, getSellerProfileService, updateSellerProfileService };
