import React, { useState, useMemo, useEffect } from 'react'
import { 
  UserPlus, 
  Calendar, 
  Award, 
  Layers, 
  DollarSign, 
  LayoutDashboard, 
  Plus, 
  Search, 
  CheckCircle2, 
  Clock, 
  Building2, 
  Download, 
  Sparkles, 
  TrendingUp, 
  FileCheck, 
  Check, 
  Edit2, 
  X,
  Trash2,
  AlertTriangle,
  Sliders,
  Filter,
  ArrowUpRight,
  Lock,
  Unlock,
  FileSpreadsheet,
  Users,
  Percent,
  ShieldAlert,
  CreditCard,
  ArrowRight
} from 'lucide-react'
import { useAppData } from '../../../context/AppDataContext'
import { useToast } from '../../../context/ToastContext'

// LocalStorage Keys for Enterprise Persistence
const CYCLES_KEY = 'edu_sms_admission_cycles'
const MERIT_KEY = 'edu_sms_merit_policies'
const SEATS_KEY = 'edu_sms_seat_matrix'
const FEES_KEY = 'edu_sms_application_fee_tariffs'
const FREEZE_KEY = 'edu_sms_admissions_freeze'

// Default Initial Data
const DEFAULT_CYCLES = [
  { id: 'CYC-2026-F', name: 'Fall 2026 Admissions Intake', campusScope: 'All Campuses (Central)', startDate: '2026-06-01', endDate: '2026-08-31', status: 'Active (Open)', capacity: 500, applications: 384 },
  { id: 'CYC-2027-S', name: 'Spring 2027 Lateral Entry', campusScope: 'High School & College Wings', startDate: '2026-11-15', endDate: '2027-01-10', status: 'Scheduled', capacity: 250, applications: 45 }
]

const DEFAULT_MERIT_POLICIES = [
  { 
    id: 'MER-01',
    wing: 'Kindergarten & Primary Wing', 
    minPercentage: 50, 
    testWeight: 40, 
    interviewWeight: 60, 
    pastAcademicWeight: 0, 
    status: 'Published',
    openMeritQuota: 80,
    siblingQuota: 10,
    sportsQuota: 5,
    staffQuota: 5
  },
  { 
    id: 'MER-02',
    wing: 'Middle & High School', 
    minPercentage: 60, 
    testWeight: 50, 
    interviewWeight: 20, 
    pastAcademicWeight: 30, 
    status: 'Published',
    openMeritQuota: 75,
    siblingQuota: 10,
    sportsQuota: 10,
    staffQuota: 5
  },
  { 
    id: 'MER-03',
    wing: 'College & Higher Secondary', 
    minPercentage: 70, 
    testWeight: 60, 
    interviewWeight: 15, 
    pastAcademicWeight: 25, 
    status: 'Published',
    openMeritQuota: 70,
    siblingQuota: 10,
    sportsQuota: 10,
    staffQuota: 10
  }
]

const DEFAULT_SEAT_MATRIX = [
  { id: 'SM-01', campus: 'Beaconhouse Central High School', instituteId: 'inst-1', wing: 'Primary Wing', totalCapacity: 250, filledSeats: 210, waitlist: 15 },
  { id: 'SM-02', campus: 'Beaconhouse Central High School', instituteId: 'inst-1', wing: 'High School', totalCapacity: 300, filledSeats: 285, waitlist: 28 },
  { id: 'SM-03', campus: 'City School Model Town Campus', instituteId: 'inst-2', wing: 'Middle Wing', totalCapacity: 200, filledSeats: 160, waitlist: 8 },
  { id: 'SM-04', campus: 'Roots International College & Academy', instituteId: 'inst-3', wing: 'College Wing', totalCapacity: 180, filledSeats: 175, waitlist: 42 },
  { id: 'SM-05', campus: 'Institute of Applied Sciences & Undergraduates', instituteId: 'inst-4', wing: 'Undergraduate Wing', totalCapacity: 150, filledSeats: 130, waitlist: 22 }
]

const DEFAULT_FEE_SETTINGS = [
  { 
    id: 'FEE-01',
    tier: 'Primary Wing', 
    prospectusFee: 1500, 
    processingFee: 1000, 
    testFee: 500, 
    lateSurcharge: 500,
    status: 'Standard',
    gateways: ['Bank Challan', '1Link 1Bill', 'JazzCash'],
    siblingDiscount: 25
  },
  { 
    id: 'FEE-02',
    tier: 'Middle & High School', 
    prospectusFee: 2000, 
    processingFee: 1500, 
    testFee: 1000, 
    lateSurcharge: 750,
    status: 'Standard',
    gateways: ['Bank Challan', '1Link 1Bill', 'Kuickpay'],
    siblingDiscount: 25
  },
  { 
    id: 'FEE-03',
    tier: 'College / Pre-Medical / Pre-Eng', 
    prospectusFee: 3000, 
    processingFee: 2000, 
    testFee: 1500, 
    lateSurcharge: 1000,
    status: 'Standard',
    gateways: ['Bank Challan', '1Link 1Bill', 'Kuickpay', 'EasyPaisa'],
    siblingDiscount: 20
  }
]

