import React, { useState, useEffect } from 'react'
import { 
  Home,
  LayoutDashboard, 
  Users, 
  Building2, 
  ChevronDown, 
  ChevronUp, 
  ChevronLeft, 
  ChevronRight, 
  School, 
  LogOut, 
  X, 
  Megaphone, 
  MessageSquare, 
  ShieldCheck, 
  Sliders, 
  BarChart3, 
  CreditCard, 
  FileSpreadsheet, 
  Database, 
  Activity,
  Lock,
  GraduationCap,
  UserPlus,
  ArrowLeftRight,
  GitMerge,
  Hash,
  FileCheck,
  Award,
  ShieldAlert,
  Calendar,
  Layers,
  DollarSign,
  Briefcase,
  TrendingUp,
  FileText,
  CheckSquare,
  RefreshCw,
  FileBadge,
  Clock,
  BookOpen,
  RotateCcw,
  Cpu,
  AlertTriangle,
  Receipt,
  Tag,
  Wallet,
  QrCode,
  Truck,
  UserCheck,
  Hotel,
  HeartHandshake,
  Laptop,
  Video,
  BookMarked,
  Mail,
  AlertOctagon,
  History,
  Share2,
  Settings,
  Globe,
  Key
} from 'lucide-react'
import { useAuth } from '../../context/AuthContext'

