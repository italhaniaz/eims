import React, { useState, useMemo, useEffect } from 'react'
import {
  ArrowLeft,
  FileText,
  UserPlus,
  CreditCard,
  Receipt,
  ArrowDownCircle,
  MessageSquare,
  Users,
  QrCode,
  Calendar,
  Filter,
  Check,
  X,
  Clock,
  Printer,
  Send,
  User,
  Building2,
  ExternalLink,
  ChevronLeft,
  ChevronRight,
  CheckCircle2,
  Save
} from 'lucide-react'
import { useAppData } from '../../../context/AppDataContext'
import { useToast } from '../../../context/ToastContext'
import { getDistinctInstituteClassNames, isClassAllowedForTier } from '../../../utils/tierGating'
import Modal from '../../../components/common/Modal'

const PAGE_SIZE = 30

const getAttStorageKey = (instId, date, type) =>
  `eims_daily_mark_att_${instId || 'default'}_${date}_${type || 'General'}`

const loadMarkedMap = (instId, date, type) => {
  try {
    const raw = localStorage.getItem(getAttStorageKey(instId, date, type))
    const parsed = raw ? JSON.parse(raw) : {}
    return parsed && typeof parsed === 'object' ? parsed : {}
  } catch {
    return {}
  }
}

const saveMarkedMap = (instId, date, type, map) => {
  try {
    localStorage.setItem(getAttStorageKey(instId, date, type), JSON.stringify(map))
  } catch {
    // ignore storage errors
  }
}

