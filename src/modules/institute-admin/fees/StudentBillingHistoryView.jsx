import React, { useState, useMemo } from 'react'
import {
  ArrowLeft,
  UserPlus,
  DollarSign,
  FileText,
  ArrowDownCircle,
  MessageSquare,
  CheckCircle2,
  AlertTriangle,
  Percent,
  List,
  Wallet,
  CreditCard,
  Printer,
  Trash2,
  Eye,
  EyeOff,
  Calendar,
  Send,
  Plus,
  Sliders,
  User,
  Receipt
} from 'lucide-react'
import { useAppData } from '../../../context/AppDataContext'
import { useToast } from '../../../context/ToastContext'
import { PrintableFeeChallanModal } from '../../../components/common/PrintableFeeChallanModal'
import {
  getFamilyCreditBalance,
  updateFamilyCreditBalance
} from '../../../components/common/QuickPaymentModal'
import { recordCampusLedgerTransaction } from '../accounts/CampusAccountsView'

const normalizeCnic = (val = '') => String(val).replace(/[^0-9]/g, '')

const formatMoney = (val) => `PKR ${Number(val || 0).toLocaleString()}`

const getInvoiceTotal = (fee) => Number(fee?.amount || 0) + Number(fee?.fine || fee?.lateFine || 0)
const getInvoiceWaiver = (fee) => Number(fee?.discount || fee?.waiver || 0)
const getInvoicePaid = (fee) => Number(fee?.paidAmount || 0)
const getInvoiceRemaining = (fee) => {
  if (!fee || fee.status === 'Paid') return 0
  return Math.max(0, getInvoiceTotal(fee) - getInvoicePaid(fee) - getInvoiceWaiver(fee))
}

