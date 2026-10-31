import React, { useState, useMemo } from 'react'
import { 
  GraduationCap, 
  CheckCircle2, 
  User, 
  Phone, 
  CreditCard, 
  Calendar, 
  Layers, 
  Sparkles, 
  X,
  FileCheck,
  AlertCircle
} from 'lucide-react'
import Modal from '../../components/common/Modal'
import { normalizeClassSections } from '../../constants/academicLevels'
import { useToast } from '../../context/ToastContext'

export const ConvertStudentModal = ({
  isOpen,
  onClose,
  lead,
  currentInstitute,
  activeSession = '2026-2027',
  classes = [],
  students = [],
  onConfirmEnrollment
}) => {
  const { toast } = useToast()
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Determine Next Sequential Roll Number with Institute Campus Code Prefix
  const autoRollNumber = useMemo(() => {
    const campusCode = currentInstitute?.code || (currentInstitute?.name ? currentInstitute.name.replace(/[^A-Za-z]/g, '').slice(0, 3).toUpperCase() : 'BHS')
    const year = new Date().getFullYear()

    const existingNums = (students || [])
      .filter(s => !s.instituteId || s.instituteId === currentInstitute?.id)
      .map(s => {
        const match = String(s.rollNumber || '').match(/([0-9]+)$/)
        return match ? parseInt(match[1], 10) : 0
      })
      .filter(n => !isNaN(n) && n > 0)

    const maxNum = existingNums.length > 0 ? Math.max(...existingNums) : 0
    const nextVal = maxNum + 1
    return `${campusCode}-${year}-${String(nextVal).padStart(4, '0')}`
  }, [students, currentInstitute, lead?.gradeApplied])

  // Dynamic sections available for the lead's class
  const dynamicSections = useMemo(() => {
    const matchingClass = classes.find(c => c.name === lead?.gradeApplied)
    if (matchingClass) {
      return normalizeClassSections(matchingClass)
    }
    return ['A', 'B', 'C', 'D']
  }, [classes, lead?.gradeApplied])

  // Pre-filled form data with candidate info (ZERO RETYPING!)
  const [enrollData, setEnrollData] = useState(() => ({
    name: lead?.studentName || '',
    dob: lead?.dob || '',
    gender: lead?.gender || 'Male',
    bFormCnic: lead?.bFormCnic || '',
    address: lead?.address || '',
    city: lead?.city || 'Lahore',
    email: lead?.email || '',
    phone: lead?.parentPhone || '',
    fatherName: lead?.parentName || '',
    fatherCnic: lead?.fatherCnic || '',
    guardianPhone: lead?.parentPhone || '',
    guardianWhatsapp: lead?.parentWhatsapp || lead?.parentPhone || '',
    className: lead?.gradeApplied || '',
    section: dynamicSections[0] || 'A',
    rollNumber: autoRollNumber,
    academicSession: lead?.academicSession || activeSession,
    previousSchool: lead?.previousSchool || '',
    matricMarks: lead?.matricMarks || lead?.previousClassMarks || '',
    bloodGroup: lead?.bloodGroup || '',
    feeStatus: lead?.stage === 'Fee Paid' ? 'Paid' : 'Pending',
    feePlan: 'Standard Regular Monthly Plan',
    discount: lead?.scorecard?.percentage && parseInt(lead.scorecard.percentage) >= 85 ? '15% High Achiever Merit Concession' : 'None',
    admissionFeeAmount: lead?.admissionFeeAmount || 25000
  }))

  if (!isOpen || !lead) return null

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!enrollData.className || !enrollData.section) {
      toast.error('Class and Section must be assigned.')
      return
    }

    setIsSubmitting(true)
    try {
      if (onConfirmEnrollment) {
        await onConfirmEnrollment(lead, enrollData)
      }
      onClose()
    } catch (err) {
      console.error(err)
      toast.error('Failed to convert candidate to enrolled student.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Confirm Student Roster Enrollment: ${lead.studentName}`}
      maxWidth="max-w-3xl"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Pre-fill Notice Banner */}
        <div className="p-3 bg-teal-50 border border-teal-200 rounded-xl flex items-center justify-between text-xs text-teal-900">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-teal-600 shrink-0" />
            <span>
              <strong>AUTOMATIC DATA TRANSFER:</strong> Candidate dossier, guardian contact, and test credentials pre-populated. Zero retyping required.
            </span>
          </div>
          <span className="font-mono bg-teal-100 text-teal-800 px-2 py-0.5 rounded font-bold uppercase text-[10px]">
            {lead.stage}
          </span>
        </div>

        {/* Section 1: Candidate Identity (Readonly / Pre-filled) */}
        <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl space-y-3">
          <span className="text-[11px] font-bold uppercase text-slate-500 tracking-wider block">
            1. Verified Candidate Credentials
          </span>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
            <div>
              <label className="block text-[10px] font-bold text-slate-500 uppercase mb-0.5">Student Full Name</label>
              <input
                type="text"
                readOnly
                value={enrollData.name}
                className="w-full px-2.5 py-1.5 rounded-lg border border-slate-300 bg-slate-100 font-bold text-slate-800"
              />
            </div>
            <div>
              <label className="block text-[10px] font-bold text-slate-500 uppercase mb-0.5">Father / Guardian</label>
              <input
                type="text"
                readOnly
                value={enrollData.fatherName}
                className="w-full px-2.5 py-1.5 rounded-lg border border-slate-300 bg-slate-100 font-bold text-slate-800"
              />
            </div>
            <div>
              <label className="block text-[10px] font-bold text-slate-500 uppercase mb-0.5">Guardian Phone</label>
              <input
                type="text"
                readOnly
                value={enrollData.guardianPhone}
                className="w-full px-2.5 py-1.5 rounded-lg border border-slate-300 bg-slate-100 font-mono font-bold text-slate-800"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
            <div>
              <label className="block text-[10px] font-bold text-slate-500 uppercase mb-0.5">B-Form / CNIC</label>
              <input
                type="text"
                value={enrollData.bFormCnic}
                onChange={(e) => setEnrollData({ ...enrollData, bFormCnic: e.target.value })}
                className="w-full px-2.5 py-1.5 rounded-lg border border-slate-300 bg-white font-mono"
                placeholder="35201-XXXXXXX-X"
              />
            </div>
            <div>
              <label className="block text-[10px] font-bold text-slate-500 uppercase mb-0.5">Gender</label>
              <select
                value={enrollData.gender}
                onChange={(e) => setEnrollData({ ...enrollData, gender: e.target.value })}
                className="w-full px-2.5 py-1.5 rounded-lg border border-slate-300 bg-white font-medium"
              >
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
              </select>
            </div>
            <div>
              <label className="block text-[10px] font-bold text-slate-500 uppercase mb-0.5">Blood Group</label>
              <select
                value={enrollData.bloodGroup}
                onChange={(e) => setEnrollData({ ...enrollData, bloodGroup: e.target.value })}
                className="w-full px-2.5 py-1.5 rounded-lg border border-slate-300 bg-white font-medium"
              >
                <option value="">-- Select Blood Group --</option>
                {['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'].map(bg => (
                  <option key={bg} value={bg}>{bg}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Section 2: Academic Roster Allocation */}
        <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl space-y-3">
          <span className="text-[11px] font-bold uppercase text-slate-500 tracking-wider block">
            2. Academic Class, Section & Roll Assignment
          </span>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
            <div>
              <label className="block text-[10px] font-bold text-slate-700 uppercase mb-0.5">
                Enrolling Class / Program <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                readOnly
                value={enrollData.className}
                className="w-full px-2.5 py-1.5 rounded-lg border border-slate-300 bg-slate-100 font-bold text-teal-900"
              />
            </div>

            <div>
              <label className="block text-[10px] font-bold text-slate-700 uppercase mb-0.5">
                Assigned Section / Unit <span className="text-rose-500">*</span>
              </label>
              <select
                required
                value={enrollData.section}
                onChange={(e) => setEnrollData({ ...enrollData, section: e.target.value })}
                className="w-full px-2.5 py-1.5 rounded-lg border border-slate-300 bg-white font-bold"
              >
                {dynamicSections.map(sec => (
                  <option key={sec} value={sec}>Section {sec}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-[10px] font-bold text-slate-700 uppercase mb-0.5">
                Auto Generated Roll Number
              </label>
              <input
                type="text"
                readOnly
                value={enrollData.rollNumber}
                className="w-full px-2.5 py-1.5 rounded-lg border border-slate-300 bg-slate-100 font-mono font-black text-slate-800"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            <div>
              <label className="block text-[10px] font-bold text-slate-700 uppercase mb-0.5">Academic Session</label>
              <input
                type="text"
                readOnly
                value={enrollData.academicSession}
                className="w-full px-2.5 py-1.5 rounded-lg border border-slate-300 bg-slate-100 font-bold"
              />
            </div>

            <div>
              <label className="block text-[10px] font-bold text-slate-700 uppercase mb-0.5">Initial Fee Status</label>
              <select
                value={enrollData.feeStatus}
                onChange={(e) => setEnrollData({ ...enrollData, feeStatus: e.target.value })}
                className="w-full px-2.5 py-1.5 rounded-lg border border-slate-300 bg-white font-bold"
              >
                <option value="Paid">Paid (Fee Cleared)</option>
                <option value="Pending">Pending (Fee Due)</option>
              </select>
            </div>
          </div>
        </div>

        {/* Section 3: Fee Voucher Intimation */}
        <div className="p-3.5 bg-emerald-50/60 border border-emerald-200 rounded-xl space-y-2 text-xs">
          <div className="flex items-center justify-between">
            <span className="font-bold text-emerald-950 uppercase tracking-wide text-[11px] flex items-center gap-1.5">
              <CreditCard className="w-3.5 h-3.5 text-emerald-700" />
              <span>Automatic Fee Voucher Generation</span>
            </span>
            <span className="font-mono font-bold text-emerald-800 text-sm">
              PKR {Number(enrollData.admissionFeeAmount).toLocaleString()}
            </span>
          </div>
          <p className="text-[11px] text-emerald-800">
            Enrolling this candidate will automatically register them in the <strong>Student Admissions & Roster</strong> and generate their first admission fee challan under Fee Invoices.
          </p>
        </div>

        {/* Modal Actions */}
        <div className="flex justify-end gap-2 pt-2 border-t">
          <button
            type="button"
            onClick={onClose}
            disabled={isSubmitting}
            className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="px-5 py-2 text-xs font-bold text-white bg-teal-600 hover:bg-teal-700 rounded-lg shadow-sm flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
          >
            <GraduationCap className="w-4 h-4" />
            <span>{isSubmitting ? 'Finalizing Enrollment...' : 'Confirm & Finalize Enrollment'}</span>
          </button>
        </div>
      </form>
    </Modal>
  )
}

export default ConvertStudentModal
