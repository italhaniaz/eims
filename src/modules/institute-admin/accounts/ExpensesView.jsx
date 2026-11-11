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
  CreditCard,
  FileSpreadsheet,
  Table,
  Send,
  Printer
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
  onOpenQuickPayment,
  onOpenSendSms
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
    toast(`Exported ${filteredExpenses.length} expense record(s) as CSV.`, 'success')
  }

  const handleExportExcel = () => {
    setExportOpen(false)
    if (filteredExpenses.length === 0) {
      toast('No expenses to export.', 'warning')
      return
    }
    const rowsHtml = filteredExpenses
      .map((e, i) => {
        const bill = Number(e.billAmount || 0)
        const paid = getPaidAmount(e)
        const rem = Math.max(0, bill - paid)
        return `<tr>
          <td>${i + 1}</td>
          <td>${String(e.title || '').replace(/</g, '&lt;')}</td>
          <td>${String(e.category || '').replace(/</g, '&lt;')}</td>
          <td>${String(e.vendor || '—').replace(/</g, '&lt;')}</td>
          <td>${bill}</td>
          <td>${paid}</td>
          <td>${rem}</td>
          <td>${getExpenseStatus(e)}</td>
          <td>${String(e.paymentMethod || 'Cash')}</td>
          <td>${String(e.expenseDate || '')}</td>
        </tr>`
      })
      .join('')
    const tableHtml = `<html><head><meta charset="utf-8" /></head><body>
      <table border="1">
        <thead><tr>
          <th>S/N</th><th>Expense</th><th>Category</th><th>Vendor</th><th>Bill (PKR)</th>
          <th>Paid (PKR)</th><th>Remaining (PKR)</th><th>Status</th><th>Method</th><th>Date</th>
        </tr></thead>
        <tbody>${rowsHtml}</tbody>
      </table></body></html>`
    const blob = new Blob([tableHtml], { type: 'application/vnd.ms-excel;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `expenses_${new Date().toISOString().slice(0, 10)}.xls`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
    toast(`Exported ${filteredExpenses.length} expense record(s) to Excel.`, 'success')
  }

  const handleExportPdf = () => {
    setExportOpen(false)
    if (filteredExpenses.length === 0) {
      toast('No expenses to export.', 'warning')
      return
    }
    const rowsHtml = filteredExpenses
      .map((e, i) => {
        const bill = Number(e.billAmount || 0)
        const paid = getPaidAmount(e)
        const rem = Math.max(0, bill - paid)
        return `<tr>
          <td>${i + 1}</td>
          <td><strong>${String(e.title || '').replace(/</g, '&lt;')}</strong><br/><small>${String(e.category || '').replace(/</g, '&lt;')}</small></td>
          <td>${String(e.vendor || '—').replace(/</g, '&lt;')}</td>
          <td>PKR ${bill.toLocaleString()}</td>
          <td>PKR ${paid.toLocaleString()}</td>
          <td>PKR ${rem.toLocaleString()}</td>
          <td>${getExpenseStatus(e)}</td>
          <td>${formatDisplayDate(e.expenseDate)}</td>
        </tr>`
      })
      .join('')
    const win = window.open('', '_blank', 'width=960,height=720')
    if (!win) {
      window.print()
      return
    }
    win.document.write(`<!doctype html><html><head><title>Expenses Report</title>
      <style>
        body { font-family: Arial, sans-serif; padding: 24px; color: #0f172a; }
        h2 { margin: 0 0 4px; }
        p { margin: 0 0 16px; color: #64748b; font-size: 12px; }
        table { width: 100%; border-collapse: collapse; font-size: 12px; }
        th, td { border: 1px solid #cbd5e1; padding: 8px 10px; text-align: left; }
        th { background: #f8fafc; font-weight: 700; }
      </style></head><body>
      <h2>${String(currentInstitute?.name || 'School')} — Expenses Report</h2>
      <p>Generated on ${new Date().toLocaleDateString()} · ${filteredExpenses.length} record(s) · Total: PKR ${stats.totalBills.toLocaleString()}</p>
      <table><thead><tr>
        <th>S/N</th><th>Expense</th><th>Vendor</th><th>Bill</th><th>Paid</th><th>Remaining</th><th>Status</th><th>Date</th>
      </tr></thead><tbody>${rowsHtml}</tbody></table>
      <script>window.onload = function(){ window.print(); };</script>
      </body></html>`)
    win.document.close()
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

  // Detail Page & Modals: View Details | Add Payment | Edit Expense | Vendor History | Receipt Preview
  const [detailsExpenseId, setDetailsExpenseId] = useState(null)
  const detailsExpense = useMemo(
    () => expenses.find((e) => e.id === detailsExpenseId) || null,
    [expenses, detailsExpenseId]
  )
  const [receiptExpense, setReceiptExpense] = useState(null)
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

  const vendorsStorageKey = `sms_campus_vendors_${instId}`
  const [savedVendors, setSavedVendors] = useState(() => {
    try {
      const raw = localStorage.getItem(`sms_campus_vendors_${instId}`)
      return raw ? JSON.parse(raw) : {}
    } catch {
      return {}
    }
  })

  // Create New Expense Form State (+ Create New Expense tab - Picks 2 & 3)
  const [createForm, setCreateForm] = useState({
    title: '',
    category: '',
    paymentMethod: 'Cash',
    billAmount: '',
    paidNow: '',
    expenseDate: new Date().toISOString().slice(0, 10),
    vendor: '',
    vendorPhone: '',
    vendorEmail: '',
    vendorAddress: '',
    notes: ''
  })

  const handleVendorInputChange = (val) => {
    const matchedKey = Object.keys(savedVendors).find(
      (k) => k.toLowerCase() === val.trim().toLowerCase()
    )
    const profile = matchedKey ? savedVendors[matchedKey] : null
    setCreateForm((p) => ({
      ...p,
      vendor: val,
      vendorPhone: profile?.phone ?? p.vendorPhone,
      vendorEmail: profile?.email ?? p.vendorEmail,
      vendorAddress: profile?.address ?? p.vendorAddress
    }))
  }

  const handleCreateExpense = (e) => {
    e.preventDefault()
    if (!createForm.title.trim()) {
      toast('Enter expense name.', 'warning')
      return
    }
    if (!createForm.category) {
      toast('Select Expense Type.', 'warning')
      return
    }
    const bill = Math.max(0, Number(createForm.billAmount || 0))
    if (bill <= 0) {
      toast('Total Amount (PKR) must be greater than zero.', 'warning')
      return
    }

    // Rule per Pick 2 helper: "Leave blank or equal to total for Paid. Enter 0 for Pending."
    const hasExplicitPaidNow = String(createForm.paidNow).trim() !== ''
    const paid = hasExplicitPaidNow
      ? Math.min(bill, Math.max(0, Number(createForm.paidNow || 0)))
      : bill

    const vendorName = createForm.vendor.trim()
    if (vendorName) {
      const nextVendors = {
        ...savedVendors,
        [vendorName]: {
          phone: createForm.vendorPhone.trim(),
          email: createForm.vendorEmail.trim(),
          address: createForm.vendorAddress.trim()
        }
      }
      setSavedVendors(nextVendors)
      try {
        localStorage.setItem(vendorsStorageKey, JSON.stringify(nextVendors))
      } catch {}
    }

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
      category: createForm.category,
      vendor: vendorName,
      vendorPhone: createForm.vendorPhone.trim(),
      vendorEmail: createForm.vendorEmail.trim(),
      vendorAddress: createForm.vendorAddress.trim(),
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
        category: createForm.category,
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
      category: '',
      paymentMethod: 'Cash',
      billAmount: '',
      paidNow: '',
      expenseDate: new Date().toISOString().slice(0, 10),
      vendor: '',
      vendorPhone: '',
      vendorEmail: '',
      vendorAddress: '',
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
    const vName = exp.vendor || ''
    const vProfile = vName ? savedVendors[vName] : null
    setEditExpense(exp)
    setEditForm({
      title: exp.title || '',
      category: exp.category || allCategories[0] || 'Utility Bills',
      vendor: vName,
      vendorPhone: exp.vendorPhone ?? vProfile?.phone ?? '',
      vendorEmail: exp.vendorEmail ?? vProfile?.email ?? '',
      vendorAddress: exp.vendorAddress ?? vProfile?.address ?? '',
      billAmount: String(exp.billAmount || 0),
      expenseDate: exp.expenseDate || new Date().toISOString().slice(0, 10),
      paymentMethod: exp.paymentMethod || 'Cash',
      notes: exp.notes || ''
    })
  }

  const handleEditVendorChange = (val) => {
    const matchedKey = Object.keys(savedVendors).find(
      (k) => k.toLowerCase() === val.trim().toLowerCase()
    )
    const profile = matchedKey ? savedVendors[matchedKey] : null
    setEditForm((p) => ({
      ...p,
      vendor: val,
      vendorPhone: profile?.phone ?? p.vendorPhone,
      vendorEmail: profile?.email ?? p.vendorEmail,
      vendorAddress: profile?.address ?? p.vendorAddress
    }))
  }

  const handleSaveEdit = (e) => {
    e.preventDefault()
    if (!editExpense) return
    const nextBill = Math.max(0, Number(editForm.billAmount || 0))
    if (!editForm.title.trim() || nextBill <= 0) {
      toast('Enter a valid title and bill amount.', 'warning')
      return
    }
    const vendorName = editForm.vendor.trim()
    if (vendorName) {
      const nextVendors = {
        ...savedVendors,
        [vendorName]: {
          phone: (editForm.vendorPhone || '').trim(),
          email: (editForm.vendorEmail || '').trim(),
          address: (editForm.vendorAddress || '').trim()
        }
      }
      setSavedVendors(nextVendors)
      try {
        localStorage.setItem(vendorsStorageKey, JSON.stringify(nextVendors))
      } catch {}
    }

    setExpenses((prev) =>
      prev.map((item) =>
        item.id === editExpense.id
          ? {
              ...item,
              title: editForm.title.trim(),
              category: editForm.category,
              vendor: vendorName,
              vendorPhone: (editForm.vendorPhone || '').trim(),
              vendorEmail: (editForm.vendorEmail || '').trim(),
              vendorAddress: (editForm.vendorAddress || '').trim(),
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
    setDetailsExpenseId(null)
    toast('Expense record removed.', 'info')
  }

  const getReceiptCode = (exp) => {
    if (!exp) return 'EXP-000001'
    if (exp.receiptNo) return exp.receiptNo
    const num = String(exp.id || '').replace(/[^0-9]/g, '').slice(-6) || '000001'
    return `EXP-${num.padStart(6, '0')}`
  }

  const buildReceiptDocumentHtml = (exp) => {
    const instName = String(currentInstitute?.name || 'School Portal').replace(/</g, '&lt;')
    const instPhone = String(currentInstitute?.phone || 'N/A').replace(/</g, '&lt;')
    const bill = Number(exp.billAmount || 0)
    const paid = Math.min(bill, getPaidAmount(exp))
    const rem = Math.max(0, bill - paid)
    const receiptCode = getReceiptCode(exp)
    const yr = new Date().getFullYear()
    const acadYear = `${yr - 1}-${yr}`
    return `<!doctype html><html><head><meta charset="utf-8" /><title>Expense Receipt - ${receiptCode}</title>
      <style>
        body { font-family: Arial, Helvetica, sans-serif; color: #1e293b; padding: 32px; max-width: 720px; margin: 0 auto; }
        .top { text-align: center; border-bottom: 2px solid #dc2626; padding-bottom: 14px; margin-bottom: 18px; }
        .inst { color: #dc2626; font-size: 20px; font-weight: 800; letter-spacing: 0.5px; text-transform: uppercase; margin: 0; }
        .phone { font-size: 11px; color: #475569; margin-top: 4px; }
        .title { text-align: center; color: #dc2626; font-size: 18px; font-weight: 800; letter-spacing: 1px; margin: 14px 0 18px; }
        .meta { background: #f8fafc; border-left: 4px solid #dc2626; padding: 12px 16px; margin-bottom: 18px; font-size: 12px; }
        .meta-row { margin-bottom: 8px; }
        .meta-label { font-size: 10px; font-weight: 700; color: #64748b; text-transform: uppercase; }
        .meta-val { font-size: 13px; font-weight: 800; color: #dc2626; }
        table { width: 100%; border-collapse: collapse; font-size: 12px; margin-bottom: 18px; }
        th, td { border: 1px solid #cbd5e1; padding: 9px 12px; text-align: left; }
        th { background: #f8fafc; width: 32%; font-weight: 700; color: #334155; }
        .total-box { background: #fef2f2; border-left: 4px solid #dc2626; padding: 12px 16px; font-size: 14px; font-weight: 800; margin-bottom: 36px; }
        .total-amt { color: #dc2626; }
        .sig { margin-top: 32px; border-top: 1px solid #334155; width: 240px; padding-top: 6px; text-align: center; font-size: 11px; font-weight: 600; color: #334155; }
        .footer { background: #f8fafc; padding: 10px; text-align: center; font-size: 10px; color: #64748b; margin-top: 28px; }
      </style></head><body>
      <div class="top">
        <p class="inst">${instName}</p>
        <p class="phone">Phone: ${instPhone}</p>
      </div>
      <div class="title">EXPENSE RECEIPT</div>
      <div class="meta">
        <div class="meta-row"><div class="meta-label">Receipt ID</div><div class="meta-val">${receiptCode}</div></div>
        <div class="meta-row"><div class="meta-label">Expense Date</div><div class="meta-val">${formatDisplayDate(exp.expenseDate)}</div></div>
        <div><div class="meta-label">Created Date</div><div class="meta-val">${formatDisplayDate(exp.expenseDate)}</div></div>
      </div>
      <table>
        <tr><th>Expense Name</th><td><strong>${String(exp.title || '').replace(/</g, '&lt;')}</strong></td></tr>
        <tr><th>Expense Type</th><td>${String(exp.category || 'General').replace(/</g, '&lt;')}</td></tr>
        <tr><th>Payment Method</th><td>${String(exp.paymentMethod || 'Cash').replace(/</g, '&lt;')}</td></tr>
        <tr><th>Vendor</th><td>${String(exp.vendor || '—').replace(/</g, '&lt;')}</td></tr>
        <tr><th>Academic Year</th><td>${acadYear}</td></tr>
        <tr><th>Description</th><td>${String(exp.notes || '—').replace(/</g, '&lt;')}</td></tr>
      </table>
      <div class="total-box">
        Total Expense Amount: <span class="total-amt">PKR ${bill.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
        ${rem > 0 ? `<div style="font-size:11px;font-weight:600;color:#475569;margin-top:4px;">Paid: PKR ${paid.toLocaleString()} · Remaining: PKR ${rem.toLocaleString()}</div>` : ''}
      </div>
      <div class="sig">Authorized Signature</div>
      <div class="sig">Accountant Signature</div>
      <div class="footer">
        <strong style="color:#dc2626;">Note:</strong> This is a computer-generated receipt. No signature is required for digital receipts.<br/>
        Generated on ${new Date().toLocaleString()} | Powered by ${instName}
      </div>
      </body></html>`
  }

  const handleDownloadReceiptFile = (exp) => {
    const html = buildReceiptDocumentHtml(exp)
    const blob = new Blob([html], { type: 'text/html;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `expense_receipt_${getReceiptCode(exp)}.html`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
    toast(`Downloaded receipt ${getReceiptCode(exp)}.`, 'success')
  }

  const handlePrintReceiptPdf = (exp) => {
    const html = buildReceiptDocumentHtml(exp)
    const win = window.open('', '_blank', 'width=820,height=780')
    if (!win) {
      window.print()
      return
    }
    win.document.write(html.replace('</body>', '<script>window.onload=function(){window.print();};</script></body>'))
    win.document.close()
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
            <h1 className="text-lg font-bold tracking-tight">
              {editExpense
                ? `Edit Expense - ${editExpense.title}`
                : detailsExpense
                  ? `Expense Details - ${detailsExpense.title}`
                  : 'Expenses'}
            </h1>
          </div>
          <button
            type="button"
            onClick={() => {
              if (editExpense) setEditExpense(null)
              else if (detailsExpense) setDetailsExpenseId(null)
              else onRouteChange?.('inst-dashboard')
            }}
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
            onClick={() => { setEditExpense(null); setDetailsExpenseId(null); setActiveTab('create') }}
            className="px-3.5 py-2 rounded-xl bg-indigo-50 border border-indigo-200 text-indigo-700 hover:bg-indigo-100 text-xs font-semibold flex items-center gap-1.5 shadow-2xs cursor-pointer transition-colors"
          >
            <ArrowDown className="w-3.5 h-3.5" />
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

      {editExpense ? (
        /* Full-Page Edit Expense View matching Picks 2, 3 & 4 */
        <div className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-100 flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2 text-sm font-bold text-slate-800">
              <Edit3 className="w-4 h-4 text-slate-600" />
              <span>Edit Expense</span>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => {
                  setEditExpense(null)
                  setDetailsExpenseId(null)
                  setActiveTab('list')
                }}
                className="px-3.5 py-1.5 rounded-lg bg-slate-600 hover:bg-slate-700 text-white text-xs font-bold inline-flex items-center gap-1.5 cursor-pointer transition-colors"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Back to List</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  const id = editExpense.id
                  setEditExpense(null)
                  setDetailsExpenseId(id)
                }}
                className="px-3.5 py-1.5 rounded-lg bg-cyan-600 hover:bg-cyan-700 text-white text-xs font-bold inline-flex items-center gap-1.5 cursor-pointer transition-colors"
              >
                <Eye className="w-3.5 h-3.5" />
                <span>View Details</span>
              </button>
            </div>
          </div>

          <form onSubmit={handleSaveEdit} className="p-6 max-w-4xl space-y-4 text-xs">
            <div className="grid grid-cols-1 sm:grid-cols-12 gap-2 sm:items-center">
              <label className="sm:col-span-3 font-semibold text-slate-800">
                Name <span className="text-rose-500">*</span>
              </label>
              <div className="sm:col-span-9">
                <input
                  type="text"
                  value={editForm.title}
                  onChange={(e) => setEditForm((p) => ({ ...p, title: e.target.value }))}
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 text-slate-800 font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-12 gap-2 sm:items-center">
              <label className="sm:col-span-3 font-semibold text-slate-800">
                Expense Type <span className="text-rose-500">*</span>
              </label>
              <div className="sm:col-span-9">
                <select
                  value={editForm.category}
                  onChange={(e) => setEditForm((p) => ({ ...p, category: e.target.value }))}
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 bg-white text-slate-800 font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                  required
                >
                  <option value="">Select Expense Type</option>
                  {allCategories.map((c) => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-12 gap-2 sm:items-start">
              <label className="sm:col-span-3 font-semibold text-slate-800 sm:pt-2">
                Total Amount (PKR) <span className="text-rose-500">*</span>
              </label>
              <div className="sm:col-span-9">
                <input
                  type="number"
                  min="1"
                  value={editForm.billAmount}
                  onChange={(e) => setEditForm((p) => ({ ...p, billAmount: e.target.value }))}
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 text-slate-800 font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                  required
                />
                <p className="text-[10px] text-slate-400 mt-1">
                  Changing total recalculates remaining from payment history.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-12 gap-2 sm:items-center">
              <label className="sm:col-span-3 font-semibold text-slate-800">Payment Method</label>
              <div className="sm:col-span-9">
                <select
                  value={editForm.paymentMethod}
                  onChange={(e) => setEditForm((p) => ({ ...p, paymentMethod: e.target.value }))}
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 bg-white text-slate-800 font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                >
                  {PAYMENT_METHODS.map((m) => <option key={m} value={m}>{m}</option>)}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-12 gap-2 sm:items-center">
              <label className="sm:col-span-3 font-semibold text-slate-800">Expense Date</label>
              <div className="sm:col-span-9">
                <input
                  type="date"
                  value={editForm.expenseDate}
                  onChange={(e) => setEditForm((p) => ({ ...p, expenseDate: e.target.value }))}
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 bg-white text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-12 gap-2 sm:items-center">
              <label className="sm:col-span-3 font-semibold text-slate-800">Vendor</label>
              <div className="sm:col-span-9">
                <input
                  type="text"
                  list="edit-expense-vendors-list"
                  placeholder="Select or type new vendor"
                  value={editForm.vendor}
                  onChange={(e) => handleEditVendorChange(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 bg-white text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                />
                <datalist id="edit-expense-vendors-list">
                  {Array.from(new Set([...allVendors, ...Object.keys(savedVendors)])).map((v) => (
                    <option key={v} value={v} />
                  ))}
                </datalist>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-12 gap-2 sm:items-center">
              <label className="sm:col-span-3 font-semibold text-slate-800">Vendor Phone</label>
              <div className="sm:col-span-9">
                <input
                  type="text"
                  placeholder="Optional"
                  value={editForm.vendorPhone || ''}
                  onChange={(e) => setEditForm((p) => ({ ...p, vendorPhone: e.target.value }))}
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 text-slate-800 placeholder:text-slate-400"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-12 gap-2 sm:items-center">
              <label className="sm:col-span-3 font-semibold text-slate-800">Vendor Email</label>
              <div className="sm:col-span-9">
                <input
                  type="email"
                  placeholder="Optional"
                  value={editForm.vendorEmail || ''}
                  onChange={(e) => setEditForm((p) => ({ ...p, vendorEmail: e.target.value }))}
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 text-slate-800 placeholder:text-slate-400"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-12 gap-2 sm:items-start">
              <label className="sm:col-span-3 font-semibold text-slate-800 sm:pt-2">Vendor Address</label>
              <div className="sm:col-span-9">
                <textarea
                  rows={2}
                  placeholder="Optional"
                  value={editForm.vendorAddress || ''}
                  onChange={(e) => setEditForm((p) => ({ ...p, vendorAddress: e.target.value }))}
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 text-slate-800 placeholder:text-slate-400"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-12 gap-2 sm:items-start">
              <label className="sm:col-span-3 font-semibold text-slate-800 sm:pt-2">Description</label>
              <div className="sm:col-span-9">
                <textarea
                  rows={2}
                  placeholder="Description of Expense"
                  value={editForm.notes}
                  onChange={(e) => setEditForm((p) => ({ ...p, notes: e.target.value }))}
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 text-slate-800 placeholder:text-slate-400"
                />
              </div>
            </div>

            <div className="flex items-center justify-between pt-2">
              <button
                type="button"
                onClick={() => handleDeleteExpense(editExpense.id)}
                className="px-3.5 py-2 rounded-lg border border-rose-200 text-rose-600 hover:bg-rose-50 font-semibold inline-flex items-center gap-1.5 cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Delete Expense</span>
              </button>
              <button
                type="submit"
                className="px-5 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-bold inline-flex items-center gap-1.5 shadow-sm cursor-pointer transition-colors"
              >
                <span>Submit form</span>
                <Send className="w-3.5 h-3.5" />
              </button>
            </div>
          </form>
        </div>
      ) : detailsExpense ? (
        /* Full-Page Expense Details View (Picks 2 & 3) */
        (() => {
          const bill = Number(detailsExpense.billAmount || 0)
          const paid = Math.min(bill, getPaidAmount(detailsExpense))
          const rem = Math.max(0, bill - paid)
          const pct = bill > 0 ? Math.round((paid / bill) * 100) : 0
          const st = getExpenseStatus(detailsExpense)
          const instList = detailsExpense.installments || []
          let runningPaid = 0

          return (
            <div className="bg-white rounded-xl border border-slate-200 p-5 sm:p-6 shadow-2xs space-y-5">
              {/* Sub-header row */}
              <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-100">
                <div className="flex items-center gap-2 text-slate-800 text-xs font-bold">
                  <Eye className="w-4 h-4 text-slate-500" />
                  <span>Expense Details</span>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  {rem > 0 && (
                    <button
                      type="button"
                      onClick={() => openPaymentModal(detailsExpense)}
                      className="px-3.5 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold inline-flex items-center gap-1.5 cursor-pointer transition-colors"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Add Payment</span>
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => setReceiptExpense(detailsExpense)}
                    className="px-3.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold inline-flex items-center gap-1.5 cursor-pointer transition-colors"
                  >
                    <FileText className="w-3.5 h-3.5" />
                    <span>Receipt</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => openEditModal(detailsExpense)}
                    className="px-3.5 py-1.5 rounded-lg border border-blue-400 text-blue-600 hover:bg-blue-50 text-xs font-bold inline-flex items-center gap-1.5 cursor-pointer transition-colors"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                    <span>Edit</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setDetailsExpenseId(null)}
                    className="px-3.5 py-1.5 rounded-lg bg-slate-600 hover:bg-slate-700 text-white text-xs font-bold inline-flex items-center gap-1.5 cursor-pointer transition-colors"
                  >
                    <ArrowLeft className="w-3.5 h-3.5" />
                    <span>Back</span>
                  </button>
                </div>
              </div>

              {/* Expense Identity */}
              <div>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Expense</p>
                <div className="flex flex-wrap items-center gap-2 mt-1">
                  <h2 className="text-base font-extrabold text-slate-900">{detailsExpense.title}</h2>
                  {detailsExpense.category && (
                    <span className="px-2 py-0.5 rounded bg-cyan-500 text-white text-[10px] font-bold">
                      {detailsExpense.category}
                    </span>
                  )}
                </div>
              </div>

              {/* Payment Summary Box */}
              <div className="rounded-xl border border-slate-200 p-4 space-y-3 bg-slate-50/40">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold text-slate-600 uppercase tracking-wider">Payment Summary</span>
                  <span
                    className={`px-2.5 py-0.5 rounded text-[10px] font-bold text-white ${
                      st === 'Paid' ? 'bg-emerald-500' : st === 'Partially Paid' ? 'bg-amber-500' : 'bg-rose-500'
                    }`}
                  >
                    {st}
                  </span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <div className="bg-white rounded-lg border border-slate-200 p-3">
                    <p className="text-[10px] font-bold text-slate-400 uppercase">Total</p>
                    <p className="text-sm font-extrabold text-rose-600 mt-0.5">{formatPkr(bill)}</p>
                  </div>
                  <div className="bg-white rounded-lg border border-slate-200 p-3">
                    <p className="text-[10px] font-bold text-slate-400 uppercase">Paid</p>
                    <p className="text-sm font-extrabold text-emerald-600 mt-0.5">{formatPkr(paid)}</p>
                  </div>
                  <div className="bg-white rounded-lg border border-slate-200 p-3">
                    <p className="text-[10px] font-bold text-slate-400 uppercase">Remaining</p>
                    <p className="text-sm font-extrabold text-slate-900 mt-0.5">{formatPkr(rem)}</p>
                  </div>
                  <div className="bg-white rounded-lg border border-slate-200 p-3">
                    <p className="text-[10px] font-bold text-slate-400 uppercase">Progress</p>
                    <p className="text-sm font-extrabold text-slate-900 mt-0.5">{pct}%</p>
                  </div>
                </div>

                <div>
                  <div className="h-2 w-full rounded-full bg-slate-200 overflow-hidden">
                    <div className="h-full bg-emerald-500 transition-all" style={{ width: `${pct}%` }} />
                  </div>
                  <div className="flex items-center justify-between text-[10px] text-slate-400 mt-1">
                    <span>{formatPkr(paid)} paid</span>
                    <span>{formatPkr(rem)} left</span>
                  </div>
                </div>
              </div>

              {/* Payment Method & Expense Date */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 py-3 border-y border-slate-100 text-xs">
                <div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Payment Method</p>
                  <span className="inline-block px-2 py-0.5 rounded bg-slate-500 text-white text-[10px] font-bold">
                    {detailsExpense.paymentMethod || 'Cash'}
                  </span>
                </div>
                <div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Expense Date</p>
                  <p className="font-bold text-slate-800">{formatDisplayDate(detailsExpense.expenseDate)}</p>
                </div>
              </div>

              {/* Description */}
              <div className="text-xs pb-2 border-b border-slate-100">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Description</p>
                <p className="text-slate-700 font-medium">{detailsExpense.notes || '—'}</p>
              </div>

              {/* This bill — payments (installments ledger) */}
              <div className="space-y-3">
                <div className="flex items-center justify-between gap-2">
                  <div>
                    <h3 className="text-xs font-bold text-slate-800">This bill — payments</h3>
                    <p className="text-[10px] text-slate-400">Installments paid against {detailsExpense.title} only</p>
                  </div>
                  {rem > 0 && (
                    <button
                      type="button"
                      onClick={() => openPaymentModal(detailsExpense)}
                      className="px-3.5 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold inline-flex items-center gap-1 cursor-pointer"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Add Payment</span>
                    </button>
                  )}
                </div>

                <div className="overflow-x-auto border border-slate-100 rounded-xl">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold">
                      <tr>
                        <th className="py-2.5 px-3 w-10">#</th>
                        <th className="py-2.5 px-3">Date</th>
                        <th className="py-2.5 px-3">Amount</th>
                        <th className="py-2.5 px-3">Remaining after</th>
                        <th className="py-2.5 px-3">Method</th>
                        <th className="py-2.5 px-3">Note</th>
                        <th className="py-2.5 px-3">By</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {instList.length === 0 ? (
                        <tr>
                          <td colSpan={7} className="py-6 text-center text-slate-400">
                            No installment payments recorded yet.
                          </td>
                        </tr>
                      ) : (
                        instList.map((inst, i) => {
                          runningPaid += Number(inst.amount || 0)
                          const remAfter = Math.max(0, bill - runningPaid)
                          return (
                            <tr key={inst.id || i} className="hover:bg-slate-50/70">
                              <td className="py-2.5 px-3 text-slate-500 font-semibold">{i + 1}</td>
                              <td className="py-2.5 px-3">
                                <div className="font-semibold text-slate-800">{formatDisplayDate(inst.date)}</div>
                                <div className="text-[10px] text-slate-400">recorded {formatShortDayMonth(inst.date)}</div>
                              </td>
                              <td className="py-2.5 px-3 font-extrabold text-slate-900">{formatPkr(inst.amount)}</td>
                              <td className="py-2.5 px-3 font-semibold text-slate-700">{formatPkr(remAfter)}</td>
                              <td className="py-2.5 px-3 text-slate-600">{inst.method || 'Cash'}</td>
                              <td className="py-2.5 px-3 text-slate-600">{inst.note || '—'}</td>
                              <td className="py-2.5 px-3 text-slate-600">{inst.recordedBy || 'School Admin'}</td>
                            </tr>
                          )
                        })
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )
        })()
      ) : (
      <>
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
              <div className="absolute right-0 mt-1.5 w-44 rounded-xl bg-white border border-slate-200 shadow-xl py-1.5 z-30 text-xs">
                <button
                  type="button"
                  onClick={handleExportPdf}
                  className="w-full px-3.5 py-2 text-left hover:bg-slate-50 font-medium text-slate-700 cursor-pointer flex items-center gap-2.5"
                >
                  <FileText className="w-3.5 h-3.5 text-slate-500" />
                  <span>Export as PDF</span>
                </button>
                <button
                  type="button"
                  onClick={handleExportExcel}
                  className="w-full px-3.5 py-2 text-left hover:bg-slate-50 font-medium text-slate-700 cursor-pointer flex items-center gap-2.5"
                >
                  <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Export as Excel</span>
                </button>
                <button
                  type="button"
                  onClick={handleExportCsv}
                  className="w-full px-3.5 py-2 text-left hover:bg-slate-50 font-medium text-slate-700 cursor-pointer flex items-center gap-2.5"
                >
                  <Table className="w-3.5 h-3.5 text-sky-600" />
                  <span>Export as CSV</span>
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
                                onClick={() => setDetailsExpenseId(exp.id)}
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
                                  onClick={() => { setOpenMenuId(null); setDetailsExpenseId(exp.id) }}
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
          /* Tab 2: + Create New Expense Form matching Picks 2 & 3 */
          <form onSubmit={handleCreateExpense} className="p-6 max-w-4xl space-y-4 text-xs">
            <div className="grid grid-cols-1 sm:grid-cols-12 gap-2 sm:items-center">
              <label className="sm:col-span-3 font-semibold text-slate-800">
                Name <span className="text-rose-500">*</span>
              </label>
              <div className="sm:col-span-9">
                <input
                  type="text"
                  placeholder="Name of Expense"
                  value={createForm.title}
                  onChange={(e) => setCreateForm((p) => ({ ...p, title: e.target.value }))}
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-12 gap-2 sm:items-center">
              <label className="sm:col-span-3 font-semibold text-slate-800">
                Expense Type <span className="text-rose-500">*</span>
              </label>
              <div className="sm:col-span-9">
                <select
                  value={createForm.category}
                  onChange={(e) => setCreateForm((p) => ({ ...p, category: e.target.value }))}
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 bg-white text-slate-800 font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                  required
                >
                  <option value="">Select Expense Type</option>
                  {allCategories.map((c) => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-12 gap-2 sm:items-center">
              <label className="sm:col-span-3 font-semibold text-slate-800">Payment Method</label>
              <div className="sm:col-span-9">
                <select
                  value={createForm.paymentMethod}
                  onChange={(e) => setCreateForm((p) => ({ ...p, paymentMethod: e.target.value }))}
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 bg-white text-slate-800 font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                >
                  {PAYMENT_METHODS.map((m) => <option key={m} value={m}>{m}</option>)}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-12 gap-2 sm:items-center">
              <label className="sm:col-span-3 font-semibold text-slate-800">
                Total Amount (PKR) <span className="text-rose-500">*</span>
              </label>
              <div className="sm:col-span-9">
                <input
                  type="number"
                  min="1"
                  value={createForm.billAmount}
                  onChange={(e) => setCreateForm((p) => ({ ...p, billAmount: e.target.value }))}
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 text-slate-800 font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-12 gap-2 sm:items-start">
              <label className="sm:col-span-3 font-semibold text-slate-800 sm:pt-2">Paid Now (PKR)</label>
              <div className="sm:col-span-9">
                <input
                  type="number"
                  min="0"
                  placeholder="Defaults to full total (Paid)"
                  value={createForm.paidNow}
                  onChange={(e) => setCreateForm((p) => ({ ...p, paidNow: e.target.value }))}
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                />
                <p className="text-[10px] text-slate-400 mt-1">
                  Leave blank or equal to total for Paid. Enter 0 for Pending.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-12 gap-2 sm:items-center">
              <label className="sm:col-span-3 font-semibold text-slate-800">Expense Date</label>
              <div className="sm:col-span-9">
                <input
                  type="date"
                  value={createForm.expenseDate}
                  onChange={(e) => setCreateForm((p) => ({ ...p, expenseDate: e.target.value }))}
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 bg-white text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-12 gap-2 sm:items-start">
              <label className="sm:col-span-3 font-semibold text-slate-800 sm:pt-2">Vendor</label>
              <div className="sm:col-span-9">
                <input
                  type="text"
                  list="expense-vendors-list"
                  placeholder="Select or type new vendor"
                  value={createForm.vendor}
                  onChange={(e) => handleVendorInputChange(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 bg-white text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                />
                <datalist id="expense-vendors-list">
                  {Array.from(new Set([...allVendors, ...Object.keys(savedVendors)])).map((v) => (
                    <option key={v} value={v} />
                  ))}
                </datalist>
                <p className="text-[10px] text-slate-400 mt-1">
                  Pick an existing vendor or type a new name — it will be saved for next time.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-12 gap-2 sm:items-center">
              <label className="sm:col-span-3 font-semibold text-slate-800">Vendor Phone</label>
              <div className="sm:col-span-9">
                <input
                  type="text"
                  placeholder="Optional"
                  value={createForm.vendorPhone}
                  onChange={(e) => setCreateForm((p) => ({ ...p, vendorPhone: e.target.value }))}
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-12 gap-2 sm:items-center">
              <label className="sm:col-span-3 font-semibold text-slate-800">Vendor Email</label>
              <div className="sm:col-span-9">
                <input
                  type="email"
                  placeholder="Optional"
                  value={createForm.vendorEmail}
                  onChange={(e) => setCreateForm((p) => ({ ...p, vendorEmail: e.target.value }))}
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-12 gap-2 sm:items-start">
              <label className="sm:col-span-3 font-semibold text-slate-800 sm:pt-2">Vendor Address</label>
              <div className="sm:col-span-9">
                <textarea
                  rows={2}
                  placeholder="Optional"
                  value={createForm.vendorAddress}
                  onChange={(e) => setCreateForm((p) => ({ ...p, vendorAddress: e.target.value }))}
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-12 gap-2 sm:items-start">
              <label className="sm:col-span-3 font-semibold text-slate-800 sm:pt-2">Description</label>
              <div className="sm:col-span-9">
                <textarea
                  rows={2}
                  placeholder="Description of Expense"
                  value={createForm.notes}
                  onChange={(e) => setCreateForm((p) => ({ ...p, notes: e.target.value }))}
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                />
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <button
                type="submit"
                className="px-5 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-bold inline-flex items-center gap-1.5 shadow-sm cursor-pointer transition-colors"
              >
                <span>Submit form</span>
                <Send className="w-3.5 h-3.5" />
              </button>
            </div>
          </form>
        )}
      </div>
      </>
      )}

      {/* Modal 5: In-App Expense Receipt Viewer & Download/Print (Pick 5) */}
      {receiptExpense && (
        (() => {
          const rBill = Number(receiptExpense.billAmount || 0)
          const rPaid = Math.min(rBill, getPaidAmount(receiptExpense))
          const rRem = Math.max(0, rBill - rPaid)
          const rCode = getReceiptCode(receiptExpense)
          const yr = new Date().getFullYear()
          const acadYear = `${yr - 1}-${yr}`

          return (
            <div className="fixed inset-0 z-[110] bg-slate-900/60 backdrop-blur-[1px] flex items-center justify-center p-4">
              <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[92vh] flex flex-col overflow-hidden border border-slate-200">
                <div className="px-5 py-3 bg-slate-900 text-white flex flex-wrap items-center justify-between gap-2 shrink-0">
                  <div className="flex items-center gap-2 text-sm font-bold">
                    <FileText className="w-4 h-4 text-emerald-400" />
                    <span>Expense Receipt Preview — {rCode}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => handleDownloadReceiptFile(receiptExpense)}
                      className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold inline-flex items-center gap-1.5 cursor-pointer"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>Download</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => handlePrintReceiptPdf(receiptExpense)}
                      className="px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold inline-flex items-center gap-1.5 cursor-pointer"
                    >
                      <Printer className="w-3.5 h-3.5" />
                      <span>Print / Save PDF</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setReceiptExpense(null)}
                      className="p-1 text-white/75 hover:text-white cursor-pointer"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Visual Receipt Sheet matching Pick 5 */}
                <div className="p-6 sm:p-8 overflow-y-auto bg-white space-y-5 text-xs text-slate-800">
                  <div className="text-center border-b-2 border-red-600 pb-4">
                    <h2 className="text-lg font-extrabold text-red-600 tracking-wide uppercase">
                      {currentInstitute?.name || 'School Portal'}
                    </h2>
                    <p className="text-[11px] text-slate-500 mt-0.5">
                      Phone: {currentInstitute?.phone || 'N/A'}
                    </p>
                  </div>

                  <h3 className="text-center text-base font-extrabold text-red-600 tracking-wider uppercase">
                    EXPENSE RECEIPT
                  </h3>

                  <div className="bg-slate-50 border-l-4 border-red-600 p-3.5 space-y-2">
                    <div>
                      <p className="text-[10px] font-bold text-slate-500 uppercase">Receipt ID</p>
                      <p className="text-xs font-extrabold text-red-600">{rCode}</p>
                    </div>
                    <div>
                      <p className="text-[10px] font-bold text-slate-500 uppercase">Expense Date</p>
                      <p className="text-xs font-extrabold text-red-600">{formatDisplayDate(receiptExpense.expenseDate)}</p>
                    </div>
                    <div>
                      <p className="text-[10px] font-bold text-slate-500 uppercase">Created Date</p>
                      <p className="text-xs font-extrabold text-red-600">{formatDisplayDate(receiptExpense.expenseDate)}</p>
                    </div>
                  </div>

                  <table className="w-full border-collapse border border-slate-300 text-xs">
                    <tbody>
                      <tr>
                        <th className="border border-slate-300 bg-slate-50 px-3 py-2 text-left font-bold text-slate-700 w-1/3">Expense Name</th>
                        <td className="border border-slate-300 px-3 py-2 font-bold text-slate-900">{receiptExpense.title}</td>
                      </tr>
                      <tr>
                        <th className="border border-slate-300 bg-slate-50 px-3 py-2 text-left font-bold text-slate-700">Expense Type</th>
                        <td className="border border-slate-300 px-3 py-2">{receiptExpense.category || 'General'}</td>
                      </tr>
                      <tr>
                        <th className="border border-slate-300 bg-slate-50 px-3 py-2 text-left font-bold text-slate-700">Payment Method</th>
                        <td className="border border-slate-300 px-3 py-2">{receiptExpense.paymentMethod || 'Cash'}</td>
                      </tr>
                      <tr>
                        <th className="border border-slate-300 bg-slate-50 px-3 py-2 text-left font-bold text-slate-700">Vendor</th>
                        <td className="border border-slate-300 px-3 py-2">{receiptExpense.vendor || '—'}</td>
                      </tr>
                      <tr>
                        <th className="border border-slate-300 bg-slate-50 px-3 py-2 text-left font-bold text-slate-700">Academic Year</th>
                        <td className="border border-slate-300 px-3 py-2">{acadYear}</td>
                      </tr>
                      <tr>
                        <th className="border border-slate-300 bg-slate-50 px-3 py-2 text-left font-bold text-slate-700">Description</th>
                        <td className="border border-slate-300 px-3 py-2">{receiptExpense.notes || '—'}</td>
                      </tr>
                    </tbody>
                  </table>

                  <div className="bg-red-50/70 border-l-4 border-red-600 px-4 py-3">
                    <p className="text-sm font-extrabold text-slate-800">
                      Total Expense Amount:{' '}
                      <span className="text-red-600">
                        PKR {rBill.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </span>
                    </p>
                    {rRem > 0 && (
                      <p className="text-[11px] text-slate-600 mt-0.5">
                        Paid: <strong>{formatPkr(rPaid)}</strong> · Remaining: <strong className="text-rose-600">{formatPkr(rRem)}</strong>
                      </p>
                    )}
                  </div>

                  <div className="pt-8 space-y-8">
                    <div className="w-60 border-t border-slate-800 pt-1 text-center text-[11px] font-semibold">
                      Authorized Signature
                    </div>
                    <div className="w-60 border-t border-slate-800 pt-1 text-center text-[11px] font-semibold">
                      Accountant Signature
                    </div>
                  </div>

                  <div className="bg-slate-50 p-3 text-center text-[10px] text-slate-500">
                    <strong className="text-red-600">Note:</strong> This is a computer-generated receipt. No signature is required for digital receipts.
                    <br />
                    Generated on {new Date().toLocaleString()} | Powered by <span className="text-red-600 font-semibold">{currentInstitute?.name || 'School Portal'}</span>
                  </div>
                </div>
              </div>
            </div>
          )
        })()
      )}

      {/* Modal 2: Add Expense Payment matching Pick 4 */}
      {paymentExpense && (
        (() => {
          const remVal = Math.max(0, Number(paymentExpense.billAmount || 0) - getPaidAmount(paymentExpense))
          return (
            <div className="fixed inset-0 z-[110] bg-slate-900/50 backdrop-blur-[1px] flex items-center justify-center p-4">
              <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden border border-slate-200">
                <div className="px-5 py-3.5 border-b border-slate-100 flex items-start justify-between">
                  <div>
                    <div className="flex items-center gap-1.5 text-sm font-bold text-slate-900">
                      <Plus className="w-4 h-4 text-slate-700" />
                      <span>Add Payment</span>
                    </div>
                    <p className="text-[11px] text-slate-500 mt-0.5">{paymentExpense.title}</p>
                  </div>
                  <button type="button" onClick={() => setPaymentExpense(null)} className="text-slate-400 hover:text-slate-700 cursor-pointer">
                    <X className="w-4 h-4" />
                  </button>
                </div>

                <form onSubmit={handleSavePayment} className="p-5 space-y-3.5 text-xs">
                  <div className="p-3 rounded-lg bg-slate-50 border border-slate-200 max-w-[210px]">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">This Bill</p>
                    <p className="text-base font-extrabold text-rose-600 mt-0.5">{formatPkr(remVal)}</p>
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-1">
                      Amount (PKR) <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="number"
                      min="1"
                      max={Math.max(1, remVal)}
                      value={payAmount}
                      onChange={(e) => setPayAmount(e.target.value)}
                      className="w-full px-3 py-2 rounded-lg border border-slate-200 font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setPayAmount(String(remVal))}
                      className="mt-2 px-2.5 py-1 rounded border border-slate-200 bg-slate-50 hover:bg-slate-100 text-[11px] font-semibold text-slate-700 cursor-pointer"
                    >
                      This bill · {formatPkr(remVal)}
                    </button>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block font-bold text-slate-700 mb-1">Paid via</label>
                      <select
                        value={payMethod}
                        onChange={(e) => setPayMethod(e.target.value)}
                        className="w-full px-3 py-2 rounded-lg border border-slate-200 bg-white font-semibold"
                      >
                        {PAYMENT_METHODS.map((m) => <option key={m} value={m}>{m}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className="block font-bold text-slate-700 mb-1">Date</label>
                      <input
                        type="date"
                        value={payDate}
                        onChange={(e) => setPayDate(e.target.value)}
                        className="w-full px-3 py-2 rounded-lg border border-slate-200 bg-white"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Note</label>
                    <textarea
                      rows={2}
                      placeholder="Optional"
                      value={payNote}
                      onChange={(e) => setPayNote(e.target.value)}
                      className="w-full px-3 py-2 rounded-lg border border-slate-200 placeholder:text-slate-400"
                    />
                  </div>

                  <div className="flex justify-end gap-2 pt-2">
                    <button type="button" onClick={() => setPaymentExpense(null)} className="px-4 py-2 rounded-lg border border-slate-200 text-slate-600 font-semibold cursor-pointer">
                      Cancel
                    </button>
                    <button type="submit" className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-bold cursor-pointer">
                      Save Payment
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )
        })()
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
