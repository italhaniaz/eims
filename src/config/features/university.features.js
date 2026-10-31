/**
 * University Tier Features Configuration
 * Scoped for Degree Awarding Institutions / Universities (BS, MS, Semesters, Credit Hours).
 */
import { 
  COMMON_TERMINOLOGY, 
  COMMON_ROUTES, 
  COMMON_DASHBOARD_SHORTCUTS 
} from './common.features'

export const UNIVERSITY_FEATURES = {
  tier: 'university',
  portalTitle: 'University Administration',
  roleBadge: 'Campus Director / Dean',
  portalTypeLabel: 'University Portal (HEC BS/MS)',
  iconType: 'GraduationCap',
  badgeColor: 'blue',
  enabledTiers: ['undergraduate'],
  allowedLevelIds: ['university'],
  defaultLevel: 'university',
  isMultiTier: false,

  terminology: {
    ...COMMON_TERMINOLOGY,
    students: 'Enrolled Undergraduates',
    admissions: 'Admissions & Intake Portal',
    faculty: 'Professors & Faculty Roster',
    attendance: 'Course Lecture Attendance',
    fees: 'Semester Tuition & 1-Bill Dues',
    exams: 'Semester CGPA & Examinations',
    classes: 'Degree Programs & Semesters',
    classUnit: 'Degree Program',
    sectionUnit: 'Semester Cohort',
    teacherUnit: 'Professor / Lecturer',
    certificates: 'Transcripts & Degree Conferment',
    curriculum: 'Course Catalog & Credit Hours',
    idLabel: 'CMS / Registration No',
    timetable: 'Lecture & Lab Scheduling',
    levels: 'Degree Matrix (HEC Accredited)'
  },

  allowedRoutes: [
    ...COMMON_ROUTES,
    'inst-classes',
    'inst-subjects',
    'inst-timetable',
    'inst-program-levels',
    'inst-admissions',
    'inst-library'
    // Notice transport is usually optional/unneeded for university campuses, library is core
  ],

  // Specific operational sentinel for University Dean / Registrar
  operationalSentinel: {
    type: 'university-hec-sentinel',
    title: 'HEC Academic Probation & Quality Sentinel',
    subtitle: 'Undergraduate BS Degree Programs — Semester Standing Engine',
    badgeText: 'HEC Accreditation Active',
    badgeColor: 'blue',
    statValue: '14 Students',
    statSubtext: 'Flagged on Academic Probation (CGPA < 2.00)',
    actionLabel: 'Launch Mandatory Advising Roster',
    actionToast: 'Academic Probation roster loaded. 14 students flagged for mandatory dean advising.',
    secondaryActionLabel: 'Audit Credit Loads',
    secondaryRoute: 'inst-program-levels',
    metrics: [
      { label: 'Active Semester Load', value: 'Fall 2026 (Avg 16.5 Cr. Hrs / Student)', status: 'normal' },
      { label: 'Dean’s Honor List', value: '88 Students with CGPA ≥ 3.50', status: 'success' },
      { label: '75% Course Lecture Gate', value: '11 Barred from Final Examinations', status: 'danger' }
    ]
  },

  // Contextual Dashboard Shortcuts
  shortcuts: [
    {
      ...COMMON_DASHBOARD_SHORTCUTS[0],
      title: 'Course Attendance Log',
      subtitle: 'Course-wise 75% final exam eligibility roll call'
    },
    {
      ...COMMON_DASHBOARD_SHORTCUTS[1],
      title: 'Semester Tuition Invoicing',
      subtitle: '1-Bill, KuickPay & semester fee invoices'
    },
    {
      ...COMMON_DASHBOARD_SHORTCUTS[2],
      title: 'Lecture & Lab Schedule',
      subtitle: 'Credit hours, halls & lab allocations'
    },
    {
      ...COMMON_DASHBOARD_SHORTCUTS[3],
      title: 'Professors & Faculty',
      subtitle: 'Deans, professors & department roster'
    }
  ],

  navStructure: {
    hasAdmissions: true,
    hasTransport: false, // In university tier, transport is disabled/secondary
    hasLibrary: true,
    hasLms: true,
    hasNotices: true,
    hasCertificates: true,
    academicSubLinks: [
      { route: 'inst-classes', label: 'Degree Programs & Semesters' },
      { route: 'inst-subjects', label: 'Courses & Credit Hours' },
      { route: 'inst-timetable', label: 'Lecture Timetable' },
      { route: 'inst-program-levels', label: 'Degree Matrix' }
    ]
  }
}
