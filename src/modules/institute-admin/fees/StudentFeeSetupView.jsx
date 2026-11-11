import React, { useState, useMemo, useEffect, useRef } from 'react'
import {
  ArrowLeft,
  UserPlus,
  DollarSign,
  FileText,
  ArrowDownCircle,
  MessageSquare,
  Eye,
  Pencil,
  Plus,
  X,
  Check,
  Search,
  User,
  CheckCircle2,
  CreditCard,
  Percent,
  AlertTriangle,
  List,
  ArrowLeftRight,
  Filter,
  Download,
  GraduationCap,
  ChevronDown,
  Send
} from 'lucide-react'
import { useAppData } from '../../../context/AppDataContext'
import { useToast } from '../../../context/ToastContext'

const FEE_TYPES = ['Monthly', 'Quarterly', 'Yearly', 'One-Time']

const CHARGE_TYPES = [
  'Tuition Fee',
  'Transport Fee',
  'Hostel / Boarding Fee',
  'Computer Fee',
  'Lab Charges',
  'Library Fee',
  'Exam Fee',
  'Stationery / Books',
  'Activity / Sports Fee',
  'Other Charge'
]

const formatMoney = (val) => `PKR ${Number(val || 0).toLocaleString()}`

const formatSetupDateTime = (val) => {
  if (!val) return '—'
  const dt = new Date(val)
  if (Number.isNaN(dt.getTime())) return String(val).slice(0, 16)
  const datePart = dt.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })
  const timePart = dt.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
  return `${datePart}, ${timePart}`
}

export const resolveStudentFeeSetup = (student, classes = [], fees = []) => {
  if (!student) {
    return {
      feeType: 'Monthly',
      items: [{ feeType: 'Tuition Fee', amount: 0, routeId: '' }],
      discount: 0,
      tuitionTotal: 0,
      finalAmount: 0,
      referralSource: '',
      notes: '',
      createdAt: '',
      updatedAt: ''
    }
  }

  const saved = student.feeSetup || {}
  const matchedClass = classes.find(
    (c) => (c.name || c.className || '').toLowerCase().trim() === (student.className || student.course || '').toLowerCase().trim()
  )
  const latestStudentFee = fees.find((f) => f.studentId === student.id && Number(f.amount || 0) > 0)

  const inferredTuition = Number(
    student.monthlyFee ??
      student.tuitionFee ??
      saved.tuitionTotal ??
      matchedClass?.monthlyFee ??
      matchedClass?.fee ??
      latestStudentFee?.amount ??
      0
  )

  const items =
    Array.isArray(saved.items) && saved.items.length > 0
      ? saved.items.map((it) => ({
          feeType: it.feeType || 'Tuition Fee',
          amount: Number(it.amount || 0),
          routeId: it.routeId || ''
        }))
      : [{ feeType: 'Tuition Fee', amount: inferredTuition, routeId: '' }]

  const tuitionTotal = items.reduce((s, it) => s + Math.max(0, Number(it.amount) || 0), 0)
  const discount = Math.max(0, Number(saved.discount ?? student.discount ?? 0))
  const finalAmount = Math.max(0, tuitionTotal - discount)

  return {
    feeType: saved.feeType || student.feeType || 'Monthly',
    items,
    discount,
    tuitionTotal,
    finalAmount,
    referralSource: saved.referralSource ?? student.referralSource ?? '',
    notes: saved.notes ?? student.notes ?? '',
    createdAt: saved.createdAt || student.createdAt || student.admissionDate || '',
    updatedAt: saved.updatedAt || student.updatedAt || student.createdAt || student.admissionDate || ''
  }
}

