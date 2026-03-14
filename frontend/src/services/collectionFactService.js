import httpClient from './httpClient'

export async function addFactToCollection(payload, options = {}) {
  const { errorFallbackMessage = '' } = options
  const response = await httpClient.post('/collection-facts', payload, { errorFallbackMessage })
  return response.data?.data ?? null
}

export async function getCollectionFacts(collectionId, params = {}, options = {}) {
  const { errorFallbackMessage = '' } = options
  const response = await httpClient.get(`/collection-facts/collections/${collectionId}`, {
    params,
    errorFallbackMessage
  })
  return response.data?.data ?? { items: [], pagination: null }
}

export async function removeFactFromCollection(collectionId, factId, options = {}) {
  const { errorFallbackMessage = '' } = options
  const response = await httpClient.delete(`/collection-facts/collections/${collectionId}/facts/${factId}`, {
    errorFallbackMessage
  })
  return response.data?.data ?? null
}
