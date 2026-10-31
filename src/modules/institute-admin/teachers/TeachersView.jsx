import React, { useState, useMemo, useRef } from 'react'
import { 
  Users, 
  Plus, 
  Search, 
  Edit2, 
  Trash2, 
  Mail, 
  Phone, 
  BookOpen,
  Download,
  Upload,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  ChevronLeft,
  ChevronRight,
  Receipt,
  DollarSign,
  Printer,
  CheckCircle2,
  Building2,
  School,
  X,
  UserCheck,
  Calendar,
  FileText,
  AlertTriangle,
  Clock,
  CreditCard,
  Layers,
  Eye,
  EyeOff,
  Filter,
  RotateCcw,
  FileSpreadsheet,
  SlidersHorizontal,
  Sparkles,
  ShieldAlert,
  GraduationCap,
  LayoutGrid,
  List,
  CheckSquare,
  Square,
  AlertCircle
} from 'lucide-react'
import { useAppData } from '../../../context/AppDataContext'
import { useToast } from '../../../context/ToastContext'
import { hashPassword } from '../../../context/AuthContext'
import Modal from '../../../components/common/Modal'
import { getInstituteTierConfig } from '../../../utils/tierGating'
import { AddStaffModal } from './AddStaffModal'
import { StaffProfileDrawer } from './StaffProfileDrawer'
import { getAllTimetables } from '../timetable/timetableService'
import { StaffIdCardModal } from './StaffIdCardModal'
import { StaffPaySlipModal } from './StaffPaySlipModal'
import { AppointmentLetterModal } from './AppointmentLetterModal'

