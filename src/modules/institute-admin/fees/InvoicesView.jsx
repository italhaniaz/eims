import React, { useState, useMemo, useRef, useEffect } from 'react'
import {
  ArrowLeft,
  UserPlus,
  DollarSign,
  FileText,
  ArrowDownCircle,
  MessageSquare,
  Wallet,
  AlertTriangle,
  Percent,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  Users,
  User,
  Download,
  ChevronDown,
  Info,
  Printer,
  Edit3,
  Trash2,
  X,
  CheckCircle2,
  Calendar,
  List,
  Check
} from 'lucide-react'
import { useAppData } from '../../../context/AppDataContext'
import { useToast } from '../../../context/ToastContext'
import { PrintableFeeChallanModal } from '../../../components/common/PrintableFeeChallanModal'
import {
  getDistinctInstituteClassNames,
  isClassAllowedForTier
} from '../../../utils/tierGating'

const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
]
const SHORT_MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
const FEE_HEADS = [
  'Tuition Fee',
  'Admission Fee',
  'Exam Fee',
  'Transport Fee',
  'Hostel / Boarding Fee',
  'Lab / Library Fee',
  'Stationery / Books',
  'Annual Charges',
  'Attendance Fine'
]
const SCHEDULES = ['Monthly', 'One-Time', 'Quarterly', 'Bi-Annual', 'Annual']
const INVOICE_KINDS = ['Regular', 'Supplementary', 'Installment', 'Fine']

const pad2 = (n) => String(n).padStart(2, '0')
const toIsoDate = (d) => `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}`
const formatHumanDate = (iso) => {
  if (!iso) return ''
  const parts = String(iso).slice(0, 10).split('-')
  if (parts.length !== 3) return iso
  const [y, m, d] = parts
  return `${Number(d)} ${SHORT_MONTHS[Number(m) - 1] || m} ${y}`
}
const formatRelativeActivity = (iso) => {
  if (!iso) return { short: 'Today', rel: 'Just now' }
  const clean = String(iso).slice(0, 10)
  const dt = new Date(`${clean}T12:00:00`)
  if (Number.isNaN(dt.getTime())) return { short: clean, rel: '' }
  const short = `${pad2(dt.getDate())} ${SHORT_MONTHS[dt.getMonth()]}`
  const diffDays = Math.floor((Date.now() - dt.getTime()) / (1000 * 60 * 60 * 24))
  if (diffDays <= 0) return { short, rel: 'Today' }
  if (diffDays === 1) return { short, rel: '1d ago' }
  if (diffDays < 7) return { short, rel: `${diffDays}d ago` }
  const weeks = Math.floor(diffDays / 7)
  if (weeks < 5) return { short, rel: `${weeks}w ago` }
  const months = Math.floor(diffDays / 30)
  return { short, rel: `${months}mo ago` }
}

const getFeeDateIso = (fee) => {
  const raw = fee?.createdAt || fee?.issuedDate || fee?.dueDate || ''
  if (!raw) return toIsoDate(new Date())
  return String(raw).slice(0, 10)
}

const getFeeTotal = (fee) => Number(fee?.amount || 0) + Number(fee?.fine || fee?.lateFine || 0)
const getFeePaid = (fee) => {
  if (fee?.paidAmount !== undefined && fee?.paidAmount !== null) return Number(fee.paidAmount)
  if (fee?.status === 'Paid') return getFeeTotal(fee)
  if (fee?.status === 'Partial') return Number(fee?.finalPaid || 0)
  return 0
}
const getFeeWaiver = (fee) => Number(fee?.discount || fee?.waiver || fee?.discountAmount || 0) + Number(fee?.waivedLateFee || 0)
const getFeeRemaining = (fee) => {
  if (fee?.status === 'Paid') return 0
  return Math.max(0, getFeeTotal(fee) - getFeePaid(fee) - getFeeWaiver(fee))
}

const formatPkrPlain = (val) => `${Number(val || 0).toLocaleString()}`
const formatPkrDec = (val) =>
  `${Number(val || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} PKR`

