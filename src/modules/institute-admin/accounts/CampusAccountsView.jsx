import React, { useState, useMemo } from 'react'
import { 
  Calculator, 
  Receipt, 
  DollarSign, 
  Plus, 
  Search, 
  Download, 
  FileSpreadsheet, 
  FileText, 
  CreditCard, 
  TrendingUp, 
  TrendingDown, 
  Calendar, 
  Building2, 
  CheckCircle2, 
  Clock, 
  Tag, 
  Filter, 
  X, 
  Trash2, 
  ArrowUpRight 
} from 'lucide-react'
import { useToast } from '../../../context/ToastContext'

const INITIAL_TRANSACTIONS = [
  { id: 'VCH-801', date: '2026-10-28', description: 'Monthly Tuition Fee Collections (Batch A)', type: 'Income', category: 'Tuition Revenues', debit: 0, credit: 3850000, account: 'Habib Bank Ltd (A/C: 4410)', status: 'Cleared', ref: 'FEE-DEP-OCT-01' },
  { id: 'VCH-802', date: '2026-10-25', description: 'Faculty & Administrative Staff Payroll Disbursement', type: 'Expense', category: 'Staff Payroll', debit: 2150000, credit: 0, account: 'Habib Bank Ltd (A/C: 4410)', status: 'Cleared', ref: 'SAL-OCT-2026' },
  { id: 'VCH-803', date: '2026-10-20', description: 'LESCO Electricity & Campus Utility Bill', type: 'Expense', category: 'Utilities', debit: 245000, credit: 0, account: 'Meezan Bank (A/C: 9912)', status: 'Cleared', ref: 'UTIL-ELEC-778' },
  { id: 'VCH-804', date: '2026-10-18', description: 'Annual Admission Prospectus & Form Sales', type: 'Income', category: 'Admissions Fee', debit: 0, credit: 480000, account: 'Petty Cash Desk', status: 'Cleared', ref: 'ADM-PROS-2026' },
  { id: 'VCH-805', date: '2026-10-15', description: 'Science Lab Chemicals & Glassware Replenishment', type: 'Expense', category: 'Academic Supplies', debit: 115000, credit: 0, account: 'Petty Cash Desk', status: 'Cleared', ref: 'LAB-PUR-104' },
  { id: 'VCH-806', date: '2026-10-12', description: 'Campus Transport Diesel & Fleet Maintenance', type: 'Expense', category: 'Transport Operations', debit: 185000, credit: 0, account: 'Meezan Bank (A/C: 9912)', status: 'Cleared', ref: 'FLEET-OCT-02' },
  { id: 'VCH-807', date: '2026-10-05', description: 'Library Books & Reference Encyclopedias', type: 'Expense', category: 'Library Acquisitions', debit: 65000, credit: 0, account: 'Habib Bank Ltd (A/C: 4410)', status: 'Cleared', ref: 'LIB-BOOK-55' }
]

