import React, { useState, useMemo } from 'react'
import {
  ArrowLeft,
  FileText,
  UserPlus,
  CreditCard,
  Receipt,
  ArrowDownCircle,
  MessageSquare,
  Calendar,
  Filter,
  Printer,
  FileSpreadsheet,
  Users,
  Check,
  CheckCircle2,
  AlertTriangle,
  Settings,
  ExternalLink,
  Send
} from 'lucide-react'
import { useAppData } from '../../../context/AppDataContext'
import { useToast } from '../../../context/ToastContext'
import { getDistinctInstituteClassNames, isClassAllowedForTier } from '../../../utils/tierGating'
import { getAttendanceSettings } from './attendanceService'
import { downloadSimplePdf } from '../../../utils/pdfExport'

const QuickHeader = ({ title, onBack, onRouteChange, onOpenQuickPayment }) => (
  <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
    <div>
      <div className="flex items-center gap-2">
        <FileText className="w-5 h-5 text-slate-600" />
        <h1 className="text-xl font-bold text-slate-900 tracking-tight">{title}</h1>
      </div>
      <button
        type="button"
        onClick={onBack}
        className="mt-0.5 inline-flex items-center gap-1 text-xs font-medium text-slate-500 hover:text-slate-800 transition-colors"
      >
        <ArrowLeft className="w-3.5 h-3.5" />
        Back
      </button>
    </div>

    <div className="flex flex-wrap items-center gap-2">
      <button
        type="button"
        onClick={() => onRouteChange?.('inst-admissions-enroll')}
        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold shadow-sm transition-colors"
      >
        <UserPlus className="w-3.5 h-3.5" />
        New Enrollment
      </button>
      <button
        type="button"
        onClick={() => onOpenQuickPayment?.()}
        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-orange-500 hover:bg-orange-600 text-white text-xs font-semibold shadow-sm transition-colors"
      >
        <CreditCard className="w-3.5 h-3.5" />
        Add Payment
      </button>
      <button
        type="button"
        onClick={() => onRouteChange?.('inst-fees-invoices')}
        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold shadow-sm transition-colors"
      >
        <Receipt className="w-3.5 h-3.5" />
        Generate Invoice
      </button>
      <button
        type="button"
        onClick={() => onRouteChange?.('inst-finance-expenses')}
        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 text-xs font-semibold shadow-sm transition-colors"
      >
        <ArrowDownCircle className="w-3.5 h-3.5" />
        Manage Expense
      </button>
      <button
        type="button"
        onClick={() => onRouteChange?.('inst-comm-sms')}
        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 text-xs font-semibold shadow-sm transition-colors"
      >
        <MessageSquare className="w-3.5 h-3.5" />
        Send SMS
      </button>
    </div>
  </div>
)

