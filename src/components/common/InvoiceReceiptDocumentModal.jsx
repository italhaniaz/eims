import React from 'react'
import { Printer, X } from 'lucide-react'
import { BANK_PRESETS, QrCodeSvg } from './PrintHelpers'
import { formatTxnDateTime, getInvoiceTransactions } from './InvoiceTransactionsModal'

const formatDocDate = (val) => {
  if (!val) return '—'
  const dt = new Date(val)
  if (Number.isNaN(dt.getTime())) return String(val).slice(0, 10)
  return dt.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })
}

const fmtDec = (num) =>
  Number(num || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })

/**
 * Shared single-invoice A4 R E C E I P T document modal used by
 * StudentBillingHistoryView ("Fee Invoice") and InvoicesView ("Receipt").
 */
export const InvoiceReceiptDocumentModal = ({
  fee,
  student = null,
  currentInstitute = null,
  actorName = 'Admin',
  onClose
}) => {
  if (!fee) return null

  const invFine = Number(fee.fine || fee.lateFine || 0)
  const invTotal = Number(fee.amount || 0) + invFine
  const invPaid = Number(fee.paidAmount || 0)
  const invWaived = Number(fee.discount || fee.waiver || 0)
  const invBalanceDue = fee.status === 'Paid' ? 0 : Math.max(0, invTotal - invPaid - invWaived)
  const invRef = fee.referenceNo || fee.receiptNo || fee.invoiceNo || `IP-${String(fee.id).slice(-6).toUpperCase()}`
  const invStatusLabel = invBalanceDue <= 0 ? 'Paid' : invPaid > 0 ? 'Partly paid' : 'Unpaid'

  const allTxns = getInvoiceTransactions(fee, actorName)
  const cashPayments = allTxns.filter(
    (t) => String(t.type || '').toLowerCase() === 'cash' && Number(t.amount) > 0
  )

  const instPhone = currentInstitute?.phone || '03077238407'
  const instEmail = currentInstitute?.email || 'mirza@edudigitize.io'
  const now = new Date()
  const receiptDateStr = formatDocDate(now.toISOString())
  const generatedTimeStr = `${now.toLocaleDateString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric'
  })}, ${now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}`

  const studentName = fee.studentName || student?.fullName || student?.name || 'Student'
  const guardianName = fee.fatherName || student?.fatherName || student?.guardianName || ''
  const guardianPhone = student?.parentPhone || student?.phone || student?.guardianPhone || ''
  const admissionNo = fee.admissionNo || student?.admissionNo || student?.registrationNo || 'N/A'
  const className = fee.className || student?.className || student?.course || 'N/A'
  const rollNumber = fee.rollNumber || student?.rollNumber || 'N/A'
  const feeTitle = fee.feeTitle || fee.title || fee.feeName || fee.feeHead || 'Tuition Fee'

  return (
    <div className="fixed inset-0 z-[115] bg-slate-900/65 backdrop-blur-[1px] overflow-y-auto p-3 sm:p-6 print:p-0 print:bg-white">
      {/* Sticky Non-Print Toolbar */}
      <div className="max-w-4xl mx-auto mb-3 bg-slate-900 text-white px-4 py-2.5 rounded-xl flex items-center justify-between shadow-lg print:hidden">
        <span className="text-xs font-bold tracking-wide">
          Fee Invoice Receipt — #{invRef}
        </span>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => window.print()}
            className="px-3.5 py-1.5 rounded-lg bg-sky-500 hover:bg-sky-600 text-white text-xs font-bold inline-flex items-center gap-1.5 cursor-pointer"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Print / Save PDF</span>
          </button>
          <button
            type="button"
            onClick={onClose}
            className="px-3 py-1.5 rounded-lg bg-slate-700 hover:bg-slate-600 text-white text-xs font-semibold inline-flex items-center gap-1 cursor-pointer"
          >
            <X className="w-3.5 h-3.5" />
            <span>Close</span>
          </button>
        </div>
      </div>

      {/* A4 Printable Receipt Document */}
      <div className="max-w-4xl mx-auto bg-white shadow-2xl border border-slate-200 p-8 sm:p-10 text-slate-900 relative overflow-hidden print:shadow-none print:border-0">
        {/* Centered Subtle Watermark */}
        <div className="pointer-events-none select-none absolute inset-0 flex items-center justify-center opacity-[0.06]">
          <div className="w-80 h-80 rounded-full border-[14px] border-sky-400 flex flex-col items-center justify-center text-sky-500">
            <span className="text-5xl font-black tracking-wider">ED</span>
            <span className="text-xl font-black tracking-widest mt-1">
              {currentInstitute?.shortName || 'EduDigitize'}
            </span>
          </div>
        </div>

        <div className="relative z-10 space-y-6">
          {/* Document Header */}
          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-6">
            <div className="flex items-start gap-4">
              <div className="w-16 h-16 rounded-xl bg-sky-500 text-white flex flex-col items-center justify-center font-black shrink-0 shadow-sm">
                <span className="text-lg leading-none">
                  {(currentInstitute?.name || 'ED').slice(0, 2).toUpperCase()}
                </span>
                <span className="text-[8px] font-semibold opacity-90 mt-0.5">
                  {currentInstitute?.shortName || 'EduDigitize'}
                </span>
              </div>
              <div className="space-y-0.5">
                <h2 className="text-lg font-extrabold text-slate-900">
                  {currentInstitute?.name || 'EduDigitize Demo'}
                </h2>
                <p className="text-xs text-slate-600">Phone: {instPhone}</p>
                <p className="text-xs text-slate-600">Email: {instEmail}</p>
              </div>
            </div>

            <div className="sm:text-right">
              <h1 className="text-2xl sm:text-3xl font-black tracking-[0.2em] text-slate-900 uppercase">
                RECEIPT
              </h1>
              <div className="mt-2 space-y-0.5 text-xs">
                <div className="flex sm:justify-end gap-5">
                  <span className="text-slate-500">Receipt Date</span>
                  <span className="font-bold text-slate-900 min-w-[105px] text-right">{receiptDateStr}</span>
                </div>
                {fee.dueDate && (
                  <div className="flex sm:justify-end gap-5">
                    <span className="text-slate-500">Due Date</span>
                    <span className="font-bold text-slate-900 min-w-[105px] text-right">
                      {formatDocDate(fee.dueDate)}
                    </span>
                  </div>
                )}
                <div className="flex sm:justify-end gap-5">
                  <span className="text-slate-500">Admission No</span>
                  <span className="font-bold text-slate-900 min-w-[105px] text-right">{admissionNo}</span>
                </div>
                <div className="flex sm:justify-end gap-5">
                  <span className="text-slate-500">Reference</span>
                  <span className="font-bold text-slate-900 min-w-[105px] text-right">{invRef}</span>
                </div>
                <div className="flex sm:justify-end gap-5">
                  <span className="text-slate-500">Status</span>
                  <span className="font-bold text-slate-900 min-w-[105px] text-right">{invStatusLabel}</span>
                </div>
              </div>
            </div>
          </div>

          <hr className="border-t-2 border-slate-900" />

          {/* Bill To + Academic Details */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 text-xs">
            <div className="space-y-0.5">
              <p className="text-[10px] font-bold tracking-[0.15em] text-slate-500 uppercase border-b border-slate-300 pb-1 mb-2">
                BILL TO
              </p>
              <p className="font-extrabold text-sm text-slate-900">{studentName}</p>
              {guardianName && (
                <p className="text-slate-700">Parent / Guardian: {guardianName}</p>
              )}
              {guardianPhone && (
                <p className="text-slate-700">Parent / Guardian Phone: {guardianPhone}</p>
              )}
            </div>
            <div>
              <p className="text-[10px] font-bold tracking-[0.15em] text-slate-500 uppercase border-b border-slate-300 pb-1 mb-2">
                ACADEMIC DETAILS
              </p>
              <p className="text-slate-700">
                Class: <strong className="text-slate-900">{className}</strong>
              </p>
              <p className="text-slate-700 mt-0.5">
                Roll No: <strong className="text-slate-900">{rollNumber}</strong>
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
                  <th className="border border-slate-700 py-2 px-3 text-right">AMOUNT (PKR)</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="border border-slate-700 py-2.5 px-2.5 text-center text-slate-700">1</td>
                  <td className="border border-slate-700 py-2.5 px-3">
                    <div className="font-bold text-slate-900">
                      {feeTitle}
                      {(fee.feeMonth || fee.frequency) && (
                        <span className="font-normal text-slate-600">
                          {' '}({fee.feeMonth || 'One-Time'}{fee.frequency ? ` - ${fee.frequency}` : ''})
                        </span>
                      )}
                    </div>
                    {Number(fee.amount || 0) > 0 && fee.feeMonth && (
                      <div className="text-[11px] text-slate-600 mt-0.5">
                        Class Fee: {fmtDec(fee.amount)}
                      </div>
                    )}
                  </td>
                  <td className="border border-slate-700 py-2.5 px-3 text-center whitespace-nowrap">
                    {formatDocDate(fee.createdAt || fee.date || fee.dueDate)}
                  </td>
                  <td className="border border-slate-700 py-2.5 px-3 text-center whitespace-nowrap">
                    {fee.dueDate ? formatDocDate(fee.dueDate) : '—'}
                  </td>
                  <td className="border border-slate-700 py-2.5 px-3 text-center whitespace-nowrap">
                    {invFine > 0 ? fmtDec(invFine) : '—'}
                  </td>
                  <td className="border border-slate-700 py-2.5 px-3 text-right font-extrabold text-slate-900 tabular-nums">
                    {fmtDec(invTotal)}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Totals Box */}
          <div className="flex justify-end">
            <div className="w-full sm:w-80 border border-slate-800 text-xs">
              <div className="flex items-center justify-between px-3.5 py-2 border-b border-slate-300 text-slate-700">
                <span>Invoice Total</span>
                <span className="font-semibold text-slate-900 tabular-nums">PKR {fmtDec(invTotal)}</span>
              </div>
              <div className="flex items-center justify-between px-3.5 py-2 border-b border-slate-300 text-slate-700">
                <span>Total Paid</span>
                <span className="font-semibold text-slate-900 tabular-nums">PKR {fmtDec(invPaid)}</span>
              </div>
              {invWaived > 0 && (
                <div className="flex items-center justify-between px-3.5 py-2 border-b border-slate-300 text-slate-700">
                  <span>Waiver / Discount</span>
                  <span className="font-semibold text-slate-900 tabular-nums">PKR {fmtDec(invWaived)}</span>
                </div>
              )}
              <div className="flex items-center justify-between px-3.5 py-2.5 border-t border-slate-900 font-black text-sm text-slate-900 bg-slate-50/40">
                <span>Balance Due</span>
                <span className="tabular-nums">PKR {fmtDec(invBalanceDue)}</span>
              </div>
            </div>
          </div>

          {/* Payments Received Section (shown when payments exist) */}
          {cashPayments.length > 0 && (
            <div className="space-y-2 pt-1">
              <p className="text-[10px] font-bold tracking-[0.15em] text-slate-600 uppercase border-b border-slate-300 pb-1">
                PAYMENTS RECEIVED
              </p>
              <p className="text-xs text-slate-600">Already adjusted in the amounts above.</p>
              <div className="overflow-x-auto">
                <table className="w-full border-collapse border border-slate-500 text-xs">
                  <thead>
                    <tr className="bg-slate-50 text-[10px] uppercase tracking-wider text-slate-700">
                      <th className="border border-slate-500 py-2 px-3 text-left">DATE</th>
                      <th className="border border-slate-500 py-2 px-3 text-right">AMOUNT PAID (PKR)</th>
                      <th className="border border-slate-500 py-2 px-3 text-right">BALANCE (PKR)</th>
                    </tr>
                  </thead>
                  <tbody>
                    {cashPayments.map((p, idx) => (
                      <tr key={p.id || idx}>
                        <td className="border border-slate-500 py-2 px-3 text-slate-800 whitespace-nowrap">
                          {formatTxnDateTime(p.date)}
                        </td>
                        <td className="border border-slate-500 py-2 px-3 text-right font-semibold text-slate-900 tabular-nums">
                          {fmtDec(p.amount)}
                        </td>
                        <td className="border border-slate-500 py-2 px-3 text-right font-semibold text-slate-900 tabular-nums">
                          {p.balanceAfter != null ? fmtDec(p.balanceAfter) : fmtDec(invBalanceDue)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Payment Methods Section */}
          <div className="space-y-3 pt-1">
            <p className="text-[10px] font-bold tracking-[0.15em] text-slate-600 uppercase border-b border-slate-300 pb-1">
              PAYMENT METHODS
            </p>
            <div className="flex flex-col sm:flex-row items-start gap-5">
              <div className="border border-slate-300 rounded-md p-2 text-center bg-white shrink-0">
                <QrCodeSvg value={`EIMS-REC-${invRef}-${invBalanceDue}`} size={112} />
                <p className="text-[10px] text-slate-500 mt-1 font-medium">Scan the QR Code</p>
              </div>
              <div className="space-y-3 text-xs text-slate-700">
                <div>
                  <p className="font-extrabold text-slate-900">EastPaisa - EasyPaisa</p>
                  <p>Mobile: {instPhone}</p>
                  <p>Account Title: {currentInstitute?.adminName || 'Mirza Muhammad Anas Baig'}</p>
                  <p>Account Number: 34532243453534</p>
                  <p>IBAN: PK03077238407</p>
                </div>
                <div>
                  <p className="font-extrabold text-slate-900">{BANK_PRESETS[0].name}</p>
                  <p>Mobile: {instPhone}</p>
                  <p>Account Title: {BANK_PRESETS[0].accountTitle || 'Mirza Muhammad Anas Baig'}</p>
                  <p>Account Number: {BANK_PRESETS[0].accountNo || '34532243453534'}</p>
                  <p>IBAN: {BANK_PRESETS[0].iban || 'PK23232323432343'}</p>
                </div>
                <div>
                  <p className="font-extrabold text-slate-900">JazzCash</p>
                  <p>Mobile: {instPhone}</p>
                  <p>Account Title: {currentInstitute?.adminName || 'Mirza Muhammad Anas Baig'}</p>
                  <p>Account Number: {instPhone}</p>
                  <p>IBAN: PK03077238407</p>
                </div>
              </div>
            </div>
          </div>

          {/* Authorized Signature & Footer */}
          <div className="pt-8 space-y-4">
            <div className="flex justify-end">
              <div className="w-60 border-t border-slate-800 pt-1.5 text-center font-bold text-xs text-slate-800">
                Authorized Signature
              </div>
            </div>
            <div className="border-t border-slate-300 pt-2 flex flex-wrap items-center justify-between gap-2 text-[10px] text-slate-500">
              <span>This is a computer-generated receipt. Generated on {generatedTimeStr}.</span>
              <span className="font-semibold text-slate-600">{currentInstitute?.shortName || 'EduDigitize'}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default InvoiceReceiptDocumentModal
