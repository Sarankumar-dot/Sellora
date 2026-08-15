import { apiClient, unwrapResponse } from './client';

export const getCategories = async () => {
  const response = await apiClient.get('/categories');
  return unwrapResponse(response);
};
