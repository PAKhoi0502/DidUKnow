import httpClient from './httpClient'

export async function createReportFact(payload, options = {}) {
  const { errorFallbackMessage = '' } = options
  const response = await httpClient.post('/report-facts', payload, { errorFallbackMessage })
  return response.data?.data ?? null
}

export async function getReportFacts(params = {}, options = {}) {
  const { errorFallbackMessage = '' } = options
  const response = await httpClient.get('/report-facts', { params, errorFallbackMessage })
  return response.data?.data ?? { items: [], pagination: null }
}

export async function getReportFactById(reportId, options = {}) {
  const { errorFallbackMessage = '' } = options
  const response = await httpClient.get(`/report-facts/${reportId}`, { errorFallbackMessage })
  return response.data?.data ?? null
}

export async function updateReportFactStatus(reportId, payload, options = {}) {
  const { errorFallbackMessage = '' } = options
  const response = await httpClient.patch(`/report-facts/${reportId}/status`, payload, { errorFallbackMessage })
  return response.data?.data ?? null
}

export async function getMyReportFacts(params = {}, options = {}) {
  const { errorFallbackMessage = '' } = options
  const response = await httpClient.get('/report-facts/me', { params, errorFallbackMessage })
  return response.data?.data ?? { items: [], pagination: null }
}
