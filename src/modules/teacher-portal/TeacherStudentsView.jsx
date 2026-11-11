import React, { useState, useMemo, useEffect } from 'react'
import {
  Users,
  Calendar,
  AlertTriangle,
  Bus,
  Search,
  Filter,
  Eye,
  ChevronDown,
  Plus,
  ArrowLeft,
  GraduationCap,
  UserCheck,
  UserX,
  Phone,
  Mail,
  MapPin,
  IdCard,
  Printer,
  X,
  Send,
  Download,
  RotateCcw,
  Sparkles,
  BookOpen,
  CheckCircle2,
  Clock,
  BookMarked,
  Megaphone,
  CheckSquare,
  FileEdit,
  Wallet,
  CalendarDays,
  ShieldCheck,
  Check
} from 'lucide-react'
import { useAppData } from '../../context/AppDataContext'
import { useToast } from '../../context/ToastContext'

export default function TeacherStudentsView({
  onBack,
  onOpenModal,
  teacherName = 'Teacher'
}) {
  const { students: appStudents = [], classes: appClasses = [] } = useAppData()
  const { toast } = useToast()

  // Persistent Local Roster for Teacher Portal
  // Defaults strictly to empty array (0 records) as required
  const [students, setStudents] = useState(() => {
    try {
      const saved = localStorage.getItem('teacher_portal_students')
      if (saved) {
        const parsed = JSON.parse(saved)
        if (Array.isArray(parsed)) return parsed
      }
    } catch {
      // Fallback
    }
    // If global app has students, user can see them, or start with 0
    return []
  })

  // Sync back to localStorage whenever modified
  useEffect(() => {
    try {
      localStorage.setItem('teacher_portal_students', JSON.stringify(students))
    } catch {
      // Ignore quota errors
    }
  }, [students])

  // Filters State
  const [dateFilter, setDateFilter] = useState('all') // 'all' | 'today' | 'this_month' | 'custom'
  const [selectedClass, setSelectedClass] = useState('all')
  const [searchTerm, setSearchTerm] = useState('')
  const [activeSearchQuery, setActiveSearchQuery] = useState('')
  const [quickStatus, setQuickStatus] = useState('all') // 'all' | 'active' | 'with_parent' | 'missing_parent'
  const [educationBoard, setEducationBoard] = useState('all')
  const [transportOnly, setTransportOnly] = useState(false)

  // Interactive Modals State
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const [viewStudentModal, setViewStudentModal] = useState(null)
  const [idCardModalStudent, setIdCardModalStudent] = useState(null)
  const [messageModalStudent, setMessageModalStudent] = useState(null)
  const [activeDropdownId, setActiveDropdownId] = useState(null)

  // Add Student Form State
  const [newStudent, setNewStudent] = useState({
    name: '',
    rollNo: '',
    classRoll: '',
    className: 'Nursery',
    admissionNo: '',
    admissionDate: new Date().toISOString().split('T')[0],
    parentName: '',
    studentPhone: '',
    parentPhone: '',
    house: '',
    educationBoard: 'Federal Board (FBISE)',
    onTransport: false,
    isActive: true,
    gender: 'Male',
    dob: '2020-01-15'
  })

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (!e.target.closest('.dropdown-container')) {
        setActiveDropdownId(null)
      }
    }
    document.addEventListener('click', handleClickOutside)
    return () => document.removeEventListener('click', handleClickOutside)
  }, [])

  // Filtered Students Calculation
  const filteredStudents = useMemo(() => {
    return students.filter((item) => {
      // Class Filter
      if (selectedClass !== 'all' && item.className !== selectedClass) {
        return false
      }

      // Quick Status Filter
      if (quickStatus === 'active' && !item.isActive) return false
      if (quickStatus === 'with_parent' && (!item.parentName || item.parentName.trim() === '')) return false
      if (quickStatus === 'missing_parent' && item.parentName && item.parentName.trim() !== '') return false

      // Education Board Filter
      if (educationBoard !== 'all' && item.educationBoard !== educationBoard) {
        return false
      }

      // Transport Only
      if (transportOnly && !item.onTransport) return false

      // Date Filter
      if (dateFilter === 'today') {
        const todayStr = new Date().toISOString().split('T')[0]
        if (item.admissionDate !== todayStr) return false
      } else if (dateFilter === 'this_month') {
        const currentMonth = new Date().toISOString().slice(0, 7)
        if (!item.admissionDate?.startsWith(currentMonth)) return false
      }

      // Search Query
      if (activeSearchQuery.trim()) {
        const q = activeSearchQuery.toLowerCase()
        const matchName = item.name?.toLowerCase().includes(q)
        const matchRoll = item.rollNo?.toLowerCase().includes(q) || item.classRoll?.toLowerCase().includes(q)
        const matchAdm = item.admissionNo?.toLowerCase().includes(q)
        const matchParent = item.parentName?.toLowerCase().includes(q)
        if (!matchName && !matchRoll && !matchAdm && !matchParent) return false
      }

      return true
    })
  }, [students, selectedClass, quickStatus, educationBoard, transportOnly, dateFilter, activeSearchQuery])

  // Top Metric Cards (Calculated Dynamically from Roster)
  const activeStudentsCount = useMemo(() => {
    return filteredStudents.filter((s) => s.isActive !== false).length
  }, [filteredStudents])

  const admittedThisMonthCount = useMemo(() => {
    const currentMonth = new Date().toISOString().slice(0, 7)
    return students.filter((s) => s.admissionDate?.startsWith(currentMonth)).length
  }, [students])

  const enrolledTodayCount = useMemo(() => {
    const todayStr = new Date().toISOString().split('T')[0]
    return students.filter((s) => s.admissionDate === todayStr).length
  }, [students])

  const missingParentCount = useMemo(() => {
    return students.filter((s) => !s.parentName || s.parentName.trim() === '').length
  }, [students])

  const linkedToParentCount = useMemo(() => {
    return students.filter((s) => s.parentName && s.parentName.trim() !== '').length
  }, [students])

  const onTransportCount = useMemo(() => {
    return students.filter((s) => Boolean(s.onTransport)).length
  }, [students])

  // Reset all filters
  const handleResetFilters = () => {
    setDateFilter('all')
    setSelectedClass('all')
    setSearchTerm('')
    setActiveSearchQuery('')
    setQuickStatus('all')
    setEducationBoard('all')
    setTransportOnly(false)
  }

  // Handle Search Submission
  const handleSearchSubmit = (e) => {
    e.preventDefault()
    setActiveSearchQuery(searchTerm)
  }

  // Handle Adding New Student
  const handleCreateStudent = (e) => {
    e.preventDefault()
    if (!newStudent.name.trim()) {
      toast?.error?.('Please enter student name')
      return
    }

    const createdRecord = {
      id: `std-${Date.now()}`,
      name: newStudent.name.trim(),
      rollNo: newStudent.rollNo.trim() || `00${students.length + 1}`,
      classRoll: newStudent.classRoll.trim() ? `Class roll ${newStudent.classRoll.trim()}` : '',
      className: newStudent.className || 'Nursery',
      admissionNo: newStudent.admissionNo.trim() || `ED/N/${new Date().getFullYear()}/${Math.floor(10000 + Math.random() * 90000)}`,
      admissionDate: newStudent.admissionDate || new Date().toISOString().split('T')[0],
      parentName: newStudent.parentName.trim(), // Can be empty to test "Missing Parent"
      studentPhone: newStudent.studentPhone.trim() || '—',
      parentPhone: newStudent.parentPhone.trim() || '—',
      house: newStudent.house.trim() || '—',
      educationBoard: newStudent.educationBoard,
      onTransport: Boolean(newStudent.onTransport),
      isActive: true,
      gender: newStudent.gender,
      dob: newStudent.dob
    }

    setStudents((prev) => [createdRecord, ...prev])
    setIsAddModalOpen(false)
    toast?.success?.(`Student ${createdRecord.name} added successfully!`)

    // Reset Form
    setNewStudent({
      name: '',
      rollNo: '',
      classRoll: '',
      className: 'Nursery',
      admissionNo: '',
      admissionDate: new Date().toISOString().split('T')[0],
      parentName: '',
      studentPhone: '',
      parentPhone: '',
      house: '',
      educationBoard: 'Federal Board (FBISE)',
      onTransport: false,
      isActive: true,
      gender: 'Male',
      dob: '2020-01-15'
    })
  }

  // Optional: Seed Sample Roster (matching screenshot structure with placeholders)
  const handleSeedPlaceholders = () => {
    const placeholders = [
      {
        id: 'std-1',
        name: 'Student One',
        rollNo: '001',
        classRoll: '',
        className: 'Nursery',
        admissionNo: 'ED/N/2019/29538',
        admissionDate: '2019-01-01',
        parentName: 'Guardian Alpha',
        studentPhone: '03001008023',
        parentPhone: '03009084228',
        house: '042345',
        educationBoard: 'Federal Board (FBISE)',
        onTransport: true,
        isActive: true,
        gender: 'Male'
      },
      {
        id: 'std-2',
        name: 'Student Two',
        rollNo: '002',
        classRoll: '',
        className: 'Nursery',
        admissionNo: 'ED/2026/279',
        admissionDate: '2026-10-15',
        parentName: 'Guardian Beta',
        studentPhone: '—',
        parentPhone: '03421242905',
        house: '—',
        educationBoard: 'Federal Board (FBISE)',
        onTransport: false,
        isActive: true,
        gender: 'Female'
      },
      {
        id: 'std-3',
        name: 'Student Three',
        rollNo: 'REC-2026-001',
        classRoll: 'Class roll 003',
        className: 'Nursery',
        admissionNo: 'ED/2026/281',
        admissionDate: '2026-10-16',
        parentName: 'Guardian Gamma',
        studentPhone: '03000000000',
        parentPhone: '03078888888',
        house: '042345',
        educationBoard: 'Punjab Board (BISE)',
        onTransport: true,
        isActive: true,
        gender: 'Male'
      },
      {
        id: 'std-4',
        name: 'Student Four (Missing Parent)',
        rollNo: '004',
        classRoll: '',
        className: 'Nursery',
        admissionNo: 'ED/N/2015/54963',
        admissionDate: '2015-08-10',
        parentName: '', // Missing Parent triggers red highlight
        studentPhone: '+1 (404) 237-9511',
        parentPhone: '—',
        house: '—',
        educationBoard: 'Cambridge International',
        onTransport: false,
        isActive: true,
        gender: 'Female'
      },
      {
        id: 'std-5',
        name: 'Student Five',
        rollNo: '005',
        classRoll: '',
        className: 'Nursery',
        admissionNo: 'ED/2026/302',
        admissionDate: '2026-11-01',
        parentName: 'Guardian Epsilon',
        studentPhone: '03125556677',
        parentPhone: '03334445566',
        house: 'Block B-12',
        educationBoard: 'Federal Board (FBISE)',
        onTransport: false,
        isActive: true,
        gender: 'Male'
      }
    ]
    setStudents(placeholders)
    toast?.success?.('Loaded demo student placeholders successfully!')
  }

  // Clear Roster (Back to 0 records)
  const handleClearRoster = () => {
    if (window.confirm('Reset student records back to 0?')) {
      setStudents([])
      toast?.info?.('Student records reset to 0.')
    }
  }

  return (
    <div className="flex-1 flex flex-col min-h-0 bg-slate-50/70 dark:bg-slate-950">
      {/* ========================================================= */}
      {/* 1. SUB-HEADER BAR (Matching Reference Image) */}
      {/* ========================================================= */}
      <div className="bg-white dark:bg-slate-900 border-b border-slate-200/90 dark:border-slate-800 px-4 sm:px-6 py-2.5 flex flex-wrap items-center justify-between gap-3 shrink-0 shadow-2xs">
        <div className="flex flex-col">
          <div className="flex items-center gap-2 font-black text-sm text-slate-900 dark:text-white">
            <GraduationCap className="w-4 h-4 text-blue-600 dark:text-blue-400" />
            <span>Students</span>
          </div>
          <button
            onClick={onBack}
            className="text-xs font-semibold text-slate-500 hover:text-purple-600 dark:text-slate-400 dark:hover:text-purple-400 flex items-center gap-1 transition-colors mt-0.5 cursor-pointer text-left w-fit"
          >
            <span>+ Back</span>
          </button>
        </div>

        {/* Top Quick Links Bar from Screenshot */}
        <div className="hidden lg:flex items-center gap-4 text-xs font-semibold text-slate-600 dark:text-slate-300">
          <button
            onClick={() => onOpenModal && onOpenModal('assignments')}
            className="flex items-center gap-1.5 hover:text-purple-600 dark:hover:text-purple-400 transition-colors cursor-pointer"
          >
            <BookMarked className="w-3.5 h-3.5" />
            <span>Assignments</span>
          </button>
          <button
            onClick={() => onOpenModal && onOpenModal('announcements')}
            className="flex items-center gap-1.5 hover:text-purple-600 dark:hover:text-purple-400 transition-colors cursor-pointer"
          >
            <Megaphone className="w-3.5 h-3.5" />
            <span>Announcements</span>
          </button>
          <button
            onClick={() => onOpenModal && onOpenModal('mark-attendance')}
            className="flex items-center gap-1.5 hover:text-purple-600 dark:hover:text-purple-400 transition-colors cursor-pointer"
          >
            <CheckSquare className="w-3.5 h-3.5" />
            <span>Mark Attendance</span>
          </button>
          <button
            onClick={() => onOpenModal && onOpenModal('marks-entry')}
            className="flex items-center gap-1.5 hover:text-purple-600 dark:hover:text-purple-400 transition-colors cursor-pointer"
          >
            <FileEdit className="w-3.5 h-3.5" />
            <span>Marks Entry</span>
          </button>
          <button
            onClick={() => onOpenModal && onOpenModal('timetable')}
            className="flex items-center gap-1.5 hover:text-purple-600 dark:hover:text-purple-400 transition-colors cursor-pointer"
          >
            <Calendar className="w-3.5 h-3.5" />
            <span>Timetables & Exam Schedules</span>
          </button>
          <button
            onClick={() => onOpenModal && onOpenModal('salary')}
            className="flex items-center gap-1.5 hover:text-purple-600 dark:hover:text-purple-400 transition-colors cursor-pointer"
          >
            <Wallet className="w-3.5 h-3.5" />
            <span>My Salary</span>
          </button>
        </div>
      </div>

      {/* ========================================================= */}
      {/* 2. MAIN SCROLL CONTAINER */}
      {/* ========================================================= */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-7 space-y-5">
        {/* --------------------------------------------------------- */}
        {/* ROW 1: 4 KPI SUMMARY CARDS (Exact match to screenshot) */}
        {/* --------------------------------------------------------- */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Card 1: Active students */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-2xl p-4 sm:p-5 shadow-xs flex items-center gap-4 transition-all hover:shadow-md">
            <div className="w-12 h-12 rounded-xl bg-blue-600 flex items-center justify-center text-white shrink-0 shadow-sm shadow-blue-500/30">
              <Users className="w-6 h-6" />
            </div>
            <div className="min-w-0">
              <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                Active students
              </p>
              <h3 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight leading-tight">
                {activeStudentsCount}
              </h3>
              <p className="text-[11px] text-slate-400 dark:text-slate-500 truncate">
                Matching current filters
              </p>
            </div>
          </div>

          {/* Card 2: Admitted this month */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-2xl p-4 sm:p-5 shadow-xs flex items-center gap-4 transition-all hover:shadow-md">
            <div className="w-12 h-12 rounded-xl bg-emerald-600 flex items-center justify-center text-white shrink-0 shadow-sm shadow-emerald-500/30">
              <Calendar className="w-6 h-6" />
            </div>
            <div className="min-w-0">
              <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                Admitted this month
              </p>
              <h3 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight leading-tight">
                {admittedThisMonthCount}
              </h3>
              <p className="text-[11px] text-slate-400 dark:text-slate-500 truncate">
                {enrolledTodayCount} enrolled today
              </p>
            </div>
          </div>

          {/* Card 3: Missing parent */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-2xl p-4 sm:p-5 shadow-xs flex items-center gap-4 transition-all hover:shadow-md">
            <div className="w-12 h-12 rounded-xl bg-amber-500 flex items-center justify-center text-white shrink-0 shadow-sm shadow-amber-500/30">
              <UserX className="w-6 h-6" />
            </div>
            <div className="min-w-0">
              <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                Missing parent
              </p>
              <h3 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight leading-tight">
                {missingParentCount}
              </h3>
              <p className="text-[11px] text-slate-400 dark:text-slate-500 truncate">
                {linkedToParentCount} linked to a parent
              </p>
            </div>
          </div>

          {/* Card 4: On transport */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-2xl p-4 sm:p-5 shadow-xs flex items-center gap-4 transition-all hover:shadow-md">
            <div className="w-12 h-12 rounded-xl bg-teal-600 flex items-center justify-center text-white shrink-0 shadow-sm shadow-teal-500/30">
              <Bus className="w-6 h-6" />
            </div>
            <div className="min-w-0">
              <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                On transport
              </p>
              <h3 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight leading-tight">
                {onTransportCount}
              </h3>
              <p className="text-[11px] text-slate-400 dark:text-slate-500 truncate">
                Active transport profile
              </p>
            </div>
          </div>
        </div>

        {/* --------------------------------------------------------- */}
        {/* ROW 2: DATE FILTER PILLS & ADMISSION DATE INDICATOR */}
        {/* --------------------------------------------------------- */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
          {/* Left: Filter Pills */}
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => setDateFilter('all')}
              className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer ${
                dateFilter === 'all'
                  ? 'bg-teal-700 text-white shadow-xs'
                  : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              All
            </button>
            <button
              onClick={() => setDateFilter('today')}
              className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer ${
                dateFilter === 'today'
                  ? 'bg-teal-700 text-white shadow-xs'
                  : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              Today
            </button>
            <button
              onClick={() => setDateFilter('this_month')}
              className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer ${
                dateFilter === 'this_month'
                  ? 'bg-teal-700 text-white shadow-xs'
                  : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              This Month
            </button>
            <button
              onClick={() => setDateFilter('custom')}
              className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer ${
                dateFilter === 'custom'
                  ? 'bg-teal-700 text-white shadow-xs'
                  : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              Custom Range
            </button>
          </div>

          {/* Right: Admission Date Label from screenshot */}
          <div className="flex items-center gap-1.5 text-xs">
            <Calendar className="w-3.5 h-3.5 text-teal-700 dark:text-teal-400" />
            <span className="font-extrabold text-teal-800 dark:text-teal-400 tracking-wide uppercase">
              ADMISSION DATE
            </span>
            <span className="text-slate-500 dark:text-slate-400">Active students only</span>
          </div>
        </div>

        {/* --------------------------------------------------------- */}
        {/* ROW 3: ADVANCED FILTER TOOLBAR */}
        {/* --------------------------------------------------------- */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-2xl p-4 sm:p-5 shadow-xs space-y-4">
          <form onSubmit={handleSearchSubmit} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-3 items-end">
            {/* CLASS Selector (3 cols) */}
            <div className="lg:col-span-3 space-y-1">
              <label className="text-[11px] font-extrabold text-slate-500 dark:text-slate-400 uppercase tracking-wider block">
                CLASS
              </label>
              <select
                value={selectedClass}
                onChange={(e) => setSelectedClass(e.target.value)}
                className="w-full text-xs font-semibold px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 focus:outline-hidden focus:ring-2 focus:ring-teal-500 cursor-pointer"
              >
                <option value="all">All classes</option>
                <option value="Nursery">Nursery</option>
                <option value="Prep">Prep</option>
                <option value="Class 1">Class 1</option>
                <option value="Class 2">Class 2</option>
                <option value="Class 3">Class 3</option>
                <option value="Class 4">Class 4</option>
                <option value="Class 5">Class 5</option>
                <option value="Class 6">Class 6</option>
                <option value="Class 7">Class 7</option>
                <option value="Class 8">Class 8</option>
                <option value="Class 9">Class 9</option>
                <option value="Class 10">Class 10</option>
              </select>
            </div>

            {/* SEARCH Box (4 cols) */}
            <div className="lg:col-span-4 space-y-1">
              <label className="text-[11px] font-extrabold text-slate-500 dark:text-slate-400 uppercase tracking-wider block">
                SEARCH
              </label>
              <div className="flex rounded-xl overflow-hidden border border-slate-200 dark:border-slate-700 focus-within:ring-2 focus-within:ring-teal-500">
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Name, roll, admission or registration no"
                  className="flex-1 text-xs px-3 py-2 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-200 placeholder:text-slate-400 focus:outline-hidden"
                />
                <button
                  type="submit"
                  title="Search records"
                  className="bg-teal-700 hover:bg-teal-800 text-white px-3 flex items-center justify-center transition-colors cursor-pointer"
                >
                  <Search className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* QUICK STATUS (2 cols) */}
            <div className="lg:col-span-2 space-y-1">
              <label className="text-[11px] font-extrabold text-slate-500 dark:text-slate-400 uppercase tracking-wider block">
                QUICK STATUS
              </label>
              <select
                value={quickStatus}
                onChange={(e) => setQuickStatus(e.target.value)}
                className="w-full text-xs font-semibold px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 focus:outline-hidden focus:ring-2 focus:ring-teal-500 cursor-pointer"
              >
                <option value="all">All on page</option>
                <option value="active">Active Only</option>
                <option value="with_parent">With Parent</option>
                <option value="missing_parent">Missing Parent</option>
              </select>
            </div>

            {/* EDUCATION BOARD (2 cols) */}
            <div className="lg:col-span-2 space-y-1">
              <label className="text-[11px] font-extrabold text-slate-500 dark:text-slate-400 uppercase tracking-wider block">
                EDUCATION BOARD
              </label>
              <select
                value={educationBoard}
                onChange={(e) => setEducationBoard(e.target.value)}
                className="w-full text-xs font-semibold px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 focus:outline-hidden focus:ring-2 focus:ring-teal-500 cursor-pointer"
              >
                <option value="all">All Boards</option>
                <option value="Federal Board (FBISE)">Federal Board (FBISE)</option>
                <option value="Punjab Board (BISE)">Punjab Board (BISE)</option>
                <option value="Cambridge International">Cambridge (CIE)</option>
                <option value="Sindh Board (BIEK)">Sindh Board (BIEK)</option>
              </select>
            </div>

            {/* Transport Only & Apply (1 col / flex) */}
            <div className="lg:col-span-1 flex items-center justify-end gap-2 pt-2 sm:pt-0">
              <button
                type="submit"
                className="w-full bg-teal-700 hover:bg-teal-800 text-white text-xs font-bold px-3.5 py-2 rounded-xl flex items-center justify-center gap-1.5 transition-colors shadow-sm cursor-pointer"
              >
                <Filter className="w-3.5 h-3.5" />
                <span>Apply</span>
              </button>
            </div>
          </form>

          {/* Sub-row: Transport toggle & Clear Filter */}
          <div className="flex flex-wrap items-center justify-between gap-3 pt-1 border-t border-slate-100 dark:border-slate-800 text-xs">
            <label className="flex items-center gap-2 text-slate-600 dark:text-slate-300 font-semibold cursor-pointer select-none">
              <input
                type="checkbox"
                checked={transportOnly}
                onChange={(e) => setTransportOnly(e.target.checked)}
                className="w-4 h-4 rounded text-teal-600 focus:ring-teal-500 border-slate-300 dark:border-slate-700"
              />
              <Bus className="w-3.5 h-3.5 text-teal-600 dark:text-teal-400" />
              <span>Transport only</span>
            </label>

            <div className="flex items-center gap-3">
              {(activeSearchQuery || selectedClass !== 'all' || quickStatus !== 'all' || educationBoard !== 'all' || transportOnly || dateFilter !== 'all') && (
                <button
                  type="button"
                  onClick={handleResetFilters}
                  className="text-xs font-bold text-teal-700 hover:text-teal-800 dark:text-teal-400 dark:hover:text-teal-300 flex items-center gap-1 cursor-pointer"
                >
                  <RotateCcw className="w-3 h-3" />
                  <span>Clear Filters</span>
                </button>
              )}
            </div>
          </div>
        </div>

        {/* --------------------------------------------------------- */}
        {/* ROW 4: STUDENT RECORDS TABLE */}
        {/* --------------------------------------------------------- */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-2xl shadow-xs overflow-hidden">
          {/* Table Header Section */}
          <div className="px-5 py-4 border-b border-slate-100 dark:border-slate-800 flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-teal-100 dark:bg-teal-950/60 text-teal-700 dark:text-teal-300 flex items-center justify-center">
                <Users className="w-4 h-4" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-base font-extrabold text-slate-900 dark:text-white">
                    Student records
                  </h3>
                  <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-teal-50 dark:bg-teal-950/60 text-teal-700 dark:text-teal-300 border border-teal-200 dark:border-teal-800">
                    {filteredStudents.length} students
                  </span>
                </div>
                <p className="text-[11px] text-slate-400 dark:text-slate-500">
                  All classes · Active only
                </p>
              </div>
            </div>

            {/* Header Right Actions */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => setIsAddModalOpen(true)}
                className="bg-teal-700 hover:bg-teal-800 text-white text-xs font-bold px-3.5 py-2 rounded-xl flex items-center gap-1.5 transition-colors shadow-sm cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Student</span>
              </button>

              {students.length === 0 && (
                <button
                  onClick={handleSeedPlaceholders}
                  className="bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-semibold px-3 py-2 rounded-xl flex items-center gap-1.5 transition-colors cursor-pointer"
                  title="Seed demo students with placeholder names"
                >
                  <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                  <span>Load Demo Roster</span>
                </button>
              )}

              {students.length > 0 && (
                <button
                  onClick={handleClearRoster}
                  className="text-xs font-semibold text-rose-500 hover:text-rose-700 hover:bg-rose-50 dark:hover:bg-rose-950/50 px-2.5 py-1.5 rounded-lg transition-colors cursor-pointer"
                  title="Clear all local student records back to 0"
                >
                  Clear Roster
                </button>
              )}
            </div>
          </div>

          {/* Table Responsive Container */}
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-50/80 dark:bg-slate-800/60 border-b border-slate-200/80 dark:border-slate-800 text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                  <th className="py-3 px-4 w-12 text-center">S/N</th>
                  <th className="py-3 px-4 w-14 text-center">Photo</th>
                  <th className="py-3 px-4 w-32">Roll</th>
                  <th className="py-3 px-4">Student & Parent</th>
                  <th className="py-3 px-4 w-28">Class</th>
                  <th className="py-3 px-4 w-60">Contact</th>
                  <th className="py-3 px-4 w-32 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {/* --------------------------------------------------- */}
                {/* ZERO STATE (Default when no records exist) */}
                {/* --------------------------------------------------- */}
                {filteredStudents.length === 0 ? (
                  <tr>
                    <td colSpan="7" className="py-16 text-center">
                      <div className="flex flex-col items-center justify-center max-w-sm mx-auto text-center space-y-3">
                        <div className="w-16 h-16 rounded-2xl bg-teal-50 dark:bg-teal-950/50 flex items-center justify-center text-teal-600 dark:text-teal-400 shadow-inner">
                          <Users className="w-8 h-8" />
                        </div>
                        <div>
                          <h4 className="text-base font-extrabold text-slate-900 dark:text-white">
                            No student records found
                          </h4>
                          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
                            There are currently 0 students matching your filters or assigned to your classes. You can add a student or reset filters.
                          </p>
                        </div>
                        <div className="flex items-center gap-2 pt-1">
                          <button
                            onClick={() => setIsAddModalOpen(true)}
                            className="bg-teal-700 hover:bg-teal-800 text-white text-xs font-bold px-4 py-2 rounded-xl flex items-center gap-1.5 transition-colors shadow-sm cursor-pointer"
                          >
                            <Plus className="w-3.5 h-3.5" />
                            <span>Add First Student</span>
                          </button>
                          <button
                            onClick={handleResetFilters}
                            className="bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-300 text-xs font-semibold px-3 py-2 rounded-xl transition-colors cursor-pointer"
                          >
                            Reset Filters
                          </button>
                        </div>
                      </div>
                    </td>
                  </tr>
                ) : (
                  /* --------------------------------------------------- */
                  /* POPULATED STUDENT ROWS */
                  /* --------------------------------------------------- */
                  filteredStudents.map((student, idx) => {
                    const isMissingParent = !student.parentName || student.parentName.trim() === ''
                    return (
                      <tr
                        key={student.id || idx}
                        className={`transition-colors ${
                          isMissingParent
                            ? 'bg-rose-50/70 dark:bg-rose-950/20 hover:bg-rose-100/70 dark:hover:bg-rose-900/30'
                            : 'hover:bg-slate-50/80 dark:hover:bg-slate-800/40'
                        }`}
                      >
                        {/* 1. S/N */}
                        <td className="py-3 px-4 text-center font-bold text-slate-500 dark:text-slate-400">
                          {idx + 1}
                        </td>

                        {/* 2. Photo */}
                        <td className="py-3 px-4 text-center">
                          <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-600 text-white flex items-center justify-center font-bold text-xs mx-auto shadow-2xs">
                            {student.name ? student.name.charAt(0).toUpperCase() : 'S'}
                          </div>
                        </td>

                        {/* 3. Roll */}
                        <td className="py-3 px-4">
                          <span className="inline-block bg-sky-500 dark:bg-sky-600 text-white font-mono text-[11px] font-bold px-2 py-0.5 rounded shadow-2xs">
                            {student.rollNo || '001'}
                          </span>
                          {student.classRoll && (
                            <span className="block text-[10px] text-slate-400 dark:text-slate-500 mt-0.5 font-medium">
                              {student.classRoll}
                            </span>
                          )}
                        </td>

                        {/* 4. Student & Parent */}
                        <td className="py-3 px-4">
                          <div className="font-extrabold text-slate-900 dark:text-white text-xs">
                            {student.name}
                          </div>
                          {isMissingParent ? (
                            <div className="text-[11px] font-bold text-rose-600 dark:text-rose-400 flex items-center gap-1 mt-0.5">
                              <AlertTriangle className="w-3 h-3 text-rose-500 shrink-0" />
                              <span>Missing Parent</span>
                            </div>
                          ) : (
                            <div className="text-[11px] text-slate-500 dark:text-slate-400 flex items-center gap-1 mt-0.5">
                              <UserCheck className="w-3 h-3 text-slate-400 shrink-0" />
                              <span>{student.parentName}</span>
                            </div>
                          )}
                          <div className="text-[10px] text-slate-400 dark:text-slate-500 font-mono mt-0.5">
                            Adm {student.admissionNo || 'ED/N/2026/001'} · {student.admissionDate || '01 Jan 2026'}
                          </div>
                        </td>

                        {/* 5. Class */}
                        <td className="py-3 px-4 font-semibold text-slate-800 dark:text-slate-200">
                          {student.className || 'Nursery'}
                        </td>

                        {/* 6. Contact */}
                        <td className="py-3 px-4 space-y-0.5">
                          {student.studentPhone && student.studentPhone !== '—' && (
                            <div className="text-[11px] font-medium text-teal-700 dark:text-teal-400 flex items-center gap-1">
                              <span className="text-slate-400 text-[10px]">Student:</span>
                              <span>{student.studentPhone}</span>
                            </div>
                          )}
                          {student.parentPhone && student.parentPhone !== '—' && (
                            <div className="text-[11px] font-medium text-emerald-700 dark:text-emerald-400 flex items-center gap-1">
                              <span className="text-slate-400 text-[10px]">Parent:</span>
                              <span>{student.parentPhone}</span>
                            </div>
                          )}
                          {student.house && student.house !== '—' && (
                            <div className="text-[10px] text-slate-500 dark:text-slate-400 flex items-center gap-1">
                              <span className="text-slate-400 text-[10px]">House:</span>
                              <span>{student.house}</span>
                            </div>
                          )}
                        </td>

                        {/* 7. Actions */}
                        <td className="py-3 px-4 text-right">
                          <div className="inline-flex items-center gap-1.5 relative dropdown-container">
                            <button
                              onClick={() => setViewStudentModal(student)}
                              className="text-xs font-semibold px-2.5 py-1 rounded-md text-emerald-700 dark:text-emerald-300 border border-emerald-500/40 hover:bg-emerald-50 dark:hover:bg-emerald-950/50 transition-colors cursor-pointer"
                            >
                              View
                            </button>

                            <button
                              onClick={() =>
                                setActiveDropdownId(
                                  activeDropdownId === student.id ? null : student.id
                                )
                              }
                              className="text-xs font-semibold px-2 py-1 rounded-md text-slate-600 dark:text-slate-300 border border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors flex items-center gap-1 cursor-pointer"
                            >
                              <span>More</span>
                              <ChevronDown className="w-3 h-3" />
                            </button>

                            {/* Dropdown Menu */}
                            {activeDropdownId === student.id && (
                              <div className="absolute right-0 top-full mt-1 w-44 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-lg py-1.5 z-20 text-left">
                                <button
                                  onClick={() => {
                                    setViewStudentModal(student)
                                    setActiveDropdownId(null)
                                  }}
                                  className="w-full text-left px-3 py-1.5 text-xs text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center gap-2"
                                >
                                  <Eye className="w-3.5 h-3.5 text-slate-400" />
                                  <span>View Profile</span>
                                </button>
                                <button
                                  onClick={() => {
                                    setIdCardModalStudent(student)
                                    setActiveDropdownId(null)
                                  }}
                                  className="w-full text-left px-3 py-1.5 text-xs text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center gap-2"
                                >
                                  <IdCard className="w-3.5 h-3.5 text-blue-500" />
                                  <span>Print ID Card</span>
                                </button>
                                <button
                                  onClick={() => {
                                    setMessageModalStudent(student)
                                    setActiveDropdownId(null)
                                  }}
                                  className="w-full text-left px-3 py-1.5 text-xs text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center gap-2"
                                >
                                  <Send className="w-3.5 h-3.5 text-emerald-500" />
                                  <span>Message Parent</span>
                                </button>
                              </div>
                            )}
                          </div>
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
      {/* MODAL 1: ADD NEW STUDENT */}
      {/* ========================================================= */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl w-full max-w-lg shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
            <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-teal-100 dark:bg-teal-950/60 text-teal-700 dark:text-teal-300 flex items-center justify-center">
                  <Plus className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-extrabold text-slate-900 dark:text-white text-base">
                    Enroll New Student
                  </h3>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">
                    Add a student to your class roster
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="w-8 h-8 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center justify-center cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateStudent} className="p-6 overflow-y-auto space-y-4 flex-1 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="font-bold text-slate-700 dark:text-slate-300 block">
                    Student Full Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={newStudent.name}
                    onChange={(e) => setNewStudent({ ...newStudent, name: e.target.value })}
                    placeholder="e.g. John Doe"
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-teal-500"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-slate-700 dark:text-slate-300 block">
                    Roll No *
                  </label>
                  <input
                    type="text"
                    required
                    value={newStudent.rollNo}
                    onChange={(e) => setNewStudent({ ...newStudent, rollNo: e.target.value })}
                    placeholder="e.g. 001"
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-teal-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="font-bold text-slate-700 dark:text-slate-300 block">
                    Class *
                  </label>
                  <select
                    value={newStudent.className}
                    onChange={(e) => setNewStudent({ ...newStudent, className: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-teal-500"
                  >
                    <option value="Nursery">Nursery</option>
                    <option value="Prep">Prep</option>
                    <option value="Class 1">Class 1</option>
                    <option value="Class 2">Class 2</option>
                    <option value="Class 3">Class 3</option>
                    <option value="Class 4">Class 4</option>
                    <option value="Class 5">Class 5</option>
                    <option value="Class 6">Class 6</option>
                    <option value="Class 7">Class 7</option>
                    <option value="Class 8">Class 8</option>
                    <option value="Class 9">Class 9</option>
                    <option value="Class 10">Class 10</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-slate-700 dark:text-slate-300 block">
                    Admission Date
                  </label>
                  <input
                    type="date"
                    value={newStudent.admissionDate}
                    onChange={(e) => setNewStudent({ ...newStudent, admissionDate: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-teal-500"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-700 dark:text-slate-300 block flex items-center justify-between">
                  <span>Parent / Guardian Name</span>
                  <span className="text-[10px] text-slate-400 font-normal">Leave empty to test "Missing Parent" alert</span>
                </label>
                <input
                  type="text"
                  value={newStudent.parentName}
                  onChange={(e) => setNewStudent({ ...newStudent, parentName: e.target.value })}
                  placeholder="e.g. Robert Doe"
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-teal-500"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="font-bold text-slate-700 dark:text-slate-300 block">
                    Parent Contact Number
                  </label>
                  <input
                    type="text"
                    value={newStudent.parentPhone}
                    onChange={(e) => setNewStudent({ ...newStudent, parentPhone: e.target.value })}
                    placeholder="e.g. 03001234567"
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-teal-500"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-slate-700 dark:text-slate-300 block">
                    Student Phone / House
                  </label>
                  <input
                    type="text"
                    value={newStudent.house}
                    onChange={(e) => setNewStudent({ ...newStudent, house: e.target.value })}
                    placeholder="e.g. House #14, St 2"
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-teal-500"
                  />
                </div>
              </div>

              <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                <label className="flex items-center gap-2 cursor-pointer font-bold text-slate-700 dark:text-slate-300 select-none">
                  <input
                    type="checkbox"
                    checked={newStudent.onTransport}
                    onChange={(e) => setNewStudent({ ...newStudent, onTransport: e.target.checked })}
                    className="w-4 h-4 rounded text-teal-600 focus:ring-teal-500"
                  />
                  <Bus className="w-3.5 h-3.5 text-teal-600" />
                  <span>Assign School Transport</span>
                </label>
              </div>

              <div className="pt-4 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-semibold hover:bg-slate-200 transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-teal-700 hover:bg-teal-800 text-white font-bold transition-colors shadow-sm cursor-pointer"
                >
                  Enroll Student
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* MODAL 2: VIEW STUDENT DETAILS */}
      {/* ========================================================= */}
      {viewStudentModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl w-full max-w-lg shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
            <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <GraduationCap className="w-5 h-5 text-teal-600" />
                <h3 className="font-extrabold text-slate-900 dark:text-white text-base">
                  Student Profile
                </h3>
              </div>
              <button
                onClick={() => setViewStudentModal(null)}
                className="w-8 h-8 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center justify-center cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-6 overflow-y-auto space-y-4 text-xs">
              {/* Profile Card */}
              <div className="flex items-center gap-4 bg-slate-50 dark:bg-slate-800/50 p-4 rounded-2xl border border-slate-100 dark:border-slate-800">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-teal-500 to-indigo-600 text-white flex items-center justify-center font-black text-xl shadow-md">
                  {viewStudentModal.name?.charAt(0).toUpperCase()}
                </div>
                <div>
                  <h4 className="text-base font-extrabold text-slate-900 dark:text-white">
                    {viewStudentModal.name}
                  </h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                    Class: <span className="font-bold text-slate-800 dark:text-slate-200">{viewStudentModal.className}</span> · Roll: <span className="font-mono font-bold text-teal-600">{viewStudentModal.rollNo}</span>
                  </p>
                  <span className="inline-block mt-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300">
                    Active Student
                  </span>
                </div>
              </div>

              {/* Information Grid */}
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800">
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">Admission Number</span>
                  <span className="font-mono font-bold text-slate-800 dark:text-slate-200">{viewStudentModal.admissionNo || '—'}</span>
                </div>
                <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800">
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">Admission Date</span>
                  <span className="font-bold text-slate-800 dark:text-slate-200">{viewStudentModal.admissionDate || '—'}</span>
                </div>
                <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800">
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">Parent / Guardian</span>
                  <span className="font-bold text-slate-800 dark:text-slate-200">
                    {viewStudentModal.parentName || <span className="text-rose-500">Missing Parent</span>}
                  </span>
                </div>
                <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800">
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">Parent Contact</span>
                  <span className="font-bold text-emerald-600 dark:text-emerald-400">{viewStudentModal.parentPhone || '—'}</span>
                </div>
                <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800">
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">House / Address</span>
                  <span className="font-bold text-slate-800 dark:text-slate-200">{viewStudentModal.house || '—'}</span>
                </div>
                <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800">
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">School Transport</span>
                  <span className="font-bold text-teal-600 dark:text-teal-400">
                    {viewStudentModal.onTransport ? 'Assigned (Route A)' : 'Not Assigned'}
                  </span>
                </div>
              </div>
            </div>

            <div className="p-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
              <button
                onClick={() => {
                  setIdCardModalStudent(viewStudentModal)
                  setViewStudentModal(null)
                }}
                className="text-xs font-bold text-blue-600 dark:text-blue-400 flex items-center gap-1.5 cursor-pointer"
              >
                <IdCard className="w-3.5 h-3.5" />
                <span>Print Student ID Card</span>
              </button>
              <button
                onClick={() => setViewStudentModal(null)}
                className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold hover:bg-slate-200 transition-colors cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* MODAL 3: PRINTABLE STUDENT ID CARD */}
      {/* ========================================================= */}
      {idCardModalStudent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl w-full max-w-sm shadow-2xl overflow-hidden flex flex-col">
            <div className="px-5 py-3.5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
              <span className="font-bold text-xs text-slate-700 dark:text-slate-300">
                Student ID Card Preview
              </span>
              <button
                onClick={() => setIdCardModalStudent(null)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-6 flex flex-col items-center">
              {/* ID Card Visual */}
              <div className="w-full bg-gradient-to-b from-indigo-700 via-indigo-800 to-slate-900 text-white rounded-2xl p-5 shadow-xl relative overflow-hidden text-center space-y-3">
                <div className="text-[10px] font-black uppercase tracking-widest text-indigo-200">
                  Apex International School
                </div>
                <div className="w-16 h-16 rounded-full bg-white/20 border-2 border-white text-white flex items-center justify-center font-black text-2xl mx-auto shadow-md">
                  {idCardModalStudent.name?.charAt(0).toUpperCase()}
                </div>
                <div>
                  <h4 className="font-black text-base tracking-tight">{idCardModalStudent.name}</h4>
                  <p className="text-xs text-indigo-200">Class: {idCardModalStudent.className}</p>
                </div>
                <div className="pt-2 border-t border-white/20 grid grid-cols-2 text-left text-[10px]">
                  <div>
                    <span className="text-indigo-300 block">Roll No</span>
                    <span className="font-mono font-bold">{idCardModalStudent.rollNo}</span>
                  </div>
                  <div>
                    <span className="text-indigo-300 block">Adm No</span>
                    <span className="font-mono font-bold truncate">{idCardModalStudent.admissionNo || 'ED-2026'}</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="p-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-end gap-2">
              <button
                onClick={() => setIdCardModalStudent(null)}
                className="px-3.5 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-semibold text-xs cursor-pointer"
              >
                Close
              </button>
              <button
                onClick={() => {
                  window.print()
                }}
                className="px-4 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs flex items-center gap-1.5 shadow-sm cursor-pointer"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>Print Card</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* MODAL 4: SEND PARENT MESSAGE */}
      {/* ========================================================= */}
      {messageModalStudent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl w-full max-w-md shadow-2xl overflow-hidden flex flex-col">
            <div className="px-5 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Send className="w-4 h-4 text-emerald-600" />
                <h3 className="font-extrabold text-slate-900 dark:text-white text-sm">
                  Send Parent Notification
                </h3>
              </div>
              <button
                onClick={() => setMessageModalStudent(null)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-5 space-y-3 text-xs">
              <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl space-y-1">
                <p className="text-slate-500">Student: <span className="font-bold text-slate-800 dark:text-white">{messageModalStudent.name}</span></p>
                <p className="text-slate-500">Parent: <span className="font-bold text-slate-800 dark:text-white">{messageModalStudent.parentName || 'Parent / Guardian'}</span></p>
                <p className="text-slate-500">Phone: <span className="font-bold text-emerald-600">{messageModalStudent.parentPhone || 'No contact registered'}</span></p>
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-700 dark:text-slate-300 block">
                  Notification Message
                </label>
                <textarea
                  rows="4"
                  placeholder="Enter message for parent (e.g. attendance notice, homework alert, fee reminder)..."
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
                  defaultValue={`Dear Parent, this is an update regarding ${messageModalStudent.name}'s academic progress at Apex International School.`}
                />
              </div>
            </div>

            <div className="p-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-end gap-2">
              <button
                onClick={() => setMessageModalStudent(null)}
                className="px-3.5 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-semibold text-xs cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  toast?.success?.(`Notification sent to parent of ${messageModalStudent.name}!`)
                  setMessageModalStudent(null)
                }}
                className="px-4 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center gap-1.5 shadow-sm cursor-pointer"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Send SMS Alert</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
