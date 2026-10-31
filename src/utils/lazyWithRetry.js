import { lazy } from 'react'

/**
 * Resilient lazy loader for Single Page Applications (Vite / Vercel / Netlify).
 * Automatically handles stale chunk hashes after production deployments by
 * bypassing the cache and smoothly fetching the latest deployed assets.
 *
 * @param {() => Promise<{ default: React.ComponentType<any> }>} componentImport
 * @param {string} moduleKey - Identifier for session tracking
 * @returns {React.LazyExoticComponent<React.ComponentType<any>>}
 */
export const lazyWithRetry = (componentImport, moduleKey = 'module') => {
  return lazy(async () => {
    const storageKey = `eims_chunk_retry_${moduleKey}`
    const lastRetryTime = parseInt(window.sessionStorage?.getItem(storageKey) || '0', 10)
    const now = Date.now()
    const canRetry = (now - lastRetryTime) > 12000 // 12-second window

    try {
      const component = await componentImport()
      // On success, reset the retry timestamp
      window.sessionStorage?.removeItem(storageKey)
      return component
    } catch (error) {
      console.warn(`[LazyRetry] Dynamic chunk import failed for "${moduleKey}":`, error)

      // Check for genuine chunk loading or network fetch failures
      const isChunkError =
        error?.message?.includes('dynamically imported module') ||
        error?.message?.includes('Failed to fetch') ||
        error?.message?.includes('Loading chunk') ||
        error?.name === 'ChunkLoadError' ||
        error?.message?.includes('Importing a module script failed') ||
        error?.message?.includes('error loading dynamically imported module')

      if (isChunkError && canRetry) {
        window.sessionStorage?.setItem(storageKey, String(now))
        console.info(`[LazyRetry] New build detected on server. Force reloading to get latest chunks for "${moduleKey}"...`)
        
        // Hard cache-busting reload to fetch latest index.html and fresh chunk assets
        try {
          const url = new URL(window.location.href)
          url.searchParams.set('_v', String(now))
          window.location.replace(url.toString())
        } catch {
          window.location.reload()
        }
        
        // Suspend indefinitely while the browser reloads cleanly
        return new Promise(() => {})
      }

      // If already retried recently or not a chunk error, forward to ErrorBoundary
      throw error
    }
  })
}

export default lazyWithRetry
