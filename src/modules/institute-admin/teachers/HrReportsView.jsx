import React, { useState, useMemo, useEffect } from 'react'
import {
  ArrowLeft,
  FileText,
  UserPlus,
  CreditCard,
  Receipt,
  ArrowDownCircle,
  MessageSquare,
  BarChart3,
  Filter,
  Gavel,
  Users,
  Download,
  BookOpen
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

const getMonthRange = (year, monthIndex) => {
  const from = new Date(year, monthIndex, 1)
  const to = new Date(year, monthIndex + 1, 0)
  const pad = (n) => String(n).padStart(2, '0')
  return {
    from: `${from.getFullYear()}-${pad(from.getMonth() + 1)}-${pad(from.getDate())}`,
    to: `${to.getFullYear()}-${pad(to.getMonth() + 1)}-${pad(to.getDate())}`
  }
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

export const HrReportsView = ({
  currentInstitute,
  onRouteChange,
  onOpenQuickPayment,
  onOpenSendSms
}) => {
  const { toast } = useToast()
  const instId = currentInstitute?.id || 'inst-1'
  const instName = currentInstitute?.name || 'Institute'

  const salaryPaymentsKey = `sms_campus_salary_payments_${instId}`
  const loansKey = `sms_campus_staff_loans_${instId}`
  const finesKey = `sms_campus_staff_fines_${instId}`

  const [salaryPayments, setSalaryPayments] = useState([])
  const [loans, setLoans] = useState([])
  const [fines, setFines] = useState([])

  const now = new Date()
  const defaultRange = getMonthRange(now.getFullYear(), now.getMonth())

  const [monthInput, setMonthInput] = useState('')
  const [fromDate, setFromDate] = useState(defaultRange.from)
  const [toDate, setToDate] = useState(defaultRange.to)
  const [appliedRange, setAppliedRange] = useState(defaultRange)

  useEffect(() => {
    try {
      const sp = JSON.parse(localStorage.getItem(salaryPaymentsKey) || '[]')
      setSalaryPayments(Array.isArray(sp) ? sp : [])
    } catch {
      setSalaryPayments([])
    }
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
  }, [instId, salaryPaymentsKey, loansKey, finesKey])

  const applyQuickRange = (preset) => {
    const d = new Date()
    let next = defaultRange
    if (preset === 'this_month') {
      next = getMonthRange(d.getFullYear(), d.getMonth())
    } else if (preset === 'last_month') {
      const lm = new Date(d.getFullYear(), d.getMonth() - 1, 1)
      next = getMonthRange(lm.getFullYear(), lm.getMonth())
    } else if (preset === 'this_year') {
      next = { from: `${d.getFullYear()}-01-01`, to: `${d.getFullYear()}-12-31` }
    } else if (preset === 'last_year') {
      const ly = d.getFullYear() - 1
      next = { from: `${ly}-01-01`, to: `${ly}-12-31` }
    }
    setMonthInput('')
    setFromDate(next.from)
    setToDate(next.to)
    setAppliedRange(next)
  }

  const handleApply = () => {
    if (monthInput) {
      const [y, m] = monthInput.split('-').map(Number)
      if (y && m) {
        const range = getMonthRange(y, m - 1)
        setFromDate(range.from)
        setToDate(range.to)
        setAppliedRange(range)
        return
      }
    }
    setAppliedRange({ from: fromDate, to: toDate })
  }

  const periodLabel = `${formatDisplayDate(appliedRange.from)} – ${formatDisplayDate(appliedRange.to)}`

  // Filter records by appliedRange
  const periodSlips = useMemo(() => {
    const fromYm = appliedRange.from.slice(0, 7)
    const toYm = appliedRange.to.slice(0, 7)
    return salaryPayments.filter((p) => {
      const ym = String(p.salaryMonth || p.createdAt || '').slice(0, 7)
      return (!fromYm || ym >= fromYm) && (!toYm || ym <= toYm)
    })
  }, [salaryPayments, appliedRange])

  const periodFines = useMemo(() => {
    return fines.filter((f) => {
      const dt = String(f.date || '').slice(0, 10)
      return (!appliedRange.from || dt >= appliedRange.from) && (!appliedRange.to || dt <= appliedRange.to)
    })
  }, [fines, appliedRange])

  const periodLoans = useMemo(() => {
    return loans.filter((l) => {
      const dt = String(l.issueDate || '').slice(0, 10)
      return (!appliedRange.from || dt >= appliedRange.from) && (!appliedRange.to || dt <= appliedRange.to)
    })
  }, [loans, appliedRange])

  const kpis = useMemo(() => {
    const netPaid = periodSlips.reduce((s, p) => s + Number(p.total || 0), 0)
    const finesDeducted = periodSlips.reduce((s, p) => s + Number(p.fine || 0), 0)
    const loanDeducted = periodSlips.reduce((s, p) => s + Number(p.deduction || 0), 0)

    const finesIssued = periodFines.reduce((s, f) => s + Number(f.amount || 0), 0)
    const finesWaived = periodFines
      .filter((f) => f.status === 'Waived')
      .reduce((s, f) => s + Number(f.amount || 0), 0)
    const allTimePendingFines = fines
      .filter((f) => f.status === 'Pending')
      .reduce((s, f) => s + Number(f.outstanding ?? f.amount ?? 0), 0)

    const activeLoans = loans.filter((l) => l.status === 'Active')
    const allTimeOutstandingLoans = activeLoans.reduce(
      (s, l) => s + Number(l.remaining ?? l.amount ?? 0),
      0
    )
    const loansIssuedPeriod = periodLoans.reduce((s, l) => s + Number(l.amount || 0), 0)

    return {
      netPaid,
      slipCount: periodSlips.length,
      finesDeducted,
      loanDeducted,
      finesIssued,
      finesWaived,
      allTimePendingFines,
      activeLoanCount: activeLoans.length,
      allTimeOutstandingLoans,
      loansIssuedPeriod
    }
  }, [periodSlips, periodFines, periodLoans, fines, loans])

  const staffSummaryRows = useMemo(() => {
    const map = new Map()
    const ensure = (id, name) => {
      const key = id || name
      if (!map.has(key)) {
        map.set(key, {
          id: key,
          name: name || 'Staff Member',
          slips: 0,
          netPaid: 0,
          loanDeducted: 0,
          finesDeducted: 0,
          finesIssued: 0,
          waived: 0,
          pendingFines: 0
        })
      }
      return map.get(key)
    }

    periodSlips.forEach((p) => {
      const row = ensure(p.staffId, p.employeeName)
      row.slips += 1
      row.netPaid += Number(p.total || 0)
      row.loanDeducted += Number(p.deduction || 0)
      row.finesDeducted += Number(p.fine || 0)
    })

    periodFines.forEach((f) => {
      const row = ensure(f.employeeId, f.employeeName)
      row.finesIssued += Number(f.amount || 0)
      if (f.status === 'Waived') row.waived += Number(f.amount || 0)
    })

    fines
      .filter((f) => f.status === 'Pending')
      .forEach((f) => {
        const row = ensure(f.employeeId, f.employeeName)
        row.pendingFines += Number(f.outstanding ?? f.amount ?? 0)
      })

    return [...map.values()].filter(
      (r) =>
        r.slips > 0 ||
        r.netPaid > 0 ||
        r.loanDeducted > 0 ||
        r.finesDeducted > 0 ||
        r.finesIssued > 0 ||
        r.waived > 0 ||
        r.pendingFines > 0
    )
  }, [periodSlips, periodFines, fines])

  const exportCsv = (filename, headers, rows) => {
    const esc = (v) => `"${String(v ?? '').replace(/"/g, '""')}"`
    const csv = [headers.map(esc).join(','), ...rows.map((r) => r.map(esc).join(','))].join('\n')
    const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = filename
    a.click()
    URL.revokeObjectURL(url)
  }

  const handleDownloadPayrollPdf = () => {
    downloadSimplePdf({
      title: `${instName} — Payroll Report`,
      subtitle: `Period: ${periodLabel} | Slips: ${periodSlips.length} | Net Paid: ${fmtPkr(kpis.netPaid)}`,
      columns: ['Employee', 'Month', 'Basic', 'Bonus', 'Deduction', 'Fine', 'Net Paid', 'Status'],
      rows: periodSlips.map((p) => [
        p.employeeName,
        p.salaryMonth,
        fmtPkr(p.basic),
        fmtPkr(p.bonus),
        fmtPkr(p.deduction),
        fmtPkr(p.fine || 0),
        fmtPkr(p.total),
        p.status
      ]),
      filename: `hr-payroll-report-${instId}.pdf`
    })
    toast.success('Payroll report PDF downloaded.')
  }

  const handleDownloadPayrollCsv = () => {
    exportCsv(
      `hr-payroll-report-${instId}.csv`,
      ['Employee', 'Role', 'Month', 'Basic', 'Bonus', 'Deduction', 'Fine', 'Net Paid', 'Status'],
      periodSlips.map((p) => [
        p.employeeName,
        p.employeeRole,
        p.salaryMonth,
        p.basic,
        p.bonus,
        p.deduction,
        p.fine || 0,
        p.total,
        p.status
      ])
    )
    toast.success('Payroll report CSV downloaded.')
  }

  const handleDownloadLoansCsv = () => {
    exportCsv(
      `hr-loans-report-${instId}.csv`,
      ['Employee', 'Type', 'Amount', 'Remaining', 'Monthly Installment', 'Issue Date', 'Status'],
      periodLoans.map((l) => [
        l.employeeName,
        l.type,
        l.amount,
        l.remaining,
        l.installment,
        l.issueDate,
        l.status
      ])
    )
    toast.success('Loans report CSV downloaded.')
  }

  const handleDownloadFinesCsv = () => {
    exportCsv(
      `hr-staff-fines-report-${instId}.csv`,
      ['Employee', 'Fine Type', 'Amount', 'Outstanding', 'Date', 'Status', 'Reason'],
      periodFines.map((f) => [
        f.employeeName,
        f.fineType,
        f.amount,
        f.outstanding ?? f.amount,
        f.date,
        f.status,
        f.reason || ''
      ])
    )
    toast.success('Staff fines report CSV downloaded.')
  }

  return (
    <div className="space-y-4">
      <QuickHeader
        title="HR Reports"
        onBack={() => onRouteChange?.('inst-teachers')}
        onRouteChange={onRouteChange}
        onOpenQuickPayment={onOpenQuickPayment}
        onOpenSendSms={onOpenSendSms}
      />

      {/* Top Filter Card */}
      <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-2xs space-y-4">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2 text-sm font-bold text-slate-800">
              <BarChart3 className="w-4 h-4 text-slate-600" />
              <span>HR Reports</span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Salaries, deductions and dues. Showing <strong className="text-slate-700">{periodLabel}</strong>.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => onRouteChange?.('inst-payroll')}
              className="px-3 py-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold inline-flex items-center gap-1.5 cursor-pointer"
            >
              <CreditCard className="w-3.5 h-3.5" />
              <span>Pay salary</span>
            </button>
            <button
              type="button"
              onClick={() => onRouteChange?.('inst-staff-fines')}
              className="px-3 py-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold inline-flex items-center gap-1.5 cursor-pointer"
            >
              <Gavel className="w-3.5 h-3.5" />
              <span>Staff fines</span>
            </button>
            <button
              type="button"
              onClick={() => onRouteChange?.('inst-staff-loans')}
              className="px-3 py-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold inline-flex items-center gap-1.5 cursor-pointer"
            >
              <CreditCard className="w-3.5 h-3.5" />
              <span>Loans</span>
            </button>
            <button
              type="button"
              onClick={() => onRouteChange?.('inst-teachers')}
              className="px-3 py-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold inline-flex items-center gap-1.5 cursor-pointer"
            >
              <BookOpen className="w-3.5 h-3.5" />
              <span>Staff ledger</span>
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-end">
          <div className="sm:col-span-3">
            <label className="block text-[11px] font-medium text-slate-600 mb-1">Month</label>
            <input
              type="month"
              value={monthInput}
              onChange={(e) => setMonthInput(e.target.value)}
              className="w-full px-3 py-1.5 rounded-lg border border-slate-200 text-xs text-slate-700"
            />
          </div>
          <div className="sm:col-span-3">
            <label className="block text-[11px] font-medium text-slate-600 mb-1">From</label>
            <input
              type="date"
              value={fromDate}
              onChange={(e) => {
                setMonthInput('')
                setFromDate(e.target.value)
              }}
              className="w-full px-3 py-1.5 rounded-lg border border-slate-200 text-xs text-slate-700"
            />
          </div>
          <div className="sm:col-span-3">
            <label className="block text-[11px] font-medium text-slate-600 mb-1">To</label>
            <input
              type="date"
              value={toDate}
              onChange={(e) => {
                setMonthInput('')
                setToDate(e.target.value)
              }}
              className="w-full px-3 py-1.5 rounded-lg border border-slate-200 text-xs text-slate-700"
            />
          </div>
          <div className="sm:col-span-3">
            <button
              type="button"
              onClick={handleApply}
              className="w-full px-4 py-1.5 rounded-lg bg-sky-500 hover:bg-sky-600 text-white text-xs font-semibold inline-flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <Filter className="w-3.5 h-3.5" />
              <span>Apply</span>
            </button>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {[
            { id: 'this_month', label: 'This month' },
            { id: 'last_month', label: 'Last month' },
            { id: 'this_year', label: 'This year' },
            { id: 'last_year', label: 'Last year' }
          ].map((pill) => (
            <button
              key={pill.id}
              type="button"
              onClick={() => applyQuickRange(pill.id)}
              className="px-3 py-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-xs font-medium text-slate-700 cursor-pointer"
            >
              {pill.label}
            </button>
          ))}
        </div>
      </div>

      {/* 3 KPI Summary Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-2xs space-y-2">
          <div className="flex items-center gap-1.5 text-[11px] font-bold uppercase text-slate-500 tracking-wide">
            <CreditCard className="w-3.5 h-3.5" />
            <span>SALARIES ({periodLabel})</span>
          </div>
          <div className="text-2xl font-extrabold text-slate-900">{fmtPkr(kpis.netPaid)}</div>
          <p className="text-xs text-slate-500">
            net paid to staff · {kpis.slipCount} salary slip(s)
          </p>
          <div className="pt-1 space-y-0.5 text-xs">
            <div>
              Fines deducted from salaries:{' '}
              <span className="font-bold text-rose-600">{fmtPkr(kpis.finesDeducted)}</span>
            </div>
            <div>
              Loan installments deducted:{' '}
              <span className="font-bold text-rose-600">{fmtPkr(kpis.loanDeducted)}</span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-2xs space-y-2">
          <div className="flex items-center gap-1.5 text-[11px] font-bold uppercase text-slate-500 tracking-wide">
            <Gavel className="w-3.5 h-3.5" />
            <span>FINES ({periodLabel})</span>
          </div>
          <div className="text-2xl font-extrabold text-orange-600">{fmtPkr(kpis.finesIssued)}</div>
          <p className="text-xs text-slate-500">fines issued in this period</p>
          <div className="pt-1 space-y-0.5 text-xs">
            <div>
              Waived by admin:{' '}
              <span className="font-bold text-emerald-600">{fmtPkr(kpis.finesWaived)}</span>
            </div>
            <div className="text-slate-600">
              Still pending (all time):{' '}
              <strong className="text-slate-900">{fmtPkr(kpis.allTimePendingFines)}</strong> —
              deducted at next salary
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-2xs space-y-2">
          <div className="flex items-center gap-1.5 text-[11px] font-bold uppercase text-slate-500 tracking-wide">
            <CreditCard className="w-3.5 h-3.5" />
            <span>LOANS</span>
          </div>
          <div className="text-2xl font-extrabold text-rose-600">
            {fmtPkr(kpis.allTimeOutstandingLoans)}
          </div>
          <p className="text-xs text-slate-500">
            outstanding across {kpis.activeLoanCount} active loan(s) (all time)
          </p>
          <div className="pt-1 text-xs text-slate-600">
            Issued in this period:{' '}
            <strong className="text-slate-900">{fmtPkr(kpis.loansIssuedPeriod)}</strong>
          </div>
        </div>
      </div>

      {/* Staff Summary Card */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden">
        <div className="px-5 py-3.5 border-b border-slate-100 flex items-center gap-2 text-sm font-semibold text-slate-800">
          <Users className="w-4 h-4 text-slate-600" />
          <span>Staff summary</span>
          <span className="text-xs font-normal text-slate-400">· {periodLabel}</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/70 border-b border-slate-200 text-xs font-semibold text-slate-700">
                <th className="py-2.5 px-4">Staff</th>
                <th className="py-2.5 px-3 text-right">Slips</th>
                <th className="py-2.5 px-3 text-right">Net paid</th>
                <th className="py-2.5 px-3 text-right">Loan deducted</th>
                <th className="py-2.5 px-3 text-right">Fines deducted</th>
                <th className="py-2.5 px-3 text-right">Fines issued</th>
                <th className="py-2.5 px-3 text-right">Waived</th>
                <th className="py-2.5 px-4 text-right">Pending fines</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs text-slate-700">
              {staffSummaryRows.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-10 text-center text-slate-400">
                    No payroll, loan or fine activity in this period.
                  </td>
                </tr>
              ) : (
                staffSummaryRows.map((r) => (
                  <tr key={r.id} className="hover:bg-slate-50/70">
                    <td className="py-3 px-4 font-semibold text-slate-900">{r.name}</td>
                    <td className="py-3 px-3 text-right">{r.slips}</td>
                    <td className="py-3 px-3 text-right font-semibold text-slate-900">
                      {fmtPkr(r.netPaid)}
                    </td>
                    <td className="py-3 px-3 text-right text-rose-600">
                      {fmtPkr(r.loanDeducted)}
                    </td>
                    <td className="py-3 px-3 text-right text-rose-600">
                      {fmtPkr(r.finesDeducted)}
                    </td>
                    <td className="py-3 px-3 text-right">{fmtPkr(r.finesIssued)}</td>
                    <td className="py-3 px-3 text-right text-emerald-600">{fmtPkr(r.waived)}</td>
                    <td className="py-3 px-4 text-right font-semibold text-amber-700">
                      {fmtPkr(r.pendingFines)}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <div className="px-5 py-2.5 border-t border-slate-100 text-[11px] text-slate-500">
          Salaries are counted by <strong>salary month</strong>; fines by <strong>fine date</strong>.
          &quot;Pending fines&quot; is what each person still owes regardless of the period.
        </div>
      </div>

      {/* Download Reports Card */}
      <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-2xs space-y-4">
        <div className="flex items-center gap-2 text-sm font-semibold text-slate-800">
          <Download className="w-4 h-4 text-slate-600" />
          <span>Download reports</span>
          <span className="text-xs font-normal text-slate-400">· {periodLabel}</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-4 rounded-xl border border-slate-200 space-y-3">
            <div>
              <h3 className="text-xs font-bold text-slate-900">Payroll report</h3>
              <p className="text-[11px] text-slate-500 mt-0.5">
                Every salary slip: basic, bonus, deductions, loan, fines and net paid.
              </p>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleDownloadPayrollPdf}
                className="px-3 py-1.5 rounded-lg border border-rose-300 text-rose-600 hover:bg-rose-50 text-xs font-semibold inline-flex items-center gap-1.5 cursor-pointer"
              >
                <FileText className="w-3.5 h-3.5" />
                <span>PDF</span>
              </button>
              <button
                type="button"
                onClick={handleDownloadPayrollCsv}
                className="px-3 py-1.5 rounded-lg border border-emerald-400 text-emerald-700 hover:bg-emerald-50 text-xs font-semibold inline-flex items-center gap-1.5 cursor-pointer"
              >
                <Download className="w-3.5 h-3.5" />
                <span>CSV</span>
              </button>
            </div>
          </div>

          <div className="p-4 rounded-xl border border-slate-200 space-y-3">
            <div>
              <h3 className="text-xs font-bold text-slate-900">Loans report</h3>
              <p className="text-[11px] text-slate-500 mt-0.5">
                Loans issued in the period with remaining balance and monthly deduction.
              </p>
            </div>
            <div>
              <button
                type="button"
                onClick={handleDownloadLoansCsv}
                className="px-3 py-1.5 rounded-lg border border-emerald-400 text-emerald-700 hover:bg-emerald-50 text-xs font-semibold inline-flex items-center gap-1.5 cursor-pointer"
              >
                <Download className="w-3.5 h-3.5" />
                <span>CSV</span>
              </button>
            </div>
          </div>

          <div className="p-4 rounded-xl border border-slate-200 space-y-3">
            <div>
              <h3 className="text-xs font-bold text-slate-900">Staff fines report</h3>
              <p className="text-[11px] text-slate-500 mt-0.5">
                Every fine with type, amount, waived, outstanding, status and reason.
              </p>
            </div>
            <div>
              <button
                type="button"
                onClick={handleDownloadFinesCsv}
                className="px-3 py-1.5 rounded-lg border border-emerald-400 text-emerald-700 hover:bg-emerald-50 text-xs font-semibold inline-flex items-center gap-1.5 cursor-pointer"
              >
                <Download className="w-3.5 h-3.5" />
                <span>CSV</span>
              </button>
            </div>
          </div>
        </div>

        <p className="text-[11px] text-slate-400">
          Looking for staff attendance reports? They are under Attendance → Reports → Staff Attendance.
        </p>
      </div>
    </div>
  )
}

export default HrReportsView
