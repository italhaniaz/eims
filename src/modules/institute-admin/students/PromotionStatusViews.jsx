import React, { useState, useMemo, useEffect } from 'react'
import {
  ArrowLeft,
  ArrowRight,
  FileText,
  UserPlus,
  CreditCard,
  Receipt,
  ArrowDownCircle,
  MessageSquare,
  ChevronUp,
  ChevronDown,
  Users,
  Filter,
  Search,
  X,
  List,
  RotateCcw,
  GraduationCap,
  Wallet,
  AlertTriangle,
  BookOpen,
  LogOut,
  Eye,
  User,
  Clock,
  CheckCircle2,
  Info,
  Wrench
} from 'lucide-react'
import { useAppData } from '../../../context/AppDataContext'
import { useAuth } from '../../../context/AuthContext'
import { useToast } from '../../../context/ToastContext'
import { getDistinctInstituteClassNames, isClassAllowedForTier } from '../../../utils/tierGating'
import { normalizeClassSections } from '../../../constants/academicLevels'
import Modal from '../../../components/common/Modal'

const SHORT_MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

const formatDisplayDate = (iso) => {
  if (!iso) return '—'
  const clean = String(iso).slice(0, 10)
  const parts = clean.split('-')
  if (parts.length !== 3) return clean
  const [y, m, d] = parts
  return `${d.padStart(2, '0')} ${SHORT_MONTHS[Number(m) - 1] || m} ${y}`
}

const formatDisplayTime = (isoOrDate) => {
  if (!isoOrDate) return ''
  const d = new Date(isoOrDate)
  if (Number.isNaN(d.getTime())) return ''
  let h = d.getHours()
  const m = String(d.getMinutes()).padStart(2, '0')
  const ap = h >= 12 ? 'PM' : 'AM'
  h = h % 12 || 12
  return `${String(h).padStart(2, '0')}:${m} ${ap}`
}

const getPromotionsStorageKey = (instId) => `eims_promotions_history_${instId || 'default'}`

