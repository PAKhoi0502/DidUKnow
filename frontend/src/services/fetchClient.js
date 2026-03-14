import { normalizeApiError } from '../utils/normalizeApiError'

const apiBaseURL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000'
const defaultTimeout = 10000

export async function fetchJson(path, options = {}) {
  const { fallbackMessage = '', timeout, headers, ...fetchOptions } = options
  const controller = new AbortController()
  const timeoutMs = timeout ?? defaultTimeout
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs)

  try {
    const response = await fetch(`${apiBaseURL}/api${path}`, {
      ...fetchOptions,
      signal: controller.signal,
      headers: {
        'Content-Type': 'application/json',
        ...(headers || {})
      }
    })

    const payload = await response.json().catch(() => null)

    if (!response.ok) {
      throw {
        message: payload?.message,
        status: response.status,
        data: payload
      }
    }

    return payload
  } catch (error) {
    throw new Error(normalizeApiError(error, fallbackMessage))
  } finally {
    clearTimeout(timeoutId)
  }
}
