/**
 * Attendance Service
 * Handles persistence, status calculations, monthly attendance matrix,
 * parent notification generation, and CSV exports for the Daily Attendance module.
 */
import { DataService } from '../../../services/dataService'

export const ATTENDANCE_STATUSES = {
  present: {
    id: 'present',
    label: 'Present',
    shortLabel: 'P',
    color: 'emerald',
    badgeClass: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    btnActiveClass: 'bg-emerald-600 text-white shadow-xs',
    dotClass: 'bg-emerald-500'
  },
  absent: {
    id: 'absent',
    label: 'Absent',
    shortLabel: 'A',
    color: 'rose',
    badgeClass: 'bg-rose-50 text-rose-700 border-rose-200',
    btnActiveClass: 'bg-rose-600 text-white shadow-xs',
    dotClass: 'bg-rose-500'
  },
  leave: {
    id: 'leave',
    label: 'Leave',
    shortLabel: 'L',
    color: 'amber',
    badgeClass: 'bg-amber-50 text-amber-700 border-amber-200',
    btnActiveClass: 'bg-amber-500 text-white shadow-xs',
    dotClass: 'bg-amber-500'
  },
  late: {
    id: 'late',
    label: 'Late / Tardy',
    shortLabel: 'T',
    color: 'purple',
    badgeClass: 'bg-purple-50 text-purple-700 border-purple-200',
    btnActiveClass: 'bg-purple-600 text-white shadow-xs',
    dotClass: 'bg-purple-500'
  },
  half_day: {
    id: 'half_day',
    label: 'Half Day',
    shortLabel: 'HD',
    color: 'sky',
    badgeClass: 'bg-sky-50 text-sky-700 border-sky-200',
    btnActiveClass: 'bg-sky-600 text-white shadow-xs',
    dotClass: 'bg-sky-500'
  }
}

export const LEAVE_ABSENCE_REASONS = [
  'Medical / Sick Leave',
  'Family Emergency / Event',
  'Transport / Weather Delay',
  'Official Duty / Sports Event',
  'Urgent Piece of Work',
  'Without Prior Information (Unexcused)',
  'Doctor / Hospital Appointment',
  'Other (Specify in Remarks)'
]

const STORAGE_KEY = 'sms_daily_attendance_records'

/**
 * Get all stored attendance records dictionary
 */
export const getAllAttendanceStore = () => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw) return JSON.parse(raw)
  } catch (e) {
    console.error('Failed to parse attendance records from storage:', e)
  }
  return {}
}

/**
 * Helper to build unique key for class section date attendance
 */
export const buildAttendanceKey = (session, className, sectionName, date) => {
  const s = (session || 'default').toLowerCase().trim()
  const c = (className || 'default').toLowerCase().trim()
  const sec = (sectionName || 'all').toLowerCase().trim()
  return `${s}__${c}__${sec}__${date}`
}

/**
 * Get saved attendance for specific class section on date
 */
export const getAttendanceRecord = (session, className, sectionName, date) => {
  const store = getAllAttendanceStore()
  const key = buildAttendanceKey(session, className, sectionName, date)
  if (store[key]) {
    return store[key]
  }

  // Fallback check to legacy DataService key if any
  const legacyClassKey = `${session}__${className}__${sectionName}`
  const legacyData = DataService.getAttendance(date, legacyClassKey)
  if (legacyData && typeof legacyData === 'object') {
    return {
      date,
      session,
      className,
      sectionName,
      status: 'Submitted',
      records: legacyData.records || legacyData,
      submittedAt: legacyData.submittedAt || null,
      submittedBy: legacyData.submittedBy || 'Teacher'
    }
  }

  return null
}

/**
 * Save attendance record for class section on date
 */
export const saveAttendanceRecord = (session, className, sectionName, date, payload, submittedBy = 'Teacher') => {
  const store = getAllAttendanceStore()
  const key = buildAttendanceKey(session, className, sectionName, date)

  const record = {
    key,
    session,
    className,
    sectionName,
    date,
    status: 'Submitted',
    records: payload.records || {},
    counters: payload.counters || {},
    submittedAt: new Date().toISOString(),
    submittedBy: submittedBy || 'Teacher'
  }

  store[key] = record
  localStorage.setItem(STORAGE_KEY, JSON.stringify(store))

  // Sync with AppDataContext / DataService
  const legacyClassKey = `${session}__${className}__${sectionName}`
  DataService.saveAttendance(date, legacyClassKey, record)

  return record
}

/**
 * Computes monthly attendance matrix for a class section
 * Returns dates list and per-student attendance summary with percentages
 */
