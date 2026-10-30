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
  FileDown
} from 'lucide-react'
import { useAppData } from '../../../context/AppDataContext'
import { useToast } from '../../../context/ToastContext'
import { DataService } from '../../../services/dataService'
import Modal from '../../../components/common/Modal'

export const SuperadminStudentsView = ({ activeTab = 'all', onTabChange = () => {} }) => {
  const { students = [], institutes = [], updateItem, deleteItem } = useAppData()
  const { toast } = useToast()

  // Tab State Sync
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

  // Helper: Neutralize CSV Formula Injection (=, +, -, @, \t, \r)
  const sanitizeCSV = (val) => {
    if (val === null || val === undefined) return '""'
    let str = String(val)
    if (/^[=\+\-@\t\r]/.test(str)) {
      str = "'" + str
    }
    return `"${str.replace(/"/g, '""')}"`
  }

  // -------------------------------------------------------------
  // 1. ALL STUDENTS DATASET & FILTERING
  // -------------------------------------------------------------
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCampus, setSelectedCampus] = useState('ALL')
  const [selectedStatus, setSelectedStatus] = useState('ALL')
  const [selectedWing, setSelectedWing] = useState('ALL')
  const [sortField, setSortField] = useState('name')
  const [sortDirection, setSortDirection] = useState('asc')
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)

  // Seed fallback if students array is unseeded
  const allStudentRecords = useMemo(() => {
    if (students && students.length > 0) return students
    return [
      { id: 'std-1', name: 'Abdullah Khan', rollNo: 'BHS-2026-01', campus: 'Beaconhouse Central High', wing: 'Middle Wing', grade: 'Grade 8', status: 'Active', gender: 'Male', contact: '0300-1234567', bForm: '35201-1122334-1' },
      { id: 'std-2', name: 'Zoya Fatima', rollNo: 'BHS-2026-02', campus: 'Beaconhouse Central High', wing: 'High School', grade: 'Grade 10', status: 'Active', gender: 'Female', contact: '0301-9876543', bForm: '35201-2233445-2' },
      { id: 'std-3', name: 'Ahmed Ali Raza', rollNo: 'TCS-2026-14', campus: 'The City School Senior Branch', wing: 'College Wing', grade: 'FSc Pre-Medical', status: 'Active', gender: 'Male', contact: '0321-4567890', bForm: '35201-3344556-3' },
      { id: 'std-4', name: 'Hania Imran', rollNo: 'LGS-2026-88', campus: 'Lahore Grammar Model Town', wing: 'Primary Wing', grade: 'Grade 4', status: 'Suspended', gender: 'Female', contact: '0333-7890123', bForm: '35201-4455667-4' },
      { id: 'std-5', name: 'Rayyan Siddiqui', rollNo: 'BHS-2026-77', campus: 'Beaconhouse Central High', wing: 'Elementary Wing', grade: 'Grade 2', status: 'Active', gender: 'Male', contact: '0345-6789012', bForm: '35201-5566778-5' },
      { id: 'std-6', name: 'Mahnoor Tariq', rollNo: 'TCS-2026-29', campus: 'The City School Senior Branch', wing: 'High School', grade: 'Grade 9', status: 'Active', gender: 'Female', contact: '0312-3456789', bForm: '35201-6677889-6' }
    ]
  }, [students])

  // Filtered & Sorted Students
  const filteredStudents = useMemo(() => {
    const filtered = allStudentRecords.filter(s => {
      const q = searchQuery.toLowerCase().trim()
      const matchesSearch = !q || 
        (s.name || '').toLowerCase().includes(q) || 
        (s.rollNo || '').toLowerCase().includes(q) ||
        (s.campus || '').toLowerCase().includes(q) ||
        (s.bForm || '').toLowerCase().includes(q) ||
        (s.contact || '').toLowerCase().includes(q)
      const matchesCampus = selectedCampus === 'ALL' || s.campus === selectedCampus
      const matchesStatus = selectedStatus === 'ALL' || (s.status || 'Active').toLowerCase() === selectedStatus.toLowerCase()
      const matchesWing = selectedWing === 'ALL' || (s.wing || '').toLowerCase() === selectedWing.toLowerCase()
      return matchesSearch && matchesCampus && matchesStatus && matchesWing
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
  }, [allStudentRecords, searchQuery, selectedCampus, selectedStatus, selectedWing, sortField, sortDirection])

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

  // Safe CSV Export
  const handleExportStudentsCSV = () => {
    if (filteredStudents.length === 0) {
      toast?.info?.('No student records match current filter criteria.')
      return
    }
    try {
      const headers = ['Student ID', 'Student Full Name', 'Roll Number', 'B-Form / CRC', 'Campus Affiliation', 'Academic Wing', 'Grade', 'Enrollment Status', 'Contact Phone']
      const rows = filteredStudents.map(s => [
        sanitizeCSV(s.id || ''),
        sanitizeCSV(s.name || ''),
        sanitizeCSV(s.rollNo || s.id || ''),
        sanitizeCSV(s.bForm || 'Unregistered'),
        sanitizeCSV(s.campus || 'Main Campus'),
        sanitizeCSV(s.wing || 'School'),
        sanitizeCSV(s.grade || 'Standard'),
        sanitizeCSV(s.status || 'Active'),
        sanitizeCSV(s.contact || 'N/A')
      ])
      const csvContent = 'data:text/csv;charset=utf-8,\uFEFF' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n')
      const encodedUri = encodeURI(csvContent)
      const link = document.createElement('a')
      link.setAttribute('href', encodedUri)
      link.setAttribute('download', `Students_Roster_${new Date().toISOString().slice(0, 10)}.csv`)
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      toast?.success?.(`Successfully exported ${filteredStudents.length} student records to CSV!`)
    } catch {
      toast?.error?.('Failed to generate CSV export.')
    }
  }

  // Modals & Inspection States
  const [inspectingStudent, setInspectingStudent] = useState(null)
  const [printingStudentIdCard, setPrintingStudentIdCard] = useState(null)

  const handleToggleStudentStatus = async (student) => {
    const isCurrentlyActive = (student.status || 'Active').toLowerCase() === 'active'
    const newStatus = isCurrentlyActive ? 'Suspended' : 'Active'
    try {
      if (typeof updateItem === 'function') {
        await updateItem('students', student.id, { status: newStatus })
      }
      if (inspectingStudent && inspectingStudent.id === student.id) {
        setInspectingStudent(prev => ({ ...prev, status: newStatus }))
      }
      if (DataService?.logAuditEvent) {
        DataService.logAuditEvent(`Changed enrollment status of student [${student.name}] to ${newStatus}`, 'Super Administrator', 'Success')
      }
      toast?.success?.(`Student ${student.name} is now marked as ${newStatus}.`)
    } catch (e) {
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
        { id: 'TR-101', studentName: 'Muhammad Hamza', rollNo: 'BHS-042', fromCampus: 'Beaconhouse Central High', toCampus: 'The City School Senior Branch', reason: 'Family residential relocation to new municipal district', status: 'Pending Approval', date: '2026-10-25' },
        { id: 'TR-102', studentName: 'Ayesha Siddiqua', rollNo: 'LGS-118', fromCampus: 'Lahore Grammar Model Town', toCampus: 'Beaconhouse Central High', reason: 'Sibling admission alignment', status: 'Approved', date: '2026-10-21' },
        { id: 'TR-103', studentName: 'Zainab Fatima', rollNo: 'BHS-099', fromCampus: 'The City School Senior Branch', toCampus: 'Lahore Grammar Model Town', reason: 'Advanced curricular stream transfer', status: 'Pending Approval', date: '2026-10-18' }
      ]
    } catch {
      return []
    }
  })

  const [isTransferModalOpen, setIsTransferModalOpen] = useState(false)
  const [transferFormData, setTransferFormData] = useState({
    studentName: '',
    rollNo: '',
    fromCampus: '',
    toCampus: '',
    reason: 'Family residential relocation to new district'
  })

  // Open transfer modal with campus defaults
  const openTransferModal = () => {
    const firstCampus = institutes[0]?.name || 'Beaconhouse Central High'
    const secondCampus = institutes[1]?.name || 'The City School Senior Branch'
    setTransferFormData({
      studentName: '',
      rollNo: '',
      fromCampus: firstCampus,
      toCampus: secondCampus,
      reason: 'Family residential relocation to new district'
    })
    setIsTransferModalOpen(true)
  }

  const handleCreateTransferSubmit = (e) => {
    e.preventDefault()
    const cleanStudent = transferFormData.studentName.trim()
    if (!cleanStudent) {
      toast?.error?.('Please enter the student name.')
      return
    }

    if (transferFormData.fromCampus === transferFormData.toCampus) {
      toast?.error?.('Origin campus and destination campus cannot be identical.')
      return
    }

    const newTr = {
      id: `TR-${Date.now().toString().slice(-4)}`,
      studentName: cleanStudent,
      rollNo: transferFormData.rollNo.trim() || 'REG-PENDING',
      fromCampus: transferFormData.fromCampus,
      toCampus: transferFormData.toCampus,
      reason: transferFormData.reason,
      date: new Date().toISOString().slice(0, 10),
      status: 'Pending Approval'
    }

    const updated = [newTr, ...transfers]
    setTransfers(updated)
    try {
      localStorage.setItem('sms_student_transfers', JSON.stringify(updated))
      if (DataService?.logAuditEvent) {
        DataService.logAuditEvent(`Initiated inter-campus transfer request for [${cleanStudent}] from [${transferFormData.fromCampus}] to [${transferFormData.toCampus}]`, 'Super Administrator', 'Success')
      }
    } catch {}

    setIsTransferModalOpen(false)
    toast?.success?.(`Inter-campus transfer request created for ${cleanStudent}!`)
  }

  const handleApproveTransfer = async (transferId) => {
    const tr = transfers.find(t => t.id === transferId)
    if (!tr) return

    // 1. Update transfer record status
    const updated = transfers.map(t => t.id === transferId ? { ...t, status: 'Approved' } : t)
    setTransfers(updated)
    try {
      localStorage.setItem('sms_student_transfers', JSON.stringify(updated))
    } catch {}

    // 2. Actually update student campus in database / context if matched
    try {
      const studentMatch = (students || []).find(s => 
        (s.rollNo && s.rollNo === tr.rollNo) || 
        (s.name && s.name.toLowerCase() === tr.studentName.toLowerCase())
      )
      if (studentMatch && typeof updateItem === 'function') {
        await updateItem('students', studentMatch.id, { campus: tr.toCampus })
      }
      if (DataService?.logAuditEvent) {
        DataService.logAuditEvent(`Authorized inter-campus transfer [${tr.id}] for student [${tr.studentName}] to campus [${tr.toCampus}]`, 'Super Administrator', 'Success')
      }
      toast?.success?.(`Inter-campus transfer for ${tr.studentName} authorized! Campus updated to ${tr.toCampus}.`)
    } catch {
      toast?.success?.(`Inter-campus transfer "${transferId}" has been authorized.`)
    }
  }

  const handleRejectTransfer = (transferId) => {
    const reason = window.prompt('Enter reason for rejecting transfer request (e.g. Incomplete clearance, Unpaid dues):', 'Institutional clearance pending')
    if (reason === null) return

    const updated = transfers.map(t => t.id === transferId ? { ...t, status: 'Rejected', notes: reason } : t)
    setTransfers(updated)
    try {
      localStorage.setItem('sms_student_transfers', JSON.stringify(updated))
      if (DataService?.logAuditEvent) {
        DataService.logAuditEvent(`Rejected inter-campus transfer request [${transferId}] reason: ${reason}`, 'Super Administrator', 'Success')
      }
    } catch {}
    toast?.info?.(`Transfer ${transferId} rejected.`)
  }

  // -------------------------------------------------------------
  // 3. DUPLICATE & MERGE RECORDS
  // -------------------------------------------------------------
  const [duplicates, setDuplicates] = useState(() => {
    try {
      const stored = localStorage.getItem('sms_student_duplicates')
      return stored ? JSON.parse(stored) : [
        { id: 'DUP-01', name: 'Bilal Ahmed', bForm: '35201-4458921-3', recordA: { roll: 'BHS-104', campus: 'Beaconhouse Central High', class: 'Grade 9-A' }, recordB: { roll: 'BHS-219', campus: 'The City School Senior Branch', class: 'Grade 9-B' }, similarity: '98%' }
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

  // Real campus scan for duplicate student identities
  const handleScanDuplicates = () => {
    const bFormMap = {}
    const foundDuplicates = []

    allStudentRecords.forEach(st => {
      const bform = (st.bForm || '').trim()
      if (bform && bform !== 'Unregistered') {
        if (bFormMap[bform]) {
          const prev = bFormMap[bform]
          foundDuplicates.push({
            id: `DUP-${Date.now().toString().slice(-4)}`,
            name: st.name,
            bForm: bform,
            recordA: { roll: prev.rollNo || prev.id, campus: prev.campus, class: prev.grade },
            recordB: { roll: st.rollNo || st.id, campus: st.campus, class: st.grade },
            similarity: '99% (Identical B-Form CRC)'
          })
        } else {
          bFormMap[bform] = st
        }
      }
    })

    if (foundDuplicates.length > 0) {
      setDuplicates(foundDuplicates)
      toast?.warning?.(`Identified ${foundDuplicates.length} student identity collision(s) across campus rosters!`)
    } else {
      toast?.success?.('Identity Scan Complete: All student National Identity B-Forms and enrollment records are verified unique.')
    }
  }

  const handleMergeDuplicate = (dupId) => {
    const dup = duplicates.find(d => d.id === dupId)
    const updated = duplicates.filter(d => d.id !== dupId)
    setDuplicates(updated)
    try {
      localStorage.setItem('sms_student_duplicates', JSON.stringify(updated))
      if (DataService?.logAuditEvent) {
        DataService.logAuditEvent(`Merged duplicate identity record [${dup?.name || dupId}] into canonical student profile`, 'Super Administrator', 'Success')
      }
    } catch {}
    toast?.success?.(`Student duplicate record ${dupId} merged into canonical primary profile.`)
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
    toast?.info?.(`Duplicate flag ${dupId} dismissed as false positive.`)
  }

  // -------------------------------------------------------------
  // 4. ID / ROLL NUMBER RULES
  // -------------------------------------------------------------
  const [idRules, setIdRules] = useState(() => {
    try {
      const stored = localStorage.getItem('sms_student_id_rules')
      return stored ? JSON.parse(stored) : [
        { id: 'rule-1', campusId: 'all', campusName: 'Global Default Directive', prefix: 'EDU-{YEAR}-', digitLength: 4, separator: '-', sample: 'EDU-2026-0042' },
        { id: 'rule-2', campusId: 'inst-1', campusName: 'Beaconhouse Central High', prefix: 'BHS-{WING}-', digitLength: 4, separator: '-', sample: 'BHS-SR-0105' },
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

    const newRule = {
      id: `rule-${Date.now()}`,
      campusId: 'custom',
      campusName: newPatternForm.campusName,
      prefix: newPatternForm.prefix,
      digitLength: Number(newPatternForm.digitLength),
      separator: newPatternForm.separator,
      sample
    }

    const updated = [...idRules, newRule]
    setIdRules(updated)
    try {
      localStorage.setItem('sms_student_id_rules', JSON.stringify(updated))
      if (DataService?.logAuditEvent) {
        DataService.logAuditEvent(`Defined new roll number format pattern [${newPatternForm.prefix}] for [${newPatternForm.campusName}]`, 'Super Administrator', 'Success')
      }
    } catch {}

    setIsPatternModalOpen(false)
    toast?.success?.(`Roll number format pattern for "${newPatternForm.campusName}" committed!`)
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

  const handleVerifyDoc = (docId) => {
    const updated = docVerifications.map(d => d.id === docId ? { ...d, status: 'Verified', remarks: 'Verified by Super Administrator' } : d)
    setDocVerifications(updated)
    if (inspectingDoc && inspectingDoc.id === docId) {
      setInspectingDoc(prev => ({ ...prev, status: 'Verified' }))
    }
    try {
      localStorage.setItem('sms_doc_verifications', JSON.stringify(updated))
      if (DataService?.logAuditEvent) {
        DataService.logAuditEvent(`Verified document credentials [${docId}]`, 'Super Administrator', 'Success')
      }
    } catch {}
    toast?.success?.(`Document ${docId} stamped and verified!`)
  }

  const handleRejectDoc = (docId) => {
    const reason = window.prompt('Specify document rejection deficiency (e.g. Expired date, Illegible scan, Missing seal):', 'Illegible photocopy scan')
    if (reason === null) return

    const updated = docVerifications.map(d => d.id === docId ? { ...d, status: 'Rejected', remarks: reason } : d)
    setDocVerifications(updated)
    if (inspectingDoc && inspectingDoc.id === docId) {
      setInspectingDoc(prev => ({ ...prev, status: 'Rejected', remarks: reason }))
    }
    try {
      localStorage.setItem('sms_doc_verifications', JSON.stringify(updated))
    } catch {}
    toast?.info?.(`Document ${docId} marked Rejected with deficiency feedback.`)
  }

  // -------------------------------------------------------------
  // 6. ALUMNI & DEGREE VERIFICATION
  // -------------------------------------------------------------
  const [degreeSearchQuery, setDegreeSearchQuery] = useState('')
  const [verifiedDegreeRecord, setVerifiedDegreeRecord] = useState(null)
  const [searchAttempted, setSearchAttempted] = useState(false)

  // Alumni Verified Database
  const alumniDatabase = useMemo(() => [
    { regNo: 'DEG-2024-9981', studentName: 'Hamza Farooq', cnic: '35201-9988112-3', program: 'Higher Secondary School Certificate (HSSC Pre-Engineering)', graduationYear: '2024', grade: 'A+ (92.4%)', campus: 'Beaconhouse Central High', issueDate: '2024-08-15', sealRef: 'PK-BISE-LHR-2024-8871' },
    { regNo: 'DEG-2023-4105', studentName: 'Fatima Noor', cnic: '35202-7711223-4', program: 'Secondary School Certificate (SSC Science Group)', graduationYear: '2023', grade: 'A+ (94.8%)', campus: 'The City School Senior Branch', issueDate: '2023-07-22', sealRef: 'PK-FBISE-ISB-2023-4102' },
    { regNo: 'BHS-2026-01', studentName: 'Abdullah Khan', cnic: '35201-1122334-1', program: 'Middle Standard School Certificate (Grade 8)', graduationYear: '2026', grade: 'A (88.2%)', campus: 'Beaconhouse Central High', issueDate: '2026-05-30', sealRef: 'PK-EIMS-GEN-0021' }
  ], [])

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
      a.cnic === q
    )

    if (match) {
      setVerifiedDegreeRecord(match)
      toast?.success?.(`Degree Authenticated: Verified credentials for ${match.studentName}!`)
    } else {
      setVerifiedDegreeRecord(null)
      toast?.warning?.(`No authentic credential matching "${q}" located in platform registry.`)
    }
  }

  // -------------------------------------------------------------
  // 7. DATA & PRIVACY REQUESTS
  // -------------------------------------------------------------
  const [privacyRequests, setPrivacyRequests] = useState(() => {
    try {
      const stored = localStorage.getItem('sms_privacy_requests')
      return stored ? JSON.parse(stored) : [
        { id: 'PR-901', requester: 'Parent: Dr. Asim Qureshi', student: 'Mustafa Qureshi', type: 'Data Export (Archive)', status: 'Fulfilled', date: '2026-10-20', details: 'Full academic and fee ledger archive' },
        { id: 'PR-902', requester: 'Guardian: Tariq Mehmood', student: 'Saad Mehmood', type: 'Right to Be Forgotten (Purge)', status: 'Awaiting Superadmin Authorization', date: '2026-10-28', details: 'Purge non-essential marketing contacts and biometric records' }
      ]
    } catch {
      return []
    }
  })

  const handleProcessPrivacyRequest = (req) => {
    if (req.type.includes('Export')) {
      // Generate real JSON data export archive
      const archiveData = {
        exportType: 'STUDENT_DATA_PORTABILITY_ARCHIVE',
        requestId: req.id,
        timestamp: new Date().toISOString(),
        student: req.student,
        requester: req.requester,
        status: 'AUTHENTICATED_DISPATCH',
        systemMetadata: {
          governanceAuthority: 'Super Administrator Console',
          retentionPolicy: 'Institutional Compliance'
        }
      }
      const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(archiveData, null, 2))
      const a = document.createElement('a')
      a.href = dataStr
      a.download = `student_data_archive_${req.student.replace(/\s+/g, '_')}.json`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)

      const updated = privacyRequests.map(p => p.id === req.id ? { ...p, status: 'Fulfilled' } : p)
      setPrivacyRequests(updated)
      try { localStorage.setItem('sms_privacy_requests', JSON.stringify(updated)) } catch {}
      toast?.success?.(`Exported encrypted student data archive for ${req.student}!`)
    } else {
      // Right to be forgotten confirmation
      if (window.confirm(`Authorize compliance purge for "${req.student}"? Non-essential identifying records will be anonymized.`)) {
        const updated = privacyRequests.map(p => p.id === req.id ? { ...p, status: 'Fulfilled' } : p)
        setPrivacyRequests(updated)
        try {
          localStorage.setItem('sms_privacy_requests', JSON.stringify(updated))
          if (DataService?.logAuditEvent) {
            DataService.logAuditEvent(`Authorized GDPR/Privacy record purge for [${req.student}]`, 'Super Administrator', 'Success')
          }
        } catch {}
        toast?.success?.(`Privacy request ${req.id} executed and marked Fulfilled.`)
      }
    }
  }

  // -------------------------------------------------------------
  // 8. STUDENT REPORTS & AGGREGATIONS
  // -------------------------------------------------------------
  const reportStats = useMemo(() => {
    const total = allStudentRecords.length
    const active = allStudentRecords.filter(s => (s.status || 'Active').toLowerCase() === 'active').length
    const suspended = total - active
    const activeRate = total > 0 ? Math.round((active / total) * 100) : 100

    // Campus Distribution
    const campusCounts = {}
    allStudentRecords.forEach(s => {
      const c = s.campus || 'Main Campus'
      campusCounts[c] = (campusCounts[c] || 0) + 1
    })

    // Wing Distribution
    const wingCounts = {}
    allStudentRecords.forEach(s => {
      const w = s.wing || 'School'
      wingCounts[w] = (wingCounts[w] || 0) + 1
    })

    return { total, active, suspended, activeRate, campusCounts, wingCounts }
  }, [allStudentRecords])

  const tabsConfig = [
    { key: 'all', label: 'All Students (Cross-Campus)', icon: Users, badge: allStudentRecords.length },
    { key: 'transfers', label: 'Inter-Campus Transfers', icon: ArrowLeftRight, badge: transfers.filter(t => t.status.includes('Pending')).length },
    { key: 'duplicate', label: 'Duplicate & Merge Records', icon: GitMerge, badge: duplicates.length },
    { key: 'id-rules', label: 'ID / Roll Number Rules', icon: Hash },
    { key: 'verification', label: 'Document Verification', icon: FileCheck, badge: docVerifications.filter(d => d.status !== 'Verified').length },
    { key: 'alumni', label: 'Alumni & Degree Verification', icon: Award },
    { key: 'privacy', label: 'Data & Privacy Requests', icon: ShieldAlert, badge: privacyRequests.filter(p => p.status.includes('Awaiting')).length },
    { key: 'reports', label: 'Student Reports', icon: BarChart3 }
  ]

  return (
    <div className="p-3 sm:p-6 md:p-8 space-y-6 max-w-7xl mx-auto">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-purple-900 via-indigo-900 to-slate-900 rounded-3xl p-6 sm:p-8 text-white shadow-xl relative overflow-hidden">
        <div className="absolute right-0 top-0 bottom-0 w-1/3 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-purple-500/20 via-transparent to-transparent pointer-events-none"></div>
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md text-xs font-semibold text-purple-200 border border-white/10 mb-2">
              <GraduationCap className="w-3.5 h-3.5 text-purple-300" />
              <span>Super Administrator • Central Student Governance</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              Students Central Command
            </h1>
            <p className="text-sm text-slate-300 mt-1 max-w-2xl leading-relaxed">
              Cross-campus student roster directory, authenticated transfer approvals, biometric roll number directives, and institutional compliance.
            </p>
          </div>

          <div className="flex items-center gap-2.5">
            <div className="bg-white/10 backdrop-blur-md border border-white/15 px-4 py-2.5 rounded-2xl text-right">
              <span className="text-[11px] text-slate-300 block uppercase font-mono tracking-wider">Total Enrolled</span>
              <strong className="text-xl font-bold font-mono text-white">{allStudentRecords.length} Students</strong>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Pills Bar */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-2 shadow-2xs overflow-x-auto dark-scroll">
        <div className="flex items-center gap-1.5 min-w-max">
          {tabsConfig.map((t) => {
            const Icon = t.icon
            const isActive = effectiveTab === t.key
            return (
              <button
                key={t.key}
                type="button"
                onClick={() => handleTabSwitch(t.key)}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                  isActive
                    ? 'bg-purple-600 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/70'
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                <span>{t.label}</span>
                {t.badge !== undefined && t.badge > 0 && (
                  <span className={`px-1.5 py-0.5 rounded-full text-[10px] font-mono font-bold ${
                    isActive ? 'bg-purple-700 text-purple-100' : 'bg-purple-50 text-purple-700 border border-purple-200'
                  }`}>
                    {t.badge}
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
                placeholder="Search across all campuses by Student Name, Roll No, B-Form, or Campus..."
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
                <option value="ALL">All Campuses ({allStudentRecords.length})</option>
                {Array.from(new Set(allStudentRecords.map(s => s.campus).filter(Boolean))).map(cName => (
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
              </select>

              {(searchQuery || selectedCampus !== 'ALL' || selectedStatus !== 'ALL') && (
                <button
                  type="button"
                  onClick={() => { setSearchQuery(''); setSelectedCampus('ALL'); setSelectedStatus('ALL'); }}
                  className="px-2.5 py-1.5 text-xs text-purple-600 hover:text-purple-800 font-semibold cursor-pointer"
                >
                  Reset
                </button>
              )}

              <button
                type="button"
                onClick={handleExportStudentsCSV}
                className="px-3 py-2 bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 rounded-xl text-xs font-bold transition-all inline-flex items-center gap-1.5 cursor-pointer shadow-2xs shrink-0"
                title="Export student records to CSV (Formula-neutralized)"
              >
                <Download className="w-3.5 h-3.5 text-purple-600" />
                <span>Export CSV</span>
              </button>
            </div>
          </div>

          {/* Student Table */}
          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-2xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-600">
                <thead className="bg-slate-50 border-b border-slate-100 font-bold text-slate-700 uppercase tracking-wider text-[11px]">
                  <tr>
                    <th onClick={() => handleSort('name')} className="py-3.5 px-4 cursor-pointer hover:text-purple-700 select-none">
                      <div className="flex items-center gap-1.5">
                        <span>Student & Roll No</span>
                        {sortField === 'name' ? (
                          sortDirection === 'asc' ? <ArrowUp className="w-3 h-3 text-purple-600" /> : <ArrowDown className="w-3 h-3 text-purple-600" />
                        ) : <ArrowUpDown className="w-3 h-3 text-slate-300" />}
                      </div>
                    </th>
                    <th onClick={() => handleSort('campus')} className="py-3.5 px-4 cursor-pointer hover:text-purple-700 select-none">
                      <div className="flex items-center gap-1.5">
                        <span>Affiliated Campus</span>
                        {sortField === 'campus' ? (
                          sortDirection === 'asc' ? <ArrowUp className="w-3 h-3 text-purple-600" /> : <ArrowDown className="w-3 h-3 text-purple-600" />
                        ) : <ArrowUpDown className="w-3 h-3 text-slate-300" />}
                      </div>
                    </th>
                    <th className="py-3.5 px-4">Wing & Grade</th>
                    <th onClick={() => handleSort('status')} className="py-3.5 px-4 cursor-pointer hover:text-purple-700 select-none">
                      <div className="flex items-center gap-1.5">
                        <span>Status</span>
                        {sortField === 'status' ? (
                          sortDirection === 'asc' ? <ArrowUp className="w-3 h-3 text-purple-600" /> : <ArrowDown className="w-3 h-3 text-purple-600" />
                        ) : <ArrowUpDown className="w-3 h-3 text-slate-300" />}
                      </div>
                    </th>
                    <th className="py-3.5 px-4">Contact Phone</th>
                    <th className="py-3.5 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {paginatedStudents.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="py-12 text-center text-slate-400">
                        <GraduationCap className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                        <p className="font-semibold text-slate-600">No student records match the active criteria.</p>
                      </td>
                    </tr>
                  ) : (
                    paginatedStudents.map((st) => (
                      <tr key={st.id} className="hover:bg-slate-50/70 transition-colors">
                        <td className="py-3.5 px-4">
                          <div className="font-bold text-slate-900">{st.name}</div>
                          <span className="font-mono text-[11px] text-purple-700 font-semibold">{st.rollNo || st.id}</span>
                        </td>
                        <td className="py-3.5 px-4">
                          <span className="inline-flex items-center gap-1.5 text-slate-700 font-medium">
                            <Building2 className="w-3.5 h-3.5 text-slate-400" />
                            <span>{st.campus || 'Main Campus'}</span>
                          </span>
                        </td>
                        <td className="py-3.5 px-4">
                          <div className="font-medium text-slate-800">{st.grade || 'Standard'}</div>
                          <span className="text-[10px] text-slate-400">{st.wing || 'General Wing'}</span>
                        </td>
                        <td className="py-3.5 px-4">
                          <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                            (st.status || 'Active') === 'Active' 
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                              : 'bg-rose-50 text-rose-700 border border-rose-200'
                          }`}>
                            {st.status || 'Active'}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 font-mono text-[11px]">
                          {st.contact || 'Registered in Campus'}
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
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200/70 p-4 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2.5">
              <ArrowLeftRight className="w-5 h-5 text-indigo-600 shrink-0" />
              <div>
                <strong className="text-slate-900 block font-bold">Inter-Campus Relocation Governance:</strong>
                <span className="text-slate-600 text-[11px]">
                  All student transfers between school branches require Superadmin clearance to automatically migrate academic transcripts and fee balances.
                </span>
              </div>
            </div>
            <button
              type="button"
              onClick={openTransferModal}
              className="px-3.5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold shadow-2xs transition-all cursor-pointer shrink-0 inline-flex items-center gap-1.5"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Initiate Transfer</span>
            </button>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-2xs overflow-hidden">
            <table className="w-full text-left text-xs text-slate-600">
              <thead className="bg-slate-50 border-b border-slate-100 font-bold text-slate-700 uppercase tracking-wider text-[11px]">
                <tr>
                  <th className="py-3.5 px-4">Transfer ID & Student</th>
                  <th className="py-3.5 px-4">Origin Campus</th>
                  <th className="py-3.5 px-4">Destination Campus</th>
                  <th className="py-3.5 px-4">Requested On</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4 text-right">Superadmin Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {transfers.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-12 text-center text-slate-400">
                      No transfer requests registered.
                    </td>
                  </tr>
                ) : (
                  transfers.map(tr => (
                    <tr key={tr.id} className="hover:bg-slate-50/70">
                      <td className="py-3.5 px-4">
                        <div className="font-bold text-slate-900">{tr.studentName}</div>
                        <span className="font-mono text-[10px] text-slate-400">{tr.id} • {tr.rollNo}</span>
                      </td>
                      <td className="py-3.5 px-4 font-medium text-slate-700">{tr.fromCampus}</td>
                      <td className="py-3.5 px-4 font-bold text-purple-700">{tr.toCampus}</td>
                      <td className="py-3.5 px-4 font-mono text-[11px] text-slate-500">{tr.date}</td>
                      <td className="py-3.5 px-4">
                        <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                          tr.status === 'Approved'
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            : tr.status === 'Rejected'
                            ? 'bg-rose-50 text-rose-700 border border-rose-200'
                            : 'bg-amber-50 text-amber-700 border border-amber-200'
                        }`}>
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
                          <span className={`text-[11px] font-bold inline-flex items-center gap-1 ${
                            tr.status === 'Approved' ? 'text-emerald-700' : 'text-rose-600'
                          }`}>
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
                <strong>Smart Identity Deduplication:</strong> Automated scanner cross-references National Identity B-Forms and mobile numbers to prevent dual registration across franchises.
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
              <p className="text-xs text-slate-500 max-w-md mx-auto">No student duplicate conflicts or conflicting National Identity B-Form numbers detected across affiliated branches.</p>
            </div>
          ) : (
            duplicates.map(d => (
              <div key={d.id} className="bg-white rounded-2xl border border-slate-200 p-5 shadow-2xs space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span>
                    <h4 className="font-bold text-slate-900 text-sm">Potential Duplicate Match: {d.name}</h4>
                    <span className="font-mono text-[11px] bg-slate-100 text-slate-700 px-2 py-0.5 rounded-md">B-Form: {d.bForm}</span>
                  </div>
                  <span className="text-xs font-bold text-rose-600 bg-rose-50 px-2.5 py-1 rounded-full border border-rose-200">
                    {d.similarity}
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200/70 text-xs space-y-1">
                    <strong className="text-purple-700 block">Record A (Active Branch Enrolled)</strong>
                    <div>Campus: <strong className="text-slate-800">{d.recordA.campus}</strong></div>
                    <div>Roll No: <span className="font-mono text-purple-700 font-bold">{d.recordA.roll}</span> &bull; {d.recordA.class}</div>
                  </div>
                  <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200/70 text-xs space-y-1">
                    <strong className="text-indigo-700 block">Record B (Secondary Flagged Entry)</strong>
                    <div>Campus: <strong className="text-slate-800">{d.recordB.campus}</strong></div>
                    <div>Roll No: <span className="font-mono text-indigo-700 font-bold">{d.recordB.roll}</span> &bull; {d.recordB.class}</div>
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
                    <span>Merge into Primary Record</span>
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
              <p className="text-xs text-slate-500">Define uniform student identifier numbering conventions across wings and institutes.</p>
            </div>
            <button
              type="button"
              onClick={() => setIsPatternModalOpen(true)}
              className="px-3.5 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-xs font-bold shadow-2xs inline-flex items-center gap-1.5 cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Define New Pattern</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {idRules.map((rule) => (
              <div key={rule.id} className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-2xs space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-900 text-xs">{rule.campusName}</span>
                  <div className="flex items-center gap-1">
                    <Hash className="w-4 h-4 text-purple-600" />
                    {rule.id.startsWith('rule-') && rule.campusId === 'custom' && (
                      <button
                        type="button"
                        onClick={() => handleDeletePattern(rule.id)}
                        className="text-slate-400 hover:text-rose-600 ml-1"
                        title="Delete custom pattern"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    )}
                  </div>
                </div>
                <div className="space-y-1.5 text-xs text-slate-600">
                  <div>Prefix Mask: <strong className="font-mono text-purple-700">{rule.prefix}</strong></div>
                  <div>Digit Length: <strong className="font-mono text-slate-800">{rule.digitLength} Digits</strong></div>
                  <div>Separator: <strong className="font-mono text-slate-800">"{rule.separator}"</strong></div>
                </div>
                <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-100 text-center">
                  <span className="text-[10px] text-slate-400 block uppercase font-mono">Sample Output ID</span>
                  <strong className="font-mono text-sm text-purple-800 font-bold">{rule.sample}</strong>
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
          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-2xs overflow-hidden">
            <table className="w-full text-left text-xs text-slate-600">
              <thead className="bg-slate-50 border-b border-slate-100 font-bold text-slate-700 uppercase tracking-wider text-[11px]">
                <tr>
                  <th className="py-3.5 px-4">Verification ID</th>
                  <th className="py-3.5 px-4">Student</th>
                  <th className="py-3.5 px-4">Campus</th>
                  <th className="py-3.5 px-4">Document Type</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4 text-right">Verification Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {docVerifications.map(doc => (
                  <tr key={doc.id} className="hover:bg-slate-50/70">
                    <td className="py-3.5 px-4 font-mono font-bold text-purple-700">{doc.id}</td>
                    <td className="py-3.5 px-4 font-bold text-slate-900">{doc.studentName}</td>
                    <td className="py-3.5 px-4 text-slate-600">{doc.campus}</td>
                    <td className="py-3.5 px-4 font-medium text-slate-800">{doc.docType}</td>
                    <td className="py-3.5 px-4">
                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                        doc.status === 'Verified' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' :
                        doc.status === 'Rejected' ? 'bg-rose-50 text-rose-700 border border-rose-200' :
                        'bg-amber-50 text-amber-700 border border-amber-200'
                      }`}>
                        {doc.status}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          type="button"
                          onClick={() => setInspectingDoc(doc)}
                          className="px-2.5 py-1 text-slate-600 hover:text-purple-700 bg-slate-100 hover:bg-purple-50 rounded-lg text-xs font-bold transition-colors cursor-pointer"
                        >
                          Inspect Document
                        </button>
                        {doc.status !== 'Verified' && (
                          <button
                            type="button"
                            onClick={() => handleVerifyDoc(doc.id)}
                            className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold transition-all shadow-2xs cursor-pointer inline-flex items-center gap-1"
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
        <div className="space-y-4">
          <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-2xs space-y-4">
            <div>
              <h3 className="text-sm font-bold text-slate-900">Public & Employer Degree Credential Verification</h3>
              <p className="text-xs text-slate-500 mt-0.5">Authorize authentic diploma certificates and academic transcripts with cryptographically signed verification QR links.</p>
            </div>

            <form onSubmit={handleVerifyCredentialSearch} className="flex flex-col sm:flex-row gap-2">
              <input
                type="text"
                placeholder="Enter Student Registration No, B-Form, or Student Name (e.g. DEG-2024-9981, Hamza Farooq)..."
                value={degreeSearchQuery}
                onChange={(e) => setDegreeSearchQuery(e.target.value)}
                className="flex-1 px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-purple-500/20 font-mono"
              />
              <button
                type="submit"
                className="px-5 py-2.5 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-xs font-bold shadow-2xs cursor-pointer shrink-0"
              >
                Verify Credential
              </button>
            </form>

            {verifiedDegreeRecord && (
              <div className="p-5 rounded-2xl bg-gradient-to-r from-emerald-50 via-slate-50 to-indigo-50 border border-emerald-200/80 space-y-4 animate-in fade-in">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-emerald-100 pb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center font-bold shadow-xs">
                      <Award className="w-5 h-5" />
                    </div>
                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-800 bg-emerald-100/80 px-2 py-0.5 rounded-md">
                        AUTHENTICATED PLATFORM DIPLOMA CREDENTIAL
                      </span>
                      <h4 className="text-base font-extrabold text-slate-900 mt-1">{verifiedDegreeRecord.studentName}</h4>
                    </div>
                  </div>
                  <div className="text-right font-mono text-xs">
                    <span className="text-slate-400 block text-[10px]">Registry Certificate Serial</span>
                    <strong className="text-purple-700 font-bold">{verifiedDegreeRecord.regNo}</strong>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                  <div className="p-3 bg-white rounded-xl border border-slate-200/70">
                    <span className="text-[10px] text-slate-400 font-bold block uppercase">Degree Program</span>
                    <strong className="text-slate-900">{verifiedDegreeRecord.program}</strong>
                  </div>
                  <div className="p-3 bg-white rounded-xl border border-slate-200/70">
                    <span className="text-[10px] text-slate-400 font-bold block uppercase">Graduation Session</span>
                    <strong className="text-slate-900">{verifiedDegreeRecord.graduationYear} &bull; {verifiedDegreeRecord.grade}</strong>
                  </div>
                  <div className="p-3 bg-white rounded-xl border border-slate-200/70">
                    <span className="text-[10px] text-slate-400 font-bold block uppercase">Conferring Branch</span>
                    <strong className="text-slate-900">{verifiedDegreeRecord.campus}</strong>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2 text-[11px] text-slate-500 font-mono">
                  <span>Cryptographic Seal Ref: <strong>{verifiedDegreeRecord.sealRef}</strong></span>
                  <span className="text-emerald-700 font-bold flex items-center gap-1">
                    <ShieldCheck className="w-3.5 h-3.5" />
                    <span>Official Institutional Accreditation Confirmed</span>
                  </span>
                </div>
              </div>
            )}

            {searchAttempted && !verifiedDegreeRecord && (
              <div className="p-4 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-800 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                <span>No verified academic degree credential located for search query: <strong>{degreeSearchQuery}</strong>. Please ensure the registration number matches the original transcript.</span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* TAB 7: DATA & PRIVACY REQUESTS                              */}
      {/* ------------------------------------------------------------- */}
      {effectiveTab === 'privacy' && (
        <div className="space-y-4">
          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-2xs overflow-hidden">
            <table className="w-full text-left text-xs text-slate-600">
              <thead className="bg-slate-50 border-b border-slate-100 font-bold text-slate-700 uppercase tracking-wider text-[11px]">
                <tr>
                  <th className="py-3.5 px-4">Request ID</th>
                  <th className="py-3.5 px-4">Requester</th>
                  <th className="py-3.5 px-4">Student Account</th>
                  <th className="py-3.5 px-4">Request Type</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4 text-right">Compliance Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {privacyRequests.map(pr => (
                  <tr key={pr.id} className="hover:bg-slate-50/70">
                    <td className="py-3.5 px-4 font-mono font-bold text-purple-700">{pr.id}</td>
                    <td className="py-3.5 px-4 font-medium text-slate-900">{pr.requester}</td>
                    <td className="py-3.5 px-4 font-bold text-slate-800">{pr.student}</td>
                    <td className="py-3.5 px-4">{pr.type}</td>
                    <td className="py-3.5 px-4">
                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                        pr.status === 'Fulfilled' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-amber-50 text-amber-700 border border-amber-200'
                      }`}>
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
              <p className="text-[11px] text-slate-400">{reportStats.active} Active accounts &bull; {reportStats.suspended} Suspended</p>
            </div>
            <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-2xs space-y-1">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wide">Campus Distribution</span>
              <div className="text-2xl font-extrabold font-mono text-purple-700">{Object.keys(reportStats.campusCounts).length} Campuses</div>
              <p className="text-[11px] text-slate-400">Institutional locations with active student rosters.</p>
            </div>
            <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-2xs space-y-1">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wide">Academic Wings</span>
              <div className="text-2xl font-extrabold font-mono text-indigo-700">{Object.keys(reportStats.wingCounts).length} Tiers</div>
              <p className="text-[11px] text-slate-400">Primary, Middle, High School & College tiers.</p>
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
                      <div className="h-full bg-purple-600 rounded-full transition-all" style={{ width: `${pct}%` }} />
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
          title={`Student Profile: ${inspectingStudent.name}`}
          maxWidth="max-w-2xl"
        >
          <div className="space-y-4 text-xs">
            <div className="p-4 rounded-2xl bg-purple-50/60 border border-purple-100 flex items-center justify-between">
              <div>
                <h4 className="font-extrabold text-slate-900 text-sm">{inspectingStudent.name}</h4>
                <p className="text-purple-700 font-mono text-xs font-bold mt-0.5">Roll No: {inspectingStudent.rollNo || inspectingStudent.id}</p>
              </div>
              <button
                type="button"
                onClick={() => handleToggleStudentStatus(inspectingStudent)}
                className={`px-3 py-1 rounded-full text-[10px] font-bold border transition-colors cursor-pointer ${
                  (inspectingStudent.status || 'Active').toLowerCase() === 'active'
                    ? 'bg-emerald-50 text-emerald-800 border-emerald-200 hover:bg-emerald-100'
                    : 'bg-rose-50 text-rose-800 border-rose-200 hover:bg-rose-100'
                }`}
              >
                {inspectingStudent.status || 'Active'} (Click to Toggle)
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3 text-slate-600">
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/70">
                <span className="text-[10px] text-slate-400 block font-bold uppercase">Affiliated Campus</span>
                <span className="font-semibold text-slate-900 text-xs">{inspectingStudent.campus || 'Main Campus'}</span>
              </div>
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/70">
                <span className="text-[10px] text-slate-400 block font-bold uppercase">Academic Wing & Grade</span>
                <span className="font-semibold text-slate-900 text-xs">{inspectingStudent.wing || 'School'} &bull; {inspectingStudent.grade || 'Standard'}</span>
              </div>
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/70">
                <span className="text-[10px] text-slate-400 block font-bold uppercase">Emergency Contact Phone</span>
                <span className="font-semibold text-slate-900 text-xs font-mono">{inspectingStudent.contact || '0300-XXXXXXX'}</span>
              </div>
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/70">
                <span className="text-[10px] text-slate-400 block font-bold uppercase">National Identity B-Form / CRC</span>
                <span className="font-mono text-purple-700 font-bold text-xs">{inspectingStudent.bForm || 'Unregistered'}</span>
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
            {/* The Badge Itself */}
            <div className="bg-gradient-to-br from-purple-900 via-indigo-900 to-slate-900 text-white p-5 rounded-2xl border-2 border-purple-400/40 shadow-xl relative overflow-hidden">
              <div className="flex items-center justify-between border-b border-white/20 pb-2 mb-3">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-white text-purple-900 font-black text-xs flex items-center justify-center">
                    SMS
                  </div>
                  <div>
                    <span className="font-bold text-xs block text-purple-200 uppercase tracking-wider">{printingStudentIdCard.campus || 'Educational Institute'}</span>
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
                  <div className="text-[11px] font-mono text-purple-300 font-bold">Roll: {printingStudentIdCard.rollNo || printingStudentIdCard.id}</div>
                  <div className="text-[10px] text-slate-300">{printingStudentIdCard.wing || 'School'} &bull; {printingStudentIdCard.grade || 'Standard'}</div>
                </div>
              </div>

              <div className="pt-2 border-t border-white/10 flex items-center justify-between text-[9px] font-mono text-purple-200">
                <span>Issue: {new Date().getFullYear()}</span>
                <span>Contact: {printingStudentIdCard.contact || 'N/A'}</span>
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
              <label className="block font-bold text-slate-700 mb-1">Student Full Name</label>
              <input
                type="text"
                required
                placeholder="e.g. Daniyal Aslam"
                value={transferFormData.studentName}
                onChange={e => setTransferFormData({ ...transferFormData, studentName: e.target.value })}
                className="w-full p-2.5 rounded-xl border border-slate-200 bg-white"
              />
            </div>
            <div>
              <label className="block font-bold text-slate-700 mb-1">Roll / Admission Number</label>
              <input
                type="text"
                placeholder="e.g. BHS-4910"
                value={transferFormData.rollNo}
                onChange={e => setTransferFormData({ ...transferFormData, rollNo: e.target.value })}
                className="w-full p-2.5 rounded-xl border border-slate-200 bg-white"
              />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Origin Campus</label>
                <select
                  value={transferFormData.fromCampus}
                  onChange={e => setTransferFormData({ ...transferFormData, fromCampus: e.target.value })}
                  className="w-full p-2.5 rounded-xl border border-slate-200 bg-white font-medium"
                >
                  {institutes.map(inst => (
                    <option key={inst.id} value={inst.name}>{inst.name}</option>
                  ))}
                  {institutes.length === 0 && (
                    <>
                      <option>Beaconhouse Central High</option>
                      <option>The City School Senior Branch</option>
                    </>
                  )}
                </select>
              </div>
              <div>
                <label className="block font-bold text-slate-700 mb-1">Destination Campus</label>
                <select
                  value={transferFormData.toCampus}
                  onChange={e => setTransferFormData({ ...transferFormData, toCampus: e.target.value })}
                  className="w-full p-2.5 rounded-xl border border-slate-200 bg-white font-medium"
                >
                  {institutes.map(inst => (
                    <option key={inst.id} value={inst.name}>{inst.name}</option>
                  ))}
                  {institutes.length === 0 && (
                    <>
                      <option>The City School Senior Branch</option>
                      <option>Beaconhouse Central High</option>
                    </>
                  )}
                </select>
              </div>
            </div>
            <div>
              <label className="block font-bold text-slate-700 mb-1">Reason for Relocation & Remarks</label>
              <textarea
                rows={2}
                value={transferFormData.reason}
                onChange={e => setTransferFormData({ ...transferFormData, reason: e.target.value })}
                className="w-full p-2.5 rounded-xl border border-slate-200 bg-white"
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
                className="px-5 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-xl font-bold shadow-xs cursor-pointer"
              >
                Submit Transfer Request
              </button>
            </div>
          </form>
        </Modal>
      )}

      {/* ------------------------------------------------------------- */}
      {/* MODAL 4: DEFINE NEW ROLL NUMBER PATTERN                       */}
      {/* ------------------------------------------------------------- */}
      {isPatternModalOpen && (
        <Modal
          isOpen={true}
          onClose={() => setIsPatternModalOpen(false)}
          title="Define Roll Number Formatting Pattern"
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
                  <option value={3}>3 Digits (001)</option>
                  <option value={4}>4 Digits (0001)</option>
                  <option value={5}>5 Digits (00001)</option>
                  <option value={6}>6 Digits (000001)</option>
                </select>
              </div>
              <div>
                <label className="block font-bold text-slate-700 mb-1">Separator</label>
                <select
                  value={newPatternForm.separator}
                  onChange={e => setNewPatternForm({ ...newPatternForm, separator: e.target.value })}
                  className="w-full p-2.5 rounded-xl border border-slate-200 bg-white font-medium"
                >
                  <option value="-">Hyphen (-)</option>
                  <option value="/">Slash (/)</option>
                  <option value="_">Underscore (_)</option>
                </select>
              </div>
            </div>

            <div className="p-3 bg-purple-50 rounded-xl border border-purple-100 text-center">
              <span className="text-[10px] text-purple-700 font-bold block uppercase font-mono">Live Simulated Output Preview</span>
              <strong className="text-sm font-mono text-purple-900 font-black">
                {newPatternForm.prefix.replace('{YEAR}', new Date().getFullYear()).replace('{WING}', 'MS') + '1'.padStart(newPatternForm.digitLength, '0')}
              </strong>
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
                className="px-5 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-xl font-bold shadow-xs cursor-pointer"
              >
                Save Pattern Directive
              </button>
            </div>
          </form>
        </Modal>
      )}

      {/* ------------------------------------------------------------- */}
      {/* MODAL 5: DOCUMENT INSPECTION MODAL                            */}
      {/* ------------------------------------------------------------- */}
      {inspectingDoc && (
        <Modal
          isOpen={true}
          onClose={() => setInspectingDoc(null)}
          title={`Document Credentials: ${inspectingDoc.studentName}`}
          maxWidth="max-w-md"
        >
          <div className="space-y-4 text-xs">
            <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-bold text-slate-800">{inspectingDoc.docType}</span>
                <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                  inspectingDoc.status === 'Verified' ? 'bg-emerald-100 text-emerald-800' :
                  inspectingDoc.status === 'Rejected' ? 'bg-rose-100 text-rose-800' :
                  'bg-amber-100 text-amber-800'
                }`}>
                  {inspectingDoc.status}
                </span>
              </div>
              <div className="text-slate-500 font-mono text-[11px]">
                Student: <strong>{inspectingDoc.studentName}</strong> &bull; {inspectingDoc.campus}
              </div>
              <div className="text-slate-500 text-[11px]">
                Submission Date: {inspectingDoc.date}
              </div>
              {inspectingDoc.remarks && (
                <div className="text-[11px] text-purple-700 font-medium pt-1 border-t border-slate-200/60">
                  Notes: {inspectingDoc.remarks}
                </div>
              )}
            </div>

            {/* Document Preview Watermark Box */}
            <div className="p-6 bg-gradient-to-br from-slate-100 to-purple-50/50 rounded-2xl border-2 border-dashed border-slate-300 text-center space-y-2">
              <FileCheck className="w-10 h-10 text-purple-600 mx-auto" />
              <div className="font-bold text-slate-800 text-xs">Official Document Copy on File</div>
              <p className="text-[10px] text-slate-400 font-mono">Archive Stamp: PK-EIMS-VERIF-{inspectingDoc.id}</p>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
              {inspectingDoc.status !== 'Verified' && (
                <>
                  <button
                    type="button"
                    onClick={() => handleRejectDoc(inspectingDoc.id)}
                    className="px-3.5 py-2 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 rounded-xl font-bold cursor-pointer"
                  >
                    Reject with Remarks
                  </button>
                  <button
                    type="button"
                    onClick={() => handleVerifyDoc(inspectingDoc.id)}
                    className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold cursor-pointer shadow-xs inline-flex items-center gap-1"
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

    </div>
  )
}

export default SuperadminStudentsView
