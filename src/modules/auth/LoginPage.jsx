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
  Sparkles
} from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import { DataService } from '../../services/dataService'

export const LoginPage = ({ onBackToLanding, onOpenTrial }) => {
  const { login } = useAuth()
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
      // Superadmin authentication check
      const isSuperadmin = (id === 'admin' || id === 'superadmin' || id === 'admin@schoolms.com') && 
                           (pass === 'admin123' || pass === 'admin')

      // Institute Admin authentication check
      const isInstituteAdmin = (id === 'institute' || id === 'institute_admin' || id === 'admin.beacon@sms.edu' || id.includes('institute') || id.includes('beacon') || id.includes('school') || id.includes('trial')) && 
                              (pass === 'institute123' || pass === 'admin123' || pass === 'admin')

      if (isSuperadmin || isInstituteAdmin || pass === 'admin123' || pass === 'admin' || pass === 'institute123') {
        // Successful login
        sessionStorage.removeItem('sms_auth_failed_attempts')
        sessionStorage.removeItem('sms_auth_lockout_until')
        setFailedAttempts(0)
        setLockoutUntil(0)
        DataService.logAuditEvent('User Sign In Successful', id, 'Success')

        if (isSuperadmin) {
          login('superadmin', id.includes('@') ? id : 'admin@schoolms.com', rememberMe)
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
    if (role === 'superadmin') {
      setIdentifier('admin')
      setPassword('admin123')
      executeLogin('admin', 'admin123')
    } else {
      setIdentifier('institute')
      setPassword('institute123')
      executeLogin('institute', 'institute123')
    }
  }

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-[#fcfaff] relative overflow-hidden px-4 py-8 sm:py-12 selection:bg-purple-500 selection:text-white">
      {/* Background Ambient Glows & Constellation Network Mesh (Light Theme) */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {/* Soft Radial Ambient Glows matching website purple theme */}
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
          {/* Constellation Network Connecting Lines */}
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

          {/* Network Node Dots */}
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

      {/* Top-Left Navigation: Sleek Back to Home Button */}
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

      {/* Main Dual-Pane Card matching website theme & structure */}
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
                <div className="w-10 h-10 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 group-hover:scale-105 transition-transform shrink-0">
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

          {/* Engine Status Footer (Left) */}
          <div className="pt-5 mt-6 border-t border-purple-100/80 flex items-center justify-between text-xs">
            <div className="flex items-center gap-2 text-slate-600 font-medium">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              <span>Portal Engine Operational</span>
            </div>
            <span className="text-slate-400 font-mono text-xs font-semibold">v2.5 Enterprise</span>
          </div>
        </div>

        {/* RIGHT PANE: Clean Sign In Terminal (7 Cols) */}
        <div className="md:col-span-7 p-6 sm:p-9 flex flex-col justify-between bg-white">
          <div>
            {/* Header */}
            <div className="mb-6">
              <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight font-heading">
                Sign In
              </h2>
              <p className="text-xs sm:text-sm text-slate-500 mt-1">
                Enter your institutional credentials to access portal
              </p>
            </div>

            {/* Lockout Sentinel Banner */}
            {isLockedOut ? (
              <div className="mb-5 p-3.5 bg-rose-50 border border-rose-200 rounded-xl text-rose-800 text-xs space-y-2 animate-in fade-in">
                <div className="flex items-center gap-2 font-bold text-rose-700">
                  <ShieldAlert className="w-4 h-4 shrink-0 text-rose-600 animate-pulse" />
                  <span>Terminal Access Temporarily Locked</span>
                </div>
                <p className="text-[11px] text-rose-600 leading-relaxed">
                  5 consecutive failed attempts detected. Terminal access suspended for rate-limiting protection.
                </p>
                <div className="flex items-center gap-1.5 pt-1 text-[11px] font-mono text-rose-700">
                  <Clock className="w-3.5 h-3.5 text-rose-600" />
                  <span>Unlock countdown: <strong>{secondsRemaining}s</strong> remaining</span>
                </div>
              </div>
            ) : failedAttempts > 2 ? (
              <div className="mb-4 p-2.5 bg-amber-50 border border-amber-200 rounded-xl text-amber-800 text-xs flex items-center gap-2 animate-in fade-in">
                <AlertTriangle className="w-4 h-4 shrink-0 text-amber-600" />
                <span>Warning: {failedAttempts}/5 failed attempts before rate-limit lockout.</span>
              </div>
            ) : null}

            {authError && !isLockedOut && (
              <div className="mb-4 p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 text-xs flex items-center gap-2 animate-in fade-in">
                <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
                <span>{authError}</span>
              </div>
            )}

            {infoMessage && (
              <div className="mb-4 p-3 bg-purple-50 border border-purple-200 rounded-xl text-purple-700 text-xs flex items-center justify-between gap-2 animate-in fade-in">
                <span className="text-[11px] leading-relaxed font-medium">{infoMessage}</span>
                <button 
                  type="button" 
                  onClick={() => setInfoMessage('')} 
                  className="text-purple-600 hover:text-purple-900 text-xs font-bold px-1"
                >
                  ✕
                </button>
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

            {/* 1-Click Quick Demo Sign In (Website Theme) */}
            <div className="pt-5 mt-4">
              <div className="text-center mb-2.5">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                  Quick 1-Click Demo Login
                </span>
              </div>
              <div className="grid grid-cols-2 gap-2.5">
                <button
                  type="button"
                  onClick={() => handleQuickDemo('superadmin')}
                  className="flex items-center justify-center gap-2 py-2 px-3 rounded-xl border border-purple-100 bg-[#fcfaff] hover:bg-[#f5eeff] hover:border-purple-200 text-slate-700 hover:text-purple-700 text-xs font-semibold transition-all cursor-pointer group shadow-2xs"
                  title="Login as Super Admin"
                >
                  <span className="w-2 h-2 rounded-full bg-purple-600 group-hover:scale-125 transition-transform"></span>
                  <span>Super Admin</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleQuickDemo('institute')}
                  className="flex items-center justify-center gap-2 py-2 px-3 rounded-xl border border-emerald-100 bg-emerald-50/50 hover:bg-emerald-50 hover:border-emerald-200 text-slate-700 hover:text-emerald-700 text-xs font-semibold transition-all cursor-pointer group shadow-2xs"
                  title="Login as Campus Admin"
                >
                  <span className="w-2 h-2 rounded-full bg-emerald-500 group-hover:scale-125 transition-transform"></span>
                  <span>Campus Admin</span>
                </button>
              </div>
            </div>
          </div>

          {/* Bottom Section: Divider & Register Institution / Start Free Trial */}
          <div className="pt-4 mt-4 border-t border-slate-100">
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
          </div>
        </div>

      </div>
    </div>
  )
}

export default LoginPage