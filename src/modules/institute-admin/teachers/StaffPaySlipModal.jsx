import React, { useState } from 'react'
import { 
  Printer, 
  X, 
  School, 
  Receipt, 
  Calendar, 
  DollarSign, 
  Download, 
  Building2,
  CheckCircle2,
  CreditCard
} from 'lucide-react'

// Convert number to Pakistani Rupee Words
function numberToRupeesWords(num) {
  if (!num || num <= 0) return 'Zero Rupees Only'
  
  const a = ['', 'One ', 'Two ', 'Three ', 'Four ', 'Five ', 'Six ', 'Seven ', 'Eight ', 'Nine ', 'Ten ', 'Eleven ', 'Twelve ', 'Thirteen ', 'Fourteen ', 'Fifteen ', 'Sixteen ', 'Seventeen ', 'Eighteen ', 'Nineteen ']
  const b = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety']

  const inWords = (n) => {
    if ((n = n.toString()).length > 9) return 'Overflow'
    let nArray = ('000000000' + n).substr(-9).match(/^(\d{2})(\d{2})(\d{2})(\d{1})(\d{2})$/)
    if (!nArray) return ''
    let str = ''
    str += (nArray[1] != 0) ? (a[Number(nArray[1])] || b[nArray[1][0]] + ' ' + a[nArray[1][1]]) + 'Crore ' : ''
    str += (nArray[2] != 0) ? (a[Number(nArray[2])] || b[nArray[2][0]] + ' ' + a[nArray[2][1]]) + 'Lakh ' : ''
    str += (nArray[3] != 0) ? (a[Number(nArray[3])] || b[nArray[3][0]] + ' ' + a[nArray[3][1]]) + 'Thousand ' : ''
    str += (nArray[4] != 0) ? (a[Number(nArray[4])] || b[nArray[4][0]] + ' ' + a[nArray[4][1]]) + 'Hundred ' : ''
    str += (nArray[5] != 0) ? ((str != '') ? 'and ' : '') + (a[Number(nArray[5])] || b[nArray[5][0]] + ' ' + a[nArray[5][1]]) : ''
    return str
  }

  return `${inWords(Math.round(num)).trim()} Rupees Only`
}

