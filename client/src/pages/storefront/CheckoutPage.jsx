import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useCart } from '../../hooks/useCart';
import { apiClient } from '../../api/client';

const shippingSchema = z.object({
  name: z.string().min(2, 'Name is required'),
  address: z.string().min(5, 'Address is required'),
  city: z.string().min(2, 'City is required'),
  state: z.string().min(2, 'State is required'),
  pincode: z.string().min(5, 'Pincode is required'),
  phone: z.string().min(10, 'Valid phone number is required'),
});

const loadRazorpayScript = () => {
  return new Promise((resolve) => {
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
};

export default function CheckoutPage() {
  const navigate = useNavigate();
  const { cartItems, subtotal, isLoading: cartLoading } = useCart();
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentError, setPaymentError] = useState(null);
  
  const { register, handleSubmit, formState: { errors } } = useForm({
    resolver: zodResolver(shippingSchema),
  });

  const onSubmit = async (data) => {
    setIsProcessing(true);
    setPaymentError(null);

    const scriptLoaded = await loadRazorpayScript();
    if (!scriptLoaded) {
      setPaymentError('Failed to load payment gateway. Please check your connection and try again.');
      setIsProcessing(false);
      return;
    }

    try {
      const orderResponse = await apiClient.post('/orders', {
        shippingAddress: data,
      });
      
      const { order, razorpayOrderId, razorpayKeyId } = orderResponse.data;

      const options = {
        key: razorpayKeyId,
        amount: order.totalAmount * 100, // Amount in paise
        currency: 'INR',
        name: 'Sellora',
        description: 'Storefront Purchase',
        order_id: razorpayOrderId,
        handler: async function (response) {
          try {
            await apiClient.post('/payments/verify', {
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
            });
            
            navigate(`/order-success/${order.id}`, { 
              state: { 
                orderId: order.id, 
                totalAmount: order.totalAmount,
                items: order.items 
              } 
            });
          } catch (error) {
            console.error('Verification failed', error);
            setPaymentError('Payment verification failed. If money was deducted, it will be refunded.');
            setIsProcessing(false);
          }
        },
        modal: {
          ondismiss: function () {
            setPaymentError('Payment was cancelled. You can retry below.');
            setIsProcessing(false);
          },
        },
        prefill: {
          name: data.name,
          contact: data.phone,
        },
        theme: {
          color: '#1a1a1a',
        },
      };

      const paymentObject = new window.Razorpay(options);
      paymentObject.open();

    } catch (error) {
      console.error('Order creation failed', error);
      setPaymentError(error.response?.data?.message || 'Failed to create order. Please try again.');
      setIsProcessing(false);
    }
  };

  if (cartLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background text-on-background">
        <div className="flex flex-col items-center gap-4">
          <span className="material-symbols-outlined text-4xl text-primary animate-spin">progress_activity</span>
          <p className="font-body-md text-on-surface-variant">Loading checkout...</p>
        </div>
      </div>
    );
  }

  const tax = subtotal * 0.08;
  const total = subtotal + tax;

  return (
    <div className="bg-background text-on-background min-h-screen flex flex-col font-body-md antialiased">
      {/* Header - Transactional Layout */}
      <header className="w-full top-0 bg-surface dark:bg-surface-container py-6 px-margin-mobile md:px-margin-desktop border-b border-surface-variant z-40 sticky">
        <div className="max-w-container-max mx-auto flex justify-between items-center h-12">
          <button onClick={() => navigate('/cart')} className="md:hidden text-on-surface-variant flex items-center justify-center -ml-2">
            <span className="material-symbols-outlined">arrow_back</span>
          </button>
          <a href="/" className="font-display-lg text-headline-lg tracking-tight text-primary dark:text-on-surface cursor-pointer">Sellora</a>
          <div className="flex items-center gap-2 text-on-surface-variant font-label-md text-label-md">
            <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 0" }}>lock</span>
            <span className="hidden md:inline">Secure Checkout</span>
          </div>
        </div>
      </header>

      {/* Main Checkout Canvas */}
      <main className="flex-grow max-w-container-max mx-auto w-full px-margin-mobile md:px-margin-desktop py-12 md:py-20 grid grid-cols-1 lg:grid-cols-12 gap-gutter-desktop">
        
        {/* Left Column: Forms */}
        <div className="lg:col-span-7 xl:col-span-8 flex flex-col gap-12">
          
          {/* Step Indicator */}
          <nav aria-label="Progress" className="hidden md:block">
            <ol className="flex items-center" role="list">
              <li className="relative pr-8 sm:pr-20">
                <div className="absolute inset-0 flex items-center" aria-hidden="true">
                  <div className="h-0.5 w-full bg-primary"></div>
                </div>
                <div className="relative flex h-8 w-8 items-center justify-center rounded-full bg-primary text-on-primary">
                  <span className="material-symbols-outlined text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>check</span>
                </div>
              </li>
              <li className="relative pr-8 sm:pr-20">
                <div className="absolute inset-0 flex items-center" aria-hidden="true">
                  <div className="h-0.5 w-full bg-surface-variant"></div>
                </div>
                <div className="relative flex h-8 w-8 items-center justify-center rounded-full border-2 border-primary bg-surface">
                  <span className="font-label-md text-label-md text-primary">2</span>
                </div>
              </li>
              <li className="relative pr-8 sm:pr-20">
                <div className="absolute inset-0 flex items-center" aria-hidden="true">
                  <div className="h-0.5 w-full bg-surface-variant"></div>
                </div>
                <div className="relative flex h-8 w-8 items-center justify-center rounded-full border-2 border-surface-variant bg-surface">
                  <span className="font-label-md text-label-md text-on-surface-variant">3</span>
                </div>
              </li>
            </ol>
          </nav>

          {/* Address Form */}
          <section>
            <div className="flex items-center gap-2 mb-8">
              <span className="md:hidden bg-primary text-on-primary w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold">2</span>
              <h1 className="font-headline-lg text-headline-lg text-primary">Shipping Address</h1>
            </div>

            {paymentError && (
              <div className="mb-6 p-4 bg-error-container text-on-error-container rounded-lg flex items-start gap-3">
                <span className="material-symbols-outlined">error</span>
                <p className="font-body-md text-sm">{paymentError}</p>
              </div>
            )}

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              
              <div>
                <label className="block font-label-sm text-label-sm text-on-surface mb-2 uppercase tracking-wider" htmlFor="name">Full name</label>
                <input 
                  {...register('name')}
                  id="name" 
                  type="text" 
                  placeholder="Jane Doe"
                  className={`block w-full rounded-md p-3 font-body-md text-body-md bg-surface-bright border ${errors.name ? 'border-error' : 'border-outline-variant'} focus:border-primary focus:outline-none transition-colors text-on-surface`}
                />
                {errors.name && <p className="text-sm text-error mt-1">{errors.name.message}</p>}
              </div>

              <div>
                <label className="block font-label-sm text-label-sm text-on-surface mb-2 uppercase tracking-wider" htmlFor="address">Address</label>
                <input 
                  {...register('address')}
                  id="address" 
                  type="text" 
                  placeholder="123 Luxury Lane"
                  className={`block w-full rounded-md p-3 font-body-md text-body-md bg-surface-bright border ${errors.address ? 'border-error' : 'border-outline-variant'} focus:border-primary focus:outline-none transition-colors text-on-surface`}
                />
                {errors.address && <p className="text-sm text-error mt-1">{errors.address.message}</p>}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                <div className="sm:col-span-1">
                  <label className="block font-label-sm text-label-sm text-on-surface mb-2 uppercase tracking-wider" htmlFor="city">City</label>
                  <input 
                    {...register('city')}
                    id="city" 
                    type="text" 
                    placeholder="New York"
                    className={`block w-full rounded-md p-3 font-body-md text-body-md bg-surface-bright border ${errors.city ? 'border-error' : 'border-outline-variant'} focus:border-primary focus:outline-none transition-colors text-on-surface`}
                  />
                  {errors.city && <p className="text-sm text-error mt-1">{errors.city.message}</p>}
                </div>
                
                <div className="sm:col-span-1">
                  <label className="block font-label-sm text-label-sm text-on-surface mb-2 uppercase tracking-wider" htmlFor="state">State</label>
                  <input 
                    {...register('state')}
                    id="state" 
                    type="text" 
                    placeholder="NY"
                    className={`block w-full rounded-md p-3 font-body-md text-body-md bg-surface-bright border ${errors.state ? 'border-error' : 'border-outline-variant'} focus:border-primary focus:outline-none transition-colors text-on-surface`}
                  />
                  {errors.state && <p className="text-sm text-error mt-1">{errors.state.message}</p>}
                </div>
                
                <div className="sm:col-span-1">
                  <label className="block font-label-sm text-label-sm text-on-surface mb-2 uppercase tracking-wider" htmlFor="pincode">ZIP code</label>
                  <input 
                    {...register('pincode')}
                    id="pincode" 
                    type="text" 
                    placeholder="10001"
                    className={`block w-full rounded-md p-3 font-body-md text-body-md bg-surface-bright border ${errors.pincode ? 'border-error' : 'border-outline-variant'} focus:border-primary focus:outline-none transition-colors text-on-surface`}
                  />
                  {errors.pincode && <p className="text-sm text-error mt-1">{errors.pincode.message}</p>}
                </div>
              </div>

              <div>
                <label className="block font-label-sm text-label-sm text-on-surface mb-2 uppercase tracking-wider" htmlFor="phone">Phone</label>
                <input 
                  {...register('phone')}
                  id="phone" 
                  type="tel" 
                  placeholder="(555) 123-4567"
                  className={`block w-full rounded-md p-3 font-body-md text-body-md bg-surface-bright border ${errors.phone ? 'border-error' : 'border-outline-variant'} focus:border-primary focus:outline-none transition-colors text-on-surface`}
                />
                {errors.phone && <p className="text-sm text-error mt-1">{errors.phone.message}</p>}
              </div>

              <div className="pt-8 pb-20 md:pb-0">
                <button 
                  type="submit" 
                  disabled={isProcessing}
                  className="w-full sm:w-auto bg-secondary hover:bg-on-secondary-container text-on-secondary font-label-md text-label-md px-10 py-4 rounded-lg transition-colors inline-flex items-center justify-center gap-2 disabled:opacity-70 shadow-sm"
                >
                  {isProcessing ? 'Processing...' : paymentError ? 'Retry Payment' : 'Continue to Payment'}
                  {!isProcessing && <span className="material-symbols-outlined text-sm" style={{ fontVariationSettings: "'FILL' 0" }}>arrow_forward</span>}
                </button>
              </div>
            </form>
          </section>
        </div>

        {/* Right Column: Order Summary */}
        <div className="lg:col-span-5 xl:col-span-4 mt-12 lg:mt-0 hidden md:block">
          <div className="bg-surface-container-lowest rounded-xl p-8 border border-surface-variant sticky top-28 shadow-ambient">
            <h2 className="font-headline-md text-headline-md text-primary mb-6">Order Summary</h2>
            
            <div className="space-y-6 mb-8 border-b border-surface-variant pb-8 max-h-[400px] overflow-y-auto pr-2 no-scrollbar">
              {cartItems.map((item) => (
                <div key={item.id} className="flex gap-4">
                  <div className="h-24 w-20 flex-shrink-0 rounded-md overflow-hidden bg-surface-container relative">
                    <img src={item.image_url || 'https://via.placeholder.com/100'} alt={item.productName} className="object-cover w-full h-full" />
                    <span className="absolute -top-2 -right-2 bg-outline text-on-primary text-[10px] w-5 h-5 flex items-center justify-center rounded-full z-10">{item.quantity}</span>
                  </div>
                  <div className="flex-grow flex flex-col justify-between py-1">
                    <div>
                      <h3 className="font-label-md text-label-md text-primary line-clamp-2">{item.productName}</h3>
                    </div>
                    <p className="font-label-md text-label-md text-primary">${parseFloat(item.price).toFixed(2)}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="space-y-4 font-body-md text-body-md text-on-surface">
              <div className="flex justify-between">
                <span className="text-on-surface-variant">Subtotal</span>
                <span>${parseFloat(subtotal).toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-on-surface-variant">Shipping</span>
                <span>Calculated next step</span>
              </div>
              <div className="flex justify-between">
                <span className="text-on-surface-variant">Taxes</span>
                <span>${parseFloat(tax).toFixed(2)}</span>
              </div>
              <div className="flex justify-between pt-4 border-t border-surface-variant font-label-md text-label-md text-primary text-lg">
                <span>Total</span>
                <span>${parseFloat(total).toFixed(2)}</span>
              </div>
            </div>
          </div>
        </div>
      </main>
      
      {/* Sticky Bottom CTA (Mobile Only) */}
      <div className="md:hidden fixed bottom-0 left-0 w-full bg-surface-container-lowest border-t border-surface-variant p-4 pb-8 shadow-ambient z-50">
        <div className="flex justify-between items-center mb-4 font-label-md text-label-md text-primary text-lg">
           <span>Total</span>
           <span>${parseFloat(total).toFixed(2)}</span>
        </div>
        <button 
          type="button" 
          disabled={isProcessing}
          onClick={handleSubmit(onSubmit)}
          className="w-full bg-secondary hover:bg-on-secondary-container text-on-secondary font-label-md text-label-md px-10 py-4 rounded-lg transition-colors flex items-center justify-center gap-2 disabled:opacity-70 shadow-sm"
        >
          {isProcessing ? 'Processing...' : paymentError ? 'Retry Payment' : 'Pay via Razorpay'}
          {!isProcessing && <span className="material-symbols-outlined text-sm">payment</span>}
        </button>
      </div>
    </div>
  );
}
