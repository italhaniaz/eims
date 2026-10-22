import React, { useState, useMemo } from 'react'
import { 
  X, 
  Copy, 
  AlertCircle, 
  CheckCircle2, 
  Calendar, 
  ShieldAlert, 
  ArrowRight,
  Info
} from 'lucide-react'
import Modal from '../../../components/common/Modal'
import { checkSlotConflicts } from './timetableService'

export const CopyDayModal = ({
  isOpen,
  onClose,
  session = '2026-2027',
  shift = 'Morning',
  sourceDay = 'Monday',
  workingDays = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
  currentScheduleSlots = {},
  className,
  sectionName,
  teachers = [],
  onExecuteCopy
}) => {
  const [selectedSourceDay, setSelectedSourceDay] = useState(sourceDay || 'Monday')
  const [selectedTargetDays, setSelectedTargetDays] = useState([])
  const [overwriteExisting, setOverwriteExisting] = useState(true)

  // Target days available (excluding source day)
  const availableTargetDays = useMemo(() => {
    return workingDays.filter(d => d !== selectedSourceDay)
  }, [workingDays, selectedSourceDay])

  // Slots present on the source day
  const sourceSlots = useMemo(() => {
    const list = []
    Object.entries(currentScheduleSlots).forEach(([key, slot]) => {
      if (key.startsWith(`${selectedSourceDay}-`) && slot) {
        list.push(slot)
      }
    })
    return list
  }, [currentScheduleSlots, selectedSourceDay])

  // Pre-flight conflict inspection for target days
  const conflictReport = useMemo(() => {
    const conflicts = []
    if (sourceSlots.length === 0 || selectedTargetDays.length === 0) return conflicts

    selectedTargetDays.forEach(targetDay => {
      sourceSlots.forEach(slot => {
        const check = checkSlotConflicts({
          session,
          shift,
          day: targetDay,
          periodNum: slot.periodNum,
          teacherId: slot.teacherId,
          teacherName: slot.teacherName,
          roomId: slot.roomId,
          roomName: slot.roomName,
          targetClassName: className,
          targetSectionName: sectionName,
          currentSlotKey: null,
          teachersList: teachers
        })

        if (check.blocked) {
          conflicts.push({
            targetDay,
            periodNum: slot.periodNum,
            subject: slot.subjectName,
            reasons: check.reasons
          })
        }
      })
    })

    return conflicts
  }, [sourceSlots, selectedTargetDays, session, shift, className, sectionName, teachers])

  if (!isOpen) return null

  const handleToggleTargetDay = (day) => {
    setSelectedTargetDays(prev => 
      prev.includes(day) ? prev.filter(d => d !== day) : [...prev, day]
    )
  }

  const handleSelectAllTargets = () => {
    if (selectedTargetDays.length === availableTargetDays.length) {
      setSelectedTargetDays([])
    } else {
      setSelectedTargetDays([...availableTargetDays])
    }
  }

  const handleConfirmCopy = () => {
    if (sourceSlots.length === 0 || selectedTargetDays.length === 0) return

    onExecuteCopy({
      sourceDay: selectedSourceDay,
      targetDays: selectedTargetDays,
      sourceSlots,
      overwriteExisting
    })
    onClose()
  }

  const hasBlockingConflicts = conflictReport.length > 0

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={
        <div className="flex items-center gap-2">
          <Copy className="w-5 h-5 text-emerald-600" />
          <span className="font-bold text-slate-900">Replicate Daily Routine to Other Days</span>
        </div>
      }
      maxWidth="max-w-2xl"
    >
      <div className="space-y-4 text-xs">
        <p className="text-slate-500">
          Copy scheduled periods from one day to multiple days of the week with pre-flight teacher & room conflict protection.
        </p>

        {/* Source Day Selector */}
        <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-200 grid grid-cols-1 sm:grid-cols-2 gap-3 items-center">
          <div>
            <label className="block text-slate-500 font-bold uppercase text-[10px] mb-1">
              Source Day to Copy From
            </label>
            <select
              value={selectedSourceDay}
              onChange={(e) => {
                setSelectedSourceDay(e.target.value)
                setSelectedTargetDays([])
              }}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white font-bold text-slate-800"
            >
              {workingDays.map(d => (
                <option key={d} value={d}>{d}</option>
              ))}
            </select>
          </div>

          <div className="text-slate-600 text-xs pl-2">
            <span className="font-bold block text-slate-800 font-mono text-sm">
              {sourceSlots.length} Period(s) Configured
            </span>
            <span className="text-slate-400 text-[11px]">
              Ready to replicate across selected target days.
            </span>
          </div>
        </div>

        {/* Target Days Multi-Select */}
        <div className="p-3.5 bg-white rounded-2xl border border-slate-200 space-y-2.5">
          <div className="flex items-center justify-between">
            <span className="font-bold text-slate-700 uppercase tracking-wider text-[11px]">
              Select Destination Target Days
            </span>
            <button
              type="button"
              onClick={handleSelectAllTargets}
              className="text-[11px] font-bold text-emerald-700 hover:underline"
            >
              {selectedTargetDays.length === availableTargetDays.length ? 'Deselect All' : 'Select All Days'}
            </button>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            {availableTargetDays.map(day => {
              const isSelected = selectedTargetDays.includes(day)
              return (
                <button
                  key={day}
                  type="button"
                  onClick={() => handleToggleTargetDay(day)}
                  className={`px-3 py-1.5 rounded-xl font-bold transition-all text-xs flex items-center gap-1.5 ${
                    isSelected
                      ? 'bg-emerald-600 text-white shadow-2xs'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  <div className={`w-2 h-2 rounded-full ${isSelected ? 'bg-white' : 'bg-slate-300'}`} />
                  <span>{day}</span>
                </button>
              )
            })}
          </div>
        </div>

        {/* Overwrite Setting */}
        <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between">
          <div>
            <strong className="block text-slate-800 font-bold">Overwrite Existing Target Day Slots</strong>
            <span className="text-[11px] text-slate-500">
              When checked, replaces any periods currently scheduled on the destination days.
            </span>
          </div>
          <input
            type="checkbox"
            checked={overwriteExisting}
            onChange={(e) => setOverwriteExisting(e.target.checked)}
            className="w-4 h-4 text-emerald-600 rounded cursor-pointer"
          />
        </div>

        {/* Conflict Report if Any */}
        {hasBlockingConflicts && (
          <div className="p-3.5 bg-rose-50 border border-rose-200 text-rose-800 rounded-xl space-y-2">
            <div className="flex items-center gap-2 font-bold">
              <ShieldAlert className="w-4 h-4 text-rose-600 shrink-0" />
              <span>{conflictReport.length} Conflict(s) Prevent Day Replication</span>
            </div>
            <ul className="list-disc pl-4 space-y-1 text-[11px] max-h-36 overflow-y-auto">
              {conflictReport.map((c, i) => (
                <li key={i}>
                  <strong>{c.targetDay} ({c.periodNum}) - {c.subject}:</strong> {c.reasons.join(' ')}
                </li>
              ))}
            </ul>
            <p className="text-[11px] text-rose-700 italic">
              Please resolve the conflicting faculty or classroom bookings on target days before copying.
            </p>
          </div>
        )}

        {/* Footer Actions */}
        <div className="flex items-center justify-between pt-3 border-t border-slate-100">
          <span className="text-[11px] text-slate-400">
            {selectedTargetDays.length > 0 ? `Copying to ${selectedTargetDays.join(', ')}` : 'Select target days'}
          </span>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
            >
              Cancel
            </button>
            <button
              type="button"
              disabled={sourceSlots.length === 0 || selectedTargetDays.length === 0 || hasBlockingConflicts}
              onClick={handleConfirmCopy}
              className="px-5 py-2 font-bold text-white bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 rounded-xl shadow-xs transition-all flex items-center gap-1.5"
            >
              <Copy className="w-3.5 h-3.5" />
              <span>Execute Day Copy</span>
            </button>
          </div>
        </div>
      </div>
    </Modal>
  )
}

export default CopyDayModal
