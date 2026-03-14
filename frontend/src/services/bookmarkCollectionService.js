import httpClient from './httpClient'

export async function getMyBookmarkCollections(params = {}, options = {}) {
  const { errorFallbackMessage = '' } = options
  const response = await httpClient.get('/bookmark-collections', { params, errorFallbackMessage })
  return response.data?.data ?? { items: [], pagination: null }
}

export async function createBookmarkCollection(payload, options = {}) {
  const { errorFallbackMessage = '' } = options
  const response = await httpClient.post('/bookmark-collections', payload, { errorFallbackMessage })
  return response.data?.data ?? null
}

export async function updateBookmarkCollectionById(collectionId, payload, options = {}) {
  const { errorFallbackMessage = '' } = options
  const response = await httpClient.patch(`/bookmark-collections/${collectionId}`, payload, { errorFallbackMessage })
  return response.data?.data ?? null
}

export async function deleteBookmarkCollectionById(collectionId, options = {}) {
  const { errorFallbackMessage = '' } = options
  const response = await httpClient.delete(`/bookmark-collections/${collectionId}`, { errorFallbackMessage })
  return response.data?.data ?? null
}
