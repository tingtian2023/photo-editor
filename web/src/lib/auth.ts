// Stores the access code and server URL the user typed, in localStorage.
// Never hard-code the code: the site is public, so anything in the bundle is readable.

const TOKEN_KEY = 'app_access_token'
const SERVER_KEY = 'app_server_url'

// Optional default shown on the access-code screen (GitHub Actions variable API_BASE_URL).
const DEFAULT_SERVER_URL = import.meta.env.VITE_API_BASE_URL || ''

const listeners = new Set<() => void>()

function read(key: string): string | null {
  try {
    return localStorage.getItem(key)
  } catch {
    return null
  }
}

function write(key: string, value: string | null) {
  try {
    if (value === null) localStorage.removeItem(key)
    else localStorage.setItem(key, value)
  } catch {
    // Storage blocked (e.g. private browsing). Values still work until reload.
  }
}

let token = read(TOKEN_KEY)
let server = read(SERVER_KEY)

/** Removes trailing slashes so `${base}/edit` never becomes `//edit`. */
export function normalizeServerUrl(url: string): string {
  return url.trim().replace(/\/+$/, '')
}

export const hasToken = () => !!token
export const getToken = () => token ?? ''
export const getServerUrl = () => normalizeServerUrl(server || DEFAULT_SERVER_URL)

export function saveAuth(newToken: string, serverUrl: string) {
  token = newToken
  server = normalizeServerUrl(serverUrl)
  write(TOKEN_KEY, token)
  write(SERVER_KEY, server)
}

/** Clears the access code (keeps the server URL) and returns to the access-code screen. */
export function clearToken() {
  token = null
  write(TOKEN_KEY, null)
  listeners.forEach((fn) => fn())
}

export function onTokenCleared(fn: () => void): () => void {
  listeners.add(fn)
  return () => {
    listeners.delete(fn)
  }
}
