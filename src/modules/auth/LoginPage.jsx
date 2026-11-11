import React, { useState } from 'react'
import {
  School,
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
  Moon,
  Sun,
  Palette
} from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import { useTheme } from '../../context/ThemeContext'
import ThemeCustomizerModal from '../../components/common/ThemeCustomizerModal'

export const LoginPage = ({ onBackToLanding, onOpenTrial }) => {
  const { authenticateCredentials } = useAuth()
  const { isDark, toggleThemeMode, preset, activeThemeConfig } = useTheme()
  const [isThemeModalOpen, setIsThemeModalOpen] = useState(false)

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [rememberMe, setRememberMe] = useState(true)
  const [authError, setAuthError] = useState('')

  const handleSubmit = async (e) => {
    e.preventDefault()
    setAuthError('')

    if (!email.trim() || !password.trim()) {
      setAuthError('Please enter both your email address and password.')
      return
    }

    setIsLoading(true)
    try {
      const result = await authenticateCredentials(email, password, rememberMe)
      if (!result?.success) {
        setAuthError(result?.message || 'Invalid email or password.')
      }
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-bg relative overflow-hidden px-4 py-8 sm:py-12 selection:bg-primary selection:text-white font-sans">
      {/* Ambient Radial Background Accents */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-0 -left-20 w-[500px] h-[500px] bg-primary/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 -right-20 w-[500px] h-[500px] bg-secondary/10 rounded-full blur-3xl"></div>
      </div>

      {/* Top-Left: Back to Landing Page */}
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

      {/* Top-Right: Theme Studio & Dark Mode Controls */}
      <div className="fixed top-4 right-4 z-40 flex items-center gap-2">
        <button
          type="button"
          onClick={() => setIsThemeModalOpen(true)}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold text-slate-700 dark:text-slate-200 bg-white/90 dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow transition-all backdrop-blur-md cursor-pointer hover:scale-105 active:scale-95"
          title="Theme Studio: Customize Design Tokens & Presets"
        >
          <span
            className="w-2.5 h-2.5 rounded-full inline-block shadow-2xs"
            style={{ backgroundColor: activeThemeConfig?.primary || 'var(--primary)' }}
          />
          <Palette className="w-3.5 h-3.5 text-slate-500 dark:text-slate-400" />
          <span className="capitalize hidden sm:inline">{preset}</span>
        </button>

        <button
          type="button"
          onClick={toggleThemeMode}
          className="p-2 rounded-xl text-slate-700 dark:text-slate-200 bg-white/90 dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow transition-all backdrop-blur-md cursor-pointer hover:scale-105 active:scale-95"
          title={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
        >
          {isDark ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-indigo-600" />}
        </button>
      </div>

      {/* Main Container */}
      <div className="w-full max-w-[900px] z-10 flex flex-col items-center mt-14 sm:mt-0">
        {/* Dual-Pane Card */}
        <div className="w-full rounded-3xl bg-surface border border-border shadow-soft overflow-hidden grid grid-cols-1 md:grid-cols-12 relative">
          
          {/* LEFT PANE: Unified School SaaS Branding */}
          <div
            className="md:col-span-5 p-5 sm:p-6 md:p-7 flex flex-col justify-between border-b md:border-b-0 md:border-r border-slate-100 dark:border-slate-800 text-white relative overflow-hidden login-hero-pane"
            style={{ background: 'var(--hero-gradient)' }}
          >
            <div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold border shadow-2xs mb-5 self-start bg-white/20 text-white border-white/30 backdrop-blur-sm">
                <Sparkles className="w-3.5 h-3.5 text-white" />
                <span>Unified School Portal</span>
              </div>

              <div className="flex items-center gap-2.5 mb-4">
                <div className="w-13 h-13 rounded-2xl flex items-center justify-center p-2.5 shadow-md bg-white/20 backdrop-blur-md border border-white/30 text-white">
                  <School className="w-8 h-8 stroke-[2.2]" />
                </div>
                <div className="w-4 h-4 rounded-full border-2 border-white/40 bg-white flex items-center justify-center shadow-xs">
                  <div className="w-1.5 h-1.5 rounded-full animate-ping bg-amber-400"></div>
                </div>
              </div>

              <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight font-heading">
                School Management Portal
              </h1>
              <div className="mt-1 flex items-center gap-2">
                <span className="text-xs font-bold text-white/90">Single Sign-In Portal</span>
              </div>
              <p className="text-xs sm:text-sm text-white/85 leading-relaxed mt-2 mb-4 md:mb-5">
                Complete School Academic Operating System for Primary, Middle, Matriculation &amp; Cambridge O-Level institutions.
              </p>

              {/* Feature Highlights */}
              <div className="hidden md:block space-y-2">
                <div className="flex items-center gap-3 p-2.5 rounded-2xl bg-white/15 backdrop-blur-md border border-white/20 text-white shadow-2xs">
                  <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0 bg-white/20 text-white">
                    <CalendarCheck className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-white">Daily Attendance &amp; Absentee Alerts</h4>
                    <p className="text-[11px] text-white/80 leading-tight">1-click daily roll call &amp; parent SMS notifications.</p>
                  </div>
                </div>

                <div className="flex items-center gap-3 p-2.5 rounded-2xl bg-white/15 backdrop-blur-md border border-white/20 text-white shadow-2xs">
                  <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0 bg-white/20 text-white">
                    <BookOpen className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-white">Classes, Syllabus &amp; Timetable</h4>
                    <p className="text-[11px] text-white/80 leading-tight">Manage Playgroup to Grade 10 sections, teachers &amp; exams.</p>
                  </div>
                </div>

                <div className="flex items-center gap-3 p-2.5 rounded-2xl bg-white/15 backdrop-blur-md border border-white/20 text-white shadow-2xs">
                  <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0 bg-white/20 text-white">
                    <Receipt className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-white">3-Part Bank Challan &amp; Fee Accounts</h4>
                    <p className="text-[11px] text-white/80 leading-tight">Monthly fee vouchers, reconciliations &amp; campus ledgers.</p>
                  </div>
                </div>

                <div className="flex items-center gap-3 p-2.5 rounded-2xl bg-white/15 backdrop-blur-md border border-white/20 text-white shadow-2xs">
                  <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0 bg-white/20 text-white">
                    <Award className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-white">School Leaving Certificates (SLC)</h4>
                    <p className="text-[11px] text-white/80 leading-tight">Instant printable SLC, ID cards &amp; report cards.</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="hidden md:flex pt-4 mt-4 border-t border-white/20 items-center justify-between text-[11px] text-white/80">
              <span className="flex items-center gap-1.5 font-medium">
                <span className="w-2 h-2 rounded-full animate-pulse bg-emerald-400"></span>
                <span>Academic Session: 2026-2027</span>
              </span>
              <span className="font-semibold text-white">School ERP v3.0</span>
            </div>
          </div>

          {/* RIGHT PANE: Pure Single Email + Password Login Form */}
          <div className="md:col-span-7 p-6 sm:p-9 flex flex-col justify-center bg-surface text-text">
            <div>
              <div className="mb-6">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl sm:text-2xl font-bold text-text tracking-tight">
                    Sign In to EIMS
                  </h2>
                  <span className="text-[10px] font-extrabold uppercase px-2.5 py-0.5 rounded-full border bg-primary-soft text-primary border-primary/20">
                    Unified Access
                  </span>
                </div>
                <p className="text-xs sm:text-sm text-muted mt-1.5">
                  Enter your email address and password to sign in to your assigned portal.
                </p>
              </div>

              {authError && (
                <div className="mb-5 p-3.5 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 flex items-start gap-2.5 text-rose-800 dark:text-rose-200 text-xs font-medium">
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-rose-600 dark:text-rose-400" />
                  <span>{authError}</span>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-[11px] font-bold text-muted uppercase tracking-wider mb-1.5">
                    Email Address
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-muted" />
                    <input
                      type="text"
                      required
                      autoFocus
                      autoComplete="email"
                      value={email}
                      onChange={(e) => {
                        setEmail(e.target.value)
                        if (authError) setAuthError('')
                      }}
                      className="w-full pl-10 pr-4 py-3 rounded-xl bg-bg border border-border text-text placeholder-muted text-xs sm:text-sm focus:outline-none focus:ring-4 focus:ring-primary/15 focus:border-primary transition-all font-medium"
                      placeholder="Enter your email address"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-muted uppercase tracking-wider mb-1.5">
                    Password
                  </label>
                  <div className="relative">
                    <Lock className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-muted" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      autoComplete="current-password"
                      value={password}
                      onChange={(e) => {
                        setPassword(e.target.value)
                        if (authError) setAuthError('')
                      }}
                      className="w-full pl-10 pr-10 py-3 rounded-xl bg-bg border border-border text-text placeholder-muted text-xs sm:text-sm focus:outline-none focus:ring-4 focus:ring-primary/15 focus:border-primary transition-all"
                      placeholder="Enter your password"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-muted hover:text-text transition-colors cursor-pointer"
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
                      className="w-4 h-4 rounded border-border text-primary focus:ring-primary accent-indigo-600 cursor-pointer"
                    />
                    <span className="text-text font-medium">Keep me signed in</span>
                  </label>
                  <span className="text-muted font-medium">Encrypted Session</span>
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="btn-hero-gradient w-full py-3.5 rounded-xl font-bold text-xs sm:text-sm text-white shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-[0.99] disabled:opacity-50"
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

            {/* Bottom Registration & Trial Row */}
            <div className="pt-5 mt-6 border-t border-border">
              <button
                type="button"
                onClick={() => {
                  if (onOpenTrial) onOpenTrial()
                  else if (onBackToLanding) onBackToLanding()
                }}
                className="w-full py-2.5 rounded-xl border border-primary/25 bg-primary-soft/60 hover:bg-primary-soft text-primary text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer shadow-2xs group"
              >
                <School className="w-4 h-4 group-hover:scale-110 transition-transform" />
                <span>Register New School / Start 14-Day Free Trial</span>
                <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
              </button>
            </div>
          </div>

        </div>
      </div>

      <ThemeCustomizerModal
        isOpen={isThemeModalOpen}
        onClose={() => setIsThemeModalOpen(false)}
      />
    </div>
  )
}

export default LoginPage
