import React, { useState, useMemo, useEffect } from 'react'
import {
  ArrowLeft,
  FileText,
  UserPlus,
  CreditCard,
  Receipt,
  ArrowDownCircle,
  MessageSquare,
  Hourglass,
  Check,
  X,
  Info,
  CreditCard as CardIcon,
  CheckCircle2,
  XCircle
} from 'lucide-react'
import { useAppData } from '../../../context/AppDataContext'
import { useToast } from '../../../context/ToastContext'

const getStorageKey = (instId) => `eims_payment_approvals_${instId || 'default'}`

const loadSubmissions = (instId) => {
  try {
    const raw = localStorage.getItem(getStorageKey(instId))
    const parsed = raw ? JSON.parse(raw) : []
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

const saveSubmissions = (instId, items) => {
  try {
    localStorage.setItem(getStorageKey(instId), JSON.stringify(items))
  } catch {
    // ignore storage errors
  }
}

export const PaymentApprovalsView = ({
  currentInstitute,
  onRouteChange,
  onOpenQuickPayment
}) => {
  const { fees = [], students = [], updateItem, logAuditEvent } = useAppData()
  const { toast } = useToast()

  const instId = currentInstitute?.id || 'default'
  const [activeTab, setActiveTab] = useState('pending') // 'pending' | 'approved' | 'rejected'
  const [localSubs, setLocalSubs] = useState(() => loadSubmissions(instId))

  useEffect(() => {
    setLocalSubs(loadSubmissions(instId))
  }, [instId])

  const persistSubs = (updater) => {
    setLocalSubs((prev) => {
      const next = typeof updater === 'function' ? updater(prev) : updater
      saveSubmissions(instId, next)
      return next
    })
  }

  // Merge any fee records flagged as pending_approval / approved / rejected with localSubmissions
  const allSubmissions = useMemo(() => {
    const fromFees = fees
      .filter((f) => {
        if (currentInstitute?.id && f.instituteId && f.instituteId !== currentInstitute.id) return false
        const st = String(f.approvalStatus || '').toLowerCase()
        return ['pending', 'approved', 'rejected'].includes(st)
      })
      .map((f) => {
        const stObj = students.find((s) => s.id === (f.studentId || f.student_id))
        return {
          id: `fee_${f.id}`,
          feeId: f.id,
          studentName: stObj?.name || f.studentName || 'Student',
          parentName: stObj?.guardianName || stObj?.fatherName || '—',
          amount: Number(f.submittedAmount ?? f.amount ?? 0),
          method: f.paymentMethod || 'Bank Transfer',
          reference: f.transactionRef || f.id?.slice(0, 8),
          submittedAt: f.updatedAt || f.date || new Date().toISOString().slice(0, 10),
          status: String(f.approvalStatus).toLowerCase(),
          isFeeRecord: true
        }
      })

    return [...localSubs, ...fromFees]
  }, [localSubs, fees, students, currentInstitute])

  const counts = useMemo(
    () => ({
      pending: allSubmissions.filter((s) => s.status === 'pending').length,
      approved: allSubmissions.filter((s) => s.status === 'approved').length,
      rejected: allSubmissions.filter((s) => s.status === 'rejected').length
    }),
    [allSubmissions]
  )

  const displayed = useMemo(
    () => allSubmissions.filter((s) => s.status === activeTab),
    [allSubmissions, activeTab]
  )

  const handleDecision = async (item, decision) => {
    if (item.isFeeRecord && item.feeId) {
      try {
        await updateItem('fees', item.feeId, {
          approvalStatus: decision,
          ...(decision === 'approved' ? { status: 'paid', paidAmount: item.amount } : {})
        })
      } catch {
        // continue
      }
    } else {
      persistSubs((prev) =>
        prev.map((s) => (s.id === item.id ? { ...s, status: decision } : s))
      )
    }

    logAuditEvent?.(
      `PAYMENT_${decision.toUpperCase()}`,
      `${decision === 'approved' ? 'Approved' : 'Rejected'} payment proof for ${item.studentName}`,
      { amount: item.amount }
    )
    toast.success(`Payment ${decision === 'approved' ? 'approved' : 'rejected'} for ${item.studentName}`)
  }

  return (
    <div className="p-4 sm:p-6 space-y-5 max-w-[1440px] mx-auto">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <FileText className="w-5 h-5 text-slate-600" />
            <h1 className="text-xl font-bold text-slate-900 tracking-tight">Payment Approvals</h1>
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

      {/* Main Blue-Header Card */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="px-5 py-3.5 bg-[#1e88e5] text-white">
          <div className="flex items-center gap-2 text-sm font-bold">
            <CardIcon className="w-4 h-4" />
            Payment Approvals
          </div>
          <p className="text-[11px] text-blue-100 mt-0.5">
            Review and approve payment proofs from parents
          </p>
        </div>

        <div className="p-5 space-y-4">
          {/* Tabs */}
          <div className="border-b border-slate-200 flex items-center gap-1">
            <button
              type="button"
              onClick={() => setActiveTab('pending')}
              className={`px-4 py-2 text-xs font-semibold inline-flex items-center gap-1.5 border-b-2 transition-colors ${
                activeTab === 'pending'
                  ? 'border-blue-600 text-slate-900 bg-slate-50/60'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              <Hourglass className="w-3.5 h-3.5" />
              Pending
              {counts.pending > 0 && (
                <span className="px-1.5 py-0.5 rounded bg-amber-500 text-white text-[10px] font-bold">
                  {counts.pending}
                </span>
              )}
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('approved')}
              className={`px-4 py-2 text-xs font-semibold inline-flex items-center gap-1.5 border-b-2 transition-colors ${
                activeTab === 'approved'
                  ? 'border-blue-600 text-slate-900 bg-slate-50/60'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              <Check className="w-3.5 h-3.5" />
              Approved
              {counts.approved > 0 && (
                <span className="px-1.5 py-0.5 rounded bg-emerald-600 text-white text-[10px] font-bold">
                  {counts.approved}
                </span>
              )}
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('rejected')}
              className={`px-4 py-2 text-xs font-semibold inline-flex items-center gap-1.5 border-b-2 transition-colors ${
                activeTab === 'rejected'
                  ? 'border-blue-600 text-slate-900 bg-slate-50/60'
                  : 'border-transparent text-slate-500 hover:bg-slate-50'
              }`}
            >
              <X className="w-3.5 h-3.5" />
              Rejected
              {counts.rejected > 0 && (
                <span className="px-1.5 py-0.5 rounded bg-rose-600 text-white text-[10px] font-bold">
                  {counts.rejected}
                </span>
              )}
            </button>
          </div>

          {/* Content */}
          {displayed.length === 0 ? (
            <div className="rounded-lg border border-cyan-300 bg-cyan-50/60 px-4 py-3 flex items-center gap-2 text-xs text-cyan-900">
              <Info className="w-4 h-4 text-cyan-600 shrink-0" />
              <span>No {activeTab} payment submissions found.</span>
            </div>
          ) : (
            <div className="overflow-x-auto border border-slate-200 rounded-lg">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-[11px] font-semibold text-slate-600">
                    <th className="py-2.5 px-4">#</th>
                    <th className="py-2.5 px-4">Student / Parent</th>
                    <th className="py-2.5 px-4">Method &amp; Reference</th>
                    <th className="py-2.5 px-4">Submitted On</th>
                    <th className="py-2.5 px-4 text-right">Amount</th>
                    <th className="py-2.5 px-4 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {displayed.map((sub, idx) => (
                    <tr key={sub.id} className="hover:bg-slate-50">
                      <td className="py-3 px-4 text-slate-500">{idx + 1}</td>
                      <td className="py-3 px-4">
                        <div className="font-semibold text-slate-800">{sub.studentName}</div>
                        <div className="text-[11px] text-slate-400">{sub.parentName}</div>
                      </td>
                      <td className="py-3 px-4">
                        <div className="font-medium text-slate-700">{sub.method}</div>
                        <div className="text-[11px] text-slate-400">Ref: {sub.reference}</div>
                      </td>
                      <td className="py-3 px-4 text-slate-600">{sub.submittedAt}</td>
                      <td className="py-3 px-4 text-right font-bold text-slate-900">
                        PKR {Number(sub.amount || 0).toLocaleString()}
                      </td>
                      <td className="py-3 px-4 text-right space-x-1.5">
                        {activeTab === 'pending' ? (
                          <>
                            <button
                              type="button"
                              onClick={() => handleDecision(sub, 'approved')}
                              className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-emerald-600 hover:bg-emerald-700 text-white text-[11px] font-semibold"
                            >
                              <CheckCircle2 className="w-3 h-3" />
                              Approve
                            </button>
                            <button
                              type="button"
                              onClick={() => handleDecision(sub, 'rejected')}
                              className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-rose-600 hover:bg-rose-700 text-white text-[11px] font-semibold"
                            >
                              <XCircle className="w-3 h-3" />
                              Reject
                            </button>
                          </>
                        ) : (
                          <span
                            className={`px-2 py-0.5 rounded-full text-[11px] font-semibold capitalize ${
                              activeTab === 'approved'
                                ? 'bg-emerald-100 text-emerald-700'
                                : 'bg-rose-100 text-rose-700'
                            }`}
                          >
                            {activeTab}
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default PaymentApprovalsView
