// src/modules/institute-admin/notices/noticeService.js
/**
 * Campus Digital Notice Board & Circular Dispatch Service
 * Multi-Tier Scoped Architecture: School (Students), College, University & Campus-Wide
 */

export const STORAGE_KEY = 'sms_campus_notices'

export const ACADEMIC_TIERS = [
  { id: 'all', label: 'All Campus Notices', icon: 'Layers', description: 'Universal institute-wide announcements' },
  { id: 'school', label: 'School / K-12 Wing', icon: 'School', description: 'Elementary & Secondary school circulars' },
  { id: 'college', label: 'College Wing', icon: 'Building2', description: 'Higher Secondary & Intermediate college notices' },
  { id: 'university', label: 'University Wing', icon: 'GraduationCap', description: 'Undergraduate, Graduate & Faculty circulars' }
]

export const TIER_CATEGORIES = {
  all: ['General', 'Holiday & Vacation', 'Urgent Directive', 'Administrative', 'Admissions', 'Sports & Events'],
  school: ['General', 'Academic', 'Parent-Teacher Meeting (PTM)', 'School Timings', 'Exam & Datesheet', 'Fee Payment Reminder', 'Uniform & Rules', 'Winter / Summer Vacation', 'Homework & Syllabus'],
  college: ['General', 'Academic', 'Board Registration (BISE)', 'Send-Up Examination', 'Lab Practicals', 'College Fee Installments', 'Sports Gala & Competitions', 'College Merit List'],
  university: ['General', 'Academic', 'Semester Registration', 'Midterm & Final Exams', 'Research & Thesis Defense', 'HEC Directives', 'Convocation & Degrees', 'Hostel & Transport', 'Scholarships & Aid']
}

export const TIER_AUDIENCES = {
  all: ['All Campus Students, Parents & Staff', 'Faculty & Staff Only', 'All Students Only', 'Parents & Guardians Only'],
  school: ['All School Students & Parents', 'Primary Wing (Grades 1-5)', 'Middle Wing (Grades 6-8)', 'Secondary Wing (Matric/O-Level)', 'Parents Only', 'School Faculty'],
  college: ['All College Students', '1st Year (FSc / FA / ICS / ICom)', '2nd Year (FSc / FA / ICS / ICom)', 'Science Students (Pre-Med / Pre-Eng)', 'College Faculty & Lab In-charges'],
  university: ['All University Departments', 'Undergraduate Scholars (BS)', 'Postgraduate & MS/PhD Scholars', 'Faculty Deans & Department Heads', 'Visiting Professors', 'Campus Administration']
}

export const NOTICE_PRIORITIES = [
  { id: 'low', label: 'Low', badgeClass: 'bg-slate-100 text-slate-700 border-slate-200', icon: 'info' },
  { id: 'medium', label: 'Medium', badgeClass: 'bg-amber-50 text-amber-800 border-amber-300', icon: 'info' },
  { id: 'high', label: 'High', badgeClass: 'bg-rose-50 text-rose-700 border-rose-200', icon: 'alert' },
  { id: 'urgent', label: 'Urgent', badgeClass: 'bg-red-600 text-white border-red-700 animate-pulse', icon: 'alert' }
]

/**
 * Read notices from localStorage with fallback
 */
export const getStoredNotices = (instituteId = null) => {
  try {
    if (typeof localStorage !== 'undefined') {
      const raw = localStorage.getItem(STORAGE_KEY)
      if (raw) {
        const parsed = JSON.parse(raw)
        if (!instituteId) return parsed
        return parsed.filter(n => !n.instituteId || n.instituteId === instituteId)
      }
    }
  } catch (e) {
    console.error('Failed reading notices from storage:', e)
  }
  return []
}

/**
 * Save notices to localStorage
 */
export const saveStoredNotices = (notices) => {
  try {
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(notices))
    }
  } catch (e) {
    console.error('Failed saving notices to storage:', e)
  }
}

/**
 * Format Date as DD/MM/YYYY
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
 * Export Notices as CSV
 */
export const exportNoticesCSV = (notices = [], activeTierLabel = 'All') => {
  if (!notices || notices.length === 0) return

  const headers = ['Notice ID', 'Title', 'Academic Tier', 'Category', 'Priority', 'Target Audience', 'Author', 'Date', 'Pinned', 'Content']
  const rows = notices.map(n => [
    `"${n.id || ''}"`,
    `"${(n.title || '').replace(/"/g, '""')}"`,
    `"${n.tier || 'all'}"`,
    `"${n.category || 'General'}"`,
    `"${n.priority || 'medium'}"`,
    `"${n.audience || 'All'}"`,
    `"${(n.author || '').replace(/"/g, '""')}"`,
    `"${n.date || ''}"`,
    n.pinned ? 'Yes' : 'No',
    `"${(n.content || '').replace(/"/g, '""').replace(/\n/g, ' ')}"`
  ].join(','))

  const csvContent = 'data:text/csv;charset=utf-8,\uFEFF' + [headers.join(','), ...rows].join('\n')
  const encodedUri = encodeURI(csvContent)
  const link = document.createElement('a')
  link.setAttribute('href', encodedUri)
  link.setAttribute('download', `Notices_${activeTierLabel.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.csv`)
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
}
