import React, { useState, useMemo, useEffect } from 'react'
import {
  ArrowLeft,
  UserPlus,
  DollarSign,
  FileText,
  ArrowDownCircle,
  MessageSquare,
  Calendar,
  Users,
  Filter,
  Check,
  Printer,
  FileSpreadsheet,
  Info,
  User,
  ChevronUp,
  ChevronDown,
  Building2
} from 'lucide-react'
import { useAppData } from '../../../context/AppDataContext'
import { useToast } from '../../../context/ToastContext'
import { downloadSimplePdf } from '../../../utils/pdfExport'

const formatLongDate = (iso) => {
  if (!iso) return '—'
  const dt = new Date(`${String(iso).slice(0, 10)}T12:00:00`)
  if (Number.isNaN(dt.getTime())) return String(iso)
  return dt.toLocaleDateString('en-GB', { weekday: 'long', day: '2-digit', month: 'short', year: 'numeric' })
}

const getStatusBadgeClasses = (status) => {
  const s = String(status || '').toLowerCase()
  if (s === 'present') return 'bg-emerald-600 text-white'
  if (s === 'absent') return 'bg-rose-600 text-white'
  if (s === 'late') return 'bg-amber-500 text-white'
  if (s === 'leave') return 'bg-cyan-600 text-white'
  return 'bg-slate-500 text-white'
}

