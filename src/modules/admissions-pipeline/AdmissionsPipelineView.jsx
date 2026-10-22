import React, { useState, useMemo, useRef, useEffect } from 'react'
import { 
  UserCheck, 
  Plus, 
  Search, 
  CheckCircle2, 
  ChevronRight, 
  Phone, 
  Calendar, 
  ArrowRight, 
  Trash2, 
  Zap, 
  UserPlus, 
  Check,
  Download, 
  FileText, 
  Printer, 
  School, 
  Award, 
  GraduationCap,
  X,
  Filter,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  LayoutGrid,
  Table as TableIcon,
  Clock,
  AlertTriangle,
  Flame,
  Thermometer,
  Snowflake,
  ExternalLink,
  QrCode,
  Share2,
  FileSpreadsheet,
  Upload,
  AlertCircle,
  HelpCircle,
  MessageSquare,
  Eye,
  RefreshCw,
  Archive,
  Layers,
  ChevronDown
} from 'lucide-react'
import { useAppData } from '../../context/AppDataContext'
import { useAuth } from '../../context/AuthContext'
import { useToast } from '../../context/ToastContext'
import Modal from '../../components/common/Modal'
import { detectProgramLevel, normalizeClassSections } from '../../constants/academicLevels'
import { QrCodeSvg } from '../../components/common/PrintHelpers'
import MeritListGazetteModal from './MeritListGazetteModal'
import OfferLetterModal from './OfferLetterModal'
import LeadDetailsDrawer from './LeadDetailsDrawer'
import ConvertStudentModal from './ConvertStudentModal'

// Format ISO date to DD/MM/YYYY
const formatDateDDMMYYYY = (isoDate) => {
  if (!isoDate) return '—'
  try {
    const parts = isoDate.split('-')
    if (parts.length === 3) {
      return `${parts[2]}/${parts[1]}/${parts[0]}`
    }
    const d = new Date(isoDate)
    if (isNaN(d.getTime())) return isoDate
    return `${String(d.getDate()).padStart(2, '0')}/${String(d.getMonth() + 1).padStart(2, '0')}/${d.getFullYear()}`
  } catch {
    return isoDate
  }
}

// 8 Primary Stages
export const PRIMARY_STAGES = [
  'Inquiry Received',
  'Contacted',
  'Test/Interview Scheduled',
  'Test Done',
  'Interview Done',
  'Offer Issued',
  'Fee Paid',
  'Enrolled'
]

// 4 Side Stages
export const SIDE_STAGES = [
  'Waitlisted',
  'Rejected',
  'Withdrawn',
  'Lost'
]

export const ALL_STAGES = [...PRIMARY_STAGES, ...SIDE_STAGES]

