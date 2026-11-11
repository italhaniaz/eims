import React, { useState, useMemo } from 'react'
import {
  FileText,
  Building2,
  Send,
  Users,
  Calendar,
  AlertTriangle,
  UserX,
  Printer,
  Download,
  CheckCircle2,
  BookMarked,
  Megaphone,
  CheckSquare,
  FileEdit,
  Wallet,
  Info
} from 'lucide-react'
import { useToast } from '../../context/ToastContext'

export default function TeacherAttendanceReportsView({
  onBack,
  onOpenModal,
  subReportType = 'student-attendance', // 'student-attendance' | 'consecutive-absences' | 'low-attendance'
  onSelectSubReport,
  teacherName = 'Teacher'
}) {
  const { toast } = useToast()

  // Active sub-report mode
  const activeTab = subReportType

  // Low Attendance specific state (for Screenshot 1)
  const [selectedMonth, setSelectedMonth] = useState('November 2026')
  const [selectedClass, setSelectedClass] = useState('All Classes')
  const [selectedStudent, setSelectedStudent] = useState('')
  const [hasAppliedLowAttendance, setHasAppliedLowAttendance] = useState(false)

  // General Report specific state (for Screenshot 2)
  const [reportClass, setReportClass] = useState('')
  const [hasLoadedReport, setHasLoadedReport] = useState(false)

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

  // Class Students for general report
  const classStudents = useMemo(() => {
    if (!reportClass) return []
    if (reportClass === 'all') return students
    return students.filter((s) => s.className === reportClass)
  }, [students, reportClass])

  // Computed report data
  const reportStudents = useMemo(() => {
    return classStudents.map((s, idx) => {
      const baseDays = 22
      const presentDays = Math.max(14, baseDays - ((idx * 3) % 8))
      const absentDays = baseDays - presentDays - (idx % 2 === 0 ? 1 : 0)
      const leaveDays = Math.max(0, baseDays - presentDays - absentDays)
      const attendancePercent = Math.round((presentDays / baseDays) * 100)
      const isConsecutiveAbsent = idx === 3 || absentDays >= 4
      const isLowAttendance = attendancePercent < 75

      return {
        ...s,
        totalDays: baseDays,
        presentDays,
        absentDays,
        leaveDays,
        attendancePercent,
        isConsecutiveAbsent,
        isLowAttendance
      }
    }).filter((s) => {
      if (activeTab === 'consecutive-absences') return s.isConsecutiveAbsent
      return true
    })
  }, [classStudents, activeTab])

  // Handle Load Reports (for general student attendance)
  const handleLoadReports = (e) => {
    e.preventDefault()
    if (!reportClass) {
      toast?.error?.('Please select a class first.')
      return
    }
    setHasLoadedReport(true)
    toast?.success?.(`Loaded reports for ${reportClass === 'all' ? 'All Classes' : reportClass}`)
  }

  // Handle Low Attendance Apply Filters
  const handleApplyLowAttendanceFilters = (e) => {
    e.preventDefault()
    setHasAppliedLowAttendance(true)
    toast?.success?.(`Filtered low attendance for ${selectedClass}`)
  }

  return (
    <div className="flex-1 flex flex-col min-h-0 bg-slate-50/70 dark:bg-slate-950">
      {/* ========================================================= */}
      {/* 1. SUB-HEADER BAR */}
      {/* ========================================================= */}
      <div className="bg-white dark:bg-slate-900 border-b border-slate-200/90 dark:border-slate-800 px-4 sm:px-6 py-2.5 flex flex-wrap items-center justify-between gap-3 shrink-0 shadow-2xs">
        <div className="flex flex-col">
          <div className="flex items-center gap-2 font-black text-sm text-slate-900 dark:text-white">
            {activeTab === 'low-attendance' ? (
              <AlertTriangle className="w-4 h-4 text-amber-500" />
            ) : (
              <FileText className="w-4 h-4 text-blue-600 dark:text-blue-400" />
            )}
            <span>
              {activeTab === 'low-attendance'
                ? 'Low Attendance'
                : activeTab === 'consecutive-absences'
                ? 'Consecutive Absences'
                : 'Student Attendance Reports'}
            </span>
          </div>
          <button
            onClick={onBack}
            className="text-xs font-semibold text-slate-500 hover:text-blue-600 dark:text-slate-400 dark:hover:text-blue-400 flex items-center gap-1 transition-colors mt-0.5 cursor-pointer text-left w-fit"
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
        {/* ======================================================= */}
        {/* VIEW A: LOW ATTENDANCE (Exact match to Screenshot 1) */}
        {/* ======================================================= */}
        {activeTab === 'low-attendance' ? (
          <div className="space-y-5">
            {/* ROW 1: 2 TOP KPI CARDS */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Card 1: Eligible defaulters */}
              <div className="bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-2xl p-5 shadow-xs flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-rose-500 text-white flex items-center justify-center font-bold shadow-sm shadow-rose-500/30">
                  <Users className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                    Eligible defaulters
                  </p>
                  <h3 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
                    0
                  </h3>
                  <p className="text-[11px] text-slate-400 dark:text-slate-500">
                    November 2026
                  </p>
                </div>
              </div>

              {/* Card 2: Count Mode */}
              <div className="bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-2xl p-5 shadow-xs flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-teal-500 text-white flex items-center justify-center font-bold shadow-sm shadow-teal-500/30">
                  <Calendar className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                    Count Mode
                  </p>
                  <h3 className="text-lg font-black text-slate-900 dark:text-white tracking-tight">
                    Subject-Wise
                  </h3>
                  <p className="text-[11px] text-slate-400 dark:text-slate-500">
                    0 grace leave(s)
                  </p>
                </div>
              </div>
            </div>

            {/* ROW 2: MAIN CARD */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-2xl p-5 sm:p-6 shadow-xs space-y-4">
              {/* Title */}
              <div className="flex items-center gap-2 pb-1">
                <AlertTriangle className="w-4 h-4 text-amber-500" />
                <h3 className="text-base font-extrabold text-slate-900 dark:text-white">
                  Low Attendance — November 2026
                </h3>
              </div>

              {/* Notice Banner */}
              <div className="p-3.5 rounded-xl bg-cyan-50 dark:bg-cyan-950/40 border border-cyan-200 dark:border-cyan-800/60 text-cyan-900 dark:text-cyan-200 text-xs flex items-center gap-2.5">
                <Info className="w-4 h-4 text-cyan-600 dark:text-cyan-400 shrink-0" />
                <span>
                  Showing attendance defaulters for <strong>your assigned class(es)</strong> only.
                </span>
              </div>

              {/* Filter Form Row */}
              <form onSubmit={handleApplyLowAttendanceFilters} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-3 items-end pt-1">
                {/* Month */}
                <div className="lg:col-span-3 space-y-1">
                  <label className="text-[11px] font-extrabold uppercase text-slate-400 block tracking-wider">
                    Month
                  </label>
                  <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-800 dark:text-slate-200">
                    <input
                      type="text"
                      value={selectedMonth}
                      onChange={(e) => setSelectedMonth(e.target.value)}
                      className="bg-transparent focus:outline-hidden font-semibold flex-1"
                    />
                    <Calendar className="w-3.5 h-3.5 text-slate-400" />
                  </div>
                </div>

                {/* Class */}
                <div className="lg:col-span-3 space-y-1">
                  <label className="text-[11px] font-extrabold uppercase text-slate-400 block tracking-wider">
                    Class
                  </label>
                  <select
                    value={selectedClass}
                    onChange={(e) => setSelectedClass(e.target.value)}
                    className="w-full text-xs font-semibold px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 focus:outline-hidden focus:ring-2 focus:ring-sky-500 cursor-pointer"
                  >
                    <option value="All Classes">All Classes</option>
                    <option value="Nursery">Nursery</option>
                    <option value="Prep">Prep</option>
                    <option value="Class 1">Class 1</option>
                    <option value="Class 2">Class 2</option>
                    <option value="Class 3">Class 3</option>
                    <option value="Class 4">Class 4</option>
                    <option value="Class 5">Class 5</option>
                  </select>
                </div>

                {/* Student (optional) */}
                <div className="lg:col-span-3 space-y-1">
                  <label className="text-[11px] font-extrabold uppercase text-slate-400 block tracking-wider">
                    Student <span className="font-normal text-[10px] text-slate-400">(optional)</span>
                  </label>
                  <select
                    value={selectedStudent}
                    onChange={(e) => setSelectedStudent(e.target.value)}
                    className="w-full text-xs font-semibold px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 focus:outline-hidden focus:ring-2 focus:ring-sky-500 cursor-pointer"
                  >
                    <option value="">Select class first...</option>
                    {students.map((s) => (
                      <option key={s.id} value={s.id}>{s.name} ({s.rollNo})</option>
                    ))}
                  </select>
                </div>

                {/* Apply Filters Button */}
                <div className="lg:col-span-3">
                  <button
                    type="submit"
                    className="w-full bg-sky-600 hover:bg-sky-700 text-white font-bold text-xs px-5 py-2.5 rounded-xl flex items-center justify-center gap-1.5 transition-colors shadow-sm cursor-pointer whitespace-nowrap"
                  >
                    <span>Apply Filters</span>
                  </button>
                </div>
              </form>

              {/* Zero Defaulters Placeholder (Exact match to screenshot 1) */}
              <div className="py-16 flex flex-col items-center justify-center text-center space-y-3">
                <div className="w-14 h-14 rounded-full bg-emerald-500 text-white flex items-center justify-center shadow-lg shadow-emerald-500/25">
                  <CheckCircle2 className="w-8 h-8" />
                </div>
                <div>
                  <h4 className="text-base font-extrabold text-slate-900 dark:text-white">
                    No Attendance Defaulters
                  </h4>
                  <p className="text-xs text-slate-400 mt-1">
                    No students exceeded grace leaves (0) in {selectedMonth}.
                  </p>
                </div>
              </div>
            </div>
          </div>
        ) : (
          /* ======================================================= */
          /* VIEW B: STUDENT ATTENDANCE (Exact match to Screenshot 2) */
          /* ======================================================= */
          <div className="space-y-5">
            <div className="bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-2xl p-5 sm:p-6 shadow-xs space-y-4">
              <div>
                <div className="flex items-center gap-2">
                  <FileText className="w-4 h-4 text-slate-500" />
                  <h3 className="text-base font-extrabold text-slate-900 dark:text-white">
                    {activeTab === 'consecutive-absences' ? 'Consecutive Absences' : 'Student Attendance Reports'}
                  </h3>
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  View and export class attendance by date, student, or subject.
                </p>
              </div>

              {/* Select Class & Load reports */}
              <form onSubmit={handleLoadReports} className="space-y-1">
                <label className="text-[11px] font-extrabold uppercase text-slate-400 dark:text-slate-500 tracking-wider block">
                  SELECT CLASS
                </label>
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                  <div className="flex-1">
                    <select
                      value={reportClass}
                      onChange={(e) => {
                        setReportClass(e.target.value)
                        setHasLoadedReport(false)
                      }}
                      className="w-full text-xs font-semibold px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 focus:outline-hidden focus:ring-2 focus:ring-sky-500 cursor-pointer"
                    >
                      <option value="">Choose a class...</option>
                      <option value="all">All classes</option>
                      <option value="Nursery">Nursery</option>
                      <option value="Prep">Prep</option>
                      <option value="Class 1">Class 1</option>
                      <option value="Class 2">Class 2</option>
                      <option value="Class 3">Class 3</option>
                      <option value="Class 4">Class 4</option>
                      <option value="Class 5">Class 5</option>
                    </select>
                  </div>

                  <button
                    type="submit"
                    className="bg-sky-600 hover:bg-sky-700 text-white font-bold text-xs px-6 py-2.5 rounded-xl flex items-center justify-center gap-2 transition-colors shadow-sm cursor-pointer whitespace-nowrap"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>Load reports</span>
                  </button>
                </div>
              </form>
            </div>

            {/* Empty state or loaded table */}
            {!hasLoadedReport ? (
              <div className="bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-2xl p-16 shadow-xs flex flex-col items-center justify-center text-center space-y-3">
                <div className="w-16 h-16 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-400 dark:text-slate-500">
                  <Building2 className="w-8 h-8" />
                </div>
                <div>
                  <h4 className="text-base font-extrabold text-slate-800 dark:text-white">
                    Select a class to view reports
                  </h4>
                  <p className="text-xs text-slate-400 mt-1">
                    Choose a class above and click Load reports.
                  </p>
                </div>
              </div>
            ) : (
              <div className="bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-2xl shadow-xs overflow-hidden">
                <div className="px-5 py-4 border-b border-slate-100 dark:border-slate-800 flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <h4 className="text-sm font-extrabold text-slate-900 dark:text-white">
                      Class Attendance Register
                    </h4>
                    <p className="text-[11px] text-slate-400 mt-0.5">
                      Class: {reportClass === 'all' ? 'All Classes' : reportClass} • {reportStudents.length} students
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={() => window.print()}
                    className="px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-semibold flex items-center gap-1 cursor-pointer"
                  >
                    <Printer className="w-3.5 h-3.5" />
                    <span>Print Report</span>
                  </button>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="bg-slate-50/80 dark:bg-slate-800/60 border-b border-slate-200/80 dark:border-slate-800 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                        <th className="py-3 px-4 w-12 text-center">#</th>
                        <th className="py-3 px-4 w-28">Roll No</th>
                        <th className="py-3 px-4">Student Name</th>
                        <th className="py-3 px-4 text-center">Present</th>
                        <th className="py-3 px-4 text-center">Absent</th>
                        <th className="py-3 px-4 text-center">Leave</th>
                        <th className="py-3 px-4 text-center">Rate (%)</th>
                        <th className="py-3 px-4 text-right">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                      {reportStudents.length === 0 ? (
                        <tr>
                          <td colSpan="8" className="py-12 text-center text-slate-400">
                            No students match this report.
                          </td>
                        </tr>
                      ) : (
                        reportStudents.map((s, idx) => (
                          <tr key={s.id || idx} className="hover:bg-slate-50/70 dark:hover:bg-slate-800/40 transition-colors">
                            <td className="py-3.5 px-4 text-center font-bold text-slate-400">{idx + 1}</td>
                            <td className="py-3.5 px-4 font-mono font-bold text-sky-600 dark:text-sky-400">{s.rollNo}</td>
                            <td className="py-3.5 px-4 font-extrabold text-slate-900 dark:text-white">{s.name}</td>
                            <td className="py-3.5 px-4 text-center font-bold text-emerald-600">{s.presentDays}</td>
                            <td className="py-3.5 px-4 text-center font-bold text-rose-600">{s.absentDays}</td>
                            <td className="py-3.5 px-4 text-center font-bold text-sky-600">{s.leaveDays}</td>
                            <td className="py-3.5 px-4 text-center font-mono font-bold">
                              <span className={s.attendancePercent < 75 ? 'text-rose-600' : 'text-emerald-600'}>
                                {s.attendancePercent}%
                              </span>
                            </td>
                            <td className="py-3.5 px-4 text-right">
                              {s.attendancePercent >= 75 ? (
                                <span className="inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-700">Good</span>
                              ) : (
                                <span className="inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-rose-100 text-rose-700">Low</span>
                              )}
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
        )}
      </div>
    </div>
  )
}
