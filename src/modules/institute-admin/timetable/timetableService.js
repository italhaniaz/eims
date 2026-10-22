/**
 * Timetable Domain Service & Local Storage Store
 * Manages Bell Schedules, Class Timetables, Slot Assignments,
 * Conflict Guards, Leave Verifications, Versions & Substitutes.
 */

const STORAGE_KEY_TIMETABLES = 'sms_timetables_v2'
const STORAGE_KEY_BELL_SCHEDULES = 'sms_bell_schedules_v2'
const STORAGE_KEY_SUBSTITUTES = 'sms_timetable_substitutes_v2'

// Subject color palette for distinct visual timetable cards and legends
const SUBJECT_COLORS = [
  { bg: 'bg-emerald-50', border: 'border-emerald-200', text: 'text-emerald-900', badge: 'bg-emerald-600', pill: 'text-emerald-700 bg-emerald-100/60' },
  { bg: 'bg-blue-50', border: 'border-blue-200', text: 'text-blue-900', badge: 'bg-blue-600', pill: 'text-blue-700 bg-blue-100/60' },
  { bg: 'bg-purple-50', border: 'border-purple-200', text: 'text-purple-900', badge: 'bg-purple-600', pill: 'text-purple-700 bg-purple-100/60' },
  { bg: 'bg-amber-50', border: 'border-amber-200', text: 'text-amber-900', badge: 'bg-amber-600', pill: 'text-amber-700 bg-amber-100/60' },
  { bg: 'bg-rose-50', border: 'border-rose-200', text: 'text-rose-900', badge: 'bg-rose-600', pill: 'text-rose-700 bg-rose-100/60' },
  { bg: 'bg-cyan-50', border: 'border-cyan-200', text: 'text-cyan-900', badge: 'bg-cyan-600', pill: 'text-cyan-700 bg-cyan-100/60' },
  { bg: 'bg-indigo-50', border: 'border-indigo-200', text: 'text-indigo-900', badge: 'bg-indigo-600', pill: 'text-indigo-700 bg-indigo-100/60' },
  { bg: 'bg-teal-50', border: 'border-teal-200', text: 'text-teal-900', badge: 'bg-teal-600', pill: 'text-teal-700 bg-teal-100/60' },
  { bg: 'bg-orange-50', border: 'border-orange-200', text: 'text-orange-900', badge: 'bg-orange-600', pill: 'text-orange-700 bg-orange-100/60' }
]

export const getSubjectColor = (subjectName = '') => {
  if (!subjectName) return SUBJECT_COLORS[0]
  let hash = 0
  const clean = subjectName.trim().toLowerCase()
  for (let i = 0; i < clean.length; i++) {
    hash = (hash << 5) - hash + clean.charCodeAt(i)
    hash |= 0
  }
  const index = Math.abs(hash) % SUBJECT_COLORS.length
  return SUBJECT_COLORS[index]
}

