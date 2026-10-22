import React, { useState, useEffect } from 'react'
import { 
  X, 
  Clock, 
  Calendar, 
  Plus, 
  Trash2, 
  AlertCircle, 
  Check, 
  Sparkles, 
  Coffee, 
  Sun, 
  Moon, 
  Layers,
  ArrowRight,
  ShieldCheck
} from 'lucide-react'
import Modal from '../../../components/common/Modal'
import { 
  getBellSchedule, 
  saveBellSchedule, 
  createDefaultBellSchedule 
} from './timetableService'

// Helper: Convert "hh:mm AM/PM" to minutes from midnight
const timeToMinutes = (timeStr = '') => {
  if (!timeStr) return 0
  const match = timeStr.trim().match(/^(\d{1,2}):(\d{2})\s*(AM|PM)?$/i)
  if (!match) return 0
  let hours = parseInt(match[1], 10)
  const minutes = parseInt(match[2], 10)
  const modifier = (match[3] || 'AM').toUpperCase()

  if (modifier === 'PM' && hours < 12) hours += 12
  if (modifier === 'AM' && hours === 12) hours = 0
  return hours * 60 + minutes
}

// Helper: Convert minutes from midnight to "hh:mm AM/PM"
const minutesToTime = (totalMinutes) => {
  let hours = Math.floor(totalMinutes / 60)
  const minutes = totalMinutes % 60
  const modifier = hours >= 12 ? 'PM' : 'AM'
  hours = hours % 12
  if (hours === 0) hours = 12
  return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')} ${modifier}`
}

