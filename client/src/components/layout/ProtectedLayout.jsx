import { Outlet } from 'react-router-dom'

function ProtectedLayout() {
  // Authentication and role enforcement will be introduced with the auth module.
  return <Outlet />
}

export default ProtectedLayout
