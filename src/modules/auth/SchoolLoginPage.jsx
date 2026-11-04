import React, { useState, useRef } from 'react'
import { 
  School, 
  Building2, 
  GraduationCap, 
  Lock, 
  Mail, 
  Eye, 
  EyeOff, 
  ArrowRight, 
  ArrowLeft, 
  AlertCircle, 
  Sparkles, 
  CalendarCheck, 
  BookOpen, 
  Receipt, 
  Award,
  Layers,
  CheckCircle2
} from 'lucide-react'
import { useAuth } from '../../context/AuthContext'

export const SchoolLoginPage = ({ onBackToLanding, onOpenTrial, onSwitchTier }) => {
  const { login } = useAuth()
  const formRef = useRef(null)

  // Dedicated School Portals registry (Pick 1 - 100% Isolated Scope)
  const SCHOOL_PORTALS = [
    {
      role: 'school_admin',
      name: 'School Principal (Admin)',
      badge: '15 Operational Modules',
      scope: 'Campus Dashboard, Admissions, Staff, Academics, Daily Attendance & Settings',
      email: 'admin.school@cityschool.edu',
      iconEmoji: '🏫',
      type: 'admin'
    },
    {
      role: 'school_parent',
      name: 'Parent Portal',
      badge: 'Pick 1',
      scope: 'Attendance, fee, result, diary, notices, PTM, challan download',
      email: 'parent.school@cityschool.edu',
      iconEmoji: '👨‍👩‍👧',
      type: 'subportal'
    },
    {
      role: 'school_student',
      name: 'Student Portal',
      badge: 'Pick 1',
      scope: 'Timetable, homework, results, notes',
      email: 'student.school@cityschool.edu',
      iconEmoji: '🎓',
      type: 'subportal'
    },
    {
      role: 'school_teacher',
      name: 'Teacher In-Charge (Enrollment ON)',
      badge: 'Enrollment ON',
      scope: 'Sir Salman Ahmed: Grade 10 In-Charge with student enrollment permissions',
      email: 'teacher.school@cityschool.edu',
      iconEmoji: '👨‍🏫',
      type: 'subportal'
    },
    {
      role: 'school_teacher_std',
      name: 'Regular Teacher (Standard - No Enrollment)',
      badge: 'Enrollment OFF',
      scope: 'Ms. Ayesha Siddiqui: Science teacher with standard view (enrollment hidden)',
      email: 'ayesha.teacher@cityschool.edu',
      iconEmoji: '👩‍🏫',
      type: 'subportal'
    },
    {
      role: 'school_accountant',
      name: 'Accountant Portal',
      badge: 'Pick 1',
      scope: 'Sirf fees aur accounts',
      email: 'accounts.school@cityschool.edu',
      iconEmoji: '💼',
      type: 'subportal'
    }
  ]

  const [selectedPortal, setSelectedPortal] = useState('school_admin')
  const [identifier, setIdentifier] = useState('admin.school@cityschool.edu')
  const [password, setPassword] = useState('password123')
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [rememberMe, setRememberMe] = useState(true)
  const [authError, setAuthError] = useState('')

  // Active portal item helper
  const activePortalMeta = SCHOOL_PORTALS.find(p => p.role === selectedPortal) || SCHOOL_PORTALS[0]

  // Crucial Interaction Rule:
  // Clicking an option below does NOT auto-login or bypass credentials.
  // It selects the portal, populates matching credentials into the form above,
  // and requires the user to click "Sign In to [Portal] →".
  const handleSelectPortal = (portal) => {
    setSelectedPortal(portal.role)
    setIdentifier(portal.email)
    setPassword('password123')
    setAuthError('')

    // Smoothly scroll to the form for mobile screen viewports
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
      setAuthError('Please enter both your school email/username and password.')
      return
    }

    setIsLoading(true)
    setTimeout(() => {
      // Authenticate directly into the explicitly chosen portal role
      let targetRole = selectedPortal
      if (id.includes('parent')) targetRole = 'school_parent'
      else if (id.includes('student')) targetRole = 'school_student'
      else if (id.includes('teacher')) targetRole = 'school_teacher'
      else if (id.includes('account') || id.includes('bursar')) targetRole = 'school_accountant'
      else if (id.includes('admin') || id.includes('principal')) targetRole = 'school_admin'

      login(targetRole, id, rememberMe)
      setIsLoading(false)
    }, 350)
  }

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-gradient-to-b from-[#f4fbf7] via-[#ebf8f1] to-white relative overflow-hidden px-4 py-8 sm:py-12 selection:bg-emerald-500 selection:text-white font-sans">
      {/* Ambient Radial Background Accents */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-0 -left-20 w-[500px] h-[500px] bg-emerald-200/35 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 -right-20 w-[500px] h-[500px] bg-teal-200/30 rounded-full blur-3xl"></div>
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
        
        {/* TOP SEGMENTED PORTAL SWITCHER BAR */}
        <div className="w-full flex flex-wrap items-center justify-center gap-2 mb-4 sm:mb-5">
          <button
            type="button"
            className="px-4 py-2 rounded-xl text-xs sm:text-sm font-bold bg-emerald-600 text-white shadow-emerald-600/30 ring-2 ring-emerald-500/40 shadow-xs cursor-default flex items-center gap-2"
          >
            <School className="w-4 h-4 text-white" />
            <span>🏫 School Portal Login</span>
            <span className="text-[10px] px-1.5 py-0.2 rounded-md bg-white/20 text-white font-extrabold">
              K-10 Scope
            </span>
          </button>

          <button
            type="button"
            onClick={() => onSwitchTier('college')}
            className="px-4 py-2 rounded-xl text-xs sm:text-sm font-bold bg-white hover:bg-indigo-50 text-slate-700 border border-slate-200 hover:border-indigo-300 transition-all shadow-xs cursor-pointer flex items-center gap-2"
          >
            <Building2 className="w-4 h-4 text-indigo-600" />
            <span>🏛️ College Portal Login</span>
            <span className="text-[10px] px-1.5 py-0.2 rounded-md bg-indigo-100 text-indigo-800">
              11-12 & ADP
            </span>
          </button>

          <button
            type="button"
            onClick={() => onSwitchTier('university')}
            className="px-4 py-2 rounded-xl text-xs sm:text-sm font-bold bg-white hover:bg-purple-50 text-slate-700 border border-slate-200 hover:border-purple-300 transition-all shadow-xs cursor-pointer flex items-center gap-2"
          >
            <GraduationCap className="w-4 h-4 text-purple-600" />
            <span>🎓 University Portal Login</span>
            <span className="text-[10px] px-1.5 py-0.2 rounded-md bg-purple-100 text-purple-800">
              HEC BS/MS
            </span>
          </button>

          <button
            type="button"
            onClick={() => onSwitchTier('superadmin')}
            className="px-3.5 py-2 rounded-xl text-xs font-bold text-slate-600 hover:text-purple-700 bg-white hover:bg-slate-50 border border-slate-200 transition-all cursor-pointer flex items-center gap-1.5 shadow-2xs"
            title="Open Master Superadmin Control Plane"
          >
            <Lock className="w-3.5 h-3.5 text-purple-600" />
            <span className="hidden sm:inline">Super Admin</span>
          </button>
        </div>

        {/* Dual-Pane Card */}
        <div className="w-full rounded-3xl bg-white border border-slate-200/90 shadow-[0_15px_45px_-5px_rgba(0,0,0,0.06),0_1px_3px_rgba(0,0,0,0.02)] overflow-hidden grid grid-cols-1 md:grid-cols-12 relative">
          
          {/* LEFT PANE: Dedicated School Branding */}
          <div className="md:col-span-5 p-5 sm:p-6 md:p-7 flex flex-col justify-between border-b md:border-b-0 md:border-r border-slate-100 bg-gradient-to-b from-[#f4fbf7] via-[#ebf7f0] to-[#e4f5ea] relative">
            <div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold border shadow-2xs mb-5 self-start bg-emerald-50 text-emerald-800 border-emerald-200">
                <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
                <span>School Portal Access (K-10)</span>
              </div>

              <div className="flex items-center gap-2.5 mb-4">
                <div className="w-13 h-13 rounded-2xl flex items-center justify-center p-2.5 shadow-md bg-gradient-to-tr from-emerald-700 via-emerald-600 to-teal-600 text-white shadow-emerald-500/25">
                  <School className="w-8 h-8 stroke-[2.2]" />
                </div>
                <div className="w-4 h-4 rounded-full border-2 border-slate-300 bg-white flex items-center justify-center shadow-xs">
                  <div className="w-1.5 h-1.5 rounded-full animate-ping bg-emerald-600"></div>
                </div>
              </div>

              <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight font-heading">
                School Academic Portal
              </h1>
              <div className="mt-1 flex items-center gap-2">
                <span className="text-xs font-bold text-slate-800">City School Model Town Campus</span>
              </div>
              <p className="text-xs sm:text-sm text-slate-500 leading-relaxed mt-2 mb-5">
                Dedicated School Academic Operating System for Primary, Middle, Matriculation & Cambridge O-Level wings.
              </p>

              <div className="space-y-2">
                <div className="flex items-center gap-3 p-2.5 rounded-2xl bg-white/90 border border-slate-100 shadow-2xs">
                  <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0 bg-emerald-50 text-emerald-700">
                    <CalendarCheck className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-800">Daily Absentee Sentinel & SMS</h4>
                    <p className="text-[11px] text-slate-500 leading-tight">Automated 1-click SMS broadcasts to parents for absentees.</p>
                  </div>
                </div>

                <div className="flex items-center gap-3 p-2.5 rounded-2xl bg-white/90 border border-slate-100 shadow-2xs">
                  <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0 bg-emerald-50 text-emerald-700">
                    <BookOpen className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-800">Daily Class Diary & Homework</h4>
                    <p className="text-[11px] text-slate-500 leading-tight">Real-time teacher daily diary upload, syllabus tracker & notes.</p>
                  </div>
                </div>

                <div className="flex items-center gap-3 p-2.5 rounded-2xl bg-white/90 border border-slate-100 shadow-2xs">
                  <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0 bg-emerald-50 text-emerald-700">
                    <Receipt className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-800">3-Part Bank Challan & Fees</h4>
                    <p className="text-[11px] text-slate-500 leading-tight">Bank-grade computerized monthly fee vouchers with 1Link barcode.</p>
                  </div>
                </div>

                <div className="flex items-center gap-3 p-2.5 rounded-2xl bg-white/90 border border-slate-100 shadow-2xs">
                  <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0 bg-emerald-50 text-emerald-700">
                    <Award className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-800">School Leaving Certificates (SLC)</h4>
                    <p className="text-[11px] text-slate-500 leading-tight">Instant official SLC & character certificates generation.</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="pt-4 mt-4 border-t border-slate-200/80 flex items-center justify-between text-[11px] text-slate-500">
              <span className="flex items-center gap-1.5 font-medium">
                <span className="w-2 h-2 rounded-full animate-pulse bg-emerald-500"></span>
                <span className="font-semibold text-slate-700">School Portal (K-10)</span>
              </span>
              <span className="font-mono text-slate-400">v2.5 Production</span>
            </div>
          </div>

          {/* RIGHT PANE: School Sign In Form + Scoped School Portals Selection */}
          <div className="md:col-span-7 p-5 sm:p-8 flex flex-col justify-between bg-white" ref={formRef}>
            <div>
              {/* Form Title & Active Selected Portal Badge */}
              <div className="mb-4">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
                    School Sign In
                  </h2>
                  <span className="text-[10px] font-extrabold uppercase px-2.5 py-0.5 rounded-full border bg-emerald-50 text-emerald-800 border-emerald-200">
                    School Login Portals
                  </span>
                </div>

                {/* Selected Portal Indicator Banner */}
                <div className="mt-2.5 p-2 sm:p-2.5 rounded-xl bg-emerald-50/80 border border-emerald-200 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-base sm:text-lg">{activePortalMeta.iconEmoji}</span>
                    <div>
                      <div className="text-xs font-bold text-emerald-950 flex items-center gap-1.5">
                        <span>Target Portal:</span>
                        <span className="underline decoration-emerald-400">{activePortalMeta.name}</span>
                      </div>
                      <p className="text-[10px] text-emerald-700 line-clamp-1">{activePortalMeta.scope || activePortalMeta.description}</p>
                    </div>
                  </div>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-emerald-600 text-white shrink-0 ml-2">
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
                    School Email or Staff ID
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                      type="text"
                      value={identifier}
                      onChange={(e) => setIdentifier(e.target.value)}
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-50/70 hover:bg-slate-50 border border-slate-200 text-slate-800 placeholder-slate-400 text-xs sm:text-sm focus:bg-white focus:outline-none focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 transition-all font-medium"
                      placeholder="e.g. admin.school@cityschool.edu or teacher.school"
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
                      className="text-xs font-bold text-emerald-700 hover:text-emerald-800 transition-colors cursor-pointer"
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
                      className="w-full pl-10 pr-10 py-2.5 rounded-xl bg-slate-50/70 hover:bg-slate-50 border border-slate-200 text-slate-800 placeholder-slate-400 text-xs sm:text-sm focus:bg-white focus:outline-none focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 transition-all"
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
                      className="w-4 h-4 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500 accent-emerald-600 cursor-pointer"
                    />
                    <span className="text-slate-700 font-medium">Remember this terminal</span>
                  </label>
                  <span className="text-slate-400 font-medium">30 Days Active</span>
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full py-3 rounded-xl font-bold text-xs sm:text-sm text-white bg-emerald-600 hover:bg-emerald-700 shadow-md shadow-emerald-600/25 transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-[0.99] disabled:opacity-50"
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

              {/* DEDICATED SCHOOL LOGIN PORTALS LIST (Pick 1) */}
              <div className="pt-4 mt-4 border-t border-slate-100">
                <div className="flex items-center justify-between mb-2.5 px-0.5">
                  <span className="text-[11px] font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                    <Layers className="w-3.5 h-3.5 text-emerald-600" />
                    <span>School Dedicated Portals (Pick 1)</span>
                  </span>
                  <span className="text-[10px] text-emerald-800 font-semibold bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full">
                    Select Below → Sign In Above
                  </span>
                </div>

                <div className="space-y-2">
                  {/* 1. School Principal / Admin Card */}
                  {(() => {
                    const adminPortal = SCHOOL_PORTALS[0]
                    const isSelected = selectedPortal === adminPortal.role
                    return (
                      <button
                        key={adminPortal.role}
                        type="button"
                        onClick={() => handleSelectPortal(adminPortal)}
                        className={`w-full p-2.5 rounded-xl text-left transition-all cursor-pointer shadow-2xs flex items-center justify-between border ${
                          isSelected 
                            ? 'border-emerald-500 bg-emerald-50/90 ring-2 ring-emerald-500/30' 
                            : 'border-slate-200 hover:border-emerald-300 bg-white hover:bg-emerald-50/40'
                        }`}
                      >
                        <div className="pr-2">
                          <div className="text-xs font-bold text-emerald-950 flex items-center gap-1.5">
                            <span>{adminPortal.iconEmoji} {adminPortal.name}</span>
                            <span className="text-[9px] font-extrabold uppercase bg-emerald-200/80 text-emerald-900 px-1.5 py-0.2 rounded">
                              {adminPortal.badge}
                            </span>
                          </div>
                          <p className="text-[10px] text-slate-500 mt-0.5 leading-tight">
                            {adminPortal.scope}
                          </p>
                        </div>
                        <div className="shrink-0 flex items-center gap-1">
                          {isSelected ? (
                            <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100 px-2 py-1 rounded-md flex items-center gap-1">
                              <CheckCircle2 className="w-3.5 h-3.5" />
                              <span>Selected</span>
                            </span>
                          ) : (
                            <span className="text-[10px] font-bold text-slate-500 hover:text-emerald-700 bg-slate-100 px-2 py-1 rounded-md">
                              Select Portal
                            </span>
                          )}
                        </div>
                      </button>
                    )
                  })()}

                  {/* 2. Sub-Portals Grid: Parent, Student, Teacher, Accountant */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {SCHOOL_PORTALS.slice(1).map((p) => {
                      const isSelected = selectedPortal === p.role
                      return (
                        <button
                          key={p.role}
                          type="button"
                          onClick={() => handleSelectPortal(p)}
                          className={`p-2.5 rounded-xl text-left transition-all cursor-pointer shadow-2xs border flex flex-col justify-between ${
                            isSelected 
                              ? 'border-emerald-500 bg-emerald-50/90 ring-2 ring-emerald-500/30' 
                              : 'border-slate-200 hover:border-emerald-300 bg-white hover:bg-emerald-50/40'
                          }`}
                        >
                          <div>
                            <div className="flex items-center justify-between mb-1">
                              <span className="text-xs font-bold text-slate-900 flex items-center gap-1">
                                <span>{p.iconEmoji}</span>
                                <span>{p.name}</span>
                              </span>
                              {isSelected && (
                                <span className="text-[9px] font-extrabold text-emerald-800 bg-emerald-200/80 px-1.5 py-0.5 rounded flex items-center gap-0.5">
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
                            <span className={`font-bold ${isSelected ? 'text-emerald-700' : 'text-slate-500'}`}>
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
                className="w-full py-2.5 rounded-xl border border-emerald-200 bg-emerald-50/60 hover:bg-emerald-100 text-emerald-800 text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer shadow-2xs group"
              >
                <School className="w-4 h-4 group-hover:scale-110 transition-transform" />
                <span>Register School / Start Free Trial</span>
                <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
              </button>
            </div>
          </div>

        </div>

      </div>
    </div>
  )
}

export default SchoolLoginPage