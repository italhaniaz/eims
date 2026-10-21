import React, { useState, useMemo } from 'react'
import { 
  Printer, 
  X, 
  School, 
  Building2, 
  CreditCard, 
  Layers, 
  CheckCircle2, 
  Clock, 
  AlertCircle, 
  DollarSign, 
  FileText,
  Sliders,
  ChevronLeft,
  ChevronRight
} from 'lucide-react'
import { BarcodeSvg, QrCodeSvg, BANK_PRESETS } from './PrintHelpers'

export const PrintableFeeChallanModal = ({ 
  isOpen, 
  onClose, 
  selectedFee = null, 
  allFees = [], 
  students = [], 
  currentInstitute,
  defaultClass = ''
}) => {
  const [selectedBankId, setSelectedBankId] = useState('hbl')
  const [targetClass, setTargetClass] = useState(() => {
    if (selectedFee?.className) return selectedFee.className
    if (defaultClass) return defaultClass
    return 'All Classes'
  })
  const [lateFeeFine, setLateFeeFine] = useState(500)
  const [issueDate, setIssueDate] = useState(() => new Date().toISOString().split('T')[0])
  const [dueDate, setDueDate] = useState(() => {
    if (selectedFee?.dueDate) return selectedFee.dueDate
    const d = new Date()
    d.setDate(d.getDate() + 10)
    return d.toISOString().split('T')[0]
  })
  const [validityDate, setValidityDate] = useState(() => {
    const d = new Date()
    d.setDate(d.getDate() + 20)
    return d.toISOString().split('T')[0]
  })
  const [billingMonth, setBillingMonth] = useState('October 2026')

  // Pagination for screen preview
  const [previewPage, setPreviewPage] = useState(0)

  // Current selected bank configuration
  const activeBank = useMemo(() => {
    return BANK_PRESETS.find(b => b.id === selectedBankId) || BANK_PRESETS[0]
  }, [selectedBankId])

  // Extract distinct classes from students & fees
  const availableClasses = useMemo(() => {
    const set = new Set()
    students.forEach(s => { if (s.className) set.add(s.className) })
    allFees.forEach(f => { if (f.className) set.add(f.className) })
    return Array.from(set).sort()
  }, [students, allFees])

  // Prepare list of vouchers to print (Single or Batch for Class)
  const vouchersToPrint = useMemo(() => {
    // If user explicitly launched for a single voucher and targetClass is matched or single
    if (selectedFee && (!targetClass || targetClass === selectedFee.className || targetClass === 'Single Selected')) {
      const studentObj = students.find(s => s.name === selectedFee.studentName || s.rollNumber === selectedFee.rollNumber)
      return [{
        ...selectedFee,
        fatherName: studentObj?.fatherName || 'Legal Guardian',
        section: studentObj?.section || 'A',
        phone: studentObj?.phone || ''
      }]
    }

    // Otherwise, batch mode for targetClass
    let filteredFees = allFees.filter(f => !f.instituteId || f.instituteId === currentInstitute?.id)
    if (targetClass !== 'All Classes') {
      filteredFees = filteredFees.filter(f => (f.className || '').toLowerCase() === targetClass.toLowerCase())
    }

    if (filteredFees.length === 0 && targetClass !== 'All Classes') {
      // If no fee records exist yet for this class, generate synthetic challans for enrolled students
      const classStudents = students.filter(s => 
        (!s.instituteId || s.instituteId === currentInstitute?.id) &&
        (s.className || '').toLowerCase() === targetClass.toLowerCase()
      )
      return classStudents.map((s, idx) => ({
        id: `gen-${s.id || idx}`,
        studentName: s.name,
        rollNumber: s.rollNumber,
        className: s.className || targetClass,
        fatherName: s.fatherName || 'Legal Guardian',
        section: s.section || 'A',
        amount: 15000,
        grossAmount: 15000,
        discountAmount: 0,
        dueDate: dueDate,
        feeTitle: 'Monthly Tuition Fee'
      }))
    }

    return filteredFees.map(f => {
      const studentObj = students.find(s => s.name === f.studentName || s.rollNumber === f.rollNumber)
      return {
        ...f,
        fatherName: studentObj?.fatherName || 'Legal Guardian',
        section: studentObj?.section || 'A',
        phone: studentObj?.phone || ''
      }
    })
  }, [selectedFee, targetClass, allFees, students, currentInstitute?.id, dueDate])

  const currentVoucher = vouchersToPrint[previewPage] || vouchersToPrint[0]

  if (!isOpen) return null

  const copies = [
    {
      id: 'bank-copy',
      title: 'BANK COPY',
      urduTitle: 'بینک / کیشئر کاپی',
      sub: 'To be retained by receiving bank / cashier',
      tagColor: 'bg-emerald-100 text-emerald-800 border-emerald-300'
    },
    {
      id: 'institute-copy',
      title: 'INSTITUTE COPY',
      urduTitle: 'ادارہ / اکاؤنٹس کاپی',
      sub: 'To be deposited at campus accounts desk',
      tagColor: 'bg-blue-100 text-blue-800 border-blue-300'
    },
    {
      id: 'student-copy',
      title: 'STUDENT COPY',
      urduTitle: 'طالب علم / والدین کاپی',
      sub: 'To be retained by student / parent',
      tagColor: 'bg-purple-100 text-purple-800 border-purple-300'
    }
  ]

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-slate-950/70 backdrop-blur-sm animate-in fade-in duration-150 overflow-y-auto">
      {/* Print Specific CSS Rules */}
      <style>{`
        @media print {
          /* Hide non-printable elements */
          body * {
            visibility: hidden !important;
          }
          #printable-challan-root, #printable-challan-root * {
            visibility: visible !important;
          }
          #printable-challan-root {
            position: absolute !important;
            left: 0 !important;
            top: 0 !important;
            width: 100% !important;
            margin: 0 !important;
            padding: 0 !important;
            background: white !important;
          }
          .no-print {
            display: none !important;
          }
          .page-break {
            page-break-after: always !important;
            break-after: page !important;
          }
          @page {
            size: A4 landscape;
            margin: 4mm 6mm;
          }
        }
      `}</style>

      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-7xl max-h-[95vh] flex flex-col overflow-hidden my-auto">
        {/* Modal Top Control Bar (Hidden during printing) */}
        <div className="px-5 py-3.5 border-b border-slate-200 bg-slate-50 flex flex-wrap items-center justify-between gap-3 no-print">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-600 text-white flex items-center justify-center shadow-xs">
              <Printer className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm sm:text-base font-bold text-slate-900 tracking-tight">
                  3-Copy Official Bank Fee Challan Engine
                </h3>
                <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200">
                  A4 3-Column Standard
                </span>
              </div>
              <p className="text-[11px] text-slate-500">
                Triple-slip voucher: Bank Copy • Institute Copy • Student Copy
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            {/* Bank Selector */}
            <div className="flex items-center gap-1.5 bg-white border border-slate-200 rounded-lg px-2.5 py-1 text-xs">
              <span className="text-slate-400 font-medium">Bank:</span>
              <select
                value={selectedBankId}
                onChange={(e) => setSelectedBankId(e.target.value)}
                className="bg-transparent font-bold text-slate-800 focus:outline-none cursor-pointer text-xs"
              >
                {BANK_PRESETS.map(b => (
                  <option key={b.id} value={b.id}>{b.shortName}</option>
                ))}
              </select>
            </div>

            {/* Target Class Selector */}
            <div className="flex items-center gap-1.5 bg-white border border-slate-200 rounded-lg px-2.5 py-1 text-xs">
              <span className="text-slate-400 font-medium">Class:</span>
              <select
                value={targetClass}
                onChange={(e) => {
                  setTargetClass(e.target.value)
                  setPreviewPage(0)
                }}
                className="bg-transparent font-bold text-slate-800 focus:outline-none cursor-pointer text-xs"
              >
                {selectedFee && <option value="Single Selected">Current ({selectedFee.studentName})</option>}
                <option value="All Classes">All Campus Classes</option>
                {availableClasses.map(cls => (
                  <option key={cls} value={cls}>{cls}</option>
                ))}
              </select>
            </div>

            {/* Print Trigger */}
            <button
              type="button"
              onClick={() => window.print()}
              className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-bold shadow transition-all flex items-center gap-1.5 cursor-pointer active:scale-95"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print {vouchersToPrint.length > 1 ? `All ${vouchersToPrint.length} Challans` : 'Challan'}</span>
            </button>

            <button
              type="button"
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-200 rounded-lg transition-colors cursor-pointer"
              title="Close Modal"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Configuration Micro-Bar (Billing Month, Fine, Dates) */}
        <div className="px-5 py-2 bg-white border-b border-slate-100 flex flex-wrap items-center justify-between gap-3 text-xs no-print">
          <div className="flex items-center gap-4 flex-wrap">
            <div className="flex items-center gap-1.5 text-slate-600">
              <span className="font-semibold text-slate-500">Billing Month:</span>
              <input
                type="text"
                value={billingMonth}
                onChange={(e) => setBillingMonth(e.target.value)}
                className="px-2 py-0.5 border border-slate-200 rounded text-xs w-28 bg-slate-50 font-medium"
              />
            </div>
            <div className="flex items-center gap-1.5 text-slate-600">
              <span className="font-semibold text-slate-500">Due Date:</span>
              <input
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="px-2 py-0.5 border border-slate-200 rounded text-xs bg-slate-50 font-medium"
              />
            </div>
            <div className="flex items-center gap-1.5 text-slate-600">
              <span className="font-semibold text-slate-500">Late Fee Fine:</span>
              <span className="font-mono text-slate-400">Rs.</span>
              <input
                type="number"
                min="0"
                step="50"
                value={lateFeeFine}
                onChange={(e) => setLateFeeFine(Number(e.target.value))}
                className="px-2 py-0.5 border border-slate-200 rounded text-xs w-20 bg-slate-50 font-mono font-bold"
              />
            </div>
          </div>

          {/* Screen pagination controls if multiple vouchers */}
          {vouchersToPrint.length > 1 && (
            <div className="flex items-center gap-2 text-xs">
              <span className="text-slate-500 font-medium">
                Previewing Student {previewPage + 1} of {vouchersToPrint.length}
              </span>
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  disabled={previewPage === 0}
                  onClick={() => setPreviewPage(p => Math.max(0, p - 1))}
                  className="p-1 border border-slate-200 rounded hover:bg-slate-50 disabled:opacity-30 disabled:cursor-not-allowed"
                >
                  <ChevronLeft className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  disabled={previewPage === vouchersToPrint.length - 1}
                  onClick={() => setPreviewPage(p => Math.min(vouchersToPrint.length - 1, p + 1))}
                  className="p-1 border border-slate-200 rounded hover:bg-slate-50 disabled:opacity-30 disabled:cursor-not-allowed"
                >
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Printable Root Container */}
        <div id="printable-challan-root" className="flex-1 overflow-y-auto p-4 sm:p-6 bg-slate-100 print:p-0 print:bg-white">
          {/* Loop over vouchers. In print, ALL are rendered with page breaks. In screen preview, current is shown */}
          {vouchersToPrint.map((v, vIdx) => {
            const isScreenVisible = vIdx === previewPage
            const netAmount = Number(v.amount || 15000)
            const grossAmount = Number(v.grossAmount || netAmount)
            const discount = Number(v.discountAmount || (grossAmount - netAmount))
            const lateAmount = netAmount + Number(lateFeeFine || 0)
            const voucherCode = v.id ? `CH-${String(v.id).replace(/[^0-9]/g, '').slice(-6) || '260412'}` : `CH-260412`

            return (
              <div 
                key={v.id || vIdx} 
                className={`${isScreenVisible ? 'block' : 'hidden print:block'} page-break mb-8 print:mb-0`}
              >
                {/* 3-Column A4 Landscape Container */}
                <div className="bg-white border-2 border-slate-900 rounded-xl p-3 print:border-2 print:border-black print:rounded-none shadow-sm text-slate-900">
                  <div className="grid grid-cols-1 md:grid-cols-3 divide-y-2 md:divide-y-0 md:divide-x-2 divide-dashed divide-slate-400">
                    {copies.map((copy) => (
                      <div key={copy.id} className="p-2 sm:p-3 flex flex-col justify-between text-[11px] leading-tight">
                        <div>
                          {/* 1. Header: Bank & School Identity */}
                          <div className="text-center pb-2 border-b border-slate-800">
                            <div className="flex items-center justify-center gap-1.5 mb-0.5">
                              <Building2 className="w-3.5 h-3.5 text-slate-700" />
                              <span className="font-black text-xs uppercase tracking-tight text-slate-900">
                                {activeBank.name}
                              </span>
                            </div>
                            <p className="text-[9px] font-mono text-slate-500">
                              {activeBank.branch} • A/C: {activeBank.accountNo}
                            </p>
                            <p className="text-[8px] font-mono text-slate-400">
                              IBAN: {activeBank.iban}
                            </p>

                            <div className="mt-1.5 pt-1 border-t border-slate-200">
                              <h4 className="font-black text-xs uppercase text-slate-900 tracking-wide">
                                {currentInstitute?.name || 'CENTRAL HIGHER SECONDARY SCHOOL'}
                              </h4>
                              <p className="text-[9px] text-slate-500">
                                {currentInstitute?.address || 'Main Campus'} • Code: {currentInstitute?.code || 'SCH-001'}
                              </p>
                            </div>

                            {/* Copy Identification Badge */}
                            <div className="mt-1.5 flex items-center justify-center gap-2">
                              <span className={`px-2.5 py-0.5 rounded font-black text-[10px] uppercase tracking-wider border ${copy.tagColor}`}>
                                {copy.title}
                              </span>
                              <span className="text-[10px] font-bold text-slate-600">
                                ({copy.urduTitle})
                              </span>
                            </div>
                            <span className="text-[8px] text-slate-400 block mt-0.5">
                              {copy.sub}
                            </span>
                          </div>

                          {/* 2. Barcode & Challan Metadata */}
                          <div className="my-2 py-1 bg-slate-50 border border-slate-200 rounded flex items-center justify-between px-2">
                            <div>
                              <div className="text-[9px] text-slate-500 uppercase font-semibold">Voucher No</div>
                              <div className="font-mono font-black text-xs text-slate-900">{voucherCode}</div>
                              <div className="text-[8px] text-slate-400">Session: 2026-2027</div>
                            </div>
                            <div className="text-right">
                              <BarcodeSvg value={voucherCode} height={24} showText={false} />
                            </div>
                          </div>

                          {/* 3. Student Bio Information */}
                          <div className="space-y-1 py-1 text-[10px] border-b border-slate-200">
                            <div className="flex justify-between">
                              <span className="text-slate-500">Student Name (طالب علم):</span>
                              <span className="font-bold text-slate-900 truncate max-w-[140px]">{v.studentName}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-slate-500">Father's Name (والد):</span>
                              <span className="font-medium text-slate-800 truncate max-w-[140px]">{v.fatherName || 'Legal Guardian'}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-slate-500">Roll No / Reg:</span>
                              <span className="font-mono font-bold text-slate-900">{v.rollNumber || 'STD-001'}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-slate-500">Class & Section:</span>
                              <span className="font-bold text-slate-800">{v.className} (Sec {v.section || 'A'})</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-slate-500">Billing Month:</span>
                              <span className="font-semibold text-slate-800">{billingMonth}</span>
                            </div>
                            <div className="flex justify-between text-rose-700 font-bold">
                              <span>Due Date (معینہ تاریخ):</span>
                              <span className="font-mono">{v.dueDate || dueDate}</span>
                            </div>
                          </div>

                          {/* 4. Itemized Fee Breakdown Table */}
                          <div className="my-2">
                            <table className="w-full text-[9px] border border-slate-300">
                              <thead className="bg-slate-100 font-bold border-b border-slate-300 text-slate-700">
                                <tr>
                                  <th className="p-1 text-left">Fee Particulars</th>
                                  <th className="p-1 text-right">Amount (PKR)</th>
                                </tr>
                              </thead>
                              <tbody className="divide-y divide-slate-200">
                                <tr>
                                  <td className="p-1 text-slate-700">Monthly Tuition Fee (ٹیوشن)</td>
                                  <td className="p-1 text-right font-mono font-medium">Rs. {Math.round(grossAmount * 0.75).toLocaleString()}</td>
                                </tr>
                                <tr>
                                  <td className="p-1 text-slate-700">Lab & Computer Fund</td>
                                  <td className="p-1 text-right font-mono font-medium">Rs. {Math.round(grossAmount * 0.15).toLocaleString()}</td>
                                </tr>
                                <tr>
                                  <td className="p-1 text-slate-700">Exams & Printing Fund</td>
                                  <td className="p-1 text-right font-mono font-medium">Rs. {Math.round(grossAmount * 0.10).toLocaleString()}</td>
                                </tr>
                                {discount > 0 && (
                                  <tr className="bg-emerald-50 text-emerald-800 font-semibold">
                                    <td className="p-1">Concession / Kinship Aid</td>
                                    <td className="p-1 text-right font-mono text-emerald-700">-Rs. {discount.toLocaleString()}</td>
                                  </tr>
                                )}
                                <tr className="bg-slate-100 font-black border-t-2 border-slate-900 text-slate-900">
                                  <td className="p-1 text-[10px]">TOTAL PAYABLE (BY DUE DATE)</td>
                                  <td className="p-1 text-right font-mono text-xs">Rs. {netAmount.toLocaleString()}</td>
                                </tr>
                                <tr className="text-rose-700 font-bold bg-rose-50/50">
                                  <td className="p-1">Late Payment Surcharge (+Fine)</td>
                                  <td className="p-1 text-right font-mono">+Rs. {Number(lateFeeFine).toLocaleString()}</td>
                                </tr>
                                <tr className="bg-rose-100 text-rose-950 font-black">
                                  <td className="p-1 text-[10px]">PAYABLE AFTER DUE DATE</td>
                                  <td className="p-1 text-right font-mono text-xs">Rs. {lateAmount.toLocaleString()}</td>
                                </tr>
                              </tbody>
                            </table>
                          </div>

                          {/* 5. Terms & Payment Instructions */}
                          <div className="text-[8px] text-slate-500 leading-tight space-y-0.5">
                            <p>• Payable at any online branch of {activeBank.shortName} or via 1Link 1Bill.</p>
                            <p>• Fee once deposited is non-refundable and non-transferable.</p>
                            <p>• Validity Date: <strong className="text-slate-700">{validityDate}</strong></p>
                          </div>
                        </div>

                        {/* 6. Dual Signatures & Stamp Footer */}
                        <div className="pt-5 mt-2 border-t border-slate-300 grid grid-cols-2 text-[8px] text-center text-slate-600">
                          <div>
                            <div className="w-20 mx-auto border-b border-slate-400 mb-0.5"></div>
                            <span>Depositor Sign (والدین)</span>
                          </div>
                          <div>
                            <div className="w-20 mx-auto border-b border-slate-400 mb-0.5"></div>
                            <span>Bank / Cashier Stamp</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}

export default PrintableFeeChallanModal
