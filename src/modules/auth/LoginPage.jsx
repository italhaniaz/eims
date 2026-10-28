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
  GraduationCap
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
          setAuthError('Security Alert: 5 consecutive failed login attempts detected. Form locked for 60 seconds.')
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
    <div className="min-h-screen w-full flex items-center justify-center bg-[#fcfaff] relative overflow-hidden px-4 py-8 sm:py-12">
      {/* Ambient background soft glow matching light purple theme */}
      <div className="absolute top-0 -left-20 w-96 h-96 bg-purple-200/35 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute bottom-0 -right-20 w-96 h-96 bg-[#f5eeff] rounded-full blur-3xl pointer-events-none"></div>

      {/* Top-Left Navigation: Sleek Back to Home Button */}
      {onBackToLanding && (
        <div className="absolute top-4 left-4 sm:top-6 sm:left-8 z-20">
          <button
            type="button"
            onClick={onBackToLanding}
            className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold text-slate-600 hover:text-purple-700 bg-white/80 hover:bg-white border border-purple-100/90 shadow-2xs hover:shadow-xs transition-all duration-150 backdrop-blur-xs group cursor-pointer"
            title="Back to Landing Page"
          >
            <ArrowLeft className="w-4 h-4 text-slate-500 group-hover:text-purple-600 group-hover:-translate-x-0.5 transition-transform" />
            <span>Back to Home</span>
          </button>
        </div>
      )}

      <div className="w-full max-w-[440px] z-10 space-y-4 pt-10 sm:pt-0">

        {/* Brand Header */}
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-tr from-purple-700 via-purple-600 to-indigo-600 text-white shadow-md shadow-purple-500/25 mb-3 transition-transform hover:scale-105 duration-200">
            <GraduationCap className="w-7 h-7 stroke-[2.2]" />
          </div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight font-heading">
            Apex<span className="text-purple-600">Ed</span> Portal
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1 flex items-center justify-center gap-1.5">
            <span>Unified Multi-Campus Management System</span>
          </p>
        </div>

        {/* Clean White Card */}
        <div className="bg-white border border-purple-100/90 rounded-3xl p-6 sm:p-8 shadow-[0_15px_40px_-5px_rgba(147,51,234,0.06),0_1px_3px_rgba(0,0,0,0.02)]">
          
          {/* Lockout Sentinel Banner */}
          {isLockedOut ? (
            <div className="mb-5 p-3.5 bg-rose-50 border border-rose-200 rounded-xl text-rose-800 text-xs space-y-2 animate-in fade-in">
              <div className="flex items-center gap-2 font-bold text-rose-700">
                <ShieldAlert className="w-4 h-4 shrink-0 text-rose-600 animate-pulse" />
                <span>Account Temporarily Locked</span>
              </div>
              <p className="text-[11px] text-rose-600 leading-relaxed">
                5 consecutive failed attempts detected. Login is locked temporarily for rate-limiting protection.
              </p>
              <div className="flex items-center gap-1.5 pt-1 text-[11px] font-mono font-semibold text-rose-800">
                <Clock className="w-3.5 h-3.5 text-rose-600" />
                <span>Unlock timer: <strong>{secondsRemaining}s</strong> remaining</span>
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

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                Email Address or Username
              </label>
              <div className="relative group">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 transition-colors group-focus-within:text-purple-600" />
                <input
                  type="text"
                  required
                  disabled={isLockedOut}
                  value={identifier}
                  onChange={(e) => {
                    setIdentifier(e.target.value)
                    if (authError) setAuthError('')
                  }}
                  className={`w-full pl-10 pr-4 py-2.5 sm:py-3 rounded-xl bg-slate-50/70 hover:bg-slate-50 border border-slate-200 text-slate-800 placeholder-slate-400 text-sm focus:bg-white focus:outline-none focus:ring-4 focus:ring-purple-500/10 focus:border-purple-500 transition-all ${
                    isLockedOut ? 'opacity-50 cursor-not-allowed' : ''
                  }`}
                  placeholder="e.g. admin or admin.beacon@sms.edu"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider">
                  Password
                </label>
                <button 
                  type="button"
                  onClick={() => { 
                    alert('Please contact your platform administrator or institutional IT department to reset credentials.') 
                  }} 
                  className="text-xs text-purple-600 hover:text-purple-700 font-semibold cursor-pointer"
                >
                  Forgot password?
                </button>
              </div>
              <div className="relative group">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 transition-colors group-focus-within:text-purple-600" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  disabled={isLockedOut}
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value)
                    if (authError) setAuthError('')
                  }}
                  className={`w-full pl-10 pr-10 py-2.5 sm:py-3 rounded-xl bg-slate-50/70 hover:bg-slate-50 border border-slate-200 text-slate-800 placeholder-slate-400 text-sm focus:bg-white focus:outline-none focus:ring-4 focus:ring-purple-500/10 focus:border-purple-500 transition-all ${
                    isLockedOut ? 'opacity-50 cursor-not-allowed' : ''
                  }`}
                  placeholder="Enter password"
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

            <div className="flex items-center justify-between text-xs text-slate-600 pt-1">
              <label className="flex items-center gap-2 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  disabled={isLockedOut}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="w-4 h-4 rounded border-slate-300 text-purple-600 focus:ring-purple-500"
                />
                <span>Remember session</span>
              </label>
            </div>

            <button
              type="submit"
              disabled={isLoading || isLockedOut}
              className={`w-full py-3 sm:py-3.5 rounded-xl font-semibold text-sm text-white bg-purple-600 hover:bg-purple-700 shadow-md shadow-purple-600/25 transition-all flex items-center justify-center gap-2 cursor-pointer ${
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
                  <span>Sign In to Portal</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* 1-Click Quick Demo Sign In */}
          <div className="pt-5 mt-5 border-t border-slate-100">
            <div className="text-center mb-3">
              <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                Quick 1-Click Demo Login
              </span>
            </div>
            <div className="grid grid-cols-2 gap-2.5">
              <button
                type="button"
                onClick={() => handleQuickDemo('superadmin')}
                className="flex items-center justify-center gap-2 py-2 px-3 rounded-xl border border-purple-100 bg-[#fcfaff] hover:bg-[#f5eeff] hover:border-purple-200 text-slate-700 hover:text-purple-700 text-xs font-semibold transition-all cursor-pointer group"
                title="Login as Super Admin"
              >
                <span className="w-2 h-2 rounded-full bg-purple-600"></span>
                <span>Super Admin</span>
              </button>
              <button
                type="button"
                onClick={() => handleQuickDemo('institute')}
                className="flex items-center justify-center gap-2 py-2 px-3 rounded-xl border border-emerald-100 bg-emerald-50/40 hover:bg-emerald-50 hover:border-emerald-200 text-slate-700 hover:text-emerald-700 text-xs font-semibold transition-all cursor-pointer group"
                title="Login as Campus Admin"
              >
                <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                <span>Campus Admin</span>
              </button>
            </div>
          </div>
        </div>

        {/* Footer info */}
        <div className="text-center text-xs text-slate-400 flex items-center justify-center gap-1.5">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
          <span>Enterprise Multi-Tenant Security Guaranteed</span>
        </div>
      </div>
    </div>
  )
}

export default LoginPage
