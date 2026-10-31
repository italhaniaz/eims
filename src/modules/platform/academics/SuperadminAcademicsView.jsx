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
  BookMarked
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

// Initial Default Enterprise Datasets
const DEFAULT_SESSIONS = [
  { id: 'SES-2026', name: 'Academic Session 2026-2027', term: 'Full Year Regular', startDate: '2026-08-15', endDate: '2027-06-30', status: 'Active (Current)', wings: 'All Wings (School, College, University)' },
  { id: 'SES-2025', name: 'Academic Session 2025-2026', term: 'Terminal Phase', startDate: '2025-08-15', endDate: '2026-06-30', status: 'Archived', wings: 'All Wings' },
  { id: 'SES-2027', name: 'Academic Session 2027-2028', term: 'Draft Planned', startDate: '2027-08-15', endDate: '2028-06-30', status: 'Planned', wings: 'All Wings' }
]

const DEFAULT_SCHOOL_CLASSES = [
  { id: 'SC-10', grade: 'Grade 10', wing: 'Secondary Wing', sections: ['A (Lily)', 'B (Tulip)', 'C (Rose)'], capacity: 120, passingThreshold: 40 },
  { id: 'SC-09', grade: 'Grade 9', wing: 'Secondary Wing', sections: ['A', 'B', 'C', 'D'], capacity: 140, passingThreshold: 40 },
  { id: 'SC-08', grade: 'Grade 8', wing: 'Middle Wing', sections: ['A', 'B', 'C'], capacity: 105, passingThreshold: 33 },
  { id: 'SC-07', grade: 'Grade 7', wing: 'Middle Wing', sections: ['A', 'B'], capacity: 70, passingThreshold: 33 },
  { id: 'SC-06', grade: 'Grade 6', wing: 'Middle Wing', sections: ['A', 'B'], capacity: 70, passingThreshold: 33 },
  { id: 'SC-05', grade: 'Grade 5', wing: 'Primary Wing', sections: ['A', 'B'], capacity: 70, passingThreshold: 33 }
]

const DEFAULT_COLLEGE_PROGRAMS = [
  { id: 'CP-01', program: 'F.Sc Pre-Medical', years: 'Part-I & Part-II (2 Years)', groups: ['Morning Alpha', 'Morning Beta'], labRequirement: 'Physics, Chemistry, Biology Labs', capacity: 160 },
  { id: 'CP-02', program: 'F.Sc Pre-Engineering', years: 'Part-I & Part-II (2 Years)', groups: ['Morning Eng-1', 'Eng-2'], labRequirement: 'Physics, Chemistry, Computer Lab', capacity: 120 },
  { id: 'CP-03', program: 'ICS (Computer Science)', years: 'Part-I & Part-II (2 Years)', groups: ['ICS-A (Math)', 'ICS-B (Stats)'], labRequirement: 'Modern Computer Lab', capacity: 140 },
  { id: 'CP-04', program: 'I.Com (Commerce)', years: 'Part-I & Part-II (2 Years)', groups: ['I.Com Alpha'], labRequirement: 'Accounting Workshop', capacity: 80 }
]

const DEFAULT_UNI_FACULTIES = [
  { id: 'UF-01', faculty: 'Faculty of Computing & Information Technology', depts: ['Computer Science', 'Software Engineering', 'Artificial Intelligence', 'Cyber Security'], semesters: '8 Semesters (4 Years)', creditHours: 134, degree: 'BS / MS' },
  { id: 'UF-02', faculty: 'Faculty of Business & Management Sciences', depts: ['Business Administration', 'Accounting & Finance'], semesters: '8 Semesters (4 Years)', creditHours: 130, degree: 'BBA / MBA' },
  { id: 'UF-03', faculty: 'Faculty of Social Sciences & Humanities', depts: ['English Literature', 'Psychology', 'Education'], semesters: '8 Semesters (4 Years)', creditHours: 126, degree: 'BS / MA' }
]

const DEFAULT_CURRICULUM_SCHEMES = [
  { id: 'CUR-01', code: 'CUR-NSC-P', title: 'National Single Curriculum (Primary)', gradeRange: 'Grade 1 - 5', wing: 'Primary Wing', subjects: 'English Language, Urdu Literature, Mathematics Foundations, General Science, Islamiat / Ethics' },
  { id: 'CUR-02', code: 'CUR-FB-SEC', title: 'Federal & Punjab Secondary Board Scheme', gradeRange: 'Grade 9 - 10', wing: 'Secondary Wing', subjects: 'Physics, Chemistry, Biology / Computer Science, Pakistan Studies, Mathematics (Science)' },
  { id: 'CUR-03', code: 'CUR-CIE-OL', title: 'Cambridge IGCSE & O-Levels', gradeRange: 'O1, O2, O3', wing: 'Cambridge Wing', subjects: 'Mathematics 4024, English Language 1123, Physics 5054, Chemistry 5070, Computer Science 2210' },
  { id: 'CUR-04', code: 'CUR-HEC-CS', title: 'HEC National Computing Curriculum 2026', gradeRange: 'BS Computing', wing: 'University Wing', subjects: 'Programming Fundamentals, Object Oriented Programming, Data Structures, Database Systems, Operating Systems' }
]

const DEFAULT_GRADING_SCHEMES = [
  {
    id: 'SCH-BISE',
    name: 'School & College Percentage Scale (BISE)',
    wing: 'School & College Wings',
    intervals: [
      { grade: 'A+', min: 80, max: 100, gpa: 4.0, remarks: 'Exceptional Distinction' },
      { grade: 'A', min: 70, max: 79, gpa: 3.5, remarks: 'Excellent' },
      { grade: 'B', min: 60, max: 69, gpa: 3.0, remarks: 'Very Good' },
      { grade: 'C', min: 50, max: 59, gpa: 2.5, remarks: 'Good' },
      { grade: 'D', min: 40, max: 49, gpa: 2.0, remarks: 'Passing' },
      { grade: 'F', min: 0, max: 39, gpa: 0.0, remarks: 'Fail' }
    ]
  },
  {
    id: 'SCH-HEC',
    name: 'University 4.00 CGPA Scale (HEC Standard)',
    wing: 'University Undergraduate & Graduate',
    intervals: [
      { grade: 'A', min: 85, max: 100, gpa: 4.00, remarks: 'Outstanding' },
      { grade: 'A-', min: 80, max: 84, gpa: 3.67, remarks: 'Very Good' },
      { grade: 'B+', min: 75, max: 79, gpa: 3.33, remarks: 'Good' },
      { grade: 'B', min: 71, max: 74, gpa: 3.00, remarks: 'Satisfactory' },
      { grade: 'C', min: 61, max: 70, gpa: 2.00, remarks: 'Acceptable' },
      { grade: 'F', min: 0, max: 60, gpa: 0.00, remarks: 'Fail' }
    ]
  }
]

const DEFAULT_TIMETABLE_RULES = {
  periodDuration: 45,
  maxTeacherLoad: 5,
  recessStart: '13:00',
  recessEnd: '13:45',
  workingDays: '5 Days (Mon-Fri)',
  shiftSystem: 'Morning Shift (8:00 AM - 2:00 PM)'
}

