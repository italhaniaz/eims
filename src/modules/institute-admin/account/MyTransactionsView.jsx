import React, { useState, useMemo, useRef, useEffect } from 'react'
import {
  ArrowLeft,
  FileText,
  UserPlus,
  CreditCard,
  Receipt,
  ArrowDownCircle,
  MessageSquare,
  Calendar,
  CheckCircle2,
  Hourglass,
  Filter,
  Menu,
  ChevronDown,
  Eye,
  Printer,
  X
} from 'lucide-react'
import { useAuth } from '../../../context/AuthContext'
import { useToast } from '../../../context/ToastContext'
import { downloadSimplePdf } from '../../../utils/pdfExport'

const fmtPkr = (n) => `PKR ${Number(n || 0).toLocaleString()}`

const formatDisplayDate = (iso) => {
  if (!iso) return '—'
  const dt = new Date(iso)
  if (Number.isNaN(dt.getTime())) return String(iso).slice(0, 10)
  return dt.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })
}

const formatMonthLabel = (ym) => {
  if (!ym) return '—'
  const [y, m] = String(ym).split('-')
  if (!y || !m) return ym
  const dt = new Date(Number(y), Number(m) - 1, 1)
  if (Number.isNaN(dt.getTime())) return ym
  return dt.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
}

