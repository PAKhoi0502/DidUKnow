import httpClient from './httpClient'

export async function getTags(options = {}) {
  const { errorFallbackMessage = '' } = options
  const response = await httpClient.get('/tags', { errorFallbackMessage })
  return response.data?.data ?? []
}

export async function createTag(payload, options = {}) {
  const { errorFallbackMessage = '' } = options
  const response = await httpClient.post('/tags', payload, { errorFallbackMessage })
  return response.data?.data ?? null
}

export async function updateTagById(tagId, payload, options = {}) {
  const { errorFallbackMessage = '' } = options
  const response = await httpClient.patch(`/tags/${tagId}`, payload, { errorFallbackMessage })
  return response.data?.data ?? null
}

export async function deleteTagById(tagId, options = {}) {
  const { errorFallbackMessage = '' } = options
  const response = await httpClient.delete(`/tags/${tagId}`, { errorFallbackMessage })
  return response.data?.data ?? null
}
