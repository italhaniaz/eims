import React, { useState, useEffect, useRef } from 'react'
import {
  GraduationCap,
  Sparkles,
  School,
  Building2,
  Sliders,
  CheckCircle2,
  ArrowRight,
  ShieldCheck,
  CreditCard,
  Calendar,
  Users,
  FileText,
  BarChart3,
  Phone,
  Mail,
  ChevronDown,
  Lock,
  Laptop,
  Check,
  X,
  MessageCircle,
  Menu,
  ArrowUp,
  Send,
  Clock,
  Eye,
  EyeOff,
  MapPin,
  User,
  ArrowLeft,
  Gift
} from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import { useToast } from '../../context/ToastContext'
import { getStoredData, saveStoredData } from '../../services/dataService'
import AnnouncementService from '../../services/announcementService'

// 26-point refined serrated starburst sticker geometry (Compact Awwwards-style Action Badge)
const STARBURST_POINTS = (() => {
  const points = []
  const numPoints = 26
  const outerR = 56
  const innerR = 48.5
  const center = 60
  for (let i = 0; i < numPoints * 2; i++) {
    const r = i % 2 === 0 ? outerR : innerR
    const angle = (i * Math.PI) / numPoints
    const x = (center + r * Math.cos(angle)).toFixed(2)
    const y = (center + r * Math.sin(angle)).toFixed(2)
    points.push(`${x},${y}`)
  }
  return points.join(' ')
})()

// Educational Plans Configuration (Dedicated Cards & Modal Specifications)
const PLAN_CONFIGS = {
  trial: {
    id: 'trial',
    wing: 'school',
    isMultiCampus: false,
    title: '14-Day Free Evaluation Tier',
    planName: '14-Day Free Trial',
    priceDisplay: 'Rs. 0',
    priceSub: 'No Credit Card · 14 Days Full Access',
    badge: '14 Days full testing access',
    badgeColor: 'text-emerald-700',
    description: 'Enter your institutional details below to immediately launch an isolated 14-day evaluation request for your school or college.',
    buttonText: 'Submit Institution Registration Request',
    buttonClass: 'bg-purple-600 hover:bg-purple-700 text-white font-bold shadow-md shadow-purple-600/20',
    iconBg: 'bg-emerald-50 text-emerald-600 border border-emerald-200/80'
  },
  school: {
    id: 'school',
    wing: 'school',
    isMultiCampus: false,
    title: 'School Plan (Primary & Matric)',
    planName: 'School Plan',
    priceDisplay: 'PKR 25,000/mo',
    priceSub: 'Up to 1,500 Students · 2 Campuses',
    badge: '14 Days full testing access',
    badgeColor: 'text-purple-700',
    description: 'Submit institutional onboarding details for primary or matriculation school campus.',
    buttonText: 'Submit Institution Registration Request',
    buttonClass: 'bg-purple-600 hover:bg-purple-700 text-white font-bold shadow-md shadow-purple-600/20',
    iconBg: 'bg-purple-50 text-purple-600 border border-purple-200/80'
  },
  college: {
    id: 'college',
    wing: 'college',
    isMultiCampus: false,
    title: 'College Plan (Intermediate & Inter)',
    planName: 'College Plan',
    priceDisplay: 'PKR 35,000/mo',
    priceSub: 'Up to 3,000 Students · 3 Campuses',
    badge: '14 Days full testing access',
    badgeColor: 'text-indigo-700',
    description: 'Submit higher secondary college registration (F.Sc, ICS, FA, I.Com) for Super Admin review.',
    buttonText: 'Submit Institution Registration Request',
    buttonClass: 'bg-purple-600 hover:bg-purple-700 text-white font-bold shadow-md shadow-purple-600/20',
    iconBg: 'bg-indigo-50 text-indigo-600 border border-indigo-200/80'
  },
  university: {
    id: 'university',
    wing: 'university',
    isMultiCampus: true,
    title: 'Apex Enterprise / University Plan',
    planName: 'Apex Enterprise Plan',
    priceDisplay: 'PKR 55,000/mo',
    priceSub: '8,000+ Students · Multi-Campus HQ',
    badge: '14 Days full testing access',
    badgeColor: 'text-blue-700',
    description: 'Submit multi-campus university network application for dedicated enterprise portal credentialing.',
    buttonText: 'Submit Institution Registration Request',
    buttonClass: 'bg-purple-600 hover:bg-purple-700 text-white font-bold shadow-md shadow-purple-600/20',
    iconBg: 'bg-blue-50 text-blue-600 border border-blue-200/80'
  }
}

