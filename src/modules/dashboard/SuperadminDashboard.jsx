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
  CheckCircle2,
  Clock,
  Sparkles,
  Download,
  AlertCircle,
  School,
  Radio,
  Send,
  Eye,
  EyeOff,
  Search,
  X,
  ShieldCheck,
  GraduationCap,
  Copy,
  Check,
  CreditCard,
  MoreVertical,
  ChevronRight,
  ChevronLeft,
  ChevronDown,
  Filter,
  Layers,
  Activity,
  Award,
  Landmark,
  Calendar,
  Server,
  Globe,
  Bell,
  Database,
  ExternalLink,
  Package,
  CheckCircle,
  BarChart3,
  HelpCircle,
  FileText,
  Key,
  ShieldAlert
} from 'lucide-react'
import Modal from '../../components/common/Modal'
import { useAppData } from '../../context/AppDataContext'
import { AnalyticsService } from '../../services/analyticsService'
import { BillingService, FALLBACK_PLANS } from '../../services/billingService'
import { hashPassword } from '../../context/AuthContext'
import { API_BASE_URL } from '../../services/apiConfig'
import AnnouncementService from '../../services/announcementService'

export const SuperadminDashboard = ({ onRouteChange, onOpenSettings }) => {
  const { 
    stats = {}, 
    recentActivity = [], 
    addItem, 
    institutes = [],
    students = [],
    teachers = [],
    fees = [],
    users = [],
    activeWing,
    setActiveWing
  } = useAppData()

  // -------------------------------------------------------------
  // 1. MODALS & TOAST STATES
  // -------------------------------------------------------------
  const [isUserModalOpen, setIsUserModalOpen] = useState(false)
  const [isInstituteModalOpen, setIsInstituteModalOpen] = useState(false)
  const [isBroadcastModalOpen, setIsBroadcastModalOpen] = useState(false)
  const [isServerConfigModalOpen, setIsServerConfigModalOpen] = useState(false)
  const [activeConfigTab, setActiveConfigTab] = useState('subdomain') // 'subdomain' | 'fcm' | 'gateway' | 'backup'
  const [feedbackToast, setFeedbackToast] = useState(null)
  const [reportSuccess, setReportSuccess] = useState(false)
  const [isTestingConnection, setIsTestingConnection] = useState(false)

  // -------------------------------------------------------------
  // 2. TRANSACTION CHART STATES (YEAR FILTER & METRIC TOGGLE)
  // -------------------------------------------------------------
  const [selectedTransactionYear, setSelectedTransactionYear] = useState('2026')
  const [transactionMetric, setTransactionMetric] = useState('amount') // 'amount' (PKR ₨) | 'volume' (Count)
  const [hoveredMonthIdx, setHoveredMonthIdx] = useState(null)

  // -------------------------------------------------------------
  // 3. SCHOOLS OVERVIEW SEARCH & PAGINATION
  // -------------------------------------------------------------
  const [schoolsSearchQuery, setSchoolsSearchQuery] = useState('')
  const [schoolsPage, setSchoolsPage] = useState(1)
  const schoolsPerPage = 5

  // -------------------------------------------------------------
  // 4. STAFF DETAILS SEARCH & FILTER
  // -------------------------------------------------------------
  const [staffSearchQuery, setStaffSearchQuery] = useState('')
  const [staffRoleFilter, setStaffRoleFilter] = useState('all')

  // -------------------------------------------------------------
  // 4b. STAFF STATUS OVERRIDES (ACTIVE/INACTIVE TOGGLE)
  // -------------------------------------------------------------
  const [staffStatusOverrides, setStaffStatusOverrides] = useState(() => {
    try {
      const saved = localStorage.getItem('sms_staff_status_overrides')
      return saved ? JSON.parse(saved) : {}
    } catch {
      return {}
    }
  })

  const handleToggleStaffStatus = (staffId, staffName, currentStatus) => {
    const isCurrentlyActive = (staffStatusOverrides[staffId] || currentStatus || 'Active').toLowerCase() === 'active'
    const nextStatus = isCurrentlyActive ? 'Inactive' : 'Active'

    setStaffStatusOverrides(prev => {
      const updated = { ...prev, [staffId]: nextStatus }
      try {
        localStorage.setItem('sms_staff_status_overrides', JSON.stringify(updated))
      } catch {}
      return updated
    })

    // Persist status change into persistent data store if available
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        const rawStore = localStorage.getItem('sms_data_store')
        if (rawStore) {
          const parsed = JSON.parse(rawStore)
          if (Array.isArray(parsed.users)) {
            const uIdx = parsed.users.findIndex(u => u.id === staffId || u.email === staffId)
            if (uIdx !== -1) {
              parsed.users[uIdx].status = nextStatus
              localStorage.setItem('sms_data_store', JSON.stringify(parsed))
            }
          }
        }
      }
    } catch {}

    triggerToast(`${staffName || 'Staff member'} is now ${nextStatus}`)
  }

  // -------------------------------------------------------------
  // 5. MODAL FORM STATES
  // -------------------------------------------------------------
  const [userFormError, setUserFormError] = useState('')
  const [instituteFormError, setInstituteFormError] = useState('')
  const [showCredentialPassword, setShowCredentialPassword] = useState(false)

  const [newUserData, setNewUserData] = useState({
    name: '',
    email: '',
    role: 'institute_admin',
    institute: '',
    phone: '',
    password: ''
  })

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

  const [newlyCreatedCreds, setNewlyCreatedCreds] = useState(null)
  const [copiedCreds, setCopiedCreds] = useState(false)

  const [broadcastData, setBroadcastData] = useState({
    title: '',
    channel: 'In-App',
    recipientGroup: 'All Active Users',
    message: ''
  })

  const triggerToast = (msg) => {
    setFeedbackToast(msg)
    setTimeout(() => setFeedbackToast(null), 3500)
  }

  // -------------------------------------------------------------
  // 6. COMPUTED SUMMARY CARDS DATA (TOP ROW)
  // -------------------------------------------------------------
  const totalSchoolsCount = (institutes || []).length
  const activeSchoolsCount = (institutes || []).filter(i => (i.status || 'Active').toLowerCase() === 'active').length
  const inactiveSchoolsCount = (institutes || []).filter(i => (i.status || 'Active').toLowerCase() !== 'active').length
  const totalPackagesCount = FALLBACK_PLANS.length || 3

  // -------------------------------------------------------------
  // 7. COMPUTED TRANSACTION DATA BY YEAR (REAL-TIME DATA)
  // -------------------------------------------------------------
  const transactionYearData = useMemo(() => {
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
    const selectedYearInt = parseInt(selectedTransactionYear, 10) || 2026

    // Read stored platform invoices
    let storedInvoices = []
    try {
      const rawInvoices = localStorage.getItem('sms_platform_invoices')
      if (rawInvoices) storedInvoices = JSON.parse(rawInvoices)
    } catch {}

    // Initialize 12 month buckets with 0
    const monthAggregates = monthNames.map((m, idx) => ({
      month: m,
      monthIdx: idx,
      amount: 0,
      volume: 0,
      notes: []
    }))

    // 1. Real Student Fee Transactions (from AppDataContext fees)
    ;(fees || []).forEach(f => {
      const dateStr = f.paidDate || f.paymentDate || f.date || f.dueDate || f.createdAt
      if (!dateStr) return
      const d = new Date(dateStr)
      if (isNaN(d.getTime())) return
      if (d.getFullYear() === selectedYearInt) {
        const mIdx = d.getMonth()
        if (mIdx >= 0 && mIdx < 12) {
          const feeAmt = Number(f.paidAmount || f.amount || 0)
          monthAggregates[mIdx].amount += feeAmt
          monthAggregates[mIdx].volume += 1
          if (feeAmt > 0 && monthAggregates[mIdx].notes.length < 2) {
            monthAggregates[mIdx].notes.push(`Fee: ₨ ${feeAmt.toLocaleString()}`)
          }
        }
      }
    })

    // 2. Real Platform SaaS Invoices (from sms_platform_invoices)
    storedInvoices.forEach(inv => {
      const dateStr = inv.paidDate || inv.issueDate || inv.date || inv.createdAt
      if (!dateStr) return
      const d = new Date(dateStr)
      if (isNaN(d.getTime())) return
      if (d.getFullYear() === selectedYearInt) {
        const mIdx = d.getMonth()
        if (mIdx >= 0 && mIdx < 12) {
          const invAmt = Number(inv.amount || inv.totalAmount || 0)
          monthAggregates[mIdx].amount += invAmt
          monthAggregates[mIdx].volume += 1
          if (invAmt > 0 && monthAggregates[mIdx].notes.length < 2) {
            monthAggregates[mIdx].notes.push(`Invoice: ₨ ${invAmt.toLocaleString()}`)
          }
        }
      }
    })

    // 3. Real Active Campus Subscription Settlements
    // For each registered active institute, calculate verified monthly subscription billing
    ;(institutes || []).forEach(inst => {
      if ((inst.status || 'Active').toLowerCase() === 'inactive') return

      const tierStr = (inst.planTier || inst.planType || 'School Plan').toLowerCase()
      let planMonthlyFee = 25000 // default School Plan
      if (tierStr.includes('enterprise') || tierStr.includes('network') || tierStr.includes('multi')) {
        planMonthlyFee = 45000
      } else if (tierStr.includes('trial') || tierStr.includes('free') || tierStr.includes('eval')) {
        planMonthlyFee = 0 // Free tier
      } else if (inst.pricePKR) {
        planMonthlyFee = Number(inst.pricePKR)
      }

      // Check institute active dates
      const createdDateStr = inst.createdAt || inst.registrationDate || inst.joinedAt || '2026-01-01'
      const createdDate = new Date(createdDateStr)
      const createdYear = !isNaN(createdDate.getTime()) ? createdDate.getFullYear() : 2026
      const createdMonth = !isNaN(createdDate.getTime()) ? createdDate.getMonth() : 0

      // Only accrue for months institute was active
      monthAggregates.forEach((mAgg, idx) => {
        const isMonthActive = selectedYearInt > createdYear || (selectedYearInt === createdYear && idx >= createdMonth)
        const currentYear = new Date().getFullYear()
        const currentMonth = new Date().getMonth()
        const isPastOrCurrent = selectedYearInt < currentYear || (selectedYearInt === currentYear && idx <= currentMonth)

        if (isMonthActive && isPastOrCurrent) {
          mAgg.amount += planMonthlyFee
          mAgg.volume += 1
          if (planMonthlyFee > 0 && mAgg.notes.length < 2) {
            mAgg.notes.push(`${inst.name || 'Campus'}: ₨ ${planMonthlyFee.toLocaleString()}`)
          }
        }
      })
    })

    // Determine peak month dynamically
    let peakIdx = 0
    let peakVal = 0
    monthAggregates.forEach((m, idx) => {
      const val = transactionMetric === 'amount' ? m.amount : m.volume
      if (val > peakVal) {
        peakVal = val
        peakIdx = idx
      }
    })

    const months = monthAggregates.map((m, idx) => ({
      month: m.month,
      monthIdx: idx,
      amount: m.amount,
      volume: m.volume,
      isPeak: idx === peakIdx && peakVal > 0,
      note: m.notes.length > 0 ? m.notes.join(' • ') : (m.amount > 0 ? 'Verified settlement' : 'No settlements')
    }))

    const maxAmount = Math.max(0, ...months.map(m => m.amount))
    const maxVolume = Math.max(0, ...months.map(m => m.volume))
    const totalYearAmount = months.reduce((acc, m) => acc + m.amount, 0)
    const totalYearVolume = months.reduce((acc, m) => acc + m.volume, 0)

    const activeMonthsCount = months.filter(m => m.amount > 0 || m.volume > 0).length || 1

    return {
      months,
      maxAmount,
      maxVolume,
      totalYearAmount,
      totalYearVolume,
      averageMonthlyAmount: Math.round(totalYearAmount / (totalYearAmount > 0 ? activeMonthsCount : 12)),
      averageMonthlyVolume: Math.round(totalYearVolume / (totalYearVolume > 0 ? activeMonthsCount : 12)),
      peakMonthName: peakVal > 0 ? months[peakIdx]?.month : '—',
      peakMonthIdx: peakVal > 0 ? peakIdx : -1,
      peakMonthValue: peakVal
    }
  }, [selectedTransactionYear, transactionMetric, institutes, fees])

  // -------------------------------------------------------------
  // 8. COMPUTED REGISTERED SCHOOLS LIST
  // -------------------------------------------------------------
  const allSchoolsList = useMemo(() => {
    return (institutes || []).map((inst, idx) => {
      const code = inst.code || `SCH-00${idx + 1}`
      const name = inst.name || 'Unnamed Institution'
      const city = inst.city || 'Lahore'
      const principal = inst.principal || inst.adminName || 'Campus Principal'
      const adminEmail = inst.adminEmail || inst.email || `admin@${code.toLowerCase()}.edu.pk`
      const status = inst.status || 'Active'
      const planTier = inst.planTier || inst.planType || 'School Plan'
      const logoUrl = inst.logoUrl || null

      return {
        id: inst.id || `inst-${idx}`,
        name,
        code,
        city,
        principal,
        adminEmail,
        status,
        planTier,
        logoUrl
      }
    })
  }, [institutes])

  const filteredSchools = useMemo(() => {
    if (!schoolsSearchQuery.trim()) return allSchoolsList
    const q = schoolsSearchQuery.toLowerCase().trim()
    return allSchoolsList.filter(s => 
      s.name.toLowerCase().includes(q) ||
      s.code.toLowerCase().includes(q) ||
      s.city.toLowerCase().includes(q) ||
      s.principal.toLowerCase().includes(q) ||
      s.adminEmail.toLowerCase().includes(q)
    )
  }, [allSchoolsList, schoolsSearchQuery])

  const totalSchoolPages = Math.max(1, Math.ceil(filteredSchools.length / schoolsPerPage))
  const paginatedSchools = useMemo(() => {
    const start = (schoolsPage - 1) * schoolsPerPage
    return filteredSchools.slice(start, start + schoolsPerPage)
  }, [filteredSchools, schoolsPage])

  // -------------------------------------------------------------
  // 9. COMPUTED SUBSCRIPTION DISTRIBUTION (DONUT / PIE CHART)
  // -------------------------------------------------------------
  const subscriptionDetails = useMemo(() => {
    const instList = institutes || []
    const total = instList.length

    // Always include standard tiers (Free Tier, School Plan, Smart Enterprise)
    const tierBuckets = {
      'Free Tier': {
        name: 'Free Tier',
        subName: '14-Day Evaluation Trial',
        count: 0,
        color: '#10B981', // Emerald
        bgClass: 'bg-emerald-500',
        match: (t) => t.includes('free') || t.includes('trial') || t.includes('eval')
      },
      'School Plan': {
        name: 'School Plan',
        subName: 'Standard Campus Tier',
        count: 0,
        color: '#9333EA', // Purple
        bgClass: 'bg-purple-600',
        match: (t) => t.includes('school') || t.includes('standard') || t.includes('single')
      },
      'Smart Enterprise': {
        name: 'Smart Enterprise',
        subName: 'Multi-Branch Network Tier',
        count: 0,
        color: '#6366F1', // Indigo
        bgClass: 'bg-indigo-600',
        match: (t) => t.includes('enterprise') || t.includes('network') || t.includes('multi')
      }
    }

    const customBuckets = {}

    instList.forEach(inst => {
      const tierStr = (inst.planTier || inst.planType || 'School Plan').toLowerCase()
      let matched = false
      for (const key of Object.keys(tierBuckets)) {
        if (tierBuckets[key].match(tierStr)) {
          tierBuckets[key].count += 1
          matched = true
          break
        }
      }
      if (!matched) {
        const rawName = inst.planTier || inst.planType || 'Custom Plan'
        if (!customBuckets[rawName]) {
          customBuckets[rawName] = {
            name: rawName,
            subName: 'Custom Licensed Tier',
            count: 0,
            color: '#EC4899', // Pink
            bgClass: 'bg-pink-500'
          }
        }
        customBuckets[rawName].count += 1
      }
    })

    const allTiers = [
      ...Object.values(tierBuckets),
      ...Object.values(customBuckets)
    ]

    return allTiers.map(tier => ({
      ...tier,
      percentage: total > 0 ? Number(((tier.count / total) * 100).toFixed(1)) : 0
    }))
  }, [institutes])

  // -------------------------------------------------------------
  // 10. COMPUTED STAFF DETAILS & ROLE ASSIGNMENTS
  // -------------------------------------------------------------
  const allStaffList = useMemo(() => {
    const rawUsers = users || []
    const platformStaff = rawUsers.filter(u => 
      !u.role || 
      u.role === 'superadmin' || 
      u.role === 'institute_admin' || 
      u.role === 'admin' || 
      u.role === 'support' || 
      u.role === 'accounts'
    )

    if (platformStaff.length > 0) {
      return platformStaff.map((u, idx) => ({
        id: u.id || `staff-${idx}`,
        name: u.name || 'Staff Member',
        email: u.email || 'staff@eims.edu.pk',
        roleTitle: u.roleTitle || (u.role === 'superadmin' ? 'Super Administrator' : u.role === 'institute_admin' ? 'School Admin' : 'Admin Head'),
        roleType: u.role || 'superadmin',
        assignedSchool: u.institute || u.instituteName || (u.role === 'superadmin' ? 'Global HQ (All Schools)' : 'Assigned Campus'),
        status: u.status || 'Active',
        phone: u.phone || '+92 300 0000000'
      }))
    }

    // Default professional platform staff if no custom users added yet
    return [
      {
        id: 'staff-1',
        name: 'Engr. Sammer Abbas',
        email: 'superadmin@smartms.pk',
        roleTitle: 'Super Administrator',
        roleType: 'superadmin',
        assignedSchool: 'Global HQ (All Schools)',
        status: 'Active',
        phone: '+92 300 8472910'
      },
      {
        id: 'staff-2',
        name: 'Prof. Tariq Mahmood',
        email: 'beacon.central@sms.edu',
        roleTitle: 'School Admin / Principal',
        roleType: 'institute_admin',
        assignedSchool: 'Beaconhouse Central High School',
        status: 'Active',
        phone: '+92 42 35789012'
      },
      {
        id: 'staff-3',
        name: 'Dr. Ayesha Malik',
        email: 'info@cityschool.edu',
        roleTitle: 'Admin Head',
        roleType: 'admin_head',
        assignedSchool: 'City School Model Town Campus',
        status: 'Active',
        phone: '+92 42 35889900'
      },
      {
        id: 'staff-4',
        name: 'Farhan Akhtar',
        email: 'accounts@smartms.pk',
        roleTitle: 'Billing & Audit Lead',
        roleType: 'accounts',
        assignedSchool: 'Central Finance HQ',
        status: 'Active',
        phone: '+92 321 4455667'
      }
    ]
  }, [users])

  const filteredStaff = useMemo(() => {
    return allStaffList.filter(s => {
      const matchesSearch = !staffSearchQuery.trim() || 
        s.name.toLowerCase().includes(staffSearchQuery.toLowerCase()) ||
        s.email.toLowerCase().includes(staffSearchQuery.toLowerCase()) ||
        s.assignedSchool.toLowerCase().includes(staffSearchQuery.toLowerCase())
      
      const matchesRole = staffRoleFilter === 'all' || s.roleType === staffRoleFilter
      return matchesSearch && matchesRole
    })
  }, [allStaffList, staffSearchQuery, staffRoleFilter])

  // -------------------------------------------------------------
  // 11. ACTION HANDLERS (USER, INSTITUTE, BROADCAST, CSV)
  // -------------------------------------------------------------
  const handleCreateUser = async (e) => {
    e.preventDefault()
    setUserFormError('')
    if (!newUserData.name || !newUserData.email) {
      setUserFormError('Please enter user name and email.')
      return
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(newUserData.email.trim())) {
      setUserFormError('Please enter a valid email address.')
      return
    }

    if ((users || []).some(u => u.email?.toLowerCase().trim() === newUserData.email.toLowerCase().trim())) {
      setUserFormError('A user account with this email address already exists.')
      return
    }

    try {
      const rawPassword = newUserData.password || 'Password123!'
      const passwordHash = await hashPassword(rawPassword)

      await addItem('users', {
        name: newUserData.name.trim(),
        email: newUserData.email.trim().toLowerCase(),
        role: newUserData.role,
        roleTitle: newUserData.role === 'superadmin' ? 'Super Administrator' : 'School Administrator',
        passwordHash,
        institute: newUserData.institute || 'Global HQ (All Schools)',
        phone: newUserData.phone || '+92 300 0000000',
        status: 'Active',
        lastLogin: 'Just now'
      })

      setIsUserModalOpen(false)
      setUserFormError('')
      setNewUserData({
        name: '',
        email: '',
        role: 'institute_admin',
        institute: '',
        phone: '',
        password: ''
      })
      triggerToast('New staff member added and roles assigned successfully!')
    } catch (err) {
      console.error(err)
      setUserFormError('Failed to provision user account. Please try again.')
    }
  }

  const handleCreateInstitute = async (e) => {
    e.preventDefault()
    setInstituteFormError('')
    if (!newInstituteData.name || !newInstituteData.code) {
      setInstituteFormError('Please enter institute name and campus code.')
      return
    }

    const instCode = newInstituteData.code.toUpperCase().trim()
    const cleanSlug = instCode.toLowerCase().replace(/[^a-z0-9]/g, '')
    const adminEmail = newInstituteData.adminEmail?.trim() || `admin@${cleanSlug}.edu.pk`
    const adminName = newInstituteData.adminName?.trim() || `${newInstituteData.name} Administrator`
    const adminPassword = newInstituteData.adminPassword || 'Password123!'

    if ((institutes || []).some(i => i.code?.toUpperCase().trim() === instCode)) {
      setInstituteFormError(`Campus code "${instCode}" is already in use. Please enter a unique code.`)
      return
    }

    try {
      const createdInst = await addItem('institutes', {
        name: newInstituteData.name.trim(),
        code: instCode,
        city: newInstituteData.city || 'Lahore',
        address: newInstituteData.address || `${newInstituteData.name} Campus, Lahore`,
        email: newInstituteData.email || adminEmail,
        phone: newInstituteData.phone || '+92 300 0000000',
        principal: adminName,
        adminName: adminName,
        adminEmail: adminEmail,
        studentsCount: 0,
        teachersCount: 0,
        status: 'Active',
        lifecycleStatus: 'Active',
        planTier: newInstituteData.planTier || 'School Plan',
        planType: newInstituteData.planType || 'SCHOOL',
        enabledTiers: ['school'],
        joinedDate: new Date().toISOString().split('T')[0]
      })

      const newInstId = createdInst?.id || `inst-${Date.now()}`
      const passwordHash = await hashPassword(adminPassword)
      
      await addItem('users', {
        name: adminName,
        email: adminEmail,
        passwordHash,
        role: 'institute_admin',
        roleTitle: 'School Administrator',
        instituteId: newInstId,
        institute: newInstituteData.name.trim(),
        phone: newInstituteData.phone || '+92 300 0000000',
        status: 'Active',
        lastLogin: 'Never'
      })

      try { window.dispatchEvent(new Event('sms_institutes_updated')) } catch {}

      setIsInstituteModalOpen(false)
      setInstituteFormError('')
      setNewlyCreatedCreds({
        name: newInstituteData.name.trim(),
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
      triggerToast(`School "${createdInst?.name || instCode}" onboarded successfully!`)
    } catch (err) {
      console.error(err)
      setInstituteFormError('Failed to onboard school. Please try again.')
    }
  }

  const handleSendBroadcast = (e) => {
    e.preventDefault()
    if (!broadcastData.message?.trim()) return

    const title = broadcastData.title?.trim() || 'Platform announcement'
    try {
      AnnouncementService.addAnnouncement({
        title,
        message: broadcastData.message.trim(),
        target: 'institute_admin',
        targetCampus: broadcastData.recipientGroup || 'All Registered Campuses',
        category: broadcastData.channel || 'General',
        priority: 'Normal',
        isActive: true,
        showInLandingBanner: false
      })
      addItem('recentActivity', {
        text: `Saved announcement "${title}" for ${broadcastData.recipientGroup}`,
        time: 'Just now'
      })
    } catch (err) {
      console.error(err)
      triggerToast('Could not save the announcement on this device.')
      return
    }

    setIsBroadcastModalOpen(false)
    setBroadcastData({
      title: '',
      channel: 'In-App',
      recipientGroup: 'All Active Users',
      message: ''
    })
    triggerToast('In-portal platform announcement broadcasted successfully!')
  }

  const handleGenerateReport = () => {
    AnalyticsService.exportExecutiveReportCSV()
    setReportSuccess(true)
    setTimeout(() => setReportSuccess(false), 3500)
  }

  const handleSimulateConnectionTest = async () => {
    setIsTestingConnection(true)
    const controller = new AbortController()
    const timer = setTimeout(() => controller.abort(), 2500)
    try {
      const res = await fetch(`${API_BASE_URL}/api/health`, { signal: controller.signal })
      if (!res.ok) {
        triggerToast('Simulated connection check (local UI only). API health did not respond OK.')
        return
      }
      const body = await res.json().catch(() => ({}))
      triggerToast(`API health responded: ${body.status || 'ONLINE'} (${body.database || 'local persistence'}).`)
    } catch {
      triggerToast('Simulated connection check (local UI only). No live API at the configured address.')
    } finally {
      clearTimeout(timer)
      setIsTestingConnection(false)
    }
  }

  const handleOpenConfigModal = (tab = 'subdomain') => {
    setActiveConfigTab(tab)
    setIsServerConfigModalOpen(true)
  }

  // -------------------------------------------------------------
  // 12. RENDER DASHBOARD
  // -------------------------------------------------------------
  return (
    <div className="p-3.5 sm:p-5 md:p-6 lg:p-7 pb-16 space-y-6 max-w-[1440px] mx-auto transition-colors duration-200">
      
      {/* Toast Feedback */}
      {feedbackToast && (
        <div className="fixed top-5 right-5 z-50 bg-slate-900 dark:bg-purple-950 text-white px-5 py-3.5 rounded-2xl flex items-center gap-3 shadow-xl border border-purple-500/30 animate-in fade-in slide-in-from-top-3">
          <CheckCircle2 className="w-5 h-5 text-purple-400 shrink-0" />
          <span className="text-xs sm:text-sm font-semibold">{feedbackToast}</span>
          <button onClick={() => setFeedbackToast(null)} className="ml-2 text-slate-400 hover:text-white p-1">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {reportSuccess && (
        <div className="fixed top-5 right-5 z-50 bg-slate-900 dark:bg-purple-950 text-white px-5 py-3.5 rounded-2xl flex items-center gap-3 shadow-xl border border-purple-500/30 animate-in fade-in">
          <CheckCircle2 className="w-5 h-5 text-purple-400 shrink-0" />
          <span className="text-xs sm:text-sm font-semibold">Audit CSV report generated and downloaded!</span>
        </div>
      )}

      {/* =========================================================
          HEADER ROW: BREADCRUMB & QUICK ACTION TOOLBAR
          ========================================================= */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200/80 dark:border-slate-800">
        
        {/* Breadcrumb Title */}
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-purple-100 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300 flex items-center justify-center border border-purple-200/80 dark:border-purple-800/60 shadow-xs">
            <Landmark className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight font-heading">
                Dashboard
              </h1>
              <span className="text-[10px] font-extrabold uppercase tracking-widest px-2.5 py-0.5 rounded-full bg-purple-100 dark:bg-purple-950/60 text-purple-800 dark:text-purple-300 border border-purple-200 dark:border-purple-800/60 hidden xs:inline-block">
                Platform Console
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Overview of multi-campus governance, transaction cashflow, and system health.
            </p>
          </div>
        </div>

        {/* Action Buttons Toolbar */}
        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={() => onRouteChange?.('institute-feature-control')}
            className="px-3 py-2 rounded-xl bg-white dark:bg-slate-900 hover:bg-purple-50 dark:hover:bg-purple-950/40 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-800 font-semibold text-xs transition-all flex items-center gap-1.5 cursor-pointer shadow-2xs hover:border-purple-300 dark:hover:border-purple-700 active:scale-98"
            title="Institute Feature Matrix & Overrides"
          >
            <Sliders className="w-3.5 h-3.5 text-purple-600 dark:text-purple-400" />
            <span className="hidden sm:inline">Feature Matrix</span>
          </button>

          <button
            onClick={() => onRouteChange?.('admin-team-control')}
            className="px-3 py-2 rounded-xl bg-white dark:bg-slate-900 hover:bg-indigo-50 dark:hover:bg-indigo-950/40 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-800 font-semibold text-xs transition-all flex items-center gap-1.5 cursor-pointer shadow-2xs hover:border-indigo-300 dark:hover:border-indigo-700 active:scale-98"
            title="Internal Admin & Team Governance"
          >
            <ShieldCheck className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
            <span className="hidden sm:inline">Team Control</span>
          </button>

          <button
            onClick={() => setIsUserModalOpen(true)}
            className="px-3.5 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs shadow-xs transition-all flex items-center gap-1.5 cursor-pointer active:scale-98"
            title="Add Platform Staff"
          >
            <UserPlus className="w-4 h-4 stroke-[2.2]" />
            <span>Add Staff</span>
          </button>

          <button
            onClick={() => setIsBroadcastModalOpen(true)}
            className="px-3 py-2 rounded-xl bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-800 font-semibold text-xs transition-all flex items-center gap-1.5 cursor-pointer shadow-2xs"
            title="Broadcast Notice"
          >
            <Send className="w-3.5 h-3.5 text-purple-600 dark:text-purple-400" />
            <span className="hidden md:inline">Broadcast</span>
          </button>

          <button
            onClick={handleGenerateReport}
            className="p-2 rounded-xl bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-800 transition-all cursor-pointer shadow-2xs"
            title="Download CSV Audit Report"
            aria-label="Download CSV Audit Report"
          >
            <Download className="w-4 h-4 text-slate-500 dark:text-slate-400" />
          </button>
        </div>
      </div>

      {/* =========================================================
          SECTION 1: TOP SUMMARY CARDS (TOTAL, ACTIVE, INACTIVE, PACKAGES)
          ========================================================= */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
        
        {/* Card 1: Total Schools */}
        <div className="p-5 sm:p-5.5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 shadow-xs flex items-stretch justify-between group">
          <div className="flex flex-col justify-between flex-1 min-w-0 pr-2">
            <div>
              <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider block">
                Total Schools
              </span>
              <div className="flex items-baseline gap-2 mt-1.5">
                <span className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white font-heading tracking-tight">
                  {totalSchoolsCount}
                </span>
                <span className="text-[11px] font-bold text-purple-700 dark:text-purple-300 bg-purple-50 dark:bg-purple-950/60 px-2 py-0.5 rounded-md border border-purple-200/60 dark:border-purple-800/50">
                  Registered
                </span>
              </div>
            </div>
            <span className="text-[11px] text-slate-400 dark:text-slate-500 mt-2 block">
              All registered campus entities
            </span>
          </div>

          <div className="flex flex-col items-end justify-between shrink-0">
            <div className="w-11 h-11 rounded-2xl bg-purple-50 dark:bg-purple-950/50 text-purple-600 dark:text-purple-400 border border-purple-200/80 dark:border-purple-800/60 flex items-center justify-center shrink-0 shadow-2xs">
              <School className="w-5.5 h-5.5 stroke-[2.2]" />
            </div>

            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation()
                if (onRouteChange) onRouteChange('institutes')
              }}
              title="View Total Schools Details"
              aria-label="View Total Schools Details"
              className="mt-3 p-1.5 sm:p-2 rounded-xl bg-slate-50 dark:bg-slate-800/80 hover:bg-purple-50 dark:hover:bg-purple-950/60 text-slate-400 hover:text-purple-600 dark:text-slate-400 dark:hover:text-purple-300 border border-slate-200/80 hover:border-purple-300 dark:border-slate-700 dark:hover:border-purple-800/70 transition-all cursor-pointer shadow-2xs flex items-center justify-center group/eye"
            >
              <Eye className="w-4 h-4 transition-transform group-hover/eye:scale-110" />
            </button>
          </div>
        </div>

        {/* Card 2: Active Schools */}
        <div className="p-5 sm:p-5.5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 shadow-xs flex items-stretch justify-between group">
          <div className="flex flex-col justify-between flex-1 min-w-0 pr-2">
            <div>
              <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider block">
                Active Schools
              </span>
              <div className="flex items-baseline gap-2 mt-1.5">
                <span className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white font-heading tracking-tight">
                  {activeSchoolsCount}
                </span>
                <span className="text-[11px] font-bold text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/60 px-2 py-0.5 rounded-md border border-emerald-200/60 dark:border-emerald-800/50">
                  Online
                </span>
              </div>
            </div>
            <span className="text-[11px] text-slate-400 dark:text-slate-500 mt-2 block">
              Operational &amp; verified portals
            </span>
          </div>

          <div className="flex flex-col items-end justify-between shrink-0">
            <div className="w-11 h-11 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 border border-emerald-200/80 dark:border-emerald-800/60 flex items-center justify-center shrink-0 shadow-2xs">
              <CheckCircle2 className="w-5.5 h-5.5 stroke-[2.2]" />
            </div>

            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation()
                if (onRouteChange) onRouteChange('institutes')
              }}
              title="View Active Schools Details"
              aria-label="View Active Schools Details"
              className="mt-3 p-1.5 sm:p-2 rounded-xl bg-slate-50 dark:bg-slate-800/80 hover:bg-emerald-50 dark:hover:bg-emerald-950/60 text-slate-400 hover:text-emerald-600 dark:text-slate-400 dark:hover:text-emerald-300 border border-slate-200/80 hover:border-emerald-300 dark:border-slate-700 dark:hover:border-emerald-800/70 transition-all cursor-pointer shadow-2xs flex items-center justify-center group/eye"
            >
              <Eye className="w-4 h-4 transition-transform group-hover/eye:scale-110" />
            </button>
          </div>
        </div>

        {/* Card 3: Inactive Schools */}
        <div className="p-5 sm:p-5.5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 shadow-xs flex items-stretch justify-between group">
          <div className="flex flex-col justify-between flex-1 min-w-0 pr-2">
            <div>
              <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider block">
                Inactive Schools
              </span>
              <div className="flex items-baseline gap-2 mt-1.5">
                <span className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white font-heading tracking-tight">
                  {inactiveSchoolsCount}
                </span>
                <span className={`text-[11px] font-bold px-2 py-0.5 rounded-md border ${
                  inactiveSchoolsCount > 0 
                    ? 'text-amber-700 dark:text-amber-300 bg-amber-50 dark:bg-amber-950/60 border-amber-200/60 dark:border-amber-800/50' 
                    : 'text-slate-600 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 border-slate-200'
                }`}>
                  {inactiveSchoolsCount > 0 ? 'Pending' : 'Zero Idle'}
                </span>
              </div>
            </div>
            <span className="text-[11px] text-slate-400 dark:text-slate-500 mt-2 block">
              Suspended or under setup
            </span>
          </div>

          <div className="flex flex-col items-end justify-between shrink-0">
            <div className="w-11 h-11 rounded-2xl bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 border border-amber-200/80 dark:border-amber-800/60 flex items-center justify-center shrink-0 shadow-2xs">
              <AlertCircle className="w-5.5 h-5.5 stroke-[2.2]" />
            </div>

            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation()
                if (onRouteChange) {
                  onRouteChange(inactiveSchoolsCount > 0 ? 'support-approvals' : 'institutes')
                }
              }}
              title="View Inactive Schools Details"
              aria-label="View Inactive Schools Details"
              className="mt-3 p-1.5 sm:p-2 rounded-xl bg-slate-50 dark:bg-slate-800/80 hover:bg-amber-50 dark:hover:bg-amber-950/60 text-slate-400 hover:text-amber-600 dark:text-slate-400 dark:hover:text-amber-300 border border-slate-200/80 hover:border-amber-300 dark:border-slate-700 dark:hover:border-amber-800/70 transition-all cursor-pointer shadow-2xs flex items-center justify-center group/eye"
            >
              <Eye className="w-4 h-4 transition-transform group-hover/eye:scale-110" />
            </button>
          </div>
        </div>

        {/* Card 4: Total Packages */}
        <div className="p-5 sm:p-5.5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 shadow-xs flex items-stretch justify-between group">
          <div className="flex flex-col justify-between flex-1 min-w-0 pr-2">
            <div>
              <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider block">
                Total Packages
              </span>
              <div className="flex items-baseline gap-2 mt-1.5">
                <span className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white font-heading tracking-tight">
                  {totalPackagesCount}
                </span>
                <span className="text-[11px] font-bold text-indigo-700 dark:text-indigo-300 bg-indigo-50 dark:bg-indigo-950/60 px-2 py-0.5 rounded-md border border-indigo-200/60 dark:border-indigo-800/50">
                  SaaS Tiers
                </span>
              </div>
            </div>
            <span className="text-[11px] text-slate-400 dark:text-slate-500 mt-2 block">
              Active subscription tiers
            </span>
          </div>

          <div className="flex flex-col items-end justify-between shrink-0">
            <div className="w-11 h-11 rounded-2xl bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 border border-indigo-200/80 dark:border-indigo-800/60 flex items-center justify-center shrink-0 shadow-2xs">
              <Package className="w-5.5 h-5.5 stroke-[2.2]" />
            </div>

            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation()
                if (onRouteChange) onRouteChange('platform-billing')
              }}
              title="View Packages & Subscriptions"
              aria-label="View Packages & Subscriptions"
              className="mt-3 p-1.5 sm:p-2 rounded-xl bg-slate-50 dark:bg-slate-800/80 hover:bg-indigo-50 dark:hover:bg-indigo-950/60 text-slate-400 hover:text-indigo-600 dark:text-slate-400 dark:hover:text-indigo-300 border border-slate-200/80 hover:border-indigo-300 dark:border-slate-700 dark:hover:border-indigo-800/70 transition-all cursor-pointer shadow-2xs flex items-center justify-center group/eye"
            >
              <Eye className="w-4 h-4 transition-transform group-hover/eye:scale-110" />
            </button>
          </div>
        </div>

      </div>

      {/* =========================================================
          SECTION 2: MIDDLE ROW (TRANSACTION CHART & REGISTERED SCHOOLS)
          ========================================================= */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 sm:gap-6 items-stretch">
        
        {/* Left Column (7 cols): Monthly Transaction Chart with Year Filter */}
        <div className="lg:col-span-7 bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-3xl p-5 sm:p-6 shadow-xs flex flex-col justify-between">
          <div>
            {/* Chart Header with Year Dropdown Filter */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-5 border-b border-slate-100 dark:border-slate-800">
              <div>
                <h3 className="text-base sm:text-lg font-extrabold text-slate-900 dark:text-white font-heading">
                  Transaction
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  Monthly fee volume &amp; subscription clearing for {selectedTransactionYear}
                </p>
              </div>

              <div className="flex items-center gap-2">
                {/* Metric Mode Toggle */}
                <div className="p-1 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center text-xs">
                  <button
                    onClick={() => setTransactionMetric('amount')}
                    className={`px-2.5 py-1 rounded-lg font-bold transition-all cursor-pointer ${
                      transactionMetric === 'amount'
                        ? 'bg-white dark:bg-slate-900 text-purple-700 dark:text-purple-300 shadow-2xs'
                        : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                    }`}
                  >
                    PKR (₨)
                  </button>
                  <button
                    onClick={() => setTransactionMetric('volume')}
                    className={`px-2.5 py-1 rounded-lg font-bold transition-all cursor-pointer ${
                      transactionMetric === 'volume'
                        ? 'bg-white dark:bg-slate-900 text-purple-700 dark:text-purple-300 shadow-2xs'
                        : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                    }`}
                  >
                    Volume
                  </button>
                </div>

                {/* Year Dropdown Filter */}
                <div className="relative">
                  <select
                    value={selectedTransactionYear}
                    onChange={(e) => setSelectedTransactionYear(e.target.value)}
                    className="pl-3.5 pr-8 py-1.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-xs font-bold cursor-pointer focus:outline-none focus:ring-2 focus:ring-purple-500/20 appearance-none shadow-2xs"
                  >
                    <option value="2026">2026</option>
                    <option value="2025">2025</option>
                    <option value="2024">2024</option>
                  </select>
                  <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                </div>
              </div>
            </div>

            {/* Quick Chart Stats Bar */}
            <div className="grid grid-cols-3 gap-2 sm:gap-4 py-4 my-2 border-b border-slate-100 dark:border-slate-800/80">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                  Total Annual {transactionMetric === 'amount' ? 'Turnover' : 'Volume'}
                </span>
                <span className="text-base sm:text-lg font-black text-slate-900 dark:text-white font-heading mt-0.5 block">
                  {transactionMetric === 'amount' 
                    ? (transactionYearData.totalYearAmount >= 1000000 
                        ? `₨ ${(transactionYearData.totalYearAmount / 1000000).toFixed(2)}M`
                        : transactionYearData.totalYearAmount >= 1000
                          ? `₨ ${(transactionYearData.totalYearAmount / 1000).toFixed(1)}K`
                          : `₨ ${transactionYearData.totalYearAmount.toLocaleString()}`)
                    : transactionYearData.totalYearVolume.toLocaleString()}
                </span>
              </div>
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                  Monthly Average
                </span>
                <span className="text-base sm:text-lg font-black text-purple-600 dark:text-purple-400 font-heading mt-0.5 block">
                  {transactionMetric === 'amount' 
                    ? (transactionYearData.averageMonthlyAmount >= 1000
                        ? `₨ ${(transactionYearData.averageMonthlyAmount / 1000).toFixed(1)}K`
                        : `₨ ${transactionYearData.averageMonthlyAmount.toLocaleString()}`)
                    : transactionYearData.averageMonthlyVolume.toLocaleString()}
                </span>
              </div>
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                  Peak Month {transactionYearData.peakMonthName !== '—' ? `(${transactionYearData.peakMonthName})` : ''}
                </span>
                <span className="text-base sm:text-lg font-black text-slate-900 dark:text-white font-heading mt-0.5 block">
                  {transactionMetric === 'amount' 
                    ? (transactionYearData.peakMonthValue >= 1000
                        ? `₨ ${(transactionYearData.peakMonthValue / 1000).toFixed(1)}K`
                        : `₨ ${transactionYearData.peakMonthValue.toLocaleString()}`)
                    : transactionYearData.peakMonthValue.toLocaleString()}
                </span>
              </div>
            </div>

            {/* 12 Months Bar Chart Graphic */}
            <div className="pt-4 pb-2">
              <div className="relative h-56 flex items-end justify-between gap-1 sm:gap-2 px-1">
                
                {/* Horizontal Baseline Gridlines */}
                <div className="absolute inset-0 flex flex-col justify-between pointer-events-none opacity-40">
                  <div className="border-b border-slate-200 dark:border-slate-800 w-full"></div>
                  <div className="border-b border-slate-200 dark:border-slate-800 w-full"></div>
                  <div className="border-b border-slate-200 dark:border-slate-800 w-full"></div>
                  <div className="border-b border-slate-200 dark:border-slate-800 w-full"></div>
                </div>

                {/* 12 Months Columns */}
                {transactionYearData.months.map((item, idx) => {
                  const maxMetric = transactionMetric === 'amount' ? transactionYearData.maxAmount : transactionYearData.maxVolume
                  const currentVal = transactionMetric === 'amount' ? item.amount : item.volume
                  const heightPercent = maxMetric > 0 && currentVal > 0 
                    ? Math.max(8, Math.round((currentVal / maxMetric) * 92)) 
                    : 3
                  const isHovered = hoveredMonthIdx === idx

                  return (
                    <div 
                      key={item.month} 
                      className="flex-1 flex flex-col items-center justify-end h-full relative group cursor-pointer"
                      onMouseEnter={() => setHoveredMonthIdx(idx)}
                      onMouseLeave={() => setHoveredMonthIdx(null)}
                    >
                      {/* Floating Tooltip */}
                      {isHovered && (
                        <div className="absolute -top-14 z-30 bg-slate-900 text-white text-[11px] font-bold px-3 py-2 rounded-xl shadow-xl border border-purple-500/40 whitespace-nowrap animate-in fade-in zoom-in-95 pointer-events-none">
                          <div className="flex items-center gap-1.5">
                            <span className="text-purple-300">{item.month} {selectedTransactionYear}:</span>
                            <span>{transactionMetric === 'amount' ? `₨ ${item.amount.toLocaleString()}` : `${item.volume.toLocaleString()} txns`}</span>
                          </div>
                          <span className="text-[10px] text-slate-400 font-normal block mt-0.5 font-sans">
                            {item.note}
                          </span>
                        </div>
                      )}

                      {/* Peak indicator on peak month */}
                      {item.isPeak && currentVal > 0 && (
                        <span className="text-[9px] font-black text-purple-600 dark:text-purple-400 bg-purple-100 dark:bg-purple-950/70 px-1.5 py-0.5 rounded-full mb-1">
                          {transactionMetric === 'amount' 
                            ? (item.amount >= 1000 ? `₨ ${(item.amount / 1000).toFixed(0)}K` : `₨ ${item.amount}`) 
                            : item.volume}
                        </span>
                      )}

                      {/* The Bar */}
                      <div 
                        style={{ height: `${heightPercent}%` }}
                        className={`w-full max-w-[28px] rounded-t-lg transition-all duration-300 ${
                          currentVal === 0
                            ? 'bg-slate-200/80 dark:bg-slate-800/80'
                            : item.isPeak 
                              ? 'bg-gradient-to-t from-purple-700 via-purple-600 to-indigo-500 shadow-md shadow-purple-600/30' 
                              : isHovered 
                                ? 'bg-purple-500 shadow-xs' 
                                : 'bg-purple-600/70 hover:bg-purple-600'
                        }`}
                      ></div>

                      {/* Month Label */}
                      <span className={`text-[10.5px] mt-2 font-semibold transition-colors ${
                        item.isPeak && currentVal > 0
                          ? 'text-purple-700 dark:text-purple-300 font-extrabold' 
                          : isHovered 
                            ? 'text-slate-900 dark:text-white font-bold' 
                            : 'text-slate-400 dark:text-slate-500'
                      }`}>
                        {item.month}
                      </span>
                    </div>
                  )
                })}
              </div>
            </div>
          </div>

          <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400">
            <span>Showing verified transaction settlements across all active campuses.</span>
            <span className="font-semibold text-purple-600 dark:text-purple-400">Audited SaaS ledger</span>
          </div>
        </div>

        {/* Right Column (5 cols): Registered Schools Overview Table */}
        <div className="lg:col-span-5 bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-3xl p-5 sm:p-6 shadow-xs flex flex-col justify-between">
          <div>
            {/* Header with Search and Total count */}
            <div className="flex items-center justify-between gap-3 pb-3 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <h3 className="text-base sm:text-lg font-extrabold text-slate-900 dark:text-white font-heading">
                  Schools
                </h3>
                <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-purple-100 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300">
                  {allSchoolsList.length} Total
                </span>
              </div>

              <button
                onClick={() => onRouteChange && onRouteChange('institutes')}
                className="text-xs font-bold text-purple-600 dark:text-purple-400 hover:underline flex items-center gap-1 cursor-pointer"
              >
                <span>View All</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Search Input for Schools */}
            <div className="relative my-3">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={schoolsSearchQuery}
                onChange={(e) => {
                  setSchoolsSearchQuery(e.target.value)
                  setSchoolsPage(1)
                }}
                placeholder="Search school name, code or city..."
                className="w-full pl-9 pr-3.5 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-purple-500"
              />
            </div>

            {/* Schools List Matching Reference Layout */}
            <div className="divide-y divide-slate-100 dark:divide-slate-800/80">
              {paginatedSchools.length > 0 ? (
                paginatedSchools.map((school) => (
                  <div key={school.id} className="py-3 flex items-center justify-between gap-3 hover:bg-slate-50/50 dark:hover:bg-slate-950/30 px-1.5 rounded-xl transition-colors">
                    
                    {/* School Identity */}
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-9 h-9 rounded-xl bg-purple-50 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300 border border-purple-200/80 dark:border-purple-800/60 flex items-center justify-center font-bold text-xs shrink-0 shadow-2xs">
                        {school.logoUrl ? (
                          <img src={school.logoUrl} alt={school.name} className="w-full h-full object-cover rounded-xl" />
                        ) : (
                          school.name.substring(0, 2).toUpperCase()
                        )}
                      </div>
                      <div className="min-w-0">
                        <h4 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white truncate">
                          {school.name}
                        </h4>
                        <div className="flex items-center gap-1.5 text-[11px] text-slate-400">
                          <span>{school.code}</span>
                          <span>·</span>
                          <span>{school.city}</span>
                        </div>
                      </div>
                    </div>

                    {/* Admin & Action */}
                    <div className="text-right shrink-0">
                      <span className="text-xs font-bold text-slate-800 dark:text-slate-200 block">
                        {school.principal}
                      </span>
                      <span className="text-[10px] text-purple-600 dark:text-purple-400 block font-medium">
                        School Admin
                      </span>
                    </div>

                  </div>
                ))
              ) : (
                <div className="py-8 text-center text-xs text-slate-400">
                  No schools found matching &ldquo;{schoolsSearchQuery}&rdquo;
                </div>
              )}
            </div>
          </div>

          {/* Pagination Controls */}
          {totalSchoolPages > 1 && (
            <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs">
              <span className="text-slate-400 text-[11px]">
                Page {schoolsPage} of {totalSchoolPages}
              </span>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => setSchoolsPage(p => Math.max(1, p - 1))}
                  disabled={schoolsPage === 1}
                  className="p-1 rounded-lg border border-slate-200 dark:border-slate-800 disabled:opacity-30 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
                >
                  <ChevronLeft className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => setSchoolsPage(p => Math.min(totalSchoolPages, p + 1))}
                  disabled={schoolsPage === totalSchoolPages}
                  className="p-1 rounded-lg border border-slate-200 dark:border-slate-800 disabled:opacity-30 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
                >
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          )}
        </div>

      </div>

      {/* =========================================================
          SECTION 4: BOTTOM ROW (SUBSCRIPTION DETAILS & STAFF DETAILS)
          ========================================================= */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 sm:gap-6 items-stretch">
        
        {/* Left Column (4 cols): Subscription Details (Donut Distribution) */}
        <div className="lg:col-span-4 xl:col-span-4 bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-3xl p-5 sm:p-6 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <h3 className="text-base sm:text-lg font-extrabold text-slate-900 dark:text-white font-heading">
                Subscription Details
              </h3>
              <button
                onClick={() => onRouteChange && onRouteChange('platform-billing')}
                className="text-xs font-bold text-purple-600 dark:text-purple-400 hover:underline flex items-center gap-1 cursor-pointer"
              >
                <span>Manage</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Donut Chart Visual */}
            <div className="py-6 flex flex-col items-center justify-center relative">
              <div className="relative w-44 h-44 sm:w-48 sm:h-48 xl:w-52 xl:h-52 flex items-center justify-center">
                {/* SVG Vector Donut */}
                <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
                  {/* Background Track */}
                  <circle
                    cx="50"
                    cy="50"
                    r="40"
                    fill="transparent"
                    stroke="currentColor"
                    strokeWidth="10"
                    className="text-slate-100 dark:text-slate-800"
                  />

                  {/* Dynamic Segments */}
                  {(() => {
                    const radius = 40
                    const circumference = 2 * Math.PI * radius // ~251.33
                    const activeSegments = subscriptionDetails.filter(s => s.count > 0)
                    let accumulatedPercent = 0

                    if (activeSegments.length === 0) return null

                    if (activeSegments.length === 1) {
                      return (
                        <circle
                          cx="50"
                          cy="50"
                          r={radius}
                          fill="transparent"
                          stroke={activeSegments[0].color}
                          strokeWidth="10"
                          className="transition-all duration-500"
                        />
                      )
                    }

                    return activeSegments.map((seg, sIdx) => {
                      const strokeDasharray = `${(seg.percentage / 100) * circumference} ${circumference}`
                      const strokeDashoffset = -((accumulatedPercent / 100) * circumference)
                      accumulatedPercent += seg.percentage

                      return (
                        <circle
                          key={sIdx}
                          cx="50"
                          cy="50"
                          r={radius}
                          fill="transparent"
                          stroke={seg.color}
                          strokeWidth="10"
                          strokeDasharray={strokeDasharray}
                          strokeDashoffset={strokeDashoffset}
                          className="transition-all duration-500 hover:opacity-85"
                        />
                      )
                    })
                  })()}
                </svg>

                {/* Center Badge with Zero Overflow */}
                <div className="absolute inset-0 flex flex-col items-center justify-center text-center pointer-events-none px-3">
                  <span className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white font-heading tracking-tight leading-none mb-1">
                    {totalSchoolsCount}
                  </span>
                  <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wide max-w-[95px] text-center leading-tight">
                    Total Campuses
                  </span>
                </div>
              </div>

              {/* Legend List matching reference */}
              <div className="w-full mt-6 space-y-2">
                {subscriptionDetails.map((seg, idx) => (
                  <div key={idx} className="flex items-center justify-between text-xs py-1.5 px-2.5 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors border border-transparent hover:border-slate-100 dark:hover:border-slate-800">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <span 
                        className="w-3 h-3 rounded-full shrink-0 shadow-2xs" 
                        style={{ backgroundColor: seg.color }}
                      />
                      <div className="min-w-0">
                        <span className="font-bold text-slate-800 dark:text-slate-100 block leading-tight truncate">
                          {seg.name}
                        </span>
                        <span className="text-[10px] text-slate-400 block font-sans truncate">
                          {seg.subName}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 font-mono shrink-0 pl-2">
                      <span className="font-bold text-slate-900 dark:text-white whitespace-nowrap">
                        {seg.count} {seg.count === 1 ? 'school' : 'schools'}
                      </span>
                      <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full whitespace-nowrap ${
                        seg.count > 0 
                          ? 'bg-purple-100 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300' 
                          : 'bg-slate-100 dark:bg-slate-800 text-slate-400 dark:text-slate-500'
                      }`}>
                        {seg.percentage}%
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="pt-3 border-t border-slate-100 dark:border-slate-800 text-[11px] text-slate-400 text-center">
            Multi-tier SaaS packages with automated renewal &amp; invoice generation.
          </div>
        </div>

        {/* Right Column (8 cols): Staff Details and Role Assignments */}
        <div className="lg:col-span-8 xl:col-span-8 bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-3xl p-5 sm:p-6 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <h3 className="text-base sm:text-lg font-extrabold text-slate-900 dark:text-white font-heading">
                  Staff Details
                </h3>
                <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-purple-100 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300">
                  {filteredStaff.length} Members
                </span>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setIsUserModalOpen(true)}
                  className="px-3 py-1.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs transition-colors flex items-center gap-1.5 cursor-pointer shadow-2xs"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Assign Staff</span>
                </button>
              </div>
            </div>

            {/* Quick Filters */}
            <div className="flex items-center gap-2 my-3 flex-wrap">
              <div className="relative flex-1 min-w-[180px]">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={staffSearchQuery}
                  onChange={(e) => setStaffSearchQuery(e.target.value)}
                  placeholder="Search staff by name or email..."
                  className="w-full pl-9 pr-3.5 py-1.5 text-xs rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-purple-500"
                />
              </div>

              <select
                value={staffRoleFilter}
                onChange={(e) => setStaffRoleFilter(e.target.value)}
                className="px-3 py-1.5 text-xs rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-200 font-bold focus:outline-none cursor-pointer"
              >
                <option value="all">All Roles</option>
                <option value="superadmin">Super Admin</option>
                <option value="institute_admin">School Admin</option>
                <option value="accounts">Accounts &amp; Audit</option>
              </select>
            </div>

            {/* Staff Table Matching Reference Layout */}
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs min-w-[620px]">
                <thead>
                  <tr className="border-b border-slate-100 dark:border-slate-800 text-[11px] font-bold uppercase tracking-wider text-slate-400">
                    <th className="py-2.5 px-3.5 whitespace-nowrap min-w-[170px]">Name</th>
                    <th className="py-2.5 px-3.5 whitespace-nowrap min-w-[140px]">Roles</th>
                    <th className="py-2.5 px-3.5 whitespace-nowrap min-w-[210px]">Assign Schools</th>
                    <th className="py-2.5 px-3.5 text-right whitespace-nowrap min-w-[95px]">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800/80">
                  {filteredStaff.length > 0 ? (
                    filteredStaff.map((staff) => (
                      <tr key={staff.id} className="hover:bg-slate-50/60 dark:hover:bg-slate-950/40 transition-colors">
                        
                        {/* Name & Avatar */}
                        <td className="py-3 px-3.5 whitespace-nowrap">
                          <div className="flex items-center gap-2.5">
                            <div className="w-8 h-8 rounded-full bg-purple-100 dark:bg-purple-950/80 text-purple-700 dark:text-purple-300 font-bold flex items-center justify-center shrink-0 border border-purple-200 dark:border-purple-800/60 shadow-2xs text-xs">
                              {staff.name.substring(0, 1)}
                            </div>
                            <div>
                              <span className="font-bold text-slate-900 dark:text-white block leading-tight">
                                {staff.name}
                              </span>
                              <span className="text-[11px] text-slate-400 font-mono block mt-0.5">
                                {staff.email}
                              </span>
                            </div>
                          </div>
                        </td>

                        {/* Role Badge */}
                        <td className="py-3 px-3.5 whitespace-nowrap">
                          <span className={`inline-flex items-center whitespace-nowrap text-[11px] font-bold px-2.5 py-1 rounded-full border shadow-2xs ${
                            staff.roleType === 'superadmin'
                              ? 'bg-purple-50 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300 border-purple-200 dark:border-purple-800/60'
                              : staff.roleType === 'institute_admin'
                                ? 'bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 border-indigo-200 dark:border-indigo-800/60'
                                : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700'
                          }`}>
                            {staff.roleTitle}
                          </span>
                        </td>

                        {/* Assign Schools */}
                        <td className="py-3 px-3.5 whitespace-nowrap">
                          <div className="flex items-center gap-2 text-slate-700 dark:text-slate-300 font-medium">
                            <Building2 className="w-3.5 h-3.5 text-purple-600 dark:text-purple-400 shrink-0" />
                            <span className="font-semibold text-slate-800 dark:text-slate-200 text-xs">
                              {staff.assignedSchool}
                            </span>
                          </div>
                        </td>

                        {/* Status Toggle Button */}
                        <td className="py-3 px-3.5 text-right whitespace-nowrap">
                          {(() => {
                            const effectiveStatus = staffStatusOverrides[staff.id] || staff.status || 'Active'
                            const isActive = effectiveStatus.toLowerCase() === 'active'

                            return (
                              <button
                                type="button"
                                onClick={() => handleToggleStaffStatus(staff.id, staff.name, effectiveStatus)}
                                className={`inline-flex items-center gap-1.5 text-[11px] font-bold px-2.5 py-1 rounded-full border transition-all cursor-pointer shadow-2xs select-none active:scale-95 whitespace-nowrap ${
                                  isActive
                                    ? 'bg-emerald-50 hover:bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border-emerald-200/90 dark:border-emerald-800/60'
                                    : 'bg-slate-100 hover:bg-slate-200 dark:bg-slate-800/80 text-slate-500 dark:text-slate-400 border-slate-200 dark:border-slate-700'
                                }`}
                                title={isActive ? 'Click to toggle Inactive' : 'Click to toggle Active'}
                              >
                                <span className={`w-1.5 h-1.5 rounded-full ${
                                  isActive
                                    ? 'bg-emerald-500 animate-pulse'
                                    : 'bg-slate-400'
                                }`} />
                                <span>{effectiveStatus}</span>
                              </button>
                            )
                          })()}
                        </td>

                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={4} className="py-6 text-center text-slate-400">
                        No staff members found matching criteria.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-[11px] text-slate-400">
            <span>Granular role-based access control (RBAC) enforced platform-wide.</span>
            <button
              onClick={() => onRouteChange && onRouteChange('admin-team-control')}
              className="font-bold text-purple-600 dark:text-purple-400 hover:underline cursor-pointer"
            >
              Admin Team & Roles Control →
            </button>
          </div>
        </div>

      </div>

      {/* =========================================================
          MODAL 1: SERVER CONFIGURATION & SETUP DRAWER
          ========================================================= */}
      {isServerConfigModalOpen && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 dark:bg-black/80 backdrop-blur-sm animate-in fade-in"
          onClick={() => setIsServerConfigModalOpen(false)}
        >
          <div 
            className="bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100 rounded-3xl max-w-2xl w-full p-6 shadow-2xl border border-slate-200 dark:border-slate-800 animate-in zoom-in-95 duration-200 space-y-5"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-purple-100 dark:bg-purple-950/70 text-purple-700 dark:text-purple-300 flex items-center justify-center">
                  <Server className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-base font-extrabold text-slate-900 dark:text-white font-heading">
                    Server Configuration &amp; Service Settings
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Live parameters and environment credentials for platform microservices.
                  </p>
                </div>
              </div>
              <button 
                onClick={() => setIsServerConfigModalOpen(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Config Tabs */}
            <div className="flex items-center gap-1.5 p-1 bg-slate-100 dark:bg-slate-800 rounded-2xl text-xs overflow-x-auto">
              <button
                onClick={() => setActiveConfigTab('subdomain')}
                className={`px-3 py-1.5 rounded-xl font-bold transition-all cursor-pointer whitespace-nowrap ${
                  activeConfigTab === 'subdomain'
                    ? 'bg-white dark:bg-slate-900 text-purple-700 dark:text-purple-300 shadow-2xs'
                    : 'text-slate-600 dark:text-slate-400'
                }`}
              >
                Subdomain Routing
              </button>
              <button
                onClick={() => setActiveConfigTab('fcm')}
                className={`px-3 py-1.5 rounded-xl font-bold transition-all cursor-pointer whitespace-nowrap ${
                  activeConfigTab === 'fcm'
                    ? 'bg-white dark:bg-slate-900 text-purple-700 dark:text-purple-300 shadow-2xs'
                    : 'text-slate-600 dark:text-slate-400'
                }`}
              >
                Firebase Push (FCM)
              </button>
              <button
                onClick={() => setActiveConfigTab('gateway')}
                className={`px-3 py-1.5 rounded-xl font-bold transition-all cursor-pointer whitespace-nowrap ${
                  activeConfigTab === 'gateway'
                    ? 'bg-white dark:bg-slate-900 text-purple-700 dark:text-purple-300 shadow-2xs'
                    : 'text-slate-600 dark:text-slate-400'
                }`}
              >
                1Link / 1Bill Gateway
              </button>
              <button
                onClick={() => setActiveConfigTab('backup')}
                className={`px-3 py-1.5 rounded-xl font-bold transition-all cursor-pointer whitespace-nowrap ${
                  activeConfigTab === 'backup'
                    ? 'bg-white dark:bg-slate-900 text-purple-700 dark:text-purple-300 shadow-2xs'
                    : 'text-slate-600 dark:text-slate-400'
                }`}
              >
                Cloud Backups
              </button>
            </div>

            {/* Tab Body */}
            {activeConfigTab === 'subdomain' && (
              <div className="space-y-4">
                <div className="p-3.5 rounded-2xl bg-purple-50/70 dark:bg-purple-950/40 border border-purple-200/80 dark:border-purple-800/60 text-xs">
                  <span className="font-bold text-purple-900 dark:text-purple-200 block mb-1">
                    Subdomain routing is not connected
                  </span>
                  <p className="text-purple-700 dark:text-purple-300/90 leading-relaxed">
                    Host-based campus routing is a preview in this local app. Campuses are stored in the browser directory, not separate database schemas.
                  </p>
                </div>

                <div className="space-y-2 text-xs">
                  <label className="font-bold text-slate-700 dark:text-slate-300">
                    DNS CNAME Target:
                  </label>
                  <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 font-mono flex items-center justify-between text-slate-800 dark:text-slate-200">
                    <span>cname.smartms-cloud.net</span>
                    <button 
                      onClick={() => {
                        navigator.clipboard.writeText('cname.smartms-cloud.net')
                        triggerToast('CNAME target copied to clipboard!')
                      }}
                      className="text-purple-600 dark:text-purple-400 hover:underline flex items-center gap-1 cursor-pointer"
                    >
                      <Copy className="w-3.5 h-3.5" />
                      <span>Copy</span>
                    </button>
                  </div>
                </div>
              </div>
            )}

            {activeConfigTab === 'fcm' && (
              <div className="space-y-4 text-xs">
                <div className="p-3.5 rounded-2xl bg-purple-50/70 dark:bg-purple-950/40 border border-purple-200/80 dark:border-purple-800/60">
                  <span className="font-bold text-purple-900 dark:text-purple-200 block mb-1">
                    Push notifications are not connected
                  </span>
                  <p className="text-purple-700 dark:text-purple-300/90 leading-relaxed">
                    No Firebase project is linked. Announcements save on this device. They are not delivered as mobile push.
                  </p>
                </div>

                <div className="space-y-2">
                  <label className="font-bold text-slate-700 dark:text-slate-300">Server Key Token (Masked):</label>
                  <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 font-mono text-slate-800 dark:text-slate-200">
                    AAAA-fcm-server-prod-••••••••••••••••••••••••••••••••
                  </div>
                </div>
              </div>
            )}

            {activeConfigTab === 'gateway' && (
              <div className="space-y-4 text-xs">
                <div className="p-3.5 rounded-2xl bg-purple-50/70 dark:bg-purple-950/40 border border-purple-200/80 dark:border-purple-800/60">
                  <span className="font-bold text-purple-900 dark:text-purple-200 block mb-1">
                    1Bill settlement is not connected
                  </span>
                  <p className="text-purple-700 dark:text-purple-300/90 leading-relaxed">
                    Bank and wallet settlement is not wired in this local app. Fee records stay in browser storage until a payment gateway is configured.
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800">
                    <span className="text-[10px] text-slate-400 uppercase block">1Bill Prefix</span>
                    <span className="font-mono font-bold text-slate-900 dark:text-white">1001-SMS</span>
                  </div>
                  <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800">
                    <span className="text-[10px] text-slate-400 uppercase block">Settlement Bank</span>
                    <span className="font-bold text-slate-900 dark:text-white">Habib Bank Ltd</span>
                  </div>
                </div>
              </div>
            )}

            {activeConfigTab === 'backup' && (
              <div className="space-y-4 text-xs">
                <div className="p-3.5 rounded-2xl bg-purple-50/70 dark:bg-purple-950/40 border border-purple-200/80 dark:border-purple-800/60">
                  <span className="font-bold text-purple-900 dark:text-purple-200 block mb-1">
                    Cloud backup schedule is not connected
                  </span>
                  <p className="text-purple-700 dark:text-purple-300/90 leading-relaxed">
                    There is no remote database dump. Use Backups & Recovery to download a JSON snapshot or restore it into this browser.
                  </p>
                </div>

                <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800">
                  <span className="text-slate-600 dark:text-slate-300">Last local snapshot:</span>
                  <span className="font-bold text-slate-800 dark:text-slate-100 text-right">
                    {(() => {
                      try {
                        const list = JSON.parse(localStorage.getItem('sms_system_backups') || '[]')
                        const real = (Array.isArray(list) ? list : []).find(b => b && !['bkp-001', 'bkp-002', 'bkp-003'].includes(b.id))
                        return real?.createdAt ? new Date(real.createdAt).toLocaleString() : 'None downloaded yet'
                      } catch {
                        return 'None downloaded yet'
                      }
                    })()}
                  </span>
                </div>
              </div>
            )}

            {/* Modal Bottom Actions */}
            <div className="flex items-center justify-between pt-3 border-t border-slate-100 dark:border-slate-800">
              <button
                type="button"
                onClick={handleSimulateConnectionTest}
                disabled={isTestingConnection}
                className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs transition-colors flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
              >
                {isTestingConnection ? (
                  <>
                    <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    <span>Pinging API Endpoint...</span>
                  </>
                ) : (
                  <>
                    <Radio className="w-3.5 h-3.5" />
                    <span>Test Service Ping</span>
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={() => setIsServerConfigModalOpen(false)}
                className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-bold text-xs transition-colors cursor-pointer"
              >
                Close
              </button>
            </div>

          </div>
        </div>
      )}

      {/* =========================================================
          MODAL 2: ONBOARD NEW SCHOOL / CAMPUS
          ========================================================= */}
      {isInstituteModalOpen && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 dark:bg-black/80 backdrop-blur-sm animate-in fade-in"
          onClick={() => setIsInstituteModalOpen(false)}
        >
          <div 
            className="bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100 rounded-3xl max-w-xl w-full p-6 shadow-2xl border border-slate-200 dark:border-slate-800 animate-in zoom-in-95 duration-200 space-y-4 max-h-[92vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <School className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                <h3 className="text-base font-extrabold text-slate-900 dark:text-white font-heading">
                  Onboard New School Campus
                </h3>
              </div>
              <button 
                onClick={() => setIsInstituteModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {instituteFormError && (
              <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300 text-xs">
                {instituteFormError}
              </div>
            )}

            <form onSubmit={handleCreateInstitute} className="space-y-3.5 text-xs">
              <div>
                <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                  School Name <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={newInstituteData.name}
                  onChange={(e) => setNewInstituteData({ ...newInstituteData, name: e.target.value })}
                  placeholder="e.g. Lahore Grammar School"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white focus:outline-none focus:border-purple-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                    Campus Code <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={newInstituteData.code}
                    onChange={(e) => setNewInstituteData({ ...newInstituteData, code: e.target.value })}
                    placeholder="e.g. LGS-001"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white uppercase font-mono focus:outline-none focus:border-purple-500"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">City</label>
                  <input
                    type="text"
                    value={newInstituteData.city}
                    onChange={(e) => setNewInstituteData({ ...newInstituteData, city: e.target.value })}
                    placeholder="e.g. Lahore, Islamabad..."
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white focus:outline-none focus:border-purple-500"
                  />
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                  Subscription Package
                </label>
                <select
                  value={newInstituteData.planTier}
                  onChange={(e) => setNewInstituteData({ ...newInstituteData, planTier: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white focus:outline-none focus:border-purple-500 font-bold"
                >
                  <option value="School Plan">School Plan (₨ 25,000 / month)</option>
                  <option value="Multi-Branch Network">Multi-Branch School Network (₨ 45,000 / month)</option>
                  <option value="Free Trial Plan">14-Day Free Evaluation Trial (₨ 0)</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                    Principal / Admin Full Name
                  </label>
                  <input
                    type="text"
                    value={newInstituteData.adminName}
                    onChange={(e) => setNewInstituteData({ ...newInstituteData, adminName: e.target.value })}
                    placeholder="e.g. Prof. Tariq Mahmood"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white focus:outline-none focus:border-purple-500"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                    Admin Portal Email
                  </label>
                  <input
                    type="email"
                    value={newInstituteData.adminEmail}
                    onChange={(e) => setNewInstituteData({ ...newInstituteData, adminEmail: e.target.value })}
                    placeholder="admin@school.edu.pk"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white focus:outline-none focus:border-purple-500"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsInstituteModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-200 font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold shadow-xs cursor-pointer"
                >
                  Confirm &amp; Onboard Campus
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* =========================================================
          MODAL 3: ADD PLATFORM STAFF & ASSIGN ROLES
          ========================================================= */}
      {isUserModalOpen && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 dark:bg-black/80 backdrop-blur-sm animate-in fade-in"
          onClick={() => setIsUserModalOpen(false)}
        >
          <div 
            className="bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100 rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 dark:border-slate-800 animate-in zoom-in-95 duration-200 space-y-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <UserPlus className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                <h3 className="text-base font-extrabold text-slate-900 dark:text-white font-heading">
                  Add Staff Member &amp; Assign Roles
                </h3>
              </div>
              <button 
                onClick={() => setIsUserModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {userFormError && (
              <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300 text-xs">
                {userFormError}
              </div>
            )}

            <form onSubmit={handleCreateUser} className="space-y-3.5 text-xs">
              <div>
                <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                  Full Name <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={newUserData.name}
                  onChange={(e) => setNewUserData({ ...newUserData, name: e.target.value })}
                  placeholder="e.g. Farhan Akhtar"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white focus:outline-none focus:border-purple-500"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                  Email Address <span className="text-rose-500">*</span>
                </label>
                <input
                  type="email"
                  required
                  value={newUserData.email}
                  onChange={(e) => setNewUserData({ ...newUserData, email: e.target.value })}
                  placeholder="staff@smartms.pk"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white focus:outline-none focus:border-purple-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                    Assigned Role
                  </label>
                  <select
                    value={newUserData.role}
                    onChange={(e) => setNewUserData({ ...newUserData, role: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white font-bold focus:outline-none focus:border-purple-500"
                  >
                    <option value="superadmin">Super Administrator (Platform Wide)</option>
                    <option value="institute_admin">School Admin / Principal</option>
                    <option value="accounts">Accounts &amp; Financial Auditor</option>
                    <option value="support">Technical Support Specialist</option>
                  </select>
                </div>

                <div>
                  <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                    Assigned School / Scope
                  </label>
                  <input
                    type="text"
                    value={newUserData.institute}
                    onChange={(e) => setNewUserData({ ...newUserData, institute: e.target.value })}
                    placeholder="e.g. Global HQ (All Schools)"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white focus:outline-none focus:border-purple-500"
                  />
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                  Default Login Password
                </label>
                <input
                  type="password"
                  value={newUserData.password}
                  onChange={(e) => setNewUserData({ ...newUserData, password: e.target.value })}
                  placeholder="Password123!"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white font-mono focus:outline-none focus:border-purple-500"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsUserModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-200 font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold shadow-xs cursor-pointer"
                >
                  Save &amp; Activate Staff
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* =========================================================
          MODAL 4: BROADCAST NOTICE
          ========================================================= */}
      {isBroadcastModalOpen && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 dark:bg-black/80 backdrop-blur-sm animate-in fade-in"
          onClick={() => setIsBroadcastModalOpen(false)}
        >
          <div 
            className="bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100 rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 dark:border-slate-800 animate-in zoom-in-95 duration-200 space-y-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <Send className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                <h3 className="text-base font-extrabold text-slate-900 dark:text-white font-heading">
                  Broadcast Platform Notification
                </h3>
              </div>
              <button onClick={() => setIsBroadcastModalOpen(false)} className="p-1 rounded-lg text-slate-400">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSendBroadcast} className="space-y-3.5 text-xs">
              <div>
                <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">Announcement Title</label>
                <input
                  type="text"
                  required
                  value={broadcastData.title}
                  onChange={(e) => setBroadcastData({ ...broadcastData, title: e.target.value })}
                  placeholder="e.g. Scheduled System Upgrade or Session Advisory"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white focus:outline-none focus:border-purple-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">Channel</label>
                  <select
                    value={broadcastData.channel}
                    onChange={(e) => setBroadcastData({ ...broadcastData, channel: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white font-bold focus:outline-none"
                  >
                    <option value="In-App">In-Portal Banner Alert</option>
                    <option value="SMS" disabled className="text-slate-400 bg-slate-100 dark:bg-slate-900">Direct SMS Broadcast (Disabled)</option>
                    <option value="WhatsApp" disabled className="text-slate-400 bg-slate-100 dark:bg-slate-900">WhatsApp Gateway (Disabled)</option>
                  </select>
                  <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-1">Direct SMS &amp; WhatsApp gateways are currently disabled by administrator.</p>
                </div>

                <div>
                  <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">Recipients</label>
                  <select
                    value={broadcastData.recipientGroup}
                    onChange={(e) => setBroadcastData({ ...broadcastData, recipientGroup: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white font-bold focus:outline-none"
                  >
                    <option value="All Active Users">All Active Users</option>
                    <option value="School Principals Only">School Principals Only</option>
                    <option value="Accounts Staff">Accounts &amp; Finance</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">Message Content</label>
                <textarea
                  rows="3"
                  required
                  value={broadcastData.message}
                  onChange={(e) => setBroadcastData({ ...broadcastData, message: e.target.value })}
                  placeholder="Enter message text to broadcast..."
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white focus:outline-none focus:border-purple-500"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsBroadcastModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-200 font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold shadow-xs cursor-pointer flex items-center gap-1.5"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Dispatch Broadcast</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* =========================================================
          MODAL 5: NEWLY CREATED CREDENTIALS POPUP
          ========================================================= */}
      {newlyCreatedCreds && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 dark:bg-black/80 backdrop-blur-sm animate-in fade-in"
          onClick={() => setNewlyCreatedCreds(null)}
        >
          <div 
            className="bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100 rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-200 dark:border-slate-800 animate-in zoom-in-95 duration-200 space-y-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="text-center">
              <div className="w-12 h-12 rounded-2xl bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 mx-auto flex items-center justify-center mb-2 shadow-xs">
                <Check className="w-6 h-6 stroke-[3]" />
              </div>
              <h3 className="text-lg font-black text-slate-900 dark:text-white font-heading">
                Campus Successfully Provisioned!
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Share these initial credentials with the school principal.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs space-y-2.5 font-mono">
              <div className="flex justify-between">
                <span className="text-slate-400">School:</span>
                <span className="font-bold text-slate-900 dark:text-white">{newlyCreatedCreds.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Campus Code:</span>
                <span className="font-bold text-purple-600 dark:text-purple-400">{newlyCreatedCreds.code}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Admin Email:</span>
                <span className="font-bold text-slate-900 dark:text-white">{newlyCreatedCreds.adminEmail}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Temporary Password:</span>
                <span className="font-bold text-slate-900 dark:text-white">{newlyCreatedCreds.password}</span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => {
                  const txt = `School: ${newlyCreatedCreds.name}\nCode: ${newlyCreatedCreds.code}\nLogin ID: ${newlyCreatedCreds.adminEmail}\nPassword: ${newlyCreatedCreds.password}\nPortal URL: https://app.smartms.pk/login`
                  navigator.clipboard.writeText(txt)
                  setCopiedCreds(true)
                  setTimeout(() => setCopiedCreds(false), 2500)
                }}
                className="flex-1 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs flex items-center justify-center gap-1.5 cursor-pointer shadow-xs"
              >
                {copiedCreds ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedCreds ? 'Copied to Clipboard!' : 'Copy Credentials'}</span>
              </button>

              <button
                type="button"
                onClick={() => setNewlyCreatedCreds(null)}
                className="px-4 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-200 font-bold text-xs cursor-pointer"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  )
}

export default SuperadminDashboard
