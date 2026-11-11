import React, { useState } from 'react'
import {
  BookOpen,
  GraduationCap,
  Users,
  Calendar,
  CheckCircle2,
  Clock,
  LogOut,
  School,
  Building2,
  ChevronRight,
  Menu,
  X,
  Sparkles,
  Camera,
  Layers,
  FileSpreadsheet
} from 'lucide-react'
import { useAuth } from '../../context/AuthContext'

export default function TeacherPortalView() {
  const { user, logout } = useAuth()
  const [activeTab, setActiveTab] = useState('dashboard')
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  const teacherName = user?.name || 'Prof. Tariq Mehmood'
  const schoolName = user?.instituteName || 'City School Model Town Campus'
  const teacherRole = user?.roleTitle || 'Faculty / Subject Teacher'

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: BookOpen, status: 'Active' },
    { id: 'classes', label: 'My Classes', icon: GraduationCap, status: 'Ready for UI' },
    { id: 'attendance', label: 'Daily Attendance', icon: CheckCircle2, status: 'Ready for UI' },
    { id: 'exams', label: 'Exam Marks', icon: FileSpreadsheet, status: 'Ready for UI' },
    { id: 'timetable', label: 'Weekly Timetable', icon: Clock, status: 'Ready for UI' }
  ]

  return (
    <div className="flex h-screen w-full overflow-hidden bg-[#f8fafc] dark:bg-[#0B1020] text-slate-800 dark:text-slate-100 font-sans">
      {/* Mobile Backdrop */}
      {isMobileMenuOpen && (
        <div
          onClick={() => setIsMobileMenuOpen(false)}
          className="fixed inset-0 bg-slate-950/70 backdrop-blur-xs z-40 lg:hidden"
        />
      )}

      {/* ========================================================= */}
      {/* LEFT SIDEBAR: DARK NAVY THEME (100% SYSTEM CONSISTENT) */}
      {/* ========================================================= */}
      <aside
        className={`
          fixed lg:static top-0 bottom-0 left-0 z-50
          ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
          w-64 sm:w-72 h-full max-h-screen sidebar-navy bg-[#0B1120] text-slate-300 border-r border-slate-800/80 flex flex-col
          transition-all duration-300 shrink-0 select-none shadow-xl
        `}
      >
        {/* Brand Header */}
        <div className="h-16 min-h-[64px] flex items-center justify-between px-5 border-b border-slate-800/80 bg-[#0B1120] shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-purple-500/15 text-purple-400 border border-purple-500/30 flex items-center justify-center font-bold text-xs shadow-2xs">
              <BookOpen className="w-5 h-5 text-purple-400" />
            </div>
            <div className="flex flex-col min-w-0">
              <span className="text-sm font-extrabold text-white tracking-tight leading-tight truncate">
                Teacher Portal
              </span>
              <span className="text-[10px] text-purple-400 font-bold uppercase tracking-wider truncate">
                Academic Faculty
              </span>
            </div>
          </div>
          <button
            onClick={() => setIsMobileMenuOpen(false)}
            className="lg:hidden text-slate-400 hover:text-white p-1 rounded-lg"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Items */}
        <nav className="flex-1 py-4 px-3 space-y-1.5 overflow-y-auto dark-scroll text-[13.5px]">
          {navItems.map((item) => {
            const Icon = item.icon
            const isActive = activeTab === item.id

            return (
              <button
                key={item.id}
                onClick={() => {
                  setActiveTab(item.id)
                  setIsMobileMenuOpen(false)
                }}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-left text-xs sm:text-sm font-medium transition-all cursor-pointer ${
                  isActive
                    ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-bold shadow-md shadow-purple-600/30'
                    : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
                }`}
              >
                <div className="flex items-center gap-3 min-w-0">
                  <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                  <span className="truncate">{item.label}</span>
                </div>
                {item.status !== 'Active' ? (
                  <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 border border-slate-700">
                    {item.status}
                  </span>
                ) : (
                  <ChevronRight className="w-3.5 h-3.5 text-white/70" />
                )}
              </button>
            )
          })}
        </nav>

        {/* Sign Out Footer */}
        <div className="p-3 border-t border-slate-800/80 bg-[#0B1120]">
          <button
            onClick={logout}
            className="w-full flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 border border-transparent hover:border-rose-500/20 transition-all text-xs font-semibold cursor-pointer group"
          >
            <LogOut className="w-4 h-4 shrink-0 text-slate-400 group-hover:text-rose-400 transition-colors" />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* ========================================================= */}
      {/* MAIN CONTENT AREA */}
      {/* ========================================================= */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top Navbar */}
        <header className="h-16 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 px-4 sm:px-6 flex items-center justify-between shrink-0 shadow-2xs">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsMobileMenuOpen(true)}
              className="lg:hidden p-2 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
            >
              <Menu className="w-5 h-5" />
            </button>
            <div className="flex items-center gap-2 text-xs sm:text-sm font-semibold text-slate-800 dark:text-slate-200">
              <School className="w-4 h-4 text-purple-600 dark:text-purple-400" />
              <span>{schoolName}</span>
            </div>
          </div>

          {/* Right User Badge */}
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-full bg-purple-50 dark:bg-purple-950/60 border border-purple-200 dark:border-purple-800 flex items-center justify-center font-bold text-xs text-purple-700 dark:text-purple-300">
                TM
              </div>
              <div className="hidden sm:flex flex-col text-left">
                <span className="text-xs font-bold text-slate-900 dark:text-white leading-tight">
                  {teacherName}
                </span>
                <span className="text-[10px] text-purple-600 dark:text-purple-400 font-medium">
                  {teacherRole}
                </span>
              </div>
            </div>

            <button
              onClick={logout}
              title="Sign Out"
              className="p-2 rounded-lg text-slate-500 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-slate-800 transition-colors cursor-pointer"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </header>

        {/* Main Body (Scaffold Ready for Screenshots) */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-8 space-y-6">
          {/* Welcome Banner Card */}
          <div className="rounded-2xl bg-gradient-to-r from-purple-700 via-indigo-700 to-blue-700 text-white p-6 sm:p-8 shadow-sm relative overflow-hidden">
            <div className="relative z-10 space-y-2">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/15 text-purple-100 text-xs font-semibold backdrop-blur-xs">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Teacher Portal — Ready for Customization</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
                Welcome, {teacherName}
              </h1>
              <p className="text-purple-100 text-xs sm:text-sm max-w-2xl leading-relaxed">
                Your dedicated Teacher Portal shell and authentication are 100% active and connected. You can log in, switch tabs, and explore the layout.
              </p>
            </div>
            {/* Background design elements */}
            <div className="absolute -right-8 -bottom-10 w-48 h-48 rounded-full bg-white/5 pointer-events-none blur-xl"></div>
          </div>

          {/* Scaffold Notice Card */}
          <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-6 shadow-2xs space-y-4">
            <div className="flex items-start gap-3.5">
              <div className="w-10 h-10 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/60 flex items-center justify-center shrink-0 text-amber-600">
                <Camera className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-base font-bold text-slate-900 dark:text-white">
                  Awaiting Reference Pictures & UI Designs
                </h2>
                <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 mt-1 leading-relaxed">
                  As requested, this portal has been initialized as a clean, modular dummy template without pre-built feature bloat. Please share your reference pictures/screenshots whenever you are ready, and we will build all teacher modules (Classes, Timetable, Daily Attendance, Exam Marks) from scratch to match your vision 100%.
                </p>
              </div>
            </div>
          </div>

          {/* Quick Stat Placeholders */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-5 shadow-2xs">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block mb-1">
                Assigned Classes
              </span>
              <div className="text-xl font-bold text-slate-900 dark:text-white">
                Ready for UI
              </div>
              <span className="text-[11px] text-purple-600 dark:text-purple-400 mt-1 block">Awaiting screenshots</span>
            </div>

            <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-5 shadow-2xs">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block mb-1">
                Daily Attendance
              </span>
              <div className="text-xl font-bold text-slate-900 dark:text-white">
                Ready for UI
              </div>
              <span className="text-[11px] text-purple-600 dark:text-purple-400 mt-1 block">Awaiting screenshots</span>
            </div>

            <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-5 shadow-2xs">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block mb-1">
                Today's Lectures
              </span>
              <div className="text-xl font-bold text-slate-900 dark:text-white">
                Ready for UI
              </div>
              <span className="text-[11px] text-purple-600 dark:text-purple-400 mt-1 block">Awaiting screenshots</span>
            </div>

            <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-5 shadow-2xs">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block mb-1">
                Exam Marks Entry
              </span>
              <div className="text-xl font-bold text-slate-900 dark:text-white">
                Ready for UI
              </div>
              <span className="text-[11px] text-purple-600 dark:text-purple-400 mt-1 block">Awaiting screenshots</span>
            </div>
          </div>

          {/* Empty Workspace Canvas */}
          <div className="rounded-2xl border-2 border-dashed border-slate-300 dark:border-slate-800 p-12 text-center flex flex-col items-center justify-center bg-white/50 dark:bg-slate-900/30">
            <div className="w-14 h-14 rounded-2xl bg-purple-50 dark:bg-purple-950/40 border border-purple-200 dark:border-purple-800 flex items-center justify-center text-purple-600 mb-3">
              <Layers className="w-7 h-7" />
            </div>
            <h3 className="text-base font-bold text-slate-800 dark:text-white mb-1">
              Teacher Workspace Canvas Active
            </h3>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 max-w-md">
              Upload or share your screenshots in chat, and we will turn this blank canvas into a fully functional, pixel-perfect teacher portal.
            </p>
          </div>
        </main>
      </div>
    </div>
  )
}
