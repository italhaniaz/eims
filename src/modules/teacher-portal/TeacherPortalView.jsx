import React, { useState, useEffect, useMemo } from 'react'
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
  ChevronDown,
  Menu,
  X,
  Sparkles,
  FileSpreadsheet,
  Search,
  Bell,
  Eye,
  Plus,
  BookMarked,
  Megaphone,
  CheckSquare,
  FileEdit,
  Wallet,
  CalendarDays,
  Smartphone,
  Receipt,
  UserCheck,
  MessageSquare,
  Layers,
  ArrowRight,
  Filter,
  AlertCircle,
  Sun,
  Moon,
  FolderPlus,
  Download,
  Check,
  Upload,
  Inbox
} from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import { useAppData } from '../../context/AppDataContext'
import { useTheme } from '../../context/ThemeContext'
import {
  readMyAttendanceLogs,
  recordMyTimeIn,
  recordMyTimeOut
} from '../institute-admin/attendance/MyAttendanceView'
import TeacherStudentsView from './TeacherStudentsView'
import TeacherMyAttendanceView from './TeacherMyAttendanceView'
import TeacherMarkAttendanceView from './TeacherMarkAttendanceView'
import TeacherAttendanceReportsView from './TeacherAttendanceReportsView'
import TeacherMarksEntryView from './TeacherMarksEntryView'
import TeacherReportCardsView from './TeacherReportCardsView'
import TeacherTimetableView from './TeacherTimetableView'
import TeacherMakeupSessionsView from './TeacherMakeupSessionsView'
import TeacherAssignmentsView from './TeacherAssignmentsView'
import TeacherClassResourcesView from './TeacherClassResourcesView'
import TeacherAnnouncementsView from './TeacherAnnouncementsView'
import TeacherNotificationsView from './TeacherNotificationsView'
import TeacherInboxView from './TeacherInboxView'
import TeacherTransactionsView from './TeacherTransactionsView'