export const StudentFeeSetupView = ({
  studentId = null,
  initialMode = 'details',
  currentInstitute,
  onSelectStudent,
  onRouteChange,
  onOpenQuickPayment,
  onOpenSendSms
}) => {
  const { students = [], classes = [], fees = [], transport = [], updateItem, logAuditEvent } = useAppData()
  const { toast } = useToast()

  const instituteStudents = useMemo(() => {
    if (!currentInstitute?.id) return students
    return students.filter((s) => s.instituteId === currentInstitute.id || !s.instituteId)
  }, [students, currentInstitute?.id])

  const instituteRoutes = useMemo(() => {
    if (!currentInstitute?.id) return transport
    return transport.filter((t) => t.instituteId === currentInstitute.id || !t.instituteId)
  }, [transport, currentInstitute?.id])

  const [viewMode, setViewMode] = useState(() => (studentId && initialMode !== 'list' ? initialMode : 'list'))
  const [listTab, setListTab] = useState('all') // 'all' | 'bulk' | 'create'
  const [showFilters, setShowFilters] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [classFilter, setClassFilter] = useState('All Classes')
  const [feeTypeFilter, setFeeTypeFilter] = useState('All Types')
  const [statusFilter, setStatusFilter] = useState('All')
  const [exportOpen, setExportOpen] = useState(false)
  const exportRef = useRef(null)
  const [saving, setSaving] = useState(false)

  // Bulk Fee Update state
  const [bulkClass, setBulkClass] = useState('All Classes')
  const [bulkAction, setBulkAction] = useState('discount') // 'discount' | 'fixed_tuition' | 'flat_increase' | 'percent_increase'
  const [bulkValue, setBulkValue] = useState('')
  const [bulkFeeType, setBulkFeeType] = useState('Monthly')
  const [bulkApplying, setBulkApplying] = useState(false)

  // Create New Fee Setup selector
  const [createStudentId, setCreateStudentId] = useState('')

  useEffect(() => {
    if (!exportOpen) return undefined
    const handleOutside = (e) => {
      if (exportRef.current && !exportRef.current.contains(e.target)) setExportOpen(false)
    }
    document.addEventListener('mousedown', handleOutside)
    return () => document.removeEventListener('mousedown', handleOutside)
  }, [exportOpen])

  useEffect(() => {
    if (studentId && initialMode !== 'list') {
      setViewMode(initialMode === 'edit' ? 'edit' : 'details')
    } else if (!studentId && initialMode === 'list') {
      setViewMode('list')
    }
  }, [studentId, initialMode])

  const activeStudent = useMemo(() => {
    if (studentId) {
      const exact = instituteStudents.find((s) => s.id === studentId)
      if (exact) return exact
    }
    return instituteStudents[0] || null
  }, [instituteStudents, studentId])

  const resolvedSetup = useMemo(
    () => resolveStudentFeeSetup(activeStudent, classes, fees),
    [activeStudent, classes, fees]
  )

  // Edit form state
  const [editFeeType, setEditFeeType] = useState('Monthly')
  const [editDiscount, setEditDiscount] = useState('0')
  const [editItems, setEditItems] = useState([{ feeType: 'Tuition Fee', amount: '0', routeId: '' }])
  const [editReferral, setEditReferral] = useState('')
  const [editNotes, setEditNotes] = useState('')
  const [feeSetupSubmitted, setFeeSetupSubmitted] = useState(false)

  useEffect(() => {
    setEditFeeType(resolvedSetup.feeType)
    setEditDiscount(String(resolvedSetup.discount))
    setEditItems(
      resolvedSetup.items.map((it) => ({
        feeType: it.feeType,
        amount: String(it.amount ?? 0),
        routeId: it.routeId || ''
      }))
    )
    setEditReferral(resolvedSetup.referralSource)
    setEditNotes(resolvedSetup.notes)
  }, [activeStudent?.id, resolvedSetup])

  useEffect(() => {
    setFeeSetupSubmitted(false)
  }, [activeStudent?.id, viewMode])

  const editTuitionSum = useMemo(
    () => editItems.reduce((sum, it) => sum + Math.max(0, Number(it.amount) || 0), 0),
    [editItems]
  )
  const editDiscountNum = Math.max(0, Number(editDiscount) || 0)
  const editFinalAmount = Math.max(0, editTuitionSum - editDiscountNum)

  const distinctClasses = useMemo(() => {
    const set = new Set()
    instituteStudents.forEach((s) => {
      if (s.className) set.add(s.className)
    })
    return ['All Classes', ...Array.from(set).sort()]
  }, [instituteStudents])

  const directoryRows = useMemo(
    () =>
      instituteStudents.map((stu) => ({
        student: stu,
        setup: resolveStudentFeeSetup(stu, classes, fees)
      })),
    [instituteStudents, classes, fees]
  )

  const directoryStats = useMemo(() => {
    const activeRows = directoryRows.filter((r) => (r.student.status || 'Active') !== 'Dropped')
    const configuredRows = activeRows.filter((r) => r.setup.finalAmount > 0 || Boolean(r.student.feeSetup))
    const discountRows = configuredRows.filter((r) => r.setup.discount > 0)
    const transportCount = configuredRows.filter((r) =>
      r.setup.items.some((it) => (it.feeType || '').toLowerCase().includes('transport') && Number(it.amount) > 0)
    ).length
    const netTotal = configuredRows.reduce((s, r) => s + r.setup.finalAmount, 0)
    const baseTotal = configuredRows.reduce((s, r) => s + r.setup.tuitionTotal, 0)
    const waivedTotal = discountRows.reduce((s, r) => s + r.setup.discount, 0)
    const avgFinal = configuredRows.length > 0 ? Math.round(netTotal / configuredRows.length) : 0
    const pendingCount = Math.max(0, activeRows.length - configuredRows.length)
    return {
      configuredCount: configuredRows.length,
      activeCount: activeRows.length,
      netTotal,
      baseTotal,
      avgFinal,
      discountCount: discountRows.length,
      waivedTotal,
      transportCount,
      pendingCount
    }
  }, [directoryRows])

  const filteredListRows = useMemo(() => {
    const q = searchQuery.trim().toLowerCase()
    return directoryRows.filter(({ student: s, setup }) => {
      if (classFilter !== 'All Classes' && (s.className || '') !== classFilter) return false
      if (feeTypeFilter !== 'All Types' && setup.feeType !== feeTypeFilter) return false
      if (statusFilter === 'With Discount' && setup.discount <= 0) return false
      if (statusFilter === 'Pending Setup' && (setup.finalAmount > 0 || Boolean(s.feeSetup))) return false
      if (!q) return true
      const name = (s.fullName || s.name || '').toLowerCase()
      const roll = String(s.rollNumber || '').toLowerCase()
      const adm = String(s.admissionNo || s.registrationNo || s.systemAdmissionNo || '').toLowerCase()
      return name.includes(q) || roll.includes(q) || adm.includes(q)
    })
  }, [directoryRows, searchQuery, classFilter, feeTypeFilter, statusFilter])

  const openStudentMode = (stuId, mode) => {
    onSelectStudent?.(stuId)
    setViewMode(mode)
  }

  const handleExportFeeSetups = (format) => {
    setExportOpen(false)
    if (filteredListRows.length === 0) {
      toast?.info?.('No student fee setups available to export.')
      return
    }
    const sep = format === 'tsv' ? '\t' : ','
    const esc = (val) => {
      const str = String(val ?? '')
      if (format === 'tsv') return str.replace(/\t|\n/g, ' ')
      return `"${str.replace(/"/g, '""')}"`
    }
    const headers = ['S/N', 'Roll No', 'Admission No', 'Student Name', 'Class', 'Contact', 'Fee Type', 'Base (PKR)', 'Discount (PKR)', 'Final (PKR)', 'Created At', 'Updated At']
    const lines = [
      headers.map(esc).join(sep),
      ...filteredListRows.map(({ student: stu, setup }, idx) => {
        const adm = stu.admissionNo || stu.registrationNo || stu.systemAdmissionNo || String(stu.id || '').slice(-8).toUpperCase()
        return [
          idx + 1,
          stu.rollNumber || 'N/A',
          adm,
          stu.fullName || stu.name || 'Student',
          stu.className || stu.course || 'Unassigned',
          stu.phone || stu.guardianPhone || 'N/A',
          setup.feeType,
          setup.tuitionTotal,
          setup.discount,
          setup.finalAmount,
          formatSetupDateTime(setup.createdAt),
          formatSetupDateTime(setup.updatedAt)
        ]
          .map(esc)
          .join(sep)
      })
    ]
    const blob = new Blob([lines.join('\n')], {
      type: format === 'tsv' ? 'application/vnd.ms-excel;charset=utf-8;' : 'text/csv;charset=utf-8;'
    })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `student-fee-setups.${format === 'tsv' ? 'xls' : 'csv'}`
    a.click()
    URL.revokeObjectURL(url)
    toast?.success?.(`Exported ${filteredListRows.length} fee setup record(s).`)
  }

  const bulkTargetRows = useMemo(
    () =>
      directoryRows.filter(
        ({ student: s }) => bulkClass === 'All Classes' || (s.className || '') === bulkClass
      ),
    [directoryRows, bulkClass]
  )

  const handleApplyBulkFeeUpdate = async (e) => {
    e.preventDefault()
    const valNum = Math.max(0, Number(bulkValue) || 0)
    if (bulkTargetRows.length === 0) {
      toast?.error?.('No students found in the selected class.')
      return
    }
    setBulkApplying(true)
    try {
      const nowIso = new Date().toISOString()
      for (const { student: stu, setup } of bulkTargetRows) {
        let nextTuition = setup.tuitionTotal
        let nextDiscount = setup.discount
        let nextItems = setup.items.map((it) => ({ ...it }))

        if (bulkAction === 'discount') {
          nextDiscount = valNum
        } else if (bulkAction === 'fixed_tuition') {
          nextTuition = valNum
          nextItems = [{ feeType: 'Tuition Fee', amount: valNum, routeId: '' }]
        } else if (bulkAction === 'flat_increase') {
          nextTuition = setup.tuitionTotal + valNum
          if (nextItems.length > 0) nextItems[0].amount += valNum
        } else if (bulkAction === 'percent_increase') {
          const factor = 1 + valNum / 100
          nextItems = nextItems.map((it) => ({ ...it, amount: Math.round(it.amount * factor) }))
          nextTuition = nextItems.reduce((s, it) => s + it.amount, 0)
        }
        const nextFinal = Math.max(0, nextTuition - nextDiscount)
        await updateItem('students', stu.id, {
          monthlyFee: nextFinal,
          tuitionFee: nextTuition,
          discount: nextDiscount,
          updatedAt: nowIso,
          feeSetup: {
            ...setup,
            feeType: bulkFeeType || setup.feeType,
            tuitionTotal: nextTuition,
            discount: nextDiscount,
            finalAmount: nextFinal,
            items: nextItems,
            createdAt: setup.createdAt || nowIso,
            updatedAt: nowIso
          }
        })
      }
      logAuditEvent?.(
        `Bulk updated fee setup (${bulkAction}: ${valNum}) for ${bulkTargetRows.length} students (${bulkClass})`,
        'Student Fee Setup',
        'Success'
      )
      toast?.success?.(`Updated fee setup for ${bulkTargetRows.length} student(s).`)
      setListTab('all')
    } catch {
      toast?.error?.('Bulk fee update encountered an error.')
    } finally {
      setBulkApplying(false)
    }
  }

  const handleAddFeeItem = () => {
    setEditItems((prev) => [...prev, { feeType: '', amount: '', routeId: '' }])
  }

  const handleRemoveFeeItem = (idx) => {
    setEditItems((prev) => {
      const next = prev.filter((_, i) => i !== idx)
      return next.length > 0 ? next : [{ feeType: 'Tuition Fee', amount: '0', routeId: '' }]
    })
  }

  const handleUpdateFeeItem = (idx, patch) => {
    setEditItems((prev) => prev.map((it, i) => (i === idx ? { ...it, ...patch } : it)))
  }

  const handleSaveFeeSetup = async (e) => {
    e.preventDefault()
    if (!activeStudent || saving) return

    const hasMissingType = editItems.some((it) => !it.feeType && Number(it.amount) > 0)
    if (hasMissingType) {
      toast?.error?.('Please select a Fee / Charge Type for each fee amount entered.')
      return
    }

    const cleanedItems = editItems
      .filter((it) => it.feeType)
      .map((it) => ({
        feeType: it.feeType,
        amount: Math.max(0, Number(it.amount) || 0),
        routeId: it.routeId || ''
      }))

    const nowIso = new Date().toISOString()
    const payload = {
      monthlyFee: editFinalAmount,
      tuitionFee: editTuitionSum,
      discount: editDiscountNum,
      referralSource: editReferral.trim(),
      notes: editNotes.trim(),
      updatedAt: nowIso,
      feeSetup: {
        feeType: editFeeType,
        tuitionTotal: editTuitionSum,
        discount: editDiscountNum,
        finalAmount: editFinalAmount,
        items: cleanedItems.length > 0 ? cleanedItems : [{ feeType: 'Tuition Fee', amount: 0, routeId: '' }],
        referralSource: editReferral.trim(),
        notes: editNotes.trim(),
        createdAt: resolvedSetup.createdAt || nowIso,
        updatedAt: nowIso
      }
    }

    setSaving(true)
    try {
      await updateItem('students', activeStudent.id, payload)
      logAuditEvent?.(
        `Updated fee setup for ${activeStudent.fullName || activeStudent.name} (${editFeeType}, Net ${formatMoney(editFinalAmount)})`,
        'Student Fee Setup',
        'Success'
      )
      toast?.success?.('Submitted successfully')
      if (!feeSetupSubmitted) {
        setFeeSetupSubmitted(true)
      } else {
        setViewMode('details')
      }
    } catch {
      toast?.error?.('Unable to update fee setup. Please try again.')
    } finally {
      setSaving(false)
    }
  }

  const studentName = activeStudent?.fullName || activeStudent?.name || 'Student'
  const admissionNo =
    activeStudent?.admissionNo ||
    activeStudent?.registrationNo ||
    activeStudent?.systemAdmissionNo ||
    String(activeStudent?.id || '').slice(-8).toUpperCase()

  const headerTitle =
    viewMode === 'edit' && activeStudent
      ? `Edit Student Fee Setup - ${studentName}`
      : viewMode === 'details' && activeStudent
        ? `Fee Setup Details - ${studentName}`
        : 'Student Fee Setup'

  const handleTopBack = () => {
    if (viewMode === 'edit' || viewMode === 'details') {
      setViewMode('list')
    } else {
      onRouteChange?.('inst-fees-history')
    }
  }

  return (
    <div className="p-4 sm:p-6 space-y-5 max-w-[1440px] mx-auto">
      {/* Page Title & Top Toolbar */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <FileText className="w-5 h-5 text-slate-600" />
            <h1 className="text-lg sm:text-xl font-bold text-slate-900">{headerTitle}</h1>
          </div>
          <button
            type="button"
            onClick={handleTopBack}
            className="text-xs font-medium text-slate-500 hover:text-slate-800 flex items-center gap-1 mt-1 cursor-pointer"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back</span>
          </button>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => onRouteChange?.('inst-admissions-enroll')}
            className="px-3.5 py-2 rounded-xl bg-teal-600 hover:bg-teal-700 text-white text-xs font-semibold flex items-center gap-1.5 shadow-2xs cursor-pointer transition-colors"
          >
            <UserPlus className="w-3.5 h-3.5" />
            <span>New Enrollment</span>
          </button>
          <button
            type="button"
            onClick={() => onOpenQuickPayment?.(activeStudent?.id || null)}
            className="px-3.5 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-white text-xs font-semibold flex items-center gap-1.5 shadow-2xs cursor-pointer transition-colors"
          >
            <DollarSign className="w-3.5 h-3.5" />
            <span>Add Payment</span>
          </button>
          <button
            type="button"
            onClick={() => onRouteChange?.('inst-fees')}
            className="px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold flex items-center gap-1.5 shadow-2xs cursor-pointer transition-colors"
          >
            <FileText className="w-3.5 h-3.5" />
            <span>Generate Invoice</span>
          </button>
          <button
            type="button"
            onClick={() => onRouteChange?.('inst-accounts-expenses')}
            className="px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 text-xs font-semibold flex items-center gap-1.5 shadow-2xs cursor-pointer transition-colors"
          >
            <ArrowDownCircle className="w-3.5 h-3.5 text-slate-500" />
            <span>Manage Expense</span>
          </button>
          <button
            type="button"
            onClick={() => onOpenSendSms?.()}
            className="px-3.5 py-2 rounded-xl bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 text-xs font-semibold flex items-center gap-1.5 shadow-2xs cursor-pointer transition-colors"
          >
            <MessageSquare className="w-3.5 h-3.5 text-slate-500" />
            <span>Send SMS</span>
          </button>
        </div>
      </div>

      {/* Mode 1: Fee Setup Details Card (Picks 2 & 3) */}
      {viewMode === 'details' && activeStudent && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-100 flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2 font-bold text-slate-800 text-sm">
              <Eye className="w-4 h-4 text-slate-600" />
              <span>Fee Setup Details</span>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setViewMode('list')}
                className="px-3.5 py-1.5 rounded-lg bg-slate-600 hover:bg-slate-700 text-white text-xs font-semibold inline-flex items-center gap-1.5 cursor-pointer transition-colors"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Back to List</span>
              </button>
              <button
                type="button"
                onClick={() => setViewMode('edit')}
                className="px-3.5 py-1.5 rounded-lg bg-sky-500 hover:bg-sky-600 text-white text-xs font-semibold inline-flex items-center gap-1.5 cursor-pointer transition-colors shadow-2xs"
              >
                <Pencil className="w-3.5 h-3.5" />
                <span>Edit Fee Setup</span>
              </button>
            </div>
          </div>

          <div className="p-6 space-y-6">
            {/* Student Summary Row */}
            <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center pb-5 border-b border-slate-100">
              <div className="md:col-span-4 flex flex-col items-center text-center">
                <div className="w-24 h-24 rounded-full bg-sky-600/10 border-4 border-sky-200 flex items-center justify-center overflow-hidden">
                  {activeStudent.photo || activeStudent.photoUrl ? (
                    <img
                      src={activeStudent.photo || activeStudent.photoUrl}
                      alt={studentName}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-20 h-20 rounded-full bg-sky-600 text-white flex items-center justify-center">
                      <User className="w-11 h-11" />
                    </div>
                  )}
                </div>
                <h2 className="font-bold text-slate-900 text-sm mt-2.5">{studentName}</h2>
                <p className="text-xs text-slate-500">{activeStudent.className || activeStudent.course || 'Unassigned'}</p>
              </div>

              <div className="md:col-span-4 space-y-1.5 text-xs">
                <p className="font-semibold text-slate-700">Roll Number:</p>
                <span className="inline-block px-2.5 py-0.5 rounded bg-cyan-600 text-white font-bold text-xs">
                  {activeStudent.rollNumber || 'N/A'}
                </span>
              </div>

              <div className="md:col-span-4 space-y-1.5 text-xs">
                <p className="font-semibold text-slate-700">Contact:</p>
                <p className="font-semibold text-slate-800">
                  {activeStudent.phone || activeStudent.guardianPhone || 'N/A'}
                </p>
              </div>
            </div>

            {/* Complete Regular Fee Setup */}
            <div className="space-y-2.5">
              <h3 className="text-sm font-bold text-slate-800">Complete regular fee setup</h3>
              <p className="text-[11px] text-slate-400">
                Fee items and regular transport are billed together on regular class vouchers.
              </p>
              <p className="text-xs text-slate-600 pt-1">
                Regular voucher duration: <strong className="text-slate-900">{resolvedSetup.feeType}</strong>
              </p>

              <div className="border border-slate-200 rounded-xl overflow-hidden divide-y divide-slate-100 text-xs">
                {resolvedSetup.items.map((item, idx) => (
                  <div key={`${item.feeType}-${idx}`} className="px-4 py-2.5 flex items-center justify-between bg-white">
                    <span className="text-slate-700 font-medium">
                      {resolvedSetup.items.length === 1 && item.feeType === 'Tuition Fee' ? 'Scheduled fee' : item.feeType}
                    </span>
                    <span className="font-bold text-slate-900">{formatMoney(item.amount)}</span>
                  </div>
                ))}
                {resolvedSetup.discount > 0 && (
                  <div className="px-4 py-2.5 flex items-center justify-between bg-white text-cyan-700">
                    <span className="font-medium">Fixed Discount</span>
                    <span className="font-bold">- {formatMoney(resolvedSetup.discount)}</span>
                  </div>
                )}
                <div className="px-4 py-2.5 flex items-center justify-between bg-slate-100/90 font-bold text-slate-900">
                  <span>Net regular voucher amount · {resolvedSetup.feeType}</span>
                  <span>{formatMoney(resolvedSetup.finalAmount)}</span>
                </div>
              </div>
            </div>

            {(resolvedSetup.referralSource || resolvedSetup.notes) && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-slate-100 text-xs">
                <div>
                  <p className="font-semibold text-slate-600">Referral Source:</p>
                  <p className="text-slate-800 mt-0.5">{resolvedSetup.referralSource || '—'}</p>
                </div>
                <div>
                  <p className="font-semibold text-slate-600">Additional Notes:</p>
                  <p className="text-slate-800 mt-0.5">{resolvedSetup.notes || '—'}</p>
                </div>
              </div>
            )}

            {/* Timestamps Footer */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 border-t border-slate-100 text-xs">
              <div>
                <p className="font-semibold text-slate-600">Created At:</p>
                <p className="text-slate-800 font-medium mt-0.5">{formatSetupDateTime(resolvedSetup.createdAt)}</p>
              </div>
              <div>
                <p className="font-semibold text-slate-600">Last Updated:</p>
                <p className="text-slate-800 font-medium mt-0.5">{formatSetupDateTime(resolvedSetup.updatedAt)}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Mode 2: Edit Fee Setup Form (Picks 4 & 5) */}
      {viewMode === 'edit' && activeStudent && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-100 flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2 font-bold text-slate-800 text-sm">
              <Pencil className="w-4 h-4 text-slate-600" />
              <span>Edit Fee Setup</span>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setViewMode('list')}
                className="px-3.5 py-1.5 rounded-lg bg-slate-600 hover:bg-slate-700 text-white text-xs font-semibold inline-flex items-center gap-1.5 cursor-pointer transition-colors"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Back to List</span>
              </button>
              <button
                type="button"
                onClick={() => setViewMode('details')}
                className="px-3.5 py-1.5 rounded-lg bg-cyan-500 hover:bg-cyan-600 text-white text-xs font-semibold inline-flex items-center gap-1.5 cursor-pointer transition-colors shadow-2xs"
              >
                <Eye className="w-3.5 h-3.5" />
                <span>View Details</span>
              </button>
            </div>
          </div>

          <form onSubmit={handleSaveFeeSetup} className="p-6 space-y-5 text-xs">
            {/* Student Header Strip */}
            <div className="rounded-xl border border-slate-200 p-4 flex flex-wrap items-center gap-4 bg-white">
              <div className="w-14 h-14 rounded-full bg-sky-600 text-white flex items-center justify-center shrink-0 overflow-hidden border-2 border-sky-200">
                {activeStudent.photo || activeStudent.photoUrl ? (
                  <img
                    src={activeStudent.photo || activeStudent.photoUrl}
                    alt={studentName}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <User className="w-7 h-7" />
                )}
              </div>
              <div className="space-y-1">
                <h2 className="text-sm font-extrabold text-slate-900">{studentName}</h2>
                <p className="text-[11px] text-slate-500">
                  {activeStudent.className || activeStudent.course || 'Class'}{' '}
                  {activeStudent.section ? `· Section ${activeStudent.section}` : ''}
                </p>
                <div className="flex flex-wrap items-center gap-1.5 pt-0.5">
                  <span className="px-2 py-0.5 rounded bg-cyan-600 text-white font-bold text-[10px]">
                    Roll {activeStudent.rollNumber || 'N/A'}
                  </span>
                  <span className="px-2 py-0.5 rounded bg-slate-600 text-white font-bold text-[10px]">
                    Adm {admissionNo}
                  </span>
                  <span className="px-2 py-0.5 rounded bg-emerald-600 text-white font-bold text-[10px]">
                    {editFeeType}
                  </span>
                </div>
              </div>
            </div>

            {/* Section 1: FEE SCHEDULE & AMOUNTS */}
            <div className="rounded-xl border border-slate-200 p-5 space-y-4">
              <div className="border-l-4 border-sky-500 pl-2.5 text-xs font-extrabold text-sky-700 uppercase tracking-wider">
                FEE SCHEDULE &amp; AMOUNTS
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Fee type <span className="text-rose-500">*</span>
                  </label>
                  <select
                    value={editFeeType}
                    onChange={(e) => setEditFeeType(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 bg-white text-slate-800 font-medium focus:outline-none focus:ring-2 focus:ring-sky-500/20"
                  >
                    {FEE_TYPES.map((t) => (
                      <option key={t} value={t}>
                        {t}
                      </option>
                    ))}
                  </select>
                  <p className="text-[10px] text-slate-400 mt-1">Monthly, Yearly, One-Time, etc.</p>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Tuition (PKR) <span className="text-rose-500">*</span>
                  </label>
                  <div className="w-full px-3 py-2 rounded-lg border border-slate-200 bg-slate-50 text-slate-800 font-semibold">
                    {editTuitionSum.toLocaleString()}
                  </div>
                  <p className="text-[10px] text-slate-400 mt-1">Sum of the fee items below</p>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Discount (PKR)</label>
                  <input
                    type="number"
                    min="0"
                    step="1"
                    value={editDiscount}
                    onChange={(e) => setEditDiscount(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 bg-white text-slate-800 font-semibold focus:outline-none focus:ring-2 focus:ring-sky-500/20"
                  />
                  <p className="text-[10px] text-slate-400 mt-1">Fixed amount, not %</p>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Final (PKR)</label>
                  <div className="w-full px-3 py-2 rounded-lg border border-emerald-200 bg-emerald-50 text-emerald-700 font-extrabold">
                    {formatMoney(editFinalAmount)}
                  </div>
                  <p className="text-[10px] text-slate-400 mt-1">Tuition − discount</p>
                </div>
              </div>

              {/* Fee Items List */}
              <div className="pt-2 space-y-2">
                <div className="flex items-center justify-between gap-2">
                  <span className="font-semibold text-slate-700">
                    Fee items <span className="text-slate-400 font-normal">(optional)</span>
                  </span>
                  <button
                    type="button"
                    onClick={handleAddFeeItem}
                    className="px-3 py-1 rounded-lg border border-sky-400 text-sky-600 hover:bg-sky-50 font-semibold inline-flex items-center gap-1 cursor-pointer transition-colors"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add fee item</span>
                  </button>
                </div>

                <div className="space-y-2.5">
                  {editItems.map((item, idx) => {
                    const isTransport = item.feeType === 'Transport Fee'
                    const matchedRoute = isTransport
                      ? instituteRoutes.find((r) => String(r.id) === String(item.routeId))
                      : null
                    const suggestedPrice = matchedRoute ? Number(matchedRoute.monthlyFee || matchedRoute.fee || 0) : 0

                    return (
                      <div key={idx} className="space-y-1.5">
                        <div className="grid grid-cols-12 gap-2.5 items-end">
                          <div className="col-span-12 sm:col-span-8">
                            {idx === 0 && (
                              <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1">
                                FEE / CHARGE TYPE
                              </label>
                            )}
                            <select
                              value={item.feeType}
                              onChange={(e) => handleUpdateFeeItem(idx, { feeType: e.target.value, routeId: '' })}
                              className="w-full px-3 py-2 rounded-lg border border-slate-200 bg-white text-slate-800 font-medium focus:outline-none focus:ring-2 focus:ring-sky-500/20"
                            >
                              <option value="">Select...</option>
                              {CHARGE_TYPES.map((ct) => (
                                <option key={ct} value={ct}>
                                  {ct}
                                </option>
                              ))}
                            </select>
                          </div>

                          <div className="col-span-10 sm:col-span-3">
                            {idx === 0 && (
                              <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1">
                                AMOUNT (PKR)
                              </label>
                            )}
                            <input
                              type="number"
                              min="0"
                              step="1"
                              value={item.amount}
                              onChange={(e) => handleUpdateFeeItem(idx, { amount: e.target.value })}
                              placeholder="e.g. 15000"
                              className="w-full px-3 py-2 rounded-lg border border-slate-200 bg-white text-slate-800 placeholder:text-slate-400 font-semibold focus:outline-none focus:ring-2 focus:ring-sky-500/20"
                            />
                          </div>

                          <div className="col-span-2 sm:col-span-1 flex justify-center pb-2">
                            <button
                              type="button"
                              onClick={() => handleRemoveFeeItem(idx)}
                              title="Remove fee item"
                              className="text-rose-400 hover:text-rose-600 cursor-pointer p-1"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          </div>
                        </div>

                        {isTransport && (
                          <div className="flex flex-wrap items-center gap-2 pl-1">
                            <select
                              value={item.routeId}
                              onChange={(e) => {
                                const rId = e.target.value
                                const rt = instituteRoutes.find((r) => String(r.id) === String(rId))
                                const sug = rt ? Number(rt.monthlyFee || rt.fee || 0) : 0
                                handleUpdateFeeItem(idx, {
                                  routeId: rId,
                                  ...(sug > 0 ? { amount: String(sug) } : {})
                                })
                              }}
                              className="px-2.5 py-1.5 rounded-lg border border-slate-200 bg-slate-50 text-slate-700 text-[11px]"
                            >
                              <option value="">Select transport route...</option>
                              {instituteRoutes.map((rt) => (
                                <option key={rt.id} value={rt.id}>
                                  {rt.routeName || rt.name || `Route ${rt.id}`}
                                </option>
                              ))}
                            </select>
                            {matchedRoute && (
                              <span className="text-[11px] font-semibold text-sky-700">
                                Suggested Price: {formatMoney(suggestedPrice)}
                              </span>
                            )}
                          </div>
                        )}
                      </div>
                    )
                  })}
                </div>

                <p className="text-[10px] text-slate-400">
                  For Transport Fee, pick a route to see Suggested Price under it. Leave blank for no scheduled fee.
                </p>
              </div>
            </div>

            {/* Section 2: OPTIONAL DETAILS */}
            <div className="rounded-xl border border-slate-200 p-5 space-y-3">
              <div className="border-l-4 border-sky-500 pl-2.5 text-xs font-extrabold text-sky-700 uppercase tracking-wider">
                OPTIONAL DETAILS
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Referral source</label>
                  <input
                    type="text"
                    value={editReferral}
                    onChange={(e) => setEditReferral(e.target.value)}
                    placeholder="If referred by someone"
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-500/20"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Additional notes</label>
                  <textarea
                    rows={2}
                    value={editNotes}
                    onChange={(e) => setEditNotes(e.target.value)}
                    placeholder="Internal notes about this fee setup"
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-500/20 resize-y"
                  />
                </div>
              </div>
            </div>

            {/* Footer Update / Submit Form Bar */}
            <div className="flex flex-wrap items-center justify-end gap-3 pt-1">
              {feeSetupSubmitted && (
                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-700 font-semibold text-xs">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Submitted successfully</span>
                </span>
              )}
              <button
                type="submit"
                disabled={saving}
                className="px-5 py-2.5 rounded-xl bg-sky-500 hover:bg-sky-600 text-white font-bold text-xs inline-flex items-center gap-1.5 shadow-sm disabled:opacity-50 cursor-pointer transition-colors"
              >
                {feeSetupSubmitted ? (
                  <>
                    <span>{saving ? 'Submitting...' : 'Submit Form'}</span>
                    <Send className="w-3.5 h-3.5" />
                  </>
                ) : (
                  <>
                    <Check className="w-4 h-4" />
                    <span>{saving ? 'Updating...' : 'Update fee setup'}</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Mode 3: Student Fee Setup Main List View (Pick 4) */}
      {(viewMode === 'list' || !activeStudent) && (
        <div className="space-y-4">
          {/* 4 KPI Summary Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
            <div className="bg-white rounded-xl border border-slate-200 p-4 flex items-center gap-3.5 shadow-2xs">
              <div className="w-11 h-11 rounded-xl bg-emerald-500 text-white flex items-center justify-center shrink-0">
                <CheckCircle2 className="w-5 h-5" />
              </div>
              <div className="min-w-0">
                <p className="text-[11px] font-medium text-slate-400">Students with Fee Setup</p>
                <p className="text-xl font-extrabold text-slate-900 leading-tight mt-0.5">{directoryStats.configuredCount}</p>
                <p className="text-[11px] text-slate-400">Net {formatMoney(directoryStats.netTotal)}</p>
              </div>
            </div>

            <div className="bg-white rounded-xl border border-slate-200 p-4 flex items-center gap-3.5 shadow-2xs">
              <div className="w-11 h-11 rounded-xl bg-sky-500 text-white flex items-center justify-center shrink-0">
                <CreditCard className="w-5 h-5" />
              </div>
              <div className="min-w-0">
                <p className="text-[11px] font-medium text-slate-400">Average Final Fee</p>
                <p className="text-xl font-extrabold text-slate-900 leading-tight mt-0.5">
                  {directoryStats.avgFinal.toLocaleString()}
                </p>
                <p className="text-[11px] text-slate-400">Base total {formatMoney(directoryStats.baseTotal)}</p>
              </div>
            </div>

            <div className="bg-white rounded-xl border border-slate-200 p-4 flex items-center gap-3.5 shadow-2xs">
              <div className="w-11 h-11 rounded-xl bg-orange-500 text-white flex items-center justify-center shrink-0">
                <Percent className="w-5 h-5" />
              </div>
              <div className="min-w-0">
                <p className="text-[11px] font-medium text-slate-400">With Discount</p>
                <p className="text-xl font-extrabold text-slate-900 leading-tight mt-0.5">{directoryStats.discountCount}</p>
                <p className="text-[11px] text-slate-400">
                  {formatMoney(directoryStats.waivedTotal)} waived · Transport setups: {directoryStats.transportCount}
                </p>
              </div>
            </div>

            <div className="bg-white rounded-xl border border-slate-200 p-4 flex items-center gap-3.5 shadow-2xs">
              <div className="w-11 h-11 rounded-xl bg-rose-500 text-white flex items-center justify-center shrink-0">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div className="min-w-0">
                <p className="text-[11px] font-medium text-slate-400">Pending Fee Setup</p>
                <p className="text-xl font-extrabold text-slate-900 leading-tight mt-0.5">{directoryStats.pendingCount}</p>
                <p className="text-[11px] text-slate-400">of {directoryStats.activeCount} active students</p>
              </div>
            </div>
          </div>

          {/* Main Tabs + Directory Card */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-visible">
            <div className="px-4 sm:px-5 pt-3 border-b border-slate-200 flex flex-wrap items-center justify-between gap-2">
              <div className="flex flex-wrap items-center gap-1 -mb-px">
                {[
                  { id: 'all', label: 'All Fee Setups', icon: List },
                  { id: 'bulk', label: 'Bulk Fee Update', icon: ArrowLeftRight },
                  { id: 'create', label: 'Create New Fee Setup', icon: Plus }
                ].map((tab) => {
                  const Icon = tab.icon
                  const isActive = listTab === tab.id
                  return (
                    <button
                      key={tab.id}
                      type="button"
                      onClick={() => setListTab(tab.id)}
                      className={`px-3.5 py-2.5 text-xs font-semibold inline-flex items-center gap-1.5 border-b-2 transition-colors cursor-pointer ${
                        isActive
                          ? 'border-slate-800 text-slate-900 bg-white rounded-t-lg border-t border-x border-slate-200'
                          : 'border-transparent text-slate-500 hover:text-slate-800'
                      }`}
                    >
                      <Icon className="w-3.5 h-3.5" />
                      <span>{tab.label}</span>
                    </button>
                  )
                })}
              </div>

              <div className="flex items-center gap-2 pb-2">
                <button
                  type="button"
                  onClick={() => setShowFilters((f) => !f)}
                  className={`px-3 py-1.5 rounded-lg border text-xs font-semibold inline-flex items-center gap-1.5 cursor-pointer transition-colors ${
                    showFilters
                      ? 'bg-sky-50 border-sky-300 text-sky-700'
                      : 'bg-white border-sky-300 text-sky-600 hover:bg-sky-50'
                  }`}
                >
                  <Filter className="w-3.5 h-3.5" />
                  <span>Show Filters</span>
                </button>

                <div className="relative" ref={exportRef}>
                  <button
                    type="button"
                    onClick={() => setExportOpen((o) => !o)}
                    className="px-3.5 py-1.5 rounded-lg bg-sky-500 hover:bg-sky-600 text-white text-xs font-bold inline-flex items-center gap-1.5 cursor-pointer shadow-2xs"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Export</span>
                    <ChevronDown className="w-3 h-3" />
                  </button>
                  {exportOpen && (
                    <div className="absolute right-0 mt-1.5 w-44 bg-white rounded-xl shadow-xl border border-slate-200 py-1 z-30 text-xs">
                      <button
                        type="button"
                        onClick={() => handleExportFeeSetups('csv')}
                        className="w-full text-left px-3.5 py-2 hover:bg-slate-50 font-semibold text-slate-700 cursor-pointer"
                      >
                        Export as CSV (.csv)
                      </button>
                      <button
                        type="button"
                        onClick={() => handleExportFeeSetups('tsv')}
                        className="w-full text-left px-3.5 py-2 hover:bg-slate-50 font-semibold text-slate-700 cursor-pointer"
                      >
                        Export as Excel (.xls)
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Expandable Filter Strip */}
            {showFilters && listTab === 'all' && (
              <div className="px-5 py-3.5 bg-slate-50/70 border-b border-slate-200 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
                <div className="relative">
                  <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search student, roll, adm..."
                    className="w-full pl-8 pr-3 py-1.5 rounded-lg border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-sky-500/20"
                  />
                </div>
                <select
                  value={classFilter}
                  onChange={(e) => setClassFilter(e.target.value)}
                  className="px-3 py-1.5 rounded-lg border border-slate-200 bg-white font-medium"
                >
                  {distinctClasses.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
                <select
                  value={feeTypeFilter}
                  onChange={(e) => setFeeTypeFilter(e.target.value)}
                  className="px-3 py-1.5 rounded-lg border border-slate-200 bg-white font-medium"
                >
                  <option value="All Types">All Fee Types</option>
                  {FEE_TYPES.map((t) => (
                    <option key={t} value={t}>
                      {t}
                    </option>
                  ))}
                </select>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="px-3 py-1.5 rounded-lg border border-slate-200 bg-white font-medium"
                >
                  <option value="All">All Setup Statuses</option>
                  <option value="With Discount">With Discount</option>
                  <option value="Pending Setup">Pending Fee Setup</option>
                </select>
              </div>
            )}

            {/* Tab 1: All Fee Setups Table */}
            {listTab === 'all' && (
              <>
                {filteredListRows.length === 0 ? (
                  <div className="p-10 text-center text-xs text-slate-500">No students match the current filter.</div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-slate-50/70 border-b border-slate-200 text-[11px] font-bold text-slate-700">
                        <tr>
                          <th className="py-3 px-4">#</th>
                          <th className="py-3 px-4">Photo</th>
                          <th className="py-3 px-4">Student ID</th>
                          <th className="py-3 px-4">Student &amp; Class</th>
                          <th className="py-3 px-4">Contact &amp; Fee Type</th>
                          <th className="py-3 px-4">Fee Details</th>
                          <th className="py-3 px-4">Created / Updated</th>
                          <th className="py-3 px-4 text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {filteredListRows.map(({ student: stu, setup }, idx) => {
                          const adm =
                            stu.admissionNo ||
                            stu.registrationNo ||
                            stu.systemAdmissionNo ||
                            String(stu.id || '').slice(-8).toUpperCase()
                          return (
                            <tr key={stu.id} className="hover:bg-slate-50/70 transition-colors">
                              <td className="py-3 px-4 text-slate-500 font-medium">{idx + 1}</td>
                              <td className="py-3 px-4">
                                <div className="w-9 h-9 rounded-full bg-sky-600/15 border border-sky-200 flex items-center justify-center overflow-hidden">
                                  {stu.photo || stu.photoUrl ? (
                                    <img
                                      src={stu.photo || stu.photoUrl}
                                      alt={stu.fullName || stu.name}
                                      className="w-full h-full object-cover"
                                    />
                                  ) : (
                                    <div className="w-7 h-7 rounded-full bg-sky-600 text-white flex items-center justify-center">
                                      <User className="w-4 h-4" />
                                    </div>
                                  )}
                                </div>
                              </td>
                              <td className="py-3 px-4">
                                <div className="space-y-1">
                                  <div>
                                    <span className="inline-block px-2 py-0.5 rounded border border-sky-300 bg-sky-50 text-sky-700 font-bold text-[10px]">
                                      Roll No: {stu.rollNumber || 'N/A'}
                                    </span>
                                  </div>
                                  <div>
                                    <span className="inline-block px-2 py-0.5 rounded border border-slate-200 bg-slate-100 text-slate-700 font-semibold text-[10px]">
                                      Ad No: {adm}
                                    </span>
                                  </div>
                                </div>
                              </td>
                              <td className="py-3 px-4">
                                <div className="font-bold text-slate-900">{stu.fullName || stu.name}</div>
                                <div className="text-[11px] text-slate-400 inline-flex items-center gap-1 mt-0.5">
                                  <GraduationCap className="w-3 h-3" />
                                  <span>{stu.className || stu.course || 'Unassigned'}</span>
                                </div>
                              </td>
                              <td className="py-3 px-4">
                                <div className="text-slate-600 text-[11px]">
                                  Contact: <strong className="text-slate-800">{stu.phone || stu.guardianPhone || 'N/A'}</strong>
                                </div>
                                <div className="mt-1 inline-flex items-center gap-1 text-[11px] text-slate-600">
                                  <span>Fee Type:</span>
                                  <span className="px-2 py-0.5 rounded bg-emerald-600 text-white font-bold text-[10px]">
                                    {setup.feeType}
                                  </span>
                                </div>
                              </td>
                              <td className="py-3 px-4 space-y-0.5 text-[11px]">
                                <div>
                                  <span className="text-sky-600 font-semibold">Base:</span>{' '}
                                  <span className="text-slate-700 font-bold">{formatMoney(setup.tuitionTotal)}</span>
                                </div>
                                <div>
                                  <span className="text-rose-500 font-semibold">Discount:</span>{' '}
                                  <span className="text-slate-700 font-bold">{formatMoney(setup.discount)}</span>
                                </div>
                                <div className="flex items-center gap-1">
                                  <span className="text-emerald-600 font-semibold">Final:</span>
                                  <span className="px-1.5 py-0.5 rounded bg-orange-500 text-white font-bold text-[10px]">
                                    {formatMoney(setup.finalAmount)}
                                  </span>
                                </div>
                              </td>
                              <td className="py-3 px-4 text-[10px] space-y-1 text-slate-500">
                                <div>
                                  <span className="font-bold text-slate-700 block">Created:</span>
                                  <span>{formatSetupDateTime(setup.createdAt)}</span>
                                </div>
                                <div>
                                  <span className="font-bold text-slate-700 block">Updated:</span>
                                  <span>{formatSetupDateTime(setup.updatedAt)}</span>
                                </div>
                              </td>
                              <td className="py-3 px-4 text-right">
                                <div className="inline-flex items-center gap-1">
                                  <button
                                    type="button"
                                    onClick={() => openStudentMode(stu.id, 'details')}
                                    title="View Fee Setup Details"
                                    className="p-1.5 rounded border border-cyan-300 bg-cyan-50/70 hover:bg-cyan-100 text-cyan-600 cursor-pointer transition-colors"
                                  >
                                    <Eye className="w-3.5 h-3.5" />
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => openStudentMode(stu.id, 'edit')}
                                    title="Edit Fee Setup"
                                    className="p-1.5 rounded border border-sky-300 bg-sky-50/70 hover:bg-sky-100 text-sky-600 cursor-pointer transition-colors"
                                  >
                                    <Pencil className="w-3.5 h-3.5" />
                                  </button>
                                </div>
                              </td>
                            </tr>
                          )
                        })}
                      </tbody>
                    </table>
                  </div>
                )}
              </>
            )}

            {/* Tab 2: Bulk Fee Update */}
            {listTab === 'bulk' && (
              <form onSubmit={handleApplyBulkFeeUpdate} className="p-6 space-y-4 text-xs">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Target Class</label>
                    <select
                      value={bulkClass}
                      onChange={(e) => setBulkClass(e.target.value)}
                      className="w-full px-3 py-2 rounded-lg border border-slate-200 bg-white font-medium"
                    >
                      {distinctClasses.map((c) => (
                        <option key={c} value={c}>
                          {c}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Fee Type Schedule</label>
                    <select
                      value={bulkFeeType}
                      onChange={(e) => setBulkFeeType(e.target.value)}
                      className="w-full px-3 py-2 rounded-lg border border-slate-200 bg-white font-medium"
                    >
                      {FEE_TYPES.map((t) => (
                        <option key={t} value={t}>
                          {t}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Bulk Update Rule</label>
                    <select
                      value={bulkAction}
                      onChange={(e) => setBulkAction(e.target.value)}
                      className="w-full px-3 py-2 rounded-lg border border-slate-200 bg-white font-medium"
                    >
                      <option value="discount">Set Fixed Discount (PKR)</option>
                      <option value="fixed_tuition">Set Fixed Base Tuition (PKR)</option>
                      <option value="flat_increase">Increase Base Tuition (PKR)</option>
                      <option value="percent_increase">Increase Tuition (%)</option>
                    </select>
                  </div>
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Value</label>
                    <input
                      type="number"
                      min="0"
                      value={bulkValue}
                      onChange={(e) => setBulkValue(e.target.value)}
                      placeholder="Enter amount or %"
                      required
                      className="w-full px-3 py-2 rounded-lg border border-slate-200 bg-white font-semibold"
                    />
                  </div>
                </div>
                <div className="flex flex-wrap items-center justify-between gap-2 pt-3 border-t border-slate-100">
                  <span className="text-slate-500">
                    Applies to <strong className="text-slate-900">{bulkTargetRows.length}</strong> student(s) in{' '}
                    <strong className="text-slate-900">{bulkClass}</strong>.
                  </span>
                  <button
                    type="submit"
                    disabled={bulkApplying || bulkTargetRows.length === 0}
                    className="px-4 py-2 rounded-lg bg-sky-500 hover:bg-sky-600 text-white font-bold inline-flex items-center gap-1.5 disabled:opacity-50 cursor-pointer"
                  >
                    <Check className="w-3.5 h-3.5" />
                    <span>{bulkApplying ? 'Applying...' : 'Apply Bulk Update'}</span>
                  </button>
                </div>
              </form>
            )}

            {/* Tab 3: Create New Fee Setup */}
            {listTab === 'create' && (
              <div className="p-6 space-y-4 text-xs">
                <p className="text-slate-600">
                  Select a student below to configure or update their regular fee schedule items and discount:
                </p>
                <div className="flex flex-wrap items-center gap-3">
                  <select
                    value={createStudentId}
                    onChange={(e) => setCreateStudentId(e.target.value)}
                    className="min-w-[280px] px-3 py-2 rounded-lg border border-slate-200 bg-white font-semibold text-slate-800"
                  >
                    <option value="">Select a student...</option>
                    {instituteStudents.map((st) => (
                      <option key={st.id} value={st.id}>
                        {st.fullName || st.name} · Roll {st.rollNumber || 'N/A'} ({st.className || 'Class'})
                      </option>
                    ))}
                  </select>
                  <button
                    type="button"
                    disabled={!createStudentId}
                    onClick={() => openStudentMode(createStudentId, 'edit')}
                    className="px-4 py-2 rounded-lg bg-emerald-500 hover:bg-emerald-600 text-white font-bold inline-flex items-center gap-1.5 disabled:opacity-50 cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Configure Fee Setup</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

export default StudentFeeSetupView
