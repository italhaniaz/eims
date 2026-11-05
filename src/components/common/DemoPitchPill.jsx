import React, { useState, useRef, useEffect } from 'react'
import { 
  School, 
  Building2, 
  GraduationCap, 
  Lock, 
  Sparkles, 
  ChevronUp, 
  X,
  ExternalLink,
  ShieldCheck
} from 'lucide-react'

const DEMO_PORTALS = [
  {
    id: 'school',
    name: 'School Portal',
    scope: 'City School Model Town • Grades 1-10',
    hash: '#school-login',
    icon: School,
    emoji: '🏫',
    badge: 'K-10 Primary & High School'
  },
  {
    id: 'college',
    name: 'College Portal',
    scope: 'Roots International College • 11-12 & ADP',
    hash: '#college-login',
    icon: Building2,
    emoji: '🏛️',
    badge: 'Intermediate F.Sc / ICS / ADP'
  },
  {
    id: 'university',
    name: 'University Portal',
    scope: 'Institute of Applied Sciences • HEC BS/MS',
    hash: '#university-login',
    icon: GraduationCap,
    emoji: '🎓',
    badge: 'HEC Semester / CGPA System'
  },
  {
    id: 'superadmin',
    name: 'Super Admin HQ',
    scope: 'Master Multi-Tenant Platform Control',
    hash: '#superadmin',
    icon: Lock,
    emoji: '🔒',
    badge: 'Root Platform Governance'
  }
]

export const DemoPitchPill = ({ activeTier = 'school', onSwitchTier }) => {
  const [isOpen, setIsOpen] = useState(false)
  const [isMinimized, setIsMinimized] = useState(() => {
    try {
      return sessionStorage.getItem('sms_demo_pill_minimized') === 'true'
    } catch {
      return false
    }
  })
  const containerRef = useRef(null)

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setIsOpen(false)
      }
    }
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') setIsOpen(false)
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside)
      document.addEventListener('keydown', handleKeyDown)
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [isOpen])

  const toggleMinimize = (e) => {
    e.stopPropagation()
    const next = !isMinimized
    setIsMinimized(next)
    setIsOpen(false)
    try {
      sessionStorage.setItem('sms_demo_pill_minimized', String(next))
    } catch (err) {
      console.warn('Session storage error:', err)
    }
  }

  const activeMeta = DEMO_PORTALS.find(p => p.id === activeTier) || DEMO_PORTALS[0]
  const ActiveIcon = activeMeta.icon

  // 1. Minimized View: Discrete Floating Trigger
  if (isMinimized) {
    return (
      <div className="fixed bottom-3 right-3 sm:bottom-4 sm:right-4 z-50">
        <button
          type="button"
          onClick={toggleMinimize}
          className="w-10 h-10 rounded-full bg-slate-900/90 hover:bg-emerald-700 text-white shadow-xl border border-slate-700 flex items-center justify-center transition-all cursor-pointer hover:scale-105 active:scale-95 group"
          title="Open Live Demo & Pitch Portal Switcher"
        >
          <Sparkles className="w-4 h-4 text-emerald-400 group-hover:rotate-12 transition-transform" />
        </button>
      </div>
    )
  }

  // 2. Full Floating Demo Bar with Popover
  return (
    <div className="fixed bottom-3 right-3 sm:bottom-4 sm:right-4 z-50 text-left font-sans" ref={containerRef}>
      {/* Popover Menu */}
      {isOpen && (
        <div className="absolute bottom-full right-0 mb-2.5 w-[320px] sm:w-[350px] max-w-[calc(100vw-32px)] bg-white rounded-2xl shadow-2xl border border-slate-200 p-3.5 sm:p-4 animate-in fade-in zoom-in-95 text-slate-900 z-50">
          <div className="flex items-center justify-between pb-2.5 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-emerald-100 text-emerald-800 flex items-center justify-center">
                <Sparkles className="w-3.5 h-3.5" />
              </div>
              <div>
                <h4 className="text-xs font-black uppercase tracking-wider text-slate-900">
                  Live Demo & Pitch Switcher
                </h4>
                <p className="text-[10px] text-slate-500 font-medium">
                  Switch between isolated client login pages
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="text-slate-400 hover:text-slate-600 p-1 rounded-lg hover:bg-slate-100 cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* List of Portals */}
          <div className="space-y-1.5 pt-2.5">
            {DEMO_PORTALS.map(portal => {
              const isCurrent = activeTier === portal.id
              const IconComp = portal.icon
              return (
                <button
                  key={portal.id}
                  type="button"
                  onClick={() => {
                    onSwitchTier?.(portal.id)
                    setIsOpen(false)
                  }}
                  className={`w-full text-left p-2.5 rounded-xl border transition-all cursor-pointer flex items-center justify-between ${
                    isCurrent
                      ? 'bg-emerald-50 border-emerald-300 ring-1 ring-emerald-500/20 shadow-2xs'
                      : 'bg-slate-50/70 border-slate-200 hover:border-slate-300 hover:bg-white'
                  }`}
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-sm font-bold shrink-0 ${
                      isCurrent ? 'bg-emerald-600 text-white' : 'bg-slate-200 text-slate-700'
                    }`}>
                      <span>{portal.emoji}</span>
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5">
                        <span className="font-bold text-xs text-slate-900 truncate">
                          {portal.name}
                        </span>
                        {isCurrent && (
                          <span className="text-[9px] font-extrabold px-1.5 py-0.2 rounded bg-emerald-600 text-white">
                            ACTIVE
                          </span>
                        )}
                      </div>
                      <p className="text-[10px] text-slate-500 truncate mt-0.5">
                        {portal.scope}
                      </p>
                    </div>
                  </div>
                  <ChevronUp className="w-3.5 h-3.5 text-slate-400 -rotate-90 shrink-0" />
                </button>
              )
            })}
          </div>

          {/* Note Footer */}
          <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between text-[10px] text-slate-400">
            <span className="flex items-center gap-1">
              <ShieldCheck className="w-3 h-3 text-emerald-600" />
              <span>Real clients see only their purchased portal</span>
            </span>
            <button
              type="button"
              onClick={toggleMinimize}
              className="text-slate-500 hover:text-slate-800 font-bold underline cursor-pointer"
            >
              Minimize
            </button>
          </div>
        </div>
      )}

      {/* Main Floating Trigger Pill */}
      <div className="flex items-center gap-1 bg-slate-900/90 hover:bg-slate-900 text-white rounded-full p-1 pl-3 shadow-xl border border-slate-700/80 backdrop-blur-md transition-all">
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className="flex items-center gap-2 text-xs font-bold cursor-pointer py-1 pr-1.5"
          title="Toggle Demo Mode Switcher"
        >
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse shrink-0" />
          <span className="text-slate-400 font-medium text-[11px] hidden sm:inline">Demo:</span>
          <span className="text-emerald-300 font-bold">{activeMeta.emoji} {activeMeta.name}</span>
          <ChevronUp className={`w-3.5 h-3.5 text-slate-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
        </button>

        <button
          type="button"
          onClick={toggleMinimize}
          className="w-6 h-6 rounded-full hover:bg-white/10 text-slate-400 hover:text-white flex items-center justify-center transition-colors cursor-pointer"
          title="Minimize Demo Pill"
        >
          <X className="w-3 h-3" />
        </button>
      </div>
    </div>
  )
}

export default DemoPitchPill