export const StudentAttendanceReportView = ({
  initialClassFilter = '',
  currentInstitute,
  onRouteChange,
  onOpenQuickPayment,
  onOpenSendSms,
  onBack
}) => {
  const { students = [], classes = [], attendance = {} } = useAppData()
  const { toast } = useToast()

  const instituteStudents = useMemo(() => {
    if (!currentInstitute?.id) return students
    return students.filter((s) => s.instituteId === currentInstitute.id || !s.instituteId)
  }, [students, currentInstitute?.id])

  const classOptions = useMemo(() => {
    const set = new Set()
    classes.forEach((c) => {
      if ((!currentInstitute?.id || c.instituteId === currentInstitute.id || !c.instituteId) && c.name) {
        set.add(c.name)
      }
    })
    instituteStudents.forEach((s) => {
      if (s.className) set.add(s.className)
    })
    return Array.from(set).sort()
  }, [classes, instituteStudents, currentInstitute?.id])

  const [selectedClass, setSelectedClass] = useState(() => initialClassFilter || classOptions[0] || 'All Classes')
  const [changeClassOpen, setChangeClassOpen] = useState(false)

  useEffect(() => {
    if (initialClassFilter) {
      setSelectedClass(initialClassFilter)
    }
  }, [initialClassFilter])

  const todayIso = new Date().toISOString().split('T')[0]

  // Staged filter controls
  const [draftStudentId, setDraftStudentId] = useState('ALL')
  const [draftRange, setDraftRange] = useState('single') // 'single' | 'range' | 'month'
  const [draftDate, setDraftDate] = useState(todayIso)
  const [draftFromDate, setDraftFromDate] = useState(todayIso.slice(0, 8) + '01')
  const [draftToDate, setDraftToDate] = useState(todayIso)
  const [draftMonth, setDraftMonth] = useState(todayIso.slice(0, 7))
  const [draftType, setDraftType] = useState('General')

  // Applied filter controls
  const [applied, setApplied] = useState({
    studentId: 'ALL',
    range: 'single',
    date: todayIso,
    fromDate: todayIso.slice(0, 8) + '01',
    toDate: todayIso,
    month: todayIso.slice(0, 7),
    type: 'General'
  })

  const classStudents = useMemo(() => {
    return instituteStudents.filter((s) => {
      if ((s.status || 'Active') === 'Dropped') return false
      if (!selectedClass || selectedClass === 'All Classes') return true
      return (s.className || '').toLowerCase().trim() === selectedClass.toLowerCase().trim()
    })
  }, [instituteStudents, selectedClass])

  const targetStudents = useMemo(() => {
    if (applied.studentId === 'ALL') return classStudents
    return classStudents.filter((s) => String(s.id) === String(applied.studentId))
  }, [classStudents, applied.studentId])

  const reportRows = useMemo(() => {
    const entries = Object.entries(attendance || {})
    return targetStudents.map((stu) => {
      const adm =
        stu.admissionNo ||
        stu.registrationNo ||
        stu.systemAdmissionNo ||
        String(stu.id || '').slice(-8).toUpperCase()

      if (applied.range === 'single') {
        let matchedEntry = null
        for (const [key, recMap] of entries) {
          if (!recMap || typeof recMap !== 'object') continue
          if (!key.includes(applied.date)) continue
          if (recMap[stu.id]) {
            matchedEntry = recMap[stu.id]
            break
          }
        }
        const status = matchedEntry ? String(matchedEntry.status || matchedEntry || 'Not Marked') : 'Not Marked'
        const comment = matchedEntry?.note || '—'
        return { student: stu, adm, status, comment }
      }

      let present = 0
      let absent = 0
      let late = 0
      let leave = 0
      entries.forEach(([key, recMap]) => {
        if (!recMap || typeof recMap !== 'object' || !recMap[stu.id]) return
        const dateMatch = key.match(/\d{4}-\d{2}-\d{2}/)
        const dStr = dateMatch ? dateMatch[0] : ''
        if (!dStr) return
        if (applied.range === 'month' && !dStr.startsWith(applied.month)) return
        if (applied.range === 'range' && (dStr < applied.fromDate || dStr > applied.toDate)) return
        const lower = String(recMap[stu.id]?.status || recMap[stu.id] || '').toLowerCase()
        if (lower === 'present') present++
        else if (lower === 'absent') absent++
        else if (lower === 'late') late++
        else if (lower === 'leave') leave++
      })
      const total = present + absent + late + leave
      const pct = total > 0 ? Math.round(((present + late) / total) * 100) : 0
      return { student: stu, adm, present, absent, late, leave, pct }
    })
  }, [targetStudents, attendance, applied])

  const handleApplyFilters = (e) => {
    e?.preventDefault()
    setApplied({
      studentId: draftStudentId,
      range: draftRange,
      date: draftDate,
      fromDate: draftFromDate,
      toDate: draftToDate,
      month: draftMonth,
      type: draftType
    })
  }

  const rangeBadgeLabel = useMemo(() => {
    if (applied.range === 'single') return formatLongDate(applied.date)
    if (applied.range === 'month') {
      const dt = new Date(`${applied.month}-01T12:00:00`)
      return Number.isNaN(dt.getTime())
        ? applied.month
        : dt.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
    }
    return `${applied.fromDate} to ${applied.toDate}`
  }, [applied])

  const handleExportSpreadsheet = (format) => {
    if (reportRows.length === 0) {
      toast?.info?.('No student records to export.')
      return
    }
    const sep = format === 'tsv' ? '\t' : ','
    const esc = (v) => (format === 'tsv' ? String(v ?? '').replace(/\t|\n/g, ' ') : `"${String(v ?? '').replace(/"/g, '""')}"`)
    const headers =
      applied.range === 'single'
        ? ['#', 'Student', 'Parent', 'Roll No', 'Ad No', 'Status', 'Comment']
        : ['#', 'Student', 'Roll No', 'Ad No', 'Present', 'Absent', 'Late', 'Leave', 'Present %']

    const lines = [
      headers.map(esc).join(sep),
      ...reportRows.map((row, idx) =>
        (applied.range === 'single'
          ? [
              idx + 1,
              row.student.fullName || row.student.name,
              row.student.fatherName || row.student.guardianName || '',
              row.student.rollNumber || 'N/A',
              row.adm,
              row.status,
              row.comment
            ]
          : [
              idx + 1,
              row.student.fullName || row.student.name,
              row.student.rollNumber || 'N/A',
              row.adm,
              row.present,
              row.absent,
              row.late,
              row.leave,
              `${row.pct}%`
            ]
        )
          .map(esc)
          .join(sep)
      )
    ]

    const blob = new Blob([lines.join('\n')], {
      type: format === 'tsv' ? 'application/vnd.ms-excel;charset=utf-8;' : 'text/csv;charset=utf-8;'
    })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `student-attendance-${selectedClass.toLowerCase().replace(/\s+/g, '-')}.${format === 'tsv' ? 'xls' : 'csv'}`
    a.click()
    URL.revokeObjectURL(url)
    toast?.success?.(`Exported ${reportRows.length} attendance record(s).`)
  }

  const handleExportPdfReport = () => {
    const lines = [
      { text: `${currentInstitute?.name || 'Institute Portal'} - Student Attendance Reports`, bold: true },
      { text: `Class: ${selectedClass} | Type: ${applied.type} | Period: ${rangeBadgeLabel}`, gap: -18 },
      { text: `STUDENTS (${reportRows.length})`, bold: true, gap: -22 },
      ...reportRows.map((row, idx) =>
        applied.range === 'single'
          ? `${idx + 1}. ${row.student.fullName || row.student.name} (Roll ${row.student.rollNumber || 'N/A'} | ${row.adm}) - ${row.status}`
          : `${idx + 1}. ${row.student.fullName || row.student.name} (Roll ${row.student.rollNumber || 'N/A'}) - P:${row.present} A:${row.absent} L:${row.late} Lv:${row.leave} (${row.pct}%)`
      )
    ]
    downloadSimplePdf(`attendance-report-${selectedClass.toLowerCase().replace(/\s+/g, '-')}.pdf`, lines)
    toast?.success?.('Attendance report PDF downloaded.')
  }

  return (
    <div className="p-4 sm:p-6 space-y-5 max-w-[1440px] mx-auto">
      {/* Page Header & Global Action Bar */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 print:hidden">
        <div>
          <div className="flex items-center gap-2">
            <FileText className="w-5 h-5 text-slate-600" />
            <h1 className="text-lg sm:text-xl font-bold text-slate-900">Student Attendance Reports</h1>
          </div>
          <button
            type="button"
            onClick={() => (onBack ? onBack() : onRouteChange?.('inst-attendance'))}
            className="text-xs font-medium text-slate-500 hover:text-slate-800 flex items-center gap-1 mt-1 cursor-pointer"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back</span>
          </button>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => onRouteChange?.('inst-admissions-enroll')}
            className="px-3.5 py-2 rounded-xl bg-teal-600 hover:bg-teal-700 text-white text-xs font-semibold flex items-center gap-1.5 shadow-2xs cursor-pointer transition-colors"
          >
            <UserPlus className="w-3.5 h-3.5" />
            <span>New Enrollment</span>
          </button>
          <button
            type="button"
            onClick={() => onOpenQuickPayment?.(null)}
            className="px-3.5 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-white text-xs font-semibold flex items-center gap-1.5 shadow-2xs cursor-pointer transition-colors"
          >
            <DollarSign className="w-3.5 h-3.5" />
            <span>Add Payment</span>
          </button>
          <button
            type="button"
            onClick={() => onRouteChange?.('inst-fees')}
            className="px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold flex items-center gap-1.5 shadow-2xs cursor-pointer transition-colors"
          >
            <FileText className="w-3.5 h-3.5" />
            <span>Generate Invoice</span>
          </button>
          <button
            type="button"
            onClick={() => onRouteChange?.('inst-accounts-expenses')}
            className="px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 text-xs font-semibold flex items-center gap-1.5 shadow-2xs cursor-pointer transition-colors"
          >
            <ArrowDownCircle className="w-3.5 h-3.5 text-slate-500" />
            <span>Manage Expense</span>
          </button>
          <button
            type="button"
            onClick={() => onOpenSendSms?.()}
            className="px-3.5 py-2 rounded-xl bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 text-xs font-semibold flex items-center gap-1.5 shadow-2xs cursor-pointer transition-colors"
          >
            <MessageSquare className="w-3.5 h-3.5 text-slate-500" />
            <span>Send SMS</span>
          </button>
        </div>
      </div>

      {/* Top Info Header Box */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-2xs space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 font-bold text-slate-800 text-sm">
              <FileText className="w-4 h-4 text-slate-600" />
              <span>Student Attendance Reports</span>
            </div>
            <p className="text-[11px] text-slate-400 mt-0.5">
              View and export class attendance by date, student, or subject.
            </p>
          </div>

          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-sky-50 border border-sky-200 text-sky-700 text-xs font-bold">
            <Building2 className="w-3.5 h-3.5" />
            <span>{selectedClass}</span>
          </span>

          <button
            type="button"
            onClick={() => setChangeClassOpen((v) => !v)}
            className="px-3.5 py-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold inline-flex items-center gap-1.5 cursor-pointer print:hidden"
          >
            {changeClassOpen ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
            <span>Change class</span>
          </button>
        </div>

        {changeClassOpen && (
          <div className="pt-3 border-t border-slate-100 flex flex-wrap items-center gap-2 print:hidden">
            {['All Classes', ...classOptions].map((cls) => (
              <button
                key={cls}
                type="button"
                onClick={() => {
                  setSelectedClass(cls)
                  setDraftStudentId('ALL')
                  setApplied((prev) => ({ ...prev, studentId: 'ALL' }))
                  setChangeClassOpen(false)
                }}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold border cursor-pointer transition-colors ${
                  selectedClass === cls
                    ? 'bg-sky-500 border-sky-500 text-white'
                    : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                }`}
              >
                {cls}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Main Content Wrapper Card */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs p-5 space-y-5">
        {/* Top Pills Row */}
        <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-sky-50 border border-sky-200 text-sky-700 font-bold">
            <Calendar className="w-3.5 h-3.5" />
            <span>{rangeBadgeLabel}</span>
          </span>
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-sky-50 border border-sky-200 text-sky-700 font-bold">
            <Users className="w-3.5 h-3.5" />
            <span>{reportRows.length} students</span>
          </span>
        </div>

        {/* Filter Report Card */}
        <form onSubmit={handleApplyFilters} className="rounded-xl border border-slate-200 overflow-hidden print:hidden">
          <div className="px-4 py-2.5 bg-slate-50/70 border-b border-slate-200 flex items-center gap-2 text-[11px] font-bold uppercase tracking-wider text-slate-600">
            <Filter className="w-3.5 h-3.5 text-slate-500" />
            <span>FILTER REPORT</span>
          </div>

          <div className="p-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-3 items-end text-xs">
            <div className="lg:col-span-3">
              <label className="block text-[10px] font-bold uppercase text-slate-500 mb-1">STUDENT:</label>
              <select
                value={draftStudentId}
                onChange={(e) => setDraftStudentId(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-slate-200 bg-white font-medium text-slate-800"
              >
                <option value="ALL">All Students</option>
                {classStudents.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.fullName || s.name} ({s.rollNumber || 'N/A'})
                  </option>
                ))}
              </select>
            </div>

            <div className="lg:col-span-3">
              <label className="block text-[10px] font-bold uppercase text-slate-500 mb-1">RANGE:</label>
              <select
                value={draftRange}
                onChange={(e) => setDraftRange(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-slate-200 bg-white font-medium text-slate-800"
              >
                <option value="single">Single Date</option>
                <option value="month">Monthly Summary</option>
                <option value="range">Custom Date Range</option>
              </select>
            </div>

            {draftRange === 'single' && (
              <div className="lg:col-span-2">
                <label className="block text-[10px] font-bold uppercase text-slate-500 mb-1">DATE:</label>
                <input
                  type="date"
                  value={draftDate}
                  onChange={(e) => setDraftDate(e.target.value)}
                  className="w-full px-3 py-1.5 rounded-lg border border-slate-200 bg-white font-medium text-slate-800"
                />
              </div>
            )}

            {draftRange === 'month' && (
              <div className="lg:col-span-2">
                <label className="block text-[10px] font-bold uppercase text-slate-500 mb-1">MONTH:</label>
                <input
                  type="month"
                  value={draftMonth}
                  onChange={(e) => setDraftMonth(e.target.value)}
                  className="w-full px-3 py-1.5 rounded-lg border border-slate-200 bg-white font-medium text-slate-800"
                />
              </div>
            )}

            {draftRange === 'range' && (
              <div className="lg:col-span-2 grid grid-cols-2 gap-1.5">
                <div>
                  <label className="block text-[10px] font-bold uppercase text-slate-500 mb-1">FROM:</label>
                  <input
                    type="date"
                    value={draftFromDate}
                    onChange={(e) => setDraftFromDate(e.target.value)}
                    className="w-full px-2 py-1.5 rounded-lg border border-slate-200 bg-white text-[11px]"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold uppercase text-slate-500 mb-1">TO:</label>
                  <input
                    type="date"
                    value={draftToDate}
                    onChange={(e) => setDraftToDate(e.target.value)}
                    className="w-full px-2 py-1.5 rounded-lg border border-slate-200 bg-white text-[11px]"
                  />
                </div>
              </div>
            )}

            <div className="lg:col-span-2">
              <label className="block text-[10px] font-bold uppercase text-slate-500 mb-1">TYPE:</label>
              <select
                value={draftType}
                onChange={(e) => setDraftType(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-slate-200 bg-white font-medium text-slate-800"
              >
                <option value="General">General</option>
                <option value="Subject-wise">Subject-wise</option>
              </select>
            </div>

            <div className="lg:col-span-2">
              <button
                type="submit"
                className="w-full py-2 px-4 rounded-lg bg-sky-500 hover:bg-sky-600 text-white font-bold inline-flex items-center justify-center gap-1.5 cursor-pointer shadow-xs transition-colors"
              >
                <Check className="w-3.5 h-3.5" />
                <span>Apply</span>
              </button>
            </div>
          </div>
        </form>

        {/* Export Bar + Students Count */}
        <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
          <div className="flex flex-wrap items-center gap-2 print:hidden">
            <button
              type="button"
              onClick={() => window.print()}
              className="px-3 py-1.5 rounded-lg border border-emerald-300 bg-white hover:bg-emerald-50 text-emerald-700 font-semibold inline-flex items-center gap-1.5 cursor-pointer"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print</span>
            </button>
            <button
              type="button"
              onClick={handleExportPdfReport}
              className="px-3 py-1.5 rounded-lg border border-sky-300 bg-white hover:bg-sky-50 text-sky-700 font-semibold inline-flex items-center gap-1.5 cursor-pointer"
            >
              <FileText className="w-3.5 h-3.5" />
              <span>PDF</span>
            </button>
            <button
              type="button"
              onClick={() => handleExportSpreadsheet('tsv')}
              className="px-3 py-1.5 rounded-lg border border-amber-300 bg-white hover:bg-amber-50 text-amber-700 font-semibold inline-flex items-center gap-1.5 cursor-pointer"
            >
              <FileSpreadsheet className="w-3.5 h-3.5" />
              <span>Excel</span>
            </button>
            <button
              type="button"
              onClick={() => handleExportSpreadsheet('csv')}
              className="px-3 py-1.5 rounded-lg border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 font-semibold inline-flex items-center gap-1.5 cursor-pointer"
            >
              <FileText className="w-3.5 h-3.5" />
              <span>CSV</span>
            </button>
          </div>

          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-sky-50 border border-sky-200 text-sky-700 font-bold">
            <Users className="w-3.5 h-3.5" />
            <span>{reportRows.length} students</span>
          </span>
        </div>

        {/* Attendance Summary Info Strip */}
        <div className="rounded-xl border border-cyan-300 bg-cyan-50/75 px-4 py-3 text-xs text-cyan-950 space-y-0.5">
          <div className="flex items-center gap-2 font-bold">
            <Info className="w-4 h-4 text-cyan-700 shrink-0" />
            <span>
              {applied.type} Attendance —{' '}
              {applied.range === 'single' ? 'Single Day' : applied.range === 'month' ? 'Monthly Summary' : 'Date Range'}
            </span>
          </div>
          <p className="text-[11px] pl-6">
            <strong>Date:</strong> {rangeBadgeLabel}
          </p>
        </div>

        {/* Report Table */}
        <div className="overflow-x-auto border border-slate-200 rounded-xl">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50/80 border-b border-slate-200 text-[10px] uppercase tracking-wider text-slate-500">
              {applied.range === 'single' ? (
                <tr>
                  <th className="py-3 px-4">#</th>
                  <th className="py-3 px-4">STUDENT</th>
                  <th className="py-3 px-4 text-center">ROLL NO</th>
                  <th className="py-3 px-4 text-center">AD. NO</th>
                  <th className="py-3 px-4 text-center">STATUS</th>
                  <th className="py-3 px-4">COMMENT</th>
                </tr>
              ) : (
                <tr>
                  <th className="py-3 px-4">#</th>
                  <th className="py-3 px-4">STUDENT</th>
                  <th className="py-3 px-4 text-center">ROLL NO</th>
                  <th className="py-3 px-4 text-center">AD. NO</th>
                  <th className="py-3 px-4 text-center">PRESENT</th>
                  <th className="py-3 px-4 text-center">ABSENT</th>
                  <th className="py-3 px-4 text-center">LATE</th>
                  <th className="py-3 px-4 text-center">LEAVE</th>
                  <th className="py-3 px-4 text-center">PRESENT %</th>
                </tr>
              )}
            </thead>
            <tbody className="divide-y divide-slate-100">
              {reportRows.length === 0 ? (
                <tr>
                  <td colSpan={applied.range === 'single' ? 6 : 9} className="py-8 text-center text-slate-400">
                    No students match the selected class / filter.
                  </td>
                </tr>
              ) : (
                reportRows.map((row, idx) => (
                  <tr key={row.student.id} className="hover:bg-slate-50/70">
                    <td className="py-3 px-4 text-slate-500 font-medium">{idx + 1}</td>
                    <td className="py-3 px-4">
                      <div className="font-bold text-slate-900">{row.student.fullName || row.student.name}</div>
                      {(row.student.fatherName || row.student.guardianName) && (
                        <div className="text-[10px] text-slate-400 inline-flex items-center gap-1 mt-0.5">
                          <User className="w-3 h-3" />
                          <span>{row.student.fatherName || row.student.guardianName}</span>
                        </div>
                      )}
                    </td>
                    <td className="py-3 px-4 text-center text-slate-700 font-medium">{row.student.rollNumber || 'N/A'}</td>
                    <td className="py-3 px-4 text-center font-mono text-slate-600">{row.adm}</td>
                    {applied.range === 'single' ? (
                      <>
                        <td className="py-3 px-4 text-center">
                          <span className={`inline-block px-2.5 py-0.5 rounded font-bold text-[10px] ${getStatusBadgeClasses(row.status)}`}>
                            {row.status}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-slate-500">{row.comment}</td>
                      </>
                    ) : (
                      <>
                        <td className="py-3 px-4 text-center font-bold text-emerald-700">{row.present}</td>
                        <td className="py-3 px-4 text-center font-bold text-rose-600">{row.absent}</td>
                        <td className="py-3 px-4 text-center font-bold text-amber-600">{row.late}</td>
                        <td className="py-3 px-4 text-center font-bold text-cyan-600">{row.leave}</td>
                        <td className="py-3 px-4 text-center font-extrabold text-slate-900">{row.pct}%</td>
                      </>
                    )}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

export default StudentAttendanceReportView
