import React from 'react'
import { 
  Laptop, 
  Sparkles, 
  ArrowLeft, 
  ArrowRight, 
  Lock, 
  CheckCircle2, 
  ShieldCheck,
  Clock
} from 'lucide-react'

export const DemoComingSoonPage = ({ onBackToLanding, onNavigateToLogin, onOpenTrial }) => {
  return (
    <div className="min-h-screen w-full bg-[#fcfaff] text-slate-900 font-sans selection:bg-purple-100 selection:text-purple-900 flex flex-col justify-between overflow-x-clip relative">
      
      {/* Top Navbar */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-purple-100/90 shadow-2xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 sm:h-18 flex items-center justify-between gap-4">
          
          {/* Brand Logo */}
          <div 
            onClick={onBackToLanding}
            className="flex items-center gap-2.5 sm:gap-3 cursor-pointer group shrink-0"
          >
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-tr from-purple-700 via-purple-600 to-indigo-600 flex items-center justify-center text-white shadow-sm shadow-purple-500/25 group-hover:scale-105 transition-transform shrink-0">
              <Laptop className="w-5 h-5 stroke-[2.2]" />
            </div>
            <div>
              <div className="flex items-center gap-1.5 sm:gap-2">
                <span className="text-base sm:text-lg font-extrabold font-heading tracking-tight text-slate-900">
                  Apex<span className="text-purple-600">Ed</span>
                </span>
                <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-[#f5eeff] text-purple-700 border border-purple-200">
                  ERP v2.4
                </span>
              </div>
              <p className="text-[11px] text-slate-500 hidden sm:block -mt-0.5">
                Educational Management Operating System
              </p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2.5">
            <button
              type="button"
              onClick={onBackToLanding}
              className="px-3.5 py-2 rounded-xl text-xs font-bold text-slate-700 hover:text-purple-700 hover:bg-[#f5eeff] border border-slate-200 hover:border-purple-200 transition-all cursor-pointer inline-flex items-center gap-1.5"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back to Home</span>
            </button>

            <button
              type="button"
              onClick={onNavigateToLogin}
              className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-extrabold text-xs shadow-sm shadow-purple-600/25 transition-all hover:scale-[1.02] active:scale-95 cursor-pointer inline-flex items-center gap-1.5"
            >
              <Lock className="w-3.5 h-3.5" />
              <span>Portal Sign In</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Body */}
      <main className="flex-1 flex items-center justify-center p-4 sm:p-6 lg:p-8 relative">
        {/* Soft Ambient Radial Accents */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-purple-200/40 rounded-full blur-3xl pointer-events-none -z-10" />
        <div className="absolute bottom-10 right-10 w-72 h-72 bg-indigo-100/40 rounded-full blur-3xl pointer-events-none -z-10" />

        <div className="max-w-2xl w-full text-center space-y-6">
          
          {/* Status Eyebrow Badge */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-amber-50 text-amber-800 border border-amber-200 text-xs font-bold shadow-2xs animate-in fade-in">
            <Clock className="w-3.5 h-3.5 text-amber-600 animate-spin [animation-duration:8s]" />
            <span>Interactive Demo Sandbox · In Active Preparation</span>
          </div>

          {/* Central Hero Icon */}
          <div className="relative w-24 h-24 sm:w-28 sm:h-28 mx-auto flex items-center justify-center">
            <div className="absolute inset-0 bg-gradient-to-tr from-purple-500/20 to-indigo-500/20 rounded-3xl blur-xl" />
            <div className="relative w-full h-full rounded-3xl bg-white border-2 border-purple-200/80 shadow-xl flex items-center justify-center text-purple-600 group">
              <Laptop className="w-12 h-12 sm:w-14 sm:h-14 stroke-[1.8] text-purple-600" />
              <span className="absolute -top-1 -right-1 flex h-4 w-4">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-purple-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-4 w-4 bg-purple-600 border-2 border-white" />
              </span>
            </div>
          </div>

          {/* Headline */}
          <div className="space-y-2.5">
            <h1 className="text-2xl sm:text-4xl font-extrabold text-slate-900 font-heading tracking-tight">
              Live Demo Sandbox is <br />
              <span className="bg-gradient-to-r from-purple-700 via-purple-600 to-indigo-600 bg-clip-text text-transparent">
                Coming Very Soon!
              </span>
            </h1>
            <p className="text-xs sm:text-sm text-slate-600 max-w-lg mx-auto leading-relaxed">
              Currently, this 1-click live demo sandbox is under active development and preparation. Our engineering team is finalizing and designing the other campus views, role-based workflows, and academic streams so you can experience an authentic, production-grade test environment.
            </p>
          </div>

          {/* Information Notice Card */}
          <div className="p-4 sm:p-5 rounded-2xl bg-white border border-purple-100/90 shadow-sm text-left space-y-3">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-purple-600 shrink-0" />
              <span className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                Full Evaluation Access is Ready Now
              </span>
            </div>
            <p className="text-xs text-slate-500 leading-relaxed">
              While the interactive sandbox pages are being finalized, you can test every single feature (computerized 1Link fee vouchers, exam admit cards, student rosters, and daily attendance) with <strong>100% full access</strong> right now by creating a free trial instance.
            </p>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1">
              <div className="p-2 rounded-xl bg-purple-50/60 border border-purple-100 text-center">
                <span className="text-[10px] font-bold text-purple-700 block">₨ 0 Evaluation</span>
                <span className="text-[9px] text-slate-500">14-Day Free Access</span>
              </div>
              <div className="p-2 rounded-xl bg-purple-50/60 border border-purple-100 text-center">
                <span className="text-[10px] font-bold text-purple-700 block">All Modules</span>
                <span className="text-[9px] text-slate-500">Fees, Exams, Attendance</span>
              </div>
              <div className="p-2 rounded-xl bg-purple-50/60 border border-purple-100 text-center">
                <span className="text-[10px] font-bold text-purple-700 block">Zero Setup Fees</span>
                <span className="text-[9px] text-slate-500">No Credit Card Needed</span>
              </div>
              <div className="p-2 rounded-xl bg-purple-50/60 border border-purple-100 text-center">
                <span className="text-[10px] font-bold text-purple-700 block">Instant Setup</span>
                <span className="text-[9px] text-slate-500">Under 60 Seconds</span>
              </div>
            </div>
          </div>

          {/* Action CTAs */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
            <button
              type="button"
              onClick={onBackToLanding}
              className="w-full sm:w-auto px-5 py-3 rounded-xl bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 font-bold text-xs sm:text-sm shadow-2xs hover:border-slate-300 transition-all cursor-pointer flex items-center justify-center gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Return to Home Page</span>
            </button>

            <button
              type="button"
              onClick={onOpenTrial || onBackToLanding}
              className="w-full sm:w-auto px-6 py-3 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs sm:text-sm shadow-md shadow-purple-600/25 transition-all hover:scale-[1.02] active:scale-95 cursor-pointer flex items-center justify-center gap-2"
            >
              <Sparkles className="w-4 h-4 text-purple-200" />
              <span>Launch 14-Day Free Evaluation (₨ 0)</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

        </div>
      </main>

      {/* Footer */}
      <footer className="py-5 border-t border-purple-100/80 bg-white/70 text-center text-xs text-slate-400">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>© 2026 ApexEd Enterprise Platform. All rights reserved.</span>
          <div className="flex items-center gap-1.5 text-[11px] text-slate-500">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
            <span>Secure Multi-Tenant Cloud Architecture</span>
          </div>
        </div>
      </footer>

    </div>
  )
}

export default DemoComingSoonPage