// Default standard Bell Schedule template generator
export const createDefaultBellSchedule = (level = 'secondary', shift = 'Morning') => {
  const isCollege = level === 'college' || level === 'university'
  const isEvening = shift === 'Evening'

  const startHour = isEvening ? 13 : 8
  const baseWorkingDays = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']

  return {
    id: `sched-${level}-${shift}`,
    level,
    shift,
    workingDays: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
    periodsCount: 6,
    hasFridaySpecial: true,
    fridayWorkingDays: ['Friday'],
    periods: [
      { id: 'p1', num: 'P1', label: 'Period 1', startTime: isEvening ? '01:00 PM' : '08:00 AM', endTime: isEvening ? '01:45 PM' : '08:45 AM', isBreak: false },
      { id: 'p2', num: 'P2', label: 'Period 2', startTime: isEvening ? '01:45 PM' : '08:45 AM', endTime: isEvening ? '02:30 PM' : '09:30 AM', isBreak: false },
      { id: 'p3', num: 'P3', label: 'Period 3', startTime: isEvening ? '02:30 PM' : '09:30 AM', endTime: isEvening ? '03:15 PM' : '10:15 AM', isBreak: false },
      { id: 'brk-1', num: 'BREAK', label: 'Recess Break', breakName: 'Recess Break', startTime: isEvening ? '03:15 PM' : '10:15 AM', endTime: isEvening ? '03:45 PM' : '10:45 AM', isBreak: true },
      { id: 'p4', num: 'P4', label: 'Period 4', startTime: isEvening ? '03:45 PM' : '10:45 AM', endTime: isEvening ? '04:30 PM' : '11:30 AM', isBreak: false },
      { id: 'p5', num: 'P5', label: 'Period 5', startTime: isEvening ? '04:30 PM' : '11:30 AM', endTime: isEvening ? '05:15 PM' : '12:15 PM', isBreak: false },
      { id: 'p6', num: 'P6', label: 'Period 6', startTime: isEvening ? '05:15 PM' : '12:15 PM', endTime: isEvening ? '06:00 PM' : '01:00 PM', isBreak: false }
    ],
    fridayPeriods: [
      { id: 'fp1', num: 'P1', label: 'Period 1', startTime: isEvening ? '01:00 PM' : '08:00 AM', endTime: isEvening ? '01:35 PM' : '08:35 AM', isBreak: false },
      { id: 'fp2', num: 'P2', label: 'Period 2', startTime: isEvening ? '01:35 PM' : '08:35 AM', endTime: isEvening ? '02:10 PM' : '09:10 AM', isBreak: false },
      { id: 'fp3', num: 'P3', label: 'Period 3', startTime: isEvening ? '02:10 PM' : '09:10 AM', endTime: isEvening ? '02:45 PM' : '09:45 AM', isBreak: false },
      { id: 'fbrk-1', num: 'BREAK', label: 'Short Break', breakName: 'Morning Assembly & Break', startTime: isEvening ? '02:45 PM' : '09:45 AM', endTime: isEvening ? '03:00 PM' : '10:05 AM', isBreak: true },
      { id: 'fp4', num: 'P4', label: 'Period 4', startTime: isEvening ? '03:00 PM' : '10:05 AM', endTime: isEvening ? '03:35 PM' : '10:40 AM', isBreak: false },
      { id: 'fp5', num: 'P5', label: 'Period 5', startTime: isEvening ? '03:35 PM' : '10:40 AM', endTime: isEvening ? '04:10 PM' : '11:15 AM', isBreak: false },
      { id: 'fbrk-jummah', num: 'JUMMAH', label: 'Jummah Break', breakName: 'Jummah Prayer Break', startTime: isEvening ? '04:10 PM' : '11:15 AM', endTime: isEvening ? '04:45 PM' : '12:30 PM', isBreak: true }
    ],
    updatedAt: new Date().toISOString()
  }
}

// Sanitizes any legacy demo data from localStorage
export const purgeStaleTimetableData = () => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_TIMETABLES)
    if (raw && (raw.includes('Prof. Tariq') || raw.includes('Dr. Fatima') || raw.includes('Qari Sb') || raw.includes('Library / Reading'))) {
      localStorage.removeItem(STORAGE_KEY_TIMETABLES)
    }
    // Also remove legacy keys if present
    localStorage.removeItem('sms_schedule_store')
    localStorage.removeItem('timetableStore')
  } catch (e) {}
}

export const getStoredBellSchedules = () => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_BELL_SCHEDULES)
    if (raw) {
      const parsed = JSON.parse(raw)
      if (typeof parsed === 'object' && parsed !== null) return parsed
    }
  } catch (e) {}
  return {}
}

export const saveBellSchedule = (level, shift, schedule) => {
  const store = getStoredBellSchedules()
  const key = `${level || 'secondary'}_${shift || 'Morning'}`
  store[key] = {
    ...schedule,
    level,
    shift,
    updatedAt: new Date().toISOString()
  }
  try {
    localStorage.setItem(STORAGE_KEY_BELL_SCHEDULES, JSON.stringify(store))
  } catch (e) {}
  return store[key]
}

