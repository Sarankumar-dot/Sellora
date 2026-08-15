import { apiClient, unwrapResponse } from './client';

export const getProducts = async (params = {}) => {
  const response = await apiClient.get('/products', { params });
  return unwrapResponse(response);
};

export const getProductById = async (id) => {
  const response = await apiClient.get(`/products/${id}`);
  return unwrapResponse(response);
};

export const createProduct = async (payload) => {
  const response = await apiClient.post('/products', payload);
  return unwrapResponse(response);
};
