// src/modules/institute-admin/exams/examService.js
/**
 * Enterprise Examination & Grading Business Logic Engine
 * Scoped Multi-Tenant Front-End Architecture
 */

export const STORAGE_KEYS = {
  TERMS: 'sms_exam_terms',
  DATESHEET: 'sms_exam_datesheets',
  MARKSHEETS: 'sms_exam_marksheets',
  SETTINGS: 'sms_exam_grading_settings',
  AUDIT: 'sms_exam_audit_trail'
}

// Default Standard Grading Bands (Percentage Scale)
export const DEFAULT_PERCENTAGE_BANDS = [
  { grade: 'A+', min: 90, max: 100, gpa: 4.0, description: 'Outstanding', color: 'emerald' },
  { grade: 'A', min: 80, max: 89.9, gpa: 3.7, description: 'Excellent', color: 'teal' },
  { grade: 'B', min: 70, max: 79.9, gpa: 3.0, description: 'Very Good', color: 'blue' },
  { grade: 'C', min: 60, max: 69.9, gpa: 2.3, description: 'Good', color: 'indigo' },
  { grade: 'D', min: 50, max: 59.9, gpa: 1.5, description: 'Satisfactory / Pass', color: 'amber' },
  { grade: 'E', min: 33, max: 49.9, gpa: 1.0, description: 'Fair / Minimum Pass', color: 'orange' },
  { grade: 'F', min: 0, max: 32.9, gpa: 0.0, description: 'Fail', color: 'rose' }
]

// Default GPA 4.0 Scale (Higher Education / College)
export const DEFAULT_GPA_BANDS = [
  { grade: 'A', min: 85, max: 100, gpa: 4.0, description: 'Exceptional' },
  { grade: 'A-', min: 80, max: 84.9, gpa: 3.7, description: 'Superior' },
  { grade: 'B+', min: 75, max: 79.9, gpa: 3.3, description: 'Very Good' },
  { grade: 'B', min: 70, max: 74.9, gpa: 3.0, description: 'Good' },
  { grade: 'B-', min: 65, max: 69.9, gpa: 2.7, description: 'Above Average' },
  { grade: 'C+', min: 60, max: 64.9, gpa: 2.3, description: 'Average' },
  { grade: 'C', min: 55, max: 59.9, gpa: 2.0, description: 'Below Average' },
  { grade: 'D', min: 50, max: 54.9, gpa: 1.0, description: 'Pass Threshold' },
  { grade: 'F', min: 0, max: 49.9, gpa: 0.0, description: 'Fail' }
]

// Default Cambridge O/A-Level Scale
export const DEFAULT_CAMBRIDGE_BANDS = [
  { grade: 'A*', min: 90, max: 100, description: 'Distinction' },
  { grade: 'A', min: 80, max: 89.9, description: 'Excellent' },
  { grade: 'B', min: 70, max: 79.9, description: 'Good' },
  { grade: 'C', min: 60, max: 69.9, description: 'Credit' },
  { grade: 'D', min: 50, max: 59.9, description: 'Pass' },
  { grade: 'E', min: 40, max: 49.9, description: 'Minimum Pass' },
  { grade: 'U', min: 0, max: 39.9, description: 'Ungraded / Fail' }
]

/**
 * Get Exam Settings with fallback
 */
export const getExamSettings = () => {
  try {
    if (typeof localStorage !== 'undefined') {
      const raw = localStorage.getItem(STORAGE_KEYS.SETTINGS)
      if (raw) return JSON.parse(raw)
    }
  } catch (e) {
    console.error('Failed reading exam settings:', e)
  }
  return {
    scaleType: 'percentage', // 'percentage' | 'gpa4' | 'cambridge'
    passingPercentage: 33,
    allowGraceMarks: true,
    maxGraceMarks: 3,
    requireApprovalToPublish: true,
    showRankOnDMC: true,
    showAttendanceOnDMC: true,
    bands: DEFAULT_PERCENTAGE_BANDS
  }
}

