import React, { useState, useMemo } from 'react'
import { 
  Printer, 
  X, 
  GraduationCap, 
  School, 
  ShieldCheck, 
  QrCode, 
  HeartPulse, 
  Phone, 
  Calendar, 
  User, 
  Layers,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  Grid
} from 'lucide-react'
import { BarcodeSvg, QrCodeSvg } from './PrintHelpers'

export const PrintableStudentIdCardModal = ({
  isOpen,
  onClose,
  selectedStudent = null,
  allStudents = [],
  currentInstitute,
  defaultClass = ''
}) => {
  const [viewSide, setViewSide] = useState('both') // 'front' | 'back' | 'both'
  const [printLayout, setPrintLayout] = useState('sheet') // 'single' | 'sheet' (6 cards per A4 sheet)
  const [targetClass, setTargetClass] = useState(() => {
    if (selectedStudent?.className) return selectedStudent.className
    if (defaultClass) return defaultClass
    return 'All Classes'
  })
  const [academicSession, setAcademicSession] = useState('2026-2027')
  const [previewPage, setPreviewPage] = useState(0)

  // Available classes
  const availableClasses = useMemo(() => {
    const set = new Set()
    allStudents.forEach(s => { if (s.className) set.add(s.className) })
    return Array.from(set).sort()
  }, [allStudents])

  // Filter students to generate cards for
  const studentsToPrint = useMemo(() => {
    if (selectedStudent && (!targetClass || targetClass === selectedStudent.className || targetClass === 'Single Selected')) {
      return [selectedStudent]
    }

    let list = allStudents.filter(s => !s.instituteId || s.instituteId === currentInstitute?.id)
    if (targetClass !== 'All Classes') {
      list = list.filter(s => (s.className || '').toLowerCase() === targetClass.toLowerCase())
    }
    return list.length > 0 ? list : [selectedStudent || allStudents[0]].filter(Boolean)
  }, [selectedStudent, targetClass, allStudents, currentInstitute?.id])

  if (!isOpen) return null

  const currentStudent = studentsToPrint[previewPage] || studentsToPrint[0]

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-slate-950/70 backdrop-blur-sm animate-in fade-in duration-150 overflow-y-auto">
      {/* Print Specific CSS Rules */}
      <style>{`
        @media print {
          body * {
            visibility: hidden !important;
          }
          #printable-id-card-root, #printable-id-card-root * {
            visibility: visible !important;
          }
          #printable-id-card-root {
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

      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-5xl max-h-[95vh] flex flex-col overflow-hidden my-auto">
        {/* Modal Top Control Bar */}
        <div className="px-5 py-3.5 border-b border-slate-200 bg-slate-50 flex flex-wrap items-center justify-between gap-3 no-print">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-indigo-600 text-white flex items-center justify-center shadow-xs">
              <GraduationCap className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm sm:text-base font-bold text-slate-900 tracking-tight">
                  Printable Smart Student ID Card Generator
                </h3>
                <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-indigo-100 text-indigo-800 border border-indigo-200">
                  PVC CR-80 Standard
                </span>
              </div>
              <p className="text-[11px] text-slate-500">
                With vector barcode, QR gate pass verification, and photo dossier
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            {/* Class Selector */}
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
                {selectedStudent && <option value="Single Selected">Current ({selectedStudent.name})</option>}
                <option value="All Classes">All Campus Students</option>
                {availableClasses.map(cls => (
                  <option key={cls} value={cls}>{cls}</option>
                ))}
              </select>
            </div>

            {/* View Mode (Front / Back / Both) */}
            <div className="flex items-center bg-slate-200/80 p-0.5 rounded-lg text-xs">
              <button
                type="button"
                onClick={() => setViewSide('front')}
                className={`px-2.5 py-1 rounded-md font-bold transition-all ${
                  viewSide === 'front' ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Front
              </button>
              <button
                type="button"
                onClick={() => setViewSide('back')}
                className={`px-2.5 py-1 rounded-md font-bold transition-all ${
                  viewSide === 'back' ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Back
              </button>
              <button
                type="button"
                onClick={() => setViewSide('both')}
                className={`px-2.5 py-1 rounded-md font-bold transition-all ${
                  viewSide === 'both' ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Dual Side
              </button>
            </div>

            {/* Print Trigger */}
            <button
              type="button"
              onClick={() => window.print()}
              className="px-4 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-bold shadow transition-all flex items-center gap-1.5 cursor-pointer active:scale-95"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print {studentsToPrint.length > 1 ? `Batch (${studentsToPrint.length} Cards)` : 'ID Card'}</span>
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

        {/* Configuration Micro-Bar */}
        <div className="px-5 py-2 bg-white border-b border-slate-100 flex flex-wrap items-center justify-between gap-3 text-xs no-print">
          <div className="flex items-center gap-4 flex-wrap">
            <div className="flex items-center gap-1.5 text-slate-600">
              <span className="font-semibold text-slate-500">Session:</span>
              <input
                type="text"
                value={academicSession}
                onChange={(e) => setAcademicSession(e.target.value)}
                className="px-2 py-0.5 border border-slate-200 rounded text-xs w-28 bg-slate-50 font-medium"
              />
            </div>
            <div className="flex items-center gap-1.5 text-slate-600">
              <span className="font-semibold text-slate-500">Layout:</span>
              <span className="text-[11px] text-slate-600 font-bold bg-slate-100 px-2 py-0.5 rounded">
                Sheet Grid (Cutting Guides)
              </span>
            </div>
          </div>

          {/* Screen pagination controls if multiple students */}
          {studentsToPrint.length > 1 && (
            <div className="flex items-center gap-2 text-xs">
              <span className="text-slate-500 font-medium">
                Student {previewPage + 1} of {studentsToPrint.length}
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
                  disabled={previewPage === studentsToPrint.length - 1}
                  onClick={() => setPreviewPage(p => Math.min(studentsToPrint.length - 1, p + 1))}
                  className="p-1 border border-slate-200 rounded hover:bg-slate-50 disabled:opacity-30 disabled:cursor-not-allowed"
                >
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Printable Root Container */}
        <div id="printable-id-card-root" className="flex-1 overflow-y-auto p-4 sm:p-6 bg-slate-100 print:p-0 print:bg-white">
          {/* In screen view, show preview of current student. In print view, show all students grid */}
          <div className="print:hidden">
            {currentStudent ? (
              <div className="flex flex-col items-center justify-center py-6 gap-6">
                <div className="flex flex-col md:flex-row items-center justify-center gap-6">
                  {/* Front Card Preview */}
                  {(viewSide === 'front' || viewSide === 'both') && (
                    <CardFront 
                      student={currentStudent} 
                      currentInstitute={currentInstitute} 
                      academicSession={academicSession} 
                    />
                  )}

                  {/* Back Card Preview */}
                  {(viewSide === 'back' || viewSide === 'both') && (
                    <CardBack 
                      student={currentStudent} 
                      currentInstitute={currentInstitute} 
                      academicSession={academicSession} 
                    />
                  )}
                </div>

                <div className="p-3 bg-indigo-50/70 border border-indigo-200/80 rounded-xl text-xs text-indigo-900 flex items-center gap-2 max-w-lg">
                  <Sparkles className="w-4 h-4 text-indigo-600 shrink-0" />
                  <span>
                    <strong>Batch Print Tip:</strong> Clicking "Print Batch ({studentsToPrint.length} Cards)" will arrange all cards in a 2-column printable grid with cutting guides on standard A4 paper.
                  </span>
                </div>
              </div>
            ) : (
              <div className="text-center py-12 text-slate-400">
                No students selected.
              </div>
            )}
          </div>

          {/* Dedicated Print Grid Layout (Renders for window.print()) */}
          <div className="hidden print:grid grid-cols-2 gap-4">
            {studentsToPrint.map((s, idx) => (
              <div key={s.id || idx} className="p-1 border border-dashed border-slate-400 rounded-lg break-inside-avoid">
                <div className="flex flex-col gap-2">
                  <CardFront 
                    student={s} 
                    currentInstitute={currentInstitute} 
                    academicSession={academicSession} 
                  />
                  {viewSide === 'both' && (
                    <CardBack 
                      student={s} 
                      currentInstitute={currentInstitute} 
                      academicSession={academicSession} 
                    />
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

/**
 * Front Side of Student ID Card
 */
const CardFront = ({ student, currentInstitute, academicSession }) => {
  const rollNo = student.rollNumber || 'STD-001'

  return (
    <div className="w-[340px] h-[215px] bg-gradient-to-br from-[#0f172a] via-[#14233c] to-[#0c1f38] text-white rounded-2xl p-3.5 shadow-xl border-2 border-indigo-400/40 relative overflow-hidden flex flex-col justify-between shrink-0 select-none print:shadow-none print:border-slate-800">
      {/* Decorative background geometry */}
      <div className="absolute -top-12 -right-12 w-28 h-28 bg-indigo-500/10 rounded-full blur-xl pointer-events-none"></div>
      <div className="absolute -bottom-8 -left-8 w-24 h-24 bg-blue-500/10 rounded-full blur-xl pointer-events-none"></div>

      {/* 1. Header: School Name & Badge */}
      <div className="flex items-center justify-between pb-2 border-b border-indigo-500/30">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-indigo-600 flex items-center justify-center font-black text-white shrink-0 shadow-xs">
            <School className="w-4 h-4" />
          </div>
          <div className="min-w-0">
            <h4 className="font-black text-[11px] uppercase tracking-tight text-white truncate max-w-[190px]">
              {currentInstitute?.name || 'CENTRAL HIGHER SCHOOL'}
            </h4>
            <span className="text-[8px] font-mono text-indigo-300 uppercase block tracking-wider">
              CAMPUS SMART ID • CODE: {currentInstitute?.code || 'SCH-001'}
            </span>
          </div>
        </div>
        <div className="w-4 h-4 rounded-full bg-emerald-500 animate-pulse shrink-0" title="Active NFC / Smart Chip"></div>
      </div>

      {/* 2. Middle Body: Photo & Student Bio */}
      <div className="flex items-center gap-3 my-1">
        {/* Student Photograph */}
        <div className="w-16 h-18 rounded-xl bg-slate-800 border-2 border-indigo-400 overflow-hidden flex flex-col items-center justify-center font-black text-xl text-indigo-300 shrink-0 shadow-sm relative">
          {student.photoUrl ? (
            <img src={student.photoUrl} alt={student.name} className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-b from-indigo-900 to-slate-900">
              <User className="w-6 h-6 text-indigo-300" />
              <span className="text-[7px] text-indigo-200/80 uppercase font-mono mt-0.5">PHOTO</span>
            </div>
          )}
        </div>

        {/* Bio Details */}
        <div className="min-w-0 flex-1 leading-tight space-y-0.5 text-[10px]">
          <div className="flex items-center justify-between">
            <h5 className="font-black text-xs text-white tracking-wide truncate max-w-[140px]">
              {student.name}
            </h5>
            {student.bloodGroup && (
              <span className="px-1.5 py-0.2 rounded-full font-bold text-[8px] bg-rose-500/20 text-rose-300 border border-rose-500/30 font-mono">
                {student.bloodGroup}
              </span>
            )}
          </div>

          <div className="flex items-center gap-2">
            <span className="text-indigo-300 font-mono font-bold text-[10px]">
              {rollNo}
            </span>
            <span className="text-[9px] text-slate-400">•</span>
            <span className="text-slate-300 font-semibold truncate">
              {student.className} (Sec {student.section || 'A'})
            </span>
          </div>

          <div className="text-[9px] text-slate-400 truncate">
            <span>Father: </span>
            <span className="text-slate-200 font-medium">{student.fatherName || 'Legal Guardian'}</span>
          </div>

          <div className="text-[9px] text-slate-400 flex items-center justify-between pt-0.5">
            <span>Session: <strong className="text-indigo-200 font-mono">{academicSession}</strong></span>
            <span>Emergency: <strong className="text-white font-mono">{student.phone || '0300-1234567'}</strong></span>
          </div>
        </div>
      </div>

      {/* 3. Bottom Strip: Barcode & Principal Signature */}
      <div className="pt-1.5 border-t border-indigo-500/30 flex items-end justify-between">
        <div className="bg-white p-0.5 rounded border border-slate-300">
          <BarcodeSvg value={rollNo} height={18} showText={false} />
        </div>

        <div className="text-right">
          <div className="w-16 border-b border-indigo-300/60 mb-0.5"></div>
          <span className="text-[8px] font-bold text-indigo-300 uppercase tracking-wider block">
            Principal Signature
          </span>
        </div>
      </div>
    </div>
  )
}

/**
 * Back Side of Student ID Card
 */
const CardBack = ({ student, currentInstitute, academicSession }) => {
  const rollNo = student.rollNumber || 'STD-001'

  return (
    <div className="w-[340px] h-[215px] bg-gradient-to-br from-slate-900 to-slate-950 text-white rounded-2xl p-3.5 shadow-xl border-2 border-slate-700/60 relative overflow-hidden flex flex-col justify-between shrink-0 select-none print:shadow-none print:border-slate-800">
      {/* 1. Header: Instructions */}
      <div className="pb-1.5 border-b border-slate-800 flex items-center justify-between">
        <span className="text-[9px] font-black uppercase tracking-wider text-slate-300 flex items-center gap-1">
          <ShieldCheck className="w-3 h-3 text-indigo-400" />
          <span>Official Identity Card Regulations</span>
        </span>
        <span className="text-[8px] font-mono text-slate-500">VALID THRU: 2027</span>
      </div>

      {/* 2. Middle Content: Rules & QR Code */}
      <div className="grid grid-cols-3 gap-2 items-center my-1">
        <div className="col-span-2 text-[8px] text-slate-400 leading-tight space-y-1">
          <p>1. This card is non-transferable and must be displayed on campus premises at all times.</p>
          <p>2. If lost, report immediately to Campus Administration. Replacement charges apply.</p>
          <p>3. If found, please return to: <strong className="text-slate-200">{currentInstitute?.name || 'Main Campus Office'}</strong>.</p>
        </div>

        {/* Vector QR Code for instant gate verification */}
        <div className="flex flex-col items-center justify-center p-1 bg-white rounded-lg border border-slate-300">
          <QrCodeSvg value={`VERIFY-STD:${rollNo}:${currentInstitute?.code || 'SCH-001'}`} size={46} />
          <span className="text-[7px] font-mono text-slate-800 font-bold mt-0.5">SCAN ENTRY</span>
        </div>
      </div>

      {/* 3. Bottom Strip: Campus Emergency Contacts & Seal */}
      <div className="pt-1.5 border-t border-slate-800 text-[8px] text-slate-400 flex items-center justify-between">
        <div>
          <div className="font-bold text-slate-300">{currentInstitute?.address || 'Central Educational District'}</div>
          <div>Helpline: <span className="font-mono text-indigo-300">{currentInstitute?.phone || '+92 42 111-EDU-SMS'}</span></div>
        </div>

        <div className="text-right">
          <span className="px-2 py-0.5 rounded bg-indigo-950 text-indigo-300 border border-indigo-800 font-mono text-[8px] font-bold">
            ACADEMIC SEAL
          </span>
        </div>
      </div>
    </div>
  )
}

export default PrintableStudentIdCardModal