export const AttendanceReportsViews = ({
  mode = 'staff', // 'staff' | 'consecutive' | 'low'
  currentInstitute,
  onRouteChange,
  onOpenProfile,
  onOpenQuickPayment
}) => {
  const { teachers = [], students = [], classes = [], attendance = {} } = useAppData()
  const { toast } = useToast()

  const instId = currentInstitute?.id || 'default'
  const todayIso = useMemo(() => new Date().toISOString().slice(0, 10), [])
  const currentMonthIso = useMemo(() => todayIso.slice(0, 7), [todayIso])

  const instStaff = useMemo(
    () =>
      teachers.filter(
        (t) => !currentInstitute?.id || !t.instituteId || t.instituteId === currentInstitute.id
      ),
    [teachers, currentInstitute]
  )

  const instStudents = useMemo(
    () =>
      students.filter((s) => {
        if (currentInstitute?.id && s.instituteId && s.instituteId !== currentInstitute.id) return false
        if (!isClassAllowedForTier(s.className, currentInstitute)) return false
        const st = String(s.status || 'Active').toLowerCase()
        return !['dropped', 'left', 'withdrawn', 'graduated'].includes(st)
      }),
    [students, currentInstitute]
  )

  const availableClasses = useMemo(
    () => getDistinctInstituteClassNames(classes, instStudents, currentInstitute),
    [classes, instStudents, currentInstitute]
  )

  // ============================================================================
  // 1. STAFF ATTENDANCE REPORTS STATE
  // ============================================================================
  const [staffStatusFilter, setStaffStatusFilter] = useState('Active')
  const [staffMemberFilter, setStaffMemberFilter] = useState('ALL')
  const [staffRangeMode, setStaffRangeMode] = useState('single')
  const [staffDate, setStaffDate] = useState(todayIso)
  const [staffApplied, setStaffApplied] = useState({
    status: 'Active',
    memberId: 'ALL',
    range: 'single',
    date: todayIso
  })

  const staffRows = useMemo(() => {
    const filteredStaff = instStaff.filter((t) => {
      const st = String(t.status || 'Active').toLowerCase()
      if (staffApplied.status === 'Active' && st === 'inactive') return false
      if (staffApplied.status === 'Inactive' && st !== 'inactive') return false
      if (staffApplied.memberId !== 'ALL' && t.id !== staffApplied.memberId) return false
      return true
    })

    // Read persisted staff attendance marks if any
    let staffAttStore = {}
    try {
      const raw = localStorage.getItem(`eims_staff_attendance_${instId}`)
      staffAttStore = raw ? JSON.parse(raw) : {}
    } catch {
      staffAttStore = {}
    }

    const workingDays = staffApplied.range === 'month' ? new Date().getDate() : 1
    return filteredStaff.map((member) => {
      let present = 0
      let absent = 0
      let late = 0
      let leave = 0
      let fine = 0

      if (staffApplied.range === 'single') {
        const rec = staffAttStore[`${staffApplied.date}_${member.id}`]
        if (rec?.status === 'Present') present = 1
        else if (rec?.status === 'Absent') absent = 1
        else if (rec?.status === 'Late') late = 1
        else if (rec?.status === 'Leave') leave = 1
        fine = Number(rec?.fine || 0)
      } else {
        const prefix = staffApplied.date.slice(0, 7)
        Object.entries(staffAttStore).forEach(([k, rec]) => {
          if (!k.endsWith(`_${member.id}`)) return
          if (!k.startsWith(prefix)) return
          if (rec?.status === 'Present') present += 1
          else if (rec?.status === 'Absent') absent += 1
          else if (rec?.status === 'Late') late += 1
          else if (rec?.status === 'Leave') leave += 1
          fine += Number(rec?.fine || 0)
        })
      }

      const marked = present + absent + late + leave
      const unmarked = Math.max(0, workingDays - marked)
      const pct = workingDays > 0 ? Math.round(((present + late) / workingDays) * 100) : 0

      return {
        member,
        role: member.role || member.designation || 'Teacher',
        workingDays,
        holidays: 0,
        present,
        absent,
        late,
        leave,
        unmarked,
        fine,
        pct
      }
    })
  }, [instStaff, staffApplied, instId])

  const staffTotals = useMemo(() => {
    const count = staffRows.length
    const present = staffRows.reduce((s, r) => s + r.present, 0)
    const absent = staffRows.reduce((s, r) => s + r.absent, 0)
    const late = staffRows.reduce((s, r) => s + r.late, 0)
    const leave = staffRows.reduce((s, r) => s + r.leave, 0)
    const fines = staffRows.reduce((s, r) => s + r.fine, 0)
    const avgPct = count > 0 ? Math.round(staffRows.reduce((s, r) => s + r.pct, 0) / count) : 0
    return { count, present, absent, late, leave, fines, avgPct }
  }, [staffRows])

  const handleExportStaffCsv = (format = 'csv') => {
    const sep = format === 'tsv' ? '\t' : ','
    const headers = ['Staff', 'Role', 'Working Days', 'Holidays', 'Present', 'Absent', 'Late', 'Leave', 'Unmarked', 'Fine', 'Attendance %']
    const lines = [
      headers.join(sep),
      ...staffRows.map((r) =>
        [
          r.member.name,
          r.role,
          r.workingDays,
          r.holidays,
          r.present,
          r.absent,
          r.late,
          r.leave,
          r.unmarked,
          r.fine,
          `${r.pct}%`
        ].join(sep)
      )
    ]
    const blob = new Blob([lines.join('\n')], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `staff-attendance-${staffApplied.date}.${format === 'tsv' ? 'xls' : 'csv'}`
    a.click()
    URL.revokeObjectURL(url)
    toast.success(`Exported ${staffRows.length} staff attendance record(s)`)
  }

  const handleExportStaffPdf = () => {
    downloadSimplePdf(`staff-attendance-${staffApplied.date}.pdf`, [
      { text: `${currentInstitute?.name || 'Institute'} - Staff Attendance Report`, bold: true },
      { text: `Date: ${staffApplied.date} | Staff: ${staffRows.length}`, gap: -16 },
      ...staffRows.map(
        (r, i) =>
          `${i + 1}. ${r.member.name} (${r.role}) — P:${r.present} A:${r.absent} L:${r.late} Lv:${r.leave} (${r.pct}%)`
      )
    ])
    toast.success('Staff attendance PDF downloaded')
  }

  // ============================================================================
  // 2. CONSECUTIVE ABSENCES STATE
  // ============================================================================
  const [consecMinDays, setConsecMinDays] = useState(3)
  const [consecClass, setConsecClass] = useState('ALL')
  const [consecApplied, setConsecApplied] = useState({ minDays: 3, className: 'ALL' })

  const consecutiveDefaulters = useMemo(() => {
    // Check marked daily attendance records in localStorage (`eims_daily_mark_att_${instId}_*`)
    const dayPrefix = `eims_daily_mark_att_${instId}_`
    const dayEntries = []
    try {
      for (let i = 0; i < localStorage.length; i += 1) {
        const k = localStorage.key(i)
        if (k && k.startsWith(dayPrefix)) {
          const rest = k.slice(dayPrefix.length)
          const datePart = rest.slice(0, 10)
          const map = JSON.parse(localStorage.getItem(k) || '{}')
          dayEntries.push({ date: datePart, map })
        }
      }
    } catch {
      // ignore
    }
    dayEntries.sort((a, b) => b.date.localeCompare(a.date))

    return instStudents
      .filter((s) => consecApplied.className === 'ALL' || s.className === consecApplied.className)
      .map((s) => {
        let streak = 0
        for (const entry of dayEntries) {
          const st = entry.map?.[s.id]?.status
          if (!st) continue
          if (st === 'Absent') streak += 1
          else break
        }
        return { student: s, streak }
      })
      .filter((x) => x.streak >= consecApplied.minDays)
  }, [instStudents, consecApplied, instId])

  // ============================================================================
  // 3. LOW ATTENDANCE STATE
  // ============================================================================
  const attSettings = useMemo(() => getAttendanceSettings(instId), [instId])
  const [lowMonth, setLowMonth] = useState(currentMonthIso)
  const [lowClass, setLowClass] = useState('ALL')
  const [lowStudentId, setLowStudentId] = useState('ALL')
  const [lowApplied, setLowApplied] = useState({
    month: currentMonthIso,
    className: 'ALL',
    studentId: 'ALL'
  })

  const lowMonthLabel = useMemo(() => {
    const [y, m] = String(lowApplied.month || currentMonthIso).split('-')
    const dt = new Date(Number(y), Number(m) - 1, 1)
    return Number.isNaN(dt.getTime())
      ? lowApplied.month
      : dt.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
  }, [lowApplied.month, currentMonthIso])

  const graceLeaves = Number(attSettings?.graceLeaves ?? attSettings?.maxGraceLeaves ?? 0)
  const countModeLabel = attSettings?.mode === 'daily' ? 'Daily' : 'Subject-Wise'

  const lowAttendanceDefaulters = useMemo(() => {
    const dayPrefix = `eims_daily_mark_att_${instId}_${lowApplied.month}`
    const monthMaps = []
    try {
      for (let i = 0; i < localStorage.length; i += 1) {
        const k = localStorage.key(i)
        if (k && k.startsWith(dayPrefix)) {
          monthMaps.push(JSON.parse(localStorage.getItem(k) || '{}'))
        }
      }
    } catch {
      // ignore
    }

    return instStudents
      .filter((s) => {
        if (lowApplied.className !== 'ALL' && s.className !== lowApplied.className) return false
        if (lowApplied.studentId !== 'ALL' && s.id !== lowApplied.studentId) return false
        return true
      })
      .map((s) => {
        let absences = 0
        let marked = 0
        for (const map of monthMaps) {
          const st = map?.[s.id]?.status
          if (!st) continue
          marked += 1
          if (st === 'Absent') absences += 1
        }
        // Also count Context attendance array if populated
        if (Array.isArray(attendance)) {
          attendance.forEach((a) => {
            if ((a.studentId || a.student_id) !== s.id) return
            if (!String(a.date || '').startsWith(lowApplied.month)) return
            marked += 1
            if (String(a.status || '').toLowerCase() === 'absent') absences += 1
          })
        }
        return { student: s, absences, marked }
      })
      .filter((x) => x.absences > graceLeaves)
  }, [instStudents, lowApplied, instId, graceLeaves, attendance])

  // ============================================================================
  // RENDER BY MODE
  // ============================================================================
  if (mode === 'staff') {
    const formattedDatePill = new Date(`${staffApplied.date}T12:00:00`).toLocaleDateString('en-GB', {
      weekday: 'long',
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    })

    return (
      <div className="p-4 sm:p-6 space-y-5 max-w-[1440px] mx-auto">
        <QuickHeader
          title="Staff Attendance Reports"
          onBack={() => onRouteChange?.('inst-attendance')}
          onRouteChange={onRouteChange}
          onOpenQuickPayment={onOpenQuickPayment}
        />

        {/* 7 KPI Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3">
          {[
            { label: 'STAFF', val: staffTotals.count, cls: 'text-slate-900' },
            { label: 'PRESENT', val: staffTotals.present, cls: 'text-emerald-600' },
            { label: 'ABSENT', val: staffTotals.absent, cls: 'text-rose-600' },
            { label: 'LATE', val: staffTotals.late, cls: 'text-amber-500' },
            { label: 'LEAVE', val: staffTotals.leave, cls: 'text-blue-600' },
            { label: 'FINES', val: staffTotals.fines, cls: 'text-rose-600' },
            { label: 'AVG. ATTENDANCE', val: `${staffTotals.avgPct}%`, cls: 'text-slate-900' }
          ].map((k) => (
            <div
              key={k.label}
              className="bg-white rounded-xl border border-slate-200 shadow-2xs p-3.5 text-center"
            >
              <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">{k.label}</div>
              <div className={`text-lg font-extrabold mt-1 ${k.cls}`}>{k.val}</div>
            </div>
          ))}
        </div>

        {/* FILTER REPORT Card */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5 space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-slate-600">
              <Filter className="w-3.5 h-3.5" />
              FILTER REPORT
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-50 border border-indigo-200 text-indigo-700 text-xs font-semibold">
                <Calendar className="w-3.5 h-3.5" />
                {formattedDatePill}
              </span>
              <button
                type="button"
                onClick={() => window.print()}
                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md border border-emerald-200 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 text-xs font-semibold"
              >
                <Printer className="w-3.5 h-3.5" />
                Print
              </button>
              <button
                type="button"
                onClick={handleExportStaffPdf}
                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md border border-blue-200 bg-blue-50 hover:bg-blue-100 text-blue-700 text-xs font-semibold"
              >
                <FileText className="w-3.5 h-3.5" />
                PDF
              </button>
              <button
                type="button"
                onClick={() => handleExportStaffCsv('tsv')}
                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md border border-orange-200 bg-orange-50 hover:bg-orange-100 text-orange-700 text-xs font-semibold"
              >
                <FileSpreadsheet className="w-3.5 h-3.5" />
                Excel
              </button>
              <button
                type="button"
                onClick={() => handleExportStaffCsv('csv')}
                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold"
              >
                <FileText className="w-3.5 h-3.5" />
                CSV
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-[1fr_1.2fr_1fr_1fr_auto] gap-3 items-end">
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1">
                STAFF STATUS
              </label>
              <select
                value={staffStatusFilter}
                onChange={(e) => setStaffStatusFilter(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="Active">Active</option>
                <option value="Inactive">Inactive</option>
                <option value="All">All</option>
              </select>
            </div>
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1">
                STAFF MEMBER
              </label>
              <select
                value={staffMemberFilter}
                onChange={(e) => setStaffMemberFilter(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="ALL">All staff</option>
                {instStaff.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1">
                RANGE
              </label>
              <select
                value={staffRangeMode}
                onChange={(e) => setStaffRangeMode(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="single">Single date</option>
                <option value="month">This month</option>
              </select>
            </div>
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1">
                DATE
              </label>
              <input
                type="date"
                value={staffDate}
                onChange={(e) => setStaffDate(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            <button
              type="button"
              onClick={() =>
                setStaffApplied({
                  status: staffStatusFilter,
                  memberId: staffMemberFilter,
                  range: staffRangeMode,
                  date: staffDate
                })
              }
              className="px-6 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold inline-flex items-center justify-center gap-1.5 shadow-sm transition-colors"
            >
              <Check className="w-3.5 h-3.5" />
              Apply
            </button>
          </div>
        </div>

        {/* Staff Summary Table Card */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="px-5 py-3.5 border-b border-slate-200 flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2 text-sm font-bold text-slate-800">
              <Users className="w-4 h-4 text-slate-500" />
              Staff summary
            </div>
            <div className="flex items-center gap-2">
              <select
                value={staffApplied.memberId}
                onChange={(e) => setStaffApplied((p) => ({ ...p, memberId: e.target.value }))}
                className="px-3 py-1.5 text-xs rounded-lg border border-slate-200 bg-white"
              >
                <option value="ALL">All staff</option>
                {instStaff.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.name}
                  </option>
                ))}
              </select>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-50 border border-indigo-200 text-indigo-700 text-xs font-semibold">
                <Users className="w-3.5 h-3.5" />
                {staffRows.length} staff in report
              </span>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50/70 text-[10px] font-bold uppercase tracking-wider text-slate-500">
                  <th className="py-3 px-4">STAFF</th>
                  <th className="py-3 px-3">ROLE</th>
                  <th className="py-3 px-3 text-center">WORKING DAYS</th>
                  <th className="py-3 px-3 text-center">HOLIDAYS</th>
                  <th className="py-3 px-3 text-center">PRESENT</th>
                  <th className="py-3 px-3 text-center">ABSENT</th>
                  <th className="py-3 px-3 text-center">LATE</th>
                  <th className="py-3 px-3 text-center">LEAVE</th>
                  <th className="py-3 px-3 text-center">UNMARKED</th>
                  <th className="py-3 px-3 text-center">FINE</th>
                  <th className="py-3 px-4 text-right">ATTENDANCE %</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs">
                {staffRows.length === 0 ? (
                  <tr>
                    <td colSpan={11} className="py-10 text-center text-slate-400">
                      No staff members match the selected filter.
                    </td>
                  </tr>
                ) : (
                  staffRows.map((row) => (
                    <tr key={row.member.id} className="hover:bg-slate-50/70">
                      <td className="py-3 px-4 font-semibold text-slate-800">
                        <span className="inline-flex items-center gap-1">
                          {row.member.name}
                          <ExternalLink className="w-3 h-3 text-slate-400" />
                        </span>
                      </td>
                      <td className="py-3 px-3 text-slate-600">{row.role}</td>
                      <td className="py-3 px-3 text-center font-semibold text-slate-700">{row.workingDays}</td>
                      <td className="py-3 px-3 text-center text-slate-500">{row.holidays}</td>
                      <td className="py-3 px-3 text-center">
                        <span className="inline-flex w-6 h-6 rounded-full bg-emerald-50 text-emerald-700 font-bold items-center justify-center text-[11px]">
                          {row.present}
                        </span>
                      </td>
                      <td className="py-3 px-3 text-center">
                        <span className="inline-flex w-6 h-6 rounded-full bg-rose-50 text-rose-600 font-bold items-center justify-center text-[11px]">
                          {row.absent}
                        </span>
                      </td>
                      <td className="py-3 px-3 text-center">
                        <span className="inline-flex w-6 h-6 rounded-full bg-amber-50 text-amber-600 font-bold items-center justify-center text-[11px]">
                          {row.late}
                        </span>
                      </td>
                      <td className="py-3 px-3 text-center">
                        <span className="inline-flex w-6 h-6 rounded-full bg-blue-50 text-blue-600 font-bold items-center justify-center text-[11px]">
                          {row.leave}
                        </span>
                      </td>
                      <td className="py-3 px-3 text-center">
                        <span className="inline-flex w-6 h-6 rounded-full bg-slate-100 text-slate-600 font-bold items-center justify-center text-[11px]">
                          {row.unmarked}
                        </span>
                      </td>
                      <td className="py-3 px-3 text-center text-slate-500">
                        {row.fine > 0 ? `PKR ${row.fine.toLocaleString()}` : '—'}
                      </td>
                      <td className="py-3 px-4 text-right font-bold text-slate-800">{row.pct}%</td>
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

  if (mode === 'consecutive') {
    return (
      <div className="p-4 sm:p-6 space-y-5 max-w-[1440px] mx-auto">
        <QuickHeader
          title="Consecutive Absences"
          onBack={() => onRouteChange?.('inst-attendance')}
          onRouteChange={onRouteChange}
          onOpenQuickPayment={onOpenQuickPayment}
        />

        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5 space-y-5">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pb-4 border-b border-slate-100">
            <div>
              <div className="flex items-center gap-2 text-sm font-bold text-slate-800">
                <Users className="w-4 h-4 text-rose-500" />
                Consecutive absences
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Students absent on {consecApplied.minDays}+ marked days in a row, up to their latest attendance.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <select
                value={consecMinDays}
                onChange={(e) => setConsecMinDays(Number(e.target.value))}
                className="px-3 py-1.5 text-xs rounded-md border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value={2}>2+ days</option>
                <option value={3}>3+ days</option>
                <option value={5}>5+ days</option>
                <option value={7}>7+ days</option>
              </select>
              <select
                value={consecClass}
                onChange={(e) => setConsecClass(e.target.value)}
                className="px-3 py-1.5 text-xs rounded-md border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="ALL">All classes</option>
                {availableClasses.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
              <button
                type="button"
                onClick={() => setConsecApplied({ minDays: consecMinDays, className: consecClass })}
                className="px-4 py-1.5 rounded-md bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold transition-colors"
              >
                Apply
              </button>
            </div>
          </div>

          {consecutiveDefaulters.length === 0 ? (
            <div className="py-12 text-center space-y-2">
              <div className="w-8 h-8 rounded-full bg-emerald-600 text-white flex items-center justify-center mx-auto">
                <Check className="w-4 h-4" />
              </div>
              <p className="text-xs text-slate-500">
                No student has been absent for {consecApplied.minDays}+ days in a row.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-50 text-[10px] font-bold uppercase text-slate-500">
                    <th className="py-2.5 px-3">#</th>
                    <th className="py-2.5 px-3">Student</th>
                    <th className="py-2.5 px-3">Class</th>
                    <th className="py-2.5 px-3">Streak</th>
                    <th className="py-2.5 px-3 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {consecutiveDefaulters.map((item, idx) => (
                    <tr key={item.student.id} className="hover:bg-slate-50">
                      <td className="py-3 px-3 text-slate-500">{idx + 1}</td>
                      <td className="py-3 px-3 font-semibold text-slate-800">{item.student.name}</td>
                      <td className="py-3 px-3 text-slate-600">{item.student.className}</td>
                      <td className="py-3 px-3">
                        <span className="px-2 py-0.5 rounded-full bg-rose-100 text-rose-700 font-bold text-[11px]">
                          {item.streak} days
                        </span>
                      </td>
                      <td className="py-3 px-3 text-right space-x-2">
                        <button
                          type="button"
                          onClick={() => toast.success(`Alert SMS sent for ${item.student.name}`)}
                          className="inline-flex items-center gap-1 px-2.5 py-1 rounded border border-sky-200 text-sky-600 hover:bg-sky-50 text-[11px] font-semibold"
                        >
                          <Send className="w-3 h-3" />
                          Notify Parent
                        </button>
                        <button
                          type="button"
                          onClick={() => onOpenProfile?.(item.student.id)}
                          className="px-2.5 py-1 rounded bg-slate-700 text-white text-[11px] font-semibold"
                        >
                          Profile
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    )
  }

  // ============================================================================
  // MODE: LOW ATTENDANCE
  // ============================================================================
  const classStudentsForLow =
    lowClass === 'ALL' ? [] : instStudents.filter((s) => s.className === lowClass)

  return (
    <div className="p-4 sm:p-6 space-y-5 max-w-[1440px] mx-auto">
      <QuickHeader
        title="Low Attendance"
        onBack={() => onRouteChange?.('inst-attendance')}
        onRouteChange={onRouteChange}
        onOpenQuickPayment={onOpenQuickPayment}
      />

      {/* 2 KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-4 flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-lg bg-rose-600 text-white flex items-center justify-center shrink-0">
            <Users className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs font-medium text-slate-500">Eligible defaulters</p>
            <p className="text-xl font-bold text-slate-900 leading-tight">{lowAttendanceDefaulters.length}</p>
            <p className="text-[11px] text-slate-400">{lowMonthLabel}</p>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-4 flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-lg bg-cyan-500 text-white flex items-center justify-center shrink-0">
            <Calendar className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs font-medium text-slate-500">Count Mode</p>
            <p className="text-xl font-bold text-slate-900 leading-tight">{countModeLabel}</p>
            <p className="text-[11px] text-slate-400">{graceLeaves} grace leave(s)</p>
          </div>
        </div>
      </div>

      {/* Low Attendance Main Card */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5 space-y-5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-sm font-bold text-slate-800">
            <AlertTriangle className="w-4 h-4 text-slate-600" />
            Low Attendance — {lowMonthLabel}
          </div>
          <button
            type="button"
            onClick={() => onRouteChange?.('inst-attendance-settings')}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md border border-blue-200 bg-white hover:bg-blue-50 text-blue-600 text-xs font-semibold transition-colors"
          >
            <Settings className="w-3.5 h-3.5" />
            Settings
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-[1fr_1fr_1.3fr_auto] gap-3 items-end">
          <div>
            <label className="block text-[11px] font-semibold text-slate-600 mb-1">Month</label>
            <input
              type="month"
              value={lowMonth}
              onChange={(e) => setLowMonth(e.target.value)}
              className="w-full px-3 py-2 text-xs rounded-md border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-[11px] font-semibold text-slate-600 mb-1">Class</label>
            <select
              value={lowClass}
              onChange={(e) => {
                setLowClass(e.target.value)
                setLowStudentId('ALL')
              }}
              className="w-full px-3 py-2 text-xs rounded-md border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="ALL">All Classes</option>
              {availableClasses.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-[11px] font-semibold text-slate-600 mb-1">
              Student <span className="font-normal text-slate-400">(optional)</span>
            </label>
            <select
              disabled={lowClass === 'ALL'}
              value={lowStudentId}
              onChange={(e) => setLowStudentId(e.target.value)}
              className="w-full px-3 py-2 text-xs rounded-md border border-slate-200 bg-white disabled:bg-slate-50 disabled:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="ALL">{lowClass === 'ALL' ? 'Select class first...' : 'All students in class'}</option>
              {classStudentsForLow.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name}
                </option>
              ))}
            </select>
          </div>
          <button
            type="button"
            onClick={() =>
              setLowApplied({ month: lowMonth, className: lowClass, studentId: lowStudentId })
            }
            className="px-6 py-2 rounded-md bg-blue-500 hover:bg-blue-600 text-white text-xs font-semibold transition-colors"
          >
            Apply Filters
          </button>
        </div>

        {lowAttendanceDefaulters.length === 0 ? (
          <div className="py-12 text-center space-y-3">
            <div className="w-10 h-10 rounded-full bg-emerald-600 text-white flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <div className="text-sm font-bold text-emerald-700">No Attendance Defaulters</div>
            <p className="text-xs text-slate-400">
              No students exceeded grace leaves ({graceLeaves}) in {lowMonthLabel}.
            </p>
            <div>
              <button
                type="button"
                onClick={() => onRouteChange?.('inst-attendance-settings')}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-md bg-blue-500 hover:bg-blue-600 text-white text-xs font-semibold transition-colors"
              >
                <Settings className="w-3.5 h-3.5" />
                Adjust Settings
              </button>
            </div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50 text-[10px] font-bold uppercase text-slate-500">
                  <th className="py-2.5 px-3">#</th>
                  <th className="py-2.5 px-3">Student</th>
                  <th className="py-2.5 px-3">Class</th>
                  <th className="py-2.5 px-3">Absences</th>
                  <th className="py-2.5 px-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {lowAttendanceDefaulters.map((item, idx) => (
                  <tr key={item.student.id} className="hover:bg-slate-50">
                    <td className="py-3 px-3 text-slate-500">{idx + 1}</td>
                    <td className="py-3 px-3 font-semibold text-slate-800">{item.student.name}</td>
                    <td className="py-3 px-3 text-slate-600">{item.student.className}</td>
                    <td className="py-3 px-3">
                      <span className="px-2 py-0.5 rounded-full bg-rose-100 text-rose-700 font-bold text-[11px]">
                        {item.absences} absences
                      </span>
                    </td>
                    <td className="py-3 px-3 text-right space-x-2">
                      <button
                        type="button"
                        onClick={() => toast.success(`Low attendance warning SMS sent for ${item.student.name}`)}
                        className="inline-flex items-center gap-1 px-2.5 py-1 rounded border border-sky-200 text-sky-600 hover:bg-sky-50 text-[11px] font-semibold"
                      >
                        <Send className="w-3 h-3" />
                        Send Warning
                      </button>
                      <button
                        type="button"
                        onClick={() => onOpenProfile?.(item.student.id)}
                        className="px-2.5 py-1 rounded bg-slate-700 text-white text-[11px] font-semibold"
                      >
                        Profile
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}

export default AttendanceReportsViews
