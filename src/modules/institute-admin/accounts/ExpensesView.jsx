import React, { useState, useMemo, useRef, useEffect } from 'react'
import {
  ArrowLeft,
  UserPlus,
  DollarSign,
  FileText,
  ArrowDown,
  MessageSquare,
  Download,
  ChevronDown,
  CheckCircle2,
  Hourglass,
  Calendar,
  List,
  Plus,
  Filter,
  Eye,
  Edit3,
  History,
  X,
  Menu,
  Trash2,
  CreditCard
} from 'lucide-react'
import { useToast } from '../../../context/ToastContext'
import { recordCampusLedgerTransaction } from './CampusAccountsView'

const SHORT_MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
const PAYMENT_METHODS = ['Cash', 'Bank Transfer', 'Online Transfer', 'Cheque', 'EasyPaisa', 'JazzCash']

const formatDisplayDate = (iso) => {
  if (!iso) return '—'
  const parts = String(iso).slice(0, 10).split('-')
  if (parts.length !== 3) return iso
  const [y, m, d] = parts
  return `${pad2(Number(d))} ${SHORT_MONTHS[Number(m) - 1] || m} ${y}`
}
const formatShortDayMonth = (iso) => {
  if (!iso) return ''
  const parts = String(iso).slice(0, 10).split('-')
  if (parts.length !== 3) return iso
  return `${pad2(Number(parts[2]))} ${SHORT_MONTHS[Number(parts[1]) - 1] || parts[1]}`
}
const pad2 = (n) => String(n).padStart(2, '0')
const formatPkr = (val) => `PKR ${Number(val || 0).toLocaleString()}`

const getPaidAmount = (exp) => {
  if (Array.isArray(exp.installments) && exp.installments.length > 0) {
    return exp.installments.reduce((s, inst) => s + Number(inst.amount || 0), 0)
  }
  return Number(exp.paidAmount || 0)
}

const getExpenseStatus = (exp) => {
  const bill = Number(exp.billAmount || 0)
  const paid = getPaidAmount(exp)
  if (bill > 0 && paid >= bill) return 'Paid'
  if (paid > 0 && paid < bill) return 'Partially Paid'
  return 'Unpaid'
}

