import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { apiClient } from '../../api/client';

const categorySchema = z.object({
  name: z.string().min(2, 'Category name must be at least 2 characters'),
  description: z.string().min(5, 'Description must be at least 5 characters').max(500, 'Description maximum 500 characters'),
});

export default function AdminCategoriesPage() {
  const queryClient = useQueryClient();
  const [modalOpen, setModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [formError, setFormError] = useState(null);

  // Fetch Categories
  const { data: categories = [], isLoading } = useQuery({
    queryKey: ['categories'],
    queryFn: async () => {
      const response = await apiClient.get('/categories');
      return response.data;
    },
  });

  const { register, handleSubmit, reset, setValue, formState: { errors } } = useForm({
    resolver: zodResolver(categorySchema),
  });

  // Create Category Mutation
  const createCategoryMutation = useMutation({
    mutationFn: async (data) => {
      const response = await apiClient.post('/categories', data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] });
      closeModal();
    },
    onError: (error) => {
      setFormError(error.response?.data?.message || 'Failed to create category.');
    }
  });

  // Update Category Mutation
  const updateCategoryMutation = useMutation({
    mutationFn: async ({ id, data }) => {
      const response = await apiClient.put(`/categories/${id}`, data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] });
      closeModal();
    },
    onError: (error) => {
      setFormError(error.response?.data?.message || 'Failed to update category.');
    }
  });

  const openAddModal = () => {
    setEditingCategory(null);
    reset({ name: '', description: '' });
    setFormError(null);
    setModalOpen(true);
  };

  const openEditModal = (category) => {
    setEditingCategory(category);
    setValue('name', category.name);
    setValue('description', category.description || '');
    setFormError(null);
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setEditingCategory(null);
    setFormError(null);
    reset();
  };

  const onSubmit = (data) => {
    setFormError(null);
    if (editingCategory) {
      updateCategoryMutation.mutate({ id: editingCategory.id, data });
    } else {
      createCategoryMutation.mutate(data);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <span className="material-symbols-outlined text-4xl text-primary animate-spin">progress_activity</span>
          <p className="font-body-md text-on-surface-variant">Loading categories...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-display-lg text-headline-lg text-primary">Category Management</h1>
          <p className="font-body-md text-sm text-on-surface-variant mt-1">
            Organize catalog taxonomies for product discovery.
          </p>
        </div>

        <button
          onClick={openAddModal}
          className="bg-primary text-on-primary font-label-md text-label-md px-6 py-3 rounded-lg hover:bg-primary-container hover:text-on-primary-container transition-colors inline-flex items-center justify-center gap-2 shadow-sm self-start sm:self-auto"
        >
          <span className="material-symbols-outlined text-sm">add</span>
          <span>Add New Category</span>
        </button>
      </div>

      {/* Categories Table */}
      <div className="bg-surface-container-lowest rounded-xl border border-surface-variant shadow-ambient overflow-hidden">
        {categories.length === 0 ? (
          <div className="text-center py-16 px-6">
            <span className="material-symbols-outlined text-5xl text-outline mb-3">category</span>
            <h3 className="font-headline-md text-headline-md text-primary mb-2">No categories available</h3>
            <p className="font-body-md text-sm text-on-surface-variant max-w-sm mx-auto mb-6">
              Create your first product category taxonomy.
            </p>
            <button
              onClick={openAddModal}
              className="bg-primary text-on-primary font-label-md text-label-md px-6 py-3 rounded-lg hover:opacity-90"
            >
              Add Category
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left font-body-md border-collapse">
              <thead>
                <tr className="border-b border-surface-variant bg-surface-bright text-on-surface-variant font-label-sm text-xs uppercase tracking-wider">
                  <th className="py-4 px-6">ID</th>
                  <th className="py-4 px-6">Category Name</th>
                  <th className="py-4 px-6">Description</th>
                  <th className="py-4 px-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-surface-variant text-sm">
                {categories.map((category) => (
                  <tr key={category.id} className="hover:bg-surface-container-low transition-colors">
                    <td className="py-4 px-6 font-semibold text-primary">#{category.id}</td>
                    <td className="py-4 px-6 font-semibold text-on-surface">{category.name}</td>
                    <td className="py-4 px-6 text-on-surface-variant max-w-md line-clamp-2">
                      {category.description || '—'}
                    </td>
                    <td className="py-4 px-6 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => openEditModal(category)}
                          className="p-2 text-on-surface-variant hover:text-primary hover:bg-surface-container rounded-lg transition-colors"
                          title="Edit Category"
                        >
                          <span className="material-symbols-outlined text-xl">edit</span>
                        </button>
                        <span className="p-2 text-outline cursor-not-allowed" title="Category deletion not supported in backend v1">
                          <span className="material-symbols-outlined text-xl opacity-40">delete_forever</span>
                        </span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Backend Limitation Note */}
      <div className="p-4 bg-surface-container-high rounded-xl border border-outline-variant/30 flex items-start gap-3 text-xs text-on-surface-variant">
        <span className="material-symbols-outlined text-sm text-amber-500 mt-0.5">info</span>
        <p>
          <strong className="text-primary">Backend Gap Notice:</strong> `DELETE /categories/:id` does not exist in the backend routes (`category.route.js`). Category deletion is intentionally disabled in UI v1.
        </p>
      </div>

      {/* Add / Edit Category Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-surface-container-lowest max-w-md w-full rounded-xl p-6 md:p-8 border border-surface-variant shadow-2xl space-y-6">
            <div className="flex justify-between items-center border-b border-surface-variant pb-4">
              <h2 className="font-headline-md text-headline-md text-primary">
                {editingCategory ? 'Edit Category' : 'Add New Category'}
              </h2>
              <button onClick={closeModal} className="text-on-surface-variant p-1">
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            {formError && (
              <div className="p-3 bg-error-container text-on-error-container rounded-lg text-sm font-body-md flex items-center gap-2">
                <span className="material-symbols-outlined text-sm">error</span>
                <span>{formError}</span>
              </div>
            )}

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div>
                <label className="block font-label-md text-label-md text-on-surface mb-2" htmlFor="name">Name *</label>
                <input
                  {...register('name')}
                  id="name"
                  type="text"
                  placeholder="e.g. Ceramics & Pottery"
                  className={`w-full px-4 py-3 bg-surface border ${errors.name ? 'border-error' : 'border-outline-variant'} rounded-lg font-body-md text-sm focus:outline-none focus:border-primary transition-colors`}
                />
                {errors.name && <p className="text-sm text-error mt-1">{errors.name.message}</p>}
              </div>

              <div>
                <label className="block font-label-md text-label-md text-on-surface mb-2" htmlFor="description">Description *</label>
                <textarea
                  {...register('description')}
                  id="description"
                  rows={4}
                  placeholder="Describe this product category..."
                  className={`w-full px-4 py-3 bg-surface border ${errors.description ? 'border-error' : 'border-outline-variant'} rounded-lg font-body-md text-sm focus:outline-none focus:border-primary transition-colors`}
                />
                {errors.description && <p className="text-sm text-error mt-1">{errors.description.message}</p>}
              </div>

              <div className="pt-4 flex justify-end gap-3 border-t border-surface-variant">
                <button
                  type="button"
                  onClick={closeModal}
                  className="px-4 py-2.5 font-label-md text-label-md text-on-surface-variant hover:text-primary transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={createCategoryMutation.isPending || updateCategoryMutation.isPending}
                  className="bg-primary text-on-primary font-label-md text-label-md px-6 py-2.5 rounded-lg hover:bg-primary-container hover:text-on-primary-container transition-colors disabled:opacity-70"
                >
                  {createCategoryMutation.isPending || updateCategoryMutation.isPending ? 'Saving...' : 'Save Category'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
