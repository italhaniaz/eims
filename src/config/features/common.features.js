/**
 * Common / Shared Features Configuration (Base)
 * Defines universal modules, core permissions, standard navigation,
 * and baseline terminology shared across all educational institutions.
 */

export const COMMON_PERMISSIONS = {
  CAN_MANAGE_STUDENTS: 'CAN_MANAGE_STUDENTS',
  CAN_MANAGE_FACULTY: 'CAN_MANAGE_FACULTY',
  CAN_TAKE_ATTENDANCE: 'CAN_TAKE_ATTENDANCE',
  CAN_MANAGE_FEES: 'CAN_MANAGE_FEES',
  CAN_MANAGE_EXAMS: 'CAN_MANAGE_EXAMS',
  CAN_VIEW_NOTICES: 'CAN_VIEW_NOTICES',
  CAN_MANAGE_ACADEMICS: 'CAN_MANAGE_ACADEMICS'
}

export const COMMON_TERMINOLOGY = {
  students: 'Students Directory',
  faculty: 'Staff & Faculty',
  attendance: 'Attendance Register',
  fees: 'Fees & Finance',
  exams: 'Examinations & Results',
  notices: 'Campus Notices',
  learning: 'Study Notes & LMS',
  classes: 'Classes & Sections',
  classUnit: 'Class',
  sectionUnit: 'Section',
  teacherUnit: 'Teacher',
  certificates: 'Certificates',
  curriculum: 'Curriculum & Subjects',
  idLabel: 'Student ID'
}

export const COMMON_ROUTES = [
  'inst-dashboard',
  'inst-students',
  'inst-teachers',
  'inst-attendance',
  'inst-fees',
  'inst-exams',
  'inst-notices',
  'inst-learning',
  'inst-certificates'
]

export const COMMON_DASHBOARD_SHORTCUTS = [
  {
    id: 'attendance',
    route: 'inst-attendance',
    title: 'Mark Attendance',
    subtitle: 'Daily student attendance register',
    icon: 'CalendarCheck',
    color: 'emerald'
  },
  {
    id: 'fees',
    route: 'inst-fees',
    title: 'Fee Management',
    subtitle: 'Generate and track fee vouchers',
    icon: 'Receipt',
    color: 'blue'
  },
  {
    id: 'timetable',
    route: 'inst-timetable',
    title: 'Timetable Matrix',
    subtitle: 'Weekly schedule and routines',
    icon: 'Clock',
    color: 'amber'
  },
  {
    id: 'faculty',
    route: 'inst-teachers',
    title: 'Faculty & Staff',
    subtitle: 'Teachers directory and assignments',
    icon: 'Users',
    color: 'purple'
  }
]
