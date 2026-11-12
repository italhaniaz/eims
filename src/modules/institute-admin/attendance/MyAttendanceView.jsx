import React, { useState, useMemo, useEffect } from 'react'
import {
  ArrowLeft,
  UserPlus,
  DollarSign,
  FileText,
  ArrowDownCircle,
  MessageSquare,
  Calendar,
  Clock,
  CheckCircle2,
  User,
  History,
  LogIn,
  LogOut
} from 'lucide-react'
import { useAuth } from '../../../context/AuthContext'
import { useToast } from '../../../context/ToastContext'
import { getAdminDisplayName } from '../../../utils/profileUtils'

export const getMyAttendanceStorageKey = (instId, userEmail) =>
  `eims_my_attendance_${instId || 'default'}_${userEmail || 'admin'}`

export const readMyAttendanceLogs = (instId, userEmail) => {
  try {
    const raw = localStorage.getItem(getMyAttendanceStorageKey(instId, userEmail))
    const parsed = raw ? JSON.parse(raw) : []
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

const persistAndNotify = (key, logs, instId) => {
  try {
    localStorage.setItem(key, JSON.stringify(logs))
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('my-attendance-updated', { detail: { instId } }))
    }
  } catch (_) {}
}

export const recordMyTimeIn = (instId, userEmail) => {
  const key = getMyAttendanceStorageKey(instId, userEmail)
  const logs = readMyAttendanceLogs(instId, userEmail)
  const todayIso = new Date().toISOString().split('T')[0]
  const existing = logs.find((l) => l.date === todayIso)
  if (existing?.timeIn) {
    return { alreadyDone: true, entry: existing, logs }
  }
  const timeIn = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  const entry = {
    id: `myatt-${Date.now()}`,
    date: todayIso,
    timeIn,
    timeOut: '',
    status: 'Present'
  }
  const next = [entry, ...logs.filter((l) => l.date !== todayIso)]
  persistAndNotify(key, next, instId)
  return { alreadyDone: false, entry, logs: next }
}

export const recordMyTimeOut = (instId, userEmail) => {
  const key = getMyAttendanceStorageKey(instId, userEmail)
  const logs = readMyAttendanceLogs(instId, userEmail)
  const todayIso = new Date().toISOString().split('T')[0]
  const existing = logs.find((l) => l.date === todayIso)
  if (!existing?.timeIn) {
    return { notCheckedIn: true, entry: null, logs }
  }
  if (existing.timeOut) {
    return { alreadyDone: true, entry: existing, logs }
  }
  const timeOut = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  const next = logs.map((l) => (l.date === todayIso ? { ...l, timeOut } : l))
  persistAndNotify(key, next, instId)
  const updatedEntry = next.find((l) => l.date === todayIso)
  return { alreadyDone: false, entry: updatedEntry, logs: next }
}

const SHORT_WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
const SHORT_MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

const formatHistoryDate = (iso) => {
  if (!iso) return '—'
  const dt = new Date(`${String(iso).slice(0, 10)}T12:00:00`)
  if (Number.isNaN(dt.getTime())) return iso
  return `${SHORT_WEEKDAYS[dt.getDay()]}, ${String(dt.getDate()).padStart(2, '0')} ${SHORT_MONTHS[dt.getMonth()]} ${dt.getFullYear()}`
}

