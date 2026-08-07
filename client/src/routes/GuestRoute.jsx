import { Navigate, Outlet } from 'react-router-dom'
import { getDashboardRoute } from '@/constants/routes.js'
import { useAuth } from '@/hooks/useAuth.js'

function GuestRoute({ children }) {
  const { isAuthenticated, isLoading, user } = useAuth()

  if (isLoading) {
    return null
  }

  if (isAuthenticated) {
    return <Navigate replace to={getDashboardRoute(user.role)} />
  }

  return children ?? <Outlet />
}

export default GuestRoute
