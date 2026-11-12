import React, { useState, useMemo, useEffect } from 'react'
import {
  ArrowLeft,
  FileText,
  UserPlus,
  CreditCard,
  Receipt,
  ArrowDownCircle,
  MessageSquare,
  Plus,
  Settings,
  Clock,
  Gavel,
  X
} from 'lucide-react'
import { useAppData } from '../../../context/AppDataContext'
import { useToast } from '../../../context/ToastContext'

const fmtPkr = (n) => `PKR ${Number(n || 0).toLocaleString()}`

const formatDisplayDate = (iso) => {
  if (!iso) return '—'
  const dt = new Date(`${String(iso).slice(0, 10)}T12:00:00`)
  if (Number.isNaN(dt.getTime())) return String(iso).slice(0, 10)
  return dt.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })
}

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
        onClick={() => (onOpenSendSms ? onOpenSendSms() : onRouteChange?.('inst-comm-sms'))}
        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 text-xs font-semibold shadow-sm transition-colors cursor-pointer"
      >
        <MessageSquare className="w-3.5 h-3.5" />
        <span>Send SMS</span>
      </button>
    </div>
  </div>
)

export const StaffLoansAndFinesViews = ({
  mode = 'loans', // 'loans' | 'fines'
  currentInstitute,
  onRouteChange,
  onOpenQuickPayment,
  onOpenSendSms
}) => {
  const { teachers = [], users = [] } = useAppData()
  const { toast } = useToast()
  const instId = currentInstitute?.id || 'inst-1'

  const loansKey = `sms_campus_staff_loans_${instId}`
  const finesKey = `sms_campus_staff_fines_${instId}`
  const fineSettingsKey = `sms_campus_staff_fine_settings_${instId}`

  const campusStaff = useMemo(() => {
    const instTeachers = teachers.filter((t) => !t.instituteId || t.instituteId === instId)
    const instUsers = users.filter(
      (u) =>
        (!u.instituteId || u.instituteId === instId) &&
        !['student', 'parent', 'superadmin'].includes(String(u.role || '').toLowerCase())
    )
    const map = new Map()
    instTeachers.forEach((t) => {
      map.set(t.id, { id: t.id, name: t.name || 'Staff Member', role: t.role || 'Teacher' })
    })
    instUsers.forEach((u) => {
      if (!map.has(u.id)) {
        map.set(u.id, { id: u.id, name: u.name || 'Admin', role: u.role || 'Admin' })
      }
    })
    return [...map.values()]
  }, [teachers, users, instId])

  // ==========================
  // LOANS & ADVANCES STATE
  // ==========================
  const [loans, setLoans] = useState(() => {
    try {
      const saved = JSON.parse(localStorage.getItem(loansKey) || '[]')
      return Array.isArray(saved) ? saved : []
    } catch {
      return []
    }
  })
  const [loanFilters, setLoanFilters] = useState({ employeeId: 'all', status: 'all' })
  const [appliedLoanFilters, setAppliedLoanFilters] = useState({ employeeId: 'all', status: 'all' })
  const [addLoanOpen, setAddLoanOpen] = useState(false)
  const [loanForm, setLoanForm] = useState({
    employeeId: '',
    type: 'Salary Advance',
    amount: '',
    installment: '',
    issueDate: new Date().toISOString().slice(0, 10),
    notes: ''
  })

  // ==========================
  // STAFF FINES STATE
  // ==========================
  const [fines, setFines] = useState(() => {
    try {
      const saved = JSON.parse(localStorage.getItem(finesKey) || '[]')
      return Array.isArray(saved) ? saved : []
    } catch {
      return []
    }
  })
  const [fineSettings, setFineSettings] = useState(() => {
    try {
      const saved = JSON.parse(localStorage.getItem(fineSettingsKey) || 'null')
      if (saved) return saved
    } catch {}
    return { absentFine: 200, lateFine: 100, graceMinutes: 15, autoDeductPayroll: true }
  })
  const [fineFilters, setFineFilters] = useState({
    month: '',
    from: '',
    to: '',
    employeeId: 'all',
    status: 'all',
    fineType: 'all',
    source: 'all'
  })
  const [appliedFineFilters, setAppliedFineFilters] = useState({
    month: '',
    from: '',
    to: '',
    employeeId: 'all',
    status: 'all',
    fineType: 'all',
    source: 'all'
  })
  const [addFineOpen, setAddFineOpen] = useState(false)
  const [fineSettingsOpen, setFineSettingsOpen] = useState(false)
  const [generateFinesOpen, setGenerateFinesOpen] = useState(false)

  const [fineForm, setFineForm] = useState({
    employeeId: '',
    fineType: 'Manual Fine',
    amount: '',
    date: new Date().toISOString().slice(0, 10),
    reason: '',
    status: 'Pending'
  })

  const [genForm, setGenForm] = useState({
    employeeId: '',
    month: new Date().toISOString().slice(0, 7),
    absentDays: '1',
    lateDays: '0'
  })

  useEffect(() => {
    try {
      const l = JSON.parse(localStorage.getItem(loansKey) || '[]')
      setLoans(Array.isArray(l) ? l : [])
    } catch {
      setLoans([])
    }
    try {
      const f = JSON.parse(localStorage.getItem(finesKey) || '[]')
      setFines(Array.isArray(f) ? f : [])
    } catch {
      setFines([])
    }
  }, [instId, loansKey, finesKey])

  const persistLoans = (next) => {
    setLoans(next)
    try {
      localStorage.setItem(loansKey, JSON.stringify(next))
    } catch {}
  }

  const persistFines = (next) => {
    setFines(next)
    try {
      localStorage.setItem(finesKey, JSON.stringify(next))
    } catch {}
  }

  const persistFineSettings = (next) => {
    setFineSettings(next)
    try {
      localStorage.setItem(fineSettingsKey, JSON.stringify(next))
    } catch {}
  }

  // ==========================
  // LOANS & ADVANCES HANDLERS
  // ==========================
  const filteredLoans = useMemo(() => {
    return loans.filter((l) => {
      if (appliedLoanFilters.employeeId !== 'all' && l.employeeId !== appliedLoanFilters.employeeId) {
        return false
      }
      if (appliedLoanFilters.status !== 'all' && l.status !== appliedLoanFilters.status) {
        return false
      }
      return true
    })
  }, [loans, appliedLoanFilters])

  const handleSaveLoan = (e) => {
    e.preventDefault()
    const staff = campusStaff.find((s) => s.id === loanForm.employeeId)
    if (!staff) {
      toast.error('Please select an employee.')
      return
    }
    const amount = Number(loanForm.amount || 0)
    const installment = Number(loanForm.installment || 0)
    if (amount <= 0) {
      toast.error('Enter a valid loan/advance amount.')
      return
    }
    const newLoan = {
      id: `LOAN-${Date.now()}`,
      employeeId: staff.id,
      employeeName: staff.name,
      type: loanForm.type,
      amount,
      remaining: amount,
      installment: installment > 0 ? installment : amount,
      issueDate: loanForm.issueDate,
      status: 'Active',
      notes: loanForm.notes.trim()
    }
    persistLoans([newLoan, ...loans])
    toast.success(`${loanForm.type} of ${fmtPkr(amount)} recorded for ${staff.name}.`)
    setAddLoanOpen(false)
    setLoanForm({
      employeeId: '',
      type: 'Salary Advance',
      amount: '',
      installment: '',
      issueDate: new Date().toISOString().slice(0, 10),
      notes: ''
    })
  }

  // ==========================
  // STAFF FINES HANDLERS
  // ==========================
  const filteredFines = useMemo(() => {
    return fines.filter((f) => {
      if (appliedFineFilters.month && !String(f.date || '').startsWith(appliedFineFilters.month)) {
        return false
      }
      if (appliedFineFilters.from && String(f.date || '') < appliedFineFilters.from) {
        return false
      }
      if (appliedFineFilters.to && String(f.date || '') > appliedFineFilters.to) {
        return false
      }
      if (appliedFineFilters.employeeId !== 'all' && f.employeeId !== appliedFineFilters.employeeId) {
        return false
      }
      if (appliedFineFilters.status !== 'all' && f.status !== appliedFineFilters.status) {
        return false
      }
      if (appliedFineFilters.fineType !== 'all' && f.fineType !== appliedFineFilters.fineType) {
        return false
      }
      if (appliedFineFilters.source !== 'all' && f.source !== appliedFineFilters.source) {
        return false
      }
      return true
    })
  }, [fines, appliedFineFilters])

  const fineSummary = useMemo(() => {
    const total = filteredFines.reduce((s, f) => s + Number(f.amount || 0), 0)
    const outstanding = filteredFines
      .filter((f) => f.status === 'Pending')
      .reduce((s, f) => s + Number(f.outstanding ?? f.amount ?? 0), 0)
    const waived = filteredFines
      .filter((f) => f.status === 'Waived')
      .reduce((s, f) => s + Number(f.amount || 0), 0)
    return { count: filteredFines.length, total, outstanding, waived }
  }, [filteredFines])

  const applyQuickMonth = (offset) => {
    const d = new Date()
    d.setMonth(d.getMonth() + offset)
    const ym = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
    setFineFilters((p) => ({ ...p, month: ym, from: '', to: '' }))
    setAppliedFineFilters((p) => ({ ...p, month: ym, from: '', to: '' }))
  }

  const handleSaveFine = (e) => {
    e.preventDefault()
    const staff = campusStaff.find((s) => s.id === fineForm.employeeId)
    if (!staff) {
      toast.error('Please select an employee.')
      return
    }
    const amount = Number(fineForm.amount || 0)
    if (amount <= 0) {
      toast.error('Enter a valid fine amount.')
      return
    }
    const newFine = {
      id: `FINE-${Date.now()}`,
      employeeId: staff.id,
      employeeName: staff.name,
      fineType: fineForm.fineType,
      reason: fineForm.reason.trim(),
      amount,
      outstanding: fineForm.status === 'Pending' ? amount : 0,
      date: fineForm.date,
      status: fineForm.status,
      source: 'Manual',
      createdBy: 'Admin'
    }
    persistFines([newFine, ...fines])
    toast.success(`Fine of ${fmtPkr(amount)} added for ${staff.name}.`)
    setAddFineOpen(false)
    setFineForm({
      employeeId: '',
      fineType: 'Manual Fine',
      amount: '',
      date: new Date().toISOString().slice(0, 10),
      reason: '',
      status: 'Pending'
    })
  }

  const handleGenerateAttendanceFines = (e) => {
    e.preventDefault()
    const staff = campusStaff.find((s) => s.id === genForm.employeeId)
    if (!staff) {
      toast.error('Please select an employee.')
      return
    }
    const absentDays = Math.max(0, Number(genForm.absentDays || 0))
    const lateDays = Math.max(0, Number(genForm.lateDays || 0))
    const generated = []
    if (absentDays > 0) {
      const amt = absentDays * Number(fineSettings.absentFine || 200)
      generated.push({
        id: `FINE-ABS-${Date.now()}`,
        employeeId: staff.id,
        employeeName: staff.name,
        fineType: 'Absent',
        reason: `${absentDays} absent day(s) in ${genForm.month}`,
        amount: amt,
        outstanding: amt,
        date: `${genForm.month}-01`,
        status: 'Pending',
        source: 'Auto',
        createdBy: 'System Auto'
      })
    }
    if (lateDays > 0) {
      const amt = lateDays * Number(fineSettings.lateFine || 100)
      generated.push({
        id: `FINE-LATE-${Date.now() + 1}`,
        employeeId: staff.id,
        employeeName: staff.name,
        fineType: 'Late Arrival',
        reason: `${lateDays} late arrival(s) in ${genForm.month}`,
        amount: amt,
        outstanding: amt,
        date: `${genForm.month}-01`,
        status: 'Pending',
        source: 'Auto',
        createdBy: 'System Auto'
      })
    }
    if (generated.length === 0) {
      toast.error('Enter at least 1 absent or late day to generate fines.')
      return
    }
    persistFines([...generated, ...fines])
    toast.success(`Generated ${generated.length} attendance fine(s) for ${staff.name}.`)
    setGenerateFinesOpen(false)
  }

  // ==========================
  // RENDER: STAFF FINES (Pick 2)
  // ==========================
  if (mode === 'fines') {
    return (
      <div className="space-y-4">
        <QuickHeader
          title="Staff Fines"
          onBack={() => onRouteChange?.('inst-teachers')}
          onRouteChange={onRouteChange}
          onOpenQuickPayment={onOpenQuickPayment}
          onOpenSendSms={onOpenSendSms}
        />

        <div className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-visible">
          <div className="px-5 py-3.5 flex flex-wrap items-center justify-between gap-3 border-b border-slate-100">
            <div className="flex items-center gap-2 text-sm font-semibold text-slate-800">
              <Gavel className="w-4 h-4 text-slate-600" />
              <span>Staff Fines</span>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={() => setFineSettingsOpen(true)}
                className="px-3 py-1.5 rounded-lg border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold inline-flex items-center gap-1.5 cursor-pointer"
              >
                <Settings className="w-3.5 h-3.5" />
                <span>Attendance Fine Settings</span>
              </button>
              <button
                type="button"
                onClick={() => setGenerateFinesOpen(true)}
                className="px-3 py-1.5 rounded-lg bg-orange-500 hover:bg-orange-600 text-white text-xs font-semibold inline-flex items-center gap-1.5 cursor-pointer"
              >
                <Clock className="w-3.5 h-3.5" />
                <span>Generate Fines</span>
              </button>
              <button
                type="button"
                onClick={() => setAddFineOpen(true)}
                className="px-3 py-1.5 rounded-lg bg-sky-500 hover:bg-sky-600 text-white text-xs font-semibold inline-flex items-center gap-1.5 cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Fine</span>
              </button>
            </div>
          </div>

          <div className="p-5 space-y-4">
            {/* Filters */}
            <div className="space-y-2.5">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-2.5 items-end">
                <div className="lg:col-span-2">
                  <label className="block text-[11px] font-medium text-slate-600 mb-1">Month</label>
                  <input
                    type="month"
                    value={fineFilters.month}
                    onChange={(e) => setFineFilters((p) => ({ ...p, month: e.target.value }))}
                    className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 text-xs text-slate-700"
                  />
                </div>
                <div className="lg:col-span-1">
                  <label className="block text-[11px] font-medium text-slate-600 mb-1">From</label>
                  <input
                    type="date"
                    value={fineFilters.from}
                    onChange={(e) => setFineFilters((p) => ({ ...p, from: e.target.value }))}
                    className="w-full px-2 py-1.5 rounded-lg border border-slate-200 text-xs text-slate-700"
                  />
                </div>
                <div className="lg:col-span-1">
                  <label className="block text-[11px] font-medium text-slate-600 mb-1">To</label>
                  <input
                    type="date"
                    value={fineFilters.to}
                    onChange={(e) => setFineFilters((p) => ({ ...p, to: e.target.value }))}
                    className="w-full px-2 py-1.5 rounded-lg border border-slate-200 text-xs text-slate-700"
                  />
                </div>
                <div className="lg:col-span-2">
                  <label className="block text-[11px] font-medium text-slate-600 mb-1">
                    Employee
                  </label>
                  <select
                    value={fineFilters.employeeId}
                    onChange={(e) => setFineFilters((p) => ({ ...p, employeeId: e.target.value }))}
                    className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 text-xs text-slate-700 bg-white"
                  >
                    <option value="all">All employees</option>
                    {campusStaff.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="lg:col-span-1">
                  <label className="block text-[11px] font-medium text-slate-600 mb-1">Status</label>
                  <select
                    value={fineFilters.status}
                    onChange={(e) => setFineFilters((p) => ({ ...p, status: e.target.value }))}
                    className="w-full px-2 py-1.5 rounded-lg border border-slate-200 text-xs text-slate-700 bg-white"
                  >
                    <option value="all">All</option>
                    <option value="Pending">Pending</option>
                    <option value="Paid">Paid</option>
                    <option value="Waived">Waived</option>
                  </select>
                </div>
                <div className="lg:col-span-2">
                  <label className="block text-[11px] font-medium text-slate-600 mb-1">
                    Fine type
                  </label>
                  <select
                    value={fineFilters.fineType}
                    onChange={(e) => setFineFilters((p) => ({ ...p, fineType: e.target.value }))}
                    className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 text-xs text-slate-700 bg-white"
                  >
                    <option value="all">All types</option>
                    <option value="Manual Fine">Manual Fine</option>
                    <option value="Absent">Absent</option>
                    <option value="Late Arrival">Late Arrival</option>
                    <option value="Policy Violation">Policy Violation</option>
                  </select>
                </div>
                <div className="lg:col-span-2">
                  <label className="block text-[11px] font-medium text-slate-600 mb-1">Source</label>
                  <select
                    value={fineFilters.source}
                    onChange={(e) => setFineFilters((p) => ({ ...p, source: e.target.value }))}
                    className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 text-xs text-slate-700 bg-white"
                  >
                    <option value="all">Any</option>
                    <option value="Manual">Manual</option>
                    <option value="Auto">Auto</option>
                  </select>
                </div>
                <div className="lg:col-span-1 flex justify-end">
                  <button
                    type="button"
                    onClick={() => setAppliedFineFilters({ ...fineFilters })}
                    className="w-full px-3 py-1.5 rounded-lg bg-sky-500 hover:bg-sky-600 text-white text-xs font-semibold cursor-pointer"
                  >
                    Filter
                  </button>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={() => applyQuickMonth(0)}
                  className="px-3 py-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-xs font-medium text-slate-700 cursor-pointer"
                >
                  This month
                </button>
                <button
                  type="button"
                  onClick={() => applyQuickMonth(-1)}
                  className="px-3 py-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-xs font-medium text-slate-700 cursor-pointer"
                >
                  Last month
                </button>
                {(appliedFineFilters.month ||
                  appliedFineFilters.from ||
                  appliedFineFilters.employeeId !== 'all' ||
                  appliedFineFilters.status !== 'all') && (
                  <button
                    type="button"
                    onClick={() => {
                      const empty = {
                        month: '',
                        from: '',
                        to: '',
                        employeeId: 'all',
                        status: 'all',
                        fineType: 'all',
                        source: 'all'
                      }
                      setFineFilters(empty)
                      setAppliedFineFilters(empty)
                    }}
                    className="px-2.5 py-1.5 rounded-lg text-xs text-slate-500 hover:text-slate-800 cursor-pointer"
                  >
                    Clear filters
                  </button>
                )}
              </div>
            </div>

            {/* Summary Metrics Line */}
            <div className="flex flex-wrap items-center gap-4 text-xs text-slate-600">
              <span>{fineSummary.count} fine(s)</span>
              <span>
                Total <strong className="text-slate-900">{fmtPkr(fineSummary.total)}</strong>
              </span>
              <span>
                Outstanding{' '}
                <strong className="text-rose-600">{fmtPkr(fineSummary.outstanding)}</strong>
              </span>
              <span>
                Waived <strong className="text-emerald-600">{fmtPkr(fineSummary.waived)}</strong>
              </span>
            </div>

            {/* Fines Table */}
            <div className="overflow-x-auto border border-slate-200 rounded-lg">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-xs font-semibold text-slate-700">
                    <th className="py-2.5 px-3 w-12">#</th>
                    <th className="py-2.5 px-3">Employee</th>
                    <th className="py-2.5 px-3">Fine Type</th>
                    <th className="py-2.5 px-3">Amount</th>
                    <th className="py-2.5 px-3">Outstanding</th>
                    <th className="py-2.5 px-3">Date</th>
                    <th className="py-2.5 px-3">Status</th>
                    <th className="py-2.5 px-3">Created By</th>
                    <th className="py-2.5 px-3">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-xs text-slate-700">
                  {filteredFines.length === 0 ? (
                    <tr>
                      <td colSpan={9} className="py-10 text-center text-slate-400">
                        No staff fines found. Click{' '}
                        <button
                          type="button"
                          onClick={() => setAddFineOpen(true)}
                          className="text-sky-600 font-semibold hover:underline cursor-pointer"
                        >
                          + Add Fine
                        </button>{' '}
                        to record one.
                      </td>
                    </tr>
                  ) : (
                    filteredFines.map((f, idx) => (
                      <tr key={f.id} className="hover:bg-slate-50/70">
                        <td className="py-3 px-3 text-slate-500">{idx + 1}</td>
                        <td className="py-3 px-3 font-medium text-slate-900">{f.employeeName}</td>
                        <td className="py-3 px-3">
                          <div className="font-medium text-slate-800">{f.fineType}</div>
                          {f.reason && (
                            <div className="text-[11px] text-slate-400">{f.reason}</div>
                          )}
                        </td>
                        <td className="py-3 px-3 font-semibold text-slate-800">
                          {fmtPkr(f.amount)}
                        </td>
                        <td className="py-3 px-3 text-slate-700">
                          {fmtPkr(f.outstanding ?? f.amount)}
                        </td>
                        <td className="py-3 px-3 text-slate-600">{formatDisplayDate(f.date)}</td>
                        <td className="py-3 px-3">
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                              f.status === 'Paid'
                                ? 'bg-emerald-500 text-white'
                                : f.status === 'Waived'
                                  ? 'bg-slate-200 text-slate-700'
                                  : 'bg-amber-100 text-amber-800'
                            }`}
                          >
                            {f.status}
                          </span>
                        </td>
                        <td className="py-3 px-3 text-slate-600">{f.createdBy || 'Admin'}</td>
                        <td className="py-3 px-3">
                          <div className="flex items-center gap-1.5">
                            {f.status === 'Pending' && (
                              <>
                                <button
                                  type="button"
                                  onClick={() => {
                                    persistFines(
                                      fines.map((x) =>
                                        x.id === f.id ? { ...x, status: 'Paid', outstanding: 0 } : x
                                      )
                                    )
                                    toast.success('Fine marked as Paid.')
                                  }}
                                  className="px-2 py-1 rounded border border-emerald-400 text-emerald-700 hover:bg-emerald-50 text-[11px] font-semibold cursor-pointer"
                                >
                                  Pay
                                </button>
                                <button
                                  type="button"
                                  onClick={() => {
                                    persistFines(
                                      fines.map((x) =>
                                        x.id === f.id ? { ...x, status: 'Waived', outstanding: 0 } : x
                                      )
                                    )
                                    toast.success('Fine waived.')
                                  }}
                                  className="px-2 py-1 rounded border border-slate-300 text-slate-600 hover:bg-slate-50 text-[11px] font-semibold cursor-pointer"
                                >
                                  Waive
                                </button>
                              </>
                            )}
                            <button
                              type="button"
                              onClick={() => {
                                persistFines(fines.filter((x) => x.id !== f.id))
                                toast.success('Fine deleted.')
                              }}
                              className="px-2 py-1 rounded border border-rose-300 text-rose-600 hover:bg-rose-50 text-[11px] font-semibold cursor-pointer"
                            >
                              Delete
                            </button>
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

        {/* Add Fine Modal */}
        {addFineOpen && (
          <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
            <form
              onSubmit={handleSaveFine}
              className="bg-white rounded-xl border border-slate-200 shadow-2xl max-w-md w-full p-5 space-y-4"
            >
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <h3 className="text-sm font-bold text-slate-900">Add Staff Fine</h3>
                <button
                  type="button"
                  onClick={() => setAddFineOpen(false)}
                  className="p-1 rounded-lg hover:bg-slate-100 text-slate-500 cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
              <div className="space-y-3 text-xs">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Employee *</label>
                  <select
                    value={fineForm.employeeId}
                    onChange={(e) => setFineForm((p) => ({ ...p, employeeId: e.target.value }))}
                    required
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 bg-white"
                  >
                    <option value="">Select Employee...</option>
                    {campusStaff.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Fine Type</label>
                    <select
                      value={fineForm.fineType}
                      onChange={(e) => setFineForm((p) => ({ ...p, fineType: e.target.value }))}
                      className="w-full px-3 py-2 rounded-lg border border-slate-200 bg-white"
                    >
                      <option value="Manual Fine">Manual Fine</option>
                      <option value="Absent">Absent</option>
                      <option value="Late Arrival">Late Arrival</option>
                      <option value="Policy Violation">Policy Violation</option>
                    </select>
                  </div>
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">
                      Amount (PKR) *
                    </label>
                    <input
                      type="number"
                      min="1"
                      value={fineForm.amount}
                      onChange={(e) => setFineForm((p) => ({ ...p, amount: e.target.value }))}
                      required
                      className="w-full px-3 py-2 rounded-lg border border-slate-200"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Date</label>
                    <input
                      type="date"
                      value={fineForm.date}
                      onChange={(e) => setFineForm((p) => ({ ...p, date: e.target.value }))}
                      className="w-full px-3 py-2 rounded-lg border border-slate-200"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Status</label>
                    <select
                      value={fineForm.status}
                      onChange={(e) => setFineForm((p) => ({ ...p, status: e.target.value }))}
                      className="w-full px-3 py-2 rounded-lg border border-slate-200 bg-white"
                    >
                      <option value="Pending">Pending</option>
                      <option value="Paid">Paid</option>
                    </select>
                  </div>
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Reason / Notes</label>
                  <input
                    type="text"
                    value={fineForm.reason}
                    onChange={(e) => setFineForm((p) => ({ ...p, reason: e.target.value }))}
                    placeholder="Reason for fine"
                    className="w-full px-3 py-2 rounded-lg border border-slate-200"
                  />
                </div>
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setAddFineOpen(false)}
                  className="px-3.5 py-1.5 rounded-lg border border-slate-200 text-xs font-semibold text-slate-700 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded-lg bg-sky-600 hover:bg-sky-700 text-white text-xs font-semibold cursor-pointer"
                >
                  Save Fine
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Attendance Fine Settings Modal */}
        {fineSettingsOpen && (
          <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="bg-white rounded-xl border border-slate-200 shadow-2xl max-w-md w-full p-5 space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <h3 className="text-sm font-bold text-slate-900">Attendance Fine Settings</h3>
                <button
                  type="button"
                  onClick={() => setFineSettingsOpen(false)}
                  className="p-1 rounded-lg hover:bg-slate-100 text-slate-500 cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
              <div className="space-y-3 text-xs">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Absent Fine per Day (PKR)
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={fineSettings.absentFine}
                    onChange={(e) =>
                      setFineSettings((p) => ({ ...p, absentFine: Number(e.target.value) }))
                    }
                    className="w-full px-3 py-2 rounded-lg border border-slate-200"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Late Arrival Fine (PKR)
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={fineSettings.lateFine}
                    onChange={(e) =>
                      setFineSettings((p) => ({ ...p, lateFine: Number(e.target.value) }))
                    }
                    className="w-full px-3 py-2 rounded-lg border border-slate-200"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Grace Period (minutes)
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={fineSettings.graceMinutes}
                    onChange={(e) =>
                      setFineSettings((p) => ({ ...p, graceMinutes: Number(e.target.value) }))
                    }
                    className="w-full px-3 py-2 rounded-lg border border-slate-200"
                  />
                </div>
                <label className="flex items-center gap-2 pt-1 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={Boolean(fineSettings.autoDeductPayroll)}
                    onChange={(e) =>
                      setFineSettings((p) => ({ ...p, autoDeductPayroll: e.target.checked }))
                    }
                  />
                  <span className="font-medium text-slate-700">
                    Auto-deduct pending fines in monthly Payroll
                  </span>
                </label>
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setFineSettingsOpen(false)}
                  className="px-3.5 py-1.5 rounded-lg border border-slate-200 text-xs font-semibold text-slate-700 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={() => {
                    persistFineSettings(fineSettings)
                    toast.success('Attendance fine settings saved.')
                    setFineSettingsOpen(false)
                  }}
                  className="px-4 py-1.5 rounded-lg bg-sky-600 hover:bg-sky-700 text-white text-xs font-semibold cursor-pointer"
                >
                  Save Settings
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Generate Attendance Fines Modal */}
        {generateFinesOpen && (
          <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
            <form
              onSubmit={handleGenerateAttendanceFines}
              className="bg-white rounded-xl border border-slate-200 shadow-2xl max-w-md w-full p-5 space-y-4"
            >
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <h3 className="text-sm font-bold text-slate-900">Generate Attendance Fines</h3>
                <button
                  type="button"
                  onClick={() => setGenerateFinesOpen(false)}
                  className="p-1 rounded-lg hover:bg-slate-100 text-slate-500 cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
              <div className="space-y-3 text-xs">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Employee *</label>
                  <select
                    value={genForm.employeeId}
                    onChange={(e) => setGenForm((p) => ({ ...p, employeeId: e.target.value }))}
                    required
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 bg-white"
                  >
                    <option value="">Select Employee...</option>
                    {campusStaff.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Month</label>
                  <input
                    type="month"
                    value={genForm.month}
                    onChange={(e) => setGenForm((p) => ({ ...p, month: e.target.value }))}
                    className="w-full px-3 py-2 rounded-lg border border-slate-200"
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">
                      Absent Days ({fmtPkr(fineSettings.absentFine)}/day)
                    </label>
                    <input
                      type="number"
                      min="0"
                      value={genForm.absentDays}
                      onChange={(e) => setGenForm((p) => ({ ...p, absentDays: e.target.value }))}
                      className="w-full px-3 py-2 rounded-lg border border-slate-200"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">
                      Late Days ({fmtPkr(fineSettings.lateFine)}/day)
                    </label>
                    <input
                      type="number"
                      min="0"
                      value={genForm.lateDays}
                      onChange={(e) => setGenForm((p) => ({ ...p, lateDays: e.target.value }))}
                      className="w-full px-3 py-2 rounded-lg border border-slate-200"
                    />
                  </div>
                </div>
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setGenerateFinesOpen(false)}
                  className="px-3.5 py-1.5 rounded-lg border border-slate-200 text-xs font-semibold text-slate-700 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded-lg bg-orange-500 hover:bg-orange-600 text-white text-xs font-semibold cursor-pointer"
                >
                  Generate Fines
                </button>
              </div>
            </form>
          </div>
        )}
      </div>
    )
  }

  // ==========================
  // RENDER: LOANS & ADVANCES (Pick 1)
  // ==========================
  return (
    <div className="space-y-4">
      <QuickHeader
        title="Staff Loans & Advances"
        onBack={() => onRouteChange?.('inst-teachers')}
        onRouteChange={onRouteChange}
        onOpenQuickPayment={onOpenQuickPayment}
        onOpenSendSms={onOpenSendSms}
      />

      <div className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-visible">
        <div className="px-5 py-3.5 flex flex-wrap items-center justify-between gap-3 border-b border-slate-100">
          <div className="flex items-center gap-2 text-sm font-semibold text-slate-800">
            <CreditCard className="w-4 h-4 text-slate-600" />
            <span>Staff Loans & Advances</span>
          </div>

          <button
            type="button"
            onClick={() => setAddLoanOpen(true)}
            className="px-3.5 py-1.5 rounded-lg bg-sky-500 hover:bg-sky-600 text-white text-xs font-semibold inline-flex items-center gap-1.5 cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Loan / Advance</span>
          </button>
        </div>

        <div className="p-5 space-y-4">
          {/* Filter Bar */}
          <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-end">
            <div className="sm:col-span-5">
              <label className="block text-[11px] font-medium text-slate-600 mb-1">Employee</label>
              <select
                value={loanFilters.employeeId}
                onChange={(e) => setLoanFilters((p) => ({ ...p, employeeId: e.target.value }))}
                className="w-full px-3 py-1.5 rounded-lg border border-slate-200 text-xs text-slate-700 bg-white"
              >
                <option value="all">All employees</option>
                {campusStaff.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="sm:col-span-4">
              <label className="block text-[11px] font-medium text-slate-600 mb-1">Status</label>
              <select
                value={loanFilters.status}
                onChange={(e) => setLoanFilters((p) => ({ ...p, status: e.target.value }))}
                className="w-full px-3 py-1.5 rounded-lg border border-slate-200 text-xs text-slate-700 bg-white"
              >
                <option value="all">All</option>
                <option value="Active">Active</option>
                <option value="Cleared">Cleared</option>
              </select>
            </div>
            <div className="sm:col-span-3">
              <button
                type="button"
                onClick={() => setAppliedLoanFilters({ ...loanFilters })}
                className="w-full px-4 py-1.5 rounded-lg bg-sky-500 hover:bg-sky-600 text-white text-xs font-semibold cursor-pointer"
              >
                Filter
              </button>
            </div>
          </div>

          {/* Loans Table */}
          <div className="overflow-x-auto border border-slate-200 rounded-lg">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-xs font-semibold text-slate-700">
                  <th className="py-2.5 px-3 w-12">#</th>
                  <th className="py-2.5 px-3">Employee</th>
                  <th className="py-2.5 px-3">Type</th>
                  <th className="py-2.5 px-3">Amount</th>
                  <th className="py-2.5 px-3">Remaining</th>
                  <th className="py-2.5 px-3">Installment</th>
                  <th className="py-2.5 px-3">Issue Date</th>
                  <th className="py-2.5 px-3">Status</th>
                  <th className="py-2.5 px-3">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs text-slate-700">
                {filteredLoans.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="py-10 text-center text-slate-400">
                      No staff loans or advances found. Click{' '}
                      <button
                        type="button"
                        onClick={() => setAddLoanOpen(true)}
                        className="text-sky-600 font-semibold hover:underline cursor-pointer"
                      >
                        + Add Loan / Advance
                      </button>{' '}
                      to record one.
                    </td>
                  </tr>
                ) : (
                  filteredLoans.map((l, idx) => (
                    <tr key={l.id} className="hover:bg-slate-50/70">
                      <td className="py-3 px-3 text-slate-500">{idx + 1}</td>
                      <td className="py-3 px-3 font-medium text-slate-900">{l.employeeName}</td>
                      <td className="py-3 px-3 text-slate-700">{l.type}</td>
                      <td className="py-3 px-3 font-semibold text-slate-800">{fmtPkr(l.amount)}</td>
                      <td
                        className={`py-3 px-3 font-semibold ${
                          Number(l.remaining || 0) > 0 ? 'text-rose-600' : 'text-emerald-600'
                        }`}
                      >
                        {fmtPkr(l.remaining)}
                      </td>
                      <td className="py-3 px-3 text-slate-700">{fmtPkr(l.installment)}/mo</td>
                      <td className="py-3 px-3 text-slate-600">{formatDisplayDate(l.issueDate)}</td>
                      <td className="py-3 px-3">
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            l.status === 'Cleared'
                              ? 'bg-emerald-500 text-white'
                              : 'bg-rose-500 text-white'
                          }`}
                        >
                          {l.status}
                        </span>
                      </td>
                      <td className="py-3 px-3">
                        <div className="flex items-center gap-1.5">
                          {l.status === 'Active' && (
                            <button
                              type="button"
                              onClick={() => {
                                persistLoans(
                                  loans.map((x) =>
                                    x.id === l.id ? { ...x, status: 'Cleared', remaining: 0 } : x
                                  )
                                )
                                toast.success(`${l.employeeName}'s ${l.type} cleared.`)
                              }}
                              className="px-2.5 py-1 rounded border border-emerald-500 text-emerald-700 hover:bg-emerald-50 text-[11px] font-semibold cursor-pointer"
                            >
                              Clear
                            </button>
                          )}
                          <button
                            type="button"
                            onClick={() => {
                              persistLoans(loans.filter((x) => x.id !== l.id))
                              toast.success('Loan / advance record deleted.')
                            }}
                            className="px-2.5 py-1 rounded border border-rose-400 text-rose-600 hover:bg-rose-50 text-[11px] font-semibold cursor-pointer"
                          >
                            Delete
                          </button>
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

      {/* Add Loan / Advance Modal */}
      {addLoanOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <form
            onSubmit={handleSaveLoan}
            className="bg-white rounded-xl border border-slate-200 shadow-2xl max-w-md w-full p-5 space-y-4"
          >
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-sm font-bold text-slate-900">Add Loan / Advance</h3>
              <button
                type="button"
                onClick={() => setAddLoanOpen(false)}
                className="p-1 rounded-lg hover:bg-slate-100 text-slate-500 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Employee *</label>
                <select
                  value={loanForm.employeeId}
                  onChange={(e) => setLoanForm((p) => ({ ...p, employeeId: e.target.value }))}
                  required
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 bg-white"
                >
                  <option value="">Select Employee...</option>
                  {campusStaff.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name}
                    </option>
                  ))}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Type</label>
                  <select
                    value={loanForm.type}
                    onChange={(e) => setLoanForm((p) => ({ ...p, type: e.target.value }))}
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 bg-white"
                  >
                    <option value="Salary Advance">Salary Advance</option>
                    <option value="Staff Loan">Staff Loan</option>
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Amount (PKR) *</label>
                  <input
                    type="number"
                    min="1"
                    value={loanForm.amount}
                    onChange={(e) => setLoanForm((p) => ({ ...p, amount: e.target.value }))}
                    required
                    className="w-full px-3 py-2 rounded-lg border border-slate-200"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Monthly Installment (PKR)
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={loanForm.installment}
                    onChange={(e) => setLoanForm((p) => ({ ...p, installment: e.target.value }))}
                    placeholder="e.g., 5000"
                    className="w-full px-3 py-2 rounded-lg border border-slate-200"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Issue Date</label>
                  <input
                    type="date"
                    value={loanForm.issueDate}
                    onChange={(e) => setLoanForm((p) => ({ ...p, issueDate: e.target.value }))}
                    className="w-full px-3 py-2 rounded-lg border border-slate-200"
                  />
                </div>
              </div>
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Notes</label>
                <input
                  type="text"
                  value={loanForm.notes}
                  onChange={(e) => setLoanForm((p) => ({ ...p, notes: e.target.value }))}
                  placeholder="Optional remarks"
                  className="w-full px-3 py-2 rounded-lg border border-slate-200"
                />
              </div>
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setAddLoanOpen(false)}
                className="px-3.5 py-1.5 rounded-lg border border-slate-200 text-xs font-semibold text-slate-700 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-1.5 rounded-lg bg-sky-600 hover:bg-sky-700 text-white text-xs font-semibold cursor-pointer"
              >
                Save Loan / Advance
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  )
}

export default StaffLoansAndFinesViews
