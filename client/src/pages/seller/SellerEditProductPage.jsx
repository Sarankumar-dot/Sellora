import { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '../../api/client';

const productSchema = z.object({
  name: z.string().min(3, 'Product name must be at least 3 characters'),
  description: z.string().min(10, 'Description must be at least 10 characters').max(1000, 'Description maximum 1000 characters'),
  price: z.coerce.number().positive('Price must be a positive number'),
  stock: z.coerce.number().int('Stock must be a non-negative integer').min(0, 'Stock cannot be negative'),
  categoryId: z.coerce.number().positive('Please select a valid category'),
});

const SAMPLE_IMAGE_PRESETS = [
  { name: 'Ceramic Vase', url: 'https://images.unsplash.com/photo-1578749556568-bc2c40e68b61?auto=format&fit=crop&w=600&q=80' },
  { name: 'Brass Lamp', url: 'https://images.unsplash.com/photo-1507473885765-e6ed057f782c?auto=format&fit=crop&w=600&q=80' },
  { name: 'Linen Throw', url: 'https://images.unsplash.com/photo-1584100936595-c0654b55a2e2?auto=format&fit=crop&w=600&q=80' },
  { name: 'Wooden Chair', url: 'https://images.unsplash.com/photo-1567538096630-e0c55bd6374c?auto=format&fit=crop&w=600&q=80' },
];

export default function SellerEditProductPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [submitError, setSubmitError] = useState(null);

  const [images, setImages] = useState([]);
  const [newImageUrl, setNewImageUrl] = useState('');
  const [imageError, setImageError] = useState('');

  // Fetch Categories
  const { data: categories = [] } = useQuery({
    queryKey: ['categories'],
    queryFn: async () => {
      const response = await apiClient.get('/categories');
      return response.data;
    },
  });

  // Fetch Product Details
  const { data: product, isLoading: isLoadingProduct } = useQuery({
    queryKey: ['product', id],
    queryFn: async () => {
      const response = await apiClient.get(`/products/${id}`);
      return response.data;
    },
  });

  const { register, handleSubmit, reset, formState: { errors } } = useForm({
    resolver: zodResolver(productSchema),
  });

  useEffect(() => {
    if (product) {
      reset({
        name: product.name,
        description: product.description,
        price: product.price,
        stock: product.stock,
        categoryId: product.category_id,
      });

      if (product.images) {
        setImages(
          product.images.map((img, idx) => ({
            url: img.image_url || img.url,
            displayOrder: img.display_order ?? idx,
          }))
        );
      }
    }
  }, [product, reset]);

  const updateProductMutation = useMutation({
    mutationFn: async (data) => {
      const response = await apiClient.put(`/products/${id}`, data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['all-products-for-seller'] });
      queryClient.invalidateQueries({ queryKey: ['product', id] });
      navigate('/seller/products');
    },
    onError: (error) => {
      setSubmitError(error.response?.data?.message || 'Failed to update product. Please verify all inputs.');
    }
  });

  const handleAddImage = (urlToAdd) => {
    const targetUrl = urlToAdd || newImageUrl.trim();
    if (!targetUrl) {
      setImageError('Please enter an image URL.');
      return;
    }

    try {
      new URL(targetUrl);
    } catch {
      setImageError('Please enter a valid HTTP/HTTPS image URL.');
      return;
    }

    if (images.length >= 10) {
      setImageError('Maximum 10 images allowed.');
      return;
    }

    setImages([...images, { url: targetUrl, displayOrder: images.length }]);
    setNewImageUrl('');
    setImageError('');
  };

  const handleRemoveImage = (index) => {
    const updated = images.filter((_, idx) => idx !== index).map((img, idx) => ({ ...img, displayOrder: idx }));
    setImages(updated);
  };

  const onSubmit = (data) => {
    setSubmitError(null);
    if (images.length === 0) {
      setImageError('A product must have at least 1 image.');
      return;
    }

    const payload = {
      ...data,
      images: images.map((img, idx) => ({ url: img.url, displayOrder: idx })),
    };

    updateProductMutation.mutate(payload);
  };

  if (isLoadingProduct) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <span className="material-symbols-outlined text-4xl text-primary animate-spin">progress_activity</span>
          <p className="font-body-md text-on-surface-variant">Loading product details...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Top Header */}
      <div className="flex items-center justify-between border-b border-surface-variant pb-6">
        <div>
          <Link to="/seller/products" className="text-on-surface-variant hover:text-primary text-xs font-label-md uppercase tracking-wider flex items-center gap-1 mb-2">
            <span className="material-symbols-outlined text-sm">arrow_back</span>
            <span>Back to Products</span>
          </Link>
          <h1 className="font-display-lg text-headline-lg text-primary">Edit Product #{id}</h1>
        </div>
      </div>

      {submitError && (
        <div className="p-4 bg-error-container text-on-error-container rounded-lg flex items-start gap-3">
          <span className="material-symbols-outlined">error</span>
          <p className="font-body-md text-sm">{submitError}</p>
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
        
        {/* General Info */}
        <div className="bg-surface-container-lowest p-6 md:p-8 rounded-xl border border-surface-variant shadow-ambient space-y-6">
          <h2 className="font-headline-md text-headline-md text-primary">General Information</h2>

          <div>
            <label htmlFor="name" className="block font-label-md text-label-md text-on-surface mb-2">Product Name *</label>
            <input 
              {...register('name')}
              id="name"
              type="text"
              className={`w-full px-4 py-3 bg-surface border ${errors.name ? 'border-error' : 'border-outline-variant'} rounded-lg font-body-md text-body-md focus:outline-none focus:border-primary transition-colors`}
            />
            {errors.name && <p className="text-sm text-error mt-1">{errors.name.message}</p>}
          </div>

          <div>
            <label htmlFor="description" className="block font-label-md text-label-md text-on-surface mb-2">Product Description *</label>
            <textarea 
              {...register('description')}
              id="description"
              rows={4}
              className={`w-full px-4 py-3 bg-surface border ${errors.description ? 'border-error' : 'border-outline-variant'} rounded-lg font-body-md text-body-md focus:outline-none focus:border-primary transition-colors`}
            />
            {errors.description && <p className="text-sm text-error mt-1">{errors.description.message}</p>}
          </div>

          <div>
            <label htmlFor="categoryId" className="block font-label-md text-label-md text-on-surface mb-2">Category *</label>
            <select
              {...register('categoryId')}
              id="categoryId"
              className={`w-full px-4 py-3 bg-surface border ${errors.categoryId ? 'border-error' : 'border-outline-variant'} rounded-lg font-body-md text-body-md focus:outline-none focus:border-primary transition-colors`}
            >
              <option value="">Select a category</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>{cat.name}</option>
              ))}
            </select>
            {errors.categoryId && <p className="text-sm text-error mt-1">{errors.categoryId.message}</p>}
          </div>
        </div>

        {/* Pricing & Inventory */}
        <div className="bg-surface-container-lowest p-6 md:p-8 rounded-xl border border-surface-variant shadow-ambient space-y-6">
          <h2 className="font-headline-md text-headline-md text-primary">Pricing & Stock</h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div>
              <label htmlFor="price" className="block font-label-md text-label-md text-on-surface mb-2">Price ($) *</label>
              <input 
                {...register('price')}
                id="price"
                type="number"
                step="0.01"
                className={`w-full px-4 py-3 bg-surface border ${errors.price ? 'border-error' : 'border-outline-variant'} rounded-lg font-body-md text-body-md focus:outline-none focus:border-primary transition-colors`}
              />
              {errors.price && <p className="text-sm text-error mt-1">{errors.price.message}</p>}
            </div>

            <div>
              <label htmlFor="stock" className="block font-label-md text-label-md text-on-surface mb-2">Available Stock *</label>
              <input 
                {...register('stock')}
                id="stock"
                type="number"
                className={`w-full px-4 py-3 bg-surface border ${errors.stock ? 'border-error' : 'border-outline-variant'} rounded-lg font-body-md text-body-md focus:outline-none focus:border-primary transition-colors`}
              />
              {errors.stock && <p className="text-sm text-error mt-1">{errors.stock.message}</p>}
            </div>
          </div>
        </div>

        {/* Product Images Manager */}
        <div className="bg-surface-container-lowest p-6 md:p-8 rounded-xl border border-surface-variant shadow-ambient space-y-6">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <h2 className="font-headline-md text-headline-md text-primary">Product Media</h2>
              <span className="bg-surface-container-high text-on-surface-variant text-[11px] font-label-sm px-2.5 py-0.5 rounded-full border border-outline-variant flex items-center gap-1" title="Backend upload endpoint gap">
                <span className="material-symbols-outlined text-xs text-amber-500">info</span>
                <span>Paste hosted image URL — Direct file upload coming soon</span>
              </span>
            </div>
            <p className="font-body-md text-xs text-on-surface-variant">Manage product gallery images.</p>
          </div>

          {imageError && (
            <div className="p-3 bg-error-container text-on-error-container rounded-lg text-sm font-body-md flex items-center gap-2">
              <span className="material-symbols-outlined text-sm">warning</span>
              <span>{imageError}</span>
            </div>
          )}

          <div className="flex flex-col sm:flex-row gap-3">
            <input
              type="url"
              placeholder="Paste image URL (https://...)"
              value={newImageUrl}
              onChange={(e) => setNewImageUrl(e.target.value)}
              className="flex-1 px-4 py-3 bg-surface border border-outline-variant rounded-lg font-body-md text-sm focus:outline-none focus:border-primary transition-colors"
            />
            <button
              type="button"
              onClick={() => handleAddImage()}
              className="bg-secondary text-on-secondary font-label-md text-label-md px-6 py-3 rounded-lg hover:bg-on-secondary-container transition-colors flex items-center justify-center gap-1"
            >
              <span className="material-symbols-outlined text-sm">add_photo_alternate</span>
              <span>Add URL</span>
            </button>
          </div>

          <div>
            <p className="font-label-sm text-xs text-on-surface-variant mb-2">Quick Select Sample Images:</p>
            <div className="flex flex-wrap gap-3">
              {SAMPLE_IMAGE_PRESETS.map((preset) => (
                <button
                  key={preset.name}
                  type="button"
                  onClick={() => handleAddImage(preset.url)}
                  className="flex items-center gap-2 px-3 py-1.5 bg-surface-container-low border border-outline-variant rounded-lg hover:border-primary text-xs font-label-md text-on-surface transition-colors"
                >
                  <img src={preset.url} alt={preset.name} className="w-6 h-6 rounded object-cover" />
                  <span>+ {preset.name}</span>
                </button>
              ))}
            </div>
          </div>

          {images.length > 0 && (
            <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-5 gap-4 pt-4 border-t border-surface-variant">
              {images.map((img, idx) => (
                <div key={idx} className="relative group rounded-lg overflow-hidden border border-outline-variant bg-surface-container">
                  <img src={img.url} alt={`Product thumbnail ${idx + 1}`} className="w-full h-28 object-cover" />
                  <span className="absolute top-2 left-2 bg-black/70 text-white text-[10px] px-2 py-0.5 rounded font-label-sm">
                    #{idx + 1}
                  </span>
                  <button
                    type="button"
                    onClick={() => handleRemoveImage(idx)}
                    className="absolute top-2 right-2 bg-error text-on-error p-1 rounded-full opacity-90 hover:opacity-100 transition-opacity"
                    title="Remove Image"
                  >
                    <span className="material-symbols-outlined text-xs">close</span>
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Submit Actions */}
        <div className="flex items-center justify-end gap-4">
          <Link
            to="/seller/products"
            className="px-6 py-3 font-label-md text-label-md text-on-surface-variant hover:text-primary transition-colors"
          >
            Cancel
          </Link>
          <button
            type="submit"
            disabled={updateProductMutation.isPending}
            className="bg-primary text-on-primary font-label-md text-label-md px-8 py-3.5 rounded-lg hover:bg-primary-container hover:text-on-primary-container transition-colors disabled:opacity-70 shadow-sm"
          >
            {updateProductMutation.isPending ? 'Saving Changes...' : 'Save Changes'}
          </button>
        </div>
      </form>
    </div>
  );
}
