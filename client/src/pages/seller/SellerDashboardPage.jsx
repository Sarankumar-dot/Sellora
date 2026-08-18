import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { apiClient, unwrapResponse } from '../../api/client';

export default function SellerDashboardPage() {
  // Fetch Seller Profile
  // Profile returns snake_case DB row: { id, store_name, gst_number, pan_number, address, description, logo }
  const { data: profile, isLoading: isLoadingProfile } = useQuery({
    queryKey: ['seller-profile'],
    queryFn: async () => {
      const response = await apiClient.get('/seller/profile');
      return unwrapResponse(response);
    },
  });

  // Fetch Seller Orders
  // Returns camelCase: [{ orderId, totalAmount, orderStatus, paymentStatus, customerName, items: [{ productId, productName, quantity, price }] }]
  const { data: orders = [], isLoading: isLoadingOrders } = useQuery({
    queryKey: ['seller-orders'],
    queryFn: async () => {
      const response = await apiClient.get('/seller/orders');
      return unwrapResponse(response);
    },
  });

  // Fetch Products (for seller active products count)
  // BACKEND GAP: GET /products limit is capped at 100 by Joi validation (common.validation.js).
  // This client-side seller isolation workaround breaks once total platform products exceed 100.
  // A real server-side sellerId filter on GET /products is needed for correctness at scale.
  const { data: productsData, isLoading: isLoadingProducts } = useQuery({
    queryKey: ['seller-products-count'],
    queryFn: async () => {
      const response = await apiClient.get('/products', { params: { limit: 100 } });
      return unwrapResponse(response);
    },
  });

  // profile.id is the seller profile id (snake_case DB row)
  const sellerProducts = (productsData?.products || []).filter(
    (p) => p.seller_id === profile?.id
  );

  // orderStatus is camelCase from getSellerOrdersService
  const pendingOrdersCount = orders.filter(
    (o) => o.orderStatus === 'PENDING' || o.orderStatus === 'PROCESSING'
  ).length;

  // totalAmount is the grouped order total from getSellerOrdersService
  const totalRevenue = orders.reduce((sum, o) => {
    const orderTotal = parseFloat(o.totalAmount || 0);
    return sum + (isNaN(orderTotal) ? 0 : orderTotal);
  }, 0);

  const isLoading = isLoadingProfile || isLoadingOrders || isLoadingProducts;

  if (isLoading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <span className="material-symbols-outlined text-4xl text-primary animate-spin">progress_activity</span>
          <p className="font-body-md text-on-surface-variant">Loading seller dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header Banner */}
      <div className="bg-surface-container-lowest p-8 rounded-xl border border-surface-variant shadow-ambient flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <span className="font-label-sm text-xs text-secondary uppercase tracking-widest font-semibold">Store Dashboard</span>
          <h1 className="font-display-lg text-headline-lg text-primary mt-1">{profile?.storeName || 'My Store'}</h1>
          <p className="font-body-md text-body-md text-on-surface-variant mt-1 max-w-xl">
            {profile?.description || 'Welcome back to your store management center.'}
          </p>
        </div>
        
        <div className="flex gap-4 w-full md:w-auto">
          <Link
            to="/seller/products/new"
            className="flex-1 md:flex-none bg-primary text-on-primary font-label-md text-label-md px-6 py-3 rounded-lg hover:bg-primary-container hover:text-on-primary-container transition-colors inline-flex items-center justify-center gap-2 shadow-sm"
          >
            <span className="material-symbols-outlined text-sm">add</span>
            <span>Add Product</span>
          </Link>
          <Link
            to="/seller/profile"
            className="bg-surface border border-outline-variant text-on-surface hover:bg-surface-container-low font-label-md text-label-md px-4 py-3 rounded-lg transition-colors inline-flex items-center justify-center"
          >
            <span className="material-symbols-outlined text-sm">edit</span>
          </Link>
        </div>
      </div>

      {/* Bento Grid Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Stat Tile 1: Revenue */}
        <div className="bg-surface-container-lowest p-6 rounded-xl border border-surface-variant shadow-sm space-y-4">
          <div className="flex justify-between items-center">
            <span className="font-label-sm text-xs text-on-surface-variant uppercase tracking-wider">Total Revenue</span>
            <div className="w-10 h-10 rounded-full bg-secondary-container/50 text-secondary flex items-center justify-center">
              <span className="material-symbols-outlined">payments</span>
            </div>
          </div>
          <div>
            <span className="font-display-lg text-3xl font-bold text-primary">${totalRevenue.toFixed(2)}</span>
            <p className="font-body-md text-xs text-on-surface-variant mt-1">Derived from {orders.length} orders</p>
          </div>
        </div>

        {/* Stat Tile 2: Total Orders */}
        <div className="bg-surface-container-lowest p-6 rounded-xl border border-surface-variant shadow-sm space-y-4">
          <div className="flex justify-between items-center">
            <span className="font-label-sm text-xs text-on-surface-variant uppercase tracking-wider">Total Orders</span>
            <div className="w-10 h-10 rounded-full bg-primary/10 text-primary flex items-center justify-center">
              <span className="material-symbols-outlined">shopping_bag</span>
            </div>
          </div>
          <div>
            <span className="font-display-lg text-3xl font-bold text-primary">{orders.length}</span>
            <p className="font-body-md text-xs text-on-surface-variant mt-1">Lifetime store orders</p>
          </div>
        </div>

        {/* Stat Tile 3: Pending Orders */}
        <div className="bg-surface-container-lowest p-6 rounded-xl border border-surface-variant shadow-sm space-y-4">
          <div className="flex justify-between items-center">
            <span className="font-label-sm text-xs text-on-surface-variant uppercase tracking-wider">Pending Orders</span>
            <div className="w-10 h-10 rounded-full bg-terracotta/10 text-terracotta flex items-center justify-center">
              <span className="material-symbols-outlined">pending_actions</span>
            </div>
          </div>
          <div>
            <span className="font-display-lg text-3xl font-bold text-primary">{pendingOrdersCount}</span>
            <p className="font-body-md text-xs text-on-surface-variant mt-1">Require processing</p>
          </div>
        </div>

        {/* Stat Tile 4: Active Products */}
        <div className="bg-surface-container-lowest p-6 rounded-xl border border-surface-variant shadow-sm space-y-4">
          <div className="flex justify-between items-center">
            <span className="font-label-sm text-xs text-on-surface-variant uppercase tracking-wider">Active Products</span>
            <div className="w-10 h-10 rounded-full bg-surface-container-high text-primary flex items-center justify-center">
              <span className="material-symbols-outlined">inventory_2</span>
            </div>
          </div>
          <div>
            <span className="font-display-lg text-3xl font-bold text-primary">{sellerProducts.length}</span>
            <p className="font-body-md text-xs text-on-surface-variant mt-1">Catalog items listed</p>
          </div>
        </div>
      </div>

      {/* Recent Orders Section */}
      <div className="bg-surface-container-lowest rounded-xl border border-surface-variant shadow-ambient p-6 md:p-8 space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="font-headline-md text-headline-md text-primary">Recent Orders</h2>
            <p className="font-body-md text-sm text-on-surface-variant">Orders containing products from your store.</p>
          </div>
          <Link to="/seller/orders" className="font-label-md text-sm text-primary hover:underline flex items-center gap-1">
            <span>View All</span>
            <span className="material-symbols-outlined text-xs">arrow_forward</span>
          </Link>
        </div>

        {orders.length === 0 ? (
          <div className="text-center py-12 border border-dashed border-outline-variant rounded-lg">
            <span className="material-symbols-outlined text-4xl text-outline mb-2">inbox</span>
            <p className="font-body-md text-on-surface-variant">No orders received yet.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left font-body-md border-collapse">
              <thead>
                <tr className="border-b border-surface-variant text-on-surface-variant font-label-sm text-xs uppercase tracking-wider">
                  <th className="pb-3 px-4">Order ID</th>
                  <th className="pb-3 px-4">Customer</th>
                  <th className="pb-3 px-4">Item</th>
                  <th className="pb-3 px-4">Amount</th>
                  <th className="pb-3 px-4">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-surface-variant text-sm">
                {orders.slice(0, 5).map((order, idx) => {
                  // items is an array: [{ productName, quantity, price }]
                  const firstItem = order.items?.[0];
                  return (
                    <tr key={order.orderId || idx} className="hover:bg-surface-container-low transition-colors">
                      <td className="py-4 px-4 font-semibold text-primary">#{order.orderId}</td>
                      <td className="py-4 px-4 text-on-surface">{order.customerName || 'Customer'}</td>
                      <td className="py-4 px-4 text-on-surface-variant">
                        {firstItem?.productName || 'Product'}
                        {order.items?.length > 1 ? ` +${order.items.length - 1} more` : ''}
                        {firstItem ? ` (qty: ${firstItem.quantity})` : ''}
                      </td>
                      <td className="py-4 px-4 font-semibold text-primary">${parseFloat(order.totalAmount || 0).toFixed(2)}</td>
                      <td className="py-4 px-4">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium uppercase tracking-wider ${
                          order.orderStatus === 'DELIVERED'
                            ? 'bg-secondary-container text-on-secondary-container'
                            : 'bg-surface-container-high text-on-surface'
                        }`}>
                          {order.orderStatus || 'PENDING'}
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
