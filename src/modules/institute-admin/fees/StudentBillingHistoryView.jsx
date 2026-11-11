import React, { useState, useMemo, useRef, useEffect } from 'react'
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
  PlusCircle,
  Sliders,
  User,
  Receipt,
  RotateCcw,
  History,
  Edit2,
  Users,
  X,
  Check
} from 'lucide-react'
import { useAppData } from '../../../context/AppDataContext'
import { useToast } from '../../../context/ToastContext'
import { PrintableFeeChallanModal } from '../../../components/common/PrintableFeeChallanModal'
import { BANK_PRESETS, QrCodeSvg } from '../../../components/common/PrintHelpers'
import {
  getFamilyCreditBalance,
  updateFamilyCreditBalance,
  applyPaymentDistributionToInvoices
} from '../../../components/common/QuickPaymentModal'
import { recordCampusLedgerTransaction } from '../accounts/CampusAccountsView'

const normalizeCnic = (val = '') => String(val).replace(/[^0-9]/g, '')

const formatMoney = (val) => `PKR ${Number(val || 0).toLocaleString()}`

const formatInvoiceDate = (val) => {
  if (!val) return '—'
  const dt = new Date(val)
  if (Number.isNaN(dt.getTime())) return String(val).slice(0, 10)
  return dt.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })
}

