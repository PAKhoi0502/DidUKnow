const AUTH_USER_KEY = 'auth_user'
const SESSION_EXPIRED_KEY = 'auth_session_expired'
const AUTH_STORAGE_UPDATED_EVENT = 'auth-storage-updated'
let accessTokenInMemory = ''

function notifyAuthStorageUpdated() {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new Event(AUTH_STORAGE_UPDATED_EVENT))
  }
}

export function getStoredAccessToken() {
  return accessTokenInMemory
}

export function setStoredAccessToken(token) {
  accessTokenInMemory = token || ''
  notifyAuthStorageUpdated()
}

export function clearStoredAccessToken() {
  accessTokenInMemory = ''
  notifyAuthStorageUpdated()
}

export function getStoredUser() {
  const rawUser = localStorage.getItem(AUTH_USER_KEY)

  if (!rawUser) {
    return null
  }

  try {
    return JSON.parse(rawUser)
  } catch {
    return null
  }
}

export function setStoredUser(user) {
  localStorage.setItem(AUTH_USER_KEY, JSON.stringify(user))
  notifyAuthStorageUpdated()
}

export function clearStoredUser() {
  localStorage.removeItem(AUTH_USER_KEY)
  notifyAuthStorageUpdated()
}

export function clearAuthStorage() {
  clearStoredAccessToken()
  clearStoredUser()
}

export function getAuthStorageUpdatedEventName() {
  return AUTH_STORAGE_UPDATED_EVENT
}

export function markSessionExpired() {
  sessionStorage.setItem(SESSION_EXPIRED_KEY, '1')
}

export function consumeSessionExpired() {
  const isExpired = sessionStorage.getItem(SESSION_EXPIRED_KEY) === '1'

  if (isExpired) {
    sessionStorage.removeItem(SESSION_EXPIRED_KEY)
  }

  return isExpired
}