/**
 * Save Exam Settings
 */
export const saveExamSettings = (settings) => {
  try {
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settings))
    }
  } catch (e) {
    console.error('Failed saving exam settings:', e)
  }
}

/**
 * Calculate Grade and GPA from numerical percentage
 */
export const calculateGrade = (pct, customSettings = null) => {
  const percentage = Number(pct) || 0
  const settings = customSettings || getExamSettings()
  const bands = settings.bands && settings.bands.length > 0 ? settings.bands : DEFAULT_PERCENTAGE_BANDS

  for (const b of bands) {
    if (percentage >= b.min && percentage <= (b.max || 100)) {
      return {
        grade: b.grade,
        gpa: b.gpa !== undefined ? b.gpa : 0.0,
        description: b.description || '',
        color: b.color || 'slate'
      }
    }
  }

  // Fallback
  return { grade: 'F', gpa: 0.0, description: 'Fail', color: 'rose' }
}

/**
 * Get Stored Examination Terms
 */
export const getExamTerms = (instituteId = null) => {
  try {
    if (typeof localStorage !== 'undefined') {
      const raw = localStorage.getItem(STORAGE_KEYS.TERMS)
      if (raw) {
        const terms = JSON.parse(raw)
        if (!instituteId) return terms
        return terms.filter(t => !t.instituteId || t.instituteId === instituteId)
      }
    }
  } catch (e) {
    console.error('Failed reading exam terms:', e)
  }
  return []
}

/**
 * Save Examination Terms
 */
export const saveExamTerms = (terms) => {
  try {
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem(STORAGE_KEYS.TERMS, JSON.stringify(terms))
    }
  } catch (e) {
    console.error('Failed saving exam terms:', e)
  }
}

/**
 * Get Stored Date Sheet Items
 */
export const getDateSheets = (instituteId = null) => {
  try {
    if (typeof localStorage !== 'undefined') {
      const raw = localStorage.getItem(STORAGE_KEYS.DATESHEET)
      if (raw) {
        const sheets = JSON.parse(raw)
        if (!instituteId) return sheets
        return sheets.filter(s => !s.instituteId || s.instituteId === instituteId)
      }
    }
  } catch (e) {
    console.error('Failed reading date sheets:', e)
  }
  return []
}

/**
 * Save Date Sheet Items
 */
export const saveDateSheets = (sheets) => {
  try {
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem(STORAGE_KEYS.DATESHEET, JSON.stringify(sheets))
    }
  } catch (e) {
    console.error('Failed saving date sheets:', e)
  }
}

/**
 * Calculate Class Position / Ranking
 * Handles ties cleanly: students with identical obtained marks share the rank
 */
export const calculateClassRanks = (marksheets = []) => {
  if (!marksheets || marksheets.length === 0) return {}

  // Filter out any marksheet without valid numeric obtained
  const valid = [...marksheets].sort((a, b) => {
    const diff = Number(b.totalObtained || 0) - Number(a.totalObtained || 0)
    if (diff !== 0) return diff
    // Tie-breaker by percentage
    return Number(b.numericPercentage || 0) - Number(a.numericPercentage || 0)
  })

  const ranksMap = {}
  let currentRank = 1

  for (let i = 0; i < valid.length; i++) {
    if (i > 0) {
      const prev = valid[i - 1]
      const curr = valid[i]
      if (Number(curr.totalObtained) === Number(prev.totalObtained)) {
        // Shared rank with predecessor
        ranksMap[curr.id] = ranksMap[prev.id]
      } else {
        currentRank = i + 1
        ranksMap[curr.id] = currentRank
      }
    } else {
      ranksMap[valid[0].id] = 1
    }
  }

  return {
    ranksMap,
    totalStudents: valid.length
  }
}

/**
 * Compute Class Statistics for an Examination Term
 */
