import React from 'react'
import { Printer, X, BookOpen, Award, CheckCircle2 } from 'lucide-react'

export const PrintableSyllabusModal = ({ 
  isOpen, 
  onClose, 
  subjects = [], 
  programs = [], 
  departments = [], 
  activeTier = 'all',
  currentInstitute = null 
}) => {
  if (!isOpen) return null

  const handlePrint = () => {
    window.print()
  }

  const progMap = new Map((programs || []).map(p => [p.id, p.name]))
  const deptMap = new Map((departments || []).map(d => [d.id, d.name]))

  const totalCredits = subjects.reduce((sum, s) => sum + (Number(s.credits) || 0), 0)
  const coreCount = subjects.filter(s => (s.type || 'core').toLowerCase() === 'core').length
  const labCount = subjects.filter(s => (s.type || '').toLowerCase() === 'practical' || (Number(s.labHours) || 0) > 0).length

  const tierLabel = 
    activeTier === 'school' ? 'K-12 School Wing' :
    activeTier === 'college' ? 'College Intermediate Wing (HSSC)' :
    activeTier === 'university' ? 'Higher Education & Degree Programs' : 'Comprehensive Campus-Wide'

  const campusName = currentInstitute?.name || 'Educational Institute Management System'
  const campusCode = currentInstitute?.code || 'MAIN-CAMPUS'

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto animate-in fade-in duration-150">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-4xl max-h-[92vh] flex flex-col overflow-hidden my-auto">
        {/* Header bar (Hidden in Print) */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/80 print:hidden">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
              <Printer className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-800">Official Curriculum Directory & Syllabus Gazette</h3>
              <p className="text-xs text-slate-500">A4 Accredited Document for Academic Records & Student Prospectus</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-sm transition-all"
            >
              <Printer className="w-4 h-4" />
              <span>Print / Save PDF</span>
            </button>
            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-slate-600 rounded-xl hover:bg-slate-200 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Paper Area */}
        <div className="p-8 sm:p-12 overflow-y-auto print:p-0 print:overflow-visible">
          {/* Institutional Letterhead */}
          <div className="border-b-2 border-slate-900 pb-5 mb-6 text-center space-y-1">
            <div className="flex items-center justify-center gap-2 font-black text-xl tracking-tight text-slate-950 uppercase">
              <BookOpen className="w-6 h-6 text-blue-700" />
              <span>{campusName}</span>
            </div>
            <div className="text-xs font-semibold text-slate-600 uppercase tracking-widest">
              Directorate of Academics & Curriculum Accreditation • [{campusCode}]
            </div>
            <div className="text-sm font-extrabold text-blue-900 pt-1">
              OFFICIAL ACADEMIC COURSE SPECIFICATIONS GAZETTE
            </div>
            <div className="text-xs text-slate-500">
              Tier: <span className="font-bold text-slate-800">{tierLabel}</span> | Date of Issue: <span className="font-bold text-slate-800">{new Date().toLocaleDateString('en-GB')}</span>
            </div>
          </div>

          {/* KPI Summary strip */}
          <div className="grid grid-cols-4 gap-3 mb-6 p-4 bg-slate-50 border border-slate-200 rounded-xl text-center text-xs">
            <div>
              <span className="text-slate-400 block text-[10px] uppercase font-bold">Total Courses</span>
              <span className="text-lg font-black text-slate-800">{subjects.length}</span>
            </div>
            <div>
              <span className="text-slate-400 block text-[10px] uppercase font-bold">Total Credits</span>
              <span className="text-lg font-black text-blue-600">{totalCredits} Cr.</span>
            </div>
            <div>
              <span className="text-slate-400 block text-[10px] uppercase font-bold">Core / Compulsory</span>
              <span className="text-lg font-black text-emerald-600">{coreCount}</span>
            </div>
            <div>
              <span className="text-slate-400 block text-[10px] uppercase font-bold">Practicals / Labs</span>
              <span className="text-lg font-black text-purple-600">{labCount}</span>
            </div>
          </div>

          {/* Table */}
          <table className="w-full text-left text-xs border border-slate-300 border-collapse mb-8">
            <thead>
              <tr className="bg-slate-100 text-slate-700 uppercase font-bold border-b border-slate-300">
                <th className="p-2.5 border-r border-slate-300 text-center w-12">Sr.</th>
                <th className="p-2.5 border-r border-slate-300 w-24">Code</th>
                <th className="p-2.5 border-r border-slate-300">Course / Subject Title</th>
                <th className="p-2.5 border-r border-slate-300 text-center w-16">Credits</th>
                <th className="p-2.5 border-r border-slate-300 text-center w-20">Theory+Lab</th>
                <th className="p-2.5 border-r border-slate-300 text-center w-16">Marks</th>
                <th className="p-2.5 border-r border-slate-300 text-center w-16">Pass</th>
                <th className="p-2.5">Program / Department</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {subjects.map((sub, idx) => {
                const progName = progMap.get(sub.programId) || 'All Programs'
                const deptName = deptMap.get(sub.departmentId) || 'General'
                return (
                  <tr key={sub.id || idx} className="hover:bg-slate-50">
                    <td className="p-2.5 text-center font-bold text-slate-500 border-r border-slate-200">{idx + 1}</td>
                    <td className="p-2.5 font-mono font-bold text-blue-900 border-r border-slate-200">{sub.code || 'N/A'}</td>
                    <td className="p-2.5 border-r border-slate-200">
                      <div className="font-bold text-slate-900">{sub.name}</div>
                      {sub.description && (
                        <div className="text-[10px] text-slate-500 line-clamp-1">{sub.description}</div>
                      )}
                    </td>
                    <td className="p-2.5 text-center font-bold text-slate-800 border-r border-slate-200">{sub.credits || 3}</td>
                    <td className="p-2.5 text-center text-slate-600 font-mono border-r border-slate-200">
                      {sub.theoryHours || 3}+{sub.labHours || 0}
                    </td>
                    <td className="p-2.5 text-center font-bold text-slate-800 border-r border-slate-200">{sub.totalMarks || 100}</td>
                    <td className="p-2.5 text-center text-emerald-700 font-semibold border-r border-slate-200">{sub.passingMarks || 33}</td>
                    <td className="p-2.5 text-slate-600">
                      <div className="font-semibold text-slate-800">{progName}</div>
                      <div className="text-[10px] text-slate-400">{deptName}</div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>

          {/* Signatures */}
          <div className="grid grid-cols-3 gap-8 pt-10 mt-12 border-t border-slate-200 text-center text-xs">
            <div className="space-y-1">
              <div className="w-36 h-0.5 bg-slate-400 mx-auto mb-2"></div>
              <p className="font-bold text-slate-800">Head of Department</p>
              <p className="text-[10px] text-slate-400">Curriculum Reviewer</p>
            </div>
            <div className="space-y-1">
              <div className="w-36 h-0.5 bg-slate-400 mx-auto mb-2"></div>
              <p className="font-bold text-slate-800">Academic Controller</p>
              <p className="text-[10px] text-slate-400">Board of Studies</p>
            </div>
            <div className="space-y-1">
              <div className="w-36 h-0.5 bg-slate-400 mx-auto mb-2"></div>
              <p className="font-bold text-slate-800">Principal / Dean</p>
              <p className="text-[10px] text-slate-400">Executive Approval Stamp</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default PrintableSyllabusModal
