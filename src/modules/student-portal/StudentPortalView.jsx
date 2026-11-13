import React, { useState, useMemo, useEffect } from 'react'
import {
  Home,
  BookOpen,
  GraduationCap,
  Calendar,
  CheckCircle2,
  Clock,
  LogOut,
  ChevronRight,
  ChevronDown,
  Menu,
  X,
  Bell,
  Mail,
  Wallet,
  Receipt,
  UserCheck,
  Megaphone,
  Printer,
  Download,
  Check,
  AlertCircle,
  Sun,
  Moon,
  IdCard,
  FileText,
  Search,
  Filter,
  CreditCard,
  Building2,
  CalendarDays,
  FileCheck,
  Award,
  BookMarked,
  Layers,
  Send,
  Upload,
  ArrowRight,
  Smartphone,
  User,
  Pencil,
  FolderOpen,
  MessageSquare,
  Hourglass,
  HelpCircle,
  CheckSquare,
  Share2
} from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import { useAppData } from '../../context/AppDataContext'
import { useTheme } from '../../context/ThemeContext'
import { useToast } from '../../context/ToastContext'

export default function StudentPortalView() {
  const { user, logout } = useAuth()
  const { notices = [] } = useAppData()
  const { isDark, toggleThemeMode } = useTheme()
  const { toast } = useToast()

  // Student Name State (Default 'Unknown' as explicitly requested, editable by user)
  const [studentName, setStudentName] = useState(() => {
    try {
      const stored = localStorage.getItem('sms_student_custom_name')
      if (stored) return stored
      if (user?.name && user.name !== 'Saleem Ahmed' && user.name !== 'Muhammad Ali') {
        return user.name
      }
    } catch {}
    return 'Unknown'
  })

  // Student Class State (Default 'Nursery' as shown in the screenshot)
  const [studentClass, setStudentClass] = useState(() => {
    try {
      const stored = localStorage.getItem('sms_student_custom_class')
      if (stored) return stored
      return user?.className || 'Nursery'
    } catch {}
    return 'Nursery'
  })

  // Modal to enter/edit student name
  const [isEditNameModalOpen, setIsEditNameModalOpen] = useState(false)
  const [editNameInput, setEditNameInput] = useState('')
  const [editClassInput, setEditClassInput] = useState('')

  // Navigation Tabs:
  // 'dashboard' | 'timetable' | 'attendance' | 'assignments' | 'resources' |
  // 'report-cards' | 'announcements' | 'communication' | 'fees' | 'download-app' | 'account'
  const [activeTab, setActiveTab] = useState('dashboard')
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [isNotifOpen, setIsNotifOpen] = useState(false)
  const [isMailOpen, setIsMailOpen] = useState(false)

  // Sub-feature states
  const [selectedTimetableDay, setSelectedTimetableDay] = useState('Friday')
  const [selectedChallanForPrint, setSelectedChallanForPrint] = useState(null)
  const [selectedChallanForPayment, setSelectedChallanForPayment] = useState(null)
  const [isReportCardModalOpen, setIsReportCardModalOpen] = useState(false)
  const [isIdCardModalOpen, setIsIdCardModalOpen] = useState(false)
  const [isLeaveModalOpen, setIsLeaveModalOpen] = useState(false)
  const [viewingNotice, setViewingNotice] = useState(null)

  // Quick link highlight state (Default 'Fee Records' as seen active in screenshot)
  const [activeQuickLink, setActiveQuickLink] = useState('fee-records')

  // Save updated name to state and localStorage
  const handleSaveName = (e) => {
    e?.preventDefault()
    const cleanName = editNameInput.trim()
    if (!cleanName) return
    setStudentName(cleanName)
    try {
      localStorage.setItem('sms_student_custom_name', cleanName)
      if (editClassInput.trim()) {
        setStudentClass(editClassInput.trim())
        localStorage.setItem('sms_student_custom_class', editClassInput.trim())
      }
      // Update session storage user payload
      const sessionUser = sessionStorage.getItem('sms_auth_user')
      if (sessionUser) {
        const parsed = JSON.parse(sessionUser)
        parsed.name = cleanName
        if (editClassInput.trim()) parsed.className = editClassInput.trim()
        sessionStorage.setItem('sms_auth_user', JSON.stringify(parsed))
      }
    } catch {}
    setIsEditNameModalOpen(false)
    toast?.success?.('Profile name updated successfully!') || alert('Name updated!')
  }

  // Pre-fill edit modal when opening
  const openEditModal = () => {
    setEditNameInput(studentName === 'Unknown' ? '' : studentName)
    setEditClassInput(studentClass)
    setIsEditNameModalOpen(true)
  }

  // Current formatted date
  const todayFormatted = useMemo(() => {
    return 'Friday, 13 Nov 2026'
  }, [])

  // Class Schedule data
  const todaySchedule = [
    { time: '1:00 PM - 1:30 PM', subject: 'English', teacher: 'Ma\'am Ayesha', room: 'Room 2' },
    { time: '1:30 PM - 2:00 PM', subject: 'Math', teacher: 'Sir Tariq', room: 'Room 2' },
    { time: '3:30 PM - 4:00 PM', subject: 'Play Activity', teacher: 'Activity Supervisor', room: 'Activity Hall' }
  ]

  // Announcements list (from screenshots 1 & 2)
  const announcementsList = [
    {
      id: 'ann-1',
      title: 'Summer Holidays',
      date: '13 Jun 2026',
      content: 'Summer vacation starts from 15th June 2026. The institute will reopen on 15th August 2026.'
    },
    {
      id: 'ann-2',
      title: '25 December Holiday!',
      date: '15 Dec 2025',
      content: 'The institute will remain closed on 25th December on account of Quaid-e-Azam Day and Christmas.'
    }
  ]

  // Fee records data (matching screenshot PKR 9,375 pending)
  const feeRecords = [
    {
      id: 'INV-1092',
      challanNo: 'CH-2026-9375',
      month: 'November 2026',
      dueDate: '15 Nov 2026',
      amount: 9375,
      tuition: 8500,
      activity: 875,
      status: 'Pending'
    },
    {
      id: 'INV-1081',
      challanNo: 'CH-2026-8500',
      month: 'October 2026',
      dueDate: '15 Oct 2026',
      amount: 8500,
      tuition: 8500,
      activity: 0,
      status: 'Paid'
    }
  ]

  const triggerBrowserPrint = () => {
    window.print()
  }

  return (
    <div className={`min-h-screen flex flex-col font-sans ${isDark ? 'bg-slate-950 text-slate-100' : 'bg-[#f4f7fb] text-slate-800'}`}>
      {/* TOP NAVBAR */}
      <header className={`sticky top-0 z-30 h-16 border-b transition-colors ${
        isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'
      } px-4 sm:px-6 flex items-center justify-between shadow-xs`}>
        {/* Left: Apex Logo & Title + Hamburger */}
        <div className="flex items-center gap-3 sm:gap-4">
          {/* APEX BRANDING (Replacing EduDigitize Demo as requested) */}
          <div className="flex items-center gap-2.5 cursor-pointer" onClick={() => setActiveTab('dashboard')}>
            {/* Custom Modern Apex Logo Emblem */}
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-violet-600 flex items-center justify-center text-white shadow-md shadow-blue-500/25">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
                <path d="M12 3L2 21h20L12 3z" fill="rgba(255,255,255,0.2)" />
                <path d="M7 16h10" />
                <path d="M12 7v5" />
              </svg>
            </div>
            <div className="flex flex-col">
              <span className="font-bold text-sm sm:text-base leading-tight tracking-tight text-slate-900 dark:text-white">
                Apex School System
              </span>
              <span className="text-[10px] text-slate-400 font-medium tracking-wide">
                Management System
              </span>
            </div>
          </div>

          {/* Hamburger Menu Toggle */}
          <button
            type="button"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="p-1.5 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800 transition-colors ml-1 cursor-pointer"
            aria-label="Toggle Navigation"
          >
            <Menu className="w-5 h-5" />
          </button>
        </div>

        {/* Right Header Icons & Student Profile */}
        <div className="flex items-center gap-2.5 sm:gap-4">
          {/* Bell Icon */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setIsNotifOpen(!isNotifOpen)}
              className="p-2 rounded-xl text-slate-500 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
              title="Notifications"
            >
              <Bell className="w-4 h-4" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-blue-600" />
            </button>

            {isNotifOpen && (
              <div className="absolute right-0 mt-2 w-72 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xl p-3 z-50 text-xs">
                <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
                  <span className="font-bold text-slate-700 dark:text-slate-200">Alerts</span>
                  <button onClick={() => setIsNotifOpen(false)} className="text-slate-400 hover:text-slate-600">
                    <X className="w-4 h-4" />
                  </button>
                </div>
                <div className="mt-2 space-y-2">
                  <div className="p-2 rounded-xl bg-blue-50 dark:bg-blue-950/40 text-blue-900 dark:text-blue-200">
                    <p className="font-semibold">Fee Challan Issued</p>
                    <p className="text-[11px] text-slate-500 mt-0.5">November 2026 tuition voucher of PKR 9,375 is generated.</p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Mail / Message Icon */}
          <button
            type="button"
            onClick={() => setActiveTab('communication')}
            className="p-2 rounded-xl text-slate-500 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
            title="Messages"
          >
            <Mail className="w-4 h-4" />
          </button>

          {/* Theme Toggle */}
          <button
            type="button"
            onClick={toggleThemeMode}
            className="p-2 rounded-xl text-slate-500 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
            title="Toggle Theme"
          >
            {isDark ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4" />}
          </button>

          {/* Student Profile (Shows 'Unknown' by default with user edit option) */}
          <div
            onClick={openEditModal}
            className="flex items-center gap-2 pl-2 border-l border-slate-200 dark:border-slate-800 cursor-pointer group"
            title="Click to enter or change student name"
          >
            {/* Round Avatar Icon */}
            <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-amber-600 to-indigo-600 flex items-center justify-center text-white text-xs font-bold shadow-xs">
              {studentName === 'Unknown' ? '?' : studentName.charAt(0).toUpperCase()}
            </div>

            <div className="text-left flex flex-col">
              <div className="flex items-center gap-1">
                <span className="text-xs font-bold text-slate-800 dark:text-white group-hover:text-blue-600 transition-colors">
                  {studentName}
                </span>
                <Pencil className="w-3 h-3 text-slate-400 group-hover:text-blue-600 opacity-60 group-hover:opacity-100 transition-opacity" />
              </div>
              <span className="text-[9px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                STUDENT
              </span>
            </div>
          </div>

          {/* Logout */}
          <button
            type="button"
            onClick={logout}
            className="p-2 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors cursor-pointer ml-1"
            title="Sign Out"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </header>

      {/* BODY WORKSPACE */}
      <div className="flex flex-1 overflow-hidden">
        {/* SIDEBAR NAVIGATION (Matching Screenshot 1 & 2) */}
        <aside
          className={`fixed lg:static inset-y-16 left-0 z-20 w-60 flex-col border-r transition-transform duration-200 ${
            isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
          } ${isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'} flex`}
        >
          <nav className="flex-1 p-3 space-y-0.5 overflow-y-auto text-xs">
            {[
              { id: 'dashboard', label: 'Dashboard', icon: Home },
              { id: 'timetable', label: 'My Timetable', icon: CalendarDays },
              { id: 'attendance', label: 'My Attendance', icon: UserCheck },
              { id: 'assignments', label: 'Assignments', icon: BookOpen },
              { id: 'resources', label: 'Class Resources', icon: FolderOpen, hasChevron: true },
              { id: 'report-cards', label: 'Report Cards', icon: FileText },
              { id: 'announcements', label: 'Announcements', icon: Megaphone },
              { id: 'communication', label: 'Communication', icon: MessageSquare, hasChevron: true },
              { id: 'fees', label: 'Fee Records', icon: CreditCard },
              { id: 'download-app', label: 'Download App', icon: Smartphone },
              { id: 'account', label: 'My Account', icon: User }
            ].map(item => {
              const Icon = item.icon
              const isActive = activeTab === item.id
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => {
                    setActiveTab(item.id)
                    setIsMobileMenuOpen(false)
                  }}
                  className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl font-medium transition-colors cursor-pointer ${
                    isActive
                      ? 'bg-[#eef4ff] text-[#2563eb] font-semibold dark:bg-blue-950/50 dark:text-blue-300'
                      : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/60 hover:text-slate-900'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon className={`w-4 h-4 ${isActive ? 'text-[#2563eb] dark:text-blue-300' : 'text-slate-400'}`} />
                    <span>{item.label}</span>
                  </div>
                  {item.hasChevron && (
                    <ChevronRight className="w-3.5 h-3.5 text-slate-300" />
                  )}
                </button>
              )
            })}
          </nav>

          {/* Quick Edit Name Prompt in Sidebar if Unknown */}
          {studentName === 'Unknown' && (
            <div className="p-3 m-3 rounded-xl bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-900 text-center">
              <span className="block text-[11px] font-bold text-blue-900 dark:text-blue-200 mb-1">
                Student Name: Unknown
              </span>
              <button
                type="button"
                onClick={openEditModal}
                className="w-full py-1 px-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-[11px] font-semibold transition-colors shadow-xs"
              >
                Enter Your Name
              </button>
            </div>
          )}
        </aside>

        {/* Mobile Backdrop */}
        {isMobileMenuOpen && (
          <div
            className="fixed inset-0 z-10 bg-slate-900/40 backdrop-blur-xs lg:hidden"
            onClick={() => setIsMobileMenuOpen(false)}
          />
        )}

        {/* MAIN DASHBOARD CONTENT */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-7 max-w-7xl mx-auto w-full">
          {/* TAB: DASHBOARD (Matching Screenshot 1 & 2 exactly) */}
          {activeTab === 'dashboard' && (
            <div className="space-y-5">
              {/* Top Subheader: "My Dashboard" + Right Action Shortcut Icons */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-1">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-md bg-blue-100 text-blue-600 flex items-center justify-center">
                    <FileText className="w-4 h-4" />
                  </div>
                  <h1 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white">
                    My Dashboard
                  </h1>
                </div>

                {/* Right Action Icons (Report Card, My Attendance, Assignments, Announcements, Fee Records) */}
                <div className="flex items-center gap-3 sm:gap-6 text-[10px] sm:text-xs text-slate-600 dark:text-slate-400 overflow-x-auto pb-1">
                  <button
                    type="button"
                    onClick={() => setIsReportCardModalOpen(true)}
                    className="flex flex-col items-center gap-1 hover:text-blue-600 transition-colors cursor-pointer"
                  >
                    <BookOpen className="w-4 h-4 text-slate-500" />
                    <span>Report Card</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveTab('attendance')}
                    className="flex flex-col items-center gap-1 hover:text-blue-600 transition-colors cursor-pointer"
                  >
                    <Calendar className="w-4 h-4 text-slate-500" />
                    <span>My Attendance</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveTab('assignments')}
                    className="flex flex-col items-center gap-1 hover:text-blue-600 transition-colors cursor-pointer"
                  >
                    <BookMarked className="w-4 h-4 text-slate-500" />
                    <span>Assignments</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveTab('announcements')}
                    className="flex flex-col items-center gap-1 hover:text-blue-600 transition-colors cursor-pointer"
                  >
                    <Megaphone className="w-4 h-4 text-slate-500" />
                    <span>Announcements</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveTab('fees')}
                    className="flex flex-col items-center gap-1 hover:text-blue-600 transition-colors cursor-pointer"
                  >
                    <CreditCard className="w-4 h-4 text-slate-500" />
                    <span>Fee Records</span>
                  </button>
                </div>
              </div>

              {/* WELCOME BANNER (White Rounded Card from Screenshot 1 & 2) */}
              <div className={`p-6 rounded-2xl border transition-all ${
                isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200/80 shadow-xs'
              }`}>
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white">
                        Welcome back, {studentName}!
                      </h2>
                      <button
                        type="button"
                        onClick={openEditModal}
                        className="text-slate-400 hover:text-blue-600 transition-colors p-1"
                        title="Click to enter/edit student name"
                      >
                        <Pencil className="w-4 h-4" />
                      </button>
                    </div>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                      Here's your overview for today.
                    </p>
                    <div className="mt-2.5">
                      <span
                        onClick={openEditModal}
                        className="text-xs font-semibold text-blue-600 dark:text-blue-400 hover:underline cursor-pointer"
                        title="Click to change class"
                      >
                        {studentClass}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5 text-xs text-slate-400 font-medium">
                    <Calendar className="w-3.5 h-3.5" />
                    <span>{todayFormatted}</span>
                  </div>
                </div>
              </div>

              {/* TODAY'S CLASSES BANNER (Light Mint Green Card from Screenshot 1 & 2) */}
              <div className="p-5 rounded-2xl border border-emerald-100 dark:border-emerald-900/40 bg-gradient-to-r from-[#eefbf4] to-[#f4fdf8] dark:from-emerald-950/20 dark:to-teal-950/20 shadow-xs">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-1.5 text-xs font-medium text-slate-600 dark:text-slate-400">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block" />
                    <span>Today · Friday, 13 Nov</span>
                  </div>

                  <button
                    type="button"
                    onClick={() => setActiveTab('timetable')}
                    className="flex items-center gap-1 px-3 py-1 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 text-xs font-medium hover:bg-slate-50 transition-colors shadow-2xs cursor-pointer"
                  >
                    <CalendarDays className="w-3.5 h-3.5 text-slate-500" />
                    <span>Full timetable</span>
                  </button>
                </div>

                <div>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                    Today's classes
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                    3 periods scheduled
                  </p>
                </div>

                {/* Period Chips */}
                <div className="mt-4 flex flex-wrap items-center gap-3">
                  {todaySchedule.map((item, idx) => (
                    <div
                      key={idx}
                      className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-white dark:bg-slate-800 border border-slate-200/90 dark:border-slate-700 text-xs text-slate-700 dark:text-slate-200 shadow-2xs"
                    >
                      <Clock className="w-3.5 h-3.5 text-slate-400" />
                      <span className="font-medium">{item.time}</span>
                      <span className="font-semibold text-slate-900 dark:text-white">{item.subject}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* TWO SUMMARY KPI CARDS (Pending Fees & This Month) */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* 1. Pending Fees */}
                <div className={`p-5 rounded-2xl border transition-all ${
                  isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200/80 shadow-xs'
                }`}>
                  <div className="flex items-center gap-3.5">
                    <div className="w-10 h-10 rounded-2xl bg-amber-50 dark:bg-amber-950/40 text-amber-600 flex items-center justify-center">
                      <Hourglass className="w-5 h-5" />
                    </div>
                    <div>
                      <span className="text-xs text-slate-500 dark:text-slate-400 font-medium block">
                        Pending Fees
                      </span>
                      <div className="flex items-baseline gap-2 mt-0.5">
                        <span className="text-2xl font-bold text-slate-900 dark:text-white">
                          9,375
                        </span>
                      </div>
                      <span className="text-[11px] text-slate-400 block mt-0.5">
                        0 invoice(s) · PKR
                      </span>
                    </div>
                  </div>
                </div>

                {/* 2. This Month Attendance */}
                <div className={`p-5 rounded-2xl border transition-all ${
                  isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200/80 shadow-xs'
                }`}>
                  <div className="flex items-center gap-3.5">
                    <div className="w-10 h-10 rounded-full bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 flex items-center justify-center">
                      <Check className="w-5 h-5 stroke-[2.5]" />
                    </div>
                    <div>
                      <span className="text-xs text-slate-500 dark:text-slate-400 font-medium block">
                        This Month
                      </span>
                      <div className="flex items-baseline gap-2 mt-0.5">
                        <span className="text-2xl font-bold text-slate-900 dark:text-white">
                          0%
                        </span>
                      </div>
                      <span className="text-[11px] text-slate-400 block mt-0.5">
                        0 present · 21 working days
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* QUICK LINKS SECTION (Matching Screenshot 1 & 2) */}
              <div>
                <h3 className="text-xs font-bold text-slate-800 dark:text-slate-200 mb-3">
                  Quick Links
                </h3>
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
                  {[
                    { id: 'fee-records', label: 'Fee Records', icon: Wallet, tab: 'fees' },
                    { id: 'attendance', label: 'My Attendance', icon: Calendar, tab: 'attendance' },
                    { id: 'assignments', label: 'Assignments', icon: BookOpen, tab: 'assignments' },
                    { id: 'timetables', label: 'Timetables', icon: CalendarDays, tab: 'timetable' },
                    { id: 'report-card', label: 'Report Card', icon: FileText, tab: 'report-cards' },
                    { id: 'announcements', label: 'Announcements', icon: Megaphone, tab: 'announcements' }
                  ].map(item => {
                    const Icon = item.icon
                    const isSelected = activeQuickLink === item.id
                    return (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => {
                          setActiveQuickLink(item.id)
                          setActiveTab(item.tab)
                        }}
                        className={`p-4 rounded-2xl border text-center flex flex-col items-center justify-center transition-all cursor-pointer ${
                          isSelected
                            ? 'bg-[#4f46e5] border-[#4f46e5] text-white shadow-md shadow-indigo-500/20'
                            : isDark
                            ? 'bg-slate-900 border-slate-800 text-slate-700 hover:border-slate-700'
                            : 'bg-white border-slate-200/90 text-slate-700 hover:border-slate-300 shadow-xs'
                        }`}
                      >
                        <Icon className={`w-5 h-5 mb-2 ${isSelected ? 'text-white' : 'text-slate-600 dark:text-slate-400'}`} />
                        <span className={`text-xs font-semibold ${isSelected ? 'text-white' : 'text-slate-700 dark:text-slate-300'}`}>
                          {item.label}
                        </span>
                      </button>
                    )
                  })}
                </div>
              </div>

              {/* TWO BOTTOM COLUMNS (Latest Announcements & Recent Assignments) */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {/* Left Column: Latest Announcements */}
                <div className={`p-5 rounded-2xl border ${
                  isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200/80 shadow-xs'
                }`}>
                  <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
                    <div className="flex items-center gap-2">
                      <Megaphone className="w-4 h-4 text-teal-600" />
                      <h4 className="text-xs font-bold text-slate-900 dark:text-white">
                        Latest Announcements
                      </h4>
                    </div>
                    <button
                      type="button"
                      onClick={() => setActiveTab('announcements')}
                      className="text-xs font-semibold text-blue-600 dark:text-blue-400 hover:underline"
                    >
                      View all
                    </button>
                  </div>

                  <div className="divide-y divide-slate-100 dark:divide-slate-800">
                    {announcementsList.map(ann => (
                      <div
                        key={ann.id}
                        onClick={() => setViewingNotice(ann)}
                        className="py-3 hover:bg-slate-50/60 dark:hover:bg-slate-800/40 rounded-xl px-2 transition-colors cursor-pointer"
                      >
                        <h5 className="text-xs font-bold text-slate-800 dark:text-white">
                          {ann.title}
                        </h5>
                        <div className="flex items-center gap-1.5 text-[11px] text-slate-400 mt-1">
                          <Calendar className="w-3 h-3" />
                          <span>{ann.date}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Right Column: Recent Assignments */}
                <div className={`p-5 rounded-2xl border ${
                  isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200/80 shadow-xs'
                }`}>
                  <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
                    <div className="flex items-center gap-2">
                      <BookOpen className="w-4 h-4 text-blue-600" />
                      <h4 className="text-xs font-bold text-slate-900 dark:text-white">
                        Recent Assignments
                      </h4>
                    </div>
                    <button
                      type="button"
                      onClick={() => setActiveTab('assignments')}
                      className="text-xs font-semibold text-blue-600 dark:text-blue-400 hover:underline"
                    >
                      View all
                    </button>
                  </div>

                  <div className="py-10 text-center flex flex-col items-center justify-center">
                    <BookOpen className="w-8 h-8 text-slate-300 dark:text-slate-600 mb-2" />
                    <span className="text-xs text-slate-400">
                      No recent assignments / handouts
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB: MY TIMETABLE */}
          {activeTab === 'timetable' && (
            <div className="space-y-5">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                    Class Timetable - {studentClass}
                  </h2>
                  <p className="text-xs text-slate-500">Weekly period allocations</p>
                </div>
                <button
                  type="button"
                  onClick={triggerBrowserPrint}
                  className="px-3.5 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-semibold flex items-center gap-1.5"
                >
                  <Printer className="w-3.5 h-3.5 text-blue-600" />
                  Print Timetable
                </button>
              </div>

              <div className="p-6 rounded-2xl border bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
                <h3 className="text-sm font-bold text-slate-800 dark:text-white">Friday Schedule</h3>
                <div className="space-y-2.5">
                  {todaySchedule.map((slot, i) => (
                    <div key={i} className="p-3.5 rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-800/40 flex items-center justify-between text-xs">
                      <div className="flex items-center gap-3">
                        <div className="w-7 h-7 rounded-lg bg-blue-100 text-blue-700 font-bold flex items-center justify-center text-xs">
                          {i + 1}
                        </div>
                        <div>
                          <p className="font-bold text-slate-900 dark:text-white">{slot.subject}</p>
                          <p className="text-[11px] text-slate-400">{slot.teacher} · {slot.room}</p>
                        </div>
                      </div>
                      <span className="font-semibold text-slate-700 dark:text-slate-300">{slot.time}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB: MY ATTENDANCE */}
          {activeTab === 'attendance' && (
            <div className="space-y-5">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                    Attendance History & Leaves
                  </h2>
                  <p className="text-xs text-slate-500">Student daily attendance logs</p>
                </div>
                <button
                  type="button"
                  onClick={() => setIsLeaveModalOpen(true)}
                  className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-xs cursor-pointer"
                >
                  Apply Leave
                </button>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                  <span className="text-[11px] text-slate-400 uppercase font-bold">Total Days</span>
                  <p className="text-xl font-bold mt-1">21</p>
                </div>
                <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                  <span className="text-[11px] text-slate-400 uppercase font-bold">Present</span>
                  <p className="text-xl font-bold text-emerald-600 mt-1">0</p>
                </div>
                <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                  <span className="text-[11px] text-slate-400 uppercase font-bold">Absent</span>
                  <p className="text-xl font-bold text-rose-600 mt-1">0</p>
                </div>
                <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                  <span className="text-[11px] text-slate-400 uppercase font-bold">Percentage</span>
                  <p className="text-xl font-bold text-blue-600 mt-1">0%</p>
                </div>
              </div>
            </div>
          )}

          {/* TAB: ASSIGNMENTS */}
          {activeTab === 'assignments' && (
            <div className="space-y-5">
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                Coursework & Homework
              </h2>
              <div className="p-12 text-center bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800">
                <BookOpen className="w-10 h-10 text-slate-300 mx-auto mb-2" />
                <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">No active homework right now</p>
                <p className="text-xs text-slate-400 mt-1">You are all caught up with your assignments.</p>
              </div>
            </div>
          )}

          {/* TAB: CLASS RESOURCES */}
          {activeTab === 'resources' && (
            <div className="space-y-5">
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                Class Learning Resources & Handouts
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <FileText className="w-6 h-6 text-blue-600" />
                    <div>
                      <p className="font-bold text-slate-900 dark:text-white">Nursery Alphabets & Phonics Guide</p>
                      <p className="text-slate-400 text-[11px]">PDF · 2.4 MB</p>
                    </div>
                  </div>
                  <button className="px-3 py-1.5 rounded-lg bg-blue-50 text-blue-600 font-bold hover:bg-blue-100">
                    Download
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* TAB: REPORT CARDS */}
          {activeTab === 'report-cards' && (
            <div className="space-y-5">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                  Academic Report Cards
                </h2>
                <button
                  type="button"
                  onClick={() => setIsReportCardModalOpen(true)}
                  className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold shadow-xs cursor-pointer"
                >
                  View Full Report Card
                </button>
              </div>

              <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs">
                <p className="font-bold text-sm text-slate-900 dark:text-white">Mid-Term Assessment 2025-2026</p>
                <p className="text-slate-400 mt-1">Student: {studentName} &bull; Class: {studentClass}</p>
              </div>
            </div>
          )}

          {/* TAB: ANNOUNCEMENTS */}
          {activeTab === 'announcements' && (
            <div className="space-y-5">
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                All Announcements & Notices
              </h2>
              <div className="space-y-3">
                {announcementsList.map(item => (
                  <div key={item.id} className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs">
                    <span className="text-[10px] text-slate-400">{item.date}</span>
                    <h3 className="text-sm font-bold text-slate-900 dark:text-white mt-1">{item.title}</h3>
                    <p className="text-slate-600 dark:text-slate-300 mt-2">{item.content}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB: COMMUNICATION */}
          {activeTab === 'communication' && (
            <div className="space-y-5">
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                Student Communication & Teacher Messages
              </h2>
              <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs">
                <p className="text-slate-500">Inbox is empty. No new unread messages from faculty.</p>
              </div>
            </div>
          )}

          {/* TAB: FEE RECORDS */}
          {activeTab === 'fees' && (
            <div className="space-y-5">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                    Fee Records & Challans
                  </h2>
                  <p className="text-xs text-slate-500">Total Pending: PKR 9,375</p>
                </div>
              </div>

              <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b text-slate-400 uppercase text-[10px] font-bold">
                      <th className="py-2.5">Challan #</th>
                      <th className="py-2.5">Month</th>
                      <th className="py-2.5">Due Date</th>
                      <th className="py-2.5">Amount</th>
                      <th className="py-2.5">Status</th>
                      <th className="py-2.5 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y text-slate-700 dark:text-slate-300">
                    {feeRecords.map(f => (
                      <tr key={f.id} className="py-3">
                        <td className="py-3 font-bold text-slate-900 dark:text-white">{f.challanNo}</td>
                        <td className="py-3">{f.month}</td>
                        <td className="py-3">{f.dueDate}</td>
                        <td className="py-3 font-bold">PKR {f.amount.toLocaleString()}</td>
                        <td className="py-3">
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                            f.status === 'Paid'
                              ? 'bg-emerald-100 text-emerald-800'
                              : 'bg-amber-100 text-amber-800'
                          }`}>
                            {f.status}
                          </span>
                        </td>
                        <td className="py-3 text-right">
                          <button
                            type="button"
                            onClick={() => setSelectedChallanForPrint(f)}
                            className="px-3 py-1 rounded-lg bg-blue-50 text-blue-600 font-bold hover:bg-blue-100 cursor-pointer"
                          >
                            Print Challan
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB: DOWNLOAD APP */}
          {activeTab === 'download-app' && (
            <div className="space-y-5">
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                Download Apex Mobile App
              </h2>
              <div className="p-8 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-center max-w-lg mx-auto">
                <Smartphone className="w-12 h-12 text-blue-600 mx-auto mb-3" />
                <h3 className="font-bold text-base text-slate-900 dark:text-white">Apex Student & Parent Portal App</h3>
                <p className="text-xs text-slate-500 mt-2">Available for Android & iOS. Access timetables, announcements, and fee payment on the go.</p>
                <button className="mt-5 px-6 py-2.5 rounded-xl bg-blue-600 text-white font-bold text-xs hover:bg-blue-700 shadow-xs">
                  Download Android APK
                </button>
              </div>
            </div>
          )}

          {/* TAB: MY ACCOUNT */}
          {activeTab === 'account' && (
            <div className="space-y-5">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                    My Account Profile
                  </h2>
                  <p className="text-xs text-slate-500">Manage registered student particulars</p>
                </div>
                <button
                  type="button"
                  onClick={openEditModal}
                  className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-xs cursor-pointer flex items-center gap-1.5"
                >
                  <Pencil className="w-3.5 h-3.5" />
                  Edit Profile
                </button>
              </div>

              <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-4 text-xs">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/50">
                    <span className="text-[10px] uppercase font-bold text-slate-400">Student Name</span>
                    <p className="text-sm font-bold text-slate-900 dark:text-white mt-0.5">{studentName}</p>
                  </div>
                  <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/50">
                    <span className="text-[10px] uppercase font-bold text-slate-400">Class & Section</span>
                    <p className="text-sm font-bold text-slate-900 dark:text-white mt-0.5">{studentClass} - Section A</p>
                  </div>
                  <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/50">
                    <span className="text-[10px] uppercase font-bold text-slate-400">Roll Number</span>
                    <p className="text-sm font-bold text-slate-900 dark:text-white mt-0.5">CSM-2026-042</p>
                  </div>
                  <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/50">
                    <span className="text-[10px] uppercase font-bold text-slate-400">Institute</span>
                    <p className="text-sm font-bold text-slate-900 dark:text-white mt-0.5">Apex School System</p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>

      {/* MODAL: ENTER / EDIT STUDENT NAME (Fulfilling: "Muhammad ali ki jaga pr unknown kr oo user khud enter kre ga") */}
      {isEditNameModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="w-full max-w-md bg-white dark:bg-slate-900 text-slate-900 dark:text-white rounded-3xl shadow-2xl p-6 border border-slate-200 dark:border-slate-800">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <h3 className="text-sm font-bold">
                Student Profile Information
              </h3>
              <button
                type="button"
                onClick={() => setIsEditNameModalOpen(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveName} className="mt-4 space-y-4 text-xs">
              <p className="text-slate-500">
                Enter your student name and class details below:
              </p>

              <div>
                <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">
                  Student Name *
                </label>
                <input
                  type="text"
                  required
                  autoFocus
                  value={editNameInput}
                  onChange={(e) => setEditNameInput(e.target.value)}
                  placeholder="e.g. Muhammad Ali, Ahmed Khan..."
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                />
              </div>

              <div>
                <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">
                  Enrolled Class
                </label>
                <input
                  type="text"
                  value={editClassInput}
                  onChange={(e) => setEditClassInput(e.target.value)}
                  placeholder="e.g. Nursery, Class 1, Class 10..."
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsEditNameModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold"
                >
                  Save Details
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: PRINT CHALLAN */}
      {selectedChallanForPrint && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
          <div className="w-full max-w-4xl bg-white text-slate-900 rounded-3xl shadow-2xl p-6 sm:p-8 border border-slate-200 my-8">
            <div className="flex items-center justify-between pb-4 border-b border-slate-200">
              <div className="flex items-center gap-2">
                <Receipt className="w-5 h-5 text-blue-600" />
                <h3 className="text-base font-bold text-slate-900">
                  Apex School System - 3-Part Fee Challan
                </h3>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={triggerBrowserPrint}
                  className="px-3.5 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition-colors flex items-center gap-1.5 shadow-xs"
                >
                  <Printer className="w-3.5 h-3.5" /> Print Challan
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedChallanForPrint(null)}
                  className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4 border border-slate-300 p-4 rounded-2xl bg-slate-50/50 text-[11px]">
              {['Bank Copy', 'Institute Copy', 'Student Copy'].map((copyTitle, cIdx) => (
                <div key={cIdx} className={`p-3 bg-white rounded-xl border border-slate-200 flex flex-col justify-between ${cIdx > 0 ? 'border-dashed border-l-slate-300' : ''}`}>
                  <div>
                    <div className="text-center pb-2 border-b border-slate-200">
                      <span className="font-extrabold uppercase text-[10px] text-blue-700 block">
                        Apex School System
                      </span>
                      <h4 className="font-bold text-xs mt-0.5">Management System</h4>
                      <span className="inline-block mt-1 px-2 py-0.5 rounded bg-slate-100 font-bold uppercase text-[9px]">
                        {copyTitle}
                      </span>
                    </div>

                    <div className="mt-2 space-y-1">
                      <div className="flex justify-between">
                        <span className="text-slate-500">Challan #:</span>
                        <span className="font-mono font-bold">{selectedChallanForPrint.challanNo}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-500">Student Name:</span>
                        <span className="font-bold">{studentName}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-500">Class:</span>
                        <span>{studentClass}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-500">Due Date:</span>
                        <span className="font-bold text-rose-600">{selectedChallanForPrint.dueDate}</span>
                      </div>
                    </div>

                    <div className="mt-3 pt-2 border-t border-slate-200 space-y-1">
                      <div className="flex justify-between">
                        <span>Tuition Fee</span>
                        <span>PKR 8,500</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Activity & Material</span>
                        <span>PKR 875</span>
                      </div>
                      <div className="pt-2 border-t border-slate-300 flex justify-between font-bold text-xs text-slate-900">
                        <span>Total Payable</span>
                        <span>PKR 9,375</span>
                      </div>
                    </div>
                  </div>

                  <div className="mt-6 pt-3 border-t border-dashed border-slate-200 text-center">
                    <span className="text-[9px] text-slate-400 block">Bank Officer Signature & Stamp</span>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-6 flex justify-end">
              <button
                type="button"
                onClick={() => setSelectedChallanForPrint(null)}
                className="px-5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: REPORT CARD */}
      {isReportCardModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="w-full max-w-2xl bg-white text-slate-900 rounded-3xl shadow-2xl p-6 border border-slate-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200">
              <h3 className="font-bold text-sm">Student Academic Progress Report</h3>
              <button onClick={() => setIsReportCardModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6 text-center">
              <h2 className="text-xl font-bold">Apex School System</h2>
              <p className="text-xs text-slate-500">Student: {studentName} &bull; Class: {studentClass}</p>
              <div className="mt-6 p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs">
                <p className="font-semibold text-emerald-600">Status: Enrolled in Active Session</p>
                <p className="text-slate-400 mt-1">Official term report card will be published at the end of the term.</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: VIEW NOTICE */}
      {viewingNotice && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="w-full max-w-md bg-white text-slate-900 rounded-3xl shadow-2xl p-6 border border-slate-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200">
              <h3 className="font-bold text-sm">{viewingNotice.title}</h3>
              <button onClick={() => setViewingNotice(null)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="mt-4 text-xs text-slate-600 leading-relaxed">
              <span className="text-[10px] text-slate-400 block mb-2">{viewingNotice.date}</span>
              {viewingNotice.content}
            </div>
            <div className="mt-6 flex justify-end">
              <button
                type="button"
                onClick={() => setViewingNotice(null)}
                className="px-4 py-1.5 rounded-xl bg-slate-900 text-white text-xs font-semibold"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: APPLY LEAVE */}
      {isLeaveModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="w-full max-w-md bg-white text-slate-900 rounded-3xl shadow-2xl p-6 border border-slate-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200">
              <h3 className="font-bold text-sm">Apply for Student Leave</h3>
              <button onClick={() => setIsLeaveModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={(e) => { e.preventDefault(); alert('Leave submitted!'); setIsLeaveModalOpen(false); }} className="mt-4 space-y-3 text-xs">
              <div>
                <label className="block text-slate-600 font-semibold mb-1">Reason</label>
                <input required placeholder="e.g. Sick Leave, Family Wedding" className="w-full px-3 py-2 rounded-xl border border-slate-200" />
              </div>
              <div>
                <label className="block text-slate-600 font-semibold mb-1">Date</label>
                <input type="date" required className="w-full px-3 py-2 rounded-xl border border-slate-200" />
              </div>
              <div className="pt-2 flex justify-end gap-2">
                <button type="button" onClick={() => setIsLeaveModalOpen(false)} className="px-4 py-2 rounded-xl text-slate-600">Cancel</button>
                <button type="submit" className="px-4 py-2 rounded-xl bg-blue-600 text-white font-bold">Submit</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
