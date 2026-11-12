import React, { useState, useMemo, useEffect } from 'react'
import {
  ArrowLeft,
  FileText,
  Users,
  Calendar,
  UserX,
  CreditCard,
  Search,
  Bus,
  Filter,
  UserPlus,
  Upload,
  User,
  AlertTriangle,
  Pencil,
  PlusCircle,
  ChevronDown,
  ChevronLeft,
  ChevronRight
} from 'lucide-react'
import { useAppData } from '../../../context/AppDataContext'
import { useToast } from '../../../context/ToastContext'
import { resolveStudentFeeSetup } from '../fees/StudentFeeSetupView'
import { getDistinctInstituteClassNames, isClassAllowedForTier } from '../../../utils/tierGating'

const SHORT_MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
const pad2 = (n) => String(n).padStart(2, '0')
const formatShortDate = (iso) => {
  if (!iso) return ''
  const parts = String(iso).slice(0, 10).split('-')
  if (parts.length !== 3) return String(iso).slice(0, 10)
  const [y, m, d] = parts
  return `${pad2(Number(d))} ${SHORT_MONTHS[Number(m) - 1] || m} ${y}`
}

export const AllStudentsDirectory = ({
  currentInstitute,
  initialClassFilter = 'ALL',
  onRouteChange,
  onOpenProfile,
  onOpenFeeSetup,
  onOpenBillingHistory,
  onOpenQuickPayment
}) => {
  const { students = [], classes = [], fees = [], deleteItem, logAuditEvent } = useAppData()
  const { toast } = useToast()

  const now = useMemo(() => new Date(), [])
  const todayIso = `${now.getFullYear()}-${pad2(now.getMonth() + 1)}-${pad2(now.getDate())}`
  const monthPrefix = `${now.getFullYear()}-${pad2(now.getMonth() + 1)}`

  const instStudents = useMemo(
    () =>
      students.filter(
        (s) =>
          (!currentInstitute?.id || !s.instituteId || s.instituteId === currentInstitute.id) &&
          isClassAllowedForTier(s.className, currentInstitute)
      ),
    [students, currentInstitute]
  )

  const availableClasses = useMemo(
    () => getDistinctInstituteClassNames(classes, instStudents, currentInstitute),
    [classes, instStudents, currentInstitute]
  )

  const instFees = useMemo(
    () => fees.filter((f) => !currentInstitute?.id || !f.instituteId || f.instituteId === currentInstitute.id),
    [fees, currentInstitute?.id]
  )

  // Pending dues map by studentId & fallback by lowercase name
  const pendingByStudent = useMemo(() => {
    const byId = new Map()
    const byName = new Map()
    instFees.forEach((f) => {
      if (f.status === 'Paid') return
      const billed = Number(f.amount || 0) + Number(f.fine || f.lateFine || 0)
      const paid = Number(f.paidAmount || 0)
      const waiver = Number(f.discount || f.waiver || f.discountAmount || 0)
      const rem = Math.max(0, billed - paid - waiver)
      if (rem <= 0) return
      if (f.studentId) byId.set(f.studentId, (byId.get(f.studentId) || 0) + rem)
      const key = (f.studentName || '').trim().toLowerCase()
      if (key) byName.set(key, (byName.get(key) || 0) + rem)
    })
    return { byId, byName }
  }, [instFees])

  // Filter states matching Picks 1-4
  const [dateMode, setDateMode] = useState('all') // 'all' | 'today' | 'month' | 'custom'
  const [customFrom, setCustomFrom] = useState(`${monthPrefix}-01`)
  const [customTo, setCustomTo] = useState(todayIso)
  const [classFilter, setClassFilter] = useState(initialClassFilter || 'ALL')
  const [searchInput, setSearchInput] = useState('')
  const [quickStatus, setQuickStatus] = useState('Active') // 'Active' | 'ALL' | 'MissingParent' | 'TuitionNotSet' | 'PendingDues' | 'Dropped'
  const [boardFilter, setBoardFilter] = useState('ALL')
  const [transportOnly, setTransportOnly] = useState(false)

  const [applied, setApplied] = useState({
    dateMode: 'all',
    customFrom: `${monthPrefix}-01`,
    customTo: todayIso,
    classFilter: initialClassFilter || 'ALL',
    search: '',
    quickStatus: 'Active',
    boardFilter: 'ALL',
    transportOnly: false
  })

  useEffect(() => {
    const cls = initialClassFilter || 'ALL'
    setClassFilter(cls)
    setApplied((prev) => ({ ...prev, classFilter: cls }))
  }, [initialClassFilter])

  const [currentPage, setCurrentPage] = useState(1)
  const pageSize = 30
  const [openMoreId, setOpenMoreId] = useState(null)

  useEffect(() => {
    const close = (e) => {
      if (!e.target.closest?.('[data-student-more]')) setOpenMoreId(null)
    }
    document.addEventListener('mousedown', close)
    return () => document.removeEventListener('mousedown', close)
  }, [])

  const enrichedStudents = useMemo(() => {
    return instStudents.map((s) => {
      const fullName = s.fullName || s.name || 'Student'
      const guardian = s.fatherName || s.guardianName || ''
      const hasMissingParent = !guardian.trim()
      const setup = resolveStudentFeeSetup(s, classes, instFees)
      const feeAmount = Number(setup?.finalFee || s.monthlyFee || s.tuitionFee || 0)
      const feeFreq = s.feeFrequency || setup?.frequency || 'Monthly'
      const tuitionNotSet = feeAmount <= 0
      const pending =
        pendingByStudent.byId.get(s.id) ??
        pendingByStudent.byName.get(fullName.trim().toLowerCase()) ??
        0
      const admDate = String(s.admissionDate || s.createdAt || '').slice(0, 10)
      const statusNorm = String(s.status || 'Active').toLowerCase()
      const isActive = statusNorm === 'active'
      const hasTransport = Boolean(s.transportRouteId || s.transportRouteName || s.usesTransport)
      return {
        ...s,
        fullName,
        guardian,
        hasMissingParent,
        feeAmount,
        feeFreq,
        tuitionNotSet,
        pending,
        admDate,
        isActive,
        hasTransport
      }
    })
  }, [instStudents, classes, instFees, pendingByStudent])

  // Top 4 KPI summary counts (matching Pick 1)
  const kpis = useMemo(() => {
    const activeList = enrichedStudents.filter((s) => s.isActive)
    const admittedThisMonth = activeList.filter((s) => s.admDate.startsWith(monthPrefix)).length
    const admittedToday = activeList.filter((s) => s.admDate === todayIso).length
    const missingParentCount = activeList.filter((s) => s.hasMissingParent).length
    const linkedParentCount = Math.max(0, activeList.length - missingParentCount)
    const feeSetupCount = activeList.filter((s) => !s.tuitionNotSet).length
    const needSetupCount = Math.max(0, activeList.length - feeSetupCount)
    const transportCount = activeList.filter((s) => s.hasTransport).length
    return {
      activeCount: activeList.length,
      admittedThisMonth,
      admittedToday,
      missingParentCount,
      linkedParentCount,
      feeSetupCount,
      needSetupCount,
      transportCount
    }
  }, [enrichedStudents, monthPrefix, todayIso])

  const applyCurrentFilters = (overrides = {}) => {
    const next = {
      dateMode,
      customFrom,
      customTo,
      classFilter,
      search: searchInput,
      quickStatus,
      boardFilter,
      transportOnly,
      ...overrides
    }
    setApplied(next)
    setCurrentPage(1)
  }

  const filteredStudents = useMemo(() => {
    const q = applied.search.trim().toLowerCase()
    return enrichedStudents.filter((s) => {
      if (applied.quickStatus === 'Active' && !s.isActive) return false
      if (applied.quickStatus === 'Dropped' && s.isActive) return false
      if (applied.quickStatus === 'MissingParent' && (!s.isActive || !s.hasMissingParent)) return false
      if (applied.quickStatus === 'TuitionNotSet' && (!s.isActive || !s.tuitionNotSet)) return false
      if (applied.quickStatus === 'PendingDues' && (!s.isActive || s.pending <= 0)) return false

      if (applied.classFilter !== 'ALL' && (s.className || '').toLowerCase() !== applied.classFilter.toLowerCase()) {
        return false
      }
      if (applied.boardFilter !== 'ALL' && (s.board || s.educationBoard || '').toLowerCase() !== applied.boardFilter.toLowerCase()) {
        return false
      }
      if (applied.transportOnly && !s.hasTransport) return false

      if (applied.dateMode === 'today' && s.admDate !== todayIso) return false
      if (applied.dateMode === 'month' && !s.admDate.startsWith(monthPrefix)) return false
      if (applied.dateMode === 'custom') {
        if (applied.customFrom && s.admDate && s.admDate < applied.customFrom) return false
        if (applied.customTo && s.admDate && s.admDate > applied.customTo) return false
      }

      if (!q) return true
      return (
        s.fullName.toLowerCase().includes(q) ||
        String(s.rollNumber || '').toLowerCase().includes(q) ||
        String(s.admissionNo || '').toLowerCase().includes(q) ||
        String(s.registrationNo || '').toLowerCase().includes(q) ||
        s.guardian.toLowerCase().includes(q)
      )
    })
  }, [enrichedStudents, applied, todayIso, monthPrefix])

  const totalPages = Math.max(1, Math.ceil(filteredStudents.length / pageSize))
  const safePage = Math.min(currentPage, totalPages)
  const paginatedStudents = useMemo(() => {
    const start = (safePage - 1) * pageSize
    return filteredStudents.slice(start, start + pageSize)
  }, [filteredStudents, safePage])

  const handleDeleteStudent = async (s) => {
    setOpenMoreId(null)
    const ok = window.confirm(`Remove student ${s.fullName} (Roll ${s.rollNumber || 'N/A'})? This cannot be undone.`)
    if (!ok) return
    try {
      await deleteItem('students', s.id)
      logAuditEvent?.(`Deleted student ${s.fullName}`, currentInstitute?.name || 'Admin', 'Success')
      toast('Student removed.', 'info')
    } catch (err) {
      toast(err?.message || 'Could not delete student.', 'error')
    }
  }

  const startNum = filteredStudents.length === 0 ? 0 : (safePage - 1) * pageSize + 1
  const endNum = Math.min(safePage * pageSize, filteredStudents.length)

  return (
    <div className="space-y-4 pb-8 animate-fade-in">
      {/* Header matching Pick 1 */}
      <div>
        <div className="flex items-center gap-2 text-slate-900">
          <FileText className="w-5 h-5 text-slate-600" />
          <h1 className="text-lg font-bold tracking-tight">Students</h1>
        </div>
        <button
          type="button"
          onClick={() => onRouteChange?.('inst-dashboard')}
          className="inline-flex items-center gap-1 text-xs font-medium text-slate-500 hover:text-slate-800 mt-0.5 cursor-pointer"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back</span>
        </button>
      </div>

      {/* 4 KPI Summary Cards matching Pick 1 */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <button
          type="button"
          onClick={() => {
            setQuickStatus('Active')
            setDateMode('all')
            applyCurrentFilters({ quickStatus: 'Active', dateMode: 'all' })
          }}
          className="bg-white rounded-xl border border-slate-200 hover:border-blue-300 p-4 flex items-center gap-3.5 text-left shadow-2xs cursor-pointer transition-colors"
        >
          <div className="w-11 h-11 rounded-xl bg-blue-500 text-white flex items-center justify-center shrink-0">
            <Users className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs font-medium text-slate-500">Active students</p>
            <p className="text-2xl font-extrabold text-slate-900 leading-tight">{filteredStudents.length}</p>
            <p className="text-[11px] text-slate-400">Matching current filters</p>
          </div>
        </button>

        <button
          type="button"
          onClick={() => {
            setDateMode('month')
            applyCurrentFilters({ dateMode: 'month' })
          }}
          className="bg-white rounded-xl border border-slate-200 hover:border-emerald-300 p-4 flex items-center gap-3.5 text-left shadow-2xs cursor-pointer transition-colors"
        >
          <div className="w-11 h-11 rounded-xl bg-emerald-500 text-white flex items-center justify-center shrink-0">
            <Calendar className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs font-medium text-slate-500">Admitted this month</p>
            <p className="text-2xl font-extrabold text-slate-900 leading-tight">{kpis.admittedThisMonth}</p>
            <p className="text-[11px] text-slate-400">{kpis.admittedToday} enrolled today</p>
          </div>
        </button>

        <button
          type="button"
          onClick={() => {
            setQuickStatus('MissingParent')
            applyCurrentFilters({ quickStatus: 'MissingParent' })
          }}
          className="bg-white rounded-xl border border-slate-200 hover:border-orange-300 p-4 flex items-center gap-3.5 text-left shadow-2xs cursor-pointer transition-colors"
        >
          <div className="w-11 h-11 rounded-xl bg-orange-500 text-white flex items-center justify-center shrink-0">
            <UserX className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs font-medium text-slate-500">Missing parent</p>
            <p className="text-2xl font-extrabold text-slate-900 leading-tight">{kpis.missingParentCount}</p>
            <p className="text-[11px] text-slate-400">{kpis.linkedParentCount} linked to a parent</p>
          </div>
        </button>

        <button
          type="button"
          onClick={() => {
            setQuickStatus('TuitionNotSet')
            applyCurrentFilters({ quickStatus: 'TuitionNotSet' })
          }}
          className="bg-white rounded-xl border border-slate-200 hover:border-cyan-300 p-4 flex items-center gap-3.5 text-left shadow-2xs cursor-pointer transition-colors"
        >
          <div className="w-11 h-11 rounded-xl bg-cyan-500 text-white flex items-center justify-center shrink-0">
            <CreditCard className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs font-medium text-slate-500">Fee setup</p>
            <p className="text-2xl font-extrabold text-slate-900 leading-tight">
              {kpis.feeSetupCount}{' '}
              <span className="text-sm font-semibold text-slate-400">/ {kpis.activeCount}</span>
            </p>
            <p className="text-[11px] text-slate-400">
              {kpis.needSetupCount} still need fee setup · {kpis.transportCount} on transport
            </p>
          </div>
        </button>
      </div>

      {/* Filter Card matching Pick 1 */}
      <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-2xs space-y-3 text-xs">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-1.5">
            {[
              ['all', 'All'],
              ['today', 'Today'],
              ['month', 'This Month'],
              ['custom', 'Custom Range']
            ].map(([mKey, mLabel]) => (
              <button
                key={mKey}
                type="button"
                onClick={() => {
                  setDateMode(mKey)
                  if (mKey !== 'custom') applyCurrentFilters({ dateMode: mKey })
                }}
                className={`px-3 py-1.5 rounded-lg font-semibold cursor-pointer transition-colors ${
                  dateMode === mKey
                    ? 'bg-teal-700 text-white'
                    : 'border border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                }`}
              >
                {mLabel}
              </button>
            ))}
            {dateMode === 'custom' && (
              <div className="flex items-center gap-1.5 ml-2">
                <input
                  type="date"
                  value={customFrom}
                  onChange={(e) => setCustomFrom(e.target.value)}
                  className="px-2 py-1 rounded border border-slate-200"
                />
                <span className="text-slate-400">to</span>
                <input
                  type="date"
                  value={customTo}
                  onChange={(e) => setCustomTo(e.target.value)}
                  className="px-2 py-1 rounded border border-slate-200"
                />
              </div>
            )}
          </div>

          <div className="flex items-center gap-1.5 text-[11px] text-slate-500 font-medium">
            <Calendar className="w-3.5 h-3.5 text-sky-600" />
            <span className="font-bold text-slate-600 uppercase tracking-wide">ADMISSION DATE</span>
            <span>· Active students only</span>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-3 items-end">
          <div className="lg:col-span-3">
            <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">CLASS</label>
            <select
              value={classFilter}
              onChange={(e) => setClassFilter(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-slate-200 bg-white text-slate-800 font-medium"
            >
              <option value="ALL">All classes</option>
              {availableClasses.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>

          <div className="lg:col-span-4">
            <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">SEARCH</label>
            <div className="flex items-stretch">
              <input
                type="text"
                placeholder="Name, roll, admission or registration no."
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') applyCurrentFilters()
                }}
                className="flex-1 min-w-0 px-3 py-2 rounded-l-lg border border-slate-200 text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500/20"
              />
              <button
                type="button"
                onClick={() => applyCurrentFilters()}
                className="px-3 rounded-r-lg bg-teal-700 hover:bg-teal-800 text-white flex items-center justify-center cursor-pointer"
                aria-label="Search students"
              >
                <Search className="w-4 h-4" />
              </button>
            </div>
          </div>

          <div className="lg:col-span-2">
            <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">QUICK STATUS</label>
            <select
              value={quickStatus}
              onChange={(e) => setQuickStatus(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-slate-200 bg-white text-slate-800 font-medium"
            >
              <option value="Active">All on page</option>
              <option value="ALL">All (Active + Dropped)</option>
              <option value="MissingParent">Missing Parent</option>
              <option value="TuitionNotSet">Tuition Not Set</option>
              <option value="PendingDues">Has Pending Dues</option>
              <option value="Dropped">Dropped / Graduated</option>
            </select>
          </div>

          <div className="lg:col-span-3 flex items-center gap-2">
            <div className="flex-1 min-w-0">
              <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">EDUCATION BOARD</label>
              <select
                value={boardFilter}
                onChange={(e) => setBoardFilter(e.target.value)}
                className="w-full px-2.5 py-2 rounded-lg border border-slate-200 bg-white text-slate-800 font-medium"
              >
                <option value="ALL">All Boards</option>
                <option value="BISE">BISE</option>
                <option value="Federal">Federal</option>
                <option value="Cambridge">Cambridge</option>
              </select>
            </div>
            <label className="inline-flex items-center gap-1 pt-4 text-[11px] font-semibold text-slate-600 cursor-pointer shrink-0">
              <input
                type="checkbox"
                checked={transportOnly}
                onChange={(e) => setTransportOnly(e.target.checked)}
                className="rounded border-slate-300 text-teal-600"
              />
              <Bus className="w-3.5 h-3.5 text-slate-500" />
              <span>Transport only</span>
            </label>
            <button
              type="button"
              onClick={() => applyCurrentFilters()}
              className="mt-4 px-3.5 py-2 rounded-lg bg-teal-700 hover:bg-teal-800 text-white font-bold inline-flex items-center gap-1 cursor-pointer shrink-0"
            >
              <Filter className="w-3.5 h-3.5" />
              <span>Apply</span>
            </button>
          </div>
        </div>
      </div>

      {/* Student Records Table Card matching Picks 1-4 */}
      <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-2xs space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4 text-slate-600" />
              <h2 className="text-sm font-bold text-slate-900">Student records</h2>
              <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-700 text-[11px] font-bold">
                {filteredStudents.length} students
              </span>
            </div>
            <p className="text-[11px] text-slate-400 mt-0.5">
              {applied.classFilter === 'ALL' ? 'All classes' : applied.classFilter} ·{' '}
              {applied.quickStatus === 'ALL' ? 'All students' : 'Active only'}
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => onRouteChange?.('inst-admissions-enroll')}
              className="px-3.5 py-2 rounded-lg bg-teal-700 hover:bg-teal-800 text-white text-xs font-bold inline-flex items-center gap-1.5 cursor-pointer"
            >
              <UserPlus className="w-3.5 h-3.5" />
              <span>Enroll Student</span>
            </button>
            <button
              type="button"
              onClick={() => onRouteChange?.('inst-admissions-import')}
              className="px-3.5 py-2 rounded-lg border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 text-xs font-bold inline-flex items-center gap-1.5 cursor-pointer"
            >
              <Upload className="w-3.5 h-3.5 text-slate-500" />
              <span>Bulk Import</span>
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs min-w-[920px]">
            <thead className="border-y border-slate-200 bg-slate-50/70 text-slate-600 text-[11px] font-bold">
              <tr>
                <th className="py-2.5 px-3 w-12">S/N</th>
                <th className="py-2.5 px-3 w-14">Photo</th>
                <th className="py-2.5 px-3">Roll</th>
                <th className="py-2.5 px-3">Student &amp; Parent</th>
                <th className="py-2.5 px-3">Class</th>
                <th className="py-2.5 px-3">Contact</th>
                <th className="py-2.5 px-3">Fee</th>
                <th className="py-2.5 px-3 text-center">Pending</th>
                <th className="py-2.5 px-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {paginatedStudents.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-10 text-center text-slate-400">
                    No students match the selected filters.
                  </td>
                </tr>
              ) : (
                paginatedStudents.map((s, idx) => {
                  const rowNum = (safePage - 1) * pageSize + idx + 1
                  const highlightRow = s.hasMissingParent || s.tuitionNotSet
                  const studentPhone = s.studentPhone || s.phone || ''
                  const parentPhone = s.parentPhone || s.guardianPhone || ''
                  const housePhone = s.housePhone || s.landline || ''

                  return (
                    <tr
                      key={s.id}
                      className={`transition-colors ${
                        highlightRow ? 'bg-rose-50/75 hover:bg-rose-50' : 'hover:bg-slate-50/70'
                      }`}
                    >
                      <td className="py-3 px-3 text-slate-600 font-medium">{rowNum}</td>

                      <td className="py-3 px-3">
                        {s.photoUrl || s.avatar ? (
                          <img
                            src={s.photoUrl || s.avatar}
                            alt={s.fullName}
                            className="w-8 h-8 rounded-full object-cover border border-slate-200"
                          />
                        ) : (
                          <div className="w-8 h-8 rounded-full bg-sky-100 text-sky-600 flex items-center justify-center border border-sky-200">
                            <User className="w-4 h-4" />
                          </div>
                        )}
                      </td>

                      <td className="py-3 px-3">
                        <span className="inline-block px-2.5 py-0.5 rounded bg-blue-500 text-white font-bold text-[11px]">
                          {s.registrationNo || s.rollNumber || 'N/A'}
                        </span>
                        {s.registrationNo && s.rollNumber && s.registrationNo !== s.rollNumber && (
                          <div className="text-[10px] text-slate-400 mt-0.5">Class roll {s.rollNumber}</div>
                        )}
                      </td>

                      <td className="py-3 px-3">
                        <button
                          type="button"
                          onClick={() => onOpenProfile?.(s.id)}
                          className="font-bold text-slate-900 hover:text-blue-600 hover:underline text-left cursor-pointer"
                        >
                          {s.fullName}
                        </button>
                        {s.hasMissingParent ? (
                          <div className="flex items-center gap-1 text-[11px] font-semibold text-rose-600 mt-0.5">
                            <AlertTriangle className="w-3 h-3" />
                            <span>Missing Parent</span>
                          </div>
                        ) : (
                          <div className="flex items-center gap-1 text-[11px] text-emerald-700 mt-0.5">
                            <User className="w-3 h-3 text-slate-400" />
                            <span>{s.guardian}</span>
                          </div>
                        )}
                        <div className="text-[10px] text-slate-400 mt-0.5">
                          Adm {s.admissionNo || 'N/A'}
                          {s.admDate ? ` · ${formatShortDate(s.admDate)}` : ''}
                        </div>
                      </td>

                      <td className="py-3 px-3 font-bold text-slate-800">{s.className || '—'}</td>

                      <td className="py-3 px-3 text-[11px] space-y-0.5">
                        {!studentPhone && !parentPhone && !housePhone ? (
                          <span className="text-slate-400">—</span>
                        ) : (
                          <>
                            {studentPhone && (
                              <div>
                                <span className="text-slate-500">Student: </span>
                                <span className="text-blue-600 font-medium">{studentPhone}</span>
                              </div>
                            )}
                            {parentPhone && (
                              <div>
                                <span className="text-slate-500">Parent: </span>
                                <span className="text-emerald-600 font-medium">{parentPhone}</span>
                              </div>
                            )}
                            {housePhone && (
                              <div>
                                <span className="text-slate-500">House: </span>
                                <span className="text-amber-700 font-medium">{housePhone}</span>
                              </div>
                            )}
                          </>
                        )}
                      </td>

                      <td className="py-3 px-3">
                        {s.tuitionNotSet ? (
                          <div className="space-y-1">
                            <span className="inline-block px-2 py-0.5 rounded bg-rose-600 text-white text-[10px] font-bold">
                              Tuition not set
                            </span>
                            <div>
                              <button
                                type="button"
                                onClick={() => onOpenFeeSetup?.(s.id, 'edit')}
                                className="px-2.5 py-1 rounded bg-blue-500 hover:bg-blue-600 text-white text-[11px] font-bold inline-flex items-center gap-1 cursor-pointer"
                              >
                                <PlusCircle className="w-3 h-3" />
                                <span>Set Fee</span>
                              </button>
                            </div>
                          </div>
                        ) : (
                          <div>
                            <div className="text-[10px] text-slate-400">{s.feeFreq}</div>
                            <div className="inline-flex items-center gap-1.5 mt-0.5">
                              <span className="px-2.5 py-0.5 rounded bg-emerald-600 text-white font-bold text-[11px]">
                                PKR {s.feeAmount.toLocaleString()}
                              </span>
                              <button
                                type="button"
                                onClick={() => onOpenFeeSetup?.(s.id, 'edit')}
                                title="Edit Fee Setup"
                                className="text-blue-600 hover:text-blue-800 cursor-pointer"
                              >
                                <Pencil className="w-3 h-3" />
                              </button>
                            </div>
                          </div>
                        )}
                      </td>

                      <td className="py-3 px-3 text-center">
                        {s.pending > 0 ? (
                          <button
                            type="button"
                            onClick={() => onOpenBillingHistory?.(s.id)}
                            className="px-2.5 py-1 rounded bg-orange-500 hover:bg-orange-600 text-white font-bold text-[11px] cursor-pointer"
                            title="Open Billing History"
                          >
                            PKR {s.pending.toLocaleString()}
                          </button>
                        ) : (
                          <span className="text-slate-400">—</span>
                        )}
                      </td>

                      <td className="py-3 px-3 text-right">
                        <div className="inline-flex items-center gap-1.5 relative" data-student-more>
                          <button
                            type="button"
                            onClick={() => onOpenProfile?.(s.id)}
                            className="px-2.5 py-1 rounded border border-teal-300 bg-white hover:bg-teal-50 text-teal-700 text-[11px] font-semibold cursor-pointer"
                          >
                            View
                          </button>
                          <button
                            type="button"
                            onClick={() => setOpenMoreId((cur) => (cur === s.id ? null : s.id))}
                            className="px-2.5 py-1 rounded border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 text-[11px] font-semibold inline-flex items-center gap-1 cursor-pointer"
                          >
                            <span>More</span>
                            <ChevronDown className="w-3 h-3" />
                          </button>

                          {openMoreId === s.id && (
                            <div className="absolute right-0 top-full mt-1 w-40 rounded-lg bg-white border border-slate-200 shadow-lg py-1 z-30 text-left text-xs">
                              <button
                                type="button"
                                onClick={() => {
                                  setOpenMoreId(null)
                                  onOpenProfile?.(s.id)
                                }}
                                className="w-full px-3 py-1.5 hover:bg-slate-50 text-slate-700 font-medium cursor-pointer"
                              >
                                View Profile
                              </button>
                              <button
                                type="button"
                                onClick={() => {
                                  setOpenMoreId(null)
                                  onOpenBillingHistory?.(s.id)
                                }}
                                className="w-full px-3 py-1.5 hover:bg-slate-50 text-slate-700 font-medium cursor-pointer"
                              >
                                Billing History
                              </button>
                              <button
                                type="button"
                                onClick={() => {
                                  setOpenMoreId(null)
                                  onOpenFeeSetup?.(s.id, 'edit')
                                }}
                                className="w-full px-3 py-1.5 hover:bg-slate-50 text-slate-700 font-medium cursor-pointer"
                              >
                                Fee Setup
                              </button>
                              <button
                                type="button"
                                onClick={() => {
                                  setOpenMoreId(null)
                                  onOpenQuickPayment?.(s.id)
                                }}
                                className="w-full px-3 py-1.5 hover:bg-slate-50 text-emerald-700 font-medium cursor-pointer"
                              >
                                Collect Payment
                              </button>
                              <button
                                type="button"
                                onClick={() => handleDeleteStudent(s)}
                                className="w-full px-3 py-1.5 hover:bg-rose-50 text-rose-600 font-semibold cursor-pointer"
                              >
                                Delete
                              </button>
                            </div>
                          )}
                        </div>
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Bottom Pagination matching Pick 4 */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-slate-100 text-xs text-slate-500">
          <span>
            Showing {startNum}–{endNum} of {filteredStudents.length}
          </span>
          <div className="flex items-center gap-1">
            <button
              type="button"
              disabled={safePage <= 1}
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              className="p-1.5 rounded border border-slate-200 hover:bg-slate-50 disabled:opacity-40 cursor-pointer"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
            </button>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((pg) => (
              <button
                key={pg}
                type="button"
                onClick={() => setCurrentPage(pg)}
                className={`px-2.5 py-1 rounded font-semibold cursor-pointer ${
                  pg === safePage
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
              className="p-1.5 rounded border border-slate-200 hover:bg-slate-50 disabled:opacity-40 cursor-pointer"
            >
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default AllStudentsDirectory
