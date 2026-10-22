import React from 'react'
import { 
  X, 
  RotateCcw, 
  History, 
  Calendar, 
  CheckCircle2, 
  User, 
  Clock, 
  Layers 
} from 'lucide-react'
import Modal from '../../../components/common/Modal'

export const TimetableVersionsModal = ({
  isOpen,
  onClose,
  className,
  sectionName,
  versions = [],
  currentSlotCount = 0,
  onRestoreVersion
}) => {
  if (!isOpen) return null

  const handleRestore = (ver) => {
    if (window.confirm(`Restore timetable for ${className} (${sectionName}) back to Version ${ver.versionNumber} saved on ${new Date(ver.savedAt).toLocaleDateString()}? Current periods will be replaced.`)) {
      onRestoreVersion(ver.versionNumber)
      onClose()
    }
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={
        <div className="flex items-center gap-2">
          <History className="w-5 h-5 text-emerald-600" />
          <span className="font-bold text-slate-900">
            Revision Version History: {className} ({sectionName})
          </span>
        </div>
      }
      maxWidth="max-w-2xl"
    >
      <div className="space-y-4 text-xs">
        <p className="text-slate-500">
          Audit trail of previously saved timetable revisions with one-click snapshot rollback.
        </p>

        {versions.length > 0 ? (
          <div className="space-y-3 max-h-96 overflow-y-auto pr-1">
            {versions.map((ver, idx) => (
              <div 
                key={idx}
                className="p-3.5 bg-white border border-slate-200 rounded-xl shadow-2xs hover:border-slate-300 transition-colors flex items-center justify-between gap-3"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-slate-900 text-white">
                      v{ver.versionNumber}
                    </span>
                    <strong className="text-slate-900 font-bold">{ver.summary || `Version ${ver.versionNumber}`}</strong>
                    {idx === 0 && (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                        Current Snapshot
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-3 text-slate-400 text-[11px] font-mono">
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3 text-slate-400" />
                      <span>{new Date(ver.savedAt).toLocaleString()}</span>
                    </span>
                    <span>•</span>
                    <span className="flex items-center gap-1">
                      <User className="w-3 h-3 text-slate-400" />
                      <span>{ver.savedBy || 'Administrator'}</span>
                    </span>
                    <span>•</span>
                    <span className="font-bold text-slate-700">{ver.slotCount || 0} Periods</span>
                  </div>
                </div>

                <div>
                  <button
                    type="button"
                    onClick={() => handleRestore(ver)}
                    className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold rounded-lg transition-colors flex items-center gap-1.5 shadow-2xs text-xs"
                    title={`Restore Version ${ver.versionNumber}`}
                  >
                    <RotateCcw className="w-3.5 h-3.5 text-slate-600" />
                    <span>Rollback</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-8 text-center bg-slate-50 border border-dashed rounded-xl text-slate-400">
            No previous versions archived yet. Revisions are created automatically whenever scheduled slots change.
          </div>
        )}

        <div className="flex justify-end pt-3 border-t border-slate-100">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
          >
            Close
          </button>
        </div>
      </div>
    </Modal>
  )
}

export default TimetableVersionsModal
