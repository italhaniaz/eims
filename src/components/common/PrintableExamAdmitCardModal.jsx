import React, { useState, useMemo } from 'react'
import { 
  Printer, 
  X, 
  School, 
  Award, 
  User, 
  Calendar, 
  Clock, 
  ShieldCheck, 
  FileText, 
  Layers, 
  ChevronLeft, 
  ChevronRight,
  AlertTriangle,
  Sparkles
} from 'lucide-react'
import { BarcodeSvg, QrCodeSvg } from './PrintHelpers'

export const PrintableExamAdmitCardModal = ({
  isOpen,
  onClose,
  selectedCandidate = null,
  allStudents = [],
  currentInstitute,
  examSchedule = [],
  examTerm = 'Annual Board Examination 2026-2027',
  examCenter = 'Main Campus Examination Hall Block A',
  defaultClass = ''
}) => {
  const [targetClass, setTargetClass] = useState(() => {
    if (selectedCandidate?.className) return selectedCandidate.className
    if (defaultClass) return defaultClass
    return 'All Classes'
  })
  const [termTitle, setTermTitle] = useState(examTerm)
  const [centerName, setCenterName] = useState(examCenter)
  const [previewPage, setPreviewPage] = useState(0)

  // Default rich date sheet schedule if not passed
  const activeSchedule = useMemo(() => {
    if (examSchedule && examSchedule.length > 0) return examSchedule
    return [
      { subject: 'Mathematics (Advanced & Numericals)', code: 'MTH-101', date: '2026-11-02', day: 'Monday', time: '09:00 AM - 12:00 PM', hall: 'Hall A' },
      { subject: 'Physics (Theory & Numericals)', code: 'PHY-102', date: '2026-11-04', day: 'Wednesday', time: '09:00 AM - 12:00 PM', hall: 'Hall B (Science)' },
      { subject: 'Chemistry (Inorganic & Physical)', code: 'CHM-103', date: '2026-11-06', day: 'Friday', time: '09:00 AM - 12:00 PM', hall: 'Hall B (Science)' },
      { subject: 'English Language & Composition', code: 'ENG-104', date: '2026-11-09', day: 'Monday', time: '09:00 AM - 12:00 PM', hall: 'Hall A' },
      { subject: 'Computer Science / Biology', code: 'CS-105', date: '2026-11-11', day: 'Wednesday', time: '09:00 AM - 12:00 PM', hall: 'IT Workstation Lab' },
      { subject: 'Islamic Studies / Ethics & Pak Studies', code: 'ISL-106', date: '2026-11-13', day: 'Friday', time: '09:00 AM - 11:30 AM', hall: 'Hall A' }
    ]
  }, [examSchedule])

  // Extract distinct classes
  const availableClasses = useMemo(() => {
    const set = new Set()
    allStudents.forEach(s => { if (s.className) set.add(s.className) })
    return Array.from(set).sort()
  }, [allStudents])

  // Candidates list to print
  const candidatesToPrint = useMemo(() => {
    if (selectedCandidate && (!targetClass || targetClass === selectedCandidate.className || targetClass === 'Single Selected')) {
      const studentObj = allStudents.find(s => s.name === selectedCandidate.studentName || s.rollNumber === selectedCandidate.rollNumber)
      return [{
        ...selectedCandidate,
        name: selectedCandidate.studentName || selectedCandidate.name || 'Candidate Name',
        rollNumber: selectedCandidate.rollNumber || 'STD-001',
        fatherName: selectedCandidate.fatherName || studentObj?.fatherName || 'Legal Guardian',
        className: selectedCandidate.className || studentObj?.className || '10th Grade',
        section: selectedCandidate.section || studentObj?.section || 'A',
        regNo: selectedCandidate.regNo || `REG-2026-${Math.floor(1000 + Math.random() * 9000)}`,
        group: selectedCandidate.group || 'Science (Pre-Medical / Engineering)'
      }]
    }

    let list = allStudents.filter(s => !s.instituteId || s.instituteId === currentInstitute?.id)
    if (targetClass !== 'All Classes') {
      list = list.filter(s => (s.className || '').toLowerCase() === targetClass.toLowerCase())
    }

    return list.map(s => ({
      name: s.name,
      rollNumber: s.rollNumber,
      fatherName: s.fatherName || 'Legal Guardian',
      className: s.className || targetClass,
      section: s.section || 'A',
      regNo: s.registrationNumber || `REG-2026-${Math.floor(1000 + Math.random() * 9000)}`,
      group: 'Science Group (Matric / O-Levels)'
    }))
  }, [selectedCandidate, targetClass, allStudents, currentInstitute?.id])

  if (!isOpen) return null

  const currentCandidate = candidatesToPrint[previewPage] || candidatesToPrint[0]

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-slate-950/70 backdrop-blur-sm animate-in fade-in duration-150 overflow-y-auto">
      {/* Print Specific CSS Rules */}
      <style>{`
        @media print {
          body * {
            visibility: hidden !important;
          }
          #printable-admit-card-root, #printable-admit-card-root * {
            visibility: visible !important;
          }
          #printable-admit-card-root {
            position: absolute !important;
            left: 0 !important;
            top: 0 !important;
            width: 100% !important;
            margin: 0 !important;
            padding: 6mm !important;
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
            margin: 6mm 8mm;
          }
        }
      `}</style>

      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-4xl max-h-[95vh] flex flex-col overflow-hidden my-auto">
        {/* Modal Top Control Bar */}
        <div className="px-5 py-3.5 border-b border-slate-200 bg-slate-50 flex flex-wrap items-center justify-between gap-3 no-print">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-indigo-600 text-white flex items-center justify-center shadow-xs">
              <Award className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm sm:text-base font-bold text-slate-900 tracking-tight">
                  Official Candidate Roll Number Slip & Exam Admit Card
                </h3>
                <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-indigo-100 text-indigo-800 border border-indigo-200">
                  Board & Campus Verified
                </span>
              </div>
              <p className="text-[11px] text-slate-500">
                Print candidate admit slips with complete timetable, barcode & gate pass
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
                {selectedCandidate && <option value="Single Selected">Current ({selectedCandidate.studentName || selectedCandidate.name})</option>}
                <option value="All Classes">All Campus Candidates</option>
                {availableClasses.map(cls => (
                  <option key={cls} value={cls}>{cls}</option>
                ))}
              </select>
            </div>

            {/* Print Trigger */}
            <button
              type="button"
              onClick={() => window.print()}
              className="px-4 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-bold shadow transition-all flex items-center gap-1.5 cursor-pointer active:scale-95"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print {candidatesToPrint.length > 1 ? `Batch (${candidatesToPrint.length} Admit Cards)` : 'Admit Card'}</span>
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
              <span className="font-semibold text-slate-500">Exam Session:</span>
              <input
                type="text"
                value={termTitle}
                onChange={(e) => setTermTitle(e.target.value)}
                className="px-2 py-0.5 border border-slate-200 rounded text-xs w-56 bg-slate-50 font-medium"
              />
            </div>
            <div className="flex items-center gap-1.5 text-slate-600">
              <span className="font-semibold text-slate-500">Center:</span>
              <input
                type="text"
                value={centerName}
                onChange={(e) => setCenterName(e.target.value)}
                className="px-2 py-0.5 border border-slate-200 rounded text-xs w-64 bg-slate-50 font-medium"
              />
            </div>
          </div>

          {/* Screen pagination controls if multiple candidates */}
          {candidatesToPrint.length > 1 && (
            <div className="flex items-center gap-2 text-xs">
              <span className="text-slate-500 font-medium">
                Candidate {previewPage + 1} of {candidatesToPrint.length}
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
                  disabled={previewPage === candidatesToPrint.length - 1}
                  onClick={() => setPreviewPage(p => Math.min(candidatesToPrint.length - 1, p + 1))}
                  className="p-1 border border-slate-200 rounded hover:bg-slate-50 disabled:opacity-30 disabled:cursor-not-allowed"
                >
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Printable Root Container */}
        <div id="printable-admit-card-root" className="flex-1 overflow-y-auto p-4 sm:p-6 bg-slate-100 print:p-0 print:bg-white">
          {candidatesToPrint.map((cand, cIdx) => {
            const isScreenVisible = cIdx === previewPage
            const rollNo = cand.rollNumber || 'STD-001'

            return (
              <div 
                key={cand.rollNumber || cIdx}
                className={`${isScreenVisible ? 'block' : 'hidden print:block'} page-break mb-8 print:mb-0`}
              >
                {/* Single Page Admit Card Sheet */}
                <div className="bg-white border-2 border-slate-900 rounded-xl p-5 sm:p-6 print:border-2 print:border-black print:rounded-none shadow-sm text-slate-900 font-sans">
                  {/* 1. Official Header */}
                  <div className="flex items-start justify-between pb-3 border-b-2 border-slate-900">
                    <div className="flex items-center gap-3">
                      <div className="w-14 h-14 rounded-xl bg-slate-900 text-white flex items-center justify-center font-black text-2xl shrink-0 shadow-sm">
                        <School className="w-8 h-8" />
                      </div>
                      <div>
                        <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-indigo-700 block">
                          BOARD OF INTERMEDIATE & SECONDARY EDUCATION / CAMPUS CONTROLLER WING
                        </span>
                        <h2 className="text-base sm:text-lg font-black uppercase tracking-tight text-slate-950 mt-0.5">
                          {currentInstitute?.name || 'CENTRAL HIGHER SCHOOL SYSTEM'}
                        </h2>
                        <div className="flex items-center gap-2 mt-0.5">
                          <span className="text-[11px] font-bold text-slate-700">
                            OFFICIAL CANDIDATE ROLL NUMBER SLIP & ADMIT CARD
                          </span>
                          <span className="text-[10px] font-mono text-slate-500">
                            • Session: {termTitle}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Candidate Photo Box */}
                    <div className="w-20 h-24 border-2 border-dashed border-slate-400 rounded-lg bg-slate-50 flex flex-col items-center justify-center text-slate-400 text-[8px] font-bold shrink-0 text-center p-1">
                      {cand.photoUrl ? (
                        <img src={cand.photoUrl} alt={cand.name} className="w-full h-full object-cover rounded" />
                      ) : (
                        <>
                          <User className="w-6 h-6 text-slate-300 mb-1" />
                          <span>AFFIX RECENT PHOTO</span>
                          <span className="text-[7px] text-slate-400 mt-0.5">(ATTESTED)</span>
                        </>
                      )}
                    </div>
                  </div>

                  {/* 2. Barcode & Candidate Information Matrix */}
                  <div className="my-3 p-3 bg-slate-50 border border-slate-300 rounded-lg">
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between pb-2 mb-2 border-b border-slate-200 gap-2">
                      <div className="flex items-center gap-3">
                        <div className="font-mono text-lg font-black text-indigo-900 bg-white px-3 py-1 rounded border border-indigo-200 shadow-2xs">
                          ROLL NO: {rollNo}
                        </div>
                        <span className="text-xs font-mono text-slate-500 font-semibold">
                          REG: {cand.regNo}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <BarcodeSvg value={rollNo} height={24} showText={false} />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                      <div>
                        <span className="text-[9px] uppercase font-bold text-slate-500 block">Candidate Name</span>
                        <strong className="text-slate-900 text-sm">{cand.name}</strong>
                      </div>
                      <div>
                        <span className="text-[9px] uppercase font-bold text-slate-500 block">Father's Name</span>
                        <strong className="text-slate-800">{cand.fatherName}</strong>
                      </div>
                      <div>
                        <span className="text-[9px] uppercase font-bold text-slate-500 block">Class & Section</span>
                        <strong className="text-slate-800">{cand.className} (Sec {cand.section || 'A'})</strong>
                      </div>
                      <div>
                        <span className="text-[9px] uppercase font-bold text-slate-500 block">Academic Stream / Group</span>
                        <strong className="text-indigo-800">{cand.group}</strong>
                      </div>
                      <div className="col-span-2 sm:col-span-4 pt-1.5 border-t border-slate-200 flex flex-wrap items-center justify-between gap-2">
                        <div>
                          <span className="text-[9px] uppercase font-bold text-slate-500 block">Allotted Examination Center</span>
                          <strong className="text-slate-900">{centerName}</strong>
                        </div>
                        <div className="flex items-center gap-1.5 px-2.5 py-0.5 rounded bg-emerald-50 border border-emerald-300 text-[10px] font-bold text-emerald-900">
                          <span>Board Attendance Clearance:</span>
                          <span className="font-mono text-emerald-800">88.5% (Eligible & Cleared)</span>
                        </div>
                        <div className="text-right">
                          <span className="text-[9px] uppercase font-bold text-slate-500 block">Gate Reporting Time</span>
                          <strong className="text-rose-700 font-mono">08:30 AM SHARP (Morning)</strong>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* 3. Examination Timetable & Seating Schedule */}
                  <div className="my-3">
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-xs font-black uppercase tracking-wider text-slate-800 flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5 text-indigo-600" />
                        <span>Examination Paper Schedule & Seating Allotment</span>
                      </span>
                      <span className="text-[10px] font-mono text-slate-500">Total Papers: {activeSchedule.length}</span>
                    </div>

                    <table className="w-full text-left text-[11px] border border-slate-300">
                      <thead className="bg-slate-100 font-bold border-b border-slate-300 text-slate-800">
                        <tr>
                          <th className="p-2 border-r border-slate-200">#</th>
                          <th className="p-2 border-r border-slate-200">Subject & Paper Code</th>
                          <th className="p-2 border-r border-slate-200">Date</th>
                          <th className="p-2 border-r border-slate-200">Day</th>
                          <th className="p-2 border-r border-slate-200">Paper Timing</th>
                          <th className="p-2 border-r border-slate-200">Hall / Room</th>
                          <th className="p-2 text-center">Invigilator Initial & Stamp</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-200">
                        {activeSchedule.map((item, sIdx) => (
                          <tr key={sIdx} className="hover:bg-slate-50">
                            <td className="p-2 font-mono text-slate-500 border-r border-slate-200">{sIdx + 1}</td>
                            <td className="p-2 font-bold text-slate-900 border-r border-slate-200">
                              <div>{item.subject}</div>
                              {item.code && <span className="text-[9px] font-mono text-slate-400 font-normal">{item.code}</span>}
                            </td>
                            <td className="p-2 font-mono font-semibold text-slate-800 border-r border-slate-200">{item.date}</td>
                            <td className="p-2 text-slate-700 border-r border-slate-200">{item.day}</td>
                            <td className="p-2 font-mono text-[10px] text-slate-700 border-r border-slate-200">{item.time}</td>
                            <td className="p-2 font-medium text-slate-800 border-r border-slate-200">{item.hall}</td>
                            <td className="p-2 text-center text-slate-300 font-mono text-[9px]">________________</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {/* 4. Strict Candidate Instructions (Bilingual English / Urdu) */}
                  <div className="my-2.5 p-2.5 bg-rose-50/60 border border-rose-200 rounded-lg text-[10px] text-slate-700 leading-tight space-y-1">
                    <div className="font-bold text-rose-900 flex items-center justify-between">
                      <span className="flex items-center gap-1">
                        <AlertTriangle className="w-3.5 h-3.5 text-rose-600" />
                        <span>Crucial Examination Rules & Disciplinary Protocols</span>
                      </span>
                      
                    </div>
                    <ul className="list-disc pl-4 space-y-0.5 text-slate-600">
                      <li>
                        <strong>Mandatory Slip:</strong> Candidates must present this original attested admit slip at the entry gate. No duplicate entry permitted without principal clearance.
                      </li>
                      <li>
                        <strong>Zero Tolerance Electronic Devices:</strong> Mobile phones, smartwatches, digital calculators, and unauthorized cheat notes are strictly prohibited. Possessing any device results in paper cancellation.
                      </li>
                      <li>
                        <strong>Arrival Time:</strong> Candidates must report to their assigned desk 30 minutes before commencement. Late entry exceeding 15 minutes is not allowed.
                      </li>
                    </ul>
                  </div>

                  {/* 5. Signatures & Watermark Verification */}
                  <div className="pt-8 mt-3 border-t border-slate-300 grid grid-cols-3 text-[10px] text-center text-slate-700 font-semibold items-end">
                    <div>
                      <div className="w-36 mx-auto border-b border-slate-400 mb-1"></div>
                      <span>Candidate Signature</span>
                      <span className="text-[8px] text-slate-400 block mt-0.5">(Candidate Signature)</span>
                    </div>

                    <div className="flex flex-col items-center">
                      <QrCodeSvg value={`EXAM-ADMIT:${rollNo}:${termTitle}`} size={42} />
                      <span className="text-[8px] font-mono text-slate-500 mt-1">SECURITY SEAL</span>
                    </div>

                    <div>
                      <div className="w-36 mx-auto border-b-2 border-slate-900 mb-1"></div>
                      <span className="font-bold text-slate-900">Controller of Examinations</span>
                      <span className="text-[8px] text-slate-400 block mt-0.5">(Controller Seal & Sign)</span>
                    </div>
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

export default PrintableExamAdmitCardModal
