import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { useAuth } from '../hooks/authContext'
import { useI18n } from '../utils/i18n'

export default function ProtectedRoute() {
  const { isAuthenticated, isAuthInitializing } = useAuth()
  const { t } = useI18n()
  const location = useLocation()

  if (isAuthInitializing) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-100 text-slate-600">
        {t('auth.checking_session')}
      </div>
    )
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace state={{ from: location }} />
  }

  return <Outlet />
}
