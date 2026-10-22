import React from 'react'
import { X, History, User, Clock, ShieldCheck, CheckCircle2 } from 'lucide-react'
import { formatDateDDMMYYYY } from './attendanceService'

export const AttendanceAuditHistoryModal = ({
  isOpen,
  onClose,
  className,
  sectionName,
  date,
  auditTrail = [],
  submittedAt,
  submittedBy
}) => {
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-white rounded-2xl shadow-xl border border-slate-200 w-full max-w-lg overflow-hidden animate-in zoom-in-95 duration-150 flex flex-col max-h-[85vh]">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/70">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-slate-100 text-slate-700 flex items-center justify-center border border-slate-200">
              <History className="w-5 h-5 text-slate-600" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-800">
                Attendance Audit Trail & Revisions
              </h3>
              <p className="text-xs text-slate-400">
                {className} ({sectionName}) • Date: {formatDateDDMMYYYY(date)}
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
        <div className="flex-1 overflow-y-auto p-5 text-xs space-y-4">
          <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-1">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
              Original Roll Call Record
            </span>
            <div className="flex items-center justify-between font-mono text-[11px]">
              <span className="text-slate-700 font-semibold">Marked By: {submittedBy || 'Teacher'}</span>
              <span className="text-slate-400">
                {submittedAt ? new Date(submittedAt).toLocaleString() : 'N/A'}
              </span>
            </div>
          </div>

          <div className="space-y-3">
            <span className="text-[10px] font-bold text-slate-600 uppercase tracking-wider block">
              Modification History & Overrides ({auditTrail.length})
            </span>

            {auditTrail.length === 0 ? (
              <div className="p-6 text-center text-slate-400 bg-slate-50 rounded-xl border border-dashed border-slate-200">
                No subsequent modifications recorded. Sheet remains in its original saved state.
              </div>
            ) : (
              <div className="relative border-l border-slate-200 ml-3 pl-4 space-y-4">
                {auditTrail.map((entry, idx) => (
                  <div key={idx} className="relative space-y-1">
                    {/* Timeline bullet */}
                    <span className="absolute -left-[21px] top-1 w-2.5 h-2.5 rounded-full bg-emerald-600 border-2 border-white" />
                    
                    <div className="flex items-center justify-between">
                      <strong className="text-slate-800 font-bold">{entry.action}</strong>
                      <span className="text-[10px] text-slate-400 font-mono">
                        {entry.timestamp ? new Date(entry.timestamp).toLocaleString() : '—'}
                      </span>
                    </div>

                    <div className="text-[11px] text-slate-500 font-mono">
                      <span>Operator: <strong>{entry.user}</strong></span>
                      {entry.totalMarked && <span> • {entry.totalMarked} students marked</span>}
                    </div>

                    {entry.reason && (
                      <p className="text-[11px] text-slate-600 bg-slate-50 p-2 rounded-lg border border-slate-200 italic mt-1">
                        "{entry.reason}"
                      </p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-100 bg-slate-50/50 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-700 font-bold rounded-xl text-xs transition-colors"
          >
            Close History
          </button>
        </div>
      </div>
    </div>
  )
}

export default AttendanceAuditHistoryModal
