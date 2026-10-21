import React, { useState } from 'react'
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
  Building
} from 'lucide-react'
import { useAppData } from '../../../context/AppDataContext'
import { useToast } from '../../../context/ToastContext'
import Modal from '../../../components/common/Modal'

export const FeesView = ({ currentInstitute }) => {
  const { fees, students, addItem, updateItem } = useAppData()
  const { toast } = useToast()
  const instStudents = students.filter(s => !s.instituteId || s.instituteId === currentInstitute?.id)

  const [searchTerm, setSearchTerm] = useState('')
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isPosModalOpen, setIsPosModalOpen] = useState(false)
  const [selectedVoucher, setSelectedVoucher] = useState(null)
  const [posReceipt, setPosReceipt] = useState(null)

  // Standard Voucher Form
  const [formData, setFormData] = useState({
    studentName: instStudents[0]?.name || '',
    rollNumber: instStudents[0]?.rollNumber || '',
    className: '10th Grade',
    amount: 15000,
    dueDate: '2026-10-30',
    status: 'Pending'
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
    if (!formData.studentName || !formData.amount) {
      toast.error('Please enter student name and fee amount.')
      return
    }

    await addItem('fees', {
      ...formData,
      instituteId: currentInstitute?.id || 'inst-1',
      paymentDate: formData.status === 'Paid' ? new Date().toISOString().split('T')[0] : null
    })
    toast.success(`Fee challan issued for ${formData.studentName}!`)
    setIsModalOpen(false)
  }

  const markPaid = async (fee) => {
    await updateItem('fees', fee.id, {
      status: 'Paid',
      paymentDate: new Date().toISOString().split('T')[0]
    })
    toast.success(`Payment verified and marked as Paid for ${fee.studentName}`)
  }

  // Open POS modal with a pre-selected fee voucher or fresh
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

    toast.success(`POS Collection Successful! Rs. ${payable.toLocaleString()} received.`)
    setIsPosModalOpen(false)
    setPosReceipt(receiptObj)
  }

  const filtered = fees.filter(f =>
    (!f.instituteId || f.instituteId === currentInstitute?.id) &&
    (f.studentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
     f.rollNumber.toLowerCase().includes(searchTerm.toLowerCase()))
  )

  const totalCollected = filtered
    .filter(f => f.status === 'Paid')
    .reduce((sum, f) => sum + Number(f.amount || 0), 0)

  const totalPending = filtered
    .filter(f => f.status !== 'Paid')
    .reduce((sum, f) => sum + Number(f.amount || 0), 0)

  return (
    <div className="p-4 sm:p-6 md:p-8 space-y-6 max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Receipt className="w-5 h-5 text-emerald-600" />
            <h1 className="text-xl font-bold text-slate-900 tracking-tight">Fee Management & POS Cashier Terminal</h1>
          </div>
          <p className="text-xs text-slate-500 mt-1">Issue official 3-copy bank vouchers, fast POS counter fee collections, and print receipts</p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={() => openPosCashier()}
            className="flex items-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-sm font-semibold shadow-sm transition-all cursor-pointer"
          >
            <Zap className="w-4 h-4 text-amber-300" />
            <span>Fast POS Cashier Counter</span>
          </button>

          <button
            type="button"
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-sm font-semibold shadow-sm transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Generate New Fee Challan</span>
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
      <div className="bg-white rounded-xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex items-center justify-between">
          <div className="relative w-full max-w-md">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search challans by student or roll no..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-sm rounded-lg border border-slate-200 focus:outline-none"
            />
          </div>
          <span className="text-xs text-slate-400 font-medium whitespace-nowrap">Total: {filtered.length} vouchers</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm min-w-[650px]">
            <thead className="bg-slate-50 text-slate-500 text-xs uppercase font-semibold border-b">
              <tr>
                <th className="px-6 py-4">Student</th>
                <th className="px-6 py-4">Roll Number</th>
                <th className="px-6 py-4">Amount</th>
                <th className="px-6 py-4">Due Date</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.length > 0 ? (
                filtered.map(f => (
                  <tr key={f.id} className="hover:bg-slate-50/70">
                    <td className="px-6 py-4 font-semibold text-slate-900">{f.studentName}</td>
                    <td className="px-6 py-4 font-mono text-xs text-slate-500">{f.rollNumber}</td>
                    <td className="px-6 py-4 font-mono font-bold text-slate-900">Rs. {Number(f.amount).toLocaleString()}</td>
                    <td className="px-6 py-4 text-slate-500 text-xs">{f.dueDate}</td>
                    <td className="px-6 py-4">
                      {f.status === 'Paid' ? (
                        <span className="px-2.5 py-1 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-full text-xs font-semibold">
                          Paid
                        </span>
                      ) : (
                        <span className="px-2.5 py-1 bg-amber-50 text-amber-700 border border-amber-200 rounded-full text-xs font-semibold">
                          Pending
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-right space-x-2">
                      {f.status !== 'Paid' && (
                        <>
                          <button
                            type="button"
                            onClick={() => openPosCashier(f)}
                            className="px-2.5 py-1.5 text-xs font-semibold bg-indigo-50 text-indigo-700 hover:bg-indigo-100 rounded-md transition-colors cursor-pointer"
                            title="Collect Fee via POS Counter"
                          >
                            ⚡ POS Collect
                          </button>
                          <button
                            type="button"
                            onClick={() => markPaid(f)}
                            className="px-2.5 py-1.5 text-xs font-semibold bg-emerald-50 text-emerald-700 hover:bg-emerald-100 rounded-md transition-colors cursor-pointer"
                          >
                            Mark Paid
                          </button>
                        </>
                      )}
                      <button
                        type="button"
                        onClick={() => setSelectedVoucher(f)}
                        className="px-2.5 py-1.5 text-xs font-semibold border border-slate-200 text-slate-600 hover:bg-slate-50 rounded-md transition-colors inline-flex items-center gap-1 cursor-pointer"
                      >
                        <Printer className="w-3.5 h-3.5" />
                        <span>Challan</span>
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="6" className="text-center py-8 text-slate-400 text-xs">
                    No fee vouchers found matching criteria.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Fast POS Cashier Counter Modal */}
      {isPosModalOpen && (
        <Modal
          isOpen={isPosModalOpen}
          onClose={() => setIsPosModalOpen(false)}
          title="Point of Sale (POS) - Quick Fee Collection Counter"
          maxWidth="max-w-xl"
        >
          <form onSubmit={handleProcessPosPayment} className="space-y-4">
            <div className="p-3 bg-indigo-50/70 border border-indigo-100 rounded-xl flex items-center justify-between text-xs text-indigo-900">
              <div className="flex items-center gap-2">
                <Zap className="w-4 h-4 text-amber-500 shrink-0" />
                <span className="font-semibold">Cashier POS Terminal Active</span>
              </div>
              <span className="font-mono text-[11px] text-indigo-600">{currentInstitute?.name || 'Main Campus'}</span>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-600 uppercase mb-1">Select Voucher or Student</label>
              <select
                value={posData.selectedFeeId}
                onChange={(e) => {
                  const selectedId = e.target.value
                  const chosenFee = fees.find(f => f.id === selectedId)
                  if (chosenFee) {
                    setPosData(prev => ({
                      ...prev,
                      selectedFeeId: selectedId,
                      studentName: chosenFee.studentName,
                      rollNumber: chosenFee.rollNumber,
                      className: chosenFee.className || '10th Grade',
                      amount: Number(chosenFee.amount || 0),
                      cashTendered: Number(chosenFee.amount || 0)
                    }))
                  }
                }}
                className="w-full px-3.5 py-2.5 rounded-lg border border-slate-200 text-sm bg-white"
              >
                <option value="">-- Choose Existing Pending Challan --</option>
                {fees.filter(f => f.status !== 'Paid').map(f => (
                  <option key={f.id} value={f.id}>
                    {f.studentName} ({f.rollNumber}) - Rs. {Number(f.amount).toLocaleString()}
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-600 uppercase mb-1">Student Name</label>
                <input
                  type="text"
                  required
                  value={posData.studentName}
                  onChange={(e) => setPosData({ ...posData, studentName: e.target.value })}
                  className="w-full px-3.5 py-2 rounded-lg border border-slate-200 text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-600 uppercase mb-1">Roll Number</label>
                <input
                  type="text"
                  required
                  value={posData.rollNumber}
                  onChange={(e) => setPosData({ ...posData, rollNumber: e.target.value })}
                  className="w-full px-3.5 py-2 rounded-lg border border-slate-200 text-sm font-mono"
                />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-600 uppercase mb-1">Fee Amount (PKR)</label>
                <input
                  type="number"
                  required
                  value={posData.amount}
                  onChange={(e) => setPosData({ ...posData, amount: Number(e.target.value) })}
                  className="w-full px-3.5 py-2 rounded-lg border border-slate-200 text-sm font-bold"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-600 uppercase mb-1">Discount (PKR)</label>
                <input
                  type="number"
                  value={posData.discount}
                  onChange={(e) => setPosData({ ...posData, discount: Number(e.target.value) })}
                  className="w-full px-3.5 py-2 rounded-lg border border-slate-200 text-sm text-emerald-600 font-bold"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-600 uppercase mb-1">Net Payable</label>
                <div className="w-full px-3.5 py-2 rounded-lg bg-slate-100 border border-slate-200 text-sm font-black text-slate-900 font-mono">
                  Rs. {Math.max(0, posData.amount - posData.discount).toLocaleString()}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-600 uppercase mb-1">Payment Method</label>
                <select
                  value={posData.paymentMethod}
                  onChange={(e) => setPosData({ ...posData, paymentMethod: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-lg border border-slate-200 text-sm bg-white"
                >
                  <option value="Cash">💵 Cash Counter</option>
                  <option value="POS Card">💳 Credit/Debit Card (POS)</option>
                  <option value="JazzCash / EasyPaisa">📱 Mobile Wallet (JazzCash / EasyPaisa)</option>
                  <option value="Bank Transfer">🏦 Direct Bank Transfer</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 uppercase mb-1">Cash Tendered (PKR)</label>
                <input
                  type="number"
                  value={posData.cashTendered}
                  onChange={(e) => setPosData({ ...posData, cashTendered: Number(e.target.value) })}
                  className="w-full px-3.5 py-2 rounded-lg border border-slate-200 text-sm font-bold"
                />
                {Number(posData.cashTendered) > Math.max(0, posData.amount - posData.discount) && (
                  <span className="text-[11px] text-emerald-600 font-semibold mt-1 block">
                    Change to return: Rs. {(Number(posData.cashTendered) - Math.max(0, posData.amount - posData.discount)).toLocaleString()}
                  </span>
                )}
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-3 border-t">
              <button
                type="button"
                onClick={() => setIsPosModalOpen(false)}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2.5 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-md flex items-center gap-1.5 cursor-pointer"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>Collect & Print Receipt</span>
              </button>
            </div>
          </form>
        </Modal>
      )}

      {/* POS Thermal-Style Receipt Modal */}
      {posReceipt && (
        <Modal
          isOpen={Boolean(posReceipt)}
          onClose={() => setPosReceipt(null)}
          title="Cashier POS Fee Receipt"
          maxWidth="max-w-md"
        >
          <div className="space-y-4">
            <div className="p-5 border-2 border-dashed border-slate-800 rounded-xl bg-white text-slate-900 font-mono text-xs space-y-3">
              <div className="text-center border-b pb-3">
                <h3 className="font-bold text-base uppercase tracking-tight">{currentInstitute?.name || 'CENTRAL HIGH SCHOOL'}</h3>
                <p className="text-[10px] text-slate-500 uppercase">Fee Counter POS Terminal</p>
                <p className="text-[11px] font-bold text-emerald-600 mt-1">*** PAYMENT RECEIVED ***</p>
              </div>

              <div className="space-y-1 text-[11px]">
                <div className="flex justify-between">
                  <span>Receipt No:</span>
                  <span className="font-bold">{posReceipt.receiptNo}</span>
                </div>
                <div className="flex justify-between">
                  <span>Date/Time:</span>
                  <span>{posReceipt.date}</span>
                </div>
                <div className="flex justify-between">
                  <span>Student Name:</span>
                  <span className="font-bold">{posReceipt.studentName}</span>
                </div>
                <div className="flex justify-between">
                  <span>Roll No:</span>
                  <span>{posReceipt.rollNumber}</span>
                </div>
                <div className="flex justify-between">
                  <span>Payment Mode:</span>
                  <span className="font-bold">{posReceipt.paymentMethod}</span>
                </div>
              </div>

              <div className="border-t border-b py-2 space-y-1">
                <div className="flex justify-between">
                  <span>Tuition / Exam Fee:</span>
                  <span>Rs. {Number(posReceipt.amount).toLocaleString()}</span>
                </div>
                {Number(posReceipt.discount) > 0 && (
                  <div className="flex justify-between text-emerald-600">
                    <span>Discount / Concession:</span>
                    <span>- Rs. {Number(posReceipt.discount).toLocaleString()}</span>
                  </div>
                )}
                <div className="flex justify-between font-bold text-sm pt-1 border-t">
                  <span>Total Paid:</span>
                  <span>Rs. {Number(posReceipt.finalPaid).toLocaleString()}</span>
                </div>
                {posReceipt.paymentMethod === 'Cash' && (
                  <>
                    <div className="flex justify-between text-[10px] text-slate-500">
                      <span>Cash Tendered:</span>
                      <span>Rs. {Number(posReceipt.cashTendered).toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between text-[10px] text-slate-500">
                      <span>Change Given:</span>
                      <span>Rs. {Number(posReceipt.changeDue).toLocaleString()}</span>
                    </div>
                  </>
                )}
              </div>

              <div className="text-center pt-2 text-[10px] text-slate-500 space-y-1">
                <p>Status: VERIFIED & CLEARED</p>
                <p>Thank you! Keep this receipt for your records.</p>
                <p className="font-bold pt-2 border-t">Cashier: {posReceipt.cashier}</p>
              </div>
            </div>

            <div className="flex justify-end gap-2 print:hidden">
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
                className="px-5 py-2 text-xs font-bold text-white bg-slate-900 hover:bg-black rounded-lg flex items-center gap-1.5 shadow cursor-pointer"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>Print POS Receipt</span>
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* Generate Challan Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Generate Fee Challan Voucher"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-600 uppercase mb-1">Student</label>
            {instStudents && instStudents.length > 0 ? (
              <select
                value={formData.studentName}
                onChange={(e) => handleStudentSelect(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-lg border border-slate-200 text-sm bg-white"
              >
                <option value="">Select Enrolled Student...</option>
                {instStudents.map(s => (
                  <option key={s.id} value={s.name}>{s.name} ({s.rollNumber})</option>
                ))}
              </select>
            ) : (
              <input
                type="text"
                required
                value={formData.studentName}
                onChange={(e) => setFormData({ ...formData, studentName: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-lg border border-slate-200 text-sm"
                placeholder="e.g. Bilal Ahmed"
              />
            )}
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-600 uppercase mb-1">Roll Number</label>
              <input
                type="text"
                required
                value={formData.rollNumber}
                onChange={(e) => setFormData({ ...formData, rollNumber: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-lg border border-slate-200 text-sm font-mono"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-600 uppercase mb-1">Total Fee Amount (PKR)</label>
              <input
                type="number"
                required
                value={formData.amount}
                onChange={(e) => setFormData({ ...formData, amount: Number(e.target.value) })}
                className="w-full px-3.5 py-2.5 rounded-lg border border-slate-200 text-sm"
              />
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
                className="w-full px-3.5 py-2.5 rounded-lg border border-slate-200 text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-600 uppercase mb-1">Payment Status</label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-lg border border-slate-200 text-sm bg-white"
              >
                <option value="Pending">Pending</option>
                <option value="Paid">Paid</option>
              </select>
            </div>
          </div>
          <div className="flex justify-end gap-3 pt-3 border-t">
            <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 text-sm text-slate-600 cursor-pointer">Cancel</button>
            <button type="submit" className="px-5 py-2 text-sm text-white bg-emerald-600 rounded-lg font-semibold cursor-pointer">Issue Voucher</button>
          </div>
        </form>
      </Modal>

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
                        <td className="p-1 text-slate-600">Tuition Fee</td>
                        <td className="p-1 text-right font-mono font-semibold">Rs. {Number(selectedVoucher.amount) - 2000}</td>
                      </tr>
                      <tr className="border-b">
                        <td className="p-1 text-slate-600">Lab / Exam Fund</td>
                        <td className="p-1 text-right font-mono font-semibold">Rs. 2,000</td>
                      </tr>
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
