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
  UserCheck, 
  Users, 
  FileCheck, 
  Receipt,
  Layers,
  CheckCircle2
} from 'lucide-react'
import { useAuth } from '../../context/AuthContext'

export const CollegeLoginPage = ({ onBackToLanding, onOpenTrial, onSwitchTier }) => {
  const { login } = useAuth()
  const formRef = useRef(null)

  // Dedicated College Portals registry (Pick 2 - 100% Isolated Scope)
  const COLLEGE_PORTALS = [
    {
      role: 'college_admin',
      name: 'College Principal (Admin)',
      badge: '18 Operational Modules',
      scope: 'Campus Dashboard, Admissions & Merit, Faculty Roster, Board Exams & Discipline',
      email: 'admin.college@roots.edu',
      iconEmoji: '🏛️',
      type: 'admin'
    },
    {
      role: 'college_student',
      name: 'Student Portal',
      badge: 'Pick 2',
      scope: 'Attendance, timetable, results, notes, fee challan, notices, board forms',
      email: 'student.college@roots.edu',
      iconEmoji: '🎓',
      type: 'subportal'
    },
    {
      role: 'college_parent',
      name: 'Parent Portal',
      badge: 'Pick 2',
      scope: 'Attendance, fee, result, notices, PTM, concessions',
      email: 'parent.college@roots.edu',
      iconEmoji: '👨‍👩‍👦',
      type: 'subportal'
    },
    {
      role: 'college_faculty',
      name: 'Faculty In-Charge (Enrollment ON)',
      badge: 'Enrollment ON',
      scope: 'Dr. Nadia Hashmi: Pre-Med In-Charge with student enrollment permissions',
      email: 'faculty.college@roots.edu',
      iconEmoji: '👩‍🏫',
      type: 'subportal'
    },
    {
      role: 'college_lecturer',
      name: 'Regular Lecturer (Standard - No Enrollment)',
      badge: 'Enrollment OFF',
      scope: 'Lecturer Bilal Zubair: Physics lecturer with standard view (enrollment hidden)',
      email: 'lecturer.college@roots.edu',
      iconEmoji: '👨‍🏫',
      type: 'subportal'
    },
    {
      role: 'college_hod',
      name: 'HOD Portal',
      badge: 'Pick 2',
      scope: 'Apne department ki performance, attendance, results',
      email: 'hod.college@roots.edu',
      iconEmoji: '🏢',
      type: 'subportal'
    },
    {
      role: 'college_accountant',
      name: 'Accountant Portal',
      badge: 'Pick 2',
      scope: 'Sirf fees aur accounts',
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

  // Crucial Interaction Rule:
  // Clicking an option below does NOT auto-login or bypass credentials.
  // It selects the portal, populates matching credentials into the form above,
  // and requires the user to click "Sign In to [Portal] →".
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
      else if (id.includes('faculty') || id.includes('prof') || id.includes('teacher')) targetRole = 'college_faculty'
      else if (id.includes('hod')) targetRole = 'college_hod'
      else if (id.includes('account') || id.includes('bursar')) targetRole = 'college_accountant'
      else if (id.includes('admin') || id.includes('principal')) targetRole = 'college_admin'

      login(targetRole, id, rememberMe)
      setIsLoading(false)
    }, 350)
  }

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-bg relative overflow-hidden px-4 py-8 sm:py-12 selection:bg-primary selection:text-white font-sans">
      {/* Ambient Radial Background Accents */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-0 -left-20 w-[500px] h-[500px] bg-primary/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 -right-20 w-[500px] h-[500px] bg-secondary/10 rounded-full blur-3xl"></div>
      </div>

      {/* Top-Left: Back to Home Button */}
      {onBackToLanding && (
        <div className="absolute top-4 left-4 sm:top-6 sm:left-8 z-30">
          <button
            type="button"
            onClick={onBackToLanding}
            className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white bg-white/90 dark:bg-slate-900/90 hover:bg-white dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800 shadow-2xs hover:shadow-xs transition-all backdrop-blur-xs group cursor-pointer"
            title="Back to Landing Page"
          >
            <ArrowLeft className="w-4 h-4 text-slate-500 group-hover:-translate-x-0.5 transition-transform" />
            <span>Back to Home</span>
          </button>
        </div>
      )}

      {/* Main Container */}
      <div className="w-full max-w-[940px] z-10 flex flex-col items-center mt-14 sm:mt-0">
        
        {/* Dual-Pane Card */}
        <div className="w-full rounded-3xl bg-surface border border-border shadow-soft overflow-hidden grid grid-cols-1 md:grid-cols-12 relative">
          
          {/* LEFT PANE: Dedicated College Branding */}
          <div 
            className="md:col-span-5 p-5 sm:p-6 md:p-7 flex flex-col justify-between border-b md:border-b-0 md:border-r border-slate-100 dark:border-slate-800 text-white relative overflow-hidden login-hero-pane"
            style={{ background: 'var(--hero-gradient)' }}
          >
            <div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold border shadow-2xs mb-5 self-start bg-white/20 text-white border-white/30 backdrop-blur-sm">
                <Sparkles className="w-3.5 h-3.5 text-white" />
                <span>College Portal Access (Intermediate & ADP)</span>
              </div>

              <div className="flex items-center gap-2.5 mb-4">
                <div className="w-13 h-13 rounded-2xl flex items-center justify-center p-2.5 shadow-md bg-white/20 backdrop-blur-md border border-white/30 text-white">
                  <Building2 className="w-8 h-8 stroke-[2.2]" />
                </div>
                <div className="w-4 h-4 rounded-full border-2 border-white/40 bg-white flex items-center justify-center shadow-xs">
                  <div className="w-1.5 h-1.5 rounded-full animate-ping bg-teal-300"></div>
                </div>
              </div>

              <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight font-heading">
                College Academic Portal
              </h1>
              <div className="mt-1 flex items-center gap-2">
                <span className="text-xs font-bold text-white/90">Roots International College & Academy</span>
              </div>
              <p className="text-xs sm:text-sm text-white/85 leading-relaxed mt-2 mb-4 md:mb-5">
                Specialized College Enterprise Operating System for Intermediate (F.Sc / ICS / I.Com / FA) and Associate Degree Programs.
              </p>

              {/* Feature Highlights */}
              <div className="hidden md:block space-y-2">
                <div className="flex items-center gap-3 p-2.5 rounded-2xl bg-white/15 backdrop-blur-md border border-white/20 text-white shadow-2xs">
                  <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0 bg-white/20 text-white">
                    <UserCheck className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-white">BISE Board Examination Desk</h4>
                    <p className="text-[11px] text-white/80 leading-tight">Board registration, roll number slips, and practical schedules.</p>
                  </div>
                </div>

                <div className="flex items-center gap-3 p-2.5 rounded-2xl bg-white/15 backdrop-blur-md border border-white/20 text-white shadow-2xs">
                  <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0 bg-white/20 text-white">
                    <Users className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-white">Academic Merit & Admissions</h4>
                    <p className="text-[11px] text-white/80 leading-tight">Automated merit calculation, cutoff scores & seat quota lists.</p>
                  </div>
                </div>

                <div className="flex items-center gap-3 p-2.5 rounded-2xl bg-white/15 backdrop-blur-md border border-white/20 text-white shadow-2xs">
                  <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0 bg-white/20 text-white">
                    <Receipt className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-white">Kinship & Merit Scholarships</h4>
                    <p className="text-[11px] text-white/80 leading-tight">Concession management, installment schedules & fee clearance.</p>
                  </div>
                </div>

                <div className="flex items-center gap-3 p-2.5 rounded-2xl bg-white/15 backdrop-blur-md border border-white/20 text-white shadow-2xs">
                  <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0 bg-white/20 text-white">
                    <FileCheck className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-white">Discipline & Attendance Warnings</h4>
                    <p className="text-[11px] text-white/80 leading-tight">75% attendance rule enforcement & automated warning letters.</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="hidden md:flex pt-4 mt-4 border-t border-white/20 items-center justify-between text-[11px] text-white/80">
              <span className="flex items-center gap-1.5 font-medium">
                <span className="w-2 h-2 rounded-full animate-pulse bg-teal-400"></span>
                <span className="font-semibold text-white/90">College Portal (11-12 & ADP)</span>
              </span>
              <span className="font-mono text-white/80">v2.5 Production</span>
            </div>
          </div>

          {/* RIGHT PANE: College Sign In Form + Scoped College Portals Selection */}
          <div className="md:col-span-7 p-5 sm:p-8 flex flex-col justify-between bg-white" ref={formRef}>
            <div>
              {/* Form Title & Active Selected Portal Badge */}
              <div className="mb-4">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
                    College Sign In
                  </h2>
                  <span className="text-[10px] font-extrabold uppercase px-2.5 py-0.5 rounded-full border bg-indigo-50 text-indigo-800 border-indigo-200">
                    College Login Portals
                  </span>
                </div>

                {/* Selected Portal Indicator Banner */}
                <div className="mt-2.5 p-2 sm:p-2.5 rounded-xl bg-indigo-50/80 border border-indigo-200 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-base sm:text-lg">{activePortalMeta.iconEmoji}</span>
                    <div>
                      <div className="text-xs font-bold text-indigo-950 flex items-center gap-1.5">
                        <span>Target Portal:</span>
                        <span className="underline decoration-indigo-400">{activePortalMeta.name}</span>
                      </div>
                      <p className="text-[10px] text-indigo-700 line-clamp-1">{activePortalMeta.scope || activePortalMeta.description}</p>
                    </div>
                  </div>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-indigo-600 text-white shrink-0 ml-2">
                    Ready to Sign In
                  </span>
                </div>
              </div>

              {authError && (
                <div className="mb-3.5 p-3 rounded-xl bg-rose-50 border border-rose-200 flex items-start gap-2.5 text-rose-800 text-xs">
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-rose-600" />
                  <span>{authError}</span>
                </div>
              )}

              {/* Sign In Credentials Form */}
              <form onSubmit={handleSubmit} className="space-y-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                    College Email or Staff ID
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                      type="text"
                      value={identifier}
                      onChange={(e) => setIdentifier(e.target.value)}
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-50/70 hover:bg-slate-50 border border-slate-200 text-slate-800 placeholder-slate-400 text-xs sm:text-sm focus:bg-white focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all font-medium"
                      placeholder="e.g. admin.college@roots.edu or student.college"
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
                  className="btn-hero-gradient w-full py-3 rounded-xl font-bold text-xs sm:text-sm text-white shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-[0.99] disabled:opacity-50"
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

              {/* DEDICATED COLLEGE LOGIN PORTALS LIST (Pick 2) */}
              <div className="pt-4 mt-4 border-t border-slate-100">
                <div className="flex items-center justify-between mb-2.5 px-0.5">
                  <span className="text-[11px] font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                    <Layers className="w-3.5 h-3.5 text-indigo-600" />
                    <span>College Dedicated Portals (Pick 2)</span>
                  </span>
                  <span className="text-[10px] text-indigo-800 font-semibold bg-indigo-50 border border-indigo-200 px-2 py-0.5 rounded-full">
                    Select Below → Sign In Above
                  </span>
                </div>

                <div className="space-y-2">
                  {/* 1. College Principal / Admin Card */}
                  {(() => {
                    const adminPortal = COLLEGE_PORTALS[0]
                    const isSelected = selectedPortal === adminPortal.role
                    return (
                      <button
                        key={adminPortal.role}
                        type="button"
                        onClick={() => handleSelectPortal(adminPortal)}
                        className={`w-full p-2.5 rounded-xl text-left transition-all cursor-pointer shadow-2xs flex items-center justify-between border ${
                          isSelected 
                            ? 'border-indigo-500 bg-indigo-50/90 ring-2 ring-indigo-500/30' 
                            : 'border-slate-200 hover:border-indigo-300 bg-white hover:bg-indigo-50/40'
                        }`}
                      >
                        <div className="pr-2">
                          <div className="text-xs font-bold text-indigo-950 flex items-center gap-1.5">
                            <span>{adminPortal.iconEmoji} {adminPortal.name}</span>
                            <span className="text-[9px] font-extrabold uppercase bg-indigo-200/80 text-indigo-900 px-1.5 py-0.2 rounded">
                              {adminPortal.badge}
                            </span>
                          </div>
                          <p className="text-[10px] text-slate-500 mt-0.5 leading-tight">
                            {adminPortal.scope}
                          </p>
                        </div>
                        <div className="shrink-0 flex items-center gap-1">
                          {isSelected ? (
                            <span className="text-[10px] font-bold text-indigo-700 bg-indigo-100 px-2 py-1 rounded-md flex items-center gap-1">
                              <CheckCircle2 className="w-3.5 h-3.5" />
                              <span>Selected</span>
                            </span>
                          ) : (
                            <span className="text-[10px] font-bold text-slate-500 hover:text-indigo-700 bg-slate-100 px-2 py-1 rounded-md">
                              Select Portal
                            </span>
                          )}
                        </div>
                      </button>
                    )
                  })()}

                  {/* 2. Sub-Portals Grid: Student, Parent, Faculty, HOD, Accountant */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {COLLEGE_PORTALS.slice(1).map((p) => {
                      const isSelected = selectedPortal === p.role
                      return (
                        <button
                          key={p.role}
                          type="button"
                          onClick={() => handleSelectPortal(p)}
                          className={`p-2.5 rounded-xl text-left transition-all cursor-pointer shadow-2xs border flex flex-col justify-between ${
                            isSelected 
                              ? 'border-indigo-500 bg-indigo-50/90 ring-2 ring-indigo-500/30' 
                              : 'border-slate-200 hover:border-indigo-300 bg-white hover:bg-indigo-50/40'
                          }`}
                        >
                          <div>
                            <div className="flex items-center justify-between mb-1">
                              <span className="text-xs font-bold text-slate-900 flex items-center gap-1">
                                <span>{p.iconEmoji}</span>
                                <span>{p.name}</span>
                              </span>
                              {isSelected && (
                                <span className="text-[9px] font-extrabold text-indigo-800 bg-indigo-200/80 px-1.5 py-0.5 rounded flex items-center gap-0.5">
                                  <CheckCircle2 className="w-3 h-3" />
                                  <span>Active</span>
                                </span>
                              )}
                            </div>
                            <p className="text-[10px] text-slate-500 line-clamp-2 leading-tight">
                              {p.scope}
                            </p>
                          </div>
                          <div className="mt-2 pt-1 border-t border-slate-100 flex items-center justify-between text-[10px]">
                            <span className="text-slate-400 font-mono text-[9px] truncate max-w-[130px]">{p.email}</span>
                            <span className={`font-bold ${isSelected ? 'text-indigo-700' : 'text-slate-500'}`}>
                              {isSelected ? 'Ready ↑' : 'Select →'}
                            </span>
                          </div>
                        </button>
                      )
                    })}
                  </div>
                </div>
              </div>
            </div>

            {/* Bottom Registration & Trial Row */}
            <div className="pt-3.5 mt-3.5 border-t border-slate-100">
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

      </div>
    </div>
  )
}

export default CollegeLoginPage