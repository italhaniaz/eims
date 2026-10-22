import React, { useState, useEffect, useMemo } from 'react'
import { 
  X, 
  BookOpen, 
  User, 
  DoorOpen, 
  Clock, 
  Trash2, 
  AlertCircle, 
  Check, 
  ArrowRightLeft, 
  MoveRight,
  ShieldAlert,
  Sparkles,
  Info,
  Calendar,
  Layers,
  GraduationCap
} from 'lucide-react'
import Modal from '../../../components/common/Modal'
import { getCampusRooms } from '../../../constants/campusRooms'
import { 
  checkSlotConflicts, 
  getSubjectColor, 
  calculateSubjectQuotas 
} from './timetableService'

export const AssignSlotModal = ({
  isOpen,
  onClose,
  session = '2026-2027',
  shift = 'Morning',
  day = 'Monday',
  periodNum = 'P1',
  classObj,
  sectionObj,
  currentSlot = null, // null for new, or existing slot object
  workingDays = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
  periods = [],
  teachers = [],
  currentScheduleSlots = {},
  onSaveSlot,
  onDeleteSlot,
  onSwapSlots
}) => {
  const [selectedDay, setSelectedDay] = useState(day)
  const [selectedPeriodNum, setSelectedPeriodNum] = useState(periodNum)
  const [selectedSubjectId, setSelectedSubjectId] = useState('')
  const [selectedTeacherId, setSelectedTeacherId] = useState('')
  const [selectedRoomName, setSelectedRoomName] = useState('')
  const [isDoublePeriod, setIsDoublePeriod] = useState(false)
  const [slotNotes, setSlotNotes] = useState('')

  // Swap / Move Mode
  const [isSwapMode, setIsSwapMode] = useState(false)
  const [swapTargetSlotKey, setSwapTargetSlotKey] = useState('')

  // Conflict validation alerts
  const [conflictError, setConflictError] = useState('')
  const [workloadWarning, setWorkloadWarning] = useState('')
  const [suggestedSubstitute, setSuggestedSubstitute] = useState(null)

  const campusRooms = useMemo(() => getCampusRooms(), [])
  const classSubjects = useMemo(() => Array.isArray(classObj?.subjects) ? classObj.subjects : [], [classObj])

  // Calculate subject quotas for the current class
  const subjectQuotas = useMemo(() => {
    return calculateSubjectQuotas(classObj, currentScheduleSlots)
  }, [classObj, currentScheduleSlots])

  // Filter available teaching periods (exclude breaks)
  const teachingPeriods = useMemo(() => {
    return periods.filter(p => !p.isBreak)
  }, [periods])

  // Populate state on modal open
  useEffect(() => {
    if (isOpen) {
      setSelectedDay(day || workingDays[0] || 'Monday')
      setSelectedPeriodNum(periodNum || teachingPeriods[0]?.num || 'P1')

      if (currentSlot) {
        setSelectedSubjectId(currentSlot.subjectId || '')
        setSelectedTeacherId(currentSlot.teacherId || '')
        setSelectedRoomName(currentSlot.roomName || sectionObj?.roomNo || campusRooms[0]?.name || 'Room 101')
        setIsDoublePeriod(Boolean(currentSlot.isDoublePeriod))
        setSlotNotes(currentSlot.notes || '')
      } else {
        // New slot
        const firstSub = classSubjects[0]
        setSelectedSubjectId(firstSub?.id || '')
        setSelectedTeacherId(sectionObj?.classTeacherId || '')
        setSelectedRoomName(sectionObj?.roomNo || campusRooms[0]?.name || 'Room 101')
        setIsDoublePeriod(false)
        setSlotNotes('')
      }

      setIsSwapMode(false)
      setSwapTargetSlotKey('')
      setConflictError('')
      setWorkloadWarning('')
      setSuggestedSubstitute(null)
    }
  }, [isOpen, day, periodNum, currentSlot, classSubjects, sectionObj, campusRooms, workingDays, teachingPeriods])

  // Check teacher on leave and find proxy suggestion
  useEffect(() => {
    if (!selectedTeacherId) {
      setSuggestedSubstitute(null)
      return
    }

    const tObj = teachers.find(t => t.id === selectedTeacherId)
    if (tObj && tObj.status === 'On Leave') {
      const proxyName = tObj.leaveInfo?.substituteTeacherName || ''
      const proxyObj = teachers.find(t => t.name === proxyName || t.id === tObj.leaveInfo?.substituteTeacherId)
      setSuggestedSubstitute({
        name: proxyName || 'Alternative Faculty',
        id: proxyObj?.id || '',
        reason: tObj.leaveInfo?.leaveType || 'Approved Leave'
      })
    } else {
      setSuggestedSubstitute(null)
    }
  }, [selectedTeacherId, teachers])

  if (!isOpen) return null

  // Current selected subject details
  const currentSelectedSubject = classSubjects.find(s => s.id === selectedSubjectId)
  const quotaForSelectedSubject = subjectQuotas.find(q => q.id === selectedSubjectId)
  const currentSlotKey = `${day}-${periodNum}`

  // Apply suggested substitute teacher
  const handleApplySubstitute = () => {
    if (suggestedSubstitute?.id) {
      setSelectedTeacherId(suggestedSubstitute.id)
    } else if (suggestedSubstitute?.name) {
      const found = teachers.find(t => t.name.toLowerCase().trim() === suggestedSubstitute.name.toLowerCase().trim())
      if (found) setSelectedTeacherId(found.id)
    }
    setConflictError('')
  }

  // Handle Form Submission
  const handleSubmit = (e) => {
    e.preventDefault()
    setConflictError('')
    setWorkloadWarning('')

    if (!selectedSubjectId) {
      setConflictError('Please select a subject from the curriculum.')
      return
    }

    if (!selectedTeacherId) {
      setConflictError('Please designate a teacher in-charge for this period.')
      return
    }

    const subjectObj = classSubjects.find(s => s.id === selectedSubjectId)
    const teacherObj = teachers.find(t => t.id === selectedTeacherId)
    const roomObj = campusRooms.find(r => r.name === selectedRoomName)

    // Check conflicts (Teacher collision, Room collision, Leave verification)
    const checkResult = checkSlotConflicts({
      session,
      shift,
      day: selectedDay,
      periodNum: selectedPeriodNum,
      teacherId: selectedTeacherId,
      teacherName: teacherObj?.name,
      roomId: roomObj?.id || selectedRoomName,
      roomName: selectedRoomName,
      targetClassName: classObj?.name,
      targetSectionName: sectionObj?.name,
      currentSlotKey: currentSlot ? `${currentSlot.day}-${currentSlot.periodNum}` : null,
      teachersList: teachers
    })

    if (checkResult.blocked) {
      setConflictError(checkResult.reasons.join(' '))
      return
    }

    if (checkResult.warnings.length > 0) {
      setWorkloadWarning(checkResult.warnings.join(' '))
    }

    // Check Double Period next slot validity
    let linkedPeriodNum = null
    if (isDoublePeriod) {
      const currentIndex = teachingPeriods.findIndex(p => p.num === selectedPeriodNum)
      if (currentIndex === -1 || currentIndex >= teachingPeriods.length - 1) {
        setConflictError('Double Period cannot be booked on the last period of the day.')
        return
      }
      const nextPeriod = teachingPeriods[currentIndex + 1]
      linkedPeriodNum = nextPeriod.num

      // Check conflict for the second period as well
      const secondCheck = checkSlotConflicts({
        session,
        shift,
        day: selectedDay,
        periodNum: linkedPeriodNum,
        teacherId: selectedTeacherId,
        teacherName: teacherObj?.name,
        roomId: roomObj?.id || selectedRoomName,
        roomName: selectedRoomName,
        targetClassName: classObj?.name,
        targetSectionName: sectionObj?.name,
        currentSlotKey: null,
        teachersList: teachers
      })

      if (secondCheck.blocked) {
        setConflictError(`Double Period conflict on next slot (${linkedPeriodNum}): ${secondCheck.reasons.join(' ')}`)
        return
      }
    }

    // Construct Payload
    const colorObj = getSubjectColor(subjectObj?.name || 'Subject')
    const payload = {
      id: currentSlot?.id || `slot-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      day: selectedDay,
      periodNum: selectedPeriodNum,
      subjectId: selectedSubjectId,
      subjectName: subjectObj?.name || 'Subject',
      teacherId: selectedTeacherId,
      teacherName: teacherObj?.name || 'Teacher',
      roomId: roomObj?.id || selectedRoomName,
      roomName: selectedRoomName || 'Room 101',
      isDoublePeriod,
      linkedPeriodNum,
      notes: slotNotes.trim(),
      color: colorObj
    }

    onSaveSlot(payload)
    onClose()
  }

  // Handle Delete Slot
  const handleDelete = () => {
    if (!currentSlot) return
    if (window.confirm(`Delete scheduled period "${currentSlot.subjectName}" on ${currentSlot.day} (${currentSlot.periodNum})?`)) {
      onDeleteSlot(`${currentSlot.day}-${currentSlot.periodNum}`)
      onClose()
    }
  }

  // Handle Swap Slots
  const handleExecuteSwap = () => {
    if (!swapTargetSlotKey) return
    onSwapSlots(`${currentSlot.day}-${currentSlot.periodNum}`, swapTargetSlotKey)
    onClose()
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={
        <div className="flex items-center justify-between gap-3 pr-6">
          <div className="flex items-center gap-2">
            <Clock className="w-5 h-5 text-emerald-600" />
            <span className="font-bold text-slate-900">
              {currentSlot ? `Edit Scheduled Period: ${currentSlot.subjectName}` : `Schedule Teaching Period Slot`}
            </span>
          </div>
          <span className="text-xs font-mono font-bold px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700 border border-slate-200">
            {classObj?.name} - {sectionObj?.name}
          </span>
        </div>
      }
      maxWidth="max-w-2xl"
    >
      <form onSubmit={handleSubmit} className="space-y-4 text-xs">
        
        {/* Conflict Alert Banner */}
        {conflictError && (
          <div className="p-3 bg-rose-50 border border-rose-200 text-rose-800 rounded-xl space-y-1">
            <div className="flex items-center gap-2 font-bold">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
              <span>Scheduling Conflict Detected</span>
            </div>
            <p className="text-[11px] leading-relaxed">{conflictError}</p>

            {suggestedSubstitute && (
              <div className="mt-2 pt-2 border-t border-rose-200/60 flex items-center justify-between">
                <span className="text-[11px] font-semibold">
                  Substitute Proxy: <strong>{suggestedSubstitute.name}</strong>
                </span>
                <button
                  type="button"
                  onClick={handleApplySubstitute}
                  className="px-2.5 py-1 bg-white hover:bg-rose-100 text-rose-800 font-bold rounded-lg border border-rose-300 text-[10px] transition-colors"
                >
                  Assign Substitute Instead
                </button>
              </div>
            )}
          </div>
        )}

        {/* Workload Warning Banner */}
        {workloadWarning && (
          <div className="p-2.5 bg-amber-50 border border-amber-200 text-amber-800 rounded-xl flex items-center gap-2">
            <Info className="w-4 h-4 text-amber-600 shrink-0" />
            <span className="font-medium text-[11px]">{workloadWarning}</span>
          </div>
        )}

        {/* Swap / Move Toggle (in Edit Mode) */}
        {currentSlot && (
          <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between">
            <span className="font-bold text-slate-700">Rearrange / Swap Period Slot</span>
            <button
              type="button"
              onClick={() => setIsSwapMode(!isSwapMode)}
              className={`px-3 py-1 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                isSwapMode 
                  ? 'bg-blue-600 text-white shadow-2xs' 
                  : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-100'
              }`}
            >
              <ArrowRightLeft className="w-3.5 h-3.5" />
              <span>{isSwapMode ? 'Cancel Swap' : 'Swap with Another Slot'}</span>
            </button>
          </div>
        )}

        {/* Swap Target Selector */}
        {isSwapMode && (
          <div className="p-3 bg-blue-50 border border-blue-200 rounded-xl space-y-2">
            <label className="block text-blue-900 font-bold">Select Target Slot to Swap With:</label>
            <select
              value={swapTargetSlotKey}
              onChange={(e) => setSwapTargetSlotKey(e.target.value)}
              className="w-full px-3 py-2 border border-blue-300 rounded-lg bg-white font-bold text-xs"
            >
              <option value="">-- Choose destination slot to swap --</option>
              {workingDays.map(d => (
                <optgroup key={d} label={d}>
                  {teachingPeriods.map(p => {
                    const key = `${d}-${p.num}`
                    const existing = currentScheduleSlots[key]
                    if (key === currentSlotKey) return null
                    return (
                      <option key={key} value={key}>
                        {d} ({p.num}): {existing ? `${existing.subjectName} (${existing.teacherName})` : '[Empty Slot]'}
                      </option>
                    )
                  })}
                </optgroup>
              ))}
            </select>
            <div className="flex justify-end pt-1">
              <button
                type="button"
                disabled={!swapTargetSlotKey}
                onClick={handleExecuteSwap}
                className="px-4 py-1.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-bold rounded-lg shadow-2xs text-xs"
              >
                Confirm Swap
              </button>
            </div>
          </div>
        )}

        {/* Day & Period Selectors */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-slate-600 font-semibold mb-1">Weekday *</label>
            <select
              disabled={Boolean(currentSlot) && !isSwapMode}
              value={selectedDay}
              onChange={(e) => setSelectedDay(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white font-bold text-slate-800 disabled:bg-slate-100"
            >
              {workingDays.map(d => (
                <option key={d} value={d}>{d}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-slate-600 font-semibold mb-1">Period Slot *</label>
            <select
              disabled={Boolean(currentSlot) && !isSwapMode}
              value={selectedPeriodNum}
              onChange={(e) => setSelectedPeriodNum(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white font-bold text-slate-800 font-mono disabled:bg-slate-100"
            >
              {teachingPeriods.map(p => (
                <option key={p.num} value={p.num}>
                  {p.label || p.num} ({p.startTime} - {p.endTime})
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Subject Selection from Class Subjects */}
        <div>
          <div className="flex items-center justify-between mb-1">
            <label className="block text-slate-600 font-semibold">Subject / Curriculum Course *</label>
            {quotaForSelectedSubject && (
              <span className={`font-mono text-[10px] font-bold px-2 py-0.5 rounded ${
                quotaForSelectedSubject.status === 'over'
                  ? 'bg-amber-100 text-amber-800'
                  : quotaForSelectedSubject.status === 'complete'
                  ? 'bg-emerald-100 text-emerald-800'
                  : 'bg-slate-100 text-slate-600'
              }`}>
                {quotaForSelectedSubject.assigned} of {quotaForSelectedSubject.required} periods scheduled
              </span>
            )}
          </div>

          {classSubjects.length > 0 ? (
            <select
              required
              value={selectedSubjectId}
              onChange={(e) => setSelectedSubjectId(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
            >
              <option value="">-- Select Subject from Curriculum --</option>
              {classSubjects.map(sub => (
                <option key={sub.id} value={sub.id}>
                  {sub.name} (Max: {sub.totalMarks || 100} Marks • Required: {sub.periodsPerWeek || 5} Periods/Wk)
                </option>
              ))}
            </select>
          ) : (
            <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-amber-900 space-y-1">
              <strong className="block font-bold">No Subjects Defined:</strong>
              <p className="text-[11px]">
                This class has no subjects configured in its curriculum. Please add subjects to the class first.
              </p>
              <a href="#inst-classes" className="inline-block mt-1 font-bold underline text-amber-950">
                Go to Classes & Sections to Add Subjects
              </a>
            </div>
          )}
        </div>

        {/* Teacher Selection from Faculty & Staff */}
        <div>
          <div className="flex items-center justify-between mb-1">
            <label className="block text-slate-600 font-semibold">Teacher In-Charge *</label>
            <span className="text-[10px] text-slate-400">Checked against leave & double-booking</span>
          </div>

          {teachers.length > 0 ? (
            <select
              required
              value={selectedTeacherId}
              onChange={(e) => setSelectedTeacherId(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
            >
              <option value="">-- Select Faculty In-Charge --</option>
              {teachers.map(t => {
                const isOnLeave = t.status === 'On Leave'
                return (
                  <option key={t.id} value={t.id} className={isOnLeave ? 'text-rose-600 bg-rose-50' : ''}>
                    {t.name} ({t.empId} • {t.designation || 'Faculty'} • {t.department || 'General'})
                    {isOnLeave ? ` [ON LEAVE: ${t.leaveInfo?.leaveType || 'Approved'}]` : ''}
                  </option>
                )
              })}
            </select>
          ) : (
            <div className="p-2.5 bg-slate-100 rounded-xl text-slate-500">
              No faculty registered in system. Add staff in Faculty & Staff first.
            </div>
          )}
        </div>

        {/* Room Selection from Campus Rooms */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-slate-600 font-semibold mb-1">Classroom / Science Lab *</label>
            <select
              required
              value={selectedRoomName}
              onChange={(e) => setSelectedRoomName(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white font-mono text-slate-900"
            >
              {campusRooms.map(r => (
                <option key={r.id} value={r.name}>
                  {r.name} ({r.floor} • Cap: {r.capacity})
                </option>
              ))}
            </select>
          </div>

          {/* Double Period Toggle */}
          <div className="flex flex-col justify-end">
            <label className="p-2.5 border border-slate-200 rounded-xl bg-slate-50 hover:bg-slate-100/80 cursor-pointer flex items-center gap-2.5 transition-colors">
              <input
                type="checkbox"
                checked={isDoublePeriod}
                onChange={(e) => setIsDoublePeriod(e.target.checked)}
                className="w-4 h-4 text-emerald-600 rounded"
              />
              <div>
                <strong className="block text-slate-800 text-xs">Double Period Slot</strong>
                <span className="text-[10px] text-slate-500 block">Consecutively occupies next period slot (2 × 45m)</span>
              </div>
            </label>
          </div>
        </div>

        {/* Optional Notes */}
        <div>
          <label className="block text-slate-600 font-semibold mb-1">Period Instructions / Notes (Optional)</label>
          <input
            type="text"
            placeholder="e.g. Conduct Physics practicals in Science Lab 1; Bring textbook..."
            value={slotNotes}
            onChange={(e) => setSlotNotes(e.target.value)}
            className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
          />
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-between pt-3 border-t border-slate-100">
          <div>
            {currentSlot && (
              <button
                type="button"
                onClick={handleDelete}
                className="px-3 py-1.5 text-xs font-bold text-rose-600 hover:bg-rose-50 rounded-lg transition-colors flex items-center gap-1"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Remove Slot</span>
              </button>
            )}
          </div>

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
              disabled={classSubjects.length === 0}
              className="px-5 py-2 font-bold text-white bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 rounded-xl shadow-xs transition-all flex items-center gap-1.5"
            >
              <Check className="w-4 h-4" />
              <span>{currentSlot ? 'Save Changes' : 'Confirm Slot'}</span>
            </button>
          </div>
        </div>
      </form>
    </Modal>
  )
}

export default AssignSlotModal
