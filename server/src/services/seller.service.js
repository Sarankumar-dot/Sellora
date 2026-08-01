import ApiError from '../errors/ApiError.js';
import {
  insertSellerProfile,
  findSellerByUserId,
  updateSellerProfileInDB,
  updateUserRole,
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

export { createSellerProfileService, getSellerProfileService, updateSellerProfileService };