export const TeachersView = ({ currentInstitute }) => {
  const tierConfig = getInstituteTierConfig(currentInstitute)
  const { teachers = [], classes = [], institutes = [], users = [], addItem, updateItem, deleteItem } = useAppData()
  const { toast } = useToast()

  // Active Main Tab
  const [maskCnic, setMaskCnic] = useState(true)
  const [activeTab, setActiveTab] = useState('directory') // 'directory' | 'workload' | 'leaves' | 'payroll'

  // View Layout
  const [viewMode, setViewMode] = useState('table') // 'table' | 'cards'

  // Modals and Drawers State
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const [editingStaff, setEditingStaff] = useState(null)
  const [drawerStaff, setDrawerStaff] = useState(null)
  
  // Printable Sub-Modals
  const [idCardStaff, setIdCardStaff] = useState(null)
  const [isIdCardOpen, setIsIdCardOpen] = useState(false)
  const [paySlipStaff, setPaySlipStaff] = useState(null)
  const [isPaySlipOpen, setIsPaySlipOpen] = useState(false)
  const [appointmentLetterStaff, setAppointmentLetterStaff] = useState(null)
  const [isAppointmentLetterOpen, setIsAppointmentLetterOpen] = useState(false)

  // Leave & Proxy Modal
  const [selectedLeaveStaff, setSelectedLeaveStaff] = useState(null)
  const [leaveDutyOrder, setLeaveDutyOrder] = useState(null)
  const [leaveFormData, setLeaveFormData] = useState({
    leaveType: 'Casual Leave',
    startDate: new Date().toISOString().split('T')[0],
    endDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    reason: 'Urgent Domestic Affairs',
    substituteTeacherId: '',
    substituteTeacherName: '',
    handoverNotes: 'Supervise daily periods and gradebook activities.'
  })

  // Delete & Class Teacher Conflict Warning Modal
  const [staffToDelete, setStaffToDelete] = useState(null)

  // CSV Import Modal
  const [isImportModalOpen, setIsImportModalOpen] = useState(false)
  const [csvFile, setCsvFile] = useState(null)
  const [csvParseErrors, setCsvParseErrors] = useState([])
  const [csvParsedRows, setCsvParsedRows] = useState([])
  const fileInputRef = useRef(null)

  const formatCnic = (cnic) => {
    if (!cnic) return 'CNIC pending'
    if (!maskCnic) return cnic
    const cleaned = cnic.replace(/[^0-9]/g, '')
    if (cleaned.length === 13) {
      return `${cleaned.slice(0, 5)}-*******-${cleaned.slice(12)}`
    }
    return cnic.slice(0, 5) + '******' + cnic.slice(-2)
  }

  // Filter Bar States
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedLevel, setSelectedLevel] = useState('All Levels')
  const [selectedCategory, setSelectedCategory] = useState('All Categories') // 'All Categories' | 'Teaching' | 'Non-Teaching'
  const [selectedDepartment, setSelectedDepartment] = useState('All Departments')
  const [selectedEmploymentType, setSelectedEmploymentType] = useState('All')
  const [selectedStatus, setSelectedStatus] = useState('All')

  // Sorting
  const [sortField, setSortField] = useState('name')
  const [sortDirection, setSortDirection] = useState('asc')

  // Pagination
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)

  // Multi-Select Bulk Actions
  const [selectedIds, setSelectedIds] = useState([])

  // Available unique departments for filter dropdown
  const availableDepartments = useMemo(() => {
    const set = new Set()
    teachers.forEach(t => {
      if (t.department && t.department.trim()) {
        set.add(t.department.trim())
      }
    })
    return Array.from(set).sort()
  }, [teachers])

  // Current Institute Staff list
  const instituteStaff = useMemo(() => {
    return teachers.filter(t => !t.instituteId || t.instituteId === currentInstitute?.id)
  }, [teachers, currentInstitute?.id])

  // Top KPI Metrics
  const totalStaffCount = instituteStaff.length
  const teachingCount = instituteStaff.filter(t => (t.category || 'Teaching') === 'Teaching').length
  const nonTeachingCount = instituteStaff.filter(t => t.category === 'Non-Teaching').length
  const presentTodayCount = instituteStaff.filter(t => t.status === 'Active' || !t.status).length
  const onLeaveCount = instituteStaff.filter(t => t.status === 'On Leave').length
  const classTeachersCount = instituteStaff.filter(t => t.isClassTeacher).length
  const totalClassesCount = classes.filter(c => !c.instituteId || c.instituteId === currentInstitute?.id).length

  // Filtered & Sorted Staff List
  const filteredStaff = useMemo(() => {
    return instituteStaff.filter(staff => {
      // Search
      const term = searchTerm.toLowerCase().trim()
      if (term) {
        const matchesName = staff.name?.toLowerCase().includes(term)
        const matchesEmpId = staff.empId?.toLowerCase().includes(term)
        const matchesDept = staff.department?.toLowerCase().includes(term)
        const matchesDesig = staff.designation?.toLowerCase().includes(term)
        const matchesPhone = staff.phone?.toLowerCase().includes(term)
        const matchesCnic = staff.cnic?.toLowerCase().includes(term)
        if (!matchesName && !matchesEmpId && !matchesDept && !matchesDesig && !matchesPhone && !matchesCnic) {
          return false
        }
      }

      // Level
      if (selectedLevel !== 'All Levels') {
        const staffLevel = (staff.level || 'school').toLowerCase()
        if (staffLevel !== selectedLevel.toLowerCase()) return false
      }

      // Category
      if (selectedCategory !== 'All Categories') {
        const staffCat = staff.category || 'Teaching'
        if (staffCat !== selectedCategory) return false
      }

      // Department
      if (selectedDepartment !== 'All Departments') {
        if ((staff.department || '').toLowerCase() !== selectedDepartment.toLowerCase()) return false
      }

      // Employment Type
      if (selectedEmploymentType !== 'All') {
        if ((staff.employmentType || '').toLowerCase() !== selectedEmploymentType.toLowerCase()) return false
      }

      // Status
      if (selectedStatus !== 'All') {
        const currentStat = staff.status || 'Active'
        if (currentStat.toLowerCase() !== selectedStatus.toLowerCase()) return false
      }

      return true
    }).sort((a, b) => {
      let valA = a[sortField] || ''
      let valB = b[sortField] || ''
      if (typeof valA === 'string') valA = valA.toLowerCase()
      if (typeof valB === 'string') valB = valB.toLowerCase()

      if (valA < valB) return sortDirection === 'asc' ? -1 : 1
      if (valA > valB) return sortDirection === 'asc' ? 1 : -1
      return 0
    })
  }, [
    instituteStaff,
    searchTerm,
    selectedLevel,
    selectedCategory,
    selectedDepartment,
    selectedEmploymentType,
    selectedStatus,
    sortField,
    sortDirection
  ])

  // Pagination calculation
  const totalPages = Math.ceil(filteredStaff.length / pageSize) || 1
  const paginatedStaff = useMemo(() => {
    const start = (currentPage - 1) * pageSize
    return filteredStaff.slice(start, start + pageSize)
  }, [filteredStaff, currentPage, pageSize])

  // Toggle Sorting
  const handleSort = (field) => {
    if (sortField === field) {
      setSortDirection(prev => (prev === 'asc' ? 'desc' : 'asc'))
    } else {
      setSortField(field)
      setSortDirection('asc')
    }
  }

  // Clear all filters
  const handleClearFilters = () => {
    setSearchTerm('')
    setSelectedLevel('All Levels')
    setSelectedCategory('All Categories')
    setSelectedDepartment('All Departments')
    setSelectedEmploymentType('All')
    setSelectedStatus('All')
    setCurrentPage(1)
  }

  const isAnyFilterActive = 
    searchTerm !== '' || 
    selectedLevel !== 'All Levels' || 
    selectedCategory !== 'All Categories' || 
    selectedDepartment !== 'All Departments' || 
    selectedEmploymentType !== 'All' || 
    selectedStatus !== 'All'

  // Multi-Select Handlers
  const handleSelectAll = (e) => {
    if (e.target.checked) {
      const allPageIds = paginatedStaff.map(s => s.id)
      setSelectedIds(prev => Array.from(new Set([...prev, ...allPageIds])))
    } else {
      const pageIdSet = new Set(paginatedStaff.map(s => s.id))
      setSelectedIds(prev => prev.filter(id => !pageIdSet.has(id)))
    }
  }

  const handleToggleSelect = (id) => {
    setSelectedIds(prev => 
      prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
    )
  }

  const isPageAllSelected = paginatedStaff.length > 0 && paginatedStaff.every(s => selectedIds.includes(s.id))

  // Open Add Modal
  const handleOpenAddModal = () => {
    setEditingStaff(null)
    setIsAddModalOpen(true)
  }

  // Open Edit Modal
  const handleOpenEditModal = (staff) => {
    setEditingStaff(staff)
    setIsAddModalOpen(true)
  }

  // Open Staff Profile Dossier Drawer
  const handleOpenDrawer = (staff) => {
    setDrawerStaff(staff)
  }

  // Open ID Card Modal
  const handleOpenIdCard = (staff) => {
    setIdCardStaff(staff)
    setIsIdCardOpen(true)
  }

  // Open Pay Slip Modal
  const handleOpenPaySlip = (staff) => {
    setPaySlipStaff(staff)
    setIsPaySlipOpen(true)
  }

  // Open Appointment Letter Modal
  const handleOpenAppointmentLetter = (staff) => {
    setAppointmentLetterStaff(staff)
    setIsAppointmentLetterOpen(true)
  }

  // Save / Update Staff (from AddStaffModal)
  const handleSaveStaff = async (staffData) => {
    try {
      const instituteName = currentInstitute?.name || (institutes.find(i => i.id === (currentInstitute?.id || staffData.instituteId))?.name) || 'Beaconhouse Central High School'
      const payload = {
        ...staffData,
        instituteId: currentInstitute?.id || staffData.instituteId || 'inst-1',
        campus: staffData.campus || instituteName,
        updatedAt: new Date().toISOString()
      }

      if (editingStaff) {
        await updateItem('teachers', editingStaff.id, payload)
        toast.success(`Staff record for "${staffData.name}" updated successfully!`)
        if (drawerStaff && drawerStaff.id === editingStaff.id) {
          setDrawerStaff({ ...drawerStaff, ...payload })
        }
      } else {
        await addItem('teachers', {
          ...payload,
          createdAt: new Date().toISOString()
        })

        // Auto-provision user account for teacher portal login if not exists
        try {
          const teacherEmail = staffData.email?.toLowerCase().trim()
          const teacherUsername = staffData.empId?.toLowerCase().replace(/[^a-z0-9]/g, '') || `teacher_${Date.now().toString(36)}`
          const existingUser = users.find(u => 
            (teacherEmail && u.email?.toLowerCase() === teacherEmail) ||
            (u.username && u.username.toLowerCase() === teacherUsername)
          )

          if (!existingUser) {
            await addItem('users', {
              name: staffData.name,
              email: teacherEmail || `${teacherUsername}@campus.edu.pk`,
              username: teacherUsername,
              passwordHash: hashPassword('Teacher@123'),
              role: 'teacher',
              roleTitle: staffData.designation || 'Faculty Member',
              instituteId: payload.instituteId,
              campus: payload.campus,
              department: staffData.department || 'General',
              status: 'active',
              createdAt: new Date().toISOString()
            })
          }
        } catch (authErr) {
          console.warn('Auto user provisioning for teacher skipped:', authErr)
        }

        toast.success(`Staff member "${staffData.name}" (${staffData.empId}) registered successfully!`)
      }
      setIsAddModalOpen(false)
      setEditingStaff(null)
    } catch (err) {
      toast.error('Failed to save staff record. Please try again.')
    }
  }

  // Leave & Proxy Handlers
  const handleOpenLeaveModal = (staff) => {
    setSelectedLeaveStaff(staff)
    const otherFaculty = instituteStaff.filter(other => other.id !== staff.id && other.status !== 'On Leave')
    const defaultSub = otherFaculty[0]

    setLeaveFormData({
      leaveType: staff.leaveInfo?.leaveType || 'Casual Leave',
      startDate: staff.leaveInfo?.startDate || new Date().toISOString().split('T')[0],
      endDate: staff.leaveInfo?.endDate || new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      reason: staff.leaveInfo?.reason || 'Urgent Domestic Affairs',
      substituteTeacherId: staff.leaveInfo?.substituteTeacherId || defaultSub?.id || '',
      substituteTeacherName: staff.leaveInfo?.substituteTeacherName || defaultSub?.name || 'Assigned Proxy',
      handoverNotes: staff.leaveInfo?.handoverNotes || `Supervise daily lectures, course syllabus, and gradebook for ${staff.department} classes.`
    })
  }

  const handleAssignLeave = async (e) => {
    e.preventDefault()
    if (!selectedLeaveStaff) return

    await updateItem('teachers', selectedLeaveStaff.id, {
      status: 'On Leave',
      leaveInfo: {
        ...leaveFormData,
        approvedAt: new Date().toISOString().split('T')[0]
      }
    })

    toast.warning(`Faculty member "${selectedLeaveStaff.name}" marked On Leave. Proxy assigned to: ${leaveFormData.substituteTeacherName}!`)
    setSelectedLeaveStaff(null)
    if (drawerStaff && drawerStaff.id === selectedLeaveStaff.id) {
      setDrawerStaff({ ...drawerStaff, status: 'On Leave', leaveInfo: { ...leaveFormData, approvedAt: new Date().toISOString().split('T')[0] } })
    }
  }

  const handleResumeDuty = async (staff) => {
    await updateItem('teachers', staff.id, {
      status: 'Active',
      leaveInfo: null
    })
    toast.success(`Faculty member "${staff.name}" resumed active academic duty. Timetable proxy released!`)
    if (drawerStaff && drawerStaff.id === staff.id) {
      setDrawerStaff({ ...drawerStaff, status: 'Active', leaveInfo: null })
    }
  }

  // Delete Staff with Class Teacher Reassignment Check
  const initiateDelete = (staff) => {
    setStaffToDelete(staff)
  }

  const confirmDelete = async () => {
    if (!staffToDelete) return

    // Check if faculty member is scheduled in timetable
    const allTimetables = getAllTimetables()
    const affectedPeriods = []
    allTimetables.forEach(t => {
      Object.values(t.slots || {}).forEach(s => {
        if (s.teacherId === staffToDelete.id || (s.teacherName || '').toLowerCase().trim() === (staffToDelete.name || '').toLowerCase().trim()) {
          affectedPeriods.push(`${t.className} (${t.sectionName}) - ${s.day} ${s.periodNum}: ${s.subjectName}`)
        }
      })
    })

    if (affectedPeriods.length > 0) {
      const sample = affectedPeriods.slice(0, 4).join('\n- ')
      const more = affectedPeriods.length > 4 ? `\n...and ${affectedPeriods.length - 4} more` : ''
      if (!window.confirm(`Warning: Faculty member "${staffToDelete.name}" is designated teacher for ${affectedPeriods.length} active period(s) in the Timetable:\n- ${sample}${more}\n\nDeleting this teacher will leave these scheduled periods unassigned. Proceed?`)) {
        return
      }
    }

    await deleteItem('teachers', staffToDelete.id)
    toast.info(`Staff record for "${staffToDelete.name}" (${staffToDelete.empId}) removed.`)
    if (drawerStaff && drawerStaff.id === staffToDelete.id) {
      setDrawerStaff(null)
    }
    setStaffToDelete(null)
  }

  // Bulk Actions
  const handleBulkStatusChange = async (newStatus) => {
    if (selectedIds.length === 0) return
    for (const id of selectedIds) {
      await updateItem('teachers', id, { status: newStatus })
    }
    toast.success(`Status updated to "${newStatus}" for ${selectedIds.length} staff member(s).`)
    setSelectedIds([])
  }

  const handleBulkPrintIdCards = () => {
    if (selectedIds.length === 0) return
    const staffList = instituteStaff.filter(s => selectedIds.includes(s.id))
    if (staffList.length > 0) {
      setIdCardStaff(staffList[0])
      setIsIdCardOpen(true)
    }
  }

  // Export CSV
  const handleExportCSV = (exportOnlySelected = false) => {
    const listToExport = exportOnlySelected 
      ? instituteStaff.filter(s => selectedIds.includes(s.id))
      : filteredStaff

    if (listToExport.length === 0) {
      toast.warning('No staff members available to export.')
      return
    }

    const headers = [
      'Employee ID',
      'Full Name',
      'Category',
      'Academic Level',
      'Department',
      'Designation',
      'Employment Type',
      'Status',
      'Phone',
      'Email',
      'CNIC',
      'Gender',
      'Basic Salary',
      'Allowances',
      'Deductions',
      'Net Salary',
      'Class Teacher Assigned',
      'Bank Account (IBAN)'
    ]

    const rows = listToExport.map(s => [
      `"${s.empId || ''}"`,
      `"${s.name || ''}"`,
      `"${s.category || 'Teaching'}"`,
      `"${s.level || 'School'}"`,
      `"${s.department || ''}"`,
      `"${s.designation || ''}"`,
      `"${s.employmentType || 'Permanent / Regular'}"`,
      `"${s.status || 'Active'}"`,
      `"${s.phone || ''}"`,
      `"${s.email || ''}"`,
      `"${s.cnic || ''}"`,
      `"${s.gender || ''}"`,
      `"${s.basicSalary || 0}"`,
      `"${s.allowance || 0}"`,
      `"${s.deductions || 0}"`,
      `"${(Number(s.basicSalary || 0) + Number(s.allowance || 0) - Number(s.deductions || 0))}"`,
      `"${s.isClassTeacher ? `Class ${s.classTeacherClass}-${s.classTeacherSection || 'A'}` : 'No'}"`,
      `"${s.bankAccount || ''}"`
    ])

    const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\n')
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.setAttribute('download', `Faculty_Staff_Roster_${new Date().toISOString().split('T')[0]}.csv`)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    toast.success(`Exported ${listToExport.length} staff records to CSV.`)
  }

  // Download Sample CSV Template
  const handleDownloadTemplate = () => {
    const sampleHeaders = [
      'Name',
      'Category',
      'Level',
      'Department',
      'Designation',
      'EmploymentType',
      'Gender',
      'Phone',
      'Email',
      'CNIC',
      'BasicSalary',
      'Allowances',
      'Deductions',
      'BankAccount'
    ]
    const sampleData = [
      'Prof. Dr. Shahid Javed,Teaching,college,Computer Science,Associate Professor,Permanent / Regular,Male,+92 300 1234567,shahid@institute.edu.pk,35201-1234567-1,95000,20000,5000,PK72HABB000192837465',
      'Nadeem Akhtar,Non-Teaching,school,Administration,Senior Office Assistant,Contract,Male,+92 321 7654321,nadeem@institute.edu.pk,35202-9876543-1,45000,8000,2000,PK45MEZN000987654321'
    ]
    const content = [sampleHeaders.join(','), ...sampleData].join('\n')
    const blob = new Blob([content], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.setAttribute('download', 'Faculty_Staff_Import_Template.csv')
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    toast.info('Sample CSV template downloaded.')
  }

  // Handle CSV File Selection & Parse
  const handleCsvFileChange = (e) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (!file.name.endsWith('.csv')) {
      toast.error('Invalid file format. Please upload a valid .csv file.')
      return
    }

    setCsvFile(file)
    const reader = new FileReader()
    reader.onload = (event) => {
      const text = event.target?.result
      if (!text) return

      const lines = text.split(/\r?\n/).filter(line => line.trim().length > 0)
      if (lines.length <= 1) {
        setCsvParseErrors(['The uploaded CSV is empty or only contains headers.'])
        setCsvParsedRows([])
        return
      }

      const headers = lines[0].split(',').map(h => h.trim().replace(/^"|"$/g, '').toLowerCase())
      const nameIndex = headers.findIndex(h => h.includes('name'))
      const catIndex = headers.findIndex(h => h.includes('cat'))
      const deptIndex = headers.findIndex(h => h.includes('dept') || h.includes('department'))
      const desigIndex = headers.findIndex(h => h.includes('desig'))
      const phoneIndex = headers.findIndex(h => h.includes('phone') || h.includes('mobile'))
      const emailIndex = headers.findIndex(h => h.includes('email'))
      const cnicIndex = headers.findIndex(h => h.includes('cnic'))
      const basicIndex = headers.findIndex(h => h.includes('basic'))
      const allowIndex = headers.findIndex(h => h.includes('allow'))
      const dedIndex = headers.findIndex(h => h.includes('deduct'))
      const bankIndex = headers.findIndex(h => h.includes('bank') || h.includes('iban'))

      const parsed = []
      const errors = []

      // Sequential auto ID generation for imported rows
      const existingNums = teachers.map(t => {
        const match = String(t.empId || '').match(/([0-9]+)$/)
        return match ? parseInt(match[1], 10) : 0
      }).filter(n => !isNaN(n) && n > 0)
      let nextIdNum = (existingNums.length > 0 ? Math.max(...existingNums) : 0) + 1

      for (let i = 1; i < lines.length; i++) {
        const row = lines[i].split(',').map(cell => cell.trim().replace(/^"|"$/g, ''))
        const staffName = nameIndex >= 0 ? row[nameIndex] : row[0]

        if (!staffName || staffName.trim().length < 2) {
          errors.push(`Row ${i + 1}: Name is missing or invalid.`)
          continue
        }

        const staffEmpId = `EMP-${String(nextIdNum++).padStart(3, '0')}`
        const staffCategory = (catIndex >= 0 && row[catIndex]) ? row[catIndex] : 'Teaching'
        const staffDept = (deptIndex >= 0 && row[deptIndex]) ? row[deptIndex] : 'General'
        const staffDesig = (desigIndex >= 0 && row[desigIndex]) ? row[desigIndex] : 'Staff Member'
        const staffPhone = (phoneIndex >= 0 && row[phoneIndex]) ? row[phoneIndex] : ''
        const staffEmail = (emailIndex >= 0 && row[emailIndex]) ? row[emailIndex] : ''
        const staffCnic = (cnicIndex >= 0 && row[cnicIndex]) ? row[cnicIndex] : ''
        const basic = (basicIndex >= 0 && Number(row[basicIndex])) ? Number(row[basicIndex]) : 65000
        const allow = (allowIndex >= 0 && Number(row[allowIndex])) ? Number(row[allowIndex]) : 15000
        const ded = (dedIndex >= 0 && Number(row[dedIndex])) ? Number(row[dedIndex]) : 3500
        const bank = (bankIndex >= 0 && row[bankIndex]) ? row[bankIndex] : 'PK72HABB000192837465'

        parsed.push({
          name: staffName,
          empId: staffEmpId,
          category: staffCategory,
          department: staffDept,
          designation: staffDesig,
          phone: staffPhone,
          email: staffEmail,
          cnic: staffCnic,
          basicSalary: basic,
          allowance: allow,
          deductions: ded,
          netSalary: basic + allow - ded,
          bankAccount: bank,
          status: 'Active',
          level: 'school',
          instituteId: currentInstitute?.id || 'inst-1'
        })
      }

      setCsvParsedRows(parsed)
      setCsvParseErrors(errors)
    }
    reader.readAsText(file)
  }

  // Confirm Import
  const handleConfirmImport = async () => {
    if (csvParsedRows.length === 0) return
    for (const item of csvParsedRows) {
      await addItem('teachers', item)
    }
    toast.success(`Successfully imported ${csvParsedRows.length} staff member(s)!`)
    setIsImportModalOpen(false)
    setCsvFile(null)
    setCsvParsedRows([])
    setCsvParseErrors([])
  }

  return (
    <div className="p-4 sm:p-6 md:p-8 space-y-6 max-w-7xl mx-auto">
      
      {/* Page Title & Main Actions */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-emerald-600 text-white flex items-center justify-center shadow-sm">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                Faculty & Staff
              </h1>
              <p className="text-xs text-slate-500 mt-0.5">
                Personnel roster, timetable workload allocations, leave & substitution proxies, and monthly payroll
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {/* Import CSV */}
          <button
            onClick={() => setIsImportModalOpen(true)}
            className="flex items-center gap-1.5 px-3 py-2 bg-white hover:bg-slate-50 text-slate-700 rounded-xl text-xs font-semibold border border-slate-200 shadow-sm transition-all"
            title="Import faculty roster via CSV spreadsheet"
          >
            <Upload className="w-3.5 h-3.5 text-slate-500" />
            <span>Import CSV</span>
          </button>

          {/* Export CSV */}
          <button
            onClick={() => handleExportCSV(false)}
            className="flex items-center gap-1.5 px-3 py-2 bg-white hover:bg-slate-50 text-slate-700 rounded-xl text-xs font-semibold border border-slate-200 shadow-sm transition-all"
            title="Export filtered faculty roster to CSV"
          >
            <Download className="w-3.5 h-3.5 text-slate-500" />
            <span>Export CSV</span>
          </button>

          {/* + Add Staff Member */}
          <button
            onClick={handleOpenAddModal}
            className="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-sm transition-all hover:shadow"
          >
            <Plus className="w-4 h-4" />
            <span>+ Add Staff Member</span>
          </button>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Total Staff */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Total Staff</span>
            <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-2xl font-black text-slate-900 tracking-tight">
              {totalStaffCount}
            </span>
            <p className="text-[11px] text-slate-500 mt-0.5">
              {totalStaffCount > 0 ? `${teachingCount} Teaching • ${nonTeachingCount} Staff` : 'No staff registered yet'}
            </p>
          </div>
        </div>

        {/* Card 2: Present Today */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Active on Duty</span>
            <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-2xl font-black text-slate-900 tracking-tight">
              {presentTodayCount}
            </span>
            <p className="text-[11px] text-emerald-600 font-semibold mt-0.5">
              {totalStaffCount > 0 ? `${Math.round((presentTodayCount / totalStaffCount) * 100)}% active duty` : '—'}
            </p>
          </div>
        </div>

        {/* Card 3: On Leave / Proxy */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">On Leave</span>
            <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center font-bold">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-2xl font-black text-slate-900 tracking-tight">
              {onLeaveCount}
            </span>
            <p className="text-[11px] text-amber-700 font-medium mt-0.5">
              {onLeaveCount > 0 ? `${onLeaveCount} active proxy substitutions` : 'Zero leave requests'}
            </p>
          </div>
        </div>

        {/* Card 4: Class Teachers Assigned */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Class In-Charges</span>
            <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold">
              <GraduationCap className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-2xl font-black text-slate-900 tracking-tight">
              {classTeachersCount}
            </span>
            <p className="text-[11px] text-slate-500 mt-0.5">
              {totalClassesCount > 0 ? `${classTeachersCount} of ${totalClassesCount} classes covered` : '0 assigned'}
            </p>
          </div>
        </div>
      </div>

      {/* Main Tabs Navigation */}
      <div className="flex items-center justify-between border-b border-slate-200 pb-0.5 overflow-x-auto scrollbar-none">
        <div className="flex items-center gap-1 sm:gap-2">
          <button
            onClick={() => setActiveTab('directory')}
            className={`flex items-center gap-2 px-3 sm:px-4 py-2.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
              activeTab === 'directory'
                ? 'bg-emerald-600 text-white shadow-sm'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <Users className="w-3.5 h-3.5" />
            <span>Staff Directory</span>
            <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-mono ${
              activeTab === 'directory' ? 'bg-emerald-700 text-white' : 'bg-slate-200 text-slate-700'
            }`}>
              {filteredStaff.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('workload')}
            className={`flex items-center gap-2 px-3 sm:px-4 py-2.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
              activeTab === 'workload'
                ? 'bg-emerald-600 text-white shadow-sm'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <BookOpen className="w-3.5 h-3.5" />
            <span>Workload & Classes</span>
          </button>

          <button
            onClick={() => setActiveTab('leaves')}
            className={`flex items-center gap-2 px-3 sm:px-4 py-2.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
              activeTab === 'leaves'
                ? 'bg-emerald-600 text-white shadow-sm'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <UserCheck className="w-3.5 h-3.5" />
            <span>Leaves & Proxies</span>
            {onLeaveCount > 0 && (
              <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse"></span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('payroll')}
            className={`flex items-center gap-2 px-3 sm:px-4 py-2.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
              activeTab === 'payroll'
                ? 'bg-emerald-600 text-white shadow-sm'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <DollarSign className="w-3.5 h-3.5" />
            <span>Compensation & Payroll</span>
          </button>
        </div>

        {/* View Switcher (Table vs Cards) for Directory tab */}
        {activeTab === 'directory' && (
          <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl text-xs font-semibold text-slate-600 shrink-0">
            <button
              onClick={() => setViewMode('table')}
              className={`p-1.5 rounded-lg transition-all ${
                viewMode === 'table' ? 'bg-white text-slate-900 shadow-sm' : 'hover:text-slate-900'
              }`}
              title="Table View"
            >
              <List className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('cards')}
              className={`p-1.5 rounded-lg transition-all ${
                viewMode === 'cards' ? 'bg-white text-slate-900 shadow-sm' : 'hover:text-slate-900'
              }`}
              title="Cards Grid View"
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>

      {/* Advanced Filter Toolbar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {/* Search Box */}
          <div className="relative col-span-1 sm:col-span-2 lg:col-span-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search by name, ID, CNIC, phone..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value)
                setCurrentPage(1)
              }}
              className="w-full pl-9 pr-3.5 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 bg-slate-50 focus:bg-white"
            />
          </div>

          {/* Level Filter */}
          <div>
            <select
              value={selectedLevel}
              onChange={(e) => {
                setSelectedLevel(e.target.value)
                setCurrentPage(1)
              }}
              className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 bg-slate-50 focus:bg-white font-medium text-slate-700"
            >
              <option value="All Levels">All Academic Levels</option>
              {tierConfig.hasSchool && (
                <option value="school">Primary / Secondary School</option>
              )}
              {tierConfig.hasCollege && (
                <option value="college">Higher Secondary / College Faculty</option>
              )}
              {tierConfig.hasUniversity && (
                <option value="university">University Faculty & Professors</option>
              )}
            </select>
          </div>

          {/* Category Filter */}
          <div>
            <select
              value={selectedCategory}
              onChange={(e) => {
                setSelectedCategory(e.target.value)
                setCurrentPage(1)
              }}
              className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 bg-slate-50 focus:bg-white font-medium text-slate-700"
            >
              <option value="All Categories">All Cadres (Teaching & Staff)</option>
              <option value="Teaching">Teaching Faculty Only</option>
              <option value="Non-Teaching">Non-Teaching Staff Only</option>
            </select>
          </div>

          {/* Department Filter */}
          <div>
            <select
              value={selectedDepartment}
              onChange={(e) => {
                setSelectedDepartment(e.target.value)
                setCurrentPage(1)
              }}
              className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 bg-slate-50 focus:bg-white font-medium text-slate-700"
            >
              <option value="All Departments">All Departments</option>
              {availableDepartments.map(dept => (
                <option key={dept} value={dept}>{dept}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Secondary Filter Line */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-slate-100 text-xs">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-slate-400 font-semibold">Status:</span>
            {['All', 'Active', 'On Leave', 'Suspended'].map(stat => (
              <button
                key={stat}
                onClick={() => {
                  setSelectedStatus(stat)
                  setCurrentPage(1)
                }}
                className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all ${
                  selectedStatus === stat
                    ? 'bg-slate-900 text-white shadow-sm'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {stat}
              </button>
            ))}

            <span className="text-slate-300 ml-2">|</span>

            <span className="text-slate-400 font-semibold ml-2">Type:</span>
            <select
              value={selectedEmploymentType}
              onChange={(e) => {
                setSelectedEmploymentType(e.target.value)
                setCurrentPage(1)
              }}
              className="px-2.5 py-1 rounded-lg border border-slate-200 bg-slate-50 text-xs text-slate-700 font-medium"
            >
              <option value="All">All Types</option>
              <option value="Permanent / Regular">Permanent / Regular</option>
              <option value="Contract">Contract</option>
              <option value="Visiting / Adjunct">Visiting / Adjunct</option>
              <option value="Probation">Probation</option>
            </select>
          </div>

          {/* CNIC Privacy Toggle & Clear Filters */}
          <div className="flex items-center gap-2 ml-auto">
            <button
              type="button"
              onClick={() => setMaskCnic(!maskCnic)}
              title={maskCnic ? "Reveal CNIC Numbers" : "Mask CNIC Numbers"}
              className="flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-semibold text-slate-600 hover:bg-slate-100 border border-slate-200 transition-colors"
            >
              {maskCnic ? <EyeOff className="w-3.5 h-3.5 text-slate-500" /> : <Eye className="w-3.5 h-3.5 text-emerald-600" />}
              <span>{maskCnic ? 'Masked CNIC' : 'Full CNIC'}</span>
            </button>
            {isAnyFilterActive && (
              <button
                onClick={handleClearFilters}
                className="flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-semibold text-rose-600 hover:bg-rose-50 border border-rose-200 transition-colors"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Clear Filters</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Bulk Action Bar (when rows are selected) */}
      {selectedIds.length > 0 && (
        <div className="bg-emerald-900 text-white p-3.5 rounded-2xl flex flex-wrap items-center justify-between gap-3 shadow-lg animate-in fade-in duration-150">
          <div className="flex items-center gap-2.5">
            <span className="w-6 h-6 rounded-lg bg-emerald-500/30 flex items-center justify-center font-mono text-xs font-bold text-emerald-300">
              {selectedIds.length}
            </span>
            <span className="text-xs font-semibold">
              Faculty / Staff Selected
            </span>
          </div>

          <div className="flex items-center gap-2 flex-wrap text-xs">
            <button
              onClick={handleBulkPrintIdCards}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-800 hover:bg-emerald-700 text-white rounded-lg font-semibold transition-colors"
            >
              <CreditCard className="w-3.5 h-3.5 text-emerald-300" />
              <span>Print ID Cards</span>
            </button>
            <button
              onClick={() => handleExportCSV(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-800 hover:bg-emerald-700 text-white rounded-lg font-semibold transition-colors"
            >
              <Download className="w-3.5 h-3.5 text-emerald-300" />
              <span>Export Selected CSV</span>
            </button>
            <button
              onClick={() => handleBulkStatusChange('Active')}
              className="px-2.5 py-1.5 bg-emerald-700 hover:bg-emerald-600 text-white rounded-lg font-semibold transition-colors"
            >
              Set Active
            </button>
            <button
              onClick={() => setSelectedIds([])}
              className="px-2.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg font-semibold transition-colors"
            >
              Deselect All
            </button>
          </div>
        </div>
      )}

      {/* TAB 1: STAFF DIRECTORY */}
      {activeTab === 'directory' && (
        <>
          {filteredStaff.length > 0 ? (
            viewMode === 'table' ? (
              /* Table Layout */
              <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold uppercase tracking-wider">
                      <tr>
                        <th className="p-3.5 w-10 text-center">
                          <input
                            type="checkbox"
                            checked={isPageAllSelected}
                            onChange={handleSelectAll}
                            className="rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
                          />
                        </th>
                        <th 
                          onClick={() => handleSort('name')}
                          className="p-3.5 cursor-pointer hover:bg-slate-100 transition-colors"
                        >
                          <div className="flex items-center gap-1.5">
                            <span>Staff Member</span>
                            <ArrowUpDown className="w-3 h-3 text-slate-400" />
                          </div>
                        </th>
                        <th 
                          onClick={() => handleSort('empId')}
                          className="p-3.5 cursor-pointer hover:bg-slate-100 transition-colors"
                        >
                          <div className="flex items-center gap-1.5">
                            <span>Employee ID</span>
                            <ArrowUpDown className="w-3 h-3 text-slate-400" />
                          </div>
                        </th>
                        <th 
                          onClick={() => handleSort('department')}
                          className="p-3.5 cursor-pointer hover:bg-slate-100 transition-colors"
                        >
                          <div className="flex items-center gap-1.5">
                            <span>Department & Role</span>
                            <ArrowUpDown className="w-3 h-3 text-slate-400" />
                          </div>
                        </th>
                        <th className="p-3.5">
                          <span>Workload / Class In-Charge</span>
                        </th>
                        <th className="p-3.5">
                          <span>Contact</span>
                        </th>
                        <th className="p-3.5">
                          <span>Status</span>
                        </th>
                        <th className="p-3.5 text-right">
                          <span>Actions</span>
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 text-slate-700">
                      {paginatedStaff.map((staff) => {
                        const isSelected = selectedIds.includes(staff.id)
                        return (
                          <tr 
                            key={staff.id} 
                            className={`hover:bg-slate-50/80 transition-colors ${isSelected ? 'bg-emerald-50/30' : ''}`}
                          >
                            <td className="p-3.5 text-center">
                              <input
                                type="checkbox"
                                checked={isSelected}
                                onChange={() => handleToggleSelect(staff.id)}
                                className="rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
                              />
                            </td>

                            {/* Name + Avatar */}
                            <td className="p-3.5">
                              <div className="flex items-center gap-3">
                                <div className="w-9 h-9 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold text-xs shrink-0 overflow-hidden">
                                  {staff.photoUrl ? (
                                    <img src={staff.photoUrl} alt={staff.name} className="w-full h-full object-cover" />
                                  ) : (
                                    staff.name.charAt(0)
                                  )}
                                </div>
                                <div>
                                  <button
                                    onClick={() => handleOpenDrawer(staff)}
                                    className="font-bold text-slate-900 hover:text-emerald-700 text-left block transition-colors"
                                  >
                                    {staff.name}
                                  </button>
                                  <div className="flex items-center gap-1.5 text-[11px] text-slate-400 mt-0.5">
                                    <span className="capitalize">{staff.gender || 'Not specified'}</span>
                                    <span>•</span>
                                    <span className="font-mono">{formatCnic(staff.cnic)}</span>
                                  </div>
                                </div>
                              </div>
                            </td>

                            {/* Employee ID */}
                            <td className="p-3.5">
                              <span className="font-mono text-xs px-2.5 py-1 bg-slate-100 text-slate-700 rounded-lg font-bold border border-slate-200">
                                {staff.empId}
                              </span>
                            </td>

                            {/* Department & Role */}
                            <td className="p-3.5">
                              <div>
                                <strong className="text-slate-800 block">{staff.designation || 'Faculty Member'}</strong>
                                <span className="text-[11px] text-slate-500">
                                  {staff.department || 'General'} • <span className="capitalize">{staff.category || 'Teaching'}</span>
                                </span>
                              </div>
                            </td>

                            {/* Workload / Class In-charge */}
                            <td className="p-3.5">
                              {staff.category === 'Non-Teaching' ? (
                                <span className="text-[11px] text-slate-500 font-medium">Administration / Operations</span>
                              ) : staff.isClassTeacher ? (
                                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-800 border border-emerald-200 font-bold text-[11px]">
                                  ★ Class {staff.classTeacherClass}-{staff.classTeacherSection || 'A'}
                                </span>
                              ) : (
                                <span className="text-[11px] text-slate-500">
                                  {staff.subjects && staff.subjects.length > 0 ? `${staff.subjects.length} Assigned Course(s)` : 'General Subject Teacher'}
                                </span>
                              )}
                            </td>

                            {/* Contact */}
                            <td className="p-3.5">
                              <div className="space-y-0.5">
                                <div className="flex items-center gap-1 text-[11px] font-mono text-slate-700">
                                  <Phone className="w-3 h-3 text-slate-400" />
                                  <span>{staff.phone || '—'}</span>
                                </div>
                                <div className="flex items-center gap-1 text-[11px] text-slate-500 truncate max-w-[150px]">
                                  <Mail className="w-3 h-3 text-slate-400" />
                                  <span>{staff.email || '—'}</span>
                                </div>
                              </div>
                            </td>

                            {/* Status */}
                            <td className="p-3.5">
                              {staff.status === 'On Leave' ? (
                                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-amber-50 text-amber-800 border border-amber-200">
                                  <Clock className="w-3 h-3 text-amber-600 animate-pulse" />
                                  <span>On Leave</span>
                                </span>
                              ) : staff.status === 'Suspended' ? (
                                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-rose-50 text-rose-800 border border-rose-200">
                                  Suspended
                                </span>
                              ) : (
                                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                                  <span>Active</span>
                                </span>
                              )}
                            </td>

                            {/* Actions */}
                            <td className="p-3.5 text-right">
                              <div className="flex items-center justify-end gap-1">
                                <button
                                  onClick={() => handleOpenDrawer(staff)}
                                  className="p-1.5 text-slate-400 hover:text-emerald-700 hover:bg-emerald-50 rounded-lg transition-colors"
                                  title="View Full Profile Dossier"
                                >
                                  <Eye className="w-4 h-4" />
                                </button>
                                <button
                                  onClick={() => handleOpenIdCard(staff)}
                                  className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                  title="Print ID Card"
                                >
                                  <CreditCard className="w-4 h-4" />
                                </button>
                                <button
                                  onClick={() => handleOpenPaySlip(staff)}
                                  className="p-1.5 text-slate-400 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition-colors"
                                  title="Generate Monthly Pay Slip"
                                >
                                  <Receipt className="w-4 h-4" />
                                </button>
                                <button
                                  onClick={() => handleOpenEditModal(staff)}
                                  className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                                  title="Edit Staff Member"
                                >
                                  <Edit2 className="w-4 h-4" />
                                </button>
                                <button
                                  onClick={() => initiateDelete(staff)}
                                  className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                                  title="Deactivate / Delete"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        )
                      })}
                    </tbody>
                  </table>
                </div>

                {/* Pagination Controls */}
                <div className="p-4 bg-slate-50 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500">
                  <div>
                    Showing <span className="font-semibold text-slate-700">{(currentPage - 1) * pageSize + 1}</span> to <span className="font-semibold text-slate-700">{Math.min(currentPage * pageSize, filteredStaff.length)}</span> of <span className="font-semibold text-slate-700">{filteredStaff.length}</span> staff members
                  </div>

                  {totalPages > 1 && (
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                        disabled={currentPage === 1}
                        className="px-2.5 py-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed"
                      >
                        <ChevronLeft className="w-4 h-4" />
                      </button>
                      {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                        <button
                          key={page}
                          onClick={() => setCurrentPage(page)}
                          className={`w-7 h-7 rounded-lg font-bold ${
                            currentPage === page
                              ? 'bg-emerald-600 text-white shadow-sm'
                              : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50'
                          }`}
                        >
                          {page}
                        </button>
                      ))}
                      <button
                        onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                        disabled={currentPage === totalPages}
                        className="px-2.5 py-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed"
                      >
                        <ChevronRight className="w-4 h-4" />
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              /* Cards Grid Layout */
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {paginatedStaff.map((staff) => {
                  const basic = Number(staff.basicSalary || 0)
                  const allow = Number(staff.allowance || 0)
                  const ded = Number(staff.deductions || 0)
                  const net = staff.netSalary || (basic + allow - ded)

                  return (
                    <div
                      key={staff.id}
                      className="bg-white rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-all flex flex-col justify-between overflow-hidden"
                    >
                      <div className="p-5">
                        <div className="flex items-start justify-between">
                          <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold text-base overflow-hidden">
                            {staff.photoUrl ? (
                              <img src={staff.photoUrl} alt={staff.name} className="w-full h-full object-cover" />
                            ) : (
                              staff.name.charAt(0)
                            )}
                          </div>
                          <span className="font-mono text-xs px-2.5 py-1 bg-slate-100 text-slate-700 rounded-lg font-bold border border-slate-200">
                            {staff.empId}
                          </span>
                        </div>

                        <h3 
                          onClick={() => handleOpenDrawer(staff)}
                          className="font-bold text-slate-900 mt-3.5 text-base hover:text-emerald-700 cursor-pointer transition-colors"
                        >
                          {staff.name}
                        </h3>
                        <p className="text-xs text-emerald-700 font-semibold">{staff.designation || 'Faculty Member'}</p>
                        <p className="text-[11px] text-slate-500 mt-0.5">{staff.department} Department</p>

                        {/* Class Teacher Badge if assigned */}
                        {staff.isClassTeacher && (
                          <div className="mt-2.5 inline-flex items-center gap-1.5 px-2.5 py-1 bg-emerald-50 border border-emerald-200 rounded-lg text-emerald-800 text-[11px] font-bold">
                            <span>★ Class Teacher: Class {staff.classTeacherClass}-{staff.classTeacherSection || 'A'}</span>
                          </div>
                        )}

                        {/* On Leave Notification */}
                        {staff.status === 'On Leave' && (
                          <div className="mt-2.5 flex items-center gap-1.5 px-2.5 py-1 bg-amber-50 border border-amber-200 rounded-lg text-amber-800 text-[11px] font-semibold">
                            <Clock className="w-3.5 h-3.5 text-amber-600 shrink-0 animate-pulse" />
                            <span>On Leave (Proxy: {staff.leaveInfo?.substituteTeacherName || 'Assigned'})</span>
                          </div>
                        )}

                        <div className="mt-4 pt-3 border-t border-slate-100 space-y-2 text-xs text-slate-500">
                          <div className="flex items-center gap-2">
                            <Phone className="w-3.5 h-3.5 text-slate-400" />
                            <span className="font-mono">{staff.phone || 'No phone registered'}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <DollarSign className="w-3.5 h-3.5 text-emerald-600" />
                            <span className="font-mono font-bold text-slate-700">Net Pay: Rs. {net.toLocaleString()}</span>
                          </div>
                        </div>
                      </div>

                      {/* Card Footer Actions */}
                      <div className="p-3 bg-slate-50 border-t border-slate-100 flex items-center justify-between text-xs">
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => handleOpenPaySlip(staff)}
                            className="px-2.5 py-1 text-xs font-bold rounded-lg bg-emerald-50 text-emerald-700 hover:bg-emerald-100 transition-colors"
                            title="Generate Pay Slip"
                          >
                            Pay Slip
                          </button>
                          <button
                            onClick={() => handleOpenIdCard(staff)}
                            className="px-2.5 py-1 text-xs font-bold rounded-lg bg-blue-50 text-blue-700 hover:bg-blue-100 transition-colors"
                            title="Print ID Card"
                          >
                            ID Card
                          </button>
                        </div>

                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => handleOpenDrawer(staff)}
                            className="p-1.5 text-slate-400 hover:text-emerald-700 rounded-lg transition-colors"
                            title="View Profile Dossier"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleOpenEditModal(staff)}
                            className="p-1.5 text-slate-400 hover:text-indigo-600 rounded-lg transition-colors"
                            title="Edit Staff Member"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => initiateDelete(staff)}
                            className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg transition-colors"
                            title="Delete Staff Member"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            )
          ) : (
            /* Empty State */
            <div className="bg-white rounded-2xl p-12 border border-slate-200 text-center shadow-sm max-w-xl mx-auto space-y-4">
              <div className="w-16 h-16 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto shadow-inner">
                <Users className="w-8 h-8" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-800">
                  {isAnyFilterActive ? 'No Staff Found Matching Current Filters' : 'No Faculty or Staff Members Registered'}
                </h3>
                <p className="text-xs text-slate-500 mt-1 max-w-md mx-auto">
                  {isAnyFilterActive
                    ? 'Try adjusting your search criteria, level, category, or status filters.'
                    : 'Get started by manually registering a faculty member or importing a staff spreadsheet via CSV.'}
                </p>
              </div>
              <div className="flex items-center justify-center gap-3 pt-2">
                {isAnyFilterActive ? (
                  <button
                    onClick={handleClearFilters}
                    className="px-4 py-2 bg-slate-900 text-white rounded-xl text-xs font-bold hover:bg-slate-800 transition-colors shadow-sm"
                  >
                    Clear All Filters
                  </button>
                ) : (
                  <>
                    <button
                      onClick={handleOpenAddModal}
                      className="px-4 py-2 bg-emerald-600 text-white rounded-xl text-xs font-bold hover:bg-emerald-700 transition-colors shadow-sm flex items-center gap-1.5"
                    >
                      <Plus className="w-4 h-4" />
                      <span>+ Add Staff Member</span>
                    </button>
                    <button
                      onClick={() => setIsImportModalOpen(true)}
                      className="px-4 py-2 bg-slate-100 text-slate-700 rounded-xl text-xs font-semibold hover:bg-slate-200 transition-colors"
                    >
                      Import CSV Template
                    </button>
                  </>
                )}
              </div>
            </div>
          )}
        </>
      )}

      {/* TAB 2: WORKLOAD & ASSIGNMENTS */}
      {activeTab === 'workload' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-6">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <div>
              <h2 className="text-base font-bold text-slate-900">Academic Workload & Timetable Distribution</h2>
              <p className="text-xs text-slate-500">Weekly periods and credit hour distribution across faculty</p>
            </div>
            <span className="text-xs px-3 py-1 bg-emerald-50 text-emerald-800 font-bold rounded-lg border border-emerald-200">
              Active Faculty: {teachingCount}
            </span>
          </div>

          {teachingCount > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold uppercase tracking-wider">
                  <tr>
                    <th className="p-3.5">Faculty Member</th>
                    <th className="p-3.5">Level & Cadre</th>
                    <th className="p-3.5">Class In-Charge</th>
                    <th className="p-3.5">Assigned Courses</th>
                    <th className="p-3.5 text-center">Weekly Periods / Credits</th>
                    <th className="p-3.5 text-center">Load Health</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {instituteStaff.filter(s => (s.category || 'Teaching') === 'Teaching').map(teacher => {
                    const weeklyLoad = teacher.weeklyPeriods || teacher.weeklyCreditHours || 18
                    const isOverloaded = weeklyLoad > 28
                    return (
                      <tr key={teacher.id} className="hover:bg-slate-50 transition-colors">
                        <td className="p-3.5 font-bold text-slate-900">
                          {teacher.name}
                          <span className="text-[11px] text-slate-400 block font-normal">{teacher.empId}</span>
                        </td>
                        <td className="p-3.5 capitalize text-slate-600">
                          {teacher.level || 'School'} • {teacher.designation}
                        </td>
                        <td className="p-3.5">
                          {teacher.isClassTeacher ? (
                            <span className="px-2 py-0.5 rounded font-bold bg-emerald-50 text-emerald-800 border border-emerald-200 text-[11px]">
                              Class {teacher.classTeacherClass}-{teacher.classTeacherSection || 'A'}
                            </span>
                          ) : (
                            <span className="text-slate-400 text-[11px]">—</span>
                          )}
                        </td>
                        <td className="p-3.5 text-slate-700">
                          {teacher.subjects && teacher.subjects.length > 0 ? (
                            <div className="flex flex-wrap gap-1">
                              {teacher.subjects.map((sub, i) => (
                                <span key={i} className="px-2 py-0.5 rounded bg-slate-100 text-slate-700 font-mono text-[10px]">
                                  {sub.name || sub}
                                </span>
                              ))}
                            </div>
                          ) : (
                            <span className="text-slate-400 text-[11px]">General Faculty</span>
                          )}
                        </td>
                        <td className="p-3.5 text-center font-mono font-bold text-slate-800">
                          {weeklyLoad} {teacher.level === 'university' ? 'Cr. Hrs' : 'Periods/Wk'}
                        </td>
                        <td className="p-3.5 text-center">
                          {isOverloaded ? (
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-50 text-rose-700 border border-rose-200">
                              Overloaded
                            </span>
                          ) : (
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                              Optimal
                            </span>
                          )}
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="p-8 text-center text-slate-400 text-xs">
              No teaching faculty registered yet.
            </div>
          )}
        </div>
      )}

      {/* TAB 3: LEAVES & PROXIES */}
      {activeTab === 'leaves' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-6">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <div>
              <h2 className="text-base font-bold text-slate-900">Faculty Leave & Timetable Proxy Substitutions</h2>
              <p className="text-xs text-slate-500">Track approved leaves, substitute teachers, and duty resumption</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {instituteStaff.map((staff) => {
              const isOnLeave = staff.status === 'On Leave'
              return (
                <div 
                  key={staff.id} 
                  className={`p-4 rounded-xl border transition-all ${
                    isOnLeave ? 'border-amber-300 bg-amber-50/40' : 'border-slate-200 bg-slate-50/50'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <h4 className="font-bold text-slate-900 text-sm">{staff.name}</h4>
                      <p className="text-xs text-slate-500">{staff.designation} • {staff.department}</p>
                    </div>
                    {isOnLeave ? (
                      <span className="px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-800 text-[11px] font-bold border border-amber-300 animate-pulse">
                        On Leave
                      </span>
                    ) : (
                      <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[11px] font-semibold border border-emerald-200">
                        Active Duty
                      </span>
                    )}
                  </div>

                  {isOnLeave && (
                    <div className="mt-3 pt-3 border-t border-amber-200 text-xs space-y-1.5 text-amber-900">
                      <div>
                        <span className="text-amber-700">Period: </span>
                        <strong>{staff.leaveInfo?.startDate} to {staff.leaveInfo?.endDate}</strong>
                      </div>
                      <div>
                        <span className="text-amber-700">Proxy Substitute: </span>
                        <strong>{staff.leaveInfo?.substituteTeacherName || 'Assigned Proxy'}</strong>
                      </div>
                      <div>
                        <span className="text-amber-700">Handover: </span>
                        <p className="italic text-amber-800 mt-0.5">{staff.leaveInfo?.handoverNotes}</p>
                      </div>
                    </div>
                  )}

                  <div className="mt-4 pt-3 border-t border-slate-200/60 flex items-center justify-end gap-2 text-xs">
                    {isOnLeave ? (
                      <button
                        onClick={() => handleResumeDuty(staff)}
                        className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg shadow-sm transition-colors"
                      >
                        Resume Active Duty
                      </button>
                    ) : (
                      <button
                        onClick={() => handleOpenLeaveModal(staff)}
                        className="px-3 py-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-semibold rounded-lg border border-indigo-200 transition-colors"
                      >
                        Assign Leave & Proxy
                      </button>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* TAB 4: COMPENSATION & PAYROLL */}
      {activeTab === 'payroll' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
            <div>
              <h2 className="text-base font-bold text-slate-900">Institutional Payroll & Compensation Registry</h2>
              <p className="text-xs text-slate-500">Official monthly salary disbursement, allowances, and printable pay vouchers</p>
            </div>
            <button
              onClick={() => handleExportCSV(false)}
              className="flex items-center gap-1.5 px-3.5 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold shadow-sm transition-all"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export Payroll Sheet</span>
            </button>
          </div>

          {filteredStaff.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold uppercase tracking-wider">
                  <tr>
                    <th className="p-3.5">Staff Member</th>
                    <th className="p-3.5">Employee ID</th>
                    <th className="p-3.5">Basic Pay</th>
                    <th className="p-3.5">Allowances</th>
                    <th className="p-3.5">Deductions</th>
                    <th className="p-3.5">Net Take-Home</th>
                    <th className="p-3.5">Bank IBAN</th>
                    <th className="p-3.5 text-right">Pay Slip</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredStaff.map((staff) => {
                    const basic = Number(staff.basicSalary || 0)
                    const allow = Number(staff.allowance || 0)
                    const ded = Number(staff.deductions || 0)
                    const net = staff.netSalary || (basic + allow - ded)

                    return (
                      <tr key={staff.id} className="hover:bg-slate-50 transition-colors">
                        <td className="p-3.5 font-bold text-slate-900">
                          {staff.name}
                          <span className="text-[11px] text-slate-400 block font-normal">{staff.designation}</span>
                        </td>
                        <td className="p-3.5 font-mono font-bold text-slate-700">
                          {staff.empId}
                        </td>
                        <td className="p-3.5 font-mono text-slate-700">
                          Rs. {basic.toLocaleString()}
                        </td>
                        <td className="p-3.5 font-mono text-slate-700">
                          Rs. {allow.toLocaleString()}
                        </td>
                        <td className="p-3.5 font-mono text-rose-600">
                          - Rs. {ded.toLocaleString()}
                        </td>
                        <td className="p-3.5 font-mono font-black text-emerald-800">
                          Rs. {net.toLocaleString()}
                        </td>
                        <td className="p-3.5 font-mono text-slate-500 text-[11px]">
                          {staff.bankAccount || 'PK72HABB000192837465'}
                        </td>
                        <td className="p-3.5 text-right">
                          <button
                            onClick={() => handleOpenPaySlip(staff)}
                            className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 font-bold rounded-lg transition-colors ml-auto text-xs"
                          >
                            <Receipt className="w-3.5 h-3.5" />
                            <span>Pay Slip</span>
                          </button>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="p-8 text-center text-slate-400 text-xs">
              No staff members registered in payroll.
            </div>
          )}
        </div>
      )}

      {/* Leave & Proxy Assignment Modal */}
      {selectedLeaveStaff && (
        <Modal
          isOpen={Boolean(selectedLeaveStaff)}
          onClose={() => setSelectedLeaveStaff(null)}
          title={`Assign Leave & Substitute Proxy for ${selectedLeaveStaff.name}`}
        >
          <form onSubmit={handleAssignLeave} className="space-y-4">
            <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-800">
              Marking a faculty member on leave automatically transfers timetable responsibilities to the assigned substitute teacher.
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-600 uppercase mb-1">Leave Type</label>
                <select
                  value={leaveFormData.leaveType}
                  onChange={(e) => setLeaveFormData({ ...leaveFormData, leaveType: e.target.value })}
                  className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200"
                >
                  <option value="Casual Leave">Casual Leave</option>
                  <option value="Medical / Sick Leave">Medical / Sick Leave</option>
                  <option value="Annual / Earned Leave">Annual / Earned Leave</option>
                  <option value="Duty / Official Leave">Duty / Official Leave</option>
                  <option value="Hajj / Umrah Leave">Hajj / Umrah Leave</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 uppercase mb-1">Substitute Proxy Teacher *</label>
                <select
                  required
                  value={leaveFormData.substituteTeacherId}
                  onChange={(e) => {
                    const found = instituteStaff.find(t => t.id === e.target.value)
                    setLeaveFormData({
                      ...leaveFormData,
                      substituteTeacherId: e.target.value,
                      substituteTeacherName: found?.name || 'Assigned Proxy'
                    })
                  }}
                  className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200"
                >
                  <option value="">-- Select Faculty Member --</option>
                  {instituteStaff
                    .filter(t => t.id !== selectedLeaveStaff.id && t.status !== 'On Leave')
                    .map(t => (
                      <option key={t.id} value={t.id}>
                        {t.name} ({t.department} - {t.empId})
                      </option>
                    ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-600 uppercase mb-1">Start Date</label>
                <input
                  type="date"
                  required
                  value={leaveFormData.startDate}
                  onChange={(e) => setLeaveFormData({ ...leaveFormData, startDate: e.target.value })}
                  className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-600 uppercase mb-1">End Date</label>
                <input
                  type="date"
                  required
                  value={leaveFormData.endDate}
                  onChange={(e) => setLeaveFormData({ ...leaveFormData, endDate: e.target.value })}
                  className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-600 uppercase mb-1">Reason for Leave</label>
              <input
                type="text"
                required
                value={leaveFormData.reason}
                onChange={(e) => setLeaveFormData({ ...leaveFormData, reason: e.target.value })}
                className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200"
                placeholder="Urgent Personal / Medical Affairs"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-600 uppercase mb-1">Handover Directives & Coursework Notes</label>
              <textarea
                rows={3}
                value={leaveFormData.handoverNotes}
                onChange={(e) => setLeaveFormData({ ...leaveFormData, handoverNotes: e.target.value })}
                className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200"
                placeholder="Specific instructions for course syllabus, exams, and class supervision..."
              />
            </div>

            <div className="flex justify-end gap-2.5 pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setSelectedLeaveStaff(null)}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg shadow-sm"
              >
                Approve Leave & Assign Proxy
              </button>
            </div>
          </form>
        </Modal>
      )}

      {/* Delete / Deactivation Warning Dialog */}
      {staffToDelete && (
        <Modal
          isOpen={Boolean(staffToDelete)}
          onClose={() => setStaffToDelete(null)}
          title="Confirm Staff Removal / Deactivation"
        >
          <div className="space-y-4">
            <div className="flex items-start gap-3 p-4 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-800">
              <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
              <div>
                <strong className="block font-bold">Are you sure you want to remove this staff record?</strong>
                <p className="mt-1">
                  You are about to delete the faculty record for <strong className="text-slate-900">{staffToDelete.name}</strong> ({staffToDelete.empId}).
                </p>
              </div>
            </div>

            {staffToDelete.isClassTeacher && (
              <div className="p-3.5 bg-amber-50 border border-amber-300 rounded-xl text-xs text-amber-900">
                <div className="flex items-center gap-1.5 font-bold text-amber-900 mb-1">
                  <ShieldAlert className="w-4 h-4 text-amber-700" />
                  <span>Primary Class Teacher Warning</span>
                </div>
                <p>
                  This faculty member is currently assigned as the <strong>Class Teacher for Class {staffToDelete.classTeacherClass}-{staffToDelete.classTeacherSection || 'A'}</strong>. Removing them will leave this class without an assigned in-charge. Please ensure a replacement class teacher is appointed.
                </p>
              </div>
            )}

            <div className="flex justify-end gap-2.5 pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setStaffToDelete(null)}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={confirmDelete}
                className="px-5 py-2 text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 rounded-lg shadow-sm"
              >
                Confirm & Remove Staff
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* CSV Import Modal */}
      {isImportModalOpen && (
        <Modal
          isOpen={isImportModalOpen}
          onClose={() => {
            setIsImportModalOpen(false)
            setCsvFile(null)
            setCsvParsedRows([])
            setCsvParseErrors([])
          }}
          title="Import Faculty & Staff via CSV Spreadsheet"
        >
          <div className="space-y-4">
            <div className="flex items-center justify-between p-3.5 bg-slate-50 border border-slate-200 rounded-xl text-xs">
              <div>
                <strong className="text-slate-800 block">Download Official Import Template</strong>
                <span className="text-slate-500 text-[11px]">Includes all required faculty columns and sample data</span>
              </div>
              <button
                type="button"
                onClick={handleDownloadTemplate}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold transition-colors"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Template CSV</span>
              </button>
            </div>

            {/* Dropzone */}
            <div 
              onClick={() => fileInputRef.current?.click()}
              className="border-2 border-dashed border-slate-300 hover:border-emerald-500 rounded-2xl p-6 text-center cursor-pointer bg-slate-50 hover:bg-emerald-50/20 transition-all"
            >
              <Upload className="w-8 h-8 text-slate-400 mx-auto mb-2" />
              <p className="text-xs font-bold text-slate-700">
                {csvFile ? csvFile.name : 'Click to select or drop CSV file here'}
              </p>
              <p className="text-[11px] text-slate-400 mt-0.5">Maximum file size: 5MB (.csv format only)</p>
              <input
                ref={fileInputRef}
                type="file"
                accept=".csv"
                className="hidden"
                onChange={handleCsvFileChange}
              />
            </div>

            {/* Parse Errors */}
            {csvParseErrors.length > 0 && (
              <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-800 space-y-1">
                <strong className="block font-bold">Import Warnings:</strong>
                {csvParseErrors.map((err, idx) => (
                  <p key={idx} className="text-[11px]">• {err}</p>
                ))}
              </div>
            )}

            {/* Preview of Parsed Rows */}
            {csvParsedRows.length > 0 && (
              <div className="p-3.5 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-900">
                <span className="font-bold">
                  ✓ {csvParsedRows.length} valid staff member(s) parsed and ready to import.
                </span>
              </div>
            )}

            <div className="flex justify-end gap-2.5 pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => {
                  setIsImportModalOpen(false)
                  setCsvFile(null)
                  setCsvParsedRows([])
                }}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={csvParsedRows.length === 0}
                onClick={handleConfirmImport}
                className="px-5 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg shadow-sm"
              >
                Import {csvParsedRows.length} Staff Members
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* 5-Step Add / Edit Staff Wizard Modal */}
      <AddStaffModal
        isOpen={isAddModalOpen}
        onClose={() => {
          setIsAddModalOpen(false)
          setEditingStaff(null)
        }}
        editingStaff={editingStaff}
        classes={classes}
        teachers={teachers}
        currentInstitute={currentInstitute}
        onSaveStaff={handleSaveStaff}
      />

      {/* Staff Profile Dossier Drawer */}
      <StaffProfileDrawer
        isOpen={Boolean(drawerStaff)}
        onClose={() => setDrawerStaff(null)}
        staffMember={drawerStaff}
        onEdit={(staff) => {
          setDrawerStaff(null)
          handleOpenEditModal(staff)
        }}
        onPrintIdCard={(staff) => handleOpenIdCard(staff)}
        onPrintPaySlip={(staff) => handleOpenPaySlip(staff)}
        onPrintAppointmentLetter={(staff) => handleOpenAppointmentLetter(staff)}
        onOpenLeaveModal={(staff) => handleOpenLeaveModal(staff)}
        onResumeDuty={(staff) => handleResumeDuty(staff)}
      />

      {/* Printable Staff ID Card Modal */}
      <StaffIdCardModal
        isOpen={isIdCardOpen}
        onClose={() => {
          setIsIdCardOpen(false)
          setIdCardStaff(null)
        }}
        selectedStaff={idCardStaff}
        allStaff={instituteStaff}
        currentInstitute={currentInstitute}
      />

      {/* Official Monthly Pay Slip Modal */}
      <StaffPaySlipModal
        isOpen={isPaySlipOpen}
        onClose={() => {
          setIsPaySlipOpen(false)
          setPaySlipStaff(null)
        }}
        selectedStaff={paySlipStaff}
        currentInstitute={currentInstitute}
      />

      {/* Official Appointment Letter Modal */}
      <AppointmentLetterModal
        isOpen={isAppointmentLetterOpen}
        onClose={() => {
          setIsAppointmentLetterOpen(false)
          setAppointmentLetterStaff(null)
        }}
        selectedStaff={appointmentLetterStaff}
        currentInstitute={currentInstitute}
      />

    </div>
  )
}

export default TeachersView
