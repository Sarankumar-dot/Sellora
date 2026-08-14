import { Link } from 'react-router-dom';

export default function HomePage() {
  return (
    <main className="flex-grow">
      {/* Hero Section */}
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
          <Link to="/products" className="bg-primary-container text-on-primary rounded-lg px-8 py-4 font-label-md text-label-md uppercase tracking-widest hover:bg-surface-tint transition-colors duration-300 shadow-sm">
            Shop Collection
          </Link>
        </div>
      </section>

      {/* Category Strip */}
      <section className="py-12 bg-background border-b border-surface-variant">
        <div className="max-w-container-max mx-auto px-margin-mobile md:px-margin-desktop">
          <div className="flex justify-center space-x-12 overflow-x-auto no-scrollbar py-4">
            <Link to="/products?category=furniture" className="flex flex-col items-center space-y-3 group min-w-[80px]">
              <div className="w-16 h-16 rounded-full bg-surface-container flex items-center justify-center group-hover:bg-surface-container-high transition-colors">
                <span className="material-symbols-outlined text-on-surface-variant group-hover:text-primary transition-colors">chair</span>
              </div>
              <span className="font-label-sm text-label-sm text-on-surface-variant group-hover:text-primary transition-colors">Furniture</span>
            </Link>
            <Link to="/products?category=lighting" className="flex flex-col items-center space-y-3 group min-w-[80px]">
              <div className="w-16 h-16 rounded-full bg-surface-container flex items-center justify-center group-hover:bg-surface-container-high transition-colors">
                <span className="material-symbols-outlined text-on-surface-variant group-hover:text-primary transition-colors">light</span>
              </div>
              <span className="font-label-sm text-label-sm text-on-surface-variant group-hover:text-primary transition-colors">Lighting</span>
            </Link>
            <Link to="/products?category=ceramics" className="flex flex-col items-center space-y-3 group min-w-[80px]">
              <div className="w-16 h-16 rounded-full bg-surface-container flex items-center justify-center group-hover:bg-surface-container-high transition-colors">
                <span className="material-symbols-outlined text-on-surface-variant group-hover:text-primary transition-colors">local_cafe</span>
              </div>
              <span className="font-label-sm text-label-sm text-on-surface-variant group-hover:text-primary transition-colors">Ceramics</span>
            </Link>
            <Link to="/products?category=textiles" className="flex flex-col items-center space-y-3 group min-w-[80px]">
              <div className="w-16 h-16 rounded-full bg-surface-container flex items-center justify-center group-hover:bg-surface-container-high transition-colors">
                <span className="material-symbols-outlined text-on-surface-variant group-hover:text-primary transition-colors">checkroom</span>
              </div>
              <span className="font-label-sm text-label-sm text-on-surface-variant group-hover:text-primary transition-colors">Textiles</span>
            </Link>
          </div>
        </div>
      </section>

      {/* New Arrivals - Bento Grid */}
      <section className="py-24 max-w-container-max mx-auto px-margin-mobile md:px-margin-desktop">
        <div className="flex justify-between items-end mb-12">
          <h2 className="font-headline-lg text-headline-lg text-primary">New Arrivals</h2>
          <Link to="/products" className="font-label-md text-label-md text-secondary hover:text-primary transition-colors pb-1 border-b border-transparent hover:border-primary">
            View All
          </Link>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-12 gap-gutter-mobile md:gap-gutter-desktop auto-rows-[400px]">
          
          {/* Large Feature Item (Takes up 8 columns) */}
          <Link to="/products/1" className="md:col-span-8 group relative bg-surface-container-lowest rounded-xl overflow-hidden hover-lift cursor-pointer flex flex-col justify-end p-8">
            <div className="absolute inset-0 w-full h-full bg-surface-container-low -z-10">
              <img src="/images/product_vase.png" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-in-out mix-blend-multiply" />
            </div>
            <div className="bg-surface-container-lowest/90 backdrop-blur-sm p-6 rounded-lg inline-block w-max self-start shadow-ambient">
              <h3 className="font-headline-md text-headline-md text-primary mb-2">The Bouclé Lounge</h3>
              <p className="font-body-md text-body-md text-on-surface-variant mb-4">Tactile comfort meets structural elegance.</p>
              <span className="font-label-md text-label-md text-primary font-semibold">$1,250</span>
            </div>
          </Link>

          {/* Vertical Feature Item (Takes up 4 columns) */}
          <Link to="/products/2" className="md:col-span-4 group relative bg-surface-container-lowest rounded-xl overflow-hidden hover-lift cursor-pointer flex flex-col justify-end p-6">
            <div className="absolute inset-0 w-full h-full bg-surface-container-low -z-10">
              <img src="/images/product_lamp.png" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-in-out mix-blend-multiply" />
            </div>
            <div className="bg-surface-container-lowest/90 backdrop-blur-sm p-4 rounded-lg inline-block w-full shadow-ambient">
              <h3 className="font-headline-md text-headline-md text-primary mb-1">Arc Table Lamp</h3>
              <div className="flex justify-between items-center">
                <span className="font-label-md text-label-md text-on-surface-variant">Matte Black</span>
                <span className="font-label-md text-label-md text-primary font-semibold">$345</span>
              </div>
            </div>
          </Link>

          {/* Square Item (4 cols) */}
          <Link to="/products/3" className="md:col-span-4 group relative bg-surface-container-lowest rounded-xl overflow-hidden hover-lift cursor-pointer flex flex-col justify-end p-6">
            <div className="absolute inset-0 w-full h-full bg-surface-container-low -z-10">
              <img src="/images/product_throw.png" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-in-out mix-blend-multiply" />
            </div>
            <div className="mt-auto">
              <div className="bg-surface-container-lowest/90 backdrop-blur-sm p-4 rounded-lg inline-block w-full shadow-ambient">
                <h3 className="font-headline-md text-[20px] leading-snug text-primary mb-1">Earthen Vessel</h3>
                <span className="font-label-md text-label-md text-primary font-semibold">$120</span>
              </div>
            </div>
          </Link>

          {/* Horizontal Item (8 cols) */}
          <Link to="/products/4" className="md:col-span-8 group relative bg-surface-container-lowest rounded-xl overflow-hidden hover-lift cursor-pointer flex flex-col justify-end p-8">
            <div className="absolute inset-0 w-full h-full bg-surface-container-low -z-10">
              <img src="/images/hero.png" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-in-out mix-blend-multiply object-center" />
            </div>
            <div className="bg-surface-container-lowest/90 backdrop-blur-sm p-6 rounded-lg inline-block w-max self-end shadow-ambient text-right">
              <h3 className="font-headline-md text-headline-md text-primary mb-2">Linear Dining Table</h3>
              <p className="font-body-md text-body-md text-on-surface-variant mb-4">Solid ash, crafted for generations.</p>
              <span className="font-label-md text-label-md text-primary font-semibold">$2,800</span>
            </div>
          </Link>

        </div>
      </section>

      {/* Editorial Feature */}
      <section className="py-24 bg-surface-container">
        <div className="max-w-container-max mx-auto px-margin-mobile md:px-margin-desktop">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-16 items-center">
            <div className="order-2 md:order-1">
              <span className="font-label-sm text-label-sm uppercase tracking-widest text-on-surface-variant mb-4 block">The Journal</span>
              <h2 className="font-display-lg text-headline-lg text-primary mb-6">Designing for Stillness</h2>
              <p className="font-body-lg text-body-lg text-on-surface-variant mb-8">
                In a world of constant noise, we believe the objects in your home should offer a sense of quiet. Explore our philosophy on minimalist design and intentional curation.
              </p>
              <Link to="/about" className="inline-flex items-center space-x-2 text-primary font-label-md text-label-md hover:text-secondary transition-colors border-b border-primary hover:border-secondary pb-1">
                <span>Read the Editorial</span>
                <span className="material-symbols-outlined text-sm">arrow_forward</span>
              </Link>
            </div>
            <div className="order-1 md:order-2">
              <div className="aspect-[4/5] bg-surface-container-low rounded-lg overflow-hidden shadow-ambient">
                <img src="/images/editorial.png" className="w-full h-full object-cover grayscale opacity-90 hover:grayscale-0 transition-all duration-700" />
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
