import React, { useState } from 'react'
import { X, Calendar, Plus, Trash2, CheckCircle2, Clock, User, AlertCircle, FileText } from 'lucide-react'
import {
  getStudentLeaveApplications,
  saveStudentLeaveApplication,
  deleteStudentLeaveApplication,
  LEAVE_ABSENCE_REASONS,
  formatDateDDMMYYYY
} from './attendanceService'

export const StudentLeaveModal = ({
  isOpen,
  onClose,
  students = [],
  currentClass,
  currentSection,
  onLeavesUpdated
}) => {
  const [leavesList, setLeavesList] = useState(() => getStudentLeaveApplications())

  // New leave form state
  const [selectedStudentId, setSelectedStudentId] = useState(students[0]?.id || '')
  const [fromDate, setFromDate] = useState(() => new Date().toISOString().split('T')[0])
  const [toDate, setToDate] = useState(() => new Date().toISOString().split('T')[0])
  const [reason, setReason] = useState('Medical / Sick Leave')
  const [customReason, setCustomReason] = useState('')
  const [status, setStatus] = useState('Approved') // Default approved
  const [remarks, setRemarks] = useState('')

  if (!isOpen) return null

  const handleAddLeave = (e) => {
    e.preventDefault()
    const student = students.find(s => s.id === selectedStudentId)
    if (!student || !fromDate) return

    const finalReason = reason === 'Other (Specify in Remarks)' && customReason ? customReason : reason
    const newLeave = {
      studentId: student.id,
      studentName: student.name,
      rollNumber: student.rollNumber,
      className: student.className || currentClass,
      section: student.section || currentSection,
      fromDate,
      toDate: toDate || fromDate,
      reason: finalReason,
      status, // 'Approved' | 'Pending' | 'Rejected'
      remarks
    }

    const updated = saveStudentLeaveApplication(newLeave)
    setLeavesList(updated)
    setRemarks('')
    setCustomReason('')
    onLeavesUpdated?.(updated)
  }

  const handleDelete = (id) => {
    const updated = deleteStudentLeaveApplication(id)
    setLeavesList(updated)
    onLeavesUpdated?.(updated)
  }

  const handleToggleStatus = (id, newStatus) => {
    const target = leavesList.find(l => l.id === id)
    if (!target) return
    const updatedItem = { ...target, status: newStatus }
    const updated = saveStudentLeaveApplication(updatedItem)
    setLeavesList(updated)
    onLeavesUpdated?.(updated)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-white rounded-2xl shadow-xl border border-slate-200 w-full max-w-2xl overflow-hidden animate-in zoom-in-95 duration-150 flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/70">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center border border-amber-200">
              <Calendar className="w-5 h-5 text-amber-600" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-800">
                Student Leave Applications & Permissions
              </h3>
              <p className="text-xs text-slate-400">
                Approved leaves automatically pre-fill "Leave" status on daily roll call registers
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

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-5 space-y-5 text-xs">
          {/* Add Leave Form */}
          <form onSubmit={handleAddLeave} className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-3">
            <span className="font-bold text-slate-800 block uppercase text-[10px]">
              Record New Leave Application
            </span>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* Student Picker */}
              <div>
                <label className="text-[10px] text-slate-500 font-semibold block mb-0.5">Select Student</label>
                <select
                  value={selectedStudentId}
                  onChange={(e) => setSelectedStudentId(e.target.value)}
                  className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-bold text-slate-800 focus:outline-none"
                >
                  {students.map(s => (
                    <option key={s.id} value={s.id}>
                      {s.name} (Roll: {s.rollNumber})
                    </option>
                  ))}
                </select>
              </div>

              {/* Leave Status */}
              <div>
                <label className="text-[10px] text-slate-500 font-semibold block mb-0.5">Approval Status</label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                  className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-bold text-emerald-800 focus:outline-none"
                >
                  <option value="Approved">Approved (Pre-fills Leave in Roll Call)</option>
                  <option value="Pending">Pending Review</option>
                  <option value="Rejected">Rejected (Counts as Absent)</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* From Date */}
              <div>
                <label className="text-[10px] text-slate-500 font-semibold block mb-0.5">From Date</label>
                <input
                  type="date"
                  value={fromDate}
                  onChange={(e) => setFromDate(e.target.value)}
                  className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-mono font-bold focus:outline-none"
                />
              </div>

              {/* To Date */}
              <div>
                <label className="text-[10px] text-slate-500 font-semibold block mb-0.5">To Date</label>
                <input
                  type="date"
                  value={toDate}
                  onChange={(e) => setToDate(e.target.value)}
                  className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-mono font-bold focus:outline-none"
                />
              </div>
            </div>

            {/* Reason */}
            <div>
              <label className="text-[10px] text-slate-500 font-semibold block mb-0.5">Reason for Absence</label>
              <select
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-medium focus:outline-none"
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
                  className="mt-1.5 w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-medium focus:outline-none"
                />
              )}
            </div>

            {/* Notes */}
            <div>
              <label className="text-[10px] text-slate-500 font-semibold block mb-0.5">Notes & Verification (Optional)</label>
              <input
                type="text"
                placeholder="E.g., Medical prescription provided by guardian..."
                value={remarks}
                onChange={(e) => setRemarks(e.target.value)}
                className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-medium focus:outline-none"
              />
            </div>

            <div className="flex justify-end pt-1">
              <button
                type="submit"
                disabled={!selectedStudentId || !fromDate}
                className="px-4 py-2 bg-amber-600 hover:bg-amber-700 disabled:opacity-40 text-white font-bold rounded-xl transition-colors flex items-center gap-1.5 shadow-xs"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Save Application</span>
              </button>
            </div>
          </form>

          {/* Existing Leaves List */}
          <div className="space-y-2">
            <span className="font-bold text-slate-700 uppercase text-[10px] block">
              Leave Records & History ({leavesList.length})
            </span>

            {leavesList.length === 0 ? (
              <div className="p-6 text-center text-slate-400 bg-slate-50 rounded-xl border border-dashed border-slate-200">
                No leave applications recorded. Students without recorded leaves default to standard roll call.
              </div>
            ) : (
              <div className="space-y-2 max-h-56 overflow-y-auto">
                {leavesList.map(item => (
                  <div
                    key={item.id}
                    className="p-3 bg-white border border-slate-200 rounded-xl flex items-center justify-between gap-3 hover:bg-slate-50 transition-colors"
                  >
                    <div className="truncate">
                      <strong className="block text-slate-800 text-xs">
                        {item.studentName} <span className="font-mono text-slate-400 font-normal">({item.rollNumber})</span>
                      </strong>
                      <span className="text-[11px] text-slate-500 font-mono block">
                        {formatDateDDMMYYYY(item.fromDate)} {item.toDate && item.toDate !== item.fromDate ? `to ${formatDateDDMMYYYY(item.toDate)}` : ''} • {item.reason}
                      </span>
                      {item.remarks && (
                        <span className="text-[10px] text-slate-400 italic block">
                          Notes: {item.remarks}
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <select
                        value={item.status}
                        onChange={(e) => handleToggleStatus(item.id, e.target.value)}
                        className={`text-[10px] font-bold px-2 py-1 rounded-lg border focus:outline-none cursor-pointer ${
                          item.status === 'Approved'
                            ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                            : item.status === 'Pending'
                            ? 'bg-amber-50 text-amber-800 border-amber-200'
                            : 'bg-rose-50 text-rose-800 border-rose-200'
                        }`}
                      >
                        <option value="Approved">Approved</option>
                        <option value="Pending">Pending</option>
                        <option value="Rejected">Rejected</option>
                      </select>

                      <button
                        type="button"
                        onClick={() => handleDelete(item.id)}
                        className="p-1.5 text-slate-400 hover:text-rose-600 transition-colors"
                        title="Delete application"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default StudentLeaveModal
