import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../../hooks/useCart';

export default function CartPage() {
  const { cartItems, isLoading, updateQuantity, removeFromCart, subtotal, totalItems } = useCart();
  const navigate = useNavigate();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background text-on-background">
        <div className="flex flex-col items-center gap-4">
          <span className="material-symbols-outlined text-4xl text-primary animate-spin">progress_activity</span>
          <p className="font-body-md text-on-surface-variant">Loading cart...</p>
        </div>
      </div>
    );
  }

  return (
    <main className="flex-grow max-w-container-max mx-auto w-full px-margin-mobile md:px-margin-desktop py-12 md:py-margin-desktop">
      <h1 className="font-headline-lg text-headline-lg mb-12 text-primary">Your Cart <span className="text-on-surface-variant text-lg ml-2">({totalItems} items)</span></h1>
      
      {cartItems.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 text-center border border-outline-variant rounded-lg bg-surface-container-lowest">
          <span className="material-symbols-outlined text-6xl text-outline mb-4">shopping_cart</span>
          <h2 className="font-headline-md text-headline-md mb-2 text-primary">Your cart is empty</h2>
          <p className="font-body-md text-body-md text-on-surface-variant mb-8">Looks like you haven't added anything yet.</p>
          <Link to="/products" className="bg-primary text-on-primary py-3 px-8 rounded-DEFAULT font-label-md text-label-md hover:bg-primary-container transition-colors shadow-sm">
            Continue Shopping
          </Link>
        </div>
      ) : (
        <div className="flex flex-col lg:flex-row gap-12 lg:gap-24">
          {/* Cart Items List */}
          <div className="flex-grow flex flex-col gap-8">
            {cartItems.map((item) => (
              <div key={item.id} className="flex gap-6 pb-8 border-b border-surface-variant">
                <div className="w-32 h-40 bg-surface-container-low shrink-0 relative overflow-hidden group rounded-sm">
                  <img
                    src={item.image_url || 'https://via.placeholder.com/150'}
                    alt={item.productName}
                    className="object-cover w-full h-full absolute inset-0 transition-transform duration-700 group-hover:scale-105"
                  />
                </div>
                
                <div className="flex flex-col justify-between flex-grow py-2">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-headline-md text-body-lg font-medium text-primary mb-1">{item.productName}</h3>
                    </div>
                    <span className="font-body-lg text-body-md font-medium text-primary">${parseFloat(item.price * item.quantity).toFixed(2)}</span>
                  </div>
                  
                  <div className="flex justify-between items-end mt-4">
                    {/* Stepper */}
                    <div className="flex items-center border border-outline-variant rounded bg-surface">
                      <button 
                        onClick={() => updateQuantity({ id: item.id, quantity: Math.max(1, item.quantity - 1) })}
                        disabled={item.quantity <= 1}
                        className="w-8 h-8 flex items-center justify-center text-on-surface-variant hover:text-primary transition-colors disabled:opacity-50"
                      >
                        <span className="material-symbols-outlined text-sm">remove</span>
                      </button>
                      <span className="w-8 text-center font-body-md text-sm text-primary">{item.quantity}</span>
                      <button 
                        onClick={() => updateQuantity({ id: item.id, quantity: item.quantity + 1 })}
                        className="w-8 h-8 flex items-center justify-center text-on-surface-variant hover:text-primary transition-colors"
                      >
                        <span className="material-symbols-outlined text-sm">add</span>
                      </button>
                    </div>
                    
                    <button 
                      onClick={() => removeFromCart(item.id)}
                      className="font-label-md text-label-sm text-on-surface-variant hover:text-error transition-colors underline underline-offset-4"
                    >
                      Remove
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Summary Sidebar */}
          <div className="w-full lg:w-[400px] shrink-0">
            <div className="bg-surface-container-low p-8 rounded-lg sticky top-28">
              <h2 className="font-headline-md text-headline-md mb-6 border-b border-surface-variant pb-4 text-primary">Order Summary</h2>
              
              <div className="flex flex-col gap-4 mb-8 font-body-md text-body-md text-on-surface-variant">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span className="text-primary font-medium">${parseFloat(subtotal).toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Shipping</span>
                  <span>Calculated at checkout</span>
                </div>
                <div className="flex justify-between">
                  <span>Taxes</span>
                  <span>Calculated at checkout</span>
                </div>
              </div>
              
              <div className="flex justify-between items-center mb-8 pt-6 border-t border-surface-variant">
                <span className="font-headline-md text-body-lg font-medium text-primary">Total</span>
                <span className="font-headline-md text-headline-lg font-semibold text-primary">${parseFloat(subtotal).toFixed(2)}</span>
              </div>
              
              <button 
                onClick={() => navigate('/checkout')}
                className="w-full bg-primary text-on-primary py-4 rounded-DEFAULT font-label-md text-label-md hover:bg-secondary transition-colors duration-300 mb-4 shadow-[0_10px_30px_rgba(26,26,26,0.1)] hover:shadow-[0_15px_40px_rgba(144,76,49,0.2)]"
              >
                Proceed to Checkout
              </button>
              
              <div className="flex items-center justify-center gap-2 text-on-surface-variant mt-6">
                <span className="material-symbols-outlined text-sm">lock</span>
                <span className="font-body-md text-sm">Secure Checkout</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
