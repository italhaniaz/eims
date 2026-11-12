import React, { useState, useMemo, useEffect } from 'react'
import {
  ArrowLeft,
  FileText,
  UserPlus,
  CreditCard,
  Receipt,
  ArrowDownCircle,
  MessageSquare,
  Package,
  ArrowDown,
  ArrowUp,
  Layers,
  AlertTriangle,
  DollarSign,
  TrendingUp,
  Filter,
  Search,
  FileSpreadsheet,
  List,
  FolderOpen
} from 'lucide-react'
import { useToast } from '../../../context/ToastContext'
import { downloadSimplePdf } from '../../../utils/pdfExport'

const fmtPkr = (n) => `PKR ${Number(n || 0).toLocaleString()}`

const formatDisplayDate = (iso) => {
  if (!iso) return '—'
  const dt = new Date(`${String(iso).slice(0, 10)}T12:00:00`)
  if (Number.isNaN(dt.getTime())) return String(iso).slice(0, 10)
  return dt.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })
}

const pad2 = (n) => String(n).padStart(2, '0')
const toIso = (d) => `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}`

const QuickHeader = ({ title, onBack, onRouteChange, onOpenQuickPayment, onOpenSendSms }) => (
  <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
    <div>
      <div className="flex items-center gap-2">
        <FileText className="w-5 h-5 text-slate-600" />
        <h1 className="text-xl font-bold text-slate-900 tracking-tight">{title}</h1>
      </div>
      <button
        type="button"
        onClick={onBack}
        className="mt-0.5 inline-flex items-center gap-1 text-xs font-medium text-slate-500 hover:text-slate-800 transition-colors cursor-pointer"
      >
        <ArrowLeft className="w-3.5 h-3.5" />
        <span>Back</span>
      </button>
    </div>

    <div className="flex flex-wrap items-center gap-2">
      <button
        type="button"
        onClick={() => onRouteChange?.('inst-admissions-enroll')}
        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold shadow-sm transition-colors cursor-pointer"
      >
        <UserPlus className="w-3.5 h-3.5" />
        <span>New Enrollment</span>
      </button>
      <button
        type="button"
        onClick={() => onOpenQuickPayment?.()}
        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-orange-500 hover:bg-orange-600 text-white text-xs font-semibold shadow-sm transition-colors cursor-pointer"
      >
        <CreditCard className="w-3.5 h-3.5" />
        <span>Add Payment</span>
      </button>
      <button
        type="button"
        onClick={() => onRouteChange?.('inst-fees')}
        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold shadow-sm transition-colors cursor-pointer"
      >
        <Receipt className="w-3.5 h-3.5" />
        <span>Generate Invoice</span>
      </button>
      <button
        type="button"
        onClick={() => onRouteChange?.('inst-accounts-expenses')}
        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 text-xs font-semibold shadow-sm transition-colors cursor-pointer"
      >
        <ArrowDownCircle className="w-3.5 h-3.5" />
        <span>Manage Expense</span>
      </button>
      <button
        type="button"
        onClick={() => (onOpenSendSms ? onOpenSendSms() : onRouteChange?.('inst-communication-sms'))}
        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 text-xs font-semibold shadow-sm transition-colors cursor-pointer"
      >
        <MessageSquare className="w-3.5 h-3.5" />
        <span>Send SMS</span>
      </button>
    </div>
  </div>
)

