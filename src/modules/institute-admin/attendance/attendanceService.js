/**
 * Attendance Service
 * Complete business logic for Daily Attendance, Holidays, Working Days,
 * Student Leaves, Audit Trail, Parent Bilingual Alerts, Autosave, and Multi-Level Attendance.
 */
import { DataService } from '../../../services/dataService.js'

// 1. Status Configurations
export const ATTENDANCE_STATUSES = {
  present: {
    id: 'present',
    label: 'Present',
    shortLabel: 'P',
    keyShortcut: 'P',
    color: 'emerald',
    badgeClass: 'bg-emerald-50 text-emerald-800 border-emerald-200',
    btnActiveClass: 'bg-emerald-600 text-white shadow-xs',
    dotClass: 'bg-emerald-500'
  },
  absent: {
    id: 'absent',
    label: 'Absent',
    shortLabel: 'A',
    keyShortcut: 'A',
    color: 'rose',
    badgeClass: 'bg-rose-50 text-rose-800 border-rose-200',
    btnActiveClass: 'bg-rose-600 text-white shadow-xs',
    dotClass: 'bg-rose-500'
  },
  leave: {
    id: 'leave',
    label: 'Leave',
    shortLabel: 'L',
    keyShortcut: 'V', // V for Leave / Vacation
    color: 'amber',
    badgeClass: 'bg-amber-50 text-amber-800 border-amber-200',
    btnActiveClass: 'bg-amber-500 text-white shadow-xs',
    dotClass: 'bg-amber-500'
  },
  late: {
    id: 'late',
    label: 'Late / Tardy',
    shortLabel: 'T',
    keyShortcut: 'L', // L for Late
    color: 'purple',
    badgeClass: 'bg-purple-50 text-purple-800 border-purple-200',
    btnActiveClass: 'bg-purple-600 text-white shadow-xs',
    dotClass: 'bg-purple-500'
  },
  short_leave: {
    id: 'short_leave',
    label: 'Short Leave',
    shortLabel: 'SL',
    keyShortcut: 'S',
    color: 'sky',
    badgeClass: 'bg-sky-50 text-sky-800 border-sky-200',
    btnActiveClass: 'bg-sky-600 text-white shadow-xs',
    dotClass: 'bg-sky-500'
  }
}

export const LEAVE_ABSENCE_REASONS = [
  'Medical / Sick Leave',
  'Family Emergency / Function',
  'Transport / Weather Delay',
  'Official Duty / Sports Event',
  'Urgent Piece of Work',
  'Doctor / Hospital Appointment',
  'Without Prior Information (Unexcused)',
  'Other (Specify in Remarks)'
]

// Storage Keys
const STORAGE_RECORDS_KEY = 'sms_daily_attendance_records'
const STORAGE_SETTINGS_KEY = 'sms_attendance_system_settings'
const STORAGE_HOLIDAYS_KEY = 'sms_academic_holidays'
const STORAGE_LEAVES_KEY = 'sms_student_leave_applications'
const STORAGE_AUTOSAVE_KEY = 'sms_attendance_autosave_drafts'
const STORAGE_DISPATCH_LOGS_KEY = 'sms_attendance_alert_dispatch_logs'

// 2. Attendance System Settings
export const getDefaultAttendanceSettings = () => ({
  defaulterThreshold: 75,
  consecutiveAbsenceThreshold: 3,
  enableShortLeave: true,
  workingDays: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
  fridayShorterDay: true
})

export const getAttendanceSettings = () => {
  try {
    const raw = localStorage.getItem(STORAGE_SETTINGS_KEY)
    if (raw) return { ...getDefaultAttendanceSettings(), ...JSON.parse(raw) }
  } catch (e) {}
  return getDefaultAttendanceSettings()
}

export const saveAttendanceSettings = (settings) => {
  try {
    const current = getAttendanceSettings()
    const updated = { ...current, ...settings }
    localStorage.setItem(STORAGE_SETTINGS_KEY, JSON.stringify(updated))
    return updated
  } catch (e) {
    return getDefaultAttendanceSettings()
  }
}

// 3. Holidays Management
export const getAcademicHolidays = () => {
  try {
    const raw = localStorage.getItem(STORAGE_HOLIDAYS_KEY)
    if (raw) {
      const parsed = JSON.parse(raw)
      if (Array.isArray(parsed)) return parsed
    }
  } catch (e) {}
  return []
}

