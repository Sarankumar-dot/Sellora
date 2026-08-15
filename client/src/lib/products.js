export const getProductImageUrl = (product, index = 0) => {
  const images = product?.images;
  if (Array.isArray(images) && images.length > 0) {
    return images[index]?.image_url || images[0]?.image_url;
  }
  return 'https://via.placeholder.com/600x750?text=No+Image';
};

export const formatPrice = (value) => {
  const amount = Number(value);
  if (Number.isNaN(amount)) return '$0.00';
  return `$${amount.toFixed(2)}`;
};

export const SORT_OPTIONS = [
  { label: 'Featured', value: '-createdAt' },
  { label: 'Price: Low to High', value: 'price' },
  { label: 'Price: High to Low', value: '-price' },
  { label: 'Newest', value: '-createdAt' },
  { label: 'Name: A–Z', value: 'name' },
];
