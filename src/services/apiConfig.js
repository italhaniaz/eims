/**
 * Centralized API & Backend Configuration
 * Seamlessly adapts between local development (http://localhost:5000),
 * custom environment variables (VITE_API_URL), and production deployments.
 */

export const getApiBaseUrl = () => {
  // 1. Explicit Vite environment variable takes top precedence
  if (typeof import.meta !== 'undefined' && import.meta.env?.VITE_API_URL) {
    return import.meta.env.VITE_API_URL.replace(/\/+$/, '')
  }

  // 2. Production client-side origin fallback (relative to current domain)
  if (typeof window !== 'undefined') {
    const isLocalhost = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
    if (!isLocalhost) {
      return window.location.origin
    }
  }

  // 3. Localhost development fallback
  return 'http://localhost:5000'
}

export const API_BASE_URL = getApiBaseUrl()

/**
 * Returns a fully qualified endpoint URL without double slashes
 */
export const getApiUrl = (endpoint = '') => {
  const base = API_BASE_URL.replace(/\/+$/, '')
  const cleanEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`
  return `${base}${cleanEndpoint}`
}

export default API_BASE_URL