export const getBellSchedule = (level = 'secondary', shift = 'Morning') => {
  const store = getStoredBellSchedules()
  const key = `${level}_${shift}`
  if (store[key]) return store[key]

  // Fallback to any matching level
  const anyMatchingLevel = Object.values(store).find(s => s.level === level)
  if (anyMatchingLevel) return anyMatchingLevel

  // Check generic default
  if (store['default']) return store['default']

  return null
}

export const hasBellScheduleConfigured = (level = 'secondary', shift = 'Morning') => {
  const store = getStoredBellSchedules()
  const key = `${level}_${shift}`
  return Boolean(store[key] || Object.keys(store).length > 0)
}

// Timetables Repository
export const getAllTimetables = () => {
  purgeStaleTimetableData()
  try {
    const raw = localStorage.getItem(STORAGE_KEY_TIMETABLES)
    if (raw) {
      const parsed = JSON.parse(raw)
      if (Array.isArray(parsed)) return parsed
    }
  } catch (e) {}
  return []
}

export const saveAllTimetables = (timetablesList = []) => {
  try {
    localStorage.setItem(STORAGE_KEY_TIMETABLES, JSON.stringify(timetablesList))
  } catch (e) {}
}

export const getSectionTimetable = (session, className, sectionName) => {
  if (!session || !className || !sectionName) return null
  const all = getAllTimetables()
  return all.find(t => 
    (t.session || '').toLowerCase().trim() === session.toLowerCase().trim() &&
    (t.className || '').toLowerCase().trim() === className.toLowerCase().trim() &&
    (t.sectionName || '').toLowerCase().trim() === sectionName.toLowerCase().trim()
  ) || null
}

