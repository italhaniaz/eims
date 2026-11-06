import React, { useState, useRef } from 'react'
import { 
  GraduationCap, 
  Building2, 
  School, 
  Lock, 
  Mail, 
  Eye, 
  EyeOff, 
  ArrowRight, 
  ArrowLeft, 
  AlertCircle, 
  Sparkles, 
  BookOpen, 
  Award, 
  Scroll, 
  Briefcase,
  Layers,
  CheckCircle2
} from 'lucide-react'
import { useAuth } from '../../context/AuthContext'

export const UniversityLoginPage = ({ onBackToLanding, onOpenTrial, onSwitchTier }) => {
  const { login } = useAuth()
  const formRef = useRef(null)

  // Dedicated University Portals registry (Pick 3 - 100% Isolated Scope)
  const UNIVERSITY_PORTALS = [
    {
      role: 'university_admin',
      name: 'University Admin (Dean / Rector)',
      badge: '22 Operational Modules',
      scope: 'Executive Dashboard, Programs, Transcripts, HEC/QEC Compliance & Security',
      email: 'dean.uni@ias.edu.pk',
      iconEmoji: '🎓',
      type: 'admin'
    },
    {
      role: 'uni_student',
      name: 'Student Portal',
      badge: 'Pick 3',
      scope: 'Course registration, timetable, attendance, results, transcript, fee challan, notices, LMS',
      email: 'student.uni@ias.edu.pk',
      iconEmoji: '👨‍🎓',
      type: 'subportal'
    },
    {
      role: 'uni_faculty',
      name: 'Faculty Coordinator (Enrollment ON)',
      badge: 'Enrollment ON',
      scope: 'Dr. Shahzad Rafiq: BSCS Coordinator with batch enrollment permissions',
      email: 'faculty.uni@ias.edu.pk',
      iconEmoji: '👨‍🏫',
      type: 'subportal'
    },
    {
      role: 'uni_lecturer',
      name: 'Lab Instructor (Standard - No Enrollment)',
      badge: 'Enrollment OFF',
      scope: 'Engr. Usman Ali: Lab Instructor with standard view (enrollment hidden)',
      email: 'lecturer.uni@ias.edu.pk',
      iconEmoji: '👨‍💻',
      type: 'subportal'
    },
    {
      role: 'uni_dean',
      name: 'HOD / Dean Portal',
      badge: 'Pick 3',
      scope: 'Department performance, faculty workload, approvals, results',
      email: 'dean.uni@ias.edu.pk',
      iconEmoji: '🏛️',
      type: 'subportal'
    },
    {
      role: 'uni_registrar',
      name: 'Registrar Portal',
      badge: 'Pick 3',
      scope: 'Admissions, records, certificates, approvals',
      email: 'registrar.uni@ias.edu.pk',
      iconEmoji: '📜',
      type: 'subportal'
    },
    {
      role: 'uni_controller',
      name: 'Controller Portal',
      badge: 'Pick 3',
      scope: 'Exams, results, transcripts, degrees',
      email: 'controller.uni@ias.edu.pk',
      iconEmoji: '🎯',
      type: 'subportal'
    },
    {
      role: 'uni_finance',
      name: 'Finance Portal',
      badge: 'Pick 3',
      scope: 'Fees, budget, payroll, accounts',
      email: 'finance.uni@ias.edu.pk',
      iconEmoji: '💰',
      type: 'subportal'
    },
    {
      role: 'uni_parent',
      name: 'Parent Portal',
      badge: 'Pick 3',
      scope: 'Attendance, results, fee (optional)',
      email: 'parent.uni@ias.edu.pk',
      iconEmoji: '👨‍👩‍👦',
      type: 'subportal'
    },
    {
      role: 'uni_applicant',
      name: 'Applicant Portal',
      badge: 'Pick 3',
      scope: 'Admission form, merit status, challan',
      email: 'applicant.uni@ias.edu.pk',
      iconEmoji: '📝',
      type: 'subportal'
    },
    {
      role: 'uni_alumni',
      name: 'Alumni Portal',
      badge: 'Pick 3',
      scope: 'Profile, events, transcript request, donations',
      email: 'alumni.uni@ias.edu.pk',
      iconEmoji: '🌐',
      type: 'subportal'
    }
  ]

  const [selectedPortal, setSelectedPortal] = useState('university_admin')
  const [identifier, setIdentifier] = useState('dean.uni@ias.edu.pk')
  const [password, setPassword] = useState('password123')
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [rememberMe, setRememberMe] = useState(true)
  const [authError, setAuthError] = useState('')

  const activePortalMeta = UNIVERSITY_PORTALS.find(p => p.role === selectedPortal) || UNIVERSITY_PORTALS[0]

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
      setAuthError('Please enter both your university email/username and password.')
      return
    }

    setIsLoading(true)
    setTimeout(() => {
      let targetRole = selectedPortal
      if (id.includes('student')) targetRole = 'uni_student'
      else if (id.includes('faculty') || id.includes('prof')) targetRole = 'uni_faculty'
      else if (id.includes('dean') || id.includes('hod')) targetRole = 'uni_dean'
      else if (id.includes('registrar')) targetRole = 'uni_registrar'
      else if (id.includes('controller') || id.includes('exam')) targetRole = 'uni_controller'
      else if (id.includes('finance') || id.includes('account') || id.includes('bursar') || id.includes('treasurer')) targetRole = 'uni_finance'
      else if (id.includes('parent')) targetRole = 'uni_parent'
      else if (id.includes('applicant') || id.includes('candidate')) targetRole = 'uni_applicant'
      else if (id.includes('alumni') || id.includes('grad')) targetRole = 'uni_alumni'
      else if (id.includes('admin') || id.includes('rector') || id.includes('chancellor')) targetRole = 'university_admin'

      login(targetRole, id, rememberMe)
      setIsLoading(false)
    }, 350)
  }

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-gradient-to-b from-[#fbf8ff] via-[#f5edff] to-white relative overflow-hidden px-4 py-8 sm:py-12 selection:bg-emerald-600 selection:text-white font-sans">
      {/* Ambient Radial Background Accents */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-0 -left-20 w-[500px] h-[500px] bg-purple-200/40 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 -right-20 w-[500px] h-[500px] bg-fuchsia-200/35 rounded-full blur-3xl"></div>
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
      <div className="w-full max-w-[960px] z-10 flex flex-col items-center mt-14 sm:mt-0">
        
        {/* Dual-Pane Card */}
        <div className="w-full rounded-3xl bg-white border border-slate-200/90 shadow-[0_15px_45px_-5px_rgba(0,0,0,0.06),0_1px_3px_rgba(0,0,0,0.02)] overflow-hidden grid grid-cols-1 md:grid-cols-12 relative">
          
          {/* LEFT PANE: Dedicated University Branding */}
          <div className="md:col-span-5 p-5 sm:p-6 md:p-7 flex flex-col justify-between border-b md:border-b-0 md:border-r border-slate-100 bg-gradient-to-b from-[#fbf8ff] via-[#f4edff] to-[#ebe0fc] relative">
            <div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold border shadow-2xs mb-5 self-start bg-emerald-50 text-emerald-950 border-emerald-200">
                <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
                <span>University Portal Access (BS, MS & PhD)</span>
              </div>

              <div className="flex items-center gap-2.5 mb-4">
                <div className="w-13 h-13 rounded-2xl flex items-center justify-center p-2.5 shadow-md bg-gradient-to-tr from-purple-800 via-purple-700 to-indigo-600 text-white shadow-emerald-600/25">
                  <GraduationCap className="w-8 h-8 stroke-[2.2]" />
                </div>
                <div className="w-4 h-4 rounded-full border-2 border-slate-300 bg-white flex items-center justify-center shadow-xs">
                  <div className="w-1.5 h-1.5 rounded-full animate-ping bg-emerald-600"></div>
                </div>
              </div>

              <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight font-heading">
                University Academic Portal
              </h1>
              <div className="mt-1 flex items-center gap-2">
                <span className="text-xs font-bold text-slate-800">Institute of Applied Sciences & Undergraduates</span>
              </div>
              <p className="text-xs sm:text-sm text-slate-500 leading-relaxed mt-2 mb-4 md:mb-5">
                HEC-Compliant Enterprise Campus Management System with Semester Credit-Hour Registrations, CGPA Engine & Research Governance.
              </p>

              {/* Feature Highlights (Visible on Desktop / Tablets, Hidden on compact mobile to bring login form up) */}
              <div className="hidden md:block space-y-2">
                <div className="flex items-center gap-3 p-2.5 rounded-2xl bg-white/90 border border-slate-100 shadow-2xs">
                  <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0 bg-emerald-50 text-emerald-800">
                    <BookOpen className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-800">Credit Hour Course Registration</h4>
                    <p className="text-[11px] text-slate-500 leading-tight">Add/drop, prerequisites check, elective cohort assignment & LMS.</p>
                  </div>
                </div>

                <div className="flex items-center gap-3 p-2.5 rounded-2xl bg-white/90 border border-slate-100 shadow-2xs">
                  <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0 bg-emerald-50 text-emerald-800">
                    <Award className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-800">Controller 4.00 CGPA & Transcripts</h4>
                    <p className="text-[11px] text-slate-500 leading-tight">Official HEC semester GPA grading curves, official transcripts & degree.</p>
                  </div>
                </div>

                <div className="flex items-center gap-3 p-2.5 rounded-2xl bg-white/90 border border-slate-100 shadow-2xs">
                  <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0 bg-emerald-50 text-emerald-800">
                    <Scroll className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-800">FYP & Research Thesis Governance</h4>
                    <p className="text-[11px] text-slate-500 leading-tight">Supervisor allocations, proposal approvals, defense grading & Turnitin.</p>
                  </div>
                </div>

                <div className="flex items-center gap-3 p-2.5 rounded-2xl bg-white/90 border border-slate-100 shadow-2xs">
                  <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0 bg-emerald-50 text-emerald-800">
                    <Briefcase className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-800">Career Placement & Alumni Network</h4>
                    <p className="text-[11px] text-slate-500 leading-tight">Corporate internships, job board, degree verification & convocation.</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="hidden md:flex pt-4 mt-4 border-t border-slate-200/80 items-center justify-between text-[11px] text-slate-500">
              <span className="flex items-center gap-1.5 font-medium">
                <span className="w-2 h-2 rounded-full animate-pulse bg-emerald-600"></span>
                <span className="font-semibold text-slate-700">University Portal (HEC Scope)</span>
              </span>
              <span className="font-mono text-slate-400">v2.5 Production</span>
            </div>
          </div>

          {/* RIGHT PANE: University Sign In Form + Scoped University Portals Selection */}
          <div className="md:col-span-7 p-5 sm:p-8 flex flex-col justify-between bg-white" ref={formRef}>
            <div>
              {/* Form Title & Active Selected Portal Badge */}
              <div className="mb-4">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
                    University Sign In
                  </h2>
                  <span className="text-[10px] font-extrabold uppercase px-2.5 py-0.5 rounded-full border bg-emerald-50 text-emerald-950 border-emerald-200">
                    University Login Portals
                  </span>
                </div>

                {/* Selected Portal Indicator Banner */}
                <div className="mt-2.5 p-2 sm:p-2.5 rounded-xl bg-emerald-50/80 border border-emerald-200 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-base sm:text-lg">{activePortalMeta.iconEmoji}</span>
                    <div>
                      <div className="text-xs font-bold text-purple-950 flex items-center gap-1.5">
                        <span>Target Portal:</span>
                        <span className="underline decoration-purple-400">{activePortalMeta.name}</span>
                      </div>
                      <p className="text-[10px] text-emerald-800 line-clamp-1">{activePortalMeta.scope || activePortalMeta.description}</p>
                    </div>
                  </div>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-emerald-700 text-white shrink-0 ml-2">
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
                    University Email or CMS ID
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                      type="text"
                      value={identifier}
                      onChange={(e) => setIdentifier(e.target.value)}
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-50/70 hover:bg-slate-50 border border-slate-200 text-slate-800 placeholder-slate-400 text-xs sm:text-sm focus:bg-white focus:outline-none focus:ring-4 focus:ring-emerald-500/10 focus:border-purple-600 transition-all font-medium"
                      placeholder="e.g. dean.uni@ias.edu.pk or student.uni"
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
                      className="text-xs font-bold text-emerald-800 hover:text-emerald-900 transition-colors cursor-pointer"
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
                      className="w-full pl-10 pr-10 py-2.5 rounded-xl bg-slate-50/70 hover:bg-slate-50 border border-slate-200 text-slate-800 placeholder-slate-400 text-xs sm:text-sm focus:bg-white focus:outline-none focus:ring-4 focus:ring-emerald-500/10 focus:border-purple-600 transition-all"
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
                      className="w-4 h-4 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500 accent-purple-600 cursor-pointer"
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

              {/* DEDICATED UNIVERSITY LOGIN PORTALS LIST (Pick 3) */}
              <div className="pt-4 mt-4 border-t border-slate-100">
                <div className="flex items-center justify-between mb-2.5 px-0.5">
                  <span className="text-[11px] font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                    <Layers className="w-3.5 h-3.5 text-emerald-600" />
                    <span>University Dedicated Portals (Pick 3)</span>
                  </span>
                  <span className="text-[10px] text-emerald-900 font-semibold bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full">
                    Select Below → Sign In Above
                  </span>
                </div>

                <div className="space-y-2">
                  {/* 1. University Admin (Dean / Rector) Card */}
                  {(() => {
                    const adminPortal = UNIVERSITY_PORTALS[0]
                    const isSelected = selectedPortal === adminPortal.role
                    return (
                      <button
                        key={adminPortal.role}
                        type="button"
                        onClick={() => handleSelectPortal(adminPortal)}
                        className={`w-full p-2.5 rounded-xl text-left transition-all cursor-pointer shadow-2xs flex items-center justify-between border ${
                          isSelected 
                            ? 'border-purple-600 bg-emerald-50/90 ring-2 ring-purple-600/30' 
                            : 'border-slate-200 hover:border-emerald-300 bg-white hover:bg-emerald-50/40'
                        }`}
                      >
                        <div className="pr-2">
                          <div className="text-xs font-bold text-purple-950 flex items-center gap-1.5">
                            <span>{adminPortal.iconEmoji} {adminPortal.name}</span>
                            <span className="text-[9px] font-extrabold uppercase bg-purple-200/80 text-purple-950 px-1.5 py-0.2 rounded">
                              {adminPortal.badge}
                            </span>
                          </div>
                          <p className="text-[10px] text-slate-500 mt-0.5 leading-tight">
                            {adminPortal.scope}
                          </p>
                        </div>
                        <div className="shrink-0 flex items-center gap-1">
                          {isSelected ? (
                            <span className="text-[10px] font-bold text-emerald-800 bg-emerald-100 px-2 py-1 rounded-md flex items-center gap-1">
                              <CheckCircle2 className="w-3.5 h-3.5" />
                              <span>Selected</span>
                            </span>
                          ) : (
                            <span className="text-[10px] font-bold text-slate-500 hover:text-emerald-800 bg-slate-100 px-2 py-1 rounded-md">
                              Select Portal
                            </span>
                          )}
                        </div>
                      </button>
                    )
                  })()}

                  {/* 2. Sub-Portals Grid: Student, Faculty, Dean, Registrar, Controller, Finance, Parent, Applicant, Alumni */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-[290px] overflow-y-auto pr-0.5">
                    {UNIVERSITY_PORTALS.slice(1).map((p) => {
                      const isSelected = selectedPortal === p.role
                      return (
                        <button
                          key={p.role}
                          type="button"
                          onClick={() => handleSelectPortal(p)}
                          className={`p-2.5 rounded-xl text-left transition-all cursor-pointer shadow-2xs border flex flex-col justify-between ${
                            isSelected 
                              ? 'border-purple-600 bg-emerald-50/90 ring-2 ring-purple-600/30' 
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
                                <span className="text-[9px] font-extrabold text-emerald-900 bg-purple-200/80 px-1.5 py-0.5 rounded flex items-center gap-0.5">
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
                            <span className={`font-bold ${isSelected ? 'text-emerald-800' : 'text-slate-500'}`}>
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
                className="w-full py-2.5 rounded-xl border border-emerald-200 bg-emerald-50/60 hover:bg-emerald-100 text-emerald-900 text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer shadow-2xs group"
              >
                <GraduationCap className="w-4 h-4 group-hover:scale-110 transition-transform" />
                <span>Register University / Start Free Trial</span>
                <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
              </button>
            </div>
          </div>

        </div>

      </div>
    </div>
  )
}

export default UniversityLoginPage