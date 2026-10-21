import React, { useState, useMemo } from 'react'
import { 
  Printer, 
  X, 
  School, 
  ShieldCheck, 
  Phone, 
  Calendar, 
  User, 
  ChevronLeft, 
  ChevronRight,
  Sparkles,
  CreditCard,
  Building2
} from 'lucide-react'
import { BarcodeSvg, QrCodeSvg } from '../../../components/common/PrintHelpers'

export const StaffIdCardModal = ({
  isOpen,
  onClose,
  selectedStaff = null,
  allStaff = [],
  currentInstitute
}) => {
  const [viewSide, setViewSide] = useState('both') // 'front' | 'back' | 'both'
  const [targetCategory, setTargetCategory] = useState('All Categories')
  const [previewIndex, setPreviewIndex] = useState(0)
  const [validUntil, setValidUntil] = useState('31 Dec 2027')

  // Filter staff list to print
  const staffToPrint = useMemo(() => {
    if (selectedStaff) {
      return [selectedStaff]
    }
    let list = allStaff.filter(s => !s.instituteId || s.instituteId === currentInstitute?.id)
    if (targetCategory !== 'All Categories') {
      list = list.filter(s => (s.category || 'Teaching') === targetCategory)
    }
    return list.length > 0 ? list : [selectedStaff || allStaff[0]].filter(Boolean)
  }, [selectedStaff, targetCategory, allStaff, currentInstitute?.id])

  if (!isOpen) return null

  const staff = staffToPrint[previewIndex] || staffToPrint[0]
  if (!staff) return null

  const instituteName = currentInstitute?.name || 'CENTRAL MODEL SCHOOL & COLLEGE'
  const instituteCampus = currentInstitute?.campus || 'Main Campus, Lahore'
  const institutePhone = currentInstitute?.phone || '+92 42 35889900'

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-slate-950/70 backdrop-blur-sm animate-in fade-in duration-150 overflow-y-auto">
      {/* Print Specific CSS Rules */}
      <style>{`
        @media print {
          body * {
            visibility: hidden !important;
          }
          #printable-staff-card-root, #printable-staff-card-root * {
            visibility: visible !important;
          }
          #printable-staff-card-root {
            position: absolute !important;
            left: 0 !important;
            top: 0 !important;
            width: 100% !important;
            margin: 0 !important;
            padding: 8mm 6mm !important;
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
            size: A4 portrait;
            margin: 6mm;
          }
        }
      `}</style>

      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-4xl max-h-[95vh] flex flex-col overflow-hidden my-auto">
        {/* Modal Top Control Bar */}
        <div className="px-5 py-3.5 border-b border-slate-200 bg-slate-50 flex flex-wrap items-center justify-between gap-3 no-print">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-600 text-white flex items-center justify-center shadow-sm">
              <CreditCard className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-slate-900 leading-tight">
                Staff Identity Card (PVC CR80 Standard)
              </h2>
              <p className="text-[11px] text-slate-500">
                85.6mm × 53.98mm High-Resolution Security ID with Barcode & QR Verification
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            {/* View Mode Switcher */}
            <div className="bg-slate-200/80 p-0.5 rounded-lg flex items-center text-xs font-semibold">
              <button
                onClick={() => setViewSide('both')}
                className={`px-2.5 py-1 rounded-md transition-all ${
                  viewSide === 'both' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Dual Side
              </button>
              <button
                onClick={() => setViewSide('front')}
                className={`px-2.5 py-1 rounded-md transition-all ${
                  viewSide === 'front' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Front Only
              </button>
              <button
                onClick={() => setViewSide('back')}
                className={`px-2.5 py-1 rounded-md transition-all ${
                  viewSide === 'back' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Back Only
              </button>
            </div>

            <button
              onClick={() => window.print()}
              className="flex items-center gap-1.5 px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold shadow-sm transition-all"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print Card</span>
            </button>

            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-200 rounded-lg transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Modal Body Preview */}
        <div className="flex-1 overflow-y-auto p-6 bg-slate-100 flex flex-col items-center justify-center min-h-[460px]">
          
          <div id="printable-staff-card-root" className="w-full max-w-2xl flex flex-col items-center gap-6">
            
            <div className="flex flex-wrap items-center justify-center gap-6">
              
              {/* FRONT OF CARD */}
              {(viewSide === 'front' || viewSide === 'both') && (
                <div 
                  className="w-[325px] h-[510px] bg-white rounded-2xl shadow-xl border-2 border-slate-300 relative flex flex-col justify-between overflow-hidden select-none"
                  style={{
                    boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)'
                  }}
                >
                  {/* Top Header Wave / Branding */}
                  <div className="bg-gradient-to-r from-emerald-900 via-emerald-800 to-teal-900 text-white pt-5 pb-8 px-4 text-center relative overflow-hidden">
                    <div className="absolute -top-12 -right-12 w-32 h-32 bg-emerald-500/20 rounded-full blur-xl pointer-events-none" />
                    <div className="absolute top-2 left-2 flex items-center gap-1 text-[9px] font-mono text-emerald-300 tracking-wider uppercase font-bold">
                      <School className="w-3 h-3 text-emerald-400" />
                      <span>OFFICIAL STAFF PASS</span>
                    </div>

                    <h3 className="text-xs font-black uppercase tracking-wider text-emerald-200 mt-2 truncate">
                      {instituteName}
                    </h3>
                    <p className="text-[10px] text-emerald-300/80 tracking-wide font-medium">
                      {instituteCampus}
                    </p>
                  </div>

                  {/* Photo Avatar overlapping header */}
                  <div className="-mt-12 flex justify-center z-10">
                    <div className="w-24 h-24 rounded-2xl bg-white p-1 border-2 border-emerald-500 shadow-md">
                      <div className="w-full h-full rounded-xl bg-slate-100 overflow-hidden flex items-center justify-center font-bold text-2xl text-emerald-800">
                        {staff.photoUrl ? (
                          <img src={staff.photoUrl} alt={staff.name} className="w-full h-full object-cover" />
                        ) : (
                          staff.name?.charAt(0) || 'F'
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Faculty Member Details */}
                  <div className="px-5 pt-2 pb-1 text-center flex-1 flex flex-col justify-center">
                    <h2 className="text-base font-black text-slate-900 tracking-tight leading-tight">
                      {staff.name}
                    </h2>
                    <p className="text-xs font-bold text-emerald-700 mt-0.5">
                      {staff.designation || 'Faculty Member'}
                    </p>
                    <p className="text-[11px] text-slate-500 font-medium">
                      {staff.department || 'General'} Department
                    </p>

                    {/* Employee ID Badge */}
                    <div className="my-2.5 inline-flex items-center justify-center gap-1.5 mx-auto">
                      <span className="font-mono text-xs font-black px-3 py-1 rounded-md bg-emerald-50 text-emerald-900 border border-emerald-200 uppercase tracking-wider">
                        ID: {staff.empId}
                      </span>
                    </div>

                    {/* Meta Fields Table */}
                    <div className="grid grid-cols-2 gap-2 text-left bg-slate-50 p-2.5 rounded-xl border border-slate-200 text-[10px]">
                      <div>
                        <span className="text-slate-400 block font-medium">Category:</span>
                        <strong className="text-slate-800">{staff.category || 'Teaching'}</strong>
                      </div>
                      <div>
                        <span className="text-slate-400 block font-medium">Blood Group:</span>
                        <strong className="text-rose-600 font-mono font-bold">{staff.bloodGroup || '—'}</strong>
                      </div>
                      <div>
                        <span className="text-slate-400 block font-medium">Phone:</span>
                        <strong className="text-slate-800 font-mono">{staff.phone || '—'}</strong>
                      </div>
                      <div>
                        <span className="text-slate-400 block font-medium">Valid Until:</span>
                        <strong className="text-slate-800 font-mono">{validUntil}</strong>
                      </div>
                    </div>
                  </div>

                  {/* Bottom Barcode & Strip */}
                  <div className="px-4 pb-3 pt-1 flex flex-col items-center bg-white border-t border-slate-100">
                    <BarcodeSvg value={staff.empId || 'EMP-001'} height={32} showText={false} />
                    <span className="font-mono text-[9px] text-slate-400 font-semibold tracking-widest mt-0.5">
                      *{staff.empId || 'EMP-001'}*
                    </span>
                  </div>

                  {/* Card Bottom Color Band */}
                  <div className="h-2 bg-gradient-to-r from-emerald-600 via-teal-500 to-emerald-700 w-full" />
                </div>
              )}

              {/* BACK OF CARD */}
              {(viewSide === 'back' || viewSide === 'both') && (
                <div 
                  className="w-[325px] h-[510px] bg-white rounded-2xl shadow-xl border-2 border-slate-300 relative flex flex-col justify-between overflow-hidden select-none p-5 text-center"
                  style={{
                    boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)'
                  }}
                >
                  {/* Top Bar */}
                  <div className="border-b border-slate-200 pb-2">
                    <span className="text-[10px] font-black uppercase tracking-wider text-slate-800 block">
                      Terms of Card Issuance
                    </span>
                    <span className="text-[9px] text-slate-400">Institutional Property & Security Pass</span>
                  </div>

                  {/* Terms */}
                  <div className="text-[9.5px] text-slate-600 text-left space-y-1.5 leading-relaxed bg-slate-50 p-3 rounded-xl border border-slate-200 my-2">
                    <p>1. This card must be visibly displayed by faculty/staff members on campus premises at all times.</p>
                    <p>2. Non-transferable. Misuse is subject to institutional disciplinary action.</p>
                    <p>3. If lost or damaged, report immediately to the Registrar / Human Resources office.</p>
                    <p>4. Finder please return to the administrative office or call <strong className="text-slate-800">{institutePhone}</strong>.</p>
                  </div>

                  {/* Emergency & CNIC */}
                  <div className="grid grid-cols-2 gap-2 text-left bg-slate-50 p-2.5 rounded-xl border border-slate-200 text-[10px]">
                    <div>
                      <span className="text-slate-400 block font-medium">National CNIC:</span>
                      <strong className="text-slate-800 font-mono font-medium">{staff.cnic || '—'}</strong>
                    </div>
                    <div>
                      <span className="text-slate-400 block font-medium">Emergency Call:</span>
                      <strong className="text-rose-700 font-mono font-bold">{staff.emergencyPhone || staff.phone || '—'}</strong>
                    </div>
                  </div>

                  {/* QR Code Verification */}
                  <div className="flex flex-col items-center justify-center my-2">
                    <QrCodeSvg value={`VERIFY:STAFF:${staff.empId}:${staff.cnic || ''}:${instituteName}`} size={75} />
                    <span className="text-[8.5px] text-slate-400 font-mono mt-1">Scan for Digital Verification</span>
                  </div>

                  {/* Signature block */}
                  <div className="pt-2 border-t border-slate-200 flex items-end justify-between text-[9px] text-slate-500">
                    <div className="text-left">
                      <span className="font-mono text-slate-400 block text-[8px]">ISSUED BY:</span>
                      <strong className="text-slate-700 font-semibold">{instituteName}</strong>
                    </div>
                    <div className="text-right">
                      <div className="w-20 border-b border-slate-400 mb-1"></div>
                      <span className="font-semibold text-slate-700">Authorized Signature</span>
                    </div>
                  </div>
                </div>
              )}

            </div>
          </div>

          {/* Stepper if printing multiple */}
          {staffToPrint.length > 1 && (
            <div className="mt-4 flex items-center gap-3 bg-white px-4 py-2 rounded-xl border border-slate-200 text-xs text-slate-600 no-print">
              <button
                onClick={() => setPreviewIndex(prev => Math.max(0, prev - 1))}
                disabled={previewIndex === 0}
                className="p-1 rounded hover:bg-slate-100 disabled:opacity-40"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <span>
                Staff Member <strong className="text-slate-800">{previewIndex + 1}</strong> of <strong className="text-slate-800">{staffToPrint.length}</strong>
              </span>
              <button
                onClick={() => setPreviewIndex(prev => Math.min(staffToPrint.length - 1, prev + 1))}
                disabled={previewIndex === staffToPrint.length - 1}
                className="p-1 rounded hover:bg-slate-100 disabled:opacity-40"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          )}

        </div>
      </div>
    </div>
  )
}

export default StaffIdCardModal