export const saveSectionTimetable = (session, className, sectionName, data, user = 'Administrator') => {
  if (!session || !className || !sectionName) return null
  const all = getAllTimetables()
  const existingIdx = all.findIndex(t => 
    (t.session || '').toLowerCase().trim() === session.toLowerCase().trim() &&
    (t.className || '').toLowerCase().trim() === className.toLowerCase().trim() &&
    (t.sectionName || '').toLowerCase().trim() === sectionName.toLowerCase().trim()
  )

  const now = new Date().toISOString()
  const currentSlots = data.slots || {}
  const slotCount = Object.keys(currentSlots).length

  let updatedRecord = null

  if (existingIdx !== -1) {
    const prev = all[existingIdx]
    const versions = Array.isArray(prev.versions) ? [...prev.versions] : []

    // If slots changed, archive previous into version history (keep last 15 versions)
    if (JSON.stringify(prev.slots) !== JSON.stringify(currentSlots)) {
      versions.unshift({
        versionNumber: versions.length + 1,
        savedAt: now,
        savedBy: user,
        slotCount: Object.keys(prev.slots || {}).length,
        summary: `Updated schedule: ${slotCount} active period(s)`,
        slots: { ...(prev.slots || {}) }
      })
      if (versions.length > 15) versions.pop()
    }

    updatedRecord = {
      ...prev,
      ...data,
      session,
      className,
      sectionName,
      slots: currentSlots,
      versions,
      updatedAt: now
    }
    all[existingIdx] = updatedRecord
  } else {
    updatedRecord = {
      id: `tt-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      session,
      className,
      sectionName,
      level: data.level || 'secondary',
      shift: data.shift || 'Morning',
      status: 'Draft',
      publishedAt: null,
      publishedBy: null,
      slots: currentSlots,
      versions: [
        {
          versionNumber: 1,
          savedAt: now,
          savedBy: user,
          slotCount,
          summary: `Initial creation: ${slotCount} period(s)`,
          slots: { ...currentSlots }
        }
      ],
      createdAt: now,
      updatedAt: now
    }
    all.push(updatedRecord)
  }

  saveAllTimetables(all)
  return updatedRecord
}

// Publish & Lock Timetable
export const setTimetablePublishStatus = (session, className, sectionName, isPublished, user = 'Administrator') => {
  const all = getAllTimetables()
  const idx = all.findIndex(t => 
    (t.session || '').toLowerCase().trim() === session.toLowerCase().trim() &&
    (t.className || '').toLowerCase().trim() === className.toLowerCase().trim() &&
    (t.sectionName || '').toLowerCase().trim() === sectionName.toLowerCase().trim()
  )
  if (idx === -1) return null

  all[idx] = {
    ...all[idx],
    status: isPublished ? 'Published' : 'Draft',
    publishedAt: isPublished ? new Date().toISOString() : null,
    publishedBy: isPublished ? user : null,
    updatedAt: new Date().toISOString()
  }

  saveAllTimetables(all)
  return all[idx]
}

// Restore a previous version
export const restoreTimetableVersion = (session, className, sectionName, versionNumber, user = 'Administrator') => {
  const all = getAllTimetables()
  const idx = all.findIndex(t => 
    (t.session || '').toLowerCase().trim() === session.toLowerCase().trim() &&
    (t.className || '').toLowerCase().trim() === className.toLowerCase().trim() &&
    (t.sectionName || '').toLowerCase().trim() === sectionName.toLowerCase().trim()
  )
  if (idx === -1) return null

  const target = all[idx]
  const targetVer = (target.versions || []).find(v => v.versionNumber === versionNumber)
  if (!targetVer) return null

  const now = new Date().toISOString()
  const restoredSlots = { ...(targetVer.slots || {}) }

  // Record this restoration event into history
  const updatedVersions = [
    {
      versionNumber: (target.versions || []).length + 1,
      savedAt: now,
      savedBy: user,
      slotCount: Object.keys(restoredSlots).length,
      summary: `Restored back to Version ${versionNumber}`,
      slots: restoredSlots
    },
    ...(target.versions || [])
  ]

  all[idx] = {
    ...target,
    slots: restoredSlots,
    versions: updatedVersions,
    updatedAt: now
  }

  saveAllTimetables(all)
  return all[idx]
}

// Conflict Detection Engine
export const checkSlotConflicts = ({
  session,
  shift = 'Morning',
  day,
  periodNum,
  teacherId,
  teacherName,
  roomId,
  roomName,
  targetClassName,
  targetSectionName,
  currentSlotKey,
  teachersList = []
}) => {
  const conflicts = {
    blocked: false,
    reasons: [],
    warnings: []
  }

  if (!day || !periodNum) return conflicts

  const allTimetables = getAllTimetables()

  // 1. Check Teacher on Approved Leave
  if (teacherId || teacherName) {
    const teacherObj = teachersList.find(t => 
      (teacherId && t.id === teacherId) || 
      (teacherName && t.name.toLowerCase().trim() === teacherName.toLowerCase().trim())
    )

    if (teacherObj) {
      if (teacherObj.status === 'On Leave') {
        const subName = teacherObj.leaveInfo?.substituteTeacherName
        const leaveReason = teacherObj.leaveInfo?.leaveType || 'Approved Leave'
        conflicts.blocked = true
        conflicts.reasons.push(
          `Faculty Leave Notice: ${teacherObj.name} is currently marked "${teacherObj.status}" (${leaveReason}). Assignment is blocked.${subName ? ` Suggested Substitute: ${subName}` : ''}`
        )
      }
    }
  }

  // 2. Scan across all section timetables for Teacher & Room double-booking at the exact same day & period slot
  const slotKey = `${day}-${periodNum}`

  allTimetables.forEach(t => {
    // Only compare within the same academic session and shift
    if ((t.session || '').toLowerCase().trim() !== (session || '').toLowerCase().trim()) return
    if ((t.shift || 'Morning').toLowerCase().trim() !== shift.toLowerCase().trim()) return

    const isCurrentSection = 
      (t.className || '').toLowerCase().trim() === (targetClassName || '').toLowerCase().trim() &&
      (t.sectionName || '').toLowerCase().trim() === (targetSectionName || '').toLowerCase().trim()

    const slots = t.slots || {}
    const slotEntry = slots[slotKey]

    if (!slotEntry) return

    // If it's the slot we are currently editing in the same section, ignore self
    if (isCurrentSection && currentSlotKey === slotKey) return

    // Check Teacher collision
    if (teacherId && slotEntry.teacherId && slotEntry.teacherId === teacherId) {
      conflicts.blocked = true
      conflicts.reasons.push(
        `Teacher Conflict: "${slotEntry.teacherName || teacherName}" is already scheduled at ${day} (${periodNum}) in ${t.className} - ${t.sectionName}. A teacher cannot teach two sections simultaneously.`
      )
    } else if (teacherName && slotEntry.teacherName && slotEntry.teacherName.toLowerCase().trim() === teacherName.toLowerCase().trim()) {
      conflicts.blocked = true
      conflicts.reasons.push(
        `Teacher Conflict: "${teacherName}" is already scheduled at ${day} (${periodNum}) in ${t.className} - ${t.sectionName}.`
      )
    }

    // Check Room collision
    if (roomId && slotEntry.roomId && slotEntry.roomId === roomId) {
      conflicts.blocked = true
      conflicts.reasons.push(
        `Room Conflict: "${slotEntry.roomName || roomName}" is already booked at ${day} (${periodNum}) by ${t.className} - ${t.sectionName}. A room cannot accommodate two sections simultaneously.`
      )
    } else if (roomName && slotEntry.roomName && slotEntry.roomName.toLowerCase().trim() === roomName.toLowerCase().trim()) {
      conflicts.blocked = true
      conflicts.reasons.push(
        `Room Conflict: "${roomName}" is already booked at ${day} (${periodNum}) by ${t.className} - ${t.sectionName}.`
      )
    }
  })

  // 3. Workload Warning: Count weekly periods assigned to this teacher across the session
  if (teacherId || teacherName) {
    let teacherWeeklyTotal = 0
    allTimetables.forEach(t => {
      if ((t.session || '').toLowerCase().trim() !== (session || '').toLowerCase().trim()) return
      const slots = t.slots || {}
      Object.values(slots).forEach(s => {
        if ((teacherId && s.teacherId === teacherId) || (teacherName && (s.teacherName || '').toLowerCase().trim() === teacherName.toLowerCase().trim())) {
          teacherWeeklyTotal += s.isDoublePeriod ? 2 : 1
        }
      })
    })

    if (teacherWeeklyTotal >= 24) {
      conflicts.warnings.push(
        `Heavy Workload Warning: Faculty member currently has ${teacherWeeklyTotal} periods allocated per week across all campus classes.`
      )
    }
  }

  return conflicts
}

// Calculate Subject Quotas (assigned vs required periods per week)
export const calculateSubjectQuotas = (classObj, timetableSlots = {}) => {
  const subjects = Array.isArray(classObj?.subjects) ? classObj.subjects : []
  const slotList = Object.values(timetableSlots || {})

  return subjects.map(sub => {
    const required = Number(sub.periodsPerWeek || 5)
    // Count assigned slots for this subject
    const assigned = slotList.reduce((acc, s) => {
      const match = (s.subjectId && s.subjectId === sub.id) || 
                    (s.subjectName && s.subjectName.toLowerCase().trim() === (sub.name || '').toLowerCase().trim())
      if (match) {
        return acc + (s.isDoublePeriod ? 2 : 1)
      }
      return acc
    }, 0)

    const remaining = required - assigned
    let status = 'balanced'
    if (assigned > required) status = 'over'
    else if (assigned < required) status = 'under'
    else status = 'complete'

    return {
      id: sub.id,
      name: sub.name,
      totalMarks: sub.totalMarks || 100,
      required,
      assigned,
      remaining,
      status
    }
  })
}

// Substitutes Logs Management
export const getSubstituteAssignments = () => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_SUBSTITUTES)
    if (raw) {
      const parsed = JSON.parse(raw)
      if (Array.isArray(parsed)) return parsed
    }
  } catch (e) {}
  return []
}

export const recordSubstituteAssignment = (assignment) => {
  const all = getSubstituteAssignments()
  const newRecord = {
    id: `subst-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
    ...assignment,
    createdAt: new Date().toISOString()
  }
  all.unshift(newRecord)
  try {
    localStorage.setItem(STORAGE_KEY_SUBSTITUTES, JSON.stringify(all))
  } catch (e) {}
  return newRecord
}
