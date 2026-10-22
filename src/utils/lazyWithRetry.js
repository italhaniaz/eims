import { lazy } from 'react'

/**
 * Resilient lazy loader for Single Page Applications (Vite / Vercel / Netlify).
 * Automatically catches stale chunk hashes after deployments by forcing a one-time
 * reload to fetch the latest deployed assets, ensuring users never see
 * "Failed to fetch dynamically imported module".
 *
 * @param {() => Promise<{ default: React.ComponentType<any> }>} componentImport
 * @param {string} moduleKey - Identifier for session tracking
 * @returns {React.LazyExoticComponent<React.ComponentType<any>>}
 */
export const lazyWithRetry = (componentImport, moduleKey = 'module') => {
  return lazy(async () => {
    const storageKey = `eims_chunk_retry_${moduleKey}`
    const pageHasBeenRetried = window.sessionStorage.getItem(storageKey) === 'true'

    try {
      const component = await componentImport()
      // On success, reset the retry flag
      window.sessionStorage.removeItem(storageKey)
      return component
    } catch (error) {
      console.warn(`[LazyRetry] Dynamic chunk import failed for "${moduleKey}":`, error)

      const isChunkError =
        error?.message?.includes('dynamically imported module') ||
        error?.message?.includes('Failed to fetch') ||
        error?.message?.includes('Loading chunk') ||
        error?.name === 'ChunkLoadError' ||
        error?.message?.includes('Importing a module script failed') ||
        error?.message?.includes('error loading dynamically imported module')

      if (isChunkError && !pageHasBeenRetried) {
        window.sessionStorage.setItem(storageKey, 'true')
        console.info(`[LazyRetry] New build detected on server. Force reloading to get latest chunks for "${moduleKey}"...`)
        // Clean reload to download latest index.html and fresh chunk URLs
        window.location.reload()
        // Suspend indefinitely while the browser reloads
        return new Promise(() => {})
      }

      // If already retried or not a network/chunk error, forward to ErrorBoundary
      throw error
    }
  })
}

export default lazyWithRetry
