import React, { createContext, useContext, useState, useCallback } from 'react'
import { CheckCircle2, AlertCircle, Info, AlertTriangle, X } from 'lucide-react'

const ToastContext = createContext(null)

export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([])

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id))
  }, [])

  const addToast = useCallback(({ message, type = 'info', duration = 3500 }) => {
    const id = `toast-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`
    setToasts((prev) => [...prev, { id, message, type }])

    if (duration > 0) {
      setTimeout(() => {
        removeToast(id)
      }, duration)
    }
  }, [removeToast])

  const toast = {
    success: (message, duration) => addToast({ message, type: 'success', duration }),
    error: (message, duration) => addToast({ message, type: 'error', duration }),
    info: (message, duration) => addToast({ message, type: 'info', duration }),
    warning: (message, duration) => addToast({ message, type: 'warning', duration })
  }

  const getIcon = (type) => {
    switch (type) {
      case 'success':
        return <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
      case 'error':
        return <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
      case 'warning':
        return <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />
      default:
        return <Info className="w-4 h-4 text-blue-400 shrink-0" />
    }
  }

  const getStyles = (type) => {
    switch (type) {
      case 'success':
        return 'bg-[#0f241c] border-emerald-500/40 text-emerald-200'
      case 'error':
        return 'bg-[#291118] border-rose-500/40 text-rose-200'
      case 'warning':
        return 'bg-[#2b1f0d] border-amber-500/40 text-amber-200'
      default:
        return 'bg-[#0f1b33] border-blue-500/40 text-blue-200'
    }
  }

  return (
    <ToastContext.Provider value={{ toast }}>
      {children}
      {/* Toast Notification Container */}
      <div 
        aria-live="polite" 
        className="fixed bottom-5 right-5 z-50 flex flex-col gap-2 max-w-sm w-full pointer-events-none"
      >
        {toasts.map((item) => (
          <div
            key={item.id}
            className={`pointer-events-auto flex items-center justify-between p-3.5 rounded-xl border shadow-2xl backdrop-blur-md transition-all duration-300 animate-in fade-in slide-in-from-bottom-3 ${getStyles(
              item.type
            )}`}
          >
            <div className="flex items-center gap-2.5 text-xs font-semibold">
              {getIcon(item.type)}
              <span className="leading-snug">{item.message}</span>
            </div>
            <button
              onClick={() => removeToast(item.id)}
              className="ml-3 p-1 rounded-md text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  )
}

export const useToast = () => {
  const context = useContext(ToastContext)
  if (!context) {
    // Fallback if accessed outside provider
    return {
      toast: {
        success: (msg) => console.log('Toast (success):', msg),
        error: (msg) => console.error('Toast (error):', msg),
        info: (msg) => console.info('Toast (info):', msg),
        warning: (msg) => console.warn('Toast (warning):', msg)
      }
    }
  }
  return context
}

export default ToastContext
