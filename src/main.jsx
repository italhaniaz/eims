import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'

// Handle Vite dynamic import chunk mismatch when a new production deployment occurs
if (typeof window !== 'undefined') {
  window.addEventListener('vite:preloadError', (event) => {
    // 1. Prevent unhandled promise rejection from tripping React ErrorBoundary prematurely
    event.preventDefault()
    console.warn('[Vite] Preload error detected due to updated server build. Auto-reloading with cache-buster...', event)

    // 2. Cooldown check to prevent infinite reload storms
    const lastReload = parseInt(window.sessionStorage?.getItem('eims_last_preload_reload') || '0', 10)
    const now = Date.now()
    if (now - lastReload > 6000) {
      window.sessionStorage?.setItem('eims_last_preload_reload', String(now))
      
      // Clear any session retry flags
      try {
        Object.keys(window.sessionStorage || {}).forEach(key => {
          if (key.startsWith('eims_chunk_retry_')) {
            window.sessionStorage.removeItem(key)
          }
        })
      } catch {}

      // Hard reload with timestamp cache-buster
      try {
        const url = new URL(window.location.href)
        url.searchParams.set('_v', String(now))
        window.location.replace(url.toString())
      } catch {
        window.location.reload()
      }
    }
  })
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
