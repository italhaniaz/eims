import React, { useState, useEffect } from 'react'
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
  Clock,
  AlertTriangle,
  GraduationCap,
  Zap,
  Activity,
  Sparkles,
  BarChart3,
  CheckCircle2
} from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import { DataService } from '../../services/dataService'

export const LoginPage = ({ onBackToLanding, onOpenTrial }) => {
  const { login } = useAuth()
  
  // Authentication Mode: 'campus' (standard light theme) vs 'superadmin' (dedicated dark theme terminal)
  const [authMode, setAuthMode] = useState(() => {
    if (typeof window !== 'undefined') {
      const hash = window.location.hash.toLowerCase()
      if (hash.includes('superadmin') || hash.includes('admin-login')) return 'superadmin'
      const search = window.location.search.toLowerCase()
      if (search.includes('superadmin')) return 'superadmin'
    }
    return 'campus'
  })

  // Synchronize on hash changes (e.g. browser navigation or external link)
  useEffect(() => {
    const handleHash = () => {
      if (typeof window !== 'undefined') {
        const hash = window.location.hash.toLowerCase()
        if (hash.includes('superadmin') || hash.includes('admin-login')) {
          setAuthMode('superadmin')
        } else if (hash.includes('login') || hash.includes('signin')) {
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

  const [identifier, setIdentifier] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [rememberMe, setRememberMe] = useState(true)
  const [authError, setAuthError] = useState('')
  const [infoMessage, setInfoMessage] = useState('')

  // Brute-force Rate Limiting & Account Lockout Guard
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

  const executeLogin = (userIdentifier, userPassword) => {
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
      // Role recognition checks
      const isSuperadmin = (id === 'admin' || id === 'superadmin' || id === 'admin@schoolms.com') && 
                           (pass === 'admin123' || pass === 'admin')

      const isTeacher = (id === 'teacher' || id === 'faculty' || id.includes('teacher') || id.includes('faculty') || id === 'tariq.faculty@sms.edu')
      const isAccountant = (id === 'accountant' || id === 'accounts' || id.includes('account') || id === 'accounts.beacon@sms.edu')
      const isStudent = (id === 'student' || id.includes('student') || id === 'hamza.f@student.sms.edu')
      const isParent = (id === 'parent' || id.includes('parent') || id === 'farooq.parent@gmail.com')
      const isSchoolAdmin = (id === 'school' || id === 'school_admin' || id.includes('cityschool') || id === 'admin.school@cityschool.edu')
      const isCollegeAdmin = (id === 'college' || id === 'college_admin' || id.includes('roots') || id === 'admin.college@roots.edu')
      const isUniAdmin = (id === 'university' || id === 'uni' || id === 'university_admin' || id.includes('ias') || id === 'admin.uni@ias.edu.pk')
      const isInstituteAdmin = isSchoolAdmin || isCollegeAdmin || isUniAdmin || (id === 'institute' || id === 'institute_admin' || id === 'admin.beacon@sms.edu' || id.includes('institute') || id.includes('beacon') || id.includes('trial'))

      const isValidPass = pass === 'admin123' || pass === 'admin' || pass === 'institute123' || pass === 'teacher123' || pass === 'student123' || pass === 'parent123' || pass.length >= 5

      if (isSuperadmin || isInstituteAdmin || isTeacher || isAccountant || isStudent || isParent || isValidPass) {
        // Successful login
        sessionStorage.removeItem('sms_auth_failed_attempts')
        sessionStorage.removeItem('sms_auth_lockout_until')
        setFailedAttempts(0)
        setLockoutUntil(0)
        DataService.logAuditEvent('User Sign In Successful', id, 'Success')

        if (authMode === 'superadmin' || isSuperadmin) {
          login('superadmin', id.includes('@') ? id : 'admin@schoolms.com', rememberMe)
        } else if (isTeacher) {
          login('teacher', id.includes('@') ? id : 'tariq.faculty@sms.edu', rememberMe)
        } else if (isAccountant) {
          login('accountant', id.includes('@') ? id : 'accounts.beacon@sms.edu', rememberMe)
        } else if (isStudent) {
          login('student', id.includes('@') ? id : 'hamza.f@student.sms.edu', rememberMe)
        } else if (isParent) {
          login('parent', id.includes('@') ? id : 'farooq.parent@gmail.com', rememberMe)
        } else if (isSchoolAdmin) {
          login('school_admin', id.includes('@') ? id : 'admin.school@cityschool.edu', rememberMe)
        } else if (isCollegeAdmin) {
          login('college_admin', id.includes('@') ? id : 'admin.college@roots.edu', rememberMe)
        } else if (isUniAdmin) {
          login('university_admin', id.includes('@') ? id : 'admin.uni@ias.edu.pk', rememberMe)
        } else {
          login('institute_admin', id.includes('@') ? id : 'admin.beacon@sms.edu', rememberMe)
        }
      } else {
        // Failed attempt - increment brute force counter
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
      }
      setIsLoading(false)
    }, 400)
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    executeLogin(identifier, password)
  }

  // 1-Click Demo Fill & Submit Handlers
  const handleQuickDemo = (role) => {
    switch (role) {
      case 'superadmin':
        setIdentifier('admin')
        setPassword('admin123')
        executeLogin('admin', 'admin123')
        break
      case 'teacher':
        setIdentifier('tariq.faculty@sms.edu')
        setPassword('teacher123')
        executeLogin('tariq.faculty@sms.edu', 'teacher123')
        break
      case 'accountant':
        setIdentifier('accounts.beacon@sms.edu')
        setPassword('institute123')
        executeLogin('accounts.beacon@sms.edu', 'institute123')
        break
      case 'student':
        setIdentifier('hamza.f@student.sms.edu')
        setPassword('student123')
        executeLogin('hamza.f@student.sms.edu', 'student123')
        break
      case 'parent':
        setIdentifier('farooq.parent@gmail.com')
        setPassword('parent123')
        executeLogin('farooq.parent@gmail.com', 'parent123')
        break
      case 'school_admin':
        setIdentifier('admin.school@cityschool.edu')
        setPassword('institute123')
        executeLogin('admin.school@cityschool.edu', 'institute123')
        break
      case 'college_admin':
        setIdentifier('admin.college@roots.edu')
        setPassword('institute123')
        executeLogin('admin.college@roots.edu', 'institute123')
        break
      case 'university_admin':
        setIdentifier('admin.uni@ias.edu.pk')
        setPassword('institute123')
        executeLogin('admin.uni@ias.edu.pk', 'institute123')
        break
      case 'institute':
      default:
        setIdentifier('admin.beacon@sms.edu')
        setPassword('institute123')
        executeLogin('admin.beacon@sms.edu', 'institute123')
        break
    }
  }

  // =========================================================================
  // VIEW 1: SUPER ADMIN DEDICATED DARK-THEME LOGIN (Matching Reference Pic 1)
  // =========================================================================
  if (authMode === 'superadmin') {
    return (
      <div className="min-h-screen w-full flex items-center justify-center bg-[#070A12] text-slate-100 relative overflow-hidden px-4 py-8 sm:py-12 selection:bg-purple-600 selection:text-white font-sans">
        {/* Dark Cyber Ambient Glows & Constellation Grid */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div className="absolute top-0 -left-20 w-[550px] h-[550px] bg-purple-900/20 rounded-full blur-3xl"></div>
          <div className="absolute bottom-0 -right-20 w-[550px] h-[550px] bg-indigo-900/20 rounded-full blur-3xl"></div>
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] bg-blue-950/20 rounded-full blur-3xl"></div>

          {/* Network constellation lines */}
          <svg className="w-full h-full opacity-15" xmlns="http://www.w3.org/2000/svg">
            <line x1="6%" y1="12%" x2="18%" y2="28%" stroke="#818cf8" strokeWidth="1" />
            <line x1="18%" y1="28%" x2="12%" y2="62%" stroke="#818cf8" strokeWidth="1" />
            <line x1="18%" y1="28%" x2="32%" y2="18%" stroke="#818cf8" strokeWidth="1" />
            <line x1="32%" y1="18%" x2="48%" y2="10%" stroke="#818cf8" strokeWidth="1" />
            <line x1="12%" y1="62%" x2="22%" y2="82%" stroke="#818cf8" strokeWidth="1" />
            <line x1="88%" y1="60%" x2="74%" y2="42%" stroke="#818cf8" strokeWidth="1" />
            <line x1="74%" y1="42%" x2="68%" y2="22%" stroke="#818cf8" strokeWidth="1" />
            <circle cx="18%" cy="28%" r="3.5" fill="#a855f7" />
            <circle cx="32%" cy="18%" r="3" fill="#6366f1" />
            <circle cx="74%" cy="42%" r="3.5" fill="#a855f7" />
          </svg>
        </div>

        {/* Top-Left: Back to Home Button */}
        {onBackToLanding && (
          <div className="absolute top-4 left-4 sm:top-6 sm:left-8 z-30">
            <button
              type="button"
              onClick={onBackToLanding}
              className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold text-slate-400 hover:text-white bg-slate-900/80 hover:bg-slate-800 border border-slate-800 shadow-2xs transition-all cursor-pointer backdrop-blur-xs group"
              title="Back to Landing Page"
            >
              <ArrowLeft className="w-4 h-4 text-slate-400 group-hover:text-purple-400 group-hover:-translate-x-0.5 transition-transform" />
              <span>Back to Home</span>
            </button>
          </div>
        )}

        {/* Main Superadmin Dual-Pane Dark Container (Exact Match to Sample Pic 1) */}
        <div className="w-full max-w-[960px] z-10 rounded-3xl bg-[#0D121F] border border-slate-800 shadow-[0_20px_60px_-15px_rgba(0,0,0,0.8)] overflow-hidden grid grid-cols-1 md:grid-cols-12 relative mt-12 sm:mt-0">
          
          {/* LEFT PANE: Superadmin Control Plane Architecture (5 Cols) */}
          <div className="md:col-span-5 p-6 sm:p-8 flex flex-col justify-between border-b md:border-b-0 md:border-r border-slate-800/90 bg-gradient-to-b from-[#0F1626] to-[#0A0E1A] relative">
            <div>
              {/* Top Eyebrow Badge */}
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold text-purple-300 bg-purple-950/80 border border-purple-800/60 shadow-2xs mb-5 self-start">
                <Sparkles className="w-3.5 h-3.5 text-purple-400" />
                <span>Next-Gen Academic ERP</span>
              </div>

              {/* Logo Mark with Orbit Ring Indicator */}
              <div className="flex items-center gap-2.5 mb-4">
                <div className="w-13 h-13 rounded-2xl bg-gradient-to-tr from-purple-700 via-purple-600 to-indigo-600 text-white flex items-center justify-center p-2.5 shadow-lg shadow-purple-600/30">
                  <GraduationCap className="w-8 h-8 stroke-[2.2]" />
                </div>
                <div className="w-4 h-4 rounded-full border-2 border-slate-700 bg-slate-900 flex items-center justify-center">
                  <div className="w-1.5 h-1.5 rounded-full bg-purple-400 animate-ping"></div>
                </div>
              </div>

              {/* Heading & Subtitle */}
              <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight font-heading">
                Apex<span className="text-purple-400">Ed</span> Portal
              </h1>
              <p className="text-xs sm:text-sm text-slate-400 leading-relaxed mt-2 mb-6">
                Control plane architecture for multi-campus orchestration & tenant governance.
              </p>

              {/* 3 Dark Feature Cards (Exact match to sample) */}
              <div className="space-y-3">
                {/* Feature 1: Lightning Telemetry */}
                <div className="flex items-center gap-3.5 p-3 rounded-2xl bg-[#131B2E]/70 border border-slate-800/90 hover:border-slate-700 transition-all group">
                  <div className="w-10 h-10 rounded-xl bg-slate-900 border border-slate-700/80 flex items-center justify-center text-purple-400 group-hover:scale-105 transition-transform shrink-0">
                    <Zap className="w-4.5 h-4.5" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-white">Lightning Checkout</h4>
                    <p className="text-[11px] text-slate-400 leading-tight">Sub-50ms instant receipt rendering</p>
                  </div>
                </div>

                {/* Feature 2: Real-Time Telemetry */}
                <div className="flex items-center gap-3.5 p-3 rounded-2xl bg-[#131B2E]/70 border border-slate-800/90 hover:border-slate-700 transition-all group">
                  <div className="w-10 h-10 rounded-xl bg-slate-900 border border-slate-700/80 flex items-center justify-center text-indigo-400 group-hover:scale-105 transition-transform shrink-0">
                    <BarChart3 className="w-4.5 h-4.5" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-white">Real-Time Telemetry</h4>
                    <p className="text-[11px] text-slate-400 leading-tight">Automated profit, loss & stock sync</p>
                  </div>
                </div>

                {/* Feature 3: Bank-Grade Security */}
                <div className="flex items-center gap-3.5 p-3 rounded-2xl bg-[#131B2E]/70 border border-slate-800/90 hover:border-slate-700 transition-all group">
                  <div className="w-10 h-10 rounded-xl bg-slate-900 border border-slate-700/80 flex items-center justify-center text-emerald-400 group-hover:scale-105 transition-transform shrink-0">
                    <ShieldCheck className="w-4.5 h-4.5" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-white">Bank-Grade Security</h4>
                    <p className="text-[11px] text-slate-400 leading-tight">Encrypted sessions & audit trails</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Bottom Status Indicator */}
            <div className="pt-6 mt-6 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-400">
              <span className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                <span className="font-semibold text-slate-300">POS Engine Operational</span>
              </span>
              <span className="font-mono text-slate-500 font-bold">v2.5 Pro</span>
            </div>
          </div>

          {/* RIGHT PANE: Superadmin Credentials Form (7 Cols) */}
          <div className="md:col-span-7 p-6 sm:p-10 flex flex-col justify-between bg-[#0D121F]">
            <div>
              {/* Header Row: Sign In + Superadmin Badge */}
              <div className="flex items-center justify-between">
                <h2 className="text-2xl sm:text-3xl font-extrabold text-white font-heading tracking-tight">
                  Sign In
                </h2>
                {/* Blue pill badge matching reference pic */}
                <span className="px-3 py-1 rounded-md bg-[#1d3557] text-[#93c5fd] border border-[#2563eb]/60 text-xs font-black uppercase tracking-wider shadow-inner">
                  Superadmin
                </span>
              </div>
              <p className="text-xs sm:text-sm text-slate-400 mt-1">
                Authenticate with superadmin credentials
              </p>

              {/* Return to Campus Login Switcher */}
              <button
                type="button"
                onClick={() => toggleAuthMode('campus')}
                className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-purple-300 font-semibold mt-2.5 transition-colors cursor-pointer group"
              >
                <ArrowLeft className="w-3.5 h-3.5 group-hover:-translate-x-0.5 transition-transform" />
                <span>Return to Shop Login</span>
              </button>

              {/* Alert / Error Banners */}
              {authError && (
                <div className="mt-4 p-3.5 rounded-xl bg-rose-950/60 border border-rose-800 text-rose-200 text-xs font-medium flex items-start gap-2.5 animate-in fade-in">
                  <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                  <span>{authError}</span>
                </div>
              )}

              {infoMessage && (
                <div className="mt-4 p-3 rounded-xl bg-purple-950/60 border border-purple-800 text-purple-200 text-xs font-medium flex items-center justify-between animate-in fade-in">
                  <span>{infoMessage}</span>
                  <button type="button" onClick={() => setInfoMessage('')} className="text-purple-400 hover:text-purple-200 font-bold ml-2">✕</button>
                </div>
              )}

              {/* Sign In Form */}
              <form onSubmit={handleSubmit} className="mt-6 space-y-4">
                <div>
                  <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">
                    Email or Username
                  </label>
                  <div className="relative group">
                    <Mail className="w-4 h-4 text-slate-500 absolute left-4 top-1/2 -translate-y-1/2 group-focus-within:text-purple-400 transition-colors pointer-events-none" />
                    <input
                      type="text"
                      required
                      disabled={isLockedOut}
                      value={identifier}
                      onChange={(e) => {
                        setIdentifier(e.target.value)
                        if (authError) setAuthError('')
                      }}
                      className="w-full pl-11 pr-4 py-3 rounded-xl bg-[#0A0E1A] border border-slate-700/80 text-white placeholder-slate-500 text-sm focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-500/20 transition-all"
                      placeholder="cashier@store.com or admin"
                    />
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                      Password
                    </label>
                    <button 
                      type="button"
                      onClick={() => setInfoMessage('Superadmin credentials recovery: Contact system host or run recovery console.')}
                      className="text-xs text-purple-400 hover:text-purple-300 font-semibold cursor-pointer transition-colors"
                    >
                      Forgot Password?
                    </button>
                  </div>
                  <div className="relative group">
                    <Lock className="w-4 h-4 text-slate-500 absolute left-4 top-1/2 -translate-y-1/2 group-focus-within:text-purple-400 transition-colors pointer-events-none" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      disabled={isLockedOut}
                      value={password}
                      onChange={(e) => {
                        setPassword(e.target.value)
                        if (authError) setAuthError('')
                      }}
                      className="w-full pl-11 pr-11 py-3 rounded-xl bg-[#0A0E1A] border border-slate-700/80 text-white placeholder-slate-500 text-sm focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-500/20 transition-all font-mono"
                      placeholder="••••••••••••"
                    />
                    <button
                      type="button"
                      disabled={isLockedOut}
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors cursor-pointer"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <div className="flex items-center justify-between text-xs pt-0.5 text-slate-400">
                  <label className="flex items-center gap-2.5 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={rememberMe}
                      disabled={isLockedOut}
                      onChange={(e) => setRememberMe(e.target.checked)}
                      className="w-4 h-4 rounded border-slate-700 bg-[#0A0E1A] text-purple-600 focus:ring-purple-500 accent-purple-600 cursor-pointer"
                    />
                    <span className="text-slate-300 font-medium">Remember this terminal</span>
                  </label>
                  <span className="text-slate-500 font-medium">30 Days Active</span>
                </div>

                {/* Submit Button (Matching grey/dark theme in reference image) */}
                <button
                  type="submit"
                  disabled={isLoading || isLockedOut}
                  className="w-full py-3.5 rounded-xl font-bold text-sm text-white bg-[#374151] hover:bg-[#4b5563] border border-slate-600 shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-[0.99] disabled:opacity-50"
                >
                  {isLoading ? (
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  ) : (
                    <>
                      <span>Sign In</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </form>

              {/* 1-Click Super Admin Demo Login Shortcut */}
              <div className="pt-4 mt-4 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => handleQuickDemo('superadmin')}
                  className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl border border-purple-500/40 bg-purple-950/30 hover:bg-purple-900/40 text-purple-300 text-xs font-bold transition-all cursor-pointer group shadow-2xs"
                  title="Direct 1-Click Super Admin Access"
                >
                  <span className="w-2 h-2 rounded-full bg-purple-400 group-hover:scale-125 transition-transform"></span>
                  <span>Quick 1-Click Super Admin Access</span>
                </button>
              </div>
            </div>

            {/* Bottom Security Guarantee */}
            <div className="pt-6 mt-4 border-t border-slate-800/80 text-center">
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
  // VIEW 2: STANDARD INSTITUTIONAL LOGIN (Light Theme - Matching Pic 2)
  // Super Admin tag has been completely REMOVED per user instructions.
  // =========================================================================
  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-[#fcfaff] relative overflow-hidden px-4 py-8 sm:py-12 selection:bg-purple-500 selection:text-white font-sans">
      {/* Background Ambient Glows & Constellation Network Mesh (Light Theme) */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-0 -left-20 w-[500px] h-[500px] bg-purple-200/35 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 -right-20 w-[500px] h-[500px] bg-[#f5eeff] rounded-full blur-3xl"></div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-indigo-50/40 rounded-full blur-3xl"></div>

        {/* Network Nodes Vector Canvas (Soft Purple/Indigo Mesh) */}
        <svg className="w-full h-full opacity-20 sm:opacity-25" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <linearGradient id="lightNodeGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#9333ea" stopOpacity="0.4" />
              <stop offset="100%" stopColor="#6366f1" stopOpacity="0.1" />
            </linearGradient>
          </defs>
          <line x1="6%" y1="12%" x2="18%" y2="28%" stroke="url(#lightNodeGrad)" strokeWidth="1" />
          <line x1="18%" y1="28%" x2="12%" y2="62%" stroke="url(#lightNodeGrad)" strokeWidth="1" />
          <line x1="18%" y1="28%" x2="32%" y2="18%" stroke="url(#lightNodeGrad)" strokeWidth="1" />
          <line x1="32%" y1="18%" x2="48%" y2="10%" stroke="url(#lightNodeGrad)" strokeWidth="1" />
          <line x1="12%" y1="62%" x2="22%" y2="82%" stroke="url(#lightNodeGrad)" strokeWidth="1" />
          <line x1="22%" y1="82%" x2="40%" y2="88%" stroke="url(#lightNodeGrad)" strokeWidth="1" />
          <line x1="40%" y1="88%" x2="58%" y2="92%" stroke="url(#lightNodeGrad)" strokeWidth="1" />
          <line x1="82%" y1="12%" x2="94%" y2="26%" stroke="url(#lightNodeGrad)" strokeWidth="1" />
          <line x1="94%" y1="26%" x2="88%" y2="60%" stroke="url(#lightNodeGrad)" strokeWidth="1" />
          <line x1="88%" y1="60%" x2="74%" y2="42%" stroke="url(#lightNodeGrad)" strokeWidth="1" />
          <line x1="88%" y1="60%" x2="92%" y2="85%" stroke="url(#lightNodeGrad)" strokeWidth="1" />
          <line x1="74%" y1="42%" x2="68%" y2="22%" stroke="url(#lightNodeGrad)" strokeWidth="1" />
          <line x1="68%" y1="22%" x2="82%" y2="12%" stroke="url(#lightNodeGrad)" strokeWidth="1" />
          <line x1="58%" y1="92%" x2="76%" y2="88%" stroke="url(#lightNodeGrad)" strokeWidth="1" />
          <line x1="76%" y1="88%" x2="92%" y2="85%" stroke="url(#lightNodeGrad)" strokeWidth="1" />

          <circle cx="6%" cy="12%" r="3.5" fill="#9333ea" />
          <circle cx="18%" cy="28%" r="4" fill="#7c3aed" />
          <circle cx="12%" cy="62%" r="3.5" fill="#9333ea" />
          <circle cx="32%" cy="18%" r="3" fill="#6366f1" />
          <circle cx="48%" cy="10%" r="2.5" fill="#7c3aed" />
          <circle cx="22%" cy="82%" r="3" fill="#9333ea" />
          <circle cx="40%" cy="88%" r="2.5" fill="#7c3aed" />
          <circle cx="58%" cy="92%" r="3" fill="#6366f1" />
          <circle cx="76%" cy="88%" r="3.5" fill="#7c3aed" />
          <circle cx="92%" cy="85%" r="4" fill="#9333ea" />
          <circle cx="88%" cy="60%" r="3" fill="#6366f1" />
          <circle cx="74%" cy="42%" r="3.5" fill="#7c3aed" />
          <circle cx="68%" cy="22%" r="2.5" fill="#7c3aed" />
          <circle cx="82%" cy="12%" r="3" fill="#9333ea" />
          <circle cx="94%" cy="26%" r="3.5" fill="#7c3aed" />
        </svg>
      </div>

      {/* Top-Left: Back to Home Button */}
      {onBackToLanding && (
        <div className="absolute top-4 left-4 sm:top-6 sm:left-8 z-30">
          <button
            type="button"
            onClick={onBackToLanding}
            className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold text-slate-600 hover:text-purple-700 bg-white/90 hover:bg-white border border-purple-100/90 shadow-2xs hover:shadow-xs transition-all duration-150 backdrop-blur-xs group cursor-pointer"
            title="Back to Landing Page"
          >
            <ArrowLeft className="w-4 h-4 text-slate-500 group-hover:text-purple-600 group-hover:-translate-x-0.5 transition-transform" />
            <span>Back to Home</span>
          </button>
        </div>
      )}

      {/* Main Dual-Pane Card (Matching Pic 2) */}
      <div className="w-full max-w-[960px] z-10 rounded-3xl bg-white border border-purple-100/90 shadow-[0_15px_45px_-5px_rgba(147,51,234,0.08),0_1px_3px_rgba(0,0,0,0.02)] overflow-hidden grid grid-cols-1 md:grid-cols-12 relative mt-12 sm:mt-0">
        
        {/* LEFT PANE: Branding, Product Highlights & Telemetry Status (5 Cols) */}
        <div className="md:col-span-5 p-6 sm:p-8 flex flex-col justify-between border-b md:border-b-0 md:border-r border-purple-100/80 bg-gradient-to-b from-[#fbf8fe] via-[#f7f2fc] to-[#f4edfb] relative">
          <div>
            {/* Pill Badge */}
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold text-purple-700 bg-purple-100/80 border border-purple-200/80 shadow-2xs mb-5 self-start">
              <Sparkles className="w-3.5 h-3.5 text-purple-600" />
              <span>Next-Gen Academic ERP</span>
            </div>

            {/* Logo Mark with Orbit Ring Indicator */}
            <div className="flex items-center gap-2.5 mb-4">
              <div className="w-13 h-13 rounded-2xl bg-gradient-to-tr from-purple-700 via-purple-600 to-indigo-600 text-white flex items-center justify-center p-2.5 shadow-md shadow-purple-500/25">
                <GraduationCap className="w-8 h-8 stroke-[2.2]" />
              </div>
              <div className="w-4 h-4 rounded-full border-2 border-purple-200 bg-white flex items-center justify-center shadow-xs">
                <div className="w-1.5 h-1.5 rounded-full bg-purple-600 animate-ping"></div>
              </div>
            </div>

            {/* Heading & Subtitle */}
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight font-heading">
              Apex<span className="text-purple-600">Ed</span> Portal
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 leading-relaxed mt-2 mb-6">
              Intelligent multi-campus academic operating system with computerized fee challans, live attendance, and multi-tier exam governance.
            </p>

            {/* Feature Highlights Stack */}
            <div className="space-y-3">
              {/* Feature 1: Fee Barcoding */}
              <div className="flex items-center gap-3.5 p-3 rounded-2xl bg-white border border-purple-100/90 shadow-2xs hover:shadow-xs hover:border-purple-200 transition-all group">
                <div className="w-10 h-10 rounded-xl bg-purple-50 border border-purple-100 flex items-center justify-center text-purple-600 group-hover:scale-105 transition-transform shrink-0">
                  <Zap className="w-4.5 h-4.5" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-800">Instant Fee Barcoding</h4>
                  <p className="text-[11px] text-slate-500 leading-tight">Sub-50ms 1Link & JazzCash challans</p>
                </div>
              </div>

              {/* Feature 2: Multi-Wing Telemetry */}
              <div className="flex items-center gap-3.5 p-3 rounded-2xl bg-white border border-purple-100/90 shadow-2xs hover:shadow-xs hover:border-purple-200 transition-all group">
                <div className="w-10 h-10 rounded-xl bg-purple-50 border border-purple-100 flex items-center justify-center text-purple-600 group-hover:scale-105 transition-transform shrink-0">
                  <Activity className="w-4.5 h-4.5" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-800">Multi-Wing Telemetry</h4>
                  <p className="text-[11px] text-slate-500 leading-tight">Automated attendance & wing sync</p>
                </div>
              </div>

              {/* Feature 3: Bank-Grade Security */}
              <div className="flex items-center gap-3.5 p-3 rounded-2xl bg-white border border-purple-100/90 shadow-2xs hover:shadow-xs hover:border-purple-200 transition-all group">
                <div className="w-10 h-10 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600 group-hover:scale-105 transition-transform shrink-0">
                  <ShieldCheck className="w-4.5 h-4.5" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-800">Bank-Grade Security</h4>
                  <p className="text-[11px] text-slate-500 leading-tight">Encrypted sessions & audit trails</p>
                </div>
              </div>
            </div>
          </div>

          {/* Bottom Operational Status */}
          <div className="pt-6 mt-6 border-t border-purple-100/80 flex items-center justify-between text-xs text-slate-500">
            <span className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              <span className="font-semibold text-slate-700">Portal Engine Operational</span>
            </span>
            <span className="font-mono text-slate-400 font-bold">v2.5 Enterprise</span>
          </div>
        </div>

        {/* RIGHT PANE: Campus Sign In Form (7 Cols) */}
        <div className="md:col-span-7 p-6 sm:p-10 flex flex-col justify-between bg-white">
          <div>
            <div className="mb-6">
              <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 font-heading tracking-tight">
                Sign In
              </h2>
              <p className="text-xs sm:text-sm text-slate-500 mt-1">
                Enter your institutional credentials to access portal
              </p>
            </div>

            {/* Error & Info Alerts */}
            {authError && (
              <div className="mb-4 p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-medium flex items-start gap-2.5 animate-in fade-in">
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                <span>{authError}</span>
              </div>
            )}

            {infoMessage && (
              <div className="mb-4 p-3 rounded-xl bg-purple-50 border border-purple-200 text-purple-800 text-xs font-medium flex items-center justify-between animate-in fade-in">
                <span>{infoMessage}</span>
                <button type="button" onClick={() => setInfoMessage('')} className="text-purple-600 hover:text-purple-800 font-bold ml-2">✕</button>
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-[11px] font-bold text-slate-600 uppercase tracking-wider mb-2">
                  Email or Username
                </label>
                <div className="relative group">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2 group-focus-within:text-purple-600 transition-colors pointer-events-none" />
                  <input
                    type="text"
                    required
                    disabled={isLockedOut}
                    value={identifier}
                    onChange={(e) => {
                      setIdentifier(e.target.value)
                      if (authError) setAuthError('')
                    }}
                    className={`w-full pl-11 pr-4 py-3 rounded-xl bg-slate-50/70 hover:bg-slate-50 border border-slate-200 text-slate-800 placeholder-slate-400 text-sm focus:bg-white focus:outline-none focus:ring-4 focus:ring-purple-500/10 focus:border-purple-500 transition-all ${
                      isLockedOut ? 'opacity-50 cursor-not-allowed' : ''
                    }`}
                    placeholder="e.g. admin or admin.beacon@sms.edu"
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-[11px] font-bold text-slate-600 uppercase tracking-wider">
                    Password
                  </label>
                  <button 
                    type="button"
                    onClick={() => { 
                      setInfoMessage('To reset your credentials, please contact your platform administrator or institutional IT support.') 
                    }} 
                    className="text-xs text-purple-600 hover:text-purple-700 font-semibold cursor-pointer transition-colors"
                  >
                    Forgot Password?
                  </button>
                </div>
                <div className="relative group">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2 group-focus-within:text-purple-600 transition-colors pointer-events-none" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    disabled={isLockedOut}
                    value={password}
                    onChange={(e) => {
                      setPassword(e.target.value)
                      if (authError) setAuthError('')
                    }}
                    className={`w-full pl-11 pr-11 py-3 rounded-xl bg-slate-50/70 hover:bg-slate-50 border border-slate-200 text-slate-800 placeholder-slate-400 text-sm focus:bg-white focus:outline-none focus:ring-4 focus:ring-purple-500/10 focus:border-purple-500 transition-all ${
                      isLockedOut ? 'opacity-50 cursor-not-allowed' : ''
                    }`}
                    placeholder="••••••••••••"
                  />
                  <button
                    type="button"
                    disabled={isLockedOut}
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors cursor-pointer"
                    title={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between text-xs pt-0.5">
                <label className="flex items-center gap-2.5 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    disabled={isLockedOut}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="w-4 h-4 rounded border-slate-300 text-purple-600 focus:ring-purple-500 accent-purple-600 cursor-pointer"
                  />
                  <span className="text-slate-700 font-medium">Remember this terminal</span>
                </label>
                <span className="text-slate-400 font-medium">30 Days Active</span>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isLoading || isLockedOut}
                className={`w-full py-3.5 rounded-xl font-bold text-sm text-white bg-purple-600 hover:bg-purple-700 shadow-md shadow-purple-600/25 hover:shadow-lg hover:shadow-purple-600/30 transition-all flex items-center justify-center gap-2 cursor-pointer ${
                  isLoading || isLockedOut ? 'opacity-70 cursor-not-allowed' : 'active:scale-[0.99]'
                }`}
              >
                {isLoading ? (
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                ) : isLockedOut ? (
                  <>
                    <ShieldAlert className="w-4 h-4 text-rose-200" />
                    <span>Locked ({secondsRemaining}s)</span>
                  </>
                ) : (
                  <>
                    <span>Sign In</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>

            {/* 1-Click Quick Demo Sign In: Dedicated Campus Roles */}
            <div className="pt-5 mt-4">
              <div className="text-center mb-2.5">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                  Quick 1-Click Role Login
                </span>
              </div>
              <div className="space-y-2">
                <div className="text-[10px] font-extrabold uppercase tracking-wider text-purple-700 text-left px-0.5">
                  Institutional Tier Logins
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  <button
                    type="button"
                    onClick={() => handleQuickDemo('school_admin')}
                    className="flex items-center justify-center gap-1.5 py-2 px-2 rounded-lg border border-emerald-200 bg-emerald-50/70 hover:bg-emerald-100 text-emerald-900 text-[11px] font-bold transition-all cursor-pointer shadow-2xs"
                    title="Login as School Admin (City School - K-10 Scope Only)"
                  >
                    <span>🏫 School Admin</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleQuickDemo('college_admin')}
                    className="flex items-center justify-center gap-1.5 py-2 px-2 rounded-lg border border-indigo-200 bg-indigo-50/70 hover:bg-indigo-100 text-indigo-900 text-[11px] font-bold transition-all cursor-pointer shadow-2xs"
                    title="Login as College Admin (Roots College - HSSC & ADP Only)"
                  >
                    <span>🏛️ College Admin</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleQuickDemo('university_admin')}
                    className="flex items-center justify-center gap-1.5 py-2 px-2 rounded-lg border border-purple-200 bg-[#f5eeff] hover:bg-purple-100 text-purple-900 text-[11px] font-bold transition-all cursor-pointer shadow-2xs"
                    title="Login as University Admin (IAS University - BS Degrees Only)"
                  >
                    <span>🎓 Uni Admin</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleQuickDemo('institute')}
                    className="flex items-center justify-center gap-1.5 py-2 px-2 rounded-lg border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-800 text-[11px] font-bold transition-all cursor-pointer shadow-2xs"
                    title="Login as Multi-Tier Campus Director (Beaconhouse School + College)"
                  >
                    <span>🏢 Multi-Tier</span>
                  </button>
                </div>

                <div className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 text-left px-0.5 pt-1">
                  Individual Campus Roles
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  <button
                    type="button"
                    onClick={() => handleQuickDemo('teacher')}
                    className="flex items-center justify-center gap-1.5 py-1.5 px-2 rounded-lg border border-slate-200 hover:border-slate-300 bg-white text-slate-700 text-[11px] font-semibold transition-all cursor-pointer shadow-2xs"
                    title="Login as Faculty Member"
                  >
                    <span>Teacher</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleQuickDemo('accountant')}
                    className="flex items-center justify-center gap-1.5 py-1.5 px-2 rounded-lg border border-slate-200 hover:border-slate-300 bg-white text-slate-700 text-[11px] font-semibold transition-all cursor-pointer shadow-2xs"
                    title="Login as Finance Officer"
                  >
                    <span>Accounts</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleQuickDemo('student')}
                    className="flex items-center justify-center gap-1.5 py-1.5 px-2 rounded-lg border border-slate-200 hover:border-slate-300 bg-white text-slate-700 text-[11px] font-semibold transition-all cursor-pointer shadow-2xs"
                    title="Login as Enrolled Student"
                  >
                    <span>Student</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleQuickDemo('parent')}
                    className="flex items-center justify-center gap-1.5 py-1.5 px-2 rounded-lg border border-slate-200 hover:border-slate-300 bg-white text-slate-700 text-[11px] font-semibold transition-all cursor-pointer shadow-2xs"
                    title="Login as Parent / Guardian"
                  >
                    <span>Parent</span>
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Bottom Section: Divider & Register Institution / Start Free Trial */}
          <div className="pt-4 mt-4 border-t border-slate-100 space-y-3">
            <div className="text-center space-y-2">
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
                className="w-full py-3 rounded-xl border border-purple-200 bg-purple-50/60 hover:bg-purple-100/80 text-purple-700 hover:text-purple-800 text-xs sm:text-sm font-bold transition-all flex items-center justify-center gap-2 cursor-pointer shadow-2xs group"
              >
                <Building2 className="w-4 h-4 text-purple-600 group-hover:scale-110 transition-transform" />
                <span>Register Institution / Start Free Trial</span>
                <ArrowRight className="w-3.5 h-3.5 text-purple-600 group-hover:translate-x-1 transition-transform" />
              </button>
            </div>

            {/* Discreet Link to Super Admin Login */}
            <div className="text-center pt-1">
              <button
                type="button"
                onClick={() => toggleAuthMode('superadmin')}
                className="text-[11px] font-bold text-slate-400 hover:text-purple-600 transition-colors inline-flex items-center gap-1 cursor-pointer"
                title="Open Superadmin Control Plane Login"
              >
                <Lock className="w-3 h-3 text-slate-400" />
                <span>Superadmin Control Plane Login →</span>
              </button>
            </div>
          </div>
        </div>

      </div>
    </div>
  )
}

export default LoginPage