export const ExpensesView = ({
  currentInstitute,
  onRouteChange,
  onOpenQuickPayment
}) => {
  const { toast } = useToast()
  const instId = currentInstitute?.id || 'inst-1'
  const storageKey = `sms_campus_expenses_${instId}`
  const expCatKey = `sms_campus_exp_categories_${instId}`

  const [expenses, setExpenses] = useState(() => {
    try {
      const saved = localStorage.getItem(storageKey)
      return saved ? JSON.parse(saved) : []
    } catch {
      return []
    }
  })

  const [categories, setCategories] = useState(() => {
    try {
      const saved = localStorage.getItem(expCatKey)
      if (saved) return JSON.parse(saved)
    } catch {}
    return [
      'Utility Bills',
      'Furniture Expense',
      'Staff Payroll',
      'Academic Supplies',
      'Transport Operations',
      'Library Acquisitions',
      'Campus Maintenance'
    ]
  })

  useEffect(() => {
    try {
      localStorage.setItem(storageKey, JSON.stringify(expenses))
    } catch {}
  }, [expenses, storageKey])

  // Top sub-tabs: All Expenses | + Create New Expense
  const [activeTab, setActiveTab] = useState('list') // 'list' | 'create'

  // Filter Bar Draft & Applied State
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('ALL')
  const [categoryFilter, setCategoryFilter] = useState('ALL')
  const [vendorFilter, setVendorFilter] = useState('ALL')
  const [methodFilter, setMethodFilter] = useState('ALL')
  const [dateFrom, setDateFrom] = useState('')
  const [dateTo, setDateTo] = useState('')

  const [applied, setApplied] = useState({
    searchTerm: '',
    statusFilter: 'ALL',
    categoryFilter: 'ALL',
    vendorFilter: 'ALL',
    methodFilter: 'ALL',
    dateFrom: '',
    dateTo: ''
  })

  const handleApplyFilters = () => {
    setApplied({
      searchTerm,
      statusFilter,
      categoryFilter,
      vendorFilter,
      methodFilter,
      dateFrom,
      dateTo
    })
  }

  const handleClearFilters = () => {
    setSearchTerm('')
    setStatusFilter('ALL')
    setCategoryFilter('ALL')
    setVendorFilter('ALL')
    setMethodFilter('ALL')
    setDateFrom('')
    setDateTo('')
    setApplied({
      searchTerm: '',
      statusFilter: 'ALL',
      categoryFilter: 'ALL',
      vendorFilter: 'ALL',
      methodFilter: 'ALL',
      dateFrom: '',
      dateTo: ''
    })
  }

  const allCategories = useMemo(() => {
    const set = new Set(categories)
    expenses.forEach((e) => {
      if (e.category) set.add(e.category)
    })
    return Array.from(set)
  }, [categories, expenses])

  const allVendors = useMemo(() => {
    const set = new Set()
    expenses.forEach((e) => {
      if (e.vendor && e.vendor.trim()) set.add(e.vendor.trim())
    })
    return Array.from(set)
  }, [expenses])

  const filteredExpenses = useMemo(() => {
    return expenses
      .filter((exp) => {
        if (applied.searchTerm.trim()) {
          const q = applied.searchTerm.trim().toLowerCase()
          const matchTitle = (exp.title || '').toLowerCase().includes(q)
          const matchVendor = (exp.vendor || '').toLowerCase().includes(q)
          const matchCat = (exp.category || '').toLowerCase().includes(q)
          if (!matchTitle && !matchVendor && !matchCat) return false
        }
        const st = getExpenseStatus(exp)
        if (applied.statusFilter !== 'ALL' && st !== applied.statusFilter) return false
        if (applied.categoryFilter !== 'ALL' && exp.category !== applied.categoryFilter) return false
        if (applied.vendorFilter !== 'ALL' && (exp.vendor || '').trim() !== applied.vendorFilter) return false
        if (applied.methodFilter !== 'ALL') {
          const hasMethod =
            exp.paymentMethod === applied.methodFilter ||
            (exp.installments || []).some((inst) => inst.method === applied.methodFilter)
          if (!hasMethod) return false
        }
        if (applied.dateFrom && (exp.expenseDate || '') < applied.dateFrom) return false
        if (applied.dateTo && (exp.expenseDate || '') > applied.dateTo) return false
        return true
      })
      .sort((a, b) => String(b.expenseDate || '').localeCompare(String(a.expenseDate || '')))
  }, [expenses, applied])

  // 4 Summary Metrics scoped to current view
  const stats = useMemo(() => {
    const now = new Date()
    const currentMonthPrefix = `${now.getFullYear()}-${pad2(now.getMonth() + 1)}`
    let totalBills = 0
    let totalPaid = 0
    let totalRemaining = 0
    let unpaidCount = 0
    let monthTotal = 0
    let monthCount = 0

    filteredExpenses.forEach((exp) => {
      const bill = Number(exp.billAmount || 0)
      const paid = Math.min(bill, getPaidAmount(exp))
      const rem = Math.max(0, bill - paid)
      totalBills += bill
      totalPaid += paid
      totalRemaining += rem
      if (rem > 0) unpaidCount += 1
      if (String(exp.expenseDate || '').startsWith(currentMonthPrefix)) {
        monthTotal += bill
        monthCount += 1
      }
    })

    const paidPct = totalBills > 0 ? Math.round((totalPaid / totalBills) * 100) : 0
    return {
      totalBills,
      count: filteredExpenses.length,
      totalPaid,
      paidPct,
      totalRemaining,
      unpaidCount,
      monthTotal,
      monthCount
    }
  }, [filteredExpenses])

  // Export menu
  const [exportOpen, setExportOpen] = useState(false)
  const exportRef = useRef(null)
  useEffect(() => {
    const fn = (e) => {
      if (exportRef.current && !exportRef.current.contains(e.target)) setExportOpen(false)
    }
    document.addEventListener('mousedown', fn)
    return () => document.removeEventListener('mousedown', fn)
  }, [])

  const handleExportCsv = () => {
    setExportOpen(false)
    if (filteredExpenses.length === 0) {
      toast('No expenses to export.', 'warning')
      return
    }
    const headers = ['S/N', 'Expense', 'Category', 'Vendor', 'Bill (PKR)', 'Paid (PKR)', 'Remaining (PKR)', 'Status', 'Payment Method', 'Date']
    const rows = filteredExpenses.map((e, i) => {
      const bill = Number(e.billAmount || 0)
      const paid = getPaidAmount(e)
      return [
        i + 1,
        `"${e.title || ''}"`,
        `"${e.category || ''}"`,
        `"${e.vendor || '—'}"`,
        bill,
        paid,
        Math.max(0, bill - paid),
        `"${getExpenseStatus(e)}"`,
        `"${e.paymentMethod || 'Cash'}"`,
        `"${e.expenseDate || ''}"`
      ]
    })
    const csv = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n')
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `expenses_${new Date().toISOString().slice(0, 10)}.csv`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
    toast(`Exported ${filteredExpenses.length} expense record(s).`, 'success')
  }

  // Row Actions Popover Menu (Pick 4 & Pick 5: View Details | Add Payment | Edit)
  const [openMenuId, setOpenMenuId] = useState(null)
  const menuContainerRef = useRef(null)
  useEffect(() => {
    const fn = (e) => {
      if (menuContainerRef.current && !menuContainerRef.current.contains(e.target)) {
        setOpenMenuId(null)
      }
    }
    document.addEventListener('mousedown', fn)
    return () => document.removeEventListener('mousedown', fn)
  }, [])

  // Modals: View Details | Add Payment | Edit Expense | Vendor History
  const [detailsExpense, setDetailsExpense] = useState(null)
  const [paymentExpense, setPaymentExpense] = useState(null)
  const [payAmount, setPayAmount] = useState('')
  const [payMethod, setPayMethod] = useState('Cash')
  const [payDate, setPayDate] = useState(() => new Date().toISOString().slice(0, 10))
  const [payNote, setPayNote] = useState('')

  const [editExpense, setEditExpense] = useState(null)
  const [editForm, setEditForm] = useState({
    title: '',
    category: '',
    vendor: '',
    billAmount: '',
    expenseDate: '',
    paymentMethod: 'Cash',
    notes: ''
  })

  const [vendorHistoryTarget, setVendorHistoryTarget] = useState(null)

  // Create New Expense Form State (+ Create New Expense tab)
  const [createForm, setCreateForm] = useState({
    title: '',
    category: allCategories[0] || 'Utility Bills',
    customCategory: '',
    vendor: '',
    billAmount: '',
    paidNow: '',
    paymentMethod: 'Cash',
    expenseDate: new Date().toISOString().slice(0, 10),
    notes: ''
  })

  const handleCreateExpense = (e) => {
    e.preventDefault()
    if (!createForm.title.trim()) {
      toast('Enter expense title.', 'warning')
      return
    }
    const bill = Math.max(0, Number(createForm.billAmount || 0))
    if (bill <= 0) {
      toast('Bill amount must be greater than zero.', 'warning')
      return
    }
    const chosenCat = createForm.customCategory.trim() || createForm.category
    if (createForm.customCategory.trim() && !categories.includes(createForm.customCategory.trim())) {
      const nextCats = [...categories, createForm.customCategory.trim()]
      setCategories(nextCats)
      try {
        localStorage.setItem(expCatKey, JSON.stringify(nextCats))
      } catch {}
    }

    const paid = Math.min(bill, Math.max(0, Number(createForm.paidNow || 0)))
    const installments = paid > 0
      ? [{
          id: `INST-${Date.now()}`,
          amount: paid,
          method: createForm.paymentMethod,
          date: createForm.expenseDate,
          note: createForm.notes.trim() || 'Initial payment',
          recordedBy: 'School Admin'
        }]
      : []

    const newExp = {
      id: `EXP-${Date.now()}`,
      title: createForm.title.trim(),
      category: chosenCat,
      vendor: createForm.vendor.trim(),
      billAmount: bill,
      paidAmount: paid,
      installments,
      paymentMethod: createForm.paymentMethod,
      expenseDate: createForm.expenseDate,
      lastPaidDate: paid > 0 ? createForm.expenseDate : null,
      notes: createForm.notes.trim(),
      createdBy: 'School Admin'
    }

    setExpenses((prev) => [newExp, ...prev])

    if (paid > 0) {
      recordCampusLedgerTransaction(instId, {
        id: `VCH-EXP-${Date.now()}`,
        date: createForm.expenseDate,
        description: `${newExp.title}${newExp.vendor ? ` (${newExp.vendor})` : ''}`,
        type: 'Expense',
        category: chosenCat,
        debit: paid,
        credit: 0,
        account: createForm.paymentMethod,
        status: 'Cleared',
        ref: newExp.id
      })
    }

    toast(`Expense "${newExp.title}" saved.`, 'success')
    setCreateForm({
      title: '',
      category: chosenCat,
      customCategory: '',
      vendor: '',
      billAmount: '',
      paidNow: '',
      paymentMethod: 'Cash',
      expenseDate: new Date().toISOString().slice(0, 10),
      notes: ''
    })
    setActiveTab('list')
  }

  const openPaymentModal = (exp) => {
    setOpenMenuId(null)
    const bill = Number(exp.billAmount || 0)
    const rem = Math.max(0, bill - getPaidAmount(exp))
    if (rem <= 0) {
      toast('This expense bill is already fully paid.', 'info')
      return
    }
    setPaymentExpense(exp)
    setPayAmount(String(rem))
    setPayMethod(exp.paymentMethod || 'Cash')
    setPayDate(new Date().toISOString().slice(0, 10))
    setPayNote('')
  }

  const handleSavePayment = (e) => {
    e.preventDefault()
    if (!paymentExpense) return
    const bill = Number(paymentExpense.billAmount || 0)
    const currentPaid = getPaidAmount(paymentExpense)
    const rem = Math.max(0, bill - currentPaid)
    const amt = Math.min(rem, Math.max(0, Number(payAmount || 0)))
    if (amt <= 0) {
      toast('Enter a valid payment amount greater than zero.', 'warning')
      return
    }

    const newInst = {
      id: `INST-${Date.now()}`,
      amount: amt,
      method: payMethod,
      date: payDate,
      note: payNote.trim() || 'Installment payment',
      recordedBy: 'School Admin'
    }

    setExpenses((prev) =>
      prev.map((item) => {
        if (item.id !== paymentExpense.id) return item
        const nextInst = [...(item.installments || []), newInst]
        return {
          ...item,
          installments: nextInst,
          paidAmount: currentPaid + amt,
          paymentMethod: payMethod,
          lastPaidDate: payDate
        }
      })
    )

    recordCampusLedgerTransaction(instId, {
      id: `VCH-EXP-PAY-${Date.now()}`,
      date: payDate,
      description: `Expense Payment: ${paymentExpense.title}${paymentExpense.vendor ? ` (${paymentExpense.vendor})` : ''}`,
      type: 'Expense',
      category: paymentExpense.category || 'Expense',
      debit: amt,
      credit: 0,
      account: payMethod,
      status: 'Cleared',
      ref: `${paymentExpense.id}-${Date.now()}`
    })

    toast(`Recorded ${formatPkr(amt)} payment for ${paymentExpense.title}.`, 'success')
    setPaymentExpense(null)
  }

  const openEditModal = (exp) => {
    setOpenMenuId(null)
    setEditExpense(exp)
    setEditForm({
      title: exp.title || '',
      category: exp.category || allCategories[0] || 'Utility Bills',
      vendor: exp.vendor || '',
      billAmount: String(exp.billAmount || 0),
      expenseDate: exp.expenseDate || new Date().toISOString().slice(0, 10),
      paymentMethod: exp.paymentMethod || 'Cash',
      notes: exp.notes || ''
    })
  }

  const handleSaveEdit = (e) => {
    e.preventDefault()
    if (!editExpense) return
    const nextBill = Math.max(0, Number(editForm.billAmount || 0))
    if (!editForm.title.trim() || nextBill <= 0) {
      toast('Enter a valid title and bill amount.', 'warning')
      return
    }
    setExpenses((prev) =>
      prev.map((item) =>
        item.id === editExpense.id
          ? {
              ...item,
              title: editForm.title.trim(),
              category: editForm.category,
              vendor: editForm.vendor.trim(),
              billAmount: nextBill,
              expenseDate: editForm.expenseDate,
              paymentMethod: editForm.paymentMethod,
              notes: editForm.notes.trim()
            }
          : item
      )
    )
    toast('Expense updated.', 'success')
    setEditExpense(null)
  }

  const handleDeleteExpense = (id) => {
    setExpenses((prev) => prev.filter((item) => item.id !== id))
    setEditExpense(null)
    setDetailsExpense(null)
    toast('Expense record removed.', 'info')
  }

  const vendorBills = useMemo(() => {
    if (!vendorHistoryTarget) return []
    return expenses.filter(
      (e) => (e.vendor || '').trim().toLowerCase() === vendorHistoryTarget.trim().toLowerCase()
    )
  }, [expenses, vendorHistoryTarget])

  return (
    <div className="space-y-4 pb-10 animate-fade-in">
      {/* Top Bar matching Picks 1 & 2 */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2 text-slate-900">
            <FileText className="w-5 h-5 text-slate-600" />
            <h1 className="text-lg font-bold tracking-tight">Expenses</h1>
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
            onClick={() => setActiveTab('create')}
            className="px-3.5 py-2 rounded-xl bg-indigo-50 border border-indigo-200 text-indigo-700 hover:bg-indigo-100 text-xs font-semibold flex items-center gap-1.5 shadow-2xs cursor-pointer transition-colors"
          >
            <ArrowDown className="w-3.5 h-3.5" />
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

      {/* 4 KPI Summary Cards (Picks 1 & 2) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
        <div className="bg-white rounded-xl border border-slate-200 p-4 flex items-center justify-between shadow-2xs relative">
          <div className="flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
              <ArrowDown className="w-4 h-4" />
            </div>
            <div>
              <p className="text-[11px] font-semibold text-slate-500">Total Expenses</p>
              <p className="text-lg font-extrabold text-rose-600 mt-0.5">{formatPkr(stats.totalBills)}</p>
              <p className="text-[10px] text-slate-400">All bills in this view</p>
            </div>
          </div>
          <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-600 text-[10px] font-bold self-start">
            {stats.count} records
          </span>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-4 flex items-center gap-3.5 shadow-2xs">
          <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
            <CheckCircle2 className="w-4 h-4" />
          </div>
          <div>
            <p className="text-[11px] font-semibold text-slate-500">Paid</p>
            <p className="text-lg font-extrabold text-emerald-600 mt-0.5">{formatPkr(stats.totalPaid)}</p>
            <p className="text-[10px] text-slate-400">{stats.paidPct}% of total</p>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-4 flex items-center gap-3.5 shadow-2xs">
          <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
            <Hourglass className="w-4 h-4" />
          </div>
          <div>
            <p className="text-[11px] font-semibold text-slate-500">Pending Payables</p>
            <p className="text-lg font-extrabold text-amber-600 mt-0.5">{formatPkr(stats.totalRemaining)}</p>
            <p className="text-[10px] text-slate-400">{stats.unpaidCount} unpaid bill{stats.unpaidCount === 1 ? '' : 's'}</p>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-4 flex items-center gap-3.5 shadow-2xs">
          <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0">
            <Calendar className="w-4 h-4" />
          </div>
          <div>
            <p className="text-[11px] font-semibold text-slate-500">This Month</p>
            <p className="text-lg font-extrabold text-indigo-900 mt-0.5">{formatPkr(stats.monthTotal)}</p>
            <p className="text-[10px] text-slate-400">{stats.monthCount} records</p>
          </div>
        </div>
      </div>

      {/* Main Expenses Panel */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-visible">
        <div className="px-5 py-3.5 flex items-center justify-between border-b border-slate-100">
          <div className="flex items-center gap-2 text-sm font-bold text-slate-800">
            <ArrowDown className="w-4 h-4 text-slate-500" />
            <span>Expenses</span>
          </div>

          <div className="relative" ref={exportRef}>
            <button
              type="button"
              onClick={() => setExportOpen((o) => !o)}
              className="px-3.5 py-1.5 rounded-lg bg-sky-500 hover:bg-sky-600 text-white text-xs font-bold inline-flex items-center gap-1.5 cursor-pointer transition-colors"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export</span>
              <ChevronDown className="w-3.5 h-3.5" />
            </button>
            {exportOpen && (
              <div className="absolute right-0 mt-1 w-44 rounded-lg bg-white border border-slate-200 shadow-lg py-1 z-30 text-xs">
                <button
                  type="button"
                  onClick={handleExportCsv}
                  className="w-full px-3.5 py-2 text-left hover:bg-slate-50 font-semibold text-slate-700 cursor-pointer"
                >
                  Export CSV Register
                </button>
                <button
                  type="button"
                  onClick={() => { setExportOpen(false); window.print() }}
                  className="w-full px-3.5 py-2 text-left hover:bg-slate-50 font-semibold text-slate-700 cursor-pointer"
                >
                  Print Expense Sheet
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Sub-Tabs: All Expenses | + Create New Expense */}
        <div className="flex items-center gap-2 px-5 pt-2 border-b border-slate-200 bg-slate-50/40">
          <button
            type="button"
            onClick={() => setActiveTab('list')}
            className={`px-3.5 py-2 text-xs font-bold inline-flex items-center gap-1.5 border-b-2 -mb-px cursor-pointer transition-colors ${
              activeTab === 'list'
                ? 'border-blue-600 text-blue-600 bg-white rounded-t-lg'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            <List className="w-3.5 h-3.5" />
            <span>All Expenses</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('create')}
            className={`px-3.5 py-2 text-xs font-bold inline-flex items-center gap-1.5 border-b-2 -mb-px cursor-pointer transition-colors ${
              activeTab === 'create'
                ? 'border-blue-600 text-blue-600 bg-white rounded-t-lg'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Create New Expense</span>
          </button>
        </div>

        {activeTab === 'list' ? (
          <div className="p-5 space-y-4">
            {/* Multi-Filter Bar matching Pick 1–3 */}
            <div className="flex flex-wrap items-end gap-2.5 bg-slate-50/60 p-3 rounded-xl border border-slate-100">
              <div className="min-w-[160px] flex-1">
                <label className="block text-[11px] font-semibold text-slate-600 mb-1">Search</label>
                <input
                  type="text"
                  placeholder="Expense name or vendor"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full px-3 py-1.5 rounded-lg border border-slate-200 bg-white text-xs text-slate-800"
                />
              </div>

              <div className="min-w-[125px]">
                <label className="block text-[11px] font-semibold text-slate-600 mb-1">Payment status</label>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 bg-white text-xs text-slate-700"
                >
                  <option value="ALL">All statuses</option>
                  <option value="Paid">Paid</option>
                  <option value="Partially Paid">Partially Paid</option>
                  <option value="Unpaid">Unpaid</option>
                </select>
              </div>

              <div className="min-w-[130px]">
                <label className="block text-[11px] font-semibold text-slate-600 mb-1">Category</label>
                <select
                  value={categoryFilter}
                  onChange={(e) => setCategoryFilter(e.target.value)}
                  className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 bg-white text-xs text-slate-700"
                >
                  <option value="ALL">All categories</option>
                  {allCategories.map((c) => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>

              <div className="min-w-[120px]">
                <label className="block text-[11px] font-semibold text-slate-600 mb-1">Vendor</label>
                <select
                  value={vendorFilter}
                  onChange={(e) => setVendorFilter(e.target.value)}
                  className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 bg-white text-xs text-slate-700"
                >
                  <option value="ALL">All vendors</option>
                  {allVendors.map((v) => <option key={v} value={v}>{v}</option>)}
                </select>
              </div>

              <div className="min-w-[120px]">
                <label className="block text-[11px] font-semibold text-slate-600 mb-1">Paid via</label>
                <select
                  value={methodFilter}
                  onChange={(e) => setMethodFilter(e.target.value)}
                  className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 bg-white text-xs text-slate-700"
                >
                  <option value="ALL">Any method</option>
                  {PAYMENT_METHODS.map((m) => <option key={m} value={m}>{m}</option>)}
                </select>
              </div>

              <div className="min-w-[130px]">
                <label className="block text-[11px] font-semibold text-slate-600 mb-1">Expense date from</label>
                <input
                  type="date"
                  value={dateFrom}
                  onChange={(e) => setDateFrom(e.target.value)}
                  className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 bg-white text-xs text-slate-700"
                />
              </div>

              <div className="min-w-[130px]">
                <label className="block text-[11px] font-semibold text-slate-600 mb-1">Expense date to</label>
                <input
                  type="date"
                  value={dateTo}
                  onChange={(e) => setDateTo(e.target.value)}
                  className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 bg-white text-xs text-slate-700"
                />
              </div>

              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={handleApplyFilters}
                  className="px-3.5 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold inline-flex items-center gap-1.5 cursor-pointer"
                >
                  <Filter className="w-3 h-3" />
                  <span>Filter</span>
                </button>
                <button
                  type="button"
                  onClick={handleClearFilters}
                  className="px-3 py-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-600 text-xs font-semibold cursor-pointer"
                >
                  Clear
                </button>
              </div>
            </div>

            {/* Table matching Picks 1–5 */}
            <div className="overflow-x-auto pb-16 -mb-16" ref={menuContainerRef}>
              <table className="w-full text-left text-xs min-w-[780px]">
                <thead className="bg-slate-50 border-y border-slate-200 text-slate-700 font-bold">
                  <tr>
                    <th className="py-2.5 px-3 w-12">S/N</th>
                    <th className="py-2.5 px-3">Expense</th>
                    <th className="py-2.5 px-3">Vendor</th>
                    <th className="py-2.5 px-3">Bill</th>
                    <th className="py-2.5 px-3">Paid</th>
                    <th className="py-2.5 px-3">Remaining</th>
                    <th className="py-2.5 px-3">Date</th>
                    <th className="py-2.5 px-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredExpenses.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="py-10 text-center text-slate-400">
                        No expense bills found. Click <button type="button" onClick={() => setActiveTab('create')} className="text-blue-600 font-bold hover:underline cursor-pointer">+ Create New Expense</button> to add one.
                      </td>
                    </tr>
                  ) : (
                    filteredExpenses.map((exp, idx) => {
                      const bill = Number(exp.billAmount || 0)
                      const paid = Math.min(bill, getPaidAmount(exp))
                      const rem = Math.max(0, bill - paid)
                      const st = getExpenseStatus(exp)
                      const instCount = (exp.installments || []).length

                      return (
                        <tr key={exp.id} className="hover:bg-slate-50/70 transition-colors">
                          <td className="py-3 px-3 text-slate-500 font-semibold">{idx + 1}</td>

                          <td className="py-3 px-3">
                            <div className="font-bold text-slate-900">{exp.title}</div>
                            {exp.category && (
                              <span className="inline-block mt-1 px-2 py-0.5 rounded bg-cyan-500 text-white text-[10px] font-bold">
                                {exp.category}
                              </span>
                            )}
                          </td>

                          <td className="py-3 px-3">
                            {exp.vendor ? (
                              <div>
                                <div className="font-bold text-slate-800">{exp.vendor}</div>
                                <button
                                  type="button"
                                  onClick={() => setVendorHistoryTarget(exp.vendor)}
                                  className="inline-flex items-center gap-1 text-[10px] font-bold text-blue-600 hover:underline mt-0.5 cursor-pointer"
                                >
                                  <History className="w-3 h-3" />
                                  <span>History</span>
                                </button>
                              </div>
                            ) : (
                              <span className="text-slate-400">—</span>
                            )}
                          </td>

                          <td className="py-3 px-3 font-extrabold text-rose-600">{formatPkr(bill)}</td>

                          <td className="py-3 px-3">
                            <div className="font-bold text-slate-800">{formatPkr(paid)}</div>
                            {instCount > 0 && (
                              <button
                                type="button"
                                onClick={() => setDetailsExpense(exp)}
                                className="inline-flex items-center gap-1 text-[10px] font-semibold text-blue-600 hover:underline mt-0.5 cursor-pointer"
                              >
                                <List className="w-3 h-3" />
                                <span>{instCount} installment{instCount === 1 ? '' : 's'}</span>
                              </button>
                            )}
                          </td>

                          <td className="py-3 px-3">
                            <div className={`font-extrabold ${rem > 0 ? 'text-rose-600' : 'text-emerald-600'}`}>
                              {formatPkr(rem)}
                            </div>
                            <span
                              className={`inline-block mt-0.5 px-2 py-0.5 rounded text-[10px] font-bold text-white ${
                                st === 'Paid'
                                  ? 'bg-emerald-500'
                                  : st === 'Partially Paid'
                                    ? 'bg-amber-500'
                                    : 'bg-rose-500'
                              }`}
                            >
                              {st}
                            </span>
                          </td>

                          <td className="py-3 px-3">
                            <div className="font-semibold text-slate-800">{formatDisplayDate(exp.expenseDate)}</div>
                            {exp.createdBy && (
                              <div className="text-[10px] text-slate-400">by {exp.createdBy}</div>
                            )}
                            {exp.lastPaidDate && (
                              <div className="text-[10px] font-semibold text-emerald-600">Paid {formatShortDayMonth(exp.lastPaidDate)}</div>
                            )}
                          </td>

                          <td className="py-3 px-3 text-right relative">
                            <button
                              type="button"
                              onClick={() => setOpenMenuId((cur) => (cur === exp.id ? null : exp.id))}
                              className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-600 inline-flex items-center gap-0.5 cursor-pointer"
                              title="Actions"
                            >
                              <Menu className="w-4 h-4" />
                              <ChevronDown className="w-3 h-3" />
                            </button>

                            {/* Floating Popover Action Menu matching Pick 5 */}
                            {openMenuId === exp.id && (
                              <div className="absolute right-3 top-10 w-44 rounded-xl bg-white border border-slate-200 shadow-xl py-1.5 z-40 text-left">
                                <button
                                  type="button"
                                  onClick={() => { setOpenMenuId(null); setDetailsExpense(exp) }}
                                  className="w-full px-3.5 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 flex items-center gap-2.5 cursor-pointer"
                                >
                                  <Eye className="w-3.5 h-3.5 text-sky-600" />
                                  <span>View Details</span>
                                </button>
                                <button
                                  type="button"
                                  onClick={() => openPaymentModal(exp)}
                                  className="w-full px-3.5 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 flex items-center gap-2.5 cursor-pointer"
                                >
                                  <Plus className="w-3.5 h-3.5 text-emerald-600" />
                                  <span>Add Payment</span>
                                </button>
                                <button
                                  type="button"
                                  onClick={() => openEditModal(exp)}
                                  className="w-full px-3.5 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 flex items-center gap-2.5 cursor-pointer"
                                >
                                  <Edit3 className="w-3.5 h-3.5 text-blue-600" />
                                  <span>Edit</span>
                                </button>
                              </div>
                            )}
                          </td>
                        </tr>
                      )
                    })
                  )}
                </tbody>
              </table>
            </div>

            <div className="text-[11px] text-slate-400 pt-2 border-t border-slate-100">
              Showing {filteredExpenses.length > 0 ? `1–${filteredExpenses.length}` : '0'} of {filteredExpenses.length}
            </div>
          </div>
        ) : (
          /* Tab 2: + Create New Expense Form */
          <form onSubmit={handleCreateExpense} className="p-6 max-w-3xl space-y-4 text-xs">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Expense Title / Description *</label>
                <input
                  type="text"
                  placeholder="e.g. Electricity Bill, Chairs Purchase"
                  value={createForm.title}
                  onChange={(e) => setCreateForm((p) => ({ ...p, title: e.target.value }))}
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 font-semibold"
                  required
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Vendor / Supplier (optional)</label>
                <input
                  type="text"
                  placeholder="e.g. WAPDA, Al-Noor Furniture"
                  value={createForm.vendor}
                  onChange={(e) => setCreateForm((p) => ({ ...p, vendor: e.target.value }))}
                  className="w-full px-3 py-2 rounded-lg border border-slate-200"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Category *</label>
                <select
                  value={createForm.category}
                  onChange={(e) => setCreateForm((p) => ({ ...p, category: e.target.value }))}
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 bg-white font-semibold"
                >
                  {allCategories.map((c) => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div>
                <label className="block font-bold text-slate-700 mb-1">Or New Category Name (optional)</label>
                <input
                  type="text"
                  placeholder="Adds automatically if filled"
                  value={createForm.customCategory}
                  onChange={(e) => setCreateForm((p) => ({ ...p, customCategory: e.target.value }))}
                  className="w-full px-3 py-2 rounded-lg border border-slate-200"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Total Bill (PKR) *</label>
                <input
                  type="number"
                  min="1"
                  value={createForm.billAmount}
                  onChange={(e) => setCreateForm((p) => ({ ...p, billAmount: e.target.value }))}
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 font-bold"
                  required
                />
              </div>
              <div>
                <label className="block font-bold text-slate-700 mb-1">Paid Now (PKR)</label>
                <input
                  type="number"
                  min="0"
                  placeholder="0 if unpaid"
                  value={createForm.paidNow}
                  onChange={(e) => setCreateForm((p) => ({ ...p, paidNow: e.target.value }))}
                  className="w-full px-3 py-2 rounded-lg border border-slate-200"
                />
              </div>
              <div>
                <label className="block font-bold text-slate-700 mb-1">Payment Method</label>
                <select
                  value={createForm.paymentMethod}
                  onChange={(e) => setCreateForm((p) => ({ ...p, paymentMethod: e.target.value }))}
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 bg-white"
                >
                  {PAYMENT_METHODS.map((m) => <option key={m} value={m}>{m}</option>)}
                </select>
              </div>
              <div>
                <label className="block font-bold text-slate-700 mb-1">Expense Date *</label>
                <input
                  type="date"
                  value={createForm.expenseDate}
                  onChange={(e) => setCreateForm((p) => ({ ...p, expenseDate: e.target.value }))}
                  className="w-full px-3 py-2 rounded-lg border border-slate-200"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Notes / Bill Reference (optional)</label>
              <input
                type="text"
                placeholder="Voucher no, invoice ref, or internal remarks..."
                value={createForm.notes}
                onChange={(e) => setCreateForm((p) => ({ ...p, notes: e.target.value }))}
                className="w-full px-3 py-2 rounded-lg border border-slate-200"
              />
            </div>

            <div className="flex items-center gap-2 pt-2">
              <button
                type="submit"
                className="px-5 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-bold cursor-pointer"
              >
                Save Expense Bill
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('list')}
                className="px-4 py-2 rounded-lg border border-slate-200 text-slate-600 font-semibold hover:bg-slate-50 cursor-pointer"
              >
                Cancel
              </button>
            </div>
          </form>
        )}
      </div>

      {/* Modal 1: View Details & Installment History */}
      {detailsExpense && (
        <div className="fixed inset-0 z-[100] bg-slate-900/50 backdrop-blur-[1px] flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden border border-slate-200">
            <div className="bg-slate-900 px-5 py-3.5 flex items-center justify-between text-white">
              <div className="flex items-center gap-2 text-sm font-bold">
                <Eye className="w-4 h-4 text-sky-400" />
                <span>Expense Details — {detailsExpense.title}</span>
              </div>
              <button type="button" onClick={() => setDetailsExpense(null)} className="text-white/75 hover:text-white cursor-pointer">
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="p-5 space-y-4 text-xs">
              <div className="grid grid-cols-3 gap-3 bg-slate-50 p-3.5 rounded-xl border border-slate-100">
                <div>
                  <p className="text-[10px] text-slate-400 uppercase font-bold">Total Bill</p>
                  <p className="text-sm font-extrabold text-rose-600">{formatPkr(detailsExpense.billAmount)}</p>
                </div>
                <div>
                  <p className="text-[10px] text-slate-400 uppercase font-bold">Paid</p>
                  <p className="text-sm font-extrabold text-emerald-600">{formatPkr(getPaidAmount(detailsExpense))}</p>
                </div>
                <div>
                  <p className="text-[10px] text-slate-400 uppercase font-bold">Remaining</p>
                  <p className="text-sm font-extrabold text-amber-600">
                    {formatPkr(Math.max(0, Number(detailsExpense.billAmount || 0) - getPaidAmount(detailsExpense)))}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div><span className="text-slate-400">Category:</span> <strong>{detailsExpense.category || '—'}</strong></div>
                <div><span className="text-slate-400">Vendor:</span> <strong>{detailsExpense.vendor || '—'}</strong></div>
                <div><span className="text-slate-400">Expense Date:</span> <strong>{formatDisplayDate(detailsExpense.expenseDate)}</strong></div>
                <div><span className="text-slate-400">Status:</span> <strong>{getExpenseStatus(detailsExpense)}</strong></div>
              </div>

              {detailsExpense.notes && (
                <div className="p-2.5 rounded-lg bg-slate-50 text-slate-600">
                  <strong>Notes:</strong> {detailsExpense.notes}
                </div>
              )}

              <div>
                <p className="font-bold text-slate-800 mb-2">Payment Installments ({(detailsExpense.installments || []).length})</p>
                {(detailsExpense.installments || []).length === 0 ? (
                  <p className="text-slate-400 py-2">No payment installments recorded yet.</p>
                ) : (
                  <div className="border border-slate-200 rounded-lg divide-y divide-slate-100 max-h-44 overflow-y-auto">
                    {(detailsExpense.installments || []).map((inst, i) => (
                      <div key={inst.id || i} className="px-3 py-2 flex items-center justify-between">
                        <div>
                          <div className="font-bold text-slate-800">{formatPkr(inst.amount)} · {inst.method}</div>
                          <div className="text-[10px] text-slate-400">{inst.note}</div>
                        </div>
                        <span className="text-[11px] font-semibold text-slate-500">{formatDisplayDate(inst.date)}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="flex justify-between items-center pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => handleDeleteExpense(detailsExpense.id)}
                  className="px-3 py-1.5 rounded-lg border border-rose-200 text-rose-600 hover:bg-rose-50 font-semibold inline-flex items-center gap-1 cursor-pointer"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Delete</span>
                </button>
                <div className="flex gap-2">
                  {Math.max(0, Number(detailsExpense.billAmount || 0) - getPaidAmount(detailsExpense)) > 0 && (
                    <button
                      type="button"
                      onClick={() => {
                        const target = detailsExpense
                        setDetailsExpense(null)
                        openPaymentModal(target)
                      }}
                      className="px-4 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold cursor-pointer"
                    >
                      + Add Payment
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => setDetailsExpense(null)}
                    className="px-4 py-1.5 rounded-lg bg-slate-800 text-white font-semibold cursor-pointer"
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal 2: Add Expense Payment */}
      {paymentExpense && (
        <div className="fixed inset-0 z-[100] bg-slate-900/50 backdrop-blur-[1px] flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden border border-slate-200">
            <div className="bg-emerald-600 px-5 py-3.5 flex items-center justify-between text-white">
              <div className="flex items-center gap-2 text-sm font-bold">
                <CreditCard className="w-4 h-4" />
                <span>Add Payment — {paymentExpense.title}</span>
              </div>
              <button type="button" onClick={() => setPaymentExpense(null)} className="text-white/80 hover:text-white cursor-pointer">
                <X className="w-4 h-4" />
              </button>
            </div>
            <form onSubmit={handleSavePayment} className="p-5 space-y-3 text-xs">
              <div className="p-3 rounded-lg bg-slate-50 border border-slate-200 flex items-center justify-between">
                <span className="text-slate-600 font-semibold">Remaining Payable</span>
                <span className="text-rose-600 font-extrabold text-sm">
                  {formatPkr(Math.max(0, Number(paymentExpense.billAmount || 0) - getPaidAmount(paymentExpense)))}
                </span>
              </div>
              <div>
                <label className="block font-bold text-slate-700 mb-1">Payment Amount (PKR) *</label>
                <input
                  type="number"
                  min="1"
                  max={Math.max(1, Number(paymentExpense.billAmount || 0) - getPaidAmount(paymentExpense))}
                  value={payAmount}
                  onChange={(e) => setPayAmount(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 font-bold"
                  required
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Paid via *</label>
                  <select
                    value={payMethod}
                    onChange={(e) => setPayMethod(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 bg-white font-semibold"
                  >
                    {PAYMENT_METHODS.map((m) => <option key={m} value={m}>{m}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Payment Date *</label>
                  <input
                    type="date"
                    value={payDate}
                    onChange={(e) => setPayDate(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-slate-200"
                    required
                  />
                </div>
              </div>
              <div>
                <label className="block font-bold text-slate-700 mb-1">Note / Reference</label>
                <input
                  type="text"
                  placeholder="Cheque # / transfer ref / remarks"
                  value={payNote}
                  onChange={(e) => setPayNote(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-200"
                />
              </div>
              <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
                <button type="button" onClick={() => setPaymentExpense(null)} className="px-4 py-2 rounded-lg border border-slate-200 text-slate-600 font-semibold cursor-pointer">Cancel</button>
                <button type="submit" className="px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold cursor-pointer">Save Payment</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal 3: Edit Expense */}
      {editExpense && (
        <div className="fixed inset-0 z-[100] bg-slate-900/50 backdrop-blur-[1px] flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden border border-slate-200">
            <div className="bg-blue-600 px-5 py-3.5 flex items-center justify-between text-white">
              <div className="flex items-center gap-2 text-sm font-bold">
                <Edit3 className="w-4 h-4" />
                <span>Edit Expense</span>
              </div>
              <button type="button" onClick={() => setEditExpense(null)} className="text-white/80 hover:text-white cursor-pointer">
                <X className="w-4 h-4" />
              </button>
            </div>
            <form onSubmit={handleSaveEdit} className="p-5 space-y-3 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Expense Title *</label>
                <input
                  type="text"
                  value={editForm.title}
                  onChange={(e) => setEditForm((p) => ({ ...p, title: e.target.value }))}
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 font-semibold"
                  required
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Category</label>
                  <select
                    value={editForm.category}
                    onChange={(e) => setEditForm((p) => ({ ...p, category: e.target.value }))}
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 bg-white"
                  >
                    {allCategories.map((c) => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Vendor</label>
                  <input
                    type="text"
                    value={editForm.vendor}
                    onChange={(e) => setEditForm((p) => ({ ...p, vendor: e.target.value }))}
                    className="w-full px-3 py-2 rounded-lg border border-slate-200"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Bill Amount (PKR) *</label>
                  <input
                    type="number"
                    min="1"
                    value={editForm.billAmount}
                    onChange={(e) => setEditForm((p) => ({ ...p, billAmount: e.target.value }))}
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 font-bold"
                    required
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Expense Date *</label>
                  <input
                    type="date"
                    value={editForm.expenseDate}
                    onChange={(e) => setEditForm((p) => ({ ...p, expenseDate: e.target.value }))}
                    className="w-full px-3 py-2 rounded-lg border border-slate-200"
                    required
                  />
                </div>
              </div>
              <div>
                <label className="block font-bold text-slate-700 mb-1">Notes</label>
                <input
                  type="text"
                  value={editForm.notes}
                  onChange={(e) => setEditForm((p) => ({ ...p, notes: e.target.value }))}
                  className="w-full px-3 py-2 rounded-lg border border-slate-200"
                />
              </div>
              <div className="flex items-center justify-between pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => handleDeleteExpense(editExpense.id)}
                  className="px-3 py-2 rounded-lg border border-rose-200 text-rose-600 hover:bg-rose-50 font-semibold cursor-pointer"
                >
                  Delete
                </button>
                <div className="flex gap-2">
                  <button type="button" onClick={() => setEditExpense(null)} className="px-4 py-2 rounded-lg border border-slate-200 text-slate-600 font-semibold cursor-pointer">Cancel</button>
                  <button type="submit" className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-bold cursor-pointer">Save Changes</button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal 4: Vendor History */}
      {vendorHistoryTarget && (
        <div className="fixed inset-0 z-[100] bg-slate-900/50 backdrop-blur-[1px] flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden border border-slate-200">
            <div className="bg-indigo-600 px-5 py-3.5 flex items-center justify-between text-white">
              <div className="flex items-center gap-2 text-sm font-bold">
                <History className="w-4 h-4" />
                <span>Vendor Ledger — {vendorHistoryTarget}</span>
              </div>
              <button type="button" onClick={() => setVendorHistoryTarget(null)} className="text-white/80 hover:text-white cursor-pointer">
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="p-5 space-y-3 text-xs">
              <div className="max-h-64 overflow-y-auto divide-y divide-slate-100 border border-slate-200 rounded-xl">
                {vendorBills.map((b) => {
                  const paid = getPaidAmount(b)
                  const rem = Math.max(0, Number(b.billAmount || 0) - paid)
                  return (
                    <div key={b.id} className="px-3.5 py-2.5 flex items-center justify-between">
                      <div>
                        <div className="font-bold text-slate-900">{b.title}</div>
                        <div className="text-[10px] text-slate-400">{b.category} · {formatDisplayDate(b.expenseDate)}</div>
                      </div>
                      <div className="text-right">
                        <div className="font-bold text-slate-800">{formatPkr(b.billAmount)}</div>
                        <div className={`text-[10px] font-bold ${rem > 0 ? 'text-rose-600' : 'text-emerald-600'}`}>
                          {rem > 0 ? `Due: ${formatPkr(rem)}` : 'Paid'}
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
              <div className="flex justify-end">
                <button type="button" onClick={() => setVendorHistoryTarget(null)} className="px-4 py-1.5 rounded-lg bg-slate-800 text-white font-semibold cursor-pointer">Close</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default ExpensesView
