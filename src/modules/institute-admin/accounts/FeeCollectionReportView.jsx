import React, { useState, useMemo, useRef, useEffect } from 'react'
import {
  ArrowLeft,
  UserPlus,
  DollarSign,
  FileText,
  ArrowDownCircle,
  MessageSquare,
  Wallet,
  Percent,
  AlertTriangle,
  Users,
  Printer,
  Download,
  ChevronDown,
  Receipt
} from 'lucide-react'
import { useAppData } from '../../../context/AppDataContext'
import { useToast } from '../../../context/ToastContext'
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
  'Registration fee',
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

const pad2 = (n) => String(n).padStart(2, '0')
const toIsoDate = (d) => `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}`
const normalizeCnic = (v = '') => String(v).replace(/[^0-9]/g, '')
const formatHuman = (iso) => {
  if (!iso) return ''
  const parts = String(iso).slice(0, 10).split('-')
  if (parts.length !== 3) return iso
  return `${pad2(Number(parts[2]))} ${SHORT_MONTHS[Number(parts[1]) - 1] || parts[1]} ${parts[0]}`
}
const formatNum = (val) => Number(val || 0).toLocaleString()

const getFeeDateIso = (fee) => {
  const raw = fee?.paidAt || fee?.paymentDate || fee?.createdAt || fee?.dueDate || ''
  return raw ? String(raw).slice(0, 10) : toIsoDate(new Date())
}
const getFeeTotal = (f) => Number(f?.amount || 0) + Number(f?.fine || f?.lateFine || 0)
const getFeePaid = (f) => {
  if (f?.paidAmount !== undefined && f?.paidAmount !== null) return Number(f.paidAmount)
  if (f?.status === 'Paid') return getFeeTotal(f)
  if (f?.status === 'Partial') return Number(f?.finalPaid || 0)
  return 0
}
const getFeeWaiver = (f) =>
  Number(f?.discount || f?.waiver || f?.discountAmount || 0) + Number(f?.waivedLateFee || 0)
const getFeeRemaining = (f) => {
  if (f?.status === 'Paid') return 0
  return Math.max(0, getFeeTotal(f) - getFeePaid(f) - getFeeWaiver(f))
}

