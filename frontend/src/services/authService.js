import httpClient from './httpClient'

const refreshTokenPath = import.meta.env.VITE_AUTH_REFRESH_PATH || '/users/refresh-token'

export async function registerUser(payload, options = {}) {
  const { errorFallbackMessage = '' } = options
  const response = await httpClient.post('/users', payload, { errorFallbackMessage })
  return response.data?.data ?? null
}

export async function loginUser(payload, options = {}) {
  const { errorFallbackMessage = '' } = options
  const response = await httpClient.post('/users/login', payload, { errorFallbackMessage })
  return response.data?.data ?? null
}

export function canRefreshToken() {
  return Boolean(refreshTokenPath)
}

export async function refreshAccessToken(options = {}) {
  const { errorFallbackMessage = '' } = options
  if (!refreshTokenPath) {
    throw new Error()
  }

  const response = await httpClient.post(refreshTokenPath, {}, { errorFallbackMessage })

  return response.data?.data ?? null
}

export async function logoutUser(options = {}) {
  const { errorFallbackMessage = '' } = options
  await httpClient.post('/users/logout', {}, { errorFallbackMessage })
}