export const saveAcademicHoliday = (holiday) => {
  const list = getAcademicHolidays()
  const idx = list.findIndex(h => h.id === holiday.id)
  let updated
  if (idx >= 0) {
    updated = [...list]
    updated[idx] = holiday
  } else {
    updated = [
      ...list,
      {
        ...holiday,
        id: holiday.id || `hol-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
        createdAt: new Date().toISOString()
      }
    ]
  }
  localStorage.setItem(STORAGE_HOLIDAYS_KEY, JSON.stringify(updated))
  return updated
}

export const deleteAcademicHoliday = (holidayId) => {
  const list = getAcademicHolidays().filter(h => h.id !== holidayId)
  localStorage.setItem(STORAGE_HOLIDAYS_KEY, JSON.stringify(list))
  return list
}

/**
 * Checks if a given date string (YYYY-MM-DD) is a registered holiday
 */
export const checkDateHoliday = (dateStr) => {
  if (!dateStr) return null
  const holidays = getAcademicHolidays()
  for (const h of holidays) {
    // If exact date match
    if (h.date === dateStr) return h
    // If date range (startDate to endDate)
    if (h.startDate && h.endDate && dateStr >= h.startDate && dateStr <= h.endDate) {
      return h
    }
  }
  return null
}

/**
 * Checks if a date is a designated working day
 */
export const isDateWorkingDay = (dateStr, workingDaysList = null) => {
  if (!dateStr) return false
  const settings = getAttendanceSettings()
  const workingDays = workingDaysList || settings.workingDays || ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday']
  const dateObj = new Date(dateStr)
  const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
  const dayName = dayNames[dateObj.getDay()]
  return workingDays.includes(dayName)
}

// 4. Student Leave Applications Management
export const getStudentLeaveApplications = () => {
  try {
    const raw = localStorage.getItem(STORAGE_LEAVES_KEY)
    if (raw) {
      const parsed = JSON.parse(raw)
      if (Array.isArray(parsed)) return parsed
    }
  } catch (e) {}
  return []
}

export const saveStudentLeaveApplication = (leave) => {
  const list = getStudentLeaveApplications()
  const idx = list.findIndex(l => l.id === leave.id)
  let updated
  if (idx >= 0) {
    updated = [...list]
    updated[idx] = leave
  } else {
    updated = [
      ...list,
      {
        ...leave,
        id: leave.id || `leave-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
        status: leave.status || 'Approved', // Default approved by admin/teacher
        createdAt: new Date().toISOString()
      }
    ]
  }
  localStorage.setItem(STORAGE_LEAVES_KEY, JSON.stringify(updated))
  return updated
}

export const deleteStudentLeaveApplication = (leaveId) => {
  const list = getStudentLeaveApplications().filter(l => l.id !== leaveId)
  localStorage.setItem(STORAGE_LEAVES_KEY, JSON.stringify(list))
  return list
}

/**
 * Check if a student has an approved leave on dateStr
 */
export const getApprovedLeaveForStudent = (studentId, dateStr) => {
  if (!studentId || !dateStr) return null
  const leaves = getStudentLeaveApplications()
  return leaves.find(l => {
    if (l.studentId !== studentId) return false
    if (l.status !== 'Approved') return false
    if (l.date && l.date === dateStr) return true
    if (l.fromDate && l.toDate && dateStr >= l.fromDate && dateStr <= l.toDate) return true
    return false
  }) || null
}

// 5. Unique Key Builder & Master Records Store
export const buildAttendanceKey = (session, className, sectionName, date, subjectId = 'general') => {
  const s = (session || 'default').toLowerCase().trim()
  const c = (className || 'default').toLowerCase().trim()
  const sec = (sectionName || 'all').toLowerCase().trim()
  const sub = (subjectId || 'general').toLowerCase().trim()
  return `${s}__${c}__${sec}__${sub}__${date}`
}

export const getAllAttendanceStore = () => {
  try {
    const raw = localStorage.getItem(STORAGE_RECORDS_KEY)
    if (raw) return JSON.parse(raw)
  } catch (e) {}
  return {}
}