export const CampusAccountsView = ({ currentInstitute }) => {
  const { toast } = useToast()
  const instituteId = currentInstitute?.id || 'inst-1'
  const storageKey = `sms_campus_accounts_${instituteId}`

  const [transactions, setTransactions] = useState(() => {
    try {
      const saved = localStorage.getItem(storageKey)
      return saved ? JSON.parse(saved) : INITIAL_TRANSACTIONS
    } catch {
      return INITIAL_TRANSACTIONS
    }
  })

  const [activeTab, setActiveTab] = useState('ledger') // 'ledger' | 'statement' | 'chart'
  const [searchQuery, setSearchQuery] = useState('')
  const [filterType, setFilterType] = useState('All')
  const [isModalOpen, setIsModalOpen] = useState(false)

  const [formData, setFormData] = useState({
    description: '',
    type: 'Expense',
    category: 'Utilities',
    amount: '',
    account: 'Habib Bank Ltd (A/C: 4410)',
    date: new Date().toISOString().split('T')[0],
    ref: ''
  })

  const saveTransactions = (newTxns) => {
    setTransactions(newTxns)
    try {
      localStorage.setItem(storageKey, JSON.stringify(newTxns))
    } catch (e) {
      console.error(e)
    }
  }

  const filteredTxns = useMemo(() => {
    return transactions.filter(t => {
      const matchesSearch = 
        t.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        t.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
        t.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
        t.ref.toLowerCase().includes(searchQuery.toLowerCase())

      const matchesType = filterType === 'All' || t.type === filterType
      return matchesSearch && matchesType
    }).sort((a, b) => new Date(b.date) - new Date(a.date))
  }, [transactions, searchQuery, filterType])

  // Computations
  const totalInflow = useMemo(() => transactions.reduce((acc, curr) => acc + (curr.credit || 0), 0), [transactions])
  const totalOutflow = useMemo(() => transactions.reduce((acc, curr) => acc + (curr.debit || 0), 0), [transactions])
  const netSurplus = totalInflow - totalOutflow

  const handleFormSubmit = (e) => {
    e.preventDefault()
    const amt = parseFloat(formData.amount)
    if (!formData.description.trim() || isNaN(amt) || amt <= 0) {
      toast?.error?.('Please enter a valid description and amount.')
      return
    }

    const newTxn = {
      id: `VCH-${Math.floor(800 + Math.random() * 200)}`,
      date: formData.date,
      description: formData.description,
      type: formData.type,
      category: formData.category,
      debit: formData.type === 'Expense' ? amt : 0,
      credit: formData.type === 'Income' ? amt : 0,
      account: formData.account,
      status: 'Cleared',
      ref: formData.ref || `MAN-${Date.now().toString().slice(-4)}`
    }

    saveTransactions([newTxn, ...transactions])
    toast?.success?.(`Voucher ${newTxn.id} recorded in campus general ledger.`)
    setIsModalOpen(false)
  }

  const handleDelete = (id) => {
    if (window.confirm('Delete this ledger voucher entry?')) {
      const updated = transactions.filter(t => t.id !== id)
      saveTransactions(updated)
      toast?.success?.('Voucher entry deleted.')
    }
  }

  const handleExportCSV = () => {
    const header = 'Voucher ID,Date,Description,Type,Category,Debit (Expense),Credit (Income),Account,Status,Reference\n'
    const rows = filteredTxns.map(t => 
      `"${t.id}","${t.date}","${t.description}","${t.type}","${t.category}",${t.debit},${t.credit},"${t.account}","${t.status}","${t.ref}"`
    ).join('\n')
    const blob = new Blob([header + rows], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `Campus_Financial_Ledger_${new Date().toISOString().split('T')[0]}.csv`
    a.click()
    toast?.success?.('General ledger CSV report downloaded.')
  }

  return (
    <div className="p-4 sm:p-6 md:p-8 space-y-6 max-w-7xl mx-auto">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-purple-900 via-indigo-900 to-slate-900 rounded-3xl p-6 sm:p-8 text-white shadow-xl relative overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md text-xs font-semibold text-purple-200 border border-white/10 mb-2">
              <Calculator className="w-3.5 h-3.5 text-purple-300" />
              <span>Campus Financial Management • Double-Entry Ledger</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              Campus Accounts & Financial Ledger
            </h1>
            <p className="text-sm text-purple-100 mt-1 max-w-2xl leading-relaxed">
              Real-time reconciliation for fee deposits, staff payroll disbursements, utility overheads, and petty cash vouchers.
            </p>
          </div>
          <div className="flex items-center gap-2.5 flex-wrap">
            <button
              onClick={handleExportCSV}
              className="px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-semibold text-xs flex items-center gap-1.5 border border-white/20 transition-all cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export Ledger</span>
            </button>
            <button
              onClick={() => {
                setFormData({
                  description: '',
                  type: 'Expense',
                  category: 'Utilities',
                  amount: '',
                  account: 'Habib Bank Ltd (A/C: 4410)',
                  date: new Date().toISOString().split('T')[0],
                  ref: ''
                })
                setIsModalOpen(true)
              }}
              className="px-4 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs flex items-center gap-1.5 shadow-lg shadow-purple-600/30 transition-all cursor-pointer active:scale-95"
            >
              <Plus className="w-4 h-4" />
              <span>Record Voucher Entry</span>
            </button>
          </div>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-2xs flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Total Inflows (Credit)</p>
            <h3 className="text-2xl font-black text-slate-900 mt-1">PKR {(totalInflow / 1000000).toFixed(2)}M</h3>
            <span className="text-[11px] text-emerald-600 font-medium">Tuition & fee deposits</span>
          </div>
          <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <TrendingUp className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-2xs flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Total Outflows (Debit)</p>
            <h3 className="text-2xl font-black text-slate-900 mt-1">PKR {(totalOutflow / 1000000).toFixed(2)}M</h3>
            <span className="text-[11px] text-rose-600 font-medium">Payroll, bills, maintenance</span>
          </div>
          <div className="w-12 h-12 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center">
            <TrendingDown className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-2xs flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Net Operating Surplus</p>
            <h3 className="text-2xl font-black text-purple-700 mt-1">PKR {(netSurplus / 1000000).toFixed(2)}M</h3>
            <span className="text-[11px] text-purple-600 font-medium">Net campus liquid reserves</span>
          </div>
          <div className="w-12 h-12 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
            <DollarSign className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-2xs flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Audit Integrity</p>
            <h3 className="text-2xl font-black text-slate-900 mt-1">100%</h3>
            <span className="text-[11px] text-emerald-600 font-medium">Reconciled bank vouchers</span>
          </div>
          <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
            <CheckCircle2 className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white border border-slate-200/80 rounded-2xl p-1.5 flex items-center gap-1 shadow-2xs">
        <button
          onClick={() => setActiveTab('ledger')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            activeTab === 'ledger' ? 'bg-purple-600 text-white shadow-2xs' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <Receipt className="w-4 h-4" />
          <span>General Ledger & Cash Book</span>
        </button>
        <button
          onClick={() => setActiveTab('statement')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            activeTab === 'statement' ? 'bg-purple-600 text-white shadow-2xs' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <TrendingUp className="w-4 h-4" />
          <span>Income & Expense Statement</span>
        </button>
      </div>

      {/* Tab: General Ledger */}
      {activeTab === 'ledger' && (
        <div className="space-y-4">
          <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-2xs flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
            <div className="relative flex-1 max-w-md">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search voucher, reference code, or category..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 transition-all"
              />
            </div>

            <div className="flex items-center gap-2">
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-purple-500/20"
              >
                <option value="All">All Transactions</option>
                <option value="Income">Credit (Incomes Only)</option>
                <option value="Expense">Debit (Expenses Only)</option>
              </select>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-2xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-600 border-b border-slate-200/80 font-bold uppercase tracking-wider text-[11px]">
                  <tr>
                    <th className="py-3.5 px-4">Voucher & Date</th>
                    <th className="py-3.5 px-4">Description</th>
                    <th className="py-3.5 px-4">Category</th>
                    <th className="py-3.5 px-4">Account / Bank</th>
                    <th className="py-3.5 px-4 text-right">Debit (Expense)</th>
                    <th className="py-3.5 px-4 text-right">Credit (Income)</th>
                    <th className="py-3.5 px-4">Status</th>
                    <th className="py-3.5 px-4 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700">
                  {filteredTxns.length === 0 ? (
                    <tr>
                      <td colSpan="8" className="text-center py-10 text-slate-400">
                        No transactions found matching your criteria.
                      </td>
                    </tr>
                  ) : (
                    filteredTxns.map((t) => (
                      <tr key={t.id} className="hover:bg-slate-50/80 transition-colors">
                        <td className="py-3 px-4 font-mono font-semibold text-slate-900">
                          <div className="text-purple-700">{t.id}</div>
                          <div className="text-[10px] text-slate-400">{t.date}</div>
                        </td>
                        <td className="py-3 px-4 font-medium text-slate-900">
                          <div>{t.description}</div>
                          <div className="text-[10px] text-slate-400 font-mono">Ref: {t.ref}</div>
                        </td>
                        <td className="py-3 px-4">
                          <span className="px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 font-medium text-[10px] border border-slate-200">
                            {t.category}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-slate-600">{t.account}</td>
                        <td className="py-3 px-4 text-right font-mono font-bold text-rose-600">
                          {t.debit > 0 ? `PKR ${t.debit.toLocaleString()}` : '-'}
                        </td>
                        <td className="py-3 px-4 text-right font-mono font-bold text-emerald-600">
                          {t.credit > 0 ? `PKR ${t.credit.toLocaleString()}` : '-'}
                        </td>
                        <td className="py-3 px-4">
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                            {t.status}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-right">
                          <button
                            onClick={() => handleDelete(t.id)}
                            className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                            title="Delete Voucher"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Tab: Statement */}
      {activeTab === 'statement' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-2xs space-y-4">
            <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
              <span>Operating Income (Revenues)</span>
            </h3>

            <div className="space-y-3">
              {[
                { title: 'Student Tuition Fees', amount: 'PKR 3,850,000', share: '88.9%' },
                { title: 'Admissions & Registration Fees', amount: 'PKR 480,000', share: '11.1%' }
              ].map((row, idx) => (
                <div key={idx} className="p-3 bg-slate-50 rounded-xl border border-slate-100 flex items-center justify-between text-xs">
                  <div>
                    <span className="font-bold text-slate-800">{row.title}</span>
                    <div className="text-[10px] text-slate-400">Share of revenue: {row.share}</div>
                  </div>
                  <span className="font-bold text-emerald-600 font-mono">{row.amount}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-2xs space-y-4">
            <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-rose-500"></span>
              <span>Operating Expenditures</span>
            </h3>

            <div className="space-y-3">
              {[
                { title: 'Teaching & Staff Payroll', amount: 'PKR 2,150,000', share: '77.9%' },
                { title: 'Campus Electricity & Utilities', amount: 'PKR 245,000', share: '8.9%' },
                { title: 'Transport Fuel & Maintenance', amount: 'PKR 185,000', share: '6.7%' },
                { title: 'Lab Supplies & Consumables', amount: 'PKR 115,000', share: '4.2%' },
                { title: 'Library Book Purchases', amount: 'PKR 65,000', share: '2.3%' }
              ].map((row, idx) => (
                <div key={idx} className="p-3 bg-slate-50 rounded-xl border border-slate-100 flex items-center justify-between text-xs">
                  <div>
                    <span className="font-bold text-slate-800">{row.title}</span>
                    <div className="text-[10px] text-slate-400">Share of expenditure: {row.share}</div>
                  </div>
                  <span className="font-bold text-rose-600 font-mono">{row.amount}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Modal: Record Voucher */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-100 max-w-lg w-full p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-purple-100 text-purple-700 flex items-center justify-center">
                  <Calculator className="w-4 h-4" />
                </div>
                <h3 className="font-bold text-slate-900 text-base">Record Financial Voucher</h3>
              </div>
              <button 
                onClick={() => setIsModalOpen(false)}
                className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleFormSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Transaction Description *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Science Lab Consumable Materials"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Voucher Type</label>
                  <select
                    value={formData.type}
                    onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-purple-500/20 focus:outline-none"
                  >
                    <option value="Expense">Expense (Debit Outflow)</option>
                    <option value="Income">Income (Credit Inflow)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Account Category</label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-purple-500/20 focus:outline-none"
                  >
                    <option value="Staff Payroll">Staff Payroll</option>
                    <option value="Utilities">Utilities & Overheads</option>
                    <option value="Academic Supplies">Academic Supplies</option>
                    <option value="Transport Operations">Transport Operations</option>
                    <option value="Tuition Revenues">Tuition Revenues</option>
                    <option value="Admissions Fee">Admissions Fee</option>
                    <option value="Library Acquisitions">Library Acquisitions</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Amount (PKR) *</label>
                  <input
                    type="number"
                    min="1"
                    required
                    placeholder="e.g. 45000"
                    value={formData.amount}
                    onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Date</label>
                  <input
                    type="date"
                    value={formData.date}
                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-purple-500/20 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Disbursement Account</label>
                  <select
                    value={formData.account}
                    onChange={(e) => setFormData({ ...formData, account: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-purple-500/20 focus:outline-none"
                  >
                    <option value="Habib Bank Ltd (A/C: 4410)">Habib Bank Ltd (A/C: 4410)</option>
                    <option value="Meezan Bank (A/C: 9912)">Meezan Bank (A/C: 9912)</option>
                    <option value="Petty Cash Desk">Petty Cash Desk</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Invoice / Receipt Ref</label>
                  <input
                    type="text"
                    placeholder="e.g. INV-9912"
                    value={formData.ref}
                    onChange={(e) => setFormData({ ...formData, ref: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-purple-500/20 focus:outline-none"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl text-xs font-bold bg-purple-600 hover:bg-purple-700 text-white shadow-sm"
                >
                  Post Voucher Entry
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

export default CampusAccountsView