export const FeeCollectionReportView = ({
  currentInstitute,
  onRouteChange,
  onOpenQuickPayment,
  onOpenSendSms,
  onOpenBillingHistory
}) => {
  const { fees = [], students = [], classes = [], sendCommunicationBlast } = useAppData()
  const { toast } = useToast()

  const now = useMemo(() => new Date(), [])
  const todayIso = toIsoDate(now)

  const instStudents = useMemo(
    () =>
      students.filter(
        (s) =>
          (!currentInstitute?.id || s.instituteId === currentInstitute.id || !s.instituteId) &&
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

  // Filters
  const [dateMode, setDateMode] = useState('month') // 'today' | 'month' | 'custom'
  const [familyWise, setFamilyWise] = useState(true)
  const [filterMonth, setFilterMonth] = useState(now.getMonth())
  const [filterYear, setFilterYear] = useState(now.getFullYear())
  const [customFrom, setCustomFrom] = useState(() => `${now.getFullYear()}-${pad2(now.getMonth() + 1)}-01`)
  const [customTo, setCustomTo] = useState(() => {
    const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate()
    return `${now.getFullYear()}-${pad2(now.getMonth() + 1)}-${pad2(lastDay)}`
  })
  const [studentQuery, setStudentQuery] = useState('')
  const [classFilter, setClassFilter] = useState('ALL')
  const [headFilter, setHeadFilter] = useState('ALL')
  const [statusFilter, setStatusFilter] = useState('ALL')
  const [studentScope, setStudentScope] = useState('ALL')

  const [applied, setApplied] = useState({
    dateMode: 'month',
    filterMonth: now.getMonth(),
    filterYear: now.getFullYear(),
    customFrom: `${now.getFullYear()}-${pad2(now.getMonth() + 1)}-01`,
    customTo: `${now.getFullYear()}-${pad2(now.getMonth() + 1)}-${pad2(new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate())}`,
    studentQuery: '',
    classFilter: 'ALL',
    headFilter: 'ALL',
    statusFilter: 'ALL',
    studentScope: 'ALL'
  })

  const switchDateMode = (mode) => {
    setDateMode(mode)
    setApplied((prev) => ({ ...prev, dateMode: mode }))
  }

  const handleApply = () => {
    setApplied({
      dateMode,
      filterMonth,
      filterYear,
      customFrom,
      customTo,
      studentQuery,
      classFilter,
      headFilter,
      statusFilter,
      studentScope
    })
  }

  const rangeBounds = useMemo(() => {
    if (applied.dateMode === 'today') return { start: todayIso, end: todayIso }
    if (applied.dateMode === 'custom') {
      const s = applied.customFrom || todayIso
      const e = applied.customTo || s
      return s <= e ? { start: s, end: e } : { start: e, end: s }
    }
    const lastDay = new Date(applied.filterYear, applied.filterMonth + 1, 0).getDate()
    return {
      start: `${applied.filterYear}-${pad2(applied.filterMonth + 1)}-01`,
      end: `${applied.filterYear}-${pad2(applied.filterMonth + 1)}-${pad2(lastDay)}`
    }
  }, [applied, todayIso])

  const filteredFees = useMemo(() => {
    const q = applied.studentQuery.trim().toLowerCase()
    return fees.filter((f) => {
      if (currentInstitute?.id && f.instituteId && f.instituteId !== currentInstitute.id) return false
      const d = getFeeDateIso(f)
      if (d < rangeBounds.start || d > rangeBounds.end) return false

      const std = f.studentId ? studentById.get(f.studentId) : instStudents.find((s) => (s.fullName || s.name) === f.studentName)
      const stStatus = String(std?.status || 'Active').toLowerCase()
      const isDropped = stStatus === 'dropped' || stStatus === 'withdrawn' || stStatus === 'graduated'
      if (applied.studentScope === 'Active' && isDropped) return false
      if (applied.studentScope === 'Dropped' && !isDropped) return false

      if (applied.classFilter !== 'ALL' && (f.className || std?.className || '') !== applied.classFilter) return false
      const head = f.feeHead || f.feeType || f.feeTitle || 'Tuition Fee'
      if (applied.headFilter !== 'ALL' && !head.toLowerCase().includes(applied.headFilter.toLowerCase())) return false

      if (q) {
        const hay = `${f.studentName || ''} ${f.rollNumber || ''} ${f.admissionNo || ''} ${f.fatherName || std?.fatherName || ''}`.toLowerCase()
        if (!hay.includes(q)) return false
      }

      const fStat = f.status || 'Pending'
      const isOver = fStat !== 'Paid' && f.dueDate && f.dueDate < todayIso
      if (applied.statusFilter === 'Overdue' && !isOver) return false
      if (applied.statusFilter !== 'ALL' && applied.statusFilter !== 'Overdue' && fStat !== applied.statusFilter) return false

      return true
    })
  }, [fees, currentInstitute, applied, rangeBounds, studentById, instStudents, todayIso])

  // KPI Metrics + Dropped Students Breakdown
  const summary = useMemo(() => {
    let cashCollected = 0
    let totalDue = 0
    let waiver = 0
    let remaining = 0
    let cashDrop = 0
    let dueDrop = 0
    let waiverDrop = 0
    let remDrop = 0
    const droppedSet = new Set()

    filteredFees.forEach((f) => {
      const std = f.studentId ? studentById.get(f.studentId) : instStudents.find((s) => (s.fullName || s.name) === f.studentName)
      const stdKey = std?.id || f.studentId || f.studentName || f.id
      const sStat = String(std?.status || 'Active').toLowerCase()
      const isDropped = sStat === 'dropped' || sStat === 'withdrawn' || sStat === 'graduated'

      const total = getFeeTotal(f)
      const paid = getFeePaid(f)
      const wv = getFeeWaiver(f)
      const rem = getFeeRemaining(f)

      totalDue += total
      cashCollected += paid
      waiver += wv
      remaining += rem

      if (isDropped) {
        droppedSet.add(stdKey)
        dueDrop += total
        cashDrop += paid
        waiverDrop += wv
        remDrop += rem
      }
    })

    return {
      cashCollected,
      totalDue,
      waiver,
      remaining,
      droppedCount: droppedSet.size,
      cashDrop,
      dueDrop,
      waiverDrop,
      remDrop
    }
  }, [filteredFees, studentById, instStudents])

  // Aggregate rows by Student or by Family CNIC (when familyWise is checked)
  const reportRows = useMemo(() => {
    const groups = new Map()

    filteredFees.forEach((f) => {
      const std = f.studentId ? studentById.get(f.studentId) : instStudents.find((s) => (s.fullName || s.name) === f.studentName)
      const cnic = normalizeCnic(std?.parentCnic || std?.fatherCnic || f.parentCnic || '')
      const groupKey = familyWise && cnic ? `FAM-${cnic}` : `STD-${std?.id || f.studentId || f.studentName || f.id}`

      if (!groups.has(groupKey)) {
        groups.set(groupKey, {
          key: groupKey,
          studentId: std?.id || f.studentId || null,
          className: f.className || std?.className || 'Class',
          studentNames: new Set(),
          parentName: f.fatherName || std?.fatherName || std?.guardianName || '—',
          rollAdm: [f.rollNumber || std?.rollNumber, f.admissionNo || std?.admissionNo].filter(Boolean).join(' / ') || 'N/A',
          totalDue: 0,
          paid: 0,
          waiver: 0,
          remaining: 0,
          invoicesCount: 0,
          feesList: []
        })
      }

      const g = groups.get(groupKey)
      g.studentNames.add(f.studentName || std?.fullName || std?.name || 'Student')
      g.totalDue += getFeeTotal(f)
      g.paid += getFeePaid(f)
      g.waiver += getFeeWaiver(f)
      g.remaining += getFeeRemaining(f)
      g.invoicesCount += 1
      g.feesList.push(f)
    })

    return Array.from(groups.values()).map((g) => {
      const status =
        g.remaining <= 0 && g.totalDue > 0
          ? 'Paid'
          : g.paid > 0 && g.remaining > 0
            ? 'Partial'
            : g.totalDue === 0
              ? 'Paid'
              : 'Pending'
      return {
        ...g,
        displayStudentName: Array.from(g.studentNames).join(', '),
        status
      }
    })
  }, [filteredFees, familyWise, studentById, instStudents])

  // Dropdown state for PDF & CSV buttons (Pick 3)
  const [pdfOpen, setPdfOpen] = useState(false)
  const [csvOpen, setCsvOpen] = useState(false)
  const actionsBarRef = useRef(null)
  useEffect(() => {
    const fn = (e) => {
      if (actionsBarRef.current && !actionsBarRef.current.contains(e.target)) {
        setPdfOpen(false)
        setCsvOpen(false)
      }
    }
    document.addEventListener('mousedown', fn)
    return () => document.removeEventListener('mousedown', fn)
  }, [])

  const runCsvExport = (reportType) => {
    setCsvOpen(false)
    if (reportRows.length === 0) {
      toast('No records in the selected filter range to export.', 'warning')
      return
    }
    const headers =
      reportType === 'cash'
        ? ['#', 'Class', 'Student Name', 'Parent Name', 'Roll / Adm No', 'Cash Collected (PKR)', 'Waiver (PKR)', 'Status']
        : ['#', 'Class', 'Student Name', 'Parent Name', 'Roll / Adm No', 'Total Due (PKR)', 'Paid (PKR)', 'Waiver (PKR)', 'Total Remaining (PKR)', 'Status']
    const rows = reportRows.map((r, i) =>
      reportType === 'cash'
        ? [i + 1, `"${r.className}"`, `"${r.displayStudentName}"`, `"${r.parentName}"`, `"${r.rollAdm}"`, r.paid, r.waiver, `"${r.status}"`]
        : [i + 1, `"${r.className}"`, `"${r.displayStudentName}"`, `"${r.parentName}"`, `"${r.rollAdm}"`, r.totalDue, r.paid, r.waiver, r.remaining, `"${r.status}"`]
    )
    const csv = [headers.join(','), ...rows.map((x) => x.join(','))].join('\n')
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `${reportType === 'cash' ? 'cash_collection_report' : 'invoice_report'}_${rangeBounds.start}_to_${rangeBounds.end}.csv`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
    toast(`Downloaded ${reportType === 'cash' ? 'Cash Collection' : 'Invoice'} CSV report.`, 'success')
  }

  const runPdfExport = (reportType) => {
    setPdfOpen(false)
    if (reportRows.length === 0) {
      toast('No records in the selected filter range to print.', 'warning')
      return
    }
    const title = reportType === 'cash' ? 'Cash Collection Report' : 'Invoice Report'
    const colsHtml =
      reportType === 'cash'
        ? '<th>#</th><th>Class</th><th>Student</th><th>Parent</th><th>Roll / Adm No</th><th>Paid (PKR)</th><th>Waiver (PKR)</th><th>Status</th>'
        : '<th>#</th><th>Class</th><th>Student</th><th>Parent</th><th>Roll / Adm No</th><th>Total Due</th><th>Paid</th><th>Waiver</th><th>Remaining</th><th>Status</th>'
    const rowsHtml = reportRows
      .map((r, i) =>
        reportType === 'cash'
          ? `<tr><td>${i + 1}</td><td>${r.className}</td><td>${r.displayStudentName}</td><td>${r.parentName}</td><td>${r.rollAdm}</td><td>${formatNum(r.paid)}</td><td>${formatNum(r.waiver)}</td><td>${r.status}</td></tr>`
          : `<tr><td>${i + 1}</td><td>${r.className}</td><td>${r.displayStudentName}</td><td>${r.parentName}</td><td>${r.rollAdm}</td><td>${formatNum(r.totalDue)}</td><td>${formatNum(r.paid)}</td><td>${formatNum(r.waiver)}</td><td>${formatNum(r.remaining)}</td><td>${r.status}</td></tr>`
      )
      .join('')
    const win = window.open('', '_blank', 'width=960,height=720')
    if (!win) {
      window.print()
      return
    }
    win.document.write(`<!doctype html><html><head><title>${title}</title>
      <style>
        body { font-family: Arial, sans-serif; padding: 24px; color: #0f172a; }
        h2 { margin: 0 0 4px; }
        p { margin: 0 0 16px; color: #64748b; font-size: 12px; }
        table { width: 100%; border-collapse: collapse; font-size: 12px; }
        th, td { border: 1px solid #cbd5e1; padding: 8px 10px; text-align: left; }
        th { background: #f8fafc; font-weight: 700; }
      </style></head><body>
      <h2>${String(currentInstitute?.name || 'School')} — ${title}</h2>
      <p>Period: ${formatHuman(rangeBounds.start)} – ${formatHuman(rangeBounds.end)} · Cash Collected: PKR ${formatNum(summary.cashCollected)} · Outstanding: PKR ${formatNum(summary.remaining)}</p>
      <table><thead><tr>${colsHtml}</tr></thead><tbody>${rowsHtml}</tbody></table>
      <script>window.onload=function(){window.print();};</script>
      </body></html>`)
    win.document.close()
  }

  const handleBulkPendingSms = async () => {
    const pendingRows = reportRows.filter((r) => r.remaining > 0)
    if (pendingRows.length === 0) {
      if (onOpenSendSms) onOpenSendSms()
      return
    }
    if (sendCommunicationBlast) {
      try {
        await sendCommunicationBlast({
          channel: 'SMS',
          recipientGroup: `${pendingRows.length} Pending Accounts`,
          message: `Fee payment reminder for ${formatHuman(rangeBounds.start)} – ${formatHuman(rangeBounds.end)}. Kindly clear pending school dues.`,
          recipientsCount: pendingRows.length
        })
        toast(`Queued SMS fee reminder to ${pendingRows.length} pending family account(s).`, 'success')
      } catch (err) {
        toast(err?.message || 'Failed to queue SMS reminder.', 'error')
      }
    }
  }

  const yearOptions = [now.getFullYear() - 2, now.getFullYear() - 1, now.getFullYear(), now.getFullYear() + 1]

  return (
    <div className="space-y-4 pb-10 animate-fade-in">
      {/* Top Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2 text-slate-900">
            <FileText className="w-5 h-5 text-slate-600" />
            <h1 className="text-lg font-bold tracking-tight">Fee Collection Report</h1>
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
            onClick={() => onRouteChange?.('inst-fees')}
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
            onClick={() => (onOpenSendSms ? onOpenSendSms() : onRouteChange?.('inst-communication-sms'))}
            className="px-3.5 py-2 rounded-xl bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 text-xs font-semibold flex items-center gap-1.5 shadow-2xs cursor-pointer transition-colors"
          >
            <MessageSquare className="w-3.5 h-3.5 text-slate-500" />
            <span>Send SMS</span>
          </button>
        </div>
      </div>

      {/* Period Summary Sub-header + 4 KPI Cards (Pick 2) */}
      <div className="space-y-2.5">
        <p className="text-[11px] font-semibold text-slate-500">
          Fee Summary — {formatHuman(rangeBounds.start)} – {formatHuman(rangeBounds.end)}
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
          <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-2xs flex flex-col justify-between">
            <div className="p-4 flex items-center gap-3.5">
              <div className="w-11 h-11 rounded-xl bg-emerald-500 text-white flex items-center justify-center shrink-0">
                <Wallet className="w-5 h-5" />
              </div>
              <div>
                <p className="text-[11px] font-semibold text-slate-500">Cash Collected</p>
                <p className="text-lg font-extrabold text-slate-900">
                  {formatNum(summary.cashCollected)} <span className="text-xs font-semibold text-slate-500">PKR</span>
                </p>
                <p className="text-[11px] text-slate-500">Received in selected period</p>
              </div>
            </div>
            <div className="bg-emerald-50/70 border-t border-emerald-100 px-3.5 py-2 text-[11px] text-emerald-800 font-medium flex items-center gap-1.5">
              <Users className="w-3.5 h-3.5 shrink-0" />
              <span>Includes {summary.droppedCount} dropped students · PKR {formatNum(summary.cashDrop)}</span>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-2xs flex flex-col justify-between">
            <div className="p-4 flex items-center gap-3.5">
              <div className="w-11 h-11 rounded-xl bg-blue-500 text-white flex items-center justify-center shrink-0">
                <FileText className="w-5 h-5" />
              </div>
              <div>
                <p className="text-[11px] font-semibold text-slate-500">Total Due</p>
                <p className="text-lg font-extrabold text-slate-900">
                  {formatNum(summary.totalDue)} <span className="text-xs font-semibold text-slate-500">PKR</span>
                </p>
                <p className="text-[11px] text-slate-500">Before payments in selected period</p>
              </div>
            </div>
            <div className="bg-amber-50/70 border-t border-amber-100 px-3.5 py-2 text-[11px] text-amber-800 font-medium flex items-center gap-1.5">
              <Users className="w-3.5 h-3.5 shrink-0" />
              <span>Includes {summary.droppedCount} dropped students · PKR {formatNum(summary.dueDrop)}</span>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-2xs flex flex-col justify-between">
            <div className="p-4 flex items-center gap-3.5">
              <div className="w-11 h-11 rounded-xl bg-cyan-500 text-white flex items-center justify-center shrink-0">
                <Percent className="w-5 h-5" />
              </div>
              <div>
                <p className="text-[11px] font-semibold text-slate-500">Waiver / Discount</p>
                <p className="text-lg font-extrabold text-slate-900">
                  {formatNum(summary.waiver)} <span className="text-xs font-semibold text-slate-500">PKR</span>
                </p>
                <p className="text-[11px] text-slate-500">Applied in selected period</p>
              </div>
            </div>
            <div className="bg-cyan-50/70 border-t border-cyan-100 px-3.5 py-2 text-[11px] text-cyan-800 font-medium flex items-center gap-1.5">
              <Users className="w-3.5 h-3.5 shrink-0" />
              <span>Includes {summary.droppedCount} dropped students · PKR {formatNum(summary.waiverDrop)}</span>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-2xs flex flex-col justify-between">
            <div className="p-4 flex items-center gap-3.5">
              <div className="w-11 h-11 rounded-xl bg-rose-500 text-white flex items-center justify-center shrink-0">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div>
                <p className="text-[11px] font-semibold text-slate-500">Total Remaining</p>
                <p className="text-lg font-extrabold text-slate-900">
                  {formatNum(summary.remaining)} <span className="text-xs font-semibold text-slate-500">PKR</span>
                </p>
                <p className="text-[11px] text-slate-500">As of {formatHuman(todayIso)}</p>
              </div>
            </div>
            <div className="bg-rose-50/70 border-t border-rose-100 px-3.5 py-2 text-[11px] text-rose-800 font-medium flex items-center gap-1.5">
              <Users className="w-3.5 h-3.5 shrink-0" />
              <span>Includes {summary.droppedCount} dropped students · PKR {formatNum(summary.remDrop)}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Filters Card matching Pick 2 */}
      <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-2xs space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="inline-flex rounded-lg border border-slate-200 p-0.5 bg-slate-50">
            {[
              { id: 'today', label: 'Today' },
              { id: 'month', label: 'This Month' },
              { id: 'custom', label: 'Custom Range' }
            ].map((t) => (
              <button
                key={t.id}
                type="button"
                onClick={() => switchDateMode(t.id)}
                className={`px-3.5 py-1.5 rounded-md text-xs font-bold cursor-pointer transition-colors ${
                  dateMode === t.id ? 'bg-teal-700 text-white shadow-2xs' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>

          <label className="inline-flex items-center gap-2 text-xs font-semibold text-slate-700 cursor-pointer">
            <input
              type="checkbox"
              checked={familyWise}
              onChange={(e) => setFamilyWise(e.target.checked)}
              className="rounded border-slate-300 text-slate-800"
            />
            <span>Family wise</span>
          </label>
        </div>

        <div className="flex flex-wrap items-end gap-2.5">
          {dateMode === 'month' && (
            <>
              <div className="min-w-[115px] flex-1">
                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Month</label>
                <select
                  value={filterMonth}
                  onChange={(e) => {
                    const m = Number(e.target.value)
                    setFilterMonth(m)
                    setApplied((p) => ({ ...p, filterMonth: m }))
                  }}
                  className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 bg-white text-xs text-slate-800 font-medium"
                >
                  {MONTHS.map((m, idx) => <option key={m} value={idx}>{m}</option>)}
                </select>
              </div>
              <div className="min-w-[95px] flex-1">
                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Year</label>
                <select
                  value={filterYear}
                  onChange={(e) => {
                    const y = Number(e.target.value)
                    setFilterYear(y)
                    setApplied((p) => ({ ...p, filterYear: y }))
                  }}
                  className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 bg-white text-xs text-slate-800 font-medium"
                >
                  {yearOptions.map((y) => <option key={y} value={y}>{y}</option>)}
                </select>
              </div>
            </>
          )}

          {dateMode === 'custom' && (
            <>
              <div className="min-w-[130px] flex-1">
                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">From</label>
                <input
                  type="date"
                  value={customFrom}
                  onChange={(e) => {
                    const v = e.target.value
                    setCustomFrom(v)
                    setApplied((p) => ({ ...p, customFrom: v }))
                  }}
                  className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 bg-white text-xs text-slate-800"
                />
              </div>
              <div className="min-w-[130px] flex-1">
                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">To</label>
                <input
                  type="date"
                  value={customTo}
                  onChange={(e) => {
                    const v = e.target.value
                    setCustomTo(v)
                    setApplied((p) => ({ ...p, customTo: v }))
                  }}
                  className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 bg-white text-xs text-slate-800"
                />
              </div>
            </>
          )}

          <div className="min-w-[155px] flex-1">
            <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Student</label>
            <input
              type="text"
              placeholder="Name, roll, adm no, parent"
              value={studentQuery}
              onChange={(e) => setStudentQuery(e.target.value)}
              className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 bg-white text-xs text-slate-800"
            />
          </div>

          <div className="min-w-[115px] flex-1">
            <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Class</label>
            <select
              value={classFilter}
              onChange={(e) => setClassFilter(e.target.value)}
              className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 bg-white text-xs text-slate-700"
            >
              <option value="ALL">All classes</option>
              {availableClasses.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>

          <div className="min-w-[130px] flex-1">
            <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Fee Head / Type</label>
            <select
              value={headFilter}
              onChange={(e) => setHeadFilter(e.target.value)}
              className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 bg-white text-xs text-slate-700"
            >
              <option value="ALL">All fee head / types</option>
              {FEE_HEADS.map((h) => <option key={h} value={h}>{h}</option>)}
            </select>
          </div>

          <div className="min-w-[110px] flex-1">
            <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Status</label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 bg-white text-xs text-slate-700"
            >
              <option value="ALL">All statuses</option>
              <option value="Paid">Paid</option>
              <option value="Partial">Partial</option>
              <option value="Pending">Pending</option>
              <option value="Overdue">Overdue</option>
            </select>
          </div>

          <div className="min-w-[135px] flex-1">
            <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Students</label>
            <select
              value={studentScope}
              onChange={(e) => setStudentScope(e.target.value)}
              className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 bg-white text-xs text-slate-700"
            >
              <option value="ALL">All (Active + Dropped)</option>
              <option value="Active">Active Only</option>
              <option value="Dropped">Dropped / Graduated</option>
            </select>
          </div>

          <button
            type="button"
            onClick={handleApply}
            className="px-4 py-1.5 rounded-lg bg-teal-700 hover:bg-teal-800 text-white text-xs font-bold cursor-pointer shrink-0 transition-colors"
          >
            Apply
          </button>
        </div>
      </div>

      {/* Records Card (Picks 2 & 3) */}
      <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-2xs space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-sm font-bold text-slate-800">Family / student records</h2>

          <div className="flex flex-wrap items-center gap-2" ref={actionsBarRef}>
            <span className="text-[11px] text-slate-400 mr-1">
              Showing {reportRows.length > 0 ? `1–${reportRows.length}` : '0'} of {reportRows.length}
            </span>

            {/* Red PDF Dropdown (Pick 3) */}
            <div className="relative">
              <button
                type="button"
                onClick={() => { setPdfOpen((o) => !o); setCsvOpen(false) }}
                className="px-3.5 py-1.5 rounded-lg bg-rose-500 hover:bg-rose-600 text-white text-xs font-bold inline-flex items-center gap-1.5 cursor-pointer transition-colors"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>PDF</span>
                <ChevronDown className="w-3.5 h-3.5" />
              </button>
              {pdfOpen && (
                <div className="absolute right-0 mt-1.5 w-48 rounded-xl bg-white border border-slate-200 shadow-xl py-1.5 z-30 text-xs">
                  <button
                    type="button"
                    onClick={() => runPdfExport('invoice')}
                    className="w-full px-4 py-2 text-left font-medium text-slate-700 hover:bg-slate-50 cursor-pointer"
                  >
                    Invoice Report
                  </button>
                  <button
                    type="button"
                    onClick={() => runPdfExport('cash')}
                    className="w-full px-4 py-2 text-left font-medium text-slate-700 hover:bg-slate-50 cursor-pointer"
                  >
                    Cash Collection Report
                  </button>
                </div>
              )}
            </div>

            {/* Green CSV Dropdown (Pick 3) */}
            <div className="relative">
              <button
                type="button"
                onClick={() => { setCsvOpen((o) => !o); setPdfOpen(false) }}
                className="px-3.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold inline-flex items-center gap-1.5 cursor-pointer transition-colors"
              >
                <Download className="w-3.5 h-3.5" />
                <span>CSV</span>
                <ChevronDown className="w-3.5 h-3.5" />
              </button>
              {csvOpen && (
                <div className="absolute right-0 mt-1.5 w-48 rounded-xl bg-white border border-slate-200 shadow-xl py-1.5 z-30 text-xs">
                  <button
                    type="button"
                    onClick={() => runCsvExport('invoice')}
                    className="w-full px-4 py-2 text-left font-medium text-slate-700 hover:bg-slate-50 cursor-pointer"
                  >
                    Invoice Report
                  </button>
                  <button
                    type="button"
                    onClick={() => runCsvExport('cash')}
                    className="w-full px-4 py-2 text-left font-medium text-slate-700 hover:bg-slate-50 cursor-pointer"
                  >
                    Cash Collection Report
                  </button>
                </div>
              )}
            </div>

            <button
              type="button"
              onClick={handleBulkPendingSms}
              className="px-3.5 py-1.5 rounded-lg bg-orange-500 hover:bg-orange-600 text-white text-xs font-bold inline-flex items-center gap-1.5 cursor-pointer transition-colors"
            >
              <MessageSquare className="w-3.5 h-3.5" />
              <span>SMS</span>
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs min-w-[820px]">
            <thead className="border-y border-slate-200 bg-slate-50/70 text-[11px] font-bold text-slate-600">
              <tr>
                <th className="py-2.5 px-3 w-10">#</th>
                <th className="py-2.5 px-3">Class</th>
                <th className="py-2.5 px-3">Student Name</th>
                <th className="py-2.5 px-3">Parent Name</th>
                <th className="py-2.5 px-3">Roll / Adm No</th>
                <th className="py-2.5 px-3 text-right">Total Due</th>
                <th className="py-2.5 px-3 text-right">Paid (in period)</th>
                <th className="py-2.5 px-3 text-right">Waiver (in period)</th>
                <th className="py-2.5 px-3 text-right">Total Remaining</th>
                <th className="py-2.5 px-3 text-center">Status</th>
                <th className="py-2.5 px-3 text-center">Billing</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {reportRows.length === 0 ? (
                <tr>
                  <td colSpan={11} className="py-10 text-center text-slate-400">
                    No fee collection records found for the selected filters.
                  </td>
                </tr>
              ) : (
                reportRows.map((row, idx) => (
                  <tr key={row.key} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-3 px-3 text-slate-500 font-semibold">{idx + 1}</td>
                    <td className="py-3 px-3 text-slate-800 font-medium">{row.className}</td>
                    <td className="py-3 px-3">
                      <button
                        type="button"
                        onClick={() => onOpenBillingHistory?.(row.studentId)}
                        className="font-bold text-sky-600 hover:underline text-left cursor-pointer"
                      >
                        {row.displayStudentName}
                      </button>
                    </td>
                    <td className="py-3 px-3 text-slate-600">{row.parentName}</td>
                    <td className="py-3 px-3 font-mono text-[11px] font-semibold text-slate-700">{row.rollAdm}</td>
                    <td className="py-3 px-3 text-right font-semibold text-slate-800">{formatNum(row.totalDue)}</td>
                    <td className="py-3 px-3 text-right font-semibold text-emerald-700">{formatNum(row.paid)}</td>
                    <td className="py-3 px-3 text-right font-semibold text-slate-700">{formatNum(row.waiver)}</td>
                    <td className="py-3 px-3 text-right font-extrabold text-slate-900">{formatNum(row.remaining)}</td>
                    <td className="py-3 px-3 text-center">
                      <span
                        className={`px-2.5 py-0.5 rounded text-[10px] font-bold text-white ${
                          row.status === 'Paid'
                            ? 'bg-emerald-500'
                            : row.status === 'Partial'
                              ? 'bg-orange-500'
                              : 'bg-rose-500'
                        }`}
                      >
                        {row.status}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-center">
                      <button
                        type="button"
                        onClick={() => onOpenBillingHistory?.(row.studentId)}
                        title="Open Student Billing History"
                        className="p-1.5 rounded-lg border border-sky-200 text-sky-600 hover:bg-sky-50 inline-flex items-center justify-center cursor-pointer"
                      >
                        <Receipt className="w-3.5 h-3.5" />
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
  )
}

export default FeeCollectionReportView
