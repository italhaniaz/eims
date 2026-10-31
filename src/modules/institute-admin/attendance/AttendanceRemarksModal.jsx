import React, { useState } from 'react'
import { X, Clock, FileText, CheckCircle2 } from 'lucide-react'
import { ATTENDANCE_STATUSES, LEAVE_ABSENCE_REASONS } from './attendanceService'

export const AttendanceRemarksModal = ({
  isOpen,
  onClose,
  student,
  currentStatus,
  currentReason = '',
  currentRemarks = '',
  currentArrivalTime = '',
  onSave
}) => {
  const statusConfig = ATTENDANCE_STATUSES[currentStatus] || ATTENDANCE_STATUSES.present
  const [reason, setReason] = useState(currentReason || (currentStatus === 'leave' ? 'Medical / Sick Leave' : 'Without Prior Information (Unexcused)'))
  const [customReason, setCustomReason] = useState('')
  const [remarks, setRemarks] = useState(currentRemarks || '')
  const [arrivalTime, setArrivalTime] = useState(currentArrivalTime || (currentStatus === 'late' ? '08:30' : ''))

  useEffect(() => {
    if (isOpen && student) {
      setReason(currentReason || (currentStatus === 'leave' ? 'Medical / Sick Leave' : 'Without Prior Information (Unexcused)'))
      setCustomReason('')
      setRemarks(currentRemarks || '')
      setArrivalTime(currentArrivalTime || (currentStatus === 'late' ? '08:30' : ''))
    }
  }, [isOpen, student, currentStatus, currentReason, currentRemarks, currentArrivalTime])

  if (!isOpen || !student) return null

  const handleSave = (e) => {
    e.preventDefault()
    const finalReason = reason === 'Other (Specify in Remarks)' && customReason ? customReason : reason
    onSave({
      reason: finalReason,
      remarks,
      arrivalTime
    })
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-white rounded-2xl shadow-xl border border-slate-200 w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <div className="flex items-center gap-2">
            <span className={`w-3 h-3 rounded-full ${statusConfig.dotClass}`} />
            <div>
              <h3 className="text-sm font-bold text-slate-800">
                Attendance Remarks & Reasons
              </h3>
              <p className="text-[11px] text-slate-400">
                {student.name} • Roll No: {student.rollNumber}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSave} className="p-5 space-y-4 text-xs">
          {/* Status Display Pill */}
          <div className="flex items-center justify-between bg-slate-50 p-2.5 rounded-xl border border-slate-200">
            <span className="text-slate-500 font-semibold">Selected Status:</span>
            <span className={`px-2.5 py-1 rounded-lg font-bold border text-xs ${statusConfig.badgeClass}`}>
              {statusConfig.label}
            </span>
          </div>

          {/* Late Arrival Time (if late) */}
          {currentStatus === 'late' && (
            <div>
              <label className="block text-slate-700 font-semibold mb-1">
                Recorded Arrival Time
              </label>
              <div className="relative">
                <Clock className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="time"
                  value={arrivalTime}
                  onChange={(e) => setArrivalTime(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 bg-white rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 font-mono font-bold"
                />
              </div>
            </div>
          )}

          {/* Reason Selector (for Leave or Absent) */}
          {(currentStatus === 'leave' || currentStatus === 'absent' || currentStatus === 'half_day') && (
            <div>
              <label className="block text-slate-700 font-semibold mb-1">
                Official Reason / Category
              </label>
              <select
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                className="w-full px-3 py-2 bg-white rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 font-medium"
              >
                {LEAVE_ABSENCE_REASONS.map(r => (
                  <option key={r} value={r}>{r}</option>
                ))}
              </select>

              {reason === 'Other (Specify in Remarks)' && (
                <input
                  type="text"
                  placeholder="Specify brief reason..."
                  value={customReason}
                  onChange={(e) => setCustomReason(e.target.value)}
                  className="mt-2 w-full px-3 py-2 bg-white rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 font-medium text-xs"
                />
              )}
            </div>
          )}

          {/* Internal Remarks / Notes */}
          <div>
            <label className="block text-slate-700 font-semibold mb-1">
              Internal Remarks & Teacher Notes (Optional)
            </label>
            <textarea
              rows={3}
              placeholder="E.g., Parent called at 8:15 AM requesting leave for sibling's checkup..."
              value={remarks}
              onChange={(e) => setRemarks(e.target.value)}
              className="w-full p-2.5 bg-white rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 resize-none text-xs leading-relaxed"
            />
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-3.5 py-2 text-slate-600 hover:bg-slate-100 rounded-xl font-semibold transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold transition-all shadow-xs inline-flex items-center gap-1.5"
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Save Remarks</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default AttendanceRemarksModal
