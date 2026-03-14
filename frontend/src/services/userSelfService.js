import httpClient from './httpClient'

export async function getMyProfile(options = {}) {
  const { errorFallbackMessage = '' } = options
  const response = await httpClient.get('/users/me', { errorFallbackMessage })
  return response.data?.data ?? null
}

export async function updateMyProfile(payload, options = {}) {
  const { errorFallbackMessage = '' } = options
  const response = await httpClient.patch('/users/me', payload, { errorFallbackMessage })
  return response.data?.data ?? null
}
