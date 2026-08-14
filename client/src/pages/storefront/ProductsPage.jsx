import { useState } from 'react';
import { Link } from 'react-router-dom';

export default function ProductsPage() {
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  const products = [
    {
      id: 1,
      name: 'Luna Ceramic Vase',
      category: 'Matte White',
      price: 125,
      image: '/images/product_vase.png',
      isNew: true
    },
    {
      id: 2,
      name: 'Weave Linen Throw',
      category: 'Terracotta',
      price: 180,
      image: '/images/product_throw.png',
      isNew: false
    },
    {
      id: 3,
      name: 'Brass Orb Lamp',
      category: 'Brushed Brass',
      price: 295,
      image: '/images/product_lamp.png',
      isNew: false
    },
    {
      id: 4,
      name: 'Walnut Nesting Bowls',
      category: 'Dark Walnut',
      price: 95,
      image: '/images/product_vase.png',
      isNew: false,
      lowStock: true
    }
  ];

  return (
    <main className="flex-grow max-w-container-max mx-auto w-full px-margin-mobile md:px-margin-desktop py-8 md:py-16 grid grid-cols-1 md:grid-cols-12 gap-gutter-desktop">
      {/* Page Header */}
      <div className="col-span-full mb-8">
        <h1 className="font-headline-lg text-headline-lg text-primary mb-2">New Arrivals</h1>
        <p className="font-body-lg text-body-lg text-on-surface-variant max-w-2xl">
          Curated pieces for the modern aesthetic. Explore our latest collection of premium, handcrafted essentials designed to elevate your everyday spaces.
        </p>
      </div>

      {/* Sidebar Filters (Desktop) */}
      <aside className="col-span-1 md:col-span-3 space-y-8 hidden md:block">
        {/* Category Filter */}
        <div>
          <h3 className="font-label-md text-label-md text-primary mb-4 uppercase tracking-wider">Category</h3>
          <ul className="space-y-3 font-body-md text-body-md text-on-surface-variant">
            <li>
              <label className="flex items-center cursor-pointer group">
                <input type="checkbox" defaultChecked className="form-checkbox h-4 w-4 text-primary border-outline-variant rounded-sm focus:ring-primary mr-3" />
                <span className="group-hover:text-primary transition-colors">All Arrivals</span>
              </label>
            </li>
            <li>
              <label className="flex items-center cursor-pointer group">
                <input type="checkbox" className="form-checkbox h-4 w-4 text-primary border-outline-variant rounded-sm focus:ring-primary mr-3" />
                <span className="group-hover:text-primary transition-colors">Ceramics</span>
              </label>
            </li>
            <li>
              <label className="flex items-center cursor-pointer group">
                <input type="checkbox" className="form-checkbox h-4 w-4 text-primary border-outline-variant rounded-sm focus:ring-primary mr-3" />
                <span className="group-hover:text-primary transition-colors">Textiles</span>
              </label>
            </li>
            <li>
              <label className="flex items-center cursor-pointer group">
                <input type="checkbox" className="form-checkbox h-4 w-4 text-primary border-outline-variant rounded-sm focus:ring-primary mr-3" />
                <span className="group-hover:text-primary transition-colors">Lighting</span>
              </label>
            </li>
            <li>
              <label className="flex items-center cursor-pointer group">
                <input type="checkbox" className="form-checkbox h-4 w-4 text-primary border-outline-variant rounded-sm focus:ring-primary mr-3" />
                <span className="group-hover:text-primary transition-colors">Furniture</span>
              </label>
            </li>
          </ul>
        </div>
        {/* Price Filter */}
        <div>
          <h3 className="font-label-md text-label-md text-primary mb-4 uppercase tracking-wider">Price Range</h3>
          <div className="flex items-center space-x-2 mb-4">
            <input type="number" placeholder="Min" className="w-full bg-surface-container-lowest border border-outline-variant focus:border-primary focus:ring-0 rounded-DEFAULT py-2 px-3 text-sm text-on-surface" />
            <span className="text-on-surface-variant">-</span>
            <input type="number" placeholder="Max" className="w-full bg-surface-container-lowest border border-outline-variant focus:border-primary focus:ring-0 rounded-DEFAULT py-2 px-3 text-sm text-on-surface" />
          </div>
        </div>
        {/* Sort By */}
        <div>
          <h3 className="font-label-md text-label-md text-primary mb-4 uppercase tracking-wider">Sort By</h3>
          <select className="w-full bg-surface-container-lowest border border-outline-variant focus:border-primary focus:ring-0 rounded-DEFAULT py-2 px-3 text-sm text-on-surface cursor-pointer">
            <option>Featured</option>
            <option>Price: Low to High</option>
            <option>Price: High to Low</option>
            <option>Newest</option>
          </select>
        </div>
      </aside>

      {/* Product Grid */}
      <div className="col-span-1 md:col-span-9">
        {/* Mobile Filter Toggle Bar */}
        <div className="md:hidden flex justify-between items-center mb-6 py-3 border-y border-outline-variant/30">
          <button onClick={() => setIsFilterOpen(true)} className="flex items-center space-x-2 text-primary font-label-md text-label-md">
            <span className="material-symbols-outlined text-sm">tune</span>
            <span>Filters</span>
          </button>
          <div className="flex items-center space-x-2 text-on-surface-variant font-label-sm text-label-sm">
            <span>12 Items</span>
          </div>
        </div>

        {/* Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-x-4 gap-y-10 md:gap-x-8 md:gap-y-16">
          {products.map(product => (
            <Link key={product.id} to={`/products/${product.id}`} className="group block">
              <div className="relative w-full aspect-[4/5] bg-surface-container-low mb-4 overflow-hidden rounded-sm transition-all duration-500 group-hover:shadow-[0_10px_30px_rgba(26,26,26,0.05)]">
                <img src={product.image} alt={product.name} className="object-cover w-full h-full transition-transform duration-700 group-hover:scale-105" />
                
                {product.isNew && (
                  <div className="absolute top-3 left-3 bg-primary text-on-primary font-label-sm text-label-sm px-2 py-1 rounded-sm">
                    New
                  </div>
                )}
                {product.lowStock && (
                  <div className="absolute top-3 left-3 bg-surface-container text-primary font-label-sm text-label-sm px-2 py-1 rounded-sm">
                    Low Stock
                  </div>
                )}
                
                {/* Quick Add Button Overlay */}
                <div className="absolute inset-x-0 bottom-0 p-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300 translate-y-2 group-hover:translate-y-0">
                  <button className="w-full bg-primary text-on-primary font-label-md text-label-md py-3 rounded-DEFAULT hover:bg-primary-container transition-colors shadow-lg" onClick={(e) => { e.preventDefault(); }}>
                    Quick Add
                  </button>
                </div>
              </div>

              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-body-md text-body-md text-primary font-medium mb-1 group-hover:text-secondary transition-colors">{product.name}</h3>
                  <p className="font-label-sm text-label-sm text-on-surface-variant">{product.category}</p>
                </div>
                <span className="font-body-md text-body-md text-primary">${product.price}</span>
              </div>
            </Link>
          ))}
        </div>

        {/* Pagination (Simple) */}
        <div className="mt-16 pt-8 border-t border-outline-variant/30 flex justify-center items-center space-x-4">
          <button className="w-10 h-10 flex items-center justify-center rounded-full border border-outline-variant text-on-surface-variant hover:border-primary hover:text-primary transition-colors disabled:opacity-50" disabled>
            <span className="material-symbols-outlined text-sm">chevron_left</span>
          </button>
          <span className="font-label-md text-label-md text-primary">1 / 4</span>
          <button className="w-10 h-10 flex items-center justify-center rounded-full border border-outline-variant text-on-surface-variant hover:border-primary hover:text-primary transition-colors">
            <span className="material-symbols-outlined text-sm">chevron_right</span>
          </button>
        </div>
      </div>

      {/* Mobile Filter Drawer (retained logic but minimal baseline styling) */}
      {isFilterOpen && (
        <div className="fixed inset-0 z-[60] md:hidden">
          <div className="absolute inset-0 bg-primary/20 backdrop-blur-sm transition-opacity" onClick={() => setIsFilterOpen(false)} />
          <div className="absolute bottom-0 left-0 right-0 bg-background rounded-t-xl flex flex-col max-h-[85vh]">
            <div className="w-full flex justify-center pt-3 pb-2">
              <div className="w-12 h-1 bg-outline-variant rounded-full" />
            </div>
            <div className="px-4 py-4 border-b border-surface-variant flex justify-between items-center">
              <h3 className="font-headline-md text-headline-md text-primary">Filters</h3>
              <button onClick={() => setIsFilterOpen(false)} className="p-2">
                <span className="material-symbols-outlined text-on-surface-variant">close</span>
              </button>
            </div>
            
            <div className="overflow-y-auto px-4 py-6 flex-1 space-y-8">
              <div>
                <h4 className="font-label-md text-label-md text-primary mb-4 uppercase tracking-wider">Category</h4>
                <div className="flex flex-wrap gap-2">
                  <span className="px-4 py-2 bg-primary text-on-primary rounded-full font-label-md text-label-md">All</span>
                  {['Ceramics', 'Textiles', 'Lighting'].map(cat => (
                    <span key={cat} className="px-4 py-2 bg-surface-container-low text-primary border border-outline-variant rounded-full font-label-md text-label-md">{cat}</span>
                  ))}
                </div>
              </div>
            </div>

            <div className="p-4 border-t border-surface-variant flex gap-4 bg-background">
              <button className="flex-1 py-4 border border-outline text-primary font-label-md text-label-md rounded-DEFAULT" onClick={() => setIsFilterOpen(false)}>Clear All</button>
              <button className="flex-1 py-4 bg-primary text-on-primary font-label-md text-label-md rounded-DEFAULT" onClick={() => setIsFilterOpen(false)}>Apply (12)</button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
