import React, { useState, useMemo, useEffect } from 'react'
import {
  DollarSign,
  X,
  Search,
  Users,
  Edit2,
  ExternalLink,
  AlertTriangle,
  Check,
  CreditCard
} from 'lucide-react'
import { useAppData } from '../../context/AppDataContext'
import { useToast } from '../../context/ToastContext'
import { filterClassesByInstituteTier, isClassAllowedForTier, getDistinctInstituteClassNames } from '../../utils/tierGating'
import { recordCampusLedgerTransaction } from '../../modules/institute-admin/accounts/CampusAccountsView'

const normalizeCnic = (val = '') => String(val).replace(/[^0-9]/g, '')

const getFamilyCreditKey = (instId) => `eims_family_credit_${instId || 'default'}`

export const getFamilyCreditBalance = (instId, cnic) => {
  const key = normalizeCnic(cnic)
  if (!key) return 0
  try {
    const map = JSON.parse(localStorage.getItem(getFamilyCreditKey(instId)) || '{}')
    return Number(map[key] || 0)
  } catch {
    return 0
  }
}

export const updateFamilyCreditBalance = (instId, cnic, delta) => {
  const key = normalizeCnic(cnic)
  if (!key) return 0
  try {
    const map = JSON.parse(localStorage.getItem(getFamilyCreditKey(instId)) || '{}')
    const nextVal = Math.max(0, Number(map[key] || 0) + Number(delta || 0))
    map[key] = nextVal
    localStorage.setItem(getFamilyCreditKey(instId), JSON.stringify(map))
    return nextVal
  } catch {
    return 0
  }
}

const getInvoiceOutstanding = (fee) => {
  if (!fee || fee.status === 'Paid') return 0
  const base = Number(fee.amount || 0) + Number(fee.fine || fee.lateFine || 0)
  const paid = Number(fee.paidAmount || 0)
  const waiver = Number(fee.discount || fee.waiver || 0)
  return Math.max(0, base - paid - waiver)
}

/** Distributes cash, waiver, and family credit across unpaid invoices via manual splits or FIFO order. */
export const applyPaymentDistributionToInvoices = async ({
  unpaidInvoices = [],
  cashVal = 0,
  waiverVal = 0,
  creditApplied = 0,
  cashSplits = {},
  waiverSplits = {},
  discountReason = '',
  paymentMethod = 'Cash',
  extraNote = '',
  updateItem
}) => {
  let remCash = Math.max(0, Number(cashVal) || 0)
  let remWaiver = Math.max(0, Number(waiverVal) || 0)
  let remCredit = Math.max(0, Number(creditApplied) || 0)

  const hasManualCashSplit = Object.values(cashSplits).some((v) => Number(v) > 0)
  const hasManualWaiverSplit = Object.values(waiverSplits).some((v) => Number(v) > 0)

  for (const inv of unpaidInvoices) {
    const due = getInvoiceOutstanding(inv)
    if (due <= 0) continue

    const applyWaiver = hasManualWaiverSplit
      ? Math.min(due, Math.max(0, Number(waiverSplits[inv.id]) || 0))
      : Math.min(due, remWaiver)
    if (!hasManualWaiverSplit) remWaiver -= applyWaiver

    const dueAfterWaiver = Math.max(0, due - applyWaiver)
    const applyCredit = Math.min(dueAfterWaiver, remCredit)
    remCredit -= applyCredit

    const dueAfterCredit = Math.max(0, dueAfterWaiver - applyCredit)
    const applyCash = hasManualCashSplit
      ? Math.min(dueAfterCredit, Math.max(0, Number(cashSplits[inv.id]) || 0))
      : Math.min(dueAfterCredit, remCash)
    if (!hasManualCashSplit) remCash -= applyCash

    if (applyCash + applyCredit + applyWaiver <= 0) continue

    const newPaid = Number(inv.paidAmount || 0) + applyCash + applyCredit
    const newDiscount = Number(inv.discount || inv.waiver || 0) + applyWaiver
    const base = Number(inv.amount || 0) + Number(inv.fine || inv.lateFine || 0)
    const nextRemaining = Math.max(0, base - newPaid - newDiscount)
    const nextStatus = nextRemaining <= 0 ? 'Paid' : 'Partial'

    await updateItem('fees', inv.id, {
      paidAmount: newPaid,
      discount: newDiscount,
      discountReason: discountReason.trim() || inv.discountReason || '',
      paymentMethod,
      paidAt: new Date().toISOString().split('T')[0],
      status: nextStatus,
      notes: extraNote.trim() || inv.notes || ''
    })
  }
}

