export const ROUTES = Object.freeze({
  home: '/',
  login: '/login',
  register: '/register',
  forgotPassword: '/forgot-password',
  resetPassword: '/reset-password',
  customer: '/account',
  seller: '/seller',
  admin: '/admin',
})

export function getDashboardRoute(role) {
  if (role === 'seller') return ROUTES.seller
  if (role === 'admin') return ROUTES.admin
  return ROUTES.customer
}
