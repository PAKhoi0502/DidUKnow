import { useMemo } from 'react'
import { useAuth } from '../authContext'

export function useAuthDomain() {
  const auth = useAuth()

  return useMemo(
    () => ({
      user: auth.user,
      isAuthenticated: auth.isAuthenticated,
      isAuthInitializing: auth.isAuthInitializing,
      login: auth.login,
      register: auth.register,
      refreshSession: auth.refreshSession,
      logout: auth.logout
    }),
    [auth]
  )
}
