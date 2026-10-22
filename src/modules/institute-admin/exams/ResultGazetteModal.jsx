// src/modules/institute-admin/exams/ResultGazetteModal.jsx
import React, { useState, useMemo } from 'react'
import { 
  Award, 
  Printer, 
  Download, 
  Users, 
  CheckCircle2, 
  XCircle, 
  TrendingUp, 
  Sparkles, 
  School,
  X,
  ShieldAlert,
  HelpCircle,
  FileText
} from 'lucide-react'
import Modal from '../../../components/common/Modal'
import { 
  calculateClassRanks, 
  computeClassExamStats, 
  exportResultGazetteCSV 
} from './examService'

export const ResultGazetteModal = ({
  isOpen,
  onClose,
  marksheets = [],
  terms = [],
  currentInstitute,
  onAwardGraceMarks = null
}) => {
  const [selectedTerm, setSelectedTerm] = useState('')
  const [selectedClass, setSelectedClass] = useState('All')
  const [statusFilter, setStatusFilter] = useState('ALL') // 'ALL' | 'PASSED' | 'FAILED'
  const [isGraceModalOpen, setIsGraceModalOpen] = useState(false)
  const [selectedStudentForGrace, setSelectedStudentForGrace] = useState(null)
  const [graceSubject, setGraceSubject] = useState('')
  const [graceMarksValue, setGraceMarksValue] = useState(2)
  const [graceReason, setGraceReason] = useState('Awarded as per Academic Council border-case moderation policy.')

  // Unique terms and classes
  const availableTerms = useMemo(() => {
    const set = new Set()
    terms.forEach(t => set.add(t.name))
    marksheets.forEach(m => { if (m.term) set.add(m.term) })
    return Array.from(set)
  }, [terms, marksheets])

  // Auto-select first term if not selected
  const activeTerm = selectedTerm || availableTerms[0] || ''

  const availableClasses = useMemo(() => {
    const set = new Set()
    marksheets.forEach(m => { if (m.className) set.add(m.className) })
    return Array.from(set)
  }, [marksheets])

  // Filter marksheets
  const classMarksheets = useMemo(() => {
    return marksheets.filter(m => {
      const matchTerm = !activeTerm || m.term === activeTerm
      const matchClass = selectedClass === 'All' || m.className === selectedClass
      const matchStatus = statusFilter === 'ALL' || 
        (statusFilter === 'PASSED' && (m.status === 'PASSED' || Number(m.percentage?.replace('%', '')) >= 33)) ||
        (statusFilter === 'FAILED' && (m.status === 'FAILED' || Number(m.percentage?.replace('%', '')) < 33))
      return matchTerm && matchClass && matchStatus
    })
  }, [marksheets, activeTerm, selectedClass, statusFilter])

  // Unique list of subjects in this selection for columns
  const subjectsList = useMemo(() => {
    const set = new Set()
    classMarksheets.forEach(m => {
      if (Array.isArray(m.subjects)) {
        m.subjects.forEach(s => { if (s.name) set.add(s.name) })
      }
    })
    return Array.from(set)
  }, [classMarksheets])

  // Class rankings
  const { ranksMap } = useMemo(() => {
    return calculateClassRanks(classMarksheets)
  }, [classMarksheets])

  // Statistics
  const stats = useMemo(() => {
    return computeClassExamStats(classMarksheets, 33)
  }, [classMarksheets])

  // Top 3 Merit Standings
  const topStandings = useMemo(() => {
    const sorted = [...classMarksheets].sort((a, b) => Number(b.totalObtained || 0) - Number(a.totalObtained || 0))
    return sorted.slice(0, 3)
  }, [classMarksheets])

  // Handle Grace Marks Award
  const handleApplyGraceMarks = () => {
    if (!selectedStudentForGrace || !graceSubject || !onAwardGraceMarks) return
    onAwardGraceMarks({
      marksheetId: selectedStudentForGrace.id,
      subjectName: graceSubject,
      graceMarks: Number(graceMarksValue),
      reason: graceReason
    })
    setIsGraceModalOpen(false)
    setSelectedStudentForGrace(null)
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Official Result Gazette & Merit Standings Register"
      maxWidth="max-w-6xl"
    >
      <div className="space-y-6">
        {/* Print Styles for Official Gazette */}
        <style>{`
          @media print {
            body * {
              visibility: hidden !important;
            }
            #printable-result-gazette, #printable-result-gazette * {
              visibility: visible !important;
            }
            #printable-result-gazette {
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
              size: A4 landscape;
              margin: 8mm;
            }
          }
        `}</style>

        {/* Filter Controls Bar */}
        <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex flex-wrap items-center gap-3">
            {/* Term selector */}
            <div className="flex items-center gap-1.5">
              <span className="font-semibold text-slate-600">Exam Term:</span>
              <select
                value={activeTerm}
                onChange={(e) => setSelectedTerm(e.target.value)}
                className="px-3 py-1.5 text-xs rounded-lg border border-slate-300 bg-white font-medium"
              >
                {availableTerms.map(t => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>
            </div>

            {/* Class selector */}
            <div className="flex items-center gap-1.5">
              <span className="font-semibold text-slate-600">Grade / Class:</span>
              <select
                value={selectedClass}
                onChange={(e) => setSelectedClass(e.target.value)}
                className="px-3 py-1.5 text-xs rounded-lg border border-slate-300 bg-white font-medium"
              >
                <option value="All">All Grades & Classes</option>
                {availableClasses.map(c => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>

            {/* Status filter */}
            <div className="flex items-center gap-1.5">
              <span className="font-semibold text-slate-600">Filter:</span>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-2.5 py-1.5 text-xs rounded-lg border border-slate-300 bg-white font-medium"
              >
                <option value="ALL">All Candidates ({classMarksheets.length})</option>
                <option value="PASSED">Passed Only</option>
                <option value="FAILED">Failed / Compartment</option>
              </select>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => exportResultGazetteCSV(activeTerm, selectedClass, classMarksheets, subjectsList)}
              disabled={classMarksheets.length === 0}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-100 disabled:opacity-40 text-slate-700 font-semibold cursor-pointer"
            >
              <Download className="w-3.5 h-3.5 text-slate-500" />
              <span>Export Gazette CSV</span>
            </button>
            <button
              type="button"
              onClick={() => window.print()}
              disabled={classMarksheets.length === 0}
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-300 text-white font-bold shadow-sm cursor-pointer"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print A4 Landscape Gazette</span>
            </button>
          </div>
        </div>

        {/* Analytics & KPI Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 text-xs">
          <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-2xs">
            <span className="text-[10px] uppercase font-bold text-slate-400 block">Total Appeared</span>
            <span className="text-xl font-black text-slate-900 font-mono mt-0.5 block">{stats.total}</span>
            <span className="text-[10px] text-slate-500 font-medium">Enrolled Candidates</span>
          </div>

          <div className="bg-emerald-50/70 p-3 rounded-xl border border-emerald-200 shadow-2xs">
            <span className="text-[10px] uppercase font-bold text-emerald-800 block">Passed Candidates</span>
            <span className="text-xl font-black text-emerald-700 font-mono mt-0.5 block">{stats.passed}</span>
            <span className="text-[10px] text-emerald-700 font-bold">{stats.passPercentage}% Class Pass Rate</span>
          </div>

          <div className="bg-rose-50/70 p-3 rounded-xl border border-rose-200 shadow-2xs">
            <span className="text-[10px] uppercase font-bold text-rose-800 block">Failed / Compartment</span>
            <span className="text-xl font-black text-rose-700 font-mono mt-0.5 block">{stats.failed}</span>
            <span className="text-[10px] text-rose-600 font-medium">Below 33% Pass Line</span>
          </div>

          <div className="bg-blue-50/70 p-3 rounded-xl border border-blue-200 shadow-2xs">
            <span className="text-[10px] uppercase font-bold text-blue-800 block">Class Average</span>
            <span className="text-xl font-black text-blue-800 font-mono mt-0.5 block">{stats.averageMarks}</span>
            <span className="text-[10px] text-blue-700 font-medium font-mono">{stats.averagePercentage}% Avg Score</span>
          </div>

          <div className="bg-amber-50/70 p-3 rounded-xl border border-amber-200 shadow-2xs">
            <span className="text-[10px] uppercase font-bold text-amber-800 block">Highest Score</span>
            <span className="text-xl font-black text-amber-900 font-mono mt-0.5 block">{stats.highestObtained}</span>
            <span className="text-[10px] text-amber-800 font-bold truncate block">
              {stats.highestStudent?.studentName || 'N/A'}
            </span>
          </div>
        </div>

        {/* Top 3 Positions Podium Cards */}
        {topStandings.length > 0 && (
          <div className="space-y-2">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
              <Award className="w-4 h-4 text-amber-500" /> Class Merit Positions Podium
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {/* 1st Position (Gold) */}
              {topStandings[0] && (
                <div className="p-3.5 bg-gradient-to-r from-amber-100/90 via-amber-50 to-white border-2 border-amber-400 rounded-xl flex items-center justify-between shadow-2xs">
                  <div className="flex items-center gap-2.5">
                    <div className="w-10 h-10 rounded-full bg-amber-500 text-white font-black flex items-center justify-center text-sm shadow-sm">
                      1st
                    </div>
                    <div>
                      <h4 className="font-bold text-slate-900 text-xs">{topStandings[0].studentName}</h4>
                      <p className="text-[11px] text-slate-500 font-mono">{topStandings[0].rollNumber} • {topStandings[0].className}</p>
                    </div>
                  </div>
                  <div className="text-right font-mono">
                    <span className="text-xs font-black text-amber-900 block">{topStandings[0].totalObtained} / {topStandings[0].totalMax}</span>
                    <span className="text-[10px] font-bold text-emerald-700 bg-white px-1.5 py-0.2 rounded border border-amber-300">{topStandings[0].percentage}</span>
                  </div>
                </div>
              )}

              {/* 2nd Position (Silver) */}
              {topStandings[1] && (
                <div className="p-3.5 bg-gradient-to-r from-slate-100 via-slate-50 to-white border border-slate-300 rounded-xl flex items-center justify-between shadow-2xs">
                  <div className="flex items-center gap-2.5">
                    <div className="w-10 h-10 rounded-full bg-slate-400 text-white font-black flex items-center justify-center text-sm shadow-sm">
                      2nd
                    </div>
                    <div>
                      <h4 className="font-bold text-slate-900 text-xs">{topStandings[1].studentName}</h4>
                      <p className="text-[11px] text-slate-500 font-mono">{topStandings[1].rollNumber} • {topStandings[1].className}</p>
                    </div>
                  </div>
                  <div className="text-right font-mono">
                    <span className="text-xs font-black text-slate-800 block">{topStandings[1].totalObtained} / {topStandings[1].totalMax}</span>
                    <span className="text-[10px] font-bold text-blue-700 bg-white px-1.5 py-0.2 rounded border border-slate-200">{topStandings[1].percentage}</span>
                  </div>
                </div>
              )}

              {/* 3rd Position (Bronze) */}
              {topStandings[2] && (
                <div className="p-3.5 bg-gradient-to-r from-amber-50 via-orange-50/50 to-white border border-orange-200 rounded-xl flex items-center justify-between shadow-2xs">
                  <div className="flex items-center gap-2.5">
                    <div className="w-10 h-10 rounded-full bg-orange-600 text-white font-black flex items-center justify-center text-sm shadow-sm">
                      3rd
                    </div>
                    <div>
                      <h4 className="font-bold text-slate-900 text-xs">{topStandings[2].studentName}</h4>
                      <p className="text-[11px] text-slate-500 font-mono">{topStandings[2].rollNumber} • {topStandings[2].className}</p>
                    </div>
                  </div>
                  <div className="text-right font-mono">
                    <span className="text-xs font-black text-orange-900 block">{topStandings[2].totalObtained} / {topStandings[2].totalMax}</span>
                    <span className="text-[10px] font-bold text-indigo-700 bg-white px-1.5 py-0.2 rounded border border-orange-200">{topStandings[2].percentage}</span>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Printable Official Gazette Register */}
        <div id="printable-result-gazette" className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-2xs font-sans text-slate-800">
          {/* Printable Header Letterhead */}
          <div className="p-5 border-b-2 border-slate-900 bg-slate-50 text-center">
            <h2 className="text-base font-black uppercase tracking-wider text-slate-900">
              {currentInstitute?.name || 'CENTRAL HIGH SCHOOL SYSTEM'}
            </h2>
            <h3 className="text-xs font-bold uppercase tracking-widest text-indigo-700 mt-0.5">
              OFFICIAL CONSOLIDATED RESULT GAZETTE • {activeTerm}
            </h3>
            <p className="text-[11px] text-slate-500 font-mono mt-1">
              Class: {selectedClass} • Declaration Date: {new Date().toISOString().split('T')[0]} • Passing Standard: 33%
            </p>
          </div>

          <div className="overflow-x-auto max-h-[50vh]">
            <table className="w-full text-left text-xs min-w-[900px]">
              <thead className="bg-slate-100 text-slate-700 font-bold border-b border-slate-200 sticky top-0 z-10 text-[11px]">
                <tr>
                  <th className="p-2.5 w-14 text-center">Rank</th>
                  <th className="p-2.5 w-24">Roll No</th>
                  <th className="p-2.5">Candidate Name</th>
                  <th className="p-2.5 w-20">Class</th>
                  {subjectsList.map(sub => (
                    <th key={sub} className="p-2 text-center truncate max-w-[80px]" title={sub}>
                      {sub.length > 10 ? `${sub.substring(0, 9)}.` : sub}
                    </th>
                  ))}
                  <th className="p-2.5 text-center font-bold">Obtained</th>
                  <th className="p-2.5 text-center font-bold">Max</th>
                  <th className="p-2.5 text-center font-bold">%</th>
                  <th className="p-2.5 text-center font-bold">Grade</th>
                  <th className="p-2.5 text-center font-bold">Status</th>
                  <th className="p-2.5 text-right no-print">Moderation</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-sans">
                {classMarksheets.length > 0 ? (
                  classMarksheets.map((m, idx) => {
                    const rank = ranksMap[m.id] || (idx + 1)
                    const isPassed = (m.status === 'PASSED') || (Number(m.percentage?.replace('%', '')) >= 33)
                    return (
                      <tr key={m.id} className="hover:bg-slate-50/70 transition-colors">
                        <td className="p-2.5 text-center font-mono font-bold">
                          {rank === 1 ? (
                            <span className="inline-block px-1.5 py-0.2 rounded bg-amber-100 text-amber-900 border border-amber-300 font-black">#1</span>
                          ) : rank === 2 ? (
                            <span className="inline-block px-1.5 py-0.2 rounded bg-slate-200 text-slate-800 font-black">#2</span>
                          ) : rank === 3 ? (
                            <span className="inline-block px-1.5 py-0.2 rounded bg-orange-100 text-orange-900 font-black">#3</span>
                          ) : (
                            <span className="text-slate-500">#{rank}</span>
                          )}
                        </td>
                        <td className="p-2.5 font-mono text-slate-700 font-bold">{m.rollNumber}</td>
                        <td className="p-2.5 font-semibold text-slate-900">
                          {m.studentName}
                          {m.graceMarksAwarded > 0 && (
                            <span className="ml-1 text-[9px] bg-purple-50 text-purple-700 px-1 py-0.2 rounded border border-purple-200" title={`Awarded ${m.graceMarksAwarded} grace marks`}>
                              +{m.graceMarksAwarded} Grace
                            </span>
                          )}
                        </td>
                        <td className="p-2.5 text-slate-600">{m.className}</td>

                        {/* Subject Marks Columns */}
                        {subjectsList.map(subName => {
                          const sub = (m.subjects || []).find(s => s.name?.toLowerCase() === subName.toLowerCase())
                          if (!sub) return <td key={subName} className="p-2 text-center text-slate-300">-</td>
                          if (sub.isAbsent) return <td key={subName} className="p-2 text-center font-mono text-rose-600 font-bold">ABS</td>
                          if (sub.isExempt) return <td key={subName} className="p-2 text-center font-mono text-blue-600 font-bold">EXM</td>
                          return (
                            <td key={subName} className="p-2 text-center font-mono text-slate-800">
                              {sub.obtained}
                            </td>
                          )
                        })}

                        <td className="p-2.5 text-center font-mono font-bold text-slate-900">{m.totalObtained}</td>
                        <td className="p-2.5 text-center font-mono text-slate-500">{m.totalMax}</td>
                        <td className="p-2.5 text-center font-mono font-bold text-slate-800">{m.percentage}</td>
                        <td className="p-2.5 text-center font-bold font-mono text-emerald-700">{m.overallGrade}</td>
                        <td className="p-2.5 text-center">
                          <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                            isPassed 
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                              : 'bg-rose-50 text-rose-700 border border-rose-200'
                          }`}>
                            {isPassed ? 'PASSED' : 'FAILED'}
                          </span>
                        </td>
                        <td className="p-2.5 text-right no-print">
                          {onAwardGraceMarks && (
                            <button
                              type="button"
                              onClick={() => {
                                setSelectedStudentForGrace(m)
                                if (m.subjects && m.subjects.length > 0) {
                                  setGraceSubject(m.subjects[0].name)
                                }
                                setIsGraceModalOpen(true)
                              }}
                              className="px-2 py-1 text-[10px] font-semibold text-purple-700 hover:bg-purple-50 rounded border border-purple-200 cursor-pointer"
                              title="Award border-case moderation grace marks"
                            >
                              Grace Marks
                            </button>
                          )}
                        </td>
                      </tr>
                    )
                  })
                ) : (
                  <tr>
                    <td colSpan={subjectsList.length + 9} className="p-10 text-center text-slate-400">
                      <Award className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                      <p className="font-semibold text-slate-600 text-xs">No Marksheet Records Found for this Selection</p>
                      <p className="text-[11px] text-slate-400 mt-0.5">
                        Record student transcripts or class tabulation to generate this official result gazette.
                      </p>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Printable Gazette Signatures */}
          <div className="p-6 pt-10 grid grid-cols-3 gap-6 text-center text-xs font-semibold text-slate-700 border-t border-slate-200">
            <div>
              <div className="w-40 border-b border-slate-400 mx-auto mb-1"></div>
              <span>Tabulated By (Exam Clerk)</span>
            </div>
            <div>
              <div className="w-40 border-b border-slate-400 mx-auto mb-1"></div>
              <span>Checked & Verified By (HOD)</span>
            </div>
            <div>
              <div className="w-44 border-b-2 border-slate-900 mx-auto mb-1"></div>
              <strong className="text-slate-900">Controller of Examinations / Principal</strong>
            </div>
          </div>
        </div>

        {/* Grace Marks Moderation Modal */}
        {isGraceModalOpen && selectedStudentForGrace && (
          <Modal
            isOpen={isGraceModalOpen}
            onClose={() => setIsGraceModalOpen(false)}
            title="Award Academic Grace Marks (Borderline Moderation)"
            maxWidth="max-w-md"
          >
            <div className="space-y-4 text-xs">
              <div className="p-3 bg-purple-50 border border-purple-200 rounded-lg text-purple-900">
                <p className="font-bold">Student: {selectedStudentForGrace.studentName} ({selectedStudentForGrace.rollNumber})</p>
                <p className="text-[11px] text-purple-700 mt-0.5">Current Total: {selectedStudentForGrace.totalObtained} / {selectedStudentForGrace.totalMax} ({selectedStudentForGrace.percentage})</p>
              </div>

              <div>
                <label className="block font-semibold text-slate-600 uppercase text-[11px] mb-1">Select Subject to Moderate</label>
                <select
                  value={graceSubject}
                  onChange={(e) => setGraceSubject(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 bg-white"
                >
                  {(selectedStudentForGrace.subjects || []).map(s => (
                    <option key={s.name} value={s.name}>{s.name} (Currently {s.obtained}/{s.maxMarks})</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-600 uppercase text-[11px] mb-1">Grace Marks to Add (Max 5)</label>
                <input
                  type="number"
                  min="1"
                  max="5"
                  value={graceMarksValue}
                  onChange={(e) => setGraceMarksValue(Number(e.target.value))}
                  className="w-full px-3 py-2 font-mono font-bold rounded-lg border border-slate-300 bg-white"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-600 uppercase text-[11px] mb-1">Audit Policy Justification</label>
                <textarea
                  rows={2}
                  value={graceReason}
                  onChange={(e) => setGraceReason(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 bg-white"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t">
                <button
                  type="button"
                  onClick={() => setIsGraceModalOpen(false)}
                  className="px-3 py-1.5 text-xs text-slate-600 hover:bg-slate-100 rounded-lg cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleApplyGraceMarks}
                  className="px-4 py-1.5 text-xs font-bold text-white bg-purple-700 hover:bg-purple-800 rounded-lg shadow-sm cursor-pointer"
                >
                  Confirm & Apply Grace Marks
                </button>
              </div>
            </div>
          </Modal>
        )}

        {/* Footer Actions */}
        <div className="flex justify-end pt-2 border-t border-slate-100">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </Modal>
  )
}

export default ResultGazetteModal
