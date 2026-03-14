import httpClient from './httpClient'

export async function getFacts(params = {}, options = {}) {
  const { signal, errorFallbackMessage = '' } = options
  const response = await httpClient.get('/facts', {
    params,
    signal,
    errorFallbackMessage
  })
  return response.data?.data ?? { items: [], pagination: null }
}

export async function getFactById(factId, params = {}, options = {}) {
  const { errorFallbackMessage = '' } = options
  const response = await httpClient.get(`/facts/${factId}`, { params, errorFallbackMessage })
  return response.data?.data ?? null
}

export async function getRandomFact(params = {}, options = {}) {
  const { errorFallbackMessage = '' } = options
  const response = await httpClient.get('/facts/random', { params, errorFallbackMessage })
  return {
    data: response.data?.data ?? null,
    meta: response.data?.meta ?? null
  }
}

export async function createFact(payload, options = {}) {
  const { errorFallbackMessage = '' } = options
  const response = await httpClient.post('/facts', payload, { errorFallbackMessage })
  return response.data?.data ?? null
}

export async function updateFactById(factId, payload, options = {}) {
  const { errorFallbackMessage = '' } = options
  const response = await httpClient.patch(`/facts/${factId}`, payload, { errorFallbackMessage })
  return response.data?.data ?? null
}

export async function updateFactStatusById(factId, payload, options = {}) {
  const { errorFallbackMessage = '' } = options
  const response = await httpClient.patch(`/facts/${factId}/status`, payload, { errorFallbackMessage })
  return response.data?.data ?? null
}