// Formula-neutralized CSV sanitizer (=, +, -, @, \t, \r)
const sanitizeCSV = (val) => {
  if (val === null || val === undefined) return '""'
  let str = String(val)
  if (/^[=\+\-@\t\r]/.test(str)) {
    str = "'" + str
  }
  return '"' + str.replace(/"/g, '""') + '"'
}

export const SuperadminAdmissionsView = ({ activeTab = 'overview', onTabChange = () => {} }) => {
  const { institutes = [], admissionsPipeline = [], updateItem, logAuditEvent } = useAppData()
  const { toast } = useToast()

  // 1. Reactive Tab Synchronization with Sidebar Route
  const [currentTab, setCurrentTab] = useState(activeTab)

  useEffect(() => {
    if (activeTab) {
      setCurrentTab(activeTab)
    }
  }, [activeTab])

  const effectiveTab = currentTab || activeTab || 'overview'

  const handleTabSwitch = (tabKey) => {
    setCurrentTab(tabKey)
    onTabChange(tabKey)
  }

  // 2. Persistent States
  const [cycles, setCycles] = useState(() => {
    try {
      const stored = localStorage.getItem(CYCLES_KEY)
      return stored ? JSON.parse(stored) : DEFAULT_CYCLES
    } catch {
      return DEFAULT_CYCLES
    }
  })

  const [meritPolicies, setMeritPolicies] = useState(() => {
    try {
      const stored = localStorage.getItem(MERIT_KEY)
      return stored ? JSON.parse(stored) : DEFAULT_MERIT_POLICIES
    } catch {
      return DEFAULT_MERIT_POLICIES
    }
  })

  const [seatMatrix, setSeatMatrix] = useState(() => {
    try {
      const stored = localStorage.getItem(SEATS_KEY)
      return stored ? JSON.parse(stored) : DEFAULT_SEAT_MATRIX
    } catch {
      return DEFAULT_SEAT_MATRIX
    }
  })

  const [feeSettings, setFeeSettings] = useState(() => {
    try {
      const stored = localStorage.getItem(FEES_KEY)
      return stored ? JSON.parse(stored) : DEFAULT_FEE_SETTINGS
    } catch {
      return DEFAULT_FEE_SETTINGS
    }
  })

  const [isIntakeFrozen, setIsIntakeFrozen] = useState(() => {
    try {
      return localStorage.getItem(FREEZE_KEY) === 'true'
    } catch {
      return false
    }
  })

  const [activeSession, setActiveSession] = useState('2026-2027')
  const [selectedCampusFilter, setSelectedCampusFilter] = useState('all')

  // Save changes to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(CYCLES_KEY, JSON.stringify(cycles))
    } catch (e) {
      console.warn('Failed to save cycles to storage', e)
    }
  }, [cycles])

  useEffect(() => {
    try {
      localStorage.setItem(MERIT_KEY, JSON.stringify(meritPolicies))
    } catch (e) {
      console.warn('Failed to save merit policies to storage', e)
    }
  }, [meritPolicies])

  useEffect(() => {
    try {
      localStorage.setItem(SEATS_KEY, JSON.stringify(seatMatrix))
    } catch (e) {
      console.warn('Failed to save seat matrix to storage', e)
    }
  }, [seatMatrix])

  useEffect(() => {
    try {
      localStorage.setItem(FEES_KEY, JSON.stringify(feeSettings))
    } catch (e) {
      console.warn('Failed to save fee settings to storage', e)
    }
  }, [feeSettings])

  useEffect(() => {
    try {
      localStorage.setItem(FREEZE_KEY, isIntakeFrozen ? 'true' : 'false')
    } catch (e) {
      console.warn('Failed to save freeze state to storage', e)
    }
  }, [isIntakeFrozen])

  // ----------------------------------------------------
  // Modals & Forms State
  // ----------------------------------------------------
  // Admission Cycle Modal (Create & Edit)
  const [isCycleModalOpen, setIsCycleModalOpen] = useState(false)
  const [editingCycleId, setEditingCycleId] = useState(null)
  const [cycleForm, setCycleForm] = useState({
    name: '',
    campusScope: 'All Campuses (Central)',
    startDate: '',
    endDate: '',
    capacity: 250,
    status: 'Active (Open)'
  })

  // Merit Policy Modal (Create & Edit)
  const [isMeritModalOpen, setIsMeritModalOpen] = useState(false)
  const [editingMerit, setEditingMerit] = useState(null)

  // Seat Matrix Quota & Capacity Modal
  const [isManageQuotaModalOpen, setIsManageQuotaModalOpen] = useState(false)
  const [selectedSeatRow, setSelectedSeatRow] = useState(null)
  const [seatCapacityInput, setSeatCapacityInput] = useState(0)

  // Allocate New Seats Modal
  const [isAddSeatModalOpen, setIsAddSeatModalOpen] = useState(false)
  const [newSeatAllocation, setNewSeatAllocation] = useState({
    campus: '',
    wing: 'Primary Wing',
    totalCapacity: 100,
    filledSeats: 0,
    waitlist: 0
  })

  // Fee Tariff Modal (Create & Edit)
  const [isTariffModalOpen, setIsTariffModalOpen] = useState(false)
  const [editingTariff, setEditingTariff] = useState(null)

  // Filter / Search states
  const [seatSearch, setSeatSearch] = useState('')
  const [cycleSearch, setCycleSearch] = useState('')

  // ----------------------------------------------------
  // Dynamic Overview Calculations
  // ----------------------------------------------------
  const overviewMetrics = useMemo(() => {
    // Filter pipeline by selectedCampusFilter and activeSession
    const filteredPipeline = (admissionsPipeline || []).filter(p => {
      if (selectedCampusFilter !== 'all') {
        if (p.instituteId && p.instituteId !== selectedCampusFilter) return false
        const selectedInst = institutes.find(i => i.id === selectedCampusFilter)
        if (selectedInst && p.campus && p.campus !== selectedInst.name) return false
      }
      if (activeSession && p.academicSession && p.academicSession !== activeSession) {
        return false
      }
      return true
    })

    if (filteredPipeline.length > 0) {
      const totalLeads = filteredPipeline.length
      const testsTaken = filteredPipeline.filter(p => 
        p.scorecard?.testMarks != null ||
        ['Test Done', 'Interview Done', 'Offer Issued', 'Fee Paid', 'Enrolled'].includes(p.stage)
      ).length
      const interviewsConducted = filteredPipeline.filter(p =>
        ['Interview Done', 'Offer Issued', 'Fee Paid', 'Enrolled'].includes(p.stage)
      ).length
      const offersIssued = filteredPipeline.filter(p => 
        ['Offer Issued', 'Fee Paid', 'Enrolled'].includes(p.stage)
      ).length
      const enrolled = filteredPipeline.filter(p => p.stage === 'Enrolled').length

      const testRate = totalLeads > 0 ? ((testsTaken / totalLeads) * 100).toFixed(1) : '0.0'
      const interviewRate = testsTaken > 0 ? ((interviewsConducted / testsTaken) * 100).toFixed(1) : '0.0'
      const offerRate = interviewsConducted > 0 ? ((offersIssued / interviewsConducted) * 100).toFixed(1) : '0.0'
      const yieldRate = offersIssued > 0 ? ((enrolled / offersIssued) * 100).toFixed(1) : '0.0'

      return {
        totalLeads,
        testsTaken,
        interviewsConducted,
        offersIssued,
        enrolled,
        testRate,
        interviewRate,
        offerRate,
        yieldRate
      }
    }

    // Default Baseline when no leads match current filter
    return {
      totalLeads: 0,
      testsTaken: 0,
      interviewsConducted: 0,
      offersIssued: 0,
      enrolled: 0,
      testRate: '0.0',
      interviewRate: '0.0',
      offerRate: '0.0',
      yieldRate: '0.0'
    }
  }, [admissionsPipeline, selectedCampusFilter, activeSession, institutes])

  // ----------------------------------------------------
  // Handlers: Cycle CRUD
  // ----------------------------------------------------
  const openCreateCycleModal = () => {
    setEditingCycleId(null)
    setCycleForm({
      name: '',
      campusScope: 'All Campuses (Central)',
      startDate: new Date().toISOString().split('T')[0],
      endDate: '',
      capacity: 300,
      status: 'Active (Open)'
    })
    setIsCycleModalOpen(true)
  }

  const openEditCycleModal = (cycle) => {
    setEditingCycleId(cycle.id)
    setCycleForm({
      name: cycle.name,
      campusScope: cycle.campusScope,
      startDate: cycle.startDate,
      endDate: cycle.endDate,
      capacity: cycle.capacity || 300,
      status: cycle.status
    })
    setIsCycleModalOpen(true)
  }

  const handleSaveCycle = (e) => {
    e.preventDefault()
    if (!cycleForm.name.trim() || !cycleForm.startDate || !cycleForm.endDate) {
      toast?.error?.('Please complete all mandatory cycle details.')
      return
    }

    if (new Date(cycleForm.startDate) >= new Date(cycleForm.endDate)) {
      toast?.error?.('Cycle End Date must be strictly after the Start Date.')
      return
    }

    if (editingCycleId) {
      // Edit mode
      setCycles(prev => prev.map(c => {
        if (c.id === editingCycleId) {
          return {
            ...c,
            name: cycleForm.name.trim(),
            campusScope: cycleForm.campusScope,
            startDate: cycleForm.startDate,
            endDate: cycleForm.endDate,
            capacity: Number(cycleForm.capacity) || 100,
            status: cycleForm.status
          }
        }
        return c
      }))
      toast?.success?.(`Admission cycle "${cycleForm.name}" updated successfully!`)
      if (logAuditEvent) {
        logAuditEvent({
          action: 'CYCLE_UPDATE',
          details: `Updated admission cycle ${editingCycleId} (${cycleForm.name})`,
          target: cycleForm.name
        })
      }
    } else {
      // Create mode
      const newCycleItem = {
        id: `CYC-${new Date().getFullYear()}-${Math.floor(100 + Math.random() * 900)}`,
        name: cycleForm.name.trim(),
        campusScope: cycleForm.campusScope,
        startDate: cycleForm.startDate,
        endDate: cycleForm.endDate,
        capacity: Number(cycleForm.capacity) || 100,
        status: cycleForm.status,
        applications: 0
      }
      setCycles(prev => [newCycleItem, ...prev])
      toast?.success?.(`New admission cycle "${newCycleItem.name}" launched successfully!`)
      if (logAuditEvent) {
        logAuditEvent({
          action: 'CYCLE_LAUNCH',
          details: `Launched new admission cycle ${newCycleItem.id} (${newCycleItem.name})`,
          target: newCycleItem.name
        })
      }
    }

    setIsCycleModalOpen(false)
  }

  const handleDeleteCycle = (cycleId, cycleName) => {
    if (window.confirm(`Are you sure you want to delete cycle "${cycleName}"? This action cannot be undone.`)) {
      setCycles(prev => prev.filter(c => c.id !== cycleId))
      toast?.success?.(`Cycle "${cycleName}" removed.`)
      if (logAuditEvent) {
        logAuditEvent({
          action: 'CYCLE_DELETE',
          details: `Deleted admission cycle ${cycleId}`,
          target: cycleName
        })
      }
    }
  }

  const handleToggleCycleStatus = (cycleId) => {
    setCycles(prev => prev.map(c => {
      if (c.id === cycleId) {
        const nextStatus = c.status === 'Active (Open)' ? 'Closed / Paused' : 'Active (Open)'
        toast?.info?.(`Cycle status changed to ${nextStatus}`)
        return { ...c, status: nextStatus }
      }
      return c
    }))
  }

  const exportCyclesCSV = () => {
    const headers = ['Cycle ID', 'Cycle Name', 'Campus Scope', 'Start Date', 'End Date', 'Status', 'Capacity', 'Applications']
    const rows = cycles.map(c => [
      c.id,
      sanitizeCSV(c.name),
      sanitizeCSV(c.campusScope),
      c.startDate,
      c.endDate,
      c.status,
      c.capacity || 0,
      c.applications || 0
    ])
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(r => r.join(','))].join('\n')
    const encodedUri = encodeURI(csvContent)
    const link = document.createElement('a')
    link.setAttribute('href', encodedUri)
    link.setAttribute('download', `admission_cycles_${new Date().toISOString().split('T')[0]}.csv`)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    toast?.success?.('Exported admission cycles to CSV.')
  }

  // ----------------------------------------------------
  // Handlers: Merit Policy Weightage Engine
  // ----------------------------------------------------
  const handleOpenMeritModal = (policy = null) => {
    if (policy) {
      setEditingMerit({
        id: policy.id,
        wing: policy.wing,
        minPercentage: Number(policy.minPercentage) || 50,
        testWeight: Number(policy.testWeight) || 40,
        interviewWeight: Number(policy.interviewWeight) || 30,
        pastAcademicWeight: Number(policy.pastAcademicWeight) || 30,
        openMeritQuota: Number(policy.openMeritQuota) || 80,
        siblingQuota: Number(policy.siblingQuota) || 10,
        sportsQuota: Number(policy.sportsQuota) || 5,
        staffQuota: Number(policy.staffQuota) || 5,
        isNew: false
      })
    } else {
      setEditingMerit({
        id: `MER-${Date.now().toString().slice(-4)}`,
        wing: 'Cambridge O / A-Levels Wing',
        minPercentage: 65,
        testWeight: 50,
        interviewWeight: 20,
        pastAcademicWeight: 30,
        openMeritQuota: 70,
        siblingQuota: 10,
        sportsQuota: 10,
        staffQuota: 10,
        isNew: true
      })
    }
    setIsMeritModalOpen(true)
  }

  const meritSum = useMemo(() => {
    if (!editingMerit) return 0
    return (Number(editingMerit.testWeight) || 0) + 
           (Number(editingMerit.interviewWeight) || 0) + 
           (Number(editingMerit.pastAcademicWeight) || 0)
  }, [editingMerit])

  const isMeritSumBalanced = meritSum === 100

  const handleSaveMerit = (e) => {
    e.preventDefault()
    if (!editingMerit) return

    if (!isMeritSumBalanced) {
      toast?.error?.(`Merit weightage must sum up to exactly 100%. Current total: ${meritSum}%`)
      return
    }

    const quotaSum = (Number(editingMerit.openMeritQuota) || 0) + 
                     (Number(editingMerit.siblingQuota) || 0) + 
                     (Number(editingMerit.sportsQuota) || 0) + 
                     (Number(editingMerit.staffQuota) || 0)
    if (quotaSum !== 100) {
      toast?.error?.(`Reserved Quotas must sum up to exactly 100%. Current total: ${quotaSum}%`)
      return
    }

    if (editingMerit.isNew) {
      const newPolicy = {
        ...editingMerit,
        status: 'Published'
      }
      delete newPolicy.isNew
      setMeritPolicies(prev => [...prev, newPolicy])
      toast?.success?.(`New merit formula for ${editingMerit.wing} successfully created!`)
    } else {
      setMeritPolicies(prev => prev.map(m => m.id === editingMerit.id ? { ...editingMerit, status: 'Published' } : m))
      toast?.success?.(`Merit formula for ${editingMerit.wing} successfully updated and published.`)
    }

    if (logAuditEvent) {
      logAuditEvent({
        action: 'MERIT_POLICY_UPDATE',
        details: `Updated merit formula for ${editingMerit.wing} (Test: ${editingMerit.testWeight}%, Interview: ${editingMerit.interviewWeight}%, Academics: ${editingMerit.pastAcademicWeight}%)`,
        target: editingMerit.wing
      })
    }

    setIsMeritModalOpen(false)
    setEditingMerit(null)
  }

  // ----------------------------------------------------
  // Handlers: Seat Matrix & Waitlist Quotas
  // ----------------------------------------------------
  const handleOpenManageQuota = (seatRow) => {
    setSelectedSeatRow(seatRow)
    setSeatCapacityInput(seatRow.totalCapacity)
    setIsManageQuotaModalOpen(true)
  }

  const handleSaveQuotaCapacity = (e) => {
    e.preventDefault()
    if (!selectedSeatRow) return

    if (Number(seatCapacityInput) < selectedSeatRow.filledSeats) {
      toast?.error?.(`Total capacity cannot be less than currently occupied seats (${selectedSeatRow.filledSeats}).`)
      return
    }

    const newCap = Number(seatCapacityInput) || selectedSeatRow.filledSeats
    setSeatMatrix(prev => prev.map(s => {
      if (s.id === selectedSeatRow.id) {
        return {
          ...s,
          totalCapacity: newCap
        }
      }
      return s
    }))

    toast?.success?.(`Updated capacity for ${selectedSeatRow.campus} (${selectedSeatRow.wing}) to ${newCap} seats.`)
    if (logAuditEvent) {
      logAuditEvent({
        action: 'SEAT_CAPACITY_UPDATE',
        details: `Adjusted seat capacity for ${selectedSeatRow.campus} ${selectedSeatRow.wing} to ${newCap}`,
        target: selectedSeatRow.campus
      })
    }
    setIsManageQuotaModalOpen(false)
  }

  const handlePromoteFromWaitlist = async (seatRow) => {
    if (!seatRow || seatRow.waitlist <= 0) {
      toast?.error?.('No waitlisted candidates available in queue.')
      return
    }

    // Identify top waitlisted candidate in admissionsPipeline
    const targetCandidate = (admissionsPipeline || []).find(p => 
      p.stage === 'Waitlisted' && 
      (p.campus === seatRow.campus || p.instituteId === seatRow.instituteId || !p.instituteId)
    )

    if (targetCandidate && updateItem) {
      await updateItem('admissionsPipeline', targetCandidate.id, {
        stage: 'Offer Issued',
        status: 'Offer Issued (Waitlist Promoted)',
        offerDate: new Date().toISOString().split('T')[0],
        offerExpiryDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        updatedAt: new Date().toISOString()
      })
      toast?.success?.(`Promoted candidate "${targetCandidate.studentName}" from waitlist! Official admission offer issued.`)
    } else {
      toast?.success?.(`Promoted top candidate from waitlist for ${seatRow.campus}! Seat capacity adjusted.`)
    }

    setSeatMatrix(prev => prev.map(s => {
      if (s.id === seatRow.id) {
        return {
          ...s,
          filledSeats: s.filledSeats + 1,
          waitlist: Math.max(0, s.waitlist - 1)
        }
      }
      return s
    }))

    if (logAuditEvent) {
      logAuditEvent({
        action: 'WAITLIST_PROMOTION',
        details: `Promoted candidate from waitlist for ${seatRow.campus} (${seatRow.wing})`,
        target: seatRow.campus
      })
    }
    setIsManageQuotaModalOpen(false)
  }

  const handleAddSeatAllocation = (e) => {
    e.preventDefault()
    if (!newSeatAllocation.campus.trim()) {
      toast?.error?.('Please specify a campus.')
      return
    }

    const matchedInst = institutes.find(i => i.name === newSeatAllocation.campus.trim())
    const newItem = {
      id: `SM-${Date.now().toString().slice(-4)}`,
      campus: newSeatAllocation.campus.trim(),
      instituteId: matchedInst?.id || (institutes[0]?.id || 'inst-1'),
      wing: newSeatAllocation.wing,
      totalCapacity: Number(newSeatAllocation.totalCapacity) || 50,
      filledSeats: Number(newSeatAllocation.filledSeats) || 0,
      waitlist: Number(newSeatAllocation.waitlist) || 0
    }

    setSeatMatrix(prev => [...prev, newItem])
    setIsAddSeatModalOpen(false)
    setNewSeatAllocation({
      campus: '',
      wing: 'Primary Wing',
      totalCapacity: 100,
      filledSeats: 0,
      waitlist: 0
    })
    toast?.success?.(`Added seat matrix allocation for ${newItem.campus} (${newItem.wing})!`)
  }

  const exportSeatMatrixCSV = () => {
    const headers = ['Campus', 'Educational Wing', 'Total Capacity', 'Filled Seats', 'Available Seats', 'Waitlist Queue', 'Utilization %']
    const rows = seatMatrix.map(s => {
      const avail = Math.max(0, s.totalCapacity - s.filledSeats)
      const util = s.totalCapacity > 0 ? ((s.filledSeats / s.totalCapacity) * 100).toFixed(1) : 0
      return [
        sanitizeCSV(s.campus),
        sanitizeCSV(s.wing),
        s.totalCapacity,
        s.filledSeats,
        avail,
        s.waitlist,
        `${util}%`
      ]
    })
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(r => r.join(','))].join('\n')
    const encodedUri = encodeURI(csvContent)
    const link = document.createElement('a')
    link.setAttribute('href', encodedUri)
    link.setAttribute('download', `seat_matrix_allocations_${new Date().toISOString().split('T')[0]}.csv`)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    toast?.success?.('Exported seat matrix allocations to CSV.')
  }

  // ----------------------------------------------------
  // Handlers: Fee Tariffs
  // ----------------------------------------------------
  const handleOpenTariffModal = (tariff = null) => {
    if (tariff) {
      setEditingTariff({ ...tariff })
    } else {
      setEditingTariff({
        id: `FEE-${Date.now().toString().slice(-4)}`,
        tier: 'Undergraduate Degree Programs (BS)',
        prospectusFee: 3500,
        processingFee: 2500,
        testFee: 2000,
        lateSurcharge: 1500,
        status: 'Standard',
        gateways: ['Bank Challan', '1Link 1Bill', 'Kuickpay'],
        siblingDiscount: 15,
        isNew: true
      })
    }
    setIsTariffModalOpen(true)
  }

  const handleSaveTariff = (e) => {
    e.preventDefault()
    if (!editingTariff) return

    if (editingTariff.isNew) {
      const newT = { ...editingTariff }
      delete newT.isNew
      setFeeSettings(prev => [...prev, newT])
      toast?.success?.(`Added fee tariff schedule for ${editingTariff.tier}!`)
    } else {
      setFeeSettings(prev => prev.map(f => f.id === editingTariff.id ? editingTariff : f))
      toast?.success?.(`Updated application fee tariff for ${editingTariff.tier}!`)
    }

    if (logAuditEvent) {
      logAuditEvent({
        action: 'TARIFF_UPDATE',
        details: `Updated application fee tariffs for ${editingTariff.tier}`,
        target: editingTariff.tier
      })
    }
    setIsTariffModalOpen(false)
    setEditingTariff(null)
  }


  const handleDeleteMerit = (policyId, wingName) => {
    if (window.confirm(`Are you sure you want to delete merit formula for "${wingName}"? This action cannot be undone.`)) {
      setMeritPolicies(prev => prev.filter(m => m.id !== policyId))
      toast?.success?.(`Merit formula for ${wingName} deleted.`)
      if (logAuditEvent) {
        logAuditEvent({
          action: 'MERIT_POLICY_DELETE',
          details: `Deleted merit formula ${policyId} for ${wingName}`,
          target: wingName
        })
      }
    }
  }

  const handleDeleteTariff = (tariffId, tierName) => {
    if (window.confirm(`Are you sure you want to delete fee tariff schedule for "${tierName}"? This action cannot be undone.`)) {
      setFeeSettings(prev => prev.filter(f => f.id !== tariffId))
      toast?.success?.(`Fee tariff schedule for ${tierName} deleted.`)
      if (logAuditEvent) {
        logAuditEvent({
          action: 'TARIFF_DELETE',
          details: `Deleted fee tariff ${tariffId} for ${tierName}`,
          target: tierName
        })
      }
    }
  }

  const handleDeleteSeatAllocation = (seatId, campusName, wingName) => {
    if (window.confirm(`Are you sure you want to remove seat allocation for ${campusName} (${wingName})?`)) {
      setSeatMatrix(prev => prev.filter(s => s.id !== seatId))
      toast?.success?.(`Seat allocation for ${campusName} (${wingName}) deleted.`)
      if (logAuditEvent) {
        logAuditEvent({
          action: 'SEAT_ALLOCATION_DELETE',
          details: `Deleted seat allocation ${seatId} for ${campusName}`,
          target: campusName
        })
      }
    }
  }

  // ----------------------------------------------------
  // Handlers: Emergency Intake Freeze
  // ----------------------------------------------------
  const handleToggleFreeze = () => {
    const nextState = !isIntakeFrozen
    setIsIntakeFrozen(nextState)
    try { window.dispatchEvent(new Event('admissions_freeze_changed')) } catch {}
    if (nextState) {
      toast?.error?.('Central Admissions Intake FROZEN. Public applications temporarily locked.')
    } else {
      toast?.success?.('Central Admissions Intake resumed. All campus portals accepting submissions.')
    }
    if (logAuditEvent) {
      logAuditEvent({
        action: nextState ? 'ADMISSIONS_FREEZE' : 'ADMISSIONS_UNFREEZE',
        details: nextState ? 'Superadmin initiated platform-wide emergency admissions intake freeze' : 'Superadmin unlocked central admissions intake',
        target: 'Central Admissions Gateway'
      })
    }
  }

  // Tabs Configuration
  const tabsConfig = [
    { key: 'cycles', label: 'Admission Cycles', icon: Calendar, badge: cycles.length },
    { key: 'merit', label: 'Entry Test & Merit Policies', icon: Award, badge: meritPolicies.length },
    { key: 'seats', label: 'Seat Matrix & Waitlist', icon: Layers, badge: seatMatrix.length },
    { key: 'fees', label: 'Application Fee Settings', icon: DollarSign, badge: feeSettings.length },
    { key: 'overview', label: 'Admissions Overview & Funnel', icon: LayoutDashboard }
  ]

  // Filtered lists
  const filteredCycles = useMemo(() => {
    if (!cycleSearch.trim()) return cycles
    const term = cycleSearch.toLowerCase()
    return cycles.filter(c => 
      c.name.toLowerCase().includes(term) ||
      c.id.toLowerCase().includes(term) ||
      c.campusScope.toLowerCase().includes(term)
    )
  }, [cycles, cycleSearch])

  const filteredSeats = useMemo(() => {
    if (!seatSearch.trim()) return seatMatrix
    const term = seatSearch.toLowerCase()
    return seatMatrix.filter(s => 
      s.campus.toLowerCase().includes(term) ||
      s.wing.toLowerCase().includes(term)
    )
  }, [seatMatrix, seatSearch])

  return (
    <div className="p-3 sm:p-6 md:p-8 space-y-6 max-w-7xl mx-auto">
      {/* Emergency Freeze Banner if active */}
      {isIntakeFrozen && (
        <div className="bg-rose-50 border-2 border-rose-300 rounded-2xl p-4 flex items-center justify-between gap-3 text-rose-900 shadow-sm animate-pulse">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-rose-600 text-white flex items-center justify-center shrink-0 shadow-xs">
              <Lock className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-extrabold text-sm text-rose-950 flex items-center gap-2">
                <span>CENTRAL ADMISSIONS INTAKE CURRENTLY FROZEN</span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase bg-rose-200 text-rose-800 tracking-wide">Locked</span>
              </h4>
              <p className="text-xs text-rose-700 mt-0.5">
                Public online application portals and entrance registrations are locked platform-wide by the Super Administrator.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={handleToggleFreeze}
            className="px-3.5 py-1.5 bg-rose-700 hover:bg-rose-800 text-white rounded-xl text-xs font-bold transition-all shadow-xs cursor-pointer shrink-0"
          >
            Unlock Intake
          </button>
        </div>
      )}

      {/* Header Banner */}
      <div className="bg-gradient-to-r from-purple-900 via-indigo-900 to-slate-900 rounded-3xl p-6 sm:p-8 text-white shadow-xl relative overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md text-xs font-semibold text-purple-200 border border-white/10 mb-2">
              <UserPlus className="w-3.5 h-3.5 text-purple-300" />
              <span>Super Administrator • Platform Admissions Command</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              Admissions Architecture & Intake
            </h1>
            <p className="text-sm text-slate-300 mt-1 max-w-2xl leading-relaxed">
              Define cross-campus admission cycles, entrance test merit formulas, quotas, and application processing rules.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <button
              type="button"
              onClick={handleToggleFreeze}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold border transition-all cursor-pointer inline-flex items-center gap-1.5 shadow-xs ${
                isIntakeFrozen
                  ? 'bg-emerald-600 hover:bg-emerald-700 text-white border-emerald-500'
                  : 'bg-white/10 hover:bg-white/20 text-purple-100 border-white/20'
              }`}
            >
              {isIntakeFrozen ? <Unlock className="w-3.5 h-3.5" /> : <Lock className="w-3.5 h-3.5" />}
              <span>{isIntakeFrozen ? 'Unlock Intake' : 'Freeze Admissions'}</span>
            </button>

            <button
              type="button"
              onClick={openCreateCycleModal}
              className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-xs font-bold shadow-md cursor-pointer inline-flex items-center gap-1.5 transition-all active:scale-95"
            >
              <Plus className="w-4 h-4" />
              <span>Launch Admission Cycle</span>
            </button>
          </div>
        </div>
      </div>

      {/* Tabs Bar */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-2 shadow-2xs overflow-x-auto dark-scroll">
        <div className="flex items-center gap-1.5 min-w-max">
          {tabsConfig.map((t) => {
            const Icon = t.icon
            const isActive = effectiveTab === t.key
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
                {t.badge !== undefined && (
                  <span className={`px-1.5 py-0.5 rounded-full text-[10px] font-mono ${
                    isActive ? 'bg-purple-700 text-purple-100' : 'bg-slate-100 text-slate-600'
                  }`}>
                    {t.badge}
                  </span>
                )}
              </button>
            )
          })}
        </div>
      </div>

      {/* ==================================================== */}
      {/* 1. ADMISSIONS OVERVIEW TAB */}
      {/* ==================================================== */}
      {effectiveTab === 'overview' && (
        <div className="space-y-6 animate-in fade-in duration-150">
          {/* Filters Bar */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 bg-white rounded-2xl border border-slate-200/80 shadow-2xs">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                <Filter className="w-3.5 h-3.5 text-purple-600" />
                <span>Intake Scope:</span>
              </span>
              <select
                value={selectedCampusFilter}
                onChange={(e) => setSelectedCampusFilter(e.target.value)}
                className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-purple-500"
              >
                <option value="all">All Affiliated Campuses (Consolidated)</option>
                {institutes.map(inst => (
                  <option key={inst.id} value={inst.id}>{inst.name}</option>
                ))}
              </select>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-slate-700">Academic Session:</span>
              <select
                value={activeSession}
                onChange={(e) => setActiveSession(e.target.value)}
                className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-purple-500 font-mono"
              >
                <option value="2026-2027">2026-2027 (Current)</option>
                <option value="2025-2026">2025-2026</option>
              </select>
            </div>
          </div>

          {/* 4 Primary Funnel Stat Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-2xs space-y-2 hover:border-purple-300 transition-colors">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Total Inflow Leads</span>
                <span className="p-1.5 rounded-lg bg-purple-50 text-purple-600">
                  <Users className="w-4 h-4" />
                </span>
              </div>
              <div className="text-2xl font-bold font-mono text-purple-700">
                {overviewMetrics.totalLeads.toLocaleString()}
              </div>
              <p className="text-[11px] text-slate-500 flex items-center justify-between">
                <span>Inquiries & Submissions</span>
                <span className="font-semibold text-emerald-600">+12% vs LY</span>
              </p>
            </div>

            <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-2xs space-y-2 hover:border-indigo-300 transition-colors">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Entrance Tests Taken</span>
                <span className="p-1.5 rounded-lg bg-indigo-50 text-indigo-600">
                  <FileCheck className="w-4 h-4" />
                </span>
              </div>
              <div className="text-2xl font-bold font-mono text-indigo-700">
                {overviewMetrics.testsTaken.toLocaleString()}
              </div>
              <p className="text-[11px] text-slate-500 flex items-center justify-between">
                <span>Attendance Rate</span>
                <strong className="font-mono text-indigo-700">{overviewMetrics.testRate}%</strong>
              </p>
            </div>

            <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-2xs space-y-2 hover:border-emerald-300 transition-colors">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Offers Issued</span>
                <span className="p-1.5 rounded-lg bg-emerald-50 text-emerald-600">
                  <Award className="w-4 h-4" />
                </span>
              </div>
              <div className="text-2xl font-bold font-mono text-emerald-700">
                {overviewMetrics.offersIssued.toLocaleString()}
              </div>
              <p className="text-[11px] text-slate-500 flex items-center justify-between">
                <span>Merit Qualification</span>
                <strong className="font-mono text-emerald-700">{overviewMetrics.offerRate}%</strong>
              </p>
            </div>

            <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-2xs space-y-2 hover:border-purple-300 transition-colors">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Enrolled & Confirmed</span>
                <span className="p-1.5 rounded-lg bg-purple-50 text-purple-700">
                  <CheckCircle2 className="w-4 h-4" />
                </span>
              </div>
              <div className="text-2xl font-bold font-mono text-slate-900">
                {overviewMetrics.enrolled.toLocaleString()}
              </div>
              <p className="text-[11px] text-slate-500 flex items-center justify-between">
                <span>Offer Yield Conversion</span>
                <strong className="font-mono text-purple-700">{overviewMetrics.yieldRate}%</strong>
              </p>
            </div>
          </div>

          {/* Interactive Admissions Conversion Funnel */}
          <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-2xs space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="font-extrabold text-slate-900 text-sm">Admissions Pipeline Conversion Funnel</h3>
                <p className="text-xs text-slate-500 mt-0.5">Stage-by-stage progression from initial lead to confirmed student enrollment</p>
              </div>
              <span className="text-xs font-bold text-purple-700 bg-purple-50 px-2.5 py-1 rounded-lg border border-purple-200">
                Overall Yield: {overviewMetrics.totalLeads > 0 ? ((overviewMetrics.enrolled / overviewMetrics.totalLeads) * 100).toFixed(1) : '0'}%
              </span>
            </div>

            <div className="space-y-3 pt-2">
              <div>
                <div className="flex justify-between text-xs font-bold text-slate-700 mb-1">
                  <span>1. Inquiries & Registrations ({overviewMetrics.totalLeads})</span>
                  <span className="font-mono text-purple-700">100%</span>
                </div>
                <div className="w-full bg-slate-100 rounded-full h-3 overflow-hidden">
                  <div className="bg-purple-600 h-3 rounded-full transition-all duration-500" style={{ width: '100%' }}></div>
                </div>
              </div>

              <div>
                <div className="flex justify-between text-xs font-bold text-slate-700 mb-1">
                  <span>2. Entrance Assessment Attended ({overviewMetrics.testsTaken})</span>
                  <span className="font-mono text-indigo-700">{overviewMetrics.testRate}%</span>
                </div>
                <div className="w-full bg-slate-100 rounded-full h-3 overflow-hidden">
                  <div className="bg-indigo-600 h-3 rounded-full transition-all duration-500" style={{ width: `${overviewMetrics.testRate}%` }}></div>
                </div>
              </div>

              <div>
                <div className="flex justify-between text-xs font-bold text-slate-700 mb-1">
                  <span>3. Qualified & Formal Offer Issued ({overviewMetrics.offersIssued})</span>
                  <span className="font-mono text-emerald-700">{overviewMetrics.totalLeads > 0 ? ((overviewMetrics.offersIssued / overviewMetrics.totalLeads) * 100).toFixed(1) : 0}%</span>
                </div>
                <div className="w-full bg-slate-100 rounded-full h-3 overflow-hidden">
                  <div className="bg-emerald-600 h-3 rounded-full transition-all duration-500" style={{ width: `${overviewMetrics.totalLeads > 0 ? (overviewMetrics.offersIssued / overviewMetrics.totalLeads) * 100 : 0}%` }}></div>
                </div>
              </div>

              <div>
                <div className="flex justify-between text-xs font-bold text-slate-700 mb-1">
                  <span>4. First Installment Paid & Enrolled ({overviewMetrics.enrolled})</span>
                  <span className="font-mono text-slate-900">{overviewMetrics.totalLeads > 0 ? ((overviewMetrics.enrolled / overviewMetrics.totalLeads) * 100).toFixed(1) : 0}%</span>
                </div>
                <div className="w-full bg-slate-100 rounded-full h-3 overflow-hidden">
                  <div className="bg-slate-900 h-3 rounded-full transition-all duration-500" style={{ width: `${overviewMetrics.totalLeads > 0 ? (overviewMetrics.enrolled / overviewMetrics.totalLeads) * 100 : 0}%` }}></div>
                </div>
              </div>
            </div>
          </div>

          {/* Superadmin Central Directives Card */}
          <div className="bg-gradient-to-br from-slate-50 to-purple-50/40 rounded-2xl border border-purple-100 p-6 shadow-2xs space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <ShieldAlert className="w-4 h-4 text-purple-700" />
                  <span>Superadmin Central Directives & Emergency Controls</span>
                </h3>
                <p className="text-xs text-slate-600 mt-1 max-w-2xl leading-relaxed">
                  The Super Administrator holds authority to freeze admissions, enforce affirmative action or staff quotas, override entrance merit thresholds, and audit fee concessions across registered campuses.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleToggleFreeze}
                  className={`px-4 py-2 rounded-xl text-xs font-bold transition-all shadow-xs cursor-pointer inline-flex items-center gap-1.5 shrink-0 ${
                    isIntakeFrozen
                      ? 'bg-emerald-600 hover:bg-emerald-700 text-white'
                      : 'bg-rose-600 hover:bg-rose-700 text-white'
                  }`}
                >
                  {isIntakeFrozen ? <Unlock className="w-3.5 h-3.5" /> : <Lock className="w-3.5 h-3.5" />}
                  <span>{isIntakeFrozen ? 'Resume All Admissions' : 'Freeze Admissions Now'}</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ==================================================== */}
      {/* 2. ADMISSION CYCLES TAB */}
      {/* ==================================================== */}
      {effectiveTab === 'cycles' && (
        <div className="space-y-4 animate-in fade-in duration-150">
          {/* Top Actions: Search, Export & Launch */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="relative flex-1 max-w-sm">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search cycles by title, code, or scope..."
                value={cycleSearch}
                onChange={(e) => setCycleSearch(e.target.value)}
                className="w-full pl-9 pr-4 py-2 bg-white border border-slate-200/90 rounded-xl text-xs font-medium text-slate-800 placeholder-slate-400 focus:outline-hidden focus:ring-2 focus:ring-purple-500 shadow-2xs"
              />
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={exportCyclesCSV}
                className="px-3.5 py-2 bg-white hover:bg-slate-50 text-slate-700 border border-slate-200/90 rounded-xl text-xs font-bold transition-all cursor-pointer inline-flex items-center gap-1.5 shadow-2xs"
                title="Export admission cycles to CSV"
              >
                <Download className="w-3.5 h-3.5 text-slate-500" />
                <span>Export CSV</span>
              </button>

              <button
                type="button"
                onClick={openCreateCycleModal}
                className="px-3.5 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-xs font-bold transition-all cursor-pointer inline-flex items-center gap-1.5 shadow-xs"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Launch Admission Cycle</span>
              </button>
            </div>
          </div>

          {/* Cycles Table */}
          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-2xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-600">
                <thead className="bg-slate-50 border-b border-slate-100 font-bold text-slate-700 uppercase tracking-wider text-[11px]">
                  <tr>
                    <th className="py-3.5 px-4">Cycle ID & Name</th>
                    <th className="py-3.5 px-4">Campus & Wing Scope</th>
                    <th className="py-3.5 px-4">Application Window</th>
                    <th className="py-3.5 px-4">Intake Status</th>
                    <th className="py-3.5 px-4">Capacity & Uptake</th>
                    <th className="py-3.5 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredCycles.length === 0 ? (
                    <tr>
                      <td colSpan="6" className="py-8 text-center text-slate-400">
                        No admission cycles match the search criteria.
                      </td>
                    </tr>
                  ) : (
                    filteredCycles.map(c => {
                      const capacity = c.capacity || 100
                      const dynamicApps = (admissionsPipeline || []).filter(p => {
                        if (c.campusScope && !c.campusScope.includes('All Campuses') && p.campus && !c.campusScope.includes(p.campus)) return false
                        return true
                      }).length
                      const apps = dynamicApps > 0 ? dynamicApps : (c.applications || 0)
                      const fillPct = Math.min(100, Math.round((apps / Math.max(1, capacity)) * 100))
                      const isActive = c.status === 'Active (Open)'

                      return (
                        <tr key={c.id} className="hover:bg-slate-50/70 transition-colors">
                          <td className="py-3.5 px-4">
                            <div className="font-bold text-slate-900">{c.name}</div>
                            <span className="font-mono text-[10px] text-purple-700 font-bold">{c.id}</span>
                          </td>
                          <td className="py-3.5 px-4 font-medium text-slate-700">
                            <div className="flex items-center gap-1.5">
                              <Building2 className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                              <span>{c.campusScope}</span>
                            </div>
                          </td>
                          <td className="py-3.5 px-4 font-mono text-[11px] text-slate-500 whitespace-nowrap">
                            <div className="flex items-center gap-1.5">
                              <Clock className="w-3.5 h-3.5 text-slate-400" />
                              <span>{c.startDate} to {c.endDate}</span>
                            </div>
                          </td>
                          <td className="py-3.5 px-4">
                            <button
                              type="button"
                              onClick={() => handleToggleCycleStatus(c.id)}
                              className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border transition-all cursor-pointer ${
                                isActive
                                  ? 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100'
                                  : 'bg-amber-50 text-amber-700 border-amber-200 hover:bg-amber-100'
                              }`}
                              title="Click to toggle intake status"
                            >
                              {c.status}
                            </button>
                          </td>
                          <td className="py-3.5 px-4">
                            <div className="space-y-1 min-w-[130px]">
                              <div className="flex justify-between text-[11px] font-mono">
                                <span className="font-bold text-purple-700">{apps} applicants</span>
                                <span className="text-slate-400">/ {capacity}</span>
                              </div>
                              <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
                                <div 
                                  className={`h-1.5 rounded-full ${fillPct >= 90 ? 'bg-rose-500' : 'bg-purple-600'}`} 
                                  style={{ width: `${fillPct}%` }}
                                ></div>
                              </div>
                            </div>
                          </td>
                          <td className="py-3.5 px-4 text-right">
                            <div className="flex items-center justify-end gap-1.5">
                              <button
                                type="button"
                                onClick={() => openEditCycleModal(c)}
                                className="px-2.5 py-1 text-purple-700 hover:bg-purple-50 rounded-lg font-semibold transition-colors cursor-pointer border border-purple-200/60"
                                title="Edit cycle configuration"
                              >
                                Edit
                              </button>
                              <button
                                type="button"
                                onClick={() => handleDeleteCycle(c.id, c.name)}
                                className="p-1 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                                title="Delete cycle"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      )
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ==================================================== */}
      {/* 3. ENTRY TEST & MERIT POLICIES TAB */}
      {/* ==================================================== */}
      {effectiveTab === 'merit' && (
        <div className="space-y-4 animate-in fade-in duration-150">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 className="font-extrabold text-slate-900 text-sm">Cross-Campus Merit Weightage Formulas</h3>
              <p className="text-xs text-slate-500">Formulas strictly normalized to 100% across test, interview, and past academic transcripts</p>
            </div>
            <button
              type="button"
              onClick={() => handleOpenMeritModal(null)}
              className="px-3.5 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-xs font-bold transition-all cursor-pointer inline-flex items-center gap-1.5 shadow-xs shrink-0"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Educational Wing Formula</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {meritPolicies.map((m) => (
              <div key={m.id} className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-2xs space-y-4 hover:border-purple-300 transition-colors flex flex-col justify-between">
                <div className="space-y-3">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                    <span className="font-bold text-slate-900 text-xs truncate max-w-[200px]" title={m.wing}>{m.wing}</span>
                    <span className="text-[10px] bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded-full font-bold border border-emerald-200">
                      {m.status || 'Published'}
                    </span>
                  </div>

                  <div className="space-y-2 text-xs text-slate-600">
                    <div className="flex justify-between items-center py-1 bg-slate-50 px-2.5 rounded-lg">
                      <span className="font-medium">Minimum Eligibility Cut-off:</span>
                      <strong className="font-mono text-purple-700 font-bold">{m.minPercentage}%</strong>
                    </div>

                    <div className="space-y-1.5 pt-1">
                      <div className="flex justify-between text-[11px]">
                        <span>Entrance Test Weightage:</span>
                        <strong className="font-mono text-slate-800">{m.testWeight}%</strong>
                      </div>
                      <div className="flex justify-between text-[11px]">
                        <span>Interview / Assessment:</span>
                        <strong className="font-mono text-slate-800">{m.interviewWeight}%</strong>
                      </div>
                      <div className="flex justify-between text-[11px]">
                        <span>Past Academic Transcript:</span>
                        <strong className="font-mono text-slate-800">{m.pastAcademicWeight}%</strong>
                      </div>
                    </div>

                    {/* Weightage Bar */}
                    <div className="w-full bg-slate-100 rounded-full h-2 flex overflow-hidden">
                      <div style={{ width: `${m.testWeight}%` }} className="bg-purple-600 h-full" title={`Test: ${m.testWeight}%`}></div>
                      <div style={{ width: `${m.interviewWeight}%` }} className="bg-indigo-500 h-full" title={`Interview: ${m.interviewWeight}%`}></div>
                      <div style={{ width: `${m.pastAcademicWeight}%` }} className="bg-emerald-500 h-full" title={`Academics: ${m.pastAcademicWeight}%`}></div>
                    </div>

                    {/* Quota Breakdown */}
                    <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[10px] text-slate-400 font-medium">
                      <span>Open: {m.openMeritQuota || 80}%</span>
                      <span>Sibling: {m.siblingQuota || 10}%</span>
                      <span>Sports: {m.sportsQuota || 5}%</span>
                      <span>Staff: {m.staffQuota || 5}%</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => handleOpenMeritModal(m)}
                    className="flex-1 py-2 bg-purple-50 hover:bg-purple-100 text-purple-700 border border-purple-200 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5"
                  >
                    <Sliders className="w-3.5 h-3.5" />
                    <span>Configure Weightage & Quotas</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDeleteMerit(m.id, m.wing)}
                    className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 border border-slate-200 hover:border-rose-200 rounded-xl transition-colors cursor-pointer shrink-0"
                    title="Delete merit formula"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ==================================================== */}
      {/* 4. SEAT MATRIX & WAITLIST TAB */}
      {/* ==================================================== */}
      {effectiveTab === 'seats' && (
        <div className="space-y-4 animate-in fade-in duration-150">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="relative flex-1 max-w-sm">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search by campus name or wing..."
                value={seatSearch}
                onChange={(e) => setSeatSearch(e.target.value)}
                className="w-full pl-9 pr-4 py-2 bg-white border border-slate-200/90 rounded-xl text-xs font-medium text-slate-800 placeholder-slate-400 focus:outline-hidden focus:ring-2 focus:ring-purple-500 shadow-2xs"
              />
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={exportSeatMatrixCSV}
                className="px-3.5 py-2 bg-white hover:bg-slate-50 text-slate-700 border border-slate-200/90 rounded-xl text-xs font-bold transition-all cursor-pointer inline-flex items-center gap-1.5 shadow-2xs"
                title="Export seat allocations to CSV"
              >
                <Download className="w-3.5 h-3.5 text-slate-500" />
                <span>Export CSV</span>
              </button>

              <button
                type="button"
                onClick={() => setIsAddSeatModalOpen(true)}
                className="px-3.5 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-xs font-bold transition-all cursor-pointer inline-flex items-center gap-1.5 shadow-xs"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Allocate Campus Seats</span>
              </button>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-2xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-600">
                <thead className="bg-slate-50 border-b border-slate-100 font-bold text-slate-700 uppercase tracking-wider text-[11px]">
                  <tr>
                    <th className="py-3.5 px-4">Campus & Wing</th>
                    <th className="py-3.5 px-4 text-center">Total Capacity</th>
                    <th className="py-3.5 px-4 text-center">Filled Seats</th>
                    <th className="py-3.5 px-4 text-center">Available Capacity</th>
                    <th className="py-3.5 px-4 text-center">Waitlist Queue</th>
                    <th className="py-3.5 px-4 text-center">Utilization</th>
                    <th className="py-3.5 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredSeats.length === 0 ? (
                    <tr>
                      <td colSpan="7" className="py-8 text-center text-slate-400">
                        No seat matrix allocations match the search query.
                      </td>
                    </tr>
                  ) : (
                    filteredSeats.map((s) => {
                      const avail = Math.max(0, s.totalCapacity - s.filledSeats)
                      const utilPct = s.totalCapacity > 0 ? Math.round((s.filledSeats / s.totalCapacity) * 100) : 0

                      return (
                        <tr key={s.id} className="hover:bg-slate-50/70 transition-colors">
                          <td className="py-3.5 px-4">
                            <div className="font-bold text-slate-900">{s.campus}</div>
                            <span className="text-[10px] text-purple-700 font-bold">{s.wing}</span>
                          </td>
                          <td className="py-3.5 px-4 text-center font-mono font-bold text-slate-800">{s.totalCapacity}</td>
                          <td className="py-3.5 px-4 text-center font-mono font-bold text-emerald-700">{s.filledSeats}</td>
                          <td className="py-3.5 px-4 text-center font-mono font-bold text-indigo-700">
                            <span className={`px-2 py-0.5 rounded-full ${avail <= 10 ? 'bg-rose-50 text-rose-700 font-bold' : 'bg-indigo-50 text-indigo-700'}`}>
                              {avail}
                            </span>
                          </td>
                          <td className="py-3.5 px-4 text-center font-mono font-bold text-amber-700">
                            {s.waitlist > 0 ? (
                              <span className="px-2 py-0.5 bg-amber-50 text-amber-800 rounded-full border border-amber-200">
                                {s.waitlist} in line
                              </span>
                            ) : (
                              <span className="text-slate-400 text-[11px] font-normal">None</span>
                            )}
                          </td>
                          <td className="py-3.5 px-4 text-center">
                            <div className="flex items-center justify-center gap-1.5">
                              <div className="w-16 bg-slate-100 rounded-full h-1.5 overflow-hidden">
                                <div 
                                  className={`h-1.5 rounded-full ${utilPct >= 95 ? 'bg-rose-500' : 'bg-purple-600'}`} 
                                  style={{ width: `${Math.min(100, utilPct)}%` }}
                                ></div>
                              </div>
                              <span className="font-mono text-[10px] font-bold text-slate-700">{utilPct}%</span>
                            </div>
                          </td>
                          <td className="py-3.5 px-4 text-right">
                            <div className="flex items-center justify-end gap-1.5">
                              <button
                                type="button"
                                onClick={() => handleOpenManageQuota(s)}
                                className="px-2.5 py-1 text-purple-700 hover:bg-purple-50 rounded-lg font-bold text-xs cursor-pointer border border-purple-200/70 transition-all shadow-2xs"
                              >
                                Manage Quotas
                              </button>
                              <button
                                type="button"
                                onClick={() => handleDeleteSeatAllocation(s.id, s.campus, s.wing)}
                                className="p-1 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                                title="Delete seat allocation"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      )
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ==================================================== */}
      {/* 5. APPLICATION FEE SETTINGS TAB */}
      {/* ==================================================== */}
      {effectiveTab === 'fees' && (
        <div className="space-y-4 animate-in fade-in duration-150">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 className="font-extrabold text-slate-900 text-sm">Application & Prospectus Fee Tariffs</h3>
              <p className="text-xs text-slate-500">Standardized application tariff schedules by educational tier and payment gateway channels</p>
            </div>
            <button
              type="button"
              onClick={() => handleOpenTariffModal(null)}
              className="px-3.5 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-xs font-bold transition-all cursor-pointer inline-flex items-center gap-1.5 shadow-xs shrink-0"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Program Tariff Tier</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {feeSettings.map((f) => (
              <div key={f.id} className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-2xs space-y-4 hover:border-purple-300 transition-colors flex flex-col justify-between">
                <div className="space-y-3">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                    <span className="font-bold text-slate-900 text-xs truncate max-w-[200px]" title={f.tier}>{f.tier}</span>
                    <span className="text-[10px] bg-purple-50 text-purple-700 px-2 py-0.5 rounded-full font-bold border border-purple-200">
                      {f.status || 'Standard'}
                    </span>
                  </div>

                  <div className="space-y-2 text-xs text-slate-600">
                    <div className="flex justify-between items-center py-1">
                      <span>Prospectus Voucher:</span>
                      <strong className="font-mono text-purple-700 font-bold">PKR {Number(f.prospectusFee).toLocaleString()}</strong>
                    </div>
                    <div className="flex justify-between items-center py-1">
                      <span>Application Processing:</span>
                      <strong className="font-mono text-slate-800 font-bold">PKR {Number(f.processingFee).toLocaleString()}</strong>
                    </div>
                    <div className="flex justify-between items-center py-1">
                      <span>Entrance Examination:</span>
                      <strong className="font-mono text-slate-800 font-bold">PKR {Number(f.testFee).toLocaleString()}</strong>
                    </div>
                    {f.lateSurcharge && (
                      <div className="flex justify-between items-center py-1 text-slate-500">
                        <span>Late Submission Surcharge:</span>
                        <strong className="font-mono text-rose-700 font-bold">PKR {Number(f.lateSurcharge).toLocaleString()}</strong>
                      </div>
                    )}

                    {/* Sibling concession */}
                    <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-emerald-700">
                      <span>Sibling Waiver Concession:</span>
                      <strong className="font-bold font-mono">{f.siblingDiscount || 20}% Off</strong>
                    </div>

                    {/* Payment Gateways */}
                    <div className="pt-1">
                      <span className="text-[10px] text-slate-400 block mb-1">Accepted Payment Channels:</span>
                      <div className="flex flex-wrap gap-1">
                        {(f.gateways || ['Bank Challan', '1Link 1Bill']).map((g, idx) => (
                          <span key={idx} className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 text-[10px] font-semibold">
                            {g}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => handleOpenTariffModal(f)}
                    className="flex-1 py-2 bg-purple-50 hover:bg-purple-100 text-purple-700 rounded-xl text-xs font-bold transition-all cursor-pointer border border-purple-200 flex items-center justify-center gap-1.5"
                  >
                    <DollarSign className="w-3.5 h-3.5" />
                    <span>Adjust Tariff Rates</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDeleteTariff(f.id, f.tier)}
                    className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 border border-slate-200 hover:border-rose-200 rounded-xl transition-colors cursor-pointer shrink-0"
                    title="Delete fee tariff"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ==================================================== */}
      {/* MODAL 1: Launch / Edit Admission Cycle */}
      {/* ==================================================== */}
      {isCycleModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-lg w-full shadow-2xl border border-slate-100 overflow-hidden">
            <div className="bg-gradient-to-r from-purple-900 to-indigo-900 p-6 text-white flex items-center justify-between">
              <div>
                <h3 className="font-extrabold text-lg">
                  {editingCycleId ? 'Edit Admission Cycle' : 'Launch New Admission Cycle'}
                </h3>
                <p className="text-xs text-purple-200 mt-0.5">Central platform intake authorization</p>
              </div>
              <button
                type="button"
                onClick={() => setIsCycleModalOpen(false)}
                className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveCycle} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Cycle Title / Intake Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Fall 2026 Admissions Intake"
                  value={cycleForm.name}
                  onChange={(e) => setCycleForm({ ...cycleForm, name: e.target.value })}
                  className="w-full px-3.5 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-purple-500 font-medium text-slate-800"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Campus & Wing Scope *</label>
                <select
                  value={cycleForm.campusScope}
                  onChange={(e) => setCycleForm({ ...cycleForm, campusScope: e.target.value })}
                  className="w-full px-3.5 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-purple-500 font-medium text-slate-800"
                >
                  <option value="All Campuses (Central)">All Campuses (Central)</option>
                  <option value="Primary & Kindergarten Wings">Primary & Kindergarten Wings</option>
                  <option value="Middle & High School Wings">Middle & High School Wings</option>
                  <option value="College & Higher Secondary">College & Higher Secondary</option>
                  {institutes.map(inst => (
                    <option key={inst.id} value={`${inst.name} (Exclusive)`}>
                      {inst.name} (Exclusive)
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Application Start Date *</label>
                  <input
                    type="date"
                    required
                    value={cycleForm.startDate}
                    onChange={(e) => setCycleForm({ ...cycleForm, startDate: e.target.value })}
                    className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-purple-500 font-medium text-slate-800"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Application End Date *</label>
                  <input
                    type="date"
                    required
                    value={cycleForm.endDate}
                    onChange={(e) => setCycleForm({ ...cycleForm, endDate: e.target.value })}
                    className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-purple-500 font-medium text-slate-800"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Intake Status</label>
                  <select
                    value={cycleForm.status}
                    onChange={(e) => setCycleForm({ ...cycleForm, status: e.target.value })}
                    className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-purple-500 font-medium text-slate-800"
                  >
                    <option value="Active (Open)">Active (Open)</option>
                    <option value="Scheduled">Scheduled</option>
                    <option value="Closed / Paused">Closed / Paused</option>
                    <option value="Draft">Draft</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Target Seat Capacity</label>
                  <input
                    type="number"
                    min="10"
                    max="10000"
                    required
                    value={cycleForm.capacity}
                    onChange={(e) => setCycleForm({ ...cycleForm, capacity: Number(e.target.value) })}
                    className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-purple-500 font-medium text-slate-800"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsCycleModalOpen(false)}
                  className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl transition-all cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-bold text-white bg-purple-600 hover:bg-purple-700 rounded-xl shadow-md transition-all cursor-pointer"
                >
                  {editingCycleId ? 'Save Changes' : 'Launch Cycle'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ==================================================== */}
      {/* MODAL 2: Configure / Add Merit Policy Formula */}
      {/* ==================================================== */}
      {isMeritModalOpen && editingMerit && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-lg w-full shadow-2xl border border-slate-100 overflow-hidden">
            <div className="bg-gradient-to-r from-purple-900 to-indigo-900 p-6 text-white flex items-center justify-between">
              <div>
                <h3 className="font-extrabold text-lg">
                  {editingMerit.isNew ? 'New Merit Formula' : 'Merit Weightage Engine'}
                </h3>
                <p className="text-xs text-purple-200 mt-0.5">{editingMerit.wing}</p>
              </div>
              <button
                type="button"
                onClick={() => {
                  setIsMeritModalOpen(false)
                  setEditingMerit(null)
                }}
                className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveMerit} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Educational Wing / Program Scope</label>
                <input
                  type="text"
                  required
                  value={editingMerit.wing}
                  onChange={(e) => setEditingMerit({ ...editingMerit, wing: e.target.value })}
                  placeholder="e.g. Higher Secondary / Cambridge A-Levels"
                  className="w-full px-3.5 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-purple-500 font-medium text-slate-800"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Minimum Eligibility Cut-off Percentage (0 - 100%)
                </label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  required
                  value={editingMerit.minPercentage}
                  onChange={(e) => setEditingMerit({ ...editingMerit, minPercentage: Number(e.target.value) })}
                  className="w-full px-3.5 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-purple-500 font-medium text-slate-800"
                />
              </div>

              <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-200/80 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-extrabold text-slate-800 uppercase tracking-wider">Weightage Breakdown</span>
                  <span className={`text-xs font-mono font-bold px-2 py-0.5 rounded-full ${
                    isMeritSumBalanced ? 'bg-emerald-100 text-emerald-800 border border-emerald-300' : 'bg-rose-100 text-rose-800 border border-rose-300'
                  }`}>
                    {isMeritSumBalanced ? '✓ 100% Balanced' : `Total: ${meritSum}% (Must equal 100%)`}
                  </span>
                </div>

                <div className="grid grid-cols-3 gap-2 text-xs">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-600 mb-1">Entrance Test %</label>
                    <input
                      type="number"
                      min="0"
                      max="100"
                      required
                      value={editingMerit.testWeight}
                      onChange={(e) => setEditingMerit({ ...editingMerit, testWeight: Number(e.target.value) })}
                      className="w-full px-3 py-1.5 text-xs bg-white border border-slate-200 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-purple-500 font-bold text-slate-800"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-slate-600 mb-1">Interview %</label>
                    <input
                      type="number"
                      min="0"
                      max="100"
                      required
                      value={editingMerit.interviewWeight}
                      onChange={(e) => setEditingMerit({ ...editingMerit, interviewWeight: Number(e.target.value) })}
                      className="w-full px-3 py-1.5 text-xs bg-white border border-slate-200 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-purple-500 font-bold text-slate-800"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-slate-600 mb-1">Past Academics %</label>
                    <input
                      type="number"
                      min="0"
                      max="100"
                      required
                      value={editingMerit.pastAcademicWeight}
                      onChange={(e) => setEditingMerit({ ...editingMerit, pastAcademicWeight: Number(e.target.value) })}
                      className="w-full px-3 py-1.5 text-xs bg-white border border-slate-200 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-purple-500 font-bold text-slate-800"
                    />
                  </div>
                </div>
              </div>

              {/* Quotas Section */}
              <div className="space-y-2">
                <span className="block text-xs font-bold text-slate-700">Reserved Quotas Allocation (%)</span>
                <div className="grid grid-cols-4 gap-2 text-xs">
                  <div>
                    <span className="text-[10px] text-slate-500 block mb-1">Open Merit</span>
                    <input
                      type="number"
                      min="0"
                      max="100"
                      value={editingMerit.openMeritQuota}
                      onChange={(e) => setEditingMerit({ ...editingMerit, openMeritQuota: Number(e.target.value) })}
                      className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold"
                    />
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-500 block mb-1">Kinship / Sibling</span>
                    <input
                      type="number"
                      min="0"
                      max="100"
                      value={editingMerit.siblingQuota}
                      onChange={(e) => setEditingMerit({ ...editingMerit, siblingQuota: Number(e.target.value) })}
                      className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold"
                    />
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-500 block mb-1">Sports</span>
                    <input
                      type="number"
                      min="0"
                      max="100"
                      value={editingMerit.sportsQuota}
                      onChange={(e) => setEditingMerit({ ...editingMerit, sportsQuota: Number(e.target.value) })}
                      className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold"
                    />
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-500 block mb-1">Staff Child</span>
                    <input
                      type="number"
                      min="0"
                      max="100"
                      value={editingMerit.staffQuota}
                      onChange={(e) => setEditingMerit({ ...editingMerit, staffQuota: Number(e.target.value) })}
                      className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold"
                    />
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => {
                    setIsMeritModalOpen(false)
                    setEditingMerit(null)
                  }}
                  className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl transition-all cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={!isMeritSumBalanced}
                  className={`px-5 py-2 text-xs font-bold text-white rounded-xl shadow-md transition-all cursor-pointer ${
                    isMeritSumBalanced ? 'bg-purple-600 hover:bg-purple-700' : 'bg-slate-300 cursor-not-allowed opacity-60'
                  }`}
                >
                  Save Formula
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ==================================================== */}
      {/* MODAL 3: Manage Seat Quota & Waitlist Modal */}
      {/* ==================================================== */}
      {isManageQuotaModalOpen && selectedSeatRow && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-md w-full shadow-2xl border border-slate-100 overflow-hidden">
            <div className="bg-gradient-to-r from-purple-900 to-indigo-900 p-6 text-white flex items-center justify-between">
              <div>
                <h3 className="font-extrabold text-lg">Manage Seat Allocation & Quotas</h3>
                <p className="text-xs text-purple-200 mt-0.5">{selectedSeatRow.campus} • {selectedSeatRow.wing}</p>
              </div>
              <button
                type="button"
                onClick={() => setIsManageQuotaModalOpen(false)}
                className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div className="grid grid-cols-3 gap-2 text-center">
                <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-200">
                  <span className="text-[10px] text-slate-400 font-bold uppercase block">Filled Seats</span>
                  <strong className="text-lg font-mono text-emerald-700 font-bold">{selectedSeatRow.filledSeats}</strong>
                </div>
                <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-200">
                  <span className="text-[10px] text-slate-400 font-bold uppercase block">Available</span>
                  <strong className="text-lg font-mono text-indigo-700 font-bold">
                    {Math.max(0, selectedSeatRow.totalCapacity - selectedSeatRow.filledSeats)}
                  </strong>
                </div>
                <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-200">
                  <span className="text-[10px] text-slate-400 font-bold uppercase block">Waitlisted</span>
                  <strong className="text-lg font-mono text-amber-700 font-bold">{selectedSeatRow.waitlist}</strong>
                </div>
              </div>

              {/* Adjust Total Capacity Form */}
              <form onSubmit={handleSaveQuotaCapacity} className="space-y-3 pt-2">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Authorized Total Seat Capacity
                  </label>
                  <input
                    type="number"
                    min={selectedSeatRow.filledSeats}
                    max="5000"
                    required
                    value={seatCapacityInput}
                    onChange={(e) => setSeatCapacityInput(e.target.value)}
                    className="w-full px-3.5 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-purple-500 font-bold text-slate-800"
                  />
                  <span className="text-[10px] text-slate-400 mt-1 block">
                    Cannot be less than currently filled seats ({selectedSeatRow.filledSeats}).
                  </span>
                </div>

                <button
                  type="submit"
                  className="w-full py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-xs font-bold transition-all shadow-xs cursor-pointer"
                >
                  Update Total Capacity
                </button>
              </form>

              {/* Waitlist Promotion Section */}
              <div className="pt-3 border-t border-slate-100 space-y-2">
                <span className="text-xs font-bold text-slate-800 block">Waitlist Queue Action</span>
                <p className="text-[11px] text-slate-500 leading-relaxed">
                  Promote Candidate #1 from the waitlist queue to a filled seat. This automatically issues an admission confirmation notice.
                </p>
                <button
                  type="button"
                  disabled={selectedSeatRow.waitlist <= 0}
                  onClick={() => handlePromoteFromWaitlist(selectedSeatRow)}
                  className={`w-full py-2 rounded-xl text-xs font-bold transition-all inline-flex items-center justify-center gap-1.5 cursor-pointer ${
                    selectedSeatRow.waitlist > 0
                      ? 'bg-amber-500 hover:bg-amber-600 text-white shadow-xs'
                      : 'bg-slate-100 text-slate-400 cursor-not-allowed'
                  }`}
                >
                  <ArrowRight className="w-3.5 h-3.5" />
                  <span>Promote Next From Waitlist ({selectedSeatRow.waitlist} Waiting)</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ==================================================== */}
      {/* MODAL 4: Allocate Campus Seats Modal */}
      {/* ==================================================== */}
      {isAddSeatModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-md w-full shadow-2xl border border-slate-100 overflow-hidden">
            <div className="bg-gradient-to-r from-purple-900 to-indigo-900 p-6 text-white flex items-center justify-between">
              <div>
                <h3 className="font-extrabold text-lg">Allocate Campus Seats</h3>
                <p className="text-xs text-purple-200 mt-0.5">Register new seat quota entry</p>
              </div>
              <button
                type="button"
                onClick={() => setIsAddSeatModalOpen(false)}
                className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleAddSeatAllocation} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Campus Name *</label>
                {institutes.length > 0 ? (
                  <select
                    required
                    value={newSeatAllocation.campus}
                    onChange={(e) => setNewSeatAllocation({ ...newSeatAllocation, campus: e.target.value })}
                    className="w-full px-3.5 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-purple-500 font-medium text-slate-800"
                  >
                    <option value="">Select an affiliated campus...</option>
                    {institutes.map(inst => (
                      <option key={inst.id} value={inst.name}>{inst.name}</option>
                    ))}
                  </select>
                ) : (
                  <input
                    type="text"
                    required
                    placeholder="Enter campus name"
                    value={newSeatAllocation.campus}
                    onChange={(e) => setNewSeatAllocation({ ...newSeatAllocation, campus: e.target.value })}
                    className="w-full px-3.5 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-purple-500 font-medium text-slate-800"
                  />
                )}
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Educational Wing *</label>
                <select
                  value={newSeatAllocation.wing}
                  onChange={(e) => setNewSeatAllocation({ ...newSeatAllocation, wing: e.target.value })}
                  className="w-full px-3.5 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-purple-500 font-medium text-slate-800"
                >
                  <option value="Primary Wing">Primary Wing</option>
                  <option value="Middle Wing">Middle Wing</option>
                  <option value="High School">High School</option>
                  <option value="College Wing">College Wing</option>
                  <option value="University Undergraduate">University Undergraduate</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Total Capacity *</label>
                  <input
                    type="number"
                    min="10"
                    max="5000"
                    required
                    value={newSeatAllocation.totalCapacity}
                    onChange={(e) => setNewSeatAllocation({ ...newSeatAllocation, totalCapacity: Number(e.target.value) })}
                    className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-800"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Currently Filled</label>
                  <input
                    type="number"
                    min="0"
                    value={newSeatAllocation.filledSeats}
                    onChange={(e) => setNewSeatAllocation({ ...newSeatAllocation, filledSeats: Number(e.target.value) })}
                    className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-800"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsAddSeatModalOpen(false)}
                  className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl transition-all cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-bold text-white bg-purple-600 hover:bg-purple-700 rounded-xl shadow-md transition-all cursor-pointer"
                >
                  Save Allocation
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ==================================================== */}
      {/* MODAL 5: Fee Tariff Rate Adjustment Modal */}
      {/* ==================================================== */}
      {isTariffModalOpen && editingTariff && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-md w-full shadow-2xl border border-slate-100 overflow-hidden">
            <div className="bg-gradient-to-r from-purple-900 to-indigo-900 p-6 text-white flex items-center justify-between">
              <div>
                <h3 className="font-extrabold text-lg">
                  {editingTariff.isNew ? 'Add Fee Tariff Schedule' : 'Adjust Tariff Rates'}
                </h3>
                <p className="text-xs text-purple-200 mt-0.5">{editingTariff.tier}</p>
              </div>
              <button
                type="button"
                onClick={() => {
                  setIsTariffModalOpen(false)
                  setEditingTariff(null)
                }}
                className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveTariff} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Tier / Program Name *</label>
                <input
                  type="text"
                  required
                  value={editingTariff.tier}
                  onChange={(e) => setEditingTariff({ ...editingTariff, tier: e.target.value })}
                  placeholder="e.g. Higher Secondary / Pre-Engineering"
                  className="w-full px-3.5 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-purple-500 font-medium text-slate-800"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Prospectus Fee (PKR) *</label>
                  <input
                    type="number"
                    min="0"
                    required
                    value={editingTariff.prospectusFee}
                    onChange={(e) => setEditingTariff({ ...editingTariff, prospectusFee: Number(e.target.value) })}
                    className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-800"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Processing Fee (PKR) *</label>
                  <input
                    type="number"
                    min="0"
                    required
                    value={editingTariff.processingFee}
                    onChange={(e) => setEditingTariff({ ...editingTariff, processingFee: Number(e.target.value) })}
                    className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-800"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Entrance Test Fee (PKR) *</label>
                  <input
                    type="number"
                    min="0"
                    required
                    value={editingTariff.testFee}
                    onChange={(e) => setEditingTariff({ ...editingTariff, testFee: Number(e.target.value) })}
                    className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-800"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Late Surcharge (PKR)</label>
                  <input
                    type="number"
                    min="0"
                    value={editingTariff.lateSurcharge || 0}
                    onChange={(e) => setEditingTariff({ ...editingTariff, lateSurcharge: Number(e.target.value) })}
                    className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-800"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Sibling Concession Discount (%)</label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={editingTariff.siblingDiscount || 20}
                  onChange={(e) => setEditingTariff({ ...editingTariff, siblingDiscount: Number(e.target.value) })}
                  className="w-full px-3.5 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-800"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Accepted Payment Channels</label>
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {['Bank Challan', '1Link 1Bill', 'Kuickpay', 'JazzCash', 'EasyPaisa'].map(gw => {
                    const isSelected = (editingTariff.gateways || []).includes(gw)
                    return (
                      <button
                        key={gw}
                        type="button"
                        onClick={() => {
                          const currentGws = editingTariff.gateways || ['Bank Challan', '1Link 1Bill']
                          const nextGws = isSelected 
                            ? currentGws.filter(g => g !== gw)
                            : [...currentGws, gw]
                          if (nextGws.length === 0) return
                          setEditingTariff({ ...editingTariff, gateways: nextGws })
                        }}
                        className={`px-2.5 py-1 rounded-lg text-xs font-semibold border transition-all cursor-pointer ${
                          isSelected
                            ? 'bg-purple-100 text-purple-800 border-purple-300 font-bold'
                            : 'bg-slate-50 text-slate-500 border-slate-200 hover:bg-slate-100'
                        }`}
                      >
                        {gw} {isSelected ? '✓' : '+'}
                      </button>
                    )
                  })}
                </div>
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => {
                    setIsTariffModalOpen(false)
                    setEditingTariff(null)
                  }}
                  className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl transition-all cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-bold text-white bg-purple-600 hover:bg-purple-700 rounded-xl shadow-md transition-all cursor-pointer"
                >
                  Save Tariff
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

export default SuperadminAdmissionsView