export const LandingPage = ({ onNavigateToLogin, onNavigateToDemo }) => {
  const { login } = useAuth()
  const { showToast } = useToast()

  // State
  const [landingBanner, setLandingBanner] = useState(() => AnnouncementService.getLandingBannerConfig())
  const [showAnnouncementBanner, setShowAnnouncementBanner] = useState(true)

  // Listen for real-time announcement updates from Super Admin
  useEffect(() => {
    const handleBannerSync = () => {
      setLandingBanner(AnnouncementService.getLandingBannerConfig())
    }
    window.addEventListener('sms_announcements_updated', handleBannerSync)
    window.addEventListener('storage', handleBannerSync)
    return () => {
      window.removeEventListener('sms_announcements_updated', handleBannerSync)
      window.removeEventListener('storage', handleBannerSync)
    }
  }, [])
  const [activeSection, setActiveSection] = useState('hero')
  const [activeTab, setActiveTab] = useState('school') // 'school', 'college', 'university', 'custom'
  const [billingCycle, setBillingCycle] = useState('monthly') // 'monthly', 'annual'
  const [isTrialModalOpen, setIsTrialModalOpen] = useState(() => (typeof window !== 'undefined' && window.location.hash === '#trial'))
  const [activeModalPlan, setActiveModalPlan] = useState('trial')
  const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false)
  const [submittedSuccessData, setSubmittedSuccessData] = useState(null)
  const [expandedFaq, setExpandedFaq] = useState(0)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [showScrollTop, setShowScrollTop] = useState(false)

  // Bottom Zone & Pointer-Sticking Action Burst Sticker
  const bottomWrapperRef = useRef(null)
  const ctaSectionRef = useRef(null)
  const footerRef = useRef(null)
  const [stickerPos, setStickerPos] = useState({ x: 1100, y: 280 })
  const [isPointerSticking, setIsPointerSticking] = useState(false)

  // Keep dock position responsive on resize and initial render
  useEffect(() => {
    const updateDock = () => {
      if (!isPointerSticking && bottomWrapperRef.current) {
        const rect = bottomWrapperRef.current.getBoundingClientRect()
        const ctaHeight = ctaSectionRef.current ? ctaSectionRef.current.offsetHeight : 320
        setStickerPos({
          x: Math.max(140, rect.width - 130),
          y: ctaHeight - 10
        })
      }
    }
    updateDock()
    window.addEventListener('resize', updateDock)
    return () => window.removeEventListener('resize', updateDock)
  }, [isPointerSticking])

  // Mouse enters or moves over footer: sticker attaches & sticks directly to the pointer
  const handleFooterMouseMove = (e) => {
    if (!bottomWrapperRef.current) return
    const rect = bottomWrapperRef.current.getBoundingClientRect()
    setIsPointerSticking(true)
    setStickerPos({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top
    })
  }

  // Mouse leaves footer: sticker releases and smoothly returns to its docked resting position
  const handleFooterMouseLeave = () => {
    setIsPointerSticking(false)
    if (bottomWrapperRef.current) {
      const rect = bottomWrapperRef.current.getBoundingClientRect()
      const ctaHeight = ctaSectionRef.current ? ctaSectionRef.current.offsetHeight : 320
      setStickerPos({
        x: Math.max(140, rect.width - 130),
        y: ctaHeight - 10
      })
    }
  }

  // Click handler for footer when sticker is sticking (leaves buttons/links clickable)
  const handleFooterClick = (e) => {
    if (e.target.closest('button, a, input')) return
    setIsTrialModalOpen(true)
  }

  // Auto-close mobile drawer on desktop resize
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1024) {
        setIsMobileMenuOpen(false)
      }
    }
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  // Auto-open trial modal if triggered via hash navigation (e.g. from LoginPage)
  useEffect(() => {
    const handleHash = () => {
      if (typeof window !== 'undefined' && window.location.hash === '#trial') {
        setIsTrialModalOpen(true)
      }
    }
    handleHash()
    window.addEventListener('hashchange', handleHash)
    return () => window.removeEventListener('hashchange', handleHash)
  }, [])

  // Institutional Registration Form State
  const [trialForm, setTrialForm] = useState({
    instituteName: '',
    adminName: '',
    email: '',
    phone: '',
    city: 'Lahore',
    wing: 'school', // 'school', 'college', 'university', 'multi-campus'
    adminPassword: '',
    confirmPassword: '',
    notes: '',
    agreedToTerms: true
  })
  const [modalStep, setModalStep] = useState(2) // 1: Select Package, 2: Enter Details
  const [showAdminPassword, setShowAdminPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [isSubmittingTrial, setIsSubmittingTrial] = useState(false)

  // Scroll Spy: Track which section is in view and highlight in navbar
  useEffect(() => {
    const sectionIds = ['hero', 'features', 'wings', 'preview', 'pricing', 'faq']

    const handleScrollSpy = () => {
      if (typeof window !== 'undefined') {
        setShowScrollTop(window.scrollY > 380)
      }
      const scrollPosition = window.scrollY + 120 // offset for navbar
      for (const id of sectionIds) {
        const el = document.getElementById(id)
        if (el) {
          const top = el.offsetTop
          const height = el.offsetHeight
          if (scrollPosition >= top && scrollPosition < top + height) {
            setActiveSection(id)
            break
          }
        }
      }
    }

    window.addEventListener('scroll', handleScrollSpy, { passive: true })
    handleScrollSpy()
    return () => window.removeEventListener('scroll', handleScrollSpy)
  }, [])

  // Smooth scroll helper that takes sticky navbar height into account
  const scrollToSection = (e, id) => {
    e.preventDefault()
    setActiveSection(id)
    const el = document.getElementById(id)
    if (el) {
      const navHeight = 72
      const elPosition = el.getBoundingClientRect().top + window.pageYOffset
      const offsetPosition = elPosition - navHeight

      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth'
      })
    }
  }

  // Smooth Back to Top
  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    })
  }

  // Direct 1-Click Demo Login Handlers
  const handleQuickDemo = (role = 'superadmin') => {
    if (role === 'superadmin') {
      login('superadmin', 'admin@schoolms.com', true)
      showToast('Welcome to Super Admin Headquarters Demo!')
    } else {
      login('institute_admin', 'admin.beacon@sms.edu', true)
      showToast('Welcome to Beaconhouse Campus Admin Demo!')
    }
  }

  // Smart Plan Modal Opener: Dynamically configures modal title, badge, icon, and default tier
  const openPlanModal = (planKey = 'trial') => {
    setActiveModalPlan(planKey)
    setModalStep(2) // Jump directly to Step 2 (Enter Details) with preselected plan
    if (planKey === 'school') {
      setTrialForm(prev => ({ ...prev, wing: 'school' }))
    } else if (planKey === 'college') {
      setTrialForm(prev => ({ ...prev, wing: 'college' }))
    } else if (planKey === 'university') {
      setTrialForm(prev => ({ ...prev, wing: 'university' }))
    } else if (planKey === 'custom') {
      setTrialForm(prev => ({ ...prev, wing: 'multi-campus' }))
    } else {
      setTrialForm(prev => ({ ...prev, wing: 'school' }))
    }
    setIsTrialModalOpen(true)
  }

  // Smart Trial Modal Opener that pre-selects the clicked educational wing
  const handleOpenTrialModal = (targetWing = 'school') => {
    if (targetWing === 'college') {
      openPlanModal('college')
    } else if (targetWing === 'university') {
      openPlanModal('university')
    } else if (targetWing === 'custom') {
      openPlanModal('university')
    } else {
      openPlanModal('school')
    }
  }

  // Handle Free Trial / Plan Registration Submission to Super Admin
  const handleSubmitTrial = (e) => {
    e.preventDefault()
    if (!trialForm.instituteName.trim()) {
      showToast('Please enter your Institution Name.')
      return
    }
    if (!trialForm.email.trim()) {
      showToast('Please enter your Official Email Address.')
      return
    }
    if (!trialForm.phone.trim()) {
      showToast('Please enter your Mobile / WhatsApp Number.')
      return
    }
    if (!trialForm.adminPassword) {
      showToast('Please create an Admin Password.')
      return
    }
    if (trialForm.adminPassword !== trialForm.confirmPassword) {
      showToast('Admin Passwords do not match. Please verify.')
      return
    }
    if (!trialForm.agreedToTerms) {
      showToast('Please agree to the Terms of Service & Software Usage Agreement.')
      return
    }

    setIsSubmittingTrial(true)

    setTimeout(() => {
      try {
        const fullPhone = trialForm.phone.trim().startsWith('+') ? trialForm.phone.trim() : `+92 ${trialForm.phone.trim().replace(/^0+/, '')}`
        const newInstId = `inst-trial-${Date.now().toString().slice(-4)}`
        const approvalId = `appr-reg-${Date.now().toString().slice(-6)}`
        const instCode = trialForm.instituteName.replace(/[^A-Za-z0-9]/g, '').slice(0, 4).toUpperCase() || 'INST'

        const currentPlanConfig = PLAN_CONFIGS[activeModalPlan] || PLAN_CONFIGS.trial
        const planTierName = currentPlanConfig.planName

        let planPrice = 0
        if (activeModalPlan === 'school') {
          planPrice = billingCycle === 'annual' ? 21250 : 25000
        } else if (activeModalPlan === 'college') {
          planPrice = billingCycle === 'annual' ? 29750 : 35000
        } else if (activeModalPlan === 'university') {
          planPrice = billingCycle === 'annual' ? 46750 : 55000
        }

        const wingType = trialForm.wing === 'school' ? 'School' : trialForm.wing === 'college' ? 'College' : trialForm.wing === 'university' ? 'University' : 'Multi-Campus Hybrid'

        // 1. Create Institute Entry in storedData
        const newInstitute = {
          id: newInstId,
          name: trialForm.instituteName.trim(),
          code: instCode,
          contactPerson: trialForm.adminName.trim() || 'Principal Administrator',
          email: trialForm.email.trim(),
          phone: fullPhone,
          address: `${trialForm.city || 'Lahore'}, Pakistan`,
          city: trialForm.city || 'Lahore',
          country: 'Pakistan',
          planTier: planTierName,
          planType: trialForm.wing.toUpperCase(),
          type: wingType,
          subscriptionStatus: 'PENDING_APPROVAL',
          lifecycleStatus: 'Pending',
          trialEndsAt: new Date(Date.now() + 14 * 86400000).toISOString().slice(0, 10),
          enabledTiers: [trialForm.wing === 'university' ? 'undergraduate' : trialForm.wing],
          createdAt: new Date().toISOString().slice(0, 10),
          status: 'Pending Approval',
          wingsCount: 1,
          campusesCount: trialForm.wing === 'multi-campus' ? 3 : 1,
          studentCount: 0,
          facultyCount: 0,
          adminPassword: trialForm.adminPassword,
          notes: trialForm.notes.trim()
        }

        const currentData = getStoredData()
        const updatedInstitutes = [newInstitute, ...(currentData.institutes || [])]
        saveStoredData({ ...currentData, institutes: updatedInstitutes })

        // 2. Register in billing subscriptions as pending approval
        const trialSub = {
          id: `sub-reg-${Date.now().toString().slice(-4)}`,
          instituteId: newInstId,
          instituteName: trialForm.instituteName.trim(),
          planId: `plan-${activeModalPlan}`,
          planName: planTierName,
          enabledTiers: [trialForm.wing === 'university' ? 'undergraduate' : trialForm.wing],
          status: 'PENDING_APPROVAL',
          billingCycle: activeModalPlan === 'trial' ? '14-day trial' : billingCycle,
          pricePKR: planPrice,
          startDate: new Date().toISOString().slice(0, 10),
          renewalDate: new Date(Date.now() + 14 * 86400000).toISOString().slice(0, 10),
          trialEndsAt: new Date(Date.now() + 14 * 86400000).toISOString().slice(0, 10),
          autoRenew: false,
          isWaived: activeModalPlan === 'trial',
          waiveReason: activeModalPlan === 'trial' ? '14-Day Free Evaluation' : 'Standard Evaluation'
        }

        const localSubs = localStorage.getItem('sms_institute_subscriptions')
        let subsList = []
        if (localSubs) {
          try { subsList = JSON.parse(localSubs) } catch {}
        }
        subsList.unshift(trialSub)
        localStorage.setItem('sms_institute_subscriptions', JSON.stringify(subsList))

        // 3. Push official approval petition to sms_approval_requests for Super Admin
        const localApprovals = localStorage.getItem('sms_approval_requests')
        let approvalsList = []
        if (localApprovals) {
          try { approvalsList = JSON.parse(localApprovals) } catch {}
        }
        const approvalEntry = {
          id: approvalId,
          requestType: 'INSTITUTE_ONBOARDING',
          instituteId: newInstId,
          instituteName: trialForm.instituteName.trim(),
          title: `New Onboarding Petition: ${trialForm.instituteName.trim()} (${planTierName})`,
          details: {
            instituteName: trialForm.instituteName.trim(),
            campusCode: instCode,
            contactPerson: trialForm.adminName.trim() || 'Principal Administrator',
            email: trialForm.email.trim(),
            phone: fullPhone,
            city: trialForm.city || 'Lahore',
            wing: trialForm.wing,
            wingType: wingType,
            planTier: planTierName,
            planPrice: planPrice,
            billingCycle: billingCycle,
            adminPassword: trialForm.adminPassword,
            notes: trialForm.notes.trim() || 'Awaiting Super Admin credential review and activation.',
            agreedToTerms: true,
            submittedAt: new Date().toISOString()
          },
          status: 'PENDING',
          reviewerNotes: null,
          createdAt: new Date().toISOString()
        }
        approvalsList.unshift(approvalEntry)
        localStorage.setItem('sms_approval_requests', JSON.stringify(approvalsList))

        // 4. Dispatch storage and custom events for real-time reactivity across Super Admin views
        if (typeof window !== 'undefined') {
          window.dispatchEvent(new Event('sms_approval_created'))
          window.dispatchEvent(new Event('storage'))
        }

        // 5. Save submitted details for the Animated Green Success Popup
        setSubmittedSuccessData({
          requestId: approvalEntry.id,
          instituteName: trialForm.instituteName.trim(),
          adminName: trialForm.adminName.trim() || 'Principal Administrator',
          email: trialForm.email.trim(),
          phone: fullPhone,
          city: trialForm.city || 'Lahore',
          tierName: wingType,
          planTier: planTierName,
          adminPassword: trialForm.adminPassword
        })

        setIsSubmittingTrial(false)
        setIsTrialModalOpen(false)
        setIsSuccessModalOpen(true)
        showToast('Registration submitted successfully for Super Admin approval!')
      } catch (err) {
        setIsSubmittingTrial(false)
        showToast('Submission error: ' + err.message)
      }
    }, 600)
  }

  // Tab previews data for live mockup
  const wingPreviews = {
    school: {
      title: 'School Wing (Primary to Matric / O-Levels)',
      tag: 'Matriculation & Cambridge Stream',
      description: 'Engineered specifically for junior schools, middle branches, and matriculation academies. Manage class timetables, daily period attendance, computerized fee challans, and progress reports.',
      metrics: [
        { label: 'Active Students', value: '1,420', sub: 'Matric & O-Levels' },
        { label: 'Fee Collection', value: '98.4%', sub: 'JazzCash / 1Link' },
        { label: 'Classes & Sections', value: '38', sub: 'Playgroup to Grade 10' },
        { label: 'Faculty Members', value: '54', sub: 'Subject Specialists' }
      ],
      features: [
        'Automated 3-copy fee challans with barcode & 1Bill reference',
        'Subject-wise timetable scheduler with collision detection',
        'Daily SMS and WhatsApp absent alerts sent to parents',
        'Matric & O-Levels terminal examination marksheets'
      ]
    },
    college: {
      title: 'College Wing (Intermediate - F.Sc, ICS, FA, I.Com)',
      tag: 'Higher Secondary & Pre-Engineering/Medical',
      description: 'Tailored for intermediate colleges. Supports BISE board affiliations, academic session transitions, practical lab scheduling, automated roll number slips, and merit-based admissions.',
      metrics: [
        { label: 'Active Students', value: '2,850', sub: 'Part-I & Part-II' },
        { label: 'Board Pass Rate', value: '99.1%', sub: 'BISE Affiliated' },
        { label: 'Program Wings', value: '6', sub: 'F.Sc, ICS, FA, I.Com' },
        { label: 'Faculty Staff', value: '88', sub: 'College Lecturers' }
      ],
      features: [
        'BISE examination board registration & roll number tracking',
        'Group-wise subject electives (Medical, Engineering, Computer Science)',
        'Merit list generator for intermediate admissions pipeline',
        'College library book checkout & cataloging module'
      ]
    },
    university: {
      title: 'University Wing (4-Year BS Degrees & Semesters)',
      tag: 'Higher Education Commission (HEC) Aligned',
      description: 'Comprehensive undergraduate degree governance with semester credit hours, GPA/CGPA grading formulas, faculty departments, thesis tracking, and transcript printing.',
      metrics: [
        { label: 'Active Undergrads', value: '6,400', sub: '8 BS Programs' },
        { label: 'Credit Hours Tracked', value: '136', sub: 'Per Degree Scheme' },
        { label: 'Academic Departments', value: '9', sub: 'CS, BBA, SE, Math' },
        { label: 'Faculty Professors', value: '142', sub: 'PhD & M.Phil' }
      ],
      features: [
        'Automated CGPA calculation with relative & absolute grading schemes',
        'Semester course registration with prerequisite validation',
        'Departmental faculty workload & lecture room distribution',
        'Official transcript and semester result gazette generator'
      ]
    },
    custom: {
      title: 'Custom Multi-Campus Conglomerate',
      tag: 'Unified Multi-Wing Headquarters',
      description: 'Ideal for large educational networks operating multiple branches across Pakistan. Manage schools, colleges, and university wings under a centralized Super Admin headquarters.',
      metrics: [
        { label: 'Total Enrolled', value: '14,800+', sub: 'Across 12 Campuses' },
        { label: 'Network MRR', value: 'PKR 1.2M', sub: 'Reconciled Ledger' },
        { label: 'Active Branches', value: '12', sub: 'Lahore, Isb, Khi' },
        { label: 'System Uptime', value: '99.98%', sub: 'Cloud Isolated' }
      ],
      features: [
        'Central Super Admin dashboard with real-time financial consolidated ledger',
        'Cross-campus student transfer with historical academic record retention',
        'Headquarters fee revenue aggregation & 1Link corporate clearing',
        'Platform security center with IP whitelisting & audit logs'
      ]
    }
  }

  const currentPreview = wingPreviews[activeTab]

  // Navbar items matching the page sections in exact scroll order
  const navItems = [
    { id: 'features', label: 'Core Features' },
    { id: 'wings', label: 'Educational Wings' },
    { id: 'preview', label: 'Dashboard Preview' },
    { id: 'pricing', label: 'Packages & Free Trial' },
    { id: 'faq', label: 'FAQ' }
  ]

  return (
    <div className="min-h-screen w-full bg-[#fcfaff] text-slate-900 font-sans selection:bg-purple-100 selection:text-purple-900 overflow-x-clip relative">
      
      {/* 1. TOP ANNOUNCEMENT BANNER (Controlled Live via Super Admin) */}
      {landingBanner?.isActive && showAnnouncementBanner && (
        <div
          className={`border-b px-4 py-2 text-xs font-medium relative flex items-center justify-center transition-all ${
            landingBanner.theme === 'emerald'
              ? 'bg-emerald-50 text-emerald-950 border-emerald-200/80'
              : landingBanner.theme === 'rose'
              ? 'bg-rose-50 text-rose-950 border-rose-200/80'
              : landingBanner.theme === 'amber'
              ? 'bg-amber-50 text-amber-950 border-amber-200/80'
              : landingBanner.theme === 'indigo'
              ? 'bg-indigo-50 text-indigo-950 border-indigo-200/80'
              : 'bg-[#f5eeff] text-purple-900 border-purple-200/80'
          }`}
        >
          <div className="flex flex-wrap items-center justify-center gap-1.5 sm:gap-2 text-center pr-8 sm:pr-0">
            <span
              className={`w-2 h-2 rounded-full animate-pulse shrink-0 ${
                landingBanner.theme === 'emerald'
                  ? 'bg-emerald-600'
                  : landingBanner.theme === 'rose'
                  ? 'bg-rose-600'
                  : landingBanner.theme === 'amber'
                  ? 'bg-amber-600'
                  : landingBanner.theme === 'indigo'
                  ? 'bg-indigo-600'
                  : 'bg-purple-600'
              }`}
            ></span>
            <span>
              <strong>{landingBanner.badgeText || 'New Release'}:</strong>{' '}
              {landingBanner.message || '14-Day Free Evaluation Tier is now active for all educational institutions.'}
            </span>
            {landingBanner.ctaText && (
              <button
                type="button"
                onClick={(e) => {
                  if (landingBanner.ctaAction === 'trial_modal') {
                    setIsTrialModalOpen(true)
                  } else if (landingBanner.ctaAction === 'login') {
                    onNavigateToLogin('signin')
                  } else if (landingBanner.ctaAction === 'pricing') {
                    scrollToSection(e, 'pricing')
                  } else if (landingBanner.ctaLink) {
                    if (landingBanner.ctaLink.startsWith('#')) {
                      const section = landingBanner.ctaLink.replace('#', '')
                      if (section === 'trial') setIsTrialModalOpen(true)
                      else scrollToSection(e, section)
                    } else {
                      window.open(landingBanner.ctaLink, '_blank')
                    }
                  } else {
                    setIsTrialModalOpen(true)
                  }
                }}
                className={`ml-1 underline font-bold cursor-pointer inline-flex items-center gap-0.5 ${
                  landingBanner.theme === 'emerald'
                    ? 'hover:text-emerald-700'
                    : landingBanner.theme === 'rose'
                    ? 'hover:text-rose-700'
                    : landingBanner.theme === 'amber'
                    ? 'hover:text-amber-800'
                    : landingBanner.theme === 'indigo'
                    ? 'hover:text-indigo-700'
                    : 'hover:text-purple-700'
                }`}
              >
                <span>{landingBanner.ctaText}</span>
                <ArrowRight className="w-3 h-3" />
              </button>
            )}
          </div>
          {landingBanner.dismissible !== false && (
            <button
              type="button"
              onClick={() => setShowAnnouncementBanner(false)}
              className="absolute right-3 sm:right-4 top-1/2 -translate-y-1/2 p-1 rounded-lg hover:bg-black/5 text-slate-500 hover:text-slate-800 transition-colors cursor-pointer shrink-0"
              aria-label="Dismiss banner"
              title="Dismiss announcement"
            >
              <X className="w-3.5 h-3.5 stroke-[2.5]" />
            </button>
          )}
        </div>
      )}

      {/* 2. STICKY GLASSMORPHIC NAVBAR WITH ACTIVE HIGHLIGHT ANIMATION */}
      <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-purple-100/90 shadow-[0_4px_20px_-4px_rgba(147,51,234,0.06)] transition-all duration-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 sm:h-18 flex items-center justify-between gap-2 sm:gap-4">
          
          {/* Brand Logo */}
          <div 
            onClick={(e) => scrollToSection(e, 'hero')}
            className="flex items-center gap-2.5 sm:gap-3 cursor-pointer group shrink-0"
          >
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-tr from-purple-700 via-purple-600 to-indigo-600 flex items-center justify-center text-white shadow-sm shadow-purple-500/25 group-hover:scale-105 transition-transform shrink-0">
              <GraduationCap className="w-5 h-5 stroke-[2.2]" />
            </div>
            <div>
              <div className="flex items-center gap-1.5 sm:gap-2">
                <span className="text-base sm:text-lg font-extrabold font-heading tracking-tight text-slate-900">
                  Apex<span className="text-purple-600">Ed</span>
                </span>
                <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-[#f5eeff] text-purple-700 border border-purple-200 hidden xs:inline-block">
                  ERP v2.4
                </span>
              </div>
              <p className="text-[11px] text-slate-500 hidden sm:block -mt-0.5">
                Educational Management Operating System
              </p>
            </div>
          </div>

          {/* Center Navigation Links with Smooth Active Highlighting Animation (Desktop) */}
          <nav className="hidden lg:flex items-center gap-1.5 p-1 bg-slate-50/70 rounded-2xl border border-purple-100/70 text-xs">
            {navItems.map((item) => {
              const isActive = activeSection === item.id
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={(e) => scrollToSection(e, item.id)}
                  className={`px-3 py-1.5 rounded-xl font-bold transition-all duration-200 cursor-pointer flex items-center gap-1.5 ${
                    isActive
                      ? 'bg-[#f5eeff] text-purple-700 border border-purple-200 shadow-xs'
                      : 'text-slate-600 hover:text-purple-600 hover:bg-white/80'
                  }`}
                >
                  {isActive && (
                    <span className="w-1.5 h-1.5 rounded-full bg-purple-600 animate-pulse"></span>
                  )}
                  <span>{item.label}</span>
                </button>
              )
            })}
          </nav>

          {/* Right Action Controls (Mobile Menu Toggle) */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Mobile Hamburger Menu Toggle Button */}
            <button
              type="button"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="lg:hidden p-2 rounded-xl text-slate-700 hover:text-purple-700 hover:bg-purple-50 border border-purple-100 transition-colors cursor-pointer"
              aria-label="Toggle Navigation Menu"
            >
              {isMobileMenuOpen ? (
                <X className="w-5 h-5 text-purple-700" />
              ) : (
                <Menu className="w-5 h-5 text-slate-700" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile Navigation Dropdown Drawer (Animated & Full Interactive Response) */}
        {isMobileMenuOpen && (
          <div className="lg:hidden border-t border-purple-100 bg-white/98 backdrop-blur-md px-4 py-4 shadow-xl space-y-3.5 animate-in slide-in-from-top-2 duration-200 max-h-[80vh] overflow-y-auto">
            {/* Nav Items */}
            <div className="space-y-1">
              {navItems.map((item) => {
                const isActive = activeSection === item.id
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={(e) => scrollToSection(e, item.id)}
                    className={`w-full text-left px-3.5 py-2.5 rounded-xl text-xs sm:text-sm font-bold flex items-center justify-between transition-colors ${
                      isActive
                        ? 'bg-[#f5eeff] text-purple-700 border border-purple-200'
                        : 'text-slate-700 hover:bg-purple-50 hover:text-purple-700'
                    }`}
                  >
                    <span>{item.label}</span>
                    {isActive ? (
                      <span className="w-2 h-2 rounded-full bg-purple-600 animate-pulse"></span>
                    ) : (
                      <ArrowRight className="w-3.5 h-3.5 text-slate-300" />
                    )}
                  </button>
                )
              })}
            </div>

            {/* Quick Actions in Mobile Menu */}
            <div className="pt-2 border-t border-purple-100 space-y-2">
              <button
                type="button"
                onClick={() => {
                  setIsMobileMenuOpen(false)
                  setIsTrialModalOpen(true)
                }}
                className="w-full py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs sm:text-sm shadow-xs transition-colors flex items-center justify-center gap-2"
              >
                <Sparkles className="w-4 h-4 text-purple-200" />
                <span>Start 14-Day Free Trial (₨ 0)</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setIsMobileMenuOpen(false)
                  onNavigateToLogin('signin')
                }}
                className="w-full py-2.5 rounded-xl bg-purple-50 hover:bg-purple-100 text-purple-700 font-bold text-xs sm:text-sm border border-purple-200 transition-colors flex items-center justify-center gap-2"
              >
                <Lock className="w-4 h-4" />
                <span>Portal Sign In</span>
              </button>
            </div>

            {/* Direct 1-Click Interactive Demos in Mobile Drawer */}
            <div className="pt-2 border-t border-purple-100">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1.5">
                Instant 1-Click Demo Evaluation:
              </span>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <button
                  type="button"
                  onClick={() => {
                    setIsMobileMenuOpen(false)
                    handleQuickDemo('superadmin')
                  }}
                  className="py-2 px-2.5 rounded-xl bg-slate-50 hover:bg-purple-50 border border-slate-200 text-slate-700 hover:text-purple-700 font-semibold text-center transition-colors flex items-center justify-center gap-1"
                >
                  <Laptop className="w-3.5 h-3.5 text-purple-600" />
                  <span>Super Admin</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setIsMobileMenuOpen(false)
                    handleQuickDemo('institute')
                  }}
                  className="py-2 px-2.5 rounded-xl bg-slate-50 hover:bg-purple-50 border border-slate-200 text-slate-700 hover:text-purple-700 font-semibold text-center transition-colors flex items-center justify-center gap-1"
                >
                  <Building2 className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Campus Admin</span>
                </button>
              </div>
            </div>
          </div>
        )}
      </header>

      {/* 3. HERO SECTION */}
      <section id="hero" className="relative pt-14 pb-20 overflow-hidden bg-gradient-to-b from-[#fcfaff] via-[#f5eeff]/35 to-white">
        {/* Soft Ambient Radial Accents */}
        <div className="absolute top-10 left-1/2 -translate-x-1/2 w-[700px] h-[350px] bg-purple-200/40 rounded-full blur-3xl pointer-events-none -z-10"></div>
        <div className="absolute top-40 right-10 w-96 h-96 bg-indigo-100/40 rounded-full blur-3xl pointer-events-none -z-10"></div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          
          {/* Eyebrow Badge */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#f5eeff] text-purple-700 border border-purple-200 text-xs font-bold shadow-xs mb-6 animate-in fade-in">
            <Sparkles className="w-3.5 h-3.5 text-purple-600" />
            <span>Next-Gen Multi-Campus Academic Operating System</span>
          </div>

          {/* Hero Headline */}
          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold text-slate-900 font-heading tracking-tight max-w-4xl mx-auto leading-[1.15]">
            One Intelligent Platform to Run <br className="hidden sm:inline" />
            <span className="bg-gradient-to-r from-purple-700 via-purple-600 to-indigo-600 bg-clip-text text-transparent">
              Schools, Colleges & Universities
            </span>
          </h1>

          {/* Subtitle */}
          <p className="mt-5 text-sm sm:text-base lg:text-lg text-slate-600 max-w-2xl mx-auto leading-relaxed font-normal">
            Eliminate chaotic spreadsheets and outdated software. Unify computerized fee challans (1Link/JazzCash), digital attendance, class timetables, and multi-tier examinations in a single, elegant cloud portal.
          </p>

          {/* Hero CTAs */}
          <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4">
            <button
              onClick={() => setIsTrialModalOpen(true)}
              className="w-full sm:w-auto px-6 py-3.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-sm shadow-md shadow-purple-600/25 hover:shadow-lg transition-all hover:scale-[1.02] active:scale-95 cursor-pointer flex items-center justify-center gap-2"
            >
              <Sparkles className="w-4 h-4 text-purple-200" />
              <span>Start 14-Day Free Trial (₨ 0)</span>
            </button>

            <button
              type="button"
              onClick={() => onNavigateToLogin('signin')}
              className="w-full sm:w-auto px-6 py-3.5 rounded-xl bg-purple-50 hover:bg-[#f5eeff] text-purple-700 hover:text-purple-900 border-2 border-purple-300 hover:border-purple-500 font-extrabold text-sm shadow-xs hover:shadow-md transition-all duration-200 hover:scale-[1.02] active:scale-95 cursor-pointer flex items-center justify-center gap-2 group whitespace-nowrap"
              title="Sign in to your Educational Portal"
            >
              <div className="w-5 h-5 rounded-lg bg-purple-100 group-hover:bg-purple-200 flex items-center justify-center text-purple-700 transition-colors shrink-0">
                <Lock className="w-3.5 h-3.5 stroke-[2.4]" />
              </div>
              <span className="font-heading tracking-tight">Portal Sign In</span>
              <ArrowRight className="w-4 h-4 text-purple-400 group-hover:text-purple-700 group-hover:translate-x-0.5 transition-all shrink-0" />
            </button>
          </div>

          {/* Trust Highlights */}
          <div className="mt-10 pt-8 border-t border-purple-100/80 max-w-3xl mx-auto grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs font-semibold text-slate-600">
            <div className="flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/80 border border-purple-100 shadow-2xs">
              <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
              <span className="font-bold text-slate-800">₨ 0 Free Evaluation</span>
            </div>
            <div className="flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/80 border border-purple-100 shadow-2xs">
              <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
              <span className="font-bold text-slate-800">1Link & JazzCash</span>
            </div>
            <div className="flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/80 border border-purple-100 shadow-2xs">
              <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
              <span className="font-bold text-slate-800">Multi-Tenant Cloud</span>
            </div>
            <div className="flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/80 border border-purple-100 shadow-2xs">
              <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
              <span className="font-bold text-slate-800">Zero Setup Fees</span>
            </div>
          </div>
        </div>
      </section>

      {/* 4. CORE PLATFORM MODULES SECTION */}
      <section id="features" className="py-20 bg-white border-y border-purple-100/70">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="text-center max-w-3xl mx-auto mb-14">
            <span className="text-xs font-bold uppercase tracking-wider text-purple-700 bg-[#f5eeff] px-3 py-1 rounded-full border border-purple-200">
              Built for Real Pakistani & Global Operations
            </span>
            <h2 className="text-2xl sm:text-4xl font-extrabold text-slate-900 font-heading tracking-tight mt-3">
              Everything Your Administration Needs
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 mt-2">
              All modules work together seamlessly out of the box with zero manual integration required.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            
            {/* Feature 1 */}
            <div className="p-6 rounded-2xl bg-[#fcfaff] border border-purple-100/80 hover:border-purple-200 transition-all">
              <div className="w-10 h-10 rounded-xl bg-[#f5eeff] text-purple-700 flex items-center justify-center mb-4">
                <CreditCard className="w-5 h-5" />
              </div>
              <h4 className="text-base font-bold text-slate-900">Fee Challans & Pakistani Gateways</h4>
              <p className="text-xs text-slate-500 mt-1.5 leading-relaxed">
                Computerized fee vouchers with 1Link, 1Bill, and JazzCash corporate references. Includes installment tracking, partial payments, and overdue fines.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="p-6 rounded-2xl bg-[#fcfaff] border border-purple-100/80 hover:border-purple-200 transition-all">
              <div className="w-10 h-10 rounded-xl bg-[#f5eeff] text-purple-700 flex items-center justify-center mb-4">
                <FileText className="w-5 h-5" />
              </div>
              <h4 className="text-base font-bold text-slate-900">Examinations & Printable Admit Cards</h4>
              <p className="text-xs text-slate-500 mt-1.5 leading-relaxed">
                Generate printable exam admit cards with candidate photos, roll numbers, and date sheets. Enter marks and print official result gazettes instantly.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="p-6 rounded-2xl bg-[#fcfaff] border border-purple-100/80 hover:border-purple-200 transition-all">
              <div className="w-10 h-10 rounded-xl bg-[#f5eeff] text-purple-700 flex items-center justify-center mb-4">
                <Calendar className="w-5 h-5" />
              </div>
              <h4 className="text-base font-bold text-slate-900">Daily Digital Attendance</h4>
              <p className="text-xs text-slate-500 mt-1.5 leading-relaxed">
                Period-wise attendance for students and staff. Automatic notifications for consecutive absences, leaves management, and monthly attendance registers.
              </p>
            </div>

            {/* Feature 4 */}
            <div className="p-6 rounded-2xl bg-[#fcfaff] border border-purple-100/80 hover:border-purple-200 transition-all">
              <div className="w-10 h-10 rounded-xl bg-[#f5eeff] text-purple-700 flex items-center justify-center mb-4">
                <MessageCircle className="w-5 h-5" />
              </div>
              <h4 className="text-base font-bold text-slate-900">Direct WhatsApp & SMS Broadcasts</h4>
              <p className="text-xs text-slate-500 mt-1.5 leading-relaxed">
                Instantly reach parents and faculty via integrated WhatsApp redirect links and SMS broadcasting. Send fee reminders, exam schedules, and circulars.
              </p>
            </div>

            {/* Feature 5 */}
            <div className="p-6 rounded-2xl bg-[#fcfaff] border border-purple-100/80 hover:border-purple-200 transition-all">
              <div className="w-10 h-10 rounded-xl bg-[#f5eeff] text-purple-700 flex items-center justify-center mb-4">
                <BarChart3 className="w-5 h-5" />
              </div>
              <h4 className="text-base font-bold text-slate-900">Cross-Institute Financial Analytics</h4>
              <p className="text-xs text-slate-500 mt-1.5 leading-relaxed">
                Live platform MRR, ARR, student admission trends, and fee collection rates. Download complete audit reports in Excel and CSV formats.
              </p>
            </div>

            {/* Feature 6 */}
            <div className="p-6 rounded-2xl bg-[#fcfaff] border border-purple-100/80 hover:border-purple-200 transition-all">
              <div className="w-10 h-10 rounded-xl bg-[#f5eeff] text-purple-700 flex items-center justify-center mb-4">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <h4 className="text-base font-bold text-slate-900">Multi-Tenant Cloud Security</h4>
              <p className="text-xs text-slate-500 mt-1.5 leading-relaxed">
                Strict data isolation between campuses, role-based access control (Super Admin, Campus Admin, Teachers, Accounts), and automatic encrypted backups.
              </p>
            </div>

          </div>
        </div>
      </section>

      {/* 5. EDUCATIONAL WINGS SHOWCASE SECTION */}
      <section id="wings" className="py-20 bg-gradient-to-b from-white to-[#fcfaff]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="text-center max-w-3xl mx-auto mb-14">
            <span className="text-xs font-bold uppercase tracking-wider text-purple-700 bg-[#f5eeff] px-3 py-1 rounded-full border border-purple-200">
              Engineered for Every Educational Wing
            </span>
            <h2 className="text-2xl sm:text-4xl font-extrabold text-slate-900 font-heading tracking-tight mt-3">
              One Architecture. Endless Scalability.
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 mt-2">
              Whether you govern a standalone Montessori, an intermediate pre-medical college, or a multi-campus university network, ApexEd fits your institutional needs without compromises.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            
            {/* Wing 1: School */}
            <div className="p-6 rounded-3xl bg-white border border-purple-100 hover:border-purple-300 shadow-xs hover:shadow-md transition-all flex flex-col justify-between group">
              <div>
                <div className="w-12 h-12 rounded-2xl bg-purple-50 text-purple-700 border border-purple-200 flex items-center justify-center mb-5 group-hover:scale-105 transition-transform">
                  <School className="w-6 h-6 stroke-[2.2]" />
                </div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-purple-700 bg-[#f5eeff] px-2.5 py-0.5 rounded-md border border-purple-200">
                  Primary & Secondary
                </span>
                <h3 className="text-xl font-bold text-slate-900 mt-2">School Wing</h3>
                <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                  Tailored for Matriculation & Cambridge O-Levels. Includes parent communication, class timetables, daily attendance, and auto fee vouchers.
                </p>

                <ul className="mt-5 space-y-2 text-xs text-slate-600">
                  <li className="flex items-center gap-2">
                    <Check className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Matric & O-Levels report cards</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Barcode-scannable 3-copy fee vouchers</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Parent SMS / WhatsApp notification alerts</span>
                  </li>
                </ul>
              </div>

              <div className="mt-6 pt-4 border-t border-slate-100">
                <button
                  onClick={() => handleOpenTrialModal('school')}
                  className="w-full py-2.5 rounded-xl bg-purple-50 hover:bg-purple-100 text-purple-700 font-bold text-xs transition-colors cursor-pointer flex items-center justify-center gap-1.5"
                >
                  <span>Start School Free Trial</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Wing 2: College */}
            <div className="p-6 rounded-3xl bg-white border border-purple-100 hover:border-purple-300 shadow-xs hover:shadow-md transition-all flex flex-col justify-between group">
              <div>
                <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-700 border border-indigo-200 flex items-center justify-center mb-5 group-hover:scale-105 transition-transform">
                  <Building2 className="w-6 h-6 stroke-[2.2]" />
                </div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-indigo-700 bg-indigo-50 px-2.5 py-0.5 rounded-md border border-indigo-200">
                  Intermediate & A-Levels
                </span>
                <h3 className="text-xl font-bold text-slate-900 mt-2">College Wing</h3>
                <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                  Engineered for F.Sc (Pre-Med/Eng), ICS, FA, and I.Com colleges. Manage BISE board registrations, college admissions, and practical labs.
                </p>

                <ul className="mt-5 space-y-2 text-xs text-slate-600">
                  <li className="flex items-center gap-2">
                    <Check className="w-3.5 h-3.5 text-emerald-600" />
                    <span>BISE Board affiliations & roll number slips</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Intermediate admissions merit pipeline</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Multi-program subject group allocations</span>
                  </li>
                </ul>
              </div>

              <div className="mt-6 pt-4 border-t border-slate-100">
                <button
                  onClick={() => handleOpenTrialModal('college')}
                  className="w-full py-2.5 rounded-xl bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-bold text-xs transition-colors cursor-pointer flex items-center justify-center gap-1.5"
                >
                  <span>Start College Free Trial</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Wing 3: University */}
            <div className="p-6 rounded-3xl bg-white border border-purple-100 hover:border-purple-300 shadow-xs hover:shadow-md transition-all flex flex-col justify-between group">
              <div>
                <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center justify-center mb-5 group-hover:scale-105 transition-transform">
                  <GraduationCap className="w-6 h-6 stroke-[2.2]" />
                </div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-md border border-emerald-200">
                  Higher Education & BS
                </span>
                <h3 className="text-xl font-bold text-slate-900 mt-2">University Wing</h3>
                <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                  Full 4-Year BS degree management aligned with HEC guidelines. Supports credit hours, semester GPA/CGPA grading, and academic faculties.
                </p>

                <ul className="mt-5 space-y-2 text-xs text-slate-600">
                  <li className="flex items-center gap-2">
                    <Check className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Automated GPA & CGPA grading matrices</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Semester course schemes & credit hours</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Faculty departments & degree requirements</span>
                  </li>
                </ul>
              </div>

              <div className="mt-6 pt-4 border-t border-slate-100">
                <button
                  onClick={() => handleOpenTrialModal('university')}
                  className="w-full py-2.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-700 font-bold text-xs transition-colors cursor-pointer flex items-center justify-center gap-1.5"
                >
                  <span>Start University Trial</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* 6. INTERACTIVE PRODUCT PREVIEW SECTION */}
      <section id="preview" className="py-20 bg-white border-y border-purple-100/70">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="text-center max-w-3xl mx-auto mb-10">
            <span className="text-xs font-bold uppercase tracking-wider text-purple-700 bg-[#f5eeff] px-3 py-1 rounded-full border border-purple-200">
              Interactive Dashboard Preview
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 font-heading tracking-tight mt-3">
              Designed for Speed, Clarity, and Institutional Control
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 mt-2">
              Select an educational wing below to inspect how ApexEd adapts interfaces, quotas, and workflows seamlessly.
            </p>

            {/* Wing Switcher Pills */}
            <div className="flex flex-wrap items-center justify-center gap-2 mt-6 p-1.5 bg-slate-100/80 rounded-2xl border border-slate-200/80 max-w-2xl mx-auto">
              <button
                onClick={() => setActiveTab('school')}
                className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  activeTab === 'school'
                    ? 'bg-purple-600 text-white shadow-xs'
                    : 'text-slate-600 hover:text-purple-700 hover:bg-white'
                }`}
              >
                <School className="w-3.5 h-3.5" />
                <span>School Wing</span>
              </button>
              <button
                onClick={() => setActiveTab('college')}
                className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  activeTab === 'college'
                    ? 'bg-purple-600 text-white shadow-xs'
                    : 'text-slate-600 hover:text-purple-700 hover:bg-white'
                }`}
              >
                <Building2 className="w-3.5 h-3.5" />
                <span>College Wing</span>
              </button>
              <button
                onClick={() => setActiveTab('university')}
                className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  activeTab === 'university'
                    ? 'bg-purple-600 text-white shadow-xs'
                    : 'text-slate-600 hover:text-purple-700 hover:bg-white'
                }`}
              >
                <GraduationCap className="w-3.5 h-3.5" />
                <span>University Wing</span>
              </button>
              <button
                onClick={() => setActiveTab('custom')}
                className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  activeTab === 'custom'
                    ? 'bg-purple-600 text-white shadow-xs'
                    : 'text-slate-600 hover:text-purple-700 hover:bg-white'
                }`}
              >
                <Sliders className="w-3.5 h-3.5" />
                <span>Multi-Campus Group</span>
              </button>
            </div>
          </div>

          {/* Mockup Card Window */}
          <div className="rounded-3xl border border-purple-200/90 bg-white shadow-[0_20px_50px_rgba(147,51,234,0.06)] overflow-hidden">
            
            {/* Window Titlebar (macOS Style Browser Window Chrome) */}
            <div className="px-5 py-3.5 bg-slate-950 text-slate-200 flex items-center justify-between border-b border-slate-800">
              <div className="flex items-center gap-2.5">
                <div className="flex items-center gap-1.5">
                  <span className="w-3 h-3 rounded-full bg-rose-500 shadow-xs hover:opacity-80 transition-opacity"></span>
                  <span className="w-3 h-3 rounded-full bg-amber-500 shadow-xs hover:opacity-80 transition-opacity"></span>
                  <span className="w-3 h-3 rounded-full bg-emerald-500 shadow-xs hover:opacity-80 transition-opacity"></span>
                </div>
                <div className="hidden sm:flex items-center gap-1.5 bg-slate-900 px-3 py-1 rounded-lg border border-slate-800 text-[11px] font-mono text-slate-400 ml-2">
                  <Lock className="w-3 h-3 text-emerald-400" />
                  <span className="text-slate-300">https://</span>
                  <span>app.apexed.pk/portal/{activeTab}</span>
                </div>
              </div>
              <div className="flex items-center gap-2 text-[11px] font-bold text-slate-300 bg-slate-900/80 px-2.5 py-1 rounded-lg border border-slate-800">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse shadow-[0_0_8px_#34d399]"></span>
                <span className="text-emerald-400">Live Production Sync</span>
              </div>
            </div>

            {/* Mockup Inner Body */}
            <div className="p-6 sm:p-8 bg-[#fcfaff]">
              
              {/* Inner Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-purple-100">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-[#f5eeff] text-purple-700 border border-purple-200">
                      {currentPreview.tag}
                    </span>
                    <span className="text-xs text-slate-400">· Real-time Synchronization</span>
                  </div>
                  <h3 className="text-xl sm:text-2xl font-bold text-slate-900 mt-1 font-heading">
                    {currentPreview.title}
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-500 mt-0.5 max-w-2xl">
                    {currentPreview.description}
                  </p>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={() => handleQuickDemo(activeTab === 'custom' ? 'superadmin' : 'institute')}
                    className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold transition-colors cursor-pointer shadow-xs"
                  >
                    Open Live Portal
                  </button>
                </div>
              </div>

              {/* 4 Metrics Cards */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mt-6">
                {currentPreview.metrics.map((m, idx) => (
                  <div key={idx} className="p-4 rounded-2xl bg-white border border-purple-100 shadow-xs">
                    <span className="text-xs font-medium text-slate-500 block">{m.label}</span>
                    <span className="text-2xl font-extrabold text-slate-900 font-heading tracking-tight block mt-1">
                      {m.value}
                    </span>
                    <span className="text-[11px] font-semibold text-purple-600 block mt-1">
                      {m.sub}
                    </span>
                  </div>
                ))}
              </div>

              {/* Module Capabilities List */}
              <div className="mt-6 p-4 rounded-2xl bg-[#f5eeff]/60 border border-purple-200/80">
                <span className="text-xs font-bold uppercase tracking-wider text-purple-900 block mb-3">
                  Activated Academic Modules in this Wing:
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {currentPreview.features.map((feat, idx) => (
                    <div key={idx} className="flex items-center gap-2 text-xs text-slate-800 bg-white p-2.5 rounded-xl border border-purple-100/90 shadow-2xs">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                      <span className="font-medium">{feat}</span>
                    </div>
                  ))}
                </div>
              </div>

            </div>
          </div>

        </div>
      </section>

      {/* 6.5 NATIONWIDE OPERATIONAL METRICS (Senior UI Proof & Credibility Strip) */}
      <div className="py-12 bg-gradient-to-r from-purple-900 via-indigo-900 to-purple-950 text-white relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_var(--tw-gradient-stops))] from-purple-600/15 via-transparent to-transparent pointer-events-none" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8 text-center divide-y sm:divide-y-0 sm:divide-x divide-purple-800/60">
            <div className="pt-4 sm:pt-0">
              <span className="text-3xl sm:text-4xl font-extrabold font-heading text-white tracking-tight block">50,000+</span>
              <span className="text-xs sm:text-sm font-semibold text-purple-200 mt-1 block">Active Students Managed</span>
              <span className="text-[10px] text-purple-400 block mt-0.5">Across School & College Wings</span>
            </div>
            <div className="pt-4 sm:pt-0 sm:pl-6">
              <span className="text-3xl sm:text-4xl font-extrabold font-heading text-white tracking-tight block">150+</span>
              <span className="text-xs sm:text-sm font-semibold text-purple-200 mt-1 block">Registered Campuses</span>
              <span className="text-[10px] text-purple-400 block mt-0.5">Lahore, Karachi, Islamabad & More</span>
            </div>
            <div className="pt-4 sm:pt-0 sm:pl-6">
              <span className="text-3xl sm:text-4xl font-extrabold font-heading text-emerald-400 tracking-tight block">99.8%</span>
              <span className="text-xs sm:text-sm font-semibold text-purple-200 mt-1 block">Fee Reconciliation Accuracy</span>
              <span className="text-[10px] text-purple-400 block mt-0.5">Real-time 1Link & JazzCash</span>
            </div>
            <div className="pt-4 sm:pt-0 sm:pl-6">
              <span className="text-3xl sm:text-4xl font-extrabold font-heading text-white tracking-tight block">0 Downtime</span>
              <span className="text-xs sm:text-sm font-semibold text-purple-200 mt-1 block">High Availability Cloud</span>
              <span className="text-[10px] text-purple-400 block mt-0.5">Encrypted Isolated Tenants</span>
            </div>
          </div>
        </div>
      </div>

      {/* 7. PACKAGES & PRICING (FEATURING THE FREE TRIAL TIER) */}
      <section id="pricing" className="py-20 bg-gradient-to-b from-[#fcfaff] to-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="text-center max-w-3xl mx-auto mb-12">
            <span className="text-xs font-bold uppercase tracking-wider text-purple-700 bg-[#f5eeff] px-3 py-1 rounded-full border border-purple-200">
              Clear & Transparent SaaS Pricing
            </span>
            <h2 className="text-2xl sm:text-4xl font-extrabold text-slate-900 font-heading tracking-tight mt-3">
              Start with Our Free Evaluation Tier
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 mt-2">
              Zero commitments, no credit card required. Upgrade seamlessly when your academic session scales.
            </p>

            {/* Billing Cycle Switcher */}
            <div className="inline-flex items-center gap-2 mt-6 p-1 bg-slate-100 rounded-xl border border-slate-200">
              <button
                onClick={() => setBillingCycle('monthly')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  billingCycle === 'monthly' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600'
                }`}
              >
                Monthly Billing
              </button>
              <button
                onClick={() => setBillingCycle('annual')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1 ${
                  billingCycle === 'annual' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600'
                }`}
              >
                <span>Annual Prepaid</span>
                <span className="text-[10px] font-bold text-purple-700 bg-[#f5eeff] px-1.5 py-0.2 rounded-full border border-purple-200">
                  Save 15%
                </span>
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 items-stretch">
            
            {/* TIER 0: FREE EVALUATION TIER */}
            <div className="rounded-3xl border-2 border-emerald-400 bg-white p-6 flex flex-col justify-between shadow-md relative overflow-hidden">
              <div className="absolute top-0 right-0 bg-emerald-500 text-white text-[10px] font-extrabold uppercase tracking-widest px-3 py-1 rounded-bl-xl shadow-xs">
                Zero Risk Trial
              </div>

              <div>
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center">
                    <Sparkles className="w-4 h-4" />
                  </div>
                  <span className="text-xs font-bold uppercase text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md">
                    Evaluation Tier
                  </span>
                </div>

                <h3 className="text-xl font-extrabold text-slate-900">14-Day Free Trial</h3>
                <p className="text-xs text-slate-500 mt-1">
                  Full evaluation access for schools exploring ApexEd.
                </p>

                <div className="mt-4 mb-5 p-3 rounded-xl bg-emerald-50/60 border border-emerald-100">
                  <div className="flex items-baseline gap-1 font-heading">
                    <span className="text-lg font-bold text-emerald-600">₨</span>
                    <span className="text-3xl sm:text-4xl font-extrabold text-emerald-700 tracking-tight">0</span>
                    <span className="text-xs font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full ml-1.5 border border-emerald-200">
                      FREE
                    </span>
                  </div>
                  <div className="text-xs font-medium text-emerald-900 mt-1">
                    100% Free / 14-Day Evaluation Access
                  </div>
                </div>

                <ul className="space-y-2.5 text-xs text-slate-600">
                  <li className="flex items-center gap-2">
                    <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                    <span>Up to <strong>250 Students</strong></span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                    <span><strong>1 Campus</strong> branch</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                    <span><strong>15 Staff Accounts</strong></span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                    <span>Core fees, attendance & exams</span>
                  </li>
                </ul>
              </div>

              <div className="mt-6 pt-4 border-t border-slate-100">
                <button
                  onClick={() => openPlanModal('trial')}
                  className="w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-xs transition-colors cursor-pointer"
                >
                  Start 14-Day Free Trial
                </button>
              </div>
            </div>

            {/* TIER 1: SCHOOL PLAN */}
            <div className="rounded-3xl border border-purple-200 bg-white p-6 flex flex-col justify-between shadow-xs hover:border-purple-300 transition-all">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-8 h-8 rounded-lg bg-purple-50 text-purple-700 flex items-center justify-center">
                    <School className="w-4 h-4" />
                  </div>
                  <span className="text-xs font-bold uppercase text-purple-700 bg-[#f5eeff] px-2 py-0.5 rounded-md">
                    School Plan
                  </span>
                </div>

                <h3 className="text-xl font-extrabold text-slate-900">Primary & Matric</h3>
                <p className="text-xs text-slate-500 mt-1">
                  Complete management for growing schools.
                </p>

                <div className="mt-4 mb-5 p-3 rounded-xl bg-slate-50 border border-slate-100">
                  <div className="flex items-baseline gap-1 font-heading">
                    <span className="text-lg font-bold text-slate-500">₨</span>
                    <span className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
                      {billingCycle === 'annual' ? '21,250' : '25,000'}
                    </span>
                    <span className="text-xs font-medium text-slate-500 ml-1">/ month</span>
                  </div>
                  <div className="text-xs text-slate-500 mt-1">
                    {billingCycle === 'annual' ? 'Billed annually (Save 15%)' : 'Standard monthly billing'}
                  </div>
                </div>

                <ul className="space-y-2.5 text-xs text-slate-600">
                  <li className="flex items-center gap-2">
                    <Check className="w-3.5 h-3.5 text-purple-600 shrink-0" />
                    <span>Up to <strong>1,500 Students</strong></span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-3.5 h-3.5 text-purple-600 shrink-0" />
                    <span><strong>2 Campuses</strong></span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-3.5 h-3.5 text-purple-600 shrink-0" />
                    <span><strong>50 Staff Accounts</strong></span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-3.5 h-3.5 text-purple-600 shrink-0" />
                    <span>1Link Barcode Fee Vouchers</span>
                  </li>
                </ul>
              </div>

              <div className="mt-6 pt-4 border-t border-slate-100">
                <button
                  onClick={() => openPlanModal('school')}
                  className="w-full py-2.5 rounded-xl bg-purple-50 hover:bg-purple-100 text-purple-700 font-bold text-xs transition-colors cursor-pointer"
                >
                  Choose School Plan
                </button>
              </div>
            </div>

            {/* TIER 2: COLLEGE PLAN */}
            <div className="rounded-3xl border border-indigo-200 bg-white p-6 flex flex-col justify-between shadow-xs hover:border-indigo-300 transition-all">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-700 flex items-center justify-center">
                    <Building2 className="w-4 h-4" />
                  </div>
                  <span className="text-xs font-bold uppercase text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded-md border border-indigo-200">
                    College Plan
                  </span>
                </div>

                <h3 className="text-xl font-extrabold text-slate-900">Intermediate & Inter</h3>
                <p className="text-xs text-slate-500 mt-1">
                  Built for colleges and higher secondary institutions.
                </p>

                <div className="mt-4 mb-5 p-3 rounded-xl bg-slate-50 border border-slate-100">
                  <div className="flex items-baseline gap-1 font-heading">
                    <span className="text-lg font-bold text-slate-500">₨</span>
                    <span className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
                      {billingCycle === 'annual' ? '29,750' : '35,000'}
                    </span>
                    <span className="text-xs font-medium text-slate-500 ml-1">/ month</span>
                  </div>
                  <div className="text-xs text-slate-500 mt-1">
                    {billingCycle === 'annual' ? 'Billed annually (Save 15%)' : 'Standard monthly billing'}
                  </div>
                </div>

                <ul className="space-y-2.5 text-xs text-slate-600">
                  <li className="flex items-center gap-2">
                    <Check className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
                    <span>Up to <strong>3,000 Students</strong></span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
                    <span><strong>3 Campuses</strong></span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
                    <span><strong>100 Staff Accounts</strong></span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
                    <span>BISE Board Registry & Admissions</span>
                  </li>
                </ul>
              </div>

              <div className="mt-6 pt-4 border-t border-slate-100">
                <button
                  onClick={() => openPlanModal('college')}
                  className="w-full py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-sm shadow-indigo-600/20 transition-all cursor-pointer"
                >
                  Choose College Plan
                </button>
              </div>
            </div>

            {/* TIER 3: UNIVERSITY / CUSTOM */}
            <div className="rounded-3xl border border-purple-300 ring-2 ring-purple-500/20 bg-gradient-to-b from-white to-[#f5eeff]/30 p-6 flex flex-col justify-between shadow-xs">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-8 h-8 rounded-lg bg-purple-100 text-purple-700 flex items-center justify-center">
                    <GraduationCap className="w-4 h-4" />
                  </div>
                  <span className="text-xs font-bold uppercase text-purple-700 bg-white px-2 py-0.5 rounded-md border border-purple-200">
                    Apex Enterprise
                  </span>
                </div>

                <h3 className="text-xl font-extrabold text-slate-900">University / Hybrid</h3>
                <p className="text-xs text-slate-500 mt-1">
                  Large universities and multi-branch groups.
                </p>

                <div className="mt-4 mb-5 p-3 rounded-xl bg-white border border-purple-100 shadow-2xs">
                  <div className="flex items-baseline gap-1 font-heading">
                    <span className="text-lg font-bold text-purple-600">₨</span>
                    <span className="text-3xl sm:text-4xl font-extrabold text-purple-700 tracking-tight">
                      {billingCycle === 'annual' ? '46,750' : '55,000'}
                      <span className="text-2xl text-purple-500 font-bold">+</span>
                    </span>
                    <span className="text-xs font-medium text-slate-500 ml-1">/ month</span>
                  </div>
                  <div className="text-xs text-slate-500 mt-1">
                    {billingCycle === 'annual' ? 'Billed annually (Save 15%)' : 'Standard monthly billing'}
                  </div>
                </div>

                <ul className="space-y-2.5 text-xs text-slate-600">
                  <li className="flex items-center gap-2">
                    <Check className="w-3.5 h-3.5 text-purple-600 shrink-0" />
                    <span><strong>8,000+ Students</strong></span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-3.5 h-3.5 text-purple-600 shrink-0" />
                    <span><strong>15+ Campuses</strong></span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-3.5 h-3.5 text-purple-600 shrink-0" />
                    <span>BS Degrees, Semesters & CGPA</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-3.5 h-3.5 text-purple-600 shrink-0" />
                    <span>Dedicated VIP Support & SLA</span>
                  </li>
                </ul>
              </div>

              <div className="mt-6 pt-4 border-t border-slate-100">
                <button
                  onClick={() => openPlanModal('university')}
                  className="w-full py-2.5 rounded-xl bg-purple-700 hover:bg-purple-800 text-white font-bold text-xs shadow-sm shadow-purple-700/25 transition-all cursor-pointer"
                >
                  Activate University Plan
                </button>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* 8. INTERACTIVE FAQ SECTION */}
      <section id="faq" className="py-20 bg-white border-t border-purple-100">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="text-center mb-12">
            <span className="text-xs font-bold uppercase tracking-wider text-purple-700 bg-[#f5eeff] px-3 py-1 rounded-full border border-purple-200">
              Frequently Asked Questions
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 font-heading tracking-tight mt-3">
              Common Questions About ApexEd
            </h2>
          </div>

          <div className="space-y-3">
            {[
              {
                q: 'How does the 14-Day Free Evaluation Tier work?',
                a: 'The 14-day free evaluation is 100% free with no credit card required. You gain immediate access to our complete school management modules (admissions, fee challans, attendance, exams) for up to 250 students. When your trial ends, you can easily upgrade to our School or College plan without losing any data.'
              },
              {
                q: 'Can we manage both School and College wings under one system?',
                a: 'Yes! Our Custom Hybrid Plan allows educational groups to govern primary schools, matriculation branches, and intermediate colleges under a single central Super Admin dashboard while maintaining isolated campus records.'
              },
              {
                q: 'Does ApexEd support Pakistani 1Link, 1Bill, and JazzCash fee payments?',
                a: 'Yes, ApexEd generates automated 3-copy computerized fee challans with official 1Bill / 1Link consumer reference numbers and JazzCash corporate billing integration for real-time fee reconciliation.'
              },
              {
                q: 'Is our student and institutional data secure and backed up?',
                a: 'Yes, every institution has dedicated tenant boundaries with multi-layer encryption. Automated cloud backups are generated on a daily schedule, and administrators can export complete data backups anytime.'
              }
            ].map((faq, idx) => {
              const isOpen = expandedFaq === idx
              return (
                <div
                  key={idx}
                  className="border border-purple-100/90 rounded-2xl overflow-hidden bg-[#fcfaff] transition-all"
                >
                  <button
                    onClick={() => setExpandedFaq(isOpen ? -1 : idx)}
                    className="w-full p-4 sm:p-5 text-left flex items-center justify-between gap-4 font-bold text-xs sm:text-sm text-slate-900 cursor-pointer hover:bg-[#f5eeff]/50 transition-colors"
                  >
                    <span>{faq.q}</span>
                    <ChevronDown className={`w-4 h-4 text-purple-600 shrink-0 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
                  </button>
                  {isOpen && (
                    <div className="px-5 pb-5 text-xs sm:text-sm text-slate-600 leading-relaxed border-t border-purple-100/60 pt-3">
                      {faq.a}
                    </div>
                  )}
                </div>
              )
            })}
          </div>

        </div>
      </section>

      {/* 9 & 10. BOTTOM WRAPPER: PRE-FOOTER CTA + DARK FOOTER WITH POINTER-STICKING STICKER */}
      <div ref={bottomWrapperRef} className="relative overflow-visible">

        {/* 9. BOTTOM CTA BANNER */}
        <section
          ref={ctaSectionRef}
          className="py-16 sm:py-20 bg-gradient-to-r from-purple-700 via-purple-600 to-indigo-700 text-white relative overflow-visible"
        >
          <div className="max-w-5xl mx-auto px-4 text-center relative z-10">
            <span className="text-[11px] font-extrabold uppercase tracking-widest bg-white/15 px-3 py-1 rounded-full text-purple-100 inline-block mb-4">
              Transform Your Campus Today
            </span>
            <h2 className="text-2xl sm:text-4xl font-extrabold font-heading tracking-tight">
              Ready to Streamline Your Educational Institution?
            </h2>
            <p className="mt-3 text-xs sm:text-sm text-purple-100 max-w-xl mx-auto">
              Join hundreds of forward-thinking schools, colleges, and university faculties. Experience modern academic management in minutes.
            </p>
            <div className="mt-6 flex flex-col sm:flex-row items-center justify-center gap-3">
              <button
                onClick={() => setIsTrialModalOpen(true)}
                className="w-full sm:w-auto px-6 py-3 rounded-xl bg-white text-purple-700 hover:bg-purple-50 font-bold text-xs sm:text-sm shadow-md transition-all hover:scale-105 cursor-pointer flex items-center justify-center gap-2"
              >
                <Sparkles className="w-4 h-4 text-purple-600" />
                <span>Launch 14-Day Free Trial (₨ 0)</span>
              </button>
              <button
                onClick={() => onNavigateToLogin('signin')}
                className="w-full sm:w-auto px-5 py-3 rounded-xl bg-purple-800/80 hover:bg-purple-800 text-white border border-purple-400/40 font-semibold text-xs sm:text-sm transition-all cursor-pointer flex items-center justify-center gap-2"
              >
                <Lock className="w-3.5 h-3.5" />
                <span>Sign In to Existing Portal</span>
              </button>
            </div>

            {/* Mobile Embedded Sticker (< sm) */}
            <div className="sm:hidden mt-8 flex justify-center">
              <button
                type="button"
                onClick={() => setIsTrialModalOpen(true)}
                className="group relative w-32 h-32 flex items-center justify-center cursor-pointer select-none active:scale-95"
                title="Claim 14-Day Free Evaluation (₨ 0)"
              >
                <svg
                  viewBox="0 0 120 120"
                  className="w-full h-full drop-shadow-[0_12px_24px_rgba(88,28,135,0.7)] animate-[spin_22s_linear_infinite]"
                >
                  <defs>
                    <linearGradient id="mobStickerGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="#9333EA" />
                      <stop offset="50%" stopColor="#7E22CE" />
                      <stop offset="100%" stopColor="#6B21A8" />
                    </linearGradient>
                  </defs>
                  <polygon
                    points={STARBURST_POINTS}
                    fill="url(#mobStickerGrad)"
                    stroke="rgba(255,255,255,0.4)"
                    strokeWidth="1.2"
                  />
                  <circle cx="60" cy="60" r="42" fill="none" stroke="rgba(255,255,255,0.25)" strokeWidth="1" strokeDasharray="3 3" />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center text-center text-white pointer-events-none px-2">
                  <span className="text-[10px] font-black tracking-widest uppercase font-heading text-purple-200">
                    GET FREE
                  </span>
                  <span className="text-base font-black tracking-tight uppercase font-heading text-white">
                    TRIAL
                  </span>
                  <span className="text-[8px] font-bold text-emerald-300 mt-1 uppercase bg-purple-950/80 px-2 py-0.5 rounded-full border border-purple-400/40">
                    ₨ 0 · 14-DAYS
                  </span>
                </div>
              </button>
            </div>
          </div>
        </section>

        {/* 10. CLEAN MINIMAL FOOTER (INTERACTIVE TRIGGER ZONE FOR POINTER STICKING) */}
        <footer
          ref={footerRef}
          onMouseMove={handleFooterMouseMove}
          onMouseEnter={handleFooterMouseMove}
          onMouseLeave={handleFooterMouseLeave}
          onClick={handleFooterClick}
          className="bg-slate-900 text-slate-400 text-xs py-12 border-t border-slate-800 relative cursor-default"
        >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 pb-10 border-b border-slate-800">
            
            {/* Col 1: Brand */}
            <div>
              <div 
                onClick={(e) => scrollToSection(e, 'hero')}
                className="flex items-center gap-2.5 text-white font-heading font-extrabold text-base mb-3 cursor-pointer"
              >
                <div className="w-7 h-7 rounded-lg bg-purple-600 flex items-center justify-center text-white">
                  <GraduationCap className="w-4 h-4" />
                </div>
                <span>ApexEd ERP</span>
              </div>
              <p className="text-slate-400 text-xs leading-relaxed max-w-xs">
                Unified multi-campus academic operating system engineered for Pakistani schools, colleges, and universities.
              </p>
            </div>

            {/* Col 2: Wings */}
            <div>
              <span className="text-slate-200 font-bold uppercase tracking-wider text-[11px] block mb-3">
                Educational Wings
              </span>
              <ul className="space-y-2">
                <li><button onClick={(e) => { setActiveTab('school'); scrollToSection(e, 'wings'); }} className="hover:text-purple-400 transition-colors cursor-pointer">School Wing (Primary & Matric)</button></li>
                <li><button onClick={(e) => { setActiveTab('college'); scrollToSection(e, 'wings'); }} className="hover:text-purple-400 transition-colors cursor-pointer">College Wing (Intermediate & F.Sc)</button></li>
                <li><button onClick={(e) => { setActiveTab('university'); scrollToSection(e, 'wings'); }} className="hover:text-purple-400 transition-colors cursor-pointer">University Wing (BS & CGPA)</button></li>
                <li><button onClick={(e) => { setActiveTab('custom'); scrollToSection(e, 'wings'); }} className="hover:text-purple-400 transition-colors cursor-pointer">Multi-Campus Conglomerates</button></li>
              </ul>
            </div>

            {/* Col 3: Modules */}
            <div>
              <span className="text-slate-200 font-bold uppercase tracking-wider text-[11px] block mb-3">
                Core Operations
              </span>
              <ul className="space-y-2">
                <li><button onClick={(e) => scrollToSection(e, 'features')} className="hover:text-purple-400 transition-colors cursor-pointer">1Link / 1Bill Voucher Engine</button></li>
                <li><button onClick={(e) => scrollToSection(e, 'features')} className="hover:text-purple-400 transition-colors cursor-pointer">Admit Card & Exam Controller</button></li>
                <li><button onClick={(e) => scrollToSection(e, 'features')} className="hover:text-purple-400 transition-colors cursor-pointer">Digital Attendance & SMS Gateway</button></li>
                <li><button onClick={(e) => scrollToSection(e, 'pricing')} className="hover:text-purple-400 transition-colors cursor-pointer">Financial MRR & Fee Ledgers</button></li>
              </ul>
            </div>

            {/* Col 4: Quick Portals */}
            <div>
              <span className="text-slate-200 font-bold uppercase tracking-wider text-[11px] block mb-3">
                Staff & Admin Portals
              </span>
              <ul className="space-y-2">
                <li>
                  <button onClick={() => onNavigateToLogin('superadmin')} className="text-purple-400 hover:text-purple-300 font-semibold flex items-center gap-1 cursor-pointer">
                    <Lock className="w-3 h-3" />
                    <span>Super Admin Sign In</span>
                  </button>
                </li>
                <li>
                  <button onClick={() => onNavigateToLogin('institute')} className="text-purple-400 hover:text-purple-300 font-semibold flex items-center gap-1 cursor-pointer">
                    <Building2 className="w-3 h-3" />
                    <span>Campus Admin Sign In</span>
                  </button>
                </li>
                <li>
                  <button onClick={() => setIsTrialModalOpen(true)} className="text-emerald-400 hover:text-emerald-300 font-semibold flex items-center gap-1 cursor-pointer">
                    <Sparkles className="w-3 h-3" />
                    <span>14-Day Free Evaluation Access</span>
                  </button>
                </li>
              </ul>
            </div>

          </div>

          <div className="pt-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-slate-500 text-[11px]">
            <div>
              © 2026 ApexEd Enterprise Platform. All rights reserved.
            </div>
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-500" />
              <span>Enterprise Grade Security & Multi-Tenant Data Isolation</span>
            </div>
          </div>
        </div>
      </footer>

      {/* Desktop / Tablet Pointer-Sticking Action Burst Sticker (Compact & Senior UI Polish) */}
      <div
        onClick={() => setIsTrialModalOpen(true)}
        style={{
          transform: `translate3d(${stickerPos.x}px, ${stickerPos.y}px, 0) translate(-50%, -50%) scale(${isPointerSticking ? 1.05 : 1})`,
          transition: isPointerSticking
            ? 'transform 0.08s ease-out, scale 0.2s ease-out'
            : 'transform 0.6s cubic-bezier(0.16, 1, 0.3, 1), scale 0.35s ease-out'
        }}
        className={`hidden sm:block absolute left-0 top-0 z-30 select-none ${
          isPointerSticking ? 'pointer-events-none' : 'pointer-events-auto cursor-pointer'
        }`}
        title="Click to Activate 14-Day Free Evaluation (₨ 0)"
        aria-label="Start 14-Day Free Trial"
      >
        <div className="relative w-28 h-28 sm:w-30 sm:h-30 md:w-32 md:h-32 flex items-center justify-center group cursor-pointer transition-transform duration-200 hover:scale-105 active:scale-95">
          {/* Ambient Purple Radial Glow */}
          <div
            className={`absolute inset-1 rounded-full blur-lg transition-all duration-300 pointer-events-none ${
              isPointerSticking
                ? 'bg-purple-500/70 scale-110'
                : 'bg-purple-600/40 group-hover:bg-purple-500/70'
            }`}
          />

          {/* Rotating Serrated Starburst Badge (Refined Scalloped Seal Geometry & Gloss Overlay) */}
          <svg
            viewBox="0 0 120 120"
            className="w-full h-full drop-shadow-[0_12px_28px_rgba(126,34,206,0.65)] animate-[spin_22s_linear_infinite]"
          >
            <defs>
              <linearGradient id="stickerGrad" x1="15%" y1="10%" x2="85%" y2="90%">
                <stop offset="0%" stopColor="#A855F7" />
                <stop offset="35%" stopColor="#9333EA" />
                <stop offset="70%" stopColor="#7E22CE" />
                <stop offset="100%" stopColor="#581C87" />
              </linearGradient>
              <radialGradient id="stickerGloss" cx="35%" cy="30%" r="65%">
                <stop offset="0%" stopColor="#ffffff" stopOpacity="0.32" />
                <stop offset="45%" stopColor="#ffffff" stopOpacity="0.08" />
                <stop offset="100%" stopColor="#ffffff" stopOpacity="0" />
              </radialGradient>
            </defs>

            {/* Outer Scalloped Starburst Teeth */}
            <polygon
              points={STARBURST_POINTS}
              fill="url(#stickerGrad)"
              stroke="rgba(255, 255, 255, 0.5)"
              strokeWidth="1.2"
              strokeLinejoin="round"
            />

            {/* Inner Gloss Dome Reflection */}
            <circle
              cx="60"
              cy="60"
              r="47"
              fill="url(#stickerGloss)"
            />

            {/* Inner Stamp Dashed Ring */}
            <circle
              cx="60"
              cy="60"
              r="40"
              fill="none"
              stroke="rgba(255, 255, 255, 0.35)"
              strokeWidth="1.1"
              strokeDasharray="3 2.5"
            />
          </svg>

          {/* Center Bold Typography (Crisp, High-Contrast & Beautiful Hierarchy) */}
          <div className="absolute inset-0 flex flex-col items-center justify-center text-center text-white pointer-events-none px-2 select-none">
            <span className="text-[9.5px] sm:text-[10px] font-black tracking-widest uppercase font-heading leading-tight drop-shadow-sm text-purple-200">
              GET FREE
            </span>
            <span className="text-[15px] sm:text-base font-black tracking-tight uppercase font-heading leading-none text-white drop-shadow-md mt-0.5">
              TRIAL
            </span>
            <div className="flex items-center gap-1 mt-1 bg-purple-950/70 px-2 py-0.5 rounded-full border border-purple-300/40 backdrop-blur-md shadow-xs">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse shadow-[0_0_6px_#34d399]" />
              <span className="text-[8px] sm:text-[8.5px] font-extrabold text-emerald-300 tracking-wider">₨ 0 EVALUATION</span>
            </div>
          </div>

          {/* Pinned Live Beacon Indicator (Directly Anchored on Badge Rim) */}
          <span className="absolute top-1 right-2 sm:top-1.5 sm:right-2.5 flex h-3 w-3" title="Live Free Evaluation Available">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-80" />
            <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500 border border-white shadow-xs" />
          </span>
        </div>
      </div>

    </div>{/* end bottomWrapperRef */}

      {/* 11. START 14-DAY FREE TRIAL / PLAN REGISTRATION MODAL */}
      {isTrialModalOpen && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center p-2.5 sm:p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200"
          onClick={() => setIsTrialModalOpen(false)}
        >
          <div 
            className="bg-white text-slate-800 rounded-3xl max-w-4xl w-full shadow-2xl border border-slate-200/90 relative max-h-[94vh] flex flex-col overflow-hidden animate-in zoom-in-95 duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            {/* 1. TOP STEPPER (Select Package -> Enter Details) */}
            <div className="flex items-center justify-center gap-3 sm:gap-6 py-3.5 px-6 border-b border-slate-100 bg-white shrink-0 select-none">
              <button
                type="button"
                onClick={() => setModalStep(1)}
                className="flex items-center gap-2 cursor-pointer transition-colors group"
              >
                <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                  modalStep === 1 
                    ? 'bg-purple-600 text-white ring-4 ring-purple-100 shadow-xs' 
                    : 'bg-emerald-100 text-emerald-700 font-extrabold'
                }`}>
                  {modalStep === 1 ? '1' : '✓'}
                </span>
                <span className={`text-xs ${
                  modalStep === 1 ? 'text-slate-900 font-bold' : 'text-emerald-700 font-semibold group-hover:text-emerald-800'
                }`}>
                  Select Package
                </span>
              </button>

              <div className="h-0.5 w-10 sm:w-20 bg-slate-200"></div>

              <button
                type="button"
                onClick={() => setModalStep(2)}
                className="flex items-center gap-2 cursor-pointer transition-colors"
              >
                <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                  modalStep === 2 
                    ? 'bg-purple-600 text-white ring-4 ring-purple-100 shadow-xs' 
                    : 'bg-slate-100 text-slate-500 border border-slate-200'
                }`}>
                  2
                </span>
                <span className={`text-xs ${
                  modalStep === 2 ? 'text-slate-900 font-bold' : 'text-slate-500 font-semibold'
                }`}>
                  Enter Details
                </span>
              </button>
            </div>

            {/* 2. TOP BAR (Change Plan, Selected Subscription, 14 Days testing access badge) */}
            <div className="flex flex-wrap items-center justify-between gap-3 px-5 sm:px-6 py-3.5 border-b border-slate-100 bg-[#f8fafc] shrink-0">
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setModalStep(modalStep === 1 ? 2 : 1)}
                  className="px-3 py-1.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-xs font-semibold text-slate-700 transition-colors cursor-pointer flex items-center gap-1.5 shadow-2xs"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>{modalStep === 1 ? 'Continue to Details' : 'Change Plan'}</span>
                </button>

                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                    Selected Subscription
                  </span>
                  <span className="text-sm font-bold text-slate-900 flex items-center gap-2">
                    <span>{(PLAN_CONFIGS[activeModalPlan] || PLAN_CONFIGS.trial).planName}</span>
                    <span className="text-purple-600 font-mono text-xs font-bold">
                      ({(PLAN_CONFIGS[activeModalPlan] || PLAN_CONFIGS.trial).priceDisplay})
                    </span>
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200/80">
                  <Clock className="w-3.5 h-3.5 text-emerald-600" />
                  <span>14 Days full testing access</span>
                </span>

                <button
                  onClick={() => setIsTrialModalOpen(false)}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 transition-colors cursor-pointer"
                  title="Close dialog"
                  aria-label="Close dialog"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* 3. SCROLLABLE CONTAINER */}
            <div className="overflow-y-auto p-5 sm:p-7 modal-scrollbar flex-1 space-y-5">
              {modalStep === 1 ? (
                <div className="space-y-4">
                  <div className="text-center max-w-md mx-auto mb-2">
                    <h3 className="text-lg sm:text-xl font-bold text-slate-900 font-heading">
                      Select Your Subscription Package
                    </h3>
                    <p className="text-xs text-slate-500 mt-1">
                      Choose an institutional plan to proceed to credential setup and Super Admin verification.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
                    {Object.keys(PLAN_CONFIGS).map((planKey) => {
                      const p = PLAN_CONFIGS[planKey]
                      const isSelected = activeModalPlan === planKey
                      const PlanCardIcon = planKey === 'school' ? School : planKey === 'college' ? Building2 : planKey === 'university' ? GraduationCap : Sparkles

                      return (
                        <div
                          key={p.id}
                          onClick={() => {
                            setActiveModalPlan(planKey)
                            if (planKey === 'school') setTrialForm(prev => ({ ...prev, wing: 'school' }))
                            else if (planKey === 'college') setTrialForm(prev => ({ ...prev, wing: 'college' }))
                            else if (planKey === 'university') setTrialForm(prev => ({ ...prev, wing: 'university' }))
                            else setTrialForm(prev => ({ ...prev, wing: 'school' }))
                            setModalStep(2)
                          }}
                          className={`p-4 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between ${
                            isSelected
                              ? 'bg-purple-50/70 border-2 border-purple-600 ring-2 ring-purple-600/10 shadow-md shadow-purple-600/5'
                              : 'bg-white border-slate-200 hover:border-purple-200 hover:bg-slate-50/70 hover:shadow-sm'
                          }`}
                        >
                          <div>
                            <div className="flex items-center justify-between mb-3">
                              <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${p.iconBg}`}>
                                <PlanCardIcon className="w-5 h-5" />
                              </div>
                              {isSelected && (
                                <span className="text-[10px] font-bold text-purple-700 bg-purple-100 px-2 py-0.5 rounded-full border border-purple-200">
                                  Active
                                </span>
                              )}
                            </div>

                            <h4 className="text-sm font-bold text-slate-900">{p.planName}</h4>
                            <div className="mt-1 font-mono text-base font-extrabold text-purple-600">
                              {p.priceDisplay}
                            </div>
                            <p className="text-[11px] text-slate-500 mt-1 leading-snug">
                              {p.priceSub}
                            </p>
                          </div>

                          <button
                            type="button"
                            className={`w-full mt-4 py-2 px-3 rounded-xl font-bold text-xs transition-colors flex items-center justify-center gap-1.5 cursor-pointer ${
                              isSelected
                                ? 'bg-purple-600 hover:bg-purple-700 text-white shadow-xs'
                                : 'bg-slate-100 text-slate-700 hover:bg-purple-50 hover:text-purple-700'
                            }`}
                          >
                            <span>Select Package</span>
                            <ArrowRight className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      )
                    })}
                  </div>
                </div>
              ) : (
                <form onSubmit={handleSubmitTrial} className="space-y-4">
                  {/* Header: Enter Your Educational Institute & Admin Credentials */}
                  <div className="flex flex-wrap items-center justify-between gap-2 pb-2.5 border-b border-slate-100">
                    <div className="flex items-center gap-2.5">
                      <span className="w-6 h-6 rounded-full bg-purple-600 text-white flex items-center justify-center text-xs font-bold shrink-0 shadow-xs shadow-purple-600/30">
                        2
                      </span>
                      <h3 className="text-base sm:text-lg font-bold text-slate-900 font-heading">
                        Enter Your Educational Institute & Admin Credentials
                      </h3>
                    </div>
                    <span className="text-[11px] text-slate-500">
                      Fields marked with <span className="text-rose-500 font-bold">*</span> are mandatory
                    </span>
                  </div>

                  {/* Guarantee Box */}
                  <div className="p-3.5 rounded-2xl bg-emerald-50/80 border border-emerald-200 text-emerald-900">
                    <div className="flex items-center gap-2 text-xs font-bold text-emerald-800">
                      <Sparkles className="w-4 h-4 text-emerald-600 shrink-0" />
                      <span>14-Day Free Evaluation Guarantee</span>
                    </div>
                    <p className="text-[11.5px] sm:text-xs text-emerald-700 mt-1 leading-relaxed">
                      No credit card or payment TRX required upfront. You will receive 14 days of full feature access to test computerized fee challans, live attendance, multi-wing telemetry, and academic grading.
                    </p>
                  </div>

                  {/* Group 1: INSTITUTION & CAMPUS PROFILE */}
                  <div className="space-y-2.5 pt-1">
                    <span className="text-xs font-bold uppercase tracking-wider text-purple-700 flex items-center gap-1.5">
                      <Building2 className="w-3.5 h-3.5 text-purple-600" />
                      <span>Institution & Campus Profile</span>
                    </span>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                      {/* Institution Name */}
                      <div>
                        <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-700 mb-1">
                          Institution / Campus Name <span className="text-rose-500">*</span>
                        </label>
                        <div className="relative">
                          <Building2 className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                          <input
                            type="text"
                            required
                            value={trialForm.instituteName}
                            onChange={(e) => setTrialForm({ ...trialForm, instituteName: e.target.value })}
                            placeholder="e.g. Apex High School & College / The Scholars Academy"
                            className="w-full pl-10 pr-3.5 py-2.5 text-xs sm:text-sm bg-[#f8fafc] border border-slate-200 text-slate-900 placeholder-slate-400 rounded-xl focus:outline-none focus:bg-white focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 transition-all"
                          />
                        </div>
                      </div>

                      {/* Institution Type / Wing */}
                      <div>
                        <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-700 mb-1">
                          Institution Type / Educational Wing <span className="text-rose-500">*</span>
                        </label>
                        <div className="relative">
                          <School className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                          <select
                            value={trialForm.wing}
                            onChange={(e) => setTrialForm({ ...trialForm, wing: e.target.value })}
                            className="w-full pl-10 pr-8 py-2.5 text-xs sm:text-sm bg-[#f8fafc] border border-slate-200 text-slate-900 rounded-xl focus:outline-none focus:bg-white focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 transition-all cursor-pointer font-medium appearance-none"
                          >
                            <option value="school">School Wing (Primary to Matric / O-Levels)</option>
                            <option value="college">College Wing (F.Sc, ICS, FA, I.Com)</option>
                            <option value="university">University Wing (BS Degrees & Semesters)</option>
                            <option value="multi-campus">Multi-Campus / Hybrid Educational Network</option>
                          </select>
                          <ChevronDown className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                        </div>
                      </div>

                      {/* City / District */}
                      <div>
                        <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-700 mb-1">
                          City / District (Optional)
                        </label>
                        <div className="relative">
                          <MapPin className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                          <input
                            type="text"
                            value={trialForm.city}
                            onChange={(e) => setTrialForm({ ...trialForm, city: e.target.value })}
                            placeholder="e.g. Lahore, Karachi, Islamabad, Rawalpindi..."
                            className="w-full pl-10 pr-3.5 py-2.5 text-xs sm:text-sm bg-[#f8fafc] border border-slate-200 text-slate-900 placeholder-slate-400 rounded-xl focus:outline-none focus:bg-white focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 transition-all"
                          />
                        </div>
                      </div>

                      {/* Principal / Administrator Full Name */}
                      <div>
                        <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-700 mb-1">
                          Principal / Administrator Full Name <span className="text-rose-500">*</span>
                        </label>
                        <div className="relative">
                          <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                          <input
                            type="text"
                            required
                            value={trialForm.adminName}
                            onChange={(e) => setTrialForm({ ...trialForm, adminName: e.target.value })}
                            placeholder="e.g. Prof. Tariq Mahmood"
                            className="w-full pl-10 pr-3.5 py-2.5 text-xs sm:text-sm bg-[#f8fafc] border border-slate-200 text-slate-900 placeholder-slate-400 rounded-xl focus:outline-none focus:bg-white focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 transition-all"
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Group 2: ACCOUNT ACCESS & SECURITY */}
                  <div className="space-y-2.5 pt-1">
                    <span className="text-xs font-bold uppercase tracking-wider text-purple-700 flex items-center gap-1.5">
                      <Lock className="w-3.5 h-3.5 text-purple-600" />
                      <span>Account Access & Security</span>
                    </span>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                      {/* Email Address */}
                      <div>
                        <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-700 mb-1">
                          Email Address <span className="text-rose-500">*</span>
                        </label>
                        <div className="relative">
                          <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                          <input
                            type="email"
                            required
                            value={trialForm.email}
                            onChange={(e) => setTrialForm({ ...trialForm, email: e.target.value })}
                            placeholder="e.g. principal@institution.edu.pk"
                            className="w-full pl-10 pr-3.5 py-2.5 text-xs sm:text-sm bg-[#f8fafc] border border-slate-200 text-slate-900 placeholder-slate-400 rounded-xl focus:outline-none focus:bg-white focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 transition-all"
                          />
                        </div>
                      </div>

                      {/* Mobile / WhatsApp */}
                      <div>
                        <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-700 mb-1">
                          Mobile / WhatsApp Number <span className="text-rose-500">*</span>
                        </label>
                        <div className="relative">
                          <Phone className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                          <input
                            type="text"
                            required
                            value={trialForm.phone}
                            onChange={(e) => setTrialForm({ ...trialForm, phone: e.target.value })}
                            placeholder="0300-1234567"
                            className="w-full pl-10 pr-3.5 py-2.5 text-xs sm:text-sm bg-[#f8fafc] border border-slate-200 text-slate-900 placeholder-slate-400 rounded-xl focus:outline-none focus:bg-white focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 font-mono transition-all"
                          />
                        </div>
                      </div>

                      {/* Create Admin Password */}
                      <div>
                        <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-700 mb-1">
                          Create Admin Password <span className="text-rose-500">*</span>
                        </label>
                        <div className="relative">
                          <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                          <input
                            type={showAdminPassword ? "text" : "password"}
                            required
                            value={trialForm.adminPassword}
                            onChange={(e) => setTrialForm({ ...trialForm, adminPassword: e.target.value })}
                            placeholder="••••••••••••"
                            className="w-full pl-10 pr-10 py-2.5 text-xs sm:text-sm bg-[#f8fafc] border border-slate-200 text-slate-900 placeholder-slate-400 rounded-xl focus:outline-none focus:bg-white focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 font-mono transition-all"
                          />
                          <button
                            type="button"
                            onClick={() => setShowAdminPassword(!showAdminPassword)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors cursor-pointer"
                            title="Toggle password visibility"
                          >
                            {showAdminPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                          </button>
                        </div>
                      </div>

                      {/* Confirm Admin Password */}
                      <div>
                        <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-700 mb-1 flex items-center justify-between">
                          <span>Confirm Admin Password <span className="text-rose-500">*</span></span>
                          {trialForm.confirmPassword && (
                            <span className={`text-[10px] font-bold ${
                              trialForm.adminPassword === trialForm.confirmPassword ? 'text-emerald-600' : 'text-rose-600'
                            }`}>
                              {trialForm.adminPassword === trialForm.confirmPassword ? '✓ Passwords match' : '✕ Passwords do not match'}
                            </span>
                          )}
                        </label>
                        <div className="relative">
                          <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                          <input
                            type={showConfirmPassword ? "text" : "password"}
                            required
                            value={trialForm.confirmPassword}
                            onChange={(e) => setTrialForm({ ...trialForm, confirmPassword: e.target.value })}
                            placeholder="••••••••••••"
                            className={`w-full pl-10 pr-10 py-2.5 text-xs sm:text-sm bg-[#f8fafc] border rounded-xl focus:outline-none font-mono transition-all ${
                              trialForm.confirmPassword && trialForm.adminPassword !== trialForm.confirmPassword
                                ? 'border-rose-300 text-slate-900 focus:border-rose-500 focus:ring-2 focus:ring-rose-500/20'
                                : 'border-slate-200 text-slate-900 focus:bg-white focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20'
                            }`}
                          />
                          <button
                            type="button"
                            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors cursor-pointer"
                            title="Toggle password visibility"
                          >
                            {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Plan Active Status Banner */}
                  <div className="p-3.5 rounded-2xl bg-[#f5eeff]/70 border border-purple-200/80 flex items-start gap-3">
                    <div className="w-8 h-8 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center shrink-0 mt-0.5 shadow-2xs">
                      <Sparkles className="w-4 h-4" />
                    </div>
                    <div className="flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="text-xs font-bold text-slate-900">
                          {(PLAN_CONFIGS[activeModalPlan] || PLAN_CONFIGS.trial).planName} Active (100% Free / Verified)
                        </span>
                        <span className="text-[10px] font-black tracking-wider uppercase text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-md border border-emerald-200">
                          ZERO UPFRONT PAYMENT
                        </span>
                      </div>
                      <p className="text-[11.5px] text-slate-600 mt-1 leading-relaxed">
                        No payment, credit card, or Transaction ID is required for your trial. You will receive immediate full access to all campus features upon Super Admin review.
                      </p>
                    </div>
                  </div>

                  {/* Group 3: ADDITIONAL INSTRUCTIONS OR CUSTOM CAMPUS REQUIREMENTS */}
                  <div>
                    <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-700 mb-1">
                      Additional Instructions or Custom Campus Requirements (Optional)
                    </label>
                    <textarea
                      rows="3"
                      value={trialForm.notes}
                      onChange={(e) => setTrialForm({ ...trialForm, notes: e.target.value })}
                      placeholder="e.g. Multi-campus branch sync, biometric machine integration, custom fee voucher format, or specific BISE / HEC grading guidelines..."
                      className="w-full px-3.5 py-2.5 text-xs sm:text-sm bg-[#f8fafc] border border-slate-200 text-slate-900 placeholder-slate-400 rounded-xl focus:outline-none focus:bg-white focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 transition-all resize-y"
                    />
                  </div>

                  {/* Terms Agreement Checkbox */}
                  <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80 flex items-start gap-3">
                    <input
                      type="checkbox"
                      id="termsAgreement"
                      checked={trialForm.agreedToTerms}
                      onChange={(e) => setTrialForm({ ...trialForm, agreedToTerms: e.target.checked })}
                      className="mt-1 w-4 h-4 rounded text-purple-600 focus:ring-purple-500 border-slate-300 bg-white cursor-pointer accent-purple-600"
                    />
                    <label htmlFor="termsAgreement" className="text-xs cursor-pointer select-none">
                      <span className="font-bold text-slate-900 block">
                        I agree to the Terms of Service & Institutional Usage Agreement.
                      </span>
                      <span className="text-[11px] text-slate-500 block mt-0.5 leading-relaxed">
                        I verify that all submitted educational institution information is accurate and understand my account will be activated upon Super Admin approval.
                      </span>
                    </label>
                  </div>

                  {/* Bottom Buttons */}
                  <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
                    <button
                      type="button"
                      onClick={() => setModalStep(1)}
                      className="w-full sm:w-auto px-5 py-3 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 font-semibold text-xs sm:text-sm transition-colors cursor-pointer shadow-2xs"
                    >
                      Back to Plans
                    </button>

                    <button
                      type="submit"
                      disabled={isSubmittingTrial}
                      className="w-full sm:flex-1 py-3 px-6 rounded-xl bg-gradient-to-r from-purple-600 via-purple-700 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold text-xs sm:text-sm shadow-md shadow-purple-600/20 transition-all cursor-pointer flex items-center justify-center gap-2 disabled:opacity-50"
                    >
                      {isSubmittingTrial ? (
                        <div className="flex items-center gap-2">
                          <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                          <span>Submitting Request to Super Admin...</span>
                        </div>
                      ) : (
                        <>
                          <span>Submit Institution Registration Request</span>
                          <ArrowRight className="w-4 h-4" />
                        </>
                      )}
                    </button>
                  </div>

                  <div className="text-center text-[10.5px] text-slate-400 pt-1 leading-relaxed">
                    Your request is securely forwarded to Super Admin headquarters. Upon review & approval, official portal Login ID & Password will be confirmed and activated.
                  </div>
                </form>
              )}
            </div>
          </div>
        </div>
      )}

      {/* 11.B ANIMATED GREEN SUCCESS MODAL (Super Admin Approval Submission Confirmation) */}
      {isSuccessModalOpen && (
        <div 
          className="fixed inset-0 z-[60] flex items-center justify-center p-3.5 sm:p-4 bg-slate-900/65 backdrop-blur-sm animate-in fade-in duration-300"
          onClick={() => setIsSuccessModalOpen(false)}
        >
          <div 
            className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 text-center shadow-2xl border border-emerald-100 relative overflow-hidden animate-in zoom-in-95 duration-300 flex flex-col items-center"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Top decorative emerald gradient bar */}
            <div className="absolute top-0 inset-x-0 h-1.5 bg-gradient-to-r from-emerald-400 via-teal-500 to-emerald-600"></div>

            {/* Close Cross Button */}
            <button
              onClick={() => setIsSuccessModalOpen(false)}
              className="absolute top-4 right-4 p-1.5 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
              title="Close dialog"
              aria-label="Close dialog"
            >
              <X className="w-5 h-5" />
            </button>

            {/* GREEN ANIMATED TICK / CHECKMARK BADGE */}
            <div className="relative my-3 flex items-center justify-center">
              {/* Outer Ripple / Ping Ring Animation */}
              <div className="absolute w-24 h-24 sm:w-28 sm:h-28 rounded-full bg-emerald-400/25 animate-ping"></div>
              <div className="absolute w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-emerald-100 animate-pulse"></div>

              {/* Main Green Circular Badge */}
              <div className="relative w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-gradient-to-tr from-emerald-600 to-teal-500 flex items-center justify-center shadow-xl shadow-emerald-600/35 border-4 border-white">
                <Check className="w-10 h-10 sm:w-12 sm:h-12 text-white stroke-[3.5] animate-in zoom-in-50 duration-500" />
              </div>
            </div>

            {/* Status Pill */}
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-50 text-amber-800 border border-amber-200/80 mb-2 mt-1">
              <Clock className="w-3.5 h-3.5 text-amber-600 animate-spin" style={{ animationDuration: '6s' }} />
              <span>Submitted · Awaiting Super Admin Approval</span>
            </div>

            {/* Main Headline */}
            <h3 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight font-heading">
              Request Submitted Successfully!
            </h3>

            {/* Narrative Explanation */}
            <p className="text-xs sm:text-sm text-slate-600 mt-2 leading-relaxed max-w-md">
              Your evaluation request for <span className="font-bold text-slate-900">{submittedSuccessData?.instituteName || 'your institution'}</span> has been forwarded to Super Admin headquarters for verification.
            </p>

            {/* Credentials Delivery Notice */}
            <div className="w-full bg-emerald-50/70 border border-emerald-200/80 rounded-2xl p-3.5 sm:p-4 my-4 text-left">
              <div className="flex items-start gap-2.5">
                <div className="w-7 h-7 rounded-xl bg-emerald-600 text-white flex items-center justify-center shrink-0 shadow-xs mt-0.5">
                  <ShieldCheck className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-xs font-bold text-emerald-950">
                    How will you receive your credentials?
                  </div>
                  <div className="text-[11px] sm:text-xs text-emerald-900/85 mt-1 leading-relaxed">
                    Once the Super Administrator reviews and approves your request, your official <strong className="text-emerald-950">Portal Login ID</strong> and <strong className="text-emerald-950">Password</strong> will be dispatched to your registered email and WhatsApp/SMS.
                  </div>
                </div>
              </div>
            </div>

            {/* Application Summary Box */}
            <div className="w-full bg-slate-50 border border-slate-200/80 rounded-2xl p-3.5 sm:p-4 text-left text-xs space-y-2">
              <div className="flex items-center justify-between pb-2 border-b border-slate-200 text-slate-500 font-semibold text-[11px]">
                <span>APPLICATION SUMMARY</span>
                <span className="font-mono text-purple-700 bg-purple-100/70 px-2 py-0.5 rounded font-bold">
                  {submittedSuccessData?.requestId || 'APPR-PENDING'}
                </span>
              </div>
              
              <div className="flex justify-between items-center text-slate-700">
                <span className="text-slate-500">Institution:</span>
                <span className="font-bold text-slate-900 text-right">{submittedSuccessData?.instituteName}</span>
              </div>

              <div className="flex justify-between items-center text-slate-700">
                <span className="text-slate-500">Contact Person:</span>
                <span className="font-semibold text-slate-900">{submittedSuccessData?.adminName}</span>
              </div>

              <div className="flex justify-between items-center text-slate-700">
                <span className="text-slate-500">Selected Plan:</span>
                <span className="font-bold text-purple-700">{submittedSuccessData?.planTier}</span>
              </div>

              <div className="flex justify-between items-center text-slate-700">
                <span className="text-slate-500">Official Email:</span>
                <span className="font-mono font-medium text-slate-900">{submittedSuccessData?.email}</span>
              </div>

              <div className="flex justify-between items-center text-slate-700">
                <span className="text-slate-500">Mobile / WhatsApp:</span>
                <span className="font-mono font-medium text-slate-900">{submittedSuccessData?.phone}</span>
              </div>

              <div className="flex justify-between items-center pt-1 border-t border-slate-200 text-slate-700">
                <span className="text-slate-500">Expected Approval:</span>
                <span className="font-bold text-emerald-700 flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5 text-emerald-600" />
                  Typically 15 – 30 Minutes
                </span>
              </div>
            </div>

            {/* Back to Home / Got it Button */}
            <div className="w-full mt-3">
              <button
                type="button"
                onClick={() => setIsSuccessModalOpen(false)}
                className="w-full py-3 sm:py-3.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs sm:text-sm shadow-md transition-all hover:scale-[1.01] active:scale-98 cursor-pointer flex items-center justify-center gap-2"
              >
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>Got it, Return to Portal Home</span>
              </button>
            </div>
          </div>
        </div>

      )}
      {/* WhatsApp Quick Chat Floating Pill */}
      <a
        href="https://wa.me/923001234567?text=Hello%20ApexEd%20ERP%20Team!%20I%20am%20interested%20in%20a%20demo%20and%20pricing%20for%20our%20institution."
        target="_blank"
        rel="noopener noreferrer"
        className="fixed bottom-5 left-5 z-40 inline-flex items-center gap-2 px-3.5 py-2.5 rounded-full bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-lg shadow-emerald-600/30 transition-all hover:scale-105 active:scale-95 cursor-pointer group"
        title="Chat with ApexEd Support on WhatsApp"
      >
        <MessageCircle className="w-4 h-4 fill-white/20" />
        <span className="hidden sm:inline">WhatsApp Inquiries</span>
        <span className="sm:hidden">WhatsApp</span>
      </a>

      {/* Back to Top Smooth Scroll Floating Button */}
      {showScrollTop && (
        <button
          type="button"
          onClick={scrollToTop}
          className="fixed bottom-5 right-5 z-40 p-3 rounded-full bg-purple-600 hover:bg-purple-700 text-white shadow-lg shadow-purple-600/30 transition-all duration-200 hover:scale-110 active:scale-95 cursor-pointer flex items-center justify-center animate-in fade-in"
          title="Back to Top"
          aria-label="Back to Top"
        >
          <ArrowUp className="w-4 h-4 stroke-[2.5]" />
        </button>
      )}

    </div>
  )
}

export default LandingPage
