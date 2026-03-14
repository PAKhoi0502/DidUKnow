import httpClient from './httpClient'

export async function getRoles(options = {}) {
  const { errorFallbackMessage = '' } = options
  const response = await httpClient.get('/roles', { errorFallbackMessage })
  return response.data?.data ?? []
}

export async function createRole(payload, options = {}) {
  const { errorFallbackMessage = '' } = options
  const response = await httpClient.post('/roles', payload, { errorFallbackMessage })
  return response.data?.data ?? null
}

export async function updateRoleById(roleId, payload, options = {}) {
  const { errorFallbackMessage = '' } = options
  const response = await httpClient.patch(`/roles/${roleId}`, payload, { errorFallbackMessage })
  return response.data?.data ?? null
}

export async function deleteRoleById(roleId, options = {}) {
  const { errorFallbackMessage = '' } = options
  const response = await httpClient.delete(`/roles/${roleId}`, { errorFallbackMessage })
  return response.data?.data ?? null
}
