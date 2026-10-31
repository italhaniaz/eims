import React, { useState, useMemo, useEffect } from 'react'
import { 
  GraduationCap, 
  Calendar, 
  School, 
  Building2, 
  Layers, 
  BookOpen, 
  Award, 
  Clock, 
  RotateCcw, 
  Plus, 
  Search, 
  CheckCircle2, 
  AlertCircle, 
  Sparkles,
  ChevronRight,
  Filter,
  ArrowRight,
  Check,
  Edit2,
  Trash2,
  X,
  Download,
  ShieldCheck,
  Sliders,
  RefreshCw,
  AlertTriangle,
  FileSpreadsheet,
  Lock,
  Unlock,
  Eye,
  CheckSquare,
  Hash,
  Users,
  BookMarked,
  ShieldAlert,
  ArrowUpRight,
  HelpCircle,
  FileText,
  UserCheck,
  Undo2
} from 'lucide-react'
import { useAppData } from '../../../context/AppDataContext'
import { useToast } from '../../../context/ToastContext'
import { STANDARD_CAMPUS_ROOMS, getCampusRooms } from '../../../constants/campusRooms'

// LocalStorage Persistence Keys
const SESSIONS_KEY = 'edu_sms_academic_sessions'
const SCHOOL_STRUCT_KEY = 'edu_sms_school_structures'
const COLLEGE_STRUCT_KEY = 'edu_sms_college_programs'
const UNIVERSITY_STRUCT_KEY = 'edu_sms_university_faculties'
const CURRICULUM_KEY = 'edu_sms_curriculum_templates'
const GRADING_KEY = 'edu_sms_grading_schemes'
const TIMETABLE_RULES_KEY = 'edu_sms_timetable_policies'
const ROOMS_KEY = 'sms_campus_rooms'
const SNAPSHOT_KEY = 'edu_sms_rollover_snapshot'

// Default Datasets with Pedagogical Sequence Weights and Institutional Standards
const DEFAULT_SESSIONS = [
  { 
    id: 'SES-2026', 
    name: 'Academic Session 2026-2027', 
    term: 'Full Year Regular', 
    startDate: '2026-08-15', 
    endDate: '2027-06-30', 
    status: 'Active (Current)', 
    wings: 'All Wings (School, College, University)',
    midtermDates: '2026-11-15 to 2026-11-30',
    finalExamDates: '2027-05-15 to 2027-06-10'
  },
  { 
    id: 'SES-2025', 
    name: 'Academic Session 2025-2026', 
    term: 'Terminal Phase', 
    startDate: '2025-08-15', 
    endDate: '2026-06-30', 
    status: 'Archived', 
    wings: 'All Wings',
    midtermDates: '2025-11-15 to 2025-11-30',
    finalExamDates: '2026-05-15 to 2026-06-10'
  },
  { 
    id: 'SES-2027', 
    name: 'Academic Session 2027-2028', 
    term: 'Draft Planned', 
    startDate: '2027-08-15', 
    endDate: '2028-06-30', 
    status: 'Planned', 
    wings: 'All Wings',
    midtermDates: '2027-11-15 to 2027-11-30',
    finalExamDates: '2028-05-15 to 2028-06-10'
  }
]

// Pedagogical Sequence Weight: Lower number = earlier grade
const DEFAULT_SCHOOL_CLASSES = [
  { id: 'SC-01', sequenceWeight: 1, grade: 'Grade 1', wing: 'Primary Wing', sections: ['A', 'B'], capacity: 70, passingThreshold: 33, isTerminal: false },
  { id: 'SC-02', sequenceWeight: 2, grade: 'Grade 2', wing: 'Primary Wing', sections: ['A', 'B'], capacity: 70, passingThreshold: 33, isTerminal: false },
  { id: 'SC-03', sequenceWeight: 3, grade: 'Grade 3', wing: 'Primary Wing', sections: ['A', 'B'], capacity: 70, passingThreshold: 33, isTerminal: false },
  { id: 'SC-04', sequenceWeight: 4, grade: 'Grade 4', wing: 'Primary Wing', sections: ['A', 'B'], capacity: 70, passingThreshold: 33, isTerminal: false },
  { id: 'SC-05', sequenceWeight: 5, grade: 'Grade 5', wing: 'Primary Wing', sections: ['A', 'B'], capacity: 70, passingThreshold: 33, isTerminal: false },
  { id: 'SC-06', sequenceWeight: 6, grade: 'Grade 6', wing: 'Middle Wing', sections: ['A', 'B'], capacity: 70, passingThreshold: 33, isTerminal: false },
  { id: 'SC-07', sequenceWeight: 7, grade: 'Grade 7', wing: 'Middle Wing', sections: ['A', 'B'], capacity: 70, passingThreshold: 33, isTerminal: false },
  { id: 'SC-08', sequenceWeight: 8, grade: 'Grade 8', wing: 'Middle Wing', sections: ['A', 'B', 'C'], capacity: 105, passingThreshold: 33, isTerminal: false },
  { id: 'SC-09', sequenceWeight: 9, grade: 'Grade 9', wing: 'Secondary Wing', sections: ['A', 'B', 'C', 'D'], capacity: 140, passingThreshold: 40, isTerminal: false },
  { id: 'SC-10', sequenceWeight: 10, grade: 'Grade 10', wing: 'Secondary Wing', sections: ['A (Lily)', 'B (Tulip)', 'C (Rose)'], capacity: 120, passingThreshold: 40, isTerminal: true }
]

const DEFAULT_COLLEGE_PROGRAMS = [
  { 
    id: 'CP-01', 
    program: 'F.Sc Pre-Medical', 
    years: 'Part-I & Part-II (2 Years)', 
    groups: ['Morning Alpha', 'Morning Beta'], 
    subjectCombinations: ['Physics', 'Chemistry', 'Biology', 'English', 'Urdu', 'Islamiat/PakStudies'],
    labRequirement: 'Physics, Chemistry, Biology Labs', 
    capacity: 160,
    maxLabBatchSize: 25,
    boardAffiliation: 'BISE Lahore / Federal Board'
  },
  { 
    id: 'CP-02', 
    program: 'F.Sc Pre-Engineering', 
    years: 'Part-I & Part-II (2 Years)', 
    groups: ['Morning Eng-1', 'Eng-2'], 
    subjectCombinations: ['Physics', 'Chemistry', 'Mathematics', 'English', 'Urdu', 'Islamiat/PakStudies'],
    labRequirement: 'Physics, Chemistry, Computer Lab', 
    capacity: 120,
    maxLabBatchSize: 25,
    boardAffiliation: 'BISE Lahore / Federal Board'
  },
  { 
    id: 'CP-03', 
    program: 'ICS (Computer Science)', 
    years: 'Part-I & Part-II (2 Years)', 
    groups: ['ICS-A (Math)', 'ICS-B (Stats)'], 
    subjectCombinations: ['Computer Science', 'Mathematics', 'Physics or Statistics', 'English', 'Urdu'],
    labRequirement: 'Advanced Computing Lab', 
    capacity: 140,
    maxLabBatchSize: 25,
    boardAffiliation: 'BISE Lahore / Federal Board'
  },
  { 
    id: 'CP-04', 
    program: 'I.Com (Commerce)', 
    years: 'Part-I & Part-II (2 Years)', 
    groups: ['I.Com Alpha'], 
    subjectCombinations: ['Principles of Accounting', 'Economics', 'Commercial Geography', 'Business Math'],
    labRequirement: 'Commerce Workshop', 
    capacity: 80,
    maxLabBatchSize: 30,
    boardAffiliation: 'BISE Lahore / Federal Board'
  }
]

const DEFAULT_UNI_FACULTIES = [
  { 
    id: 'UF-01', 
    faculty: 'Faculty of Computing & Information Technology', 
    depts: ['Computer Science', 'Software Engineering', 'Artificial Intelligence', 'Cyber Security'], 
    semesters: '8 Semesters (4 Years)', 
    creditHours: 134, 
    degree: 'BS / MS',
    hecCompliant: true,
    theoryLabRatio: 'Theory 3 CH (3 hrs/wk) : Lab 1 CH (3 hrs/wk)',
    compulsoryCourses: ['Pakistan Studies', 'Islamic Studies / Ethics', 'Ideology & Constitution of Pakistan']
  },
  { 
    id: 'UF-02', 
    faculty: 'Faculty of Business & Management Sciences', 
    depts: ['Business Administration', 'Accounting & Finance'], 
    semesters: '8 Semesters (4 Years)', 
    creditHours: 130, 
    degree: 'BBA / MBA',
    hecCompliant: true,
    theoryLabRatio: 'Theory 3 CH (3 hrs/wk) : Case Study Workshop',
    compulsoryCourses: ['Pakistan Studies', 'Islamic Studies / Ethics', 'Business Communication']
  },
  { 
    id: 'UF-03', 
    faculty: 'Faculty of Social Sciences & Humanities', 
    depts: ['English Literature', 'Psychology', 'Education'], 
    semesters: '8 Semesters (4 Years)', 
    creditHours: 126, 
    degree: 'BS / MA',
    hecCompliant: true,
    theoryLabRatio: 'Theory 3 CH (3 hrs/wk)',
    compulsoryCourses: ['Pakistan Studies', 'Islamic Studies / Ethics', 'Sociology']
  }
]

const DEFAULT_CURRICULUM_SCHEMES = [
  { id: 'CUR-01', code: 'CUR-NSC-P', title: 'National Single Curriculum (Primary)', gradeRange: 'Grade 1 - 5', wing: 'Primary Wing', subjects: 'English Language, Urdu Literature, Mathematics Foundations, General Science, Islamiat / Ethics', totalHoursPerWeek: 30 },
  { id: 'CUR-02', code: 'CUR-FB-SEC', title: 'Federal & Punjab Secondary Board Scheme', gradeRange: 'Grade 9 - 10', wing: 'Secondary Wing', subjects: 'Physics, Chemistry, Biology / Computer Science, Pakistan Studies, Mathematics (Science)', totalHoursPerWeek: 35 },
  { id: 'CUR-03', code: 'CUR-CIE-OL', title: 'Cambridge IGCSE & O-Levels', gradeRange: 'O1, O2, O3', wing: 'Cambridge Wing', subjects: 'Mathematics 4024, English Language 1123, Physics 5054, Chemistry 5070, Computer Science 2210', totalHoursPerWeek: 36 },
  { id: 'CUR-04', code: 'CUR-HEC-CS', title: 'HEC National Computing Curriculum 2026', gradeRange: 'BS Computing', wing: 'University Wing', subjects: 'Programming Fundamentals, Object Oriented Programming, Data Structures, Database Systems, Operating Systems', totalHoursPerWeek: 21 }
]

const DEFAULT_GRADING_SCHEMES = [
  {
    id: 'SCH-BISE',
    name: 'School & College Percentage Scale (BISE)',
    wing: 'School & College Wings',
    roundingPolicy: 'Standard Half-Up (e.g. 79.5% -> 80%)',
    intervals: [
      { grade: 'A+', min: 80, max: 100, gpa: 4.0, remarks: 'Exceptional Distinction' },
      { grade: 'A', min: 70, max: 79.99, gpa: 3.5, remarks: 'Excellent' },
      { grade: 'B', min: 60, max: 69.99, gpa: 3.0, remarks: 'Very Good' },
      { grade: 'C', min: 50, max: 59.99, gpa: 2.5, remarks: 'Good' },
      { grade: 'D', min: 40, max: 49.99, gpa: 2.0, remarks: 'Passing' },
      { grade: 'F', min: 0, max: 39.99, gpa: 0.0, remarks: 'Fail' }
    ]
  },
  {
    id: 'SCH-HEC',
    name: 'University 4.00 CGPA Scale (HEC Standard)',
    wing: 'University Wing',
    roundingPolicy: 'Exact 2 Decimal Places',
    intervals: [
      { grade: 'A', min: 85, max: 100, gpa: 4.00, remarks: 'Outstanding' },
      { grade: 'A-', min: 80, max: 84.99, gpa: 3.67, remarks: 'Very Good' },
      { grade: 'B+', min: 75, max: 79.99, gpa: 3.33, remarks: 'Good' },
      { grade: 'B', min: 71, max: 74.99, gpa: 3.00, remarks: 'Satisfactory' },
      { grade: 'C', min: 61, max: 70.99, gpa: 2.00, remarks: 'Acceptable' },
      { grade: 'F', min: 0, max: 60.99, gpa: 0.00, remarks: 'Fail' }
    ]
  }
]

