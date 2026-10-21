import React, { useState, useMemo, useRef, useEffect } from 'react'
import { 
  GraduationCap, 
  Plus, 
  Search, 
  Edit2, 
  Trash2, 
  Mail, 
  Phone, 
  IdCard, 
  Printer, 
  User, 
  School, 
  QrCode, 
  Filter, 
  X, 
  Download, 
  Upload, 
  ArrowUpDown, 
  ArrowUp, 
  ArrowDown, 
  ChevronLeft, 
  ChevronRight, 
  Camera, 
  FileSpreadsheet, 
  AlertCircle, 
  FileText, 
  Award, 
  CheckCircle2, 
  HeartPulse, 
  AlertTriangle, 
  Eye, 
  FileCheck, 
  Activity, 
  ShieldCheck, 
  Check, 
  Calendar, 
  RotateCcw, 
  FileDown, 
  UserCheck, 
  Users, 
  CheckSquare, 
  Square, 
  MoreVertical, 
  Layers, 
  ArrowRight, 
  RefreshCw, 
  FileWarning,
  Building2,
  BookOpen
} from 'lucide-react'
import { useAppData } from '../../../context/AppDataContext'
import { useToast } from '../../../context/ToastContext'
import { detectProgramLevel, normalizeClassSections } from '../../../constants/academicLevels'
import Modal from '../../../components/common/Modal'
import PrintableStudentIdCardModal from '../../../components/common/PrintableStudentIdCardModal'
import PrintableExamAdmitCardModal from '../../../components/common/PrintableExamAdmitCardModal'

