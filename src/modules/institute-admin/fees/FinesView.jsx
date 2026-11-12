import React, { useState, useMemo, useEffect } from 'react'
import {
  ArrowLeft,
  FileText,
  UserPlus,
  CreditCard,
  Receipt,
  ArrowDownCircle,
  MessageSquare,
  CheckCircle2,
  Percent,
  Hammer,
  Download,
  AlertTriangle,
  Plus,
  Trash2,
  User
} from 'lucide-react'
import { useAppData } from '../../../context/AppDataContext'
import { useAuth } from '../../../context/AuthContext'
import { useToast } from '../../../context/ToastContext'
import { getDistinctInstituteClassNames, isClassAllowedForTier } from '../../../utils/tierGating'
import Modal from '../../../components/common/Modal'

const getFinesStorageKey = (instId) => `eims_fines_registry_${instId || 'default'}`

const loadFines = (instId) => {
  try {
    const raw = localStorage.getItem(getFinesStorageKey(instId))
    const parsed = raw ? JSON.parse(raw) : []
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

const saveFines = (instId, items) => {
  try {
    localStorage.setItem(getFinesStorageKey(instId), JSON.stringify(items))
  } catch {
    // ignore storage errors
  }
}

const formatIssuedDateTime = (iso) => {
  if (!iso) return '—'
  const dt = new Date(iso)
  if (Number.isNaN(dt.getTime())) return String(iso).slice(0, 16)
  const d = dt.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })
  const t = dt.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
  return `${d}, ${t}`
}

