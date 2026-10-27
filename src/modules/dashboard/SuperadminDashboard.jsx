import React, { useState } from 'react'
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
  AlertTriangle,
  X,
  ShieldCheck,
  GraduationCap,
  Copy,
  Check,
  CreditCard,
  MoreVertical,
  ChevronRight,
  Activity,
  Award
} from 'lucide-react'
import Modal from '../../components/common/Modal'
import { useAppData } from '../../context/AppDataContext'
import { AnalyticsService } from '../../services/analyticsService'

export const SuperadminDashboard = ({ onRouteChange, onOpenSettings }) => {
  const { 
    stats, 
    recentActivity = [], 
    addItem, 
    institutes = [],
    notices = [],
    sendCommunicationBlast
  } = useAppData()
  
  const [isNoticeDismissed, setIsNoticeDismissed] = useState(false)
  const urgentNotice = (notices || []).find(n => n.category === 'Urgent' || n.priority === 'Urgent' || n.pinned)
  
  // Modals state
  const [isUserModalOpen, setIsUserModalOpen] = useState(false)
  const [isInstituteModalOpen, setIsInstituteModalOpen] = useState(false)
  const [isBroadcastModalOpen, setIsBroadcastModalOpen] = useState(false)
  
  // Feedback toast state
  const [feedbackToast, setFeedbackToast] = useState(null)
  const [reportSuccess, setReportSuccess] = useState(false)

  // Selected row state for interactive table
  const [selectedCampusIds, setSelectedCampusIds] = useState(() => {
    return institutes.slice(0, 1).map(i => i.id)
  })

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

  const toggleSelectCampus = (id) => {
    setSelectedCampusIds(prev => 
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    )
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

      {/* Urgent Notice Alert Banner */}
      {urgentNotice && !isNoticeDismissed && (
        <div className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-2xl p-4 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4 animate-in fade-in">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/20 backdrop-blur-md flex items-center justify-center shrink-0">
              <AlertTriangle className="w-5 h-5 text-amber-200 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-extrabold uppercase tracking-wider px-2 py-0.5 rounded bg-black/25 text-purple-100">
                  PLATFORM DIRECTIVE
                </span>
                <span className="text-xs text-purple-200">{urgentNotice.date}</span>
              </div>
              <h3 className="text-sm font-bold mt-0.5 leading-snug">{urgentNotice.title}</h3>
              <p className="text-xs text-purple-100 line-clamp-1 mt-0.5">{urgentNotice.content}</p>
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={() => onRouteChange('announcements')}
              className="px-3.5 py-1.5 bg-white text-purple-900 rounded-xl text-xs font-bold hover:bg-white/90 transition-all shadow-xs"
            >
              View Directives
            </button>
            <button
              onClick={() => setIsNoticeDismissed(true)}
              className="p-1.5 hover:bg-white/20 rounded-lg text-white/80 hover:text-white transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* 1. Header Row */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
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
        </div>

        {/* Action Shortcuts */}
        <div className="flex items-center gap-2.5">
          <button
            onClick={() => setIsInstituteModalOpen(true)}
            className="px-4 py-2.5 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-xs font-semibold shadow-sm shadow-purple-600/25 transition-all flex items-center gap-1.5 cursor-pointer active:scale-95"
          >
            <Plus className="w-4 h-4" />
            <span>Add Campus</span>
          </button>
          <button
            onClick={() => onRouteChange('platform-modules')}
            className="px-4 py-2.5 bg-white hover:bg-purple-50/60 border border-slate-200 text-slate-700 hover:text-purple-700 rounded-xl text-xs font-semibold transition-all flex items-center gap-1.5 cursor-pointer shadow-2xs"
          >
            <Sliders className="w-4 h-4 text-purple-600" />
            <span>Wings Matrix</span>
          </button>
        </div>
      </div>

      {/* 2. Top Row: 4 Pastel Colored KPI Cards (Exact "ia Academy" reference style) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
        
        {/* Card 1: Students / Campuses (Lavender) */}
        <div 
          onClick={() => onRouteChange('institutes')}
          className="bg-[#f5eeff] border border-purple-100/80 rounded-2xl p-5 sm:p-6 transition-all duration-200 hover:shadow-sm cursor-pointer group flex items-center justify-between"
        >
          <div>
            <span className="block text-xs font-semibold text-slate-500 mb-1">
              Total Campuses
            </span>
            <span className="text-2xl sm:text-3xl font-extrabold text-slate-900 font-heading">
              {stats.totalInstitutes || 12}
            </span>
            <div className="flex items-center gap-1.5 mt-2">
              <span className="text-[11px] font-semibold text-purple-700">
                {stats.activeInstitutes || 12} Active
              </span>
              <span className="text-slate-300">•</span>
              <span className="text-[11px] text-purple-600/80 group-hover:underline flex items-center gap-0.5">
                Manage <ArrowUpRight className="w-3 h-3 inline" />
              </span>
            </div>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-white/70 text-purple-600 flex items-center justify-center shrink-0 shadow-2xs group-hover:scale-105 transition-transform">
            <School className="w-6 h-6 stroke-[1.8]" />
          </div>
        </div>

        {/* Card 2: Total Students (Sky Blue) */}
        <div 
          onClick={() => onRouteChange('institutes')}
          className="bg-[#f0f9ff] border border-sky-100/80 rounded-2xl p-5 sm:p-6 transition-all duration-200 hover:shadow-sm cursor-pointer group flex items-center justify-between"
        >
          <div>
            <span className="block text-xs font-semibold text-slate-500 mb-1">
              Total Students
            </span>
            <span className="text-2xl sm:text-3xl font-extrabold text-slate-900 font-heading">
              {stats.totalStudents ? `${(stats.totalStudents / 1000).toFixed(2)}K` : '15.00K'}
            </span>
            <div className="flex items-center gap-1.5 mt-2">
              <span className="text-[11px] font-semibold text-sky-700">
                +12.4% MoM
              </span>
              <span className="text-slate-300">•</span>
              <span className="text-[11px] text-sky-600/80 group-hover:underline flex items-center gap-0.5">
                All Wings <ArrowUpRight className="w-3 h-3 inline" />
              </span>
            </div>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-white/70 text-sky-500 flex items-center justify-center shrink-0 shadow-2xs group-hover:scale-105 transition-transform">
            <GraduationCap className="w-6 h-6 stroke-[1.8]" />
          </div>
        </div>

        {/* Card 3: Educational Wings (Peach / Amber) */}
        <div 
          onClick={() => onRouteChange('platform-modules')}
          className="bg-[#fff7ed] border border-amber-100/80 rounded-2xl p-5 sm:p-6 transition-all duration-200 hover:shadow-sm cursor-pointer group flex items-center justify-between"
        >
          <div>
            <span className="block text-xs font-semibold text-slate-500 mb-1">
              Educational Wings
            </span>
            <span className="text-2xl sm:text-3xl font-extrabold text-slate-900 font-heading">
              3 Wings
            </span>
            <div className="flex items-center gap-1.5 mt-2">
              <span className="text-[11px] font-semibold text-amber-700">
                School • College • Uni
              </span>
              <span className="text-slate-300">•</span>
              <span className="text-[11px] text-amber-600/80 group-hover:underline flex items-center gap-0.5">
                Matrix <ArrowUpRight className="w-3 h-3 inline" />
              </span>
            </div>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-white/70 text-amber-500 flex items-center justify-center shrink-0 shadow-2xs group-hover:scale-105 transition-transform">
            <Sliders className="w-6 h-6 stroke-[1.8]" />
          </div>
        </div>

        {/* Card 4: Platform Earnings / Revenue (Mint Green) */}
        <div 
          onClick={() => onRouteChange('platform-billing')}
          className="bg-[#f0fdf4] border border-emerald-100/80 rounded-2xl p-5 sm:p-6 transition-all duration-200 hover:shadow-sm cursor-pointer group flex items-center justify-between"
        >
          <div>
            <span className="block text-xs font-semibold text-slate-500 mb-1">
              Platform MRR
            </span>
            <span className="text-2xl sm:text-3xl font-extrabold text-slate-900 font-heading">
              {stats.monthlyRevenue || '$19.3K'}
            </span>
            <div className="flex items-center gap-1.5 mt-2">
              <span className="text-[11px] font-semibold text-emerald-700">
                4 Tier Plans
              </span>
              <span className="text-slate-300">•</span>
              <span className="text-[11px] text-emerald-600/80 group-hover:underline flex items-center gap-0.5">
                Billing <ArrowUpRight className="w-3 h-3 inline" />
              </span>
            </div>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-white/70 text-emerald-500 flex items-center justify-center shrink-0 shadow-2xs group-hover:scale-105 transition-transform">
            <CreditCard className="w-6 h-6 stroke-[1.8]" />
          </div>
        </div>

      </div>

      {/* 3. Middle Section: Dual Bar Chart & Educational Wings Donut Ring */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        
        {/* Left Card (7 cols): Campus Performance Chart matching "All Exam Result" */}
        <div className="lg:col-span-7 bg-white rounded-3xl p-6 sm:p-7 border border-slate-100 shadow-[0_2px_15px_rgba(0,0,0,0.02)] flex flex-col justify-between">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-base font-bold text-slate-900 tracking-tight font-heading">
                Campus Performance & Wing Activity
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Monthly distribution: School Wings vs College & University Wings
              </p>
            </div>
            
            {/* Legend dots */}
            <div className="flex items-center gap-4 text-xs font-medium">
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-purple-600"></span>
                <span className="text-slate-600">School Wing</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-orange-500"></span>
                <span className="text-slate-600">College / Uni</span>
              </div>
            </div>
          </div>

          {/* Clean Dual Bar SVG Chart matching reference */}
          <div className="pt-4 pb-2">
            <div className="h-56 w-full flex items-end justify-between gap-2 sm:gap-3 px-2">
              {[
                { m: 'Jan', v1: 45, v2: 60 },
                { m: 'Feb', v1: 52, v2: 56 },
                { m: 'Mar', v1: 40, v2: 68 },
                { m: 'Apr', v1: 75, v2: 65 },
                { m: 'May', v1: 100, v2: 80 },
                { m: 'Jun', v1: 60, v2: 70 },
                { m: 'Jul', v1: 45, v2: 55 },
                { m: 'Aug', v1: 72, v2: 60 },
                { m: 'Sep', v1: 90, v2: 72 },
                { m: 'Oct', v1: 65, v2: 52 },
                { m: 'Nov', v1: 80, v2: 65 },
                { m: 'Dec', v1: 95, v2: 78 }
              ].map((item, idx) => (
                <div key={idx} className="flex-1 flex flex-col items-center gap-2 group">
                  <div className="w-full flex items-end justify-center gap-1 h-44">
                    {/* Purple bar */}
                    <div 
                      className="w-2 sm:w-2.5 rounded-t-full bg-purple-600 transition-all duration-300 group-hover:bg-purple-700"
                      style={{ height: `${item.v1}%` }}
                      title={`School Wing: ${item.v1}%`}
                    ></div>
                    {/* Orange bar */}
                    <div 
                      className="w-2 sm:w-2.5 rounded-t-full bg-orange-500 transition-all duration-300 group-hover:bg-orange-600"
                      style={{ height: `${item.v2}%` }}
                      title={`College/Uni: ${item.v2}%`}
                    ></div>
                  </div>
                  <span className="text-[11px] font-medium text-slate-400 group-hover:text-slate-700 transition-colors">
                    {item.m}
                  </span>
                </div>
              ))}
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
                  Total
                </span>
                <span className="text-2xl font-extrabold text-slate-900 font-heading">
                  15,000
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
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-base font-bold text-slate-900 tracking-tight font-heading">
                Registered Campuses & Wings
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Active educational institutions and enabled tier structures
              </p>
            </div>
            <button 
              onClick={() => onRouteChange('institutes')}
              className="text-xs font-semibold text-purple-600 hover:text-purple-700 cursor-pointer"
            >
              View All ({institutes.length})
            </button>
          </div>

          {/* Clean Data Table matching reference */}
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-100 text-slate-400 font-semibold text-[11px] uppercase tracking-wider">
                  <th className="py-3 px-2 w-8">
                    <span className="sr-only">Select</span>
                  </th>
                  <th className="py-3 px-3">Campus Name</th>
                  <th className="py-3 px-3">Code</th>
                  <th className="py-3 px-3">Active Wings</th>
                  <th className="py-3 px-3">Plan Tier</th>
                  <th className="py-3 px-3 text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {institutes && institutes.length > 0 ? (
                  institutes.slice(0, 5).map((inst) => {
                    const isSelected = selectedCampusIds.includes(inst.id)
                    const wings = inst.enabledTiers || ['school']
                    return (
                      <tr 
                        key={inst.id}
                        className={`hover:bg-slate-50/80 transition-colors group cursor-pointer ${
                          isSelected ? 'bg-purple-50/30' : ''
                        }`}
                        onClick={() => toggleSelectCampus(inst.id)}
                      >
                        {/* Checkbox with purple checked style */}
                        <td className="py-3.5 px-2">
                          <input 
                            type="checkbox"
                            checked={isSelected}
                            onChange={() => toggleSelectCampus(inst.id)}
                            className="w-4 h-4 rounded border-slate-300 text-purple-600 focus:ring-purple-500 cursor-pointer"
                          />
                        </td>

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
                            {wings.includes('undergraduate') && (
                              <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-blue-50 text-blue-700">
                                Uni
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
                    <td colSpan={6} className="py-8 text-center text-xs text-slate-400">
                      No campuses registered yet. Click "Add Campus" to register your first institute.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
          {/* Clean Table Footer matching reference */}
          <div className="pt-4 mt-auto border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
            <span>Showing {Math.min(5, (institutes || []).length)} of {(institutes || []).length} registered campuses</span>
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
