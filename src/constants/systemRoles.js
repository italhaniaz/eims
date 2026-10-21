import { 
  ShieldCheck, 
  School, 
  GraduationCap, 
  BookOpen, 
  Calculator, 
  UserCheck, 
  Users, 
  HeartHandshake,
  KeyRound,
  FileSpreadsheet
} from 'lucide-react'

export const SYSTEM_ROLES = [
  {
    id: 'superadmin',
    name: 'Super Administrator',
    shortName: 'Superadmin',
    category: 'Platform Leadership',
    tierLevel: 'Level 1 - Root System Authority',
    badgeClass: 'bg-purple-50 text-purple-700 border-purple-200',
    dotColor: 'bg-purple-600',
    colorKey: 'purple',
    scope: 'Multi-Campus Global Network (Entire Platform)',
    summary: 'Executive platform authority with full root privileges across all registered campuses, academic curricula, database settings, and system-wide security.',
    icon: KeyRound,
    responsibilities: [
      'Register, approve, and configure new school campuses and branches',
      'Manage platform-wide academic streams, examination boards, and study schemes',
      'Oversee database backups, Supabase cloud configuration, and data integrity',
      'Configure enterprise Role-Based Access Control (RBAC) permissions',
      'Audit platform-wide activity logs, system health, and cross-institute analytics'
    ],
    privileges: [
      'Unrestricted read and write access across all system modules',
      'Authority to delegate and modify permissions for all campus and user roles',
      'Consolidated multi-branch reporting and platform financial oversight'
    ],
    limitations: [
      'Root security policy: Superadmin permissions remain active by default to guarantee continuous platform accessibility and emergency recovery.'
    ]
  },
  {
    id: 'institute_admin',
    name: 'Institute Administrator (Principal / Director)',
    shortName: 'Institute Admin',
    category: 'Campus Leadership',
    tierLevel: 'Level 2 - Campus Executive',
    badgeClass: 'bg-blue-50 text-blue-700 border-blue-200',
    dotColor: 'bg-blue-600',
    colorKey: 'blue',
    scope: 'Assigned Campus / School Branch',
    summary: 'Operational head of campus with full operational authority over student admissions, classes & sections, faculty, fees, exams, and timetables.',
    icon: School,
    responsibilities: [
      'Manage student admission pipeline, registrations, and official roster',
      'Configure academic tiers (Elementary to University) and classes',
      'Set up custom class sections (Super Section, Star Section, Section A/B)',
      'Assign teaching faculty, room allocations, and weekly timetables',
      'Issue monthly/term fee challan vouchers and publish official notices'
    ],
    privileges: [
      'Full administrative control over campus data and academic routines',
      'Authority to admit students, promote grades, and manage student ID cards',
      'Generate campus-specific financial ledgers and attendance statistics'
    ],
    limitations: [
      'Restricted to their assigned institute campus (cannot alter other branches)',
      'Cannot modify global platform configurations or core system databases'
    ]
  },
  {
    id: 'teacher',
    name: 'Faculty Member (Teacher / Lecturer)',
    shortName: 'Teacher',
    category: 'Academic Faculty',
    tierLevel: 'Level 3 - Academic & Classroom',
    badgeClass: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    dotColor: 'bg-emerald-600',
    colorKey: 'emerald',
    scope: 'Assigned Classes, Sections & Subjects',
    summary: 'Educator and classroom instructor responsible for delivering syllabus lectures, taking daily attendance, and recording examination marks.',
    icon: BookOpen,
    responsibilities: [
      'Record daily roll-call attendance register for assigned class sections',
      'Enter test, midterm, and final examination marks and grades',
      'Deliver lectures according to weekly class period routine schedules',
      'Provide individual student remarks, behavior notes, and academic guidance',
      'Monitor classroom section student capacity and student progress'
    ],
    privileges: [
      'Access to daily attendance sheets for assigned classes and sections',
      'Marks entry portal for assigned courses and examination papers',
      'Personal timetable schedule and class roster viewing'
    ],
    limitations: [
      'Cannot generate fee challans or view campus revenue financials',
      'Cannot delete student admission records or modify institute registration'
    ]
  },
  {
    id: 'accountant',
    name: 'Accounts & Finance Officer',
    shortName: 'Accountant',
    category: 'Financial Operations',
    tierLevel: 'Level 3 - Campus Bursar',
    badgeClass: 'bg-amber-50 text-amber-700 border-amber-200',
    dotColor: 'bg-amber-600',
    colorKey: 'amber',
    scope: 'Campus Fees, Invoices & Financial Accounts',
    summary: 'Financial administrator responsible for fee structure management, bank challan voucher generation, collection reconciliations, and ledgers.',
    icon: Calculator,
    responsibilities: [
      'Generate monthly, term, and annual student fee challan vouchers',
      'Reconcile incoming bank challans and update student fee statuses',
      'Track fee defaulters, payment deadlines, and send automated reminders',
      'Export financial revenue reports, collection audits, and ledgers',
      'Process student scholarship concessions, waivers, and discounts'
    ],
    privileges: [
      'Full access to campus fee vouchers, payment statuses, and collections',
      'Ability to mark vouchers as Paid and print official fee receipts',
      'Download campus financial analytics in CSV and Excel formats'
    ],
    limitations: [
      'Cannot modify student examination marks or academic grades',
      'Cannot alter class period timetable schedules or reassign teachers'
    ]
  },
  {
    id: 'student',
    name: 'Enrolled Student (Learner / Scholar)',
    shortName: 'Student',
    category: 'Student Body',
    tierLevel: 'Level 4 - Self-Service Portal',
    badgeClass: 'bg-indigo-50 text-indigo-700 border-indigo-200',
    dotColor: 'bg-indigo-600',
    colorKey: 'indigo',
    scope: 'Personal Academic Profile (Read-Only Self-Service)',
    summary: 'Enrolled student with dedicated self-service access to personal class timetable, attendance percentage, progress report cards, and fee vouchers.',
    icon: GraduationCap,
    responsibilities: [
      'Attend daily scheduled classes and period lectures punctually',
      'Review weekly class timetable, room numbers, and subject periods',
      'Inspect term examination marks, grades, and teacher remarks',
      'Download fee challan vouchers and verify payment records',
      'Monitor personal attendance percentage and library book borrowings'
    ],
    privileges: [
      'View personal weekly period timetable and class section information',
      'Inspect official progress report cards and term examination grades',
      'Download personal student fee vouchers and print official receipts'
    ],
    limitations: [
      'Strict read-only access limited strictly to their own student profile',
      'Cannot view or access other students’ records, marks, or administrative data'
    ]
  },
  {
    id: 'parent',
    name: 'Parent / Guardian (Child Sponsor)',
    shortName: 'Parent / Guardian',
    category: 'Guardian Community',
    tierLevel: 'Level 4 - Guardian Monitoring',
    badgeClass: 'bg-cyan-50 text-cyan-700 border-cyan-200',
    dotColor: 'bg-cyan-600',
    colorKey: 'cyan',
    scope: 'Linked Children Profiles (Read & Monitor)',
    summary: 'Guardian tracking child’s daily presence/absence, examination progress report cards, fee dues, and receiving school announcements.',
    icon: HeartHandshake,
    responsibilities: [
      'Monitor child’s daily attendance alerts (Present, Absent, Leave)',
      'Review term examination report cards and teacher performance feedback',
      'Ensure timely payment of student fee challan vouchers',
      'Receive official school circulars, event notices, and emergency alerts',
      'Communicate with school administration and faculty in-charge'
    ],
    privileges: [
      'Real-time access to linked children’s attendance and academic results',
      'Direct download of student fee challans and payment verification',
      'Official progress reports and student disciplinary records viewing'
    ],
    limitations: [
      'Strictly restricted to their own registered children profiles',
      'Cannot modify school records, marks, or attendance logs'
    ]
  }
]

