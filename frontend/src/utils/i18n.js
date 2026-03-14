import { useCallback, useEffect, useState } from 'react'
import enMessages from '../locales/en.json'
import viMessages from '../locales/vi.json'

const LANGUAGE_STORAGE_KEY = 'app_language'
const SUPPORTED_LANGUAGES = ['vi', 'en']
const LANGUAGE_CHANGED_EVENT = 'app-language-changed'

const messages = {
  en: enMessages,
  vi: viMessages
}

function resolveLanguageFromBrowser() {
  const browserLanguage = (navigator.language || '').toLowerCase()
  return browserLanguage.startsWith('vi') ? 'vi' : 'en'
}

export function getPreferredLanguage() {
  const languageFromStorage = localStorage.getItem(LANGUAGE_STORAGE_KEY)
  if (SUPPORTED_LANGUAGES.includes(languageFromStorage)) {
    return languageFromStorage
  }

  return resolveLanguageFromBrowser()
}

export function setPreferredLanguage(language) {
  if (!SUPPORTED_LANGUAGES.includes(language)) {
    return
  }

  localStorage.setItem(LANGUAGE_STORAGE_KEY, language)
  window.dispatchEvent(new Event(LANGUAGE_CHANGED_EVENT))
}

function translateWithLanguage(language, key, fallback = key) {
  return messages[language]?.[key] || messages.en[key] || fallback
}

export function t(key, fallback = key) {
  return translateWithLanguage(getPreferredLanguage(), key, fallback)
}

export function useI18n() {
  const [language, setLanguage] = useState(getPreferredLanguage())

  useEffect(() => {
    const syncLanguage = () => {
      setLanguage(getPreferredLanguage())
    }

    window.addEventListener(LANGUAGE_CHANGED_EVENT, syncLanguage)
    window.addEventListener('storage', syncLanguage)

    return () => {
      window.removeEventListener(LANGUAGE_CHANGED_EVENT, syncLanguage)
      window.removeEventListener('storage', syncLanguage)
    }
  }, [])

  const translate = useCallback(
    (key, fallback = key) => translateWithLanguage(language, key, fallback),
    [language]
  )

  const updateLanguage = useCallback((newLanguage) => {
    setPreferredLanguage(newLanguage)
  }, [])

  return {
    language,
    setLanguage: updateLanguage,
    t: translate,
    supportedLanguages: SUPPORTED_LANGUAGES
  }
}
