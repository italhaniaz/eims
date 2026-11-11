import React from 'react'
import { History, X } from 'lucide-react'

export const formatTxnDateTime = (val) => {
  if (!val) return '—'
  const dt = new Date(val)
  if (Number.isNaN(dt.getTime())) return String(val).slice(0, 16)
  const datePart = dt.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })
  const timePart = dt.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit', hour12: false })
  return `${datePart}, ${timePart}`
}

export const getInvoiceTransactions = (fee, defaultBy = 'Admin') => {
  if (!fee) return []
  if (Array.isArray(fee.transactions) && fee.transactions.length > 0) {
    return fee.transactions
  }
  const rows = []
  const total = Number(fee?.amount || 0) + Number(fee?.fine || fee?.lateFine || 0)
  const paid = Number(fee?.paidAmount || 0)
  const waived = Number(fee?.discount || fee?.waiver || 0)
  if (paid > 0) {
    rows.push({
      id: `${fee.id}-cash`,
      date: fee.paidAt || fee.updatedAt || fee.createdAt || fee.dueDate,
      type: 'Cash',
      amount: paid,
      balanceAfter: Math.max(0, total - paid - waived),
      by: fee.collectedBy || fee.recordedBy || defaultBy,
      reason: fee.notes || '—'
    })
  }
  if (waived > 0) {
    rows.push({
      id: `${fee.id}-waiver`,
      date: fee.waivedAt || fee.paidAt || fee.updatedAt || fee.createdAt || fee.dueDate,
      type: 'Waiver / discount',
      amount: waived,
      balanceAfter: null,
      by: fee.waivedBy || fee.recordedBy || defaultBy,
      reason: fee.discountReason || 'Management approval'
    })
  }
  return rows
}

const getTypeBadgeClass = (typeStr) => {
  const lower = String(typeStr || '').toLowerCase()
  if (lower.includes('waiver reversal')) return 'bg-orange-500 text-white'
  if (lower.includes('payment reversal') || lower.includes('reversal')) return 'bg-rose-500 text-white'
  if (lower.includes('waiver')) return 'bg-cyan-500 text-white'
  return 'bg-emerald-500 text-white'
}

const getAmountClass = (txn) => {
  if (Number(txn.amount) < 0) return 'text-rose-500 font-bold'
  if (String(txn.type || '').toLowerCase().includes('waiver')) return 'text-cyan-600 font-bold'
  return 'text-emerald-600 font-bold'
}

/**
 * Shared Invoice Transaction History modal used in both StudentProfileView
 * and StudentBillingHistoryView.
 */
export const InvoiceTransactionsModal = ({
  fee,
  onClose,
  subtitle,
  defaultBy = 'Admin',
  formatMoney = (val) => `PKR ${Number(val || 0).toLocaleString()}`
}) => {
  if (!fee) return null

  const txnRows = getInvoiceTransactions(fee, defaultBy)
  const refNum = fee.receiptNo || fee.invoiceNo || String(fee.id).slice(-8)
  const title = fee.title || fee.feeName || fee.feeType || 'Tuition'
  const freq = fee.frequency || fee.feeMonth || 'Monthly'
  const resolvedSubtitle = subtitle || `Invoice #${refNum} — ${title} — ${freq}`

  return (
    <div className="fixed inset-0 z-[115] bg-slate-900/50 backdrop-blur-[1px] flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-3xl overflow-hidden border border-slate-200">
        <div className="px-6 pt-5 pb-2 flex items-center justify-between">
          <div className="flex items-center gap-2 text-base font-bold text-slate-800">
            <History className="w-4 h-4 text-slate-600" />
            <span>Transaction History</span>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 cursor-pointer"
            aria-label="Close Transaction History"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="px-6 pb-5 space-y-4">
          <p className="text-xs text-slate-500">{resolvedSubtitle}</p>

          <div className="overflow-x-auto border border-slate-200 rounded-lg">
            <table className="w-full text-xs text-left">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-700 font-semibold">
                <tr>
                  <th className="py-2.5 px-3 w-10">#</th>
                  <th className="py-2.5 px-3">Date &amp; time</th>
                  <th className="py-2.5 px-3">Type</th>
                  <th className="py-2.5 px-3 text-right">Amount</th>
                  <th className="py-2.5 px-3 text-right">Balance after</th>
                  <th className="py-2.5 px-3">By</th>
                  <th className="py-2.5 px-3">Reason</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {txnRows.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-6 text-center text-slate-400">
                      No transactions recorded for this invoice yet.
                    </td>
                  </tr>
                ) : (
                  txnRows.map((txn, idx) => (
                    <tr key={txn.id || idx} className="hover:bg-slate-50/60">
                      <td className="py-2.5 px-3 text-slate-600">{idx + 1}</td>
                      <td className="py-2.5 px-3 text-slate-700 whitespace-nowrap">
                        {formatTxnDateTime(txn.date)}
                      </td>
                      <td className="py-2.5 px-3">
                        <span
                          className={`inline-block px-2 py-0.5 rounded text-[11px] font-bold whitespace-nowrap ${getTypeBadgeClass(txn.type)}`}
                        >
                          {txn.type}
                        </span>
                      </td>
                      <td className={`py-2.5 px-3 text-right whitespace-nowrap ${getAmountClass(txn)}`}>
                        {Number(txn.amount) < 0
                          ? `-${formatMoney(Math.abs(txn.amount))}`
                          : formatMoney(txn.amount)}
                      </td>
                      <td className="py-2.5 px-3 text-right text-slate-600 whitespace-nowrap">
                        {txn.balanceAfter != null ? formatMoney(txn.balanceAfter) : '—'}
                      </td>
                      <td className="py-2.5 px-3 text-slate-700 whitespace-nowrap">
                        {txn.by || defaultBy}
                      </td>
                      <td className="py-2.5 px-3 text-slate-500">
                        {txn.reason || '—'}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          <div className="flex justify-end">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg bg-slate-500 hover:bg-slate-600 text-white text-xs font-semibold cursor-pointer"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default InvoiceTransactionsModal
