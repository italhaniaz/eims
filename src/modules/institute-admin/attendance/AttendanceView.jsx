import React, { useState, useEffect, useMemo } from 'react'
import { 
  CalendarCheck, 
  Check, 
  X, 
  Clock, 
  Users, 
  Calendar, 
  Filter, 
  Star, 
  Sparkles,
  Search,
  MessageSquare,
  Printer,
  FileSpreadsheet,
  AlertTriangle,
  CheckCircle2,
  AlertCircle,
  TrendingDown,
  Layers,
  ArrowRight,
  School,
  UserCheck,
  Edit3,
  HelpCircle,
  FileText
} from 'lucide-react'
import { useAppData } from '../../../context/AppDataContext'
import { normalizeClassSections } from '../../../constants/academicLevels'
import {
  ATTENDANCE_STATUSES,
  getAttendanceRecord,
  saveAttendanceRecord,
  getMonthlyAttendanceMatrix,
  exportDailyAttendanceCSV,
  exportMonthlyAttendanceCSV
} from './attendanceService'
import AttendanceRemarksModal from './AttendanceRemarksModal'
import AbsenteeNotificationModal from './AbsenteeNotificationModal'
import AttendancePrintModal from './AttendancePrintModal'

export const AttendanceView = ({ currentInstitute, onRouteChange }) => {
  const { 
    students = [], 
    classes = [], 
    institutes = [], 
    activeProgramLevel = 'all',
    saveAttendance: saveAttendanceContext
  } = useAppData()

  // Filter students by institute
  const instStudents = useMemo(() => {
    return students.filter(s => {
      if (!s.instituteId) return true
      if (!currentInstitute?.id) return true
      if (s.instituteId === currentInstitute.id) return true
      if ((s.instituteId === 'inst-1' || s.instituteId === 'inst-default') &&
          (currentInstitute.id === 'inst-1' || currentInstitute.id === 'inst-default')) {
        return true
      }
      if ((institutes || []).length <= 1) return true
      return false
    })
  }, [students, currentInstitute?.id, institutes])

  // Filter classes by institute & active navbar level
  const instClasses = useMemo(() => {
    return classes.filter(c => {
      const matchInst = (!c.instituteId || !currentInstitute?.id || c.instituteId === currentInstitute.id ||
        ((c.instituteId === 'inst-1' || c.instituteId === 'inst-default') && (currentInstitute.id === 'inst-1' || currentInstitute.id === 'inst-default')) ||
        (institutes || []).length <= 1)
      if (!matchInst) return false

      if (activeProgramLevel && activeProgramLevel !== 'all') {
        const tier = (c.programLevel || '').toLowerCase().trim()
        if (tier && tier !== activeProgramLevel.toLowerCase().trim()) return false
      }
      return true
    })
  }, [classes, currentInstitute?.id, institutes, activeProgramLevel])

  // Academic Sessions
  const [sessionsList] = useState(() => {
    try {
      const stored = localStorage.getItem('sms_academic_sessions')
      if (stored) return JSON.parse(stored)
    } catch (e) {}
    return [{ id: 'sess-curr', name: '2026-2027', isCurrent: true }]
  })

  const currentSession = useMemo(() => {
    const cur = sessionsList.find(s => s.isCurrent)
    return cur ? cur.name : (sessionsList[0]?.name || '2026-2027')
  }, [sessionsList])

  // Active View Tab: 'daily' | 'monthly' | 'analytics'
  const [activeTab, setActiveTab] = useState('daily')

  // Selected Date (YYYY-MM-DD)
  const [date, setDate] = useState(() => new Date().toISOString().split('T')[0])
  // Selected Month (YYYY-MM)
  const [yearMonth, setYearMonth] = useState(() => {
    const now = new Date()
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`
  })

  // Selected Class & Section
  const [selectedClass, setSelectedClass] = useState('')
  const [selectedSection, setSelectedSection] = useState('all')

  // Auto-set first class when available
  useEffect(() => {
    if (instClasses.length > 0 && !selectedClass) {
      setSelectedClass(instClasses[0].name)
    }
  }, [instClasses, selectedClass])

  // Find sections of the selected class (Zero dummy fabrication)
  const currentClassObj = useMemo(() => {
    if (!selectedClass) return null
    return instClasses.find(c => c.name.toLowerCase().trim() === selectedClass.toLowerCase().trim()) || null
  }, [instClasses, selectedClass])

  const classSections = useMemo(() => {
    if (!currentClassObj) return []
    return normalizeClassSections(currentClassObj)
  }, [currentClassObj])

  // When class changes, reset section filter
  useEffect(() => {
    setSelectedSection('all')
  }, [selectedClass])

  // Search Query for Quick Filtering
  const [searchQuery, setSearchQuery] = useState('')

  // Roster students for active class & section
  const rosterStudents = useMemo(() => {
    if (!selectedClass) return []
    return instStudents.filter(std => {
      const classMatch = (std.className || '').toLowerCase().trim() === selectedClass.toLowerCase().trim()
      if (!classMatch) return false

      if (selectedSection !== 'all') {
        const secMatch = (std.section || '').toLowerCase().trim() === selectedSection.toLowerCase().trim()
        if (!secMatch) return false
      }
      return true
    })
  }, [instStudents, selectedClass, selectedSection])

  // Filtered roster by search
  const visibleStudents = useMemo(() => {
    if (!searchQuery.trim()) return rosterStudents
    const q = searchQuery.toLowerCase().trim()
    return rosterStudents.filter(s => 
      (s.name || '').toLowerCase().includes(q) ||
      (s.rollNumber || '').toLowerCase().includes(q) ||
      (s.guardianPhone || '').toLowerCase().includes(q)
    )
  }, [rosterStudents, searchQuery])

  // Attendance Records State: studentId -> { status, reason, remarks, arrivalTime }
  const [attendanceRecords, setAttendanceRecords] = useState({})
  const [recordMeta, setRecordMeta] = useState({ status: 'Draft', submittedAt: null, submittedBy: 'Teacher' })
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false)
  const [savedSuccessMsg, setSavedSuccessMsg] = useState(null)

  // Load existing attendance record when session, class, section, or date changes
  useEffect(() => {
    if (!selectedClass) {
      setAttendanceRecords({})
      return
    }

    const saved = getAttendanceRecord(currentSession, selectedClass, selectedSection, date)
    if (saved && saved.records && Object.keys(saved.records).length > 0) {
      // Reconstitute records
      const loaded = {}
      rosterStudents.forEach(s => {
        const item = saved.records[s.id]
        if (item) {
          loaded[s.id] = typeof item === 'string' ? { status: item } : item
        } else {
          loaded[s.id] = { status: 'present' }
        }
      })
      setAttendanceRecords(loaded)
      setRecordMeta({
        status: 'Submitted',
        submittedAt: saved.submittedAt,
        submittedBy: saved.submittedBy || 'Teacher'
      })
      setHasUnsavedChanges(false)
    } else {
      // Fresh Draft: default all roster students to 'present'
      const fresh = {}
      rosterStudents.forEach(s => {
        fresh[s.id] = { status: 'present' }
      })
      setAttendanceRecords(fresh)
      setRecordMeta({
        status: 'Draft',
        submittedAt: null,
        submittedBy: 'Teacher'
      })
      setHasUnsavedChanges(false)
    }
  }, [currentSession, selectedClass, selectedSection, date, rosterStudents.length])

  // Toggle student status
  const handleSetStatus = (studentId, statusKey) => {
    setAttendanceRecords(prev => {
      const current = prev[studentId] || {}
      return {
        ...prev,
        [studentId]: {
          ...current,
          status: statusKey
        }
      }
    })
    setHasUnsavedChanges(true)
  }

  // Bulk Marking
  const handleMarkAll = (statusKey) => {
    if (rosterStudents.length === 0) return
    const updated = { ...attendanceRecords }
    rosterStudents.forEach(s => {
      const cur = updated[s.id] || {}
      updated[s.id] = { ...cur, status: statusKey }
    })
    setAttendanceRecords(updated)
    setHasUnsavedChanges(true)
  }

  // Modals state
  const [remarksModalTarget, setRemarksModalTarget] = useState(null)
  const [isAbsenteeModalOpen, setIsAbsenteeModalOpen] = useState(false)
  const [isPrintModalOpen, setIsPrintModalOpen] = useState(false)

  // Open Remarks Modal
  const handleOpenRemarks = (student) => {
    setRemarksModalTarget(student)
  }

  // Save Remarks from Modal
  const handleSaveRemarks = (remarksPayload) => {
    if (!remarksModalTarget) return
    setAttendanceRecords(prev => {
      const cur = prev[remarksModalTarget.id] || { status: 'present' }
      return {
        ...prev,
        [remarksModalTarget.id]: {
          ...cur,
          reason: remarksPayload.reason,
          remarks: remarksPayload.remarks,
          arrivalTime: remarksPayload.arrivalTime
        }
      }
    })
    setHasUnsavedChanges(true)
    setRemarksModalTarget(null)
  }

  // Real-time status counters
  const counts = useMemo(() => {
    let p = 0, a = 0, l = 0, t = 0, hd = 0
    rosterStudents.forEach(s => {
      const rec = attendanceRecords[s.id]
      const st = typeof rec === 'string' ? rec : (rec?.status || 'present')
      if (st === 'present') p++
      else if (st === 'absent') a++
      else if (st === 'leave') l++
      else if (st === 'late') t++
      else if (st === 'half_day') hd++
    })
    return { present: p, absent: a, leave: l, late: t, halfDay: hd }
  }, [rosterStudents, attendanceRecords])

  // Save Attendance Record
  const handleSaveAttendance = () => {
    if (rosterStudents.length === 0) return

    const record = saveAttendanceRecord(
      currentSession,
      selectedClass,
      selectedSection,
      date,
      { records: attendanceRecords, counters: counts },
      'Administrator'
    )

    // Sync with AppDataContext handler
    if (saveAttendanceContext) {
      const legacyKey = `${currentSession}__${selectedClass}__${selectedSection}`
      saveAttendanceContext(date, legacyKey, record)
    }

    setRecordMeta({
      status: 'Submitted',
      submittedAt: record.submittedAt,
      submittedBy: record.submittedBy
    })
    setHasUnsavedChanges(false)
    setSavedSuccessMsg(`Attendance for ${selectedClass} (${selectedSection === 'all' ? 'All Sections' : selectedSection}) on ${date} saved successfully!`)
    setTimeout(() => setSavedSuccessMsg(null), 4000)
  }

  // Monthly Matrix Data Calculation
  const monthlyData = useMemo(() => {
    if (!selectedClass || rosterStudents.length === 0) return null
    return getMonthlyAttendanceMatrix(currentSession, selectedClass, selectedSection, yearMonth, rosterStudents)
  }, [currentSession, selectedClass, selectedSection, yearMonth, rosterStudents])

  // Defaulters List (<75%)
  const defaultersList = useMemo(() => {
    if (!monthlyData) return []
    return monthlyData.studentRows.filter(r => r.isDefaulter)
  }, [monthlyData])

  // Class overall attendance percentage for month
  const classMonthlyAverage = useMemo(() => {
    if (!monthlyData || monthlyData.studentRows.length === 0) return 0
    const total = monthlyData.studentRows.reduce((acc, row) => acc + row.attendancePercentage, 0)
    return Math.round(total / monthlyData.studentRows.length)
  }, [monthlyData])

  return (
    <div className="p-4 sm:p-6 md:p-8 space-y-6 max-w-7xl mx-auto">
      {/* Toast Alert Feedback */}
      {savedSuccessMsg && (
        <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 px-4 py-3 rounded-2xl flex items-center justify-between shadow-xs animate-in fade-in">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
            <span className="text-xs font-semibold">{savedSuccessMsg}</span>
          </div>
          <button onClick={() => setSavedSuccessMsg(null)} className="text-xs underline font-semibold">
            Dismiss
          </button>
        </div>
      )}

      {/* Top Banner & Main Controls */}
      <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-emerald-600 text-xs font-semibold uppercase tracking-wider">
            <CalendarCheck className="w-4 h-4" />
            <span>Attendance & Roll Call Register</span>
          </div>
          <h1 className="text-2xl font-bold text-slate-900 mt-1 tracking-tight">
            Daily Attendance Register
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Track student presence, tardiness, official leaves, monthly registers, and automated parent alerts.
          </p>
        </div>

        {/* Global Action Hub */}
        <div className="flex items-center gap-2.5 flex-wrap w-full md:w-auto">
          {/* Send Absentee Alerts Button */}
          <button
            type="button"
            disabled={rosterStudents.length === 0 || (counts.absent === 0 && counts.leave === 0 && counts.late === 0)}
            onClick={() => setIsAbsenteeModalOpen(true)}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-slate-100 hover:bg-slate-200 disabled:opacity-40 text-slate-700 font-bold rounded-xl text-xs transition-colors shadow-2xs"
            title="Send WhatsApp / SMS alerts to absent and leave students' parents"
          >
            <MessageSquare className="w-3.5 h-3.5 text-emerald-600" />
            <span>Parent Alerts ({counts.absent + counts.leave})</span>
          </button>

          {/* Print & Export Hub */}
          <button
            type="button"
            disabled={rosterStudents.length === 0}
            onClick={() => setIsPrintModalOpen(true)}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-white hover:bg-slate-50 border border-slate-200 disabled:opacity-40 text-slate-700 font-bold rounded-xl text-xs transition-colors shadow-2xs"
            title="Print daily roll call or monthly register sheet"
          >
            <Printer className="w-3.5 h-3.5 text-slate-600" />
            <span>Print & Export</span>
          </button>

          {/* Save Attendance Sheet Button */}
          <button
            type="button"
            disabled={rosterStudents.length === 0}
            onClick={handleSaveAttendance}
            className={`flex items-center gap-1.5 px-5 py-2 font-bold rounded-xl text-xs transition-all shadow-xs active:scale-95 ${
              hasUnsavedChanges 
                ? 'bg-emerald-600 hover:bg-emerald-700 text-white ring-2 ring-emerald-500/20' 
                : 'bg-emerald-600 hover:bg-emerald-700 text-white'
            }`}
          >
            <Check className="w-4 h-4" />
            <span>{hasUnsavedChanges ? 'Save Changes *' : 'Save Attendance Sheet'}</span>
          </button>
        </div>
      </div>

      {/* Navigation View Tabs */}
      <div className="flex items-center border-b border-slate-200 gap-2 text-xs font-bold text-slate-500">
        <button
          onClick={() => setActiveTab('daily')}
          className={`pb-3 px-3.5 border-b-2 transition-all flex items-center gap-1.5 ${
            activeTab === 'daily' ? 'border-emerald-600 text-emerald-800' : 'border-transparent hover:text-slate-900'
          }`}
        >
          <CalendarCheck className="w-4 h-4" />
          <span>Daily Roll Call Sheet</span>
        </button>

        <button
          onClick={() => setActiveTab('monthly')}
          className={`pb-3 px-3.5 border-b-2 transition-all flex items-center gap-1.5 ${
            activeTab === 'monthly' ? 'border-emerald-600 text-emerald-800' : 'border-transparent hover:text-slate-900'
          }`}
        >
          <Layers className="w-4 h-4" />
          <span>Monthly Attendance Matrix</span>
        </button>

        <button
          onClick={() => setActiveTab('analytics')}
          className={`pb-3 px-3.5 border-b-2 transition-all flex items-center gap-1.5 ${
            activeTab === 'analytics' ? 'border-emerald-600 text-emerald-800' : 'border-transparent hover:text-slate-900'
          }`}
        >
          <TrendingDown className="w-4 h-4" />
          <span>Short Attendance & Defaulters (&lt;75%)</span>
        </button>
      </div>

      {/* FILTER BAR: Date, Session, Class & Section */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2.5 flex-wrap">
          {/* Session Tag */}
          <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-1.5 font-mono">
            <span className="text-slate-400 font-bold uppercase text-[10px]">Session:</span>
            <span className="font-bold text-slate-800">{currentSession}</span>
          </div>

          {/* Date Picker (for daily tab) */}
          {activeTab === 'daily' && (
            <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-1.5">
              <Calendar className="w-3.5 h-3.5 text-slate-400" />
              <span className="text-slate-400 font-bold uppercase text-[10px]">Date:</span>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="font-bold text-slate-900 bg-transparent focus:outline-none cursor-pointer"
              />
            </div>
          )}

          {/* Month Picker (for monthly & analytics tab) */}
          {activeTab !== 'daily' && (
            <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-1.5">
              <Calendar className="w-3.5 h-3.5 text-slate-400" />
              <span className="text-slate-400 font-bold uppercase text-[10px]">Month:</span>
              <input
                type="month"
                value={yearMonth}
                onChange={(e) => setYearMonth(e.target.value)}
                className="font-bold text-slate-900 bg-transparent focus:outline-none cursor-pointer font-mono"
              />
            </div>
          )}

          {/* Class Dropdown (Zero dummy fallback) */}
          <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-1.5">
            <span className="text-slate-400 font-bold uppercase text-[10px]">Class:</span>
            <select
              value={selectedClass}
              onChange={(e) => setSelectedClass(e.target.value)}
              className="bg-transparent font-bold text-slate-900 focus:outline-none cursor-pointer"
            >
              {instClasses.length > 0 ? (
                instClasses.map(c => (
                  <option key={c.id} value={c.name}>{c.name}</option>
                ))
              ) : (
                <option value="">No Classes Configured</option>
              )}
            </select>
          </div>

          {/* Section Dropdown */}
          <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-1.5">
            <span className="text-slate-400 font-bold uppercase text-[10px]">Section:</span>
            <select
              disabled={!selectedClass || classSections.length === 0}
              value={selectedSection}
              onChange={(e) => setSelectedSection(e.target.value)}
              className="bg-transparent font-bold text-emerald-800 focus:outline-none cursor-pointer disabled:text-slate-400"
            >
              <option value="all">All Sections ({classSections.length})</option>
              {classSections.map((sec, idx) => (
                <option key={sec.id || idx} value={sec.name}>{sec.name}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Status Indicators & Search Bar */}
        <div className="flex items-center gap-3">
          {/* Search student */}
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2" />
            <input
              type="text"
              placeholder="Search roll or name..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-8 pr-3 py-1.5 rounded-xl border border-slate-200 bg-slate-50 text-xs font-semibold focus:outline-none focus:bg-white w-48"
            />
          </div>

          {/* Submission State Badge */}
          {activeTab === 'daily' && (
            <span className={`px-2.5 py-1 rounded-full text-[11px] font-bold border flex items-center gap-1.5 ${
              recordMeta.status === 'Submitted'
                ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                : 'bg-amber-50 text-amber-800 border-amber-200'
            }`}>
              <span className={`w-2 h-2 rounded-full ${recordMeta.status === 'Submitted' ? 'bg-emerald-500' : 'bg-amber-500'}`} />
              <span>{recordMeta.status === 'Submitted' ? 'Submitted' : 'Draft / Unsaved'}</span>
            </span>
          )}
        </div>
      </div>

      {/* EMPTY STATE 1: No Classes Exist */}
      {instClasses.length === 0 && (
        <div className="p-12 bg-white rounded-2xl border border-slate-200 text-center space-y-3">
          <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center mx-auto">
            <School className="w-6 h-6" />
          </div>
          <h3 className="text-base font-bold text-slate-900">Create a class first</h3>
          <p className="text-xs text-slate-500 max-w-md mx-auto">
            No academic classes exist in this campus. Add educational classes, sections, and curriculum subjects in Classes & Sections to take daily roll calls.
          </p>
          <div>
            <button
              type="button"
              onClick={() => onRouteChange?.('inst-classes')}
              className="inline-flex items-center gap-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-all shadow-sm"
            >
              <span>Go to Classes & Sections</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}

      {/* EMPTY STATE 2: Classes Exist but No Students Enrolled */}
      {instClasses.length > 0 && selectedClass && rosterStudents.length === 0 && (
        <div className="p-12 bg-white rounded-2xl border border-slate-200 text-center space-y-3">
          <div className="w-12 h-12 bg-slate-100 text-slate-400 rounded-2xl flex items-center justify-center mx-auto">
            <Users className="w-6 h-6" />
          </div>
          <h3 className="text-base font-bold text-slate-900">No Students Enrolled</h3>
          <p className="text-xs text-slate-500 max-w-md mx-auto">
            No students are currently admitted in <strong>{selectedClass}</strong> {selectedSection !== 'all' ? `(${selectedSection})` : ''}.
            Admit students manually or import via CSV to start tracking attendance.
          </p>
          <div>
            <button
              type="button"
              onClick={() => onRouteChange?.('inst-students')}
              className="inline-flex items-center gap-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-all shadow-sm"
            >
              <span>Admit Students Now</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}

      {/* ACTIVE CONTENT WHEN STUDENTS EXIST */}
      {instClasses.length > 0 && selectedClass && rosterStudents.length > 0 && (
        <>
          {/* TAB 1: DAILY ROLL CALL SHEET */}
          {activeTab === 'daily' && (
            <div className="space-y-4">
              {/* Daily Statistics Cards & Bulk Actions Bar */}
              <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
                {/* Counters Row */}
                <div className="flex items-center gap-2.5 flex-wrap">
                  <span className="px-3 py-1 bg-emerald-50 text-emerald-800 rounded-xl border border-emerald-200 font-bold">
                    Present: {counts.present}
                  </span>
                  <span className="px-3 py-1 bg-rose-50 text-rose-800 rounded-xl border border-rose-200 font-bold">
                    Absent: {counts.absent}
                  </span>
                  <span className="px-3 py-1 bg-amber-50 text-amber-800 rounded-xl border border-amber-200 font-bold">
                    Leave: {counts.leave}
                  </span>
                  <span className="px-3 py-1 bg-purple-50 text-purple-800 rounded-xl border border-purple-200 font-bold">
                    Late: {counts.late}
                  </span>
                  <span className="px-3 py-1 bg-sky-50 text-sky-800 rounded-xl border border-sky-200 font-bold">
                    Half Day: {counts.halfDay}
                  </span>
                  <span className="text-slate-400 font-mono text-[11px]">
                    Total: {rosterStudents.length} Students
                  </span>
                </div>

                {/* Bulk Marking Fast Actions */}
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => handleMarkAll('present')}
                    className="px-3 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 font-bold rounded-lg transition-colors border border-emerald-200 text-[11px]"
                    title="Mark all students in active section as present"
                  >
                    Mark All Present
                  </button>
                  <button
                    type="button"
                    onClick={() => handleMarkAll('absent')}
                    className="px-3 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-800 font-bold rounded-lg transition-colors border border-rose-200 text-[11px]"
                    title="Mark all students as absent"
                  >
                    Mark All Absent
                  </button>
                </div>
              </div>

              {/* Daily Attendance Table */}
              <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs min-w-[750px]">
                    <thead className="bg-slate-50 text-slate-700 uppercase font-bold border-b border-slate-200 text-[11px]">
                      <tr>
                        <th className="p-3 w-12 text-center">Sr</th>
                        <th className="p-3 w-28">Roll No</th>
                        <th className="p-3">Student & Contact</th>
                        <th className="p-3 w-36">Class & Section</th>
                        <th className="p-3 text-center w-80">Attendance Status</th>
                        <th className="p-3 w-48 text-right">Remarks & Notes</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {visibleStudents.map((std, idx) => {
                        const rec = attendanceRecords[std.id] || { status: 'present' }
                        const curStatus = typeof rec === 'string' ? rec : (rec.status || 'present')
                        const reason = rec.reason || ''
                        const remarks = rec.remarks || ''
                        const arrivalTime = rec.arrivalTime || ''
                        const isSuper = (std.section || '').toLowerCase().includes('super') || (std.section || '').toLowerCase().includes('star')

                        return (
                          <tr key={std.id} className="hover:bg-slate-50/60 transition-colors">
                            <td className="p-3 text-center font-mono text-slate-400 text-[11px]">
                              {idx + 1}
                            </td>

                            <td className="p-3 font-mono font-bold text-slate-800 text-xs">
                              {std.rollNumber}
                            </td>

                            <td className="p-3">
                              <strong className="block text-slate-900 font-bold text-xs truncate">
                                {std.name}
                              </strong>
                              <span className="text-[11px] text-slate-400 font-mono block">
                                {std.guardianPhone || std.phone || 'No Phone Registered'}
                              </span>
                            </td>

                            <td className="p-3 text-xs">
                              <span className="font-semibold text-slate-700 block">{std.className}</span>
                              <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold border mt-0.5 ${
                                isSuper 
                                  ? 'bg-amber-50 text-amber-800 border-amber-200' 
                                  : 'bg-slate-100 text-slate-700 border-slate-200'
                              }`}>
                                {isSuper && <Star className="w-2.5 h-2.5 text-amber-500 fill-amber-400" />}
                                <span>{std.section || 'Section A'}</span>
                              </span>
                            </td>

                            {/* Interactive Status Buttons Pill */}
                            <td className="p-3 text-center">
                              <div className="inline-flex rounded-xl border border-slate-200 p-0.5 bg-slate-50 shadow-2xs gap-0.5">
                                {Object.values(ATTENDANCE_STATUSES).map(cfg => {
                                  const isSelected = curStatus === cfg.id
                                  return (
                                    <button
                                      key={cfg.id}
                                      type="button"
                                      onClick={() => handleSetStatus(std.id, cfg.id)}
                                      className={`px-2.5 py-1 text-[11px] font-bold rounded-lg transition-all ${
                                        isSelected 
                                          ? cfg.btnActiveClass 
                                          : 'text-slate-600 hover:text-slate-900 hover:bg-white/80'
                                      }`}
                                    >
                                      {cfg.label}
                                    </button>
                                  )
                                })}
                              </div>
                            </td>

                            {/* Remarks & Notes Action */}
                            <td className="p-3 text-right">
                              <div className="flex items-center justify-end gap-1.5">
                                {(reason || remarks || (curStatus === 'late' && arrivalTime)) ? (
                                  <div 
                                    onClick={() => handleOpenRemarks(std)}
                                    className="cursor-pointer max-w-[160px] truncate text-left"
                                    title={`${reason} ${remarks ? `(${remarks})` : ''}`}
                                  >
                                    <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-slate-100 text-slate-700 border border-slate-200 block truncate">
                                      {curStatus === 'late' && arrivalTime ? `Late: ${arrivalTime}` : reason || remarks}
                                    </span>
                                  </div>
                                ) : (
                                  <button
                                    type="button"
                                    onClick={() => handleOpenRemarks(std)}
                                    className="p-1.5 text-slate-400 hover:text-emerald-700 hover:bg-slate-100 rounded-lg transition-colors"
                                    title="Add remarks / reason"
                                  >
                                    <Edit3 className="w-3.5 h-3.5" />
                                  </button>
                                )}
                              </div>
                            </td>
                          </tr>
                        )
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: MONTHLY ATTENDANCE MATRIX */}
          {activeTab === 'monthly' && monthlyData && (
            <div className="space-y-4">
              {/* Month Info Bar */}
              <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
                <div>
                  <span className="font-bold text-slate-800 uppercase text-[11px] block">
                    Monthly Register Matrix: {selectedClass} ({selectedSection === 'all' ? 'All Sections' : selectedSection})
                  </span>
                  <span className="text-[10px] text-slate-400">
                    Period: {yearMonth} • Total Working Days: {monthlyData.totalWorkingDays} • Class Average: {classMonthlyAverage}%
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => exportMonthlyAttendanceCSV(currentSession, selectedClass, selectedSection, yearMonth, monthlyData)}
                    className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-lg text-xs flex items-center gap-1.5 transition-colors"
                  >
                    <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Download Excel / CSV</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setIsPrintModalOpen(true)}
                    className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg text-xs flex items-center gap-1.5 transition-colors shadow-2xs"
                  >
                    <Printer className="w-3.5 h-3.5" />
                    <span>Print Sheet</span>
                  </button>
                </div>
              </div>

              {/* Matrix Grid */}
              <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs min-w-[900px] font-mono">
                    <thead className="bg-slate-50 text-slate-700 uppercase font-bold border-b border-slate-200 text-[10px]">
                      <tr>
                        <th className="p-2.5 w-16 border-r border-slate-200">Roll</th>
                        <th className="p-2.5 w-36 border-r border-slate-200 font-sans">Student Name</th>
                        {monthlyData.days.filter(d => !d.isSunday).map(d => (
                          <th key={d.dayNum} className="p-1 text-center border-r border-slate-200 min-w-[28px]">
                            <span className="block font-bold">{d.dayNum}</span>
                            <span className="text-[8px] font-normal text-slate-400 block">{d.dayName[0]}</span>
                          </th>
                        ))}
                        <th className="p-2 text-center border-r border-slate-200 w-10 text-emerald-700">P</th>
                        <th className="p-2 text-center border-r border-slate-200 w-10 text-rose-700">A</th>
                        <th className="p-2 text-center border-r border-slate-200 w-10 text-amber-700">L</th>
                        <th className="p-2 text-center border-r border-slate-200 w-10 text-purple-700">T</th>
                        <th className="p-2 text-center w-14 font-sans font-bold">Att %</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 text-[11px]">
                      {monthlyData.studentRows.map(row => (
                        <tr key={row.student.id} className="hover:bg-slate-50/60">
                          <td className="p-2 border-r border-slate-100 font-bold text-slate-700">
                            {row.student.rollNumber}
                          </td>
                          <td className="p-2 border-r border-slate-100 font-sans font-semibold text-slate-900 truncate max-w-[140px]">
                            {row.student.name}
                          </td>
                          {monthlyData.days.filter(d => !d.isSunday).map(d => {
                            const st = row.dailyStatus[d.dayNum]
                            const short = st ? st.short : '—'
                            const isP = short === 'P'
                            const isA = short === 'A'
                            const isL = short === 'L'
                            const isT = short === 'T'

                            return (
                              <td
                                key={d.dayNum}
                                className={`p-1 text-center border-r border-slate-100 font-bold ${
                                  isA ? 'bg-rose-50 text-rose-700' :
                                  isL ? 'bg-amber-50 text-amber-700' :
                                  isT ? 'bg-purple-50 text-purple-700' :
                                  isP ? 'text-slate-600' : 'text-slate-300'
                                }`}
                              >
                                {short}
                              </td>
                            )
                          })}
                          <td className="p-2 border-r border-slate-100 text-center font-bold text-emerald-700">
                            {row.presentCount}
                          </td>
                          <td className="p-2 border-r border-slate-100 text-center font-bold text-rose-700">
                            {row.absentCount}
                          </td>
                          <td className="p-2 border-r border-slate-100 text-center font-bold text-amber-700">
                            {row.leaveCount}
                          </td>
                          <td className="p-2 border-r border-slate-100 text-center font-bold text-purple-700">
                            {row.lateCount}
                          </td>
                          <td className="p-2 text-center font-sans font-bold">
                            <span className={`px-1.5 py-0.5 rounded text-[10px] ${
                              row.isDefaulter 
                                ? 'bg-rose-100 text-rose-800 border border-rose-200' 
                                : 'bg-slate-100 text-slate-800'
                            }`}>
                              {row.attendancePercentage}%
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: ATTENDANCE ANALYTICS & DEFAULTERS */}
          {activeTab === 'analytics' && (
            <div className="space-y-4">
              {/* Analytics KPI Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-2xs">
                  <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">
                    Class Attendance Rate
                  </span>
                  <div className="mt-1 flex items-baseline gap-2">
                    <span className="text-2xl font-bold text-slate-900">{classMonthlyAverage}%</span>
                    <span className="text-xs font-semibold text-emerald-600">Monthly Avg</span>
                  </div>
                </div>

                <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-2xs">
                  <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">
                    Total Enrolled Students
                  </span>
                  <div className="mt-1 flex items-baseline gap-2">
                    <span className="text-2xl font-bold text-slate-900">{rosterStudents.length}</span>
                    <span className="text-xs text-slate-400">In Section</span>
                  </div>
                </div>

                <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-2xs">
                  <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">
                    Low Attendance Defaulters
                  </span>
                  <div className="mt-1 flex items-baseline gap-2">
                    <span className="text-2xl font-bold text-rose-600">{defaultersList.length}</span>
                    <span className="text-xs text-rose-700 font-semibold">&lt; 75% Criteria</span>
                  </div>
                </div>

                <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-2xs">
                  <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">
                    Total Working Days
                  </span>
                  <div className="mt-1 flex items-baseline gap-2">
                    <span className="text-2xl font-bold text-slate-900">{monthlyData?.totalWorkingDays || 26}</span>
                    <span className="text-xs text-slate-400">Days Evaluated</span>
                  </div>
                </div>
              </div>

              {/* Defaulters Detailed Table */}
              <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
                <div className="p-4 border-b border-slate-100 flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
                      <AlertTriangle className="w-4 h-4 text-rose-600" />
                      <span>Exam Eligibility Defaulters (Attendance &lt; 75%)</span>
                    </h3>
                    <p className="text-xs text-slate-400">
                      Students highlighted below do not meet minimum board/exam attendance percentage thresholds.
                    </p>
                  </div>
                </div>

                {defaultersList.length > 0 ? (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-slate-50 text-slate-700 uppercase font-bold border-b border-slate-200 text-[11px]">
                        <tr>
                          <th className="p-3 w-28">Roll No</th>
                          <th className="p-3">Student Name</th>
                          <th className="p-3 text-center w-24">Absents</th>
                          <th className="p-3 text-center w-24">Leaves</th>
                          <th className="p-3 text-center w-28">Percentage</th>
                          <th className="p-3 w-40 text-right">Parent Contact</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {defaultersList.map(item => (
                          <tr key={item.student.id} className="hover:bg-slate-50/60">
                            <td className="p-3 font-mono font-bold text-slate-800">{item.student.rollNumber}</td>
                            <td className="p-3 font-semibold text-slate-900">{item.student.name}</td>
                            <td className="p-3 text-center font-bold text-rose-600">{item.absentCount} Days</td>
                            <td className="p-3 text-center font-bold text-amber-600">{item.leaveCount} Days</td>
                            <td className="p-3 text-center">
                              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-rose-100 text-rose-800 border border-rose-200">
                                {item.attendancePercentage}% (Defaulter)
                              </span>
                            </td>
                            <td className="p-3 text-right font-mono text-slate-600">
                              {item.student.guardianPhone || item.student.phone || 'No Phone'}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="p-8 text-center text-slate-400 text-xs">
                    <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto mb-2" />
                    <span>No attendance defaulters found in this section! All students meet or exceed 75% attendance.</span>
                  </div>
                )}
              </div>
            </div>
          )}
        </>
      )}

      {/* MODALS */}
      {/* 1. Remarks Modal */}
      {remarksModalTarget && (
        <AttendanceRemarksModal
          isOpen={!!remarksModalTarget}
          onClose={() => setRemarksModalTarget(null)}
          student={remarksModalTarget}
          currentStatus={
            typeof attendanceRecords[remarksModalTarget.id] === 'string'
              ? attendanceRecords[remarksModalTarget.id]
              : attendanceRecords[remarksModalTarget.id]?.status || 'present'
          }
          currentReason={attendanceRecords[remarksModalTarget.id]?.reason}
          currentRemarks={attendanceRecords[remarksModalTarget.id]?.remarks}
          currentArrivalTime={attendanceRecords[remarksModalTarget.id]?.arrivalTime}
          onSave={handleSaveRemarks}
        />
      )}

      {/* 2. Absentee Parent Notification Modal */}
      {isAbsenteeModalOpen && (
        <AbsenteeNotificationModal
          isOpen={isAbsenteeModalOpen}
          onClose={() => setIsAbsenteeModalOpen(false)}
          date={date}
          className={selectedClass}
          sectionName={selectedSection === 'all' ? 'All Sections' : selectedSection}
          instituteName={currentInstitute?.name || 'Academic Campus'}
          students={rosterStudents}
          attendanceRecords={attendanceRecords}
          onNotificationSent={(count) => {
            setSavedSuccessMsg(`Dispatched automated notifications to ${count} parent(s)!`)
            setTimeout(() => setSavedSuccessMsg(null), 4000)
          }}
        />
      )}

      {/* 3. Print & Export Modal */}
      {isPrintModalOpen && (
        <AttendancePrintModal
          isOpen={isPrintModalOpen}
          onClose={() => setIsPrintModalOpen(false)}
          currentInstitute={currentInstitute}
          session={currentSession}
          className={selectedClass}
          sectionName={selectedSection === 'all' ? 'All Sections' : selectedSection}
          date={date}
          yearMonthStr={yearMonth}
          students={rosterStudents}
          attendanceRecords={attendanceRecords}
          monthlyData={monthlyData}
        />
      )}
    </div>
  )
}

export default AttendanceView
