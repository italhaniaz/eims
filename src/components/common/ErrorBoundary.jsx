import React from 'react'
import { AlertTriangle, RotateCcw, Home, RefreshCw, Sparkles } from 'lucide-react'

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false, error: null, errorInfo: null }
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error }
  }

  componentDidCatch(error, errorInfo) {
    console.error('ErrorBoundary caught an unhandled error:', error, errorInfo)
    this.setState({ errorInfo })
  }

  isChunkLoadError = () => {
    const msg = this.state.error?.message || ''
    const name = this.state.error?.name || ''
    return (
      msg.includes('dynamically imported module') ||
      msg.includes('Failed to fetch') ||
      msg.includes('Loading chunk') ||
      msg.includes('error loading dynamically imported module') ||
      msg.includes('Importing a module script failed') ||
      msg.includes('before initialization') ||
      name === 'ChunkLoadError'
    )
  }

  handleReset = () => {
    if (this.isChunkLoadError()) {
      // For chunk loading mismatches caused by fresh deployments, perform a full reload
      window.location.reload()
      return
    }
    this.setState({ hasError: false, error: null, errorInfo: null })
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback
      }

      const isChunk = this.isChunkLoadError()

      return (
        <div className="min-h-[420px] flex items-center justify-center p-6 text-center">
          <div className="bg-white border border-slate-200/90 shadow-xl rounded-3xl p-8 max-w-lg w-full space-y-5 animate-in fade-in duration-200">
            {isChunk ? (
              <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center mx-auto border border-blue-100 shadow-xs">
                <Sparkles className="w-8 h-8 animate-pulse text-blue-600" />
              </div>
            ) : (
              <div className="w-16 h-16 bg-rose-50 text-rose-600 rounded-2xl flex items-center justify-center mx-auto border border-rose-100 shadow-xs">
                <AlertTriangle className="w-8 h-8" />
              </div>
            )}

            <div className="space-y-1.5">
              <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold ${
                isChunk ? 'bg-blue-50 text-blue-700 border border-blue-200/60' : 'bg-rose-50 text-rose-700 border border-rose-200/60'
              }`}>
                {isChunk ? 'New Version Deployed' : 'Module Encountered an Error'}
              </span>
              <h2 className="text-xl font-bold text-slate-900 tracking-tight pt-1">
                {isChunk ? 'Platform Update Available' : (this.props.title || 'Module Encountered an Error')}
              </h2>
              <p className="text-xs text-slate-500 leading-relaxed max-w-md mx-auto">
                {isChunk
                  ? 'A new production version of this module has been deployed. Reload to load the latest verified assets and features seamlessly.'
                  : 'An unexpected error occurred while rendering this module. You can reload this view or return to the dashboard.'}
              </p>
            </div>

            {this.state.error?.message && !isChunk && (
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-left text-xs font-mono text-rose-700 break-words max-h-32 overflow-y-auto">
                {this.state.error.message}
              </div>
            )}

            <div className="flex flex-col sm:flex-row items-center justify-center gap-2.5 pt-2">
              <button
                type="button"
                onClick={this.handleReset}
                className={`w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 font-bold rounded-xl text-xs transition-all shadow-sm ${
                  isChunk 
                    ? 'bg-blue-600 hover:bg-blue-700 text-white shadow-blue-500/20' 
                    : 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-emerald-500/20'
                }`}
              >
                {isChunk ? <RefreshCw className="w-4 h-4" /> : <RotateCcw className="w-4 h-4" />}
                <span>{isChunk ? 'Update & Reload Application' : 'Try Again'}</span>
              </button>

              {this.props.onNavigateHome && (
                <button
                  type="button"
                  onClick={() => {
                    this.setState({ hasError: false, error: null, errorInfo: null })
                    this.props.onNavigateHome()
                  }}
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-xl text-xs transition-colors"
                >
                  <Home className="w-4 h-4 text-slate-500" />
                  <span>Go to Dashboard</span>
                </button>
              )}
            </div>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}

export default ErrorBoundary