export const getMonthlyAttendanceMatrix = (session, className, sectionName, yearMonthStr, students = []) => {
  // yearMonthStr is in format 'YYYY-MM'
  const [yearStr, monthStr] = (yearMonthStr || '').split('-')
  const year = parseInt(yearStr, 10) || new Date().getFullYear()
  const month = parseInt(monthStr, 10) || (new Date().getMonth() + 1)

  const daysInMonth = new Date(year, month, 0).getDate()
  const allStore = getAllAttendanceStore()

  // Generate working days list (excluding Sundays by default)
  const days = []
  for (let d = 1; d <= daysInMonth; d++) {
    const dayDate = new Date(year, month - 1, d)
    const dayOfWeek = dayDate.getDay() // 0 is Sunday
    const dateFormatted = `${year}-${String(month).padStart(2, '0')}-${String(d).padStart(2, '0')}`
    
    // Check if record exists for this date
    const recordKey = buildAttendanceKey(session, className, sectionName, dateFormatted)
    const isRecorded = !!allStore[recordKey]

    days.push({
      dayNum: d,
      dateStr: dateFormatted,
      dayName: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][dayOfWeek],
      isSunday: dayOfWeek === 0,
      isRecorded
    })
  }

  // Calculate per student
  const studentRows = students.map(student => {
    let presentCount = 0
    let absentCount = 0
    let leaveCount = 0
    let lateCount = 0
    let halfDayCount = 0
    let recordedDaysCount = 0

    const dailyStatus = {}

    days.forEach(day => {
      if (day.isSunday) {
        dailyStatus[day.dayNum] = { status: 'holiday', short: 'H' }
        return
      }

      const recordKey = buildAttendanceKey(session, className, sectionName, day.dateStr)
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
        else if (st === 'half_day') halfDayCount++
      } else {
        dailyStatus[day.dayNum] = { status: 'unrecorded', short: '—' }
      }
    })

    // Weighted attendance calculation: Present + Late (full credit) + Half Day (0.5 credit)
    const effectivePresent = presentCount + lateCount + (halfDayCount * 0.5)
    const attendancePercentage = recordedDaysCount > 0 
      ? Math.round((effectivePresent / recordedDaysCount) * 100) 
      : 100

    const isDefaulter = recordedDaysCount >= 5 && attendancePercentage < 75

    return {
      student,
      dailyStatus,
      presentCount,
      absentCount,
      leaveCount,
      lateCount,
      halfDayCount,
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
    totalWorkingDays: days.filter(d => !d.isSunday).length
  }
}

/**
 * Generate formatted SMS / WhatsApp alert message for a parent
 */
export const generateAbsenteeAlertText = (student, instituteName, date, status, reason = '') => {
  const stdName = student?.name || 'Student'
  const roll = student?.rollNumber || '—'
  const cName = student?.className || ''
  const sName = student?.section ? ` (${student.section})` : ''
  const inst = instituteName || 'School Administration'

  const statusLabel = (status || 'absent').toUpperCase()
  const reasonText = reason ? ` Reason: ${reason}.` : ''

  return `Dear Parent / Guardian,

This is an automated notification from ${inst}.
Student: ${stdName}
Roll No: ${roll}
Class: ${cName}${sName}
Date: ${date}
Attendance Status: ${statusLabel}.${reasonText}

Please contact the campus office if you have any questions.
Regards,
${inst} Attendance Office`
}

/**
 * Export daily attendance as CSV
 */
export const exportDailyAttendanceCSV = (date, className, sectionName, students = [], attendanceRecords = {}) => {
  const headers = ['Roll No', 'Student Name', 'Class', 'Section', 'Date', 'Status', 'Arrival Time', 'Reason', 'Remarks', 'Guardian Contact']
  
  const rows = students.map(std => {
    const item = attendanceRecords[std.id]
    const status = typeof item === 'string' ? item : (item?.status || 'present')
    const arrivalTime = item?.arrivalTime || ''
    const reason = item?.reason || ''
    const remarks = item?.remarks || ''
    const guardianPhone = std.guardianPhone || std.phone || ''

    return [
      `"${std.rollNumber || ''}"`,
      `"${std.name || ''}"`,
      `"${className || ''}"`,
      `"${sectionName || ''}"`,
      `"${date || ''}"`,
      `"${ATTENDANCE_STATUSES[status]?.label || status}"`,
      `"${arrivalTime}"`,
      `"${reason}"`,
      `"${remarks.replace(/"/g, '""')}"`,
      `"${guardianPhone}"`
    ].join(',')
  })

  const csvContent = [headers.join(','), ...rows].join('\n')
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.setAttribute('href', url)
  link.setAttribute('download', `Attendance_${className}_${sectionName}_${date}.csv`)
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
}

/**
 * Export monthly attendance matrix as CSV
 */
export const exportMonthlyAttendanceCSV = (session, className, sectionName, yearMonthStr, monthlyData) => {
  const { days, studentRows } = monthlyData
  const workingDays = days.filter(d => !d.isSunday)

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
    'Half Day',
    'Attendance %',
    'Defaulter (<75%)'
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
      `"${row.halfDayCount}"`,
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
