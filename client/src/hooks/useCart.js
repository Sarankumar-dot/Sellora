import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '../api/client';

export const useCart = () => {
  const queryClient = useQueryClient();

  // Fetch cart items
  const { data: cartItems = [], isLoading, error } = useQuery({
    queryKey: ['cart'],
    queryFn: async () => {
      const response = await apiClient.get('/cart');
      return response.data;
    },
  });

  // Add item to cart
  const addToCartMutation = useMutation({
    mutationFn: async ({ productId, quantity }) => {
      const response = await apiClient.post('/cart', { productId, quantity });
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cart'] });
    },
  });

  // Update cart item quantity
  const updateCartItemMutation = useMutation({
    mutationFn: async ({ id, quantity }) => {
      const response = await apiClient.put(`/cart/${id}`, { quantity });
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cart'] });
    },
  });

  // Remove item from cart
  const removeCartItemMutation = useMutation({
    mutationFn: async (id) => {
      const response = await apiClient.delete(`/cart/${id}`);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cart'] });
    },
  });

  // Calculate totals
  const subtotal = cartItems.reduce((sum, item) => sum + (item.subtotal || (item.price * item.quantity)), 0);
  const totalItems = cartItems.reduce((sum, item) => sum + item.quantity, 0);

  return {
    cartItems,
    isLoading,
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
