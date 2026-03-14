import httpClient from './httpClient'

export async function uploadImage(file, options = {}) {
  const { errorFallbackMessage = '' } = options
  const formData = new FormData()
  formData.append('file', file)

  const response = await httpClient.post('/media/upload-image', formData, {
    headers: {
      'Content-Type': 'multipart/form-data'
    },
    errorFallbackMessage
  })

  return response.data?.data ?? null
}