export const getAttendanceRecord = (session, className, sectionName, date, subjectId = 'general') => {
  const store = getAllAttendanceStore()
  const key = buildAttendanceKey(session, className, sectionName, date, subjectId)
  return store[key] || null
}

/**
 * Save Attendance Sheet (Draft / Saved / Locked)
 */
export const saveAttendanceRecord = (
  session,
  className,
  sectionName,
  date,
  payload,
  user = 'Administrator',
  sheetState = 'Saved', // 'Saved' | 'Locked'
  reason = ''
) => {
  const store = getAllAttendanceStore()
  const key = buildAttendanceKey(session, className, sectionName, date, payload.subjectId || 'general')
  const existing = store[key] || null

  const nowIso = new Date().toISOString()
  const auditEntry = {
    timestamp: nowIso,
    user: typeof user === 'string' ? user : (user?.name || user?.email || 'Teacher'),
    action: sheetState === 'Locked' ? 'Locked Sheet' : (existing ? 'Updated Sheet' : 'Created Sheet'),
    reason: reason || (sheetState === 'Locked' ? 'Locked for official record' : 'Regular daily roll call save'),
    totalMarked: Object.keys(payload.records || {}).length
  }

  const record = {
    key,
    session,
    className,
    sectionName,
    subjectId: payload.subjectId || 'general',
    subjectName: payload.subjectName || '',
    date,
    sheetState, // 'Saved' | 'Locked'
    records: payload.records || {},
    counters: payload.counters || {},
    submittedAt: existing?.submittedAt || nowIso,
    submittedBy: existing?.submittedBy || (typeof user === 'string' ? user : (user?.name || 'Teacher')),
    lastModifiedAt: nowIso,
    lastModifiedBy: typeof user === 'string' ? user : (user?.name || 'Teacher'),
    auditTrail: [...(existing?.auditTrail || []), auditEntry]
  }

  store[key] = record
  localStorage.setItem(STORAGE_RECORDS_KEY, JSON.stringify(store))

  // Sync with AppDataContext / DataService
  const legacyKey = `${session}__${className}__${sectionName}`
  DataService.saveAttendance(date, legacyKey, record)

  // Clear any autosaved draft for this key
  clearAutosavedDraft(key)

  return record
}

/**
 * Unlock Locked Sheet (Admin only, with mandatory reason)
 */
export const unlockAttendanceRecord = (session, className, sectionName, date, subjectId = 'general', user, reason) => {
  const store = getAllAttendanceStore()
  const key = buildAttendanceKey(session, className, sectionName, date, subjectId)
  const existing = store[key]
  if (!existing) return null

  const nowIso = new Date().toISOString()
  const auditEntry = {
    timestamp: nowIso,
    user: typeof user === 'string' ? user : (user?.name || 'Administrator'),
    action: 'Unlocked Sheet for Editing',
    reason: reason || 'Administrative edit request',
    totalMarked: Object.keys(existing.records || {}).length
  }

  existing.sheetState = 'Saved' // Unlocked
  existing.lastModifiedAt = nowIso
  existing.lastModifiedBy = typeof user === 'string' ? user : (user?.name || 'Administrator')
  existing.auditTrail = [...(existing.auditTrail || []), auditEntry]

  store[key] = existing
  localStorage.setItem(STORAGE_RECORDS_KEY, JSON.stringify(store))
  return existing
}

// 6. Autosave Draft Management
export const saveAutosavedDraft = (key, data) => {
  try {
    const raw = localStorage.getItem(STORAGE_AUTOSAVE_KEY)
    const store = raw ? JSON.parse(raw) : {}
    store[key] = {
      timestamp: Date.now(),
      data
    }
    localStorage.setItem(STORAGE_AUTOSAVE_KEY, JSON.stringify(store))
  } catch (e) {}
}

export const getAutosavedDraft = (key) => {
  try {
    const raw = localStorage.getItem(STORAGE_AUTOSAVE_KEY)
    if (!raw) return null
    const store = JSON.parse(raw)
    const draft = store[key]
    // Expire draft after 7 days
    if (draft && Date.now() - draft.timestamp < 7 * 86400 * 1000) {
      return draft.data
    }
  } catch (e) {}
  return null
}

