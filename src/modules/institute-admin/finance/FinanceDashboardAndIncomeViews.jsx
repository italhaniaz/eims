import React, { useState, useMemo, useEffect } from 'react'
import {
  ArrowLeft,
  FileText,
  UserPlus,
  CreditCard,
  Receipt,
  ArrowDownCircle,
  MessageSquare,
  Coins,
  Hourglass,
  TrendingUp,
  Filter,
  Download,
  BarChart3,
  ArrowUpRight,
  List,
  Plus,
  Menu,
  ChevronDown,
  Info,
  Calendar
} from 'lucide-react'
import { useAppData } from '../../../context/AppDataContext'
import { useToast } from '../../../context/ToastContext'
import { downloadSimplePdf } from '../../../utils/pdfExport'
import Modal from '../../../components/common/Modal'

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
        onClick={() => onRouteChange?.('inst-fees')}
        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold shadow-sm transition-colors"
      >
        <Receipt className="w-3.5 h-3.5" />
        Generate Invoice
      </button>
      <button
        type="button"
        onClick={() => onRouteChange?.('inst-accounts-expenses')}
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

const fmtPkr = (n) => `PKR ${Number(n || 0).toLocaleString()}`
const fmtPkrDec = (n) =>
  `PKR ${Number(n || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`

const formatDisplayDate = (iso) => {
  if (!iso) return '—'
  const dt = new Date(`${String(iso).slice(0, 10)}T12:00:00`)
  if (Number.isNaN(dt.getTime())) return String(iso).slice(0, 10)
  return dt.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })
}

const loadJson = (key, fallback) => {
  try {
    const raw = localStorage.getItem(key)
    const parsed = raw ? JSON.parse(raw) : null
    return parsed ?? fallback
  } catch {
    return fallback
  }
}

const saveJson = (key, val) => {
  try {
    localStorage.setItem(key, JSON.stringify(val))
  } catch {
    // ignore
  }
}

