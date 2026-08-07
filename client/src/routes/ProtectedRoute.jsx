import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { ROUTES, getDashboardRoute } from '@/constants/routes.js'
import { useAuth } from '@/hooks/useAuth.js'

function ProtectedRoute({ allowedRoles, children }) {
  const { isAuthenticated, isLoading, user } = useAuth()
  const location = useLocation()

  if (isLoading) {
    return <span aria-busy="true" className="sr-only">Restoring session</span>
  }

  if (!isAuthenticated) {
    return <Navigate replace state={{ from: location }} to={ROUTES.login} />
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate replace to={getDashboardRoute(user.role)} />
  }

  return children ?? <Outlet />
}

export default ProtectedRoute