export const clearAutosavedDraft = (key) => {
  try {
    const raw = localStorage.getItem(STORAGE_AUTOSAVE_KEY)
    if (!raw) return
    const store = JSON.parse(raw)
    delete store[key]
    localStorage.setItem(STORAGE_AUTOSAVE_KEY, JSON.stringify(store))
  } catch (e) {}
}

// 7. Consecutive Absence Detector
export const getConsecutiveAbsences = (
  studentId,
  session,
  className,
  sectionName,
  currentDateStr,
  threshold = 3
) => {
  const store = getAllAttendanceStore()
  const settings = getAttendanceSettings()
  const workingDays = settings.workingDays || ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday']

  // Walk backwards up to 14 days
  let consecutiveCount = 0
  const curr = new Date(currentDateStr)

  for (let i = 0; i < 14; i++) {
    const d = new Date(curr)
    d.setDate(curr.getDate() - i)
    const dateStr = d.toISOString().split('T')[0]

    // Skip non-working days & holidays
    const dayName = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'][d.getDay()]
    if (!workingDays.includes(dayName)) continue
    if (checkDateHoliday(dateStr)) continue

    const key = buildAttendanceKey(session, className, sectionName, dateStr, 'general')
    const rec = store[key]
    if (!rec || !rec.records || !rec.records[studentId]) {
      // If we hit an unrecorded working day before today, break chain
      if (i > 0) break
      continue
    }

    const item = rec.records[studentId]
    const st = typeof item === 'string' ? item : item.status
    if (st === 'absent') {
      consecutiveCount++
    } else {
      break // Chain broken
    }
  }

  return {
    count: consecutiveCount,
    isFlagged: consecutiveCount >= threshold
  }
}

// 8. Bilingual Parent Alert Message Generator (Urdu & English)
export const generateBilingualAlertText = (student, instituteName, dateStr, status, reason = '', consecutiveDays = 0) => {
  const stdName = student?.name || 'Student'
  const roll = student?.rollNumber || '—'
  const cName = student?.className || ''
  const sName = student?.section ? ` (${student.section})` : ''
  const inst = instituteName || 'Campus Administration'

  const statusEn = (status || 'absent').toUpperCase()
  const consecutiveWarningEn = consecutiveDays >= 3 
    ? `\n\n⚠️ IMPORTANT: Student has been absent for ${consecutiveDays} consecutive working days. Please meet the Principal immediately.` 
    : ''

  const statusUrdu = status === 'absent' ? 'غیر حاضر (Absent)' : status === 'leave' ? 'رخصت (Leave)' : 'لیٹ (Late)'
  const consecutiveWarningUrdu = consecutiveDays >= 3
    ? `\n\n⚠️ ضروری اطلاع: طالب علم مسلسل ${consecutiveDays} تعلیمی دنوں سے غیر حاضر ہے۔ برائے مہربانی فوری طور پر پرنسپل صاحب سے رابطہ کریں۔`
    : ''

  const englishMessage = `Dear Parent / Guardian,

This is an automated notification from ${inst}.
Student: ${stdName}
Roll No: ${roll}
Class: ${cName}${sName}
Date: ${dateStr}
Status: ${statusEn}${reason ? ` (${reason})` : ''}.${consecutiveWarningEn}

Please contact the campus office for any queries.
Regards,
${inst}`

  const urduMessage = `محترم والدین / سرپرست،

یہ ${inst} کی جانب سے خودکار حاضری کی اطلاع ہے۔
طالب علم: ${stdName}
رول نمبر: ${roll}
کلاس: ${cName}${sName}
تاریخ: ${dateStr}
حاضری کی کیفیت: ${statusUrdu}${reason ? ` (${reason})` : ''}۔${consecutiveWarningUrdu}

کسی بھی سوال کے لیے اسکول آفس سے رابطہ کریں۔
شکریہ،
${inst}`

  return {
    english: englishMessage,
    urdu: urduMessage
  }
}

