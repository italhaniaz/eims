import React, { useState, useEffect } from 'react'
import { 
  Home,
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
  ShieldCheck, 
  BarChart3, 
  CreditCard, 
  FileSpreadsheet, 
  Database, 
  Activity,
  Lock,
  CheckSquare,
  Settings,
  ClipboardList
} from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import { preloadRoute } from '../../utils/modulePreloader'

export const SuperadminSidebar = ({ 
  currentRoute, 
  onRouteChange, 
  isMobileOpen = false, 
  onCloseMobile = () => {} 
}) => {
  const { logout } = useAuth()
  const [collapsed, setCollapsed] = useState(false)

  // Route group classifications
  const isCampusesRoute = ['institutes', 'school-inquiries', 'support-approvals', 'platform-billing'].includes(currentRoute)
  const isAccessRoute = ['users-all', 'users-roles', 'security-center', 'personnel-staff', 'personnel-roles'].includes(currentRoute)
  const isStandardsRoute = ['global-templates', 'compliance-policies', 'sa-policies'].includes(currentRoute) || 
    (typeof currentRoute === 'string' && currentRoute.startsWith('sa-policies-'))
  const isIntelRoute = ['cross-institute-analytics', 'platform-analytics', 'announcements', 'system-broadcasts'].includes(currentRoute)
  const isGovernanceRoute = ['system-health', 'audit-logs', 'backup-data', 'platform-settings', 'sa-settings'].includes(currentRoute) || 
    (typeof currentRoute === 'string' && currentRoute.startsWith('sa-settings-'))

  // Real-time dynamic counts
  const [pendingApprovalsCount, setPendingApprovalsCount] = useState(0)
  const [pendingInquiriesCount, setPendingInquiriesCount] = useState(0)
  const [campusesCount, setCampusesCount] = useState(0)
  const [usersCount, setUsersCount] = useState(0)

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

    const updateUserCount = () => {
      try {
        const stored = localStorage.getItem('edu_sms_data_v2')
        if (stored) {
          const parsed = JSON.parse(stored)
          if (Array.isArray(parsed?.users)) {
            setUsersCount(parsed.users.length)
            return
          }
        }
        setUsersCount(0)
      } catch {
        setUsersCount(0)
      }
    }

    const updateInquiriesCount = () => {
      try {
        const raw = localStorage.getItem('sms_school_inquiries')
        if (raw) {
          const list = JSON.parse(raw)
          if (Array.isArray(list)) {
            const pending = list.filter(i => (i.status || '').toUpperCase() === 'PENDING')
            setPendingInquiriesCount(pending.length)
            return
          }
        }
        setPendingInquiriesCount(0)
      } catch {
        setPendingInquiriesCount(0)
      }
    }

    updateCount()
    updateInquiriesCount()
    updateCampusCount()
    updateUserCount()
    window.addEventListener('sms_approval_created', updateCount)
    window.addEventListener('sms_approvals_updated', updateCount)
    window.addEventListener('sms_inquiries_updated', updateInquiriesCount)
    window.addEventListener('sms_institutes_updated', updateCampusCount)
    window.addEventListener('sms_users_updated', updateUserCount)
    window.addEventListener('storage', updateCount)
    window.addEventListener('storage', updateInquiriesCount)
    window.addEventListener('storage', updateCampusCount)
    window.addEventListener('storage', updateUserCount)
    return () => {
      window.removeEventListener('sms_approval_created', updateCount)
      window.removeEventListener('sms_approvals_updated', updateCount)
      window.removeEventListener('sms_inquiries_updated', updateInquiriesCount)
      window.removeEventListener('sms_institutes_updated', updateCampusCount)
      window.removeEventListener('sms_users_updated', updateUserCount)
      window.removeEventListener('storage', updateCount)
      window.removeEventListener('storage', updateInquiriesCount)
      window.removeEventListener('storage', updateCampusCount)
      window.removeEventListener('storage', updateUserCount)
    }
  }, [])

  // Collapsible section states with smart initial expansion
  const [campusesOpen, setCampusesOpen] = useState(true)
  const [accessOpen, setAccessOpen] = useState(isAccessRoute)
  const [standardsOpen, setStandardsOpen] = useState(isStandardsRoute)
  const [intelOpen, setIntelOpen] = useState(isIntelRoute)
  const [governanceOpen, setGovernanceOpen] = useState(isGovernanceRoute)

  // Auto-expand active group on route change
  useEffect(() => {
    if (isCampusesRoute) setCampusesOpen(true)
    if (isAccessRoute) setAccessOpen(true)
    if (isStandardsRoute) setStandardsOpen(true)
    if (isIntelRoute) setIntelOpen(true)
    if (isGovernanceRoute) setGovernanceOpen(true)
  }, [currentRoute, isCampusesRoute, isAccessRoute, isStandardsRoute, isIntelRoute, isGovernanceRoute])

  const isRouteActive = (route) => {
    if (currentRoute === route) return true
    if (route === 'compliance-policies' && (currentRoute === 'sa-policies' || (typeof currentRoute === 'string' && currentRoute.startsWith('sa-policies-')))) return true
    if (route === 'cross-institute-analytics' && currentRoute === 'platform-analytics') return true
    if (route === 'announcements' && currentRoute === 'system-broadcasts') return true
    if (route === 'sa-settings' && (currentRoute === 'platform-settings' || (typeof currentRoute === 'string' && currentRoute.startsWith('sa-settings-')))) return true
    return false
  }

  const handleNavClick = (route) => {
    preloadRoute(route)
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
          className="fixed inset-0 bg-slate-950/70 backdrop-blur-xs z-40 lg:hidden"
        />
      )}

      <aside 
        className={`
          fixed lg:static top-0 bottom-0 left-0 z-50
          ${isMobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
          ${collapsed ? 'lg:w-20' : 'w-72'} 
          h-full max-h-screen sidebar-navy bg-[#0B1120] text-slate-300 border-r border-slate-800/80 flex flex-col 
          transition-all duration-300 shrink-0 select-none shadow-xl
        `}
      >
        {/* Top Brand Header */}
        <div className="h-14 sm:h-16 min-h-[56px] sm:min-h-[64px] flex items-center justify-between px-4 sm:px-5 border-b border-slate-800/80 bg-[#0B1120] shrink-0">
          <div className="flex items-center gap-3 overflow-hidden min-w-0">
            <div className="w-9 h-9 rounded-xl bg-purple-500/15 text-purple-400 border border-purple-500/30 flex items-center justify-center shrink-0 font-bold text-xs shadow-2xs">
              <ShieldCheck className="w-5 h-5 text-purple-400" />
            </div>
            {(!collapsed || isMobileOpen) && (
              <div className="flex flex-col truncate min-w-0">
                <span className="text-sm font-extrabold text-white tracking-tight font-heading leading-tight truncate">
                  Super Admin
                </span>
                <span className="text-[10px] text-purple-400 font-bold uppercase tracking-wider truncate">
                  Platform Console
                </span>
              </div>
            )}
          </div>
          
          {/* Mobile Close Button */}
          <button 
            onClick={onCloseMobile}
            className="lg:hidden text-slate-400 hover:text-white p-1.5 rounded-lg hover:bg-slate-800/60 transition-colors ml-auto cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Desktop Collapse Button */}
          <button 
            onClick={() => setCollapsed(!collapsed)}
            className="hidden lg:block text-slate-400 hover:text-white p-1.5 rounded-lg hover:bg-slate-800/60 transition-colors ml-auto cursor-pointer"
            title={collapsed ? "Expand Sidebar" : "Collapse Sidebar"}
          >
            {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
          </button>
        </div>

        {/* Navigation Menu */}
        <div className="flex-1 py-4 px-3 space-y-1.5 overflow-y-auto dark-scroll text-[13.5px]">
          {/* Dashboard Item */}
          <div className="relative">
            {isRouteActive('dashboard') && (
              <div className="absolute left-0 top-1.5 bottom-1.5 w-1 bg-purple-500 rounded-full z-10 shadow-sm shadow-purple-500/50"></div>
            )}
            <button
              onClick={() => handleNavClick('dashboard')}
              title={collapsed ? "Dashboard" : undefined}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl transition-all text-left cursor-pointer group ${
                isRouteActive('dashboard')
                  ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-bold shadow-md shadow-purple-600/30'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              <Home className={`w-[18px] h-[18px] shrink-0 transition-colors ${
                isRouteActive('dashboard') ? 'text-white' : 'text-slate-400 group-hover:text-purple-400'
              }`} />
              {(!collapsed || isMobileOpen) && (
                <span className="font-semibold whitespace-nowrap truncate">Dashboard</span>
              )}
            </button>
          </div>

          {/* 1. Group: Campuses & Tenancy */}
          <div className="pt-1">
            <button
              onClick={() => {
                if (collapsed) setCollapsed(false)
                setCampusesOpen(!campusesOpen)
              }}
              title={collapsed ? "Campuses & Tenancy" : undefined}
              className={`w-full flex items-center justify-between px-3 py-2 rounded-xl transition-colors cursor-pointer group ${
                isCampusesRoute 
                  ? 'text-purple-300 font-semibold bg-purple-500/10 border border-purple-500/20' 
                  : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              <div className="flex items-center gap-3 min-w-0">
                <School className={`w-[18px] h-[18px] shrink-0 transition-colors ${
                  isCampusesRoute ? 'text-purple-400' : 'text-slate-400 group-hover:text-purple-400'
                }`} />
                {(!collapsed || isMobileOpen) && (
                  <span className="font-medium text-slate-200 group-hover:text-white whitespace-nowrap truncate">
                    Campuses & Tenancy
                  </span>
                )}
              </div>
              {(!collapsed || isMobileOpen) && (
                campusesOpen 
                  ? <ChevronUp className="w-3.5 h-3.5 text-slate-400 group-hover:text-slate-200" /> 
                  : <ChevronDown className="w-3.5 h-3.5 text-slate-400 group-hover:text-slate-200" />
              )}
            </button>

            {(!collapsed || isMobileOpen) && campusesOpen && (
              <div className="mt-1 pl-3.5 space-y-1 border-l border-slate-800 ml-5">
                {/* All Campuses */}
                <div className="relative">
                  {isRouteActive('institutes') && (
                    <div className="absolute -left-[16px] top-1.5 bottom-1.5 w-1 bg-purple-500 rounded-full z-10 shadow-sm shadow-purple-500/50"></div>
                  )}
                  <button
                    onClick={() => handleNavClick('institutes')}
                    className={`w-full flex items-center justify-between text-left py-2 px-2.5 rounded-lg text-[13px] transition-all cursor-pointer ${
                      isRouteActive('institutes')
                        ? 'bg-purple-600/20 text-purple-300 font-semibold border border-purple-500/30'
                        : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
                    }`}
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <Building2 className={`w-3.5 h-3.5 shrink-0 ${isRouteActive('institutes') ? 'text-purple-400' : 'text-slate-400'}`} />
                      <span className="whitespace-nowrap truncate">All Campuses</span>
                    </div>
                    {campusesCount > 0 && (
                      <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-slate-800 text-slate-300 border border-slate-700">
                        {campusesCount}
                      </span>
                    )}
                  </button>
                </div>

                {/* School Inquiries */}
                <div className="relative">
                  {isRouteActive('school-inquiries') && (
                    <div className="absolute -left-[16px] top-1.5 bottom-1.5 w-1 bg-purple-500 rounded-full z-10 shadow-sm shadow-purple-500/50"></div>
                  )}
                  <button
                    onClick={() => handleNavClick('school-inquiries')}
                    className={`w-full flex items-center justify-between text-left py-2 px-2.5 rounded-lg text-[13px] transition-all cursor-pointer ${
                      isRouteActive('school-inquiries')
                        ? 'bg-purple-600/20 text-purple-300 font-semibold border border-purple-500/30'
                        : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
                    }`}
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <ClipboardList className={`w-3.5 h-3.5 shrink-0 ${isRouteActive('school-inquiries') ? 'text-purple-400' : 'text-slate-400'}`} />
                      <span className="whitespace-nowrap truncate">School Inquiries</span>
                    </div>
                    {pendingInquiriesCount > 0 && (
                      <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40 animate-pulse">
                        {pendingInquiriesCount}
                      </span>
                    )}
                  </button>
                </div>

                {/* Pending Approvals */}
                <div className="relative">
                  {isRouteActive('support-approvals') && (
                    <div className="absolute -left-[16px] top-1.5 bottom-1.5 w-1 bg-purple-500 rounded-full z-10 shadow-sm shadow-purple-500/50"></div>
                  )}
                  <button
                    onClick={() => handleNavClick('support-approvals')}
                    className={`w-full flex items-center justify-between text-left py-2 px-2.5 rounded-lg text-[13px] transition-all cursor-pointer ${
                      isRouteActive('support-approvals')
                        ? 'bg-purple-600/20 text-purple-300 font-semibold border border-purple-500/30'
                        : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
                    }`}
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <CheckSquare className={`w-3.5 h-3.5 shrink-0 ${isRouteActive('support-approvals') ? 'text-purple-400' : 'text-slate-400'}`} />
                      <span className="whitespace-nowrap truncate">Pending Approvals</span>
                    </div>
                    {pendingApprovalsCount > 0 && (
                      <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/40 animate-pulse">
                        {pendingApprovalsCount}
                      </span>
                    )}
                  </button>
                </div>

                {/* Subscriptions & Billing */}
                <div className="relative">
                  {isRouteActive('platform-billing') && (
                    <div className="absolute -left-[16px] top-1.5 bottom-1.5 w-1 bg-purple-500 rounded-full z-10 shadow-sm shadow-purple-500/50"></div>
                  )}
                  <button
                    onClick={() => handleNavClick('platform-billing')}
                    className={`w-full flex items-center gap-2.5 text-left py-2 px-2.5 rounded-lg text-[13px] transition-all cursor-pointer ${
                      isRouteActive('platform-billing')
                        ? 'bg-purple-600/20 text-purple-300 font-semibold border border-purple-500/30'
                        : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
                    }`}
                  >
                    <CreditCard className={`w-3.5 h-3.5 shrink-0 ${isRouteActive('platform-billing') ? 'text-purple-400' : 'text-slate-400'}`} />
                    <span className="whitespace-nowrap truncate">Subscriptions & Billing</span>
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* 2. Group: Personnel Management */}
          <div className="pt-1">
            <button
              onClick={() => {
                if (collapsed) setCollapsed(false)
                setAccessOpen(!accessOpen)
              }}
              title={collapsed ? "Personnel Management" : undefined}
              className={`w-full flex items-center justify-between px-3 py-2 rounded-xl transition-colors cursor-pointer group ${
                isAccessRoute 
                  ? 'text-purple-300 font-semibold bg-purple-500/10 border border-purple-500/20' 
                  : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              <div className="flex items-center gap-3 min-w-0">
                <Users className={`w-[18px] h-[18px] shrink-0 transition-colors ${
                  isAccessRoute ? 'text-purple-400' : 'text-slate-400 group-hover:text-purple-400'
                }`} />
                {(!collapsed || isMobileOpen) && (
                  <span className="font-medium text-slate-200 group-hover:text-white whitespace-nowrap truncate">
                    Personnel Management
                  </span>
                )}
              </div>
              {(!collapsed || isMobileOpen) && (
                accessOpen 
                  ? <ChevronUp className="w-3.5 h-3.5 text-slate-400 group-hover:text-slate-200" /> 
                  : <ChevronDown className="w-3.5 h-3.5 text-slate-400 group-hover:text-slate-200" />
              )}
            </button>

            {(!collapsed || isMobileOpen) && accessOpen && (
              <div className="mt-1 pl-3.5 space-y-1 border-l border-slate-800 ml-5">
                {/* Staff (Manage Staff) */}
                <div className="relative">
                  {(isRouteActive('users-all') || isRouteActive('personnel-staff')) && (
                    <div className="absolute -left-[16px] top-1.5 bottom-1.5 w-1 bg-purple-500 rounded-full z-10 shadow-sm shadow-purple-500/50"></div>
                  )}
                  <button
                    onClick={() => handleNavClick('users-all')}
                    className={`w-full flex items-center justify-between text-left py-2 px-2.5 rounded-lg text-[13px] transition-all cursor-pointer ${
                      isRouteActive('users-all') || isRouteActive('personnel-staff')
                        ? 'bg-purple-600/20 text-purple-300 font-semibold border border-purple-500/30'
                        : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
                    }`}
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <Users className={`w-3.5 h-3.5 shrink-0 ${isRouteActive('users-all') || isRouteActive('personnel-staff') ? 'text-purple-400' : 'text-slate-400'}`} />
                      <span className="whitespace-nowrap truncate">Staff (Manage Staff)</span>
                    </div>
                    {usersCount > 0 && (
                      <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-slate-800 text-slate-300 border border-slate-700">
                        {usersCount}
                      </span>
                    )}
                  </button>
                </div>

                {/* Role & Permission */}
                <div className="relative">
                  {(isRouteActive('users-roles') || isRouteActive('personnel-roles')) && (
                    <div className="absolute -left-[16px] top-1.5 bottom-1.5 w-1 bg-purple-500 rounded-full z-10 shadow-sm shadow-purple-500/50"></div>
                  )}
                  <button
                    onClick={() => handleNavClick('users-roles')}
                    className={`w-full flex items-center gap-2.5 text-left py-2 px-2.5 rounded-lg text-[13px] transition-all cursor-pointer ${
                      isRouteActive('users-roles') || isRouteActive('personnel-roles')
                        ? 'bg-purple-600/20 text-purple-300 font-semibold border border-purple-500/30'
                        : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
                    }`}
                  >
                    <ShieldCheck className={`w-3.5 h-3.5 shrink-0 ${isRouteActive('users-roles') || isRouteActive('personnel-roles') ? 'text-purple-400' : 'text-slate-400'}`} />
                    <span className="whitespace-nowrap truncate">Role & Permission</span>
                  </button>
                </div>

                {/* Security & Sessions */}
                <div className="relative">
                  {isRouteActive('security-center') && (
                    <div className="absolute -left-[16px] top-1.5 bottom-1.5 w-1 bg-purple-500 rounded-full z-10 shadow-sm shadow-purple-500/50"></div>
                  )}
                  <button
                    onClick={() => handleNavClick('security-center')}
                    className={`w-full flex items-center gap-2.5 text-left py-2 px-2.5 rounded-lg text-[13px] transition-all cursor-pointer ${
                      isRouteActive('security-center')
                        ? 'bg-purple-600/20 text-purple-300 font-semibold border border-purple-500/30'
                        : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
                    }`}
                  >
                    <Lock className={`w-3.5 h-3.5 shrink-0 ${isRouteActive('security-center') ? 'text-purple-400' : 'text-slate-400'}`} />
                    <span className="whitespace-nowrap truncate">Security & Sessions</span>
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* 3. Group: Academic Standards (HQ) */}
          <div className="pt-1">
            <button
              onClick={() => {
                if (collapsed) setCollapsed(false)
                setStandardsOpen(!standardsOpen)
              }}
              title={collapsed ? "Academic Standards (HQ)" : undefined}
              className={`w-full flex items-center justify-between px-3 py-2 rounded-xl transition-colors cursor-pointer group ${
                isStandardsRoute 
                  ? 'text-purple-300 font-semibold bg-purple-500/10 border border-purple-500/20' 
                  : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              <div className="flex items-center gap-3 min-w-0">
                <FileSpreadsheet className={`w-[18px] h-[18px] shrink-0 transition-colors ${
                  isStandardsRoute ? 'text-purple-400' : 'text-slate-400 group-hover:text-purple-400'
                }`} />
                {(!collapsed || isMobileOpen) && (
                  <span className="font-medium text-slate-200 group-hover:text-white whitespace-nowrap truncate">
                    Academic Standards (HQ)
                  </span>
                )}
              </div>
              {(!collapsed || isMobileOpen) && (
                standardsOpen 
                  ? <ChevronUp className="w-3.5 h-3.5 text-slate-400 group-hover:text-slate-200" /> 
                  : <ChevronDown className="w-3.5 h-3.5 text-slate-400 group-hover:text-slate-200" />
              )}
            </button>

            {(!collapsed || isMobileOpen) && standardsOpen && (
              <div className="mt-1 pl-3.5 space-y-1 border-l border-slate-800 ml-5">
                {/* Global Templates */}
                <div className="relative">
                  {isRouteActive('global-templates') && (
                    <div className="absolute -left-[16px] top-1.5 bottom-1.5 w-1 bg-purple-500 rounded-full z-10 shadow-sm shadow-purple-500/50"></div>
                  )}
                  <button
                    onClick={() => handleNavClick('global-templates')}
                    className={`w-full flex items-center gap-2.5 text-left py-2 px-2.5 rounded-lg text-[13px] transition-all cursor-pointer ${
                      isRouteActive('global-templates')
                        ? 'bg-purple-600/20 text-purple-300 font-semibold border border-purple-500/30'
                        : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
                    }`}
                  >
                    <FileSpreadsheet className={`w-3.5 h-3.5 shrink-0 ${isRouteActive('global-templates') ? 'text-purple-400' : 'text-slate-400'}`} />
                    <span className="whitespace-nowrap truncate">Global Templates</span>
                  </button>
                </div>

                {/* Compliance Policies */}
                <div className="relative">
                  {isRouteActive('compliance-policies') && (
                    <div className="absolute -left-[16px] top-1.5 bottom-1.5 w-1 bg-purple-500 rounded-full z-10 shadow-sm shadow-purple-500/50"></div>
                  )}
                  <button
                    onClick={() => handleNavClick('compliance-policies')}
                    className={`w-full flex items-center gap-2.5 text-left py-2 px-2.5 rounded-lg text-[13px] transition-all cursor-pointer ${
                      isRouteActive('compliance-policies')
                        ? 'bg-purple-600/20 text-purple-300 font-semibold border border-purple-500/30'
                        : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
                    }`}
                  >
                    <ShieldCheck className={`w-3.5 h-3.5 shrink-0 ${isRouteActive('compliance-policies') ? 'text-purple-400' : 'text-slate-400'}`} />
                    <span className="whitespace-nowrap truncate">Compliance Policies</span>
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* 4. Group: Intelligence & Broadcasts */}
          <div className="pt-1">
            <button
              onClick={() => {
                if (collapsed) setCollapsed(false)
                setIntelOpen(!intelOpen)
              }}
              title={collapsed ? "Intelligence & Broadcasts" : undefined}
              className={`w-full flex items-center justify-between px-3 py-2 rounded-xl transition-colors cursor-pointer group ${
                isIntelRoute 
                  ? 'text-purple-300 font-semibold bg-purple-500/10 border border-purple-500/20' 
                  : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              <div className="flex items-center gap-3 min-w-0">
                <BarChart3 className={`w-[18px] h-[18px] shrink-0 transition-colors ${
                  isIntelRoute ? 'text-purple-400' : 'text-slate-400 group-hover:text-purple-400'
                }`} />
                {(!collapsed || isMobileOpen) && (
                  <span className="font-medium text-slate-200 group-hover:text-white whitespace-nowrap truncate">
                    Intelligence & Broadcasts
                  </span>
                )}
              </div>
              {(!collapsed || isMobileOpen) && (
                intelOpen 
                  ? <ChevronUp className="w-3.5 h-3.5 text-slate-400 group-hover:text-slate-200" /> 
                  : <ChevronDown className="w-3.5 h-3.5 text-slate-400 group-hover:text-slate-200" />
              )}
            </button>

            {(!collapsed || isMobileOpen) && intelOpen && (
              <div className="mt-1 pl-3.5 space-y-1 border-l border-slate-800 ml-5">
                {/* Platform Analytics */}
                <div className="relative">
                  {isRouteActive('cross-institute-analytics') && (
                    <div className="absolute -left-[16px] top-1.5 bottom-1.5 w-1 bg-purple-500 rounded-full z-10 shadow-sm shadow-purple-500/50"></div>
                  )}
                  <button
                    onClick={() => handleNavClick('cross-institute-analytics')}
                    className={`w-full flex items-center gap-2.5 text-left py-2 px-2.5 rounded-lg text-[13px] transition-all cursor-pointer ${
                      isRouteActive('cross-institute-analytics')
                        ? 'bg-purple-600/20 text-purple-300 font-semibold border border-purple-500/30'
                        : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
                    }`}
                  >
                    <BarChart3 className={`w-3.5 h-3.5 shrink-0 ${isRouteActive('cross-institute-analytics') ? 'text-purple-400' : 'text-slate-400'}`} />
                    <span className="whitespace-nowrap truncate">Platform Analytics</span>
                  </button>
                </div>

                {/* System Broadcasts */}
                <div className="relative">
                  {isRouteActive('announcements') && (
                    <div className="absolute -left-[16px] top-1.5 bottom-1.5 w-1 bg-purple-500 rounded-full z-10 shadow-sm shadow-purple-500/50"></div>
                  )}
                  <button
                    onClick={() => handleNavClick('announcements')}
                    className={`w-full flex items-center gap-2.5 text-left py-2 px-2.5 rounded-lg text-[13px] transition-all cursor-pointer ${
                      isRouteActive('announcements')
                        ? 'bg-purple-600/20 text-purple-300 font-semibold border border-purple-500/30'
                        : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
                    }`}
                  >
                    <Megaphone className={`w-3.5 h-3.5 shrink-0 ${isRouteActive('announcements') ? 'text-purple-400' : 'text-slate-400'}`} />
                    <span className="whitespace-nowrap truncate">System Broadcasts</span>
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* 5. Group: System Governance */}
          <div className="pt-1">
            <button
              onClick={() => {
                if (collapsed) setCollapsed(false)
                setGovernanceOpen(!governanceOpen)
              }}
              title={collapsed ? "System Governance" : undefined}
              className={`w-full flex items-center justify-between px-3 py-2 rounded-xl transition-colors cursor-pointer group ${
                isGovernanceRoute 
                  ? 'text-purple-300 font-semibold bg-purple-500/10 border border-purple-500/20' 
                  : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              <div className="flex items-center gap-3 min-w-0">
                <Settings className={`w-[18px] h-[18px] shrink-0 transition-colors ${
                  isGovernanceRoute ? 'text-purple-400' : 'text-slate-400 group-hover:text-purple-400'
                }`} />
                {(!collapsed || isMobileOpen) && (
                  <span className="font-medium text-slate-200 group-hover:text-white whitespace-nowrap truncate">
                    System Governance
                  </span>
                )}
              </div>
              {(!collapsed || isMobileOpen) && (
                governanceOpen 
                  ? <ChevronUp className="w-3.5 h-3.5 text-slate-400 group-hover:text-slate-200" /> 
                  : <ChevronDown className="w-3.5 h-3.5 text-slate-400 group-hover:text-slate-200" />
              )}
            </button>

            {(!collapsed || isMobileOpen) && governanceOpen && (
              <div className="mt-1 pl-3.5 space-y-1 border-l border-slate-800 ml-5">
                {/* System Health */}
                <div className="relative">
                  {isRouteActive('system-health') && (
                    <div className="absolute -left-[16px] top-1.5 bottom-1.5 w-1 bg-purple-500 rounded-full z-10 shadow-sm shadow-purple-500/50"></div>
                  )}
                  <button
                    onClick={() => handleNavClick('system-health')}
                    className={`w-full flex items-center gap-2.5 text-left py-2 px-2.5 rounded-lg text-[13px] transition-all cursor-pointer ${
                      isRouteActive('system-health')
                        ? 'bg-purple-600/20 text-purple-300 font-semibold border border-purple-500/30'
                        : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
                    }`}
                  >
                    <Activity className={`w-3.5 h-3.5 shrink-0 ${isRouteActive('system-health') ? 'text-purple-400' : 'text-slate-400'}`} />
                    <span className="whitespace-nowrap truncate">System Health & Telemetry</span>
                  </button>
                </div>

                {/* Audit Logs */}
                <div className="relative">
                  {isRouteActive('audit-logs') && (
                    <div className="absolute -left-[16px] top-1.5 bottom-1.5 w-1 bg-purple-500 rounded-full z-10 shadow-sm shadow-purple-500/50"></div>
                  )}
                  <button
                    onClick={() => handleNavClick('audit-logs')}
                    className={`w-full flex items-center gap-2.5 text-left py-2 px-2.5 rounded-lg text-[13px] transition-all cursor-pointer ${
                      isRouteActive('audit-logs')
                        ? 'bg-purple-600/20 text-purple-300 font-semibold border border-purple-500/30'
                        : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
                    }`}
                  >
                    <ShieldCheck className={`w-3.5 h-3.5 shrink-0 ${isRouteActive('audit-logs') ? 'text-purple-400' : 'text-slate-400'}`} />
                    <span className="whitespace-nowrap truncate">Audit Logs</span>
                  </button>
                </div>

                {/* Backup & Disaster Recovery */}
                <div className="relative">
                  {isRouteActive('backup-data') && (
                    <div className="absolute -left-[16px] top-1.5 bottom-1.5 w-1 bg-purple-500 rounded-full z-10 shadow-sm shadow-purple-500/50"></div>
                  )}
                  <button
                    onClick={() => handleNavClick('backup-data')}
                    className={`w-full flex items-center gap-2.5 text-left py-2 px-2.5 rounded-lg text-[13px] transition-all cursor-pointer ${
                      isRouteActive('backup-data')
                        ? 'bg-purple-600/20 text-purple-300 font-semibold border border-purple-500/30'
                        : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
                    }`}
                  >
                    <Database className={`w-3.5 h-3.5 shrink-0 ${isRouteActive('backup-data') ? 'text-purple-400' : 'text-slate-400'}`} />
                    <span className="whitespace-nowrap truncate">Backups & Recovery</span>
                  </button>
                </div>

                {/* Platform Settings */}
                <div className="relative">
                  {isRouteActive('sa-settings') && (
                    <div className="absolute -left-[16px] top-1.5 bottom-1.5 w-1 bg-purple-500 rounded-full z-10 shadow-sm shadow-purple-500/50"></div>
                  )}
                  <button
                    onClick={() => handleNavClick('sa-settings')}
                    className={`w-full flex items-center gap-2.5 text-left py-2 px-2.5 rounded-lg text-[13px] transition-all cursor-pointer ${
                      isRouteActive('sa-settings')
                        ? 'bg-purple-600/20 text-purple-300 font-semibold border border-purple-500/30'
                        : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
                    }`}
                  >
                    <Settings className={`w-3.5 h-3.5 shrink-0 ${isRouteActive('sa-settings') ? 'text-purple-400' : 'text-slate-400'}`} />
                    <span className="whitespace-nowrap truncate">Platform Settings</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Clean Sign Out Footer matching dark theme */}
        <div className="p-3 border-t border-slate-800/80 bg-[#0B1120]">
          <button
            onClick={logout}
            className="w-full flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 border border-transparent hover:border-rose-500/20 transition-all text-xs font-semibold cursor-pointer group"
          >
            <LogOut className="w-4 h-4 shrink-0 text-slate-400 group-hover:text-rose-400 transition-colors" />
            {(!collapsed || isMobileOpen) && <span>Sign Out</span>}
          </button>
        </div>
      </aside>
    </>
  )
}

export default SuperadminSidebar
