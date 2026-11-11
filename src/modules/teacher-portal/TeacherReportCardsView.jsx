import React, { useState, useMemo } from 'react'
import {
  FileText,
  Award,
  Users,
  Calendar,
  Filter,
  Printer,
  Download,
  Eye,
  Send,
  BookMarked,
  Megaphone,
  CheckSquare,
  FileEdit,
  Wallet,
  X,
  CheckCircle2,
  Sparkles,
  BarChart3
} from 'lucide-react'
import { useAppData } from '../../context/AppDataContext'
import { useToast } from '../../context/ToastContext'

export default function TeacherReportCardsView({
  onBack,
  onOpenModal,
  teacherName = 'Teacher'
}) {
  const { toast } = useToast()

  // Filter States
  const [filterType, setFilterType] = useState('Exam')
  const [selectedExam, setSelectedExam] = useState('')
  const [selectedClass, setSelectedClass] = useState('')
  const [selectedYear, setSelectedYear] = useState('2026')
  const [hasAppliedFilter, setHasAppliedFilter] = useState(false)
  const [viewCardStudent, setViewCardStudent] = useState(null)

  // Students from localStorage
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

  // Filtered Students
  const classStudents = useMemo(() => {
    if (!selectedClass) return []
    if (selectedClass === 'all') return students
    return students.filter((s) => s.className === selectedClass)
  }, [students, selectedClass])

  // Computed report cards with deterministic subjects & grades
  const reportCardsList = useMemo(() => {
    return classStudents.map((s, idx) => {
      const eng = 85 - (idx * 2)
      const math = 90 - (idx * 3)
      const sci = 88 - (idx * 2)
      const urdu = 80 - (idx * 1)
      const isl = 92 - (idx * 1)
      const total = eng + math + sci + urdu + isl
      const percentage = Math.round((total / 500) * 100)
      const grade = percentage >= 90 ? 'A+' : percentage >= 80 ? 'A' : percentage >= 70 ? 'B' : percentage >= 60 ? 'C' : 'D'
      const position = idx + 1

      return {
        ...s,
        exam: selectedExam || 'Mid-Term Examination 2026',
        subjects: [
          { name: 'English', max: 100, obtained: eng, grade: eng >= 80 ? 'A' : 'B' },
          { name: 'Mathematics', max: 100, obtained: math, grade: math >= 80 ? 'A' : 'B' },
          { name: 'Science', max: 100, obtained: sci, grade: sci >= 80 ? 'A' : 'B' },
          { name: 'Urdu', max: 100, obtained: urdu, grade: urdu >= 80 ? 'A' : 'B' },
          { name: 'Islamiyat', max: 100, obtained: isl, grade: 'A+' }
        ],
        totalObtained: total,
        totalMax: 500,
        percentage,
        grade,
        position,
        attendanceRate: 94 - idx,
        remarks: percentage >= 80 ? 'Outstanding academic achievement and behavior.' : 'Good performance with potential for improvement.'
      }
    })
  }, [classStudents, selectedExam])

  const handleApplyFilter = (e) => {
    e.preventDefault()
    if (!selectedExam || !selectedClass) {
      toast?.error?.('Please select both an Exam and a Class.')
      return
    }
    setHasAppliedFilter(true)
    toast?.success?.(`Report cards loaded for ${selectedExam} - ${selectedClass}`)
  }

  return (
    <div className="flex-1 flex flex-col min-h-0 bg-slate-50/70 dark:bg-slate-950">
      {/* ========================================================= */}
      {/* 1. SUB-HEADER BAR */}
      {/* ========================================================= */}
      <div className="bg-white dark:bg-slate-900 border-b border-slate-200/90 dark:border-slate-800 px-4 sm:px-6 py-2.5 flex flex-wrap items-center justify-between gap-3 shrink-0 shadow-2xs">
        <div className="flex flex-col">
          <div className="flex items-center gap-2 font-black text-sm text-slate-900 dark:text-white">
            <FileText className="w-4 h-4 text-sky-600 dark:text-sky-400" />
            <span>Student Report Cards</span>
          </div>
          <button
            onClick={onBack}
            className="text-xs font-semibold text-slate-500 hover:text-sky-600 dark:text-slate-400 dark:hover:text-sky-400 flex items-center gap-1 transition-colors mt-0.5 cursor-pointer text-left w-fit"
          >
            <span>+ Back</span>
          </button>
        </div>

        {/* Top Quick Links Bar */}
        <div className="hidden lg:flex items-center gap-4 text-xs font-semibold text-slate-600 dark:text-slate-300">
          <button
            onClick={() => onOpenModal && onOpenModal('assignments')}
            className="flex items-center gap-1.5 hover:text-purple-600 dark:hover:text-purple-400 transition-colors cursor-pointer"
          >
            <BookMarked className="w-3.5 h-3.5" />
            <span>Assignments</span>
          </button>
          <button
            onClick={() => onOpenModal && onOpenModal('announcements')}
            className="flex items-center gap-1.5 hover:text-purple-600 dark:hover:text-purple-400 transition-colors cursor-pointer"
          >
            <Megaphone className="w-3.5 h-3.5" />
            <span>Announcements</span>
          </button>
          <button
            onClick={() => onOpenModal && onOpenModal('mark-attendance')}
            className="flex items-center gap-1.5 hover:text-purple-600 dark:hover:text-purple-400 transition-colors cursor-pointer"
          >
            <CheckSquare className="w-3.5 h-3.5" />
            <span>Mark Attendance</span>
          </button>
          <button
            onClick={() => onOpenModal && onOpenModal('marks-entry')}
            className="flex items-center gap-1.5 hover:text-purple-600 dark:hover:text-purple-400 transition-colors cursor-pointer"
          >
            <FileEdit className="w-3.5 h-3.5" />
            <span>Marks Entry</span>
          </button>
          <button
            onClick={() => onOpenModal && onOpenModal('timetable')}
            className="flex items-center gap-1.5 hover:text-purple-600 dark:hover:text-purple-400 transition-colors cursor-pointer"
          >
            <Calendar className="w-3.5 h-3.5" />
            <span>Timetables & Exam Schedules</span>
          </button>
          <button
            onClick={() => onOpenModal && onOpenModal('salary')}
            className="flex items-center gap-1.5 hover:text-purple-600 dark:hover:text-purple-400 transition-colors cursor-pointer"
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
        {/* ROW 1: 3 KPI CARDS (Matching Screenshot 3) */}
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
                9
              </h3>
            </div>
          </div>

          {/* Card 3: Students */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-2xl p-5 shadow-xs flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-teal-500 text-white flex items-center justify-center font-bold shadow-sm shadow-teal-500/30">
              <FileText className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                Students
              </p>
              <h3 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
                {hasAppliedFilter ? classStudents.length : '—'}
              </h3>
            </div>
          </div>
        </div>

        {/* ROW 2: FILTER TOOLBAR CARD (Matching Screenshot 3) */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-2xl p-5 sm:p-6 shadow-xs space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-100 dark:border-slate-800">
            <div className="flex items-center gap-2">
              <BarChart3 className="w-4 h-4 text-sky-600" />
              <h3 className="text-base font-extrabold text-slate-900 dark:text-white">
                Student report cards
              </h3>
            </div>

            <div className="flex items-center gap-2 text-xs">
              <span className="font-bold text-slate-500">Year</span>
              <select
                value={selectedYear}
                onChange={(e) => setSelectedYear(e.target.value)}
                className="text-xs font-bold px-3 py-1.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 focus:outline-hidden focus:ring-1 focus:ring-sky-500 cursor-pointer"
              >
                <option value="2026">2026</option>
                <option value="2025">2025</option>
                <option value="2024">2024</option>
              </select>
            </div>
          </div>

          <form onSubmit={handleApplyFilter} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-3 items-end">
            {/* Type */}
            <div className="lg:col-span-3 space-y-1">
              <label className="text-[11px] font-extrabold uppercase text-slate-400 block tracking-wider">
                Type
              </label>
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                className="w-full text-xs font-semibold px-3 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 focus:outline-hidden focus:ring-2 focus:ring-sky-500 cursor-pointer"
              >
                <option value="Exam">Exam</option>
                <option value="Term">Term Assessment</option>
                <option value="Annual">Annual Evaluation</option>
              </select>
            </div>

            {/* Exam */}
            <div className="lg:col-span-4 space-y-1">
              <label className="text-[11px] font-extrabold uppercase text-slate-400 block tracking-wider">
                Exam
              </label>
              <select
                value={selectedExam}
                onChange={(e) => {
                  setSelectedExam(e.target.value)
                  setHasAppliedFilter(false)
                }}
                className="w-full text-xs font-semibold px-3 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 focus:outline-hidden focus:ring-2 focus:ring-sky-500 cursor-pointer"
              >
                <option value="">Select exam</option>
                <option value="Mid-Term Examination 2026">Mid-Term Examination 2026</option>
                <option value="Final Examination 2026">Final Examination 2026</option>
                <option value="First Term Assessment">First Term Assessment</option>
              </select>
            </div>

            {/* Class */}
            <div className="lg:col-span-3 space-y-1">
              <label className="text-[11px] font-extrabold uppercase text-slate-400 block tracking-wider">
                Class
              </label>
              <select
                value={selectedClass}
                onChange={(e) => {
                  setSelectedClass(e.target.value)
                  setHasAppliedFilter(false)
                }}
                className="w-full text-xs font-semibold px-3 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 focus:outline-hidden focus:ring-2 focus:ring-sky-500 cursor-pointer"
              >
                <option value="">Select class</option>
                <option value="all">All Classes</option>
                <option value="Nursery">Nursery</option>
                <option value="Prep">Prep</option>
                <option value="Class 1">Class 1</option>
                <option value="Class 2">Class 2</option>
                <option value="Class 3">Class 3</option>
                <option value="Class 4">Class 4</option>
                <option value="Class 5">Class 5</option>
              </select>
            </div>

            {/* Apply filter button */}
            <div className="lg:col-span-2">
              <button
                type="submit"
                className="w-full bg-sky-600 hover:bg-sky-700 text-white font-bold text-xs px-4 py-2.5 rounded-xl flex items-center justify-center gap-1.5 transition-colors shadow-sm cursor-pointer whitespace-nowrap"
              >
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Apply filter</span>
              </button>
            </div>
          </form>
        </div>

        {/* ROW 3: REPORT CARDS LIST OR PLACEHOLDER */}
        {hasAppliedFilter && (
          <div className="bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-2xl shadow-xs overflow-hidden">
            <div className="px-5 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
              <div>
                <h4 className="text-sm font-extrabold text-slate-900 dark:text-white">
                  Report Cards for {selectedExam} - {selectedClass === 'all' ? 'All Classes' : selectedClass}
                </h4>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  Academic Year: {selectedYear} • {reportCardsList.length} report cards ready
                </p>
              </div>

              <button
                type="button"
                onClick={() => window.print()}
                className="px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-semibold flex items-center gap-1 cursor-pointer"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>Print All Cards</span>
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-50/80 dark:bg-slate-800/60 border-b border-slate-200/80 dark:border-slate-800 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                    <th className="py-3 px-4 w-12 text-center">Pos</th>
                    <th className="py-3 px-4 w-24">Roll No</th>
                    <th className="py-3 px-4">Student Name</th>
                    <th className="py-3 px-4 w-28 text-center">Total Marks</th>
                    <th className="py-3 px-4 w-24 text-center">Percentage</th>
                    <th className="py-3 px-4 w-20 text-center">Grade</th>
                    <th className="py-3 px-4 w-32 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {reportCardsList.length === 0 ? (
                    <tr>
                      <td colSpan="7" className="py-12 text-center text-slate-400">
                        No students enrolled in {selectedClass}.
                      </td>
                    </tr>
                  ) : (
                    reportCardsList.map((card, idx) => (
                      <tr key={card.id || idx} className="hover:bg-slate-50/70 dark:hover:bg-slate-800/40 transition-colors">
                        <td className="py-3.5 px-4 text-center font-bold text-slate-500">#{card.position}</td>
                        <td className="py-3.5 px-4 font-mono font-bold text-sky-600 dark:text-sky-400">{card.rollNo}</td>
                        <td className="py-3.5 px-4 font-extrabold text-slate-900 dark:text-white">
                          {card.name}
                          {card.parentName && <span className="block text-[10px] text-slate-400 font-normal">Guardian: {card.parentName}</span>}
                        </td>
                        <td className="py-3.5 px-4 text-center font-bold text-slate-700 dark:text-slate-300">
                          {card.totalObtained} / {card.totalMax}
                        </td>
                        <td className="py-3.5 px-4 text-center font-black text-emerald-600">
                          {card.percentage}%
                        </td>
                        <td className="py-3.5 px-4 text-center">
                          <span className="inline-block px-2.5 py-0.5 rounded-full text-xs font-black bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300">
                            {card.grade}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 text-right">
                          <button
                            type="button"
                            onClick={() => setViewCardStudent(card)}
                            className="text-xs font-semibold px-2.5 py-1 rounded-md text-sky-700 dark:text-sky-300 border border-sky-300 dark:border-sky-800 hover:bg-sky-50 dark:hover:bg-sky-950/50 transition-colors cursor-pointer"
                          >
                            View Card
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* ========================================================= */}
      {/* MODAL: PRINTABLE STUDENT REPORT CARD */}
      {/* ========================================================= */}
      {viewCardStudent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl w-full max-w-xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
            <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
              <span className="font-extrabold text-sm text-slate-900 dark:text-white">
                Official Student Report Card
              </span>
              <button
                onClick={() => setViewCardStudent(null)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-6 overflow-y-auto space-y-4 text-xs">
              {/* School Header */}
              <div className="text-center pb-3 border-b border-slate-200 dark:border-slate-800 space-y-1">
                <h2 className="text-lg font-black tracking-tight text-slate-900 dark:text-white uppercase">
                  Apex International School
                </h2>
                <p className="text-[11px] text-slate-500 font-semibold uppercase tracking-wider">
                  Academic Progress Report Card • Session {selectedYear}
                </p>
                <p className="text-xs font-bold text-sky-600">{viewCardStudent.exam}</p>
              </div>

              {/* Student Bio Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800">
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">Student</span>
                  <span className="font-extrabold text-slate-900 dark:text-white">{viewCardStudent.name}</span>
                </div>
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">Roll No</span>
                  <span className="font-mono font-bold text-sky-600">{viewCardStudent.rollNo}</span>
                </div>
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">Class</span>
                  <span className="font-bold text-slate-800 dark:text-slate-200">{viewCardStudent.className || 'Nursery'}</span>
                </div>
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">Position</span>
                  <span className="font-bold text-emerald-600">#{viewCardStudent.position} in Class</span>
                </div>
              </div>

              {/* Subject Breakdown Table */}
              <table className="w-full text-left border-collapse border border-slate-200 dark:border-slate-700">
                <thead>
                  <tr className="bg-slate-100 dark:bg-slate-800 font-bold text-[10px] uppercase tracking-wider text-slate-500">
                    <th className="border border-slate-200 dark:border-slate-700 p-2">Subject</th>
                    <th className="border border-slate-200 dark:border-slate-700 p-2 text-center w-20">Max Marks</th>
                    <th className="border border-slate-200 dark:border-slate-700 p-2 text-center w-24">Obtained</th>
                    <th className="border border-slate-200 dark:border-slate-700 p-2 text-center w-16">Grade</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
                  {viewCardStudent.subjects?.map((subj, sIdx) => (
                    <tr key={sIdx}>
                      <td className="border border-slate-200 dark:border-slate-700 p-2 font-bold">{subj.name}</td>
                      <td className="border border-slate-200 dark:border-slate-700 p-2 text-center">{subj.max}</td>
                      <td className="border border-slate-200 dark:border-slate-700 p-2 text-center font-bold text-slate-800 dark:text-slate-200">{subj.obtained}</td>
                      <td className="border border-slate-200 dark:border-slate-700 p-2 text-center font-bold text-sky-600">{subj.grade}</td>
                    </tr>
                  ))}
                  <tr className="bg-slate-50 dark:bg-slate-800/80 font-bold">
                    <td className="border border-slate-200 dark:border-slate-700 p-2 uppercase">Total</td>
                    <td className="border border-slate-200 dark:border-slate-700 p-2 text-center">{viewCardStudent.totalMax}</td>
                    <td className="border border-slate-200 dark:border-slate-700 p-2 text-center text-emerald-600 font-black">{viewCardStudent.totalObtained}</td>
                    <td className="border border-slate-200 dark:border-slate-700 p-2 text-center text-emerald-600 font-black">{viewCardStudent.grade}</td>
                  </tr>
                </tbody>
              </table>

              {/* Remarks & Signatures */}
              <div className="p-3 bg-slate-50 dark:bg-slate-800/40 rounded-xl space-y-1">
                <span className="text-[10px] font-bold uppercase text-slate-400">Class Teacher Remarks:</span>
                <p className="text-slate-700 dark:text-slate-300 italic">{viewCardStudent.remarks}</p>
              </div>

              <div className="pt-6 grid grid-cols-2 text-center text-[10px] text-slate-400">
                <div className="border-t border-slate-300 dark:border-slate-700 pt-1 mx-4">
                  Class Teacher Signature
                </div>
                <div className="border-t border-slate-300 dark:border-slate-700 pt-1 mx-4">
                  Principal Signature
                </div>
              </div>
            </div>

            <div className="p-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-end gap-2">
              <button
                onClick={() => setViewCardStudent(null)}
                className="px-3.5 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-semibold text-xs cursor-pointer"
              >
                Close
              </button>
              <button
                onClick={() => window.print()}
                className="px-4 py-1.5 rounded-xl bg-sky-600 hover:bg-sky-700 text-white font-bold text-xs flex items-center gap-1.5 shadow-sm cursor-pointer"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>Print Official Card</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