// Alert Dispatch Logs
export const logAlertDispatch = (studentId, studentName, dateStr, medium, phone, status = 'Sent') => {
  try {
    const raw = localStorage.getItem(STORAGE_DISPATCH_LOGS_KEY)
    const logs = raw ? JSON.parse(raw) : []
    const entry = {
      id: `disp-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      timestamp: new Date().toISOString(),
      studentId,
      studentName,
      dateStr,
      medium, // 'WhatsApp' | 'SMS'
      phone,
      status
    }
    logs.unshift(entry)
    localStorage.setItem(STORAGE_DISPATCH_LOGS_KEY, JSON.stringify(logs.slice(0, 100))) // keep 100
  } catch (e) {}
}

export const getAlertDispatchesForDate = (dateStr) => {
  try {
    const raw = localStorage.getItem(STORAGE_DISPATCH_LOGS_KEY)
    if (!raw) return []
    const logs = JSON.parse(raw)
    return logs.filter(l => l.dateStr === dateStr)
  } catch (e) {}
  return []
}

// 9. Principal Overview: Pending Sections Today
export const getPendingSectionsToday = (session, classes = [], dateStr) => {
  const store = getAllAttendanceStore()
  const pending = []

  classes.forEach(c => {
    const sections = c.sections && Array.isArray(c.sections) ? c.sections : [{ name: 'A' }]
    sections.forEach(sec => {
      const secName = typeof sec === 'string' ? sec : sec.name
      const key = buildAttendanceKey(session, c.name, secName, dateStr, 'general')
      const rec = store[key]
      if (!rec || rec.sheetState === 'Draft') {
        pending.push({
          classId: c.id,
          className: c.name,
          sectionName: secName,
          status: 'Pending',
          classTeacher: typeof sec === 'object' ? (sec.classTeacherName || c.classTeacher || 'Unassigned') : (c.classTeacher || 'Unassigned')
        })
      }
    })
  })

  return pending
}

// 10. Monthly Attendance Matrix Calculator
export const getMonthlyAttendanceMatrix = (
  session,
  className,
  sectionName,
  yearMonthStr,
  students = [],
  subjectId = 'general'
) => {
  const [yearStr, monthStr] = (yearMonthStr || '').split('-')
  const year = parseInt(yearStr, 10) || new Date().getFullYear()
  const month = parseInt(monthStr, 10) || (new Date().getMonth() + 1)

  const daysInMonth = new Date(year, month, 0).getDate()
  const allStore = getAllAttendanceStore()
  const settings = getAttendanceSettings()
  const workingDays = settings.workingDays || ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']

  const days = []
  for (let d = 1; d <= daysInMonth; d++) {
    const dayDate = new Date(year, month - 1, d)
    const dayOfWeek = dayDate.getDay() // 0 is Sunday
    const dayName = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'][dayOfWeek]
    const dateFormatted = `${year}-${String(month).padStart(2, '0')}-${String(d).padStart(2, '0')}`

    const holiday = checkDateHoliday(dateFormatted)
    const isWorking = workingDays.includes(dayName) && !holiday
    const recordKey = buildAttendanceKey(session, className, sectionName, dateFormatted, subjectId)
    const isRecorded = !!allStore[recordKey]

    days.push({
      dayNum: d,
      dateStr: dateFormatted,
      dayName: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][dayOfWeek],
      isSunday: dayOfWeek === 0,
      isWorking,
      holidayName: holiday ? holiday.name : null,
      isRecorded
    })
  }

  // Calculate per student
  const studentRows = students.map(student => {
    let presentCount = 0
    let absentCount = 0
    let leaveCount = 0
    let lateCount = 0
    let shortLeaveCount = 0
    let recordedDaysCount = 0

    const dailyStatus = {}
    const admDate = student.admissionDate || ''

    days.forEach(day => {
      // Check if student was admitted after this date
      if (admDate && day.dateStr < admDate) {
        dailyStatus[day.dayNum] = { status: 'not_admitted', short: 'NA' }
        return
      }

      if (day.holidayName) {
        dailyStatus[day.dayNum] = { status: 'holiday', short: 'H', label: day.holidayName }
        return
      }

      if (!day.isWorking) {
        dailyStatus[day.dayNum] = { status: 'weekend', short: 'W' }
        return
      }

      const recordKey = buildAttendanceKey(session, className, sectionName, day.dateStr, subjectId)
      const record = allStore[recordKey]

      if (record && record.records && record.records[student.id]) {
        const item = record.records[student.id]
        const st = typeof item === 'string' ? item : item.status
        dailyStatus[day.dayNum] = {
          status: st,
          short: ATTENDANCE_STATUSES[st]?.shortLabel || 'P',
          reason: item.reason || '',
          remarks: item.remarks || ''
        }

        recordedDaysCount++
        if (st === 'present') presentCount++
        else if (st === 'absent') absentCount++
        else if (st === 'leave') leaveCount++
        else if (st === 'late') lateCount++
        else if (st === 'short_leave') shortLeaveCount++
      } else {
        dailyStatus[day.dayNum] = { status: 'unrecorded', short: '—' }
      }
    })

    // Weighted attendance calculation
    const effectivePresent = presentCount + lateCount + (shortLeaveCount * 0.5)
    const attendancePercentage = recordedDaysCount > 0
      ? Math.round((effectivePresent / recordedDaysCount) * 100)
      : 100

    const threshold = settings.defaulterThreshold || 75
    const isDefaulter = recordedDaysCount >= 5 && attendancePercentage < threshold

    return {
      student,
      dailyStatus,
      presentCount,
      absentCount,
      leaveCount,
      lateCount,
      shortLeaveCount,
      recordedDaysCount,
      attendancePercentage,
      isDefaulter
    }
  })

  return {
    year,
    month,
    days,
    studentRows,
    totalWorkingDays: days.filter(d => d.isWorking).length
  }
}

// 11. Format Date to DD/MM/YYYY
export const formatDateDDMMYYYY = (isoDateStr) => {
  if (!isoDateStr) return '—'
  const parts = isoDateStr.split('-')
  if (parts.length === 3) {
    return `${parts[2]}/${parts[1]}/${parts[0]}`
  }
  return isoDateStr
}

// 12. CSV Exporters
export const exportDailyAttendanceCSV = (date, className, sectionName, students = [], attendanceRecords = {}) => {
  const headers = ['Roll No', 'Student Name', 'Class', 'Section', 'Date', 'Status', 'Arrival Time', 'Reason', 'Remarks', 'Guardian Contact']
  const rows = students.map(std => {
    const item = attendanceRecords[std.id]
    const status = typeof item === 'string' ? item : (item?.status || 'present')
    return [
      `"${std.rollNumber || ''}"`,
      `"${std.name || ''}"`,
      `"${className || ''}"`,
      `"${sectionName || ''}"`,
      `"${formatDateDDMMYYYY(date)}"`,
      `"${ATTENDANCE_STATUSES[status]?.label || status}"`,
      `"${item?.arrivalTime || ''}"`,
      `"${item?.reason || ''}"`,
      `"${(item?.remarks || '').replace(/"/g, '""')}"`,
      `"${std.guardianPhone || std.phone || ''}"`
    ].join(',')
  })

  const csvContent = [headers.join(','), ...rows].join('\n')
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.setAttribute('href', url)
  link.setAttribute('download', `Daily_Attendance_${className}_${sectionName}_${date}.csv`)
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
}

