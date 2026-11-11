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
  Gift,
  Moon,
  Sun,
  Palette
} from 'lucide-react'
import { useToast } from '../../context/ToastContext'
import { useTheme } from '../../context/ThemeContext'
import ThemeCustomizerModal from '../../components/common/ThemeCustomizerModal'
import { getStoredData, saveStoredData } from '../../services/dataService'
import AnnouncementService from '../../services/announcementService'
import { SchoolInquiryService } from '../../services/schoolInquiryService'

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

// Educational Plans Configuration (School-Focused Packages)
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
    description: 'Enter your school details below to immediately launch an isolated 14-day evaluation request for your school.',
    buttonText: 'Submit School Registration Request',
    buttonClass: 'bg-emerald-600 hover:bg-emerald-700 text-white font-bold shadow-md shadow-emerald-600/20',
    iconBg: 'bg-emerald-50 text-emerald-600 border border-emerald-200/80'
  },
  school: {
    id: 'school',
    wing: 'school',
    isMultiCampus: false,
    title: 'School Plan (Primary to Matric)',
    planName: 'School Plan',
    priceDisplay: 'PKR 25,000/mo',
    priceSub: 'Up to 1,500 Students · 2 Campuses',
    badge: '14 Days full testing access',
    badgeColor: 'text-emerald-800',
    description: 'Submit institutional onboarding details for your primary, middle, or secondary school campus.',
    buttonText: 'Submit School Registration Request',
    buttonClass: 'bg-emerald-600 hover:bg-emerald-700 text-white font-bold shadow-md shadow-emerald-600/20',
    iconBg: 'bg-emerald-50 text-emerald-600 border border-emerald-200/80'
  },
  enterprise: {
    id: 'enterprise',
    wing: 'multi-campus',
    isMultiCampus: true,
    title: 'Multi-Branch School Network',
    planName: 'School Network Plan',
    priceDisplay: 'PKR 45,000/mo',
    priceSub: '5,000+ Students · Multi-Branch HQ',
    badge: '14 Days full testing access',
    badgeColor: 'text-indigo-700',
    description: 'Submit multi-branch school network application for unified central Super Admin & branch governance.',
    buttonText: 'Submit School Registration Request',
    buttonClass: 'bg-emerald-600 hover:bg-emerald-700 text-white font-bold shadow-md shadow-emerald-600/20',
    iconBg: 'bg-indigo-50 text-indigo-600 border border-indigo-200/80'
  }
}

