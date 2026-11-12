import React, { useState, useMemo } from 'react'
import {
  CreditCard,
  Calendar,
  CheckCircle2,
  Clock,
  Filter,
  RotateCcw,
  Eye,
  Printer,
  Download,
  BookMarked,
  Megaphone,
  CheckSquare,
  FileEdit,
  Wallet,
  ArrowLeft,
  X,
  FileText,
  DollarSign
} from 'lucide-react'
import { useToast } from '../../context/ToastContext'

export default function TeacherTransactionsView({
  onBack,
  onNavigate,
  onOpenModal,
  teacherName = 'Teacher'
}) {
  const { toast } = useToast()

  // Filter States
  const [filterMonth, setFilterMonth] = useState('')
  const [filterDate, setFilterDate] = useState('')
  const [filterStatus, setFilterStatus] = useState('All Status')

  // Applied Filters
  const [appliedFilters, setAppliedFilters] = useState({
    month: '',
    date: '',
    status: 'All Status'
  })

  // Selected Transaction for Payslip Modal
  const [viewingPayslip, setViewingPayslip] = useState(null)

  // Transactions State (Defaults to 0 empty state as in screenshot)
  const [transactions, setTransactions] = useState(() => {
    try {
      const saved = localStorage.getItem('teacher_portal_transactions')
      if (saved) {
        const parsed = JSON.parse(saved)
        if (Array.isArray(parsed)) return parsed
      }
    } catch {}
    return []
  })

  // Apply filters
  const handleApplyFilters = (e) => {
    e.preventDefault()
    setAppliedFilters({
      month: filterMonth.trim(),
      date: filterDate.trim(),
      status: filterStatus
    })
    toast?.success?.('Filters applied.')
  }

  // Reset filters
  const handleResetFilters = () => {
    setFilterMonth('')
    setFilterDate('')
    setFilterStatus('All Status')
    setAppliedFilters({
      month: '',
      date: '',
      status: 'All Status'
    })
    toast?.info?.('Filters reset.')
  }

  // Filtered list
  const filteredTransactions = useMemo(() => {
    return transactions.filter((t) => {
      const matchMonth =
        !appliedFilters.month || t.salaryMonth?.toLowerCase().includes(appliedFilters.month.toLowerCase())
      const matchDate =
        !appliedFilters.date || t.paymentDate === appliedFilters.date
      const matchStatus =
        appliedFilters.status === 'All Status' || t.status === appliedFilters.status

      return matchMonth && matchDate && matchStatus
    })
  }, [transactions, appliedFilters])

  // KPIs
  const stats = useMemo(() => {
    const totalCount = transactions.length
    const paidCount = transactions.filter((t) => t.status === 'Paid').length
    const pendingCount = transactions.filter((t) => t.status === 'Pending').length
    const thisMonthPaid = transactions.filter((t) => t.salaryMonth?.includes('2026') && t.status === 'Paid').length
    return {
      totalCount,
      paidCount,
      pendingCount,
      thisMonthPaid
    }
  }, [transactions])

  return (
    <div className="flex-1 flex flex-col min-h-0 bg-slate-50/70 dark:bg-slate-950">
      {/* ========================================================= */}
      {/* 1. SUB-HEADER BAR */}
      {/* ========================================================= */}
      <div className="bg-white dark:bg-slate-900 border-b border-slate-200/90 dark:border-slate-800 px-4 sm:px-6 py-2.5 flex flex-wrap items-center justify-between gap-3 shrink-0 shadow-2xs">
        <div className="flex flex-col">
          <div className="flex items-center gap-2 font-black text-sm text-slate-900 dark:text-white">
            <CreditCard className="w-4 h-4 text-blue-600 dark:text-blue-400" />
            <span>My Transaction History</span>
          </div>
          <button
            onClick={onBack}
            className="text-xs font-semibold text-slate-500 hover:text-sky-600 dark:text-slate-400 dark:hover:text-sky-400 flex items-center gap-1.5 transition-colors mt-0.5 cursor-pointer text-left w-fit"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back</span>
          </button>
        </div>

        {/* Top Quick Links Bar (My Salary highlighted in active blue pill) */}
        <div className="hidden lg:flex items-center gap-3 text-xs font-semibold text-slate-600 dark:text-slate-300">
          <button
            onClick={() => onNavigate ? onNavigate('assignments') : onOpenModal && onOpenModal('assignments')}
            className="flex items-center gap-1.5 hover:text-purple-600 dark:hover:text-purple-400 transition-colors cursor-pointer px-2 py-1"
          >
            <BookMarked className="w-3.5 h-3.5" />
            <span>Assignments</span>
          </button>
          <button
            onClick={() => onNavigate ? onNavigate('announcements') : onOpenModal && onOpenModal('announcements')}
            className="flex items-center gap-1.5 hover:text-purple-600 dark:hover:text-purple-400 transition-colors cursor-pointer px-2 py-1"
          >
            <Megaphone className="w-3.5 h-3.5" />
            <span>Announcements</span>
          </button>
          <button
            onClick={() => onNavigate ? onNavigate('mark-attendance') : onOpenModal && onOpenModal('mark-attendance')}
            className="flex items-center gap-1.5 hover:text-purple-600 dark:hover:text-purple-400 transition-colors cursor-pointer px-2 py-1"
          >
            <CheckSquare className="w-3.5 h-3.5" />
            <span>Mark Attendance</span>
          </button>
          <button
            onClick={() => onNavigate ? onNavigate('marks-entry') : onOpenModal && onOpenModal('marks-entry')}
            className="flex items-center gap-1.5 hover:text-purple-600 dark:hover:text-purple-400 transition-colors cursor-pointer px-2 py-1"
          >
            <FileEdit className="w-3.5 h-3.5" />
            <span>Marks Entry</span>
          </button>
          <button
            onClick={() => onNavigate ? onNavigate('timetable') : onOpenModal && onOpenModal('timetable')}
            className="flex items-center gap-1.5 hover:text-purple-600 dark:hover:text-purple-400 transition-colors cursor-pointer px-2 py-1"
          >
            <Calendar className="w-3.5 h-3.5" />
            <span>Timetables & Exam Schedules</span>
          </button>
          <div className="flex items-center gap-1.5 text-sky-700 dark:text-sky-300 bg-sky-50 dark:bg-sky-950/60 px-3 py-1.5 rounded-xl border border-sky-200 dark:border-sky-800 font-bold shadow-2xs">
            <Wallet className="w-3.5 h-3.5 text-sky-600 dark:text-sky-400" />
            <span>My Salary</span>
          </div>
        </div>
      </div>

      {/* ========================================================= */}
      {/* 2. MAIN SCROLL CONTAINER */}
      {/* ========================================================= */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-7 space-y-5">
        {/* ROW 1: 4 KPI CARDS (Matching Screenshot 3) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Card 1: Total Transactions */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-2xl p-5 shadow-xs flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-sky-500 text-white flex items-center justify-center font-bold shadow-sm shadow-sky-500/30">
              <CreditCard className="w-6 h-6" />
            </div>
            <div>
              <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                Total Transactions
              </p>
              <h3 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight leading-tight">
                {stats.totalCount}
              </h3>
              <p className="text-[11px] text-slate-400 dark:text-slate-500">
                Paid: {stats.paidCount}
              </p>
            </div>
          </div>

          {/* Card 2: This Month */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-2xl p-5 shadow-xs flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-orange-500 text-white flex items-center justify-center font-bold shadow-sm shadow-orange-500/30">
              <Calendar className="w-6 h-6" />
            </div>
            <div>
              <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                This Month
              </p>
              <h3 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight leading-tight">
                0
              </h3>
              <p className="text-[11px] text-slate-400 dark:text-slate-500">
                Paid: 0
              </p>
            </div>
          </div>

          {/* Card 3: Paid */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-2xl p-5 shadow-xs flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-emerald-600 text-white flex items-center justify-center font-bold shadow-sm shadow-emerald-500/30">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <div>
              <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                Paid
              </p>
              <h3 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight leading-tight">
                {stats.paidCount}
              </h3>
            </div>
          </div>

          {/* Card 4: Pending */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-2xl p-5 shadow-xs flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-rose-500 text-white flex items-center justify-center font-bold shadow-sm shadow-rose-500/30">
              <Clock className="w-6 h-6" />
            </div>
            <div>
              <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                Pending
              </p>
              <h3 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight leading-tight">
                {stats.pendingCount}
              </h3>
            </div>
          </div>
        </div>

        {/* ROW 2: MAIN CARD MATCHING SCREENSHOT 3 */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-2xl p-5 sm:p-6 shadow-xs space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-slate-100 dark:border-slate-800">
            <CreditCard className="w-4 h-4 text-slate-700 dark:text-slate-300" />
            <h3 className="text-sm font-extrabold text-slate-900 dark:text-white">
              My Transaction History
            </h3>
          </div>

          {/* Filters Form matching screenshot 3 */}
          <form
            onSubmit={handleApplyFilters}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-3 items-end"
          >
            {/* Filter by Month */}
            <div className="lg:col-span-4 space-y-1">
              <label className="text-[11px] font-extrabold uppercase text-slate-400 block tracking-wider">
                Filter by Month:
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={filterMonth}
                  onChange={(e) => setFilterMonth(e.target.value)}
                  placeholder="------ --"
                  className="w-full text-xs font-semibold px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 placeholder:text-slate-400 focus:outline-hidden focus:ring-2 focus:ring-sky-500"
                />
                <Calendar className="w-3.5 h-3.5 text-slate-400 absolute right-3 top-2.5 pointer-events-none" />
              </div>
            </div>

            {/* Filter by Date */}
            <div className="lg:col-span-4 space-y-1">
              <label className="text-[11px] font-extrabold uppercase text-slate-400 block tracking-wider">
                Filter by Date:
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={filterDate}
                  onChange={(e) => setFilterDate(e.target.value)}
                  placeholder="mm/dd/yyyy"
                  className="w-full text-xs font-semibold px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 placeholder:text-slate-400 focus:outline-hidden focus:ring-2 focus:ring-sky-500"
                />
                <Calendar className="w-3.5 h-3.5 text-slate-400 absolute right-3 top-2.5 pointer-events-none" />
              </div>
            </div>

            {/* Filter by Status */}
            <div className="lg:col-span-4 space-y-1">
              <label className="text-[11px] font-extrabold uppercase text-slate-400 block tracking-wider">
                Filter by Status:
              </label>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="w-full text-xs font-semibold px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 focus:outline-hidden focus:ring-2 focus:ring-sky-500 cursor-pointer"
              >
                <option value="All Status">All Status</option>
                <option value="Paid">Paid</option>
                <option value="Pending">Pending</option>
                <option value="Processing">Processing</option>
              </select>
            </div>

            {/* Action Buttons: Apply Filters and Reset */}
            <div className="lg:col-span-12 flex items-center gap-2 pt-1">
              <button
                type="submit"
                className="bg-sky-600 hover:bg-sky-700 text-white font-bold text-xs px-4 py-2 rounded-xl flex items-center gap-1.5 transition-colors shadow-sm cursor-pointer"
              >
                <Filter className="w-3.5 h-3.5" />
                <span>Apply Filters</span>
              </button>
              <button
                type="button"
                onClick={handleResetFilters}
                className="text-xs font-semibold text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 px-3 py-2 cursor-pointer transition-colors"
              >
                Reset
              </button>
            </div>
          </form>

          {/* TABLE MATCHING SCREENSHOT 3 */}
          <div className="overflow-x-auto pt-2">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-50/80 dark:bg-slate-800/60 border-b border-slate-200/80 dark:border-slate-800 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                  <th className="py-3 px-4 w-12 text-center">S/N</th>
                  <th className="py-3 px-4">Basic Salary</th>
                  <th className="py-3 px-4">Bonus</th>
                  <th className="py-3 px-4">Deduction</th>
                  <th className="py-3 px-4">Total Salary</th>
                  <th className="py-3 px-4">Salary Month</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Payment Date</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {filteredTransactions.length === 0 ? (
                  <tr>
                    <td
                      colSpan="9"
                      className="py-12 text-center text-slate-400 text-xs"
                    >
                      No transactions found.
                    </td>
                  </tr>
                ) : (
                  filteredTransactions.map((item, idx) => (
                    <tr
                      key={item.id}
                      className="hover:bg-slate-50/70 dark:hover:bg-slate-800/40 transition-colors"
                    >
                      <td className="py-3.5 px-4 text-center font-bold text-slate-400">
                        {idx + 1}
                      </td>
                      <td className="py-3.5 px-4 font-mono font-bold text-slate-900 dark:text-white">
                        Rs. {item.basicSalary?.toLocaleString()}
                      </td>
                      <td className="py-3.5 px-4 font-mono text-emerald-600">
                        +Rs. {item.bonus?.toLocaleString() || 0}
                      </td>
                      <td className="py-3.5 px-4 font-mono text-rose-500">
                        -Rs. {item.deduction?.toLocaleString() || 0}
                      </td>
                      <td className="py-3.5 px-4 font-mono font-black text-sky-600 dark:text-sky-400">
                        Rs. {item.totalSalary?.toLocaleString()}
                      </td>
                      <td className="py-3.5 px-4 font-semibold text-slate-800 dark:text-slate-200">
                        {item.salaryMonth}
                      </td>
                      <td className="py-3.5 px-4">
                        <span
                          className={`inline-block px-2.5 py-0.5 rounded-full text-[11px] font-bold ${
                            item.status === 'Paid'
                              ? 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300'
                              : 'bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300'
                          }`}
                        >
                          {item.status}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-slate-600 dark:text-slate-400">
                        {item.paymentDate}
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <button
                          type="button"
                          onClick={() => setViewingPayslip(item)}
                          className="px-2.5 py-1 text-xs font-semibold rounded-lg bg-sky-50 dark:bg-sky-950/60 text-sky-600 hover:bg-sky-100 transition-colors cursor-pointer"
                        >
                          View Slip
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

      {/* ========================================================= */}
      {/* 3. OFFICIAL PAYSLIP VOUCHER MODAL */}
      {/* ========================================================= */}
      {viewingPayslip && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl w-full max-w-lg shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
            <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
              <span className="font-extrabold text-sm text-slate-900 dark:text-white">
                Official Salary Slip — {viewingPayslip.salaryMonth}
              </span>
              <button
                type="button"
                onClick={() => setViewingPayslip(null)}
                className="text-slate-400 hover:text-slate-700 dark:hover:text-white cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-6 space-y-4 overflow-y-auto">
              <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
                <div>
                  <h4 className="text-base font-black text-slate-900 dark:text-white">
                    {teacherName}
                  </h4>
                  <p className="text-xs text-slate-400">Designation: Senior Faculty</p>
                </div>
                <div className="text-right">
                  <span className="text-xs font-bold text-emerald-600 bg-emerald-50 dark:bg-emerald-950/40 px-2.5 py-1 rounded-full border border-emerald-200 dark:border-emerald-800">
                    Status: {viewingPayslip.status}
                  </span>
                </div>
              </div>

              <div className="space-y-2 text-xs">
                <div className="flex justify-between py-1 border-b border-slate-50 dark:border-slate-800">
                  <span className="text-slate-500">Basic Salary:</span>
                  <span className="font-bold">Rs. {viewingPayslip.basicSalary?.toLocaleString()}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-50 dark:border-slate-800">
                  <span className="text-slate-500">Bonus & Allowances:</span>
                  <span className="font-bold text-emerald-600">+Rs. {viewingPayslip.bonus?.toLocaleString() || 0}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-50 dark:border-slate-800">
                  <span className="text-slate-500">Deductions (Leaves / Tax):</span>
                  <span className="font-bold text-rose-500">-Rs. {viewingPayslip.deduction?.toLocaleString() || 0}</span>
                </div>
                <div className="flex justify-between py-2 text-sm font-black border-t border-slate-200 dark:border-slate-700">
                  <span className="text-slate-900 dark:text-white">Net Payable Salary:</span>
                  <span className="text-blue-600 dark:text-blue-400">Rs. {viewingPayslip.totalSalary?.toLocaleString()}</span>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => window.print()}
                  className="px-4 py-2 rounded-xl text-xs font-bold bg-sky-600 hover:bg-sky-700 text-white flex items-center gap-1.5 shadow-sm transition-colors cursor-pointer"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>Print Slip</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
