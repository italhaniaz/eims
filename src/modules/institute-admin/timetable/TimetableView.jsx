import React, { useState, useEffect, useMemo } from 'react'
import { 
  Clock, 
  Plus, 
  Search, 
  Calendar, 
  BookOpen, 
  User, 
  DoorOpen, 
  Printer, 
  CheckCircle2, 
  Layers, 
  Star,
  Users,
  Lock,
  Unlock,
  Copy,
  History,
  RotateCcw,
  Sparkles,
  AlertCircle,
  FileSpreadsheet,
  ChevronRight,
  ShieldCheck,
  Building2,
  GraduationCap,
  ArrowRight,
  UserCheck,
  LayoutGrid
} from 'lucide-react'
import { useAppData } from '../../../context/AppDataContext'
import { normalizeClassSections } from '../../../constants/academicLevels'
import { getCampusRooms } from '../../../constants/campusRooms'
import { 
  getBellSchedule, 
  hasBellScheduleConfigured,
  getSectionTimetable,
  saveSectionTimetable,
  setTimetablePublishStatus,
  restoreTimetableVersion,
  getAllTimetables,
  getSubjectColor,
  calculateSubjectQuotas,
  getSubstituteAssignments,
  purgeStaleTimetableData
} from './timetableService'
import BellScheduleModal from './BellScheduleModal'
import AssignSlotModal from './AssignSlotModal'
import CopyDayModal from './CopyDayModal'
import SubstituteTeacherModal from './SubstituteTeacherModal'
import TimetableVersionsModal from './TimetableVersionsModal'
import TimetablePrintModal from './TimetablePrintModal'