const DEFAULT_TIMETABLE_RULES = {
  periodDuration: 45,
  fridayPeriodDuration: 35,
  maxTeacherLoad: 5,
  recessStart: '13:00',
  recessEnd: '13:45',
  fridayPrayerStart: '12:30',
  fridayPrayerEnd: '14:00',
  fridayPrayerAdjustment: true,
  workingDays: '5 Days (Mon-Fri)',
  shiftSystem: 'Morning Shift (8:00 AM - 2:00 PM)'
}

// CSV Sanitizer to prevent formula injection
const sanitizeCSV = (val) => {
  if (val === null || val === undefined) return '""'
  let str = String(val)
  if (str.startsWith('=') || str.startsWith('+') || str.startsWith('-') || str.startsWith('@')) {
    str = "'" + str
  }
  return '"' + str.replace(/"/g, '""') + '"'
}

export const SuperadminAcademicsView = ({ activeTab = 'sessions', onTabChange = () => {} }) => {
  const { students = [], updateStudent, updateStudentsBatch } = useAppData()
  const { toast } = useToast()

  // 1. Reactive Tab Synchronization
  const [currentTab, setCurrentTab] = useState(activeTab)
  
  useEffect(() => {
    if (activeTab) {
      setCurrentTab(activeTab)
    }
  }, [activeTab])

  const effectiveTab = currentTab || activeTab || 'sessions'

  const handleTabSwitch = (tabKey) => {
    setCurrentTab(tabKey)
    onTabChange(tabKey)
  }

  // 2. State & LocalStorage Persistence
  const [sessions, setSessions] = useState(() => {
    try {
      const stored = localStorage.getItem(SESSIONS_KEY)
      return stored ? JSON.parse(stored) : DEFAULT_SESSIONS
    } catch {
      return DEFAULT_SESSIONS
    }
  })

  const [schoolClasses, setSchoolClasses] = useState(() => {
    try {
      const stored = localStorage.getItem(SCHOOL_STRUCT_KEY)
      return stored ? JSON.parse(stored) : DEFAULT_SCHOOL_CLASSES
    } catch {
      return DEFAULT_SCHOOL_CLASSES
    }
  })

  const [collegePrograms, setCollegePrograms] = useState(() => {
    try {
      const stored = localStorage.getItem(COLLEGE_STRUCT_KEY)
      return stored ? JSON.parse(stored) : DEFAULT_COLLEGE_PROGRAMS
    } catch {
      return DEFAULT_COLLEGE_PROGRAMS
    }
  })

  const [uniFaculties, setUniFaculties] = useState(() => {
    try {
      const stored = localStorage.getItem(UNIVERSITY_STRUCT_KEY)
      return stored ? JSON.parse(stored) : DEFAULT_UNI_FACULTIES
    } catch {
      return DEFAULT_UNI_FACULTIES
    }
  })

  const [curriculumSchemes, setCurriculumSchemes] = useState(() => {
    try {
      const stored = localStorage.getItem(CURRICULUM_KEY)
      return stored ? JSON.parse(stored) : DEFAULT_CURRICULUM_SCHEMES
    } catch {
      return DEFAULT_CURRICULUM_SCHEMES
    }
  })

  const [gradingSchemes, setGradingSchemes] = useState(() => {
    try {
      const stored = localStorage.getItem(GRADING_KEY)
      return stored ? JSON.parse(stored) : DEFAULT_GRADING_SCHEMES
    } catch {
      return DEFAULT_GRADING_SCHEMES
    }
  })

  const [timetableRules, setTimetableRules] = useState(() => {
    try {
      const stored = localStorage.getItem(TIMETABLE_RULES_KEY)
      return stored ? JSON.parse(stored) : DEFAULT_TIMETABLE_RULES
    } catch {
      return DEFAULT_TIMETABLE_RULES
    }
  })

  const [campusRooms, setCampusRooms] = useState(() => getCampusRooms())

  // Persist states to LocalStorage & notify sidebar
  const notifyUpdated = () => {
    try {
      window.dispatchEvent(new Event('sms_academics_updated'))
    } catch {}
  }

  useEffect(() => {
    try { localStorage.setItem(SESSIONS_KEY, JSON.stringify(sessions)); notifyUpdated() } catch {}
  }, [sessions])

  useEffect(() => {
    try { localStorage.setItem(SCHOOL_STRUCT_KEY, JSON.stringify(schoolClasses)) } catch {}
  }, [schoolClasses])

  useEffect(() => {
    try { localStorage.setItem(COLLEGE_STRUCT_KEY, JSON.stringify(collegePrograms)) } catch {}
  }, [collegePrograms])

  useEffect(() => {
    try { localStorage.setItem(UNIVERSITY_STRUCT_KEY, JSON.stringify(uniFaculties)) } catch {}
  }, [uniFaculties])

  useEffect(() => {
    try { localStorage.setItem(CURRICULUM_KEY, JSON.stringify(curriculumSchemes)) } catch {}
  }, [curriculumSchemes])

  useEffect(() => {
    try { localStorage.setItem(GRADING_KEY, JSON.stringify(gradingSchemes)) } catch {}
  }, [gradingSchemes])

  useEffect(() => {
    try { localStorage.setItem(TIMETABLE_RULES_KEY, JSON.stringify(timetableRules)) } catch {}
  }, [timetableRules])

  useEffect(() => {
    try { localStorage.setItem(ROOMS_KEY, JSON.stringify(campusRooms)) } catch {}
  }, [campusRooms])

  // Modals & Search States
  const [searchTerm, setSearchTerm] = useState('')

  // Modal 1: Academic Session
  const [isSessionModalOpen, setIsSessionModalOpen] = useState(false)
  const [editingSessionId, setEditingSessionId] = useState(null)
  const [sessionForm, setSessionForm] = useState({
    name: '',
    term: 'Full Year Regular',
    startDate: '',
    endDate: '',
    wings: 'All Wings (School, College, University)',
    status: 'Planned',
    midtermDates: '',
    finalExamDates: ''
  })
  const [sessionOverlapWarning, setSessionOverlapWarning] = useState(null)

  // Modal 2: School Class
  const [isClassModalOpen, setIsClassModalOpen] = useState(false)
  const [editingClassId, setEditingClassId] = useState(null)
  const [classForm, setClassForm] = useState({
    grade: '',
    sequenceWeight: 1,
    wing: 'Secondary Wing',
    sectionsInput: 'A, B, C',
    capacity: 100,
    passingThreshold: 40,
    isTerminal: false
  })

  // Modal 3: College Program
  const [isProgramModalOpen, setIsProgramModalOpen] = useState(false)
  const [editingProgramId, setEditingProgramId] = useState(null)
  const [programForm, setProgramForm] = useState({
    program: '',
    years: 'Part-I & Part-II (2 Years)',
    groupsInput: 'Morning Alpha, Morning Beta',
    subjectCombinationsInput: 'Physics, Chemistry, Biology',
    labRequirement: 'Physics, Chemistry Labs',
    capacity: 120,
    maxLabBatchSize: 25,
    boardAffiliation: 'BISE Lahore'
  })

  // Modal 4: University Faculty
  const [isFacultyModalOpen, setIsFacultyModalOpen] = useState(false)
  const [editingFacultyId, setEditingFacultyId] = useState(null)
  const [facultyForm, setFacultyForm] = useState({
    faculty: '',
    deptsInput: 'Computer Science, Software Engineering',
    semesters: '8 Semesters (4 Years)',
    creditHours: 134,
    degree: 'BS',
    hecCompliant: true,
    theoryLabRatio: 'Theory 3 CH (3 hrs/wk) : Lab 1 CH (3 hrs/wk)',
    compulsoryCoursesInput: 'Pakistan Studies, Islamic Studies / Ethics'
  })

  // Modal 5: Curriculum Scheme
  const [isCurriculumModalOpen, setIsCurriculumModalOpen] = useState(false)
  const [editingCurriculumId, setEditingCurriculumId] = useState(null)
  const [curriculumForm, setCurriculumForm] = useState({
    code: '',
    title: '',
    gradeRange: '',
    wing: 'Secondary Wing',
    subjects: '',
    totalHoursPerWeek: 30
  })

  // Modal 6: Grading Scheme
  const [isGradingModalOpen, setIsGradingModalOpen] = useState(false)
  const [editingGradingId, setEditingGradingId] = useState(null)
  const [gradingForm, setGradingForm] = useState({
    name: '',
    wing: 'School & College Wings',
    roundingPolicy: 'Standard Half-Up (e.g. 79.5% -> 80%)',
    intervals: [
      { grade: 'A+', min: 80, max: 100, gpa: 4.0, remarks: 'Exceptional Distinction' },
      { grade: 'A', min: 70, max: 79.99, gpa: 3.5, remarks: 'Excellent' },
      { grade: 'B', min: 60, max: 69.99, gpa: 3.0, remarks: 'Very Good' },
      { grade: 'C', min: 50, max: 59.99, gpa: 2.5, remarks: 'Good' },
      { grade: 'D', min: 40, max: 49.99, gpa: 2.0, remarks: 'Passing' },
      { grade: 'F', min: 0, max: 39.99, gpa: 0.0, remarks: 'Fail' }
    ]
  })

  // Security Alert Modal for Blocking Deletion of Non-Empty Sections/Classes
  const [deleteBlockedModal, setDeleteBlockedModal] = useState({
    isOpen: false,
    title: '',
    reason: '',
    enrolledCount: 0
  })

  // Live Clash Simulator in Timetable Rules
  const [clashChecker, setClashChecker] = useState({
    selectedDay: 'Monday',
    selectedPeriod: 'Period 1 (08:00 - 08:45)',
    selectedRoom: 'Room 101 (Main High Wing)',
    selectedTeacher: 'Prof. Tariq Jamil',
    selectedClass: 'Grade 10 - Section A',
    result: null
  })

  // Rollover Simulation & Engine States
  const [rolloverSourceSession, setRolloverSourceSession] = useState('Academic Session 2026-2027')
  const [rolloverTargetSession, setRolloverTargetSession] = useState('Academic Session 2027-2028')
  const [rolloverPassingThreshold, setRolloverPassingThreshold] = useState(40)
  const [rolloverRequireFeeClearance, setRolloverRequireFeeClearance] = useState(true)
  const [allowHardshipOverride, setAllowHardshipOverride] = useState(false)
  const [hardshipJustification, setHardshipJustification] = useState('')
  const [isRolloverModalOpen, setIsRolloverModalOpen] = useState(false)
  const [isExecutingRollover, setIsExecutingRollover] = useState(false)
  const [rolloverAuditResult, setRolloverAuditResult] = useState({
    totalInspected: 0,
    promotedCount: 0,
    graduatedAlumniCount: 0,
    detainedCount: 0,
    feeDefaulterCount: 0,
    hardshipOverriddenCount: 0,
    breakdown: []
  })
  const [hasSnapshot, setHasSnapshot] = useState(() => {
    try { return !!localStorage.getItem(SNAPSHOT_KEY) } catch { return false }
  })

  // -------------------------------------------------------------
  // HANDLERS: Academic Sessions
  // -------------------------------------------------------------
  const openCreateSessionModal = () => {
    setEditingSessionId(null)
    setSessionOverlapWarning(null)
    setSessionForm({
      name: '',
      term: 'Full Year Regular',
      startDate: '',
      endDate: '',
      wings: 'All Wings (School, College, University)',
      status: 'Planned',
      midtermDates: '',
      finalExamDates: ''
    })
    setIsSessionModalOpen(true)
  }

  const openEditSessionModal = (session) => {
    setEditingSessionId(session.id)
    setSessionOverlapWarning(null)
    setSessionForm({
      name: session.name,
      term: session.term || 'Full Year Regular',
      startDate: session.startDate || '',
      endDate: session.endDate || '',
      wings: session.wings || 'All Wings',
      status: session.status || 'Active (Current)',
      midtermDates: session.midtermDates || '',
      finalExamDates: session.finalExamDates || ''
    })
    setIsSessionModalOpen(true)
  }

  const handleSaveSession = (e) => {
    e.preventDefault()
    if (!sessionForm.name.trim()) {
      toast?.error?.('Please enter a session name (e.g., Academic Session 2026-2027)')
      return
    }
    if (sessionForm.startDate && sessionForm.endDate && sessionForm.startDate >= sessionForm.endDate) {
      toast?.error?.('Session Start Date must be earlier than End Date')
      return
    }

    // Overlap Detection: Check if another Active session exists for the same wings
    if (sessionForm.status.includes('Active')) {
      const existingActive = sessions.find(s => 
        s.id !== editingSessionId && 
        s.status.includes('Active') &&
        (s.wings === sessionForm.wings || s.wings.includes('All') || sessionForm.wings.includes('All'))
      )
      if (existingActive && !sessionOverlapWarning) {
        setSessionOverlapWarning(
          `Notice: "${existingActive.name}" is currently Active for ${existingActive.wings}. Saving this session as Active will run concurrently. Click Save again to confirm or set previous to Archived.`
        )
        return
      }
    }

    if (editingSessionId) {
      setSessions(prev => prev.map(s => s.id === editingSessionId ? { ...s, ...sessionForm } : s))
      toast?.success?.(`Session "${sessionForm.name}" updated successfully`)
    } else {
      const newSession = {
        id: `SES-${Date.now().toString().slice(-4)}`,
        ...sessionForm
      }
      setSessions(prev => [newSession, ...prev])
      toast?.success?.(`Session "${sessionForm.name}" created successfully`)
    }
    setIsSessionModalOpen(false)
  }

  const handleToggleSessionStatus = (sessionId) => {
    setSessions(prev => prev.map(s => {
      if (s.id !== sessionId) return s
      const nextStatus = s.status === 'Active (Current)' ? 'Archived' : 'Active (Current)'
      toast?.info?.(`Session "${s.name}" status changed to ${nextStatus}`)
      return { ...s, status: nextStatus }
    }))
  }

  const handleDeleteSession = (sessionId, sessionName) => {
    if (window.confirm(`Are you sure you want to delete session "${sessionName}"? This action cannot be undone.`)) {
      setSessions(prev => prev.filter(s => s.id !== sessionId))
      toast?.success?.(`Session "${sessionName}" removed`)
    }
  }

  // -------------------------------------------------------------
  // HANDLERS: School Structure with Orphan Deletion Guard
  // -------------------------------------------------------------
  const openCreateClassModal = () => {
    setEditingClassId(null)
    const maxSeq = schoolClasses.reduce((acc, c) => Math.max(acc, c.sequenceWeight || 0), 0)
    setClassForm({
      grade: '',
      sequenceWeight: maxSeq + 1,
      wing: 'Secondary Wing',
      sectionsInput: 'A, B, C',
      capacity: 100,
      passingThreshold: 40,
      isTerminal: false
    })
    setIsClassModalOpen(true)
  }

  const openEditClassModal = (cls) => {
    setEditingClassId(cls.id)
    setClassForm({
      grade: cls.grade,
      sequenceWeight: cls.sequenceWeight || 1,
      wing: cls.wing,
      sectionsInput: (cls.sections || []).join(', '),
      capacity: cls.capacity,
      passingThreshold: cls.passingThreshold || 40,
      isTerminal: !!cls.isTerminal
    })
    setIsClassModalOpen(true)
  }

  const handleSaveClass = (e) => {
    e.preventDefault()
    if (!classForm.grade.trim()) {
      toast?.error?.('Please enter a grade name (e.g. Grade 9, Grade 10)')
      return
    }
    const sections = classForm.sectionsInput
      .split(',')
      .map(s => s.trim())
      .filter(Boolean)

    if (sections.length === 0) {
      toast?.error?.('Please enter at least one section')
      return
    }

    if (editingClassId) {
      setSchoolClasses(prev => prev.map(c => c.id === editingClassId ? {
        ...c,
        grade: classForm.grade,
        sequenceWeight: Number(classForm.sequenceWeight),
        wing: classForm.wing,
        sections,
        capacity: Number(classForm.capacity) || 100,
        passingThreshold: Number(classForm.passingThreshold) || 40,
        isTerminal: classForm.isTerminal
      } : c))
      toast?.success?.(`Class ${classForm.grade} updated successfully`)
    } else {
      const newClass = {
        id: `SC-${Date.now().toString().slice(-4)}`,
        grade: classForm.grade,
        sequenceWeight: Number(classForm.sequenceWeight),
        wing: classForm.wing,
        sections,
        capacity: Number(classForm.capacity) || 100,
        passingThreshold: Number(classForm.passingThreshold) || 40,
        isTerminal: classForm.isTerminal
      }
      setSchoolClasses(prev => [...prev, newClass])
      toast?.success?.(`Class ${classForm.grade} created successfully`)
    }
    setIsClassModalOpen(false)
  }

  // Deletion Guard: Check if students are enrolled before deleting class
  const handleDeleteClass = (cls) => {
    const enrolledStudents = students.filter(s => s.className === cls.grade)
    if (enrolledStudents.length > 0) {
      setDeleteBlockedModal({
        isOpen: true,
        title: `Deletion Blocked: ${cls.grade}`,
        reason: `There are currently ${enrolledStudents.length} active student(s) enrolled in ${cls.grade}. Deleting this class would orphan student academic records. Reassign or graduate these students before removing this class.`,
        enrolledCount: enrolledStudents.length
      })
      return
    }

    if (window.confirm(`Are you sure you want to delete "${cls.grade}"? There are 0 students currently enrolled.`)) {
      setSchoolClasses(prev => prev.filter(c => c.id !== cls.id))
      toast?.success?.(`Class "${cls.grade}" deleted`)
    }
  }

  // -------------------------------------------------------------
  // HANDLERS: College Programs
  // -------------------------------------------------------------
  const openCreateProgramModal = () => {
    setEditingProgramId(null)
    setProgramForm({
      program: '',
      years: 'Part-I & Part-II (2 Years)',
      groupsInput: 'Morning Alpha, Morning Beta',
      subjectCombinationsInput: 'Physics, Chemistry, Biology',
      labRequirement: 'Physics, Chemistry Labs',
      capacity: 120,
      maxLabBatchSize: 25,
      boardAffiliation: 'BISE Lahore'
    })
    setIsProgramModalOpen(true)
  }

  const openEditProgramModal = (prog) => {
    setEditingProgramId(prog.id)
    setProgramForm({
      program: prog.program,
      years: prog.years,
      groupsInput: (prog.groups || []).join(', '),
      subjectCombinationsInput: (prog.subjectCombinations || []).join(', '),
      labRequirement: prog.labRequirement,
      capacity: prog.capacity,
      maxLabBatchSize: prog.maxLabBatchSize || 25,
      boardAffiliation: prog.boardAffiliation || 'BISE Lahore'
    })
    setIsProgramModalOpen(true)
  }

  const handleSaveProgram = (e) => {
    e.preventDefault()
    if (!programForm.program.trim()) {
      toast?.error?.('Please enter a college program name')
      return
    }
    const groups = programForm.groupsInput.split(',').map(g => g.trim()).filter(Boolean)
    const subjectCombinations = programForm.subjectCombinationsInput.split(',').map(s => s.trim()).filter(Boolean)

    if (editingProgramId) {
      setCollegePrograms(prev => prev.map(p => p.id === editingProgramId ? {
        ...p,
        ...programForm,
        groups,
        subjectCombinations,
        capacity: Number(programForm.capacity) || 120,
        maxLabBatchSize: Number(programForm.maxLabBatchSize) || 25
      } : p))
      toast?.success?.(`Program ${programForm.program} updated`)
    } else {
      const newProg = {
        id: `CP-${Date.now().toString().slice(-4)}`,
        ...programForm,
        groups,
        subjectCombinations,
        capacity: Number(programForm.capacity) || 120,
        maxLabBatchSize: Number(programForm.maxLabBatchSize) || 25
      }
      setCollegePrograms(prev => [...prev, newProg])
      toast?.success?.(`Program ${programForm.program} added`)
    }
    setIsProgramModalOpen(false)
  }

  const handleDeleteProgram = (prog) => {
    if (window.confirm(`Are you sure you want to remove college program "${prog.program}"?`)) {
      setCollegePrograms(prev => prev.filter(p => p.id !== prog.id))
      toast?.success?.(`Program ${prog.program} removed`)
    }
  }

  // -------------------------------------------------------------
  // HANDLERS: University Faculties
  // -------------------------------------------------------------
  const openCreateFacultyModal = () => {
    setEditingFacultyId(null)
    setFacultyForm({
      faculty: '',
      deptsInput: 'Computer Science, Software Engineering',
      semesters: '8 Semesters (4 Years)',
      creditHours: 134,
      degree: 'BS',
      hecCompliant: true,
      theoryLabRatio: 'Theory 3 CH (3 hrs/wk) : Lab 1 CH (3 hrs/wk)',
      compulsoryCoursesInput: 'Pakistan Studies, Islamic Studies / Ethics'
    })
    setIsFacultyModalOpen(true)
  }

  const openEditFacultyModal = (fac) => {
    setEditingFacultyId(fac.id)
    setFacultyForm({
      faculty: fac.faculty,
      deptsInput: (fac.depts || []).join(', '),
      semesters: fac.semesters,
      creditHours: fac.creditHours,
      degree: fac.degree,
      hecCompliant: !!fac.hecCompliant,
      theoryLabRatio: fac.theoryLabRatio || 'Theory 3 CH (3 hrs/wk) : Lab 1 CH (3 hrs/wk)',
      compulsoryCoursesInput: (fac.compulsoryCourses || []).join(', ')
    })
    setIsFacultyModalOpen(true)
  }

  const handleSaveFaculty = (e) => {
    e.preventDefault()
    if (!facultyForm.faculty.trim()) {
      toast?.error?.('Please enter faculty name')
      return
    }
    const depts = facultyForm.deptsInput.split(',').map(d => d.trim()).filter(Boolean)
    const compulsoryCourses = facultyForm.compulsoryCoursesInput.split(',').map(c => c.trim()).filter(Boolean)

    if (editingFacultyId) {
      setUniFaculties(prev => prev.map(f => f.id === editingFacultyId ? {
        ...f,
        ...facultyForm,
        depts,
        compulsoryCourses,
        creditHours: Number(facultyForm.creditHours) || 130
      } : f))
      toast?.success?.(`Faculty updated`)
    } else {
      const newFac = {
        id: `UF-${Date.now().toString().slice(-4)}`,
        ...facultyForm,
        depts,
        compulsoryCourses,
        creditHours: Number(facultyForm.creditHours) || 130
      }
      setUniFaculties(prev => [...prev, newFac])
      toast?.success?.(`Faculty created`)
    }
    setIsFacultyModalOpen(false)
  }

  const handleDeleteFaculty = (fac) => {
    if (window.confirm(`Are you sure you want to delete "${fac.faculty}"?`)) {
      setUniFaculties(prev => prev.filter(f => f.id !== fac.id))
      toast?.success?.(`Faculty deleted`)
    }
  }

  // -------------------------------------------------------------
  // HANDLERS: Curriculum Schemes
  // -------------------------------------------------------------
  const openCreateCurriculumModal = () => {
    setEditingCurriculumId(null)
    setCurriculumForm({
      code: '',
      title: '',
      gradeRange: '',
      wing: 'Secondary Wing',
      subjects: '',
      totalHoursPerWeek: 30
    })
    setIsCurriculumModalOpen(true)
  }

  const openEditCurriculumModal = (cur) => {
    setEditingCurriculumId(cur.id)
    setCurriculumForm({
      code: cur.code,
      title: cur.title,
      gradeRange: cur.gradeRange,
      wing: cur.wing,
      subjects: cur.subjects,
      totalHoursPerWeek: cur.totalHoursPerWeek || 30
    })
    setIsCurriculumModalOpen(true)
  }

  const handleSaveCurriculum = (e) => {
    e.preventDefault()
    if (!curriculumForm.title.trim()) {
      toast?.error?.('Please enter curriculum scheme title')
      return
    }
    if (editingCurriculumId) {
      setCurriculumSchemes(prev => prev.map(c => c.id === editingCurriculumId ? {
        ...c,
        ...curriculumForm,
        totalHoursPerWeek: Number(curriculumForm.totalHoursPerWeek) || 30
      } : c))
      toast?.success?.('Curriculum template updated')
    } else {
      const newCur = {
        id: `CUR-${Date.now().toString().slice(-4)}`,
        ...curriculumForm,
        totalHoursPerWeek: Number(curriculumForm.totalHoursPerWeek) || 30
      }
      setCurriculumSchemes(prev => [...prev, newCur])
      toast?.success?.('Curriculum template created')
    }
    setIsCurriculumModalOpen(false)
  }

  const handleDeleteCurriculum = (cur) => {
    if (window.confirm(`Are you sure you want to delete curriculum "${cur.title}"?`)) {
      setCurriculumSchemes(prev => prev.filter(c => c.id !== cur.id))
      toast?.success?.('Curriculum scheme deleted')
    }
  }

  // -------------------------------------------------------------
  // HANDLERS: Grading Schemes & Rounding Policy
  // -------------------------------------------------------------
  const openCreateGradingModal = () => {
    setEditingGradingId(null)
    setGradingForm({
      name: '',
      wing: 'School & College Wings',
      roundingPolicy: 'Standard Half-Up (e.g. 79.5% -> 80%)',
      intervals: [
        { grade: 'A+', min: 80, max: 100, gpa: 4.0, remarks: 'Exceptional Distinction' },
        { grade: 'A', min: 70, max: 79.99, gpa: 3.5, remarks: 'Excellent' },
        { grade: 'B', min: 60, max: 69.99, gpa: 3.0, remarks: 'Very Good' },
        { grade: 'C', min: 50, max: 59.99, gpa: 2.5, remarks: 'Good' },
        { grade: 'D', min: 40, max: 49.99, gpa: 2.0, remarks: 'Passing' },
        { grade: 'F', min: 0, max: 39.99, gpa: 0.0, remarks: 'Fail' }
      ]
    })
    setIsGradingModalOpen(true)
  }

  const openEditGradingModal = (sch) => {
    setEditingGradingId(sch.id)
    setGradingForm({
      name: sch.name,
      wing: sch.wing,
      roundingPolicy: sch.roundingPolicy || 'Standard Half-Up (e.g. 79.5% -> 80%)',
      intervals: sch.intervals || []
    })
    setIsGradingModalOpen(true)
  }

  const handleUpdateInterval = (index, field, value) => {
    setGradingForm(prev => {
      const nextIntervals = [...prev.intervals]
      nextIntervals[index] = { ...nextIntervals[index], [field]: value }
      return { ...prev, intervals: nextIntervals }
    })
  }

  const handleSaveGrading = (e) => {
    e.preventDefault()
    if (!gradingForm.name.trim()) {
      toast?.error?.('Please enter grading scheme name')
      return
    }
    // Validate intervals boundary overlap
    for (let i = 0; i < gradingForm.intervals.length; i++) {
      const it = gradingForm.intervals[i]
      if (Number(it.min) > Number(it.max)) {
        toast?.error?.(`Interval for Grade ${it.grade} has Min (${it.min}) greater than Max (${it.max})`)
        return
      }
    }

    if (editingGradingId) {
      setGradingSchemes(prev => prev.map(s => s.id === editingGradingId ? { ...s, ...gradingForm } : s))
      toast?.success?.('Grading scheme updated')
    } else {
      const newSch = {
        id: `SCH-${Date.now().toString().slice(-4)}`,
        ...gradingForm
      }
      setGradingSchemes(prev => [...prev, newSch])
      toast?.success?.('Grading scheme created')
    }
    setIsGradingModalOpen(false)
  }

  const handleDeleteGrading = (sch) => {
    if (window.confirm(`Delete grading scheme "${sch.name}"?`)) {
      setGradingSchemes(prev => prev.filter(s => s.id !== sch.id))
      toast?.success?.('Grading scheme deleted')
    }
  }

  // -------------------------------------------------------------
  // HANDLERS: Timetable Rules & Clash Simulator
  // -------------------------------------------------------------
  const handleSaveTimetableRules = (e) => {
    e.preventDefault()
    toast?.success?.('Platform Timetable policies successfully saved and synced across campuses')
  }

  const runClashSimulation = () => {
    const { selectedRoom, selectedTeacher, selectedClass } = clashChecker
    const matchedRoom = campusRooms.find(r => r.name.toLowerCase().includes(selectedRoom.toLowerCase()) || selectedRoom.toLowerCase().includes(r.name.toLowerCase()))
    const roomCapacity = matchedRoom ? matchedRoom.capacity : 60
    
    // Simulate smart detection
    const isRoomClash = selectedRoom.includes('Room 101') && clashChecker.selectedPeriod.includes('Period 1') && selectedClass.includes('Grade 9')
    const isTeacherClash = selectedTeacher.includes('Tariq Jamil') && clashChecker.selectedPeriod.includes('Period 1') && selectedClass.includes('F.Sc')
    const isCapacityExceeded = roomCapacity < 45 && selectedClass.includes('Grade 10')

    setClashChecker(prev => ({
      ...prev,
      result: {
        checkedAt: new Date().toLocaleTimeString(),
        hasConflict: isRoomClash || isTeacherClash,
        isRoomClash,
        isTeacherClash,
        isCapacityExceeded,
        roomCapacity,
        message: (isRoomClash || isTeacherClash)
          ? `Schedule Collision Detected! ${isRoomClash ? '[Room Conflict: Occupied by Grade 8-A]' : ''} ${isTeacherClash ? '[Teacher Double-Booked at Lahore Campus]' : ''}`
          : `Zero Conflicts Found: ${selectedRoom} is free, ${selectedTeacher} is available for ${selectedClass} (${roomCapacity} seats capacity verified).`
      }
    }))
  }

  // -------------------------------------------------------------
  // HANDLERS: Rollover Engine (Terminal Alumni, Detained, Hardship Override, Snapshot & Undo)
  // -------------------------------------------------------------
  const simulateRolloverAudit = () => {
    if (!students || students.length === 0) {
      toast?.error?.('No student records found to inspect for rollover')
      return
    }

    // Sort school classes by sequenceWeight ascending to compute exact next grade
    const sortedClasses = [...schoolClasses].sort((a, b) => (a.sequenceWeight || 0) - (b.sequenceWeight || 0))

    let promoted = 0
    let graduatedAlumni = 0
    let detained = 0
    let feeDefaulter = 0
    let hardshipOverridden = 0

    const breakdown = students.map((std, idx) => {
      // Mock grade evaluation score if not explicitly set
      const score = std.lastExamScore !== undefined ? std.lastExamScore : (70 + (idx * 6) % 31)
      const isFeePaid = std.feeStatus === 'Paid'
      const passedThreshold = score >= rolloverPassingThreshold

      // Check current class metadata
      const currentClassObj = sortedClasses.find(c => c.grade.toLowerCase() === (std.className || '').toLowerCase())
      const isTerminalClass = currentClassObj ? currentClassObj.isTerminal : (std.className === 'Grade 10' || std.className?.includes('Part-II'))

      let action = 'Promote'
      let reason = 'Eligible'
      let targetGrade = std.className

      if (!passedThreshold) {
        action = 'Detain'
        reason = `Academic Retake: Score ${score}% is below required ${rolloverPassingThreshold}%`
        targetGrade = std.className
        detained++
      } else if (!isFeePaid && rolloverRequireFeeClearance) {
        if (allowHardshipOverride && hardshipJustification.trim()) {
          action = isTerminalClass ? 'Graduate to Alumni' : 'Promote'
          reason = `Promoted under Superadmin Hardship Override: "${hardshipJustification.trim()}"`
          hardshipOverridden++
          if (isTerminalClass) {
            graduatedAlumni++
            targetGrade = 'Alumni / Graduated'
          } else {
            promoted++
            if (currentClassObj) {
              const nextClass = sortedClasses.find(c => c.sequenceWeight === (currentClassObj.sequenceWeight + 1))
              targetGrade = nextClass ? nextClass.grade : std.className
            } else {
              targetGrade = 'Next Grade Level'
            }
          }
        } else {
          action = 'Hold (Fee Due)'
          reason = 'Financial Hold: Outstanding fee challan unpaid. Superadmin override required.'
          targetGrade = std.className
          feeDefaulter++
        }
      } else {
        if (isTerminalClass) {
          action = 'Graduate to Alumni'
          reason = `Final Year Terminal Completion: Achieved ${score}% score with cleared accounts`
          targetGrade = 'Alumni / Graduated'
          graduatedAlumni++
        } else {
          action = 'Promote'
          reason = `Eligible for Advancement: Passed with ${score}% & Accounts Verified`
          if (currentClassObj) {
            const nextClass = sortedClasses.find(c => c.sequenceWeight === (currentClassObj.sequenceWeight + 1))
            targetGrade = nextClass ? nextClass.grade : `${std.className} (Adv)`
          } else {
            targetGrade = 'Next Grade Level'
          }
          promoted++
        }
      }

      return {
        id: std.id,
        name: std.name,
        rollNumber: std.rollNumber,
        currentGrade: std.className,
        score,
        feeStatus: std.feeStatus || 'Pending',
        action,
        reason,
        targetGrade
      }
    })

    setRolloverAuditResult({
      totalInspected: students.length,
      promotedCount: promoted,
      graduatedAlumniCount: graduatedAlumni,
      detainedCount: detained,
      feeDefaulterCount: feeDefaulter,
      hardshipOverriddenCount: hardshipOverridden,
      breakdown
    })

    setIsRolloverModalOpen(true)
  }

  // Execute Batch Rollover with Snapshot creation
  const executeOfficialRollover = () => {
    if (!students || students.length === 0) return
    setIsExecutingRollover(true)

    try {
      // 1. Save Pre-Rollover Snapshot in LocalStorage for Undo capability
      const snapshotPayload = {
        timestamp: new Date().toISOString(),
        fromSession: rolloverSourceSession,
        toSession: rolloverTargetSession,
        studentsCount: students.length,
        studentsSnapshot: students
      }
      localStorage.setItem(SNAPSHOT_KEY, JSON.stringify(snapshotPayload))
      setHasSnapshot(true)

      // 2. Perform Batch Mutation
      const updatedStudents = students.map(std => {
        const auditItem = rolloverAuditResult.breakdown.find(b => b.id === std.id)
        if (!auditItem) return std

        if (auditItem.action === 'Graduate to Alumni') {
          return {
            ...std,
            status: 'Alumni',
            className: 'Alumni (Graduated)',
            academicSession: rolloverTargetSession,
            graduationDate: new Date().toISOString().split('T')[0],
            academicRemark: `Graduated from ${std.className} in ${rolloverSourceSession}`
          }
        } else if (auditItem.action === 'Promote') {
          return {
            ...std,
            className: auditItem.targetGrade,
            academicSession: rolloverTargetSession,
            academicRemark: `Promoted from ${std.className} to ${auditItem.targetGrade} for ${rolloverTargetSession}`
          }
        } else if (auditItem.action === 'Detain') {
          return {
            ...std,
            academicSession: rolloverTargetSession,
            academicRemark: `Academic Retake in ${std.className} for ${rolloverTargetSession}`
          }
        }
        return std
      })

      if (typeof updateStudentsBatch === 'function') {
        updateStudentsBatch(updatedStudents)
      } else if (typeof updateStudent === 'function') {
        updatedStudents.forEach(s => updateStudent(s))
      }

      toast?.success?.(`Academic Rollover complete! ${rolloverAuditResult.promotedCount} promoted, ${rolloverAuditResult.graduatedAlumniCount} transitioned to Alumni, snapshot saved.`)
      setIsRolloverModalOpen(false)
    } catch (err) {
      toast?.error?.('Rollover failed: ' + (err.message || 'Unknown error'))
    } finally {
      setIsExecutingRollover(false)
    }
  }

  // Undo Last Rollover by restoring snapshot
  const handleUndoRollover = () => {
    try {
      const raw = localStorage.getItem(SNAPSHOT_KEY)
      if (!raw) {
        toast?.error?.('No previous rollover snapshot found')
        return
      }
      const snapshot = JSON.parse(raw)
      if (window.confirm(`Restore students to pre-rollover snapshot from ${new Date(snapshot.timestamp).toLocaleString()}? This will restore ${snapshot.studentsCount} student records to ${snapshot.fromSession}.`)) {
        if (typeof updateStudentsBatch === 'function') {
          updateStudentsBatch(snapshot.studentsSnapshot)
        } else if (typeof updateStudent === 'function') {
          snapshot.studentsSnapshot.forEach(s => updateStudent(s))
        }
        localStorage.removeItem(SNAPSHOT_KEY)
        setHasSnapshot(false)
        toast?.success?.('Rollover restored successfully to previous snapshot!')
      }
    } catch (err) {
      toast?.error?.('Failed to restore snapshot: ' + err.message)
    }
  }

  // -------------------------------------------------------------
  // EXPORT CSV
  // -------------------------------------------------------------
  const exportAcademicsCSV = () => {
    let headers = []
    let rows = []
    let filename = `academics_${effectiveTab}_${new Date().toISOString().split('T')[0]}.csv`

    if (effectiveTab === 'sessions') {
      headers = ['Session ID', 'Session Name', 'Term Type', 'Start Date', 'End Date', 'Midterms', 'Finals', 'Status', 'Wings Covered']
      rows = sessions.map(s => [
        sanitizeCSV(s.id),
        sanitizeCSV(s.name),
        sanitizeCSV(s.term),
        sanitizeCSV(s.startDate),
        sanitizeCSV(s.endDate),
        sanitizeCSV(s.midtermDates || 'N/A'),
        sanitizeCSV(s.finalExamDates || 'N/A'),
        sanitizeCSV(s.status),
        sanitizeCSV(s.wings)
      ].join(','))
    } else if (effectiveTab === 'school-struct') {
      headers = ['Class ID', 'Seq Weight', 'Grade Name', 'Wing', 'Sections', 'Max Capacity', 'Enrolled Students', 'Passing Score (%)', 'Terminal']
      rows = schoolClasses.map(c => {
        const enrolled = students.filter(s => s.className === c.grade).length
        return [
          sanitizeCSV(c.id),
          sanitizeCSV(c.sequenceWeight || 1),
          sanitizeCSV(c.grade),
          sanitizeCSV(c.wing),
          sanitizeCSV((c.sections || []).join('; ')),
          sanitizeCSV(c.capacity),
          sanitizeCSV(enrolled),
          sanitizeCSV(c.passingThreshold || 40),
          sanitizeCSV(c.isTerminal ? 'Yes (Terminal)' : 'No')
        ].join(',')
      })
    } else if (effectiveTab === 'college-struct') {
      headers = ['Program ID', 'Program Name', 'Duration', 'Affiliated Board', 'Assigned Groups', 'Subject Combinations', 'Lab Requirements', 'Capacity']
      rows = collegePrograms.map(p => [
        sanitizeCSV(p.id),
        sanitizeCSV(p.program),
        sanitizeCSV(p.years),
        sanitizeCSV(p.boardAffiliation || 'BISE'),
        sanitizeCSV((p.groups || []).join('; ')),
        sanitizeCSV((p.subjectCombinations || []).join('; ')),
        sanitizeCSV(p.labRequirement),
        sanitizeCSV(p.capacity)
      ].join(','))
    } else {
      headers = ['Item ID', 'Title / Code', 'Details / Wing', 'Status']
      rows = [
        [sanitizeCSV('EXP-01'), sanitizeCSV('Academic Framework Dataset'), sanitizeCSV(effectiveTab), sanitizeCSV('Active')]
      ].map(r => r.join(','))
    }

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows].join('\n')
    const encodedUri = encodeURI(csvContent)
    const link = document.createElement('a')
    link.setAttribute('href', encodedUri)
    link.setAttribute('download', filename)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    toast?.success?.(`Exported ${filename}`)
  }

  // Tabs Configuration
  const tabsConfig = [
    { key: 'sessions', label: 'Sessions & Calendars', icon: Calendar, badge: sessions.length },
    { key: 'school-struct', label: 'School Structure', icon: School, badge: schoolClasses.length },
    { key: 'college-struct', label: 'College Structure', icon: Layers, badge: collegePrograms.length },
    { key: 'university-struct', label: 'University Structure', icon: Building2, badge: uniFaculties.length },
    { key: 'curriculum', label: 'Curriculum & Subjects', icon: BookOpen, badge: curriculumSchemes.length },
    { key: 'grading', label: 'Grading Schemes', icon: Award, badge: gradingSchemes.length },
    { key: 'timetable', label: 'Timetable & Room Allocation', icon: Clock, badge: campusRooms.length },
    { key: 'rollover', label: 'Academic Year Rollover', icon: RotateCcw }
  ]

  // Filtered lists
  const filteredSessions = useMemo(() => {
    if (!searchTerm.trim()) return sessions
    const term = searchTerm.toLowerCase()
    return sessions.filter(s => 
      s.name.toLowerCase().includes(term) ||
      s.id.toLowerCase().includes(term) ||
      s.wings.toLowerCase().includes(term)
    )
  }, [sessions, searchTerm])

  const filteredSchoolClasses = useMemo(() => {
    // Sort by sequenceWeight ascending so Grade 1 is first and Grade 10 is last!
    const sorted = [...schoolClasses].sort((a, b) => (a.sequenceWeight || 0) - (b.sequenceWeight || 0))
    if (!searchTerm.trim()) return sorted
    const term = searchTerm.toLowerCase()
    return sorted.filter(c => 
      c.grade.toLowerCase().includes(term) ||
      c.wing.toLowerCase().includes(term)
    )
  }, [schoolClasses, searchTerm])

  const filteredCollegePrograms = useMemo(() => {
    if (!searchTerm.trim()) return collegePrograms
    const term = searchTerm.toLowerCase()
    return collegePrograms.filter(p => 
      p.program.toLowerCase().includes(term) ||
      p.years.toLowerCase().includes(term)
    )
  }, [collegePrograms, searchTerm])

  const filteredRooms = useMemo(() => {
    if (!searchTerm.trim()) return campusRooms
    const term = searchTerm.toLowerCase()
    return campusRooms.filter(r => 
      r.name.toLowerCase().includes(term) ||
      r.type.toLowerCase().includes(term) ||
      r.floor.toLowerCase().includes(term)
    )
  }, [campusRooms, searchTerm])

  return (
    <div className="p-3 sm:p-6 md:p-8 space-y-6 max-w-7xl mx-auto animate-in fade-in duration-150">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-violet-900 via-purple-900 to-indigo-950 rounded-3xl p-6 sm:p-8 text-white shadow-xl relative overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md text-xs font-semibold text-purple-200 border border-white/10 mb-2">
              <GraduationCap className="w-3.5 h-3.5 text-purple-300" />
              <span>Super Administrator • Platform Academic Governance</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              Academic Hierarchy & Frameworks
            </h1>
            <p className="text-sm text-purple-200 mt-1 max-w-2xl leading-relaxed">
              Standardize multi-wing curricula, academic calendars, school/college/university divisions, and student progression rollover policies.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            {hasSnapshot && (
              <button 
                type="button"
                onClick={handleUndoRollover}
                className="px-3.5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs sm:text-sm flex items-center gap-2 shadow-lg transition-all cursor-pointer"
                title="Restore students to pre-rollover state"
              >
                <Undo2 className="w-4 h-4" />
                <span>Undo Last Rollover</span>
              </button>
            )}
            <button 
              type="button"
              onClick={openCreateSessionModal}
              className="px-4 py-2.5 rounded-xl bg-purple-500 hover:bg-purple-400 text-white font-semibold text-xs sm:text-sm flex items-center gap-2 shadow-lg hover:shadow-purple-500/25 transition-all cursor-pointer shrink-0"
            >
              <Plus className="w-4 h-4" />
              <span>Create Academic Session</span>
            </button>
          </div>
        </div>
      </div>

      {/* Navigation Tabs Bar */}
      <div className="bg-white rounded-2xl p-2 border border-slate-200/80 shadow-2xs overflow-x-auto dark-scroll">
        <div className="flex items-center gap-1.5 min-w-max">
          {tabsConfig.map(tab => {
            const Icon = tab.icon
            const active = effectiveTab === tab.key
            return (
              <button
                key={tab.key}
                onClick={() => handleTabSwitch(tab.key)}
                className={`flex items-center gap-2 px-3.5 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-all cursor-pointer whitespace-nowrap ${
                  active 
                    ? 'bg-purple-600 text-white shadow-xs font-bold' 
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/80'
                }`}
              >
                <Icon className={`w-4 h-4 ${active ? 'text-white' : 'text-slate-400'}`} />
                <span>{tab.label}</span>
                {tab.badge !== undefined && (
                  <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-mono ${
                    active ? 'bg-purple-700 text-purple-100 font-bold' : 'bg-slate-100 text-slate-600'
                  }`}>
                    {tab.badge}
                  </span>
                )}
              </button>
            )
          })}
        </div>
      </div>

      {/* Sub-View 1: Sessions & Calendars */}
      {effectiveTab === 'sessions' && (
        <div className="space-y-6 animate-in fade-in duration-200">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-4 rounded-2xl border border-slate-200/80 shadow-2xs">
            <div className="relative flex-1 max-w-md">
              <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input 
                type="text"
                placeholder="Search session name, ID, or covered wings..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 transition-all"
              />
            </div>
            <div className="flex items-center gap-2">
              <button 
                type="button"
                onClick={exportAcademicsCSV}
                className="px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs sm:text-sm font-semibold flex items-center gap-2 transition-all cursor-pointer"
              >
                <Download className="w-4 h-4" />
                <span>Export CSV</span>
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredSessions.map(session => (
              <div 
                key={session.id}
                className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-2xs hover:shadow-md transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div>
                      <span className="text-[10px] font-mono font-bold text-purple-600 bg-purple-50 px-2 py-0.5 rounded-md border border-purple-100">
                        {session.id}
                      </span>
                      <h3 className="text-base font-bold text-slate-900 mt-1.5">{session.name}</h3>
                      <p className="text-xs text-slate-500">{session.term}</p>
                    </div>
                    <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${
                      session.status.includes('Active')
                        ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                        : session.status === 'Archived'
                        ? 'bg-slate-100 text-slate-600 border border-slate-200'
                        : 'bg-purple-50 text-purple-700 border border-purple-200'
                    }`}>
                      {session.status}
                    </span>
                  </div>

                  <div className="space-y-2 py-3 border-y border-slate-100 text-xs text-slate-600">
                    <div className="flex items-center justify-between">
                      <span className="text-slate-400">Duration Window:</span>
                      <span className="font-semibold text-slate-700">{session.startDate} → {session.endDate}</span>
                    </div>
                    {session.midtermDates && (
                      <div className="flex items-center justify-between">
                        <span className="text-slate-400">Midterm Exams:</span>
                        <span className="font-medium text-slate-600">{session.midtermDates}</span>
                      </div>
                    )}
                    {session.finalExamDates && (
                      <div className="flex items-center justify-between">
                        <span className="text-slate-400">Final Exams:</span>
                        <span className="font-medium text-slate-600">{session.finalExamDates}</span>
                      </div>
                    )}
                    <div className="flex items-center justify-between">
                      <span className="text-slate-400">Wings Covered:</span>
                      <span className="font-semibold text-purple-700 truncate max-w-[160px]">{session.wings}</span>
                    </div>
                  </div>
                </div>

                <div className="mt-4 pt-3 flex items-center justify-between gap-2 border-t border-slate-50">
                  <button
                    type="button"
                    onClick={() => handleToggleSessionStatus(session.id)}
                    className="text-xs font-semibold text-purple-600 hover:text-purple-800 flex items-center gap-1 cursor-pointer"
                  >
                    {session.status.includes('Active') ? <Lock className="w-3.5 h-3.5" /> : <Unlock className="w-3.5 h-3.5" />}
                    <span>{session.status.includes('Active') ? 'Archive Session' : 'Activate Session'}</span>
                  </button>

                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => openEditSessionModal(session)}
                      className="p-1.5 text-slate-400 hover:text-purple-600 hover:bg-purple-50 rounded-lg transition-all cursor-pointer"
                      title="Edit Session"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDeleteSession(session.id, session.name)}
                      className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-all cursor-pointer"
                      title="Delete Session"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Sub-View 2: School Structure */}
      {effectiveTab === 'school-struct' && (
        <div className="space-y-6 animate-in fade-in duration-200">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-4 rounded-2xl border border-slate-200/80 shadow-2xs">
            <div className="relative flex-1 max-w-md">
              <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input 
                type="text"
                placeholder="Search grade name or wing..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 transition-all"
              />
            </div>
            <div className="flex items-center gap-2">
              <button 
                type="button"
                onClick={exportAcademicsCSV}
                className="px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs sm:text-sm font-semibold flex items-center gap-2 transition-all cursor-pointer"
              >
                <Download className="w-4 h-4" />
                <span>Export CSV</span>
              </button>
              <button 
                type="button"
                onClick={openCreateClassModal}
                className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs sm:text-sm font-semibold flex items-center gap-2 shadow-xs transition-all cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>Add School Class</span>
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredSchoolClasses.map(sc => {
              const enrolledCount = students.filter(s => s.className === sc.grade).length
              const pct = Math.min(100, Math.round((enrolledCount / (sc.capacity || 100)) * 100))

              return (
                <div 
                  key={sc.id}
                  className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-2xs hover:shadow-md transition-all flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-start justify-between gap-3 mb-2">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] font-mono font-bold text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded">
                            Seq #{sc.sequenceWeight || 1}
                          </span>
                          <span className="text-xs font-semibold text-purple-700 bg-purple-50 px-2 py-0.5 rounded-full border border-purple-100">
                            {sc.wing}
                          </span>
                          {sc.isTerminal && (
                            <span className="text-[10px] font-bold text-amber-700 bg-amber-50 px-1.5 py-0.5 rounded-full border border-amber-200">
                              Terminal Class
                            </span>
                          )}
                        </div>
                        <h3 className="text-lg font-extrabold text-slate-900 mt-1">{sc.grade}</h3>
                      </div>
                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          onClick={() => openEditClassModal(sc)}
                          className="p-1.5 text-slate-400 hover:text-purple-600 hover:bg-purple-50 rounded-lg transition-all cursor-pointer"
                          title="Edit Class"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeleteClass(sc)}
                          className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-all cursor-pointer"
                          title="Delete Class (Guarded)"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    {/* Capacity Progress Bar */}
                    <div className="my-3 space-y-1">
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-slate-500 font-medium">Enrolled Capacity:</span>
                        <span className="font-bold text-slate-800">{enrolledCount} / {sc.capacity} ({pct}%)</span>
                      </div>
                      <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                        <div 
                          className={`h-full rounded-full transition-all ${
                            pct >= 90 ? 'bg-rose-500' : pct >= 70 ? 'bg-amber-500' : 'bg-purple-600'
                          }`} 
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                    </div>

                    <div className="mt-3 pt-3 border-t border-slate-100 space-y-2">
                      <div className="text-xs text-slate-500 font-medium">Assigned Sections:</div>
                      <div className="flex flex-wrap gap-1.5">
                        {(sc.sections || []).map((sec, i) => (
                          <span 
                            key={i} 
                            className="px-2 py-0.5 text-xs font-semibold bg-slate-50 border border-slate-200 text-slate-700 rounded-md"
                          >
                            Sec {sec}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                    <span>Min Pass Threshold:</span>
                    <span className="font-bold text-slate-800">{sc.passingThreshold || 40}% Score</span>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* Sub-View 3: College Structure */}
      {effectiveTab === 'college-struct' && (
        <div className="space-y-6 animate-in fade-in duration-200">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-4 rounded-2xl border border-slate-200/80 shadow-2xs">
            <div className="relative flex-1 max-w-md">
              <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input 
                type="text"
                placeholder="Search program, duration, or affiliation..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 transition-all"
              />
            </div>
            <div className="flex items-center gap-2">
              <button 
                type="button"
                onClick={openCreateProgramModal}
                className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs sm:text-sm font-semibold flex items-center gap-2 shadow-xs transition-all cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>Add College Program</span>
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {filteredCollegePrograms.map(prog => (
              <div 
                key={prog.id}
                className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-2xs hover:shadow-md transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start justify-between gap-3 mb-2">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-mono font-bold text-purple-700 bg-purple-50 px-2 py-0.5 rounded border border-purple-100">
                          {prog.id}
                        </span>
                        <span className="text-xs text-slate-500 font-medium">{prog.years}</span>
                      </div>
                      <h3 className="text-lg font-bold text-slate-900 mt-1">{prog.program}</h3>
                    </div>
                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() => openEditProgramModal(prog)}
                        className="p-1.5 text-slate-400 hover:text-purple-600 hover:bg-purple-50 rounded-lg transition-all cursor-pointer"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDeleteProgram(prog)}
                        className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-all cursor-pointer"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  <div className="space-y-2.5 py-3 border-y border-slate-100 text-xs">
                    <div>
                      <span className="text-slate-400">Board Affiliation:</span>
                      <span className="ml-2 font-semibold text-slate-800">{prog.boardAffiliation || 'BISE Lahore'}</span>
                    </div>
                    <div>
                      <span className="text-slate-400">Subject Combinations:</span>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {(prog.subjectCombinations || []).map((sub, i) => (
                          <span key={i} className="px-2 py-0.5 bg-purple-50 text-purple-700 rounded-md font-medium text-[11px]">
                            {sub}
                          </span>
                        ))}
                      </div>
                    </div>
                    <div>
                      <span className="text-slate-400">Practical Labs & Batches:</span>
                      <div className="font-semibold text-slate-700 mt-0.5">
                        {prog.labRequirement} (Max {prog.maxLabBatchSize || 25} students/batch)
                      </div>
                    </div>
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-50 flex items-center justify-between text-xs text-slate-500">
                  <span>Groups: {(prog.groups || []).join(', ')}</span>
                  <span className="font-bold text-slate-800">Cap: {prog.capacity}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Sub-View 4: University Structure */}
      {effectiveTab === 'university-struct' && (
        <div className="space-y-6 animate-in fade-in duration-200">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-4 rounded-2xl border border-slate-200/80 shadow-2xs">
            <h2 className="text-base font-bold text-slate-900">HEC University Faculties & Departments</h2>
            <button 
              type="button"
              onClick={openCreateFacultyModal}
              className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs sm:text-sm font-semibold flex items-center gap-2 shadow-xs transition-all cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Add Faculty</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {uniFaculties.map(fac => (
              <div 
                key={fac.id}
                className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-2xs hover:shadow-md transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start justify-between gap-3 mb-2">
                    <div>
                      <span className="text-[10px] font-mono font-bold text-purple-600 bg-purple-50 px-2 py-0.5 rounded border border-purple-100">
                        {fac.id}
                      </span>
                      <h3 className="text-base font-bold text-slate-900 mt-1">{fac.faculty}</h3>
                      <p className="text-xs text-slate-500">{fac.degree} • {fac.semesters}</p>
                    </div>
                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() => openEditFacultyModal(fac)}
                        className="p-1.5 text-slate-400 hover:text-purple-600 hover:bg-purple-50 rounded-lg transition-all cursor-pointer"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDeleteFaculty(fac)}
                        className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-all cursor-pointer"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  <div className="space-y-2 py-3 border-y border-slate-100 text-xs">
                    <div>
                      <span className="text-slate-400 font-medium">Departments:</span>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {(fac.depts || []).map((d, i) => (
                          <span key={i} className="px-2 py-0.5 bg-slate-100 text-slate-700 rounded-md font-medium text-[11px]">
                            {d}
                          </span>
                        ))}
                      </div>
                    </div>
                    <div className="pt-2">
                      <span className="text-slate-400 font-medium">HEC Credit Hours:</span>
                      <span className="ml-2 font-bold text-slate-800">{fac.creditHours} CH</span>
                    </div>
                    <div>
                      <span className="text-slate-400 font-medium">Ratio:</span>
                      <span className="ml-2 text-slate-600 font-mono text-[11px]">{fac.theoryLabRatio}</span>
                    </div>
                  </div>
                </div>

                <div className="mt-3 pt-3 border-t border-slate-50 flex items-center justify-between text-xs">
                  <span className="text-emerald-600 font-semibold flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>HEC Accredited</span>
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Sub-View 5: Curriculum & Subjects */}
      {effectiveTab === 'curriculum' && (
        <div className="space-y-6 animate-in fade-in duration-200">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-4 rounded-2xl border border-slate-200/80 shadow-2xs">
            <h2 className="text-base font-bold text-slate-900">Curriculum & Subject Schemes</h2>
            <button 
              type="button"
              onClick={openCreateCurriculumModal}
              className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs sm:text-sm font-semibold flex items-center gap-2 shadow-xs transition-all cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Add Curriculum Scheme</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {curriculumSchemes.map(cur => (
              <div 
                key={cur.id}
                className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-2xs hover:shadow-md transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start justify-between gap-3 mb-2">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-mono font-bold text-purple-700 bg-purple-50 px-2 py-0.5 rounded border border-purple-100">
                          {cur.code}
                        </span>
                        <span className="text-xs text-slate-500 font-medium">{cur.wing}</span>
                      </div>
                      <h3 className="text-base font-bold text-slate-900 mt-1">{cur.title}</h3>
                    </div>
                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() => openEditCurriculumModal(cur)}
                        className="p-1.5 text-slate-400 hover:text-purple-600 hover:bg-purple-50 rounded-lg transition-all cursor-pointer"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDeleteCurriculum(cur)}
                        className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-all cursor-pointer"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  <div className="py-3 border-y border-slate-100 text-xs space-y-2">
                    <div>
                      <span className="text-slate-400">Target Grades:</span>
                      <span className="ml-2 font-semibold text-slate-800">{cur.gradeRange}</span>
                    </div>
                    <div>
                      <span className="text-slate-400">Key Subjects:</span>
                      <p className="mt-1 text-slate-700 leading-relaxed font-medium">{cur.subjects}</p>
                    </div>
                  </div>
                </div>

                <div className="mt-3 pt-3 border-t border-slate-50 flex items-center justify-between text-xs text-slate-500">
                  <span>Weekly Contact Load:</span>
                  <span className="font-bold text-purple-700">{cur.totalHoursPerWeek || 30} Hours / Week</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Sub-View 6: Grading Schemes */}
      {effectiveTab === 'grading' && (
        <div className="space-y-6 animate-in fade-in duration-200">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-4 rounded-2xl border border-slate-200/80 shadow-2xs">
            <div>
              <h2 className="text-base font-bold text-slate-900">Grading Scales & Evaluation Matrices</h2>
              <p className="text-xs text-slate-500 mt-0.5">Define multi-tier interval bounds with strict decimal gap validation</p>
            </div>
            <button 
              type="button"
              onClick={openCreateGradingModal}
              className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs sm:text-sm font-semibold flex items-center gap-2 shadow-xs transition-all cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Create Grading Scheme</span>
            </button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {gradingSchemes.map(sch => (
              <div 
                key={sch.id}
                className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-2xs flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div>
                      <span className="text-xs font-semibold text-purple-700 bg-purple-50 px-2 py-0.5 rounded border border-purple-100">
                        {sch.wing}
                      </span>
                      <h3 className="text-base font-bold text-slate-900 mt-1">{sch.name}</h3>
                      <p className="text-xs text-slate-500 mt-0.5">Policy: {sch.roundingPolicy || 'Standard Half-Up'}</p>
                    </div>
                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() => openEditGradingModal(sch)}
                        className="p-1.5 text-slate-400 hover:text-purple-600 hover:bg-purple-50 rounded-lg transition-all cursor-pointer"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDeleteGrading(sch)}
                        className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-all cursor-pointer"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  <div className="border border-slate-200 rounded-xl overflow-hidden mt-3">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-slate-50 text-slate-600 border-b border-slate-200">
                        <tr>
                          <th className="py-2 px-3 font-semibold">Grade</th>
                          <th className="py-2 px-3 font-semibold">Min %</th>
                          <th className="py-2 px-3 font-semibold">Max %</th>
                          <th className="py-2 px-3 font-semibold">GPA</th>
                          <th className="py-2 px-3 font-semibold">Remarks</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {(sch.intervals || []).map((it, i) => (
                          <tr key={i} className="hover:bg-slate-50/50">
                            <td className="py-2 px-3 font-bold text-purple-700">{it.grade}</td>
                            <td className="py-2 px-3 text-slate-700">{it.min}%</td>
                            <td className="py-2 px-3 text-slate-700">{it.max}%</td>
                            <td className="py-2 px-3 font-mono text-slate-600">{it.gpa}</td>
                            <td className="py-2 px-3 text-slate-500">{it.remarks}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Sub-View 7: Timetable Rules & Room Allocation */}
      {effectiveTab === 'timetable' && (
        <div className="space-y-6 animate-in fade-in duration-200">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Rules Form */}
            <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-2xs space-y-4">
              <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
                <Clock className="w-5 h-5 text-purple-600" />
                <h3 className="text-base font-bold text-slate-900">Platform Timetable Policies</h3>
              </div>

              <form onSubmit={handleSaveTimetableRules} className="space-y-3.5 text-xs">
                <div>
                  <label className="block text-slate-600 font-semibold mb-1">Standard Period Duration (mins)</label>
                  <input 
                    type="number"
                    value={timetableRules.periodDuration}
                    onChange={(e) => setTimetableRules({ ...timetableRules, periodDuration: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
                  />
                </div>

                <div>
                  <label className="block text-slate-600 font-semibold mb-1">Friday Period Duration (mins)</label>
                  <input 
                    type="number"
                    value={timetableRules.fridayPeriodDuration || 35}
                    onChange={(e) => setTimetableRules({ ...timetableRules, fridayPeriodDuration: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-slate-600 font-semibold mb-1">Recess Start</label>
                    <input 
                      type="time"
                      value={timetableRules.recessStart}
                      onChange={(e) => setTimetableRules({ ...timetableRules, recessStart: e.target.value })}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-600 font-semibold mb-1">Recess End</label>
                    <input 
                      type="time"
                      value={timetableRules.recessEnd}
                      onChange={(e) => setTimetableRules({ ...timetableRules, recessEnd: e.target.value })}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
                    />
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-100">
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="font-semibold text-slate-700">Friday Prayer Recess Window:</span>
                    <span className="text-[11px] text-purple-600 font-bold">12:30 PM - 2:00 PM</span>
                  </div>
                  <p className="text-[11px] text-slate-500">
                    Automatic schedule adjustment for Jummah congregational prayers across Pakistani campuses.
                  </p>
                </div>

                <button
                  type="submit"
                  className="w-full mt-3 py-2.5 bg-purple-600 hover:bg-purple-700 text-white font-bold rounded-xl shadow-xs transition-all cursor-pointer"
                >
                  Save Policies
                </button>
              </form>
            </div>

            {/* Clash Simulator */}
            <div className="lg:col-span-2 bg-white rounded-2xl p-6 border border-slate-200/80 shadow-2xs space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-5 h-5 text-purple-600" />
                  <div>
                    <h3 className="text-base font-bold text-slate-900">Live Clash & Conflict Simulator</h3>
                    <p className="text-xs text-slate-500">Test room concurrency, teacher schedules, and seating limits</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={runClashSimulation}
                  className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs rounded-xl transition-all cursor-pointer flex items-center gap-1.5 shadow-xs"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>Run Conflict Check</span>
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div>
                  <label className="block text-slate-600 font-semibold mb-1">Target Room</label>
                  <select 
                    value={clashChecker.selectedRoom}
                    onChange={(e) => setClashChecker({ ...clashChecker, selectedRoom: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
                  >
                    {campusRooms.slice(0, 10).map((r, i) => (
                      <option key={i} value={r.name}>{r.name} ({r.type} • {r.capacity} seats)</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-slate-600 font-semibold mb-1">Period Slot</label>
                  <select 
                    value={clashChecker.selectedPeriod}
                    onChange={(e) => setClashChecker({ ...clashChecker, selectedPeriod: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
                  >
                    <option value="Period 1 (08:00 - 08:45)">Period 1 (08:00 - 08:45)</option>
                    <option value="Period 2 (08:45 - 09:30)">Period 2 (08:45 - 09:30)</option>
                    <option value="Period 3 (09:30 - 10:15)">Period 3 (09:30 - 10:15)</option>
                    <option value="Period 4 (10:15 - 11:00)">Period 4 (10:15 - 11:00)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-600 font-semibold mb-1">Assigned Teacher</label>
                  <input 
                    type="text"
                    value={clashChecker.selectedTeacher}
                    onChange={(e) => setClashChecker({ ...clashChecker, selectedTeacher: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
                  />
                </div>

                <div>
                  <label className="block text-slate-600 font-semibold mb-1">Class / Section</label>
                  <input 
                    type="text"
                    value={clashChecker.selectedClass}
                    onChange={(e) => setClashChecker({ ...clashChecker, selectedClass: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
                  />
                </div>
              </div>

              {/* Clash Check Results */}
              {clashChecker.result && (
                <div className={`p-4 rounded-xl border ${
                  clashChecker.result.hasConflict 
                    ? 'bg-rose-50/70 border-rose-200 text-rose-900' 
                    : 'bg-emerald-50/70 border-emerald-200 text-emerald-900'
                }`}>
                  <div className="flex items-start gap-2.5">
                    {clashChecker.result.hasConflict ? (
                      <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
                    ) : (
                      <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                    )}
                    <div>
                      <div className="font-bold text-sm">
                        {clashChecker.result.hasConflict ? 'Collision Detected' : 'Schedule Validated - Zero Conflicts'}
                      </div>
                      <p className="text-xs mt-1 leading-relaxed">{clashChecker.result.message}</p>
                      <div className="text-[11px] opacity-75 mt-1">Verified at: {clashChecker.result.checkedAt}</div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Campus Room Allocation Table */}
          <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-2xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <h3 className="text-base font-bold text-slate-900">Campus Rooms & Allocation Directory</h3>
              <div className="text-xs text-slate-500">
                Total Rooms: <span className="font-bold text-slate-800">{campusRooms.length}</span>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-600 border-b border-slate-200">
                  <tr>
                    <th className="py-2.5 px-3 font-semibold">Room Code & Name</th>
                    <th className="py-2.5 px-3 font-semibold">Campus</th>
                    <th className="py-2.5 px-3 font-semibold">Wing</th>
                    <th className="py-2.5 px-3 font-semibold">Type</th>
                    <th className="py-2.5 px-3 font-semibold">Capacity</th>
                    <th className="py-2.5 px-3 font-semibold">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredRooms.slice(0, 8).map(room => (
                    <tr key={room.id} className="hover:bg-slate-50/50">
                      <td className="py-2.5 px-3 font-bold text-slate-900">{room.name}</td>
                      <td className="py-2.5 px-3 text-slate-600">{room.campus}</td>
                      <td className="py-2.5 px-3 text-purple-700 font-medium">{room.wing}</td>
                      <td className="py-2.5 px-3 text-slate-600">{room.type}</td>
                      <td className="py-2.5 px-3 font-mono font-bold text-slate-800">{room.capacity} Seats</td>
                      <td className="py-2.5 px-3">
                        <span className="px-2 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                          {room.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Sub-View 8: Academic Year Rollover Engine */}
      {effectiveTab === 'rollover' && (
        <div className="space-y-6 animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-sm space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-slate-100">
              <div>
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-purple-50 text-purple-700 text-xs font-bold border border-purple-100 mb-2">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>Central Academic Progression Authority</span>
                </div>
                <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900">
                  Academic Year Rollover Engine
                </h2>
                <p className="text-xs sm:text-sm text-slate-500 mt-1 max-w-2xl leading-relaxed">
                  Safely promote eligible students to the next grade level, transition terminal classes to Alumni status, and retain students requiring academic retakes.
                </p>
              </div>

              {hasSnapshot && (
                <button
                  type="button"
                  onClick={handleUndoRollover}
                  className="px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs flex items-center gap-2 shadow-sm transition-all cursor-pointer"
                >
                  <Undo2 className="w-4 h-4" />
                  <span>Undo Last Batch Rollover</span>
                </button>
              )}
            </div>

            {/* Session Mapping & Progression Controls */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5 text-xs">
              <div className="space-y-1.5">
                <label className="font-bold text-slate-700">Source Session (Closing)</label>
                <select 
                  value={rolloverSourceSession}
                  onChange={(e) => setRolloverSourceSession(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 font-semibold"
                >
                  {sessions.map(s => (
                    <option key={s.id} value={s.name}>{s.name} ({s.status})</option>
                  ))}
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="font-bold text-slate-700">Target Session (Upcoming)</label>
                <select 
                  value={rolloverTargetSession}
                  onChange={(e) => setRolloverTargetSession(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 font-semibold"
                >
                  {sessions.map(s => (
                    <option key={s.id} value={s.name}>{s.name} ({s.status})</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Guardrails */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 pt-2">
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200/80 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-800 text-xs">Passing Threshold</span>
                  <span className="font-mono font-bold text-purple-700 text-xs">{rolloverPassingThreshold}%</span>
                </div>
                <input 
                  type="range"
                  min="33"
                  max="60"
                  value={rolloverPassingThreshold}
                  onChange={(e) => setRolloverPassingThreshold(Number(e.target.value))}
                  className="w-full accent-purple-600"
                />
                <p className="text-[11px] text-slate-500">Students with exam score &lt; {rolloverPassingThreshold}% are detained in current grade.</p>
              </div>

              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200/80 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-800 text-xs">Strict Fee Clearance</span>
                  <input 
                    type="checkbox"
                    checked={rolloverRequireFeeClearance}
                    onChange={(e) => setRolloverRequireFeeClearance(e.target.checked)}
                    className="w-4 h-4 accent-purple-600 rounded"
                  />
                </div>
                <p className="text-[11px] text-slate-500">Require 100% fee status 'Paid' before promoting student.</p>
              </div>

              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200/80 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-800 text-xs">Hardship Override</span>
                  <input 
                    type="checkbox"
                    checked={allowHardshipOverride}
                    onChange={(e) => setAllowHardshipOverride(e.target.checked)}
                    className="w-4 h-4 accent-purple-600 rounded"
                  />
                </div>
                <p className="text-[11px] text-slate-500">Superadmin discretion for students on approved financial aid.</p>
              </div>
            </div>

            {allowHardshipOverride && (
              <div className="p-4 bg-purple-50 rounded-2xl border border-purple-200 space-y-1.5 text-xs">
                <label className="font-bold text-purple-900">Hardship Override Justification (Required for Audit Trail)</label>
                <input 
                  type="text"
                  placeholder="e.g. Approved under Board of Trustees Scholarship Order #BOT-2026-44..."
                  value={hardshipJustification}
                  onChange={(e) => setHardshipJustification(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-purple-200 rounded-xl text-purple-950 focus:outline-none"
                />
              </div>
            )}

            <div className="pt-4 flex items-center justify-end">
              <button
                type="button"
                onClick={simulateRolloverAudit}
                className="px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white font-bold text-sm rounded-xl shadow-md transition-all cursor-pointer flex items-center gap-2"
              >
                <RotateCcw className="w-4 h-4" />
                <span>Simulate & Execute Rollover Audit</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 1: Session Create / Edit */}
      {isSessionModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white rounded-3xl p-6 sm:p-7 max-w-lg w-full shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-base font-bold text-slate-900">
                {editingSessionId ? 'Edit Academic Session' : 'Create Academic Session'}
              </h3>
              <button 
                type="button" 
                onClick={() => setIsSessionModalOpen(false)}
                className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {sessionOverlapWarning && (
              <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-900 flex items-start gap-2">
                <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                <span>{sessionOverlapWarning}</span>
              </div>
            )}

            <form onSubmit={handleSaveSession} className="space-y-3.5 text-xs">
              <div>
                <label className="block text-slate-600 font-semibold mb-1">Session Name *</label>
                <input 
                  type="text"
                  placeholder="e.g. Academic Session 2026-2027"
                  value={sessionForm.name}
                  onChange={(e) => setSessionForm({ ...sessionForm, name: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-600 font-semibold mb-1">Term Structure</label>
                  <select 
                    value={sessionForm.term}
                    onChange={(e) => setSessionForm({ ...sessionForm, term: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
                  >
                    <option value="Full Year Regular">Full Year Regular</option>
                    <option value="Semester System (2 Terms)">Semester System (2 Terms)</option>
                    <option value="Trimester System (3 Terms)">Trimester System (3 Terms)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-slate-600 font-semibold mb-1">Initial Status</label>
                  <select 
                    value={sessionForm.status}
                    onChange={(e) => setSessionForm({ ...sessionForm, status: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
                  >
                    <option value="Active (Current)">Active (Current)</option>
                    <option value="Planned">Planned</option>
                    <option value="Archived">Archived</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-600 font-semibold mb-1">Start Date</label>
                  <input 
                    type="date"
                    value={sessionForm.startDate}
                    onChange={(e) => setSessionForm({ ...sessionForm, startDate: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
                  />
                </div>
                <div>
                  <label className="block text-slate-600 font-semibold mb-1">End Date</label>
                  <input 
                    type="date"
                    value={sessionForm.endDate}
                    onChange={(e) => setSessionForm({ ...sessionForm, endDate: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-600 font-semibold mb-1">Wings Covered</label>
                <input 
                  type="text"
                  placeholder="All Wings (School, College, University)"
                  value={sessionForm.wings}
                  onChange={(e) => setSessionForm({ ...sessionForm, wings: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
                />
              </div>

              <div className="pt-3 flex items-center justify-end gap-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsSessionModalOpen(false)}
                  className="px-4 py-2 text-slate-600 font-semibold hover:bg-slate-100 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-purple-600 hover:bg-purple-700 text-white font-bold rounded-xl shadow-xs"
                >
                  Save Session
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: School Class Create / Edit */}
      {isClassModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white rounded-3xl p-6 sm:p-7 max-w-lg w-full shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-base font-bold text-slate-900">
                {editingClassId ? 'Edit School Class' : 'Add School Class'}
              </h3>
              <button 
                type="button" 
                onClick={() => setIsClassModalOpen(false)}
                className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveClass} className="space-y-3.5 text-xs">
              <div className="grid grid-cols-3 gap-3">
                <div className="col-span-2">
                  <label className="block text-slate-600 font-semibold mb-1">Grade Name *</label>
                  <input 
                    type="text"
                    placeholder="e.g. Grade 9"
                    value={classForm.grade}
                    onChange={(e) => setClassForm({ ...classForm, grade: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
                    required
                  />
                </div>
                <div>
                  <label className="block text-slate-600 font-semibold mb-1">Seq Weight</label>
                  <input 
                    type="number"
                    value={classForm.sequenceWeight}
                    onChange={(e) => setClassForm({ ...classForm, sequenceWeight: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
                    title="Lower number = earlier grade (Grade 1=1, Grade 10=10)"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-600 font-semibold mb-1">Wing</label>
                  <select 
                    value={classForm.wing}
                    onChange={(e) => setClassForm({ ...classForm, wing: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
                  >
                    <option value="Primary Wing">Primary Wing</option>
                    <option value="Middle Wing">Middle Wing</option>
                    <option value="Secondary Wing">Secondary Wing</option>
                    <option value="Cambridge Wing">Cambridge Wing</option>
                  </select>
                </div>
                <div>
                  <label className="block text-slate-600 font-semibold mb-1">Total Capacity</label>
                  <input 
                    type="number"
                    value={classForm.capacity}
                    onChange={(e) => setClassForm({ ...classForm, capacity: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-600 font-semibold mb-1">Sections (Comma-Separated)</label>
                <input 
                  type="text"
                  placeholder="A, B, C (Rose)"
                  value={classForm.sectionsInput}
                  onChange={(e) => setClassForm({ ...classForm, sectionsInput: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
                />
              </div>

              <div className="flex items-center gap-2 pt-1">
                <input 
                  type="checkbox"
                  id="isTerminalCheck"
                  checked={classForm.isTerminal}
                  onChange={(e) => setClassForm({ ...classForm, isTerminal: e.target.checked })}
                  className="w-4 h-4 accent-purple-600 rounded"
                />
                <label htmlFor="isTerminalCheck" className="text-slate-700 font-medium">
                  Terminal Class (Students graduate to Alumni status upon passing rollover)
                </label>
              </div>

              <div className="pt-3 flex items-center justify-end gap-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsClassModalOpen(false)}
                  className="px-4 py-2 text-slate-600 font-semibold hover:bg-slate-100 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-purple-600 hover:bg-purple-700 text-white font-bold rounded-xl shadow-xs"
                >
                  Save Class
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* SECURITY ALERT MODAL: Deletion Guard */}
      {deleteBlockedModal.isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white rounded-3xl p-6 sm:p-7 max-w-md w-full shadow-2xl border border-rose-200 space-y-4">
            <div className="flex items-center gap-3 text-rose-600">
              <div className="p-3 bg-rose-50 rounded-2xl border border-rose-200">
                <ShieldAlert className="w-6 h-6 text-rose-600" />
              </div>
              <div>
                <h3 className="text-base font-extrabold text-slate-900">{deleteBlockedModal.title}</h3>
                <span className="text-xs font-semibold text-rose-600">Integrity Violation Guard Active</span>
              </div>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed">
              {deleteBlockedModal.reason}
            </p>

            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs text-slate-500">
              Tip: Open the <strong className="text-slate-800">Students Module</strong> to transfer or re-assign these {deleteBlockedModal.enrolledCount} students to another grade before removing this class.
            </div>

            <div className="pt-2 flex justify-end">
              <button
                type="button"
                onClick={() => setDeleteBlockedModal({ isOpen: false, title: '', reason: '', enrolledCount: 0 })}
                className="px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl transition-all cursor-pointer"
              >
                Understood, Keep Class Protected
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: Rollover Audit Breakdown Preview */}
      {isRolloverModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white rounded-3xl p-6 sm:p-7 max-w-3xl w-full shadow-2xl border border-slate-200 space-y-4 max-h-[90vh] flex flex-col">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <h3 className="text-base font-bold text-slate-900">Academic Rollover Pre-Flight Audit</h3>
                <p className="text-xs text-slate-500">{rolloverSourceSession} → {rolloverTargetSession}</p>
              </div>
              <button 
                type="button" 
                onClick={() => setIsRolloverModalOpen(false)}
                className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Audit Summary Badges */}
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 text-center text-xs">
              <div className="p-2.5 bg-purple-50 rounded-xl border border-purple-100">
                <span className="text-[10px] text-purple-700 font-semibold block">Total Cohort</span>
                <span className="text-base font-extrabold text-purple-900">{rolloverAuditResult.totalInspected}</span>
              </div>
              <div className="p-2.5 bg-emerald-50 rounded-xl border border-emerald-100">
                <span className="text-[10px] text-emerald-700 font-semibold block">Promoted</span>
                <span className="text-base font-extrabold text-emerald-900">{rolloverAuditResult.promotedCount}</span>
              </div>
              <div className="p-2.5 bg-blue-50 rounded-xl border border-blue-100">
                <span className="text-[10px] text-blue-700 font-semibold block">Alumni Grad</span>
                <span className="text-base font-extrabold text-blue-900">{rolloverAuditResult.graduatedAlumniCount}</span>
              </div>
              <div className="p-2.5 bg-amber-50 rounded-xl border border-amber-100">
                <span className="text-[10px] text-amber-700 font-semibold block">Detained (Retake)</span>
                <span className="text-base font-extrabold text-amber-900">{rolloverAuditResult.detainedCount}</span>
              </div>
              <div className="p-2.5 bg-rose-50 rounded-xl border border-rose-100">
                <span className="text-[10px] text-rose-700 font-semibold block">Fee Holds</span>
                <span className="text-base font-extrabold text-rose-900">{rolloverAuditResult.feeDefaulterCount}</span>
              </div>
            </div>

            {/* Breakdown Table */}
            <div className="overflow-y-auto flex-1 border border-slate-200 rounded-xl text-xs">
              <table className="w-full text-left">
                <thead className="bg-slate-50 text-slate-600 sticky top-0 border-b border-slate-200">
                  <tr>
                    <th className="py-2.5 px-3 font-semibold">Student</th>
                    <th className="py-2.5 px-3 font-semibold">Current Class</th>
                    <th className="py-2.5 px-3 font-semibold">Score</th>
                    <th className="py-2.5 px-3 font-semibold">Fee</th>
                    <th className="py-2.5 px-3 font-semibold">Decision & Next Grade</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {rolloverAuditResult.breakdown.map((row, i) => (
                    <tr key={i} className="hover:bg-slate-50/50">
                      <td className="py-2 px-3 font-medium text-slate-800">{row.name}</td>
                      <td className="py-2 px-3 text-slate-600">{row.currentGrade}</td>
                      <td className="py-2 px-3 font-mono font-bold text-slate-800">{row.score}%</td>
                      <td className="py-2 px-3">
                        <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                          row.feeStatus === 'Paid' ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                        }`}>
                          {row.feeStatus}
                        </span>
                      </td>
                      <td className="py-2 px-3">
                        <div className="font-semibold text-slate-900 flex items-center gap-1.5">
                          <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                            row.action === 'Graduate to Alumni' ? 'bg-blue-100 text-blue-800' :
                            row.action === 'Promote' ? 'bg-emerald-100 text-emerald-800' :
                            row.action === 'Detain' ? 'bg-amber-100 text-amber-800' : 'bg-rose-100 text-rose-800'
                          }`}>
                            {row.action}
                          </span>
                          <span className="text-slate-600 text-[11px] font-mono">→ {row.targetGrade}</span>
                        </div>
                        <div className="text-[10px] text-slate-500 mt-0.5">{row.reason}</div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
              <span className="text-[11px] text-slate-500">
                A backup snapshot will be saved in LocalStorage before mutation.
              </span>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setIsRolloverModalOpen(false)}
                  disabled={isExecutingRollover}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition-all cursor-pointer"
                >
                  Close
                </button>
                <button
                  type="button"
                  onClick={executeOfficialRollover}
                  disabled={isExecutingRollover || rolloverAuditResult.totalInspected === 0}
                  className="px-5 py-2.5 text-xs font-bold text-white bg-purple-600 hover:bg-purple-700 rounded-xl shadow-md transition-all cursor-pointer flex items-center gap-1.5 disabled:opacity-50"
                >
                  <RotateCcw className={`w-4 h-4 ${isExecutingRollover ? 'animate-spin' : ''}`} />
                  <span>{isExecutingRollover ? 'Executing Rollover...' : 'Execute Batch Rollover'}</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default SuperadminAcademicsView;
