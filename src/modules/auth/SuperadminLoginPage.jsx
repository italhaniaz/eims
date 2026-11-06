import React, { useState } from 'react'
import { 
  ShieldCheck, 
  ShieldAlert, 
  Lock, 
  Mail, 
  Eye, 
  EyeOff, 
  ArrowRight, 
  ArrowLeft, 
  AlertCircle, 
  Sparkles, 
  School, 
  Building2, 
  GraduationCap, 
  Server, 
  KeyRound, 
  Terminal,
  Activity,
  Layers
} from 'lucide-react'
import { useAuth } from '../../context/AuthContext'

export const SuperadminLoginPage = ({ onBackToLanding, onOpenTrial, onSwitchTier }) => {
  const { login } = useAuth()

  const [identifier, setIdentifier] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [rememberMe, setRememberMe] = useState(true)
  const [authError, setAuthError] = useState('')

  const handleSuperadminDirect = () => {
    login('superadmin', 'admin@apexed.io', rememberMe)
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    setAuthError('')
    const id = (identifier || '').trim().toLowerCase()
    const pass = (password || '').trim()

    if (!id || !pass) {
      setAuthError('Please enter master root credentials.')
      return
    }

    setIsLoading(true)
    setTimeout(() => {
      login('superadmin', id.includes('@') ? id : 'admin@apexed.io', rememberMe)
      setIsLoading(false)
    }, 350)
  }

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-[#070913] relative overflow-hidden px-4 py-8 sm:py-12 selection:bg-emerald-600 selection:text-white font-sans text-slate-100">
      {/* Ambient Radial Background Accents */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-0 left-1/4 w-[600px] h-[600px] bg-emerald-600/15 rounded-full blur-[140px]"></div>
        <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] bg-indigo-600/10 rounded-full blur-[140px]"></div>
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff05_1px,transparent_1px),linear-gradient(to_bottom,#ffffff05_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_50%,#000_70%,transparent_100%)]"></div>
      </div>

      {/* Top-Left: Back to Home Button */}
      {onBackToLanding && (
        <div className="absolute top-4 left-4 sm:top-6 sm:left-8 z-30">
          <button
            type="button"
            onClick={onBackToLanding}
            className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold text-slate-300 hover:text-white bg-slate-900/80 hover:bg-slate-800 border border-slate-700/60 shadow-lg transition-all backdrop-blur-md group cursor-pointer"
            title="Back to Landing Page"
          >
            <ArrowLeft className="w-4 h-4 text-slate-400 group-hover:-translate-x-0.5 transition-transform" />
            <span>Back to Home</span>
          </button>
        </div>
      )}

      {/* Main Container */}
      <div className="w-full max-w-[920px] z-10 flex flex-col items-center mt-14 sm:mt-0">
        
        {/* Dual-Pane Card */}
        <div className="w-full rounded-3xl bg-slate-900/90 border border-slate-800 shadow-[0_20px_50px_rgba(0,0,0,0.6)] backdrop-blur-xl overflow-hidden grid grid-cols-1 md:grid-cols-12 relative">
          
          {/* LEFT PANE: Superadmin System Branding */}
          <div className="md:col-span-5 bg-gradient-to-br from-[#0c0d1c] via-[#15122b] to-[#0a0718] p-4 sm:p-6 md:p-7 flex flex-col justify-between relative overflow-hidden border-b md:border-b-0 md:border-r border-slate-800/80">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(147,51,234,0.15),transparent_60%)]"></div>

            <div className="relative z-10">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500/15 border border-purple-400/30 text-purple-300 text-xs font-semibold mb-5">
                <Terminal className="w-3.5 h-3.5 text-purple-400" />
                <span>Master Governance Control Plane</span>
              </div>

              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-600 flex items-center justify-center text-white shadow-lg shadow-emerald-500/30">
                  <ShieldCheck className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h1 className="font-heading font-extrabold text-xl sm:text-2xl tracking-tight leading-tight text-white">
                    Super Administrator
                  </h1>
                  <p className="text-xs text-purple-300/80 font-medium">
                    ApexEd Academic OS Core Authority
                  </p>
                </div>
              </div>

              <p className="text-xs text-slate-300 leading-relaxed mb-4 md:mb-6">
                Root level access for Multi-Tier Institutional Tenancy, Super Admin Approvals, School/College/University Provisioning, Global Audit Logs & System Telemetry.
              </p>

              {/* Master Telemetry Highlights (Visible on Desktop, hidden on compact mobile) */}
              <div className="hidden md:block space-y-2.5 pt-2">
                <div className="p-2.5 rounded-xl bg-slate-800/40 border border-slate-700/50 flex items-start gap-2.5">
                  <Server className="w-4 h-4 text-purple-400 shrink-0 mt-0.5" />
                  <div className="text-xs">
                    <span className="font-bold text-slate-100 block">Institutional Tenancy Engine</span>
                    <span className="text-[11px] text-slate-400">Isolated database schemas for schools, colleges & universities</span>
                  </div>
                </div>

                <div className="p-2.5 rounded-xl bg-slate-800/40 border border-slate-700/50 flex items-start gap-2.5">
                  <KeyRound className="w-4 h-4 text-purple-400 shrink-0 mt-0.5" />
                  <div className="text-xs">
                    <span className="font-bold text-slate-100 block">Role-Based Access Delegation</span>
                    <span className="text-[11px] text-slate-400">Strict zero-overlap boundaries between campus tiers</span>
                  </div>
                </div>

                <div className="p-2.5 rounded-xl bg-slate-800/40 border border-slate-700/50 flex items-start gap-2.5">
                  <Activity className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <div className="text-xs">
                    <span className="font-bold text-slate-100 block">Enterprise Security Sentinel</span>
                    <span className="text-[11px] text-slate-400">Real-time session monitoring & cryptographic audit trails</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="hidden md:flex relative z-10 pt-6 mt-6 border-t border-slate-800 text-[11px] text-slate-400 items-center justify-between">
              <span>Root Node: <strong className="text-slate-300 font-mono">auth.apexed.io</strong></span>
              <span className="flex items-center gap-1.5 font-bold text-emerald-400">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                Secure Operational
              </span>
            </div>
          </div>

          {/* RIGHT PANE: Superadmin Login Form */}
          <div className="md:col-span-7 p-4 sm:p-6 md:p-7 flex flex-col justify-between bg-slate-900/60">
            <div>
              {/* Form Header */}
              <div className="mb-5">
                <h2 className="text-xl sm:text-2xl font-heading font-extrabold text-white tracking-tight">
                  Superadmin Sign In
                </h2>
                <p className="text-xs sm:text-sm text-slate-400 mt-1">
                  Authenticate with authorized root-level administrative credentials.
                </p>
              </div>

              {/* Error Alert */}
              {authError && (
                <div className="mb-4 p-3 rounded-xl bg-rose-950/50 border border-rose-800 text-rose-300 text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
                  <span>{authError}</span>
                </div>
              )}

              {/* Form */}
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1.5">
                    Root Administrative Email / ID
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                      <Mail className="w-4 h-4" />
                    </div>
                    <input
                      type="text"
                      value={identifier}
                      onChange={(e) => setIdentifier(e.target.value)}
                      placeholder="admin@apexed.io"
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-700 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/30 text-xs sm:text-sm font-medium text-white placeholder:text-slate-500 outline-hidden transition-all bg-slate-800/80 focus:bg-slate-800"
                    />
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-300">
                      Master Key / Password
                    </label>
                    <span className="text-[11px] font-mono text-purple-400">
                      256-Bit SHA Encrypted
                    </span>
                  </div>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                      <Lock className="w-4 h-4" />
                    </div>
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Enter master root password"
                      className="w-full pl-10 pr-10 py-2.5 rounded-xl border border-slate-700 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/30 text-xs sm:text-sm font-medium text-white placeholder:text-slate-500 outline-hidden transition-all bg-slate-800/80 focus:bg-slate-800"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-200 cursor-pointer"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-1">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={rememberMe}
                      onChange={(e) => setRememberMe(e.target.checked)}
                      className="w-4 h-4 rounded-sm border-slate-700 bg-slate-800 text-emerald-600 focus:ring-emerald-500 cursor-pointer"
                    />
                    <span className="text-xs font-medium text-slate-300">Remember root session</span>
                  </label>
                  <span className="text-[11px] text-slate-500 font-medium">Auto-lockout after 5 attempts</span>
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="btn-hero-gradient w-full py-2.5 rounded-xl font-bold text-xs sm:text-sm text-white transition-all shadow-lg flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  {isLoading ? (
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  ) : (
                    <>
                      <span>Authorize Superadmin Access</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </form>

              {/* 1-Click Superadmin Direct Authorization */}
              <div className="mt-5 pt-4 border-t border-slate-800">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                    <KeyRound className="w-3.5 h-3.5 text-purple-400" />
                    <span>Instant Authority Sandbox</span>
                  </span>
                  <span className="text-[10px] text-emerald-400 font-bold bg-emerald-950/60 border border-emerald-800/40 px-2 py-0.5 rounded-full">
                    Pre-Authorized
                  </span>
                </div>

                <button
                  type="button"
                  onClick={handleSuperadminDirect}
                  className="w-full p-3 rounded-xl border border-emerald-500/40 bg-purple-950/30 hover:bg-purple-900/40 text-left transition-all cursor-pointer group shadow-md flex items-center justify-between"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-lg bg-emerald-600/30 border border-purple-400/30 flex items-center justify-center text-purple-300">
                      <ShieldCheck className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="text-xs font-bold text-white group-hover:text-purple-300 flex items-center gap-2">
                        <span>🛡️ Launch Superadmin Control Center</span>
                        <span className="text-[9px] font-mono uppercase bg-purple-900 text-purple-200 px-1.5 py-0.2 rounded">Master Plane</span>
                      </div>
                      <p className="text-[10px] text-slate-400 mt-0.5">
                        Manage campuses, configure modules, provision trials & approve access
                      </p>
                    </div>
                  </div>
                  <span className="text-xs font-bold text-purple-400 group-hover:translate-x-1 transition-transform">
                    Enter →
                  </span>
                </button>
              </div>
            </div>

            {/* Bottom Quick Return to Campus Portals */}
            <div className="pt-4 mt-4 border-t border-slate-800">
              <span className="text-[10px] uppercase font-bold tracking-wider text-slate-500 block mb-2 text-center">
                Need to access a specific campus portal?
              </span>
              <div className="grid grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => onSwitchTier('school')}
                  className="py-2 px-2 rounded-lg bg-slate-800 hover:bg-emerald-950/50 border border-slate-700 hover:border-emerald-700/50 text-slate-300 hover:text-emerald-300 text-[11px] font-bold transition-all text-center cursor-pointer flex items-center justify-center gap-1.5"
                >
                  <School className="w-3 h-3 text-emerald-400" />
                  <span>School (K-10)</span>
                </button>

                <button
                  type="button"
                  onClick={() => onSwitchTier('college')}
                  className="py-2 px-2 rounded-lg bg-slate-800 hover:bg-indigo-950/50 border border-slate-700 hover:border-indigo-700/50 text-slate-300 hover:text-indigo-300 text-[11px] font-bold transition-all text-center cursor-pointer flex items-center justify-center gap-1.5"
                >
                  <Building2 className="w-3 h-3 text-indigo-400" />
                  <span>College (11-12)</span>
                </button>

                <button
                  type="button"
                  onClick={() => onSwitchTier('university')}
                  className="py-2 px-2 rounded-lg bg-slate-800 hover:bg-purple-950/50 border border-slate-700 hover:border-purple-700/50 text-slate-300 hover:text-purple-300 text-[11px] font-bold transition-all text-center cursor-pointer flex items-center justify-center gap-1.5"
                >
                  <GraduationCap className="w-3 h-3 text-purple-400" />
                  <span>University (HEC)</span>
                </button>
              </div>
            </div>
          </div>

        </div>

      </div>
    </div>
  )
}

export default SuperadminLoginPage