export const QuickPaymentModal = ({
  isOpen,
  onClose,
  currentInstitute,
  preselectedStudentId = null,
  onOpenBillingDetail
}) => {
  const {
    students = [],
    classes = [],
    fees = [],
    updateItem,
    sendCommunicationBlast,
    logAuditEvent
  } = useAppData()
  const { toast } = useToast()

  const instId = currentInstitute?.id || 'default'

  const [applyMode, setApplyMode] = useState('class') // 'class' | 'cnic'
  const [selectedClass, setSelectedClass] = useState('')
  const [selectedStudentId, setSelectedStudentId] = useState('')
  const [cnicInput, setCnicInput] = useState('')
  const [cnicVerified, setCnicVerified] = useState(false)
  const [matchedFamilyStudents, setMatchedFamilyStudents] = useState([])

  const [cashCollected, setCashCollected] = useState('0')
  const [waiverDiscount, setWaiverDiscount] = useState('0')
  const [useCredit, setUseCredit] = useState(false)
  const [paymentMethod, setPaymentMethod] = useState('Cash')
  const [discountReason, setDiscountReason] = useState('')
  const [extraNote, setExtraNote] = useState('')
  const [sendSms, setSendSms] = useState(true)
  const [isSaving, setIsSaving] = useState(false)

  // Nested Split Allocation Modals
  const [allocateModalType, setAllocateModalType] = useState(null) // 'cash' | 'waiver' | null
  const [cashSplits, setCashSplits] = useState({})
  const [waiverSplits, setWaiverSplits] = useState({})

  const instStudents = useMemo(
    () =>
      students.filter(
        s => (!currentInstitute?.id || s.instituteId === currentInstitute.id) && isClassAllowedForTier(s.className, currentInstitute)
      ),
    [students, currentInstitute]
  )

  const availableClasses = useMemo(() => {
    const scopedClasses = filterClassesByInstituteTier(classes, currentInstitute)
    return getDistinctInstituteClassNames(scopedClasses, instStudents, currentInstitute)
  }, [classes, instStudents, currentInstitute])

  const studentsInClass = useMemo(() => {
    if (!selectedClass) return instStudents
    return instStudents.filter(s => (s.className || '').toLowerCase().trim() === selectedClass.toLowerCase().trim())
  }, [instStudents, selectedClass])

  const activeStudentsScope = useMemo(() => {
    if (applyMode === 'cnic') {
      return cnicVerified ? matchedFamilyStudents : []
    }
    const found = instStudents.find(s => s.id === selectedStudentId)
    return found ? [found] : []
  }, [applyMode, cnicVerified, matchedFamilyStudents, instStudents, selectedStudentId])

  const primaryStudent = activeStudentsScope[0] || null

  // Reset / Preselect when opened
  useEffect(() => {
    if (!isOpen) return
    setCashCollected('0')
    setWaiverDiscount('0')
    setUseCredit(false)
    setPaymentMethod('Cash')
    setDiscountReason('')
    setExtraNote('')
    setSendSms(true)
    setAllocateModalType(null)
    setCashSplits({})
    setWaiverSplits({})

    if (preselectedStudentId) {
      const target = instStudents.find(s => s.id === preselectedStudentId)
      if (target) {
        setApplyMode('class')
        setSelectedClass(target.className || '')
        setSelectedStudentId(target.id)
        setCnicVerified(false)
        setMatchedFamilyStudents([])
        return
      }
    }
    setApplyMode('class')
    setSelectedClass('')
    setSelectedStudentId('')
    setCnicInput('')
    setCnicVerified(false)
    setMatchedFamilyStudents([])
  }, [isOpen, preselectedStudentId])

  // Unpaid invoices for selected student or verified family
  const unpaidInvoices = useMemo(() => {
    if (activeStudentsScope.length === 0) return []
    const idSet = new Set(activeStudentsScope.map(s => s.id))
    const nameSet = new Set(activeStudentsScope.map(s => (s.name || '').toLowerCase().trim()))
    return fees.filter(f => {
      if (currentInstitute?.id && f.instituteId && f.instituteId !== currentInstitute.id) return false
      if (f.status === 'Paid') return false
      const matchesStudent = (f.studentId && idSet.has(f.studentId)) || nameSet.has((f.studentName || '').toLowerCase().trim())
      return matchesStudent && getInvoiceOutstanding(f) > 0
    })
  }, [activeStudentsScope, fees, currentInstitute?.id])

  const totalDue = useMemo(
    () => unpaidInvoices.reduce((sum, inv) => sum + getInvoiceOutstanding(inv), 0),
    [unpaidInvoices]
  )

  const latestClassFee = useMemo(() => {
    if (!primaryStudent) return 0
    const allForStudent = fees.filter(
      f =>
        (!currentInstitute?.id || !f.instituteId || f.instituteId === currentInstitute.id) &&
        ((f.studentId && f.studentId === primaryStudent.id) ||
          (f.studentName || '').toLowerCase().trim() === (primaryStudent.name || '').toLowerCase().trim())
    )
    return Number(allForStudent[0]?.amount || unpaidInvoices[0]?.amount || 0)
  }, [primaryStudent, fees, unpaidInvoices, currentInstitute?.id])

  const familyCnic = useMemo(
    () => primaryStudent?.fatherCnic || cnicInput || '',
    [primaryStudent?.fatherCnic, cnicInput]
  )

  const familyCredit = useMemo(
    () => getFamilyCreditBalance(instId, familyCnic),
    [instId, familyCnic, isOpen]
  )

  const cashVal = Math.max(0, Number(cashCollected) || 0)
  const waiverVal = Math.max(0, Number(waiverDiscount) || 0)
  const creditApplied = useCredit ? Math.min(familyCredit, Math.max(0, totalDue - cashVal - waiverVal)) : 0
  const totalApplied = cashVal + waiverVal + creditApplied
  const remainingBalance = Math.max(0, totalDue - totalApplied)

  const handleVerifyCnic = () => {
    const clean = normalizeCnic(cnicInput)
    if (clean.length < 5) {
      toast?.error?.('Enter a valid parent CNIC (13 digits, dashes optional).')
      return
    }
    const matches = instStudents.filter(
      s => normalizeCnic(s.fatherCnic) === clean || normalizeCnic(s.motherCnic) === clean || normalizeCnic(s.bFormCnic) === clean
    )
    if (matches.length === 0) {
      setCnicVerified(false)
      setMatchedFamilyStudents([])
      toast?.error?.('No enrolled student profile matched this parent CNIC.')
      return
    }
    setMatchedFamilyStudents(matches)
    setCnicVerified(true)
    toast?.success?.(`Verified parent CNIC • Found ${matches.length} student profile(s).`)
  }

  const openAllocateModal = (type) => {
    if (unpaidInvoices.length === 0) {
      toast?.info?.('No unpaid invoices available to allocate for this student.')
      return
    }
    if (type === 'cash') {
      const init = {}
      unpaidInvoices.forEach(inv => {
        init[inv.id] = cashSplits[inv.id] !== undefined ? String(cashSplits[inv.id]) : '0'
      })
      setCashSplits(init)
    } else {
      const init = {}
      unpaidInvoices.forEach(inv => {
        init[inv.id] = waiverSplits[inv.id] !== undefined ? String(waiverSplits[inv.id]) : '0'
      })
      setWaiverSplits(init)
    }
    setAllocateModalType(type)
  }

  const applyAllocationSplit = () => {
    if (allocateModalType === 'cash') {
      const sum = unpaidInvoices.reduce((s, inv) => s + Math.max(0, Number(cashSplits[inv.id]) || 0), 0)
      setCashCollected(String(sum))
    } else if (allocateModalType === 'waiver') {
      const sum = unpaidInvoices.reduce((s, inv) => s + Math.max(0, Number(waiverSplits[inv.id]) || 0), 0)
      setWaiverDiscount(String(sum))
    }
    setAllocateModalType(null)
  }

  const handleSavePayment = async (e) => {
    e.preventDefault()
    if (!primaryStudent) {
      toast?.error?.('Select a student or verify parent CNIC first.')
      return
    }
    if (totalApplied <= 0) {
      toast?.error?.('Enter cash collected, family credit, and/or waiver greater than zero.')
      return
    }
    if (unpaidInvoices.length === 0) {
      toast?.error?.('No unpaid invoice found for this student.')
      return
    }

    setIsSaving(true)
    try {
      await applyPaymentDistributionToInvoices({
        unpaidInvoices,
        cashVal,
        waiverVal,
        creditApplied,
        cashSplits,
        waiverSplits,
        discountReason,
        paymentMethod,
        extraNote,
        updateItem
      })

      if (creditApplied > 0 && familyCnic) {
        updateFamilyCreditBalance(instId, familyCnic, -creditApplied)
      }

      // Refresh student feeStatus badge if all cleared
      if (remainingBalance <= 0) {
        for (const st of activeStudentsScope) {
          await updateItem('students', st.id, { feeStatus: 'Paid' })
        }
      }

      if (cashVal > 0) {
        recordCampusLedgerTransaction(currentInstitute?.id, {
          id: `VCH-QP-${Date.now()}`,
          date: new Date().toISOString().split('T')[0],
          description: `Quick Payment — ${primaryStudent.name}${activeStudentsScope.length > 1 ? ` (+${activeStudentsScope.length - 1} family)` : ''}`,
          type: 'Income',
          category: 'Tuition Revenues',
          debit: 0,
          credit: cashVal,
          account: paymentMethod,
          status: 'Cleared',
          ref: `QP-${Date.now()}`
        })
      }

      const parentPhone = primaryStudent.guardianWhatsapp || primaryStudent.guardianPhone || primaryStudent.phone
      if (sendSms && parentPhone && sendCommunicationBlast) {
        sendCommunicationBlast({
          channel: 'SMS',
          recipientGroup: `${primaryStudent.fatherName || 'Guardian'} (${parentPhone})`,
          message: `Dear ${primaryStudent.fatherName || 'Parent'}, payment of PKR ${cashVal.toLocaleString()} received for ${primaryStudent.name}. Remaining balance: PKR ${remainingBalance.toLocaleString()}.`,
          recipientsCount: 1
        })
      }

      if (logAuditEvent) {
        logAuditEvent(
          `Quick payment PKR ${cashVal.toLocaleString()} (waiver PKR ${waiverVal.toLocaleString()}) saved for ${primaryStudent.name}`,
          'Fee Cashier',
          'Success'
        )
      }

      toast?.success?.(`Payment recorded for ${primaryStudent.name}. Remaining balance: PKR ${remainingBalance.toLocaleString()}.`)
      onClose()
    } catch {
      toast?.error?.('Unable to save payment. Please try again.')
    } finally {
      setIsSaving(false)
    }
  }

  if (!isOpen) return null

  const splitSum = allocateModalType === 'cash'
    ? unpaidInvoices.reduce((s, inv) => s + Math.max(0, Number(cashSplits[inv.id]) || 0), 0)
    : unpaidInvoices.reduce((s, inv) => s + Math.max(0, Number(waiverSplits[inv.id]) || 0), 0)

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="w-full max-w-xl bg-white rounded-2xl shadow-2xl overflow-hidden border border-slate-200 relative">
        {/* Top Sky-Blue Modal Header */}
        <div className="bg-sky-500 text-white px-5 py-3.5 flex items-center justify-between">
          <div className="flex items-center gap-2 font-bold text-sm sm:text-base">
            <DollarSign className="w-4 h-4" />
            <span>Quick payment</span>
          </div>
          <button type="button" onClick={onClose} className="text-white/90 hover:text-white cursor-pointer">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSavePayment} className="p-5 space-y-4 text-xs">
          {/* Mode Switcher + Family Credit Strip */}
          <div className="flex flex-wrap items-center justify-between gap-2 pb-2 border-b border-slate-100">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-semibold text-slate-600">Apply payment to</span>
              <div className="inline-flex rounded-lg border border-slate-200 overflow-hidden">
                <button
                  type="button"
                  onClick={() => setApplyMode('class')}
                  className={`px-3 py-1.5 font-semibold flex items-center gap-1.5 cursor-pointer ${
                    applyMode === 'class' ? 'bg-slate-700 text-white' : 'bg-white text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  <Search className="w-3.5 h-3.5" />
                  <span>By Class Search</span>
                </button>
                <button
                  type="button"
                  onClick={() => setApplyMode('cnic')}
                  className={`px-3 py-1.5 font-semibold flex items-center gap-1.5 cursor-pointer ${
                    applyMode === 'cnic' ? 'bg-slate-700 text-white' : 'bg-white text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  <Users className="w-3.5 h-3.5" />
                  <span>Parent / Family (CNIC)</span>
                </button>
              </div>
            </div>

            {primaryStudent && (
              <label className="inline-flex items-center gap-2 px-2.5 py-1 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-800 font-semibold cursor-pointer">
                <span>FAMILY CREDIT PKR {familyCredit.toLocaleString()}</span>
                <input
                  type="checkbox"
                  checked={useCredit}
                  disabled={familyCredit <= 0}
                  onChange={(e) => setUseCredit(e.target.checked)}
                />
                <span>Use credit</span>
              </label>
            )}
          </div>

          {/* Class + Student Selector OR Parent CNIC Verification */}
          {applyMode === 'class' ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Class <span className="text-rose-500">*</span>
                </label>
                <select
                  value={selectedClass}
                  onChange={(e) => {
                    setSelectedClass(e.target.value)
                    setSelectedStudentId('')
                  }}
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 bg-white text-slate-800"
                >
                  <option value="">Choose a class..</option>
                  {availableClasses.map(cls => (
                    <option key={cls} value={cls}>{cls}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Student <span className="text-rose-500">*</span>
                </label>
                <select
                  value={selectedStudentId}
                  onChange={(e) => setSelectedStudentId(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 bg-white text-slate-800"
                >
                  <option value="">Search name, roll no, or father..</option>
                  {studentsInClass.map(s => (
                    <option key={s.id} value={s.id}>
                      {s.name} • Roll {s.rollNumber || s.id}
                    </option>
                  ))}
                </select>
                {!selectedClass && (
                  <p className="text-[10px] text-slate-400 mt-1">Choose a class to filter students</p>
                )}
              </div>
            </div>
          ) : (
            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="font-bold text-slate-800 flex items-center gap-1.5">
                  <CreditCard className="w-4 h-4 text-emerald-600" />
                  <span>Verify parent CNIC</span>
                </span>
                <span className="px-2 py-0.5 rounded bg-white border border-slate-200 text-[10px] text-slate-500 font-semibold">
                  Must match profile
                </span>
              </div>
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="35202-1234567-1"
                  value={cnicInput}
                  onChange={(e) => setCnicInput(e.target.value)}
                  className="flex-1 px-3 py-2 rounded-lg border border-slate-200 bg-white text-xs font-mono text-slate-800"
                />
                <button
                  type="button"
                  onClick={handleVerifyCnic}
                  className="px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-semibold flex items-center gap-1.5 cursor-pointer"
                >
                  <Search className="w-3.5 h-3.5" />
                  <span>Search</span>
                </button>
              </div>
              <p className="text-[10px] text-slate-500 leading-relaxed">
                13 digits, dashes or spaces optional (e.g. 35202-1234567-1). Search by CNIC only, or switch to By Class Search first to match a selected student&apos;s parent on file.
              </p>
              {cnicVerified && (
                <div className="p-2.5 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-900 font-semibold">
                  Matched Parent: {primaryStudent?.fatherName} • {matchedFamilyStudents.length} Child(ren)
                </div>
              )}
            </div>
          )}

          {/* Due Summary Strip + Billing Detail Trigger (shown once student/family selected) */}
          {primaryStudent && (
            <div className="space-y-2">
              <div className="rounded-lg border border-cyan-200 bg-cyan-50/70 divide-y divide-cyan-100">
                <div className="px-3.5 py-2 flex items-center justify-between">
                  <span className="font-bold text-slate-700">Total due</span>
                  <span className="font-extrabold text-rose-600 font-mono">PKR {totalDue.toLocaleString()}.00</span>
                </div>
                <div className="px-3.5 py-2 flex items-center justify-between">
                  <span className="text-slate-600">Class fee</span>
                  <span className="font-bold text-slate-800 font-mono">PKR {latestClassFee.toLocaleString()}.00</span>
                </div>
              </div>

              {onOpenBillingDetail && (
                <button
                  type="button"
                  onClick={() => {
                    const target = primaryStudent
                    onClose()
                    onOpenBillingDetail(target)
                  }}
                  className="w-full py-2 rounded-lg bg-cyan-600 hover:bg-cyan-700 text-white font-bold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  <span>Billing detail</span>
                </button>
              )}
            </div>
          )}

          {/* Cash Collected + Waiver/Discount (each with Split Pencil Button!) + Remaining Balance */}
          {(applyMode === 'class' || cnicVerified) && (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block font-semibold text-rose-600 mb-1">Cash collected (PKR)</label>
                  <div className="flex rounded-lg border border-slate-200 overflow-hidden bg-white">
                    <input
                      type="number"
                      min="0"
                      value={cashCollected}
                      onChange={(e) => {
                        setCashSplits({})
                        setCashCollected(e.target.value)
                      }}
                      className="w-full px-3 py-2 text-right font-mono text-slate-900 focus:outline-none"
                    />
                    <button
                      type="button"
                      onClick={() => openAllocateModal('cash')}
                      className="px-2.5 bg-slate-50 hover:bg-slate-100 border-l border-slate-200 text-slate-600 cursor-pointer"
                      title="Allocate cash across unpaid invoices"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Waiver / discount (PKR)</label>
                  <div className="flex rounded-lg border border-slate-200 overflow-hidden bg-white">
                    <input
                      type="number"
                      min="0"
                      value={waiverDiscount}
                      onChange={(e) => {
                        setWaiverSplits({})
                        setWaiverDiscount(e.target.value)
                      }}
                      className="w-full px-3 py-2 text-right font-mono text-slate-900 focus:outline-none"
                    />
                    <button
                      type="button"
                      onClick={() => openAllocateModal('waiver')}
                      className="px-2.5 bg-slate-50 hover:bg-slate-100 border-l border-slate-200 text-slate-600 cursor-pointer"
                      title="Allocate waiver / discount across unpaid invoices"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Remaining balance</label>
                  <div className="w-full px-3 py-2 rounded-lg border border-slate-200 bg-slate-100 text-right font-mono font-bold text-slate-800">
                    {primaryStudent ? `PKR ${remainingBalance.toLocaleString()}.00` : '—'}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Payment method <span className="text-rose-500">*</span>
                  </label>
                  <select
                    value={paymentMethod}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 bg-white text-slate-800"
                  >
                    <option value="Cash">Cash</option>
                    <option value="Bank Transfer">Bank Transfer</option>
                    <option value="1Link / Bill">1Link / Bill</option>
                    <option value="JazzCash">JazzCash</option>
                    <option value="EasyPaisa">EasyPaisa</option>
                    <option value="Cheque">Cheque</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Reason of Discount</label>
                  <input
                    type="text"
                    placeholder="e.g. Management approval, hardship"
                    value={discountReason}
                    onChange={(e) => setDiscountReason(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 bg-white text-slate-800"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Extra note (optional)</label>
                  <input
                    type="text"
                    placeholder="For staff / SMS — not waiver/discount"
                    value={extraNote}
                    onChange={(e) => setExtraNote(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 bg-white text-slate-800"
                  />
                </div>
              </div>

              {primaryStudent && totalApplied <= 0 && (
                <div className="p-2.5 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 flex items-center gap-2 text-[11px]">
                  <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
                  <span>Enter cash, family credit, and/or waiver — at least one must be greater than zero.</span>
                </div>
              )}

              <label className="flex items-center gap-2 text-slate-700 cursor-pointer">
                <input
                  type="checkbox"
                  checked={sendSms}
                  onChange={(e) => setSendSms(e.target.checked)}
                />
                <span>
                  Send payment SMS to parent —{' '}
                  {primaryStudent ? (
                    <strong className="text-emerald-700">
                      {primaryStudent.fatherName || 'Parent'} ({primaryStudent.guardianPhone || primaryStudent.phone || 'No Phone'})
                    </strong>
                  ) : (
                    <span className="text-slate-400">select a student first</span>
                  )}
                </span>
              </label>
            </>
          )}

          {/* Footer Buttons */}
          <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-3.5 py-2 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 font-semibold cursor-pointer"
            >
              Close without saving
            </button>
            <button
              type="submit"
              disabled={isSaving || !primaryStudent || totalApplied <= 0}
              className="px-4 py-2 rounded-lg bg-sky-500 hover:bg-sky-600 text-white font-semibold flex items-center gap-1.5 disabled:opacity-45 cursor-pointer"
            >
              <Check className="w-3.5 h-3.5" />
              <span>{isSaving ? 'Saving...' : 'Save payment'}</span>
            </button>
          </div>
        </form>

        {/* Nested Modal: Allocate cash OR Allocate waiver / discount */}
        {allocateModalType && (
          <div className="absolute inset-0 z-20 bg-slate-900/45 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="w-full max-w-lg bg-white rounded-xl shadow-2xl border border-slate-200 overflow-hidden text-xs">
              <div className="bg-sky-500 text-white px-4 py-3 flex items-center justify-between font-bold">
                <span className="flex items-center gap-1.5">
                  <DollarSign className="w-4 h-4" />
                  <span>{allocateModalType === 'cash' ? 'Allocate cash' : 'Allocate waiver / discount'}</span>
                </span>
                <button type="button" onClick={() => setAllocateModalType(null)} className="text-white/90 hover:text-white cursor-pointer">
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="p-4 space-y-3">
                <div className="p-2.5 rounded-lg bg-sky-50 border border-sky-200 text-sky-900 text-[11px]">
                  {allocateModalType === 'cash'
                    ? 'Enter cash amount for each invoice. Click Apply to save your split and update the cash collected total.'
                    : 'Enter waiver / discount amount for each invoice. Click Apply to save your split and update the waiver total.'}
                </div>

                <div className="max-h-56 overflow-y-auto border border-slate-200 rounded-lg">
                  <table className="w-full text-left">
                    <thead className="bg-slate-50 border-b text-[10px] uppercase text-slate-500">
                      <tr>
                        <th className="py-2 px-3">Invoice</th>
                        <th className="py-2 px-3 text-right">Outstanding (PKR)</th>
                        <th className="py-2 px-3 text-right">{allocateModalType === 'cash' ? 'Cash (PKR)' : 'Waiver (PKR)'}</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {unpaidInvoices.map(inv => {
                        const due = getInvoiceOutstanding(inv)
                        const val = allocateModalType === 'cash' ? (cashSplits[inv.id] ?? '0') : (waiverSplits[inv.id] ?? '0')
                        return (
                          <tr key={inv.id}>
                            <td className="py-2 px-3">
                              <div className="font-bold text-slate-800">Invoice #{String(inv.id).slice(-8)}</div>
                              <div className="text-[10px] text-slate-400">{inv.month || 'Monthly'} — {inv.feeType || 'Tuition'}</div>
                            </td>
                            <td className="py-2 px-3 text-right font-mono">{due.toFixed(2)}</td>
                            <td className="py-2 px-3 text-right">
                              <input
                                type="number"
                                min="0"
                                max={due}
                                value={val}
                                onChange={(e) => {
                                  const raw = e.target.value
                                  if (allocateModalType === 'cash') {
                                    setCashSplits(prev => ({ ...prev, [inv.id]: raw }))
                                  } else {
                                    setWaiverSplits(prev => ({ ...prev, [inv.id]: raw }))
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

                <div className="flex items-center justify-between font-bold px-2 py-1.5 bg-slate-50 rounded-lg">
                  <span>{allocateModalType === 'cash' ? 'Total cash' : 'Total waiver / discount'}</span>
                  <span className="text-emerald-600 font-mono text-sm">{splitSum.toFixed(2)}</span>
                </div>

                <div className="flex justify-end gap-2 pt-2">
                  <button type="button" onClick={() => setAllocateModalType(null)} className="px-3.5 py-1.5 rounded-lg border border-slate-200 text-slate-700 font-semibold cursor-pointer">
                    Cancel
                  </button>
                  <button type="button" onClick={applyAllocationSplit} className="px-4 py-1.5 rounded-lg bg-sky-500 hover:bg-sky-600 text-white font-semibold cursor-pointer">
                    Apply
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default QuickPaymentModal