const classifyInvoiceCategory = (fee) => {
  const tag = `${fee?.feeType || ''} ${fee?.category || ''} ${fee?.title || ''}`.toLowerCase()
  if (tag.includes('store') || tag.includes('inventory') || tag.includes('book') || tag.includes('uniform') || tag.includes('stationary')) {
    return 'store'
  }
  if (tag.includes('individual') || tag.includes('exam') || tag.includes('admission') || tag.includes('lab') || tag.includes('registration') || tag.includes('misc')) {
    return 'individual'
  }
  return 'tuition'
}

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
  onOpenSendSms,
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
  const [transactionsModalFee, setTransactionsModalFee] = useState(null)
  const [receiptSlipFee, setReceiptSlipFee] = useState(null)
  const [reverseConfirm, setReverseConfirm] = useState(null) // { type: 'waiver' | 'payment', fee }
  const [profileModalOpen, setProfileModalOpen] = useState(false)
  const [creditDepositAmount, setCreditDepositAmount] = useState('')
  const [creditTick, setCreditTick] = useState(0)

  // Generate Voucher Dropdown & Combined Family Voucher Modal
  const [voucherMenuOpen, setVoucherMenuOpen] = useState(false)
  const voucherMenuRef = useRef(null)
  const [familyVoucherOpen, setFamilyVoucherOpen] = useState(false)
  const [familyVoucherBankId, setFamilyVoucherBankId] = useState('hbl')
  const [familyVoucherDueDate, setFamilyVoucherDueDate] = useState(() => {
    const d = new Date()
    d.setDate(d.getDate() + 10)
    return d.toISOString().split('T')[0]
  })

  // Generate Full Invoice Modal & Full Receipt Print Preview
  const [fullInvoiceModalOpen, setFullInvoiceModalOpen] = useState(false)
  const [fiCategories, setFiCategories] = useState({
    tuition: true,
    individual: true,
    store: true,
    fines: true
  })
  const [fiShowInstallments, setFiShowInstallments] = useState(false)
  const [fiShowPaymentMethods, setFiShowPaymentMethods] = useState(true)
  const [fiPrintLayout, setFiPrintLayout] = useState('a4') // 'a4' | 'horizontal' | 'vertical'
  const [fiCopies, setFiCopies] = useState(3)
  const [fiReceiptPreviewOpen, setFiReceiptPreviewOpen] = useState(false)

  // Student Banner Dedicated Add Payment Modal + Split Allocation
  const [isBannerPayOpen, setIsBannerPayOpen] = useState(false)
  const [bpCash, setBpCash] = useState('0')
  const [bpWaiver, setBpWaiver] = useState('0')
  const [bpDiscountReason, setBpDiscountReason] = useState('')
  const [bpMethod, setBpMethod] = useState('')
  const [bpNote, setBpNote] = useState('')
  const [bpSendSms, setBpSendSms] = useState(true)
  const [bpSaving, setBpSaving] = useState(false)
  const [bpAllocateType, setBpAllocateType] = useState(null) // 'cash' | 'waiver' | null
  const [bpCashSplits, setBpCashSplits] = useState({})
  const [bpWaiverSplits, setBpWaiverSplits] = useState({})

  useEffect(() => {
    if (!voucherMenuOpen) return undefined
    const handleOutsideClick = (event) => {
      if (voucherMenuRef.current && !voucherMenuRef.current.contains(event.target)) {
        setVoucherMenuOpen(false)
      }
    }
    document.addEventListener('mousedown', handleOutsideClick)
    return () => document.removeEventListener('mousedown', handleOutsideClick)
  }, [voucherMenuOpen])

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

  // Combined Family Voucher aggregation across all linked siblings
  const familyVoucherData = useMemo(() => {
    const siblingList = familySiblings.length > 0 ? familySiblings : activeStudent ? [activeStudent] : []
    const rows = siblingList.map((st) => {
      const pending = fees.filter(
        (f) =>
          (!currentInstitute?.id || f.instituteId === currentInstitute.id || !f.instituteId) &&
          f.status !== 'Paid' &&
          ((f.studentId && f.studentId === st.id) ||
            (f.studentName || '').toLowerCase().trim() === (st.fullName || st.name || '').toLowerCase().trim()) &&
          getInvoiceRemaining(f) > 0
      )
      const subtotal = pending.reduce((sum, f) => sum + getInvoiceRemaining(f), 0)
      return { student: st, pendingInvoices: pending, subtotal }
    })
    const grandTotal = rows.reduce((sum, r) => sum + r.subtotal, 0)
    const activeBank = BANK_PRESETS.find((b) => b.id === familyVoucherBankId) || BANK_PRESETS[0]
    return { rows, grandTotal, activeBank }
  }, [familySiblings, activeStudent, fees, currentInstitute?.id, familyVoucherBankId])

  // Generate Full Invoice category totals & printable invoice lines
  const fullInvoiceSummary = useMemo(() => {
    const totals = { tuition: 0, individual: 0, store: 0, fines: 0 }
    const todayStart = new Date(new Date().toDateString()).getTime()
    const sortedPending = [...pendingInvoices].sort((a, b) =>
      String(a.createdAt || a.dueDate || '').localeCompare(String(b.createdAt || b.dueDate || ''))
    )

    const lines = []
    sortedPending.forEach((fee) => {
      const remTotal = getInvoiceRemaining(fee)
      if (remTotal <= 0) return
      const finePart = Math.min(remTotal, Math.max(0, Number(fee?.fine || fee?.lateFine || 0)))
      const principalPart = Math.max(0, remTotal - finePart)
      const cat = classifyInvoiceCategory(fee)

      totals[cat] += principalPart
      totals.fines += finePart

      const includePrincipal = Boolean(fiCategories[cat])
      const includeFine = Boolean(fiCategories.fines)
      const dueContribution = (includePrincipal ? principalPart : 0) + (includeFine ? finePart : 0)

      if (dueContribution > 0) {
        const dueTime = fee.dueDate ? new Date(fee.dueDate).getTime() : NaN
        const isOverdue = !Number.isNaN(dueTime) && dueTime < todayStart
        lines.push({
          fee,
          category: cat,
          principalDue: includePrincipal ? principalPart : 0,
          fineDue: includeFine ? finePart : 0,
          amountDue: dueContribution,
          isOverdue
        })
      }
    })

    const selectedOutstanding = lines.reduce((sum, l) => sum + l.amountDue, 0)
    const totalAfterDueDate = lines.reduce((sum, l) => sum + l.amountDue + (l.fineDue > 0 ? 0 : Number(l.fee?.afterDueSurcharge || 0)), 0)
    const latestDueDate =
      lines
        .map((l) => l.fee?.dueDate)
        .filter(Boolean)
        .sort()
        .slice(-1)[0] || ''

    return {
      totals,
      lines,
      selectedOutstanding,
      totalAfterDueDate,
      selectedCount: lines.length,
      collectedAmount: summary.cashCollected,
      collectedCount: summary.paidCount,
      latestDueDate
    }
  }, [pendingInvoices, fiCategories, summary.cashCollected, summary.paidCount])

  const openFullInvoiceModal = () => {
    setFiCategories({ tuition: true, individual: true, store: true, fines: true })
    setFiShowInstallments(false)
    setFiShowPaymentMethods(true)
    setFiPrintLayout('a4')
    setFiCopies(3)
    setFiReceiptPreviewOpen(false)
    setFullInvoiceModalOpen(true)
  }

  const bpCashVal = Math.max(0, Number(bpCash) || 0)
  const bpWaiverVal = Math.max(0, Number(bpWaiver) || 0)
  const bpTotalApplied = bpCashVal + bpWaiverVal
  const bpRemainingBalance = Math.max(0, summary.outstanding - bpTotalApplied)
  const bpHasValidAmount = bpTotalApplied > 0
  const bpSplitSum =
    bpAllocateType === 'cash'
      ? pendingInvoices.reduce((s, inv) => s + Math.max(0, Number(bpCashSplits[inv.id]) || 0), 0)
      : pendingInvoices.reduce((s, inv) => s + Math.max(0, Number(bpWaiverSplits[inv.id]) || 0), 0)

  const openBannerPaymentModal = () => {
    setBpCash('0')
    setBpWaiver('0')
    setBpDiscountReason('')
    setBpMethod('')
    setBpNote('')
    setBpSendSms(true)
    setBpAllocateType(null)
    setBpCashSplits({})
    setBpWaiverSplits({})
    setIsBannerPayOpen(true)
  }

  const openBpAllocateModal = (type) => {
    if (pendingInvoices.length === 0) {
      toast?.info?.('No unpaid invoices available to allocate for this student.')
      return
    }
    const init = {}
    const source = type === 'cash' ? bpCashSplits : bpWaiverSplits
    pendingInvoices.forEach((inv) => {
      init[inv.id] = source[inv.id] !== undefined ? String(source[inv.id]) : '0'
    })
    if (type === 'cash') setBpCashSplits(init)
    else setBpWaiverSplits(init)
    setBpAllocateType(type)
  }

  const applyBpAllocationSplit = () => {
    if (bpAllocateType === 'cash') {
      const sum = pendingInvoices.reduce((s, inv) => s + Math.max(0, Number(bpCashSplits[inv.id]) || 0), 0)
      setBpCash(String(sum))
    } else if (bpAllocateType === 'waiver') {
      const sum = pendingInvoices.reduce((s, inv) => s + Math.max(0, Number(bpWaiverSplits[inv.id]) || 0), 0)
      setBpWaiver(String(sum))
    }
    setBpAllocateType(null)
  }

  const handleSaveBannerPayment = async (e) => {
    e.preventDefault()
    if (!activeStudent) return
    if (!bpHasValidAmount) {
      toast?.error?.('Enter cash collected and/or waiver greater than zero.')
      return
    }
    if (!bpMethod) {
      toast?.error?.('Please select a Payment Method.')
      return
    }
    if (pendingInvoices.length === 0) {
      toast?.error?.('No pending invoices available for this student.')
      return
    }

    setBpSaving(true)
    try {
      const fifoInvoices = [...pendingInvoices].sort((a, b) =>
        String(a.createdAt || a.dueDate || '').localeCompare(String(b.createdAt || b.dueDate || ''))
      )
      await applyPaymentDistributionToInvoices({
        unpaidInvoices: fifoInvoices,
        cashVal: bpCashVal,
        waiverVal: bpWaiverVal,
        creditApplied: 0,
        cashSplits: bpCashSplits,
        waiverSplits: bpWaiverSplits,
        discountReason: bpDiscountReason,
        paymentMethod: bpMethod,
        extraNote: bpNote,
        updateItem
      })

      if (bpRemainingBalance <= 0) {
        await updateItem('students', activeStudent.id, { feeStatus: 'Paid' })
      }

      if (bpCashVal > 0) {
        const studentLabel = activeStudent.fullName || activeStudent.name
        recordCampusLedgerTransaction(currentInstitute?.id, {
          id: `VCH-BP-${Date.now()}`,
          date: new Date().toISOString().split('T')[0],
          description: `Fee Payment (${bpMethod}) — ${studentLabel}`,
          type: 'Income',
          category: 'Tuition Revenues',
          debit: 0,
          credit: bpCashVal,
          account: bpMethod,
          status: 'Cleared',
          ref: `BP-${Date.now()}`
        })
      }

      if (bpSendSms && parentPhone && parentPhone !== 'N/A' && sendCommunicationBlast) {
        const studentLabel = activeStudent.fullName || activeStudent.name
        sendCommunicationBlast({
          channel: 'SMS',
          recipientGroup: `${parentName} (${parentPhone})`,
          message: `Dear ${parentName}, payment of ${formatMoney(bpCashVal)}${bpWaiverVal > 0 ? ` (waiver ${formatMoney(bpWaiverVal)})` : ''} received via ${bpMethod} for ${studentLabel}. Remaining balance: ${formatMoney(bpRemainingBalance)}.`,
          recipientsCount: 1
        })
      }

      if (logAuditEvent) {
        logAuditEvent(
          `Recorded payment ${formatMoney(bpCashVal)} (waiver ${formatMoney(bpWaiverVal)}) via ${bpMethod} for ${activeStudent.fullName || activeStudent.name}`,
          'Billing History',
          'Success'
        )
      }

      toast?.success?.(`Payment saved for ${activeStudent.fullName || activeStudent.name}. Remaining: ${formatMoney(bpRemainingBalance)}.`)
      setIsBannerPayOpen(false)
    } catch {
      toast?.error?.('Unable to save payment. Please try again.')
    } finally {
      setBpSaving(false)
    }
  }

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

  const handleConfirmReverse = async () => {
    if (!reverseConfirm?.fee) return
    const { type, fee } = reverseConfirm
    try {
      const paidNow = getInvoicePaid(fee)
      const waivedNow = getInvoiceWaiver(fee)
      if (type === 'waiver') {
        const nextRemaining = Math.max(0, Number(fee.amount || 0) + Number(fee.fine || fee.lateFine || 0) - paidNow)
        await updateItem('fees', fee.id, {
          discount: 0,
          discountAmount: 0,
          waiver: 0,
          waivedLateFee: 0,
          discountReason: '',
          status: nextRemaining <= 0 ? 'Paid' : paidNow > 0 ? 'Partial' : 'Pending'
        })
        logAuditEvent?.(`Reversed waiver (${formatMoney(waivedNow)}) for ${activeStudent?.fullName || activeStudent?.name}`, currentInstitute?.name || 'School Admin', 'Success')
        toast(`Reversed waiver of ${formatMoney(waivedNow)}.`, 'info')
      } else {
        const nextRemaining = Math.max(0, getInvoiceTotal(fee) - waivedNow)
        await updateItem('fees', fee.id, {
          paidAmount: 0,
          finalPaid: 0,
          paidAt: null,
          status: nextRemaining <= 0 ? 'Paid' : 'Pending'
        })
        if (paidNow > 0) {
          recordCampusLedgerTransaction(instId, {
            id: `VCH-REV-${fee.id}-${Date.now()}`,
            date: new Date().toISOString().split('T')[0],
            type: 'Expense',
            category: 'Fee Payment Reversal',
            debit: paidNow,
            credit: 0,
            account: fee.paymentMethod || 'Cash',
            status: 'Cleared',
            description: `Payment reversal for ${activeStudent?.fullName || activeStudent?.name} (${fee.feeMonth || fee.title || 'Fee'})`,
            ref: `REV-${fee.id}-${Date.now()}`
          })
        }
        logAuditEvent?.(`Reversed payment (${formatMoney(paidNow)}) for ${activeStudent?.fullName || activeStudent?.name}`, currentInstitute?.name || 'School Admin', 'Success')
        toast(`Reversed cash payment of ${formatMoney(paidNow)}.`, 'info')
      }
      setReverseConfirm(null)
    } catch (err) {
      toast(err?.message || 'Reversal failed.', 'error')
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
            onClick={() => (onOpenSendSms ? onOpenSendSms() : onRouteChange?.('inst-communication-sms'))}
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
                onClick={openBannerPaymentModal}
                className="px-3.5 py-2 rounded-lg bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-bold flex items-center gap-1.5 shadow-sm cursor-pointer transition-colors"
              >
                <PlusCircle className="w-3.5 h-3.5" />
                <span>Add Payment</span>
              </button>
              <div className="relative" ref={voucherMenuRef}>
                <button
                  type="button"
                  onClick={() => setVoucherMenuOpen((v) => !v)}
                  className="px-3.5 py-2 rounded-lg bg-white hover:bg-slate-50 text-slate-800 text-xs font-bold flex items-center gap-1.5 shadow-sm cursor-pointer transition-colors"
                >
                  <FileText className="w-3.5 h-3.5 text-slate-600" />
                  <span>Generate Voucher</span>
                </button>
                {voucherMenuOpen && (
                  <div className="absolute left-0 sm:left-auto sm:right-0 mt-1.5 w-56 bg-white rounded-xl shadow-xl border border-slate-200 py-1.5 z-40 text-left">
                    <button
                      type="button"
                      onClick={() => {
                        setVoucherMenuOpen(false)
                        openFullInvoiceModal()
                      }}
                      className="w-full px-4 py-2.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 flex items-center gap-2.5 cursor-pointer transition-colors"
                    >
                      <FileText className="w-4 h-4 text-sky-600 shrink-0" />
                      <span>Student Voucher</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setVoucherMenuOpen(false)
                        setFamilyVoucherOpen(true)
                      }}
                      className="w-full px-4 py-2.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 flex items-center gap-2.5 cursor-pointer transition-colors"
                    >
                      <Users className="w-4 h-4 text-sky-600 shrink-0" />
                      <span>Combined Family Voucher</span>
                    </button>
                  </div>
                )}
              </div>
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
                                  className={`h-full transition-all ${pct >= 100 ? 'bg-emerald-500' : 'bg-rose-500'}`}
                                  style={{ width: `${pct}%` }}
                                />
                              </div>
                            </div>

                            <div className={`grid ${waived > 0 ? 'grid-cols-4' : 'grid-cols-3'} gap-2 pt-1 text-center`}>
                              <div>
                                <p className="text-[11px] text-slate-400 font-medium">Total</p>
                                <p className="text-sm font-extrabold text-slate-900">{formatMoney(total)}</p>
                              </div>
                              <div>
                                <p className="text-[11px] text-slate-400 font-medium">Cash paid</p>
                                <p className="text-sm font-extrabold text-emerald-600">{formatMoney(paid)}</p>
                              </div>
                              {waived > 0 && (
                                <div>
                                  <p className="text-[11px] text-slate-400 font-medium">Waiver / discount</p>
                                  <p className="text-sm font-extrabold text-teal-600">{formatMoney(waived)}</p>
                                </div>
                              )}
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

                        {/* Bottom Action Pills matching Picks 2 & 3 */}
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
                          {waived > 0 && (
                            <button
                              type="button"
                              onClick={() => setReverseConfirm({ type: 'waiver', fee })}
                              className="px-3 py-1.5 rounded-lg border border-amber-300 text-amber-700 hover:bg-amber-50 text-xs font-semibold inline-flex items-center gap-1.5 cursor-pointer"
                            >
                              <RotateCcw className="w-3.5 h-3.5" />
                              <span>Reverse Waiver</span>
                            </button>
                          )}
                          {(paid > 0 || waived > 0) && (
                            <button
                              type="button"
                              onClick={() => setTransactionsModalFee(fee)}
                              className="px-3 py-1.5 rounded-lg border border-slate-300 text-slate-700 hover:bg-slate-50 text-xs font-semibold inline-flex items-center gap-1.5 cursor-pointer"
                            >
                              <History className="w-3.5 h-3.5" />
                              <span>Transactions</span>
                            </button>
                          )}
                          {paid > 0 && (
                            <button
                              type="button"
                              onClick={() => setReverseConfirm({ type: 'payment', fee })}
                              className="px-3 py-1.5 rounded-lg border border-rose-300 text-rose-600 hover:bg-rose-50 text-xs font-semibold inline-flex items-center gap-1.5 cursor-pointer"
                            >
                              <RotateCcw className="w-3.5 h-3.5" />
                              <span>Reverse payment</span>
                            </button>
                          )}
                          {paid > 0 && (
                            <button
                              type="button"
                              onClick={() => setReceiptSlipFee(fee)}
                              className="px-3 py-1.5 rounded-lg border border-emerald-300 text-emerald-700 hover:bg-emerald-50 text-xs font-semibold inline-flex items-center gap-1.5 cursor-pointer"
                            >
                              <Receipt className="w-3.5 h-3.5" />
                              <span>Receipt Slip</span>
                            </button>
                          )}
                          {paid === 0 && (
                            <button
                              type="button"
                              onClick={() => setDeleteTargetFee(fee)}
                              className="px-3 py-1.5 rounded-lg border border-rose-300 text-rose-600 hover:bg-rose-50 text-xs font-semibold inline-flex items-center gap-1.5 cursor-pointer"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                              <span>Delete Invoice</span>
                            </button>
                          )}
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

      {/* Confirm Reverse Waiver / Payment Modal */}
      {reverseConfirm && (
        <div className="fixed inset-0 z-[110] bg-slate-900/50 backdrop-blur-[1px] flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-sm p-5 space-y-4 border border-slate-200">
            <h3 className="text-sm font-bold text-slate-900">
              {reverseConfirm.type === 'waiver' ? 'Reverse Waiver?' : 'Reverse Payment?'}
            </h3>
            <p className="text-xs text-slate-600">
              {reverseConfirm.type === 'waiver'
                ? `This will remove the applied waiver (${formatMoney(getInvoiceWaiver(reverseConfirm.fee))}) and restore the remaining balance.`
                : `This will reverse the paid amount (${formatMoney(getInvoicePaid(reverseConfirm.fee))}) and post a reversal entry.`}
            </p>
            <div className="flex justify-end gap-2">
              <button type="button" onClick={() => setReverseConfirm(null)} className="px-3.5 py-2 rounded-lg border border-slate-200 text-xs font-semibold text-slate-600 cursor-pointer">
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmReverse}
                className={`px-4 py-2 rounded-lg text-white text-xs font-bold cursor-pointer ${reverseConfirm.type === 'waiver' ? 'bg-amber-600 hover:bg-amber-700' : 'bg-rose-600 hover:bg-rose-700'}`}
              >
                {reverseConfirm.type === 'waiver' ? 'Confirm Reverse Waiver' : 'Confirm Reverse Payment'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Invoice Transactions History Modal */}
      {transactionsModalFee && (
        <div className="fixed inset-0 z-[110] bg-slate-900/50 backdrop-blur-[1px] flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden border border-slate-200">
            <div className="bg-slate-800 px-5 py-3.5 flex items-center justify-between text-white">
              <div className="flex items-center gap-2 text-sm font-bold">
                <History className="w-4 h-4 text-sky-400" />
                <span>Invoice Transactions — #{transactionsModalFee.receiptNo || String(transactionsModalFee.id).slice(-7)}</span>
              </div>
              <button type="button" onClick={() => setTransactionsModalFee(null)} className="text-white/80 hover:text-white cursor-pointer">✕</button>
            </div>
            <div className="p-5 space-y-3 text-xs">
              <div className="border border-slate-200 rounded-xl divide-y divide-slate-100">
                <div className="px-4 py-2.5 flex items-center justify-between">
                  <div>
                    <p className="font-bold text-slate-800">Invoice Created</p>
                    <p className="text-[10px] text-slate-400">{transactionsModalFee.feeMonth || transactionsModalFee.title || 'Tuition Fee'}</p>
                  </div>
                  <span className="font-bold text-slate-900">{formatMoney(getInvoiceTotal(transactionsModalFee))}</span>
                </div>
                {getInvoicePaid(transactionsModalFee) > 0 && (
                  <div className="px-4 py-2.5 flex items-center justify-between bg-emerald-50/40">
                    <div>
                      <p className="font-bold text-emerald-700">Cash Payment Received ({transactionsModalFee.paymentMethod || 'Cash'})</p>
                      <p className="text-[10px] text-slate-500">{String(transactionsModalFee.paidAt || transactionsModalFee.dueDate || 'Recorded').slice(0, 10)}</p>
                    </div>
                    <span className="font-extrabold text-emerald-700">+ {formatMoney(getInvoicePaid(transactionsModalFee))}</span>
                  </div>
                )}
                {getInvoiceWaiver(transactionsModalFee) > 0 && (
                  <div className="px-4 py-2.5 flex items-center justify-between bg-cyan-50/40">
                    <div>
                      <p className="font-bold text-cyan-700">Waiver / Discount Granted</p>
                      <p className="text-[10px] text-slate-500">{transactionsModalFee.discountReason || 'Management approval'}</p>
                    </div>
                    <span className="font-extrabold text-cyan-700">{formatMoney(getInvoiceWaiver(transactionsModalFee))}</span>
                  </div>
                )}
              </div>
              <div className="flex justify-end">
                <button type="button" onClick={() => setTransactionsModalFee(null)} className="px-4 py-1.5 rounded-lg bg-slate-800 text-white font-semibold cursor-pointer">Close</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Cash Receipt Slip Viewer & Print Modal */}
      {receiptSlipFee && (
        <div className="fixed inset-0 z-[110] bg-slate-900/50 backdrop-blur-[1px] flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden border border-slate-200">
            <div className="bg-emerald-600 px-5 py-3 flex items-center justify-between text-white">
              <div className="flex items-center gap-2 text-sm font-bold">
                <Receipt className="w-4 h-4" />
                <span>Payment Receipt Slip</span>
              </div>
              <button type="button" onClick={() => setReceiptSlipFee(null)} className="text-white/80 hover:text-white cursor-pointer">✕</button>
            </div>
            <div className="p-5 space-y-3 text-xs text-slate-800">
              <div className="text-center border-b border-dashed border-slate-300 pb-3">
                <p className="font-extrabold text-sm uppercase">{currentInstitute?.name || 'School Portal'}</p>
                <p className="text-[11px] text-slate-500">Fee Payment Receipt Slip · #{receiptSlipFee.receiptNo || String(receiptSlipFee.id).slice(-7)}</p>
              </div>
              <div className="space-y-1.5">
                <div className="flex justify-between"><span className="text-slate-500">Student:</span><strong>{activeStudent?.fullName || activeStudent?.name}</strong></div>
                <div className="flex justify-between"><span className="text-slate-500">Class / Roll:</span><strong>{activeStudent?.className || 'N/A'} · Roll {activeStudent?.rollNumber || 'N/A'}</strong></div>
                <div className="flex justify-between"><span className="text-slate-500">Invoice:</span><strong>{receiptSlipFee.feeMonth || receiptSlipFee.title || 'Monthly Fee'}</strong></div>
                <div className="flex justify-between"><span className="text-slate-500">Payment Method:</span><strong>{receiptSlipFee.paymentMethod || 'Cash'}</strong></div>
                <div className="flex justify-between border-t border-slate-100 pt-1.5"><span className="text-slate-500">Total Billed:</span><strong>{formatMoney(getInvoiceTotal(receiptSlipFee))}</strong></div>
                <div className="flex justify-between"><span className="text-slate-500">Cash Paid:</span><strong className="text-emerald-600">{formatMoney(getInvoicePaid(receiptSlipFee))}</strong></div>
                {getInvoiceWaiver(receiptSlipFee) > 0 && (
                  <div className="flex justify-between"><span className="text-slate-500">Waiver / Discount:</span><strong className="text-cyan-600">{formatMoney(getInvoiceWaiver(receiptSlipFee))}</strong></div>
                )}
                <div className="flex justify-between font-extrabold text-sm border-t border-slate-200 pt-1.5">
                  <span>Remaining Balance:</span>
                  <span className="text-rose-600">{formatMoney(getInvoiceRemaining(receiptSlipFee))}</span>
                </div>
              </div>
              <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
                <button type="button" onClick={() => window.print()} className="px-3.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold inline-flex items-center gap-1 cursor-pointer">
                  <Printer className="w-3.5 h-3.5" />
                  <span>Print Slip</span>
                </button>
                <button type="button" onClick={() => setReceiptSlipFee(null)} className="px-4 py-1.5 rounded-lg border border-slate-200 text-slate-600 font-semibold cursor-pointer">Close</button>
              </div>
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

      {/* Student Banner Dedicated Add Payment Modal (Green Header) */}
      {isBannerPayOpen && activeStudent && (
        <div className="fixed inset-0 z-[115] bg-slate-900/50 backdrop-blur-[1px] flex items-center justify-center p-4">
          <div className="w-full max-w-xl bg-white rounded-2xl shadow-2xl overflow-hidden border border-slate-200 relative">
            {/* Green Header matching Pick 2 */}
            <div className="bg-emerald-500 text-white px-5 py-3.5 flex items-center justify-between">
              <div className="flex items-center gap-2 font-bold text-sm sm:text-base">
                <PlusCircle className="w-4 h-4" />
                <span>Add Payment</span>
              </div>
              <button
                type="button"
                onClick={() => setIsBannerPayOpen(false)}
                className="text-white/90 hover:text-white cursor-pointer"
                aria-label="Close Add Payment modal"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveBannerPayment} className="p-5 space-y-4 text-xs">
              {/* Row 1: Cash collected | Waiver / discount | Remaining balance */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 items-end">
                <div>
                  <label className={`block font-bold mb-1 ${!bpHasValidAmount ? 'text-rose-600' : 'text-slate-700'}`}>
                    Cash collected <span className="font-normal text-slate-400">(PKR)</span>
                  </label>
                  <div className="flex items-stretch">
                    <input
                      type="number"
                      min="0"
                      step="1"
                      value={bpCash}
                      onChange={(e) => {
                        setBpCash(e.target.value)
                        if (Object.keys(bpCashSplits).length > 0) setBpCashSplits({})
                      }}
                      className={`w-full px-3 py-2 rounded-l-lg border text-right font-semibold focus:outline-none ${
                        !bpHasValidAmount
                          ? 'border-rose-300 bg-rose-50/40 text-slate-800'
                          : 'border-slate-200 bg-white text-slate-900'
                      }`}
                    />
                    <button
                      type="button"
                      onClick={() => openBpAllocateModal('cash')}
                      title="Allocate cash to specific invoices"
                      className="px-2.5 border border-l-0 border-slate-200 rounded-r-lg bg-slate-50 hover:bg-slate-100 text-slate-600 cursor-pointer"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Waiver / discount <span className="font-normal text-slate-400">(PKR)</span>
                  </label>
                  <div className="flex items-stretch">
                    <input
                      type="number"
                      min="0"
                      step="1"
                      value={bpWaiver}
                      onChange={(e) => {
                        setBpWaiver(e.target.value)
                        if (Object.keys(bpWaiverSplits).length > 0) setBpWaiverSplits({})
                      }}
                      className="w-full px-3 py-2 rounded-l-lg border border-slate-200 bg-white text-right font-semibold text-slate-900 focus:outline-none"
                    />
                    <button
                      type="button"
                      onClick={() => openBpAllocateModal('waiver')}
                      title="Allocate waiver / discount to specific invoices"
                      className="px-2.5 border border-l-0 border-slate-200 rounded-r-lg bg-slate-50 hover:bg-slate-100 text-slate-600 cursor-pointer"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Remaining balance</label>
                  <div className="w-full px-3 py-2 rounded-lg border border-slate-200 bg-slate-100 text-right font-extrabold text-slate-900">
                    {formatMoney(bpRemainingBalance)}
                  </div>
                </div>
              </div>

              {/* Validation Alert Banner when Cash + Waiver <= 0 */}
              {!bpHasValidAmount && (
                <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-rose-50 border border-rose-200 text-rose-600 text-[11px] font-medium">
                  <AlertTriangle className="w-4 h-4 shrink-0" />
                  <span>Enter cash, family credit, and/or waiver — at least one must be greater than zero.</span>
                </div>
              )}

              {/* Row 2: Reason of Discount | Payment Method * */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Reason of Discount</label>
                  <input
                    type="text"
                    value={bpDiscountReason}
                    onChange={(e) => setBpDiscountReason(e.target.value)}
                    placeholder="e.g. Management approval, hardship case..."
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Payment Method <span className="text-rose-500">*</span>
                  </label>
                  <select
                    value={bpMethod}
                    onChange={(e) => setBpMethod(e.target.value)}
                    required
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 bg-white text-slate-800 font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                  >
                    <option value="">Select Method</option>
                    <option value="Cash">Cash</option>
                    <option value="Bank Transfer">Bank Transfer</option>
                    <option value="Online Transfer">Online Transfer</option>
                    <option value="Cheque">Cheque</option>
                    <option value="EasyPaisa">EasyPaisa</option>
                    <option value="JazzCash">JazzCash</option>
                    <option value="Credit Card">Credit Card</option>
                  </select>
                </div>
              </div>

              {/* Row 3: Note (optional) */}
              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Note <span className="font-normal text-slate-400">(optional)</span>
                </label>
                <textarea
                  rows={2}
                  value={bpNote}
                  onChange={(e) => setBpNote(e.target.value)}
                  placeholder="Additional notes..."
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 resize-y"
                />
              </div>

              {/* Row 4: Send SMS Checkbox */}
              <label className="inline-flex items-center gap-2 text-slate-700 font-medium cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={bpSendSms}
                  onChange={(e) => setBpSendSms(e.target.checked)}
                  className="rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
                />
                <span>Send SMS to Parent</span>
              </label>

              {/* Footer Buttons */}
              <div className="flex items-center justify-between pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsBannerPayOpen(false)}
                  className="px-4 py-2 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 font-semibold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={bpSaving || !bpHasValidAmount || !bpMethod}
                  className="px-4 py-2 rounded-lg bg-emerald-500 hover:bg-emerald-600 text-white font-bold inline-flex items-center gap-1.5 disabled:opacity-50 cursor-pointer shadow-xs"
                >
                  <Check className="w-3.5 h-3.5" />
                  <span>{bpSaving ? 'Saving...' : 'Save payment'}</span>
                </button>
              </div>
            </form>

            {/* Nested Split Allocation Modal: Allocate cash OR Allocate waiver / discount */}
            {bpAllocateType && (
              <div className="absolute inset-0 z-20 bg-slate-900/45 backdrop-blur-xs flex items-center justify-center p-4">
                <div className="w-full max-w-lg bg-white rounded-xl shadow-2xl border border-slate-200 overflow-hidden text-xs">
                  <div className="bg-emerald-500 text-white px-4 py-3 flex items-center justify-between font-bold">
                    <span className="flex items-center gap-1.5">
                      <DollarSign className="w-4 h-4" />
                      <span>{bpAllocateType === 'cash' ? 'Allocate cash' : 'Allocate waiver / discount'}</span>
                    </span>
                    <button type="button" onClick={() => setBpAllocateType(null)} className="text-white/90 hover:text-white cursor-pointer">
                      <X className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="p-4 space-y-3">
                    <div className="p-2.5 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-900 text-[11px]">
                      {bpAllocateType === 'cash'
                        ? 'Enter cash amount for each unpaid invoice. Click Apply to update Cash collected.'
                        : 'Enter waiver / discount amount for each unpaid invoice. Click Apply to update Waiver / discount.'}
                    </div>

                    <div className="max-h-56 overflow-y-auto border border-slate-200 rounded-lg">
                      <table className="w-full text-left">
                        <thead className="bg-slate-50 border-b text-[10px] uppercase text-slate-500">
                          <tr>
                            <th className="py-2 px-3">Invoice</th>
                            <th className="py-2 px-3 text-right">Outstanding (PKR)</th>
                            <th className="py-2 px-3 text-right">{bpAllocateType === 'cash' ? 'Cash (PKR)' : 'Waiver (PKR)'}</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                          {pendingInvoices.map((inv) => {
                            const due = getInvoiceRemaining(inv)
                            const val =
                              bpAllocateType === 'cash' ? (bpCashSplits[inv.id] ?? '0') : (bpWaiverSplits[inv.id] ?? '0')
                            return (
                              <tr key={inv.id}>
                                <td className="py-2 px-3">
                                  <div className="font-bold text-slate-800">{inv.feeMonth || inv.title || 'Monthly Fee'}</div>
                                  <div className="text-[10px] text-slate-400">
                                    #{inv.receiptNo || String(inv.id).slice(-7)} · {inv.feeType || 'Tuition'}
                                  </div>
                                </td>
                                <td className="py-2 px-3 text-right font-mono">{due.toLocaleString()}</td>
                                <td className="py-2 px-3 text-right">
                                  <input
                                    type="number"
                                    min="0"
                                    max={due}
                                    value={val}
                                    onChange={(e) => {
                                      const raw = e.target.value
                                      if (bpAllocateType === 'cash') {
                                        setBpCashSplits((prev) => ({ ...prev, [inv.id]: raw }))
                                      } else {
                                        setBpWaiverSplits((prev) => ({ ...prev, [inv.id]: raw }))
                                      }
                                    }}
                                    className="w-24 px-2 py-1 rounded border border-slate-200 text-right font-mono"
                                  />
                                </td>
                              </tr>
                            )
                          })}
                        </tbody>
                      </table>
                    </div>

                    <div className="flex items-center justify-between font-bold px-2.5 py-1.5 bg-slate-50 rounded-lg">
                      <span>{bpAllocateType === 'cash' ? 'Total allocated cash' : 'Total allocated waiver'}</span>
                      <span className="text-emerald-600 font-mono text-sm">{formatMoney(bpSplitSum)}</span>
                    </div>

                    <div className="flex justify-end gap-2 pt-2">
                      <button
                        type="button"
                        onClick={() => setBpAllocateType(null)}
                        className="px-3.5 py-1.5 rounded-lg border border-slate-200 text-slate-700 font-semibold cursor-pointer"
                      >
                        Cancel
                      </button>
                      <button
                        type="button"
                        onClick={applyBpAllocationSplit}
                        className="px-4 py-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-600 text-white font-semibold cursor-pointer"
                      >
                        Apply
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Combined Family Fee Voucher Modal */}
      {familyVoucherOpen && activeStudent && (
        <div className="fixed inset-0 z-[115] bg-slate-900/55 backdrop-blur-[1px] flex items-center justify-center p-4 overflow-y-auto print:bg-white print:p-0 print:static">
          <div className="w-full max-w-3xl bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden my-auto print:shadow-none print:border-0">
            {/* Modal Control Header (Hidden on Print) */}
            <div className="bg-indigo-600 text-white px-5 py-3.5 flex flex-wrap items-center justify-between gap-2 print:hidden">
              <div className="flex items-center gap-2 font-bold text-sm">
                <Users className="w-4 h-4" />
                <span>Combined Family Fee Voucher</span>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <select
                  value={familyVoucherBankId}
                  onChange={(e) => setFamilyVoucherBankId(e.target.value)}
                  className="px-2.5 py-1.5 rounded-lg bg-white/15 border border-white/25 text-white text-xs font-semibold focus:outline-none [&>option]:text-slate-900"
                >
                  {BANK_PRESETS.map((b) => (
                    <option key={b.id} value={b.id}>
                      {b.name}
                    </option>
                  ))}
                </select>
                <input
                  type="date"
                  value={familyVoucherDueDate}
                  onChange={(e) => setFamilyVoucherDueDate(e.target.value)}
                  className="px-2.5 py-1 rounded-lg bg-white/15 border border-white/25 text-white text-xs font-semibold focus:outline-none"
                />
                <button
                  type="button"
                  onClick={() => window.print()}
                  className="px-3.5 py-1.5 rounded-lg bg-white text-indigo-700 hover:bg-indigo-50 text-xs font-bold inline-flex items-center gap-1.5 cursor-pointer"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>Print Voucher</span>
                </button>
                <button
                  type="button"
                  onClick={() => setFamilyVoucherOpen(false)}
                  className="p-1 rounded-lg text-white/85 hover:text-white hover:bg-white/15 cursor-pointer"
                  aria-label="Close Combined Family Voucher"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Printable Family Voucher Content */}
            <div className="p-6 space-y-5 text-xs text-slate-800 max-h-[82vh] overflow-y-auto print:max-h-none print:overflow-visible">
              {/* Institute & Bank Banner */}
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 pb-4 border-b-2 border-slate-200">
                <div>
                  <h3 className="text-lg font-extrabold text-slate-900 uppercase tracking-tight">
                    {currentInstitute?.name || 'Institute Management Portal'}
                  </h3>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    {currentInstitute?.address || 'Campus Billing Office'} · Combined Family Fee Challan
                  </p>
                  <p className="text-[11px] font-semibold text-indigo-700 mt-1">
                    Voucher #: FAM-{normalizeCnic(parentCnic).slice(-6) || String(activeStudent.id).slice(-6).toUpperCase()}
                  </p>
                </div>
                <div className="sm:text-right space-y-0.5">
                  <p className="font-bold text-slate-800">{familyVoucherData.activeBank.name}</p>
                  <p className="text-[11px] text-slate-500">A/C: {familyVoucherData.activeBank.accountNumber || 'Ask Accounts Desk'}</p>
                  <p className="text-[11px] text-slate-600">
                    Issue Date: <strong>{new Date().toISOString().split('T')[0]}</strong> · Due Date:{' '}
                    <strong className="text-rose-600">{familyVoucherDueDate}</strong>
                  </p>
                </div>
              </div>

              {/* Guardian Metadata Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-slate-50 border border-slate-200 rounded-xl p-3">
                <div>
                  <p className="text-[10px] font-bold uppercase text-slate-400">Father / Guardian</p>
                  <p className="font-bold text-slate-900 mt-0.5">{parentName}</p>
                </div>
                <div>
                  <p className="text-[10px] font-bold uppercase text-slate-400">Parent CNIC</p>
                  <p className="font-mono font-bold text-slate-800 mt-0.5">{parentCnic || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-[10px] font-bold uppercase text-slate-400">Contact Phone</p>
                  <p className="font-bold text-slate-800 mt-0.5">{parentPhone}</p>
                </div>
                <div>
                  <p className="text-[10px] font-bold uppercase text-slate-400">Linked Children</p>
                  <p className="font-bold text-indigo-700 mt-0.5">{familyVoucherData.rows.length} Student(s)</p>
                </div>
              </div>

              {/* Per-Student Unpaid Fee Breakdown */}
              <div className="space-y-3">
                {familyVoucherData.rows.map(({ student: st, pendingInvoices: stPending, subtotal }) => (
                  <div key={st.id} className="border border-slate-200 rounded-xl overflow-hidden">
                    <div className="bg-slate-100/80 px-4 py-2 flex flex-wrap items-center justify-between gap-2 border-b border-slate-200">
                      <div className="font-bold text-slate-900">
                        {st.fullName || st.name}{' '}
                        <span className="font-normal text-slate-500">
                          · {st.className || st.course || 'Class'} · Roll {st.rollNumber || 'N/A'}
                        </span>
                      </div>
                      <span className="font-extrabold text-slate-900">Subtotal: {formatMoney(subtotal)}</span>
                    </div>
                    {stPending.length === 0 ? (
                      <div className="px-4 py-2.5 text-slate-400 italic">No pending invoices for this student.</div>
                    ) : (
                      <table className="w-full text-left">
                        <thead className="bg-white border-b border-slate-100 text-[10px] uppercase text-slate-400">
                          <tr>
                            <th className="py-2 px-4">Fee Title / Period</th>
                            <th className="py-2 px-4 text-right">Billed</th>
                            <th className="py-2 px-4 text-right">Paid / Waived</th>
                            <th className="py-2 px-4 text-right">Remaining</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                          {stPending.map((inv) => {
                            const billed = getInvoiceTotal(inv)
                            const settled = getInvoicePaid(inv) + getInvoiceWaiver(inv)
                            const rem = getInvoiceRemaining(inv)
                            return (
                              <tr key={inv.id}>
                                <td className="py-2 px-4 font-semibold text-slate-800">
                                  {inv.feeMonth || inv.title || 'Monthly Fee'}{' '}
                                  <span className="text-[10px] font-normal text-slate-400">
                                    (#{inv.receiptNo || String(inv.id).slice(-6)})
                                  </span>
                                </td>
                                <td className="py-2 px-4 text-right text-slate-600">{formatMoney(billed)}</td>
                                <td className="py-2 px-4 text-right text-emerald-600">{formatMoney(settled)}</td>
                                <td className="py-2 px-4 text-right font-bold text-slate-900">{formatMoney(rem)}</td>
                              </tr>
                            )
                          })}
                        </tbody>
                      </table>
                    )}
                  </div>
                ))}
              </div>

              {/* Combined Family Totals Footer */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-indigo-50 border border-indigo-200 rounded-xl p-4">
                <div className="space-y-0.5">
                  <p className="font-extrabold text-indigo-950 text-sm">Combined Family Payable Amount</p>
                  {familyCreditBalance > 0 && (
                    <p className="text-[11px] text-emerald-700 font-semibold">
                      Available Family Credit Balance: {formatMoney(familyCreditBalance)}
                    </p>
                  )}
                </div>
                <div className="sm:text-right">
                  <p className="text-xl font-extrabold text-indigo-700">{formatMoney(familyVoucherData.grandTotal)}</p>
                  <p className="text-[10px] text-slate-500">Payable on or before {familyVoucherDueDate}</p>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-100 print:hidden">
                <button
                  type="button"
                  onClick={() => window.print()}
                  className="px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-bold inline-flex items-center gap-1.5 cursor-pointer"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>Print Combined Voucher</span>
                </button>
                <button
                  type="button"
                  onClick={() => setFamilyVoucherOpen(false)}
                  className="px-4 py-2 rounded-lg border border-slate-200 text-slate-600 font-semibold cursor-pointer"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Generate Full Invoice Options Modal (Pick 2) */}
      {fullInvoiceModalOpen && activeStudent && (
        <div className="fixed inset-0 z-[115] bg-slate-900/50 backdrop-blur-[1px] flex items-center justify-center p-4">
          <div className="w-full max-w-lg bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden">
            {/* Modal Header */}
            <div className="px-5 py-3.5 border-b border-slate-200 flex items-center justify-between bg-white">
              <div className="flex items-center gap-2 font-bold text-slate-800 text-sm">
                <FileText className="w-4 h-4 text-slate-600" />
                <span>Generate Full Invoice</span>
              </div>
              <button
                type="button"
                onClick={() => setFullInvoiceModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 cursor-pointer"
                aria-label="Close Generate Full Invoice"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-5 space-y-4 text-xs">
              {/* Categories Selection */}
              <div className="space-y-2.5">
                <p className="text-slate-600 font-medium">Select categories to include in the printed Invoice:</p>
                {[
                  { key: 'tuition', label: 'Tuition Fee Payments', amount: fullInvoiceSummary.totals.tuition },
                  { key: 'individual', label: 'Individual Payments', amount: fullInvoiceSummary.totals.individual },
                  { key: 'store', label: 'Store & Inventory Charges', amount: fullInvoiceSummary.totals.store },
                  { key: 'fines', label: 'Late Fees & Fines', amount: fullInvoiceSummary.totals.fines }
                ].map((cat) => (
                  <label
                    key={cat.key}
                    className="flex items-center justify-between gap-3 cursor-pointer select-none py-0.5"
                  >
                    <span className="inline-flex items-center gap-2.5 font-semibold text-slate-800">
                      <input
                        type="checkbox"
                        checked={Boolean(fiCategories[cat.key])}
                        onChange={(e) =>
                          setFiCategories((prev) => ({ ...prev, [cat.key]: e.target.checked }))
                        }
                        className="w-4 h-4 rounded border-slate-300 text-sky-600 focus:ring-sky-500 cursor-pointer"
                      />
                      <span>{cat.label}</span>
                    </span>
                    <span
                      className={`px-2 py-0.5 rounded text-[11px] font-bold text-white min-w-[60px] text-center ${
                        cat.amount > 0 ? 'bg-rose-500' : 'bg-slate-500'
                      }`}
                    >
                      {formatMoney(cat.amount)}
                    </span>
                  </label>
                ))}
              </div>

              {/* Print Layout Options */}
              <div className="border-t border-slate-100 pt-3.5 space-y-2.5">
                <p className="font-bold text-slate-800 text-xs">Print layout</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-2.5">
                    <label className="flex items-start gap-2 cursor-pointer text-slate-700 leading-snug">
                      <input
                        type="checkbox"
                        checked={fiShowInstallments}
                        onChange={(e) => setFiShowInstallments(e.target.checked)}
                        className="mt-0.5 rounded border-slate-300 text-sky-600 focus:ring-sky-500 cursor-pointer"
                      />
                      <span>Show payment installments history on fee lines</span>
                    </label>
                    <label className="flex items-start gap-2 cursor-pointer text-slate-700 leading-snug">
                      <input
                        type="checkbox"
                        checked={fiShowPaymentMethods}
                        onChange={(e) => setFiShowPaymentMethods(e.target.checked)}
                        className="mt-0.5 rounded border-slate-300 text-sky-600 focus:ring-sky-500 cursor-pointer"
                      />
                      <span>Add payment method details (QR &amp; info)</span>
                    </label>
                  </div>

                  <div className="space-y-1.5">
                    {[
                      { id: 'a4', label: 'Full A4 page (recommended)' },
                      { id: 'horizontal', label: 'Horizontal layout' },
                      { id: 'vertical', label: 'Vertical layout' }
                    ].map((opt) => (
                      <label key={opt.id} className="flex items-center gap-2 cursor-pointer text-slate-700">
                        <input
                          type="radio"
                          name="fiPrintLayout"
                          value={opt.id}
                          checked={fiPrintLayout === opt.id}
                          onChange={() => setFiPrintLayout(opt.id)}
                          className="text-sky-600 focus:ring-sky-500 cursor-pointer"
                        />
                        <span>{opt.label}</span>
                      </label>
                    ))}
                    <p className="text-[10px] text-slate-400 leading-snug pt-0.5">
                      You can change the layout and copies on the print page.
                    </p>
                  </div>
                </div>
              </div>

              {/* Totals Summary Strip */}
              <div className="rounded-xl border border-slate-200 p-3.5 grid grid-cols-2 gap-4 bg-slate-50/40">
                <div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">TOTAL OUTSTANDING</p>
                  <p className="text-base font-extrabold text-rose-600 mt-0.5">
                    {formatMoney(fullInvoiceSummary.selectedOutstanding)}
                  </p>
                  <p className="text-[11px] text-slate-400">{fullInvoiceSummary.selectedCount} unpaid invoices</p>
                </div>
                <div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">ALREADY COLLECTED</p>
                  <p className="text-base font-extrabold text-emerald-600 mt-0.5">
                    {formatMoney(fullInvoiceSummary.collectedAmount)}
                  </p>
                  <p className="text-[11px] text-slate-400">{fullInvoiceSummary.collectedCount} paid invoices</p>
                </div>
              </div>

              {/* Footer Buttons */}
              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setFullInvoiceModalOpen(false)}
                  className="px-4 py-2 rounded-lg bg-slate-500 hover:bg-slate-600 text-white font-semibold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setFullInvoiceModalOpen(false)
                    setFiReceiptPreviewOpen(true)
                  }}
                  className="px-4 py-2 rounded-lg bg-emerald-500 hover:bg-emerald-600 text-white font-bold inline-flex items-center gap-1.5 cursor-pointer shadow-xs"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>Print Receipt</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Full Invoice / Print Receipt Preview Modal (Picks 3 & 4) */}
      {fiReceiptPreviewOpen && activeStudent && (
        <div className="fixed inset-0 z-[120] bg-slate-900/65 backdrop-blur-[1px] flex flex-col items-center p-3 sm:p-6 overflow-y-auto print:bg-white print:p-0 print:static">
          {/* Top Non-Printable Toolbar */}
          <div className="w-full max-w-4xl bg-slate-900 text-white rounded-t-xl px-4 py-3 flex flex-wrap items-center justify-between gap-2 shadow-lg print:hidden">
            <div className="flex flex-wrap items-center gap-2 text-xs">
              <span className="font-bold">Invoice Print Preview</span>
              <div className="flex items-center gap-1 bg-slate-800 rounded-lg p-0.5">
                {[
                  { id: 'a4', label: 'Full A4' },
                  { id: 'horizontal', label: 'Horizontal' },
                  { id: 'vertical', label: 'Vertical' }
                ].map((opt) => (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => setFiPrintLayout(opt.id)}
                    className={`px-2.5 py-1 rounded-md text-[11px] font-semibold cursor-pointer ${
                      fiPrintLayout === opt.id ? 'bg-emerald-500 text-white' : 'text-slate-300 hover:text-white'
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
              {fiPrintLayout !== 'a4' && (
                <select
                  value={fiCopies}
                  onChange={(e) => setFiCopies(Number(e.target.value))}
                  className="px-2 py-1 rounded-md bg-slate-800 border border-slate-700 text-xs font-semibold"
                >
                  <option value={2}>2 Copies</option>
                  <option value={3}>3 Copies</option>
                </select>
              )}
            </div>
            <div className="flex items-center gap-2 text-xs">
              <button
                type="button"
                onClick={() => {
                  setFiReceiptPreviewOpen(false)
                  setFullInvoiceModalOpen(true)
                }}
                className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold cursor-pointer"
              >
                Options
              </button>
              <button
                type="button"
                onClick={() => window.print()}
                className="px-3.5 py-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-600 text-white font-bold inline-flex items-center gap-1.5 cursor-pointer"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>Print Receipt</span>
              </button>
              <button
                type="button"
                onClick={() => setFiReceiptPreviewOpen(false)}
                className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>

          {/* Printable Document Container */}
          {fiPrintLayout === 'a4' ? (
            <div className="w-full max-w-4xl bg-white rounded-b-xl shadow-2xl p-6 sm:p-10 text-slate-900 relative overflow-hidden print:shadow-none print:rounded-none print:max-w-none print:p-6">
              {/* Subtle Centered Watermark Emblem */}
              <div className="pointer-events-none select-none absolute inset-0 flex items-center justify-center opacity-[0.045]">
                <div className="w-72 h-72 rounded-full border-[14px] border-sky-600 flex flex-col items-center justify-center">
                  <span className="text-4xl font-black tracking-widest text-sky-700 uppercase">
                    {(currentInstitute?.name || 'EIMS').split(' ')[0]}
                  </span>
                </div>
              </div>

              <div className="relative z-10 space-y-6">
                {/* Header Row: Institute Identity + INVOICE Metadata */}
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                  <div className="flex items-center gap-3.5">
                    {currentInstitute?.logo ? (
                      <img
                        src={currentInstitute.logo}
                        alt={currentInstitute?.name || 'Logo'}
                        className="w-16 h-16 rounded-lg object-cover border border-slate-200"
                      />
                    ) : (
                      <div className="w-16 h-16 rounded-full bg-sky-500 text-white flex flex-col items-center justify-center font-black tracking-tight shadow-xs border-4 border-sky-100">
                        <span className="text-lg leading-none">
                          {(currentInstitute?.name || 'ED').slice(0, 2).toUpperCase()}
                        </span>
                        <span className="text-[7px] uppercase tracking-wider mt-0.5 opacity-90">Portal</span>
                      </div>
                    )}
                    <div>
                      <h2 className="text-lg font-extrabold text-slate-900 leading-tight">
                        {currentInstitute?.name || 'EduDigize Institute'}
                      </h2>
                      <p className="text-xs text-slate-600 mt-0.5">
                        Phone: {currentInstitute?.phone || '0300-0000000'}
                      </p>
                      <p className="text-xs text-slate-600">
                        Email: {currentInstitute?.email || 'accounts@institute.edu'}
                      </p>
                    </div>
                  </div>

                  <div className="sm:text-right">
                    <h1 className="text-2xl sm:text-3xl font-black tracking-[0.18em] text-slate-900 uppercase">
                      INVOICE
                    </h1>
                    <div className="mt-2 space-y-0.5 text-xs">
                      <div className="flex sm:justify-end gap-4">
                        <span className="text-slate-500">Invoice Date</span>
                        <span className="font-bold text-slate-900 min-w-[92px] text-right">
                          {formatInvoiceDate(new Date().toISOString())}
                        </span>
                      </div>
                      <div className="flex sm:justify-end gap-4">
                        <span className="text-slate-500">Due Date</span>
                        <span className="font-bold text-slate-900 min-w-[92px] text-right">
                          {formatInvoiceDate(fullInvoiceSummary.latestDueDate)}
                        </span>
                      </div>
                      <div className="flex sm:justify-end gap-4">
                        <span className="text-slate-500">Admission No</span>
                        <span className="font-bold text-slate-900 min-w-[92px] text-right">
                          {activeStudent.admissionNo ||
                            activeStudent.registrationNo ||
                            String(activeStudent.id || '').slice(-8).toUpperCase()}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Heavy Horizontal Rule */}
                <hr className="border-t-2 border-slate-900" />

                {/* Bill To + Academic Details */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 text-xs">
                  <div>
                    <p className="text-[10px] font-bold tracking-[0.15em] text-slate-500 uppercase border-b border-slate-300 pb-1 mb-2">
                      BILL TO
                    </p>
                    <p className="font-extrabold text-sm text-slate-900">
                      {activeStudent.fullName || activeStudent.name}
                    </p>
                  </div>
                  <div>
                    <p className="text-[10px] font-bold tracking-[0.15em] text-slate-500 uppercase border-b border-slate-300 pb-1 mb-2">
                      ACADEMIC DETAILS
                    </p>
                    <p className="text-slate-700">
                      Class: <strong className="text-slate-900">{activeStudent.className || activeStudent.course || 'N/A'}</strong>
                    </p>
                    <p className="text-slate-700 mt-0.5">
                      Roll No: <strong className="text-slate-900">{activeStudent.rollNumber || 'N/A'}</strong>
                    </p>
                  </div>
                </div>

                {/* Line Items Table */}
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse border border-slate-700 text-xs">
                    <thead>
                      <tr className="bg-slate-50 text-[10px] uppercase tracking-wider text-slate-700">
                        <th className="border border-slate-700 py-2 px-2.5 text-center w-9">#</th>
                        <th className="border border-slate-700 py-2 px-3 text-left">DESCRIPTION</th>
                        <th className="border border-slate-700 py-2 px-3 text-center">DATE</th>
                        <th className="border border-slate-700 py-2 px-3 text-center">DUE DATE</th>
                        <th className="border border-slate-700 py-2 px-3 text-center">LATE FEE</th>
                        <th className="border border-slate-700 py-2 px-3 text-right">AMOUNT DUE (PKR)</th>
                      </tr>
                    </thead>
                    <tbody>
                      {fullInvoiceSummary.lines.length === 0 ? (
                        <tr>
                          <td colSpan={6} className="border border-slate-700 py-6 text-center text-slate-500">
                            No unpaid charges match the selected categories.
                          </td>
                        </tr>
                      ) : (
                        fullInvoiceSummary.lines.map(({ fee, fineDue, amountDue, isOverdue }, idx) => (
                          <tr key={fee.id}>
                            <td className="border border-slate-700 py-2.5 px-2.5 text-center text-slate-600">{idx + 1}</td>
                            <td className="border border-slate-700 py-2.5 px-3">
                              <div className="font-bold text-slate-900">
                                {fee.title || fee.feeType || 'Tuition Fee'}{' '}
                                <span className="font-normal text-slate-600">
                                  ({fee.feeMonth || 'Current'} - {fee.frequency || 'Monthly'})
                                </span>
                              </div>
                              <div className="text-[11px] text-slate-600 mt-0.5">
                                Class Fee: {Number(fee.amount || 0).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                              </div>
                              {fiShowInstallments && (getInvoicePaid(fee) > 0 || getInvoiceWaiver(fee) > 0) && (
                                <div className="text-[10px] text-emerald-700 font-semibold mt-0.5">
                                  Paid: {formatMoney(getInvoicePaid(fee))} · Waiver: {formatMoney(getInvoiceWaiver(fee))}
                                </div>
                              )}
                            </td>
                            <td className="border border-slate-700 py-2.5 px-3 text-center whitespace-nowrap">
                              {formatInvoiceDate(fee.createdAt || fee.dueDate)}
                            </td>
                            <td className="border border-slate-700 py-2.5 px-3 text-center whitespace-nowrap">
                              {fee.dueDate ? (
                                <div>
                                  <div>{formatInvoiceDate(fee.dueDate)}</div>
                                  {isOverdue && <div className="font-extrabold text-slate-900 text-[10px]">Overdue</div>}
                                </div>
                              ) : (
                                '—'
                              )}
                            </td>
                            <td className="border border-slate-700 py-2.5 px-3 text-center">
                              {fineDue > 0 ? fineDue.toLocaleString('en-US', { minimumFractionDigits: 2 }) : '—'}
                            </td>
                            <td className="border border-slate-700 py-2.5 px-3 text-right font-extrabold text-slate-900 tabular-nums">
                              {amountDue.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>

                {/* Totals Box */}
                <div className="flex justify-end">
                  <div className="w-full sm:w-80 border border-slate-800 text-xs">
                    <div className="flex items-center justify-between px-3.5 py-2 border-b border-slate-800 font-extrabold text-sm bg-slate-50/40">
                      <span>Total Amount Due</span>
                      <span className="tabular-nums">
                        PKR {fullInvoiceSummary.selectedOutstanding.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                      </span>
                    </div>
                    <div className="flex items-center justify-between px-3.5 py-2 text-slate-700">
                      <span>Amount After Due Date</span>
                      <span className="tabular-nums font-medium">
                        PKR {fullInvoiceSummary.totalAfterDueDate.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Payment Methods (QR & Accounts) */}
                {fiShowPaymentMethods && (
                  <div className="space-y-3 pt-2">
                    <p className="text-[10px] font-bold tracking-[0.15em] text-slate-600 uppercase border-b border-slate-300 pb-1">
                      PAYMENT METHODS
                    </p>
                    <div className="flex flex-col sm:flex-row items-start gap-5">
                      <div className="border border-slate-300 rounded-md p-2 text-center bg-white shrink-0">
                        <QrCodeSvg
                          value={`EIMS-INV-${activeStudent.id}-${fullInvoiceSummary.selectedOutstanding}`}
                          size={112}
                        />
                        <p className="text-[10px] text-slate-500 mt-1 font-medium">Scan the QR Code</p>
                      </div>
                      <div className="space-y-3 text-xs text-slate-700">
                        <div>
                          <p className="font-extrabold text-slate-900">EasyPaisa</p>
                          <p>Mobile: {currentInstitute?.phone || '0300-0000000'}</p>
                          <p>Account Title: {currentInstitute?.name || 'Institute Collection A/C'}</p>
                          <p>Account Number: {currentInstitute?.phone || '0300-0000000'}</p>
                          <p>IBAN: PK30EASY{(currentInstitute?.phone || '03000000000').replace(/[^0-9]/g, '').slice(-11)}</p>
                        </div>
                        <div>
                          <p className="font-extrabold text-slate-900">{BANK_PRESETS[0].name}</p>
                          <p>Account Title: {BANK_PRESETS[0].accountTitle}</p>
                          <p>Account Number: {BANK_PRESETS[0].accountNo}</p>
                          <p>IBAN: {BANK_PRESETS[0].iban}</p>
                        </div>
                        <div>
                          <p className="font-extrabold text-slate-900">JazzCash</p>
                          <p>Mobile: {currentInstitute?.phone || '0300-0000000'}</p>
                          <p>Account Title: {currentInstitute?.name || 'Institute Collection A/C'}</p>
                          <p>Account Number: {currentInstitute?.phone || '0300-0000000'}</p>
                          <p>IBAN: PK03JAZZ{(currentInstitute?.phone || '03000000000').replace(/[^0-9]/g, '').slice(-11)}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Authorized Signature & Footer */}
                <div className="pt-8 space-y-4">
                  <div className="flex justify-end">
                    <div className="w-60 border-t border-slate-800 pt-1.5 text-center font-bold text-xs text-slate-800">
                      Authorized Signature
                    </div>
                  </div>
                  <div className="border-t border-slate-300 pt-2 flex flex-wrap items-center justify-between gap-2 text-[10px] text-slate-500">
                    <span>
                      This is a computer-generated invoice. Generated on{' '}
                      {new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })},{' '}
                      {new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}.
                    </span>
                    <span className="font-semibold text-slate-600">{currentInstitute?.name || 'EduDigize'}</span>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            /* Horizontal / Vertical Multi-Copy Challan Strips */
            <div
              className={`w-full max-w-5xl bg-white rounded-b-xl shadow-2xl p-5 grid gap-4 text-xs text-slate-900 print:shadow-none print:rounded-none ${
                fiPrintLayout === 'horizontal'
                  ? fiCopies === 2
                    ? 'grid-cols-1 md:grid-cols-2'
                    : 'grid-cols-1 md:grid-cols-3'
                  : 'grid-cols-1'
              }`}
            >
              {['Bank Copy', 'Institute Copy', 'Student Copy'].slice(0, fiCopies).map((copyLabel) => (
                <div key={copyLabel} className="border-2 border-slate-800 rounded-lg p-3.5 space-y-2.5">
                  <div className="flex items-start justify-between border-b border-slate-300 pb-2">
                    <div>
                      <p className="font-extrabold text-sm text-slate-900">{currentInstitute?.name || 'EduDigize Institute'}</p>
                      <p className="text-[10px] text-slate-500">{copyLabel}</p>
                    </div>
                    <span className="px-2 py-0.5 rounded bg-slate-900 text-white text-[10px] font-bold uppercase">
                      Due: {formatInvoiceDate(fullInvoiceSummary.latestDueDate)}
                    </span>
                  </div>
                  <div className="text-[11px] space-y-0.5">
                    <p><strong>Student:</strong> {activeStudent.fullName || activeStudent.name}</p>
                    <p><strong>Class / Roll:</strong> {activeStudent.className || 'N/A'} · Roll {activeStudent.rollNumber || 'N/A'}</p>
                    <p><strong>Adm No:</strong> {activeStudent.admissionNo || activeStudent.registrationNo || String(activeStudent.id).slice(-7)}</p>
                  </div>
                  <div className="border-t border-b border-slate-200 py-1.5 space-y-1 text-[11px]">
                    {fullInvoiceSummary.lines.map(({ fee, amountDue }) => (
                      <div key={fee.id} className="flex justify-between gap-2">
                        <span className="truncate">{fee.title || fee.feeType || 'Tuition'} ({fee.feeMonth || 'Monthly'})</span>
                        <span className="font-bold shrink-0">{formatMoney(amountDue)}</span>
                      </div>
                    ))}
                  </div>
                  <div className="flex items-center justify-between font-extrabold text-sm">
                    <span>Total Payable</span>
                    <span>{formatMoney(fullInvoiceSummary.selectedOutstanding)}</span>
                  </div>
                  {fiShowPaymentMethods && (
                    <div className="flex items-center justify-between gap-2 pt-1.5 border-t border-dashed border-slate-300 text-[10px] text-slate-600">
                      <div>
                        <p className="font-bold text-slate-800">{BANK_PRESETS[0].shortName}: {BANK_PRESETS[0].accountNo}</p>
                        <p>EasyPaisa / JazzCash: {currentInstitute?.phone || '0300-0000000'}</p>
                      </div>
                      <QrCodeSvg value={`EIMS-INV-${activeStudent.id}`} size={44} />
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export default StudentBillingHistoryView