export const BellScheduleModal = ({
  isOpen,
  onClose,
  currentLevel = 'secondary',
  currentShift = 'Morning',
  onScheduleSaved
}) => {
  const [selectedLevel, setSelectedLevel] = useState(currentLevel || 'secondary')
  const [selectedShift, setSelectedShift] = useState(currentShift || 'Morning')
  const [activeTab, setActiveTab] = useState('regular') // 'regular' | 'friday'
  const [validationError, setValidationError] = useState('')

  const availableDays = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']

  // Bell Schedule Form State
  const [scheduleData, setScheduleData] = useState(() => createDefaultBellSchedule(selectedLevel, selectedShift))

  useEffect(() => {
    if (isOpen) {
      const existing = getBellSchedule(selectedLevel, selectedShift)
      if (existing) {
        setScheduleData(existing)
      } else {
        setScheduleData(createDefaultBellSchedule(selectedLevel, selectedShift))
      }
      setValidationError('')
      setActiveTab('regular')
    }
  }, [isOpen, selectedLevel, selectedShift])

  if (!isOpen) return null

  // Working Days Toggling
  const handleToggleDay = (day) => {
    setScheduleData(prev => {
      const current = prev.workingDays || []
      const exists = current.includes(day)
      const nextDays = exists ? current.filter(d => d !== day) : [...current, day]
      if (nextDays.length === 0) return prev
      return { ...prev, workingDays: nextDays }
    })
  }

  // Auto-generate standard period slots
  const handleAutoGenerate = (isFriday = false) => {
    const isEvening = selectedShift === 'Evening'
    const startMins = isEvening ? 13 * 60 : 8 * 60 // 01:00 PM or 08:00 AM
    const periodDuration = isFriday ? 35 : 45
    const breakDuration = isFriday ? 20 : 30
    const periodCount = isFriday ? 5 : 6

    let cursor = startMins
    const generatedPeriods = []

    for (let i = 1; i <= periodCount; i++) {
      const pStart = minutesToTime(cursor)
      cursor += periodDuration
      const pEnd = minutesToTime(cursor)

      generatedPeriods.push({
        id: `p-${i}-${Date.now()}`,
        num: `P${i}`,
        label: `Period ${i}`,
        startTime: pStart,
        endTime: pEnd,
        isBreak: false
      })

      // Insert Recess Break after P3
      if (i === 3) {
        const bStart = minutesToTime(cursor)
        cursor += breakDuration
        const bEnd = minutesToTime(cursor)
        generatedPeriods.push({
          id: `brk-${Date.now()}`,
          num: 'BREAK',
          label: isFriday ? 'Morning Break' : 'Recess Break',
          breakName: isFriday ? 'Morning Break' : 'Recess Break',
          startTime: bStart,
          endTime: bEnd,
          isBreak: true
        })
      }
    }

    if (isFriday) {
      // Add Jummah Prayer Break
      const jStart = minutesToTime(cursor)
      cursor += 45
      const jEnd = minutesToTime(cursor)
      generatedPeriods.push({
        id: `brk-jummah-${Date.now()}`,
        num: 'JUMMAH',
        label: 'Jummah Break',
        breakName: 'Jummah Prayer Break',
        startTime: jStart,
        endTime: jEnd,
        isBreak: true
      })

      setScheduleData(prev => ({
        ...prev,
        hasFridaySpecial: true,
        fridayPeriods: generatedPeriods
      }))
    } else {
      setScheduleData(prev => ({
        ...prev,
        periods: generatedPeriods
      }))
    }
    setValidationError('')
  }

  // Update Period Field
  const handleUpdatePeriod = (index, field, value, isFriday = false) => {
    setScheduleData(prev => {
      const targetList = isFriday ? [...(prev.fridayPeriods || [])] : [...(prev.periods || [])]
      if (!targetList[index]) return prev
      targetList[index] = { ...targetList[index], [field]: value }
      return isFriday ? { ...prev, fridayPeriods: targetList } : { ...prev, periods: targetList }
    })
  }

  // Add Period or Break
  const handleAddSlot = (isBreak = false, isFriday = false) => {
    setScheduleData(prev => {
      const targetList = isFriday ? [...(prev.fridayPeriods || [])] : [...(prev.periods || [])]
      const lastSlot = targetList[targetList.length - 1]
      const lastEndMins = lastSlot ? timeToMinutes(lastSlot.endTime) : (selectedShift === 'Evening' ? 13 * 60 : 8 * 60)
      const duration = isBreak ? 30 : 45
      const newStart = minutesToTime(lastEndMins)
      const newEnd = minutesToTime(lastEndMins + duration)

      const regularCount = targetList.filter(p => !p.isBreak).length

      const newSlot = {
        id: `slot-${Date.now()}`,
        num: isBreak ? 'BREAK' : `P${regularCount + 1}`,
        label: isBreak ? 'Lunch / Tea Break' : `Period ${regularCount + 1}`,
        breakName: isBreak ? 'Recess Break' : undefined,
        startTime: newStart,
        endTime: newEnd,
        isBreak
      }

      const updated = [...targetList, newSlot]
      return isFriday ? { ...prev, fridayPeriods: updated } : { ...prev, periods: updated }
    })
  }

  // Remove Slot
  const handleRemoveSlot = (index, isFriday = false) => {
    setScheduleData(prev => {
      const targetList = isFriday ? [...(prev.fridayPeriods || [])] : [...(prev.periods || [])]
      targetList.splice(index, 1)
      return isFriday ? { ...prev, fridayPeriods: targetList } : { ...prev, periods: targetList }
    })
  }

  // Validate and Save
  const handleSave = (e) => {
    e.preventDefault()
    setValidationError('')

    // Validate Working Days
    if (!scheduleData.workingDays || scheduleData.workingDays.length === 0) {
      setValidationError('Please select at least one institutional working day.')
      return
    }

    // Validate regular periods
    const regularPeriods = scheduleData.periods || []
    if (regularPeriods.length === 0) {
      setValidationError('Please configure at least one period in the regular routine.')
      return
    }

    // Validate Chronological & Overlap Rules
    const validateSequence = (list, scheduleName) => {
      for (let i = 0; i < list.length; i++) {
        const item = list[i]
        const startMins = timeToMinutes(item.startTime)
        const endMins = timeToMinutes(item.endTime)

        if (!item.startTime || !item.endTime) {
          return `${scheduleName} slot #${i + 1} (${item.num}) has missing time values.`
        }

        if (endMins <= startMins) {
          return `${scheduleName} slot #${i + 1} (${item.num}): End time (${item.endTime}) must be strictly after start time (${item.startTime}).`
        }

        if (i > 0) {
          const prevItem = list[i - 1]
          const prevEndMins = timeToMinutes(prevItem.endTime)
          if (startMins < prevEndMins) {
            return `Time Overlap in ${scheduleName}: Slot "${item.label}" (${item.startTime}) starts before previous slot "${prevItem.label}" (${prevItem.endTime}) finishes.`
          }
        }
      }
      return null
    }

    const regErr = validateSequence(regularPeriods, 'Regular Schedule')
    if (regErr) {
      setValidationError(regErr)
      setActiveTab('regular')
      return
    }

    if (scheduleData.hasFridaySpecial && scheduleData.fridayPeriods && scheduleData.fridayPeriods.length > 0) {
      const friErr = validateSequence(scheduleData.fridayPeriods, 'Friday Schedule')
      if (friErr) {
        setValidationError(friErr)
        setActiveTab('friday')
        return
      }
    }

    // Save
    const saved = saveBellSchedule(selectedLevel, selectedShift, scheduleData)
    if (onScheduleSaved) onScheduleSaved(saved)
    onClose()
  }

  const currentPeriodsList = activeTab === 'friday' ? (scheduleData.fridayPeriods || []) : (scheduleData.periods || [])

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={
        <div className="flex items-center justify-between gap-3 pr-6">
          <div className="flex items-center gap-2">
            <Clock className="w-5 h-5 text-emerald-600" />
            <span className="font-bold text-slate-900">Institutional Bell Schedule Configuration</span>
          </div>
          <span className="text-xs font-mono font-bold px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200">
            {selectedShift} Shift
          </span>
        </div>
      }
      maxWidth="max-w-4xl"
    >
      <form onSubmit={handleSave} className="space-y-4 text-xs">
        {/* Validation Alert */}
        {validationError && (
          <div className="p-3 bg-rose-50 border border-rose-200 text-rose-800 rounded-xl flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
            <span className="font-semibold">{validationError}</span>
          </div>
        )}

        {/* Tier & Shift Selectors */}
        <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-200 grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-slate-500 font-bold uppercase text-[10px] mb-1">
              Educational Program Level
            </label>
            <select
              value={selectedLevel}
              onChange={(e) => setSelectedLevel(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
            >
              <option value="preschool">Pre-School (Playgroup - KG)</option>
              <option value="elementary">Elementary (Grade 1 - 8)</option>
              <option value="secondary">Secondary (Grade 9 - 10 / Matric)</option>
              <option value="higher-secondary">Higher Secondary (Grade 11 - 12 / Inter)</option>
              <option value="college">College (Associate Degree / ADP)</option>
              <option value="university">University (BS / MS Honors)</option>
            </select>
          </div>

          <div>
            <label className="block text-slate-500 font-bold uppercase text-[10px] mb-1">
              Operational Academic Shift
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setSelectedShift('Morning')}
                className={`py-2 px-3 rounded-xl font-bold flex items-center justify-center gap-1.5 transition-all ${
                  selectedShift === 'Morning'
                    ? 'bg-emerald-600 text-white shadow-2xs'
                    : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-100'
                }`}
              >
                <Sun className="w-3.5 h-3.5" />
                <span>Morning Shift</span>
              </button>
              <button
                type="button"
                onClick={() => setSelectedShift('Evening')}
                className={`py-2 px-3 rounded-xl font-bold flex items-center justify-center gap-1.5 transition-all ${
                  selectedShift === 'Evening'
                    ? 'bg-blue-600 text-white shadow-2xs'
                    : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-100'
                }`}
              >
                <Moon className="w-3.5 h-3.5" />
                <span>Evening Shift</span>
              </button>
            </div>
          </div>
        </div>

        {/* Working Days Selector */}
        <div className="p-3.5 bg-white rounded-2xl border border-slate-200 space-y-2">
          <div className="flex items-center justify-between">
            <span className="font-bold text-slate-700 uppercase tracking-wider text-[11px] block">
              Active Institutional Working Days
            </span>
            <span className="text-[10px] text-slate-400 font-mono">
              {scheduleData.workingDays?.length || 0} Working Days Configured
            </span>
          </div>

          <div className="flex items-center gap-1.5 flex-wrap">
            {availableDays.map(day => {
              const isSelected = (scheduleData.workingDays || []).includes(day)
              return (
                <button
                  key={day}
                  type="button"
                  onClick={() => handleToggleDay(day)}
                  className={`px-3 py-1.5 rounded-xl font-bold transition-all text-xs flex items-center gap-1.5 ${
                    isSelected
                      ? 'bg-slate-900 text-white shadow-2xs'
                      : 'bg-slate-100 text-slate-500 hover:bg-slate-200/80 hover:text-slate-800'
                  }`}
                >
                  <div className={`w-2 h-2 rounded-full ${isSelected ? 'bg-emerald-400' : 'bg-slate-300'}`} />
                  <span>{day}</span>
                </button>
              )
            })}
          </div>
        </div>

        {/* Tabs: Regular vs Friday Special Routine */}
        <div className="flex items-center justify-between border-b border-slate-200 pt-1">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setActiveTab('regular')}
              className={`pb-2.5 px-3 font-bold text-xs border-b-2 transition-all flex items-center gap-1.5 ${
                activeTab === 'regular'
                  ? 'border-emerald-600 text-emerald-700'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              <Calendar className="w-3.5 h-3.5" />
              <span>Standard Weekday Routine ({scheduleData.periods?.length || 0} Slots)</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('friday')}
              className={`pb-2.5 px-3 font-bold text-xs border-b-2 transition-all flex items-center gap-1.5 ${
                activeTab === 'friday'
                  ? 'border-emerald-600 text-emerald-700'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              <Coffee className="w-3.5 h-3.5" />
              <span>Special Friday Routine {scheduleData.hasFridaySpecial && `(${scheduleData.fridayPeriods?.length || 0} Slots)`}</span>
            </button>
          </div>

          <div className="flex items-center gap-2 pb-1.5">
            <button
              type="button"
              onClick={() => handleAutoGenerate(activeTab === 'friday')}
              className="px-2.5 py-1 text-[11px] font-bold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 rounded-lg border border-emerald-200 transition-colors flex items-center gap-1"
            >
              <Sparkles className="w-3 h-3 text-emerald-600" />
              <span>Auto-Fill Standards</span>
            </button>
          </div>
        </div>

        {/* Friday Special Toggle when in Friday Tab */}
        {activeTab === 'friday' && (
          <div className="p-3 bg-amber-50/70 border border-amber-200 rounded-xl flex items-center justify-between">
            <div>
              <strong className="text-amber-900 block font-bold">Friday Shorter Timetable Enabled</strong>
              <span className="text-[11px] text-amber-700">
                Friday periods can be adjusted for early dismissal and Jummah Prayer assembly.
              </span>
            </div>
            <label className="flex items-center gap-2 font-bold text-amber-900 cursor-pointer">
              <input
                type="checkbox"
                checked={scheduleData.hasFridaySpecial}
                onChange={(e) => {
                  const checked = e.target.checked
                  setScheduleData(prev => ({
                    ...prev,
                    hasFridaySpecial: checked,
                    fridayPeriods: checked ? (prev.fridayPeriods && prev.fridayPeriods.length > 0 ? prev.fridayPeriods : prev.periods) : []
                  }))
                }}
                className="w-4 h-4 text-emerald-600 rounded"
              />
              <span>Apply Separate Friday Times</span>
            </label>
          </div>
        )}

        {/* Periods List Builder */}
        <div className="space-y-2.5 max-h-72 overflow-y-auto pr-1">
          {currentPeriodsList.map((slot, idx) => (
            <div
              key={slot.id || idx}
              className={`p-2.5 rounded-xl border flex items-center gap-3 transition-colors ${
                slot.isBreak 
                  ? 'bg-amber-50/60 border-amber-200 text-amber-900' 
                  : 'bg-white border-slate-200 text-slate-800'
              }`}
            >
              {/* Slot Badge */}
              <div className="w-16 text-center shrink-0">
                <span className={`px-2 py-0.5 rounded font-mono font-bold text-[11px] ${
                  slot.isBreak ? 'bg-amber-100 text-amber-800' : 'bg-slate-100 text-slate-700'
                }`}>
                  {slot.num}
                </span>
              </div>

              {/* Label / Name */}
              <div className="flex-1">
                <input
                  type="text"
                  required
                  value={slot.isBreak ? (slot.breakName || slot.label) : slot.label}
                  onChange={(e) => {
                    const val = e.target.value
                    handleUpdatePeriod(idx, slot.isBreak ? 'breakName' : 'label', val, activeTab === 'friday')
                    handleUpdatePeriod(idx, 'label', val, activeTab === 'friday')
                  }}
                  className="w-full px-2.5 py-1 border border-slate-200 rounded-lg text-xs font-semibold bg-white"
                  placeholder={slot.isBreak ? 'Break Title (e.g. Recess, Lunch)' : 'Period Title'}
                />
              </div>

              {/* Start Time */}
              <div className="w-28 shrink-0">
                <input
                  type="text"
                  required
                  value={slot.startTime}
                  onChange={(e) => handleUpdatePeriod(idx, 'startTime', e.target.value, activeTab === 'friday')}
                  placeholder="08:00 AM"
                  className="w-full px-2 py-1 border border-slate-200 rounded-lg text-xs font-mono text-center font-bold"
                />
              </div>

              <span className="text-slate-400 font-bold shrink-0">to</span>

              {/* End Time */}
              <div className="w-28 shrink-0">
                <input
                  type="text"
                  required
                  value={slot.endTime}
                  onChange={(e) => handleUpdatePeriod(idx, 'endTime', e.target.value, activeTab === 'friday')}
                  placeholder="08:45 AM"
                  className="w-full px-2 py-1 border border-slate-200 rounded-lg text-xs font-mono text-center font-bold"
                />
              </div>

              {/* Remove Action */}
              <button
                type="button"
                onClick={() => handleRemoveSlot(idx, activeTab === 'friday')}
                className="p-1 text-slate-400 hover:text-rose-600 transition-colors rounded"
                title="Remove slot"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          ))}

          {currentPeriodsList.length === 0 && (
            <div className="p-8 text-center bg-slate-50 border border-dashed rounded-xl text-slate-400">
              No periods configured. Click "+ Add Period" or "Auto-Fill Standards".
            </div>
          )}
        </div>

        {/* Action Controls to Append Slot */}
        <div className="flex items-center gap-2 pt-1 border-t border-slate-100">
          <button
            type="button"
            onClick={() => handleAddSlot(false, activeTab === 'friday')}
            className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold rounded-lg transition-colors flex items-center gap-1.5 text-xs"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Teaching Period</span>
          </button>

          <button
            type="button"
            onClick={() => handleAddSlot(true, activeTab === 'friday')}
            className="px-3 py-1.5 bg-amber-50 hover:bg-amber-100 text-amber-800 font-bold rounded-lg border border-amber-200 transition-colors flex items-center gap-1.5 text-xs"
          >
            <Coffee className="w-3.5 h-3.5 text-amber-700" />
            <span>Add Recess / Lunch Break</span>
          </button>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between pt-3 border-t border-slate-200">
          <span className="text-[11px] text-slate-400">
            Changes apply dynamically to all class and teacher grids for this level and shift.
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
              type="submit"
              className="px-5 py-2 font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl shadow-xs transition-all flex items-center gap-1.5"
            >
              <ShieldCheck className="w-4 h-4" />
              <span>Save Bell Schedule</span>
            </button>
          </div>
        </div>
      </form>
    </Modal>
  )
}

export default BellScheduleModal
