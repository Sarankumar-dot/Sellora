import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient, unwrapResponse } from '../api/client';
import { useAuth } from '../context/AuthContext';

const normalizeCartItem = (item) => ({
  id: item.cartId ?? item.id,
  cartId: item.cartId ?? item.id,
  productId: item.productId,
  productName: item.productName,
  price: Number(item.price),
  image_url: item.image_url,
  quantity: Number(item.quantity),
  subtotal: Number(item.subtotal ?? item.price * item.quantity),
});

export const useCart = () => {
  const queryClient = useQueryClient();
  const { isAuthenticated } = useAuth();

  const { data: cartItems = [], isLoading, error } = useQuery({
    queryKey: ['cart'],
    queryFn: async () => {
      const response = await apiClient.get('/cart');
      const data = unwrapResponse(response);
      return Array.isArray(data) ? data.map(normalizeCartItem) : [];
    },
    enabled: isAuthenticated,
  });

  const addToCartMutation = useMutation({
    mutationFn: async ({ productId, quantity }) => {
      const response = await apiClient.post('/cart', { productId, quantity });
      return unwrapResponse(response);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cart'] });
    },
  });

  const updateCartItemMutation = useMutation({
    mutationFn: async ({ id, quantity }) => {
      const response = await apiClient.put(`/cart/${id}`, { quantity });
      return unwrapResponse(response);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cart'] });
    },
  });

  const removeCartItemMutation = useMutation({
    mutationFn: async (id) => {
      const response = await apiClient.delete(`/cart/${id}`);
      return unwrapResponse(response);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cart'] });
    },
  });

  const subtotal = cartItems.reduce(
    (sum, item) => sum + (item.subtotal || item.price * item.quantity),
    0
  );
  const totalItems = cartItems.reduce((sum, item) => sum + item.quantity, 0);

  return {
    cartItems,
    isLoading: isAuthenticated ? isLoading : false,
    error,
    subtotal,
    totalItems,
    addToCart: addToCartMutation.mutateAsync,
    updateQuantity: updateCartItemMutation.mutateAsync,
    removeFromCart: removeCartItemMutation.mutateAsync,
    isAdding: addToCartMutation.isPending,
    isUpdating: updateCartItemMutation.isPending,
    isRemoving: removeCartItemMutation.isPending,
  };
};
