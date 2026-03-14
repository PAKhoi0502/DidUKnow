import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { useAuth } from '../hooks/authContext'
import { hasAnyRole } from '../utils/roleAccess'

export default function RoleRoute({ allowedRoles = [] }) {
  const { user } = useAuth()
  const location = useLocation()
  const canAccess = hasAnyRole(user, allowedRoles)

  if (!canAccess) {
    return <Navigate to="/forbidden" replace state={{ from: location.pathname }} />
  }

  return <Outlet />
}