export const SuperadminSidebar = ({ 
  currentRoute, 
  onRouteChange, 
  isMobileOpen = false, 
  onCloseMobile = () => {} 
}) => {
  const { user, logout } = useAuth()
  const [collapsed, setCollapsed] = useState(false)
  
  const isPlatformRoute = ['institutes', 'support-approvals', 'platform-billing', 'platform-modules', 'cross-institute-analytics'].includes(currentRoute)
  const isUserRoute = ['users-all', 'users-roles', 'security-center'].includes(currentRoute)
  const isOperationsRoute = ['system-health', 'audit-logs', 'backup-data', 'communication', 'announcements', 'global-templates'].includes(currentRoute)
  const isStudentsRoute = typeof currentRoute === 'string' && currentRoute.startsWith('sa-students-')
  const isAdmissionsRoute = typeof currentRoute === 'string' && currentRoute.startsWith('sa-admissions-')
  const isStaffRoute = typeof currentRoute === 'string' && currentRoute.startsWith('sa-staff-')
  const isExamsRoute = typeof currentRoute === 'string' && currentRoute.startsWith('sa-exams-')
  const isAcademicsRoute = typeof currentRoute === 'string' && currentRoute.startsWith('sa-academics-')
  const isAttendanceRoute = typeof currentRoute === 'string' && currentRoute.startsWith('sa-attendance-')
  const isFeesRoute = typeof currentRoute === 'string' && currentRoute.startsWith('sa-fees-')
  const isAccountsRoute = typeof currentRoute === 'string' && currentRoute.startsWith('sa-accounts-')
  const isCertificatesRoute = typeof currentRoute === 'string' && currentRoute.startsWith('sa-certificates-')
  const isServicesRoute = typeof currentRoute === 'string' && currentRoute.startsWith('sa-services-')
  const isLearningRoute = typeof currentRoute === 'string' && currentRoute.startsWith('sa-learning-')
  const isCommunicationRoute = typeof currentRoute === 'string' && currentRoute.startsWith('sa-comm-')
  const isReportsRoute = typeof currentRoute === 'string' && currentRoute.startsWith('sa-reports-')
  const isPoliciesRoute = typeof currentRoute === 'string' && currentRoute.startsWith('sa-policies-')
  const isSettingsRoute = typeof currentRoute === 'string' && currentRoute.startsWith('sa-settings-')

  // Dynamic pending approval count synced in real-time
  const [pendingApprovalsCount, setPendingApprovalsCount] = useState(0)
  const [campusesCount, setCampusesCount] = useState(0)

  useEffect(() => {
    const updateCount = () => {
      try {
        const raw = localStorage.getItem('sms_approval_requests')
        if (raw) {
          const list = JSON.parse(raw)
          if (Array.isArray(list)) {
            const pending = list.filter(a => a && a.status === 'PENDING')
            setPendingApprovalsCount(pending.length)
            return
          }
        }
        setPendingApprovalsCount(0)
      } catch {
        setPendingApprovalsCount(0)
      }
    }

    const updateCampusCount = () => {
      try {
        const raw = localStorage.getItem('sms_institutes') || localStorage.getItem('app_data')
        if (raw) {
          const parsed = JSON.parse(raw)
          if (Array.isArray(parsed)) {
            setCampusesCount(parsed.length)
            return
          } else if (parsed && Array.isArray(parsed.institutes)) {
            setCampusesCount(parsed.institutes.length)
            return
          }
        }
        setCampusesCount(0)
      } catch {
        setCampusesCount(0)
      }
    }

    updateCount()
    updateCampusCount()
    window.addEventListener('sms_approval_created', updateCount)
    window.addEventListener('sms_approvals_updated', updateCount)
    window.addEventListener('sms_institutes_updated', updateCampusCount)
    window.addEventListener('storage', updateCount)
    window.addEventListener('storage', updateCampusCount)
    return () => {
      window.removeEventListener('sms_approval_created', updateCount)
      window.removeEventListener('sms_approvals_updated', updateCount)
      window.removeEventListener('sms_institutes_updated', updateCampusCount)
      window.removeEventListener('storage', updateCount)
      window.removeEventListener('storage', updateCampusCount)
    }
  }, [])

  // Accordion states with smart auto-open for active routes
  const [platformOpen, setPlatformOpen] = useState(true)
  const [usersOpen, setUsersOpen] = useState(isUserRoute)
  const [operationsOpen, setOperationsOpen] = useState(isOperationsRoute)
  const [studentsOpen, setStudentsOpen] = useState(isStudentsRoute)
  const [admissionsOpen, setAdmissionsOpen] = useState(isAdmissionsRoute)
  const [staffFacultyOpen, setStaffFacultyOpen] = useState(isStaffRoute)
  const [examsResultsOpen, setExamsResultsOpen] = useState(isExamsRoute)
  const [academicsOpen, setAcademicsOpen] = useState(isAcademicsRoute)
  const [attendanceOpen, setAttendanceOpen] = useState(isAttendanceRoute)
  const [feesOpen, setFeesOpen] = useState(isFeesRoute)
  const [accountsOpen, setAccountsOpen] = useState(isAccountsRoute)
  const [certificatesOpen, setCertificatesOpen] = useState(isCertificatesRoute)
  const [servicesOpen, setServicesOpen] = useState(isServicesRoute)
  const [learningOpen, setLearningOpen] = useState(isLearningRoute)
  const [communicationOpen, setCommunicationOpen] = useState(isCommunicationRoute)
  const [reportsOpen, setReportsOpen] = useState(isReportsRoute)
  const [policiesOpen, setPoliciesOpen] = useState(isPoliciesRoute)
  const [settingsOpen, setSettingsOpen] = useState(isSettingsRoute)

  const closeAllGroups = () => {
    setPlatformOpen(false)
    setUsersOpen(false)
    setOperationsOpen(false)
    setStudentsOpen(false)
    setAdmissionsOpen(false)
    setStaffFacultyOpen(false)
    setExamsResultsOpen(false)
    setAcademicsOpen(false)
    setAttendanceOpen(false)
    setFeesOpen(false)
    setAccountsOpen(false)
    setCertificatesOpen(false)
    setServicesOpen(false)
    setLearningOpen(false)
    setCommunicationOpen(false)
    setReportsOpen(false)
    setPoliciesOpen(false)
    setSettingsOpen(false)
  }

  // Auto-expand active group and collapse inactive groups on route navigation
  useEffect(() => {
    if (isPlatformRoute) { closeAllGroups(); setPlatformOpen(true); return; }
    if (isUserRoute) { closeAllGroups(); setUsersOpen(true); return; }
    if (isOperationsRoute) { closeAllGroups(); setOperationsOpen(true); return; }
    if (isStudentsRoute) { closeAllGroups(); setStudentsOpen(true); return; }
    if (isAdmissionsRoute) { closeAllGroups(); setAdmissionsOpen(true); return; }
    if (isStaffRoute) { closeAllGroups(); setStaffFacultyOpen(true); return; }
    if (isExamsRoute) { closeAllGroups(); setExamsResultsOpen(true); return; }
    if (isAcademicsRoute) { closeAllGroups(); setAcademicsOpen(true); return; }
    if (isAttendanceRoute) { closeAllGroups(); setAttendanceOpen(true); return; }
    if (isFeesRoute) { closeAllGroups(); setFeesOpen(true); return; }
    if (isAccountsRoute) { closeAllGroups(); setAccountsOpen(true); return; }
    if (isCertificatesRoute) { closeAllGroups(); setCertificatesOpen(true); return; }
    if (isServicesRoute) { closeAllGroups(); setServicesOpen(true); return; }
    if (isLearningRoute) { closeAllGroups(); setLearningOpen(true); return; }
    if (isCommunicationRoute) { closeAllGroups(); setCommunicationOpen(true); return; }
    if (isReportsRoute) { closeAllGroups(); setReportsOpen(true); return; }
    if (isPoliciesRoute) { closeAllGroups(); setPoliciesOpen(true); return; }
    if (isSettingsRoute) { closeAllGroups(); setSettingsOpen(true); return; }
  }, [currentRoute])

  const isRouteActive = (route) => currentRoute === route

  const handleNavClick = (route) => {
    onRouteChange(route)
    if (isMobileOpen) {
      onCloseMobile()
    }
  }

  return (
    <>
      {/* Mobile Backdrop */}
      {isMobileOpen && (
        <div 
          onClick={onCloseMobile}
          className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-40 lg:hidden"
        />
      )}

      <aside 
        className={`
          fixed lg:static top-0 bottom-0 left-0 z-50
          ${isMobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
          ${collapsed ? 'lg:w-20' : 'w-64'} 
          h-full max-h-screen bg-white text-slate-700 flex flex-col 
          transition-all duration-300 shrink-0 border-r border-slate-100 shadow-[1px_0_15px_rgba(0,0,0,0.02)] select-none
        `}
      >
        {/* Top Brand Header */}
        <div className="h-16 sm:h-20 min-h-[64px] sm:min-h-[80px] flex items-center justify-between px-4 sm:px-5 border-b border-slate-100 shrink-0">
          <div className="flex items-center gap-2.5 overflow-hidden">
            <div className="w-9 h-9 rounded-xl bg-[#f5eeff] text-purple-700 border border-purple-100 flex items-center justify-center shrink-0 font-bold text-xs shadow-2xs">
              <ShieldCheck className="w-5 h-5 text-purple-600" />
            </div>
            {(!collapsed || isMobileOpen) && (
              <div className="flex flex-col truncate">
                <span className="text-sm font-extrabold text-slate-900 tracking-tight font-heading leading-tight">
                  Super Admin
                </span>
                <span className="text-[10px] text-purple-600 font-bold uppercase tracking-wider">
                  Platform Console
                </span>
              </div>
            )}
          </div>
          
          {/* Mobile Close Button */}
          <button 
            onClick={onCloseMobile}
            className="lg:hidden text-slate-400 hover:text-slate-700 p-1.5 rounded-lg hover:bg-slate-100 transition-colors ml-auto cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Desktop Collapse Button */}
          <button 
            onClick={() => setCollapsed(!collapsed)}
            className="hidden lg:block text-slate-400 hover:text-slate-700 p-1.5 rounded-lg hover:bg-slate-100 transition-colors ml-auto cursor-pointer"
            title={collapsed ? "Expand Sidebar" : "Collapse Sidebar"}
          >
            {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
          </button>
        </div>

        {/* Navigation Menu */}
        <div className="flex-1 py-4 px-3 space-y-1 overflow-y-auto dark-scroll text-[13.5px]">
          {/* 1. Dashboard */}
          <div className="relative">
            {isRouteActive('dashboard') && (
              <div className="absolute left-0 top-1.5 bottom-1.5 w-1 bg-purple-600 rounded-full z-10"></div>
            )}
            <button
              onClick={() => handleNavClick('dashboard')}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl transition-all text-left cursor-pointer group ${
                isRouteActive('dashboard')
                  ? 'bg-[#f5eeff] text-purple-700 font-semibold shadow-2xs'
                  : 'text-slate-500 hover:text-slate-900 hover:bg-slate-50/80'
              }`}
            >
              <Home className={`w-[18px] h-[18px] shrink-0 transition-colors ${
                isRouteActive('dashboard') ? 'text-purple-600' : 'text-slate-400 group-hover:text-slate-600'
              }`} />
              {(!collapsed || isMobileOpen) && <span>Dashboard</span>}
            </button>
          </div>



          {/* Section Divider & Quick Collapse */}
          {(!collapsed || isMobileOpen) && (
            <div className="pt-3 pb-1 px-3 flex items-center justify-between text-[10px] font-bold uppercase tracking-wider text-slate-400">
              <span>Governance Modules</span>
              <button
                type="button"
                onClick={closeAllGroups}
                className="hover:text-purple-600 transition-colors cursor-pointer lowercase font-medium"
                title="Collapse all sections"
              >
                collapse all
              </button>
            </div>
          )}

          {/* 2. Group: Campuses & Wings */}
          <div className="pt-1">
            <button
              onClick={() => {
                if (collapsed) setCollapsed(false)
                setPlatformOpen(!platformOpen)
              }}
              className="w-full flex items-center justify-between px-3 py-2 rounded-xl text-slate-500 hover:text-slate-800 hover:bg-slate-50/80 transition-colors cursor-pointer group"
            >
              <div className="flex items-center gap-3">
                <School className="w-[18px] h-[18px] text-slate-400 group-hover:text-purple-600 transition-colors shrink-0" />
                {(!collapsed || isMobileOpen) && (
                  <span className="font-medium text-slate-600 group-hover:text-slate-900">
                    Campuses & Wings
                  </span>
                )}
              </div>
              {(!collapsed || isMobileOpen) && (
                platformOpen ? <ChevronUp className="w-3.5 h-3.5 text-slate-400" /> : <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
              )}
            </button>

            {(!collapsed || isMobileOpen) && platformOpen && (
              <div className="mt-1 pl-3.5 space-y-1 border-l-2 border-slate-100 ml-5">
                <div className="relative">
                  {isRouteActive('institutes') && (
                    <div className="absolute -left-[16px] top-1.5 bottom-1.5 w-1 bg-purple-600 rounded-full z-10"></div>
                  )}
                  <button
                    onClick={() => handleNavClick('institutes')}
                    className={`w-full flex items-center justify-between text-left py-2 px-2.5 rounded-lg text-[13px] transition-all cursor-pointer ${
                      isRouteActive('institutes')
                        ? 'bg-[#f5eeff] text-purple-700 font-semibold'
                        : 'text-slate-500 hover:text-slate-900 hover:bg-slate-50'
                    }`}
                  >
                    <div className="flex items-center gap-2.5 truncate">
                      <Building2 className={`w-3.5 h-3.5 shrink-0 ${isRouteActive('institutes') ? 'text-purple-600' : 'text-slate-400'}`} />
                      <span className="truncate">All Campuses</span>
                    </div>
                    {campusesCount > 0 && (
                      <span className="px-1.5 py-0.5 text-[10px] font-bold bg-slate-100 text-slate-600 rounded-md shrink-0">
                        {campusesCount}
                      </span>
                    )}
                  </button>
                </div>

                <div className="relative">
                  {isRouteActive('support-approvals') && (
                    <div className="absolute -left-[16px] top-1.5 bottom-1.5 w-1 bg-purple-600 rounded-full z-10"></div>
                  )}
                  <button
                    onClick={() => handleNavClick('support-approvals')}
                    className={`w-full flex items-center justify-between text-left py-2 px-2.5 rounded-lg text-[13px] transition-all cursor-pointer ${
                      isRouteActive('support-approvals')
                        ? 'bg-[#f5eeff] text-purple-700 font-semibold'
                        : 'text-slate-500 hover:text-slate-900 hover:bg-slate-50'
                    }`}
                  >
                    <div className="flex items-center gap-2.5 truncate">
                      <CheckSquare className={`w-3.5 h-3.5 shrink-0 ${isRouteActive('support-approvals') ? 'text-purple-600' : 'text-amber-500'}`} />
                      <span className="truncate">Pending Approvals</span>
                    </div>
                    {pendingApprovalsCount > 0 && (
                      <span className="px-1.5 py-0.2 text-[10px] font-extrabold bg-amber-500 text-white rounded-full shadow-2xs shrink-0 animate-in fade-in">
                        {pendingApprovalsCount}
                      </span>
                    )}
                  </button>
                </div>

                <div className="relative">
                  {isRouteActive('platform-modules') && (
                    <div className="absolute -left-[16px] top-1.5 bottom-1.5 w-1 bg-purple-600 rounded-full z-10"></div>
                  )}
                  <button
                    onClick={() => handleNavClick('platform-modules')}
                    className={`w-full flex items-center gap-2.5 text-left py-2 px-2.5 rounded-lg text-[13px] transition-all cursor-pointer ${
                      isRouteActive('platform-modules')
                        ? 'bg-[#f5eeff] text-purple-700 font-semibold'
                        : 'text-slate-500 hover:text-slate-900 hover:bg-slate-50'
                    }`}
                  >
                    <Sliders className={`w-3.5 h-3.5 shrink-0 ${isRouteActive('platform-modules') ? 'text-purple-600' : 'text-slate-400'}`} />
                    <span>Wings Matrix</span>
                  </button>
                </div>

                <div className="relative">
                  {isRouteActive('platform-billing') && (
                    <div className="absolute -left-[16px] top-1.5 bottom-1.5 w-1 bg-purple-600 rounded-full z-10"></div>
                  )}
                  <button
                    onClick={() => handleNavClick('platform-billing')}
                    className={`w-full flex items-center gap-2.5 text-left py-2 px-2.5 rounded-lg text-[13px] transition-all cursor-pointer ${
                      isRouteActive('platform-billing')
                        ? 'bg-[#f5eeff] text-purple-700 font-semibold'
                        : 'text-slate-500 hover:text-slate-900 hover:bg-slate-50'
                    }`}
                  >
                    <CreditCard className={`w-3.5 h-3.5 shrink-0 ${isRouteActive('platform-billing') ? 'text-purple-600' : 'text-slate-400'}`} />
                    <span>Subscriptions & Billing</span>
                  </button>
                </div>

                <div className="relative">
                  {isRouteActive('cross-institute-analytics') && (
                    <div className="absolute -left-[16px] top-1.5 bottom-1.5 w-1 bg-purple-600 rounded-full z-10"></div>
                  )}
                  <button
                    onClick={() => handleNavClick('cross-institute-analytics')}
                    className={`w-full flex items-center gap-2.5 text-left py-2 px-2.5 rounded-lg text-[13px] transition-all cursor-pointer ${
                      isRouteActive('cross-institute-analytics')
                        ? 'bg-[#f5eeff] text-purple-700 font-semibold'
                        : 'text-slate-500 hover:text-slate-900 hover:bg-slate-50'
                    }`}
                  >
                    <BarChart3 className={`w-3.5 h-3.5 shrink-0 ${isRouteActive('cross-institute-analytics') ? 'text-purple-600' : 'text-slate-400'}`} />
                    <span>Cross-Campus Analytics</span>
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* 3. Group: Users & Roles */}
          <div className="pt-2">
            <button
              onClick={() => {
                if (collapsed) setCollapsed(false)
                setUsersOpen(!usersOpen)
              }}
              className={`w-full flex items-center justify-between px-3 py-2 rounded-xl transition-colors cursor-pointer group ${
                isUserRoute 
                  ? 'bg-purple-50/70 text-purple-900 font-semibold shadow-2xs' 
                  : 'text-slate-500 hover:text-slate-800 hover:bg-slate-50/80'
              }`}
            >
              <div className="flex items-center gap-3">
                <Users className={`w-[18px] h-[18px] transition-colors shrink-0 ${isUserRoute ? 'text-purple-600' : 'text-slate-400 group-hover:text-purple-600'}`} />
                {(!collapsed || isMobileOpen) && (
                  <span className={`font-medium ${isUserRoute ? 'text-purple-900 font-bold' : 'text-slate-600 group-hover:text-slate-900'}`}>
                    Users & Roles
                  </span>
                )}
              </div>
              {(!collapsed || isMobileOpen) && (
                usersOpen ? <ChevronUp className="w-3.5 h-3.5 text-slate-400" /> : <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
              )}
            </button>
            
            {(!collapsed || isMobileOpen) && usersOpen && (
              <div className="mt-1 pl-3.5 space-y-1 border-l-2 border-slate-100 ml-5">
                <div className="relative">
                  {isRouteActive('users-all') && (
                    <div className="absolute -left-[16px] top-1.5 bottom-1.5 w-1 bg-purple-600 rounded-full z-10"></div>
                  )}
                  <button
                    onClick={() => handleNavClick('users-all')}
                    className={`w-full flex items-center gap-2.5 text-left py-2 px-2.5 rounded-lg text-[13px] transition-all cursor-pointer ${
                      isRouteActive('users-all')
                        ? 'bg-[#f5eeff] text-purple-700 font-semibold'
                        : 'text-slate-500 hover:text-slate-900 hover:bg-slate-50'
                    }`}
                  >
                    <Users className={`w-3.5 h-3.5 shrink-0 ${isRouteActive('users-all') ? 'text-purple-600' : 'text-slate-400'}`} />
                    <span>All Platform Users</span>
                  </button>
                </div>

                <div className="relative">
                  {isRouteActive('users-roles') && (
                    <div className="absolute -left-[16px] top-1.5 bottom-1.5 w-1 bg-purple-600 rounded-full z-10"></div>
                  )}
                  <button
                    onClick={() => handleNavClick('users-roles')}
                    className={`w-full flex items-center gap-2.5 text-left py-2 px-2.5 rounded-lg text-[13px] transition-all cursor-pointer ${
                      isRouteActive('users-roles')
                        ? 'bg-[#f5eeff] text-purple-700 font-semibold'
                        : 'text-slate-500 hover:text-slate-900 hover:bg-slate-50'
                    }`}
                  >
                    <ShieldCheck className={`w-3.5 h-3.5 shrink-0 ${isRouteActive('users-roles') ? 'text-purple-600' : 'text-slate-400'}`} />
                    <span>Roles & Permissions</span>
                  </button>
                </div>

                <div className="relative">
                  {isRouteActive('security-center') && (
                    <div className="absolute -left-[16px] top-1.5 bottom-1.5 w-1 bg-purple-600 rounded-full z-10"></div>
                  )}
                  <button
                    onClick={() => handleNavClick('security-center')}
                    className={`w-full flex items-center justify-between py-2 px-2.5 rounded-lg text-[13px] transition-all cursor-pointer ${
                      isRouteActive('security-center')
                        ? 'bg-[#f5eeff] text-purple-700 font-semibold'
                        : 'text-slate-500 hover:text-slate-900 hover:bg-slate-50'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <Lock className={`w-3.5 h-3.5 shrink-0 ${isRouteActive('security-center') ? 'text-purple-600' : 'text-slate-400'}`} />
                      <span>Security & Access</span>
                    </div>
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse shrink-0" title="Live Perimeter & Session Protection Active" />
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* 4. Group: Operations & System */}
          <div className="pt-2">
            <button
              onClick={() => {
                if (collapsed) setCollapsed(false)
                setOperationsOpen(!operationsOpen)
              }}
              className="w-full flex items-center justify-between px-3 py-2 rounded-xl text-slate-500 hover:text-slate-800 hover:bg-slate-50/80 transition-colors cursor-pointer group"
            >
              <div className="flex items-center gap-3">
                <Database className="w-[18px] h-[18px] text-slate-400 group-hover:text-purple-600 transition-colors shrink-0" />
                {(!collapsed || isMobileOpen) && (
                  <span className="font-medium text-slate-600 group-hover:text-slate-900">
                    Operations & Health
                  </span>
                )}
              </div>
              {(!collapsed || isMobileOpen) && (
                operationsOpen ? <ChevronUp className="w-3.5 h-3.5 text-slate-400" /> : <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
              )}
            </button>

            {(!collapsed || isMobileOpen) && operationsOpen && (
              <div className="mt-1 pl-3.5 space-y-1 border-l-2 border-slate-100 ml-5">
                <div className="relative">
                  {isRouteActive('system-health') && (
                    <div className="absolute -left-[16px] top-1.5 bottom-1.5 w-1 bg-purple-600 rounded-full z-10"></div>
                  )}
                  <button
                    onClick={() => handleNavClick('system-health')}
                    className={`w-full flex items-center gap-2.5 text-left py-2 px-2.5 rounded-lg text-[13px] transition-all cursor-pointer ${
                      isRouteActive('system-health')
                        ? 'bg-[#f5eeff] text-purple-700 font-semibold'
                        : 'text-slate-500 hover:text-slate-900 hover:bg-slate-50'
                    }`}
                  >
                    <Activity className={`w-3.5 h-3.5 shrink-0 ${isRouteActive('system-health') ? 'text-purple-600' : 'text-slate-400'}`} />
                    <span>System Health</span>
                  </button>
                </div>

                <div className="relative">
                  {isRouteActive('audit-logs') && (
                    <div className="absolute -left-[16px] top-1.5 bottom-1.5 w-1 bg-purple-600 rounded-full z-10"></div>
                  )}
                  <button
                    onClick={() => handleNavClick('audit-logs')}
                    className={`w-full flex items-center gap-2.5 text-left py-2 px-2.5 rounded-lg text-[13px] transition-all cursor-pointer ${
                      isRouteActive('audit-logs')
                        ? 'bg-[#f5eeff] text-purple-700 font-semibold'
                        : 'text-slate-500 hover:text-slate-900 hover:bg-slate-50'
                    }`}
                  >
                    <ShieldCheck className={`w-3.5 h-3.5 shrink-0 ${isRouteActive('audit-logs') ? 'text-purple-600' : 'text-slate-400'}`} />
                    <span>Audit Logs</span>
                  </button>
                </div>

                <div className="relative">
                  {isRouteActive('backup-data') && (
                    <div className="absolute -left-[16px] top-1.5 bottom-1.5 w-1 bg-purple-600 rounded-full z-10"></div>
                  )}
                  <button
                    onClick={() => handleNavClick('backup-data')}
                    className={`w-full flex items-center gap-2.5 text-left py-2 px-2.5 rounded-lg text-[13px] transition-all cursor-pointer ${
                      isRouteActive('backup-data')
                        ? 'bg-[#f5eeff] text-purple-700 font-semibold'
                        : 'text-slate-500 hover:text-slate-900 hover:bg-slate-50'
                    }`}
                  >
                    <Database className={`w-3.5 h-3.5 shrink-0 ${isRouteActive('backup-data') ? 'text-purple-600' : 'text-slate-400'}`} />
                    <span>Backup & Data</span>
                  </button>
                </div>

                <div className="relative">
                  {isRouteActive('communication') && (
                    <div className="absolute -left-[16px] top-1.5 bottom-1.5 w-1 bg-purple-600 rounded-full z-10"></div>
                  )}
                  <button
                    onClick={() => handleNavClick('communication')}
                    className={`w-full flex items-center gap-2.5 text-left py-2 px-2.5 rounded-lg text-[13px] transition-all cursor-pointer ${
                      isRouteActive('communication')
                        ? 'bg-[#f5eeff] text-purple-700 font-semibold'
                        : 'text-slate-500 hover:text-slate-900 hover:bg-slate-50'
                    }`}
                  >
                    <MessageSquare className={`w-3.5 h-3.5 shrink-0 ${isRouteActive('communication') ? 'text-purple-600' : 'text-slate-400'}`} />
                    <span>Gateway Alerts</span>
                  </button>
                </div>

                <div className="relative">
                  {isRouteActive('announcements') && (
                    <div className="absolute -left-[16px] top-1.5 bottom-1.5 w-1 bg-purple-600 rounded-full z-10"></div>
                  )}
                  <button
                    onClick={() => handleNavClick('announcements')}
                    className={`w-full flex items-center gap-2.5 text-left py-2 px-2.5 rounded-lg text-[13px] transition-all cursor-pointer ${
                      isRouteActive('announcements')
                        ? 'bg-[#f5eeff] text-purple-700 font-semibold'
                        : 'text-slate-500 hover:text-slate-900 hover:bg-slate-50'
                    }`}
                  >
                    <Megaphone className={`w-3.5 h-3.5 shrink-0 ${isRouteActive('announcements') ? 'text-purple-600' : 'text-slate-400'}`} />
                    <span>Announcements & Broadcasts</span>
                  </button>
                </div>

                <div className="relative">
                  {isRouteActive('global-templates') && (
                    <div className="absolute -left-[16px] top-1.5 bottom-1.5 w-1 bg-purple-600 rounded-full z-10"></div>
                  )}
                  <button
                    onClick={() => handleNavClick('global-templates')}
                    className={`w-full flex items-center gap-2.5 text-left py-2 px-2.5 rounded-lg text-[13px] transition-all cursor-pointer ${
                      isRouteActive('global-templates')
                        ? 'bg-[#f5eeff] text-purple-700 font-semibold'
                        : 'text-slate-500 hover:text-slate-900 hover:bg-slate-50'
                    }`}
                  >
                    <FileSpreadsheet className={`w-3.5 h-3.5 shrink-0 ${isRouteActive('global-templates') ? 'text-purple-600' : 'text-slate-400'}`} />
                    <span>Global Templates</span>
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* 5. Group: Students */}
          <div className="pt-2">
            <button
              onClick={() => {
                if (collapsed) setCollapsed(false)
                setStudentsOpen(!studentsOpen)
              }}
              className="w-full flex items-center justify-between px-3 py-2 rounded-xl text-slate-500 hover:text-slate-800 hover:bg-slate-50/80 transition-colors cursor-pointer group"
            >
              <div className="flex items-center gap-3">
                <GraduationCap className="w-[18px] h-[18px] text-slate-400 group-hover:text-purple-600 transition-colors shrink-0" />
                {(!collapsed || isMobileOpen) && (
                  <span className="font-medium text-slate-600 group-hover:text-slate-900">
                    Students
                  </span>
                )}
              </div>
              {(!collapsed || isMobileOpen) && (
                studentsOpen ? <ChevronUp className="w-3.5 h-3.5 text-slate-400" /> : <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
              )}
            </button>

            {(!collapsed || isMobileOpen) && studentsOpen && (
              <div className="mt-1 pl-3.5 space-y-1 border-l-2 border-slate-100 ml-5">
                {[
                  { route: 'sa-students-all', label: 'All Students (Cross-Campus)', icon: Users },
                  { route: 'sa-students-transfers', label: 'Inter-Campus Transfers', icon: ArrowLeftRight },
                  { route: 'sa-students-duplicate', label: 'Duplicate & Merge Records', icon: GitMerge },
                  { route: 'sa-students-id-rules', label: 'ID / Roll Number Rules', icon: Hash },
                  { route: 'sa-students-verification', label: 'Document Verification', icon: FileCheck },
                  { route: 'sa-students-alumni', label: 'Alumni & Degree Verification', icon: Award },
                  { route: 'sa-students-privacy', label: 'Data & Privacy Requests', icon: ShieldAlert },
                  { route: 'sa-students-reports', label: 'Student Reports', icon: BarChart3 }
                ].map(item => {
                  const ItemIcon = item.icon
                  const active = isRouteActive(item.route)
                  return (
                    <div key={item.route} className="relative">
                      {active && (
                        <div className="absolute -left-[16px] top-1.5 bottom-1.5 w-1 bg-purple-600 rounded-full z-10"></div>
                      )}
                      <button
                        onClick={() => handleNavClick(item.route)}
                        className={`w-full flex items-center gap-2.5 text-left py-2 px-2.5 rounded-lg text-[13px] transition-all cursor-pointer ${
                          active
                            ? 'bg-[#f5eeff] text-purple-700 font-semibold'
                            : 'text-slate-500 hover:text-slate-900 hover:bg-slate-50'
                        }`}
                      >
                        <ItemIcon className={`w-3.5 h-3.5 shrink-0 ${active ? 'text-purple-600' : 'text-slate-400'}`} />
                        <span className="truncate">{item.label}</span>
                      </button>
                    </div>
                  )
                })}
              </div>
            )}
          </div>

          {/* 6. Group: Admissions */}
          <div className="pt-2">
            <button
              onClick={() => {
                if (collapsed) setCollapsed(false)
                setAdmissionsOpen(!admissionsOpen)
              }}
              className="w-full flex items-center justify-between px-3 py-2 rounded-xl text-slate-500 hover:text-slate-800 hover:bg-slate-50/80 transition-colors cursor-pointer group"
            >
              <div className="flex items-center gap-3">
                <UserPlus className="w-[18px] h-[18px] text-slate-400 group-hover:text-purple-600 transition-colors shrink-0" />
                {(!collapsed || isMobileOpen) && (
                  <span className="font-medium text-slate-600 group-hover:text-slate-900">
                    Admissions
                  </span>
                )}
              </div>
              {(!collapsed || isMobileOpen) && (
                admissionsOpen ? <ChevronUp className="w-3.5 h-3.5 text-slate-400" /> : <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
              )}
            </button>

            {(!collapsed || isMobileOpen) && admissionsOpen && (
              <div className="mt-1 pl-3.5 space-y-1 border-l-2 border-slate-100 ml-5">
                {[
                  { route: 'sa-admissions-cycles', label: 'Admission Cycles', icon: Calendar },
                  { route: 'sa-admissions-merit', label: 'Entry Test & Merit Policies', icon: Award },
                  { route: 'sa-admissions-seats', label: 'Seat Matrix & Waitlist', icon: Layers },
                  { route: 'sa-admissions-fees', label: 'Application Fee Settings', icon: DollarSign },
                  { route: 'sa-admissions-overview', label: 'Admissions Overview', icon: LayoutDashboard }
                ].map(item => {
                  const ItemIcon = item.icon
                  const active = isRouteActive(item.route)
                  return (
                    <div key={item.route} className="relative">
                      {active && (
                        <div className="absolute -left-[16px] top-1.5 bottom-1.5 w-1 bg-purple-600 rounded-full z-10"></div>
                      )}
                      <button
                        onClick={() => handleNavClick(item.route)}
                        className={`w-full flex items-center gap-2.5 text-left py-2 px-2.5 rounded-lg text-[13px] transition-all cursor-pointer ${
                          active
                            ? 'bg-[#f5eeff] text-purple-700 font-semibold'
                            : 'text-slate-500 hover:text-slate-900 hover:bg-slate-50'
                        }`}
                      >
                        <ItemIcon className={`w-3.5 h-3.5 shrink-0 ${active ? 'text-purple-600' : 'text-slate-400'}`} />
                        <span className="truncate">{item.label}</span>
                      </button>
                    </div>
                  )
                })}
              </div>
            )}
          </div>

          {/* 7. Group: Staff & Faculty */}
          <div className="pt-2">
            <button
              onClick={() => {
                if (collapsed) setCollapsed(false)
                setStaffFacultyOpen(!staffFacultyOpen)
              }}
              className="w-full flex items-center justify-between px-3 py-2 rounded-xl text-slate-500 hover:text-slate-800 hover:bg-slate-50/80 transition-colors cursor-pointer group"
            >
              <div className="flex items-center gap-3">
                <Briefcase className="w-[18px] h-[18px] text-slate-400 group-hover:text-purple-600 transition-colors shrink-0" />
                {(!collapsed || isMobileOpen) && (
                  <span className="font-medium text-slate-600 group-hover:text-slate-900">
                    Staff & Faculty
                  </span>
                )}
              </div>
              {(!collapsed || isMobileOpen) && (
                staffFacultyOpen ? <ChevronUp className="w-3.5 h-3.5 text-slate-400" /> : <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
              )}
            </button>

            {(!collapsed || isMobileOpen) && staffFacultyOpen && (
              <div className="mt-1 pl-3.5 space-y-1 border-l-2 border-slate-100 ml-5">
                {[
                  { route: 'sa-staff-all', label: 'All Staff (Cross-Campus)', icon: Users },
                  { route: 'sa-staff-roles', label: 'Staff Role Assignments', icon: ShieldCheck },
                  { route: 'sa-staff-transfers', label: 'Inter-Campus Staff Transfers', icon: ArrowLeftRight },
                  { route: 'sa-staff-payroll', label: 'Leave & Payroll Policies', icon: CreditCard },
                  { route: 'sa-staff-reports', label: 'Evaluation & Staff Reports', icon: TrendingUp }
                ].map(item => {
                  const ItemIcon = item.icon
                  const active = isRouteActive(item.route)
                  return (
                    <div key={item.route} className="relative">
                      {active && (
                        <div className="absolute -left-[16px] top-1.5 bottom-1.5 w-1 bg-purple-600 rounded-full z-10"></div>
                      )}
                      <button
                        onClick={() => handleNavClick(item.route)}
                        className={`w-full flex items-center gap-2.5 text-left py-2 px-2.5 rounded-lg text-[13px] transition-all cursor-pointer ${
                          active
                            ? 'bg-[#f5eeff] text-purple-700 font-semibold'
                            : 'text-slate-500 hover:text-slate-900 hover:bg-slate-50'
                        }`}
                      >
                        <ItemIcon className={`w-3.5 h-3.5 shrink-0 ${active ? 'text-purple-600' : 'text-slate-400'}`} />
                        <span className="truncate">{item.label}</span>
                      </button>
                    </div>
                  )
                })}
              </div>
            )}
          </div>

          {/* 8. Group: Examinations & Results */}
          <div className="pt-2">
            <button
              onClick={() => {
                if (collapsed) setCollapsed(false)
                setExamsResultsOpen(!examsResultsOpen)
              }}
              className="w-full flex items-center justify-between px-3 py-2 rounded-xl text-slate-500 hover:text-slate-800 hover:bg-slate-50/80 transition-colors cursor-pointer group"
            >
              <div className="flex items-center gap-3">
                <FileSpreadsheet className="w-[18px] h-[18px] text-slate-400 group-hover:text-purple-600 transition-colors shrink-0" />
                {(!collapsed || isMobileOpen) && (
                  <span className="font-medium text-slate-600 group-hover:text-slate-900">
                    Examinations & Results
                  </span>
                )}
              </div>
              {(!collapsed || isMobileOpen) && (
                examsResultsOpen ? <ChevronUp className="w-3.5 h-3.5 text-slate-400" /> : <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
              )}
            </button>

            {(!collapsed || isMobileOpen) && examsResultsOpen && (
              <div className="mt-1 pl-3.5 space-y-1 border-l-2 border-slate-100 ml-5">
                {[
                  { route: 'sa-exams-policies', label: 'Exam Policies & Datesheet Rules', icon: FileText },
                  { route: 'sa-exams-results-wing', label: 'Results Overview (Wing-wise)', icon: BarChart3 },
                  { route: 'sa-exams-publish-freeze', label: 'Result Publish / Freeze', icon: Lock },
                  { route: 'sa-exams-grade-approvals', label: 'Grade Change & Re-checking Approvals', icon: CheckSquare },
                  { route: 'sa-exams-supplementary', label: 'Supplementary Exams', icon: RefreshCw },
                  { route: 'sa-exams-transcripts', label: 'DMC / Transcript Templates', icon: FileBadge },
                  { route: 'sa-exams-reports', label: 'Examination Reports', icon: FileSpreadsheet }
                ].map(item => {
                  const ItemIcon = item.icon
                  const active = isRouteActive(item.route)
                  return (
                    <div key={item.route} className="relative">
                      {active && (
                        <div className="absolute -left-[16px] top-1.5 bottom-1.5 w-1 bg-purple-600 rounded-full z-10"></div>
                      )}
                      <button
                        onClick={() => handleNavClick(item.route)}
                        className={`w-full flex items-center gap-2.5 text-left py-2 px-2.5 rounded-lg text-[13px] transition-all cursor-pointer ${
                          active
                            ? 'bg-[#f5eeff] text-purple-700 font-semibold'
                            : 'text-slate-500 hover:text-slate-900 hover:bg-slate-50'
                        }`}
                      >
                        <ItemIcon className={`w-3.5 h-3.5 shrink-0 ${active ? 'text-purple-600' : 'text-slate-400'}`} />
                        <span className="truncate">{item.label}</span>
                      </button>
                    </div>
                  )
                })}
              </div>
            )}
          </div>

          {/* 9. Group: Academics */}
          <div className="pt-2">
            <button
              onClick={() => {
                if (collapsed) setCollapsed(false)
                setAcademicsOpen(!academicsOpen)
              }}
              className="w-full flex items-center justify-between px-3 py-2 rounded-xl text-slate-500 hover:text-slate-800 hover:bg-slate-50/80 transition-colors cursor-pointer group"
            >
              <div className="flex items-center gap-3">
                <BookOpen className="w-[18px] h-[18px] text-slate-400 group-hover:text-purple-600 transition-colors shrink-0" />
                {(!collapsed || isMobileOpen) && (
                  <span className="font-medium text-slate-600 group-hover:text-slate-900">
                    Academics
                  </span>
                )}
              </div>
              {(!collapsed || isMobileOpen) && (
                academicsOpen ? <ChevronUp className="w-3.5 h-3.5 text-slate-400" /> : <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
              )}
            </button>

            {(!collapsed || isMobileOpen) && academicsOpen && (
              <div className="mt-1 pl-3.5 space-y-1 border-l-2 border-slate-100 ml-5">
                {[
                  { route: 'sa-academics-sessions', label: 'Sessions & Calendars', icon: Calendar },
                  { route: 'sa-academics-school-struct', label: 'School Structure (Class, Section, Grade)', icon: School },
                  { route: 'sa-academics-college-struct', label: 'College Structure (Program, Year, Group)', icon: Layers },
                  { route: 'sa-academics-university-struct', label: 'University Structure (Faculty, Dept, Semester)', icon: Building2 },
                  { route: 'sa-academics-curriculum', label: 'Subjects & Curriculum Templates', icon: BookOpen },
                  { route: 'sa-academics-grading', label: 'Grading Schemes', icon: Award },
                  { route: 'sa-academics-timetable', label: 'Timetable Rules & Room Allocation', icon: Clock },
                  { route: 'sa-academics-rollover', label: 'Academic Year Rollover', icon: RotateCcw }
                ].map(item => {
                  const ItemIcon = item.icon
                  const active = isRouteActive(item.route)
                  return (
                    <div key={item.route} className="relative">
                      {active && (
                        <div className="absolute -left-[16px] top-1.5 bottom-1.5 w-1 bg-purple-600 rounded-full z-10"></div>
                      )}
                      <button
                        onClick={() => handleNavClick(item.route)}
                        className={`w-full flex items-center gap-2.5 text-left py-2 px-2.5 rounded-lg text-[13px] transition-all cursor-pointer ${
                          active
                            ? 'bg-[#f5eeff] text-purple-700 font-semibold'
                            : 'text-slate-500 hover:text-slate-900 hover:bg-slate-50'
                        }`}
                      >
                        <ItemIcon className={`w-3.5 h-3.5 shrink-0 ${active ? 'text-purple-600' : 'text-slate-400'}`} />
                        <span className="truncate">{item.label}</span>
                      </button>
                    </div>
                  )
                })}
              </div>
            )}
          </div>

          {/* 10. Group: Attendance */}
          <div className="pt-2">
            <button
              onClick={() => {
                if (collapsed) setCollapsed(false)
                setAttendanceOpen(!attendanceOpen)
              }}
              className="w-full flex items-center justify-between px-3 py-2 rounded-xl text-slate-500 hover:text-slate-800 hover:bg-slate-50/80 transition-colors cursor-pointer group"
            >
              <div className="flex items-center gap-3">
                <Clock className="w-[18px] h-[18px] text-slate-400 group-hover:text-purple-600 transition-colors shrink-0" />
                {(!collapsed || isMobileOpen) && (
                  <span className="font-medium text-slate-600 group-hover:text-slate-900">
                    Attendance
                  </span>
                )}
              </div>
              {(!collapsed || isMobileOpen) && (
                attendanceOpen ? <ChevronUp className="w-3.5 h-3.5 text-slate-400" /> : <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
              )}
            </button>

            {(!collapsed || isMobileOpen) && attendanceOpen && (
              <div className="mt-1 pl-3.5 space-y-1 border-l-2 border-slate-100 ml-5">
                {[
                  { route: 'sa-attendance-overview', label: 'Attendance Overview (Campus / Wing-wise)', icon: Clock },
                  { route: 'sa-attendance-rules', label: 'Attendance Rules (Minimum %, Shortage Alerts)', icon: ShieldCheck },
                  { route: 'sa-attendance-defaulters', label: 'Shortage & Defaulters List', icon: AlertTriangle },
                  { route: 'sa-attendance-leave', label: 'Leave Policies & Approvals', icon: Calendar },
                  { route: 'sa-attendance-corrections', label: 'Attendance Correction Approvals', icon: FileCheck },
                  { route: 'sa-attendance-staff', label: 'Staff Attendance Overview', icon: Users },
                  { route: 'sa-attendance-biometric', label: 'Biometric / RFID Device Integrations', icon: Cpu },
                  { route: 'sa-attendance-reports', label: 'Attendance Reports', icon: BarChart3 }
                ].map(item => {
                  const ItemIcon = item.icon
                  const active = isRouteActive(item.route)
                  return (
                    <div key={item.route} className="relative">
                      {active && (
                        <div className="absolute -left-[16px] top-1.5 bottom-1.5 w-1 bg-purple-600 rounded-full z-10"></div>
                      )}
                      <button
                        onClick={() => handleNavClick(item.route)}
                        className={`w-full flex items-center gap-2.5 text-left py-2 px-2.5 rounded-lg text-[13px] transition-all cursor-pointer ${
                          active
                            ? 'bg-[#f5eeff] text-purple-700 font-semibold'
                            : 'text-slate-500 hover:text-slate-900 hover:bg-slate-50'
                        }`}
                      >
                        <ItemIcon className={`w-3.5 h-3.5 shrink-0 ${active ? 'text-purple-600' : 'text-slate-400'}`} />
                        <span className="truncate">{item.label}</span>
                      </button>
                    </div>
                  )
                })}
              </div>
            )}
          </div>

          {/* 11. Group: Fees & Finance */}
          <div className="pt-2">
            <button
              onClick={() => {
                if (collapsed) setCollapsed(false)
                setFeesOpen(!feesOpen)
              }}
              className="w-full flex items-center justify-between px-3 py-2 rounded-xl text-slate-500 hover:text-slate-800 hover:bg-slate-50/80 transition-colors cursor-pointer group"
            >
              <div className="flex items-center gap-3">
                <DollarSign className="w-[18px] h-[18px] text-slate-400 group-hover:text-purple-600 transition-colors shrink-0" />
                {(!collapsed || isMobileOpen) && (
                  <span className="font-medium text-slate-600 group-hover:text-slate-900">
                    Fees & Finance
                  </span>
                )}
              </div>
              {(!collapsed || isMobileOpen) && (
                feesOpen ? <ChevronUp className="w-3.5 h-3.5 text-slate-400" /> : <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
              )}
            </button>

            {(!collapsed || isMobileOpen) && feesOpen && (
              <div className="mt-1 pl-3.5 space-y-1 border-l-2 border-slate-100 ml-5">
                {[
                  { route: 'sa-fees-structure', label: 'Fee Structure Templates', icon: DollarSign },
                  { route: 'sa-fees-late-rules', label: 'Late Fee & Installment Rules', icon: Calendar },
                  { route: 'sa-fees-installments', label: 'Installment Plans', icon: Layers },
                  { route: 'sa-fees-challans', label: 'Fee Challan Templates', icon: Receipt },
                  { route: 'sa-fees-scholarships', label: 'Scholarships & Discount Policies', icon: Award },
                  { route: 'sa-fees-vouchers', label: 'Vouchers & Promotions', icon: Tag },
                  { route: 'sa-fees-collection', label: 'Collection Overview (Campus-wise)', icon: BarChart3 },
                  { route: 'sa-fees-defaulters', label: 'Defaulters & Outstanding', icon: AlertCircle },
                  { route: 'sa-fees-gateways', label: 'Payment Gateways', icon: CreditCard },
                  { route: 'sa-fees-refunds', label: 'Refund & Waiver Approvals', icon: CheckSquare },
                  { route: 'sa-fees-reports', label: 'Finance Reports', icon: FileSpreadsheet }
                ].map(item => {
                  const ItemIcon = item.icon
                  const active = isRouteActive(item.route)
                  return (
                    <div key={item.route} className="relative">
                      {active && (
                        <div className="absolute -left-[16px] top-1.5 bottom-1.5 w-1 bg-purple-600 rounded-full z-10"></div>
                      )}
                      <button
                        onClick={() => handleNavClick(item.route)}
                        className={`w-full flex items-center gap-2.5 text-left py-2 px-2.5 rounded-lg text-[13px] transition-all cursor-pointer ${
                          active
                            ? 'bg-[#f5eeff] text-purple-700 font-semibold'
                            : 'text-slate-500 hover:text-slate-900 hover:bg-slate-50'
                        }`}
                      >
                        <ItemIcon className={`w-3.5 h-3.5 shrink-0 ${active ? 'text-purple-600' : 'text-slate-400'}`} />
                        <span className="truncate">{item.label}</span>
                      </button>
                    </div>
                  )
                })}
              </div>
            )}
          </div>

          {/* 12. Group: Accounts & Finance */}
          <div className="pt-2">
            <button
              onClick={() => {
                if (collapsed) setCollapsed(false)
                setAccountsOpen(!accountsOpen)
              }}
              className="w-full flex items-center justify-between px-3 py-2 rounded-xl text-slate-500 hover:text-slate-800 hover:bg-slate-50/80 transition-colors cursor-pointer group"
            >
              <div className="flex items-center gap-3">
                <Receipt className="w-[18px] h-[18px] text-slate-400 group-hover:text-purple-600 transition-colors shrink-0" />
                {(!collapsed || isMobileOpen) && (
                  <span className="font-medium text-slate-600 group-hover:text-slate-900">
                    Accounts & Finance
                  </span>
                )}
              </div>
              {(!collapsed || isMobileOpen) && (
                accountsOpen ? <ChevronUp className="w-3.5 h-3.5 text-slate-400" /> : <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
              )}
            </button>

            {(!collapsed || isMobileOpen) && accountsOpen && (
              <div className="mt-1 pl-3.5 space-y-1 border-l-2 border-slate-100 ml-5">
                {[
                  { route: 'sa-accounts-chart', label: 'Chart of Accounts & Ledger', icon: FileSpreadsheet },
                  { route: 'sa-accounts-overview', label: 'Income & Expense Overview (Campus-wise)', icon: BarChart3 },
                  { route: 'sa-accounts-budgets', label: 'Budgets & Expense Approvals', icon: CheckSquare },
                  { route: 'sa-accounts-reconciliation', label: 'Bank & Payment Reconciliation', icon: RefreshCw },
                  { route: 'sa-accounts-payroll', label: 'Payroll Summary', icon: DollarSign },
                  { route: 'sa-accounts-tax', label: 'Tax & Receipt Settings', icon: Receipt },
                  { route: 'sa-accounts-statements', label: 'Financial Statements', icon: TrendingUp }
                ].map(item => {
                  const ItemIcon = item.icon
                  const active = isRouteActive(item.route)
                  return (
                    <div key={item.route} className="relative">
                      {active && (
                        <div className="absolute -left-[16px] top-1.5 bottom-1.5 w-1 bg-purple-600 rounded-full z-10"></div>
                      )}
                      <button
                        onClick={() => handleNavClick(item.route)}
                        className={`w-full flex items-center gap-2.5 text-left py-2 px-2.5 rounded-lg text-[13px] transition-all cursor-pointer ${
                          active
                            ? 'bg-[#f5eeff] text-purple-700 font-semibold'
                            : 'text-slate-500 hover:text-slate-900 hover:bg-slate-50'
                        }`}
                      >
                        <ItemIcon className={`w-3.5 h-3.5 shrink-0 ${active ? 'text-purple-600' : 'text-slate-400'}`} />
                        <span className="truncate">{item.label}</span>
                      </button>
                    </div>
                  )
                })}
              </div>
            )}
          </div>

          {/* 13. Group: Certificates */}
          <div className="pt-2">
            <button
              onClick={() => {
                if (collapsed) setCollapsed(false)
                setCertificatesOpen(!certificatesOpen)
              }}
              className="w-full flex items-center justify-between px-3 py-2 rounded-xl text-slate-500 hover:text-slate-800 hover:bg-slate-50/80 transition-colors cursor-pointer group"
            >
              <div className="flex items-center gap-3">
                <Award className="w-[18px] h-[18px] text-slate-400 group-hover:text-purple-600 transition-colors shrink-0" />
                {(!collapsed || isMobileOpen) && (
                  <span className="font-medium text-slate-600 group-hover:text-slate-900">
                    Certificates
                  </span>
                )}
              </div>
              {(!collapsed || isMobileOpen) && (
                certificatesOpen ? <ChevronUp className="w-3.5 h-3.5 text-slate-400" /> : <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
              )}
            </button>

            {(!collapsed || isMobileOpen) && certificatesOpen && (
              <div className="mt-1 pl-3.5 space-y-1 border-l-2 border-slate-100 ml-5">
                {[
                  { route: 'sa-certificates-templates', label: 'Certificate Templates', icon: FileText },
                  { route: 'sa-certificates-dmc', label: 'DMC / Transcript Templates ↗', icon: FileBadge },
                  { route: 'sa-certificates-approvals', label: 'Issuance Approvals', icon: CheckSquare },
                  { route: 'sa-certificates-numbering', label: 'Numbering & QR Verification Rules', icon: QrCode },
                  { route: 'sa-certificates-register', label: 'Issued Certificates Register', icon: FileCheck },
                  { route: 'sa-certificates-portal', label: 'Public Verification Portal Settings', icon: ShieldCheck }
                ].map(item => {
                  const ItemIcon = item.icon
                  const active = isRouteActive(item.route)
                  return (
                    <div key={item.route} className="relative">
                      {active && (
                        <div className="absolute -left-[16px] top-1.5 bottom-1.5 w-1 bg-purple-600 rounded-full z-10"></div>
                      )}
                      <button
                        onClick={() => handleNavClick(item.route)}
                        className={`w-full flex items-center gap-2.5 text-left py-2 px-2.5 rounded-lg text-[13px] transition-all cursor-pointer ${
                          active
                            ? 'bg-[#f5eeff] text-purple-700 font-semibold'
                            : 'text-slate-500 hover:text-slate-900 hover:bg-slate-50'
                        }`}
                      >
                        <ItemIcon className={`w-3.5 h-3.5 shrink-0 ${active ? 'text-purple-600' : 'text-slate-400'}`} />
                        <span className="truncate">{item.label}</span>
                      </button>
                    </div>
                  )
                })}
              </div>
            )}
          </div>

          {/* 14. Group: Campus Services */}
          <div className="pt-2">
            <button
              onClick={() => {
                if (collapsed) setCollapsed(false)
                setServicesOpen(!servicesOpen)
              }}
              className="w-full flex items-center justify-between px-3 py-2 rounded-xl text-slate-500 hover:text-slate-800 hover:bg-slate-50/80 transition-colors cursor-pointer group"
            >
              <div className="flex items-center gap-3">
                <Truck className="w-[18px] h-[18px] text-slate-400 group-hover:text-purple-600 transition-colors shrink-0" />
                {(!collapsed || isMobileOpen) && (
                  <span className="font-medium text-slate-600 group-hover:text-slate-900">
                    Campus Services
                  </span>
                )}
              </div>
              {(!collapsed || isMobileOpen) && (
                servicesOpen ? <ChevronUp className="w-3.5 h-3.5 text-slate-400" /> : <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
              )}
            </button>

            {(!collapsed || isMobileOpen) && servicesOpen && (
              <div className="mt-1 pl-3.5 space-y-1 border-l-2 border-slate-100 ml-5">
                {[
                  { route: 'sa-services-transport', label: 'Transport Routes & Fee Policies', icon: Truck },
                  { route: 'sa-services-drivers', label: 'Driver & Vehicle Compliance', icon: UserCheck },
                  { route: 'sa-services-hostel', label: 'Hostel Capacity & Rules', icon: Hotel },
                  { route: 'sa-services-reports', label: 'Transport & Hostel Reports', icon: BarChart3 },
                  { route: 'sa-services-discipline', label: 'Discipline Records Overview', icon: AlertTriangle },
                  { route: 'sa-services-health', label: 'Health & Welfare Policies', icon: HeartHandshake },
                  { route: 'sa-services-complaints', label: 'Complaint & Grievance Escalations', icon: MessageSquare }
                ].map(item => {
                  const ItemIcon = item.icon
                  const active = isRouteActive(item.route)
                  return (
                    <div key={item.route} className="relative">
                      {active && (
                        <div className="absolute -left-[16px] top-1.5 bottom-1.5 w-1 bg-purple-600 rounded-full z-10"></div>
                      )}
                      <button
                        onClick={() => handleNavClick(item.route)}
                        className={`w-full flex items-center gap-2.5 text-left py-2 px-2.5 rounded-lg text-[13px] transition-all cursor-pointer ${
                          active
                            ? 'bg-[#f5eeff] text-purple-700 font-semibold'
                            : 'text-slate-500 hover:text-slate-900 hover:bg-slate-50'
                        }`}
                      >
                        <ItemIcon className={`w-3.5 h-3.5 shrink-0 ${active ? 'text-purple-600' : 'text-slate-400'}`} />
                        <span className="truncate">{item.label}</span>
                      </button>
                    </div>
                  )
                })}
              </div>
            )}
          </div>

          {/* 15. Group: Learning & Resources */}
          <div className="pt-2">
            <button
              onClick={() => {
                if (collapsed) setCollapsed(false)
                setLearningOpen(!learningOpen)
              }}
              className="w-full flex items-center justify-between px-3 py-2 rounded-xl text-slate-500 hover:text-slate-800 hover:bg-slate-50/80 transition-colors cursor-pointer group"
            >
              <div className="flex items-center gap-3">
                <Laptop className="w-[18px] h-[18px] text-slate-400 group-hover:text-purple-600 transition-colors shrink-0" />
                {(!collapsed || isMobileOpen) && (
                  <span className="font-medium text-slate-600 group-hover:text-slate-900">
                    Learning & Resources
                  </span>
                )}
              </div>
              {(!collapsed || isMobileOpen) && (
                learningOpen ? <ChevronUp className="w-3.5 h-3.5 text-slate-400" /> : <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
              )}
            </button>

            {(!collapsed || isMobileOpen) && learningOpen && (
              <div className="mt-1 pl-3.5 space-y-1 border-l-2 border-slate-100 ml-5">
                {[
                  { route: 'sa-learning-lms', label: 'LMS Policies (Content, Uploads, Quizzes)', icon: Laptop },
                  { route: 'sa-learning-classes', label: 'Online Class Integrations', icon: Video },
                  { route: 'sa-learning-library', label: 'Library Policies & Central Catalog', icon: BookMarked },
                  { route: 'sa-learning-digital', label: 'Digital Resources', icon: Database }
                ].map(item => {
                  const ItemIcon = item.icon
                  const active = isRouteActive(item.route)
                  return (
                    <div key={item.route} className="relative">
                      {active && (
                        <div className="absolute -left-[16px] top-1.5 bottom-1.5 w-1 bg-purple-600 rounded-full z-10"></div>
                      )}
                      <button
                        onClick={() => handleNavClick(item.route)}
                        className={`w-full flex items-center gap-2.5 text-left py-2 px-2.5 rounded-lg text-[13px] transition-all cursor-pointer ${
                          active
                            ? 'bg-[#f5eeff] text-purple-700 font-semibold'
                            : 'text-slate-500 hover:text-slate-900 hover:bg-slate-50'
                        }`}
                      >
                        <ItemIcon className={`w-3.5 h-3.5 shrink-0 ${active ? 'text-purple-600' : 'text-slate-400'}`} />
                        <span className="truncate">{item.label}</span>
                      </button>
                    </div>
                  )
                })}
              </div>
            )}
          </div>

          {/* 16. Group: Communication */}
          <div className="pt-2">
            <button
              onClick={() => {
                if (collapsed) setCollapsed(false)
                setCommunicationOpen(!communicationOpen)
              }}
              className="w-full flex items-center justify-between px-3 py-2 rounded-xl text-slate-500 hover:text-slate-800 hover:bg-slate-50/80 transition-colors cursor-pointer group"
            >
              <div className="flex items-center gap-3">
                <Megaphone className="w-[18px] h-[18px] text-slate-400 group-hover:text-purple-600 transition-colors shrink-0" />
                {(!collapsed || isMobileOpen) && (
                  <span className="font-medium text-slate-600 group-hover:text-slate-900">
                    Communication
                  </span>
                )}
              </div>
              {(!collapsed || isMobileOpen) && (
                communicationOpen ? <ChevronUp className="w-3.5 h-3.5 text-slate-400" /> : <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
              )}
            </button>

            {(!collapsed || isMobileOpen) && communicationOpen && (
              <div className="mt-1 pl-3.5 space-y-1 border-l-2 border-slate-100 ml-5">
                {[
                  { route: 'sa-comm-announcements', label: 'Platform Announcements', icon: Megaphone },
                  { route: 'sa-comm-templates', label: 'Notification Templates (Email/SMS/WhatsApp)', icon: Mail },
                  { route: 'sa-comm-circulars', label: 'Circulars & Event Calendar', icon: Calendar },
                  { route: 'sa-comm-broadcast', label: 'Emergency Broadcast', icon: AlertOctagon },
                  { route: 'sa-comm-logs', label: 'Communication Logs', icon: History }
                ].map(item => {
                  const ItemIcon = item.icon
                  const active = isRouteActive(item.route)
                  return (
                    <div key={item.route} className="relative">
                      {active && (
                        <div className="absolute -left-[16px] top-1.5 bottom-1.5 w-1 bg-purple-600 rounded-full z-10"></div>
                      )}
                      <button
                        onClick={() => handleNavClick(item.route)}
                        className={`w-full flex items-center gap-2.5 text-left py-2 px-2.5 rounded-lg text-[13px] transition-all cursor-pointer ${
                          active
                            ? 'bg-[#f5eeff] text-purple-700 font-semibold'
                            : 'text-slate-500 hover:text-slate-900 hover:bg-slate-50'
                        }`}
                      >
                        <ItemIcon className={`w-3.5 h-3.5 shrink-0 ${active ? 'text-purple-600' : 'text-slate-400'}`} />
                        <span className="truncate">{item.label}</span>
                      </button>
                    </div>
                  )
                })}
              </div>
            )}
          </div>

          {/* 17. Group: Reports & Analytics */}
          <div className="pt-2">
            <button
              onClick={() => {
                if (collapsed) setCollapsed(false)
                setReportsOpen(!reportsOpen)
              }}
              className="w-full flex items-center justify-between px-3 py-2 rounded-xl text-slate-500 hover:text-slate-800 hover:bg-slate-50/80 transition-colors cursor-pointer group"
            >
              <div className="flex items-center gap-3">
                <BarChart3 className="w-[18px] h-[18px] text-slate-400 group-hover:text-purple-600 transition-colors shrink-0" />
                {(!collapsed || isMobileOpen) && (
                  <span className="font-medium text-slate-600 group-hover:text-slate-900">
                    Reports & Analytics
                  </span>
                )}
              </div>
              {(!collapsed || isMobileOpen) && (
                reportsOpen ? <ChevronUp className="w-3.5 h-3.5 text-slate-400" /> : <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
              )}
            </button>

            {(!collapsed || isMobileOpen) && reportsOpen && (
              <div className="mt-1 pl-3.5 space-y-1 border-l-2 border-slate-100 ml-5">
                {[
                  { route: 'sa-reports-trends', label: 'Enrollment & Dropout Trends', icon: TrendingUp },
                  { route: 'sa-reports-performance', label: 'Performance Analysis', icon: BarChart3 },
                  { route: 'sa-reports-collection', label: 'Fee Collection vs Outstanding', icon: DollarSign },
                  { route: 'sa-reports-comparison', label: 'Campus Comparison', icon: Building2 },
                  { route: 'sa-reports-builder', label: 'Custom Report Builder', icon: Sliders },
                  { route: 'sa-reports-scheduled', label: 'Scheduled Reports', icon: Calendar },
                  { route: 'sa-reports-export', label: 'Export Center (PDF / Excel / CSV)', icon: Download }
                ].map(item => {
                  const ItemIcon = item.icon
                  const active = isRouteActive(item.route)
                  return (
                    <div key={item.route} className="relative">
                      {active && (
                        <div className="absolute -left-[16px] top-1.5 bottom-1.5 w-1 bg-purple-600 rounded-full z-10"></div>
                      )}
                      <button
                        onClick={() => handleNavClick(item.route)}
                        className={`w-full flex items-center gap-2.5 text-left py-2 px-2.5 rounded-lg text-[13px] transition-all cursor-pointer ${
                          active
                            ? 'bg-[#f5eeff] text-purple-700 font-semibold'
                            : 'text-slate-500 hover:text-slate-900 hover:bg-slate-50'
                        }`}
                      >
                        <ItemIcon className={`w-3.5 h-3.5 shrink-0 ${active ? 'text-purple-600' : 'text-slate-400'}`} />
                        <span className="truncate">{item.label}</span>
                      </button>
                    </div>
                  )
                })}
              </div>
            )}
          </div>

          {/* 18. Group: Policies & Guidelines */}
          <div className="pt-2">
            <button
              onClick={() => {
                if (collapsed) setCollapsed(false)
                setPoliciesOpen(!policiesOpen)
              }}
              className="w-full flex items-center justify-between px-3 py-2 rounded-xl text-slate-500 hover:text-slate-800 hover:bg-slate-50/80 transition-colors cursor-pointer group"
            >
              <div className="flex items-center gap-3">
                <ShieldCheck className="w-[18px] h-[18px] text-slate-400 group-hover:text-purple-600 transition-colors shrink-0" />
                {(!collapsed || isMobileOpen) && (
                  <span className="font-medium text-slate-600 group-hover:text-slate-900">
                    Policies & Guidelines
                  </span>
                )}
              </div>
              {(!collapsed || isMobileOpen) && (
                policiesOpen ? <ChevronUp className="w-3.5 h-3.5 text-slate-400" /> : <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
              )}
            </button>

            {(!collapsed || isMobileOpen) && policiesOpen && (
              <div className="mt-1 pl-3.5 space-y-1 border-l-2 border-slate-100 ml-5">
                {[
                  { route: 'sa-policies-academic', label: 'Academic Policies', icon: FileText },
                  { route: 'sa-policies-fees', label: 'Fee & Refund Policies', icon: DollarSign },
                  { route: 'sa-policies-attendance', label: 'Attendance & Leave Policies', icon: Clock },
                  { route: 'sa-policies-discipline', label: 'Discipline & Code of Conduct', icon: AlertTriangle },
                  { route: 'sa-policies-privacy', label: 'Data Privacy & Child Safety', icon: Lock },
                  { route: 'sa-policies-publish', label: 'Policy Versions & Publish (Campus / Wing-wise)', icon: Share2 },
                  { route: 'sa-policies-acknowledgment', label: 'Staff / Student Acknowledgment Tracking', icon: Users }
                ].map(item => {
                  const ItemIcon = item.icon
                  const active = isRouteActive(item.route)
                  return (
                    <div key={item.route} className="relative">
                      {active && (
                        <div className="absolute -left-[16px] top-1.5 bottom-1.5 w-1 bg-purple-600 rounded-full z-10"></div>
                      )}
                      <button
                        onClick={() => handleNavClick(item.route)}
                        className={`w-full flex items-center gap-2.5 text-left py-2 px-2.5 rounded-lg text-[13px] transition-all cursor-pointer ${
                          active
                            ? 'bg-[#f5eeff] text-purple-700 font-semibold'
                            : 'text-slate-500 hover:text-slate-900 hover:bg-slate-50'
                        }`}
                      >
                        <ItemIcon className={`w-3.5 h-3.5 shrink-0 ${active ? 'text-purple-600' : 'text-slate-400'}`} />
                        <span className="truncate">{item.label}</span>
                      </button>
                    </div>
                  )
                })}
              </div>
            )}
          </div>

          {/* 19. Group: Platform Settings */}
          <div className="pt-2">
            <button
              onClick={() => {
                if (collapsed) setCollapsed(false)
                setSettingsOpen(!settingsOpen)
              }}
              className="w-full flex items-center justify-between px-3 py-2 rounded-xl text-slate-500 hover:text-slate-800 hover:bg-slate-50/80 transition-colors cursor-pointer group"
            >
              <div className="flex items-center gap-3">
                <Settings className="w-[18px] h-[18px] text-slate-400 group-hover:text-purple-600 transition-colors shrink-0" />
                {(!collapsed || isMobileOpen) && (
                  <span className="font-medium text-slate-600 group-hover:text-slate-900">
                    Platform Settings
                  </span>
                )}
              </div>
              {(!collapsed || isMobileOpen) && (
                settingsOpen ? <ChevronUp className="w-3.5 h-3.5 text-slate-400" /> : <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
              )}
            </button>

            {(!collapsed || isMobileOpen) && settingsOpen && (
              <div className="mt-1 pl-3.5 space-y-1 border-l-2 border-slate-100 ml-5">
                {[
                  { route: 'sa-settings-general', label: 'General (Language, PKR, Time Zone)', icon: Settings },
                  { route: 'sa-settings-branding', label: 'Branding & Custom Domains', icon: Globe },
                  { route: 'sa-settings-flags', label: 'Feature Flags (Tier-wise)', icon: Sliders },
                  { route: 'sa-settings-integrations', label: 'Integrations & Webhooks (SSO, SMS, API)', icon: Key },
                  { route: 'sa-settings-compliance', label: 'Compliance & Data Retention', icon: ShieldCheck },
                  { route: 'sa-settings-legal', label: 'Legal Documents (Terms, Privacy)', icon: FileText },
                  { route: 'sa-settings-maintenance', label: 'Maintenance Mode & Release Notes', icon: AlertTriangle },
                  { route: 'sa-settings-impersonate', label: 'Switch to Campus View (Impersonation)', icon: UserCheck },
                  { route: 'sa-settings-backups', label: 'System & Session Backups', icon: Database }
                ].map(item => {
                  const ItemIcon = item.icon
                  const active = isRouteActive(item.route)
                  return (
                    <div key={item.route} className="relative">
                      {active && (
                        <div className="absolute -left-[16px] top-1.5 bottom-1.5 w-1 bg-purple-600 rounded-full z-10"></div>
                      )}
                      <button
                        onClick={() => handleNavClick(item.route)}
                        className={`w-full flex items-center gap-2.5 text-left py-2 px-2.5 rounded-lg text-[13px] transition-all cursor-pointer ${
                          active
                            ? 'bg-[#f5eeff] text-purple-700 font-semibold'
                            : 'text-slate-500 hover:text-slate-900 hover:bg-slate-50'
                        }`}
                      >
                        <ItemIcon className={`w-3.5 h-3.5 shrink-0 ${active ? 'text-purple-600' : 'text-slate-400'}`} />
                        <span className="truncate">{item.label}</span>
                      </button>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        </div>

        {/* Clean Sign Out Footer */}
        <div className="p-3 border-t border-slate-100 bg-white">
          <button
            onClick={logout}
            className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-slate-500 hover:text-rose-600 hover:bg-rose-50 transition-colors text-xs font-semibold cursor-pointer group"
          >
            <LogOut className="w-4 h-4 shrink-0 text-slate-400 group-hover:text-rose-500" />
            {(!collapsed || isMobileOpen) && <span>Sign Out</span>}
          </button>
        </div>
      </aside>
    </>
  )
}

export default SuperadminSidebar
