import React, { useState, useMemo, useEffect } from 'react'
import {
  ArrowLeft,
  FileText,
  UserPlus,
  CreditCard,
  Receipt,
  ArrowDownCircle,
  MessageSquare,
  Plus,
  Filter,
  X,
  Eye,
  Printer,
  FileDown,
  Trash2,
  User,
  Calendar
} from 'lucide-react'
import { useAppData } from '../../../context/AppDataContext'
import { useToast } from '../../../context/ToastContext'
import { isClassAllowedForTier } from '../../../utils/tierGating'
import Modal from '../../../components/common/Modal'

const SHORT_MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

const formatDisplayDate = (iso) => {
  if (!iso) return '—'
  const clean = String(iso).slice(0, 10)
  const parts = clean.split('-')
  if (parts.length !== 3) return clean
  const [y, m, d] = parts
  return `${d.padStart(2, '0')} ${SHORT_MONTHS[Number(m) - 1] || m} ${y}`
}

const formatPeriodLabel = (fromIso, toIso) => {
  if (!fromIso && !toIso) return '—'
  const fmtShort = (iso) => {
    if (!iso) return ''
    const parts = String(iso).slice(0, 10).split('-')
    if (parts.length !== 3) return iso
    return `${parts[2].padStart(2, '0')} ${SHORT_MONTHS[Number(parts[1]) - 1] || parts[1]}`
  }
  const toFull = formatDisplayDate(toIso || fromIso)
  return `${fmtShort(fromIso || toIso)} - ${toFull}`
}

const getStorageKey = (instId) => `eims_perf_reports_${instId || 'default'}`

