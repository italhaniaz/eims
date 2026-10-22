import React, { useState, useEffect } from 'react'
import { 
  Building2, 
  Lock, 
  Mail, 
  Eye, 
  EyeOff, 
  ArrowRight,
  AlertCircle, 
  ShieldCheck, 
  ShieldAlert,
  Clock,
  AlertTriangle
} from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import { DataService } from '../../services/dataService'

export const LoginPage = () => {
  const { login } = useAuth()
  const [identifier, setIdentifier] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [rememberMe, setRememberMe] = useState(false)
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

  const handleSubmit = (e) => {
    e.preventDefault()
    if (isLockedOut) {
      setAuthError(`Security Lockout Active: Please wait ${secondsRemaining}s before attempting again.`)
      return
    }

    setAuthError('')
    const id = (identifier || '').trim().toLowerCase()
    const pass = (password || '').trim()

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
      const isInstituteAdmin = (id === 'institute' || id === 'institute_admin' || id === 'admin.beacon@sms.edu' || id.includes('institute') || id.includes('beacon') || id.includes('school')) && 
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
          setAuthError('🚨 Security Alert: 5 consecutive failed login attempts detected. Form locked for 60 seconds to protect against brute-force attacks.')
        } else {
          DataService.logAuditEvent('Failed login attempt', id, 'Warning')
          setAuthError(`Invalid credentials. Attempt ${nextAttempts} of 5 before temporary security lockout.`)
        }
      }
      setIsLoading(false)
    }, 450)
  }

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-[#0b1322] relative overflow-hidden px-4 py-8">
      {/* Background ambient lighting - zero CPU cost */}
      <div className="absolute -top-32 -left-32 w-96 h-96 bg-blue-600/15 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute -bottom-32 -right-32 w-96 h-96 bg-indigo-600/15 rounded-full blur-3xl pointer-events-none"></div>

      <div className="w-full max-w-md z-10 space-y-6">
        {/* Brand Header */}
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-500 text-white shadow-xl shadow-blue-500/20 mb-3.5 transition-transform hover:scale-105 duration-200">
            <Building2 className="w-7 h-7" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Educational Institute Management System
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1.5 flex items-center justify-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>Enterprise Multi-Campus Portal</span>
          </p>
        </div>

        {/* Login Card */}
        <div className="bg-[#111c30]/90 backdrop-blur-xl border border-slate-800/90 rounded-2xl p-6 sm:p-8 shadow-2xl shadow-black/40">
          
          {/* Lockout Sentinel Banner */}
          {isLockedOut ? (
            <div className="mb-5 p-3.5 bg-rose-500/15 border border-rose-500/40 rounded-xl text-rose-200 text-xs space-y-2 animate-in fade-in">
              <div className="flex items-center gap-2 font-bold text-rose-400">
                <ShieldAlert className="w-4 h-4 shrink-0 text-rose-400 animate-pulse" />
                <span>Account Temporarily Locked</span>
              </div>
              <p className="text-[11px] text-rose-300/90 leading-relaxed">
                5 consecutive failed authentication attempts were detected. Login submissions are temporarily disabled for rate-limiting protection.
              </p>
              <div className="flex items-center gap-1.5 pt-1 text-[11px] font-mono font-semibold text-rose-200">
                <Clock className="w-3.5 h-3.5 text-rose-400" />
                <span>Unlock timer: <strong>{secondsRemaining}s</strong> remaining</span>
              </div>
            </div>
          ) : failedAttempts > 2 ? (
            <div className="mb-4 p-2.5 bg-amber-500/15 border border-amber-500/30 rounded-xl text-amber-200 text-xs flex items-center gap-2 animate-in fade-in">
              <AlertTriangle className="w-4 h-4 shrink-0 text-amber-400" />
              <span>Warning: {failedAttempts}/5 failed attempts. Rate-limit lockout imminent.</span>
            </div>
          ) : null}

          {authError && !isLockedOut && (
            <div className="mb-4 p-3 bg-rose-500/10 border border-rose-500/30 rounded-xl text-rose-300 text-xs flex items-center gap-2 animate-in fade-in">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
              <span>{authError}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                Email Address or Username
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  required
                  disabled={isLockedOut}
                  value={identifier}
                  onChange={(e) => {
                    setIdentifier(e.target.value)
                    if (authError) setAuthError('')
                  }}
                  className={`w-full pl-10 pr-4 py-2.5 rounded-xl bg-[#0b1424] border border-slate-700 text-white placeholder-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all ${
                    isLockedOut ? 'opacity-50 cursor-not-allowed' : ''
                  }`}
                  placeholder="Enter your email or username"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider">
                  Password
                </label>
                <button 
                  type="button"
                  onClick={() => { 
                    alert('Please contact your platform administrator or institutional IT department to reset your password.') 
                  }} 
                  className="text-[11px] text-blue-400 hover:underline cursor-pointer"
                >
                  Forgot password?
                </button>
              </div>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  disabled={isLockedOut}
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value)
                    if (authError) setAuthError('')
                  }}
                  className={`w-full pl-10 pr-10 py-2.5 rounded-xl bg-[#0b1424] border border-slate-700 text-white placeholder-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all ${
                    isLockedOut ? 'opacity-50 cursor-not-allowed' : ''
                  }`}
                  placeholder="Enter your password"
                />
                <button
                  type="button"
                  disabled={isLockedOut}
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white transition-colors cursor-pointer"
                  title={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between text-xs text-slate-400 pt-1">
              <label className="flex items-center gap-2 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  disabled={isLockedOut}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="w-4 h-4 rounded bg-[#0b1424] border-slate-700 text-blue-600 focus:ring-0"
                />
                <span>Remember session</span>
              </label>
            </div>

            <button
              type="submit"
              disabled={isLoading || isLockedOut}
              className={`w-full py-3 rounded-xl font-bold text-sm text-white bg-blue-600 hover:bg-blue-500 shadow-lg shadow-blue-600/30 transition-all flex items-center justify-center gap-2 cursor-pointer ${
                isLoading || isLockedOut ? 'opacity-70 cursor-not-allowed' : 'active:scale-[0.99]'
              }`}
            >
              {isLoading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
              ) : isLockedOut ? (
                <>
                  <ShieldAlert className="w-4 h-4 text-rose-300" />
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
        </div>
      </div>
    </div>
  )
}

export default LoginPage
