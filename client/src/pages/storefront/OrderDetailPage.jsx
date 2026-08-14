import { useQuery } from '@tanstack/react-query';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { apiClient } from '../../api/client';
import { format } from 'date-fns';

export default function OrderDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const { data: order, isLoading, error } = useQuery({
    queryKey: ['order', id],
    queryFn: async () => {
      const response = await apiClient.get(`/orders/${id}`);
      return response.data;
    },
  });

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background text-on-background">
        <div className="flex flex-col items-center gap-4">
          <span className="material-symbols-outlined text-4xl text-primary animate-spin">progress_activity</span>
          <p className="font-body-md text-on-surface-variant">Loading order details...</p>
        </div>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background text-on-background">
        <div className="text-center">
          <p className="font-body-md text-error mb-4">Failed to load order. It may not exist.</p>
          <button onClick={() => navigate('/orders')} className="bg-primary text-on-primary px-6 py-3 rounded-lg font-label-md text-label-md">Back to Orders</button>
        </div>
      </div>
    );
  }

  const getStatusDisplay = (status) => {
    const states = {
      PENDING: 1,
      SHIPPED: 2,
      DELIVERED: 3
    };
    
    const currentState = states[status] || 1;

    return (
      <div className="relative flex items-center justify-between w-full mt-8 mb-4 max-w-lg mx-auto">
        {/* Connecting Line */}
        <div className="absolute left-0 top-1/2 -translate-y-1/2 w-full h-1 bg-surface-variant rounded-full z-0"></div>
        <div 
          className="absolute left-0 top-1/2 -translate-y-1/2 h-1 bg-primary rounded-full z-0 transition-all duration-500"
          style={{ width: currentState === 1 ? '33%' : currentState === 2 ? '66%' : '100%' }}
        ></div>
        
        {/* Step 1: Ordered */}
        <div className="relative z-10 flex flex-col items-center gap-2 w-1/3">
          <div className={`w-8 h-8 rounded-full flex items-center justify-center shadow-md ${currentState >= 1 ? 'bg-primary text-on-primary' : 'bg-surface-container-highest border-2 border-surface-variant text-on-surface-variant'}`}>
            <span className="material-symbols-outlined text-sm">receipt_long</span>
          </div>
          <span className={`font-label-md text-label-md mt-2 ${currentState >= 1 ? 'text-primary' : 'text-on-surface-variant'}`}>Ordered</span>
        </div>
        
        {/* Step 2: Shipped */}
        <div className="relative z-10 flex flex-col items-center gap-2 w-1/3">
          <div className={`w-8 h-8 rounded-full flex items-center justify-center shadow-md ${currentState >= 2 ? 'bg-primary text-on-primary' : 'bg-surface-container-highest border-2 border-surface-variant text-on-surface-variant'}`}>
            <span className="material-symbols-outlined text-sm">local_shipping</span>
          </div>
          <span className={`font-label-md text-label-md mt-2 ${currentState >= 2 ? 'text-primary' : 'text-on-surface-variant'}`}>Shipped</span>
        </div>
        
        {/* Step 3: Delivered */}
        <div className="relative z-10 flex flex-col items-center gap-2 w-1/3">
          <div className={`w-8 h-8 rounded-full flex items-center justify-center shadow-md ${currentState >= 3 ? 'bg-primary text-on-primary' : 'bg-surface-container-highest border-2 border-surface-variant text-on-surface-variant'}`}>
            <span className="material-symbols-outlined text-sm">inventory_2</span>
          </div>
          <span className={`font-label-md text-label-md mt-2 ${currentState >= 3 ? 'text-primary' : 'text-on-surface-variant'}`}>Delivered</span>
        </div>
      </div>
    );
  };

  const address = order.shippingAddress || {};

  return (
    <div className="bg-background text-on-background font-body-md min-h-screen flex flex-col">
      <main className="flex-grow max-w-container-max mx-auto px-gutter-mobile md:px-gutter-desktop py-margin-desktop w-full grid grid-cols-1 lg:grid-cols-12 gap-12">
        
        {/* Header / Title Area */}
        <div className="col-span-1 lg:col-span-12 mb-4 flex flex-col md:flex-row justify-between items-start md:items-end border-b border-surface-variant pb-6 gap-6">
          <div>
            <Link to="/orders" className="text-on-surface-variant text-label-md font-label-md uppercase tracking-widest flex items-center gap-2 mb-4 hover:text-primary transition-colors">
              <span className="material-symbols-outlined text-sm">arrow_back</span> Back to Orders
            </Link>
            <h1 className="font-headline-lg text-headline-lg text-primary">Order #{order.id.substring(0, 8).toUpperCase()}</h1>
            <p className="text-on-surface-variant font-body-md mt-2">Placed on {format(new Date(order.createdAt), 'MMMM dd, yyyy')}</p>
          </div>
          <div className="flex gap-4 w-full md:w-auto">
            <button className="w-full md:w-auto px-6 py-3 border border-outline rounded-DEFAULT text-primary hover:bg-surface-container-low transition-colors font-label-md text-label-md">Download Invoice</button>
            <button className="w-full md:w-auto px-6 py-3 bg-primary text-on-primary rounded-DEFAULT hover:bg-primary-container transition-colors font-label-md text-label-md shadow-sm">Track Package</button>
          </div>
        </div>

        <div className="col-span-1 lg:col-span-12 grid grid-cols-1 lg:grid-cols-12 gap-12">
          {/* Left Column: Order Summary & Timeline */}
          <div className="col-span-1 lg:col-span-8 flex flex-col gap-8">
            
            {/* Order Timeline (Bento Style Card) */}
            <section className="bg-surface-container-lowest rounded-xl p-8 shadow-[0_4px_20px_rgba(26,26,26,0.03)] border border-surface-variant">
              <h2 className="font-headline-md text-headline-md text-primary mb-6">Delivery Status</h2>
              {getStatusDisplay(order.status)}
            </section>

            {/* Item List */}
            <section className="bg-surface-container-lowest rounded-xl shadow-[0_4px_20px_rgba(26,26,26,0.03)] border border-surface-variant overflow-hidden">
              <div className="p-6 border-b border-surface-variant">
                <h2 className="font-headline-md text-headline-md text-primary">Items Ordered</h2>
              </div>
              <div className="flex flex-col">
                {order.items.map((item, index) => (
                  <div key={index} className="flex items-center gap-6 p-6 border-b border-surface-variant hover:bg-surface-container-low transition-colors last:border-b-0">
                    <div className="w-24 h-32 bg-surface-container-high rounded overflow-hidden flex-shrink-0">
                      <img src={item.product?.images?.[0]?.url || 'https://via.placeholder.com/100'} alt={item.product?.name} className="w-full h-full object-cover" />
                    </div>
                    <div className="flex-grow">
                      <h3 className="font-body-lg text-body-lg text-primary mb-1 line-clamp-2">{item.product?.name || 'Unknown Product'}</h3>
                      <p className="text-on-surface-variant text-sm mb-2">Qty: {item.quantity}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-body-lg text-body-lg text-primary">${parseFloat(item.price * item.quantity).toFixed(2)}</p>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          </div>

          {/* Right Column: Summary, Shipping, Payment */}
          <div className="col-span-1 lg:col-span-4 flex flex-col gap-6">
            
            {/* Order Summary totals */}
            <section className="bg-surface-container-low rounded-xl p-6 border border-surface-variant">
              <h3 className="font-headline-md text-headline-md text-primary mb-6">Summary</h3>
              <div className="space-y-4 font-body-md text-body-md text-on-surface">
                <div className="flex justify-between">
                  <span className="text-on-surface-variant">Subtotal</span>
                  <span>${parseFloat(order.totalAmount).toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-on-surface-variant">Shipping</span>
                  <span>Free</span>
                </div>
                <div className="pt-4 border-t border-outline-variant flex justify-between font-bold text-lg">
                  <span>Total</span>
                  <span>${parseFloat(order.totalAmount).toFixed(2)}</span>
                </div>
              </div>
            </section>

            {/* Shipping Information */}
            <section className="bg-surface-container-lowest rounded-xl p-6 shadow-[0_2px_10px_rgba(26,26,26,0.02)] border border-surface-variant">
              <div className="flex items-center gap-3 mb-4">
                <span className="material-symbols-outlined text-on-surface-variant">location_on</span>
                <h3 className="font-body-lg text-body-lg font-medium text-primary">Shipping Address</h3>
              </div>
              <div className="text-on-surface-variant leading-relaxed pl-9">
                <p className="text-primary font-medium">{address.name || 'N/A'}</p>
                <p>{address.address}</p>
                <p>{address.city}, {address.state} {address.pincode}</p>
                <p>Phone: {address.phone}</p>
              </div>
            </section>
            
            {/* Payment Information */}
            <section className="bg-surface-container-lowest rounded-xl p-6 shadow-[0_2px_10px_rgba(26,26,26,0.02)] border border-surface-variant">
              <div className="flex items-center gap-3 mb-4">
                <span className="material-symbols-outlined text-on-surface-variant">credit_card</span>
                <h3 className="font-body-lg text-body-lg font-medium text-primary">Payment Status</h3>
              </div>
              <div className="flex items-center gap-4 pl-9">
                <div className={`w-16 h-8 rounded flex items-center justify-center font-label-md text-label-md ${order.paymentStatus === 'PAID' ? 'bg-secondary-container text-on-secondary-container' : 'bg-surface-variant text-on-surface-variant'}`}>
                  {order.paymentStatus || 'PENDING'}
                </div>
                {order.paymentId && (
                  <div>
                    <p className="text-primary">Txn ID: {order.paymentId.substring(0, 12)}...</p>
                  </div>
                )}
              </div>
            </section>
          </div>
        </div>
      </main>
    </div>
  );
}