const loadReports = (instId) => {
  try {
    const raw = localStorage.getItem(getStorageKey(instId))
    const parsed = raw ? JSON.parse(raw) : []
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

const saveReports = (instId, list) => {
  try {
    localStorage.setItem(getStorageKey(instId), JSON.stringify(list))
  } catch {
    // ignore storage errors
  }
}

const REPORT_TYPE_STYLES = {
  Weekly: 'bg-cyan-500 text-white',
  Monthly: 'bg-indigo-600 text-white',
  Term: 'bg-purple-600 text-white',
  Yearly: 'bg-orange-600 text-white'
}

export const StudentPerformanceReportsView = ({
  currentInstitute,
  onRouteChange,
  onOpenProfile,
  onOpenQuickPayment
}) => {
  const { students = [], attendance = [], marks = [], logAuditEvent } = useAppData()
  const { toast } = useToast()

  const instId = currentInstitute?.id || 'default'

  const instStudents = useMemo(
    () =>
      students.filter(
        (s) =>
          (!currentInstitute?.id || !s.instituteId || s.instituteId === currentInstitute.id) &&
          isClassAllowedForTier(s.className, currentInstitute)
      ),
    [students, currentInstitute]
  )

  const [reports, setReports] = useState(() => loadReports(instId))

  useEffect(() => {
    setReports(loadReports(instId))
  }, [instId])

  const persistReports = (updater) => {
    setReports((prev) => {
      const next = typeof updater === 'function' ? updater(prev) : updater
      saveReports(instId, next)
      return next
    })
  }

  // Filter state
  const [searchInput, setSearchInput] = useState('')
  const [typeInput, setTypeInput] = useState('ALL')
  const [fromDateInput, setFromDateInput] = useState('')
  const [toDateInput, setToDateInput] = useState('')
  const [appliedFilter, setAppliedFilter] = useState({
    search: '',
    type: 'ALL',
    fromDate: '',
    toDate: ''
  })

  // Modals
  const [generateOpen, setGenerateOpen] = useState(false)
  const [genForm, setGenForm] = useState({
    studentId: '',
    reportType: 'Weekly',
    fromDate: new Date(Date.now() - 7 * 86400000).toISOString().slice(0, 10),
    toDate: new Date().toISOString().slice(0, 10),
    remarks: ''
  })
  const [genStudentSearch, setGenStudentSearch] = useState('')
  const [viewReport, setViewReport] = useState(null)
  const [deleteTarget, setDeleteTarget] = useState(null)

  const filteredReports = useMemo(() => {
    return reports.filter((r) => {
      if (appliedFilter.type !== 'ALL' && r.reportType !== appliedFilter.type) return false
      if (appliedFilter.fromDate && String(r.reportDate || '') < appliedFilter.fromDate) return false
      if (appliedFilter.toDate && String(r.reportDate || '') > appliedFilter.toDate) return false
      if (appliedFilter.search.trim()) {
        const q = appliedFilter.search.trim().toLowerCase()
        const match =
          (r.studentName || '').toLowerCase().includes(q) ||
          (r.rollNumber || '').toLowerCase().includes(q) ||
          (r.admissionNo || '').toLowerCase().includes(q)
        if (!match) return false
      }
      return true
    })
  }, [reports, appliedFilter])

  const computeStudentAttendancePct = (studentId, fromDate, toDate) => {
    const records = attendance.filter((a) => {
      if ((a.studentId || a.student_id) !== studentId) return false
      const dt = String(a.date || '').slice(0, 10)
      if (fromDate && dt && dt < fromDate) return false
      if (toDate && dt && dt > toDate) return false
      return true
    })
    if (records.length === 0) return 0
    const present = records.filter((r) =>
      ['present', 'late'].includes(String(r.status || '').toLowerCase())
    ).length
    return Number(((present / records.length) * 100).toFixed(1))
  }

  const handleGenerateReport = (e) => {
    e.preventDefault()
    if (!genForm.studentId) {
      toast.warning('Please select a student')
      return
    }
    const st = instStudents.find((s) => s.id === genForm.studentId)
    if (!st) return

    const attPct = computeStudentAttendancePct(st.id, genForm.fromDate, genForm.toDate)
    const stMarks = marks.filter((m) => (m.studentId || m.student_id) === st.id)
    const avgScore =
      stMarks.length > 0
        ? Number(
            (
              stMarks.reduce((sum, m) => {
                const obt = Number(m.obtainedMarks ?? m.marksObtained ?? 0)
                const tot = Number(m.totalMarks ?? m.maxMarks ?? 100) || 100
                return sum + (obt / tot) * 100
              }, 0) / stMarks.length
            ).toFixed(1)
          )
        : null

    const newReport = {
      id: `rep_${Date.now()}`,
      studentId: st.id,
      studentName: st.name,
      parentName: st.guardianName || st.fatherName || '',
      rollNumber: st.rollNumber || '',
      admissionNo: st.admissionNo || '',
      className: st.className || '—',
      reportType: genForm.reportType,
      reportDate: genForm.toDate || new Date().toISOString().slice(0, 10),
      fromDate: genForm.fromDate,
      toDate: genForm.toDate,
      attendancePct: attPct,
      avgScorePct: avgScore,
      remarks: genForm.remarks.trim() || 'Satisfactory academic and attendance progress.'
    }

    persistReports((prev) => [newReport, ...prev])
    logAuditEvent?.('PERF_REPORT_GENERATED', `Generated ${newReport.reportType} report for ${st.name}`, {
      reportId: newReport.id
    })
    toast.success(`${newReport.reportType} performance report generated for ${st.name}`)
    setGenerateOpen(false)
    setGenForm({
      studentId: '',
      reportType: 'Weekly',
      fromDate: new Date(Date.now() - 7 * 86400000).toISOString().slice(0, 10),
      toDate: new Date().toISOString().slice(0, 10),
      remarks: ''
    })
    setGenStudentSearch('')
  }

  const handlePrintReport = (rep) => {
    const win = window.open('', '_blank', 'width=850,height=700')
    if (!win) {
      toast.warning('Please allow pop-ups to print the performance report')
      return
    }
    const instName = currentInstitute?.name || 'Institute Management System'
    win.document.write(`
      <!doctype html>
      <html>
        <head>
          <title>Performance Report - ${rep.studentName}</title>
          <style>
            body { font-family: Arial, sans-serif; padding: 32px; color: #1e293b; }
            .header { border-bottom: 2px solid #1d4ed8; padding-bottom: 12px; margin-bottom: 20px; display: flex; justify-content: space-between; align-items: center; }
            .title { font-size: 20px; font-weight: bold; color: #0f172a; }
            .badge { background: #2563eb; color: #fff; padding: 4px 10px; border-radius: 4px; font-size: 12px; font-weight: bold; }
            .grid { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin-bottom: 20px; background: #f8fafc; padding: 16px; border-radius: 8px; border: 1px solid #e2e8f0; }
            .label { font-size: 11px; color: #64748b; text-transform: uppercase; }
            .val { font-size: 14px; font-weight: bold; margin-top: 2px; }
            .box { border: 1px solid #e2e8f0; border-radius: 8px; padding: 16px; margin-bottom: 16px; }
            @media print { body { padding: 16px; } }
          </style>
        </head>
        <body>
          <div class="header">
            <div>
              <div class="title">${instName}</div>
              <div style="font-size:13px;color:#475569;margin-top:4px;">Student Performance Report</div>
            </div>
            <span class="badge">${rep.reportType} Report</span>
          </div>
          <div class="grid">
            <div><div class="label">Student Name</div><div class="val">${rep.studentName}</div></div>
            <div><div class="label">Class</div><div class="val">${rep.className}</div></div>
            <div><div class="label">Roll / Admission No</div><div class="val">${rep.rollNumber || '—'} / ${rep.admissionNo || '—'}</div></div>
            <div><div class="label">Guardian</div><div class="val">${rep.parentName || '—'}</div></div>
            <div><div class="label">Report Period</div><div class="val">${formatPeriodLabel(rep.fromDate, rep.toDate)}</div></div>
            <div><div class="label">Report Date</div><div class="val">${formatDisplayDate(rep.reportDate)}</div></div>
          </div>
          <div class="box">
            <div class="label">Attendance Summary</div>
            <div class="val" style="font-size:18px;margin-top:6px;">${Number(rep.attendancePct || 0).toFixed(1)}%</div>
          </div>
          <div class="box">
            <div class="label">Academic Average</div>
            <div class="val" style="font-size:18px;margin-top:6px;">${rep.avgScorePct !== null && rep.avgScorePct !== undefined ? `${rep.avgScorePct}%` : 'No exam scores recorded in period'}</div>
          </div>
          <div class="box">
            <div class="label">Teacher / Admin Remarks</div>
            <p style="font-size:13px;line-height:1.5;margin:6px 0 0;">${rep.remarks || '—'}</p>
          </div>
          <script>window.onload = function(){ window.print(); }</script>
        </body>
      </html>
    `)
    win.document.close()
  }

  return (
    <div className="p-4 sm:p-6 space-y-5 max-w-[1440px] mx-auto">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <FileText className="w-5 h-5 text-slate-600" />
            <h1 className="text-xl font-bold text-slate-900 tracking-tight">Student Performance Reports</h1>
          </div>
          <button
            type="button"
            onClick={() => onRouteChange?.('inst-students')}
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

      {/* Main Blue-Header Card */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="px-5 py-3 bg-[#1e88e5] text-white flex items-center justify-between">
          <div className="flex items-center gap-2 text-sm font-semibold">
            <FileText className="w-4 h-4" />
            Student Performance Reports
          </div>
          <button
            type="button"
            onClick={() => setGenerateOpen(true)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded bg-white hover:bg-slate-50 text-slate-800 text-xs font-semibold shadow-sm transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            Generate New Report
          </button>
        </div>

        <div className="p-5 space-y-5">
          {/* Filter Row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-[1.4fr_1fr_1fr_1fr_auto] gap-3 items-center">
            <input
              type="text"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder="Search by student name..."
              className="w-full px-3 py-2 text-xs rounded-md border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <select
              value={typeInput}
              onChange={(e) => setTypeInput(e.target.value)}
              className="w-full px-3 py-2 text-xs rounded-md border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="ALL">All Types</option>
              <option value="Weekly">Weekly</option>
              <option value="Monthly">Monthly</option>
              <option value="Term">Term</option>
              <option value="Yearly">Yearly</option>
            </select>
            <input
              type="date"
              value={fromDateInput}
              onChange={(e) => setFromDateInput(e.target.value)}
              className="w-full px-3 py-2 text-xs rounded-md border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <input
              type="date"
              value={toDateInput}
              onChange={(e) => setToDateInput(e.target.value)}
              className="w-full px-3 py-2 text-xs rounded-md border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={() =>
                  setAppliedFilter({
                    search: searchInput,
                    type: typeInput,
                    fromDate: fromDateInput,
                    toDate: toDateInput
                  })
                }
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-md bg-cyan-500 hover:bg-cyan-600 text-white text-xs font-semibold transition-colors"
              >
                <Filter className="w-3.5 h-3.5" />
                Filter
              </button>
              <button
                type="button"
                onClick={() => {
                  setSearchInput('')
                  setTypeInput('ALL')
                  setFromDateInput('')
                  setToDateInput('')
                  setAppliedFilter({ search: '', type: 'ALL', fromDate: '', toDate: '' })
                }}
                className="inline-flex items-center gap-1 px-3 py-2 rounded-md bg-slate-500 hover:bg-slate-600 text-white text-xs font-semibold transition-colors"
              >
                <X className="w-3.5 h-3.5" />
                Clear
              </button>
            </div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto border border-slate-200 rounded-lg">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-[11px] font-semibold text-slate-600">
                  <th className="py-3 px-4 w-12">#</th>
                  <th className="py-3 px-4 min-w-[220px]">Student Name</th>
                  <th className="py-3 px-4">Class</th>
                  <th className="py-3 px-4">Report Type</th>
                  <th className="py-3 px-4">Report Date</th>
                  <th className="py-3 px-4">Period</th>
                  <th className="py-3 px-4">Attendance %</th>
                  <th className="py-3 px-4 w-44">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs">
                {filteredReports.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="py-14 text-center text-slate-400">
                      No performance reports generated yet. Click <strong>+ Generate New Report</strong> to create one.
                    </td>
                  </tr>
                ) : (
                  filteredReports.map((rep, idx) => {
                    const pct = Number(rep.attendancePct || 0)
                    const pctCls =
                      pct >= 75
                        ? 'bg-emerald-600 text-white'
                        : pct >= 50
                          ? 'bg-amber-500 text-white'
                          : 'bg-rose-600 text-white'
                    const typeCls = REPORT_TYPE_STYLES[rep.reportType] || 'bg-slate-600 text-white'

                    return (
                      <tr key={rep.id} className="hover:bg-slate-50/70">
                        <td className="py-3.5 px-4 text-slate-600">{idx + 1}</td>
                        <td className="py-3.5 px-4">
                          <button
                            type="button"
                            onClick={() => onOpenProfile?.(rep.studentId)}
                            className="font-semibold text-slate-800 hover:text-blue-600 hover:underline text-left"
                          >
                            {rep.studentName}
                          </button>
                          {rep.parentName && (
                            <div className="text-[11px] text-slate-400 flex items-center gap-1 mt-0.5">
                              <User className="w-3 h-3" />
                              {rep.parentName}
                            </div>
                          )}
                          <div className="flex flex-wrap items-center gap-1.5 mt-1.5">
                            {rep.rollNumber && (
                              <span className="px-1.5 py-0.5 rounded bg-purple-50 text-purple-700 border border-purple-200 text-[10px] font-semibold">
                                Roll No: {rep.rollNumber}
                              </span>
                            )}
                            {rep.admissionNo && (
                              <span className="px-1.5 py-0.5 rounded bg-blue-50 text-blue-700 border border-blue-200 text-[10px] font-semibold">
                                Ad No: {rep.admissionNo}
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="py-3.5 px-4 text-slate-700 font-medium">{rep.className}</td>
                        <td className="py-3.5 px-4">
                          <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-semibold ${typeCls}`}>
                            {rep.reportType}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 text-slate-600">{formatDisplayDate(rep.reportDate)}</td>
                        <td className="py-3.5 px-4 text-slate-600">
                          {formatPeriodLabel(rep.fromDate, rep.toDate)}
                        </td>
                        <td className="py-3.5 px-4">
                          <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold ${pctCls}`}>
                            {pct.toFixed(1)}%
                          </span>
                        </td>
                        <td className="py-3.5 px-4">
                          <div className="inline-flex items-center rounded overflow-hidden shadow-sm">
                            <button
                              type="button"
                              onClick={() => setViewReport(rep)}
                              title="View Report"
                              className="p-2 bg-cyan-500 hover:bg-cyan-600 text-white transition-colors"
                            >
                              <Eye className="w-3.5 h-3.5" />
                            </button>
                            <button
                              type="button"
                              onClick={() => handlePrintReport(rep)}
                              title="Print Report"
                              className="p-2 bg-blue-500 hover:bg-blue-600 text-white transition-colors"
                            >
                              <Printer className="w-3.5 h-3.5" />
                            </button>
                            <button
                              type="button"
                              onClick={() => handlePrintReport(rep)}
                              title="Export PDF"
                              className="p-2 bg-emerald-600 hover:bg-emerald-700 text-white transition-colors"
                            >
                              <FileDown className="w-3.5 h-3.5" />
                            </button>
                            <button
                              type="button"
                              onClick={() => setDeleteTarget(rep)}
                              title="Delete Report"
                              className="p-2 bg-rose-600 hover:bg-rose-700 text-white transition-colors"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    )
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Generate New Report Modal */}
      {generateOpen && (
        <Modal
          isOpen
          onClose={() => setGenerateOpen(false)}
          title="Generate New Performance Report"
          maxWidth="max-w-md"
        >
          <form onSubmit={handleGenerateReport} className="space-y-3.5 text-xs">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Student</label>
              <input
                type="text"
                value={genStudentSearch}
                onChange={(e) => setGenStudentSearch(e.target.value)}
                placeholder="Search student by name or roll..."
                className="w-full px-3 py-2 mb-1.5 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <select
                required
                value={genForm.studentId}
                onChange={(e) => setGenForm((p) => ({ ...p, studentId: e.target.value }))}
                className="w-full px-3 py-2 rounded-lg border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Select student...</option>
                {instStudents
                  .filter((st) => {
                    const q = genStudentSearch.trim().toLowerCase()
                    if (!q) return true
                    return (
                      (st.name || '').toLowerCase().includes(q) ||
                      (st.rollNumber || '').toLowerCase().includes(q)
                    )
                  })
                  .slice(0, 60)
                  .map((st) => (
                    <option key={st.id} value={st.id}>
                      {st.name} ({st.className || 'N/A'} • Roll: {st.rollNumber || '—'})
                    </option>
                  ))}
              </select>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Report Type</label>
              <select
                value={genForm.reportType}
                onChange={(e) => setGenForm((p) => ({ ...p, reportType: e.target.value }))}
                className="w-full px-3 py-2 rounded-lg border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="Weekly">Weekly</option>
                <option value="Monthly">Monthly</option>
                <option value="Term">Term</option>
                <option value="Yearly">Yearly</option>
              </select>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Period From</label>
                <input
                  type="date"
                  required
                  value={genForm.fromDate}
                  onChange={(e) => setGenForm((p) => ({ ...p, fromDate: e.target.value }))}
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Period To</label>
                <input
                  type="date"
                  required
                  value={genForm.toDate}
                  onChange={(e) => setGenForm((p) => ({ ...p, toDate: e.target.value }))}
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Remarks / Evaluation</label>
              <textarea
                rows={3}
                value={genForm.remarks}
                onChange={(e) => setGenForm((p) => ({ ...p, remarks: e.target.value }))}
                placeholder="Teacher notes, behavior, and academic feedback..."
                className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setGenerateOpen(false)}
                className="px-3.5 py-1.5 rounded-lg border border-slate-200 text-slate-600 font-semibold hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-semibold"
              >
                Generate Report
              </button>
            </div>
          </form>
        </Modal>
      )}

      {/* View Report Modal */}
      {viewReport && (
        <Modal
          isOpen
          onClose={() => setViewReport(null)}
          title={`${viewReport.reportType} Performance Report — ${viewReport.studentName}`}
          maxWidth="max-w-lg"
        >
          <div className="space-y-4 text-xs">
            <div className="grid grid-cols-2 gap-3 bg-slate-50 p-3.5 rounded-lg border border-slate-200">
              <div>
                <span className="text-slate-400 block">Student</span>
                <span className="font-semibold text-slate-800">{viewReport.studentName}</span>
              </div>
              <div>
                <span className="text-slate-400 block">Class</span>
                <span className="font-semibold text-slate-800">{viewReport.className}</span>
              </div>
              <div>
                <span className="text-slate-400 block">Period</span>
                <span className="font-semibold text-slate-800">
                  {formatPeriodLabel(viewReport.fromDate, viewReport.toDate)}
                </span>
              </div>
              <div>
                <span className="text-slate-400 block">Attendance %</span>
                <span className="font-bold text-slate-900">{Number(viewReport.attendancePct || 0).toFixed(1)}%</span>
              </div>
              <div>
                <span className="text-slate-400 block">Academic Average</span>
                <span className="font-semibold text-slate-800">
                  {viewReport.avgScorePct !== null && viewReport.avgScorePct !== undefined
                    ? `${viewReport.avgScorePct}%`
                    : 'Not recorded'}
                </span>
              </div>
              <div>
                <span className="text-slate-400 block">Report Date</span>
                <span className="font-semibold text-slate-800">{formatDisplayDate(viewReport.reportDate)}</span>
              </div>
            </div>

            <div>
              <span className="text-slate-500 font-semibold block mb-1">Remarks</span>
              <div className="p-3 rounded-lg border border-slate-200 bg-white text-slate-700">
                {viewReport.remarks}
              </div>
            </div>

            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setViewReport(null)}
                className="px-3.5 py-1.5 rounded-lg border border-slate-200 text-slate-600 font-semibold hover:bg-slate-50"
              >
                Close
              </button>
              <button
                type="button"
                onClick={() => handlePrintReport(viewReport)}
                className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-semibold"
              >
                <Printer className="w-3.5 h-3.5" />
                Print / PDF
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* Delete Confirmation Modal */}
      {deleteTarget && (
        <Modal
          isOpen
          onClose={() => setDeleteTarget(null)}
          title="Delete Performance Report"
          maxWidth="max-w-sm"
        >
          <div className="space-y-4 text-xs">
            <p className="text-slate-600">
              Delete the <strong>{deleteTarget.reportType}</strong> report for{' '}
              <strong className="text-slate-900">{deleteTarget.studentName}</strong>?
            </p>
            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setDeleteTarget(null)}
                className="px-3.5 py-1.5 rounded-lg border border-slate-200 text-slate-600 font-semibold hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  persistReports((prev) => prev.filter((r) => r.id !== deleteTarget.id))
                  toast.success('Performance report deleted')
                  setDeleteTarget(null)
                }}
                className="px-4 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-700 text-white font-semibold"
              >
                Delete
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  )
}

export default StudentPerformanceReportsView
