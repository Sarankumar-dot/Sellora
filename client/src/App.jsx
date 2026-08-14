import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import StorefrontLayout from './layouts/StorefrontLayout';
import SellerLayout from './layouts/SellerLayout';
import AdminLayout from './layouts/AdminLayout';

import ProtectedRoute from './components/common/ProtectedRoute';

import HomePage from './pages/storefront/HomePage';
import ProductsPage from './pages/storefront/ProductsPage';
import ProductDetailsPage from './pages/storefront/ProductDetailsPage';
import CartPage from './pages/storefront/CartPage';
import CheckoutPage from './pages/storefront/CheckoutPage';
import OrderSuccessPage from './pages/storefront/OrderSuccessPage';
import OrderHistoryPage from './pages/storefront/OrderHistoryPage';
import OrderDetailPage from './pages/storefront/OrderDetailPage';
import ProfilePage from './pages/storefront/ProfilePage';

// Auth Pages
import LoginPage from './pages/auth/LoginPage';
import RegisterPage from './pages/auth/RegisterPage';
import ForgotPasswordPage from './pages/auth/ForgotPasswordPage';
import ResetPasswordPage from './pages/auth/ResetPasswordPage';

// Seller Portal Pages
import SellerOnboardingPage from './pages/seller/SellerOnboardingPage';
import SellerDashboardPage from './pages/seller/SellerDashboardPage';
import SellerProductsPage from './pages/seller/SellerProductsPage';
import SellerCreateProductPage from './pages/seller/SellerCreateProductPage';
import SellerEditProductPage from './pages/seller/SellerEditProductPage';
import SellerOrdersPage from './pages/seller/SellerOrdersPage';
import SellerProfilePage from './pages/seller/SellerProfilePage';

// Admin Pages
import AdminDashboardPage from './pages/admin/AdminDashboardPage';
import AdminCategoriesPage from './pages/admin/AdminCategoriesPage';
import AdminOrdersPage from './pages/admin/AdminOrdersPage';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Storefront Layout */}
        <Route element={<StorefrontLayout />}>
          <Route path="/" element={<HomePage />} />
          <Route path="/products" element={<ProductsPage />} />
          <Route path="/products/:id" element={<ProductDetailsPage />} />
          <Route path="/cart" element={<CartPage />} />
          
          {/* Protected Storefront Routes */}
          <Route path="/checkout" element={<ProtectedRoute><CheckoutPage /></ProtectedRoute>} />
          <Route path="/order-success/:orderId" element={<ProtectedRoute><OrderSuccessPage /></ProtectedRoute>} />
          <Route path="/orders" element={<ProtectedRoute><OrderHistoryPage /></ProtectedRoute>} />
          <Route path="/orders/:id" element={<ProtectedRoute><OrderDetailPage /></ProtectedRoute>} />
          <Route path="/profile" element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} />
        </Route>
        
        {/* Auth Routes */}
        <Route path="/auth/login" element={<LoginPage />} />
        <Route path="/auth/register" element={<RegisterPage />} />
        <Route path="/auth/forgot-password" element={<ForgotPasswordPage />} />
        <Route path="/auth/reset-password" element={<ResetPasswordPage />} />
        
        {/* Seller Onboarding (Requires Login) */}
        <Route path="/seller/onboarding" element={<ProtectedRoute><SellerOnboardingPage /></ProtectedRoute>} />

        {/* Seller Portal Protected Layout (Requires Seller Role) */}
        <Route element={<ProtectedRoute allowedRoles={['seller']}><SellerLayout /></ProtectedRoute>}>
          <Route path="/seller" element={<Navigate to="/seller/dashboard" replace />} />
          <Route path="/seller/dashboard" element={<SellerDashboardPage />} />
          <Route path="/seller/products" element={<SellerProductsPage />} />
          <Route path="/seller/products/new" element={<SellerCreateProductPage />} />
          <Route path="/seller/products/edit/:id" element={<SellerEditProductPage />} />
          <Route path="/seller/orders" element={<SellerOrdersPage />} />
          <Route path="/seller/profile" element={<SellerProfilePage />} />
        </Route>

        {/* Admin Console Protected Layout (Requires Admin Role) */}
        <Route element={<ProtectedRoute allowedRoles={['admin']}><AdminLayout /></ProtectedRoute>}>
          <Route path="/admin" element={<Navigate to="/admin/dashboard" replace />} />
          <Route path="/admin/dashboard" element={<AdminDashboardPage />} />
          <Route path="/admin/categories" element={<AdminCategoriesPage />} />
          <Route path="/admin/orders" element={<AdminOrdersPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
