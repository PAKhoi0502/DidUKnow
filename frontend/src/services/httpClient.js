import axios from 'axios'
import { normalizeApiError } from '../utils/normalizeApiError'
import {
  clearAuthStorage,
  getStoredAccessToken,
  markSessionExpired,
  setStoredUser,
  setStoredAccessToken
} from '../utils/authStorage'

const apiBaseURL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000'
const refreshTokenPath = import.meta.env.VITE_AUTH_REFRESH_PATH || '/users/refresh-token'

let isRefreshing = false
let refreshQueue = []

function getFallbackMessageFromConfig(config) {
  return config?.errorFallbackMessage || ''
}

const formatHttpError = (error) => ({
  message: normalizeApiError(error, getFallbackMessageFromConfig(error.config)),
  status: error.response?.status ?? error.status ?? 500,
  data: error.response?.data ?? error.data ?? null
})

const processRefreshQueue = (error, accessToken) => {
  refreshQueue.forEach((queuedRequest) => {
    if (error) {
      queuedRequest.reject(formatHttpError(error))
      return
    }

    queuedRequest.resolve(accessToken)
  })

  refreshQueue = []
}

const httpClient = axios.create({
  baseURL: `${apiBaseURL}/api`,
  timeout: 10000,
  withCredentials: true
})

httpClient.interceptors.request.use((config) => {
  const token = getStoredAccessToken()

  if (token) {
    config.headers = config.headers || {}
    config.headers.Authorization = `Bearer ${token}`
  }

  return config
})

httpClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config || {}
    const status = error.response?.status
    const hasRefreshConfig = Boolean(refreshTokenPath)
    const isRefreshRequest = originalRequest.url === refreshTokenPath
    const isAuthRequest =
      originalRequest.url === '/users/login' ||
      originalRequest.url === '/users/logout' ||
      originalRequest.url === '/users' ||
      originalRequest.url === '/users/refresh-token'
    const isAlreadyRetried = Boolean(originalRequest._retry)

    if (status === 401 && hasRefreshConfig && !isRefreshRequest && !isAuthRequest && !isAlreadyRetried) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          refreshQueue.push({ resolve, reject })
        })
          .then((newAccessToken) => {
            originalRequest._retry = true
            originalRequest.headers = originalRequest.headers || {}
            originalRequest.headers.Authorization = `Bearer ${newAccessToken}`
            return httpClient(originalRequest)
          })
          .catch((queueError) => Promise.reject(queueError))
      }

      isRefreshing = true
      originalRequest._retry = true

      try {
        const refreshResponse = await axios.post(
          `${apiBaseURL}/api${refreshTokenPath}`,
          {},
          { timeout: 10000, withCredentials: true }
        )

        const refreshData = refreshResponse.data?.data ?? {}
        const newAccessToken = refreshData.access_token
        const userData = refreshData.user

        if (!newAccessToken) {
          throw new Error()
        }

        setStoredAccessToken(newAccessToken)
        if (userData) {
          setStoredUser(userData)
        }

        processRefreshQueue(null, newAccessToken)

        originalRequest.headers = originalRequest.headers || {}
        originalRequest.headers.Authorization = `Bearer ${newAccessToken}`
        return httpClient(originalRequest)
      } catch (refreshError) {
        markSessionExpired()
        clearAuthStorage()
        processRefreshQueue(refreshError, null)
        return Promise.reject(formatHttpError(refreshError))
      } finally {
        isRefreshing = false
      }
    }

    return Promise.reject(formatHttpError(error))
  }
)

export default httpClient
