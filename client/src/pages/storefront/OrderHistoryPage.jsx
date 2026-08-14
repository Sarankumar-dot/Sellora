import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { apiClient } from '../../api/client';
import { format } from 'date-fns';

export default function OrderHistoryPage() {
  const { data: orders = [], isLoading, error } = useQuery({
    queryKey: ['orders'],
    queryFn: async () => {
      const response = await apiClient.get('/orders');
      return response.data;
    },
  });

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background text-on-background">
        <div className="flex flex-col items-center gap-4">
          <span className="material-symbols-outlined text-4xl text-primary animate-spin">progress_activity</span>
          <p className="font-body-md text-on-surface-variant">Loading orders...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background text-on-background">
        <p className="font-body-md text-error">Failed to load orders. Please try again.</p>
      </div>
    );
  }

  const getStatusBadge = (status) => {
    switch (status) {
      case 'DELIVERED':
        return <span className="inline-flex items-center px-3 py-1 rounded-full font-label-sm text-label-sm bg-surface-container-high text-on-surface-variant">Delivered</span>;
      case 'SHIPPED':
        return <span className="inline-flex items-center px-3 py-1 rounded-full font-label-sm text-label-sm bg-secondary-fixed text-on-secondary-fixed">Shipped</span>;
      default:
        return <span className="inline-flex items-center px-3 py-1 rounded-full font-label-sm text-label-sm bg-surface-variant text-on-surface-variant border border-outline-variant/30">Pending</span>;
    }
  };

  return (
    <div className="bg-background text-on-background font-body-md text-body-md min-h-screen flex flex-col">
      <main className="flex-grow w-full max-w-container-max mx-auto px-gutter-mobile md:px-gutter-desktop py-margin-desktop">
        
        {/* Header Section */}
        <div className="mb-12">
          <h1 className="font-headline-lg text-headline-lg text-primary mb-4">Order History</h1>
          <p className="font-body-md text-body-md text-on-surface-variant">Review your past purchases and track current shipments.</p>
        </div>

        {orders.length === 0 ? (
          <div className="bg-surface-container-lowest rounded-lg overflow-hidden border border-surface-container shadow-[0_10px_30px_rgba(26,26,26,0.02)] p-12 text-center">
            <span className="material-symbols-outlined text-[48px] text-outline mb-4">package</span>
            <h2 className="font-headline-md text-headline-md mb-2 text-primary">No orders yet</h2>
            <p className="font-body-md text-on-surface-variant mb-6">You haven't placed any orders. Start exploring our collections!</p>
            <Link to="/products" className="inline-flex bg-primary text-on-primary px-8 py-3 rounded-lg font-label-md text-label-md hover:bg-primary-container hover:text-on-primary-container transition-colors shadow-sm">
              Shop Now
            </Link>
          </div>
        ) : (
          <div className="bg-surface-container-lowest rounded-lg overflow-hidden border border-surface-container shadow-[0_10px_30px_rgba(26,26,26,0.02)]">
            
            {/* Desktop Table */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead className="bg-surface-container-low font-label-md text-label-md text-on-surface-variant uppercase border-b border-surface-container">
                  <tr>
                    <th className="py-4 px-6 font-semibold whitespace-nowrap">Order ID</th>
                    <th className="py-4 px-6 font-semibold whitespace-nowrap">Date</th>
                    <th className="py-4 px-6 font-semibold">Items</th>
                    <th className="py-4 px-6 font-semibold text-right whitespace-nowrap">Total</th>
                    <th className="py-4 px-6 font-semibold text-center whitespace-nowrap">Status</th>
                    <th className="py-4 px-6 font-semibold text-right whitespace-nowrap">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-surface-container">
                  {orders.map((order) => (
                    <tr key={order.id} className="hover:bg-surface-container/50 transition-colors duration-200 group">
                      <td className="py-6 px-6 align-middle font-body-md text-body-md text-primary">
                        #{order.id.substring(0, 8).toUpperCase()}
                      </td>
                      <td className="py-6 px-6 align-middle text-on-surface-variant">
                        {format(new Date(order.createdAt), 'MMM dd, yyyy')}
                      </td>
                      <td className="py-6 px-6 align-middle">
                        <div className="flex -space-x-2">
                          {order.items.slice(0, 3).map((item, idx) => (
                            <div key={idx} className="w-12 h-12 rounded-DEFAULT overflow-hidden border border-surface-container-lowest shadow-sm relative" style={{ zIndex: 30 - idx }}>
                              <img 
                                src={item.product?.images?.[0]?.url || 'https://via.placeholder.com/48'} 
                                alt={item.product?.name} 
                                className="w-full h-full object-cover" 
                              />
                            </div>
                          ))}
                          {order.items.length > 3 && (
                            <div className="w-12 h-12 rounded-DEFAULT overflow-hidden border border-surface-container-lowest shadow-sm relative flex items-center justify-center bg-surface-container-highest text-on-surface-variant font-label-sm text-label-sm" style={{ zIndex: 0 }}>
                              +{order.items.length - 3}
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="py-6 px-6 align-middle text-right font-medium text-primary">
                        ${parseFloat(order.totalAmount).toFixed(2)}
                      </td>
                      <td className="py-6 px-6 align-middle text-center">
                        {getStatusBadge(order.status)}
                      </td>
                      <td className="py-6 px-6 align-middle text-right">
                        <Link to={`/orders/${order.id}`} className="font-label-md text-label-md text-on-surface-variant group-hover:text-primary transition-colors inline-flex items-center gap-1 cursor-pointer">
                          View Details <span className="material-symbols-outlined text-[16px]">chevron_right</span>
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile List */}
            <div className="md:hidden divide-y divide-surface-container">
              {orders.map((order) => (
                <div key={order.id} className="p-4 flex flex-col gap-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <span className="font-body-md text-body-md text-primary font-medium block mb-1">#{order.id.substring(0, 8).toUpperCase()}</span>
                      <span className="font-label-md text-label-md text-on-surface-variant">{format(new Date(order.createdAt), 'MMM dd, yyyy')}</span>
                    </div>
                    <div>{getStatusBadge(order.status)}</div>
                  </div>
                  
                  <div className="flex justify-between items-end mt-2">
                    <div className="flex -space-x-2">
                      {order.items.slice(0, 3).map((item, idx) => (
                        <div key={idx} className="w-10 h-10 rounded-DEFAULT overflow-hidden border border-surface-container-lowest shadow-sm relative" style={{ zIndex: 30 - idx }}>
                          <img 
                            src={item.product?.images?.[0]?.url || 'https://via.placeholder.com/40'} 
                            alt={item.product?.name} 
                            className="w-full h-full object-cover" 
                          />
                        </div>
                      ))}
                      {order.items.length > 3 && (
                        <div className="w-10 h-10 rounded-DEFAULT overflow-hidden border border-surface-container-lowest shadow-sm relative flex items-center justify-center bg-surface-container-highest text-on-surface-variant font-label-sm text-label-sm" style={{ zIndex: 0 }}>
                          +{order.items.length - 3}
                        </div>
                      )}
                    </div>
                    <div className="text-right">
                      <span className="font-body-md text-body-md text-primary font-medium block mb-2">${parseFloat(order.totalAmount).toFixed(2)}</span>
                      <Link to={`/orders/${order.id}`} className="font-label-md text-label-md text-on-surface-variant hover:text-primary inline-flex items-center gap-1">
                        View Details <span className="material-symbols-outlined text-[16px]">chevron_right</span>
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Pagination Footer - Just for UI completeness if > 0 orders */}
            {orders.length > 0 && (
              <div className="bg-surface-container-lowest border-t border-surface-container px-6 py-4 flex items-center justify-between">
                <span className="font-body-md text-body-md text-on-surface-variant text-sm">Showing {orders.length} orders</span>
                <div className="flex gap-2">
                  <button className="w-8 h-8 flex items-center justify-center rounded-DEFAULT border border-outline-variant text-outline hover:text-primary hover:border-primary transition-colors disabled:opacity-50 disabled:cursor-not-allowed" disabled>
                    <span className="material-symbols-outlined text-[18px]">chevron_left</span>
                  </button>
                  <button className="w-8 h-8 flex items-center justify-center rounded-DEFAULT border border-outline-variant text-outline hover:text-primary hover:border-primary transition-colors disabled:opacity-50 disabled:cursor-not-allowed" disabled>
                    <span className="material-symbols-outlined text-[18px]">chevron_right</span>
                  </button>
                </div>
              </div>
            )}
            
          </div>
        )}
      </main>
    </div>
  );
}