export const LandingPage = ({ onNavigateToLogin, onNavigateToDemo }) => {
  const { showToast } = useToast()
  const { isDark, toggleThemeMode, preset, activeThemeConfig } = useTheme()
  const [isThemeModalOpen, setIsThemeModalOpen] = useState(false)

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
  const [activeTab, setActiveTab] = useState('school') // 'school', 'early-years', 'matric', 'custom'
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
    wing: 'school', // 'school', 'multi-branch'
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

  // Smart Plan Modal Opener: Dynamically configures modal title, badge, icon, and default tier
  const openPlanModal = (planKey = 'trial') => {
    setActiveModalPlan(planKey)
    setModalStep(2)
    if (planKey === 'enterprise') {
      setTrialForm(prev => ({ ...prev, wing: 'multi-campus' }))
    } else {
      setTrialForm(prev => ({ ...prev, wing: 'school' }))
    }
    setIsTrialModalOpen(true)
  }

  // Smart Trial Modal Opener
  const handleOpenTrialModal = (targetWing = 'school') => {
    if (targetWing === 'enterprise' || targetWing === 'custom') {
      openPlanModal('enterprise')
    } else {
      openPlanModal('school')
    }
  }

  // Handle Free Trial / Plan Registration Submission to Super Admin
  const handleSubmitTrial = (e) => {
    e.preventDefault()
    if (!trialForm.instituteName.trim()) {
      showToast('Please enter your School Name.')
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

    setTimeout(async () => {
      try {
        const fullPhone = trialForm.phone.trim().startsWith('+') ? trialForm.phone.trim() : `+92 ${trialForm.phone.trim().replace(/^0+/, '')}`
        const instCode = trialForm.instituteName.replace(/[^A-Za-z0-9]/g, '').slice(0, 4).toUpperCase() || 'SCHL'

        const currentPlanConfig = PLAN_CONFIGS[activeModalPlan] || PLAN_CONFIGS.trial
        const planTierName = currentPlanConfig.planName

        let planPrice = 0
        if (activeModalPlan === 'school') {
          planPrice = billingCycle === 'annual' ? 21250 : 25000
        } else if (activeModalPlan === 'enterprise') {
          planPrice = billingCycle === 'annual' ? 38250 : 45000
        }

        const isInquirySettingOn = SchoolInquiryService.isSchoolInquiryEnabled()

        if (isInquirySettingOn) {
          // =========================================================================
          // WORKFLOW A (SETTING ON - REQUIREMENT 1 & 5):
          // School registrations are saved as inquiries with 'Pending' status.
          // NO institute or tenant is created until Super Admin approval.
          // =========================================================================
          const newInquiry = await SchoolInquiryService.createInquiry({
            schoolName: trialForm.instituteName.trim(),
            schoolCodePrefix: instCode,
            contactPerson: trialForm.adminName.trim() || 'Principal Administrator',
            email: trialForm.email.trim(),
            phone: fullPhone,
            city: trialForm.city || 'Lahore',
            address: `${trialForm.city || 'Lahore'}, Pakistan`,
            planTier: planTierName,
            adminPassword: trialForm.adminPassword,
            notes: trialForm.notes.trim() || 'Application received via self-service portal registration.',
            wingsCount: trialForm.wing === 'multi-campus' ? 3 : 1
          })

          // Save submitted details for the Animated Green Success Popup
          setSubmittedSuccessData({
            requestId: newInquiry.id,
            instituteName: trialForm.instituteName.trim(),
            adminName: trialForm.adminName.trim() || 'Principal Administrator',
            email: trialForm.email.trim(),
            phone: fullPhone,
            city: trialForm.city || 'Lahore',
            tierName: wingType,
            planTier: planTierName,
            adminPassword: trialForm.adminPassword,
            isInquiryPending: true
          })

          setIsSubmittingTrial(false)
          setIsTrialModalOpen(false)
          setIsSuccessModalOpen(true)
          showToast('Registration inquiry submitted for Super Admin review!')
        } else {
          // =========================================================================
          // WORKFLOW B (SETTING OFF - REQUIREMENT 1):
          // Schools are registered directly using the existing institute creation workflow.
          // NO inquiry is saved. Institute is active and ready immediately.
          // =========================================================================
          const newInstId = `inst-reg-${Date.now().toString().slice(-4)}`
          const newInstitute = {
            id: newInstId,
            name: trialForm.instituteName.trim(),
            code: instCode,
            contactPerson: trialForm.adminName.trim() || 'School Principal',
            email: trialForm.email.trim(),
            phone: fullPhone,
            address: `${trialForm.city || 'Lahore'}, Pakistan`,
            city: trialForm.city || 'Lahore',
            country: 'Pakistan',
            planTier: planTierName,
            planType: 'SCHOOL',
            type: 'School',
            subscriptionStatus: 'ACTIVE',
            lifecycleStatus: 'Active',
            trialEndsAt: new Date(Date.now() + 14 * 86400000).toISOString().slice(0, 10),
            enabledTiers: ['school'],
            createdAt: new Date().toISOString().slice(0, 10),
            status: 'Active',
            wingsCount: 1,
            campusesCount: trialForm.wing === 'multi-campus' ? 3 : 1,
            studentCount: 0,
            facultyCount: 0,
            adminPassword: trialForm.adminPassword,
            notes: trialForm.notes.trim()
          }

          const currentData = getStoredData()
          const updatedInstitutes = [newInstitute, ...(currentData.institutes || [])]

          // Add active administrator account so they can sign in immediately
          currentData.users = currentData.users || []
          const adminUser = {
            id: `usr-${Date.now().toString().slice(-4)}`,
            name: trialForm.adminName.trim() || `${trialForm.instituteName.trim()} Administrator`,
            email: trialForm.email.trim().toLowerCase(),
            password: trialForm.adminPassword,
            role: 'institute_admin',
            roleTitle: 'Institute Administrator',
            instituteId: newInstId,
            institute: trialForm.instituteName.trim(),
            phone: fullPhone,
            status: 'Active',
            lastLogin: 'Never',
            createdAt: new Date().toISOString()
          }
          currentData.users.unshift(adminUser)
          saveStoredData({ ...currentData, institutes: updatedInstitutes })

          // Active subscription record
          const trialSub = {
            id: `sub-reg-${Date.now().toString().slice(-4)}`,
            instituteId: newInstId,
            instituteName: trialForm.instituteName.trim(),
            planId: `plan-${activeModalPlan}`,
            planName: planTierName,
            enabledTiers: ['school'],
            status: 'ACTIVE',
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

          if (typeof window !== 'undefined') {
            window.dispatchEvent(new Event('sms_institutes_updated'))
            window.dispatchEvent(new Event('sms_users_updated'))
            window.dispatchEvent(new Event('storage'))
          }

          // Save submitted details for the Animated Green Success Popup
          setSubmittedSuccessData({
            requestId: newInstId,
            instituteName: trialForm.instituteName.trim(),
            adminName: trialForm.adminName.trim() || 'Principal Administrator',
            email: trialForm.email.trim(),
            phone: fullPhone,
            city: trialForm.city || 'Lahore',
            tierName: wingType,
            planTier: planTierName,
            adminPassword: trialForm.adminPassword,
            isInquiryPending: false
          })

          setIsSubmittingTrial(false)
          setIsTrialModalOpen(false)
          setIsSuccessModalOpen(true)
          showToast('School registered and provisioned successfully!')
        }
      } catch (err) {
        setIsSubmittingTrial(false)
        showToast('Submission error: ' + err.message)
      }
    }, 600)
  }

  // Tab previews data for live school mockup
  const wingPreviews = {
    preschool: {
      title: 'Early Years & Montessori Wing (Playgroup - KG)',
      tag: 'Early Childhood Education',
      description: 'Warm, structured tracking for Playgroup, Nursery, Prep & KG sections. Manage student portfolios, parent SMS alerts, daily activity notes, and fee challans.',
      metrics: [
        { label: 'Active Learners', value: '320', sub: 'Playgroup to KG' },
        { label: 'Daily Attendance', value: '97.2%', sub: 'Parent SMS Synced' },
        { label: 'Early Sections', value: '12', sub: 'Morning Batches' },
        { label: 'Montessori Staff', value: '18', sub: 'Class Teachers' }
      ],
      features: [
        'Digital attendance roll call with automated guardian alerts',
        'Visual progress & sensory milestone report cards',
        'Monthly 3-copy computerized fee challans with 1Link ID',
        'Safe transport route tracking & guardian pickup cards'
      ]
    },
    school: {
      title: 'Primary & Middle School Wing (Grades 1 - 8)',
      tag: 'Elementary & Foundation Stream',
      description: 'Engineered specifically for primary and middle school branches. Manage class timetables, daily period attendance, homework diaries, computerized fee challans, and progress reports.',
      metrics: [
        { label: 'Active Students', value: '860', sub: 'Grade 1 to Grade 8' },
        { label: 'Fee Collection', value: '98.4%', sub: 'JazzCash / 1Link' },
        { label: 'Classes & Sections', value: '26', sub: 'Super & Star Sections' },
        { label: 'School Teachers', value: '36', sub: 'Subject Specialists' }
      ],
      features: [
        'Automated 3-copy fee challans with barcode & 1Bill reference',
        'Subject-wise timetable scheduler with collision detection',
        'Daily SMS and WhatsApp absent alerts sent to parents',
        'Terminal examination marksheets & printable admit cards'
      ]
    },
    secondary: {
      title: 'Secondary High School (Matric & O-Levels, Grades 9 - 10)',
      tag: 'SSC Matriculation & Cambridge O-Levels',
      description: 'Complete secondary school governance for Science, Computer, Arts & O-Level streams. Manage admit cards, term exams, result gazettes, and School Leaving Certificates (SLC).',
      metrics: [
        { label: 'High School Students', value: '540', sub: 'Grade 9 & Grade 10' },
        { label: 'Exam Pass Rate', value: '99.1%', sub: 'BISE & CAIE Ready' },
        { label: 'Subject Streams', value: '4', sub: 'Bio, CS, Arts, O-Level' },
        { label: 'Senior Teachers', value: '24', sub: 'Science & Math' }
      ],
      features: [
        'Printable exam admit cards, date sheets & result gazettes',
        'School Leaving Certificate (SLC) & character certificate generator',
        'Attendance threshold tracking & parent PTM scheduling',
        'Science & computer lab scheduling with timetable integration'
      ]
    },
    custom: {
      title: 'Multi-Branch School Network HQ',
      tag: 'Unified Multi-Campus School Headquarters',
      description: 'Ideal for school networks operating multiple branches across Pakistan. Manage all school branches under a centralized Super Admin headquarters.',
      metrics: [
        { label: 'Total Enrolled', value: '8,400+', sub: 'Across 10 School Branches' },
        { label: 'Network Revenue', value: 'PKR 1.2M', sub: 'Reconciled Ledger' },
        { label: 'Active Campuses', value: '10', sub: 'Lahore, Isb, Khi' },
        { label: 'System Uptime', value: '99.98%', sub: 'Cloud Isolated' }
      ],
      features: [
        'Central Super Admin dashboard with consolidated school financial ledger',
        'Cross-campus student transfer with complete academic history retention',
        'Headquarters fee revenue aggregation & 1Link corporate clearing',
        'Platform security center with session governance & audit logs'
      ]
    }
  }

  const currentPreview = wingPreviews[activeTab] || wingPreviews.school

  // Navbar items matching the page sections in exact scroll order
  const navItems = [
    { id: 'features', label: 'Core Features' },
    { id: 'wings', label: 'School Wings' },
    { id: 'preview', label: 'Dashboard Preview' },
    { id: 'pricing', label: 'Packages & Free Trial' },
    { id: 'faq', label: 'FAQ' }
  ]

  return (
    <div className="min-h-screen w-full bg-[#fcfaff] text-slate-900 font-sans selection:bg-emerald-100 selection:text-emerald-950 overflow-x-clip relative">
      
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
              : 'bg-[#f5eeff] text-emerald-950 border-emerald-200/80'
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
                  : 'bg-emerald-600'
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
                    onNavigateToLogin()
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
                    : 'hover:text-emerald-800'
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
      <header className="sticky top-0 z-50 bg-white/95 dark:bg-[#0B1020]/95 backdrop-blur-md border-b border-emerald-100/90 dark:border-slate-800/80 shadow-[0_4px_20px_-4px_rgba(147,51,234,0.06)] dark:shadow-[0_4px_20px_-4px_rgba(0,0,0,0.5)] transition-all duration-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-14 sm:h-16 flex items-center justify-between gap-2 sm:gap-4">
          
          {/* Brand Logo */}
          <div 
            onClick={(e) => scrollToSection(e, 'hero')}
            className="flex items-center gap-2.5 sm:gap-3 cursor-pointer group shrink-0"
          >
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-tr from-purple-700 via-purple-600 to-indigo-600 flex items-center justify-center text-white shadow-sm shadow-emerald-500/25 group-hover:scale-105 transition-transform shrink-0">
              <GraduationCap className="w-5 h-5 stroke-[2.2]" />
            </div>
            <div>
              <div className="flex items-center gap-1.5 sm:gap-2">
                <span className="text-base sm:text-lg font-extrabold font-heading tracking-tight text-slate-900 dark:text-white">
                  Apex<span className="text-emerald-600 dark:text-purple-400">Ed</span>
                </span>
                <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-[#f5eeff] dark:bg-purple-950/60 text-emerald-800 dark:text-purple-300 border border-emerald-200 dark:border-purple-800/60 hidden xs:inline-block">
                  ERP v2.4
                </span>
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 hidden sm:block -mt-0.5">
                Educational Management Operating System
              </p>
            </div>
          </div>

          {/* Center Navigation Links with Smooth Active Highlighting Animation (Desktop) */}
          <nav className="hidden lg:flex items-center gap-1.5 p-1 bg-slate-50/70 dark:bg-slate-900/80 rounded-2xl border border-emerald-100/70 dark:border-slate-800/80 text-xs">
            {navItems.map((item) => {
              const isActive = activeSection === item.id
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={(e) => scrollToSection(e, item.id)}
                  className={`px-3 py-1.5 rounded-xl font-bold transition-all duration-200 cursor-pointer flex items-center gap-1.5 ${
                    isActive
                      ? 'bg-[#f5eeff] dark:bg-purple-900/40 text-emerald-800 dark:text-purple-200 border border-emerald-200 dark:border-purple-700/60 shadow-xs'
                      : 'text-slate-600 dark:text-slate-300 hover:text-emerald-600 dark:hover:text-white hover:bg-white/80 dark:hover:bg-slate-800/60'
                  }`}
                >
                  {isActive && (
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 dark:bg-purple-400 animate-pulse"></span>
                  )}
                  <span>{item.label}</span>
                </button>
              )
            })}
          </nav>

          {/* Right Action Controls: Theme Studio, Dark Mode & Portal Sign In */}
          <div className="flex items-center gap-2 sm:gap-3">
            <button
              type="button"
              onClick={() => setIsThemeModalOpen(true)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold text-slate-700 dark:text-slate-200 bg-white/90 dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 shadow-2xs hover:shadow-xs transition-all backdrop-blur-md cursor-pointer hover:scale-105 active:scale-95"
              title="Theme Studio: Customize Design Tokens & Presets"
            >
              <span
                className="w-2.5 h-2.5 rounded-full inline-block shadow-2xs"
                style={{ backgroundColor: activeThemeConfig?.primary || 'var(--primary)' }}
              />
              <Palette className="w-3.5 h-3.5 text-slate-500 dark:text-slate-400" />
              <span className="capitalize hidden sm:inline">{preset}</span>
            </button>

            <button
              type="button"
              onClick={toggleThemeMode}
              className="p-2 rounded-xl text-slate-700 dark:text-slate-200 bg-white/90 dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 shadow-2xs hover:shadow-xs transition-all backdrop-blur-md cursor-pointer hover:scale-105 active:scale-95"
              title={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
            >
              {isDark ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-indigo-600" />}
            </button>

            <button
              type="button"
              onClick={() => onNavigateToLogin()}
              className="btn-hero-gradient hidden lg:inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold shadow-sm hover:shadow transition-all cursor-pointer group"
              title="Sign in to your Institutional Portal"
            >
              <Lock className="w-3.5 h-3.5 text-white group-hover:scale-110 transition-transform" />
              <span>Portal Sign In</span>
              <ArrowRight className="w-3.5 h-3.5 text-white/80 group-hover:translate-x-0.5 transition-transform" />
            </button>

            {/* Mobile Hamburger Menu Toggle Button */}
            <button
              type="button"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="lg:hidden p-2 rounded-xl text-slate-700 dark:text-slate-200 hover:text-emerald-800 hover:bg-emerald-50 dark:hover:bg-slate-800 border border-emerald-100 dark:border-slate-800 transition-colors cursor-pointer"
              aria-label="Toggle Navigation Menu"
            >
              {isMobileMenuOpen ? (
                <X className="w-5 h-5 text-emerald-800 dark:text-purple-300" />
              ) : (
                <Menu className="w-5 h-5 text-slate-700 dark:text-slate-200" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile Navigation Dropdown Drawer (Animated & Full Interactive Response) */}
        {isMobileMenuOpen && (
          <div className="lg:hidden border-t border-emerald-100 bg-white/98 backdrop-blur-md px-4 py-4 shadow-xl space-y-3.5 animate-in slide-in-from-top-2 duration-200 max-h-[80vh] overflow-y-auto">
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
                        ? 'bg-[#f5eeff] text-emerald-800 border border-emerald-200'
                        : 'text-slate-700 hover:bg-emerald-50 hover:text-emerald-800'
                    }`}
                  >
                    <span>{item.label}</span>
                    {isActive ? (
                      <span className="w-2 h-2 rounded-full bg-emerald-600 animate-pulse"></span>
                    ) : (
                      <ArrowRight className="w-3.5 h-3.5 text-slate-300" />
                    )}
                  </button>
                )
              })}
            </div>

            {/* Quick Actions in Mobile Menu */}
            <div className="pt-2 border-t border-emerald-100 space-y-2">
              <button
                type="button"
                onClick={() => {
                  setIsMobileMenuOpen(false)
                  setIsTrialModalOpen(true)
                }}
                className="w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs sm:text-sm shadow-xs transition-colors flex items-center justify-center gap-2"
              >
                <Sparkles className="w-4 h-4 text-purple-200" />
                <span>Start 14-Day Free Trial (₨ 0)</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setIsMobileMenuOpen(false)
                  onNavigateToLogin()
                }}
                className="w-full py-2.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-800 font-bold text-xs sm:text-sm border border-emerald-200 transition-colors flex items-center justify-center gap-2"
              >
                <Lock className="w-4 h-4" />
                <span>Portal Sign In</span>
              </button>
            </div>
          </div>
        )}
      </header>

      {/* 3. HERO SECTION */}
      <section id="hero" className="relative pt-8 sm:pt-12 pb-12 sm:pb-16 overflow-hidden bg-gradient-to-b from-[#fcfaff] via-[#f5eeff]/35 to-white dark:from-[#0B1020] dark:via-[#0E162B] dark:to-[#0B1020]">
        {/* Soft Ambient Radial Accents */}
        <div className="absolute top-10 left-1/2 -translate-x-1/2 w-[700px] h-[350px] bg-purple-200/40 dark:bg-purple-600/10 rounded-full blur-3xl pointer-events-none -z-10"></div>
        <div className="absolute top-40 right-10 w-96 h-96 bg-indigo-100/40 dark:bg-indigo-600/10 rounded-full blur-3xl pointer-events-none -z-10"></div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          
          {/* Eyebrow Badge */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#f5eeff] dark:bg-purple-950/60 text-emerald-800 dark:text-purple-300 border border-emerald-200 dark:border-purple-800/60 text-xs font-bold shadow-xs dark:shadow-purple-950/40 mb-6 animate-in fade-in">
            <Sparkles className="w-3.5 h-3.5 text-emerald-600 dark:text-purple-400" />
            <span>Next-Gen School Management Operating System</span>
          </div>

          {/* Hero Headline */}
          <h1 className="text-2xl sm:text-4xl lg:text-5xl font-extrabold text-slate-900 dark:text-white font-heading tracking-tight max-w-3xl mx-auto leading-tight">
            One Intelligent Platform to Run <br className="hidden sm:inline" />
            <span className="text-hero-gradient font-black">
              Primary, Middle &amp; High Schools
            </span>
          </h1>

          {/* Subtitle */}
          <p className="mt-5 text-sm sm:text-base lg:text-lg text-slate-600 dark:text-slate-300 max-w-2xl mx-auto leading-relaxed font-normal">
            Eliminate chaotic spreadsheets and outdated software. Unify computerized fee challans (1Link/JazzCash), digital attendance, class timetables, and terminal examinations in a single, elegant school portal.
          </p>

          {/* Hero CTAs */}
          <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4">
            <button
              onClick={() => setIsTrialModalOpen(true)}
              className="btn-hero-gradient w-full sm:w-auto px-6 py-3.5 rounded-xl text-white font-bold text-sm shadow-md shadow-purple-600/25 transition-all hover:scale-[1.02] active:scale-95 cursor-pointer flex items-center justify-center gap-2"
            >
              <Sparkles className="w-4 h-4 text-white/80" />
              <span>Start 14-Day Free Trial (₨ 0)</span>
            </button>

            <button
              type="button"
              onClick={() => onNavigateToLogin()}
              className="w-full sm:w-auto px-6 py-3.5 rounded-xl bg-emerald-50 hover:bg-[#f5eeff] dark:bg-slate-900/90 dark:hover:bg-slate-800/90 text-emerald-800 hover:text-emerald-950 dark:text-white dark:hover:text-purple-200 border-2 border-emerald-300 hover:border-emerald-500 dark:border-slate-700 dark:hover:border-purple-500/70 font-extrabold text-sm shadow-xs hover:shadow-md transition-all duration-200 hover:scale-[1.02] active:scale-95 cursor-pointer flex items-center justify-center gap-2 group whitespace-nowrap"
              title="Sign in to your Educational Portal"
            >
              <div className="w-5 h-5 rounded-lg bg-emerald-100 group-hover:bg-purple-200 dark:bg-purple-950/70 dark:group-hover:bg-purple-900/70 flex items-center justify-center text-emerald-800 dark:text-purple-300 transition-colors shrink-0">
                <Lock className="w-3.5 h-3.5 stroke-[2.4]" />
              </div>
              <span className="font-heading tracking-tight">Portal Sign In</span>
              <ArrowRight className="w-4 h-4 text-emerald-600 dark:text-purple-400 group-hover:translate-x-0.5 transition-all shrink-0" />
            </button>
          </div>

          {/* Trust Highlights */}
          <div className="mt-10 pt-8 border-t border-emerald-100/80 dark:border-slate-800 max-w-3xl mx-auto grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs font-semibold text-slate-600 dark:text-slate-300">
            <div className="flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/80 dark:bg-slate-900/80 border border-emerald-100 dark:border-slate-800 shadow-2xs">
              <CheckCircle2 className="w-4 h-4 text-emerald-500 dark:text-emerald-400 shrink-0" />
              <span className="font-bold text-slate-800 dark:text-slate-200">₨ 0 Free Evaluation</span>
            </div>
            <div className="flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/80 dark:bg-slate-900/80 border border-emerald-100 dark:border-slate-800 shadow-2xs">
              <CheckCircle2 className="w-4 h-4 text-emerald-500 dark:text-emerald-400 shrink-0" />
              <span className="font-bold text-slate-800 dark:text-slate-200">1Link &amp; JazzCash</span>
            </div>
            <div className="flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/80 dark:bg-slate-900/80 border border-emerald-100 dark:border-slate-800 shadow-2xs">
              <CheckCircle2 className="w-4 h-4 text-emerald-500 dark:text-emerald-400 shrink-0" />
              <span className="font-bold text-slate-800 dark:text-slate-200">Multi-Tenant Cloud</span>
            </div>
            <div className="flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/80 dark:bg-slate-900/80 border border-emerald-100 dark:border-slate-800 shadow-2xs">
              <CheckCircle2 className="w-4 h-4 text-emerald-500 dark:text-emerald-400 shrink-0" />
              <span className="font-bold text-slate-800 dark:text-slate-200">Zero Setup Fees</span>
            </div>
          </div>
        </div>
      </section>

      {/* 4. CORE PLATFORM MODULES SECTION */}
      <section id="features" className="py-20 bg-white dark:bg-[#0B1020] border-y border-emerald-100/70 dark:border-slate-800/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="text-center max-w-3xl mx-auto mb-14">
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-800 dark:text-purple-300 bg-[#f5eeff] dark:bg-purple-950/60 px-3 py-1 rounded-full border border-emerald-200 dark:border-purple-800/60 shadow-2xs">
              Built for Real Pakistani &amp; Global Operations
            </span>
            <h2 className="text-2xl sm:text-4xl font-extrabold text-slate-900 dark:text-white font-heading tracking-tight mt-3">
              Everything Your Administration Needs
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-2">
              All modules work together seamlessly out of the box with zero manual integration required.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            
            {/* Feature 1 */}
            <div className="p-6 rounded-2xl bg-[#fcfaff] dark:bg-slate-900/80 border border-emerald-100/80 dark:border-slate-800/80 hover:border-emerald-200 dark:hover:border-purple-500/50 hover:shadow-md dark:hover:shadow-purple-950/30 transition-all">
              <div className="w-10 h-10 rounded-xl bg-[#f5eeff] dark:bg-purple-950/60 text-emerald-800 dark:text-purple-300 border border-transparent dark:border-purple-800/50 flex items-center justify-center mb-4">
                <CreditCard className="w-5 h-5" />
              </div>
              <h4 className="text-base font-bold text-slate-900 dark:text-white">Fee Challans &amp; Pakistani Gateways</h4>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1.5 leading-relaxed">
                Computerized fee vouchers with 1Link, 1Bill, and JazzCash corporate references. Includes installment tracking, partial payments, and overdue fines.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="p-6 rounded-2xl bg-[#fcfaff] dark:bg-slate-900/80 border border-emerald-100/80 dark:border-slate-800/80 hover:border-emerald-200 dark:hover:border-purple-500/50 hover:shadow-md dark:hover:shadow-purple-950/30 transition-all">
              <div className="w-10 h-10 rounded-xl bg-[#f5eeff] dark:bg-purple-950/60 text-emerald-800 dark:text-purple-300 border border-transparent dark:border-purple-800/50 flex items-center justify-center mb-4">
                <FileText className="w-5 h-5" />
              </div>
              <h4 className="text-base font-bold text-slate-900 dark:text-white">Examinations &amp; Printable Admit Cards</h4>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1.5 leading-relaxed">
                Generate printable exam admit cards with candidate photos, roll numbers, and date sheets. Enter marks and print official result gazettes instantly.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="p-6 rounded-2xl bg-[#fcfaff] dark:bg-slate-900/80 border border-emerald-100/80 dark:border-slate-800/80 hover:border-emerald-200 dark:hover:border-purple-500/50 hover:shadow-md dark:hover:shadow-purple-950/30 transition-all">
              <div className="w-10 h-10 rounded-xl bg-[#f5eeff] dark:bg-purple-950/60 text-emerald-800 dark:text-purple-300 border border-transparent dark:border-purple-800/50 flex items-center justify-center mb-4">
                <Calendar className="w-5 h-5" />
              </div>
              <h4 className="text-base font-bold text-slate-900 dark:text-white">Daily Digital Attendance</h4>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1.5 leading-relaxed">
                Period-wise attendance for students and staff. Automatic notifications for consecutive absences, leaves management, and monthly attendance registers.
              </p>
            </div>

            {/* Feature 4 */}
            <div className="p-6 rounded-2xl bg-[#fcfaff] dark:bg-slate-900/80 border border-emerald-100/80 dark:border-slate-800/80 hover:border-emerald-200 dark:hover:border-purple-500/50 hover:shadow-md dark:hover:shadow-purple-950/30 transition-all">
              <div className="w-10 h-10 rounded-xl bg-[#f5eeff] dark:bg-purple-950/60 text-emerald-800 dark:text-purple-300 border border-transparent dark:border-purple-800/50 flex items-center justify-center mb-4">
                <MessageCircle className="w-5 h-5" />
              </div>
              <h4 className="text-base font-bold text-slate-900 dark:text-white">Direct WhatsApp &amp; SMS Broadcasts</h4>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1.5 leading-relaxed">
                Instantly reach parents and faculty via integrated WhatsApp redirect links and SMS broadcasting. Send fee reminders, exam schedules, and circulars.
              </p>
            </div>

            {/* Feature 5 */}
            <div className="p-6 rounded-2xl bg-[#fcfaff] dark:bg-slate-900/80 border border-emerald-100/80 dark:border-slate-800/80 hover:border-emerald-200 dark:hover:border-purple-500/50 hover:shadow-md dark:hover:shadow-purple-950/30 transition-all">
              <div className="w-10 h-10 rounded-xl bg-[#f5eeff] dark:bg-purple-950/60 text-emerald-800 dark:text-purple-300 border border-transparent dark:border-purple-800/50 flex items-center justify-center mb-4">
                <BarChart3 className="w-5 h-5" />
              </div>
              <h4 className="text-base font-bold text-slate-900 dark:text-white">Cross-Institute Financial Analytics</h4>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1.5 leading-relaxed">
                Live platform MRR, ARR, student admission trends, and fee collection rates. Download complete audit reports in Excel and CSV formats.
              </p>
            </div>

            {/* Feature 6 */}
            <div className="p-6 rounded-2xl bg-[#fcfaff] dark:bg-slate-900/80 border border-emerald-100/80 dark:border-slate-800/80 hover:border-emerald-200 dark:hover:border-purple-500/50 hover:shadow-md dark:hover:shadow-purple-950/30 transition-all">
              <div className="w-10 h-10 rounded-xl bg-[#f5eeff] dark:bg-purple-950/60 text-emerald-800 dark:text-purple-300 border border-transparent dark:border-purple-800/50 flex items-center justify-center mb-4">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <h4 className="text-base font-bold text-slate-900 dark:text-white">Multi-Tenant Cloud Security</h4>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1.5 leading-relaxed">
                Strict data isolation between campuses, role-based access control (Super Admin, Campus Admin, Teachers, Accounts), and automatic encrypted backups.
              </p>
            </div>

          </div>
        </div>
      </section>

      {/* 5. SCHOOL WINGS SHOWCASE SECTION */}
      <section id="wings" className="py-20 bg-gradient-to-b from-white to-[#fcfaff] dark:from-[#0B1020] dark:to-[#0F172A]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="text-center max-w-3xl mx-auto mb-14">
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-800 dark:text-purple-300 bg-[#f5eeff] dark:bg-purple-950/60 px-3 py-1 rounded-full border border-emerald-200 dark:border-purple-800/60">
              Engineered for Every School Wing
            </span>
            <h2 className="text-2xl sm:text-4xl font-extrabold text-slate-900 dark:text-white font-heading tracking-tight mt-3">
              One School Architecture. Every Grade Covered.
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-2">
              Whether you run an Early Years Montessori, a Primary &amp; Middle school, or a full Matric &amp; O-Levels campus network, EIMS fits your school workflows without compromises.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            
            {/* Wing 1: Early Years / Montessori */}
            <div className="p-6 rounded-3xl bg-white dark:bg-slate-900/90 border border-emerald-100 dark:border-slate-800 hover:border-emerald-300 dark:hover:border-purple-500/50 shadow-xs hover:shadow-md dark:hover:shadow-purple-950/30 transition-all flex flex-col justify-between group">
              <div>
                <div className="w-12 h-12 rounded-2xl bg-pink-50 dark:bg-pink-950/40 text-pink-700 dark:text-pink-300 border border-pink-200 dark:border-pink-800/50 flex items-center justify-center mb-5 group-hover:scale-105 transition-transform">
                  <Sparkles className="w-6 h-6 stroke-[2.2]" />
                </div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-pink-700 dark:text-pink-300 bg-pink-50 dark:bg-pink-950/50 px-2.5 py-0.5 rounded-md border border-pink-200 dark:border-pink-800/50">
                  Playgroup - KG
                </span>
                <h3 className="text-xl font-bold text-slate-900 dark:text-white mt-2">Early Years &amp; Montessori</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
                  Structured for Playgroup, Nursery, Prep &amp; KG. Track daily attendance, parent SMS alerts, class activities, and monthly fee challans.
                </p>

                <ul className="mt-5 space-y-2 text-xs text-slate-600 dark:text-slate-300">
                  <li className="flex items-center gap-2">
                    <Check className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                    <span>Early childhood progress &amp; activity tracking</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                    <span>Automated guardian SMS &amp; pickup alerts</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                    <span>School transport route &amp; bus tracking</span>
                  </li>
                </ul>
              </div>

              <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-800">
                <button
                  onClick={() => handleOpenTrialModal('school')}
                  className="w-full py-2.5 rounded-xl bg-emerald-50 dark:bg-slate-800 hover:bg-emerald-100 dark:hover:bg-purple-900/50 text-emerald-800 dark:text-purple-200 font-bold text-xs border border-transparent dark:border-slate-700 hover:dark:border-purple-600/50 transition-colors cursor-pointer flex items-center justify-center gap-1.5"
                >
                  <span>Start School Free Trial</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Wing 2: Primary & Middle */}
            <div className="p-6 rounded-3xl bg-white dark:bg-slate-900/90 border border-emerald-100 dark:border-slate-800 hover:border-emerald-300 dark:hover:border-purple-500/50 shadow-xs hover:shadow-md dark:hover:shadow-purple-950/30 transition-all flex flex-col justify-between group">
              <div>
                <div className="w-12 h-12 rounded-2xl bg-emerald-50 dark:bg-purple-950/40 text-emerald-800 dark:text-purple-300 border border-emerald-200 dark:border-purple-800/50 flex items-center justify-center mb-5 group-hover:scale-105 transition-transform">
                  <School className="w-6 h-6 stroke-[2.2]" />
                </div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-800 dark:text-purple-300 bg-[#f5eeff] dark:bg-purple-950/50 px-2.5 py-0.5 rounded-md border border-emerald-200 dark:border-purple-800/50">
                  Grades 1 - 8
                </span>
                <h3 className="text-xl font-bold text-slate-900 dark:text-white mt-2">Primary &amp; Middle Wing</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
                  Complete elementary operations for Classes 1 to 8. Manage custom sections, weekly timetables, homework diaries, and 3-part bank fee vouchers.
                </p>

                <ul className="mt-5 space-y-2 text-xs text-slate-600 dark:text-slate-300">
                  <li className="flex items-center gap-2">
                    <Check className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                    <span>Barcode-scannable 3-copy bank fee vouchers</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                    <span>Custom section rosters &amp; class promotion</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                    <span>Daily roll call &amp; teacher assignment matrix</span>
                  </li>
                </ul>
              </div>

              <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-800">
                <button
                  onClick={() => handleOpenTrialModal('school')}
                  className="w-full py-2.5 rounded-xl bg-indigo-50 dark:bg-slate-800 hover:bg-indigo-100 dark:hover:bg-purple-900/50 text-indigo-700 dark:text-purple-200 font-bold text-xs border border-transparent dark:border-slate-700 hover:dark:border-purple-600/50 transition-colors cursor-pointer flex items-center justify-center gap-1.5"
                >
                  <span>Start School Free Trial</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Wing 3: Matric & O-Levels */}
            <div className="p-6 rounded-3xl bg-white dark:bg-slate-900/90 border border-emerald-100 dark:border-slate-800 hover:border-emerald-300 dark:hover:border-purple-500/50 shadow-xs hover:shadow-md dark:hover:shadow-purple-950/30 transition-all flex flex-col justify-between group">
              <div>
                <div className="w-12 h-12 rounded-2xl bg-indigo-50 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800/50 flex items-center justify-center mb-5 group-hover:scale-105 transition-transform">
                  <GraduationCap className="w-6 h-6 stroke-[2.2]" />
                </div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-indigo-700 dark:text-indigo-300 bg-indigo-50 dark:bg-indigo-950/50 px-2.5 py-0.5 rounded-md border border-indigo-200 dark:border-indigo-800/50">
                  Grades 9 - 10
                </span>
                <h3 className="text-xl font-bold text-slate-900 dark:text-white mt-2">Matric &amp; O-Levels Wing</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
                  High school academic engine for Science, Computer &amp; Cambridge O-Level streams. Print admit cards, result gazettes, and School Leaving Certificates (SLC).
                </p>

                <ul className="mt-5 space-y-2 text-xs text-slate-600 dark:text-slate-300">
                  <li className="flex items-center gap-2">
                    <Check className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                    <span>Printable exam admit cards &amp; tabulation sheets</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                    <span>Matric &amp; O-Level syllabus &amp; result gazettes</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                    <span>Official SLC &amp; character certificates</span>
                  </li>
                </ul>
              </div>

              <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-800">
                <button
                  onClick={() => handleOpenTrialModal('enterprise')}
                  className="w-full py-2.5 rounded-xl bg-emerald-50 dark:bg-slate-800 hover:bg-emerald-100 dark:hover:bg-purple-900/50 text-emerald-700 dark:text-purple-200 font-bold text-xs border border-transparent dark:border-slate-700 hover:dark:border-purple-600/50 transition-colors cursor-pointer flex items-center justify-center gap-1.5"
                >
                  <span>Start Multi-Branch Trial</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* 6. INTERACTIVE PRODUCT PREVIEW SECTION */}
      <section id="preview" className="py-20 bg-white dark:bg-[#0B1020] border-y border-emerald-100/70 dark:border-slate-800/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="text-center max-w-3xl mx-auto mb-10">
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-800 dark:text-purple-300 bg-[#f5eeff] dark:bg-purple-950/60 px-3 py-1 rounded-full border border-emerald-200 dark:border-purple-800/60">
              Interactive Dashboard Preview
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white font-heading tracking-tight mt-3">
              Designed for Speed, Clarity, and School Control
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-2">
              Select a school wing below to inspect how EIMS organizes classrooms, sections, fees, and academic workflows seamlessly.
            </p>

            {/* School Wing Switcher Pills */}
            <div className="flex flex-wrap items-center justify-center gap-2 mt-6 p-1.5 bg-slate-100/80 dark:bg-slate-900/90 rounded-2xl border border-slate-200/80 dark:border-slate-800 max-w-2xl mx-auto">
              <button
                onClick={() => setActiveTab('preschool')}
                className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  activeTab === 'preschool'
                    ? 'bg-purple-600 dark:bg-purple-600 text-white shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-purple-600 dark:hover:text-white hover:bg-white dark:hover:bg-slate-800'
                }`}
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>Early Years (KG)</span>
              </button>
              <button
                onClick={() => setActiveTab('school')}
                className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  activeTab === 'school'
                    ? 'bg-purple-600 dark:bg-purple-600 text-white shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-purple-600 dark:hover:text-white hover:bg-white dark:hover:bg-slate-800'
                }`}
              >
                <School className="w-3.5 h-3.5" />
                <span>Primary &amp; Middle</span>
              </button>
              <button
                onClick={() => setActiveTab('secondary')}
                className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  activeTab === 'secondary'
                    ? 'bg-purple-600 dark:bg-purple-600 text-white shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-purple-600 dark:hover:text-white hover:bg-white dark:hover:bg-slate-800'
                }`}
              >
                <GraduationCap className="w-3.5 h-3.5" />
                <span>Matric &amp; O-Levels</span>
              </button>
              <button
                onClick={() => setActiveTab('custom')}
                className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  activeTab === 'custom'
                    ? 'bg-purple-600 dark:bg-purple-600 text-white shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-purple-600 dark:hover:text-white hover:bg-white dark:hover:bg-slate-800'
                }`}
              >
                <Sliders className="w-3.5 h-3.5" />
                <span>Multi-Branch HQ</span>
              </button>
            </div>
          </div>

          {/* Mockup Card Window */}
          <div className="rounded-3xl border border-emerald-200/90 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-[0_20px_50px_rgba(147,51,234,0.06)] dark:shadow-[0_20px_50px_rgba(0,0,0,0.4)] overflow-hidden">
            
            {/* Window Titlebar (macOS Style Browser Window Chrome) */}
            <div className="px-5 py-3.5 bg-slate-950 text-slate-200 flex items-center justify-between border-b border-slate-800">
              <div className="flex items-center gap-2.5">
                <div className="flex items-center gap-1.5">
                  <span className="w-3 h-3 rounded-full bg-rose-500 shadow-xs hover:opacity-80 transition-opacity"></span>
                  <span className="w-3 h-3 rounded-full bg-amber-500 shadow-xs hover:opacity-80 transition-opacity"></span>
                  <span className="w-3 h-3 rounded-full bg-emerald-500 shadow-xs hover:opacity-80 transition-opacity"></span>
                </div>
                <div className="hidden sm:flex items-center gap-1.5 bg-slate-900 px-3 py-1 rounded-lg border border-slate-800 text-[11px] font-mono text-slate-400 ml-2">
                  <Lock className="w-3 h-3 text-purple-400" />
                  <span className="text-slate-300">https://</span>
                  <span>app.apexed.pk/portal/{activeTab}</span>
                </div>
              </div>
              <div className="flex items-center gap-2 text-[11px] font-bold text-slate-300 bg-slate-900/80 px-2.5 py-1 rounded-lg border border-slate-800">
                <span className="w-2 h-2 rounded-full bg-purple-400 animate-pulse shadow-[0_0_8px_#c084fc]"></span>
                <span className="text-purple-300">Live Production Sync</span>
              </div>
            </div>

            {/* Mockup Inner Body */}
            <div className="p-6 sm:p-8 bg-[#fcfaff] dark:bg-slate-950/80">
              
              {/* Inner Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-emerald-100 dark:border-slate-800">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-[#f5eeff] dark:bg-purple-950/60 text-emerald-800 dark:text-purple-300 border border-emerald-200 dark:border-purple-800/60">
                      {currentPreview.tag}
                    </span>
                    <span className="text-xs text-slate-400 dark:text-slate-500">· Real-time Synchronization</span>
                  </div>
                  <h3 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white mt-1 font-heading">
                    {currentPreview.title}
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5 max-w-2xl">
                    {currentPreview.description}
                  </p>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={() => onNavigateToLogin()}
                    className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold transition-colors cursor-pointer shadow-xs"
                  >
                    Open Live Portal
                  </button>
                </div>
              </div>

              {/* 4 Metrics Cards */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mt-6">
                {currentPreview.metrics.map((m, idx) => (
                  <div key={idx} className="p-4 rounded-2xl bg-white dark:bg-slate-900/90 border border-emerald-100 dark:border-slate-800 shadow-xs">
                    <span className="text-xs font-medium text-slate-500 dark:text-slate-400 block">{m.label}</span>
                    <span className="text-2xl font-extrabold text-slate-900 dark:text-white font-heading tracking-tight block mt-1">
                      {m.value}
                    </span>
                    <span className="text-[11px] font-semibold text-purple-600 dark:text-purple-400 block mt-1">
                      {m.sub}
                    </span>
                  </div>
                ))}
              </div>

              {/* Module Capabilities List */}
              <div className="mt-6 p-4 rounded-2xl bg-[#f5eeff]/60 dark:bg-purple-950/20 border border-emerald-200/80 dark:border-purple-900/40">
                <span className="text-xs font-bold uppercase tracking-wider text-emerald-950 dark:text-purple-300 block mb-3">
                  Activated Academic Modules in this Wing:
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {currentPreview.features.map((feat, idx) => (
                    <div key={idx} className="flex items-center gap-2 text-xs text-slate-800 dark:text-slate-200 bg-white dark:bg-slate-900/90 p-2.5 rounded-xl border border-emerald-100/90 dark:border-slate-800 shadow-2xs">
                      <CheckCircle2 className="w-4 h-4 text-purple-600 dark:text-purple-400 shrink-0" />
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
              <span className="text-xs sm:text-sm font-semibold text-purple-200 mt-1 block">Active School Students</span>
              <span className="text-[10px] text-purple-400 block mt-0.5">Across Playgroup to Grade 10</span>
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
      <section id="pricing" className="py-20 bg-gradient-to-b from-[#fcfaff] to-white dark:from-[#0F172A] dark:to-[#0B1020]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="text-center max-w-3xl mx-auto mb-12">
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-800 dark:text-purple-300 bg-[#f5eeff] dark:bg-purple-950/60 px-3 py-1 rounded-full border border-emerald-200 dark:border-purple-800/60">
              Clear &amp; Transparent SaaS Pricing
            </span>
            <h2 className="text-2xl sm:text-4xl font-extrabold text-slate-900 dark:text-white font-heading tracking-tight mt-3">
              Start with Our Free Evaluation Tier
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-2">
              Zero commitments, no credit card required. Upgrade seamlessly when your academic session scales.
            </p>

            {/* Billing Cycle Switcher */}
            <div className="inline-flex items-center gap-2 mt-6 p-1 bg-slate-100 dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800">
              <button
                onClick={() => setBillingCycle('monthly')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  billingCycle === 'monthly' ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-xs' : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                Monthly Billing
              </button>
              <button
                onClick={() => setBillingCycle('annual')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1 ${
                  billingCycle === 'annual' ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-xs' : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                <span>Annual Prepaid</span>
                <span className="text-[10px] font-bold text-emerald-800 dark:text-purple-300 bg-[#f5eeff] dark:bg-purple-950/60 px-1.5 py-0.2 rounded-full border border-emerald-200 dark:border-purple-800/60">
                  Save 15%
                </span>
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-stretch max-w-5xl mx-auto">
            
            {/* TIER 0: FREE EVALUATION TIER */}
            <div className="rounded-3xl border-2 border-emerald-400 dark:border-purple-500 bg-white dark:bg-slate-900/90 p-6 flex flex-col justify-between shadow-md dark:shadow-purple-950/30 relative overflow-hidden">
              <div className="absolute top-0 right-0 bg-emerald-500 dark:bg-purple-600 text-white text-[10px] font-extrabold uppercase tracking-widest px-3 py-1 rounded-bl-xl shadow-xs">
                Zero Risk Trial
              </div>

              <div>
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-8 h-8 rounded-lg bg-emerald-50 dark:bg-purple-950/50 text-emerald-700 dark:text-purple-300 flex items-center justify-center">
                    <Sparkles className="w-4 h-4" />
                  </div>
                  <span className="text-xs font-bold uppercase text-emerald-700 dark:text-purple-300 bg-emerald-50 dark:bg-purple-950/50 px-2 py-0.5 rounded-md border border-transparent dark:border-purple-800/50">
                    Evaluation Tier
                  </span>
                </div>

                <h3 className="text-xl font-extrabold text-slate-900 dark:text-white">14-Day Free Trial</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  Full evaluation access for schools exploring EIMS.
                </p>

                <div className="mt-4 mb-5 p-3 rounded-xl bg-emerald-50/60 dark:bg-purple-950/40 border border-emerald-100 dark:border-purple-800/50">
                  <div className="flex items-baseline gap-1 font-heading">
                    <span className="text-lg font-bold text-emerald-600 dark:text-purple-400">₨</span>
                    <span className="text-3xl sm:text-4xl font-extrabold text-emerald-700 dark:text-purple-300 tracking-tight">0</span>
                    <span className="text-xs font-bold text-emerald-700 dark:text-purple-200 bg-emerald-100 dark:bg-purple-900/50 px-2 py-0.5 rounded-full ml-1.5 border border-emerald-200 dark:border-purple-700/60">
                      FREE
                    </span>
                  </div>
                  <div className="text-xs font-medium text-emerald-900 dark:text-purple-200 mt-1">
                    100% Free / 14-Day Evaluation Access
                  </div>
                </div>

                <ul className="space-y-2.5 text-xs text-slate-600 dark:text-slate-300">
                  <li className="flex items-center gap-2">
                    <Check className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
                    <span>Up to <strong>250 Students</strong></span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
                    <span><strong>1 School Campus</strong></span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
                    <span><strong>15 Staff Accounts</strong></span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
                    <span>Core fees, attendance &amp; exams</span>
                  </li>
                </ul>
              </div>

              <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-800">
                <button
                  onClick={() => openPlanModal('trial')}
                  className="w-full py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs shadow-xs transition-colors cursor-pointer"
                >
                  Start 14-Day Free Trial
                </button>
              </div>
            </div>

            {/* TIER 1: SCHOOL PLAN */}
            <div className="rounded-3xl border border-emerald-200 dark:border-slate-800 bg-white dark:bg-slate-900/90 p-6 flex flex-col justify-between shadow-xs hover:border-emerald-300 dark:hover:border-purple-500/50 transition-all">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-8 h-8 rounded-lg bg-emerald-50 dark:bg-purple-950/50 text-emerald-800 dark:text-purple-300 flex items-center justify-center">
                    <School className="w-4 h-4" />
                  </div>
                  <span className="text-xs font-bold uppercase text-emerald-800 dark:text-purple-300 bg-[#f5eeff] dark:bg-purple-950/60 px-2 py-0.5 rounded-md border border-transparent dark:border-purple-800/50">
                    School Plan
                  </span>
                </div>

                <h3 className="text-xl font-extrabold text-slate-900 dark:text-white">Primary to Matric</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  Complete management for growing schools.
                </p>

                <div className="mt-4 mb-5 p-3 rounded-xl bg-slate-50 dark:bg-slate-950/70 border border-slate-100 dark:border-slate-800">
                  <div className="flex items-baseline gap-1 font-heading">
                    <span className="text-lg font-bold text-slate-500 dark:text-slate-400">₨</span>
                    <span className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight">
                      {billingCycle === 'annual' ? '21,250' : '25,000'}
                    </span>
                    <span className="text-xs font-medium text-slate-500 dark:text-slate-400 ml-1">/ month</span>
                  </div>
                  <div className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                    {billingCycle === 'annual' ? 'Billed annually (Save 15%)' : 'Standard monthly billing'}
                  </div>
                </div>

                <ul className="space-y-2.5 text-xs text-slate-600 dark:text-slate-300">
                  <li className="flex items-center gap-2">
                    <Check className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
                    <span>Up to <strong>1,500 Students</strong></span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
                    <span><strong>2 School Campuses</strong></span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
                    <span><strong>50 Staff Accounts</strong></span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
                    <span>1Link Barcode Fee Vouchers</span>
                  </li>
                </ul>
              </div>

              <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-800">
                <button
                  onClick={() => openPlanModal('school')}
                  className="w-full py-2.5 rounded-xl bg-emerald-50 dark:bg-slate-800 hover:bg-emerald-100 dark:hover:bg-purple-900/50 text-emerald-800 dark:text-purple-200 font-bold text-xs border border-transparent dark:border-slate-700 hover:dark:border-purple-600/50 transition-colors cursor-pointer"
                >
                  Choose School Plan
                </button>
              </div>
            </div>

            {/* TIER 2: MULTI-BRANCH SCHOOL NETWORK */}
            <div className="rounded-3xl border border-indigo-300 dark:border-indigo-800/80 ring-2 ring-indigo-500/20 dark:ring-indigo-500/10 bg-gradient-to-b from-white to-[#f5eeff]/30 dark:from-slate-900 dark:to-indigo-950/30 p-6 flex flex-col justify-between shadow-xs">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-8 h-8 rounded-lg bg-indigo-100 dark:bg-indigo-950/60 text-indigo-800 dark:text-indigo-300 flex items-center justify-center">
                    <Building2 className="w-4 h-4" />
                  </div>
                  <span className="text-xs font-bold uppercase text-indigo-800 dark:text-indigo-300 bg-white dark:bg-indigo-950/80 px-2 py-0.5 rounded-md border border-indigo-200 dark:border-indigo-800/60">
                    School Network
                  </span>
                </div>

                <h3 className="text-xl font-extrabold text-slate-900 dark:text-white">Multi-Branch Schools</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  For school chains and multi-branch groups.
                </p>

                <div className="mt-4 mb-5 p-3 rounded-xl bg-white dark:bg-slate-950/70 border border-indigo-100 dark:border-indigo-900/50 shadow-2xs">
                  <div className="flex items-baseline gap-1 font-heading">
                    <span className="text-lg font-bold text-indigo-600 dark:text-indigo-400">₨</span>
                    <span className="text-3xl sm:text-4xl font-extrabold text-indigo-800 dark:text-indigo-200 tracking-tight">
                      {billingCycle === 'annual' ? '38,250' : '45,000'}
                      <span className="text-2xl text-indigo-500 font-bold">+</span>
                    </span>
                    <span className="text-xs font-medium text-slate-500 dark:text-slate-400 ml-1">/ month</span>
                  </div>
                  <div className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                    {billingCycle === 'annual' ? 'Billed annually (Save 15%)' : 'Standard monthly billing'}
                  </div>
                </div>

                <ul className="space-y-2.5 text-xs text-slate-600 dark:text-slate-300">
                  <li className="flex items-center gap-2">
                    <Check className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
                    <span><strong>5,000+ Students</strong></span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
                    <span><strong>10+ School Branches</strong></span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
                    <span>Central Super Admin HQ Control</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
                    <span>Dedicated VIP Support &amp; SLA</span>
                  </li>
                </ul>
              </div>

              <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-800">
                <button
                  onClick={() => openPlanModal('enterprise')}
                  className="w-full py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-sm shadow-indigo-600/25 transition-all cursor-pointer"
                >
                  Activate School Network Plan
                </button>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* 8. INTERACTIVE FAQ SECTION */}
      <section id="faq" className="py-20 bg-white dark:bg-[#0B1020] border-t border-emerald-100 dark:border-slate-800/80">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="text-center mb-12">
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-800 dark:text-purple-300 bg-[#f5eeff] dark:bg-purple-950/60 px-3 py-1 rounded-full border border-emerald-200 dark:border-purple-800/60">
              Frequently Asked Questions
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white font-heading tracking-tight mt-3">
              Common Questions About ApexEd
            </h2>
          </div>

          <div className="space-y-3">
            {[
              {
                q: 'How does the 14-Day Free Evaluation Tier work?',
                a: 'The 14-day free evaluation is 100% free with no credit card required. You gain immediate access to our complete school management modules (admissions, fee challans, attendance, exams) for up to 250 students. When your trial ends, you can easily upgrade to our School Plan without losing any data.'
              },
              {
                q: 'Can we manage multiple school branches under one system?',
                a: 'Yes! Our Multi-Branch School Network plan allows school groups to govern multiple branches across cities under a single central Super Admin dashboard while maintaining isolated branch records.'
              },
              {
                q: 'Does EIMS support Pakistani 1Link, 1Bill, and JazzCash fee payments?',
                a: 'Yes, EIMS generates automated 3-copy computerized fee challans with official 1Bill / 1Link consumer reference numbers and JazzCash corporate billing integration for real-time fee reconciliation.'
              },
              {
                q: 'Is our student and school data secure and backed up?',
                a: 'Yes, every school has dedicated tenant boundaries with multi-layer encryption. Automated cloud backups are generated on a daily schedule, and administrators can export complete data backups anytime.'
              }
            ].map((faq, idx) => {
              const isOpen = expandedFaq === idx
              return (
                <div
                  key={idx}
                  className="border border-emerald-100/90 dark:border-slate-800 rounded-2xl overflow-hidden bg-[#fcfaff] dark:bg-slate-900/80 transition-all"
                >
                  <button
                    onClick={() => setExpandedFaq(isOpen ? -1 : idx)}
                    className="w-full p-4 sm:p-5 text-left flex items-center justify-between gap-4 font-bold text-xs sm:text-sm text-slate-900 dark:text-white cursor-pointer hover:bg-[#f5eeff]/50 dark:hover:bg-slate-800/60 transition-colors"
                  >
                    <span>{faq.q}</span>
                    <ChevronDown className={`w-4 h-4 text-purple-600 dark:text-purple-400 shrink-0 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
                  </button>
                  {isOpen && (
                    <div className="px-5 pb-5 text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed border-t border-emerald-100/60 dark:border-slate-800 pt-3">
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
              Ready to Streamline Your School Campus?
            </h2>
            <p className="mt-3 text-xs sm:text-sm text-purple-100 max-w-xl mx-auto">
              Join hundreds of forward-thinking primary, middle, and high schools. Experience modern school management in minutes.
            </p>
            <div className="mt-6 flex flex-col sm:flex-row items-center justify-center gap-3">
              <button
                onClick={() => setIsTrialModalOpen(true)}
                className="w-full sm:w-auto px-6 py-3 rounded-xl bg-white text-purple-900 hover:bg-purple-50 font-bold text-xs sm:text-sm shadow-md transition-all hover:scale-105 cursor-pointer flex items-center justify-center gap-2"
              >
                <Sparkles className="w-4 h-4 text-purple-600" />
                <span>Launch 14-Day Free Trial (₨ 0)</span>
              </button>
              <button
                onClick={() => onNavigateToLogin()}
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
                  <span className="text-[8px] font-bold text-purple-200 mt-1 uppercase bg-purple-950/80 px-2 py-0.5 rounded-full border border-purple-400/40">
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
                <span>ApexEd School ERP</span>
              </div>
              <p className="text-slate-400 text-xs leading-relaxed max-w-xs">
                Unified school academic operating system engineered for primary, middle, and secondary schools across Pakistan.
              </p>
            </div>

            {/* Col 2: School Wings */}
            <div>
              <span className="text-slate-200 font-bold uppercase tracking-wider text-[11px] block mb-3">
                School Wings
              </span>
              <ul className="space-y-2">
                <li><button onClick={(e) => { setActiveTab('preschool'); scrollToSection(e, 'wings'); }} className="hover:text-purple-400 transition-colors cursor-pointer">Early Years (Playgroup - KG)</button></li>
                <li><button onClick={(e) => { setActiveTab('school'); scrollToSection(e, 'wings'); }} className="hover:text-purple-400 transition-colors cursor-pointer">Primary &amp; Middle (Grades 1 - 8)</button></li>
                <li><button onClick={(e) => { setActiveTab('secondary'); scrollToSection(e, 'wings'); }} className="hover:text-purple-400 transition-colors cursor-pointer">Matric &amp; O-Levels (Grades 9 - 10)</button></li>
                <li><button onClick={(e) => { setActiveTab('custom'); scrollToSection(e, 'wings'); }} className="hover:text-purple-400 transition-colors cursor-pointer">Multi-Branch School Networks</button></li>
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

            {/* Col 4: Unified Portal Access */}
            <div>
              <span className="text-slate-200 font-bold uppercase tracking-wider text-[11px] block mb-3">
                Portal Access
              </span>
              <ul className="space-y-2">
                <li>
                  <button onClick={() => onNavigateToLogin()} className="text-purple-400 hover:text-purple-300 font-semibold flex items-center gap-1 cursor-pointer">
                    <Lock className="w-3 h-3" />
                    <span>Unified Portal Sign In</span>
                  </button>
                </li>
                <li>
                  <button onClick={() => setIsTrialModalOpen(true)} className="text-purple-400 hover:text-purple-300 font-semibold flex items-center gap-1 cursor-pointer">
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
                ? 'bg-emerald-500/70 scale-110'
                : 'bg-emerald-600/40 group-hover:bg-emerald-500/70'
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
            <div className="flex items-center gap-1 mt-1 bg-purple-950/70 px-2 py-0.5 rounded-full border border-emerald-300/40 backdrop-blur-md shadow-xs">
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
          className="fixed inset-0 z-50 flex items-center justify-center p-2.5 sm:p-4 bg-slate-900/60 dark:bg-black/80 backdrop-blur-sm animate-in fade-in duration-200"
          onClick={() => setIsTrialModalOpen(false)}
        >
          <div 
            className="bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100 rounded-3xl max-w-4xl w-full shadow-2xl border border-slate-200/90 dark:border-slate-800 relative max-h-[94vh] flex flex-col overflow-hidden animate-in zoom-in-95 duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            {/* 1. TOP STEPPER (Select Package -> Enter Details) */}
            <div className="flex items-center justify-center gap-3 sm:gap-6 py-3.5 px-6 border-b border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 shrink-0 select-none">
              <button
                type="button"
                onClick={() => setModalStep(1)}
                className="flex items-center gap-2 cursor-pointer transition-colors group"
              >
                <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                  modalStep === 1 
                    ? 'bg-purple-600 text-white ring-4 ring-purple-100 dark:ring-purple-900/50 shadow-xs' 
                    : 'bg-purple-100 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300 font-extrabold'
                }`}>
                  {modalStep === 1 ? '1' : '✓'}
                </span>
                <span className={`text-xs ${
                  modalStep === 1 ? 'text-slate-900 dark:text-white font-bold' : 'text-purple-700 dark:text-purple-300 font-semibold group-hover:text-purple-800 dark:group-hover:text-purple-200'
                }`}>
                  Select Package
                </span>
              </button>

              <div className="h-0.5 w-10 sm:w-20 bg-slate-200 dark:bg-slate-800"></div>

              <button
                type="button"
                onClick={() => setModalStep(2)}
                className="flex items-center gap-2 cursor-pointer transition-colors"
              >
                <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                  modalStep === 2 
                    ? 'bg-purple-600 text-white ring-4 ring-purple-100 dark:ring-purple-900/50 shadow-xs' 
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 border border-slate-200 dark:border-slate-700'
                }`}>
                  2
                </span>
                <span className={`text-xs ${
                  modalStep === 2 ? 'text-slate-900 dark:text-white font-bold' : 'text-slate-500 dark:text-slate-400 font-semibold'
                }`}>
                  Enter Details
                </span>
              </button>
            </div>

            {/* 2. TOP BAR (Change Plan, Selected Subscription, 14 Days testing access badge) */}
            <div className="flex flex-wrap items-center justify-between gap-3 px-5 sm:px-6 py-3.5 border-b border-slate-100 dark:border-slate-800 bg-[#f8fafc] dark:bg-slate-950/80 shrink-0">
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setModalStep(modalStep === 1 ? 2 : 1)}
                  className="px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-200 transition-colors cursor-pointer flex items-center gap-1.5 shadow-2xs"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>{modalStep === 1 ? 'Continue to Details' : 'Change Plan'}</span>
                </button>

                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 block">
                    Selected Subscription
                  </span>
                  <span className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                    <span>{(PLAN_CONFIGS[activeModalPlan] || PLAN_CONFIGS.trial).planName}</span>
                    <span className="text-purple-600 dark:text-purple-400 font-mono text-xs font-bold">
                      ({(PLAN_CONFIGS[activeModalPlan] || PLAN_CONFIGS.trial).priceDisplay})
                    </span>
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-purple-50 dark:bg-purple-950/50 text-purple-700 dark:text-purple-300 border border-purple-200/80 dark:border-purple-800/60">
                  <Clock className="w-3.5 h-3.5 text-purple-600 dark:text-purple-400" />
                  <span>14 Days full testing access</span>
                </span>

                <button
                  onClick={() => setIsTrialModalOpen(false)}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-200/60 dark:hover:bg-slate-800 transition-colors cursor-pointer"
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
                    <h3 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white font-heading">
                      Select Your Subscription Package
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                      Choose an institutional plan to proceed to credential setup and Super Admin verification.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
                    {Object.keys(PLAN_CONFIGS).map((planKey) => {
                      const p = PLAN_CONFIGS[planKey]
                      const isSelected = activeModalPlan === planKey
                      const PlanCardIcon = planKey === 'school' ? School : planKey === 'enterprise' ? Building2 : Sparkles

                      return (
                        <div
                          key={p.id}
                          onClick={() => {
                            setActiveModalPlan(planKey)
                            if (planKey === 'enterprise') setTrialForm(prev => ({ ...prev, wing: 'multi-campus' }))
                            else setTrialForm(prev => ({ ...prev, wing: 'school' }))
                            setModalStep(2)
                          }}
                          className={`p-4 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between ${
                            isSelected
                              ? 'bg-purple-50/70 dark:bg-purple-950/40 border-2 border-purple-600 dark:border-purple-500 ring-2 ring-purple-600/10 shadow-md shadow-purple-600/5'
                              : 'bg-white dark:bg-slate-950/70 border-slate-200 dark:border-slate-800 hover:border-purple-300 dark:hover:border-purple-700/60 hover:bg-slate-50/70 dark:hover:bg-slate-900/60 hover:shadow-sm'
                          }`}
                        >
                          <div>
                            <div className="flex items-center justify-between mb-3">
                              <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${p.iconBg}`}>
                                <PlanCardIcon className="w-5 h-5" />
                              </div>
                              {isSelected && (
                                <span className="text-[10px] font-bold text-purple-700 dark:text-purple-300 bg-purple-100 dark:bg-purple-900/50 px-2 py-0.5 rounded-full border border-purple-200 dark:border-purple-700/60">
                                  Active
                                </span>
                              )}
                            </div>

                            <h4 className="text-sm font-bold text-slate-900 dark:text-white">{p.planName}</h4>
                            <div className="mt-1 font-mono text-base font-extrabold text-purple-600 dark:text-purple-400">
                              {p.priceDisplay}
                            </div>
                            <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 leading-snug">
                              {p.priceSub}
                            </p>
                          </div>

                          <button
                            type="button"
                            className={`w-full mt-4 py-2 px-3 rounded-xl font-bold text-xs transition-colors flex items-center justify-center gap-1.5 cursor-pointer ${
                              isSelected
                                ? 'bg-purple-600 hover:bg-purple-700 text-white shadow-xs'
                                : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-purple-50 dark:hover:bg-purple-950/50 hover:text-purple-800 dark:hover:text-purple-200'
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
                  <div className="flex flex-wrap items-center justify-between gap-2 pb-2.5 border-b border-slate-100 dark:border-slate-800">
                    <div className="flex items-center gap-2.5">
                      <span className="w-6 h-6 rounded-full bg-purple-600 text-white flex items-center justify-center text-xs font-bold shrink-0 shadow-xs shadow-purple-600/30">
                        2
                      </span>
                      <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white font-heading">
                        Enter Your Educational Institute &amp; Admin Credentials
                      </h3>
                    </div>
                    <span className="text-[11px] text-slate-500 dark:text-slate-400">
                      Fields marked with <span className="text-rose-500 font-bold">*</span> are mandatory
                    </span>
                  </div>

                  {/* Guarantee Box */}
                  <div className="p-3.5 rounded-2xl bg-purple-50/80 dark:bg-purple-950/30 border border-purple-200 dark:border-purple-800/60 text-purple-900 dark:text-purple-200">
                    <div className="flex items-center gap-2 text-xs font-bold text-purple-800 dark:text-purple-300">
                      <Sparkles className="w-4 h-4 text-purple-600 dark:text-purple-400 shrink-0" />
                      <span>14-Day Free Evaluation Guarantee</span>
                    </div>
                    <p className="text-[11.5px] sm:text-xs text-purple-700 dark:text-purple-300/80 mt-1 leading-relaxed">
                      No credit card or payment TRX required upfront. You will receive 14 days of full feature access to test computerized fee challans, live attendance, multi-wing telemetry, and academic grading.
                    </p>
                  </div>

                  {/* Group 1: INSTITUTION & CAMPUS PROFILE */}
                  <div className="space-y-2.5 pt-1">
                    <span className="text-xs font-bold uppercase tracking-wider text-purple-800 dark:text-purple-300 flex items-center gap-1.5">
                      <Building2 className="w-3.5 h-3.5 text-purple-600 dark:text-purple-400" />
                      <span>Institution &amp; Campus Profile</span>
                    </span>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                      {/* Institution Name */}
                      <div>
                        <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1">
                          Institution / Campus Name <span className="text-rose-500">*</span>
                        </label>
                        <div className="relative">
                          <Building2 className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                          <input
                            type="text"
                            required
                            value={trialForm.instituteName}
                            onChange={(e) => setTrialForm({ ...trialForm, instituteName: e.target.value })}
                            placeholder="e.g. Beaconhouse School / City Grammar School"
                            className="w-full pl-10 pr-3.5 py-2.5 text-xs sm:text-sm bg-[#f8fafc] dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-600 rounded-xl focus:outline-none focus:bg-white dark:focus:bg-slate-900 focus:border-purple-500 dark:focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 transition-all"
                          />
                        </div>
                      </div>

                      {/* School Tier */}
                      <div>
                        <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1">
                          School Wing / Branch Type <span className="text-rose-500">*</span>
                        </label>
                        <div className="relative">
                          <School className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                          <select
                            value={trialForm.wing}
                            onChange={(e) => setTrialForm({ ...trialForm, wing: e.target.value })}
                            className="w-full pl-10 pr-8 py-2.5 text-xs sm:text-sm bg-[#f8fafc] dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white rounded-xl focus:outline-none focus:bg-white dark:focus:bg-slate-900 focus:border-purple-500 dark:focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 transition-all cursor-pointer font-medium appearance-none"
                          >
                            <option value="school">School Wing (Playgroup to Matric / O-Levels)</option>
                            <option value="preschool">Early Years / Montessori Only (Playgroup - KG)</option>
                            <option value="multi-campus">Multi-Branch School Network</option>
                          </select>
                          <ChevronDown className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                        </div>
                      </div>

                      {/* City / District */}
                      <div>
                        <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1">
                          City / District (Optional)
                        </label>
                        <div className="relative">
                          <MapPin className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                          <input
                            type="text"
                            value={trialForm.city}
                            onChange={(e) => setTrialForm({ ...trialForm, city: e.target.value })}
                            placeholder="e.g. Lahore, Karachi, Islamabad, Rawalpindi..."
                            className="w-full pl-10 pr-3.5 py-2.5 text-xs sm:text-sm bg-[#f8fafc] dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-600 rounded-xl focus:outline-none focus:bg-white dark:focus:bg-slate-900 focus:border-purple-500 dark:focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 transition-all"
                          />
                        </div>
                      </div>

                      {/* Principal / Administrator Full Name */}
                      <div>
                        <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1">
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
                            className="w-full pl-10 pr-3.5 py-2.5 text-xs sm:text-sm bg-[#f8fafc] dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-600 rounded-xl focus:outline-none focus:bg-white dark:focus:bg-slate-900 focus:border-purple-500 dark:focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 transition-all"
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Group 2: ACCOUNT ACCESS & SECURITY */}
                  <div className="space-y-2.5 pt-1">
                    <span className="text-xs font-bold uppercase tracking-wider text-purple-800 dark:text-purple-300 flex items-center gap-1.5">
                      <Lock className="w-3.5 h-3.5 text-purple-600 dark:text-purple-400" />
                      <span>Account Access &amp; Security</span>
                    </span>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                      {/* Email Address */}
                      <div>
                        <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1">
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
                            className="w-full pl-10 pr-3.5 py-2.5 text-xs sm:text-sm bg-[#f8fafc] dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-600 rounded-xl focus:outline-none focus:bg-white dark:focus:bg-slate-900 focus:border-purple-500 dark:focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 transition-all"
                          />
                        </div>
                      </div>

                      {/* Mobile / WhatsApp */}
                      <div>
                        <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1">
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
                            className="w-full pl-10 pr-3.5 py-2.5 text-xs sm:text-sm bg-[#f8fafc] dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-600 rounded-xl focus:outline-none focus:bg-white dark:focus:bg-slate-900 focus:border-purple-500 dark:focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 font-mono transition-all"
                          />
                        </div>
                      </div>

                      {/* Create Admin Password */}
                      <div>
                        <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1">
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
                            className="w-full pl-10 pr-10 py-2.5 text-xs sm:text-sm bg-[#f8fafc] dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-600 rounded-xl focus:outline-none focus:bg-white dark:focus:bg-slate-900 focus:border-purple-500 dark:focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 font-mono transition-all"
                          />
                          <button
                            type="button"
                            onClick={() => setShowAdminPassword(!showAdminPassword)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors cursor-pointer"
                            title="Toggle password visibility"
                          >
                            {showAdminPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                          </button>
                        </div>
                      </div>

                      {/* Confirm Admin Password */}
                      <div>
                        <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1 flex items-center justify-between">
                          <span>Confirm Admin Password <span className="text-rose-500">*</span></span>
                          {trialForm.confirmPassword && (
                            <span className={`text-[10px] font-bold ${
                              trialForm.adminPassword === trialForm.confirmPassword ? 'text-purple-600 dark:text-purple-400' : 'text-rose-600'
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
                            className={`w-full pl-10 pr-10 py-2.5 text-xs sm:text-sm bg-[#f8fafc] dark:bg-slate-950 border rounded-xl focus:outline-none font-mono transition-all ${
                              trialForm.confirmPassword && trialForm.adminPassword !== trialForm.confirmPassword
                                ? 'border-rose-300 dark:border-rose-800 text-slate-900 dark:text-white focus:border-rose-500 focus:ring-2 focus:ring-rose-500/20'
                                : 'border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white focus:bg-white dark:focus:bg-slate-900 focus:border-purple-500 dark:focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20'
                            }`}
                          />
                          <button
                            type="button"
                            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors cursor-pointer"
                            title="Toggle password visibility"
                          >
                            {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Plan Active Status Banner */}
                  <div className="p-3.5 rounded-2xl bg-[#f5eeff]/70 dark:bg-purple-950/40 border border-purple-200/80 dark:border-purple-800/60 flex items-start gap-3">
                    <div className="w-8 h-8 rounded-xl bg-purple-100 dark:bg-purple-900/60 text-purple-800 dark:text-purple-300 flex items-center justify-center shrink-0 mt-0.5 shadow-2xs">
                      <Sparkles className="w-4 h-4" />
                    </div>
                    <div className="flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="text-xs font-bold text-slate-900 dark:text-white">
                          {(PLAN_CONFIGS[activeModalPlan] || PLAN_CONFIGS.trial).planName} Active (100% Free / Verified)
                        </span>
                        <span className="text-[10px] font-black tracking-wider uppercase text-purple-700 dark:text-purple-300 bg-purple-100 dark:bg-purple-900/50 px-2 py-0.5 rounded-md border border-purple-200 dark:border-purple-700/60">
                          ZERO UPFRONT PAYMENT
                        </span>
                      </div>
                      <p className="text-[11.5px] text-slate-600 dark:text-slate-300 mt-1 leading-relaxed">
                        No payment, credit card, or Transaction ID is required for your trial. You will receive immediate full access to all campus features upon Super Admin review.
                      </p>
                    </div>
                  </div>

                  {/* Group 3: ADDITIONAL INSTRUCTIONS OR CUSTOM CAMPUS REQUIREMENTS */}
                  <div>
                    <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1">
                      Additional Instructions or Custom Campus Requirements (Optional)
                    </label>
                    <textarea
                      rows="3"
                      value={trialForm.notes}
                      onChange={(e) => setTrialForm({ ...trialForm, notes: e.target.value })}
                      placeholder="e.g. Multi-branch school sync, biometric machine integration, custom fee voucher format, or BISE / Cambridge grading guidelines..."
                      className="w-full px-3.5 py-2.5 text-xs sm:text-sm bg-[#f8fafc] dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-600 rounded-xl focus:outline-none focus:bg-white dark:focus:bg-slate-900 focus:border-purple-500 dark:focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 transition-all resize-y"
                    />
                  </div>

                  {/* Terms Agreement Checkbox */}
                  <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200/80 dark:border-slate-800 flex items-start gap-3">
                    <input
                      type="checkbox"
                      id="termsAgreement"
                      checked={trialForm.agreedToTerms}
                      onChange={(e) => setTrialForm({ ...trialForm, agreedToTerms: e.target.checked })}
                      className="mt-1 w-4 h-4 rounded text-purple-600 focus:ring-purple-500 border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 cursor-pointer accent-purple-600"
                    />
                    <label htmlFor="termsAgreement" className="text-xs cursor-pointer select-none">
                      <span className="font-bold text-slate-900 dark:text-white block">
                        I agree to the Terms of Service &amp; Institutional Usage Agreement.
                      </span>
                      <span className="text-[11px] text-slate-500 dark:text-slate-400 block mt-0.5 leading-relaxed">
                        I verify that all submitted educational institution information is accurate and understand my account will be activated upon Super Admin approval.
                      </span>
                    </label>
                  </div>

                  {/* Bottom Buttons */}
                  <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
                    <button
                      type="button"
                      onClick={() => setModalStep(1)}
                      className="w-full sm:w-auto px-5 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 font-semibold text-xs sm:text-sm transition-colors cursor-pointer shadow-2xs"
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

                  <div className="text-center text-[10.5px] text-slate-400 dark:text-slate-500 pt-1 leading-relaxed">
                    Your request is securely forwarded to Super Admin headquarters. Upon review &amp; approval, official portal Login ID &amp; Password will be confirmed and activated.
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
          className="fixed inset-0 z-[60] flex items-center justify-center p-3.5 sm:p-4 bg-slate-900/65 dark:bg-black/80 backdrop-blur-sm animate-in fade-in duration-300"
          onClick={() => setIsSuccessModalOpen(false)}
        >
          <div 
            className="bg-white dark:bg-slate-900 rounded-3xl max-w-lg w-full p-6 sm:p-8 text-center shadow-2xl border border-emerald-100 dark:border-slate-800 relative overflow-hidden animate-in zoom-in-95 duration-300 flex flex-col items-center"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Top decorative purple gradient bar */}
            <div className="absolute top-0 inset-x-0 h-1.5 bg-gradient-to-r from-purple-400 via-indigo-500 to-purple-600"></div>

            {/* Close Cross Button */}
            <button
              onClick={() => setIsSuccessModalOpen(false)}
              className="absolute top-4 right-4 p-1.5 rounded-full text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
              title="Close dialog"
              aria-label="Close dialog"
            >
              <X className="w-5 h-5" />
            </button>

            {/* PURPLE ANIMATED TICK / CHECKMARK BADGE */}
            <div className="relative my-3 flex items-center justify-center">
              {/* Outer Ripple / Ping Ring Animation */}
              <div className="absolute w-24 h-24 sm:w-28 sm:h-28 rounded-full bg-purple-400/25 animate-ping"></div>
              <div className="absolute w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-purple-100 dark:bg-purple-950/60 animate-pulse"></div>

              {/* Main Purple Circular Badge */}
              <div className="relative w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-gradient-to-tr from-purple-600 to-indigo-500 flex items-center justify-center shadow-xl shadow-purple-600/35 border-4 border-white dark:border-slate-800">
                <Check className="w-10 h-10 sm:w-12 sm:h-12 text-white stroke-[3.5] animate-in zoom-in-50 duration-500" />
              </div>
            </div>

            {/* Status Pill */}
            <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold mb-2 mt-1 border ${
              submittedSuccessData?.isInquiryPending !== false
                ? 'bg-amber-50 dark:bg-amber-950/40 text-amber-800 dark:text-amber-300 border-amber-200/80 dark:border-amber-800/60'
                : 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 border-emerald-200/80 dark:border-emerald-800/60'
            }`}>
              {submittedSuccessData?.isInquiryPending !== false ? (
                <>
                  <Clock className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400 animate-spin" style={{ animationDuration: '6s' }} />
                  <span>Inquiry Submitted · Awaiting Super Admin Review</span>
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                  <span>Active · Direct Registration Provisioned</span>
                </>
              )}
            </div>

            {/* Main Headline */}
            <h3 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight font-heading">
              {submittedSuccessData?.isInquiryPending !== false ? 'Inquiry Submitted Successfully!' : 'School Registered & Ready!'}
            </h3>

            {/* Narrative Explanation */}
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 mt-2 leading-relaxed max-w-md">
              {submittedSuccessData?.isInquiryPending !== false ? (
                <>Your application for <span className="font-bold text-slate-900 dark:text-white">{submittedSuccessData?.instituteName || 'your institution'}</span> has been forwarded to Super Admin School Inquiries for verification and provisioning.</>
              ) : (
                <>Your school campus <span className="font-bold text-slate-900 dark:text-white">{submittedSuccessData?.instituteName}</span> has been provisioned directly and is active. You can log in immediately.</>
              )}
            </p>

            {/* Credentials Notice */}
            <div className="w-full bg-purple-50/70 dark:bg-purple-950/30 border border-purple-200/80 dark:border-purple-800/60 rounded-2xl p-3.5 sm:p-4 my-4 text-left">
              <div className="flex items-start gap-2.5">
                <div className="w-7 h-7 rounded-xl bg-purple-600 text-white flex items-center justify-center shrink-0 shadow-xs mt-0.5">
                  <ShieldCheck className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-xs font-bold text-purple-950 dark:text-purple-200">
                    {submittedSuccessData?.isInquiryPending !== false ? 'How will you receive your credentials?' : 'Your Administrator Credentials'}
                  </div>
                  <div className="text-[11px] sm:text-xs text-purple-900/85 dark:text-purple-300 mt-1 leading-relaxed">
                    {submittedSuccessData?.isInquiryPending !== false ? (
                      <>Once the Super Administrator reviews and approves your inquiry, your official <strong className="text-purple-950 dark:text-purple-100">Portal Login ID</strong> and <strong className="text-purple-950 dark:text-purple-100">Password</strong> will be activated and dispatched.</>
                    ) : (
                      <>Your administrator account has been created with email <strong className="text-purple-950 dark:text-purple-100 font-mono">{submittedSuccessData?.email}</strong>. Use your chosen password to sign in.</>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Application Summary Box */}
            <div className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-3.5 sm:p-4 text-left text-xs space-y-2">
              <div className="flex items-center justify-between pb-2 border-b border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 font-semibold text-[11px]">
                <span>APPLICATION SUMMARY</span>
                <span className="font-mono text-purple-700 dark:text-purple-300 bg-purple-100/70 dark:bg-purple-950/80 px-2 py-0.5 rounded font-bold">
                  {submittedSuccessData?.requestId || 'APPR-PENDING'}
                </span>
              </div>
              
              <div className="flex justify-between items-center text-slate-700 dark:text-slate-300">
                <span className="text-slate-500 dark:text-slate-400">Institution:</span>
                <span className="font-bold text-slate-900 dark:text-white text-right">{submittedSuccessData?.instituteName}</span>
              </div>

              <div className="flex justify-between items-center text-slate-700 dark:text-slate-300">
                <span className="text-slate-500 dark:text-slate-400">Contact Person:</span>
                <span className="font-semibold text-slate-900 dark:text-white">{submittedSuccessData?.adminName}</span>
              </div>

              <div className="flex justify-between items-center text-slate-700 dark:text-slate-300">
                <span className="text-slate-500 dark:text-slate-400">Selected Plan:</span>
                <span className="font-bold text-purple-700 dark:text-purple-300">{submittedSuccessData?.planTier}</span>
              </div>

              <div className="flex justify-between items-center text-slate-700 dark:text-slate-300">
                <span className="text-slate-500 dark:text-slate-400">Official Email:</span>
                <span className="font-mono font-medium text-slate-900 dark:text-white">{submittedSuccessData?.email}</span>
              </div>

              <div className="flex justify-between items-center text-slate-700 dark:text-slate-300">
                <span className="text-slate-500 dark:text-slate-400">Mobile / WhatsApp:</span>
                <span className="font-mono font-medium text-slate-900 dark:text-white">{submittedSuccessData?.phone}</span>
              </div>

              <div className="flex justify-between items-center pt-1 border-t border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300">
                <span className="text-slate-500 dark:text-slate-400">Expected Approval:</span>
                <span className="font-bold text-purple-600 dark:text-purple-400 flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5 text-purple-600 dark:text-purple-400" />
                  Typically 15 – 30 Minutes
                </span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="w-full mt-3 space-y-2">
              {submittedSuccessData?.isInquiryPending === false ? (
                <button
                  type="button"
                  onClick={() => {
                    setIsSuccessModalOpen(false)
                    if (onNavigateToLogin) onNavigateToLogin()
                  }}
                  className="w-full py-3 sm:py-3.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs sm:text-sm shadow-md shadow-emerald-600/20 transition-all hover:scale-[1.01] active:scale-98 cursor-pointer flex items-center justify-center gap-2"
                >
                  <ArrowRight className="w-4 h-4 text-emerald-200" />
                  <span>Proceed to School Portal Sign In</span>
                </button>
              ) : null}

              <button
                type="button"
                onClick={() => setIsSuccessModalOpen(false)}
                className={`w-full py-3 sm:py-3.5 rounded-xl font-bold text-xs sm:text-sm transition-all hover:scale-[1.01] active:scale-98 cursor-pointer flex items-center justify-center gap-2 ${
                  submittedSuccessData?.isInquiryPending === false
                    ? 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-200'
                    : 'bg-purple-600 hover:bg-purple-700 text-white shadow-md shadow-purple-600/20'
                }`}
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>{submittedSuccessData?.isInquiryPending === false ? 'Dismiss' : 'Got it, Return to Portal Home'}</span>
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
          className="fixed bottom-5 right-5 z-40 p-3 rounded-full bg-emerald-600 hover:bg-emerald-700 text-white shadow-lg shadow-emerald-600/30 transition-all duration-200 hover:scale-110 active:scale-95 cursor-pointer flex items-center justify-center animate-in fade-in"
          title="Back to Top"
          aria-label="Back to Top"
        >
          <ArrowUp className="w-4 h-4 stroke-[2.5]" />
        </button>
      )}

      {/* Theme Studio & Design Tokens Customizer Modal */}
      <ThemeCustomizerModal
        isOpen={isThemeModalOpen}
        onClose={() => setIsThemeModalOpen(false)}
      />

    </div>
  )
}

export default LandingPage
