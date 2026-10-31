import React, { useState, useEffect, useMemo } from 'react'
import { 
  FileSpreadsheet, 
  FileText, 
  BarChart3, 
  Lock, 
  Unlock, 
  CheckSquare, 
  RefreshCw, 
  FileBadge, 
  Search, 
  CheckCircle2, 
  Clock, 
  Download, 
  Award, 
  Check, 
  X, 
  Eye, 
  Printer,
  Sparkles,
  Plus,
  AlertTriangle,
  RotateCcw,
  ShieldCheck,
  QrCode,
  UserCheck,
  Sliders,
  Filter,
  CheckCircle,
  Trash2,
  Send,
  History,
  Layers,
  ChevronRight,
  Maximize2,
  ZoomIn,
  Building,
  School,
  Share2
} from 'lucide-react'
import { useAppData } from '../../../context/AppDataContext'
import { useToast } from '../../../context/ToastContext'
import { 
  DEFAULT_PERCENTAGE_BANDS, 
  DEFAULT_GPA_BANDS, 
  DEFAULT_CAMBRIDGE_BANDS,
  STORAGE_KEYS as EXAM_STORAGE_KEYS,
  calculateGrade 
} from '../../institute-admin/exams/examService'

// Storage Keys for Platform Exam Governance
const STORAGE_KEYS = {
  POLICIES: 'edu_sms_platform_exam_policies',
  FREEZE: 'edu_sms_exams_freeze_statuses',
  FREEZE_LOGS: 'edu_sms_exams_freeze_history_logs',
  GRADE_APPROVALS: 'edu_sms_exams_grade_approvals',
  SUPPLEMENTARY: 'edu_sms_exams_supplementary_registry',
  TRANSCRIPTS: 'edu_sms_exams_transcript_settings'
}

