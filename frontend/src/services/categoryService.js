import httpClient from './httpClient'

export async function getCategories(params = {}, options = {}) {
  const { errorFallbackMessage = '' } = options
  const response = await httpClient.get('/categories', { params, errorFallbackMessage })
  return response.data?.data ?? []
}

export async function createCategory(payload, options = {}) {
  const { errorFallbackMessage = '' } = options
  const response = await httpClient.post('/categories', payload, { errorFallbackMessage })
  return response.data?.data ?? null
}

export async function updateCategoryById(categoryId, payload, options = {}) {
  const { errorFallbackMessage = '' } = options
  const response = await httpClient.patch(`/categories/${categoryId}`, payload, { errorFallbackMessage })
  return response.data?.data ?? null
}

export async function upsertCategoryTranslation(categoryId, language, payload, options = {}) {
  const { errorFallbackMessage = '' } = options
  const response = await httpClient.put(`/categories/${categoryId}/translations/${language}`, payload, {
    errorFallbackMessage
  })
  return response.data?.data ?? null
}

export async function deleteCategoryById(categoryId, options = {}) {
  const { errorFallbackMessage = '' } = options
  const response = await httpClient.delete(`/categories/${categoryId}`, { errorFallbackMessage })
  return response.data?.data ?? null
}
