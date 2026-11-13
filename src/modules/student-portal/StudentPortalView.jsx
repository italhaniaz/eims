import React, { useState, useMemo } from 'react'
import {
  Home,
  BookOpen,
  GraduationCap,
  Calendar,
  CheckCircle2,
  Clock,
  LogOut,
  ChevronRight,
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
  Share2,
  ArrowLeft,
  List
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

  // Student Section State (Default 'Super' as shown in screenshot)
  const [studentSection, setStudentSection] = useState(() => {
    try {
      const stored = localStorage.getItem('sms_student_custom_section')
      if (stored) return stored
      return user?.section || 'Super'
    } catch {}
    return 'Super'
  })

  // Modal to enter/edit student name
  const [isEditNameModalOpen, setIsEditNameModalOpen] = useState(false)
  const [editNameInput, setEditNameInput] = useState('')
  const [editClassInput, setEditClassInput] = useState('')
  const [editSectionInput, setEditSectionInput] = useState('')

  // Navigation Tabs:
  // 'dashboard' | 'timetable' | 'attendance' | 'assignments' | 'resources' |
  // 'report-cards' | 'announcements' | 'communication' | 'fees' | 'download-app' | 'account'
  const [activeTab, setActiveTab] = useState('dashboard')
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [isNotifOpen, setIsNotifOpen] = useState(false)

  // Timetable sub-tabs: 'weekly' | 'exam'
  const [timetableSubTab, setTimetableSubTab] = useState('weekly')

  // Attendance filter states (matching screenshots)
  const [attendanceViewMode, setAttendanceViewMode] = useState('Month calendar')
  const [attendanceCategory, setAttendanceCategory] = useState('General (daily)')
  const [attendanceSelectedMonth, setAttendanceSelectedMonth] = useState('November')
  const [attendanceSelectedYear, setAttendanceSelectedYear] = useState('2026')
  const [attendanceStats, setAttendanceStats] = useState({
    present: 0,
    absent: 0,
    percentage: '0.0',
    workingDays: 21
  })

  // Sub-feature states
  const [selectedChallanForPrint, setSelectedChallanForPrint] = useState(null)
  const [isReportCardModalOpen, setIsReportCardModalOpen] = useState(false)
  const [isLeaveModalOpen, setIsLeaveModalOpen] = useState(false)
  const [viewingNotice, setViewingNotice] = useState(null)

  // Quick link highlight state
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
      if (editSectionInput.trim()) {
        setStudentSection(editSectionInput.trim())
        localStorage.setItem('sms_student_custom_section', editSectionInput.trim())
      }
      // Update session storage user payload
      const sessionUser = sessionStorage.getItem('sms_auth_user')
      if (sessionUser) {
        const parsed = JSON.parse(sessionUser)
        parsed.name = cleanName
        if (editClassInput.trim()) parsed.className = editClassInput.trim()
        if (editSectionInput.trim()) parsed.section = editSectionInput.trim()
        sessionStorage.setItem('sms_auth_user', JSON.stringify(parsed))
      }
    } catch {}
    setIsEditNameModalOpen(false)
    toast?.success?.('Profile details updated successfully!') || alert('Details updated!')
  }

  // Pre-fill edit modal when opening
  const openEditModal = () => {
    setEditNameInput(studentName === 'Unknown' ? '' : studentName)
    setEditClassInput(studentClass)
    setEditSectionInput(studentSection)
    setIsEditNameModalOpen(true)
  }

  // Current formatted date
  const todayFormatted = useMemo(() => {
    return 'Friday, 13 Nov 2026'
  }, [])

  // Class Schedule data for today's card
  const todaySchedule = [
    { time: '1:00 PM - 1:30 PM', subject: 'English', teacher: 'Ma\'am Ayesha', room: 'Room 2' },
    { time: '1:30 PM - 2:00 PM', subject: 'Math', teacher: 'Sir Tariq', room: 'Room 2' },
    { time: '3:30 PM - 4:00 PM', subject: 'Play Activity', teacher: 'Activity Supervisor', room: 'Activity Hall' }
  ]

  // Weekly Timetable Grid Data (Matching Screenshot 1, 2 & 3)
  const weeklyTimetableDays = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday']
  const weeklyPeriodSlots = [
    { start: '8:00 AM', end: '8:30 AM', subject: 'English' },
    { start: '8:30 AM', end: '9:00 AM', subject: 'Math' },
    { start: '10:30 AM', end: '11:00 AM', subject: 'Play Activity' }
  ]

  // Flattened "Your week at a glance" schedule (Matching Screenshot 3)
  const weekAtAGlanceItems = useMemo(() => {
    const list = []
    weeklyTimetableDays.forEach(day => {
      weeklyPeriodSlots.forEach(slot => {
        list.push({
          time: `${slot.start} - ${slot.end}`,
          subject: slot.subject,
          day: day
        })
      })
    })
    return list
  }, [])

  // Exam Datesheet Data
  const examDatesheet = [
    {
      date: '01 Dec 2026',
      day: 'Monday',
      time: '09:00 AM - 11:00 AM',
      subject: 'English',
      syllabus: 'Alphabets A-Z, Phonics & Object Identification',
      room: 'Room 2'
    },
    {
      date: '03 Dec 2026',
      day: 'Wednesday',
      time: '09:00 AM - 11:00 AM',
      subject: 'Math',
      syllabus: 'Numbers 1-50, Shapes & Counting',
      room: 'Room 2'
    },
    {
      date: '05 Dec 2026',
      day: 'Friday',
      time: '09:00 AM - 11:00 AM',
      subject: 'Play Activity',
      syllabus: 'Color Identification & Social Activities',
      room: 'Activity Hall'
    }
  ]

  // Announcements list (from screenshots)
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
        {/* SIDEBAR NAVIGATION (Matching Screenshot 1, 2 & 3) */}
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
                className="w-full py-1 px-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-[11px] font-semibold transition-colors shadow-xs cursor-pointer"
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
          {/* TAB 1: DASHBOARD */}
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

              {/* WELCOME BANNER */}
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

              {/* TODAY'S CLASSES BANNER */}
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

              {/* TWO SUMMARY KPI CARDS */}
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

              {/* QUICK LINKS SECTION */}
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

              {/* TWO BOTTOM COLUMNS */}
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

          {/* TAB 2: MY TIMETABLE (Matching Screenshot 1, 2 & 3 Exactly) */}
          {activeTab === 'timetable' && (
            <div className="space-y-4">
              {/* Header Title & Back Button */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-1">
                <div>
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-md bg-blue-100 text-blue-600 flex items-center justify-center">
                      <FileText className="w-4 h-4" />
                    </div>
                    <h1 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white">
                      My Timetable
                    </h1>
                  </div>
                  <button
                    type="button"
                    onClick={() => setActiveTab('dashboard')}
                    className="flex items-center gap-1 text-xs text-slate-500 hover:text-slate-800 dark:hover:text-white font-medium mt-1 cursor-pointer"
                  >
                    <ArrowLeft className="w-3.5 h-3.5" /> Back
                  </button>
                </div>

                {/* Right Top Action Icons */}
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

              {/* SECTION: My class timetable Header */}
              <div className="pt-1">
                <div className="flex items-center gap-2">
                  <CalendarDays className="w-4 h-4 text-blue-600" />
                  <h2 className="text-sm font-bold text-slate-900 dark:text-white">
                    My class timetable
                  </h2>
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  View your weekly schedule and exam dates in one place.
                </p>
              </div>

              {/* Student Details Pill Card */}
              <div className={`px-4 py-3 rounded-2xl border transition-all ${
                isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200/80 shadow-xs'
              } flex items-center gap-3 text-xs`}>
                <div className="flex items-center gap-1.5 font-bold text-slate-800 dark:text-white">
                  <GraduationCap className="w-4 h-4 text-slate-700 dark:text-slate-300" />
                  <span>{studentName}</span>
                </div>
                <span className="text-slate-300 dark:text-slate-600">&bull;</span>
                <div className="text-slate-600 dark:text-slate-300">
                  Class: <span className="font-bold text-slate-900 dark:text-white">{studentClass}</span>
                </div>
                <span className="text-slate-300 dark:text-slate-600">&bull;</span>
                <div className="text-slate-600 dark:text-slate-300">
                  Section: <span className="font-bold text-slate-900 dark:text-white">{studentSection}</span>
                </div>
              </div>

              {/* TODAY'S CLASSES MINT GREEN CARD */}
              <div className="p-5 rounded-2xl border border-emerald-100 dark:border-emerald-900/40 bg-gradient-to-r from-[#eefbf4] to-[#f4fdf8] dark:from-emerald-950/20 dark:to-teal-950/20 shadow-xs">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-1.5 text-xs font-medium text-slate-600 dark:text-slate-400">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block" />
                    <span>Today · Friday, 13 Nov</span>
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      const el = document.getElementById('timetable-grid-section')
                      el?.scrollIntoView({ behavior: 'smooth' })
                    }}
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

              {/* SUB-TABS: Weekly Schedule (1) vs Exam Datesheet (1) */}
              <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 pt-2 pb-0">
                <button
                  type="button"
                  onClick={() => setTimetableSubTab('weekly')}
                  className={`pb-3 px-3 text-xs font-bold flex items-center gap-2 border-b-2 transition-colors cursor-pointer ${
                    timetableSubTab === 'weekly'
                      ? 'border-blue-600 text-blue-600 dark:border-blue-400 dark:text-blue-400'
                      : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-white'
                  }`}
                >
                  <Calendar className="w-4 h-4" />
                  <span>Weekly schedule</span>
                  <span className="px-1.5 py-0.2 rounded-full text-[10px] font-bold bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300">
                    1
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => setTimetableSubTab('exam')}
                  className={`pb-3 px-3 text-xs font-bold flex items-center gap-2 border-b-2 transition-colors cursor-pointer ${
                    timetableSubTab === 'exam'
                      ? 'border-blue-600 text-blue-600 dark:border-blue-400 dark:text-blue-400'
                      : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-white'
                  }`}
                >
                  <FileText className="w-4 h-4" />
                  <span>Exam datesheet</span>
                  <span className="px-1.5 py-0.2 rounded-full text-[10px] font-bold bg-amber-500 text-white">
                    1
                  </span>
                </button>
              </div>

              {/* SUB-TAB CONTENT: WEEKLY SCHEDULE */}
              {timetableSubTab === 'weekly' && (
                <div id="timetable-grid-section" className="space-y-4 pt-1">
                  {/* Top Header of Table: Class Schedule Title + Legend + Print Button */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                    <div className="flex flex-wrap items-center gap-3">
                      <span className="font-bold text-slate-900 dark:text-white">
                        {studentClass} Class Schedule &bull; 2026-2027
                      </span>

                      {/* Legend */}
                      <div className="flex items-center gap-3 text-[11px] text-slate-500">
                        <div className="flex items-center gap-1.5">
                          <span className="w-3 h-3 rounded-xs border border-blue-200 bg-white inline-block" />
                          <span>Class period</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <span className="w-3 h-3 rounded-xs border border-amber-300 bg-[#fff5d6] inline-block" />
                          <span>Today (Friday)</span>
                        </div>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={triggerBrowserPrint}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-rose-200 dark:border-rose-900/60 bg-white dark:bg-slate-900 text-rose-600 dark:text-rose-400 font-semibold hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors shadow-2xs cursor-pointer w-fit"
                    >
                      <Printer className="w-3.5 h-3.5" />
                      <span>Print</span>
                    </button>
                  </div>

                  {/* TWO-COLUMN LAYOUT: TIMETABLE GRID (LEFT) + YOUR WEEK AT A GLANCE (RIGHT) */}
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                    {/* LEFT 2 COLUMNS: WEEKLY TIMETABLE TABLE */}
                    <div className={`lg:col-span-2 rounded-2xl border ${
                      isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'
                    } overflow-hidden shadow-xs`}>
                      <div className="overflow-x-auto">
                        <table className="w-full text-xs text-left border-collapse">
                          <thead>
                            <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/60 text-slate-600 dark:text-slate-300">
                              <th className="py-3 px-4 font-bold border-r border-slate-200 dark:border-slate-800 w-28">
                                Day
                              </th>
                              <th className="py-2.5 px-4 font-bold border-r border-slate-200 dark:border-slate-800 text-center">
                                <div>8:00 AM</div>
                                <div className="text-[10px] text-slate-400 font-normal">8:30 AM</div>
                              </th>
                              <th className="py-2.5 px-4 font-bold border-r border-slate-200 dark:border-slate-800 text-center">
                                <div>8:30 AM</div>
                                <div className="text-[10px] text-slate-400 font-normal">9:00 AM</div>
                              </th>
                              <th className="py-2.5 px-4 font-bold text-center">
                                <div>10:30 AM</div>
                                <div className="text-[10px] text-slate-400 font-normal">11:00 AM</div>
                              </th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                            {weeklyTimetableDays.map(day => {
                              const isToday = day === 'Friday'
                              return (
                                <tr key={day} className="transition-colors">
                                  {/* Day Column (Friday highlighted in yellow as today) */}
                                  <td className={`py-3.5 px-4 font-semibold border-r border-slate-200 dark:border-slate-800 ${
                                    isToday
                                      ? 'bg-[#fff5d6] text-amber-950 font-bold border-l-4 border-l-amber-400'
                                      : 'text-slate-700 dark:text-slate-300'
                                  }`}>
                                    {day}
                                  </td>

                                  {/* Period 1: English */}
                                  <td className="py-3.5 px-4 border-r border-slate-200 dark:border-slate-800 text-center">
                                    <div className="px-3 py-1.5 rounded-lg bg-[#eaf4fb] dark:bg-blue-950/40 text-slate-800 dark:text-blue-200 font-semibold border border-blue-100 dark:border-blue-900/60 inline-block w-full">
                                      English
                                    </div>
                                  </td>

                                  {/* Period 2: Math */}
                                  <td className="py-3.5 px-4 border-r border-slate-200 dark:border-slate-800 text-center">
                                    <div className="px-3 py-1.5 rounded-lg bg-[#eaf4fb] dark:bg-blue-950/40 text-slate-800 dark:text-blue-200 font-semibold border border-blue-100 dark:border-blue-900/60 inline-block w-full">
                                      Math
                                    </div>
                                  </td>

                                  {/* Period 3: Play Activity */}
                                  <td className="py-3.5 px-4 text-center">
                                    <div className="px-3 py-1.5 rounded-lg bg-[#eaf4fb] dark:bg-blue-950/40 text-slate-800 dark:text-blue-200 font-semibold border border-blue-100 dark:border-blue-900/60 inline-block w-full">
                                      Play Activity
                                    </div>
                                  </td>
                                </tr>
                              )
                            })}
                          </tbody>
                        </table>
                      </div>
                    </div>

                    {/* RIGHT COLUMN: "YOUR WEEK AT A GLANCE" (Red Box in Screenshot 3) */}
                    <div className={`rounded-2xl border ${
                      isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'
                    } p-4 shadow-xs flex flex-col justify-between`}>
                      <div>
                        {/* Header with Green List Icon */}
                        <div className="flex items-center gap-2 pb-3 mb-2 border-b border-slate-100 dark:border-slate-800">
                          <List className="w-4 h-4 text-emerald-600 stroke-[2.5]" />
                          <h3 className="text-xs font-bold text-slate-900 dark:text-white">
                            Your week at a glance
                          </h3>
                        </div>

                        {/* Chronological List of Classes */}
                        <div className="max-h-[380px] overflow-y-auto space-y-3.5 pr-1 divide-y divide-slate-100 dark:divide-slate-800">
                          {weekAtAGlanceItems.map((item, index) => (
                            <div key={index} className={`pt-2.5 first:pt-0 flex items-start justify-between text-xs`}>
                              {/* Left: Green Bold Time */}
                              <span className="font-bold text-emerald-600 dark:text-emerald-400 text-xs w-36 shrink-0">
                                {item.time}
                              </span>

                              {/* Right: Subject Name & Day Subtext */}
                              <div className="text-right">
                                <span className="font-bold text-slate-800 dark:text-white block">
                                  {item.subject}
                                </span>
                                <span className="text-[10px] text-slate-400 block mt-0.5">
                                  {item.day}
                                </span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>

                      <div className="pt-3 mt-3 border-t border-slate-100 dark:border-slate-800 text-center">
                        <span className="text-[11px] text-slate-400">
                          Showing full weekly scheduled periods
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* SUB-TAB CONTENT: EXAM DATESHEET */}
              {timetableSubTab === 'exam' && (
                <div className="space-y-4 pt-1">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                        Mid-Term Examinations Datesheet · 2026-2027
                      </h3>
                      <p className="text-xs text-slate-500">Official schedule of assessments</p>
                    </div>
                    <button
                      type="button"
                      onClick={triggerBrowserPrint}
                      className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl border border-rose-200 bg-white text-rose-600 text-xs font-semibold hover:bg-rose-50"
                    >
                      <Printer className="w-3.5 h-3.5" /> Print Datesheet
                    </button>
                  </div>

                  <div className={`rounded-2xl border ${
                    isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'
                  } overflow-hidden shadow-xs`}>
                    <table className="w-full text-xs text-left">
                      <thead>
                        <tr className="border-b bg-slate-50 dark:bg-slate-800/60 text-slate-600 dark:text-slate-300 font-bold uppercase text-[10px]">
                          <th className="py-3 px-4">Date & Day</th>
                          <th className="py-3 px-4">Exam Time</th>
                          <th className="py-3 px-4">Subject</th>
                          <th className="py-3 px-4">Syllabus / Topics</th>
                          <th className="py-3 px-4">Room</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-slate-700 dark:text-slate-300">
                        {examDatesheet.map((row, idx) => (
                          <tr key={idx} className="hover:bg-slate-50/50">
                            <td className="py-3.5 px-4 font-bold text-slate-900 dark:text-white">
                              {row.date} ({row.day})
                            </td>
                            <td className="py-3.5 px-4 font-semibold text-emerald-600">{row.time}</td>
                            <td className="py-3.5 px-4 font-bold">{row.subject}</td>
                            <td className="py-3.5 px-4 text-slate-500">{row.syllabus}</td>
                            <td className="py-3.5 px-4">{row.room}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB 3: MY ATTENDANCE REPORT (Matching Screenshot 1 & 2 Exactly) */}
          {activeTab === 'attendance' && (
            <div className="space-y-4">
              {/* Top Subheader: "My Attendance Report" + Back Button */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-1">
                <div>
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-md bg-blue-100 text-blue-600 flex items-center justify-center">
                      <FileText className="w-4 h-4" />
                    </div>
                    <h1 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white">
                      My Attendance Report
                    </h1>
                  </div>
                  <button
                    type="button"
                    onClick={() => setActiveTab('dashboard')}
                    className="flex items-center gap-1 text-xs text-slate-500 hover:text-slate-800 dark:hover:text-white font-medium mt-1 cursor-pointer"
                  >
                    <ArrowLeft className="w-3.5 h-3.5" /> Back
                  </button>
                </div>

                {/* Right Top Action Icons */}
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
                    className="flex flex-col items-center gap-1 px-3 py-1.5 rounded-xl bg-[#eef4ff] text-[#2563eb] font-semibold dark:bg-blue-950/50 dark:text-blue-300 transition-colors cursor-pointer"
                  >
                    <Calendar className="w-4 h-4 text-[#2563eb] dark:text-blue-300" />
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

              {/* Section Header Card */}
              <div className="pt-1">
                <div className="flex items-center gap-2">
                  <CalendarDays className="w-4 h-4 text-blue-600" />
                  <h2 className="text-sm font-bold text-slate-900 dark:text-white">
                    My Attendance Report
                  </h2>
                </div>

                {/* Cyan/Blue Tinted Student Info Bar */}
                <div className="mt-3 p-3 rounded-2xl bg-[#eefbfd] dark:bg-cyan-950/30 border border-cyan-200/70 dark:border-cyan-800/60 flex flex-wrap items-center gap-3 text-xs">
                  <div className="flex items-center gap-1.5 font-bold text-slate-800 dark:text-slate-100">
                    <User className="w-4 h-4 text-slate-700 dark:text-slate-300" />
                    <span>{studentName}</span>
                  </div>
                  <span className="px-2.5 py-0.5 rounded-md bg-[#2563eb] text-white font-bold text-xs shadow-2xs">
                    Roll: NU1
                  </span>
                  <span className="px-2.5 py-0.5 rounded-md bg-[#06b6d4] text-white font-bold text-xs shadow-2xs">
                    {studentClass} - {studentSection}
                  </span>
                </div>
              </div>

              {/* FILTERS ROW (4 Select Dropdowns matching Screenshot 1 & 2) */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
                {/* 1. View Filter */}
                <div>
                  <label className="block text-slate-600 dark:text-slate-300 font-semibold mb-1">
                    👁 View
                  </label>
                  <select
                    value={attendanceViewMode}
                    onChange={(e) => setAttendanceViewMode(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs focus:ring-2 focus:ring-blue-500/20"
                  >
                    <option value="Month calendar">Month calendar</option>
                    <option value="Daily log list">Daily log list</option>
                    <option value="Subject-wise">Subject-wise</option>
                  </select>
                </div>

                {/* 2. Attendance Type */}
                <div>
                  <label className="block text-slate-600 dark:text-slate-300 font-semibold mb-1">
                    ≡ Attendance type
                  </label>
                  <select
                    value={attendanceCategory}
                    onChange={(e) => setAttendanceCategory(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs focus:ring-2 focus:ring-blue-500/20"
                  >
                    <option value="General (daily)">General (daily)</option>
                    <option value="Subject-wise">Subject-wise</option>
                  </select>
                </div>

                {/* 3. Month */}
                <div>
                  <label className="block text-slate-600 dark:text-slate-300 font-semibold mb-1">
                    Month
                  </label>
                  <select
                    value={attendanceSelectedMonth}
                    onChange={(e) => setAttendanceSelectedMonth(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs focus:ring-2 focus:ring-blue-500/20"
                  >
                    {['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'].map(m => (
                      <option key={m} value={m}>{m}</option>
                    ))}
                  </select>
                </div>

                {/* 4. Year */}
                <div>
                  <label className="block text-slate-600 dark:text-slate-300 font-semibold mb-1">
                    Year
                  </label>
                  <select
                    value={attendanceSelectedYear}
                    onChange={(e) => setAttendanceSelectedYear(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs focus:ring-2 focus:ring-blue-500/20"
                  >
                    <option value="2025">2025</option>
                    <option value="2026">2026</option>
                    <option value="2027">2027</option>
                  </select>
                </div>
              </div>

              {/* 4 METRIC KPI CARDS (Present, Absent, Attendance %, Working days) */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* 1. Present */}
                <div className={`p-4 rounded-2xl border transition-all ${
                  isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'
                } shadow-xs flex items-center gap-3.5`}>
                  <div className="w-10 h-10 rounded-xl bg-[#10b981] text-white flex items-center justify-center shadow-xs">
                    <Check className="w-5 h-5 stroke-[2.5]" />
                  </div>
                  <div>
                    <span className="text-[11px] text-slate-400 font-medium block">Present</span>
                    <span className="text-2xl font-bold text-slate-900 dark:text-white block mt-0.5">{attendanceStats.present}</span>
                  </div>
                </div>

                {/* 2. Absent */}
                <div className={`p-4 rounded-2xl border transition-all ${
                  isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'
                } shadow-xs flex items-center gap-3.5`}>
                  <div className="w-10 h-10 rounded-xl bg-[#ef4444] text-white flex items-center justify-center shadow-xs">
                    <X className="w-5 h-5 stroke-[2.5]" />
                  </div>
                  <div>
                    <span className="text-[11px] text-slate-400 font-medium block">Absent</span>
                    <span className="text-2xl font-bold text-slate-900 dark:text-white block mt-0.5">{attendanceStats.absent}</span>
                  </div>
                </div>

                {/* 3. Attendance % */}
                <div className={`p-4 rounded-2xl border transition-all ${
                  isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'
                } shadow-xs flex items-center gap-3.5`}>
                  <div className="w-10 h-10 rounded-xl bg-[#2563eb] text-white flex items-center justify-center shadow-xs">
                    <FileCheck className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="text-[11px] text-slate-400 font-medium block">Attendance %</span>
                    <span className="text-2xl font-bold text-slate-900 dark:text-white block mt-0.5">{attendanceStats.percentage}%</span>
                    <span className="text-[9px] text-slate-400 block mt-0.5">(Present + Late + Leave) / marked days</span>
                  </div>
                </div>

                {/* 4. Working days */}
                <div className={`p-4 rounded-2xl border transition-all ${
                  isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'
                } shadow-xs flex items-center gap-3.5`}>
                  <div className="w-10 h-10 rounded-xl bg-[#f97316] text-white flex items-center justify-center shadow-xs">
                    <Calendar className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="text-[11px] text-slate-400 font-medium block">Working days</span>
                    <span className="text-2xl font-bold text-slate-900 dark:text-white block mt-0.5">{attendanceStats.workingDays}</span>
                  </div>
                </div>
              </div>

              {/* MONTHLY CALENDAR GRID (November 2026 - Exact Match) */}
              <div className={`rounded-2xl border ${
                isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'
              } p-5 shadow-xs space-y-4`}>
                {/* Calendar Title */}
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-slate-600 dark:text-slate-300" />
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                    {attendanceSelectedMonth} {attendanceSelectedYear}
                  </h3>
                </div>

                {/* Month Calendar Table Grid */}
                <div className="overflow-x-auto border border-slate-200 dark:border-slate-800 rounded-xl">
                  <table className="w-full text-xs text-center border-collapse">
                    <thead>
                      <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 font-bold">
                        <th className="py-2.5 px-2 border-r border-slate-200 dark:border-slate-800 bg-[#f8fafc] dark:bg-slate-800/60 w-1/7">Sun</th>
                        <th className="py-2.5 px-2 border-r border-slate-200 dark:border-slate-800 w-1/7">Mon</th>
                        <th className="py-2.5 px-2 border-r border-slate-200 dark:border-slate-800 w-1/7">Tue</th>
                        <th className="py-2.5 px-2 border-r border-slate-200 dark:border-slate-800 w-1/7">Wed</th>
                        <th className="py-2.5 px-2 border-r border-slate-200 dark:border-slate-800 w-1/7">Thu</th>
                        <th className="py-2.5 px-2 border-r border-slate-200 dark:border-slate-800 w-1/7">Fri</th>
                        <th className="py-2.5 px-2 bg-[#f0f6fc] dark:bg-blue-950/20 w-1/7">Sat</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                      {/* Week 1: 1 (Sun) to 7 (Sat) */}
                      <tr className="h-20">
                        {/* Sun 1 */}
                        <td className="p-2 border-r border-slate-200 dark:border-slate-800 bg-[#fafcff] dark:bg-slate-900/40 align-top">
                          <span className="font-bold text-slate-700 dark:text-slate-300 block mb-1.5">1</span>
                          <span className="px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 font-bold text-[10px] uppercase">
                            OFF
                          </span>
                          <span className="text-[9px] text-slate-400 block mt-1">Weekly off</span>
                        </td>
                        {/* Mon 2 */}
                        <td className="p-2 border-r border-slate-200 dark:border-slate-800 align-top">
                          <span className="font-bold text-slate-700 dark:text-slate-300 block mb-2">2</span>
                          <div className="w-6 h-6 rounded bg-[#6b7280] text-white flex items-center justify-center font-bold text-xs mx-auto shadow-2xs">
                            -
                          </div>
                        </td>
                        {/* Tue 3 */}
                        <td className="p-2 border-r border-slate-200 dark:border-slate-800 align-top">
                          <span className="font-bold text-slate-700 dark:text-slate-300 block mb-2">3</span>
                          <div className="w-6 h-6 rounded bg-[#6b7280] text-white flex items-center justify-center font-bold text-xs mx-auto shadow-2xs">
                            -
                          </div>
                        </td>
                        {/* Wed 4 */}
                        <td className="p-2 border-r border-slate-200 dark:border-slate-800 align-top">
                          <span className="font-bold text-slate-700 dark:text-slate-300 block mb-2">4</span>
                          <div className="w-6 h-6 rounded bg-[#6b7280] text-white flex items-center justify-center font-bold text-xs mx-auto shadow-2xs">
                            -
                          </div>
                        </td>
                        {/* Thu 5 */}
                        <td className="p-2 border-r border-slate-200 dark:border-slate-800 align-top">
                          <span className="font-bold text-slate-700 dark:text-slate-300 block mb-2">5</span>
                          <div className="w-6 h-6 rounded bg-[#6b7280] text-white flex items-center justify-center font-bold text-xs mx-auto shadow-2xs">
                            -
                          </div>
                        </td>
                        {/* Fri 6 */}
                        <td className="p-2 border-r border-slate-200 dark:border-slate-800 align-top">
                          <span className="font-bold text-slate-700 dark:text-slate-300 block mb-2">6</span>
                          <div className="w-6 h-6 rounded bg-[#6b7280] text-white flex items-center justify-center font-bold text-xs mx-auto shadow-2xs">
                            -
                          </div>
                        </td>
                        {/* Sat 7 */}
                        <td className="p-2 bg-[#f0f6fc] dark:bg-blue-950/20 align-top">
                          <span className="font-bold text-slate-700 dark:text-slate-300 block mb-1.5">7</span>
                          <span className="px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 font-bold text-[10px] uppercase">
                            OFF
                          </span>
                          <span className="text-[9px] text-slate-400 block mt-1">Weekly off</span>
                        </td>
                      </tr>

                      {/* Week 2: 8 to 14 */}
                      <tr className="h-20">
                        {/* Sun 8 */}
                        <td className="p-2 border-r border-slate-200 dark:border-slate-800 bg-[#fafcff] dark:bg-slate-900/40 align-top">
                          <span className="font-bold text-slate-700 dark:text-slate-300 block mb-1.5">8</span>
                          <span className="px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 font-bold text-[10px] uppercase">
                            OFF
                          </span>
                          <span className="text-[9px] text-slate-400 block mt-1">Weekly off</span>
                        </td>
                        {/* Mon 9 */}
                        <td className="p-2 border-r border-slate-200 dark:border-slate-800 align-top">
                          <span className="font-bold text-slate-700 dark:text-slate-300 block mb-2">9</span>
                          <div className="w-6 h-6 rounded bg-[#6b7280] text-white flex items-center justify-center font-bold text-xs mx-auto shadow-2xs">
                            -
                          </div>
                        </td>
                        {/* Tue 10 */}
                        <td className="p-2 border-r border-slate-200 dark:border-slate-800 align-top">
                          <span className="font-bold text-slate-700 dark:text-slate-300 block mb-2">10</span>
                          <div className="w-6 h-6 rounded bg-[#6b7280] text-white flex items-center justify-center font-bold text-xs mx-auto shadow-2xs">
                            -
                          </div>
                        </td>
                        {/* Wed 11 */}
                        <td className="p-2 border-r border-slate-200 dark:border-slate-800 align-top">
                          <span className="font-bold text-slate-700 dark:text-slate-300 block mb-2">11</span>
                          <div className="w-6 h-6 rounded bg-[#6b7280] text-white flex items-center justify-center font-bold text-xs mx-auto shadow-2xs">
                            -
                          </div>
                        </td>
                        {/* Thu 12 */}
                        <td className="p-2 border-r border-slate-200 dark:border-slate-800 align-top">
                          <span className="font-bold text-slate-700 dark:text-slate-300 block mb-2">12</span>
                          <div className="w-6 h-6 rounded bg-[#6b7280] text-white flex items-center justify-center font-bold text-xs mx-auto shadow-2xs">
                            -
                          </div>
                        </td>
                        {/* Fri 13 */}
                        <td className="p-2 border-r border-slate-200 dark:border-slate-800 align-top">
                          <span className="font-bold text-slate-700 dark:text-slate-300 block mb-2">13</span>
                          <div className="w-6 h-6 rounded bg-[#6b7280] text-white flex items-center justify-center font-bold text-xs mx-auto shadow-2xs">
                            -
                          </div>
                        </td>
                        {/* Sat 14 */}
                        <td className="p-2 bg-[#f0f6fc] dark:bg-blue-950/20 align-top">
                          <span className="font-bold text-slate-700 dark:text-slate-300 block mb-1.5">14</span>
                          <span className="px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 font-bold text-[10px] uppercase">
                            OFF
                          </span>
                          <span className="text-[9px] text-slate-400 block mt-1">Weekly off</span>
                        </td>
                      </tr>

                      {/* Week 3: 15 to 21 */}
                      <tr className="h-20">
                        {/* Sun 15 */}
                        <td className="p-2 border-r border-slate-200 dark:border-slate-800 bg-[#fafcff] dark:bg-slate-900/40 align-top">
                          <span className="font-bold text-slate-700 dark:text-slate-300 block mb-1.5">15</span>
                          <span className="px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 font-bold text-[10px] uppercase">
                            OFF
                          </span>
                          <span className="text-[9px] text-slate-400 block mt-1">Weekly off</span>
                        </td>
                        {/* Mon 16 */}
                        <td className="p-2 border-r border-slate-200 dark:border-slate-800 align-top">
                          <span className="font-bold text-slate-700 dark:text-slate-300 block mb-2">16</span>
                          <div className="w-6 h-6 rounded bg-[#6b7280] text-white flex items-center justify-center font-bold text-xs mx-auto shadow-2xs">
                            -
                          </div>
                        </td>
                        {/* Tue 17 */}
                        <td className="p-2 border-r border-slate-200 dark:border-slate-800 align-top">
                          <span className="font-bold text-slate-700 dark:text-slate-300 block mb-2">17</span>
                          <div className="w-6 h-6 rounded bg-[#6b7280] text-white flex items-center justify-center font-bold text-xs mx-auto shadow-2xs">
                            -
                          </div>
                        </td>
                        {/* Wed 18 */}
                        <td className="p-2 border-r border-slate-200 dark:border-slate-800 align-top">
                          <span className="font-bold text-slate-700 dark:text-slate-300 block mb-2">18</span>
                          <div className="w-6 h-6 rounded bg-[#6b7280] text-white flex items-center justify-center font-bold text-xs mx-auto shadow-2xs">
                            -
                          </div>
                        </td>
                        {/* Thu 19 */}
                        <td className="p-2 border-r border-slate-200 dark:border-slate-800 align-top">
                          <span className="font-bold text-slate-700 dark:text-slate-300 block mb-2">19</span>
                          <div className="w-6 h-6 rounded bg-[#6b7280] text-white flex items-center justify-center font-bold text-xs mx-auto shadow-2xs">
                            -
                          </div>
                        </td>
                        {/* Fri 20 */}
                        <td className="p-2 border-r border-slate-200 dark:border-slate-800 align-top">
                          <span className="font-bold text-slate-700 dark:text-slate-300 block mb-2">20</span>
                          <div className="w-6 h-6 rounded bg-[#6b7280] text-white flex items-center justify-center font-bold text-xs mx-auto shadow-2xs">
                            -
                          </div>
                        </td>
                        {/* Sat 21 */}
                        <td className="p-2 bg-[#f0f6fc] dark:bg-blue-950/20 align-top">
                          <span className="font-bold text-slate-700 dark:text-slate-300 block mb-1.5">21</span>
                          <span className="px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 font-bold text-[10px] uppercase">
                            OFF
                          </span>
                          <span className="text-[9px] text-slate-400 block mt-1">Weekly off</span>
                        </td>
                      </tr>

                      {/* Week 4: 22 to 28 */}
                      <tr className="h-20">
                        {/* Sun 22 */}
                        <td className="p-2 border-r border-slate-200 dark:border-slate-800 bg-[#fafcff] dark:bg-slate-900/40 align-top">
                          <span className="font-bold text-slate-700 dark:text-slate-300 block mb-1.5">22</span>
                          <span className="px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 font-bold text-[10px] uppercase">
                            OFF
                          </span>
                          <span className="text-[9px] text-slate-400 block mt-1">Weekly off</span>
                        </td>
                        {/* Mon 23 */}
                        <td className="p-2 border-r border-slate-200 dark:border-slate-800 align-top">
                          <span className="font-bold text-slate-700 dark:text-slate-300 block mb-2">23</span>
                          <div className="w-6 h-6 rounded bg-[#6b7280] text-white flex items-center justify-center font-bold text-xs mx-auto shadow-2xs">
                            -
                          </div>
                        </td>
                        {/* Tue 24 */}
                        <td className="p-2 border-r border-slate-200 dark:border-slate-800 align-top">
                          <span className="font-bold text-slate-700 dark:text-slate-300 block mb-2">24</span>
                          <div className="w-6 h-6 rounded bg-[#6b7280] text-white flex items-center justify-center font-bold text-xs mx-auto shadow-2xs">
                            -
                          </div>
                        </td>
                        {/* Wed 25 */}
                        <td className="p-2 border-r border-slate-200 dark:border-slate-800 align-top">
                          <span className="font-bold text-slate-700 dark:text-slate-300 block mb-2">25</span>
                          <div className="w-6 h-6 rounded bg-[#6b7280] text-white flex items-center justify-center font-bold text-xs mx-auto shadow-2xs">
                            -
                          </div>
                        </td>
                        {/* Thu 26 */}
                        <td className="p-2 border-r border-slate-200 dark:border-slate-800 align-top">
                          <span className="font-bold text-slate-700 dark:text-slate-300 block mb-2">26</span>
                          <div className="w-6 h-6 rounded bg-[#6b7280] text-white flex items-center justify-center font-bold text-xs mx-auto shadow-2xs">
                            -
                          </div>
                        </td>
                        {/* Fri 27 */}
                        <td className="p-2 border-r border-slate-200 dark:border-slate-800 align-top">
                          <span className="font-bold text-slate-700 dark:text-slate-300 block mb-2">27</span>
                          <div className="w-6 h-6 rounded bg-[#6b7280] text-white flex items-center justify-center font-bold text-xs mx-auto shadow-2xs">
                            -
                          </div>
                        </td>
                        {/* Sat 28 */}
                        <td className="p-2 bg-[#f0f6fc] dark:bg-blue-950/20 align-top">
                          <span className="font-bold text-slate-700 dark:text-slate-300 block mb-1.5">28</span>
                          <span className="px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 font-bold text-[10px] uppercase">
                            OFF
                          </span>
                          <span className="text-[9px] text-slate-400 block mt-1">Weekly off</span>
                        </td>
                      </tr>

                      {/* Week 5: 29 & 30 */}
                      <tr className="h-20">
                        {/* Sun 29 */}
                        <td className="p-2 border-r border-slate-200 dark:border-slate-800 bg-[#fafcff] dark:bg-slate-900/40 align-top">
                          <span className="font-bold text-slate-700 dark:text-slate-300 block mb-1.5">29</span>
                          <span className="px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 font-bold text-[10px] uppercase">
                            OFF
                          </span>
                          <span className="text-[9px] text-slate-400 block mt-1">Weekly off</span>
                        </td>
                        {/* Mon 30 */}
                        <td className="p-2 border-r border-slate-200 dark:border-slate-800 align-top">
                          <span className="font-bold text-slate-700 dark:text-slate-300 block mb-2">30</span>
                          <div className="w-6 h-6 rounded bg-[#6b7280] text-white flex items-center justify-center font-bold text-xs mx-auto shadow-2xs">
                            -
                          </div>
                        </td>
                        {/* Remaining empty cells */}
                        <td className="p-2 border-r border-slate-100 dark:border-slate-800/40 bg-slate-50/50 dark:bg-slate-900/20" />
                        <td className="p-2 border-r border-slate-100 dark:border-slate-800/40 bg-slate-50/50 dark:bg-slate-900/20" />
                        <td className="p-2 border-r border-slate-100 dark:border-slate-800/40 bg-slate-50/50 dark:bg-slate-900/20" />
                        <td className="p-2 border-r border-slate-100 dark:border-slate-800/40 bg-slate-50/50 dark:bg-slate-900/20" />
                        <td className="p-2 bg-slate-50/50 dark:bg-slate-900/20" />
                      </tr>
                    </tbody>
                  </table>
                </div>

                {/* BOTTOM LEGEND BAR (All 7 Status Chips matching Screenshot 1 & 2) */}
                <div className="pt-2 flex flex-wrap items-center gap-3 text-xs text-slate-600 dark:text-slate-400">
                  <div className="flex items-center gap-1.5">
                    <span className="w-4 h-4 rounded bg-[#10b981] text-white font-bold text-[10px] flex items-center justify-center">P</span>
                    <span className="text-[11px] font-medium">Present</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="w-4 h-4 rounded bg-[#f97316] text-white font-bold text-[10px] flex items-center justify-center">L</span>
                    <span className="text-[11px] font-medium">Late</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="w-4 h-4 rounded bg-[#ef4444] text-white font-bold text-[10px] flex items-center justify-center">A</span>
                    <span className="text-[11px] font-medium">Absent</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="w-5 h-4 rounded bg-[#06b6d4] text-white font-bold text-[9px] flex items-center justify-center">LV</span>
                    <span className="text-[11px] font-medium">Leave</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="w-4 h-4 rounded bg-[#f59e0b] text-white font-bold text-[10px] flex items-center justify-center">H</span>
                    <span className="text-[11px] font-medium">Holiday</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="px-1 py-0.2 rounded bg-slate-200 text-slate-700 font-bold text-[9px]">OFF</span>
                    <span className="text-[11px] font-medium">Weekly off</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="w-4 h-4 rounded bg-[#6b7280] text-white font-bold text-[10px] flex items-center justify-center">-</span>
                    <span className="text-[11px] font-medium">Not marked</span>
                  </div>
                </div>

                {/* BOTTOM INFO / DISCLAIMER BANNER */}
                <div className="p-3 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 text-xs flex items-center gap-2">
                  <span className="w-4 h-4 rounded-full bg-slate-800 text-white flex items-center justify-center text-[10px] font-bold shrink-0">i</span>
                  <span>
                    No general attendance records found for this month. Try switching to <strong>Subject-wise</strong> if your institution marks attendance per subject.
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: ASSIGNMENTS */}
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

          {/* TAB 5: CLASS RESOURCES */}
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

          {/* TAB 6: REPORT CARDS */}
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

          {/* TAB 7: ANNOUNCEMENTS */}
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

          {/* TAB 8: COMMUNICATION */}
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

          {/* TAB 9: FEE RECORDS */}
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

          {/* TAB 10: DOWNLOAD APP */}
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

          {/* TAB 11: MY ACCOUNT */}
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
                    <p className="text-sm font-bold text-slate-900 dark:text-white mt-0.5">{studentClass} - Section {studentSection}</p>
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

      {/* MODAL: ENTER / EDIT STUDENT NAME */}
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
                className="text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveName} className="mt-4 space-y-4 text-xs">
              <p className="text-slate-500">
                Enter your student name, class, and section details below:
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

              <div>
                <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">
                  Section
                </label>
                <input
                  type="text"
                  value={editSectionInput}
                  onChange={(e) => setEditSectionInput(e.target.value)}
                  placeholder="e.g. Super, A, B..."
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsEditNameModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800 font-semibold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold cursor-pointer"
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
                  className="px-3.5 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition-colors flex items-center gap-1.5 shadow-xs cursor-pointer"
                >
                  <Printer className="w-3.5 h-3.5" /> Print Challan
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedChallanForPrint(null)}
                  className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 cursor-pointer"
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
                className="px-5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold cursor-pointer"
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
              <button onClick={() => setIsReportCardModalOpen(false)} className="text-slate-400 hover:text-slate-600 cursor-pointer">
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
              <button onClick={() => setViewingNotice(null)} className="text-slate-400 hover:text-slate-600 cursor-pointer">
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
                className="px-4 py-1.5 rounded-xl bg-slate-900 text-white text-xs font-semibold cursor-pointer"
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
              <button onClick={() => setIsLeaveModalOpen(false)} className="text-slate-400 hover:text-slate-600 cursor-pointer">
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
                <button type="button" onClick={() => setIsLeaveModalOpen(false)} className="px-4 py-2 rounded-xl text-slate-600 cursor-pointer">Cancel</button>
                <button type="submit" className="px-4 py-2 rounded-xl bg-blue-600 text-white font-bold cursor-pointer">Submit</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
