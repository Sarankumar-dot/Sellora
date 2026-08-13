import asyncHandler from '../utils/asyncHandler.js';
import ApiResponse from '../utils/ApiResponse.js';
import {
  createSellerProfileService,
  getSellerProfileService,
  updateSellerProfileService,
  getSellerOrdersService,
} from '../services/seller.service.js';

const createSellerProfile = asyncHandler(async (req, res) => {
  const sellerData = {
    ...req.body,
    user_id: req.user.id,
  };

  const seller = await createSellerProfileService(sellerData);

  return res.status(201).json(new ApiResponse(201, seller, 'Seller profile created successfully'));
});

const getSellerProfile = asyncHandler(async (req, res) => {
  const seller = await getSellerProfileService(req.user.id);

  return res.status(200).json(new ApiResponse(200, seller, 'Seller profile fetched successfully'));
});

const updateSellerProfile = asyncHandler(async (req, res) => {
  const sellerData = {
    ...req.body,
    user_id: req.user.id,
  };

  const seller = await updateSellerProfileService(sellerData);

  return res.status(200).json(new ApiResponse(200, seller, 'Seller profile updated successfully'));
});

const getSellerOrders = asyncHandler(async (req, res) => {
  const orders = await getSellerOrdersService(req.user.id);

  return res.status(200).json(new ApiResponse(200, orders, 'Seller orders fetched successfully'));
});

export { createSellerProfile, getSellerProfile, updateSellerProfile, getSellerOrders };