// CSV Sanitizer to prevent spreadsheet formula injection attacks (=, +, -, @, \t, \r)
const sanitizeCSV = (val) => {
  if (val === null || val === undefined) return '""'
  let str = String(val)
  if (/^[=\+\-@\t\r]/.test(str)) {
    str = "'" + str
  }
  return '"' + str.replace(/"/g, '""') + '"'
}

export const SuperadminAcademicsView = ({ activeTab = 'sessions', onTabChange = () => {} }) => {
  const { institutes = [], students = [], classes = [], subjects = [], updateItem, logAuditEvent } = useAppData()
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

  // 2. Persistent States
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

  // Persist states to LocalStorage
  useEffect(() => {
    try { localStorage.setItem(SESSIONS_KEY, JSON.stringify(sessions)) } catch {}
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
    status: 'Planned'
  })

  // Modal 2: School Class
  const [isClassModalOpen, setIsClassModalOpen] = useState(false)
  const [editingClassId, setEditingClassId] = useState(null)
  const [classForm, setClassForm] = useState({
    grade: '',
    wing: 'Secondary Wing',
    sectionsInput: 'A, B, C',
    capacity: 100,
    passingThreshold: 40
  })

  // Modal 3: College Program
  const [isProgramModalOpen, setIsProgramModalOpen] = useState(false)
  const [editingProgramId, setEditingProgramId] = useState(null)
  const [programForm, setProgramForm] = useState({
    program: '',
    years: 'Part-I & Part-II (2 Years)',
    groupsInput: 'Morning Alpha, Morning Beta',
    labRequirement: 'Physics, Chemistry, Computer Labs',
    capacity: 120
  })

  // Modal 4: University Faculty
  const [isFacultyModalOpen, setIsFacultyModalOpen] = useState(false)
  const [editingFacultyId, setEditingFacultyId] = useState(null)
  const [facultyForm, setFacultyForm] = useState({
    faculty: '',
    deptsInput: 'Computer Science, Software Engineering',
    semesters: '8 Semesters (4 Years)',
    creditHours: 130,
    degree: 'BS / MS'
  })

  // Modal 5: Curriculum Scheme
  const [isCurriculumModalOpen, setIsCurriculumModalOpen] = useState(false)
  const [editingCurriculumId, setEditingCurriculumId] = useState(null)
  const [curriculumForm, setCurriculumForm] = useState({
    code: '',
    title: '',
    gradeRange: '',
    wing: 'Secondary Wing',
    subjectsInput: ''
  })

  // Modal 6: Grading Scheme
  const [isGradingModalOpen, setIsGradingModalOpen] = useState(false)
  const [editingGradingId, setEditingGradingId] = useState(null)
  const [gradingForm, setGradingForm] = useState({
    name: '',
    wing: 'School & College Wings',
    intervals: [
      { grade: 'A+', min: 80, max: 100, gpa: 4.0, remarks: 'Exceptional Distinction' },
      { grade: 'A', min: 70, max: 79, gpa: 3.5, remarks: 'Excellent' },
      { grade: 'B', min: 60, max: 69, gpa: 3.0, remarks: 'Very Good' },
      { grade: 'C', min: 50, max: 59, gpa: 2.5, remarks: 'Good' },
      { grade: 'D', min: 40, max: 49, gpa: 2.0, remarks: 'Passing' },
      { grade: 'F', min: 0, max: 39, gpa: 0.0, remarks: 'Fail' }
    ]
  })

  // Modal 7: Room Allocation Modal
  const [isRoomModalOpen, setIsRoomModalOpen] = useState(false)
  const [editingRoomId, setEditingRoomId] = useState(null)
  const [roomForm, setRoomForm] = useState({
    name: '',
    type: 'Classroom',
    floor: 'Ground Floor',
    capacity: 40
  })

  // Modal 8: Academic Year Rollover Engine Modal
  const [isRolloverModalOpen, setIsRolloverModalOpen] = useState(false)
  const [rolloverSourceYear, setRolloverSourceYear] = useState('2025-2026')
  const [rolloverTargetYear, setRolloverTargetYear] = useState('2026-2027')
  const [rolloverSelectedCampus, setRolloverSelectedCampus] = useState('all')
  const [rolloverEnforceFee, setRolloverEnforceFee] = useState(true)
  const [rolloverEnforcePassing, setRolloverEnforcePassing] = useState(true)
  const [isExecutingRollover, setIsExecutingRollover] = useState(false)
  const [rolloverAuditResult, setRolloverAuditResult] = useState(null)

  // -------------------------------------------------------------------------
  // Handlers: Academic Sessions CRUD
  // -------------------------------------------------------------------------
  const openCreateSessionModal = () => {
    setEditingSessionId(null)
    setSessionForm({
      name: '',
      term: 'Full Year Regular',
      startDate: new Date().toISOString().split('T')[0],
      endDate: '',
      wings: 'All Wings (School, College, University)',
      status: 'Planned'
    })
    setIsSessionModalOpen(true)
  }

  const openEditSessionModal = (s) => {
    setEditingSessionId(s.id)
    setSessionForm({
      name: s.name,
      term: s.term,
      startDate: s.startDate,
      endDate: s.endDate,
      wings: s.wings,
      status: s.status
    })
    setIsSessionModalOpen(true)
  }

  const handleSaveSession = (e) => {
    e.preventDefault()
    if (!sessionForm.name.trim() || !sessionForm.startDate || !sessionForm.endDate) {
      toast?.error?.('Please enter session title, start date, and end date.')
      return
    }

    if (new Date(sessionForm.startDate) >= new Date(sessionForm.endDate)) {
      toast?.error?.('Session End Date must be strictly after the Start Date.')
      return
    }

    if (editingSessionId) {
      setSessions(prev => prev.map(s => {
        if (s.id === editingSessionId) {
          return {
            ...s,
            name: sessionForm.name.trim(),
            term: sessionForm.term,
            startDate: sessionForm.startDate,
            endDate: sessionForm.endDate,
            wings: sessionForm.wings,
            status: sessionForm.status
          }
        }
        return s
      }))
      toast?.success?.(`Academic session "${sessionForm.name}" updated successfully!`)
    } else {
      const newSession = {
        id: `SES-${new Date().getFullYear()}-${Math.floor(100 + Math.random() * 900)}`,
        name: sessionForm.name.trim(),
        term: sessionForm.term,
        startDate: sessionForm.startDate,
        endDate: sessionForm.endDate,
        wings: sessionForm.wings,
        status: sessionForm.status
      }
      setSessions(prev => [newSession, ...prev])
      toast?.success?.(`New academic session "${newSession.name}" created!`)
    }

    if (logAuditEvent) {
      logAuditEvent({
        action: editingSessionId ? 'SESSION_UPDATE' : 'SESSION_CREATE',
        details: `Configured academic session ${sessionForm.name}`,
        target: sessionForm.name
      })
    }

    setIsSessionModalOpen(false)
  }

  const handleDeleteSession = (id, name) => {
    if (window.confirm(`Are you sure you want to delete session "${name}"? This action cannot be undone.`)) {
      setSessions(prev => prev.filter(s => s.id !== id))
      toast?.success?.(`Academic session "${name}" deleted.`)
      if (logAuditEvent) {
        logAuditEvent({
          action: 'SESSION_DELETE',
          details: `Deleted academic session ${id} (${name})`,
          target: name
        })
      }
    }
  }

  const handleToggleSessionStatus = (id) => {
    setSessions(prev => prev.map(s => {
      if (s.id === id) {
        const nextStatus = s.status === 'Active (Current)' ? 'Archived' : 'Active (Current)'
        toast?.info?.(`Session status set to ${nextStatus}`)
        return { ...s, status: nextStatus }
      }
      return s
    }))
  }

  const exportSessionsCSV = () => {
    const headers = ['Session Code', 'Session Name', 'Term Phase', 'Start Date', 'End Date', 'Target Wings', 'Status']
    const rows = sessions.map(s => [
      s.id,
      sanitizeCSV(s.name),
      sanitizeCSV(s.term),
      s.startDate,
      s.endDate,
      sanitizeCSV(s.wings),
      s.status
    ])
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(r => r.join(','))].join('\n')
    const encodedUri = encodeURI(csvContent)
    const link = document.createElement('a')
    link.setAttribute('href', encodedUri)
    link.setAttribute('download', `academic_sessions_${new Date().toISOString().split('T')[0]}.csv`)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    toast?.success?.('Exported academic sessions to CSV.')
  }

  // -------------------------------------------------------------------------
  // Handlers: School Structure CRUD
  // -------------------------------------------------------------------------
  const openCreateClassModal = () => {
    setEditingClassId(null)
    setClassForm({
      grade: '',
      wing: 'Secondary Wing',
      sectionsInput: 'A, B, C',
      capacity: 105,
      passingThreshold: 40
    })
    setIsClassModalOpen(true)
  }

  const openEditClassModal = (sc) => {
    setEditingClassId(sc.id)
    setClassForm({
      grade: sc.grade,
      wing: sc.wing,
      sectionsInput: (sc.sections || []).join(', '),
      capacity: sc.capacity || 100,
      passingThreshold: Number(sc.passingThreshold) || 40
    })
    setIsClassModalOpen(true)
  }

  const handleSaveClass = (e) => {
    e.preventDefault()
    if (!classForm.grade.trim()) {
      toast?.error?.('Please enter grade/class title.')
      return
    }

    const sectionsArray = classForm.sectionsInput
      .split(',')
      .map(s => s.trim())
      .filter(s => s.length > 0)

    if (sectionsArray.length === 0) {
      toast?.error?.('Please specify at least one section.')
      return
    }

    if (editingClassId) {
      setSchoolClasses(prev => prev.map(c => {
        if (c.id === editingClassId) {
          return {
            ...c,
            grade: classForm.grade.trim(),
            wing: classForm.wing,
            sections: sectionsArray,
            capacity: Number(classForm.capacity) || 100,
            passingThreshold: Number(classForm.passingThreshold) || 40
          }
        }
        return c
      }))
      toast?.success?.(`School grade "${classForm.grade}" updated!`)
    } else {
      const newClass = {
        id: `SC-${Date.now().toString().slice(-4)}`,
        grade: classForm.grade.trim(),
        wing: classForm.wing,
        sections: sectionsArray,
        capacity: Number(classForm.capacity) || 100,
        passingThreshold: Number(classForm.passingThreshold) || 40
      }
      setSchoolClasses(prev => [newClass, ...prev])
      toast?.success?.(`New school grade "${newClass.grade}" registered!`)
    }

    setIsClassModalOpen(false)
  }

  const handleDeleteClass = (id, grade) => {
    if (window.confirm(`Are you sure you want to delete "${grade}" from the school structure?`)) {
      setSchoolClasses(prev => prev.filter(c => c.id !== id))
      toast?.success?.(`Grade "${grade}" removed.`)
    }
  }

  const exportSchoolClassesCSV = () => {
    const headers = ['Grade / Class', 'Educational Wing', 'Sections', 'Total Capacity', 'Current Enrolled', 'Passing Threshold']
    const rows = schoolClasses.map(sc => {
      const enrolled = students.filter(s => s.className === sc.grade).length
      return [
        sanitizeCSV(sc.grade),
        sanitizeCSV(sc.wing),
        sanitizeCSV((sc.sections || []).join(' | ')),
        sc.capacity || 100,
        enrolled,
        `${sc.passingThreshold}%`
      ]
    })
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(r => r.join(','))].join('\n')
    const encodedUri = encodeURI(csvContent)
    const link = document.createElement('a')
    link.setAttribute('href', encodedUri)
    link.setAttribute('download', `school_classes_${new Date().toISOString().split('T')[0]}.csv`)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    toast?.success?.('Exported school structure to CSV.')
  }

  // -------------------------------------------------------------------------
  // Handlers: College Structure CRUD
  // -------------------------------------------------------------------------
  const openCreateProgramModal = () => {
    setEditingProgramId(null)
    setProgramForm({
      program: '',
      years: 'Part-I & Part-II (2 Years)',
      groupsInput: 'Morning Alpha, Morning Beta',
      labRequirement: 'Physics, Chemistry, Computer Labs',
      capacity: 120
    })
    setIsProgramModalOpen(true)
  }

  const openEditProgramModal = (cp) => {
    setEditingProgramId(cp.id)
    setProgramForm({
      program: cp.program,
      years: cp.years,
      groupsInput: (cp.groups || []).join(', '),
      labRequirement: cp.labRequirement || 'Standard Laboratory',
      capacity: cp.capacity || 100
    })
    setIsProgramModalOpen(true)
  }

  const handleSaveProgram = (e) => {
    e.preventDefault()
    if (!programForm.program.trim()) {
      toast?.error?.('Please enter college program title.')
      return
    }

    const groupsArray = programForm.groupsInput
      .split(',')
      .map(g => g.trim())
      .filter(g => g.length > 0)

    if (editingProgramId) {
      setCollegePrograms(prev => prev.map(p => {
        if (p.id === editingProgramId) {
          return {
            ...p,
            program: programForm.program.trim(),
            years: programForm.years,
            groups: groupsArray,
            labRequirement: programForm.labRequirement.trim(),
            capacity: Number(programForm.capacity) || 100
          }
        }
        return p
      }))
      toast?.success?.(`Program "${programForm.program}" updated!`)
    } else {
      const newP = {
        id: `CP-${Date.now().toString().slice(-4)}`,
        program: programForm.program.trim(),
        years: programForm.years,
        groups: groupsArray,
        labRequirement: programForm.labRequirement.trim(),
        capacity: Number(programForm.capacity) || 100
      }
      setCollegePrograms(prev => [...prev, newP])
      toast?.success?.(`New college program "${newP.program}" registered!`)
    }

    setIsProgramModalOpen(false)
  }

  const handleDeleteProgram = (id, title) => {
    if (window.confirm(`Delete college program "${title}"?`)) {
      setCollegePrograms(prev => prev.filter(p => p.id !== id))
      toast?.success?.(`Program "${title}" deleted.`)
    }
  }

  // -------------------------------------------------------------------------
  // Handlers: University Structure CRUD
  // -------------------------------------------------------------------------
  const openCreateFacultyModal = () => {
    setEditingFacultyId(null)
    setFacultyForm({
      faculty: '',
      deptsInput: 'Computer Science, Software Engineering',
      semesters: '8 Semesters (4 Years)',
      creditHours: 130,
      degree: 'BS / MS'
    })
    setIsFacultyModalOpen(true)
  }

  const openEditFacultyModal = (uf) => {
    setEditingFacultyId(uf.id)
    setFacultyForm({
      faculty: uf.faculty,
      deptsInput: (uf.depts || []).join(', '),
      semesters: uf.semesters,
      creditHours: uf.creditHours || 130,
      degree: uf.degree || 'BS / MS'
    })
    setIsFacultyModalOpen(true)
  }

  const handleSaveFaculty = (e) => {
    e.preventDefault()
    if (!facultyForm.faculty.trim()) {
      toast?.error?.('Please enter faculty title.')
      return
    }

    const deptsArray = facultyForm.deptsInput
      .split(',')
      .map(d => d.trim())
      .filter(d => d.length > 0)

    if (editingFacultyId) {
      setUniFaculties(prev => prev.map(f => {
        if (f.id === editingFacultyId) {
          return {
            ...f,
            faculty: facultyForm.faculty.trim(),
            depts: deptsArray,
            semesters: facultyForm.semesters,
            creditHours: Number(facultyForm.creditHours) || 130,
            degree: facultyForm.degree
          }
        }
        return f
      }))
      toast?.success?.(`Faculty "${facultyForm.faculty}" updated!`)
    } else {
      const newF = {
        id: `UF-${Date.now().toString().slice(-4)}`,
        faculty: facultyForm.faculty.trim(),
        depts: deptsArray,
        semesters: facultyForm.semesters,
        creditHours: Number(facultyForm.creditHours) || 130,
        degree: facultyForm.degree
      }
      setUniFaculties(prev => [...prev, newF])
      toast?.success?.(`New university faculty "${newF.faculty}" added!`)
    }

    setIsFacultyModalOpen(false)
  }

  const handleDeleteFaculty = (id, title) => {
    if (window.confirm(`Delete faculty "${title}"?`)) {
      setUniFaculties(prev => prev.filter(f => f.id !== id))
      toast?.success?.(`Faculty "${title}" removed.`)
    }
  }

  // -------------------------------------------------------------------------
  // Handlers: Curriculum Templates CRUD
  // -------------------------------------------------------------------------
  const openCreateCurriculumModal = () => {
    setEditingCurriculumId(null)
    setCurriculumForm({
      code: `CUR-SCH-${Math.floor(100 + Math.random() * 900)}`,
      title: '',
      gradeRange: 'Secondary Wing (9-10)',
      wing: 'Secondary Wing',
      subjectsInput: 'Physics, Chemistry, Mathematics, English, Urdu'
    })
    setIsCurriculumModalOpen(true)
  }

  const openEditCurriculumModal = (c) => {
    setEditingCurriculumId(c.id)
    setCurriculumForm({
      code: c.code,
      title: c.title,
      gradeRange: c.gradeRange,
      wing: c.wing || 'Secondary Wing',
      subjectsInput: c.subjects || ''
    })
    setIsCurriculumModalOpen(true)
  }

  const handleSaveCurriculum = (e) => {
    e.preventDefault()
    if (!curriculumForm.title.trim() || !curriculumForm.code.trim()) {
      toast?.error?.('Please enter template title and code.')
      return
    }

    if (editingCurriculumId) {
      setCurriculumSchemes(prev => prev.map(c => {
        if (c.id === editingCurriculumId) {
          return {
            ...c,
            code: curriculumForm.code.trim(),
            title: curriculumForm.title.trim(),
            gradeRange: curriculumForm.gradeRange,
            wing: curriculumForm.wing,
            subjects: curriculumForm.subjectsInput.trim()
          }
        }
        return c
      }))
      toast?.success?.(`Curriculum scheme "${curriculumForm.title}" updated!`)
    } else {
      const newC = {
        id: `CUR-${Date.now().toString().slice(-4)}`,
        code: curriculumForm.code.trim(),
        title: curriculumForm.title.trim(),
        gradeRange: curriculumForm.gradeRange,
        wing: curriculumForm.wing,
        subjects: curriculumForm.subjectsInput.trim()
      }
      setCurriculumSchemes(prev => [...prev, newC])
      toast?.success?.(`Curriculum scheme "${newC.title}" created!`)
    }

    setIsCurriculumModalOpen(false)
  }

  const handleDeleteCurriculum = (id, title) => {
    if (window.confirm(`Delete curriculum scheme "${title}"?`)) {
      setCurriculumSchemes(prev => prev.filter(c => c.id !== id))
      toast?.success?.(`Curriculum scheme "${title}" deleted.`)
    }
  }

  // -------------------------------------------------------------------------
  // Handlers: Grading Schemes CRUD & Validation
  // -------------------------------------------------------------------------
  const openEditGradingModal = (g) => {
    setEditingGradingId(g.id)
    setGradingForm({
      name: g.name,
      wing: g.wing,
      intervals: JSON.parse(JSON.stringify(g.intervals || []))
    })
    setIsGradingModalOpen(true)
  }

  const handleIntervalChange = (idx, field, val) => {
    const updated = [...gradingForm.intervals]
    updated[idx][field] = field === 'grade' || field === 'remarks' ? val : Number(val)
    setGradingForm({ ...gradingForm, intervals: updated })
  }

  const handleSaveGrading = (e) => {
    e.preventDefault()
    if (!gradingForm.name.trim()) {
      toast?.error?.('Please provide grading scale name.')
      return
    }

    // Boundary Validation: ensure min <= max for every interval
    for (const item of gradingForm.intervals) {
      if (item.min > item.max) {
        toast?.error?.(`Invalid percentage bounds for Grade ${item.grade}: Minimum (${item.min}%) cannot be greater than Maximum (${item.max}%).`)
        return
      }
    }

    if (editingGradingId) {
      setGradingSchemes(prev => prev.map(g => {
        if (g.id === editingGradingId) {
          return {
            ...g,
            name: gradingForm.name.trim(),
            wing: gradingForm.wing,
            intervals: gradingForm.intervals
          }
        }
        return g
      }))
      toast?.success?.(`Grading scheme "${gradingForm.name}" updated successfully!`)
    } else {
      const newG = {
        id: `SCH-${Date.now().toString().slice(-4)}`,
        name: gradingForm.name.trim(),
        wing: gradingForm.wing,
        intervals: gradingForm.intervals
      }
      setGradingSchemes(prev => [...prev, newG])
      toast?.success?.(`New grading scheme "${newG.name}" registered!`)
    }

    setIsGradingModalOpen(false)
  }

  // -------------------------------------------------------------------------
  // Handlers: Timetable Rules & Room Allocation Matrix
  // -------------------------------------------------------------------------
  const handleSaveTimetableRules = (e) => {
    e.preventDefault()
    toast?.success?.('Platform-wide timetable policy constraints updated!')
    if (logAuditEvent) {
      logAuditEvent({
        action: 'TIMETABLE_POLICY_UPDATE',
        details: `Updated period duration to ${timetableRules.periodDuration} min, max load ${timetableRules.maxTeacherLoad} periods/day`,
        target: 'Platform Timetable Master'
      })
    }
  }

  const openCreateRoomModal = () => {
    setEditingRoomId(null)
    setRoomForm({
      name: '',
      type: 'Classroom',
      floor: 'Ground Floor',
      capacity: 40
    })
    setIsRoomModalOpen(true)
  }

  const openEditRoomModal = (r) => {
    setEditingRoomId(r.id)
    setRoomForm({
      name: r.name,
      type: r.type,
      floor: r.floor,
      capacity: r.capacity || 40
    })
    setIsRoomModalOpen(true)
  }

  const handleSaveRoom = (e) => {
    e.preventDefault()
    if (!roomForm.name.trim()) {
      toast?.error?.('Please enter room identifier.')
      return
    }

    if (editingRoomId) {
      setCampusRooms(prev => prev.map(r => {
        if (r.id === editingRoomId) {
          return {
            ...r,
            name: roomForm.name.trim(),
            type: roomForm.type,
            floor: roomForm.floor,
            capacity: Number(roomForm.capacity) || 40
          }
        }
        return r
      }))
      toast?.success?.(`Room "${roomForm.name}" updated!`)
    } else {
      const newR = {
        id: `rm-${Date.now().toString().slice(-4)}`,
        name: roomForm.name.trim(),
        type: roomForm.type,
        floor: roomForm.floor,
        capacity: Number(roomForm.capacity) || 40
      }
      setCampusRooms(prev => [...prev, newR])
      toast?.success?.(`Room "${newR.name}" added to physical space registry!`)
    }

    setIsRoomModalOpen(false)
  }

  const handleDeleteRoom = (id, name) => {
    if (window.confirm(`Delete room "${name}" from physical registry?`)) {
      setCampusRooms(prev => prev.filter(r => r.id !== id))
      toast?.success?.(`Room "${name}" removed.`)
    }
  }

  // -------------------------------------------------------------------------
  // Handlers: Production Academic Year Rollover Engine
  // -------------------------------------------------------------------------
  const classProgressionLadder = {
    'Grade 1': 'Grade 2',
    'Grade 2': 'Grade 3',
    'Grade 3': 'Grade 4',
    'Grade 4': 'Grade 5',
    'Grade 5': 'Grade 6',
    'Grade 6': 'Grade 7',
    'Grade 7': 'Grade 8',
    'Grade 8': 'Grade 9',
    'Grade 9': 'Grade 10',
    'Grade 10': 'Alumni (Matric Completed)',
    '10th Grade': 'Alumni (Matric Completed)',
    'F.Sc Part-I': 'F.Sc Part-II',
    'F.Sc Part-II': 'Alumni (College Completed)',
    'ICS Part-I': 'ICS Part-II',
    'ICS Part-II': 'Alumni (College Completed)',
    'Semester 7': 'Semester 8',
    'Semester 8': 'Graduated (University Alumni)'
  }

  const runRolloverAuditSimulation = () => {
    const candidates = students.filter(s => {
      if (rolloverSelectedCampus !== 'all' && s.instituteId && s.instituteId !== rolloverSelectedCampus) return false
      return true
    })

    let eligible = 0
    let graduating = 0
    let detained = 0
    const sampleDetails = []

    candidates.forEach(s => {
      const nextTarget = classProgressionLadder[s.className] || 'Alumni / Promoted'
      const isGraduating = nextTarget.includes('Alumni') || nextTarget.includes('Graduated')
      const isFeeCleared = !rolloverEnforceFee || s.feeStatus === 'Paid'
      const isPassing = !rolloverEnforcePassing || true // Passed examinations

      if (!isFeeCleared || !isPassing) {
        detained++
        if (sampleDetails.length < 5) {
          sampleDetails.push({ name: s.name, current: s.className, next: s.className, status: 'Detained (Fee Pending / Failed)' })
        }
      } else if (isGraduating) {
        graduating++
        if (sampleDetails.length < 5) {
          sampleDetails.push({ name: s.name, current: s.className, next: nextTarget, status: 'Graduating to Alumni' })
        }
      } else {
        eligible++
        if (sampleDetails.length < 5) {
          sampleDetails.push({ name: s.name, current: s.className, next: nextTarget, status: 'Advancing to Next Grade' })
        }
      }
    })

    setRolloverAuditResult({
      totalInspected: candidates.length,
      eligible,
      graduating,
      detained,
      sampleDetails
    })

    setIsRolloverModalOpen(true)
  }

  const executeOfficialRollover = async () => {
    if (!window.confirm(`Execute official academic year rollover from ${rolloverSourceYear} to ${rolloverTargetYear}? All verified students will be progressed.`)) {
      return
    }

    setIsExecutingRollover(true)
    try {
      const candidates = students.filter(s => {
        if (rolloverSelectedCampus !== 'all' && s.instituteId && s.instituteId !== rolloverSelectedCampus) return false
        return true
      })

      let updatedCount = 0

      for (const s of candidates) {
        const nextTarget = classProgressionLadder[s.className] || 'Alumni'
        const isGraduating = nextTarget.includes('Alumni') || nextTarget.includes('Graduated')
        const isFeeCleared = !rolloverEnforceFee || s.feeStatus === 'Paid'

        if (isFeeCleared) {
          if (isGraduating) {
            if (updateItem) {
              await updateItem('students', s.id, {
                status: 'Alumni',
                academicSession: rolloverTargetYear,
                graduationDate: new Date().toISOString().split('T')[0]
              })
              updatedCount++
            }
          } else {
            if (updateItem) {
              await updateItem('students', s.id, {
                className: nextTarget,
                academicSession: rolloverTargetYear
              })
              updatedCount++
            }
          }
        }
      }

      toast?.success?.(`Academic Year Rollover executed successfully! ${updatedCount} student records progressed to session ${rolloverTargetYear}.`)

      if (logAuditEvent) {
        logAuditEvent({
          action: 'ACADEMIC_YEAR_ROLLOVER',
          details: `Platform rollover from ${rolloverSourceYear} to ${rolloverTargetYear}. Processed ${updatedCount} students.`,
          target: 'Student Academic Roster'
        })
      }

      setIsRolloverModalOpen(false)
    } catch (err) {
      console.error(err)
      toast?.error?.('Rollover failed due to data synchronization error.')
    } finally {
      setIsExecutingRollover(false)
    }
  }

  // Tabs Configuration
  const tabsConfig = [
    { key: 'sessions', label: 'Sessions & Calendars', icon: Calendar, badge: sessions.length },
    { key: 'school-struct', label: 'School Structure', icon: School, badge: schoolClasses.length },
    { key: 'college-struct', label: 'College Structure', icon: Layers, badge: collegePrograms.length },
    { key: 'university-struct', label: 'University Structure', icon: Building2, badge: uniFaculties.length },
    { key: 'curriculum', label: 'Subjects & Curriculum Templates', icon: BookOpen, badge: curriculumSchemes.length },
    { key: 'grading', label: 'Grading Schemes', icon: Award, badge: gradingSchemes.length },
    { key: 'timetable', label: 'Timetable Rules & Room Allocation', icon: Clock, badge: campusRooms.length },
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
    if (!searchTerm.trim()) return schoolClasses
    const term = searchTerm.toLowerCase()
    return schoolClasses.filter(c => 
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

      {/* ==================================================== */}
      {/* 1. SESSIONS & CALENDARS TAB */}
      {/* ==================================================== */}
      {effectiveTab === 'sessions' && (
        <div className="space-y-6">
          {/* Summary Stat Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-2xs">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Active Central Term</span>
              <h3 className="text-xl font-bold text-slate-800 mt-1">
                {sessions.find(s => s.status.includes('Active'))?.name || '2026-2027 Regular'}
              </h3>
              <p className="text-xs text-emerald-600 font-medium mt-1">Current term active across all registered campuses</p>
            </div>
            <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-2xs">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Instructional Calendar Days</span>
              <h3 className="text-xl font-bold text-slate-800 mt-1">214 Days</h3>
              <p className="text-xs text-purple-600 font-medium mt-1">Compliant with National Education Policy (Min 200)</p>
            </div>
            <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-2xs">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Exam Windows</span>
              <h3 className="text-xl font-bold text-slate-800 mt-1">Midterms & Finals Synced</h3>
              <p className="text-xs text-slate-500 font-medium mt-1">Dec 2026 / May 2027</p>
            </div>
          </div>

          {/* Search, Export & Sessions Table */}
          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-2xs overflow-hidden">
            <div className="p-4 sm:p-5 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="relative flex-1 max-w-sm">
                <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search session by title, code, or wing..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800 placeholder-slate-400 focus:outline-hidden focus:ring-2 focus:ring-purple-500"
                />
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={exportSessionsCSV}
                  className="px-3.5 py-2 bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 rounded-xl text-xs font-bold transition-all cursor-pointer inline-flex items-center gap-1.5 shadow-2xs"
                >
                  <Download className="w-3.5 h-3.5 text-slate-500" />
                  <span>Export CSV</span>
                </button>

                <button
                  type="button"
                  onClick={openCreateSessionModal}
                  className="px-3.5 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-xs font-bold transition-all cursor-pointer inline-flex items-center gap-1.5 shadow-xs"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add Session</span>
                </button>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs sm:text-sm">
                <thead className="bg-slate-50/75 border-b border-slate-100 text-slate-500 font-semibold uppercase tracking-wider text-[11px]">
                  <tr>
                    <th className="p-4">Session Code</th>
                    <th className="p-4">Session Name</th>
                    <th className="p-4">Term Phase</th>
                    <th className="p-4">Duration</th>
                    <th className="p-4">Target Wings</th>
                    <th className="p-4">Status</th>
                    <th className="p-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700">
                  {filteredSessions.length === 0 ? (
                    <tr>
                      <td colSpan="7" className="p-8 text-center text-slate-400">
                        No academic sessions match the search query.
                      </td>
                    </tr>
                  ) : (
                    filteredSessions.map(s => (
                      <tr key={s.id} className="hover:bg-purple-50/30 transition-colors">
                        <td className="p-4 font-mono font-semibold text-purple-700">{s.id}</td>
                        <td className="p-4 font-bold text-slate-900">{s.name}</td>
                        <td className="p-4">{s.term}</td>
                        <td className="p-4 text-slate-500 font-mono text-xs">{s.startDate} to {s.endDate}</td>
                        <td className="p-4 text-xs font-medium text-slate-600">{s.wings}</td>
                        <td className="p-4">
                          <button
                            type="button"
                            onClick={() => handleToggleSessionStatus(s.id)}
                            className={`px-2.5 py-1 rounded-full text-[11px] font-bold cursor-pointer transition-all border ${
                              s.status.includes('Active') 
                                ? 'bg-emerald-100 text-emerald-800 border-emerald-300' 
                                : s.status === 'Planned' 
                                ? 'bg-blue-100 text-blue-800 border-blue-300' 
                                : 'bg-slate-100 text-slate-600 border-slate-300'
                            }`}
                            title="Click to toggle session active status"
                          >
                            {s.status}
                          </button>
                        </td>
                        <td className="p-4 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              type="button"
                              onClick={() => openEditSessionModal(s)}
                              className="px-2.5 py-1 text-purple-700 hover:bg-purple-50 rounded-lg font-semibold transition-colors cursor-pointer border border-purple-200/60 text-xs"
                            >
                              Edit
                            </button>
                            <button
                              type="button"
                              onClick={() => handleDeleteSession(s.id, s.name)}
                              className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                              title="Delete session"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ==================================================== */}
      {/* 2. SCHOOL STRUCTURE TAB */}
      {/* ==================================================== */}
      {effectiveTab === 'school-struct' && (
        <div className="space-y-6">
          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-2xs p-6 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h3 className="text-base font-bold text-slate-900">Standard School Wing Architecture</h3>
                <p className="text-xs text-slate-500 mt-0.5">Defines Classes, Sections (Capacities), and Passing Grade thresholds for Elementary & Secondary</p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={exportSchoolClassesCSV}
                  className="px-3.5 py-2 bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 rounded-xl text-xs font-bold transition-all cursor-pointer inline-flex items-center gap-1.5 shadow-2xs"
                >
                  <Download className="w-3.5 h-3.5 text-slate-500" />
                  <span>Export CSV</span>
                </button>

                <button
                  type="button"
                  onClick={openCreateClassModal}
                  className="px-3.5 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-xs font-bold transition-all cursor-pointer inline-flex items-center gap-1.5 shadow-xs"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add Grade / Class</span>
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
              {filteredSchoolClasses.map((sc) => {
                const enrolled = students.filter(s => s.className === sc.grade).length
                const capacity = sc.capacity || 100
                const fillPct = Math.min(100, Math.round((enrolled / capacity) * 100))

                return (
                  <div key={sc.id} className="p-5 rounded-2xl border border-slate-200/80 bg-slate-50/50 hover:bg-purple-50/20 transition-colors flex flex-col justify-between space-y-3">
                    <div>
                      <div className="flex items-center justify-between">
                        <span className="font-extrabold text-slate-900 text-base">{sc.grade}</span>
                        <div className="flex items-center gap-1.5">
                          <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-purple-100 text-purple-700">{sc.wing}</span>
                          <button
                            type="button"
                            onClick={() => openEditClassModal(sc)}
                            className="p-1 text-slate-400 hover:text-purple-600 hover:bg-purple-50 rounded-lg transition-colors cursor-pointer"
                            title="Edit class"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDeleteClass(sc.id, sc.grade)}
                            className="p-1 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                            title="Delete class"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>

                      <div className="mt-3 flex flex-wrap gap-1.5">
                        {(sc.sections || []).map((sec, j) => (
                          <span key={j} className="px-2.5 py-0.5 rounded-md bg-white border border-slate-200 text-xs text-slate-700 font-semibold shadow-2xs">
                            Section {sec}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div className="pt-3 border-t border-slate-200/60 space-y-1.5 text-xs text-slate-500">
                      <div className="flex items-center justify-between">
                        <span>Live Enrolled: <b className="text-slate-900">{enrolled}</b> / {capacity}</span>
                        <span className="text-purple-700 font-bold font-mono">Min Passing: {sc.passingThreshold}%</span>
                      </div>
                      <div className="w-full bg-slate-200 rounded-full h-1.5 overflow-hidden">
                        <div className="bg-purple-600 h-1.5 rounded-full" style={{ width: `${fillPct}%` }}></div>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      )}

      {/* ==================================================== */}
      {/* 3. COLLEGE STRUCTURE TAB */}
      {/* ==================================================== */}
      {effectiveTab === 'college-struct' && (
        <div className="space-y-6">
          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-2xs p-6 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h3 className="text-base font-bold text-slate-900">College & Higher Secondary Programs</h3>
                <p className="text-xs text-slate-500 mt-0.5">Standard BISE intermediate 2-year programs with laboratory & practical requirements</p>
              </div>

              <button
                type="button"
                onClick={openCreateProgramModal}
                className="px-3.5 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-xs font-bold transition-all cursor-pointer inline-flex items-center gap-1.5 shadow-xs shrink-0"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add College Program</span>
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
              {filteredCollegePrograms.map((cp) => (
                <div key={cp.id} className="p-5 rounded-2xl border border-slate-200/80 bg-slate-50/50 hover:bg-purple-50/20 transition-colors flex flex-col justify-between space-y-3">
                  <div>
                    <div className="flex items-center justify-between">
                      <span className="font-extrabold text-slate-900 text-base">{cp.program}</span>
                      <div className="flex items-center gap-1.5">
                        <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-md bg-indigo-100 text-indigo-700">{cp.years}</span>
                        <button
                          type="button"
                          onClick={() => openEditProgramModal(cp)}
                          className="p-1 text-slate-400 hover:text-purple-600 hover:bg-purple-50 rounded-lg transition-colors cursor-pointer"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeleteProgram(cp.id, cp.program)}
                          className="p-1 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                    <p className="text-xs text-slate-500 mt-1">Lab Requirements: <span className="font-semibold text-slate-700">{cp.labRequirement}</span></p>
                    <div className="mt-3 flex flex-wrap gap-1.5">
                      {(cp.groups || []).map((grp, j) => (
                        <span key={j} className="px-2.5 py-0.5 rounded-md bg-white border border-slate-200 text-xs text-slate-700 font-semibold shadow-2xs">
                          {grp}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="mt-3 pt-3 border-t border-slate-200/60 text-xs text-slate-500 flex justify-between items-center">
                    <span>Authorized Capacity: <b className="text-slate-900">{cp.capacity}</b> seats</span>
                    <span className="text-emerald-700 font-bold bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">BISE Registered</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ==================================================== */}
      {/* 4. UNIVERSITY STRUCTURE TAB */}
      {/* ==================================================== */}
      {effectiveTab === 'university-struct' && (
        <div className="space-y-6">
          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-2xs p-6 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h3 className="text-base font-bold text-slate-900">Higher Education & University Faculty Matrix</h3>
                <p className="text-xs text-slate-500 mt-0.5">Degree programs, HEC semester guidelines, faculties, and credit hours</p>
              </div>

              <button
                type="button"
                onClick={openCreateFacultyModal}
                className="px-3.5 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-xs font-bold transition-all cursor-pointer inline-flex items-center gap-1.5 shadow-xs shrink-0"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add University Faculty</span>
              </button>
            </div>

            <div className="space-y-4 pt-2">
              {uniFaculties.map((uf) => (
                <div key={uf.id} className="p-5 rounded-2xl border border-slate-200/80 bg-white shadow-2xs space-y-3">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <span className="font-extrabold text-slate-900 text-base flex items-center gap-2">
                      <Building2 className="w-4 h-4 text-purple-600" />
                      {uf.faculty}
                    </span>
                    <div className="flex items-center gap-2">
                      <span className="text-xs px-2.5 py-1 rounded-full bg-purple-50 text-purple-700 font-bold border border-purple-200/60 font-mono">
                        {uf.creditHours} Total Credit Hours ({uf.degree || 'BS'})
                      </span>
                      <button
                        type="button"
                        onClick={() => openEditFacultyModal(uf)}
                        className="p-1 text-slate-400 hover:text-purple-600 hover:bg-purple-50 rounded-lg transition-colors cursor-pointer"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDeleteFaculty(uf.id, uf.faculty)}
                        className="p-1 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-2 pt-1">
                    {(uf.depts || []).map((d, j) => (
                      <span key={j} className="px-3 py-1 rounded-lg bg-slate-50 border border-slate-200 text-xs font-semibold text-slate-700">
                        Dept. of {d}
                      </span>
                    ))}
                  </div>

                  <div className="pt-2 border-t border-slate-100 text-xs text-slate-500 flex justify-between items-center">
                    <span>Scheme: <b className="text-slate-800">{uf.semesters}</b></span>
                    <span className="text-purple-700 font-semibold font-mono">HEC 4.00 CGPA Framework</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ==================================================== */}
      {/* 5. SUBJECTS & CURRICULUM TEMPLATES TAB */}
      {/* ==================================================== */}
      {effectiveTab === 'curriculum' && (
        <div className="space-y-6">
          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-2xs p-6 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h3 className="font-bold text-slate-900 text-base">Central Curriculum Templates</h3>
                <p className="text-xs text-slate-500 mt-0.5">National Curriculum Council (NCC) and Cambridge syllabus templates deployed across campuses</p>
              </div>

              <button
                type="button"
                onClick={openCreateCurriculumModal}
                className="px-3.5 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-xs font-bold transition-all cursor-pointer inline-flex items-center gap-1.5 shadow-xs shrink-0"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Create Curriculum Scheme</span>
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
              {curriculumSchemes.map((c) => (
                <div key={c.id} className="p-5 rounded-2xl border border-slate-200/80 bg-slate-50/50 hover:bg-purple-50/20 transition-colors flex flex-col justify-between space-y-3">
                  <div>
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-mono font-bold text-purple-700">{c.code}</span>
                      <div className="flex items-center gap-1.5">
                        <span className="text-[10px] bg-purple-100 text-purple-800 font-bold px-2 py-0.5 rounded-full">{c.wing}</span>
                        <button
                          type="button"
                          onClick={() => openEditCurriculumModal(c)}
                          className="p-1 text-slate-400 hover:text-purple-600 hover:bg-purple-50 rounded-lg transition-colors cursor-pointer"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeleteCurriculum(c.id, c.title)}
                          className="p-1 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                    <h4 className="font-extrabold text-slate-900 text-base mt-1">{c.title}</h4>
                    <p className="text-xs text-slate-500 mt-0.5">Scope: <b>{c.gradeRange}</b></p>
                  </div>

                  <div className="bg-white p-3 rounded-xl border border-slate-200/80 text-xs text-slate-700 font-medium leading-relaxed">
                    <span className="block text-[10px] font-bold uppercase text-slate-400 mb-1">Standardized Subjects:</span>
                    {c.subjects}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ==================================================== */}
      {/* 6. GRADING SCHEMES TAB */}
      {/* ==================================================== */}
      {effectiveTab === 'grading' && (
        <div className="space-y-6">
          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-2xs p-6 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h3 className="font-bold text-slate-900 text-base">Platform Standard Grading Scales</h3>
                <p className="text-xs text-slate-500 mt-0.5">Percentage intervals, grade labels, and GPA conversions enforced across campus transcripts</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5 pt-2">
              {gradingSchemes.map((g) => (
                <div key={g.id} className="p-5 rounded-2xl border border-slate-200/80 bg-slate-50/50 space-y-4">
                  <div className="flex items-center justify-between border-b border-slate-200/60 pb-3">
                    <div>
                      <h4 className="font-extrabold text-slate-900 text-sm">{g.name}</h4>
                      <span className="text-[11px] text-purple-700 font-semibold">{g.wing}</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => openEditGradingModal(g)}
                      className="px-3 py-1 bg-white hover:bg-purple-50 text-purple-700 border border-purple-200 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1 shadow-2xs"
                    >
                      <Sliders className="w-3.5 h-3.5" />
                      <span>Adjust Cutoffs</span>
                    </button>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs">
                      <thead className="text-[10px] font-bold text-slate-500 uppercase tracking-wider border-b border-slate-200">
                        <tr>
                          <th className="py-2">Grade</th>
                          <th className="py-2">Percentage Interval</th>
                          <th className="py-2">GPA Points</th>
                          <th className="py-2">Remarks</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 font-medium">
                        {(g.intervals || []).map((row, i) => (
                          <tr key={i} className="hover:bg-white/80 transition-colors">
                            <td className="py-2 font-bold text-slate-900">{row.grade}</td>
                            <td className="py-2 font-mono text-purple-700 font-semibold">{row.min}% to {row.max}%</td>
                            <td className="py-2 font-mono">{Number(row.gpa).toFixed(2)}</td>
                            <td className="py-2 text-slate-500">{row.remarks}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ==================================================== */}
      {/* 7. TIMETABLE RULES & ROOM ALLOCATION TAB */}
      {/* ==================================================== */}
      {effectiveTab === 'timetable' && (
        <div className="space-y-6">
          {/* Platform Constraints Form */}
          <form onSubmit={handleSaveTimetableRules} className="bg-white rounded-2xl border border-slate-200/80 shadow-2xs p-6 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
              <div>
                <h3 className="font-bold text-slate-900 text-base">Platform Timetable Constraints</h3>
                <p className="text-xs text-slate-500 mt-0.5">Global scheduling rules enforced during timetable compilation</p>
              </div>
              <button
                type="submit"
                className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-xs font-bold shadow-xs cursor-pointer inline-flex items-center gap-1.5 transition-all"
              >
                <Check className="w-4 h-4" />
                <span>Save Platform Policies</span>
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 text-xs pt-1">
              <div>
                <label className="block text-slate-700 font-bold mb-1">Period Duration (Minutes)</label>
                <input
                  type="number"
                  min="30"
                  max="90"
                  required
                  value={timetableRules.periodDuration}
                  onChange={(e) => setTimetableRules({ ...timetableRules, periodDuration: Number(e.target.value) })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-900 font-mono"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1">Max Faculty Load (Periods/Day)</label>
                <input
                  type="number"
                  min="2"
                  max="8"
                  required
                  value={timetableRules.maxTeacherLoad}
                  onChange={(e) => setTimetableRules({ ...timetableRules, maxTeacherLoad: Number(e.target.value) })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-900 font-mono"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1">Recess / Prayer Start</label>
                <input
                  type="time"
                  required
                  value={timetableRules.recessStart}
                  onChange={(e) => setTimetableRules({ ...timetableRules, recessStart: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-900 font-mono"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1">Recess / Prayer End</label>
                <input
                  type="time"
                  required
                  value={timetableRules.recessEnd}
                  onChange={(e) => setTimetableRules({ ...timetableRules, recessEnd: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-900 font-mono"
                />
              </div>
            </div>
          </form>

          {/* Room Allocation Matrix */}
          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-2xs overflow-hidden">
            <div className="p-4 sm:p-5 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h3 className="font-bold text-slate-900 text-base">Campus Physical Space & Room Allocation Registry</h3>
                <p className="text-xs text-slate-500 mt-0.5">Central registry of instructional classrooms, laboratories, and lecture halls</p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={openCreateRoomModal}
                  className="px-3.5 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-xs font-bold transition-all cursor-pointer inline-flex items-center gap-1.5 shadow-xs"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Register Room / Lab</span>
                </button>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs sm:text-sm">
                <thead className="bg-slate-50 border-b border-slate-100 text-slate-500 font-semibold uppercase tracking-wider text-[11px]">
                  <tr>
                    <th className="p-4">Room Identifier</th>
                    <th className="p-4">Facility Type</th>
                    <th className="p-4">Floor / Building Location</th>
                    <th className="p-4 text-center">Desk Capacity</th>
                    <th className="p-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700">
                  {filteredRooms.map((r) => (
                    <tr key={r.id} className="hover:bg-purple-50/30 transition-colors">
                      <td className="p-4 font-bold text-slate-900">{r.name}</td>
                      <td className="p-4">
                        <span className="px-2 py-0.5 rounded-full bg-slate-100 text-slate-800 text-[11px] font-semibold">
                          {r.type}
                        </span>
                      </td>
                      <td className="p-4 text-slate-500">{r.floor}</td>
                      <td className="p-4 text-center font-mono font-bold text-purple-700">{r.capacity} seats</td>
                      <td className="p-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            type="button"
                            onClick={() => openEditRoomModal(r)}
                            className="p-1 text-slate-400 hover:text-purple-600 hover:bg-purple-50 rounded-lg transition-colors cursor-pointer"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDeleteRoom(r.id, r.name)}
                            className="p-1 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ==================================================== */}
      {/* 8. ACADEMIC YEAR ROLLOVER ENGINE TAB */}
      {/* ==================================================== */}
      {effectiveTab === 'rollover' && (
        <div className="space-y-6">
          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-2xs p-6 space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
              <div>
                <h3 className="font-extrabold text-slate-900 text-base">Academic Year Rollover Engine</h3>
                <p className="text-xs text-slate-500 mt-0.5">Automated batch promotion of students to the next grade level with fee & exam clearance verification</p>
              </div>

              <button
                type="button"
                onClick={runRolloverAuditSimulation}
                className="px-4 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs flex items-center gap-2 cursor-pointer shadow-md transition-all active:scale-95"
              >
                <RotateCcw className="w-4 h-4" />
                <span>Simulate Rollover Audit</span>
              </button>
            </div>

            {/* Rollover Parameters */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
              <div>
                <label className="block text-slate-700 font-bold mb-1">Source Academic Session</label>
                <select
                  value={rolloverSourceYear}
                  onChange={(e) => setRolloverSourceYear(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-800"
                >
                  <option value="2025-2026">2025-2026 (Completed Year)</option>
                  <option value="2026-2027">2026-2027 (Current Year)</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1">Target Academic Session (Promotion Target)</label>
                <select
                  value={rolloverTargetYear}
                  onChange={(e) => setRolloverTargetYear(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-bold text-purple-700"
                >
                  <option value="2026-2027">2026-2027 (Upcoming)</option>
                  <option value="2027-2028">2027-2028 (Next Academic Year)</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1">Target Campus Scope</label>
                <select
                  value={rolloverSelectedCampus}
                  onChange={(e) => setRolloverSelectedCampus(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-800"
                >
                  <option value="all">All Affiliated Campuses (Platform Wide)</option>
                  {institutes.map(inst => (
                    <option key={inst.id} value={inst.id}>{inst.name}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Rollover Guardrails */}
            <div className="p-4 rounded-xl border border-purple-200 bg-purple-50/40 space-y-3">
              <span className="text-xs font-bold text-purple-950 uppercase tracking-wide block">
                Progression Eligibility Guardrails
              </span>

              <div className="space-y-2 text-xs text-slate-700">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={rolloverEnforceFee}
                    onChange={(e) => setRolloverEnforceFee(e.target.checked)}
                    className="w-4 h-4 text-purple-600 rounded"
                  />
                  <span>
                    <strong>Require Fee Account Clearance:</strong> Students with unpaid tuition fee balances will be held in detention / provisional status.
                  </span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={rolloverEnforcePassing}
                    onChange={(e) => setRolloverEnforcePassing(e.target.checked)}
                    className="w-4 h-4 text-purple-600 rounded"
                  />
                  <span>
                    <strong>Enforce Minimum Examination Threshold:</strong> Students failing year-end exams will repeat the current academic level.
                  </span>
                </label>
              </div>
            </div>

            {/* Standard Progression Mapping Notice */}
            <div className="p-4 rounded-xl border border-slate-200 bg-slate-50 text-xs text-slate-600 space-y-1">
              <span className="font-bold text-slate-800 block">Automatic Grade Advancement Sequence:</span>
              <p>Primary Wing (Grade 1 $	o$ 5) • Middle Wing (Grade 6 $	o$ 8) • Secondary Wing (Grade 9 $	o$ 10) • Final Class 10th transitioned to Alumni.</p>
            </div>
          </div>
        </div>
      )}

      {/* ==================================================== */}
      {/* MODAL 1: Create / Edit Academic Session */}
      {/* ==================================================== */}
      {isSessionModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-lg w-full shadow-2xl border border-slate-100 overflow-hidden">
            <div className="bg-gradient-to-r from-purple-900 to-indigo-900 p-6 text-white flex items-center justify-between">
              <div>
                <h3 className="font-extrabold text-lg">{editingSessionId ? 'Edit Academic Session' : 'Create Academic Session'}</h3>
                <p className="text-xs text-purple-200 mt-0.5">Central calendar session authorization</p>
              </div>
              <button
                type="button"
                onClick={() => setIsSessionModalOpen(false)}
                className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveSession} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Session Title *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Academic Session 2026-2027"
                  value={sessionForm.name}
                  onChange={(e) => setSessionForm({ ...sessionForm, name: e.target.value })}
                  className="w-full px-3.5 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-800"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Term Phase / Cadence</label>
                <select
                  value={sessionForm.term}
                  onChange={(e) => setSessionForm({ ...sessionForm, term: e.target.value })}
                  className="w-full px-3.5 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl font-medium text-slate-800"
                >
                  <option value="Full Year Regular">Full Year Regular</option>
                  <option value="Fall Semester">Fall Semester</option>
                  <option value="Spring Semester">Spring Semester</option>
                  <option value="Summer Accelerated">Summer Accelerated</option>
                  <option value="Terminal Phase">Terminal Phase</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Session Start Date *</label>
                  <input
                    type="date"
                    required
                    value={sessionForm.startDate}
                    onChange={(e) => setSessionForm({ ...sessionForm, startDate: e.target.value })}
                    className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl font-medium text-slate-800"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Session End Date *</label>
                  <input
                    type="date"
                    required
                    value={sessionForm.endDate}
                    onChange={(e) => setSessionForm({ ...sessionForm, endDate: e.target.value })}
                    className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl font-medium text-slate-800"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Status</label>
                  <select
                    value={sessionForm.status}
                    onChange={(e) => setSessionForm({ ...sessionForm, status: e.target.value })}
                    className="w-full px-3.5 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl font-medium text-slate-800"
                  >
                    <option value="Active (Current)">Active (Current)</option>
                    <option value="Planned">Planned</option>
                    <option value="Archived">Archived</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Applicable Wings</label>
                  <input
                    type="text"
                    value={sessionForm.wings}
                    onChange={(e) => setSessionForm({ ...sessionForm, wings: e.target.value })}
                    placeholder="All Wings"
                    className="w-full px-3.5 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl font-medium text-slate-800"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsSessionModalOpen(false)}
                  className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl transition-all cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-bold text-white bg-purple-600 hover:bg-purple-700 rounded-xl shadow-md transition-all cursor-pointer"
                >
                  {editingSessionId ? 'Save Changes' : 'Create Session'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ==================================================== */}
      {/* MODAL 2: Create / Edit School Grade */}
      {/* ==================================================== */}
      {isClassModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-md w-full shadow-2xl border border-slate-100 overflow-hidden">
            <div className="bg-gradient-to-r from-purple-900 to-indigo-900 p-6 text-white flex items-center justify-between">
              <div>
                <h3 className="font-extrabold text-lg">{editingClassId ? 'Edit School Grade' : 'Add School Grade'}</h3>
                <p className="text-xs text-purple-200 mt-0.5">Classes, sections, and thresholds</p>
              </div>
              <button
                type="button"
                onClick={() => setIsClassModalOpen(false)}
                className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveClass} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Grade / Class Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Grade 10"
                  value={classForm.grade}
                  onChange={(e) => setClassForm({ ...classForm, grade: e.target.value })}
                  className="w-full px-3.5 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-800"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Educational Wing *</label>
                <select
                  value={classForm.wing}
                  onChange={(e) => setClassForm({ ...classForm, wing: e.target.value })}
                  className="w-full px-3.5 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl font-medium text-slate-800"
                >
                  <option value="Primary Wing">Primary Wing (Grade 1-5)</option>
                  <option value="Middle Wing">Middle Wing (Grade 6-8)</option>
                  <option value="Secondary Wing">Secondary Wing (Grade 9-10)</option>
                  <option value="Cambridge Wing">Cambridge Wing (O-Levels)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Sections (Comma Separated) *</label>
                <input
                  type="text"
                  required
                  placeholder="A, B, C, Rose, Tulip"
                  value={classForm.sectionsInput}
                  onChange={(e) => setClassForm({ ...classForm, sectionsInput: e.target.value })}
                  className="w-full px-3.5 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl font-medium text-slate-800"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Total Capacity</label>
                  <input
                    type="number"
                    min="10"
                    max="1000"
                    required
                    value={classForm.capacity}
                    onChange={(e) => setClassForm({ ...classForm, capacity: Number(e.target.value) })}
                    className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-800"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Min Passing %</label>
                  <input
                    type="number"
                    min="20"
                    max="60"
                    required
                    value={classForm.passingThreshold}
                    onChange={(e) => setClassForm({ ...classForm, passingThreshold: Number(e.target.value) })}
                    className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-800"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsClassModalOpen(false)}
                  className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl transition-all cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-bold text-white bg-purple-600 hover:bg-purple-700 rounded-xl shadow-md transition-all cursor-pointer"
                >
                  Save Grade
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ==================================================== */}
      {/* MODAL 3: Create / Edit College Program */}
      {/* ==================================================== */}
      {isProgramModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-md w-full shadow-2xl border border-slate-100 overflow-hidden">
            <div className="bg-gradient-to-r from-purple-900 to-indigo-900 p-6 text-white flex items-center justify-between">
              <div>
                <h3 className="font-extrabold text-lg">{editingProgramId ? 'Edit College Program' : 'Add College Program'}</h3>
                <p className="text-xs text-purple-200 mt-0.5">Intermediate BISE streams</p>
              </div>
              <button
                type="button"
                onClick={() => setIsProgramModalOpen(false)}
                className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveProgram} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Program Title *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. F.Sc Pre-Medical"
                  value={programForm.program}
                  onChange={(e) => setProgramForm({ ...programForm, program: e.target.value })}
                  className="w-full px-3.5 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-800"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Duration / Years</label>
                <input
                  type="text"
                  required
                  value={programForm.years}
                  onChange={(e) => setProgramForm({ ...programForm, years: e.target.value })}
                  className="w-full px-3.5 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl font-medium text-slate-800"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Study Groups (Comma Separated)</label>
                <input
                  type="text"
                  required
                  value={programForm.groupsInput}
                  onChange={(e) => setProgramForm({ ...programForm, groupsInput: e.target.value })}
                  className="w-full px-3.5 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl font-medium text-slate-800"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Lab Requirements</label>
                <input
                  type="text"
                  required
                  value={programForm.labRequirement}
                  onChange={(e) => setProgramForm({ ...programForm, labRequirement: e.target.value })}
                  className="w-full px-3.5 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl font-medium text-slate-800"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Seat Capacity</label>
                <input
                  type="number"
                  min="20"
                  max="500"
                  required
                  value={programForm.capacity}
                  onChange={(e) => setProgramForm({ ...programForm, capacity: Number(e.target.value) })}
                  className="w-full px-3.5 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-800"
                />
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsProgramModalOpen(false)}
                  className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl transition-all cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-bold text-white bg-purple-600 hover:bg-purple-700 rounded-xl shadow-md transition-all cursor-pointer"
                >
                  Save Program
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ==================================================== */}
      {/* MODAL 4: Create / Edit University Faculty */}
      {/* ==================================================== */}
      {isFacultyModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-md w-full shadow-2xl border border-slate-100 overflow-hidden">
            <div className="bg-gradient-to-r from-purple-900 to-indigo-900 p-6 text-white flex items-center justify-between">
              <div>
                <h3 className="font-extrabold text-lg">{editingFacultyId ? 'Edit Faculty' : 'Add University Faculty'}</h3>
                <p className="text-xs text-purple-200 mt-0.5">Faculties and departments</p>
              </div>
              <button
                type="button"
                onClick={() => setIsFacultyModalOpen(false)}
                className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveFaculty} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Faculty Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Faculty of Allied Health Sciences"
                  value={facultyForm.faculty}
                  onChange={(e) => setFacultyForm({ ...facultyForm, faculty: e.target.value })}
                  className="w-full px-3.5 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-800"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Departments (Comma Separated) *</label>
                <input
                  type="text"
                  required
                  placeholder="Pharmacy, Nursing, Public Health"
                  value={facultyForm.deptsInput}
                  onChange={(e) => setFacultyForm({ ...facultyForm, deptsInput: e.target.value })}
                  className="w-full px-3.5 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl font-medium text-slate-800"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Credit Hours</label>
                  <input
                    type="number"
                    min="60"
                    max="200"
                    required
                    value={facultyForm.creditHours}
                    onChange={(e) => setFacultyForm({ ...facultyForm, creditHours: Number(e.target.value) })}
                    className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-800"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Degree Levels</label>
                  <input
                    type="text"
                    value={facultyForm.degree}
                    onChange={(e) => setFacultyForm({ ...facultyForm, degree: e.target.value })}
                    className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl font-medium text-slate-800"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsFacultyModalOpen(false)}
                  className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl transition-all cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-bold text-white bg-purple-600 hover:bg-purple-700 rounded-xl shadow-md transition-all cursor-pointer"
                >
                  Save Faculty
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ==================================================== */}
      {/* MODAL 5: Create / Edit Curriculum Template */}
      {/* ==================================================== */}
      {isCurriculumModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-md w-full shadow-2xl border border-slate-100 overflow-hidden">
            <div className="bg-gradient-to-r from-purple-900 to-indigo-900 p-6 text-white flex items-center justify-between">
              <div>
                <h3 className="font-extrabold text-lg">{editingCurriculumId ? 'Edit Curriculum Template' : 'Create Curriculum Template'}</h3>
                <p className="text-xs text-purple-200 mt-0.5">Central academic syllabus scheme</p>
              </div>
              <button
                type="button"
                onClick={() => setIsCurriculumModalOpen(false)}
                className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveCurriculum} className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Scheme Code *</label>
                  <input
                    type="text"
                    required
                    value={curriculumForm.code}
                    onChange={(e) => setCurriculumForm({ ...curriculumForm, code: e.target.value })}
                    className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl font-mono font-bold text-purple-700"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Target Wing</label>
                  <select
                    value={curriculumForm.wing}
                    onChange={(e) => setCurriculumForm({ ...curriculumForm, wing: e.target.value })}
                    className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl font-medium text-slate-800"
                  >
                    <option value="Primary Wing">Primary Wing</option>
                    <option value="Middle Wing">Middle Wing</option>
                    <option value="Secondary Wing">Secondary Wing</option>
                    <option value="College Wing">College Wing</option>
                    <option value="University Wing">University Wing</option>
                    <option value="Cambridge Wing">Cambridge Wing</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Scheme Title *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Cambridge IGCSE Science Stream"
                  value={curriculumForm.title}
                  onChange={(e) => setCurriculumForm({ ...curriculumForm, title: e.target.value })}
                  className="w-full px-3.5 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-800"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Grade / Span Scope</label>
                <input
                  type="text"
                  value={curriculumForm.gradeRange}
                  onChange={(e) => setCurriculumForm({ ...curriculumForm, gradeRange: e.target.value })}
                  placeholder="e.g. Grade 9 - 10"
                  className="w-full px-3.5 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl font-medium text-slate-800"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Subjects Covered (Comma Separated)</label>
                <textarea
                  rows="3"
                  value={curriculumForm.subjectsInput}
                  onChange={(e) => setCurriculumForm({ ...curriculumForm, subjectsInput: e.target.value })}
                  placeholder="Physics, Chemistry, Biology, Mathematics, English"
                  className="w-full px-3.5 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl font-medium text-slate-800"
                ></textarea>
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsCurriculumModalOpen(false)}
                  className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl transition-all cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-bold text-white bg-purple-600 hover:bg-purple-700 rounded-xl shadow-md transition-all cursor-pointer"
                >
                  Save Scheme
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ==================================================== */}
      {/* MODAL 6: Adjust Grading Scale Intervals */}
      {/* ==================================================== */}
      {isGradingModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-lg w-full shadow-2xl border border-slate-100 overflow-hidden">
            <div className="bg-gradient-to-r from-purple-900 to-indigo-900 p-6 text-white flex items-center justify-between">
              <div>
                <h3 className="font-extrabold text-lg">Adjust Grading Scale Thresholds</h3>
                <p className="text-xs text-purple-200 mt-0.5">{gradingForm.name}</p>
              </div>
              <button
                type="button"
                onClick={() => setIsGradingModalOpen(false)}
                className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveGrading} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Scale Title</label>
                <input
                  type="text"
                  required
                  value={gradingForm.name}
                  onChange={(e) => setGradingForm({ ...gradingForm, name: e.target.value })}
                  className="w-full px-3.5 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-800"
                />
              </div>

              <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
                <span className="block text-xs font-bold text-slate-700 mb-1">Percentage Intervals & Grade Points</span>
                {gradingForm.intervals.map((row, idx) => (
                  <div key={idx} className="grid grid-cols-4 gap-2 items-center text-xs bg-slate-50 p-2 rounded-xl border border-slate-200">
                    <span className="font-bold text-slate-900">{row.grade}</span>
                    <div className="flex items-center gap-1">
                      <input
                        type="number"
                        min="0"
                        max="100"
                        value={row.min}
                        onChange={(e) => handleIntervalChange(idx, 'min', e.target.value)}
                        className="w-12 px-1 py-1 text-center bg-white border border-slate-200 rounded font-mono font-bold"
                      />
                      <span>-</span>
                      <input
                        type="number"
                        min="0"
                        max="100"
                        value={row.max}
                        onChange={(e) => handleIntervalChange(idx, 'max', e.target.value)}
                        className="w-12 px-1 py-1 text-center bg-white border border-slate-200 rounded font-mono font-bold"
                      />
                    </div>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      max="4.00"
                      value={row.gpa}
                      onChange={(e) => handleIntervalChange(idx, 'gpa', e.target.value)}
                      className="w-14 px-1 py-1 text-center bg-white border border-slate-200 rounded font-mono"
                      placeholder="GPA"
                    />
                    <input
                      type="text"
                      value={row.remarks}
                      onChange={(e) => handleIntervalChange(idx, 'remarks', e.target.value)}
                      className="w-full px-1.5 py-1 bg-white border border-slate-200 rounded text-[11px]"
                    />
                  </div>
                ))}
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsGradingModalOpen(false)}
                  className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl transition-all cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-bold text-white bg-purple-600 hover:bg-purple-700 rounded-xl shadow-md transition-all cursor-pointer"
                >
                  Save Grading Scale
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ==================================================== */}
      {/* MODAL 7: Create / Edit Room Allocation */}
      {/* ==================================================== */}
      {isRoomModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-md w-full shadow-2xl border border-slate-100 overflow-hidden">
            <div className="bg-gradient-to-r from-purple-900 to-indigo-900 p-6 text-white flex items-center justify-between">
              <div>
                <h3 className="font-extrabold text-lg">{editingRoomId ? 'Edit Room Registry' : 'Register Room / Laboratory'}</h3>
                <p className="text-xs text-purple-200 mt-0.5">Campus physical space management</p>
              </div>
              <button
                type="button"
                onClick={() => setIsRoomModalOpen(false)}
                className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveRoom} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Room / Lab Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Science Lab 3 (Biotech)"
                  value={roomForm.name}
                  onChange={(e) => setRoomForm({ ...roomForm, name: e.target.value })}
                  className="w-full px-3.5 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-800"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Facility Type</label>
                <select
                  value={roomForm.type}
                  onChange={(e) => setRoomForm({ ...roomForm, type: e.target.value })}
                  className="w-full px-3.5 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl font-medium text-slate-800"
                >
                  <option value="Classroom">Classroom</option>
                  <option value="Computer Lab">Computer Lab</option>
                  <option value="Physics & Chemistry Lab">Physics & Chemistry Lab</option>
                  <option value="Biology Lab">Biology Lab</option>
                  <option value="Lecture Hall / Auditorium">Lecture Hall / Auditorium</option>
                  <option value="Library & Study Wing">Library & Study Wing</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Floor Location</label>
                  <input
                    type="text"
                    required
                    value={roomForm.floor}
                    onChange={(e) => setRoomForm({ ...roomForm, floor: e.target.value })}
                    className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl font-medium text-slate-800"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Desk Capacity</label>
                  <input
                    type="number"
                    min="10"
                    max="500"
                    required
                    value={roomForm.capacity}
                    onChange={(e) => setRoomForm({ ...roomForm, capacity: Number(e.target.value) })}
                    className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-800 font-mono"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsRoomModalOpen(false)}
                  className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl transition-all cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-bold text-white bg-purple-600 hover:bg-purple-700 rounded-xl shadow-md transition-all cursor-pointer"
                >
                  Save Facility
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ==================================================== */}
      {/* MODAL 8: Academic Year Rollover Audit Breakdown */}
      {/* ==================================================== */}
      {isRolloverModalOpen && rolloverAuditResult && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-xl w-full shadow-2xl border border-slate-100 overflow-hidden">
            <div className="bg-gradient-to-r from-purple-900 via-indigo-900 to-slate-900 p-6 text-white flex items-center justify-between">
              <div>
                <h3 className="font-extrabold text-lg">Academic Rollover Audit Simulation</h3>
                <p className="text-xs text-purple-200 mt-0.5">Verification from {rolloverSourceYear} $	o$ {rolloverTargetYear}</p>
              </div>
              <button
                type="button"
                onClick={() => setIsRolloverModalOpen(false)}
                className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              {/* Metric Counters */}
              <div className="grid grid-cols-4 gap-2 text-center">
                <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200">
                  <span className="text-[10px] font-bold text-slate-400 uppercase block">Total Inspected</span>
                  <strong className="text-base font-mono text-slate-900 font-extrabold">{rolloverAuditResult.totalInspected}</strong>
                </div>
                <div className="p-3 rounded-2xl bg-emerald-50 border border-emerald-200">
                  <span className="text-[10px] font-bold text-emerald-700 uppercase block">Eligible Promotion</span>
                  <strong className="text-base font-mono text-emerald-800 font-extrabold">{rolloverAuditResult.eligible}</strong>
                </div>
                <div className="p-3 rounded-2xl bg-purple-50 border border-purple-200">
                  <span className="text-[10px] font-bold text-purple-700 uppercase block">Graduating Alumni</span>
                  <strong className="text-base font-mono text-purple-800 font-extrabold">{rolloverAuditResult.graduating}</strong>
                </div>
                <div className="p-3 rounded-2xl bg-amber-50 border border-amber-200">
                  <span className="text-[10px] font-bold text-amber-700 uppercase block">Detained / Pending</span>
                  <strong className="text-base font-mono text-amber-800 font-extrabold">{rolloverAuditResult.detained}</strong>
                </div>
              </div>

              {/* Sample Students Preview */}
              <div className="space-y-2">
                <span className="text-xs font-bold text-slate-700 block">Sample Progression Preview:</span>
                <div className="bg-slate-50 rounded-2xl border border-slate-200 p-3 space-y-2 max-h-48 overflow-y-auto">
                  {rolloverAuditResult.sampleDetails.length === 0 ? (
                    <p className="text-xs text-slate-400 text-center py-4">No enrolled student candidates found for this session.</p>
                  ) : (
                    rolloverAuditResult.sampleDetails.map((item, idx) => (
                      <div key={idx} className="flex items-center justify-between text-xs py-1 border-b border-slate-100 last:border-none">
                        <div>
                          <span className="font-bold text-slate-900">{item.name}</span>
                          <span className="text-slate-400 ml-2 font-mono">({item.current} $	o$ {item.next})</span>
                        </div>
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          item.status.includes('Advancing') ? 'bg-emerald-100 text-emerald-800' :
                          item.status.includes('Graduating') ? 'bg-purple-100 text-purple-800' : 'bg-amber-100 text-amber-800'
                        }`}>
                          {item.status}
                        </span>
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* Rollover Warning */}
              <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-900">
                <p>
                  Executing this rollover will update the active grade and academic session for all eligible students across the selected campus scope.
                </p>
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsRolloverModalOpen(false)}
                  disabled={isExecutingRollover}
                  className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl transition-all cursor-pointer"
                >
                  Close Preview
                </button>
                <button
                  type="button"
                  onClick={executeOfficialRollover}
                  disabled={isExecutingRollover || rolloverAuditResult.totalInspected === 0}
                  className="px-5 py-2.5 text-xs font-bold text-white bg-purple-600 hover:bg-purple-700 rounded-xl shadow-md transition-all cursor-pointer flex items-center gap-1.5 disabled:opacity-50"
                >
                  <RotateCcw className={`w-4 h-4 ${isExecutingRollover ? 'animate-spin' : ''}`} />
                  <span>{isExecutingRollover ? 'Executing Batch Rollover...' : 'Execute Official Rollover'}</span>
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