export const TimetableView = ({ currentInstitute }) => {
  const { 
    classes = [], 
    teachers = [], 
    institutes = [], 
    activeProgramLevel = 'all',
    setActiveProgramLevel 
  } = useAppData()

  // Clean stale legacy demo timetable on load
  useEffect(() => {
    purgeStaleTimetableData()
  }, [])

  // Filter classes & teachers for current institute
  const instClasses = useMemo(() => {
    return classes.filter(c => {
      if (!c.instituteId) return true
      if (!currentInstitute?.id) return true
      return c.instituteId === currentInstitute.id || c.instituteId === 'inst-1' || c.instituteId === 'inst-default'
    })
  }, [classes, currentInstitute?.id])

  const instTeachers = useMemo(() => {
    return teachers.filter(t => {
      if (!t.instituteId) return true
      if (!currentInstitute?.id) return true
      return t.instituteId === currentInstitute.id || t.instituteId === 'inst-1' || t.instituteId === 'inst-default'
    })
  }, [teachers, currentInstitute?.id])

  // Academic Sessions Management
  const [sessionsList] = useState(() => {
    try {
      const stored = localStorage.getItem('sms_academic_sessions')
      if (stored) return JSON.parse(stored)
    } catch (e) {}
    return [
      { id: 'sess-curr', name: '2026-2027', isCurrent: true }
    ]
  })

  const currentSession = useMemo(() => {
    const cur = sessionsList.find(s => s.isCurrent)
    return cur ? cur.name : (sessionsList[0]?.name || '2026-2027')
  }, [sessionsList])

  const [selectedSession, setSelectedSession] = useState(currentSession)

  // View Tabs: 'class' | 'teacher' | 'room' | 'whole-school'
  const [activeViewTab, setActiveViewTab] = useState('class')

  // Class and Section selectors start EMPTY (Select class / Select section)
  const [selectedClassName, setSelectedClassName] = useState('')
  const [selectedSectionName, setSelectedSectionName] = useState('')

  // Selected Class Object & its Sections
  const currentClassObj = useMemo(() => {
    if (!selectedClassName) return null
    return instClasses.find(c => c.name.toLowerCase().trim() === selectedClassName.toLowerCase().trim()) || null
  }, [instClasses, selectedClassName])

  const classSections = useMemo(() => {
    if (!currentClassObj) return []
    return normalizeClassSections(currentClassObj)
  }, [currentClassObj])

  // Current Section Object
  const currentSectionObj = useMemo(() => {
    if (!currentClassObj || !selectedSectionName) return null
    return classSections.find(s => s.name.toLowerCase().trim() === selectedSectionName.toLowerCase().trim()) || null
  }, [classSections, selectedSectionName])

  // Program Level & Shift of active class
  const classTier = currentClassObj?.programLevel || 'secondary'
  const classShift = currentSectionObj?.shift || currentClassObj?.shift || 'Morning'

  // Bell Schedule for active class tier & shift
  const [bellScheduleRefreshKey, setBellScheduleRefreshKey] = useState(0)
  const bellSchedule = useMemo(() => {
    return getBellSchedule(classTier, classShift)
  }, [classTier, classShift, bellScheduleRefreshKey])

  const workingDays = useMemo(() => {
    return bellSchedule?.workingDays || ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday']
  }, [bellSchedule])

  const regularPeriods = useMemo(() => {
    return bellSchedule?.periods || []
  }, [bellSchedule])

  // Timetable Record state
  const [timetableRefreshKey, setTimetableRefreshKey] = useState(0)
  const currentTimetableRecord = useMemo(() => {
    if (!selectedClassName || !selectedSectionName) return null
    return getSectionTimetable(selectedSession, selectedClassName, selectedSectionName)
  }, [selectedSession, selectedClassName, selectedSectionName, timetableRefreshKey])

  const isPublished = currentTimetableRecord?.status === 'Published'
  const scheduleSlots = currentTimetableRecord?.slots || {}

  // Active Toast Feedback
  const [toastMessage, setToastMessage] = useState(null)
  const triggerToast = (msg, isError = false) => {
    setToastMessage({ text: msg, isError })
    setTimeout(() => setToastMessage(null), 4000)
  }

  // Modals
  const [isBellModalOpen, setIsBellModalOpen] = useState(false)
  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false)
  const [assignModalTarget, setAssignModalTarget] = useState({ day: 'Monday', periodNum: 'P1', currentSlot: null })
  const [isCopyDayModalOpen, setIsCopyDayModalOpen] = useState(false)
  const [copySourceDay, setCopySourceDay] = useState('Monday')
  const [isSubstituteModalOpen, setIsSubstituteModalOpen] = useState(false)
  const [substituteSlotTarget, setSubstituteSlotTarget] = useState(null)
  const [isVersionsModalOpen, setIsVersionsModalOpen] = useState(false)
  const [isPrintModalOpen, setIsPrintModalOpen] = useState(false)

  // Teacher Schedule View State
  const [selectedTeacherId, setSelectedTeacherId] = useState(instTeachers[0]?.id || '')
  // Room Schedule View State
  const campusRooms = useMemo(() => getCampusRooms(), [])
  const [selectedRoomName, setSelectedRoomName] = useState(campusRooms[0]?.name || 'Room 101')
  // Whole School View State (selected weekday)
  const [wholeSchoolDay, setWholeSchoolDay] = useState('Monday')

  // Subject Quotas for Current Class
  const subjectQuotas = useMemo(() => {
    if (!currentClassObj) return []
    return calculateSubjectQuotas(currentClassObj, scheduleSlots)
  }, [currentClassObj, scheduleSlots])

  // Total periods count vs Free slots
  const totalSlotsCount = Object.keys(scheduleSlots).length
  const totalGridCells = workingDays.length * regularPeriods.filter(p => !p.isBreak).length
  const freeSlotsCount = Math.max(0, totalGridCells - totalSlotsCount)

  // Drag and Drop State
  const [draggedSlotKey, setDraggedSlotKey] = useState(null)

  const handleDragStart = (e, slotKey) => {
    if (isPublished) return
    e.dataTransfer.setData('text/plain', slotKey)
    setDraggedSlotKey(slotKey)
  }

  const handleDragOver = (e) => {
    e.preventDefault()
  }

  const handleDropOnSlot = (e, targetDay, targetPeriodNum) => {
    e.preventDefault()
    if (isPublished) return
    const sourceKey = e.dataTransfer.getData('text/plain') || draggedSlotKey
    if (!sourceKey) return

    const targetKey = `${targetDay}-${targetPeriodNum}`
    if (sourceKey === targetKey) return

    const sourceSlot = scheduleSlots[sourceKey]
    if (!sourceSlot) return

    const targetSlot = scheduleSlots[targetKey]
    const updatedSlots = { ...scheduleSlots }

    if (targetSlot) {
      // Swap
      updatedSlots[sourceKey] = { ...targetSlot, day: sourceSlot.day, periodNum: sourceSlot.periodNum }
      updatedSlots[targetKey] = { ...sourceSlot, day: targetDay, periodNum: targetPeriodNum }
      triggerToast(`Swapped ${sourceSlot.subjectName} with ${targetSlot.subjectName}`)
    } else {
      // Move
      delete updatedSlots[sourceKey]
      updatedSlots[targetKey] = { ...sourceSlot, day: targetDay, periodNum: targetPeriodNum }
      triggerToast(`Moved ${sourceSlot.subjectName} to ${targetDay} (${targetPeriodNum})`)
    }

    saveSectionTimetable(
      selectedSession,
      selectedClassName,
      selectedSectionName,
      { slots: updatedSlots, level: classTier, shift: classShift },
      'Administrator'
    )
    setTimetableRefreshKey(prev => prev + 1)
    setDraggedSlotKey(null)
  }

  // Open Assign Slot Modal
  const handleOpenAssign = (day, periodNum, existingSlot = null) => {
    if (isPublished) {
      triggerToast('Timetable is currently Published and Locked. Unlock timetable to edit.', true)
      return
    }
    setAssignModalTarget({ day, periodNum, currentSlot: existingSlot })
    setIsAssignModalOpen(true)
  }

  // Save Single Slot from Assign Modal
  const handleSaveSlot = (slotData) => {
    const slotKey = `${slotData.day}-${slotData.periodNum}`
    const updatedSlots = {
      ...scheduleSlots,
      [slotKey]: slotData
    }

    // If double period, also link the next period
    if (slotData.isDoublePeriod && slotData.linkedPeriodNum) {
      const nextKey = `${slotData.day}-${slotData.linkedPeriodNum}`
      updatedSlots[nextKey] = {
        ...slotData,
        periodNum: slotData.linkedPeriodNum,
        notes: `Double Period (Part 2 of ${slotData.periodNum})`
      }
    }

    saveSectionTimetable(
      selectedSession,
      selectedClassName,
      selectedSectionName,
      { slots: updatedSlots, level: classTier, shift: classShift },
      'Administrator'
    )
    setTimetableRefreshKey(prev => prev + 1)
    triggerToast(`Scheduled ${slotData.subjectName} for ${slotData.day} (${slotData.periodNum})`)
  }

  // Delete Single Slot
  const handleDeleteSlot = (slotKey) => {
    if (isPublished) return
    const updatedSlots = { ...scheduleSlots }
    const slot = updatedSlots[slotKey]

    // If double period, delete linked part too
    if (slot?.isDoublePeriod && slot?.linkedPeriodNum) {
      delete updatedSlots[`${slot.day}-${slot.linkedPeriodNum}`]
    }

    delete updatedSlots[slotKey]
    saveSectionTimetable(
      selectedSession,
      selectedClassName,
      selectedSectionName,
      { slots: updatedSlots, level: classTier, shift: classShift },
      'Administrator'
    )
    setTimetableRefreshKey(prev => prev + 1)
    triggerToast(`Removed period from routine.`)
  }

  // Swap Two Slots
  const handleSwapSlots = (slotKeyA, slotKeyB) => {
    if (isPublished) return
    const slotA = scheduleSlots[slotKeyA]
    const slotB = scheduleSlots[slotKeyB]
    const updatedSlots = { ...scheduleSlots }

    if (slotA && slotB) {
      const [dayA, pNumA] = slotKeyA.split('-')
      const [dayB, pNumB] = slotKeyB.split('-')
      updatedSlots[slotKeyA] = { ...slotB, day: dayA, periodNum: pNumA }
      updatedSlots[slotKeyB] = { ...slotA, day: dayB, periodNum: pNumB }
    } else if (slotA && !slotB) {
      const [dayB, pNumB] = slotKeyB.split('-')
      delete updatedSlots[slotKeyA]
      updatedSlots[slotKeyB] = { ...slotA, day: dayB, periodNum: pNumB }
    }

    saveSectionTimetable(
      selectedSession,
      selectedClassName,
      selectedSectionName,
      { slots: updatedSlots, level: classTier, shift: classShift },
      'Administrator'
    )
    setTimetableRefreshKey(prev => prev + 1)
    triggerToast(`Swapped slots successfully.`)
  }

  // Execute Day Copy
  const handleExecuteDayCopy = ({ sourceDay, targetDays, sourceSlots, overwriteExisting }) => {
    const updatedSlots = { ...scheduleSlots }

    targetDays.forEach(targetDay => {
      sourceSlots.forEach(slot => {
        const targetKey = `${targetDay}-${slot.periodNum}`
        if (overwriteExisting || !updatedSlots[targetKey]) {
          updatedSlots[targetKey] = {
            ...slot,
            id: `slot-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
            day: targetDay
          }
        }
      })
    })

    saveSectionTimetable(
      selectedSession,
      selectedClassName,
      selectedSectionName,
      { slots: updatedSlots, level: classTier, shift: classShift },
      'Administrator'
    )
    setTimetableRefreshKey(prev => prev + 1)
    triggerToast(`Replicated ${sourceDay} schedule across ${targetDays.join(', ')}!`)
  }

  // Toggle Publish & Lock
  const handleTogglePublish = () => {
    const newStatus = !isPublished
    setTimetablePublishStatus(selectedSession, selectedClassName, selectedSectionName, newStatus, 'Administrator')
    setTimetableRefreshKey(prev => prev + 1)
    triggerToast(newStatus ? 'Timetable has been Published and Locked against edits.' : 'Timetable unlocked for draft edits.')
  }

  // Restore Version
  const handleRestoreVersion = (versionNum) => {
    restoreTimetableVersion(selectedSession, selectedClassName, selectedSectionName, versionNum, 'Administrator')
    setTimetableRefreshKey(prev => prev + 1)
    triggerToast(`Timetable successfully restored to Version ${versionNum}!`)
  }

  // Compute Teacher View Schedule
  const allTimetablesList = useMemo(() => getAllTimetables(), [timetableRefreshKey])
  const activeTeacherSchedule = useMemo(() => {
    if (!selectedTeacherId) return { slots: {}, total: 0 }
    const map = {}
    let count = 0
    allTimetablesList.forEach(t => {
      if ((t.session || '').toLowerCase().trim() !== selectedSession.toLowerCase().trim()) return
      const slots = t.slots || {}
      Object.entries(slots).forEach(([key, slot]) => {
        if (slot.teacherId === selectedTeacherId) {
          map[key] = { ...slot, className: t.className, sectionName: t.sectionName }
          count += slot.isDoublePeriod ? 2 : 1
        }
      })
    })
    return { slots: map, total: count }
  }, [allTimetablesList, selectedTeacherId, selectedSession])

  // Compute Room View Schedule
  const activeRoomSchedule = useMemo(() => {
    if (!selectedRoomName) return { slots: {}, total: 0 }
    const map = {}
    let count = 0
    allTimetablesList.forEach(t => {
      if ((t.session || '').toLowerCase().trim() !== selectedSession.toLowerCase().trim()) return
      const slots = t.slots || {}
      Object.entries(slots).forEach(([key, slot]) => {
        if ((slot.roomName || '').toLowerCase().trim() === selectedRoomName.toLowerCase().trim()) {
          map[key] = { ...slot, className: t.className, sectionName: t.sectionName }
          count++
        }
      })
    })
    return { slots: map, total: count }
  }, [allTimetablesList, selectedRoomName, selectedSession])

  const isUniversity = classTier === 'university'
  const entityTitle = isUniversity ? 'Degree Program' : 'Class'
  const sectionTitle = isUniversity ? 'Batch / Cohort' : 'Section'

  return (
    <div className="p-4 sm:p-6 md:p-8 space-y-6 max-w-7xl mx-auto">
      {/* Toast Notification */}
      {toastMessage && (
        <div className={`px-4 py-3 rounded-xl flex items-center justify-between shadow-xs border animate-in fade-in duration-150 ${
          toastMessage.isError 
            ? 'bg-rose-50 border-rose-200 text-rose-800' 
            : 'bg-emerald-50 border-emerald-200 text-emerald-800'
        }`}>
          <div className="flex items-center gap-2">
            {toastMessage.isError ? <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" /> : <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />}
            <span className="text-xs font-semibold">{toastMessage.text}</span>
          </div>
          <button onClick={() => setToastMessage(null)} className="text-xs underline font-semibold">
            Dismiss
          </button>
        </div>
      )}

      {/* Top Header Card */}
      <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-emerald-600 text-xs font-semibold uppercase tracking-wider">
            <Clock className="w-4 h-4" />
            <span>Academic Routine & Master Schedule</span>
          </div>
          <h1 className="text-2xl font-bold text-slate-900 mt-1 tracking-tight">
            {isUniversity ? 'Lecture & Course Time Management' : 'Class & Section Period Schedule'}
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Dynamic bell timings, conflict validation, faculty workload protection, and institutional timetable publishing.
          </p>
        </div>

        {/* Global Controls & Action Buttons */}
        <div className="flex items-center gap-2.5 flex-wrap w-full md:w-auto">
          {/* Bell Schedule Configuration Button */}
          <button
            onClick={() => setIsBellModalOpen(true)}
            className="flex items-center gap-1.5 px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-xs transition-colors shadow-2xs"
            title="Configure Periods, Timings and Breaks"
          >
            <Clock className="w-3.5 h-3.5 text-slate-600" />
            <span>Bell Schedule Settings</span>
          </button>

          {/* Print & Export Hub */}
          <button
            onClick={() => setIsPrintModalOpen(true)}
            className="flex items-center gap-1.5 px-3 py-2 bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 font-bold rounded-xl text-xs transition-colors shadow-2xs"
            title="Print A4 Timetables or Export CSV"
          >
            <Printer className="w-3.5 h-3.5 text-slate-600" />
            <span>Print & Export</span>
          </button>

          {/* Publish / Lock Button (Admin only) */}
          {selectedClassName && selectedSectionName && (
            <button
              onClick={handleTogglePublish}
              className={`flex items-center gap-1.5 px-3.5 py-2 font-bold rounded-xl text-xs transition-all shadow-2xs ${
                isPublished
                  ? 'bg-amber-500 hover:bg-amber-600 text-white'
                  : 'bg-emerald-600 hover:bg-emerald-700 text-white'
              }`}
              title={isPublished ? 'Unlock timetable for editing' : 'Publish and lock timetable'}
            >
              {isPublished ? <Unlock className="w-3.5 h-3.5" /> : <Lock className="w-3.5 h-3.5" />}
              <span>{isPublished ? 'Unlock Timetable' : 'Publish & Lock'}</span>
            </button>
          )}
        </div>
      </div>

      {/* Main View Mode Tabs */}
      <div className="flex items-center border-b border-slate-200 gap-2 text-xs font-bold text-slate-500">
        <button
          onClick={() => setActiveViewTab('class')}
          className={`pb-3 px-3.5 border-b-2 transition-all flex items-center gap-1.5 ${
            activeViewTab === 'class' ? 'border-emerald-600 text-emerald-800' : 'border-transparent hover:text-slate-900'
          }`}
        >
          <Layers className="w-4 h-4" />
          <span>{entityTitle} Timetable View</span>
        </button>

        <button
          onClick={() => setActiveViewTab('teacher')}
          className={`pb-3 px-3.5 border-b-2 transition-all flex items-center gap-1.5 ${
            activeViewTab === 'teacher' ? 'border-emerald-600 text-emerald-800' : 'border-transparent hover:text-slate-900'
          }`}
        >
          <User className="w-4 h-4" />
          <span>Faculty Weekly Schedule</span>
        </button>

        <button
          onClick={() => setActiveViewTab('room')}
          className={`pb-3 px-3.5 border-b-2 transition-all flex items-center gap-1.5 ${
            activeViewTab === 'room' ? 'border-emerald-600 text-emerald-800' : 'border-transparent hover:text-slate-900'
          }`}
        >
          <DoorOpen className="w-4 h-4" />
          <span>Room Space Occupancy</span>
        </button>

        <button
          onClick={() => setActiveViewTab('whole-school')}
          className={`pb-3 px-3.5 border-b-2 transition-all flex items-center gap-1.5 ${
            activeViewTab === 'whole-school' ? 'border-emerald-600 text-emerald-800' : 'border-transparent hover:text-slate-900'
          }`}
        >
          <LayoutGrid className="w-4 h-4" />
          <span>Whole-School Master Overview</span>
        </button>
      </div>

      {/* TAB 1: CLASS TIMETABLE VIEW */}
      {activeViewTab === 'class' && (
        <div className="space-y-4">
          {/* Class, Section & Session Filter Bar */}
          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-3 flex-wrap">
              {/* Session Indicator */}
              <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-1.5">
                <span className="text-slate-400 font-bold uppercase text-[10px]">Session:</span>
                <span className="font-bold text-slate-800 font-mono">{selectedSession}</span>
              </div>

              {/* Class Selector (Starts on "Select Class") */}
              <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-1.5">
                <span className="text-slate-400 font-bold uppercase text-[10px]">{entityTitle}:</span>
                <select
                  value={selectedClassName}
                  onChange={(e) => {
                    setSelectedClassName(e.target.value)
                    setSelectedSectionName('')
                  }}
                  className="bg-transparent font-bold text-slate-900 focus:outline-none cursor-pointer"
                >
                  <option value="">-- Select {entityTitle} --</option>
                  {instClasses.map(c => (
                    <option key={c.id} value={c.name}>{c.name}</option>
                  ))}
                </select>
              </div>

              {/* Section Selector (Starts on "Select Section") */}
              <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-1.5">
                <span className="text-slate-400 font-bold uppercase text-[10px]">{sectionTitle}:</span>
                <select
                  disabled={!selectedClassName || classSections.length === 0}
                  value={selectedSectionName}
                  onChange={(e) => setSelectedSectionName(e.target.value)}
                  className="bg-transparent font-bold text-emerald-800 focus:outline-none cursor-pointer disabled:text-slate-400"
                >
                  <option value="">-- Select {sectionTitle} --</option>
                  {classSections.map((sec, idx) => (
                    <option key={sec.id || idx} value={sec.name}>{sec.name}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Quick Action Tools */}
            {selectedClassName && selectedSectionName && (
              <div className="flex items-center gap-2">
                {/* Copy Day Routine */}
                <button
                  type="button"
                  disabled={isPublished || totalSlotsCount === 0}
                  onClick={() => setIsCopyDayModalOpen(true)}
                  className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 disabled:opacity-50 text-slate-700 font-bold rounded-lg transition-colors flex items-center gap-1 text-[11px]"
                  title="Copy day routine to other days"
                >
                  <Copy className="w-3.5 h-3.5 text-slate-500" />
                  <span>Copy Day Routine</span>
                </button>

                {/* Revision History */}
                <button
                  type="button"
                  onClick={() => setIsVersionsModalOpen(true)}
                  className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-lg transition-colors flex items-center gap-1 text-[11px]"
                  title="View revision versions & rollback"
                >
                  <History className="w-3.5 h-3.5 text-slate-500" />
                  <span>History ({currentTimetableRecord?.versions?.length || 1})</span>
                </button>
              </div>
            )}
          </div>

          {/* EMPTY STATE 1: No Classes Exist */}
          {instClasses.length === 0 && (
            <div className="p-12 bg-white rounded-2xl border border-slate-200 text-center space-y-3">
              <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center mx-auto">
                <School className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-slate-900">Create a class first</h3>
              <p className="text-xs text-slate-500 max-w-md mx-auto">
                No educational classes have been configured yet. Set up classes, sections, and curriculum subjects in Classes & Sections before scheduling routines.
              </p>
              <div>
                <a
                  href="#inst-classes"
                  className="inline-flex items-center gap-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-all shadow-sm"
                >
                  <span>Go to Classes & Sections</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </a>
              </div>
            </div>
          )}

          {/* EMPTY STATE 2: Classes Exist but No Class Selected */}
          {instClasses.length > 0 && !selectedClassName && (
            <div className="p-12 bg-slate-50 rounded-2xl border border-dashed border-slate-200 text-center space-y-2">
              <Clock className="w-8 h-8 text-slate-400 mx-auto" />
              <h3 className="text-sm font-bold text-slate-700">Select a Class to View Routine</h3>
              <p className="text-xs text-slate-400">
                Choose an educational class and section from the dropdown above to view or build its timetable.
              </p>
            </div>
          )}

          {/* EMPTY STATE 3: Class Selected but No Section Selected */}
          {selectedClassName && !selectedSectionName && (
            <div className="p-8 bg-slate-50 rounded-2xl border border-dashed border-slate-200 text-center space-y-2">
              <Layers className="w-7 h-7 text-emerald-600 mx-auto" />
              <h3 className="text-sm font-bold text-slate-700">Select a Section</h3>
              <p className="text-xs text-slate-400">
                Please pick a specific section of {selectedClassName} to access its period schedule.
              </p>
            </div>
          )}

          {/* EMPTY STATE 4: No Bell Schedule Configured for this Tier/Shift */}
          {selectedClassName && selectedSectionName && !bellSchedule && (
            <div className="p-10 bg-amber-50/80 border border-amber-200 rounded-2xl text-center space-y-3">
              <Clock className="w-8 h-8 text-amber-600 mx-auto" />
              <h3 className="text-base font-bold text-amber-900">Set up bell schedule</h3>
              <p className="text-xs text-amber-800 max-w-md mx-auto">
                No active bell schedule exists for <strong>{classTier}</strong> in the <strong>{classShift}</strong> shift. Set up periods, start/end timings, and recess breaks before the timetable grid can appear.
              </p>
              <button
                type="button"
                onClick={() => setIsBellModalOpen(true)}
                className="px-5 py-2.5 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs font-bold shadow-sm transition-all inline-flex items-center gap-1.5"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>Configure Bell Schedule</span>
              </button>
            </div>
          )}

          {/* ACTIVE ROUTINE DETAILS & GRID */}
          {selectedClassName && selectedSectionName && bellSchedule && (
            <>
              {/* Active Routine Info Banner */}
              <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 text-xs">
                <div className="flex items-center gap-2.5 flex-wrap">
                  <span className="font-bold text-slate-800 flex items-center gap-1.5">
                    <Layers className="w-4 h-4 text-emerald-600" />
                    <span>Active Routine: {selectedClassName} ({selectedSectionName})</span>
                  </span>
                  <span>•</span>
                  <span className="text-slate-600">
                    Room: <strong className="font-mono text-slate-800">{currentSectionObj?.roomNo || 'Room 101'}</strong>
                  </span>
                  <span>•</span>
                  <span className="text-slate-600">
                    In-Charge: <strong className="text-slate-800">{currentSectionObj?.classTeacherName || currentClassObj?.classTeacher || 'Teacher In-Charge'}</strong>
                  </span>
                  <span>•</span>
                  <span className="text-slate-500 font-mono">
                    Shift: {classShift}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  {/* Published State Badge */}
                  <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold flex items-center gap-1 border ${
                    isPublished 
                      ? 'bg-emerald-50 text-emerald-800 border-emerald-200' 
                      : 'bg-amber-50 text-amber-800 border-amber-200'
                  }`}>
                    {isPublished ? <Lock className="w-3 h-3 text-emerald-600" /> : <Unlock className="w-3 h-3 text-amber-600" />}
                    <span>{isPublished ? 'Published & Locked' : 'Draft Mode'}</span>
                  </span>

                  <span className="text-[11px] font-mono text-slate-400">
                    {totalSlotsCount} Scheduled • {freeSlotsCount} Free
                  </span>
                </div>
              </div>

              {/* TIMETABLE GRID */}
              <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs min-w-[750px]">
                    <thead className="bg-slate-50 text-slate-700 uppercase font-bold border-b border-slate-200 text-[11px]">
                      <tr>
                        <th className="p-3 w-28">Weekday</th>
                        {regularPeriods.map(p => (
                          <th 
                            key={p.num} 
                            className={`p-3 text-center border-l border-slate-200 ${
                              p.isBreak ? 'bg-amber-50/70 text-amber-800' : ''
                            }`}
                          >
                            <span className="block font-bold">{p.num}</span>
                            <span className="text-[9px] font-normal text-slate-400 font-mono block">
                              {p.startTime} - {p.endTime}
                            </span>
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {workingDays.map(day => {
                        const isFriday = day === 'Friday' && bellSchedule.hasFridaySpecial && bellSchedule.fridayPeriods?.length > 0
                        const periodsToRender = isFriday ? bellSchedule.fridayPeriods : regularPeriods

                        return (
                          <tr key={day} className="hover:bg-slate-50/40 transition-colors">
                            <td className="p-3 font-bold text-slate-800 bg-slate-50/50 align-top">
                              <span>{day}</span>
                              {isFriday && (
                                <span className="block text-[9px] font-normal text-amber-700 font-mono">Special Friday</span>
                              )}
                            </td>

                            {periodsToRender.map(p => {
                              if (p.isBreak) {
                                return (
                                  <td 
                                    key={p.num} 
                                    className="p-2.5 text-center bg-amber-50/40 border-l border-slate-100 font-bold text-[10px] text-amber-800 align-middle"
                                  >
                                    <div className="flex flex-col items-center justify-center">
                                      <span>{p.breakName || p.label}</span>
                                      <span className="text-[8px] font-mono text-amber-600">{p.startTime}-{p.endTime}</span>
                                    </div>
                                  </td>
                                )
                              }

                              const slotKey = `${day}-${p.num}`
                              const slot = scheduleSlots[slotKey]

                              return (
                                <td 
                                  key={p.num} 
                                  onDragOver={handleDragOver}
                                  onDrop={(e) => handleDropOnSlot(e, day, p.num)}
                                  className="p-1.5 border-l border-slate-100 text-center align-top min-w-[110px]"
                                >
                                  {slot ? (
                                    <div
                                      draggable={!isPublished}
                                      onDragStart={(e) => handleDragStart(e, slotKey)}
                                      onClick={() => handleOpenAssign(day, p.num, slot)}
                                      className={`p-2 rounded-xl border text-left transition-all cursor-pointer shadow-2xs group relative ${
                                        slot.color?.bg || 'bg-emerald-50'
                                      } ${slot.color?.border || 'border-emerald-200'}`}
                                    >
                                      <div className="flex items-start justify-between gap-1">
                                        <strong className="text-slate-900 font-bold block leading-tight text-xs truncate">
                                          {slot.subjectName}
                                        </strong>
                                        {slot.isDoublePeriod && (
                                          <span className="px-1 py-0.2 rounded font-mono text-[9px] bg-purple-100 text-purple-700 font-bold">
                                            2×
                                          </span>
                                        )}
                                      </div>

                                      <div className="mt-1 space-y-0.5">
                                        <span className="text-[10px] text-slate-700 font-semibold block truncate">
                                          {slot.teacherName}
                                        </span>
                                        <div className="flex items-center justify-between text-[9px] text-slate-400 font-mono">
                                          <span>{slot.roomName}</span>
                                          {slot.notes && <span title={slot.notes}>📝</span>}
                                        </div>
                                      </div>

                                      {/* Quick Proxy Substitute Trigger */}
                                      <button
                                        type="button"
                                        onClick={(e) => {
                                          e.stopPropagation()
                                          setSubstituteSlotTarget(slot)
                                          setIsSubstituteModalOpen(true)
                                        }}
                                        className="mt-1.5 w-full py-0.5 text-[9px] font-bold text-slate-500 hover:text-emerald-700 bg-white/70 hover:bg-white rounded border border-slate-200/60 transition-colors text-center"
                                        title="Assign daily substitute / proxy cover"
                                      >
                                        Proxy Cover
                                      </button>
                                    </div>
                                  ) : (
                                    <button
                                      type="button"
                                      disabled={isPublished}
                                      onClick={() => handleOpenAssign(day, p.num, null)}
                                      className="w-full py-4 text-[10px] text-slate-400 hover:text-emerald-700 hover:bg-slate-50 disabled:cursor-not-allowed disabled:hover:bg-transparent disabled:hover:text-slate-400 rounded-lg border border-dashed border-slate-200 hover:border-emerald-300 transition-all font-semibold"
                                    >
                                      + Slot
                                    </button>
                                  )}
                                </td>
                              )
                            })}
                          </tr>
                        )
                      })}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* CURRICULUM SUBJECT QUOTA STATUS & DYNAMIC COLOR LEGEND */}
              <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-2xs space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="font-bold text-slate-800 uppercase tracking-wider text-[11px] block">
                      Curriculum Subject Allocation Status & Visual Legend
                    </span>
                    <span className="text-[10px] text-slate-400">
                      Required weekly teaching periods configured in class curriculum vs scheduled slots
                    </span>
                  </div>

                  <span className="font-mono text-xs font-bold text-slate-700">
                    {subjectQuotas.filter(q => q.status === 'complete').length} of {subjectQuotas.length} Subjects Complete
                  </span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2.5">
                  {subjectQuotas.map(q => {
                    const color = getSubjectColor(q.name)
                    return (
                      <div 
                        key={q.id}
                        className={`p-2.5 rounded-xl border flex items-center justify-between gap-2 ${color.bg} ${color.border}`}
                      >
                        <div className="truncate">
                          <strong className="block text-slate-900 font-bold text-xs truncate">{q.name}</strong>
                          <span className="text-[10px] text-slate-500 font-mono">
                            {q.assigned} / {q.required} Periods
                          </span>
                        </div>

                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold shrink-0 ${
                          q.status === 'complete' 
                            ? 'bg-emerald-100 text-emerald-800' 
                            : q.status === 'over' 
                            ? 'bg-rose-100 text-rose-800' 
                            : 'bg-amber-100 text-amber-800'
                        }`}>
                          {q.status === 'complete' ? 'Completed' : q.status === 'over' ? `+${q.assigned - q.required} Over` : `${q.remaining} Left`}
                        </span>
                      </div>
                    )
                  })}
                </div>
              </div>
            </>
          )}
        </div>
      )}

      {/* TAB 2: TEACHER WEEKLY SCHEDULE VIEW */}
      {activeViewTab === 'teacher' && (
        <div className="space-y-4">
          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-3">
              <span className="font-bold text-slate-600 uppercase text-[10px]">Select Faculty Member:</span>
              <select
                value={selectedTeacherId}
                onChange={(e) => setSelectedTeacherId(e.target.value)}
                className="px-3 py-1.5 rounded-xl border border-slate-200 bg-white font-bold text-slate-900 focus:outline-none"
              >
                {instTeachers.map(t => (
                  <option key={t.id} value={t.id}>
                    {t.name} ({t.empId} • {t.department || 'Faculty'})
                  </option>
                ))}
              </select>
            </div>

            <div className="flex items-center gap-3 font-mono text-xs">
              <span className="font-bold text-slate-800">
                Weekly Total: <strong>{activeTeacherSchedule.total} Periods</strong>
              </span>
              <span>•</span>
              <span className={`px-2 py-0.5 rounded font-bold ${
                activeTeacherSchedule.total >= 24 ? 'bg-amber-100 text-amber-800' : 'bg-emerald-100 text-emerald-800'
              }`}>
                {activeTeacherSchedule.total >= 24 ? 'Heavy Workload' : 'Normal Load'}
              </span>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs min-w-[700px]">
                <thead className="bg-slate-50 text-slate-700 uppercase font-bold border-b border-slate-200 text-[11px]">
                  <tr>
                    <th className="p-3 w-28">Weekday</th>
                    {regularPeriods.map(p => (
                      <th key={p.num} className="p-3 text-center border-l border-slate-200">
                        <span className="block font-bold">{p.num}</span>
                        <span className="text-[9px] font-normal text-slate-400 font-mono block">{p.startTime}-{p.endTime}</span>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {workingDays.map(day => (
                    <tr key={day} className="hover:bg-slate-50/40">
                      <td className="p-3 font-bold text-slate-800 bg-slate-50/50">{day}</td>
                      {regularPeriods.map(p => {
                        if (p.isBreak) {
                          return (
                            <td key={p.num} className="p-2 text-center bg-amber-50/30 border-l font-bold text-[10px] text-amber-800">
                              {p.label}
                            </td>
                          )
                        }
                        const key = `${day}-${p.num}`
                        const slot = activeTeacherSchedule.slots[key]
                        return (
                          <td key={p.num} className="p-2 border-l border-slate-100 text-center align-top min-w-[100px]">
                            {slot ? (
                              <div className="p-2 rounded-xl bg-emerald-50 border border-emerald-200 text-left">
                                <strong className="block text-slate-900 font-bold text-xs truncate">{slot.subjectName}</strong>
                                <span className="block text-[10px] text-emerald-800 font-semibold">{slot.className} ({slot.sectionName})</span>
                                <span className="block text-[9px] text-slate-400 font-mono">{slot.roomName}</span>
                              </div>
                            ) : (
                              <span className="text-slate-300 font-mono text-xs">Free</span>
                            )}
                          </td>
                        )
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: ROOM OCCUPANCY VIEW */}
      {activeViewTab === 'room' && (
        <div className="space-y-4">
          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-3">
              <span className="font-bold text-slate-600 uppercase text-[10px]">Select Classroom / Space:</span>
              <select
                value={selectedRoomName}
                onChange={(e) => setSelectedRoomName(e.target.value)}
                className="px-3 py-1.5 rounded-xl border border-slate-200 bg-white font-bold text-slate-900 focus:outline-none"
              >
                {campusRooms.map(r => (
                  <option key={r.id} value={r.name}>
                    {r.name} ({r.floor} • Cap: {r.capacity})
                  </option>
                ))}
              </select>
            </div>

            <div className="font-mono text-xs font-bold text-slate-800">
              Total Occupancy: {activeRoomSchedule.total} Periods Booked
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs min-w-[700px]">
                <thead className="bg-slate-50 text-slate-700 uppercase font-bold border-b border-slate-200 text-[11px]">
                  <tr>
                    <th className="p-3 w-28">Weekday</th>
                    {regularPeriods.map(p => (
                      <th key={p.num} className="p-3 text-center border-l border-slate-200">
                        <span className="block font-bold">{p.num}</span>
                        <span className="text-[9px] font-normal text-slate-400 font-mono block">{p.startTime}-{p.endTime}</span>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {workingDays.map(day => (
                    <tr key={day} className="hover:bg-slate-50/40">
                      <td className="p-3 font-bold text-slate-800 bg-slate-50/50">{day}</td>
                      {regularPeriods.map(p => {
                        if (p.isBreak) {
                          return (
                            <td key={p.num} className="p-2 text-center bg-amber-50/30 border-l font-bold text-[10px] text-amber-800">
                              {p.label}
                            </td>
                          )
                        }
                        const key = `${day}-${p.num}`
                        const slot = activeRoomSchedule.slots[key]
                        return (
                          <td key={p.num} className="p-2 border-l border-slate-100 text-center align-top min-w-[100px]">
                            {slot ? (
                              <div className="p-2 rounded-xl bg-blue-50 border border-blue-200 text-left">
                                <strong className="block text-slate-900 font-bold text-xs truncate">{slot.subjectName}</strong>
                                <span className="block text-[10px] text-blue-800 font-semibold">{slot.className} - {slot.sectionName}</span>
                                <span className="block text-[9px] text-slate-500">{slot.teacherName}</span>
                              </div>
                            ) : (
                              <span className="text-emerald-700 font-bold text-xs">Available</span>
                            )}
                          </td>
                        )
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: WHOLE-SCHOOL MASTER OVERVIEW */}
      {activeViewTab === 'whole-school' && (
        <div className="space-y-4">
          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs flex items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-3">
              <span className="font-bold text-slate-600 uppercase text-[10px]">Choose Weekday to Inspect:</span>
              <select
                value={wholeSchoolDay}
                onChange={(e) => setWholeSchoolDay(e.target.value)}
                className="px-3 py-1.5 rounded-xl border border-slate-200 bg-white font-bold text-slate-900 focus:outline-none"
              >
                {workingDays.map(d => (
                  <option key={d} value={d}>{d}</option>
                ))}
              </select>
            </div>

            <span className="font-mono text-xs text-slate-500">
              Showing cross-class period allocation matrix
            </span>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs min-w-[700px]">
                <thead className="bg-slate-50 text-slate-700 uppercase font-bold border-b border-slate-200 text-[11px]">
                  <tr>
                    <th className="p-3 w-40">Class & Section</th>
                    {regularPeriods.filter(p => !p.isBreak).map(p => (
                      <th key={p.num} className="p-3 text-center border-l border-slate-200">
                        <span className="block font-bold">{p.num}</span>
                        <span className="text-[9px] font-mono font-normal text-slate-400 block">{p.startTime}-{p.endTime}</span>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {allTimetablesList.filter(t => (t.session || '').toLowerCase().trim() === selectedSession.toLowerCase().trim()).map(t => (
                    <tr key={t.id} className="hover:bg-slate-50/40">
                      <td className="p-3 font-bold text-slate-800 bg-slate-50/50">
                        <span className="block">{t.className}</span>
                        <span className="text-[10px] text-emerald-700 font-semibold">{t.sectionName}</span>
                      </td>

                      {regularPeriods.filter(p => !p.isBreak).map(p => {
                        const key = `${wholeSchoolDay}-${p.num}`
                        const slot = (t.slots || {})[key]
                        return (
                          <td key={p.num} className="p-2 border-l border-slate-100 text-center align-top">
                            {slot ? (
                              <div className="p-1.5 rounded-lg bg-slate-50 border border-slate-200 text-left">
                                <strong className="block text-slate-900 text-[11px] truncate">{slot.subjectName}</strong>
                                <span className="block text-[9px] text-slate-500 truncate">{slot.teacherName}</span>
                                <span className="block text-[8px] font-mono text-slate-400">{slot.roomName}</span>
                              </div>
                            ) : (
                              <span className="text-slate-300 font-mono text-[10px]">—</span>
                            )}
                          </td>
                        )
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* MODALS */}
      {/* 1. Bell Schedule Settings Modal */}
      {isBellModalOpen && (
        <BellScheduleModal
          isOpen={isBellModalOpen}
          onClose={() => setIsBellModalOpen(false)}
          currentLevel={classTier}
          currentShift={classShift}
          onScheduleSaved={(saved) => {
            setBellScheduleRefreshKey(prev => prev + 1)
            triggerToast('Bell Schedule successfully saved!')
          }}
        />
      )}

      {/* 2. Assign / Edit Period Slot Modal */}
      {isAssignModalOpen && (
        <AssignSlotModal
          isOpen={isAssignModalOpen}
          onClose={() => setIsAssignModalOpen(false)}
          session={selectedSession}
          shift={classShift}
          day={assignModalTarget.day}
          periodNum={assignModalTarget.periodNum}
          classObj={currentClassObj}
          sectionObj={currentSectionObj}
          currentSlot={assignModalTarget.currentSlot}
          workingDays={workingDays}
          periods={regularPeriods}
          teachers={instTeachers}
          currentScheduleSlots={scheduleSlots}
          onSaveSlot={handleSaveSlot}
          onDeleteSlot={handleDeleteSlot}
          onSwapSlots={handleSwapSlots}
        />
      )}

      {/* 3. Replicate / Copy Day Modal */}
      {isCopyDayModalOpen && (
        <CopyDayModal
          isOpen={isCopyDayModalOpen}
          onClose={() => setIsCopyDayModalOpen(false)}
          session={selectedSession}
          shift={classShift}
          sourceDay={copySourceDay}
          workingDays={workingDays}
          currentScheduleSlots={scheduleSlots}
          className={selectedClassName}
          sectionName={selectedSectionName}
          teachers={instTeachers}
          onExecuteCopy={handleExecuteDayCopy}
        />
      )}

      {/* 4. Substitute Teacher Modal */}
      {isSubstituteModalOpen && (
        <SubstituteTeacherModal
          isOpen={isSubstituteModalOpen}
          onClose={() => setIsSubstituteModalOpen(false)}
          session={selectedSession}
          className={selectedClassName}
          sectionName={selectedSectionName}
          slotData={substituteSlotTarget}
          teachers={instTeachers}
          onSubstituteAssigned={(record) => {
            triggerToast(`Proxy cover assigned to ${record.substituteTeacherName}!`)
          }}
        />
      )}

      {/* 5. Revision Versions History Modal */}
      {isVersionsModalOpen && (
        <TimetableVersionsModal
          isOpen={isVersionsModalOpen}
          onClose={() => setIsVersionsModalOpen(false)}
          className={selectedClassName}
          sectionName={selectedSectionName}
          versions={currentTimetableRecord?.versions || []}
          currentSlotCount={totalSlotsCount}
          onRestoreVersion={handleRestoreVersion}
        />
      )}

      {/* 6. Print & Export Modal */}
      {isPrintModalOpen && (
        <TimetablePrintModal
          isOpen={isPrintModalOpen}
          onClose={() => setIsPrintModalOpen(false)}
          currentInstitute={currentInstitute}
          session={selectedSession}
          className={selectedClassName}
          sectionName={selectedSectionName}
          currentClassObj={currentClassObj}
          currentSectionObj={currentSectionObj}
          workingDays={workingDays}
          periods={regularPeriods}
          currentScheduleSlots={scheduleSlots}
          teachers={instTeachers}
        />
      )}
    </div>
  )
}

export default TimetableView
