import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { useAuth } from '../hooks/authContext'
import { useI18n } from '../utils/i18n'

export default function PublicRoute() {
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

  if (isAuthenticated) {
    const from = location.state?.from
    const path = from?.pathname || '/home'
    const search = from?.search || ''
    const hash = from?.hash || ''
    const redirectPath = `${path}${search}${hash}`
    const safeRedirectPath = redirectPath === '/login' ? '/home' : redirectPath

    return <Navigate to={safeRedirectPath} replace />
  }

  return <Outlet />
}
