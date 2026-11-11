import React, { useState, useMemo, useEffect } from 'react'
import {
  UserPlus,
  DollarSign,
  FileText,
  ArrowDown,
  MessageSquare,
  Clock,
  Calendar,
  Eye,
  EyeOff,
  Receipt,
  CheckCircle2,
  Percent,
  Hourglass,
  Users,
  CalendarCheck,
  AlertTriangle,
  UserCheck,
  BookOpen,
  Award,
  Megaphone,
  Link2,
  XCircle,
  Sparkles,
  Activity,
  FileBadge
} from 'lucide-react'
import { useAppData } from '../../context/AppDataContext'
import { useAuth } from '../../context/AuthContext'
import { useToast } from '../../context/ToastContext'
import { isClassAllowedForTier } from '../../utils/tierGating'
import { getAdminDisplayName } from '../../utils/profileUtils'
import {
  readMyAttendanceLogs,
  recordMyTimeIn,
  recordMyTimeOut
} from '../institute-admin/attendance/MyAttendanceView'

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

/**
 * Stylized layered 3D gradient medallion badge for financial KPI cards.
 */
const StylizedKpiMedallion = ({ icon: Icon, gradientClass, ringClass, glowStyle }) => (
  <div className="relative shrink-0">
    <div
      className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${gradientClass} p-[1px] shadow-md ${ringClass}`}
      style={glowStyle}
    >
      <div className="w-full h-full rounded-[15px] bg-gradient-to-b from-white/25 to-transparent flex items-center justify-center relative overflow-hidden">
        <div className="absolute -top-3 -right-3 w-7 h-7 rounded-full bg-white/20 blur-[1px]" />
        <Icon className="w-5 h-5 text-white drop-shadow-xs relative z-10 stroke-[2.2]" />
      </div>
    </div>
  </div>
)

/**
 * Advanced interactive SVG combo bar + smooth spline trend chart for Fee Collection Overview.
 */
const FeeCollectionOverviewChart = ({ monthlyData, chartRange, onChangeRange }) => {
  const [hoveredIdx, setHoveredIdx] = useState(null)

  const visibleData = useMemo(
    () => (chartRange === '6m' ? monthlyData.slice(Math.max(0, new Date().getMonth() - 5), new Date().getMonth() + 1) : monthlyData),
    [monthlyData, chartRange]
  )

  const maxTotal = useMemo(() => {
    const peak = Math.max(
      100000,
      ...visibleData.map(m => Math.max(m.totalBilled, m.collected + m.waiver + m.outstanding))
    )
    return Math.ceil(peak / 100000) * 100000
  }, [visibleData])

  const svgWidth = 760
  const svgHeight = 250
  const padLeft = 64
  const padRight = 22
  const padTop = 26
  const padBottom = 30
  const plotW = svgWidth - padLeft - padRight
  const plotH = svgHeight - padTop - padBottom
  const count = Math.max(1, visibleData.length)
  const slotW = plotW / count
  const barW = Math.min(34, Math.max(18, slotW * 0.56))

  const yPos = (val) => padTop + plotH - Math.min(1, Math.max(0, val / maxTotal)) * plotH

  const linePoints = visibleData.map((d, i) => ({
    x: padLeft + i * slotW + slotW / 2,
    y: yPos(d.totalBilled),
    data: d
  }))

  // Smooth cubic bezier path
  const linePath = useMemo(() => {
    if (linePoints.length === 0) return ''
    if (linePoints.length === 1) return `M ${linePoints[0].x} ${linePoints[0].y}`
    let d = `M ${linePoints[0].x} ${linePoints[0].y}`
    for (let i = 0; i < linePoints.length - 1; i++) {
      const p0 = linePoints[i]
      const p1 = linePoints[i + 1]
      const cx = (p0.x + p1.x) / 2
      d += ` C ${cx} ${p0.y}, ${cx} ${p1.y}, ${p1.x} ${p1.y}`
    }
    return d
  }, [linePoints])

  const areaPath = useMemo(() => {
    if (!linePath || linePoints.length === 0) return ''
    const baseY = padTop + plotH
    return `${linePath} L ${linePoints[linePoints.length - 1].x} ${baseY} L ${linePoints[0].x} ${baseY} Z`
  }, [linePath, linePoints, plotH])

  const yTicks = [0, 0.2, 0.4, 0.6, 0.8, 1].map(r => Math.round(maxTotal * r))
  const formatCompact = (val) => {
    if (val >= 1000000) return `PKR ${(val / 1000000).toFixed(1)}M`
    if (val >= 1000) return `PKR ${(val / 1000).toFixed(0)}K`
    return `PKR ${val}`
  }

  return (
    <div className="bg-[var(--surface)] border border-[var(--border)] rounded-2xl p-5 shadow-soft flex flex-col justify-between">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 text-white flex items-center justify-center shadow-xs">
            <Activity className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-sm sm:text-base font-bold text-[var(--text)]">Fee Collection Overview</h2>
            <p className="text-[11px] text-[var(--text-muted)]">Monthly cash collected, waivers, outstanding &amp; billed trend</p>
          </div>
        </div>

        <select
          value={chartRange}
          onChange={(e) => onChangeRange(e.target.value)}
          className="px-3 py-1.5 rounded-xl border border-[var(--border)] bg-[var(--surface)] text-xs font-semibold text-[var(--text)] cursor-pointer self-start sm:self-auto"
        >
          <option value="year">This Year</option>
          <option value="6m">Last 6 Months</option>
        </select>
      </div>

      {/* Interactive Legend */}
      <div className="flex flex-wrap items-center justify-center gap-4 text-[11px] font-semibold text-[var(--text-muted)] mb-2">
        <span className="inline-flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
          <span>Cash collected (by month)</span>
        </span>
        <span className="inline-flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-violet-500" />
          <span>Waiver</span>
        </span>
        <span className="inline-flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
          <span>Outstanding</span>
        </span>
        <span className="inline-flex items-center gap-1.5">
          <span className="w-3 h-3 rounded-full border-2 border-rose-500 bg-white" />
          <span>Total Billed</span>
        </span>
      </div>

      {/* Responsive SVG Combo Chart */}
      <div className="relative w-full">
        <svg viewBox={`0 0 ${svgWidth} ${svgHeight}`} className="w-full h-auto overflow-visible">
          <defs>
            <linearGradient id="dashCashGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#10B981" />
              <stop offset="100%" stopColor="#059669" />
            </linearGradient>
            <linearGradient id="dashWaiverGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#8B5CF6" />
              <stop offset="100%" stopColor="#6D28D9" />
            </linearGradient>
            <linearGradient id="dashOutGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#FBBF24" />
              <stop offset="100%" stopColor="#F59E0B" />
            </linearGradient>
            <linearGradient id="dashAreaGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#F43F5E" stopOpacity="0.16" />
              <stop offset="100%" stopColor="#F43F5E" stopOpacity="0.01" />
            </linearGradient>
          </defs>

          {/* Horizontal Grid & Y-Axis Ticks */}
          {yTicks.map((tick) => {
            const y = yPos(tick)
            return (
              <g key={tick}>
                <line
                  x1={padLeft}
                  y1={y}
                  x2={svgWidth - padRight}
                  y2={y}
                  stroke="#E2E8F0"
                  strokeDasharray="3 3"
                  strokeWidth="1"
                />
                <text
                  x={padLeft - 8}
                  y={y + 4}
                  textAnchor="end"
                  fontSize="10"
                  fill="#94A3B8"
                  fontFamily="ui-monospace, SFMono-Regular, monospace"
                >
                  {formatCompact(tick)}
                </text>
              </g>
            )
          })}

          {/* Smooth Total Billed Area Glow */}
          {areaPath && <path d={areaPath} fill="url(#dashAreaGrad)" />}

          {/* Stacked Rounded Gradient Bars */}
          {visibleData.map((d, i) => {
            const cx = padLeft + i * slotW + slotW / 2
            const bx = cx - barW / 2
            const baseBottom = padTop + plotH
            const isHovered = hoveredIdx === i

            const hCash = (d.collected / maxTotal) * plotH
            const hWaiver = (d.waiver / maxTotal) * plotH
            const hOut = (d.outstanding / maxTotal) * plotH

            const yCash = baseBottom - hCash
            const yWaiver = yCash - hWaiver
            const yOut = yWaiver - hOut

            return (
              <g
                key={d.month}
                onMouseEnter={() => setHoveredIdx(i)}
                onMouseLeave={() => setHoveredIdx(null)}
                className="cursor-pointer"
              >
                {isHovered && (
                  <rect
                    x={cx - slotW * 0.45}
                    y={padTop}
                    width={slotW * 0.9}
                    height={plotH}
                    rx="10"
                    fill="#F1F5F9"
                    opacity="0.7"
                  />
                )}

                {hCash > 0 && (
                  <rect
                    x={bx}
                    y={yCash}
                    width={barW}
                    height={hCash}
                    rx={hWaiver === 0 && hOut === 0 ? 6 : 2}
                    fill="url(#dashCashGrad)"
                  />
                )}
                {hWaiver > 0 && (
                  <rect
                    x={bx}
                    y={yWaiver}
                    width={barW}
                    height={hWaiver}
                    rx={hOut === 0 ? 6 : 2}
                    fill="url(#dashWaiverGrad)"
                  />
                )}
                {hOut > 0 && (
                  <rect
                    x={bx}
                    y={yOut}
                    width={barW}
                    height={hOut}
                    rx="6"
                    fill="url(#dashOutGrad)"
                  />
                )}

                <text
                  x={cx}
                  y={svgHeight - 8}
                  textAnchor="middle"
                  fontSize="11"
                  fontWeight={isHovered ? '700' : '500'}
                  fill={isHovered ? '#0F172A' : '#64748B'}
                >
                  {d.month}
                </text>
              </g>
            )
          })}

          {/* Total Billed Smooth Trendline */}
          {linePath && (
            <path
              d={linePath}
              fill="none"
              stroke="#E11D48"
              strokeWidth="2.5"
              strokeLinecap="round"
            />
          )}

          {/* Data Nodes + Floating Value Tags on Non-Zero Months */}
          {linePoints.map((pt, i) => {
            const isHovered = hoveredIdx === i
            return (
              <g
                key={pt.data.month}
                onMouseEnter={() => setHoveredIdx(i)}
                onMouseLeave={() => setHoveredIdx(null)}
                className="cursor-pointer"
              >
                <circle
                  cx={pt.x}
                  cy={pt.y}
                  r={isHovered ? 5.5 : 3.5}
                  fill="#FFFFFF"
                  stroke="#E11D48"
                  strokeWidth="2.5"
                />
                {pt.data.totalBilled > 0 && (
                  <text
                    x={pt.x}
                    y={Math.max(12, pt.y - 9)}
                    textAnchor="middle"
                    fontSize="9.5"
                    fontWeight="700"
                    fill="#BE123C"
                  >
                    {formatCompact(pt.data.totalBilled)}
                  </text>
                )}
              </g>
            )
          })}
        </svg>

        {/* Glassmorphic Hover Tooltip */}
        {hoveredIdx !== null && visibleData[hoveredIdx] && (
          <div className="mt-2 px-3.5 py-2 rounded-xl bg-slate-900 text-white text-[11px] flex flex-wrap items-center justify-between gap-3 shadow-lg">
            <span className="font-bold text-emerald-300">{visibleData[hoveredIdx].month} Breakdown</span>
            <span>Billed: <strong>PKR {visibleData[hoveredIdx].totalBilled.toLocaleString()}</strong></span>
            <span className="text-emerald-400">Collected: <strong>PKR {visibleData[hoveredIdx].collected.toLocaleString()}</strong></span>
            <span className="text-violet-300">Waiver: <strong>PKR {visibleData[hoveredIdx].waiver.toLocaleString()}</strong></span>
            <span className="text-amber-300">Outstanding: <strong>PKR {visibleData[hoveredIdx].outstanding.toLocaleString()}</strong></span>
          </div>
        )}
      </div>
    </div>
  )
}

export const InstituteDashboard = ({ currentInstitute, onRouteChange, onOpenQuickPayment, onOpenSendSms }) => {
  const {
    students = [],
    teachers = [],
    fees = [],
    notices = [],
    attendance = {}
  } = useAppData()
  const { user } = useAuth()
  const { toast } = useToast()

  const instId = currentInstitute?.id || 'default'
  const displayName = getAdminDisplayName(user)
  const todayIso = new Date().toISOString().split('T')[0]

  const [hideAmounts, setHideAmounts] = useState(true)
  const [periodFilter, setPeriodFilter] = useState('this_month')
  const [chartRange, setChartRange] = useState('year')

  const [myAttLogs, setMyAttLogs] = useState(() => readMyAttendanceLogs(instId, user?.email))

  useEffect(() => {
    setMyAttLogs(readMyAttendanceLogs(instId, user?.email))
    const sync = () => setMyAttLogs(readMyAttendanceLogs(instId, user?.email))
    window.addEventListener('my-attendance-updated', sync)
    return () => window.removeEventListener('my-attendance-updated', sync)
  }, [instId, user?.email])

  const todayCheckIn = useMemo(
    () => myAttLogs.find(l => l.date === todayIso) || null,
    [myAttLogs, todayIso]
  )

  const handleMyTimeIn = () => {
    const res = recordMyTimeIn(instId, user?.email)
    setMyAttLogs(res.logs)
    if (res.alreadyDone) {
      toast?.info?.(`Already checked in today at ${res.entry.timeIn}.`)
      return
    }
    toast?.success?.(`Checked in at ${res.entry.timeIn}.`)
  }

  const handleMyTimeOut = () => {
    const res = recordMyTimeOut(instId, user?.email)
    setMyAttLogs(res.logs)
    if (res.notCheckedIn) {
      toast?.warning?.('Check in first before checking out.')
      return
    }
    if (!res.alreadyDone) {
      toast?.success?.(`Checked out at ${res.entry.timeOut}.`)
    }
    onRouteChange?.('inst-attendance-my')
  }

  const instStudents = useMemo(
    () => students.filter(s => (!currentInstitute?.id || s.instituteId === currentInstitute.id) && isClassAllowedForTier(s.className, currentInstitute)),
    [students, currentInstitute]
  )

  const activeStudents = useMemo(
    () => instStudents.filter(s => (s.status || 'Active') === 'Active'),
    [instStudents]
  )

  const instTeachers = useMemo(
    () => teachers.filter(t => !currentInstitute?.id || !t.instituteId || t.instituteId === currentInstitute.id),
    [teachers, currentInstitute?.id]
  )

  const instFees = useMemo(
    () => fees.filter(f => !currentInstitute?.id || !f.instituteId || f.instituteId === currentInstitute.id),
    [fees, currentInstitute?.id]
  )

  const instNotices = useMemo(
    () => notices.filter(n => !currentInstitute?.id || !n.instituteId || n.instituteId === currentInstitute.id).slice(0, 4),
    [notices, currentInstitute?.id]
  )

  const upcomingEvents = useMemo(() => {
    try {
      const saved = JSON.parse(localStorage.getItem(`sms_campus_events_${instId}`) || '[]')
      if (!Array.isArray(saved)) return []
      return saved.filter(ev => !ev.date || ev.date >= todayIso).slice(0, 3)
    } catch {
      return []
    }
  }, [instId, todayIso])

  // Real financial KPIs (respects periodFilter for current period cards, All Time for Total Outstanding)
  const financialTotals = useMemo(() => {
    const now = new Date()
    const targetMonth = periodFilter === 'last_month'
      ? (now.getMonth() === 0 ? 11 : now.getMonth() - 1)
      : now.getMonth()
    const targetYear = periodFilter === 'last_month' && now.getMonth() === 0
      ? now.getFullYear() - 1
      : now.getFullYear()

    const periodFees = instFees.filter(f => {
      if (periodFilter === 'this_year') return true
      const rawDate = f.dueDate || f.createdAt || f.paidAt
      if (!rawDate) return periodFilter === 'this_month'
      const d = new Date(rawDate)
      return !Number.isNaN(d.getTime()) ? (d.getMonth() === targetMonth && d.getFullYear() === targetYear) : periodFilter === 'this_month'
    })

    const totalBilled = periodFees.reduce((s, f) => s + Number(f.amount || 0), 0)
    const cashCollected = periodFees.reduce((s, f) => s + (f.status === 'Paid' ? Number(f.paidAmount ?? f.amount ?? 0) : Number(f.paidAmount || 0)), 0)
    const waivers = periodFees.reduce((s, f) => s + Number(f.discount || f.waiver || 0), 0)

    const inactiveIds = new Set(instStudents.filter(s => s.status && s.status !== 'Active').map(s => s.id))
    const activeOutstanding = instFees
      .filter(f => !inactiveIds.has(f.studentId) && f.status !== 'Paid')
      .reduce((s, f) => s + Math.max(0, Number(f.amount || 0) - Number(f.paidAmount || 0) - Number(f.discount || f.waiver || 0)), 0)

    const outstandingStudents = new Set(instFees.filter(f => f.status !== 'Paid').map(f => f.studentName || f.studentId)).size
    const finesPending = instFees.filter(f => Number(f.fine || f.lateFine || 0) > 0 && f.status !== 'Paid').length

    return { totalBilled, cashCollected, waivers, activeOutstanding, outstandingStudents, finesPending }
  }, [instFees, instStudents, periodFilter])

  // Real monthly breakdown Jan..Dec for Fee Collection Overview chart
  const monthlyChartData = useMemo(() => {
    const buckets = MONTHS.map(m => ({ month: m, totalBilled: 0, collected: 0, waiver: 0, outstanding: 0 }))
    instFees.forEach(f => {
      const rawDate = f.dueDate || f.paidAt || f.createdAt
      const d = rawDate ? new Date(rawDate) : new Date()
      const idx = !Number.isNaN(d.getTime()) ? d.getMonth() : new Date().getMonth()
      const amt = Number(f.amount || 0)
      const waiver = Number(f.discount || f.waiver || 0)
      const collected = f.status === 'Paid' ? Number(f.paidAmount ?? amt) : Number(f.paidAmount || 0)
      const outstanding = f.status === 'Paid' ? 0 : Math.max(0, amt - collected - waiver)
      buckets[idx].totalBilled += amt
      buckets[idx].collected += collected
      buckets[idx].waiver += waiver
      buckets[idx].outstanding += outstanding
    })
    return buckets
  }, [instFees])

  // Real Today's Attendance breakdown
  const attendanceBreakdown = useMemo(() => {
    const counts = { present: 0, absent: 0, late: 0, leave: 0, consecutiveAbsent: 0, notMarked: activeStudents.length }
    const todayEntries = Object.entries(attendance || {}).filter(([k]) => k.includes(todayIso))
    if (todayEntries.length > 0) {
      let marked = 0
      todayEntries.forEach(([, recMap]) => {
        if (recMap && typeof recMap === 'object') {
          Object.values(recMap).forEach(entry => {
            const st = String(entry?.status || '').toLowerCase()
            if (st === 'present') counts.present++
            else if (st === 'absent') counts.absent++
            else if (st === 'late') counts.late++
            else if (st === 'leave') counts.leave++
            if (st) marked++
          })
        }
      })
      counts.notMarked = Math.max(0, activeStudents.length - marked)
    }

    let staffPresent = 0
    try {
      const staffMap = JSON.parse(localStorage.getItem(`eims_staff_attendance_${instId}`) || '{}')
      const dayRec = staffMap[todayIso] || {}
      Object.values(dayRec).forEach(st => { if (st === 'Present' || st === 'Late') staffPresent++ })
    } catch (_) {}

    const studentAttPct = activeStudents.length > 0 ? Math.round(((counts.present + counts.late) / activeStudents.length) * 100) : 0
    const staffAttPct = instTeachers.length > 0 ? Math.round((staffPresent / instTeachers.length) * 100) : 0
    return { ...counts, studentAttPct, staffAttPct }
  }, [attendance, todayIso, activeStudents.length, instId, instTeachers.length])

  const formattedToday = useMemo(
    () => new Date().toLocaleDateString('en-US', { weekday: 'long', day: '2-digit', month: 'long', year: 'numeric' }).toUpperCase(),
    []
  )

  const maskCurrency = (val) => (hideAmounts ? '******' : `PKR ${Number(val || 0).toLocaleString()}`)

  return (
    <div className="p-4 sm:p-6 space-y-5 max-w-[1440px] mx-auto">
      {/* Header Bar + Quick Action Pills */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <FileText className="w-5 h-5 text-[var(--text-muted)]" />
          <h1 className="text-lg sm:text-xl font-bold text-[var(--text)]">My Dashboard</h1>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => onRouteChange?.('inst-admissions-enroll')}
            className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold flex items-center gap-1.5 shadow-xs cursor-pointer transition-colors"
          >
            <UserPlus className="w-3.5 h-3.5" />
            <span>New Enrollment</span>
          </button>
          <button
            type="button"
            onClick={() => (onOpenQuickPayment ? onOpenQuickPayment() : onRouteChange?.('inst-fees'))}
            className="px-3.5 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-white text-xs font-semibold flex items-center gap-1.5 shadow-xs cursor-pointer transition-colors"
          >
            <DollarSign className="w-3.5 h-3.5" />
            <span>Add Payment</span>
          </button>
          <button
            type="button"
            onClick={() => onRouteChange?.('inst-fees')}
            className="px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold flex items-center gap-1.5 shadow-xs cursor-pointer transition-colors"
          >
            <FileText className="w-3.5 h-3.5" />
            <span>Generate Invoice</span>
          </button>
          <button
            type="button"
            onClick={() => onRouteChange?.('inst-accounts-expenses')}
            className="px-3.5 py-2 rounded-xl bg-[var(--surface)] border border-[var(--border)] hover:bg-slate-50 text-[var(--text)] text-xs font-semibold flex items-center gap-1.5 cursor-pointer transition-colors"
          >
            <ArrowDown className="w-3.5 h-3.5 text-rose-500" />
            <span>Manage Expense</span>
          </button>
          <button
            type="button"
            onClick={() => (onOpenSendSms ? onOpenSendSms() : onRouteChange?.('inst-communication'))}
            className="px-3.5 py-2 rounded-xl bg-[var(--surface)] border border-[var(--border)] hover:bg-slate-50 text-[var(--text)] text-xs font-semibold flex items-center gap-1.5 cursor-pointer transition-colors"
          >
            <MessageSquare className="w-3.5 h-3.5 text-emerald-600" />
            <span>Send SMS</span>
          </button>
        </div>
      </div>

      {/* Welcome Back Unknown User Hero Card */}
      <div className="bg-gradient-to-r from-[var(--surface)] via-indigo-50/40 to-emerald-50/40 border border-[var(--border)] rounded-2xl p-5 sm:p-6 shadow-soft flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div className="space-y-2">
          <h2 className="text-xl sm:text-2xl font-extrabold text-[var(--text)] tracking-tight">
            Welcome back, {displayName}!
          </h2>
          <p className="text-xs sm:text-sm text-[var(--text-muted)]">
            Here&apos;s what&apos;s happening at your institution today.
          </p>
          <div className="pt-1 flex flex-wrap items-center gap-2">
            {todayCheckIn?.timeIn && !todayCheckIn?.timeOut ? (
              <>
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-50 border border-indigo-200 text-[11px] font-bold text-indigo-700">
                  <Clock className="w-3.5 h-3.5" />
                  <span>My Time In {todayCheckIn.timeIn}</span>
                </span>
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-orange-50 border border-orange-200 text-[11px] font-bold text-orange-700">
                  Not checked out
                </span>
              </>
            ) : todayCheckIn?.timeIn && todayCheckIn?.timeOut ? (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-[11px] font-bold text-emerald-700">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>In {todayCheckIn.timeIn} · Out {todayCheckIn.timeOut}</span>
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[var(--surface)] border border-[var(--border)] text-[11px] font-semibold text-[var(--text-muted)]">
                <Clock className="w-3.5 h-3.5 text-emerald-600" />
                <span>Not checked in today</span>
              </span>
            )}
          </div>
        </div>

        <div className="flex flex-col items-start lg:items-end gap-3">
          <span className="text-[11px] font-bold tracking-wider text-indigo-600 uppercase">
            {formattedToday}
          </span>
          <div className="flex flex-wrap items-center gap-2">
            {!todayCheckIn?.timeIn ? (
              <button
                type="button"
                onClick={handleMyTimeIn}
                className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold cursor-pointer transition-colors"
              >
                My Time In
              </button>
            ) : !todayCheckIn?.timeOut ? (
              <button
                type="button"
                onClick={handleMyTimeOut}
                className="px-4 py-2 rounded-xl bg-orange-500 hover:bg-orange-600 text-white text-xs font-semibold cursor-pointer transition-colors"
              >
                My Time Out
              </button>
            ) : (
              <button
                type="button"
                onClick={() => onRouteChange?.('inst-attendance-my')}
                className="px-4 py-2 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-semibold cursor-pointer transition-colors"
              >
                Completed Today
              </button>
            )}
            <button
              type="button"
              onClick={() => onRouteChange?.('inst-attendance-my')}
              className="px-4 py-2 rounded-xl bg-[var(--surface)] border border-[var(--border)] hover:bg-slate-50 text-[var(--text)] text-xs font-semibold cursor-pointer transition-colors"
            >
              My Attendance
            </button>
            <select
              value={periodFilter}
              onChange={(e) => setPeriodFilter(e.target.value)}
              className="px-3 py-2 rounded-xl bg-[var(--surface)] border border-[var(--border)] text-xs font-semibold text-[var(--text)] cursor-pointer"
            >
              <option value="this_month">This Month</option>
              <option value="last_month">Last Month</option>
              <option value="this_year">This Year</option>
            </select>
            <button
              type="button"
              onClick={() => setHideAmounts(prev => !prev)}
              className="p-2 rounded-xl bg-[var(--surface)] border border-[var(--border)] text-[var(--text-muted)] hover:text-[var(--text)] cursor-pointer"
              title={hideAmounts ? 'Show Financial Figures' : 'Hide Financial Figures'}
            >
              {hideAmounts ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
        </div>
      </div>

      {/* 4 Financial KPI Cards with Stylized Gradient Medallions & Detail Eye Buttons */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <div
          onClick={() => onRouteChange?.('inst-fees')}
          className="bg-[var(--surface)] border border-[var(--border)] hover:border-cyan-300 rounded-2xl p-5 shadow-soft flex flex-col justify-between gap-3 cursor-pointer transition-colors"
        >
          <div className="flex items-start gap-3.5">
            <StylizedKpiMedallion
              icon={Receipt}
              gradientClass="from-cyan-400 via-teal-500 to-sky-600"
              ringClass="ring-4 ring-cyan-50"
            />
            <div className="min-w-0">
              <p className="text-xs font-semibold text-[var(--text-muted)]">Total Billed</p>
              <p className="text-lg sm:text-xl font-extrabold text-[var(--text)] mt-1 font-mono">
                {maskCurrency(financialTotals.totalBilled)}
              </p>
            </div>
          </div>
          <div className="flex items-center justify-between gap-2 pt-1">
            <p className="text-[11px] text-[var(--text-muted)]">Invoices generated in selected period</p>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation()
                onRouteChange?.('inst-fees')
              }}
              title="View Billed Invoices"
              aria-label="View Billed Invoices"
              className="p-1.5 rounded-xl bg-slate-50 hover:bg-cyan-50 text-slate-400 hover:text-cyan-600 border border-slate-200/80 hover:border-cyan-300 transition-all cursor-pointer shadow-2xs flex items-center justify-center shrink-0 group/eye"
            >
              <Eye className="w-4 h-4 transition-transform group-hover/eye:scale-110" />
            </button>
          </div>
        </div>

        <div
          onClick={() => onRouteChange?.('inst-accounts-collection')}
          className="bg-[var(--surface)] border border-[var(--border)] hover:border-emerald-300 rounded-2xl p-5 shadow-soft flex flex-col justify-between gap-3 cursor-pointer transition-colors"
        >
          <div className="flex items-start gap-3.5">
            <StylizedKpiMedallion
              icon={CheckCircle2}
              gradientClass="from-emerald-400 via-green-500 to-teal-600"
              ringClass="ring-4 ring-emerald-50"
            />
            <div className="min-w-0">
              <p className="text-xs font-semibold text-[var(--text-muted)]">Cash Collected</p>
              <p className="text-lg sm:text-xl font-extrabold text-[var(--text)] mt-1 font-mono">
                {maskCurrency(financialTotals.cashCollected)}
              </p>
            </div>
          </div>
          <div className="flex items-center justify-between gap-2 pt-1">
            <p className="text-[11px] text-[var(--text-muted)]">Payments received in selected period</p>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation()
                onRouteChange?.('inst-accounts-collection')
              }}
              title="View Cash Collection Report"
              aria-label="View Cash Collection Report"
              className="p-1.5 rounded-xl bg-slate-50 hover:bg-emerald-50 text-slate-400 hover:text-emerald-600 border border-slate-200/80 hover:border-emerald-300 transition-all cursor-pointer shadow-2xs flex items-center justify-center shrink-0 group/eye"
            >
              <Eye className="w-4 h-4 transition-transform group-hover/eye:scale-110" />
            </button>
          </div>
        </div>

        <div className="bg-[var(--surface)] border border-[var(--border)] rounded-2xl p-5 shadow-soft flex flex-col justify-between gap-3">
          <div className="flex items-start gap-3.5">
            <StylizedKpiMedallion
              icon={Percent}
              gradientClass="from-slate-600 via-slate-700 to-indigo-800"
              ringClass="ring-4 ring-slate-100"
            />
            <div className="min-w-0">
              <p className="text-xs font-semibold text-[var(--text-muted)]">Waivers / Discount</p>
              <p className="text-lg sm:text-xl font-extrabold text-[var(--text)] mt-1 font-mono">
                {maskCurrency(financialTotals.waivers)}
              </p>
            </div>
          </div>
          <div className="flex items-center justify-between gap-2 pt-1">
            <p className="text-[11px] text-[var(--text-muted)]">Waivers applied in selected period</p>
            <button
              type="button"
              onClick={() => onRouteChange?.('inst-fees-history')}
              title="View Waivers & Student Billing"
              aria-label="View Waivers & Student Billing"
              className="p-1.5 rounded-xl bg-slate-50 hover:bg-indigo-50 text-slate-400 hover:text-indigo-600 border border-slate-200/80 hover:border-indigo-300 transition-all cursor-pointer shadow-2xs flex items-center justify-center shrink-0 group/eye"
            >
              <Eye className="w-4 h-4 transition-transform group-hover/eye:scale-110" />
            </button>
          </div>
        </div>

        <div className="bg-[var(--surface)] border border-[var(--border)] rounded-2xl p-5 shadow-soft flex flex-col justify-between gap-3">
          <div className="flex items-start gap-3.5">
            <StylizedKpiMedallion
              icon={Hourglass}
              gradientClass="from-orange-400 via-amber-500 to-rose-500"
              ringClass="ring-4 ring-orange-50"
            />
            <div className="min-w-0">
              <p className="text-xs font-semibold text-[var(--text-muted)]">Total Outstanding (All Time)</p>
              <p className="text-lg sm:text-xl font-extrabold text-[var(--text)] mt-1 font-mono">
                {maskCurrency(financialTotals.activeOutstanding)}
              </p>
            </div>
          </div>
          <div className="px-2.5 py-1.5 rounded-lg bg-rose-50/70 border border-rose-100 text-[11px] text-rose-700 font-medium flex items-center justify-between gap-2">
            <span>Excludes dropped / graduated</span>
            <button
              type="button"
              onClick={() => onRouteChange?.('inst-fees-outstanding')}
              title="View Outstanding Fees"
              aria-label="View Outstanding Fees"
              className="p-1 rounded-lg bg-white hover:bg-rose-100 text-rose-400 hover:text-rose-600 border border-rose-200/80 transition-all cursor-pointer shadow-2xs flex items-center justify-center shrink-0 group/eye"
            >
              <Eye className="w-4 h-4 transition-transform group-hover/eye:scale-110" />
            </button>
          </div>
        </div>
      </div>

      {/* 5 Secondary Operational KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-5 gap-4">
        <div
          onClick={() => onRouteChange?.('inst-students')}
          className="bg-[var(--surface)] border border-[var(--border)] rounded-2xl p-4 shadow-soft flex items-center gap-3 cursor-pointer hover:border-emerald-300 transition-colors"
        >
          <div className="w-10 h-10 rounded-xl bg-sky-50 text-sky-600 flex items-center justify-center shrink-0">
            <Users className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs font-medium text-[var(--text-muted)]">Active Students</p>
            <p className="text-xl font-bold text-[var(--text)]">{activeStudents.length}</p>
            <p className="text-[10px] text-[var(--text-muted)]">Total</p>
          </div>
        </div>

        <div
          onClick={() => onRouteChange?.('inst-attendance')}
          className="bg-[var(--surface)] border border-[var(--border)] rounded-2xl p-4 shadow-soft flex items-center gap-3 cursor-pointer hover:border-emerald-300 transition-colors"
        >
          <div className="w-10 h-10 rounded-xl bg-teal-50 text-teal-600 flex items-center justify-center shrink-0">
            <CalendarCheck className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs font-medium text-[var(--text-muted)]">Today&apos;s Attendance</p>
            <p className="text-xl font-bold text-[var(--text)]">{attendanceBreakdown.studentAttPct}%</p>
            <p className="text-[10px] text-[var(--text-muted)]">Present</p>
          </div>
        </div>

        <div
          onClick={() => onRouteChange?.('inst-fees-outstanding')}
          className="bg-[var(--surface)] border border-[var(--border)] rounded-2xl p-4 shadow-soft flex items-center gap-3 cursor-pointer hover:border-emerald-300 transition-colors"
        >
          <div className="w-10 h-10 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center shrink-0">
            <Receipt className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs font-medium text-[var(--text-muted)]">Outstanding Fees</p>
            <p className="text-xl font-bold text-[var(--text)]">{financialTotals.outstandingStudents}</p>
            <p className="text-[10px] text-[var(--text-muted)]">Students</p>
          </div>
        </div>

        <div
          onClick={() => onRouteChange?.('inst-fees-fines')}
          className="bg-[var(--surface)] border border-[var(--border)] rounded-2xl p-4 shadow-soft flex items-center gap-3 cursor-pointer hover:border-emerald-300 transition-colors"
        >
          <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
            <AlertTriangle className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs font-medium text-[var(--text-muted)]">Attendance Fines</p>
            <p className="text-xl font-bold text-[var(--text)]">{financialTotals.finesPending}</p>
            <p className="text-[10px] text-[var(--text-muted)]">Unpaid</p>
          </div>
        </div>

        <div
          onClick={() => onRouteChange?.('inst-attendance-staff-report')}
          className="bg-[var(--surface)] border border-[var(--border)] rounded-2xl p-4 shadow-soft flex items-center gap-3 cursor-pointer hover:border-emerald-300 transition-colors"
        >
          <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
            <UserCheck className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs font-medium text-[var(--text-muted)]">Staff Attendance</p>
            <p className="text-xl font-bold text-[var(--text)]">{attendanceBreakdown.staffAttPct}%</p>
            <p className="text-[10px] text-[var(--text-muted)]">Present</p>
          </div>
        </div>
      </div>

      {/* Next Upcoming Events */}
      <div className="bg-[var(--surface)] border border-[var(--border)] rounded-2xl p-5 shadow-soft space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-sm font-bold text-[var(--text)]">
            <Calendar className="w-4 h-4 text-emerald-600" />
            <span>Next Upcoming Events</span>
          </div>
          <button
            type="button"
            onClick={() => onRouteChange?.('inst-events')}
            className="px-3 py-1.5 rounded-xl border border-[var(--border)] hover:bg-slate-50 text-xs font-semibold text-[var(--text)] flex items-center gap-1.5 cursor-pointer"
          >
            <Calendar className="w-3.5 h-3.5 text-emerald-600" />
            <span>View calendar</span>
          </button>
        </div>

        {upcomingEvents.length === 0 ? (
          <p className="text-xs text-[var(--text-muted)] py-3">
            No upcoming school events scheduled yet. Open Academic Calendar to schedule events.
          </p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {upcomingEvents.map((ev, i) => (
              <div key={ev.id || i} className="p-3.5 rounded-xl border border-[var(--border)] bg-slate-50/70">
                <span className="px-2 py-0.5 rounded bg-emerald-600 text-white text-[10px] font-bold uppercase">Event</span>
                <p className="text-xs font-bold text-[var(--text)] mt-1.5">{ev.title}</p>
                <p className="text-[11px] text-[var(--text-muted)] mt-0.5">{ev.date}</p>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Graph + Empty Recent Activity Row */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-5">
        <div className="xl:col-span-7">
          <FeeCollectionOverviewChart
            monthlyData={monthlyChartData}
            chartRange={chartRange}
            onChangeRange={setChartRange}
          />
        </div>

        {/* Recent Activity (intentionally kept empty right now) */}
        <div className="xl:col-span-5 bg-[var(--surface)] border border-[var(--border)] rounded-2xl p-5 shadow-soft flex flex-col">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm sm:text-base font-bold text-[var(--text)]">Recent Activity</h2>
            <span className="text-[11px] font-semibold text-[var(--text-muted)]">Live Feed</span>
          </div>
          <div className="flex-1 flex flex-col items-center justify-center text-center py-10 border border-dashed border-[var(--border)] rounded-xl bg-slate-50/40">
            <Sparkles className="w-7 h-7 text-slate-300 mb-2" />
            <p className="text-xs font-semibold text-[var(--text)]">No Recent Activity</p>
            <p className="text-[11px] text-[var(--text-muted)] mt-0.5">
              Recent school actions and updates will appear here.
            </p>
          </div>
        </div>
      </div>

      {/* Bottom Row: Latest Announcements, Quick Links, Today's Attendance */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Latest Announcements */}
        <div className="bg-[var(--surface)] border border-[var(--border)] rounded-2xl p-5 shadow-soft flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 text-sm font-bold text-[var(--text)] mb-4">
              <Megaphone className="w-4 h-4 text-emerald-600" />
              <span>Latest Announcements</span>
            </div>
            {instNotices.length === 0 ? (
              <p className="text-xs text-[var(--text-muted)] py-6 text-center">
                No announcements published yet.
              </p>
            ) : (
              <div className="space-y-3">
                {instNotices.map(n => (
                  <div key={n.id} className="pb-2.5 border-b border-[var(--border)] last:border-0">
                    <p className="text-xs font-bold text-[var(--text)] flex items-center gap-1.5">
                      <Megaphone className="w-3.5 h-3.5 text-sky-600 shrink-0" />
                      <span className="truncate">{n.title}</span>
                    </p>
                    <p className="text-[11px] text-[var(--text-muted)] mt-0.5 pl-5">{n.date || n.createdAt?.slice(0, 10)}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
          <button
            type="button"
            onClick={() => onRouteChange?.('inst-notices')}
            className="mt-3 text-xs font-semibold text-emerald-700 hover:underline self-start cursor-pointer"
          >
            Manage Announcements →
          </button>
        </div>

        {/* Quick Links */}
        <div className="bg-[var(--surface)] border border-[var(--border)] rounded-2xl p-5 shadow-soft">
          <div className="flex items-center gap-2 text-sm font-bold text-[var(--text)] mb-3">
            <Link2 className="w-4 h-4 text-emerald-600" />
            <span>Quick Links</span>
          </div>
          <div className="space-y-2">
            {[
              { label: 'Classes', route: 'inst-classes', icon: BookOpen },
              { label: 'Timetable', route: 'inst-timetable', icon: Calendar },
              { label: 'Exam Schedule', route: 'inst-exams-schedule', icon: FileText },
              { label: 'Make-up Sessions', route: 'inst-makeup-sessions', icon: Clock },
              { label: 'Marks Entry', route: 'inst-exams-marks', icon: Award },
              { label: 'Payroll', route: 'inst-payroll', icon: DollarSign },
              { label: 'Generate Certificate', route: 'inst-certificates', icon: FileBadge }
            ].map(link => {
              const Icon = link.icon
              return (
                <button
                  key={link.route}
                  type="button"
                  onClick={() => onRouteChange?.(link.route)}
                  className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl border border-[var(--border)] hover:bg-slate-50 text-xs font-semibold text-[var(--text)] transition-colors cursor-pointer"
                >
                  <Icon className="w-3.5 h-3.5 text-slate-500" />
                  <span>{link.label}</span>
                </button>
              )
            })}
          </div>
        </div>

        {/* Today's Attendance Summary */}
        <div className="bg-[var(--surface)] border border-[var(--border)] rounded-2xl p-5 shadow-soft">
          <div className="flex items-center gap-2 text-sm font-bold text-[var(--text)] mb-4">
            <CalendarCheck className="w-4 h-4 text-emerald-600" />
            <span>Today&apos;s Attendance</span>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-100">
              <span className="text-[11px] font-semibold text-emerald-800 flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" /> Present
              </span>
              <p className="text-lg font-bold text-emerald-950 mt-1">{attendanceBreakdown.present}</p>
            </div>
            <div className="p-3 rounded-xl bg-rose-50 border border-rose-100">
              <span className="text-[11px] font-semibold text-rose-800 flex items-center gap-1">
                <XCircle className="w-3.5 h-3.5" /> Absent
              </span>
              <p className="text-lg font-bold text-rose-950 mt-1">{attendanceBreakdown.absent}</p>
            </div>
            <div className="p-3 rounded-xl bg-amber-50 border border-amber-100">
              <span className="text-[11px] font-semibold text-amber-800 flex items-center gap-1">
                <Clock className="w-3.5 h-3.5" /> Late
              </span>
              <p className="text-lg font-bold text-amber-950 mt-1">{attendanceBreakdown.late}</p>
            </div>
            <div className="p-3 rounded-xl bg-sky-50 border border-sky-100">
              <span className="text-[11px] font-semibold text-sky-800 flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5" /> Leave
              </span>
              <p className="text-lg font-bold text-sky-950 mt-1">{attendanceBreakdown.leave}</p>
            </div>
            <div className="p-3 rounded-xl bg-pink-50 border border-pink-100">
              <span className="text-[11px] font-semibold text-pink-800 flex items-center gap-1">
                <AlertTriangle className="w-3.5 h-3.5" /> Absent 3+ Days
              </span>
              <p className="text-lg font-bold text-pink-950 mt-1">{attendanceBreakdown.consecutiveAbsent}</p>
            </div>
            <div className="p-3 rounded-xl bg-slate-100 border border-slate-200">
              <span className="text-[11px] font-semibold text-slate-700 flex items-center gap-1">
                <AlertTriangle className="w-3.5 h-3.5" /> Not Marked
              </span>
              <p className="text-lg font-bold text-slate-900 mt-1">{attendanceBreakdown.notMarked}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default InstituteDashboard
