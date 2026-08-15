import { Link } from 'react-router-dom';
import { useProducts, useCategories } from '../../hooks/useProducts';
import { LoadingState, ErrorState, EmptyState } from '../../components/common/DataState';
import { formatPrice, getProductImageUrl } from '../../lib/products';

const CATEGORY_ICONS = ['category', 'devices', 'checkroom', 'local_mall'];

export default function HomePage() {
  const {
    data: productsData,
    isLoading: isLoadingProducts,
    error: productsError,
    refetch: refetchProducts,
  } = useProducts({ limit: 4, sort: '-createdAt' });

  const {
    data: categories = [],
    isLoading: isLoadingCategories,
    error: categoriesError,
    refetch: refetchCategories,
  } = useCategories();

  const products = productsData?.products ?? [];
  const isLoading = isLoadingProducts || isLoadingCategories;
  const error = productsError || categoriesError;

  if (isLoading) {
    return (
      <main className="flex-grow">
        <LoadingState message="Loading storefront..." />
      </main>
    );
  }

  if (error) {
    return (
      <main className="flex-grow">
        <ErrorState
          message={error.response?.data?.message || error.message || 'Failed to load storefront data.'}
          onRetry={() => {
            refetchProducts();
            refetchCategories();
          }}
        />
      </main>
    );
  }

  return (
    <main className="flex-grow">
      <section className="relative w-full h-[870px] min-h-[600px] bg-surface-container-low flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 w-full h-full">
          <div
            className="bg-cover bg-center w-full h-full opacity-90 mix-blend-multiply"
            style={{ backgroundImage: `url('/images/hero.png')` }}
          />
        </div>
        <div className="relative z-10 text-center max-w-3xl px-6 flex flex-col items-center">
          <h1 className="font-display-lg text-display-lg-mobile md:text-display-lg text-primary mb-6 drop-shadow-sm">
            Curated Objects for Mindful Living
          </h1>
          <p className="font-body-lg text-body-lg text-on-surface-variant mb-10 max-w-xl">
            Elevate your space with our latest collection of intentionally designed, artisan-crafted home goods.
          </p>
          <Link
            to="/products"
            className="bg-primary-container text-on-primary rounded-lg px-8 py-4 font-label-md text-label-md uppercase tracking-widest hover:bg-surface-tint transition-colors duration-300 shadow-sm"
          >
            Shop Collection
          </Link>
        </div>
      </section>

      <section className="py-12 bg-background border-b border-surface-variant">
        <div className="max-w-container-max mx-auto px-margin-mobile md:px-margin-desktop">
          {categories.length === 0 ? (
            <p className="text-center font-body-md text-on-surface-variant">No categories available yet.</p>
          ) : (
            <div className="flex justify-center space-x-12 overflow-x-auto no-scrollbar py-4">
              {categories.map((category, index) => (
                <Link
                  key={category.id}
                  to={`/products?categoryId=${category.id}`}
                  className="flex flex-col items-center space-y-3 group min-w-[80px]"
                >
                  <div className="w-16 h-16 rounded-full bg-surface-container flex items-center justify-center group-hover:bg-surface-container-high transition-colors">
                    <span className="material-symbols-outlined text-on-surface-variant group-hover:text-primary transition-colors">
                      {CATEGORY_ICONS[index % CATEGORY_ICONS.length]}
                    </span>
                  </div>
                  <span className="font-label-sm text-label-sm text-on-surface-variant group-hover:text-primary transition-colors">
                    {category.name}
                  </span>
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>

      <section className="py-24 max-w-container-max mx-auto px-margin-mobile md:px-margin-desktop">
        <div className="flex justify-between items-end mb-12">
          <h2 className="font-headline-lg text-headline-lg text-primary">New Arrivals</h2>
          <Link
            to="/products"
            className="font-label-md text-label-md text-secondary hover:text-primary transition-colors pb-1 border-b border-transparent hover:border-primary"
          >
            View All
          </Link>
        </div>

        {products.length === 0 ? (
          <EmptyState
            title="No products yet"
            description="Check back soon — sellers are adding new items to the marketplace."
            actionLabel="Browse Categories"
            actionTo="/products"
          />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-12 gap-gutter-mobile md:gap-gutter-desktop auto-rows-[400px]">
            {products.map((product, index) => {
              const spanClass =
                index === 0
                  ? 'md:col-span-8'
                  : index === 1
                    ? 'md:col-span-4'
                    : index === 2
                      ? 'md:col-span-4'
                      : 'md:col-span-8';

              return (
                <Link
                  key={product.id}
                  to={`/products/${product.id}`}
                  className={`${spanClass} group relative bg-surface-container-lowest rounded-xl overflow-hidden hover-lift cursor-pointer flex flex-col justify-end p-6 md:p-8`}
                >
                  <div className="absolute inset-0 w-full h-full bg-surface-container-low -z-10">
                    <img
                      src={getProductImageUrl(product)}
                      alt={product.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-in-out mix-blend-multiply"
                    />
                  </div>
                  <div className="bg-surface-container-lowest/90 backdrop-blur-sm p-4 md:p-6 rounded-lg inline-block w-full md:w-max shadow-ambient">
                    <h3 className="font-headline-md text-headline-md text-primary mb-2">{product.name}</h3>
                    {product.description && (
                      <p className="font-body-md text-body-md text-on-surface-variant mb-4 line-clamp-2">
                        {product.description}
                      </p>
                    )}
                    <span className="font-label-md text-label-md text-primary font-semibold">
                      {formatPrice(product.price)}
                    </span>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </section>

      <section className="py-24 bg-surface-container">
        <div className="max-w-container-max mx-auto px-margin-mobile md:px-margin-desktop">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-16 items-center">
            <div className="order-2 md:order-1">
              <span className="font-label-sm text-label-sm uppercase tracking-widest text-on-surface-variant mb-4 block">
                The Journal
              </span>
              <h2 className="font-display-lg text-headline-lg text-primary mb-6">Designing for Stillness</h2>
              <p className="font-body-lg text-body-lg text-on-surface-variant mb-8">
                In a world of constant noise, we believe the objects in your home should offer a sense of quiet.
                Explore our philosophy on minimalist design and intentional curation.
              </p>
              <Link
                to="/products"
                className="inline-flex items-center space-x-2 text-primary font-label-md text-label-md hover:text-secondary transition-colors border-b border-primary hover:border-secondary pb-1"
              >
                <span>Shop the Collection</span>
                <span className="material-symbols-outlined text-sm">arrow_forward</span>
              </Link>
            </div>
            <div className="order-1 md:order-2">
              <div className="aspect-[4/5] bg-surface-container-low rounded-lg overflow-hidden shadow-ambient">
                <img
                  src="/images/editorial.png"
                  alt="Editorial feature"
                  className="w-full h-full object-cover grayscale opacity-90 hover:grayscale-0 transition-all duration-700"
                />
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
