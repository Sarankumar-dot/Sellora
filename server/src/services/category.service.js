import ApiError from '../errors/ApiError.js';

import {
  createCategoryInDB,
  findCategoryByName,
  findCategoryById,
  findAllCategories,
  updateCategoryByIdInDB,
} from '../models/category.model.js';
export const createCategoryService = async (categoryData) => {
  const category = await findCategoryByName(categoryData.name);

  if (category) {
    throw new ApiError(409, 'Category already exists');
  }

  return await createCategoryInDB(categoryData);
};

export const getCategoryService = async () => {
  const categories = await findAllCategories();

  return categories;
};

export const getCategoryByIdService = async (category_id) => {
  const category = await findCategoryById(category_id);

  if (!category) {
    throw new ApiError(404, 'Category not found');
  }

  return category;
};

export const updateCategoryByIdService = async (data, categoryId) => {
  // Check if category exists
  const category = await findCategoryById(categoryId);

  if (!category) {
    throw new ApiError(404, 'Category not found');
  }

  // Check duplicate category name (only if name is being updated)
  if (data.name) {
    const existingCategory = await findCategoryByName(data.name);

    if (existingCategory && existingCategory.id !== Number(categoryId)) {
      throw new ApiError(409, 'Category already exists');
    }
  }

  // Prepare updated data
  const updateData = {
    name: data.name ?? category.name,
    description: data.description ?? category.description,
  };

  // Check if nothing has changed
  if (updateData.name === category.name && updateData.description === category.description) {
    throw new ApiError(400, 'No changes detected');
  }

  // Update category
  await updateCategoryByIdInDB(updateData, categoryId);

  // Return updated category
  return await findCategoryById(categoryId);
};
