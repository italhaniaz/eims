import React, { useState } from 'react'
import { X, Unlock, AlertTriangle, ShieldCheck } from 'lucide-react'

export const UnlockSheetModal = ({
  isOpen,
  onClose,
  className,
  sectionName,
  date,
  onConfirmUnlock
}) => {
  const [reason, setReason] = useState('')
  const [errorMsg, setErrorMsg] = useState('')

  if (!isOpen) return null

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!reason.trim()) {
      setErrorMsg('Mandatory reason is required to unlock this attendance record.')
      return
    }
    onConfirmUnlock(reason.trim())
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-white rounded-2xl shadow-xl border border-slate-200 w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-amber-50/60">
          <div className="flex items-center gap-2 text-amber-800">
            <Unlock className="w-5 h-5 text-amber-600" />
            <div>
              <h3 className="text-sm font-bold">Unlock Attendance Register</h3>
              <p className="text-[11px] text-amber-700/80">
                {className} ({sectionName}) • Date: {date}
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
        <form onSubmit={handleSubmit} className="p-5 space-y-4 text-xs">
          <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl flex items-start gap-2.5 text-slate-600">
            <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
            <span className="leading-relaxed text-[11px]">
              This register is currently <strong>Locked</strong> against modification. As an Administrator, unlocking this sheet requires an official reason that will be permanently logged in the audit trail.
            </span>
          </div>

          <div>
            <label className="block text-slate-800 font-bold mb-1">
              Mandatory Reason for Unlocking <span className="text-rose-500">*</span>
            </label>
            <textarea
              rows={3}
              placeholder="E.g., Correction requested by Class Teacher: student was marked absent instead of medical leave..."
              value={reason}
              onChange={(e) => {
                setReason(e.target.value)
                if (errorMsg) setErrorMsg('')
              }}
              className="w-full p-2.5 bg-white rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 text-xs"
            />
            {errorMsg && <p className="text-rose-600 text-[11px] mt-1 font-semibold">{errorMsg}</p>}
          </div>

          <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-xl font-semibold"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!reason.trim()}
              className="px-5 py-2 bg-amber-600 hover:bg-amber-700 disabled:opacity-40 text-white font-bold rounded-xl transition-all shadow-xs flex items-center gap-1.5"
            >
              <Unlock className="w-3.5 h-3.5" />
              <span>Unlock Sheet</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default UnlockSheetModal
