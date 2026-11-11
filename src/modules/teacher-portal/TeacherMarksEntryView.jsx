import React, { useState, useMemo } from 'react'
import {
  FileEdit,
  GraduationCap,
  Calendar,
  Layers,
  BookOpen,
  CheckCircle2,
  Save,
  Printer,
  Download,
  BookMarked,
  Megaphone,
  CheckSquare,
  Wallet,
  X,
  Sparkles,
  Search,
  Award
} from 'lucide-react'
import { useAppData } from '../../context/AppDataContext'
import { useToast } from '../../context/ToastContext'

export default function TeacherMarksEntryView({
  onBack,
  onOpenModal,
  teacherName = 'Teacher'
}) {
  const { toast } = useToast()

  // Selected filters
  const [selectedExam, setSelectedExam] = useState('')
  const [selectedClass, setSelectedClass] = useState('')
  const [selectedYear, setSelectedYear] = useState('2026')
  const [isDashboardOpen, setIsDashboardOpen] = useState(false)
  const [selectedSubject, setSelectedSubject] = useState('English')

  // Load students from localStorage
  const students = useMemo(() => {
    try {
      const saved = localStorage.getItem('teacher_portal_students')
      if (saved) {
        const parsed = JSON.parse(saved)
        if (Array.isArray(parsed)) return parsed
      }
    } catch {}
    return []
  }, [])

  // Filter students by selected class
  const classStudents = useMemo(() => {
    if (!selectedClass) return []
    return students.filter((s) => s.className === selectedClass || selectedClass === 'All Classes')
  }, [students, selectedClass])

  // Marks storage key
  const marksKey = `teacher_marks_${selectedExam}_${selectedClass}_${selectedSubject}_${selectedYear}`

  // Marks State (studentId -> { obtainedMarks: number, remarks: string })
  const [marksMap, setMarksMap] = useState(() => {
    try {
      const saved = localStorage.getItem(marksKey)
      if (saved) return JSON.parse(saved)
    } catch {}
    return {}
  })

  // Sync marks whenever exam/class/subject changes
  const handleOpenSubjectDashboard = (e) => {
    e.preventDefault()
    if (!selectedExam || !selectedClass) {
      toast?.error?.('Please select both an Exam and a Class.')
      return
    }
    const currentMarks = (() => {
      try {
        const saved = localStorage.getItem(`teacher_marks_${selectedExam}_${selectedClass}_${selectedSubject}_${selectedYear}`)
        if (saved) return JSON.parse(saved)
      } catch {}
      return {}
    })()
    setMarksMap(currentMarks)
    setIsDashboardOpen(true)
    toast?.success?.(`Opened marks dashboard for ${selectedExam} - ${selectedClass}`)
  }

  // Update student mark
  const handleMarkChange = (studentId, marks) => {
    const val = marks === '' ? '' : Math.min(100, Math.max(0, Number(marks) || 0))
    setMarksMap((prev) => ({
      ...prev,
      [studentId]: {
        ...(prev[studentId] || {}),
        obtainedMarks: val
      }
    }))
  }

  // Update remarks
  const handleRemarksChange = (studentId, remarks) => {
    setMarksMap((prev) => ({
      ...prev,
      [studentId]: {
        ...(prev[studentId] || {}),
        remarks
      }
    }))
  }

  // Save Marks to localStorage
  const handleSaveMarks = () => {
    try {
      localStorage.setItem(marksKey, JSON.stringify(marksMap))
      toast?.success?.('Exam marks saved successfully!')
    } catch {
      toast?.error?.('Failed to save marks.')
    }
  }

  // Calculate Grade from Marks (out of 100)
  const calculateGrade = (score) => {
    if (score === '' || score === undefined || score === null) return '—'
    const num = Number(score)
    if (num >= 90) return { grade: 'A+', color: 'text-emerald-600', status: 'Pass' }
    if (num >= 80) return { grade: 'A', color: 'text-emerald-600', status: 'Pass' }
    if (num >= 70) return { grade: 'B', color: 'text-sky-600', status: 'Pass' }
    if (num >= 60) return { grade: 'C', color: 'text-amber-600', status: 'Pass' }
    if (num >= 50) return { grade: 'D', color: 'text-orange-600', status: 'Pass' }
    return { grade: 'F', color: 'text-rose-600', status: 'Fail' }
  }

  // Seed demo students if none in class
  const handleSeedStudents = () => {
    const placeholders = [
      { id: 'std-1', name: 'Student Alpha', rollNo: '001', className: selectedClass || 'Nursery' },
      { id: 'std-2', name: 'Student Beta', rollNo: '002', className: selectedClass || 'Nursery' },
      { id: 'std-3', name: 'Student Gamma', rollNo: '003', className: selectedClass || 'Nursery' },
      { id: 'std-4', name: 'Student Delta', rollNo: '004', className: selectedClass || 'Nursery' },
      { id: 'std-5', name: 'Student Epsilon', rollNo: '005', className: selectedClass || 'Nursery' }
    ]
    const updated = [...students, ...placeholders]
    try {
      localStorage.setItem('teacher_portal_students', JSON.stringify(updated))
    } catch {}
    toast?.success?.(`Added 5 students to ${selectedClass || 'Nursery'}`)
    window.dispatchEvent(new Event('storage'))
  }

  return (
    <div className="flex-1 flex flex-col min-h-0 bg-slate-50/70 dark:bg-slate-950">
      {/* ========================================================= */}
      {/* 1. SUB-HEADER BAR */}
      {/* ========================================================= */}
      <div className="bg-white dark:bg-slate-900 border-b border-slate-200/90 dark:border-slate-800 px-4 sm:px-6 py-2.5 flex flex-wrap items-center justify-between gap-3 shrink-0 shadow-2xs">
        <div className="flex flex-col">
          <div className="flex items-center gap-2 font-black text-sm text-slate-900 dark:text-white">
            <FileEdit className="w-4 h-4 text-sky-600 dark:text-sky-400" />
            <span>Marks Entry</span>
          </div>
          <button
            onClick={onBack}
            className="text-xs font-semibold text-slate-500 hover:text-sky-600 dark:text-slate-400 dark:hover:text-sky-400 flex items-center gap-1 transition-colors mt-0.5 cursor-pointer text-left w-fit"
          >
            <span>+ Back</span>
          </button>
        </div>

        {/* Top Quick Links Bar (Marks Entry highlighted with blue active pill) */}
        <div className="hidden lg:flex items-center gap-3 text-xs font-semibold text-slate-600 dark:text-slate-300">
          <button
            onClick={() => onOpenModal && onOpenModal('assignments')}
            className="flex items-center gap-1.5 hover:text-purple-600 dark:hover:text-purple-400 transition-colors cursor-pointer px-2 py-1"
          >
            <BookMarked className="w-3.5 h-3.5" />
            <span>Assignments</span>
          </button>
          <button
            onClick={() => onOpenModal && onOpenModal('announcements')}
            className="flex items-center gap-1.5 hover:text-purple-600 dark:hover:text-purple-400 transition-colors cursor-pointer px-2 py-1"
          >
            <Megaphone className="w-3.5 h-3.5" />
            <span>Announcements</span>
          </button>
          <button
            onClick={() => onOpenModal && onOpenModal('mark-attendance')}
            className="flex items-center gap-1.5 hover:text-purple-600 dark:hover:text-purple-400 transition-colors cursor-pointer px-2 py-1"
          >
            <CheckSquare className="w-3.5 h-3.5" />
            <span>Mark Attendance</span>
          </button>
          <div className="flex items-center gap-1.5 text-sky-700 dark:text-sky-300 bg-sky-50 dark:bg-sky-950/60 px-3 py-1.5 rounded-xl border border-sky-200 dark:border-sky-800 font-bold shadow-2xs">
            <FileEdit className="w-3.5 h-3.5 text-sky-600 dark:text-sky-400" />
            <span>Marks Entry</span>
          </div>
          <button
            onClick={() => onOpenModal && onOpenModal('timetable')}
            className="flex items-center gap-1.5 hover:text-purple-600 dark:hover:text-purple-400 transition-colors cursor-pointer px-2 py-1"
          >
            <Calendar className="w-3.5 h-3.5" />
            <span>Timetables & Exam Schedules</span>
          </button>
          <button
            onClick={() => onOpenModal && onOpenModal('salary')}
            className="flex items-center gap-1.5 hover:text-purple-600 dark:hover:text-purple-400 transition-colors cursor-pointer px-2 py-1"
          >
            <Wallet className="w-3.5 h-3.5" />
            <span>My Salary</span>
          </button>
        </div>
      </div>

      {/* ========================================================= */}
      {/* 2. MAIN SCROLL CONTAINER */}
      {/* ========================================================= */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-7 space-y-5">
        {/* ROW 1: 3 KPI CARDS (Matching Screenshot 2) */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {/* Card 1: Exams (2026) */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-2xl p-5 shadow-xs flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-sky-500 text-white flex items-center justify-center font-bold shadow-sm shadow-sky-500/30">
              <Award className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                Exams ({selectedYear})
              </p>
              <h3 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
                4
              </h3>
            </div>
          </div>

          {/* Card 2: Classes */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-2xl p-5 shadow-xs flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-emerald-600 text-white flex items-center justify-center font-bold shadow-sm shadow-emerald-500/30">
              <Users className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                Classes
              </p>
              <h3 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
                1
              </h3>
            </div>
          </div>

          {/* Card 3: Step / Status */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-2xl p-5 shadow-xs flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-teal-500 text-white flex items-center justify-center font-bold shadow-sm shadow-teal-500/30">
              <FileEdit className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                Step
              </p>
              <h3 className="text-sm sm:text-base font-extrabold text-slate-900 dark:text-white tracking-tight">
                {isDashboardOpen ? 'Enter Subject Marks' : 'Select exam & class'}
              </h3>
            </div>
          </div>
        </div>

        {/* ROW 2: MAIN FORM CARD (Matching Screenshot 2) */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-2xl p-5 sm:p-6 shadow-xs space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-100 dark:border-slate-800">
            <div className="flex items-center gap-2">
              <FileEdit className="w-4 h-4 text-slate-500" />
              <h3 className="text-base font-extrabold text-slate-900 dark:text-white">
                Marks Entry
              </h3>
            </div>

            <div className="flex items-center gap-2 text-xs">
              <span className="font-bold text-slate-500">Year</span>
              <select
                value={selectedYear}
                onChange={(e) => setSelectedYear(e.target.value)}
                className="text-xs font-bold px-3 py-1.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 focus:outline-hidden focus:ring-1 focus:ring-sky-500 cursor-pointer"
              >
                <option value="2026">2026 (Current)</option>
                <option value="2025">2025</option>
                <option value="2024">2024</option>
              </select>
            </div>
          </div>

          <p className="text-xs text-slate-500 dark:text-slate-400">
            Select an exam and class to open the subject dashboard and enter marks.
          </p>

          <form onSubmit={handleOpenSubjectDashboard} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Exam Selector */}
              <div className="space-y-1">
                <label className="text-[11px] font-extrabold uppercase text-slate-500 dark:text-slate-400 block tracking-wider flex items-center gap-1.5">
                  <Award className="w-3.5 h-3.5 text-sky-600" />
                  <span>Exam</span>
                </label>
                <select
                  value={selectedExam}
                  onChange={(e) => {
                    setSelectedExam(e.target.value)
                    setIsDashboardOpen(false)
                  }}
                  className="w-full text-xs font-semibold px-3 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 focus:outline-hidden focus:ring-2 focus:ring-sky-500 cursor-pointer"
                >
                  <option value="">— Select exam —</option>
                  <option value="Mid-Term Examination 2026">Mid-Term Examination 2026</option>
                  <option value="Final Examination 2026">Final Examination 2026</option>
                  <option value="First Term Assessment">First Term Assessment</option>
                  <option value="Monthly Assessment (Nov 2026)">Monthly Assessment (Nov 2026)</option>
                </select>
              </div>

              {/* Class Selector */}
              <div className="space-y-1">
                <label className="text-[11px] font-extrabold uppercase text-slate-500 dark:text-slate-400 block tracking-wider flex items-center gap-1.5">
                  <Users className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Class</span>
                </label>
                <select
                  value={selectedClass}
                  onChange={(e) => {
                    setSelectedClass(e.target.value)
                    setIsDashboardOpen(false)
                  }}
                  className="w-full text-xs font-semibold px-3 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 focus:outline-hidden focus:ring-2 focus:ring-sky-500 cursor-pointer"
                >
                  <option value="">— Select class —</option>
                  <option value="Nursery">Nursery</option>
                  <option value="Prep">Prep</option>
                  <option value="Class 1">Class 1</option>
                  <option value="Class 2">Class 2</option>
                  <option value="Class 3">Class 3</option>
                  <option value="Class 4">Class 4</option>
                  <option value="Class 5">Class 5</option>
                </select>
              </div>
            </div>

            <button
              type="submit"
              className="bg-sky-600 hover:bg-sky-700 text-white font-bold text-xs px-5 py-2.5 rounded-xl flex items-center gap-2 transition-colors shadow-sm cursor-pointer"
            >
              <Layers className="w-3.5 h-3.5" />
              <span>Open subject dashboard</span>
            </button>
          </form>
        </div>

        {/* ROW 3: SUBJECT DASHBOARD & GRADING MATRIX (When opened) */}
        {isDashboardOpen && (
          <div className="bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-2xl shadow-xs overflow-hidden space-y-4 p-5 sm:p-6">
            {/* Subject Selector Tabs */}
            <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-100 dark:border-slate-800">
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-xs font-extrabold uppercase text-slate-400 mr-1">SUBJECT:</span>
                {['English', 'Mathematics', 'Science', 'Urdu', 'Islamiyat'].map((subj) => (
                  <button
                    key={subj}
                    type="button"
                    onClick={() => setSelectedSubject(subj)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                      selectedSubject === subj
                        ? 'bg-sky-600 text-white shadow-xs'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
                    }`}
                  >
                    {subj}
                  </button>
                ))}
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleSaveMarks}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs px-3.5 py-1.5 rounded-xl flex items-center gap-1.5 shadow-sm transition-colors cursor-pointer"
                >
                  <Save className="w-3.5 h-3.5" />
                  <span>Save Marks</span>
                </button>
                <button
                  type="button"
                  onClick={() => window.print()}
                  className="bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 text-xs font-semibold px-3 py-1.5 rounded-xl flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>Print Sheet</span>
                </button>
              </div>
            </div>

            {/* Students Grading Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-50/80 dark:bg-slate-800/60 border-b border-slate-200/80 dark:border-slate-800 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                    <th className="py-3 px-4 w-12 text-center">#</th>
                    <th className="py-3 px-4 w-28">Roll No</th>
                    <th className="py-3 px-4">Student Name</th>
                    <th className="py-3 px-4 w-28 text-center">Max Marks</th>
                    <th className="py-3 px-4 w-36 text-center">Obtained Marks</th>
                    <th className="py-3 px-4 w-24 text-center">Grade</th>
                    <th className="py-3 px-4 w-24 text-center">Status</th>
                    <th className="py-3 px-4">Teacher Remarks</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {classStudents.length === 0 ? (
                    <tr>
                      <td colSpan="8" className="py-12 text-center text-slate-400">
                        <div className="flex flex-col items-center justify-center max-w-sm mx-auto space-y-2">
                          <Users className="w-8 h-8 text-slate-300 dark:text-slate-600" />
                          <p className="text-xs font-semibold text-slate-600 dark:text-slate-300">
                            No students enrolled in {selectedClass}
                          </p>
                          <button
                            type="button"
                            onClick={handleSeedStudents}
                            className="bg-sky-600 hover:bg-sky-700 text-white font-bold text-xs px-3.5 py-1.5 rounded-xl transition-colors cursor-pointer flex items-center gap-1.5 shadow-sm mt-2"
                          >
                            <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                            <span>Add Sample Students to {selectedClass}</span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    classStudents.map((student, idx) => {
                      const studentRecord = marksMap[student.id] || {}
                      const obtained = studentRecord.obtainedMarks !== undefined ? studentRecord.obtainedMarks : ''
                      const remarks = studentRecord.remarks || ''
                      const evaluation = calculateGrade(obtained)

                      return (
                        <tr key={student.id || idx} className="hover:bg-slate-50/70 dark:hover:bg-slate-800/40 transition-colors">
                          <td className="py-3.5 px-4 text-center font-bold text-slate-400">{idx + 1}</td>
                          <td className="py-3.5 px-4 font-mono font-bold text-sky-600 dark:text-sky-400">{student.rollNo}</td>
                          <td className="py-3.5 px-4 font-extrabold text-slate-900 dark:text-white">
                            {student.name}
                            {student.parentName && <span className="block text-[10px] text-slate-400 font-normal">Guardian: {student.parentName}</span>}
                          </td>
                          <td className="py-3.5 px-4 text-center font-bold text-slate-500">100</td>
                          <td className="py-3.5 px-4 text-center">
                            <input
                              type="number"
                              min="0"
                              max="100"
                              value={obtained}
                              onChange={(e) => handleMarkChange(student.id, e.target.value)}
                              placeholder="0-100"
                              className="w-20 text-center font-bold px-2 py-1.5 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-sky-500"
                            />
                          </td>
                          <td className="py-3.5 px-4 text-center font-black text-sm">
                            <span className={evaluation.color}>{evaluation.grade}</span>
                          </td>
                          <td className="py-3.5 px-4 text-center">
                            {evaluation.status === 'Pass' ? (
                              <span className="inline-block px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-700">Pass</span>
                            ) : evaluation.status === 'Fail' ? (
                              <span className="inline-block px-2 py-0.5 rounded text-[10px] font-bold bg-rose-100 text-rose-700">Fail</span>
                            ) : (
                              <span className="text-slate-400">—</span>
                            )}
                          </td>
                          <td className="py-3.5 px-4">
                            <input
                              type="text"
                              value={remarks}
                              onChange={(e) => handleRemarksChange(student.id, e.target.value)}
                              placeholder="Remarks (e.g. Excellent progress)..."
                              className="w-full text-xs px-2.5 py-1.5 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 placeholder:text-slate-400 focus:outline-hidden focus:ring-1 focus:ring-sky-500"
                            />
                          </td>
                        </tr>
                      )
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