export const exportMonthlyAttendanceCSV = (session, className, sectionName, yearMonthStr, monthlyData) => {
  const { days, studentRows } = monthlyData
  const workingDays = days.filter(d => d.isWorking)

  const headers = [
    'Roll No',
    'Student Name',
    'Class',
    'Section',
    ...workingDays.map(d => `${d.dayNum} (${d.dayName})`),
    'Total Days',
    'Present',
    'Absent',
    'Leave',
    'Late',
    'Short Leave',
    'Attendance %',
    'Defaulter'
  ]

  const rows = studentRows.map(row => {
    const dayMarks = workingDays.map(d => {
      const st = row.dailyStatus[d.dayNum]
      return st ? st.short : '—'
    })

    return [
      `"${row.student.rollNumber || ''}"`,
      `"${row.student.name || ''}"`,
      `"${className || ''}"`,
      `"${sectionName || ''}"`,
      ...dayMarks.map(m => `"${m}"`),
      `"${row.recordedDaysCount}"`,
      `"${row.presentCount}"`,
      `"${row.absentCount}"`,
      `"${row.leaveCount}"`,
      `"${row.lateCount}"`,
      `"${row.shortLeaveCount}"`,
      `"${row.attendancePercentage}%"`,
      `"${row.isDefaulter ? 'YES' : 'NO'}"`
    ].join(',')
  })

  const csvContent = [headers.join(','), ...rows].join('\n')
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.setAttribute('href', url)
  link.setAttribute('download', `Monthly_Attendance_${className}_${sectionName}_${yearMonthStr}.csv`)
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
}