export default function TeacherPortalView() {
  const { user, logout } = useAuth()
  const { notices = [], recentActivity = [] } = useAppData()
  const { isDark, toggleThemeMode } = useTheme()

  // Navigation & UI States
  const [activeRoute, setActiveRoute] = useState('dashboard')
  const [subReportType, setSubReportType] = useState('student-attendance')
  const [isReportsMenuOpen, setIsReportsMenuOpen] = useState(false)
  const [isResultsMenuOpen, setIsResultsMenuOpen] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')

  // Auto-expand accordion when navigating
  useEffect(() => {
    if (activeRoute === 'marks-entry' || activeRoute === 'report-cards') {
      setOpenSidebarGroups((prev) => ({ ...prev, exams: true }))
      if (activeRoute === 'report-cards') {
        setIsResultsMenuOpen(true)
      }
    } else if (activeRoute === 'handouts' || activeRoute === 'recorded-lectures') {
      setOpenSidebarGroups((prev) => ({ ...prev, resources: true }))
    } else if (activeRoute === 'notifications' || activeRoute === 'inbox') {
      setOpenSidebarGroups((prev) => ({ ...prev, communication: true }))
    }
  }, [activeRoute])

  // Student Count for Teacher Portal (reactive to local roster)
  const [portalStudentsCount, setPortalStudentsCount] = useState(() => {
    try {
      const saved = localStorage.getItem('teacher_portal_students')
      if (saved) {
        const parsed = JSON.parse(saved)
        if (Array.isArray(parsed)) return parsed.length
      }
    } catch {}
    return 0
  })

  useEffect(() => {
    const handleCountUpdate = () => {
      try {
        const saved = localStorage.getItem('teacher_portal_students')
        if (saved) {
          const parsed = JSON.parse(saved)
          if (Array.isArray(parsed)) setPortalStudentsCount(parsed.length)
        } else {
          setPortalStudentsCount(0)
        }
      } catch {}
    }
    window.addEventListener('storage', handleCountUpdate)
    const timer = setInterval(handleCountUpdate, 1500)
    return () => {
      window.removeEventListener('storage', handleCountUpdate)
      clearInterval(timer)
    }
  }, [])

  // Accordion Sidebar Groups
  const [openSidebarGroups, setOpenSidebarGroups] = useState({
    students: false,
    attendance: false,
    exams: false,
    resources: false,
    communication: false
  })

  // Attendance Punch State
  const [attendanceLogs, setAttendanceLogs] = useState([])
  const [punchStatus, setPunchStatus] = useState('NOT_CHECKED_IN') // 'NOT_CHECKED_IN' | 'CHECKED_IN' | 'CHECKED_OUT'
  const [todayLog, setTodayLog] = useState(null)

  // Interactive Modals
  const [activeModal, setActiveModal] = useState(null) // 'attendance' | 'mark-attendance' | 'marks-entry' | 'assignments' | 'timetable' | 'salary' | 'announcements'
  const [toastMessage, setToastMessage] = useState(null)

  // Dynamic Date string matching reference: e.g. "Wednesday, 11 Nov 2026"
  const formattedToday = useMemo(() => {
    const now = new Date()
    return now.toLocaleDateString('en-GB', {
      weekday: 'long',
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    })
  }, [])

  const shortDayMonth = useMemo(() => {
    const now = new Date()
    return now.toLocaleDateString('en-GB', {
      weekday: 'long',
      day: 'numeric',
      month: 'short'
    })
  }, [])

  const teacherName = user?.name || 'Prof. Tariq Mehmood'
  const schoolName = user?.instituteName || 'City School Model Town Campus'
  const teacherRole = user?.roleTitle || 'TEACHER'

  // Load teacher's personal attendance punch records
  const loadAttendance = () => {
    const instId = user?.instituteId || 'inst-teacher-portal'
    const userEmail = user?.email || 'teacher@schoolms.com'
    const logs = readMyAttendanceLogs(instId, userEmail)
    setAttendanceLogs(logs)

    const todayIso = new Date().toISOString().split('T')[0]
    const todayRecord = logs.find(l => l.date === todayIso)
    setTodayLog(todayRecord || null)

    if (todayRecord) {
      if (todayRecord.timeOut) {
        setPunchStatus('CHECKED_OUT')
      } else if (todayRecord.timeIn) {
        setPunchStatus('CHECKED_IN')
      }
    } else {
      setPunchStatus('NOT_CHECKED_IN')
    }
  }

  useEffect(() => {
    loadAttendance()
    const handleUpdate = () => loadAttendance()
    window.addEventListener('my-attendance-updated', handleUpdate)
    return () => window.removeEventListener('my-attendance-updated', handleUpdate)
  }, [user?.instituteId, user?.email])

  const showToast = (msg) => {
    setToastMessage(msg)
    setTimeout(() => setToastMessage(null), 3500)
  }

  // Handle punch button click (Time In / Time Out)
  const handleTogglePunch = () => {
    const instId = user?.instituteId || 'inst-teacher-portal'
    const userEmail = user?.email || 'teacher@schoolms.com'

    if (punchStatus === 'NOT_CHECKED_IN') {
      const res = recordMyTimeIn(instId, userEmail)
      loadAttendance()
      showToast(`Punch In Successful at ${res.entry?.timeIn || 'now'}!`)
    } else if (punchStatus === 'CHECKED_IN') {
      const res = recordMyTimeOut(instId, userEmail)
      loadAttendance()
      showToast(`Punch Out Successful at ${res.entry?.timeOut || 'now'}!`)
    } else {
      showToast('You have already completed attendance for today.')
    }
  }

  const toggleGroup = (key) => {
    setOpenSidebarGroups(prev => ({ ...prev, [key]: !prev[key] }))
  }

  // Universal Quick Link and In-View Navigation Dispatcher
  const handleQuickLinkNavigate = (target) => {
    if (target === 'mark-attendance' || target === 'my-attendance' || target === 'attendance-reports') {
      setOpenSidebarGroups((prev) => ({ ...prev, attendance: true }))
      setActiveRoute(target)
    } else if (target === 'marks-entry' || target === 'report-cards') {
      setOpenSidebarGroups((prev) => ({ ...prev, exams: true }))
      setActiveRoute(target)
    } else if (target === 'assignments') {
      setActiveRoute('assignments')
    } else if (target === 'timetable') {
      setActiveRoute('timetable')
    } else if (target === 'announcements') {
      setActiveRoute('announcements')
    } else if (target === 'salary' || target === 'my-transactions') {
      setActiveRoute('my-transactions')
    } else if (target === 'handouts' || target === 'recorded-lectures') {
      setOpenSidebarGroups((prev) => ({ ...prev, resources: true }))
      setActiveRoute(target)
    } else if (target === 'notifications' || target === 'inbox') {
      setOpenSidebarGroups((prev) => ({ ...prev, communication: true }))
      setActiveRoute(target)
    } else {
      setActiveModal(target)
    }
  }

  // Interactive Mock State for Assignments created by teacher
  const [assignments, setAssignments] = useState([])
  const [newAssignmentTitle, setNewAssignmentTitle] = useState('')
  const [newAssignmentClass, setNewAssignmentClass] = useState('Grade 10 - Section A')
  const [newAssignmentSubject, setNewAssignmentSubject] = useState('Mathematics')
  const [newAssignmentDueDate, setNewAssignmentDueDate] = useState('')

  const handleCreateAssignment = (e) => {
    e.preventDefault()
    if (!newAssignmentTitle.trim()) {
      showToast('Please enter an assignment title.')
      return
    }
    const item = {
      id: `asg-${Date.now()}`,
      title: newAssignmentTitle.trim(),
      className: newAssignmentClass,
      subject: newAssignmentSubject,
      dueDate: newAssignmentDueDate || 'Tomorrow',
      createdAt: new Date().toLocaleDateString('en-GB')
    }
    setAssignments(prev => [item, ...prev])
    setNewAssignmentTitle('')
    setNewAssignmentDueDate('')
    setActiveModal(null)
    showToast('New assignment posted successfully!')
  }

  // Mock scheduled periods (defaults to 0 as instructed)
  const scheduledPeriodsCount = 0

  return (
    <div className="flex h-screen w-full overflow-hidden bg-[#f8fafc] dark:bg-[#0B1020] text-slate-800 dark:text-slate-100 font-sans">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white text-xs sm:text-sm px-4 py-3 rounded-xl shadow-2xl flex items-center gap-3 border border-slate-700 animate-slide-up">
          <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Mobile Backdrop */}
      {isMobileMenuOpen && (
        <div
          onClick={() => setIsMobileMenuOpen(false)}
          className="fixed inset-0 bg-slate-950/70 backdrop-blur-xs z-40 lg:hidden"
        />
      )}

      {/* ========================================================= */}
      {/* 1. LEFT SIDEBAR: DARK NAVY MATCHING SUPER ADMIN (#0B1120) */}
      {/* ========================================================= */}
      <aside
        className={`
          fixed lg:static top-0 bottom-0 left-0 z-50
          ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
          ${isSidebarCollapsed ? 'w-20' : 'w-64 sm:w-72'} 
          h-full max-h-screen sidebar-navy bg-[#0B1120] text-slate-300 border-r border-slate-800/80 flex flex-col
          transition-all duration-300 shrink-0 select-none shadow-xl
        `}
      >
        {/* Brand Header */}
        <div className="h-14 sm:h-16 min-h-[56px] sm:min-h-[64px] flex items-center justify-between px-4 sm:px-5 border-b border-slate-800/80 bg-[#0B1120] shrink-0">
          <div className="flex items-center gap-3 overflow-hidden min-w-0">
            <div className="w-9 h-9 rounded-xl bg-purple-500/15 text-purple-400 border border-purple-500/30 flex items-center justify-center shrink-0 font-bold text-xs shadow-2xs">
              <BookOpen className="w-5 h-5 text-purple-400" />
            </div>
            {!isSidebarCollapsed && (
              <div className="flex flex-col truncate min-w-0">
                <span className="text-sm font-extrabold text-white tracking-tight font-heading leading-tight truncate">
                  Teacher Portal
                </span>
                <span className="text-[10px] text-purple-400 font-bold uppercase tracking-wider truncate">
                  Academic Faculty
                </span>
              </div>
            )}
          </div>
          
          <button
            onClick={() => setIsMobileMenuOpen(false)}
            className="lg:hidden text-slate-400 hover:text-white p-1 rounded-lg"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Sidebar Nav Items (Matching Screenshot) */}
        <div className="flex-1 py-3 px-3 space-y-1 overflow-y-auto dark-scroll text-[13px]">
          {/* 1. Dashboard */}
          <div className="relative">
            {activeRoute === 'dashboard' && (
              <div className="absolute left-0 top-1.5 bottom-1.5 w-1 bg-purple-500 rounded-full z-10 shadow-sm shadow-purple-500/50"></div>
            )}
            <button
              onClick={() => {
                setActiveRoute('dashboard')
                setIsMobileMenuOpen(false)
              }}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl transition-all text-left cursor-pointer group ${
                activeRoute === 'dashboard'
                  ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-bold shadow-md shadow-purple-600/30'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              <Home className={`w-4 h-4 shrink-0 transition-colors ${
                activeRoute === 'dashboard' ? 'text-white' : 'text-slate-400 group-hover:text-purple-400'
              }`} />
              {!isSidebarCollapsed && <span className="truncate">Dashboard</span>}
            </button>
          </div>

          {/* 2. Students (Dropdown) */}
          <div>
            <button
              onClick={() => {
                toggleGroup('students')
              }}
              className={`w-full flex items-center justify-between px-3.5 py-2 rounded-xl transition-colors cursor-pointer group ${
                activeRoute === 'students'
                  ? 'bg-slate-800/80 text-white font-bold'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              <div className="flex items-center gap-3 min-w-0">
                <Users className={`w-4 h-4 shrink-0 transition-colors ${
                  activeRoute === 'students' ? 'text-purple-400' : 'text-slate-400 group-hover:text-purple-400'
                }`} />
                {!isSidebarCollapsed && <span className="truncate">Students</span>}
              </div>
              {!isSidebarCollapsed && (
                openSidebarGroups.students ? <ChevronDown className="w-3.5 h-3.5 text-slate-400" /> : <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
              )}
            </button>
            {openSidebarGroups.students && !isSidebarCollapsed && (
              <div className="mt-1 pl-3 space-y-1 border-l border-slate-800 ml-5 text-xs">
                <button
                  onClick={() => {
                    setActiveRoute('students')
                    setIsMobileMenuOpen(false)
                  }}
                  className={`w-full flex items-center justify-between py-1.5 px-2.5 rounded-lg transition-colors cursor-pointer ${
                    activeRoute === 'students'
                      ? 'bg-gradient-to-r from-purple-600/30 to-indigo-600/30 text-purple-200 font-bold border border-purple-500/40 shadow-xs'
                      : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-purple-400"></span>
                    <span>All Students</span>
                  </div>
                  <span className={`text-[10px] font-bold px-1.5 py-0.2 rounded-full ${
                    activeRoute === 'students'
                      ? 'bg-sky-500 text-white shadow-2xs'
                      : 'bg-slate-800 text-slate-400'
                  }`}>
                    {portalStudentsCount}
                  </span>
                </button>
              </div>
            )}
          </div>

          {/* 3. Attendance (Dropdown) */}
          <div>
            <button
              onClick={() => toggleGroup('attendance')}
              className={`w-full flex items-center justify-between px-3.5 py-2 rounded-xl transition-colors cursor-pointer group ${
                activeRoute === 'my-attendance' || activeRoute === 'mark-attendance' || activeRoute === 'attendance-reports'
                  ? 'bg-slate-800/80 text-white font-bold'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              <div className="flex items-center gap-3 min-w-0">
                <CheckCircle2 className={`w-4 h-4 shrink-0 transition-colors ${
                  activeRoute === 'my-attendance' || activeRoute === 'mark-attendance' || activeRoute === 'attendance-reports'
                    ? 'text-sky-400'
                    : 'text-slate-400 group-hover:text-sky-400'
                }`} />
                {!isSidebarCollapsed && <span className="truncate">Attendance</span>}
              </div>
              {!isSidebarCollapsed && (
                openSidebarGroups.attendance ? <ChevronDown className="w-3.5 h-3.5 text-slate-400" /> : <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
              )}
            </button>
            {openSidebarGroups.attendance && !isSidebarCollapsed && (
              <div className="mt-1 pl-3 space-y-1 border-l border-slate-800 ml-5 text-xs">
                {/* 3.1 My Attendance */}
                <button
                  onClick={() => {
                    setActiveRoute('my-attendance')
                    setIsMobileMenuOpen(false)
                  }}
                  className={`w-full flex items-center gap-2 py-1.5 px-2.5 rounded-lg transition-colors cursor-pointer ${
                    activeRoute === 'my-attendance'
                      ? 'bg-gradient-to-r from-purple-600/30 to-indigo-600/30 text-purple-200 font-bold border border-purple-500/40 shadow-xs'
                      : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
                  }`}
                >
                  <Clock className="w-3.5 h-3.5 text-purple-400" />
                  <span>My Attendance</span>
                </button>

                {/* 3.2 Mark Attendance */}
                <button
                  onClick={() => {
                    setActiveRoute('mark-attendance')
                    setIsMobileMenuOpen(false)
                  }}
                  className={`w-full flex items-center gap-2 py-1.5 px-2.5 rounded-lg transition-colors cursor-pointer ${
                    activeRoute === 'mark-attendance'
                      ? 'bg-gradient-to-r from-sky-600/30 to-blue-600/30 text-sky-200 font-bold border border-sky-500/40 shadow-xs'
                      : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
                  }`}
                >
                  <CheckSquare className="w-3.5 h-3.5 text-sky-400" />
                  <span>Mark Attendance</span>
                </button>

                {/* 3.3 Reports (Nested sub-accordion matching screenshot 2) */}
                <div>
                  <button
                    onClick={() => setIsReportsMenuOpen(!isReportsMenuOpen)}
                    className={`w-full flex items-center justify-between text-left py-1.5 px-2.5 rounded-lg transition-colors cursor-pointer ${
                      activeRoute === 'attendance-reports'
                        ? 'text-sky-300 font-bold'
                        : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <FileSpreadsheet className="w-3.5 h-3.5 text-slate-400" />
                      <span>Reports</span>
                    </div>
                    {isReportsMenuOpen ? (
                      <ChevronDown className="w-3 h-3 text-slate-400" />
                    ) : (
                      <ChevronRight className="w-3 h-3 text-slate-400" />
                    )}
                  </button>

                  {/* Sub-items for Reports */}
                  {isReportsMenuOpen && (
                    <div className="mt-1 pl-3 space-y-1 border-l border-slate-700 ml-4 text-[11px]">
                      <button
                        onClick={() => {
                          setActiveRoute('attendance-reports')
                          setSubReportType('student-attendance')
                          setIsMobileMenuOpen(false)
                        }}
                        className={`w-full text-left py-1 px-2 rounded-md transition-colors cursor-pointer ${
                          activeRoute === 'attendance-reports' && subReportType === 'student-attendance'
                            ? 'bg-sky-600/30 text-sky-200 font-bold border border-sky-500/40'
                            : 'text-slate-400 hover:text-white hover:bg-slate-800/40'
                        }`}
                      >
                        Student Attendance
                      </button>
                      <button
                        onClick={() => {
                          setActiveRoute('attendance-reports')
                          setSubReportType('consecutive-absences')
                          setIsMobileMenuOpen(false)
                        }}
                        className={`w-full text-left py-1 px-2 rounded-md transition-colors cursor-pointer ${
                          activeRoute === 'attendance-reports' && subReportType === 'consecutive-absences'
                            ? 'bg-sky-600/30 text-sky-200 font-bold border border-sky-500/40'
                            : 'text-slate-400 hover:text-white hover:bg-slate-800/40'
                        }`}
                      >
                        Consecutive Absences
                      </button>
                      <button
                        onClick={() => {
                          setActiveRoute('attendance-reports')
                          setSubReportType('low-attendance')
                          setIsMobileMenuOpen(false)
                        }}
                        className={`w-full text-left py-1 px-2 rounded-md transition-colors cursor-pointer ${
                          activeRoute === 'attendance-reports' && subReportType === 'low-attendance'
                            ? 'bg-sky-600/30 text-sky-200 font-bold border border-sky-500/40'
                            : 'text-slate-400 hover:text-white hover:bg-slate-800/40'
                        }`}
                      >
                        Low Attendance
                      </button>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* 4. Exams & Results (Dropdown) */}
          <div>
            <button
              onClick={() => toggleGroup('exams')}
              className={`w-full flex items-center justify-between px-3.5 py-2 rounded-xl transition-colors cursor-pointer group ${
                activeRoute === 'marks-entry' || activeRoute === 'report-cards'
                  ? 'bg-blue-600/10 text-white border border-blue-500/30'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              <div className="flex items-center gap-3 min-w-0">
                <FileSpreadsheet className={`w-4 h-4 shrink-0 ${
                  activeRoute === 'marks-entry' || activeRoute === 'report-cards'
                    ? 'text-sky-400'
                    : 'text-slate-400 group-hover:text-purple-400'
                }`} />
                {!isSidebarCollapsed && <span className="truncate">Exams & Results</span>}
              </div>
              {!isSidebarCollapsed && (
                openSidebarGroups.exams ? <ChevronDown className="w-3.5 h-3.5 text-slate-400" /> : <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
              )}
            </button>
            {openSidebarGroups.exams && !isSidebarCollapsed && (
              <div className="mt-1 pl-3 space-y-1 border-l border-slate-800 ml-5 text-xs">
                {/* 4.1 Marks Entry */}
                <button
                  onClick={() => {
                    setActiveRoute('marks-entry')
                    setIsMobileMenuOpen(false)
                  }}
                  className={`w-full flex items-center gap-2 py-1.5 px-2.5 rounded-lg transition-colors cursor-pointer ${
                    activeRoute === 'marks-entry'
                      ? 'bg-gradient-to-r from-sky-600/30 to-blue-600/30 text-sky-200 font-bold border border-sky-500/40 shadow-xs'
                      : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
                  }`}
                >
                  <FileEdit className="w-3.5 h-3.5 text-sky-400" />
                  <span>Marks Entry</span>
                </button>

                {/* 4.2 Results (Nested sub-accordion) */}
                <div>
                  <button
                    onClick={() => setIsResultsMenuOpen(!isResultsMenuOpen)}
                    className={`w-full flex items-center justify-between text-left py-1.5 px-2.5 rounded-lg transition-colors cursor-pointer ${
                      activeRoute === 'report-cards'
                        ? 'bg-sky-600/20 text-sky-200 font-bold border border-sky-500/30'
                        : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="w-3.5 h-3.5 text-slate-400" />
                      <span>Results</span>
                    </div>
                    {isResultsMenuOpen ? (
                      <ChevronDown className="w-3 h-3 text-slate-400" />
                    ) : (
                      <ChevronRight className="w-3 h-3 text-slate-400" />
                    )}
                  </button>

                  {/* Sub-items for Results */}
                  {isResultsMenuOpen && (
                    <div className="mt-1 pl-3 space-y-1 border-l border-slate-700 ml-4 text-[11px]">
                      <button
                        onClick={() => {
                          setActiveRoute('report-cards')
                          setIsMobileMenuOpen(false)
                        }}
                        className={`w-full text-left py-1 px-2 rounded-md transition-colors cursor-pointer ${
                          activeRoute === 'report-cards'
                            ? 'bg-sky-600/30 text-sky-200 font-bold border border-sky-500/40'
                            : 'text-slate-400 hover:text-white hover:bg-slate-800/40'
                        }`}
                      >
                        Report Cards
                      </button>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* 5. My Timetable */}
          <button
            onClick={() => {
              setActiveRoute('timetable')
              setIsMobileMenuOpen(false)
            }}
            className={`w-full flex items-center gap-3 px-3.5 py-2 rounded-xl transition-colors cursor-pointer group ${
              activeRoute === 'timetable'
                ? 'bg-gradient-to-r from-sky-600/30 to-blue-600/30 text-sky-200 font-bold border border-sky-500/40 shadow-xs'
                : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            <Clock className={`w-4 h-4 shrink-0 ${
              activeRoute === 'timetable' ? 'text-sky-400' : 'text-slate-400 group-hover:text-purple-400'
            }`} />
            {!isSidebarCollapsed && <span className="truncate">My Timetable</span>}
          </button>

          {/* 6. Make-up Sessions */}
          <button
            onClick={() => {
              setActiveRoute('make-up-sessions')
              setIsMobileMenuOpen(false)
            }}
            className={`w-full flex items-center gap-3 px-3.5 py-2 rounded-xl transition-colors cursor-pointer group ${
              activeRoute === 'make-up-sessions'
                ? 'bg-gradient-to-r from-sky-600/30 to-blue-600/30 text-sky-200 font-bold border border-sky-500/40 shadow-xs'
                : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            <CalendarDays className={`w-4 h-4 shrink-0 ${
              activeRoute === 'make-up-sessions' ? 'text-sky-400' : 'text-slate-400 group-hover:text-purple-400'
            }`} />
            {!isSidebarCollapsed && <span className="truncate">Make-up Sessions</span>}
          </button>

          {/* 7. Assignments */}
          <button
            onClick={() => {
              setActiveRoute('assignments')
              setIsMobileMenuOpen(false)
            }}
            className={`w-full flex items-center gap-3 px-3.5 py-2 rounded-xl transition-colors cursor-pointer group ${
              activeRoute === 'assignments'
                ? 'bg-gradient-to-r from-sky-600/30 to-blue-600/30 text-sky-200 font-bold border border-sky-500/40 shadow-xs'
                : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            <BookMarked className={`w-4 h-4 shrink-0 ${
              activeRoute === 'assignments' ? 'text-sky-400' : 'text-slate-400 group-hover:text-purple-400'
            }`} />
            {!isSidebarCollapsed && <span className="truncate">Assignments</span>}
          </button>

          {/* 8. Class Resources */}
          <div>
            <button
              onClick={() => toggleGroup('resources')}
              className={`w-full flex items-center justify-between px-3.5 py-2 rounded-xl transition-colors cursor-pointer group ${
                activeRoute === 'handouts' || activeRoute === 'recorded-lectures'
                  ? 'bg-blue-600/10 text-white border border-blue-500/30'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              <div className="flex items-center gap-3 min-w-0">
                <Layers className={`w-4 h-4 shrink-0 ${
                  activeRoute === 'handouts' || activeRoute === 'recorded-lectures'
                    ? 'text-sky-400'
                    : 'text-slate-400 group-hover:text-purple-400'
                }`} />
                {!isSidebarCollapsed && <span className="truncate">Class Resources</span>}
              </div>
              {!isSidebarCollapsed && (
                openSidebarGroups.resources ? <ChevronDown className="w-3.5 h-3.5 text-slate-400" /> : <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
              )}
            </button>
            {openSidebarGroups.resources && !isSidebarCollapsed && (
              <div className="mt-1 pl-3 space-y-1 border-l border-slate-800 ml-5 text-xs">
                {/* 8.1 Handouts */}
                <button
                  onClick={() => {
                    setActiveRoute('handouts')
                    setIsMobileMenuOpen(false)
                  }}
                  className={`w-full flex items-center gap-2 py-1.5 px-2.5 rounded-lg transition-colors cursor-pointer ${
                    activeRoute === 'handouts'
                      ? 'bg-gradient-to-r from-sky-600/30 to-blue-600/30 text-sky-200 font-bold border border-sky-500/40 shadow-xs'
                      : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
                  }`}
                >
                  <FileText className="w-3.5 h-3.5 text-sky-400" />
                  <span>Handouts</span>
                </button>

                {/* 8.2 Recorded Lectures */}
                <button
                  onClick={() => {
                    setActiveRoute('recorded-lectures')
                    setIsMobileMenuOpen(false)
                  }}
                  className={`w-full flex items-center gap-2 py-1.5 px-2.5 rounded-lg transition-colors cursor-pointer ${
                    activeRoute === 'recorded-lectures'
                      ? 'bg-gradient-to-r from-sky-600/30 to-blue-600/30 text-sky-200 font-bold border border-sky-500/40 shadow-xs'
                      : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
                  }`}
                >
                  <Video className="w-3.5 h-3.5 text-sky-400" />
                  <span>Recorded Lectures</span>
                </button>
              </div>
            )}
          </div>

          {/* 9. Announcements */}
          <button
            onClick={() => {
              setActiveRoute('announcements')
              setIsMobileMenuOpen(false)
            }}
            className={`w-full flex items-center gap-3 px-3.5 py-2 rounded-xl transition-colors cursor-pointer group ${
              activeRoute === 'announcements'
                ? 'bg-gradient-to-r from-sky-600/30 to-blue-600/30 text-sky-200 font-bold border border-sky-500/40 shadow-xs'
                : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            <Megaphone className={`w-4 h-4 shrink-0 ${
              activeRoute === 'announcements' ? 'text-sky-400' : 'text-slate-400 group-hover:text-purple-400'
            }`} />
            {!isSidebarCollapsed && <span className="truncate">Announcements</span>}
          </button>

          {/* 10. Communication */}
          <div>
            <button
              onClick={() => toggleGroup('communication')}
              className={`w-full flex items-center justify-between px-3.5 py-2 rounded-xl transition-colors cursor-pointer group ${
                activeRoute === 'notifications' || activeRoute === 'inbox'
                  ? 'bg-blue-600/10 text-white border border-blue-500/30'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              <div className="flex items-center gap-3 min-w-0">
                <MessageSquare className={`w-4 h-4 shrink-0 ${
                  activeRoute === 'notifications' || activeRoute === 'inbox'
                    ? 'text-sky-400'
                    : 'text-slate-400 group-hover:text-purple-400'
                }`} />
                {!isSidebarCollapsed && <span className="truncate">Communication</span>}
              </div>
              {!isSidebarCollapsed && (
                openSidebarGroups.communication ? <ChevronDown className="w-3.5 h-3.5 text-slate-400" /> : <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
              )}
            </button>
            {openSidebarGroups.communication && !isSidebarCollapsed && (
              <div className="mt-1 pl-3 space-y-1 border-l border-slate-800 ml-5 text-xs">
                {/* 10.1 Notifications */}
                <button
                  onClick={() => {
                    setActiveRoute('notifications')
                    setIsMobileMenuOpen(false)
                  }}
                  className={`w-full flex items-center gap-2 py-1.5 px-2.5 rounded-lg transition-colors cursor-pointer ${
                    activeRoute === 'notifications'
                      ? 'bg-gradient-to-r from-sky-600/30 to-blue-600/30 text-sky-200 font-bold border border-sky-500/40 shadow-xs'
                      : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
                  }`}
                >
                  <Bell className="w-3.5 h-3.5 text-sky-400" />
                  <span>Notifications</span>
                </button>

                {/* 10.2 Inbox */}
                <button
                  onClick={() => {
                    setActiveRoute('inbox')
                    setIsMobileMenuOpen(false)
                  }}
                  className={`w-full flex items-center gap-2 py-1.5 px-2.5 rounded-lg transition-colors cursor-pointer ${
                    activeRoute === 'inbox'
                      ? 'bg-gradient-to-r from-sky-600/30 to-blue-600/30 text-sky-200 font-bold border border-sky-500/40 shadow-xs'
                      : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
                  }`}
                >
                  <Inbox className="w-3.5 h-3.5 text-sky-400" />
                  <span>Inbox</span>
                </button>
              </div>
            )}
          </div>

          {/* 11. My Transactions */}
          <button
            onClick={() => {
              setActiveRoute('my-transactions')
              setIsMobileMenuOpen(false)
            }}
            className={`w-full flex items-center gap-3 px-3.5 py-2 rounded-xl transition-colors cursor-pointer group ${
              activeRoute === 'my-transactions'
                ? 'bg-gradient-to-r from-sky-600/30 to-blue-600/30 text-sky-200 font-bold border border-sky-500/40 shadow-xs'
                : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            <Receipt className={`w-4 h-4 shrink-0 ${
              activeRoute === 'my-transactions' ? 'text-sky-400' : 'text-slate-400 group-hover:text-purple-400'
            }`} />
            {!isSidebarCollapsed && <span className="truncate">My Transactions</span>}
          </button>

          {/* 12. Download App */}
          <button
            onClick={() => {
              showToast('Teacher Mobile App: APK download link dispatched.')
              setIsMobileMenuOpen(false)
            }}
            className="w-full flex items-center gap-3 px-3.5 py-2 rounded-xl text-slate-300 hover:text-white hover:bg-slate-800/60 transition-colors cursor-pointer group"
          >
            <Smartphone className="w-4 h-4 text-slate-400 group-hover:text-purple-400 shrink-0" />
            {!isSidebarCollapsed && <span className="truncate">Download App</span>}
          </button>

          {/* 13. My Account */}
          <button
            onClick={() => {
              setActiveModal('attendance')
              setIsMobileMenuOpen(false)
            }}
            className="w-full flex items-center gap-3 px-3.5 py-2 rounded-xl text-slate-300 hover:text-white hover:bg-slate-800/60 transition-colors cursor-pointer group"
          >
            <UserCheck className="w-4 h-4 text-slate-400 group-hover:text-purple-400 shrink-0" />
            {!isSidebarCollapsed && <span className="truncate">My Account</span>}
          </button>
        </div>

        {/* Sign Out Footer */}
        <div className="p-3 border-t border-slate-800/80 bg-[#0B1120]">
          <button
            onClick={logout}
            className="w-full flex items-center gap-2.5 px-3.5 py-2 rounded-xl text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 border border-transparent hover:border-rose-500/20 transition-all text-xs font-semibold cursor-pointer group"
          >
            <LogOut className="w-4 h-4 shrink-0 text-slate-400 group-hover:text-rose-400 transition-colors" />
            {!isSidebarCollapsed && <span>Sign Out</span>}
          </button>
        </div>
      </aside>

      {/* ========================================================= */}
      {/* 2. MAIN APPLICATION COLUMN */}
      {/* ========================================================= */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top Slim Color Accent Bar matching reference */}
        <div className="h-0.5 w-full bg-gradient-to-r from-orange-500 via-rose-500 to-purple-600 shrink-0"></div>

        {/* Top Navbar */}
        <header className="h-14 sm:h-16 min-h-[56px] sm:min-h-[64px] bg-white dark:bg-slate-900 border-b border-slate-200/90 dark:border-slate-800 px-4 sm:px-6 flex items-center justify-between shrink-0 shadow-2xs z-30">
          <div className="flex items-center gap-3 flex-1 max-w-lg">
            <button
              onClick={() => setIsMobileMenuOpen(true)}
              className="lg:hidden p-2 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
            >
              <Menu className="w-5 h-5" />
            </button>

            {/* Global Search Bar from reference */}
            <div className="relative w-full max-w-sm sm:max-w-md">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search name, roll, admission, registration no..."
                className="w-full pl-9 pr-4 py-1.5 text-xs sm:text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-1 focus:ring-purple-500 text-slate-800 dark:text-slate-100 placeholder-slate-400"
              />
            </div>
          </div>

          {/* Right Action Icons & User Badge */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Bell Notifications */}
            <button
              onClick={() => {
                setOpenSidebarGroups((prev) => ({ ...prev, communication: true }))
                setActiveRoute('notifications')
              }}
              title="Notifications"
              className="relative p-2 text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-white rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
            >
              <Bell className="w-4 h-4" />
              {notices.length > 0 && (
                <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-rose-500 ring-2 ring-white dark:ring-slate-900"></span>
              )}
            </button>

            {/* Messages Icon */}
            <button
              onClick={() => {
                setOpenSidebarGroups((prev) => ({ ...prev, communication: true }))
                setActiveRoute('inbox')
              }}
              title="Inbox"
              className="p-2 text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-white rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
            >
              <Inbox className="w-4 h-4" />
            </button>

            {/* Dark Mode Toggle */}
            <button
              onClick={toggleThemeMode}
              title={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
              className="p-2 text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-white rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
            >
              {isDark ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4" />}
            </button>

            {/* Teacher Profile Badge from screenshot */}
            <div className="flex items-center gap-2.5 pl-2 sm:pl-3 border-l border-slate-200 dark:border-slate-800">
              <div className="w-8 h-8 rounded-full bg-slate-900 dark:bg-purple-600 text-white flex items-center justify-center font-bold text-xs">
                {teacherName.slice(0, 2).toUpperCase()}
              </div>
              <div className="hidden sm:flex flex-col text-left">
                <span className="text-xs font-bold text-slate-900 dark:text-white leading-tight">
                  {teacherName}
                </span>
                <span className="text-[10px] text-rose-500 dark:text-rose-400 font-bold uppercase tracking-wider">
                  TEACHER
                </span>
              </div>
            </div>
          </div>
        </header>

        {/* ========================================================= */}
        {/* 2. BODY CONTENT (STUDENTS vs MY-ATTENDANCE vs DASHBOARD) */}
        {/* ========================================================= */}
        {activeRoute === 'students' ? (
          <TeacherStudentsView
            onBack={() => setActiveRoute('dashboard')}
            onOpenModal={handleQuickLinkNavigate}
            onNavigate={handleQuickLinkNavigate}
            teacherName={teacherName}
          />
        ) : activeRoute === 'my-attendance' ? (
          <TeacherMyAttendanceView
            onBack={() => setActiveRoute('dashboard')}
            onOpenModal={handleQuickLinkNavigate}
            onNavigate={handleQuickLinkNavigate}
            teacherName={teacherName}
          />
        ) : activeRoute === 'mark-attendance' ? (
          <TeacherMarkAttendanceView
            onBack={() => setActiveRoute('dashboard')}
            onOpenModal={handleQuickLinkNavigate}
            onNavigate={handleQuickLinkNavigate}
            teacherName={teacherName}
          />
        ) : activeRoute === 'attendance-reports' ? (
          <TeacherAttendanceReportsView
            onBack={() => setActiveRoute('dashboard')}
            onOpenModal={handleQuickLinkNavigate}
            onNavigate={handleQuickLinkNavigate}
            subReportType={subReportType}
            onSelectSubReport={(type) => setSubReportType(type)}
            teacherName={teacherName}
          />
        ) : activeRoute === 'marks-entry' ? (
          <TeacherMarksEntryView
            onBack={() => setActiveRoute('dashboard')}
            onOpenModal={handleQuickLinkNavigate}
            onNavigate={handleQuickLinkNavigate}
            teacherName={teacherName}
          />
        ) : activeRoute === 'report-cards' ? (
          <TeacherReportCardsView
            onBack={() => setActiveRoute('dashboard')}
            onOpenModal={handleQuickLinkNavigate}
            onNavigate={handleQuickLinkNavigate}
            teacherName={teacherName}
          />
        ) : activeRoute === 'timetable' ? (
          <TeacherTimetableView
            onBack={() => setActiveRoute('dashboard')}
            onOpenModal={handleQuickLinkNavigate}
            onNavigate={handleQuickLinkNavigate}
            teacherName={teacherName}
          />
        ) : activeRoute === 'make-up-sessions' ? (
          <TeacherMakeupSessionsView
            onBack={() => setActiveRoute('dashboard')}
            onOpenModal={handleQuickLinkNavigate}
            onNavigate={handleQuickLinkNavigate}
            teacherName={teacherName}
          />
        ) : activeRoute === 'assignments' ? (
          <TeacherAssignmentsView
            onBack={() => setActiveRoute('dashboard')}
            onOpenModal={handleQuickLinkNavigate}
            onNavigate={handleQuickLinkNavigate}
            teacherName={teacherName}
          />
        ) : activeRoute === 'handouts' ? (
          <TeacherClassResourcesView
            resourceType="handouts"
            onBack={() => setActiveRoute('dashboard')}
            onOpenModal={handleQuickLinkNavigate}
            onNavigate={handleQuickLinkNavigate}
            teacherName={teacherName}
          />
        ) : activeRoute === 'recorded-lectures' ? (
          <TeacherClassResourcesView
            resourceType="recorded-lectures"
            onBack={() => setActiveRoute('dashboard')}
            onOpenModal={handleQuickLinkNavigate}
            onNavigate={handleQuickLinkNavigate}
            teacherName={teacherName}
          />
        ) : activeRoute === 'announcements' ? (
          <TeacherAnnouncementsView
            onBack={() => setActiveRoute('dashboard')}
            onOpenModal={handleQuickLinkNavigate}
            onNavigate={handleQuickLinkNavigate}
            teacherName={teacherName}
          />
        ) : activeRoute === 'notifications' ? (
          <TeacherNotificationsView
            onBack={() => setActiveRoute('dashboard')}
            onNavigate={handleQuickLinkNavigate}
            onOpenModal={handleQuickLinkNavigate}
            teacherName={teacherName}
          />
        ) : activeRoute === 'inbox' ? (
          <TeacherInboxView
            onBack={() => setActiveRoute('dashboard')}
            onNavigate={handleQuickLinkNavigate}
            onOpenModal={handleQuickLinkNavigate}
            teacherName={teacherName}
          />
        ) : activeRoute === 'my-transactions' ? (
          <TeacherTransactionsView
            onBack={() => setActiveRoute('dashboard')}
            onNavigate={handleQuickLinkNavigate}
            onOpenModal={handleQuickLinkNavigate}
            teacherName={teacherName}
          />
        ) : (
          <>
            {/* Sub-Header / Quick Action Bar matching screenshot */}
            <div className="bg-white dark:bg-slate-900 border-b border-slate-200/90 dark:border-slate-800 px-4 sm:px-6 py-2.5 flex flex-wrap items-center justify-between gap-3 shrink-0">
              <div className="flex items-center gap-2 font-bold text-sm text-slate-800 dark:text-white">
                <BookOpen className="w-4 h-4 text-blue-600" />
                <span>My Dashboard</span>
              </div>

              {/* Top Quick Links Bar from screenshot */}
              <div className="hidden lg:flex items-center gap-4 text-xs font-semibold text-slate-600 dark:text-slate-300">
                <button
                  onClick={() => setActiveRoute('assignments')}
                  className="flex items-center gap-1.5 hover:text-purple-600 dark:hover:text-purple-400 transition-colors cursor-pointer"
                >
                  <BookMarked className="w-3.5 h-3.5" />
                  <span>Assignments</span>
                </button>
                <button
                  onClick={() => setActiveRoute('announcements')}
                  className="flex items-center gap-1.5 hover:text-purple-600 dark:hover:text-purple-400 transition-colors cursor-pointer"
                >
                  <Megaphone className="w-3.5 h-3.5" />
                  <span>Announcements</span>
                </button>
                <button
                  onClick={() => {
                    setOpenSidebarGroups((prev) => ({ ...prev, attendance: true }))
                    setActiveRoute('mark-attendance')
                  }}
                  className="flex items-center gap-1.5 hover:text-purple-600 dark:hover:text-purple-400 transition-colors cursor-pointer"
                >
                  <CheckSquare className="w-3.5 h-3.5" />
                  <span>Mark Attendance</span>
                </button>
                <button
                  onClick={() => {
                    setOpenSidebarGroups((prev) => ({ ...prev, exams: true }))
                    setActiveRoute('marks-entry')
                  }}
                  className="flex items-center gap-1.5 hover:text-purple-600 dark:hover:text-purple-400 transition-colors cursor-pointer"
                >
                  <FileEdit className="w-3.5 h-3.5" />
                  <span>Marks Entry</span>
                </button>
                <button
                  onClick={() => setActiveRoute('timetable')}
                  className="flex items-center gap-1.5 hover:text-purple-600 dark:hover:text-purple-400 transition-colors cursor-pointer"
                >
                  <Calendar className="w-3.5 h-3.5" />
                  <span>Timetables & Exam Schedules</span>
                </button>
                <button
                  onClick={() => setActiveRoute('my-transactions')}
                  className="flex items-center gap-1.5 hover:text-purple-600 dark:hover:text-purple-400 transition-colors cursor-pointer"
                >
                  <Wallet className="w-3.5 h-3.5" />
                  <span>My Salary</span>
                </button>
              </div>
            </div>

        {/* ========================================================= */}
        {/* 3. MAIN DASHBOARD SCROLL CONTENT */}
        {/* ========================================================= */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-7 space-y-5">
          {/* --------------------------------------------------------- */}
          {/* ROW 1: WELCOME & ATTENDANCE PUNCH CARD (from screenshot) */}
          {/* --------------------------------------------------------- */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-2xl p-5 shadow-xs flex flex-wrap items-center justify-between gap-4">
            <div className="space-y-1">
              <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
                Welcome back, {teacherName}!
              </h1>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Here's your teaching overview for today.
              </p>
              <div className="pt-1">
                {punchStatus === 'NOT_CHECKED_IN' && (
                  <button
                    type="button"
                    onClick={() => {
                      setOpenSidebarGroups((prev) => ({ ...prev, attendance: true }))
                      setActiveRoute('my-attendance')
                    }}
                    className="inline-flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 px-3 py-1 rounded-full border border-slate-200 dark:border-slate-700 hover:border-purple-400 hover:text-purple-600 dark:hover:text-purple-400 transition-colors cursor-pointer group"
                    title="Click to view My Attendance"
                  >
                    <Clock className="w-3.5 h-3.5 text-slate-400 group-hover:text-purple-500" />
                    <span>Not checked in today</span>
                  </button>
                )}
                {punchStatus === 'CHECKED_IN' && (
                  <button
                    type="button"
                    onClick={() => {
                      setOpenSidebarGroups((prev) => ({ ...prev, attendance: true }))
                      setActiveRoute('my-attendance')
                    }}
                    className="inline-flex items-center gap-1.5 text-xs text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/60 px-3 py-1 rounded-full border border-emerald-200 dark:border-emerald-800 font-semibold hover:border-emerald-400 transition-colors cursor-pointer group"
                    title="Click to view My Attendance"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 animate-pulse" />
                    <span>Checked in at {todayLog?.timeIn}</span>
                  </button>
                )}
                {punchStatus === 'CHECKED_OUT' && (
                  <button
                    type="button"
                    onClick={() => {
                      setOpenSidebarGroups((prev) => ({ ...prev, attendance: true }))
                      setActiveRoute('my-attendance')
                    }}
                    className="inline-flex items-center gap-1.5 text-xs text-blue-700 dark:text-blue-300 bg-blue-50 dark:bg-blue-950/60 px-3 py-1 rounded-full border border-blue-200 dark:border-blue-800 font-semibold hover:border-blue-400 transition-colors cursor-pointer group"
                    title="Click to view My Attendance"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5 text-blue-600" />
                    <span>Checked out at {todayLog?.timeOut} (In: {todayLog?.timeIn})</span>
                  </button>
                )}
              </div>
            </div>

            {/* Right Buttons: Time In + My Attendance + Date */}
            <div className="flex flex-wrap items-center gap-2.5">
              <button
                type="button"
                onClick={handleTogglePunch}
                className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold shadow-xs transition-all cursor-pointer flex items-center gap-1.5 ${
                  punchStatus === 'NOT_CHECKED_IN'
                    ? 'bg-emerald-600 hover:bg-emerald-700 text-white'
                    : punchStatus === 'CHECKED_IN'
                      ? 'bg-amber-600 hover:bg-amber-700 text-white'
                      : 'bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400 cursor-not-allowed'
                }`}
              >
                <Clock className="w-4 h-4" />
                <span>
                  {punchStatus === 'NOT_CHECKED_IN'
                    ? 'My Time In'
                    : punchStatus === 'CHECKED_IN'
                      ? 'My Time Out'
                      : 'Checked Out'}
                </span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setOpenSidebarGroups((prev) => ({ ...prev, attendance: true }))
                  setActiveRoute('my-attendance')
                }}
                className="px-4 py-2 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs sm:text-sm font-semibold transition-colors cursor-pointer"
              >
                My Attendance
              </button>

              <div className="hidden md:flex items-center gap-1.5 text-xs font-semibold text-slate-600 dark:text-slate-400 px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700/60">
                <Calendar className="w-3.5 h-3.5 text-slate-400" />
                <span>{formattedToday}</span>
              </div>
            </div>
          </div>

          {/* --------------------------------------------------------- */}
          {/* ROW 2: TODAY'S CLASSES & SCHEDULE CARD (from screenshot) */}
          {/* --------------------------------------------------------- */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-2xl p-5 shadow-xs">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <div>
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                  🎯 Today — {shortDayMonth}
                </span>
                <h2 className="text-base font-extrabold text-slate-900 dark:text-white mt-0.5">
                  Today's classes
                </h2>
                <span className="text-xs text-slate-500 dark:text-slate-400">
                  {scheduledPeriodsCount} periods scheduled
                </span>
              </div>

              <button
                type="button"
                onClick={() => setActiveModal('timetable')}
                className="px-3.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <Calendar className="w-3.5 h-3.5 text-purple-600 dark:text-purple-400" />
                <span>Full Timetable</span>
              </button>
            </div>

            {/* Schedule List (0 periods clean state as instructed) */}
            <div className="pt-4">
              <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800/80 text-center">
                <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
                  No classes or lectures scheduled for today. Periods assigned by administration will automatically appear here.
                </p>
              </div>
            </div>
          </div>

          {/* --------------------------------------------------------- */}
          {/* ROW 3: FOUR HORIZONTAL KPI CARDS (from screenshot) */}
          {/* --------------------------------------------------------- */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* 1. Assignments */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-2xl p-4 sm:p-5 shadow-xs flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-purple-50 dark:bg-purple-950/60 border border-purple-200 dark:border-purple-800/60 text-purple-600 dark:text-purple-400 flex items-center justify-center font-bold shrink-0">
                <BookMarked className="w-5 h-5" />
              </div>
              <div className="min-w-0">
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                  Assignments
                </span>
                <span className="text-2xl font-black text-slate-900 dark:text-white leading-none block my-1">
                  {assignments.length}
                </span>
                <span className="text-[11px] text-slate-400 dark:text-slate-500">
                  Posted
                </span>
              </div>
            </div>

            {/* 2. Classes */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-2xl p-4 sm:p-5 shadow-xs flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-cyan-50 dark:bg-cyan-950/60 border border-cyan-200 dark:border-cyan-800/60 text-cyan-600 dark:text-cyan-400 flex items-center justify-center font-bold shrink-0">
                <GraduationCap className="w-5 h-5" />
              </div>
              <div className="min-w-0">
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                  Classes
                </span>
                <span className="text-2xl font-black text-slate-900 dark:text-white leading-none block my-1">
                  0
                </span>
                <span className="text-[11px] text-slate-400 dark:text-slate-500">
                  Teaching
                </span>
              </div>
            </div>

            {/* 3. Subjects */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-2xl p-4 sm:p-5 shadow-xs flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-blue-50 dark:bg-blue-950/60 border border-blue-200 dark:border-blue-800/60 text-blue-600 dark:text-blue-400 flex items-center justify-center font-bold shrink-0">
                <BookOpen className="w-5 h-5" />
              </div>
              <div className="min-w-0">
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                  Subjects
                </span>
                <span className="text-2xl font-black text-slate-900 dark:text-white leading-none block my-1">
                  0
                </span>
                <span className="text-[11px] text-slate-400 dark:text-slate-500">
                  Assigned
                </span>
              </div>
            </div>

            {/* 4. Students */}
            <div
              onClick={() => {
                setOpenSidebarGroups((prev) => ({ ...prev, students: true }))
                setActiveRoute('students')
              }}
              className="bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-2xl p-4 sm:p-5 shadow-xs flex items-center gap-4 cursor-pointer hover:border-emerald-400/80 hover:shadow-md transition-all group"
            >
              <div className="w-12 h-12 rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-bold shrink-0 group-hover:scale-105 transition-transform">
                <Users className="w-5 h-5" />
              </div>
              <div className="min-w-0">
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                  Students
                </span>
                <span className="text-2xl font-black text-slate-900 dark:text-white leading-none block my-1">
                  {portalStudentsCount}
                </span>
                <span className="text-[11px] text-slate-400 dark:text-slate-500">
                  In your classes
                </span>
              </div>
            </div>
          </div>

          {/* --------------------------------------------------------- */}
          {/* ROW 4: QUICK LINKS BAR (from screenshot) */}
          {/* --------------------------------------------------------- */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-2xl p-5 shadow-xs">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">
              Quick Links
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
              {/* Button 1: My Attendance (Purple Filled) */}
              <button
                type="button"
                onClick={() => {
                  setOpenSidebarGroups((prev) => ({ ...prev, attendance: true }))
                  setActiveRoute('my-attendance')
                }}
                className="p-3.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-semibold text-xs flex flex-col items-center justify-center gap-2 shadow-sm transition-all cursor-pointer group"
              >
                <Clock className="w-5 h-5 group-hover:scale-110 transition-transform" />
                <span>My Attendance</span>
              </button>

              {/* Button 2: Assignments */}
              <button
                type="button"
                onClick={() => setActiveRoute('assignments')}
                className="p-3.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:border-purple-300 dark:hover:border-purple-700 hover:bg-purple-50/50 dark:hover:bg-purple-950/30 text-slate-700 dark:text-slate-200 font-semibold text-xs flex flex-col items-center justify-center gap-2 shadow-2xs transition-all cursor-pointer group"
              >
                <BookMarked className="w-5 h-5 text-slate-500 group-hover:text-purple-600 group-hover:scale-110 transition-transform" />
                <span>Assignments</span>
              </button>

              {/* Button 3: Mark Attendance */}
              <button
                type="button"
                onClick={() => {
                  setOpenSidebarGroups((prev) => ({ ...prev, attendance: true }))
                  setActiveRoute('mark-attendance')
                }}
                className="p-3.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:border-purple-300 dark:hover:border-purple-700 hover:bg-purple-50/50 dark:hover:bg-purple-950/30 text-slate-700 dark:text-slate-200 font-semibold text-xs flex flex-col items-center justify-center gap-2 shadow-2xs transition-all cursor-pointer group"
              >
                <CheckSquare className="w-5 h-5 text-slate-500 group-hover:text-purple-600 group-hover:scale-110 transition-transform" />
                <span>Mark Attendance</span>
              </button>

              {/* Button 4: Enter Marks */}
              <button
                type="button"
                onClick={() => {
                  setOpenSidebarGroups((prev) => ({ ...prev, exams: true }))
                  setActiveRoute('marks-entry')
                }}
                className="p-3.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:border-purple-300 dark:hover:border-purple-700 hover:bg-purple-50/50 dark:hover:bg-purple-950/30 text-slate-700 dark:text-slate-200 font-semibold text-xs flex flex-col items-center justify-center gap-2 shadow-2xs transition-all cursor-pointer group"
              >
                <FileEdit className="w-5 h-5 text-slate-500 group-hover:text-purple-600 group-hover:scale-110 transition-transform" />
                <span>Enter Marks</span>
              </button>

              {/* Button 5: My Timetable */}
              <button
                type="button"
                onClick={() => setActiveRoute('timetable')}
                className="p-3.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:border-purple-300 dark:hover:border-purple-700 hover:bg-purple-50/50 dark:hover:bg-purple-950/30 text-slate-700 dark:text-slate-200 font-semibold text-xs flex flex-col items-center justify-center gap-2 shadow-2xs transition-all cursor-pointer group"
              >
                <Calendar className="w-5 h-5 text-slate-500 group-hover:text-purple-600 group-hover:scale-110 transition-transform" />
                <span>My Timetable</span>
              </button>

              {/* Button 6: Announcements */}
              <button
                type="button"
                onClick={() => setActiveRoute('announcements')}
                className="p-3.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:border-purple-300 dark:hover:border-purple-700 hover:bg-purple-50/50 dark:hover:bg-purple-950/30 text-slate-700 dark:text-slate-200 font-semibold text-xs flex flex-col items-center justify-center gap-2 shadow-2xs transition-all cursor-pointer group"
              >
                <Megaphone className="w-5 h-5 text-slate-500 group-hover:text-purple-600 group-hover:scale-110 transition-transform" />
                <span>Announcements</span>
              </button>
            </div>
          </div>

          {/* --------------------------------------------------------- */}
          {/* ROW 5: ANNOUNCEMENTS & RECENT ASSIGNMENTS (from screenshot) */}
          {/* --------------------------------------------------------- */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            {/* Left Card: Latest Announcements */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-2xl p-5 shadow-xs flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3 mb-3">
                  <div className="flex items-center gap-2 font-bold text-sm text-slate-900 dark:text-white">
                    <Megaphone className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                    <span>Latest Announcements</span>
                  </div>
                  <button
                    onClick={() => setActiveModal('announcements')}
                    className="text-xs font-semibold text-blue-600 dark:text-blue-400 hover:underline cursor-pointer"
                  >
                    View all
                  </button>
                </div>

                {/* Announcement Items */}
                <div className="space-y-3">
                  <div className="p-3 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800/60 transition-colors border border-slate-100 dark:border-slate-800/80">
                    <h4 className="text-xs font-bold text-slate-900 dark:text-white">
                      Summer Holidays
                    </h4>
                    <span className="text-[11px] text-slate-400 mt-0.5 flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      <span>15 Jun 2026</span>
                    </span>
                  </div>

                  <div className="p-3 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800/60 transition-colors border border-slate-100 dark:border-slate-800/80">
                    <h4 className="text-xs font-bold text-slate-900 dark:text-white">
                      25 December Holiday!
                    </h4>
                    <span className="text-[11px] text-slate-400 mt-0.5 flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      <span>15 Dec 2025</span>
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Card: Recent Assignments (Clean Zero State) */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-2xl p-5 shadow-xs flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3 mb-3">
                  <div className="flex items-center gap-2 font-bold text-sm text-slate-900 dark:text-white">
                    <BookMarked className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                    <span>Recent Assignments</span>
                  </div>
                  <button
                    onClick={() => setActiveModal('assignments')}
                    className="text-xs font-semibold text-blue-600 dark:text-blue-400 hover:underline cursor-pointer"
                  >
                    View all
                  </button>
                </div>

                {/* Zero State exactly matching screenshot */}
                {assignments.length === 0 ? (
                  <div className="py-10 flex flex-col items-center justify-center text-center">
                    <div className="w-12 h-12 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-400 mb-2">
                      <BookOpen className="w-6 h-6" />
                    </div>
                    <p className="text-xs text-slate-400 dark:text-slate-500 font-medium">
                      No recent assignments / handouts
                    </p>
                  </div>
                ) : (
                  <div className="space-y-2.5">
                    {assignments.slice(0, 3).map(asg => (
                      <div key={asg.id} className="p-3 rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 flex items-center justify-between">
                        <div>
                          <div className="text-xs font-bold text-slate-900 dark:text-white">{asg.title}</div>
                          <div className="text-[11px] text-slate-400">{asg.className} • {asg.subject}</div>
                        </div>
                        <span className="text-[10px] font-semibold text-purple-600 dark:text-purple-400 bg-purple-50 dark:bg-purple-950/60 px-2 py-0.5 rounded-full">
                          Due: {asg.dueDate}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </main>
      </>
    )}
      </div>

      {/* ========================================================= */}
      {/* 4. INTERACTIVE MODALS FOR 100% WORKING FUNCTIONALITY */}
      {/* ========================================================= */}

      {/* MODAL 1: MY ATTENDANCE HISTORY */}
      {activeModal === 'attendance' && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 dark:border-slate-800 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <Clock className="w-5 h-5 text-purple-600" />
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  My Attendance History
                </h3>
              </div>
              <button
                onClick={() => setActiveModal(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3">
              <div className="p-3.5 rounded-xl bg-purple-50 dark:bg-purple-950/40 border border-purple-100 dark:border-purple-800 flex items-center justify-between">
                <div>
                  <div className="text-xs text-slate-500">Today's Status</div>
                  <div className="text-sm font-bold text-purple-700 dark:text-purple-300">
                    {punchStatus === 'NOT_CHECKED_IN' ? 'Not Checked In' : punchStatus === 'CHECKED_IN' ? `Time In: ${todayLog?.timeIn}` : `Completed (In: ${todayLog?.timeIn}, Out: ${todayLog?.timeOut})`}
                  </div>
                </div>
                <button
                  type="button"
                  onClick={handleTogglePunch}
                  className="px-3.5 py-1.5 rounded-lg bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold shadow-xs cursor-pointer"
                >
                  {punchStatus === 'NOT_CHECKED_IN' ? 'Time In' : punchStatus === 'CHECKED_IN' ? 'Time Out' : 'Done'}
                </button>
              </div>

              <div className="max-h-56 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800">
                {attendanceLogs.length === 0 ? (
                  <div className="py-8 text-center text-xs text-slate-400">
                    No attendance logs recorded yet.
                  </div>
                ) : (
                  attendanceLogs.map((log) => (
                    <div key={log.id} className="py-2.5 flex items-center justify-between text-xs">
                      <div>
                        <div className="font-semibold text-slate-800 dark:text-slate-200">{log.date}</div>
                        <div className="text-[11px] text-slate-400">
                          In: {log.timeIn || '—'} | Out: {log.timeOut || '—'}
                        </div>
                      </div>
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300">
                        {log.status || 'Present'}
                      </span>
                    </div>
                  ))
                )}
              </div>
            </div>

            <div className="pt-2 flex justify-end">
              <button
                type="button"
                onClick={() => setActiveModal(null)}
                className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-semibold hover:bg-slate-200 cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 2: ASSIGNMENTS (POST / VIEW) */}
      {activeModal === 'assignments' && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 dark:border-slate-800 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <BookMarked className="w-5 h-5 text-purple-600" />
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  Post New Assignment
                </h3>
              </div>
              <button
                onClick={() => setActiveModal(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-white cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateAssignment} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Assignment Title *
                </label>
                <input
                  type="text"
                  required
                  value={newAssignmentTitle}
                  onChange={(e) => setNewAssignmentTitle(e.target.value)}
                  placeholder="e.g. Chapter 4 Exercises 1-10"
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs sm:text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-purple-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Class
                  </label>
                  <select
                    value={newAssignmentClass}
                    onChange={(e) => setNewAssignmentClass(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs text-slate-900 dark:text-white focus:outline-none"
                  >
                    <option value="Grade 10 - Section A">Grade 10 - Section A</option>
                    <option value="Grade 9 - Section B">Grade 9 - Section B</option>
                    <option value="Grade 8 - Section A">Grade 8 - Section A</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Subject
                  </label>
                  <select
                    value={newAssignmentSubject}
                    onChange={(e) => setNewAssignmentSubject(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs text-slate-900 dark:text-white focus:outline-none"
                  >
                    <option value="Mathematics">Mathematics</option>
                    <option value="Physics">Physics</option>
                    <option value="English">English</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Due Date
                </label>
                <input
                  type="date"
                  value={newAssignmentDueDate}
                  onChange={(e) => setNewAssignmentDueDate(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs text-slate-900 dark:text-white focus:outline-none"
                />
              </div>

              <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setActiveModal(null)}
                  className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-semibold hover:bg-slate-200 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold shadow-xs cursor-pointer"
                >
                  Post Assignment
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 3: MARK ATTENDANCE */}
      {activeModal === 'mark-attendance' && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 dark:border-slate-800 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <CheckSquare className="w-5 h-5 text-purple-600" />
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  Mark Class Roll-Call
                </h3>
              </div>
              <button
                onClick={() => setActiveModal(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-white cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 text-center space-y-2">
              <Users className="w-8 h-8 text-slate-400 mx-auto" />
              <p className="text-xs text-slate-500 dark:text-slate-400">
                0 students assigned to your current active roster. Student enrollments will appear here for one-click Present / Absent roll call.
              </p>
            </div>

            <div className="pt-2 flex justify-end">
              <button
                type="button"
                onClick={() => setActiveModal(null)}
                className="px-4 py-2 rounded-xl bg-purple-600 text-white text-xs font-semibold hover:bg-purple-700 cursor-pointer"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 4: MARKS ENTRY */}
      {activeModal === 'marks-entry' && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 dark:border-slate-800 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <FileEdit className="w-5 h-5 text-purple-600" />
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  Examination Marks Entry
                </h3>
              </div>
              <button
                onClick={() => setActiveModal(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-white cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 text-center space-y-2">
              <FileSpreadsheet className="w-8 h-8 text-slate-400 mx-auto" />
              <p className="text-xs text-slate-500 dark:text-slate-400">
                0 active examination sheets found for this academic session. Exam schedules created by administration will be editable here.
              </p>
            </div>

            <div className="pt-2 flex justify-end">
              <button
                type="button"
                onClick={() => setActiveModal(null)}
                className="px-4 py-2 rounded-xl bg-purple-600 text-white text-xs font-semibold hover:bg-purple-700 cursor-pointer"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 5: TIMETABLE */}
      {activeModal === 'timetable' && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 dark:border-slate-800 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <Calendar className="w-5 h-5 text-purple-600" />
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  Weekly Class Timetable
                </h3>
              </div>
              <button
                onClick={() => setActiveModal(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-white cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 text-center space-y-2">
              <Clock className="w-8 h-8 text-slate-400 mx-auto" />
              <p className="text-xs text-slate-500 dark:text-slate-400">
                0 period routines currently assigned. Weekly class timetable will synchronize directly from the administration schedule.
              </p>
            </div>

            <div className="pt-2 flex justify-end">
              <button
                type="button"
                onClick={() => setActiveModal(null)}
                className="px-4 py-2 rounded-xl bg-purple-600 text-white text-xs font-semibold hover:bg-purple-700 cursor-pointer"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 6: MY SALARY */}
      {activeModal === 'salary' && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 dark:border-slate-800 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <Wallet className="w-5 h-5 text-purple-600" />
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  Faculty Compensation & Payslips
                </h3>
              </div>
              <button
                onClick={() => setActiveModal(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-white cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 text-center space-y-2">
              <Receipt className="w-8 h-8 text-slate-400 mx-auto" />
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Monthly electronic payslips generated by the campus bursar will appear here for direct review and printing.
              </p>
            </div>

            <div className="pt-2 flex justify-end">
              <button
                type="button"
                onClick={() => setActiveModal(null)}
                className="px-4 py-2 rounded-xl bg-purple-600 text-white text-xs font-semibold hover:bg-purple-700 cursor-pointer"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 7: ANNOUNCEMENTS */}
      {activeModal === 'announcements' && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 dark:border-slate-800 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <Megaphone className="w-5 h-5 text-purple-600" />
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  School Announcements
                </h3>
              </div>
              <button
                onClick={() => setActiveModal(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-white cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-2.5 max-h-60 overflow-y-auto">
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800">
                <div className="text-xs font-bold text-slate-900 dark:text-white">Summer Holidays</div>
                <div className="text-[11px] text-slate-500 mt-1">Official annual summer recess notice for all faculty and students.</div>
                <span className="text-[10px] text-purple-600 font-semibold mt-1 block">15 Jun 2026</span>
              </div>
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800">
                <div className="text-xs font-bold text-slate-900 dark:text-white">25 December Holiday!</div>
                <div className="text-[11px] text-slate-500 mt-1">Quaid-e-Azam Day and Christmas public holiday circular.</div>
                <span className="text-[10px] text-purple-600 font-semibold mt-1 block">15 Dec 2025</span>
              </div>
            </div>

            <div className="pt-2 flex justify-end">
              <button
                type="button"
                onClick={() => setActiveModal(null)}
                className="px-4 py-2 rounded-xl bg-purple-600 text-white text-xs font-semibold hover:bg-purple-700 cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
