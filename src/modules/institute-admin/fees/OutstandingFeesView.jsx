import React, { useState, useMemo, useEffect } from 'react'
import {
  ArrowLeft,
  FileText,
  UserPlus,
  CreditCard,
  Receipt,
  ArrowDownCircle,
  MessageSquare,
  Users,
  Coins,
  UserX,
  Settings,
  Search,
  Filter,
  Download,
  ChevronLeft,
  ChevronRight,
  Info
} from 'lucide-react'
import { useAppData } from '../../../context/AppDataContext'
import { useToast } from '../../../context/ToastContext'
import { getDistinctInstituteClassNames, isClassAllowedForTier } from '../../../utils/tierGating'
import Modal from '../../../components/common/Modal'

const PAGE_SIZE = 30

const fmtMoney = (n) =>
  Number(n || 0).toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })

const fmtMoneyDec = (n) =>
  Number(n || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })

const normalizeParentKey = (name, phone) => {
  const cleanName = String(name || '').trim().toLowerCase().replace(/\s+/g, ' ')
  const cleanPhone = String(phone || '').replace(/\D/g, '')
  if (!cleanName && !cleanPhone) return ''
  return cleanPhone ? `${cleanName}__${cleanPhone.slice(-10)}` : cleanName
}

const getSmsLogKey = (instId) => `eims_outstanding_sms_log_${instId || 'default'}`

const loadSmsLogs = (instId) => {
  try {
    const raw = localStorage.getItem(getSmsLogKey(instId))
    return raw ? JSON.parse(raw) : {}
  } catch {
    return {}
  }
}