const loadPromotionsHistory = (instId) => {
  try {
    const raw = localStorage.getItem(getPromotionsStorageKey(instId))
    const parsed = raw ? JSON.parse(raw) : []
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

const savePromotionsHistory = (instId, items) => {
  try {
    localStorage.setItem(getPromotionsStorageKey(instId), JSON.stringify(items))
  } catch {
    // ignore storage quota errors
  }
}

const QuickHeader = ({ title, onBack, onRouteChange, onOpenQuickPayment }) => (
  <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
    <div>
      <div className="flex items-center gap-2">
        <FileText className="w-5 h-5 text-slate-600" />
        <h1 className="text-xl font-bold text-slate-900 tracking-tight">{title}</h1>
      </div>
      <button
        type="button"
        onClick={onBack}
        className="mt-0.5 inline-flex items-center gap-1 text-xs font-medium text-slate-500 hover:text-slate-800 transition-colors"
      >
        <ArrowLeft className="w-3.5 h-3.5" />
        Back
      </button>
    </div>

    <div className="flex flex-wrap items-center gap-2">
      <button
        type="button"
        onClick={() => onRouteChange?.('inst-admissions-enroll')}
        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold shadow-sm transition-colors"
      >
        <UserPlus className="w-3.5 h-3.5" />
        New Enrollment
      </button>
      <button
        type="button"
        onClick={() => onOpenQuickPayment?.()}
        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-orange-500 hover:bg-orange-600 text-white text-xs font-semibold shadow-sm transition-colors"
      >
        <CreditCard className="w-3.5 h-3.5" />
        Add Payment
      </button>
      <button
        type="button"
        onClick={() => onRouteChange?.('inst-fees-invoices')}
        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold shadow-sm transition-colors"
      >
        <Receipt className="w-3.5 h-3.5" />
        Generate Invoice
      </button>
      <button
        type="button"
        onClick={() => onRouteChange?.('inst-finance-expenses')}
        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 text-xs font-semibold shadow-sm transition-colors"
      >
        <ArrowDownCircle className="w-3.5 h-3.5" />
        Manage Expense
      </button>
      <button
        type="button"
        onClick={() => onRouteChange?.('inst-comm-sms')}
        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 text-xs font-semibold shadow-sm transition-colors"
      >
        <MessageSquare className="w-3.5 h-3.5" />
        Send SMS
      </button>
    </div>
  </div>
)

export const PromotionStatusViews = ({
  mode = 'promote', // 'promote' | 'manage-promotions' | 'graduated' | 'drop-leave'
  currentInstitute,
  onRouteChange,
  onOpenProfile,
  onOpenQuickPayment
}) => {
  const { students = [], classes = [], fees = [], updateItem, logAuditEvent } = useAppData()
  const { user } = useAuth()
  const { toast } = useToast()

  const instId = currentInstitute?.id || 'default'
  const actorName = user?.name || user?.fullName || 'Admin'

  const instStudents = useMemo(
    () =>
      students.filter(
        (s) =>
          (!currentInstitute?.id || !s.instituteId || s.instituteId === currentInstitute.id) &&
          isClassAllowedForTier(s.className, currentInstitute)
      ),
    [students, currentInstitute]
  )

  const availableClasses = useMemo(
    () => getDistinctInstituteClassNames(classes, instStudents, currentInstitute),
    [classes, instStudents, currentInstitute]
  )

  const getSectionsForClass = (clsName) => {
    if (!clsName || clsName === 'Graduated') return []
    const clsObj = classes.find(
      (c) =>
        (!currentInstitute?.id || !c.instituteId || c.instituteId === currentInstitute.id) &&
        (c.name === clsName || c.className === clsName)
    )
    const fromClassObj = clsObj ? normalizeClassSections(clsObj.sections || clsObj.section) : []
    const fromStudents = instStudents
      .filter((s) => s.className === clsName && s.section)
      .map((s) => String(s.section).trim())
    const merged = Array.from(new Set([...fromClassObj, ...fromStudents])).filter(Boolean)
    return merged.length > 0 ? merged : ['A', 'Super']
  }

  // Pending dues lookup per student
  const pendingDueByStudent = useMemo(() => {
    const map = {}
    for (const f of fees) {
      if (currentInstitute?.id && f.instituteId && f.instituteId !== currentInstitute.id) continue
      const sid = f.studentId || f.student_id
      if (!sid) continue
      const status = String(f.status || '').toLowerCase()
      if (status === 'paid' || status === 'cancelled' || status === 'waived') continue
      const total = Number(f.amount ?? f.totalAmount ?? 0)
      const paid = Number(f.paidAmount ?? f.amountPaid ?? 0)
      const due = Math.max(0, total - paid)
      if (due > 0) {
        map[sid] = (map[sid] || 0) + due
      }
    }
    return map
  }, [fees, currentInstitute])

  // Persisted promotion history
  const [promotionsHistory, setPromotionsHistory] = useState(() => loadPromotionsHistory(instId))

  useEffect(() => {
    setPromotionsHistory(loadPromotionsHistory(instId))
  }, [instId])

  const persistPromotions = (updater) => {
    setPromotionsHistory((prev) => {
      const next = typeof updater === 'function' ? updater(prev) : updater
      savePromotionsHistory(instId, next)
      return next
    })
  }

  // ============================================================================
  // 1. PROMOTE STUDENTS STATE
  // ============================================================================
  const [promoteCollapsed, setPromoteCollapsed] = useState(false)
  const [fromClass, setFromClass] = useState('')
  const [fromSection, setFromSection] = useState('')
  const [toClass, setToClass] = useState('')
  const [toSection, setToSection] = useState('')
  const [loadedList, setLoadedList] = useState(null) // null until "Load students" clicked
  const [promoteDecisions, setPromoteDecisions] = useState({}) // { [studentId]: { selected, decision } }
  const [isPromoting, setIsPromoting] = useState(false)

  const fromSections = useMemo(() => getSectionsForClass(fromClass), [fromClass, classes, instStudents])
  const toSections = useMemo(() => getSectionsForClass(toClass), [toClass, classes, instStudents])

  const handleLoadStudents = () => {
    if (!fromClass) {
      toast.warning('Please select a source Class')
      return
    }
    const matching = instStudents.filter((s) => {
      const stStatus = String(s.status || 'Active').toLowerCase()
      if (['graduated', 'dropped', 'left', 'withdrawn'].includes(stStatus)) return false
      if (s.className !== fromClass) return false
      if (fromSection && fromSection !== 'ALL' && String(s.section || '') !== fromSection) return false
      return true
    })

    const defaultDecision = toClass === 'Graduated' ? 'Graduated' : 'Promoted'
    const initialMap = {}
    for (const s of matching) {
      initialMap[s.id] = { selected: true, decision: defaultDecision }
    }
    setPromoteDecisions(initialMap)
    setLoadedList(matching)
    if (matching.length === 0) {
      toast.info(`No active students found in ${fromClass}${fromSection && fromSection !== 'ALL' ? ` (${fromSection})` : ''}`)
    }
  }

  const handleExecutePromotion = async () => {
    if (!loadedList || loadedList.length === 0) return
    const selectedStudents = loadedList.filter((s) => promoteDecisions[s.id]?.selected)
    if (selectedStudents.length === 0) {
      toast.warning('Select at least one student to process')
      return
    }
    const needsTargetClass = selectedStudents.some((s) => promoteDecisions[s.id]?.decision === 'Promoted')
    if (needsTargetClass && !toClass) {
      toast.warning('Please select a destination "To Class"')
      return
    }

    setIsPromoting(true)
    const nowIso = new Date().toISOString()
    const todayDate = nowIso.slice(0, 10)
    const newRecords = []

    for (const s of selectedStudents) {
      const decision = promoteDecisions[s.id]?.decision || 'Promoted'
      const targetCls =
        decision === 'Promoted'
          ? toClass
          : decision === 'Graduated'
            ? s.className
            : s.className
      const targetSec =
        decision === 'Promoted'
          ? toSection || s.section || ''
          : s.section || ''

      newRecords.push({
        id: `prom_${Date.now()}_${s.id}`,
        studentId: s.id,
        studentName: s.name,
        photoUrl: s.photoUrl || '',
        promotedOn: todayDate,
        fromClass: s.className || fromClass,
        fromSection: s.section || fromSection || 'A',
        toClass: decision === 'Graduated' ? 'Graduated' : targetCls,
        toSection: decision === 'Graduated' ? '' : targetSec,
        status: decision,
        promotedBy: actorName
      })

      try {
        if (decision === 'Promoted') {
          await updateItem('students', s.id, {
            className: targetCls,
            section: targetSec
          })
        } else if (decision === 'Graduated') {
          await updateItem('students', s.id, {
            status: 'Graduated',
            graduatedOn: todayDate
          })
        }
      } catch {
        // continue gracefully
      }
    }

    persistPromotions((prev) => [...newRecords, ...prev])
    logAuditEvent?.('STUDENTS_PROMOTED', `Processed ${selectedStudents.length} student promotion(s)`, {
      fromClass,
      toClass
    })
    toast.success(`Processed ${selectedStudents.length} student(s) successfully`)
    setIsPromoting(false)
    setLoadedList(null)
  }

  // ============================================================================
  // 2. MANAGE PROMOTIONS STATE
  // ============================================================================
  const [mpFromClass, setMpFromClass] = useState('ALL')
  const [mpToClass, setMpToClass] = useState('ALL')
  const [mpStatus, setMpStatus] = useState('ALL')
  const [mpFromDate, setMpFromDate] = useState('')
  const [mpToDate, setMpToDate] = useState('')
  const [mpSearch, setMpSearch] = useState('')
  const [mpApplied, setMpApplied] = useState({
    fromClass: 'ALL',
    toClass: 'ALL',
    status: 'ALL',
    fromDate: '',
    toDate: '',
    search: ''
  })
  const [resetTarget, setResetTarget] = useState(null)

  const filteredPromotions = useMemo(() => {
    return promotionsHistory.filter((rec) => {
      if (mpApplied.fromClass !== 'ALL' && rec.fromClass !== mpApplied.fromClass) return false
      if (mpApplied.toClass !== 'ALL' && rec.toClass !== mpApplied.toClass) return false
      if (mpApplied.status !== 'ALL' && rec.status !== mpApplied.status) return false
      if (mpApplied.fromDate && String(rec.promotedOn || '') < mpApplied.fromDate) return false
      if (mpApplied.toDate && String(rec.promotedOn || '') > mpApplied.toDate) return false
      if (mpApplied.search.trim()) {
        const q = mpApplied.search.trim().toLowerCase()
        if (!String(rec.studentName || '').toLowerCase().includes(q)) return false
      }
      return true
    })
  }, [promotionsHistory, mpApplied])

  const mpCounts = useMemo(() => {
    const total = filteredPromotions.length
    const promoted = filteredPromotions.filter((r) => r.status === 'Promoted').length
    const notPromoted = filteredPromotions.filter((r) => r.status === 'Not promoted').length
    const graduated = filteredPromotions.filter((r) => r.status === 'Graduated').length
    return { total, promoted, notPromoted, graduated }
  }, [filteredPromotions])

  const handleConfirmResetPromotion = async () => {
    if (!resetTarget) return
    try {
      await updateItem('students', resetTarget.studentId, {
        className: resetTarget.fromClass,
        section: resetTarget.fromSection,
        status: 'Active'
      })
    } catch {
      // ignore if student removed
    }
    persistPromotions((prev) => prev.filter((r) => r.id !== resetTarget.id))
    toast.success(`Reset promotion for ${resetTarget.studentName} back to ${resetTarget.fromClass}`)
    setResetTarget(null)
  }

  // ============================================================================
  // 3. GRADUATED STUDENTS STATE
  // ============================================================================
  const [gradClassFilter, setGradClassFilter] = useState('ALL')
  const [gradFromDate, setGradFromDate] = useState('')
  const [gradToDate, setGradToDate] = useState('')
  const [gradSearch, setGradSearch] = useState('')
  const [gradTabClass, setGradTabClass] = useState('ALL')

  const graduatedStudents = useMemo(() => {
    return instStudents.filter((s) => {
      if (String(s.status || '').toLowerCase() !== 'graduated') return false
      if (gradClassFilter !== 'ALL' && s.className !== gradClassFilter) return false
      const gDate = String(s.graduatedOn || s.updatedAt || '').slice(0, 10)
      if (gradFromDate && gDate && gDate < gradFromDate) return false
      if (gradToDate && gDate && gDate > gradToDate) return false
      if (gradSearch.trim()) {
        const q = gradSearch.trim().toLowerCase()
        const match =
          (s.name || '').toLowerCase().includes(q) ||
          (s.admissionNo || '').toLowerCase().includes(q) ||
          (s.rollNumber || '').toLowerCase().includes(q)
        if (!match) return false
      }
      return true
    })
  }, [instStudents, gradClassFilter, gradFromDate, gradToDate, gradSearch])

  const gradDisplayed = useMemo(() => {
    if (gradTabClass === 'ALL') return graduatedStudents
    return graduatedStudents.filter((s) => s.className === gradTabClass)
  }, [graduatedStudents, gradTabClass])

  const gradKpis = useMemo(() => {
    let totalDue = 0
    let withDue = 0
    const clsSet = new Set()
    for (const s of gradDisplayed) {
      const due = pendingDueByStudent[s.id] || 0
      totalDue += due
      if (due > 0) withDue += 1
      if (s.className) clsSet.add(s.className)
    }
    return {
      count: gradDisplayed.length,
      totalDue,
      withDue,
      classesCount: clsSet.size
    }
  }, [gradDisplayed, pendingDueByStudent])

  // ============================================================================
  // 4. DROP / LEAVE STUDENTS STATE
  // ============================================================================
  const [dropClassFilter, setDropClassFilter] = useState('ALL')
  const [dropSearch, setDropSearch] = useState('')
  const [dropModalOpen, setDropModalOpen] = useState(false)
  const [dropForm, setDropForm] = useState({
    studentId: '',
    droppedOn: new Date().toISOString().slice(0, 10),
    reason: ''
  })
  const [dropStudentSearch, setDropStudentSearch] = useState('')
  const [dropDetailStudent, setDropDetailStudent] = useState(null)

  const droppedStudents = useMemo(() => {
    return instStudents.filter((s) => {
      const st = String(s.status || '').toLowerCase()
      if (!['dropped', 'left', 'withdrawn', 'inactive'].includes(st)) return false
      if (dropClassFilter !== 'ALL' && s.className !== dropClassFilter) return false
      if (dropSearch.trim()) {
        const q = dropSearch.trim().toLowerCase()
        const match =
          (s.name || '').toLowerCase().includes(q) ||
          (s.admissionNo || '').toLowerCase().includes(q) ||
          (s.rollNumber || '').toLowerCase().includes(q)
        if (!match) return false
      }
      return true
    })
  }, [instStudents, dropClassFilter, dropSearch])

  const dropKpis = useMemo(() => {
    let totalDue = 0
    let withDue = 0
    for (const s of droppedStudents) {
      const due = pendingDueByStudent[s.id] || 0
      totalDue += due
      if (due > 0) withDue += 1
    }
    return {
      count: droppedStudents.length,
      totalDue,
      withDue,
      classesCount: availableClasses.length
    }
  }, [droppedStudents, pendingDueByStudent, availableClasses])

  const activeStudentsForDrop = useMemo(
    () =>
      instStudents.filter((s) => {
        const st = String(s.status || 'Active').toLowerCase()
        return !['dropped', 'left', 'withdrawn', 'graduated'].includes(st)
      }),
    [instStudents]
  )

  const handleConfirmDropStudent = async (e) => {
    e.preventDefault()
    if (!dropForm.studentId) {
      toast.warning('Please select a student')
      return
    }
    const target = instStudents.find((s) => s.id === dropForm.studentId)
    try {
      await updateItem('students', dropForm.studentId, {
        status: 'Dropped',
        droppedOn: dropForm.droppedOn || new Date().toISOString().slice(0, 10),
        droppedAt: new Date().toISOString(),
        droppedBy: actorName,
        dropReason: dropForm.reason.trim() || 'Left / Withdrawn'
      })
      logAuditEvent?.('STUDENT_DROPPED', `Marked ${target?.name || 'student'} as Dropped / Left`, {
        studentId: dropForm.studentId,
        reason: dropForm.reason
      })
      toast.success(`${target?.name || 'Student'} marked as Dropped / Left`)
      setDropModalOpen(false)
      setDropForm({ studentId: '', droppedOn: new Date().toISOString().slice(0, 10), reason: '' })
      setDropStudentSearch('')
    } catch {
      toast.error('Failed to update student status')
    }
  }

  const handleRestoreStudent = async (student) => {
    try {
      await updateItem('students', student.id, {
        status: 'Active',
        droppedOn: null,
        droppedAt: null,
        droppedBy: null,
        dropReason: null,
        graduatedOn: null
      })
      toast.success(`Restored ${student.name} to Active status`)
      setDropDetailStudent(null)
    } catch {
      toast.error('Failed to restore student')
    }
  }

  // ============================================================================
  // RENDER BY MODE
  // ============================================================================
  if (mode === 'promote') {
    const selectedCount = loadedList
      ? loadedList.filter((s) => promoteDecisions[s.id]?.selected).length
      : 0

    return (
      <div className="p-4 sm:p-6 space-y-5 max-w-[1440px] mx-auto">
        <QuickHeader
          title="Promote Students"
          onBack={() => onRouteChange?.('inst-students')}
          onRouteChange={onRouteChange}
          onOpenQuickPayment={onOpenQuickPayment}
        />

        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          <div
            onClick={() => setPromoteCollapsed((p) => !p)}
            className="px-5 py-3 bg-[#2c3e50] text-white flex items-center justify-between cursor-pointer select-none"
          >
            <div className="flex items-center gap-2 text-sm font-semibold">
              <Wrench className="w-4 h-4 text-slate-300" />
              Promote students
            </div>
            {promoteCollapsed ? (
              <ChevronDown className="w-4 h-4 text-slate-300" />
            ) : (
              <ChevronUp className="w-4 h-4 text-slate-300" />
            )}
          </div>

          {!promoteCollapsed && (
            <div className="p-6 space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-[1fr_auto_1fr] items-center gap-4">
                {/* From Card */}
                <div className="border border-slate-200 border-l-4 border-l-rose-500 rounded-lg p-5 bg-white shadow-sm">
                  <div className="flex items-center gap-1.5 text-rose-600 text-xs font-bold mb-4">
                    <ArrowLeft className="w-3.5 h-3.5" />
                    From
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-700 mb-1.5">
                        Class <span className="text-rose-500">*</span>
                      </label>
                      <select
                        value={fromClass}
                        onChange={(e) => {
                          setFromClass(e.target.value)
                          setFromSection('')
                          setLoadedList(null)
                        }}
                        className="w-full px-3 py-2 text-xs rounded-md border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="">Select class</option>
                        {availableClasses.map((c) => (
                          <option key={c} value={c}>
                            {c}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-700 mb-1.5">
                        Section <span className="text-rose-500">*</span>
                      </label>
                      <select
                        disabled={!fromClass}
                        value={fromSection}
                        onChange={(e) => {
                          setFromSection(e.target.value)
                          setLoadedList(null)
                        }}
                        className="w-full px-3 py-2 text-xs rounded-md border border-slate-200 bg-white disabled:bg-slate-50 disabled:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="">{fromClass ? 'All sections' : 'Select class first'}</option>
                        {fromSections.map((sec) => (
                          <option key={sec} value={sec}>
                            {sec}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>

                {/* Center Arrow */}
                <div className="flex justify-center">
                  <ArrowRight className="w-5 h-5 text-slate-500 hidden lg:block" />
                </div>

                {/* To Card */}
                <div className="border border-slate-200 border-l-4 border-l-emerald-500 rounded-lg p-5 bg-white shadow-sm">
                  <div className="flex items-center gap-1.5 text-emerald-600 text-xs font-bold mb-4">
                    <ArrowRight className="w-3.5 h-3.5" />
                    To
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-700 mb-1.5">
                        Class <span className="text-rose-500">*</span>
                      </label>
                      <select
                        value={toClass}
                        onChange={(e) => {
                          setToClass(e.target.value)
                          setToSection('')
                        }}
                        className="w-full px-3 py-2 text-xs rounded-md border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="">Select class</option>
                        {availableClasses.map((c) => (
                          <option key={c} value={c}>
                            {c}
                          </option>
                        ))}
                        <option value="Graduated">Graduated (Alumni)</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-700 mb-1.5">
                        Section <span className="text-rose-500">*</span>
                      </label>
                      <select
                        disabled={!toClass || toClass === 'Graduated'}
                        value={toSection}
                        onChange={(e) => setToSection(e.target.value)}
                        className="w-full px-3 py-2 text-xs rounded-md border border-slate-200 bg-white disabled:bg-slate-50 disabled:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="">
                          {!toClass
                            ? 'Select class first'
                            : toClass === 'Graduated'
                              ? 'N/A (Graduating)'
                              : 'Keep current / Default'}
                        </option>
                        {toSections.map((sec) => (
                          <option key={sec} value={sec}>
                            {sec}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex justify-center">
                <button
                  type="button"
                  onClick={handleLoadStudents}
                  className="inline-flex items-center gap-2 px-5 py-2 rounded-md bg-blue-500 hover:bg-blue-600 text-white text-xs font-semibold shadow-sm transition-colors"
                >
                  <Users className="w-4 h-4" />
                  Load students
                </button>
              </div>

              {/* Loaded Students List */}
              {loadedList !== null && (
                <div className="border-t border-slate-200 pt-5 space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div className="text-xs font-semibold text-slate-700">
                      Loaded {loadedList.length} active student(s) from{' '}
                      <span className="text-slate-900">{fromClass}</span>
                      {fromSection ? ` (${fromSection})` : ''}
                    </div>
                    {loadedList.length > 0 && (
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => {
                            const allSelected = selectedCount === loadedList.length
                            setPromoteDecisions((prev) => {
                              const next = { ...prev }
                              for (const s of loadedList) {
                                next[s.id] = { ...next[s.id], selected: !allSelected }
                              }
                              return next
                            })
                          }}
                          className="px-2.5 py-1 rounded border border-slate-200 text-xs font-medium text-slate-600 hover:bg-slate-50"
                        >
                          {selectedCount === loadedList.length ? 'Deselect All' : 'Select All'}
                        </button>
                        <button
                          type="button"
                          disabled={isPromoting || selectedCount === 0}
                          onClick={handleExecutePromotion}
                          className="px-4 py-1.5 rounded-md bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white text-xs font-semibold shadow-sm transition-colors"
                        >
                          {isPromoting ? 'Processing...' : `Confirm Promotion (${selectedCount})`}
                        </button>
                      </div>
                    )}
                  </div>

                  {loadedList.length === 0 ? (
                    <div className="py-10 text-center text-xs text-slate-400 bg-slate-50 rounded-lg border border-dashed border-slate-200">
                      No active students found in this class/section.
                    </div>
                  ) : (
                    <div className="overflow-x-auto border border-slate-200 rounded-lg">
                      <table className="w-full text-left text-xs border-collapse">
                        <thead>
                          <tr className="bg-slate-50 border-b border-slate-200 text-[11px] font-semibold text-slate-600">
                            <th className="py-2.5 px-3 w-10 text-center">✓</th>
                            <th className="py-2.5 px-3">ROLL</th>
                            <th className="py-2.5 px-3">STUDENT</th>
                            <th className="py-2.5 px-3">CURRENT CLASS</th>
                            <th className="py-2.5 px-3">PENDING DUE</th>
                            <th className="py-2.5 px-3">DECISION</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                          {loadedList.map((st) => {
                            const stState = promoteDecisions[st.id] || { selected: true, decision: 'Promoted' }
                            const due = pendingDueByStudent[st.id] || 0
                            return (
                              <tr key={st.id} className="hover:bg-slate-50">
                                <td className="py-2.5 px-3 text-center">
                                  <input
                                    type="checkbox"
                                    checked={stState.selected}
                                    onChange={(e) =>
                                      setPromoteDecisions((prev) => ({
                                        ...prev,
                                        [st.id]: { ...stState, selected: e.target.checked }
                                      }))
                                    }
                                    className="rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                                  />
                                </td>
                                <td className="py-2.5 px-3 text-slate-600">{st.rollNumber || '—'}</td>
                                <td className="py-2.5 px-3 font-semibold text-slate-800">{st.name}</td>
                                <td className="py-2.5 px-3 text-slate-600">
                                  {st.className} {st.section ? `• ${st.section}` : ''}
                                </td>
                                <td className="py-2.5 px-3">
                                  {due > 0 ? (
                                    <span className="px-2 py-0.5 rounded bg-orange-50 text-orange-700 border border-orange-200 font-semibold text-[11px]">
                                      PKR {due.toLocaleString()}
                                    </span>
                                  ) : (
                                    <span className="text-emerald-600 font-medium">Cleared</span>
                                  )}
                                </td>
                                <td className="py-2.5 px-3">
                                  <select
                                    value={stState.decision}
                                    onChange={(e) =>
                                      setPromoteDecisions((prev) => ({
                                        ...prev,
                                        [st.id]: { ...stState, decision: e.target.value }
                                      }))
                                    }
                                    className="px-2.5 py-1 rounded border border-slate-200 bg-white text-xs focus:outline-none focus:ring-1 focus:ring-blue-500"
                                  >
                                    <option value="Promoted">Promote to {toClass || 'Target'}</option>
                                    <option value="Not promoted">Not promoted (Retain)</option>
                                    <option value="Graduated">Mark Graduated</option>
                                  </select>
                                </td>
                              </tr>
                            )
                          })}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    )
  }

  if (mode === 'manage-promotions') {
    return (
      <div className="p-4 sm:p-6 space-y-5 max-w-[1440px] mx-auto">
        <QuickHeader
          title="Manage Promotions"
          onBack={() => onRouteChange?.('inst-students-promote')}
          onRouteChange={onRouteChange}
          onOpenQuickPayment={onOpenQuickPayment}
        />

        {/* Filters Card */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="px-5 py-3 bg-[#2c3e50] text-white flex items-center justify-between">
            <div className="flex items-center gap-2 text-sm font-semibold">
              <Filter className="w-4 h-4 text-slate-300" />
              Filters
            </div>
            <span className="text-xs text-slate-200 font-medium">{filteredPromotions.length} record(s)</span>
          </div>

          <div className="p-5 space-y-2.5">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-[1fr_1fr_1fr_1fr_1fr_1.4fr_auto] gap-3 items-end">
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1">
                  FROM CLASS
                </label>
                <select
                  value={mpFromClass}
                  onChange={(e) => setMpFromClass(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-md border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="ALL">All</option>
                  {availableClasses.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1">
                  TO CLASS
                </label>
                <select
                  value={mpToClass}
                  onChange={(e) => setMpToClass(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-md border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="ALL">All</option>
                  {availableClasses.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                  <option value="Graduated">Graduated</option>
                </select>
              </div>
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1">
                  STATUS
                </label>
                <select
                  value={mpStatus}
                  onChange={(e) => setMpStatus(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-md border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="ALL">All</option>
                  <option value="Promoted">Promoted</option>
                  <option value="Not promoted">Not promoted</option>
                  <option value="Graduated">Graduated</option>
                </select>
              </div>
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1">
                  FROM DATE
                </label>
                <input
                  type="date"
                  value={mpFromDate}
                  onChange={(e) => setMpFromDate(e.target.value)}
                  className="w-full px-2.5 py-2 text-xs rounded-md border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1">
                  TO DATE
                </label>
                <input
                  type="date"
                  value={mpToDate}
                  onChange={(e) => setMpToDate(e.target.value)}
                  className="w-full px-2.5 py-2 text-xs rounded-md border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1">
                  SEARCH STUDENT
                </label>
                <input
                  type="text"
                  value={mpSearch}
                  onChange={(e) => setMpSearch(e.target.value)}
                  placeholder="Student name..."
                  className="w-full px-3 py-2 text-xs rounded-md border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() =>
                    setMpApplied({
                      fromClass: mpFromClass,
                      toClass: mpToClass,
                      status: mpStatus,
                      fromDate: mpFromDate,
                      toDate: mpToDate,
                      search: mpSearch
                    })
                  }
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-md bg-[#2c3e50] hover:bg-slate-800 text-white text-xs font-semibold transition-colors"
                >
                  <Search className="w-3.5 h-3.5" />
                  Filter
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setMpFromClass('ALL')
                    setMpToClass('ALL')
                    setMpStatus('ALL')
                    setMpFromDate('')
                    setMpToDate('')
                    setMpSearch('')
                    setMpApplied({
                      fromClass: 'ALL',
                      toClass: 'ALL',
                      status: 'ALL',
                      fromDate: '',
                      toDate: '',
                      search: ''
                    })
                  }}
                  title="Clear filters"
                  className="p-2 rounded-md border border-slate-200 text-slate-600 hover:bg-slate-50 transition-colors"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            <div className="flex items-center gap-1.5 text-[11px] text-slate-500">
              <Info className="w-3.5 h-3.5 text-slate-400" />
              Showing session promotion history. Clear the dates to see all records.
            </div>
          </div>
        </div>

        {/* Promotion Records Card */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="px-5 py-3 bg-[#2c3e50] text-white flex items-center gap-2 text-sm font-semibold">
            <List className="w-4 h-4 text-slate-300" />
            Promotion records
          </div>

          <div className="p-5 space-y-4">
            {/* 4 Summary Stat Boxes */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
              <div className="border border-slate-200 rounded-lg py-3 px-4 text-center">
                <div className="text-lg font-bold text-slate-800">{mpCounts.total}</div>
                <div className="text-[10px] font-semibold uppercase tracking-wider text-slate-500">TOTAL</div>
              </div>
              <div className="border border-slate-200 rounded-lg py-3 px-4 text-center">
                <div className="text-lg font-bold text-emerald-600">{mpCounts.promoted}</div>
                <div className="text-[10px] font-semibold uppercase tracking-wider text-slate-500">PROMOTED</div>
              </div>
              <div className="border border-slate-200 rounded-lg py-3 px-4 text-center">
                <div className="text-lg font-bold text-rose-600">{mpCounts.notPromoted}</div>
                <div className="text-[10px] font-semibold uppercase tracking-wider text-slate-500">
                  NOT PROMOTED
                </div>
              </div>
              <div className="border border-slate-200 rounded-lg py-3 px-4 text-center">
                <div className="text-lg font-bold text-blue-600">{mpCounts.graduated}</div>
                <div className="text-[10px] font-semibold uppercase tracking-wider text-slate-500">
                  GRADUATED
                </div>
              </div>
            </div>

            {/* Records Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-200 text-[10px] font-bold uppercase tracking-wider text-slate-500">
                    <th className="py-2.5 px-3 w-12">#</th>
                    <th className="py-2.5 px-3 w-16">PHOTO</th>
                    <th className="py-2.5 px-3">STUDENT NAME</th>
                    <th className="py-2.5 px-3">PROMOTED ON</th>
                    <th className="py-2.5 px-3">FROM CLASS / SECTION</th>
                    <th className="py-2.5 px-3">TO CLASS / SECTION</th>
                    <th className="py-2.5 px-3">STATUS</th>
                    <th className="py-2.5 px-3 text-right">ACTION</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-xs">
                  {filteredPromotions.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="py-12 text-center text-slate-400">
                        No promotion records found. Use <strong>Promote Students</strong> to promote a class.
                      </td>
                    </tr>
                  ) : (
                    filteredPromotions.map((rec, idx) => (
                      <tr key={rec.id} className="hover:bg-slate-50/70">
                        <td className="py-3 px-3 text-slate-500">{idx + 1}</td>
                        <td className="py-3 px-3">
                          {rec.photoUrl ? (
                            <img
                              src={rec.photoUrl}
                              alt={rec.studentName}
                              className="w-8 h-8 rounded-full object-cover border border-slate-200"
                            />
                          ) : (
                            <div className="w-8 h-8 rounded-full bg-teal-700 text-white flex items-center justify-center">
                              <User className="w-4 h-4" />
                            </div>
                          )}
                        </td>
                        <td className="py-3 px-3">
                          <button
                            type="button"
                            onClick={() => onOpenProfile?.(rec.studentId)}
                            className="font-semibold text-slate-800 hover:text-blue-600 hover:underline text-left"
                          >
                            {rec.studentName}
                          </button>
                        </td>
                        <td className="py-3 px-3 text-slate-600">{formatDisplayDate(rec.promotedOn)}</td>
                        <td className="py-3 px-3">
                          <div className="font-semibold text-slate-800">{rec.fromClass || '—'}</div>
                          <div className="text-[11px] text-slate-400">{rec.fromSection || '—'}</div>
                        </td>
                        <td className="py-3 px-3">
                          <div className="font-semibold text-slate-800">{rec.toClass || '—'}</div>
                          <div className="text-[11px] text-slate-400">{rec.toSection || '—'}</div>
                        </td>
                        <td className="py-3 px-3">
                          <span
                            className={`inline-block px-2.5 py-0.5 rounded-full text-[11px] font-semibold ${
                              rec.status === 'Promoted'
                                ? 'bg-emerald-100 text-emerald-700'
                                : rec.status === 'Graduated'
                                  ? 'bg-blue-100 text-blue-700'
                                  : 'bg-rose-100 text-rose-700'
                            }`}
                          >
                            {rec.status}
                          </span>
                        </td>
                        <td className="py-3 px-3 text-right">
                          <button
                            type="button"
                            onClick={() => setResetTarget(rec)}
                            className="inline-flex items-center gap-1 px-2.5 py-1 rounded border border-rose-200 bg-white hover:bg-rose-50 text-rose-600 text-[11px] font-semibold transition-colors"
                          >
                            <RotateCcw className="w-3 h-3" />
                            Reset
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Reset Confirmation Modal */}
        {resetTarget && (
          <Modal
            isOpen
            onClose={() => setResetTarget(null)}
            title="Reset Promotion"
            maxWidth="max-w-sm"
          >
            <div className="space-y-4 text-xs">
              <p className="text-slate-600">
                Revert <strong className="text-slate-900">{resetTarget.studentName}</strong> back to{' '}
                <strong>{resetTarget.fromClass}</strong> ({resetTarget.fromSection || 'Default'})?
              </p>
              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setResetTarget(null)}
                  className="px-3.5 py-1.5 rounded-lg border border-slate-200 text-slate-600 font-semibold hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleConfirmResetPromotion}
                  className="px-4 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-700 text-white font-semibold"
                >
                  Confirm Reset
                </button>
              </div>
            </div>
          </Modal>
        )}
      </div>
    )
  }

  if (mode === 'graduated') {
    const classCounts = graduatedStudents.reduce((acc, s) => {
      const c = s.className || 'Other'
      acc[c] = (acc[c] || 0) + 1
      return acc
    }, {})

    return (
      <div className="p-4 sm:p-6 space-y-5 max-w-[1440px] mx-auto">
        <QuickHeader
          title="Graduated Students"
          onBack={() => onRouteChange?.('inst-students')}
          onRouteChange={onRouteChange}
          onOpenQuickPayment={onOpenQuickPayment}
        />

        {/* 4 KPI Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-4 flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-lg bg-blue-600 text-white flex items-center justify-center shrink-0">
              <GraduationCap className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs font-medium text-slate-500">Graduated</p>
              <p className="text-xl font-bold text-slate-900 leading-tight">{gradKpis.count}</p>
              <p className="text-[11px] text-slate-400">Matching current filters</p>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-4 flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-lg bg-orange-500 text-white flex items-center justify-center shrink-0">
              <Wallet className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs font-medium text-slate-500">Total Pending Due</p>
              <p className="text-xl font-bold text-slate-900 leading-tight">
                {gradKpis.totalDue.toLocaleString()} <span className="text-xs font-semibold text-slate-500">PKR</span>
              </p>
              <p className="text-[11px] text-slate-400">Unpaid on graduated list</p>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-4 flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-lg bg-rose-600 text-white flex items-center justify-center shrink-0">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs font-medium text-slate-500">With Pending Due</p>
              <p className="text-xl font-bold text-slate-900 leading-tight">{gradKpis.withDue}</p>
              <p className="text-[11px] text-slate-400">Students still owing fees</p>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-4 flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-lg bg-emerald-600 text-white flex items-center justify-center shrink-0">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs font-medium text-slate-500">Classes</p>
              <p className="text-xl font-bold text-slate-900 leading-tight">{gradKpis.classesCount}</p>
              <p className="text-[11px] text-slate-400">With graduates in range</p>
            </div>
          </div>
        </div>

        {/* Graduated Students Card */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="px-5 py-3 bg-[#2c3e50] text-white flex items-center justify-between">
            <div className="flex items-center gap-2 text-sm font-semibold">
              <GraduationCap className="w-4 h-4 text-slate-300" />
              Graduated Students
            </div>
            <div className="flex items-center gap-3">
              <span className="text-xs text-slate-200">{gradDisplayed.length} result(s)</span>
              <button
                type="button"
                onClick={() => onRouteChange?.('inst-students-drop-leave')}
                className="inline-flex items-center gap-1.5 px-3 py-1 rounded bg-slate-600/80 hover:bg-slate-600 text-white text-xs font-semibold transition-colors"
              >
                <LogOut className="w-3.5 h-3.5" />
                Drop / Leave
              </button>
            </div>
          </div>

          <div className="p-5 space-y-4">
            {/* Filters */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-[1fr_1fr_1fr_1.6fr_auto] gap-3 items-end">
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1">
                  CLASS
                </label>
                <select
                  value={gradClassFilter}
                  onChange={(e) => setGradClassFilter(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-md border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="ALL">All classes</option>
                  {availableClasses.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1">
                  FROM DATE
                </label>
                <input
                  type="date"
                  value={gradFromDate}
                  onChange={(e) => setGradFromDate(e.target.value)}
                  className="w-full px-2.5 py-2 text-xs rounded-md border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1">
                  TO DATE
                </label>
                <input
                  type="date"
                  value={gradToDate}
                  onChange={(e) => setGradToDate(e.target.value)}
                  className="w-full px-2.5 py-2 text-xs rounded-md border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1">
                  SEARCH STUDENT
                </label>
                <input
                  type="text"
                  value={gradSearch}
                  onChange={(e) => setGradSearch(e.target.value)}
                  placeholder="Name or ADM no..."
                  className="w-full px-3 py-2 text-xs rounded-md border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => {}}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-md bg-[#2c3e50] hover:bg-slate-800 text-white text-xs font-semibold transition-colors"
                >
                  <Search className="w-3.5 h-3.5" />
                  Filter
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setGradClassFilter('ALL')
                    setGradFromDate('')
                    setGradToDate('')
                    setGradSearch('')
                    setGradTabClass('ALL')
                  }}
                  title="Clear filters"
                  className="p-2 rounded-md border border-slate-200 text-slate-600 hover:bg-slate-50 transition-colors"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            <div className="flex items-center gap-1.5 text-[11px] text-slate-500">
              <Info className="w-3.5 h-3.5 text-slate-400" />
              Showing graduated students. Clear the dates to see all.
            </div>

            {/* Class Pills */}
            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={() => setGradTabClass('ALL')}
                className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-md text-xs font-semibold transition-colors ${
                  gradTabClass === 'ALL'
                    ? 'bg-[#2c3e50] text-white'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                All
                <span className="px-1.5 py-0.2 rounded-full bg-white/20 text-[10px]">
                  {graduatedStudents.length}
                </span>
              </button>
              {Object.entries(classCounts).map(([cls, cnt]) => (
                <button
                  key={cls}
                  type="button"
                  onClick={() => setGradTabClass(cls)}
                  className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-md text-xs font-semibold transition-colors ${
                    gradTabClass === cls
                      ? 'bg-[#2c3e50] text-white'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {cls}
                  <span className="px-1.5 py-0.2 rounded-full bg-black/10 text-[10px]">{cnt}</span>
                </button>
              ))}
            </div>

            {/* Empty State or Table */}
            {gradDisplayed.length === 0 ? (
              <div className="py-16 text-center space-y-2">
                <GraduationCap className="w-10 h-10 text-slate-300 mx-auto" />
                <div className="text-sm font-bold text-slate-700">No graduated students found</div>
                <p className="text-xs text-slate-400">
                  No records match your filters. Try a wider date range or clear filters.
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-slate-200 text-[10px] font-bold uppercase tracking-wider text-slate-500">
                      <th className="py-2.5 px-3 w-12">#</th>
                      <th className="py-2.5 px-3 w-16">PHOTO</th>
                      <th className="py-2.5 px-3">STUDENT NAME</th>
                      <th className="py-2.5 px-3">CLASS</th>
                      <th className="py-2.5 px-3">GRADUATED ON</th>
                      <th className="py-2.5 px-3">PENDING DUE</th>
                      <th className="py-2.5 px-3 text-right">ACTION</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-xs">
                    {gradDisplayed.map((s, idx) => {
                      const due = pendingDueByStudent[s.id] || 0
                      return (
                        <tr key={s.id} className="hover:bg-slate-50/70">
                          <td className="py-3 px-3 text-slate-500">{idx + 1}</td>
                          <td className="py-3 px-3">
                            <div className="w-8 h-8 rounded-full bg-teal-700 text-white flex items-center justify-center">
                              <User className="w-4 h-4" />
                            </div>
                          </td>
                          <td className="py-3 px-3">
                            <div className="font-semibold text-slate-800">{s.name}</div>
                            <div className="text-[11px] text-slate-400">
                              Roll: {s.rollNumber || '—'} • Adm: {s.admissionNo || '—'}
                            </div>
                          </td>
                          <td className="py-3 px-3">
                            <span className="px-2 py-0.5 rounded bg-indigo-50 text-indigo-700 font-semibold text-[11px]">
                              {s.className || '—'}
                            </span>
                          </td>
                          <td className="py-3 px-3 text-slate-600">
                            {formatDisplayDate(s.graduatedOn || s.updatedAt)}
                          </td>
                          <td className="py-3 px-3">
                            {due > 0 ? (
                              <span className="px-2 py-0.5 rounded bg-orange-50 text-orange-700 border border-orange-200 font-semibold text-[11px]">
                                PKR {due.toLocaleString()}
                              </span>
                            ) : (
                              <span className="text-emerald-600 font-medium">PKR 0</span>
                            )}
                          </td>
                          <td className="py-3 px-3 text-right space-x-1.5">
                            <button
                              type="button"
                              onClick={() => onOpenProfile?.(s.id)}
                              className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-[#2c3e50] text-white text-[11px] font-semibold"
                            >
                              <User className="w-3 h-3" />
                              Profile
                            </button>
                            <button
                              type="button"
                              onClick={() => handleRestoreStudent(s)}
                              className="inline-flex items-center gap-1 px-2.5 py-1 rounded border border-slate-200 text-slate-600 hover:bg-slate-50 text-[11px] font-semibold"
                            >
                              <RotateCcw className="w-3 h-3" />
                              Restore
                            </button>
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>
    )
  }

  // ============================================================================
  // MODE: DROP / LEAVE STUDENTS
  // ============================================================================
  return (
    <div className="p-4 sm:p-6 space-y-5 max-w-[1440px] mx-auto">
      <QuickHeader
        title="Drop / Leave Students"
        onBack={() => onRouteChange?.('inst-students')}
        onRouteChange={onRouteChange}
        onOpenQuickPayment={onOpenQuickPayment}
      />

      {/* 4 KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-4 flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-lg bg-rose-600 text-white flex items-center justify-center shrink-0">
            <LogOut className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs font-medium text-slate-500">Dropped / Left</p>
            <p className="text-xl font-bold text-slate-900 leading-tight">{dropKpis.count}</p>
            <p className="text-[11px] text-slate-400">Matching current filters</p>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-4 flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-lg bg-orange-500 text-white flex items-center justify-center shrink-0">
            <Wallet className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs font-medium text-slate-500">Total Pending Due</p>
            <p className="text-xl font-bold text-slate-900 leading-tight">
              {dropKpis.totalDue.toLocaleString()} <span className="text-xs font-semibold text-slate-500">PKR</span>
            </p>
            <p className="text-[11px] text-slate-400">Unpaid on dropped students</p>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-4 flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-lg bg-rose-600 text-white flex items-center justify-center shrink-0">
            <AlertTriangle className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs font-medium text-slate-500">With Pending Due</p>
            <p className="text-xl font-bold text-slate-900 leading-tight">{dropKpis.withDue}</p>
            <p className="text-[11px] text-slate-400">Students still owing fees</p>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-4 flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-lg bg-blue-600 text-white flex items-center justify-center shrink-0">
            <BookOpen className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs font-medium text-slate-500">Classes</p>
            <p className="text-xl font-bold text-slate-900 leading-tight">{dropKpis.classesCount}</p>
            <p className="text-[11px] text-slate-400">In school</p>
          </div>
        </div>
      </div>

      {/* Dropped / Left Students Card */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="px-5 py-3 bg-[#2c3e50] text-white flex items-center justify-between">
          <div className="flex items-center gap-2 text-sm font-semibold">
            <LogOut className="w-4 h-4 text-slate-300" />
            Dropped / Left Students
          </div>
          <button
            type="button"
            onClick={() => setDropModalOpen(true)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold shadow-sm transition-colors"
          >
            <UserPlus className="w-3.5 h-3.5" />
            Drop Student
          </button>
        </div>

        <div className="p-5 space-y-4">
          {/* Filter row */}
          <div className="grid grid-cols-1 md:grid-cols-[1fr_1.6fr_auto] gap-3 items-end">
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1">
                FILTER BY CLASS
              </label>
              <select
                value={dropClassFilter}
                onChange={(e) => setDropClassFilter(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-md border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="ALL">All Classes</option>
                {availableClasses.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1">
                SEARCH STUDENT
              </label>
              <input
                type="text"
                value={dropSearch}
                onChange={(e) => setDropSearch(e.target.value)}
                placeholder="Name or ADM No..."
                className="w-full px-3 py-2 text-xs rounded-md border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <button
              type="button"
              onClick={() => {}}
              aria-label="Search"
              className="px-3.5 py-2 rounded-md bg-[#2c3e50] hover:bg-slate-800 text-white flex items-center justify-center transition-colors"
            >
              <Search className="w-4 h-4" />
            </button>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-200 text-[10px] font-bold uppercase tracking-wider text-slate-500">
                  <th className="py-2.5 px-3 w-12">#</th>
                  <th className="py-2.5 px-3 w-16">PHOTO</th>
                  <th className="py-2.5 px-3 min-w-[230px]">STUDENT NAME</th>
                  <th className="py-2.5 px-3">CLASS</th>
                  <th className="py-2.5 px-3">DROPPED ON</th>
                  <th className="py-2.5 px-3">DROPPED BY</th>
                  <th className="py-2.5 px-3 min-w-[160px]">REASON</th>
                  <th className="py-2.5 px-3 text-right">ACTION</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs">
                {droppedStudents.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="py-12 text-center text-slate-400">
                      No dropped or left students found. Click <strong>Drop Student</strong> to record a withdrawal.
                    </td>
                  </tr>
                ) : (
                  droppedStudents.map((s, idx) => {
                    const due = pendingDueByStudent[s.id] || 0
                    const parentName = s.guardianName || s.fatherName
                    const droppedDate = formatDisplayDate(s.droppedOn || s.updatedAt)
                    const droppedTime = formatDisplayTime(s.droppedAt)

                    return (
                      <tr key={s.id} className="hover:bg-slate-50/70">
                        <td className="py-3.5 px-3 text-slate-500">{idx + 1}</td>
                        <td className="py-3.5 px-3">
                          {s.photoUrl ? (
                            <img
                              src={s.photoUrl}
                              alt={s.name}
                              className="w-9 h-9 rounded-full object-cover border border-slate-200"
                            />
                          ) : (
                            <div className="w-9 h-9 rounded-full bg-teal-700 text-white flex items-center justify-center">
                              <User className="w-5 h-5" />
                            </div>
                          )}
                        </td>
                        <td className="py-3.5 px-3">
                          <div className="font-semibold text-slate-800">{s.name}</div>
                          {parentName && (
                            <div className="text-[11px] text-slate-400 flex items-center gap-1 mt-0.5">
                              <User className="w-3 h-3" />
                              {parentName}
                            </div>
                          )}
                          <div className="flex flex-wrap items-center gap-1.5 mt-1.5">
                            {s.rollNumber && (
                              <span className="px-1.5 py-0.5 rounded bg-purple-50 text-purple-700 border border-purple-200 text-[10px] font-semibold">
                                Roll No: {s.rollNumber}
                              </span>
                            )}
                            {s.admissionNo && (
                              <span className="px-1.5 py-0.5 rounded bg-blue-50 text-blue-700 border border-blue-200 text-[10px] font-semibold">
                                Ad No: {s.admissionNo}
                              </span>
                            )}
                            {due > 0 && (
                              <span className="px-1.5 py-0.5 rounded bg-orange-50 text-orange-700 border border-orange-200 text-[10px] font-semibold">
                                Pending due : PKR {due.toLocaleString()}
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="py-3.5 px-3">
                          <span className="inline-block px-2 py-1 rounded bg-purple-50 text-purple-700 border border-purple-200 text-center leading-tight">
                            <span className="block text-[11px] font-semibold">{s.className || '—'}</span>
                            {s.section && <span className="block text-[10px] text-purple-500">{s.section}</span>}
                          </span>
                        </td>
                        <td className="py-3.5 px-3">
                          <div className="font-semibold text-slate-700">{droppedDate}</div>
                          {droppedTime && (
                            <div className="text-[11px] text-slate-400 flex items-center gap-1 mt-0.5">
                              <Clock className="w-3 h-3" />
                              {droppedTime}
                            </div>
                          )}
                        </td>
                        <td className="py-3.5 px-3 font-medium text-slate-700">{s.droppedBy || '—'}</td>
                        <td className="py-3.5 px-3 text-slate-600">{s.dropReason || '—'}</td>
                        <td className="py-3.5 px-3 text-right">
                          <div className="inline-flex items-center gap-1.5">
                            <button
                              type="button"
                              onClick={() => setDropDetailStudent(s)}
                              className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-cyan-600 hover:bg-cyan-700 text-white text-[11px] font-semibold transition-colors"
                            >
                              <Eye className="w-3 h-3" />
                              Detail
                            </button>
                            <button
                              type="button"
                              onClick={() => onOpenProfile?.(s.id)}
                              className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-slate-600 hover:bg-slate-700 text-white text-[11px] font-semibold transition-colors"
                            >
                              <User className="w-3 h-3" />
                              Profile
                            </button>
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

      {/* Drop Student Modal */}
      {dropModalOpen && (
        <Modal
          isOpen
          onClose={() => setDropModalOpen(false)}
          title="Drop / Mark Student Left"
          maxWidth="max-w-md"
        >
          <form onSubmit={handleConfirmDropStudent} className="space-y-4 text-xs">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Search &amp; Select Student</label>
              <input
                type="text"
                value={dropStudentSearch}
                onChange={(e) => setDropStudentSearch(e.target.value)}
                placeholder="Filter active students by name or roll..."
                className="w-full px-3 py-2 mb-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-rose-500"
              />
              <select
                required
                value={dropForm.studentId}
                onChange={(e) => setDropForm((p) => ({ ...p, studentId: e.target.value }))}
                className="w-full px-3 py-2 rounded-lg border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-rose-500"
              >
                <option value="">Choose active student...</option>
                {activeStudentsForDrop
                  .filter((st) => {
                    const q = dropStudentSearch.trim().toLowerCase()
                    if (!q) return true
                    return (
                      (st.name || '').toLowerCase().includes(q) ||
                      (st.rollNumber || '').toLowerCase().includes(q)
                    )
                  })
                  .slice(0, 60)
                  .map((st) => (
                    <option key={st.id} value={st.id}>
                      {st.name} ({st.className || 'N/A'} • Roll: {st.rollNumber || '—'})
                    </option>
                  ))}
              </select>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Dropped On</label>
              <input
                type="date"
                required
                value={dropForm.droppedOn}
                onChange={(e) => setDropForm((p) => ({ ...p, droppedOn: e.target.value }))}
                className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-rose-500"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Reason for Leaving / Drop</label>
              <textarea
                rows={3}
                required
                value={dropForm.reason}
                onChange={(e) => setDropForm((p) => ({ ...p, reason: e.target.value }))}
                placeholder="e.g. Family relocated, Fee freeze, Transferring institute..."
                className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-rose-500"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setDropModalOpen(false)}
                className="px-3.5 py-1.5 rounded-lg border border-slate-200 text-slate-600 font-semibold hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-700 text-white font-semibold"
              >
                Confirm Drop
              </button>
            </div>
          </form>
        </Modal>
      )}

      {/* Drop Detail Modal */}
      {dropDetailStudent && (
        <Modal
          isOpen
          onClose={() => setDropDetailStudent(null)}
          title={`Drop / Leave Details — ${dropDetailStudent.name}`}
          maxWidth="max-w-md"
        >
          <div className="space-y-3 text-xs">
            <div className="grid grid-cols-2 gap-3 bg-slate-50 p-3 rounded-lg border border-slate-200">
              <div>
                <span className="text-slate-400 block">Class / Section</span>
                <span className="font-semibold text-slate-800">
                  {dropDetailStudent.className || '—'} {dropDetailStudent.section ? `(${dropDetailStudent.section})` : ''}
                </span>
              </div>
              <div>
                <span className="text-slate-400 block">Dropped On</span>
                <span className="font-semibold text-slate-800">
                  {formatDisplayDate(dropDetailStudent.droppedOn || dropDetailStudent.updatedAt)}
                </span>
              </div>
              <div>
                <span className="text-slate-400 block">Dropped By</span>
                <span className="font-semibold text-slate-800">{dropDetailStudent.droppedBy || '—'}</span>
              </div>
              <div>
                <span className="text-slate-400 block">Pending Dues</span>
                <span className="font-semibold text-orange-600">
                  PKR {(pendingDueByStudent[dropDetailStudent.id] || 0).toLocaleString()}
                </span>
              </div>
            </div>

            <div>
              <span className="text-slate-500 font-semibold block mb-1">Reason</span>
              <div className="p-3 rounded-lg border border-slate-200 bg-white text-slate-700">
                {dropDetailStudent.dropReason || 'No reason recorded.'}
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setDropDetailStudent(null)}
                className="px-3.5 py-1.5 rounded-lg border border-slate-200 text-slate-600 font-semibold hover:bg-slate-50"
              >
                Close
              </button>
              <button
                type="button"
                onClick={() => handleRestoreStudent(dropDetailStudent)}
                className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-semibold"
              >
                <CheckCircle2 className="w-3.5 h-3.5" />
                Re-admit / Restore
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  )
}

export default PromotionStatusViews
