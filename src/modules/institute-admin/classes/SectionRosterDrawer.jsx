import React, { useState, useMemo } from 'react'
import { 
  X, 
  Users, 
  Printer, 
  Download, 
  ArrowRightLeft, 
  Search, 
  CheckSquare, 
  Square, 
  Sparkles, 
  AlertCircle, 
  CheckCircle2, 
  User, 
  Phone, 
  DoorOpen, 
  Clock, 
  GraduationCap,
  Layers
} from 'lucide-react'
import Modal from '../../../components/common/Modal'

export const SectionRosterDrawer = ({
  isOpen,
  onClose,
  targetClass,
  targetSection,
  allClasses = [],
  students = [],
  currentInstitute,
  onMoveStudent,
  onBulkMoveStudents,
  onAutoDistribute
}) => {
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedStudentIds, setSelectedStudentIds] = useState([])
  const [moveStudentModalTarget, setMoveStudentModalTarget] = useState(null)
  const [destSectionName, setDestSectionName] = useState('')
  const [isBulkMoveOpen, setIsBulkMoveOpen] = useState(false)
  const [bulkDestSectionName, setBulkDestSectionName] = useState('')

  // Enrolled students in this specific class & section
  const sectionStudents = useMemo(() => {
    if (!targetClass || !targetSection) return []
    return students.filter(s => {
      const matchInst = !s.instituteId || s.instituteId === currentInstitute?.id
      if (!matchInst) return false
      const matchClass = (s.className || '').toLowerCase().trim() === (targetClass?.name || '').toLowerCase().trim()
      const matchSec = (s.section || '').toLowerCase().trim() === (targetSection?.name || '').toLowerCase().trim()
      return matchClass && matchSec
    })
  }, [students, targetClass?.name, targetSection?.name, currentInstitute?.id])

  // Filtered students by search
  const filteredStudents = useMemo(() => {
    if (!searchTerm.trim()) return sectionStudents
    const term = searchTerm.toLowerCase()
    return sectionStudents.filter(s => 
      s.name?.toLowerCase().includes(term) ||
      s.rollNumber?.toLowerCase().includes(term) ||
      s.fatherName?.toLowerCase().includes(term) ||
      s.phone?.toLowerCase().includes(term)
    )
  }, [sectionStudents, searchTerm])

  if (!isOpen || !targetClass || !targetSection) return null

  const enrolledCount = sectionStudents.length
  const capacity = Number(targetSection.capacity || 40)
  const seatsLeft = Math.max(0, capacity - enrolledCount)
  const fillPct = Math.min(100, Math.round((enrolledCount / Math.max(1, capacity)) * 100))
  const isFull = enrolledCount >= capacity

  // Sister sections of this class
  const siblingSections = (targetClass.sections || []).filter(s => s.name !== targetSection.name)

  // Multi-select helpers
  const handleSelectAll = (e) => {
    if (e.target.checked) {
      setSelectedStudentIds(filteredStudents.map(s => s.id))
    } else {
      setSelectedStudentIds([])
    }
  }

  const handleToggleSelect = (id) => {
    setSelectedStudentIds(prev => 
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    )
  }

  // Export Roster CSV
  const handleExportCSV = () => {
    if (sectionStudents.length === 0) return
    const headers = ['Roll Number', 'Student Name', 'Gender', 'Father/Guardian', 'Phone', 'Class', 'Section', 'Status']
    const rows = sectionStudents.map(s => [
      `"${s.rollNumber || ''}"`,
      `"${s.name || ''}"`,
      `"${s.gender || ''}"`,
      `"${s.fatherName || ''}"`,
      `"${s.phone || ''}"`,
      `"${targetClass.name}"`,
      `"${targetSection.name}"`,
      `"${s.status || 'Active'}"`
    ])
    const content = [headers.join(','), ...rows.map(r => r.join(','))].join('\n')
    const blob = new Blob([content], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.setAttribute('download', `${targetClass.name}_${targetSection.name}_Roster.csv`)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  // Print Section Roster
  const handlePrint = () => {
    window.print()
  }

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      {/* Print Stylesheet */}
      <style>{`
        @media print {
          body * {
            visibility: hidden !important;
          }
          #printable-section-roster, #printable-section-roster * {
            visibility: visible !important;
          }
          #printable-section-roster {
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
        }
      `}</style>

      <div className="absolute inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-3xl bg-white shadow-2xl flex flex-col border-l border-slate-200 animate-in slide-in-from-right duration-200">
          
          {/* Drawer Header */}
          <div className="p-6 bg-slate-900 text-white relative">
            <button
              onClick={onClose}
              className="absolute top-5 right-5 p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-start gap-3.5 pr-10">
              <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 border border-emerald-400/40 text-emerald-400 flex items-center justify-center font-bold text-lg shrink-0">
                <Users className="w-6 h-6" />
              </div>
              <div>
                <div className="flex items-center gap-2 flex-wrap mb-1">
                  <span className="text-xs font-bold px-2.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-400/30">
                    {targetClass.name}
                  </span>
                  <span className="text-xs font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700">
                    {targetSection.name}
                  </span>
                  {targetSection.badge && targetSection.badge !== 'None' && (
                    <span className="text-xs font-bold px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-400/30">
                      ★ {targetSection.badge}
                    </span>
                  )}
                </div>
                <h2 className="text-xl font-bold tracking-tight text-white">
                  Section Student Roster & Desk Occupancy
                </h2>
                <p className="text-xs text-slate-400 mt-0.5 flex items-center gap-2 flex-wrap">
                  <span>Room: <strong className="text-slate-200">{targetSection.roomNo || 'Room 101'}</strong></span>
                  <span>•</span>
                  <span>Shift: <strong className="text-slate-200">{targetSection.shift || 'Morning'}</strong></span>
                  <span>•</span>
                  <span>In-Charge: <strong className="text-emerald-400">{targetSection.classTeacherName || targetSection.classTeacher || 'Teacher In-Charge'}</strong></span>
                </p>
              </div>
            </div>

            {/* Capacity Meter Bar */}
            <div className="mt-5 p-3.5 rounded-xl bg-slate-800/80 border border-slate-700 space-y-2">
              <div className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-slate-300">Occupancy:</span>
                  <strong className="font-mono text-white text-sm">{enrolledCount} / {capacity} Seats</strong>
                </div>
                <div>
                  {isFull ? (
                    <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-rose-500/20 text-rose-300 border border-rose-500/40">
                      ● Section Full (0 Seats Left)
                    </span>
                  ) : (
                    <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                      ● {seatsLeft} Seat(s) Available
                    </span>
                  )}
                </div>
              </div>
              <div className="w-full bg-slate-700 h-2 rounded-full overflow-hidden">
                <div 
                  className={`h-full rounded-full transition-all duration-300 ${
                    fillPct >= 100 ? 'bg-rose-500' : fillPct >= 80 ? 'bg-amber-400' : 'bg-emerald-500'
                  }`}
                  style={{ width: `${fillPct}%` }}
                />
              </div>
            </div>

            {/* Quick Actions Row */}
            <div className="mt-4 flex items-center gap-2 flex-wrap">
              <button
                onClick={handlePrint}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-colors"
              >
                <Printer className="w-3.5 h-3.5 text-emerald-400" />
                <span>Print Section Roster</span>
              </button>
              <button
                onClick={handleExportCSV}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-colors"
              >
                <Download className="w-3.5 h-3.5 text-blue-400" />
                <span>Export CSV</span>
              </button>
              {siblingSections.length > 0 && (
                <button
                  onClick={() => onAutoDistribute(targetClass.id)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-colors ml-auto"
                  title="Balance student count across all sections of this class"
                >
                  <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                  <span>Auto-Balance Sections</span>
                </button>
              )}
            </div>
          </div>

          {/* Search & Bulk Bar */}
          <div className="p-4 bg-slate-50 border-b border-slate-200 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search by student name or roll number..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-3.5 py-1.5 text-xs rounded-lg border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
              />
            </div>

            {selectedStudentIds.length > 0 && (
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200">
                  {selectedStudentIds.length} Selected
                </span>
                <button
                  onClick={() => setIsBulkMoveOpen(true)}
                  className="px-3 py-1 bg-slate-900 text-white rounded-lg text-xs font-bold hover:bg-slate-800 transition-colors flex items-center gap-1.5 shadow-sm"
                >
                  <ArrowRightLeft className="w-3.5 h-3.5" />
                  <span>Transfer Selected</span>
                </button>
              </div>
            )}
          </div>

          {/* Printable & Scrollable Student Table */}
          <div id="printable-section-roster" className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
            
            {/* Print Letterhead Header (Visible only when printed) */}
            <div className="hidden print:block text-center border-b pb-4 mb-4">
              <h1 className="text-lg font-black uppercase text-slate-900">
                {currentInstitute?.name || 'CENTRAL HIGH SCHOOL'}
              </h1>
              <h2 className="text-sm font-bold text-emerald-700">
                Official Classroom Roster • {targetClass.name} ({targetSection.name})
              </h2>
              <p className="text-xs text-slate-500">
                Room: {targetSection.roomNo} • In-Charge: {targetSection.classTeacherName || 'Class Teacher'} • Total: {enrolledCount} Students
              </p>
            </div>

            {filteredStudents.length > 0 ? (
              <div className="border border-slate-200 rounded-xl overflow-hidden bg-white shadow-2xs">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold uppercase tracking-wider">
                    <tr>
                      <th className="p-3 w-8 text-center no-print">
                        <input
                          type="checkbox"
                          checked={filteredStudents.length > 0 && selectedStudentIds.length === filteredStudents.length}
                          onChange={handleSelectAll}
                          className="rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
                        />
                      </th>
                      <th className="p-3">Roll No</th>
                      <th className="p-3">Student Name</th>
                      <th className="p-3">Guardian & Contact</th>
                      <th className="p-3">Status</th>
                      <th className="p-3 text-right no-print">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filteredStudents.map((st) => {
                      const isSelected = selectedStudentIds.includes(st.id)
                      return (
                        <tr key={st.id} className={`hover:bg-slate-50/80 transition-colors ${isSelected ? 'bg-emerald-50/30' : ''}`}>
                          <td className="p-3 text-center no-print">
                            <input
                              type="checkbox"
                              checked={isSelected}
                              onChange={() => handleToggleSelect(st.id)}
                              className="rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
                            />
                          </td>
                          <td className="p-3 font-mono font-bold text-slate-700">
                            {st.rollNumber || '—'}
                          </td>
                          <td className="p-3">
                            <div className="flex items-center gap-2">
                              <div className="w-7 h-7 rounded-lg bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold text-[11px] shrink-0">
                                {st.name?.charAt(0) || 'S'}
                              </div>
                              <div>
                                <strong className="text-slate-900 block">{st.name}</strong>
                                <span className="text-[10px] text-slate-400 capitalize">{st.gender || 'Student'}</span>
                              </div>
                            </div>
                          </td>
                          <td className="p-3">
                            <div>
                              <span className="text-slate-700 font-medium block">{st.fatherName || 'Guardian'}</span>
                              <span className="text-[10px] text-slate-400 font-mono">{st.phone || '—'}</span>
                            </div>
                          </td>
                          <td className="p-3">
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                              Active
                            </span>
                          </td>
                          <td className="p-3 text-right no-print">
                            {siblingSections.length > 0 && (
                              <button
                                onClick={() => {
                                  setMoveStudentModalTarget(st)
                                  setDestSectionName(siblingSections[0]?.name || '')
                                }}
                                className="px-2.5 py-1 text-[11px] font-bold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 rounded-lg transition-colors inline-flex items-center gap-1"
                                title="Move student to another section"
                              >
                                <ArrowRightLeft className="w-3 h-3" />
                                <span>Move</span>
                              </button>
                            )}
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="p-12 text-center border-2 border-dashed border-slate-200 rounded-2xl bg-slate-50/50">
                <Users className="w-10 h-10 text-slate-300 mx-auto mb-2" />
                <h4 className="font-bold text-slate-700 text-sm">No Students Enrolled in this Section</h4>
                <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
                  Admit new students through Student Admissions or transfer students from another section.
                </p>
              </div>
            )}
          </div>

          {/* Drawer Footer */}
          <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
            <span className="text-xs text-slate-500 font-mono">
              {enrolledCount} Enrolled • {seatsLeft} Open Seats
            </span>
            <button
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-200 bg-slate-100 rounded-xl transition-colors"
            >
              Close Roster
            </button>
          </div>
        </div>
      </div>

      {/* Single Student Move Modal */}
      {moveStudentModalTarget && (
        <Modal
          isOpen={Boolean(moveStudentModalTarget)}
          onClose={() => setMoveStudentModalTarget(null)}
          title={`Transfer ${moveStudentModalTarget.name} to another section`}
          maxWidth="max-w-md"
        >
          <div className="space-y-4">
            <p className="text-xs text-slate-600">
              Select destination section for <strong className="text-slate-900">{moveStudentModalTarget.name}</strong> ({moveStudentModalTarget.rollNumber}):
            </p>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">Destination Section</label>
              <select
                value={destSectionName}
                onChange={(e) => setDestSectionName(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white text-xs font-bold"
              >
                {siblingSections.map(sec => (
                  <option key={sec.id} value={sec.name}>
                    {sec.name} (Room {sec.roomNo || '101'})
                  </option>
                ))}
              </select>
            </div>

            <div className="flex justify-end gap-2.5 pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setMoveStudentModalTarget(null)}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  onMoveStudent(moveStudentModalTarget.id, targetClass.name, destSectionName)
                  setMoveStudentModalTarget(null)
                }}
                className="px-5 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg shadow-sm"
              >
                Confirm Transfer
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* Bulk Move Modal */}
      {isBulkMoveOpen && (
        <Modal
          isOpen={isBulkMoveOpen}
          onClose={() => setIsBulkMoveOpen(false)}
          title={`Transfer ${selectedStudentIds.length} Selected Students`}
          maxWidth="max-w-md"
        >
          <div className="space-y-4">
            <p className="text-xs text-slate-600">
              Transfer all {selectedStudentIds.length} selected students from <strong className="text-slate-900">{targetSection.name}</strong> to:
            </p>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">Destination Section</label>
              <select
                value={bulkDestSectionName || siblingSections[0]?.name || ''}
                onChange={(e) => setBulkDestSectionName(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white text-xs font-bold"
              >
                {siblingSections.map(sec => (
                  <option key={sec.id} value={sec.name}>
                    {sec.name} (Room {sec.roomNo || '101'})
                  </option>
                ))}
              </select>
            </div>

            <div className="flex justify-end gap-2.5 pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setIsBulkMoveOpen(false)}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  const targetSec = bulkDestSectionName || siblingSections[0]?.name
                  onBulkMoveStudents(selectedStudentIds, targetClass.name, targetSec)
                  setSelectedStudentIds([])
                  setIsBulkMoveOpen(false)
                }}
                className="px-5 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg shadow-sm"
              >
                Transfer {selectedStudentIds.length} Students
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  )
}

export default SectionRosterDrawer
