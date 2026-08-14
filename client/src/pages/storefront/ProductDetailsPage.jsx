import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

export default function ProductDetailsPage() {
  const navigate = useNavigate();
  const [quantity, setQuantity] = useState(1);
  const [activeImage, setActiveImage] = useState(0);

  const product = {
    name: 'The Sculptural Vessel',
    price: 185.00,
    category: 'Ceramics',
    colors: [
      { name: 'Bone White', hex: '#E5E0D8' },
      { name: 'Charcoal', hex: '#2A2A2A' },
      { name: 'Terracotta', hex: '#B56A50' }
    ],
    images: [
      '/images/product_vase.png',
      '/images/product_throw.png',
      '/images/product_lamp.png'
    ],
    seller: {
      name: 'Studio Arp',
      desc: 'Curated independent makers from Copenhagen.',
      logo: '/images/product_vase.png'
    }
  };

  return (
    <main className="flex-grow w-full max-w-container-max mx-auto px-margin-mobile md:px-margin-desktop py-8 md:py-margin-desktop">
      {/* Mobile Top Actions */}
      <div className="md:hidden flex justify-between items-center mb-6">
        <button onClick={() => navigate('/products')} className="w-10 h-10 rounded-full bg-surface-container flex items-center justify-center text-on-surface">
          <span className="material-symbols-outlined text-sm">arrow_back</span>
        </button>
        <button className="w-10 h-10 rounded-full bg-surface-container flex items-center justify-center text-on-surface">
          <span className="material-symbols-outlined text-sm">share</span>
        </button>
      </div>

      <div className="flex flex-col lg:flex-row gap-16 lg:gap-24">
        {/* Image Gallery (Left) */}
        <div className="w-full lg:w-3/5 flex flex-col gap-6">
          {/* Main Image */}
          <div className="aspect-[4/5] w-full bg-surface-container-low rounded-lg overflow-hidden relative">
            <img src={product.images[activeImage]} className="w-full h-full object-cover" />
          </div>
          {/* Thumbnail Strip */}
          <div className="flex gap-4 overflow-x-auto pb-2 snap-x no-scrollbar">
            {product.images.map((img, i) => (
              <button 
                key={i} 
                onClick={() => setActiveImage(i)}
                className={`w-24 h-32 flex-shrink-0 rounded-md overflow-hidden snap-start transition-opacity ${activeImage === i ? 'ring-2 ring-primary opacity-100' : 'opacity-70 hover:opacity-100'}`}
              >
                <img src={img} className="w-full h-full object-cover" />
              </button>
            ))}
          </div>
        </div>

        {/* Product Details (Right) */}
        <div className="w-full lg:w-2/5 flex flex-col">
          <nav className="hidden md:flex text-label-md text-on-surface-variant mb-6 gap-2">
            <Link to="/" className="hover:text-primary transition-colors">Home</Link>
            <span>/</span>
            <Link to="/products" className="hover:text-primary transition-colors">Collections</Link>
            <span>/</span>
            <span className="text-primary">{product.category}</span>
          </nav>
          
          <h1 className="font-headline-lg text-headline-lg text-primary mb-4">{product.name}</h1>
          <p className="font-body-lg text-body-lg text-on-surface-variant mb-8">${product.price.toFixed(2)}</p>

          {/* Action Area */}
          <div className="flex flex-col gap-6 mb-12">
            <div className="flex items-center gap-4">
              <span className="font-label-md text-label-md text-on-surface uppercase tracking-widest">Quantity</span>
              <div className="flex items-center border border-outline-variant rounded bg-surface h-10 w-32">
                <button onClick={() => setQuantity(Math.max(1, quantity - 1))} className="w-10 h-full flex items-center justify-center hover:bg-surface-container transition-colors text-on-surface-variant">
                  <span className="material-symbols-outlined text-sm">remove</span>
                </button>
                <span className="flex-grow text-center font-body-md">{quantity}</span>
                <button onClick={() => setQuantity(quantity + 1)} className="w-10 h-full flex items-center justify-center hover:bg-surface-container transition-colors text-on-surface-variant">
                  <span className="material-symbols-outlined text-sm">add</span>
                </button>
              </div>
            </div>
            <button className="w-full h-14 bg-primary text-on-primary font-label-md text-label-md rounded-lg flex items-center justify-center hover:bg-primary-container transition-colors duration-300">
              Add to Cart - ${(product.price * quantity).toFixed(2)}
            </button>
          </div>

          {/* Description & Specs Accordion */}
          <div className="border-t border-outline-variant divide-y divide-outline-variant">
            <details className="group py-6" open>
              <summary className="flex justify-between items-center cursor-pointer list-none font-headline-md text-body-lg">
                Description
                <span className="material-symbols-outlined transition duration-300 group-open:-rotate-180">expand_more</span>
              </summary>
              <div className="pt-4 text-on-surface-variant font-body-md leading-relaxed">
                <p>A masterclass in form and function, the Sculptural Vessel is hand-thrown by artisan ceramicists. Its distinctive asymmetric silhouette is designed to stand alone as a statement piece or hold sparse, structural botanical arrangements. Finished in a matte bone-white glaze that catches the light beautifully.</p>
              </div>
            </details>
            <details className="group py-6">
              <summary className="flex justify-between items-center cursor-pointer list-none font-headline-md text-body-lg">
                Specifications
                <span className="material-symbols-outlined transition duration-300 group-open:-rotate-180">expand_more</span>
              </summary>
              <div className="pt-4 text-on-surface-variant font-body-md">
                <ul className="list-disc pl-5 space-y-2">
                  <li>Height: 14 inches</li>
                  <li>Diameter: 8 inches at widest</li>
                  <li>Material: Stoneware clay</li>
                  <li>Care: Hand wash recommended</li>
                </ul>
              </div>
            </details>
          </div>

          {/* Seller Block */}
          <div className="mt-12 p-6 bg-surface-container-low rounded-lg flex items-start gap-4">
            <div className="w-12 h-12 rounded-full overflow-hidden flex-shrink-0 bg-surface-variant">
              <img src={product.seller.logo} className="w-full h-full object-cover" />
            </div>
            <div>
              <h3 className="font-headline-md text-body-lg mb-1">{product.seller.name}</h3>
              <p className="font-body-md text-on-surface-variant text-sm mb-3">{product.seller.desc}</p>
              <Link to="#" className="font-label-sm text-label-sm uppercase tracking-widest text-primary underline underline-offset-4 hover:text-secondary transition-colors">
                View Artisan Profile
              </Link>
            </div>
          </div>

        </div>
      </div>
    </main>
  );
}