export const InventoryReportsView = ({
  currentInstitute,
  onRouteChange,
  onOpenQuickPayment,
  onOpenSendSms
}) => {
  const { toast } = useToast()
  const instId = currentInstitute?.id || 'inst-1'
  const instName = currentInstitute?.name || 'EduDigize Demo'

  const catKey = `sms_campus_inv_categories_${instId}`
  const itemsKey = `sms_campus_inv_items_${instId}`
  const receivesKey = `sms_campus_inv_receives_${instId}`
  const issuesKey = `sms_campus_inv_issues_${instId}`

  const [categories, setCategories] = useState([])
  const [items, setItems] = useState([])
  const [receives, setReceives] = useState([])
  const [issues, setIssues] = useState([])

  const now = new Date()
  const defaultEnd = toIso(now)
  const oneYearAgo = new Date(now.getFullYear() - 1, now.getMonth(), now.getDate())
  const defaultStart = toIso(oneYearAgo)

  const [startDate, setStartDate] = useState(defaultStart)
  const [endDate, setEndDate] = useState(defaultEnd)
  const [categoryFilter, setCategoryFilter] = useState('all')
  const [applied, setApplied] = useState({ start: defaultStart, end: defaultEnd, category: 'all' })

  useEffect(() => {
    try {
      const c = JSON.parse(localStorage.getItem(catKey) || '[]')
      setCategories(Array.isArray(c) ? c : [])
    } catch {
      setCategories([])
    }
    try {
      const it = JSON.parse(localStorage.getItem(itemsKey) || '[]')
      setItems(Array.isArray(it) ? it : [])
    } catch {
      setItems([])
    }
    try {
      const r = JSON.parse(localStorage.getItem(receivesKey) || '[]')
      setReceives(Array.isArray(r) ? r : [])
    } catch {
      setReceives([])
    }
    try {
      const iss = JSON.parse(localStorage.getItem(issuesKey) || '[]')
      setIssues(Array.isArray(iss) ? iss : [])
    } catch {
      setIssues([])
    }
  }, [instId, catKey, itemsKey, receivesKey, issuesKey])

  const applyQuick = (preset) => {
    const d = new Date()
    let s = ''
    let e = toIso(d)
    if (preset === 'today') {
      s = toIso(d)
    } else if (preset === 'this_month') {
      s = `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-01`
    } else if (preset === 'last_month') {
      const lm = new Date(d.getFullYear(), d.getMonth() - 1, 1)
      const lmEnd = new Date(d.getFullYear(), d.getMonth(), 0)
      s = toIso(lm)
      e = toIso(lmEnd)
    } else if (preset === 'last_3_months') {
      const m3 = new Date(d.getFullYear(), d.getMonth() - 3, d.getDate())
      s = toIso(m3)
    } else if (preset === 'this_year') {
      s = `${d.getFullYear()}-01-01`
      e = `${d.getFullYear()}-12-31`
    } else if (preset === 'all_time') {
      s = ''
      e = ''
    }
    setStartDate(s)
    setEndDate(e)
    setApplied({ start: s, end: e, category: categoryFilter })
  }

  const inRange = (iso) => {
    const dt = String(iso || '').slice(0, 10)
    if (applied.start && dt < applied.start) return false
    if (applied.end && dt > applied.end) return false
    return true
  }

  const filteredItems = useMemo(() => {
    if (applied.category === 'all') return items
    return items.filter((it) => it.category === applied.category)
  }, [items, applied.category])

  const periodReceives = useMemo(
    () =>
      receives.filter(
        (r) => inRange(r.date) && (applied.category === 'all' || r.category === applied.category)
      ),
    [receives, applied]
  )

  const periodIssues = useMemo(
    () =>
      issues.filter(
        (i) => inRange(i.date) && (applied.category === 'all' || i.category === applied.category)
      ),
    [issues, applied]
  )

  const productRows = useMemo(() => {
    return filteredItems.map((it) => {
      const recQty = periodReceives
        .filter((r) => r.itemId === it.id || r.itemName === it.name)
        .reduce((s, r) => s + Number(r.quantity || 0), 0)
      const recVal = recQty * Number(it.costPrice || 0)
      const outLines = periodIssues.filter((i) => i.itemId === it.id || i.itemName === it.name)
      const outQty = outLines.reduce((s, i) => s + Number(i.quantity || 0), 0)
      const outVal = outLines.reduce((s, i) => s + Number(i.amountDue || 0), 0)
      const expectedLeft = Math.max(0, recQty - outQty)
      const remaining = Number(it.quantity || 0)
      const stockSaleVal = remaining * Number(it.salePrice || 0)
      const stockCostVal = remaining * Number(it.costPrice || 0)
      const mismatch = remaining !== expectedLeft
      return {
        ...it,
        recQty,
        recVal,
        outQty,
        outVal,
        expectedLeft,
        remaining,
        stockSaleVal,
        stockCostVal,
        mismatch
      }
    })
  }, [filteredItems, periodReceives, periodIssues])

  const unpaidIssues = useMemo(
    () => periodIssues.filter((i) => i.status !== 'Paid'),
    [periodIssues]
  )

  const totals = useMemo(() => {
    const recQty = productRows.reduce((s, r) => s + r.recQty, 0)
    const recVal = productRows.reduce((s, r) => s + r.recVal, 0)
    const outQty = productRows.reduce((s, r) => s + r.outQty, 0)
    const outVal = productRows.reduce((s, r) => s + r.outVal, 0)
    const expectedLeft = productRows.reduce((s, r) => s + r.expectedLeft, 0)
    const remaining = productRows.reduce((s, r) => s + r.remaining, 0)
    const stockSaleVal = productRows.reduce((s, r) => s + r.stockSaleVal, 0)
    const stockCostVal = productRows.reduce((s, r) => s + r.stockCostVal, 0)
    const runningLow = productRows.filter((r) => r.remaining < 10).length
    const mismatchCount = productRows.filter((r) => r.mismatch).length
    const unpaidDue = unpaidIssues.reduce((s, i) => s + Number(i.amountDue || 0), 0)
    return {
      productCount: productRows.length,
      recQty,
      recVal,
      outQty,
      outVal,
      expectedLeft,
      remaining,
      stockSaleVal,
      stockCostVal,
      runningLow,
      mismatchCount,
      unpaidCount: unpaidIssues.length,
      unpaidDue
    }
  }, [productRows, unpaidIssues])

  const handleExportPdf = () => {
    downloadSimplePdf({
      title: `${instName} — Inventory Report`,
      subtitle: `Remaining Stock: ${totals.remaining} | Store Value: ${fmtPkr(totals.stockSaleVal)}`,
      columns: ['Product', 'Category', 'Received', 'Given Out', 'Expected Left', 'Remaining', 'Stock Value'],
      rows: productRows.map((r) => [
        r.name,
        r.category,
        String(r.recQty),
        String(r.outQty),
        String(r.expectedLeft),
        String(r.remaining),
        fmtPkr(r.stockSaleVal)
      ]),
      filename: `inventory-report-${instId}.pdf`
    })
    toast.success('Inventory report exported to PDF.')
  }

  const handleExportExcel = () => {
    const esc = (v) => `"${String(v ?? '').replace(/"/g, '""')}"`
    const header = ['Product', 'Category', 'Unit', 'Received', 'Given Out', 'Expected Left', 'Remaining', 'Sale Value', 'Cost Value']
    const rows = productRows.map((r) => [
      r.name,
      r.category,
      r.unit,
      r.recQty,
      r.outQty,
      r.expectedLeft,
      r.remaining,
      r.stockSaleVal,
      r.stockCostVal
    ])
    const csv = [header.map(esc).join(','), ...rows.map((r) => r.map(esc).join(','))].join('\n')
    const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `inventory-report-${instId}.csv`
    a.click()
    URL.revokeObjectURL(url)
    toast.success('Inventory report exported to Excel (CSV).')
  }

  return (
    <div className="space-y-4">
      <QuickHeader
        title="Inventory Reports"
        onBack={() => onRouteChange?.('inst-inventory')}
        onRouteChange={onRouteChange}
        onOpenQuickPayment={onOpenQuickPayment}
        onOpenSendSms={onOpenSendSms}
      />

      {/* 8 KPI Cards (2 rows of 4) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
        <div className="bg-white rounded-xl border border-slate-200 p-4 flex items-center gap-3.5 shadow-2xs">
          <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0">
            <Package className="w-4 h-4" />
          </div>
          <div>
            <p className="text-[11px] font-semibold text-slate-500">Products</p>
            <p className="text-lg font-extrabold text-slate-900 mt-0.5">{totals.productCount}</p>
            <p className="text-[10px] text-slate-400">{totals.runningLow} running low</p>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-4 flex items-center gap-3.5 shadow-2xs">
          <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
            <ArrowDown className="w-4 h-4" />
          </div>
          <div>
            <p className="text-[11px] font-semibold text-slate-500">Received (period)</p>
            <p className="text-lg font-extrabold text-emerald-600 mt-0.5">{totals.recQty}</p>
            <p className="text-[10px] text-slate-400">Value {fmtPkr(totals.recVal)}</p>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-4 flex items-center gap-3.5 shadow-2xs">
          <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
            <ArrowUp className="w-4 h-4" />
          </div>
          <div>
            <p className="text-[11px] font-semibold text-slate-500">Given out (period)</p>
            <p className="text-lg font-extrabold text-amber-600 mt-0.5">{totals.outQty}</p>
            <p className="text-[10px] text-slate-400">Amount {fmtPkr(totals.outVal)}</p>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-4 flex items-center gap-3.5 shadow-2xs">
          <div className="w-10 h-10 rounded-xl bg-sky-50 text-sky-600 flex items-center justify-center shrink-0">
            <Layers className="w-4 h-4" />
          </div>
          <div>
            <p className="text-[11px] font-semibold text-slate-500">Remaining stock</p>
            <p className="text-lg font-extrabold text-sky-600 mt-0.5">{totals.remaining}</p>
            <p className="text-[10px] text-slate-400">
              Sale {fmtPkr(totals.stockSaleVal)} · Cost {fmtPkr(totals.stockCostVal)}
            </p>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-4 flex items-center gap-3.5 shadow-2xs">
          <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
            <AlertTriangle className="w-4 h-4" />
          </div>
          <div>
            <p className="text-[11px] font-semibold text-slate-500">Running low</p>
            <p className="text-lg font-extrabold text-amber-600 mt-0.5">{totals.runningLow}</p>
            <p className="text-[10px] text-slate-400">Under 10 units left</p>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-4 flex items-center gap-3.5 shadow-2xs">
          <div className="w-10 h-10 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center shrink-0">
            <Receipt className="w-4 h-4" />
          </div>
          <div>
            <p className="text-[11px] font-semibold text-slate-500">Unpaid stock fees</p>
            <p className="text-lg font-extrabold text-rose-600 mt-0.5">{totals.unpaidCount}</p>
            <p className="text-[10px] text-slate-400">Due {fmtPkr(totals.unpaidDue)}</p>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-4 flex items-center gap-3.5 shadow-2xs">
          <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0">
            <DollarSign className="w-4 h-4" />
          </div>
          <div>
            <p className="text-[11px] font-semibold text-slate-500">Issued value (period)</p>
            <p className="text-lg font-extrabold text-indigo-700 mt-0.5">{fmtPkr(totals.outVal)}</p>
            <p className="text-[10px] text-slate-400">Charged to students</p>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-4 flex items-center gap-3.5 shadow-2xs">
          <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
            <TrendingUp className="w-4 h-4" />
          </div>
          <div>
            <p className="text-[11px] font-semibold text-slate-500">Store value (sale)</p>
            <p className="text-lg font-extrabold text-emerald-700 mt-0.5">
              {fmtPkr(totals.stockSaleVal)}
            </p>
            <p className="text-[10px] text-slate-400">At current sale prices</p>
          </div>
        </div>
      </div>

      {/* Filters Card */}
      <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-2xs space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2 text-sm font-semibold text-slate-800">
            <Filter className="w-4 h-4 text-sky-500" />
            <span>Filters</span>
          </div>

          <div className="flex flex-wrap items-center gap-1.5">
            <button
              type="button"
              onClick={() => onRouteChange?.('inst-inventory')}
              className="px-2.5 py-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-medium inline-flex items-center gap-1 cursor-pointer"
            >
              <Package className="w-3.5 h-3.5" />
              <span>Manage</span>
            </button>
            <button
              type="button"
              onClick={() => onRouteChange?.('inst-inventory-receive')}
              className="px-2.5 py-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-medium inline-flex items-center gap-1 cursor-pointer"
            >
              <ArrowDown className="w-3.5 h-3.5" />
              <span>Stock receive</span>
            </button>
            <button
              type="button"
              onClick={() => onRouteChange?.('inst-inventory-issue')}
              className="px-2.5 py-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-medium inline-flex items-center gap-1 cursor-pointer"
            >
              <UserPlus className="w-3.5 h-3.5" />
              <span>Issues</span>
            </button>
            <button
              type="button"
              onClick={() => onRouteChange?.('inst-inventory-categories')}
              className="px-2.5 py-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-medium inline-flex items-center gap-1 cursor-pointer"
            >
              <FolderOpen className="w-3.5 h-3.5" />
              <span>Categories</span>
            </button>
            <button
              type="button"
              onClick={handleExportPdf}
              className="px-2.5 py-1.5 rounded-lg border border-rose-300 bg-white hover:bg-rose-50 text-rose-600 text-xs font-semibold inline-flex items-center gap-1 cursor-pointer"
            >
              <FileText className="w-3.5 h-3.5" />
              <span>PDF</span>
            </button>
            <button
              type="button"
              onClick={handleExportExcel}
              className="px-2.5 py-1.5 rounded-lg border border-emerald-400 bg-white hover:bg-emerald-50 text-emerald-700 text-xs font-semibold inline-flex items-center gap-1 cursor-pointer"
            >
              <FileSpreadsheet className="w-3.5 h-3.5" />
              <span>Excel</span>
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-end">
          <div className="sm:col-span-3">
            <label className="block text-[11px] font-medium text-slate-600 mb-1">Start date</label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="w-full px-3 py-1.5 rounded-lg border border-slate-200 text-xs"
            />
          </div>
          <div className="sm:col-span-3">
            <label className="block text-[11px] font-medium text-slate-600 mb-1">End date</label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="w-full px-3 py-1.5 rounded-lg border border-slate-200 text-xs"
            />
          </div>
          <div className="sm:col-span-3">
            <label className="block text-[11px] font-medium text-slate-600 mb-1">Category</label>
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="w-full px-3 py-1.5 rounded-lg border border-slate-200 text-xs bg-white"
            >
              <option value="all">All categories</option>
              {categories.map((c) => (
                <option key={c.id} value={c.name}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>
          <div className="sm:col-span-3 flex items-center gap-2">
            <button
              type="button"
              onClick={() => setApplied({ start: startDate, end: endDate, category: categoryFilter })}
              className="px-4 py-1.5 rounded-lg bg-sky-500 hover:bg-sky-600 text-white text-xs font-semibold inline-flex items-center gap-1 cursor-pointer"
            >
              <Search className="w-3.5 h-3.5" />
              <span>Apply</span>
            </button>
            <button
              type="button"
              onClick={() => {
                setStartDate(defaultStart)
                setEndDate(defaultEnd)
                setCategoryFilter('all')
                setApplied({ start: defaultStart, end: defaultEnd, category: 'all' })
              }}
              className="px-3 py-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-600 text-xs font-semibold cursor-pointer"
            >
              Reset
            </button>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2 text-xs">
          <span className="text-slate-400">Quick:</span>
          {[
            { id: 'today', label: 'Today' },
            { id: 'this_month', label: 'This month' },
            { id: 'last_month', label: 'Last month' },
            { id: 'last_3_months', label: 'Last 3 months' },
            { id: 'this_year', label: 'This year' },
            { id: 'all_time', label: 'All time' }
          ].map((q) => (
            <button
              key={q.id}
              type="button"
              onClick={() => applyQuick(q.id)}
              className="px-2.5 py-1 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 font-medium cursor-pointer"
            >
              {q.label}
            </button>
          ))}
        </div>
      </div>

      {/* Reconciliation Warning Banner */}
      {totals.mismatchCount > 0 && (
        <div className="px-4 py-3 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-900 flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
          <span>
            <strong>Please check:</strong> For <strong>{totals.mismatchCount} product(s)</strong>,
            remaining stock does not match deliveries minus issues (up to end date). Open{' '}
            <button
              type="button"
              onClick={() => onRouteChange?.('inst-inventory')}
              className="text-sky-600 font-semibold hover:underline cursor-pointer"
            >
              Manage items
            </button>{' '}
            to correct quantities.
          </span>
        </div>
      )}

      {/* Inventory by product Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden">
        <div className="px-5 py-3.5 border-b border-slate-100 flex items-center gap-2 text-sm font-semibold text-slate-800">
          <List className="w-4 h-4 text-sky-500" />
          <span>Inventory by product</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-xs font-semibold text-slate-700">
                <th className="py-2.5 px-3 w-10">#</th>
                <th className="py-2.5 px-3">Product</th>
                <th className="py-2.5 px-3">Category</th>
                <th className="py-2.5 px-3">Unit</th>
                <th className="py-2.5 px-3 text-right">Received</th>
                <th className="py-2.5 px-3 text-right">Given out</th>
                <th className="py-2.5 px-3 text-right">Expected left</th>
                <th className="py-2.5 px-3 text-right">Remaining</th>
                <th className="py-2.5 px-3 text-right">Stock value</th>
                <th className="py-2.5 px-3 text-center">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs text-slate-700">
              {productRows.length === 0 ? (
                <tr>
                  <td colSpan={10} className="py-10 text-center text-slate-400">
                    No inventory products found.
                  </td>
                </tr>
              ) : (
                productRows.map((r, idx) => (
                  <tr
                    key={r.id}
                    className={r.mismatch ? 'bg-amber-50/40 hover:bg-amber-50/70' : 'hover:bg-slate-50/70'}
                  >
                    <td className="py-3 px-3 text-slate-500">{idx + 1}</td>
                    <td className="py-3 px-3">
                      <div className="font-semibold text-slate-900">{r.name}</div>
                      <div className="text-[10px] text-slate-400">
                        Sale {fmtPkr(r.salePrice)}
                        {Number(r.costPrice || 0) > 0 ? ` · Cost ${fmtPkr(r.costPrice)}` : ''}
                      </div>
                    </td>
                    <td className="py-3 px-3 text-slate-600">{r.category}</td>
                    <td className="py-3 px-3 text-slate-600">{r.unit}</td>
                    <td className="py-3 px-3 text-right">
                      <div className="font-semibold text-emerald-600">{r.recQty}</div>
                      <div className="text-[10px] text-slate-400">{fmtPkr(r.recVal)}</div>
                    </td>
                    <td className="py-3 px-3 text-right">
                      <div className="font-semibold text-rose-600">{r.outQty}</div>
                      <div className="text-[10px] text-slate-400">{fmtPkr(r.outVal)}</div>
                    </td>
                    <td className="py-3 px-3 text-right font-semibold text-slate-800">
                      {r.expectedLeft}
                    </td>
                    <td className="py-3 px-3 text-right font-bold text-sky-600">{r.remaining}</td>
                    <td className="py-3 px-3 text-right">
                      <div className="font-semibold text-slate-900">{fmtPkr(r.stockSaleVal)}</div>
                      <div className="text-[10px] text-slate-400">Cost {fmtPkr(r.stockCostVal)}</div>
                    </td>
                    <td className="py-3 px-3 text-center">
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          r.mismatch ? 'bg-orange-500 text-white' : 'bg-emerald-500 text-white'
                        }`}
                      >
                        {r.mismatch ? 'Check' : 'OK'}
                      </span>
                    </td>
                  </tr>
                ))
              )}
              {productRows.length > 0 && (
                <tr className="bg-slate-50 font-bold border-t border-slate-200">
                  <td colSpan={4} className="py-3 px-3 text-right text-slate-700">
                    Totals
                  </td>
                  <td className="py-3 px-3 text-right">
                    <div className="text-emerald-600">{totals.recQty}</div>
                    <div className="text-[10px] text-slate-500 font-normal">
                      {fmtPkr(totals.recVal)}
                    </div>
                  </td>
                  <td className="py-3 px-3 text-right">
                    <div className="text-rose-600">{totals.outQty}</div>
                    <div className="text-[10px] text-slate-500 font-normal">
                      {fmtPkr(totals.outVal)}
                    </div>
                  </td>
                  <td className="py-3 px-3 text-right">{totals.expectedLeft}</td>
                  <td className="py-3 px-3 text-right text-sky-600">{totals.remaining}</td>
                  <td className="py-3 px-3 text-right">
                    <div>{fmtPkr(totals.stockSaleVal)}</div>
                    <div className="text-[10px] text-slate-500 font-normal">
                      Cost {fmtPkr(totals.stockCostVal)}
                    </div>
                  </td>
                  <td />
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Unpaid stock fees Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden">
        <div className="px-5 py-3.5 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-2 text-sm font-semibold text-slate-800">
            <Receipt className="w-4 h-4 text-sky-500" />
            <span>Unpaid stock fees</span>
            <span className="text-xs font-normal text-slate-400">
              (charges created in selected dates)
            </span>
          </div>
          <span className="px-2.5 py-0.5 rounded bg-orange-500 text-white text-[11px] font-bold">
            {fmtPkr(totals.unpaidDue)} still due
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-xs font-semibold text-slate-700">
                <th className="py-2.5 px-4">Student</th>
                <th className="py-2.5 px-3">Reference</th>
                <th className="py-2.5 px-3">What for</th>
                <th className="py-2.5 px-3 text-right">Still owes (PKR)</th>
                <th className="py-2.5 px-3">Date added</th>
                <th className="py-2.5 px-4 text-center">Open fee page</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs text-slate-700">
              {unpaidIssues.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-slate-400">
                    No unpaid stock fees in this period.
                  </td>
                </tr>
              ) : (
                unpaidIssues.map((u) => (
                  <tr key={u.id} className="hover:bg-slate-50/70">
                    <td className="py-3 px-4 font-semibold text-slate-900">{u.studentName}</td>
                    <td className="py-3 px-3 font-mono text-rose-600 text-[11px]">{u.id}</td>
                    <td className="py-3 px-3 text-slate-700">
                      Stock Item: {u.itemName} (Qty: {u.quantity})
                    </td>
                    <td className="py-3 px-3 text-right font-bold text-rose-600">
                      {Number(u.amountDue || 0).toLocaleString()}
                    </td>
                    <td className="py-3 px-3 text-slate-600">{formatDisplayDate(u.date)}</td>
                    <td className="py-3 px-4 text-center">
                      <button
                        type="button"
                        onClick={() => onRouteChange?.('inst-inventory-issue')}
                        className="px-3 py-1 rounded border border-sky-400 text-sky-600 hover:bg-sky-50 text-[11px] font-semibold cursor-pointer"
                      >
                        Open fees
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

export default InventoryReportsView
