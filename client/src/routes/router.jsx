import { createBrowserRouter } from 'react-router-dom'
import GuestLayout from '@/components/layout/GuestLayout.jsx'
import { ROUTES } from '@/constants/routes.js'
import AdminLayout from '@/layouts/AdminLayout.jsx'
import CustomerLayout from '@/layouts/CustomerLayout.jsx'
import PublicLayout from '@/layouts/PublicLayout.jsx'
import SellerLayout from '@/layouts/SellerLayout.jsx'
import NotFoundPage from '@/pages/auth/NotFoundPage.jsx'
import LoginPage from '@/pages/auth/LoginPage.jsx'
import RegisterPage from '@/pages/auth/RegisterPage.jsx'
import ForgotPasswordPage from '@/pages/auth/ForgotPasswordPage.jsx'
import AdminPlaceholderPage from '@/pages/admin/AdminPlaceholderPage.jsx'
import CustomerPlaceholderPage from '@/pages/customer/CustomerPlaceholderPage.jsx'
import HomePlaceholderPage from '@/pages/customer/HomePlaceholderPage.jsx'
import SellerPlaceholderPage from '@/pages/seller/SellerPlaceholderPage.jsx'
import ProtectedRoute from '@/routes/ProtectedRoute.jsx'
import GuestRoute from '@/routes/GuestRoute.jsx'
import PageTransition from '@/animations/PageTransition.jsx'

export const router = createBrowserRouter([
  {
    element: <PageTransition />,
    children: [
      { element: <PublicLayout />, children: [{ path: ROUTES.home, element: <HomePlaceholderPage /> }] },
  {
    element: <GuestRoute />,
    children: [
      {
        element: <GuestLayout />,
        children: [
          { path: ROUTES.login, element: <LoginPage /> },
          { path: ROUTES.register, element: <RegisterPage /> },
          { path: ROUTES.forgotPassword, element: <ForgotPasswordPage /> },
          { path: ROUTES.resetPassword },
        ],
      },
    ],
  },
  {
    element: <ProtectedRoute allowedRoles={['customer', 'seller', 'admin']} />,
    children: [{ element: <CustomerLayout />, children: [{ path: ROUTES.customer, element: <CustomerPlaceholderPage /> }] }],
  },
  {
    element: <ProtectedRoute allowedRoles={['seller']} />,
    children: [{ element: <SellerLayout />, children: [{ path: ROUTES.seller, element: <SellerPlaceholderPage /> }] }],
  },
  {
    element: <ProtectedRoute allowedRoles={['admin']} />,
    children: [{ element: <AdminLayout />, children: [{ path: ROUTES.admin, element: <AdminPlaceholderPage /> }] }],
  },
      { path: '*', element: <NotFoundPage /> },
    ],
  },
])
