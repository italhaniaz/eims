import React from 'react'
import { 
  Printer, 
  X, 
  School, 
  FileText, 
  Building2, 
  Calendar,
  CheckCircle2
} from 'lucide-react'

export const AppointmentLetterModal = ({
  isOpen,
  onClose,
  selectedStaff,
  currentInstitute
}) => {
  if (!isOpen || !selectedStaff) return null

  const instituteName = currentInstitute?.name || 'CENTRAL MODEL SCHOOL & COLLEGE'
  const instituteCampus = currentInstitute?.campus || 'Main Campus, Lahore'
  const instituteAddress = currentInstitute?.address || '12-A Kashmir Block, Allama Iqbal Town, Lahore'
  const institutePhone = currentInstitute?.phone || '+92 42 35889900'

  const issueDate = new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })
  const refNo = `EIMS/HR/APP/${new Date().getFullYear()}/${selectedStaff.empId || '001'}`

  const basicSalary = Number(selectedStaff.basicSalary || 65000)
  const allowance = Number(selectedStaff.allowance || 15000)
  const grossSalary = basicSalary + allowance

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-slate-950/70 backdrop-blur-sm animate-in fade-in duration-150 overflow-y-auto">
      {/* Print Specific CSS */}
      <style>{`
        @media print {
          body * {
            visibility: hidden !important;
          }
          #printable-appointment-root, #printable-appointment-root * {
            visibility: visible !important;
          }
          #printable-appointment-root {
            position: absolute !important;
            left: 0 !important;
            top: 0 !important;
            width: 100% !important;
            margin: 0 !important;
            padding: 12mm 15mm !important;
            background: white !important;
          }
          .no-print {
            display: none !important;
          }
          @page {
            size: A4 portrait;
            margin: 10mm;
          }
        }
      `}</style>

      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-4xl max-h-[95vh] flex flex-col overflow-hidden my-auto">
        {/* Top Control Bar */}
        <div className="px-5 py-3.5 border-b border-slate-200 bg-slate-50 flex items-center justify-between gap-3 no-print">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-emerald-600 text-white flex items-center justify-center shadow-sm">
              <FileText className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-slate-900 leading-tight">
                Official Letter of Appointment & Employment Contract
              </h2>
              <p className="text-[11px] text-slate-500">
                Formal legal appointment dossier for {selectedStaff.name} ({selectedStaff.empId})
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => window.print()}
              className="flex items-center gap-1.5 px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold shadow-sm transition-all"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print A4 Letter</span>
            </button>

            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-200 rounded-lg transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Letter Preview Body */}
        <div className="flex-1 overflow-y-auto p-6 sm:p-8 bg-slate-100 flex justify-center">
          <div 
            id="printable-appointment-root"
            className="w-full max-w-2xl bg-white border border-slate-300 shadow-xl rounded-2xl p-8 sm:p-12 space-y-6 text-slate-800 text-xs leading-relaxed"
          >
            {/* Letterhead */}
            <div className="border-b-2 border-emerald-800 pb-5 text-center">
              <div className="flex items-center justify-center gap-2 text-emerald-800 mb-1">
                <School className="w-7 h-7" />
              </div>
              <h1 className="text-xl font-black uppercase tracking-tight text-slate-900">
                {instituteName}
              </h1>
              <p className="text-xs text-slate-600 font-medium">
                {instituteAddress}
              </p>
              <p className="text-[11px] text-slate-500">
                Tel: {institutePhone} • Email: hr@eims-institution.edu.pk
              </p>
            </div>

            {/* Reference & Date */}
            <div className="flex justify-between items-center text-xs font-mono border-b border-slate-100 pb-3">
              <div>
                <span className="text-slate-400">Ref: </span>
                <strong className="text-slate-800">{refNo}</strong>
              </div>
              <div>
                <span className="text-slate-400">Date: </span>
                <strong className="text-slate-800">{issueDate}</strong>
              </div>
            </div>

            {/* Addressee Info */}
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-1">
              <div className="text-slate-500">To,</div>
              <div className="text-sm font-bold text-slate-900">{selectedStaff.name}</div>
              <div className="text-slate-600 font-mono text-[11px]">CNIC: {selectedStaff.cnic || '35201-XXXXXXXX-X'}</div>
              <div className="text-slate-600">{selectedStaff.address ? `${selectedStaff.address}, ${selectedStaff.city || 'Lahore'}` : 'Lahore, Pakistan'}</div>
              <div className="text-slate-600 font-mono text-[11px]">Phone: {selectedStaff.phone || '+92 3XX XXXXXXX'}</div>
            </div>

            {/* Subject */}
            <div className="py-1">
              <span className="text-xs font-black uppercase text-slate-900 tracking-wide border-b-2 border-slate-900 pb-0.5">
                SUBJECT: LETTER OF APPOINTMENT AS {selectedStaff.designation ? selectedStaff.designation.toUpperCase() : 'FACULTY MEMBER'}
              </span>
            </div>

            {/* Body Clauses */}
            <div className="space-y-3.5 text-slate-700 text-justify">
              <p>
                Dear <strong>{selectedStaff.name}</strong>,
              </p>
              <p>
                With reference to your application and subsequent interview, the Competent Authority is pleased to offer you appointment as <strong>{selectedStaff.designation || 'Faculty Member'}</strong> in the <strong>{selectedStaff.department || 'General'} Department</strong> ({selectedStaff.category || 'Teaching'} Cadre) at <strong>{instituteName}</strong>, on the following terms and conditions:
              </p>

              <div className="space-y-2.5 pl-3 border-l-2 border-emerald-500">
                <p>
                  <strong>1. Commencing Date & Probation:</strong> Your appointment is effective from <strong>{selectedStaff.joiningDate || issueDate}</strong>. You will be on probation for an initial period of three (3) months, extendable at the discretion of the Management based on academic and pedagogical evaluation.
                </p>
                <p>
                  <strong>2. Monthly Remuneration Package:</strong> You will be entitled to a consolidated gross monthly package of <strong>Rs. {grossSalary.toLocaleString()}/- (Pakistani Rupees)</strong> comprising a Basic Salary of Rs. {basicSalary.toLocaleString()} and Allowances of Rs. {allowance.toLocaleString()}, subject to statutory tax deductions as per the Federal Board of Revenue (FBR) ordinances.
                </p>
                <p>
                  <strong>3. Timetable & Academic Duties:</strong> As a faculty member, you will be allocated instructional periods, curriculum schemes, examination invigilation, student assessments, and any designated class teacher responsibilities as assigned by the Academic Directorate.
                </p>
                <p>
                  <strong>4. Code of Institutional Conduct:</strong> You agree to uphold the highest standards of professional ethics, student safeguarding, academic integrity, and confidentiality concerning institutional operations and curriculum content.
                </p>
                <p>
                  <strong>5. Termination & Resignation Notice:</strong> Either party may terminate this employment agreement by tendering thirty (30) days written notice or depositing one month’s gross salary in lieu thereof.
                </p>
              </div>

              <p>
                Please sign and return the duplicate copy of this letter along with attested copies of your academic credentials and CNIC in acknowledgment of having accepted the terms of appointment.
              </p>
            </div>

            {/* Closing & Signatures */}
            <div className="pt-8 grid grid-cols-2 gap-8 text-xs">
              <div>
                <div className="w-48 border-b border-slate-400 mb-2"></div>
                <strong className="text-slate-900 block font-bold">Prof. Dr. Tariq Mahmood</strong>
                <span className="text-slate-500 text-[11px] block">Director Human Resources / Registrar</span>
                <span className="text-slate-400 text-[10px] block">{instituteName}</span>
              </div>

              <div>
                <div className="w-48 border-b border-slate-400 mb-2"></div>
                <strong className="text-slate-900 block font-bold">Candidate Acceptance</strong>
                <span className="text-slate-500 text-[11px] block">Signature: ______________________</span>
                <span className="text-slate-400 text-[10px] block">Date: _________________________</span>
              </div>
            </div>

            <div className="pt-4 border-t border-slate-100 text-[9px] text-slate-400 text-center">
              Official Institutional Document • Reference Code: {refNo} • EIMS HR Directorate
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default AppointmentLetterModal