export const computeClassExamStats = (marksheets = [], passingThreshold = 33) => {
  if (!marksheets || marksheets.length === 0) {
    return {
      total: 0,
      passed: 0,
      failed: 0,
      passPercentage: 0,
      averageMarks: 0,
      averagePercentage: 0,
      highestObtained: 0,
      lowestObtained: 0,
      highestStudent: null,
      lowestStudent: null,
      gradeDist: {},
      subjectAnalytics: {}
    }
  }

  let passed = 0
  let failed = 0
  let totalScore = 0
  let totalMaxScore = 0
  let highest = -Infinity
  let lowest = Infinity
  let highestStudent = null
  let lowestStudent = null
  const gradeDist = {}
  const subjectAgg = {}

  marksheets.forEach(m => {
    const obt = Number(m.totalObtained) || 0
    const max = Number(m.totalMax) || 1
    const pct = (obt / max) * 100

    totalScore += obt
    totalMaxScore += max

    if (pct >= passingThreshold) {
      passed++
    } else {
      failed++
    }

    if (obt > highest) {
      highest = obt
      highestStudent = m
    }
    if (obt < lowest) {
      lowest = obt
      lowestStudent = m
    }

    const g = m.overallGrade || 'F'
    gradeDist[g] = (gradeDist[g] || 0) + 1

    // Subject breakdown
    if (Array.isArray(m.subjects)) {
      m.subjects.forEach(s => {
        if (!subjectAgg[s.name]) {
          subjectAgg[s.name] = { totalObtained: 0, totalMax: 0, count: 0, passed: 0 }
        }
        const sObt = Number(s.obtained) || 0
        const sMax = Number(s.maxMarks) || 100
        subjectAgg[s.name].totalObtained += sObt
        subjectAgg[s.name].totalMax += sMax
        subjectAgg[s.name].count += 1
        if ((sObt / sMax) * 100 >= passingThreshold) {
          subjectAgg[s.name].passed += 1
        }
      })
    }
  })

  const passPct = marksheets.length > 0 ? Math.round((passed / marksheets.length) * 100) : 0
  const avgMarks = marksheets.length > 0 ? Math.round(totalScore / marksheets.length) : 0
  const avgPct = totalMaxScore > 0 ? Math.round((totalScore / totalMaxScore) * 100) : 0

  return {
    total: marksheets.length,
    passed,
    failed,
    passPercentage: passPct,
    averageMarks: avgMarks,
    averagePercentage: avgPct,
    highestObtained: highest === -Infinity ? 0 : highest,
    lowestObtained: lowest === Infinity ? 0 : lowest,
    highestStudent,
    lowestStudent,
    gradeDist,
    subjectAnalytics: subjectAgg
  }
}

/**
 * Format Date helper: DD/MM/YYYY
 */
export const formatDateDDMMYYYY = (isoDateStr) => {
  if (!isoDateStr) return ''
  const parts = isoDateStr.split('T')[0].split('-')
  if (parts.length === 3) {
    return `${parts[2]}/${parts[1]}/${parts[0]}`
  }
  return isoDateStr
}

/**
 * Generate Bilingual WhatsApp Share Link
 */
export const generateResultWhatsAppUrl = ({
  phone = '',
  studentName = '',
  rollNumber = '',
  className = '',
  term = '',
  totalObtained = 0,
  totalMax = 0,
  percentage = '0%',
  grade = '',
  rank = '',
  instituteName = ''
}) => {
  const cleanPhone = (phone || '').replace(/[^0-9]/g, '')
  
  const textEnglish = `Official Examination Result Notification\n` +
    `Institute: ${instituteName || 'Beaconhouse Central High School'}\n` +
    `Dear Parent/Guardian,\n` +
    `The terminal examination result for ${studentName} (Roll No: ${rollNumber}) has been declared.\n\n` +
    `• Examination: ${term}\n` +
    `• Class: ${className}\n` +
    `• Total Marks: ${totalObtained} / ${totalMax} (${percentage})\n` +
    `• Final Grade: ${grade}\n` +
    (rank ? `• Merit Standing: Position #${rank}\n` : '') +
    `\nDetailed Mark Certificate (DMC) can be collected from the administration office.`

  const textUrdu = `محترم والدین،\n` +
    `طالب علم ${studentName} (رول نمبر: ${rollNumber}) کا ${term} کا آفیشل رزلٹ جاری کر دیا گیا ہے۔\n` +
    `حاصل کردہ نمبر: ${totalObtained}/${totalMax} (${percentage})\n` +
    `گریڈ: ${grade}\n` +
    (rank ? `کلاس پوزیشن: #${rank}\n` : '') +
    `ادارہ: ${instituteName || 'سینٹرل ہائی کیمپس'}`

  const fullMessage = `${textEnglish}\n\n---\n${textUrdu}`
  const encoded = encodeURIComponent(fullMessage)
  
  if (cleanPhone) {
    return `https://wa.me/${cleanPhone}?text=${encoded}`
  }
  return `https://api.whatsapp.com/send?text=${encoded}`
}

