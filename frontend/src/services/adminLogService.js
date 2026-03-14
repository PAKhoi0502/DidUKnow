import httpClient from './httpClient'

export async function getAdminLogs(params = {}, options = {}) {
  const { errorFallbackMessage = '' } = options
  const response = await httpClient.get('/admin-logs', { params, errorFallbackMessage })
  return response.data?.data ?? { items: [], pagination: null }
}
