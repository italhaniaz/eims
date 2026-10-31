/**
 * Custom / Hybrid Multi-Tier Features Configuration
 * Scoped for Comprehensive Campuses housing School, College, and University wings simultaneously.
 */
import { 
  COMMON_TERMINOLOGY, 
  COMMON_ROUTES, 
  COMMON_DASHBOARD_SHORTCUTS 
} from './common.features'

export const CUSTOM_FEATURES = {
  tier: 'custom',
  portalTitle: 'Campus Administrative Center',
  roleBadge: 'Campus Director (Comprehensive)',
  portalTypeLabel: 'Comprehensive Campus (K-16)',
  iconType: 'School',
  badgeColor: 'emerald',
  enabledTiers: ['school', 'college', 'undergraduate'],
  allowedLevelIds: ['preschool', 'elementary', 'secondary', 'higher-secondary', 'university'],
  defaultLevel: 'all',
  isMultiTier: true,

  terminology: {
    ...COMMON_TERMINOLOGY,
    students: 'Campus Student Directory',
    admissions: 'Admissions & Multi-Wing Leads',
    faculty: 'Faculty & Administrative Staff',
    attendance: 'Comprehensive Attendance Register',
    fees: 'Campus Billing & Fee Collection',
    exams: 'Term & Board Examinations',
    classes: 'Classes, Streams & Degree Programs',
    classUnit: 'Class / Program',
    sectionUnit: 'Section / Cohort',
    teacherUnit: 'Faculty Member',
    certificates: 'School (SLC) / College (CLC) Certificates',
    curriculum: 'Cross-Tier Academic Curriculum',
    idLabel: 'Student / Reg ID',
    timetable: 'Campus Master Timetable',
    levels: 'All Academic Program Levels'
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

  // Specific operational sentinel for Multi-Wing Campus Director
  operationalSentinel: {
    type: 'composite-sentinel',
    title: 'Cross-Wing Operational Health Sentinel',
    subtitle: 'Comprehensive K-16 Campus — Unified Operations & Compliance',
    badgeText: 'Multi-Wing Synchronized',
    badgeColor: 'emerald',
    statValue: '96.4% Operational',
    statSubtext: 'Across School, College & University Wings',
    actionLabel: 'Audit Multi-Wing Attendance',
    actionToast: 'Comprehensive attendance sync complete across all academic wings.',
    secondaryActionLabel: 'Review Admissions Pipeline',
    secondaryRoute: 'inst-admissions',
    metrics: [
      { label: 'School Wing (K-10)', value: '450 Students Enrolled (Active)', status: 'normal' },
      { label: 'College Wing (11-12)', value: '320 Students Enrolled (FBISE Reg)', status: 'normal' },
      { label: 'University Wing (BS)', value: '280 Students Enrolled (HEC Rec)', status: 'success' }
    ]
  },

  // Contextual Dashboard Shortcuts
  shortcuts: [
    {
      ...COMMON_DASHBOARD_SHORTCUTS[0],
      title: 'Multi-Wing Roll Call',
      subtitle: 'Synchronized morning & lecture register'
    },
    {
      ...COMMON_DASHBOARD_SHORTCUTS[1],
      title: 'Fee Challans & Billing',
      subtitle: '3-Part bank slips & 1-Bill integration'
    },
    {
      ...COMMON_DASHBOARD_SHORTCUTS[2],
      title: 'Master Campus Timetable',
      subtitle: 'Periods, lecture rooms & science labs'
    },
    {
      ...COMMON_DASHBOARD_SHORTCUTS[3],
      title: 'Multi-Tier Faculty',
      subtitle: 'Teachers, lecturers & professors directory'
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
      { route: 'inst-classes', label: 'Classes & Programs' },
      { route: 'inst-subjects', label: 'Curriculum & Subjects' },
      { route: 'inst-timetable', label: 'Campus Timetable' },
      { route: 'inst-program-levels', label: 'Academic Levels & Wings' }
    ]
  }
}
