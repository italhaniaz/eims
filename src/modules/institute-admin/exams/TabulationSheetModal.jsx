// src/modules/institute-admin/exams/TabulationSheetModal.jsx
import React, { useState, useEffect, useMemo } from 'react'
import { 
  FileSpreadsheet, 
  Check, 
  AlertCircle, 
  User, 
  Sparkles, 
  X, 
  Save, 
  BookOpen, 
  Clock,
  Layers,
  HelpCircle
} from 'lucide-react'
import Modal from '../../../components/common/Modal'
import { calculateGrade } from './examService'

export const TabulationSheetModal = ({
  isOpen,
  onClose,
  students = [],
  classes = [],
  terms = [],
  subjects = [],
  existingMarksheets = [],
  onBulkSaveMarks,
  gradingSettings = null
}) => {
  // Class & Section filters
  const [selectedClass, setSelectedClass] = useState('')
  const [selectedSection, setSelectedSection] = useState('')
  const [selectedTerm, setSelectedTerm] = useState('')
  const [selectedSubject, setSelectedSubject] = useState('')
  const [customSubjectInput, setCustomSubjectInput] = useState('')

  // Max marks config
  const [maxTheory, setMaxTheory] = useState(75)
  const [maxPractical, setMaxPractical] = useState(25)

  // Students roster with their marks state
  // { [studentId]: { theory: number|'', practical: number|'', isAbsent: boolean, isExempt: boolean, remarks: '' } }
  const [rosterMarks, setRosterMarks] = useState({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [saveSuccessMsg, setSaveSuccessMsg] = useState('')

  // Extract available classes
  const classNames = useMemo(() => {
    const set = new Set()
    classes.forEach(c => { if (c.name) set.add(c.name) })
    students.forEach(s => { if (s.className) set.add(s.className) })
    return Array.from(set)
  }, [classes, students])

  // Sections for selected class
  const availableSections = useMemo(() => {
    if (!selectedClass) return []
    const matchedClass = classes.find(c => c.name === selectedClass)
    if (matchedClass && Array.isArray(matchedClass.sections) && matchedClass.sections.length > 0) {
      return matchedClass.sections.map(s => typeof s === 'string' ? s : s.name).filter(Boolean)
    }
    // Fallback from students
    const secSet = new Set(students.filter(s => s.className === selectedClass).map(s => s.section).filter(Boolean))
    return Array.from(secSet)
  }, [classes, students, selectedClass])

  // Filter students by selected class and section
  const enrolledStudents = useMemo(() => {
    if (!selectedClass) return []
    return students.filter(s => {
      const matchClass = s.className === selectedClass
      const matchSection = !selectedSection || s.section === selectedSection
      return matchClass && matchSection
    }).sort((a, b) => (a.rollNumber || '').localeCompare(b.rollNumber || ''))
  }, [students, selectedClass, selectedSection])

  // Available subjects for this class
  const availableSubjects = useMemo(() => {
    const list = new Set()
    // From global subjects register
    subjects.forEach(sub => {
      if (typeof sub === 'string') list.add(sub)
      else if (sub.name) list.add(sub.name)
    })
    // Standard school core subjects fallback
    const defaults = ['Mathematics', 'English Language', 'Urdu', 'Islamiyat', 'General Science', 'Physics', 'Chemistry', 'Biology', 'Computer Science', 'Pakistan Studies']
    defaults.forEach(d => list.add(d))
    return Array.from(list)
  }, [subjects])

  // Initialize or load existing marks when student/subject/term changes
  useEffect(() => {
    if (!selectedClass || !selectedTerm || !selectedSubject) {
      setRosterMarks({})
      return
    }

    const initial = {}
    enrolledStudents.forEach(std => {
      // Find existing marksheet for this student & term
      const existingSheet = existingMarksheets.find(m => 
        (m.studentId === std.id || m.rollNumber === std.rollNumber) && 
        m.term === selectedTerm
      )

      if (existingSheet && Array.isArray(existingSheet.subjects)) {
        const subRecord = existingSheet.subjects.find(s => s.name?.toLowerCase() === selectedSubject.toLowerCase())
        if (subRecord) {
          initial[std.id] = {
            theory: subRecord.theoryMarks !== undefined ? subRecord.theoryMarks : (subRecord.obtained || ''),
            practical: subRecord.practicalMarks !== undefined ? subRecord.practicalMarks : '',
            isAbsent: Boolean(subRecord.isAbsent),
            isExempt: Boolean(subRecord.isExempt),
            remarks: subRecord.remarks || ''
          }
          return
        }
      }

      // Default blank row
      initial[std.id] = {
        theory: '',
        practical: '',
        isAbsent: false,
        isExempt: false,
        remarks: ''
      }
    })

    setRosterMarks(initial)
  }, [enrolledStudents, selectedTerm, selectedSubject, existingMarksheets])

  // Auto-select first term and subject if available
  useEffect(() => {
    if (terms.length > 0 && !selectedTerm) {
      setSelectedTerm(terms[0].name)
    }
    if (availableSubjects.length > 0 && !selectedSubject) {
      setSelectedSubject(availableSubjects[0])
    }
  }, [terms, availableSubjects])

  const handleMarksChange = (studentId, field, value) => {
    setRosterMarks(prev => ({
      ...prev,
      [studentId]: {
        ...prev[studentId],
        [field]: value
      }
    }))
  }

  const handleApplyDefaultMaxMarks = (theoryVal, practicalVal) => {
    setMaxTheory(theoryVal)
    setMaxPractical(practicalVal)
  }

  const calculateStudentRow = (studentId) => {
    const row = rosterMarks[studentId] || {}
    if (row.isAbsent) {
      return { totalObt: 0, totalMax: maxTheory + maxPractical, pct: 0, grade: 'F', status: 'ABSENT' }
    }
    if (row.isExempt) {
      return { totalObt: 0, totalMax: maxTheory + maxPractical, pct: 100, grade: 'EXM', status: 'EXEMPT' }
    }

    const t = Number(row.theory) || 0
    const p = Number(row.practical) || 0
    const totalObt = t + p
    const totalMax = maxTheory + maxPractical
    const pct = totalMax > 0 ? Math.round((totalObt / totalMax) * 100) : 0
    const gradeObj = calculateGrade(pct, gradingSettings)

    return {
      totalObt,
      totalMax,
      pct,
      grade: gradeObj.grade,
      status: pct >= (gradingSettings?.passingPercentage || 33) ? 'PASS' : 'FAIL'
    }
  }

  const handleSaveAll = async (e) => {
    e.preventDefault()
    if (!selectedClass || !selectedTerm || !selectedSubject) {
      alert('Please select Class, Term, and Subject.')
      return
    }

    setIsSubmitting(true)
    try {
      const recordsToUpdate = []

      for (const std of enrolledStudents) {
        const row = rosterMarks[std.id] || {}
        const rowCalc = calculateStudentRow(std.id)

        const subjectEntry = {
          name: selectedSubject,
          maxMarks: maxTheory + maxPractical,
          theoryMarks: row.isAbsent ? 0 : Number(row.theory) || 0,
          practicalMarks: row.isAbsent ? 0 : Number(row.practical) || 0,
          obtained: row.isAbsent ? 0 : rowCalc.totalObt,
          percentage: `${rowCalc.pct}%`,
          grade: rowCalc.grade,
          isAbsent: row.isAbsent,
          isExempt: row.isExempt,
          remarks: row.remarks || ''
        }

        recordsToUpdate.push({
          student: std,
          term: selectedTerm,
          subjectEntry
        })
      }

      await onBulkSaveMarks(recordsToUpdate)
      setSaveSuccessMsg(`Tabulation successfully saved for ${enrolledStudents.length} students in "${selectedSubject}"!`)
      setTimeout(() => setSaveSuccessMsg(''), 4000)
    } catch (err) {
      console.error('Error saving tabulation:', err)
      alert('Failed saving tabulation sheet. Please check console.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Rapid Class Tabulation Sheet (Bulk Marks Entry)"
      maxWidth="max-w-5xl"
    >
      <div className="space-y-4">
        {/* Filter Controls Bar */}
        <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 grid grid-cols-1 sm:grid-cols-4 gap-3 text-xs">
          {/* 1. Class */}
          <div>
            <label className="block text-[11px] font-semibold text-slate-600 uppercase mb-1">1. Class / Grade *</label>
            <select
              value={selectedClass}
              onChange={(e) => {
                setSelectedClass(e.target.value)
                setSelectedSection('')
              }}
              className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 bg-white font-medium"
            >
              <option value="">-- Select Class --</option>
              {classNames.map(c => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>

          {/* 2. Section */}
          <div>
            <label className="block text-[11px] font-semibold text-slate-600 uppercase mb-1">2. Section (Optional)</label>
            <select
              value={selectedSection}
              onChange={(e) => setSelectedSection(e.target.value)}
              className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 bg-white font-medium"
            >
              <option value="">All Sections</option>
              {availableSections.map(s => (
                <option key={s} value={s}>Section {s}</option>
              ))}
            </select>
          </div>

          {/* 3. Term */}
          <div>
            <label className="block text-[11px] font-semibold text-slate-600 uppercase mb-1">3. Examination Term *</label>
            <select
              value={selectedTerm}
              onChange={(e) => setSelectedTerm(e.target.value)}
              className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 bg-white font-medium"
            >
              <option value="">-- Select Term --</option>
              {terms.map(t => (
                <option key={t.id} value={t.name}>{t.name} ({t.session})</option>
              ))}
            </select>
          </div>

          {/* 4. Subject */}
          <div>
            <label className="block text-[11px] font-semibold text-slate-600 uppercase mb-1">4. Subject Module *</label>
            <select
              value={selectedSubject}
              onChange={(e) => setSelectedSubject(e.target.value)}
              className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 bg-white font-medium"
            >
              <option value="">-- Select Subject --</option>
              {availableSubjects.map(sub => (
                <option key={sub} value={sub}>{sub}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Max Marks Preset Controls */}
        <div className="flex flex-wrap items-center justify-between gap-3 bg-indigo-50/60 p-3 rounded-xl border border-indigo-100 text-xs">
          <div className="flex items-center gap-3">
            <span className="font-bold text-indigo-900 flex items-center gap-1">
              <BookOpen className="w-3.5 h-3.5" /> Paper Total:
            </span>
            <div className="flex items-center gap-1.5">
              <span className="text-slate-500 text-[11px]">Max Theory:</span>
              <input
                type="number"
                min="0"
                max="500"
                value={maxTheory}
                onChange={(e) => setMaxTheory(Number(e.target.value))}
                className="w-16 px-2 py-1 text-center font-mono font-bold bg-white border border-indigo-200 rounded text-xs"
              />
            </div>
            <div className="flex items-center gap-1.5">
              <span className="text-slate-500 text-[11px]">Max Practical/Viva:</span>
              <input
                type="number"
                min="0"
                max="100"
                value={maxPractical}
                onChange={(e) => setMaxPractical(Number(e.target.value))}
                className="w-16 px-2 py-1 text-center font-mono font-bold bg-white border border-indigo-200 rounded text-xs"
              />
            </div>
            <span className="font-bold font-mono text-indigo-950 bg-white px-2 py-1 rounded border border-indigo-200">
              Total Max: {maxTheory + maxPractical}
            </span>
          </div>

          {/* Quick Presets */}
          <div className="flex items-center gap-1.5 text-[11px]">
            <span className="text-slate-400">Presets:</span>
            <button
              type="button"
              onClick={() => handleApplyDefaultMaxMarks(100, 0)}
              className="px-2 py-0.5 rounded bg-white hover:bg-indigo-100 text-indigo-800 border border-indigo-200 font-semibold cursor-pointer"
            >
              100 (Theory Only)
            </button>
            <button
              type="button"
              onClick={() => handleApplyDefaultMaxMarks(75, 25)}
              className="px-2 py-0.5 rounded bg-white hover:bg-indigo-100 text-indigo-800 border border-indigo-200 font-semibold cursor-pointer"
            >
              75 + 25 (Science)
            </button>
            <button
              type="button"
              onClick={() => handleApplyDefaultMaxMarks(50, 0)}
              className="px-2 py-0.5 rounded bg-white hover:bg-indigo-100 text-indigo-800 border border-indigo-200 font-semibold cursor-pointer"
            >
              50 (Short Test)
            </button>
          </div>
        </div>

        {/* Success Banner */}
        {saveSuccessMsg && (
          <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs rounded-xl flex items-center gap-2 font-semibold animate-in fade-in">
            <Check className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{saveSuccessMsg}</span>
          </div>
        )}

        {/* Tabulation Grid Table */}
        <div className="border border-slate-200 rounded-xl overflow-hidden bg-white shadow-2xs">
          <div className="max-h-[50vh] overflow-y-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-100 text-slate-700 font-bold border-b border-slate-200 sticky top-0 z-10">
                <tr>
                  <th className="p-2.5 w-12 text-center">#</th>
                  <th className="p-2.5">Roll No & Student Name</th>
                  <th className="p-2.5 w-28 text-center">Theory ({maxTheory})</th>
                  {maxPractical > 0 && (
                    <th className="p-2.5 w-28 text-center">Practical ({maxPractical})</th>
                  )}
                  <th className="p-2.5 w-24 text-center">Total ({maxTheory + maxPractical})</th>
                  <th className="p-2.5 w-20 text-center">Grade</th>
                  <th className="p-2.5 w-20 text-center">Status</th>
                  <th className="p-2.5 w-24 text-center">Flags</th>
                  <th className="p-2.5">Teacher Observation</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-sans">
                {enrolledStudents.length > 0 ? (
                  enrolledStudents.map((std, idx) => {
                    const row = rosterMarks[std.id] || {}
                    const rowCalc = calculateStudentRow(std.id)
                    return (
                      <tr key={std.id} className="hover:bg-slate-50/70 transition-colors">
                        <td className="p-2.5 text-center text-slate-400 font-mono">{idx + 1}</td>
                        <td className="p-2.5 font-medium text-slate-800">
                          <div className="flex items-center gap-2">
                            <span className="font-mono text-[11px] font-bold text-indigo-700 bg-indigo-50 px-1.5 py-0.5 rounded">
                              {std.rollNumber || `STD-${idx + 1}`}
                            </span>
                            <span className="font-semibold text-slate-900">{std.name}</span>
                            {std.section && (
                              <span className="text-[10px] text-slate-400">({std.section})</span>
                            )}
                          </div>
                        </td>

                        {/* Theory input */}
                        <td className="p-2 text-center">
                          <input
                            type="number"
                            min="0"
                            max={maxTheory}
                            disabled={row.isAbsent || row.isExempt}
                            value={row.theory !== undefined ? row.theory : ''}
                            onChange={(e) => handleMarksChange(std.id, 'theory', e.target.value)}
                            placeholder="0"
                            className="w-20 px-2 py-1 text-center font-mono font-bold border border-slate-300 rounded bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:bg-slate-100 disabled:text-slate-400"
                          />
                        </td>

                        {/* Practical input */}
                        {maxPractical > 0 && (
                          <td className="p-2 text-center">
                            <input
                              type="number"
                              min="0"
                              max={maxPractical}
                              disabled={row.isAbsent || row.isExempt}
                              value={row.practical !== undefined ? row.practical : ''}
                              onChange={(e) => handleMarksChange(std.id, 'practical', e.target.value)}
                              placeholder="0"
                              className="w-20 px-2 py-1 text-center font-mono font-bold border border-slate-300 rounded bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:bg-slate-100 disabled:text-slate-400"
                            />
                          </td>
                        )}

                        {/* Computed Total */}
                        <td className="p-2.5 text-center font-mono font-bold text-slate-900 bg-slate-50/50">
                          {row.isAbsent ? '0' : row.isExempt ? 'EXM' : rowCalc.totalObt}
                          <span className="text-[10px] text-slate-400 block font-normal">
                            {rowCalc.pct}%
                          </span>
                        </td>

                        {/* Grade */}
                        <td className="p-2.5 text-center">
                          <span className={`inline-block px-2 py-0.5 rounded text-[11px] font-bold font-mono ${
                            rowCalc.grade.startsWith('A') 
                              ? 'bg-emerald-100 text-emerald-800'
                              : rowCalc.grade === 'F'
                              ? 'bg-rose-100 text-rose-800'
                              : 'bg-blue-100 text-blue-800'
                          }`}>
                            {rowCalc.grade}
                          </span>
                        </td>

                        {/* Status */}
                        <td className="p-2.5 text-center">
                          <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded uppercase ${
                            rowCalc.status === 'PASS' 
                              ? 'text-emerald-700 bg-emerald-50' 
                              : rowCalc.status === 'ABSENT'
                              ? 'text-rose-700 bg-rose-50'
                              : 'text-amber-700 bg-amber-50'
                          }`}>
                            {rowCalc.status}
                          </span>
                        </td>

                        {/* Flags: Absent / Exempt */}
                        <td className="p-2 text-center">
                          <div className="flex items-center justify-center gap-2 text-[10px]">
                            <label className="flex items-center gap-1 cursor-pointer" title="Mark Absent">
                              <input
                                type="checkbox"
                                checked={Boolean(row.isAbsent)}
                                onChange={(e) => handleMarksChange(std.id, 'isAbsent', e.target.checked)}
                                className="rounded text-rose-600 focus:ring-rose-500"
                              />
                              <span className={row.isAbsent ? 'font-bold text-rose-700' : 'text-slate-400'}>Abs</span>
                            </label>
                            <label className="flex items-center gap-1 cursor-pointer" title="Exempted on medical grounds">
                              <input
                                type="checkbox"
                                checked={Boolean(row.isExempt)}
                                onChange={(e) => handleMarksChange(std.id, 'isExempt', e.target.checked)}
                                className="rounded text-blue-600 focus:ring-blue-500"
                              />
                              <span className={row.isExempt ? 'font-bold text-blue-700' : 'text-slate-400'}>Exm</span>
                            </label>
                          </div>
                        </td>

                        {/* Teacher Remarks */}
                        <td className="p-2">
                          <input
                            type="text"
                            value={row.remarks || ''}
                            onChange={(e) => handleMarksChange(std.id, 'remarks', e.target.value)}
                            placeholder="Optional note..."
                            className="w-full px-2 py-1 text-[11px] border border-slate-200 rounded bg-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
                          />
                        </td>
                      </tr>
                    )
                  })
                ) : (
                  <tr>
                    <td colSpan={maxPractical > 0 ? 9 : 8} className="p-10 text-center text-slate-400">
                      <FileSpreadsheet className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                      <p className="font-semibold text-slate-600 text-xs">
                        {!selectedClass 
                          ? 'Please select a Class and Subject from the dropdown above to load the student tabulation roster.' 
                          : 'No enrolled students found in this class/section. Admit students first.'}
                      </p>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-3 border-t border-slate-200">
          <div className="text-xs text-slate-500 flex items-center gap-1.5">
            <HelpCircle className="w-4 h-4 text-slate-400" />
            <span>Marks recorded here automatically compile into each student's official DMC & class merit standings.</span>
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
              disabled={isSubmitting || enrolledStudents.length === 0}
              onClick={handleSaveAll}
              className="flex items-center gap-1.5 px-5 py-2 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-300 disabled:cursor-not-allowed rounded-lg shadow-sm transition-all cursor-pointer"
            >
              <Save className="w-4 h-4" />
              <span>{isSubmitting ? 'Saving Tabulation...' : `Save Class Tabulation (${enrolledStudents.length} Students)`}</span>
            </button>
          </div>
        </div>
      </div>
    </Modal>
  )
}

export default TabulationSheetModal
