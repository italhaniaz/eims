import React, { useState, useEffect } from 'react'
import {
  ArrowLeft,
  FileText,
  UserPlus,
  CreditCard,
  Receipt,
  ArrowDownCircle,
  MessageSquare,
  Settings,
  Check
} from 'lucide-react'
import { useAppData } from '../../../context/AppDataContext'
import { useToast } from '../../../context/ToastContext'
import { getAttendanceSettings, saveAttendanceSettings } from './attendanceService'

const WEEK_DAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']

export const AttendanceSettingsView = ({
  currentInstitute,
  onRouteChange,
  onOpenQuickPayment
}) => {
  const { logAuditEvent } = useAppData()
  const { toast } = useToast()

  const [form, setForm] = useState(() => {
    const saved = getAttendanceSettings(currentInstitute?.id) || {}
    return {
      weeklyOffDays: Array.isArray(saved.weeklyOffDays) ? saved.weeklyOffDays : ['Sunday', 'Saturday'],
      staffTimeIn: saved.staffTimeIn || '',
      staffTimeOut: saved.staffTimeOut || '',
      staffGraceMinutes: Number(saved.staffGraceMinutes ?? 0),
      lateCounting: saved.lateCounting || 'General (from Time In)',
      studentAttendanceType: saved.studentAttendanceType || 'Both General & Subject-wise',
      previousDaysAllowed: Number(saved.previousDaysAllowed ?? 0),
      graceLeaves: Number(saved.graceLeaves ?? 0),
      finePerAbsentDay: Number(saved.finePerAbsentDay ?? 0),
      applyFineTo: saved.applyFineTo || 'Both General & Subject-wise',
      minAttendancePct: Number(saved.minAttendancePct ?? 75)
    }
  })

  useEffect(() => {
    const saved = getAttendanceSettings(currentInstitute?.id) || {}
    setForm({
      weeklyOffDays: Array.isArray(saved.weeklyOffDays) ? saved.weeklyOffDays : ['Sunday', 'Saturday'],
      staffTimeIn: saved.staffTimeIn || '',
      staffTimeOut: saved.staffTimeOut || '',
      staffGraceMinutes: Number(saved.staffGraceMinutes ?? 0),
      lateCounting: saved.lateCounting || 'General (from Time In)',
      studentAttendanceType: saved.studentAttendanceType || 'Both General & Subject-wise',
      previousDaysAllowed: Number(saved.previousDaysAllowed ?? 0),
      graceLeaves: Number(saved.graceLeaves ?? 0),
      finePerAbsentDay: Number(saved.finePerAbsentDay ?? 0),
      applyFineTo: saved.applyFineTo || 'Both General & Subject-wise',
      minAttendancePct: Number(saved.minAttendancePct ?? 75)
    })
  }, [currentInstitute?.id])

  const toggleDay = (day) => {
    setForm((prev) => {
      const exists = prev.weeklyOffDays.includes(day)
      return {
        ...prev,
        weeklyOffDays: exists
          ? prev.weeklyOffDays.filter((d) => d !== day)
          : [...prev.weeklyOffDays, day]
      }
    })
  }

  const handleSave = (e) => {
    e.preventDefault()
    saveAttendanceSettings({
      ...form,
      workingDays: WEEK_DAYS.filter((d) => !form.weeklyOffDays.includes(d))
    })
    logAuditEvent?.('ATTENDANCE_SETTINGS_SAVED', 'Updated institute attendance settings', {
      weeklyOffDays: form.weeklyOffDays,
      graceLeaves: form.graceLeaves,
      finePerAbsentDay: form.finePerAbsentDay
    })
    toast.success('Attendance settings saved successfully')
  }

  const exampleBillable = Math.max(0, 8 - Number(form.graceLeaves || 0))
  const exampleFine = exampleBillable * Number(form.finePerAbsentDay || 0)

  return (
    <div className="p-4 sm:p-6 space-y-5 max-w-[1440px] mx-auto">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <FileText className="w-5 h-5 text-slate-600" />
            <h1 className="text-xl font-bold text-slate-900 tracking-tight">Attendance Settings</h1>
          </div>
          <button
            type="button"
            onClick={() => onRouteChange?.('inst-attendance')}
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

      {/* Main Settings Form Card */}
      <form
        onSubmit={handleSave}
        className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden"
      >
        <div className="px-5 py-3.5 border-b border-slate-200 flex items-center gap-2 text-sm font-bold text-slate-800">
          <Settings className="w-4 h-4 text-slate-500" />
          Attendance Settings
        </div>

        <div className="p-5 sm:p-6 space-y-6">
          {/* 1. Weekly Off Days */}
          <div className="border-l-4 border-l-slate-700 pl-4 space-y-3">
            <div>
              <h2 className="text-xs font-bold text-slate-900">Weekly Off Days</h2>
              <p className="text-[11px] text-slate-400 mt-0.5">
                Days skipped in attendance % and reports. Use the Academic Calendar for one-off holidays.
              </p>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-y-2.5 gap-x-4 max-w-4xl">
              {WEEK_DAYS.map((day) => {
                const checked = form.weeklyOffDays.includes(day)
                return (
                  <label key={day} className="inline-flex items-center gap-2 text-xs text-slate-700 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={checked}
                      onChange={() => toggleDay(day)}
                      className="w-4 h-4 rounded border-slate-300 text-slate-800 focus:ring-slate-600"
                    />
                    <span className={checked ? 'font-semibold text-slate-900' : ''}>{day}</span>
                  </label>
                )
              })}
            </div>

            <p className="text-[11px] text-slate-400">
              Current:{' '}
              <span className="font-medium text-slate-600">
                {form.weeklyOffDays.length > 0 ? form.weeklyOffDays.join(', ') : 'None'}
              </span>
            </p>
          </div>

          <div className="border-t border-slate-100" />

          {/* 2. Staff Duty Timings */}
          <div className="border-l-4 border-l-amber-500 pl-4 space-y-3">
            <div>
              <h2 className="text-xs font-bold text-slate-900">Staff Duty Timings</h2>
              <p className="text-[11px] text-slate-400 mt-0.5">
                Used to work out how many minutes a staff member is <strong>late</strong> (Time In) or left early
                (Time Out) in staff attendance and its reports. Leave Time In empty to switch late tracking off.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div>
                <label className="block text-[11px] font-semibold text-slate-700 mb-1">Time In</label>
                <input
                  type="time"
                  value={form.staffTimeIn}
                  onChange={(e) => setForm((p) => ({ ...p, staffTimeIn: e.target.value }))}
                  className="w-full px-3 py-2 text-xs rounded-md border border-slate-200 focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>
              <div>
                <label className="block text-[11px] font-semibold text-slate-700 mb-1">Time Out</label>
                <input
                  type="time"
                  value={form.staffTimeOut}
                  onChange={(e) => setForm((p) => ({ ...p, staffTimeOut: e.target.value }))}
                  className="w-full px-3 py-2 text-xs rounded-md border border-slate-200 focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>
              <div>
                <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                  Grace period (minutes)
                </label>
                <input
                  type="number"
                  min="0"
                  value={form.staffGraceMinutes}
                  onChange={(e) => setForm((p) => ({ ...p, staffGraceMinutes: Number(e.target.value || 0) }))}
                  className="w-full px-3 py-2 text-xs rounded-md border border-slate-200 focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>
              <div>
                <label className="block text-[11px] font-semibold text-slate-700 mb-1">Late counting</label>
                <select
                  value={form.lateCounting}
                  onChange={(e) => setForm((p) => ({ ...p, lateCounting: e.target.value }))}
                  className="w-full px-3 py-2 text-xs rounded-md border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-amber-500"
                >
                  <option value="General (from Time In)">General (from Time In)</option>
                  <option value="Strict (no grace)">Strict (no grace)</option>
                  <option value="Half-day after 60 mins">Half-day after 60 mins</option>
                </select>
              </div>
            </div>
          </div>

          <div className="border-t border-slate-100" />

          {/* 3. Student Attendance Type */}
          <div className="border-l-4 border-l-blue-600 pl-4 space-y-3">
            <div>
              <h2 className="text-xs font-bold text-slate-900">Student Attendance Type</h2>
              <p className="text-[11px] text-slate-400 mt-0.5">
                Which type admins and teachers can choose on the Mark Attendance page. Attendance already saved is not changed.
              </p>
            </div>

            <div className="max-w-xs">
              <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                Show on Mark Attendance
              </label>
              <select
                value={form.studentAttendanceType}
                onChange={(e) => setForm((p) => ({ ...p, studentAttendanceType: e.target.value }))}
                className="w-full px-3 py-2 text-xs rounded-md border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="Both General & Subject-wise">Both General &amp; Subject-wise</option>
                <option value="General only">General only</option>
                <option value="Subject-wise only">Subject-wise only</option>
              </select>
              <p className="text-[10px] text-slate-400 mt-1.5">
                With Subject-wise only, the &quot;All classes&quot; view is hidden because subject attendance needs one class.
              </p>
            </div>
          </div>

          <div className="border-t border-slate-100" />

          {/* 4. Teacher Attendance Marking */}
          <div className="border-l-4 border-l-emerald-600 pl-4 space-y-3">
            <div>
              <h2 className="text-xs font-bold text-slate-900">Teacher Attendance Marking</h2>
              <p className="text-[11px] text-slate-400 mt-0.5">
                How many past days teachers may mark or edit. Admins are not limited.
              </p>
            </div>

            <div className="max-w-[140px]">
              <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                Previous days allowed
              </label>
              <input
                type="number"
                min="0"
                value={form.previousDaysAllowed}
                onChange={(e) => setForm((p) => ({ ...p, previousDaysAllowed: Number(e.target.value || 0) }))}
                className="w-full px-3 py-2 text-xs rounded-md border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
              <p className="text-[10px] text-slate-400 mt-1.5 whitespace-nowrap">
                0 = today only. Current:{' '}
                <strong className="text-slate-700">
                  {Number(form.previousDaysAllowed) === 0
                    ? 'Today only'
                    : `${form.previousDaysAllowed} day(s) back`}
                </strong>
              </p>
            </div>
          </div>

          <div className="border-t border-slate-100" />

          {/* 5. Attendance Fine Generation */}
          <div className="border-l-4 border-l-rose-600 pl-4 space-y-4">
            <div>
              <h2 className="text-xs font-bold text-slate-900">Attendance Fine Generation</h2>
              <p className="text-[11px] text-slate-400 mt-0.5">
                Controls the defaulters list and fine amounts. Set fine per day to 0 to disable fines.
              </p>
            </div>

            {/* Formula Info Box */}
            <div className="rounded-lg border border-slate-200 bg-slate-50/70 p-4 space-y-2 text-xs">
              <div className="font-bold text-slate-800">How the fine is calculated</div>
              <ol className="list-decimal list-inside space-y-1.5 text-slate-600 text-[11px]">
                <li>
                  <code className="px-1.5 py-0.5 rounded bg-rose-50 text-rose-600 font-mono text-[11px]">
                    Billable days = Absent days - Grace leaves
                  </code>
                </li>
                <li>
                  <code className="px-1.5 py-0.5 rounded bg-rose-50 text-rose-600 font-mono text-[11px]">
                    Fine = Billable days × Fine per day
                  </code>
                </li>
                <li>
                  Fine is applied only if attendance % is below <strong>{form.minAttendancePct}%</strong>.
                </li>
              </ol>
              <div className="pt-2 border-t border-slate-200 text-[11px] text-slate-500">
                Example (8 absences with your current settings):{' '}
                <strong className="text-slate-700">
                  Billable = 8 - {form.graceLeaves} = {exampleBillable} → Fine = {exampleBillable} × PKR{' '}
                  {form.finePerAbsentDay} = PKR {exampleFine.toLocaleString()}
                </strong>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-4xl">
              <div>
                <label className="block text-[11px] font-semibold text-slate-700 mb-0.5">Grace leaves</label>
                <p className="text-[10px] text-slate-400 mb-1.5">
                  Absent days forgiven before defaulter listing and fine calculation.
                </p>
                <input
                  type="number"
                  min="0"
                  value={form.graceLeaves}
                  onChange={(e) => setForm((p) => ({ ...p, graceLeaves: Number(e.target.value || 0) }))}
                  className="w-40 px-3 py-2 text-xs rounded-md border border-slate-200 focus:outline-none focus:ring-2 focus:ring-rose-500"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-700 mb-0.5">
                  Fine per absent day (PKR)
                </label>
                <p className="text-[10px] text-slate-400 mb-1.5">
                  Charged per day beyond grace. 0 hides Generate Fines.
                </p>
                <input
                  type="number"
                  min="0"
                  value={form.finePerAbsentDay}
                  onChange={(e) => setForm((p) => ({ ...p, finePerAbsentDay: Number(e.target.value || 0) }))}
                  className="w-40 px-3 py-2 text-xs rounded-md border border-slate-200 focus:outline-none focus:ring-2 focus:ring-rose-500"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-700 mb-0.5">Apply fine to</label>
                <p className="text-[10px] text-slate-400 mb-1.5">
                  Used when counting is per subject. Ignored for per-day mode.
                </p>
                <select
                  value={form.applyFineTo}
                  onChange={(e) => setForm((p) => ({ ...p, applyFineTo: e.target.value }))}
                  className="w-64 px-3 py-2 text-xs rounded-md border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-rose-500"
                >
                  <option value="Both General & Subject-wise">Both General &amp; Subject-wise</option>
                  <option value="General only">General only</option>
                  <option value="Subject-wise only">Subject-wise only</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-700 mb-0.5">
                  Min. attendance % to trigger fine
                </label>
                <p className="text-[10px] text-slate-400 mb-1.5">
                  Fine only if effective attendance is below this %.
                </p>
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={form.minAttendancePct}
                  onChange={(e) => setForm((p) => ({ ...p, minAttendancePct: Number(e.target.value || 0) }))}
                  className="w-40 px-3 py-2 text-xs rounded-md border border-slate-200 focus:outline-none focus:ring-2 focus:ring-rose-500"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="px-5 py-3.5 border-t border-slate-200 bg-slate-50/40 flex items-center justify-between">
          <button
            type="button"
            onClick={() => onRouteChange?.('inst-attendance-low')}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-md border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            Back to Defaulters List
          </button>

          <button
            type="submit"
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-md bg-blue-500 hover:bg-blue-600 text-white text-xs font-semibold shadow-sm transition-colors"
          >
            <Check className="w-3.5 h-3.5" />
            Save Settings
          </button>
        </div>
      </form>
    </div>
  )
}

export default AttendanceSettingsView
