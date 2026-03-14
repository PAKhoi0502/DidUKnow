import httpClient from './httpClient'

export async function checkFavouriteByFactId(factId, options = {}) {
  const { errorFallbackMessage = '' } = options
  const response = await httpClient.get(`/favourites/check/${factId}`, { errorFallbackMessage })
  return response.data?.data ?? { fact_id: factId, is_favourited: false }
}

export async function addFavouriteByFactId(factId, options = {}) {
  const { errorFallbackMessage = '' } = options
  const response = await httpClient.post('/favourites', { fact_id: factId }, { errorFallbackMessage })
  return response.data?.data ?? null
}

export async function removeFavouriteByFactId(factId, options = {}) {
  const { errorFallbackMessage = '' } = options
  const response = await httpClient.delete(`/favourites/${factId}`, { errorFallbackMessage })
  return response.data?.data ?? null
}

export async function getMyFavourites(params = {}, options = {}) {
  const { errorFallbackMessage = '' } = options
  const response = await httpClient.get('/favourites', { params, errorFallbackMessage })
  return response.data?.data ?? { items: [], pagination: null }
}