export const StudentBillingHistoryView = ({
  studentId = null,
  currentInstitute,
  onRouteChange,
  onOpenQuickPayment,
  onSelectStudent
}) => {
  const {
    students = [],
    classes = [],
    fees = [],
    addItem,
    updateItem,
    deleteItem,
    sendCommunicationBlast,
    logAuditEvent
  } = useAppData()
  const { toast } = useToast()

  const instId = currentInstitute?.id || 'default'

  const instituteStudents = useMemo(() => {
    if (!currentInstitute?.id) return students
    return students.filter((s) => s.instituteId === currentInstitute.id || !s.instituteId)
  }, [students, currentInstitute])

  const activeStudent = useMemo(() => {
    if (studentId) {
      const exact = instituteStudents.find((s) => s.id === studentId)
      if (exact) return exact
    }
    return instituteStudents[0] || null
  }, [instituteStudents, studentId])

  const [activeTab, setActiveTab] = useState('pending') // pending | completed | waivers | ledger | credit
  const [maskPrivate, setMaskPrivate] = useState(false)

  // Per-invoice Pay Now inputs
  const [payInputs, setPayInputs] = useState({})
  const [smsChecks, setSmsChecks] = useState({})
  const [waiveFineChecks, setWaiveFineChecks] = useState({})
  const [waiveFineReasons, setWaiveFineReasons] = useState({})
  const [processingId, setProcessingId] = useState(null)

  // Modals
  const [waiverModalFee, setWaiverModalFee] = useState(null)
  const [waiverInput, setWaiverInput] = useState('')
  const [waiverReasonInput, setWaiverReasonInput] = useState('')

  const [deleteTargetFee, setDeleteTargetFee] = useState(null)
  const [printModalFee, setPrintModalFee] = useState(null)
  const [profileModalOpen, setProfileModalOpen] = useState(false)
  const [creditDepositAmount, setCreditDepositAmount] = useState('')
  const [creditTick, setCreditTick] = useState(0)

  const studentFees = useMemo(() => {
    if (!activeStudent) return []
    return fees
      .filter((f) => f.studentId === activeStudent.id && (!currentInstitute?.id || f.instituteId === currentInstitute.id || !f.instituteId))
      .sort((a, b) => String(b.createdAt || b.dueDate || '').localeCompare(String(a.createdAt || a.dueDate || '')))
  }, [fees, activeStudent, currentInstitute])

  const pendingInvoices = useMemo(
    () => studentFees.filter((f) => f.status !== 'Paid'),
    [studentFees]
  )
  const completedInvoices = useMemo(
    () => studentFees.filter((f) => f.status === 'Paid'),
    [studentFees]
  )
  const waiverInvoices = useMemo(
    () => studentFees.filter((f) => getInvoiceWaiver(f) > 0 || Number(f.waivedLateFee || 0) > 0),
    [studentFees]
  )

  const summary = useMemo(() => {
    const totalBilled = studentFees.reduce((s, f) => s + getInvoiceTotal(f), 0)
    const cashCollected = studentFees.reduce((s, f) => s + getInvoicePaid(f), 0)
    const outstanding = pendingInvoices.reduce((s, f) => s + getInvoiceRemaining(f), 0)
    const waiversTotal = studentFees.reduce((s, f) => s + getInvoiceWaiver(f) + Number(f.waivedLateFee || 0), 0)
    return {
      totalBilled,
      cashCollected,
      outstanding,
      waiversTotal,
      totalCount: studentFees.length,
      paidCount: completedInvoices.length,
      pendingCount: pendingInvoices.length,
      waiverCount: waiverInvoices.length
    }
  }, [studentFees, pendingInvoices, completedInvoices, waiverInvoices])

  const parentCnic = activeStudent?.parentCnic || activeStudent?.fatherCnic || activeStudent?.cnic || ''
  const parentName = activeStudent?.fatherName || activeStudent?.guardianName || 'Guardian'
  const parentPhone = activeStudent?.parentPhone || activeStudent?.phone || 'N/A'

  const familyCreditBalance = useMemo(() => {
    void creditTick
    return getFamilyCreditBalance(instId, parentCnic)
  }, [instId, parentCnic, creditTick, fees])

  const familySiblings = useMemo(() => {
    const norm = normalizeCnic(parentCnic)
    if (!norm) return activeStudent ? [activeStudent] : []
    return instituteStudents.filter(
      (s) => normalizeCnic(s.parentCnic || s.fatherCnic || s.cnic || '') === norm
    )
  }, [instituteStudents, parentCnic, activeStudent])

  // Ledger entries ordered chronologically
  const ledgerRows = useMemo(() => {
    const events = []
    studentFees.forEach((f) => {
      const dateStr = f.createdAt || f.dueDate || new Date().toISOString().split('T')[0]
      events.push({
        id: `${f.id}-bill`,
        date: String(dateStr).slice(0, 16).replace('T', ' '),
        type: 'Invoice Generated',
        ref: `#${f.receiptNo || f.invoiceNo || String(f.id).slice(-7)}`,
        description: f.feeMonth || f.title || f.feeType || 'Monthly Fee',
        debit: getInvoiceTotal(f),
        credit: 0
      })
      if (getInvoicePaid(f) > 0) {
        events.push({
          id: `${f.id}-pay`,
          date: String(f.paidAt || dateStr).slice(0, 16).replace('T', ' '),
          type: `Payment (${f.paymentMethod || 'Cash'})`,
          ref: `#${f.receiptNo || f.invoiceNo || String(f.id).slice(-7)}`,
          description: `Cash payment received`,
          debit: 0,
          credit: getInvoicePaid(f)
        })
      }
      if (getInvoiceWaiver(f) > 0) {
        events.push({
          id: `${f.id}-waiver`,
          date: String(f.waivedAt || dateStr).slice(0, 16).replace('T', ' '),
          type: 'Waiver / Discount',
          ref: `#${f.receiptNo || f.invoiceNo || String(f.id).slice(-7)}`,
          description: f.discountReason || 'Concession granted',
          debit: 0,
          credit: getInvoiceWaiver(f)
        })
      }
    })
    events.sort((a, b) => a.date.localeCompare(b.date))
    let running = 0
    return events.map((ev) => {
      running += ev.debit - ev.credit
      return { ...ev, balance: running }
    })
  }, [studentFees])

  const handlePayInvoice = async (fee) => {
    const fineVal = Number(fee.fine || fee.lateFine || 0)
    const waiveFineChecked = Boolean(waiveFineChecks[fee.id]) && fineVal > 0
    const rawPay = Number(payInputs[fee.id] || 0)
    const remainingBefore = getInvoiceRemaining(fee)

    if (!waiveFineChecked && rawPay <= 0 && remainingBefore > 0) {
      toast('Enter payment amount or check Waive Late Fee.', 'warning')
      return
    }

    setProcessingId(fee.id)
    try {
      const fineReduction = waiveFineChecked ? fineVal : 0
      const updatedFine = Math.max(0, fineVal - fineReduction)
      const effectiveDue = Math.max(0, Number(fee.amount || 0) + updatedFine - getInvoicePaid(fee) - getInvoiceWaiver(fee))
      const appliedCash = Math.min(rawPay, effectiveDue)
      const newPaid = getInvoicePaid(fee) + appliedCash
      const nextRemaining = Math.max(0, effectiveDue - appliedCash)
      const nextStatus = nextRemaining <= 0 ? 'Paid' : 'Partial'

      await updateItem('fees', fee.id, {
        paidAmount: newPaid,
        fine: updatedFine,
        waivedLateFee: Number(fee.waivedLateFee || 0) + fineReduction,
        waiveFineReason: waiveFineChecked ? (waiveFineReasons[fee.id] || 'Late fee waived') : fee.waiveFineReason,
        status: nextStatus,
        paymentMethod: 'Cash',
        paidAt: nextStatus === 'Paid' ? new Date().toISOString() : fee.paidAt,
        smsSent: smsChecks[fee.id] !== false
      })

      if (appliedCash > 0) {
        recordCampusLedgerTransaction(instId, {
          id: `VCH-FEE-${fee.id}-${Date.now()}`,
          date: new Date().toISOString().split('T')[0],
          type: 'Income',
          category: 'Student Fee Payment',
          debit: 0,
          credit: appliedCash,
          account: 'Cash',
          status: 'Cleared',
          description: `${activeStudent?.fullName || activeStudent?.name} — ${fee.feeMonth || fee.title || 'Fee'}${waiveFineChecked ? ` (Late fine PKR ${fineReduction} waived)` : ''}`,
          ref: `PAY-${fee.id}-${Date.now()}`
        })
      }

      if (smsChecks[fee.id] !== false && activeStudent) {
        const msg = `Dear ${parentName}, Payment of ${formatMoney(appliedCash)} for ${activeStudent.fullName || activeStudent.name} (${fee.feeMonth || 'Monthly'}) received. Remaining balance: ${formatMoney(nextRemaining)}.`
        try {
          await sendCommunicationBlast({
            channel: 'SMS',
            recipientGroup: activeStudent.fullName || activeStudent.name,
            message: msg,
            recipientsCount: 1
          })
        } catch {
          // non-blocking
        }
      }

      logAuditEvent?.(
        `Fee Pay Now (${formatMoney(appliedCash)}) for ${activeStudent?.fullName || activeStudent?.name}`,
        currentInstitute?.name || 'School Admin',
        'Success'
      )

      setPayInputs((prev) => ({ ...prev, [fee.id]: '' }))
      toast(`Payment recorded (${nextStatus})`, 'success')
    } catch (err) {
      toast(err?.message || 'Could not process payment.', 'error')
    } finally {
      setProcessingId(null)
    }
  }

  const handleMarkZeroFeePaid = async (fee) => {
    setProcessingId(fee.id)
    try {
      await updateItem('fees', fee.id, {
        status: 'Paid',
        paidAt: new Date().toISOString(),
        smsSent: smsChecks[fee.id] !== false
      })
      toast('Zero-fee invoice marked as Paid.', 'success')
    } catch (err) {
      toast(err?.message || 'Failed to mark paid.', 'error')
    } finally {
      setProcessingId(null)
    }
  }

  const handleApplyModalWaiver = async (e) => {
    e.preventDefault()
    if (!waiverModalFee) return
    const rem = getInvoiceRemaining(waiverModalFee)
    const amt = Math.min(rem, Math.max(0, Number(waiverInput || 0)))
    if (amt <= 0) {
      toast('Enter a waiver/discount amount greater than zero.', 'warning')
      return
    }
    try {
      const nextWaiver = getInvoiceWaiver(waiverModalFee) + amt
      const nextRem = Math.max(0, rem - amt)
      await updateItem('fees', waiverModalFee.id, {
        discount: nextWaiver,
        discountReason: waiverReasonInput.trim() || waiverModalFee.discountReason || 'Management discount',
        waivedAt: new Date().toISOString(),
        status: nextRem <= 0 ? 'Paid' : waiverModalFee.status
      })
      toast(`Applied ${formatMoney(amt)} waiver/discount.`, 'success')
      setWaiverModalFee(null)
      setWaiverInput('')
      setWaiverReasonInput('')
    } catch (err) {
      toast(err?.message || 'Failed to apply waiver.', 'error')
    }
  }

  const handleConfirmDeleteInvoice = async () => {
    if (!deleteTargetFee) return
    try {
      await deleteItem('fees', deleteTargetFee.id)
      toast('Invoice deleted.', 'info')
      setDeleteTargetFee(null)
    } catch (err) {
      toast(err?.message || 'Could not delete invoice.', 'error')
    }
  }

  const handleDepositCredit = (e) => {
    e.preventDefault()
    const amt = Number(creditDepositAmount || 0)
    if (!parentCnic) {
      toast('Student guardian CNIC is required for Family Credit.', 'warning')
      return
    }
    if (amt <= 0) {
      toast('Enter an amount greater than zero.', 'warning')
      return
    }
    updateFamilyCreditBalance(instId, parentCnic, amt)
    recordCampusLedgerTransaction(instId, {
      id: `VCH-FC-${Date.now()}`,
      date: new Date().toISOString().split('T')[0],
      type: 'Income',
      category: 'Family Credit Advance',
      debit: 0,
      credit: amt,
      account: 'Cash',
      status: 'Cleared',
      description: `Family CNIC ${parentCnic} (${parentName}) — Advance credit added`,
      ref: `FC-${Date.now()}`
    })
    setCreditDepositAmount('')
    setCreditTick((c) => c + 1)
    toast(`Added ${formatMoney(amt)} to Family Credit.`, 'success')
  }

  return (
    <div className="space-y-4 pb-8 animate-fade-in">
      {/* Top Bar (matches Pick 8 header) */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2 text-slate-900">
            <Receipt className="w-5 h-5 text-slate-600" />
            <h1 className="text-lg font-bold tracking-tight">Billing History</h1>
          </div>
          <button
            type="button"
            onClick={() => onRouteChange?.('inst-fees')}
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
            onClick={() => onOpenQuickPayment?.(activeStudent?.id || null)}
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
            onClick={() => onRouteChange?.('inst-accounts-expenses')}
            className="px-3.5 py-2 rounded-xl bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 text-xs font-semibold flex items-center gap-1.5 shadow-2xs cursor-pointer transition-colors"
          >
            <ArrowDownCircle className="w-3.5 h-3.5 text-slate-500" />
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

      {/* Quick switcher if user opened billing history without clicking from a specific student or wants to switch */}
      {instituteStudents.length > 0 && (
        <div className="flex flex-wrap items-center justify-between gap-2 bg-white border border-slate-200 rounded-xl px-4 py-2.5 shadow-2xs">
          <span className="text-xs font-semibold text-slate-600">Viewing Student Ledger:</span>
          <select
            value={activeStudent?.id || ''}
            onChange={(e) => onSelectStudent?.(e.target.value)}
            className="px-3 py-1.5 rounded-lg border border-slate-200 text-xs font-semibold text-slate-800 bg-slate-50 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 min-w-[240px]"
          >
            {instituteStudents.map((st) => (
              <option key={st.id} value={st.id}>
                {st.fullName || st.name} {st.rollNumber ? `· Roll ${st.rollNumber}` : ''} ({st.className || st.course || 'Unassigned'})
              </option>
            ))}
          </select>
        </div>
      )}

      {!activeStudent ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-10 text-center">
          <User className="w-10 h-10 text-slate-300 mx-auto mb-2" />
          <p className="text-sm font-bold text-slate-800">No students enrolled yet</p>
          <p className="text-xs text-slate-500 mt-1">Enroll a student first to view and manage their billing history.</p>
          <button
            type="button"
            onClick={() => onRouteChange?.('inst-enroll')}
            className="mt-4 px-4 py-2 rounded-xl bg-teal-600 text-white text-xs font-semibold hover:bg-teal-700 cursor-pointer"
          >
            + New Enrollment
          </button>
        </div>
      ) : (
        <>
          {/* 4 Summary Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
            <div className="bg-white rounded-xl border border-slate-200 p-4 flex items-center gap-3.5 shadow-2xs">
              <div className="w-11 h-11 rounded-xl bg-blue-500 text-white flex items-center justify-center shrink-0">
                <FileText className="w-5 h-5" />
              </div>
              <div className="min-w-0">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Total Billed Amount</p>
                <p className="text-lg font-extrabold text-slate-900 mt-0.5">{formatMoney(summary.totalBilled)}</p>
                <p className="text-[11px] text-slate-500">{summary.totalCount} invoices total</p>
              </div>
            </div>

            <div className="bg-white rounded-xl border border-slate-200 p-4 flex items-center gap-3.5 shadow-2xs">
              <div className="w-11 h-11 rounded-xl bg-emerald-500 text-white flex items-center justify-center shrink-0">
                <Wallet className="w-5 h-5" />
              </div>
              <div className="min-w-0">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Cash Collected</p>
                <p className="text-lg font-extrabold text-emerald-600 mt-0.5">{formatMoney(summary.cashCollected)}</p>
                <p className="text-[11px] text-slate-500">{summary.paidCount} fully paid · excludes waivers</p>
              </div>
            </div>

            <div className="bg-white rounded-xl border border-slate-200 p-4 flex items-center gap-3.5 shadow-2xs">
              <div className="w-11 h-11 rounded-xl bg-rose-500 text-white flex items-center justify-center shrink-0">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div className="min-w-0">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Outstanding</p>
                <p className="text-lg font-extrabold text-rose-600 mt-0.5">{formatMoney(summary.outstanding)}</p>
                <p className="text-[11px] text-slate-500">{summary.pendingCount} unpaid invoices</p>
              </div>
            </div>

            <div className="bg-white rounded-xl border border-slate-200 p-4 flex items-center gap-3.5 shadow-2xs">
              <div className="w-11 h-11 rounded-xl bg-cyan-500 text-white flex items-center justify-center shrink-0">
                <Percent className="w-5 h-5" />
              </div>
              <div className="min-w-0">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Waivers / Discounts</p>
                <p className="text-lg font-extrabold text-cyan-600 mt-0.5">{formatMoney(summary.waiversTotal)}</p>
                <p className="text-[11px] text-slate-500">{summary.waiverCount} lines with a discount</p>
              </div>
            </div>
          </div>

          {/* Indigo-Violet Student Banner */}
          <div className="bg-gradient-to-r from-indigo-600 via-violet-600 to-purple-600 rounded-2xl p-5 text-white shadow-md flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            <div className="flex items-start sm:items-center gap-4">
              <div className="w-16 h-16 rounded-full bg-white/15 border-2 border-white/40 flex items-center justify-center shrink-0 overflow-hidden">
                {activeStudent.photo ? (
                  <img src={activeStudent.photo} alt={activeStudent.fullName} className="w-full h-full object-cover" />
                ) : (
                  <User className="w-8 h-8 text-white/90" />
                )}
              </div>
              <div className="space-y-1.5">
                <div className="flex items-center gap-2">
                  <User className="w-4 h-4 text-white/80" />
                  <h2 className="text-lg font-extrabold tracking-tight">{activeStudent.fullName || activeStudent.name}</h2>
                </div>
                <div className="flex flex-wrap items-center gap-2 text-xs text-white/90">
                  <span>Parent: <strong>{parentName}</strong></span>
                  <span>(CNIC: {maskPrivate && parentCnic ? '•••••-•••••••-•' : (parentCnic || 'N/A')})</span>
                  <span>(Phone: {maskPrivate && parentPhone !== 'N/A' ? '•••••••••••' : parentPhone})</span>
                  <button
                    type="button"
                    onClick={() => setMaskPrivate((m) => !m)}
                    className="p-0.5 rounded hover:bg-white/15 cursor-pointer"
                    title={maskPrivate ? 'Show details' : 'Mask private details'}
                  >
                    {maskPrivate ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
                  </button>
                </div>
                <div className="flex flex-wrap items-center gap-2 pt-0.5">
                  <span className="px-2.5 py-0.5 rounded-md bg-white/15 text-[11px] font-semibold">
                    Roll {activeStudent.rollNumber || 'N/A'}
                  </span>
                  <span className="px-2.5 py-0.5 rounded-md bg-white/15 text-[11px] font-semibold">
                    ADM {activeStudent.admissionNo || activeStudent.registrationNo || String(activeStudent.id || '').slice(-8).toUpperCase()}
                  </span>
                  <span className="px-2.5 py-0.5 rounded-md bg-white/15 text-[11px] font-semibold">
                    {activeStudent.className || activeStudent.course || 'Class'} {activeStudent.section ? `· ${activeStudent.section}` : ''}
                  </span>
                  <span className="px-2.5 py-0.5 rounded-md bg-white/15 text-[11px] font-semibold">
                    {activeStudent.phone || parentPhone}
                  </span>
                </div>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2 shrink-0">
              <button
                type="button"
                onClick={() => onOpenQuickPayment?.(activeStudent.id)}
                className="px-3.5 py-2 rounded-lg bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-bold flex items-center gap-1.5 shadow-sm cursor-pointer transition-colors"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Payment</span>
              </button>
              <button
                type="button"
                onClick={() => setPrintModalFee(pendingInvoices[0] || studentFees[0] || { studentId: activeStudent.id, studentName: activeStudent.fullName || activeStudent.name, className: activeStudent.className })}
                className="px-3.5 py-2 rounded-lg bg-white hover:bg-slate-50 text-slate-800 text-xs font-bold flex items-center gap-1.5 shadow-sm cursor-pointer transition-colors"
              >
                <FileText className="w-3.5 h-3.5 text-slate-600" />
                <span>Generate Voucher</span>
              </button>
              <button
                type="button"
                onClick={() => onRouteChange?.('inst-fees')}
                className="px-3.5 py-2 rounded-lg bg-white/15 hover:bg-white/25 border border-white/25 text-white text-xs font-semibold flex items-center gap-1.5 cursor-pointer transition-colors"
              >
                <Sliders className="w-3.5 h-3.5" />
                <span>Fee Setup</span>
              </button>
              <button
                type="button"
                onClick={() => setProfileModalOpen(true)}
                className="px-3.5 py-2 rounded-lg bg-white/15 hover:bg-white/25 border border-white/25 text-white text-xs font-semibold flex items-center gap-1.5 cursor-pointer transition-colors"
              >
                <User className="w-3.5 h-3.5" />
                <span>View Profile</span>
              </button>
            </div>
          </div>

          {/* 5 Tabs Card */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden">
            <div className="flex flex-wrap items-center gap-1 px-4 border-b border-slate-200 bg-slate-50/50">
              {[
                { id: 'pending', label: 'Pending Payments', count: summary.pendingCount, badgeCls: 'bg-rose-500 text-white', icon: AlertTriangle },
                { id: 'completed', label: 'Completed Payments', count: summary.paidCount, badgeCls: 'bg-emerald-500 text-white', icon: CheckCircle2 },
                { id: 'waivers', label: 'Waiver / Discount', count: summary.waiverCount, badgeCls: 'bg-cyan-500 text-white', icon: Percent },
                { id: 'ledger', label: 'Billing Ledger', count: null, icon: List },
                { id: 'credit', label: 'Family Credit', count: null, icon: Wallet }
              ].map((tab) => {
                const Icon = tab.icon
                const isActive = activeTab === tab.id
                return (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => setActiveTab(tab.id)}
                    className={`px-3.5 py-3 text-xs font-bold flex items-center gap-1.5 border-b-2 transition-colors cursor-pointer ${
                      isActive
                        ? 'border-blue-600 text-blue-600 bg-white'
                        : 'border-transparent text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    <Icon className="w-3.5 h-3.5" />
                    <span>{tab.label}</span>
                    {tab.count !== null && (
                      <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold leading-none ${tab.badgeCls}`}>
                        {tab.count}
                      </span>
                    )}
                  </button>
                )
              })}
            </div>

            <div className="p-4 space-y-4">
              {/* TAB 1: PENDING PAYMENTS */}
              {activeTab === 'pending' && (
                pendingInvoices.length === 0 ? (
                  <div className="py-10 text-center">
                    <CheckCircle2 className="w-10 h-10 text-emerald-500 mx-auto mb-2" />
                    <p className="text-sm font-bold text-slate-800">All clear — no pending invoices!</p>
                    <p className="text-xs text-slate-500 mt-1">This student has zero outstanding fee invoices.</p>
                  </div>
                ) : (
                  pendingInvoices.map((fee) => {
                    const total = getInvoiceTotal(fee)
                    const paid = getInvoicePaid(fee)
                    const waived = getInvoiceWaiver(fee)
                    const remaining = getInvoiceRemaining(fee)
                    const fine = Number(fee.fine || fee.lateFine || 0)
                    const pct = total > 0 ? Math.min(100, Math.round(((paid + waived) / total) * 1000) / 10) : 0
                    const smsChecked = smsChecks[fee.id] !== false
                    const waiveFineChecked = Boolean(waiveFineChecks[fee.id])
                    const dueDateStr = fee.dueDate || 'N/A'

                    return (
                      <div
                        key={fee.id}
                        className="rounded-xl border border-slate-200 border-l-4 border-l-rose-500 bg-white p-4 shadow-2xs space-y-3"
                      >
                        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-start">
                          {/* Left Invoice Identity */}
                          <div className="lg:col-span-3 space-y-2">
                            <div className="flex items-center gap-1.5 text-sm font-bold text-slate-900">
                              <FileText className="w-4 h-4 text-slate-400" />
                              <span>{fee.feeMonth || fee.title || fee.feeType || 'Monthly Fee'}</span>
                            </div>
                            <div className="flex flex-wrap items-center gap-1.5">
                              <span className="px-2 py-0.5 rounded bg-slate-700 text-white text-[10px] font-bold">
                                {fee.frequency || 'Monthly'}
                              </span>
                              {fee.feeMonth && (
                                <span className="px-2 py-0.5 rounded bg-cyan-500 text-white text-[10px] font-bold inline-flex items-center gap-1">
                                  <Calendar className="w-2.5 h-2.5" />
                                  {fee.feeMonth}
                                </span>
                              )}
                            </div>
                            <div className="text-[11px] space-y-0.5 pt-1">
                              <div className="flex items-center gap-4">
                                <span className="text-slate-400">Receipt #</span>
                                <span className="font-bold text-blue-600">{fee.receiptNo || fee.invoiceNo || String(fee.id).slice(-7)}</span>
                              </div>
                              <div className="flex items-center gap-5">
                                <span className="text-slate-400">Created</span>
                                <span className="text-slate-600 font-medium">{String(fee.createdAt || fee.dueDate || 'Today').slice(0, 16).replace('T', ' ')}</span>
                              </div>
                            </div>
                          </div>

                          {/* Middle Progress & Numbers */}
                          <div className="lg:col-span-6 space-y-3">
                            <div>
                              <div className="flex items-center justify-between text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                                <span className="flex items-center gap-1">PAYMENT PROGRESS</span>
                                <span className="text-slate-700">{pct.toFixed(1)}%</span>
                              </div>
                              <div className="h-2 w-full rounded-full bg-slate-100 overflow-hidden">
                                <div
                                  className="h-full bg-emerald-500 transition-all"
                                  style={{ width: `${pct}%` }}
                                />
                              </div>
                            </div>

                            <div className="grid grid-cols-3 gap-2 pt-1 text-center">
                              <div>
                                <p className="text-[11px] text-slate-400 font-medium">Total</p>
                                <p className="text-sm font-extrabold text-slate-900">{formatMoney(total)}</p>
                              </div>
                              <div>
                                <p className="text-[11px] text-slate-400 font-medium">Cash paid</p>
                                <p className="text-sm font-extrabold text-emerald-600">{formatMoney(paid)}</p>
                              </div>
                              <div>
                                <p className="text-[11px] text-slate-400 font-medium">Remaining balance</p>
                                <p className="text-sm font-extrabold text-rose-600">{formatMoney(remaining)}</p>
                              </div>
                            </div>
                          </div>

                          {/* Right Action Box (Pay Now vs Zero fee) */}
                          <div className="lg:col-span-3 rounded-xl bg-slate-50 border border-slate-200 p-3 space-y-2.5">
                            {remaining > 0 ? (
                              <>
                                <div className="flex items-center gap-1.5 text-xs font-bold text-slate-700">
                                  <CreditCard className="w-3.5 h-3.5 text-slate-500" />
                                  <span>Pay Now</span>
                                </div>
                                <div className="flex items-center gap-1.5">
                                  <input
                                    type="number"
                                    min="0"
                                    placeholder="Enter amount"
                                    value={payInputs[fee.id] ?? ''}
                                    onChange={(e) => setPayInputs((prev) => ({ ...prev, [fee.id]: e.target.value }))}
                                    className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 bg-white text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-rose-500/20"
                                  />
                                  <button
                                    type="button"
                                    disabled={processingId === fee.id}
                                    onClick={() => handlePayInvoice(fee)}
                                    className="px-3 py-1.5 rounded-lg bg-rose-500 hover:bg-rose-600 text-white text-xs font-bold shrink-0 inline-flex items-center gap-1 cursor-pointer disabled:opacity-50"
                                  >
                                    <Send className="w-3 h-3" />
                                    <span>Pay Now</span>
                                  </button>
                                </div>
                                <label className="flex items-center gap-1.5 text-[11px] font-semibold text-slate-700 cursor-pointer">
                                  <input
                                    type="checkbox"
                                    checked={smsChecked}
                                    onChange={(e) => setSmsChecks((prev) => ({ ...prev, [fee.id]: e.target.checked }))}
                                    className="rounded border-slate-300 text-blue-600"
                                  />
                                  <span>Send SMS to Parent</span>
                                </label>
                                <div className="text-[11px] flex flex-wrap items-center gap-2 text-slate-600">
                                  <span className="inline-flex items-center gap-1 text-sky-700 font-medium">
                                    <Calendar className="w-3 h-3" />
                                    Due date: {dueDateStr}
                                  </span>
                                  {fine > 0 && (
                                    <span className="text-rose-600 font-semibold">· Fine: {formatMoney(fine)}</span>
                                  )}
                                </div>
                                {fine > 0 && (
                                  <div className="pt-1 border-t border-slate-200 space-y-1.5">
                                    <label className="flex items-center gap-1.5 text-[11px] font-bold text-amber-700 cursor-pointer">
                                      <input
                                        type="checkbox"
                                        checked={waiveFineChecked}
                                        onChange={(e) => setWaiveFineChecks((prev) => ({ ...prev, [fee.id]: e.target.checked }))}
                                        className="rounded border-slate-300 text-amber-600"
                                      />
                                      <span>Waive Late Fee ({formatMoney(fine)})</span>
                                    </label>
                                    <input
                                      type="text"
                                      placeholder="Reason for waiving (optional)"
                                      value={waiveFineReasons[fee.id] || ''}
                                      onChange={(e) => setWaiveFineReasons((prev) => ({ ...prev, [fee.id]: e.target.value }))}
                                      className="w-full px-2.5 py-1 rounded border border-slate-200 bg-white text-[11px] text-slate-700"
                                    />
                                  </div>
                                )}
                              </>
                            ) : (
                              <>
                                <div className="flex items-center gap-1.5 text-xs font-bold text-slate-800">
                                  <CheckCircle2 className="w-3.5 h-3.5 text-slate-600" />
                                  <span>Zero fee</span>
                                </div>
                                <div className="flex items-center justify-between gap-2">
                                  <span className="text-xs text-slate-500">No cash due</span>
                                  <button
                                    type="button"
                                    disabled={processingId === fee.id}
                                    onClick={() => handleMarkZeroFeePaid(fee)}
                                    className="px-3 py-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-bold cursor-pointer disabled:opacity-50"
                                  >
                                    ✓ Mark as Paid
                                  </button>
                                </div>
                                <label className="flex items-center gap-1.5 text-[11px] font-semibold text-slate-700 cursor-pointer">
                                  <input
                                    type="checkbox"
                                    checked={smsChecked}
                                    onChange={(e) => setSmsChecks((prev) => ({ ...prev, [fee.id]: e.target.checked }))}
                                    className="rounded border-slate-300 text-blue-600"
                                  />
                                  <span>Send SMS to Parent</span>
                                </label>
                              </>
                            )}
                          </div>
                        </div>

                        {/* Bottom Action Pills */}
                        <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-slate-100">
                          {remaining > 0 && (
                            <button
                              type="button"
                              onClick={() => {
                                setWaiverModalFee(fee)
                                setWaiverInput('')
                                setWaiverReasonInput(fee.discountReason || '')
                              }}
                              className="px-3 py-1.5 rounded-lg border border-cyan-300 text-cyan-700 hover:bg-cyan-50 text-xs font-semibold inline-flex items-center gap-1.5 cursor-pointer"
                            >
                              <Percent className="w-3.5 h-3.5" />
                              <span>Apply Waiver/Discount</span>
                            </button>
                          )}
                          <button
                            type="button"
                            onClick={() => setDeleteTargetFee(fee)}
                            className="px-3 py-1.5 rounded-lg border border-rose-300 text-rose-600 hover:bg-rose-50 text-xs font-semibold inline-flex items-center gap-1.5 cursor-pointer"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                            <span>Delete Invoice</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => setPrintModalFee(fee)}
                            className="px-3 py-1.5 rounded-lg border border-sky-300 text-sky-700 hover:bg-sky-50 text-xs font-semibold inline-flex items-center gap-1.5 cursor-pointer"
                          >
                            <Printer className="w-3.5 h-3.5" />
                            <span>Fee Invoice</span>
                          </button>
                          {fee.smsSent && (
                            <span className="px-2.5 py-1 rounded-md bg-emerald-100 text-emerald-700 text-[11px] font-bold inline-flex items-center gap-1">
                              <CheckCircle2 className="w-3 h-3" />
                              SMS Sent
                            </span>
                          )}
                        </div>
                      </div>
                    )
                  })
                )
              )}

              {/* TAB 2: COMPLETED PAYMENTS */}
              {activeTab === 'completed' && (
                completedInvoices.length === 0 ? (
                  <p className="text-center text-xs text-slate-500 py-8">No completed payments recorded yet.</p>
                ) : (
                  <div className="space-y-3">
                    {completedInvoices.map((fee) => (
                      <div
                        key={fee.id}
                        className="rounded-xl border border-slate-200 border-l-4 border-l-emerald-500 p-4 flex flex-wrap items-center justify-between gap-4"
                      >
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-bold text-slate-900">{fee.feeMonth || fee.title || 'Monthly Fee'}</span>
                            <span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-700 text-[10px] font-bold">Paid</span>
                            {fee.paymentMethod && (
                              <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-600 text-[10px] font-semibold">{fee.paymentMethod}</span>
                            )}
                          </div>
                          <p className="text-xs text-slate-500 mt-0.5">
                            Receipt #{fee.receiptNo || fee.invoiceNo || String(fee.id).slice(-7)} · Paid on {String(fee.paidAt || fee.dueDate || 'Completed').slice(0, 10)}
                          </p>
                        </div>
                        <div className="flex items-center gap-4">
                          <div className="text-right">
                            <p className="text-[11px] text-slate-400">Cash Paid</p>
                            <p className="text-sm font-extrabold text-emerald-600">{formatMoney(getInvoicePaid(fee))}</p>
                          </div>
                          {getInvoiceWaiver(fee) > 0 && (
                            <div className="text-right">
                              <p className="text-[11px] text-slate-400">Waiver</p>
                              <p className="text-sm font-bold text-cyan-600">{formatMoney(getInvoiceWaiver(fee))}</p>
                            </div>
                          )}
                          <button
                            type="button"
                            onClick={() => setPrintModalFee(fee)}
                            className="px-3 py-1.5 rounded-lg border border-sky-300 text-sky-700 hover:bg-sky-50 text-xs font-semibold inline-flex items-center gap-1 cursor-pointer"
                          >
                            <Printer className="w-3.5 h-3.5" />
                            <span>Fee Invoice</span>
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )
              )}

              {/* TAB 3: WAIVER / DISCOUNT */}
              {activeTab === 'waivers' && (
                waiverInvoices.length === 0 ? (
                  <p className="text-center text-xs text-slate-500 py-8">No waivers or discounts applied on this student&apos;s invoices.</p>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase text-[10px] font-bold">
                        <tr>
                          <th className="py-2.5 px-3">Invoice</th>
                          <th className="py-2.5 px-3">Receipt #</th>
                          <th className="py-2.5 px-3">Waiver / Discount</th>
                          <th className="py-2.5 px-3">Late Fine Waived</th>
                          <th className="py-2.5 px-3">Reason</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {waiverInvoices.map((fee) => (
                          <tr key={fee.id} className="hover:bg-slate-50">
                            <td className="py-2.5 px-3 font-bold text-slate-800">{fee.feeMonth || fee.title || 'Monthly Fee'}</td>
                            <td className="py-2.5 px-3 text-blue-600 font-semibold">#{fee.receiptNo || fee.invoiceNo || String(fee.id).slice(-7)}</td>
                            <td className="py-2.5 px-3 font-bold text-cyan-600">{formatMoney(getInvoiceWaiver(fee))}</td>
                            <td className="py-2.5 px-3 font-semibold text-amber-600">{formatMoney(fee.waivedLateFee || 0)}</td>
                            <td className="py-2.5 px-3 text-slate-600">{fee.discountReason || fee.waiveFineReason || 'Management discount'}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )
              )}

              {/* TAB 4: BILLING LEDGER */}
              {activeTab === 'ledger' && (
                ledgerRows.length === 0 ? (
                  <p className="text-center text-xs text-slate-500 py-8">No billing ledger entries yet.</p>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase text-[10px] font-bold">
                        <tr>
                          <th className="py-2.5 px-3">Date</th>
                          <th className="py-2.5 px-3">Entry Type</th>
                          <th className="py-2.5 px-3">Ref</th>
                          <th className="py-2.5 px-3">Description</th>
                          <th className="py-2.5 px-3 text-right">Debit (Billed)</th>
                          <th className="py-2.5 px-3 text-right">Credit (Paid/Waived)</th>
                          <th className="py-2.5 px-3 text-right">Balance</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {ledgerRows.map((row) => (
                          <tr key={row.id} className="hover:bg-slate-50">
                            <td className="py-2.5 px-3 text-slate-500">{row.date}</td>
                            <td className="py-2.5 px-3 font-bold text-slate-800">{row.type}</td>
                            <td className="py-2.5 px-3 text-blue-600 font-semibold">{row.ref}</td>
                            <td className="py-2.5 px-3 text-slate-600">{row.description}</td>
                            <td className="py-2.5 px-3 text-right font-semibold text-slate-800">{row.debit > 0 ? formatMoney(row.debit) : '—'}</td>
                            <td className="py-2.5 px-3 text-right font-semibold text-emerald-600">{row.credit > 0 ? formatMoney(row.credit) : '—'}</td>
                            <td className="py-2.5 px-3 text-right font-extrabold text-slate-900">{formatMoney(row.balance)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )
              )}

              {/* TAB 5: FAMILY CREDIT */}
              {activeTab === 'credit' && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="rounded-xl border border-emerald-200 bg-emerald-50/40 p-4 space-y-3">
                    <div>
                      <p className="text-[11px] font-bold uppercase text-emerald-700 tracking-wider">Available Family Credit</p>
                      <p className="text-2xl font-extrabold text-emerald-700 mt-1">{formatMoney(familyCreditBalance)}</p>
                      <p className="text-xs text-slate-500 mt-0.5">
                        Guardian CNIC: <span className="font-semibold text-slate-700">{parentCnic || 'Not linked'}</span>
                      </p>
                    </div>
                    <form onSubmit={handleDepositCredit} className="flex items-center gap-2 pt-2 border-t border-emerald-200/70">
                      <input
                        type="number"
                        min="1"
                        placeholder="Add advance credit (PKR)"
                        value={creditDepositAmount}
                        onChange={(e) => setCreditDepositAmount(e.target.value)}
                        className="flex-1 px-3 py-2 rounded-lg border border-slate-200 bg-white text-xs font-semibold"
                      />
                      <button
                        type="submit"
                        className="px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold cursor-pointer"
                      >
                        + Add Credit
                      </button>
                    </form>
                  </div>

                  <div className="rounded-xl border border-slate-200 p-4 space-y-2">
                    <p className="text-xs font-bold text-slate-800">Linked Family Students ({familySiblings.length})</p>
                    <div className="space-y-1.5 max-h-40 overflow-y-auto">
                      {familySiblings.map((sib) => (
                        <div
                          key={sib.id}
                          onClick={() => onSelectStudent?.(sib.id)}
                          className="flex items-center justify-between px-3 py-2 rounded-lg bg-slate-50 hover:bg-slate-100 cursor-pointer text-xs"
                        >
                          <span className="font-bold text-slate-800">{sib.fullName || sib.name}</span>
                          <span className="text-slate-500">{sib.className || sib.course || 'Class'} · Roll {sib.rollNumber || 'N/A'}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </>
      )}

      {/* Apply Waiver/Discount Modal */}
      {waiverModalFee && (
        <div className="fixed inset-0 z-[110] bg-slate-900/50 backdrop-blur-[1px] flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-md overflow-hidden border border-slate-200">
            <div className="bg-cyan-600 px-5 py-3 flex items-center justify-between text-white">
              <span className="text-sm font-bold">Apply Waiver / Discount</span>
              <button type="button" onClick={() => setWaiverModalFee(null)} className="text-white/80 hover:text-white cursor-pointer">✕</button>
            </div>
            <form onSubmit={handleApplyModalWaiver} className="p-5 space-y-3">
              <p className="text-xs text-slate-600">
                Invoice: <strong>{waiverModalFee.feeMonth || waiverModalFee.title || 'Monthly'}</strong> · Remaining: <strong className="text-rose-600">{formatMoney(getInvoiceRemaining(waiverModalFee))}</strong>
              </p>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Waiver Amount (PKR)</label>
                <input
                  type="number"
                  min="1"
                  max={getInvoiceRemaining(waiverModalFee)}
                  value={waiverInput}
                  onChange={(e) => setWaiverInput(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 text-xs font-semibold"
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Reason of Discount</label>
                <input
                  type="text"
                  placeholder="e.g. Management approval, hardship"
                  value={waiverReasonInput}
                  onChange={(e) => setWaiverReasonInput(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 text-xs"
                />
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button type="button" onClick={() => setWaiverModalFee(null)} className="px-3.5 py-2 rounded-lg border border-slate-200 text-xs font-semibold text-slate-600 cursor-pointer">Cancel</button>
                <button type="submit" className="px-4 py-2 rounded-lg bg-cyan-600 hover:bg-cyan-700 text-white text-xs font-bold cursor-pointer">Apply Waiver</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Invoice Confirmation Modal */}
      {deleteTargetFee && (
        <div className="fixed inset-0 z-[110] bg-slate-900/50 backdrop-blur-[1px] flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-sm p-5 space-y-4 border border-slate-200">
            <h3 className="text-sm font-bold text-slate-900">Delete Invoice?</h3>
            <p className="text-xs text-slate-600">
              Remove invoice <strong>#{deleteTargetFee.receiptNo || deleteTargetFee.invoiceNo || String(deleteTargetFee.id).slice(-7)}</strong> ({deleteTargetFee.feeMonth || 'Monthly'})? This cannot be undone.
            </p>
            <div className="flex justify-end gap-2">
              <button type="button" onClick={() => setDeleteTargetFee(null)} className="px-3.5 py-2 rounded-lg border border-slate-200 text-xs font-semibold text-slate-600 cursor-pointer">Cancel</button>
              <button type="button" onClick={handleConfirmDeleteInvoice} className="px-4 py-2 rounded-lg bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold cursor-pointer">Delete Invoice</button>
            </div>
          </div>
        </div>
      )}

      {/* View Student Profile Quick Modal */}
      {profileModalOpen && activeStudent && (
        <div className="fixed inset-0 z-[110] bg-slate-900/50 backdrop-blur-[1px] flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden border border-slate-200">
            <div className="bg-indigo-600 px-5 py-3.5 flex items-center justify-between text-white">
              <span className="text-sm font-bold">Student Profile Summary</span>
              <button type="button" onClick={() => setProfileModalOpen(false)} className="text-white/80 hover:text-white cursor-pointer">✕</button>
            </div>
            <div className="p-5 grid grid-cols-2 gap-3 text-xs">
              <div><p className="text-slate-400">Full Name</p><p className="font-bold text-slate-800">{activeStudent.fullName || activeStudent.name}</p></div>
              <div><p className="text-slate-400">Roll / ADM</p><p className="font-bold text-slate-800">{activeStudent.rollNumber || 'N/A'} / {activeStudent.admissionNo || 'N/A'}</p></div>
              <div><p className="text-slate-400">Class / Section</p><p className="font-bold text-slate-800">{activeStudent.className || activeStudent.course || 'N/A'} {activeStudent.section || ''}</p></div>
              <div><p className="text-slate-400">Status</p><p className="font-bold text-emerald-600">{activeStudent.status || 'Active'}</p></div>
              <div><p className="text-slate-400">Guardian</p><p className="font-bold text-slate-800">{parentName}</p></div>
              <div><p className="text-slate-400">Guardian CNIC</p><p className="font-bold text-slate-800">{parentCnic || 'N/A'}</p></div>
              <div><p className="text-slate-400">Phone</p><p className="font-bold text-slate-800">{parentPhone}</p></div>
              <div><p className="text-slate-400">Monthly Tuition</p><p className="font-bold text-slate-800">{formatMoney(activeStudent.monthlyFee || activeStudent.tuitionFee || 0)}</p></div>
            </div>
            <div className="px-5 py-3 bg-slate-50 border-t border-slate-200 flex justify-between">
              <button type="button" onClick={() => { setProfileModalOpen(false); onRouteChange?.('inst-students') }} className="text-xs font-bold text-indigo-600 hover:underline cursor-pointer">Open Full Directory →</button>
              <button type="button" onClick={() => setProfileModalOpen(false)} className="px-4 py-1.5 rounded-lg bg-slate-800 text-white text-xs font-semibold cursor-pointer">Close</button>
            </div>
          </div>
        </div>
      )}

      {/* Printable Fee Challan Modal */}
      {printModalFee && (
        <PrintableFeeChallanModal
          isOpen={Boolean(printModalFee)}
          onClose={() => setPrintModalFee(null)}
          selectedFee={printModalFee}
          allFees={studentFees}
          students={instituteStudents}
          currentInstitute={currentInstitute}
          defaultClass={activeStudent?.className || ''}
        />
      )}
    </div>
  )
}

export default StudentBillingHistoryView
