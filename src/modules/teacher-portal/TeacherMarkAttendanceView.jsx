import React, { useState, useMemo, useEffect } from 'react'
import {
  Users,
  QrCode,
  Calendar,
  Filter,
  Search,
  Printer,
  FileSpreadsheet,
  CheckCircle2,
  XCircle,
  Clock,
  FileText,
  Send,
  Building2,
  CheckSquare,
  Square,
  BookMarked,
  Megaphone,
  FileEdit,
  Wallet,
  X,
  Sparkles,
  Camera,
  Download
} from 'lucide-react'
import { useAppData } from '../../context/AppDataContext'
import { useToast } from '../../context/ToastContext'

export default function TeacherMarkAttendanceView({
  onBack,
  onOpenModal,
  teacherName = 'Teacher'
}) {
  const { classes: appClasses = [] } = useAppData()
  const { toast } = useToast()

  // Active Tab: 'students' | 'qr_scan'
  const [activeTab, setActiveTab] = useState('students')

  // Date and Time String
  const [currentDateTime, setCurrentDateTime] = useState(() => {
    const now = new Date()
    return now.toLocaleDateString('en-GB', {
      weekday: 'long',
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    }) + ' - ' + now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  })

  useEffect(() => {
    const timer = setInterval(() => {
      const now = new Date()
      setCurrentDateTime(
        now.toLocaleDateString('en-GB', {
          weekday: 'long',
          day: 'numeric',
          month: 'short',
          year: 'numeric'
        }) + ' - ' + now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      )
    }, 30000)
    return () => clearInterval(timer)
  }, [])

  // Load students from localStorage
  const [students, setStudents] = useState(() => {
    try {
      const saved = localStorage.getItem('teacher_portal_students')
      if (saved) {
        const parsed = JSON.parse(saved)
        if (Array.isArray(parsed)) return parsed
      }
    } catch {}
    return []
  })

  // Attendance Records State (studentId -> { status: 'present' | 'absent' | 'late' | 'leave', comment: '' })
  const todayIso = new Date().toISOString().split('T')[0]
  const attendanceStorageKey = `teacher_student_attendance_${todayIso}`

  const [attendanceMap, setAttendanceMap] = useState(() => {
    try {
      const saved = localStorage.getItem(attendanceStorageKey)
      if (saved) return JSON.parse(saved)
    } catch {}
    return {}
  })

  // Save changes to localStorage
  const updateAttendanceMap = (newMap) => {
    setAttendanceMap(newMap)
    try {
      localStorage.setItem(attendanceStorageKey, JSON.stringify(newMap))
    } catch {}
  }

  // Filter States
  const [selectedClass, setSelectedClass] = useState('all')
  const [attendanceType, setAttendanceType] = useState('general')
  const [showStatusFilter, setShowStatusFilter] = useState('all') // 'all' | 'present' | 'absent' | 'late' | 'leave'
  const [searchTerm, setSearchTerm] = useState('')
  const [activeSearch, setActiveSearch] = useState('')

  // Checkbox Selection for Bulk Actions
  const [selectedStudentIds, setSelectedStudentIds] = useState(new Set())

  // Modals
  const [isBlankSheetModalOpen, setIsBlankSheetModalOpen] = useState(false)
  const [isMonthlySheetModalOpen, setIsMonthlySheetModalOpen] = useState(false)
  const [smsModalStudent, setSmsModalStudent] = useState(null)
  const [isQrScannerActive, setIsQrScannerActive] = useState(false)

  // Filtered Students
  const filteredStudents = useMemo(() => {
    return students.filter((s) => {
      if (selectedClass !== 'all' && s.className !== selectedClass) return false

      const currentStatus = attendanceMap[s.id]?.status || 'unmarked'
      if (showStatusFilter !== 'all' && currentStatus !== showStatusFilter) return false

      if (activeSearch.trim()) {
        const q = activeSearch.toLowerCase()
        const matchName = s.name?.toLowerCase().includes(q)
        const matchRoll = s.rollNo?.toLowerCase().includes(q) || s.classRoll?.toLowerCase().includes(q)
        const matchAdm = s.admissionNo?.toLowerCase().includes(q)
        if (!matchName && !matchRoll && !matchAdm) return false
      }

      return true
    })
  }, [students, selectedClass, showStatusFilter, activeSearch, attendanceMap])

  // Select all toggle
  const isAllSelected = filteredStudents.length > 0 && selectedStudentIds.size === filteredStudents.length

  const handleToggleSelectAll = () => {
    if (isAllSelected) {
      setSelectedStudentIds(new Set())
    } else {
      setSelectedStudentIds(new Set(filteredStudents.map((s) => s.id)))
    }
  }

  const handleToggleStudentSelect = (id) => {
    const next = new Set(selectedStudentIds)
    if (next.has(id)) next.delete(id)
    else next.add(id)
    setSelectedStudentIds(next)
  }

  // Mark Status for an individual student
  const handleMarkStatus = (studentId, status) => {
    const current = attendanceMap[studentId] || {}
    const updated = {
      ...attendanceMap,
      [studentId]: {
        ...current,
        status: current.status === status ? undefined : status,
        markedAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }
    }
    updateAttendanceMap(updated)
  }

  // Update Comment
  const handleCommentChange = (studentId, comment) => {
    const current = attendanceMap[studentId] || {}
    const updated = {
      ...attendanceMap,
      [studentId]: {
        ...current,
        comment
      }
    }
    updateAttendanceMap(updated)
  }

  // Bulk Mark All (or Selected)
  const handleBulkMark = (status) => {
    const targets = selectedStudentIds.size > 0
      ? filteredStudents.filter((s) => selectedStudentIds.has(s.id))
      : filteredStudents

    if (targets.length === 0) {
      toast?.info?.('No students available to mark.')
      return
    }

    const updated = { ...attendanceMap }
    const timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })

    targets.forEach((s) => {
      updated[s.id] = {
        ...(updated[s.id] || {}),
        status,
        markedAt: timeStr
      }
    })

    updateAttendanceMap(updated)
    toast?.success?.(`Marked ${targets.length} students as ${status}!`)
  }

  // Seed Demo Roster if empty
  const handleSeedRoster = () => {
    const placeholders = [
      {
        id: 'std-1',
        name: 'Student Alpha',
        rollNo: '001',
        className: 'Nursery',
        section: 'A',
        admissionNo: 'ED/N/2019/29538',
        parentName: 'Guardian Alpha',
        parentPhone: '03001008023'
      },
      {
        id: 'std-2',
        name: 'Student Beta',
        rollNo: '002',
        className: 'Nursery',
        section: 'A',
        admissionNo: 'ED-2026-279',
        parentName: 'Guardian Beta',
        parentPhone: '03421242905'
      },
      {
        id: 'std-3',
        name: 'Student Gamma',
        rollNo: '003',
        classRoll: 'REG-2026-001',
        className: 'Nursery',
        section: 'A',
        admissionNo: 'ED-2026-281',
        parentName: 'Guardian Gamma',
        parentPhone: '03078888888'
      },
      {
        id: 'std-4',
        name: 'Student Delta',
        rollNo: '004',
        className: 'Nursery',
        section: 'A',
        admissionNo: 'ED/N/2015/54963',
        parentName: 'Guardian Delta',
        parentPhone: '+1 (404) 237-9511'
      },
      {
        id: 'std-5',
        name: 'Student Epsilon',
        rollNo: '005',
        className: 'Nursery',
        section: 'A',
        admissionNo: 'ED-2026-302',
        parentName: 'Guardian Epsilon',
        parentPhone: '03334445566'
      }
    ]
    setStudents(placeholders)
    try {
      localStorage.setItem('teacher_portal_students', JSON.stringify(placeholders))
    } catch {}
    toast?.success?.('Loaded demo student roster!')
  }

  // Clear Roster back to 0
  const handleClearRoster = () => {
    if (window.confirm('Reset student roster to 0 records?')) {
      setStudents([])
      try {
        localStorage.setItem('teacher_portal_students', JSON.stringify([]))
      } catch {}
      updateAttendanceMap({})
      toast?.info?.('Roster reset to 0 records.')
    }
  }

  // Summary counts
  const presentCount = useMemo(() => {
    return filteredStudents.filter((s) => attendanceMap[s.id]?.status === 'present').length
  }, [filteredStudents, attendanceMap])

  const absentCount = useMemo(() => {
    return filteredStudents.filter((s) => attendanceMap[s.id]?.status === 'absent').length
  }, [filteredStudents, attendanceMap])

  const lateCount = useMemo(() => {
    return filteredStudents.filter((s) => attendanceMap[s.id]?.status === 'late').length
  }, [filteredStudents, attendanceMap])

  const leaveCount = useMemo(() => {
    return filteredStudents.filter((s) => attendanceMap[s.id]?.status === 'leave').length
  }, [filteredStudents, attendanceMap])

  return (
    <div className="flex-1 flex flex-col min-h-0 bg-slate-50/70 dark:bg-slate-950">
      {/* ========================================================= */}
      {/* 1. SUB-HEADER BAR */}
      {/* ========================================================= */}
      <div className="bg-white dark:bg-slate-900 border-b border-slate-200/90 dark:border-slate-800 px-4 sm:px-6 py-2.5 flex flex-wrap items-center justify-between gap-3 shrink-0 shadow-2xs">
        <div className="flex flex-col">
          <div className="flex items-center gap-2 font-black text-sm text-slate-900 dark:text-white">
            <CheckSquare className="w-4 h-4 text-sky-600 dark:text-sky-400" />
            <span>Mark Attendance</span>
          </div>
          <button
            onClick={onBack}
            className="text-xs font-semibold text-slate-500 hover:text-sky-600 dark:text-slate-400 dark:hover:text-sky-400 flex items-center gap-1 transition-colors mt-0.5 cursor-pointer text-left w-fit"
          >
            <span>+ Back</span>
          </button>
        </div>

        {/* Top Quick Links Bar (Mark Attendance highlighted) */}
        <div className="hidden lg:flex items-center gap-3 text-xs font-semibold text-slate-600 dark:text-slate-300">
          <button
            onClick={() => onOpenModal && onOpenModal('assignments')}
            className="flex items-center gap-1.5 hover:text-purple-600 dark:hover:text-purple-400 transition-colors cursor-pointer px-2 py-1"
          >
            <BookMarked className="w-3.5 h-3.5" />
            <span>Assignments</span>
          </button>
          <button
            onClick={() => onOpenModal && onOpenModal('announcements')}
            className="flex items-center gap-1.5 hover:text-purple-600 dark:hover:text-purple-400 transition-colors cursor-pointer px-2 py-1"
          >
            <Megaphone className="w-3.5 h-3.5" />
            <span>Announcements</span>
          </button>
          <div className="flex items-center gap-1.5 text-sky-700 dark:text-sky-300 bg-sky-50 dark:bg-sky-950/60 px-3 py-1.5 rounded-xl border border-sky-200 dark:border-sky-800 font-bold shadow-2xs">
            <CheckSquare className="w-3.5 h-3.5 text-sky-600 dark:text-sky-400" />
            <span>Mark Attendance</span>
          </div>
          <button
            onClick={() => onOpenModal && onOpenModal('marks-entry')}
            className="flex items-center gap-1.5 hover:text-purple-600 dark:hover:text-purple-400 transition-colors cursor-pointer px-2 py-1"
          >
            <FileEdit className="w-3.5 h-3.5" />
            <span>Marks Entry</span>
          </button>
          <button
            onClick={() => onOpenModal && onOpenModal('timetable')}
            className="flex items-center gap-1.5 hover:text-purple-600 dark:hover:text-purple-400 transition-colors cursor-pointer px-2 py-1"
          >
            <Calendar className="w-3.5 h-3.5" />
            <span>Timetables & Exam Schedules</span>
          </button>
          <button
            onClick={() => onOpenModal && onOpenModal('salary')}
            className="flex items-center gap-1.5 hover:text-purple-600 dark:hover:text-purple-400 transition-colors cursor-pointer px-2 py-1"
          >
            <Wallet className="w-3.5 h-3.5" />
            <span>My Salary</span>
          </button>
        </div>
      </div>

      {/* ========================================================= */}
      {/* 2. MAIN SCROLL CONTAINER */}
      {/* ========================================================= */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-7 space-y-4">
        {/* ROW 1: TOP TABS (STUDENTS vs QR SCAN) & DATE TIME BADGE */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveTab('students')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                activeTab === 'students'
                  ? 'bg-sky-600 text-white shadow-xs'
                  : 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              <Users className="w-3.5 h-3.5" />
              <span>Students</span>
            </button>
            <button
              onClick={() => {
                setActiveTab('qr_scan')
                setIsQrScannerActive(true)
              }}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                activeTab === 'qr_scan'
                  ? 'bg-sky-600 text-white shadow-xs'
                  : 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              <QrCode className="w-3.5 h-3.5" />
              <span>QR Scan</span>
            </button>
          </div>

          <div className="flex items-center gap-2 text-xs font-bold text-sky-800 dark:text-sky-300 bg-sky-50 dark:bg-sky-950/50 px-3.5 py-1.5 rounded-xl border border-sky-200/80 dark:border-sky-800 shadow-2xs">
            <Calendar className="w-3.5 h-3.5 text-sky-600 dark:text-sky-400" />
            <span>{currentDateTime}</span>
          </div>
        </div>

        {/* ROW 2: FILTERS CARD */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-2xl p-4 sm:p-5 shadow-xs space-y-3">
          {/* Top Bar of Filters: Label + Bulk Action Segment */}
          <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-100 dark:border-slate-800">
            <div className="flex items-center gap-2 text-xs font-extrabold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
              <Filter className="w-3.5 h-3.5" />
              <span>FILTERS</span>
            </div>

            {/* Right Bulk Mark Buttons */}
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-sky-50 dark:bg-sky-950/60 text-sky-700 dark:text-sky-300 border border-sky-200 dark:border-sky-800 flex items-center gap-1">
                <Users className="w-3 h-3" />
                <span>{filteredStudents.length} students</span>
              </span>

              <div className="flex items-center gap-1 border-l border-slate-200 dark:border-slate-800 pl-2">
                <button
                  type="button"
                  onClick={() => handleBulkMark('present')}
                  className="px-2.5 py-1 rounded-lg text-xs font-bold text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/50 hover:bg-emerald-100 border border-emerald-200 dark:border-emerald-800 transition-colors flex items-center gap-1 cursor-pointer"
                  title="Mark all filtered students as Present"
                >
                  <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                  <span>Present ({presentCount})</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleBulkMark('absent')}
                  className="px-2.5 py-1 rounded-lg text-xs font-bold text-rose-700 dark:text-rose-300 bg-rose-50 dark:bg-rose-950/50 hover:bg-rose-100 border border-rose-200 dark:border-rose-800 transition-colors flex items-center gap-1 cursor-pointer"
                  title="Mark all filtered students as Absent"
                >
                  <XCircle className="w-3 h-3 text-rose-600" />
                  <span>Absent ({absentCount})</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleBulkMark('late')}
                  className="px-2.5 py-1 rounded-lg text-xs font-bold text-amber-700 dark:text-amber-300 bg-amber-50 dark:bg-amber-950/50 hover:bg-amber-100 border border-amber-200 dark:border-amber-800 transition-colors flex items-center gap-1 cursor-pointer"
                  title="Mark all filtered students as Late"
                >
                  <Clock className="w-3 h-3 text-amber-600" />
                  <span>Late ({lateCount})</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleBulkMark('leave')}
                  className="px-2.5 py-1 rounded-lg text-xs font-bold text-sky-700 dark:text-sky-300 bg-sky-50 dark:bg-sky-950/50 hover:bg-sky-100 border border-sky-200 dark:border-sky-800 transition-colors flex items-center gap-1 cursor-pointer"
                  title="Mark all filtered students as on Leave"
                >
                  <FileText className="w-3 h-3 text-sky-600" />
                  <span>Leave ({leaveCount})</span>
                </button>
              </div>
            </div>
          </div>

          {/* Filter Form Controls */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-3 items-end">
            {/* CLASS (2 cols) */}
            <div className="lg:col-span-2 space-y-1">
              <label className="text-[10px] font-extrabold uppercase text-slate-400 block tracking-wider">
                CLASS
              </label>
              <select
                value={selectedClass}
                onChange={(e) => setSelectedClass(e.target.value)}
                className="w-full text-xs font-semibold px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 focus:outline-hidden focus:ring-2 focus:ring-sky-500 cursor-pointer"
              >
                <option value="all">All classes</option>
                <option value="Nursery">Nursery</option>
                <option value="Prep">Prep</option>
                <option value="Class 1">Class 1</option>
                <option value="Class 2">Class 2</option>
                <option value="Class 3">Class 3</option>
                <option value="Class 4">Class 4</option>
                <option value="Class 5">Class 5</option>
              </select>
            </div>

            {/* TYPE (2 cols) */}
            <div className="lg:col-span-2 space-y-1">
              <label className="text-[10px] font-extrabold uppercase text-slate-400 block tracking-wider">
                TYPE
              </label>
              <select
                value={attendanceType}
                onChange={(e) => setAttendanceType(e.target.value)}
                className="w-full text-xs font-semibold px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 focus:outline-hidden focus:ring-2 focus:ring-sky-500 cursor-pointer"
              >
                <option value="general">General</option>
                <option value="period_wise">Period-wise</option>
                <option value="subject_wise">Subject-wise</option>
              </select>
            </div>

            {/* SHOW (2 cols) */}
            <div className="lg:col-span-2 space-y-1">
              <label className="text-[10px] font-extrabold uppercase text-slate-400 block tracking-wider">
                SHOW
              </label>
              <select
                value={showStatusFilter}
                onChange={(e) => setShowStatusFilter(e.target.value)}
                className="w-full text-xs font-semibold px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 focus:outline-hidden focus:ring-2 focus:ring-sky-500 cursor-pointer"
              >
                <option value="all">All ({students.length})</option>
                <option value="present">Present only</option>
                <option value="absent">Absent only</option>
                <option value="late">Late only</option>
                <option value="leave">Leave only</option>
              </select>
            </div>

            {/* SEARCH (3 cols) */}
            <div className="lg:col-span-3 space-y-1">
              <label className="text-[10px] font-extrabold uppercase text-slate-400 block tracking-wider">
                SEARCH
              </label>
              <div className="flex rounded-xl overflow-hidden border border-slate-200 dark:border-slate-700 focus-within:ring-2 focus-within:ring-sky-500">
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => {
                    setSearchTerm(e.target.value)
                    setActiveSearch(e.target.value)
                  }}
                  placeholder="Name / roll no..."
                  className="flex-1 text-xs px-3 py-2 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-200 placeholder:text-slate-400 focus:outline-hidden"
                />
              </div>
            </div>

            {/* BUTTONS (3 cols): Apply Filters + Blank Sheet + Monthly Sheet */}
            <div className="lg:col-span-3 flex items-center gap-1.5">
              <button
                type="button"
                onClick={() => setActiveSearch(searchTerm)}
                className="bg-sky-600 hover:bg-sky-700 text-white font-bold text-xs px-3 py-2 rounded-xl flex items-center justify-center gap-1 transition-colors shadow-sm cursor-pointer whitespace-nowrap"
              >
                <Filter className="w-3.5 h-3.5" />
                <span>Apply Filters</span>
              </button>

              <button
                type="button"
                onClick={() => setIsBlankSheetModalOpen(true)}
                className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 text-xs font-semibold px-2.5 py-2 rounded-xl flex items-center justify-center gap-1 transition-colors cursor-pointer whitespace-nowrap"
                title="Print blank attendance sheet"
              >
                <Printer className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Print blank sheet</span>
              </button>

              <button
                type="button"
                onClick={() => setIsMonthlySheetModalOpen(true)}
                className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 text-xs font-semibold px-2.5 py-2 rounded-xl flex items-center justify-center gap-1 transition-colors cursor-pointer whitespace-nowrap"
                title="View monthly attendance sheet"
              >
                <Calendar className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Monthly sheet</span>
              </button>
            </div>
          </div>
        </div>

        {/* ROW 3: MARK STUDENTS TABLE */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-2xl shadow-xs overflow-hidden">
          {/* Table Header Section */}
          <div className="px-5 py-4 border-b border-slate-100 dark:border-slate-800 flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4 text-sky-600 dark:text-sky-400" />
              <h3 className="font-extrabold text-sm sm:text-base text-slate-900 dark:text-white uppercase tracking-wide">
                MARK STUDENTS
              </h3>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs font-bold px-3 py-1 rounded-full bg-sky-50 dark:bg-sky-950/60 text-sky-700 dark:text-sky-300 border border-sky-200 dark:border-sky-800 flex items-center gap-1.5">
                <Building2 className="w-3.5 h-3.5" />
                <span>{selectedClass === 'all' ? 'All classes' : selectedClass}</span>
              </span>

              {students.length === 0 && (
                <button
                  type="button"
                  onClick={handleSeedRoster}
                  className="bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-semibold px-3 py-1.5 rounded-xl flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <Sparkles className="w-3 h-3 text-amber-500" />
                  <span>Load Demo Students</span>
                </button>
              )}

              {students.length > 0 && (
                <button
                  type="button"
                  onClick={handleClearRoster}
                  className="text-xs font-semibold text-rose-500 hover:text-rose-700 hover:bg-rose-50 dark:hover:bg-rose-950/50 px-2.5 py-1 rounded-lg transition-colors cursor-pointer"
                >
                  Reset
                </button>
              )}
            </div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-50/80 dark:bg-slate-800/60 border-b border-slate-200/80 dark:border-slate-800 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                  <th className="py-3 px-4 w-10 text-center">
                    <button
                      type="button"
                      onClick={handleToggleSelectAll}
                      className="cursor-pointer text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                    >
                      {isAllSelected ? (
                        <CheckSquare className="w-4 h-4 text-sky-600" />
                      ) : (
                        <Square className="w-4 h-4" />
                      )}
                    </button>
                  </th>
                  <th className="py-3 px-3 w-10 text-center">#</th>
                  <th className="py-3 px-4">STUDENT</th>
                  <th className="py-3 px-4 w-72 text-center">STATUS</th>
                  <th className="py-3 px-4 w-60">COMMENT</th>
                  <th className="py-3 px-4 w-28 text-center">SMS</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {filteredStudents.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="py-16 text-center">
                      <div className="flex flex-col items-center justify-center max-w-sm mx-auto text-center space-y-3">
                        <div className="w-14 h-14 rounded-2xl bg-sky-50 dark:bg-sky-950/60 flex items-center justify-center text-sky-600 shadow-inner">
                          <Users className="w-7 h-7" />
                        </div>
                        <div>
                          <h4 className="text-base font-extrabold text-slate-900 dark:text-white">
                            No students found
                          </h4>
                          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                            0 students currently match your filters or are enrolled in this class.
                          </p>
                        </div>
                        <div className="flex items-center gap-2 pt-1">
                          <button
                            type="button"
                            onClick={handleSeedRoster}
                            className="bg-sky-600 hover:bg-sky-700 text-white font-bold text-xs px-3.5 py-2 rounded-xl transition-colors cursor-pointer flex items-center gap-1.5 shadow-sm"
                          >
                            <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                            <span>Seed Demo Students</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              setSelectedClass('all')
                              setShowStatusFilter('all')
                              setActiveSearch('')
                              setSearchTerm('')
                            }}
                            className="bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-semibold text-xs px-3 py-2 rounded-xl hover:bg-slate-200 cursor-pointer"
                          >
                            Reset Filters
                          </button>
                        </div>
                      </div>
                    </td>
                  </tr>
                ) : (
                  filteredStudents.map((student, idx) => {
                    const studentRecord = attendanceMap[student.id] || {}
                    const status = studentRecord.status // 'present' | 'absent' | 'late' | 'leave' | undefined
                    const comment = studentRecord.comment || ''
                    const isSelected = selectedStudentIds.has(student.id)

                    return (
                      <tr
                        key={student.id || idx}
                        className={`transition-colors ${
                          status === 'absent'
                            ? 'bg-rose-50/50 dark:bg-rose-950/20'
                            : status === 'late'
                            ? 'bg-amber-50/40 dark:bg-amber-950/20'
                            : 'hover:bg-slate-50/70 dark:hover:bg-slate-800/40'
                        }`}
                      >
                        {/* Checkbox */}
                        <td className="py-3 px-4 text-center">
                          <button
                            type="button"
                            onClick={() => handleToggleStudentSelect(student.id)}
                            className="cursor-pointer text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                          >
                            {isSelected ? (
                              <CheckSquare className="w-4 h-4 text-sky-600" />
                            ) : (
                              <Square className="w-4 h-4" />
                            )}
                          </button>
                        </td>

                        {/* Number # */}
                        <td className="py-3 px-3 text-center font-bold text-slate-500 dark:text-slate-400">
                          {idx + 1}
                        </td>

                        {/* Student Details */}
                        <td className="py-3 px-4">
                          <div className="flex items-start gap-2.5">
                            <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-sky-500 to-indigo-600 text-white flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">
                              {student.name?.charAt(0).toUpperCase()}
                            </div>
                            <div className="min-w-0">
                              <div className="flex items-center gap-1.5 flex-wrap">
                                <span className="font-extrabold text-slate-900 dark:text-white text-xs">
                                  {student.name}
                                </span>
                                {student.parentName && (
                                  <span className="text-[11px] text-slate-400">
                                    • {student.parentName}
                                  </span>
                                )}
                              </div>
                              <div className="flex items-center gap-1.5 flex-wrap mt-0.5 font-mono text-[10px]">
                                <span className="text-sky-600 dark:text-sky-400 font-bold bg-sky-50 dark:bg-sky-950/60 px-1.5 py-0.2 rounded border border-sky-200 dark:border-sky-800">
                                  Roll No: {student.rollNo || '001'}
                                </span>
                                <span className="text-slate-400">
                                  Ad No: {student.admissionNo || 'ED-2026'}
                                </span>
                              </div>
                              <div className="text-[10px] text-slate-400 mt-0.5">
                                {student.className || 'Nursery'} {student.section ? `• Section ${student.section}` : ''}
                              </div>
                            </div>
                          </div>
                        </td>

                        {/* STATUS Segmented Buttons */}
                        <td className="py-3 px-4">
                          <div className="inline-flex rounded-xl p-1 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 gap-1">
                            {/* Present */}
                            <button
                              type="button"
                              onClick={() => handleMarkStatus(student.id, 'present')}
                              className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1 ${
                                status === 'present'
                                  ? 'bg-emerald-600 text-white shadow-xs'
                                  : 'text-slate-600 dark:text-slate-300 hover:text-emerald-600'
                              }`}
                            >
                              <CheckCircle2 className="w-3 h-3" />
                              <span>Present</span>
                            </button>

                            {/* Absent */}
                            <button
                              type="button"
                              onClick={() => handleMarkStatus(student.id, 'absent')}
                              className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1 ${
                                status === 'absent'
                                  ? 'bg-rose-600 text-white shadow-xs'
                                  : 'text-slate-600 dark:text-slate-300 hover:text-rose-600'
                              }`}
                            >
                              <XCircle className="w-3 h-3" />
                              <span>Absent</span>
                            </button>

                            {/* Late */}
                            <button
                              type="button"
                              onClick={() => handleMarkStatus(student.id, 'late')}
                              className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1 ${
                                status === 'late'
                                  ? 'bg-amber-500 text-white shadow-xs'
                                  : 'text-slate-600 dark:text-slate-300 hover:text-amber-500'
                              }`}
                            >
                              <Clock className="w-3 h-3" />
                              <span>Late</span>
                            </button>

                            {/* Leave */}
                            <button
                              type="button"
                              onClick={() => handleMarkStatus(student.id, 'leave')}
                              className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1 ${
                                status === 'leave'
                                  ? 'bg-sky-600 text-white shadow-xs'
                                  : 'text-slate-600 dark:text-slate-300 hover:text-sky-600'
                              }`}
                            >
                              <FileText className="w-3 h-3" />
                              <span>Leave</span>
                            </button>
                          </div>
                        </td>

                        {/* COMMENT */}
                        <td className="py-3 px-4">
                          <input
                            type="text"
                            value={comment}
                            onChange={(e) => handleCommentChange(student.id, e.target.value)}
                            placeholder="Add comment (e.g., Medical Leave, Came late)..."
                            className="w-full text-xs px-2.5 py-1.5 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 placeholder:text-slate-400 focus:outline-hidden focus:ring-1 focus:ring-sky-500"
                          />
                        </td>

                        {/* SMS */}
                        <td className="py-3 px-4 text-center">
                          <button
                            type="button"
                            onClick={() => setSmsModalStudent(student)}
                            className="text-xs font-semibold px-2.5 py-1 rounded-lg text-sky-600 dark:text-sky-400 border border-sky-300 dark:border-sky-800 hover:bg-sky-50 dark:hover:bg-sky-950/60 transition-colors flex items-center justify-center gap-1 mx-auto cursor-pointer"
                          >
                            <Send className="w-3 h-3" />
                            <span>Send SMS</span>
                          </button>
                        </td>
                      </tr>
                    )
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* ========================================================= */}
      {/* MODAL 1: SEND SMS TO PARENT */}
      {/* ========================================================= */}
      {smsModalStudent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl w-full max-w-md shadow-2xl overflow-hidden flex flex-col">
            <div className="px-5 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Send className="w-4 h-4 text-sky-600" />
                <h3 className="font-extrabold text-slate-900 dark:text-white text-sm">
                  Send Attendance SMS
                </h3>
              </div>
              <button
                onClick={() => setSmsModalStudent(null)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-5 space-y-3 text-xs">
              <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl space-y-1">
                <p className="text-slate-500">Student: <span className="font-bold text-slate-800 dark:text-white">{smsModalStudent.name}</span></p>
                <p className="text-slate-500">Parent: <span className="font-bold text-slate-800 dark:text-white">{smsModalStudent.parentName || 'Parent / Guardian'}</span></p>
                <p className="text-slate-500">Phone: <span className="font-bold text-emerald-600">{smsModalStudent.parentPhone || 'No contact registered'}</span></p>
                <p className="text-slate-500">Status Today: <span className="font-bold uppercase text-rose-600">{attendanceMap[smsModalStudent.id]?.status || 'Marked Today'}</span></p>
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-700 dark:text-slate-300 block">
                  SMS Message Body
                </label>
                <textarea
                  rows="4"
                  defaultValue={`Dear Parent, your child ${smsModalStudent.name} is marked ${attendanceMap[smsModalStudent.id]?.status || 'Absent'} today at Apex International School.`}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-sky-500"
                />
              </div>
            </div>

            <div className="p-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-end gap-2">
              <button
                onClick={() => setSmsModalStudent(null)}
                className="px-3.5 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-semibold text-xs cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  toast?.success?.(`SMS sent to ${smsModalStudent.parentPhone || 'parent'} successfully!`)
                  setSmsModalStudent(null)
                }}
                className="px-4 py-1.5 rounded-xl bg-sky-600 hover:bg-sky-700 text-white font-bold text-xs flex items-center gap-1.5 shadow-sm cursor-pointer"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Send SMS Notification</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* MODAL 2: PRINT BLANK ATTENDANCE SHEET */}
      {/* ========================================================= */}
      {isBlankSheetModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl w-full max-w-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
            <div className="px-5 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Printer className="w-4 h-4 text-sky-600" />
                <h3 className="font-extrabold text-slate-900 dark:text-white text-sm">
                  Blank Attendance Roll-Call Sheet
                </h3>
              </div>
              <button
                onClick={() => setIsBlankSheetModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-6 overflow-y-auto space-y-4 text-xs font-mono">
              <div className="text-center space-y-1 pb-3 border-b border-slate-200 dark:border-slate-800">
                <h2 className="text-base font-black">Apex International School</h2>
                <p className="text-slate-500 font-sans text-xs">Class: {selectedClass === 'all' ? 'All Classes' : selectedClass} • Date: {todayIso}</p>
              </div>

              <table className="w-full text-left border-collapse border border-slate-300 dark:border-slate-700">
                <thead>
                  <tr className="bg-slate-100 dark:bg-slate-800">
                    <th className="border border-slate-300 dark:border-slate-700 p-2 w-12 text-center">#</th>
                    <th className="border border-slate-300 dark:border-slate-700 p-2 w-24">Roll No</th>
                    <th className="border border-slate-300 dark:border-slate-700 p-2">Student Name</th>
                    <th className="border border-slate-300 dark:border-slate-700 p-2 w-24 text-center">P / A / L</th>
                    <th className="border border-slate-300 dark:border-slate-700 p-2 w-40">Signature</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredStudents.length === 0 ? (
                    <tr>
                      <td colSpan="5" className="p-4 text-center text-slate-400 font-sans">
                        No students enrolled in this sheet.
                      </td>
                    </tr>
                  ) : (
                    filteredStudents.map((s, i) => (
                      <tr key={s.id || i}>
                        <td className="border border-slate-300 dark:border-slate-700 p-2 text-center">{i + 1}</td>
                        <td className="border border-slate-300 dark:border-slate-700 p-2 font-bold">{s.rollNo}</td>
                        <td className="border border-slate-300 dark:border-slate-700 p-2">{s.name}</td>
                        <td className="border border-slate-300 dark:border-slate-700 p-2 text-center">[ &nbsp; ]</td>
                        <td className="border border-slate-300 dark:border-slate-700 p-2"></td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            <div className="p-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-end gap-2">
              <button
                onClick={() => setIsBlankSheetModalOpen(false)}
                className="px-3.5 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-semibold text-xs cursor-pointer"
              >
                Close
              </button>
              <button
                onClick={() => window.print()}
                className="px-4 py-1.5 rounded-xl bg-sky-600 hover:bg-sky-700 text-white font-bold text-xs flex items-center gap-1.5 shadow-sm cursor-pointer"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>Print Sheet</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* MODAL 3: MONTHLY SHEET */}
      {/* ========================================================= */}
      {isMonthlySheetModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl w-full max-w-xl shadow-2xl overflow-hidden flex flex-col">
            <div className="px-5 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-sky-600" />
                <h3 className="font-extrabold text-slate-900 dark:text-white text-sm">
                  Monthly Attendance Overview
                </h3>
              </div>
              <button
                onClick={() => setIsMonthlySheetModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-6 space-y-4 text-xs">
              <p className="text-slate-600 dark:text-slate-400">
                Monthly register for <strong>{selectedClass === 'all' ? 'All Classes' : selectedClass}</strong> for <strong>{new Date().toLocaleDateString('en-GB', { month: 'long', year: 'numeric' })}</strong>.
              </p>

              <div className="grid grid-cols-3 gap-3 text-center">
                <div className="p-3 bg-emerald-50 dark:bg-emerald-950/40 rounded-xl border border-emerald-200 dark:border-emerald-800">
                  <span className="text-[10px] font-extrabold uppercase text-emerald-700 block">Class Present Rate</span>
                  <span className="text-xl font-black text-emerald-700 mt-0.5 block">
                    {filteredStudents.length > 0 ? `${Math.round((presentCount / filteredStudents.length) * 100)}%` : '0%'}
                  </span>
                </div>
                <div className="p-3 bg-rose-50 dark:bg-rose-950/40 rounded-xl border border-rose-200 dark:border-rose-800">
                  <span className="text-[10px] font-extrabold uppercase text-rose-700 block">Class Absent</span>
                  <span className="text-xl font-black text-rose-700 mt-0.5 block">{absentCount}</span>
                </div>
                <div className="p-3 bg-amber-50 dark:bg-amber-950/40 rounded-xl border border-amber-200 dark:border-amber-800">
                  <span className="text-[10px] font-extrabold uppercase text-amber-700 block">Late Arrivals</span>
                  <span className="text-xl font-black text-amber-700 mt-0.5 block">{lateCount}</span>
                </div>
              </div>
            </div>

            <div className="p-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-end">
              <button
                onClick={() => setIsMonthlySheetModalOpen(false)}
                className="px-4 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold text-xs cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* MODAL 4: QR SCANNER SIMULATION */}
      {/* ========================================================= */}
      {activeTab === 'qr_scan' && isQrScannerActive && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl w-full max-w-md shadow-2xl overflow-hidden flex flex-col">
            <div className="px-5 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <QrCode className="w-4 h-4 text-sky-600" />
                <h3 className="font-extrabold text-slate-900 dark:text-white text-sm">
                  Student QR Code Attendance Scanner
                </h3>
              </div>
              <button
                onClick={() => {
                  setIsQrScannerActive(false)
                  setActiveTab('students')
                }}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-6 flex flex-col items-center text-center space-y-4 text-xs">
              <div className="w-48 h-48 rounded-2xl border-2 border-dashed border-sky-500 bg-sky-50/50 dark:bg-sky-950/30 flex flex-col items-center justify-center relative overflow-hidden">
                <Camera className="w-10 h-10 text-sky-500 animate-pulse" />
                <span className="text-[11px] font-bold text-sky-600 mt-2">Scanning Student QR Card...</span>
                <div className="absolute inset-x-0 h-0.5 bg-sky-500 top-1/2 shadow-lg animate-bounce" />
              </div>
              <p className="text-slate-500 dark:text-slate-400">
                Hold the student ID card QR code in front of the camera to automatically mark attendance.
              </p>

              {students.length > 0 && (
                <button
                  type="button"
                  onClick={() => {
                    const first = students[0]
                    handleMarkStatus(first.id, 'present')
                    toast?.success?.(`QR Code Verified: ${first.name} marked Present!`)
                    setIsQrScannerActive(false)
                    setActiveTab('students')
                  }}
                  className="px-4 py-2 rounded-xl bg-sky-600 hover:bg-sky-700 text-white font-bold text-xs shadow-sm cursor-pointer"
                >
                  Simulate QR Card Scan ({students[0].name})
                </button>
              )}
            </div>

            <div className="p-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-end">
              <button
                onClick={() => {
                  setIsQrScannerActive(false)
                  setActiveTab('students')
                }}
                className="px-4 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold text-xs cursor-pointer"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
