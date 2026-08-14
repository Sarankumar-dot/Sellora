import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '../../api/client';

const ORDER_STATUSES = ['PENDING', 'PLACED', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'CANCELLED'];

export default function AdminOrdersPage() {
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [updatingId, setUpdatingId] = useState(null);

  // Fetch All Platform Orders
  const { data: orders = [], isLoading } = useQuery({
    queryKey: ['admin-orders'],
    queryFn: async () => {
      const response = await apiClient.get('/admin/orders');
      return response.data;
    },
  });

  // Update Order Status Mutation
  const updateStatusMutation = useMutation({
    mutationFn: async ({ orderId, status }) => {
      const response = await apiClient.put(`/admin/orders/${orderId}/status`, { status });
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-orders'] });
      setUpdatingId(null);
    },
    onError: (err) => {
      alert(err.response?.data?.message || 'Failed to update order status.');
      setUpdatingId(null);
    }
  });

  const handleStatusChange = (orderId, newStatus) => {
    setUpdatingId(orderId);
    updateStatusMutation.mutate({ orderId, status: newStatus });
  };

  const filteredOrders = orders.filter((order) => {
    const orderIdStr = (order.id || order.order_id || '').toString();
    const customerStr = (order.customerName || order.customer_name || '').toLowerCase();

    const matchesSearch =
      orderIdStr.includes(searchTerm) || customerStr.includes(searchTerm.toLowerCase());

    const currentStatus = (order.status || order.order_status || '').toUpperCase();
    const matchesStatus = statusFilter === 'ALL' || currentStatus === statusFilter;

    return matchesSearch && matchesStatus;
  });

  if (isLoading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <span className="material-symbols-outlined text-4xl text-primary animate-spin">progress_activity</span>
          <p className="font-body-md text-on-surface-variant">Loading platform orders...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header Bar */}
      <div>
        <h1 className="font-display-lg text-headline-lg text-primary">Platform Orders Management</h1>
        <p className="font-body-md text-sm text-on-surface-variant mt-1">
          Oversee and update fulfillment status across all marketplace transactions.
        </p>
      </div>

      {/* Search and Filter Controls */}
      <div className="bg-surface-container-lowest p-4 rounded-xl border border-surface-variant flex flex-col sm:flex-row gap-4 justify-between items-center">
        <div className="relative w-full sm:w-80">
          <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-outline text-xl">search</span>
          <input
            type="text"
            placeholder="Search by Order ID..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-surface border border-outline-variant rounded-lg font-body-md text-sm focus:outline-none focus:border-primary transition-colors text-on-surface"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto overflow-x-auto pb-1 sm:pb-0">
          {['ALL', ...ORDER_STATUSES].map((status) => (
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
                ? 'No platform orders match your search parameters.'
                : 'No orders have been submitted on the platform yet.'}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left font-body-md border-collapse">
              <thead>
                <tr className="border-b border-surface-variant bg-surface-bright text-on-surface-variant font-label-sm text-xs uppercase tracking-wider">
                  <th className="py-4 px-6">Order ID</th>
                  <th className="py-4 px-6">Total Amount</th>
                  <th className="py-4 px-6">Payment Status</th>
                  <th className="py-4 px-6">Current Status</th>
                  <th className="py-4 px-6 text-right">Update Order Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-surface-variant text-sm">
                {filteredOrders.map((order, idx) => {
                  const orderId = order.id || order.order_id;
                  const currentStatus = order.status || order.order_status || 'PENDING';
                  const paymentStatus = order.payment_status || order.paymentStatus || 'PENDING';
                  const totalAmt = order.total_amount || order.totalAmount || 0;

                  return (
                    <tr key={orderId || idx} className="hover:bg-surface-container-low transition-colors">
                      <td className="py-4 px-6 font-semibold text-primary">#{orderId}</td>
                      <td className="py-4 px-6 font-semibold text-primary">${parseFloat(totalAmt).toFixed(2)}</td>
                      <td className="py-4 px-6">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium uppercase tracking-wider ${
                          paymentStatus === 'PAID'
                            ? 'bg-secondary-container text-on-secondary-container'
                            : 'bg-error-container text-on-error-container'
                        }`}>
                          {paymentStatus}
                        </span>
                      </td>
                      <td className="py-4 px-6">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium uppercase tracking-wider ${
                          currentStatus === 'DELIVERED'
                            ? 'bg-secondary-container text-on-secondary-container'
                            : currentStatus === 'SHIPPED' || currentStatus === 'PROCESSING'
                            ? 'bg-primary/10 text-primary'
                            : currentStatus === 'CANCELLED'
                            ? 'bg-error-container text-on-error-container'
                            : 'bg-surface-container-high text-on-surface'
                        }`}>
                          {currentStatus}
                        </span>
                      </td>
                      <td className="py-4 px-6 text-right">
                        <select
                          value={currentStatus}
                          disabled={updatingId === orderId}
                          onChange={(e) => handleStatusChange(orderId, e.target.value)}
                          className="px-3 py-1.5 bg-surface border border-outline-variant rounded-lg text-xs font-label-md text-primary focus:outline-none focus:border-primary cursor-pointer disabled:opacity-50"
                        >
                          {ORDER_STATUSES.map((st) => (
                            <option key={st} value={st}>{st}</option>
                          ))}
                        </select>
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