export const FinanceDashboardAndIncomeViews = ({
  mode = 'dashboard', // 'dashboard' | 'other-income'
  currentInstitute,
  onRouteChange,
  onOpenQuickPayment
}) => {
  const { fees = [], students = [], expenses = [], teachers = [] } = useAppData()
  const { toast } = useToast()

  const instId = currentInstitute?.id || 'default'
  const todayIso = useMemo(() => new Date().toISOString().slice(0, 10), [])
  const monthStartIso = `${todayIso.slice(0, 7)}-01`

  const incomeKey = `eims_other_income_${instId}`
  const [otherIncomes, setOtherIncomes] = useState(() => loadJson(incomeKey, []))

  useEffect(() => {
    setOtherIncomes(loadJson(incomeKey, []))
  }, [incomeKey])

  const persistIncomes = (updater) => {
    setOtherIncomes((prev) => {
      const next = typeof updater === 'function' ? updater(prev) : updater
      saveJson(incomeKey, next)
      return next
    })
  }

  // ============================================================================
  // FINANCIAL DASHBOARD STATE
  // ============================================================================
  const [quickRange, setQuickRange] = useState('month') // 'today' | 'month' | 'last_month' | '3m' | 'year'
  const [fromDate, setFromDate] = useState(monthStartIso)
  const [toDate, setToDate] = useState(todayIso)
  const [expCategory, setExpCategory] = useState('ALL')
  const [addedByFilter, setAddedByFilter] = useState('ALL')
  const [statusFilter, setStatusFilter] = useState('ALL')
  const [vendorFilter, setVendorFilter] = useState('ALL')
  const [feeCatFilter, setFeeCatFilter] = useState('ALL')
  const [includeSalaries, setIncludeSalaries] = useState(true)
  const [includeFees, setIncludeFees] = useState(true)
  const [showChartsPreview, setShowChartsPreview] = useState(false)

  const [appliedDash, setAppliedDash] = useState({
    from: monthStartIso,
    to: todayIso,
    expCategory: 'ALL',
    status: 'ALL',
    vendor: 'ALL',
    feeCat: 'ALL'
  })

  const applyQuickRange = (rng) => {
    setQuickRange(rng)
    const now = new Date()
    let f = monthStartIso
    const t = todayIso
    if (rng === 'today') f = todayIso
    else if (rng === 'last_month') {
      const lm = new Date(now.getFullYear(), now.getMonth() - 1, 1)
      const lmEnd = new Date(now.getFullYear(), now.getMonth(), 0)
      f = lm.toISOString().slice(0, 10)
      const tLm = lmEnd.toISOString().slice(0, 10)
      setFromDate(f)
      setToDate(tLm)
      setAppliedDash((p) => ({ ...p, from: f, to: tLm }))
      return
    } else if (rng === '3m') {
      const d3 = new Date(now.getFullYear(), now.getMonth() - 2, 1)
      f = d3.toISOString().slice(0, 10)
    } else if (rng === 'year') {
      f = `${now.getFullYear()}-01-01`
    }
    setFromDate(f)
    setToDate(t)
    setAppliedDash((p) => ({ ...p, from: f, to: t }))
  }

  // Fee collections in period
  const feeReceiptsInPeriod = useMemo(() => {
    return fees
      .filter((f) => {
        if (currentInstitute?.id && f.instituteId && f.instituteId !== currentInstitute.id) return false
        const paidAmt = Number(f.paidAmount ?? f.amountPaid ?? (f.status === 'paid' ? f.amount : 0) ?? 0)
        if (paidAmt <= 0) return false
        const dt = String(f.paidAt || f.updatedAt || f.date || todayIso).slice(0, 10)
        if (appliedDash.from && dt < appliedDash.from) return false
        if (appliedDash.to && dt > appliedDash.to) return false
        if (appliedDash.feeCat !== 'ALL') {
          const cat = f.category || f.title || 'Tuition Fee'
          if (cat !== appliedDash.feeCat) return false
        }
        return true
      })
      .map((f) => {
        const st = students.find((s) => s.id === (f.studentId || f.student_id))
        const paidAmt = Number(f.paidAmount ?? f.amountPaid ?? (f.status === 'paid' ? f.amount : 0) ?? 0)
        return {
          id: f.id,
          date: String(f.paidAt || f.updatedAt || f.date || todayIso).slice(0, 10),
          studentName: st?.name || f.studentName || 'Student',
          category: f.category || f.title || 'Tuition Fee',
          amount: paidAmt,
          method: f.paymentMethod || 'Cash'
        }
      })
  }, [fees, students, currentInstitute, appliedDash, todayIso])

  const feeTotalCollected = useMemo(
    () => feeReceiptsInPeriod.reduce((s, r) => s + r.amount, 0),
    [feeReceiptsInPeriod]
  )

  const feeByCategory = useMemo(() => {
    const map = {}
    feeReceiptsInPeriod.forEach((r) => {
      if (!map[r.category]) map[r.category] = { category: r.category, receipts: 0, collected: 0 }
      map[r.category].receipts += 1
      map[r.category].collected += r.amount
    })
    return Object.values(map)
  }, [feeReceiptsInPeriod])

  // Expenses in period
  const expensesInPeriod = useMemo(() => {
    return expenses.filter((e) => {
      if (currentInstitute?.id && e.instituteId && e.instituteId !== currentInstitute.id) return false
      const dt = String(e.date || e.createdAt || '').slice(0, 10)
      if (appliedDash.from && dt && dt < appliedDash.from) return false
      if (appliedDash.to && dt && dt > appliedDash.to) return false
      if (appliedDash.expCategory !== 'ALL' && e.category !== appliedDash.expCategory) return false
      if (appliedDash.vendor !== 'ALL' && (e.vendor || '') !== appliedDash.vendor) return false
      return true
    })
  }, [expenses, currentInstitute, appliedDash])

  const expensesPaidTotal = useMemo(
    () => expensesInPeriod.reduce((s, e) => s + Number(e.paidAmount ?? e.amount ?? 0), 0),
    [expensesInPeriod]
  )
  const pendingPayablesList = useMemo(
    () =>
      expensesInPeriod.filter((e) => {
        const tot = Number(e.amount || 0)
        const pd = Number(e.paidAmount ?? e.amount ?? 0)
        return tot - pd > 0
      }),
    [expensesInPeriod]
  )
  const pendingPayablesTotal = useMemo(
    () =>
      pendingPayablesList.reduce(
        (s, e) => s + Math.max(0, Number(e.amount || 0) - Number(e.paidAmount ?? 0)),
        0
      ),
    [pendingPayablesList]
  )

  // Other income in period
  const otherIncomeInPeriod = useMemo(() => {
    return otherIncomes.filter((inc) => {
      const dt = String(inc.date || '').slice(0, 10)
      if (appliedDash.from && dt && dt < appliedDash.from) return false
      if (appliedDash.to && dt && dt > appliedDash.to) return false
      return true
    })
  }, [otherIncomes, appliedDash])

  const otherIncomeTotal = useMemo(
    () => otherIncomeInPeriod.reduce((s, r) => s + Number(r.amount || 0), 0),
    [otherIncomeInPeriod]
  )

  const totalRevenue = (includeFees ? feeTotalCollected : 0) + otherIncomeTotal
  const totalExpensesPaid = expensesPaidTotal
  const cashSurplus = totalRevenue - totalExpensesPaid

  // ============================================================================
  // OTHER INCOME STATE
  // ============================================================================
  const [incTab, setIncTab] = useState('all') // 'all' | 'add'
  const [incSearch, setIncSearch] = useState('')
  const [incMethodFilter, setIncMethodFilter] = useState('ALL')
  const [incDateFilter, setIncDateFilter] = useState('')
  const [incMenuId, setIncMenuId] = useState(null)
  const [incEditModal, setIncEditModal] = useState(null)
  const [incAddForm, setIncAddForm] = useState({
    name: '',
    paymentMethod: 'Cash',
    amount: '',
    description: '',
    date: todayIso
  })

  const filteredIncomes = useMemo(() => {
    return otherIncomes.filter((inc) => {
      if (incMethodFilter !== 'ALL' && inc.paymentMethod !== incMethodFilter) return false
      if (incDateFilter && inc.date !== incDateFilter) return false
      if (incSearch.trim()) {
        const q = incSearch.trim().toLowerCase()
        if (
          !(inc.name || '').toLowerCase().includes(q) &&
          !(inc.description || '').toLowerCase().includes(q)
        ) {
          return false
        }
      }
      return true
    })
  }, [otherIncomes, incMethodFilter, incDateFilter, incSearch])

  // ============================================================================
  // RENDER: FINANCIAL DASHBOARD
  // ============================================================================
  if (mode === 'dashboard') {
    const totalRevenueRecords =
      (includeFees ? feeReceiptsInPeriod.length : 0) + otherIncomeInPeriod.length

    return (
      <div className="p-4 sm:p-6 space-y-4 max-w-[1440px] mx-auto">
        <QuickHeader
          title="Financial Dashboard"
          onBack={() => onRouteChange?.('inst-dashboard')}
          onRouteChange={onRouteChange}
          onOpenQuickPayment={onOpenQuickPayment}
        />

        {/* 4 Top KPI Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-4 flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
                <Coins className="w-5 h-5" />
              </div>
              <div>
                <p className="text-[11px] font-medium text-slate-500">Total Revenue</p>
                <p className="text-lg font-extrabold text-emerald-600">{fmtPkr(totalRevenue)}</p>
              </div>
            </div>
            <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-600 text-[10px] font-semibold">
              {totalRevenueRecords} records
            </span>
          </div>

          <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-orange-50 text-orange-600 flex items-center justify-center shrink-0">
              <CreditCard className="w-5 h-5" />
            </div>
            <div>
              <p className="text-[11px] font-medium text-slate-500">Expenses Paid</p>
              <p className="text-lg font-extrabold text-orange-600">{fmtPkr(totalExpensesPaid)}</p>
              <p className="text-[10px] text-slate-400">{expensesInPeriod.length} records in period</p>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
              <Hourglass className="w-5 h-5" />
            </div>
            <div>
              <p className="text-[11px] font-medium text-slate-500">Pending Payables</p>
              <p className="text-lg font-extrabold text-amber-600">{fmtPkr(pendingPayablesTotal)}</p>
              <p className="text-[10px] text-slate-400">
                {pendingPayablesList.length > 0
                  ? `${pendingPayablesList.length} unpaid bills`
                  : 'No unpaid bills'}
              </p>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-teal-50 text-teal-600 flex items-center justify-center shrink-0">
              <TrendingUp className="w-5 h-5" />
            </div>
            <div>
              <p className="text-[11px] font-medium text-slate-500">Cash Surplus</p>
              <p
                className={`text-lg font-extrabold ${
                  cashSurplus >= 0 ? 'text-emerald-600' : 'text-rose-600'
                }`}
              >
                {fmtPkr(cashSurplus)}
              </p>
              <p className="text-[10px] text-slate-400">Revenue minus expenses paid</p>
            </div>
          </div>
        </div>

        {/* Include Toggles Strip */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm px-4 py-2.5 flex flex-wrap items-center justify-between gap-4 text-xs">
          <label className="inline-flex items-center gap-2 cursor-pointer font-semibold text-slate-700">
            <input
              type="checkbox"
              checked={includeSalaries}
              onChange={(e) => setIncludeSalaries(e.target.checked)}
              className="rounded border-slate-300 text-blue-600"
            />
            Include Paid Staff Salaries
            <span className="px-2 py-0.5 rounded bg-amber-100 text-amber-800 text-[10px] font-bold">
              PKR 0
            </span>
          </label>

          <label className="inline-flex items-center gap-2 cursor-pointer font-semibold text-slate-700">
            <input
              type="checkbox"
              checked={includeFees}
              onChange={(e) => setIncludeFees(e.target.checked)}
              className="rounded border-slate-300 text-blue-600"
            />
            Include Collected Student Fee &amp; Stock Fee
            <span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-700 text-[10px] font-bold">
              {fmtPkr(feeTotalCollected)}
            </span>
          </label>

          <span className="inline-flex items-center gap-1 text-[11px] text-slate-400">
            <Info className="w-3.5 h-3.5" />
            No family credit in period
          </span>
        </div>

        {/* Filters Card */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-4 space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-1.5 text-xs font-bold text-slate-700">
              <Filter className="w-3.5 h-3.5" />
              Filters
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={() =>
                  downloadSimplePdf('financial-dashboard.pdf', [
                    { text: 'Financial Dashboard Summary', bold: true },
                    `Period: ${appliedDash.from} to ${appliedDash.to}`,
                    `Total Revenue: ${fmtPkr(totalRevenue)}`,
                    `Expenses Paid: ${fmtPkr(totalExpensesPaid)}`,
                    `Cash Surplus: ${fmtPkr(cashSurplus)}`
                  ])
                }
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold"
              >
                <FileText className="w-3.5 h-3.5" />
                Download PDF Reports
              </button>
              <button
                type="button"
                onClick={() => {
                  const lines = [
                    'Type,Date,Title/Student,Category,Amount',
                    ...feeReceiptsInPeriod.map(
                      (r) => `Fee,${r.date},"${r.studentName}","${r.category}",${r.amount}`
                    ),
                    ...otherIncomeInPeriod.map(
                      (i) => `Other Income,${i.date},"${i.name}","Other",${i.amount}`
                    )
                  ]
                  const blob = new Blob([lines.join('\n')], { type: 'text/csv;charset=utf-8;' })
                  const url = URL.createObjectURL(blob)
                  const a = document.createElement('a')
                  a.href = url
                  a.download = `financial-report-${appliedDash.from}.csv`
                  a.click()
                  URL.revokeObjectURL(url)
                  toast.success('CSV report downloaded')
                }}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold"
              >
                <Download className="w-3.5 h-3.5" />
                Download CSV Reports
              </button>
              <button
                type="button"
                onClick={() => setShowChartsPreview((v) => !v)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold"
              >
                <BarChart3 className="w-3.5 h-3.5" />
                Charts Preview
              </button>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-1.5 text-xs">
            <span className="text-[11px] text-slate-400 mr-1">Quick range:</span>
            {[
              { id: 'today', label: 'Today' },
              { id: 'month', label: 'This month' },
              { id: 'last_month', label: 'Last month' },
              { id: '3m', label: 'Last 3 months' },
              { id: 'year', label: 'This year' }
            ].map((q) => (
              <button
                key={q.id}
                type="button"
                onClick={() => applyQuickRange(q.id)}
                className={`px-2.5 py-1 rounded text-[11px] font-semibold transition-colors ${
                  quickRange === q.id
                    ? 'bg-blue-500 text-white'
                    : 'border border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                }`}
              >
                {q.label}
              </button>
            ))}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-[1fr_1fr_1fr_1fr_0.9fr_0.9fr_1.1fr_auto] gap-2.5 items-end">
            <div>
              <label className="block text-[10px] font-semibold text-slate-500 mb-1">From</label>
              <input
                type="date"
                value={fromDate}
                onChange={(e) => setFromDate(e.target.value)}
                className="w-full px-2.5 py-1.5 text-xs rounded-md border border-slate-200"
              />
            </div>
            <div>
              <label className="block text-[10px] font-semibold text-slate-500 mb-1">To</label>
              <input
                type="date"
                value={toDate}
                onChange={(e) => setToDate(e.target.value)}
                className="w-full px-2.5 py-1.5 text-xs rounded-md border border-slate-200"
              />
            </div>
            <div>
              <label className="block text-[10px] font-semibold text-slate-500 mb-1">Expense category</label>
              <select
                value={expCategory}
                onChange={(e) => setExpCategory(e.target.value)}
                className="w-full px-2.5 py-1.5 text-xs rounded-md border border-slate-200 bg-white"
              >
                <option value="ALL">All categories</option>
              </select>
            </div>
            <div>
              <label className="block text-[10px] font-semibold text-slate-500 mb-1">Added by</label>
              <select
                value={addedByFilter}
                onChange={(e) => setAddedByFilter(e.target.value)}
                className="w-full px-2.5 py-1.5 text-xs rounded-md border border-slate-200 bg-white"
              >
                <option value="ALL">All staff</option>
              </select>
            </div>
            <div>
              <label className="block text-[10px] font-semibold text-slate-500 mb-1">Status</label>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full px-2.5 py-1.5 text-xs rounded-md border border-slate-200 bg-white"
              >
                <option value="ALL">All statuses</option>
                <option value="Paid">Paid</option>
                <option value="Pending">Pending</option>
              </select>
            </div>
            <div>
              <label className="block text-[10px] font-semibold text-slate-500 mb-1">Vendor</label>
              <select
                value={vendorFilter}
                onChange={(e) => setVendorFilter(e.target.value)}
                className="w-full px-2.5 py-1.5 text-xs rounded-md border border-slate-200 bg-white"
              >
                <option value="ALL">All vendors</option>
              </select>
            </div>
            <div>
              <label className="block text-[10px] font-semibold text-slate-500 mb-1">Fee category / type</label>
              <select
                value={feeCatFilter}
                onChange={(e) => setFeeCatFilter(e.target.value)}
                className="w-full px-2.5 py-1.5 text-xs rounded-md border border-slate-200 bg-white"
              >
                <option value="ALL">All fee category / types</option>
                <option value="Tuition Fee">Tuition Fee</option>
                <option value="Admission Fee">Admission Fee</option>
                <option value="Transport Fee">Transport Fee</option>
              </select>
            </div>
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={() =>
                  setAppliedDash({
                    from: fromDate,
                    to: toDate,
                    expCategory,
                    status: statusFilter,
                    vendor: vendorFilter,
                    feeCat: feeCatFilter
                  })
                }
                className="inline-flex items-center gap-1 px-3.5 py-1.5 rounded-md bg-blue-500 hover:bg-blue-600 text-white text-xs font-semibold"
              >
                <Filter className="w-3.5 h-3.5" />
                Apply
              </button>
              <button
                type="button"
                onClick={() => applyQuickRange('month')}
                className="px-3 py-1.5 rounded-md border border-slate-200 bg-white hover:bg-slate-50 text-slate-600 text-xs font-semibold"
              >
                Reset
              </button>
            </div>
          </div>

          {showChartsPreview && (
            <div className="pt-3 border-t border-slate-100 grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
              <div className="p-3 rounded-lg bg-emerald-50/70 border border-emerald-200">
                <div className="text-slate-500">Revenue Share</div>
                <div className="font-bold text-emerald-700 text-sm mt-0.5">{fmtPkr(totalRevenue)}</div>
              </div>
              <div className="p-3 rounded-lg bg-orange-50/70 border border-orange-200">
                <div className="text-slate-500">Expense Outflow</div>
                <div className="font-bold text-orange-700 text-sm mt-0.5">{fmtPkr(totalExpensesPaid)}</div>
              </div>
              <div className="p-3 rounded-lg bg-blue-50/70 border border-blue-200">
                <div className="text-slate-500">Net Cash Flow</div>
                <div className="font-bold text-blue-700 text-sm mt-0.5">{fmtPkr(cashSurplus)}</div>
              </div>
            </div>
          )}
        </div>

        {/* Fee collections by fee category / type */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="px-5 py-3 border-b border-slate-200 flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-2 text-xs font-bold text-slate-800">
              <BarChart3 className="w-4 h-4 text-emerald-600" />
              Fee collections by fee category / type
            </div>
            <span className="text-[10px] text-slate-400">
              Cash attributed (tuition first, then transport; includes ledger payments without receipt)
            </span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-[11px] font-semibold text-slate-600">
                  <th className="py-2.5 px-5">Fee category / type</th>
                  <th className="py-2.5 px-4 text-right">Receipts</th>
                  <th className="py-2.5 px-5 text-right">Collected</th>
                  <th className="py-2.5 px-5 w-28" />
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {feeByCategory.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="py-6 text-center text-slate-400">
                      No student fee collections in this period.
                    </td>
                  </tr>
                ) : (
                  feeByCategory.map((row) => (
                    <tr key={row.category}>
                      <td className="py-2.5 px-5 font-medium text-blue-600">{row.category}</td>
                      <td className="py-2.5 px-4 text-right text-slate-700">{row.receipts}</td>
                      <td className="py-2.5 px-5 text-right font-bold text-emerald-700">
                        {fmtPkrDec(row.collected)}
                      </td>
                      <td className="py-2.5 px-5">
                        <div className="w-20 h-1.5 rounded-full bg-emerald-600 ml-auto" />
                      </td>
                    </tr>
                  ))
                )}
                <tr className="bg-slate-50 font-bold">
                  <td className="py-2.5 px-5 text-slate-800">Total student fees</td>
                  <td className="py-2.5 px-4 text-right text-slate-800">{feeReceiptsInPeriod.length}</td>
                  <td className="py-2.5 px-5 text-right text-slate-900">{fmtPkrDec(feeTotalCollected)}</td>
                  <td />
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* Pending Payments & Vendor-wise Totals */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="px-5 py-3 border-b border-slate-200 text-xs font-bold text-slate-800">
              Pending Payments ({pendingPayablesList.length})
            </div>
            <div className="p-4 text-xs">
              {pendingPayablesList.length === 0 ? (
                <div className="py-6 text-center text-slate-400">
                  No pending or partial expenses in this period.
                </div>
              ) : (
                <table className="w-full text-left">
                  <thead>
                    <tr className="text-[11px] text-slate-500 border-b border-slate-100">
                      <th className="py-1.5">Date</th>
                      <th className="py-1.5">Title</th>
                      <th className="py-1.5 text-right">Remaining</th>
                    </tr>
                  </thead>
                  <tbody>
                    {pendingPayablesList.slice(0, 5).map((e) => (
                      <tr key={e.id} className="border-b border-slate-50">
                        <td className="py-2 text-slate-500">{formatDisplayDate(e.date)}</td>
                        <td className="py-2 font-medium text-slate-800">{e.title}</td>
                        <td className="py-2 text-right font-bold text-rose-600">
                          {fmtPkr(Number(e.amount || 0) - Number(e.paidAmount || 0))}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>

          <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="px-5 py-3 border-b border-slate-200 text-xs font-bold text-slate-800">
              Vendor-wise totals
            </div>
            <div className="p-4 text-xs">
              <div className="py-6 text-center text-slate-400">No vendor data in this period.</div>
            </div>
          </div>
        </div>

        {/* Expense Summary */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="px-5 py-3 border-b border-slate-200 flex items-center justify-between">
            <span className="text-xs font-bold text-slate-800">
              Expense Summary ({expensesInPeriod.length})
            </span>
            <button
              type="button"
              onClick={() => onRouteChange?.('inst-accounts-expenses')}
              className="px-3 py-1 rounded border border-blue-200 text-blue-600 hover:bg-blue-50 text-[11px] font-semibold"
            >
              View all Expenses →
            </button>
          </div>
          <div className="p-4 text-xs">
            {expensesInPeriod.length === 0 ? (
              <div className="py-6 text-center text-slate-400">No expenses in this period.</div>
            ) : (
              <div className="text-slate-600">
                Showing {expensesInPeriod.length} expense record(s) totaling {fmtPkr(expensesPaidTotal)}.
              </div>
            )}
          </div>
        </div>

        {/* Bottom 2-Col Grid: Other Income & Fee Collections */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="px-5 py-3 border-b border-slate-200 flex items-center justify-between">
              <span className="text-xs font-bold text-slate-800">
                Other Income ({otherIncomeInPeriod.length})
              </span>
              <button
                type="button"
                onClick={() => onRouteChange?.('inst-accounts-income')}
                className="px-3 py-1 rounded border border-blue-200 text-blue-600 hover:bg-blue-50 text-[11px] font-semibold"
              >
                View all Other Income →
              </button>
            </div>
            <div className="p-4 text-xs">
              {otherIncomeInPeriod.length === 0 ? (
                <div className="py-6 text-center text-slate-400">No revenue records in this period.</div>
              ) : (
                <table className="w-full text-left">
                  <thead>
                    <tr className="text-[11px] text-slate-500 border-b border-slate-100">
                      <th className="py-1.5">#</th>
                      <th className="py-1.5">Date</th>
                      <th className="py-1.5">Title</th>
                      <th className="py-1.5 text-right">Amount</th>
                    </tr>
                  </thead>
                  <tbody>
                    {otherIncomeInPeriod.slice(0, 5).map((inc, idx) => (
                      <tr key={inc.id} className="border-b border-slate-50">
                        <td className="py-2 text-slate-500">{idx + 1}</td>
                        <td className="py-2 text-slate-600">{formatDisplayDate(inc.date)}</td>
                        <td className="py-2 font-semibold text-slate-800">{inc.name}</td>
                        <td className="py-2 text-right font-bold text-emerald-600">
                          {fmtPkr(inc.amount)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>

          <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="px-5 py-3 border-b border-slate-200 flex items-center justify-between">
              <span className="text-xs font-bold text-slate-800">
                Fee Collections ({feeReceiptsInPeriod.length})
              </span>
              <button
                type="button"
                onClick={() => onRouteChange?.('inst-accounts-collection')}
                className="px-3 py-1 rounded border border-emerald-200 text-emerald-700 hover:bg-emerald-50 text-[11px] font-semibold"
              >
                View Detailed Fee Report →
              </button>
            </div>
            <div className="p-4 text-xs overflow-x-auto">
              {feeReceiptsInPeriod.length === 0 ? (
                <div className="py-6 text-center text-slate-400">No fee collections in this period.</div>
              ) : (
                <table className="w-full text-left">
                  <thead>
                    <tr className="text-[11px] text-slate-500 border-b border-slate-100">
                      <th className="py-1.5">#</th>
                      <th className="py-1.5">Date</th>
                      <th className="py-1.5">Student / Type</th>
                      <th className="py-1.5">Category</th>
                      <th className="py-1.5 text-right">Amount</th>
                      <th className="py-1.5 text-right">Method</th>
                    </tr>
                  </thead>
                  <tbody>
                    {feeReceiptsInPeriod.slice(0, 6).map((r, idx) => (
                      <tr key={r.id} className="border-b border-slate-50">
                        <td className="py-2 text-slate-500">{idx + 1}</td>
                        <td className="py-2 text-slate-600">{formatDisplayDate(r.date)}</td>
                        <td className="py-2 font-semibold text-blue-600">Student Fee — {r.studentName}</td>
                        <td className="py-2 text-slate-600">{r.category}</td>
                        <td className="py-2 text-right font-bold text-slate-800">
                          {fmtPkrDec(r.amount)}
                        </td>
                        <td className="py-2 text-right text-slate-600">{r.method}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        </div>
      </div>
    )
  }

  // ============================================================================
  // RENDER: OTHER INCOME
  // ============================================================================
  const totalOtherSum = otherIncomes.reduce((s, x) => s + Number(x.amount || 0), 0)
  const thisMonthIncomes = otherIncomes.filter((x) => String(x.date || '').startsWith(todayIso.slice(0, 7)))
  const thisMonthSum = thisMonthIncomes.reduce((s, x) => s + Number(x.amount || 0), 0)

  return (
    <div className="p-4 sm:p-6 space-y-5 max-w-[1440px] mx-auto">
      <QuickHeader
        title="Other Income"
        onBack={() => onRouteChange?.('inst-accounts')}
        onRouteChange={onRouteChange}
        onOpenQuickPayment={onOpenQuickPayment}
      />

      {/* 4 KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-4 flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-lg bg-emerald-600 text-white flex items-center justify-center shrink-0">
            <ArrowUpRight className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs font-medium text-slate-500">Total Entries</p>
            <p className="text-xl font-bold text-slate-900">{otherIncomes.length}</p>
            <p className="text-[11px] text-slate-400">{fmtPkr(totalOtherSum)}</p>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-4 flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-lg bg-orange-500 text-white flex items-center justify-center shrink-0">
            <Calendar className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs font-medium text-slate-500">This Month</p>
            <p className="text-xl font-bold text-slate-900">{thisMonthIncomes.length}</p>
            <p className="text-[11px] text-slate-400">{fmtPkr(thisMonthSum)}</p>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-4 flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-lg bg-cyan-500 text-white flex items-center justify-center shrink-0">
            <Calendar className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs font-medium text-slate-500">Last 3 Months</p>
            <p className="text-xl font-bold text-slate-900">{otherIncomes.length}</p>
            <p className="text-[11px] text-slate-400">{fmtPkr(totalOtherSum)}</p>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-4 flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-lg bg-blue-600 text-white flex items-center justify-center shrink-0">
            <Coins className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs font-medium text-slate-500">Total Revenue</p>
            <p className="text-xl font-bold text-slate-900">{totalOtherSum.toLocaleString()}</p>
          </div>
        </div>
      </div>

      {/* Main Card */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="px-5 py-3.5 border-b border-slate-200 flex items-center justify-between">
          <div className="flex items-center gap-2 text-sm font-bold text-slate-800">
            <ArrowUpRight className="w-4 h-4 text-slate-600" />
            Other Income
          </div>
          <button
            type="button"
            onClick={() => {
              const lines = [
                'S/N,Name,Payment Method,Amount,Description,Date',
                ...filteredIncomes.map(
                  (x, i) =>
                    `${i + 1},"${x.name}","${x.paymentMethod}",${x.amount},"${x.description || ''}","${x.date}"`
                )
              ]
              const blob = new Blob([lines.join('\n')], { type: 'text/csv;charset=utf-8;' })
              const url = URL.createObjectURL(blob)
              const a = document.createElement('a')
              a.href = url
              a.download = `other-income-${todayIso}.csv`
              a.click()
              URL.revokeObjectURL(url)
              toast.success('Exported other income CSV')
            }}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-blue-500 hover:bg-blue-600 text-white text-xs font-semibold"
          >
            <Download className="w-3.5 h-3.5" />
            Export
          </button>
        </div>

        <div className="px-5 pt-3 border-b border-slate-200 flex items-center gap-6">
          <button
            type="button"
            onClick={() => setIncTab('all')}
            className={`pb-3 inline-flex items-center gap-1.5 text-xs font-semibold border-b-2 transition-colors ${
              incTab === 'all'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <List className="w-3.5 h-3.5" />
            All Income
          </button>
          <button
            type="button"
            onClick={() => setIncTab('add')}
            className={`pb-3 inline-flex items-center gap-1.5 text-xs font-semibold border-b-2 transition-colors ${
              incTab === 'add'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Plus className="w-3.5 h-3.5" />
            Add Income
          </button>
        </div>

        {incTab === 'add' ? (
          <form
            onSubmit={(e) => {
              e.preventDefault()
              if (!incAddForm.name.trim() || Number(incAddForm.amount || 0) <= 0) {
                toast.warning('Enter income name and valid amount')
                return
              }
              const created = {
                id: `inc_${Date.now()}`,
                name: incAddForm.name.trim(),
                paymentMethod: incAddForm.paymentMethod,
                amount: Number(incAddForm.amount),
                description: incAddForm.description.trim(),
                date: incAddForm.date || todayIso,
                createdAt: todayIso
              }
              persistIncomes((prev) => [created, ...prev])
              toast.success(`Added income "${created.name}"`)
              setIncAddForm({ name: '', paymentMethod: 'Cash', amount: '', description: '', date: todayIso })
              setIncTab('all')
            }}
            className="p-6 max-w-2xl space-y-4 text-xs"
          >
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Income Title / Name</label>
                <input
                  type="text"
                  required
                  value={incAddForm.name}
                  onChange={(e) => setIncAddForm((p) => ({ ...p, name: e.target.value }))}
                  placeholder="e.g. Donation, Book Sale, Grant"
                  className="w-full px-3 py-2 rounded-lg border border-slate-200"
                />
              </div>
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Payment Method</label>
                <select
                  value={incAddForm.paymentMethod}
                  onChange={(e) => setIncAddForm((p) => ({ ...p, paymentMethod: e.target.value }))}
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 bg-white"
                >
                  <option value="Cash">Cash</option>
                  <option value="Bank Transfer">Bank Transfer</option>
                  <option value="EasyPaisa">EasyPaisa</option>
                  <option value="JazzCash">JazzCash</option>
                </select>
              </div>
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Amount (PKR)</label>
                <input
                  type="number"
                  min="1"
                  required
                  value={incAddForm.amount}
                  onChange={(e) => setIncAddForm((p) => ({ ...p, amount: e.target.value }))}
                  className="w-full px-3 py-2 rounded-lg border border-slate-200"
                />
              </div>
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Date</label>
                <input
                  type="date"
                  required
                  value={incAddForm.date}
                  onChange={(e) => setIncAddForm((p) => ({ ...p, date: e.target.value }))}
                  className="w-full px-3 py-2 rounded-lg border border-slate-200"
                />
              </div>
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Description</label>
              <textarea
                rows={2}
                value={incAddForm.description}
                onChange={(e) => setIncAddForm((p) => ({ ...p, description: e.target.value }))}
                className="w-full px-3 py-2 rounded-lg border border-slate-200"
              />
            </div>
            <div className="flex gap-2">
              <button
                type="submit"
                className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-semibold"
              >
                Save Income
              </button>
              <button
                type="button"
                onClick={() => setIncTab('all')}
                className="px-4 py-2 rounded-lg border border-slate-200 text-slate-600 font-semibold"
              >
                Cancel
              </button>
            </div>
          </form>
        ) : (
          <div className="p-5 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-600 mb-1">Search:</label>
                <input
                  type="text"
                  value={incSearch}
                  onChange={(e) => setIncSearch(e.target.value)}
                  placeholder="Search by name, description..."
                  className="w-full px-3 py-2 rounded-md border border-slate-200"
                />
              </div>
              <div>
                <label className="block font-semibold text-slate-600 mb-1">Filter by Payment Method:</label>
                <select
                  value={incMethodFilter}
                  onChange={(e) => setIncMethodFilter(e.target.value)}
                  className="w-full px-3 py-2 rounded-md border border-slate-200 bg-white"
                >
                  <option value="ALL">All Methods</option>
                  <option value="Cash">Cash</option>
                  <option value="Bank Transfer">Bank Transfer</option>
                  <option value="EasyPaisa">EasyPaisa</option>
                  <option value="JazzCash">JazzCash</option>
                </select>
              </div>
              <div>
                <label className="block font-semibold text-slate-600 mb-1">Date Range:</label>
                <input
                  type="date"
                  value={incDateFilter}
                  onChange={(e) => setIncDateFilter(e.target.value)}
                  className="w-full px-3 py-2 rounded-md border border-slate-200"
                />
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-slate-200 text-[11px] font-semibold text-slate-600">
                    <th className="py-2.5 px-3 w-14">S/N</th>
                    <th className="py-2.5 px-3">Name</th>
                    <th className="py-2.5 px-3">Payment Method</th>
                    <th className="py-2.5 px-3">Amount</th>
                    <th className="py-2.5 px-3">Description</th>
                    <th className="py-2.5 px-3">Date</th>
                    <th className="py-2.5 px-3">Created At</th>
                    <th className="py-2.5 px-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredIncomes.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="py-10 text-center text-slate-400">
                        No other income entries found. Click <strong>+ Add Income</strong> to record revenue.
                      </td>
                    </tr>
                  ) : (
                    filteredIncomes.map((inc, idx) => (
                      <tr key={inc.id} className="hover:bg-slate-50/70">
                        <td className="py-3 px-3 text-slate-500">{idx + 1}</td>
                        <td className="py-3 px-3 font-bold text-slate-800">{inc.name}</td>
                        <td className="py-3 px-3">
                          <span className="px-2 py-0.5 rounded bg-slate-600 text-white text-[10px] font-semibold">
                            {inc.paymentMethod}
                          </span>
                        </td>
                        <td className="py-3 px-3 font-bold text-emerald-600">{fmtPkr(inc.amount)}</td>
                        <td className="py-3 px-3 text-slate-600">{inc.description || '—'}</td>
                        <td className="py-3 px-3 text-slate-600">{formatDisplayDate(inc.date)}</td>
                        <td className="py-3 px-3 text-slate-600">{formatDisplayDate(inc.createdAt)}</td>
                        <td className="py-3 px-3 text-right relative">
                          <button
                            type="button"
                            onClick={() => setIncMenuId((p) => (p === inc.id ? null : inc.id))}
                            className="inline-flex items-center gap-1 px-2 py-1 rounded hover:bg-slate-100 text-slate-600"
                          >
                            <Menu className="w-3.5 h-3.5" />
                            <ChevronDown className="w-3 h-3" />
                          </button>
                          {incMenuId === inc.id && (
                            <div className="absolute right-4 top-9 z-20 w-28 bg-white border border-slate-200 rounded-lg shadow-lg py-1 text-left">
                              <button
                                type="button"
                                onClick={() => {
                                  setIncMenuId(null)
                                  setIncEditModal({ ...inc })
                                }}
                                className="w-full px-3 py-1.5 hover:bg-slate-50 text-slate-700"
                              >
                                Edit
                              </button>
                              <button
                                type="button"
                                onClick={() => {
                                  setIncMenuId(null)
                                  persistIncomes((prev) => prev.filter((x) => x.id !== inc.id))
                                  toast.success('Income entry deleted')
                                }}
                                className="w-full px-3 py-1.5 hover:bg-rose-50 text-rose-600 font-medium"
                              >
                                Delete
                              </button>
                            </div>
                          )}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {incEditModal && (
        <Modal
          isOpen
          onClose={() => setIncEditModal(null)}
          title="Edit Other Income"
          maxWidth="max-w-sm"
        >
          <form
            onSubmit={(e) => {
              e.preventDefault()
              persistIncomes((prev) =>
                prev.map((x) =>
                  x.id === incEditModal.id
                    ? { ...incEditModal, amount: Number(incEditModal.amount || 0) }
                    : x
                )
              )
              toast.success('Income updated')
              setIncEditModal(null)
            }}
            className="space-y-3 text-xs"
          >
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Name</label>
              <input
                type="text"
                required
                value={incEditModal.name}
                onChange={(e) => setIncEditModal((p) => ({ ...p, name: e.target.value }))}
                className="w-full px-3 py-2 rounded-lg border border-slate-200"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Amount (PKR)</label>
              <input
                type="number"
                required
                value={incEditModal.amount}
                onChange={(e) => setIncEditModal((p) => ({ ...p, amount: e.target.value }))}
                className="w-full px-3 py-2 rounded-lg border border-slate-200"
              />
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setIncEditModal(null)}
                className="px-3.5 py-1.5 rounded-lg border border-slate-200 text-slate-600 font-semibold"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-1.5 rounded-lg bg-blue-600 text-white font-semibold"
              >
                Save
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  )
}

export default FinanceDashboardAndIncomeViews
