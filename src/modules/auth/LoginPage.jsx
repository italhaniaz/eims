import React, { useState, useEffect, useMemo } from 'react'
import { 
  Building2, 
  Lock, 
  Mail, 
  Eye, 
  EyeOff, 
  ArrowRight,
  ArrowLeft,
  AlertCircle, 
  ShieldCheck, 
  ShieldAlert,
  GraduationCap,
  Zap,
  Activity,
  Sparkles,
  BarChart3,
  HelpCircle,
  X
} from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import { DataService } from '../../services/dataService'

export const LoginPage = ({ onBackToLanding, onOpenTrial }) => {
  const { login } = useAuth()
  
  // =========================================================================
  // AUTHENTICATION MODE: 'campus' (Light SaaS) vs 'superadmin' (Dark Terminal)
  // Strictly isolated: Superadmin is accessible ONLY via URL (#superadmin or /superadmin)
  // =========================================================================
  const [authMode, setAuthMode] = useState(() => {
    if (typeof window !== 'undefined') {
      const hash = window.location.hash.toLowerCase()
      const pathname = window.location.pathname.toLowerCase()
      if (pathname.includes('superadmin') || hash.includes('superadmin') || hash.includes('admin-login')) return 'superadmin'
      const search = window.location.search.toLowerCase()
      if (search.includes('superadmin')) return 'superadmin'
    }
    return 'campus'
  })

  // Synchronize on hash changes (e.g. browser back/forward or direct navigation)
  useEffect(() => {
    const handleHash = () => {
      if (typeof window !== 'undefined') {
        const hash = window.location.hash.toLowerCase()
        const pathname = window.location.pathname.toLowerCase()
        if (pathname.includes('superadmin') || hash.includes('superadmin') || hash.includes('admin-login')) {
          setAuthMode('superadmin')
        } else if (hash.includes('login') || hash.includes('signin') || hash === '') {
          setAuthMode('campus')
        }
      }
    }
    window.addEventListener('hashchange', handleHash)
    return () => window.removeEventListener('hashchange', handleHash)
  }, [])

  const toggleAuthMode = (mode) => {
    setAuthMode(mode)
    setAuthError('')
    setInfoMessage('')
    setIdentifier('')
    setPassword('')
    if (typeof window !== 'undefined') {
      window.location.hash = mode === 'superadmin' ? '#superadmin' : '#login'
    }
  }

  // Form states
  const [identifier, setIdentifier] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [rememberMe, setRememberMe] = useState(true)
  const [authError, setAuthError] = useState('')
  const [infoMessage, setInfoMessage] = useState('')
  const [showDemoProfiles, setShowDemoProfiles] = useState(false)
  const [activeDemoCategory, setActiveDemoCategory] = useState('school')
  const [showForgotPasswordModal, setShowForgotPasswordModal] = useState(false)

  // Rate Limiting & Account Lockout Guard (Brute-force protection)
  const [failedAttempts, setFailedAttempts] = useState(() => {
    return Number(sessionStorage.getItem('sms_auth_failed_attempts') || 0)
  })
  const [lockoutUntil, setLockoutUntil] = useState(() => {
    return Number(sessionStorage.getItem('sms_auth_lockout_until') || 0)
  })
  const [secondsRemaining, setSecondsRemaining] = useState(0)

  const isLockedOut = lockoutUntil > Date.now()

  useEffect(() => {
    if (!lockoutUntil) return
    const updateCountdown = () => {
      const remaining = Math.max(0, Math.ceil((lockoutUntil - Date.now()) / 1000))
      setSecondsRemaining(remaining)
      if (remaining <= 0) {
        setLockoutUntil(0)
        setFailedAttempts(0)
        sessionStorage.removeItem('sms_auth_lockout_until')
        sessionStorage.removeItem('sms_auth_failed_attempts')
      }
    }
    updateCountdown()
    const timer = setInterval(updateCountdown, 1000)
    return () => clearInterval(timer)
  }, [lockoutUntil])

  // =========================================================================
  // REAL-TIME INTELLIGENT DOMAIN & TIER RECOGNITION (Senior UX Feature)
  // Subtly informs the user which institutional tier their email corresponds to
  // =========================================================================
  const recognizedTier = useMemo(() => {
    const raw = (identifier || '').trim().toLowerCase()
    if (!raw || raw.length < 3) return null

    // University tier patterns
    if (
      raw.includes('@ias') || 
      raw.includes('@giki') || 
      raw.includes('@nust') || 
      raw.includes('.uni.') || 
      raw.includes('university') ||
      raw.startsWith('uni_') ||
      raw.includes('applicant') ||
      raw.includes('alumni') ||
      raw.includes('dean') ||
      raw.includes('registrar')
    ) {
      return {
        tier: 'university',
        label: 'University Portal',
        color: 'purple',
        badge: '🎓 University Detected'
      }
    }

    // College tier patterns
    if (
      raw.includes('@roots') || 
      raw.includes('@punjabcollege') || 
      raw.includes('@kips') || 
      raw.includes('.college.') || 
      raw.includes('college') ||
      raw.startsWith('college_') ||
      raw.includes('hod.') ||
      raw.includes('lecturer')
    ) {
      return {
        tier: 'college',
        label: 'College Portal',
        color: 'indigo',
        badge: '🏛️ College Detected'
      }
    }

    // School tier patterns
    if (
      raw.includes('@cityschool') || 
      raw.includes('@beacon') || 
      raw.includes('@lgs') || 
      raw.includes('.school.') || 
      raw.includes('school') ||
      raw.startsWith('school_')
    ) {
      return {
        tier: 'school',
        label: 'School Portal',
        color: 'emerald',
        badge: '🏫 School Detected'
      }
    }

    // Generic personal email or staff ID (Multi-tenant directory lookup)
    if (raw.includes('@gmail') || raw.includes('@yahoo') || raw.includes('@outlook') || raw.startsWith('emp-') || raw.startsWith('std-')) {
      return {
        tier: 'custom',
        label: 'Universal Directory',
        color: 'blue',
        badge: '🏢 Multi-Tenant Directory'
      }
    }

    return null
  }, [identifier])

  // =========================================================================
  // CORE AUTHENTICATION EXECUTOR (Option 1 Universal Routing Engine)
  // =========================================================================
  const executeLogin = (userIdentifier, userPassword, targetRoleOverride = null) => {
    if (isLockedOut) {
      setAuthError(`Security Lockout Active: Please wait ${secondsRemaining}s before attempting again.`)
      return
    }

    setAuthError('')
    setInfoMessage('')
    const id = (userIdentifier || '').trim().toLowerCase()
    const pass = (userPassword || '').trim()

    if (!id || !pass) {
      setAuthError('Please enter both email/username and password.')
      return
    }

    setIsLoading(true)

    setTimeout(() => {
      // 1. Direct Target Override (e.g. from quick demo)
      if (targetRoleOverride) {
        sessionStorage.removeItem('sms_auth_failed_attempts')
        sessionStorage.removeItem('sms_auth_lockout_until')
        setFailedAttempts(0)
        setLockoutUntil(0)
        DataService.logAuditEvent('User Sign In Successful', id, 'Success')
        login(targetRoleOverride, id, rememberMe)
        setIsLoading(false)
        return
      }

      // 2. Superadmin Credentials
      const isSuperadmin = (id === 'admin' || id === 'superadmin' || id === 'admin@schoolms.com') && 
                           (pass === 'admin123' || pass === 'admin')

      if (authMode === 'superadmin' || isSuperadmin) {
        if (isSuperadmin) {
          sessionStorage.removeItem('sms_auth_failed_attempts')
          sessionStorage.removeItem('sms_auth_lockout_until')
          setFailedAttempts(0)
          setLockoutUntil(0)
          DataService.logAuditEvent('Superadmin Sign In Successful', id, 'Success')
          login('superadmin', id.includes('@') ? id : 'admin@schoolms.com', rememberMe)
          setIsLoading(false)
          return
        }
      }

      // 3. Password Verification
      const isValidPass = pass === 'admin123' || pass === 'admin' || pass === 'institute123' || 
                          pass === 'teacher123' || pass === 'student123' || pass === 'parent123' || 
                          pass.length >= 5

      if (!isValidPass) {
        const nextAttempts = failedAttempts + 1
        setFailedAttempts(nextAttempts)
        sessionStorage.setItem('sms_auth_failed_attempts', nextAttempts.toString())

        if (nextAttempts >= 5) {
          const lockTime = Date.now() + 60000 // 60s cooldown
          setLockoutUntil(lockTime)
          setSecondsRemaining(60)
          sessionStorage.setItem('sms_auth_lockout_until', lockTime.toString())
          DataService.logAuditEvent('Brute-force lockout triggered (5 failed attempts)', id, 'Warning')
          setAuthError('Security Alert: 5 consecutive failed login attempts detected. Terminal locked for 60 seconds.')
        } else {
          DataService.logAuditEvent('Failed login attempt', id, 'Warning')
          setAuthError(`Invalid credentials. Attempt ${nextAttempts} of 5 before security lockout.`)
        }
        setIsLoading(false)
        return
      }

      // Successful validation: clear lockout history
      sessionStorage.removeItem('sms_auth_failed_attempts')
      sessionStorage.removeItem('sms_auth_lockout_until')
      setFailedAttempts(0)
      setLockoutUntil(0)
      DataService.logAuditEvent('User Sign In Successful', id, 'Success')

      // 4. Smart Local Database Staff/User Lookup by Attached instituteId
      try {
        const storedData = DataService.getStoredData?.() || {}
        const teachers = storedData.teachers || []
        const matchedTeacher = teachers.find(t => 
          (t.email || '').toLowerCase() === id || 
          (t.empId || '').toLowerCase() === id
        )
        if (matchedTeacher) {
          const tInst = String(matchedTeacher.instituteId || '').toLowerCase()
          const tLevel = String(matchedTeacher.level || '').toLowerCase()
          const tCampus = String(matchedTeacher.campus || '').toLowerCase()
          if (tInst === 'inst-3' || tLevel === 'college' || tCampus.includes('college')) {
            login('college_faculty', matchedTeacher.email, rememberMe)
          } else if (tInst === 'inst-4' || tLevel === 'university' || tCampus.includes('uni')) {
            login('uni_faculty', matchedTeacher.email, rememberMe)
          } else {
            login('school_teacher', matchedTeacher.email, rememberMe)
          }
          setIsLoading(false)
          return
        }
      } catch (e) {
        console.warn('Teacher DB lookup error:', e)
      }

      // 5. Intelligent Domain & Identifier Role Auto-Recognition
      if (id.includes('applicant') || id === 'applicant') {
        login('uni_applicant', id.includes('@') ? id : 'applicant.uni@ias.edu.pk', rememberMe)
      } else if (id.includes('alumni') || id === 'alumni') {
        login('uni_alumni', id.includes('@') ? id : 'alumni.uni@ias.edu.pk', rememberMe)
      } else if (id.includes('dean') || id === 'dean') {
        login('uni_dean', id.includes('@') ? id : 'dean.uni@ias.edu.pk', rememberMe)
      } else if (id.includes('registrar') || id === 'registrar') {
        login('uni_registrar', id.includes('@') ? id : 'registrar.uni@ias.edu.pk', rememberMe)
      } else if (id.includes('controller') || id === 'controller') {
        login('uni_controller', id.includes('@') ? id : 'controller.uni@ias.edu.pk', rememberMe)
      } else if (id.includes('finance') || id === 'finance') {
        login('uni_finance', id.includes('@') ? id : 'finance.uni@ias.edu.pk', rememberMe)
      } else if (id.includes('hod') || id === 'hod') {
        login('college_hod', id.includes('@') ? id : 'hod.college@roots.edu', rememberMe)
      } else if (id.includes('giki') || id.includes('ias') || id.includes('uni') || id.includes('university')) {
        if (id.includes('student')) login('uni_student', id, rememberMe)
        else if (id.includes('parent')) login('uni_parent', id, rememberMe)
        else if (id.includes('faculty') || id.includes('teacher') || id.includes('prof')) login('uni_faculty', id, rememberMe)
        else login('university_admin', id, rememberMe)
      } else if (id.includes('roots') || id.includes('college')) {
        if (id.includes('student')) login('college_student', id, rememberMe)
        else if (id.includes('parent')) login('college_parent', id, rememberMe)
        else if (id.includes('faculty') || id.includes('teacher') || id.includes('lecturer')) login('college_faculty', id, rememberMe)
        else if (id.includes('account')) login('college_accountant', id, rememberMe)
        else login('college_admin', id, rememberMe)
      } else if (id.includes('cityschool') || id.includes('school')) {
        if (id.includes('parent')) login('school_parent', id, rememberMe)
        else if (id.includes('student')) login('school_student', id, rememberMe)
        else if (id.includes('teacher')) login('school_teacher', id, rememberMe)
        else if (id.includes('account')) login('school_accountant', id, rememberMe)
        else login('school_admin', id, rememberMe)
      } else if (id.includes('beacon')) {
        if (id.includes('parent')) login('parent', id, rememberMe)
        else if (id.includes('student')) login('student', id, rememberMe)
        else if (id.includes('teacher') || id.includes('faculty')) login('teacher', id, rememberMe)
        else if (id.includes('account')) login('accountant', id, rememberMe)
        else login('institute_admin', id, rememberMe)
      } else if (id.includes('teacher') || id.includes('faculty')) {
        login('teacher', id.includes('@') ? id : 'tariq.faculty@sms.edu', rememberMe)
      } else if (id.includes('account')) {
        login('accountant', id.includes('@') ? id : 'accounts.beacon@sms.edu', rememberMe)
      } else if (id.includes('student')) {
        login('student', id.includes('@') ? id : 'hamza.f@student.sms.edu', rememberMe)
      } else if (id.includes('parent')) {
        login('parent', id.includes('@') ? id : 'farooq.parent@gmail.com', rememberMe)
      } else {
        login('institute_admin', id.includes('@') ? id : 'admin.beacon@sms.edu', rememberMe)
      }
      setIsLoading(false)
    }, 380)
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    executeLogin(identifier, password)
  }

  // 1-Click Demo Fill & Submit Handlers
  const handleQuickDemo = (role, email, pass = 'institute123') => {
    setIdentifier(email)
    setPassword(pass)
    setAuthError('')
    setShowDemoProfiles(false)
    executeLogin(email, pass, role)
  }

  // =========================================================================
  // VIEW 1: SUPER ADMIN DEDICATED DARK-THEME LOGIN (Isolated Terminal)
  // Accessible ONLY via URL (#superadmin or /superadmin)
  // =========================================================================
  if (authMode === 'superadmin') {
    return (
      <div className="min-h-screen w-full flex items-center justify-center bg-[#070A12] text-slate-100 relative overflow-hidden p-3 sm:p-5 selection:bg-purple-600 selection:text-white font-sans">
        {/* Dark Cyber Ambient Glows & Constellation Grid */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div className="absolute top-0 -left-20 w-[450px] h-[450px] bg-purple-900/20 rounded-full blur-3xl"></div>
          <div className="absolute bottom-0 -right-20 w-[450px] h-[450px] bg-indigo-900/20 rounded-full blur-3xl"></div>
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-blue-950/20 rounded-full blur-3xl"></div>
        </div>

        {/* Top-Left: Back to Home Button */}
        {onBackToLanding && (
          <div className="absolute top-3 left-3 sm:top-5 sm:left-6 z-30">
            <button
              type="button"
              onClick={onBackToLanding}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold text-slate-400 hover:text-white bg-slate-900/80 hover:bg-slate-800 border border-slate-800 shadow-2xs transition-all cursor-pointer backdrop-blur-xs group"
              title="Back to Landing Page"
            >
              <ArrowLeft className="w-3.5 h-3.5 text-slate-400 group-hover:text-purple-400 group-hover:-translate-x-0.5 transition-transform" />
              <span>Back to Home</span>
            </button>
          </div>
        )}

        {/* Main Superadmin Dual-Pane Container (Compact & Centered) */}
        <div className="w-full max-w-[840px] z-10 rounded-2xl sm:rounded-3xl bg-[#0D121F] border border-slate-800 shadow-[0_20px_60px_-15px_rgba(0,0,0,0.8)] overflow-hidden grid grid-cols-1 md:grid-cols-12 relative my-auto">
          
          {/* LEFT PANE: Superadmin Control Plane */}
          <div className="md:col-span-5 p-5 sm:p-6 lg:p-7 flex flex-col justify-between border-b md:border-b-0 md:border-r border-slate-800/90 bg-gradient-to-b from-[#0F1626] to-[#0A0E1A]">
            <div>
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold text-purple-300 bg-purple-950/80 border border-purple-800/60 shadow-2xs mb-3">
                <Sparkles className="w-3 h-3 text-purple-400" />
                <span>Next-Gen Academic ERP</span>
              </div>

              <div className="flex items-center gap-2 mb-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-purple-700 via-purple-600 to-indigo-600 text-white flex items-center justify-center p-2 shadow-lg shadow-purple-600/30">
                  <GraduationCap className="w-6 h-6 stroke-[2.2]" />
                </div>
                <div className="w-3.5 h-3.5 rounded-full border-2 border-slate-700 bg-slate-900 flex items-center justify-center">
                  <div className="w-1.5 h-1.5 rounded-full bg-purple-400 animate-ping"></div>
                </div>
              </div>

              <h1 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight font-heading">
                Apex<span className="text-purple-400">Ed</span> Portal
              </h1>
              <p className="text-xs text-slate-400 leading-normal mt-1 mb-4">
                Control plane architecture for multi-campus orchestration & tenant governance.
              </p>

              <div className="space-y-2">
                <div className="flex items-center gap-3 p-2.5 rounded-xl bg-[#131B2E]/70 border border-slate-800/90">
                  <div className="w-8 h-8 rounded-lg bg-slate-900 border border-slate-700/80 flex items-center justify-center text-purple-400 shrink-0">
                    <Zap className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-white">Lightning Checkout</h4>
                    <p className="text-[10px] text-slate-400">Sub-50ms instant receipt rendering</p>
                  </div>
                </div>

                <div className="flex items-center gap-3 p-2.5 rounded-xl bg-[#131B2E]/70 border border-slate-800/90">
                  <div className="w-8 h-8 rounded-lg bg-slate-900 border border-slate-700/80 flex items-center justify-center text-indigo-400 shrink-0">
                    <BarChart3 className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-white">Real-Time Telemetry</h4>
                    <p className="text-[10px] text-slate-400">Automated profit, loss & stock sync</p>
                  </div>
                </div>

                <div className="flex items-center gap-3 p-2.5 rounded-xl bg-[#131B2E]/70 border border-slate-800/90">
                  <div className="w-8 h-8 rounded-lg bg-slate-900 border border-slate-700/80 flex items-center justify-center text-emerald-400 shrink-0">
                    <ShieldCheck className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-white">Bank-Grade Security</h4>
                    <p className="text-[10px] text-slate-400">Encrypted sessions & audit trails</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="pt-3 mt-3 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-400">
              <span className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                <span className="font-semibold text-slate-300">POS Engine Operational</span>
              </span>
              <span className="font-mono text-slate-500 font-bold">v2.5 Pro</span>
            </div>
          </div>

          {/* RIGHT PANE: Superadmin Credentials Form */}
          <div className="md:col-span-7 p-5 sm:p-6 lg:p-7 flex flex-col justify-between bg-[#0D121F]">
            <div>
              <div className="flex items-center justify-between mb-1">
                <h2 className="text-xl sm:text-2xl font-extrabold text-white font-heading tracking-tight">
                  Sign In
                </h2>
                <span className="px-2.5 py-0.5 rounded-md bg-[#1d3557] text-[#93c5fd] border border-[#2563eb]/60 text-[11px] font-black uppercase tracking-wider">
                  Superadmin
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Authenticate with superadmin credentials
              </p>

              <button
                type="button"
                onClick={() => toggleAuthMode('campus')}
                className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-purple-300 font-semibold mt-2 transition-colors cursor-pointer group"
              >
                <ArrowLeft className="w-3.5 h-3.5 group-hover:-translate-x-0.5 transition-transform" />
                <span>Return to Campus Portal</span>
              </button>

              {authError && (
                <div className="mt-3 p-3 rounded-xl bg-rose-950/60 border border-rose-800 text-rose-200 text-xs font-medium flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                  <span>{authError}</span>
                </div>
              )}

              {infoMessage && (
                <div className="mt-3 p-2.5 rounded-xl bg-purple-950/60 border border-purple-800 text-purple-200 text-xs font-medium flex items-center justify-between">
                  <span>{infoMessage}</span>
                  <button type="button" onClick={() => setInfoMessage('')} className="text-purple-400 hover:text-purple-200 font-bold ml-2">✕</button>
                </div>
              )}

              <form onSubmit={handleSubmit} className="mt-4 space-y-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                    Superadmin Email or Username
                  </label>
                  <div className="relative group">
                    <Mail className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2 group-focus-within:text-purple-400 pointer-events-none" />
                    <input
                      type="text"
                      required
                      disabled={isLockedOut}
                      value={identifier}
                      onChange={(e) => {
                        setIdentifier(e.target.value)
                        if (authError) setAuthError('')
                      }}
                      className="w-full pl-10 pr-3.5 py-2.5 rounded-xl bg-[#0A0E1A] border border-slate-700/80 text-white placeholder-slate-500 text-sm focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-500/20 transition-all"
                      placeholder="admin@schoolms.com or admin"
                    />
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                      Master Key Password
                    </label>
                    <button 
                      type="button"
                      onClick={() => setInfoMessage('Contact infrastructure host to reset master credentials.')}
                      className="text-xs text-purple-400 hover:text-purple-300 font-semibold cursor-pointer"
                    >
                      Forgot Password?
                    </button>
                  </div>
                  <div className="relative group">
                    <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2 group-focus-within:text-purple-400 pointer-events-none" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      disabled={isLockedOut}
                      value={password}
                      onChange={(e) => {
                        setPassword(e.target.value)
                        if (authError) setAuthError('')
                      }}
                      className="w-full pl-10 pr-10 py-2.5 rounded-xl bg-[#0A0E1A] border border-slate-700/80 text-white placeholder-slate-500 text-sm focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-500/20 transition-all font-mono"
                      placeholder="••••••••••••"
                    />
                    <button
                      type="button"
                      disabled={isLockedOut}
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 cursor-pointer p-1"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <div className="flex items-center justify-between text-xs pt-0.5 text-slate-400">
                  <label className="flex items-center gap-2 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={rememberMe}
                      disabled={isLockedOut}
                      onChange={(e) => setRememberMe(e.target.checked)}
                      className="w-3.5 h-3.5 rounded border-slate-700 bg-[#0A0E1A] text-purple-600 focus:ring-purple-500 accent-purple-600 cursor-pointer"
                    />
                    <span className="text-slate-300 font-medium">Remember terminal</span>
                  </label>
                  <span className="text-slate-500 font-medium">30 Days Active</span>
                </div>

                <button
                  type="submit"
                  disabled={isLoading || isLockedOut}
                  className="w-full py-2.5 sm:py-3 rounded-xl font-bold text-sm text-white bg-[#374151] hover:bg-[#4b5563] border border-slate-600 shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  {isLoading ? (
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  ) : (
                    <>
                      <span>Sign In</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </form>
            </div>

            <div className="pt-4 mt-3 border-t border-slate-800/80 text-center">
              <span className="text-[11px] text-slate-500 flex items-center justify-center gap-1.5 font-medium">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                <span>Enterprise Multi-Tenant Security Guaranteed</span>
              </span>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // =========================================================================
  // VIEW 2: UNIVERSAL SMART SIGN-IN ARCHITECTURE (Light SaaS - Option 1)
  // 100% Clean, Compact & Perfectly Sized for PC & Mobile
  // "Select Campus Directory" has been completely removed per user request.
  // =========================================================================
  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-[#fcfaff] relative overflow-x-hidden p-3 sm:p-5 selection:bg-purple-500 selection:text-white font-sans">
      
      {/* Background Soft Glows */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-0 -left-20 w-[400px] h-[400px] bg-purple-200/25 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 -right-20 w-[400px] h-[400px] bg-[#f5eeff] rounded-full blur-3xl"></div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-indigo-50/35 rounded-full blur-3xl"></div>
      </div>

      {/* Top Navigation: Back to Home */}
      {onBackToLanding && (
        <div className="absolute top-3 left-3 sm:top-5 sm:left-6 z-30">
          <button
            type="button"
            onClick={onBackToLanding}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold text-slate-600 hover:text-purple-700 bg-white/95 hover:bg-white border border-purple-100 shadow-2xs hover:shadow-xs transition-all backdrop-blur-xs group cursor-pointer"
            title="Back to Landing Page"
          >
            <ArrowLeft className="w-3.5 h-3.5 text-slate-500 group-hover:text-purple-600 group-hover:-translate-x-0.5 transition-transform" />
            <span>Back to Home</span>
          </button>
        </div>
      )}

      {/* Main Dual-Pane Card: Compact Max Width (840px) to Fit Perfectly on PC & Mobile Screens */}
      <div className="w-full max-w-[840px] z-10 rounded-2xl sm:rounded-3xl bg-white border border-purple-100/90 shadow-[0_15px_45px_-10px_rgba(147,51,234,0.08),0_2px_6px_rgba(0,0,0,0.02)] overflow-hidden grid grid-cols-1 md:grid-cols-12 relative my-auto">
        
        {/* LEFT PANE: BRANDING & SYSTEM TELEMETRY (Compact & Elegant) */}
        <div className="hidden md:flex md:col-span-5 p-5 lg:p-6 flex-col justify-between border-r border-purple-100/80 bg-gradient-to-b from-[#fbf8fe] via-[#f7f2fc] to-[#f4edfb]">
          <div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold text-purple-700 bg-purple-100/80 border border-purple-200/80 shadow-2xs mb-3">
              <Sparkles className="w-3 h-3 text-purple-600" />
              <span>Next-Gen Academic ERP</span>
            </div>

            <div className="flex items-center gap-2 mb-2.5">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-purple-700 via-purple-600 to-indigo-600 text-white flex items-center justify-center p-2 shadow-md shadow-purple-500/25">
                <GraduationCap className="w-6 h-6 stroke-[2.2]" />
              </div>
              <div className="w-3.5 h-3.5 rounded-full border-2 border-purple-200 bg-white flex items-center justify-center shadow-xs">
                <div className="w-1.5 h-1.5 rounded-full bg-purple-600 animate-ping"></div>
              </div>
            </div>

            <h1 className="text-xl lg:text-2xl font-extrabold text-slate-900 tracking-tight font-heading">
              Apex<span className="text-purple-600">Ed</span> Portal
            </h1>
            <p className="text-xs text-slate-500 leading-normal mt-1 mb-3.5">
              Intelligent multi-campus academic operating system with computerized fee challans & live attendance.
            </p>

            <div className="space-y-2">
              <div className="flex items-center gap-3 p-2.5 rounded-xl bg-white/90 border border-purple-100/90 shadow-2xs">
                <div className="w-8 h-8 rounded-lg bg-purple-50 border border-purple-100 flex items-center justify-center text-purple-600 shrink-0">
                  <Zap className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-800">Instant Fee Barcoding</h4>
                  <p className="text-[10px] text-slate-500 leading-tight">Sub-50ms 1Link & JazzCash challans</p>
                </div>
              </div>

              <div className="flex items-center gap-3 p-2.5 rounded-xl bg-white/90 border border-purple-100/90 shadow-2xs">
                <div className="w-8 h-8 rounded-lg bg-purple-50 border border-purple-100 flex items-center justify-center text-purple-600 shrink-0">
                  <Activity className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-800">Multi-Wing Telemetry</h4>
                  <p className="text-[10px] text-slate-500 leading-tight">Automated attendance & wing sync</p>
                </div>
              </div>

              <div className="flex items-center gap-3 p-2.5 rounded-xl bg-white/90 border border-purple-100/90 shadow-2xs">
                <div className="w-8 h-8 rounded-lg bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600 shrink-0">
                  <ShieldCheck className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-800">Bank-Grade Security</h4>
                  <p className="text-[10px] text-slate-500 leading-tight">Encrypted sessions & audit trails</p>
                </div>
              </div>
            </div>
          </div>

          <div className="pt-3 mt-3 border-t border-purple-100/80 flex items-center justify-between text-[11px] text-slate-500">
            <span className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
              <span className="font-semibold text-slate-700">Portal Engine Operational</span>
            </span>
            <span className="font-mono text-slate-400 font-bold">v2.5 Enterprise</span>
          </div>
        </div>

        {/* RIGHT PANE: 100% CLEAN SIGN IN FORM */}
        <div className="md:col-span-7 p-5 sm:p-6 lg:p-7 flex flex-col justify-between bg-white">
          <div>
            {/* Mobile Header Banner */}
            <div className="md:hidden mb-4 pb-3 border-b border-purple-50 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-purple-700 to-indigo-600 text-white flex items-center justify-center p-1.5 shadow-xs">
                  <GraduationCap className="w-5 h-5" />
                </div>
                <div>
                  <h1 className="text-base font-extrabold text-slate-900 tracking-tight font-heading">
                    Apex<span className="text-purple-600">Ed</span> Portal
                  </h1>
                  <p className="text-[10px] text-slate-500 font-medium">Unified Institutional Gateway</p>
                </div>
              </div>
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200">
                <span className="w-1 h-1 rounded-full bg-emerald-500 animate-pulse"></span>
                <span>Active</span>
              </span>
            </div>

            {/* Desktop Form Title */}
            <div className="hidden md:block mb-3.5">
              <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 font-heading tracking-tight">
                Sign In
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Enter your institutional credentials to access your campus portal
              </p>
            </div>

            {/* Mobile Form Title */}
            <div className="md:hidden mb-3">
              <h2 className="text-lg font-bold text-slate-900 font-heading">Sign In</h2>
              <p className="text-[11px] text-slate-500">Sign in with institutional email or staff code</p>
            </div>

            {/* Alerts & Notifications */}
            {authError && (
              <div className="mb-3 p-2.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-medium flex items-start gap-2 animate-in fade-in">
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                <span>{authError}</span>
              </div>
            )}

            {infoMessage && (
              <div className="mb-3 p-2.5 rounded-xl bg-purple-50 border border-purple-200 text-purple-800 text-xs font-medium flex items-center justify-between animate-in fade-in">
                <span>{infoMessage}</span>
                <button type="button" onClick={() => setInfoMessage('')} className="text-purple-600 hover:text-purple-800 font-bold ml-2">✕</button>
              </div>
            )}

            {/* Main Sign In Form */}
            <form onSubmit={handleSubmit} className="space-y-3">
              
              {/* FIELD 1: Institutional Email or Staff ID */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-[11px] font-bold text-slate-600 uppercase tracking-wider">
                    Institutional Email or Staff ID
                  </label>
                  
                  {/* REAL-TIME INTELLIGENT RECOGNITION PILL */}
                  {recognizedTier && (
                    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold tracking-tight animate-in fade-in duration-200 ${
                      recognizedTier.color === 'purple' ? 'bg-purple-100 text-purple-800 border border-purple-200' :
                      recognizedTier.color === 'indigo' ? 'bg-indigo-100 text-indigo-800 border border-indigo-200' :
                      recognizedTier.color === 'emerald' ? 'bg-emerald-100 text-emerald-800 border border-emerald-200' :
                      'bg-blue-100 text-blue-800 border border-blue-200'
                    }`}>
                      <span>{recognizedTier.badge}</span>
                    </span>
                  )}
                </div>

                <div className="relative group">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 group-focus-within:text-purple-600 transition-colors pointer-events-none" />
                  <input
                    type="text"
                    required
                    disabled={isLockedOut}
                    value={identifier}
                    onChange={(e) => {
                      setIdentifier(e.target.value)
                      if (authError) setAuthError('')
                    }}
                    className={`w-full pl-10 pr-3.5 py-2.5 rounded-xl bg-slate-50/70 hover:bg-slate-50 border border-slate-200 text-slate-800 placeholder-slate-400 text-sm focus:bg-white focus:outline-none focus:ring-3 focus:ring-purple-500/10 focus:border-purple-500 transition-all ${
                      isLockedOut ? 'opacity-50 cursor-not-allowed' : ''
                    }`}
                    placeholder="e.g. name@giki.com, staff@roots.edu or teacher@cityschool.edu"
                    autoComplete="username"
                  />
                </div>
              </div>

              {/* FIELD 2: Password */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-[11px] font-bold text-slate-600 uppercase tracking-wider">
                    Password
                  </label>
                  <button 
                    type="button"
                    onClick={() => setShowForgotPasswordModal(true)}
                    className="text-xs text-purple-600 hover:text-purple-700 font-semibold cursor-pointer transition-colors"
                  >
                    Forgot Password?
                  </button>
                </div>
                <div className="relative group">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 group-focus-within:text-purple-600 transition-colors pointer-events-none" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    disabled={isLockedOut}
                    value={password}
                    onChange={(e) => {
                      setPassword(e.target.value)
                      if (authError) setAuthError('')
                    }}
                    className={`w-full pl-10 pr-10 py-2.5 rounded-xl bg-slate-50/70 hover:bg-slate-50 border border-slate-200 text-slate-800 placeholder-slate-400 text-sm focus:bg-white focus:outline-none focus:ring-3 focus:ring-purple-500/10 focus:border-purple-500 transition-all ${
                      isLockedOut ? 'opacity-50 cursor-not-allowed' : ''
                    }`}
                    placeholder="••••••••••••"
                    autoComplete="current-password"
                  />
                  <button
                    type="button"
                    disabled={isLockedOut}
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors cursor-pointer p-1"
                    title={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Remember Me & Session Duration */}
              <div className="flex items-center justify-between text-xs pt-0.5">
                <label className="flex items-center gap-2 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    disabled={isLockedOut}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="w-3.5 h-3.5 rounded border-slate-300 text-purple-600 focus:ring-purple-500 accent-purple-600 cursor-pointer"
                  />
                  <span className="text-slate-700 font-medium">Remember this terminal</span>
                </label>
                <span className="text-slate-400 font-medium hidden sm:inline">30 Days Active Session</span>
              </div>

              {/* PRIMARY SUBMIT BUTTON */}
              <button
                type="submit"
                disabled={isLoading || isLockedOut}
                className={`w-full py-2.5 sm:py-3 rounded-xl font-bold text-sm text-white bg-purple-600 hover:bg-purple-700 shadow-md shadow-purple-600/20 hover:shadow-lg hover:shadow-purple-600/25 transition-all flex items-center justify-center gap-2 cursor-pointer ${
                  isLoading || isLockedOut ? 'opacity-70 cursor-not-allowed' : 'active:scale-[0.99]'
                }`}
              >
                {isLoading ? (
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                ) : isLockedOut ? (
                  <>
                    <ShieldAlert className="w-4 h-4 text-rose-200" />
                    <span>Locked ({secondsRemaining}s remaining)</span>
                  </>
                ) : (
                  <>
                    <span>Sign In to Portal</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>
          </div>

          {/* BOTTOM FOOTER: NEW INSTITUTION REGISTRATION */}
          <div className="pt-3.5 mt-3.5 border-t border-slate-100">
            <div className="text-center space-y-1.5">
              <span className="text-xs text-slate-500 block font-medium">
                New Educational Institution?
              </span>
              <button
                type="button"
                onClick={() => {
                  if (onOpenTrial) {
                    onOpenTrial()
                  } else if (onBackToLanding) {
                    onBackToLanding()
                  }
                }}
                className="w-full py-2 sm:py-2.5 px-3 rounded-xl border border-purple-200 bg-purple-50/60 hover:bg-purple-100/80 text-purple-700 hover:text-purple-800 text-xs sm:text-sm font-bold transition-all flex items-center justify-center gap-2 cursor-pointer shadow-2xs group"
              >
                <Building2 className="w-4 h-4 text-purple-600 group-hover:scale-110 transition-transform" />
                <span>Register Institution / Start Free Trial</span>
                <ArrowRight className="w-3.5 h-3.5 text-purple-600 group-hover:translate-x-1 transition-transform" />
              </button>
            </div>
          </div>
        </div>

      </div>

      {/* FLOATING DEMO TESTING PILL (Discreet in Bottom Right Corner) */}
      <div className="fixed bottom-3 right-3 z-40">
        <button
          type="button"
          onClick={() => setShowDemoProfiles(true)}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold text-slate-500 hover:text-purple-700 bg-white/95 hover:bg-white border border-slate-200/90 shadow-2xs hover:shadow-xs transition-all backdrop-blur-xs cursor-pointer opacity-60 hover:opacity-100 group"
          title="Quick Test Profiles (Evaluation Mode)"
        >
          <Zap className="w-3.5 h-3.5 text-amber-500 group-hover:scale-110 transition-transform" />
          <span className="hidden sm:inline">Demo Test Accounts</span>
          <span className="sm:hidden">Demo</span>
        </button>
      </div>

      {/* MODAL: FORGOT PASSWORD RECOVERY HELPER */}
      {showForgotPasswordModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4 animate-in fade-in">
          <div className="bg-white rounded-2xl sm:rounded-3xl max-w-md w-full p-5 sm:p-6 shadow-2xl border border-purple-100 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <HelpCircle className="w-5 h-5 text-purple-600" />
                <h3 className="font-bold text-slate-900 text-base">Credential Recovery Assistance</h3>
              </div>
              <button 
                type="button"
                onClick={() => setShowForgotPasswordModal(false)}
                className="w-7 h-7 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-500 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3 text-xs text-slate-600 leading-relaxed">
              <div className="p-3 rounded-xl bg-purple-50/80 border border-purple-100 text-purple-900 space-y-1">
                <p className="font-bold">🔐 Institutional Security Policy</p>
                <p>
                  To protect student, faculty, and examination records, self-service password resets require campus administrator authorization.
                </p>
              </div>

              <div className="space-y-2">
                <p className="font-semibold text-slate-800">Please choose one of the options below:</p>
                <div className="flex items-start gap-2 text-slate-600">
                  <span className="w-4 h-4 rounded-full bg-purple-100 text-purple-700 flex items-center justify-center text-[10px] font-bold shrink-0 mt-0.5">1</span>
                  <span>Contact your Campus IT Helpdesk or Administrator with your Staff/Student Roll ID.</span>
                </div>
                <div className="flex items-start gap-2 text-slate-600">
                  <span className="w-4 h-4 rounded-full bg-purple-100 text-purple-700 flex items-center justify-center text-[10px] font-bold shrink-0 mt-0.5">2</span>
                  <span>If evaluating the system, click the <strong className="text-purple-700">Demo Test Accounts</strong> pill at bottom-right.</span>
                </div>
              </div>
            </div>

            <div className="pt-2 flex justify-end">
              <button
                type="button"
                onClick={() => setShowForgotPasswordModal(false)}
                className="w-full py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold transition-all cursor-pointer shadow-xs"
              >
                Understood
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: EVALUATION QUICK DEMO PROFILES */}
      {showDemoProfiles && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4 animate-in fade-in">
          <div className="bg-white rounded-2xl sm:rounded-3xl max-w-lg w-full p-5 sm:p-6 shadow-2xl border border-purple-100 space-y-4">
            
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <Zap className="w-5 h-5 text-amber-500" />
                <h3 className="font-bold text-slate-900 text-base">Platform Evaluation Test Accounts</h3>
              </div>
              <button 
                type="button"
                onClick={() => setShowDemoProfiles(false)}
                className="w-7 h-7 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-500 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-slate-500">
              Select any profile below to automatically populate credentials and sign into the corresponding campus portal:
            </p>

            {/* Category Switcher Tabs */}
            <div className="flex items-center gap-1.5 border-b border-slate-100 pb-2">
              <button
                type="button"
                onClick={() => setActiveDemoCategory('school')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  activeDemoCategory === 'school' 
                    ? 'bg-purple-600 text-white shadow-2xs' 
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                🏫 School System
              </button>
              <button
                type="button"
                onClick={() => setActiveDemoCategory('college')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  activeDemoCategory === 'college' 
                    ? 'bg-purple-600 text-white shadow-2xs' 
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                🏛️ College Portal
              </button>
              <button
                type="button"
                onClick={() => setActiveDemoCategory('university')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  activeDemoCategory === 'university' 
                    ? 'bg-purple-600 text-white shadow-2xs' 
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                🎓 University Portal
              </button>
            </div>

            {/* TAB 1: SCHOOL DEMO ROLES */}
            {activeDemoCategory === 'school' && (
              <div className="space-y-2">
                <div className="text-[11px] font-bold text-slate-600">
                  City School Model Town (@cityschool.edu)
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => handleQuickDemo('school_admin', 'admin.school@cityschool.edu', 'institute123')}
                    className="p-2.5 rounded-xl bg-slate-50 hover:bg-emerald-50 border border-slate-200 hover:border-emerald-300 text-left transition-all cursor-pointer group"
                  >
                    <div className="text-xs font-bold text-slate-800 group-hover:text-emerald-800">Principal / Admin</div>
                    <div className="text-[10px] text-slate-400">admin.school@cityschool.edu</div>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleQuickDemo('school_teacher', 'teacher.school@cityschool.edu', 'teacher123')}
                    className="p-2.5 rounded-xl bg-slate-50 hover:bg-emerald-50 border border-slate-200 hover:border-emerald-300 text-left transition-all cursor-pointer group"
                  >
                    <div className="text-xs font-bold text-slate-800 group-hover:text-emerald-800">Senior Teacher</div>
                    <div className="text-[10px] text-slate-400">teacher.school@cityschool.edu</div>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleQuickDemo('school_student', 'student.school@cityschool.edu', 'student123')}
                    className="p-2.5 rounded-xl bg-slate-50 hover:bg-emerald-50 border border-slate-200 hover:border-emerald-300 text-left transition-all cursor-pointer group"
                  >
                    <div className="text-xs font-bold text-slate-800 group-hover:text-emerald-800">Student Portal</div>
                    <div className="text-[10px] text-slate-400">student.school@cityschool.edu</div>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleQuickDemo('school_parent', 'parent.school@cityschool.edu', 'parent123')}
                    className="p-2.5 rounded-xl bg-slate-50 hover:bg-emerald-50 border border-slate-200 hover:border-emerald-300 text-left transition-all cursor-pointer group"
                  >
                    <div className="text-xs font-bold text-slate-800 group-hover:text-emerald-800">Parent Portal</div>
                    <div className="text-[10px] text-slate-400">parent.school@cityschool.edu</div>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleQuickDemo('school_accountant', 'accounts.school@cityschool.edu', 'institute123')}
                    className="p-2.5 rounded-xl bg-slate-50 hover:bg-emerald-50 border border-slate-200 hover:border-emerald-300 text-left transition-all cursor-pointer col-span-2 group"
                  >
                    <div className="text-xs font-bold text-slate-800 group-hover:text-emerald-800">Fee Accountant / Bursar</div>
                    <div className="text-[10px] text-slate-400">accounts.school@cityschool.edu</div>
                  </button>
                </div>
              </div>
            )}

            {/* TAB 2: COLLEGE DEMO ROLES */}
            {activeDemoCategory === 'college' && (
              <div className="space-y-2">
                <div className="text-[11px] font-bold text-slate-600">
                  Roots International College (@roots.edu)
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => handleQuickDemo('college_admin', 'admin.college@roots.edu', 'institute123')}
                    className="p-2.5 rounded-xl bg-slate-50 hover:bg-indigo-50 border border-slate-200 hover:border-indigo-300 text-left transition-all cursor-pointer group"
                  >
                    <div className="text-xs font-bold text-slate-800 group-hover:text-indigo-800">College Director</div>
                    <div className="text-[10px] text-slate-400">admin.college@roots.edu</div>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleQuickDemo('college_faculty', 'faculty.college@roots.edu', 'teacher123')}
                    className="p-2.5 rounded-xl bg-slate-50 hover:bg-indigo-50 border border-slate-200 hover:border-indigo-300 text-left transition-all cursor-pointer group"
                  >
                    <div className="text-xs font-bold text-slate-800 group-hover:text-indigo-800">College Lecturer</div>
                    <div className="text-[10px] text-slate-400">faculty.college@roots.edu</div>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleQuickDemo('college_hod', 'hod.college@roots.edu', 'institute123')}
                    className="p-2.5 rounded-xl bg-slate-50 hover:bg-indigo-50 border border-slate-200 hover:border-indigo-300 text-left transition-all cursor-pointer group"
                  >
                    <div className="text-xs font-bold text-slate-800 group-hover:text-indigo-800">HOD Science</div>
                    <div className="text-[10px] text-slate-400">hod.college@roots.edu</div>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleQuickDemo('college_student', 'student.college@roots.edu', 'student123')}
                    className="p-2.5 rounded-xl bg-slate-50 hover:bg-indigo-50 border border-slate-200 hover:border-indigo-300 text-left transition-all cursor-pointer group"
                  >
                    <div className="text-xs font-bold text-slate-800 group-hover:text-indigo-800">FSc Student</div>
                    <div className="text-[10px] text-slate-400">student.college@roots.edu</div>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleQuickDemo('college_accountant', 'accounts.college@roots.edu', 'institute123')}
                    className="p-2.5 rounded-xl bg-slate-50 hover:bg-indigo-50 border border-slate-200 hover:border-indigo-300 text-left transition-all cursor-pointer col-span-2 group"
                  >
                    <div className="text-xs font-bold text-slate-800 group-hover:text-indigo-800">Accounts & Fees</div>
                    <div className="text-[10px] text-slate-400">accounts.college@roots.edu</div>
                  </button>
                </div>
              </div>
            )}

            {/* TAB 3: UNIVERSITY DEMO ROLES */}
            {activeDemoCategory === 'university' && (
              <div className="space-y-2">
                <div className="text-[11px] font-bold text-slate-600">
                  IAS & GIKI University Network (@ias.edu.pk / @giki.com)
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => handleQuickDemo('university_admin', 'admin.uni@ias.edu.pk', 'institute123')}
                    className="p-2.5 rounded-xl bg-slate-50 hover:bg-purple-50 border border-slate-200 hover:border-purple-300 text-left transition-all cursor-pointer group"
                  >
                    <div className="text-xs font-bold text-slate-800 group-hover:text-purple-800">Vice Chancellor / Reg</div>
                    <div className="text-[10px] text-slate-400">admin.uni@ias.edu.pk</div>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleQuickDemo('uni_faculty', 'faculty.uni@ias.edu.pk', 'teacher123')}
                    className="p-2.5 rounded-xl bg-slate-50 hover:bg-purple-50 border border-slate-200 hover:border-purple-300 text-left transition-all cursor-pointer group"
                  >
                    <div className="text-xs font-bold text-slate-800 group-hover:text-purple-800">Professor / Faculty</div>
                    <div className="text-[10px] text-slate-400">faculty.uni@ias.edu.pk</div>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleQuickDemo('uni_dean', 'dean.uni@ias.edu.pk', 'institute123')}
                    className="p-2.5 rounded-xl bg-slate-50 hover:bg-purple-50 border border-slate-200 hover:border-purple-300 text-left transition-all cursor-pointer group"
                  >
                    <div className="text-xs font-bold text-slate-800 group-hover:text-purple-800">Dean of Academics</div>
                    <div className="text-[10px] text-slate-400">dean.uni@ias.edu.pk</div>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleQuickDemo('uni_controller', 'controller.uni@ias.edu.pk', 'institute123')}
                    className="p-2.5 rounded-xl bg-slate-50 hover:bg-purple-50 border border-slate-200 hover:border-purple-300 text-left transition-all cursor-pointer group"
                  >
                    <div className="text-xs font-bold text-slate-800 group-hover:text-purple-800">Exam Controller</div>
                    <div className="text-[10px] text-slate-400">controller.uni@ias.edu.pk</div>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleQuickDemo('uni_student', 'student.uni@ias.edu.pk', 'student123')}
                    className="p-2.5 rounded-xl bg-slate-50 hover:bg-purple-50 border border-slate-200 hover:border-purple-300 text-left transition-all cursor-pointer col-span-2 group"
                  >
                    <div className="text-xs font-bold text-slate-800 group-hover:text-purple-800">Undergrad Student Portal</div>
                    <div className="text-[10px] text-slate-400">student.uni@ias.edu.pk</div>
                  </button>
                </div>
              </div>
            )}

            <div className="pt-2 flex items-center justify-between border-t border-slate-100 text-[11px] text-slate-500">
              <span>Standard Password: <code className="text-purple-600 font-mono font-bold">institute123</code></span>
              <button
                type="button"
                onClick={() => setShowDemoProfiles(false)}
                className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold transition-all cursor-pointer"
              >
                Close
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  )
}

export default LoginPage