export const MyAttendanceView = ({
  currentInstitute,
  onRouteChange,
  onOpenQuickPayment,
  onOpenSendSms
}) => {
  const { user } = useAuth()
  const { toast } = useToast()

  const instId = currentInstitute?.id || 'default'
  const displayName = getAdminDisplayName(user)
  const roleLabel = String(user?.role || 'ADMIN').replace(/_/g, ' ').toUpperCase()
  const now = new Date()
  const todayIso = now.toISOString().split('T')[0]
  const currentMonthPrefix = todayIso.slice(0, 7)

  const [logs, setLogs] = useState(() => readMyAttendanceLogs(instId, user?.email))

  useEffect(() => {
    setLogs(readMyAttendanceLogs(instId, user?.email))
    const sync = () => setLogs(readMyAttendanceLogs(instId, user?.email))
    window.addEventListener('my-attendance-updated', sync)
    return () => window.removeEventListener('my-attendance-updated', sync)
  }, [instId, user?.email])

  const todayEntry = useMemo(() => logs.find((l) => l.date === todayIso) || null, [logs, todayIso])
  const hasTimedIn = Boolean(todayEntry?.timeIn)
  const hasTimedOut = Boolean(todayEntry?.timeOut)

  const handleTimeIn = () => {
    const res = recordMyTimeIn(instId, user?.email)
    setLogs(res.logs)
    if (res.alreadyDone) {
      toast?.info?.(`Already checked in today at ${res.entry.timeIn}.`)
    } else {
      toast?.success?.(`Checked in at ${res.entry.timeIn}.`)
    }
  }

  const handleTimeOut = () => {
    const res = recordMyTimeOut(instId, user?.email)
    setLogs(res.logs)
    if (res.notCheckedIn) {
      toast?.warning?.('Check in first using My Time In before recording Time Out.')
      return
    }
    if (res.alreadyDone) {
      toast?.info?.(`Already checked out today at ${res.entry.timeOut}.`)
      return
    }
    toast?.success?.(`Checked out at ${res.entry.timeOut}.`)
  }

  const monthStats = useMemo(() => {
    const thisMonth = logs.filter((l) => String(l.date || '').startsWith(currentMonthPrefix) && l.timeIn)
    const fullDays = thisMonth.filter((l) => Boolean(l.timeIn && l.timeOut))
    return {
      presentCount: thisMonth.length,
      fullDaysCount: fullDays.length,
      dayOfMonth: now.getDate(),
      monthYearLabel: now.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
    }
  }, [logs, currentMonthPrefix, now])

  const recentHistory = useMemo(() => {
    const cutoff = new Date()
    cutoff.setDate(cutoff.getDate() - 30)
    const cutoffIso = cutoff.toISOString().split('T')[0]
    return [...logs]
      .filter((l) => !l.date || l.date >= cutoffIso)
      .sort((a, b) => String(b.date || '').localeCompare(String(a.date || '')))
  }, [logs])

  const formattedTodayHeader = now.toLocaleDateString('en-US', {
    weekday: 'long',
    day: '2-digit',
    month: 'short',
    year: 'numeric'
  })

  const statusText = hasTimedOut ? 'Complete' : hasTimedIn ? 'Checked In' : 'Not Checked In'
  const statusColor = hasTimedOut ? 'text-emerald-600' : hasTimedIn ? 'text-amber-600' : 'text-slate-500'

  return (
    <div className="space-y-4 pb-10 animate-fade-in">
      {/* Top Bar matching Picks 2 & 4 */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2 text-slate-900">
            <FileText className="w-5 h-5 text-slate-600" />
            <h1 className="text-lg font-bold tracking-tight">My Attendance</h1>
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

        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => onRouteChange?.('inst-admissions-enroll')}
            className="px-3.5 py-2 rounded-xl bg-teal-600 hover:bg-teal-700 text-white text-xs font-semibold flex items-center gap-1.5 shadow-xs cursor-pointer transition-colors"
          >
            <UserPlus className="w-3.5 h-3.5" />
            <span>New Enrollment</span>
          </button>
          <button
            type="button"
            onClick={() => onOpenQuickPayment?.(null)}
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
            className="px-3.5 py-2 rounded-xl bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 text-xs font-semibold flex items-center gap-1.5 shadow-2xs cursor-pointer transition-colors"
          >
            <ArrowDownCircle className="w-3.5 h-3.5 text-slate-500" />
            <span>Manage Expense</span>
          </button>
          <button
            type="button"
            onClick={() => (onOpenSendSms ? onOpenSendSms() : onRouteChange?.('inst-communication-sms'))}
            className="px-3.5 py-2 rounded-xl bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 text-xs font-semibold flex items-center gap-1.5 shadow-2xs cursor-pointer transition-colors"
          >
            <MessageSquare className="w-3.5 h-3.5 text-slate-500" />
            <span>Send SMS</span>
          </button>
        </div>
      </div>

      {/* Row 1: Today's Attendance (Left) & Quick Actions (Right) matching Picks 2 & 4 */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* Today's attendance Card */}
        <div className="lg:col-span-7 bg-gradient-to-br from-indigo-50/60 via-white to-white rounded-2xl border border-slate-200 p-5 shadow-2xs space-y-4">
          <div className="flex flex-wrap items-start justify-between gap-2">
            <div>
              <h2 className="text-sm font-extrabold text-slate-900">Today&apos;s attendance</h2>
              <p className="text-xs text-slate-600 mt-0.5">{displayName}</p>
              <span className="inline-flex items-center gap-1 mt-1.5 px-2.5 py-0.5 rounded-full bg-indigo-100/80 text-indigo-700 text-[10px] font-bold">
                <User className="w-2.5 h-2.5" />
                <span>{roleLabel === 'INSTITUTE ADMIN' ? 'ADMIN' : roleLabel}</span>
              </span>
            </div>
            <div className="flex items-center gap-1.5 text-xs font-medium text-slate-500">
              <Calendar className="w-3.5 h-3.5" />
              <span>{formattedTodayHeader}</span>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="bg-white rounded-xl border border-slate-200 p-3.5 text-center">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">My Time In</p>
              <p className={`text-sm font-extrabold mt-1 ${todayEntry?.timeIn ? 'text-emerald-600' : 'text-slate-500'}`}>
                {todayEntry?.timeIn || 'Not recorded'}
              </p>
            </div>
            <div className="bg-white rounded-xl border border-slate-200 p-3.5 text-center">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">My Time Out</p>
              <p className={`text-sm font-extrabold mt-1 ${todayEntry?.timeOut ? 'text-rose-600' : 'text-slate-500'}`}>
                {todayEntry?.timeOut || 'Not recorded'}
              </p>
            </div>
            <div className="bg-white rounded-xl border border-slate-200 p-3.5 text-center">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Status</p>
              <p className={`text-sm font-extrabold mt-1 ${statusColor}`}>
                {todayEntry?.timeIn ? statusText : 'Not started'}
              </p>
            </div>
          </div>

          {hasTimedOut ? (
            <div className="rounded-xl bg-emerald-50 border border-emerald-200 px-3.5 py-2.5 flex items-center gap-2 text-xs text-emerald-800">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>
                Your attendance for today is complete. Administrators can view this under{' '}
                <button
                  type="button"
                  onClick={() => onRouteChange?.('inst-attendance-staff-report')}
                  className="font-bold hover:underline cursor-pointer"
                >
                  Attendance → Staff Attendance → Reports
                </button>
                .
              </span>
            </div>
          ) : hasTimedIn ? (
            <div className="rounded-xl bg-amber-50 border border-amber-200 px-3.5 py-2.5 flex items-center gap-2 text-xs text-amber-800">
              <Clock className="w-4 h-4 text-amber-600 shrink-0" />
              <span>
                Checked in at <strong>{todayEntry.timeIn}</strong>. Click <strong>My Time Out</strong> under Quick Actions when leaving.
              </span>
            </div>
          ) : (
            <div className="rounded-xl bg-indigo-50/70 border border-indigo-200 px-3.5 py-2.5 flex items-center gap-2 text-xs text-indigo-700">
              <Clock className="w-4 h-4 text-indigo-500 shrink-0" />
              <span>
                Mark <strong>My Time In</strong> when you arrive and <strong>My Time Out</strong> when you leave. Times are saved for admin reports.
              </span>
            </div>
          )}
        </div>

        {/* Quick Actions Card */}
        <div className="lg:col-span-5 bg-white rounded-2xl border border-slate-200 p-5 shadow-2xs flex flex-col justify-between space-y-4">
          <div className="space-y-2.5">
            <h3 className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Quick Actions</h3>
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
              <button
                type="button"
                disabled={hasTimedIn}
                onClick={handleTimeIn}
                className="flex-1 px-4 py-2.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-100 disabled:text-slate-400 text-white text-xs font-bold inline-flex items-center justify-center gap-1.5 cursor-pointer disabled:cursor-not-allowed transition-colors"
              >
                <LogIn className="w-3.5 h-3.5" />
                <span>My Time In</span>
              </button>
              {hasTimedIn && (
                <button
                  type="button"
                  disabled={hasTimedOut}
                  onClick={handleTimeOut}
                  className="flex-1 px-4 py-2.5 rounded-lg bg-orange-500 hover:bg-orange-600 disabled:bg-slate-100 disabled:text-slate-400 text-white text-xs font-bold inline-flex items-center justify-center gap-1.5 cursor-pointer disabled:cursor-not-allowed transition-colors"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>My Time Out</span>
                </button>
              )}
            </div>
            <p className="text-[11px] text-slate-400 leading-relaxed">
              Disabled buttons mean that step is already done for today. You can only check in once and check out once per day.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3 pt-1">
            <div className="rounded-xl border border-slate-200 p-3.5 bg-slate-50/40">
              <p className="text-[11px] text-slate-500 font-medium">Present this month</p>
              <p className="mt-1">
                <span className="text-lg font-extrabold text-slate-900">{monthStats.presentCount}</span>{' '}
                <span className="text-xs text-slate-400 font-medium">/ {monthStats.dayOfMonth} days</span>
              </p>
            </div>
            <div className="rounded-xl border border-slate-200 p-3.5 bg-slate-50/40">
              <p className="text-[11px] text-slate-500 font-medium">Full days (in &amp; out)</p>
              <p className="mt-1">
                <span className="text-lg font-extrabold text-slate-900">{monthStats.fullDaysCount}</span>{' '}
                <span className="text-xs text-slate-400 font-medium">{monthStats.monthYearLabel}</span>
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Row 2: Recent History Table */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-2xs space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs font-bold text-slate-800">
            <History className="w-4 h-4 text-slate-500" />
            <span>Recent history</span>
          </div>
          <span className="text-[11px] text-slate-400 font-medium">Last 30 days</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="border-y border-slate-200 bg-slate-50/70 text-[10px] font-bold text-slate-500 uppercase tracking-wider">
              <tr>
                <th className="py-2.5 px-3">Date</th>
                <th className="py-2.5 px-3">My Time In</th>
                <th className="py-2.5 px-3">My Time Out</th>
                <th className="py-2.5 px-3 text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {recentHistory.length === 0 ? (
                <tr>
                  <td colSpan={4} className="py-8 text-center text-slate-400">
                    No attendance records in the last 30 days. Click <strong>My Time In</strong> to log today.
                  </td>
                </tr>
              ) : (
                recentHistory.map((row) => {
                  const complete = Boolean(row.timeIn && row.timeOut)
                  return (
                    <tr key={row.id || row.date} className="hover:bg-slate-50/70">
                      <td className="py-3 px-3 font-bold text-slate-800">{formatHistoryDate(row.date)}</td>
                      <td className="py-3 px-3 font-bold text-slate-900">{row.timeIn || '—'}</td>
                      <td className="py-3 px-3 font-bold text-slate-900">{row.timeOut || '—'}</td>
                      <td className="py-3 px-3 text-right">
                        {complete ? (
                          <span className="px-2.5 py-0.5 rounded bg-emerald-100 text-emerald-700 text-[11px] font-bold">
                            Present
                          </span>
                        ) : (
                          <span className="px-2.5 py-0.5 rounded bg-amber-100 text-amber-700 text-[11px] font-bold">
                            In only
                          </span>
                        )}
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
  )
}

export default MyAttendanceView
