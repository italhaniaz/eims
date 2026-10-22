import React, { useState, useEffect, useMemo, useRef } from 'react'
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
  FileText,
  Lock,
  Unlock,
  History,
  ChevronLeft,
  ChevronRight,
  Settings,
  Plus,
  RefreshCw,
  Sun,
  ShieldAlert,
  GraduationCap
} from 'lucide-react'
import { useAppData } from '../../../context/AppDataContext'
import { useAuth } from '../../../context/AuthContext'
import { normalizeClassSections } from '../../../constants/academicLevels'
import {
  ATTENDANCE_STATUSES,
  getAttendanceSettings,
  saveAttendanceSettings,
  checkDateHoliday,
  isDateWorkingDay,
  getApprovedLeaveForStudent,
  buildAttendanceKey,
  getAttendanceRecord,
  saveAttendanceRecord,
  unlockAttendanceRecord,
  saveAutosavedDraft,
  getAutosavedDraft,
  clearAutosavedDraft,
  getConsecutiveAbsences,
  getPendingSectionsToday,
  getMonthlyAttendanceMatrix,
  formatDateDDMMYYYY,
  exportDailyAttendanceCSV,
  exportMonthlyAttendanceCSV
} from './attendanceService'
import AttendanceRemarksModal from './AttendanceRemarksModal'
import AbsenteeNotificationModal from './AbsenteeNotificationModal'
import AttendancePrintModal from './AttendancePrintModal'
import AttendanceSettingsModal from './AttendanceSettingsModal'
import StudentLeaveModal from './StudentLeaveModal'
import UnlockSheetModal from './UnlockSheetModal'
import AttendanceAuditHistoryModal from './AttendanceAuditHistoryModal'

