import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { apiClient } from '../../api/client';

export default function SellerOrdersPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');

  // Fetch Seller Orders
  const { data: orders = [], isLoading } = useQuery({
    queryKey: ['seller-orders'],
    queryFn: async () => {
      const response = await apiClient.get('/seller/orders');
      return response.data;
    },
  });

  const filteredOrders = orders.filter((order) => {
    const matchesSearch =
      order.order_id?.toString().includes(searchTerm) ||
      order.customer_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.product_name?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus =
      statusFilter === 'ALL' ||
      order.order_status?.toUpperCase() === statusFilter;

    return matchesSearch && matchesStatus;
  });

  if (isLoading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <span className="material-symbols-outlined text-4xl text-primary animate-spin">progress_activity</span>
          <p className="font-body-md text-on-surface-variant">Loading seller orders...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header Bar */}
      <div>
        <h1 className="font-display-lg text-headline-lg text-primary">Seller Orders</h1>
        <p className="font-body-md text-sm text-on-surface-variant mt-1">
          Monitor and track customer orders containing products from your store.
        </p>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-surface-container-lowest p-4 rounded-xl border border-surface-variant flex flex-col sm:flex-row gap-4 justify-between items-center">
        <div className="relative w-full sm:w-80">
          <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-outline text-xl">search</span>
          <input
            type="text"
            placeholder="Search by Order ID, Customer, or Product..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-surface border border-outline-variant rounded-lg font-body-md text-sm focus:outline-none focus:border-primary transition-colors text-on-surface"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto overflow-x-auto pb-1 sm:pb-0">
          {['ALL', 'PENDING', 'PLACED', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'CANCELLED'].map((status) => (
            <button
              key={status}
              onClick={() => setStatusFilter(status)}
              className={`px-3 py-1.5 rounded-lg text-xs font-label-md uppercase tracking-wider transition-colors whitespace-nowrap ${
                statusFilter === status
                  ? 'bg-primary text-on-primary font-semibold'
                  : 'bg-surface-container-low border border-outline-variant text-on-surface-variant hover:text-primary'
              }`}
            >
              {status}
            </button>
          ))}
        </div>
      </div>

      {/* Orders Table */}
      <div className="bg-surface-container-lowest rounded-xl border border-surface-variant shadow-ambient overflow-hidden">
        {filteredOrders.length === 0 ? (
          <div className="text-center py-16 px-6">
            <span className="material-symbols-outlined text-5xl text-outline mb-3">shopping_bag</span>
            <h3 className="font-headline-md text-headline-md text-primary mb-2">No orders found</h3>
            <p className="font-body-md text-sm text-on-surface-variant max-w-sm mx-auto">
              {searchTerm || statusFilter !== 'ALL'
                ? 'No orders match your filter parameters.'
                : 'Your store has not received any customer orders yet.'}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left font-body-md border-collapse">
              <thead>
                <tr className="border-b border-surface-variant bg-surface-bright text-on-surface-variant font-label-sm text-xs uppercase tracking-wider">
                  <th className="py-4 px-6">Order ID</th>
                  <th className="py-4 px-6">Customer</th>
                  <th className="py-4 px-6">Item Purchased</th>
                  <th className="py-4 px-6">Total Amount</th>
                  <th className="py-4 px-6">Payment</th>
                  <th className="py-4 px-6">Order Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-surface-variant text-sm">
                {filteredOrders.map((order, idx) => {
                  const itemTotal = order.price && order.quantity ? order.price * order.quantity : order.total_amount || 0;
                  return (
                    <tr key={order.order_id || idx} className="hover:bg-surface-container-low transition-colors">
                      <td className="py-4 px-6 font-semibold text-primary">
                        #{order.order_id}
                      </td>
                      <td className="py-4 px-6 text-on-surface font-medium">
                        {order.customer_name || 'Customer'}
                      </td>
                      <td className="py-4 px-6">
                        <div>
                          <p className="font-label-md text-label-md text-primary line-clamp-1">{order.product_name || 'Product'}</p>
                          <p className="font-body-md text-xs text-on-surface-variant">Qty: {order.quantity || 1} @ ${parseFloat(order.price || itemTotal).toFixed(2)}</p>
                        </div>
                      </td>
                      <td className="py-4 px-6 font-semibold text-primary">
                        ${parseFloat(itemTotal).toFixed(2)}
                      </td>
                      <td className="py-4 px-6">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium uppercase tracking-wider ${
                          order.payment_status === 'PAID'
                            ? 'bg-secondary-container text-on-secondary-container'
                            : 'bg-error-container text-on-error-container'
                        }`}>
                          {order.payment_status || 'PENDING'}
                        </span>
                      </td>
                      <td className="py-4 px-6">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium uppercase tracking-wider ${
                          order.order_status === 'DELIVERED'
                            ? 'bg-secondary-container text-on-secondary-container'
                            : order.order_status === 'SHIPPED' || order.order_status === 'PROCESSING'
                            ? 'bg-primary/10 text-primary'
                            : 'bg-surface-container-high text-on-surface'
                        }`}>
                          {order.order_status || 'PENDING'}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
