import httpClient from './httpClient'

export async function getCommentsByFactId(factId, params = {}, options = {}) {
  const { errorFallbackMessage = '' } = options
  const response = await httpClient.get(`/comments/facts/${factId}`, { params, errorFallbackMessage })
  return response.data?.data ?? { items: [], pagination: null }
}

export async function createComment(payload, options = {}) {
  const { errorFallbackMessage = '' } = options
  const response = await httpClient.post('/comments', payload, { errorFallbackMessage })
  return response.data?.data ?? null
}

export async function updateComment(commentId, payload, options = {}) {
  const { errorFallbackMessage = '' } = options
  const response = await httpClient.patch(`/comments/${commentId}`, payload, { errorFallbackMessage })
  return response.data?.data ?? null
}

export async function deleteComment(commentId, options = {}) {
  const { errorFallbackMessage = '' } = options
  const response = await httpClient.delete(`/comments/${commentId}`, { errorFallbackMessage })
  return response.data?.data ?? null
}

export async function getMyComments(params = {}, options = {}) {
  const { errorFallbackMessage = '' } = options
  const response = await httpClient.get('/comments/me', { params, errorFallbackMessage })
  return response.data?.data ?? { items: [], pagination: null }
}
