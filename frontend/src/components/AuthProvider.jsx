import { useEffect, useMemo, useState } from 'react'
import {
  canRefreshToken,
  loginUser,
  logoutUser,
  refreshAccessToken,
  registerUser
} from '../services/authService'
import { AuthContext } from '../hooks/authContext'
import {
  clearAuthStorage,
  getAuthStorageUpdatedEventName,
  getStoredAccessToken,
  getStoredUser,
  setStoredAccessToken,
  setStoredUser
} from '../utils/authStorage'
import { normalizeApiError } from '../utils/normalizeApiError'

export default function AuthProvider({ children }) {
  const [accessToken, setAccessToken] = useState(getStoredAccessToken())
  const [user, setUser] = useState(getStoredUser())
  const [isAuthInitializing, setIsAuthInitializing] = useState(true)
  const authStorageUpdatedEventName = getAuthStorageUpdatedEventName()

  const isAuthenticated = Boolean(accessToken)

  useEffect(() => {
    const syncFromStorage = () => {
      setAccessToken(getStoredAccessToken())
      setUser(getStoredUser())
    }

    window.addEventListener(authStorageUpdatedEventName, syncFromStorage)
    window.addEventListener('storage', syncFromStorage)

    return () => {
      window.removeEventListener(authStorageUpdatedEventName, syncFromStorage)
      window.removeEventListener('storage', syncFromStorage)
    }
  }, [authStorageUpdatedEventName])

  useEffect(() => {
    let isMounted = true

    const bootstrapAuthSession = async () => {
      try {
        if (getStoredAccessToken()) {
          return
        }

        if (!canRefreshToken()) {
          clearAuthStorage()
          return
        }

        const refreshData = await refreshAccessToken()
        const newAccessToken = refreshData?.access_token
        const userData = refreshData?.user ?? null

        if (!newAccessToken) {
          clearAuthStorage()
          return
        }

        setStoredAccessToken(newAccessToken)
        if (userData) {
          setStoredUser(userData)
        }

        if (isMounted) {
          setAccessToken(newAccessToken)
          setUser(userData)
        }
      } catch {
        clearAuthStorage()
      } finally {
        if (isMounted) {
          setIsAuthInitializing(false)
        }
      }
    }

    bootstrapAuthSession()

    return () => {
      isMounted = false
    }
  }, [])

  const login = async (payload, options = {}) => {
    const loginData = await loginUser(payload, options)
    const token = loginData?.access_token
    const userData = loginData?.user ?? null

    if (!token) {
      throw new Error()
    }

    setStoredAccessToken(token)
    setStoredUser(userData)
    setAccessToken(token)
    setUser(userData)
    return loginData
  }

  const refreshSession = async (options = {}) => {
    if (!canRefreshToken()) {
      throw new Error()
    }

    const refreshData = await refreshAccessToken(options)
    const newAccessToken = refreshData?.access_token
    const userData = refreshData?.user ?? null

    if (!newAccessToken) {
      throw new Error()
    }

    setStoredAccessToken(newAccessToken)
    if (userData) {
      setStoredUser(userData)
    }
    setAccessToken(newAccessToken)
    if (userData) {
      setUser(userData)
    }

    return refreshData
  }

  const register = async (payload, options = {}) => {
    try {
      return await registerUser(payload, options)
    } catch (error) {
      throw new Error(normalizeApiError(error))
    }
  }

  const logout = async () => {
    try {
      await logoutUser()
    } catch {
      // local cleanup should still run even when network fails
    }

    clearAuthStorage()
    setAccessToken('')
    setUser(null)
  }

  const syncUser = (userData) => {
    setStoredUser(userData)
    setUser(userData)
  }

  const value = useMemo(
    () => ({
      accessToken,
      user,
      isAuthenticated,
      isAuthInitializing,
      login,
      register,
      refreshSession,
      logout,
      syncUser
    }),
    [accessToken, user, isAuthenticated, isAuthInitializing]
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
