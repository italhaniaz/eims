import React, { useState, useMemo, useEffect } from 'react'
import { 
  GraduationCap, 
  Users, 
  ArrowLeftRight, 
  GitMerge, 
  Hash, 
  FileCheck, 
  Award, 
  ShieldAlert, 
  BarChart3, 
  Search, 
  Filter, 
  Plus, 
  CheckCircle2, 
  Clock, 
  XCircle, 
  AlertCircle, 
  Download, 
  Building2, 
  FileText, 
  ChevronRight,
  Eye,
  EyeOff,
  Check,
  X,
  Sparkles,
  Printer,
  QrCode,
  IdCard,
  UserCheck,
  RotateCcw,
  Trash2,
  Copy,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  Layers,
  ShieldCheck,
  FileDown,
  AlertTriangle,
  Lock,
  Unlock,
  CheckSquare,
  Square
} from 'lucide-react'
import { useAppData } from '../../../context/AppDataContext'
import { useToast } from '../../../context/ToastContext'
import { DataService } from '../../../services/dataService'
import Modal from '../../../components/common/Modal'

export const SuperadminStudentsView = ({ activeTab = 'all', onTabChange = () => {} }) => {
  const { students = [], institutes = [], updateItem, deleteItem, addItem } = useAppData()
  const { toast } = useToast()

  // -------------------------------------------------------------
  // TAB NAVIGATION & STATE SYNC
  // -------------------------------------------------------------
  const [currentTab, setCurrentTab] = useState(activeTab)
  useEffect(() => {
    if (activeTab && activeTab !== currentTab) {
      setCurrentTab(activeTab)
    }
  }, [activeTab])

  const effectiveTab = currentTab || activeTab || 'all'

  const handleTabSwitch = (tabKey) => {
    setCurrentTab(tabKey)
    onTabChange(tabKey)
  }

  // Formula-neutralized CSV sanitizer (=, +, -, @, \t, \r)
  const sanitizeCSV = (val) => {
    if (val === null || val === undefined) return '""'
    let str = String(val)
    if (/^[=\+\-@\t\r]/.test(str)) {
      str = "'" + str
    }
    return '"' + str.replace(/"/g, '""') + '"'
  }

  // -------------------------------------------------------------
  // 1. UNIFIED STUDENT NORMALIZATION ADAPTER
  // -------------------------------------------------------------
  const normalizedStudents = useMemo(() => {
    const rawList = (students && students.length > 0) ? students : [
      { id: 'std-1', name: 'Abdullah Khan', rollNumber: 'BHS-2026-0001', campus: 'Beaconhouse Central High', instituteId: 'inst-1', wing: 'Middle Wing', className: 'Grade 8', status: 'Active', gender: 'Male', phone: '0300-1234567', bFormCnic: '35201-1122334-1', feeStatus: 'Paid' },
      { id: 'std-2', name: 'Zoya Fatima', rollNumber: 'BHS-2026-0002', campus: 'Beaconhouse Central High', instituteId: 'inst-1', wing: 'High School', className: 'Grade 10', status: 'Active', gender: 'Female', phone: '0301-9876543', bFormCnic: '35201-2233445-2', feeStatus: 'Paid' },
      { id: 'std-3', name: 'Ahmed Ali Raza', rollNumber: 'TCS-2026-0014', campus: 'The City School Senior Branch', instituteId: 'inst-2', wing: 'College Wing', className: 'FSc Pre-Medical', status: 'Active', gender: 'Male', phone: '0321-4567890', bFormCnic: '35201-3344556-3', feeStatus: 'Pending' },
      { id: 'std-4', name: 'Hania Imran', rollNumber: 'LGS-2026-0088', campus: 'Lahore Grammar Model Town', instituteId: 'inst-3', wing: 'Primary Wing', className: 'Grade 4', status: 'Suspended', gender: 'Female', phone: '0333-7890123', bFormCnic: '35201-4455667-4', feeStatus: 'Paid' },
      { id: 'std-5', name: 'Rayyan Siddiqui', rollNumber: 'BHS-2026-0077', campus: 'Beaconhouse Central High', instituteId: 'inst-1', wing: 'Elementary Wing', className: 'Grade 2', status: 'Active', gender: 'Male', phone: '0345-6789012', bFormCnic: '35201-5566778-5', feeStatus: 'Paid' },
      { id: 'std-6', name: 'Mahnoor Tariq', rollNumber: 'TCS-2026-0029', campus: 'The City School Senior Branch', instituteId: 'inst-2', wing: 'High School', className: 'Grade 9', status: 'Active', gender: 'Female', phone: '0312-3456789', bFormCnic: '35201-6677889-6', feeStatus: 'Paid' }
    ]

    return rawList.map(s => {
      const resolvedCampus = s.campus || (institutes.find(i => i.id === s.instituteId)?.name) || 'Main Campus'
      const roll = s.rollNumber || s.rollNo || s.id
      const grade = s.className || s.grade || 'Standard'
      const bform = s.bFormCnic || s.bForm || 'Unregistered'
      const contact = s.guardianPhone || s.phone || s.emergencyContact || s.contact || 'N/A'
      const wing = s.wing || (s.academicLevel ? (s.academicLevel.charAt(0).toUpperCase() + s.academicLevel.slice(1) + ' Wing') : 'School Wing')
      const status = s.status || 'Active'
      const fee = s.feeStatus || 'Paid'
      const gender = s.gender || 'Not Specified'
      return {
        ...s,
        cleanRoll: roll,
        cleanCampus: resolvedCampus,
        cleanGrade: grade,
        cleanBForm: bform,
        cleanContact: contact,
        cleanWing: wing,
        cleanStatus: status,
        cleanFee: fee,
        cleanGender: gender
      }
    })
  }, [students, institutes])

  // Filters & Sorters for Tab 1
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCampus, setSelectedCampus] = useState('ALL')
  const [selectedStatus, setSelectedStatus] = useState('ALL')
  const [selectedFeeFilter, setSelectedFeeFilter] = useState('ALL')
  const [showMaskedBForm, setShowMaskedBForm] = useState(true)
  const [sortField, setSortField] = useState('name')
  const [sortDirection, setSortDirection] = useState('asc')
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)

  // Batch Selection
  const [selectedStudentIds, setSelectedStudentIds] = useState([])

  const filteredStudents = useMemo(() => {
    const q = searchQuery.toLowerCase().trim()
    const filtered = normalizedStudents.filter(s => {
      const matchesSearch = !q || 
        (s.name || '').toLowerCase().includes(q) || 
        (s.cleanRoll || '').toLowerCase().includes(q) ||
        (s.cleanCampus || '').toLowerCase().includes(q) ||
        (s.cleanBForm || '').toLowerCase().includes(q) ||
        (s.cleanContact || '').toLowerCase().includes(q)

      const matchesCampus = selectedCampus === 'ALL' || s.cleanCampus === selectedCampus
      const matchesStatus = selectedStatus === 'ALL' || s.cleanStatus.toLowerCase() === selectedStatus.toLowerCase()
      const matchesFee = selectedFeeFilter === 'ALL' || s.cleanFee.toLowerCase() === selectedFeeFilter.toLowerCase()

      return matchesSearch && matchesCampus && matchesStatus && matchesFee
    })

    return filtered.sort((a, b) => {
      let valA = a[sortField] || ''
      let valB = b[sortField] || ''
      if (typeof valA === 'string') valA = valA.toLowerCase()
      if (typeof valB === 'string') valB = valB.toLowerCase()
      if (valA < valB) return sortDirection === 'asc' ? -1 : 1
      if (valA > valB) return sortDirection === 'asc' ? 1 : -1
      return 0
    })
  }, [normalizedStudents, searchQuery, selectedCampus, selectedStatus, selectedFeeFilter, sortField, sortDirection])

  const totalPages = Math.max(1, Math.ceil(filteredStudents.length / pageSize))
  const paginatedStudents = useMemo(() => {
    const start = (currentPage - 1) * pageSize
    return filteredStudents.slice(start, start + pageSize)
  }, [filteredStudents, currentPage, pageSize])

  const handleSort = (field) => {
    if (sortField === field) {
      setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc')
    } else {
      setSortField(field)
      setSortDirection('asc')
    }
  }

  // Select all on active page
  const handleToggleSelectAll = () => {
    if (selectedStudentIds.length === paginatedStudents.length) {
      setSelectedStudentIds([])
    } else {
      setSelectedStudentIds(paginatedStudents.map(s => s.id))
    }
  }

  const handleToggleSelectStudent = (id) => {
    if (selectedStudentIds.includes(id)) {
      setSelectedStudentIds(prev => prev.filter(x => x !== id))
    } else {
      setSelectedStudentIds(prev => [...prev, id])
    }
  }

  // Batch Status Update
  const handleBatchStatusUpdate = async (newStatus) => {
    if (selectedStudentIds.length === 0) return
    try {
      for (const id of selectedStudentIds) {
        if (typeof updateItem === 'function') {
          await updateItem('students', id, { status: newStatus })
        }
      }
      if (DataService?.logAuditEvent) {
        DataService.logAuditEvent('Superadmin batch updated ' + selectedStudentIds.length + ' students to [' + newStatus + ']', 'Super Administrator', 'Success')
      }
      toast?.success?.('Updated ' + selectedStudentIds.length + ' students to ' + newStatus + '!')
      setSelectedStudentIds([])
      window.dispatchEvent(new Event('sms_students_updated'))
    } catch {
      toast?.error?.('Failed to execute batch status update.')
    }
  }

  // Safe CSV Export
  const handleExportStudentsCSV = (onlySelected = false) => {
    const exportData = onlySelected 
      ? filteredStudents.filter(s => selectedStudentIds.includes(s.id))
      : filteredStudents

    if (exportData.length === 0) {
      toast?.info?.('No student records selected or available to export.')
      return
    }

    try {
      const headers = ['Student ID', 'Student Full Name', 'Roll Number', 'B-Form / CRC', 'Campus Affiliation', 'Academic Wing', 'Grade / Class', 'Enrollment Status', 'Fee Clearance', 'Contact Phone']
      const rows = exportData.map(s => [
        sanitizeCSV(s.id || ''),
        sanitizeCSV(s.name || ''),
        sanitizeCSV(s.cleanRoll),
        sanitizeCSV(s.cleanBForm),
        sanitizeCSV(s.cleanCampus),
        sanitizeCSV(s.cleanWing),
        sanitizeCSV(s.cleanGrade),
        sanitizeCSV(s.cleanStatus),
        sanitizeCSV(s.cleanFee),
        sanitizeCSV(s.cleanContact)
      ])

      const csvContent = 'data:text/csv;charset=utf-8,\uFEFF' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n')
      const encodedUri = encodeURI(csvContent)
      const link = document.createElement('a')
      link.setAttribute('href', encodedUri)
      link.setAttribute('download', 'Students_Roster_' + new Date().toISOString().slice(0, 10) + '.csv')
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      toast?.success?.('Successfully exported ' + exportData.length + ' student records to CSV!')
    } catch {
      toast?.error?.('Failed to generate CSV export.')
    }
  }

  // Mask B-Form Helper
  const maskBForm = (bform) => {
    if (!bform || bform === 'Unregistered') return 'Unregistered'
    if (!showMaskedBForm) return bform
    const clean = bform.replace(/[^0-9]/g, '')
    if (clean.length === 13) {
      return clean.slice(0, 5) + '-•••••••-' + clean.slice(-1)
    }
    return bform.slice(0, 4) + '••••' + bform.slice(-2)
  }

  // Modals & Inspection States
  const [inspectingStudent, setInspectingStudent] = useState(null)
  const [printingStudentIdCard, setPrintingStudentIdCard] = useState(null)

  const handleToggleStudentStatus = async (student) => {
    const isCurrentlyActive = (student.cleanStatus || 'Active').toLowerCase() === 'active'
    const newStatus = isCurrentlyActive ? 'Suspended' : 'Active'
    try {
      if (typeof updateItem === 'function') {
        await updateItem('students', student.id, { status: newStatus })
      }
      if (inspectingStudent && inspectingStudent.id === student.id) {
        setInspectingStudent(prev => ({ ...prev, status: newStatus, cleanStatus: newStatus }))
      }
      if (DataService?.logAuditEvent) {
        DataService.logAuditEvent('Superadmin toggled status of [' + student.name + '] to ' + newStatus, 'Super Administrator', 'Success')
      }
      toast?.success?.('Student ' + student.name + ' is now marked as ' + newStatus + '.')
      window.dispatchEvent(new Event('sms_students_updated'))
    } catch {
      toast?.error?.('Failed to update student status.')
    }
  }

  // -------------------------------------------------------------
  // 2. INTER-CAMPUS TRANSFERS
  // -------------------------------------------------------------
  const [transfers, setTransfers] = useState(() => {
    try {
      const stored = localStorage.getItem('sms_student_transfers')
      return stored ? JSON.parse(stored) : [
        { id: 'TR-101', studentName: 'Muhammad Hamza', rollNo: 'BHS-042', fromCampus: 'Beaconhouse Central High', toCampus: 'The City School Senior Branch', targetGrade: 'Grade 9-A', reason: 'Family residential relocation to new municipal district', status: 'Pending Approval', date: '2026-10-25', feeClearance: 'Verified Clear' },
        { id: 'TR-102', studentName: 'Ayesha Siddiqua', rollNo: 'LGS-118', fromCampus: 'Lahore Grammar Model Town', toCampus: 'Beaconhouse Central High', targetGrade: 'Grade 10-B', reason: 'Sibling admission alignment', status: 'Approved', date: '2026-10-21', feeClearance: 'Verified Clear' },
        { id: 'TR-103', studentName: 'Zainab Fatima', rollNo: 'BHS-099', fromCampus: 'The City School Senior Branch', toCampus: 'Lahore Grammar Model Town', targetGrade: 'Grade 8-A', reason: 'Advanced curricular stream transfer', status: 'Pending Approval', date: '2026-10-18', feeClearance: 'Pending Fee Payment' }
      ]
    } catch {
      return []
    }
  })

  const [isTransferModalOpen, setIsTransferModalOpen] = useState(false)
  const [transferFormData, setTransferFormData] = useState({
    studentId: '',
    studentName: '',
    rollNo: '',
    fromCampus: '',
    toCampus: '',
    targetGrade: '',
    reason: 'Family residential relocation to new municipal district',
    feeStatus: 'Paid'
  })

  const openTransferModal = () => {
    const firstStudent = normalizedStudents[0]
    const firstCampus = firstStudent?.cleanCampus || institutes[0]?.name || 'Beaconhouse Central High'
    const secondCampus = institutes.find(i => i.name !== firstCampus)?.name || 'The City School Senior Branch'

    setTransferFormData({
      studentId: firstStudent?.id || '',
      studentName: firstStudent?.name || '',
      rollNo: firstStudent?.cleanRoll || '',
      fromCampus: firstCampus,
      toCampus: secondCampus,
      targetGrade: firstStudent?.cleanGrade || 'Grade 9-A',
      reason: 'Family residential relocation to new municipal district',
      feeStatus: firstStudent?.cleanFee || 'Paid'
    })
    setIsTransferModalOpen(true)
  }

  const handleStudentSelectInTransfer = (stdId) => {
    const found = normalizedStudents.find(s => s.id === stdId)
    if (!found) return
    const altCampus = institutes.find(i => i.name !== found.cleanCampus)?.name || 'The City School Senior Branch'
    setTransferFormData(prev => ({
      ...prev,
      studentId: found.id,
      studentName: found.name,
      rollNo: found.cleanRoll,
      fromCampus: found.cleanCampus,
      toCampus: altCampus,
      targetGrade: found.cleanGrade,
      feeStatus: found.cleanFee
    }))
  }

  const handleCreateTransferSubmit = (e) => {
    e.preventDefault()
    const cleanStudent = transferFormData.studentName.trim()
    if (!cleanStudent) {
      toast?.error?.('Please specify a valid student.')
      return
    }

    if (transferFormData.fromCampus === transferFormData.toCampus) {
      toast?.error?.('Origin campus and destination campus cannot be identical.')
      return
    }

    const newTr = {
      id: 'TR-' + Date.now().toString().slice(-4),
      studentId: transferFormData.studentId,
      studentName: cleanStudent,
      rollNo: transferFormData.rollNo.trim() || 'REG-PENDING',
      fromCampus: transferFormData.fromCampus,
      toCampus: transferFormData.toCampus,
      targetGrade: transferFormData.targetGrade || 'Standard',
      reason: transferFormData.reason,
      date: new Date().toISOString().slice(0, 10),
      status: 'Pending Approval',
      feeClearance: transferFormData.feeStatus === 'Pending' ? 'Pending Fee Payment' : 'Verified Clear'
    }

    const updated = [newTr, ...transfers]
    setTransfers(updated)
    try {
      localStorage.setItem('sms_student_transfers', JSON.stringify(updated))
      if (DataService?.logAuditEvent) {
        DataService.logAuditEvent('Initiated inter-campus transfer for [' + cleanStudent + '] from [' + transferFormData.fromCampus + '] to [' + transferFormData.toCampus + ']', 'Super Administrator', 'Success')
      }
    } catch {}

    setIsTransferModalOpen(false)
    toast?.success?.('Inter-campus transfer request registered for ' + cleanStudent + '!')
  }

  const handleApproveTransfer = async (transferId) => {
    const tr = transfers.find(t => t.id === transferId)
    if (!tr) return

    // Find destination institute record
    const destInst = institutes.find(i => 
      i.name.toLowerCase() === tr.toCampus.toLowerCase() || 
      i.id === tr.toCampus
    )
    const targetInstituteId = destInst?.id || 'inst-' + Date.now().toString().slice(-4)

    // 1. Update transfer state
    const updated = transfers.map(t => t.id === transferId ? { ...t, status: 'Approved' } : t)
    setTransfers(updated)
    try {
      localStorage.setItem('sms_student_transfers', JSON.stringify(updated))
    } catch {}

    // 2. Synchronize student record across multi-tenant boundaries
    try {
      const studentMatch = normalizedStudents.find(s => 
        (tr.studentId && s.id === tr.studentId) ||
        (s.cleanRoll && s.cleanRoll === tr.rollNo) || 
        (s.name && s.name.toLowerCase() === tr.studentName.toLowerCase())
      )

      if (studentMatch && typeof updateItem === 'function') {
        await updateItem('students', studentMatch.id, { 
          campus: tr.toCampus,
          instituteId: targetInstituteId,
          className: tr.targetGrade || studentMatch.cleanGrade,
          updatedAt: new Date().toISOString()
        })
      }

      if (DataService?.logAuditEvent) {
        DataService.logAuditEvent('Authorized transfer [' + tr.id + '] for [' + tr.studentName + '] to campus [' + tr.toCampus + '] (Institute ID: ' + targetInstituteId + ')', 'Super Administrator', 'Success')
      }
      toast?.success?.('Transfer for ' + tr.studentName + ' authorized! Campus updated to ' + tr.toCampus + '.')
      window.dispatchEvent(new Event('sms_students_updated'))
    } catch {
      toast?.success?.('Inter-campus transfer "' + transferId + '" authorized.')
    }
  }

  const handleRejectTransfer = (transferId) => {
    const reason = window.prompt('Specify institutional deficiency for rejecting transfer (e.g. Unpaid fees, Missing clearance):', 'Unpaid fee balance at origin campus')
    if (reason === null) return

    const updated = transfers.map(t => t.id === transferId ? { ...t, status: 'Rejected', notes: reason } : t)
    setTransfers(updated)
    try {
      localStorage.setItem('sms_student_transfers', JSON.stringify(updated))
      if (DataService?.logAuditEvent) {
        DataService.logAuditEvent('Rejected transfer request [' + transferId + '] reason: ' + reason, 'Super Administrator', 'Success')
      }
    } catch {}
    toast?.info?.('Transfer ' + transferId + ' rejected.')
  }

  // -------------------------------------------------------------
  // 3. DUPLICATE & MERGE RECORDS
  // -------------------------------------------------------------
  const [duplicates, setDuplicates] = useState(() => {
    try {
      const stored = localStorage.getItem('sms_student_duplicates')
      return stored ? JSON.parse(stored) : [
        { id: 'DUP-01', name: 'Bilal Ahmed', bForm: '35201-4458921-3', recordA: { id: 'std-demo-a', roll: 'BHS-104', campus: 'Beaconhouse Central High', class: 'Grade 9-A' }, recordB: { id: 'std-demo-b', roll: 'BHS-219', campus: 'The City School Senior Branch', class: 'Grade 9-B' }, similarity: '98% (Identical NADRA CRC)' }
      ]
    } catch {
      return []
    }
  })

  const [dismissedDuplicates, setDismissedDuplicates] = useState(() => {
    try {
      const stored = localStorage.getItem('sms_dismissed_duplicates')
      return stored ? JSON.parse(stored) : []
    } catch {
      return []
    }
  })

  // Real campus scan for duplicate student identities with normalized B-Form matching
  const handleScanDuplicates = () => {
    const bFormMap = {}
    const foundDuplicates = []

    normalizedStudents.forEach(st => {
      const rawBForm = st.cleanBForm || ''
      const cleanDigits = rawBForm.replace(/[^0-9]/g, '')
      if (cleanDigits.length >= 9) {
        if (bFormMap[cleanDigits]) {
          const prev = bFormMap[cleanDigits]
          const collisionKey = 'DUP-' + cleanDigits.slice(-4)
          if (!dismissedDuplicates.includes(collisionKey)) {
            foundDuplicates.push({
              id: collisionKey,
              name: st.name,
              bForm: st.cleanBForm,
              recordA: { id: prev.id, roll: prev.cleanRoll, campus: prev.cleanCampus, class: prev.cleanGrade },
              recordB: { id: st.id, roll: st.cleanRoll, campus: st.cleanCampus, class: st.cleanGrade },
              similarity: '99% (Identical B-Form CRC ' + cleanDigits + ')'
            })
          }
        } else {
          bFormMap[cleanDigits] = st
        }
      }
    })

    if (foundDuplicates.length > 0) {
      setDuplicates(foundDuplicates)
      toast?.warning?.('Identified ' + foundDuplicates.length + ' student identity collision(s) across campus rosters!')
    } else {
      toast?.success?.('Identity Scan Complete: All student National Identity B-Forms and enrollment records are verified unique.')
    }
  }

  // True database mutation on merge: removes duplicate secondary profile
  const handleMergeDuplicate = async (dupId) => {
    const dup = duplicates.find(d => d.id === dupId)
    if (!dup) return

    try {
      if (dup.recordB?.id && typeof deleteItem === 'function') {
        await deleteItem('students', dup.recordB.id)
      }

      const updated = duplicates.filter(d => d.id !== dupId)
      setDuplicates(updated)
      localStorage.setItem('sms_student_duplicates', JSON.stringify(updated))

      if (DataService?.logAuditEvent) {
        DataService.logAuditEvent('Merged duplicate student [' + (dup.name || dupId) + '], purging secondary profile [' + dup.recordB?.roll + ']', 'Super Administrator', 'Success')
      }
      toast?.success?.('Student duplicate record ' + dupId + ' consolidated into primary canonical profile.')
      window.dispatchEvent(new Event('sms_students_updated'))
    } catch {
      toast?.error?.('Failed to execute merge operation.')
    }
  }

  const handleDismissDuplicate = (dupId) => {
    const updatedDismissed = [...dismissedDuplicates, dupId]
    setDismissedDuplicates(updatedDismissed)
    const updated = duplicates.filter(d => d.id !== dupId)
    setDuplicates(updated)
    try {
      localStorage.setItem('sms_dismissed_duplicates', JSON.stringify(updatedDismissed))
      localStorage.setItem('sms_student_duplicates', JSON.stringify(updated))
    } catch {}
    toast?.info?.('Duplicate flag ' + dupId + ' dismissed as false positive.')
  }

  // -------------------------------------------------------------
  // 4. ID / ROLL NUMBER RULES
  // -------------------------------------------------------------
  const [idRules, setIdRules] = useState(() => {
    try {
      const stored = localStorage.getItem('sms_student_id_rules')
      return stored ? JSON.parse(stored) : [
        { id: 'rule-1', campusId: 'all', campusName: 'Global Default Directive', prefix: 'EDU-{YEAR}-', digitLength: 4, separator: '-', sample: 'EDU-2026-0042' },
        { id: 'rule-2', campusId: 'inst-1', campusName: 'Beaconhouse Central High', prefix: 'BHS-{WING}-', digitLength: 4, separator: '-', sample: 'BHS-MS-0105' },
        { id: 'rule-3', campusId: 'inst-2', campusName: 'The City School Senior Branch', prefix: 'TCS-{YEAR}-', digitLength: 4, separator: '-', sample: 'TCS-2026-0089' }
      ]
    } catch {
      return []
    }
  })

  const [isPatternModalOpen, setIsPatternModalOpen] = useState(false)
  const [newPatternForm, setNewPatternForm] = useState({
    campusName: 'All Campuses (Universal Directive)',
    prefix: 'STD-{YEAR}-',
    digitLength: 4,
    separator: '-'
  })

  const handleSavePatternSubmit = (e) => {
    e.preventDefault()
    const currentYear = new Date().getFullYear()
    const padded = '1'.padStart(Number(newPatternForm.digitLength), '0')
    const sample = newPatternForm.prefix.replace('{YEAR}', currentYear).replace('{WING}', 'MS') + padded

    const matchingCampus = institutes.find(i => i.name.toLowerCase() === newPatternForm.campusName.toLowerCase())
    const campusId = newPatternForm.campusName.includes('All') ? 'all' : (matchingCampus?.id || 'custom')

    const newRule = {
      id: 'rule-' + Date.now(),
      campusId,
      campusName: newPatternForm.campusName,
      prefix: newPatternForm.prefix,
      digitLength: Number(newPatternForm.digitLength),
      separator: newPatternForm.separator,
      sample
    }

    const updated = [...idRules.filter(r => r.campusName !== newPatternForm.campusName), newRule]
    setIdRules(updated)
    try {
      localStorage.setItem('sms_student_id_rules', JSON.stringify(updated))
      if (DataService?.logAuditEvent) {
        DataService.logAuditEvent('Defined roll number mask [' + newPatternForm.prefix + '] for [' + newPatternForm.campusName + ']', 'Super Administrator', 'Success')
      }
    } catch {}

    setIsPatternModalOpen(false)
    toast?.success?.('Roll number format pattern for "' + newPatternForm.campusName + '" committed!')
  }

  const handleDeletePattern = (ruleId) => {
    const updated = idRules.filter(r => r.id !== ruleId)
    setIdRules(updated)
    try {
      localStorage.setItem('sms_student_id_rules', JSON.stringify(updated))
    } catch {}
    toast?.info?.('Roll number pattern deleted.')
  }

  // -------------------------------------------------------------
  // 5. DOCUMENT VERIFICATION
  // -------------------------------------------------------------
  const [docVerifications, setDocVerifications] = useState(() => {
    try {
      const stored = localStorage.getItem('sms_doc_verifications')
      return stored ? JSON.parse(stored) : [
        { id: 'DOC-501', studentName: 'Daniyal Tariq', campus: 'Beaconhouse Central High', docType: 'B-Form / NADRA CRC', status: 'Verified', date: '2026-10-27', remarks: 'Official NADRA verification confirmed' },
        { id: 'DOC-502', studentName: 'Sara Khan', campus: 'The City School Senior Branch', docType: 'Previous School Leaving Cert', status: 'Pending Review', date: '2026-10-28', remarks: 'Awaiting board attestation stamp' },
        { id: 'DOC-503', studentName: 'Usman Ghani', campus: 'Lahore Grammar Model Town', docType: 'Father CNIC & Immunization Card', status: 'Under Review', date: '2026-10-26', remarks: 'Document copy partially illegible' }
      ]
    } catch {
      return []
    }
  })

  const [inspectingDoc, setInspectingDoc] = useState(null)

  const handleVerifyDoc = async (docId) => {
    const updated = docVerifications.map(d => d.id === docId ? { ...d, status: 'Verified', remarks: 'Attested by Super Administrator' } : d)
    setDocVerifications(updated)
    if (inspectingDoc && inspectingDoc.id === docId) {
      setInspectingDoc(prev => ({ ...prev, status: 'Verified' }))
    }
    try {
      localStorage.setItem('sms_doc_verifications', JSON.stringify(updated))
      if (DataService?.logAuditEvent) {
        DataService.logAuditEvent('Verified document credentials [' + docId + ']', 'Super Administrator', 'Success')
      }
    } catch {}
    toast?.success?.('Document ' + docId + ' stamped and verified!')
  }

  const handleRejectDoc = (docId) => {
    const reason = window.prompt('Specify document rejection deficiency (e.g. Expired seal, Illegible photocopy, Missing board stamp):', 'Illegible photocopy scan')
    if (reason === null) return

    const updated = docVerifications.map(d => d.id === docId ? { ...d, status: 'Rejected', remarks: reason } : d)
    setDocVerifications(updated)
    if (inspectingDoc && inspectingDoc.id === docId) {
      setInspectingDoc(prev => ({ ...prev, status: 'Rejected', remarks: reason }))
    }
    try {
      localStorage.setItem('sms_doc_verifications', JSON.stringify(updated))
      if (DataService?.logAuditEvent) {
        DataService.logAuditEvent('Rejected document credentials [' + docId + '] reason: ' + reason, 'Super Administrator', 'Success')
      }
    } catch {}
    toast?.info?.('Document ' + docId + ' marked Rejected with deficiency feedback.')
  }

  // -------------------------------------------------------------
  // 6. ALUMNI & DEGREE VERIFICATION
  // -------------------------------------------------------------
  const [degreeSearchQuery, setDegreeSearchQuery] = useState('')
  const [searchAttempted, setSearchAttempted] = useState(false)
  const [verifiedDegreeRecord, setVerifiedDegreeRecord] = useState(null)
  const [isRegisterAlumnusModalOpen, setIsRegisterAlumnusModalOpen] = useState(false)

  // Combined historic alumni database + any students with status 'Graduated'
  const alumniDatabase = useMemo(() => {
    const base = [
      { regNo: 'DEG-2024-9981', studentName: 'Hamza Farooq', cnic: '35201-9988112-3', program: 'Higher Secondary School Certificate (HSSC Pre-Engineering)', graduationYear: '2024', grade: 'A+ (92.4%)', campus: 'Beaconhouse Central High', issueDate: '2024-08-15', sealRef: 'PK-BISE-LHR-2024-8871' },
      { regNo: 'DEG-2023-4105', studentName: 'Fatima Noor', cnic: '35202-7711223-4', program: 'Secondary School Certificate (SSC Science Group)', graduationYear: '2023', grade: 'A+ (94.8%)', campus: 'The City School Senior Branch', issueDate: '2023-07-22', sealRef: 'PK-FBISE-ISB-2023-4102' },
      { regNo: 'BHS-2026-01', studentName: 'Abdullah Khan', cnic: '35201-1122334-1', program: 'Middle Standard School Certificate (Grade 8)', graduationYear: '2026', grade: 'A (88.2%)', campus: 'Beaconhouse Central High', issueDate: '2026-05-30', sealRef: 'PK-EIMS-GEN-0021' }
    ]

    const graduatedFromDb = normalizedStudents.filter(s => s.cleanStatus === 'Graduated').map((s, idx) => ({
      regNo: 'ALM-' + (s.cleanRoll || 'GRAD-' + idx),
      studentName: s.name,
      cnic: s.cleanBForm,
      program: s.cleanGrade + ' (' + s.cleanWing + ')',
      graduationYear: new Date().getFullYear().toString(),
      grade: 'First Class Honor',
      campus: s.cleanCampus,
      issueDate: new Date().toISOString().slice(0, 10),
      sealRef: 'PK-EIMS-DEG-' + s.id
    }))

    return [...base, ...graduatedFromDb]
  }, [normalizedStudents])

  const [newAlumnusForm, setNewAlumnusForm] = useState({
    studentName: '',
    cnic: '',
    program: 'Higher Secondary School Certificate (HSSC)',
    graduationYear: '2025',
    grade: 'A+ (90%)',
    campus: 'Beaconhouse Central High'
  })

  const handleRegisterAlumnusSubmit = (e) => {
    e.preventDefault()
    if (!newAlumnusForm.studentName.trim()) {
      toast?.error?.('Please enter student name.')
      return
    }

    const regNo = 'DEG-' + newAlumnusForm.graduationYear + '-' + Math.floor(1000 + Math.random() * 9000)
    const newEntry = {
      ...newAlumnusForm,
      regNo,
      issueDate: new Date().toISOString().slice(0, 10),
      sealRef: 'PK-SUPERADMIN-REG-' + Date.now().toString().slice(-4)
    }

    setVerifiedDegreeRecord(newEntry)
    setIsRegisterAlumnusModalOpen(false)
    toast?.success?.('Registered new graduate record: ' + regNo)
  }

  const handleVerifyCredentialSearch = (e) => {
    e.preventDefault()
    const q = degreeSearchQuery.trim().toUpperCase()
    if (!q) {
      toast?.info?.('Please enter a degree serial, registration number, or student name.')
      return
    }

    setSearchAttempted(true)
    const match = alumniDatabase.find(a => 
      a.regNo.toUpperCase() === q || 
      a.studentName.toUpperCase().includes(q) ||
      a.cnic.replace(/[^0-9]/g, '') === q.replace(/[^0-9]/g, '')
    )

    if (match) {
      setVerifiedDegreeRecord(match)
      toast?.success?.('Degree Authenticated: Verified credentials for ' + match.studentName + '!')
    } else {
      setVerifiedDegreeRecord(null)
      toast?.warning?.('No authentic credential matching "' + q + '" located in platform registry.')
    }
  }

  // -------------------------------------------------------------
  // 7. DATA & PRIVACY REQUESTS
  // -------------------------------------------------------------
  const [privacyRequests, setPrivacyRequests] = useState(() => {
    try {
      const stored = localStorage.getItem('sms_privacy_requests')
      return stored ? JSON.parse(stored) : [
        { id: 'PR-901', requester: 'Parent: Dr. Asim Qureshi', student: 'Mustafa Qureshi', studentId: 'std-1', type: 'Data Export (Archive)', status: 'Fulfilled', date: '2026-10-20', details: 'Full academic and fee ledger archive' },
        { id: 'PR-902', requester: 'Guardian: Tariq Mehmood', student: 'Saad Mehmood', studentId: 'std-2', type: 'Right to Be Forgotten (Purge)', status: 'Awaiting Superadmin Authorization', date: '2026-10-28', details: 'Purge non-essential marketing contacts and biometric records' }
      ]
    } catch {
      return []
    }
  })

  const handleProcessPrivacyRequest = async (req) => {
    if (req.type.includes('Export')) {
      const matchedStudent = normalizedStudents.find(s => s.name.toLowerCase() === req.student.toLowerCase() || s.id === req.studentId)
      const archiveData = {
        exportType: 'GDPR_STUDENT_DATA_PORTABILITY_ARCHIVE',
        requestId: req.id,
        timestamp: new Date().toISOString(),
        studentDossier: matchedStudent || { name: req.student },
        requester: req.requester,
        status: 'AUTHENTICATED_DISPATCH',
        systemMetadata: {
          governanceAuthority: 'Platform Super Administrator Console',
          retentionPolicy: 'Institutional Compliance Mandate'
        }
      }

      const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(archiveData, null, 2))
      const a = document.createElement('a')
      a.href = dataStr
      a.download = 'student_data_archive_' + req.student.replace(/\s+/g, '_') + '.json'
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)

      const updated = privacyRequests.map(p => p.id === req.id ? { ...p, status: 'Fulfilled' } : p)
      setPrivacyRequests(updated)
      try { localStorage.setItem('sms_privacy_requests', JSON.stringify(updated)) } catch {}
      toast?.success?.('Exported encrypted student data archive for ' + req.student + '!')
    } else {
      if (window.confirm('Authorize regulatory compliance purge for "' + req.student + '"? Personal identifying information (phone, address, parent details) will be permanently anonymized.')) {
        try {
          const matchedStudent = normalizedStudents.find(s => s.name.toLowerCase() === req.student.toLowerCase() || s.id === req.studentId)
          if (matchedStudent && typeof updateItem === 'function') {
            await updateItem('students', matchedStudent.id, {
              name: 'Anonymized Student [' + matchedStudent.id.slice(-4) + ']',
              bFormCnic: '[REDACTED]',
              guardianPhone: '[REDACTED]',
              phone: '[REDACTED]',
              emergencyContact: '[REDACTED]',
              fatherName: '[REDACTED]',
              address: '[REDACTED]'
            })
          }

          const updated = privacyRequests.map(p => p.id === req.id ? { ...p, status: 'Fulfilled' } : p)
          setPrivacyRequests(updated)
          localStorage.setItem('sms_privacy_requests', JSON.stringify(updated))

          if (DataService?.logAuditEvent) {
            DataService.logAuditEvent('Executed GDPR PII anonymization purge for student [' + req.student + ']', 'Super Administrator', 'Success')
          }
          toast?.success?.('Privacy request ' + req.id + ' fulfilled! PII successfully redacted.')
          window.dispatchEvent(new Event('sms_students_updated'))
        } catch {
          toast?.error?.('Failed to process compliance purge.')
        }
      }
    }
  }

  // -------------------------------------------------------------
  // 8. STUDENT REPORTS & AGGREGATIONS
  // -------------------------------------------------------------
  const reportStats = useMemo(() => {
    const total = normalizedStudents.length
    const active = normalizedStudents.filter(s => (s.cleanStatus || 'Active').toLowerCase() === 'active').length
    const suspended = total - active
    const activeRate = total > 0 ? Math.round((active / total) * 100) : 100

    // Campus Distribution
    const campusCounts = {}
    normalizedStudents.forEach(s => {
      const c = s.cleanCampus || 'Main Campus'
      campusCounts[c] = (campusCounts[c] || 0) + 1
    })

    // Wing Distribution
    const wingCounts = {}
    normalizedStudents.forEach(s => {
      const w = s.cleanWing || 'School Wing'
      wingCounts[w] = (wingCounts[w] || 0) + 1
    })

    // Gender Breakdown
    let males = 0
    let females = 0
    normalizedStudents.forEach(s => {
      const g = (s.cleanGender || '').toLowerCase()
      if (g === 'female') females++
      else males++
    })
    const malePct = total > 0 ? Math.round((males / total) * 100) : 50
    const femalePct = total > 0 ? (100 - malePct) : 50

    // Fee Clearance Health
    const paidFees = normalizedStudents.filter(s => (s.cleanFee || 'Paid').toLowerCase() === 'paid').length
    const pendingFees = total - paidFees
    const feeClearancePct = total > 0 ? Math.round((paidFees / total) * 100) : 100

    return { total, active, suspended, activeRate, campusCounts, wingCounts, males, females, malePct, femalePct, paidFees, pendingFees, feeClearancePct }
  }, [normalizedStudents])

  return (
    <div className="space-y-6">
      {/* ------------------------------------------------------------- */}
      {/* SUPERADMIN STUDENT HEADER WITH BADGE                           */}
      {/* ------------------------------------------------------------- */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-5 sm:p-6 shadow-2xs">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wide bg-purple-100 text-purple-800 border border-purple-200">
                Multi-Campus Student Lifecycle
              </span>
              <span className="flex items-center gap-1 text-[11px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                <span>Active Network: {reportStats.total} Students</span>
              </span>
            </div>
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
              Central Student Governance & Records
            </h1>
            <p className="text-xs sm:text-sm text-slate-500">
              Cross-campus identity verification, inter-branch student relocation, roll number standardization, and privacy compliance.
            </p>
          </div>

          <div className="flex items-center gap-2.5 flex-wrap">
            <button
              type="button"
              onClick={openTransferModal}
              className="px-3.5 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-xs font-bold transition-all shadow-2xs cursor-pointer inline-flex items-center gap-1.5"
            >
              <ArrowLeftRight className="w-3.5 h-3.5" />
              <span>Initiate Transfer</span>
            </button>
            <button
              type="button"
              onClick={() => handleExportStudentsCSV(false)}
              className="px-3.5 py-2 bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 rounded-xl text-xs font-bold transition-all shadow-2xs cursor-pointer inline-flex items-center gap-1.5"
            >
              <Download className="w-3.5 h-3.5 text-purple-600" />
              <span>Roster CSV</span>
            </button>
          </div>
        </div>

        {/* SUB-ROUTE TAB NAVIGATION PILLS */}
        <div className="mt-5 pt-4 border-t border-slate-100 flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
          {[
            { key: 'all', label: 'All Students', icon: Users, count: normalizedStudents.length },
            { key: 'transfers', label: 'Inter-Campus Transfers', icon: ArrowLeftRight, count: transfers.filter(t => t.status === 'Pending Approval').length },
            { key: 'duplicate', label: 'Duplicate Records', icon: GitMerge, count: duplicates.length },
            { key: 'id-rules', label: 'ID / Roll Rules', icon: Hash, count: idRules.length },
            { key: 'verification', label: 'Document Attestation', icon: FileCheck, count: docVerifications.filter(d => d.status !== 'Verified').length },
            { key: 'alumni', label: 'Alumni & Degrees', icon: Award, count: alumniDatabase.length },
            { key: 'privacy', label: 'Data & Privacy', icon: ShieldAlert, count: privacyRequests.filter(p => p.status !== 'Fulfilled').length },
            { key: 'reports', label: 'Analytics & Reports', icon: BarChart3 }
          ].map(t => {
            const Icon = t.icon
            const isActive = effectiveTab === t.key
            return (
              <button
                key={t.key}
                onClick={() => handleTabSwitch(t.key)}
                className={'flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ' + (
                  isActive 
                    ? 'bg-purple-600 text-white shadow-2xs' 
                    : 'bg-slate-50 hover:bg-slate-100 text-slate-600 hover:text-slate-900 border border-slate-200/70'
                )}
              >
                <Icon className={'w-3.5 h-3.5 ' + (isActive ? 'text-white' : 'text-slate-400')} />
                <span>{t.label}</span>
                {t.count !== undefined && (
                  <span className={'px-1.5 py-0.5 rounded-full text-[10px] font-mono font-bold ' + (
                    isActive ? 'bg-purple-700 text-white' : 'bg-slate-200 text-slate-700'
                  )}>
                    {t.count}
                  </span>
                )}
              </button>
            )
          })}
        </div>
      </div>

      {/* ------------------------------------------------------------- */}
      {/* TAB 1: ALL STUDENTS (CROSS-CAMPUS ROSTER)                    */}
      {/* ------------------------------------------------------------- */}
      {effectiveTab === 'all' && (
        <div className="space-y-4">
          <div className="bg-white rounded-2xl border border-slate-200/80 p-4 shadow-2xs flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3">
            <div className="flex-1 flex items-center gap-2 relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5" />
              <input
                type="text"
                placeholder="Search by student name, roll number, campus, B-Form, or contact phone..."
                value={searchQuery}
                onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }}
                className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-purple-500/20"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            <div className="flex items-center gap-2 flex-wrap">
              <select
                value={selectedCampus}
                onChange={(e) => { setSelectedCampus(e.target.value); setCurrentPage(1); }}
                className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 cursor-pointer"
              >
                <option value="ALL">All Campuses ({normalizedStudents.length})</option>
                {Array.from(new Set(normalizedStudents.map(s => s.cleanCampus).filter(Boolean))).map(cName => (
                  <option key={cName} value={cName}>{cName}</option>
                ))}
              </select>

              <select
                value={selectedStatus}
                onChange={(e) => { setSelectedStatus(e.target.value); setCurrentPage(1); }}
                className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 cursor-pointer"
              >
                <option value="ALL">All Statuses</option>
                <option value="Active">Active</option>
                <option value="Suspended">Suspended</option>
                <option value="Graduated">Graduated</option>
              </select>

              <select
                value={selectedFeeFilter}
                onChange={(e) => { setSelectedFeeFilter(e.target.value); setCurrentPage(1); }}
                className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 cursor-pointer"
              >
                <option value="ALL">All Fee Dues</option>
                <option value="Paid">Dues Cleared</option>
                <option value="Pending">Dues Pending</option>
              </select>

              <button
                type="button"
                onClick={() => setShowMaskedBForm(!showMaskedBForm)}
                className="px-3 py-2 bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200 rounded-xl text-xs font-semibold cursor-pointer inline-flex items-center gap-1.5"
                title={showMaskedBForm ? 'Reveal B-Forms / CNIC' : 'Mask B-Forms'}
              >
                {showMaskedBForm ? <Eye className="w-3.5 h-3.5 text-purple-600" /> : <EyeOff className="w-3.5 h-3.5 text-slate-500" />}
                <span>{showMaskedBForm ? 'Reveal IDs' : 'Mask IDs'}</span>
              </button>

              {(searchQuery || selectedCampus !== 'ALL' || selectedStatus !== 'ALL' || selectedFeeFilter !== 'ALL') && (
                <button
                  type="button"
                  onClick={() => { setSearchQuery(''); setSelectedCampus('ALL'); setSelectedStatus('ALL'); setSelectedFeeFilter('ALL'); }}
                  className="px-2.5 py-1.5 text-xs text-purple-600 hover:text-purple-800 font-semibold cursor-pointer"
                >
                  Reset
                </button>
              )}
            </div>
          </div>

          {/* BATCH ACTION BAR (Shown when students are selected) */}
          {selectedStudentIds.length > 0 && (
            <div className="bg-purple-50 border border-purple-200 p-3 rounded-2xl flex items-center justify-between gap-3 text-xs">
              <span className="font-bold text-purple-900 flex items-center gap-2">
                <CheckSquare className="w-4 h-4 text-purple-600" />
                <span>{selectedStudentIds.length} Student(s) Selected</span>
              </span>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => handleBatchStatusUpdate('Active')}
                  className="px-3 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-bold cursor-pointer"
                >
                  Activate Selected
                </button>
                <button
                  type="button"
                  onClick={() => handleBatchStatusUpdate('Suspended')}
                  className="px-3 py-1 bg-rose-600 hover:bg-rose-700 text-white rounded-lg font-bold cursor-pointer"
                >
                  Suspend Selected
                </button>
                <button
                  type="button"
                  onClick={() => handleExportStudentsCSV(true)}
                  className="px-3 py-1 bg-white hover:bg-slate-50 text-slate-700 border border-slate-300 rounded-lg font-bold cursor-pointer inline-flex items-center gap-1"
                >
                  <Download className="w-3 h-3 text-purple-600" />
                  <span>Export Selected</span>
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedStudentIds([])}
                  className="text-slate-500 hover:text-slate-700 ml-2"
                >
                  Clear Selection
                </button>
              </div>
            </div>
          )}

          {/* MAIN STUDENTS TABLE */}
          <div className="bg-white rounded-2xl border border-slate-200/80 overflow-hidden shadow-2xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-600">
                <thead className="bg-slate-50/75 border-b border-slate-200/80 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                  <tr>
                    <th className="py-3.5 px-4 w-10">
                      <button
                        type="button"
                        onClick={handleToggleSelectAll}
                        className="text-slate-400 hover:text-purple-600 cursor-pointer"
                      >
                        {selectedStudentIds.length > 0 && selectedStudentIds.length === paginatedStudents.length ? (
                          <CheckSquare className="w-4 h-4 text-purple-600" />
                        ) : (
                          <Square className="w-4 h-4" />
                        )}
                      </button>
                    </th>
                    <th onClick={() => handleSort('name')} className="py-3.5 px-4 cursor-pointer hover:text-purple-700 select-none">
                      <div className="flex items-center gap-1.5">
                        <span>Student & Roll No</span>
                        {sortField === 'name' ? (
                          sortDirection === 'asc' ? <ArrowUp className="w-3 h-3 text-purple-600" /> : <ArrowDown className="w-3 h-3 text-purple-600" />
                        ) : <ArrowUpDown className="w-3 h-3 text-slate-300" />}
                      </div>
                    </th>
                    <th onClick={() => handleSort('cleanCampus')} className="py-3.5 px-4 cursor-pointer hover:text-purple-700 select-none">
                      <div className="flex items-center gap-1.5">
                        <span>Affiliated Campus</span>
                        {sortField === 'cleanCampus' ? (
                          sortDirection === 'asc' ? <ArrowUp className="w-3 h-3 text-purple-600" /> : <ArrowDown className="w-3 h-3 text-purple-600" />
                        ) : <ArrowUpDown className="w-3 h-3 text-slate-300" />}
                      </div>
                    </th>
                    <th className="py-3.5 px-4">Wing & Grade</th>
                    <th className="py-3.5 px-4">B-Form / CRC</th>
                    <th onClick={() => handleSort('cleanStatus')} className="py-3.5 px-4 cursor-pointer hover:text-purple-700 select-none">
                      <div className="flex items-center gap-1.5">
                        <span>Status</span>
                        {sortField === 'cleanStatus' ? (
                          sortDirection === 'asc' ? <ArrowUp className="w-3 h-3 text-purple-600" /> : <ArrowDown className="w-3 h-3 text-purple-600" />
                        ) : <ArrowUpDown className="w-3 h-3 text-slate-300" />}
                      </div>
                    </th>
                    <th className="py-3.5 px-4">Fee Clearance</th>
                    <th className="py-3.5 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {paginatedStudents.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="py-12 text-center text-slate-400">
                        <GraduationCap className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                        <p className="font-semibold text-slate-600">No student records match the active criteria.</p>
                      </td>
                    </tr>
                  ) : (
                    paginatedStudents.map((st) => (
                      <tr key={st.id} className="hover:bg-slate-50/70 transition-colors">
                        <td className="py-3.5 px-4">
                          <input
                            type="checkbox"
                            checked={selectedStudentIds.includes(st.id)}
                            onChange={() => handleToggleSelectStudent(st.id)}
                            className="rounded text-purple-600 cursor-pointer"
                          />
                        </td>
                        <td className="py-3.5 px-4">
                          <div className="font-bold text-slate-900">{st.name}</div>
                          <span className="font-mono text-[11px] text-purple-700 font-semibold">{st.cleanRoll}</span>
                        </td>
                        <td className="py-3.5 px-4">
                          <span className="inline-flex items-center gap-1.5 text-slate-700 font-medium">
                            <Building2 className="w-3.5 h-3.5 text-slate-400" />
                            <span>{st.cleanCampus}</span>
                          </span>
                        </td>
                        <td className="py-3.5 px-4">
                          <div className="font-medium text-slate-800">{st.cleanGrade}</div>
                          <span className="text-[10px] text-slate-400">{st.cleanWing}</span>
                        </td>
                        <td className="py-3.5 px-4 font-mono text-[11px] text-slate-600">
                          {maskBForm(st.cleanBForm)}
                        </td>
                        <td className="py-3.5 px-4">
                          <span className={'px-2.5 py-0.5 rounded-full text-[10px] font-bold ' + (
                            st.cleanStatus === 'Active' 
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                              : st.cleanStatus === 'Graduated'
                              ? 'bg-indigo-50 text-indigo-700 border border-indigo-200'
                              : 'bg-rose-50 text-rose-700 border border-rose-200'
                          )}>
                            {st.cleanStatus}
                          </span>
                        </td>
                        <td className="py-3.5 px-4">
                          <span className={'px-2 py-0.5 rounded-full text-[10px] font-bold ' + (
                            st.cleanFee === 'Paid'
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                              : 'bg-amber-50 text-amber-700 border border-amber-200'
                          )}>
                            {st.cleanFee === 'Paid' ? 'Cleared' : 'Pending Dues'}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              type="button"
                              onClick={() => setInspectingStudent(st)}
                              className="p-1.5 text-purple-600 hover:text-purple-900 hover:bg-purple-50 rounded-lg transition-colors cursor-pointer border border-transparent hover:border-purple-200"
                              title="Inspect Student 360 Profile"
                            >
                              <Eye className="w-3.5 h-3.5" />
                            </button>
                            <button
                              type="button"
                              onClick={() => setPrintingStudentIdCard(st)}
                              className="p-1.5 text-indigo-600 hover:text-indigo-900 hover:bg-indigo-50 rounded-lg transition-colors cursor-pointer border border-transparent hover:border-indigo-200"
                              title="Print Student ID Card Badge"
                            >
                              <IdCard className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination Controls */}
            {filteredStudents.length > 0 && (
              <div className="p-3.5 sm:p-4 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs bg-slate-50/50">
                <span className="text-slate-500 font-medium">
                  Showing <strong>{Math.min(filteredStudents.length, (currentPage - 1) * pageSize + 1)}</strong> to <strong>{Math.min(filteredStudents.length, currentPage * pageSize)}</strong> of <strong>{filteredStudents.length}</strong> students
                </span>

                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-1 mr-2">
                    <span className="text-slate-400 font-medium">Per Page:</span>
                    <select
                      value={pageSize}
                      onChange={(e) => { setPageSize(Number(e.target.value)); setCurrentPage(1); }}
                      className="px-2 py-1 bg-white border border-slate-200 rounded-lg font-bold text-slate-700 cursor-pointer"
                    >
                      <option value={10}>10</option>
                      <option value={25}>25</option>
                      <option value={50}>50</option>
                    </select>
                  </div>

                  <button
                    type="button"
                    disabled={currentPage <= 1}
                    onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                    className="px-3 py-1.5 bg-white border border-slate-200 rounded-xl font-bold text-slate-600 disabled:opacity-40 cursor-pointer"
                  >
                    Previous
                  </button>
                  <span className="px-2.5 py-1 font-mono font-bold text-purple-700 bg-purple-50 rounded-lg border border-purple-200">
                    {currentPage} / {totalPages}
                  </span>
                  <button
                    type="button"
                    disabled={currentPage >= totalPages}
                    onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                    className="px-3 py-1.5 bg-white border border-slate-200 rounded-xl font-bold text-slate-600 disabled:opacity-40 cursor-pointer"
                  >
                    Next
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* TAB 2: INTER-CAMPUS TRANSFERS                                */}
      {/* ------------------------------------------------------------- */}
      {effectiveTab === 'transfers' && (
        <div className="space-y-4">
          <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-2xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <h3 className="text-sm font-bold text-slate-900">Inter-Campus Student Relocation Governance</h3>
              <p className="text-xs text-slate-500">Authorize or reject cross-campus student branch relocations with automated multi-tenant database synchronization.</p>
            </div>
            <button
              type="button"
              onClick={openTransferModal}
              className="px-3.5 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-xs font-bold transition-all shadow-2xs cursor-pointer inline-flex items-center gap-1.5"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Initiate New Transfer</span>
            </button>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200/80 overflow-hidden shadow-2xs">
            <table className="w-full text-left text-xs text-slate-600">
              <thead className="bg-slate-50/75 border-b border-slate-200/80 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                <tr>
                  <th className="py-3.5 px-4">Transfer ID</th>
                  <th className="py-3.5 px-4">Student Name & Roll</th>
                  <th className="py-3.5 px-4">Origin Campus</th>
                  <th className="py-3.5 px-4">Destination Campus</th>
                  <th className="py-3.5 px-4">Financial Clearance</th>
                  <th className="py-3.5 px-4">Request Date</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4 text-right">Superadmin Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {transfers.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="py-12 text-center text-slate-400">
                      <ArrowLeftRight className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                      <p className="font-semibold text-slate-600">No transfer requests registered.</p>
                    </td>
                  </tr>
                ) : (
                  transfers.map((tr) => (
                    <tr key={tr.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="py-3.5 px-4 font-mono font-bold text-slate-900">{tr.id}</td>
                      <td className="py-3.5 px-4">
                        <div className="font-bold text-slate-900">{tr.studentName}</div>
                        <span className="font-mono text-[11px] text-purple-700">{tr.rollNo}</span>
                      </td>
                      <td className="py-3.5 px-4 font-medium text-slate-700">{tr.fromCampus}</td>
                      <td className="py-3.5 px-4 font-bold text-purple-700">{tr.toCampus}</td>
                      <td className="py-3.5 px-4">
                        <span className={'px-2 py-0.5 rounded-full text-[10px] font-bold ' + (
                          tr.feeClearance === 'Verified Clear' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-amber-50 text-amber-700 border border-amber-200'
                        )}>
                          {tr.feeClearance || 'Verified Clear'}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 font-mono text-[11px] text-slate-500">{tr.date}</td>
                      <td className="py-3.5 px-4">
                        <span className={'px-2.5 py-0.5 rounded-full text-[10px] font-bold ' + (
                          tr.status === 'Approved'
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            : tr.status === 'Rejected'
                            ? 'bg-rose-50 text-rose-700 border border-rose-200'
                            : 'bg-amber-50 text-amber-700 border border-amber-200'
                        )}>
                          {tr.status}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        {tr.status === 'Pending Approval' ? (
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              type="button"
                              onClick={() => handleApproveTransfer(tr.id)}
                              className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold transition-all shadow-2xs cursor-pointer inline-flex items-center gap-1"
                            >
                              <Check className="w-3 h-3" />
                              <span>Authorize</span>
                            </button>
                            <button
                              type="button"
                              onClick={() => handleRejectTransfer(tr.id)}
                              className="px-2.5 py-1 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 rounded-lg text-xs font-bold transition-all cursor-pointer inline-flex items-center gap-1"
                            >
                              <X className="w-3 h-3" />
                              <span>Reject</span>
                            </button>
                          </div>
                        ) : (
                          <span className={'text-[11px] font-bold inline-flex items-center gap-1 ' + (
                            tr.status === 'Approved' ? 'text-emerald-700' : 'text-rose-600'
                          )}>
                            {tr.status === 'Approved' ? <CheckCircle2 className="w-3.5 h-3.5" /> : <XCircle className="w-3.5 h-3.5" />}
                            <span>{tr.status}</span>
                          </span>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* TAB 3: DUPLICATE & MERGE RECORDS                             */}
      {/* ------------------------------------------------------------- */}
      {effectiveTab === 'duplicate' && (
        <div className="space-y-4">
          <div className="bg-amber-50 border border-amber-200/80 p-4 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs text-amber-900">
            <div className="flex items-center gap-2.5">
              <GitMerge className="w-5 h-5 text-amber-600 shrink-0" />
              <div>
                <strong>Cross-Campus Identity Deduplication:</strong> Automated scanner identifies colliding National Identity B-Forms and registration conflicts across franchised campuses.
              </div>
            </div>
            <button
              type="button"
              onClick={handleScanDuplicates}
              className="px-3.5 py-1.5 bg-amber-600 hover:bg-amber-700 text-white rounded-xl font-bold cursor-pointer shrink-0 shadow-2xs inline-flex items-center gap-1.5"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Scan Campuses Now</span>
            </button>
          </div>

          {duplicates.length === 0 ? (
            <div className="bg-white rounded-2xl border border-slate-200/80 p-12 text-center shadow-2xs space-y-2">
              <CheckCircle2 className="w-10 h-10 text-emerald-500 mx-auto" />
              <h4 className="text-sm font-bold text-slate-800">Clean Identity Registry</h4>
              <p className="text-xs text-slate-500 max-w-md mx-auto">No student duplicate conflicts or colliding National Identity B-Form numbers detected across affiliated branches.</p>
            </div>
          ) : (
            duplicates.map(d => (
              <div key={d.id} className="bg-white rounded-2xl border border-slate-200 p-5 shadow-2xs space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span>
                    <h4 className="font-bold text-slate-900 text-sm">Potential Duplicate Collision: {d.name}</h4>
                    <span className="font-mono text-[11px] bg-slate-100 text-slate-700 px-2 py-0.5 rounded-md">B-Form: {d.bForm}</span>
                  </div>
                  <span className="text-xs font-bold text-rose-600 bg-rose-50 px-2.5 py-1 rounded-full border border-rose-200">
                    {d.similarity}
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200/70 text-xs space-y-1">
                    <strong className="text-purple-700 block">Record A (Canonical Enrolled Profile)</strong>
                    <div>Campus: <strong className="text-slate-800">{d.recordA.campus}</strong></div>
                    <div>Roll No: <span className="font-mono text-purple-700 font-bold">{d.recordA.roll}</span> &bull; {d.recordA.class}</div>
                  </div>
                  <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200/70 text-xs space-y-1">
                    <strong className="text-rose-700 block">Record B (Duplicate Secondary Flag)</strong>
                    <div>Campus: <strong className="text-slate-800">{d.recordB.campus}</strong></div>
                    <div>Roll No: <span className="font-mono text-rose-700 font-bold">{d.recordB.roll}</span> &bull; {d.recordB.class}</div>
                  </div>
                </div>

                <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => handleDismissDuplicate(d.id)}
                    className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold cursor-pointer"
                  >
                    Dismiss Flag
                  </button>
                  <button
                    type="button"
                    onClick={() => handleMergeDuplicate(d.id)}
                    className="px-3.5 py-1.5 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-xs font-bold transition-all shadow-2xs cursor-pointer inline-flex items-center gap-1.5"
                  >
                    <GitMerge className="w-3.5 h-3.5" />
                    <span>Consolidate & Merge Record</span>
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* TAB 4: ID / ROLL NUMBER RULES                                */}
      {/* ------------------------------------------------------------- */}
      {effectiveTab === 'id-rules' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div>
              <h3 className="text-sm font-bold text-slate-900">Platform Roll Number Mask Directives</h3>
              <p className="text-xs text-slate-500">Configure campus numbering schemes. These directives automatically govern sequential roll number generation in campus enrollment.</p>
            </div>
            <button
              type="button"
              onClick={() => setIsPatternModalOpen(true)}
              className="px-3.5 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-xs font-bold transition-all shadow-2xs cursor-pointer inline-flex items-center gap-1.5"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Define Pattern</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {idRules.map(r => (
              <div key={r.id} className="bg-white rounded-2xl border border-slate-200 p-5 shadow-2xs space-y-3 relative group">
                <div className="flex items-center justify-between">
                  <span className="font-mono text-[11px] font-bold text-purple-700 bg-purple-50 px-2 py-0.5 rounded-md border border-purple-200">
                    {r.prefix}
                  </span>
                  <button
                    type="button"
                    onClick={() => handleDeletePattern(r.id)}
                    className="text-slate-400 hover:text-rose-600 p-1 rounded-lg transition-colors cursor-pointer"
                    title="Delete pattern rule"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>

                <div>
                  <h4 className="font-bold text-slate-900 text-sm">{r.campusName}</h4>
                  <p className="text-xs text-slate-500 mt-0.5">Digit Length: {r.digitLength} digits &bull; Delimiter: '{r.separator}'</p>
                </div>

                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/80">
                  <span className="text-[10px] text-slate-400 uppercase font-bold block">Live Specimen Output</span>
                  <div className="font-mono font-bold text-slate-900 text-sm mt-0.5">{r.sample}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* TAB 5: DOCUMENT VERIFICATION                                 */}
      {/* ------------------------------------------------------------- */}
      {effectiveTab === 'verification' && (
        <div className="space-y-4">
          <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-2xs">
            <h3 className="text-sm font-bold text-slate-900">National Identity & Board Credential Attestation</h3>
            <p className="text-xs text-slate-500">Superadministrator queue for validating student NADRA birth certificates, school leaving certificates, and board transcripts.</p>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200/80 overflow-hidden shadow-2xs">
            <table className="w-full text-left text-xs text-slate-600">
              <thead className="bg-slate-50/75 border-b border-slate-200/80 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                <tr>
                  <th className="py-3.5 px-4">Doc ID</th>
                  <th className="py-3.5 px-4">Student & Campus</th>
                  <th className="py-3.5 px-4">Document Classification</th>
                  <th className="py-3.5 px-4">Attestation Status</th>
                  <th className="py-3.5 px-4">Submission Date</th>
                  <th className="py-3.5 px-4 text-right">Attestation Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {docVerifications.map(doc => (
                  <tr key={doc.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-3.5 px-4 font-mono font-bold text-slate-900">{doc.id}</td>
                    <td className="py-3.5 px-4">
                      <div className="font-bold text-slate-900">{doc.studentName}</div>
                      <span className="text-slate-400 text-[11px]">{doc.campus}</span>
                    </td>
                    <td className="py-3.5 px-4 font-medium text-slate-800">{doc.docType}</td>
                    <td className="py-3.5 px-4">
                      <span className={'px-2.5 py-0.5 rounded-full text-[10px] font-bold ' + (
                        doc.status === 'Verified' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-amber-50 text-amber-700 border border-amber-200'
                      )}>
                        {doc.status}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 font-mono text-[11px] text-slate-500">{doc.date}</td>
                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          type="button"
                          onClick={() => setInspectingDoc(doc)}
                          className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-semibold cursor-pointer inline-flex items-center gap-1"
                        >
                          <Eye className="w-3 h-3" />
                          <span>Inspect</span>
                        </button>
                        {doc.status !== 'Verified' && (
                          <button
                            type="button"
                            onClick={() => handleVerifyDoc(doc.id)}
                            className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold cursor-pointer inline-flex items-center gap-1 shadow-2xs"
                          >
                            <Check className="w-3 h-3" />
                            <span>Verify</span>
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* TAB 6: ALUMNI & DEGREE VERIFICATION                          */}
      {/* ------------------------------------------------------------- */}
      {effectiveTab === 'alumni' && (
        <div className="space-y-6">
          <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-2xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h3 className="text-sm font-bold text-slate-900">Graduation Registry & Degree Verification Portal</h3>
                <p className="text-xs text-slate-500">Query and authenticate graduate credentials against the central platform repository.</p>
              </div>
              <button
                type="button"
                onClick={() => setIsRegisterAlumnusModalOpen(true)}
                className="px-3.5 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-xs font-bold transition-all shadow-2xs cursor-pointer inline-flex items-center gap-1.5"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Register Alumnus</span>
              </button>
            </div>

            <form onSubmit={handleVerifyCredentialSearch} className="flex flex-col sm:flex-row gap-2">
              <div className="relative flex-1">
                <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Enter Degree Serial (e.g. DEG-2024-9981), Roll No, or Student Name..."
                  value={degreeSearchQuery}
                  onChange={e => setDegreeSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-purple-500/20 font-medium"
                />
              </div>
              <button
                type="submit"
                className="px-5 py-2.5 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-xs font-bold cursor-pointer transition-all shadow-2xs"
              >
                Verify Credentials
              </button>
            </form>
          </div>

          {verifiedDegreeRecord && (
            <div className="bg-gradient-to-r from-purple-900 to-indigo-950 text-white p-6 rounded-3xl border border-purple-500/30 shadow-xl space-y-4">
              <div className="flex items-center justify-between border-b border-white/20 pb-3">
                <div className="flex items-center gap-2">
                  <Award className="w-6 h-6 text-amber-400" />
                  <span className="font-extrabold text-sm uppercase tracking-wider text-purple-200">Authenticated Institutional Degree</span>
                </div>
                <span className="px-3 py-1 bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 rounded-full font-mono text-[10px] font-bold">
                  CRYPTOGRAPHICALLY VERIFIED
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
                <div>
                  <span className="text-[10px] text-purple-300 uppercase block font-bold">Student Name</span>
                  <div className="font-extrabold text-base text-white">{verifiedDegreeRecord.studentName}</div>
                  <span className="text-[11px] text-purple-200 font-mono">B-Form / CNIC: {verifiedDegreeRecord.cnic}</span>
                </div>
                <div>
                  <span className="text-[10px] text-purple-300 uppercase block font-bold">Conferred Program</span>
                  <div className="font-bold text-sm text-purple-100">{verifiedDegreeRecord.program}</div>
                  <span className="text-[11px] text-emerald-400 font-bold">{verifiedDegreeRecord.grade} (Batch of {verifiedDegreeRecord.graduationYear})</span>
                </div>
                <div>
                  <span className="text-[10px] text-purple-300 uppercase block font-bold">Conferring Campus & Seal</span>
                  <div className="font-semibold text-xs text-white">{verifiedDegreeRecord.campus}</div>
                  <span className="text-[10px] font-mono text-purple-300 block mt-0.5">Seal Ref: {verifiedDegreeRecord.sealRef}</span>
                </div>
              </div>
            </div>
          )}

          {searchAttempted && !verifiedDegreeRecord && (
            <div className="bg-rose-50 border border-rose-200 p-6 rounded-2xl text-center space-y-2">
              <XCircle className="w-8 h-8 text-rose-500 mx-auto" />
              <h4 className="text-sm font-bold text-rose-900">Credential Not Located</h4>
              <p className="text-xs text-rose-600 max-w-md mx-auto">No degree or graduation award matching your search parameters exists in the platform register.</p>
            </div>
          )}
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* TAB 7: DATA & PRIVACY REQUESTS                              */}
      {/* ------------------------------------------------------------- */}
      {effectiveTab === 'privacy' && (
        <div className="space-y-4">
          <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-2xs">
            <h3 className="text-sm font-bold text-slate-900">Data Protection & Subject Access Requests (GDPR Compliance)</h3>
            <p className="text-xs text-slate-500">Superadministrator compliance controls to issue encrypted student archives or perform regulatory right-to-be-forgotten redactions.</p>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200/80 overflow-hidden shadow-2xs">
            <table className="w-full text-left text-xs text-slate-600">
              <thead className="bg-slate-50/75 border-b border-slate-200/80 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                <tr>
                  <th className="py-3.5 px-4">Request ID</th>
                  <th className="py-3.5 px-4">Subject Student</th>
                  <th className="py-3.5 px-4">Requester Authority</th>
                  <th className="py-3.5 px-4">Request Classification</th>
                  <th className="py-3.5 px-4">Fulfillment Status</th>
                  <th className="py-3.5 px-4 text-right">Execution Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {privacyRequests.map(pr => (
                  <tr key={pr.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-3.5 px-4 font-mono font-bold text-slate-900">{pr.id}</td>
                    <td className="py-3.5 px-4 font-bold text-slate-900">{pr.student}</td>
                    <td className="py-3.5 px-4 text-slate-600">{pr.requester}</td>
                    <td className="py-3.5 px-4 font-medium text-purple-700">{pr.type}</td>
                    <td className="py-3.5 px-4">
                      <span className={'px-2.5 py-0.5 rounded-full text-[10px] font-bold ' + (
                        pr.status === 'Fulfilled' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-amber-50 text-amber-700 border border-amber-200'
                      )}>
                        {pr.status}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      {pr.status !== 'Fulfilled' ? (
                        <button
                          type="button"
                          onClick={() => handleProcessPrivacyRequest(pr)}
                          className="px-3 py-1 bg-purple-600 hover:bg-purple-700 text-white rounded-lg text-xs font-bold cursor-pointer inline-flex items-center gap-1 shadow-2xs"
                        >
                          <FileDown className="w-3 h-3" />
                          <span>Process Request</span>
                        </button>
                      ) : (
                        <span className="text-emerald-700 font-bold text-xs inline-flex items-center gap-1">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>Fulfilled</span>
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* TAB 8: STUDENT REPORTS & METRICS                             */}
      {/* ------------------------------------------------------------- */}
      {effectiveTab === 'reports' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-2xs space-y-1">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wide">Total Network Enrolled</span>
              <div className="text-2xl font-extrabold font-mono text-slate-900">{reportStats.total}</div>
              <p className="text-[11px] text-slate-400">Students across all registered campus branches.</p>
            </div>
            <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-2xs space-y-1">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wide">Active Retention Rate</span>
              <div className="text-2xl font-extrabold font-mono text-emerald-600">{reportStats.activeRate}%</div>
              <p className="text-[11px] text-slate-400">{reportStats.active} Active &bull; {reportStats.suspended} Suspended</p>
            </div>
            <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-2xs space-y-1">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wide">Fee Clearance Rate</span>
              <div className="text-2xl font-extrabold font-mono text-indigo-700">{reportStats.feeClearancePct}%</div>
              <p className="text-[11px] text-slate-400">{reportStats.paidFees} Dues Cleared &bull; {reportStats.pendingFees} Pending</p>
            </div>
            <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-2xs space-y-1">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wide">Gender Diversity</span>
              <div className="text-2xl font-extrabold font-mono text-purple-700">{reportStats.malePct}% M / {reportStats.femalePct}% F</div>
              <p className="text-[11px] text-slate-400">{reportStats.males} Male &bull; {reportStats.females} Female</p>
            </div>
          </div>

          {/* Campus Breakdown Progress Bars */}
          <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-2xs space-y-4">
            <h3 className="text-sm font-bold text-slate-900">Campus-Wise Enrollment Share</h3>
            <div className="space-y-3">
              {Object.entries(reportStats.campusCounts).map(([campusName, count]) => {
                const pct = reportStats.total > 0 ? Math.round((count / reportStats.total) * 100) : 0
                return (
                  <div key={campusName} className="space-y-1">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-bold text-slate-800">{campusName}</span>
                      <span className="font-mono text-slate-500 font-bold">{count} Students ({pct}%)</span>
                    </div>
                    <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                      <div className="h-full bg-purple-600 rounded-full transition-all" style={{ width: pct + '%' }} />
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* MODAL 1: STUDENT 360 INSPECTION MODAL                         */}
      {/* ------------------------------------------------------------- */}
      {inspectingStudent && (
        <Modal
          isOpen={true}
          onClose={() => setInspectingStudent(null)}
          title={'Student Profile: ' + inspectingStudent.name}
          maxWidth="max-w-2xl"
        >
          <div className="space-y-4 text-xs">
            <div className="p-4 rounded-2xl bg-purple-50/60 border border-purple-100 flex items-center justify-between">
              <div>
                <h4 className="font-extrabold text-slate-900 text-sm">{inspectingStudent.name}</h4>
                <p className="text-purple-700 font-mono text-xs font-bold mt-0.5">Roll No: {inspectingStudent.cleanRoll}</p>
              </div>
              <button
                type="button"
                onClick={() => handleToggleStudentStatus(inspectingStudent)}
                className={'px-3 py-1 rounded-full text-[10px] font-bold border transition-colors cursor-pointer ' + (
                  (inspectingStudent.cleanStatus || 'Active').toLowerCase() === 'active'
                    ? 'bg-emerald-50 text-emerald-800 border-emerald-200 hover:bg-emerald-100'
                    : 'bg-rose-50 text-rose-800 border-rose-200 hover:bg-rose-100'
                )}
              >
                {inspectingStudent.cleanStatus || 'Active'} (Click to Toggle)
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3 text-slate-600">
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/70">
                <span className="text-[10px] text-slate-400 block font-bold uppercase">Affiliated Campus</span>
                <span className="font-semibold text-slate-900 text-xs">{inspectingStudent.cleanCampus}</span>
              </div>
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/70">
                <span className="text-[10px] text-slate-400 block font-bold uppercase">Academic Wing & Grade</span>
                <span className="font-semibold text-slate-900 text-xs">{inspectingStudent.cleanWing} &bull; {inspectingStudent.cleanGrade}</span>
              </div>
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/70">
                <span className="text-[10px] text-slate-400 block font-bold uppercase">Emergency Contact Phone</span>
                <span className="font-semibold text-slate-900 text-xs font-mono">{inspectingStudent.cleanContact}</span>
              </div>
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/70">
                <span className="text-[10px] text-slate-400 block font-bold uppercase">National Identity B-Form / CRC</span>
                <span className="font-mono text-purple-700 font-bold text-xs">{inspectingStudent.cleanBForm}</span>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => {
                  const target = inspectingStudent
                  setInspectingStudent(null)
                  setPrintingStudentIdCard(target)
                }}
                className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-xl font-bold cursor-pointer inline-flex items-center gap-1.5"
              >
                <IdCard className="w-4 h-4" />
                <span>Print Student ID Badge</span>
              </button>
              <button
                type="button"
                onClick={() => setInspectingStudent(null)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* ------------------------------------------------------------- */}
      {/* MODAL 2: PRINTABLE STUDENT ID CARD BADGE                      */}
      {/* ------------------------------------------------------------- */}
      {printingStudentIdCard && (
        <Modal
          isOpen={true}
          onClose={() => setPrintingStudentIdCard(null)}
          title="Printable Student Identity Card"
          maxWidth="max-w-md"
        >
          <div className="space-y-4 text-xs">
            <div id="student-printable-badge" className="bg-gradient-to-br from-purple-900 via-indigo-900 to-slate-900 text-white p-5 rounded-2xl border-2 border-purple-400/40 shadow-xl relative overflow-hidden">
              <div className="flex items-center justify-between border-b border-white/20 pb-2 mb-3">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-white text-purple-900 font-black text-xs flex items-center justify-center">
                    SMS
                  </div>
                  <div>
                    <span className="font-bold text-xs block text-purple-200 uppercase tracking-wider">{printingStudentIdCard.cleanCampus}</span>
                    <span className="text-[9px] text-slate-300">Official Student Identity Card</span>
                  </div>
                </div>
                <QrCode className="w-7 h-7 text-white/90" />
              </div>

              <div className="flex items-center gap-3.5 my-3">
                <div className="w-16 h-16 rounded-xl bg-purple-600/60 border-2 border-white/40 flex items-center justify-center font-extrabold text-xl text-white uppercase shadow-sm shrink-0">
                  {printingStudentIdCard.name.charAt(0)}
                </div>
                <div className="space-y-0.5 min-w-0">
                  <h4 className="font-black text-sm text-white truncate">{printingStudentIdCard.name}</h4>
                  <div className="text-[11px] font-mono text-purple-300 font-bold">Roll: {printingStudentIdCard.cleanRoll}</div>
                  <div className="text-[10px] text-slate-300">{printingStudentIdCard.cleanWing} &bull; {printingStudentIdCard.cleanGrade}</div>
                </div>
              </div>

              <div className="pt-2 border-t border-white/10 flex items-center justify-between text-[9px] font-mono text-purple-200">
                <span>Issue: {new Date().getFullYear()}</span>
                <span>Contact: {printingStudentIdCard.cleanContact}</span>
                <span className="font-bold text-emerald-300">VALID STUDENT</span>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => window.print()}
                className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-xl font-bold cursor-pointer inline-flex items-center gap-1.5 shadow-2xs"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>Print Card Badge</span>
              </button>
              <button
                type="button"
                onClick={() => setPrintingStudentIdCard(null)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* ------------------------------------------------------------- */}
      {/* MODAL 3: INITIATE INTER-CAMPUS TRANSFER                       */}
      {/* ------------------------------------------------------------- */}
      {isTransferModalOpen && (
        <Modal
          isOpen={true}
          onClose={() => setIsTransferModalOpen(false)}
          title="Initiate Inter-Campus Student Transfer"
          maxWidth="max-w-lg"
        >
          <form onSubmit={handleCreateTransferSubmit} className="space-y-4 text-xs">
            <div>
              <label className="block font-bold text-slate-700 mb-1">Select Student to Relocate</label>
              <select
                value={transferFormData.studentId}
                onChange={e => handleStudentSelectInTransfer(e.target.value)}
                className="w-full p-2.5 rounded-xl border border-slate-200 bg-white font-medium"
              >
                {normalizedStudents.map(s => (
                  <option key={s.id} value={s.id}>
                    {s.name} ({s.cleanRoll} - {s.cleanCampus})
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Origin Campus (Current)</label>
                <input
                  type="text"
                  readOnly
                  value={transferFormData.fromCampus}
                  className="w-full p-2.5 rounded-xl border border-slate-200 bg-slate-100 font-semibold text-slate-600"
                />
              </div>
              <div>
                <label className="block font-bold text-slate-700 mb-1">Target Destination Campus</label>
                <select
                  value={transferFormData.toCampus}
                  onChange={e => setTransferFormData({ ...transferFormData, toCampus: e.target.value })}
                  className="w-full p-2.5 rounded-xl border border-slate-200 bg-white font-medium"
                >
                  {institutes.filter(i => i.name !== transferFormData.fromCampus).map(inst => (
                    <option key={inst.id} value={inst.name}>{inst.name}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Target Class / Grade</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Grade 9-A"
                  value={transferFormData.targetGrade}
                  onChange={e => setTransferFormData({ ...transferFormData, targetGrade: e.target.value })}
                  className="w-full p-2.5 rounded-xl border border-slate-200 bg-white font-medium"
                />
              </div>
              <div>
                <label className="block font-bold text-slate-700 mb-1">Fee Clearance Status</label>
                <div className={'p-2.5 rounded-xl border font-bold text-center ' + (
                  transferFormData.feeStatus === 'Paid' ? 'bg-emerald-50 text-emerald-800 border-emerald-200' : 'bg-amber-50 text-amber-800 border-amber-200'
                )}>
                  {transferFormData.feeStatus === 'Paid' ? 'Verified Cleared' : 'Unpaid Dues Pending'}
                </div>
              </div>
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Administrative Transfer Justification</label>
              <textarea
                required
                rows={2}
                value={transferFormData.reason}
                onChange={e => setTransferFormData({ ...transferFormData, reason: e.target.value })}
                className="w-full p-2.5 rounded-xl border border-slate-200 bg-white font-medium"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setIsTransferModalOpen(false)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-xl font-bold cursor-pointer"
              >
                Submit Transfer Request
              </button>
            </div>
          </form>
        </Modal>
      )}

      {/* ------------------------------------------------------------- */}
      {/* MODAL 4: DEFINE ROLL NUMBER PATTERN                           */}
      {/* ------------------------------------------------------------- */}
      {isPatternModalOpen && (
        <Modal
          isOpen={true}
          onClose={() => setIsPatternModalOpen(false)}
          title="Define Campus Roll Number Mask Pattern"
          maxWidth="max-w-md"
        >
          <form onSubmit={handleSavePatternSubmit} className="space-y-4 text-xs">
            <div>
              <label className="block font-bold text-slate-700 mb-1">Target Campus Scope</label>
              <select
                value={newPatternForm.campusName}
                onChange={e => setNewPatternForm({ ...newPatternForm, campusName: e.target.value })}
                className="w-full p-2.5 rounded-xl border border-slate-200 bg-white font-medium"
              >
                <option value="All Campuses (Universal Directive)">All Campuses (Universal Directive)</option>
                {institutes.map(inst => (
                  <option key={inst.id} value={inst.name}>{inst.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block font-bold text-slate-700 mb-1">Prefix Mask (Use &#123;YEAR&#125; or &#123;WING&#125;)</label>
              <input
                type="text"
                required
                placeholder="e.g. BHS-{YEAR}- or EDU-{WING}-"
                value={newPatternForm.prefix}
                onChange={e => setNewPatternForm({ ...newPatternForm, prefix: e.target.value })}
                className="w-full p-2.5 rounded-xl border border-slate-200 bg-white font-mono"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Digit Sequence Length</label>
                <select
                  value={newPatternForm.digitLength}
                  onChange={e => setNewPatternForm({ ...newPatternForm, digitLength: Number(e.target.value) })}
                  className="w-full p-2.5 rounded-xl border border-slate-200 bg-white font-medium"
                >
                  <option value={3}>3 digits (001)</option>
                  <option value={4}>4 digits (0001)</option>
                  <option value={5}>5 digits (00001)</option>
                </select>
              </div>
              <div>
                <label className="block font-bold text-slate-700 mb-1">Separator</label>
                <input
                  type="text"
                  value={newPatternForm.separator}
                  onChange={e => setNewPatternForm({ ...newPatternForm, separator: e.target.value })}
                  className="w-full p-2.5 rounded-xl border border-slate-200 bg-white font-mono"
                />
              </div>
            </div>

            <div className="p-3 bg-purple-50 rounded-xl border border-purple-200">
              <span className="text-[10px] text-purple-700 font-bold uppercase block">Live Specimen Preview</span>
              <div className="font-mono font-bold text-purple-900 text-sm mt-0.5">
                {newPatternForm.prefix.replace('{YEAR}', new Date().getFullYear()).replace('{WING}', 'MS') + '1'.padStart(newPatternForm.digitLength, '0')}
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setIsPatternModalOpen(false)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-xl font-bold cursor-pointer"
              >
                Save Pattern Directive
              </button>
            </div>
          </form>
        </Modal>
      )}

      {/* ------------------------------------------------------------- */}
      {/* MODAL 5: INSPECT DOCUMENT ATTESTATION                         */}
      {/* ------------------------------------------------------------- */}
      {inspectingDoc && (
        <Modal
          isOpen={true}
          onClose={() => setInspectingDoc(null)}
          title={'Document Credentials: ' + inspectingDoc.studentName}
          maxWidth="max-w-lg"
        >
          <div className="space-y-4 text-xs">
            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-mono text-purple-700 font-bold text-xs">{inspectingDoc.id}</span>
                <span className={'px-2 py-0.5 rounded-full text-[10px] font-bold ' + (
                  inspectingDoc.status === 'Verified' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-amber-50 text-amber-700 border border-amber-200'
                )}>
                  {inspectingDoc.status}
                </span>
              </div>
              <h4 className="font-extrabold text-slate-900 text-sm">{inspectingDoc.docType}</h4>
              <p className="text-slate-600">Issued for: <strong>{inspectingDoc.studentName}</strong> &bull; {inspectingDoc.campus}</p>
              <div className="pt-2 border-t border-slate-200/80 text-[11px] text-slate-500">
                <strong>Attestation Notes:</strong> {inspectingDoc.remarks || 'Pending administrative review.'}
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
              {inspectingDoc.status !== 'Verified' && (
                <>
                  <button
                    type="button"
                    onClick={() => handleRejectDoc(inspectingDoc.id)}
                    className="px-3.5 py-2 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 rounded-xl font-bold cursor-pointer inline-flex items-center gap-1"
                  >
                    <X className="w-3.5 h-3.5" />
                    <span>Reject</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleVerifyDoc(inspectingDoc.id)}
                    className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold cursor-pointer inline-flex items-center gap-1 shadow-2xs"
                  >
                    <Check className="w-3.5 h-3.5" />
                    <span>Approve & Stamp Verified</span>
                  </button>
                </>
              )}
              <button
                type="button"
                onClick={() => setInspectingDoc(null)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* ------------------------------------------------------------- */}
      {/* MODAL 6: REGISTER HISTORIC ALUMNUS                            */}
      {/* ------------------------------------------------------------- */}
      {isRegisterAlumnusModalOpen && (
        <Modal
          isOpen={true}
          onClose={() => setIsRegisterAlumnusModalOpen(false)}
          title="Register Conferred Graduate Credential"
          maxWidth="max-w-md"
        >
          <form onSubmit={handleRegisterAlumnusSubmit} className="space-y-4 text-xs">
            <div>
              <label className="block font-bold text-slate-700 mb-1">Graduate Student Full Name</label>
              <input
                type="text"
                required
                value={newAlumnusForm.studentName}
                onChange={e => setNewAlumnusForm({ ...newAlumnusForm, studentName: e.target.value })}
                className="w-full p-2.5 rounded-xl border border-slate-200 bg-white font-medium"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-bold text-slate-700 mb-1">National ID / CNIC</label>
                <input
                  type="text"
                  required
                  placeholder="35201-XXXXXXX-X"
                  value={newAlumnusForm.cnic}
                  onChange={e => setNewAlumnusForm({ ...newAlumnusForm, cnic: e.target.value })}
                  className="w-full p-2.5 rounded-xl border border-slate-200 bg-white font-mono"
                />
              </div>
              <div>
                <label className="block font-bold text-slate-700 mb-1">Conferring Campus</label>
                <select
                  value={newAlumnusForm.campus}
                  onChange={e => setNewAlumnusForm({ ...newAlumnusForm, campus: e.target.value })}
                  className="w-full p-2.5 rounded-xl border border-slate-200 bg-white font-medium"
                >
                  {institutes.map(i => (
                    <option key={i.id} value={i.name}>{i.name}</option>
                  ))}
                </select>
              </div>
            </div>
            <div>
              <label className="block font-bold text-slate-700 mb-1">Conferred Academic Award / Program</label>
              <input
                type="text"
                required
                value={newAlumnusForm.program}
                onChange={e => setNewAlumnusForm({ ...newAlumnusForm, program: e.target.value })}
                className="w-full p-2.5 rounded-xl border border-slate-200 bg-white font-medium"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Graduation Year</label>
                <input
                  type="number"
                  required
                  value={newAlumnusForm.graduationYear}
                  onChange={e => setNewAlumnusForm({ ...newAlumnusForm, graduationYear: e.target.value })}
                  className="w-full p-2.5 rounded-xl border border-slate-200 bg-white font-medium"
                />
              </div>
              <div>
                <label className="block font-bold text-slate-700 mb-1">Academic Standing / Grade</label>
                <input
                  type="text"
                  required
                  value={newAlumnusForm.grade}
                  onChange={e => setNewAlumnusForm({ ...newAlumnusForm, grade: e.target.value })}
                  className="w-full p-2.5 rounded-xl border border-slate-200 bg-white font-medium"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setIsRegisterAlumnusModalOpen(false)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-xl font-bold cursor-pointer"
              >
                Register Degree
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  )
}

export default SuperadminStudentsView
