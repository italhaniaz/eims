import React, { useState } from 'react'
import { Receipt, Plus, Search, CheckCircle, Clock, Printer, CreditCard, School } from 'lucide-react'
import { useAppData } from '../../../context/AppDataContext'
import Modal from '../../../components/common/Modal'

export const FeesView = ({ currentInstitute }) => {
  const { fees, students, addItem, updateItem } = useAppData()
  const instStudents = students.filter(s => !s.instituteId || s.instituteId === currentInstitute?.id)

  const [searchTerm, setSearchTerm] = useState('')
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [selectedVoucher, setSelectedVoucher] = useState(null)

  const [formData, setFormData] = useState({
    studentName: instStudents[0]?.name || '',
    rollNumber: instStudents[0]?.rollNumber || '',
    className: '10th Grade',
    amount: 15000,
    dueDate: '2026-10-30',
    status: 'Pending'
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
    if (!formData.studentName || !formData.amount) return

    await addItem('fees', {
      ...formData,
      instituteId: currentInstitute?.id || 'inst-1',
      paymentDate: formData.status === 'Paid' ? new Date().toISOString().split('T')[0] : null
    })
    setIsModalOpen(false)
  }

  const markPaid = async (fee) => {
    await updateItem('fees', fee.id, {
      status: 'Paid',
      paymentDate: new Date().toISOString().split('T')[0]
    })
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
            <h1 className="text-xl font-bold text-slate-900 tracking-tight">Fee Management & Challans</h1>
          </div>
          <p className="text-xs text-slate-500 mt-1">Issue 3-copy bank vouchers, record tuition fees, and track collections</p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-sm font-semibold shadow-sm transition-all"
        >
          <Plus className="w-4 h-4" />
          <span>Generate New Fee Challan</span>
        </button>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="bg-emerald-50 border border-emerald-100 p-4 rounded-xl flex items-center justify-between">
          <div>
            <span className="text-xs text-emerald-600 font-semibold uppercase">Total Fee Collected</span>
            <p className="text-2xl font-bold text-emerald-900 mt-1">Rs. {totalCollected.toLocaleString()}</p>
          </div>
          <div className="w-10 h-10 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center">
            <CheckCircle className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-amber-50 border border-amber-100 p-4 rounded-xl flex items-center justify-between">
          <div>
            <span className="text-xs text-amber-600 font-semibold uppercase">Pending Invoices</span>
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
                    <td className="px-6 py-4 font-bold text-slate-800">{f.studentName}</td>
                    <td className="px-6 py-4 font-mono text-xs text-slate-600">{f.rollNumber}</td>
                    <td className="px-6 py-4 font-bold text-slate-900">Rs. {Number(f.amount).toLocaleString()}</td>
                    <td className="px-6 py-4 text-xs text-slate-500 font-mono">{f.dueDate}</td>
                    <td className="px-6 py-4">
                      <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${
                        f.status === 'Paid' 
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' 
                          : 'bg-amber-50 text-amber-700 border border-amber-200'
                      }`}>
                        {f.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      {f.status !== 'Paid' && (
                        <button
                          onClick={() => markPaid(f)}
                          className="px-3 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded text-xs font-semibold shadow-sm mr-2"
                        >
                          Receive
                        </button>
                      )}
                      <button 
                        onClick={() => setSelectedVoucher(f)}
                        className="p-1.5 text-slate-500 hover:text-emerald-700 hover:bg-emerald-50 rounded inline-flex items-center gap-1 transition-colors"
                        title="Print 3-Copy Bank Challan"
                      >
                        <Printer className="w-4 h-4" />
                        <span className="text-xs font-medium">Challan</span>
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-slate-400">
                    <Receipt className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                    <p className="text-sm font-semibold text-slate-600">0 Fee Challans Found</p>
                    <p className="text-xs text-slate-400 mt-1">Click the "Generate New Fee Challan" button to issue and print official fee vouchers.</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

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
            <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 text-sm text-slate-600">Cancel</button>
            <button type="submit" className="px-5 py-2 text-sm text-white bg-emerald-600 rounded-lg font-semibold">Issue Voucher</button>
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
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg"
              >
                Close
              </button>
              <button
                type="button"
                onClick={() => window.print()}
                className="px-5 py-2 text-xs font-bold text-white bg-slate-900 hover:bg-black rounded-lg flex items-center gap-1.5 shadow"
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