export const StaffPaySlipModal = ({
  isOpen,
  onClose,
  selectedStaff,
  currentInstitute
}) => {
  const [selectedMonth, setSelectedMonth] = useState('October 2026')
  const [disbursementDate, setDisbursementDate] = useState('2026-11-01')

  if (!isOpen || !selectedStaff) return null

  const instituteName = currentInstitute?.name || 'CENTRAL MODEL SCHOOL & COLLEGE'
  const instituteCampus = currentInstitute?.campus || 'Main Campus, Lahore'
  const institutePhone = currentInstitute?.phone || '+92 42 35889900'

  const basicSalary = Number(selectedStaff.basicSalary || 65000)
  const allowance = Number(selectedStaff.allowance || 15000)
  const deductions = Number(selectedStaff.deductions || 3500)
  
  // Specific breakdowns
  const medicalAllowance = Math.round(allowance * 0.4)
  const conveyanceAllowance = allowance - medicalAllowance

  const taxWithholding = Math.round(deductions * 0.6)
  const providentFund = deductions - taxWithholding

  const grossEarnings = basicSalary + allowance
  const netPayable = grossEarnings - deductions

  const voucherNo = `SLIP-${selectedStaff.empId || 'EMP'}-${selectedMonth.replace(' ', '').toUpperCase()}`

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-slate-950/70 backdrop-blur-sm animate-in fade-in duration-150 overflow-y-auto">
      {/* Print Specific CSS */}
      <style>{`
        @media print {
          body * {
            visibility: hidden !important;
          }
          #printable-payslip-root, #printable-payslip-root * {
            visibility: visible !important;
          }
          #printable-payslip-root {
            position: absolute !important;
            left: 0 !important;
            top: 0 !important;
            width: 100% !important;
            margin: 0 !important;
            padding: 10mm !important;
            background: white !important;
          }
          .no-print {
            display: none !important;
          }
          @page {
            size: A4 portrait;
            margin: 8mm;
          }
        }
      `}</style>

      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-3xl max-h-[95vh] flex flex-col overflow-hidden my-auto">
        {/* Top Control Bar */}
        <div className="px-5 py-3.5 border-b border-slate-200 bg-slate-50 flex items-center justify-between gap-3 no-print">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-emerald-600 text-white flex items-center justify-center shadow-sm">
              <Receipt className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-slate-900 leading-tight">
                Official Faculty Pay Slip / Salary Voucher
              </h2>
              <p className="text-[11px] text-slate-500">
                Official institutional payroll disbursement record for {selectedStaff.name}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <select
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
              className="text-xs px-2.5 py-1.5 rounded-lg border border-slate-300 font-semibold text-slate-700 bg-white"
            >
              <option value="August 2026">August 2026</option>
              <option value="September 2026">September 2026</option>
              <option value="October 2026">October 2026</option>
              <option value="November 2026">November 2026</option>
              <option value="December 2026">December 2026</option>
            </select>

            <button
              onClick={() => window.print()}
              className="flex items-center gap-1.5 px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold shadow-sm transition-all"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print A4 Slip</span>
            </button>

            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-200 rounded-lg transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Pay Slip Sheet Body */}
        <div className="flex-1 overflow-y-auto p-6 bg-slate-100 flex justify-center">
          <div 
            id="printable-payslip-root"
            className="w-full max-w-2xl bg-white border border-slate-300 shadow-lg rounded-2xl p-8 space-y-6 text-slate-800"
          >
            {/* Header / Letterhead */}
            <div className="text-center border-b-2 border-slate-800 pb-5">
              <div className="flex items-center justify-center gap-2 text-emerald-700 mb-1">
                <School className="w-6 h-6" />
                <span className="text-xs font-mono font-bold uppercase tracking-widest text-slate-500">
                  Accounts & Disbursement Division
                </span>
              </div>
              <h1 className="text-xl font-black text-slate-900 uppercase tracking-tight">
                {instituteName}
              </h1>
              <p className="text-xs text-slate-500 font-medium">
                {instituteCampus} • Tel: {institutePhone}
              </p>

              <div className="mt-3 inline-flex items-center gap-3">
                <span className="px-3 py-1 rounded bg-slate-900 text-white text-xs font-mono font-bold tracking-wider uppercase">
                  SALARY SLIP FOR {selectedMonth}
                </span>
                <span className="text-xs font-mono text-slate-600 border border-slate-300 px-2.5 py-0.5 rounded">
                  Ref: {voucherNo}
                </span>
              </div>
            </div>

            {/* Employee Meta Grid */}
            <div className="grid grid-cols-2 gap-4 text-xs bg-slate-50 p-4 rounded-xl border border-slate-200">
              <div>
                <span className="text-slate-400 block mb-0.5">Employee Name</span>
                <strong className="text-slate-900 text-sm">{selectedStaff.name}</strong>
              </div>
              <div>
                <span className="text-slate-400 block mb-0.5">Employee ID</span>
                <strong className="text-slate-900 font-mono text-sm">{selectedStaff.empId}</strong>
              </div>
              <div>
                <span className="text-slate-400 block mb-0.5">Designation & Category</span>
                <strong className="text-slate-900">{selectedStaff.designation || 'Faculty Member'} ({selectedStaff.category || 'Teaching'})</strong>
              </div>
              <div>
                <span className="text-slate-400 block mb-0.5">Department / Faculty</span>
                <strong className="text-slate-900">{selectedStaff.department || 'General'}</strong>
              </div>
              <div>
                <span className="text-slate-400 block mb-0.5">National CNIC</span>
                <strong className="text-slate-900 font-mono">{selectedStaff.cnic || '35201-XXXXXXXX-X'}</strong>
              </div>
              <div>
                <span className="text-slate-400 block mb-0.5">Disbursement Account (IBAN)</span>
                <strong className="text-slate-900 font-mono">{selectedStaff.bankAccount || 'PK72HABB000192837465'}</strong>
              </div>
            </div>

            {/* Earnings & Deductions Tables */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              {/* Earnings Table */}
              <div className="border border-slate-200 rounded-xl overflow-hidden">
                <div className="bg-emerald-50 text-emerald-900 font-bold px-3 py-2 border-b border-emerald-200 flex justify-between">
                  <span>EARNINGS</span>
                  <span>AMOUNT (PKR)</span>
                </div>
                <div className="p-3 space-y-2">
                  <div className="flex justify-between">
                    <span className="text-slate-600">Basic Salary</span>
                    <strong className="font-mono">Rs. {basicSalary.toLocaleString()}</strong>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-600">Medical Allowance</span>
                    <strong className="font-mono">Rs. {medicalAllowance.toLocaleString()}</strong>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-600">Conveyance Allowance</span>
                    <strong className="font-mono">Rs. {conveyanceAllowance.toLocaleString()}</strong>
                  </div>
                  <div className="pt-2 border-t border-slate-200 flex justify-between font-bold text-slate-900">
                    <span>Total Gross Earnings</span>
                    <span className="font-mono text-emerald-700">Rs. {grossEarnings.toLocaleString()}</span>
                  </div>
                </div>
              </div>

              {/* Deductions Table */}
              <div className="border border-slate-200 rounded-xl overflow-hidden">
                <div className="bg-rose-50 text-rose-900 font-bold px-3 py-2 border-b border-rose-200 flex justify-between">
                  <span>DEDUCTIONS</span>
                  <span>AMOUNT (PKR)</span>
                </div>
                <div className="p-3 space-y-2">
                  <div className="flex justify-between">
                    <span className="text-slate-600">Income Tax Withholding</span>
                    <strong className="font-mono text-rose-700">Rs. {taxWithholding.toLocaleString()}</strong>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-600">Provident Fund / EOBI</span>
                    <strong className="font-mono text-rose-700">Rs. {providentFund.toLocaleString()}</strong>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-600">Unpaid Leave Deductions</span>
                    <strong className="font-mono text-rose-700">Rs. 0</strong>
                  </div>
                  <div className="pt-2 border-t border-slate-200 flex justify-between font-bold text-rose-900">
                    <span>Total Deductions</span>
                    <span className="font-mono text-rose-700">- Rs. {deductions.toLocaleString()}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Net Salary Payable Callout */}
            <div className="p-4 bg-emerald-50 border-2 border-emerald-300 rounded-xl flex items-center justify-between">
              <div>
                <span className="text-[11px] font-bold text-emerald-800 uppercase tracking-wider block">
                  Net Take-Home Salary Payable
                </span>
                <p className="text-xs font-semibold text-emerald-900 mt-0.5">
                  {numberToRupeesWords(netPayable)}
                </p>
                <span className="text-[10px] text-slate-500 mt-1 block">
                  Disbursed via Electronic Direct Deposit / IBAN on {disbursementDate}
                </span>
              </div>
              <div className="text-right">
                <span className="font-mono text-2xl font-black text-emerald-900">
                  Rs. {netPayable.toLocaleString()}
                </span>
              </div>
            </div>

            {/* Official Signatures */}
            <div className="pt-12 grid grid-cols-3 gap-6 text-center text-xs text-slate-500 border-t border-slate-200">
              <div>
                <div className="w-3/4 mx-auto border-b border-slate-400 mb-2"></div>
                <span className="font-semibold text-slate-700 block">Prepared By</span>
                <span className="text-[10px] text-slate-400">Accounts & Payroll Officer</span>
              </div>
              <div>
                <div className="w-3/4 mx-auto border-b border-slate-400 mb-2"></div>
                <span className="font-semibold text-slate-700 block">Faculty Member Signature</span>
                <span className="text-[10px] text-slate-400">Acknowledgment of Receipt</span>
              </div>
              <div>
                <div className="w-3/4 mx-auto border-b border-slate-400 mb-2"></div>
                <span className="font-semibold text-slate-700 block">Principal / Bursar Seal</span>
                <span className="text-[10px] text-slate-400">Authorized Signatory</span>
              </div>
            </div>

            <p className="text-[9px] text-center text-slate-400 pt-2 border-t border-slate-100">
              * This is a computer-generated salary slip and does not require a physical alteration. Generated via Educational Institute Management System (EIMS).
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default StaffPaySlipModal
