import React, { useState } from 'react'
import { Eye, EyeOff, AlertCircle } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'

export const LoginPage = ({ onBackToLanding }) => {
  const { authenticateCredentials } = useAuth()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')

    const cleanEmail = email.trim()
    const cleanPassword = password

    if (!cleanEmail || !cleanPassword) {
      setError('Please enter both email and password.')
      return
    }

    setIsLoading(true)
    try {
      const result = await authenticateCredentials(cleanEmail, cleanPassword, true)
      if (!result?.success) {
        setError(result?.message || 'Invalid email or password.')
      }
    } catch (_) {
      setError('Unable to verify credentials. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen w-full flex flex-col items-center justify-center bg-slate-50 px-4 py-8 font-sans">
      <div className="w-full max-w-md bg-white rounded-2xl border border-slate-200 shadow-sm p-7 sm:p-8">
        <div className="mb-6">
          <h1 className="text-2xl font-semibold text-slate-900 tracking-tight">
            Sign In
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Enter your email and password to access your account.
          </p>
        </div>

        {error && (
          <div
            role="alert"
            className="mb-5 p-3.5 rounded-xl bg-red-50 border border-red-200 flex items-start gap-2.5 text-red-700 text-xs sm:text-sm font-medium"
          >
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-red-600" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label
              htmlFor="login-email"
              className="block text-xs font-medium text-slate-700 mb-1.5"
            >
              Email
            </label>
            <input
              id="login-email"
              name="email"
              type="email"
              required
              autoFocus
              autoComplete="email"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value)
                if (error) setError('')
              }}
              placeholder="you@example.com"
              className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-slate-300 text-slate-900 placeholder-slate-400 text-sm focus:outline-none focus:ring-2 focus:ring-slate-900/15 focus:border-slate-900 transition-colors"
            />
          </div>

          <div>
            <label
              htmlFor="login-password"
              className="block text-xs font-medium text-slate-700 mb-1.5"
            >
              Password
            </label>
            <div className="relative">
              <input
                id="login-password"
                name="password"
                type={showPassword ? 'text' : 'password'}
                required
                autoComplete="current-password"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value)
                  if (error) setError('')
                }}
                placeholder="Enter your password"
                className="w-full pl-3.5 pr-10 py-2.5 rounded-xl bg-white border border-slate-300 text-slate-900 placeholder-slate-400 text-sm focus:outline-none focus:ring-2 focus:ring-slate-900/15 focus:border-slate-900 transition-colors"
              />
              <button
                type="button"
                onClick={() => setShowPassword(prev => !prev)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 transition-colors cursor-pointer"
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-2.5 px-4 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-sm font-medium transition-colors cursor-pointer disabled:opacity-50"
          >
            {isLoading ? 'Signing in...' : 'Login'}
          </button>
        </form>

        {/* Quick Demo Access Pills */}
        <div className="mt-5 pt-4 border-t border-slate-100">
          <span className="block text-[11px] font-semibold text-slate-400 uppercase tracking-wider text-center mb-2.5">
            Quick Demo Portals
          </span>
          <div className="grid grid-cols-3 gap-2">
            <button
              type="button"
              onClick={() => {
                setEmail('admin@schoolms.com')
                setPassword('password123')
              }}
              className="px-2 py-1.5 rounded-lg border border-purple-200 bg-purple-50/70 hover:bg-purple-100 text-purple-700 text-xs font-semibold transition-colors text-center cursor-pointer"
            >
              Super Admin
            </button>
            <button
              type="button"
              onClick={() => {
                setEmail('admin.school@cityschool.edu')
                setPassword('password123')
              }}
              className="px-2 py-1.5 rounded-lg border border-blue-200 bg-blue-50/70 hover:bg-blue-100 text-blue-700 text-xs font-semibold transition-colors text-center cursor-pointer"
            >
              School Admin
            </button>
            <button
              type="button"
              onClick={() => {
                setEmail('teacher@schoolms.com')
                setPassword('password123')
              }}
              className="px-2 py-1.5 rounded-lg border border-emerald-200 bg-emerald-50/70 hover:bg-emerald-100 text-emerald-700 text-xs font-semibold transition-colors text-center cursor-pointer"
            >
              Teacher
            </button>
          </div>
        </div>

        {onBackToLanding && (
          <div className="mt-6 pt-4 border-t border-slate-100 text-center">
            <button
              type="button"
              onClick={onBackToLanding}
              className="text-xs font-medium text-slate-500 hover:text-slate-900 transition-colors cursor-pointer"
            >
              &larr; Back to Home
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

export default LoginPage
