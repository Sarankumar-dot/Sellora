import { useEffect } from 'react';
import { useLocation, useNavigate, Link, useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { apiClient } from '../../api/client';

export default function OrderSuccessPage() {
  const { orderId: paramsOrderId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  
  // orderId, totalAmount, items passed from CheckoutPage
  const stateData = location.state || {};
  const orderId = stateData.orderId || paramsOrderId;

  const { data: fetchedOrder, isLoading } = useQuery({
    queryKey: ['order', orderId],
    queryFn: async () => {
      const response = await apiClient.get(`/orders/${orderId}`);
      return response.data;
    },
    enabled: !!orderId && (!stateData.items || !stateData.totalAmount),
  });

  useEffect(() => {
    // If accessed directly without orderId, redirect to home
    if (!orderId) {
      navigate('/');
    }
  }, [orderId, navigate]);

  if (!orderId) return null;
  
  if (isLoading && (!stateData.items || !stateData.totalAmount)) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background text-on-background">
        <div className="flex flex-col items-center gap-4">
          <span className="material-symbols-outlined text-4xl text-primary animate-spin">progress_activity</span>
          <p className="font-body-md text-on-surface-variant">Loading order details...</p>
        </div>
      </div>
    );
  }

  const items = stateData.items || fetchedOrder?.items || [];
  const totalAmount = stateData.totalAmount || fetchedOrder?.totalAmount || 0;

  return (
    <div className="bg-background text-on-background min-h-screen flex flex-col font-body-md antialiased selection:bg-secondary-container selection:text-on-secondary-container">
      {/* TopNavBar (Minimal for Transactional Page) */}
      <header className="w-full bg-surface top-0 h-20 flex items-center justify-center border-b border-outline-variant/20 shadow-sm sticky z-50">
        <Link to="/" className="font-headline-md text-headline-md font-bold text-primary tracking-tight">Sellora</Link>
      </header>

      {/* Main Content Canvas */}
      <main className="flex-grow flex items-center justify-center px-gutter-mobile md:px-gutter-desktop py-margin-desktop">
        <div className="max-w-2xl w-full mx-auto bg-surface-container-lowest p-8 md:p-12 rounded-xl shadow-[0_10px_40px_rgba(26,26,26,0.03)] border border-outline-variant/10 text-center">
          
          {/* Success Icon */}
          <div className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-secondary-fixed/30 text-secondary mb-8 ring-8 ring-surface">
            <span className="material-symbols-outlined text-[48px]" style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span>
          </div>
          
          {/* Header */}
          <h1 className="font-headline-lg text-headline-lg text-primary mb-2">Thank you for your order!</h1>
          <p className="font-body-md text-body-md text-on-surface-variant mb-10">We've received your order and will contact you as soon as your package is shipped.</p>
          
          {/* Order Details Box */}
          <div className="bg-surface-container-low rounded-lg p-6 md:p-8 text-left mb-10 border border-outline-variant/20">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 pb-6 border-b border-outline-variant/20 gap-4">
              <div>
                <p className="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-widest mb-1">Order Number</p>
                <p className="font-label-md text-label-md text-on-surface font-semibold">#{orderId}</p>
              </div>
              <div className="md:text-right">
                <p className="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-widest mb-1">Estimated Delivery</p>
                <p className="font-label-md text-label-md text-on-surface font-semibold">3 - 5 Business Days</p>
              </div>
            </div>
            
            {/* Order Items */}
            <div className="space-y-4 mb-6">
              {items && items.map((item, index) => (
                <div key={index} className="flex items-center gap-4">
                  <div className="w-16 h-16 rounded-md bg-surface-container-highest overflow-hidden flex-shrink-0">
                    <img 
                      src={item.product?.images?.[0]?.url || 'https://via.placeholder.com/100'} 
                      alt={item.product?.name || 'Product'} 
                      className="w-full h-full object-cover" 
                    />
                  </div>
                  <div className="flex-grow">
                    <p className="font-label-md text-label-md text-on-surface line-clamp-1">{item.product?.name || 'Unknown Product'}</p>
                    <p className="font-body-md text-body-md text-on-surface-variant text-sm mt-1">Qty: {item.quantity}</p>
                  </div>
                  <div className="font-label-md text-label-md text-on-surface whitespace-nowrap">
                    ${parseFloat(item.price * item.quantity).toFixed(2)}
                  </div>
                </div>
              ))}
            </div>
            
            {/* Total */}
            <div className="flex justify-between items-center pt-4 border-t border-outline-variant/20">
              <p className="font-body-lg text-body-lg text-on-surface font-medium">Total</p>
              <p className="font-headline-md text-headline-md text-primary font-semibold">${parseFloat(totalAmount).toFixed(2)}</p>
            </div>
          </div>
          
          {/* Actions */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <button 
              onClick={() => navigate('/')} 
              className="w-full sm:w-auto bg-primary text-on-primary font-label-md text-label-md px-8 py-4 rounded-lg hover:bg-primary-container hover:text-on-primary-container transition-colors duration-200"
            >
              Continue Shopping
            </button>
            <button 
              onClick={() => navigate(`/orders/${orderId}`)} 
              className="w-full sm:w-auto bg-transparent text-primary font-label-md text-label-md px-8 py-4 rounded-lg border border-primary/20 hover:bg-surface-container-high transition-colors duration-200"
            >
              View Receipt
            </button>
          </div>
        </div>
      </main>

      {/* Footer (Minimal Footer for Success Page) */}
      <footer className="w-full bg-surface-container-highest py-8 px-gutter-desktop mt-auto">
        <div className="max-w-container-max mx-auto flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="font-body-md text-body-md text-on-surface-variant">© {new Date().getFullYear()} Sellora. All rights reserved.</p>
          <div className="flex gap-6">
            <a href="#" className="font-body-md text-body-md text-on-surface-variant hover:text-primary transition-colors">Support</a>
            <a href="#" className="font-body-md text-body-md text-on-surface-variant hover:text-primary transition-colors">Contact</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
