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
  ArrowUp
} from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import { useToast } from '../../context/ToastContext'
import { getStoredData, saveStoredData } from '../../services/dataService'

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

export const LandingPage = ({ onNavigateToLogin }) => {
  const { login } = useAuth()
  const { showToast } = useToast()

  // State
  const [activeSection, setActiveSection] = useState('hero')
  const [activeTab, setActiveTab] = useState('school') // 'school', 'college', 'university', 'custom'
  const [billingCycle, setBillingCycle] = useState('monthly') // 'monthly', 'annual'
  const [isTrialModalOpen, setIsTrialModalOpen] = useState(false)
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

  // Free Trial Form State
  const [trialForm, setTrialForm] = useState({
    instituteName: '',
    adminName: '',
    email: '',
    countryCode: '+92',
    phone: '',
    tier: 'school',
    isMultiCampus: false,
    city: 'Lahore'
  })
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

  // Smart Trial Modal Opener that pre-selects the clicked educational wing
  const handleOpenTrialModal = (targetWing = 'school') => {
    const normalized = targetWing === 'university' ? 'undergraduate' : (targetWing || activeTab || 'school')
    setTrialForm(prev => ({
      ...prev,
      tier: normalized === 'custom' ? 'school' : normalized,
      isMultiCampus: targetWing === 'custom'
    }))
    setIsTrialModalOpen(true)
  }

  // Handle Free Trial Registration
  const handleSubmitTrial = (e) => {
    e.preventDefault()
    if (!trialForm.instituteName || !trialForm.email) {
      showToast('Please enter Institute Name and Email.')
      return
    }

    setIsSubmittingTrial(true)

    setTimeout(() => {
      try {
        const fullPhone = `${trialForm.countryCode} ${trialForm.phone}`
        const newInstId = `inst-trial-${Date.now().toString().slice(-4)}`
        
        // Save new trial institute to stored data
        const currentData = getStoredData()
        // Configure exact enabled wing tiers
        const enabledTiers = trialForm.isMultiCampus
          ? [trialForm.tier, trialForm.tier === 'school' ? 'college' : 'school']
          : [trialForm.tier]

        const wingLabel = trialForm.isMultiCampus
          ? 'Multi-Wing Conglomerate'
          : trialForm.tier === 'school'
          ? 'School Wing'
          : trialForm.tier === 'college'
          ? 'College Wing'
          : 'University Wing'

        const planTierName = `Free Trial (${wingLabel})`
        const planTypeCode = trialForm.isMultiCampus
          ? 'CUSTOM'
          : trialForm.tier === 'school'
          ? 'SCHOOL'
          : trialForm.tier === 'college'
          ? 'COLLEGE'
          : 'UNIVERSITY'

        const instTypeName = trialForm.isMultiCampus
          ? 'Custom Group'
          : trialForm.tier === 'school'
          ? 'School'
          : trialForm.tier === 'college'
          ? 'College'
          : 'University'

        const newInstitute = {
          id: newInstId,
          name: trialForm.instituteName,
          code: trialForm.instituteName.replace(/[^A-Za-z0-9]/g, '').slice(0, 4).toUpperCase() || 'TRL1',
          contactPerson: trialForm.adminName || 'Principal Administrator',
          email: trialForm.email,
          phone: fullPhone,
          address: `${trialForm.city}, Pakistan`,
          city: trialForm.city,
          country: 'Pakistan',
          planTier: planTierName,
          planType: planTypeCode,
          type: instTypeName,
          subscriptionStatus: 'TRIAL',
          trialEndsAt: new Date(Date.now() + 14 * 86400000).toISOString().slice(0, 10),
          enabledTiers: enabledTiers,
          createdAt: new Date().toISOString().slice(0, 10),
          status: 'Active',
          wingsCount: enabledTiers.length,
          campusesCount: trialForm.isMultiCampus ? 2 : 1,
          studentCount: 0,
          facultyCount: 0
        }

        const updatedInstitutes = [newInstitute, ...(currentData.institutes || [])]
        saveStoredData({ ...currentData, institutes: updatedInstitutes })

        // Register in billing subscriptions
        const trialSub = {
          id: `sub-trial-${Date.now().toString().slice(-4)}`,
          instituteId: newInstId,
          instituteName: trialForm.instituteName,
          planId: `plan-trial-${trialForm.tier}`,
          planName: planTierName,
          enabledTiers: enabledTiers,
          status: 'TRIAL',
          billingCycle: '14-day trial',
          pricePKR: 0,
          startDate: new Date().toISOString().slice(0, 10),
          renewalDate: new Date(Date.now() + 14 * 86400000).toISOString().slice(0, 10),
          trialEndsAt: new Date(Date.now() + 14 * 86400000).toISOString().slice(0, 10),
          autoRenew: false,
          isWaived: false,
          waiveReason: `14-Day Free Evaluation Access (${wingLabel})`
        }

        const localSubs = localStorage.getItem('sms_institute_subscriptions')
        let subsList = []
        if (localSubs) {
          try { subsList = JSON.parse(localSubs) } catch {}
        }
        subsList.unshift(trialSub)
        localStorage.setItem('sms_institute_subscriptions', JSON.stringify(subsList))

        setIsSubmittingTrial(false)
        setIsTrialModalOpen(false)
        showToast(`Congratulations! 14-Day Free Trial initiated for ${trialForm.instituteName}.`)

        // Automatically log in as the newly created trial campus admin
        login('institute_admin', trialForm.email, true)
      } catch (err) {
        setIsSubmittingTrial(false)
        showToast('Trial activation error: ' + err.message)
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
    <div className="min-h-screen w-full bg-[#fcfaff] text-slate-900 font-sans selection:bg-purple-100 selection:text-purple-900 overflow-x-hidden relative">
      
      {/* 1. TOP ANNOUNCEMENT BANNER */}
      <div className="bg-[#f5eeff] border-b border-purple-200/80 px-4 py-2 text-center text-xs font-medium text-purple-900 flex flex-wrap items-center justify-center gap-1.5 sm:gap-2">
        <span className="w-2 h-2 rounded-full bg-purple-600 animate-pulse"></span>
        <span>
          <strong>New Release:</strong> 14-Day Free Evaluation Tier is now active for all educational institutions.
        </span>
        <button
          onClick={() => setIsTrialModalOpen(true)}
          className="ml-1 underline font-bold hover:text-purple-700 cursor-pointer inline-flex items-center gap-0.5"
        >
          <span>Claim Free Access</span>
          <ArrowRight className="w-3 h-3" />
        </button>
      </div>

      {/* 2. STICKY GLASSMORPHIC NAVBAR WITH ACTIVE HIGHLIGHT ANIMATION */}
      <header className="sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b border-purple-100 shadow-[0_4px_20px_-4px_rgba(147,51,234,0.04)] transition-all duration-200">
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

          {/* Right Action Buttons */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Prominent, Bold & Clean Portal Sign In Button */}
            <button
              type="button"
              onClick={() => onNavigateToLogin('signin')}
              className="px-3 py-1.5 sm:px-4 sm:py-2 rounded-xl bg-purple-50 hover:bg-[#f5eeff] text-purple-700 hover:text-purple-900 border-2 border-purple-300 hover:border-purple-500 font-extrabold text-xs sm:text-sm shadow-xs hover:shadow-md transition-all duration-200 hover:scale-[1.03] active:scale-95 cursor-pointer flex items-center gap-1.5 sm:gap-2 group whitespace-nowrap"
              title="Sign in to your Educational Portal"
            >
              <div className="w-4 h-4 sm:w-5 sm:h-5 rounded-lg bg-purple-100 group-hover:bg-purple-200 flex items-center justify-center text-purple-700 transition-colors shrink-0">
                <Lock className="w-3 h-3 sm:w-3.5 sm:h-3.5 stroke-[2.4]" />
              </div>
              <span className="font-heading tracking-tight">Portal Sign In</span>
              <ArrowRight className="w-3.5 h-3.5 text-purple-400 group-hover:text-purple-700 group-hover:translate-x-0.5 transition-all hidden sm:inline shrink-0" />
            </button>

            {/* Start Free Trial Button (Tablet & Desktop) */}
            <button
              type="button"
              onClick={() => setIsTrialModalOpen(true)}
              className="hidden sm:flex px-4 py-2 sm:px-4.5 sm:py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-extrabold text-xs sm:text-sm shadow-sm shadow-purple-600/25 transition-all duration-200 hover:scale-[1.03] active:scale-95 cursor-pointer items-center gap-2 whitespace-nowrap"
            >
              <Sparkles className="w-3.5 h-3.5 text-purple-200" />
              <span className="font-heading tracking-tight">Start Free Trial</span>
            </button>

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
              <ArrowRight className="w-4 h-4 ml-1" />
            </button>

            <button
              onClick={() => handleQuickDemo('superadmin')}
              className="w-full sm:w-auto px-5 py-3.5 rounded-xl bg-white hover:bg-purple-50/60 text-slate-800 border border-purple-200 font-semibold text-sm shadow-xs hover:border-purple-300 transition-all cursor-pointer flex items-center justify-center gap-2"
            >
              <Laptop className="w-4 h-4 text-purple-600" />
              <span>1-Click Live Interactive Demo</span>
            </button>
          </div>

          {/* Trust Highlights */}
          <div className="mt-10 pt-8 border-t border-purple-100 max-w-3xl mx-auto grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs font-semibold text-slate-600">
            <div className="flex items-center justify-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
              <span>₨ 0 Free Evaluation</span>
            </div>
            <div className="flex items-center justify-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
              <span>1Link & JazzCash Ready</span>
            </div>
            <div className="flex items-center justify-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
              <span>Multi-Tenant Cloud</span>
            </div>
            <div className="flex items-center justify-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
              <span>Zero Setup Fees</span>
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
                  onClick={() => setIsTrialModalOpen(true)}
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
                  onClick={() => setIsTrialModalOpen(true)}
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
                  onClick={() => setIsTrialModalOpen(true)}
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
            
            {/* Window Titlebar */}
            <div className="px-5 py-3.5 bg-slate-900 text-slate-200 flex items-center justify-between border-b border-slate-800">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-rose-500"></span>
                <span className="w-3 h-3 rounded-full bg-amber-500"></span>
                <span className="w-3 h-3 rounded-full bg-emerald-500"></span>
                <span className="text-xs font-mono text-slate-400 ml-3 hidden sm:inline">
                  https://app.apexed.pk/portal/{activeTab}
                </span>
              </div>
              <div className="flex items-center gap-2 text-[11px] font-semibold text-purple-300">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                <span>Active Session: Super Admin HQ</span>
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
                  onClick={() => setIsTrialModalOpen(true)}
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
                  onClick={() => setIsTrialModalOpen(true)}
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
                  onClick={() => setIsTrialModalOpen(true)}
                  className="w-full py-2.5 rounded-xl bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-bold text-xs transition-colors cursor-pointer"
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
                  onClick={() => setIsTrialModalOpen(true)}
                  className="w-full py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs shadow-xs transition-colors cursor-pointer"
                >
                  Contact for Enterprise
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

      {/* 11. START 14-DAY FREE TRIAL MODAL (Clean UX, Zero Corner Overflow, Sleek Scrollbar) */}
      {isTrialModalOpen && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in"
          onClick={() => setIsTrialModalOpen(false)}
        >
          {/* Outer Card: Holds border-radius and overflow-hidden so native scrollbar never clips corners */}
          <div 
            className="bg-white rounded-3xl max-w-lg w-full shadow-2xl border border-purple-100 relative max-h-[92vh] flex flex-col overflow-hidden animate-in zoom-in-95 duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header: Fixed at top with persistent close button */}
            <div className="p-5 sm:p-6 pb-3.5 relative shrink-0 border-b border-slate-100/90 bg-white">
              {/* Close Button */}
              <button
                onClick={() => setIsTrialModalOpen(false)}
                className="absolute top-4 right-4 sm:top-5 sm:right-5 p-1.5 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
                title="Close dialog"
                aria-label="Close dialog"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-[#f5eeff] text-purple-700 flex items-center justify-center shrink-0 shadow-2xs">
                  <Sparkles className="w-5 h-5" />
                </div>
                <div className="pr-8">
                  <h3 className="text-base sm:text-lg font-extrabold text-slate-900 font-heading leading-tight">
                    Start 14-Day Free Trial
                  </h3>
                  <span className="text-[11px] font-semibold text-emerald-600 block mt-0.5">
                    ₨ 0 · No Credit Card Required · Instant Activation
                  </span>
                </div>
              </div>

              <p className="text-xs text-slate-500 mt-2 leading-relaxed">
                Enter your institutional details below to immediately launch an isolated trial environment for your school or college.
              </p>
            </div>

            {/* Scrollable Form Body: Inner container with sleek modal-scrollbar */}
            <div className="overflow-y-auto p-5 sm:p-6 pt-4 modal-scrollbar flex-1">
              <form onSubmit={handleSubmitTrial} className="space-y-3.5">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Institute Name <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={trialForm.instituteName}
                  onChange={(e) => setTrialForm({ ...trialForm, instituteName: e.target.value })}
                  className="w-full px-3.5 py-2.5 text-xs sm:text-sm border border-slate-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:outline-none"
                  placeholder="e.g. Allied Grammar High School"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Principal / Admin Full Name
                </label>
                <input
                  type="text"
                  value={trialForm.adminName}
                  onChange={(e) => setTrialForm({ ...trialForm, adminName: e.target.value })}
                  className="w-full px-3.5 py-2.5 text-xs sm:text-sm border border-slate-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:outline-none"
                  placeholder="e.g. Prof. Tariq Mahmood"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Official Email Address <span className="text-rose-500">*</span>
                </label>
                <input
                  type="email"
                  required
                  value={trialForm.email}
                  onChange={(e) => setTrialForm({ ...trialForm, email: e.target.value })}
                  className="w-full px-3.5 py-2.5 text-xs sm:text-sm border border-slate-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:outline-none"
                  placeholder="e.g. principal@alliedschool.edu.pk"
                />
              </div>

              {/* Dedicated Educational Wing Selection Cards */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-xs font-bold text-slate-800">
                    Educational Wing <span className="text-rose-500">*</span>
                  </label>
                  <span className="text-[10px] font-semibold text-purple-700 bg-purple-50 px-2 py-0.5 rounded-md border border-purple-200">
                    Isolated Architecture
                  </span>
                </div>

                <div className="grid grid-cols-3 gap-2 sm:gap-2.5">
                  {/* Card 1: School */}
                  <button
                    type="button"
                    onClick={() => setTrialForm({ ...trialForm, tier: 'school' })}
                    className={`p-2.5 sm:p-3 rounded-2xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
                      trialForm.tier === 'school'
                        ? 'bg-purple-50/80 border-purple-500 ring-2 ring-purple-500/20 shadow-xs'
                        : 'bg-white border-slate-200 hover:border-purple-200 hover:bg-slate-50/60'
                    }`}
                  >
                    <div className="flex items-center justify-between w-full">
                      <div className={`w-7 h-7 rounded-xl flex items-center justify-center ${
                        trialForm.tier === 'school' ? 'bg-purple-600 text-white shadow-xs' : 'bg-slate-100 text-slate-600'
                      }`}>
                        <School className="w-4 h-4" />
                      </div>
                      {trialForm.tier === 'school' && (
                        <CheckCircle2 className="w-4 h-4 text-purple-600 shrink-0" />
                      )}
                    </div>
                    <div className="mt-2">
                      <span className="block text-xs font-bold text-slate-900 leading-tight">School</span>
                      <span className="block text-[10px] text-slate-500 leading-tight mt-0.5">Matric & Primary</span>
                    </div>
                  </button>

                  {/* Card 2: College */}
                  <button
                    type="button"
                    onClick={() => setTrialForm({ ...trialForm, tier: 'college' })}
                    className={`p-2.5 sm:p-3 rounded-2xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
                      trialForm.tier === 'college'
                        ? 'bg-indigo-50/80 border-indigo-500 ring-2 ring-indigo-500/20 shadow-xs'
                        : 'bg-white border-slate-200 hover:border-indigo-200 hover:bg-slate-50/60'
                    }`}
                  >
                    <div className="flex items-center justify-between w-full">
                      <div className={`w-7 h-7 rounded-xl flex items-center justify-center ${
                        trialForm.tier === 'college' ? 'bg-indigo-600 text-white shadow-xs' : 'bg-slate-100 text-slate-600'
                      }`}>
                        <Building2 className="w-4 h-4" />
                      </div>
                      {trialForm.tier === 'college' && (
                        <CheckCircle2 className="w-4 h-4 text-indigo-600 shrink-0" />
                      )}
                    </div>
                    <div className="mt-2">
                      <span className="block text-xs font-bold text-slate-900 leading-tight">College</span>
                      <span className="block text-[10px] text-slate-500 leading-tight mt-0.5">F.Sc & ICS (BISE)</span>
                    </div>
                  </button>

                  {/* Card 3: University */}
                  <button
                    type="button"
                    onClick={() => setTrialForm({ ...trialForm, tier: 'undergraduate' })}
                    className={`p-2.5 sm:p-3 rounded-2xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
                      trialForm.tier === 'undergraduate'
                        ? 'bg-emerald-50/80 border-emerald-500 ring-2 ring-emerald-500/20 shadow-xs'
                        : 'bg-white border-slate-200 hover:border-emerald-200 hover:bg-slate-50/60'
                    }`}
                  >
                    <div className="flex items-center justify-between w-full">
                      <div className={`w-7 h-7 rounded-xl flex items-center justify-center ${
                        trialForm.tier === 'undergraduate' ? 'bg-emerald-600 text-white shadow-xs' : 'bg-slate-100 text-slate-600'
                      }`}>
                        <GraduationCap className="w-4 h-4" />
                      </div>
                      {trialForm.tier === 'undergraduate' && (
                        <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                      )}
                    </div>
                    <div className="mt-2">
                      <span className="block text-xs font-bold text-slate-900 leading-tight">University</span>
                      <span className="block text-[10px] text-slate-500 leading-tight mt-0.5">BS & Semesters</span>
                    </div>
                  </button>
                </div>

                {/* Optional Multi-Campus / Multi-Wing Support Toggle */}
                <div className="mt-2.5 p-2.5 rounded-xl bg-slate-50 border border-slate-200/80 flex items-start gap-2.5">
                  <input
                    type="checkbox"
                    id="multiCampusToggle"
                    checked={trialForm.isMultiCampus}
                    onChange={(e) => setTrialForm({ ...trialForm, isMultiCampus: e.target.checked })}
                    className="mt-0.5 w-4 h-4 rounded text-purple-600 focus:ring-purple-500 border-slate-300 cursor-pointer"
                  />
                  <label htmlFor="multiCampusToggle" className="text-xs cursor-pointer select-none">
                    <span className="font-bold text-slate-900 flex items-center gap-1.5">
                      <span>Enable Multi-Campus / Multi-Wing Network</span>
                      <span className="text-[10px] font-bold text-purple-700 bg-purple-100/70 px-1.5 py-0.2 rounded border border-purple-200">Optional</span>
                    </span>
                    <span className="text-[11px] text-slate-500 block mt-0.5 leading-snug">
                      Combine multiple school, college, or university branches under one unified central headquarters.
                    </span>
                  </label>
                </div>
              </div>

              {/* Phone and City in 2 Columns */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Phone Number
                  </label>
                  <div className="flex">
                    <span className="inline-flex items-center px-2.5 rounded-l-xl border border-r-0 border-slate-200 bg-slate-50 text-xs font-semibold text-slate-600">
                      +92
                    </span>
                    <input
                      type="text"
                      value={trialForm.phone}
                      onChange={(e) => setTrialForm({ ...trialForm, phone: e.target.value })}
                      className="w-full px-3 py-2 text-xs border border-slate-200 rounded-r-xl focus:ring-2 focus:ring-purple-500 focus:outline-none font-mono"
                      placeholder="300 1234567"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    City
                  </label>
                  <select
                    value={trialForm.city}
                    onChange={(e) => setTrialForm({ ...trialForm, city: e.target.value })}
                    className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:outline-none bg-white font-medium"
                  >
                    <option value="Lahore">Lahore</option>
                    <option value="Islamabad">Islamabad</option>
                    <option value="Rawalpindi">Rawalpindi</option>
                    <option value="Karachi">Karachi</option>
                    <option value="Faisalabad">Faisalabad</option>
                    <option value="Multan">Multan</option>
                    <option value="Peshawar">Peshawar</option>
                    <option value="Quetta">Quetta</option>
                    <option value="Other">Other City</option>
                  </select>
                </div>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={isSubmittingTrial}
                  className="w-full py-3 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs sm:text-sm shadow-md shadow-purple-600/25 transition-all cursor-pointer flex items-center justify-center gap-2"
                >
                  {isSubmittingTrial ? (
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4 text-purple-200" />
                      <span>Activate 14-Day Free Trial</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </div>

              <div className="text-center text-[10px] text-slate-400 pt-1">
                By activating, your evaluation instance will be initialized instantly under our standard privacy and multi-tenant security policies.
              </div>
            </form>
          </div>
        </div>
      </div>
      )}

      {/* 12. FLOATING USER INTERACTION & RESPONSE WIDGETS */}
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
