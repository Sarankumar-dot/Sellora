import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { apiClient } from '../../api/client';

export default function AdminDashboardPage() {
  // Fetch All Platform Orders
  const { data: orders = [], isLoading: isLoadingOrders } = useQuery({
    queryKey: ['admin-orders'],
    queryFn: async () => {
      const response = await apiClient.get('/admin/orders');
      return response.data;
    },
  });

  // Fetch Categories
  const { data: categories = [], isLoading: isLoadingCategories } = useQuery({
    queryKey: ['categories'],
    queryFn: async () => {
      const response = await apiClient.get('/categories');
      return response.data;
    },
  });

  const grossRevenue = orders.reduce((sum, order) => {
    const amt = parseFloat(order.total_amount || order.totalAmount || 0);
    return sum + (isNaN(amt) ? 0 : amt);
  }, 0);

  const pendingOrdersCount = orders.filter(
    (o) => (o.status || o.order_status) === 'PENDING' || (o.status || o.order_status) === 'PROCESSING'
  ).length;

  const isLoading = isLoadingOrders || isLoadingCategories;

  if (isLoading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <span className="material-symbols-outlined text-4xl text-primary animate-spin">progress_activity</span>
          <p className="font-body-md text-on-surface-variant">Loading admin dashboard metrics...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header Banner */}
      <div className="bg-surface-container-lowest p-8 rounded-xl border border-surface-variant shadow-ambient flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <span className="font-label-sm text-xs text-error uppercase tracking-widest font-semibold">Platform Management</span>
          <h1 className="font-display-lg text-headline-lg text-primary mt-1">Admin Dashboard</h1>
          <p className="font-body-md text-body-md text-on-surface-variant mt-1 max-w-xl">
            Overview of platform transactions, active category taxonomies, and fulfillment pipelines.
          </p>
        </div>

        <div className="flex gap-4 w-full md:w-auto">
          <Link
            to="/admin/categories"
            className="flex-1 md:flex-none bg-primary text-on-primary font-label-md text-label-md px-6 py-3 rounded-lg hover:bg-primary-container hover:text-on-primary-container transition-colors inline-flex items-center justify-center gap-2 shadow-sm"
          >
            <span className="material-symbols-outlined text-sm">category</span>
            <span>Manage Categories</span>
          </Link>
          <Link
            to="/admin/orders"
            className="bg-surface border border-outline-variant text-on-surface hover:bg-surface-container-low font-label-md text-label-md px-4 py-3 rounded-lg transition-colors inline-flex items-center justify-center gap-2"
          >
            <span className="material-symbols-outlined text-sm">orders</span>
            <span>All Orders</span>
          </Link>
        </div>
      </div>

      {/* Backend Metrics Notice */}
      <div className="p-4 bg-surface-container-high rounded-xl border border-outline-variant/30 flex items-start gap-3 text-xs text-on-surface-variant">
        <span className="material-symbols-outlined text-sm text-amber-500 mt-0.5">info</span>
        <div>
          <p className="font-semibold text-primary">Backend Analytics Notice:</p>
          <p className="mt-0.5">
            Platform metrics below are derived directly from live transactions (`GET /admin/orders`) and taxonomy (`GET /categories`). Dedicated global user/seller count endpoints require backend analytics expansion.
          </p>
        </div>
      </div>

      {/* Bento Grid Tiles */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Gross Platform Revenue */}
        <div className="bg-surface-container-lowest p-6 rounded-xl border border-surface-variant shadow-sm space-y-4">
          <div className="flex justify-between items-center">
            <span className="font-label-sm text-xs text-on-surface-variant uppercase tracking-wider">Gross Revenue</span>
            <div className="w-10 h-10 rounded-full bg-secondary-container/50 text-secondary flex items-center justify-center">
              <span className="material-symbols-outlined">attach_money</span>
            </div>
          </div>
          <div>
            <span className="font-display-lg text-3xl font-bold text-primary">${grossRevenue.toFixed(2)}</span>
            <p className="font-body-md text-xs text-on-surface-variant mt-1">Sum of {orders.length} total orders</p>
          </div>
        </div>

        {/* Total Platform Orders */}
        <div className="bg-surface-container-lowest p-6 rounded-xl border border-surface-variant shadow-sm space-y-4">
          <div className="flex justify-between items-center">
            <span className="font-label-sm text-xs text-on-surface-variant uppercase tracking-wider">Total Orders</span>
            <div className="w-10 h-10 rounded-full bg-primary/10 text-primary flex items-center justify-center">
              <span className="material-symbols-outlined">shopping_cart</span>
            </div>
          </div>
          <div>
            <span className="font-display-lg text-3xl font-bold text-primary">{orders.length}</span>
            <p className="font-body-md text-xs text-on-surface-variant mt-1">Platform customer orders</p>
          </div>
        </div>

        {/* Pending Orders */}
        <div className="bg-surface-container-lowest p-6 rounded-xl border border-surface-variant shadow-sm space-y-4">
          <div className="flex justify-between items-center">
            <span className="font-label-sm text-xs text-on-surface-variant uppercase tracking-wider">Pending Orders</span>
            <div className="w-10 h-10 rounded-full bg-terracotta/10 text-terracotta flex items-center justify-center">
              <span className="material-symbols-outlined">pending_actions</span>
            </div>
          </div>
          <div>
            <span className="font-display-lg text-3xl font-bold text-primary">{pendingOrdersCount}</span>
            <p className="font-body-md text-xs text-on-surface-variant mt-1">Awaiting status update</p>
          </div>
        </div>

        {/* Active Categories */}
        <div className="bg-surface-container-lowest p-6 rounded-xl border border-surface-variant shadow-sm space-y-4">
          <div className="flex justify-between items-center">
            <span className="font-label-sm text-xs text-on-surface-variant uppercase tracking-wider">Categories</span>
            <div className="w-10 h-10 rounded-full bg-surface-container-high text-primary flex items-center justify-center">
              <span className="material-symbols-outlined">category</span>
            </div>
          </div>
          <div>
            <span className="font-display-lg text-3xl font-bold text-primary">{categories.length}</span>
            <p className="font-body-md text-xs text-on-surface-variant mt-1">Active catalog taxonomies</p>
          </div>
        </div>
      </div>

      {/* Recent Orders Overview */}
      <div className="bg-surface-container-lowest rounded-xl border border-surface-variant shadow-ambient p-6 md:p-8 space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="font-headline-md text-headline-md text-primary">Recent Orders Overview</h2>
            <p className="font-body-md text-sm text-on-surface-variant">Live feed of orders placed across the Sellora marketplace.</p>
          </div>
          <Link to="/admin/orders" className="font-label-md text-sm text-primary hover:underline flex items-center gap-1">
            <span>Manage All</span>
            <span className="material-symbols-outlined text-xs">arrow_forward</span>
          </Link>
        </div>

        {orders.length === 0 ? (
          <div className="text-center py-12 border border-dashed border-outline-variant rounded-lg">
            <span className="material-symbols-outlined text-4xl text-outline mb-2">inbox</span>
            <p className="font-body-md text-on-surface-variant">No orders placed on platform yet.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left font-body-md border-collapse">
              <thead>
                <tr className="border-b border-surface-variant text-on-surface-variant font-label-sm text-xs uppercase tracking-wider">
                  <th className="pb-3 px-4">Order ID</th>
                  <th className="pb-3 px-4">Total Amount</th>
                  <th className="pb-3 px-4">Payment</th>
                  <th className="pb-3 px-4">Order Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-surface-variant text-sm">
                {orders.slice(0, 5).map((order, idx) => (
                  <tr key={order.id || order.order_id || idx} className="hover:bg-surface-container-low transition-colors">
                    <td className="py-4 px-4 font-semibold text-primary">#{order.id || order.order_id}</td>
                    <td className="py-4 px-4 font-semibold text-primary">${parseFloat(order.total_amount || order.totalAmount || 0).toFixed(2)}</td>
                    <td className="py-4 px-4">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium uppercase tracking-wider ${
                        (order.payment_status || order.paymentStatus) === 'PAID'
                          ? 'bg-secondary-container text-on-secondary-container'
                          : 'bg-error-container text-on-error-container'
                      }`}>
                        {order.payment_status || order.paymentStatus || 'PENDING'}
                      </span>
                    </td>
                    <td className="py-4 px-4">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium uppercase tracking-wider ${
                        (order.status || order.order_status) === 'DELIVERED'
                          ? 'bg-secondary-container text-on-secondary-container'
                          : 'bg-surface-container-high text-on-surface'
                      }`}>
                        {order.status || order.order_status || 'PENDING'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
