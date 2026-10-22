import React, { useState, useEffect } from 'react'
import { ShieldAlert, LogOut, Clock, School } from 'lucide-react'
import { PlatformService } from '../../services/platformService'
import { useAuth } from '../../context/AuthContext'
import { useToast } from '../../context/ToastContext'

export const ImpersonationBanner = () => {
  const { user, login } = useAuth()
  const { toast } = useToast()
  const [session, setSession] = useState(() => PlatformService.getImpersonationSession())
  const [timeLeft, setTimeLeft] = useState('')

  useEffect(() => {
    const handleUpdate = () => {
      setSession(PlatformService.getImpersonationSession())
    }

    window.addEventListener('impersonation-changed', handleUpdate)
    window.addEventListener('storage', handleUpdate)

    const interval = setInterval(() => {
      const active = PlatformService.getImpersonationSession()
      setSession(active)

      if (active) {
        const diffMs = active.expiresAt - Date.now()
        if (diffMs <= 0) {
          handleExit()
        } else {
          const minutes = Math.floor(diffMs / 60000)
          const seconds = Math.floor((diffMs % 60000) / 1000)
          setTimeLeft(`${minutes}m ${seconds < 10 ? '0' : ''}${seconds}s`)
        }
      }
    }, 1000)

    return () => {
      window.removeEventListener('impersonation-changed', handleUpdate)
      window.removeEventListener('storage', handleUpdate)
      clearInterval(interval)
    }
  }, [])

  const handleExit = async () => {
    await PlatformService.endImpersonation()
    // Revert user to superadmin
    login('superadmin')
    toast.info('Impersonation ended. Returned to Super Administrator account.')
  }

  if (!session) return null

  return (
    <div className="bg-gradient-to-r from-amber-600 via-amber-700 to-indigo-900 text-white px-4 py-2.5 shadow-md flex items-center justify-between text-xs sticky top-0 z-50 animate-in slide-in-from-top-2 border-b border-amber-400/40">
      <div className="flex items-center gap-2.5 sm:gap-3 flex-wrap">
        <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-black/30 font-bold uppercase tracking-wider text-[10px] text-amber-200 border border-amber-300/30">
          <ShieldAlert className="w-3.5 h-3.5 text-amber-300 animate-pulse" />
          <span>Impersonation Mode Active</span>
        </div>

        <div className="flex items-center gap-1.5 font-medium">
          <School className="w-3.5 h-3.5 text-amber-200" />
          <span>Viewing as Campus:</span>
          <strong className="font-bold underline decoration-amber-300 underline-offset-2">
            {session.instituteName || session.instituteId}
          </strong>
        </div>

        <div className="hidden md:flex items-center gap-1 px-2 py-0.5 rounded bg-white/10 font-mono text-[11px] text-amber-100">
          <Clock className="w-3 h-3 text-amber-300" />
          <span>{timeLeft || '60m remaining'}</span>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <button
          onClick={handleExit}
          className="flex items-center gap-1.5 px-3 py-1 bg-white text-slate-900 hover:bg-amber-50 rounded-lg text-xs font-bold transition-all shadow-sm active:scale-95 cursor-pointer"
          title="Return to Superadmin Account"
        >
          <LogOut className="w-3.5 h-3.5 text-rose-600" />
          <span>Exit & Return to Superadmin</span>
        </button>
      </div>
    </div>
  )
}

export default ImpersonationBanner