export const OutstandingFeesView = ({
  currentInstitute,
  onRouteChange,
  onOpenBillingHistory,
  onOpenQuickPayment
}) => {
  const { students = [], classes = [], fees = [], logAuditEvent } = useAppData()
  const { toast } = useToast()

  const instId = currentInstitute?.id || 'default'

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

  // Per-student due & last payment calculation
  const studentFinanceMap = useMemo(() => {
    const map = {}
    for (const f of fees) {
      if (currentInstitute?.id && f.instituteId && f.instituteId !== currentInstitute.id) continue
      const sid = f.studentId || f.student_id
      if (!sid) continue
      if (!map[sid]) map[sid] = { due: 0, lastPaidAmount: 0, lastPaidDate: '' }

      const st = String(f.status || '').toLowerCase()
      const total = Number(f.amount ?? f.totalAmount ?? 0)
      const paid = Number(f.paidAmount ?? f.amountPaid ?? 0)

      if (paid > 0) {
        const dt = String(f.paidAt || f.updatedAt || f.date || '')
        if (!map[sid].lastPaidDate || dt >= map[sid].lastPaidDate) {
          map[sid].lastPaidAmount = paid
          map[sid].lastPaidDate = dt
        }
      }

      if (!['paid', 'cancelled', 'waived'].includes(st)) {
        const due = Math.max(0, total - paid)
        map[sid].due += due
      }
    }
    return map
  }, [fees, currentInstitute])

  // Criteria modal
  const [criteriaModalOpen, setCriteriaModalOpen] = useState(false)
  const [minOldMonths, setMinOldMonths] = useState(2)
  const [minPendingFilter, setMinPendingFilter] = useState(0)

  // Filters
  const [searchInput, setSearchInput] = useState('')
  const [showFilter, setShowFilter] = useState('defaulters') // 'defaulters' | 'all' | 'dropped'
  const [classFilter, setClassFilter] = useState('ALL')
  const [noPaymentFilter, setNoPaymentFilter] = useState('any')
  const [applied, setApplied] = useState({
    search: '',
    show: 'defaulters',
    className: 'ALL',
    noPayment: 'any'
  })

  const [familyWise, setFamilyWise] = useState(true)
  const [hideZeroInFamily, setHideZeroInFamily] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)
  const [smsLogs, setSmsLogs] = useState(() => loadSmsLogs(instId))

  useEffect(() => {
    setSmsLogs(loadSmsLogs(instId))
  }, [instId])

  const handleSendReminderSms = (targetKey, label, phone) => {
    if (!phone) {
      toast.warning(`No phone number on file for ${label}`)
      return
    }
    const todayFormatted = new Date().toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    })
    const next = { ...smsLogs, [targetKey]: todayFormatted }
    setSmsLogs(next)
    try {
      localStorage.setItem(getSmsLogKey(instId), JSON.stringify(next))
    } catch {
      // ignore
    }
    logAuditEvent?.('OUTSTANDING_SMS_SENT', `Sent fee reminder SMS to ${label} (${phone})`)
    toast.success(`Fee reminder SMS sent to ${label} (${phone})`)
  }

  // Enrich students with dues & active/dropped status
  const enrichedStudents = useMemo(() => {
    return instStudents.map((s) => {
      const fin = studentFinanceMap[s.id] || { due: 0, lastPaidAmount: 0, lastPaidDate: '' }
      const st = String(s.status || 'Active').toLowerCase()
      const isDroppedOrGrad = ['dropped', 'left', 'withdrawn', 'graduated'].includes(st)
      return {
        ...s,
        due: fin.due,
        lastPaidAmount: fin.lastPaidAmount,
        lastPaidDate: fin.lastPaidDate,
        isDroppedOrGrad
      }
    })
  }, [instStudents, studentFinanceMap])

  // KPI metrics
  const kpis = useMemo(() => {
    const activeDefaulters = enrichedStudents.filter((s) => !s.isDroppedOrGrad && s.due > minPendingFilter)
    const activePendingTotal = activeDefaulters.reduce((sum, s) => sum + s.due, 0)
    const droppedPendingTotal = enrichedStudents
      .filter((s) => s.isDroppedOrGrad && s.due > 0)
      .reduce((sum, s) => sum + s.due, 0)

    const famKeys = new Set(
      activeDefaulters.map((s) => {
        const pName = (s.guardianName || s.fatherName || s.name || '').trim()
        const pPhone = (s.guardianPhone || s.fatherPhone || s.parentPhone || '').trim()
        return normalizeParentKey(pName, pPhone) || s.id
      })
    )

    return {
      defaultersCount: activeDefaulters.length,
      familiesCount: famKeys.size,
      activePendingTotal,
      droppedPendingTotal
    }
  }, [enrichedStudents, minPendingFilter])

  // Filtered students list
  const filteredStudents = useMemo(() => {
    return enrichedStudents.filter((s) => {
      if (applied.show === 'defaulters') {
        if (s.isDroppedOrGrad || s.due <= minPendingFilter) return false
      } else if (applied.show === 'dropped') {
        if (!s.isDroppedOrGrad || s.due <= 0) return false
      } else {
        if (s.due <= 0) return false
      }

      if (applied.className !== 'ALL' && s.className !== applied.className) return false

      if (applied.search.trim()) {
        const q = applied.search.trim().toLowerCase()
        const match =
          (s.name || '').toLowerCase().includes(q) ||
          (s.rollNumber || '').toLowerCase().includes(q) ||
          (s.guardianName || s.fatherName || '').toLowerCase().includes(q)
        if (!match) return false
      }
      return true
    })
  }, [enrichedStudents, applied, minPendingFilter])

  // Group into family-wise rows vs individual rows
  const displayEntries = useMemo(() => {
    if (!familyWise) {
      return filteredStudents.map((s) => ({
        type: 'single',
        id: s.id,
        student: s,
        due: s.due
      }))
    }

    const groups = new Map()
    for (const s of filteredStudents) {
      const pName = (s.guardianName || s.fatherName || '').trim()
      const pPhone = (s.guardianPhone || s.fatherPhone || s.parentPhone || '').trim()
      if (!pName) {
        groups.set(`single_${s.id}`, {
          type: 'single',
          id: s.id,
          student: s,
          due: s.due
        })
        continue
      }
      const key = s.parentId || `fam_${normalizeParentKey(pName, pPhone)}`
      if (!groups.has(key)) {
        groups.set(key, {
          type: 'family',
          id: key,
          parentName: pName,
          parentCnic: s.guardianCnic || '',
          phone: pPhone,
          children: []
        })
      }
      groups.get(key).children.push(s)
    }

    const result = []
    for (const entry of groups.values()) {
      if (entry.type === 'single') {
        result.push(entry)
      } else if (entry.children.length === 1) {
        result.push({
          type: 'single',
          id: entry.children[0].id,
          student: entry.children[0],
          due: entry.children[0].due
        })
      } else {
        const children = hideZeroInFamily
          ? entry.children.filter((c) => c.due > 0)
          : entry.children
        result.push({
          ...entry,
          children,
          totalDue: children.reduce((sum, c) => sum + c.due, 0)
        })
      }
    }

    return result.sort((a, b) => (b.totalDue ?? b.due) - (a.totalDue ?? a.due))
  }, [filteredStudents, familyWise, hideZeroInFamily])

  const totalEntries = displayEntries.length
  const totalPages = Math.max(1, Math.ceil(totalEntries / PAGE_SIZE))
  const safePage = Math.min(currentPage, totalPages)
  const startIdx = totalEntries === 0 ? 0 : (safePage - 1) * PAGE_SIZE
  const paginatedEntries = displayEntries.slice(startIdx, startIdx + PAGE_SIZE)

  useEffect(() => {
    setCurrentPage(1)
  }, [applied, familyWise, hideZeroInFamily])

  const handleExportCsv = () => {
    const lines = [
      'Student,Parent,Roll No,Class,Due (PKR),Phone',
      ...filteredStudents.map(
        (s) =>
          `"${s.name}","${s.guardianName || s.fatherName || ''}","${s.rollNumber || ''}","${s.className || ''}",${s.due},"${s.guardianPhone || s.fatherPhone || s.phone || ''}"`
      )
    ]
    const blob = new Blob([lines.join('\n')], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `outstanding-fees-${new Date().toISOString().slice(0, 10)}.csv`
    a.click()
    URL.revokeObjectURL(url)
    toast.success(`Exported ${filteredStudents.length} outstanding fee record(s)`)
  }

  return (
    <div className="p-4 sm:p-6 space-y-5 max-w-[1440px] mx-auto">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <FileText className="w-5 h-5 text-slate-600" />
            <h1 className="text-xl font-bold text-slate-900 tracking-tight">Outstanding Fees</h1>
          </div>
          <button
            type="button"
            onClick={() => onRouteChange?.('inst-fees')}
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
            onClick={() => onRouteChange?.('inst-fees')}
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

      {/* 4 Top KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-4 flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-lg bg-rose-50 text-rose-500 flex items-center justify-center shrink-0">
            <Users className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500">TOTAL DEFAULTERS</p>
            <p className="text-xl font-extrabold text-slate-900 leading-tight">{kpis.defaultersCount}</p>
            <p className="text-[11px] text-slate-400">{kpis.familiesCount} families</p>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-4 flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-lg bg-amber-50 text-amber-500 flex items-center justify-center shrink-0">
            <Coins className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500">TOTAL PENDING (PKR)</p>
            <p className="text-xl font-extrabold text-slate-900 leading-tight">
              {fmtMoneyDec(kpis.activePendingTotal)}
            </p>
            <p className="text-[11px] text-slate-400">Active Students Pending</p>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-4 flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-lg bg-slate-100 text-slate-600 flex items-center justify-center shrink-0">
            <UserX className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
              DROPPED / GRADUATED PENDING
            </p>
            <p className="text-xl font-extrabold text-slate-900 leading-tight">
              {fmtMoneyDec(kpis.droppedPendingTotal)}
            </p>
            <p className="text-[11px] text-slate-400">Part of dashboard All Time total</p>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-4 flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-lg bg-cyan-50 text-cyan-600 flex items-center justify-center shrink-0">
            <Settings className="w-5 h-5" />
          </div>
          <div className="min-w-0">
            <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500">DEFAULTER CRITERIA</p>
            <div className="flex flex-wrap items-center gap-1 mt-1">
              <span className="px-1.5 py-0.5 rounded bg-sky-50 text-sky-700 text-[10px] font-semibold">
                Old dues {minOldMonths}+ months
              </span>
              <span className="px-1.5 py-0.5 rounded bg-sky-50 text-sky-700 text-[10px] font-semibold">
                Min pending {minPendingFilter > 0 ? minPendingFilter : 'any'}
              </span>
            </div>
            <button
              type="button"
              onClick={() => setCriteriaModalOpen(true)}
              className="text-[11px] font-semibold text-blue-600 hover:underline mt-0.5"
            >
              Change criteria
            </button>
          </div>
        </div>
      </div>

      {/* Main Card */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        {/* Filter Bar */}
        <div className="p-4 border-b border-slate-200 space-y-3">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-[1.2fr_1fr_1fr_1fr_auto] gap-3 items-end">
            <div>
              <label className="block text-[11px] font-semibold text-slate-600 mb-1">Search</label>
              <div className="relative">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                  placeholder="Name, roll..."
                  className="w-full pl-8 pr-3 py-1.5 text-xs rounded-md border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-600 mb-1">Show</label>
              <select
                value={showFilter}
                onChange={(e) => setShowFilter(e.target.value)}
                className="w-full px-3 py-1.5 text-xs rounded-md border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="defaulters">Defaulters only</option>
                <option value="all">All with pending dues</option>
                <option value="dropped">Dropped / Graduated only</option>
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-600 mb-1">Class</label>
              <select
                value={classFilter}
                onChange={(e) => setClassFilter(e.target.value)}
                className="w-full px-3 py-1.5 text-xs rounded-md border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
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
              <label className="block text-[11px] font-semibold text-slate-600 mb-1">No payment in</label>
              <select
                value={noPaymentFilter}
                onChange={(e) => setNoPaymentFilter(e.target.value)}
                className="w-full px-3 py-1.5 text-xs rounded-md border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="any">Any time</option>
                <option value="30">Last 30 days</option>
                <option value="60">Last 60 days</option>
                <option value="90">Last 90 days</option>
              </select>
            </div>

            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={() =>
                  setApplied({
                    search: searchInput,
                    show: showFilter,
                    className: classFilter,
                    noPayment: noPaymentFilter
                  })
                }
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-md bg-blue-500 hover:bg-blue-600 text-white text-xs font-semibold transition-colors"
              >
                <Filter className="w-3.5 h-3.5" />
                Apply
              </button>
              <button
                type="button"
                onClick={() => {
                  setSearchInput('')
                  setShowFilter('defaulters')
                  setClassFilter('ALL')
                  setNoPaymentFilter('any')
                  setApplied({ search: '', show: 'defaulters', className: 'ALL', noPayment: 'any' })
                }}
                className="px-3 py-1.5 rounded-md border border-slate-200 bg-white hover:bg-slate-50 text-slate-600 text-xs font-semibold"
              >
                Clear
              </button>
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
            <div className="flex items-center gap-4 text-xs text-slate-600">
              <label className="inline-flex items-center gap-1.5 cursor-pointer font-medium">
                <input
                  type="checkbox"
                  checked={familyWise}
                  onChange={(e) => setFamilyWise(e.target.checked)}
                  className="rounded border-slate-300 text-slate-800 focus:ring-slate-600"
                />
                Family wise
              </label>
              <label className="inline-flex items-center gap-1.5 cursor-pointer text-slate-500">
                <input
                  type="checkbox"
                  checked={hideZeroInFamily}
                  onChange={(e) => setHideZeroInFamily(e.target.checked)}
                  className="rounded border-slate-300 text-slate-800 focus:ring-slate-600"
                />
                Hide 0 in family
              </label>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setCriteriaModalOpen(true)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md border border-blue-200 bg-white hover:bg-blue-50 text-blue-600 text-xs font-semibold"
              >
                <Settings className="w-3.5 h-3.5" />
                Settings
              </button>
              <button
                type="button"
                onClick={handleExportCsv}
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-md bg-blue-500 hover:bg-blue-600 text-white text-xs font-semibold"
              >
                <Download className="w-3.5 h-3.5" />
                Export
              </button>
            </div>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-200 text-[11px] font-semibold text-slate-600">
                <th className="py-3 px-4 w-10">#</th>
                <th className="py-3 px-3 min-w-[210px]">Student / Parent</th>
                <th className="py-3 px-3 w-20">Roll No.</th>
                <th className="py-3 px-3 min-w-[95px]">Class</th>
                <th className="py-3 px-3 text-right min-w-[100px]">Due (PKR)</th>
                <th className="py-3 px-3 min-w-[130px]">Last Payment</th>
                <th className="py-3 px-3 min-w-[190px]">Contact Numbers</th>
                <th className="py-3 px-3 w-24">Last SMS</th>
                <th className="py-3 px-4 text-right w-24">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {paginatedEntries.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-12 text-center text-slate-400">
                    No outstanding fee records match the selected filters.
                  </td>
                </tr>
              ) : (
                paginatedEntries.map((entry, idx) => {
                  const serial = startIdx + idx + 1

                  if (entry.type === 'family') {
                    const lastSms = smsLogs[entry.id]
                    return (
                      <React.Fragment key={entry.id}>
                        {/* Family Header Row */}
                        <tr className="bg-slate-50/70">
                          <td className="py-3 px-4 font-semibold text-slate-500">{serial}</td>
                          <td className="py-3 px-3">
                            <div className="flex items-center gap-1.5">
                              <span className="px-2 py-0.5 rounded bg-blue-600 text-white text-[10px] font-bold">
                                Family
                              </span>
                              <span className="text-[11px] font-semibold text-slate-600">
                                {entry.children.length} students
                              </span>
                            </div>
                            <div className="text-[11px] text-slate-600 mt-1 font-medium">
                              {entry.parentName}
                              {entry.parentCnic && (
                                <span className="text-blue-600"> ({entry.parentCnic})</span>
                              )}
                            </div>
                          </td>
                          <td className="py-3 px-3 text-slate-400">—</td>
                          <td className="py-3 px-3 text-slate-400">—</td>
                          <td className="py-3 px-3 text-right">
                            <div className="text-[9px] font-bold uppercase text-slate-400">FAMILY TOTAL</div>
                            <div className="text-sm font-extrabold text-rose-600">
                              {fmtMoney(entry.totalDue)}
                            </div>
                          </td>
                          <td className="py-3 px-3 text-[11px] text-slate-400">
                            {entry.children[0]?.lastPaidAmount > 0 ? (
                              <div>
                                <div className="font-semibold text-slate-700">
                                  PKR {fmtMoney(entry.children[0].lastPaidAmount)}
                                </div>
                                <div className="text-[10px] text-slate-400">
                                  {entry.children[0].lastPaidDate?.slice(0, 10)}
                                </div>
                              </div>
                            ) : (
                              'No payment recorded'
                            )}
                          </td>
                          <td className="py-3 px-3">
                            {entry.phone ? (
                              <div className="flex items-center gap-1.5 text-[11px]">
                                <span className="px-1.5 py-0.5 rounded bg-indigo-50 text-indigo-700 font-bold text-[9px]">
                                  PARENT
                                </span>
                                <span className="font-semibold text-emerald-700">{entry.phone}</span>
                              </div>
                            ) : (
                              <span className="text-[11px] text-slate-400">No number on file</span>
                            )}
                          </td>
                          <td className="py-3 px-3">
                            {lastSms ? (
                              <span className="text-[11px] text-slate-600 font-medium">{lastSms}</span>
                            ) : (
                              <span className="px-2 py-0.5 rounded bg-orange-500 text-white text-[10px] font-bold">
                                Never
                              </span>
                            )}
                          </td>
                          <td className="py-3 px-4 text-right">
                            <button
                              type="button"
                              onClick={() =>
                                handleSendReminderSms(entry.id, entry.parentName, entry.phone)
                              }
                              title="Send Family Fee Reminder SMS"
                              className="p-1.5 rounded border border-sky-200 bg-white hover:bg-sky-50 text-sky-600 inline-flex items-center justify-center"
                            >
                              <MessageSquare className="w-3.5 h-3.5" />
                            </button>
                          </td>
                        </tr>

                        {/* Child Rows */}
                        {entry.children.map((ch) => (
                          <tr key={ch.id} className="hover:bg-slate-50/50">
                            <td className="py-2.5 px-4" />
                            <td className="py-2.5 px-3 pl-7">
                              <button
                                type="button"
                                onClick={() => onOpenBillingHistory?.(ch.id)}
                                className="font-semibold text-blue-600 hover:underline text-left"
                              >
                                └ {ch.name}
                              </button>
                            </td>
                            <td className="py-2.5 px-3">
                              {ch.rollNumber ? (
                                <span className="px-1.5 py-0.5 rounded bg-slate-100 text-slate-700 text-[10px] font-semibold">
                                  {ch.rollNumber}
                                </span>
                              ) : (
                                '—'
                              )}
                            </td>
                            <td className="py-2.5 px-3 text-slate-700">{ch.className || '—'}</td>
                            <td className="py-2.5 px-3 text-right font-bold text-rose-600">
                              {fmtMoney(ch.due)}
                            </td>
                            <td className="py-2.5 px-3 text-[11px] text-slate-400">
                              {ch.lastPaidAmount > 0 ? (
                                <div>
                                  <div className="font-semibold text-slate-700">
                                    PKR {fmtMoney(ch.lastPaidAmount)}
                                  </div>
                                  <div className="text-[10px] text-slate-400">
                                    {ch.lastPaidDate?.slice(0, 10)}
                                  </div>
                                </div>
                              ) : (
                                'No payment recorded'
                              )}
                            </td>
                            <td className="py-2.5 px-3 text-slate-400">—</td>
                            <td className="py-2.5 px-3 text-slate-400">—</td>
                            <td className="py-2.5 px-4 text-right">
                              <button
                                type="button"
                                onClick={() => onOpenBillingHistory?.(ch.id)}
                                title="Open Student Billing History"
                                className="p-1.5 rounded border border-blue-200 bg-white hover:bg-blue-50 text-blue-600 inline-flex items-center justify-center"
                              >
                                <FileText className="w-3.5 h-3.5" />
                              </button>
                            </td>
                          </tr>
                        ))}
                      </React.Fragment>
                    )
                  }

                  // Single student row
                  const s = entry.student
                  const pName = s.guardianName || s.fatherName
                  const sPhone = s.phone || s.studentPhone
                  const pPhone = s.guardianPhone || s.fatherPhone || s.parentPhone
                  const lastSms = smsLogs[s.id]

                  return (
                    <tr key={s.id} className="hover:bg-slate-50/70">
                      <td className="py-3 px-4 font-medium text-slate-500">{serial}</td>
                      <td className="py-3 px-3">
                        <button
                          type="button"
                          onClick={() => onOpenBillingHistory?.(s.id)}
                          className="font-semibold text-blue-600 hover:underline text-left"
                        >
                          {s.name}
                        </button>
                        {pName && (
                          <div className="text-[11px] text-slate-500 mt-0.5">
                            {pName}
                            {s.guardianCnic && (
                              <span className="text-blue-600"> ({s.guardianCnic})</span>
                            )}
                          </div>
                        )}
                      </td>
                      <td className="py-3 px-3">
                        {s.rollNumber ? (
                          <span className="px-1.5 py-0.5 rounded bg-slate-100 text-slate-700 text-[10px] font-semibold">
                            {s.rollNumber}
                          </span>
                        ) : (
                          '—'
                        )}
                      </td>
                      <td className="py-3 px-3 text-slate-700">{s.className || '—'}</td>
                      <td className="py-3 px-3 text-right font-bold text-rose-600">
                        {fmtMoney(s.due)}
                      </td>
                      <td className="py-3 px-3 text-[11px] text-slate-400">
                        {s.lastPaidAmount > 0 ? (
                          <div>
                            <div className="font-semibold text-slate-700">
                              PKR {fmtMoney(s.lastPaidAmount)}
                            </div>
                            <div className="text-[10px] text-slate-400">
                              {s.lastPaidDate?.slice(0, 10)}
                            </div>
                          </div>
                        ) : (
                          'No payment recorded'
                        )}
                      </td>
                      <td className="py-3 px-3 space-y-1">
                        {sPhone || pPhone ? (
                          <>
                            {sPhone && (
                              <div className="flex items-center gap-1.5 text-[11px]">
                                <span className="px-1.5 py-0.5 rounded bg-indigo-50 text-indigo-700 font-bold text-[9px]">
                                  STUDENT
                                </span>
                                <span className="font-semibold text-emerald-700">{sPhone}</span>
                              </div>
                            )}
                            {pPhone && (
                              <div className="flex items-center gap-1.5 text-[11px]">
                                <span className="px-1.5 py-0.5 rounded bg-indigo-50 text-indigo-700 font-bold text-[9px]">
                                  PARENT
                                </span>
                                <span className="font-semibold text-emerald-700">{pPhone}</span>
                              </div>
                            )}
                          </>
                        ) : (
                          <span className="text-[11px] text-slate-400">No number on file</span>
                        )}
                      </td>
                      <td className="py-3 px-3">
                        {lastSms ? (
                          <span className="text-[11px] text-slate-600 font-medium">{lastSms}</span>
                        ) : (
                          <span className="px-2 py-0.5 rounded bg-orange-500 text-white text-[10px] font-bold">
                            Never
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-4 text-right">
                        <div className="inline-flex items-center gap-1">
                          <button
                            type="button"
                            onClick={() => onOpenBillingHistory?.(s.id)}
                            title="Open Student Billing History"
                            className="p-1.5 rounded border border-blue-200 bg-white hover:bg-blue-50 text-blue-600"
                          >
                            <FileText className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() =>
                              handleSendReminderSms(s.id, s.name, pPhone || sPhone)
                            }
                            title="Send Fee Reminder SMS"
                            className="p-1.5 rounded border border-sky-200 bg-white hover:bg-sky-50 text-sky-600"
                          >
                            <MessageSquare className="w-3.5 h-3.5" />
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

        {/* Pagination Footer */}
        <div className="px-5 py-3.5 border-t border-slate-200 flex items-center justify-center gap-1 text-xs">
          <button
            type="button"
            disabled={safePage <= 1}
            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
            className="w-7 h-7 rounded border border-slate-200 flex items-center justify-center text-slate-500 hover:bg-slate-50 disabled:opacity-40"
          >
            <ChevronLeft className="w-3.5 h-3.5" />
          </button>
          {Array.from({ length: totalPages }, (_, i) => i + 1)
            .slice(0, 7)
            .map((pg) => (
              <button
                key={pg}
                type="button"
                onClick={() => setCurrentPage(pg)}
                className={`w-7 h-7 rounded text-xs font-semibold transition-colors ${
                  safePage === pg
                    ? 'bg-blue-600 text-white'
                    : 'border border-slate-200 text-slate-600 hover:bg-slate-50'
                }`}
              >
                {pg}
              </button>
            ))}
          <button
            type="button"
            disabled={safePage >= totalPages}
            onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
            className="w-7 h-7 rounded border border-slate-200 flex items-center justify-center text-slate-500 hover:bg-slate-50 disabled:opacity-40"
          >
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Defaulter Criteria Modal */}
      {criteriaModalOpen && (
        <Modal
          isOpen
          onClose={() => setCriteriaModalOpen(false)}
          title="Defaulter Criteria Settings"
          maxWidth="max-w-sm"
        >
          <div className="space-y-4 text-xs">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Old dues threshold (months)
              </label>
              <input
                type="number"
                min="0"
                value={minOldMonths}
                onChange={(e) => setMinOldMonths(Number(e.target.value || 0))}
                className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Minimum pending amount (PKR, 0 = any)
              </label>
              <input
                type="number"
                min="0"
                value={minPendingFilter}
                onChange={(e) => setMinPendingFilter(Number(e.target.value || 0))}
                className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setCriteriaModalOpen(false)}
                className="px-4 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-semibold"
              >
                Done
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  )
}

export default OutstandingFeesView
