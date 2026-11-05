import React, { useState, useRef } from 'react'
import { 
  Building2, 
  School, 
  GraduationCap, 
  Lock, 
  Mail, 
  Eye, 
  EyeOff, 
  ArrowRight, 
  ArrowLeft, 
  AlertCircle, 
  Sparkles, 
  ShieldCheck,
  Layers,
  CheckCircle2
} from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import { PortalFilterBar } from './PortalFilterBar'

export const CollegeLoginPage = ({ onBackToLanding, onOpenTrial, onSwitchTier, selectedTiers, onSetTiers, showPortalSwitcher = false }) => {
  const { login } = useAuth()
  const formRef = useRef(null)

  // Dedicated College Portals registry (Clean, Minimal, Noisy Descriptions Removed)
  const COLLEGE_PORTALS = [
    {
      role: 'college_admin',
      name: 'College Principal',
      badge: 'Admin',
      email: 'admin.college@roots.edu',
      iconEmoji: '🏛️',
      type: 'admin'
    },
    {
      role: 'college_faculty',
      name: 'Faculty In-Charge',
      badge: 'Enrollment ON',
      email: 'faculty.college@roots.edu',
      iconEmoji: '👩‍🏫',
      type: 'subportal'
    },
    {
      role: 'college_lecturer',
      name: 'Regular Lecturer',
      badge: 'Lecturer',
      email: 'lecturer.college@roots.edu',
      iconEmoji: '👨‍🏫',
      type: 'subportal'
    },
    {
      role: 'college_hod',
      name: 'Department HOD',
      badge: 'HOD',
      email: 'hod.college@roots.edu',
      iconEmoji: '🏢',
      type: 'subportal'
    },
    {
      role: 'college_parent',
      name: 'Parent Portal',
      badge: 'Parent',
      email: 'parent.college@roots.edu',
      iconEmoji: '👨‍👩‍👦',
      type: 'subportal'
    },
    {
      role: 'college_student',
      name: 'Student Portal',
      badge: 'Student',
      email: 'student.college@roots.edu',
      iconEmoji: '🎓',
      type: 'subportal'
    },
    {
      role: 'college_accountant',
      name: 'Accounts & Finance',
      badge: 'Finance',
      email: 'accounts.college@roots.edu',
      iconEmoji: '💼',
      type: 'subportal'
    }
  ]

  const [selectedPortal, setSelectedPortal] = useState('college_admin')
  const [identifier, setIdentifier] = useState('admin.college@roots.edu')
  const [password, setPassword] = useState('password123')
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [rememberMe, setRememberMe] = useState(true)
  const [authError, setAuthError] = useState('')

  const activePortalMeta = COLLEGE_PORTALS.find(p => p.role === selectedPortal) || COLLEGE_PORTALS[0]

  const handleSelectPortal = (portal) => {
    setSelectedPortal(portal.role)
    setIdentifier(portal.email)
    setPassword('password123')
    setAuthError('')

    if (typeof window !== 'undefined' && window.innerWidth < 768 && formRef.current) {
      formRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    setAuthError('')
    const id = (identifier || '').trim().toLowerCase()
    const pass = (password || '').trim()

    if (!id || !pass) {
      setAuthError('Please enter both your college email/username and password.')
      return
    }

    setIsLoading(true)
    setTimeout(() => {
      let targetRole = selectedPortal
      if (id.includes('parent')) targetRole = 'college_parent'
      else if (id.includes('student')) targetRole = 'college_student'
      else if (id.includes('faculty') || id.includes('lecturer')) targetRole = 'college_faculty'
      else if (id.includes('account') || id.includes('bursar')) targetRole = 'college_accountant'
      else if (id.includes('admin') || id.includes('principal')) targetRole = 'college_admin'

      login(targetRole, id, rememberMe)
      setIsLoading(false)
    }, 350)
  }

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-gradient-to-b from-[#f5f6ff] via-[#edf0fe] to-white relative overflow-hidden px-4 py-8 sm:py-12 selection:bg-indigo-600 selection:text-white font-sans">
      {/* Ambient Radial Background Accents */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-0 -left-20 w-[500px] h-[500px] bg-indigo-200/35 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 -right-20 w-[500px] h-[500px] bg-purple-200/30 rounded-full blur-3xl"></div>
      </div>

      {/* Top-Left: Back to Home Button */}
      {onBackToLanding && (
        <div className="absolute top-4 left-4 sm:top-6 sm:left-8 z-30">
          <button
            type="button"
            onClick={onBackToLanding}
            className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold text-slate-600 hover:text-slate-900 bg-white/90 hover:bg-white border border-slate-200 shadow-2xs hover:shadow-xs transition-all backdrop-blur-xs group cursor-pointer"
            title="Back to Landing Page"
          >
            <ArrowLeft className="w-4 h-4 text-slate-500 group-hover:-translate-x-0.5 transition-transform" />
            <span>Back to Home</span>
          </button>
        </div>
      )}

      {/* Main Container */}
      <div className="w-full max-w-[940px] z-10 flex flex-col items-center mt-12 sm:mt-0">
        
        {/* TOP SEGMENTED PORTAL SWITCHER & CHECKBOX FILTER BAR (Developer / Demo Mode) */}
        {showPortalSwitcher && (
          <PortalFilterBar
            activeTier="college"
            onSwitchTier={onSwitchTier}
            selectedTiers={selectedTiers}
            onSetTiers={onSetTiers}
          />
        )}

        {/* Dual-Pane Card */}
        <div className="w-full rounded-3xl bg-white border border-slate-200/90 shadow-[0_15px_45px_-5px_rgba(0,0,0,0.06),0_1px_3px_rgba(0,0,0,0.02)] overflow-hidden grid grid-cols-1 md:grid-cols-12 relative">
          
          {/* LEFT PANE: Dedicated College Branding */}
          <div className="md:col-span-5 p-6 sm:p-7 md:p-8 flex flex-col justify-between border-b md:border-b-0 md:border-r border-slate-100 bg-gradient-to-b from-[#f5f6ff] via-[#edf0fe] to-[#e6eaff] relative">
            <div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold border shadow-2xs mb-5 self-start bg-indigo-50 text-indigo-800 border-indigo-200">
                <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
                <span>College Portal Access (Intermediate & ADP)</span>
              </div>

              <div className="flex items-center gap-3 mb-4">
                <div className="w-13 h-13 rounded-2xl flex items-center justify-center p-2.5 shadow-md bg-gradient-to-tr from-indigo-700 via-indigo-600 to-purple-600 text-white shadow-indigo-500/25">
                  <Building2 className="w-8 h-8 stroke-[2.2]" />
                </div>
                <div>
                  <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight font-heading leading-tight">
                    Roots Millennium
                  </h1>
                  <span className="text-xs font-semibold text-indigo-800">Higher Secondary College</span>
                </div>
              </div>

              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed mb-6">
                Official Higher Secondary Operating System for Intermediate, F.Sc, ICS, I.Com, FA & Associate Degree Programs.
              </p>

              {/* Security & Capability Trust Badges */}
              <div className="space-y-2.5">
                <div className="flex items-center gap-2.5 p-2.5 rounded-xl bg-white/80 border border-indigo-100 shadow-2xs">
                  <div className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0 bg-indigo-50 text-indigo-700">
                    <ShieldCheck className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-800">Board Examination Readiness</h4>
                    <p className="text-[10px] text-slate-500">BISE enrollment, roll numbers, practical labs & marksheets</p>
                  </div>
                </div>

                <div className="flex items-center gap-2.5 p-2.5 rounded-xl bg-white/80 border border-indigo-100 shadow-2xs">
                  <div className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0 bg-indigo-50 text-indigo-700">
                    <Lock className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-800">Faculty & Staff Delegation</h4>
                    <p className="text-[10px] text-slate-500">In-Charge enrollment controls and lecture logs</p>
                  </div>
                </div>

                <div className="flex items-center gap-2.5 p-2.5 rounded-xl bg-white/80 border border-indigo-100 shadow-2xs">
                  <div className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0 bg-indigo-50 text-indigo-700">
                    <Sparkles className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-800">Merit & Concession Engine</h4>
                    <p className="text-[10px] text-slate-500">Scholarship quotas, fee concessions & 1Bill integration</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="pt-4 mt-6 border-t border-indigo-200/60 flex items-center justify-between text-[11px] text-slate-500">
              <span className="flex items-center gap-1.5 font-medium">
                <span className="w-2 h-2 rounded-full animate-pulse bg-indigo-500"></span>
                <span>College Portal (11-12 & ADP)</span>
              </span>
              <span className="font-mono text-[10px] text-slate-400">v2.5 Production</span>
            </div>
          </div>

          {/* RIGHT PANE: Modern Sign-In Form */}
          <div className="md:col-span-7 p-6 sm:p-7 md:p-8 flex flex-col justify-between bg-white">
            <div ref={formRef}>
              <div className="mb-5">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight font-heading">
                    College Sign In
                  </h2>
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-indigo-50 text-indigo-800 border border-indigo-200">
                    <span>{activePortalMeta.iconEmoji}</span>
                    <span>{activePortalMeta.name}</span>
                  </span>
                </div>
                <p className="text-xs text-slate-500 mt-1">
                  Enter your credentials to continue into the college system.
                </p>
              </div>

              {authError && (
                <div className="mb-4 p-3 rounded-xl bg-rose-50 border border-rose-200 flex items-start gap-2.5 text-rose-800 text-xs">
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-rose-600" />
                  <span>{authError}</span>
                </div>
              )}

              {/* Form */}
              <form onSubmit={handleSubmit} className="space-y-3.5">
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                    College Email or Roll Number
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                      type="text"
                      value={identifier}
                      onChange={(e) => setIdentifier(e.target.value)}
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-50/70 hover:bg-slate-50 border border-slate-200 text-slate-800 placeholder-slate-400 text-xs sm:text-sm focus:bg-white focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all font-medium"
                      placeholder="e.g. admin.college@roots.edu or student id"
                    />
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider">
                      Password
                    </label>
                    <button
                      type="button"
                      onClick={() => setPassword('password123')}
                      className="text-xs font-bold text-indigo-700 hover:text-indigo-800 transition-colors cursor-pointer"
                    >
                      Use Demo Password
                    </button>
                  </div>
                  <div className="relative">
                    <Lock className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full pl-10 pr-10 py-2.5 rounded-xl bg-slate-50/70 hover:bg-slate-50 border border-slate-200 text-slate-800 placeholder-slate-400 text-xs sm:text-sm focus:bg-white focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all"
                      placeholder="••••••••••••"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors cursor-pointer"
                      title={showPassword ? 'Hide password' : 'Show password'}
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <div className="flex items-center justify-between text-xs pt-0.5">
                  <label className="flex items-center gap-2 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={rememberMe}
                      onChange={(e) => setRememberMe(e.target.checked)}
                      className="w-4 h-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 accent-indigo-600 cursor-pointer"
                    />
                    <span className="text-slate-700 font-medium">Remember this terminal</span>
                  </label>
                  <span className="text-slate-400 font-medium">30 Days Active</span>
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full py-3 rounded-xl font-bold text-xs sm:text-sm text-white bg-indigo-600 hover:bg-indigo-700 shadow-md shadow-indigo-600/25 transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-[0.99] disabled:opacity-50"
                >
                  {isLoading ? (
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  ) : (
                    <>
                      <span>Sign In to {activePortalMeta.name}</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </form>

              {/* QUICK DEMO ROLES SELECTOR */}
              <div className="pt-4 mt-5 border-t border-slate-100">
                <div className="flex items-center justify-between mb-2.5 px-0.5">
                  <span className="text-[11px] font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                    <Layers className="w-3.5 h-3.5 text-indigo-600" />
                    <span>Select Portal Role</span>
                  </span>
                  <span className="text-[10px] text-slate-400 font-medium">
                    Click to auto-fill account
                  </span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {COLLEGE_PORTALS.map((p) => {
                    const isSelected = selectedPortal === p.role
                    return (
                      <button
                        key={p.role}
                        type="button"
                        onClick={() => handleSelectPortal(p)}
                        className={`p-2 rounded-xl text-left transition-all cursor-pointer border flex flex-col justify-between ${
                          isSelected 
                            ? 'border-indigo-600 bg-indigo-50/90 ring-2 ring-indigo-500/20 shadow-xs' 
                            : 'border-slate-200 hover:border-indigo-300 bg-white hover:bg-slate-50/80 shadow-2xs'
                        }`}
                      >
                        <div className="flex items-center justify-between gap-1 mb-1">
                          <span className="text-xs font-bold text-slate-900 flex items-center gap-1.5 truncate">
                            <span>{p.iconEmoji}</span>
                            <span className="truncate">{p.name}</span>
                          </span>
                          {isSelected && (
                            <CheckCircle2 className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
                          )}
                        </div>
                        <div className="flex items-center justify-between text-[10px] text-slate-400 font-mono truncate">
                          <span className="truncate">{p.email}</span>
                        </div>
                      </button>
                    )
                  })}
                </div>
              </div>
            </div>

            {/* Bottom Registration & Trial Row */}
            <div className="pt-3.5 mt-4 border-t border-slate-100">
              <button
                type="button"
                onClick={() => {
                  if (onOpenTrial) onOpenTrial()
                  else if (onBackToLanding) onBackToLanding()
                }}
                className="w-full py-2.5 rounded-xl border border-indigo-200 bg-indigo-50/60 hover:bg-indigo-100 text-indigo-800 text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer shadow-2xs group"
              >
                <Building2 className="w-4 h-4 group-hover:scale-110 transition-transform" />
                <span>Register College / Start Free Trial</span>
                <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
              </button>
            </div>
          </div>

        </div>

        {/* Subtle Footer with Discreet HQ Link */}
        <div className="w-full text-center mt-5 mb-2 text-xs text-slate-400 flex items-center justify-center gap-3">
          <span>© {new Date().getFullYear()} Roots Millennium College • Enterprise Higher Secondary Portal</span>
          <span>•</span>
          <button
            type="button"
            onClick={() => onSwitchTier('superadmin')}
            className="text-slate-400 hover:text-slate-600 text-[11px] font-medium inline-flex items-center gap-1 transition-colors cursor-pointer"
            title="Headquarters Administrative Control"
          >
            <Lock className="w-3 h-3 text-slate-400" />
            <span>System HQ</span>
          </button>
        </div>

      </div>
    </div>
  )
}

export default CollegeLoginPage;
