import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient, unwrapResponse } from '../../api/client';

export default function SellerProductsPage() {
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState('');
  const [deletingId, setDeletingId] = useState(null);

  // Fetch Seller Profile to get seller.id (DB row — snake_case: id, store_name, ...)
  const { data: profile, isLoading: isLoadingProfile } = useQuery({
    queryKey: ['seller-profile'],
    queryFn: async () => {
      const response = await apiClient.get('/seller/profile');
      return unwrapResponse(response);
    },
  });

  // BACKEND GAP: GET /products limit is capped at 100 by Joi validation (common.validation.js).
  // Client-side seller isolation (filtering by seller_id) breaks once total platform products exceed 100.
  // A real server-side sellerId filter on GET /products is needed for correctness at scale.
  // Using limit=100 as the max permitted value until that endpoint is implemented.
  const { data: productsData, isLoading: isLoadingProducts } = useQuery({
    queryKey: ['all-products-for-seller'],
    queryFn: async () => {
      const response = await apiClient.get('/products', { params: { limit: 100 } });
      return unwrapResponse(response);
    },
  });

  // Delete product mutation
  const deleteProductMutation = useMutation({
    mutationFn: async (productId) => {
      await apiClient.delete(`/products/${productId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['all-products-for-seller'] });
      setDeletingId(null);
    },
    onError: (err) => {
      alert(err.response?.data?.message || 'Failed to delete product.');
      setDeletingId(null);
    }
  });

  const handleDelete = (productId) => {
    if (window.confirm('Are you sure you want to deactivate/delete this product?')) {
      setDeletingId(productId);
      deleteProductMutation.mutate(productId);
    }
  };

  const sellerProducts = (productsData?.products || []).filter(
    (p) => p.seller_id === profile?.id
  );

  const filteredProducts = sellerProducts.filter((p) =>
    p.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const isLoading = isLoadingProfile || isLoadingProducts;

  if (isLoading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <span className="material-symbols-outlined text-4xl text-primary animate-spin">progress_activity</span>
          <p className="font-body-md text-on-surface-variant">Loading your products catalog...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-display-lg text-headline-lg text-primary">Products Catalog</h1>
          <p className="font-body-md text-sm text-on-surface-variant mt-1">
            Manage your store's inventory, pricing, and product listings.
          </p>
        </div>

        <Link
          to="/seller/products/new"
          className="bg-primary text-on-primary font-label-md text-label-md px-6 py-3 rounded-lg hover:bg-primary-container hover:text-on-primary-container transition-colors inline-flex items-center justify-center gap-2 shadow-sm self-start sm:self-auto"
        >
          <span className="material-symbols-outlined text-sm">add</span>
          <span>Add New Product</span>
        </Link>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-surface-container-lowest p-4 rounded-xl border border-surface-variant flex items-center gap-4">
        <div className="relative flex-1">
          <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-outline text-xl">search</span>
          <input
            type="text"
            placeholder="Search products by name..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-surface border border-outline-variant rounded-lg font-body-md text-sm focus:outline-none focus:border-primary transition-colors text-on-surface"
          />
        </div>
        <span className="font-label-sm text-xs text-on-surface-variant whitespace-nowrap">
          {filteredProducts.length} items
        </span>
      </div>

      {/* Products Table */}
      <div className="bg-surface-container-lowest rounded-xl border border-surface-variant shadow-ambient overflow-hidden">
        {filteredProducts.length === 0 ? (
          <div className="text-center py-16 px-6">
            <span className="material-symbols-outlined text-5xl text-outline mb-3">inventory_2</span>
            <h3 className="font-headline-md text-headline-md text-primary mb-2">No products found</h3>
            <p className="font-body-md text-sm text-on-surface-variant max-w-sm mx-auto mb-6">
              {searchTerm ? 'No products match your search query.' : 'You have not added any products to your catalog yet.'}
            </p>
            {!searchTerm && (
              <Link
                to="/seller/products/new"
                className="bg-primary text-on-primary font-label-md text-label-md px-6 py-3 rounded-lg hover:opacity-90 inline-block"
              >
                Add Your First Product
              </Link>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left font-body-md border-collapse">
              <thead>
                <tr className="border-b border-surface-variant bg-surface-bright text-on-surface-variant font-label-sm text-xs uppercase tracking-wider">
                  <th className="py-4 px-6">Product</th>
                  <th className="py-4 px-6">Price</th>
                  <th className="py-4 px-6">Stock</th>
                  <th className="py-4 px-6">Category</th>
                  <th className="py-4 px-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-surface-variant text-sm">
                {filteredProducts.map((product) => {
                  const mainImage = product.images?.[0]?.image_url || 'https://via.placeholder.com/80';
                  return (
                    <tr key={product.id} className="hover:bg-surface-container-low transition-colors">
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-4">
                          <img
                            src={mainImage}
                            alt={product.name}
                            className="w-14 h-14 rounded-lg object-cover bg-surface-container border border-outline-variant flex-shrink-0"
                          />
                          <div>
                            <p className="font-label-md text-label-md text-primary font-semibold line-clamp-1">{product.name}</p>
                            <p className="font-body-md text-xs text-on-surface-variant line-clamp-1 max-w-xs">{product.description}</p>
                          </div>
                        </div>
                      </td>
                      <td className="py-4 px-6 font-semibold text-primary">
                        ${parseFloat(product.price).toFixed(2)}
                      </td>
                      <td className="py-4 px-6">
                        <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${
                          product.stock > 10
                            ? 'bg-secondary-container text-on-secondary-container'
                            : product.stock > 0
                            ? 'bg-surface-container-high text-on-surface'
                            : 'bg-error-container text-on-error-container'
                        }`}>
                          {product.stock > 0 ? `${product.stock} in stock` : 'Out of stock'}
                        </span>
                      </td>
                      <td className="py-4 px-6 text-on-surface-variant text-xs">
                        Category #{product.category_id}
                      </td>
                      <td className="py-4 px-6 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Link
                            to={`/seller/products/edit/${product.id}`}
                            className="p-2 text-on-surface-variant hover:text-primary hover:bg-surface-container rounded-lg transition-colors"
                            title="Edit Product"
                          >
                            <span className="material-symbols-outlined text-xl">edit</span>
                          </Link>
                          <button
                            onClick={() => handleDelete(product.id)}
                            disabled={deletingId === product.id}
                            className="p-2 text-on-surface-variant hover:text-error hover:bg-error-container rounded-lg transition-colors disabled:opacity-50"
                            title="Deactivate / Delete"
                          >
                            <span className="material-symbols-outlined text-xl">
                              {deletingId === product.id ? 'progress_activity' : 'delete'}
                            </span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