export const AdmissionsPipelineView = ({ currentInstitute }) => {
  const { 
    admissionsPipeline = [], 
    students = [], 
    classes = [], 
    academicYears = [],
    institutes = [], 
    activeProgramLevel, 
    setActiveProgramLevel,
    addItem, 
    updateItem, 
    deleteItem 
  } = useAppData()

  const { user } = useAuth()
  const { toast } = useToast()
  const fileInputRef = useRef(null)
  const csvInputRef = useRef(null)

  const isAdmin = user?.role === 'superadmin' || user?.role === 'institute_admin' || user?.role === 'admin'

  // Loading state
  const [isLoading, setIsLoading] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Academic Sessions Management
  const defaultSessions = useMemo(() => [
    { id: 'sess-prev', name: '2025-2026', isCurrent: false },
    { id: 'sess-curr', name: '2026-2027', isCurrent: true },
    { id: 'sess-next', name: '2027-2028', isCurrent: false }
  ], [])

  const [selectedSession, setSelectedSession] = useState(() => {
    try {
      const saved = localStorage.getItem('sms_inquiries_session')
      if (saved) return saved
    } catch {}
    return '2026-2027'
  })

  useEffect(() => {
    try {
      localStorage.setItem('sms_inquiries_session', selectedSession)
    } catch {}
  }, [selectedSession])

  // View Mode: Table View vs Kanban Board View
  const [viewMode, setViewMode] = useState('table') // 'table' | 'kanban'

  // Filters State (All default to 'ALL')
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedLevelFilter, setSelectedLevelFilter] = useState('ALL')
  const [selectedClassFilter, setSelectedClassFilter] = useState('ALL')
  const [selectedStageFilter, setSelectedStageFilter] = useState('ALL')
  const [selectedSourceFilter, setSelectedSourceFilter] = useState('ALL')
  const [selectedCounselorFilter, setSelectedCounselorFilter] = useState('ALL')
  const [selectedPriorityFilter, setSelectedPriorityFilter] = useState('ALL')
  const [selectedDateRange, setSelectedDateRange] = useState('ALL') // 'ALL' | 'today' | 'this_week' | 'this_month'

  // Sorting State for Table
  const [sortField, setSortField] = useState('inquiryDate')
  const [sortDirection, setSortDirection] = useState('desc')
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 10

  // Row selection checkboxes for Bulk Actions
  const [selectedLeadIds, setSelectedLeadIds] = useState([])
  const [isBulkStageOpen, setIsBulkStageOpen] = useState(false)
  const [bulkTargetStage, setBulkTargetStage] = useState('Contacted')
  const [isBulkCounselorOpen, setIsBulkCounselorOpen] = useState(false)
  const [bulkTargetCounselor, setBulkTargetCounselor] = useState('Admissions Counselor 1')
  const [isBulkArchiveOpen, setIsBulkArchiveOpen] = useState(false)

  // Modals & Drawers States
  const [isNewInquiryModalOpen, setIsNewInquiryModalOpen] = useState(false)
  const [editingInquiry, setEditingInquiry] = useState(null)
  const [isDiscardConfirmOpen, setIsDiscardConfirmOpen] = useState(false)
  const [isFormDirty, setIsFormDirty] = useState(false)

  // Sub-Modals
  const [selectedLeadForScorecard, setSelectedLeadForScorecard] = useState(null)
  const [selectedLeadForOffer, setSelectedLeadForOffer] = useState(null)
  const [selectedLeadForDossier, setSelectedLeadForDossier] = useState(null)
  const [selectedLeadForEnroll, setSelectedLeadForEnroll] = useState(null)
  const [isMeritListOpen, setIsMeritListOpen] = useState(false)
  const [selectedLeadForMessage, setSelectedLeadForMessage] = useState(null)
  const [isPublicLinkModalOpen, setIsPublicLinkModalOpen] = useState(false)
  const [isCsvImportOpen, setIsCsvImportOpen] = useState(false)
  const [csvErrorModal, setCsvErrorModal] = useState(null)

  // Reason Modal for Reject / Withdrawn / Lost
  const [stageChangePrompt, setStageChangePrompt] = useState(null) // { lead, targetStage }
  const [stageReason, setStageReason] = useState('Fee too high')
  const [stageNotes, setStageNotes] = useState('')

  // Single Lead Archive Confirm
  const [leadToArchive, setLeadToArchive] = useState(null)

  // Scorecard modal state
  const [scorecardData, setScorecardData] = useState({
    testMarks: 80,
    interviewMarks: 85,
    previousMarksPct: 82,
    resultStatus: 'Pass',
    remarks: 'Clear conceptual foundation, confident communication.'
  })

  // Determine current active level
  const currentLevelKey = useMemo(() => {
    if (selectedLevelFilter !== 'ALL') return selectedLevelFilter
    if (activeProgramLevel && activeProgramLevel !== 'all') {
      if (['elementary', 'secondary', 'school'].includes(activeProgramLevel)) return 'school'
      if (activeProgramLevel === 'college') return 'college'
      if (activeProgramLevel === 'university') return 'university'
    }
    return 'school'
  }, [selectedLevelFilter, activeProgramLevel])

  // Available classes list from classes context
  const availableClasses = useMemo(() => {
    return (classes || []).map(c => c.name).filter(Boolean)
  }, [classes])

  // Available classes matching selected Level tier
  const availableClassesForLevel = useMemo(() => {
    if (!classes || classes.length === 0) return []
    const filtered = classes.filter(c => {
      if (!c.name) return false
      const lvl = detectProgramLevel(c.name)
      if (currentLevelKey === 'school') {
        return ['elementary', 'secondary', 'school'].includes(lvl)
      }
      if (currentLevelKey === 'college') {
        return ['higher-secondary', 'college'].includes(lvl)
      }
      if (currentLevelKey === 'university') {
        return lvl === 'university'
      }
      return true
    }).map(c => c.name)

    return filtered.length > 0 ? filtered : availableClasses
  }, [classes, currentLevelKey, availableClasses])

  // Initial New Inquiry Form State
  const initialFormState = {
    studentName: '',
    dob: '',
    gender: 'Male',
    bFormCnic: '',
    address: '',
    city: 'Lahore',
    previousSchool: '',
    previousClassMarks: '',
    gradeApplied: '',
    parentName: '',
    parentRelation: 'Father',
    parentPhone: '',
    parentWhatsapp: '',
    sameAsPhone: true,
    parentEmail: '',
    source: 'Walk-in',
    referrerName: '',
    priority: 'Warm',
    assignedCounselor: 'Admissions Counselor 1',
    testDate: '',
    testTime: '10:00 AM',
    testVenue: 'Examination Hall A',
    notes: '',
    siblingEnrolled: false,
    siblingName: '',
    siblingRoll: '',
    // Level specific
    collegeGroup: 'Pre-Medical',
    matricMarks: '',
    universityProgram: 'BS Computer Science',
    universityNtsScore: '',
    stage: 'Inquiry Received',
    academicSession: selectedSession
  }

  const [formData, setFormData] = useState(initialFormState)
  const [formErrors, setFormErrors] = useState({})

  // Format Phone Helper
  const formatPhoneNumber = (val = '') => {
    const cleaned = val.replace(/[^0-9+]/g, '')
    if (cleaned.startsWith('03')) {
      return '+92 ' + cleaned.slice(1, 4) + ' ' + cleaned.slice(4, 11)
    }
    if (cleaned.startsWith('+92')) {
      const rest = cleaned.slice(3).replace(/\s/g, '')
      if (rest.length > 3) {
        return '+92 ' + rest.slice(0, 3) + ' ' + rest.slice(3, 10)
      }
      return '+92 ' + rest
    }
    return cleaned
  }

  // Duplicate Lead Check
  const duplicateWarning = useMemo(() => {
    if (!formData.parentPhone && !formData.bFormCnic) return null
    const cleanPhone = formData.parentPhone.replace(/[^0-9]/g, '')
    const cleanBForm = formData.bFormCnic.trim()

    const match = admissionsPipeline.find(lead => {
      if (editingInquiry && lead.id === editingInquiry.id) return false
      const leadPhone = (lead.parentPhone || '').replace(/[^0-9]/g, '')
      if (cleanPhone && cleanPhone.length >= 10 && leadPhone === cleanPhone) return true
      if (cleanBForm && lead.bFormCnic && lead.bFormCnic.trim() === cleanBForm) return true
      return false
    })

    return match || null
  }, [formData.parentPhone, formData.bFormCnic, admissionsPipeline, editingInquiry])

  // Open Add Inquiry Modal
  const handleOpenAddModal = () => {
    setEditingInquiry(null)
    setFormData({
      ...initialFormState,
      academicSession: selectedSession,
      gradeApplied: ''
    })
    setFormErrors({})
    setIsFormDirty(false)
    setIsNewInquiryModalOpen(true)
  }

  // Open Edit Inquiry Modal
  const handleOpenEditModal = (lead) => {
    setEditingInquiry(lead)
    setFormData({
      ...initialFormState,
      ...lead,
      academicSession: lead.academicSession || selectedSession
    })
    setFormErrors({})
    setIsFormDirty(false)
    setIsNewInquiryModalOpen(true)
  }

  // Validate New Inquiry Form
  const validateForm = () => {
    const errors = {}
    if (!formData.studentName?.trim()) {
      errors.studentName = 'Applicant full name is required.'
    }
    if (!formData.gradeApplied) {
      errors.gradeApplied = 'Please select class / program applied.'
    }
    if (!formData.parentPhone?.trim()) {
      errors.parentPhone = 'Parent / Guardian phone number is required.'
    } else {
      const clean = formData.parentPhone.replace(/[^0-9]/g, '')
      if (clean.length < 10) {
        errors.parentPhone = 'Enter valid Pakistani phone (e.g. +92 3XX XXXXXXX).'
      }
    }
    if (formData.dob) {
      const dobDate = new Date(formData.dob)
      if (dobDate > new Date()) {
        errors.dob = 'Date of birth cannot be in the future.'
      }
    }
    if (formData.testDate) {
      const testD = new Date(formData.testDate)
      testD.setHours(0, 0, 0, 0)
      const today = new Date()
      today.setHours(0, 0, 0, 0)
      if (testD < today) {
        errors.testDate = 'Entrance test date cannot be in the past.'
      }
    }
    setFormErrors(errors)
    return Object.keys(errors).length === 0
  }

  // Submit New / Edit Inquiry Form
  const handleSaveInquiry = async (mode = 'normal') => {
    if (!validateForm()) {
      toast.error('Please fix validation errors before saving.')
      return
    }

    setIsSubmitting(true)
    try {
      // Automatic stage progression if test date is specified
      let effectiveStage = formData.stage || 'Inquiry Received'
      if (formData.testDate && effectiveStage === 'Inquiry Received') {
        effectiveStage = 'Test/Interview Scheduled'
      }

      const payload = {
        ...formData,
        stage: effectiveStage,
        inquiryDate: formData.inquiryDate || new Date().toISOString().split('T')[0],
        academicSession: formData.academicSession || selectedSession,
        instituteId: currentInstitute?.id || 'inst-1',
        updatedAt: new Date().toISOString()
      }

      if (editingInquiry) {
        await updateItem('admissionsPipeline', editingInquiry.id, payload)
        toast.success(`Inquiry for "${formData.studentName}" updated successfully.`)
      } else {
        await addItem('admissionsPipeline', {
          ...payload,
          id: `lead-${Date.now()}`,
          createdAt: new Date().toISOString(),
          communicationLogs: [
            {
              id: `log-${Date.now()}`,
              type: 'Call',
              timestamp: new Date().toISOString(),
              counselor: formData.assignedCounselor || 'Admissions Counselor',
              notes: 'Initial admission inquiry recorded.'
            }
          ],
          documents: {
            bForm: false,
            resultCard: false,
            photos: false,
            transferCert: false
          }
        })
        toast.success(`Inquiry for "${formData.studentName}" recorded in pipeline!`)
      }

      setIsFormDirty(false)

      if (mode === 'addAnother') {
        setFormData({
          ...initialFormState,
          academicSession: selectedSession,
          gradeApplied: ''
        })
        setFormErrors({})
        toast.info('Ready to record next inquiry.')
      } else {
        setIsNewInquiryModalOpen(false)
      }
    } catch (err) {
      console.error(err)
      toast.error('Failed to save inquiry. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  // Stage Advancement & Transition Safety Rules
  const handleStageTransition = (lead, targetStage) => {
    // Stage safety rule 1: Enrolled only allowed after Offer Issued or Fee Paid
    if (targetStage === 'Enrolled' && lead.stage !== 'Offer Issued' && lead.stage !== 'Fee Paid') {
      toast.error('Candidate can only be enrolled after an Admission Offer is issued or Fee is paid.')
      return
    }

    // Stage safety rule 2: Moving to Side Stages (Rejected, Withdrawn, Lost) requires Reason
    if (['Rejected', 'Withdrawn', 'Lost'].includes(targetStage)) {
      setStageChangePrompt({ lead, targetStage })
      setStageReason('Fee too high')
      setStageNotes('')
      return
    }

    // Stage safety rule 3: Skipping multiple stages forward or moving backward allowed only for Admin
    const currentIdx = PRIMARY_STAGES.indexOf(lead.stage)
    const targetIdx = PRIMARY_STAGES.indexOf(targetStage)

    if (currentIdx !== -1 && targetIdx !== -1) {
      if (targetIdx < currentIdx && !isAdmin) {
        toast.error('Only Administrators are authorized to move candidate stages backward.')
        return
      }
      if (targetIdx > currentIdx + 1 && !isAdmin) {
        toast.error('Step skipping restricted. Follow standard stage sequence or request Administrator access.')
        return
      }
    }

    // If target is Enrolled, trigger Convert to Student Modal directly
    if (targetStage === 'Enrolled') {
      setSelectedLeadForEnroll(lead)
      return
    }

    // Execute standard stage transition
    executeStageChange(lead, targetStage)
  }

  const executeStageChange = async (lead, targetStage, extraUpdates = {}) => {
    await updateItem('admissionsPipeline', lead.id, {
      stage: targetStage,
      status: targetStage === 'Enrolled' ? 'Enrolled' : targetStage === 'Fee Paid' ? 'Fee Cleared' : 'In Progress',
      ...extraUpdates,
      updatedAt: new Date().toISOString()
    })
    toast.info(`${lead.studentName} moved to: ${targetStage}`)
  }

  // Confirm Stage Reason Modal (for Reject, Withdrawn, Lost)
  const handleConfirmStageReason = async () => {
    if (!stageChangePrompt) return
    const { lead, targetStage } = stageChangePrompt
    await executeStageChange(lead, targetStage, {
      rejectionReason: stageReason,
      rejectionNotes: stageNotes
    })
    setStageChangePrompt(null)
  }

  // Single Lead Archive
  const handleArchiveLead = async () => {
    if (!leadToArchive) return
    if (!isAdmin) {
      toast.error('Only Administrators can archive inquiry records.')
      return
    }
    await deleteItem('admissionsPipeline', leadToArchive.id)
    toast.success(`Inquiry for "${leadToArchive.studentName}" archived.`)
    setLeadToArchive(null)
  }

  // Bulk Archive
  const handleBulkArchive = async () => {
    if (!isAdmin) {
      toast.error('Only Administrators can perform bulk archive actions.')
      return
    }
    for (const id of selectedLeadIds) {
      await deleteItem('admissionsPipeline', id)
    }
    toast.success(`Archived ${selectedLeadIds.length} inquiries.`)
    setSelectedLeadIds([])
    setIsBulkArchiveOpen(false)
  }

  // Bulk Stage Change
  const handleBulkStageChange = async () => {
    for (const id of selectedLeadIds) {
      await updateItem('admissionsPipeline', id, {
        stage: bulkTargetStage,
        updatedAt: new Date().toISOString()
      })
    }
    toast.success(`Updated stage to "${bulkTargetStage}" for ${selectedLeadIds.length} inquiries.`)
    setSelectedLeadIds([])
    setIsBulkStageOpen(false)
  }

  // Bulk Counselor Assign
  const handleBulkCounselorAssign = async () => {
    for (const id of selectedLeadIds) {
      await updateItem('admissionsPipeline', id, {
        assignedCounselor: bulkTargetCounselor,
        updatedAt: new Date().toISOString()
      })
    }
    toast.success(`Assigned counselor "${bulkTargetCounselor}" to ${selectedLeadIds.length} inquiries.`)
    setSelectedLeadIds([])
    setIsBulkCounselorOpen(false)
  }

  // Save Scorecard from Modal
  const handleSaveScorecard = async (e) => {
    e.preventDefault()
    if (!selectedLeadForScorecard) return

    const totalWeight = 100
    const testP = Number(scorecardData.testMarks) || 0
    const interviewP = Number(scorecardData.interviewMarks) || 0
    const prevP = Number(scorecardData.previousMarksPct) || 0

    const weighted = Math.round((testP * 0.5) + (interviewP * 0.2) + (prevP * 0.3))
    const isPassed = scorecardData.resultStatus === 'Pass' && weighted >= 50

    const scorecard = {
      testMarks: testP,
      interviewMarks: interviewP,
      previousMarksPct: prevP,
      percentage: `${weighted}%`,
      decision: isPassed ? 'Recommended for Admission' : 'Requires Retest',
      resultStatus: scorecardData.resultStatus,
      remarks: scorecardData.remarks,
      evaluatedDate: new Date().toISOString().split('T')[0]
    }

    const nextStage = isPassed 
      ? (selectedLeadForScorecard.stage === 'Test Done' ? 'Interview Done' : selectedLeadForScorecard.stage) 
      : selectedLeadForScorecard.stage

    await updateItem('admissionsPipeline', selectedLeadForScorecard.id, {
      scorecard,
      stage: nextStage,
      updatedAt: new Date().toISOString()
    })

    toast.success(`Evaluation recorded for ${selectedLeadForScorecard.studentName} (${weighted}%)!`)
    setSelectedLeadForScorecard(null)
  }

  // Finalize Enrollment to Student Roster
  const handleConfirmStudentEnrollment = async (lead, enrollData) => {
    // 1. Add to students collection
    const createdStudent = await addItem('students', {
      name: enrollData.name,
      rollNumber: enrollData.rollNumber,
      className: enrollData.className,
      section: enrollData.section,
      gender: enrollData.gender || 'Male',
      bFormCnic: enrollData.bFormCnic || '',
      dob: enrollData.dob || '',
      phone: enrollData.guardianPhone || enrollData.phone || '',
      fatherName: enrollData.fatherName || '',
      fatherCnic: enrollData.fatherCnic || '',
      address: enrollData.address || '',
      city: enrollData.city || 'Lahore',
      email: enrollData.email || '',
      bloodGroup: enrollData.bloodGroup || '',
      status: 'Active',
      feeStatus: enrollData.feeStatus || 'Pending',
      academicSession: enrollData.academicSession || selectedSession,
      instituteId: currentInstitute?.id || 'inst-1',
      admittedFromPipelineId: lead.id,
      admissionDate: new Date().toISOString().split('T')[0]
    })

    // 2. Add first fee voucher to fees collection
    await addItem('fees', {
      studentName: enrollData.name,
      rollNumber: enrollData.rollNumber,
      className: enrollData.className,
      amount: Number(enrollData.admissionFeeAmount) || 25000,
      grossAmount: Number(enrollData.admissionFeeAmount) || 25000,
      discountAmount: 0,
      dueDate: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      status: enrollData.feeStatus === 'Paid' ? 'Paid' : 'Pending',
      feeTitle: 'Admission Enrollment & Security Fee',
      instituteId: currentInstitute?.id || 'inst-1',
      academicSession: enrollData.academicSession || selectedSession,
      paymentDate: enrollData.feeStatus === 'Paid' ? new Date().toISOString().split('T')[0] : null
    })

    // 3. Mark Lead as Enrolled
    await updateItem('admissionsPipeline', lead.id, {
      stage: 'Enrolled',
      status: 'Enrolled',
      transferredToRoster: true,
      assignedRollNumber: enrollData.rollNumber,
      studentId: createdStudent?.id || `std-${Date.now()}`,
      enrolledDate: new Date().toISOString().split('T')[0],
      updatedAt: new Date().toISOString()
    })

    toast.success(`🎉 Candidate "${enrollData.name}" enrolled in Roster as ${enrollData.rollNumber}!`)
  }

  // Filter & Search Pipeline Leads
  const filteredLeads = useMemo(() => {
    return admissionsPipeline.filter(lead => {
      // Session filter
      if (lead.academicSession && lead.academicSession !== selectedSession) {
        return false
      }

      // Search term
      if (searchTerm.trim()) {
        const q = searchTerm.toLowerCase()
        const matchesName = (lead.studentName || '').toLowerCase().includes(q)
        const matchesPhone = (lead.parentPhone || '').includes(q)
        const matchesGrade = (lead.gradeApplied || '').toLowerCase().includes(q)
        const matchesCounselor = (lead.assignedCounselor || '').toLowerCase().includes(q)
        if (!matchesName && !matchesPhone && !matchesGrade && !matchesCounselor) return false
      }

      // Level filter
      if (selectedLevelFilter !== 'ALL') {
        const level = detectProgramLevel(lead.gradeApplied)
        if (selectedLevelFilter === 'school') {
          if (!['elementary', 'secondary', 'school'].includes(level)) return false
        } else if (selectedLevelFilter === 'college') {
          if (!['higher-secondary', 'college'].includes(level)) return false
        } else if (selectedLevelFilter === 'university') {
          if (level !== 'university') return false
        }
      }

      // Class filter
      if (selectedClassFilter !== 'ALL' && lead.gradeApplied !== selectedClassFilter) {
        return false
      }

      // Stage filter
      if (selectedStageFilter !== 'ALL' && lead.stage !== selectedStageFilter) {
        return false
      }

      // Source filter
      if (selectedSourceFilter !== 'ALL' && lead.source !== selectedSourceFilter) {
        return false
      }

      // Counselor filter
      if (selectedCounselorFilter !== 'ALL' && lead.assignedCounselor !== selectedCounselorFilter) {
        return false
      }

      // Priority filter
      if (selectedPriorityFilter !== 'ALL' && lead.priority !== selectedPriorityFilter) {
        return false
      }

      // Date range filter
      if (selectedDateRange !== 'ALL' && lead.inquiryDate) {
        const leadD = new Date(lead.inquiryDate)
        const today = new Date()
        if (selectedDateRange === 'today') {
          if (leadD.toDateString() !== today.toDateString()) return false
        } else if (selectedDateRange === 'this_week') {
          const sevenDaysAgo = new Date()
          sevenDaysAgo.setDate(today.getDate() - 7)
          if (leadD < sevenDaysAgo) return false
        } else if (selectedDateRange === 'this_month') {
          if (leadD.getMonth() !== today.getMonth() || leadD.getFullYear() !== today.getFullYear()) return false
        }
      }

      return true
    })
  }, [
    admissionsPipeline, 
    selectedSession, 
    searchTerm, 
    selectedLevelFilter, 
    selectedClassFilter, 
    selectedStageFilter, 
    selectedSourceFilter, 
    selectedCounselorFilter, 
    selectedPriorityFilter, 
    selectedDateRange
  ])

  // Sort Leads
  const sortedLeads = useMemo(() => {
    const list = [...filteredLeads]
    list.sort((a, b) => {
      let valA = a[sortField] || ''
      let valB = b[sortField] || ''
      if (typeof valA === 'string') valA = valA.toLowerCase()
      if (typeof valB === 'string') valB = valB.toLowerCase()

      if (valA < valB) return sortDirection === 'asc' ? -1 : 1
      if (valA > valB) return sortDirection === 'asc' ? 1 : -1
      return 0
    })
    return list
  }, [filteredLeads, sortField, sortDirection])

  // Pagination
  const totalPages = Math.ceil(sortedLeads.length / itemsPerPage) || 1
  const paginatedLeads = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage
    return sortedLeads.slice(start, start + itemsPerPage)
  }, [sortedLeads, currentPage, itemsPerPage])

  // Sorting handler
  const handleSort = (field) => {
    if (sortField === field) {
      setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc')
    } else {
      setSortField(field)
      setSortDirection('asc')
    }
  }

  // Row selection handler
  const handleSelectRow = (id) => {
    setSelectedLeadIds(prev => 
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    )
  }

  const handleSelectAll = () => {
    if (selectedLeadIds.length === paginatedLeads.length) {
      setSelectedLeadIds([])
    } else {
      setSelectedLeadIds(paginatedLeads.map(l => l.id))
    }
  }

  // Calculate Conversion Rate
  const conversionRate = useMemo(() => {
    const totalInquiries = admissionsPipeline.filter(l => !l.academicSession || l.academicSession === selectedSession).length
    if (totalInquiries === 0) return '—'
    const totalEnrolled = admissionsPipeline.filter(l => 
      (!l.academicSession || l.academicSession === selectedSession) && l.stage === 'Enrolled'
    ).length
    return `${Math.round((totalEnrolled / totalInquiries) * 100)}%`
  }, [admissionsPipeline, selectedSession])

  // Today's Follow-ups calculation
  const followUpsDue = useMemo(() => {
    const todayStr = new Date().toISOString().split('T')[0]
    return admissionsPipeline.filter(lead => {
      if (!lead.nextFollowUpDate || lead.stage === 'Enrolled' || lead.stage === 'Lost') return false
      return lead.nextFollowUpDate <= todayStr
    })
  }, [admissionsPipeline])

  // Check if any leads have scores (for Merit List Gazette button disabled state)
  const hasEvaluatedLeads = useMemo(() => {
    return admissionsPipeline.some(l => l.scorecard || l.testMarks !== undefined)
  }, [admissionsPipeline])

  // Export Filtered CSV
  const exportPipelineCSV = () => {
    if (filteredLeads.length === 0) {
      toast.warning('No inquiries match current filters to export.')
      return
    }

    const headers = [
      'Applicant Name', 
      'Parent Name', 
      'Parent Phone', 
      'Class Applied', 
      'Stage', 
      'Priority', 
      'Source', 
      'Counselor', 
      'Next Follow-up', 
      'Test Date', 
      'Test Score %', 
      'Session'
    ]

    const rows = filteredLeads.map(l => [
      `"${l.studentName || ''}"`,
      `"${l.parentName || ''}"`,
      `"${l.parentPhone || ''}"`,
      `"${l.gradeApplied || ''}"`,
      `"${l.stage || ''}"`,
      `"${l.priority || ''}"`,
      `"${l.source || ''}"`,
      `"${l.assignedCounselor || ''}"`,
      `"${formatDateDDMMYYYY(l.nextFollowUpDate)}"`,
      `"${formatDateDDMMYYYY(l.testDate)}"`,
      `"${l.scorecard?.percentage || '—'}"`,
      `"${l.academicSession || selectedSession}"`
    ])

    const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\n')
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    link.href = URL.createObjectURL(blob)
    link.setAttribute('download', `leads_pipeline_${selectedSession}_${new Date().toISOString().split('T')[0]}.csv`)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    toast.success(`Exported ${filteredLeads.length} filtered inquiries to CSV.`)
  }

  // Download Sample CSV Template
  const downloadSampleTemplate = () => {
    const headers = ['Applicant Name', 'Parent Name', 'Parent Phone', 'Grade Applied', 'Gender', 'Source', 'Priority', 'Test Date']
    const sampleRows = [
      ['Muhammad Talha', 'Niaz Ahmed', '+92 300 1234567', 'Class 10', 'Male', 'Walk-in', 'Hot', '2026-11-15'],
      ['Zainab Fatima', 'Muhammad Shahid', '+92 321 9876543', '1st Year Pre-Medical', 'Female', 'Website', 'Warm', '2026-11-20']
    ]
    const content = [headers.join(','), ...sampleRows.map(r => r.map(c => `"${c}"`).join(','))].join('\n')
    const blob = new Blob([content], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    link.href = URL.createObjectURL(blob)
    link.setAttribute('download', 'admissions_inquiry_template.csv')
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    toast.info('Sample inquiry template downloaded.')
  }

  // Handle CSV Import
  const handleCsvFileUpload = (e) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (!file.name.endsWith('.csv')) {
      toast.error('Invalid file format. Please upload a .CSV file.')
      return
    }

    if (file.size > 2 * 1024 * 1024) {
      toast.error('File exceeds maximum 2MB size limit.')
      return
    }

    const reader = new FileReader()
    reader.onload = async (evt) => {
      try {
        const text = evt.target.result
        const lines = text.split(/\r\n|\n/).filter(line => line.trim())
        if (lines.length <= 1) {
          toast.error('CSV file has no data rows.')
          return
        }

        const errors = []
        const validRows = []

        for (let i = 1; i < lines.length; i++) {
          const rowValues = lines[i].split(',').map(c => c.replace(/^["']|["']$/g, '').trim())
          const [studentName, parentName, parentPhone, gradeApplied, gender, source, priority, testDate] = rowValues

          const rowNum = i + 1
          if (!studentName) {
            errors.push({ row: rowNum, error: 'Student Name is missing' })
            continue
          }
          if (!parentPhone) {
            errors.push({ row: rowNum, error: 'Parent Phone is missing' })
            continue
          }

          validRows.push({
            id: `lead-csv-${Date.now()}-${i}`,
            studentName,
            parentName: parentName || '',
            parentPhone: formatPhoneNumber(parentPhone),
            gradeApplied: gradeApplied || availableClasses[0] || '10th Grade',
            gender: gender || 'Male',
            source: source || 'Walk-in',
            priority: priority || 'Warm',
            testDate: testDate || '',
            stage: testDate ? 'Test/Interview Scheduled' : 'Inquiry Received',
            academicSession: selectedSession,
            inquiryDate: new Date().toISOString().split('T')[0],
            createdAt: new Date().toISOString()
          })
        }

        if (errors.length > 0) {
          setCsvErrorModal({ totalRows: lines.length - 1, validCount: validRows.length, errors })
        }

        if (validRows.length > 0) {
          for (const row of validRows) {
            await addItem('admissionsPipeline', row)
          }
          toast.success(`Successfully imported ${validRows.length} inquiries!`)
          setIsCsvImportOpen(false)
        }
      } catch (err) {
        console.error(err)
        toast.error('Failed to parse CSV file.')
      }
    }
    reader.readAsText(file)
  }

  // Clear all filters
  const handleClearFilters = () => {
    setSearchTerm('')
    setSelectedLevelFilter('ALL')
    setSelectedClassFilter('ALL')
    setSelectedStageFilter('ALL')
    setSelectedSourceFilter('ALL')
    setSelectedCounselorFilter('ALL')
    setSelectedPriorityFilter('ALL')
    setSelectedDateRange('ALL')
    setCurrentPage(1)
    toast.info('All filters reset to defaults.')
  }

  return (
    <div className="p-4 sm:p-6 md:p-8 space-y-6 max-w-7xl mx-auto animate-in fade-in duration-200">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-teal-600 text-white flex items-center justify-center shadow-2xs">
              <UserCheck className="w-4 h-4" />
            </div>
            <h1 className="text-xl font-bold text-slate-900 tracking-tight">Inquiries & Leads</h1>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            End-to-end prospective admissions pipeline, entrance test scorecards, merit list gazette, and student enrollment
          </p>
        </div>

        {/* Action Buttons Toolbar */}
        <div className="flex items-center gap-2 flex-wrap">
          {/* Academic Session Selector */}
          <div className="flex items-center gap-1.5 bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 shadow-2xs">
            <Calendar className="w-3.5 h-3.5 text-teal-600" />
            <select
              value={selectedSession}
              onChange={(e) => setSelectedSession(e.target.value)}
              className="text-xs font-bold bg-transparent text-slate-800 focus:outline-none cursor-pointer"
            >
              {defaultSessions.map(s => (
                <option key={s.id} value={s.name}>
                  {s.name} {s.isCurrent ? '(Current)' : ''}
                </option>
              ))}
            </select>
          </div>

          {/* Import CSV */}
          <button
            type="button"
            onClick={() => setIsCsvImportOpen(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-white hover:bg-slate-50 text-slate-700 rounded-lg text-xs font-bold border border-slate-200 shadow-2xs transition-all cursor-pointer"
          >
            <Upload className="w-3.5 h-3.5 text-slate-500" />
            <span className="hidden sm:inline">Import</span>
          </button>

          {/* Export CSV */}
          <button
            type="button"
            onClick={exportPipelineCSV}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-white hover:bg-slate-50 text-slate-700 rounded-lg text-xs font-bold border border-slate-200 shadow-2xs transition-all cursor-pointer"
          >
            <Download className="w-3.5 h-3.5 text-slate-500" />
            <span className="hidden sm:inline">Export</span>
          </button>

          {/* Public Link & QR Code */}
          <button
            type="button"
            onClick={() => setIsPublicLinkModalOpen(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-white hover:bg-slate-50 text-slate-700 rounded-lg text-xs font-bold border border-slate-200 shadow-2xs transition-all cursor-pointer"
            title="Public Admission Inquiry Form Link & QR Code"
          >
            <QrCode className="w-3.5 h-3.5 text-teal-600" />
            <span className="hidden sm:inline">Public Form</span>
          </button>

          {/* Merit List Gazette Button */}
          <button
            type="button"
            disabled={!hasEvaluatedLeads}
            onClick={() => setIsMeritListOpen(true)}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all shadow-2xs ${
              hasEvaluatedLeads 
                ? 'bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700 text-white cursor-pointer' 
                : 'bg-slate-100 text-slate-400 border border-slate-200 cursor-not-allowed opacity-70'
            }`}
            title={hasEvaluatedLeads ? "Open Official Entrance Exam Merit & Selection Gazette" : "Enter test scores first to view Merit List Gazette"}
          >
            <Award className="w-3.5 h-3.5 text-amber-200" />
            <span>Merit List Gazette</span>
          </button>

          {/* New Admission Inquiry Button */}
          <button
            type="button"
            onClick={handleOpenAddModal}
            className="flex items-center gap-1.5 px-3.5 py-1.5 bg-teal-600 hover:bg-teal-700 text-white rounded-lg text-xs font-bold shadow transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>New Admission Inquiry</span>
          </button>
        </div>
      </div>

      {/* Today's Follow-ups Priority Panel (Collapsible Banner) */}
      {followUpsDue.length > 0 && (
        <div className="p-3.5 bg-amber-50/80 border border-amber-200 rounded-2xl flex flex-wrap items-center justify-between gap-3 text-xs shadow-2xs">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-amber-500 text-slate-950 flex items-center justify-center font-black">
              <Clock className="w-4 h-4" />
            </div>
            <div>
              <span className="font-bold text-amber-950 block">
                {followUpsDue.length} Follow-up{followUpsDue.length > 1 ? 's' : ''} Scheduled Today or Overdue!
              </span>
              <span className="text-[11px] text-amber-800">
                Action needed to sustain prospect interest and accelerate student enrollment.
              </span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => {
                setSelectedDateRange('today')
                setCurrentPage(1)
              }}
              className="px-3 py-1 bg-amber-600 hover:bg-amber-700 text-white font-bold rounded-lg text-xs shadow-2xs cursor-pointer"
            >
              Filter Due Leads
            </button>
          </div>
        </div>
      )}

      {/* Pipeline Stage Cards (Clickable Filter Bar with Conversion %) */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-xs text-slate-500 px-1">
          <span className="font-bold uppercase tracking-wider text-[11px] text-slate-400">
            Pipeline Progression Stages ({selectedSession})
          </span>
          <span className="font-semibold text-teal-800 bg-teal-50 px-2 py-0.5 rounded border border-teal-200 text-[11px]">
            Inquiry &gt; Enrolled Conversion: <strong className="font-black">{conversionRate}</strong>
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-2.5">
          {PRIMARY_STAGES.map((st, i) => {
            const count = admissionsPipeline.filter(a => 
              (!a.academicSession || a.academicSession === selectedSession) && a.stage === st
            ).length
            const isSelected = selectedStageFilter === st

            return (
              <button
                key={st}
                type="button"
                onClick={() => {
                  setSelectedStageFilter(prev => prev === st ? 'ALL' : st)
                  setCurrentPage(1)
                }}
                className={`p-3 rounded-xl border text-left transition-all cursor-pointer relative overflow-hidden ${
                  isSelected 
                    ? 'bg-teal-50 border-teal-500 ring-2 ring-teal-500/30 shadow-sm' 
                    : 'bg-white border-slate-200 hover:border-slate-300 hover:bg-slate-50/50 shadow-2xs'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-[9px] font-bold uppercase text-slate-400 tracking-wider">Stage {i + 1}</span>
                  {isSelected && <span className="w-1.5 h-1.5 rounded-full bg-teal-600"></span>}
                </div>
                <span className="text-lg font-black text-slate-900 font-mono mt-0.5 block">{count}</span>
                <span className="text-[11px] text-slate-700 font-semibold truncate block mt-0.5" title={st}>
                  {st}
                </span>
              </button>
            )
          })}
        </div>

        {/* Side Stages Badges Bar */}
        <div className="flex items-center gap-1.5 flex-wrap pt-1 text-xs">
          <span className="text-[10px] font-bold uppercase text-slate-400 mr-1">Side Stages:</span>
          {SIDE_STAGES.map(sideStage => {
            const count = admissionsPipeline.filter(a => 
              (!a.academicSession || a.academicSession === selectedSession) && a.stage === sideStage
            ).length
            const isSelected = selectedStageFilter === sideStage

            return (
              <button
                key={sideStage}
                type="button"
                onClick={() => {
                  setSelectedStageFilter(prev => prev === sideStage ? 'ALL' : sideStage)
                  setCurrentPage(1)
                }}
                className={`px-2.5 py-1 rounded-lg text-xs font-semibold border transition-all cursor-pointer flex items-center gap-1.5 ${
                  isSelected 
                    ? 'bg-slate-800 text-white border-slate-800' 
                    : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                }`}
              >
                <span>{sideStage}</span>
                <span className="font-mono font-bold text-[10px] px-1.5 rounded bg-slate-100 text-slate-700">
                  {count}
                </span>
              </button>
            )
          })}
          {selectedStageFilter !== 'ALL' && (
            <button
              type="button"
              onClick={() => setSelectedStageFilter('ALL')}
              className="text-[11px] text-teal-700 hover:underline font-bold ml-2 cursor-pointer"
            >
              Clear Stage Filter
            </button>
          )}
        </div>
      </div>

      {/* Comprehensive Filter Toolbar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm space-y-3">
        {/* Row 1: Search, View Mode Toggle & Total Leads Counter */}
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search by student name, phone, grade, or counselor..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value)
                setCurrentPage(1)
              }}
              className="w-full pl-9 pr-4 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-teal-500/20"
            />
            {searchTerm && (
              <button
                type="button"
                onClick={() => setSearchTerm('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          <div className="flex items-center gap-2 self-end md:self-auto">
            {/* View Mode Toggle */}
            <div className="flex items-center bg-slate-100 p-0.5 rounded-xl border border-slate-200 text-xs font-bold">
              <button
                type="button"
                onClick={() => setViewMode('table')}
                className={`px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-all cursor-pointer ${
                  viewMode === 'table' ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-500 hover:text-slate-900'
                }`}
              >
                <TableIcon className="w-3.5 h-3.5" />
                <span>Table</span>
              </button>
              <button
                type="button"
                onClick={() => setViewMode('kanban')}
                className={`px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-all cursor-pointer ${
                  viewMode === 'kanban' ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-500 hover:text-slate-900'
                }`}
              >
                <LayoutGrid className="w-3.5 h-3.5" />
                <span>Kanban</span>
              </button>
            </div>

            <span className="text-xs font-bold text-teal-800 bg-teal-50 border border-teal-200 px-3 py-1.5 rounded-xl whitespace-nowrap">
              Total Leads: {filteredLeads.length}
            </span>
          </div>
        </div>

        {/* Row 2: Secondary Dropdown Filters Bar */}
        <div className="flex items-center justify-between gap-2 flex-wrap pt-2 border-t border-slate-100 text-xs">
          <div className="flex items-center gap-2 flex-wrap">
            {/* Level Filter */}
            <select
              value={selectedLevelFilter}
              onChange={(e) => {
                setSelectedLevelFilter(e.target.value)
                setCurrentPage(1)
              }}
              className="px-2.5 py-1.5 rounded-lg border border-slate-200 bg-white text-slate-700 font-semibold focus:outline-none cursor-pointer"
            >
              <option value="ALL">All Educational Tiers</option>
              <option value="school">School (1st - 10th)</option>
              <option value="college">College (11th - 12th)</option>
              <option value="university">University (BS / BBA)</option>
            </select>

            {/* Class / Program Applied Filter */}
            <select
              value={selectedClassFilter}
              onChange={(e) => {
                setSelectedClassFilter(e.target.value)
                setCurrentPage(1)
              }}
              className="px-2.5 py-1.5 rounded-lg border border-slate-200 bg-white text-slate-700 font-semibold focus:outline-none cursor-pointer"
            >
              <option value="ALL">All Classes / Programs</option>
              {availableClasses.map(c => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>

            {/* Stage Filter */}
            <select
              value={selectedStageFilter}
              onChange={(e) => {
                setSelectedStageFilter(e.target.value)
                setCurrentPage(1)
              }}
              className="px-2.5 py-1.5 rounded-lg border border-slate-200 bg-white text-slate-700 font-semibold focus:outline-none cursor-pointer"
            >
              <option value="ALL">All Stages</option>
              {ALL_STAGES.map(st => (
                <option key={st} value={st}>{st}</option>
              ))}
            </select>

            {/* Lead Source Filter */}
            <select
              value={selectedSourceFilter}
              onChange={(e) => {
                setSelectedSourceFilter(e.target.value)
                setCurrentPage(1)
              }}
              className="px-2.5 py-1.5 rounded-lg border border-slate-200 bg-white text-slate-700 font-semibold focus:outline-none cursor-pointer"
            >
              <option value="ALL">All Lead Sources</option>
              {['Walk-in', 'Phone', 'WhatsApp', 'Facebook/Instagram', 'Website', 'Referral', 'Banner/Event'].map(src => (
                <option key={src} value={src}>{src}</option>
              ))}
            </select>

            {/* Assigned Counselor Filter */}
            <select
              value={selectedCounselorFilter}
              onChange={(e) => {
                setSelectedCounselorFilter(e.target.value)
                setCurrentPage(1)
              }}
              className="px-2.5 py-1.5 rounded-lg border border-slate-200 bg-white text-slate-700 font-semibold focus:outline-none cursor-pointer"
            >
              <option value="ALL">All Counselors</option>
              {['Admissions Counselor 1', 'Admissions Counselor 2', 'Admissions Desk'].map(c => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>

            {/* Priority Filter */}
            <select
              value={selectedPriorityFilter}
              onChange={(e) => {
                setSelectedPriorityFilter(e.target.value)
                setCurrentPage(1)
              }}
              className="px-2.5 py-1.5 rounded-lg border border-slate-200 bg-white text-slate-700 font-semibold focus:outline-none cursor-pointer"
            >
              <option value="ALL">All Priorities</option>
              <option value="Hot">Hot Priority</option>
              <option value="Warm">Warm Priority</option>
              <option value="Cold">Cold Priority</option>
            </select>

            {/* Date Range Filter */}
            <select
              value={selectedDateRange}
              onChange={(e) => {
                setSelectedDateRange(e.target.value)
                setCurrentPage(1)
              }}
              className="px-2.5 py-1.5 rounded-lg border border-slate-200 bg-white text-slate-700 font-semibold focus:outline-none cursor-pointer"
            >
              <option value="ALL">All Dates</option>
              <option value="today">Registered Today</option>
              <option value="this_week">Past 7 Days</option>
              <option value="this_month">This Month</option>
            </select>
          </div>

          {/* Clear Filters Button */}
          <button
            type="button"
            onClick={handleClearFilters}
            className="text-xs text-rose-600 hover:text-rose-800 font-bold px-2 py-1 hover:bg-rose-50 rounded-lg transition-all cursor-pointer"
          >
            Clear Filters
          </button>
        </div>
      </div>

      {/* Floating Bulk Actions Bar when rows are selected */}
      {selectedLeadIds.length > 0 && (
        <div className="bg-slate-900 text-white px-4 py-2.5 rounded-2xl flex flex-wrap items-center justify-between gap-3 shadow-lg animate-in fade-in duration-150">
          <div className="flex items-center gap-2">
            <span className="w-5 h-5 rounded-full bg-teal-500 text-slate-950 flex items-center justify-center font-black text-[10px]">
              {selectedLeadIds.length}
            </span>
            <span className="text-xs font-bold text-slate-200">
              {selectedLeadIds.length} Lead{selectedLeadIds.length > 1 ? 's' : ''} Selected
            </span>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <button
              type="button"
              onClick={() => setIsBulkStageOpen(true)}
              className="px-3 py-1 bg-slate-800 hover:bg-slate-700 text-xs font-bold rounded-lg text-teal-300 border border-slate-700 cursor-pointer flex items-center gap-1"
            >
              <Layers className="w-3.5 h-3.5" />
              <span>Change Stage</span>
            </button>

            <button
              type="button"
              onClick={() => setIsBulkCounselorOpen(true)}
              className="px-3 py-1 bg-slate-800 hover:bg-slate-700 text-xs font-bold rounded-lg text-indigo-300 border border-slate-700 cursor-pointer flex items-center gap-1"
            >
              <UserCheck className="w-3.5 h-3.5" />
              <span>Assign Counselor</span>
            </button>

            <button
              type="button"
              onClick={() => {
                const selectedList = admissionsPipeline.filter(l => selectedLeadIds.includes(l.id))
                const headers = ['Applicant Name', 'Phone', 'Grade Applied', 'Stage', 'Priority']
                const rows = selectedList.map(l => [`"${l.studentName}"`, `"${l.parentPhone}"`, `"${l.gradeApplied}"`, `"${l.stage}"`, `"${l.priority}"`])
                const blob = new Blob([[headers.join(','), ...rows.map(r => r.join(','))].join('\n')], { type: 'text/csv;' })
                const a = document.createElement('a')
                a.href = URL.createObjectURL(blob)
                a.download = `selected_leads_${selectedLeadIds.length}.csv`
                a.click()
                toast.success(`Exported ${selectedLeadIds.length} selected leads.`)
              }}
              className="px-3 py-1 bg-slate-800 hover:bg-slate-700 text-xs font-bold rounded-lg text-slate-200 border border-slate-700 cursor-pointer flex items-center gap-1"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export Selected</span>
            </button>

            <button
              type="button"
              onClick={() => setIsBulkArchiveOpen(true)}
              className="px-3 py-1 bg-rose-600/90 hover:bg-rose-600 text-xs font-bold rounded-lg text-white cursor-pointer flex items-center gap-1"
            >
              <Archive className="w-3.5 h-3.5" />
              <span>Archive Selected</span>
            </button>
          </div>
        </div>
      )}

      {/* Main View: TABLE VIEW vs KANBAN BOARD */}
      {viewMode === 'table' ? (
        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
          {filteredLeads.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold uppercase text-[10px] tracking-wider select-none">
                    <th className="py-3.5 px-4 text-center w-10">
                      <input
                        type="checkbox"
                        checked={selectedLeadIds.length > 0 && selectedLeadIds.length === paginatedLeads.length}
                        onChange={handleSelectAll}
                        className="rounded border-slate-300 text-teal-600 focus:ring-teal-500 cursor-pointer"
                      />
                    </th>
                    <th 
                      onClick={() => handleSort('studentName')}
                      className="py-3.5 px-4 cursor-pointer hover:bg-slate-100 whitespace-nowrap min-w-[180px]"
                    >
                      <div className="flex items-center gap-1.5">
                        <span>APPLICANT NAME</span>
                        {sortField === 'studentName' ? (
                          sortDirection === 'asc' ? <ArrowUp className="w-3 h-3 text-teal-600" /> : <ArrowDown className="w-3 h-3 text-teal-600" />
                        ) : <ArrowUpDown className="w-3 h-3 text-slate-300" />}
                      </div>
                    </th>
                    <th 
                      onClick={() => handleSort('gradeApplied')}
                      className="py-3.5 px-4 cursor-pointer hover:bg-slate-100 whitespace-nowrap min-w-[140px]"
                    >
                      <div className="flex items-center gap-1.5">
                        <span>CLASS / PROGRAM</span>
                        {sortField === 'gradeApplied' ? (
                          sortDirection === 'asc' ? <ArrowUp className="w-3 h-3 text-teal-600" /> : <ArrowDown className="w-3 h-3 text-teal-600" />
                        ) : <ArrowUpDown className="w-3 h-3 text-slate-300" />}
                      </div>
                    </th>
                    <th className="py-3.5 px-4 whitespace-nowrap min-w-[160px]">
                      GUARDIAN & CONTACT
                    </th>
                    <th 
                      onClick={() => handleSort('stage')}
                      className="py-3.5 px-4 cursor-pointer hover:bg-slate-100 whitespace-nowrap min-w-[140px]"
                    >
                      <div className="flex items-center gap-1.5">
                        <span>CURRENT STAGE</span>
                        {sortField === 'stage' ? (
                          sortDirection === 'asc' ? <ArrowUp className="w-3 h-3 text-teal-600" /> : <ArrowDown className="w-3 h-3 text-teal-600" />
                        ) : <ArrowUpDown className="w-3 h-3 text-slate-300" />}
                      </div>
                    </th>
                    <th 
                      onClick={() => handleSort('priority')}
                      className="py-3.5 px-3 cursor-pointer hover:bg-slate-100 text-center whitespace-nowrap"
                    >
                      <span>PRIORITY</span>
                    </th>
                    <th className="py-3.5 px-3 text-center whitespace-nowrap">
                      TEST SCORE
                    </th>
                    <th 
                      onClick={() => handleSort('nextFollowUpDate')}
                      className="py-3.5 px-3 cursor-pointer hover:bg-slate-100 text-center whitespace-nowrap"
                    >
                      <span>NEXT FOLLOW-UP</span>
                    </th>
                    <th className="py-3.5 px-4 text-right whitespace-nowrap min-w-[150px]">
                      ACTIONS
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {paginatedLeads.map((lead) => {
                    const isChecked = selectedLeadIds.includes(lead.id)
                    const isOverdue = lead.nextFollowUpDate && new Date(lead.nextFollowUpDate) < new Date()

                    return (
                      <tr 
                        key={lead.id}
                        className={`hover:bg-slate-50/80 transition-colors ${isChecked ? 'bg-teal-50/40' : ''}`}
                      >
                        <td className="py-3 px-4 text-center">
                          <input
                            type="checkbox"
                            checked={isChecked}
                            onChange={() => handleSelectRow(lead.id)}
                            className="rounded border-slate-300 text-teal-600 focus:ring-teal-500 cursor-pointer"
                          />
                        </td>
                        <td className="py-3 px-4">
                          <div className="font-bold text-slate-900 flex items-center gap-1.5">
                            <span 
                              onClick={() => setSelectedLeadForDossier(lead)}
                              className="hover:underline hover:text-teal-700 cursor-pointer"
                            >
                              {lead.studentName}
                            </span>
                            {lead.siblingEnrolled && (
                              <span className="w-2 h-2 rounded-full bg-blue-500" title="Sibling already enrolled"></span>
                            )}
                          </div>
                          <div className="text-[11px] text-slate-500 flex items-center gap-2 mt-0.5">
                            <span>{lead.gender || 'Applicant'}</span>
                            <span>•</span>
                            <span className="text-teal-700 font-semibold">{lead.source || 'Walk-in'}</span>
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <span className="font-semibold text-slate-800 block">{lead.gradeApplied}</span>
                          <span className="text-[10px] font-mono uppercase text-slate-400">
                            Session {lead.academicSession || selectedSession}
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          <div className="font-mono text-xs text-slate-800 font-semibold flex items-center gap-1.5">
                            <Phone className="w-3 h-3 text-slate-400 shrink-0" />
                            <span>{lead.parentPhone}</span>
                          </div>
                          <div className="text-[11px] text-slate-500 mt-0.5">
                            <span className="text-slate-400">Guardian:</span> {lead.parentName || '—'}
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold ${
                            lead.stage === 'Enrolled'
                              ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                              : lead.stage === 'Fee Paid'
                                ? 'bg-teal-50 text-teal-800 border border-teal-200'
                                : lead.stage === 'Offer Issued'
                                  ? 'bg-blue-50 text-blue-800 border border-blue-200'
                                  : ['Rejected', 'Lost'].includes(lead.stage)
                                    ? 'bg-rose-50 text-rose-800 border border-rose-200'
                                    : 'bg-slate-100 text-slate-700 border border-slate-200'
                          }`}>
                            <span className={`w-1.5 h-1.5 rounded-full ${
                              lead.stage === 'Enrolled' ? 'bg-emerald-500' : lead.stage === 'Offer Issued' ? 'bg-blue-500' : 'bg-slate-400'
                            }`}></span>
                            <span>{lead.stage}</span>
                          </span>
                        </td>
                        <td className="py-3 px-3 text-center">
                          <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold ${
                            lead.priority === 'Hot' 
                              ? 'bg-rose-50 text-rose-700 border border-rose-200'
                              : lead.priority === 'Warm'
                                ? 'bg-amber-50 text-amber-700 border border-amber-200'
                                : 'bg-blue-50 text-blue-700 border border-blue-200'
                          }`}>
                            {lead.priority === 'Hot' && <Flame className="w-3 h-3" />}
                            {lead.priority === 'Warm' && <Thermometer className="w-3 h-3" />}
                            {lead.priority === 'Cold' && <Snowflake className="w-3 h-3" />}
                            <span>{lead.priority || 'Warm'}</span>
                          </span>
                        </td>
                        <td className="py-3 px-3 text-center font-mono">
                          {lead.scorecard ? (
                            <span className="font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                              {lead.scorecard.percentage}
                            </span>
                          ) : (
                            <span className="text-slate-400 text-[11px]">—</span>
                          )}
                        </td>
                        <td className="py-3 px-3 text-center font-mono text-[11px]">
                          {lead.nextFollowUpDate ? (
                            <span className={`px-2 py-0.5 rounded font-semibold ${
                              isOverdue ? 'bg-rose-50 text-rose-700 font-bold' : 'text-slate-600'
                            }`}>
                              {formatDateDDMMYYYY(lead.nextFollowUpDate)}
                            </span>
                          ) : (
                            <span className="text-slate-400">—</span>
                          )}
                        </td>
                        <td className="py-3 px-4 text-right">
                          <div className="flex items-center justify-end gap-1">
                            {/* Scorecard Action */}
                            <button
                              type="button"
                              onClick={() => {
                                setSelectedLeadForScorecard(lead)
                                if (lead.scorecard) {
                                  setScorecardData({
                                    testMarks: lead.scorecard.testMarks || 80,
                                    interviewMarks: lead.scorecard.interviewMarks || 80,
                                    previousMarksPct: lead.scorecard.previousMarksPct || 80,
                                    resultStatus: lead.scorecard.resultStatus || 'Pass',
                                    remarks: lead.scorecard.remarks || ''
                                  })
                                }
                              }}
                              className="p-1.5 text-slate-500 hover:text-amber-700 hover:bg-amber-50 rounded cursor-pointer"
                              title="Entrance Test & Interview Scorecard"
                            >
                              <Award className="w-3.5 h-3.5" />
                            </button>

                            {/* Offer Letter Action */}
                            <button
                              type="button"
                              onClick={() => setSelectedLeadForOffer(lead)}
                              className="p-1.5 text-slate-500 hover:text-teal-700 hover:bg-teal-50 rounded cursor-pointer"
                              title="Official Admission Offer Letter"
                            >
                              <FileText className="w-3.5 h-3.5" />
                            </button>

                            {/* Convert to Student Action (If Offer Issued or Fee Paid) */}
                            {(lead.stage === 'Offer Issued' || lead.stage === 'Fee Paid') && (
                              <button
                                type="button"
                                onClick={() => setSelectedLeadForEnroll(lead)}
                                className="px-2 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded font-bold text-[10px] flex items-center gap-1 shadow-2xs cursor-pointer"
                                title="1-Click Enroll Candidate into Student Admissions Roster"
                              >
                                <GraduationCap className="w-3 h-3" />
                                <span>Enroll</span>
                              </button>
                            )}

                            {/* WhatsApp Direct Share */}
                            {lead.parentPhone && (
                              <button
                                type="button"
                                onClick={() => setSelectedLeadForMessage(lead)}
                                className="p-1.5 text-slate-500 hover:text-emerald-700 hover:bg-emerald-50 rounded cursor-pointer"
                                title="Send Message (WhatsApp / SMS)"
                              >
                                <MessageSquare className="w-3.5 h-3.5" />
                              </button>
                            )}

                            {/* Edit Inquiry */}
                            <button
                              type="button"
                              onClick={() => handleOpenEditModal(lead)}
                              className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded cursor-pointer"
                              title="Edit Inquiry"
                            >
                              <Eye className="w-3.5 h-3.5" />
                            </button>

                            {/* Archive Inquiry */}
                            <button
                              type="button"
                              onClick={() => setLeadToArchive(lead)}
                              className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded cursor-pointer"
                              title="Archive Inquiry Record"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>

              {/* Table Pagination Bar */}
              <div className="flex items-center justify-between px-4 py-3 border-t border-slate-100 text-xs text-slate-500">
                <span>
                  Showing {paginatedLeads.length} of {filteredLeads.length} candidate inquiries
                </span>
                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    disabled={currentPage <= 1}
                    onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                    className="px-2.5 py-1 rounded border border-slate-200 font-semibold disabled:opacity-40 hover:bg-slate-50 cursor-pointer"
                  >
                    Previous
                  </button>
                  <span className="font-bold text-slate-800">
                    Page {currentPage} of {totalPages}
                  </span>
                  <button
                    type="button"
                    disabled={currentPage >= totalPages}
                    onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                    className="px-2.5 py-1 rounded border border-slate-200 font-semibold disabled:opacity-40 hover:bg-slate-50 cursor-pointer"
                  >
                    Next
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="p-16 text-center">
              <UserCheck className="w-12 h-12 text-slate-300 mx-auto mb-3" />
              <h3 className="text-base font-bold text-slate-700">0 Admissions Inquiries Found</h3>
              <p className="text-xs text-slate-400 max-w-sm mx-auto mt-1">
                {searchTerm || selectedStageFilter !== 'ALL' || selectedLevelFilter !== 'ALL'
                  ? 'No prospective candidate records match the active search or filters. Click "Clear Filters" to view all inquiries.'
                  : 'No admission inquiries recorded in this session. Click "New Admission Inquiry" to add the first prospective student.'}
              </p>
              <div className="mt-4 flex items-center justify-center gap-2">
                {searchTerm || selectedStageFilter !== 'ALL' ? (
                  <button
                    type="button"
                    onClick={handleClearFilters}
                    className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-bold cursor-pointer"
                  >
                    Reset Filters
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={handleOpenAddModal}
                    className="px-5 py-2.5 bg-teal-600 hover:bg-teal-700 text-white rounded-lg text-xs font-bold shadow inline-flex items-center gap-1.5 cursor-pointer"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Add First Inquiry</span>
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      ) : (
        /* KANBAN BOARD VIEW */
        <div className="space-y-4">
          <div className="flex gap-4 overflow-x-auto pb-4">
            {PRIMARY_STAGES.map((stage) => {
              const stageLeads = filteredLeads.filter(l => l.stage === stage)

              return (
                <div 
                  key={stage}
                  className="w-72 shrink-0 bg-slate-50 border border-slate-200 rounded-2xl flex flex-col max-h-[700px]"
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={(e) => {
                    e.preventDefault()
                    const leadId = e.dataTransfer.getData('text/plain')
                    const draggedLead = admissionsPipeline.find(l => l.id === leadId)
                    if (draggedLead && draggedLead.stage !== stage) {
                      handleStageTransition(draggedLead, stage)
                    }
                  }}
                >
                  {/* Kanban Column Header */}
                  <div className="p-3 border-b border-slate-200/80 flex items-center justify-between bg-white rounded-t-2xl">
                    <span className="font-bold text-xs text-slate-800 truncate" title={stage}>{stage}</span>
                    <span className="w-5 h-5 rounded-full bg-slate-100 text-slate-700 flex items-center justify-center font-mono font-bold text-[10px]">
                      {stageLeads.length}
                    </span>
                  </div>

                  {/* Cards Container */}
                  <div className="p-2.5 space-y-2.5 overflow-y-auto flex-1">
                    {stageLeads.map((lead) => (
                      <div
                        key={lead.id}
                        draggable
                        onDragStart={(e) => {
                          e.dataTransfer.setData('text/plain', lead.id)
                        }}
                        className="p-3 bg-white border border-slate-200 rounded-xl shadow-2xs hover:shadow-md transition-all cursor-grab active:cursor-grabbing space-y-2"
                      >
                        <div className="flex items-start justify-between">
                          <span 
                            onClick={() => setSelectedLeadForDossier(lead)}
                            className="font-bold text-xs text-slate-900 hover:text-teal-700 hover:underline cursor-pointer"
                          >
                            {lead.studentName}
                          </span>
                          <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded uppercase ${
                            lead.priority === 'Hot' ? 'bg-rose-50 text-rose-700' : 'bg-slate-100 text-slate-600'
                          }`}>
                            {lead.priority || 'Warm'}
                          </span>
                        </div>

                        <div className="text-[11px] text-slate-500 space-y-0.5">
                          <div className="font-semibold text-slate-700">{lead.gradeApplied}</div>
                          <div className="font-mono">{lead.parentPhone}</div>
                        </div>

                        {lead.scorecard && (
                          <div className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">
                            Score: {lead.scorecard.percentage} ({lead.scorecard.decision})
                          </div>
                        )}

                        {/* Quick Kanban Action Buttons */}
                        <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
                          <button
                            type="button"
                            onClick={() => setSelectedLeadForDossier(lead)}
                            className="text-slate-400 hover:text-slate-700 p-1"
                            title="View Dossier"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </button>
                          {(lead.stage === 'Offer Issued' || lead.stage === 'Fee Paid') && (
                            <button
                              type="button"
                              onClick={() => setSelectedLeadForEnroll(lead)}
                              className="px-2 py-0.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded text-[10px] font-bold flex items-center gap-1"
                            >
                              <GraduationCap className="w-3 h-3" />
                              <span>Enroll</span>
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                    {stageLeads.length === 0 && (
                      <div className="py-8 text-center text-slate-400 text-xs border border-dashed rounded-xl">
                        Drop candidates here
                      </div>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* NEW / EDIT ADMISSION INQUIRY MODAL */}
      <Modal
        isOpen={isNewInquiryModalOpen}
        onClose={() => {
          if (isFormDirty) {
            setIsDiscardConfirmOpen(true)
          } else {
            setIsNewInquiryModalOpen(false)
          }
        }}
        title={editingInquiry ? `Edit Admission Inquiry: ${editingInquiry.studentName}` : "New Admission Inquiry"}
        maxWidth="max-w-3xl"
      >
        <form onSubmit={(e) => { e.preventDefault(); handleSaveInquiry('normal'); }} className="space-y-4">
          {/* Duplicate Warning Alert */}
          {duplicateWarning && (
            <div className="p-3 bg-amber-50 border border-amber-300 rounded-xl flex items-center justify-between text-xs text-amber-900 animate-in fade-in">
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
                <span>
                  <strong>DUPLICATE WARNING:</strong> A lead with phone <strong>{duplicateWarning.parentPhone}</strong> already exists ({duplicateWarning.studentName} - {duplicateWarning.gradeApplied}).
                </span>
              </div>
              <button
                type="button"
                onClick={() => {
                  setIsNewInquiryModalOpen(false)
                  setSelectedLeadForDossier(duplicateWarning)
                }}
                className="text-[11px] font-bold text-amber-800 underline hover:text-amber-950 cursor-pointer ml-2"
              >
                View Existing Lead
              </button>
            </div>
          )}

          {/* Section 1: Candidate Identity */}
          <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl space-y-3">
            <span className="text-[11px] font-bold uppercase text-slate-500 tracking-wider block">
              1. Prospective Candidate Details
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div>
                <label className="block text-[10px] font-bold text-slate-700 uppercase mb-1">
                  Applicant Student Name <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Daniyal Tariq"
                  value={formData.studentName}
                  onChange={(e) => {
                    setFormData({ ...formData, studentName: e.target.value })
                    setIsFormDirty(true)
                    if (formErrors.studentName) setFormErrors({ ...formErrors, studentName: null })
                  }}
                  className={`w-full px-3 py-2 text-xs rounded-lg border bg-white focus:outline-none ${
                    formErrors.studentName ? 'border-rose-500 bg-rose-50' : 'border-slate-300'
                  }`}
                />
                {formErrors.studentName && <p className="text-[10px] text-rose-600 mt-0.5">{formErrors.studentName}</p>}
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-700 uppercase mb-1">
                  Applying for Class / Program <span className="text-rose-500">*</span>
                </label>
                <select
                  required
                  value={formData.gradeApplied}
                  onChange={(e) => {
                    setFormData({ ...formData, gradeApplied: e.target.value })
                    setIsFormDirty(true)
                    if (formErrors.gradeApplied) setFormErrors({ ...formErrors, gradeApplied: null })
                  }}
                  className={`w-full px-3 py-2 text-xs rounded-lg border bg-white font-bold focus:outline-none ${
                    formErrors.gradeApplied ? 'border-rose-500 bg-rose-50' : 'border-slate-300'
                  }`}
                >
                  <option value="">-- Select Class / Program --</option>
                  {availableClassesForLevel.length > 0 ? (
                    availableClassesForLevel.map(c => {
                      const matchClass = classes.find(cl => cl.name === c)
                      const cap = matchClass ? (matchClass.capacity || (matchClass.sections || []).reduce((sum, s) => sum + Number(s.capacity || 0), 0)) : 40
                      const enrolled = students.filter(st => st.className === c && st.status !== 'Withdrawn').length
                      const seatsLeft = Math.max(0, cap - enrolled)
                      return (
                        <option key={c} value={c}>
                          {c} ({seatsLeft > 0 ? `${seatsLeft} seats left` : 'FULL • Waitlist'})
                        </option>
                      )
                    })
                  ) : (
                    <option value="" disabled>No classes created yet</option>
                  )}
                </select>
                {(() => {
                  if (!formData.gradeApplied) return null
                  const matchClass = classes.find(cl => cl.name === formData.gradeApplied)
                  if (!matchClass) return null
                  const cap = matchClass.capacity || (matchClass.sections || []).reduce((sum, s) => sum + Number(s.capacity || 0), 0)
                  const enrolled = students.filter(st => st.className === formData.gradeApplied && st.status !== 'Withdrawn').length
                  if (enrolled >= cap) {
                    return (
                      <p className="text-[10px] text-amber-800 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded mt-1 font-semibold">
                        ⚠️ Notice: {formData.gradeApplied} is at full capacity ({enrolled}/{cap} seats). Inquiry will be routed to the Priority Waitlist.
                      </p>
                    )
                  }
                  return null
                })()}
                {formErrors.gradeApplied && <p className="text-[10px] text-rose-600 mt-0.5">{formErrors.gradeApplied}</p>}
                {availableClasses.length === 0 && (
                  <p className="text-[10px] text-amber-700 mt-1 font-semibold flex items-center gap-1">
                    <span>No classes found.</span>
                    <a href="#inst-classes" className="underline text-blue-600 hover:text-blue-800 font-bold">
                      Add class in Classes &amp; Sections
                    </a>
                  </p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
              <div>
                <label className="block text-[10px] font-bold text-slate-700 uppercase mb-1">Date of Birth</label>
                <input
                  type="date"
                  value={formData.dob}
                  onChange={(e) => {
                    setFormData({ ...formData, dob: e.target.value })
                    setIsFormDirty(true)
                    if (formErrors.dob) setFormErrors({ ...formErrors, dob: null })
                  }}
                  className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 bg-white"
                />
                {formErrors.dob && <p className="text-[10px] text-rose-600 mt-0.5">{formErrors.dob}</p>}
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-700 uppercase mb-1">Gender</label>
                <select
                  value={formData.gender}
                  onChange={(e) => {
                    setFormData({ ...formData, gender: e.target.value })
                    setIsFormDirty(true)
                  }}
                  className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 bg-white font-medium"
                >
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-700 uppercase mb-1">B-Form / CNIC</label>
                <input
                  type="text"
                  placeholder="35201-XXXXXXX-X"
                  value={formData.bFormCnic}
                  onChange={(e) => {
                    setFormData({ ...formData, bFormCnic: e.target.value })
                    setIsFormDirty(true)
                  }}
                  className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 bg-white font-mono"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div>
                <label className="block text-[10px] font-bold text-slate-700 uppercase mb-1">Previous School / Institute</label>
                <input
                  type="text"
                  placeholder="e.g. Army Public School / Lahore Grammar"
                  value={formData.previousSchool}
                  onChange={(e) => {
                    setFormData({ ...formData, previousSchool: e.target.value })
                    setIsFormDirty(true)
                  }}
                  className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 bg-white"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-700 uppercase mb-1">Previous Class & Marks / CGPA</label>
                <input
                  type="text"
                  placeholder="e.g. 9th Grade (485 / 550 - 88%)"
                  value={formData.previousClassMarks}
                  onChange={(e) => {
                    setFormData({ ...formData, previousClassMarks: e.target.value })
                    setIsFormDirty(true)
                  }}
                  className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 bg-white"
                />
              </div>
            </div>

            {/* Level-Specific Academic Fields */}
            {currentLevelKey === 'college' && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-slate-200/60 text-xs">
                <div>
                  <label className="block text-[10px] font-bold text-slate-700 uppercase mb-1">College Intermediate Group *</label>
                  <select
                    value={formData.collegeGroup}
                    onChange={(e) => {
                      setFormData({ ...formData, collegeGroup: e.target.value })
                      setIsFormDirty(true)
                    }}
                    className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 bg-white font-bold"
                  >
                    <option value="Pre-Medical">FSc Pre-Medical</option>
                    <option value="Pre-Engineering">FSc Pre-Engineering</option>
                    <option value="ICS (Physics)">ICS (Computer Science & Physics)</option>
                    <option value="ICS (Stats)">ICS (Computer Science & Statistics)</option>
                    <option value="I.Com">I.Com (Commerce & Accounting)</option>
                    <option value="FA">FA (Humanities & Arts)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-700 uppercase mb-1">Matric Marks / Percentage</label>
                  <input
                    type="text"
                    placeholder="e.g. 1020 / 1100 (92.7%)"
                    value={formData.matricMarks}
                    onChange={(e) => {
                      setFormData({ ...formData, matricMarks: e.target.value })
                      setIsFormDirty(true)
                    }}
                    className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 bg-white"
                  />
                </div>
              </div>
            )}

            {currentLevelKey === 'university' && (
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 border-t border-slate-200/60 text-xs">
                <div>
                  <label className="block text-[10px] font-bold text-slate-700 uppercase mb-1">Program Preference *</label>
                  <select
                    value={formData.universityProgram}
                    onChange={(e) => {
                      setFormData({ ...formData, universityProgram: e.target.value })
                      setIsFormDirty(true)
                    }}
                    className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 bg-white font-bold"
                  >
                    <option value="BS Computer Science">BS Computer Science</option>
                    <option value="BS Software Engineering">BS Software Engineering</option>
                    <option value="BS Artificial Intelligence">BS Artificial Intelligence</option>
                    <option value="BBA Honors">BBA (Honors)</option>
                    <option value="BS Accounting & Finance">BS Accounting & Finance</option>
                    <option value="MS Computer Science">MS Computer Science</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-700 uppercase mb-1">NTS / NAT Merit Score</label>
                  <input
                    type="text"
                    placeholder="e.g. 78 / 100"
                    value={formData.universityNtsScore}
                    onChange={(e) => {
                      setFormData({ ...formData, universityNtsScore: e.target.value })
                      setIsFormDirty(true)
                    }}
                    className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 bg-white"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-700 uppercase mb-1">Prior Degree / Inter CGPA</label>
                  <input
                    type="text"
                    placeholder="e.g. 3.65 / 4.00 or 85%"
                    value={formData.previousClassMarks}
                    onChange={(e) => {
                      setFormData({ ...formData, previousClassMarks: e.target.value })
                      setIsFormDirty(true)
                    }}
                    className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 bg-white"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Section 2: Parent / Guardian Details */}
          <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl space-y-3">
            <span className="text-[11px] font-bold uppercase text-slate-500 tracking-wider block">
              2. Parent & Guardian Contact
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
              <div>
                <label className="block text-[10px] font-bold text-slate-700 uppercase mb-1">Parent / Guardian Full Name</label>
                <input
                  type="text"
                  placeholder="e.g. Tariq Mehmood"
                  value={formData.parentName}
                  onChange={(e) => {
                    setFormData({ ...formData, parentName: e.target.value })
                    setIsFormDirty(true)
                  }}
                  className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 bg-white"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-700 uppercase mb-1">Relationship</label>
                <select
                  value={formData.parentRelation}
                  onChange={(e) => {
                    setFormData({ ...formData, parentRelation: e.target.value })
                    setIsFormDirty(true)
                  }}
                  className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 bg-white font-medium"
                >
                  <option value="Father">Father</option>
                  <option value="Mother">Mother</option>
                  <option value="Uncle">Uncle</option>
                  <option value="Guardian">Guardian</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-700 uppercase mb-1">
                  Parent Calling Phone <span className="text-rose-500">*</span>
                </label>
                <input
                  type="tel"
                  required
                  placeholder="+92 3XX XXXXXXX"
                  value={formData.parentPhone}
                  onChange={(e) => {
                    const formatted = formatPhoneNumber(e.target.value)
                    setFormData({ 
                      ...formData, 
                      parentPhone: formatted,
                      parentWhatsapp: formData.sameAsPhone ? formatted : formData.parentWhatsapp
                    })
                    setIsFormDirty(true)
                    if (formErrors.parentPhone) setFormErrors({ ...formErrors, parentPhone: null })
                  }}
                  className={`w-full px-3 py-2 text-xs rounded-lg border bg-white focus:outline-none ${
                    formErrors.parentPhone ? 'border-rose-500 bg-rose-50' : 'border-slate-300'
                  }`}
                />
                {formErrors.parentPhone && <p className="text-[10px] text-rose-600 mt-0.5">{formErrors.parentPhone}</p>}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-[10px] font-bold text-slate-700 uppercase">WhatsApp Number</label>
                  <label className="flex items-center gap-1 text-[10px] text-slate-500 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.sameAsPhone}
                      onChange={(e) => {
                        const checked = e.target.checked
                        setFormData({
                          ...formData,
                          sameAsPhone: checked,
                          parentWhatsapp: checked ? formData.parentPhone : formData.parentWhatsapp
                        })
                      }}
                      className="rounded border-slate-300 text-teal-600 focus:ring-teal-500"
                    />
                    <span>Same as calling phone</span>
                  </label>
                </div>
                <input
                  type="tel"
                  disabled={formData.sameAsPhone}
                  placeholder="+92 3XX XXXXXXX"
                  value={formData.parentWhatsapp}
                  onChange={(e) => {
                    setFormData({ ...formData, parentWhatsapp: formatPhoneNumber(e.target.value) })
                    setIsFormDirty(true)
                  }}
                  className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 bg-white disabled:bg-slate-100"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-700 uppercase mb-1">Parent Email (Optional)</label>
                <input
                  type="email"
                  placeholder="parent@domain.com"
                  value={formData.parentEmail}
                  onChange={(e) => {
                    setFormData({ ...formData, parentEmail: e.target.value })
                    setIsFormDirty(true)
                  }}
                  className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 bg-white"
                />
              </div>
            </div>

            {/* Sibling Enrolled Checkbox */}
            <div className="pt-1 flex items-center gap-3">
              <label className="flex items-center gap-1.5 text-xs font-semibold text-slate-700 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.siblingEnrolled}
                  onChange={(e) => {
                    setFormData({ ...formData, siblingEnrolled: e.target.checked })
                    setIsFormDirty(true)
                  }}
                  className="rounded border-slate-300 text-teal-600 focus:ring-teal-500"
                />
                <span>Sibling already studying at this campus</span>
              </label>

              {formData.siblingEnrolled && (
                <input
                  type="text"
                  placeholder="Sibling Student Name & Roll No"
                  value={formData.siblingName}
                  onChange={(e) => setFormData({ ...formData, siblingName: e.target.value })}
                  className="flex-1 px-2.5 py-1 text-xs rounded border border-slate-300 bg-white"
                />
              )}
            </div>
          </div>

          {/* Section 3: CRM Routing & Entrance Test Scheduling */}
          <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl space-y-3">
            <span className="text-[11px] font-bold uppercase text-slate-500 tracking-wider block">
              3. CRM Routing, Priority & Entrance Test Slot
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 text-xs">
              <div>
                <label className="block text-[10px] font-bold text-slate-700 uppercase mb-1">Lead Source</label>
                <select
                  value={formData.source}
                  onChange={(e) => {
                    setFormData({ ...formData, source: e.target.value })
                    setIsFormDirty(true)
                  }}
                  className="w-full px-2.5 py-1.5 text-xs rounded-lg border border-slate-300 bg-white font-medium"
                >
                  {['Walk-in', 'Phone', 'WhatsApp', 'Facebook/Instagram', 'Website', 'Referral', 'Banner/Event'].map(src => (
                    <option key={src} value={src}>{src}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-700 uppercase mb-1">Priority</label>
                <select
                  value={formData.priority}
                  onChange={(e) => {
                    setFormData({ ...formData, priority: e.target.value })
                    setIsFormDirty(true)
                  }}
                  className="w-full px-2.5 py-1.5 text-xs rounded-lg border border-slate-300 bg-white font-bold"
                >
                  <option value="Hot">Hot Priority</option>
                  <option value="Warm">Warm Priority</option>
                  <option value="Cold">Cold Priority</option>
                </select>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-700 uppercase mb-1">Assigned Counselor</label>
                <select
                  value={formData.assignedCounselor}
                  onChange={(e) => {
                    setFormData({ ...formData, assignedCounselor: e.target.value })
                    setIsFormDirty(true)
                  }}
                  className="w-full px-2.5 py-1.5 text-xs rounded-lg border border-slate-300 bg-white font-medium"
                >
                  <option value="Admissions Counselor 1">Admissions Counselor 1</option>
                  <option value="Admissions Counselor 2">Admissions Counselor 2</option>
                  <option value="Admissions Desk">General Admissions Desk</option>
                </select>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-700 uppercase mb-1">Initial Stage</label>
                <input
                  type="text"
                  readOnly
                  value={formData.testDate ? "Test/Interview Scheduled" : (formData.stage || "Inquiry Received")}
                  className="w-full px-2.5 py-1.5 text-xs rounded-lg border border-slate-300 bg-slate-100 font-bold text-teal-900"
                />
              </div>
            </div>

            {/* Entrance Test Slot */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs pt-1">
              <div>
                <label className="block text-[10px] font-bold text-slate-700 uppercase mb-1">
                  Entrance Test Date (Optional)
                </label>
                <input
                  type="date"
                  value={formData.testDate}
                  onChange={(e) => {
                    setFormData({ ...formData, testDate: e.target.value })
                    setIsFormDirty(true)
                    if (formErrors.testDate) setFormErrors({ ...formErrors, testDate: null })
                  }}
                  className="w-full px-2.5 py-1.5 text-xs rounded-lg border border-slate-300 bg-white"
                />
                {formErrors.testDate && <p className="text-[10px] text-rose-600 mt-0.5">{formErrors.testDate}</p>}
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-700 uppercase mb-1">Test Time Slot</label>
                <input
                  type="text"
                  placeholder="e.g. 10:00 AM"
                  value={formData.testTime}
                  onChange={(e) => setFormData({ ...formData, testTime: e.target.value })}
                  className="w-full px-2.5 py-1.5 text-xs rounded-lg border border-slate-300 bg-white"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-700 uppercase mb-1">Test Venue / Hall</label>
                <input
                  type="text"
                  placeholder="e.g. Hall A / Computer Lab 1"
                  value={formData.testVenue}
                  onChange={(e) => setFormData({ ...formData, testVenue: e.target.value })}
                  className="w-full px-2.5 py-1.5 text-xs rounded-lg border border-slate-300 bg-white"
                />
              </div>
            </div>
          </div>

          {/* Form Actions Footer */}
          <div className="flex flex-wrap items-center justify-between gap-2 pt-3 border-t">
            <button
              type="button"
              onClick={() => {
                if (isFormDirty) setIsDiscardConfirmOpen(true)
                else setIsNewInquiryModalOpen(false)
              }}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg cursor-pointer"
            >
              Cancel
            </button>

            <div className="flex items-center gap-2">
              <button
                type="button"
                disabled={isSubmitting}
                onClick={() => handleSaveInquiry('addAnother')}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-lg text-xs cursor-pointer disabled:opacity-50"
              >
                Save & Add Another
              </button>

              <button
                type="submit"
                disabled={isSubmitting}
                className="px-5 py-2 bg-teal-600 hover:bg-teal-700 text-white font-bold rounded-lg text-xs shadow-sm flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
              >
                {isSubmitting && <RefreshCw className="w-3.5 h-3.5 animate-spin" />}
                <span>{editingInquiry ? 'Update Inquiry' : 'Save Admission Inquiry'}</span>
              </button>
            </div>
          </div>
        </form>
      </Modal>

      {/* DISCARD CHANGES CONFIRMATION MODAL */}
      {isDiscardConfirmOpen && (
        <Modal
          isOpen={isDiscardConfirmOpen}
          onClose={() => setIsDiscardConfirmOpen(false)}
          title="Discard Unsaved Changes?"
          maxWidth="max-w-md"
        >
          <div className="space-y-4">
            <p className="text-xs text-slate-600">
              You have unsaved information filled in this inquiry form. Leaving now will discard all changes.
            </p>
            <div className="flex justify-end gap-2 pt-2 border-t">
              <button
                type="button"
                onClick={() => setIsDiscardConfirmOpen(false)}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg cursor-pointer"
              >
                Keep Editing
              </button>
              <button
                type="button"
                onClick={() => {
                  setIsDiscardConfirmOpen(false)
                  setIsNewInquiryModalOpen(false)
                  setIsFormDirty(false)
                }}
                className="px-4 py-2 text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 rounded-lg cursor-pointer"
              >
                Discard & Close
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* REJECTION / LOST REASON MODAL */}
      {stageChangePrompt && (
        <Modal
          isOpen={Boolean(stageChangePrompt)}
          onClose={() => setStageChangePrompt(null)}
          title={`Specify Reason to Move to "${stageChangePrompt.targetStage}"`}
          maxWidth="max-w-md"
        >
          <div className="space-y-4 text-xs">
            <p className="text-slate-600">
              Please document the primary reason for moving <strong>{stageChangePrompt.lead.studentName}</strong> to <strong>{stageChangePrompt.targetStage}</strong>:
            </p>

            <div>
              <label className="block text-[10px] font-bold text-slate-700 uppercase mb-1">
                Reason Category <span className="text-rose-500">*</span>
              </label>
              <select
                value={stageReason}
                onChange={(e) => setStageReason(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-slate-300 font-bold bg-white"
              >
                <option value="Fee too high">Fee too high / Affordability</option>
                <option value="Distance / Transport issue">Distance / Transport route not available</option>
                <option value="Enrolled in another school">Enrolled in another competitor institution</option>
                <option value="Failed entrance criteria">Failed entrance test criteria</option>
                <option value="Parent unresponsive">Parent / Guardian unresponsive</option>
                <option value="Relocated / Shifted city">Relocated / Shifted to another city</option>
                <option value="Other">Other (Specify below)</option>
              </select>
            </div>

            <div>
              <label className="block text-[10px] font-bold text-slate-700 uppercase mb-1">
                Administrative Notes (Optional)
              </label>
              <textarea
                rows={2}
                value={stageNotes}
                onChange={(e) => setStageNotes(e.target.value)}
                placeholder="Detailed context or remarks for analytics..."
                className="w-full px-3 py-2 rounded-lg border border-slate-300 bg-white"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t">
              <button
                type="button"
                onClick={() => setStageChangePrompt(null)}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmStageReason}
                className="px-4 py-2 text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 rounded-lg cursor-pointer"
              >
                Confirm {stageChangePrompt.targetStage}
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* SINGLE ARCHIVE CONFIRMATION MODAL */}
      {leadToArchive && (
        <Modal
          isOpen={Boolean(leadToArchive)}
          onClose={() => setLeadToArchive(null)}
          title={`Archive Inquiry: ${leadToArchive.studentName}`}
          maxWidth="max-w-md"
        >
          <div className="space-y-4">
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl flex items-center gap-3">
              <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0" />
              <p className="text-xs text-rose-900">
                Are you sure you want to permanently archive the inquiry record for <strong>{leadToArchive.studentName}</strong>?
              </p>
            </div>
            <div className="flex justify-end gap-2 pt-2 border-t">
              <button
                type="button"
                onClick={() => setLeadToArchive(null)}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleArchiveLead}
                className="px-4 py-2 text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 rounded-lg cursor-pointer flex items-center gap-1"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Archive Inquiry</span>
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* BULK ACTIONS MODALS (Stage, Counselor, Archive) */}
      {isBulkStageOpen && (
        <Modal
          isOpen={isBulkStageOpen}
          onClose={() => setIsBulkStageOpen(false)}
          title={`Bulk Change Stage for ${selectedLeadIds.length} Inquiries`}
          maxWidth="max-w-md"
        >
          <div className="space-y-4 text-xs">
            <p className="text-slate-600">
              Apply new progression stage to all <strong>{selectedLeadIds.length}</strong> selected candidate leads:
            </p>
            <div>
              <label className="block text-[10px] font-bold text-slate-700 uppercase mb-1">Target Stage</label>
              <select
                value={bulkTargetStage}
                onChange={(e) => setBulkTargetStage(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-slate-300 font-bold bg-white"
              >
                {PRIMARY_STAGES.filter(s => s !== 'Enrolled').map(st => (
                  <option key={st} value={st}>{st}</option>
                ))}
              </select>
            </div>
            <div className="flex justify-end gap-2 pt-2 border-t">
              <button
                type="button"
                onClick={() => setIsBulkStageOpen(false)}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleBulkStageChange}
                className="px-4 py-2 text-xs font-bold text-white bg-teal-600 hover:bg-teal-700 rounded-lg cursor-pointer"
              >
                Apply Stage Change
              </button>
            </div>
          </div>
        </Modal>
      )}

      {isBulkCounselorOpen && (
        <Modal
          isOpen={isBulkCounselorOpen}
          onClose={() => setIsBulkCounselorOpen(false)}
          title={`Assign Counselor for ${selectedLeadIds.length} Inquiries`}
          maxWidth="max-w-md"
        >
          <div className="space-y-4 text-xs">
            <p className="text-slate-600">
              Assign counselor to all <strong>{selectedLeadIds.length}</strong> selected leads:
            </p>
            <div>
              <label className="block text-[10px] font-bold text-slate-700 uppercase mb-1">Counselor Name</label>
              <select
                value={bulkTargetCounselor}
                onChange={(e) => setBulkTargetCounselor(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-slate-300 font-bold bg-white"
              >
                <option value="Admissions Counselor 1">Admissions Counselor 1</option>
                <option value="Admissions Counselor 2">Admissions Counselor 2</option>
                <option value="Admissions Desk">General Admissions Desk</option>
              </select>
            </div>
            <div className="flex justify-end gap-2 pt-2 border-t">
              <button
                type="button"
                onClick={() => setIsBulkCounselorOpen(false)}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleBulkCounselorAssign}
                className="px-4 py-2 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg cursor-pointer"
              >
                Confirm Assignment
              </button>
            </div>
          </div>
        </Modal>
      )}

      {isBulkArchiveOpen && (
        <Modal
          isOpen={isBulkArchiveOpen}
          onClose={() => setIsBulkArchiveOpen(false)}
          title={`Confirm Bulk Archive of ${selectedLeadIds.length} Inquiries`}
          maxWidth="max-w-md"
        >
          <div className="space-y-4 text-xs">
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl flex items-center gap-3">
              <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0" />
              <p className="text-rose-900">
                Are you sure you want to permanently archive all <strong>{selectedLeadIds.length}</strong> selected candidate records?
              </p>
            </div>
            <div className="flex justify-end gap-2 pt-2 border-t">
              <button
                type="button"
                onClick={() => setIsBulkArchiveOpen(false)}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleBulkArchive}
                className="px-4 py-2 text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 rounded-lg cursor-pointer"
              >
                Archive {selectedLeadIds.length} Inquiries
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* ENTRANCE TEST & INTERVIEW SCORECARD MODAL */}
      {selectedLeadForScorecard && (
        <Modal
          isOpen={Boolean(selectedLeadForScorecard)}
          onClose={() => setSelectedLeadForScorecard(null)}
          title={`Entrance Test & Interview Scorecard: ${selectedLeadForScorecard.studentName}`}
          maxWidth="max-w-lg"
        >
          <form onSubmit={handleSaveScorecard} className="space-y-4 text-xs">
            <div className="p-3 bg-teal-50 border border-teal-200 rounded-xl space-y-1">
              <span className="font-bold text-teal-950 block">{selectedLeadForScorecard.studentName}</span>
              <span className="text-teal-700 block">
                Class Applied: {selectedLeadForScorecard.gradeApplied} • Parent: {selectedLeadForScorecard.parentName || 'Guardian'}
              </span>
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="block text-[10px] font-bold text-slate-600 uppercase mb-1">
                  Test Marks (Max 100)
                </label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  required
                  value={scorecardData.testMarks}
                  onChange={(e) => setScorecardData({ ...scorecardData, testMarks: e.target.value })}
                  className="w-full px-2.5 py-1.5 rounded-lg border border-slate-300 font-bold bg-white text-center"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-600 uppercase mb-1">
                  Interview (Max 100)
                </label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  required
                  value={scorecardData.interviewMarks}
                  onChange={(e) => setScorecardData({ ...scorecardData, interviewMarks: e.target.value })}
                  className="w-full px-2.5 py-1.5 rounded-lg border border-slate-300 font-bold bg-white text-center"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-600 uppercase mb-1">
                  Prior Academics %
                </label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  required
                  value={scorecardData.previousMarksPct}
                  onChange={(e) => setScorecardData({ ...scorecardData, previousMarksPct: e.target.value })}
                  className="w-full px-2.5 py-1.5 rounded-lg border border-slate-300 font-bold bg-white text-center"
                />
              </div>
            </div>

            <div>
              <label className="block text-[10px] font-bold text-slate-600 uppercase mb-1">Result Status</label>
              <select
                value={scorecardData.resultStatus}
                onChange={(e) => setScorecardData({ ...scorecardData, resultStatus: e.target.value })}
                className="w-full px-2.5 py-1.5 rounded-lg border border-slate-300 font-bold bg-white"
              >
                <option value="Pass">Pass (Recommended for Admission)</option>
                <option value="Fail">Fail (Below Cutoff)</option>
                <option value="Absent">Absent for Entrance Examination</option>
                <option value="Pending">Pending Evaluation</option>
              </select>
            </div>

            <div>
              <label className="block text-[10px] font-bold text-slate-600 uppercase mb-1">
                Interviewer Assessment Remarks
              </label>
              <textarea
                rows={2}
                value={scorecardData.remarks}
                onChange={(e) => setScorecardData({ ...scorecardData, remarks: e.target.value })}
                placeholder="Candidate aptitude, behavior, confidence, and faculty recommendations..."
                className="w-full px-3 py-2 rounded-lg border border-slate-300 bg-white"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t">
              <button
                type="button"
                onClick={() => setSelectedLeadForScorecard(null)}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2 text-xs font-bold text-white bg-teal-600 hover:bg-teal-700 rounded-lg shadow-sm cursor-pointer"
              >
                Record Evaluation Scorecard
              </button>
            </div>
          </form>
        </Modal>
      )}

      {/* MERIT LIST GAZETTE MODAL */}
      <MeritListGazetteModal
        isOpen={isMeritListOpen}
        onClose={() => setIsMeritListOpen(false)}
        leads={admissionsPipeline}
        currentInstitute={currentInstitute || institutes[0]}
        activeSession={selectedSession}
        availableClasses={availableClasses}
        onUpdateLead={updateItem ? (id, data) => updateItem('admissionsPipeline', id, data) : null}
        isAdmin={isAdmin}
      />

      {/* OFFICIAL ADMISSION OFFER LETTER MODAL */}
      <OfferLetterModal
        isOpen={Boolean(selectedLeadForOffer)}
        onClose={() => setSelectedLeadForOffer(null)}
        applicant={selectedLeadForOffer}
        currentInstitute={currentInstitute || institutes[0]}
        activeSession={selectedSession}
        onUpdateLead={updateItem ? (id, data) => updateItem('admissionsPipeline', id, data) : null}
        onProceedToEnroll={(lead) => setSelectedLeadForEnroll(lead)}
      />

      {/* CANDIDATE LEAD DETAILS DOSSIER DRAWER */}
      <LeadDetailsDrawer
        isOpen={Boolean(selectedLeadForDossier)}
        onClose={() => setSelectedLeadForDossier(null)}
        lead={selectedLeadForDossier}
        onUpdateLead={updateItem ? (id, data) => updateItem('admissionsPipeline', id, data) : null}
        onOpenScorecard={(l) => setSelectedLeadForScorecard(l)}
        onOpenOffer={(l) => setSelectedLeadForOffer(l)}
        onProceedToEnroll={(l) => setSelectedLeadForEnroll(l)}
      />

      {/* CONVERT TO STUDENT ENROLLMENT MODAL */}
      <ConvertStudentModal
        isOpen={Boolean(selectedLeadForEnroll)}
        onClose={() => setSelectedLeadForEnroll(null)}
        lead={selectedLeadForEnroll}
        currentInstitute={currentInstitute || institutes[0]}
        activeSession={selectedSession}
        classes={classes}
        students={students}
        onConfirmEnrollment={handleConfirmStudentEnrollment}
      />

      {/* QUICK MESSAGE TEMPLATES MODAL */}
      {selectedLeadForMessage && (
        <Modal
          isOpen={Boolean(selectedLeadForMessage)}
          onClose={() => setSelectedLeadForMessage(null)}
          title={`Send Message: ${selectedLeadForMessage.studentName}`}
          maxWidth="max-w-md"
        >
          <div className="space-y-3 text-xs">
            <p className="text-slate-600">
              Select an official communication template to share with <strong>{selectedLeadForMessage.parentName || 'Guardian'}</strong> ({selectedLeadForMessage.parentPhone}):
            </p>

            {[
              {
                title: 'Entrance Test Reminder',
                text: `Dear ${selectedLeadForMessage.parentName || 'Parent'}, entrance test for ${selectedLeadForMessage.studentName} for admission to ${selectedLeadForMessage.gradeApplied} is scheduled on ${formatDateDDMMYYYY(selectedLeadForMessage.testDate)} at ${selectedLeadForMessage.testTime || '10:00 AM'} in ${selectedLeadForMessage.testVenue || 'Campus Hall'}. Please bring original B-Form. Regards, Admissions Office.`
              },
              {
                title: 'Admission Offer Notice',
                text: `Congratulations! ${selectedLeadForMessage.studentName} has qualified the entrance merit evaluation and is offered admission to ${selectedLeadForMessage.gradeApplied}. Kindly visit the admissions desk before due date to submit fee voucher. Regards, Central Admissions.`
              },
              {
                title: 'General Follow-up Check-in',
                text: `Respected Guardian, following up on your admission inquiry for ${selectedLeadForMessage.studentName} for class ${selectedLeadForMessage.gradeApplied}. Please let us know if you need assistance regarding admission formalities. Regards, Admissions Team.`
              }
            ].map(tpl => (
              <div key={tpl.title} className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-1.5">
                <span className="font-bold text-slate-900 block">{tpl.title}</span>
                <p className="text-slate-600 text-[11px] leading-relaxed bg-white p-2 rounded border border-slate-100">
                  {tpl.text}
                </p>
                <div className="flex items-center justify-end gap-2 pt-1">
                  <button
                    type="button"
                    onClick={() => {
                      navigator.clipboard.writeText(tpl.text)
                      toast.success('Message text copied to clipboard.')
                    }}
                    className="px-2.5 py-1 bg-white border border-slate-300 text-slate-700 rounded font-semibold text-[11px] hover:bg-slate-50 cursor-pointer"
                  >
                    Copy Text
                  </button>
                  <a
                    href={`https://wa.me/${selectedLeadForMessage.parentPhone.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(tpl.text)}`}
                    target="_blank"
                    rel="noreferrer"
                    className="px-3 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded font-bold text-[11px] flex items-center gap-1 shadow-2xs"
                  >
                    <span>Send WhatsApp</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              </div>
            ))}

            <div className="flex justify-end pt-2 border-t">
              <button
                type="button"
                onClick={() => setSelectedLeadForMessage(null)}
                className="px-4 py-1.5 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* PUBLIC INQUIRY FORM SHARE & QR CODE MODAL */}
      {isPublicLinkModalOpen && (
        <Modal
          isOpen={isPublicLinkModalOpen}
          onClose={() => setIsPublicLinkModalOpen(false)}
          title="Public Online Admission Inquiry Portal"
          maxWidth="max-w-md"
        >
          <div className="space-y-4 text-xs text-center">
            <p className="text-slate-600 text-left">
              Share this public admissions inquiry link or scan the QR code to allow prospective students and parents to submit admission inquiries online:
            </p>

            {/* Vector QR Code */}
            <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl inline-block mx-auto shadow-2xs">
              <QrCodeSvg 
                value={`https://eims.edu.pk/admissions/inquiry?session=${selectedSession}&campus=${currentInstitute?.id || 'main'}`} 
                size={160} 
              />
              <span className="block text-[10px] text-slate-400 font-mono mt-2">Scan to Open Inquiry Form</span>
            </div>

            <div className="p-2.5 bg-slate-100 rounded-xl border border-slate-200 flex items-center justify-between text-left">
              <span className="font-mono text-[11px] text-slate-700 truncate mr-2">
                https://eims.edu.pk/admissions/inquiry?session={selectedSession}
              </span>
              <button
                type="button"
                onClick={() => {
                  navigator.clipboard.writeText(`https://eims.edu.pk/admissions/inquiry?session=${selectedSession}`)
                  toast.success('Public portal link copied.')
                }}
                className="px-3 py-1 bg-teal-600 hover:bg-teal-700 text-white rounded font-bold text-xs shrink-0 cursor-pointer shadow-2xs"
              >
                Copy Link
              </button>
            </div>

            <div className="flex justify-end pt-2 border-t">
              <button
                type="button"
                onClick={() => setIsPublicLinkModalOpen(false)}
                className="px-4 py-1.5 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* CSV IMPORT MODAL */}
      {isCsvImportOpen && (
        <Modal
          isOpen={isCsvImportOpen}
          onClose={() => setIsCsvImportOpen(false)}
          title="Import Prospective Inquiries via CSV"
          maxWidth="max-w-md"
        >
          <div className="space-y-4 text-xs">
            <p className="text-slate-600 leading-relaxed">
              Upload a comma-separated (.csv) file containing candidate inquiries. Columns must follow the standard inquiry format.
            </p>

            <div className="flex items-center justify-between p-3 bg-slate-50 border border-slate-200 rounded-xl">
              <div>
                <span className="font-bold text-slate-800 block">Download Template</span>
                <span className="text-[10px] text-slate-400">Pre-formatted columns with examples</span>
              </div>
              <button
                type="button"
                onClick={downloadSampleTemplate}
                className="px-3 py-1.5 bg-white border border-slate-300 text-slate-700 font-bold rounded-lg text-xs hover:bg-slate-100 cursor-pointer flex items-center gap-1 shadow-2xs"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Download .CSV</span>
              </button>
            </div>

            <div className="p-6 border-2 border-dashed border-teal-500/40 rounded-2xl bg-teal-50/20 text-center">
              <input
                type="file"
                ref={csvInputRef}
                onChange={handleCsvFileUpload}
                accept=".csv"
                className="hidden"
              />
              <FileSpreadsheet className="w-8 h-8 text-teal-600 mx-auto mb-2" />
              <button
                type="button"
                onClick={() => csvInputRef.current?.click()}
                className="px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-lg font-bold text-xs shadow-2xs cursor-pointer"
              >
                Choose CSV File
              </button>
              <span className="block text-[10px] text-slate-400 mt-2">Supports .CSV up to 2MB</span>
            </div>

            <div className="flex justify-end pt-2 border-t">
              <button
                type="button"
                onClick={() => setIsCsvImportOpen(false)}
                className="px-4 py-1.5 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg cursor-pointer"
              >
                Cancel
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* CSV IMPORT ERROR REPORT MODAL */}
      {csvErrorModal && (
        <Modal
          isOpen={Boolean(csvErrorModal)}
          onClose={() => setCsvErrorModal(null)}
          title="CSV Import Validation Report"
          maxWidth="max-w-lg"
        >
          <div className="space-y-3 text-xs">
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-900">
              <span className="font-bold block">Validation Errors Encountered</span>
              <span>
                {csvErrorModal.validCount} rows imported successfully. {csvErrorModal.errors.length} rows failed validation and were skipped:
              </span>
            </div>

            <div className="max-h-56 overflow-y-auto space-y-1.5 border border-slate-200 rounded-xl p-2.5">
              {csvErrorModal.errors.map((err, idx) => (
                <div key={idx} className="p-2 bg-slate-50 rounded text-[11px] flex items-center justify-between">
                  <span className="font-bold font-mono text-slate-700">Row {err.row}:</span>
                  <span className="text-rose-600 font-semibold">{err.error}</span>
                </div>
              ))}
            </div>

            <div className="flex justify-end pt-2 border-t">
              <button
                type="button"
                onClick={() => setCsvErrorModal(null)}
                className="px-4 py-1.5 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg cursor-pointer"
              >
                Close Report
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  )
}

export default AdmissionsPipelineView
