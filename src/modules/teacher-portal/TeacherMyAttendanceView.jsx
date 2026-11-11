import React, { useState, useEffect, useMemo } from 'react'
import {
  Clock,
  Calendar,
  AlertCircle,
  CheckCircle2,
  LogIn,
  LogOut,
  ArrowRight,
  BookMarked,
  Megaphone,
  CheckSquare,
  FileEdit,
  Wallet,
  User,
  ShieldCheck
} from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import { useToast } from '../../context/ToastContext'
import {
  readMyAttendanceLogs,
  recordMyTimeIn,
  recordMyTimeOut
} from '../institute-admin/attendance/MyAttendanceView'

export default function TeacherMyAttendanceView({
  onBack,
  onOpenModal,
  teacherName = 'Teacher'
}) {
  const { user } = useAuth()
  const { toast } = useToast()

  const instId = user?.instituteId || 'inst-demo'
  const userEmail = user?.email || 'teacher@schoolms.com'

  // Attendance Logs State
  const [logs, setLogs] = useState(() => readMyAttendanceLogs(instId, userEmail))

  // Refresh logs on sync
  const refreshLogs = () => {
    setLogs(readMyAttendanceLogs(instId, userEmail))
  }

  useEffect(() => {
    window.addEventListener('my-attendance-updated', refreshLogs)
    window.addEventListener('storage', refreshLogs)
    return () => {
      window.removeEventListener('my-attendance-updated', refreshLogs)
      window.removeEventListener('storage', refreshLogs)
    }
  }, [instId, userEmail])

  // Current Date String: e.g. "Wednesday, 11 Nov 2026"
  const formattedToday = useMemo(() => {
    const now = new Date()
    return now.toLocaleDateString('en-GB', {
      weekday: 'long',
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    })
  }, [])

  const currentMonthYear = useMemo(() => {
    const now = new Date()
    return now.toLocaleDateString('en-GB', {
      month: 'long',
      year: 'numeric'
    })
  }, [])

  // Today's entry
  const todayIso = new Date().toISOString().split('T')[0]
  const todayEntry = logs.find((l) => l.date === todayIso)

  // Punch Status
  const punchStatus = useMemo(() => {
    if (!todayEntry || !todayEntry.timeIn) return 'NOT_CHECKED_IN'
    if (todayEntry.timeIn && !todayEntry.timeOut) return 'CHECKED_IN'
    return 'CHECKED_OUT'
  }, [todayEntry])

  // Monthly Statistics
  const currentMonthPrefix = new Date().toISOString().slice(0, 7)
  const currentMonthLogs = useMemo(() => {
    return logs.filter((l) => l.date?.startsWith(currentMonthPrefix))
  }, [logs, currentMonthPrefix])

  const presentDaysCount = currentMonthLogs.filter((l) => l.timeIn).length
  const fullDaysCount = currentMonthLogs.filter((l) => l.timeIn && l.timeOut).length
  const todayDayNumber = new Date().getDate() // e.g., 11

  // Handle Punch In
  const handlePunchIn = () => {
    const result = recordMyTimeIn(instId, userEmail)
    if (result.alreadyDone) {
      toast?.info?.('You have already checked in for today!')
    } else {
      toast?.success?.(`Checked in at ${result.entry.timeIn}`)
      refreshLogs()
    }
  }

  // Handle Punch Out
  const handlePunchOut = () => {
    const result = recordMyTimeOut(instId, userEmail)
    if (result.notCheckedIn) {
      toast?.error?.('Please check in first before checking out.')
    } else if (result.alreadyDone) {
      toast?.info?.('You have already checked out for today.')
    } else {
      toast?.success?.(`Checked out at ${result.entry.timeOut}`)
      refreshLogs()
    }
  }

  return (
    <div className="flex-1 flex flex-col min-h-0 bg-slate-50/70 dark:bg-slate-950">
      {/* ========================================================= */}
      {/* 1. SUB-HEADER BAR */}
      {/* ========================================================= */}
      <div className="bg-white dark:bg-slate-900 border-b border-slate-200/90 dark:border-slate-800 px-4 sm:px-6 py-2.5 flex flex-wrap items-center justify-between gap-3 shrink-0 shadow-2xs">
        <div className="flex flex-col">
          <div className="flex items-center gap-2 font-black text-sm text-slate-900 dark:text-white">
            <Clock className="w-4 h-4 text-purple-600 dark:text-purple-400" />
            <span>My Attendance</span>
          </div>
          <button
            onClick={onBack}
            className="text-xs font-semibold text-slate-500 hover:text-purple-600 dark:text-slate-400 dark:hover:text-purple-400 flex items-center gap-1 transition-colors mt-0.5 cursor-pointer text-left w-fit"
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
        {/* --------------------------------------------------------- */}
        {/* ROW 1: TOP 2-COLUMN SPLIT (TODAY'S ATTENDANCE + QUICK ACTIONS) */}
        {/* --------------------------------------------------------- */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-stretch">
          {/* LEFT COLUMN (7 cols): Today's Attendance Card */}
          <div className="lg:col-span-7 bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-2xl p-5 sm:p-6 shadow-xs flex flex-col justify-between space-y-4">
            <div>
              {/* Header with Name & Date */}
              <div className="flex flex-wrap items-start justify-between gap-3 pb-3 border-b border-slate-100 dark:border-slate-800">
                <div>
                  <h3 className="text-lg font-black text-slate-900 dark:text-white tracking-tight">
                    Today's attendance
                  </h3>
                  <p className="text-xs font-bold text-slate-700 dark:text-slate-300 mt-0.5">
                    {teacherName}
                  </p>
                  <span className="inline-flex items-center gap-1 text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-md bg-purple-100 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300 mt-1">
                    <User className="w-3 h-3" />
                    <span>TEACHER</span>
                  </span>
                </div>

                <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400 font-semibold bg-slate-50 dark:bg-slate-800 px-3 py-1.5 rounded-xl border border-slate-200/60 dark:border-slate-700">
                  <Calendar className="w-3.5 h-3.5 text-purple-600 dark:text-purple-400" />
                  <span>{formattedToday}</span>
                </div>
              </div>

              {/* 3 Metric Mini-Boxes */}
              <div className="grid grid-cols-3 gap-3 pt-4">
                {/* Box 1: MY TIME IN */}
                <div className="p-3 sm:p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 text-center">
                  <span className="text-[10px] font-extrabold uppercase text-slate-400 tracking-wider block">
                    MY TIME IN
                  </span>
                  <span className={`text-sm sm:text-base font-black block mt-1 ${
                    todayEntry?.timeIn ? 'text-emerald-600 dark:text-emerald-400 font-mono' : 'text-slate-400'
                  }`}>
                    {todayEntry?.timeIn || '--:--'}
                  </span>
                </div>

                {/* Box 2: MY TIME OUT */}
                <div className="p-3 sm:p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 text-center">
                  <span className="text-[10px] font-extrabold uppercase text-slate-400 tracking-wider block">
                    MY TIME OUT
                  </span>
                  <span className={`text-sm sm:text-base font-black block mt-1 ${
                    todayEntry?.timeOut
                      ? 'text-emerald-600 dark:text-emerald-400 font-mono'
                      : punchStatus === 'CHECKED_IN'
                      ? 'text-orange-600 dark:text-orange-400'
                      : 'text-slate-400'
                  }`}>
                    {todayEntry?.timeOut || (punchStatus === 'CHECKED_IN' ? 'Pending' : '--:--')}
                  </span>
                </div>

                {/* Box 3: STATUS */}
                <div className="p-3 sm:p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 text-center">
                  <span className="text-[10px] font-extrabold uppercase text-slate-400 tracking-wider block">
                    STATUS
                  </span>
                  <span className={`text-sm sm:text-base font-black block mt-1 ${
                    punchStatus === 'CHECKED_IN'
                      ? 'text-orange-600 dark:text-orange-400'
                      : punchStatus === 'CHECKED_OUT'
                      ? 'text-emerald-600 dark:text-emerald-400'
                      : 'text-slate-400'
                  }`}>
                    {punchStatus === 'CHECKED_IN'
                      ? 'On campus'
                      : punchStatus === 'CHECKED_OUT'
                      ? 'Completed'
                      : 'Not checked in'}
                  </span>
                </div>
              </div>
            </div>

            {/* Bottom Alert Banner */}
            <div>
              {punchStatus === 'CHECKED_IN' && (
                <div className="p-3.5 rounded-xl bg-orange-50 dark:bg-orange-950/40 border border-orange-200 dark:border-orange-800/60 text-orange-900 dark:text-orange-200 text-xs flex items-center gap-2.5">
                  <AlertCircle className="w-4 h-4 text-orange-600 dark:text-orange-400 shrink-0" />
                  <span>
                    You checked in at <strong className="font-mono">{todayEntry?.timeIn}</strong>. Remember to tap <strong>My Time Out</strong> when you leave.
                  </span>
                </div>
              )}

              {punchStatus === 'CHECKED_OUT' && (
                <div className="p-3.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/60 text-emerald-900 dark:text-emerald-200 text-xs flex items-center gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                  <span>
                    Shift completed! Checked in at <strong className="font-mono">{todayEntry?.timeIn}</strong>, checked out at <strong className="font-mono">{todayEntry?.timeOut}</strong>.
                  </span>
                </div>
              )}

              {punchStatus === 'NOT_CHECKED_IN' && (
                <div className="p-3.5 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 text-xs flex items-center gap-2.5">
                  <Clock className="w-4 h-4 text-slate-500 shrink-0" />
                  <span>
                    You have not checked in today. Tap <strong>My Time In</strong> on the right to register your arrival.
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* RIGHT COLUMN (5 cols): Quick Actions Card */}
          <div className="lg:col-span-5 bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-2xl p-5 sm:p-6 shadow-xs flex flex-col justify-between space-y-4">
            <div>
              <span className="text-[11px] font-extrabold uppercase text-slate-400 dark:text-slate-500 tracking-wider block mb-3">
                QUICK ACTIONS
              </span>

              {/* Large Punch Button */}
              {punchStatus === 'NOT_CHECKED_IN' && (
                <button
                  onClick={handlePunchIn}
                  className="w-full py-3.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-sm flex items-center justify-center gap-2 shadow-sm transition-all cursor-pointer"
                >
                  <LogIn className="w-4 h-4" />
                  <span>My Time In</span>
                </button>
              )}

              {punchStatus === 'CHECKED_IN' && (
                <button
                  onClick={handlePunchOut}
                  className="w-full py-3.5 px-4 rounded-xl bg-orange-600 hover:bg-orange-700 text-white font-extrabold text-sm flex items-center justify-center gap-2 shadow-sm transition-all cursor-pointer"
                >
                  <LogOut className="w-4 h-4" />
                  <span>My Time Out</span>
                </button>
              )}

              {punchStatus === 'CHECKED_OUT' && (
                <button
                  disabled
                  className="w-full py-3.5 px-4 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-400 font-extrabold text-sm flex items-center justify-center gap-2 cursor-not-allowed opacity-80"
                >
                  <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                  <span>Shift Completed for Today</span>
                </button>
              )}

              <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-2.5 leading-relaxed">
                Disabled buttons mean that step is already done for today. You can only check in once and check out once per day.
              </p>
            </div>

            {/* Bottom Mini-Stats: Present this month & Full days */}
            <div className="grid grid-cols-2 gap-3 pt-3 border-t border-slate-100 dark:border-slate-800">
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800">
                <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 block">
                  Present this month
                </span>
                <span className="text-base font-black text-slate-900 dark:text-white block mt-0.5">
                  {presentDaysCount} <span className="text-xs font-semibold text-slate-400">/ {todayDayNumber} days</span>
                </span>
              </div>

              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800">
                <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 block">
                  Full days (in & out)
                </span>
                <span className="text-base font-black text-slate-900 dark:text-white block mt-0.5">
                  {fullDaysCount} <span className="text-xs font-semibold text-slate-400">{currentMonthYear}</span>
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* --------------------------------------------------------- */}
        {/* ROW 2: RECENT HISTORY TABLE */}
        {/* --------------------------------------------------------- */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-2xl shadow-xs overflow-hidden">
          <div className="px-5 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-purple-600 dark:text-purple-400" />
              <h3 className="font-extrabold text-sm sm:text-base text-slate-900 dark:text-white">
                Recent history
              </h3>
            </div>
            <span className="text-xs text-slate-400 dark:text-slate-500 font-medium">
              Last 30 days
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-50/80 dark:bg-slate-800/60 border-b border-slate-200/80 dark:border-slate-800 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                  <th className="py-3 px-5">DATE</th>
                  <th className="py-3 px-5">MY TIME IN</th>
                  <th className="py-3 px-5">MY TIME OUT</th>
                  <th className="py-3 px-5 text-right">STATUS</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {logs.length === 0 ? (
                  <tr>
                    <td colSpan="4" className="py-12 text-center text-slate-400">
                      <div className="flex flex-col items-center justify-center max-w-sm mx-auto space-y-2">
                        <Clock className="w-8 h-8 text-slate-300 dark:text-slate-600" />
                        <p className="text-xs font-semibold text-slate-600 dark:text-slate-400">
                          No attendance history for the last 30 days.
                        </p>
                        <p className="text-[11px] text-slate-400">
                          Your daily time in and time out punches will automatically be recorded here.
                        </p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  logs.slice(0, 30).map((log) => {
                    const isComplete = Boolean(log.timeIn && log.timeOut)
                    const logDate = new Date(log.date)
                    const formattedLogDate = !isNaN(logDate.getTime())
                      ? logDate.toLocaleDateString('en-GB', {
                          weekday: 'short',
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric'
                        })
                      : log.date

                    return (
                      <tr key={log.id || log.date} className="hover:bg-slate-50/70 dark:hover:bg-slate-800/40 transition-colors">
                        <td className="py-3.5 px-5 font-bold text-slate-900 dark:text-white">
                          {formattedLogDate}
                        </td>
                        <td className="py-3.5 px-5 font-mono text-slate-700 dark:text-slate-300">
                          {log.timeIn || '—'}
                        </td>
                        <td className="py-3.5 px-5 font-mono text-slate-700 dark:text-slate-300">
                          {log.timeOut || '—'}
                        </td>
                        <td className="py-3.5 px-5 text-right">
                          {isComplete ? (
                            <span className="inline-block bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 font-bold text-[10px] px-2.5 py-0.5 rounded-md">
                              Complete
                            </span>
                          ) : (
                            <span className="inline-block bg-orange-100 dark:bg-orange-950/60 text-orange-700 dark:text-orange-300 font-bold text-[10px] px-2.5 py-0.5 rounded-md">
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
    </div>
  )
}
