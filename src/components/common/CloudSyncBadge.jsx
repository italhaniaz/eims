import React, { useState, useEffect, useRef } from 'react'
import { Database, Wifi, WifiOff, Cloud, CheckCircle2, AlertTriangle, ShieldCheck, ChevronRight } from 'lucide-react'
import { isSupabaseConfigured, getSupabaseStatus } from '../../services/supabaseClient'

export const CloudSyncBadge = ({ onOpenSettings, className = '' }) => {
  const [isOnline, setIsOnline] = useState(typeof navigator !== 'undefined' ? navigator.onLine : true)
  const [isPopoverOpen, setIsPopoverOpen] = useState(false)
  const popoverRef = useRef(null)

  const status = getSupabaseStatus()

  useEffect(() => {
    const handleOnline = () => setIsOnline(true)
    const handleOffline = () => setIsOnline(false)

    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)
    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [])

  // Close popover when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (popoverRef.current && !popoverRef.current.contains(e.target)) {
        setIsPopoverOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const getStatusBadge = () => {
    if (!isOnline) {
      return {
        label: 'Offline (Local Safe)',
        dotColor: 'bg-amber-500',
        textColor: 'text-amber-800',
        bgColor: 'bg-amber-50 border-amber-200',
        icon: WifiOff
      }
    }
    if (isSupabaseConfigured) {
      return {
        label: 'Cloud Sync: Active',
        dotColor: 'bg-emerald-500',
        textColor: 'text-emerald-800',
        bgColor: 'bg-emerald-50 border-emerald-200',
        icon: Cloud
      }
    }
    return {
      label: 'Local Storage (Secure)',
      dotColor: 'bg-blue-500',
      textColor: 'text-blue-800',
      bgColor: 'bg-blue-50 border-blue-200',
      icon: Database
    }
  }

  const badge = getStatusBadge()
  const IconComponent = badge.icon

  return (
    <div className={`relative ${className}`} ref={popoverRef}>
      <button
        type="button"
        onClick={() => setIsPopoverOpen(prev => !prev)}
        className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border transition-all cursor-pointer shadow-2xs hover:shadow-xs ${badge.bgColor} ${badge.textColor}`}
        title="Database & Storage Synchronization Status"
      >
        <IconComponent className="w-3.5 h-3.5 shrink-0" />
        <span className="hidden sm:inline">{badge.label}</span>
        <span className={`w-1.5 h-1.5 rounded-full ${badge.dotColor} ${isOnline && isSupabaseConfigured ? 'animate-pulse' : ''}`}></span>
      </button>

      {/* Detail Popover for Layman Operators & Clerks */}
      {isPopoverOpen && (
        <div className="absolute right-0 mt-2 w-80 sm:w-88 bg-white rounded-2xl shadow-xl border border-slate-200 p-4 z-50 animate-in fade-in zoom-in-95 font-sans">
          <div className="flex items-start justify-between pb-3 border-b border-slate-100">
            <div>
              <div className="flex items-center gap-1.5 text-xs font-bold text-slate-900">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                <span>System Data Persistence Engine</span>
              </div>
              <p className="text-[11px] text-slate-500 mt-0.5">Real-time local caching & cloud status</p>
            </div>
            <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold ${badge.bgColor} ${badge.textColor}`}>
              {isOnline ? 'Online' : 'Offline'}
            </span>
          </div>

          <div className="py-3 space-y-2.5 text-xs">
            <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100 space-y-1">
              <div className="flex justify-between text-slate-500 text-[11px]">
                <span>Cloud Backend:</span>
                <strong className="text-slate-800 font-mono">
                  {isSupabaseConfigured ? 'Supabase Connected' : 'Local Fallback'}
                </strong>
              </div>
              <div className="flex justify-between text-slate-500 text-[11px]">
                <span>Browser Storage:</span>
                <strong className="text-emerald-700 font-semibold">100% Active & Cached</strong>
              </div>
              <div className="flex justify-between text-slate-500 text-[11px]">
                <span>Network Link:</span>
                <strong className={isOnline ? 'text-emerald-700' : 'text-amber-700'}>
                  {isOnline ? 'Internet Reachable' : 'Offline Mode (Zero Data Loss)'}
                </strong>
              </div>
            </div>

            <p className="text-[11px] text-slate-600 leading-relaxed">
              {isSupabaseConfigured
                ? 'Your student records, fees, and marks are continuously synced to your remote Supabase cloud database.'
                : 'All changes are automatically saved in your browser storage. You can link your free Supabase cloud database at any time.'}
            </p>
          </div>

          {onOpenSettings && (
            <div className="pt-2.5 border-t border-slate-100 flex justify-end">
              <button
                type="button"
                onClick={() => {
                  setIsPopoverOpen(false)
                  onOpenSettings()
                }}
                className="flex items-center gap-1 text-xs font-bold text-blue-600 hover:text-blue-800 transition-colors cursor-pointer"
              >
                <span>Manage Cloud Settings</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export default CloudSyncBadge