/**
 * Export Class Result Gazette as CSV
 */
export const exportResultGazetteCSV = (term, className, marksheets = [], subjectsList = []) => {
  if (!marksheets || marksheets.length === 0) return

  const headers = [
    'Position',
    'Roll Number',
    'Student Name',
    'Class',
    'Section',
    'Term',
    ...subjectsList.map(s => `${s} (Obt)`),
    'Grand Total',
    'Max Marks',
    'Percentage',
    'Grade',
    'GPA',
    'Result Status',
    'Remarks'
  ]

  const ranks = calculateClassRanks(marksheets).ranksMap || {}

  const rows = marksheets.map(m => {
    const rank = ranks[m.id] || '-'
    const subjectMarks = subjectsList.map(subName => {
      const match = (m.subjects || []).find(s => s.name.toLowerCase() === subName.toLowerCase())
      if (!match) return '-'
      if (match.isAbsent) return 'ABS'
      if (match.isExempt) return 'EXM'
      return match.obtained
    })

    return [
      rank,
      `"${m.rollNumber || ''}"`,
      `"${m.studentName || ''}"`,
      `"${m.className || ''}"`,
      `"${m.section || ''}"`,
      `"${m.term || ''}"`,
      ...subjectMarks,
      m.totalObtained,
      m.totalMax,
      m.percentage,
      m.overallGrade,
      m.gpa || '-',
      m.status || 'PASSED',
      `"${(m.remarks || '').replace(/"/g, '""')}"`
    ].join(',')
  })

  const csvContent = 'data:text/csv;charset=utf-8,\uFEFF' + [headers.join(','), ...rows].join('\n')
  const encodedUri = encodeURI(csvContent)
  const link = document.createElement('a')
  link.setAttribute('href', encodedUri)
  link.setAttribute('download', `Result_Gazette_${(className || 'All').replace(/\s+/g, '_')}_${(term || 'Exam').replace(/\s+/g, '_')}.csv`)
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
}

/**
 * Export Examination Date Sheet as CSV
 */
export const exportDateSheetCSV = (term, className, dateSheetItems = []) => {
  if (!dateSheetItems || dateSheetItems.length === 0) return

  const headers = ['Paper ID', 'Subject', 'Date', 'Day', 'Time Slot', 'Hall / Room', 'Chief Invigilator']
  const rows = dateSheetItems.map(item => [
    `"${item.id || ''}"`,
    `"${item.subject || ''}"`,
    `"${item.date || ''}"`,
    `"${item.day || ''}"`,
    `"${item.time || ''}"`,
    `"${item.hall || ''}"`,
    `"${item.invigilator || 'Staff On Duty'}"`
  ].join(','))

  const csvContent = 'data:text/csv;charset=utf-8,\uFEFF' + [headers.join(','), ...rows].join('\n')
  const encodedUri = encodeURI(csvContent)
  const link = document.createElement('a')
  link.setAttribute('href', encodedUri)
  link.setAttribute('download', `DateSheet_${(className || 'Class').replace(/\s+/g, '_')}_${(term || 'Term').replace(/\s+/g, '_')}.csv`)
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
}