export const DEFAULT_RBAC_PERMISSIONS = [
  // 1. MAIN GLOBAL FEATURES (Platform Governance)
  {
    id: 'perm-1',
    category: 'Main Platform Governance',
    label: 'Access Global Superadmin Dashboard & Multi-Campus Analytics',
    superadmin: true,
    institute_admin: false,
    teacher: false,
    accountant: false,
    student: false,
    parent: false
  },
  {
    id: 'perm-2',
    category: 'Main Platform Governance',
    label: 'Register, Verify & Manage Institutes & Campuses',
    superadmin: true,
    institute_admin: false,
    teacher: false,
    accountant: false,
    student: false,
    parent: false
  },
  {
    id: 'perm-3',
    category: 'Main Platform Governance',
    label: 'Manage Global Academic Streams, Examination Boards & Degrees',
    superadmin: true,
    institute_admin: false,
    teacher: false,
    accountant: false,
    student: false,
    parent: false
  },
  {
    id: 'perm-4',
    category: 'Main Platform Governance',
    label: 'Database Backup, Supabase Cloud Sync & Core System Settings',
    superadmin: true,
    institute_admin: false,
    teacher: false,
    accountant: false,
    student: false,
    parent: false
  },
  {
    id: 'perm-5',
    category: 'Main Platform Governance',
    label: 'Global Audit Logs, Security Access Traces & RBAC Policies',
    superadmin: true,
    institute_admin: false,
    teacher: false,
    accountant: false,
    student: false,
    parent: false
  },

  // 2. CAMPUS OPERATIONAL FEATURES (Institute Admin & Campus Staff)
  {
    id: 'perm-6',
    category: 'Campus Operational Management',
    label: 'Access Institute Admin Dashboard & Campus Academic Tiers',
    superadmin: true,
    institute_admin: true,
    teacher: false,
    accountant: false,
    student: false,
    parent: false
  },
  {
    id: 'perm-7',
    category: 'Campus Operational Management',
    label: 'Student Admissions Pipeline & Official Enrollment Roster',
    superadmin: true,
    institute_admin: true,
    teacher: false,
    accountant: false,
    student: false,
    parent: false
  },
  {
    id: 'perm-8',
    category: 'Academics & Classroom',
    label: 'Configure Classes & Custom Multi-Sections (Super Section, etc.)',
    superadmin: true,
    institute_admin: true,
    teacher: false,
    accountant: false,
    student: false,
    parent: false
  },
  {
    id: 'perm-9',
    category: 'Academics & Classroom',
    label: 'Record Daily Student Attendance Register',
    superadmin: true,
    institute_admin: true,
    teacher: true,
    accountant: false,
    student: false,
    parent: false
  },
  {
    id: 'perm-10',
    category: 'Academics & Classroom',
    label: 'Class Timetable & Period Slot Scheduling',
    superadmin: true,
    institute_admin: true,
    teacher: true,
    accountant: false,
    student: false,
    parent: false
  },
  {
    id: 'perm-11',
    category: 'Finance & Accounts',
    label: 'Generate Fee Challans, Concessions & Reconcile Payments',
    superadmin: true,
    institute_admin: true,
    teacher: false,
    accountant: true,
    student: false,
    parent: false
  },
  {
    id: 'perm-12',
    category: 'Examinations & Grading',
    label: 'Enter Exam Marks & Generate Student Progress Report Cards',
    superadmin: true,
    institute_admin: true,
    teacher: true,
    accountant: false,
    student: false,
    parent: false
  },
  {
    id: 'perm-13',
    category: 'Campus Services & Logistics',
    label: 'Manage Transport Routes & Library Catalog',
    superadmin: true,
    institute_admin: true,
    teacher: false,
    accountant: false,
    student: false,
    parent: false
  },
  {
    id: 'perm-14',
    category: 'Student Self-Service',
    label: 'Student Portal Access (Personal Timetable, Marks & Fee Vouchers)',
    superadmin: true,
    institute_admin: true,
    teacher: false,
    accountant: false,
    student: true,
    parent: false
  },
  {
    id: 'perm-15',
    category: 'Parent Portal',
    label: 'Parent Portal Access (Child Attendance, Reports & Fee Challans)',
    superadmin: true,
    institute_admin: true,
    teacher: false,
    accountant: false,
    student: false,
    parent: true
  }
]

export const getRoleMeta = (roleId) => {
  return SYSTEM_ROLES.find(r => r.id === roleId) || {
    id: roleId,
    name: roleId ? roleId.replace('_', ' ').toUpperCase() : 'Custom Role',
    shortName: roleId,
    badgeClass: 'bg-slate-50 text-slate-700 border-slate-200',
    tierLevel: 'Standard User'
  }
}
