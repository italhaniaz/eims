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
  Sparkles, 
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
  FileWarning 
} from 'lucide-react'
import { useAppData } from '../../../context/AppDataContext'
import { useToast } from '../../../context/ToastContext'
import { detectProgramLevel, normalizeClassSections } from '../../../constants/academicLevels'
import Modal from '../../../components/common/Modal'

export const StudentsView = ({ currentInstitute }) => {
  const { 
    students = [], 
    classes = [], 
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

  // Loading & Error Fallback States
  const [isLoading, setIsLoading] = useState(false)
  const [loadError, setLoadError] = useState(null)

  // Global Academic Session Selector
  const [academicSession, setAcademicSession] = useState('2026-2027')

  // Search & Multi-Dimensional Filters
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedLevelFilter, setSelectedLevelFilter] = useState('all') // 'all' | 'school' | 'college' | 'university'
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

  // Modals & Drawers States
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingStudent, setEditingStudent] = useState(null)
  const [selectedIdCard, setSelectedIdCard] = useState(null)
  const [selectedSLC, setSelectedSLC] = useState(null)
  const [selectedProfile, setSelectedProfile] = useState(null) // 7-Tab Dossier Drawer
  const [profileActiveTab, setProfileActiveTab] = useState('overview') // 'overview' | 'guardians' | 'academic' | 'fees' | 'attendance' | 'documents' | 'medical'
  const [selectedAdmissionSlip, setSelectedAdmissionSlip] = useState(null)
  const [selectedForStatusChange, setSelectedForStatusChange] = useState(null)
  const [studentToDelete, setStudentToDelete] = useState(null)

  // Bulk Actions & Row Checkboxes State
  const [selectedIds, setSelectedIds] = useState([])
  const [isBulkPromoteOpen, setIsBulkPromoteOpen] = useState(false)
  const [isBulkTransferOpen, setIsBulkTransferOpen] = useState(false)
  const [isBulkStatusOpen, setIsBulkStatusOpen] = useState(false)
  const [isBulkDeleteOpen, setIsBulkDeleteOpen] = useState(false)
  const [bulkTargetClass, setBulkTargetClass] = useState('11th Grade')
  const [bulkTargetSection, setBulkTargetSection] = useState('B')
  const [bulkTargetStatus, setBulkTargetStatus] = useState('Graduated')

  // CSV Validation Error Report Modal
  const [csvErrorModal, setCsvErrorModal] = useState(null) // { totalRows, importedCount, errors: [{ row, name, roll, error }] }

  // Form State for Add / Edit
  const [formData, setFormData] = useState({
    name: '',
    rollNumber: '',
    className: '10th Grade',
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
    attendanceRate: '95%',
    photoUrl: null,
    medicalAlert: 'None',
    emergencyDoctorPhone: '',
    vaccinationStatus: 'Fully Vaccinated',
    academicSession: '2026-2027',
    department: '',
    batch: ''
  })

  // Keyboard accessibility: Escape key closes active modals
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
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [])

  // Dynamic Level Determination & Adaptive Tier Vocabulary
  const currentLevelKey = useMemo(() => {
    if (selectedLevelFilter !== 'all') return selectedLevelFilter
    if (activeProgramLevel && activeProgramLevel !== 'all') return activeProgramLevel
    return 'school'
  }, [selectedLevelFilter, activeProgramLevel])

  const tierVocabulary = useMemo(() => {
    switch (currentLevelKey) {
      case 'college':
        return {
          levelName: 'College / Intermediate',
          idLabel: 'Board Roll No',
          idPlaceholder: 'e.g. BISE-882190',
          groupLabel: 'Academic Year',
          groupPlaceholder: 'e.g. 1st Year (FSc Pre-Medical)',
          subGroupLabel: 'Study Group',
          subGroupPlaceholder: 'e.g. Pre-Medical / Pre-Engineering / ICS',
          unitLabel: 'Section'
        }
      case 'university':
        return {
          levelName: 'University / Higher Ed',
          idLabel: 'Registration / CMS No',
          idPlaceholder: 'e.g. 2026-BSCS-042',
          groupLabel: 'Degree Program',
          groupPlaceholder: 'e.g. BS Computer Science / BBA',
          subGroupLabel: 'Current Semester',
          subGroupPlaceholder: 'e.g. Semester 3 (Fall 2026)',
          unitLabel: 'Batch / Section'
        }
      case 'school':
      default:
        return {
          levelName: 'Primary / Secondary School',
          idLabel: 'Admission Roll No',
          idPlaceholder: 'e.g. STD-2041',
          groupLabel: 'Grade / Class',
          groupPlaceholder: 'e.g. 10th Grade / Class 8',
          subGroupLabel: 'Section',
          subGroupPlaceholder: 'e.g. Section A (Science)',
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

  // Campus Student Pool
  const campusStudents = useMemo(() => {
    return students.filter(s => {
      return !s.instituteId || !currentInstitute?.id || s.instituteId === currentInstitute?.id || currentInstitute?.id === 'inst-default'
    })
  }, [students, currentInstitute?.id])

  // Executive Metrics
  const totalCampusStudents = campusStudents.length
  const paidStudentsCount = campusStudents.filter(s => s.feeStatus === 'Paid').length
  const pendingStudentsCount = totalCampusStudents - paidStudentsCount
  const medicalAlertStudentsCount = campusStudents.filter(s => s.medicalAlert && s.medicalAlert !== 'None').length

  const avgAttendanceRate = useMemo(() => {
    if (totalCampusStudents === 0) return 95
    const sum = campusStudents.reduce((acc, s) => {
      const val = parseFloat((s.attendanceRate || '95').replace('%', '')) || 95
      return acc + val
    }, 0)
    return Math.round(sum / totalCampusStudents)
  }, [campusStudents, totalCampusStudents])

  // Distinct classes and sections enrolled
  const availableClasses = useMemo(() => {
    const set = new Set()
    campusStudents.forEach(s => {
      if (s.className) set.add(s.className)
    })
    return Array.from(set).sort()
  }, [campusStudents])

  const availableSections = useMemo(() => {
    const set = new Set()
    campusStudents.forEach(s => {
      if (s.section) set.add(s.section)
    })
    return Array.from(set).sort()
  }, [campusStudents])

  // Multi-Filter & Search Engine
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

      // Academic Session filter
      if (s.academicSession && academicSession && s.academicSession !== academicSession) {
        // Soft match: only filter if explicitly recorded
      }

      // Global navbar tier filter if active
      if (activeProgramLevel && activeProgramLevel !== 'all') {
        const studentLevel = detectProgramLevel(s.className)
        if (studentLevel !== activeProgramLevel && studentLevel !== 'all') return false
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
    selectedLevelFilter, 
    selectedClassFilter, 
    selectedSectionFilter, 
    selectedStatusFilter, 
    selectedGenderFilter, 
    selectedFeeFilter, 
    selectedMedicalFilter, 
    academicSession, 
    activeProgramLevel, 
    sortField, 
    sortDirection
  ])

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

  // Open Add Modal
  const openAddModal = () => {
    setEditingStudent(null)
    const prefix = currentLevelKey === 'university' ? 'REG' : currentLevelKey === 'college' ? 'COL' : 'STD'
    setFormData({
      name: '',
      rollNumber: `${prefix}-${Math.floor(1000 + Math.random() * 9000)}`,
      className: currentLevelKey === 'university' ? 'BS Computer Science' : currentLevelKey === 'college' ? '11th Grade (Pre-Med)' : '10th Grade',
      section: 'A',
      gender: 'Male',
      fatherName: '',
      fatherCnic: '35201-1234567-1',
      address: 'Main Campus City Resident',
      email: '',
      phone: '',
      bloodGroup: 'B+',
      emergencyContact: '',
      status: 'Active',
      feeStatus: 'Paid',
      attendanceRate: '96%',
      photoUrl: null,
      medicalAlert: 'None',
      emergencyDoctorPhone: '',
      vaccinationStatus: 'Fully Vaccinated',
      academicSession: academicSession || '2026-2027',
      department: currentLevelKey === 'university' ? 'Computer Science' : '',
      batch: currentLevelKey === 'university' ? 'Fall 2026' : ''
    })
    setIsModalOpen(true)
  }

  // Open Edit Modal
  const openEditModal = (s) => {
    setEditingStudent(s)
    setFormData({
      name: s.name || '',
      rollNumber: s.rollNumber || '',
      className: s.className || '10th Grade',
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
      attendanceRate: s.attendanceRate || '95%',
      photoUrl: s.photoUrl || null,
      medicalAlert: s.medicalAlert || 'None',
      emergencyDoctorPhone: s.emergencyDoctorPhone || '',
      vaccinationStatus: s.vaccinationStatus || 'Fully Vaccinated',
      academicSession: s.academicSession || '2026-2027',
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
    if (selectedIds.length === 0) return
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

  // CSV Template Download
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
      'Vaccination'
    ]
    const sampleRows = [
      ['Daniyal Tariq', 'STD-1001', '10th Grade', 'A', 'Male', 'Tariq Mehmood', 'daniyal@sms.edu', '+92 321 1122334', '+92 300 1234567', 'B+', 'Active', 'Paid', '96%', 'None', '', 'Fully Vaccinated'],
      ['Zainab Fatima', 'COL-2002', '11th Grade (Pre-Med)', 'B', 'Female', 'Muhammad Qasim', 'zainab@sms.edu', '+92 333 4455667', '+92 321 9876543', 'A+', 'Active', 'Pending', '98%', 'Asthma / Inhaler Carried', '+92 300 4567890', 'Fully Vaccinated'],
      ['Ahmed Raza', 'REG-3003', 'BS Computer Science', 'A', 'Male', 'Abdul Rehman', 'ahmed.cs@sms.edu', '+92 345 5566778', '+92 345 5566778', 'O+', 'Active', 'Paid', '92%', 'None', '', 'Fully Vaccinated']
    ]

    const csvContent = [headers.join(','), ...sampleRows.map(r => r.map(f => `"${f}"`).join(','))].join('\n')
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.setAttribute('download', 'student_admission_template.csv')
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

        // Loop starting after header
        for (let i = 1; i < lines.length; i++) {
          const rowNumber = i + 1
          const row = lines[i].split(',').map(item => item.replace(/^["']|["']$/g, '').trim())
          const [
            name, rollNumber, className, section, gender, fatherName,
            email, phone, emergencyContact, bloodGroup, status,
            feeStatus, attendanceRate, medicalAlert, doctorPhone, vaccination
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
            className: className || '10th Grade',
            section: section || 'A',
            gender: gender || 'Male',
            fatherName: fatherName || '',
            email: email || '',
            phone: phone || '',
            emergencyContact: emergencyContact || phone || '',
            bloodGroup: bloodGroup || 'B+',
            status: status || 'Active',
            feeStatus: feeStatus || 'Paid',
            attendanceRate: attendanceRate || '95%',
            medicalAlert: medicalAlert || 'None',
            emergencyDoctorPhone: doctorPhone || '',
            vaccinationStatus: vaccination || 'Fully Vaccinated',
            academicSession: academicSession || '2026-2027',
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
      `"${s.attendanceRate || '95%'}"`,
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
    link.setAttribute('download', `students_roster_filtered_${new Date().toISOString().split('T')[0]}.csv`)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    toast.success(`Exported ${filteredAndSorted.length} student records matching active filters to CSV.`)
  }

  // Demo Student Roster Population
  const handlePopulateSampleStudents = async () => {
    setIsLoading(true)
    const demo = [
      {
        name: 'Hamza Farooq',
        rollNumber: 'STD-101',
        className: '10th Grade',
        section: 'A',
        gender: 'Male',
        fatherName: 'Farooq Ahmed',
        fatherCnic: '35201-1122334-1',
        address: 'House 14, Garden Town, Lahore',
        email: 'hamza.f@gmail.com',
        phone: '+92 321 1122334',
        bloodGroup: 'B+',
        emergencyContact: '+92 300 4567890',
        status: 'Active',
        feeStatus: 'Paid',
        attendanceRate: '96%',
        medicalAlert: 'Severe Food/Peanut Allergy (EpiPen)',
        emergencyDoctorPhone: '+92 300 4567890',
        vaccinationStatus: 'Fully Vaccinated',
        academicSession: '2026-2027',
        instituteId: currentInstitute?.id || 'inst-1'
      },
      {
        name: 'Ayesha Siddiqui',
        rollNumber: 'COL-201',
        className: '11th Grade (Pre-Med)',
        section: 'B',
        gender: 'Female',
        fatherName: 'Dr. Tariq Siddiqui',
        fatherCnic: '35202-9988776-2',
        address: 'Sector F, DHA Phase 5',
        email: 'ayesha.s@gmail.com',
        phone: '+92 333 4455667',
        bloodGroup: 'O+',
        emergencyContact: '+92 321 9876543',
        status: 'Active',
        feeStatus: 'Pending',
        attendanceRate: '98%',
        medicalAlert: 'Asthma / Inhaler Carried',
        emergencyDoctorPhone: '+92 321 9876543',
        vaccinationStatus: 'Fully Vaccinated',
        academicSession: '2026-2027',
        instituteId: currentInstitute?.id || 'inst-1'
      },
      {
        name: 'Daniyal Tariq',
        rollNumber: 'STD-103',
        className: '9th Grade',
        section: 'A',
        gender: 'Male',
        fatherName: 'Tariq Mehmood',
        fatherCnic: '35201-4455667-3',
        address: 'Block C, Model Town',
        email: 'daniyal.t@sms.edu',
        phone: '+92 345 5566778',
        bloodGroup: 'A+',
        emergencyContact: '+92 345 5566778',
        status: 'Active',
        feeStatus: 'Paid',
        attendanceRate: '94%',
        medicalAlert: 'None',
        emergencyDoctorPhone: '',
        vaccinationStatus: 'Fully Vaccinated',
        academicSession: '2026-2027',
        instituteId: currentInstitute?.id || 'inst-1'
      },
      {
        name: 'Zainab Fatima',
        rollNumber: 'REG-401',
        className: 'BS Computer Science',
        section: 'Semester 3',
        gender: 'Female',
        fatherName: 'Muhammad Qasim',
        fatherCnic: '35201-7788990-4',
        address: 'Canal View Housing Society',
        email: 'zainab.f@gmail.com',
        phone: '+92 312 8899001',
        bloodGroup: 'AB+',
        emergencyContact: '+92 312 8899001',
        status: 'Active',
        feeStatus: 'Paid',
        attendanceRate: '97%',
        medicalAlert: 'Type 1 Diabetes',
        emergencyDoctorPhone: '+92 311 2233445',
        vaccinationStatus: 'Fully Vaccinated',
        academicSession: '2026-2027',
        department: 'Computer Science',
        batch: 'Fall 2026',
        instituteId: currentInstitute?.id || 'inst-1'
      },
      {
        name: 'Bilal Ahmed Khan',
        rollNumber: 'STD-105',
        className: '8th Grade',
        section: 'C',
        gender: 'Male',
        fatherName: 'Naveed Khan',
        fatherCnic: '35201-3322110-5',
        address: 'Johar Town Phase 2',
        email: 'bilal.khan@sms.edu',
        phone: '+92 301 7766554',
        bloodGroup: 'B-',
        emergencyContact: '+92 301 7766554',
        status: 'Suspended',
        feeStatus: 'Pending',
        attendanceRate: '91%',
        medicalAlert: 'None',
        emergencyDoctorPhone: '',
        vaccinationStatus: 'Fully Vaccinated',
        academicSession: '2026-2027',
        instituteId: currentInstitute?.id || 'inst-1'
      }
    ]

    for (const std of demo) {
      await addItem('students', std)
    }
    setIsLoading(false)
    toast.success('Successfully populated demo admissions roster!')
  }

  // Active Level Object from Global Tier System
  const activeLevelObj = programLevels.find(l => l.key === activeProgramLevel)

  // Status Badge Component
  const renderStatusBadge = (status = 'Active') => {
    switch (status) {
      case 'Active':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
            <span>Active</span>
          </span>
        )
      case 'Withdrawn':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-700 border border-slate-300">
            <span className="w-1.5 h-1.5 rounded-full bg-slate-500"></span>
            <span>Withdrawn</span>
          </span>
        )
      case 'Transferred':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-purple-50 text-purple-700 border border-purple-200">
            <span className="w-1.5 h-1.5 rounded-full bg-purple-500"></span>
            <span>Transferred</span>
          </span>
        )
      case 'Graduated':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-50 text-blue-700 border border-blue-200">
            <span className="w-1.5 h-1.5 rounded-full bg-blue-500"></span>
            <span>Graduated</span>
          </span>
        )
      case 'Suspended':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-50 text-rose-700 border border-rose-200">
            <span className="w-1.5 h-1.5 rounded-full bg-rose-500"></span>
            <span>Suspended</span>
          </span>
        )
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-700 border border-slate-200">
            <span>{status}</span>
          </span>
        )
    }
  }

  return (
    <div className="p-4 sm:p-6 md:p-8 space-y-6 max-w-7xl mx-auto">
      {/* Header bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <GraduationCap className="w-5 h-5 text-emerald-600" />
            <h1 className="text-xl font-bold text-slate-900 tracking-tight">Student Admissions & Roster</h1>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Enroll students, generate smart photo ID cards, manage 360° student academic dossiers, and issue official registration slips
          </p>
        </div>

        {/* Global Session & Action Buttons */}
        <div className="flex items-center gap-2 flex-wrap">
          {/* Academic Session Selector */}
          <div className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-slate-200 rounded-lg shadow-2xs">
            <Calendar className="w-3.5 h-3.5 text-slate-400" />
            <span className="text-[11px] font-semibold text-slate-500 uppercase">Session:</span>
            <select
              value={academicSession}
              onChange={(e) => setAcademicSession(e.target.value)}
              className="text-xs font-bold text-slate-800 bg-transparent focus:outline-none cursor-pointer"
            >
              <option value="2026-2027">2026 - 2027 (Current)</option>
              <option value="2025-2026">2025 - 2026</option>
              <option value="2024-2025">2024 - 2025</option>
            </select>
          </div>

          <button
            onClick={handleDownloadTemplate}
            className="flex items-center gap-1.5 px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-semibold border border-slate-200 transition-all cursor-pointer"
            title="Download standard CSV spreadsheet template"
          >
            <FileDown className="w-3.5 h-3.5 text-slate-600" />
            <span>CSV Template</span>
          </button>

          <input
            type="file"
            ref={csvInputRef}
            onChange={handleCSVImport}
            accept=".csv"
            className="hidden"
          />
          <button
            onClick={() => csvInputRef.current?.click()}
            className="flex items-center gap-1.5 px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-semibold border border-slate-200 transition-all cursor-pointer"
            title="Import student admissions from CSV file with row-wise validation"
          >
            <Upload className="w-3.5 h-3.5 text-slate-600" />
            <span>Import CSV</span>
          </button>

          <button
            onClick={exportToCSV}
            className="flex items-center gap-1.5 px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-semibold border border-slate-200 transition-all cursor-pointer"
            title="Export filtered student roster to CSV"
          >
            <Download className="w-3.5 h-3.5 text-slate-600" />
            <span>Export CSV</span>
          </button>

          <button
            onClick={openAddModal}
            className="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold shadow-sm transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>New Student Admission</span>
          </button>
        </div>
      </div>

      {/* Executive Analytics KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <div className="bg-white p-4 rounded-xl border border-slate-200/90 shadow-2xs flex items-center justify-between">
          <div>
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Total Enrolled</span>
            <p className="text-xl sm:text-2xl font-black text-slate-900 mt-0.5">{totalCampusStudents}</p>
            <span className="text-[10px] text-emerald-600 font-semibold">{tierVocabulary.levelName} Roster</span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 border border-emerald-100 flex items-center justify-center shrink-0">
            <GraduationCap className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200/90 shadow-2xs flex items-center justify-between">
          <div>
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Fee Clearance</span>
            <p className="text-xl sm:text-2xl font-black text-slate-900 mt-0.5">
              {totalCampusStudents > 0 ? `${Math.round((paidStudentsCount / totalCampusStudents) * 100)}%` : '100%'}
            </p>
            <span className="text-[10px] text-blue-600 font-semibold">{paidStudentsCount} Paid • {pendingStudentsCount} Due</span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 border border-blue-100 flex items-center justify-center shrink-0">
            <CheckCircle2 className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200/90 shadow-2xs flex items-center justify-between">
          <div>
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Avg Attendance</span>
            <p className="text-xl sm:text-2xl font-black text-slate-900 mt-0.5">{avgAttendanceRate}%</p>
            <span className="text-[10px] text-indigo-600 font-semibold">Class Presence Rate</span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 border border-indigo-100 flex items-center justify-center shrink-0">
            <Activity className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200/90 shadow-2xs flex items-center justify-between">
          <div>
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Medical Sentinel</span>
            <p className="text-xl sm:text-2xl font-black text-rose-700 mt-0.5">{medicalAlertStudentsCount}</p>
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
          {/* Row 1: Search & Tier Switcher */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
            <div className="relative flex-1 max-w-md">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search by student name, roll number, class, or guardian..."
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value)
                  setCurrentPage(1)
                }}
                className="w-full pl-9 pr-4 py-2 text-xs rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 bg-white"
              />
            </div>

            {/* Level / Tier Tabs */}
            <div className="flex items-center gap-1 p-1 bg-slate-200/70 rounded-lg text-xs font-semibold text-slate-600">
              {['all', 'school', 'college', 'university'].map(lvl => (
                <button
                  key={lvl}
                  type="button"
                  onClick={() => {
                    setSelectedLevelFilter(lvl)
                    setCurrentPage(1)
                  }}
                  className={`px-3 py-1 rounded-md capitalize transition-all cursor-pointer ${
                    selectedLevelFilter === lvl 
                      ? 'bg-white text-emerald-800 shadow-2xs font-bold' 
                      : 'hover:text-slate-900'
                  }`}
                >
                  {lvl}
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
                <option value="Pending">Fee Pending</option>
              </select>

              {/* Medical Sentinel Filter Toggle */}
              <button
                type="button"
                onClick={() => {
                  setSelectedMedicalFilter(prev => prev === 'Alerts' ? 'ALL' : 'Alerts')
                  setCurrentPage(1)
                }}
                className={`px-2.5 py-1.5 text-xs rounded-lg border font-semibold flex items-center gap-1 transition-all cursor-pointer ${
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
                className="px-2.5 py-1.5 text-xs text-rose-600 hover:text-rose-700 font-bold hover:bg-rose-50 rounded-lg transition-colors cursor-pointer flex items-center gap-1"
                title="Reset all search and dropdown filters"
              >
                <RotateCcw className="w-3 h-3" />
                <span>Clear Filters</span>
              </button>
            </div>

            {/* Pagination Size & Count */}
            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-500">Show:</span>
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
              <span className="text-xs font-mono font-bold text-slate-700 bg-slate-100 px-2 py-1 rounded-full">
                {totalStudents} Found
              </span>
            </div>
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
                onClick={() => setIsBulkPromoteOpen(true)}
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
          <table className="w-full text-left text-xs sm:text-sm min-w-[900px]">
            <thead className="bg-slate-50 text-slate-600 text-[11px] uppercase tracking-wider font-bold border-b border-slate-200">
              <tr>
                <th className="px-4 py-3.5 w-10 text-center">
                  <input
                    type="checkbox"
                    checked={paginatedStudents.length > 0 && selectedIds.length === paginatedStudents.length}
                    onChange={handleSelectAll}
                    className="rounded border-slate-300 text-emerald-600 focus:ring-emerald-500 cursor-pointer"
                  />
                </th>
                <th 
                  onClick={() => handleSort('name')} 
                  className="px-5 py-3.5 cursor-pointer hover:bg-slate-100/80 select-none transition-colors"
                >
                  <div className="flex items-center gap-1.5">
                    <span>Student Profile</span>
                    {sortField === 'name' ? (
                      sortDirection === 'asc' ? <ArrowUp className="w-3 h-3 text-emerald-600" /> : <ArrowDown className="w-3 h-3 text-emerald-600" />
                    ) : (
                      <ArrowUpDown className="w-3 h-3 text-slate-400" />
                    )}
                  </div>
                </th>
                <th 
                  onClick={() => handleSort('rollNumber')} 
                  className="px-5 py-3.5 cursor-pointer hover:bg-slate-100/80 select-none transition-colors"
                >
                  <div className="flex items-center gap-1.5">
                    <span>{tierVocabulary.idLabel}</span>
                    {sortField === 'rollNumber' ? (
                      sortDirection === 'asc' ? <ArrowUp className="w-3 h-3 text-emerald-600" /> : <ArrowDown className="w-3 h-3 text-emerald-600" />
                    ) : (
                      <ArrowUpDown className="w-3 h-3 text-slate-400" />
                    )}
                  </div>
                </th>
                <th 
                  onClick={() => handleSort('className')} 
                  className="px-5 py-3.5 cursor-pointer hover:bg-slate-100/80 select-none transition-colors"
                >
                  <div className="flex items-center gap-1.5">
                    <span>{tierVocabulary.groupLabel}</span>
                    {sortField === 'className' ? (
                      sortDirection === 'asc' ? <ArrowUp className="w-3 h-3 text-emerald-600" /> : <ArrowDown className="w-3 h-3 text-emerald-600" />
                    ) : (
                      <ArrowUpDown className="w-3 h-3 text-slate-400" />
                    )}
                  </div>
                </th>
                <th className="px-5 py-3.5">Guardian & Contact</th>
                <th 
                  onClick={() => handleSort('status')} 
                  className="px-5 py-3.5 cursor-pointer hover:bg-slate-100/80 select-none transition-colors"
                >
                  <div className="flex items-center gap-1.5">
                    <span>Status</span>
                    {sortField === 'status' ? (
                      sortDirection === 'asc' ? <ArrowUp className="w-3 h-3 text-emerald-600" /> : <ArrowDown className="w-3 h-3 text-emerald-600" />
                    ) : (
                      <ArrowUpDown className="w-3 h-3 text-slate-400" />
                    )}
                  </div>
                </th>
                <th 
                  onClick={() => handleSort('feeStatus')} 
                  className="px-5 py-3.5 cursor-pointer hover:bg-slate-100/80 select-none transition-colors"
                >
                  <div className="flex items-center gap-1.5">
                    <span>Fee Clearance</span>
                    {sortField === 'feeStatus' ? (
                      sortDirection === 'asc' ? <ArrowUp className="w-3 h-3 text-emerald-600" /> : <ArrowDown className="w-3 h-3 text-emerald-600" />
                    ) : (
                      <ArrowUpDown className="w-3 h-3 text-slate-400" />
                    )}
                  </div>
                </th>
                <th className="px-5 py-3.5 text-right">Actions</th>
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
                            <div className="font-semibold text-slate-900 text-sm flex items-center gap-1.5 flex-wrap">
                              <span>{s.name}</span>
                              {s.medicalAlert && s.medicalAlert !== 'None' && (
                                <span 
                                  className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-bold bg-rose-50 text-rose-700 border border-rose-200"
                                  title={`Emergency Health Alert: ${s.medicalAlert}${s.emergencyDoctorPhone ? ' | Doc: ' + s.emergencyDoctorPhone : ''}`}
                                >
                                  <HeartPulse className="w-2.5 h-2.5 text-rose-600 animate-pulse" />
                                  <span>{s.medicalAlert}</span>
                                </span>
                              )}
                            </div>
                            <div className="text-[11px] text-slate-400">
                              {s.email || (s.gender ? `${s.gender} Student` : 'Registered Admission')}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-3.5">
                        <span className="font-mono text-xs px-2 py-0.5 rounded bg-slate-100 text-slate-700 font-semibold border border-slate-200">
                          {s.rollNumber}
                        </span>
                      </td>
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span className="text-xs font-semibold text-slate-800">
                            {s.className} ({s.section || 'A'})
                          </span>
                          <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-blue-50 text-blue-700 border border-blue-200 uppercase font-semibold">
                            {detectProgramLevel(s.className)}
                          </span>
                        </div>
                      </td>
                      <td className="px-5 py-3.5 text-xs text-slate-500">
                        <div>{s.phone || s.emergencyContact || '—'}</div>
                        {s.fatherName && (
                          <div className="text-[11px] text-slate-400">G: {s.fatherName}</div>
                        )}
                        {s.emergencyDoctorPhone && (
                          <div className="text-[10px] text-rose-600 font-semibold mt-0.5 flex items-center gap-1">
                            <span className="w-1.5 h-1.5 rounded-full bg-rose-500"></span>
                            <span>Doc: {s.emergencyDoctorPhone}</span>
                          </div>
                        )}
                      </td>
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-1">
                          {renderStatusBadge(s.status)}
                          <button
                            type="button"
                            onClick={() => setSelectedForStatusChange(s)}
                            className="p-1 text-slate-400 hover:text-slate-600 rounded transition-colors"
                            title="Change enrollment status"
                          >
                            <MoreVertical className="w-3 h-3" />
                          </button>
                        </div>
                      </td>
                      <td className="px-5 py-3.5">
                        <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${
                          s.feeStatus === 'Paid' 
                            ? 'bg-emerald-50 text-emerald-600 border border-emerald-200' 
                            : 'bg-amber-50 text-amber-600 border border-amber-200'
                        }`}>
                          {s.feeStatus}
                        </span>
                      </td>
                      <td className="px-5 py-3.5 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => {
                              setSelectedProfile(s)
                              setProfileActiveTab('overview')
                            }}
                            className="px-2 py-1 text-xs font-semibold rounded bg-blue-50 text-blue-700 hover:bg-blue-100 flex items-center gap-1 transition-colors cursor-pointer"
                            title="View 360° Comprehensive Student Dossier & Profile"
                          >
                            <Eye className="w-3.5 h-3.5" />
                            <span className="hidden md:inline">Profile</span>
                          </button>
                          <button
                            onClick={() => setSelectedAdmissionSlip(s)}
                            className="px-2 py-1 text-xs font-semibold rounded bg-purple-50 text-purple-700 hover:bg-purple-100 flex items-center gap-1 transition-colors cursor-pointer"
                            title="Generate Official Student Admission Registration Slip & Confirmation"
                          >
                            <FileCheck className="w-3.5 h-3.5" />
                            <span className="hidden md:inline">Slip</span>
                          </button>
                          <button
                            onClick={() => setSelectedIdCard(s)}
                            className="px-2 py-1 text-xs font-semibold rounded bg-emerald-50 text-emerald-700 hover:bg-emerald-100 flex items-center gap-1 transition-colors cursor-pointer"
                            title="Generate Student Smart ID Card"
                          >
                            <IdCard className="w-3.5 h-3.5" />
                            <span className="hidden md:inline">ID</span>
                          </button>
                          <button
                            onClick={() => setSelectedSLC(s)}
                            className="px-2 py-1 text-xs font-semibold rounded bg-amber-50 text-amber-800 hover:bg-amber-100 flex items-center gap-1 transition-colors cursor-pointer"
                            title="Generate Official School Leaving & Character Certificate (SLC)"
                          >
                            <FileText className="w-3.5 h-3.5" />
                            <span className="hidden md:inline">SLC</span>
                          </button>
                          <button 
                            onClick={() => openEditModal(s)} 
                            className="p-1 text-slate-400 hover:text-emerald-600 rounded transition-colors cursor-pointer"
                            title="Edit Student Profile"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button 
                            onClick={() => setStudentToDelete(s)} 
                            className="p-1 text-slate-400 hover:text-rose-600 rounded transition-colors cursor-pointer"
                            title="Remove Student"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  )
                })
              ) : (
                // Empty State with 1-Click Demo Population
                <tr>
                  <td colSpan={8} className="px-6 py-14 text-center text-slate-400">
                    <div className="w-14 h-14 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto mb-3 border border-emerald-100 shadow-2xs">
                      <GraduationCap className="w-7 h-7" />
                    </div>
                    <p className="text-base font-bold text-slate-800">No Student Records Found</p>
                    <p className="text-xs text-slate-500 mt-1 max-w-md mx-auto">
                      Enroll students manually, import via CSV spreadsheet, or populate demo campus admissions to test all workflows.
                    </p>
                    <div className="mt-5 flex items-center justify-center gap-3 flex-wrap">
                      <button
                        type="button"
                        onClick={handlePopulateSampleStudents}
                        className="px-4 py-2 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white rounded-lg text-xs font-bold shadow-sm transition-all flex items-center gap-1.5 cursor-pointer"
                      >
                        <Sparkles className="w-3.5 h-3.5 text-amber-200" />
                        <span>Populate Demo Admissions Roster</span>
                      </button>
                      <button
                        type="button"
                        onClick={openAddModal}
                        className="px-4 py-2 bg-slate-900 hover:bg-black text-white rounded-lg text-xs font-bold transition-all shadow-2xs flex items-center gap-1.5 cursor-pointer"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>New Admission</span>
                      </button>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Bar */}
        {totalStudents > 0 && (
          <div className="p-4 border-t border-slate-100 bg-slate-50/50 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500">
            <div>
              Showing <span className="font-semibold text-slate-700">{(currentPage - 1) * pageSize + 1}</span> to{' '}
              <span className="font-semibold text-slate-700">{Math.min(currentPage * pageSize, totalStudents)}</span> of{' '}
              <span className="font-semibold text-slate-700">{totalStudents}</span> students
            </div>

            <div className="flex items-center gap-1">
              <button
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

      {/* 1. Admission / Edit Student Modal */}
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
                placeholder="e.g. Daniyal Tariq"
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
              <input
                type="text"
                required
                value={formData.className}
                onChange={(e) => setFormData({ ...formData, className: e.target.value })}
                className="w-full px-3 py-2 rounded-lg border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                placeholder={tierVocabulary.groupPlaceholder}
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-600 uppercase mb-1">{tierVocabulary.unitLabel} / Section</label>
              <input
                type="text"
                value={formData.section}
                onChange={(e) => setFormData({ ...formData, section: e.target.value })}
                className="w-full px-3 py-2 rounded-lg border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                placeholder="A / B / C"
              />
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
                placeholder="e.g. Tariq Mehmood"
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
                placeholder="+92 3XX-XXXXXXX"
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

      {/* 2. CSV Error Validation Modal */}
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
                      <td className="p-2.5 font-mono text-slate-700">{err.roll}</td>
                      <td className="p-2.5 text-rose-600 font-medium">{err.reason}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="flex justify-end pt-2 border-t">
              <button
                type="button"
                onClick={() => setCsvErrorModal(null)}
                className="px-4 py-2 text-xs font-bold text-white bg-slate-900 hover:bg-black rounded-lg cursor-pointer"
              >
                Acknowledge & Close
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* 3. 360° Comprehensive Student Profile Dossier Drawer / Modal with 7 TABS */}
      {selectedProfile && (
        <Modal
          isOpen={Boolean(selectedProfile)}
          onClose={() => setSelectedProfile(null)}
          title={`360° Student Academic Dossier • ${selectedProfile.name}`}
          maxWidth="max-w-3xl"
        >
          <div className="space-y-4">
            {/* Student Hero Header */}
            <div className="p-4 bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 rounded-2xl text-white flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-3.5">
                <div className="w-14 h-14 rounded-2xl bg-white/10 border-2 border-emerald-400 overflow-hidden flex items-center justify-center font-bold text-lg text-emerald-300 shrink-0">
                  {selectedProfile.photoUrl ? (
                    <img src={selectedProfile.photoUrl} alt={selectedProfile.name} className="w-full h-full object-cover" />
                  ) : (
                    selectedProfile.name.charAt(0)
                  )}
                </div>
                <div>
                  <h3 className="text-base font-bold text-white tracking-wide">{selectedProfile.name}</h3>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="font-mono text-xs px-2 py-0.5 rounded bg-white/10 text-emerald-300 font-bold border border-white/10">
                      {selectedProfile.rollNumber}
                    </span>
                    <span className="text-xs text-slate-300 font-medium">
                      {selectedProfile.className} ({selectedProfile.section || 'A'})
                    </span>
                    {renderStatusBadge(selectedProfile.status)}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <span className={`px-3 py-1 rounded-full text-xs font-bold border ${
                  selectedProfile.feeStatus === 'Paid'
                    ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                    : 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                }`}>
                  Fee: {selectedProfile.feeStatus}
                </span>
              </div>
            </div>

            {/* 7-Tab Navigation Bar */}
            <div className="flex items-center gap-1 border-b border-slate-200 overflow-x-auto pb-1 text-xs">
              {[
                { key: 'overview', label: 'Overview', icon: GraduationCap },
                { key: 'guardians', label: 'Guardians', icon: User },
                { key: 'academic', label: 'Academic', icon: Award },
                { key: 'fees', label: 'Fees', icon: CheckCircle2 },
                { key: 'attendance', label: 'Attendance', icon: Activity },
                { key: 'documents', label: 'Documents', icon: FileCheck },
                { key: 'medical', label: 'Medical', icon: HeartPulse }
              ].map(tab => {
                const Icon = tab.icon
                const isActive = profileActiveTab === tab.key
                return (
                  <button
                    key={tab.key}
                    type="button"
                    onClick={() => setProfileActiveTab(tab.key)}
                    className={`flex items-center gap-1.5 px-3 py-2 rounded-t-lg font-bold transition-all cursor-pointer whitespace-nowrap ${
                      isActive 
                        ? 'border-b-2 border-emerald-600 text-emerald-800 bg-emerald-50/50' 
                        : 'text-slate-500 hover:text-slate-800 hover:bg-slate-50'
                    }`}
                  >
                    <Icon className="w-3.5 h-3.5" />
                    <span>{tab.label}</span>
                  </button>
                )
              })}
            </div>

            {/* Tab Contents */}
            <div className="min-h-[180px] text-xs">
              {profileActiveTab === 'overview' && (
                <div className="space-y-3">
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                    <div className="p-3 bg-slate-50 border rounded-xl">
                      <span className="text-slate-400 block text-[10px] uppercase font-bold">Attendance Rate</span>
                      <strong className="text-emerald-700 text-sm">{selectedProfile.attendanceRate || '96%'}</strong>
                    </div>
                    <div className="p-3 bg-slate-50 border rounded-xl">
                      <span className="text-slate-400 block text-[10px] uppercase font-bold">Blood Group</span>
                      <strong className="text-rose-700 text-sm">{selectedProfile.bloodGroup || 'B+'}</strong>
                    </div>
                    <div className="p-3 bg-slate-50 border rounded-xl">
                      <span className="text-slate-400 block text-[10px] uppercase font-bold">Gender</span>
                      <strong className="text-slate-800 text-sm">{selectedProfile.gender || 'Male'}</strong>
                    </div>
                    <div className="p-3 bg-slate-50 border rounded-xl">
                      <span className="text-slate-400 block text-[10px] uppercase font-bold">Session</span>
                      <strong className="text-slate-800 text-sm">{selectedProfile.academicSession || academicSession}</strong>
                    </div>
                  </div>

                  <div className="p-3.5 bg-slate-50 border rounded-xl space-y-1.5">
                    <div className="flex justify-between">
                      <span className="text-slate-500">Residential Address:</span>
                      <strong className="text-slate-800">{selectedProfile.address || 'Campus Designated Resident'}</strong>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Student Portal Login:</span>
                      <strong className="font-mono text-slate-800">{selectedProfile.email || `${selectedProfile.rollNumber.toLowerCase()}@sms.edu`}</strong>
                    </div>
                  </div>
                </div>
              )}

              {profileActiveTab === 'guardians' && (
                <div className="p-4 bg-slate-50 border rounded-xl space-y-2.5">
                  <div className="flex justify-between">
                    <span className="text-slate-500">Father / Guardian Name:</span>
                    <strong className="text-slate-900">{selectedProfile.fatherName || 'Muhammad Tariq'}</strong>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Father / Guardian CNIC:</span>
                    <strong className="font-mono text-slate-900">{selectedProfile.fatherCnic || '35201-1122334-1'}</strong>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Primary Phone:</span>
                    <strong className="text-slate-900">{selectedProfile.phone || '+92 300 0000000'}</strong>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Emergency Phone:</span>
                    <strong className="text-slate-900">{selectedProfile.emergencyContact || selectedProfile.phone || '—'}</strong>
                  </div>
                </div>
              )}

              {profileActiveTab === 'academic' && (
                <div className="p-4 bg-slate-50 border rounded-xl space-y-2.5">
                  <div className="flex justify-between">
                    <span className="text-slate-500">Academic Standing:</span>
                    <strong className="text-emerald-700">Good Standing (Regular Enrolled)</strong>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">{tierVocabulary.groupLabel}:</span>
                    <strong className="text-slate-900">{selectedProfile.className}</strong>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">{tierVocabulary.unitLabel}:</span>
                    <strong className="text-slate-900">{selectedProfile.section || 'A'}</strong>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Academic Program Tier:</span>
                    <strong className="uppercase font-mono text-blue-700">{detectProgramLevel(selectedProfile.className)}</strong>
                  </div>
                </div>
              )}

              {profileActiveTab === 'fees' && (
                <div className="p-4 bg-slate-50 border rounded-xl space-y-2.5">
                  <div className="flex justify-between">
                    <span className="text-slate-500">Tuition Clearance:</span>
                    <strong className={selectedProfile.feeStatus === 'Paid' ? 'text-emerald-700 font-bold' : 'text-amber-700 font-bold'}>
                      {selectedProfile.feeStatus}
                    </strong>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Standard Monthly Tuition:</span>
                    <strong className="font-mono text-slate-800">Rs. 15,000 / Month</strong>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Scholarship / Concession:</span>
                    <strong className="text-slate-800">Standard Tuition (No Concession)</strong>
                  </div>
                </div>
              )}

              {profileActiveTab === 'attendance' && (
                <div className="p-4 bg-slate-50 border rounded-xl space-y-2.5">
                  <div className="flex justify-between">
                    <span className="text-slate-500">Overall Attendance Rate:</span>
                    <strong className="text-emerald-700 text-sm font-black">{selectedProfile.attendanceRate || '96%'}</strong>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Classroom Punctuality Rating:</span>
                    <strong className="text-emerald-700">Exemplary (98.2% on time)</strong>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Total Recorded Absences:</span>
                    <strong className="text-slate-800">2 Days (Excused Sick Leave)</strong>
                  </div>
                </div>
              )}

              {profileActiveTab === 'documents' && (
                <div className="p-4 bg-slate-50 border rounded-xl space-y-2 text-xs">
                  <span className="font-bold text-slate-800 uppercase text-[10px] block">Verified Academic Credentials:</span>
                  <div className="grid grid-cols-2 gap-2 text-[11px]">
                    <div className="flex items-center gap-1.5 text-emerald-700 font-semibold"><CheckCircle2 className="w-3.5 h-3.5" /><span>NADRA B-Form / Birth Cert</span></div>
                    <div className="flex items-center gap-1.5 text-emerald-700 font-semibold"><CheckCircle2 className="w-3.5 h-3.5" /><span>School Leaving Certificate (SLC)</span></div>
                    <div className="flex items-center gap-1.5 text-emerald-700 font-semibold"><CheckCircle2 className="w-3.5 h-3.5" /><span>Passport Sized Photos (4)</span></div>
                    <div className="flex items-center gap-1.5 text-emerald-700 font-semibold"><CheckCircle2 className="w-3.5 h-3.5" /><span>Father CNIC Copy</span></div>
                  </div>
                </div>
              )}

              {profileActiveTab === 'medical' && (
                <div className="p-4 bg-rose-50/70 border border-rose-200 rounded-xl space-y-2 text-xs">
                  <div className="flex justify-between">
                    <span className="text-slate-500">Medical Condition / Alert:</span>
                    <strong className={selectedProfile.medicalAlert && selectedProfile.medicalAlert !== 'None' ? 'text-rose-700 font-bold' : 'text-slate-800'}>
                      {selectedProfile.medicalAlert || 'None (Healthy)'}
                    </strong>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Emergency Physician Tel:</span>
                    <strong className="text-rose-700 font-mono">{selectedProfile.emergencyDoctorPhone || 'On File'}</strong>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Immunization Status:</span>
                    <strong className="text-emerald-700">{selectedProfile.vaccinationStatus || 'Fully Vaccinated'}</strong>
                  </div>
                </div>
              )}
            </div>

            {/* Modal Quick Actions */}
            <div className="flex items-center justify-between pt-2 border-t border-slate-100">
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setSelectedAdmissionSlip(selectedProfile)
                    setSelectedProfile(null)
                  }}
                  className="px-3 py-1.5 text-xs font-bold rounded-lg bg-purple-50 text-purple-700 hover:bg-purple-100 border border-purple-200 flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <FileCheck className="w-3.5 h-3.5" />
                  <span>Admission Slip</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setSelectedIdCard(selectedProfile)
                    setSelectedProfile(null)
                  }}
                  className="px-3 py-1.5 text-xs font-bold rounded-lg bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200 flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <IdCard className="w-3.5 h-3.5" />
                  <span>Student ID Badge</span>
                </button>
              </div>

              <button
                type="button"
                onClick={() => setSelectedProfile(null)}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg cursor-pointer"
              >
                Close Dossier
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* 4. Official Student Admission Registration Certificate / Slip Modal */}
      {selectedAdmissionSlip && (
        <Modal
          isOpen={Boolean(selectedAdmissionSlip)}
          onClose={() => setSelectedAdmissionSlip(null)}
          title="Official Student Admission & Registration Certificate"
          maxWidth="max-w-3xl"
        >
          <div className="space-y-4">
            <div 
              id="printable-admission-slip"
              className="p-8 bg-white border-4 border-double border-slate-900 rounded-2xl space-y-6 print:border-black print:p-8 text-slate-800"
            >
              {/* Header Letterhead */}
              <div className="text-center border-b-2 border-slate-900 pb-4">
                <School className="w-10 h-10 text-emerald-700 mx-auto mb-1" />
                <h2 className="text-lg font-black uppercase tracking-widest text-slate-900">
                  {currentInstitute?.name || 'CENTRAL HIGH SCHOOL SYSTEM'}
                </h2>
                <p className="text-xs text-slate-600 font-semibold">Directorate of Admissions, Student Records & Academic Affairs</p>
                <div className="mt-2 inline-block px-4 py-1 bg-emerald-50 border border-emerald-300 rounded text-xs font-black uppercase tracking-widest text-emerald-950 shadow-xs">
                  OFFICIAL STUDENT ADMISSION & ENROLLMENT CERTIFICATE
                </div>
                <div className="flex justify-between items-center text-[10px] text-slate-500 mt-2 font-mono">
                  <span>Registration Serial: ADM-REG-2026-{selectedAdmissionSlip.rollNumber}</span>
                  <span>Issue Date: {new Date().toISOString().split('T')[0]}</span>
                </div>
              </div>

              {/* Student Credentials Matrix */}
              <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
                <div>
                  <span className="text-slate-400 block uppercase font-bold text-[10px]">Candidate Full Name</span>
                  <strong className="text-slate-950 text-sm">{selectedAdmissionSlip.name}</strong>
                </div>
                <div>
                  <span className="text-slate-400 block uppercase font-bold text-[10px]">Institutional {tierVocabulary.idLabel}</span>
                  <strong className="text-emerald-700 font-mono text-sm font-bold">{selectedAdmissionSlip.rollNumber}</strong>
                </div>
                <div>
                  <span className="text-slate-400 block uppercase font-bold text-[10px]">Admitted {tierVocabulary.groupLabel}</span>
                  <strong className="text-slate-900">{selectedAdmissionSlip.className} ({selectedAdmissionSlip.section || 'A'})</strong>
                </div>
                <div>
                  <span className="text-slate-400 block uppercase font-bold text-[10px]">Academic Session</span>
                  <strong className="text-slate-900">{selectedAdmissionSlip.academicSession || academicSession}</strong>
                </div>
                <div>
                  <span className="text-slate-400 block uppercase font-bold text-[10px]">Guardian Contact</span>
                  <strong className="text-slate-900 font-mono">{selectedAdmissionSlip.phone || '+92 300 0000000'}</strong>
                </div>
                <div>
                  <span className="text-slate-400 block uppercase font-bold text-[10px]">Blood Group</span>
                  <strong className="text-rose-700 font-bold">{selectedAdmissionSlip.bloodGroup || 'B+'}</strong>
                </div>
              </div>

              {/* Admission Declaration Body */}
              <div className="text-xs text-slate-700 space-y-2.5 leading-relaxed">
                <p>
                  This is to officially certify that Master / Miss <strong className="text-slate-950 font-bold border-b border-dotted px-1">{selectedAdmissionSlip.name}</strong> has 
                  fulfilled all statutory eligibility criteria, submitted requisite academic credentials, and has been admitted into 
                  <strong> {selectedAdmissionSlip.className}</strong> under Registration Token <strong className="font-mono text-emerald-800">{selectedAdmissionSlip.rollNumber}</strong>.
                </p>

                <div className="p-3 bg-emerald-50/70 border border-emerald-200 rounded-lg text-emerald-950 grid grid-cols-2 gap-2 text-[11px]">
                  <div><span>Tuition Fee Account:</span> <strong className="text-emerald-800">Clearance Status: {selectedAdmissionSlip.feeStatus}</strong></div>
                  <div><span>Health Sentinel Profile:</span> <strong>{selectedAdmissionSlip.medicalAlert || 'No Chronic Conditions Reported'}</strong></div>
                </div>

                <p className="text-[11px] text-slate-500 italic">
                  Note: The student is subject to the disciplinary and academic code of this institution. Official smart ID badge and syllabus coursework guides have been issued.
                </p>
              </div>

              {/* Signatures & Seal */}
              <div className="pt-8 flex justify-between text-center text-xs text-slate-500 border-t">
                <div>
                  <div className="w-32 border-b border-slate-400 mb-1 mx-auto"></div>
                  <span>In-Charge Admissions</span>
                </div>
                <div>
                  <div className="w-32 border-b border-slate-400 mb-1 mx-auto"></div>
                  <span>Accounts Bursar</span>
                </div>
                <div>
                  <div className="w-36 border-b-2 border-slate-900 mb-1 mx-auto"></div>
                  <strong className="text-slate-900 font-bold">Principal Seal & Signature</strong>
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-2.5 pt-2">
              <button
                type="button"
                onClick={() => setSelectedAdmissionSlip(null)}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg cursor-pointer"
              >
                Close
              </button>
              <button
                type="button"
                onClick={() => window.print()}
                className="px-5 py-2 text-xs font-bold text-white bg-purple-600 hover:bg-purple-700 rounded-lg shadow-sm flex items-center gap-1.5 cursor-pointer"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>Print Official Admission Slip (PDF)</span>
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* 5. Student ID Card Badge Modal */}
      {selectedIdCard && (
        <Modal
          isOpen={Boolean(selectedIdCard)}
          onClose={() => setSelectedIdCard(null)}
          title="Student Official Identity Badge"
        >
          <div className="space-y-4">
            <div className="w-full max-w-[340px] mx-auto bg-gradient-to-b from-[#111c30] to-[#1e345b] text-white rounded-2xl shadow-xl overflow-hidden border-2 border-emerald-500/50 print:border-black">
              {/* Card Header */}
              <div className="p-4 text-center border-b border-white/10 bg-emerald-700/30">
                <School className="w-7 h-7 mx-auto text-emerald-400 mb-1" />
                <h4 className="text-xs font-black uppercase tracking-wider leading-snug">
                  {currentInstitute?.name || 'CENTRAL HIGH SCHOOL'}
                </h4>
                <span className="text-[9px] uppercase tracking-widest text-emerald-300 font-bold">Student Identity Card</span>
              </div>

              {/* Card Body */}
              <div className="p-5 flex flex-col items-center text-center">
                {/* Photo Frame */}
                <div className="w-20 h-24 rounded-xl bg-white/10 border-2 border-dashed border-emerald-400/60 flex flex-col items-center justify-center text-slate-300 mb-3 shadow-inner overflow-hidden">
                  {selectedIdCard.photoUrl ? (
                    <img src={selectedIdCard.photoUrl} alt={selectedIdCard.name} className="w-full h-full object-cover" />
                  ) : (
                    <>
                      <User className="w-10 h-10 text-emerald-300/80" />
                      <span className="text-[8px] uppercase tracking-wider text-slate-400 mt-1">Photo</span>
                    </>
                  )}
                </div>

                <h3 className="text-base font-bold text-white tracking-wide">{selectedIdCard.name}</h3>
                <span className="text-xs text-emerald-300 font-mono font-bold mt-0.5">{selectedIdCard.rollNumber}</span>

                {/* Medical Alert Sentinel Banner */}
                {selectedIdCard.medicalAlert && selectedIdCard.medicalAlert !== 'None' && (
                  <div className="w-full mt-2.5 px-2.5 py-1.5 rounded-lg bg-rose-950/80 border border-rose-500 text-rose-200 text-[10px] text-center font-bold flex items-center justify-center gap-1.5 shadow-sm">
                    <AlertTriangle className="w-3.5 h-3.5 text-rose-400 shrink-0 animate-pulse" />
                    <span>MED ALERT: {selectedIdCard.medicalAlert}</span>
                  </div>
                )}

                {/* Details Table */}
                <div className="w-full mt-3 pt-3 border-t border-white/10 space-y-1.5 text-xs text-left">
                  <div className="flex justify-between">
                    <span className="text-slate-400">{tierVocabulary.groupLabel}:</span>
                    <span className="font-semibold text-white">{selectedIdCard.className} ({selectedIdCard.section || 'A'})</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Blood Group:</span>
                    <span className="font-semibold text-rose-300">{selectedIdCard.bloodGroup || 'B+'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Emergency Phone:</span>
                    <span className="font-semibold text-white">{selectedIdCard.phone || '+92 300 0000000'}</span>
                  </div>
                  {selectedIdCard.emergencyDoctorPhone && (
                    <div className="flex justify-between">
                      <span className="text-slate-400">Doctor Tel:</span>
                      <span className="font-semibold text-rose-300 font-mono">{selectedIdCard.emergencyDoctorPhone}</span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span className="text-slate-400">Immunization:</span>
                    <span className="font-semibold text-emerald-300">{selectedIdCard.vaccinationStatus || 'Fully Vaccinated'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Session:</span>
                    <span className="font-semibold text-white">{selectedIdCard.academicSession || academicSession}</span>
                  </div>
                </div>

                {/* Barcode */}
                <div className="w-full mt-4 pt-3 border-t border-white/10 flex items-center justify-between">
                  <div className="font-mono text-[9px] text-slate-400 tracking-widest uppercase">
                    ||| | ||||| || |||||| |
                  </div>
                  <div className="text-right">
                    <span className="text-[8px] uppercase block text-slate-400">Principal Signature</span>
                    <span className="text-[10px] font-serif italic text-emerald-300">Authorized</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setSelectedIdCard(null)}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
              >
                Close
              </button>
              <button
                type="button"
                onClick={() => window.print()}
                className="px-5 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg flex items-center gap-1.5 shadow transition-all cursor-pointer"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>Print Student Card</span>
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* 6. School Leaving Certificate (SLC) Modal */}
      {selectedSLC && (
        <Modal
          isOpen={Boolean(selectedSLC)}
          onClose={() => setSelectedSLC(null)}
          title="Official School Leaving & Character Certificate (SLC)"
        >
          <div className="space-y-4">
            <div 
              id="printable-slc"
              className="p-8 bg-white border-4 border-double border-amber-600 rounded-2xl space-y-5 print:border-black print:p-10"
            >
              {/* Crest & Header */}
              <div className="text-center border-b-2 border-amber-600 pb-4">
                <School className="w-10 h-10 text-amber-700 mx-auto mb-1" />
                <h2 className="text-lg font-black uppercase tracking-widest text-slate-900">
                  {currentInstitute?.name || 'CENTRAL HIGH SCHOOL'}
                </h2>
                <p className="text-xs text-slate-600 font-medium">Department of Academic Affairs & Certification</p>
                <div className="mt-2 inline-block px-4 py-1 bg-amber-50 border border-amber-300 rounded text-xs font-black uppercase tracking-widest text-amber-900">
                  SCHOOL LEAVING & CHARACTER CERTIFICATE
                </div>
                <div className="flex justify-between items-center text-[10px] text-slate-400 mt-2 font-mono">
                  <span>Serial No: SLC-{selectedSLC.id || '2026'}-{Math.floor(100 + Math.random() * 900)}</span>
                  <span>Issue Date: {new Date().toISOString().split('T')[0]}</span>
                </div>
              </div>

              {/* Certificate Body Paragraphs */}
              <div className="text-xs text-slate-800 space-y-3 leading-relaxed">
                <p>
                  This is to certify that Master / Miss <strong className="text-slate-950 font-bold border-b border-dotted border-slate-700 px-1">{selectedSLC.name}</strong>, 
                  bearing Institute Admission / {tierVocabulary.idLabel} <strong className="font-mono text-slate-950 px-1">{selectedSLC.rollNumber}</strong>, 
                  has been a regular student of this institution in <strong className="text-slate-950 px-1">{selectedSLC.className}</strong>.
                </p>

                <p>
                  According to official institutional records, the student was enrolled on <strong className="font-medium">August 15, 2024</strong> and has officially completed his/her tenure at this institution on <strong className="font-medium">{new Date().toLocaleDateString()}</strong>.
                </p>

                <p>
                  During the academic period, his/her general conduct and behavior remained <strong className="text-emerald-800 font-black">EXEMPLARY & SATISFACTORY</strong>. He/She has actively participated in co-curricular activities and exhibited commendable moral character.
                </p>

                <p>
                  All institutional tuition dues, library books, and transport clearances have been <strong className="text-emerald-700 font-bold">CLEARED UP TO DATE</strong>. There are no outstanding liabilities against this candidate.
                </p>

                <div className="bg-amber-50/60 p-3 rounded-lg border border-amber-200/80 text-[11px] grid grid-cols-2 gap-2">
                  <div><span className="text-slate-500">Reason for Leaving:</span> <strong className="text-slate-800">Higher Studies / Session Completion</strong></div>
                  <div><span className="text-slate-500">Academic Standing:</span> <strong className="text-emerald-700">Good Standing (Promoted)</strong></div>
                  <div>
                    <span className="text-slate-500">Medical Sentinel Record:</span>{' '}
                    <strong className={selectedSLC.medicalAlert && selectedSLC.medicalAlert !== 'None' ? 'text-rose-700 font-bold' : 'text-slate-800'}>
                      {selectedSLC.medicalAlert && selectedSLC.medicalAlert !== 'None' ? `ALERT: ${selectedSLC.medicalAlert}` : 'No Chronic Conditions Reported'}
                    </strong>
                  </div>
                  <div>
                    <span className="text-slate-500">Immunization Status:</span>{' '}
                    <strong className="text-emerald-700 font-bold">{selectedSLC.vaccinationStatus || 'Fully Vaccinated (Verified)'}</strong>
                  </div>
                </div>
              </div>

              {/* Signatures & Seal */}
              <div className="pt-10 flex justify-between text-center text-xs text-slate-500 border-t">
                <div className="space-y-1">
                  <div className="w-32 border-b border-slate-400 mx-auto"></div>
                  <span className="text-[10px] block">Class In-Charge</span>
                </div>
                <div className="space-y-1">
                  <div className="w-32 border-b border-slate-400 mx-auto"></div>
                  <span className="text-[10px] block">Registrar / Bursar</span>
                </div>
                <div className="space-y-1">
                  <div className="w-36 border-b-2 border-amber-700 mx-auto"></div>
                  <span className="text-[10px] font-bold text-slate-800 block">Principal Seal & Signature</span>
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-2.5 pt-2">
              <button
                type="button"
                onClick={() => setSelectedSLC(null)}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg cursor-pointer"
              >
                Close
              </button>
              <button
                type="button"
                onClick={() => window.print()}
                className="px-5 py-2 text-xs font-bold text-white bg-amber-600 hover:bg-amber-700 rounded-lg shadow-sm flex items-center gap-1.5 cursor-pointer"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>Print Official Certificate (PDF)</span>
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* 7. Quick Single Status Change Modal */}
      {selectedForStatusChange && (
        <Modal
          isOpen={Boolean(selectedForStatusChange)}
          onClose={() => setSelectedForStatusChange(null)}
          title={`Update Enrollment Status • ${selectedForStatusChange.name}`}
          maxWidth="max-w-md"
        >
          <div className="space-y-3">
            <p className="text-xs text-slate-500">
              Select the new enrollment status for <strong className="text-slate-800">{selectedForStatusChange.name}</strong> ({selectedForStatusChange.rollNumber}):
            </p>
            <div className="grid grid-cols-1 gap-2 pt-1">
              {['Active', 'Withdrawn', 'Transferred', 'Graduated', 'Suspended'].map(st => (
                <button
                  key={st}
                  type="button"
                  onClick={() => handleUpdateSingleStatus(st)}
                  className={`p-2.5 rounded-lg border text-left text-xs font-bold transition-all flex items-center justify-between cursor-pointer ${
                    selectedForStatusChange.status === st 
                      ? 'bg-emerald-50 border-emerald-500 text-emerald-800' 
                      : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  <span>{st}</span>
                  {selectedForStatusChange.status === st && <Check className="w-4 h-4 text-emerald-600" />}
                </button>
              ))}
            </div>
            <div className="flex justify-end pt-2 border-t">
              <button
                type="button"
                onClick={() => setSelectedForStatusChange(null)}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg cursor-pointer"
              >
                Cancel
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* 8. Single Delete Confirmation Modal */}
      {studentToDelete && (
        <Modal
          isOpen={Boolean(studentToDelete)}
          onClose={() => setStudentToDelete(null)}
          title="Confirm Student Profile Deletion"
          maxWidth="max-w-md"
        >
          <div className="space-y-4">
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl flex items-center gap-3">
              <AlertTriangle className="w-7 h-7 text-rose-600 shrink-0" />
              <div className="text-xs text-rose-900">
                <p className="font-bold">Permanent Removal Action</p>
                <p className="mt-0.5">Are you sure you want to remove student <strong className="underline">{studentToDelete.name}</strong> (Roll: {studentToDelete.rollNumber}) from this campus roster?</p>
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
                <span>Confirm Removal</span>
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* 9. Bulk Promote Modal */}
      {isBulkPromoteOpen && (
        <Modal
          isOpen={isBulkPromoteOpen}
          onClose={() => setIsBulkPromoteOpen(false)}
          title={`Bulk Promote ${selectedIds.length} Students`}
          maxWidth="max-w-md"
        >
          <div className="space-y-4">
            <p className="text-xs text-slate-600">
              Advance all <strong className="text-slate-900">{selectedIds.length}</strong> selected students to the target academic grade:
            </p>
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Target Class / Grade *</label>
              <input
                type="text"
                required
                value={bulkTargetClass}
                onChange={(e) => setBulkTargetClass(e.target.value)}
                className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 font-bold"
                placeholder="e.g. 11th Grade"
              />
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
                className="px-4 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg cursor-pointer flex items-center gap-1"
              >
                <GraduationCap className="w-3.5 h-3.5" />
                <span>Apply Bulk Promotion</span>
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* 10. Bulk Section Transfer Modal */}
      {isBulkTransferOpen && (
        <Modal
          isOpen={isBulkTransferOpen}
          onClose={() => setIsBulkTransferOpen(false)}
          title={`Bulk Transfer Section for ${selectedIds.length} Students`}
          maxWidth="max-w-md"
        >
          <div className="space-y-4">
            <p className="text-xs text-slate-600">
              Reassign section for <strong className="text-slate-900">{selectedIds.length}</strong> selected candidates:
            </p>
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Target Section *</label>
              <select
                value={bulkTargetSection}
                onChange={(e) => setBulkTargetSection(e.target.value)}
                className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 font-bold bg-white"
              >
                <option value="A">Section A</option>
                <option value="B">Section B</option>
                <option value="C">Section C</option>
                <option value="D">Section D</option>
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

      {/* 11. Bulk Status Change Modal */}
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

      {/* 12. Bulk Delete Confirmation Modal */}
      {isBulkDeleteOpen && (
        <Modal
          isOpen={isBulkDeleteOpen}
          onClose={() => setIsBulkDeleteOpen(false)}
          title={`Confirm Bulk Removal of ${selectedIds.length} Students`}
          maxWidth="max-w-md"
        >
          <div className="space-y-4">
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl flex items-center gap-3">
              <AlertTriangle className="w-7 h-7 text-rose-600 shrink-0" />
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
    </div>
  )
}

export default StudentsView
