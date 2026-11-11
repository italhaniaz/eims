import React, { useState } from 'react'
import {
  Home,
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
  FileSpreadsheet,
  Search,
  Bell,
  Eye,
  Plus
} from 'lucide-react'
import { useAuth } from '../../context/AuthContext'

export default function TeacherPortalView() {
  const { user, logout } = useAuth()
  const [activeTab, setActiveTab] = useState('dashboard')
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')

  const teacherName = user?.name || 'Prof. Tariq Mehmood'
  const schoolName = user?.instituteName || 'City School Model Town Campus'
  const teacherRole = user?.roleTitle || 'Faculty / Subject Teacher'

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: Home, status: 'Active' },
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
      {/* 1. LEFT SIDEBAR: EXACT SUPER ADMIN DARK NAVY (#0B1120) */}
      {/* ========================================================= */}
      <aside
        className={`
          fixed lg:static top-0 bottom-0 left-0 z-50
          ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
          w-72 h-full max-h-screen sidebar-navy bg-[#0B1120] text-slate-300 border-r border-slate-800/80 flex flex-col
          transition-all duration-300 shrink-0 select-none shadow-xl
        `}
      >
        {/* Brand Header */}
        <div className="h-14 sm:h-16 min-h-[56px] sm:min-h-[64px] flex items-center justify-between px-5 border-b border-slate-800/80 bg-[#0B1120] shrink-0">
          <div className="flex items-center gap-3 overflow-hidden min-w-0">
            <div className="w-9 h-9 rounded-xl bg-purple-500/15 text-purple-400 border border-purple-500/30 flex items-center justify-center shrink-0 font-bold text-xs shadow-2xs">
              <BookOpen className="w-5 h-5 text-purple-400" />
            </div>
            <div className="flex flex-col truncate min-w-0">
              <span className="text-sm font-extrabold text-white tracking-tight font-heading leading-tight truncate">
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

        {/* Navigation Menu */}
        <div className="flex-1 py-4 px-3 space-y-1.5 overflow-y-auto dark-scroll text-[13.5px]">
          {navItems.map((item) => {
            const Icon = item.icon
            const isActive = activeTab === item.id

            return (
              <div key={item.id} className="relative">
                {isActive && (
                  <div className="absolute left-0 top-1.5 bottom-1.5 w-1 bg-purple-500 rounded-full z-10 shadow-sm shadow-purple-500/50"></div>
                )}
                <button
                  onClick={() => {
                    setActiveTab(item.id)
                    setIsMobileMenuOpen(false)
                  }}
                  className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-left transition-all cursor-pointer group ${
                    isActive
                      ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-bold shadow-md shadow-purple-600/30'
                      : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <Icon className={`w-[18px] h-[18px] shrink-0 transition-colors ${
                      isActive ? 'text-white' : 'text-slate-400 group-hover:text-purple-400'
                    }`} />
                    <span className="whitespace-nowrap truncate font-medium">{item.label}</span>
                  </div>
                  {item.status !== 'Active' ? (
                    <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 border border-slate-700">
                      {item.status}
                    </span>
                  ) : (
                    <ChevronRight className="w-3.5 h-3.5 text-white/70" />
                  )}
                </button>
              </div>
            )
          })}
        </div>

        {/* Clean Sign Out Footer matching Superadmin */}
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
      {/* 2. MAIN CONTENT AREA: HEADER & WORKSPACE */}
      {/* ========================================================= */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top Navbar */}
        <header className="h-14 sm:h-16 min-h-[56px] sm:min-h-[64px] bg-white dark:bg-slate-900 border-b border-slate-200/90 dark:border-slate-800 px-4 sm:px-6 flex items-center justify-between shrink-0 shadow-2xs z-30">
          <div className="flex items-center gap-3 min-w-0">
            <button
              onClick={() => setIsMobileMenuOpen(true)}
              className="lg:hidden p-2 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
            >
              <Menu className="w-5 h-5" />
            </button>

            {/* Search Input */}
            <div className="relative hidden md:block max-w-xs lg:max-w-md w-full">
              <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="What do you want to find?"
                className="w-full pl-9 pr-4 py-1.5 text-xs sm:text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-1 focus:ring-purple-500 text-slate-800 dark:text-slate-100"
              />
            </div>
          </div>

          {/* Right Action Icons & User Badge */}
          <div className="flex items-center gap-3">
            {/* Campus Tag */}
            <div className="hidden sm:flex items-center gap-2 px-3 py-1 rounded-full bg-purple-50 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-800 text-xs font-semibold">
              <span className="w-1.5 h-1.5 rounded-full bg-purple-600 animate-pulse"></span>
              <span className="truncate max-w-[200px]">{schoolName}</span>
            </div>

            {/* Profile Dropdown Badge */}
            <div className="flex items-center gap-2.5 pl-2 border-l border-slate-200 dark:border-slate-800">
              <div className="w-8 h-8 rounded-full bg-purple-600 text-white flex items-center justify-center font-bold text-xs ring-2 ring-purple-100 dark:ring-purple-900/50">
                TM
              </div>
              <div className="hidden md:flex flex-col text-left">
                <span className="text-xs font-bold text-slate-800 dark:text-white leading-tight">
                  {teacherName}
                </span>
                <span className="text-[10px] text-purple-600 dark:text-purple-400 font-semibold uppercase tracking-wider">
                  TEACHER
                </span>
              </div>
            </div>

            <button
              onClick={logout}
              title="Sign Out"
              className="p-2 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-slate-800 transition-colors cursor-pointer"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </header>

        {/* Main Content Body */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 space-y-6">
          {/* Top Page Header */}
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-2xl bg-purple-50 dark:bg-purple-950/60 border border-purple-200 dark:border-purple-800 text-purple-600 dark:text-purple-400 flex items-center justify-center font-bold shadow-2xs">
                <BookOpen className="w-6 h-6" />
              </div>
              <div>
                <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight font-heading">
                  Dashboard
                </h1>
                <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5">
                  Overview of faculty timetable, assigned classes, attendance records, and student grades.
                </p>
              </div>
            </div>

            {/* Quick Action Button */}
            <div className="flex items-center gap-2">
              <button
                type="button"
                className="px-4 py-2 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white text-xs sm:text-sm font-semibold shadow-md shadow-purple-600/20 flex items-center gap-2 transition-all cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>Quick Action</span>
              </button>
            </div>
          </div>

          {/* ========================================================= */}
          {/* 3. FOUR KPI SUMMARY CARDS (MATCHING SUPER ADMIN STYLE) */}
          {/* ========================================================= */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Card 1: Classes */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-3xl p-5 shadow-xs flex flex-col justify-between">
              <div>
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                  ASSIGNED CLASSES
                </span>
                <div className="flex items-baseline gap-2 mt-2">
                  <span className="text-3xl font-black text-slate-900 dark:text-white font-heading">
                    0
                  </span>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-purple-50 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-800">
                    Ready
                  </span>
                </div>
                <span className="text-[11px] text-slate-400 dark:text-slate-500 mt-2 block">
                  All assigned classroom rosters
                </span>
              </div>
              <div className="mt-3 flex justify-end">
                <span className="p-1.5 rounded-xl bg-slate-50 dark:bg-slate-800 text-slate-400 border border-slate-200/80 dark:border-slate-700">
                  <Eye className="w-4 h-4" />
                </span>
              </div>
            </div>

            {/* Card 2: Students */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-3xl p-5 shadow-xs flex flex-col justify-between">
              <div>
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                  TOTAL STUDENTS
                </span>
                <div className="flex items-baseline gap-2 mt-2">
                  <span className="text-3xl font-black text-slate-900 dark:text-white font-heading">
                    0
                  </span>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
                    Enrolled
                  </span>
                </div>
                <span className="text-[11px] text-slate-400 dark:text-slate-500 mt-2 block">
                  Across assigned class sections
                </span>
              </div>
              <div className="mt-3 flex justify-end">
                <span className="p-1.5 rounded-xl bg-slate-50 dark:bg-slate-800 text-slate-400 border border-slate-200/80 dark:border-slate-700">
                  <Eye className="w-4 h-4" />
                </span>
              </div>
            </div>

            {/* Card 3: Today's Periods */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-3xl p-5 shadow-xs flex flex-col justify-between">
              <div>
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                  TODAY'S LECTURES
                </span>
                <div className="flex items-baseline gap-2 mt-2">
                  <span className="text-3xl font-black text-slate-900 dark:text-white font-heading">
                    0
                  </span>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800">
                    Schedule
                  </span>
                </div>
                <span className="text-[11px] text-slate-400 dark:text-slate-500 mt-2 block">
                  Weekly period timetable routine
                </span>
              </div>
              <div className="mt-3 flex justify-end">
                <span className="p-1.5 rounded-xl bg-slate-50 dark:bg-slate-800 text-slate-400 border border-slate-200/80 dark:border-slate-700">
                  <Eye className="w-4 h-4" />
                </span>
              </div>
            </div>

            {/* Card 4: Attendance Rate */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-3xl p-5 shadow-xs flex flex-col justify-between">
              <div>
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                  ATTENDANCE RECORDED
                </span>
                <div className="flex items-baseline gap-2 mt-2">
                  <span className="text-3xl font-black text-slate-900 dark:text-white font-heading">
                    0%
                  </span>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                    Daily Roll
                  </span>
                </div>
                <span className="text-[11px] text-slate-400 dark:text-slate-500 mt-2 block">
                  Student daily roll-call logs
                </span>
              </div>
              <div className="mt-3 flex justify-end">
                <span className="p-1.5 rounded-xl bg-slate-50 dark:bg-slate-800 text-slate-400 border border-slate-200/80 dark:border-slate-700">
                  <Eye className="w-4 h-4" />
                </span>
              </div>
            </div>
          </div>

          {/* ========================================================= */}
          {/* 4. READY NOTICE (MATCHING SERVER CONFIGURATION STYLE) */}
          {/* ========================================================= */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-3xl p-6 sm:p-7 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-purple-50 dark:bg-purple-950/60 border border-purple-200 dark:border-purple-800 text-purple-600 flex items-center justify-center shrink-0">
                  <Sparkles className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white">
                    Teacher Portal — Ready for Module Implementation
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Platform theme and design system 100% synchronized with Super Admin.
                  </p>
                </div>
              </div>
              <span className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800 text-xs font-semibold">
                <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                <span>System Ready</span>
              </span>
            </div>

            <div className="p-4 rounded-2xl bg-purple-50/50 dark:bg-purple-950/20 border border-purple-100 dark:border-purple-900/40 flex items-start gap-3">
              <Camera className="w-5 h-5 text-purple-600 dark:text-purple-400 shrink-0 mt-0.5" />
              <div className="text-xs sm:text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
                <strong>Awaiting Reference Pictures & UI Designs:</strong> As instructed, no pre-baked dummy data has been loaded. Please share your reference pictures/screenshots, and we will build all teacher modules (My Classes, Daily Attendance, Exam Marks Entry, Timetable) from scratch, keeping this exact Super Admin theme consistent!
              </div>
            </div>
          </div>

          {/* ========================================================= */}
          {/* 5. WORKSPACE CANVAS (CLEAN EMPTY STATE) */}
          {/* ========================================================= */}
          <div className="rounded-3xl border-2 border-dashed border-slate-300 dark:border-slate-800 p-12 text-center flex flex-col items-center justify-center bg-white/40 dark:bg-slate-900/30">
            <div className="w-14 h-14 rounded-2xl bg-purple-50 dark:bg-purple-950/50 border border-purple-200 dark:border-purple-800 flex items-center justify-center text-purple-600 dark:text-purple-400 mb-3 shadow-xs">
              <Layers className="w-7 h-7" />
            </div>
            <h3 className="text-base font-bold text-slate-800 dark:text-white mb-1">
              Teacher Workspace Canvas Active
            </h3>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 max-w-md">
              Please share your reference pictures and instructions, and we will transform this canvas into your custom teacher portal.
            </p>
          </div>
        </main>
      </div>
    </div>
  )
}
