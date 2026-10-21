import React, { useState } from 'react'
import { 
  School, 
  Printer, 
  CheckCircle2, 
  AlertTriangle, 
  Calendar, 
  CreditCard, 
  FileText, 
  Clock, 
  UserPlus, 
  X,
  FileCheck
} from 'lucide-react'
import Modal from '../../components/common/Modal'
import { useToast } from '../../context/ToastContext'

export const OfferLetterModal = ({
  isOpen,
  onClose,
  applicant,
  currentInstitute,
  activeSession = '2026-2027',
  onUpdateLead,
  onProceedToEnroll
}) => {
  const { toast } = useToast()

  // Offer fields (customizable before printing)
  const [feeAmount, setFeeAmount] = useState(() => applicant?.admissionFeeAmount || 25000)
  
  // Expiry date (default 7 days from offer date or applicant.offerExpiryDate)
  const [expiryDate, setExpiryDate] = useState(() => {
    if (applicant?.offerExpiryDate) return applicant.offerExpiryDate
    const d = new Date()
    d.setDate(d.getDate() + 7)
    return d.toISOString().split('T')[0]
  })

  if (!isOpen || !applicant) return null

  // Check if expired
  const isOfferExpired = (() => {
    if (['Fee Paid', 'Enrolled'].includes(applicant.stage)) return false
    if (!expiryDate) return false
    const now = new Date()
    now.setHours(0, 0, 0, 0)
    const exp = new Date(expiryDate)
    exp.setHours(0, 0, 0, 0)
    return now > exp
  })()

  // Mark fee paid
  const handleMarkFeePaid = async () => {
    if (onUpdateLead) {
      await onUpdateLead(applicant.id, {
        stage: 'Fee Paid',
        status: 'Fee Cleared',
        admissionFeeAmount: feeAmount,
        offerExpiryDate: expiryDate,
        feePaidDate: new Date().toISOString().split('T')[0]
      })
      toast.success(`Fee received for ${applicant.studentName}! Ready for final student enrollment.`)
    }
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Official Provisional Admission Offer & Fee Intimation"
      maxWidth="max-w-4xl"
    >
      <div className="space-y-4">
        {/* Expiry / Status Alert Banner */}
        {isOfferExpired ? (
          <div className="p-3 bg-rose-50 border border-rose-300 rounded-xl flex items-center justify-between text-xs text-rose-900 print:hidden">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
              <span><strong>OFFER EXPIRED:</strong> The last date for fee deposit ({expiryDate}) has passed. Contact the Admissions Director to extend the deadline.</span>
            </div>
            <button
              type="button"
              onClick={() => {
                const nextWeek = new Date()
                nextWeek.setDate(nextWeek.getDate() + 7)
                setExpiryDate(nextWeek.toISOString().split('T')[0])
                toast.info('Validity extended by 7 days.')
              }}
              className="text-[11px] font-bold text-rose-800 underline hover:text-rose-950 cursor-pointer ml-2"
            >
              Extend Deadline
            </button>
          </div>
        ) : applicant.stage === 'Fee Paid' ? (
          <div className="p-3 bg-emerald-50 border border-emerald-300 rounded-xl flex items-center justify-between text-xs text-emerald-900 print:hidden">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span><strong>FEE PAID:</strong> Admission fee (Rs. {Number(feeAmount).toLocaleString()}) deposited. Candidate is cleared for enrollment roster.</span>
            </div>
            {onProceedToEnroll && (
              <button
                type="button"
                onClick={() => {
                  onClose()
                  onProceedToEnroll(applicant)
                }}
                className="px-3 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded font-bold text-xs flex items-center gap-1 cursor-pointer"
              >
                <UserPlus className="w-3.5 h-3.5" />
                <span>Enroll in Roster</span>
              </button>
            )}
          </div>
        ) : null}

        {/* Configuration Bar for Printing */}
        <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs print:hidden">
          <div>
            <label className="block text-[10px] font-bold uppercase text-slate-500 mb-1">
              Admission Enrollment & Security Fee (PKR)
            </label>
            <input
              type="number"
              value={feeAmount}
              onChange={(e) => setFeeAmount(Number(e.target.value))}
              className="w-full px-3 py-1.5 rounded-lg border border-slate-300 font-bold bg-white"
            />
          </div>
          <div>
            <label className="block text-[10px] font-bold uppercase text-slate-500 mb-1">
              Offer Last Date / Fee Due Deadline
            </label>
            <input
              type="date"
              value={expiryDate}
              onChange={(e) => setExpiryDate(e.target.value)}
              className="w-full px-3 py-1.5 rounded-lg border border-slate-300 font-bold bg-white"
            />
          </div>
        </div>

        {/* Printable Official A4 Offer Letter */}
        <div 
          id="printable-offer-letter"
          className="p-8 sm:p-10 bg-white border-2 border-slate-300 rounded-2xl space-y-5 print:border-none print:p-0 text-slate-800"
        >
          {/* Header & Crest */}
          <div className="text-center border-b pb-4 relative">
            <School className="w-11 h-11 text-teal-800 mx-auto mb-1" />
            <h2 className="text-xl font-black uppercase tracking-wider text-slate-900">
              {currentInstitute?.name || 'CENTRAL HIGHER SECONDARY & COLLEGE'}
            </h2>
            <p className="text-xs text-slate-500 font-medium">
              Office of the Dean & Directorate of Student Admissions
            </p>
            <div className="mt-2.5 inline-block px-4 py-1 bg-teal-50 border border-teal-300 rounded text-xs font-black uppercase tracking-widest text-teal-950">
              PROVISIONAL ADMISSION OFFER & FEE INTIMATION VOUCHER
            </div>

            {/* Status Stamp if Expired */}
            {isOfferExpired && (
              <div className="absolute top-2 right-2 border-2 border-rose-600 text-rose-600 font-black text-xs px-2.5 py-1 rounded uppercase rotate-6">
                EXPIRED
              </div>
            )}
            {applicant.stage === 'Fee Paid' && (
              <div className="absolute top-2 right-2 border-2 border-emerald-600 text-emerald-600 font-black text-xs px-2.5 py-1 rounded uppercase -rotate-6">
                FEE CLEARED
              </div>
            )}
          </div>

          {/* Letter Metadata */}
          <div className="flex justify-between text-xs text-slate-600 border-b pb-3">
            <div>
              <span>Reference No: <strong className="font-mono text-slate-900">ADM-OFFER-{applicant.id || '2026'}</strong></span>
            </div>
            <div>
              <span>Academic Session: <strong className="text-slate-900">{applicant.academicSession || activeSession}</strong></span>
            </div>
            <div>
              <span>Issue Date: <strong className="font-mono text-slate-900">{new Date().toISOString().split('T')[0]}</strong></span>
            </div>
          </div>

          {/* Recipient */}
          <div className="text-xs space-y-1">
            <p>To,</p>
            <p className="font-bold text-slate-900 text-sm">Mr. / Mrs. {applicant.parentName || 'Parent / Guardian'}</p>
            <p className="text-slate-600">Guardian of Candidate: <strong className="text-teal-900">{applicant.studentName}</strong></p>
            <p className="text-slate-600">Contact Calling Phone: <span className="font-mono">{applicant.parentPhone}</span></p>
            {applicant.address && <p className="text-slate-500">Address: {applicant.address}</p>}
          </div>

          {/* Offer Content */}
          <div className="text-xs space-y-3 leading-relaxed text-slate-700">
            <p>Dear Guardian,</p>
            <p>
              We are delighted to convey that following the academic entrance evaluation and merit assessment for the session <strong>{applicant.academicSession || activeSession}</strong>, your ward <strong className="text-slate-950 font-bold">{applicant.studentName}</strong> has been granted <strong>Provisional Admission Offer</strong> to:
            </p>

            <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-400 block">Class / Program</span>
                <strong className="text-slate-900 text-sm">{applicant.gradeApplied}</strong>
              </div>
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-400 block">Entrance Merit %</span>
                <strong className="text-emerald-700 font-mono text-sm">{applicant.scorecard?.percentage || 'Qualified (80%)'}</strong>
              </div>
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-400 block">Admission Fee Payable</span>
                <strong className="text-teal-950 font-mono text-sm">Rs. {Number(feeAmount).toLocaleString()}</strong>
              </div>
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-400 block">Fee Due Deadline</span>
                <strong className={`font-mono text-sm ${isOfferExpired ? 'text-rose-600' : 'text-slate-900'}`}>{expiryDate}</strong>
              </div>
            </div>

            <p>
              To confirm and secure the allocated seat, please submit the initial admission & security fees of <strong>Rs. {Number(feeAmount).toLocaleString()}</strong> on or before <strong>{expiryDate}</strong>. Failing to deposit fees prior to the deadline will lead to the forfeiture of the seat to waiting list candidates.
            </p>

            <div className="space-y-1.5 pt-1">
              <span className="font-bold text-slate-900 block">Mandatory Credentials Checklist for Admission Confirmation:</span>
              <ul className="list-disc pl-5 space-y-1 text-slate-600 text-[11px]">
                <li>Original School Leaving Certificate (SLC) / Transfer Certificate from previous institution</li>
                <li>Certified NADRA B-Form / CNIC copy of the student and Father/Guardian</li>
                <li>Four (4) recent passport-sized photographs with sky-blue background</li>
                <li>Official result card / transcript of previous class / matriculation</li>
              </ul>
            </div>

            <p className="pt-2 text-slate-600">
              We look forward to welcoming {applicant.studentName} into our prestigious institution.
            </p>
          </div>

          {/* Signatures */}
          <div className="pt-10 flex items-end justify-between text-xs text-slate-500 border-t mt-6">
            <div>
              <div className="w-36 border-b border-slate-400 mb-1"></div>
              <span>Admissions Incharge</span>
            </div>
            <div>
              <div className="w-36 border-b border-slate-400 mb-1"></div>
              <span>Accounts & Finance</span>
            </div>
            <div className="text-right">
              <div className="w-44 border-b-2 border-teal-800 mb-1 ml-auto"></div>
              <strong className="text-slate-900">Principal / Head of Institution</strong>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="flex flex-wrap items-center justify-between gap-2 pt-3 border-t print:hidden">
          <div className="flex items-center gap-2">
            {applicant.stage !== 'Fee Paid' && applicant.stage !== 'Enrolled' && (
              <button
                type="button"
                onClick={handleMarkFeePaid}
                className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold shadow-2xs flex items-center gap-1.5 cursor-pointer"
              >
                <CreditCard className="w-3.5 h-3.5" />
                <span>Record Fee Payment Received</span>
              </button>
            )}

            {onProceedToEnroll && (applicant.stage === 'Offer Issued' || applicant.stage === 'Fee Paid') && (
              <button
                type="button"
                onClick={() => {
                  onClose()
                  onProceedToEnroll(applicant)
                }}
                className="px-3.5 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-lg text-xs font-bold shadow-2xs flex items-center gap-1.5 cursor-pointer"
              >
                <UserPlus className="w-3.5 h-3.5" />
                <span>Enroll Student</span>
              </button>
            )}
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg cursor-pointer"
            >
              Close
            </button>
            <button
              type="button"
              onClick={() => window.print()}
              className="px-4 py-2 text-xs font-bold text-white bg-slate-900 hover:bg-slate-800 rounded-lg shadow-2xs flex items-center gap-1.5 cursor-pointer"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print Official Letter (A4)</span>
            </button>
          </div>
        </div>
      </div>
    </Modal>
  )
}

export default OfferLetterModal
