import httpClient from './httpClient'

export async function getFactViewSummaryByFactId(factId, params = {}, options = {}) {
  const { errorFallbackMessage = '' } = options
  const response = await httpClient.get(`/fact-views/facts/${factId}/summary`, {
    params,
    errorFallbackMessage
  })
  return response.data?.data ?? null
}
