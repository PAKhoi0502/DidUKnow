import { t } from './i18n'

function translateIfMessageKey(message) {
  if (typeof message !== 'string') {
    return message
  }

  // Backend may return i18n keys like "errors.internal_server_error".
  const isMessageKey = /^[a-z0-9_]+(?:\.[a-z0-9_]+)+$/i.test(message)
  if (!isMessageKey) {
    return message
  }

  return t(message, message)
}

export function normalizeApiError(error, fallbackMessage = '') {
  if (!error) {
    return fallbackMessage
  }

  if (typeof error === 'string') {
    return translateIfMessageKey(error)
  }

  if (error.response?.data?.message) {
    return translateIfMessageKey(error.response.data.message)
  }

  if (Array.isArray(error.response?.data?.errors) && error.response.data.errors.length > 0) {
    return translateIfMessageKey(error.response.data.errors[0])
  }

  if (Array.isArray(error.data?.errors) && error.data.errors.length > 0) {
    return translateIfMessageKey(error.data.errors[0])
  }

  if (error.data?.message) {
    return translateIfMessageKey(error.data.message)
  }

  if (fallbackMessage) {
    return fallbackMessage
  }

  if (error.message) {
    return error.message
  }

  return fallbackMessage
}