export const InvoicesView = ({
  currentInstitute,
  onRouteChange,
  onOpenQuickPayment,
  onOpenBillingHistory
}) => {
  const {
    fees = [],
    students = [],
    classes = [],
    addItem,
    updateItem,
    deleteItem,
    sendCommunicationBlast,
    logAuditEvent
  } = useAppData()
  const { toast } = useToast()

  const now = useMemo(() => new Date(), [])
  const todayIso = toIsoDate(now)
  const instId = currentInstitute?.id || 'inst-1'

  const instStudents = useMemo(
    () =>
      students.filter(
        (s) => (!currentInstitute?.id || s.instituteId === currentInstitute.id || !s.instituteId) &&
          isClassAllowedForTier(s.className, currentInstitute)
      ),
    [students, currentInstitute]
  )

  const studentById = useMemo(() => {
    const map = new Map()
    instStudents.forEach((s) => map.set(s.id, s))
    return map
  }, [instStudents])

  const availableClasses = useMemo(
    () => getDistinctInstituteClassNames(classes, instStudents, currentInstitute),
    [classes, instStudents, currentInstitute]
  )

  // Date Mode + Filter State (Picks 3, 4, 5)
  const [dateMode, setDateMode] = useState('month') // 'today' | 'month' | 'custom'
  const [filterMonth, setFilterMonth] = useState(now.getMonth()) // 0-11
  const [filterYear, setFilterYear] = useState(now.getFullYear())
  const [customFrom, setCustomFrom] = useState(() => `${now.getFullYear()}-${pad2(now.getMonth() + 1)}-01`)
  const [customTo, setCustomTo] = useState(() => {
    const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate()
    return `${now.getFullYear()}-${pad2(now.getMonth() + 1)}-${pad2(lastDay)}`
  })

  const [classFilter, setClassFilter] = useState('ALL')
  const [scheduleFilter, setScheduleFilter] = useState('ALL')
  const [kindFilter, setKindFilter] = useState('ALL')
  const [headFilter, setHeadFilter] = useState('ALL')
  const [statusFilter, setStatusFilter] = useState('ALL')
  const [studentScopeFilter, setStudentScopeFilter] = useState('ALL') // 'ALL' | 'Active' | 'Dropped'

  const [appliedFilters, setAppliedFilters] = useState(() => ({
    dateMode: 'month',
    filterMonth: now.getMonth(),
    filterYear: now.getFullYear(),
    customFrom: `${now.getFullYear()}-${pad2(now.getMonth() + 1)}-01`,
    customTo: `${now.getFullYear()}-${pad2(now.getMonth() + 1)}-${pad2(new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate())}`,
    classFilter: 'ALL',
    scheduleFilter: 'ALL',
    kindFilter: 'ALL',
    headFilter: 'ALL',
    statusFilter: 'ALL',
    studentScopeFilter: 'ALL'
  }))

  // Switch date tab immediately applies cleanly (matching Picks 3, 4, 5)
  const handleSwitchDateMode = (mode) => {
    setDateMode(mode)
    setAppliedFilters((prev) => ({ ...prev, dateMode: mode }))
  }

  const handleApplyFilters = () => {
    setAppliedFilters({
      dateMode,
      filterMonth,
      filterYear,
      customFrom,
      customTo,
      classFilter,
      scheduleFilter,
      kindFilter,
      headFilter,
      statusFilter,
      studentScopeFilter
    })
  }

  const handleClearFilters = () => {
    const resetMonth = now.getMonth()
    const resetYear = now.getFullYear()
    const startOfCurMonth = `${resetYear}-${pad2(resetMonth + 1)}-01`
    const endOfCurMonth = `${resetYear}-${pad2(resetMonth + 1)}-${pad2(new Date(resetYear, resetMonth + 1, 0).getDate())}`
    setFilterMonth(resetMonth)
    setFilterYear(resetYear)
    setCustomFrom(startOfCurMonth)
    setCustomTo(endOfCurMonth)
    setClassFilter('ALL')
    setScheduleFilter('ALL')
    setKindFilter('ALL')
    setHeadFilter('ALL')
    setStatusFilter('ALL')
    setStudentScopeFilter('ALL')
    setAppliedFilters({
      dateMode,
      filterMonth: resetMonth,
      filterYear: resetYear,
      customFrom: startOfCurMonth,
      customTo: endOfCurMonth,
      classFilter: 'ALL',
      scheduleFilter: 'ALL',
      kindFilter: 'ALL',
      headFilter: 'ALL',
      statusFilter: 'ALL',
      studentScopeFilter: 'ALL'
    })
  }

  // Active Date Range Bounds
  const activeRange = useMemo(() => {
    const { dateMode: m, filterMonth: mo, filterYear: yr, customFrom: cf, customTo: ct } = appliedFilters
    if (m === 'today') {
      return { startIso: todayIso, endIso: todayIso }
    }
    if (m === 'custom') {
      const s = cf || todayIso
      const e = ct || s
      return s <= e ? { startIso: s, endIso: e } : { startIso: e, endIso: s }
    }
    const lastDay = new Date(yr, mo + 1, 0).getDate()
    return {
      startIso: `${yr}-${pad2(mo + 1)}-01`,
      endIso: `${yr}-${pad2(mo + 1)}-${pad2(lastDay)}`
    }
  }, [appliedFilters, todayIso])

  const rangeLabel = `${formatHumanDate(activeRange.startIso)} – ${formatHumanDate(activeRange.endIso)}`

  // Sorting
  const [sortKey, setSortKey] = useState('activity') // 'invoice' | 'amount' | 'activity'
  const [sortDir, setSortDir] = useState('desc')
  const toggleSort = (key) => {
    if (sortKey === key) setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'))
    else {
      setSortKey(key)
      setSortDir(key === 'activity' ? 'desc' : 'asc')
    }
  }

  // Filtered Fees
  const filteredInvoices = useMemo(() => {
    const {
      classFilter: cls,
      scheduleFilter: sched,
      kindFilter: kind,
      headFilter: head,
      statusFilter: stat,
      studentScopeFilter: stdScope
    } = appliedFilters

    return fees
      .filter((f) => {
        if (currentInstitute?.id && f.instituteId && f.instituteId !== currentInstitute.id) return false
        const dIso = getFeeDateIso(f)
        if (dIso < activeRange.startIso || dIso > activeRange.endIso) return false

        const std = f.studentId ? studentById.get(f.studentId) : instStudents.find((s) => (s.fullName || s.name) === f.studentName)
        const stdStatus = String(std?.status || 'Active').toLowerCase()
        const isDropped = stdStatus === 'dropped' || stdStatus === 'withdrawn' || stdStatus === 'graduated'
        if (stdScope === 'Active' && isDropped) return false
        if (stdScope === 'Dropped' && !isDropped) return false

        if (cls !== 'ALL' && (f.className || std?.className || '') !== cls) return false
        const fSched = f.schedule || f.frequency || 'Monthly'
        if (sched !== 'ALL' && fSched !== sched) return false
        const fKind = f.kind || 'Regular'
        if (kind !== 'ALL' && fKind !== kind) return false
        const fHead = f.feeHead || f.feeType || f.feeTitle || 'Tuition Fee'
        if (head !== 'ALL' && !fHead.toLowerCase().includes(head.toLowerCase())) return false

        const st = f.status || 'Pending'
        const isOverdue = st !== 'Paid' && f.dueDate && f.dueDate < todayIso
        if (stat === 'Overdue' && !isOverdue) return false
        if (stat !== 'ALL' && stat !== 'Overdue' && st !== stat) return false
        return true
      })
      .sort((a, b) => {
        let va, vb
        if (sortKey === 'amount') {
          va = getFeeTotal(a)
          vb = getFeeTotal(b)
        } else if (sortKey === 'invoice') {
          va = (a.feeTitle || a.feeHead || a.feeType || '').toLowerCase()
          vb = (b.feeTitle || b.feeHead || b.feeType || '').toLowerCase()
        } else {
          va = getFeeDateIso(a)
          vb = getFeeDateIso(b)
        }
        if (va < vb) return sortDir === 'asc' ? -1 : 1
        if (va > vb) return sortDir === 'asc' ? 1 : -1
        return 0
      })
  }, [fees, currentInstitute, appliedFilters, activeRange, studentById, instStudents, todayIso, sortKey, sortDir])

  // KPI Metrics (matching Pick 2–5 4-card breakdown including dropped students)
  const metrics = useMemo(() => {
    let totalBilled = 0
    let billedDroppedAmt = 0
    const billedStudents = new Set()
    const billedDroppedStudents = new Set()

    let paidTotal = 0
    let paidInvoicesCount = 0
    let paidDroppedAmt = 0
    const paidStudents = new Set()
    const paidDroppedStudents = new Set()

    let outstandingTotal = 0
    let outstandingCount = 0
    let outstandingDroppedAmt = 0
    const outstandingStudents = new Set()
    const outstandingDroppedStudents = new Set()

    let waiverTotal = 0
    let waiverCount = 0
    let waiverDroppedAmt = 0
    const waiverDroppedStudents = new Set()

    filteredInvoices.forEach((f) => {
      const std = f.studentId ? studentById.get(f.studentId) : instStudents.find((s) => (s.fullName || s.name) === f.studentName)
      const stdKey = std?.id || f.studentId || f.studentName || f.id
      const sStat = String(std?.status || 'Active').toLowerCase()
      const isDropped = sStat === 'dropped' || sStat === 'withdrawn' || sStat === 'graduated'

      const total = getFeeTotal(f)
      const paid = getFeePaid(f)
      const rem = getFeeRemaining(f)
      const waiver = getFeeWaiver(f)

      totalBilled += total
      billedStudents.add(stdKey)
      if (isDropped) {
        billedDroppedAmt += total
        billedDroppedStudents.add(stdKey)
      }

      if (paid > 0) {
        paidTotal += paid
        paidInvoicesCount += 1
        paidStudents.add(stdKey)
        if (isDropped) {
          paidDroppedAmt += paid
          paidDroppedStudents.add(stdKey)
        }
      }

      if (rem > 0) {
        outstandingTotal += rem
        outstandingCount += 1
        outstandingStudents.add(stdKey)
        if (isDropped) {
          outstandingDroppedAmt += rem
          outstandingDroppedStudents.add(stdKey)
        }
      }

      if (waiver > 0) {
        waiverTotal += waiver
        waiverCount += 1
        if (isDropped) {
          waiverDroppedAmt += waiver
          waiverDroppedStudents.add(stdKey)
        }
      }
    })

    return {
      totalBilled,
      billedInvoices: filteredInvoices.length,
      billedStudents: billedStudents.size,
      billedDroppedStudents: billedDroppedStudents.size,
      billedDroppedAmt,

      paidTotal,
      paidInvoices: paidInvoicesCount,
      paidStudents: paidStudents.size,
      paidDroppedStudents: paidDroppedStudents.size,
      paidDroppedAmt,

      outstandingTotal,
      outstandingInvoices: outstandingCount,
      outstandingStudents: outstandingStudents.size,
      outstandingDroppedStudents: outstandingDroppedStudents.size,
      outstandingDroppedAmt,

      waiverTotal,
      waiverLines: waiverCount,
      waiverInvoices: waiverCount,
      waiverDroppedStudents: waiverDroppedStudents.size,
      waiverDroppedAmt
    }
  }, [filteredInvoices, studentById, instStudents])

  // Export Dropdown
  const [exportOpen, setExportOpen] = useState(false)
  const exportRef = useRef(null)
  useEffect(() => {
    const handler = (e) => {
      if (exportRef.current && !exportRef.current.contains(e.target)) setExportOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const handleExportCsv = () => {
    setExportOpen(false)
    if (filteredInvoices.length === 0) {
      toast('No invoices in the selected filter range to export.', 'warning')
      return
    }
    const headers = ['#', 'Type', 'Student', 'Class', 'Roll No', 'Invoice Title', 'Fee Head', 'Amount (PKR)', 'Paid (PKR)', 'Remaining (PKR)', 'Status', 'Due Date']
    const rows = filteredInvoices.map((f, i) => [
      i + 1,
      `"${f.invoiceType || 'Individual'}"`,
      `"${f.studentName || ''}"`,
      `"${f.className || ''}"`,
      `"${f.rollNumber || ''}"`,
      `"${f.feeTitle || f.feeHead || 'Tuition Fee'}"`,
      `"${f.feeHead || f.feeType || 'Tuition Fee'}"`,
      getFeeTotal(f),
      getFeePaid(f),
      getFeeRemaining(f),
      `"${f.status || 'Pending'}"`,
      `"${f.dueDate || ''}"`
    ])
    const csv = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n')
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `invoices_${activeRange.startIso}_to_${activeRange.endIso}.csv`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
    toast(`Exported ${filteredInvoices.length} invoice(s) to CSV.`, 'success')
  }

  // Class Invoice Modal State (Picks 2, 3, 4)
  const [classModalOpen, setClassModalOpen] = useState(false)
  const [selectClassesOpen, setSelectClassesOpen] = useState(false)
  const [draftSelectedClasses, setDraftSelectedClasses] = useState([])
  const [classForm, setClassForm] = useState({
    invoiceTitle: '',
    feeType: '',
    selectedClasses: [],
    amount: '0.00',
    notes: '',
    billingMonth: `${now.getFullYear()}-${pad2(now.getMonth() + 1)}`,
    dueDate: '',
    lateFine: '0',
    notifySms: true
  })
  const [isGenerating, setIsGenerating] = useState(false)

  const openClassInvoiceModal = () => {
    setClassForm({
      invoiceTitle: '',
      feeType: '',
      selectedClasses: [],
      amount: '0.00',
      notes: '',
      billingMonth: `${now.getFullYear()}-${pad2(now.getMonth() + 1)}`,
      dueDate: '',
      lateFine: '0',
      notifySms: true
    })
    setDraftSelectedClasses([])
    setSelectClassesOpen(false)
    setClassModalOpen(true)
  }

  const classStudentCounts = useMemo(() => {
    const map = new Map()
    availableClasses.forEach((cls) => map.set(cls, []))
    instStudents.forEach((s) => {
      if ((s.status || 'Active') !== 'Active') return
      const cls = s.className || ''
      if (!cls) return
      if (!map.has(cls)) map.set(cls, [])
      map.get(cls).push(s)
    })
    return Array.from(map.entries()).map(([name, list]) => ({ name, count: list.length, students: list }))
  }, [availableClasses, instStudents])

  const selectedClassTargets = useMemo(() => {
    if (classForm.selectedClasses.length === 0) return []
    const set = new Set(classForm.selectedClasses)
    return instStudents.filter((s) => (s.status || 'Active') === 'Active' && set.has(s.className || ''))
  }, [classForm.selectedClasses, instStudents])

  const missingPhoneCount = useMemo(() => {
    return selectedClassTargets.filter((s) => {
      const ph = String(s.parentPhone || s.phone || s.guardianPhone || '').replace(/[^0-9]/g, '')
      return ph.length < 7
    }).length
  }, [selectedClassTargets])

  const openSelectClassesModal = () => {
    setDraftSelectedClasses([...classForm.selectedClasses])
    setSelectClassesOpen(true)
  }

  const applySelectedClasses = () => {
    setClassForm((prev) => ({ ...prev, selectedClasses: [...draftSelectedClasses] }))
    setSelectClassesOpen(false)
  }

  const handleGenerateClassInvoices = async (e) => {
    e.preventDefault()
    if (!classForm.invoiceTitle.trim()) {
      toast('Please enter an invoice title.', 'warning')
      return
    }
    if (!classForm.feeType) {
      toast('Please select a fee type.', 'warning')
      return
    }
    if (classForm.selectedClasses.length === 0) {
      toast('Please select at least one class.', 'warning')
      return
    }
    if (selectedClassTargets.length === 0) {
      toast('No active students found in the selected class(es).', 'warning')
      return
    }

    setIsGenerating(true)
    try {
      const [yrStr, moStr] = (classForm.billingMonth || `${now.getFullYear()}-${pad2(now.getMonth() + 1)}`).split('-')
      const monthLabel = SHORT_MONTHS[Math.max(0, Number(moStr) - 1)] || SHORT_MONTHS[now.getMonth()]
      const feeMonth = `${monthLabel} ${yrStr}`
      const enteredAmt = Math.max(0, Number(classForm.amount || 0))
      const lateFineVal = Math.max(0, Number(classForm.lateFine || 0))

      let created = 0
      let skipped = 0
      let smsEligible = 0

      for (const st of selectedClassTargets) {
        const sName = st.fullName || st.name
        const dup = fees.some(
          (f) =>
            (f.studentId === st.id || (f.studentName || '').toLowerCase() === (sName || '').toLowerCase()) &&
            (f.feeMonth || '') === feeMonth &&
            (f.feeTitle || '').toLowerCase() === classForm.invoiceTitle.trim().toLowerCase() &&
            (!currentInstitute?.id || !f.instituteId || f.instituteId === currentInstitute.id)
        )
        if (dup) {
          skipped += 1
          continue
        }
        const amt = enteredAmt > 0 ? enteredAmt : Number(st.monthlyFee || st.tuitionFee || 0)
        const receiptNo = String(Math.floor(1000000 + Math.random() * 8999999))
        const hasPhone = String(st.parentPhone || st.phone || st.guardianPhone || '').replace(/[^0-9]/g, '').length >= 7
        if (hasPhone) smsEligible += 1

        await addItem('fees', {
          studentId: st.id,
          studentName: sName,
          fatherName: st.fatherName || st.guardianName || '',
          rollNumber: st.rollNumber || '',
          admissionNo: st.admissionNo || st.registrationNo || '',
          className: st.className || '',
          invoiceType: 'Class',
          feeHead: classForm.feeType,
          feeType: classForm.feeType,
          feeTitle: classForm.invoiceTitle.trim(),
          schedule: 'Monthly',
          frequency: 'Monthly',
          kind: 'Regular',
          feeMonth,
          receiptNo,
          amount: amt,
          grossAmount: amt,
          fine: lateFineVal,
          lateFine: lateFineVal,
          discount: 0,
          paidAmount: 0,
          notes: classForm.notes.trim(),
          dueDate: classForm.dueDate || `${yrStr}-${moStr}-10`,
          createdAt: new Date().toISOString(),
          status: 'Pending',
          smsSent: classForm.notifySms && hasPhone,
          instituteId: instId
        })
        created += 1
      }

      if (classForm.notifySms && created > 0 && smsEligible > 0 && sendCommunicationBlast) {
        try {
          await sendCommunicationBlast({
            channel: 'SMS',
            recipientGroup: classForm.selectedClasses.join(', '),
            message: `${classForm.invoiceTitle.trim()} (${classForm.feeType}) generated for ${feeMonth}. Please submit fee by due date.`,
            recipientsCount: smsEligible
          })
        } catch {
          // non-blocking SMS log
        }
      }

      logAuditEvent?.(
        `Generated ${created} Class Invoice(s) (${classForm.invoiceTitle.trim()} · ${feeMonth})`,
        currentInstitute?.name || 'Admin',
        'Success'
      )
      toast(
        `Created ${created} invoice(s)${skipped > 0 ? ` (${skipped} duplicate skipped)` : ''}.`,
        created > 0 ? 'success' : 'info'
      )
      setClassModalOpen(false)
    } catch (err) {
      toast(err?.message || 'Failed to generate class invoices.', 'error')
    } finally {
      setIsGenerating(false)
    }
  }

  // Individual Invoice Modal State
  const [indivModalOpen, setIndivModalOpen] = useState(false)
  const [indivForm, setIndivForm] = useState({
    className: '',
    studentId: '',
    feeHead: 'Tuition Fee',
    feeTitle: 'Tuition Fee',
    schedule: 'Monthly',
    kind: 'Regular',
    grossAmount: '2000',
    discount: '0',
    discountReason: '',
    dueDate: `${now.getFullYear()}-${pad2(now.getMonth() + 1)}-10`,
    status: 'Pending'
  })

  const indivStudentsInClass = useMemo(() => {
    if (!indivForm.className) return instStudents
    return instStudents.filter((s) => (s.className || '') === indivForm.className)
  }, [instStudents, indivForm.className])

  const openIndividualModal = () => {
    const first = instStudents[0] || null
    setIndivForm({
      className: first?.className || '',
      studentId: first?.id || '',
      feeHead: 'Tuition Fee',
      feeTitle: 'Tuition Fee',
      schedule: 'Monthly',
      kind: 'Regular',
      grossAmount: String(first?.monthlyFee || first?.tuitionFee || 2000),
      discount: '0',
      discountReason: '',
      dueDate: `${now.getFullYear()}-${pad2(now.getMonth() + 1)}-10`,
      status: 'Pending'
    })
    setIndivModalOpen(true)
  }

  const handleGenerateIndividualInvoice = async (e) => {
    e.preventDefault()
    const st = studentById.get(indivForm.studentId)
    if (!st) {
      toast('Select a student first.', 'warning')
      return
    }
    const gross = Math.max(0, Number(indivForm.grossAmount || 0))
    const disc = Math.min(gross, Math.max(0, Number(indivForm.discount || 0)))
    const receiptNo = String(Math.floor(1000000 + Math.random() * 8999999))
    const isPaid = indivForm.status === 'Paid'
    const feeMonth = `${SHORT_MONTHS[now.getMonth()]} ${now.getFullYear()}`

    try {
      await addItem('fees', {
        studentId: st.id,
        studentName: st.fullName || st.name,
        fatherName: st.fatherName || st.guardianName || '',
        rollNumber: st.rollNumber || '',
        admissionNo: st.admissionNo || st.registrationNo || '',
        className: st.className || indivForm.className,
        invoiceType: 'Individual',
        feeHead: indivForm.feeHead,
        feeType: indivForm.feeHead,
        feeTitle: indivForm.feeTitle.trim() || indivForm.feeHead,
        schedule: indivForm.schedule,
        frequency: indivForm.schedule,
        kind: indivForm.kind,
        feeMonth,
        receiptNo,
        amount: gross,
        grossAmount: gross,
        discount: disc,
        discountReason: indivForm.discountReason.trim(),
        paidAmount: isPaid ? Math.max(0, gross - disc) : 0,
        paidAt: isPaid ? new Date().toISOString() : null,
        dueDate: indivForm.dueDate,
        createdAt: new Date().toISOString(),
        status: indivForm.status,
        instituteId: instId
      })
      logAuditEvent?.(`Individual invoice generated for ${st.fullName || st.name}`, currentInstitute?.name || 'Admin', 'Success')
      toast(`Invoice created for ${st.fullName || st.name}.`, 'success')
      setIndivModalOpen(false)
    } catch (err) {
      toast(err?.message || 'Could not create invoice.', 'error')
    }
  }

  // Edit & Delete & Receipt Modals
  const [editFee, setEditFee] = useState(null)
  const [editForm, setEditForm] = useState({ feeTitle: '', feeHead: 'Tuition Fee', amount: '', discount: '0', dueDate: '', status: 'Pending' })
  const [deleteFee, setDeleteFee] = useState(null)
  const [receiptFee, setReceiptFee] = useState(null)

  const openEditModal = (f) => {
    setEditFee(f)
    setEditForm({
      feeTitle: f.feeTitle || f.feeHead || f.feeType || 'Tuition Fee',
      feeHead: f.feeHead || f.feeType || 'Tuition Fee',
      amount: String(f.amount ?? 0),
      discount: String(f.discount ?? f.waiver ?? 0),
      dueDate: f.dueDate || todayIso,
      status: f.status || 'Pending'
    })
  }

  const handleSaveEdit = async (e) => {
    e.preventDefault()
    if (!editFee) return
    try {
      const nextAmt = Math.max(0, Number(editForm.amount || 0))
      const nextDisc = Math.min(nextAmt, Math.max(0, Number(editForm.discount || 0)))
      const isPaid = editForm.status === 'Paid'
      await updateItem('fees', editFee.id, {
        feeTitle: editForm.feeTitle.trim() || editForm.feeHead,
        feeHead: editForm.feeHead,
        feeType: editForm.feeHead,
        amount: nextAmt,
        discount: nextDisc,
        dueDate: editForm.dueDate,
        status: editForm.status,
        paidAmount: isPaid ? Math.max(0, nextAmt - nextDisc) : getFeePaid(editFee),
        paidAt: isPaid ? (editFee.paidAt || new Date().toISOString()) : editFee.paidAt
      })
      toast('Invoice updated.', 'success')
      setEditFee(null)
    } catch (err) {
      toast(err?.message || 'Failed to update invoice.', 'error')
    }
  }

  const handleConfirmDelete = async () => {
    if (!deleteFee) return
    try {
      await deleteItem('fees', deleteFee.id)
      toast('Invoice deleted.', 'info')
      setDeleteFee(null)
    } catch (err) {
      toast(err?.message || 'Could not delete invoice.', 'error')
    }
  }

  const yearOptions = [now.getFullYear() - 2, now.getFullYear() - 1, now.getFullYear(), now.getFullYear() + 1]

  return (
    <div className="space-y-4 pb-8 animate-fade-in">
      {/* Top Bar matching Pick 2 */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2 text-slate-900">
            <FileText className="w-5 h-5 text-slate-600" />
            <h1 className="text-lg font-bold tracking-tight">Invoices</h1>
          </div>
          <button
            type="button"
            onClick={() => onRouteChange?.('inst-dashboard')}
            className="inline-flex items-center gap-1 text-xs font-medium text-slate-500 hover:text-slate-800 mt-0.5 cursor-pointer"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back</span>
          </button>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => onRouteChange?.('inst-admissions-enroll')}
            className="px-3.5 py-2 rounded-xl bg-teal-600 hover:bg-teal-700 text-white text-xs font-semibold flex items-center gap-1.5 shadow-xs cursor-pointer transition-colors"
          >
            <UserPlus className="w-3.5 h-3.5" />
            <span>New Enrollment</span>
          </button>
          <button
            type="button"
            onClick={() => onOpenQuickPayment?.(null)}
            className="px-3.5 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-white text-xs font-semibold flex items-center gap-1.5 shadow-xs cursor-pointer transition-colors"
          >
            <DollarSign className="w-3.5 h-3.5" />
            <span>Add Payment</span>
          </button>
          <button
            type="button"
            onClick={openIndividualModal}
            className="px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold flex items-center gap-1.5 shadow-xs cursor-pointer transition-colors"
          >
            <FileText className="w-3.5 h-3.5" />
            <span>Generate Invoice</span>
          </button>
          <button
            type="button"
            onClick={() => onRouteChange?.('inst-accounts-expenses')}
            className="px-3.5 py-2 rounded-xl bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 text-xs font-semibold flex items-center gap-1.5 shadow-2xs cursor-pointer transition-colors"
          >
            <ArrowDownCircle className="w-3.5 h-3.5 text-slate-500" />
            <span>Manage Expense</span>
          </button>
          <button
            type="button"
            onClick={() => onRouteChange?.('inst-communication-sms')}
            className="px-3.5 py-2 rounded-xl bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 text-xs font-semibold flex items-center gap-1.5 shadow-2xs cursor-pointer transition-colors"
          >
            <MessageSquare className="w-3.5 h-3.5 text-slate-500" />
            <span>Send SMS</span>
          </button>
        </div>
      </div>

      {/* 4 KPI Summary Cards (Pick 2) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-2xs flex flex-col justify-between">
          <div className="p-4 flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-xl bg-blue-500 text-white flex items-center justify-center shrink-0">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <p className="text-[11px] font-semibold text-slate-500">Total billed</p>
              <p className="text-lg font-extrabold text-slate-900">
                {formatPkrPlain(metrics.totalBilled)} <span className="text-xs font-semibold text-slate-500">PKR</span>
              </p>
              <p className="text-[11px] text-slate-500">{metrics.billedInvoices} invoice(s) · {metrics.billedStudents} student(s)</p>
            </div>
          </div>
          <div className="bg-amber-50/70 border-t border-amber-100 px-3.5 py-2 text-[11px] text-amber-800 font-medium flex items-center gap-1.5">
            <Users className="w-3.5 h-3.5 shrink-0" />
            <span>Includes {metrics.billedDroppedStudents} dropped student(s) · PKR {formatPkrPlain(metrics.billedDroppedAmt)}</span>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-2xs flex flex-col justify-between">
          <div className="p-4 flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-xl bg-emerald-500 text-white flex items-center justify-center shrink-0">
              <Wallet className="w-5 h-5" />
            </div>
            <div>
              <p className="text-[11px] font-semibold text-slate-500">Paid on these invoices</p>
              <p className="text-lg font-extrabold text-slate-900">
                {formatPkrPlain(metrics.paidTotal)} <span className="text-xs font-semibold text-slate-500">PKR</span>
              </p>
              <p className="text-[11px] text-slate-500">{metrics.paidInvoices} invoice(s) · {metrics.paidStudents} student(s)</p>
            </div>
          </div>
          <div className="bg-emerald-50/70 border-t border-emerald-100 px-3.5 py-2 text-[11px] text-emerald-800 font-medium flex items-center gap-1.5">
            <Users className="w-3.5 h-3.5 shrink-0" />
            <span>Includes {metrics.paidDroppedStudents} dropped student(s) · PKR {formatPkrPlain(metrics.paidDroppedAmt)}</span>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-2xs flex flex-col justify-between">
          <div className="p-4 flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-xl bg-rose-500 text-white flex items-center justify-center shrink-0">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div>
              <p className="text-[11px] font-semibold text-slate-500">Outstanding</p>
              <p className="text-lg font-extrabold text-slate-900">
                {formatPkrPlain(metrics.outstandingTotal)} <span className="text-xs font-semibold text-slate-500">PKR</span>
              </p>
              <p className="text-[11px] text-slate-500">{metrics.outstandingInvoices} invoice(s) · {metrics.outstandingStudents} student(s)</p>
            </div>
          </div>
          <div className="bg-rose-50/70 border-t border-rose-100 px-3.5 py-2 text-[11px] text-rose-800 font-medium flex items-center gap-1.5">
            <Users className="w-3.5 h-3.5 shrink-0" />
            <span>Includes {metrics.outstandingDroppedStudents} dropped student(s) · PKR {formatPkrPlain(metrics.outstandingDroppedAmt)}</span>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-2xs flex flex-col justify-between">
          <div className="p-4 flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-xl bg-cyan-500 text-white flex items-center justify-center shrink-0">
              <Percent className="w-5 h-5" />
            </div>
            <div>
              <p className="text-[11px] font-semibold text-slate-500">Waivers / discounts</p>
              <p className="text-lg font-extrabold text-slate-900">
                {formatPkrPlain(metrics.waiverTotal)} <span className="text-xs font-semibold text-slate-500">PKR</span>
              </p>
              <p className="text-[11px] text-slate-500">{metrics.waiverLines} student lines · {metrics.waiverInvoices} invoice(s)</p>
            </div>
          </div>
          <div className="bg-cyan-50/70 border-t border-cyan-100 px-3.5 py-2 text-[11px] text-cyan-800 font-medium flex items-center gap-1.5">
            <Users className="w-3.5 h-3.5 shrink-0" />
            <span>Includes {metrics.waiverDroppedStudents} dropped student(s) · PKR {formatPkrPlain(metrics.waiverDroppedAmt)}</span>
          </div>
        </div>
      </div>

      {/* Date Range & Filters Card (Picks 3, 4, 5) */}
      <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-2xs space-y-3">
        {/* 3 Date Mode Tabs */}
        <div className="inline-flex rounded-lg border border-slate-200 p-0.5 bg-slate-50">
          {[
            { id: 'today', label: 'Today' },
            { id: 'month', label: 'This Month' },
            { id: 'custom', label: 'Custom Range' }
          ].map((t) => {
            const active = dateMode === t.id
            return (
              <button
                key={t.id}
                type="button"
                onClick={() => handleSwitchDateMode(t.id)}
                className={`px-3.5 py-1.5 rounded-md text-xs font-bold transition-colors cursor-pointer ${
                  active ? 'bg-teal-700 text-white shadow-2xs' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {t.label}
              </button>
            )
          })}
        </div>

        {/* Filter Controls Row */}
        <div className="flex flex-wrap items-end gap-2.5">
          {dateMode === 'month' && (
            <>
              <div className="min-w-[130px] flex-1">
                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Month</label>
                <select
                  value={filterMonth}
                  onChange={(e) => {
                    const nextM = Number(e.target.value)
                    setFilterMonth(nextM)
                    setAppliedFilters((prev) => ({ ...prev, filterMonth: nextM }))
                  }}
                  className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 bg-white text-xs text-slate-800 font-medium"
                >
                  {MONTHS.map((m, idx) => (
                    <option key={m} value={idx}>{m}</option>
                  ))}
                </select>
              </div>
              <div className="min-w-[100px] flex-1">
                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Year</label>
                <select
                  value={filterYear}
                  onChange={(e) => {
                    const nextY = Number(e.target.value)
                    setFilterYear(nextY)
                    setAppliedFilters((prev) => ({ ...prev, filterYear: nextY }))
                  }}
                  className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 bg-white text-xs text-slate-800 font-medium"
                >
                  {yearOptions.map((y) => (
                    <option key={y} value={y}>{y}</option>
                  ))}
                </select>
              </div>
            </>
          )}

          {dateMode === 'custom' && (
            <>
              <div className="min-w-[135px] flex-1">
                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">From</label>
                <input
                  type="date"
                  value={customFrom}
                  onChange={(e) => {
                    const val = e.target.value
                    setCustomFrom(val)
                    setAppliedFilters((prev) => ({ ...prev, customFrom: val }))
                  }}
                  className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 bg-white text-xs text-slate-800 font-medium"
                />
              </div>
              <div className="min-w-[135px] flex-1">
                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">To</label>
                <input
                  type="date"
                  value={customTo}
                  onChange={(e) => {
                    const val = e.target.value
                    setCustomTo(val)
                    setAppliedFilters((prev) => ({ ...prev, customTo: val }))
                  }}
                  className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 bg-white text-xs text-slate-800 font-medium"
                />
              </div>
            </>
          )}

          <div className="min-w-[120px] flex-1">
            <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Class</label>
            <select
              value={classFilter}
              onChange={(e) => setClassFilter(e.target.value)}
              className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 bg-white text-xs text-slate-700 font-medium"
            >
              <option value="ALL">All classes</option>
              {availableClasses.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>

          <div className="min-w-[120px] flex-1">
            <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Schedule</label>
            <select
              value={scheduleFilter}
              onChange={(e) => setScheduleFilter(e.target.value)}
              className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 bg-white text-xs text-slate-700 font-medium"
            >
              <option value="ALL">All schedules</option>
              {SCHEDULES.map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </div>

          <div className="min-w-[115px] flex-1">
            <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Kind</label>
            <select
              value={kindFilter}
              onChange={(e) => setKindFilter(e.target.value)}
              className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 bg-white text-xs text-slate-700 font-medium"
            >
              <option value="ALL">All invoices</option>
              {INVOICE_KINDS.map((k) => (
                <option key={k} value={k}>{k}</option>
              ))}
            </select>
          </div>

          <div className="min-w-[130px] flex-1">
            <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Fee Head / Type</label>
            <select
              value={headFilter}
              onChange={(e) => setHeadFilter(e.target.value)}
              className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 bg-white text-xs text-slate-700 font-medium"
            >
              <option value="ALL">All fee head / types</option>
              {FEE_HEADS.map((h) => (
                <option key={h} value={h}>{h}</option>
              ))}
            </select>
          </div>

          <div className="min-w-[110px] flex-1">
            <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Status</label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 bg-white text-xs text-slate-700 font-medium"
            >
              <option value="ALL">All status</option>
              <option value="Pending">Pending</option>
              <option value="Partial">Partial</option>
              <option value="Paid">Paid</option>
              <option value="Overdue">Overdue</option>
            </select>
          </div>

          <div className="min-w-[140px] flex-1">
            <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Students</label>
            <select
              value={studentScopeFilter}
              onChange={(e) => setStudentScopeFilter(e.target.value)}
              className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 bg-white text-xs text-slate-700 font-medium"
            >
              <option value="ALL">All (Active + Dropped)</option>
              <option value="Active">Active Only</option>
              <option value="Dropped">Dropped / Graduated</option>
            </select>
          </div>

          <div className="flex items-center gap-1.5 shrink-0">
            <button
              type="button"
              onClick={handleApplyFilters}
              className="px-4 py-1.5 rounded-lg bg-teal-700 hover:bg-teal-800 text-white text-xs font-bold cursor-pointer transition-colors"
            >
              Apply
            </button>
            <button
              type="button"
              onClick={handleClearFilters}
              className="px-3 py-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-600 text-xs font-semibold cursor-pointer transition-colors"
            >
              Clear
            </button>
          </div>
        </div>
      </div>

      {/* Invoice Records Card (Picks 2–5) */}
      <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-2xs space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2 text-sm text-slate-800">
            <FileText className="w-4 h-4 text-slate-500" />
            <span className="font-bold">Invoice records</span>
            <span className="text-slate-400">·</span>
            <span className="text-xs font-medium text-slate-500">{rangeLabel}</span>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={openClassInvoiceModal}
              className="px-3.5 py-2 rounded-lg bg-teal-700 hover:bg-teal-800 text-white text-xs font-bold inline-flex items-center gap-1.5 cursor-pointer transition-colors"
            >
              <Users className="w-3.5 h-3.5" />
              <span>Class Invoice</span>
            </button>
            <button
              type="button"
              onClick={openIndividualModal}
              className="px-3.5 py-2 rounded-lg border border-slate-300 bg-white hover:bg-slate-50 text-slate-800 text-xs font-bold inline-flex items-center gap-1.5 cursor-pointer transition-colors"
            >
              <User className="w-3.5 h-3.5 text-slate-600" />
              <span>Individual Invoice</span>
            </button>

            <div className="relative" ref={exportRef}>
              <button
                type="button"
                onClick={() => setExportOpen((o) => !o)}
                className="px-3 py-2 rounded-lg border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold inline-flex items-center gap-1 cursor-pointer transition-colors"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Export</span>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
              </button>
              {exportOpen && (
                <div className="absolute right-0 mt-1 w-44 rounded-lg bg-white border border-slate-200 shadow-lg py-1 z-30 text-xs">
                  <button
                    type="button"
                    onClick={handleExportCsv}
                    className="w-full px-3.5 py-2 text-left hover:bg-slate-50 font-semibold text-slate-700 cursor-pointer flex items-center gap-2"
                  >
                    <Download className="w-3.5 h-3.5 text-slate-400" />
                    <span>Export CSV Register</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => { setExportOpen(false); window.print() }}
                    className="w-full px-3.5 py-2 text-left hover:bg-slate-50 font-semibold text-slate-700 cursor-pointer flex items-center gap-2"
                  >
                    <Printer className="w-3.5 h-3.5 text-slate-400" />
                    <span>Print Current View</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Empty Banner (Pick 3) OR Records Table (Pick 2, 4, 5) */}
        {filteredInvoices.length === 0 ? (
          <div className="rounded-xl bg-sky-50 border border-sky-200 py-5 px-4 flex flex-col items-center justify-center text-center gap-1">
            <div className="flex items-center gap-2 text-sky-900 text-xs font-bold">
              <Info className="w-4 h-4 text-sky-700" />
              <span>No Invoices Found</span>
            </div>
            <p className="text-[11px] text-sky-700">No invoices found for the selected filters.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs min-w-[780px]">
              <thead className="border-b border-slate-200 text-slate-600 text-[11px] font-bold">
                <tr>
                  <th className="py-2.5 px-3 w-10">#</th>
                  <th className="py-2.5 px-3 text-center">Type</th>
                  <th className="py-2.5 px-3">Student / Class</th>
                  <th
                    onClick={() => toggleSort('invoice')}
                    className="py-2.5 px-3 cursor-pointer hover:text-slate-900 select-none"
                  >
                    <span className="inline-flex items-center gap-1">
                      Invoice
                      {sortKey === 'invoice' ? (sortDir === 'asc' ? <ArrowUp className="w-3 h-3" /> : <ArrowDown className="w-3 h-3" />) : <ArrowUpDown className="w-3 h-3 text-slate-400" />}
                    </span>
                  </th>
                  <th
                    onClick={() => toggleSort('amount')}
                    className="py-2.5 px-3 text-right cursor-pointer hover:text-slate-900 select-none"
                  >
                    <span className="inline-flex items-center gap-1">
                      Amount
                      {sortKey === 'amount' ? (sortDir === 'asc' ? <ArrowUp className="w-3 h-3" /> : <ArrowDown className="w-3 h-3" />) : <ArrowUpDown className="w-3 h-3 text-slate-400" />}
                    </span>
                  </th>
                  <th className="py-2.5 px-3 text-center">Paid / pending</th>
                  <th
                    onClick={() => toggleSort('activity')}
                    className="py-2.5 px-3 cursor-pointer hover:text-slate-900 select-none"
                  >
                    <span className="inline-flex items-center gap-1 text-blue-600">
                      Activity
                      {sortKey === 'activity' ? (sortDir === 'asc' ? <ArrowUp className="w-3 h-3" /> : <ArrowDown className="w-3 h-3" />) : <ArrowUpDown className="w-3 h-3 text-slate-400" />}
                    </span>
                  </th>
                  <th className="py-2.5 px-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredInvoices.map((f, idx) => {
                  const std = f.studentId ? studentById.get(f.studentId) : instStudents.find((s) => (s.fullName || s.name) === f.studentName)
                  const total = getFeeTotal(f)
                  const rem = getFeeRemaining(f)
                  const act = formatRelativeActivity(getFeeDateIso(f))
                  const isClass = (f.invoiceType || '').toLowerCase() === 'class'
                  const st = f.status || 'Pending'
                  const badgeCls =
                    st === 'Paid'
                      ? 'bg-emerald-500 text-white'
                      : st === 'Partial'
                        ? 'bg-amber-500 text-white'
                        : 'bg-orange-500 text-white'

                  return (
                    <tr key={f.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="py-3 px-3 text-slate-500 font-semibold">{idx + 1}</td>

                      <td className="py-3 px-3 text-center">
                        <div className="flex flex-col items-center gap-1">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold text-white ${isClass ? 'bg-teal-600' : 'bg-blue-600'}`}>
                            {isClass ? 'Class' : 'Individual'}
                          </span>
                          <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-700 border border-slate-200 text-[10px] font-medium">
                            {f.className || std?.className || 'Class'}
                          </span>
                        </div>
                      </td>

                      <td className="py-3 px-3">
                        <button
                          type="button"
                          onClick={() => onOpenBillingHistory?.(std?.id || f.studentId || null)}
                          className="font-bold text-blue-600 hover:underline text-left cursor-pointer"
                          title="Open Student Billing History"
                        >
                          {f.studentName || std?.fullName || std?.name || 'Student'}
                        </button>
                        <div className="text-[11px] text-slate-500">{f.fatherName || std?.fatherName || 'Guardian'}</div>
                        <div className="flex flex-wrap items-center gap-1 mt-1">
                          <span className="px-1.5 py-0.5 rounded bg-slate-100 border border-slate-200 text-[10px] font-semibold text-slate-600">
                            Roll No: {f.rollNumber || std?.rollNumber || 'N/A'}
                          </span>
                          {(f.admissionNo || std?.admissionNo) && (
                            <span className="px-1.5 py-0.5 rounded bg-slate-100 border border-slate-200 text-[10px] font-semibold text-slate-600">
                              Ad No: {f.admissionNo || std?.admissionNo}
                            </span>
                          )}
                        </div>
                      </td>

                      <td className="py-3 px-3">
                        <div className="font-bold text-slate-900">{f.feeTitle || f.feeHead || f.feeType || 'Tuition Fee'}</div>
                        <span className="inline-block mt-1 px-2 py-0.5 rounded bg-emerald-600 text-white text-[10px] font-bold">
                          {f.feeHead || f.feeType || 'Tuition Fee'}
                        </span>
                      </td>

                      <td className="py-3 px-3 text-right">
                        <div className="font-extrabold text-slate-900">{formatPkrDec(total)}</div>
                        <div className="text-[10px] text-slate-500">Due: {formatPkrDec(rem)}</div>
                      </td>

                      <td className="py-3 px-3 text-center">
                        <span className={`px-2.5 py-0.5 rounded text-[10px] font-bold ${badgeCls}`}>
                          {st}
                        </span>
                      </td>

                      <td className="py-3 px-3">
                        <div className="font-bold text-slate-800">{act.short}</div>
                        <div className="text-[10px] text-slate-400">{act.rel}</div>
                      </td>

                      <td className="py-3 px-3 text-right">
                        <div className="inline-flex items-center gap-1">
                          <button
                            type="button"
                            onClick={() => setReceiptFee(f)}
                            className="px-2 py-1 rounded border border-cyan-300 text-cyan-700 hover:bg-cyan-50 text-[11px] font-semibold cursor-pointer"
                          >
                            Receipt
                          </button>
                          <button
                            type="button"
                            onClick={() => openEditModal(f)}
                            className="px-2 py-1 rounded border border-blue-300 text-blue-700 hover:bg-blue-50 text-[11px] font-semibold cursor-pointer"
                          >
                            Edit
                          </button>
                          <button
                            type="button"
                            onClick={() => setDeleteFee(f)}
                            className="px-2 py-1 rounded border border-rose-300 text-rose-600 hover:bg-rose-50 text-[11px] font-semibold cursor-pointer"
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal 1: Generate Class Invoice (Pick 2) + Nested Select Classes Modal (Picks 3 & 4) */}
      {classModalOpen && (
        <div className="fixed inset-0 z-[100] bg-slate-900/50 backdrop-blur-[1px] flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-xl overflow-hidden border border-slate-200 relative">
            {/* Clean Light Header matching Pick 2 */}
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
                  <Users className="w-4 h-4" />
                </div>
                <div>
                  <h2 className="text-sm font-bold text-slate-900">Generate class invoice</h2>
                  <p className="text-[11px] text-slate-500">One billed line per student in the class you select.</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setClassModalOpen(false)}
                className="text-slate-400 hover:text-slate-700 p-1 rounded-lg cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleGenerateClassInvoices} className="p-6 space-y-5 text-xs">
              {/* INVOICE DETAILS */}
              <div className="space-y-3">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Invoice Details</p>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block font-bold text-slate-800 mb-1">
                      Invoice title <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. November Fee"
                      value={classForm.invoiceTitle}
                      onChange={(e) => setClassForm((p) => ({ ...p, invoiceTitle: e.target.value }))}
                      className="w-full px-3 py-2 rounded-lg border border-slate-200 text-xs text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                      required
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-800 mb-1">
                      Fee type <span className="text-rose-500">*</span>
                    </label>
                    <select
                      value={classForm.feeType}
                      onChange={(e) => setClassForm((p) => ({ ...p, feeType: e.target.value }))}
                      className="w-full px-3 py-2 rounded-lg border border-slate-200 bg-white text-xs text-slate-800 font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                      required
                    >
                      <option value="">Select type</option>
                      {FEE_HEADS.map((h) => (
                        <option key={h} value={h}>{h}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block font-bold text-slate-800 mb-1">
                      Class <span className="text-rose-500">*</span>
                    </label>
                    <div className="flex items-center gap-1.5">
                      <select
                        value={
                          classForm.selectedClasses.length === 1
                            ? classForm.selectedClasses[0]
                            : classForm.selectedClasses.length > 1
                              ? '__MULTI__'
                              : ''
                        }
                        onChange={(e) => {
                          const val = e.target.value
                          if (!val) setClassForm((p) => ({ ...p, selectedClasses: [] }))
                          else if (val !== '__MULTI__') setClassForm((p) => ({ ...p, selectedClasses: [val] }))
                        }}
                        className="flex-1 min-w-0 px-2.5 py-2 rounded-lg border border-slate-200 bg-white text-xs text-slate-800 font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                      >
                        <option value="">Select class</option>
                        {classForm.selectedClasses.length > 1 && (
                          <option value="__MULTI__">
                            {classForm.selectedClasses.length} classes ({selectedClassTargets.length} students)
                          </option>
                        )}
                        {availableClasses.map((c) => (
                          <option key={c} value={c}>{c}</option>
                        ))}
                      </select>
                      <button
                        type="button"
                        onClick={openSelectClassesModal}
                        title="Select multiple classes"
                        className="p-2 rounded-lg border border-blue-400 text-blue-600 hover:bg-blue-50 transition-colors cursor-pointer shrink-0"
                      >
                        <List className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* SCHEDULE & AMOUNT */}
              <div className="space-y-3 pt-1 border-t border-slate-100">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider pt-2">Schedule &amp; Amount</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block font-bold text-slate-800 mb-1">
                      Amount (PKR) <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      placeholder="0.00"
                      value={classForm.amount}
                      onChange={(e) => setClassForm((p) => ({ ...p, amount: e.target.value }))}
                      className="w-full px-3 py-2 rounded-lg border border-slate-200 text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                      required
                    />
                    <p className="text-[10px] text-slate-400 mt-1">Use 0 if all students have fee setup.</p>
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-1">
                      Notes <span className="font-normal text-slate-400">(optional)</span>
                    </label>
                    <input
                      type="text"
                      placeholder="Shown on invoice or for internal reference"
                      value={classForm.notes}
                      onChange={(e) => setClassForm((p) => ({ ...p, notes: e.target.value }))}
                      className="w-full px-3 py-2 rounded-lg border border-slate-200 text-xs text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block font-bold text-slate-800 mb-1">
                      Billing/Fee Month <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="month"
                      value={classForm.billingMonth}
                      onChange={(e) => setClassForm((p) => ({ ...p, billingMonth: e.target.value }))}
                      className="w-full px-3 py-2 rounded-lg border border-slate-200 bg-white text-xs text-slate-800 font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                      required
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-1">
                      Due date <span className="font-normal text-slate-400">(optional)</span>
                    </label>
                    <input
                      type="date"
                      value={classForm.dueDate}
                      onChange={(e) => setClassForm((p) => ({ ...p, dueDate: e.target.value }))}
                      className="w-full px-3 py-2 rounded-lg border border-slate-200 bg-white text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-1">
                      Late fine (PKR) <span className="font-normal text-slate-400">(optional)</span>
                    </label>
                    <input
                      type="number"
                      min="0"
                      value={classForm.lateFine}
                      onChange={(e) => setClassForm((p) => ({ ...p, lateFine: e.target.value }))}
                      className="w-full px-3 py-2 rounded-lg border border-slate-200 text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                    />
                  </div>
                </div>
              </div>

              {/* Footer */}
              <div className="pt-3 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="space-y-0.5 max-w-xs">
                  <label className="inline-flex items-center gap-2 font-bold text-slate-800 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={classForm.notifySms}
                      onChange={(e) => setClassForm((p) => ({ ...p, notifySms: e.target.checked }))}
                      className="rounded border-slate-300 text-blue-600"
                    />
                    <span>Notify parents (SMS)</span>
                  </label>
                  <p className="text-[10px] text-slate-400 leading-snug">
                    {classForm.selectedClasses.length === 0
                      ? 'Select a class to see how many parents are missing a phone number.'
                      : missingPhoneCount > 0
                        ? `${selectedClassTargets.length} student(s) in ${classForm.selectedClasses.length} class(es) · ${missingPhoneCount} parent(s) missing a phone number.`
                        : `${selectedClassTargets.length} student(s) in ${classForm.selectedClasses.length} class(es) · All parents have phone numbers.`}
                  </p>
                </div>

                <div className="flex items-center justify-end gap-2 shrink-0">
                  <button
                    type="button"
                    onClick={() => setClassModalOpen(false)}
                    className="px-4 py-2 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 font-semibold cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isGenerating}
                    className="px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold inline-flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                  >
                    <Check className="w-3.5 h-3.5" />
                    <span>{isGenerating ? 'Generating...' : 'Generate invoices'}</span>
                  </button>
                </div>
              </div>
            </form>

            {/* Nested Modal: Select classes (Pick 4) */}
            {selectClassesOpen && (
              <div className="fixed inset-0 z-[120] bg-slate-900/40 flex items-center justify-center p-4">
                <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md border-2 border-rose-400/0 ring-1 ring-slate-200 overflow-hidden">
                  <div className="px-5 py-3.5 border-b border-slate-100 flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0">
                        <List className="w-4 h-4" />
                      </div>
                      <div>
                        <h3 className="text-sm font-bold text-slate-900">Select classes</h3>
                        <p className="text-[11px] text-slate-500">One invoice is created for each class you tick.</p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => setSelectClassesOpen(false)}
                      className="text-slate-400 hover:text-slate-700 p-1 cursor-pointer"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="p-5 space-y-3 text-xs">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 font-semibold">
                        <button
                          type="button"
                          onClick={() => setDraftSelectedClasses(classStudentCounts.map((c) => c.name))}
                          className="text-blue-600 hover:underline cursor-pointer"
                        >
                          Select all
                        </button>
                        <span className="text-slate-300">·</span>
                        <button
                          type="button"
                          onClick={() => setDraftSelectedClasses([])}
                          className="text-blue-600 hover:underline cursor-pointer"
                        >
                          Clear
                        </button>
                      </div>
                      <span className="text-[11px] text-slate-500 font-medium">
                        {draftSelectedClasses.length} classes ·{' '}
                        {classStudentCounts
                          .filter((c) => draftSelectedClasses.includes(c.name))
                          .reduce((sum, c) => sum + c.count, 0)}{' '}
                        students
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-2 max-h-60 overflow-y-auto pr-0.5">
                      {classStudentCounts.length === 0 ? (
                        <p className="col-span-2 text-center text-slate-400 py-6">No classes available.</p>
                      ) : (
                        classStudentCounts.map((item) => {
                          const checked = draftSelectedClasses.includes(item.name)
                          return (
                            <label
                              key={item.name}
                              className={`flex items-center justify-between px-3 py-2 rounded-lg border cursor-pointer transition-colors ${
                                checked
                                  ? 'border-blue-500 bg-blue-50/50'
                                  : 'border-slate-200 hover:bg-slate-50'
                              }`}
                            >
                              <span className="flex items-center gap-2 min-w-0">
                                <input
                                  type="checkbox"
                                  checked={checked}
                                  onChange={() =>
                                    setDraftSelectedClasses((prev) =>
                                      prev.includes(item.name) ? prev.filter((x) => x !== item.name) : [...prev, item.name]
                                    )
                                  }
                                  className="rounded border-slate-300 text-blue-600 shrink-0"
                                />
                                <span className="font-semibold text-slate-800 truncate">{item.name}</span>
                              </span>
                              <span className="text-[10px] text-slate-400 shrink-0 ml-1.5">
                                {item.count} {item.count === 1 ? 'student' : 'students'}
                              </span>
                            </label>
                          )
                        })
                      )}
                    </div>

                    <div className="flex items-center justify-between pt-3 border-t border-slate-100">
                      <button
                        type="button"
                        onClick={() => setSelectClassesOpen(false)}
                        className="px-4 py-1.5 rounded-lg border border-slate-200 text-slate-700 font-semibold hover:bg-slate-50 cursor-pointer"
                      >
                        Cancel
                      </button>
                      <button
                        type="button"
                        onClick={applySelectedClasses}
                        className="px-4 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-bold inline-flex items-center gap-1.5 cursor-pointer"
                      >
                        <Check className="w-3.5 h-3.5" />
                        <span>Apply</span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Modal 2: Individual Invoice Generator */}
      {indivModalOpen && (
        <div className="fixed inset-0 z-[100] bg-slate-900/50 backdrop-blur-[1px] flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg overflow-hidden border border-slate-200">
            <div className="bg-indigo-600 px-5 py-3.5 flex items-center justify-between text-white">
              <div className="flex items-center gap-2 font-bold text-sm">
                <User className="w-4 h-4" />
                <span>Generate Individual Invoice</span>
              </div>
              <button type="button" onClick={() => setIndivModalOpen(false)} className="text-white/80 hover:text-white cursor-pointer">
                <X className="w-4 h-4" />
              </button>
            </div>
            <form onSubmit={handleGenerateIndividualInvoice} className="p-5 space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Class</label>
                  <select
                    value={indivForm.className}
                    onChange={(e) => {
                      const cls = e.target.value
                      const firstInCls = instStudents.find((s) => !cls || s.className === cls)
                      setIndivForm((p) => ({
                        ...p,
                        className: cls,
                        studentId: firstInCls?.id || '',
                        grossAmount: String(firstInCls?.monthlyFee || firstInCls?.tuitionFee || p.grossAmount)
                      }))
                    }}
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 bg-white"
                  >
                    <option value="">All Classes</option>
                    {availableClasses.map((c) => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Student *</label>
                  <select
                    value={indivForm.studentId}
                    onChange={(e) => {
                      const st = studentById.get(e.target.value)
                      setIndivForm((p) => ({
                        ...p,
                        studentId: e.target.value,
                        grossAmount: String(st?.monthlyFee || st?.tuitionFee || p.grossAmount)
                      }))
                    }}
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 bg-white font-semibold"
                    required
                  >
                    <option value="">Select student...</option>
                    {indivStudentsInClass.map((s) => (
                      <option key={s.id} value={s.id}>{s.fullName || s.name} · Roll {s.rollNumber || 'N/A'}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Fee Head / Type *</label>
                  <select
                    value={indivForm.feeHead}
                    onChange={(e) => setIndivForm((p) => ({ ...p, feeHead: e.target.value, feeTitle: e.target.value }))}
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 bg-white font-semibold"
                  >
                    {FEE_HEADS.map((h) => <option key={h} value={h}>{h}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Invoice Title *</label>
                  <input
                    type="text"
                    value={indivForm.feeTitle}
                    onChange={(e) => setIndivForm((p) => ({ ...p, feeTitle: e.target.value }))}
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 font-semibold"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Schedule</label>
                  <select
                    value={indivForm.schedule}
                    onChange={(e) => setIndivForm((p) => ({ ...p, schedule: e.target.value }))}
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 bg-white"
                  >
                    {SCHEDULES.map((s) => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Kind</label>
                  <select
                    value={indivForm.kind}
                    onChange={(e) => setIndivForm((p) => ({ ...p, kind: e.target.value }))}
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 bg-white"
                  >
                    {INVOICE_KINDS.map((k) => <option key={k} value={k}>{k}</option>)}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Amount (PKR) *</label>
                  <input
                    type="number"
                    min="0"
                    value={indivForm.grossAmount}
                    onChange={(e) => setIndivForm((p) => ({ ...p, grossAmount: e.target.value }))}
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 font-bold"
                    required
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Waiver / Discount (PKR)</label>
                  <input
                    type="number"
                    min="0"
                    value={indivForm.discount}
                    onChange={(e) => setIndivForm((p) => ({ ...p, discount: e.target.value }))}
                    className="w-full px-3 py-2 rounded-lg border border-slate-200"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Due Date *</label>
                  <input
                    type="date"
                    value={indivForm.dueDate}
                    onChange={(e) => setIndivForm((p) => ({ ...p, dueDate: e.target.value }))}
                    className="w-full px-3 py-2 rounded-lg border border-slate-200"
                    required
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Status</label>
                  <select
                    value={indivForm.status}
                    onChange={(e) => setIndivForm((p) => ({ ...p, status: e.target.value }))}
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 bg-white font-semibold"
                  >
                    <option value="Pending">Pending</option>
                    <option value="Paid">Paid</option>
                  </select>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                <button type="button" onClick={() => setIndivModalOpen(false)} className="px-4 py-2 rounded-lg border border-slate-200 text-slate-600 font-semibold cursor-pointer">Cancel</button>
                <button type="submit" className="px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-bold cursor-pointer">Create Invoice</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal 3: Edit Invoice */}
      {editFee && (
        <div className="fixed inset-0 z-[100] bg-slate-900/50 backdrop-blur-[1px] flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-md overflow-hidden border border-slate-200">
            <div className="bg-blue-600 px-5 py-3.5 flex items-center justify-between text-white">
              <span className="font-bold text-sm">Edit Invoice — {editFee.studentName}</span>
              <button type="button" onClick={() => setEditFee(null)} className="text-white/80 hover:text-white cursor-pointer">
                <X className="w-4 h-4" />
              </button>
            </div>
            <form onSubmit={handleSaveEdit} className="p-5 space-y-3 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Invoice Title</label>
                <input
                  type="text"
                  value={editForm.feeTitle}
                  onChange={(e) => setEditForm((p) => ({ ...p, feeTitle: e.target.value }))}
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 font-semibold"
                  required
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Fee Head</label>
                  <select
                    value={editForm.feeHead}
                    onChange={(e) => setEditForm((p) => ({ ...p, feeHead: e.target.value }))}
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 bg-white"
                  >
                    {FEE_HEADS.map((h) => <option key={h} value={h}>{h}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Status</label>
                  <select
                    value={editForm.status}
                    onChange={(e) => setEditForm((p) => ({ ...p, status: e.target.value }))}
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 bg-white font-semibold"
                  >
                    <option value="Pending">Pending</option>
                    <option value="Partial">Partial</option>
                    <option value="Paid">Paid</option>
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Amount (PKR)</label>
                  <input
                    type="number"
                    min="0"
                    value={editForm.amount}
                    onChange={(e) => setEditForm((p) => ({ ...p, amount: e.target.value }))}
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 font-bold"
                    required
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Waiver (PKR)</label>
                  <input
                    type="number"
                    min="0"
                    value={editForm.discount}
                    onChange={(e) => setEditForm((p) => ({ ...p, discount: e.target.value }))}
                    className="w-full px-3 py-2 rounded-lg border border-slate-200"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Due Date</label>
                  <input
                    type="date"
                    value={editForm.dueDate}
                    onChange={(e) => setEditForm((p) => ({ ...p, dueDate: e.target.value }))}
                    className="w-full px-3 py-2 rounded-lg border border-slate-200"
                  />
                </div>
              </div>
              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                <button type="button" onClick={() => setEditFee(null)} className="px-4 py-2 rounded-lg border border-slate-200 text-slate-600 font-semibold cursor-pointer">Cancel</button>
                <button type="submit" className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-bold cursor-pointer">Save Changes</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal 4: Delete Invoice Confirmation */}
      {deleteFee && (
        <div className="fixed inset-0 z-[100] bg-slate-900/50 backdrop-blur-[1px] flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-sm p-5 space-y-4 border border-slate-200">
            <h3 className="text-sm font-bold text-slate-900">Delete Invoice?</h3>
            <p className="text-xs text-slate-600">
              Delete <strong>{deleteFee.feeTitle || deleteFee.feeHead || 'Tuition Fee'}</strong> for <strong>{deleteFee.studentName}</strong> ({formatPkrDec(getFeeTotal(deleteFee))})?
            </p>
            <div className="flex justify-end gap-2">
              <button type="button" onClick={() => setDeleteFee(null)} className="px-3.5 py-2 rounded-lg border border-slate-200 text-xs font-semibold text-slate-600 cursor-pointer">Cancel</button>
              <button type="button" onClick={handleConfirmDelete} className="px-4 py-2 rounded-lg bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold cursor-pointer">Delete</button>
            </div>
          </div>
        </div>
      )}

      {/* Modal 5: Receipt / Fee Challan Print */}
      {receiptFee && (
        <PrintableFeeChallanModal
          isOpen={Boolean(receiptFee)}
          onClose={() => setReceiptFee(null)}
          selectedFee={receiptFee}
          allFees={filteredInvoices}
          students={instStudents}
          currentInstitute={currentInstitute}
          defaultClass={receiptFee?.className || ''}
        />
      )}
    </div>
  )
}

export default InvoicesView
