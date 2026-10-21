import React, { useState, useMemo } from 'react'
import { 
  Receipt, 
  Plus, 
  Search, 
  CheckCircle, 
  Clock, 
  Printer, 
  CreditCard, 
  School,
  Zap,
  Banknote,
  DollarSign,
  CheckCircle2,
  Calendar,
  Building,
  Download,
  Layers,
  ChevronLeft,
  ChevronRight,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  GitFork
} from 'lucide-react'
import { useAppData } from '../../../context/AppDataContext'
import { useToast } from '../../../context/ToastContext'
import Modal from '../../../components/common/Modal'
import PrintableFeeChallanModal from '../../../components/common/PrintableFeeChallanModal'

export const FeesView = ({ currentInstitute }) => {
  const { fees = [], students = [], addItem, updateItem, deleteItem, logAuditEvent } = useAppData()
  const { toast } = useToast()
  const instStudents = students.filter(s => !s.instituteId || s.instituteId === currentInstitute?.id)

  const [searchTerm, setSearchTerm] = useState('')
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isBatchModalOpen, setIsBatchModalOpen] = useState(false)
  const [isPosModalOpen, setIsPosModalOpen] = useState(false)
  const [isSplitModalOpen, setIsSplitModalOpen] = useState(false)
  const [selectedVoucher, setSelectedVoucher] = useState(null)
  const [isPrintChallanOpen, setIsPrintChallanOpen] = useState(false)
  const [selectedFeeForChallan, setSelectedFeeForChallan] = useState(null)
  const [posReceipt, setPosReceipt] = useState(null)

  // Split Fee Installment Plan State
  const [splitData, setSplitData] = useState({
    originalFeeId: null,
    studentName: instStudents[0]?.name || '',
    rollNumber: instStudents[0]?.rollNumber || '',
    className: instStudents[0]?.className || '10th Grade',
    totalAmount: 30000,
    feeTitle: 'Tuition Fee Installment Plan',
    numParts: 2,
    parts: [
      { partNo: 1, amount: 15000, dueDate: '2026-11-10' },
      { partNo: 2, amount: 15000, dueDate: '2026-12-10' }
    ]
  })

  // Sorting & Pagination
  const [sortField, setSortField] = useState('studentName')
  const [sortDirection, setSortDirection] = useState('asc')
  const [currentPage, setCurrentPage] = useState(1)
  const pageSize = 8

  // Standard Voucher Form with Scholarship & Concession Engine
  const [formData, setFormData] = useState({
    studentName: instStudents[0]?.name || '',
    rollNumber: instStudents[0]?.rollNumber || '',
    className: '10th Grade',
    grossAmount: 15000,
    concessionType: 'None', // 'None' | 'Kinship / Sibling (25%)' | 'Merit Scholarship (50%)' | 'Need-Based Financial Aid (100%)' | 'Faculty Ward (50%)'
    discountAmount: 0,
    amount: 15000,
    dueDate: '2026-10-30',
    status: 'Pending'
  })

  // Concession calculation handler
  const handleConcessionChange = (concessionType, gross = formData.grossAmount) => {
    let rate = 0
    if (concessionType === 'Kinship / Sibling (25%)') rate = 0.25
    else if (concessionType === 'Merit Scholarship (50%)') rate = 0.50
    else if (concessionType === 'Need-Based Financial Aid (100%)') rate = 1.00
    else if (concessionType === 'Faculty Ward (50%)') rate = 0.50

    const grossNum = Number(gross) || 0
    const discountAmount = Math.round(grossNum * rate)
    const net = Math.max(0, grossNum - discountAmount)

    setFormData(prev => ({
      ...prev,
      grossAmount: grossNum,
      concessionType,
      discountAmount,
      amount: net
    }))
  }

  const handleGrossAmountChange = (val) => {
    const grossNum = Number(val) || 0
    handleConcessionChange(formData.concessionType, grossNum)
  }

  // Batch Fee Generator Form
  const [batchData, setBatchData] = useState({
    targetClass: '10th Grade',
    feeTitle: 'Monthly Tuition Fee',
    amount: 15000,
    dueDate: '2026-11-10'
  })

  // POS Cashier Terminal State
  const [posData, setPosData] = useState({
    selectedFeeId: '',
    studentName: '',
    rollNumber: '',
    className: '',
    amount: 0,
    paymentMethod: 'Cash',
    cashTendered: '',
    discount: 0,
    cashierNotes: ''
  })

  const handleStudentSelect = (studentName) => {
    const std = instStudents.find(s => s.name === studentName)
    setFormData(prev => ({
      ...prev,
      studentName,
      rollNumber: std?.rollNumber || `STD-${Math.floor(100 + Math.random() * 900)}`,
      className: std?.className || '10th Grade'
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!formData.studentName || formData.amount === undefined || formData.amount === null) {
      toast.error('Please enter student name and fee details.')
      return
    }

    await addItem('fees', {
      ...formData,
      amount: Number(formData.amount),
      grossAmount: Number(formData.grossAmount),
      discountAmount: Number(formData.discountAmount),
      concessionType: formData.concessionType,
      instituteId: currentInstitute?.id || 'inst-1',
      paymentDate: formData.status === 'Paid' ? new Date().toISOString().split('T')[0] : null
    })
    if (logAuditEvent) {
      logAuditEvent(`Fee challan issued for ${formData.studentName} (Net: Rs. ${formData.amount})`, 'Cashier', 'Success')
    }
    toast.success(`Fee challan issued for ${formData.studentName}!`)
    setIsModalOpen(false)
  }

  // Handle Batch Fee Generation for an entire class
  const handleGenerateBatchFees = async (e) => {
    e.preventDefault()
    const targetStudents = instStudents.filter(s => 
      batchData.targetClass === 'All Classes' || 
      (s.className || '').toLowerCase().includes(batchData.targetClass.toLowerCase())
    )

    if (targetStudents.length === 0) {
      toast.warning(`No students found enrolled in ${batchData.targetClass}.`)
      return
    }

    let generatedCount = 0
    for (const std of targetStudents) {
      await addItem('fees', {
        studentName: std.name,
        rollNumber: std.rollNumber,
        className: std.className || batchData.targetClass,
        amount: Number(batchData.amount),
        feeTitle: batchData.feeTitle,
        dueDate: batchData.dueDate,
        status: 'Pending',
        instituteId: currentInstitute?.id || 'inst-1'
      })
      generatedCount++
    }

    toast.success(`Generated ${generatedCount} fee challans for ${batchData.targetClass}!`)
    setIsBatchModalOpen(false)
  }

  // Multi-Part Split Fee Installment Plan Engine Handlers
  const openSplitModal = () => {
    const std = instStudents[0]
    const total = 30000
    const half = 15000
    const d1 = new Date()
    d1.setDate(d1.getDate() + 15)
    const d2 = new Date()
    d2.setMonth(d2.getMonth() + 1)
    d2.setDate(10)

    setSplitData({
      originalFeeId: null,
      studentName: std?.name || '',
      rollNumber: std?.rollNumber || '',
      className: std?.className || '10th Grade',
      totalAmount: total,
      feeTitle: 'Tuition Fee Installment Plan',
      numParts: 2,
      parts: [
        { partNo: 1, amount: half, dueDate: d1.toISOString().split('T')[0] },
        { partNo: 2, amount: total - half, dueDate: d2.toISOString().split('T')[0] }
      ]
    })
    setIsSplitModalOpen(true)
  }

  const openSplitForFee = (fee) => {
    const total = Number(fee.amount || 20000)
    const half = Math.round(total / 2)
    const d1 = fee.dueDate || new Date().toISOString().split('T')[0]
    const d2 = new Date()
    d2.setMonth(d2.getMonth() + 1)
    d2.setDate(10)

    setSplitData({
      originalFeeId: fee.id,
      studentName: fee.studentName,
      rollNumber: fee.rollNumber,
      className: fee.className || '10th Grade',
      totalAmount: total,
      feeTitle: fee.feeTitle || 'Monthly Tuition Fee',
      numParts: 2,
      parts: [
        { partNo: 1, amount: half, dueDate: d1 },
        { partNo: 2, amount: total - half, dueDate: d2.toISOString().split('T')[0] }
      ]
    })
    setIsSplitModalOpen(true)
  }

  const handleStudentSelectForSplit = (name) => {
    const std = instStudents.find(s => s.name === name)
    setSplitData(prev => ({
      ...prev,
      studentName: name,
      rollNumber: std?.rollNumber || `STD-${Math.floor(100 + Math.random() * 900)}`,
      className: std?.className || '10th Grade'
    }))
  }

  const handleNumPartsChange = (count) => {
    const n = Number(count)
    const total = Number(splitData.totalAmount) || 0
    const base = Math.floor(total / n)
    const remainder = total - (base * n)

    const newParts = Array.from({ length: n }, (_, i) => {
      const partAmt = i === 0 ? base + remainder : base
      const date = new Date()
      date.setMonth(date.getMonth() + (i + 1))
      date.setDate(10)
      return {
        partNo: i + 1,
        amount: partAmt,
        dueDate: date.toISOString().split('T')[0]
      }
    })

    setSplitData(prev => ({
      ...prev,
      numParts: n,
      parts: newParts
    }))
  }

  const handleTotalAmountChange = (val) => {
    const total = Number(val) || 0
    const n = splitData.numParts
    const base = Math.floor(total / n)
    const remainder = total - (base * n)

    const newParts = splitData.parts.map((p, idx) => ({
      ...p,
      amount: idx === 0 ? base + remainder : base
    }))

    setSplitData(prev => ({
      ...prev,
      totalAmount: total,
      parts: newParts
    }))
  }

  const handlePartAmountChange = (index, val) => {
    const num = Number(val) || 0
    setSplitData(prev => {
      const updated = [...prev.parts]
      updated[index] = { ...updated[index], amount: num }
      return { ...prev, parts: updated }
    })
  }

  const handlePartDueDateChange = (index, val) => {
    setSplitData(prev => {
      const updated = [...prev.parts]
      updated[index] = { ...updated[index], dueDate: val }
      return { ...prev, parts: updated }
    })
  }

  const handleCreateInstallmentPlan = async (e) => {
    e.preventDefault()
    if (!splitData.studentName) {
      toast.error('Please select a student for the installment plan.')
      return
    }
    const sumParts = splitData.parts.reduce((sum, p) => sum + Number(p.amount || 0), 0)
    if (sumParts !== Number(splitData.totalAmount)) {
      toast.warning(`Sum of installments (Rs. ${sumParts.toLocaleString()}) does not match Total Amount (Rs. ${Number(splitData.totalAmount).toLocaleString()}). Please balance the installments.`)
      return
    }

    if (splitData.originalFeeId) {
      await deleteItem('fees', splitData.originalFeeId)
    }

    const planRef = `SPL-${Date.now().toString().slice(-6)}`
    for (const p of splitData.parts) {
      await addItem('fees', {
        studentName: splitData.studentName,
        rollNumber: splitData.rollNumber,
        className: splitData.className,
        amount: Number(p.amount),
        grossAmount: Number(p.amount),
        discountAmount: 0,
        concessionType: 'None',
        dueDate: p.dueDate,
        status: 'Pending',
        feeTitle: `${splitData.feeTitle} (Part ${p.partNo}/${splitData.numParts})`,
        installmentInfo: {
          isInstallment: true,
          partNo: p.partNo,
          totalParts: splitData.numParts,
          planRef: planRef,
          totalPlanAmount: splitData.totalAmount
        },
        instituteId: currentInstitute?.id || 'inst-1',
        paymentDate: null
      })
    }

    if (logAuditEvent) {
      logAuditEvent(`Generated ${splitData.numParts}-part fee installment plan for ${splitData.studentName} (Total Rs. ${splitData.totalAmount})`, 'Fee Bursar', 'Success')
    }
    toast.success(`Generated ${splitData.numParts}-part installment sub-challans for ${splitData.studentName}!`)
    setIsSplitModalOpen(false)
  }

  const markPaid = async (fee) => {
    await updateItem('fees', fee.id, {
      status: 'Paid',
      paymentDate: new Date().toISOString().split('T')[0]
    })
    if (logAuditEvent) {
      logAuditEvent(`Marked fee paid for ${fee.studentName} (Rs. ${fee.amount})`, 'Fee Cashier', 'Success')
    }
    toast.success(`Challan for ${fee.studentName} marked as Paid.`)
  }

  // Open POS Cashier Terminal
  const openPosCashier = (fee = null) => {
    if (fee) {
      setPosData({
        selectedFeeId: fee.id,
        studentName: fee.studentName,
        rollNumber: fee.rollNumber,
        className: fee.className || '10th Grade',
        amount: Number(fee.amount || 0),
        paymentMethod: 'Cash',
        cashTendered: Number(fee.amount || 0),
        discount: 0,
        cashierNotes: 'Counter Cash Collection'
      })
    } else {
      const pendingFees = fees.filter(f => f.status !== 'Paid' && (!f.instituteId || f.instituteId === currentInstitute?.id))
      const first = pendingFees[0]
      setPosData({
        selectedFeeId: first?.id || '',
        studentName: first?.studentName || instStudents[0]?.name || '',
        rollNumber: first?.rollNumber || instStudents[0]?.rollNumber || '',
        className: first?.className || '10th Grade',
        amount: Number(first?.amount || 15000),
        paymentMethod: 'Cash',
        cashTendered: Number(first?.amount || 15000),
        discount: 0,
        cashierNotes: 'Counter Cash Collection'
      })
    }
    setIsPosModalOpen(true)
  }

  // Process POS Cashier Payment
  const handleProcessPosPayment = async (e) => {
    e.preventDefault()
    const payable = Math.max(0, posData.amount - posData.discount)

    if (posData.selectedFeeId) {
      await updateItem('fees', posData.selectedFeeId, {
        status: 'Paid',
        paymentDate: new Date().toISOString().split('T')[0],
        paymentMethod: posData.paymentMethod,
        discountApplied: posData.discount,
        finalPaid: payable
      })
    } else {
      await addItem('fees', {
        studentName: posData.studentName,
        rollNumber: posData.rollNumber,
        className: posData.className,
        amount: payable,
        status: 'Paid',
        dueDate: new Date().toISOString().split('T')[0],
        paymentDate: new Date().toISOString().split('T')[0],
        instituteId: currentInstitute?.id || 'inst-1',
        paymentMethod: posData.paymentMethod
      })
    }

    const receiptObj = {
      receiptNo: `POS-${Date.now().toString().slice(-6)}`,
      studentName: posData.studentName,
      rollNumber: posData.rollNumber,
      className: posData.className,
      amount: posData.amount,
      discount: posData.discount,
      finalPaid: payable,
      cashTendered: posData.cashTendered,
      changeDue: Math.max(0, Number(posData.cashTendered) - payable),
      paymentMethod: posData.paymentMethod,
      date: new Date().toLocaleString(),
      cashier: 'Fee Counter Operator'
    }

    if (logAuditEvent) {
      logAuditEvent(`POS counter fee payment collected for ${posData.studentName} (Rs. ${payable})`, 'POS Cashier', 'Success')
    }
    toast.success(`POS Collection Successful! Rs. ${payable.toLocaleString()} received.`)
    setIsPosModalOpen(false)
    setPosReceipt(receiptObj)
  }

  const handleSort = (field) => {
    if (sortField === field) {
      setSortDirection(prev => (prev === 'asc' ? 'desc' : 'asc'))
    } else {
      setSortField(field)
      setSortDirection('asc')
    }
  }

  // Filter and sort fee vouchers
  const filteredAndSorted = useMemo(() => {
    const list = fees.filter(f =>
      (!f.instituteId || f.instituteId === currentInstitute?.id) &&
      ((f.studentName || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
       (f.rollNumber || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
       (f.className || '').toLowerCase().includes(searchTerm.toLowerCase()))
    )

    return list.sort((a, b) => {
      let valA = a[sortField] || ''
      let valB = b[sortField] || ''

      if (sortField === 'amount') {
        valA = Number(valA || 0)
        valB = Number(valB || 0)
      } else {
        if (typeof valA === 'string') valA = valA.toLowerCase()
        if (typeof valB === 'string') valB = valB.toLowerCase()
      }

      if (valA < valB) return sortDirection === 'asc' ? -1 : 1
      if (valA > valB) return sortDirection === 'asc' ? 1 : -1
      return 0
    })
  }, [fees, currentInstitute?.id, searchTerm, sortField, sortDirection])

  const totalCollected = filteredAndSorted
    .filter(f => f.status === 'Paid')
    .reduce((sum, f) => sum + Number(f.amount || 0), 0)

  const totalPending = filteredAndSorted
    .filter(f => f.status !== 'Paid')
    .reduce((sum, f) => sum + Number(f.amount || 0), 0)

  // Pagination calculation
  const totalVouchers = filteredAndSorted.length
  const totalPages = Math.max(1, Math.ceil(totalVouchers / pageSize))
  const paginatedFees = useMemo(() => {
    const start = (currentPage - 1) * pageSize
    return filteredAndSorted.slice(start, start + pageSize)
  }, [filteredAndSorted, currentPage, pageSize])

  // CSV Export for Fees
  const exportFeesCSV = () => {
    if (filteredAndSorted.length === 0) {
      toast.warning('No fee records to export.')
      return
    }

    const headers = ['Student Name', 'Roll Number', 'Class', 'Amount (PKR)', 'Due Date', 'Status', 'Payment Date']
    const rows = filteredAndSorted.map(f => [
      `"${f.studentName || ''}"`,
      `"${f.rollNumber || ''}"`,
      `"${f.className || ''}"`,
      `"${f.amount || 0}"`,
      `"${f.dueDate || ''}"`,
      `"${f.status || 'Pending'}"`,
      `"${f.paymentDate || '—'}"`
    ])

    const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\n')
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.setAttribute('download', `fee_records_${new Date().toISOString().slice(0, 10)}.csv`)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    toast.success(`Exported ${filteredAndSorted.length} fee vouchers to CSV.`)
  }

  return (
    <div className="p-4 sm:p-6 md:p-8 space-y-6 max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Receipt className="w-5 h-5 text-emerald-600" />
            <h1 className="text-xl font-bold text-slate-900 tracking-tight">Fee Management & POS Cashier Terminal</h1>
          </div>
          <p className="text-xs text-slate-500 mt-1">Batch fee challans, 3-copy bank vouchers, and instant POS counter fee collections</p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <button
            type="button"
            onClick={exportFeesCSV}
            className="flex items-center gap-1.5 px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-semibold border border-slate-200 transition-all cursor-pointer"
            title="Download fee register CSV"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export CSV</span>
          </button>

          <button
            type="button"
            onClick={() => setIsBatchModalOpen(true)}
            className="flex items-center gap-2 px-3.5 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg text-xs font-bold shadow transition-all cursor-pointer"
            title="Generate fee vouchers for an entire class at once"
          >
            <Layers className="w-3.5 h-3.5 text-amber-300" />
            <span>Batch Fee Generator</span>
          </button>

          <button
            type="button"
            onClick={openSplitModal}
            className="flex items-center gap-2 px-3.5 py-2 bg-gradient-to-r from-purple-700 to-indigo-700 hover:from-purple-800 hover:to-indigo-800 text-white rounded-lg text-xs font-bold shadow transition-all cursor-pointer"
            title="Multi-Part Split Fee Installment Plan Engine (2 or 3 parts)"
          >
            <GitFork className="w-3.5 h-3.5 text-amber-300" />
            <span>Split Installments</span>
          </button>

          <button
            type="button"
            onClick={() => openPosCashier()}
            className="flex items-center gap-2 px-3.5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-bold shadow transition-all cursor-pointer"
          >
            <Zap className="w-3.5 h-3.5 text-amber-300" />
            <span>POS Cashier Counter</span>
          </button>

          <button
            type="button"
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-2 px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold shadow transition-all cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>New Challan</span>
          </button>
        </div>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="bg-emerald-50 border border-emerald-100 p-4 rounded-xl flex items-center justify-between">
          <div>
            <span className="text-xs text-emerald-600 font-semibold uppercase tracking-wider">Total Fee Collected</span>
            <p className="text-2xl font-bold text-emerald-900 mt-1">Rs. {totalCollected.toLocaleString()}</p>
          </div>
          <div className="w-10 h-10 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center">
            <CheckCircle className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-amber-50 border border-amber-100 p-4 rounded-xl flex items-center justify-between">
          <div>
            <span className="text-xs text-amber-600 font-semibold uppercase tracking-wider">Pending Invoices</span>
            <p className="text-2xl font-bold text-amber-900 mt-1">Rs. {totalPending.toLocaleString()}</p>
          </div>
          <div className="w-10 h-10 rounded-lg bg-amber-100 text-amber-700 flex items-center justify-center">
            <Clock className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-slate-50/50">
          <div className="relative w-full max-w-md">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search challans by student name, roll number, or grade..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value)
                setCurrentPage(1)
              }}
              className="w-full pl-9 pr-4 py-2 text-xs rounded-lg border border-slate-200 focus:outline-none bg-white"
            />
          </div>
          <span className="text-xs text-slate-500 font-semibold bg-slate-100 px-3 py-1.5 rounded-full whitespace-nowrap">
            Total Vouchers: {totalVouchers}
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm min-w-[700px]">
            <thead className="bg-slate-50 text-slate-600 text-[11px] uppercase tracking-wider font-bold border-b border-slate-200">
              <tr>
                <th onClick={() => handleSort('studentName')} className="px-6 py-3.5 cursor-pointer hover:bg-slate-100 select-none">
                  <div className="flex items-center gap-1.5">
                    <span>Student</span>
                    {sortField === 'studentName' ? (
                      sortDirection === 'asc' ? <ArrowUp className="w-3 h-3 text-emerald-600" /> : <ArrowDown className="w-3 h-3 text-emerald-600" />
                    ) : (
                      <ArrowUpDown className="w-3 h-3 text-slate-400" />
                    )}
                  </div>
                </th>
                <th onClick={() => handleSort('rollNumber')} className="px-6 py-3.5 cursor-pointer hover:bg-slate-100 select-none">
                  <div className="flex items-center gap-1.5">
                    <span>Roll Number</span>
                    {sortField === 'rollNumber' ? (
                      sortDirection === 'asc' ? <ArrowUp className="w-3 h-3 text-emerald-600" /> : <ArrowDown className="w-3 h-3 text-emerald-600" />
                    ) : (
                      <ArrowUpDown className="w-3 h-3 text-slate-400" />
                    )}
                  </div>
                </th>
                <th onClick={() => handleSort('amount')} className="px-6 py-3.5 cursor-pointer hover:bg-slate-100 select-none">
                  <div className="flex items-center gap-1.5">
                    <span>Amount</span>
                    {sortField === 'amount' ? (
                      sortDirection === 'asc' ? <ArrowUp className="w-3 h-3 text-emerald-600" /> : <ArrowDown className="w-3 h-3 text-emerald-600" />
                    ) : (
                      <ArrowUpDown className="w-3 h-3 text-slate-400" />
                    )}
                  </div>
                </th>
                <th className="px-6 py-3.5">Due Date</th>
                <th onClick={() => handleSort('status')} className="px-6 py-3.5 cursor-pointer hover:bg-slate-100 select-none">
                  <div className="flex items-center gap-1.5">
                    <span>Status</span>
                    {sortField === 'status' ? (
                      sortDirection === 'asc' ? <ArrowUp className="w-3 h-3 text-emerald-600" /> : <ArrowDown className="w-3 h-3 text-emerald-600" />
                    ) : (
                      <ArrowUpDown className="w-3 h-3 text-slate-400" />
                    )}
                  </div>
                </th>
                <th className="px-6 py-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {paginatedFees.length > 0 ? (
                paginatedFees.map(f => (
                  <tr key={f.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="px-6 py-3.5 font-semibold text-slate-900">
                      <div>{f.studentName}</div>
                      <div className="text-[11px] text-slate-400 font-normal">{f.className}</div>
                      {f.installmentInfo?.isInstallment && (
                        <div className="mt-1">
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-purple-50 text-purple-700 border border-purple-200 rounded-full text-[10px] font-bold font-mono">
                            <GitFork className="w-2.5 h-2.5 text-purple-600" />
                            <span>Installment Part {f.installmentInfo.partNo} of {f.installmentInfo.totalParts}</span>
                          </span>
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-3.5 font-mono text-xs text-slate-500">{f.rollNumber}</td>
                    <td className="px-6 py-3.5 font-mono font-bold text-slate-900">Rs. {Number(f.amount).toLocaleString()}</td>
                    <td className="px-6 py-3.5 text-slate-500 text-xs">{f.dueDate}</td>
                    <td className="px-6 py-3.5">
                      {f.status === 'Paid' ? (
                        <span className="px-2.5 py-0.5 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-full text-xs font-bold">
                          Paid
                        </span>
                      ) : (
                        <span className="px-2.5 py-0.5 bg-amber-50 text-amber-700 border border-amber-200 rounded-full text-xs font-bold">
                          Pending
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-3.5 text-right space-x-1.5">
                      {f.status !== 'Paid' && (
                        <>
                          <button
                            type="button"
                            onClick={() => openPosCashier(f)}
                            className="px-2.5 py-1 text-xs font-bold bg-indigo-50 text-indigo-700 hover:bg-indigo-100 rounded-md transition-colors cursor-pointer"
                            title="Collect Fee via POS Counter"
                          >
                            ⚡ POS Collect
                          </button>
                          <button
                            type="button"
                            onClick={() => markPaid(f)}
                            className="px-2.5 py-1 text-xs font-bold bg-emerald-50 text-emerald-700 hover:bg-emerald-100 rounded-md transition-colors cursor-pointer"
                          >
                            Mark Paid
                          </button>
                          {!f.installmentInfo?.isInstallment && (
                            <button
                              type="button"
                              onClick={() => openSplitForFee(f)}
                              className="px-2 py-1 text-xs font-bold bg-purple-50 text-purple-700 hover:bg-purple-100 rounded-md transition-colors cursor-pointer inline-flex items-center gap-1"
                              title="Split into sequential installments (2 or 3 parts)"
                            >
                              <GitFork className="w-3 h-3 text-purple-600" />
                              <span>Split</span>
                            </button>
                          )}
                        </>
                      )}
                      <button
                        type="button"
                        onClick={() => setSelectedVoucher(f)}
                        className="px-2.5 py-1 text-xs font-semibold border border-slate-200 text-slate-600 hover:bg-slate-50 rounded-md transition-colors inline-flex items-center gap-1 cursor-pointer"
                      >
                        <Printer className="w-3.5 h-3.5" />
                        <span>Challan</span>
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="6" className="text-center py-12 text-slate-400 text-xs">
                    No fee vouchers found matching criteria.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between p-4 bg-slate-50/50 border-t border-slate-100 text-xs text-slate-500">
            <div>
              Showing Page <span className="font-semibold text-slate-700">{currentPage}</span> of <span className="font-semibold text-slate-700">{totalPages}</span>
            </div>
            <div className="flex items-center gap-1">
              <button
                onClick={() => setCurrentPage(p => Math.max(p - 1, 1))}
                disabled={currentPage === 1}
                className="px-2.5 py-1.5 rounded border border-slate-200 bg-white hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                <button
                  key={page}
                  onClick={() => setCurrentPage(page)}
                  className={`w-7 h-7 rounded font-semibold ${
                    currentPage === page
                      ? 'bg-emerald-600 text-white'
                      : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  {page}
                </button>
              ))}
              <button
                onClick={() => setCurrentPage(p => Math.min(p + 1, totalPages))}
                disabled={currentPage === totalPages}
                className="px-2.5 py-1.5 rounded border border-slate-200 bg-white hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Batch Fee Generator Modal */}
      <Modal
        isOpen={isBatchModalOpen}
        onClose={() => setIsBatchModalOpen(false)}
        title="Batch Fee Challan Generator for Entire Class"
      >
        <form onSubmit={handleGenerateBatchFees} className="space-y-4">
          <div className="p-3 bg-purple-50 rounded-xl border border-purple-200 text-xs text-purple-900 flex items-start gap-2">
            <Zap className="w-4 h-4 text-purple-600 shrink-0 mt-0.5" />
            <span>
              This will automatically generate individual fee vouchers for all active students enrolled in the selected class with 1-click.
            </span>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-600 uppercase mb-1">Target Class *</label>
            <select
              value={batchData.targetClass}
              onChange={(e) => setBatchData({ ...batchData, targetClass: e.target.value })}
              className="w-full px-3.5 py-2 text-sm rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-purple-500/20"
            >
              <option value="10th Grade">10th Grade</option>
              <option value="9th Grade">9th Grade</option>
              <option value="11th Grade (ICS)">11th Grade (ICS)</option>
              <option value="12th Grade (Pre-Med)">12th Grade (Pre-Med)</option>
              <option value="All Classes">All Classes (Entire Campus)</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-600 uppercase mb-1">Fee Challan Title / Term *</label>
            <input
              type="text"
              required
              value={batchData.feeTitle}
              onChange={(e) => setBatchData({ ...batchData, feeTitle: e.target.value })}
              className="w-full px-3.5 py-2 text-sm rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-purple-500/20"
              placeholder="e.g. October 2026 Monthly Tuition"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-600 uppercase mb-1">Fee Amount (PKR) *</label>
              <input
                type="number"
                required
                min="0"
                value={batchData.amount}
                onChange={(e) => setBatchData({ ...batchData, amount: e.target.value })}
                className="w-full px-3.5 py-2 text-sm rounded-lg border border-slate-200 font-mono focus:outline-none focus:ring-2 focus:ring-purple-500/20"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-600 uppercase mb-1">Due Date *</label>
              <input
                type="date"
                required
                value={batchData.dueDate}
                onChange={(e) => setBatchData({ ...batchData, dueDate: e.target.value })}
                className="w-full px-3.5 py-2 text-sm rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-purple-500/20"
              />
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-3 border-t border-slate-100">
            <button type="button" onClick={() => setIsBatchModalOpen(false)} className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg">
              Cancel
            </button>
            <button type="submit" className="px-5 py-2 text-xs font-bold text-white bg-purple-600 hover:bg-purple-700 rounded-lg shadow">
              Generate All Vouchers
            </button>
          </div>
        </form>
      </Modal>

      {/* POS Cashier Terminal Modal */}
      {isPosModalOpen && (
        <Modal
          isOpen={isPosModalOpen}
          onClose={() => setIsPosModalOpen(false)}
          title="⚡ Fast POS Fee Cashier Counter"
          maxWidth="max-w-2xl"
        >
          <form onSubmit={handleProcessPosPayment} className="space-y-4">
            <div className="p-3 bg-indigo-50 border border-indigo-200 rounded-xl flex items-center justify-between">
              <div>
                <span className="text-xs font-bold text-indigo-900 uppercase tracking-wide">POS Counter Collection Mode</span>
                <p className="text-[11px] text-indigo-600">Quick counter collection with automatic change calculation and printable receipt</p>
              </div>
              <Banknote className="w-8 h-8 text-indigo-500 opacity-80" />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-600 uppercase mb-1">Student Name</label>
                <input
                  type="text"
                  readOnly
                  value={posData.studentName}
                  className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 bg-slate-50 font-bold"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-600 uppercase mb-1">Roll Number</label>
                <input
                  type="text"
                  readOnly
                  value={posData.rollNumber}
                  className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 bg-slate-50 font-mono"
                />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-600 uppercase mb-1">Total Fee (Rs.)</label>
                <input
                  type="number"
                  readOnly
                  value={posData.amount}
                  className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 bg-slate-50 font-mono font-bold text-slate-800"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-600 uppercase mb-1">Discount (Rs.)</label>
                <input
                  type="number"
                  min="0"
                  value={posData.discount}
                  onChange={(e) => setPosData({ ...posData, discount: Number(e.target.value) })}
                  className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 font-mono"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-600 uppercase mb-1">Net Payable</label>
                <div className="px-3 py-2 text-sm rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-800 font-bold font-mono">
                  Rs. {Math.max(0, posData.amount - posData.discount).toLocaleString()}
                </div>
              </div>
            </div>

            {/* Quick Concession Buttons */}
            <div className="flex items-center gap-1.5 flex-wrap p-2 bg-slate-50 border border-slate-200 rounded-lg">
              <span className="text-[10px] text-slate-500 font-bold uppercase">Quick Concession:</span>
              <button
                type="button"
                onClick={() => setPosData({ ...posData, discount: Math.round(posData.amount * 0.25), cashierNotes: 'Kinship Concession (25%)' })}
                className="text-[10px] px-2 py-0.5 bg-white border border-slate-200 hover:bg-indigo-50 hover:border-indigo-300 text-slate-700 rounded font-medium transition-colors cursor-pointer"
              >
                Kinship (25%)
              </button>
              <button
                type="button"
                onClick={() => setPosData({ ...posData, discount: Math.round(posData.amount * 0.50), cashierNotes: 'Merit Scholarship (50%)' })}
                className="text-[10px] px-2 py-0.5 bg-white border border-slate-200 hover:bg-indigo-50 hover:border-indigo-300 text-slate-700 rounded font-medium transition-colors cursor-pointer"
              >
                Merit (50%)
              </button>
              <button
                type="button"
                onClick={() => setPosData({ ...posData, discount: posData.amount, cashierNotes: 'Need-Based Full Aid (100%)' })}
                className="text-[10px] px-2 py-0.5 bg-white border border-slate-200 hover:bg-indigo-50 hover:border-indigo-300 text-slate-700 rounded font-medium transition-colors cursor-pointer"
              >
                Need-Based (100%)
              </button>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-600 uppercase mb-1">Payment Method</label>
                <select
                  value={posData.paymentMethod}
                  onChange={(e) => setPosData({ ...posData, paymentMethod: e.target.value })}
                  className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200"
                >
                  <option value="Cash">Cash at Counter</option>
                  <option value="Online / Bank Transfer">Online / Bank Transfer</option>
                  <option value="Debit Card">Debit / POS Card</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-600 uppercase mb-1">Cash Tendered (Rs.)</label>
                <input
                  type="number"
                  required
                  value={posData.cashTendered}
                  onChange={(e) => setPosData({ ...posData, cashTendered: e.target.value })}
                  className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 font-mono font-bold"
                  placeholder="e.g. 15000"
                />
              </div>
            </div>

            {posData.paymentMethod === 'Cash' && posData.cashTendered && (
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex justify-between items-center text-xs">
                <span className="font-semibold text-slate-600">Change Due to Customer:</span>
                <span className="font-mono text-base font-black text-blue-700">
                  Rs. {Math.max(0, Number(posData.cashTendered) - Math.max(0, posData.amount - posData.discount)).toLocaleString()}
                </span>
              </div>
            )}

            <div className="flex justify-end gap-3 pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setIsPosModalOpen(false)}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow cursor-pointer flex items-center gap-1.5"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>Confirm Payment & Print Receipt</span>
              </button>
            </div>
          </form>
        </Modal>
      )}

      {/* POS Thermal Receipt Modal */}
      {posReceipt && (
        <Modal
          isOpen={Boolean(posReceipt)}
          onClose={() => setPosReceipt(null)}
          title="POS Counter Payment Receipt"
        >
          <div className="space-y-4">
            <div className="max-w-xs mx-auto p-4 bg-white border-2 border-slate-300 rounded-xl font-mono text-xs space-y-2 shadow-inner print:border-black">
              <div className="text-center pb-2 border-b">
                <h4 className="font-black text-sm uppercase">{currentInstitute?.name || 'CENTRAL HIGH SCHOOL'}</h4>
                <p className="text-[10px] text-slate-500">Official POS Fee Collection Voucher</p>
                <span className="text-[10px] text-slate-400 block mt-1">Receipt: {posReceipt.receiptNo}</span>
              </div>

              <div className="space-y-1 text-[11px]">
                <div className="flex justify-between">
                  <span className="text-slate-500">Date:</span>
                  <span>{posReceipt.date}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Student:</span>
                  <span className="font-bold">{posReceipt.studentName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Roll No:</span>
                  <span>{posReceipt.rollNumber}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Class:</span>
                  <span>{posReceipt.className}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Mode:</span>
                  <span>{posReceipt.paymentMethod}</span>
                </div>
              </div>

              <div className="pt-2 border-t space-y-1 text-xs">
                <div className="flex justify-between">
                  <span>Gross Fee:</span>
                  <span>Rs. {posReceipt.amount.toLocaleString()}</span>
                </div>
                {posReceipt.discount > 0 && (
                  <div className="flex justify-between text-emerald-600">
                    <span>Discount:</span>
                    <span>- Rs. {posReceipt.discount.toLocaleString()}</span>
                  </div>
                )}
                <div className="flex justify-between font-black text-sm border-t pt-1">
                  <span>Total Paid:</span>
                  <span>Rs. {posReceipt.finalPaid.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-[11px] text-slate-500">
                  <span>Cash Tendered:</span>
                  <span>Rs. {Number(posReceipt.cashTendered).toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-[11px] text-slate-500">
                  <span>Change Return:</span>
                  <span>Rs. {posReceipt.changeDue.toLocaleString()}</span>
                </div>
              </div>

              <div className="text-center pt-3 border-t text-[10px] text-slate-400">
                <p>Payment Received with Thanks</p>
                <p className="mt-1 font-bold text-slate-600">System Generated Verified Slip</p>
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setPosReceipt(null)}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg cursor-pointer"
              >
                Close
              </button>
              <button
                type="button"
                onClick={() => window.print()}
                className="px-5 py-2 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg flex items-center gap-1.5 shadow cursor-pointer"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>Print Counter Slip</span>
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* Standard Issue Voucher Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Generate New Fee Challan"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-600 uppercase mb-1">Select Student *</label>
            <select
              value={formData.studentName}
              onChange={(e) => handleStudentSelect(e.target.value)}
              className="w-full px-3.5 py-2 text-sm rounded-lg border border-slate-200"
            >
              {instStudents.map(s => (
                <option key={s.id} value={s.name}>{s.name} ({s.rollNumber})</option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-600 uppercase mb-1">Roll Number</label>
              <input
                type="text"
                readOnly
                value={formData.rollNumber}
                className="w-full px-3.5 py-2 text-sm rounded-lg border border-slate-200 bg-slate-50 font-mono"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-600 uppercase mb-1">Standard Tuition Fee (Rs.) *</label>
              <input
                type="number"
                required
                min="0"
                value={formData.grossAmount}
                onChange={(e) => handleGrossAmountChange(e.target.value)}
                className="w-full px-3.5 py-2 text-sm rounded-lg border border-slate-200 font-mono"
              />
            </div>
          </div>

          {/* Scholarship & Concession Selector */}
          <div>
            <label className="block text-xs font-semibold text-slate-600 uppercase mb-1">Scholarship / Fee Concession Category</label>
            <select
              value={formData.concessionType}
              onChange={(e) => handleConcessionChange(e.target.value)}
              className="w-full px-3.5 py-2 text-sm rounded-lg border border-slate-200 bg-white font-medium text-slate-700"
            >
              <option value="None">Standard Full Fee (No Concession)</option>
              <option value="Kinship / Sibling (25%)">Kinship / Sibling Concession (25% Off)</option>
              <option value="Merit Scholarship (50%)">Merit Scholarship (Top 5% Student - 50% Off)</option>
              <option value="Need-Based Financial Aid (100%)">Need-Based Financial Aid (Full 100% Free)</option>
              <option value="Faculty Ward (50%)">Faculty / Staff Child Concession (50% Off)</option>
            </select>
          </div>

          {/* Real-time Calculation Breakdown Preview */}
          <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-1.5 text-xs">
            <div className="flex justify-between text-slate-600">
              <span>Gross Tuition Amount:</span>
              <span className="font-mono font-semibold">Rs. {Number(formData.grossAmount).toLocaleString()}</span>
            </div>
            {formData.discountAmount > 0 && (
              <div className="flex justify-between text-emerald-700 font-medium">
                <span>Concession Deduction ({formData.concessionType}):</span>
                <span className="font-mono font-bold">-Rs. {Number(formData.discountAmount).toLocaleString()}</span>
              </div>
            )}
            <div className="flex justify-between text-slate-900 font-bold pt-1 border-t border-slate-200 text-sm">
              <span>Net Payable Challan:</span>
              <span className="font-mono text-emerald-700">Rs. {Number(formData.amount).toLocaleString()}</span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-600 uppercase mb-1">Due Date</label>
              <input
                type="date"
                required
                value={formData.dueDate}
                onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                className="w-full px-3.5 py-2 text-sm rounded-lg border border-slate-200"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-600 uppercase mb-1">Status</label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                className="w-full px-3.5 py-2 text-sm rounded-lg border border-slate-200"
              >
                <option value="Pending">Pending</option>
                <option value="Paid">Paid</option>
              </select>
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-3 border-t border-slate-100">
            <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg cursor-pointer">Cancel</button>
            <button type="submit" className="px-5 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg shadow cursor-pointer">Issue Voucher</button>
          </div>
        </form>
      </Modal>

      {/* Multi-Part Split Fee Installment Plan Engine Modal */}
      {isSplitModalOpen && (
        <Modal
          isOpen={isSplitModalOpen}
          onClose={() => setIsSplitModalOpen(false)}
          title="Multi-Part Split Fee Installment Plan Engine"
          maxWidth="max-w-2xl"
        >
          <form onSubmit={handleCreateInstallmentPlan} className="space-y-4">
            <div className="p-3.5 bg-gradient-to-r from-purple-50 to-indigo-50 border border-purple-200 rounded-xl flex items-center justify-between">
              <div>
                <span className="text-xs font-bold text-purple-950 uppercase tracking-wide">
                  Tuition Split Installment Engine
                </span>
                <p className="text-[11px] text-purple-700 mt-0.5">
                  Split large tuition or session fees into 2 or 3 sequential sub-challans with distinct scheduled due dates.
                </p>
              </div>
              <GitFork className="w-8 h-8 text-purple-600 opacity-80 shrink-0" />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-600 uppercase mb-1">Select Student *</label>
                <select
                  value={splitData.studentName}
                  onChange={(e) => handleStudentSelectForSplit(e.target.value)}
                  className="w-full px-3.5 py-2 text-sm rounded-lg border border-slate-200 bg-white"
                >
                  {instStudents.map(s => (
                    <option key={s.id} value={s.name}>{s.name} ({s.rollNumber})</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 uppercase mb-1">Fee Title / Plan Descriptor</label>
                <input
                  type="text"
                  required
                  value={splitData.feeTitle}
                  onChange={(e) => setSplitData({ ...splitData, feeTitle: e.target.value })}
                  className="w-full px-3.5 py-2 text-sm rounded-lg border border-slate-200"
                  placeholder="e.g. Session Tuition Installment Plan"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-600 uppercase mb-1">Total Fee Amount to Split (PKR) *</label>
                <input
                  type="number"
                  min="1000"
                  required
                  value={splitData.totalAmount}
                  onChange={(e) => handleTotalAmountChange(e.target.value)}
                  className="w-full px-3.5 py-2 text-sm rounded-lg border border-slate-200 font-mono font-bold text-slate-900"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 uppercase mb-1">Number of Installments *</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => handleNumPartsChange(2)}
                    className={`py-2 px-3 text-xs font-bold rounded-lg border transition-all cursor-pointer ${
                      splitData.numParts === 2
                        ? 'bg-purple-600 text-white border-purple-600 shadow-sm'
                        : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    2 Installments (50/50)
                  </button>
                  <button
                    type="button"
                    onClick={() => handleNumPartsChange(3)}
                    className={`py-2 px-3 text-xs font-bold rounded-lg border transition-all cursor-pointer ${
                      splitData.numParts === 3
                        ? 'bg-purple-600 text-white border-purple-600 shadow-sm'
                        : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    3 Installments (33/33/34)
                  </button>
                </div>
              </div>
            </div>

            {/* Configured Sub-Challan Parts */}
            <div className="space-y-3 pt-2">
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wide">
                Configured Installment Sub-Challans ({splitData.numParts} Parts)
              </label>

              <div className="space-y-2.5">
                {splitData.parts.map((part, idx) => (
                  <div key={part.partNo} className="p-3 bg-slate-50 border border-slate-200 rounded-xl grid grid-cols-1 sm:grid-cols-12 gap-3 items-center">
                    <div className="sm:col-span-3 flex items-center gap-2">
                      <span className="w-6 h-6 rounded-full bg-purple-600 text-white flex items-center justify-center font-bold text-xs shrink-0">
                        {part.partNo}
                      </span>
                      <span className="text-xs font-bold text-slate-800">Part {part.partNo} Challan</span>
                    </div>

                    <div className="sm:col-span-4">
                      <label className="block text-[10px] uppercase font-bold text-slate-500 mb-0.5">Amount (PKR)</label>
                      <input
                        type="number"
                        min="1"
                        required
                        value={part.amount}
                        onChange={(e) => handlePartAmountChange(idx, e.target.value)}
                        className="w-full px-2.5 py-1.5 text-xs rounded-lg border border-slate-200 font-mono font-bold bg-white"
                      />
                    </div>

                    <div className="sm:col-span-5">
                      <label className="block text-[10px] uppercase font-bold text-slate-500 mb-0.5">Due Date</label>
                      <input
                        type="date"
                        required
                        value={part.dueDate}
                        onChange={(e) => handlePartDueDateChange(idx, e.target.value)}
                        className="w-full px-2.5 py-1.5 text-xs rounded-lg border border-slate-200 bg-white"
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Sum validation preview */}
            {(() => {
              const sum = splitData.parts.reduce((acc, p) => acc + Number(p.amount || 0), 0)
              const matches = sum === Number(splitData.totalAmount)
              return (
                <div className={`p-3 rounded-xl border text-xs flex items-center justify-between ${
                  matches ? 'bg-emerald-50 border-emerald-200 text-emerald-900' : 'bg-amber-50 border-amber-200 text-amber-900'
                }`}>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className={`w-4 h-4 ${matches ? 'text-emerald-600' : 'text-amber-600'}`} />
                    <span>
                      {matches 
                        ? 'Installment sum exactly matches Total Plan Amount.' 
                        : `Difference of Rs. ${Math.abs(Number(splitData.totalAmount) - sum).toLocaleString()} detected! Please adjust parts to equal total.`}
                    </span>
                  </div>
                  <span className="font-mono font-bold">
                    Sum: Rs. {sum.toLocaleString()} / Total: Rs. {Number(splitData.totalAmount).toLocaleString()}
                  </span>
                </div>
              )
            })()}

            <div className="flex justify-end gap-3 pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setIsSplitModalOpen(false)}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2 text-xs font-bold text-white bg-purple-600 hover:bg-purple-700 rounded-lg shadow cursor-pointer flex items-center gap-1.5"
              >
                <GitFork className="w-3.5 h-3.5" />
                <span>Generate {splitData.numParts} Sub-Challans</span>
              </button>
            </div>
          </form>
        </Modal>
      )}

      {/* Official Printable 3-Copy Bank Challan Voucher Modal */}
      {selectedVoucher && (
        <Modal
          isOpen={Boolean(selectedVoucher)}
          onClose={() => setSelectedVoucher(null)}
          title="Printable 3-Copy Official Bank Fee Challan"
          maxWidth="max-w-4xl"
        >
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 border-2 border-slate-800 p-3 rounded-xl bg-white print:border-black text-[11px]">
              {['Bank Copy', 'Institute Copy', 'Student Copy'].map((copyTitle, idx) => (
                <div key={copyTitle} className={`space-y-2 p-2.5 ${idx !== 0 ? 'border-t md:border-t-0 md:border-l border-dashed border-slate-400' : ''}`}>
                  <div className="text-center pb-2 border-b border-slate-200">
                    <span className="text-[10px] uppercase font-bold text-slate-500 block">Habib Bank Limited (HBL)</span>
                    <span className="text-[9px] font-mono text-slate-400">A/C: 0042-79012345-01</span>
                    <h4 className="text-xs font-black uppercase text-slate-900 mt-1 leading-tight">
                      {currentInstitute?.name || 'CENTRAL HIGH SCHOOL'}
                    </h4>
                    <span className="inline-block mt-1 font-bold text-[9px] uppercase px-2 py-0.5 bg-slate-100 rounded text-slate-800">
                      {copyTitle}
                    </span>
                  </div>

                  <div className="space-y-1">
                    <div className="flex justify-between">
                      <span className="text-slate-500">Challan No:</span>
                      <span className="font-mono font-bold text-slate-900">CH-{selectedVoucher.id.slice(-6)}</span>
                    </div>
                    {selectedVoucher.installmentInfo?.isInstallment && (
                      <div className="px-1.5 py-0.5 rounded bg-purple-50 border border-purple-200 text-purple-800 font-bold text-[9px] flex items-center justify-between">
                        <span>Installment:</span>
                        <span>Part {selectedVoucher.installmentInfo.partNo} of {selectedVoucher.installmentInfo.totalParts}</span>
                      </div>
                    )}
                    <div className="flex justify-between">
                      <span className="text-slate-500">Student:</span>
                      <span className="font-bold text-slate-900">{selectedVoucher.studentName}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Roll No:</span>
                      <span className="font-mono font-bold">{selectedVoucher.rollNumber}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Class:</span>
                      <span>{selectedVoucher.className || '10th Grade'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Due Date:</span>
                      <span className="font-bold text-rose-600 font-mono">{selectedVoucher.dueDate}</span>
                    </div>
                  </div>

                  {/* Amount Breakdown */}
                  <table className="w-full text-[10px] border border-slate-200 mt-2">
                    <tbody>
                      <tr className="border-b">
                        <td className="p-1 text-slate-600">Base Tuition Fee</td>
                        <td className="p-1 text-right font-mono font-semibold">
                          Rs. {Number(selectedVoucher.grossAmount || selectedVoucher.amount).toLocaleString()}
                        </td>
                      </tr>
                      {selectedVoucher.concessionType && selectedVoucher.concessionType !== 'None' && (
                        <tr className="border-b bg-emerald-50/70 text-emerald-800 font-semibold">
                          <td className="p-1">{selectedVoucher.concessionType}</td>
                          <td className="p-1 text-right font-mono text-emerald-700">
                            -Rs. {Number(selectedVoucher.discountAmount || 0).toLocaleString()}
                          </td>
                        </tr>
                      )}
                      <tr className="bg-slate-50 font-bold border-t border-slate-800">
                        <td className="p-1">Payable by Due Date</td>
                        <td className="p-1 text-right font-mono text-xs">Rs. {Number(selectedVoucher.amount).toLocaleString()}</td>
                      </tr>
                      <tr className="text-rose-600 text-[9px]">
                        <td className="p-1">After Due Date (+Fine)</td>
                        <td className="p-1 text-right font-mono font-bold">Rs. {(Number(selectedVoucher.amount) + 500).toLocaleString()}</td>
                      </tr>
                    </tbody>
                  </table>

                  <div className="pt-6 grid grid-cols-2 text-[9px] text-center text-slate-500">
                    <span className="border-t border-slate-300 pt-0.5">Depositor Sig</span>
                    <span className="border-t border-slate-300 pt-0.5">Cashier Stamp</span>
                  </div>
                </div>
              ))}
            </div>

            <div className="flex justify-end gap-3 print:hidden">
              <button
                type="button"
                onClick={() => setSelectedVoucher(null)}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg cursor-pointer"
              >
                Close
              </button>
              <button
                type="button"
                onClick={() => window.print()}
                className="px-5 py-2 text-xs font-bold text-white bg-slate-900 hover:bg-black rounded-lg flex items-center gap-1.5 shadow cursor-pointer"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>Print Official Challan</span>
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  )
}

export default FeesView
