import React, { useState, useMemo } from 'react'
import {
  ArrowLeftRight,
  Search,
  Download,
  Printer,
  CheckCircle2,
  Clock,
  Receipt,
  X
} from 'lucide-react'
import { useAppData } from '../../../context/AppDataContext'
import { useToast } from '../../../context/ToastContext'

export const MyTransactionsView = ({ currentInstitute }) => {
  const { fees = [] } = useAppData()
  const { toast } = useToast()
  const instId = currentInstitute?.id

  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState('All')
  const [selectedTx, setSelectedTx] = useState(null)

  const campusTransactions = useMemo(() => {
    const instFees = fees.filter(f => !instId || !f.instituteId || f.instituteId === instId)
    return instFees.map(f => ({
      id: f.receiptNo || f.invoiceNo || f.id,
      date: f.paidAt || f.dueDate || f.createdAt || new Date().toISOString().split('T')[0],
      party: f.studentName || 'Student Fee Account',
      description: `${f.month || f.feeType || 'Tuition Fee'}${f.className ? ` • ${f.className}` : ''}`,
      method: f.paymentMethod || 'Bank / Cash',
      amount: Number(f.paidAmount ?? f.amount ?? 0),
      status: f.status === 'Paid' ? 'Completed' : (f.status || 'Pending')
    }))
  }, [fees, instId])

  const filtered = useMemo(() => {
    const q = searchQuery.trim().toLowerCase()
    return campusTransactions.filter(tx => {
      if (statusFilter !== 'All' && tx.status !== statusFilter) return false
      if (!q) return true
      return (
        String(tx.id).toLowerCase().includes(q) ||
        tx.party.toLowerCase().includes(q) ||
        tx.description.toLowerCase().includes(q)
      )
    })
  }, [campusTransactions, statusFilter, searchQuery])

  const totals = useMemo(() => {
    const collected = filtered
      .filter(t => t.status === 'Completed')
      .reduce((sum, t) => sum + Number(t.amount || 0), 0)
    const pending = filtered
      .filter(t => t.status !== 'Completed')
      .reduce((sum, t) => sum + Number(t.amount || 0), 0)
    return { count: filtered.length, collected, pending }
  }, [filtered])

  const handleExportCsv = () => {
    if (filtered.length === 0) {
      toast.error('No transactions available to export.')
      return
    }
    const headers = ['Reference', 'Date', 'Student / Party', 'Description', 'Method', 'Amount', 'Status']
    const rows = filtered.map(t => [
      t.id,
      t.date,
      `"${String(t.party).replace(/"/g, '""')}"`,
      `"${String(t.description).replace(/"/g, '""')}"`,
      t.method,
      t.amount,
      t.status
    ].join(','))
    const csv = [headers.join(','), ...rows].join('\n')
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `school-transactions-${new Date().toISOString().split('T')[0]}.csv`
    link.click()
    URL.revokeObjectURL(url)
    toast.success('Transactions exported to CSV.')
  }

  return (
    <div className="p-4 sm:p-6 md:p-8 max-w-7xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-[var(--text)] font-heading flex items-center gap-2.5">
            <ArrowLeftRight className="w-6 h-6 text-emerald-600" />
            <span>My Transactions &amp; Payment History</span>
          </h1>
          <p className="text-xs sm:text-sm text-[var(--text-muted)] mt-1">
            Audit fee collections, invoices, and payment receipts for {currentInstitute?.name || 'your school'}.
          </p>
        </div>
        <button
          type="button"
          onClick={handleExportCsv}
          className="px-4 py-2.5 rounded-xl bg-[var(--surface)] border border-[var(--border)] hover:bg-slate-50 text-[var(--text)] text-xs sm:text-sm font-semibold flex items-center gap-2 cursor-pointer self-start sm:self-auto"
        >
          <Download className="w-4 h-4 text-emerald-600" />
          <span>Export CSV</span>
        </button>
      </div>

      {/* Summary KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-[var(--surface)] border border-[var(--border)] rounded-2xl p-4 shadow-soft">
          <span className="text-xs font-medium text-[var(--text-muted)]">Total Entries</span>
          <p className="text-2xl font-bold text-[var(--text)] mt-1">{totals.count}</p>
        </div>
        <div className="bg-[var(--surface)] border border-[var(--border)] rounded-2xl p-4 shadow-soft">
          <span className="text-xs font-medium text-[var(--text-muted)]">Completed Collections</span>
          <p className="text-2xl font-bold text-emerald-600 mt-1">PKR {totals.collected.toLocaleString()}</p>
        </div>
        <div className="bg-[var(--surface)] border border-[var(--border)] rounded-2xl p-4 shadow-soft">
          <span className="text-xs font-medium text-[var(--text-muted)]">Pending / Unpaid</span>
          <p className="text-2xl font-bold text-amber-600 mt-1">PKR {totals.pending.toLocaleString()}</p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-[var(--surface)] border border-[var(--border)] rounded-2xl p-4 shadow-soft flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          {['All', 'Completed', 'Pending'].map(st => (
            <button
              key={st}
              type="button"
              onClick={() => setStatusFilter(st)}
              className={`px-3.5 py-2 rounded-xl text-xs font-semibold cursor-pointer ${
                statusFilter === st ? 'bg-emerald-600 text-white' : 'bg-slate-50 text-[var(--text-muted)]'
              }`}
            >
              {st}
            </button>
          ))}
        </div>
        <div className="relative">
          <Search className="w-4 h-4 text-[var(--text-muted)] absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search reference or student..."
            className="pl-9 pr-3.5 py-2 rounded-xl border border-[var(--border)] bg-[var(--surface)] text-xs text-[var(--text)] w-full sm:w-64"
          />
        </div>
      </div>

      {/* Table */}
      {filtered.length === 0 ? (
        <div className="bg-[var(--surface)] border border-dashed border-[var(--border)] rounded-2xl p-10 text-center">
          <Receipt className="w-10 h-10 text-slate-300 mx-auto mb-3" />
          <h3 className="text-sm font-semibold text-[var(--text)]">No Transactions Recorded Yet</h3>
          <p className="text-xs text-[var(--text-muted)] mt-1 max-w-md mx-auto">
            Transactions generated from <strong>Billing &amp; Fees</strong> payments and campus receipts will appear here automatically.
          </p>
        </div>
      ) : (
        <div className="bg-[var(--surface)] border border-[var(--border)] rounded-2xl overflow-hidden shadow-soft">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs sm:text-sm">
              <thead className="bg-slate-50 border-b border-[var(--border)] text-[11px] uppercase text-slate-500">
                <tr>
                  <th className="px-4 py-3">Ref ID</th>
                  <th className="px-4 py-3">Date</th>
                  <th className="px-4 py-3">Party / Student</th>
                  <th className="px-4 py-3">Description</th>
                  <th className="px-4 py-3">Amount</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3 text-right">Receipt</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--border)]">
                {filtered.map((tx, idx) => (
                  <tr key={`${tx.id}-${idx}`} className="hover:bg-slate-50/70">
                    <td className="px-4 py-3 font-mono text-xs text-[var(--text)]">{tx.id}</td>
                    <td className="px-4 py-3 text-xs text-[var(--text-muted)]">{String(tx.date).slice(0, 10)}</td>
                    <td className="px-4 py-3 font-semibold text-[var(--text)]">{tx.party}</td>
                    <td className="px-4 py-3 text-xs text-[var(--text-muted)]">{tx.description}</td>
                    <td className="px-4 py-3 font-bold text-[var(--text)]">PKR {tx.amount.toLocaleString()}</td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold ${
                        tx.status === 'Completed' ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-700'
                      }`}>
                        {tx.status === 'Completed' ? <CheckCircle2 className="w-3 h-3" /> : <Clock className="w-3 h-3" />}
                        {tx.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <button
                        type="button"
                        onClick={() => setSelectedTx(tx)}
                        className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-500 hover:text-emerald-700 cursor-pointer"
                        title="View / Print Receipt"
                      >
                        <Printer className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {selectedTx && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-white text-slate-900 rounded-2xl p-6 shadow-xl space-y-4">
            <div className="flex items-start justify-between border-b pb-3">
              <div>
                <p className="text-[11px] font-bold uppercase text-emerald-700">{currentInstitute?.name || 'School Campus'}</p>
                <h2 className="text-lg font-bold">Payment Receipt</h2>
              </div>
              <button type="button" onClick={() => setSelectedTx(null)} className="text-slate-400 hover:text-slate-700 cursor-pointer">
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="space-y-2 text-xs">
              <div className="flex justify-between"><span className="text-slate-500">Reference</span><span className="font-mono font-bold">{selectedTx.id}</span></div>
              <div className="flex justify-between"><span className="text-slate-500">Date</span><span>{String(selectedTx.date).slice(0, 10)}</span></div>
              <div className="flex justify-between"><span className="text-slate-500">Student / Account</span><span className="font-semibold">{selectedTx.party}</span></div>
              <div className="flex justify-between"><span className="text-slate-500">Description</span><span>{selectedTx.description}</span></div>
              <div className="flex justify-between"><span className="text-slate-500">Method</span><span>{selectedTx.method}</span></div>
              <div className="flex justify-between pt-2 border-t text-sm font-bold"><span>Amount</span><span>PKR {selectedTx.amount.toLocaleString()}</span></div>
            </div>
            <div className="flex justify-end pt-2">
              <button type="button" onClick={() => window.print()} className="px-4 py-2 rounded-xl bg-emerald-600 text-white text-xs font-semibold flex items-center gap-1.5 cursor-pointer">
                <Printer className="w-3.5 h-3.5" />
                <span>Print Receipt</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default MyTransactionsView
