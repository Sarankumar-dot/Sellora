import { useEffect, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useProducts, useCategories } from '../../hooks/useProducts';
import { useCart } from '../../hooks/useCart';
import { useAuth } from '../../context/AuthContext';
import { LoadingState, ErrorState, EmptyState } from '../../components/common/DataState';
import { formatPrice, getProductImageUrl, SORT_OPTIONS } from '../../lib/products';

const PAGE_SIZE = 12;

export default function ProductsPage() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { isAuthenticated } = useAuth();
  const { addToCart, isAdding } = useCart();
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [searchInput, setSearchInput] = useState(searchParams.get('search') || '');
  const [quickAddFeedback, setQuickAddFeedback] = useState(null);

  const page = Math.max(Number(searchParams.get('page')) || 1, 1);
  const categoryId = searchParams.get('categoryId') || '';
  const sort = searchParams.get('sort') || '-createdAt';
  const search = searchParams.get('search') || '';

  const filters = {
    page,
    limit: PAGE_SIZE,
    sort,
    ...(search ? { search } : {}),
    ...(categoryId ? { categoryId: Number(categoryId) } : {}),
  };

  const {
    data: productsData,
    isLoading: isLoadingProducts,
    error: productsError,
    refetch: refetchProducts,
  } = useProducts(filters);

  const {
    data: categories = [],
    isLoading: isLoadingCategories,
    error: categoriesError,
  } = useCategories();

  const products = productsData?.products ?? [];
  const pagination = productsData?.pagination ?? {
    page: 1,
    totalPages: 0,
    totalProducts: 0,
    hasNextPage: false,
    hasPreviousPage: false,
  };

  useEffect(() => {
    setSearchInput(search);
  }, [search]);

  const updateParams = (updates) => {
    const next = new URLSearchParams(searchParams);
    Object.entries(updates).forEach(([key, value]) => {
      if (value === '' || value === null || value === undefined) {
        next.delete(key);
      } else {
        next.set(key, String(value));
      }
    });
    setSearchParams(next);
  };

  const handleSearchSubmit = (event) => {
    event.preventDefault();
    updateParams({ search: searchInput.trim(), page: 1 });
  };

  const handleCategoryChange = (nextCategoryId) => {
    updateParams({ categoryId: nextCategoryId, page: 1 });
  };

  const handleSortChange = (event) => {
    updateParams({ sort: event.target.value, page: 1 });
  };

  const handleQuickAdd = async (event, productId) => {
    event.preventDefault();
    event.stopPropagation();

    if (!isAuthenticated) {
      navigate('/auth/login', { state: { from: { pathname: '/products' } } });
      return;
    }

    try {
      await addToCart({ productId, quantity: 1 });
      setQuickAddFeedback(`Added product #${productId} to cart`);
      setTimeout(() => setQuickAddFeedback(null), 2500);
    } catch (err) {
      setQuickAddFeedback(err.response?.data?.message || 'Could not add to cart.');
      setTimeout(() => setQuickAddFeedback(null), 3000);
    }
  };

  if (isLoadingProducts || isLoadingCategories) {
    return (
      <main className="flex-grow max-w-container-max mx-auto w-full px-margin-mobile md:px-margin-desktop py-8 md:py-16">
        <LoadingState message="Loading products..." />
      </main>
    );
  }

  if (productsError || categoriesError) {
    const error = productsError || categoriesError;
    return (
      <main className="flex-grow max-w-container-max mx-auto w-full px-margin-mobile md:px-margin-desktop py-8 md:py-16">
        <ErrorState
          message={error.response?.data?.message || error.message || 'Failed to load products.'}
          onRetry={refetchProducts}
        />
      </main>
    );
  }

  return (
    <main className="flex-grow max-w-container-max mx-auto w-full px-margin-mobile md:px-margin-desktop py-8 md:py-16 grid grid-cols-1 md:grid-cols-12 gap-gutter-desktop">
      {quickAddFeedback && (
        <div className="col-span-full mb-4 rounded-DEFAULT bg-primary-container text-on-primary px-4 py-3 font-body-md">
          {quickAddFeedback}
        </div>
      )}

      <div className="col-span-full mb-8">
        <h1 className="font-headline-lg text-headline-lg text-primary mb-2">Shop All Products</h1>
        <p className="font-body-lg text-body-lg text-on-surface-variant max-w-2xl mb-6">
          Browse the marketplace with live search, category filters, sorting, and pagination.
        </p>
        <form onSubmit={handleSearchSubmit} className="max-w-xl flex gap-2">
          <input
            type="search"
            value={searchInput}
            onChange={(event) => setSearchInput(event.target.value)}
            placeholder="Search products..."
            className="flex-1 bg-surface-container-lowest border border-outline-variant focus:border-primary focus:ring-0 rounded-DEFAULT py-2 px-3 text-sm text-on-surface"
          />
          <button
            type="submit"
            className="bg-primary text-on-primary px-4 py-2 rounded-DEFAULT font-label-md text-label-md hover:bg-primary-container transition-colors"
          >
            Search
          </button>
        </form>
      </div>

      <aside className="col-span-1 md:col-span-3 space-y-8 hidden md:block">
        <div>
          <h3 className="font-label-md text-label-md text-primary mb-4 uppercase tracking-wider">Category</h3>
          <ul className="space-y-3 font-body-md text-body-md text-on-surface-variant">
            <li>
              <label className="flex items-center cursor-pointer group">
                <input
                  type="radio"
                  name="category"
                  checked={!categoryId}
                  onChange={() => handleCategoryChange('')}
                  className="h-4 w-4 text-primary border-outline-variant focus:ring-primary mr-3"
                />
                <span className="group-hover:text-primary transition-colors">All Categories</span>
              </label>
            </li>
            {categories.map((category) => (
              <li key={category.id}>
                <label className="flex items-center cursor-pointer group">
                  <input
                    type="radio"
                    name="category"
                    checked={String(categoryId) === String(category.id)}
                    onChange={() => handleCategoryChange(category.id)}
                    className="h-4 w-4 text-primary border-outline-variant focus:ring-primary mr-3"
                  />
                  <span className="group-hover:text-primary transition-colors">{category.name}</span>
                </label>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h3 className="font-label-md text-label-md text-primary mb-4 uppercase tracking-wider">Sort By</h3>
          <select
            value={sort}
            onChange={handleSortChange}
            className="w-full bg-surface-container-lowest border border-outline-variant focus:border-primary focus:ring-0 rounded-DEFAULT py-2 px-3 text-sm text-on-surface cursor-pointer"
          >
            {SORT_OPTIONS.map((option) => (
              <option key={option.label} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
      </aside>

      <div className="col-span-1 md:col-span-9">
        <div className="md:hidden flex justify-between items-center mb-6 py-3 border-y border-outline-variant/30">
          <button
            type="button"
            onClick={() => setIsFilterOpen(true)}
            className="flex items-center space-x-2 text-primary font-label-md text-label-md"
          >
            <span className="material-symbols-outlined text-sm">tune</span>
            <span>Filters</span>
          </button>
          <div className="flex items-center space-x-2 text-on-surface-variant font-label-sm text-label-sm">
            <span>{pagination.totalProducts} Items</span>
          </div>
        </div>

        {products.length === 0 ? (
          <EmptyState
            title="No products found"
            description="Try clearing filters or adjusting your search terms."
            actionLabel="Clear Filters"
            actionTo="/products"
          />
        ) : (
          <>
            <div className="hidden md:flex justify-end mb-6 text-on-surface-variant font-label-sm text-label-sm">
              {pagination.totalProducts} items · Page {pagination.page} of {Math.max(pagination.totalPages, 1)}
            </div>

            <div className="grid grid-cols-2 lg:grid-cols-3 gap-x-4 gap-y-10 md:gap-x-8 md:gap-y-16">
              {products.map((product) => (
                <Link key={product.id} to={`/products/${product.id}`} className="group block">
                  <div className="relative w-full aspect-[4/5] bg-surface-container-low mb-4 overflow-hidden rounded-sm transition-all duration-500 group-hover:shadow-[0_10px_30px_rgba(26,26,26,0.05)]">
                    <img
                      src={getProductImageUrl(product)}
                      alt={product.name}
                      className="object-cover w-full h-full transition-transform duration-700 group-hover:scale-105"
                    />

                    {product.stock > 0 && product.stock <= 5 && (
                      <div className="absolute top-3 left-3 bg-surface-container text-primary font-label-sm text-label-sm px-2 py-1 rounded-sm">
                        Low Stock
                      </div>
                    )}

                    <div className="absolute inset-x-0 bottom-0 p-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300 translate-y-2 group-hover:translate-y-0">
                      <button
                        type="button"
                        disabled={isAdding}
                        className="w-full bg-primary text-on-primary font-label-md text-label-md py-3 rounded-DEFAULT hover:bg-primary-container transition-colors shadow-lg disabled:opacity-60"
                        onClick={(event) => handleQuickAdd(event, product.id)}
                      >
                        {isAdding ? 'Adding...' : 'Quick Add'}
                      </button>
                    </div>
                  </div>

                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-body-md text-body-md text-primary font-medium mb-1 group-hover:text-secondary transition-colors">
                        {product.name}
                      </h3>
                      <p className="font-label-sm text-label-sm text-on-surface-variant">
                        {categories.find((c) => c.id === product.category_id)?.name || 'Uncategorized'}
                      </p>
                    </div>
                    <span className="font-body-md text-body-md text-primary">{formatPrice(product.price)}</span>
                  </div>
                </Link>
              ))}
            </div>

            {pagination.totalPages > 1 && (
              <div className="mt-16 pt-8 border-t border-outline-variant/30 flex justify-center items-center space-x-4">
                <button
                  type="button"
                  className="w-10 h-10 flex items-center justify-center rounded-full border border-outline-variant text-on-surface-variant hover:border-primary hover:text-primary transition-colors disabled:opacity-50"
                  disabled={!pagination.hasPreviousPage}
                  onClick={() => updateParams({ page: page - 1 })}
                >
                  <span className="material-symbols-outlined text-sm">chevron_left</span>
                </button>
                <span className="font-label-md text-label-md text-primary">
                  {pagination.page} / {pagination.totalPages}
                </span>
                <button
                  type="button"
                  className="w-10 h-10 flex items-center justify-center rounded-full border border-outline-variant text-on-surface-variant hover:border-primary hover:text-primary transition-colors disabled:opacity-50"
                  disabled={!pagination.hasNextPage}
                  onClick={() => updateParams({ page: page + 1 })}
                >
                  <span className="material-symbols-outlined text-sm">chevron_right</span>
                </button>
              </div>
            )}
          </>
        )}
      </div>

      {isFilterOpen && (
        <div className="fixed inset-0 z-[60] md:hidden">
          <div
            className="absolute inset-0 bg-primary/20 backdrop-blur-sm transition-opacity"
            onClick={() => setIsFilterOpen(false)}
          />
          <div className="absolute bottom-0 left-0 right-0 bg-background rounded-t-xl flex flex-col max-h-[85vh]">
            <div className="w-full flex justify-center pt-3 pb-2">
              <div className="w-12 h-1 bg-outline-variant rounded-full" />
            </div>
            <div className="px-4 py-4 border-b border-surface-variant flex justify-between items-center">
              <h3 className="font-headline-md text-headline-md text-primary">Filters</h3>
              <button type="button" onClick={() => setIsFilterOpen(false)} className="p-2">
                <span className="material-symbols-outlined text-on-surface-variant">close</span>
              </button>
            </div>

            <div className="overflow-y-auto px-4 py-6 flex-1 space-y-8">
              <div>
                <h4 className="font-label-md text-label-md text-primary mb-4 uppercase tracking-wider">Category</h4>
                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() => handleCategoryChange('')}
                    className={`px-4 py-2 rounded-full font-label-md text-label-md ${
                      !categoryId ? 'bg-primary text-on-primary' : 'bg-surface-container-low text-primary border border-outline-variant'
                    }`}
                  >
                    All
                  </button>
                  {categories.map((category) => (
                    <button
                      key={category.id}
                      type="button"
                      onClick={() => handleCategoryChange(category.id)}
                      className={`px-4 py-2 rounded-full font-label-md text-label-md ${
                        String(categoryId) === String(category.id)
                          ? 'bg-primary text-on-primary'
                          : 'bg-surface-container-low text-primary border border-outline-variant'
                      }`}
                    >
                      {category.name}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <h4 className="font-label-md text-label-md text-primary mb-4 uppercase tracking-wider">Sort By</h4>
                <select
                  value={sort}
                  onChange={handleSortChange}
                  className="w-full bg-surface-container-lowest border border-outline-variant rounded-DEFAULT py-2 px-3 text-sm"
                >
                  {SORT_OPTIONS.map((option) => (
                    <option key={option.label} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="p-4 border-t border-surface-variant flex gap-4 bg-background">
              <button
                type="button"
                className="flex-1 py-4 border border-outline text-primary font-label-md text-label-md rounded-DEFAULT"
                onClick={() => {
                  setSearchParams({});
                  setIsFilterOpen(false);
                }}
              >
                Clear All
              </button>
              <button
                type="button"
                className="flex-1 py-4 bg-primary text-on-primary font-label-md text-label-md rounded-DEFAULT"
                onClick={() => setIsFilterOpen(false)}
              >
                Apply ({pagination.totalProducts})
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
