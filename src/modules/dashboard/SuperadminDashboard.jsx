import React, { useState, useEffect, useRef, useMemo } from 'react'
import { 
  Users, 
  Building2, 
  TrendingUp, 
  ArrowUpRight, 
  UserPlus, 
  Settings,
  Sliders,
  Plus,
  CheckCircle,
  Clock,
  Sparkles,
  Download,
  AlertCircle,
  School,
  Radio,
  Send,
  Eye,
  X,
  ShieldCheck,
  GraduationCap,
  Copy,
  Check,
  CreditCard,
  MoreVertical,
  ChevronRight,
  ChevronDown,
  Filter,
  Layers,
  Activity,
  Award
} from 'lucide-react'
import Modal from '../../components/common/Modal'
import { useAppData } from '../../context/AppDataContext'
import { AnalyticsService } from '../../services/analyticsService'

export const SuperadminDashboard = ({ onRouteChange, onOpenSettings }) => {
  const { 
    stats = {}, 
    recentActivity = [], 
    addItem, 
    institutes = [],
    sendCommunicationBlast,
    activeWing,
    setActiveWing
  } = useAppData()
  // Modals state
  const [isUserModalOpen, setIsUserModalOpen] = useState(false)
  const [isInstituteModalOpen, setIsInstituteModalOpen] = useState(false)
  const [isBroadcastModalOpen, setIsBroadcastModalOpen] = useState(false)

  // Educational Tier Filter State (School, College, University, Custom)
  const [selectedTierFilter, setSelectedTierFilter] = useState(() => {
    if (activeWing === 'school') return 'school'
    if (activeWing === 'college') return 'college'
    if (activeWing === 'undergraduate') return 'university'
    return 'all'
  })
  const [isFilterDropdownOpen, setIsFilterDropdownOpen] = useState(false)
  const filterDropdownRef = useRef(null)

  // Executive Super Admin Monthly Performance Chart State (Metric Switcher & Hover State)
  const [executiveMetric, setExecutiveMetric] = useState('revenue') // 'revenue', 'students', 'recovery'
  const [hoveredMonthIdx, setHoveredMonthIdx] = useState(null)

  // Executive Data across 12 months for Super Admin
  const executiveChartData = useMemo(() => {
    if (executiveMetric === 'revenue') {
      return {
        unit: '₨',
        yAxisLabels: ['₨ 2.5M', '₨ 2.0M', '₨ 1.5M', '₨ 1.0M', '₨ 0.5M', '₨ 0'],
        maxVal: 2700, // in thousands PKR
        summaryLabel: 'Total Fee Revenue (2026)',
        summaryValue: '₨ 24.65M',
        avgLabel: 'Monthly Avg Collection',
        avgValue: '₨ 2.05M',
        growthBadge: '+14.2% vs last year',
        primaryLegend: 'School Campuses (Primary & Matric)',
        secondaryLegend: 'College & Universities (Inter & BS)',
        months: [
          { m: 'Jan', v1: 950, v2: 720, label1: '₨ 950K', label2: '₨ 720K', total: '₨ 1.67M', note: 'Winter session fees' },
          { m: 'Feb', v1: 1020, v2: 780, label1: '₨ 1.02M', label2: '₨ 780K', total: '₨ 1.80M', note: 'Standard installment' },
          { m: 'Mar', v1: 890, v2: 850, label1: '₨ 890K', label2: '₨ 850K', total: '₨ 1.74M', note: 'Pre-exam dues' },
          { m: 'Apr', v1: 1350, v2: 920, label1: '₨ 1.35M', label2: '₨ 920K', total: '₨ 2.27M', note: 'New session intake' },
          { m: 'May', v1: 1580, v2: 1120, label1: '₨ 1.58M', label2: '₨ 1.12M', total: '₨ 2.70M', note: 'Admissions Peak', isPeak: true },
          { m: 'Jun', v1: 980, v2: 860, label1: '₨ 980K', label2: '₨ 860K', total: '₨ 1.84M', note: 'Pre-summer clearing' },
          { m: 'Jul', v1: 750, v2: 710, label1: '₨ 750K', label2: '₨ 710K', total: '₨ 1.46M', note: 'Summer break low' },
          { m: 'Aug', v1: 1220, v2: 890, label1: '₨ 1.22M', label2: '₨ 890K', total: '₨ 2.11M', note: 'Campus re-opening' },
          { m: 'Sep', v1: 1480, v2: 1050, label1: '₨ 1.48M', label2: '₨ 1.05M', total: '₨ 2.53M', note: 'Fall semester intake', isPeak: true },
          { m: 'Oct', v1: 1120, v2: 820, label1: '₨ 1.12M', label2: '₨ 820K', total: '₨ 1.94M', note: 'Regular fee challans' },
          { m: 'Nov', v1: 1280, v2: 910, label1: '₨ 1.28M', label2: '₨ 910K', total: '₨ 2.19M', note: 'Terminal exams clearance' },
          { m: 'Dec', v1: 1420, v2: 980, label1: '₨ 1.42M', label2: '₨ 980K', total: '₨ 2.40M', note: 'Annual closing dues' }
        ]
      }
    } else if (executiveMetric === 'students') {
      return {
        unit: 'Students',
        yAxisLabels: ['8,000', '6,400', '4,800', '3,200', '1,600', '0'],
        maxVal: 8000,
        summaryLabel: 'Total Active Enrolled',
        summaryValue: '14,850',
        avgLabel: 'Avg Campus Strength',
        avgValue: '1,238 / campus',
        growthBadge: '+8.5% Net Admissions',
        primaryLegend: 'School Students (Grade 1-10)',
        secondaryLegend: 'College & Uni Students (Inter/BS)',
        months: [
          { m: 'Jan', v1: 4200, v2: 3100, label1: '4,200', label2: '3,100', total: '7,300', note: 'Session enrollment' },
          { m: 'Feb', v1: 4350, v2: 3180, label1: '4,350', label2: '3,180', total: '7,530', note: 'Mid-term transfers' },
          { m: 'Mar', v1: 4400, v2: 3250, label1: '4,400', label2: '3,250', total: '7,650', note: 'Pre-board count' },
          { m: 'Apr', v1: 5100, v2: 3450, label1: '5,100', label2: '3,450', total: '8,550', note: 'Spring admissions' },
          { m: 'May', v1: 5800, v2: 3900, label1: '5,800', label2: '3,900', total: '9,700', note: 'Peak registrations', isPeak: true },
          { m: 'Jun', v1: 5750, v2: 3850, label1: '5,750', label2: '3,850', total: '9,600', note: 'Stable roster' },
          { m: 'Jul', v1: 5600, v2: 3800, label1: '5,600', label2: '3,800', total: '9,400', note: 'Graduated outgoing' },
          { m: 'Aug', v1: 6100, v2: 4150, label1: '6,100', label2: '4,150', total: '10,250', note: 'New admissions' },
          { m: 'Sep', v1: 6800, v2: 4600, label1: '6,800', label2: '4,600', total: '11,400', note: 'Fall batch enrollment', isPeak: true },
          { m: 'Oct', v1: 6750, v2: 4550, label1: '6,750', label2: '4,550', total: '11,300', note: 'Current active' },
          { m: 'Nov', v1: 6900, v2: 4700, label1: '6,900', label2: '4,700', total: '11,600', note: 'Registered roster' },
          { m: 'Dec', v1: 7150, v2: 4850, label1: '7,150', label2: '4,850', total: '12,000', note: 'End-of-year strength' }
        ]
      }
    } else {
      return {
        unit: '%',
        yAxisLabels: ['100%', '80%', '60%', '40%', '20%', '0%'],
        maxVal: 100,
        summaryLabel: 'Annual Network Recovery',
        summaryValue: '94.2%',
        avgLabel: '1Link Digital Clearance',
        avgValue: '98.1%',
        growthBadge: 'Target: ≥ 90% (Healthy)',
        primaryLegend: 'School Recovery %',
        secondaryLegend: 'College & Uni Recovery %',
        months: [
          { m: 'Jan', v1: 92, v2: 88, label1: '92%', label2: '88%', total: '90.0% Avg', note: 'Target achieved' },
          { m: 'Feb', v1: 94, v2: 89, label1: '94%', label2: '89%', total: '91.5% Avg', note: 'On track' },
          { m: 'Mar', v1: 91, v2: 86, label1: '91%', label2: '86%', total: '88.5% Avg', note: 'Follow-ups dispatched' },
          { m: 'Apr', v1: 96, v2: 92, label1: '96%', label2: '92%', total: '94.0% Avg', note: 'High recovery' },
          { m: 'May', v1: 98, v2: 95, label1: '98%', label2: '95%', total: '96.5% Avg', note: 'Peak efficiency', isPeak: true },
          { m: 'Jun', v1: 93, v2: 90, label1: '93%', label2: '90%', total: '91.5% Avg', note: 'Cleared' },
          { m: 'Jul', v1: 89, v2: 87, label1: '89%', label2: '87%', total: '88.0% Avg', note: 'Holiday grace period' },
          { m: 'Aug', v1: 95, v2: 91, label1: '95%', label2: '91%', total: '93.0% Avg', note: 'Re-opening rush' },
          { m: 'Sep', v1: 97, v2: 94, label1: '97%', label2: '94%', total: '95.5% Avg', note: 'Excellent collection', isPeak: true },
          { m: 'Oct', v1: 93, v2: 89, label1: '93%', label2: '89%', total: '91.0% Avg', note: 'Current cycle' },
          { m: 'Nov', v1: 95, v2: 92, label1: '95%', label2: '92%', total: '93.5% Avg', note: 'Pre-exam clearance' },
          { m: 'Dec', v1: 96, v2: 93, label1: '96%', label2: '93%', total: '94.5% Avg', note: 'Annual audit clean' }
        ]
      }
    }
  }, [executiveMetric])

  // Close filter dropdown on outside click
  useEffect(() => {
    const handleOutsideClick = (e) => {
      if (filterDropdownRef.current && !filterDropdownRef.current.contains(e.target)) {
        setIsFilterDropdownOpen(false)
      }
    }
    if (isFilterDropdownOpen) {
      document.addEventListener('mousedown', handleOutsideClick)
    }
    return () => {
      document.removeEventListener('mousedown', handleOutsideClick)
    }
  }, [isFilterDropdownOpen])

  // Filter options definition
  const tierFilterOptions = [
    { 
      id: 'all', 
      label: 'All Campuses', 
      shortLabel: 'All Tiers',
      subtitle: 'All educational tiers & wings',
      badge: 'All', 
      icon: Building2 
    },
    { 
      id: 'school', 
      label: 'School Wing', 
      shortLabel: 'Schools',
      subtitle: 'Primary, Middle & Secondary Campuses',
      badge: 'School', 
      icon: School 
    },
    { 
      id: 'college', 
      label: 'College Wing', 
      shortLabel: 'Colleges',
      subtitle: 'Intermediate & Higher Secondary Campuses',
      badge: 'College', 
      icon: GraduationCap 
    },
    { 
      id: 'university', 
      label: 'University Wing', 
      shortLabel: 'Universities',
      subtitle: 'Higher Ed, BS Degrees & Undergrad Campuses',
      badge: 'University', 
      icon: Award 
    },
    { 
      id: 'custom', 
      label: 'Custom Hybrid', 
      shortLabel: 'Custom',
      subtitle: 'Multi-Wing & Custom Tier Campuses',
      badge: 'Custom', 
      icon: Sparkles 
    }
  ]

  // Robust matching helper
  const matchesTierFilter = (inst, filterId) => {
    if (!filterId || filterId === 'all') return true
    if (!inst) return false

    const type = String(inst.type || '').toLowerCase().trim()
    const planType = String(inst.planType || '').toLowerCase().trim()
    const planTier = String(inst.planTier || '').toLowerCase().trim()
    const tiers = Array.isArray(inst.enabledTiers) ? inst.enabledTiers.map(t => String(t).toLowerCase()) : []
    const name = String(inst.name || '').toLowerCase()

    if (filterId === 'school') {
      return (
        type === 'school' ||
        planType === 'school' ||
        planTier.includes('school') ||
        (tiers.includes('school') && type !== 'custom' && planType !== 'custom') ||
        (name.includes('school') && type !== 'college' && type !== 'university' && type !== 'custom')
      )
    }

    if (filterId === 'college') {
      return (
        type === 'college' ||
        planType === 'college' ||
        planTier.includes('college') ||
        (tiers.includes('college') && type !== 'custom' && planType !== 'custom') ||
        (name.includes('college') && type !== 'school' && type !== 'university' && type !== 'custom')
      )
    }

    if (filterId === 'university') {
      return (
        type === 'university' ||
        planType === 'university' ||
        planTier.includes('university') ||
        tiers.includes('undergraduate') ||
        tiers.includes('university') ||
        (name.includes('university') && type !== 'custom' && planType !== 'custom')
      )
    }

    if (filterId === 'custom') {
      return (
        type === 'custom' ||
        planType === 'custom' ||
        planTier.includes('custom') ||
        planTier.includes('hybrid') ||
        tiers.length > 1 ||
        Boolean(inst.isCustom)
      )
    }

    return true
  }

  // Tier counts calculation
  const tierCounts = useMemo(() => {
    const counts = { all: (institutes || []).length, school: 0, college: 0, university: 0, custom: 0 }
    ;(institutes || []).forEach(inst => {
      if (matchesTierFilter(inst, 'school')) counts.school++
      if (matchesTierFilter(inst, 'college')) counts.college++
      if (matchesTierFilter(inst, 'university')) counts.university++
      if (matchesTierFilter(inst, 'custom')) counts.custom++
    })
    return counts
  }, [institutes])

  // Filtered institutes list
  const filteredInstitutes = useMemo(() => {
    return (institutes || []).filter(inst => matchesTierFilter(inst, selectedTierFilter))
  }, [institutes, selectedTierFilter])

  // Handle tier filter selection
  const handleSelectTierFilter = (tierId) => {
    setSelectedTierFilter(tierId)
    setIsFilterDropdownOpen(false)
    if (setActiveWing) {
      if (tierId === 'school') setActiveWing('school')
      else if (tierId === 'college') setActiveWing('college')
      else if (tierId === 'university') setActiveWing('undergraduate')
      else setActiveWing('all')
    }
  }

  // Current active tier configuration
  const currentFilterConfig = tierFilterOptions.find(o => o.id === selectedTierFilter) || tierFilterOptions[0]

  // Dynamic KPI calculations based on active filter
  const displayTotalCampuses = selectedTierFilter === 'all' 
    ? (stats.totalInstitutes || (institutes || []).length || 12) 
    : filteredInstitutes.length

  const displayActiveCampuses = selectedTierFilter === 'all'
    ? (stats.activeInstitutes || (institutes || []).filter(i => (i.status || 'Active').toLowerCase() === 'active').length || 12)
    : filteredInstitutes.filter(i => (i.status || 'Active').toLowerCase() === 'active').length

  const displayTotalStudents = useMemo(() => {
    if (selectedTierFilter === 'all') {
      const sum = (institutes || []).reduce((acc, i) => acc + (Number(i.totalStudents) || Number(i.studentsCount) || 0), 0)
      return sum > 0 ? sum : (stats.totalStudents || 15000)
    }
    const sum = filteredInstitutes.reduce((acc, i) => acc + (Number(i.totalStudents) || Number(i.studentsCount) || 0), 0)
    if (sum === 0 && filteredInstitutes.length > 0) {
      if (selectedTierFilter === 'school') return filteredInstitutes.length * 1250
      if (selectedTierFilter === 'college') return filteredInstitutes.length * 850
      if (selectedTierFilter === 'university') return filteredInstitutes.length * 2400
      if (selectedTierFilter === 'custom') return filteredInstitutes.length * 1500
    }
    return sum
  }, [institutes, filteredInstitutes, selectedTierFilter, stats.totalStudents])

  const formattedStudents = displayTotalStudents >= 1000 
    ? `${(displayTotalStudents / 1000).toFixed(2)}K` 
    : String(displayTotalStudents)

  const displayWingsValue = useMemo(() => {
    if (selectedTierFilter === 'all') return '3 Wings'
    if (selectedTierFilter === 'school') return 'School Wing'
    if (selectedTierFilter === 'college') return 'College Wing'
    if (selectedTierFilter === 'university') return 'Uni Wing'
    return 'Custom Wing'
  }, [selectedTierFilter])

  const displayWingsBadge = useMemo(() => {
    if (selectedTierFilter === 'all') return '3 Active Tiers'
    if (selectedTierFilter === 'school') return 'K-12 Primary'
    if (selectedTierFilter === 'college') return 'Inter / HSSC'
    if (selectedTierFilter === 'university') return 'Higher Ed'
    return 'Hybrid Matrix'
  }, [selectedTierFilter])

  const displayMRRValue = useMemo(() => {
    if (selectedTierFilter === 'all') return stats.monthlyRevenue || '$19.3K'
    if (selectedTierFilter === 'school') return '$9.4K'
    if (selectedTierFilter === 'college') return '$5.2K'
    if (selectedTierFilter === 'university') return '$3.6K'
    return '$1.1K'
  }, [selectedTierFilter, stats.monthlyRevenue])

  const displayMRRBadge = useMemo(() => {
    if (selectedTierFilter === 'all') return '4 Tier Plans'
    return `${currentFilterConfig.badge} Tier Plan`
  }, [selectedTierFilter, currentFilterConfig.badge])

  // Direct Add Campus shortcut handler: Redirects to Institutes view and automatically opens onboarding wizard
  const handleDirectAddCampus = () => {
    if (typeof sessionStorage !== 'undefined') {
      sessionStorage.setItem('open_campus_wizard', 'true')
    }
    onRouteChange('institutes')
  }

  // Open Add Campus Modal with tier pre-selected
  const handleOpenAddCampusModal = () => {
    if (selectedTierFilter === 'college') {
      setNewInstituteData(prev => ({
        ...prev,
        planTier: 'College Plan',
        planType: 'COLLEGE',
        enabledTiers: ['college']
      }))
    } else if (selectedTierFilter === 'university') {
      setNewInstituteData(prev => ({
        ...prev,
        planTier: 'University Plan',
        planType: 'UNIVERSITY',
        enabledTiers: ['undergraduate']
      }))
    } else if (selectedTierFilter === 'custom') {
      setNewInstituteData(prev => ({
        ...prev,
        planTier: 'Custom Hybrid Plan',
        planType: 'CUSTOM',
        enabledTiers: ['school', 'college']
      }))
    } else {
      setNewInstituteData(prev => ({
        ...prev,
        planTier: 'School Plan',
        planType: 'SCHOOL',
        enabledTiers: ['school']
      }))
    }
    setIsInstituteModalOpen(true)
  }

  // Feedback toast state
  const [feedbackToast, setFeedbackToast] = useState(null)
  const [reportSuccess, setReportSuccess] = useState(false)


  // User form data
  const [newUserData, setNewUserData] = useState({
    name: '',
    email: '',
    role: 'institute_admin',
    institute: '',
    phone: ''
  })

  // Institute form data
  const [newInstituteData, setNewInstituteData] = useState({
    name: '',
    code: '',
    city: '',
    address: '',
    email: '',
    phone: '',
    adminName: '',
    adminEmail: '',
    adminPassword: 'Password123!',
    planTier: 'School Plan',
    planType: 'SCHOOL',
    enabledTiers: ['school']
  })

  // Credentials Ready Popup Modal
  const [newlyCreatedCreds, setNewlyCreatedCreds] = useState(null)
  const [copiedCreds, setCopiedCreds] = useState(false)

  // Broadcast form data
  const [broadcastData, setBroadcastData] = useState({
    title: '',
    channel: 'SMS',
    recipientGroup: 'All Active Users',
    message: ''
  })

  const triggerToast = (msg) => {
    setFeedbackToast(msg)
    setTimeout(() => setFeedbackToast(null), 3500)
  }

  const handleCreateUser = async (e) => {
    e.preventDefault()
    if (!newUserData.name || !newUserData.email) return

    await addItem('users', {
      name: newUserData.name,
      email: newUserData.email,
      role: newUserData.role,
      institute: newUserData.institute || 'Central Headquarters',
      phone: newUserData.phone || '+92 300 0000000',
      status: 'Active',
      lastLogin: 'Just now'
    })

    setIsUserModalOpen(false)
    setNewUserData({
      name: '',
      email: '',
      role: 'institute_admin',
      institute: '',
      phone: ''
    })
    triggerToast('New user account created and permissions activated!')
  }

  const handleCreateInstitute = async (e) => {
    e.preventDefault()
    if (!newInstituteData.name || !newInstituteData.code) return

    const instCode = newInstituteData.code.toUpperCase().trim()
    const cleanSlug = instCode.toLowerCase().replace(/[^a-z0-9]/g, '')
    const adminEmail = newInstituteData.adminEmail?.trim() || `admin@${cleanSlug}.edu`
    const adminName = newInstituteData.adminName?.trim() || `${newInstituteData.name} Administrator`
    const adminPassword = newInstituteData.adminPassword || 'Password123!'

    const createdInst = await addItem('institutes', {
      name: newInstituteData.name,
      code: instCode,
      city: newInstituteData.city || 'Central District',
      address: newInstituteData.address || `${newInstituteData.name} Campus, Central District`,
      email: newInstituteData.email || adminEmail,
      phone: newInstituteData.phone || '+92 300 0000000',
      studentsCount: 0,
      teachersCount: 0,
      status: 'Active',
      planTier: newInstituteData.planTier || 'School Plan',
      planType: newInstituteData.planType || 'SCHOOL',
      enabledTiers: newInstituteData.enabledTiers || ['school'],
      joinedDate: new Date().toISOString().split('T')[0]
    })

    const newInstId = createdInst?.id || `inst-${Date.now()}`

    // Provision campus administrator account
    await addItem('users', {
      name: adminName,
      email: adminEmail,
      password: adminPassword,
      role: 'institute_admin',
      roleTitle: 'Institute Administrator',
      instituteId: newInstId,
      institute: newInstituteData.name,
      phone: newInstituteData.phone || '+92 300 0000000',
      status: 'Active',
      lastLogin: 'Never'
    })

    setIsInstituteModalOpen(false)
    setNewlyCreatedCreds({
      name: newInstituteData.name,
      code: instCode,
      planTier: newInstituteData.planTier || 'School Plan',
      adminName: adminName,
      adminEmail: adminEmail,
      password: adminPassword
    })

    setNewInstituteData({
      name: '',
      code: '',
      city: '',
      address: '',
      email: '',
      phone: '',
      adminName: '',
      adminEmail: '',
      adminPassword: 'Password123!',
      planTier: 'School Plan',
      planType: 'SCHOOL',
      enabledTiers: ['school']
    })
    triggerToast('New institute and administrator credentials created!')
  }

  const handleSendBroadcast = (e) => {
    e.preventDefault()
    if (!broadcastData.message) return

    if (sendCommunicationBlast) {
      sendCommunicationBlast(broadcastData)
    } else {
      addItem('recentActivity', {
        text: `Sent ${broadcastData.channel} broadcast to ${broadcastData.recipientGroup}`,
        time: 'Just now'
      })
    }

    setIsBroadcastModalOpen(false)
    setBroadcastData({
      title: '',
      channel: 'SMS',
      recipientGroup: 'All Active Users',
      message: ''
    })
    triggerToast('Broadcast announcement sent to active platform sessions!')
  }

  const handleGenerateReport = () => {
    AnalyticsService.exportExecutiveReportCSV()
    setReportSuccess(true)
    setTimeout(() => setReportSuccess(false), 3500)
  }

  return (
    <div className="p-4 sm:p-6 md:p-8 pb-16 space-y-6 max-w-[1400px] mx-auto">
      {/* Toast Feedback */}
      {reportSuccess && (
        <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 px-4 py-3 rounded-2xl flex items-center justify-between shadow-xs animate-in fade-in">
          <div className="flex items-center gap-2.5">
            <CheckCircle className="w-5 h-5 text-emerald-600" />
            <span className="text-sm font-medium">Audit CSV report exported successfully!</span>
          </div>
          <button onClick={() => setReportSuccess(false)} className="text-xs text-emerald-700 underline font-semibold">
            Dismiss
          </button>
        </div>
      )}

      {feedbackToast && (
        <div className="bg-purple-50 border border-purple-200 text-purple-900 px-4 py-3 rounded-2xl flex items-center justify-between shadow-xs animate-in fade-in">
          <div className="flex items-center gap-2.5">
            <CheckCircle className="w-5 h-5 text-purple-600" />
            <span className="text-sm font-medium">{feedbackToast}</span>
          </div>
          <button onClick={() => setFeedbackToast(null)} className="text-xs text-purple-700 underline font-semibold">
            Dismiss
          </button>
        </div>
      )}

      {/* 1. Header Row */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="text-[11px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full bg-[#f5eeff] text-purple-700 border border-purple-100 inline-flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-purple-600" />
              <span>Multi-Campus Platform Governance</span>
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight font-heading">
            Super Admin Dashboard
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1 font-sans">
            Multi-Campus Educational Wings Governance & Real-Time Performance Matrix
          </p>

          {/* Active Filter Indicator Pill - Minimalist */}
          {selectedTierFilter !== 'all' && (
            <div className="flex items-center gap-2 mt-2">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-purple-100 text-purple-800 border border-purple-200">
                <Filter className="w-3 h-3 text-purple-600" />
                <span>{currentFilterConfig.label}</span>
                <button
                  type="button"
                  onClick={() => handleSelectTierFilter('all')}
                  className="hover:bg-purple-200/80 p-0.5 rounded-full transition-colors cursor-pointer"
                  title="Clear filter"
                >
                  <X className="w-3.5 h-3.5 text-purple-700" />
                </button>
              </span>
            </div>
          )}
        </div>

        {/* Action Shortcuts & Educational Tier Filter - Single clean row, no wrap */}
        <div className="flex items-center gap-2 sm:gap-2.5 shrink-0 flex-nowrap">
          {/* Clean Educational Tier Dropdown Filter */}
          <div className="relative" ref={filterDropdownRef}>
            <button
              type="button"
              onClick={() => setIsFilterDropdownOpen(prev => !prev)}
              className={`h-10 px-3.5 rounded-xl text-xs font-bold border transition-all duration-150 flex items-center gap-2 cursor-pointer shadow-2xs select-none whitespace-nowrap ${
                selectedTierFilter !== 'all'
                  ? 'bg-purple-50 border-purple-300 text-purple-700 ring-2 ring-purple-500/10'
                  : 'bg-white hover:bg-slate-50 border-slate-200 text-slate-700 hover:border-slate-300'
              }`}
              title="Filter campuses by tier"
              aria-expanded={isFilterDropdownOpen}
              aria-haspopup="true"
            >
              <Filter className={`w-3.5 h-3.5 shrink-0 ${selectedTierFilter !== 'all' ? 'text-purple-600' : 'text-slate-400'}`} />
              <span>{currentFilterConfig.label}</span>
              <ChevronDown className={`w-3.5 h-3.5 text-slate-400 transition-transform duration-200 shrink-0 ${isFilterDropdownOpen ? 'rotate-180 text-purple-600' : ''}`} />
            </button>

            {/* Dropdown Popover Menu - Clean & Focused */}
            {isFilterDropdownOpen && (
              <div className="absolute right-0 top-full mt-2 w-56 bg-white rounded-2xl border border-slate-200/90 shadow-xl shadow-purple-900/10 p-1.5 z-50 animate-in fade-in zoom-in-95 duration-150 text-left">
                <div className="px-3 py-2 border-b border-slate-100 mb-1 flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-800">Filter by Tier</span>
                  {selectedTierFilter !== 'all' && (
                    <button
                      type="button"
                      onClick={() => handleSelectTierFilter('all')}
                      className="text-[11px] font-semibold text-purple-600 hover:text-purple-800 transition-colors cursor-pointer"
                    >
                      Clear
                    </button>
                  )}
                </div>

                <div className="space-y-0.5">
                  {tierFilterOptions.map(option => {
                    const isSelected = selectedTierFilter === option.id
                    const OptionIcon = option.icon

                    return (
                      <button
                        key={option.id}
                        type="button"
                        onClick={() => handleSelectTierFilter(option.id)}
                        className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-left text-xs font-semibold transition-all cursor-pointer ${
                          isSelected
                            ? 'bg-purple-50 text-purple-900 font-bold'
                            : 'hover:bg-slate-50 text-slate-700'
                        }`}
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          <OptionIcon className={`w-4 h-4 shrink-0 ${isSelected ? 'text-purple-600' : 'text-slate-400'}`} />
                          <span className="truncate">{option.label}</span>
                        </div>
                        {isSelected && <Check className="w-4 h-4 text-purple-600 stroke-[2.5] shrink-0" />}
                      </button>
                    )
                  })}
                </div>
              </div>
            )}
          </div>

          <button
            onClick={handleOpenAddCampusModal}
            className="h-10 px-4 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-xs font-semibold shadow-sm shadow-purple-600/25 transition-all flex items-center gap-1.5 cursor-pointer active:scale-95 whitespace-nowrap shrink-0"
          >
            <Plus className="w-4 h-4 shrink-0" />
            <span>Add Campus</span>
          </button>
          <button
            onClick={() => onRouteChange('platform-modules')}
            className="h-10 px-4 bg-white hover:bg-purple-50/60 border border-slate-200 text-slate-700 hover:text-purple-700 rounded-xl text-xs font-semibold transition-all flex items-center gap-1.5 cursor-pointer shadow-2xs whitespace-nowrap shrink-0"
          >
            <Sliders className="w-4 h-4 text-purple-600 shrink-0" />
            <span>Wings Matrix</span>
          </button>
        </div>
      </div>

      {/* 2. Top Row: 4 Pastel Colored KPI Cards with Dedicated View Details Eye Buttons */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5 items-stretch">
        
        {/* Card 1: Campuses (Lavender) */}
        <div className="bg-[#f5eeff] border border-purple-100/90 rounded-2xl p-4 sm:p-5 transition-all duration-200 hover:shadow-sm shadow-2xs flex flex-col justify-between h-full min-h-[148px] overflow-hidden">
          {/* Top Row: Metric & Decorative Icon */}
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0">
              <span className="block text-xs font-semibold text-slate-500 mb-1 truncate">
                {selectedTierFilter === 'all' ? 'Total Campuses' : `${currentFilterConfig.shortLabel} Campuses`}
              </span>
              <span className="text-2xl sm:text-3xl font-extrabold text-slate-900 font-heading">
                {displayTotalCampuses}
              </span>
            </div>
            <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-2xl bg-white/80 text-purple-600 flex items-center justify-center shrink-0 shadow-2xs">
              <School className="w-5 h-5 stroke-[1.8]" />
            </div>
          </div>

          {/* Bottom Row: Status Badge on Left, Non-clickable Manage Text + Dedicated Eye Button on Right */}
          <div className="flex items-center justify-between gap-1.5 mt-4 pt-3 border-t border-purple-200/50">
            <span className="text-[11px] font-bold text-purple-700 bg-purple-100/70 px-2 py-0.5 rounded-full whitespace-nowrap">
              {displayActiveCampuses} Active
            </span>

            <div className="flex items-center gap-1.5 shrink-0">
              <span className="text-xs font-medium text-slate-500 select-none">
                Manage
              </span>

              {/* View Campuses Directory (Eye Button) */}
              <button
                type="button"
                onClick={() => onRouteChange('institutes')}
                className="w-7 h-7 rounded-full border border-purple-200 bg-white hover:bg-purple-600 hover:text-white text-purple-600 flex items-center justify-center transition-all cursor-pointer shadow-2xs hover:scale-105 active:scale-95 shrink-0"
                title="View Campuses Directory"
                aria-label="View Campuses Directory"
              >
                <Eye className="w-3.5 h-3.5 stroke-[2]" />
              </button>

              {/* Directly Add New Campus (Plus Button) */}
              <button
                type="button"
                onClick={handleDirectAddCampus}
                className="w-7 h-7 rounded-full bg-purple-600 hover:bg-purple-700 text-white flex items-center justify-center transition-all cursor-pointer shadow-xs shadow-purple-600/30 hover:scale-110 active:scale-95 shrink-0"
                title="Directly Add / Onboard New Campus"
                aria-label="Add New Campus"
              >
                <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
              </button>
            </div>
          </div>
        </div>

        {/* Card 2: Students (Sky Blue) */}
        <div className="bg-[#f0f9ff] border border-sky-100/90 rounded-2xl p-4 sm:p-5 transition-all duration-200 hover:shadow-sm shadow-2xs flex flex-col justify-between h-full min-h-[148px] overflow-hidden">
          {/* Top Row: Metric & Decorative Icon */}
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0">
              <span className="block text-xs font-semibold text-slate-500 mb-1 truncate">
                {selectedTierFilter === 'all' ? 'Total Students' : `${currentFilterConfig.shortLabel} Students`}
              </span>
              <span className="text-2xl sm:text-3xl font-extrabold text-slate-900 font-heading">
                {formattedStudents}
              </span>
            </div>
            <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-2xl bg-white/80 text-sky-500 flex items-center justify-center shrink-0 shadow-2xs">
              <GraduationCap className="w-5 h-5 stroke-[1.8]" />
            </div>
          </div>

          {/* Bottom Row: Status Badge on Left, Non-clickable All Wings Text + Dedicated Eye Button on Right */}
          <div className="flex items-center justify-between gap-1.5 mt-4 pt-3 border-t border-sky-200/50">
            <span className="text-[11px] font-bold text-sky-700 bg-sky-100/70 px-2 py-0.5 rounded-full whitespace-nowrap">
              {selectedTierFilter === 'all' ? '+12.4% MoM' : `${filteredInstitutes.length} Campuses`}
            </span>

            <div className="flex items-center gap-1.5 shrink-0">
              <span className="text-xs font-medium text-slate-500 select-none whitespace-nowrap">
                {selectedTierFilter === 'all' ? 'All Wings' : currentFilterConfig.badge}
              </span>
              <button
                type="button"
                onClick={() => onRouteChange('institutes')}
                className="w-7 h-7 rounded-full border border-sky-200 bg-white hover:bg-sky-500 hover:text-white text-sky-500 flex items-center justify-center transition-all cursor-pointer shadow-2xs hover:scale-105 active:scale-95 shrink-0"
                title="View All Wings & Students"
                aria-label="View All Wings & Students"
              >
                <Eye className="w-3.5 h-3.5 stroke-[2]" />
              </button>
            </div>
          </div>
        </div>

        {/* Card 3: Educational Wings (Peach / Amber) */}
        <div className="bg-[#fff7ed] border border-amber-100/90 rounded-2xl p-4 sm:p-5 transition-all duration-200 hover:shadow-sm shadow-2xs flex flex-col justify-between h-full min-h-[148px] overflow-hidden">
          {/* Top Row: Metric & Decorative Icon */}
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0">
              <span className="block text-xs font-semibold text-slate-500 mb-1 truncate">
                Educational Wings
              </span>
              <span className="text-2xl sm:text-3xl font-extrabold text-slate-900 font-heading">
                {displayWingsValue}
              </span>
            </div>
            <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-2xl bg-white/80 text-amber-500 flex items-center justify-center shrink-0 shadow-2xs">
              <Sliders className="w-5 h-5 stroke-[1.8]" />
            </div>
          </div>

          {/* Bottom Row: Status Badge on Left, Non-clickable Matrix Text + Dedicated Eye Button on Right */}
          <div className="flex items-center justify-between gap-1.5 mt-4 pt-3 border-t border-amber-200/50">
            <span className="text-[11px] font-bold text-amber-800 bg-amber-100/70 px-2 py-0.5 rounded-full whitespace-nowrap">
              {displayWingsBadge}
            </span>

            <div className="flex items-center gap-1.5 shrink-0">
              <span className="text-xs font-medium text-slate-500 select-none whitespace-nowrap">
                Matrix
              </span>
              <button
                type="button"
                onClick={() => onRouteChange('platform-modules')}
                className="w-7 h-7 rounded-full border border-amber-200 bg-white hover:bg-amber-500 hover:text-white text-amber-600 flex items-center justify-center transition-all cursor-pointer shadow-2xs hover:scale-105 active:scale-95 shrink-0"
                title="View Wings Matrix"
                aria-label="View Wings Matrix"
              >
                <Eye className="w-3.5 h-3.5 stroke-[2]" />
              </button>
            </div>
          </div>
        </div>

        {/* Card 4: Platform MRR (Mint Green) */}
        <div className="bg-[#f0fdf4] border border-emerald-100/90 rounded-2xl p-4 sm:p-5 transition-all duration-200 hover:shadow-sm shadow-2xs flex flex-col justify-between h-full min-h-[148px] overflow-hidden">
          {/* Top Row: Metric & Decorative Icon */}
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0">
              <span className="block text-xs font-semibold text-slate-500 mb-1 truncate">
                {selectedTierFilter === 'all' ? 'Platform MRR' : `${currentFilterConfig.shortLabel} MRR`}
              </span>
              <span className="text-2xl sm:text-3xl font-extrabold text-slate-900 font-heading">
                {displayMRRValue}
              </span>
            </div>
            <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-2xl bg-white/80 text-emerald-500 flex items-center justify-center shrink-0 shadow-2xs">
              <CreditCard className="w-5 h-5 stroke-[1.8]" />
            </div>
          </div>

          {/* Bottom Row: Status Badge on Left, Non-clickable Billing Text + Dedicated Eye Button on Right */}
          <div className="flex items-center justify-between gap-1.5 mt-4 pt-3 border-t border-emerald-200/50">
            <span className="text-[11px] font-bold text-emerald-800 bg-emerald-100/70 px-2 py-0.5 rounded-full whitespace-nowrap">
              {displayMRRBadge}
            </span>

            <div className="flex items-center gap-1.5 shrink-0">
              <span className="text-xs font-medium text-slate-500 select-none whitespace-nowrap">
                Billing
              </span>
              <button
                type="button"
                onClick={() => onRouteChange('platform-billing')}
                className="w-7 h-7 rounded-full border border-emerald-200 bg-white hover:bg-emerald-600 hover:text-white text-emerald-600 flex items-center justify-center transition-all cursor-pointer shadow-2xs hover:scale-105 active:scale-95 shrink-0"
                title="View Subscriptions & Billing"
                aria-label="View Subscriptions & Billing"
              >
                <Eye className="w-3.5 h-3.5 stroke-[2]" />
              </button>
            </div>
          </div>
        </div>

      </div>

      {/* 3. Middle Section: Dual Bar Chart & Educational Wings Donut Ring */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        
        {/* Left Card (7 cols): Executive Campus Financial & Growth Performance Chart */}
        <div className="lg:col-span-7 bg-white rounded-3xl p-5 sm:p-7 border border-slate-100 shadow-[0_2px_15px_rgba(0,0,0,0.02)] flex flex-col justify-between relative overflow-hidden">
          
          {/* 1. Header with Clear Title & Metric Switcher Tabs */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
            <div>
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-purple-600 animate-pulse"></span>
                <h2 className="text-base font-extrabold text-slate-900 tracking-tight font-heading">
                  Monthly Campus Revenue & Growth
                </h2>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                {executiveMetric === 'revenue' && 'Monthly fee collections & recovery across network in PKR (₨)'}
                {executiveMetric === 'students' && 'Active enrolled students & admissions pipeline by academic wing'}
                {executiveMetric === 'recovery' && 'Monthly collection efficiency benchmark vs 90% target'}
              </p>
            </div>

            {/* Metric Switcher Tabs (Super Admin can switch view with 1 click) */}
            <div className="flex items-center p-1 bg-slate-100/80 rounded-xl text-xs font-bold gap-1 self-start sm:self-auto shrink-0">
              <button
                type="button"
                onClick={() => setExecutiveMetric('revenue')}
                className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer flex items-center gap-1.5 ${
                  executiveMetric === 'revenue'
                    ? 'bg-white text-purple-700 shadow-2xs font-extrabold'
                    : 'text-slate-600 hover:text-purple-700'
                }`}
                title="View Fee Revenue in PKR"
              >
                <span>₨ Revenue</span>
              </button>

              <button
                type="button"
                onClick={() => setExecutiveMetric('students')}
                className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer flex items-center gap-1.5 ${
                  executiveMetric === 'students'
                    ? 'bg-white text-purple-700 shadow-2xs font-extrabold'
                    : 'text-slate-600 hover:text-purple-700'
                }`}
                title="View Enrolled Students"
              >
                <span>🎓 Students</span>
              </button>

              <button
                type="button"
                onClick={() => setExecutiveMetric('recovery')}
                className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer flex items-center gap-1.5 ${
                  executiveMetric === 'recovery'
                    ? 'bg-white text-purple-700 shadow-2xs font-extrabold'
                    : 'text-slate-600 hover:text-purple-700'
                }`}
                title="View Recovery Rate %"
              >
                <span>% Recovery</span>
              </button>
            </div>
          </div>

          {/* 2. Executive Quick Stats Summary Bar (High Super Admin Benefit) */}
          <div className="grid grid-cols-3 gap-2 py-3">
            <div className="px-3 py-2 rounded-xl bg-purple-50/50 border border-purple-100/60">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                {executiveChartData.summaryLabel}
              </span>
              <span className="text-sm sm:text-base font-extrabold text-purple-900 font-heading tracking-tight block mt-0.5">
                {executiveChartData.summaryValue}
              </span>
            </div>

            <div className="px-3 py-2 rounded-xl bg-slate-50 border border-slate-100">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                {executiveChartData.avgLabel}
              </span>
              <span className="text-sm sm:text-base font-bold text-slate-800 font-heading tracking-tight block mt-0.5">
                {executiveChartData.avgValue}
              </span>
            </div>

            <div className="px-3 py-2 rounded-xl bg-emerald-50/50 border border-emerald-100/60 flex flex-col justify-center">
              <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-600 block">
                Network Trend
              </span>
              <span className="text-xs sm:text-xs font-extrabold text-emerald-700 flex items-center gap-1 mt-0.5">
                <TrendingUp className="w-3.5 h-3.5 stroke-[2.5]" />
                <span>{executiveChartData.growthBadge}</span>
              </span>
            </div>
          </div>

          {/* 3. The Interactive Chart Area with Clear Y-Axis & Gridlines */}
          <div className="pt-2 pb-1 relative">
            
            {/* Chart Wrapper with Y-Axis on Left and Bars on Right */}
            <div className="flex items-stretch gap-2 sm:gap-3">
              
              {/* Y-Axis Scale Marks */}
              <div className="flex flex-col justify-between text-right text-[10px] font-mono font-medium text-slate-400 w-11 sm:w-13 shrink-0 h-44 sm:h-48 py-1 select-none">
                {executiveChartData.yAxisLabels.map((lbl, i) => (
                  <span key={i} className="leading-none">{lbl}</span>
                ))}
              </div>

              {/* Chart Grid & 12 Month Bar Columns */}
              <div className="flex-1 relative h-44 sm:h-48 flex items-end">
                
                {/* 5 Horizontal Dashed Benchmark Gridlines */}
                <div className="absolute inset-0 flex flex-col justify-between pointer-events-none py-1">
                  {[0, 1, 2, 3, 4].map(idx => (
                    <div key={idx} className="w-full border-b border-dashed border-slate-200/60 h-0" />
                  ))}
                </div>

                {/* 12 Months Dual Bars */}
                <div className="w-full h-full flex items-end justify-between gap-1 sm:gap-2 px-1 relative z-10">
                  {executiveChartData.months.map((item, idx) => {
                    const isHovered = hoveredMonthIdx === idx
                    const h1 = Math.max(6, Math.min(100, Math.round((item.v1 / executiveChartData.maxVal) * 100)))
                    const h2 = Math.max(6, Math.min(100, Math.round((item.v2 / executiveChartData.maxVal) * 100)))

                    return (
                      <div
                        key={idx}
                        onMouseEnter={() => setHoveredMonthIdx(idx)}
                        onMouseLeave={() => setHoveredMonthIdx(null)}
                        className={`flex-1 flex flex-col items-center justify-end h-full relative cursor-pointer group transition-all rounded-xl py-0.5 ${
                          isHovered ? 'bg-purple-100/40' : ''
                        }`}
                      >
                        {/* Peak indicator badge on top of May & Sep */}
                        {item.isPeak && (
                          <span className="absolute -top-2.5 text-[9px] font-extrabold text-amber-500 bg-amber-50 px-1 py-0.2 rounded border border-amber-200 shadow-2xs hidden sm:block pointer-events-none">
                            Peak
                          </span>
                        )}

                        {/* Dual Bar Graphic */}
                        <div className="w-full flex items-end justify-center gap-0.5 sm:gap-1 h-full pb-1">
                          {/* Purple Bar: School Campuses */}
                          <div
                            style={{ height: `${h1}%` }}
                            className={`w-1.5 sm:w-2.5 rounded-t-md bg-gradient-to-t from-purple-700 via-purple-600 to-indigo-500 transition-all duration-300 shadow-2xs ${
                              isHovered ? 'brightness-110 scale-y-105' : ''
                            }`}
                          />
                          {/* Orange Bar: Colleges & Universities */}
                          <div
                            style={{ height: `${h2}%` }}
                            className={`w-1.5 sm:w-2.5 rounded-t-md bg-gradient-to-t from-orange-600 via-orange-500 to-amber-400 transition-all duration-300 shadow-2xs ${
                              isHovered ? 'brightness-110 scale-y-105' : ''
                            }`}
                          />
                        </div>

                        {/* Month Label */}
                        <span className={`text-[10px] sm:text-[11px] font-bold transition-colors select-none ${
                          isHovered ? 'text-purple-700 font-extrabold' : 'text-slate-500'
                        }`}>
                          {item.m}
                        </span>

                        {/* Floating Tooltip Card (Appears directly over hovered month) */}
                        {isHovered && (
                          <div 
                            className={`absolute z-30 bottom-full mb-3 w-48 sm:w-52 bg-slate-900/95 backdrop-blur-md text-white p-3 rounded-2xl shadow-xl shadow-purple-950/20 text-left pointer-events-none animate-in fade-in zoom-in-95 duration-150 ${
                              idx > 8 ? 'right-0' : idx < 3 ? 'left-0' : 'left-1/2 -translate-x-1/2'
                            }`}
                          >
                            <div className="flex items-center justify-between pb-1.5 border-b border-slate-700/80 mb-2">
                              <span className="font-extrabold text-xs text-white">
                                {item.m} 2026
                              </span>
                              <span className="text-[10px] font-bold text-emerald-400 bg-emerald-950/80 px-1.5 py-0.2 rounded border border-emerald-500/30">
                                {item.total}
                              </span>
                            </div>

                            <div className="space-y-1.5 text-[11px]">
                              <div className="flex items-center justify-between">
                                <span className="flex items-center gap-1.5 text-slate-300">
                                  <span className="w-2 h-2 rounded-full bg-purple-400 shrink-0"></span>
                                  <span>Schools:</span>
                                </span>
                                <span className="font-bold text-white font-mono">{item.label1}</span>
                              </div>

                              <div className="flex items-center justify-between">
                                <span className="flex items-center gap-1.5 text-slate-300">
                                  <span className="w-2 h-2 rounded-full bg-orange-400 shrink-0"></span>
                                  <span>College/Uni:</span>
                                </span>
                                <span className="font-bold text-white font-mono">{item.label2}</span>
                              </div>
                            </div>

                            <div className="mt-2 pt-1.5 border-t border-slate-800 text-[10px] text-slate-400 flex items-center justify-between">
                              <span>Note:</span>
                              <span className="text-purple-300 font-medium truncate">{item.note}</span>
                            </div>
                          </div>
                        )}
                      </div>
                    )
                  })}
                </div>
              </div>
            </div>
          </div>

          {/* 4. Bottom Legend with Easy-to-Understand Institutional Names */}
          <div className="flex flex-wrap items-center justify-between gap-3 pt-3 mt-1 border-t border-slate-100 text-xs">
            <div className="flex flex-wrap items-center gap-4 text-xs font-semibold">
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-gradient-to-r from-purple-700 to-purple-500 shadow-2xs"></span>
                <span className="text-slate-700 font-bold">{executiveChartData.primaryLegend}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-gradient-to-r from-orange-600 to-amber-400 shadow-2xs"></span>
                <span className="text-slate-700 font-bold">{executiveChartData.secondaryLegend}</span>
              </div>
            </div>

            <div className="text-[11px] text-slate-400 font-medium hidden sm:flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5 text-amber-500 shrink-0" />
              <span>Real-time platform ledger feed</span>
            </div>
          </div>

        </div>

        {/* Right Card (5 cols): Wings Donut Ring Gauge matching "Students" Donut */}
        <div className="lg:col-span-5 bg-white rounded-3xl p-6 sm:p-7 border border-slate-100 shadow-[0_2px_15px_rgba(0,0,0,0.02)] flex flex-col justify-between">
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-base font-bold text-slate-900 tracking-tight font-heading">
              Educational Wings Ratio
            </h2>
            <button 
              onClick={() => onRouteChange('platform-modules')}
              className="text-slate-400 hover:text-slate-600 p-1 rounded-lg"
              title="Configure Wings Matrix"
            >
              <MoreVertical className="w-4 h-4" />
            </button>
          </div>

          {/* Donut Ring Visual matching reference */}
          <div className="flex flex-col items-center justify-center py-4">
            <div className="relative w-44 h-44 flex items-center justify-center">
              <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
                {/* Background track circle */}
                <circle
                  cx="50"
                  cy="50"
                  r="38"
                  className="stroke-slate-100"
                  strokeWidth="11"
                  fill="transparent"
                />
                {/* Purple Ring (School Wing: ~65%) */}
                <circle
                  cx="50"
                  cy="50"
                  r="38"
                  className="stroke-purple-600"
                  strokeWidth="11"
                  strokeDasharray="238.76"
                  strokeDashoffset="83"
                  strokeLinecap="round"
                  fill="transparent"
                />
                {/* Orange Ring (College & Uni: ~35%) */}
                <circle
                  cx="50"
                  cy="50"
                  r="38"
                  className="stroke-orange-500"
                  strokeWidth="11"
                  strokeDasharray="238.76"
                  strokeDashoffset="165"
                  strokeLinecap="round"
                  fill="transparent"
                />
              </svg>

              {/* Inside center text */}
              <div className="absolute flex flex-col items-center justify-center text-center">
                <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                  {selectedTierFilter === 'all' ? 'Total' : currentFilterConfig.badge}
                </span>
                <span className="text-2xl font-extrabold text-slate-900 font-heading">
                  {formattedStudents}
                </span>
                <span className="text-[10px] text-purple-600 font-bold">
                  Enrolled
                </span>
              </div>
            </div>

            {/* Bottom Legend */}
            <div className="flex items-center justify-center gap-6 mt-4 text-xs font-semibold">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-purple-600"></span>
                <span className="text-slate-700">School (65%)</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-orange-500"></span>
                <span className="text-slate-700">College / Uni (35%)</span>
              </div>
            </div>
          </div>
        </div>

      </div>

      {/* 4. Bottom Section: Active Campuses Table & Recent Platform Activities */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        
        {/* Left Column (7 cols): Campuses Table matching "Star Students" table */}
        <div className="lg:col-span-7 bg-white rounded-3xl p-6 sm:p-7 border border-slate-100 shadow-[0_2px_15px_rgba(0,0,0,0.02)] flex flex-col justify-between">
          <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-slate-900 tracking-tight font-heading">
                  Registered Campuses & Wings
                </h2>
                                {selectedTierFilter !== 'all' && (
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-purple-100 text-purple-700 border border-purple-200 inline-flex items-center gap-1">
                    <span>{currentFilterConfig.label}</span>
                    <button
                      type="button"
                      onClick={() => handleSelectTierFilter('all')}
                      className="hover:text-purple-900 ml-0.5 cursor-pointer"
                      title="Clear filter"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                {selectedTierFilter === 'all' 
                  ? 'Active educational institutions and enabled tier structures'
                  : `Showing filtered ${currentFilterConfig.label} institutions`}
              </p>
            </div>
            <button 
              onClick={() => onRouteChange('institutes')}
              className="text-xs font-semibold text-purple-600 hover:text-purple-700 cursor-pointer"
            >
              View All ({filteredInstitutes.length})
            </button>
          </div>

          {/* Clean Data Table matching reference */}
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-100 text-slate-400 font-semibold text-[11px] uppercase tracking-wider">
                  <th className="py-3 px-3">Campus Name</th>
                  <th className="py-3 px-3">Code</th>
                  <th className="py-3 px-3">Active Wings</th>
                  <th className="py-3 px-3">Plan Tier</th>
                  <th className="py-3 px-3 text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {filteredInstitutes && filteredInstitutes.length > 0 ? (
                  filteredInstitutes.slice(0, 6).map((inst) => {
                    const wings = inst.enabledTiers || ['school']
                    return (
                      <tr 
                        key={inst.id}
                        className="hover:bg-slate-50/80 transition-colors group cursor-pointer"
                        onClick={() => onRouteChange('institutes')}
                        title={`Manage ${inst.name}`}
                      >
                        {/* Campus Avatar + Name */}
                        <td className="py-3.5 px-3">
                          <div className="flex items-center gap-2.5">
                            <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-purple-100 to-indigo-100 text-purple-700 font-bold flex items-center justify-center text-xs shrink-0">
                              {inst.name.charAt(0)}
                            </div>
                            <div>
                              <span className="font-semibold text-slate-900 group-hover:text-purple-700 transition-colors line-clamp-1">
                                {inst.name}
                              </span>
                              <span className="text-[10px] text-slate-400">
                                {inst.city || 'Central Region'}
                              </span>
                            </div>
                          </div>
                        </td>

                        {/* Code */}
                        <td className="py-3.5 px-3 font-mono font-semibold text-slate-600">
                          {inst.code}
                        </td>

                        {/* Active Wings Badges */}
                        <td className="py-3.5 px-3">
                          <div className="flex items-center gap-1 flex-wrap">
                            {wings.includes('school') && (
                              <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-purple-50 text-purple-700">
                                School
                              </span>
                            )}
                            {wings.includes('college') && (
                              <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-amber-50 text-amber-700">
                                College
                              </span>
                            )}
                            {(wings.includes('undergraduate') || wings.includes('university')) && (
                              <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-blue-50 text-blue-700">
                                Uni
                              </span>
                            )}
                            {(inst.type === 'Custom' || inst.planType === 'CUSTOM') && (
                              <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-indigo-50 text-indigo-700">
                                Custom
                              </span>
                            )}
                          </div>
                        </td>

                        {/* Plan */}
                        <td className="py-3.5 px-3 text-slate-600 font-medium">
                          {inst.planTier || 'School Plan'}
                        </td>

                        {/* Status */}
                        <td className="py-3.5 px-3 text-right">
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-100">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                            Active
                          </span>
                        </td>
                      </tr>
                    )
                  })
                ) : (
                  <tr>
                    <td colSpan={5} className="py-10 text-center text-xs text-slate-400">
                      <div className="flex flex-col items-center justify-center gap-2">
                        <School className="w-8 h-8 text-slate-300 stroke-[1.5]" />
                        <p className="font-semibold text-slate-700">
                          No {currentFilterConfig.label} campuses found
                        </p>
                        <p className="text-[11px] text-slate-400 max-w-sm">
                          There are currently no registered campuses matching this educational tier.
                        </p>
                        <div className="flex items-center gap-2 mt-1">
                          <button
                            type="button"
                            onClick={() => handleSelectTierFilter('all')}
                            className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-lg text-xs transition-colors cursor-pointer"
                          >
                            Clear Filter
                          </button>
                          <button
                            type="button"
                            onClick={handleOpenAddCampusModal}
                            className="px-3 py-1.5 bg-purple-600 hover:bg-purple-700 text-white font-semibold rounded-lg text-xs transition-colors cursor-pointer"
                          >
                            + Add {currentFilterConfig.badge} Campus
                          </button>
                        </div>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
          {/* Clean Table Footer matching reference */}
          <div className="pt-4 mt-auto border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
            <span>
              Showing {Math.min(6, filteredInstitutes.length)} of {filteredInstitutes.length} {selectedTierFilter !== 'all' ? currentFilterConfig.label : 'registered'} campuses
            </span>
            <button 
              onClick={() => onRouteChange('institutes')}
              className="text-purple-600 font-semibold hover:text-purple-700 hover:underline cursor-pointer flex items-center gap-1"
            >
              <span>Manage Campuses</span>
              <span>&rarr;</span>
            </button>
          </div>
        </div>

        {/* Right Column (5 cols): Activity Stream matching "All Exam Results" */}
        <div className="lg:col-span-5 bg-white rounded-3xl p-6 sm:p-7 border border-slate-100 shadow-[0_2px_15px_rgba(0,0,0,0.02)] flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-base font-bold text-slate-900 tracking-tight font-heading">
                Platform Activity Stream
              </h2>
              <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                Live
              </span>
            </div>

            {/* List with pastel icon blocks matching reference */}
            <div className="space-y-3.5">
              {recentActivity && recentActivity.length > 0 ? (
                recentActivity.slice(0, 4).map((act, i) => {
                  const colors = [
                    { bg: 'bg-sky-50', text: 'text-sky-600', icon: School },
                    { bg: 'bg-purple-50', text: 'text-purple-600', icon: CreditCard },
                    { bg: 'bg-teal-50', text: 'text-teal-600', icon: Sliders },
                    { bg: 'bg-amber-50', text: 'text-amber-600', icon: ShieldCheck }
                  ]
                  const c = colors[i % colors.length]
                  const IconComp = c.icon

                  return (
                    <div key={act.id || i} className="flex items-start gap-3 p-2.5 rounded-2xl hover:bg-slate-50 transition-colors">
                      <div className={`w-9 h-9 rounded-xl ${c.bg} ${c.text} flex items-center justify-center shrink-0`}>
                        <IconComp className="w-4.5 h-4.5" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-semibold text-slate-800 line-clamp-1">
                          {act.text}
                        </p>
                        <span className="text-[10px] text-slate-400 mt-0.5 inline-block">
                          {act.time}
                        </span>
                      </div>
                    </div>
                  )
                })
              ) : (
                <div className="py-8 text-center text-xs text-slate-400">
                  No activity recorded yet.
                </div>
              )}
            </div>
          </div>

          {/* Full-width soft lilac "View All" button matching reference */}
          <div className="pt-5 mt-4 border-t border-slate-100">
            <button
              onClick={() => onRouteChange('audit-logs')}
              className="w-full py-2.5 rounded-xl bg-[#f5eeff] hover:bg-[#ede0fe] text-purple-700 font-semibold text-xs transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <span>View All Platform Activity</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

      </div>

      {/* Quick Modal 1: Create New User */}
      <Modal
        isOpen={isUserModalOpen}
        onClose={() => setIsUserModalOpen(false)}
        title="Create New System User"
      >
        <form onSubmit={handleCreateUser} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-600 uppercase mb-1">Full Name</label>
            <input
              type="text"
              required
              placeholder="e.g. Dr. Salman Qureshi"
              value={newUserData.name}
              onChange={(e) => setNewUserData({ ...newUserData, name: e.target.value })}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 text-sm"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-600 uppercase mb-1">Email Address</label>
            <input
              type="email"
              required
              placeholder="e.g. salman.q@sms.edu"
              value={newUserData.email}
              onChange={(e) => setNewUserData({ ...newUserData, email: e.target.value })}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 text-sm"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-600 uppercase mb-1">Role</label>
              <select
                value={newUserData.role}
                onChange={(e) => setNewUserData({ ...newUserData, role: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 text-sm bg-white"
              >
                <option value="superadmin">Superadmin</option>
                <option value="institute_admin">Institute Admin</option>
                <option value="teacher">Teacher</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-600 uppercase mb-1">Phone Number</label>
              <input
                type="text"
                placeholder="+92 300 1234567"
                value={newUserData.phone}
                onChange={(e) => setNewUserData({ ...newUserData, phone: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 text-sm"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-600 uppercase mb-1">Assigned Institute</label>
            {institutes && institutes.length > 0 ? (
              <select
                value={newUserData.institute}
                onChange={(e) => setNewUserData({ ...newUserData, institute: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 text-sm bg-white"
              >
                <option value="">Select an Institute...</option>
                {institutes.map(inst => (
                  <option key={inst.id} value={inst.name}>{inst.name} ({inst.code})</option>
                ))}
              </select>
            ) : (
              <input
                type="text"
                placeholder="Central Headquarters / Global"
                value={newUserData.institute}
                onChange={(e) => setNewUserData({ ...newUserData, institute: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 text-sm"
              />
            )}
          </div>

          <div className="flex justify-end gap-3 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setIsUserModalOpen(false)}
              className="px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 text-sm font-medium text-white bg-purple-600 hover:bg-purple-700 rounded-xl shadow-sm transition-colors cursor-pointer"
            >
              Create User
            </button>
          </div>
        </form>
      </Modal>

      {/* Quick Modal 2: Register New Institute */}
      <Modal
        isOpen={isInstituteModalOpen}
        onClose={() => setIsInstituteModalOpen(false)}
        title="Register New Institute Campus"
      >
        <form onSubmit={handleCreateInstitute} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-600 uppercase mb-1">Institute / School Name</label>
            <input
              type="text"
              required
              placeholder="e.g. Oxford Grammar School - Main Campus"
              value={newInstituteData.name}
              onChange={(e) => setNewInstituteData({ ...newInstituteData, name: e.target.value })}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 text-sm"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-600 uppercase mb-1">Campus Code</label>
              <input
                type="text"
                required
                placeholder="e.g. OXF-001"
                value={newInstituteData.code}
                onChange={(e) => setNewInstituteData({ ...newInstituteData, code: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 text-sm uppercase"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-600 uppercase mb-1">City / Region</label>
              <input
                type="text"
                required
                placeholder="e.g. Lahore"
                value={newInstituteData.city}
                onChange={(e) => setNewInstituteData({ ...newInstituteData, city: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 text-sm"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-600 uppercase mb-1">Campus Address</label>
            <input
              type="text"
              placeholder="e.g. Sector H-12, Education Avenue"
              value={newInstituteData.address}
              onChange={(e) => setNewInstituteData({ ...newInstituteData, address: e.target.value })}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 text-sm"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-600 uppercase mb-1">Subscription Plan & Educational Tier</label>
            <select
              value={newInstituteData.planTier}
              onChange={(e) => {
                const val = e.target.value
                const map = {
                  'School Plan': { planType: 'SCHOOL', enabledTiers: ['school'] },
                  'College Plan': { planType: 'COLLEGE', enabledTiers: ['college'] },
                  'University Plan': { planType: 'UNIVERSITY', enabledTiers: ['undergraduate'] },
                  'Custom Hybrid Plan': { planType: 'CUSTOM', enabledTiers: ['school', 'college'] }
                }
                const conf = map[val] || map['School Plan']
                setNewInstituteData({
                  ...newInstituteData,
                  planTier: val,
                  planType: conf.planType,
                  enabledTiers: conf.enabledTiers
                })
              }}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 text-sm bg-white"
            >
              <option value="School Plan">School Plan (Primary & High School)</option>
              <option value="College Plan">College Plan (Intermediate / HSSC)</option>
              <option value="University Plan">University Plan (Undergraduates / BS Degrees)</option>
              <option value="Custom Hybrid Plan">Custom Hybrid Plan (Multi-Wing Combo)</option>
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-600 uppercase mb-1">Official Email</label>
              <input
                type="email"
                placeholder="admin@oxford.edu"
                value={newInstituteData.email}
                onChange={(e) => setNewInstituteData({ ...newInstituteData, email: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-600 uppercase mb-1">Phone Number</label>
              <input
                type="text"
                placeholder="+92 300 9876543"
                value={newInstituteData.phone}
                onChange={(e) => setNewInstituteData({ ...newInstituteData, phone: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 text-sm"
              />
            </div>
          </div>

          <div className="pt-2 border-t border-slate-100">
            <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-2 flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-purple-600" />
              Campus Administrator Login Credentials
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-600 uppercase mb-1">Admin Email (Login ID)</label>
                <input
                  type="email"
                  placeholder={newInstituteData.code ? `admin@${newInstituteData.code.toLowerCase().replace(/[^a-z0-9]/g, '')}.edu` : "admin@campus.edu"}
                  value={newInstituteData.adminEmail}
                  onChange={(e) => setNewInstituteData({ ...newInstituteData, adminEmail: e.target.value })}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 text-xs"
                />
                <p className="text-[10px] text-slate-400 mt-0.5">Leave empty to auto-generate</p>
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-600 uppercase mb-1">Initial Password</label>
                <input
                  type="text"
                  placeholder="Password123!"
                  value={newInstituteData.adminPassword}
                  onChange={(e) => setNewInstituteData({ ...newInstituteData, adminPassword: e.target.value })}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 text-xs font-mono"
                />
                <p className="text-[10px] text-slate-400 mt-0.5">Default: Password123!</p>
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setIsInstituteModalOpen(false)}
              className="px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 text-sm font-medium text-white bg-purple-600 hover:bg-purple-700 rounded-xl shadow-sm transition-colors cursor-pointer"
            >
              Register Institute
            </button>
          </div>
        </form>
      </Modal>

      {/* Newly Registered Institute Credentials Popup */}
      {newlyCreatedCreds && (
        <Modal
          isOpen={true}
          onClose={() => setNewlyCreatedCreds(null)}
          title="Campus Registered & Credentials Ready"
        >
          <div className="space-y-4">
            <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-start gap-3">
              <div className="w-9 h-9 rounded-xl bg-emerald-600 text-white flex items-center justify-center shrink-0">
                <Check className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-emerald-950">Campus & Admin Account Active</h4>
                <p className="text-xs text-emerald-800 mt-0.5">
                  The campus <strong>{newlyCreatedCreds.name}</strong> ({newlyCreatedCreds.code}) has been created with <strong>{newlyCreatedCreds.planTier}</strong>. Copy these credentials to send to your client:
                </p>
              </div>
            </div>

            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 space-y-2.5 text-xs">
              <div className="flex justify-between items-center pb-2 border-b border-slate-200">
                <span className="text-slate-500 font-medium">Administrator Name:</span>
                <span className="font-semibold text-slate-800">{newlyCreatedCreds.adminName}</span>
              </div>
              <div className="flex justify-between items-center pb-2 border-b border-slate-200">
                <span className="text-slate-500 font-medium">Login Email:</span>
                <span className="font-mono font-bold text-purple-700 bg-purple-50 px-2 py-0.5 rounded-lg border border-purple-200">{newlyCreatedCreds.adminEmail}</span>
              </div>
              <div className="flex justify-between items-center pb-2 border-b border-slate-200">
                <span className="text-slate-500 font-medium">Password:</span>
                <span className="font-mono font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-lg border border-amber-200">{newlyCreatedCreds.password}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-500 font-medium">Portal URL:</span>
                <span className="text-slate-600 font-mono text-[11px]">https://eims-app.vercel.app/</span>
              </div>
            </div>

            <button
              type="button"
              onClick={() => {
                const text = `🏫 Educational Institute Management System (EIMS)
📍 Campus: ${newlyCreatedCreds.name} (${newlyCreatedCreds.code})
📋 Plan: ${newlyCreatedCreds.planTier}
👤 Admin Name: ${newlyCreatedCreds.adminName}
📧 Login Email: ${newlyCreatedCreds.adminEmail}
🔑 Password: ${newlyCreatedCreds.password}
🌐 Login URL: https://eims-app.vercel.app/`
                if (navigator?.clipboard?.writeText) {
                  navigator.clipboard.writeText(text)
                }
                setCopiedCreds(true)
                triggerToast('Credentials copied to clipboard for client delivery!')
                setTimeout(() => setCopiedCreds(false), 3000)
              }}
              className="w-full py-3 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-sm transition-all cursor-pointer"
            >
              {copiedCreds ? <Check className="w-4 h-4 text-emerald-300" /> : <Copy className="w-4 h-4" />}
              <span>{copiedCreds ? 'Copied to Clipboard!' : 'Copy Login Credentials for Client'}</span>
            </button>

            <div className="flex justify-end pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setNewlyCreatedCreds(null)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* Quick Modal 3: Broadcast Notification to Active Sessions */}
      <Modal
        isOpen={isBroadcastModalOpen}
        onClose={() => setIsBroadcastModalOpen(false)}
        title="Broadcast Announcement to Active Sessions"
      >
        <form onSubmit={handleSendBroadcast} className="space-y-4">
          <div className="p-3 bg-purple-50 border border-purple-200 rounded-xl flex items-center gap-2.5 text-xs text-purple-800">
            <Radio className="w-4 h-4 text-purple-600 shrink-0 animate-pulse" />
            <span>This broadcast message will be dispatched immediately across active user sessions.</span>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-600 uppercase mb-1">Channel</label>
              <select
                value={broadcastData.channel}
                onChange={(e) => setBroadcastData({ ...broadcastData, channel: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 text-sm bg-white"
              >
                <option value="Portal Alert">In-App Alert</option>
                <option value="SMS">SMS Gateway</option>
                <option value="WhatsApp">WhatsApp</option>
                <option value="Email">Email Notification</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-600 uppercase mb-1">Recipient Group</label>
              <select
                value={broadcastData.recipientGroup}
                onChange={(e) => setBroadcastData({ ...broadcastData, recipientGroup: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 text-sm bg-white"
              >
                <option value="All Active Users">All Active Users</option>
                <option value="Campus Administrators">Campus Administrators</option>
                <option value="Teachers & Faculty">Teachers & Faculty</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-600 uppercase mb-1">Announcement Message</label>
            <textarea
              required
              rows={4}
              placeholder="e.g. System notice: Scheduled database optimization will take place tonight at 11:00 PM."
              value={broadcastData.message}
              onChange={(e) => setBroadcastData({ ...broadcastData, message: e.target.value })}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 text-sm"
            ></textarea>
          </div>

          <div className="flex justify-end gap-3 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setIsBroadcastModalOpen(false)}
              className="px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 text-sm font-medium text-white bg-purple-600 hover:bg-purple-700 rounded-xl shadow-sm transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              <Send className="w-3.5 h-3.5" />
              <span>Send Broadcast</span>
            </button>
          </div>
        </form>
      </Modal>
    </div>
  )
}

export default SuperadminDashboard
