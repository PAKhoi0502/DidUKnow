import httpClient from './httpClient'

export async function getSupportedLanguages(options = {}) {
  const { errorFallbackMessage = '' } = options
  const response = await httpClient.get('/languages/supported', { errorFallbackMessage })
  return response.data?.data ?? {}
}
