import { useEffect, useState } from 'react'
import { getSupportedLanguages } from '../services/languageService'
import { normalizeApiError } from '../utils/normalizeApiError'

export function useSupportedLanguages(fallbackMessage = '') {
  const [data, setData] = useState({
    supported_languages: [],
    default_language: ''
  })
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    let isMounted = true

    const loadLanguages = async () => {
      try {
        const result = await getSupportedLanguages({ errorFallbackMessage: fallbackMessage })
        if (isMounted) {
          setData({
            supported_languages: result.supported_languages ?? [],
            default_language: result.default_language ?? ''
          })
        }
      } catch (err) {
        if (isMounted) {
          setError(normalizeApiError(err, fallbackMessage))
        }
      } finally {
        if (isMounted) {
          setIsLoading(false)
        }
      }
    }

    loadLanguages()

    return () => {
      isMounted = false
    }
  }, [fallbackMessage])

  return { data, isLoading, error }
}
