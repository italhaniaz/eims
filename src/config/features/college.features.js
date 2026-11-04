/**
 * College Tier Features Configuration
 * Scoped for Intermediate / Higher Secondary Institutions (HSSC / 11th - 12th / A-Levels).
 */
import { 
  COMMON_TERMINOLOGY, 
  COMMON_ROUTES, 
  COMMON_DASHBOARD_SHORTCUTS 
} from './common.features'

export const COLLEGE_FEATURES = {
  tier: 'college',
  portalTitle: 'College Administration',
  roleBadge: 'College Principal',
  portalTypeLabel: 'College Portal (11-12)',
  iconType: 'Building2',
  badgeColor: 'purple',
  enabledTiers: ['college'],
  allowedLevelIds: ['higher-secondary', 'college'],
  defaultLevel: 'higher-secondary',
  isMultiTier: false,

  terminology: {
    ...COMMON_TERMINOLOGY,
    students: 'College Students',
    admissions: 'Admissions & Merit Lists',
    faculty: 'Lecturers & College Faculty',
    attendance: 'Subject Lecture Attendance',
    fees: 'Intermediate College Fees',
    exams: 'Board Assessments & Mocks',
    classes: 'Disciplines & Batches',
    classUnit: 'Discipline',
    sectionUnit: 'Batch',
    teacherUnit: 'Lecturer',
    certificates: 'College Leaving (CLC) & Character',
    curriculum: 'FBISE / Board Curriculum',
    idLabel: 'College Roll No',
    timetable: 'Lecture & Lab Schedule',
    levels: 'Academic Streams (HSSC)'
  },

  allowedRoutes: [
    ...COMMON_ROUTES,
    'inst-classes',
    'inst-subjects',
    'inst-timetable',
    'inst-program-levels',
    'inst-admissions',
    'inst-transport',
    'inst-library',
    'inst-board-exams',
    'inst-scholarships',
    'inst-discipline',
    'inst-hostel',
    'inst-labs'
  ],

  // Specific operational sentinel for College Principal
  operationalSentinel: {
    type: 'college-board-sentinel',
    title: 'FBISE / Board Examination Operations Sentinel',
    subtitle: 'Intermediate Part I & II (FSc, ICS, I.Com, FA) Regulatory Gate',
    badgeText: 'Board Clearance Active',
    badgeColor: 'purple',
    statValue: '780 / 850 Verified',
    statSubtext: 'Board Registration Enrollment Verified (91.7%)',
    actionLabel: 'Dispatch 75% Attendance Warnings',
    actionToast: 'Official 75% attendance warning notices dispatched to 18 intermediate students & guardians.',
    secondaryActionLabel: 'View Merit Admissions',
    secondaryRoute: 'inst-admissions',
    metrics: [
      { label: 'FSc Pre-Medical Stream', value: '42% Enrollment (357 Students)', status: 'normal' },
      { label: 'ICS (Comp Science) Stream', value: '34% Enrollment (289 Students)', status: 'normal' },
      { label: '75% Attendance Rule', value: '18 Students at Risk of Board Exam Bar', status: 'danger' }
    ]
  },

  // Contextual Dashboard Shortcuts
  shortcuts: [
    {
      ...COMMON_DASHBOARD_SHORTCUTS[0],
      title: 'Subject Attendance Log',
      subtitle: 'Theory & lab batch attendance register'
    },
    {
      ...COMMON_DASHBOARD_SHORTCUTS[1],
      title: 'College Bank Challans',
      subtitle: 'FBISE & intermediate fee vouchers'
    },
    {
      ...COMMON_DASHBOARD_SHORTCUTS[2],
      title: 'Intermediate Timetable',
      subtitle: 'Theory periods & science lab batches'
    },
    {
      ...COMMON_DASHBOARD_SHORTCUTS[3],
      title: 'Lecturers & Faculty',
      subtitle: 'Subject specialists & department roster'
    }
  ],

  navStructure: {
    hasAdmissions: true,
    hasTransport: true,
    hasLibrary: true,
    hasLms: true,
    hasNotices: true,
    hasCertificates: true,
    academicSubLinks: [
      { route: 'inst-classes', label: 'Disciplines & Batches' },
      { route: 'inst-subjects', label: 'Board Curriculum' },
      { route: 'inst-timetable', label: 'College Timetable' },
      { route: 'inst-program-levels', label: 'Program Streams' }
    ]
  }
}
