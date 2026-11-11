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
  FileSpreadsheet,
  CheckCircle2,
  XCircle,
  Clock,
  BookMarked,
  Megaphone,
  CheckSquare,
  FileEdit,
  Wallet,
  ArrowRight
} from 'lucide-react'
import { useAppData } from '../../context/AppDataContext'
import { useToast } from '../../context/ToastContext'

export default function TeacherAttendanceReportsView({
  onBack,
  onOpenModal,
  subReportType = 'student-attendance', // 'student-attendance' | 'consecutive-absences' | 'low-attendance'
  onSelectSubReport,
  teacherName = 'Teacher'
}) {
  const { classes: appClasses = [] } = useAppData()
  const { toast } = useToast()

  // Selected Class & Report Loaded State
  const [selectedClass, setSelectedClass] = useState('')
  const [hasLoaded, setHasLoaded] = useState(false)
  const [activeTab, setActiveTab] = useState(subReportType)

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

  // Class Students
  const classStudents = useMemo(() => {
    if (!selectedClass) return []
    if (selectedClass === 'all') return students
    return students.filter((s) => s.className === selectedClass)
  }, [students, selectedClass])

  // Filter students based on active report tab
  const reportStudents = useMemo(() => {
    return classStudents.map((s, idx) => {
      // Deterministic pseudo-metrics for reporting
      const baseDays = 22
      const presentDays = Math.max(14, baseDays - ((idx * 3) % 8))
      const absentDays = baseDays - presentDays - ((idx % 2 === 0) ? 1 : 0)
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
      if (activeTab === 'low-attendance') return s.isLowAttendance
      return true
    })
  }, [classStudents, activeTab])

  // Handle Load Reports Click
  const handleLoadReports = (e) => {
    e.preventDefault()
    if (!selectedClass) {
      toast?.error?.('Please select a class first.')
      return
    }
    setHasLoaded(true)
    toast?.success?.(`Loaded attendance reports for ${selectedClass === 'all' ? 'All Classes' : selectedClass}`)
  }

  // Export CSV
  const handleExportCSV = () => {
    if (reportStudents.length === 0) return
    const headers = 'Roll No,Student Name,Class,Present Days,Absent Days,Leave Days,Attendance %\n'
    const rows = reportStudents
      .map(
        (s) =>
          `"${s.rollNo}","${s.name}","${s.className}","${s.presentDays}","${s.absentDays}","${s.leaveDays}","${s.attendancePercent}%"`
      )
      .join('\n')
    const blob = new Blob([headers + rows], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `attendance-report-${selectedClass}-${activeTab}.csv`
    a.click()
    URL.revokeObjectURL(url)
    toast?.success?.('Exported attendance report to CSV!')
  }

  return (
    <div className="flex-1 flex flex-col min-h-0 bg-slate-50/70 dark:bg-slate-950">
      {/* ========================================================= */}
      {/* 1. SUB-HEADER BAR (Matching Reference Image) */}
      {/* ========================================================= */}
      <div className="bg-white dark:bg-slate-900 border-b border-slate-200/90 dark:border-slate-800 px-4 sm:px-6 py-2.5 flex flex-wrap items-center justify-between gap-3 shrink-0 shadow-2xs">
        <div className="flex flex-col">
          <div className="flex items-center gap-2 font-black text-sm text-slate-900 dark:text-white">
            <FileText className="w-4 h-4 text-blue-600 dark:text-blue-400" />
            <span>Student Attendance Reports</span>
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
        {/* CARD 1: FILTER & LOAD CARD (Matching screenshot 2) */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-2xl p-5 sm:p-6 shadow-xs space-y-4">
          <div>
            <div className="flex items-center gap-2">
              <FileText className="w-4 h-4 text-slate-500" />
              <h3 className="text-base font-extrabold text-slate-900 dark:text-white">
                Student Attendance Reports
              </h3>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              View and export class attendance by date, student, or subject.
            </p>
          </div>

          {/* Form Row: SELECT CLASS + Load reports Button */}
          <form onSubmit={handleLoadReports} className="space-y-1">
            <label className="text-[11px] font-extrabold uppercase text-slate-400 dark:text-slate-500 tracking-wider block">
              SELECT CLASS
            </label>
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
              <div className="flex-1">
                <select
                  value={selectedClass}
                  onChange={(e) => {
                    setSelectedClass(e.target.value)
                    setHasLoaded(false)
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

          {/* Sub-Tabs (Student Attendance / Consecutive Absences / Low Attendance) */}
          {hasLoaded && (
            <div className="flex flex-wrap items-center gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
              <button
                type="button"
                onClick={() => {
                  setActiveTab('student-attendance')
                  onSelectSubReport && onSelectSubReport('student-attendance')
                }}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                  activeTab === 'student-attendance'
                    ? 'bg-sky-600 text-white shadow-xs'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
                }`}
              >
                <FileText className="w-3.5 h-3.5" />
                <span>Student Attendance</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setActiveTab('consecutive-absences')
                  onSelectSubReport && onSelectSubReport('consecutive-absences')
                }}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                  activeTab === 'consecutive-absences'
                    ? 'bg-sky-600 text-white shadow-xs'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
                }`}
              >
                <UserX className="w-3.5 h-3.5" />
                <span>Consecutive Absences</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setActiveTab('low-attendance')
                  onSelectSubReport && onSelectSubReport('low-attendance')
                }}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                  activeTab === 'low-attendance'
                    ? 'bg-sky-600 text-white shadow-xs'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
                }`}
              >
                <AlertTriangle className="w-3.5 h-3.5" />
                <span>Low Attendance (&lt;75%)</span>
              </button>

              <div className="ml-auto flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => window.print()}
                  className="px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-semibold flex items-center gap-1 cursor-pointer"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>Print</span>
                </button>
                <button
                  type="button"
                  onClick={handleExportCSV}
                  className="px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-semibold flex items-center gap-1 cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>CSV</span>
                </button>
              </div>
            </div>
          )}
        </div>

        {/* CARD 2: REPORT CONTENT OR INITIAL EMPTY STATE */}
        {!hasLoaded ? (
          /* Exact Match to Screenshot 2 Placeholder */
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
          /* Loaded Report Data View */
          <div className="bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-2xl shadow-xs overflow-hidden">
            <div className="px-5 py-4 border-b border-slate-100 dark:border-slate-800 flex flex-wrap items-center justify-between gap-3">
              <div>
                <h4 className="text-sm font-extrabold text-slate-900 dark:text-white">
                  {activeTab === 'consecutive-absences'
                    ? 'Students with Consecutive Absences (3+ days)'
                    : activeTab === 'low-attendance'
                    ? 'Students with Low Attendance (< 75%)'
                    : 'Class Monthly Attendance Register'}
                </h4>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  Class: {selectedClass === 'all' ? 'All Classes' : selectedClass} • Month: {new Date().toLocaleDateString('en-GB', { month: 'long', year: 'numeric' })}
                </p>
              </div>

              <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-sky-50 dark:bg-sky-950/60 text-sky-700 dark:text-sky-300 border border-sky-200 dark:border-sky-800">
                {reportStudents.length} records found
              </span>
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
                        No students match this report filter.
                      </td>
                    </tr>
                  ) : (
                    reportStudents.map((s, idx) => (
                      <tr key={s.id || idx} className="hover:bg-slate-50/70 dark:hover:bg-slate-800/40 transition-colors">
                        <td className="py-3.5 px-4 text-center font-bold text-slate-400">{idx + 1}</td>
                        <td className="py-3.5 px-4 font-mono font-bold text-sky-600 dark:text-sky-400">{s.rollNo}</td>
                        <td className="py-3.5 px-4 font-extrabold text-slate-900 dark:text-white">
                          {s.name}
                          {s.parentName && <span className="block text-[10px] text-slate-400 font-normal">Guardian: {s.parentName}</span>}
                        </td>
                        <td className="py-3.5 px-4 text-center font-bold text-emerald-600">{s.presentDays}</td>
                        <td className="py-3.5 px-4 text-center font-bold text-rose-600">{s.absentDays}</td>
                        <td className="py-3.5 px-4 text-center font-bold text-sky-600">{s.leaveDays}</td>
                        <td className="py-3.5 px-4 text-center font-mono font-bold">
                          <span className={s.attendancePercent < 75 ? 'text-rose-600' : 'text-emerald-600'}>
                            {s.attendancePercent}%
                          </span>
                        </td>
                        <td className="py-3.5 px-4 text-right">
                          {s.isConsecutiveAbsent ? (
                            <span className="inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-rose-100 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300">
                              3+ Days Absent
                            </span>
                          ) : s.isLowAttendance ? (
                            <span className="inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300">
                              Critical Low
                            </span>
                          ) : (
                            <span className="inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300">
                              Good Standing
                            </span>
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
    </div>
  )
}
