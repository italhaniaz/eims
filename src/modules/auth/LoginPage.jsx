import React, { useState } from 'react'
import { 
  Building2, 
  Lock, 
  Mail, 
  Eye, 
  EyeOff, 
  ArrowRight,
  Database,
  AlertCircle
} from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import { isSupabaseConfigured } from '../../services/supabaseClient'

export const LoginPage = () => {
  const { login } = useAuth()
  const [identifier, setIdentifier] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [rememberMe, setRememberMe] = useState(true)
  const [authError, setAuthError] = useState('')

  const handleSubmit = (e) => {
    e.preventDefault()
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

      if (isSuperadmin) {
        login('superadmin', id.includes('@') ? id : 'admin@schoolms.com')
      } else if (isInstituteAdmin) {
        login('institute_admin', id.includes('@') ? id : 'admin.beacon@sms.edu')
      } else if (pass === 'admin123' || pass === 'admin') {
        // Fallback for admin credentials
        login('superadmin', id)
      } else if (pass === 'institute123') {
        // Fallback for institute credentials
        login('institute_admin', id)
      } else {
        setAuthError('Invalid email/username or password. Please verify your credentials.')
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
            School Management System
          </h1>
          <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
            Enterprise Multi-Campus Administration & Academic Operations Portal
          </p>
        </div>

        {/* Clean Executive Login Card */}
        <div className="bg-[#141f36]/95 backdrop-blur-xl border border-slate-700/70 rounded-2xl p-6 sm:p-8 shadow-2xl">
          <div className="mb-6">
            <h2 className="text-lg font-bold text-white tracking-tight">Account Login</h2>
            <p className="text-xs text-slate-400 mt-0.5">Enter your credentials to access your administrative workspace</p>
          </div>

          {authError && (
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
                  value={identifier}
                  onChange={(e) => {
                    setIdentifier(e.target.value)
                    if (authError) setAuthError('')
                  }}
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[#0b1424] border border-slate-700 text-white placeholder-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  placeholder="Enter email or username"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider">
                  Password
                </label>
                <a 
                  href="#forgot" 
                  onClick={(e) => { 
                    e.preventDefault()
                    alert('Please contact your System Administrator to reset your credentials.') 
                  }} 
                  className="text-[11px] text-blue-400 hover:underline"
                >
                  Forgot password?
                </a>
              </div>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value)
                    if (authError) setAuthError('')
                  }}
                  className="w-full pl-10 pr-10 py-2.5 rounded-xl bg-[#0b1424] border border-slate-700 text-white placeholder-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  placeholder="Enter password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white transition-colors"
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
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="w-4 h-4 rounded bg-[#0b1424] border-slate-700 text-blue-600 focus:ring-0"
                />
                <span>Remember session</span>
              </label>
              <span className="text-[11px] text-slate-500 font-mono">v1.0.0 Production</span>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className={`w-full py-3 rounded-xl font-bold text-sm text-white bg-blue-600 hover:bg-blue-500 shadow-lg shadow-blue-600/30 transition-all flex items-center justify-center gap-2 ${
                isLoading ? 'opacity-70 cursor-not-allowed' : 'active:scale-[0.99]'
              }`}
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
        </div>

        {/* Footer info & Supabase status */}
        <div className="text-center text-xs text-slate-500 flex items-center justify-center gap-2">
          <Database className={`w-3.5 h-3.5 ${isSupabaseConfigured ? 'text-emerald-400' : 'text-blue-400'}`} />
          <span>
            {isSupabaseConfigured 
              ? 'Backend: Connected to Supabase Database' 
              : 'Backend: Supabase Ready (Fast Persistent Storage Mode)'}
          </span>
        </div>
      </div>
    </div>
  )
}

export default LoginPage