export const SuperadminExaminationsResultsView = ({ activeTab = 'policies', onTabChange = () => {} }) => {
  const { exams = [], institutes = [], students = [], logAuditEvent, sendCommunicationBlast } = useAppData()
  const { toast } = useToast()

  // 1. Navigation State Sync (Fixed desync bug)
  const [currentTab, setCurrentTab] = useState(activeTab || 'policies')

  useEffect(() => {
    if (activeTab && activeTab !== currentTab) {
      setCurrentTab(activeTab)
    }
  }, [activeTab])

  const handleTabSwitch = (tabKey) => {
    setCurrentTab(tabKey)
    onTabChange(tabKey)
  }

  // Multi-campus options
  const campusOptions = useMemo(() => {
    const list = institutes.map(i => i.name || i.instituteName).filter(Boolean)
    if (list.length === 0) {
      return ['Beaconhouse Central High', 'City School Senior Branch', 'Lahore Grammar Model Town', 'Army Public School & College']
    }
    return Array.from(new Set(list))
  }, [institutes])

  // =========================================================================
  // SUB-TAB 1: EXAM POLICIES & DATESHEET RULES STATE
  // =========================================================================
  const defaultPolicies = {
    activeScale: 'percentage', // 'percentage' | 'gpa4' | 'cambridge'
    minAttendancePct: 75,
    paperSecrecyHours: 48,
    datesheetUniformCore: true,
    allowSuperadminWaiver: true,
    bands: DEFAULT_PERCENTAGE_BANDS
  }

  const [policies, setPolicies] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.POLICIES)
      return saved ? JSON.parse(saved) : defaultPolicies
    } catch {
      return defaultPolicies
    }
  })

  const [editingBandIndex, setEditingBandIndex] = useState(null)
  const [bandFormData, setBandFormData] = useState({ grade: '', min: 0, max: 100, gpa: 4.0, description: '' })
  const [showAddBandModal, setShowAddBandModal] = useState(false)

  const handleScaleChange = (scaleType) => {
    let newBands = DEFAULT_PERCENTAGE_BANDS
    if (scaleType === 'gpa4') newBands = DEFAULT_GPA_BANDS
    if (scaleType === 'cambridge') newBands = DEFAULT_CAMBRIDGE_BANDS

    const updated = { ...policies, activeScale: scaleType, bands: newBands }
    setPolicies(updated)
    localStorage.setItem(STORAGE_KEYS.POLICIES, JSON.stringify(updated))
    toast?.success?.(`Grading framework switched to ${scaleType.toUpperCase()} schema.`)
  }

  const handleSavePolicySettings = (newSettings) => {
    const updated = { ...policies, ...newSettings }
    setPolicies(updated)
    localStorage.setItem(STORAGE_KEYS.POLICIES, JSON.stringify(updated))
    toast?.success?.('Central examination directives and attendance policy saved.')
  }

  const handleResetBandsToDefault = () => {
    handleScaleChange(policies.activeScale)
    toast?.info?.('Grading scale thresholds restored to system enterprise defaults.')
  }

  const handleDeleteBand = (indexToDelete) => {
    if (policies.bands.length <= 2) {
      toast?.error?.('Grading schema must maintain at least two boundary tiers.')
      return
    }
    const updatedBands = policies.bands.filter((_, idx) => idx !== indexToDelete)
    const updated = { ...policies, bands: updatedBands }
    setPolicies(updated)
    localStorage.setItem(STORAGE_KEYS.POLICIES, JSON.stringify(updated))
    toast?.success?.('Grade boundary tier deleted.')
  }

  const handleSaveCustomBand = () => {
    if (!bandFormData.grade.trim()) {
      toast?.error?.('Grade label is required (e.g. A*, A+, B).')
      return
    }

    const min = Number(bandFormData.min)
    const max = Number(bandFormData.max)

    if (isNaN(min) || isNaN(max) || min < 0 || max > 100) {
      toast?.error?.('Percentage thresholds must be numerical values between 0% and 100%.')
      return
    }

    if (min >= max) {
      toast?.error?.('Minimum percentage threshold must be strictly less than Maximum percentage.')
      return
    }

    const updatedBands = [...policies.bands]
    if (editingBandIndex !== null) {
      updatedBands[editingBandIndex] = { ...bandFormData, min, max, gpa: Number(bandFormData.gpa) || 0 }
    } else {
      updatedBands.unshift({ ...bandFormData, min, max, gpa: Number(bandFormData.gpa) || 0 })
    }

    updatedBands.sort((a, b) => b.min - a.min)

    const updated = { ...policies, bands: updatedBands }
    setPolicies(updated)
    localStorage.setItem(STORAGE_KEYS.POLICIES, JSON.stringify(updated))
    setEditingBandIndex(null)
    setShowAddBandModal(false)
    toast?.success?.('Grading threshold boundaries updated with validation.')
  }

  const handleBroadcastDirectives = () => {
    try {
      logAuditEvent?.(
        'EXAM_DIRECTIVES_BROADCAST', 
        `Central directives broadcasted to all campuses: Min Attendance ${policies.minAttendancePct}%, Secrecy Seal ${policies.paperSecrecyHours}h.`
      )
      sendCommunicationBlast?.({
        recipientType: 'campuses',
        title: 'Urgent: Central Platform Examination Directives Issued',
        message: `Platform Superadmin has broadcasted standardized grading (${policies.activeScale.toUpperCase()}) and mandatory attendance threshold (${policies.minAttendancePct}%).`
      })
    } catch {
      // safe fallback
    }
    toast?.success?.('Examination Directives & Attendance policy broadcasted to all campus principals.')
  }

  // =========================================================================
  // SUB-TAB 2: RESULTS OVERVIEW (WING-WISE)
  // =========================================================================
  const [selectedWingCampus, setSelectedWingCampus] = useState('all')
  const [selectedWingTerm, setSelectedWingTerm] = useState('all')
  const [selectedClassDrilldown, setSelectedClassDrilldown] = useState(null)

  // Dynamic wing metrics calculation adjusted by campus
  const dynamicWingMetrics = useMemo(() => {
    const campusMultiplier = selectedWingCampus === 'all' ? 1.0 :
      selectedWingCampus.includes('Beaconhouse') ? 1.05 :
      selectedWingCampus.includes('City') ? 0.98 :
      selectedWingCampus.includes('Lahore Grammar') ? 1.02 : 0.95

    return [
      { 
        wing: 'Elementary & Primary Wing', 
        totalExaminees: Math.round(selectedWingCampus === 'all' ? 450 : 120 * campusMultiplier), 
        passPercentage: Math.min(100, Math.round(98.2 * campusMultiplier * 10) / 10), 
        topGpa: '4.00 (A+)', 
        distinctions: Math.round(selectedWingCampus === 'all' ? 184 : 48 * campusMultiplier), 
        status: 'Outstanding',
        classes: [
          { name: 'Class 5-A', students: 32, passRate: 100, topScore: 98 },
          { name: 'Class 5-B', students: 30, passRate: 96.6, topScore: 95 },
          { name: 'Class 4-A', students: 28, passRate: 98.2, topScore: 99 }
        ],
        subjects: [
          { name: 'English Literacy', passRate: 99.1, avgScore: 84 },
          { name: 'Mathematics Fundamentals', passRate: 97.4, avgScore: 79 },
          { name: 'General Science Explorers', passRate: 98.6, avgScore: 82 }
        ]
      },
      { 
        wing: 'Middle School Wing', 
        totalExaminees: Math.round(selectedWingCampus === 'all' ? 380 : 105 * campusMultiplier), 
        passPercentage: Math.min(100, Math.round(94.7 * campusMultiplier * 10) / 10), 
        topGpa: '3.95 (A+)', 
        distinctions: Math.round(selectedWingCampus === 'all' ? 122 : 34 * campusMultiplier), 
        status: 'High',
        classes: [
          { name: 'Class 8-A', students: 35, passRate: 94.2, topScore: 96 },
          { name: 'Class 8-B', students: 34, passRate: 91.1, topScore: 93 },
          { name: 'Class 7-A', students: 36, passRate: 97.2, topScore: 97 }
        ],
        subjects: [
          { name: 'Mathematics (Algebra & Geom)', passRate: 91.5, avgScore: 72 },
          { name: 'General Science', passRate: 95.2, avgScore: 78 },
          { name: 'English Grammar & Comp', passRate: 96.8, avgScore: 81 },
          { name: 'Urdu Literature', passRate: 97.0, avgScore: 80 }
        ]
      },
      { 
        wing: 'Secondary / High School Wing', 
        totalExaminees: Math.round(selectedWingCampus === 'all' ? 320 : 90 * campusMultiplier), 
        passPercentage: Math.min(100, Math.round(91.8 * campusMultiplier * 10) / 10), 
        topGpa: '3.92 (A+)', 
        distinctions: Math.round(selectedWingCampus === 'all' ? 94 : 26 * campusMultiplier), 
        status: 'Standard',
        classes: [
          { name: 'Class 10-A (Science)', students: 30, passRate: 93.3, topScore: 96 },
          { name: 'Class 10-B (Computer)', students: 30, passRate: 90.0, topScore: 94 },
          { name: 'Class 9-A', students: 30, passRate: 92.1, topScore: 95 }
        ],
        subjects: [
          { name: 'Advanced Mathematics', passRate: 87.5, avgScore: 68 },
          { name: 'Physics Theory & Lab', passRate: 90.2, avgScore: 71 },
          { name: 'Chemistry', passRate: 92.4, avgScore: 74 },
          { name: 'Computer Science', passRate: 95.6, avgScore: 83 }
        ]
      },
      { 
        wing: 'College & Higher Secondary Wing', 
        totalExaminees: Math.round(selectedWingCampus === 'all' ? 240 : 65 * campusMultiplier), 
        passPercentage: Math.min(100, Math.round(89.5 * campusMultiplier * 10) / 10), 
        topGpa: '3.88 (A+)', 
        distinctions: Math.round(selectedWingCampus === 'all' ? 62 : 18 * campusMultiplier), 
        status: 'Moderate',
        classes: [
          { name: 'FSc Pre-Medical 2nd Year', students: 25, passRate: 92.0, topScore: 95 },
          { name: 'FSc Pre-Engineering 2nd Year', students: 22, passRate: 86.4, topScore: 93 },
          { name: 'ICS Computer Studies', students: 18, passRate: 90.1, topScore: 94 }
        ],
        subjects: [
          { name: 'Calculus & Analytical Geometry', passRate: 84.1, avgScore: 64 },
          { name: 'Physics Mechanics & Electro', passRate: 88.3, avgScore: 69 },
          { name: 'Organic Chemistry', passRate: 89.0, avgScore: 70 },
          { name: 'Biology & Zoology', passRate: 93.5, avgScore: 77 }
        ]
      }
    ]
  }, [selectedWingCampus])

  // =========================================================================
  // SUB-TAB 3: RESULT PUBLISH / FREEZE
  // =========================================================================
  const defaultFreezeStatuses = [
    { id: 'FRZ-01', campus: 'Beaconhouse Central High', wing: 'High School Wing', examTerm: 'Midterm Examination 2026', isFrozen: true, published: true, approvedBy: 'Super Administrator', frozenAt: '2026-10-15 09:30 AM' },
    { id: 'FRZ-02', campus: 'Beaconhouse Central High', wing: 'Middle Wing', examTerm: 'Midterm Examination 2026', isFrozen: false, published: false, approvedBy: 'Pending Lock', frozenAt: null },
    { id: 'FRZ-03', campus: 'City School Senior Branch', wing: 'College Wing', examTerm: 'Pre-Board Terminal Exams', isFrozen: true, published: true, approvedBy: 'Super Administrator', frozenAt: '2026-10-18 11:15 AM' },
    { id: 'FRZ-04', campus: 'Lahore Grammar Model Town', wing: 'Primary Wing', examTerm: 'First Term Assessment', isFrozen: false, published: false, approvedBy: 'Under Audit', frozenAt: null },
    { id: 'FRZ-05', campus: 'Army Public School & College', wing: 'Senior Wing', examTerm: 'Annual Mock 2026', isFrozen: true, published: true, approvedBy: 'Super Administrator', frozenAt: '2026-10-20 02:40 PM' }
  ]

  const [freezeStatuses, setFreezeStatuses] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.FREEZE)
      return saved ? JSON.parse(saved) : defaultFreezeStatuses
    } catch {
      return defaultFreezeStatuses
    }
  })

  // Lock history logs
  const [freezeLogs, setFreezeLogs] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.FREEZE_LOGS)
      return saved ? JSON.parse(saved) : [
        { id: 'LOG-01', campus: 'Beaconhouse Central High', wing: 'High School Wing', action: 'LOCKED', author: 'Superadmin', timestamp: '2026-10-15 09:30 AM', note: 'Regular post-exam freeze lockout.' },
        { id: 'LOG-02', campus: 'City School Senior Branch', wing: 'College Wing', action: 'LOCKED', author: 'Superadmin', timestamp: '2026-10-18 11:15 AM', note: 'Pre-board results locked.' }
      ]
    } catch {
      return []
    }
  })

  const [showFreezeHistoryModal, setShowFreezeHistoryModal] = useState(false)
  const [freezeModalTarget, setFreezeModalTarget] = useState(null)
  const [freezeReason, setFreezeReason] = useState('')
  const [freezeFilterCampus, setFreezeFilterCampus] = useState('all')
  const [freezeFilterStatus, setFreezeFilterStatus] = useState('all')

  // New Lockout Session Modal
  const [showAddLockoutModal, setShowAddLockoutModal] = useState(false)
  const [newLockoutForm, setNewLockoutForm] = useState({
    campus: 'Beaconhouse Central High',
    wing: 'High School Wing',
    examTerm: 'Annual Examination 2026',
    isFrozen: true,
    published: false
  })

  const handleToggleFreezeConfirm = () => {
    if (!freezeModalTarget) return
    const targetId = freezeModalTarget.id
    const willBeFrozen = !freezeModalTarget.isFrozen

    const updated = freezeStatuses.map(f => {
      if (f.id === targetId) {
        return {
          ...f,
          isFrozen: willBeFrozen,
          approvedBy: willBeFrozen ? 'Super Administrator' : 'Unlocked by Superadmin',
          frozenAt: willBeFrozen ? new Date().toLocaleString() : null,
          unlockReason: willBeFrozen ? undefined : freezeReason
        }
      }
      return f
    })

    setFreezeStatuses(updated)
    localStorage.setItem(STORAGE_KEYS.FREEZE, JSON.stringify(updated))

    // Record in history log
    const newLog = {
      id: `LOG-0${freezeLogs.length + 1}`,
      campus: freezeModalTarget.campus,
      wing: freezeModalTarget.wing,
      action: willBeFrozen ? 'LOCKED' : 'UNLOCKED',
      author: 'Super Administrator',
      timestamp: new Date().toLocaleString(),
      note: freezeReason || (willBeFrozen ? 'Exam term closed & locked.' : 'Temporary unlock for clerical audit.')
    }
    const updatedLogs = [newLog, ...freezeLogs]
    setFreezeLogs(updatedLogs)
    localStorage.setItem(STORAGE_KEYS.FREEZE_LOGS, JSON.stringify(updatedLogs))

    try {
      logAuditEvent?.(
        willBeFrozen ? 'RESULT_FROZEN' : 'RESULT_UNFROZEN',
        `Exam results for ${freezeModalTarget.campus} (${freezeModalTarget.wing}) ${willBeFrozen ? 'LOCKED' : 'UNFROZEN'}. Reason: ${freezeReason || 'Operational routine'}`
      )
    } catch {
      // safe fallback
    }

    toast?.success?.(`${freezeModalTarget.campus} (${freezeModalTarget.wing}) results ${willBeFrozen ? 'FROZEN & LOCKED' : 'UNFROZEN for modifications'}.`)
    setFreezeModalTarget(null)
    setFreezeReason('')
  }

  // Bulk actions for Result Freeze
  const handleBulkFreezeAll = (targetFrozen) => {
    const updated = freezeStatuses.map(f => ({
      ...f,
      isFrozen: targetFrozen,
      approvedBy: targetFrozen ? 'Super Administrator (Bulk Lock)' : 'Unlocked by Superadmin (Bulk)',
      frozenAt: targetFrozen ? new Date().toLocaleString() : null
    }))
    setFreezeStatuses(updated)
    localStorage.setItem(STORAGE_KEYS.FREEZE, JSON.stringify(updated))
    toast?.success?.(`All network campus examination results ${targetFrozen ? 'FROZEN & LOCKED' : 'UNLOCKED for corrections'}.`)
  }

  const handleBulkPublishAll = (targetPublish) => {
    const updated = freezeStatuses.map(f => ({
      ...f,
      published: targetPublish
    }))
    setFreezeStatuses(updated)
    localStorage.setItem(STORAGE_KEYS.FREEZE, JSON.stringify(updated))
    toast?.success?.(`All network campus examination results ${targetPublish ? 'PUBLISHED LIVE to Student & Parent Portals' : 'SET TO DRAFT ONLY'}.`)
  }

  const handleTogglePortalPublish = (id) => {
    const updated = freezeStatuses.map(f => {
      if (f.id === id) {
        const nextPublished = !f.published
        toast?.info?.(`${f.campus} results are now ${nextPublished ? 'LIVE on Parent & Student App' : 'DRAFT ONLY (Hidden from Parent Portal)'}.`)
        return { ...f, published: nextPublished }
      }
      return f
    })
    setFreezeStatuses(updated)
    localStorage.setItem(STORAGE_KEYS.FREEZE, JSON.stringify(updated))
  }

  const handleAddLockoutSession = () => {
    if (!newLockoutForm.examTerm) {
      toast?.error?.('Exam term name is required.')
      return
    }
    const newEntry = {
      id: `FRZ-0${freezeStatuses.length + 1}`,
      campus: newLockoutForm.campus,
      wing: newLockoutForm.wing,
      examTerm: newLockoutForm.examTerm,
      isFrozen: newLockoutForm.isFrozen,
      published: newLockoutForm.published,
      approvedBy: newLockoutForm.isFrozen ? 'Super Administrator' : 'Pending Lock',
      frozenAt: newLockoutForm.isFrozen ? new Date().toLocaleString() : null
    }

    const updated = [newEntry, ...freezeStatuses]
    setFreezeStatuses(updated)
    localStorage.setItem(STORAGE_KEYS.FREEZE, JSON.stringify(updated))
    setShowAddLockoutModal(false)
    toast?.success?.(`New Exam Term Lockout registered for ${newEntry.campus}.`)
  }

  const filteredFreezeStatuses = useMemo(() => {
    return freezeStatuses.filter(f => {
      const matchCampus = freezeFilterCampus === 'all' || f.campus === freezeFilterCampus
      const matchStatus = freezeFilterStatus === 'all' 
        || (freezeFilterStatus === 'frozen' && f.isFrozen)
        || (freezeFilterStatus === 'unfrozen' && !f.isFrozen)
      return matchCampus && matchStatus
    })
  }, [freezeStatuses, freezeFilterCampus, freezeFilterStatus])

  // =========================================================================
  // SUB-TAB 4: GRADE CHANGE & RE-CHECKING APPROVALS
  // =========================================================================
  const defaultGradeApprovals = [
    { 
      id: 'GRD-101', 
      student: 'Mustafa Kamal', 
      roll: 'BHS-042', 
      subject: 'Mathematics (Advanced)', 
      campus: 'Beaconhouse Central High', 
      wing: 'High School Wing',
      originalMarks: 64, 
      requestedMarks: 72, 
      reason: 'Re-totaling error in Section B Q4: examiner missed 8-mark question in counting.', 
      status: 'Pending Approval',
      requestedBy: 'Mr. Tariq (HoD Math)',
      requestedAt: '2026-10-28',
      paperCode: 'MATH-HSC-2026',
      evidence: 'Scanned script shows page 5 totaling was 14 instead of 22 recorded on header sheet.'
    },
    { 
      id: 'GRD-102', 
      student: 'Sarah Tariq', 
      roll: 'TCS-112', 
      subject: 'Physics Practical', 
      campus: 'City School Senior Branch', 
      wing: 'College Wing',
      originalMarks: 18, 
      requestedMarks: 22, 
      reason: 'Lab attendance marks reconciled from internal laboratory register.', 
      status: 'Approved',
      requestedBy: 'Dr. Munir (Physics Lab Sup)',
      requestedAt: '2026-10-26',
      paperCode: 'PHY-LAB-01',
      evidence: 'Signed viva attendance sheet submitted by external invigilator.'
    },
    { 
      id: 'GRD-103', 
      student: 'Zainab Fatima', 
      roll: 'LGS-088', 
      subject: 'English Literature', 
      campus: 'Lahore Grammar Model Town', 
      wing: 'Middle Wing',
      originalMarks: 58, 
      requestedMarks: 65, 
      reason: 'Essay Section rubric miscalculation: 7 marks deducted due to clerical entry code error.', 
      status: 'Pending Approval',
      requestedBy: 'Ms. Ayesha (English Coord)',
      requestedAt: '2026-10-30',
      paperCode: 'ENG-MID-8',
      evidence: 'Checked manuscript with signature of department head.'
    }
  ]

  const [gradeApprovals, setGradeApprovals] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.GRADE_APPROVALS)
      return saved ? JSON.parse(saved) : defaultGradeApprovals
    } catch {
      return defaultGradeApprovals
    }
  })

  const [selectedGradeItem, setSelectedGradeItem] = useState(null)
  const [showEvidenceModal, setShowEvidenceModal] = useState(false)
  const [showApprovalRemarksModal, setShowApprovalRemarksModal] = useState(false)
  const [showRejectionModal, setShowRejectionModal] = useState(false)
  const [superadminRemarks, setSuperadminRemarks] = useState('')
  const [gradeSearchQuery, setGradeSearchQuery] = useState('')
  const [gradeStatusFilter, setGradeStatusFilter] = useState('all')
  const [selectedApprovalIds, setSelectedApprovalIds] = useState([])

  // Helper to synchronize write-back to marksheets
  const syncGradeToMarksheetStore = (approval) => {
    try {
      const raw = localStorage.getItem(EXAM_STORAGE_KEYS.MARKSHEETS)
      if (raw) {
        const marksheets = JSON.parse(raw)
        let changed = false
        const updated = marksheets.map(m => {
          if (m.studentName === approval.student || m.rollNumber === approval.roll) {
            if (Array.isArray(m.subjects)) {
              m.subjects = m.subjects.map(s => {
                if (s.name.toLowerCase().includes(approval.subject.toLowerCase()) || approval.subject.toLowerCase().includes(s.name.toLowerCase())) {
                  changed = true
                  return { ...s, obtained: approval.requestedMarks, theoryMarks: approval.requestedMarks }
                }
                return s
              })
            }
          }
          return m
        })
        if (changed) {
          localStorage.setItem(EXAM_STORAGE_KEYS.MARKSHEETS, JSON.stringify(updated))
        }
      }
    } catch (e) {
      console.warn('Marksheet writeback sync notice:', e)
    }
  }

  const handleApproveGradeAction = () => {
    if (!selectedGradeItem) return
    const updated = gradeApprovals.map(g => {
      if (g.id === selectedGradeItem.id) {
        syncGradeToMarksheetStore(selectedGradeItem)
        return { 
          ...g, 
          status: 'Approved', 
          superadminRemarks: superadminRemarks || 'Verified against script audit proof.',
          approvedAt: new Date().toLocaleString()
        }
      }
      return g
    })
    setGradeApprovals(updated)
    localStorage.setItem(STORAGE_KEYS.GRADE_APPROVALS, JSON.stringify(updated))

    try {
      logAuditEvent?.('GRADE_CHANGE_APPROVED', `Grade change request ${selectedGradeItem.id} for ${selectedGradeItem.student} approved (${selectedGradeItem.originalMarks} ➔ ${selectedGradeItem.requestedMarks}).`)
    } catch {
      // safe fallback
    }

    toast?.success?.(`Grade change request ${selectedGradeItem.id} authorized. Marks updated in master gazette & marksheets.`)
    setShowApprovalRemarksModal(false)
    setSelectedGradeItem(null)
    setSuperadminRemarks('')
  }

  const handleBatchApprove = () => {
    if (selectedApprovalIds.length === 0) return
    const updated = gradeApprovals.map(g => {
      if (selectedApprovalIds.includes(g.id) && g.status === 'Pending Approval') {
        syncGradeToMarksheetStore(g)
        return {
          ...g,
          status: 'Approved',
          superadminRemarks: 'Batch authorized by Superadmin.',
          approvedAt: new Date().toLocaleString()
        }
      }
      return g
    })
    setGradeApprovals(updated)
    localStorage.setItem(STORAGE_KEYS.GRADE_APPROVALS, JSON.stringify(updated))
    toast?.success?.(`${selectedApprovalIds.length} grade requests batch approved and synchronized to marksheets.`)
    setSelectedApprovalIds([])
  }

  const handleRejectGradeAction = () => {
    if (!selectedGradeItem) return
    if (!superadminRemarks.trim()) {
      toast?.error?.('Rejection requires mandatory Superadmin remarks.')
      return
    }
    const updated = gradeApprovals.map(g => {
      if (g.id === selectedGradeItem.id) {
        return { 
          ...g, 
          status: 'Rejected', 
          superadminRemarks: superadminRemarks,
          rejectedAt: new Date().toLocaleString()
        }
      }
      return g
    })
    setGradeApprovals(updated)
    localStorage.setItem(STORAGE_KEYS.GRADE_APPROVALS, JSON.stringify(updated))

    try {
      logAuditEvent?.('GRADE_CHANGE_REJECTED', `Grade change request ${selectedGradeItem.id} for ${selectedGradeItem.student} rejected. Reason: ${superadminRemarks}`)
    } catch {
      // safe fallback
    }

    toast?.info?.(`Grade change request ${selectedGradeItem.id} declined. Reason recorded.`)
    setShowRejectionModal(false)
    setSelectedGradeItem(null)
    setSuperadminRemarks('')
  }

  const filteredGradeApprovals = useMemo(() => {
    return gradeApprovals.filter(g => {
      const matchSearch = !gradeSearchQuery 
        || g.student.toLowerCase().includes(gradeSearchQuery.toLowerCase())
        || g.roll.toLowerCase().includes(gradeSearchQuery.toLowerCase())
        || g.subject.toLowerCase().includes(gradeSearchQuery.toLowerCase())
      const matchStatus = gradeStatusFilter === 'all' || g.status === gradeStatusFilter
      return matchSearch && matchStatus
    })
  }, [gradeApprovals, gradeSearchQuery, gradeStatusFilter])

  // =========================================================================
  // SUB-TAB 5: SUPPLEMENTARY EXAMS
  // =========================================================================
  const defaultSupplementaryRegistry = [
    { 
      id: 'SUP-01', 
      student: 'Hamza Bilal', 
      roll: 'BHS-091', 
      campus: 'Beaconhouse Central High', 
      wing: 'High School Wing', 
      failedSubjects: ['Chemistry', 'Mathematics'], 
      examDate: '2026-11-20', 
      feeStatus: 'Paid', 
      feeAmount: 'PKR 3,000', 
      admitCardIssued: true, 
      status: 'Registered',
      center: 'Beaconhouse Central Exam Hall A'
    },
    { 
      id: 'SUP-02', 
      student: 'Areeba Noor', 
      roll: 'TCS-144', 
      campus: 'City School Senior Branch', 
      wing: 'College Wing', 
      failedSubjects: ['Biology'], 
      examDate: '2026-11-22', 
      feeStatus: 'Unpaid', 
      feeAmount: 'PKR 1,500', 
      admitCardIssued: false, 
      status: 'Fee Pending',
      center: 'City School Main Auditorium'
    },
    { 
      id: 'SUP-03', 
      student: 'Danish Ali', 
      roll: 'LGS-105', 
      campus: 'Lahore Grammar Model Town', 
      wing: 'Middle Wing', 
      failedSubjects: ['General Science'], 
      examDate: '2026-11-25', 
      feeStatus: 'Paid', 
      feeAmount: 'PKR 1,500', 
      admitCardIssued: true, 
      status: 'Registered',
      center: 'LGS Block 4 Examination Suite'
    }
  ]

  const [supplementaryRegistry, setSupplementaryRegistry] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.SUPPLEMENTARY)
      return saved ? JSON.parse(saved) : defaultSupplementaryRegistry
    } catch {
      return defaultSupplementaryRegistry
    }
  })

  const [showAddSupplementaryModal, setShowAddSupplementaryModal] = useState(false)
  const [supplementarySearchQuery, setSupplementarySearchQuery] = useState('')
  const [supplementaryCampusFilter, setSupplementaryCampusFilter] = useState('all')
  const [supplementaryFeeFilter, setSupplementaryFeeFilter] = useState('all')
  const [selectedSuppAdmitCard, setSelectedSuppAdmitCard] = useState(null)

  const [newSuppForm, setNewSuppForm] = useState({
    student: '',
    roll: '',
    campus: 'Beaconhouse Central High',
    wing: 'High School Wing',
    failedSubject: '',
    examDate: '2026-11-28',
    feeAmount: 'PKR 1,500',
    feeStatus: 'Unpaid',
    center: 'Beaconhouse Central Exam Hall A'
  })

  const handleRegisterSupplementary = () => {
    if (!newSuppForm.student || !newSuppForm.roll || !newSuppForm.failedSubject) {
      toast?.error?.('Please enter student name, roll number, and failed subject.')
      return
    }
    const newEntry = {
      id: `SUP-0${supplementaryRegistry.length + 1}`,
      student: newSuppForm.student,
      roll: newSuppForm.roll,
      campus: newSuppForm.campus,
      wing: newSuppForm.wing,
      failedSubjects: [newSuppForm.failedSubject],
      examDate: newSuppForm.examDate,
      feeStatus: newSuppForm.feeStatus,
      feeAmount: newSuppForm.feeAmount,
      admitCardIssued: newSuppForm.feeStatus === 'Paid',
      status: newSuppForm.feeStatus === 'Paid' ? 'Registered' : 'Fee Pending',
      center: newSuppForm.center
    }

    const updated = [newEntry, ...supplementaryRegistry]
    setSupplementaryRegistry(updated)
    localStorage.setItem(STORAGE_KEYS.SUPPLEMENTARY, JSON.stringify(updated))
    setShowAddSupplementaryModal(false)
    toast?.success?.(`Supplementary candidate ${newEntry.student} enrolled successfully.`)
  }

  const handleToggleSuppFeeStatus = (id) => {
    const updated = supplementaryRegistry.map(s => {
      if (s.id === id) {
        const nextPaid = s.feeStatus !== 'Paid'
        return {
          ...s,
          feeStatus: nextPaid ? 'Paid' : 'Unpaid',
          admitCardIssued: nextPaid,
          status: nextPaid ? 'Registered' : 'Fee Pending'
        }
      }
      return s
    })
    setSupplementaryRegistry(updated)
    localStorage.setItem(STORAGE_KEYS.SUPPLEMENTARY, JSON.stringify(updated))
    toast?.success?.('Candidate compartment fee status and admit card issuance updated.')
  }

  const handleBatchPrintPaidAdmitCards = () => {
    const paidCandidates = supplementaryRegistry.filter(s => s.feeStatus === 'Paid')
    if (paidCandidates.length === 0) {
      toast?.error?.('No candidates with Paid fee status available for batch admit cards.')
      return
    }
    toast?.info?.(`Dispatching print queue for ${paidCandidates.length} Supplementary Admit Cards...`)
    window.print()
  }

  const filteredSupplementaryRegistry = useMemo(() => {
    return supplementaryRegistry.filter(s => {
      const matchSearch = !supplementarySearchQuery 
        || s.student.toLowerCase().includes(supplementarySearchQuery.toLowerCase())
        || s.roll.toLowerCase().includes(supplementarySearchQuery.toLowerCase())
      const matchCampus = supplementaryCampusFilter === 'all' || s.campus === supplementaryCampusFilter
      const matchFee = supplementaryFeeFilter === 'all' || s.feeStatus === supplementaryFeeFilter
      return matchSearch && matchCampus && matchFee
    })
  }, [supplementaryRegistry, supplementarySearchQuery, supplementaryCampusFilter, supplementaryFeeFilter])

  // =========================================================================
  // SUB-TAB 6: DMC / TRANSCRIPT TEMPLATES
  // =========================================================================
  const defaultTranscriptSettings = {
    selectedTemplate: 'ssc', // 'ssc' | 'cambridge' | 'hssc' | 'primary'
    watermarkText: 'OFFICIAL PLATFORM TRANSCRIPT - BOARD CERTIFIED',
    showWatermark: true,
    showQRCode: true,
    showSignatures: true,
    showGradingLegend: true,
    showCampusCrest: true,
    registrarTitle: 'Controller of Examinations',
    principalTitle: 'Campus Principal & Head of Institution'
  }

  const [transcriptSettings, setTranscriptSettings] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.TRANSCRIPTS)
      return saved ? JSON.parse(saved) : defaultTranscriptSettings
    } catch {
      return defaultTranscriptSettings
    }
  })

  // Dynamic preview candidate selector
  const previewCandidates = [
    { 
      roll: 'BHS-042', 
      name: 'Mustafa Kamal', 
      campus: 'Beaconhouse Central High', 
      wing: 'Secondary / High School',
      subjects: [
        { sub: 'English Language & Comp', max: 100, obt: 92, grade: 'A+', gpa: '4.00', rem: 'Exceptional' },
        { sub: 'Mathematics (Advanced)', max: 100, obt: 94, grade: 'A+', gpa: '4.00', rem: 'Outstanding' },
        { sub: 'Physics Theory & Practical', max: 100, obt: 88, grade: 'A', gpa: '3.70', rem: 'Distinction' },
        { sub: 'Chemistry Theory & Practical', max: 100, obt: 91, grade: 'A+', gpa: '4.00', rem: 'Outstanding' },
        { sub: 'Computer Science (Programming)', max: 100, obt: 96, grade: 'A+', gpa: '4.00', rem: 'Exemplary' }
      ],
      total: 461, max: 500, grade: 'A+', gpa: '3.94', status: 'PASSED WITH HIGH MERIT'
    },
    { 
      roll: 'TCS-112', 
      name: 'Sarah Tariq', 
      campus: 'City School Senior Branch', 
      wing: 'College & Higher Secondary',
      subjects: [
        { sub: 'Functional English', max: 100, obt: 89, grade: 'A', gpa: '3.70', rem: 'Distinction' },
        { sub: 'Calculus & Analytical Geometry', max: 100, obt: 95, grade: 'A+', gpa: '4.00', rem: 'Exceptional' },
        { sub: 'Physics Mechanics & Electro', max: 100, obt: 91, grade: 'A+', gpa: '4.00', rem: 'Outstanding' },
        { sub: 'Organic Chemistry', max: 100, obt: 90, grade: 'A+', gpa: '4.00', rem: 'Outstanding' },
        { sub: 'Pakistan Studies', max: 50, obt: 47, grade: 'A+', gpa: '4.00', rem: 'Exemplary' }
      ],
      total: 412, max: 450, grade: 'A+', gpa: '3.94', status: 'PASSED WITH MERIT'
    },
    { 
      roll: 'LGS-088', 
      name: 'Zainab Fatima', 
      campus: 'Lahore Grammar Model Town', 
      wing: 'Middle School Wing',
      subjects: [
        { sub: 'English Literature', max: 100, obt: 86, grade: 'A', gpa: '3.70', rem: 'Distinction' },
        { sub: 'Mathematics Fundamentals', max: 100, obt: 88, grade: 'A', gpa: '3.70', rem: 'Distinction' },
        { sub: 'General Science', max: 100, obt: 92, grade: 'A+', gpa: '4.00', rem: 'Outstanding' },
        { sub: 'Urdu Literature', max: 100, obt: 90, grade: 'A+', gpa: '4.00', rem: 'Outstanding' },
        { sub: 'Islamiat / Ethics', max: 50, obt: 45, grade: 'A+', gpa: '4.00', rem: 'Exceptional' }
      ],
      total: 401, max: 450, grade: 'A', gpa: '3.82', status: 'PASSED WITH DISTINCTION'
    }
  ]

  const [selectedPreviewRoll, setSelectedPreviewRoll] = useState('BHS-042')
  const activePreviewCandidate = useMemo(() => {
    return previewCandidates.find(c => c.roll === selectedPreviewRoll) || previewCandidates[0]
  }, [selectedPreviewRoll])

  const handleUpdateTranscriptSettings = (partial) => {
    const updated = { ...transcriptSettings, ...partial }
    setTranscriptSettings(updated)
    localStorage.setItem(STORAGE_KEYS.TRANSCRIPTS, JSON.stringify(updated))
    toast?.success?.('DMC / Transcript template configuration updated.')
  }

  const handlePrintDMC = () => {
    window.print()
  }

  // =========================================================================
  // SUB-TAB 7: EXAMINATION REPORTS & MASTER TABULATION SHEET
  // =========================================================================
  const masterTabulationRecords = useMemo(() => {
    return [
      { roll: 'BHS-042', name: 'Mustafa Kamal', campus: 'Beaconhouse Central High', wing: 'High School Wing', term: 'Midterm 2026', total: 472, max: 500, pct: 94.4, gpa: 4.0, grade: 'A+', position: 1, status: 'Pass' },
      { roll: 'TCS-112', name: 'Sarah Tariq', campus: 'City School Senior Branch', wing: 'College Wing', term: 'Midterm 2026', total: 458, max: 500, pct: 91.6, gpa: 4.0, grade: 'A+', position: 2, status: 'Pass' },
      { roll: 'LGS-088', name: 'Zainab Fatima', campus: 'Lahore Grammar Model Town', wing: 'Middle Wing', term: 'Midterm 2026', total: 445, max: 500, pct: 89.0, gpa: 3.7, grade: 'A', position: 3, status: 'Pass' },
      { roll: 'BHS-055', name: 'Bilal Farooq', campus: 'Beaconhouse Central High', wing: 'High School Wing', term: 'Midterm 2026', total: 412, max: 500, pct: 82.4, gpa: 3.7, grade: 'A', position: 4, status: 'Pass' },
      { roll: 'APS-201', name: 'Rayan Mehmood', campus: 'Army Public School & College', wing: 'Senior Wing', term: 'Midterm 2026', total: 395, max: 500, pct: 79.0, gpa: 3.0, grade: 'B', position: 5, status: 'Pass' },
      { roll: 'TCS-144', name: 'Areeba Noor', campus: 'City School Senior Branch', wing: 'College Wing', term: 'Midterm 2026', total: 310, max: 500, pct: 62.0, gpa: 2.0, grade: 'C', position: 12, status: 'Compartment' },
      { roll: 'BHS-091', name: 'Hamza Bilal', campus: 'Beaconhouse Central High', wing: 'High School Wing', term: 'Midterm 2026', total: 240, max: 500, pct: 48.0, gpa: 0.0, grade: 'F', position: 24, status: 'Compartment' }
    ]
  }, [])

  const [tabulationCampusFilter, setTabulationCampusFilter] = useState('all')
  const [tabulationSearchQuery, setTabulationSearchQuery] = useState('')
  const [showTabulationRegisterModal, setShowTabulationRegisterModal] = useState(false)

  const filteredTabulationRecords = useMemo(() => {
    return masterTabulationRecords.filter(r => {
      const matchCampus = tabulationCampusFilter === 'all' || r.campus === tabulationCampusFilter
      const matchSearch = !tabulationSearchQuery 
        || r.name.toLowerCase().includes(tabulationSearchQuery.toLowerCase())
        || r.roll.toLowerCase().includes(tabulationSearchQuery.toLowerCase())
      return matchCampus && matchSearch
    })
  }, [masterTabulationRecords, tabulationCampusFilter, tabulationSearchQuery])

  // Dynamic KPI stats recalculated based on campus filter
  const dynamicReportStats = useMemo(() => {
    const list = filteredTabulationRecords
    if (list.length === 0) {
      return { passRate: '0.0%', totalExaminees: 0, avgGpa: '0.00', positions: 0 }
    }
    const passed = list.filter(r => r.status === 'Pass').length
    const passRate = ((passed / list.length) * 100).toFixed(1) + '%'
    const totalGpa = list.reduce((acc, r) => acc + r.gpa, 0)
    const avgGpa = (totalGpa / list.length).toFixed(2)
    const positions = list.filter(r => r.position && r.position <= 3).length
    return {
      passRate,
      totalExaminees: tabulationCampusFilter === 'all' ? 1480 : list.length * 35,
      avgGpa,
      positions: tabulationCampusFilter === 'all' ? 18 : positions
    }
  }, [filteredTabulationRecords, tabulationCampusFilter])

  // Top Position Holders
  const positionHolders = useMemo(() => {
    return filteredTabulationRecords.filter(r => r.position && r.position <= 3).sort((a, b) => a.position - b.position)
  }, [filteredTabulationRecords])

  // Master Gazette CSV Export
  const handleExportMasterGazette = () => {
    try {
      const headers = ['Roll_No', 'Student_Name', 'Campus', 'Wing', 'Exam_Term', 'Total_Marks', 'Max_Marks', 'Percentage', 'GPA', 'Grade', 'Position', 'Status']
      const rows = filteredTabulationRecords.map(r => [
        `"${r.roll}"`,
        `"${r.name}"`,
        `"${r.campus}"`,
        `"${r.wing}"`,
        `"${r.term}"`,
        r.total,
        r.max,
        `${r.pct}%`,
        r.gpa.toFixed(2),
        `"${r.grade}"`,
        r.position,
        `"${r.status}"`
      ])

      const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\n')
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
      const url = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.setAttribute('download', `platform_examinations_gazette_${new Date().toISOString().split('T')[0]}.csv`)
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      URL.revokeObjectURL(url)
      toast?.success?.('Master Examination Gazette CSV generated and downloaded.')
    } catch {
      toast?.error?.('Failed to generate gazette export.')
    }
  }

  const handleIssueAdvisory = (subjectName) => {
    toast?.success?.(`Academic review advisory dispatched to Head of ${subjectName} Department across sister campuses.`)
  }

  // Tabs Configuration
  const tabsConfig = [
    { key: 'policies', label: 'Exam Policies & Datesheet Rules', icon: FileText },
    { key: 'results-wing', label: 'Results Overview (Wing-wise)', icon: BarChart3 },
    { key: 'publish-freeze', label: 'Result Publish / Freeze', icon: Lock, badge: freezeStatuses.filter(f => !f.isFrozen).length },
    { key: 'grade-approvals', label: 'Grade Change & Re-checking Approvals', icon: CheckSquare, badge: gradeApprovals.filter(g => g.status === 'Pending Approval').length },
    { key: 'supplementary', label: 'Supplementary Exams', icon: RefreshCw, badge: supplementaryRegistry.filter(s => s.feeStatus === 'Unpaid').length },
    { key: 'transcripts', label: 'DMC / Transcript Templates', icon: FileBadge },
    { key: 'reports', label: 'Examination Reports', icon: FileSpreadsheet }
  ]

  return (
    <div className="p-3 sm:p-6 md:p-8 space-y-6 max-w-7xl mx-auto printable-content-root">
      {/* Print isolation style */}
      <style>{`
        @media print {
          body * {
            visibility: hidden;
          }
          .printable-certificate-container, .printable-certificate-container * {
            visibility: visible;
          }
          .printable-certificate-container {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
            margin: 0;
            padding: 20px;
            box-shadow: none;
            border: none;
          }
          .no-print {
            display: none !important;
          }
        }
      `}</style>

      {/* Header Banner */}
      <div className="bg-gradient-to-r from-purple-900 via-indigo-900 to-slate-900 rounded-3xl p-6 sm:p-8 text-white shadow-xl relative overflow-hidden no-print">
        <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 rounded-full bg-purple-500/10 blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md text-xs font-semibold text-purple-200 border border-white/10 mb-2">
              <Award className="w-3.5 h-3.5 text-purple-300" />
              <span>Super Administrator • Platform Examination Authority</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              Examinations & Results Governance
            </h1>
            <p className="text-sm text-slate-300 mt-1 max-w-2xl leading-relaxed">
              Standardize grading scales, central datesheet guidelines, result freeze lockouts, grade appeals, and official transcripts across all campuses.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <button
              type="button"
              onClick={handleExportMasterGazette}
              className="px-4 py-2.5 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-xs font-bold shadow-md cursor-pointer inline-flex items-center gap-2 transition-all"
            >
              <Download className="w-4 h-4" />
              <span>Export Master Gazette</span>
            </button>
            <button
              type="button"
              onClick={handlePrintDMC}
              className="px-4 py-2.5 bg-white/10 hover:bg-white/20 text-white rounded-xl text-xs font-bold border border-white/10 cursor-pointer inline-flex items-center gap-2 transition-all"
            >
              <Printer className="w-4 h-4" />
              <span>Print View</span>
            </button>
          </div>
        </div>
      </div>

      {/* Sub-Tabs Navigation Bar */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-2 shadow-2xs overflow-x-auto dark-scroll no-print">
        <div className="flex items-center gap-1.5 min-w-max">
          {tabsConfig.map((t) => {
            const Icon = t.icon
            const isActive = currentTab === t.key
            return (
              <button
                key={t.key}
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
                  <span className={`px-1.5 py-0.5 rounded-full text-[10px] font-mono ${
                    isActive ? 'bg-purple-700 text-purple-100' : 'bg-amber-100 text-amber-800'
                  }`}>
                    {t.badge}
                  </span>
                )}
              </button>
            )
          })}
        </div>
      </div>

      {/* ==================================================================== */}
      {/* 1. EXAM POLICIES & DATESHEET RULES                                    */}
      {/* ==================================================================== */}
      {currentTab === 'policies' && (
        <div className="space-y-6 no-print">
          {/* Schema Selector & Controls */}
          <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-2xs">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
              <div>
                <h3 className="text-sm font-bold text-slate-900">Standard Platform Grading System</h3>
                <p className="text-xs text-slate-500 mt-0.5">Select the active academic grading framework and customize letter thresholds.</p>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold text-slate-600">Active Schema:</span>
                <div className="inline-flex rounded-xl bg-slate-100 p-1">
                  {[
                    { key: 'percentage', label: 'Percentage (SSC / HSSC)' },
                    { key: 'gpa4', label: 'GPA 4.0 Scale' },
                    { key: 'cambridge', label: 'Cambridge (O/A Level)' }
                  ].map(s => (
                    <button
                      key={s.key}
                      onClick={() => handleScaleChange(s.key)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                        policies.activeScale === s.key ? 'bg-white text-purple-700 shadow-2xs' : 'text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      {s.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Grading Table */}
            <div className="mt-4 overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-600">
                <thead className="bg-slate-50 border-b border-slate-100 font-bold text-slate-700 uppercase tracking-wider text-[11px]">
                  <tr>
                    <th className="py-2.5 px-4">Grade</th>
                    <th className="py-2.5 px-4">Min Score %</th>
                    <th className="py-2.5 px-4">Max Score %</th>
                    <th className="py-2.5 px-4">GPA Equivalent</th>
                    <th className="py-2.5 px-4">Description</th>
                    <th className="py-2.5 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {policies.bands.map((band, idx) => (
                    <tr key={idx} className="hover:bg-slate-50/70">
                      <td className="py-2.5 px-4 font-bold text-slate-900">
                        <span className="px-2 py-0.5 rounded-md bg-purple-50 text-purple-700 border border-purple-200 font-mono">
                          {band.grade}
                        </span>
                      </td>
                      <td className="py-2.5 px-4 font-mono font-medium">{band.min}%</td>
                      <td className="py-2.5 px-4 font-mono font-medium">{band.max || 100}%</td>
                      <td className="py-2.5 px-4 font-mono font-bold text-emerald-700">
                        {band.gpa !== undefined ? band.gpa.toFixed(2) : 'N/A'}
                      </td>
                      <td className="py-2.5 px-4 text-slate-600">{band.description || 'Standard'}</td>
                      <td className="py-2.5 px-4 text-right space-x-2">
                        <button
                          type="button"
                          onClick={() => {
                            setEditingBandIndex(idx)
                            setBandFormData({
                              grade: band.grade,
                              min: band.min,
                              max: band.max || 100,
                              gpa: band.gpa || 0,
                              description: band.description || ''
                            })
                            setShowAddBandModal(true)
                          }}
                          className="text-purple-600 hover:text-purple-800 font-bold text-xs cursor-pointer inline-flex items-center gap-1"
                        >
                          <Sliders className="w-3 h-3" />
                          <span>Edit</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeleteBand(idx)}
                          className="text-rose-500 hover:text-rose-700 font-bold text-xs cursor-pointer inline-flex items-center gap-1"
                          title="Delete boundary tier"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="flex items-center justify-between mt-4 pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={handleResetBandsToDefault}
                className="text-xs text-slate-500 hover:text-slate-800 inline-flex items-center gap-1.5 cursor-pointer font-medium"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Restore Default Schema Thresholds</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  setEditingBandIndex(null)
                  setBandFormData({ grade: '', min: 50, max: 59, gpa: 2.0, description: '' })
                  setShowAddBandModal(true)
                }}
                className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold cursor-pointer inline-flex items-center gap-1"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Grade Boundary</span>
              </button>
            </div>
          </div>

          {/* Central Directives & Eligibility Rules Form */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-2xs space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                <div className="flex items-center gap-2 text-xs font-bold text-slate-900">
                  <ShieldCheck className="w-4 h-4 text-purple-600" />
                  <span>Central Examination Directives</span>
                </div>
                <button
                  type="button"
                  onClick={handleBroadcastDirectives}
                  className="px-2.5 py-1 bg-purple-50 hover:bg-purple-100 text-purple-700 rounded-lg text-xs font-bold cursor-pointer inline-flex items-center gap-1"
                >
                  <Send className="w-3 h-3" />
                  <span>Broadcast Directives</span>
                </button>
              </div>
              
              <div className="space-y-3 text-xs">
                <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-200/70">
                  <div>
                    <span className="font-bold text-slate-800 block">Datesheet Uniformity Enforcement</span>
                    <span className="text-[11px] text-slate-500">Core subjects (Math, English, Science) tested on synchronized calendar dates.</span>
                  </div>
                  <input
                    type="checkbox"
                    checked={policies.datesheetUniformCore}
                    onChange={(e) => handleSavePolicySettings({ datesheetUniformCore: e.target.checked })}
                    className="w-4 h-4 accent-purple-600 rounded cursor-pointer"
                  />
                </div>

                <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-200/70">
                  <div>
                    <span className="font-bold text-slate-800 block">Superadmin Attendance Waiver Authority</span>
                    <span className="text-[11px] text-slate-500">Allow Superadmin to issue special admit card dispensations for medical cases.</span>
                  </div>
                  <input
                    type="checkbox"
                    checked={policies.allowSuperadminWaiver}
                    onChange={(e) => handleSavePolicySettings({ allowSuperadminWaiver: e.target.checked })}
                    className="w-4 h-4 accent-purple-600 rounded cursor-pointer"
                  />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-2xs space-y-4">
              <div className="flex items-center gap-2 text-xs font-bold text-slate-900 border-b border-slate-100 pb-2">
                <Clock className="w-4 h-4 text-indigo-600" />
                <span>Admit Card Eligibility & Secrecy Thresholds</span>
              </div>

              <div className="space-y-4 text-xs">
                <div>
                  <div className="flex justify-between font-medium text-slate-700 mb-1">
                    <span>Minimum Exam Attendance Eligibility Threshold:</span>
                    <strong className="text-purple-700 font-mono">{policies.minAttendancePct}%</strong>
                  </div>
                  <input
                    type="range"
                    min="60"
                    max="90"
                    value={policies.minAttendancePct}
                    onChange={(e) => handleSavePolicySettings({ minAttendancePct: Number(e.target.value) })}
                    className="w-full accent-purple-600 cursor-pointer"
                  />
                  <div className="flex justify-between text-[10px] text-slate-400 mt-1 font-mono">
                    <span>60% (Lenient)</span>
                    <span>75% (Standard)</span>
                    <span>90% (Strict)</span>
                  </div>
                </div>

                <div>
                  <div className="flex justify-between font-medium text-slate-700 mb-1">
                    <span>Question Paper Secrecy Seal Lead Time:</span>
                    <strong className="text-indigo-700 font-mono">{policies.paperSecrecyHours} Hours Prior</strong>
                  </div>
                  <input
                    type="range"
                    min="12"
                    max="72"
                    step="6"
                    value={policies.paperSecrecyHours}
                    onChange={(e) => handleSavePolicySettings({ paperSecrecyHours: Number(e.target.value) })}
                    className="w-full accent-indigo-600 cursor-pointer"
                  />
                  <div className="flex justify-between text-[10px] text-slate-400 mt-1 font-mono">
                    <span>12h</span>
                    <span>48h (Recommended)</span>
                    <span>72h</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ==================================================================== */}
      {/* 2. RESULTS OVERVIEW (WING-WISE)                                       */}
      {/* ==================================================================== */}
      {currentTab === 'results-wing' && (
        <div className="space-y-6 no-print">
          {/* Filters Bar */}
          <div className="bg-white rounded-2xl border border-slate-200/80 p-4 shadow-2xs flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-purple-600" />
              <span className="text-xs font-bold text-slate-800">Filter Analysis:</span>
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <div className="flex items-center gap-2">
                <span className="text-xs text-slate-500 font-medium">Campus:</span>
                <select
                  value={selectedWingCampus}
                  onChange={(e) => setSelectedWingCampus(e.target.value)}
                  className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 text-xs text-slate-700 font-medium focus:outline-purple-500"
                >
                  <option value="all">All Network Campuses</option>
                  {campusOptions.map((c, i) => (
                    <option key={i} value={c}>{c}</option>
                  ))}
                </select>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-xs text-slate-500 font-medium">Exam Term:</span>
                <select
                  value={selectedWingTerm}
                  onChange={(e) => setSelectedWingTerm(e.target.value)}
                  className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 text-xs text-slate-700 font-medium focus:outline-purple-500"
                >
                  <option value="all">All Recent Terms</option>
                  <option value="midterm">Midterm Examination 2026</option>
                  <option value="terminal">Pre-Board Terminal Exams</option>
                  <option value="assessment">First Term Assessment</option>
                </select>
              </div>
            </div>
          </div>

          {/* Wing Metric Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {dynamicWingMetrics.map((w, idx) => (
              <div key={idx} className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-2xs space-y-3 relative overflow-hidden">
                <div className="flex justify-between items-start">
                  <span className="font-bold text-xs text-slate-900 block max-w-[170px] truncate" title={w.wing}>
                    {w.wing}
                  </span>
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                    w.passPercentage >= 95 ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' :
                    w.passPercentage >= 90 ? 'bg-blue-50 text-blue-700 border border-blue-200' :
                    'bg-amber-50 text-amber-700 border border-amber-200'
                  }`}>
                    {w.status}
                  </span>
                </div>

                <div>
                  <div className="text-3xl font-extrabold font-mono text-purple-700">
                    {w.passPercentage}%
                  </div>
                  <div className="w-full bg-slate-100 rounded-full h-1.5 mt-2 overflow-hidden">
                    <div 
                      className="bg-purple-600 h-1.5 rounded-full" 
                      style={{ width: `${w.passPercentage}%` }}
                    />
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-100 grid grid-cols-2 gap-2 text-[11px] text-slate-500">
                  <div>Examinees: <strong className="text-slate-800 font-mono">{w.totalExaminees}</strong></div>
                  <div>Distinctions: <strong className="text-purple-700 font-mono">{w.distinctions}</strong></div>
                  <div>Top GPA: <strong className="text-slate-800 font-mono">{w.topGpa}</strong></div>
                  <button
                    type="button"
                    onClick={() => setSelectedClassDrilldown(w)}
                    className="text-purple-600 hover:text-purple-800 font-bold cursor-pointer text-left inline-flex items-center gap-0.5"
                  >
                    <span>Class Drilldown</span>
                    <ChevronRight className="w-3 h-3" />
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Subject-Wise Pass Rate Comparative Breakdown */}
          <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-2xs space-y-4">
            <h3 className="text-sm font-bold text-slate-900">Wing Subject-Wise Pass & Performance Matrix</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {dynamicWingMetrics.map((w, idx) => (
                <div key={idx} className="p-4 rounded-xl border border-slate-100 bg-slate-50/50 space-y-3">
                  <div className="font-bold text-xs text-purple-900 flex items-center justify-between">
                    <span>{w.wing}</span>
                    <span className="text-[11px] text-slate-500 font-normal">{w.totalExaminees} Candidates</span>
                  </div>
                  <div className="space-y-2">
                    {w.subjects.map((sub, sIdx) => (
                      <div key={sIdx} className="space-y-1">
                        <div className="flex justify-between text-xs text-slate-700">
                          <span className="font-medium">{sub.name}</span>
                          <span className="font-mono font-bold text-purple-700">{sub.passRate}% Pass</span>
                        </div>
                        <div className="w-full bg-slate-200/80 rounded-full h-1.5 overflow-hidden">
                          <div 
                            className={`h-1.5 rounded-full ${sub.passRate >= 95 ? 'bg-emerald-500' : sub.passRate >= 90 ? 'bg-purple-500' : 'bg-amber-500'}`} 
                            style={{ width: `${sub.passRate}%` }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ==================================================================== */}
      {/* 3. RESULT PUBLISH / FREEZE                                            */}
      {/* ==================================================================== */}
      {currentTab === 'publish-freeze' && (
        <div className="space-y-4 no-print">
          <div className="bg-purple-50 border border-purple-200/80 p-4 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs text-purple-900">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-purple-100 text-purple-700 shrink-0">
                <Lock className="w-5 h-5" />
              </div>
              <div>
                <strong>Central Result Freeze Safeguard:</strong> Once a campus result is frozen by Superadmin, school teachers and institute admins cannot alter student marks without formal re-checking approval.
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setShowFreezeHistoryModal(true)}
                className="px-3 py-2 bg-white hover:bg-slate-100 text-purple-900 border border-purple-200 rounded-xl font-bold text-xs cursor-pointer inline-flex items-center gap-1.5 shrink-0 shadow-2xs"
              >
                <History className="w-3.5 h-3.5" />
                <span>Audit Logs</span>
              </button>
              <button
                type="button"
                onClick={() => setShowAddLockoutModal(true)}
                className="px-3.5 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-xl font-bold text-xs cursor-pointer inline-flex items-center gap-1.5 shrink-0 shadow-2xs"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Term Lockout</span>
              </button>
            </div>
          </div>

          {/* Bulk Action Controls */}
          <div className="bg-white rounded-2xl border border-slate-200/80 p-3.5 shadow-2xs flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-500 font-bold uppercase">Bulk Governance:</span>
              <button
                type="button"
                onClick={() => handleBulkFreezeAll(true)}
                className="px-3 py-1.5 bg-rose-50 text-rose-700 border border-rose-200 hover:bg-rose-100 rounded-xl text-xs font-bold cursor-pointer inline-flex items-center gap-1"
              >
                <Lock className="w-3 h-3" />
                <span>Freeze All Campuses</span>
              </button>
              <button
                type="button"
                onClick={() => handleBulkFreezeAll(false)}
                className="px-3 py-1.5 bg-slate-100 text-slate-700 hover:bg-slate-200 rounded-xl text-xs font-bold cursor-pointer inline-flex items-center gap-1"
              >
                <Unlock className="w-3 h-3" />
                <span>Unlock All for Revisions</span>
              </button>
              <button
                type="button"
                onClick={() => handleBulkPublishAll(true)}
                className="px-3 py-1.5 bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100 rounded-xl text-xs font-bold cursor-pointer inline-flex items-center gap-1"
              >
                <Eye className="w-3 h-3" />
                <span>Publish All to Parents</span>
              </button>
            </div>

            <div className="flex items-center gap-3">
              <select
                value={freezeFilterCampus}
                onChange={(e) => setFreezeFilterCampus(e.target.value)}
                className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 text-xs text-slate-700 font-medium focus:outline-purple-500"
              >
                <option value="all">All Campuses</option>
                {campusOptions.map((c, i) => (
                  <option key={i} value={c}>{c}</option>
                ))}
              </select>

              <select
                value={freezeFilterStatus}
                onChange={(e) => setFreezeFilterStatus(e.target.value)}
                className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 text-xs text-slate-700 font-medium focus:outline-purple-500"
              >
                <option value="all">All States</option>
                <option value="frozen">Frozen & Locked</option>
                <option value="unfrozen">Unlocked / Editable</option>
              </select>
            </div>
          </div>

          {/* Table */}
          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-2xs overflow-hidden">
            <table className="w-full text-left text-xs text-slate-600">
              <thead className="bg-slate-50 border-b border-slate-100 font-bold text-slate-700 uppercase tracking-wider text-[11px]">
                <tr>
                  <th className="py-3.5 px-4">Campus & Wing</th>
                  <th className="py-3.5 px-4">Exam Term</th>
                  <th className="py-3.5 px-4">Parent Portal Visibility</th>
                  <th className="py-3.5 px-4">Lock Audit Status</th>
                  <th className="py-3.5 px-4 text-right">Lock / Freeze Control</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredFreezeStatuses.map(frz => (
                  <tr key={frz.id} className="hover:bg-slate-50/70">
                    <td className="py-3.5 px-4">
                      <div className="font-bold text-slate-900">{frz.campus}</div>
                      <span className="text-[10px] text-purple-700 font-bold">{frz.wing}</span>
                    </td>
                    <td className="py-3.5 px-4 font-medium text-slate-700">{frz.examTerm}</td>
                    <td className="py-3.5 px-4">
                      <button
                        type="button"
                        onClick={() => handleTogglePortalPublish(frz.id)}
                        className={`px-2.5 py-1 rounded-full text-[10px] font-bold cursor-pointer inline-flex items-center gap-1 transition-all ${
                          frz.published 
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100' 
                            : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                        }`}
                      >
                        {frz.published ? <Eye className="w-3 h-3 text-emerald-600" /> : <X className="w-3 h-3 text-slate-400" />}
                        <span>{frz.published ? 'Live on Parent Portal' : 'Draft Only (Hidden)'}</span>
                      </button>
                    </td>
                    <td className="py-3.5 px-4 font-mono text-[11px] text-slate-500">
                      <div>{frz.approvedBy}</div>
                      {frz.frozenAt && <span className="text-[10px] text-slate-400">{frz.frozenAt}</span>}
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <button
                        type="button"
                        onClick={() => {
                          setFreezeModalTarget(frz)
                          setFreezeReason('')
                        }}
                        className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all shadow-2xs cursor-pointer inline-flex items-center gap-1.5 ${
                          frz.isFrozen
                            ? 'bg-rose-50 text-rose-700 border border-rose-200 hover:bg-rose-100'
                            : 'bg-emerald-600 text-white hover:bg-emerald-700'
                        }`}
                      >
                        {frz.isFrozen ? <Unlock className="w-3.5 h-3.5" /> : <Lock className="w-3.5 h-3.5" />}
                        <span>{frz.isFrozen ? 'Unlock for Edits' : 'Freeze & Lock Result'}</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ==================================================================== */}
      {/* 4. GRADE CHANGE & RE-CHECKING APPROVALS                               */}
      {/* ==================================================================== */}
      {currentTab === 'grade-approvals' && (
        <div className="space-y-4 no-print">
          {/* Search, Filter & Batch Bar */}
          <div className="bg-white rounded-2xl border border-slate-200/80 p-3.5 shadow-2xs flex flex-wrap items-center justify-between gap-3">
            <div className="relative flex-1 min-w-[240px]">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                placeholder="Search by student name, roll number, or subject..."
                value={gradeSearchQuery}
                onChange={(e) => setGradeSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 placeholder-slate-400 focus:outline-purple-500"
              />
            </div>

            <div className="flex items-center gap-3">
              {selectedApprovalIds.length > 0 && (
                <button
                  type="button"
                  onClick={handleBatchApprove}
                  className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold cursor-pointer inline-flex items-center gap-1 shadow-2xs"
                >
                  <Check className="w-3.5 h-3.5" />
                  <span>Approve Selected ({selectedApprovalIds.length})</span>
                </button>
              )}

              <select
                value={gradeStatusFilter}
                onChange={(e) => setGradeStatusFilter(e.target.value)}
                className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 text-xs text-slate-700 font-medium focus:outline-purple-500"
              >
                <option value="all">All Requests</option>
                <option value="Pending Approval">Pending Approval</option>
                <option value="Approved">Approved</option>
                <option value="Rejected">Rejected</option>
              </select>
            </div>
          </div>

          {/* Table */}
          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-2xs overflow-hidden">
            <table className="w-full text-left text-xs text-slate-600">
              <thead className="bg-slate-50 border-b border-slate-100 font-bold text-slate-700 uppercase tracking-wider text-[11px]">
                <tr>
                  <th className="py-3.5 px-4 w-8">
                    <input
                      type="checkbox"
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedApprovalIds(filteredGradeApprovals.filter(g => g.status === 'Pending Approval').map(g => g.id))
                        } else {
                          setSelectedApprovalIds([])
                        }
                      }}
                      className="w-4 h-4 accent-purple-600 rounded"
                    />
                  </th>
                  <th className="py-3.5 px-4">Approval ID & Student</th>
                  <th className="py-3.5 px-4">Subject & Campus</th>
                  <th className="py-3.5 px-4 text-center">Marks Change</th>
                  <th className="py-3.5 px-4">Justification Note</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredGradeApprovals.map(grd => (
                  <tr key={grd.id} className="hover:bg-slate-50/70">
                    <td className="py-3.5 px-4">
                      {grd.status === 'Pending Approval' ? (
                        <input
                          type="checkbox"
                          checked={selectedApprovalIds.includes(grd.id)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setSelectedApprovalIds([...selectedApprovalIds, grd.id])
                            } else {
                              setSelectedApprovalIds(selectedApprovalIds.filter(id => id !== grd.id))
                            }
                          }}
                          className="w-4 h-4 accent-purple-600 rounded"
                        />
                      ) : (
                        <span className="text-slate-300">-</span>
                      )}
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="font-bold text-slate-900">{grd.student}</div>
                      <span className="font-mono text-[10px] text-slate-400">{grd.id} • {grd.roll}</span>
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="font-medium text-slate-800">{grd.subject}</div>
                      <span className="text-[10px] text-slate-400">{grd.campus}</span>
                    </td>
                    <td className="py-3.5 px-4 text-center font-mono">
                      <span className="text-slate-400 line-through mr-1.5">{grd.originalMarks}</span>
                      <strong className="text-emerald-700 font-bold text-sm">➔ {grd.requestedMarks}</strong>
                      <span className="text-[10px] text-emerald-600 font-bold ml-1">
                        (+{grd.requestedMarks - grd.originalMarks})
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-slate-600 max-w-xs truncate" title={grd.reason}>
                      {grd.reason}
                    </td>
                    <td className="py-3.5 px-4">
                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                        grd.status === 'Approved' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' :
                        grd.status === 'Rejected' ? 'bg-rose-50 text-rose-700 border border-rose-200' :
                        'bg-amber-50 text-amber-700 border border-amber-200'
                      }`}>
                        {grd.status}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-right space-x-1.5 whitespace-nowrap">
                      <button
                        type="button"
                        onClick={() => {
                          setSelectedGradeItem(grd)
                          setShowEvidenceModal(true)
                        }}
                        className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-bold cursor-pointer inline-flex items-center gap-1"
                        title="View Paper Script Evidence"
                      >
                        <Eye className="w-3 h-3 text-slate-500" />
                        <span>Evidence</span>
                      </button>

                      {grd.status === 'Pending Approval' && (
                        <>
                          <button
                            type="button"
                            onClick={() => {
                              setSelectedGradeItem(grd)
                              setSuperadminRemarks('')
                              setShowApprovalRemarksModal(true)
                            }}
                            className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold cursor-pointer inline-flex items-center gap-1 shadow-2xs"
                          >
                            <Check className="w-3 h-3" />
                            <span>Approve</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              setSelectedGradeItem(grd)
                              setSuperadminRemarks('')
                              setShowRejectionModal(true)
                            }}
                            className="px-2.5 py-1 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 rounded-lg text-xs font-bold cursor-pointer inline-flex items-center gap-1"
                          >
                            <X className="w-3 h-3" />
                            <span>Reject</span>
                          </button>
                        </>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ==================================================================== */}
      {/* 5. SUPPLEMENTARY EXAMS                                                 */}
      {/* ==================================================================== */}
      {currentTab === 'supplementary' && (
        <div className="space-y-6 no-print">
          {/* Policy Directives Card */}
          <div className="bg-gradient-to-r from-purple-50 via-indigo-50 to-white rounded-2xl border border-purple-200/80 p-5 shadow-2xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <RefreshCw className="w-4 h-4 text-purple-600" />
                <h3 className="text-sm font-bold text-purple-950">Supplementary & Compartment Policy Framework</h3>
              </div>
              <p className="text-xs text-slate-600 max-w-2xl leading-relaxed">
                Students failing in maximum <strong>2 subjects</strong> are eligible for compartment examinations scheduled <strong>45 days</strong> post regular result declaration. Retake score retains original credits.
              </p>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleBatchPrintPaidAdmitCards}
                className="px-3.5 py-2 bg-white hover:bg-slate-100 text-purple-700 border border-purple-200 rounded-xl text-xs font-bold shadow-2xs cursor-pointer inline-flex items-center gap-1.5 shrink-0"
              >
                <Printer className="w-4 h-4" />
                <span>Batch Print Paid Cards</span>
              </button>
              <button
                type="button"
                onClick={() => setShowAddSupplementaryModal(true)}
                className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-xs font-bold shadow-2xs cursor-pointer inline-flex items-center gap-1.5 shrink-0"
              >
                <Plus className="w-4 h-4" />
                <span>Register Candidate</span>
              </button>
            </div>
          </div>

          {/* Search & Filters */}
          <div className="bg-white rounded-2xl border border-slate-200/80 p-3.5 shadow-2xs flex flex-wrap items-center justify-between gap-3">
            <div className="relative flex-1 min-w-[240px]">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                placeholder="Search candidate name or roll number..."
                value={supplementarySearchQuery}
                onChange={(e) => setSupplementarySearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 placeholder-slate-400 focus:outline-purple-500"
              />
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <div className="flex items-center gap-2">
                <span className="text-xs text-slate-500 font-medium">Campus:</span>
                <select
                  value={supplementaryCampusFilter}
                  onChange={(e) => setSupplementaryCampusFilter(e.target.value)}
                  className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 text-xs text-slate-700 font-medium focus:outline-purple-500"
                >
                  <option value="all">All Campuses</option>
                  {campusOptions.map((c, i) => (
                    <option key={i} value={c}>{c}</option>
                  ))}
                </select>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-xs text-slate-500 font-medium">Fee:</span>
                <select
                  value={supplementaryFeeFilter}
                  onChange={(e) => setSupplementaryFeeFilter(e.target.value)}
                  className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 text-xs text-slate-700 font-medium focus:outline-purple-500"
                >
                  <option value="all">All Status</option>
                  <option value="Paid">Paid</option>
                  <option value="Unpaid">Unpaid</option>
                </select>
              </div>
            </div>
          </div>

          {/* Candidates Registry Table */}
          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-2xs overflow-hidden">
            <table className="w-full text-left text-xs text-slate-600">
              <thead className="bg-slate-50 border-b border-slate-100 font-bold text-slate-700 uppercase tracking-wider text-[11px]">
                <tr>
                  <th className="py-3.5 px-4">Candidate & Roll</th>
                  <th className="py-3.5 px-4">Campus & Wing</th>
                  <th className="py-3.5 px-4">Failed Subject(s)</th>
                  <th className="py-3.5 px-4">Exam Date & Center</th>
                  <th className="py-3.5 px-4">Fee Status</th>
                  <th className="py-3.5 px-4 text-right">Admit Card / Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredSupplementaryRegistry.map(cand => (
                  <tr key={cand.id} className="hover:bg-slate-50/70">
                    <td className="py-3.5 px-4">
                      <div className="font-bold text-slate-900">{cand.student}</div>
                      <span className="font-mono text-[10px] text-slate-400">{cand.id} • {cand.roll}</span>
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="font-medium text-slate-800">{cand.campus}</div>
                      <span className="text-[10px] text-purple-700 font-bold">{cand.wing}</span>
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="flex flex-wrap gap-1">
                        {cand.failedSubjects.map((sub, sIdx) => (
                          <span key={sIdx} className="px-2 py-0.5 bg-rose-50 text-rose-700 border border-rose-200 rounded-md font-medium text-[10px]">
                            {sub}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="font-mono font-medium text-slate-800">{cand.examDate}</div>
                      <span className="text-[10px] text-slate-400">{cand.center}</span>
                    </td>
                    <td className="py-3.5 px-4">
                      <button
                        type="button"
                        onClick={() => handleToggleSuppFeeStatus(cand.id)}
                        className={`px-2.5 py-1 rounded-full text-[10px] font-bold cursor-pointer inline-flex items-center gap-1 transition-all ${
                          cand.feeStatus === 'Paid'
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100'
                            : 'bg-amber-50 text-amber-700 border border-amber-200 hover:bg-amber-100'
                        }`}
                        title="Click to toggle fee status"
                      >
                        {cand.feeStatus === 'Paid' ? <CheckCircle className="w-3 h-3 text-emerald-600" /> : <AlertTriangle className="w-3 h-3 text-amber-600" />}
                        <span>{cand.feeStatus} ({cand.feeAmount})</span>
                      </button>
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      {cand.admitCardIssued ? (
                        <button
                          type="button"
                          onClick={() => setSelectedSuppAdmitCard(cand)}
                          className="px-3 py-1 bg-purple-50 text-purple-700 border border-purple-200 hover:bg-purple-100 rounded-lg text-xs font-bold cursor-pointer inline-flex items-center gap-1"
                        >
                          <Printer className="w-3 h-3" />
                          <span>Admit Card</span>
                        </button>
                      ) : (
                        <span className="text-[11px] text-slate-400 italic">Fee Pending</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ==================================================================== */}
      {/* 6. DMC / TRANSCRIPT TEMPLATES                                         */}
      {/* ==================================================================== */}
      {currentTab === 'transcripts' && (
        <div className="space-y-6">
          {/* Template Configuration Toolbar */}
          <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-2xs space-y-4 no-print">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
              <div>
                <h3 className="text-sm font-bold text-slate-900">Official DMC & Transcript Template Engine</h3>
                <p className="text-xs text-slate-500 mt-0.5">Customize watermark text, QR verification signatures, and layout scheme for student certificates.</p>
              </div>
              <div className="flex flex-wrap items-center gap-3">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-semibold text-slate-600">Sample Candidate:</span>
                  <select
                    value={selectedPreviewRoll}
                    onChange={(e) => setSelectedPreviewRoll(e.target.value)}
                    className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 text-xs text-slate-800 font-bold focus:outline-purple-500"
                  >
                    {previewCandidates.map(c => (
                      <option key={c.roll} value={c.roll}>{c.name} ({c.roll})</option>
                    ))}
                  </select>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-xs font-semibold text-slate-600">Active Template:</span>
                  <select
                    value={transcriptSettings.selectedTemplate}
                    onChange={(e) => handleUpdateTranscriptSettings({ selectedTemplate: e.target.value })}
                    className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 text-xs text-purple-700 font-bold focus:outline-purple-500"
                  >
                    <option value="ssc">Standard SSC / Matriculation DMC</option>
                    <option value="cambridge">Cambridge O / A-Level Statement</option>
                    <option value="hssc">Higher Secondary (HSSC/College)</option>
                    <option value="primary">Primary Wing Narrative Progress Report</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Template Switches */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
              <label className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-200/70 cursor-pointer">
                <span className="font-semibold text-slate-700">Digital QR Verification Hash</span>
                <input
                  type="checkbox"
                  checked={transcriptSettings.showQRCode}
                  onChange={(e) => handleUpdateTranscriptSettings({ showQRCode: e.target.checked })}
                  className="w-4 h-4 accent-purple-600 rounded cursor-pointer"
                />
              </label>

              <label className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-200/70 cursor-pointer">
                <span className="font-semibold text-slate-700">Anti-Forgery Watermark</span>
                <input
                  type="checkbox"
                  checked={transcriptSettings.showWatermark}
                  onChange={(e) => handleUpdateTranscriptSettings({ showWatermark: e.target.checked })}
                  className="w-4 h-4 accent-purple-600 rounded cursor-pointer"
                />
              </label>

              <label className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-200/70 cursor-pointer">
                <span className="font-semibold text-slate-700">Authorized Signatures Line</span>
                <input
                  type="checkbox"
                  checked={transcriptSettings.showSignatures}
                  onChange={(e) => handleUpdateTranscriptSettings({ showSignatures: e.target.checked })}
                  className="w-4 h-4 accent-purple-600 rounded cursor-pointer"
                />
              </label>

              <label className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-200/70 cursor-pointer">
                <span className="font-semibold text-slate-700">Grading Scale Legend</span>
                <input
                  type="checkbox"
                  checked={transcriptSettings.showGradingLegend}
                  onChange={(e) => handleUpdateTranscriptSettings({ showGradingLegend: e.target.checked })}
                  className="w-4 h-4 accent-purple-600 rounded cursor-pointer"
                />
              </label>
            </div>

            {transcriptSettings.showWatermark && (
              <div className="pt-2 flex items-center gap-3">
                <span className="text-xs font-semibold text-slate-600 shrink-0">Watermark Text:</span>
                <input
                  type="text"
                  value={transcriptSettings.watermarkText}
                  onChange={(e) => handleUpdateTranscriptSettings({ watermarkText: e.target.value })}
                  className="flex-1 px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-purple-500 font-mono"
                />
              </div>
            )}
          </div>

          {/* Interactive Live Sample Transcript Preview */}
          <div className="bg-white rounded-3xl border-2 border-purple-200 p-8 shadow-md relative overflow-hidden max-w-4xl mx-auto printable-certificate-container">
            {transcriptSettings.showWatermark && (
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none select-none opacity-5 rotate-[-25deg]">
                <span className="text-5xl md:text-7xl font-extrabold font-mono text-purple-900 tracking-widest text-center">
                  {transcriptSettings.watermarkText}
                </span>
              </div>
            )}

            {/* Certificate Header */}
            <div className="text-center space-y-1 relative z-10 pb-6 border-b-2 border-slate-800">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-100 text-purple-800 font-mono text-[10px] font-bold uppercase tracking-widest mb-1">
                Central Examination Authority • Platform Network
              </div>
              <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight uppercase">
                Detailed Marks Certificate (DMC)
              </h2>
              <p className="text-xs font-bold text-slate-600">
                {transcriptSettings.selectedTemplate === 'ssc' ? 'Secondary School Certificate Examination (Session 2025-2026)' :
                 transcriptSettings.selectedTemplate === 'cambridge' ? 'Cambridge International Examinations General Certificate of Education' :
                 transcriptSettings.selectedTemplate === 'hssc' ? 'Higher Secondary School Certificate (Faculty of Science)' :
                 'Primary Wing Continuous Academic Performance Assessment Report'}
              </p>
            </div>

            {/* Candidate Metadata */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 py-5 text-xs border-b border-slate-200 relative z-10">
              <div>
                <span className="text-slate-400 block text-[10px] uppercase font-bold">Candidate Name</span>
                <strong className="text-slate-900 text-sm">{activePreviewCandidate.name}</strong>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px] uppercase font-bold">Roll Number</span>
                <strong className="text-purple-700 font-mono text-sm">{activePreviewCandidate.roll}</strong>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px] uppercase font-bold">Institution / Campus</span>
                <strong className="text-slate-900">{activePreviewCandidate.campus}</strong>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px] uppercase font-bold">Academic Wing</span>
                <strong className="text-slate-900">{activePreviewCandidate.wing}</strong>
              </div>
            </div>

            {/* Subject Marks Table */}
            <div className="py-5 relative z-10">
              <table className="w-full text-left text-xs text-slate-700">
                <thead className="bg-slate-100 border-y border-slate-300 font-bold uppercase tracking-wider text-[10px] text-slate-800">
                  <tr>
                    <th className="py-2.5 px-3">Subject Name</th>
                    <th className="py-2.5 px-3 text-center">Max Marks</th>
                    <th className="py-2.5 px-3 text-center">Marks Obtained</th>
                    <th className="py-2.5 px-3 text-center">Grade</th>
                    <th className="py-2.5 px-3 text-center">GPA</th>
                    <th className="py-2.5 px-3 text-right">Remarks</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {activePreviewCandidate.subjects.map((row, rIdx) => (
                    <tr key={rIdx} className="hover:bg-slate-50/50">
                      <td className="py-2.5 px-3 font-semibold text-slate-900">{row.sub}</td>
                      <td className="py-2.5 px-3 text-center font-mono">{row.max}</td>
                      <td className="py-2.5 px-3 text-center font-mono font-bold text-slate-900">{row.obt}</td>
                      <td className="py-2.5 px-3 text-center font-mono font-bold text-purple-700">{row.grade}</td>
                      <td className="py-2.5 px-3 text-center font-mono text-emerald-700">{row.gpa}</td>
                      <td className="py-2.5 px-3 text-right font-medium text-slate-600">{row.rem}</td>
                    </tr>
                  ))}
                </tbody>
                <tfoot className="border-t-2 border-slate-800 bg-slate-50 font-bold">
                  <tr>
                    <td className="py-2.5 px-3 uppercase text-slate-900">Grand Aggregate</td>
                    <td className="py-2.5 px-3 text-center font-mono">{activePreviewCandidate.max}</td>
                    <td className="py-2.5 px-3 text-center font-mono text-purple-700 text-sm">{activePreviewCandidate.total}</td>
                    <td className="py-2.5 px-3 text-center font-mono text-emerald-700 text-sm">{activePreviewCandidate.grade}</td>
                    <td className="py-2.5 px-3 text-center font-mono text-emerald-700 text-sm">{activePreviewCandidate.gpa}</td>
                    <td className="py-2.5 px-3 text-right text-emerald-700 font-bold">{activePreviewCandidate.status}</td>
                  </tr>
                </tfoot>
              </table>
            </div>

            {/* Dynamic Grading Legend bound to Sub-Tab 1 active schema */}
            {transcriptSettings.showGradingLegend && (
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-[10px] text-slate-600 flex flex-wrap justify-between gap-2 relative z-10">
                <span className="font-bold text-slate-700">Grading Scale Legend ({policies.activeScale.toUpperCase()}):</span>
                {policies.bands.slice(0, 5).map((b, idx) => (
                  <span key={idx}>
                    <strong>{b.grade}:</strong> {b.min}-{b.max || 100}% ({b.gpa?.toFixed(2) || 'N/A'})
                  </span>
                ))}
              </div>
            )}

            {/* Signatures & Security Footer */}
            <div className="pt-8 flex flex-col sm:flex-row items-end justify-between gap-6 relative z-10">
              {transcriptSettings.showQRCode && (
                <div className="flex items-center gap-3 p-3 rounded-xl bg-purple-50/70 border border-purple-200/80">
                  <div className="p-2 bg-white rounded-lg border border-purple-200">
                    <QrCode className="w-10 h-10 text-purple-800" />
                  </div>
                  <div className="text-[10px] text-purple-900 space-y-0.5">
                    <div className="font-bold">Digital Tamper-Proof Hash</div>
                    <div className="font-mono text-slate-500">SHA256: 8f9b2...4e1a</div>
                    <div className="text-emerald-700 font-bold">Online Verified Board Record</div>
                  </div>
                </div>
              )}

              {transcriptSettings.showSignatures && (
                <div className="flex items-center gap-8 text-center text-xs">
                  <div className="space-y-1">
                    <div className="w-32 border-b border-slate-700 mx-auto" />
                    <span className="font-bold text-slate-800 block text-[11px]">{transcriptSettings.registrarTitle}</span>
                    <span className="text-[10px] text-slate-400">Head Office Board</span>
                  </div>
                  <div className="space-y-1">
                    <div className="w-32 border-b border-slate-700 mx-auto" />
                    <span className="font-bold text-slate-800 block text-[11px]">{transcriptSettings.principalTitle}</span>
                    <span className="text-[10px] text-slate-400">Official Campus Seal</span>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ==================================================================== */}
      {/* 7. EXAMINATION REPORTS & MASTER TABULATION SHEET                      */}
      {/* ==================================================================== */}
      {currentTab === 'reports' && (
        <div className="space-y-6 no-print">
          {/* Top KPI Cards (Dynamically Recalculated by Campus Filter) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-2xs space-y-2">
              <span className="text-xs font-bold text-slate-500 uppercase">Filtered Pass Rate</span>
              <div className="text-3xl font-extrabold font-mono text-emerald-700">{dynamicReportStats.passRate}</div>
              <p className="text-[11px] text-slate-400">
                {tabulationCampusFilter === 'all' ? 'Network aggregate' : `Scoped to ${tabulationCampusFilter}`}
              </p>
            </div>
            <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-2xs space-y-2">
              <span className="text-xs font-bold text-slate-500 uppercase">Board Merit Positions</span>
              <div className="text-3xl font-extrabold font-mono text-purple-700">{dynamicReportStats.positions} Positions</div>
              <p className="text-[11px] text-slate-400">Achieved in Matriculation and Intermediate.</p>
            </div>
            <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-2xs space-y-2">
              <span className="text-xs font-bold text-slate-500 uppercase">Examinees Count</span>
              <div className="text-3xl font-extrabold font-mono text-indigo-700">{dynamicReportStats.totalExaminees}</div>
              <p className="text-[11px] text-slate-400">Active students appeared in examination.</p>
            </div>
            <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-2xs space-y-2">
              <span className="text-xs font-bold text-slate-500 uppercase">Average Scoped GPA</span>
              <div className="text-3xl font-extrabold font-mono text-blue-700">{dynamicReportStats.avgGpa} / 4.0</div>
              <p className="text-[11px] text-slate-400">Calculated across selected candidates.</p>
            </div>
          </div>

          {/* Subject Deficiency Advisory Trigger Section */}
          <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-2xs space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-amber-600" />
                <h3 className="text-sm font-bold text-slate-900">Academic Deficiency & Failure Risk Hotspots</h3>
              </div>
              <span className="text-xs text-slate-400">Network pedagogical audit</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {[
                { name: 'Advanced Mathematics (Class 9-10)', failRate: '12.5%', affected: 40, status: 'High Alert' },
                { name: 'Calculus & Analytical Geometry (College)', failRate: '15.9%', affected: 38, status: 'High Alert' },
                { name: 'Physics Theory (Pre-Board)', failRate: '9.8%', affected: 24, status: 'Moderate Concern' }
              ].map((def, dIdx) => (
                <div key={dIdx} className="p-3.5 rounded-xl border border-amber-200 bg-amber-50/50 space-y-2">
                  <div className="flex justify-between items-start">
                    <span className="font-bold text-xs text-slate-900">{def.name}</span>
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-800">
                      {def.failRate} Fail
                    </span>
                  </div>
                  <div className="text-[11px] text-slate-600">Affected Candidates: <strong>{def.affected}</strong></div>
                  <button
                    type="button"
                    onClick={() => handleIssueAdvisory(def.name)}
                    className="w-full py-1.5 bg-amber-600 hover:bg-amber-700 text-white rounded-lg text-xs font-bold cursor-pointer transition-colors"
                  >
                    Issue Academic Review Advisory
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Position Holders Spotlight */}
          <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-2xs space-y-4">
            <div className="flex items-center gap-2">
              <Award className="w-4 h-4 text-purple-600" />
              <h3 className="text-sm font-bold text-slate-900">Network Board Merit Position Holders</h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {positionHolders.map((pos, idx) => (
                <div key={idx} className="p-4 rounded-xl border border-slate-200/80 bg-gradient-to-br from-slate-50 to-purple-50/30 space-y-2">
                  <div className="flex justify-between items-start">
                    <span className="font-bold text-xs text-slate-900">{pos.name}</span>
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                      pos.position === 1 ? 'bg-amber-100 text-amber-800 border border-amber-300' :
                      pos.position === 2 ? 'bg-slate-200 text-slate-800' : 'bg-orange-100 text-orange-800'
                    }`}>
                      #{pos.position} Position
                    </span>
                  </div>
                  <div className="text-xs text-slate-500">{pos.campus}</div>
                  <div className="pt-2 border-t border-slate-200 flex justify-between font-mono text-xs">
                    <span className="text-purple-700 font-bold">{pos.total}/{pos.max} ({pos.pct}%)</span>
                    <span className="text-emerald-700 font-bold">GPA: {pos.gpa.toFixed(2)}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Master Tabulation Sheet */}
          <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-2xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h3 className="text-sm font-bold text-slate-900">Platform Master Tabulation Gazette</h3>
                <p className="text-xs text-slate-500">Live candidate-level marksheet records across sister institutes.</p>
              </div>

              <div className="flex flex-wrap items-center gap-3">
                <div className="relative min-w-[200px]">
                  <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
                  <input
                    type="text"
                    placeholder="Search candidate..."
                    value={tabulationSearchQuery}
                    onChange={(e) => setTabulationSearchQuery(e.target.value)}
                    className="w-full pl-8 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-purple-500"
                  />
                </div>

                <select
                  value={tabulationCampusFilter}
                  onChange={(e) => setTabulationCampusFilter(e.target.value)}
                  className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 text-xs text-slate-700 font-medium focus:outline-purple-500"
                >
                  <option value="all">All Campuses</option>
                  {campusOptions.map((c, i) => (
                    <option key={i} value={c}>{c}</option>
                  ))}
                </select>

                <button
                  type="button"
                  onClick={() => setShowTabulationRegisterModal(true)}
                  className="px-3 py-1.5 bg-white hover:bg-slate-100 text-purple-700 border border-purple-200 rounded-xl text-xs font-bold shadow-2xs cursor-pointer inline-flex items-center gap-1.5"
                >
                  <FileSpreadsheet className="w-3.5 h-3.5" />
                  <span>Official Tabulation Register</span>
                </button>

                <button
                  type="button"
                  onClick={handleExportMasterGazette}
                  className="px-3 py-1.5 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-xs font-bold shadow-2xs cursor-pointer inline-flex items-center gap-1.5"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Download Gazette</span>
                </button>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-600">
                <thead className="bg-slate-50 border-b border-slate-100 font-bold text-slate-700 uppercase tracking-wider text-[11px]">
                  <tr>
                    <th className="py-2.5 px-3">Roll No</th>
                    <th className="py-2.5 px-3">Student Name</th>
                    <th className="py-2.5 px-3">Campus & Wing</th>
                    <th className="py-2.5 px-3 text-center">Marks (Obt / Max)</th>
                    <th className="py-2.5 px-3 text-center">Percentage</th>
                    <th className="py-2.5 px-3 text-center">GPA</th>
                    <th className="py-2.5 px-3 text-center">Grade</th>
                    <th className="py-2.5 px-3 text-right">Result Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredTabulationRecords.map((rec, idx) => (
                    <tr key={idx} className="hover:bg-slate-50/70">
                      <td className="py-2.5 px-3 font-mono font-bold text-purple-700">{rec.roll}</td>
                      <td className="py-2.5 px-3 font-semibold text-slate-900">{rec.name}</td>
                      <td className="py-2.5 px-3">
                        <div className="text-slate-800">{rec.campus}</div>
                        <span className="text-[10px] text-slate-400">{rec.wing}</span>
                      </td>
                      <td className="py-2.5 px-3 text-center font-mono font-medium">
                        {rec.total} / {rec.max}
                      </td>
                      <td className="py-2.5 px-3 text-center font-mono font-bold text-slate-900">
                        {rec.pct}%
                      </td>
                      <td className="py-2.5 px-3 text-center font-mono font-bold text-emerald-700">
                        {rec.gpa.toFixed(2)}
                      </td>
                      <td className="py-2.5 px-3 text-center">
                        <span className="px-2 py-0.5 rounded-md bg-purple-50 text-purple-700 font-mono font-bold text-[10px] border border-purple-200">
                          {rec.grade}
                        </span>
                      </td>
                      <td className="py-2.5 px-3 text-right">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          rec.status === 'Pass' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' :
                          'bg-amber-50 text-amber-700 border border-amber-200'
                        }`}>
                          {rec.status}
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

      {/* ==================================================================== */}
      {/* MODAL 1: ADD/EDIT GRADE BOUNDARY MODAL                                */}
      {/* ==================================================================== */}
      {showAddBandModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs no-print">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full shadow-2xl space-y-4 border border-slate-200">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-base font-bold text-slate-900">
                {editingBandIndex !== null ? 'Edit Grade Boundary' : 'Add New Grade Threshold'}
              </h3>
              <button
                type="button"
                onClick={() => setShowAddBandModal(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="font-bold text-slate-700 block mb-1">Grade Letter / Code</label>
                <input
                  type="text"
                  placeholder="e.g. A+, A, B-, 1st Division"
                  value={bandFormData.grade}
                  onChange={(e) => setBandFormData({ ...bandFormData, grade: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-bold font-mono focus:outline-purple-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Min Score %</label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={bandFormData.min}
                    onChange={(e) => setBandFormData({ ...bandFormData, min: Number(e.target.value) })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-mono focus:outline-purple-500"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Max Score %</label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={bandFormData.max}
                    onChange={(e) => setBandFormData({ ...bandFormData, max: Number(e.target.value) })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-mono focus:outline-purple-500"
                  />
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">GPA Equivalent Point</label>
                <input
                  type="number"
                  step="0.05"
                  min="0"
                  max="4.0"
                  value={bandFormData.gpa}
                  onChange={(e) => setBandFormData({ ...bandFormData, gpa: Number(e.target.value) })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-mono focus:outline-purple-500"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Description / Quality Remarks</label>
                <input
                  type="text"
                  placeholder="e.g. Distinction, Exceptional, Pass"
                  value={bandFormData.description}
                  onChange={(e) => setBandFormData({ ...bandFormData, description: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-purple-500"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setShowAddBandModal(false)}
                className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSaveCustomBand}
                className="px-4 py-2 rounded-xl text-xs font-bold bg-purple-600 hover:bg-purple-700 text-white cursor-pointer shadow-md"
              >
                Save Boundary
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ==================================================================== */}
      {/* MODAL 2: CONFIRM RESULT FREEZE / UNLOCK MODAL                         */}
      {/* ==================================================================== */}
      {freezeModalTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs no-print">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full shadow-2xl space-y-4 border border-slate-200">
            <div className="flex items-center gap-3">
              <div className={`p-3 rounded-2xl ${freezeModalTarget.isFrozen ? 'bg-amber-100 text-amber-700' : 'bg-rose-100 text-rose-700'}`}>
                {freezeModalTarget.isFrozen ? <Unlock className="w-6 h-6" /> : <Lock className="w-6 h-6" />}
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900">
                  {freezeModalTarget.isFrozen ? 'Unlock Examination Result' : 'Freeze & Lock Result'}
                </h3>
                <p className="text-xs text-slate-500">{freezeModalTarget.campus} ({freezeModalTarget.wing})</p>
              </div>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed">
              {freezeModalTarget.isFrozen 
                ? 'Unlocking this result allows teachers and campus coordinators to edit marks. This will be recorded in the security audit log.'
                : 'Freezing this result prevents any unauthorized score modifications. Any subsequent change will require Superadmin approval.'}
            </p>

            <div>
              <label className="font-bold text-xs text-slate-700 block mb-1">
                Reason / Authority Justification
              </label>
              <textarea
                rows="2"
                placeholder="Enter justification note for audit log..."
                value={freezeReason}
                onChange={(e) => setFreezeReason(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-purple-500"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setFreezeModalTarget(null)}
                className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleToggleFreezeConfirm}
                className={`px-4 py-2 rounded-xl text-xs font-bold text-white cursor-pointer shadow-md ${
                  freezeModalTarget.isFrozen ? 'bg-rose-600 hover:bg-rose-700' : 'bg-emerald-600 hover:bg-emerald-700'
                }`}
              >
                Confirm {freezeModalTarget.isFrozen ? 'Unlock' : 'Freeze'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ==================================================================== */}
      {/* MODAL 3: ADD NEW EXAM TERM LOCKOUT                                   */}
      {/* ==================================================================== */}
      {showAddLockoutModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs no-print">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full shadow-2xl space-y-4 border border-slate-200">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-base font-bold text-slate-900">Add Exam Term Lockout Session</h3>
              <button
                type="button"
                onClick={() => setShowAddLockoutModal(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="font-bold text-slate-700 block mb-1">Campus</label>
                <select
                  value={newLockoutForm.campus}
                  onChange={(e) => setNewLockoutForm({ ...newLockoutForm, campus: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-purple-500"
                >
                  {campusOptions.map((c, i) => (
                    <option key={i} value={c}>{c}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Wing</label>
                <select
                  value={newLockoutForm.wing}
                  onChange={(e) => setNewLockoutForm({ ...newLockoutForm, wing: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-purple-500"
                >
                  <option value="Elementary & Primary Wing">Elementary & Primary Wing</option>
                  <option value="Middle Wing">Middle Wing</option>
                  <option value="High School Wing">High School Wing</option>
                  <option value="College Wing">College Wing</option>
                </select>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Exam Term Name</label>
                <input
                  type="text"
                  placeholder="e.g. Annual Final Board 2026"
                  value={newLockoutForm.examTerm}
                  onChange={(e) => setNewLockoutForm({ ...newLockoutForm, examTerm: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-purple-500"
                />
              </div>

              <div className="flex items-center gap-3 pt-2">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={newLockoutForm.isFrozen}
                    onChange={(e) => setNewLockoutForm({ ...newLockoutForm, isFrozen: e.target.checked })}
                    className="w-4 h-4 accent-purple-600 rounded"
                  />
                  <span className="font-bold text-slate-700">Immediate Freeze & Lock</span>
                </label>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setShowAddLockoutModal(false)}
                className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleAddLockoutSession}
                className="px-4 py-2 rounded-xl text-xs font-bold bg-purple-600 hover:bg-purple-700 text-white cursor-pointer shadow-md"
              >
                Register Lockout
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ==================================================================== */}
      {/* MODAL 4: VIEW GRADE EVIDENCE & SCRIPT MODAL (WITH LIGHTBOX)          */}
      {/* ==================================================================== */}
      {showEvidenceModal && selectedGradeItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs no-print">
          <div className="bg-white rounded-3xl p-6 max-w-lg w-full shadow-2xl space-y-4 border border-slate-200">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <FileText className="w-5 h-5 text-purple-600" />
                <h3 className="text-base font-bold text-slate-900">Re-checking Evidence Inspection</h3>
              </div>
              <button
                type="button"
                onClick={() => setShowEvidenceModal(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="p-3 rounded-xl bg-purple-50/60 border border-purple-100 space-y-1">
                <div className="flex justify-between font-bold text-purple-900">
                  <span>Candidate: {selectedGradeItem.student} ({selectedGradeItem.roll})</span>
                  <span>{selectedGradeItem.paperCode}</span>
                </div>
                <div className="text-slate-600">{selectedGradeItem.subject} • {selectedGradeItem.campus}</div>
              </div>

              <div className="grid grid-cols-2 gap-3 p-3 rounded-xl bg-slate-50 border border-slate-200">
                <div>
                  <span className="text-slate-400 block text-[10px] uppercase font-bold">Recorded Original Marks</span>
                  <span className="text-xl font-bold font-mono text-slate-600 line-through">{selectedGradeItem.originalMarks}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px] uppercase font-bold">Post-Audit Score</span>
                  <span className="text-xl font-bold font-mono text-emerald-700">➔ {selectedGradeItem.requestedMarks}</span>
                </div>
              </div>

              {/* Simulated Scanned Paper Inspection Box */}
              <div className="p-3 rounded-xl border border-slate-200 bg-slate-900 text-white space-y-2">
                <div className="flex items-center justify-between text-[11px] text-slate-400 border-b border-slate-800 pb-1.5">
                  <div className="flex items-center gap-1.5">
                    <ZoomIn className="w-3.5 h-3.5 text-purple-400" />
                    <span>Scanned Manuscript Lightbox View</span>
                  </div>
                  <span className="font-mono text-emerald-400">RESOLUTION: 300 DPI OPTICAL</span>
                </div>
                <div className="p-3 rounded bg-slate-800/80 font-mono text-[10px] text-slate-300 leading-relaxed space-y-1">
                  <div>[EXAM_PAPER_HEADER: {selectedGradeItem.paperCode}]</div>
                  <div>PAGE 5: Q4 Totaling verification stamp: Verified +8 marks clerical miscount.</div>
                  <div className="text-emerald-400 font-bold">STAMP: [OFFICIALLY RE-TOTALED & INITIALED BY HEAD EXAMINER]</div>
                </div>
              </div>

              <div className="space-y-1">
                <span className="font-bold text-slate-700 block">Teacher / HoD Justification Note:</span>
                <p className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-700 leading-relaxed">
                  {selectedGradeItem.reason}
                </p>
              </div>

              <div className="text-[11px] text-slate-400 pt-1">
                Requested by: <strong>{selectedGradeItem.requestedBy}</strong> on {selectedGradeItem.requestedAt}
              </div>
            </div>

            <div className="flex justify-end pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setShowEvidenceModal(false)}
                className="px-4 py-2 rounded-xl text-xs font-bold bg-slate-900 text-white cursor-pointer"
              >
                Close Inspection
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ==================================================================== */}
      {/* MODAL 5: AUTHORIZE GRADE CHANGE MODAL                                 */}
      {/* ==================================================================== */}
      {showApprovalRemarksModal && selectedGradeItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs no-print">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full shadow-2xl space-y-4 border border-slate-200">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-2xl bg-emerald-100 text-emerald-700">
                <Check className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900">Authorize Grade Rectification</h3>
                <p className="text-xs text-slate-500">{selectedGradeItem.student} ({selectedGradeItem.roll})</p>
              </div>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed">
              Confirming this will amend the official student score from <strong>{selectedGradeItem.originalMarks}</strong> to <strong>{selectedGradeItem.requestedMarks}</strong> in the Central Master Gazette and synchronize with student marksheets.
            </p>

            <div>
              <label className="font-bold text-xs text-slate-700 block mb-1">Superadmin Authorization Remarks</label>
              <textarea
                rows="2"
                placeholder="e.g. Scanned manuscript verified; clerical totaling error accepted."
                value={superadminRemarks}
                onChange={(e) => setSuperadminRemarks(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-purple-500"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setShowApprovalRemarksModal(false)}
                className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleApproveGradeAction}
                className="px-4 py-2 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white cursor-pointer shadow-md"
              >
                Confirm Authorization
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ==================================================================== */}
      {/* MODAL 6: REJECT GRADE CHANGE MODAL                                   */}
      {/* ==================================================================== */}
      {showRejectionModal && selectedGradeItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs no-print">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full shadow-2xl space-y-4 border border-slate-200">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-2xl bg-rose-100 text-rose-700">
                <X className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900">Decline Grade Change Request</h3>
                <p className="text-xs text-slate-500">{selectedGradeItem.student} ({selectedGradeItem.roll})</p>
              </div>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed">
              Please provide mandatory regulatory remarks stating why this grade alteration cannot be permitted.
            </p>

            <div>
              <label className="font-bold text-xs text-slate-700 block mb-1">
                Rejection Grounds <span className="text-rose-500">*</span>
              </label>
              <textarea
                rows="2"
                placeholder="e.g. Scanned script exhibits tampering / no calculation discrepancy found."
                value={superadminRemarks}
                onChange={(e) => setSuperadminRemarks(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-rose-500"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setShowRejectionModal(false)}
                className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleRejectGradeAction}
                className="px-4 py-2 rounded-xl text-xs font-bold bg-rose-600 hover:bg-rose-700 text-white cursor-pointer shadow-md"
              >
                Confirm Rejection
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ==================================================================== */}
      {/* MODAL 7: REGISTER SUPPLEMENTARY CANDIDATE                             */}
      {/* ==================================================================== */}
      {showAddSupplementaryModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs no-print">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full shadow-2xl space-y-4 border border-slate-200">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-base font-bold text-slate-900">Enroll Supplementary Candidate</h3>
              <button
                type="button"
                onClick={() => setShowAddSupplementaryModal(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Student Name</label>
                  <input
                    type="text"
                    placeholder="e.g. Ali Ahmed"
                    value={newSuppForm.student}
                    onChange={(e) => setNewSuppForm({ ...newSuppForm, student: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-purple-500"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Roll Number</label>
                  <input
                    type="text"
                    placeholder="e.g. BHS-108"
                    value={newSuppForm.roll}
                    onChange={(e) => setNewSuppForm({ ...newSuppForm, roll: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-mono focus:outline-purple-500"
                  />
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Campus</label>
                <select
                  value={newSuppForm.campus}
                  onChange={(e) => setNewSuppForm({ ...newSuppForm, campus: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-purple-500"
                >
                  {campusOptions.map((c, i) => (
                    <option key={i} value={c}>{c}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Wing</label>
                <select
                  value={newSuppForm.wing}
                  onChange={(e) => setNewSuppForm({ ...newSuppForm, wing: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-purple-500"
                >
                  <option value="Elementary & Primary Wing">Elementary & Primary Wing</option>
                  <option value="Middle Wing">Middle Wing</option>
                  <option value="High School Wing">High School Wing</option>
                  <option value="College Wing">College Wing</option>
                </select>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Failed Subject(s)</label>
                <input
                  type="text"
                  placeholder="e.g. Mathematics, Physics"
                  value={newSuppForm.failedSubject}
                  onChange={(e) => setNewSuppForm({ ...newSuppForm, failedSubject: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-purple-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Fee Amount</label>
                  <input
                    type="text"
                    value={newSuppForm.feeAmount}
                    onChange={(e) => setNewSuppForm({ ...newSuppForm, feeAmount: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-purple-500 font-mono"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Fee Status</label>
                  <select
                    value={newSuppForm.feeStatus}
                    onChange={(e) => setNewSuppForm({ ...newSuppForm, feeStatus: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-purple-500"
                  >
                    <option value="Unpaid">Unpaid</option>
                    <option value="Paid">Paid</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setShowAddSupplementaryModal(false)}
                className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleRegisterSupplementary}
                className="px-4 py-2 rounded-xl text-xs font-bold bg-purple-600 hover:bg-purple-700 text-white cursor-pointer shadow-md"
              >
                Register Candidate
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ==================================================================== */}
      {/* MODAL 8: SUPPLEMENTARY ADMIT CARD MODAL                               */}
      {/* ==================================================================== */}
      {selectedSuppAdmitCard && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs no-print">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full shadow-2xl space-y-4 border border-slate-200">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <Printer className="w-5 h-5 text-purple-600" />
                <h3 className="text-base font-bold text-slate-900">Supplementary Exam Admit Card</h3>
              </div>
              <button
                type="button"
                onClick={() => setSelectedSuppAdmitCard(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-4 rounded-2xl border border-slate-300 bg-slate-50 space-y-3 text-xs">
              <div className="text-center pb-2 border-b border-slate-200">
                <div className="text-[10px] font-bold uppercase text-purple-700">Official Retake Permission Slip</div>
                <div className="text-sm font-extrabold text-slate-900">{selectedSuppAdmitCard.student}</div>
                <div className="font-mono text-slate-500">{selectedSuppAdmitCard.roll}</div>
              </div>

              <div className="grid grid-cols-2 gap-2 text-[11px]">
                <div>
                  <span className="text-slate-400 block text-[10px]">Campus:</span>
                  <span className="font-bold text-slate-800">{selectedSuppAdmitCard.campus}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px]">Exam Date:</span>
                  <span className="font-bold text-slate-800 font-mono">{selectedSuppAdmitCard.examDate}</span>
                </div>
                <div className="col-span-2">
                  <span className="text-slate-400 block text-[10px]">Examination Center:</span>
                  <span className="font-bold text-purple-900">{selectedSuppAdmitCard.center}</span>
                </div>
                <div className="col-span-2">
                  <span className="text-slate-400 block text-[10px]">Permitted Compartment Subject(s):</span>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {selectedSuppAdmitCard.failedSubjects.map((sub, i) => (
                      <span key={i} className="px-2 py-0.5 rounded bg-purple-100 text-purple-800 font-bold text-[10px]">
                        {sub}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              <div className="pt-2 border-t border-slate-200 flex justify-between items-center text-[10px]">
                <span className="text-emerald-700 font-bold">Fee Status: {selectedSuppAdmitCard.feeStatus}</span>
                <span className="text-slate-400 font-mono">Issued by Superadmin</span>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setSelectedSuppAdmitCard(null)}
                className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 cursor-pointer"
              >
                Close
              </button>
              <button
                type="button"
                onClick={() => window.print()}
                className="px-4 py-2 rounded-xl text-xs font-bold bg-purple-600 hover:bg-purple-700 text-white cursor-pointer shadow-md inline-flex items-center gap-1.5"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>Print Admit Card</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ==================================================================== */}
      {/* MODAL 9: AUDIT LOGS FOR FREEZE / UNLOCK HISTORY                       */}
      {/* ==================================================================== */}
      {showFreezeHistoryModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs no-print">
          <div className="bg-white rounded-3xl p-6 max-w-lg w-full shadow-2xl space-y-4 border border-slate-200">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <History className="w-5 h-5 text-purple-600" />
                <h3 className="text-base font-bold text-slate-900">Result Lockout Security Audit Logs</h3>
              </div>
              <button
                type="button"
                onClick={() => setShowFreezeHistoryModal(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-2 max-h-80 overflow-y-auto dark-scroll text-xs">
              {freezeLogs.map((log, idx) => (
                <div key={idx} className="p-3 rounded-xl border border-slate-200 bg-slate-50 space-y-1">
                  <div className="flex justify-between items-center">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                      log.action === 'LOCKED' ? 'bg-rose-100 text-rose-800' : 'bg-emerald-100 text-emerald-800'
                    }`}>
                      {log.action}
                    </span>
                    <span className="font-mono text-slate-400 text-[10px]">{log.timestamp}</span>
                  </div>
                  <div className="font-bold text-slate-800">{log.campus} ({log.wing})</div>
                  <div className="text-slate-600 text-[11px]">{log.note}</div>
                  <div className="text-[10px] text-slate-400">Authorized by: <strong>{log.author}</strong></div>
                </div>
              ))}
            </div>

            <div className="flex justify-end pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setShowFreezeHistoryModal(false)}
                className="px-4 py-2 rounded-xl text-xs font-bold bg-slate-900 text-white cursor-pointer"
              >
                Close Audit Logs
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ==================================================================== */}
      {/* MODAL 10: CLASS / SECTION DRILLDOWN MODAL                            */}
      {/* ==================================================================== */}
      {selectedClassDrilldown && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs no-print">
          <div className="bg-white rounded-3xl p-6 max-w-lg w-full shadow-2xl space-y-4 border border-slate-200">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-base font-bold text-slate-900">{selectedClassDrilldown.wing}</h3>
                <span className="text-xs text-slate-400">Class & Section Comparative Breakdown</span>
              </div>
              <button
                type="button"
                onClick={() => setSelectedClassDrilldown(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              {selectedClassDrilldown.classes.map((cls, idx) => (
                <div key={idx} className="p-3 rounded-xl border border-slate-200 bg-slate-50 space-y-1.5">
                  <div className="flex justify-between items-center font-bold text-slate-800">
                    <span>{cls.name}</span>
                    <span className="text-purple-700 font-mono">{cls.passRate}% Pass</span>
                  </div>
                  <div className="flex justify-between text-slate-500 text-[11px]">
                    <span>Enrolled: {cls.students} Candidates</span>
                    <span>Top Class Score: {cls.topScore}%</span>
                  </div>
                  <div className="w-full bg-slate-200 rounded-full h-1.5 overflow-hidden">
                    <div className="bg-purple-600 h-1.5 rounded-full" style={{ width: `${cls.passRate}%` }} />
                  </div>
                </div>
              ))}
            </div>

            <div className="flex justify-end pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setSelectedClassDrilldown(null)}
                className="px-4 py-2 rounded-xl text-xs font-bold bg-slate-900 text-white cursor-pointer"
              >
                Close Drilldown
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ==================================================================== */}
      {/* MODAL 11: FORMAL TABULATION REGISTER (TR) SHEET MODAL                */}
      {/* ==================================================================== */}
      {showTabulationRegisterModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs no-print">
          <div className="bg-white rounded-3xl p-6 max-w-4xl w-full shadow-2xl space-y-4 border border-slate-200">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <FileSpreadsheet className="w-5 h-5 text-purple-600" />
                <div>
                  <h3 className="text-base font-bold text-slate-900">Official Master Tabulation Register (TR)</h3>
                  <span className="text-xs text-slate-400">Board Compliant Tabulated Gazette</span>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => window.print()}
                  className="px-3 py-1.5 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-xs font-bold cursor-pointer inline-flex items-center gap-1 shadow-2xs"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>Print TR</span>
                </button>
                <button
                  type="button"
                  onClick={() => setShowTabulationRegisterModal(false)}
                  className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            <div className="overflow-x-auto max-h-96 dark-scroll">
              <table className="w-full text-left text-xs text-slate-700 border border-slate-200">
                <thead className="bg-slate-100 border-b border-slate-300 font-bold uppercase tracking-wider text-[10px] text-slate-800">
                  <tr>
                    <th className="py-2.5 px-3 border-r border-slate-200">Roll No</th>
                    <th className="py-2.5 px-3 border-r border-slate-200">Student Name</th>
                    <th className="py-2.5 px-3 border-r border-slate-200">Campus</th>
                    <th className="py-2.5 px-3 border-r border-slate-200">Wing</th>
                    <th className="py-2.5 px-3 text-center border-r border-slate-200">Total</th>
                    <th className="py-2.5 px-3 text-center border-r border-slate-200">%</th>
                    <th className="py-2.5 px-3 text-center border-r border-slate-200">GPA</th>
                    <th className="py-2.5 px-3 text-center border-r border-slate-200">Grade</th>
                    <th className="py-2.5 px-3 text-right">Result</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {filteredTabulationRecords.map((r, i) => (
                    <tr key={i} className="hover:bg-slate-50">
                      <td className="py-2 px-3 font-mono font-bold border-r border-slate-200 text-purple-700">{r.roll}</td>
                      <td className="py-2 px-3 font-semibold border-r border-slate-200 text-slate-900">{r.name}</td>
                      <td className="py-2 px-3 border-r border-slate-200 text-slate-600">{r.campus}</td>
                      <td className="py-2 px-3 border-r border-slate-200 text-slate-600">{r.wing}</td>
                      <td className="py-2 px-3 text-center font-mono border-r border-slate-200">{r.total}/{r.max}</td>
                      <td className="py-2 px-3 text-center font-mono font-bold border-r border-slate-200">{r.pct}%</td>
                      <td className="py-2 px-3 text-center font-mono text-emerald-700 border-r border-slate-200">{r.gpa.toFixed(2)}</td>
                      <td className="py-2 px-3 text-center font-bold text-purple-700 border-r border-slate-200">{r.grade}</td>
                      <td className="py-2 px-3 text-right font-bold text-emerald-700">{r.status}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="flex justify-between items-center text-xs text-slate-400 pt-2 border-t border-slate-100">
              <span>Official University & Board Accreditation Register</span>
              <span>Total Tabulated Records: {filteredTabulationRecords.length}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default SuperadminExaminationsResultsView