export const MyTransactionsView = ({
  currentInstitute,
  onRouteChange,
  onOpenQuickPayment,
  onOpenSendSms
}) => {
  const { user } = useAuth()
  const { toast } = useToast()
  const instId = currentInstitute?.id || 'inst-1'
  const instName = currentInstitute?.name || 'EduDigize Demo'
  const salaryPaymentsKey = `sms_campus_salary_payments_${instId}`

  const [payslips, setPayslips] = useState(() => {
    try {
      const saved = JSON.parse(localStorage.getItem(salaryPaymentsKey) || '[]')
      return Array.isArray(saved) ? saved : []
    } catch {
      return []
    }
  })

  useEffect(() => {
    try {
      const saved = JSON.parse(localStorage.getItem(salaryPaymentsKey) || '[]')
      setPayslips(Array.isArray(saved) ? saved : [])
    } catch {
      setPayslips([])
    }
  }, [instId, salaryPaymentsKey])

  const [filters, setFilters] = useState({ month: '', date: '', status: 'all' })
  const [applied, setApplied] = useState({ month: '', date: '', status: 'all' })
  const [openActionId, setOpenActionId] = useState(null)
  const [viewingSlip, setViewingSlip] = useState(null)

  const menuRef = useRef(null)
  useEffect(() => {
    const h = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) setOpenActionId(null)
    }
    document.addEventListener('mousedown', h)
    return () => document.removeEventListener('mousedown', h)
  }, [])

  // Filter to logged-in user's own payslips if any match their name/id, otherwise show campus admin's slips
  const mySlips = useMemo(() => {
    const userName = String(user?.name || '').trim().toLowerCase()
    const matched = payslips.filter(
      (p) =>
        (user?.id && p.staffId === user.id) ||
        (userName && String(p.employeeName || '').trim().toLowerCase() === userName)
    )
    return matched.length > 0 ? matched : payslips
  }, [payslips, user])

  const filteredSlips = useMemo(() => {
    return mySlips.filter((p) => {
      if (applied.month && p.salaryMonth !== applied.month) return false
      if (applied.date) {
        const day = String(p.createdAt || '').slice(0, 10)
        if (day !== applied.date) return false
      }
      if (applied.status !== 'all' && p.status !== applied.status) return false
      return true
    })
  }, [mySlips, applied])

  const currentMonthYm = new Date().toISOString().slice(0, 7)
  const stats = useMemo(() => {
    const totalCount = filteredSlips.length
    const totalAmount = filteredSlips.reduce((s, p) => s + Number(p.total || 0), 0)
    const thisMonthList = filteredSlips.filter((p) => p.salaryMonth === currentMonthYm)
    const thisMonthAmount = thisMonthList.reduce((s, p) => s + Number(p.total || 0), 0)
    const paidCount = filteredSlips.filter((p) => p.status === 'Paid').length
    const pendingCount = filteredSlips.filter((p) => p.status !== 'Paid').length
    return {
      totalCount,
      totalAmount,
      thisMonthCount: thisMonthList.length,
      thisMonthAmount,
      paidCount,
      pendingCount
    }
  }, [filteredSlips, currentMonthYm])

  const handleDownloadSlipPdf = (slip) => {
    setOpenActionId(null)
    downloadSimplePdf({
      title: `${instName} — Salary Payslip`,
      subtitle: `${slip.employeeName} | ${formatMonthLabel(slip.salaryMonth)} | Status: ${slip.status}`,
      columns: ['Component', 'Amount'],
      rows: [
        ['Basic Salary', fmtPkr(slip.basic)],
        ['Bonus', fmtPkr(slip.bonus)],
        ['Deduction', fmtPkr(Number(slip.deduction || 0) + Number(slip.fine || 0))],
        ['Total Salary', fmtPkr(slip.total)],
        ['Payment Date', formatDisplayDate(slip.createdAt)]
      ],
      filename: `my-payslip-${slip.id}.pdf`
    })
    toast.success('Payslip PDF downloaded.')
  }

  return (
    <div className="space-y-4">
      {/* Page Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <FileText className="w-5 h-5 text-slate-600" />
            <h1 className="text-xl font-bold text-slate-900 tracking-tight">
              My Transaction History
            </h1>
          </div>
          <button
            type="button"
            onClick={() => onRouteChange?.('inst-dashboard')}
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

      {/* 4 KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
        <div className="bg-white rounded-xl border border-slate-200 p-4 flex items-center gap-3.5 shadow-2xs">
          <div className="w-10 h-10 rounded-xl bg-sky-500 text-white flex items-center justify-center shrink-0">
            <CreditCard className="w-4 h-4" />
          </div>
          <div>
            <p className="text-[11px] font-semibold text-slate-500">Total Transactions</p>
            <p className="text-xl font-extrabold text-slate-900 mt-0.5">{stats.totalCount}</p>
            <p className="text-[10px] text-slate-400">{fmtPkr(stats.totalAmount)}</p>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-4 flex items-center gap-3.5 shadow-2xs">
          <div className="w-10 h-10 rounded-xl bg-orange-500 text-white flex items-center justify-center shrink-0">
            <Calendar className="w-4 h-4" />
          </div>
          <div>
            <p className="text-[11px] font-semibold text-slate-500">This Month</p>
            <p className="text-xl font-extrabold text-slate-900 mt-0.5">{stats.thisMonthCount}</p>
            <p className="text-[10px] text-slate-400">{fmtPkr(stats.thisMonthAmount)}</p>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-4 flex items-center gap-3.5 shadow-2xs">
          <div className="w-10 h-10 rounded-xl bg-emerald-500 text-white flex items-center justify-center shrink-0">
            <CheckCircle2 className="w-4 h-4" />
          </div>
          <div>
            <p className="text-[11px] font-semibold text-slate-500">Paid</p>
            <p className="text-xl font-extrabold text-slate-900 mt-0.5">{stats.paidCount}</p>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-4 flex items-center gap-3.5 shadow-2xs">
          <div className="w-10 h-10 rounded-xl bg-rose-500 text-white flex items-center justify-center shrink-0">
            <Hourglass className="w-4 h-4" />
          </div>
          <div>
            <p className="text-[11px] font-semibold text-slate-500">Pending</p>
            <p className="text-xl font-extrabold text-slate-900 mt-0.5">{stats.pendingCount}</p>
          </div>
        </div>
      </div>

      {/* Main Transaction History Card */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-visible">
        <div className="px-5 py-3.5 border-b border-slate-100 flex items-center gap-2 text-sm font-semibold text-slate-800">
          <CreditCard className="w-4 h-4 text-slate-600" />
          <span>My Transaction History</span>
        </div>

        <div className="p-5 space-y-4">
          {/* Filters */}
          <div className="space-y-3">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-[11px] font-medium text-slate-600 mb-1">
                  Filter by Month:
                </label>
                <input
                  type="month"
                  value={filters.month}
                  onChange={(e) => setFilters((p) => ({ ...p, month: e.target.value }))}
                  className="w-full px-3 py-1.5 rounded-lg border border-slate-200 text-xs"
                />
              </div>
              <div>
                <label className="block text-[11px] font-medium text-slate-600 mb-1">
                  Filter by Date:
                </label>
                <input
                  type="date"
                  value={filters.date}
                  onChange={(e) => setFilters((p) => ({ ...p, date: e.target.value }))}
                  className="w-full px-3 py-1.5 rounded-lg border border-slate-200 text-xs"
                />
              </div>
              <div>
                <label className="block text-[11px] font-medium text-slate-600 mb-1">
                  Filter by Status:
                </label>
                <select
                  value={filters.status}
                  onChange={(e) => setFilters((p) => ({ ...p, status: e.target.value }))}
                  className="w-full px-3 py-1.5 rounded-lg border border-slate-200 text-xs bg-white"
                >
                  <option value="all">All Status</option>
                  <option value="Paid">Paid</option>
                  <option value="Pending">Pending</option>
                </select>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setApplied({ ...filters })}
                className="px-3.5 py-1.5 rounded-lg bg-sky-500 hover:bg-sky-600 text-white text-xs font-semibold inline-flex items-center gap-1.5 cursor-pointer"
              >
                <Filter className="w-3.5 h-3.5" />
                <span>Apply Filters</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  const empty = { month: '', date: '', status: 'all' }
                  setFilters(empty)
                  setApplied(empty)
                }}
                className="px-3.5 py-1.5 rounded-lg bg-slate-600 hover:bg-slate-700 text-white text-xs font-semibold cursor-pointer"
              >
                Reset
              </button>
            </div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-y border-slate-200 bg-slate-50/60 text-xs font-semibold text-slate-600">
                  <th className="py-2.5 px-3 w-14">S/N</th>
                  <th className="py-2.5 px-3">Basic Salary</th>
                  <th className="py-2.5 px-3">Bonus</th>
                  <th className="py-2.5 px-3">Deduction</th>
                  <th className="py-2.5 px-3">Total Salary</th>
                  <th className="py-2.5 px-3">Salary Month</th>
                  <th className="py-2.5 px-3">Status</th>
                  <th className="py-2.5 px-3">Payment Date</th>
                  <th className="py-2.5 px-3 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs text-slate-700">
                {filteredSlips.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="py-10 text-center text-slate-400">
                      No salary transactions recorded yet.
                    </td>
                  </tr>
                ) : (
                  filteredSlips.map((p, idx) => (
                    <tr key={p.id} className="hover:bg-slate-50/70">
                      <td className="py-3 px-3 text-slate-500">{idx + 1}</td>
                      <td className="py-3 px-3 font-bold text-slate-900">{fmtPkr(p.basic)}</td>
                      <td className="py-3 px-3 text-slate-600">{fmtPkr(p.bonus)}</td>
                      <td className="py-3 px-3 text-slate-600">
                        {fmtPkr(Number(p.deduction || 0) + Number(p.fine || 0))}
                      </td>
                      <td className="py-3 px-3 font-bold text-sky-600">{fmtPkr(p.total)}</td>
                      <td className="py-3 px-3">
                        <span className="px-2 py-0.5 rounded bg-orange-500 text-white text-[10px] font-semibold">
                          {formatMonthLabel(p.salaryMonth)}
                        </span>
                      </td>
                      <td className="py-3 px-3">
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            p.status === 'Paid'
                              ? 'bg-emerald-500 text-white'
                              : 'bg-amber-100 text-amber-800'
                          }`}
                        >
                          {p.status}
                        </span>
                      </td>
                      <td className="py-3 px-3 text-slate-600">
                        {formatDisplayDate(p.createdAt)}
                      </td>
                      <td className="py-3 px-3 text-center">
                        <div
                          className="relative inline-block"
                          ref={openActionId === p.id ? menuRef : null}
                        >
                          <button
                            type="button"
                            onClick={() => setOpenActionId((prev) => (prev === p.id ? null : p.id))}
                            className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-600 inline-flex items-center gap-0.5 cursor-pointer"
                          >
                            <Menu className="w-3.5 h-3.5" />
                            <ChevronDown className="w-3 h-3" />
                          </button>
                          {openActionId === p.id && (
                            <div className="absolute right-0 mt-1 w-36 rounded-xl bg-white border border-slate-200 shadow-xl py-1 z-30 text-left text-xs">
                              <button
                                type="button"
                                onClick={() => {
                                  setOpenActionId(null)
                                  setViewingSlip(p)
                                }}
                                className="w-full px-3 py-1.5 hover:bg-slate-50 flex items-center gap-2 text-slate-700 cursor-pointer"
                              >
                                <Eye className="w-3.5 h-3.5 text-sky-600" />
                                <span>View Payslip</span>
                              </button>
                              <button
                                type="button"
                                onClick={() => handleDownloadSlipPdf(p)}
                                className="w-full px-3 py-1.5 hover:bg-slate-50 flex items-center gap-2 text-slate-700 cursor-pointer"
                              >
                                <Printer className="w-3.5 h-3.5 text-emerald-600" />
                                <span>Print / PDF</span>
                              </button>
                            </div>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Payslip Modal */}
      {viewingSlip && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-xl border border-slate-200 shadow-2xl max-w-md w-full p-5 space-y-4 text-xs">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-sm font-bold text-slate-900">Salary Payslip</h3>
                <p className="text-[11px] text-slate-500">
                  {formatMonthLabel(viewingSlip.salaryMonth)} • {viewingSlip.id}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setViewingSlip(null)}
                className="p-1 rounded-lg hover:bg-slate-100 text-slate-500 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-slate-500">Employee</span>
                <span className="font-semibold text-slate-900">{viewingSlip.employeeName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Basic Salary</span>
                <span className="font-semibold">{fmtPkr(viewingSlip.basic)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Bonus</span>
                <span className="font-semibold text-emerald-600">+{fmtPkr(viewingSlip.bonus)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Deduction &amp; Fine</span>
                <span className="font-semibold text-rose-600">
                  -{fmtPkr(Number(viewingSlip.deduction || 0) + Number(viewingSlip.fine || 0))}
                </span>
              </div>
              <div className="flex justify-between pt-2 border-t border-slate-200 text-sm">
                <span className="font-bold text-slate-900">Total Salary</span>
                <span className="font-extrabold text-sky-600">{fmtPkr(viewingSlip.total)}</span>
              </div>
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => handleDownloadSlipPdf(viewingSlip)}
                className="px-3.5 py-1.5 rounded-lg bg-sky-600 text-white font-semibold inline-flex items-center gap-1.5 cursor-pointer"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>Print / PDF</span>
              </button>
              <button
                type="button"
                onClick={() => setViewingSlip(null)}
                className="px-3.5 py-1.5 rounded-lg border border-slate-200 font-semibold cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default MyTransactionsView