export const MarkAttendanceView = ({
  currentInstitute,
  onRouteChange,
  onSwitchToStaff,
  onOpenProfile,
  onOpenQuickPayment
}) => {
  const { students = [], classes = [], logAuditEvent } = useAppData()
  const { toast } = useToast()

  const instId = currentInstitute?.id || 'default'

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

  // Header live date-time badge
  const nowLabel = useMemo(() => {
    const d = new Date()
    const datePart = d.toLocaleDateString('en-GB', {
      weekday: 'long',
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    })
    const timePart = d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    return `${datePart} · ${timePart}`
  }, [])

  const todayIso = useMemo(() => new Date().toISOString().slice(0, 10), [])

  // Filter inputs
  const [classInput, setClassInput] = useState('ALL')
  const [dateInput, setDateInput] = useState(todayIso)
  const [typeInput, setTypeInput] = useState('General')
  const [showInput, setShowInput] = useState('ALL')
  const [searchInput, setSearchInput] = useState('')

  // Applied filters
  const [applied, setApplied] = useState({
    className: 'ALL',
    date: todayIso,
    type: 'General',
    show: 'ALL',
    search: ''
  })

  // Attendance state: { [studentId]: { status: 'Present'|'Absent'|'Late'|'Leave', comment: string } }
  const [markedMap, setMarkedMap] = useState(() => loadMarkedMap(instId, todayIso, 'General'))
  const [selectedIds, setSelectedIds] = useState([])
  const [currentPage, setCurrentPage] = useState(1)
  const [qrModalOpen, setQrModalOpen] = useState(false)
  const [qrCodeInput, setQrCodeInput] = useState('')

  useEffect(() => {
    setMarkedMap(loadMarkedMap(instId, applied.date, applied.type))
  }, [instId, applied.date, applied.type])

  const updateStudentMark = (studentId, patch) => {
    setMarkedMap((prev) => {
      const next = {
        ...prev,
        [studentId]: { ...(prev[studentId] || {}), ...patch }
      }
      saveMarkedMap(instId, applied.date, applied.type, next)
      return next
    })
  }

  // Filtered students
  const filteredStudents = useMemo(() => {
    return instStudents.filter((s) => {
      if (applied.className !== 'ALL' && s.className !== applied.className) return false
      if (applied.show !== 'ALL') {
        const st = markedMap[s.id]?.status || ''
        if (applied.show === 'Unmarked' && st) return false
        if (applied.show !== 'Unmarked' && st !== applied.show) return false
      }
      if (applied.search.trim()) {
        const q = applied.search.trim().toLowerCase()
        const match =
          (s.name || '').toLowerCase().includes(q) ||
          (s.rollNumber || '').toLowerCase().includes(q) ||
          (s.admissionNo || '').toLowerCase().includes(q)
        if (!match) return false
      }
      return true
    })
  }, [instStudents, applied, markedMap])

  // Pagination
  const totalCount = filteredStudents.length
  const totalPages = Math.max(1, Math.ceil(totalCount / PAGE_SIZE))
  const safePage = Math.min(currentPage, totalPages)
  const startIdx = totalCount === 0 ? 0 : (safePage - 1) * PAGE_SIZE
  const paginatedStudents = filteredStudents.slice(startIdx, startIdx + PAGE_SIZE)

  useEffect(() => {
    setCurrentPage(1)
  }, [applied])

  // Bulk mark helper
  const handleBulkMark = (status) => {
    const targetList =
      selectedIds.length > 0
        ? filteredStudents.filter((s) => selectedIds.includes(s.id))
        : filteredStudents
    if (targetList.length === 0) {
      toast.warning('No students to mark')
      return
    }
    setMarkedMap((prev) => {
      const next = { ...prev }
      for (const s of targetList) {
        next[s.id] = { ...(next[s.id] || {}), status }
      }
      saveMarkedMap(instId, applied.date, applied.type, next)
      return next
    })
    logAuditEvent?.('ATTENDANCE_BULK_MARKED', `Marked ${targetList.length} student(s) as ${status}`, {
      date: applied.date,
      status
    })
    toast.success(`Marked ${targetList.length} student(s) as ${status}`)
  }

  const handleSendSms = (student) => {
    const status = markedMap[student.id]?.status || 'Unmarked'
    const phone = student.guardianPhone || student.fatherPhone || student.parentPhone || student.phone
    if (!phone) {
      toast.warning(`No parent phone number on file for ${student.name}`)
      return
    }
    logAuditEvent?.('ATTENDANCE_SMS_SENT', `Sent ${status} SMS alert for ${student.name}`, {
      studentId: student.id,
      phone
    })
    toast.success(`Attendance SMS (${status}) queued for ${student.name} (${phone})`)
  }

  const handlePrintBlankSheet = () => {
    const win = window.open('', '_blank', 'width=900,height=700')
    if (!win) {
      toast.warning('Please allow pop-ups to print blank attendance sheet')
      return
    }
    const rowsHtml = filteredStudents
      .slice(0, 100)
      .map(
        (s, i) => `
        <tr>
          <td>${i + 1}</td>
          <td>${s.rollNumber || '—'}</td>
          <td>${s.name}</td>
          <td>${s.className || '—'} ${s.section ? `(${s.section})` : ''}</td>
          <td></td><td></td><td></td><td></td>
        </tr>
      `
      )
      .join('')
    win.document.write(`
      <!doctype html>
      <html>
        <head>
          <title>Blank Attendance Sheet</title>
          <style>
            body { font-family: Arial, sans-serif; padding: 24px; color: #1e293b; }
            h2 { margin: 0 0 4px; }
            p { margin: 0 0 16px; font-size: 12px; color: #64748b; }
            table { width: 100%; border-collapse: collapse; font-size: 11px; }
            th, td { border: 1px solid #cbd5e1; padding: 6px 8px; text-align: left; }
            th { background: #f1f5f9; }
          </style>
        </head>
        <body>
          <h2>${currentInstitute?.name || 'Institute'} — Attendance Sheet</h2>
          <p>Class: ${applied.className === 'ALL' ? 'All Classes' : applied.className} | Date: ${applied.date} | Type: ${applied.type}</p>
          <table>
            <thead>
              <tr><th>#</th><th>Roll No</th><th>Student Name</th><th>Class</th><th>P</th><th>A</th><th>L</th><th>Leave</th></tr>
            </thead>
            <tbody>${rowsHtml}</tbody>
          </table>
          <script>window.onload = function(){ window.print(); }</script>
        </body>
      </html>
    `)
    win.document.close()
  }

  const handleQrScanSubmit = (e) => {
    e.preventDefault()
    const q = qrCodeInput.trim().toLowerCase()
    if (!q) return
    const match = instStudents.find(
      (s) =>
        String(s.rollNumber || '').toLowerCase() === q ||
        String(s.admissionNo || '').toLowerCase() === q ||
        String(s.id || '').toLowerCase() === q ||
        String(s.name || '').toLowerCase() === q
    )
    if (!match) {
      toast.error(`No active student found matching "${qrCodeInput}"`)
      return
    }
    updateStudentMark(match.id, { status: 'Present' })
    toast.success(`Marked ${match.name} (${match.className}) as Present`)
    setQrCodeInput('')
  }

  const allPageSelected =
    paginatedStudents.length > 0 && paginatedStudents.every((s) => selectedIds.includes(s.id))

  return (
    <div className="p-4 sm:p-6 space-y-4 max-w-[1440px] mx-auto">
      {/* Page Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <FileText className="w-5 h-5 text-slate-600" />
            <h1 className="text-xl font-bold text-slate-900 tracking-tight">Mark Attendance</h1>
          </div>
          <button
            type="button"
            onClick={() => onRouteChange?.('inst-dashboard')}
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

      {/* Mode Tabs & Date/Time Pill */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm px-4 py-2.5 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <button
            type="button"
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-blue-600 text-white text-xs font-semibold shadow-sm"
          >
            <Users className="w-3.5 h-3.5" />
            Students
          </button>
          <button
            type="button"
            onClick={() => onSwitchToStaff?.()}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 text-xs font-semibold transition-colors"
          >
            <Users className="w-3.5 h-3.5" />
            Staff
          </button>
          <button
            type="button"
            onClick={() => setQrModalOpen(true)}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 text-xs font-semibold transition-colors"
          >
            <QrCode className="w-3.5 h-3.5" />
            QR Scan
          </button>
        </div>

        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-sky-50 border border-sky-200 text-sky-700 text-xs font-semibold">
          <Calendar className="w-3.5 h-3.5" />
          {nowLabel}
        </div>
      </div>

      {/* FILTERS Card */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-4 space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-slate-600">
            <Filter className="w-3.5 h-3.5" />
            FILTERS
          </div>

          <div className="flex flex-wrap items-center gap-1.5">
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-sky-100 text-sky-700 text-[11px] font-bold">
              <Users className="w-3 h-3" />
              {totalCount} students
            </span>
            <button
              type="button"
              onClick={() => handleBulkMark('Present')}
              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 text-[11px] font-semibold transition-colors"
            >
              <Check className="w-3 h-3" />
              Present
            </button>
            <button
              type="button"
              onClick={() => handleBulkMark('Absent')}
              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 text-[11px] font-semibold transition-colors"
            >
              <X className="w-3 h-3" />
              Absent
            </button>
            <button
              type="button"
              onClick={() => handleBulkMark('Late')}
              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-amber-50 hover:bg-amber-100 text-amber-700 border border-amber-200 text-[11px] font-semibold transition-colors"
            >
              <Clock className="w-3 h-3" />
              Late
            </button>
            <button
              type="button"
              onClick={() => handleBulkMark('Leave')}
              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 text-[11px] font-semibold transition-colors"
            >
              <FileText className="w-3 h-3" />
              Leave
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-[1.2fr_1fr_0.9fr_0.9fr_1.2fr_auto_auto_auto] gap-2.5 items-end">
          <div>
            <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1">
              CLASS
            </label>
            <select
              value={classInput}
              onChange={(e) => setClassInput(e.target.value)}
              className="w-full px-3 py-1.5 text-xs rounded-md border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="ALL">All classes</option>
              {availableClasses.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1">
              DATE
            </label>
            <input
              type="date"
              value={dateInput}
              onChange={(e) => setDateInput(e.target.value)}
              className="w-full px-2.5 py-1.5 text-xs rounded-md border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1">
              TYPE
            </label>
            <select
              value={typeInput}
              onChange={(e) => setTypeInput(e.target.value)}
              className="w-full px-3 py-1.5 text-xs rounded-md border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="General">General</option>
              <option value="Morning">Morning</option>
              <option value="Subject">Subject-wise</option>
            </select>
          </div>

          <div>
            <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1">
              SHOW
            </label>
            <select
              value={showInput}
              onChange={(e) => setShowInput(e.target.value)}
              className="w-full px-3 py-1.5 text-xs rounded-md border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="ALL">All ({instStudents.length})</option>
              <option value="Present">Present</option>
              <option value="Absent">Absent</option>
              <option value="Late">Late</option>
              <option value="Leave">Leave</option>
              <option value="Unmarked">Unmarked</option>
            </select>
          </div>

          <div>
            <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1">
              SEARCH
            </label>
            <input
              type="text"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder="Name / roll no..."
              className="w-full px-3 py-1.5 text-xs rounded-md border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <button
            type="button"
            onClick={() =>
              setApplied({
                className: classInput,
                date: dateInput,
                type: typeInput,
                show: showInput,
                search: searchInput
              })
            }
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-md bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold transition-colors"
          >
            <CheckCircle2 className="w-3.5 h-3.5" />
            Apply Filters
          </button>

          <button
            type="button"
            onClick={handlePrintBlankSheet}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 text-xs font-semibold transition-colors"
          >
            <Printer className="w-3.5 h-3.5 text-slate-500" />
            Print blank sheet
          </button>

          <button
            type="button"
            onClick={() => onRouteChange?.('inst-attendance-student-report')}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 text-xs font-semibold transition-colors"
          >
            <Calendar className="w-3.5 h-3.5 text-slate-500" />
            Monthly sheet
          </button>
        </div>
      </div>

      {/* MARK STUDENTS Table Card */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="px-5 py-3 border-b border-slate-200 flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-700">
            <Users className="w-4 h-4 text-slate-500" />
            MARK STUDENTS
          </div>
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-sky-50 border border-sky-200 text-sky-700 text-[11px] font-bold">
              <Building2 className="w-3 h-3" />
              {applied.className === 'ALL' ? 'All classes' : applied.className}
            </span>
            <button
              type="button"
              onClick={() => {
                saveMarkedMap(instId, applied.date, applied.type, markedMap)
                toast.success('Attendance saved')
              }}
              className="inline-flex items-center gap-1 px-3 py-1 rounded-md bg-emerald-600 hover:bg-emerald-700 text-white text-[11px] font-semibold transition-colors"
            >
              <Save className="w-3 h-3" />
              Save
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-[10px] font-bold uppercase tracking-wider text-slate-500">
                <th className="py-3 px-4 w-10">
                  <input
                    type="checkbox"
                    checked={allPageSelected}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setSelectedIds((prev) =>
                          Array.from(new Set([...prev, ...paginatedStudents.map((s) => s.id)]))
                        )
                      } else {
                        const pageSet = new Set(paginatedStudents.map((s) => s.id))
                        setSelectedIds((prev) => prev.filter((id) => !pageSet.has(id)))
                      }
                    }}
                    className="rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                  />
                </th>
                <th className="py-3 px-2 w-12">#</th>
                <th className="py-3 px-3 min-w-[240px]">STUDENT</th>
                <th className="py-3 px-3 min-w-[270px] text-center">STATUS</th>
                <th className="py-3 px-3 min-w-[200px]">COMMENT</th>
                <th className="py-3 px-4 w-28 text-center">SMS</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs">
              {paginatedStudents.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-400">
                    No active students match the current filters.
                  </td>
                </tr>
              ) : (
                paginatedStudents.map((st, idx) => {
                  const serial = startIdx + idx + 1
                  const mark = markedMap[st.id] || {}
                  const currentStatus = mark.status || ''
                  const parentName = st.guardianName || st.fatherName
                  const isChecked = selectedIds.includes(st.id)

                  return (
                    <tr key={st.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="py-3 px-4">
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() =>
                            setSelectedIds((prev) =>
                              prev.includes(st.id) ? prev.filter((x) => x !== st.id) : [...prev, st.id]
                            )
                          }
                          className="rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                        />
                      </td>
                      <td className="py-3 px-2 font-semibold text-blue-600">{serial}</td>
                      <td className="py-3 px-3">
                        <div className="flex items-start gap-2.5">
                          <div className="w-8 h-8 rounded-full bg-sky-100 text-sky-700 flex items-center justify-center shrink-0 mt-0.5">
                            <User className="w-4 h-4" />
                          </div>
                          <div>
                            <div className="flex items-center gap-1.5 flex-wrap">
                              <button
                                type="button"
                                onClick={() => onOpenProfile?.(st.id)}
                                className="font-semibold text-slate-800 hover:text-blue-600 inline-flex items-center gap-1"
                              >
                                {st.name}
                                <ExternalLink className="w-3 h-3 text-slate-400" />
                              </button>
                              {parentName && (
                                <span className="text-[11px] text-slate-400 inline-flex items-center gap-0.5">
                                  <User className="w-2.5 h-2.5" />
                                  {parentName}
                                </span>
                              )}
                            </div>
                            <div className="flex flex-wrap items-center gap-1.5 mt-1">
                              {st.rollNumber && (
                                <span className="px-1.5 py-0.5 rounded bg-indigo-50 text-indigo-700 border border-indigo-200 text-[10px] font-semibold">
                                  Roll No: {st.rollNumber}
                                </span>
                              )}
                              {st.admissionNo && (
                                <span className="px-1.5 py-0.5 rounded bg-sky-50 text-sky-700 border border-sky-200 text-[10px] font-semibold">
                                  Ad No: {st.admissionNo}
                                </span>
                              )}
                            </div>
                            <div className="text-[11px] text-slate-400 flex items-center gap-1 mt-1">
                              <Building2 className="w-3 h-3" />
                              {st.className || '—'}
                              {st.section ? ` · ${st.section}` : ''}
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* 4 Status Buttons */}
                      <td className="py-3 px-3">
                        <div className="inline-flex items-center rounded-md border border-slate-200 overflow-hidden bg-white shadow-2xs">
                          <button
                            type="button"
                            onClick={() => updateStudentMark(st.id, { status: 'Present' })}
                            className={`px-2.5 py-1.5 text-[11px] font-semibold inline-flex items-center gap-1 border-r border-slate-200 transition-colors ${
                              currentStatus === 'Present'
                                ? 'bg-emerald-600 text-white'
                                : 'text-emerald-700 hover:bg-emerald-50'
                            }`}
                          >
                            <Check className="w-3 h-3" />
                            Present
                          </button>
                          <button
                            type="button"
                            onClick={() => updateStudentMark(st.id, { status: 'Absent' })}
                            className={`px-2.5 py-1.5 text-[11px] font-semibold inline-flex items-center gap-1 border-r border-slate-200 transition-colors ${
                              currentStatus === 'Absent'
                                ? 'bg-rose-600 text-white'
                                : 'text-rose-600 hover:bg-rose-50'
                            }`}
                          >
                            <X className="w-3 h-3" />
                            Absent
                          </button>
                          <button
                            type="button"
                            onClick={() => updateStudentMark(st.id, { status: 'Late' })}
                            className={`px-2.5 py-1.5 text-[11px] font-semibold inline-flex items-center gap-1 border-r border-slate-200 transition-colors ${
                              currentStatus === 'Late'
                                ? 'bg-amber-500 text-white'
                                : 'text-amber-600 hover:bg-amber-50'
                            }`}
                          >
                            <Clock className="w-3 h-3" />
                            Late
                          </button>
                          <button
                            type="button"
                            onClick={() => updateStudentMark(st.id, { status: 'Leave' })}
                            className={`px-2.5 py-1.5 text-[11px] font-semibold inline-flex items-center gap-1 transition-colors ${
                              currentStatus === 'Leave'
                                ? 'bg-cyan-600 text-white'
                                : 'text-cyan-700 hover:bg-cyan-50'
                            }`}
                          >
                            <FileText className="w-3 h-3" />
                            Leave
                          </button>
                        </div>
                      </td>

                      {/* Comment */}
                      <td className="py-3 px-3">
                        <input
                          type="text"
                          value={mark.comment || ''}
                          onChange={(e) => updateStudentMark(st.id, { comment: e.target.value })}
                          placeholder="Add comment (e.g., Medical Leave, Came lat"
                          className="w-full px-2.5 py-1.5 text-[11px] rounded border border-slate-200 bg-slate-50/70 focus:bg-white focus:outline-none focus:ring-1 focus:ring-blue-500"
                        />
                      </td>

                      {/* SMS */}
                      <td className="py-3 px-4 text-center">
                        <button
                          type="button"
                          onClick={() => handleSendSms(st)}
                          className="inline-flex items-center gap-1 px-2.5 py-1 rounded border border-sky-200 bg-white hover:bg-sky-50 text-sky-600 text-[11px] font-semibold transition-colors"
                        >
                          <Send className="w-3 h-3" />
                          Send SMS
                        </button>
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Footer */}
        <div className="px-5 py-3.5 border-t border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-slate-500">
          <div>
            Showing {totalCount === 0 ? 0 : startIdx + 1}–{Math.min(startIdx + PAGE_SIZE, totalCount)} of{' '}
            {totalCount} · {PAGE_SIZE} per page
          </div>

          <div className="flex items-center gap-1">
            <button
              type="button"
              disabled={safePage <= 1}
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              className="w-7 h-7 rounded border border-slate-200 flex items-center justify-center text-slate-500 hover:bg-slate-50 disabled:opacity-40"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
            </button>

            {Array.from({ length: totalPages }, (_, i) => i + 1)
              .slice(0, 7)
              .map((pg) => (
                <button
                  key={pg}
                  type="button"
                  onClick={() => setCurrentPage(pg)}
                  className={`w-7 h-7 rounded text-xs font-semibold transition-colors ${
                    safePage === pg
                      ? 'bg-blue-600 text-white'
                      : 'border border-slate-200 text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  {pg}
                </button>
              ))}

            <button
              type="button"
              disabled={safePage >= totalPages}
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              className="w-7 h-7 rounded border border-slate-200 flex items-center justify-center text-slate-500 hover:bg-slate-50 disabled:opacity-40"
            >
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* QR Scan Modal */}
      {qrModalOpen && (
        <Modal
          isOpen
          onClose={() => setQrModalOpen(false)}
          title="QR / Barcode Quick Attendance Scan"
          maxWidth="max-w-md"
        >
          <form onSubmit={handleQrScanSubmit} className="space-y-4 text-xs">
            <p className="text-slate-600">
              Scan a student ID card QR code or enter their Roll Number / Admission Number to mark them{' '}
              <strong className="text-emerald-600">Present</strong> for <strong>{applied.date}</strong>.
            </p>
            <input
              type="text"
              autoFocus
              value={qrCodeInput}
              onChange={(e) => setQrCodeInput(e.target.value)}
              placeholder="Scan QR or type Roll No / Admission No..."
              className="w-full px-3 py-2.5 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setQrModalOpen(false)}
                className="px-3.5 py-1.5 rounded-lg border border-slate-200 text-slate-600 font-semibold hover:bg-slate-50"
              >
                Close
              </button>
              <button
                type="submit"
                className="px-4 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-semibold"
              >
                Mark Present
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  )
}

export default MarkAttendanceView