export const AttendanceView = ({ currentInstitute, onRouteChange }) => {
  const { 
    students = [], 
    classes = [], 
    institutes = [], 
    activeProgramLevel = 'all',
    saveAttendance: saveAttendanceContext
  } = useAppData()

  const { user } = useAuth()
  const isAdmin = user?.role === 'superadmin' || user?.role === 'institute_admin' || user?.role === 'admin'

  // Clean stale legacy demo keys from storage once on mount
  useEffect(() => {
    try {
      localStorage.removeItem('sms_attendance_demo_seed')
    } catch (e) {}
  }, [])

  // 1. Settings state (Defaulter threshold %, Consecutive absence threshold, Working days, Short leave)
  const [settings, setSettings] = useState(() => getAttendanceSettings())
  const [isSettingsOpen, setIsSettingsOpen] = useState(false)
  const [isLeavesModalOpen, setIsLeavesModalOpen] = useState(false)

  // 2. Shared Academic Sessions Management (format 2026-2027)
  const [sessionsList, setSessionsList] = useState(() => {
    try {
      const stored = localStorage.getItem('sms_academic_sessions')
      if (stored) {
        const parsed = JSON.parse(stored)
        if (Array.isArray(parsed) && parsed.length > 0) return parsed
      }
    } catch (e) {}
    return [
      { id: 'sess-prev', name: '2025-2026', isCurrent: false },
      { id: 'sess-curr', name: '2026-2027', isCurrent: true },
      { id: 'sess-next', name: '2027-2028', isCurrent: false }
    ]
  })

  const currentSession = useMemo(() => {
    const cur = sessionsList.find(s => s.isCurrent)
    return cur ? cur.name : (sessionsList[0]?.name || '2026-2027')
  }, [sessionsList])

  const [selectedSession, setSelectedSession] = useState(currentSession)
  const [isAddingSession, setIsAddingSession] = useState(false)
  const [newSessionName, setNewSessionName] = useState('')

  const handleAddSession = (e) => {
    e.preventDefault()
    if (!newSessionName.trim()) return
    const name = newSessionName.trim()
    if (sessionsList.some(s => s.name === name)) {
      setSelectedSession(name)
      setIsAddingSession(false)
      setNewSessionName('')
      return
    }
    const updated = [...sessionsList, { id: `sess-${Date.now()}`, name, isCurrent: false }]
    setSessionsList(updated)
    try {
      localStorage.setItem('sms_academic_sessions', JSON.stringify(updated))
    } catch (err) {}
    setSelectedSession(name)
    setIsAddingSession(false)
    setNewSessionName('')
  }

  // 3. Filter classes & students for current institute & activeProgramLevel
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

  // 4. Class & Section Selection (Starts UNSELECTED - Zero dummy rule)
  const [selectedClass, setSelectedClass] = useState('')
  const [selectedSection, setSelectedSection] = useState('')

  // Current selected class object and sections
  const currentClassObj = useMemo(() => {
    if (!selectedClass) return null
    return instClasses.find(c => c.name.toLowerCase().trim() === selectedClass.toLowerCase().trim()) || null
  }, [instClasses, selectedClass])

  const classSections = useMemo(() => {
    if (!currentClassObj) return []
    return normalizeClassSections(currentClassObj)
  }, [currentClassObj])

  // Reset section when class changes
  useEffect(() => {
    setSelectedSection('')
  }, [selectedClass])

  // 5. Level detection (School vs College/University lecture-wise)
  const classTier = currentClassObj?.programLevel || 'secondary'
  const isCollegeOrUniversity = classTier === 'college' || classTier === 'university'
  const [selectedSubjectId, setSelectedSubjectId] = useState('general')

  const availableSubjects = useMemo(() => {
    if (!currentClassObj || !currentClassObj.subjects) return []
    return currentClassObj.subjects
  }, [currentClassObj])

  // 6. Date Controls (DD/MM/YYYY, Block Future Dates, Today/Prev/Next)
  const todayIso = useMemo(() => new Date().toISOString().split('T')[0], [])
  const [date, setDate] = useState(todayIso)

  // Prev / Next / Today Handlers
  const handleGoToday = () => setDate(todayIso)
  const handlePrevDay = () => {
    const d = new Date(date)
    d.setDate(d.getDate() - 1)
    setDate(d.toISOString().split('T')[0])
  }
  const handleNextDay = () => {
    if (date >= todayIso) return
    const d = new Date(date)
    d.setDate(d.getDate() + 1)
    const nextIso = d.toISOString().split('T')[0]
    if (nextIso <= todayIso) {
      setDate(nextIso)
    }
  }

  // Month selector for Monthly Matrix & Defaulters
  const [yearMonth, setYearMonth] = useState(() => {
    const now = new Date()
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`
  })

  // Holiday and Working Day validation for active date
  const activeDateHoliday = useMemo(() => checkDateHoliday(date), [date])
  const isActiveDateWorkingDay = useMemo(() => isDateWorkingDay(date, settings.workingDays), [date, settings.workingDays])
  const isDateBlocked = !!activeDateHoliday || !isActiveDateWorkingDay || date > todayIso

  // Active View Tab: 'daily' | 'monthly' | 'analytics'
  const [activeTab, setActiveTab] = useState('daily')

  // Search query (disabled until class and section are picked)
  const [searchQuery, setSearchQuery] = useState('')

  // 7. Roster Students (Excludes withdrawn/transferred; accounts for mid-month admission date)
  const rosterStudents = useMemo(() => {
    if (!selectedClass || !selectedSection) return []
    return instStudents.filter(std => {
      // Exclude inactive students
      if (std.status && std.status !== 'Active') return false

      const classMatch = (std.className || '').toLowerCase().trim() === selectedClass.toLowerCase().trim()
      if (!classMatch) return false

      const secMatch = (std.section || '').toLowerCase().trim() === selectedSection.toLowerCase().trim()
      if (!secMatch) return false

      return true
    })
  }, [instStudents, selectedClass, selectedSection])

  // Filtered by search
  const visibleStudents = useMemo(() => {
    if (!searchQuery.trim()) return rosterStudents
    const q = searchQuery.toLowerCase().trim()
    return rosterStudents.filter(s =>
      (s.name || '').toLowerCase().includes(q) ||
      (s.rollNumber || '').toLowerCase().includes(q) ||
      (s.guardianPhone || '').toLowerCase().includes(q)
    )
  }, [rosterStudents, searchQuery])

  // 8. Attendance Sheet State: studentId -> { status, reason, remarks, arrivalTime }
  const [attendanceRecords, setAttendanceRecords] = useState({})
  const [sheetStatus, setSheetStatus] = useState('Draft') // 'Draft' | 'Saved' | 'Locked'
  const [sheetMetadata, setSheetMetadata] = useState(null)
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false)
  const [unmarkedAlert, setUnmarkedAlert] = useState(false)
  const [toastMessage, setToastMessage] = useState(null)

  const activeCompoundKey = useMemo(() => {
    if (!selectedClass || !selectedSection) return null
    return buildAttendanceKey(selectedSession, selectedClass, selectedSection, date, selectedSubjectId)
  }, [selectedSession, selectedClass, selectedSection, date, selectedSubjectId])

  // Load Record or Draft on selection change
  useEffect(() => {
    setUnmarkedAlert(false)
    if (!selectedClass || !selectedSection) {
      setAttendanceRecords({})
      setSheetStatus('Draft')
      setSheetMetadata(null)
      setHasUnsavedChanges(false)
      return
    }

    // 1. Check existing saved record in persistent store
    const saved = getAttendanceRecord(selectedSession, selectedClass, selectedSection, date, selectedSubjectId)
    if (saved && saved.records && Object.keys(saved.records).length > 0) {
      const loaded = {}
      rosterStudents.forEach(s => {
        // If admitted after date, marked as not admitted
        if (s.admissionDate && s.admissionDate > date) {
          loaded[s.id] = { status: 'not_admitted', remarks: 'Admitted on ' + formatDateDDMMYYYY(s.admissionDate) }
          return
        }

        const item = saved.records[s.id]
        if (item) {
          loaded[s.id] = typeof item === 'string' ? { status: item } : item
        } else {
          // Check approved leave application
          const approvedLeave = getApprovedLeaveForStudent(s.id, date)
          if (approvedLeave) {
            loaded[s.id] = { status: 'leave', reason: approvedLeave.reason, remarks: 'Approved Leave Application' }
          } else {
            loaded[s.id] = { status: null } // unmarked
          }
        }
      })
      setAttendanceRecords(loaded)
      setSheetStatus(saved.sheetState || 'Saved')
      setSheetMetadata(saved)
      setHasUnsavedChanges(false)
      return
    }

    // 2. Check autosaved draft
    const draft = activeCompoundKey ? getAutosavedDraft(activeCompoundKey) : null
    if (draft && draft.records) {
      setAttendanceRecords(draft.records)
      setSheetStatus('Draft')
      setSheetMetadata(null)
      setHasUnsavedChanges(true)
      return
    }

    // 3. New Unrecorded Sheet: Pre-fill approved leaves, leave others unmarked
    const fresh = {}
    rosterStudents.forEach(s => {
      if (s.admissionDate && s.admissionDate > date) {
        fresh[s.id] = { status: 'not_admitted', remarks: 'Admitted on ' + formatDateDDMMYYYY(s.admissionDate) }
        return
      }

      const approvedLeave = getApprovedLeaveForStudent(s.id, date)
      if (approvedLeave) {
        fresh[s.id] = { status: 'leave', reason: approvedLeave.reason, remarks: 'Approved Leave Application' }
      } else {
        fresh[s.id] = { status: null } // Unmarked initially so teacher takes deliberate roll call
      }
    })
    setAttendanceRecords(fresh)
    setSheetStatus('Draft')
    setSheetMetadata(null)
    setHasUnsavedChanges(false)
  }, [selectedSession, selectedClass, selectedSection, date, selectedSubjectId, rosterStudents.length])

  // Debounced Autosave Draft
  useEffect(() => {
    if (!hasUnsavedChanges || !activeCompoundKey || sheetStatus === 'Locked') return
    const timer = setTimeout(() => {
      saveAutosavedDraft(activeCompoundKey, { records: attendanceRecords })
    }, 1000)
    return () => clearTimeout(timer)
  }, [attendanceRecords, hasUnsavedChanges, activeCompoundKey, sheetStatus])

  // Warn about unsaved changes when leaving page
  useEffect(() => {
    const handleBeforeUnload = (e) => {
      if (hasUnsavedChanges && sheetStatus !== 'Locked') {
        e.preventDefault()
        e.returnValue = ''
      }
    }
    window.addEventListener('beforeunload', handleBeforeUnload)
    return () => window.removeEventListener('beforeunload', handleBeforeUnload)
  }, [hasUnsavedChanges, sheetStatus])

  // 9. Status Counters
  const counts = useMemo(() => {
    let p = 0, a = 0, l = 0, t = 0, sl = 0, unmarked = 0
    rosterStudents.forEach(s => {
      const rec = attendanceRecords[s.id]
      if (!rec || !rec.status) {
        unmarked++
        return
      }
      const st = rec.status
      if (st === 'present') p++
      else if (st === 'absent') a++
      else if (st === 'leave') l++
      else if (st === 'late') t++
      else if (st === 'short_leave') sl++
    })
    const markedTotal = p + a + l + t + sl
    const percentage = markedTotal > 0 ? Math.round(((p + t + (sl * 0.5)) / markedTotal) * 100) : 0
    return { present: p, absent: a, leave: l, late: t, shortLeave: sl, unmarked, percentage }
  }, [rosterStudents, attendanceRecords])

  // 10. Status toggle handler
  const handleSetStatus = (studentId, statusKey) => {
    if (sheetStatus === 'Locked') {
      triggerToast('Sheet is Locked. Administrator must unlock to edit.', true)
      return
    }
    if (isDateBlocked) {
      triggerToast('Attendance cannot be taken on holidays or non-working days.', true)
      return
    }

    setAttendanceRecords(prev => {
      const cur = prev[studentId] || {}
      return {
        ...prev,
        [studentId]: {
          ...cur,
          status: cur.status === statusKey ? null : statusKey
        }
      }
    })
    setHasUnsavedChanges(true)
    setUnmarkedAlert(false)
  }

  // Bulk Marking Buttons
  const handleMarkAll = (statusKey) => {
    if (sheetStatus === 'Locked' || isDateBlocked || rosterStudents.length === 0) return
    const updated = { ...attendanceRecords }
    rosterStudents.forEach(s => {
      // Don't overwrite if student not admitted yet
      if (s.admissionDate && s.admissionDate > date) return
      const cur = updated[s.id] || {}
      updated[s.id] = { ...cur, status: statusKey }
    })
    setAttendanceRecords(updated)
    setHasUnsavedChanges(true)
    setUnmarkedAlert(false)
  }

  const handleClearAll = () => {
    if (sheetStatus === 'Locked' || isDateBlocked || rosterStudents.length === 0) return
    const updated = {}
    rosterStudents.forEach(s => {
      if (s.admissionDate && s.admissionDate > date) {
        updated[s.id] = { status: 'not_admitted', remarks: 'Admitted on ' + formatDateDDMMYYYY(s.admissionDate) }
      } else {
        updated[s.id] = { status: null }
      }
    })
    setAttendanceRecords(updated)
    setHasUnsavedChanges(true)
  }

  // 11. Save Attendance Handler (Blocks saving if ANY student unmarked)
  const handleSaveSheet = () => {
    if (rosterStudents.length === 0) return
    if (sheetStatus === 'Locked') {
      triggerToast('Cannot edit locked register without administrative unlock.', true)
      return
    }

    // Verify all active students are marked
    const hasUnmarked = rosterStudents.some(s => {
      if (s.admissionDate && s.admissionDate > date) return false
      const rec = attendanceRecords[s.id]
      return !rec || !rec.status
    })

    if (hasUnmarked) {
      setUnmarkedAlert(true)
      triggerToast('Saving blocked: Please mark attendance for all students before saving.', true)
      return
    }

    const payload = {
      records: attendanceRecords,
      counters: counts,
      subjectId: selectedSubjectId,
      subjectName: availableSubjects.find(sub => sub.id === selectedSubjectId)?.name || ''
    }

    const saved = saveAttendanceRecord(
      selectedSession,
      selectedClass,
      selectedSection,
      date,
      payload,
      user || 'Teacher',
      'Saved'
    )

    if (saveAttendanceContext) {
      saveAttendanceContext(date, `${selectedSession}__${selectedClass}__${selectedSection}`, saved)
    }

    setSheetStatus('Saved')
    setSheetMetadata(saved)
    setHasUnsavedChanges(false)
    setUnmarkedAlert(false)
    triggerToast(`Daily attendance for ${selectedClass} (${selectedSection}) saved successfully!`)
  }

  // Lock / Unlock sheet handlers
  const [isUnlockModalOpen, setIsUnlockModalOpen] = useState(false)
  const [isAuditModalOpen, setIsAuditModalOpen] = useState(false)

  const handleToggleLock = () => {
    if (sheetStatus === 'Locked') {
      // Open unlock modal with mandatory reason
      setIsUnlockModalOpen(true)
    } else {
      // Lock sheet
      const payload = {
        records: attendanceRecords,
        counters: counts,
        subjectId: selectedSubjectId,
        subjectName: availableSubjects.find(sub => sub.id === selectedSubjectId)?.name || ''
      }
      const locked = saveAttendanceRecord(
        selectedSession,
        selectedClass,
        selectedSection,
        date,
        payload,
        user || 'Administrator',
        'Locked',
        'Locked sheet by administrator'
      )
      setSheetStatus('Locked')
      setSheetMetadata(locked)
      setHasUnsavedChanges(false)
      triggerToast('Attendance register has been Locked against edits.')
    }
  }

  const handleConfirmUnlock = (reason) => {
    const unlocked = unlockAttendanceRecord(
      selectedSession,
      selectedClass,
      selectedSection,
      date,
      selectedSubjectId,
      user || 'Administrator',
      reason
    )
    if (unlocked) {
      setSheetStatus('Saved')
      setSheetMetadata(unlocked)
      setHasUnsavedChanges(true)
      triggerToast('Register successfully unlocked for administrative revision.')
    }
  }

  // Toast feedback helper
  const triggerToast = (text, isError = false) => {
    setToastMessage({ text, isError })
    setTimeout(() => setToastMessage(null), 4000)
  }

  // 12. Keyboard Navigation (P, A, L, V, S, ArrowUp, ArrowDown)
  const [focusedRowIndex, setFocusedRowIndex] = useState(0)

  useEffect(() => {
    const handleKeyDown = (e) => {
      // Ignore if typing in an input or textarea or modal is open
      if (['INPUT', 'TEXTAREA', 'SELECT'].includes(e.target.tagName)) return
      if (isSettingsOpen || isLeavesModalOpen || isUnlockModalOpen || isAuditModalOpen) return
      if (sheetStatus === 'Locked' || isDateBlocked || visibleStudents.length === 0) return

      const activeStudent = visibleStudents[focusedRowIndex]
      if (!activeStudent) return

      const key = e.key.toUpperCase()

      if (key === 'P') {
        e.preventDefault()
        handleSetStatus(activeStudent.id, 'present')
      } else if (key === 'A') {
        e.preventDefault()
        handleSetStatus(activeStudent.id, 'absent')
      } else if (key === 'L') {
        e.preventDefault()
        handleSetStatus(activeStudent.id, 'late')
      } else if (key === 'V') {
        e.preventDefault()
        handleSetStatus(activeStudent.id, 'leave')
      } else if (key === 'S' && settings.enableShortLeave) {
        e.preventDefault()
        handleSetStatus(activeStudent.id, 'short_leave')
      } else if (e.key === 'ArrowDown') {
        e.preventDefault()
        setFocusedRowIndex(prev => Math.min(prev + 1, visibleStudents.length - 1))
      } else if (e.key === 'ArrowUp') {
        e.preventDefault()
        setFocusedRowIndex(prev => Math.max(prev - 1, 0))
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [focusedRowIndex, visibleStudents, sheetStatus, isDateBlocked, settings.enableShortLeave, isSettingsOpen, isLeavesModalOpen, isUnlockModalOpen, isAuditModalOpen])

  // Modals state
  const [remarksStudentTarget, setRemarksStudentTarget] = useState(null)
  const [isAbsenteeModalOpen, setIsAbsenteeModalOpen] = useState(false)
  const [isPrintModalOpen, setIsPrintModalOpen] = useState(false)

  // 13. Monthly Matrix Calculation
  const monthlyData = useMemo(() => {
    if (!selectedClass || !selectedSection || rosterStudents.length === 0) return null
    return getMonthlyAttendanceMatrix(selectedSession, selectedClass, selectedSection, yearMonth, rosterStudents, selectedSubjectId)
  }, [selectedSession, selectedClass, selectedSection, yearMonth, rosterStudents, selectedSubjectId])

  const defaultersList = useMemo(() => {
    if (!monthlyData) return []
    return monthlyData.studentRows.filter(r => r.isDefaulter)
  }, [monthlyData])

  const classMonthlyAverage = useMemo(() => {
    if (!monthlyData || monthlyData.studentRows.length === 0) return 0
    const total = monthlyData.studentRows.reduce((acc, row) => acc + row.attendancePercentage, 0)
    return Math.round(total / monthlyData.studentRows.length)
  }, [monthlyData])

  // 14. Principal Overview: Pending Sections Today
  const pendingSectionsToday = useMemo(() => {
    return getPendingSectionsToday(selectedSession, instClasses, todayIso)
  }, [selectedSession, instClasses, todayIso, sheetStatus])

  return (
    <div className="p-4 sm:p-6 md:p-8 space-y-6 max-w-7xl mx-auto">
      {/* Toast Notification */}
      {toastMessage && (
        <div className={`px-4 py-3 rounded-2xl flex items-center justify-between shadow-xs border animate-in fade-in duration-150 ${
          toastMessage.isError 
            ? 'bg-rose-50 border-rose-200 text-rose-800' 
            : 'bg-emerald-50 border-emerald-200 text-emerald-800'
        }`}>
          <div className="flex items-center gap-2">
            {toastMessage.isError ? <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" /> : <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />}
            <span className="text-xs font-semibold">{toastMessage.text}</span>
          </div>
          <button onClick={() => setToastMessage(null)} className="text-xs underline font-semibold">
            Dismiss
          </button>
        </div>
      )}

      {/* Top Header Banner */}
      <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-emerald-600 text-xs font-semibold uppercase tracking-wider">
            <CalendarCheck className="w-4 h-4" />
            <span>Attendance & Roll Call Register</span>
          </div>
          <h1 className="text-2xl font-bold text-slate-900 mt-1 tracking-tight">
            Daily Attendance
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Section-by-section roll call, calendar holiday protections, approved leaves, and institutional audit trail.
          </p>
        </div>

        {/* Global Action Buttons */}
        <div className="flex items-center gap-2 flex-wrap w-full md:w-auto">
          {/* Rules & Holiday Settings */}
          {isAdmin && (
            <button
              type="button"
              onClick={() => setIsSettingsOpen(true)}
              className="flex items-center gap-1.5 px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-xs transition-colors shadow-2xs"
              title="Configure Working Days, Holidays & Thresholds"
            >
              <Settings className="w-3.5 h-3.5 text-slate-600" />
              <span>Rules & Holidays</span>
            </button>
          )}

          {/* Student Leaves Application Drawer */}
          <button
            type="button"
            disabled={!selectedClass}
            onClick={() => setIsLeavesModalOpen(true)}
            className="flex items-center gap-1.5 px-3 py-2 bg-slate-100 hover:bg-slate-200 disabled:opacity-40 text-slate-700 font-bold rounded-xl text-xs transition-colors shadow-2xs"
            title={!selectedClass ? 'Select a class first' : 'Record student leave applications'}
          >
            <Calendar className="w-3.5 h-3.5 text-amber-600" />
            <span>Student Leaves</span>
          </button>

          {/* Parent Alerts Button */}
          <button
            type="button"
            disabled={rosterStudents.length === 0 || counts.absent + counts.leave === 0}
            onClick={() => setIsAbsenteeModalOpen(true)}
            className="flex items-center gap-1.5 px-3 py-2 bg-slate-100 hover:bg-slate-200 disabled:opacity-40 text-slate-700 font-bold rounded-xl text-xs transition-colors shadow-2xs"
            title={rosterStudents.length === 0 ? 'Save attendance first' : (counts.absent + counts.leave === 0 ? 'No absent or leave students today' : 'Send WhatsApp / SMS alerts')}
          >
            <MessageSquare className="w-3.5 h-3.5 text-emerald-600" />
            <span>Parent Alerts ({counts.absent + counts.leave})</span>
          </button>

          {/* Print & Export Hub */}
          <button
            type="button"
            disabled={rosterStudents.length === 0}
            onClick={() => setIsPrintModalOpen(true)}
            className="flex items-center gap-1.5 px-3 py-2 bg-white hover:bg-slate-50 border border-slate-200 disabled:opacity-40 text-slate-700 font-bold rounded-xl text-xs transition-colors shadow-2xs"
            title={rosterStudents.length === 0 ? 'Save attendance first' : 'Print A4 register or export CSV'}
          >
            <Printer className="w-3.5 h-3.5 text-slate-600" />
            <span>Print & Export</span>
          </button>

          {/* Lock / Unlock Toggle Button (Admin only) */}
          {selectedClass && selectedSection && rosterStudents.length > 0 && sheetStatus !== 'Draft' && (
            <button
              type="button"
              onClick={handleToggleLock}
              className={`flex items-center gap-1.5 px-3.5 py-2 font-bold rounded-xl text-xs transition-all shadow-2xs ${
                sheetStatus === 'Locked'
                  ? 'bg-amber-500 hover:bg-amber-600 text-white'
                  : 'bg-slate-700 hover:bg-slate-800 text-white'
              }`}
              title={sheetStatus === 'Locked' ? 'Administrator unlock request' : 'Lock register against modification'}
            >
              {sheetStatus === 'Locked' ? <Unlock className="w-3.5 h-3.5" /> : <Lock className="w-3.5 h-3.5" />}
              <span>{sheetStatus === 'Locked' ? 'Unlock Sheet' : 'Lock Register'}</span>
            </button>
          )}

          {/* Save Attendance Button */}
          <button
            type="button"
            disabled={!selectedClass || !selectedSection || rosterStudents.length === 0 || sheetStatus === 'Locked' || isDateBlocked || !hasUnsavedChanges}
            onClick={handleSaveSheet}
            className={`flex items-center gap-1.5 px-4 py-2 font-bold rounded-xl text-xs transition-all shadow-xs active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed ${
              hasUnsavedChanges
                ? 'bg-emerald-600 hover:bg-emerald-700 text-white ring-2 ring-emerald-500/20'
                : 'bg-emerald-600 text-white'
            }`}
            title={
              !selectedClass || !selectedSection
                ? 'Select a class and section first'
                : sheetStatus === 'Locked'
                ? 'Sheet is locked against modification'
                : isDateBlocked
                ? 'Attendance cannot be taken on holidays or non-working days'
                : !hasUnsavedChanges
                ? 'No unsaved changes'
                : 'Save attendance records'
            }
          >
            <Check className="w-4 h-4" />
            <span>{hasUnsavedChanges ? 'Save Changes *' : 'Save Attendance Sheet'}</span>
          </button>
        </div>
      </div>

      {/* Principal / Admin "Pending Today" Banner */}
      {isAdmin && pendingSectionsToday.length > 0 && (
        <div className="bg-amber-50/70 border border-amber-200/90 rounded-2xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2.5">
            <Clock className="w-4 h-4 text-amber-600 shrink-0" />
            <div>
              <span className="font-bold text-amber-900 block">
                Pending Today: {pendingSectionsToday.length} Section(s) Awaiting Roll Call
              </span>
              <span className="text-amber-800 text-[11px]">
                {pendingSectionsToday.map(p => `${p.className} (${p.sectionName})`).slice(0, 4).join(', ')}
                {pendingSectionsToday.length > 4 ? ` +${pendingSectionsToday.length - 4} more` : ''}
              </span>
            </div>
          </div>

          <span className="text-[11px] font-mono text-amber-800 font-bold bg-amber-100/70 px-2.5 py-1 rounded-lg">
            Date: {formatDateDDMMYYYY(todayIso)}
          </span>
        </div>
      )}

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
          <span>Short Attendance &amp; Defaulters (&lt;{settings.defaulterThreshold}%)</span>
        </button>
      </div>

      {/* FILTER BAR: Session, Date Controls, Class & Section */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2.5 flex-wrap">
          {/* Shared Academic Session Selector */}
          <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-1.5">
            <span className="text-slate-400 font-bold uppercase text-[10px]">Session:</span>
            {!isAddingSession ? (
              <select
                value={selectedSession}
                onChange={(e) => {
                  if (e.target.value === '__add_new__') {
                    setIsAddingSession(true)
                  } else {
                    setSelectedSession(e.target.value)
                  }
                }}
                className="bg-transparent font-bold text-slate-900 font-mono focus:outline-none cursor-pointer"
              >
                {sessionsList.map(s => (
                  <option key={s.id} value={s.name}>
                    {s.name} {s.isCurrent ? '(Current)' : ''}
                  </option>
                ))}
                <option value="__add_new__">+ Add Session...</option>
              </select>
            ) : (
              <form onSubmit={handleAddSession} className="flex items-center gap-1">
                <input
                  type="text"
                  placeholder="2028-2029"
                  value={newSessionName}
                  onChange={(e) => setNewSessionName(e.target.value)}
                  className="w-20 px-1 py-0.5 border border-slate-300 rounded font-mono font-bold text-xs"
                />
                <button type="submit" className="text-emerald-700 font-bold text-[10px] hover:underline">Add</button>
                <button type="button" onClick={() => setIsAddingSession(false)} className="text-slate-400 text-[10px]">✕</button>
              </form>
            )}
          </div>

          {/* Date Selector with Prev / Next / Today (Daily Tab) */}
          {activeTab === 'daily' && (
            <div className="flex items-center gap-1 bg-slate-50 border border-slate-200 rounded-xl p-1">
              <button
                type="button"
                onClick={handlePrevDay}
                className="p-1 rounded-lg text-slate-500 hover:text-slate-900 hover:bg-slate-200/60"
                title="Previous Day"
              >
                <ChevronLeft className="w-3.5 h-3.5" />
              </button>

              <div className="flex items-center gap-1.5 px-2">
                <Calendar className="w-3.5 h-3.5 text-slate-400" />
                <span className="font-bold text-slate-800 font-mono text-xs">
                  {formatDateDDMMYYYY(date)}
                </span>
                <input
                  type="date"
                  max={todayIso}
                  value={date}
                  onChange={(e) => {
                    if (e.target.value <= todayIso) {
                      setDate(e.target.value)
                    }
                  }}
                  className="opacity-0 absolute w-6 cursor-pointer"
                  title="Pick Date"
                />
              </div>

              <button
                type="button"
                disabled={date >= todayIso}
                onClick={handleNextDay}
                className="p-1 rounded-lg text-slate-500 hover:text-slate-900 hover:bg-slate-200/60 disabled:opacity-30 disabled:cursor-not-allowed"
                title="Next Day"
              >
                <ChevronRight className="w-3.5 h-3.5" />
              </button>

              {date !== todayIso && (
                <button
                  type="button"
                  onClick={handleGoToday}
                  className="ml-1 px-2 py-0.5 bg-emerald-100 text-emerald-800 font-bold rounded-md text-[10px] hover:bg-emerald-200"
                >
                  Today
                </button>
              )}
            </div>
          )}

          {/* Month Picker for Monthly / Analytics Tab */}
          {activeTab !== 'daily' && (
            <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-1.5">
              <Calendar className="w-3.5 h-3.5 text-slate-400" />
              <span className="text-slate-400 font-bold uppercase text-[10px]">Month:</span>
              <input
                type="month"
                value={yearMonth}
                onChange={(e) => setYearMonth(e.target.value)}
                className="font-bold text-slate-900 bg-transparent focus:outline-none cursor-pointer font-mono text-xs"
              />
            </div>
          )}

          {/* Class Selector (Starts UNSELECTED on "-- Select class --") */}
          <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-1.5">
            <span className="text-slate-400 font-bold uppercase text-[10px]">
              {isCollegeOrUniversity ? 'Course / Program:' : 'Class:'}
            </span>
            <select
              value={selectedClass}
              onChange={(e) => setSelectedClass(e.target.value)}
              className="bg-transparent font-bold text-slate-900 focus:outline-none cursor-pointer"
            >
              <option value="">-- Select {isCollegeOrUniversity ? 'Program' : 'Class'} --</option>
              {instClasses.map(c => (
                <option key={c.id} value={c.name}>{c.name}</option>
              ))}
            </select>
          </div>

          {/* Section Selector (Starts UNSELECTED - Section is Required, NO All Sections) */}
          <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-1.5">
            <span className="text-slate-400 font-bold uppercase text-[10px]">
              {isCollegeOrUniversity ? 'Batch / Section:' : 'Section:'}
            </span>
            <select
              disabled={!selectedClass || classSections.length === 0}
              value={selectedSection}
              onChange={(e) => setSelectedSection(e.target.value)}
              className="bg-transparent font-bold text-emerald-800 focus:outline-none cursor-pointer disabled:text-slate-400"
            >
              <option value="">-- Select Section --</option>
              {classSections.map((sec, idx) => (
                <option key={sec.id || idx} value={sec.name}>{sec.name}</option>
              ))}
            </select>
          </div>

          {/* College & University Lecture / Subject Picker */}
          {isCollegeOrUniversity && availableSubjects.length > 0 && (
            <div className="flex items-center gap-1.5 bg-purple-50/70 border border-purple-200 rounded-xl px-2.5 py-1.5">
              <span className="text-purple-600 font-bold uppercase text-[10px]">Lecture / Subject:</span>
              <select
                value={selectedSubjectId}
                onChange={(e) => setSelectedSubjectId(e.target.value)}
                className="bg-transparent font-bold text-purple-900 focus:outline-none cursor-pointer text-xs"
              >
                <option value="general">Daily Attendance (General)</option>
                {availableSubjects.map(sub => (
                  <option key={sub.id} value={sub.id}>
                    {sub.name} ({sub.code || 'Course'} • {sub.credits || '3'} Cr)
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>

        {/* Search Input & Audit History */}
        <div className="flex items-center gap-2">
          {/* Quick Search */}
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2" />
            <input
              type="text"
              disabled={!selectedClass || !selectedSection}
              placeholder="Search roll or name..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-8 pr-3 py-1.5 rounded-xl border border-slate-200 bg-slate-50 text-xs font-semibold focus:outline-none focus:bg-white w-44 disabled:opacity-40 disabled:cursor-not-allowed"
            />
          </div>

          {/* Audit History Button */}
          {selectedClass && selectedSection && sheetMetadata && (
            <button
              type="button"
              onClick={() => setIsAuditModalOpen(true)}
              className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 transition-colors"
              title="View Sheet Audit History & Modifications"
            >
              <History className="w-3.5 h-3.5" />
            </button>
          )}

          {/* State Badge (Only when class & section are selected) */}
          {selectedClass && selectedSection && activeTab === 'daily' && (
            <span className={`px-2.5 py-1 rounded-full text-[11px] font-bold border flex items-center gap-1.5 ${
              sheetStatus === 'Locked'
                ? 'bg-purple-50 text-purple-800 border-purple-200'
                : sheetStatus === 'Saved'
                ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                : 'bg-amber-50 text-amber-800 border-amber-200'
            }`}>
              {sheetStatus === 'Locked' ? (
                <Lock className="w-3 h-3 text-purple-600" />
              ) : sheetStatus === 'Saved' ? (
                <Check className="w-3 h-3 text-emerald-600" />
              ) : (
                <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
              )}
              <span>{sheetStatus === 'Locked' ? 'Locked' : sheetStatus === 'Saved' ? 'Saved' : 'Draft / Unsaved'}</span>
            </span>
          )}
        </div>
      </div>

      {/* HOLIDAY / NON-WORKING DAY NOTICE BANNER */}
      {isDateBlocked && (
        <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 flex items-center gap-3 text-amber-900 text-xs">
          <Sun className="w-5 h-5 text-amber-600 shrink-0" />
          <div>
            <strong className="block text-sm">
              {activeDateHoliday ? `Holiday: ${activeDateHoliday.name} (${activeDateHoliday.type})` : !isActiveDateWorkingDay ? `Non-Working Day (${new Date(date).toLocaleDateString('en-US', { weekday: 'long' })})` : 'Future Date Blocked'}
            </strong>
            <span className="text-[11px] text-amber-800">
              Attendance roll call cannot be recorded on official holidays or non-instructional weekend off-days.
            </span>
          </div>
        </div>
      )}

      {/* UNMARKED STUDENTS ALERT */}
      {unmarkedAlert && counts.unmarked > 0 && (
        <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-800 text-xs flex items-center justify-between animate-in fade-in">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
            <span className="font-semibold">
              Attendance incomplete: <strong>{counts.unmarked} student(s)</strong> are currently unmarked. Mark all students to save.
            </span>
          </div>
          <button
            type="button"
            onClick={() => setUnmarkedAlert(false)}
            className="text-[11px] font-bold text-rose-700 underline"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* EMPTY STATE 1: No Classes Configured */}
      {instClasses.length === 0 && (
        <div className="p-12 bg-white rounded-2xl border border-slate-200 text-center space-y-3">
          <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center mx-auto">
            <School className="w-6 h-6" />
          </div>
          <h3 className="text-base font-bold text-slate-900">Create a class first</h3>
          <p className="text-xs text-slate-500 max-w-md mx-auto">
            No academic classes exist for this campus. Add educational classes, sections, and subjects in Classes &amp; Sections before conducting roll calls.
          </p>
          <div>
            <button
              type="button"
              onClick={() => onRouteChange?.('inst-classes')}
              className="inline-flex items-center gap-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-all shadow-sm"
            >
              <span>Go to Classes &amp; Sections</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}

      {/* EMPTY STATE 2: Classes Exist but No Class Selected */}
      {instClasses.length > 0 && !selectedClass && (
        <div className="p-12 bg-slate-50 rounded-2xl border border-dashed border-slate-200 text-center space-y-2">
          <CalendarCheck className="w-8 h-8 text-slate-400 mx-auto" />
          <h3 className="text-sm font-bold text-slate-700">Select a Class to Begin Roll Call</h3>
          <p className="text-xs text-slate-400 max-w-sm mx-auto">
            Please pick an educational class and its specific section from the filter bar above to record or review attendance.
          </p>
        </div>
      )}

      {/* EMPTY STATE 3: Class Selected but No Section Selected */}
      {selectedClass && !selectedSection && (
        <div className="p-10 bg-slate-50 rounded-2xl border border-dashed border-slate-200 text-center space-y-2">
          <Layers className="w-8 h-8 text-emerald-600 mx-auto" />
          <h3 className="text-sm font-bold text-slate-700">Select a Section</h3>
          <p className="text-xs text-slate-400 max-w-sm mx-auto">
            Section selection is required. Please choose a specific section of <strong>{selectedClass}</strong> to load its student roster.
          </p>
        </div>
      )}

      {/* EMPTY STATE 4: Class & Section Selected but No Students Admitted */}
      {selectedClass && selectedSection && rosterStudents.length === 0 && (
        <div className="p-12 bg-white rounded-2xl border border-slate-200 text-center space-y-3">
          <div className="w-12 h-12 bg-slate-100 text-slate-400 rounded-2xl flex items-center justify-center mx-auto">
            <Users className="w-6 h-6" />
          </div>
          <h3 className="text-base font-bold text-slate-900">No Students Found</h3>
          <p className="text-xs text-slate-500 max-w-md mx-auto">
            No active students are currently enrolled in <strong>{selectedClass} ({selectedSection})</strong>.
            Admit students into this section from the Admissions module to take attendance.
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

      {/* ACTIVE ROSTER CONTENT */}
      {selectedClass && selectedSection && rosterStudents.length > 0 && (
        <>
          {/* TAB 1: DAILY ROLL CALL SHEET */}
          {activeTab === 'daily' && (
            <div className="space-y-4">
              {/* Live Summary Bar & Bulk Buttons */}
              <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
                {/* Live Counters */}
                <div className="flex items-center gap-2 flex-wrap font-mono">
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
                  {settings.enableShortLeave && (
                    <span className="px-3 py-1 bg-sky-50 text-sky-800 rounded-xl border border-sky-200 font-bold">
                      Short Leave: {counts.shortLeave}
                    </span>
                  )}
                  <span className="px-2.5 py-1 bg-slate-100 text-slate-700 rounded-xl font-bold font-sans">
                    Att: {counts.percentage}%
                  </span>
                  {counts.unmarked > 0 && (
                    <span className="px-2 py-0.5 rounded-lg bg-amber-100 text-amber-900 font-bold text-[10px]">
                      {counts.unmarked} Unmarked
                    </span>
                  )}
                </div>

                {/* Bulk Actions */}
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    disabled={sheetStatus === 'Locked' || isDateBlocked}
                    onClick={() => handleMarkAll('present')}
                    className="px-3 py-1.5 bg-emerald-50 hover:bg-emerald-100 disabled:opacity-40 text-emerald-800 font-bold rounded-lg transition-colors border border-emerald-200 text-[11px]"
                  >
                    Mark All Present
                  </button>
                  <button
                    type="button"
                    disabled={sheetStatus === 'Locked' || isDateBlocked}
                    onClick={() => handleMarkAll('absent')}
                    className="px-3 py-1.5 bg-rose-50 hover:bg-rose-100 disabled:opacity-40 text-rose-800 font-bold rounded-lg transition-colors border border-rose-200 text-[11px]"
                  >
                    Mark All Absent
                  </button>
                  <button
                    type="button"
                    disabled={sheetStatus === 'Locked' || isDateBlocked}
                    onClick={handleClearAll}
                    className="px-2.5 py-1.5 bg-slate-100 hover:bg-slate-200 disabled:opacity-40 text-slate-600 font-bold rounded-lg transition-colors text-[11px]"
                  >
                    Clear All
                  </button>
                </div>
              </div>

              {/* Keyboard Shortcuts Hint Bar */}
              <div className="flex items-center justify-between text-[11px] text-slate-400 px-2 font-mono">
                <span>
                  Keyboard Shortcuts: <strong className="text-slate-600">[P]</strong> Present, <strong className="text-slate-600">[A]</strong> Absent, <strong className="text-slate-600">[L]</strong> Late, <strong className="text-slate-600">[V]</strong> Leave, <strong className="text-slate-600">[S]</strong> Short Leave • <strong className="text-slate-600">[↑/↓]</strong> Navigate Rows
                </span>
                <span>Active Focused: {visibleStudents[focusedRowIndex]?.name || 'None'}</span>
              </div>

              {/* Student Table */}
              <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs min-w-[780px]">
                    <thead className="bg-slate-50 text-slate-700 uppercase font-bold border-b border-slate-200 text-[11px]">
                      <tr>
                        <th className="p-3 w-12 text-center">Sr</th>
                        <th className="p-3 w-28">Roll No</th>
                        <th className="p-3">Student &amp; Parent Contact</th>
                        <th className="p-3 w-32">Section</th>
                        <th className="p-3 text-center w-84">Attendance Status</th>
                        <th className="p-3 w-44 text-right">Remarks &amp; Notes</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {visibleStudents.map((std, idx) => {
                        const rec = attendanceRecords[std.id] || {}
                        const curStatus = rec.status
                        const reason = rec.reason || ''
                        const remarks = rec.remarks || ''
                        const arrivalTime = rec.arrivalTime || ''
                        const isFocused = idx === focusedRowIndex
                        const isUnmarked = !curStatus && curStatus !== 'not_admitted'

                        // Consecutive absence check
                        const cInfo = getConsecutiveAbsences(std.id, selectedSession, selectedClass, selectedSection, date, settings.consecutiveAbsenceThreshold)

                        return (
                          <tr 
                            key={std.id}
                            onClick={() => setFocusedRowIndex(idx)}
                            className={`transition-colors ${
                              isFocused ? 'bg-slate-50/90 ring-1 ring-inset ring-emerald-500/20' : 'hover:bg-slate-50/50'
                            } ${isUnmarked && unmarkedAlert ? 'bg-rose-50/40' : ''}`}
                          >
                            <td className="p-3 text-center font-mono text-slate-400 text-[11px]">
                              {idx + 1}
                            </td>

                            <td className="p-3 font-mono font-bold text-slate-800 text-xs">
                              {std.rollNumber}
                            </td>

                            <td className="p-3">
                              <div className="flex items-center gap-2">
                                <div className="w-7 h-7 rounded-full bg-slate-200 text-slate-700 flex items-center justify-center font-bold text-[10px] shrink-0 uppercase">
                                  {std.name.slice(0, 2)}
                                </div>
                                <div className="truncate">
                                  <div className="flex items-center gap-1.5">
                                    <strong className="text-slate-900 font-bold text-xs truncate">
                                      {std.name}
                                    </strong>
                                    {cInfo.isFlagged && (
                                      <span className="px-1.5 py-0.2 rounded font-mono text-[9px] bg-rose-100 text-rose-800 font-bold flex items-center gap-1" title={`${cInfo.count} consecutive days absent`}>
                                        <AlertTriangle className="w-3 h-3 text-rose-600" />
                                        <span>{cInfo.count}d Absent</span>
                                      </span>
                                    )}
                                  </div>
                                  <span className="text-[11px] text-slate-400 font-mono block">
                                    {std.guardianPhone || std.phone || 'No Contact'}
                                  </span>
                                </div>
                              </div>
                            </td>

                            <td className="p-3 text-xs">
                              <span className="font-semibold text-slate-700">{selectedSection}</span>
                            </td>

                            {/* Status Buttons Pill */}
                            <td className="p-3 text-center">
                              {curStatus === 'not_admitted' ? (
                                <span className="px-3 py-1 bg-slate-100 text-slate-500 rounded-lg font-mono text-[11px]">
                                  Not Admitted Yet
                                </span>
                              ) : (
                                <div className="inline-flex rounded-xl border border-slate-200 p-0.5 bg-slate-50 shadow-2xs gap-0.5">
                                  {Object.values(ATTENDANCE_STATUSES).filter(s => s.id !== 'short_leave' || settings.enableShortLeave).map(cfg => {
                                    const isSelected = curStatus === cfg.id
                                    return (
                                      <button
                                        key={cfg.id}
                                        type="button"
                                        disabled={sheetStatus === 'Locked' || isDateBlocked}
                                        onClick={() => handleSetStatus(std.id, cfg.id)}
                                        className={`px-2.5 py-1 text-[11px] font-bold rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed ${
                                          isSelected
                                            ? cfg.btnActiveClass
                                            : 'text-slate-600 hover:text-slate-900 hover:bg-white/80'
                                        }`}
                                      >
                                        <span>{cfg.label}</span>
                                        <span className="text-[8px] opacity-60 ml-0.5">({cfg.keyShortcut})</span>
                                      </button>
                                    )
                                  })}
                                </div>
                              )}
                            </td>

                            {/* Remarks Button & Pill */}
                            <td className="p-3 text-right">
                              <div className="flex items-center justify-end gap-1.5">
                                {(reason || remarks || (curStatus === 'late' && arrivalTime)) ? (
                                  <div
                                    onClick={() => setRemarksStudentTarget(std)}
                                    className="cursor-pointer max-w-[150px] truncate text-left"
                                    title={`${reason} ${remarks ? `(${remarks})` : ''}`}
                                  >
                                    <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-slate-100 text-slate-700 border border-slate-200 block truncate">
                                      {curStatus === 'late' && arrivalTime ? `Arrived ${arrivalTime}` : reason || remarks}
                                    </span>
                                  </div>
                                ) : (
                                  <button
                                    type="button"
                                    onClick={() => setRemarksStudentTarget(std)}
                                    className="p-1.5 text-slate-400 hover:text-emerald-700 hover:bg-slate-100 rounded-lg transition-colors"
                                    title="Add remarks or late time"
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
              <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
                <div>
                  <span className="font-bold text-slate-800 uppercase text-[11px] block">
                    Monthly Register Matrix: {selectedClass} ({selectedSection})
                  </span>
                  <span className="text-[10px] text-slate-400 font-mono">
                    Period: {yearMonth} • Working Days: {monthlyData.totalWorkingDays} • Class Attendance Average: {classMonthlyAverage}%
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => exportMonthlyAttendanceCSV(selectedSession, selectedClass, selectedSection, yearMonth, monthlyData)}
                    className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-lg text-xs flex items-center gap-1.5 transition-colors"
                  >
                    <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Download Excel</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setIsPrintModalOpen(true)}
                    className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg text-xs flex items-center gap-1.5 transition-colors shadow-2xs"
                  >
                    <Printer className="w-3.5 h-3.5" />
                    <span>Print Register</span>
                  </button>
                </div>
              </div>

              {/* Matrix Grid */}
              <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs min-w-[900px] font-mono">
                    <thead className="bg-slate-50 text-slate-700 uppercase font-bold border-b border-slate-200 text-[10px]">
                      <tr>
                        <th className="p-2 w-16 border-r border-slate-200">Roll</th>
                        <th className="p-2 w-36 border-r border-slate-200 font-sans">Student Name</th>
                        {monthlyData.days.filter(d => d.isWorking).map(d => (
                          <th key={d.dayNum} className="p-1 text-center border-r border-slate-200 min-w-[28px]">
                            <span className="block font-bold">{d.dayNum}</span>
                            <span className="text-[8px] font-normal text-slate-400 block">{d.dayName[0]}</span>
                          </th>
                        ))}
                        <th className="p-1 text-center border-r border-slate-200 w-8 text-emerald-700">P</th>
                        <th className="p-1 text-center border-r border-slate-200 w-8 text-rose-700">A</th>
                        <th className="p-1 text-center border-r border-slate-200 w-8 text-amber-700">L</th>
                        <th className="p-1 text-center border-r border-slate-200 w-8 text-purple-700">T</th>
                        <th className="p-1 text-center w-14 font-sans font-bold">Att %</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 text-[11px]">
                      {monthlyData.studentRows.map(row => (
                        <tr key={row.student.id} className="hover:bg-slate-50/60">
                          <td className="p-2 border-r border-slate-100 font-bold text-slate-700">{row.student.rollNumber}</td>
                          <td className="p-2 border-r border-slate-100 font-sans font-semibold text-slate-900 truncate max-w-[140px]">{row.student.name}</td>
                          {monthlyData.days.filter(d => d.isWorking).map(d => {
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
                          <td className="p-1 border-r border-slate-100 text-center font-bold text-emerald-700">{row.presentCount}</td>
                          <td className="p-1 border-r border-slate-100 text-center font-bold text-rose-700">{row.absentCount}</td>
                          <td className="p-1 border-r border-slate-100 text-center font-bold text-amber-700">{row.leaveCount}</td>
                          <td className="p-1 border-r border-slate-100 text-center font-bold text-purple-700">{row.lateCount}</td>
                          <td className="p-1 text-center font-sans font-bold">
                            <span className={`px-1.5 py-0.5 rounded text-[10px] ${
                              row.isDefaulter ? 'bg-rose-100 text-rose-800 border border-rose-200' : 'bg-slate-100 text-slate-800'
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

          {/* TAB 3: DEFAULTERS & SHORT ATTENDANCE */}
          {activeTab === 'analytics' && (
            <div className="space-y-4">
              {/* Analytics Summary KPI Cards */}
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
                    Total Enrolled in Section
                  </span>
                  <div className="mt-1 flex items-baseline gap-2">
                    <span className="text-2xl font-bold text-slate-900">{rosterStudents.length}</span>
                    <span className="text-xs text-slate-400">Active Students</span>
                  </div>
                </div>

                <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-2xs">
                  <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">
                    Short Attendance Defaulters
                  </span>
                  <div className="mt-1 flex items-baseline gap-2">
                    <span className="text-2xl font-bold text-rose-600">{defaultersList.length}</span>
                    <span className="text-xs text-rose-700 font-semibold">&lt; {settings.defaulterThreshold}% Limit</span>
                  </div>
                </div>

                <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-2xs">
                  <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">
                    Total Instructional Days
                  </span>
                  <div className="mt-1 flex items-baseline gap-2">
                    <span className="text-2xl font-bold text-slate-900">{monthlyData?.totalWorkingDays || 26}</span>
                    <span className="text-xs text-slate-400">Evaluated</span>
                  </div>
                </div>
              </div>

              {/* Defaulters Table with Exam Ineligibility Warning */}
              <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
                <div className="p-4 border-b border-slate-100 flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
                      <AlertTriangle className="w-4 h-4 text-rose-600" />
                      <span>Exam Eligibility Defaulters (Below {settings.defaulterThreshold}%)</span>
                    </h3>
                    <p className="text-xs text-slate-400">
                      Students below this limit will automatically show an exam eligibility warning in Examinations &amp; Marks.
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
                          <th className="p-3 text-center w-28">Attendance %</th>
                          <th className="p-3 text-center w-36">Exam Status</th>
                          <th className="p-3 w-40 text-right">Guardian Contact</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {defaultersList.map(item => (
                          <tr key={item.student.id} className="hover:bg-slate-50/60">
                            <td className="p-3 font-mono font-bold text-slate-800">{item.student.rollNumber}</td>
                            <td className="p-3 font-semibold text-slate-900">{item.student.name}</td>
                            <td className="p-3 text-center font-bold text-rose-600">{item.absentCount} Days</td>
                            <td className="p-3 text-center font-bold text-amber-600">{item.leaveCount} Days</td>
                            <td className="p-3 text-center font-bold font-mono">
                              <span className="px-2.5 py-0.5 rounded-full text-xs bg-rose-100 text-rose-800 border border-rose-200">
                                {item.attendancePercentage}%
                              </span>
                            </td>
                            <td className="p-3 text-center">
                              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-rose-50 text-rose-700 border border-rose-200">
                                Ineligible / Flagged
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
                    <span>No defaulters in this section. All students meet the {settings.defaulterThreshold}% threshold.</span>
                  </div>
                )}
              </div>
            </div>
          )}
        </>
      )}

      {/* MODALS */}
      {/* 1. Remarks Modal */}
      {remarksStudentTarget && (
        <AttendanceRemarksModal
          isOpen={!!remarksStudentTarget}
          onClose={() => setRemarksStudentTarget(null)}
          student={remarksStudentTarget}
          currentStatus={attendanceRecords[remarksStudentTarget.id]?.status || 'present'}
          currentReason={attendanceRecords[remarksStudentTarget.id]?.reason}
          currentRemarks={attendanceRecords[remarksStudentTarget.id]?.remarks}
          currentArrivalTime={attendanceRecords[remarksStudentTarget.id]?.arrivalTime}
          onSave={(remarksPayload) => {
            setAttendanceRecords(prev => {
              const cur = prev[remarksStudentTarget.id] || { status: 'present' }
              return {
                ...prev,
                [remarksStudentTarget.id]: {
                  ...cur,
                  reason: remarksPayload.reason,
                  remarks: remarksPayload.remarks,
                  arrivalTime: remarksPayload.arrivalTime
                }
              }
            })
            setHasUnsavedChanges(true)
            setRemarksStudentTarget(null)
          }}
        />
      )}

      {/* 2. Absentee Bilingual Parent Alerts Modal */}
      {isAbsenteeModalOpen && (
        <AbsenteeNotificationModal
          isOpen={isAbsenteeModalOpen}
          onClose={() => setIsAbsenteeModalOpen(false)}
          session={selectedSession}
          date={date}
          className={selectedClass}
          sectionName={selectedSection}
          instituteName={currentInstitute?.name || 'Academic Campus'}
          students={rosterStudents}
          attendanceRecords={attendanceRecords}
          consecutiveThreshold={settings.consecutiveAbsenceThreshold}
          onNotificationSent={(count) => {
            triggerToast(`Dispatched parent notifications to ${count} guardian(s)!`)
          }}
        />
      )}

      {/* 3. Print & Export Modal */}
      {isPrintModalOpen && (
        <AttendancePrintModal
          isOpen={isPrintModalOpen}
          onClose={() => setIsPrintModalOpen(false)}
          currentInstitute={currentInstitute}
          session={selectedSession}
          className={selectedClass}
          sectionName={selectedSection}
          date={date}
          yearMonthStr={yearMonth}
          students={rosterStudents}
          attendanceRecords={attendanceRecords}
          monthlyData={monthlyData}
        />
      )}

      {/* 4. Settings & Holiday Calendar Modal */}
      {isSettingsOpen && (
        <AttendanceSettingsModal
          isOpen={isSettingsOpen}
          onClose={() => setIsSettingsOpen(false)}
          onSettingsUpdated={(newSettings) => {
            setSettings(newSettings)
            triggerToast('Attendance rules and holiday calendar updated!')
          }}
        />
      )}

      {/* 5. Student Leave Applications Modal */}
      {isLeavesModalOpen && (
        <StudentLeaveModal
          isOpen={isLeavesModalOpen}
          onClose={() => setIsLeavesModalOpen(false)}
          students={rosterStudents.length > 0 ? rosterStudents : instStudents}
          currentClass={selectedClass}
          currentSection={selectedSection}
          onLeavesUpdated={() => {
            triggerToast('Student leave records updated!')
          }}
        />
      )}

      {/* 6. Admin Unlock Sheet Modal */}
      {isUnlockModalOpen && (
        <UnlockSheetModal
          isOpen={isUnlockModalOpen}
          onClose={() => setIsUnlockModalOpen(false)}
          className={selectedClass}
          sectionName={selectedSection}
          date={formatDateDDMMYYYY(date)}
          onConfirmUnlock={handleConfirmUnlock}
        />
      )}

      {/* 7. Audit History Timeline Modal */}
      {isAuditModalOpen && sheetMetadata && (
        <AttendanceAuditHistoryModal
          isOpen={isAuditModalOpen}
          onClose={() => setIsAuditModalOpen(false)}
          className={selectedClass}
          sectionName={selectedSection}
          date={date}
          auditTrail={sheetMetadata.auditTrail || []}
          submittedAt={sheetMetadata.submittedAt}
          submittedBy={sheetMetadata.submittedBy}
        />
      )}
    </div>
  )
}

export default AttendanceView
