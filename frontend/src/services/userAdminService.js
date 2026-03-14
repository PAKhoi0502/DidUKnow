import httpClient from './httpClient'

export async function getUsers(params = {}, options = {}) {
  const { errorFallbackMessage = '' } = options
  const response = await httpClient.get('/users', { params, errorFallbackMessage })
  return response.data?.data ?? { items: [], pagination: null }
}

export async function updateUserById(userId, payload, options = {}) {
  const { errorFallbackMessage = '' } = options
  const response = await httpClient.patch(`/users/${userId}`, payload, { errorFallbackMessage })
  return response.data?.data ?? null
}

export async function updateUserRoleById(userId, payload, options = {}) {
  const { errorFallbackMessage = '' } = options
  const response = await httpClient.patch(`/users/${userId}/role`, payload, { errorFallbackMessage })
  return response.data?.data ?? null
}

export async function deleteUserById(userId, options = {}) {
  const { errorFallbackMessage = '' } = options
  const response = await httpClient.delete(`/users/${userId}`, { errorFallbackMessage })
  return response.data?.data ?? null
}