export const FinesView = ({
  currentInstitute,
  onRouteChange,
  onOpenBillingHistory,
  onOpenQuickPayment
}) => {
  const { students = [], classes = [], fees = [], logAuditEvent } = useAppData()
  const { user } = useAuth()
  const { toast } = useToast()

  const instId = currentInstitute?.id || 'default'
  const actorName = user?.name || user?.fullName || 'Admin'

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

  const [localFines, setLocalFines] = useState(() => loadFines(instId))

  useEffect(() => {
    setLocalFines(loadFines(instId))
  }, [instId])

  const persistFines = (updater) => {
    setLocalFines((prev) => {
      const next = typeof updater === 'function' ? updater(prev) : updater
      saveFines(instId, next)
      return next
    })
  }

  // Merge any fine-category fee records from AppDataContext with localFines
  const allFines = useMemo(() => {
    const fromFees = fees
      .filter((f) => {
        if (currentInstitute?.id && f.instituteId && f.instituteId !== currentInstitute.id) return false
        const cat = String(f.category || f.feeType || f.title || '').toLowerCase()
        return cat.includes('fine')
      })
      .map((f) => {
        const st = instStudents.find((s) => s.id === (f.studentId || f.student_id))
        const statusRaw = String(f.status || 'pending').toLowerCase()
        return {
          id: `fee_${f.id}`,
          studentId: st?.id || f.studentId || f.student_id,
          studentName: st?.name || f.studentName || 'Student',
          parentName: st?.guardianName || st?.fatherName || '',
          rollNumber: st?.rollNumber || '',
          admissionNo: st?.admissionNo || '',
          className: st?.className || f.className || '—',
          fineType: f.title || f.category || 'Attendance Defaulter Fine',
          amount: Number(f.amount ?? f.totalAmount ?? 0),
          reason: f.remarks || f.reason || '',
          status:
            statusRaw === 'paid' ? 'Paid' : statusRaw === 'waived' ? 'Waived' : 'Invoiced',
          issuedBy: f.createdBy || actorName,
          issuedAt: f.createdAt || f.date || new Date().toISOString(),
          fromFees: true
        }
      })

    return [...localFines, ...fromFees]
  }, [localFines, fees, instStudents, currentInstitute, actorName])

  // Filters
  const [classInput, setClassInput] = useState('ALL')
  const [statusInput, setStatusInput] = useState('ALL')
  const [fromInput, setFromInput] = useState('')
  const [toInput, setToInput] = useState('')
  const [applied, setApplied] = useState({
    className: 'ALL',
    status: 'ALL',
    from: '',
    to: ''
  })

  // Modals
  const [addModalOpen, setAddModalOpen] = useState(false)
  const [stuSearch, setStuSearch] = useState('')
  const [addForm, setAddForm] = useState({
    studentId: '',
    fineType: 'Attendance Defaulter Fine',
    amount: '',
    reason: ''
  })
  const [deleteTarget, setDeleteTarget] = useState(null)

  const filteredFines = useMemo(() => {
    return allFines.filter((f) => {
      if (applied.className !== 'ALL' && f.className !== applied.className) return false
      if (applied.status !== 'ALL' && f.status !== applied.status) return false
      const isoDate = String(f.issuedAt || '').slice(0, 10)
      if (applied.from && isoDate && isoDate < applied.from) return false
      if (applied.to && isoDate && isoDate > applied.to) return false
      return true
    })
  }, [allFines, applied])

  const kpis = useMemo(() => {
    let billed = 0
    let awaiting = 0
    let collected = 0
    let waived = 0

    for (const f of filteredFines) {
      const amt = Number(f.amount || 0)
      if (f.status === 'Waived') {
        waived += amt
      } else if (f.status === 'Paid') {
        billed += amt
        collected += amt
      } else {
        billed += amt
        awaiting += amt
      }
    }
    return { billed, awaiting, collected, waived }
  }, [filteredFines])

  const handleAddFine = (e) => {
    e.preventDefault()
    if (!addForm.studentId) {
      toast.warning('Please select a student')
      return
    }
    const amt = Number(addForm.amount || 0)
    if (amt <= 0) {
      toast.warning('Enter a valid fine amount')
      return
    }
    const st = instStudents.find((s) => s.id === addForm.studentId)
    if (!st) return

    const newFine = {
      id: `fine_${Date.now()}`,
      studentId: st.id,
      studentName: st.name,
      parentName: st.guardianName || st.fatherName || '',
      rollNumber: st.rollNumber || '',
      admissionNo: st.admissionNo || '',
      className: st.className || '—',
      fineType: addForm.fineType,
      amount: amt,
      reason: addForm.reason.trim(),
      status: 'Invoiced',
      issuedBy: actorName,
      issuedAt: new Date().toISOString()
    }

    persistFines((prev) => [newFine, ...prev])
    logAuditEvent?.('FINE_ISSUED', `Issued ${newFine.fineType} (PKR ${amt}) to ${st.name}`)
    toast.success(`Fine of PKR ${amt.toLocaleString()} issued to ${st.name}`)
    setAddModalOpen(false)
    setAddForm({ studentId: '', fineType: 'Attendance Defaulter Fine', amount: '', reason: '' })
    setStuSearch('')
  }

  const handleWaiveFine = (fine) => {
    if (fine.status === 'Waived') return
    persistFines((prev) =>
      prev.map((f) => (f.id === fine.id ? { ...f, status: 'Waived' } : f))
    )
    toast.success(`Waived fine for ${fine.studentName}`)
  }

  const handleExportCsv = () => {
    const lines = [
      'Roll No,Student,Class,Fine Type,Amount (PKR),Reason,Status,Issued By,Issued At',
      ...filteredFines.map(
        (f) =>
          `"${f.rollNumber || ''}","${f.studentName}","${f.className}","${f.fineType}",${f.amount},"${f.reason || ''}","${f.status}","${f.issuedBy}","${f.issuedAt}"`
      )
    ]
    const blob = new Blob([lines.join('\n')], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `fines-${new Date().toISOString().slice(0, 10)}.csv`
    a.click()
    URL.revokeObjectURL(url)
    toast.success(`Exported ${filteredFines.length} fine record(s)`)
  }

  return (
    <div className="p-4 sm:p-6 space-y-5 max-w-[1440px] mx-auto">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <FileText className="w-5 h-5 text-slate-600" />
            <h1 className="text-xl font-bold text-slate-900 tracking-tight">Fines</h1>
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

      {/* 4 KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-4 flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-lg bg-blue-600 text-white flex items-center justify-center shrink-0">
            <FileText className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[11px] font-medium text-slate-500">Invoiced or Billed</p>
            <p className="text-xl font-bold text-slate-900 leading-tight">
              PKR {kpis.billed.toLocaleString()}
            </p>
            <p className="text-[11px] text-slate-400">Total billed amount</p>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-4 flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-lg bg-orange-500 text-white flex items-center justify-center shrink-0">
            <CreditCard className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[11px] font-medium text-slate-500">Awaiting Payment</p>
            <p className="text-xl font-bold text-slate-900 leading-tight">
              PKR {kpis.awaiting.toLocaleString()}
            </p>
            <p className="text-[11px] text-slate-400">Outstanding balance</p>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-4 flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-lg bg-emerald-600 text-white flex items-center justify-center shrink-0">
            <CheckCircle2 className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[11px] font-medium text-slate-500">Collected Amount</p>
            <p className="text-xl font-bold text-slate-900 leading-tight">
              PKR {kpis.collected.toLocaleString()}
            </p>
            <p className="text-[11px] text-slate-400">Payments received</p>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-4 flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-lg bg-cyan-500 text-white flex items-center justify-center shrink-0">
            <Percent className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[11px] font-medium text-slate-500">Waived Off</p>
            <p className="text-xl font-bold text-slate-900 leading-tight">
              PKR {kpis.waived.toLocaleString()}
            </p>
            <p className="text-[11px] text-slate-400">Full and partial waivers</p>
          </div>
        </div>
      </div>

      {/* Main Fines Card */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5 space-y-4">
        {/* Card Header */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2 text-sm font-bold text-slate-800">
            <Hammer className="w-4 h-4 text-slate-600" />
            Fines
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={handleExportCsv}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md border border-blue-200 bg-white hover:bg-blue-50 text-blue-600 text-xs font-semibold"
            >
              <Download className="w-3.5 h-3.5" />
              Export
            </button>
            <button
              type="button"
              onClick={() => onRouteChange?.('inst-attendance-low')}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md border border-orange-200 bg-white hover:bg-orange-50 text-orange-600 text-xs font-semibold"
            >
              <AlertTriangle className="w-3.5 h-3.5" />
              Low Attendance
            </button>
            <button
              type="button"
              onClick={() => setAddModalOpen(true)}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-md bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-sm"
            >
              <Plus className="w-3.5 h-3.5" />
              Add Fine
            </button>
          </div>
        </div>

        {/* Filter Row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-[1fr_1fr_1fr_1fr_1fr_1fr] gap-3 items-end">
          <div>
            <label className="block text-[11px] font-semibold text-slate-600 mb-1">Class</label>
            <select
              value={classInput}
              onChange={(e) => setClassInput(e.target.value)}
              className="w-full px-3 py-2 text-xs rounded-md border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="ALL">All classes</option>
              {availableClasses.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-slate-600 mb-1">Status</label>
            <select
              value={statusInput}
              onChange={(e) => setStatusInput(e.target.value)}
              className="w-full px-3 py-2 text-xs rounded-md border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="ALL">All statuses</option>
              <option value="Invoiced">Invoiced</option>
              <option value="Paid">Paid</option>
              <option value="Waived">Waived</option>
            </select>
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-slate-600 mb-1">Issued from</label>
            <input
              type="date"
              value={fromInput}
              onChange={(e) => setFromInput(e.target.value)}
              className="w-full px-2.5 py-2 text-xs rounded-md border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-slate-600 mb-1">Issued to</label>
            <input
              type="date"
              value={toInput}
              onChange={(e) => setToInput(e.target.value)}
              className="w-full px-2.5 py-2 text-xs rounded-md border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <button
            type="button"
            onClick={() =>
              setApplied({ className: classInput, status: statusInput, from: fromInput, to: toInput })
            }
            className="w-full py-2 rounded-md bg-blue-500 hover:bg-blue-600 text-white text-xs font-semibold transition-colors"
          >
            Apply Filters
          </button>

          <button
            type="button"
            onClick={() => {
              setClassInput('ALL')
              setStatusInput('ALL')
              setFromInput('')
              setToInput('')
              setApplied({ className: 'ALL', status: 'ALL', from: '', to: '' })
            }}
            className="w-full py-2 rounded-md border border-slate-200 bg-white hover:bg-slate-50 text-slate-600 text-xs font-semibold transition-colors"
          >
            Reset
          </button>
        </div>

        <div className="text-[11px] text-slate-400">
          Showing {filteredFines.length === 0 ? 0 : 1}–{filteredFines.length} of {filteredFines.length} fine(s)
        </div>

        {/* Table */}
        <div className="overflow-x-auto border border-slate-200 rounded-lg">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-[11px] font-semibold text-slate-600">
                <th className="py-2.5 px-3 w-10">#</th>
                <th className="py-2.5 px-3">Roll No</th>
                <th className="py-2.5 px-3 min-w-[200px]">Student</th>
                <th className="py-2.5 px-3">Class</th>
                <th className="py-2.5 px-3">Fine type</th>
                <th className="py-2.5 px-3">Amount</th>
                <th className="py-2.5 px-3">Reason</th>
                <th className="py-2.5 px-3">Status</th>
                <th className="py-2.5 px-3">Issued by</th>
                <th className="py-2.5 px-3 text-center">Invoice</th>
                <th className="py-2.5 px-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredFines.length === 0 ? (
                <tr>
                  <td colSpan={11} className="py-12 text-center text-slate-400">
                    No fines recorded yet. Click <strong>+ Add Fine</strong> to issue a student fine.
                  </td>
                </tr>
              ) : (
                filteredFines.map((f, idx) => (
                  <tr key={f.id} className="hover:bg-slate-50/70">
                    <td className="py-3 px-3 text-slate-500">{idx + 1}</td>
                    <td className="py-3 px-3 font-medium text-slate-700">{f.rollNumber || '—'}</td>
                    <td className="py-3 px-3">
                      <div className="font-semibold text-slate-800">{f.studentName}</div>
                      {f.parentName && (
                        <div className="text-[11px] text-slate-400 flex items-center gap-1 mt-0.5">
                          <User className="w-3 h-3" />
                          {f.parentName}
                        </div>
                      )}
                      <div className="flex flex-wrap items-center gap-1 mt-1">
                        {f.rollNumber && (
                          <span className="px-1.5 py-0.5 rounded bg-purple-50 text-purple-700 border border-purple-200 text-[10px] font-semibold">
                            Roll No: {f.rollNumber}
                          </span>
                        )}
                        {f.admissionNo && (
                          <span className="px-1.5 py-0.5 rounded bg-blue-50 text-blue-700 border border-blue-200 text-[10px] font-semibold">
                            Ad No: {f.admissionNo}
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="py-3 px-3 text-slate-700">{f.className}</td>
                    <td className="py-3 px-3">
                      <span className="px-2 py-0.5 rounded bg-slate-100 border border-slate-200 text-slate-700 text-[11px] font-medium">
                        {f.fineType}
                      </span>
                    </td>
                    <td className="py-3 px-3 font-bold text-rose-600">
                      PKR {Number(f.amount || 0).toLocaleString()}
                    </td>
                    <td className="py-3 px-3 text-slate-500">{f.reason || '—'}</td>
                    <td className="py-3 px-3">
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-bold text-white ${
                          f.status === 'Paid'
                            ? 'bg-emerald-600'
                            : f.status === 'Waived'
                              ? 'bg-slate-500'
                              : 'bg-orange-500'
                        }`}
                      >
                        {f.status}
                      </span>
                    </td>
                    <td className="py-3 px-3">
                      <div className="font-semibold text-slate-700">{f.issuedBy}</div>
                      <div className="text-[10px] text-slate-400">{formatIssuedDateTime(f.issuedAt)}</div>
                    </td>
                    <td className="py-3 px-3 text-center">
                      <button
                        type="button"
                        onClick={() => onOpenBillingHistory?.(f.studentId)}
                        title="Open Student Billing History"
                        className="p-1.5 rounded border border-blue-200 bg-white hover:bg-blue-50 text-blue-600 inline-flex items-center justify-center"
                      >
                        <FileText className="w-3.5 h-3.5" />
                      </button>
                    </td>
                    <td className="py-3 px-3 text-right">
                      <div className="inline-flex items-center gap-1.5">
                        {f.status !== 'Waived' && (
                          <button
                            type="button"
                            onClick={() => handleWaiveFine(f)}
                            className="inline-flex items-center gap-1 px-2 py-1 rounded border border-orange-300 bg-white hover:bg-orange-50 text-orange-600 text-[11px] font-semibold"
                          >
                            <Percent className="w-3 h-3" />
                            Waive off
                          </button>
                        )}
                        {!f.fromFees && (
                          <button
                            type="button"
                            onClick={() => setDeleteTarget(f)}
                            title="Delete Fine"
                            className="p-1.5 rounded border border-rose-200 bg-white hover:bg-rose-50 text-rose-600"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
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

      {/* Add Fine Modal */}
      {addModalOpen && (
        <Modal
          isOpen
          onClose={() => setAddModalOpen(false)}
          title="Issue Student Fine"
          maxWidth="max-w-md"
        >
          <form onSubmit={handleAddFine} className="space-y-3.5 text-xs">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Student</label>
              <input
                type="text"
                value={stuSearch}
                onChange={(e) => setStuSearch(e.target.value)}
                placeholder="Search student by name or roll..."
                className="w-full px-3 py-2 mb-1.5 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <select
                required
                value={addForm.studentId}
                onChange={(e) => setAddForm((p) => ({ ...p, studentId: e.target.value }))}
                className="w-full px-3 py-2 rounded-lg border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Select student...</option>
                {instStudents
                  .filter((st) => {
                    const q = stuSearch.trim().toLowerCase()
                    if (!q) return true
                    return (
                      (st.name || '').toLowerCase().includes(q) ||
                      (st.rollNumber || '').toLowerCase().includes(q)
                    )
                  })
                  .slice(0, 60)
                  .map((st) => (
                    <option key={st.id} value={st.id}>
                      {st.name} ({st.className || 'N/A'} • Roll: {st.rollNumber || '—'})
                    </option>
                  ))}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Fine Type</label>
                <select
                  value={addForm.fineType}
                  onChange={(e) => setAddForm((p) => ({ ...p, fineType: e.target.value }))}
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="Attendance Defaulter Fine">Attendance Defaulter Fine</option>
                  <option value="Late Fee Fine">Late Fee Fine</option>
                  <option value="Library Fine">Library Fine</option>
                  <option value="Discipline Fine">Discipline Fine</option>
                  <option value="Damage Fine">Damage Fine</option>
                </select>
              </div>
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Amount (PKR)</label>
                <input
                  type="number"
                  min="1"
                  required
                  value={addForm.amount}
                  onChange={(e) => setAddForm((p) => ({ ...p, amount: e.target.value }))}
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Reason (optional)</label>
              <textarea
                rows={2}
                value={addForm.reason}
                onChange={(e) => setAddForm((p) => ({ ...p, reason: e.target.value }))}
                placeholder="Notes or reason for fine..."
                className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setAddModalOpen(false)}
                className="px-3.5 py-1.5 rounded-lg border border-slate-200 text-slate-600 font-semibold hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-semibold"
              >
                Issue Fine
              </button>
            </div>
          </form>
        </Modal>
      )}

      {/* Delete Confirmation Modal */}
      {deleteTarget && (
        <Modal
          isOpen
          onClose={() => setDeleteTarget(null)}
          title="Delete Fine"
          maxWidth="max-w-sm"
        >
          <div className="space-y-4 text-xs">
            <p className="text-slate-600">
              Delete the fine of <strong>PKR {Number(deleteTarget.amount || 0).toLocaleString()}</strong> for{' '}
              <strong className="text-slate-900">{deleteTarget.studentName}</strong>?
            </p>
            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setDeleteTarget(null)}
                className="px-3.5 py-1.5 rounded-lg border border-slate-200 text-slate-600 font-semibold hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  persistFines((prev) => prev.filter((f) => f.id !== deleteTarget.id))
                  toast.success('Fine deleted')
                  setDeleteTarget(null)
                }}
                className="px-4 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-700 text-white font-semibold"
              >
                Delete
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  )
}

export default FinesView
