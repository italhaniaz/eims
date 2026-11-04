/**
 * School Tier Features Configuration
 * Scoped for Primary, Middle, High / Matric & O-Levels institutions (K-10).
 */
import { 
  COMMON_TERMINOLOGY, 
  COMMON_ROUTES, 
  COMMON_DASHBOARD_SHORTCUTS 
} from './common.features.js'

export const SCHOOL_FEATURES = {
  tier: 'school',
  portalTitle: 'School Administration',
  roleBadge: 'School Admin (Principal)',
  portalTypeLabel: 'School Portal (K-10)',
  iconType: 'School',
  badgeColor: 'emerald',
  enabledTiers: ['school'],
  allowedLevelIds: ['preschool', 'elementary', 'secondary'],
  defaultLevel: 'elementary',
  isMultiTier: false,

  terminology: {
    ...COMMON_TERMINOLOGY,
    students: 'Students Directory',
    admissions: 'Admissions & Inquiries',
    faculty: 'Teachers & School Staff',
    attendance: 'Daily Roll Call Register',
    fees: 'Monthly School Fees',
    exams: 'Term Examinations & Marks',
    classes: 'Classes & Sections',
    classUnit: 'Class',
    sectionUnit: 'Section',
    teacherUnit: 'Class Teacher',
    certificates: 'School Leaving (SLC) & Character',
    curriculum: 'Syllabus & Subjects',
    idLabel: 'Student Roll No',
    timetable: 'Class Timetable Matrix',
    levels: 'School Grades (K-10)'
  },

  allowedRoutes: [
    ...COMMON_ROUTES,
    'inst-classes',
    'inst-subjects',
    'inst-timetable',
    'inst-program-levels',
    'inst-admissions',
    'inst-transport',
    'inst-library'
  ],

  // Specific operational sentinel for School Principal
  operationalSentinel: {
    type: 'school-absentee',
    title: 'Daily Absentee Sentinel',
    subtitle: 'Primary & Secondary Wings — Automated Parent Alert',
    badgeText: 'Live SMS Broadcast',
    badgeColor: 'rose',
    statValue: '14 Students',
    statSubtext: 'Absent Today (Unexcused)',
    actionLabel: 'Send 1-Click SMS to Parents',
    actionToast: 'Absentee SMS broadcasted to 14 parent phone numbers successfully!',
    secondaryActionLabel: 'Review Class Diary',
    secondaryRoute: 'inst-learning',
    metrics: [
      { label: 'KG & Primary Absentees', value: '6 absent (96.2% present)', status: 'normal' },
      { label: 'Secondary (Grade 9-10)', value: '8 absent (94.8% present)', status: 'warning' },
      { label: 'PTM Status', value: 'Scheduled for Next Saturday', status: 'info' }
    ]
  },

  // Contextual Dashboard Shortcuts
  shortcuts: [
    {
      ...COMMON_DASHBOARD_SHORTCUTS[0],
      title: 'Daily Roll Call',
      subtitle: 'Active section morning attendance'
    },
    {
      ...COMMON_DASHBOARD_SHORTCUTS[1],
      title: '3-Part Fee Challan',
      subtitle: 'Print monthly bank vouchers'
    },
    {
      ...COMMON_DASHBOARD_SHORTCUTS[2],
      title: 'Class Timetable Matrix',
      subtitle: 'Weekly periods & school routine'
    },
    {
      ...COMMON_DASHBOARD_SHORTCUTS[3],
      title: 'Teachers Directory',
      subtitle: 'Class teachers & subject assignment'
    }
  ],

  // Navigation Items Layout
  navStructure: {
    hasAdmissions: true,
    hasTransport: true,
    hasLibrary: true,
    hasLms: true,
    hasNotices: true,
    hasCertificates: true,
    academicSubLinks: [
      { route: 'inst-classes', label: 'Classes & Sections' },
      { route: 'inst-subjects', label: 'Syllabus & Subjects' },
      { route: 'inst-timetable', label: 'Class Timetable' },
      { route: 'inst-program-levels', label: 'Grade Levels (K-10)' }
    ]
  }
}