export const StudentsView = ({ currentInstitute }) => {
  const { 
    students = [], 
    classes = [], 
    academicYears = [],
    addItem, 
    updateItem, 
    deleteItem, 
    activeProgramLevel, 
    setActiveProgramLevel, 
    programLevels = [] 
  } = useAppData()

  const { toast } = useToast()
  const fileInputRef = useRef(null)
  const csvInputRef = useRef(null)

  // Loading & Error States
  const [isLoading, setIsLoading] = useState(false)

  // Academic Sessions Management (Previous, Current, Next)
  const defaultSessions = useMemo(() => [
    { id: 'sess-prev', name: '2025-2026', startDate: '2025-08-01', endDate: '2026-06-30', isCurrent: false },
    { id: 'sess-curr', name: '2026-2027', startDate: '2026-08-01', endDate: '2027-06-30', isCurrent: true },
    { id: 'sess-next', name: '2027-2028', startDate: '2027-08-01', endDate: '2028-06-30', isCurrent: false }
  ], [])

  const [sessionsList, setSessionsList] = useState(() => {
    try {
      const saved = localStorage.getItem('sms_academic_sessions')
      if (saved) {
        const parsed = JSON.parse(saved)
        if (Array.isArray(parsed) && parsed.length > 0) return parsed
      }
    } catch (e) {}

    if (academicYears && academicYears.length > 0) {
      return academicYears.map(y => ({
        id: y.id || `sess-${y.name}`,
        name: y.name,
        startDate: y.startDate || '2026-08-01',
        endDate: y.endDate || '2027-06-30',
        isCurrent: Boolean(y.isCurrent)
      }))
    }
    return defaultSessions
  })

  // Synchronize when academicYears from context change
  useEffect(() => {
    if (academicYears && academicYears.length > 0) {
      setSessionsList(prev => {
        const combined = [...prev]
        academicYears.forEach(y => {
          if (!combined.some(s => s.name === y.name)) {
            combined.push({
              id: y.id || `sess-${y.name}`,
              name: y.name,
              startDate: y.startDate || '2026-08-01',
              endDate: y.endDate || '2027-06-30',
              isCurrent: Boolean(y.isCurrent)
            })
          }
        })
        return combined
      })
    }
  }, [academicYears])

  // Persist sessions
  useEffect(() => {
    try {
      localStorage.setItem('sms_academic_sessions', JSON.stringify(sessionsList))
    } catch (e) {}
  }, [sessionsList])

  // Current active selected session
  const defaultActiveSessionName = useMemo(() => {
    const cur = sessionsList.find(s => s.isCurrent)
    return cur ? cur.name : (sessionsList[0]?.name || '2026-2027')
  }, [sessionsList])

  const [academicSession, setAcademicSession] = useState(defaultActiveSessionName)

  // Add New Session Modal state
  const [isAddSessionModalOpen, setIsAddSessionModalOpen] = useState(false)
  const [newSessionData, setNewSessionData] = useState({
    name: '',
    startDate: '2027-08-01',
    endDate: '2028-06-30',
    isCurrent: false
  })

  // Pre-requisite Setup Guidance Modal ("Pehle class aur session banayein")
  const [isSetupGuidanceModalOpen, setIsSetupGuidanceModalOpen] = useState(false)

  // Level Filter state: 'all' | 'school' | 'college' | 'university'
  const [selectedLevelFilter, setSelectedLevelFilter] = useState('all')

  // Synchronize selectedLevelFilter with Global activeProgramLevel from Navbar
  useEffect(() => {
    if (!activeProgramLevel || activeProgramLevel === 'all') {
      setSelectedLevelFilter('all')
    } else if (['elementary', 'secondary', 'higher-secondary', 'school'].includes(activeProgramLevel)) {
      setSelectedLevelFilter('school')
    } else if (activeProgramLevel === 'college') {
      setSelectedLevelFilter('college')
    } else if (activeProgramLevel === 'university') {
      setSelectedLevelFilter('university')
    }
  }, [activeProgramLevel])

  const handleLevelTabSelect = (lvl) => {
    setSelectedLevelFilter(lvl)
    if (setActiveProgramLevel) {
      if (lvl === 'all') setActiveProgramLevel('all')
      else if (lvl === 'school') setActiveProgramLevel('secondary')
      else if (lvl === 'college') setActiveProgramLevel('college')
      else if (lvl === 'university') setActiveProgramLevel('university')
    }
    setCurrentPage(1)
  }

  // Purge any legacy dummy/seed data on mount
  useEffect(() => {
    const demoNames = ['Hamza Farooq', 'Ayesha Siddiqui', 'Daniyal Tariq', 'Zainab Fatima', 'Bilal Ahmed Khan', 'Ahmed Raza']
    const demoRolls = ['STD-101', 'COL-201', 'STD-103', 'REG-401', 'STD-105', 'BHS-2024-001', 'BHS-2024-002', 'STD-1001', 'COL-2002', 'REG-3003']
    students.forEach(s => {
      if (demoNames.includes(s.name) || demoRolls.includes(s.rollNumber)) {
        deleteItem('students', s.id)
      }
    })
  }, [])

  // Search & Multi-Dimensional Filters
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedClassFilter, setSelectedClassFilter] = useState('ALL')
  const [selectedSectionFilter, setSelectedSectionFilter] = useState('ALL')
  const [selectedStatusFilter, setSelectedStatusFilter] = useState('ALL') // 'Active' | 'Withdrawn' | 'Transferred' | 'Graduated' | 'Suspended'
  const [selectedGenderFilter, setSelectedGenderFilter] = useState('ALL') // 'Male' | 'Female'
  const [selectedFeeFilter, setSelectedFeeFilter] = useState('ALL') // 'Paid' | 'Pending'
  const [selectedMedicalFilter, setSelectedMedicalFilter] = useState('ALL') // 'ALL' | 'Alerts'

  // Sorting state
  const [sortField, setSortField] = useState('name')
  const [sortDirection, setSortDirection] = useState('asc')

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)

  // Row Action Dropdown Menu Trigger
  const [openMenuStudentId, setOpenMenuStudentId] = useState(null)

  // Modals & Drawers States
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingStudent, setEditingStudent] = useState(null)
  const [selectedIdCard, setSelectedIdCard] = useState(null)
  const [isIdCardEngineOpen, setIsIdCardEngineOpen] = useState(false)
  const [selectedStudentForCard, setSelectedStudentForCard] = useState(null)
  const [isAdmitCardOpen, setIsAdmitCardOpen] = useState(false)
  const [selectedStudentForAdmit, setSelectedStudentForAdmit] = useState(null)
  const [selectedSLC, setSelectedSLC] = useState(null)
  const [selectedProfile, setSelectedProfile] = useState(null) // 7-Tab Dossier Drawer
  const [profileActiveTab, setProfileActiveTab] = useState('overview')
  const [selectedAdmissionSlip, setSelectedAdmissionSlip] = useState(null)
  const [selectedForStatusChange, setSelectedForStatusChange] = useState(null)
  const [studentToDelete, setStudentToDelete] = useState(null)

  // Bulk Actions & Row Checkboxes State
  const [selectedIds, setSelectedIds] = useState([])
  const [isBulkPromoteOpen, setIsBulkPromoteOpen] = useState(false)
  const [isBulkTransferOpen, setIsBulkTransferOpen] = useState(false)
  const [isBulkStatusOpen, setIsBulkStatusOpen] = useState(false)
  const [isBulkDeleteOpen, setIsBulkDeleteOpen] = useState(false)
  const [bulkTargetClass, setBulkTargetClass] = useState('')
  const [bulkTargetSection, setBulkTargetSection] = useState('A')
  const [bulkTargetStatus, setBulkTargetStatus] = useState('Graduated')

  // CSV Validation Error Report Modal
  const [csvErrorModal, setCsvErrorModal] = useState(null)

  // Form State for Add / Edit
  const [formData, setFormData] = useState({
    name: '',
    rollNumber: '',
    className: '',
    section: 'A',
    gender: 'Male',
    fatherName: '',
    fatherCnic: '',
    address: '',
    email: '',
    phone: '',
    bloodGroup: 'B+',
    emergencyContact: '',
    status: 'Active',
    feeStatus: 'Paid',
    attendanceRate: '',
    photoUrl: null,
    medicalAlert: 'None',
    emergencyDoctorPhone: '',
    vaccinationStatus: 'Fully Vaccinated',
    academicSession: '2026-2027',
    department: '',
    batch: ''
  })

  // Keyboard accessibility: Escape key closes active modals and menus
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        setIsModalOpen(false)
        setSelectedProfile(null)
        setSelectedAdmissionSlip(null)
        setSelectedIdCard(null)
        setSelectedSLC(null)
        setCsvErrorModal(null)
        setIsBulkPromoteOpen(false)
        setIsBulkTransferOpen(false)
        setIsBulkStatusOpen(false)
        setIsBulkDeleteOpen(false)
        setSelectedForStatusChange(null)
        setStudentToDelete(null)
        setIsAddSessionModalOpen(false)
        setIsSetupGuidanceModalOpen(false)
        setOpenMenuStudentId(null)
      }
    }
    const handleWindowClick = () => setOpenMenuStudentId(null)

    window.addEventListener('keydown', handleKeyDown)
    window.addEventListener('click', handleWindowClick)
    return () => {
      window.removeEventListener('keydown', handleKeyDown)
      window.removeEventListener('click', handleWindowClick)
    }
  }, [])

  // Dynamic Level Determination & Adaptive Tier Vocabulary
  const currentLevelKey = useMemo(() => {
    if (selectedLevelFilter !== 'all') return selectedLevelFilter
    if (activeProgramLevel && activeProgramLevel !== 'all') {
      if (['elementary', 'secondary', 'higher-secondary', 'school'].includes(activeProgramLevel)) return 'school'
      if (activeProgramLevel === 'college') return 'college'
      if (activeProgramLevel === 'university') return 'university'
    }
    return 'school'
  }, [selectedLevelFilter, activeProgramLevel])

  const tierVocabulary = useMemo(() => {
    switch (currentLevelKey) {
      case 'college':
        return {
          levelName: 'Higher Secondary / College',
          idLabel: 'Board Roll No',
          idPlaceholder: 'e.g. COL-001',
          groupLabel: 'Academic Year',
          groupPlaceholder: 'e.g. 1st Year (FSc)',
          subGroupLabel: 'Study Group',
          subGroupPlaceholder: 'e.g. Pre-Medical / Pre-Engineering / ICS',
          unitLabel: 'Section'
        }
      case 'university':
        return {
          levelName: 'Undergraduate / University',
          idLabel: 'Registration / CMS No',
          idPlaceholder: 'e.g. REG-001',
          groupLabel: 'Degree Program',
          groupPlaceholder: 'e.g. BS Computer Science',
          subGroupLabel: 'Current Semester',
          subGroupPlaceholder: 'e.g. Semester 1',
          unitLabel: 'Batch / Section'
        }
      case 'school':
      default:
        return {
          levelName: 'Primary / Secondary School',
          idLabel: 'Admission Roll No',
          idPlaceholder: 'e.g. STD-001',
          groupLabel: 'Class / Grade',
          groupPlaceholder: 'e.g. Class 1',
          subGroupLabel: 'Section',
          subGroupPlaceholder: 'e.g. Section A',
          unitLabel: 'Section'
        }
    }
  }, [currentLevelKey])

  // Photo Upload Handler (Converts image to Data URL)
  const handlePhotoUpload = (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    if (!file.type.startsWith('image/')) {
      toast.error('Please select a valid image file (JPG/PNG).')
      return
    }
    if (file.size > 2 * 1024 * 1024) {
      toast.warning('Image size is larger than 2MB. Please select a smaller photo.')
      return
    }
    const reader = new FileReader()
    reader.onload = (event) => {
      setFormData(prev => ({ ...prev, photoUrl: event.target?.result }))
      toast.info('Student photo attached.')
    }
    reader.readAsDataURL(file)
  }

  const removePhoto = () => {
    setFormData(prev => ({ ...prev, photoUrl: null }))
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  // Real Campus Student Pool (Excluding any legacy seed/demo records)
  const campusStudents = useMemo(() => {
    const demoNames = ['Hamza Farooq', 'Ayesha Siddiqui', 'Daniyal Tariq', 'Zainab Fatima', 'Bilal Ahmed Khan', 'Ahmed Raza']
    const demoRolls = ['STD-101', 'COL-201', 'STD-103', 'REG-401', 'STD-105', 'BHS-2024-001', 'BHS-2024-002', 'STD-1001', 'COL-2002', 'REG-3003']

    return students.filter(s => {
      if (demoNames.includes(s.name) || demoRolls.includes(s.rollNumber)) return false
      return !s.instituteId || !currentInstitute?.id || s.instituteId === currentInstitute?.id || currentInstitute?.id === 'inst-default'
    })
  }, [students, currentInstitute?.id])

  // Sequential Roll Number Calculation starting from 1
  const calculateNextRollNumber = (levelKey) => {
    const prefix = levelKey === 'university' ? 'REG' : levelKey === 'college' ? 'COL' : 'STD'
    const regex = new RegExp(`^${prefix}-(\\d+)`, 'i')
    let max = 0
    campusStudents.forEach(s => {
      const match = (s.rollNumber || '').match(regex)
      if (match) {
        const val = parseInt(match[1], 10)
        if (val > max) max = val
      }
    })
    const nextVal = max + 1
    return `${prefix}-${String(nextVal).padStart(3, '0')}` // STD-001, STD-002...
  }

  // Distinct classes and sections available from DB classes AND campusStudents
  const availableClasses = useMemo(() => {
    const set = new Set()
    classes.forEach(c => {
      if (c.name) set.add(c.name)
    })
    campusStudents.forEach(s => {
      if (s.className) set.add(s.className)
    })
    return Array.from(set).sort()
  }, [classes, campusStudents])

  const availableSections = useMemo(() => {
    const set = new Set()
    classes.forEach(c => {
      const secs = normalizeClassSections(c)
      secs.forEach(sc => {
        if (sc.name) set.add(sc.name)
      })
    })
    campusStudents.forEach(s => {
      if (s.section) set.add(s.section)
    })
    if (set.size === 0) {
      set.add('A')
      set.add('B')
    }
    return Array.from(set).sort()
  }, [classes, campusStudents])

  // Multi-Filter & Search Engine
  // Real data is strictly filtered by Session, Level, Class, Section, Status, Gender, Fee, Medical Alert, and Search query
  const filteredAndSorted = useMemo(() => {
    const list = campusStudents.filter(s => {
      const query = searchTerm.toLowerCase().trim()
      const matchesSearch = 
        !query ||
        (s.name || '').toLowerCase().includes(query) ||
        (s.rollNumber || '').toLowerCase().includes(query) ||
        (s.className || '').toLowerCase().includes(query) ||
        (s.fatherName || '').toLowerCase().includes(query) ||
        (s.phone || '').includes(query) ||
        (s.email || '').toLowerCase().includes(query)

      if (!matchesSearch) return false

      // Academic Session filter (strict match)
      if (academicSession && s.academicSession) {
        if (s.academicSession !== academicSession) return false
      }

      // Level / Tier filter
      if (selectedLevelFilter !== 'all') {
        const studentLevel = detectProgramLevel(s.className)
        if (studentLevel !== selectedLevelFilter && studentLevel !== 'all') return false
      }

      // Class / Program filter
      if (selectedClassFilter !== 'ALL' && s.className !== selectedClassFilter) {
        return false
      }

      // Section filter
      if (selectedSectionFilter !== 'ALL' && s.section !== selectedSectionFilter) {
        return false
      }

      // Status filter
      if (selectedStatusFilter !== 'ALL') {
        const currentStatus = s.status || 'Active'
        if (currentStatus !== selectedStatusFilter) return false
      }

      // Gender filter
      if (selectedGenderFilter !== 'ALL') {
        const currentGender = s.gender || 'Male'
        if (currentGender !== selectedGenderFilter) return false
      }

      // Fee Status filter
      if (selectedFeeFilter !== 'ALL' && s.feeStatus !== selectedFeeFilter) {
        return false
      }

      // Medical Alerts filter
      if (selectedMedicalFilter === 'Alerts' && (!s.medicalAlert || s.medicalAlert === 'None')) {
        return false
      }

      return true
    })

    return list.sort((a, b) => {
      let valA = a[sortField] || ''
      let valB = b[sortField] || ''

      if (typeof valA === 'string') valA = valA.toLowerCase()
      if (typeof valB === 'string') valB = valB.toLowerCase()

      if (valA < valB) return sortDirection === 'asc' ? -1 : 1
      if (valA > valB) return sortDirection === 'asc' ? 1 : -1
      return 0
    })
  }, [
    campusStudents, 
    searchTerm, 
    academicSession,
    selectedLevelFilter, 
    selectedClassFilter, 
    selectedSectionFilter, 
    selectedStatusFilter, 
    selectedGenderFilter, 
    selectedFeeFilter, 
    selectedMedicalFilter, 
    sortField, 
    sortDirection
  ])

  // Real KPI Metrics calculated strictly from the current filtered dataset
  const filteredStudentsCount = filteredAndSorted.length
  const paidFilteredCount = filteredAndSorted.filter(s => s.feeStatus === 'Paid').length
  const pendingFilteredCount = filteredAndSorted.filter(s => s.feeStatus === 'Pending' || s.feeStatus === 'Unpaid').length
  const medicalAlertsFilteredCount = filteredAndSorted.filter(s => s.medicalAlert && s.medicalAlert !== 'None').length

  // Avg Attendance strictly reflects real data or "—" (no fixed 95%)
  const avgAttendanceDisplay = useMemo(() => {
    if (filteredStudentsCount === 0) return '—'
    const rates = filteredAndSorted
      .map(s => s.attendanceRate ? parseFloat(s.attendanceRate.replace('%', '')) : null)
      .filter(num => num !== null && !isNaN(num) && num > 0)

    if (rates.length === 0) return '—'
    const total = rates.reduce((acc, curr) => acc + curr, 0)
    return `${Math.round(total / rates.length)}%`
  }, [filteredAndSorted, filteredStudentsCount])

  // Pagination calculation
  const totalStudents = filteredAndSorted.length
  const totalPages = Math.max(1, Math.ceil(totalStudents / pageSize))
  const paginatedStudents = useMemo(() => {
    const start = (currentPage - 1) * pageSize
    return filteredAndSorted.slice(start, start + pageSize)
  }, [filteredAndSorted, currentPage, pageSize])

  // Reset Filters to Default
  const resetAllFilters = () => {
    setSearchTerm('')
    setSelectedLevelFilter('all')
    if (setActiveProgramLevel) setActiveProgramLevel('all')
    setSelectedClassFilter('ALL')
    setSelectedSectionFilter('ALL')
    setSelectedStatusFilter('ALL')
    setSelectedGenderFilter('ALL')
    setSelectedFeeFilter('ALL')
    setSelectedMedicalFilter('ALL')
    setCurrentPage(1)
    toast.info('All filters reset to default view.')
  }

  // Row Selection Handlers
  const handleSelectAll = (e) => {
    if (e.target.checked) {
      const allIds = paginatedStudents.map(s => s.id)
      setSelectedIds(allIds)
    } else {
      setSelectedIds([])
    }
  }

  const handleSelectRow = (id) => {
    setSelectedIds(prev => 
      prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
    )
  }

  // Sorting
  const handleSort = (field) => {
    if (sortField === field) {
      setSortDirection(prev => (prev === 'asc' ? 'desc' : 'asc'))
    } else {
      setSortField(field)
      setSortDirection('asc')
    }
  }

  // Add Session Submission
  const handleSaveNewSession = async (e) => {
    e.preventDefault()
    if (!newSessionData.name.trim()) {
      toast.error('Session Name is required.')
      return
    }
    const cleanName = newSessionData.name.trim()

    // Check duplicate
    if (sessionsList.some(s => s.name.toLowerCase() === cleanName.toLowerCase())) {
      toast.error(`Session "${cleanName}" already exists.`)
      return
    }

    const newSessionObj = {
      id: `sess-${Date.now()}`,
      name: cleanName,
      startDate: newSessionData.startDate,
      endDate: newSessionData.endDate,
      isCurrent: Boolean(newSessionData.isCurrent)
    }

    const updated = sessionsList.map(s => newSessionData.isCurrent ? { ...s, isCurrent: false } : s)
    updated.push(newSessionObj)
    setSessionsList(updated)
    setAcademicSession(cleanName)

    if (addItem) {
      try {
        await addItem('academicYears', {
          name: cleanName,
          startDate: newSessionData.startDate,
          endDate: newSessionData.endDate,
          isCurrent: Boolean(newSessionData.isCurrent),
          status: 'Active'
        })
      } catch (err) {
        console.error('Academic year add error:', err)
      }
    }

    setIsAddSessionModalOpen(false)
    toast.success(`Academic session "${cleanName}" created successfully!`)
  }

  // Open Add Modal with Empty Check Prerequisite & Counter starting from 1
  const openAddModal = () => {
    const hasConfiguredClasses = classes && classes.length > 0
    const hasConfiguredSessions = sessionsList && sessionsList.length > 0

    if (!hasConfiguredClasses || !hasConfiguredSessions) {
      toast.warning('Pehle class aur session banayein.')
      setIsSetupGuidanceModalOpen(true)
      return
    }

    setEditingStudent(null)
    const generatedRoll = calculateNextRollNumber(currentLevelKey)
    const defaultClassName = classes[0]?.name || ''

    setFormData({
      name: '',
      rollNumber: generatedRoll,
      className: defaultClassName,
      section: 'A',
      gender: 'Male',
      fatherName: '',
      fatherCnic: '',
      address: '',
      email: '',
      phone: '',
      bloodGroup: 'B+',
      emergencyContact: '',
      status: 'Active',
      feeStatus: 'Paid',
      attendanceRate: '',
      photoUrl: null,
      medicalAlert: 'None',
      emergencyDoctorPhone: '',
      vaccinationStatus: 'Fully Vaccinated',
      academicSession: academicSession || '2026-2027',
      department: currentLevelKey === 'university' ? 'Computer Science' : '',
      batch: currentLevelKey === 'university' ? 'Batch 1' : ''
    })
    setIsModalOpen(true)
  }

  // Open Edit Modal
  const openEditModal = (s) => {
    setEditingStudent(s)
    setFormData({
      name: s.name || '',
      rollNumber: s.rollNumber || '',
      className: s.className || '',
      section: s.section || 'A',
      gender: s.gender || 'Male',
      fatherName: s.fatherName || '',
      fatherCnic: s.fatherCnic || '',
      address: s.address || '',
      email: s.email || '',
      phone: s.phone || '',
      bloodGroup: s.bloodGroup || 'B+',
      emergencyContact: s.emergencyContact || '',
      status: s.status || 'Active',
      feeStatus: s.feeStatus || 'Paid',
      attendanceRate: s.attendanceRate || '',
      photoUrl: s.photoUrl || null,
      medicalAlert: s.medicalAlert || 'None',
      emergencyDoctorPhone: s.emergencyDoctorPhone || '',
      vaccinationStatus: s.vaccinationStatus || 'Fully Vaccinated',
      academicSession: s.academicSession || academicSession || '2026-2027',
      department: s.department || '',
      batch: s.batch || ''
    })
    setIsModalOpen(true)
  }

  // Handle Form Submit
  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!formData.name.trim() || !formData.rollNumber.trim()) {
      toast.error('Student Name and Roll / Registration Number are required.')
      return
    }

    if (!formData.className) {
      toast.error('Class / Degree Program is required. Pehle class banayein.')
      return
    }

    const cleanRoll = formData.rollNumber.trim()

    // Duplicate Check
    const isDuplicate = students.some(s => 
      s.rollNumber?.toLowerCase() === cleanRoll.toLowerCase() &&
      (!editingStudent || s.id !== editingStudent.id) &&
      (!s.instituteId || s.instituteId === currentInstitute?.id)
    )

    if (isDuplicate) {
      toast.error(`Identifier "${cleanRoll}" already exists for another student!`)
      return
    }

    const payload = {
      ...formData,
      rollNumber: cleanRoll,
      academicSession: formData.academicSession || academicSession,
      instituteId: currentInstitute?.id || 'inst-1',
      updatedAt: new Date().toISOString()
    }

    if (editingStudent) {
      await updateItem('students', editingStudent.id, payload)
      toast.success(`Student profile for "${formData.name}" updated successfully.`)
    } else {
      await addItem('students', {
        ...payload,
        createdAt: new Date().toISOString()
      })
      toast.success(`Student "${formData.name}" enrolled successfully!`)
    }
    setIsModalOpen(false)
  }

  // Single Delete
  const handleDeleteConfirm = async () => {
    if (!studentToDelete) return
    await deleteItem('students', studentToDelete.id)
    toast.success(`Student "${studentToDelete.name}" removed from roster.`)
    setStudentToDelete(null)
  }

  // Single Quick Status Change
  const handleUpdateSingleStatus = async (newStatus) => {
    if (!selectedForStatusChange) return
    await updateItem('students', selectedForStatusChange.id, {
      status: newStatus,
      statusUpdatedAt: new Date().toISOString()
    })
    toast.success(`Student "${selectedForStatusChange.name}" status updated to ${newStatus}.`)
    setSelectedForStatusChange(null)
  }

  // Bulk Actions
  const handleBulkPromote = async () => {
    if (selectedIds.length === 0 || !bulkTargetClass) return
    for (const id of selectedIds) {
      await updateItem('students', id, {
        className: bulkTargetClass,
        promotedDate: new Date().toISOString().split('T')[0]
      })
    }
    toast.success(`Promoted ${selectedIds.length} students to ${bulkTargetClass}!`)
    setIsBulkPromoteOpen(false)
    setSelectedIds([])
  }

  const handleBulkTransferSection = async () => {
    if (selectedIds.length === 0) return
    for (const id of selectedIds) {
      await updateItem('students', id, {
        section: bulkTargetSection
      })
    }
    toast.success(`Transferred ${selectedIds.length} students to Section ${bulkTargetSection}!`)
    setIsBulkTransferOpen(false)
    setSelectedIds([])
  }

  const handleBulkStatusChange = async () => {
    if (selectedIds.length === 0) return
    for (const id of selectedIds) {
      await updateItem('students', id, {
        status: bulkTargetStatus,
        statusUpdatedAt: new Date().toISOString()
      })
    }
    toast.success(`Updated status of ${selectedIds.length} students to "${bulkTargetStatus}"!`)
    setIsBulkStatusOpen(false)
    setSelectedIds([])
  }

  const handleBulkDelete = async () => {
    if (selectedIds.length === 0) return
    for (const id of selectedIds) {
      await deleteItem('students', id)
    }
    toast.success(`Removed ${selectedIds.length} students from the roster.`)
    setIsBulkDeleteOpen(false)
    setSelectedIds([])
  }

  // CSV Template Download with Clean Placeholder Row (Counter from 1)
  const handleDownloadTemplate = () => {
    const headers = [
      'Full Name',
      'Roll Number',
      'Class',
      'Section',
      'Gender',
      'Father Name',
      'Email',
      'Phone',
      'Emergency Contact',
      'Blood Group',
      'Status',
      'Fee Status',
      'Attendance Rate',
      'Medical Alert',
      'Doctor Phone',
      'Vaccination',
      'Academic Session'
    ]
    const sampleRows = [
      ['Student Name', calculateNextRollNumber(currentLevelKey), availableClasses[0] || 'Class 1', 'A', 'Male', 'Guardian Name', 'student@example.com', '+92 300 0000000', '+92 300 0000000', 'B+', 'Active', 'Paid', '', 'None', '', 'Fully Vaccinated', academicSession]
    ]

    const csvContent = [headers.join(','), ...sampleRows.map(r => r.map(f => `"${f}"`).join(','))].join('\n')
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.setAttribute('download', `student_admission_template_${currentLevelKey}.csv`)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    toast.success('Standard student admission CSV template downloaded!')
  }

  // CSV Import with Row-by-Row Error Detection
  const handleCSVImport = (e) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (!file.name.endsWith('.csv') && file.type !== 'text/csv') {
      toast.error('Invalid file format. Please upload a genuine .csv spreadsheet file.')
      if (csvInputRef.current) csvInputRef.current.value = ''
      return
    }

    const reader = new FileReader()
    reader.onload = async (event) => {
      try {
        const text = event.target?.result
        if (typeof text !== 'string') return
        const lines = text.split(/\r?\n/).filter(line => line.trim())
        if (lines.length < 2) {
          toast.error('Uploaded CSV is empty or has no data rows.')
          return
        }

        const errors = []
        let importedCount = 0
        const seenRollsInCSV = new Set()

        for (let i = 1; i < lines.length; i++) {
          const rowNumber = i + 1
          const row = lines[i].split(',').map(item => item.replace(/^["']|["']$/g, '').trim())
          const [
            name, rollNumber, className, section, gender, fatherName,
            email, phone, emergencyContact, bloodGroup, status,
            feeStatus, attendanceRate, medicalAlert, doctorPhone, vaccination, rowSession
          ] = row

          if (!name) {
            errors.push({ row: rowNumber, name: name || 'Empty', roll: rollNumber || 'N/A', reason: 'Student Name is missing.' })
            continue
          }

          if (!rollNumber) {
            errors.push({ row: rowNumber, name, roll: 'Empty', reason: 'Roll / Registration Number is missing.' })
            continue
          }

          const cleanRoll = rollNumber.toLowerCase()
          if (seenRollsInCSV.has(cleanRoll)) {
            errors.push({ row: rowNumber, name, roll: rollNumber, reason: `Duplicate Roll Number "${rollNumber}" found within CSV.` })
            continue
          }
          seenRollsInCSV.add(cleanRoll)

          // Check database duplicate
          const dbExists = students.some(s => s.rollNumber?.toLowerCase() === cleanRoll)
          if (dbExists) {
            errors.push({ row: rowNumber, name, roll: rollNumber, reason: `Roll Number "${rollNumber}" already exists in institute database.` })
            continue
          }

          // Valid Row - Add student
          await addItem('students', {
            name,
            rollNumber,
            className: className || availableClasses[0] || 'Class 1',
            section: section || 'A',
            gender: gender || 'Male',
            fatherName: fatherName || '',
            email: email || '',
            phone: phone || '',
            emergencyContact: emergencyContact || phone || '',
            bloodGroup: bloodGroup || 'B+',
            status: status || 'Active',
            feeStatus: feeStatus || 'Paid',
            attendanceRate: attendanceRate || '',
            medicalAlert: medicalAlert || 'None',
            emergencyDoctorPhone: doctorPhone || '',
            vaccinationStatus: vaccination || 'Fully Vaccinated',
            academicSession: rowSession || academicSession || '2026-2027',
            instituteId: currentInstitute?.id || 'inst-1',
            createdAt: new Date().toISOString()
          })
          importedCount++
        }

        if (errors.length > 0) {
          setCsvErrorModal({
            totalRows: lines.length - 1,
            importedCount,
            errors
          })
          toast.warning(`Imported ${importedCount} students with ${errors.length} row issues.`)
        } else {
          toast.success(`Successfully imported all ${importedCount} student records!`)
        }
      } catch (err) {
        console.error(err)
        toast.error('Failed to parse CSV file. Ensure valid formatting.')
      } finally {
        if (csvInputRef.current) csvInputRef.current.value = ''
      }
    }
    reader.readAsText(file)
  }

  // Export Filtered Dataset to CSV
  const exportToCSV = () => {
    if (filteredAndSorted.length === 0) {
      toast.warning('No student records in current view to export.')
      return
    }

    const headers = [
      'Full Name',
      'Roll Number',
      'Class / Program',
      'Section',
      'Gender',
      'Father Name',
      'Email',
      'Phone',
      'Blood Group',
      'Status',
      'Fee Status',
      'Attendance Rate',
      'Medical Alert',
      'Doctor Phone',
      'Vaccination Status',
      'Academic Session'
    ]

    const rows = filteredAndSorted.map(s => [
      `"${s.name || ''}"`,
      `"${s.rollNumber || ''}"`,
      `"${s.className || ''}"`,
      `"${s.section || 'A'}"`,
      `"${s.gender || 'Male'}"`,
      `"${s.fatherName || ''}"`,
      `"${s.email || ''}"`,
      `"${s.phone || s.emergencyContact || ''}"`,
      `"${s.bloodGroup || 'B+'}"`,
      `"${s.status || 'Active'}"`,
      `"${s.feeStatus || 'Paid'}"`,
      `"${s.attendanceRate || ''}"`,
      `"${s.medicalAlert || 'None'}"`,
      `"${s.emergencyDoctorPhone || ''}"`,
      `"${s.vaccinationStatus || 'Fully Vaccinated'}"`,
      `"${s.academicSession || academicSession}"`
    ])

    const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\n')
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.setAttribute('download', `students_roster_${academicSession}_${new Date().toISOString().split('T')[0]}.csv`)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    toast.success(`Exported ${filteredAndSorted.length} student records matching active filters to CSV.`)
  }

  // Status Badge Component
  const renderStatusBadge = (status = 'Active') => {
    switch (status) {
      case 'Active':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 whitespace-nowrap">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
            <span>Active</span>
          </span>
        )
      case 'Withdrawn':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-slate-100 text-slate-700 border border-slate-300 whitespace-nowrap">
            <span className="w-1.5 h-1.5 rounded-full bg-slate-500"></span>
            <span>Withdrawn</span>
          </span>
        )
      case 'Transferred':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-purple-50 text-purple-700 border border-purple-200 whitespace-nowrap">
            <span className="w-1.5 h-1.5 rounded-full bg-purple-500"></span>
            <span>Transferred</span>
          </span>
        )
      case 'Graduated':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-blue-50 text-blue-700 border border-blue-200 whitespace-nowrap">
            <span className="w-1.5 h-1.5 rounded-full bg-blue-500"></span>
            <span>Graduated</span>
          </span>
        )
      case 'Suspended':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-rose-50 text-rose-700 border border-rose-200 whitespace-nowrap">
            <span className="w-1.5 h-1.5 rounded-full bg-rose-500"></span>
            <span>Suspended</span>
          </span>
        )
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-slate-100 text-slate-700 border border-slate-200 whitespace-nowrap">
            <span>{status}</span>
          </span>
        )
    }
  }

  return (
    <div className="p-4 sm:p-6 md:p-8 space-y-6 max-w-7xl mx-auto">
      {/* Header bar: Session, CSV Template, Import, Export, and New Admission in a clean, single line */}
      <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <GraduationCap className="w-5 h-5 text-emerald-600" />
            <h1 className="text-xl font-bold text-slate-900 tracking-tight">Student Admissions & Roster</h1>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Enroll students, generate smart photo ID cards, manage 360° student academic dossiers, and issue official registration slips
          </p>
        </div>

        {/* Global Toolbar - Unified Single Row on Desktop */}
        <div className="flex items-center gap-2 flex-wrap xl:flex-nowrap shrink-0">
          {/* Academic Session Selector with (Current) Tag & Add New Option */}
          <div className="flex items-center bg-white border border-slate-200 rounded-lg shadow-2xs h-9 px-2 gap-1.5">
            <Calendar className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            <span className="text-[11px] font-bold text-slate-500 uppercase shrink-0">Session:</span>
            <select
              value={academicSession}
              onChange={(e) => {
                if (e.target.value === '__add_new__') {
                  setIsAddSessionModalOpen(true)
                } else {
                  setAcademicSession(e.target.value)
                  setCurrentPage(1)
                }
              }}
              className="text-xs font-bold text-slate-800 bg-transparent focus:outline-none cursor-pointer pr-1"
            >
              {sessionsList.map(s => (
                <option key={s.id || s.name} value={s.name}>
                  {s.name} {s.isCurrent ? '(Current)' : ''}
                </option>
              ))}
              <option value="__add_new__" className="text-emerald-600 font-bold">
                + Add New Session...
              </option>
            </select>
            <button
              type="button"
              onClick={() => setIsAddSessionModalOpen(true)}
              className="p-1 hover:bg-slate-100 text-slate-400 hover:text-emerald-600 rounded transition-colors cursor-pointer"
              title="Add New Academic Session"
            >
              <Plus className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* CSV Template */}
          <button
            type="button"
            onClick={handleDownloadTemplate}
            className="flex items-center gap-1.5 px-3 h-9 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-semibold border border-slate-200 transition-all cursor-pointer shrink-0"
            title="Download standard CSV spreadsheet template"
          >
            <FileDown className="w-3.5 h-3.5 text-slate-600" />
            <span className="whitespace-nowrap">CSV Template</span>
          </button>

          {/* Import CSV */}
          <input
            type="file"
            ref={csvInputRef}
            onChange={handleCSVImport}
            accept=".csv"
            className="hidden"
          />
          <button
            type="button"
            onClick={() => csvInputRef.current?.click()}
            className="flex items-center gap-1.5 px-3 h-9 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-semibold border border-slate-200 transition-all cursor-pointer shrink-0"
            title="Import student admissions from CSV file with row-wise validation"
          >
            <Upload className="w-3.5 h-3.5 text-slate-600" />
            <span className="whitespace-nowrap">Import CSV</span>
          </button>

          {/* Export CSV */}
          <button
            type="button"
            onClick={exportToCSV}
            className="flex items-center gap-1.5 px-3 h-9 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-semibold border border-slate-200 transition-all cursor-pointer shrink-0"
            title="Export filtered student roster to CSV"
          >
            <Download className="w-3.5 h-3.5 text-slate-600" />
            <span className="whitespace-nowrap">Export CSV</span>
          </button>

          {/* New Student Admission */}
          <button
            type="button"
            onClick={openAddModal}
            className="flex items-center gap-1.5 px-4 h-9 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold shadow-sm transition-all cursor-pointer shrink-0"
            title="Enroll a new student"
          >
            <Plus className="w-4 h-4" />
            <span className="whitespace-nowrap">New Student Admission</span>
          </button>
        </div>
      </div>

      {/* Executive Analytics KPI Cards - 100% Calculated from Real Filtered Data */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {/* Total Enrolled */}
        <div className="bg-white p-4 rounded-xl border border-slate-200/90 shadow-2xs flex items-center justify-between">
          <div>
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Total Enrolled</span>
            <p className="text-xl sm:text-2xl font-black text-slate-900 mt-0.5">{filteredStudentsCount}</p>
            <span className="text-[10px] text-emerald-600 font-semibold">{tierVocabulary.levelName} Roster</span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 border border-emerald-100 flex items-center justify-center shrink-0">
            <GraduationCap className="w-5 h-5" />
          </div>
        </div>

        {/* Fee Clearance */}
        <div className="bg-white p-4 rounded-xl border border-slate-200/90 shadow-2xs flex items-center justify-between">
          <div>
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Fee Clearance</span>
            <p className="text-xl sm:text-2xl font-black text-slate-900 mt-0.5">
              {filteredStudentsCount > 0 ? (
                paidFilteredCount === 0 && pendingFilteredCount === 0 ? '—' : `${Math.round((paidFilteredCount / filteredStudentsCount) * 100)}%`
              ) : '—'}
            </p>
            <span className="text-[10px] text-blue-600 font-semibold">{paidFilteredCount} Paid • {pendingFilteredCount} Due</span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 border border-blue-100 flex items-center justify-center shrink-0">
            <CheckCircle2 className="w-5 h-5" />
          </div>
        </div>

        {/* Avg Attendance - Displays "—" until real Attendance module integration */}
        <div className="bg-white p-4 rounded-xl border border-slate-200/90 shadow-2xs flex items-center justify-between">
          <div>
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Avg Attendance</span>
            <p className="text-xl sm:text-2xl font-black text-slate-900 mt-0.5">{avgAttendanceDisplay}</p>
            <span className="text-[10px] text-indigo-600 font-semibold">Class Presence Rate</span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 border border-indigo-100 flex items-center justify-center shrink-0">
            <Activity className="w-5 h-5" />
          </div>
        </div>

        {/* Medical Sentinel */}
        <div className="bg-white p-4 rounded-xl border border-slate-200/90 shadow-2xs flex items-center justify-between">
          <div>
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Medical Sentinel</span>
            <p className="text-xl sm:text-2xl font-black text-rose-700 mt-0.5">{medicalAlertsFilteredCount}</p>
            <span className="text-[10px] text-rose-600 font-semibold">Active Health Precautions</span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-rose-50 text-rose-600 border border-rose-100 flex items-center justify-center shrink-0">
            <HeartPulse className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Main Table Card */}
      <div className="bg-white rounded-xl border border-slate-200/90 shadow-sm overflow-hidden">
        {/* Comprehensive Multi-Filter & Search Toolbar */}
        <div className="p-4 border-b border-slate-100 bg-slate-50/70 space-y-3">
          {/* Row 1: Search & Level Tabs (Synchronized with Top Navbar) */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
            <div className="relative flex-1 max-w-md">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder={`Search ${tierVocabulary.levelName} by name, roll no, or contact...`}
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value)
                  setCurrentPage(1)
                }}
                className="w-full pl-9 pr-4 py-2 text-xs rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 bg-white"
              />
            </div>

            {/* Level Switcher Tabs - Synced with Global activeProgramLevel */}
            <div className="flex items-center gap-1 p-1 bg-slate-200/70 rounded-lg text-xs font-semibold text-slate-600">
              {[
                { key: 'all', label: 'All Levels' },
                { key: 'school', label: 'School' },
                { key: 'college', label: 'College' },
                { key: 'university', label: 'University' }
              ].map(lvl => (
                <button
                  key={lvl.key}
                  type="button"
                  onClick={() => handleLevelTabSelect(lvl.key)}
                  className={`px-3 py-1 rounded-md transition-all cursor-pointer whitespace-nowrap ${
                    selectedLevelFilter === lvl.key 
                      ? 'bg-white text-emerald-800 shadow-2xs font-bold' 
                      : 'hover:text-slate-900'
                  }`}
                >
                  {lvl.label}
                </button>
              ))}
            </div>
          </div>

          {/* Row 2: Secondary Dropdown Filters Bar */}
          <div className="flex items-center justify-between gap-2 flex-wrap pt-2 border-t border-slate-200/60 text-xs">
            <div className="flex items-center gap-2 flex-wrap">
              {/* Class / Program Filter */}
              <select
                value={selectedClassFilter}
                onChange={(e) => {
                  setSelectedClassFilter(e.target.value)
                  setCurrentPage(1)
                }}
                className="px-2.5 py-1.5 text-xs rounded-lg border border-slate-200 bg-white text-slate-700 font-medium focus:outline-none cursor-pointer"
              >
                <option value="ALL">All {tierVocabulary.groupLabel}s</option>
                {availableClasses.map(c => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>

              {/* Section / Semester Filter */}
              <select
                value={selectedSectionFilter}
                onChange={(e) => {
                  setSelectedSectionFilter(e.target.value)
                  setCurrentPage(1)
                }}
                className="px-2.5 py-1.5 text-xs rounded-lg border border-slate-200 bg-white text-slate-700 font-medium focus:outline-none cursor-pointer"
              >
                <option value="ALL">All {tierVocabulary.unitLabel}s</option>
                {availableSections.map(sec => (
                  <option key={sec} value={sec}>Section / Batch {sec}</option>
                ))}
              </select>

              {/* Student Status Filter */}
              <select
                value={selectedStatusFilter}
                onChange={(e) => {
                  setSelectedStatusFilter(e.target.value)
                  setCurrentPage(1)
                }}
                className="px-2.5 py-1.5 text-xs rounded-lg border border-slate-200 bg-white text-slate-700 font-medium focus:outline-none cursor-pointer"
              >
                <option value="ALL">All Statuses</option>
                <option value="Active">Active Enrolled</option>
                <option value="Withdrawn">Withdrawn</option>
                <option value="Transferred">Transferred</option>
                <option value="Graduated">Graduated</option>
                <option value="Suspended">Suspended</option>
              </select>

              {/* Gender Filter */}
              <select
                value={selectedGenderFilter}
                onChange={(e) => {
                  setSelectedGenderFilter(e.target.value)
                  setCurrentPage(1)
                }}
                className="px-2.5 py-1.5 text-xs rounded-lg border border-slate-200 bg-white text-slate-700 font-medium focus:outline-none cursor-pointer"
              >
                <option value="ALL">All Genders</option>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
              </select>

              {/* Fee Status Filter */}
              <select
                value={selectedFeeFilter}
                onChange={(e) => {
                  setSelectedFeeFilter(e.target.value)
                  setCurrentPage(1)
                }}
                className="px-2.5 py-1.5 text-xs rounded-lg border border-slate-200 bg-white text-slate-700 font-medium focus:outline-none cursor-pointer"
              >
                <option value="ALL">All Fee Status</option>
                <option value="Paid">Fee Cleared (Paid)</option>
                <option value="Pending">Fee Pending / Due</option>
              </select>

              {/* Medical Sentinel Filter Toggle */}
              <button
                type="button"
                onClick={() => {
                  setSelectedMedicalFilter(prev => prev === 'Alerts' ? 'ALL' : 'Alerts')
                  setCurrentPage(1)
                }}
                className={`px-2.5 py-1.5 text-xs rounded-lg border font-semibold flex items-center gap-1 transition-all cursor-pointer whitespace-nowrap ${
                  selectedMedicalFilter === 'Alerts'
                    ? 'bg-rose-50 border-rose-300 text-rose-700 shadow-2xs'
                    : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                }`}
                title="Filter students with active medical alert conditions"
              >
                <HeartPulse className="w-3.5 h-3.5 text-rose-600" />
                <span>Medical Alerts</span>
              </button>

              {/* Clear All Filters Button */}
              <button
                type="button"
                onClick={resetAllFilters}
                className="px-2.5 py-1.5 text-xs text-rose-600 hover:text-rose-700 font-bold hover:bg-rose-50 rounded-lg transition-colors cursor-pointer flex items-center gap-1 whitespace-nowrap"
                title="Reset all search and dropdown filters"
              >
                <RotateCcw className="w-3 h-3" />
                <span>Clear Filters</span>
              </button>
            </div>

            {/* Pagination Size & Count (Hidden when 0 students found) */}
            {totalStudents > 0 && (
              <div className="flex items-center gap-2">
                <span className="text-xs text-slate-500 whitespace-nowrap">Show:</span>
                <select
                  value={pageSize}
                  onChange={(e) => {
                    setPageSize(Number(e.target.value))
                    setCurrentPage(1)
                  }}
                  className="px-2 py-1 bg-white border border-slate-200 rounded text-xs font-semibold"
                >
                  <option value={5}>5</option>
                  <option value={10}>10</option>
                  <option value={25}>25</option>
                  <option value={50}>50</option>
                </select>
                <span className="text-xs font-mono font-bold text-slate-700 bg-slate-100 px-2 py-1 rounded-full whitespace-nowrap">
                  {totalStudents} Found
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Floating Bulk Actions Bar when rows are selected */}
        {selectedIds.length > 0 && (
          <div className="bg-slate-900 text-white px-4 py-2.5 flex flex-wrap items-center justify-between gap-3 animate-in fade-in duration-150">
            <div className="flex items-center gap-2">
              <span className="w-5 h-5 rounded-full bg-emerald-500 text-slate-950 flex items-center justify-center font-black text-[10px]">
                {selectedIds.length}
              </span>
              <span className="text-xs font-bold text-slate-200">
                {selectedIds.length} Student{selectedIds.length > 1 ? 's' : ''} Selected
              </span>
            </div>

            <div className="flex items-center gap-1.5 flex-wrap">
              <button
                type="button"
                onClick={() => {
                  window.print()
                  toast.info(`Printing ID cards for ${selectedIds.length} selected students.`)
                }}
                className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-xs font-semibold rounded flex items-center gap-1 text-emerald-300 border border-slate-700 cursor-pointer"
              >
                <IdCard className="w-3.5 h-3.5" />
                <span>Bulk Print ID Cards</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setBulkTargetClass(availableClasses[0] || '')
                  setIsBulkPromoteOpen(true)
                }}
                className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-xs font-semibold rounded flex items-center gap-1 text-indigo-300 border border-slate-700 cursor-pointer"
              >
                <GraduationCap className="w-3.5 h-3.5" />
                <span>Promote Class</span>
              </button>

              <button
                type="button"
                onClick={() => setIsBulkTransferOpen(true)}
                className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-xs font-semibold rounded flex items-center gap-1 text-amber-300 border border-slate-700 cursor-pointer"
              >
                <Layers className="w-3.5 h-3.5" />
                <span>Transfer Section</span>
              </button>

              <button
                type="button"
                onClick={() => setIsBulkStatusOpen(true)}
                className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-xs font-semibold rounded flex items-center gap-1 text-purple-300 border border-slate-700 cursor-pointer"
              >
                <UserCheck className="w-3.5 h-3.5" />
                <span>Change Status</span>
              </button>

              <button
                type="button"
                onClick={() => setIsBulkDeleteOpen(true)}
                className="px-2.5 py-1 bg-rose-600/80 hover:bg-rose-600 text-xs font-semibold rounded flex items-center gap-1 text-white cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Delete</span>
              </button>

              <button
                type="button"
                onClick={() => setSelectedIds([])}
                className="px-2 py-1 text-xs text-slate-400 hover:text-white cursor-pointer ml-1"
              >
                Clear
              </button>
            </div>
          </div>
        )}

        {/* Main Table View */}
        <div className="overflow-x-auto min-w-full">
          <table className="w-full text-left text-xs sm:text-sm min-w-[950px]">
            <thead className="bg-slate-50 text-slate-600 text-[11px] uppercase tracking-wider font-bold border-b border-slate-200">
              <tr>
                <th className="px-4 py-3.5 w-10 text-center whitespace-nowrap">
                  <input
                    type="checkbox"
                    checked={paginatedStudents.length > 0 && selectedIds.length === paginatedStudents.length}
                    onChange={handleSelectAll}
                    className="rounded border-slate-300 text-emerald-600 focus:ring-emerald-500 cursor-pointer"
                  />
                </th>
                <th 
                  onClick={() => handleSort('name')} 
                  className="px-5 py-3.5 cursor-pointer hover:bg-slate-100/80 select-none transition-colors whitespace-nowrap min-w-[220px]"
                >
                  <div className="flex items-center gap-1.5">
                    <span>STUDENT PROFILE</span>
                    {sortField === 'name' ? (
                      sortDirection === 'asc' ? <ArrowUp className="w-3 h-3 text-emerald-600" /> : <ArrowDown className="w-3 h-3 text-emerald-600" />
                    ) : (
                      <ArrowUpDown className="w-3 h-3 text-slate-400" />
                    )}
                  </div>
                </th>
                <th 
                  onClick={() => handleSort('rollNumber')} 
                  className="px-5 py-3.5 cursor-pointer hover:bg-slate-100/80 select-none transition-colors whitespace-nowrap min-w-[130px]"
                >
                  <div className="flex items-center gap-1.5">
                    <span>{tierVocabulary.idLabel.toUpperCase()}</span>
                    {sortField === 'rollNumber' ? (
                      sortDirection === 'asc' ? <ArrowUp className="w-3 h-3 text-emerald-600" /> : <ArrowDown className="w-3 h-3 text-emerald-600" />
                    ) : (
                      <ArrowUpDown className="w-3 h-3 text-slate-400" />
                    )}
                  </div>
                </th>
                <th 
                  onClick={() => handleSort('className')} 
                  className="px-5 py-3.5 cursor-pointer hover:bg-slate-100/80 select-none transition-colors whitespace-nowrap min-w-[160px]"
                >
                  <div className="flex items-center gap-1.5">
                    <span>{tierVocabulary.groupLabel.toUpperCase()}</span>
                    {sortField === 'className' ? (
                      sortDirection === 'asc' ? <ArrowUp className="w-3 h-3 text-emerald-600" /> : <ArrowDown className="w-3 h-3 text-emerald-600" />
                    ) : (
                      <ArrowUpDown className="w-3 h-3 text-slate-400" />
                    )}
                  </div>
                </th>
                <th className="px-5 py-3.5 whitespace-nowrap min-w-[200px]">
                  GUARDIAN & CONTACT
                </th>
                <th 
                  onClick={() => handleSort('status')} 
                  className="px-5 py-3.5 cursor-pointer hover:bg-slate-100/80 select-none transition-colors whitespace-nowrap min-w-[110px]"
                >
                  <div className="flex items-center gap-1.5">
                    <span>STATUS</span>
                    {sortField === 'status' ? (
                      sortDirection === 'asc' ? <ArrowUp className="w-3 h-3 text-emerald-600" /> : <ArrowDown className="w-3 h-3 text-emerald-600" />
                    ) : (
                      <ArrowUpDown className="w-3 h-3 text-slate-400" />
                    )}
                  </div>
                </th>
                <th 
                  onClick={() => handleSort('feeStatus')} 
                  className="px-5 py-3.5 cursor-pointer hover:bg-slate-100/80 select-none transition-colors whitespace-nowrap min-w-[120px]"
                >
                  <div className="flex items-center gap-1.5">
                    <span>FEE STATUS</span>
                    {sortField === 'feeStatus' ? (
                      sortDirection === 'asc' ? <ArrowUp className="w-3 h-3 text-emerald-600" /> : <ArrowDown className="w-3 h-3 text-emerald-600" />
                    ) : (
                      <ArrowUpDown className="w-3 h-3 text-slate-400" />
                    )}
                  </div>
                </th>
                <th className="px-5 py-3.5 text-right whitespace-nowrap min-w-[130px]">
                  ACTIONS
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {isLoading ? (
                // Loading Skeleton Rows
                Array.from({ length: 5 }).map((_, idx) => (
                  <tr key={idx} className="animate-pulse">
                    <td className="px-4 py-4 text-center"><div className="w-4 h-4 bg-slate-200 rounded mx-auto"></div></td>
                    <td className="px-5 py-4"><div className="flex items-center gap-3"><div className="w-9 h-9 rounded-full bg-slate-200"></div><div className="space-y-1.5"><div className="w-28 h-3.5 bg-slate-200 rounded"></div><div className="w-20 h-2.5 bg-slate-100 rounded"></div></div></div></td>
                    <td className="px-5 py-4"><div className="w-16 h-4 bg-slate-200 rounded"></div></td>
                    <td className="px-5 py-4"><div className="w-24 h-4 bg-slate-200 rounded"></div></td>
                    <td className="px-5 py-4"><div className="w-24 h-3.5 bg-slate-200 rounded"></div></td>
                    <td className="px-5 py-4"><div className="w-14 h-4 bg-slate-200 rounded-full"></div></td>
                    <td className="px-5 py-4"><div className="w-12 h-4 bg-slate-200 rounded-full"></div></td>
                    <td className="px-5 py-4 text-right"><div className="w-20 h-5 bg-slate-200 rounded ml-auto"></div></td>
                  </tr>
                ))
              ) : paginatedStudents.length > 0 ? (
                paginatedStudents.map((s) => {
                  const isChecked = selectedIds.includes(s.id)

                  return (
                    <tr 
                      key={s.id} 
                      className={`hover:bg-slate-50/80 transition-colors ${isChecked ? 'bg-emerald-50/40' : ''}`}
                    >
                      <td className="px-4 py-3.5 text-center">
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => handleSelectRow(s.id)}
                          className="rounded border-slate-300 text-emerald-600 focus:ring-emerald-500 cursor-pointer"
                        />
                      </td>
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-full bg-emerald-100 border border-emerald-200 text-emerald-800 flex items-center justify-center font-bold text-xs shrink-0 overflow-hidden shadow-2xs">
                            {s.photoUrl ? (
                              <img src={s.photoUrl} alt={s.name} className="w-full h-full object-cover" />
                            ) : (
                              s.name.charAt(0)
                            )}
                          </div>
                          <div>
                            <div className="font-semibold text-slate-900 text-sm flex items-center gap-1.5 whitespace-nowrap">
                              <span>{s.name}</span>
                              {/* Discreet Medical Alert Icon - Confidential Details inside Profile */}
                              {s.medicalAlert && s.medicalAlert !== 'None' && (
                                <span 
                                  className="inline-flex items-center justify-center w-4 h-4 rounded-full bg-rose-50 text-rose-600 border border-rose-200 shrink-0" 
                                  title="Medical Sentinel Alert (View details in confidential Student Dossier)"
                                >
                                  <HeartPulse className="w-2.5 h-2.5" />
                                </span>
                              )}
                            </div>
                            <div className="text-[11px] text-slate-400 whitespace-nowrap">
                              {s.email || (s.gender ? `${s.gender} Student` : 'Registered Admission')}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-3.5 whitespace-nowrap">
                        <span className="font-mono text-xs px-2 py-0.5 rounded bg-slate-100 text-slate-700 font-semibold border border-slate-200">
                          {s.rollNumber}
                        </span>
                      </td>
                      <td className="px-5 py-3.5 whitespace-nowrap">
                        <div className="flex items-center gap-1.5">
                          <span className="text-xs font-semibold text-slate-800">
                            {s.className} ({s.section || 'A'})
                          </span>
                          <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-blue-50 text-blue-700 border border-blue-200 uppercase font-semibold">
                            {detectProgramLevel(s.className)}
                          </span>
                        </div>
                      </td>
                      <td className="px-5 py-3.5 text-xs text-slate-600 whitespace-nowrap">
                        <div className="font-medium text-slate-800 whitespace-nowrap">
                          {s.phone || s.emergencyContact || '—'}
                        </div>
                        {s.fatherName && (
                          <div className="text-[11px] text-slate-500 whitespace-nowrap mt-0.5">
                            <span className="text-slate-400">Guardian:</span> {s.fatherName}
                          </div>
                        )}
                        {s.emergencyDoctorPhone && (
                          <div className="text-[10px] text-rose-600 font-semibold mt-1 flex items-center gap-1 whitespace-nowrap">
                            <span className="w-1.5 h-1.5 rounded-full bg-rose-500"></span>
                            <span>Doc: {s.emergencyDoctorPhone}</span>
                          </div>
                        )}
                      </td>
                      <td className="px-5 py-3.5 whitespace-nowrap">
                        {renderStatusBadge(s.status)}
                      </td>
                      <td className="px-5 py-3.5 whitespace-nowrap">
                        <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${
                          s.feeStatus === 'Paid' 
                            ? 'bg-emerald-50 text-emerald-600 border border-emerald-200' 
                            : 'bg-amber-50 text-amber-600 border border-amber-200'
                        }`}>
                          {s.feeStatus || 'Paid'}
                        </span>
                      </td>
                      <td className="px-5 py-3.5 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-1.5 relative">
                          {/* Primary Action Button: View Profile */}
                          <button
                            type="button"
                            onClick={() => {
                              setSelectedProfile(s)
                              setProfileActiveTab('overview')
                            }}
                            className="px-2.5 py-1 text-xs font-semibold rounded-lg bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200 flex items-center gap-1 transition-colors cursor-pointer"
                            title="View 360° Comprehensive Student Dossier & Profile"
                          >
                            <Eye className="w-3.5 h-3.5" />
                            <span>Profile</span>
                          </button>

                          {/* Dropdown Menu Trigger (⋯) */}
                          <div className="relative">
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation()
                                setOpenMenuStudentId(openMenuStudentId === s.id ? null : s.id)
                              }}
                              className={`p-1 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer border ${
                                openMenuStudentId === s.id ? 'bg-slate-100 border-slate-300' : 'border-transparent'
                              }`}
                              title="More Options"
                            >
                              <MoreVertical className="w-4 h-4" />
                            </button>

                            {/* Dropdown Menu Popup */}
                            {openMenuStudentId === s.id && (
                              <div 
                                onClick={(e) => e.stopPropagation()}
                                className="absolute right-0 top-full mt-1 w-48 bg-white rounded-xl shadow-lg border border-slate-200 py-1.5 z-30 text-xs text-left animate-in fade-in duration-100"
                              >
                                <button
                                  type="button"
                                  onClick={() => {
                                    openEditModal(s)
                                    setOpenMenuStudentId(null)
                                  }}
                                  className="w-full px-3 py-1.5 text-slate-700 hover:bg-slate-50 flex items-center gap-2 cursor-pointer font-medium"
                                >
                                  <Edit2 className="w-3.5 h-3.5 text-slate-400" />
                                  <span>Edit Profile</span>
                                </button>

                                <button
                                  type="button"
                                  onClick={() => {
                                    setSelectedIdCard(s)
                                    setOpenMenuStudentId(null)
                                  }}
                                  className="w-full px-3 py-1.5 text-slate-700 hover:bg-slate-50 flex items-center gap-2 cursor-pointer font-medium"
                                >
                                  <IdCard className="w-3.5 h-3.5 text-emerald-600" />
                                  <span>Smart ID Card</span>
                                </button>

                                <button
                                  type="button"
                                  onClick={() => {
                                    setSelectedAdmissionSlip(s)
                                    setOpenMenuStudentId(null)
                                  }}
                                  className="w-full px-3 py-1.5 text-slate-700 hover:bg-slate-50 flex items-center gap-2 cursor-pointer font-medium"
                                >
                                  <FileCheck className="w-3.5 h-3.5 text-purple-600" />
                                  <span>Admission Slip</span>
                                </button>

                                <button
                                  type="button"
                                  onClick={() => {
                                    setSelectedSLC(s)
                                    setOpenMenuStudentId(null)
                                  }}
                                  className="w-full px-3 py-1.5 text-slate-700 hover:bg-slate-50 flex items-center gap-2 cursor-pointer font-medium"
                                >
                                  <FileText className="w-3.5 h-3.5 text-amber-600" />
                                  <span>SLC Certificate</span>
                                </button>

                                <button
                                  type="button"
                                  onClick={() => {
                                    setSelectedForStatusChange(s)
                                    setOpenMenuStudentId(null)
                                  }}
                                  className="w-full px-3 py-1.5 text-slate-700 hover:bg-slate-50 flex items-center gap-2 cursor-pointer font-medium"
                                >
                                  <UserCheck className="w-3.5 h-3.5 text-indigo-600" />
                                  <span>Change Status</span>
                                </button>

                                <div className="border-t border-slate-100 my-1"></div>

                                <button
                                  type="button"
                                  onClick={() => {
                                    setStudentToDelete(s)
                                    setOpenMenuStudentId(null)
                                  }}
                                  className="w-full px-3 py-1.5 text-rose-600 hover:bg-rose-50 flex items-center gap-2 cursor-pointer font-semibold"
                                >
                                  <Trash2 className="w-3.5 h-3.5 text-rose-500" />
                                  <span>Delete Student</span>
                                </button>
                              </div>
                            )}
                          </div>
                        </div>
                      </td>
                    </tr>
                  )
                })
              ) : (
                // Clean Empty State - No Hardcoded Data & Clean Design
                <tr>
                  <td colSpan={8} className="px-6 py-16 text-center text-slate-400">
                    <div className="w-14 h-14 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto mb-3 border border-emerald-100 shadow-2xs">
                      <GraduationCap className="w-7 h-7" />
                    </div>
                    <p className="text-base font-bold text-slate-800">No Student Records Found</p>
                    <p className="text-xs text-slate-500 mt-1 max-w-md mx-auto">
                      Enroll students manually or import via CSV.
                    </p>
                    <div className="mt-5 flex items-center justify-center gap-3 flex-wrap">
                      <button
                        type="button"
                        onClick={openAddModal}
                        className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold transition-all shadow-2xs flex items-center gap-1.5 cursor-pointer"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>New Student Admission</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => csvInputRef.current?.click()}
                        className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-bold transition-all border border-slate-200 flex items-center gap-1.5 cursor-pointer"
                      >
                        <Upload className="w-3.5 h-3.5" />
                        <span>Import CSV</span>
                      </button>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Bar - Completely hidden when totalStudents is 0 */}
        {totalStudents > 0 && (
          <div className="p-4 border-t border-slate-100 bg-slate-50/50 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500">
            <div>
              Showing <span className="font-semibold text-slate-700">{(currentPage - 1) * pageSize + 1}</span> to{' '}
              <span className="font-semibold text-slate-700">{Math.min(currentPage * pageSize, totalStudents)}</span> of{' '}
              <span className="font-semibold text-slate-700">{totalStudents}</span> students
            </div>

            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className="px-2.5 py-1.5 rounded border border-slate-200 bg-white hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-all cursor-pointer"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>

              {Array.from({ length: totalPages }, (_, i) => i + 1)
                .filter(page => page === 1 || page === totalPages || Math.abs(page - currentPage) <= 1)
                .map((page, idx, arr) => {
                  const prev = arr[idx - 1]
                  return (
                    <React.Fragment key={page}>
                      {prev && page - prev > 1 && <span className="px-1 text-slate-400">...</span>}
                      <button
                        type="button"
                        onClick={() => setCurrentPage(page)}
                        className={`w-7 h-7 rounded text-xs font-semibold transition-all cursor-pointer ${
                          currentPage === page
                            ? 'bg-emerald-600 text-white shadow-xs'
                            : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50'
                        }`}
                      >
                        {page}
                      </button>
                    </React.Fragment>
                  )
                })}

              <button
                type="button"
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages}
                className="px-2.5 py-1.5 rounded border border-slate-200 bg-white hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-all cursor-pointer"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* =========================================================================
          MODALS & DRAWERS
         ========================================================================= */}

      {/* 1. Prerequisite Setup Guidance Modal ("Pehle class aur session banayein") */}
      <Modal
        isOpen={isSetupGuidanceModalOpen}
        onClose={() => setIsSetupGuidanceModalOpen(false)}
        title="Prerequisite Setup Required"
        maxWidth="max-w-md"
      >
        <div className="space-y-4">
          <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl flex items-start gap-3">
            <AlertCircle className="w-6 h-6 text-amber-600 shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-bold text-amber-950">Pehle class aur session banayein</p>
              <p className="text-xs text-amber-800 mt-1 leading-relaxed">
                Student admissions shuru karne se pehle zaroori hai ke institute mein classes aur academic session mojood hon taakay student ko sahi class aur session mein enroll kiya ja sake.
              </p>
            </div>
          </div>

          <div className="space-y-2 text-xs text-slate-600">
            <div className="flex items-center gap-2">
              <span className={`w-2 h-2 rounded-full ${sessionsList.length > 0 ? 'bg-emerald-500' : 'bg-rose-500'}`}></span>
              <span>Academic Session: {sessionsList.length > 0 ? `${sessionsList.length} session(s) active` : 'Missing (Required)'}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className={`w-2 h-2 rounded-full ${classes.length > 0 ? 'bg-emerald-500' : 'bg-rose-500'}`}></span>
              <span>Classes & Sections: {classes.length > 0 ? `${classes.length} class(es) registered` : 'Missing (Required)'}</span>
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t">
            <button
              type="button"
              onClick={() => setIsSetupGuidanceModalOpen(false)}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg cursor-pointer"
            >
              Close
            </button>
            <button
              type="button"
              onClick={() => {
                setIsSetupGuidanceModalOpen(false)
                setIsAddSessionModalOpen(true)
              }}
              className="px-4 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg cursor-pointer flex items-center gap-1.5"
            >
              <Calendar className="w-3.5 h-3.5" />
              <span>Add Academic Session</span>
            </button>
          </div>
        </div>
      </Modal>

      {/* 2. Add New Session Modal */}
      <Modal
        isOpen={isAddSessionModalOpen}
        onClose={() => setIsAddSessionModalOpen(false)}
        title="Add New Academic Session"
        maxWidth="max-w-md"
      >
        <form onSubmit={handleSaveNewSession} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Session Name *</label>
            <input
              type="text"
              required
              placeholder="e.g. 2028-2029"
              value={newSessionData.name}
              onChange={(e) => setNewSessionData({ ...newSessionData, name: e.target.value })}
              className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs font-bold focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-600 uppercase mb-1">Start Date</label>
              <input
                type="date"
                value={newSessionData.startDate}
                onChange={(e) => setNewSessionData({ ...newSessionData, startDate: e.target.value })}
                className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-600 uppercase mb-1">End Date</label>
              <input
                type="date"
                value={newSessionData.endDate}
                onChange={(e) => setNewSessionData({ ...newSessionData, endDate: e.target.value })}
                className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs focus:outline-none"
              />
            </div>
          </div>

          <div className="flex items-center gap-2 p-3 bg-slate-50 border border-slate-200 rounded-lg">
            <input
              type="checkbox"
              id="isCurrentSessionCheck"
              checked={newSessionData.isCurrent}
              onChange={(e) => setNewSessionData({ ...newSessionData, isCurrent: e.target.checked })}
              className="rounded border-slate-300 text-emerald-600 focus:ring-emerald-500 cursor-pointer"
            />
            <label htmlFor="isCurrentSessionCheck" className="text-xs font-semibold text-slate-700 cursor-pointer">
              Set as current active session (Current)
            </label>
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t">
            <button
              type="button"
              onClick={() => setIsAddSessionModalOpen(false)}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg shadow-sm cursor-pointer"
            >
              Save Academic Session
            </button>
          </div>
        </form>
      </Modal>

      {/* 3. Admission / Edit Student Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingStudent ? `Edit Student Details • ${tierVocabulary.levelName}` : `New Student Admission • ${tierVocabulary.levelName}`}
        maxWidth="max-w-2xl"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Photo upload header */}
          <div className="flex items-center gap-4 p-3 rounded-xl bg-slate-50 border border-slate-200">
            <div className="w-14 h-14 rounded-full bg-slate-200 border-2 border-emerald-500 overflow-hidden flex items-center justify-center shrink-0">
              {formData.photoUrl ? (
                <img src={formData.photoUrl} alt="Preview" className="w-full h-full object-cover" />
              ) : (
                <User className="w-7 h-7 text-slate-400" />
              )}
            </div>
            <div className="flex-1">
              <span className="block text-xs font-semibold text-slate-700">Student ID Card Photo</span>
              <span className="text-[11px] text-slate-400 block mb-1.5">JPG or PNG (max 2MB)</span>
              <div className="flex items-center gap-2">
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handlePhotoUpload}
                  accept="image/*"
                  className="hidden"
                />
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="px-2.5 py-1 text-xs font-semibold bg-white border border-slate-300 rounded hover:bg-slate-50 flex items-center gap-1 cursor-pointer"
                >
                  <Camera className="w-3.5 h-3.5 text-slate-500" />
                  <span>Choose Photo</span>
                </button>
                {formData.photoUrl && (
                  <button
                    type="button"
                    onClick={removePhoto}
                    className="text-[11px] text-rose-500 hover:underline cursor-pointer"
                  >
                    Remove
                  </button>
                )}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-600 uppercase mb-1">Student Full Name *</label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-3.5 py-2 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                placeholder="e.g. Student Name"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-600 uppercase mb-1">{tierVocabulary.idLabel} (Unique) *</label>
              <input
                type="text"
                required
                value={formData.rollNumber}
                onChange={(e) => setFormData({ ...formData, rollNumber: e.target.value })}
                className="w-full px-3.5 py-2 rounded-lg border border-slate-200 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                placeholder={tierVocabulary.idPlaceholder}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-600 uppercase mb-1">{tierVocabulary.groupLabel} *</label>
              {availableClasses.length > 0 ? (
                <select
                  required
                  value={formData.className}
                  onChange={(e) => setFormData({ ...formData, className: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500/20 bg-white font-semibold"
                >
                  <option value="">Select {tierVocabulary.groupLabel}</option>
                  {availableClasses.map(c => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              ) : (
                <input
                  type="text"
                  required
                  value={formData.className}
                  onChange={(e) => setFormData({ ...formData, className: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                  placeholder={tierVocabulary.groupPlaceholder}
                />
              )}
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-600 uppercase mb-1">{tierVocabulary.unitLabel} / Section</label>
              <select
                value={formData.section}
                onChange={(e) => setFormData({ ...formData, section: e.target.value })}
                className="w-full px-3 py-2 rounded-lg border border-slate-200 text-xs focus:outline-none bg-white font-semibold"
              >
                {availableSections.map(sec => (
                  <option key={sec} value={sec}>Section / Batch {sec}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-600 uppercase mb-1">Gender</label>
              <select
                value={formData.gender}
                onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                className="w-full px-3 py-2 rounded-lg border border-slate-200 text-xs focus:outline-none bg-white"
              >
                <option value="Male">Male</option>
                <option value="Female">Female</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-600 uppercase mb-1">Father / Guardian Name</label>
              <input
                type="text"
                value={formData.fatherName}
                onChange={(e) => setFormData({ ...formData, fatherName: e.target.value })}
                className="w-full px-3.5 py-2 rounded-lg border border-slate-200 text-xs focus:outline-none"
                placeholder="Guardian Full Name"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-600 uppercase mb-1">Father / Guardian CNIC</label>
              <input
                type="text"
                value={formData.fatherCnic}
                onChange={(e) => setFormData({ ...formData, fatherCnic: e.target.value })}
                className="w-full px-3.5 py-2 rounded-lg border border-slate-200 text-xs font-mono focus:outline-none"
                placeholder="35201-XXXXXXX-X"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-600 uppercase mb-1">Contact Phone</label>
              <input
                type="tel"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="w-full px-3 py-2 rounded-lg border border-slate-200 text-xs focus:outline-none"
                placeholder="+92 3XX XXXXXXX"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-600 uppercase mb-1">Enrollment Status</label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                className="w-full px-3 py-2 rounded-lg border border-slate-200 text-xs focus:outline-none bg-white font-semibold"
              >
                <option value="Active">Active Enrolled</option>
                <option value="Withdrawn">Withdrawn</option>
                <option value="Transferred">Transferred</option>
                <option value="Graduated">Graduated</option>
                <option value="Suspended">Suspended</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-600 uppercase mb-1">Tuition Fee Status</label>
              <select
                value={formData.feeStatus}
                onChange={(e) => setFormData({ ...formData, feeStatus: e.target.value })}
                className="w-full px-3 py-2 rounded-lg border border-slate-200 text-xs focus:outline-none bg-white font-semibold"
              >
                <option value="Paid">Paid</option>
                <option value="Pending">Pending</option>
              </select>
            </div>
          </div>

          {/* Student Health & Medical Sentinel Section */}
          <div className="p-3.5 bg-rose-50/70 border border-rose-200 rounded-xl space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5 text-rose-900 font-bold text-xs uppercase tracking-wide">
                <HeartPulse className="w-4 h-4 text-rose-600" />
                <span>Student Health & Medical Sentinel</span>
              </div>
              <span className="text-[10px] font-semibold text-rose-700 bg-rose-100/90 px-2 py-0.5 rounded-full border border-rose-300">
                Safety Critical
              </span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-[11px] font-semibold text-slate-700 uppercase mb-1">Medical Alert Condition</label>
                <select
                  value={formData.medicalAlert}
                  onChange={(e) => setFormData({ ...formData, medicalAlert: e.target.value })}
                  className="w-full px-2.5 py-2 rounded-lg border border-slate-200 text-xs bg-white focus:outline-none focus:ring-2 focus:ring-rose-500/20"
                >
                  <option value="None">None (No Known Chronic Condition)</option>
                  <option value="Asthma / Inhaler Carried">Asthma (Inhaler Carried)</option>
                  <option value="Severe Food/Peanut Allergy (EpiPen)">Severe Peanut / Food Allergy</option>
                  <option value="Type 1 Diabetes (Insulin Dependent)">Type 1 Diabetes</option>
                  <option value="Epilepsy / Seizure Caution">Epilepsy / Seizure Caution</option>
                  <option value="Cardiovascular Condition">Cardiovascular Condition</option>
                </select>
              </div>
              <div>
                <label className="block text-[11px] font-semibold text-slate-700 uppercase mb-1">Emergency Physician Phone</label>
                <input
                  type="tel"
                  value={formData.emergencyDoctorPhone}
                  onChange={(e) => setFormData({ ...formData, emergencyDoctorPhone: e.target.value })}
                  className="w-full px-2.5 py-2 rounded-lg border border-slate-200 text-xs bg-white focus:outline-none focus:ring-2 focus:ring-rose-500/20"
                  placeholder="+92 300 0000000"
                />
              </div>
              <div>
                <label className="block text-[11px] font-semibold text-slate-700 uppercase mb-1">Vaccination Status</label>
                <select
                  value={formData.vaccinationStatus}
                  onChange={(e) => setFormData({ ...formData, vaccinationStatus: e.target.value })}
                  className="w-full px-2.5 py-2 rounded-lg border border-slate-200 text-xs bg-white focus:outline-none focus:ring-2 focus:ring-rose-500/20"
                >
                  <option value="Fully Vaccinated">Fully Vaccinated</option>
                  <option value="Pending Booster">Pending Booster</option>
                  <option value="Medical Exemption Certificate">Medical Exemption</option>
                </select>
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg shadow-sm transition-all cursor-pointer"
            >
              {editingStudent ? 'Save Profile Changes' : 'Enroll Student'}
            </button>
          </div>
        </form>
      </Modal>

      {/* 4. CSV Error Validation Modal */}
      {csvErrorModal && (
        <Modal
          isOpen={Boolean(csvErrorModal)}
          onClose={() => setCsvErrorModal(null)}
          title="CSV Import Validation & Error Report"
          maxWidth="max-w-2xl"
        >
          <div className="space-y-4">
            <div className="p-3.5 bg-amber-50 border border-amber-200 rounded-xl flex items-center justify-between">
              <div>
                <span className="text-xs font-bold text-amber-950 uppercase tracking-wide">
                  Import Completed with {csvErrorModal.errors.length} Row Exceptions
                </span>
                <p className="text-[11px] text-amber-800 mt-0.5">
                  Successfully imported: <strong className="text-emerald-700">{csvErrorModal.importedCount}</strong> / {csvErrorModal.totalRows} records. 
                  The following rows were rejected due to data validation rules.
                </p>
              </div>
              <FileWarning className="w-8 h-8 text-amber-600 shrink-0" />
            </div>

            <div className="max-h-60 overflow-y-auto border border-slate-200 rounded-xl">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-100 text-slate-700 font-bold uppercase text-[10px] sticky top-0">
                  <tr>
                    <th className="p-2.5 text-center">Row #</th>
                    <th className="p-2.5">Candidate Name</th>
                    <th className="p-2.5">Roll Number</th>
                    <th className="p-2.5 text-rose-600">Rejection Cause</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {csvErrorModal.errors.map((err, idx) => (
                    <tr key={idx} className="hover:bg-slate-50">
                      <td className="p-2.5 text-center font-mono font-bold text-slate-600">#{err.row}</td>
                      <td className="p-2.5 font-semibold text-slate-900">{err.name}</td>
                      <td className="p-2.5 font-mono text-slate-600">{err.roll}</td>
                      <td className="p-2.5 text-rose-600 font-medium">{err.reason}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t">
              <button
                type="button"
                onClick={() => setCsvErrorModal(null)}
                className="px-4 py-2 text-xs font-bold bg-slate-900 text-white rounded-lg hover:bg-black cursor-pointer"
              >
                Acknowledge & Close
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* 5. 360° Comprehensive Student Profile Dossier (7 Full Tabs) */}
      {selectedProfile && (
        <Modal
          isOpen={Boolean(selectedProfile)}
          onClose={() => setSelectedProfile(null)}
          title={`360° Student Academic Dossier • ${selectedProfile.name}`}
          maxWidth="max-w-4xl"
        >
          <div className="space-y-5">
            {/* Dossier Header Banner */}
            <div className="p-4 bg-gradient-to-r from-slate-900 via-slate-800 to-emerald-950 text-white rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-4 shadow-sm">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-2xl bg-white/10 border-2 border-emerald-400 overflow-hidden flex items-center justify-center font-black text-2xl text-emerald-300 shadow-md">
                  {selectedProfile.photoUrl ? (
                    <img src={selectedProfile.photoUrl} alt={selectedProfile.name} className="w-full h-full object-cover" />
                  ) : (
                    selectedProfile.name.charAt(0)
                  )}
                </div>
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <h2 className="text-lg font-black tracking-tight">{selectedProfile.name}</h2>
                    {renderStatusBadge(selectedProfile.status)}
                  </div>
                  <div className="flex items-center gap-3 text-xs text-slate-300 mt-1 flex-wrap">
                    <span className="font-mono bg-white/10 px-2 py-0.5 rounded font-bold text-emerald-300">
                      {selectedProfile.rollNumber}
                    </span>
                    <span>{selectedProfile.className} ({selectedProfile.section || 'A'})</span>
                    <span>Session: {selectedProfile.academicSession || academicSession}</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setSelectedIdCard(selectedProfile)}
                  className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-lg flex items-center gap-1.5 shadow-2xs transition-all cursor-pointer"
                >
                  <IdCard className="w-4 h-4" />
                  <span>Smart ID</span>
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedAdmissionSlip(selectedProfile)}
                  className="px-3 py-1.5 bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold rounded-lg flex items-center gap-1.5 shadow-2xs transition-all cursor-pointer"
                >
                  <FileCheck className="w-4 h-4" />
                  <span>Admission Slip</span>
                </button>
              </div>
            </div>

            {/* 7 Tab Navigation Bar */}
            <div className="flex items-center gap-1 border-b border-slate-200 overflow-x-auto pb-1 text-xs font-bold text-slate-600">
              {[
                { id: 'overview', label: 'Overview', icon: User },
                { id: 'guardians', label: 'Guardians', icon: Users },
                { id: 'academic', label: 'Academic Standing', icon: GraduationCap },
                { id: 'fees', label: 'Fee Clearance', icon: Award },
                { id: 'attendance', label: 'Attendance', icon: Activity },
                { id: 'documents', label: 'Documents', icon: FileText },
                { id: 'medical', label: 'Medical Sentinel', icon: HeartPulse }
              ].map(tab => {
                const Icon = tab.icon
                const isActive = profileActiveTab === tab.id
                return (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => setProfileActiveTab(tab.id)}
                    className={`flex items-center gap-1.5 px-3 py-2 rounded-t-lg transition-all border-b-2 cursor-pointer whitespace-nowrap ${
                      isActive 
                        ? 'border-emerald-600 text-emerald-700 bg-emerald-50/50' 
                        : 'border-transparent hover:text-slate-900 hover:bg-slate-50'
                    }`}
                  >
                    <Icon className="w-3.5 h-3.5" />
                    <span>{tab.label}</span>
                  </button>
                )
              })}
            </div>

            {/* Tab 1: Overview */}
            {profileActiveTab === 'overview' && (
              <div className="space-y-4 animate-in fade-in duration-150">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl">
                    <span className="text-[10px] uppercase font-bold text-slate-400 block">Contact Phone</span>
                    <span className="text-xs font-bold text-slate-800">{selectedProfile.phone || 'Not Provided'}</span>
                  </div>
                  <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl">
                    <span className="text-[10px] uppercase font-bold text-slate-400 block">Email Address</span>
                    <span className="text-xs font-bold text-slate-800">{selectedProfile.email || 'Not Provided'}</span>
                  </div>
                  <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl">
                    <span className="text-[10px] uppercase font-bold text-slate-400 block">Residential Address</span>
                    <span className="text-xs font-bold text-slate-800 truncate block">{selectedProfile.address || 'Campus Resident'}</span>
                  </div>
                </div>

                {selectedProfile.medicalAlert && selectedProfile.medicalAlert !== 'None' && (
                  <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-xl flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <HeartPulse className="w-5 h-5 text-rose-600" />
                      <div>
                        <span className="text-xs font-bold text-rose-950 uppercase">Active Medical Alert</span>
                        <p className="text-xs text-rose-800">{selectedProfile.medicalAlert}</p>
                      </div>
                    </div>
                    {selectedProfile.emergencyDoctorPhone && (
                      <span className="text-xs font-mono font-bold text-rose-700 bg-rose-100 px-2.5 py-1 rounded-md">
                        Doctor: {selectedProfile.emergencyDoctorPhone}
                      </span>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* Tab 2: Guardians */}
            {profileActiveTab === 'guardians' && (
              <div className="space-y-4 animate-in fade-in duration-150 text-xs">
                <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-900 text-sm">Primary Guardian / Father</span>
                    <span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 text-[10px] font-bold">Authorized</span>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <span className="text-[10px] text-slate-400 uppercase font-semibold">Guardian Name</span>
                      <p className="font-bold text-slate-800 mt-0.5">{selectedProfile.fatherName || 'Not Recorded'}</p>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 uppercase font-semibold">National ID (CNIC)</span>
                      <p className="font-mono font-bold text-slate-800 mt-0.5">{selectedProfile.fatherCnic || '35201-XXXXXXX-X'}</p>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 uppercase font-semibold">Emergency Phone</span>
                      <p className="font-bold text-slate-800 mt-0.5">{selectedProfile.emergencyContact || selectedProfile.phone || '—'}</p>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 uppercase font-semibold">Relationship</span>
                      <p className="font-bold text-slate-800 mt-0.5">Father / Legal Guardian</p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Tab 3: Academic */}
            {profileActiveTab === 'academic' && (
              <div className="space-y-4 animate-in fade-in duration-150 text-xs">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                    <span className="text-[10px] uppercase font-bold text-slate-400">Enrolled Program</span>
                    <p className="font-bold text-slate-900 mt-0.5">{selectedProfile.className}</p>
                  </div>
                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                    <span className="text-[10px] uppercase font-bold text-slate-400">Class Section</span>
                    <p className="font-bold text-slate-900 mt-0.5">Section {selectedProfile.section || 'A'}</p>
                  </div>
                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                    <span className="text-[10px] uppercase font-bold text-slate-400">Academic Standing</span>
                    <p className="font-bold text-emerald-600 mt-0.5">Good Standing</p>
                  </div>
                </div>
              </div>
            )}

            {/* Tab 4: Fees */}
            {profileActiveTab === 'fees' && (
              <div className="space-y-4 animate-in fade-in duration-150 text-xs">
                <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between">
                  <div>
                    <span className="text-[10px] uppercase font-bold text-slate-400">Current Ledger Status</span>
                    <p className="text-base font-black text-slate-900 mt-0.5">
                      {selectedProfile.feeStatus === 'Paid' ? 'Fee Cleared • No Dues' : 'Outstanding Balance Pending'}
                    </p>
                  </div>
                  <span className={`px-3 py-1 rounded-full font-bold text-xs ${
                    selectedProfile.feeStatus === 'Paid' ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                  }`}>
                    {selectedProfile.feeStatus}
                  </span>
                </div>
              </div>
            )}

            {/* Tab 5: Attendance */}
            {profileActiveTab === 'attendance' && (
              <div className="space-y-4 animate-in fade-in duration-150 text-xs text-center py-6 text-slate-400">
                <Activity className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                <p className="font-semibold text-slate-600">No Attendance Records Logged</p>
                <p className="text-[11px] text-slate-400 mt-0.5">Attendance logs will appear here once marked in the Attendance module.</p>
              </div>
            )}

            {/* Tab 6: Documents */}
            {profileActiveTab === 'documents' && (
              <div className="space-y-3 animate-in fade-in duration-150 text-xs">
                {[
                  { title: 'NADRA B-Form / National Identity Copy', status: 'Pending Verification' },
                  { title: 'Previous School Leaving Certificate (SLC)', status: 'Original Deposited' },
                  { title: 'Medical Fitness & Blood Group Record', status: 'Certified' }
                ].map((doc, idx) => (
                  <div key={idx} className="p-3 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <FileCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                      <span className="font-bold text-slate-800">{doc.title}</span>
                    </div>
                    <span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 font-bold text-[10px]">
                      {doc.status}
                    </span>
                  </div>
                ))}
              </div>
            )}

            {/* Tab 7: Medical Sentinel (Confidential Medical Details) */}
            {profileActiveTab === 'medical' && (
              <div className="space-y-4 animate-in fade-in duration-150 text-xs">
                <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-amber-900 flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-amber-700 shrink-0" />
                  <span>Confidential Student Medical Record (Protected Health Information)</span>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl">
                    <span className="text-[10px] uppercase font-bold text-rose-800">Blood Group</span>
                    <p className="text-base font-black text-rose-950 mt-0.5">{selectedProfile.bloodGroup || 'B+'}</p>
                  </div>
                  <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl">
                    <span className="text-[10px] uppercase font-bold text-slate-400">Vaccination Status</span>
                    <p className="font-bold text-slate-800 mt-0.5">{selectedProfile.vaccinationStatus || 'Fully Vaccinated'}</p>
                  </div>
                  <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl">
                    <span className="text-[10px] uppercase font-bold text-slate-400">Emergency Physician</span>
                    <p className="font-bold text-slate-800 mt-0.5">{selectedProfile.emergencyDoctorPhone || 'Not Specified'}</p>
                  </div>
                  <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl">
                    <span className="text-[10px] uppercase font-bold text-slate-400">Health Alert Protocol</span>
                    <p className="font-bold text-slate-800 mt-0.5">{selectedProfile.medicalAlert || 'None'}</p>
                  </div>
                </div>
              </div>
            )}

            <div className="flex justify-end pt-3 border-t">
              <button
                type="button"
                onClick={() => setSelectedProfile(null)}
                className="px-4 py-2 text-xs font-bold bg-slate-900 text-white rounded-lg hover:bg-black cursor-pointer"
              >
                Close Dossier
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* 6. Smart Student ID Card Modal */}
      {selectedIdCard && (
        <Modal
          isOpen={Boolean(selectedIdCard)}
          onClose={() => setSelectedIdCard(null)}
          title="Printable Smart Student ID Card"
          maxWidth="max-w-md"
        >
          <div className="space-y-4">
            <div className="w-80 mx-auto bg-gradient-to-br from-emerald-800 via-teal-900 to-slate-950 text-white p-5 rounded-2xl shadow-xl border-2 border-emerald-400/40 relative overflow-hidden">
              <div className="flex items-center justify-between pb-3 border-b border-emerald-500/30">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-white/20 flex items-center justify-center font-black text-emerald-300">
                    <GraduationCap className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-black text-xs tracking-tight">CAMPUS SMART ID</h3>
                    <span className="text-[9px] text-emerald-300 tracking-wider uppercase block">
                      {currentInstitute?.name || 'Academic Institute'}
                    </span>
                  </div>
                </div>
                <QrCode className="w-6 h-6 text-emerald-300" />
              </div>

              <div className="flex items-center gap-4 my-4">
                <div className="w-18 h-18 rounded-xl bg-white/10 border-2 border-emerald-400 overflow-hidden flex items-center justify-center font-black text-xl text-emerald-300 shrink-0 shadow-md">
                  {selectedIdCard.photoUrl ? (
                    <img src={selectedIdCard.photoUrl} alt={selectedIdCard.name} className="w-full h-full object-cover" />
                  ) : (
                    selectedIdCard.name.charAt(0)
                  )}
                </div>
                <div>
                  <h4 className="font-black text-sm text-white tracking-wide">{selectedIdCard.name}</h4>
                  <span className="text-xs font-mono font-bold text-emerald-300 block">{selectedIdCard.rollNumber}</span>
                  <div className="text-[10px] text-emerald-100/90 mt-1">
                    <div>{selectedIdCard.className} (Sec {selectedIdCard.section || 'A'})</div>
                    <div>Blood Group: <strong className="text-white">{selectedIdCard.bloodGroup || 'B+'}</strong></div>
                  </div>
                </div>
              </div>

              <div className="pt-2 border-t border-emerald-500/30 flex items-center justify-between text-[9px] text-emerald-200">
                <span>Session: {selectedIdCard.academicSession || academicSession}</span>
                <span>Emergency: {selectedIdCard.phone || '—'}</span>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t">
              <button
                type="button"
                onClick={() => setSelectedIdCard(null)}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg cursor-pointer"
              >
                Close
              </button>
              <button
                type="button"
                onClick={() => {
                  window.print()
                  toast.success('Print command delivered.')
                }}
                className="px-4 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg cursor-pointer flex items-center gap-1.5"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>Print PVC Card</span>
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* 7. Official Admission Registration Slip Modal */}
      {selectedAdmissionSlip && (
        <Modal
          isOpen={Boolean(selectedAdmissionSlip)}
          onClose={() => setSelectedAdmissionSlip(null)}
          title="Official Student Admission Certificate & Registration Slip"
          maxWidth="max-w-2xl"
        >
          <div className="space-y-4">
            <div className="p-6 bg-white border-2 border-slate-800 rounded-xl space-y-4 shadow-sm text-slate-900">
              <div className="text-center pb-3 border-b-2 border-slate-800">
                <h2 className="text-base font-black tracking-wider uppercase">{currentInstitute?.name || 'CENTRAL INSTITUTE OF LEARNING'}</h2>
                <span className="text-xs font-bold text-slate-600 tracking-wide block mt-0.5">OFFICIAL ADMISSION CONFIRMATION & ROSTER SLIP</span>
                <span className="text-[10px] font-mono text-slate-500 block">SESSION: {selectedAdmissionSlip.academicSession || academicSession}</span>
              </div>

              <div className="grid grid-cols-2 gap-4 text-xs">
                <div>
                  <span className="text-[10px] font-bold text-slate-500 uppercase block">Candidate Name</span>
                  <p className="font-bold text-sm text-slate-950 mt-0.5">{selectedAdmissionSlip.name}</p>
                </div>
                <div>
                  <span className="text-[10px] font-bold text-slate-500 uppercase block">Admission / Roll No</span>
                  <p className="font-mono font-bold text-sm text-emerald-800 mt-0.5">{selectedAdmissionSlip.rollNumber}</p>
                </div>
                <div>
                  <span className="text-[10px] font-bold text-slate-500 uppercase block">Assigned Grade / Degree</span>
                  <p className="font-bold text-slate-950 mt-0.5">{selectedAdmissionSlip.className}</p>
                </div>
                <div>
                  <span className="text-[10px] font-bold text-slate-500 uppercase block">Section / Unit</span>
                  <p className="font-bold text-slate-950 mt-0.5">Section {selectedAdmissionSlip.section || 'A'}</p>
                </div>
                <div>
                  <span className="text-[10px] font-bold text-slate-500 uppercase block">Father / Guardian</span>
                  <p className="font-bold text-slate-950 mt-0.5">{selectedAdmissionSlip.fatherName || 'Not Recorded'}</p>
                </div>
                <div>
                  <span className="text-[10px] font-bold text-slate-500 uppercase block">Initial Fee Clearance</span>
                  <p className="font-bold text-emerald-700 mt-0.5">{selectedAdmissionSlip.feeStatus || 'Paid'}</p>
                </div>
              </div>

              <div className="pt-6 mt-4 border-t border-dashed border-slate-400 flex items-center justify-between text-xs text-slate-500">
                <div>
                  <div className="w-32 border-b border-slate-400 mb-1"></div>
                  <span>Registrar Office Signature</span>
                </div>
                <div>
                  <div className="w-32 border-b border-slate-400 mb-1"></div>
                  <span>Campus Seal & Stamp</span>
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t">
              <button
                type="button"
                onClick={() => setSelectedAdmissionSlip(null)}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg cursor-pointer"
              >
                Close
              </button>
              <button
                type="button"
                onClick={() => {
                  window.print()
                  toast.success('Admission Slip printed.')
                }}
                className="px-4 py-2 text-xs font-bold text-white bg-purple-600 hover:bg-purple-700 rounded-lg cursor-pointer flex items-center gap-1.5"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>Print Official Slip</span>
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* 8. School Leaving Certificate (SLC) Modal */}
      {selectedSLC && (
        <Modal
          isOpen={Boolean(selectedSLC)}
          onClose={() => setSelectedSLC(null)}
          title="School Leaving & Character Certificate (SLC)"
          maxWidth="max-w-2xl"
        >
          <div className="space-y-4">
            <div className="p-6 bg-amber-50/50 border-2 border-amber-900/40 rounded-xl space-y-4 text-slate-900 shadow-sm">
              <div className="text-center pb-3 border-b-2 border-amber-900/40">
                <h2 className="text-base font-black uppercase text-amber-950">{currentInstitute?.name || 'CENTRAL EDUCATIONAL BOARD'}</h2>
                <span className="text-xs font-bold text-amber-800 tracking-wider uppercase block mt-0.5">SCHOOL LEAVING CERTIFICATE</span>
              </div>
              <p className="text-xs leading-relaxed text-slate-800">
                This is to certify that <strong>{selectedSLC.name}</strong>, Son/Daughter of <strong>{selectedSLC.fatherName || 'Legal Guardian'}</strong>, 
                bearing Admission Roll No <strong>{selectedSLC.rollNumber}</strong>, was a bona fide student of this institution in <strong>{selectedSLC.className}</strong>.
              </p>
              <p className="text-xs text-slate-700">
                He/She bears a good moral character. During their tenure, their conduct and academic performance were satisfactory. All school dues have been cleared.
              </p>
              <div className="pt-6 border-t border-dashed border-slate-300 flex items-center justify-between text-xs text-slate-500">
                <span>Issue Date: {new Date().toISOString().split('T')[0]}</span>
                <span>Principal Signature & Stamp</span>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t">
              <button
                type="button"
                onClick={() => setSelectedSLC(null)}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg cursor-pointer"
              >
                Close
              </button>
              <button
                type="button"
                onClick={() => {
                  window.print()
                  toast.success('SLC Certificate printed.')
                }}
                className="px-4 py-2 text-xs font-bold text-white bg-amber-700 hover:bg-amber-800 rounded-lg cursor-pointer flex items-center gap-1.5"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>Print SLC Certificate</span>
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* 9. Single Status Change Modal */}
      {selectedForStatusChange && (
        <Modal
          isOpen={Boolean(selectedForStatusChange)}
          onClose={() => setSelectedForStatusChange(null)}
          title={`Change Enrollment Status • ${selectedForStatusChange.name}`}
          maxWidth="max-w-md"
        >
          <div className="space-y-4">
            <p className="text-xs text-slate-600">
              Select the updated official status for <strong className="text-slate-900">{selectedForStatusChange.name}</strong> ({selectedForStatusChange.rollNumber}):
            </p>
            <div className="grid grid-cols-1 gap-2">
              {['Active', 'Withdrawn', 'Transferred', 'Graduated', 'Suspended'].map(st => (
                <button
                  key={st}
                  type="button"
                  onClick={() => handleUpdateSingleStatus(st)}
                  className={`p-3 rounded-lg border text-left text-xs font-bold flex items-center justify-between transition-all cursor-pointer ${
                    selectedForStatusChange.status === st 
                      ? 'border-emerald-600 bg-emerald-50 text-emerald-900' 
                      : 'border-slate-200 hover:bg-slate-50 text-slate-700'
                  }`}
                >
                  <span>{st}</span>
                  {selectedForStatusChange.status === st && <Check className="w-4 h-4 text-emerald-600" />}
                </button>
              ))}
            </div>
          </div>
        </Modal>
      )}

      {/* 10. Single Delete Confirmation Modal */}
      {studentToDelete && (
        <Modal
          isOpen={Boolean(studentToDelete)}
          onClose={() => setStudentToDelete(null)}
          title="Confirm Student Removal"
          maxWidth="max-w-md"
        >
          <div className="space-y-4">
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl flex items-center gap-3">
              <AlertTriangle className="w-6 h-6 text-rose-600 shrink-0" />
              <div className="text-xs text-rose-900">
                <p className="font-bold">Are you sure you want to delete this student?</p>
                <p className="mt-0.5">This will permanently remove <strong>{studentToDelete.name}</strong> ({studentToDelete.rollNumber}) from the active roster.</p>
              </div>
            </div>
            <div className="flex justify-end gap-2 pt-2 border-t">
              <button
                type="button"
                onClick={() => setStudentToDelete(null)}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDeleteConfirm}
                className="px-4 py-2 text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 rounded-lg cursor-pointer flex items-center gap-1"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Confirm Delete</span>
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* 11. Bulk Promote Modal */}
      {isBulkPromoteOpen && (
        <Modal
          isOpen={isBulkPromoteOpen}
          onClose={() => setIsBulkPromoteOpen(false)}
          title={`Bulk Promote ${selectedIds.length} Students`}
          maxWidth="max-w-md"
        >
          <div className="space-y-4">
            <p className="text-xs text-slate-600">
              Select the target grade/class to promote all <strong className="text-slate-900">{selectedIds.length}</strong> selected students to:
            </p>
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Target Class *</label>
              <select
                value={bulkTargetClass}
                onChange={(e) => setBulkTargetClass(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 font-bold bg-white"
              >
                {availableClasses.map(c => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>
            <div className="flex justify-end gap-2 pt-2 border-t">
              <button
                type="button"
                onClick={() => setIsBulkPromoteOpen(false)}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleBulkPromote}
                className="px-4 py-2 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg cursor-pointer flex items-center gap-1"
              >
                <GraduationCap className="w-3.5 h-3.5" />
                <span>Confirm Promotion</span>
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* 12. Bulk Section Transfer Modal */}
      {isBulkTransferOpen && (
        <Modal
          isOpen={isBulkTransferOpen}
          onClose={() => setIsBulkTransferOpen(false)}
          title={`Bulk Transfer Section for ${selectedIds.length} Students`}
          maxWidth="max-w-md"
        >
          <div className="space-y-4">
            <p className="text-xs text-slate-600">
              Select the new section to assign across all <strong className="text-slate-900">{selectedIds.length}</strong> selected students:
            </p>
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Target Section *</label>
              <select
                value={bulkTargetSection}
                onChange={(e) => setBulkTargetSection(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 font-bold bg-white"
              >
                {availableSections.map(sec => (
                  <option key={sec} value={sec}>Section {sec}</option>
                ))}
              </select>
            </div>
            <div className="flex justify-end gap-2 pt-2 border-t">
              <button
                type="button"
                onClick={() => setIsBulkTransferOpen(false)}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleBulkTransferSection}
                className="px-4 py-2 text-xs font-bold text-white bg-amber-600 hover:bg-amber-700 rounded-lg cursor-pointer flex items-center gap-1"
              >
                <Layers className="w-3.5 h-3.5" />
                <span>Confirm Section Transfer</span>
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* 13. Bulk Status Change Modal */}
      {isBulkStatusOpen && (
        <Modal
          isOpen={isBulkStatusOpen}
          onClose={() => setIsBulkStatusOpen(false)}
          title={`Bulk Change Status for ${selectedIds.length} Students`}
          maxWidth="max-w-md"
        >
          <div className="space-y-4">
            <p className="text-xs text-slate-600">
              Select the new enrollment status to apply across all <strong className="text-slate-900">{selectedIds.length}</strong> selected students:
            </p>
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">New Status *</label>
              <select
                value={bulkTargetStatus}
                onChange={(e) => setBulkTargetStatus(e.target.value)}
                className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 font-bold bg-white"
              >
                <option value="Active">Active Enrolled</option>
                <option value="Withdrawn">Withdrawn</option>
                <option value="Transferred">Transferred</option>
                <option value="Graduated">Graduated</option>
                <option value="Suspended">Suspended</option>
              </select>
            </div>
            <div className="flex justify-end gap-2 pt-2 border-t">
              <button
                type="button"
                onClick={() => setIsBulkStatusOpen(false)}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleBulkStatusChange}
                className="px-4 py-2 text-xs font-bold text-white bg-purple-600 hover:bg-purple-700 rounded-lg cursor-pointer flex items-center gap-1"
              >
                <UserCheck className="w-3.5 h-3.5" />
                <span>Apply Status Change</span>
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* 14. Bulk Delete Confirmation Modal */}
      {isBulkDeleteOpen && (
        <Modal
          isOpen={isBulkDeleteOpen}
          onClose={() => setIsBulkDeleteOpen(false)}
          title={`Confirm Bulk Removal of ${selectedIds.length} Students`}
          maxWidth="max-w-md"
        >
          <div className="space-y-4">
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl flex items-center gap-3">
              <AlertTriangle className="w-6 h-6 text-rose-600 shrink-0" />
              <div className="text-xs text-rose-900">
                <p className="font-bold">Permanent Bulk Action</p>
                <p className="mt-0.5">Are you sure you want to permanently delete all <strong>{selectedIds.length}</strong> selected student records? This action cannot be undone.</p>
              </div>
            </div>
            <div className="flex justify-end gap-2 pt-2 border-t">
              <button
                type="button"
                onClick={() => setIsBulkDeleteOpen(false)}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleBulkDelete}
                className="px-4 py-2 text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 rounded-lg cursor-pointer flex items-center gap-1"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Delete {selectedIds.length} Students</span>
              </button>
            </div>
          </div>
        </Modal>
      )}
          {/* Printable Smart Student ID Card Engine */}
      <PrintableStudentIdCardModal
        isOpen={isIdCardEngineOpen}
        onClose={() => {
          setIsIdCardEngineOpen(false)
          setSelectedStudentForCard(null)
        }}
        selectedStudent={selectedStudentForCard}
        allStudents={students}
        currentInstitute={currentInstitute}
      />

      {/* Printable Candidate Exam Admit Card & Roll Number Slip */}
      <PrintableExamAdmitCardModal
        isOpen={isAdmitCardOpen}
        onClose={() => {
          setIsAdmitCardOpen(false)
          setSelectedStudentForAdmit(null)
        }}
        selectedCandidate={selectedStudentForAdmit}
        allStudents={students}
        currentInstitute={currentInstitute}
      />
    </div>
  )
}

export default StudentsView
