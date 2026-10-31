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
  MessageSquare, 
  ShieldCheck, 
  Sliders, 
  BarChart3, 
  CreditCard, 
  FileSpreadsheet, 
  Database, 
  Activity,
  Lock,
  ArrowLeftRight,
  ShieldAlert,
  Calendar,
  Layers,
  DollarSign,
  TrendingUp,
  FileText,
  CheckSquare,
  BookOpen,
  Clock,
  AlertTriangle,
  UserCheck,
  Mail,
  AlertOctagon,
  History,
  Share2,
  Settings,
  Globe,
  Key,
  Download
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
  const isCommunicationRoute = typeof currentRoute === 'string' && currentRoute.startsWith('sa-comm-')
  const isReportsRoute = typeof currentRoute === 'string' && currentRoute.startsWith('sa-reports-')
  const isPoliciesRoute = typeof currentRoute === 'string' && currentRoute.startsWith('sa-policies-')
  const isSettingsRoute = typeof currentRoute === 'string' && currentRoute.startsWith('sa-settings-')

  // Dynamic pending approval count synced in real-time
  const [pendingApprovalsCount, setPendingApprovalsCount] = useState(0)
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

    updateCount()
    updateCampusCount()
    updateUserCount()
    window.addEventListener('sms_approval_created', updateCount)
    window.addEventListener('sms_approvals_updated', updateCount)
    window.addEventListener('sms_institutes_updated', updateCampusCount)
    window.addEventListener('sms_users_updated', updateUserCount)
    window.addEventListener('storage', updateCount)
    window.addEventListener('storage', updateCampusCount)
    window.addEventListener('storage', updateUserCount)
    return () => {
      window.removeEventListener('sms_approval_created', updateCount)
      window.removeEventListener('sms_approvals_updated', updateCount)
      window.removeEventListener('sms_institutes_updated', updateCampusCount)
      window.removeEventListener('sms_users_updated', updateUserCount)
      window.removeEventListener('storage', updateCount)
      window.removeEventListener('storage', updateCampusCount)
      window.removeEventListener('storage', updateUserCount)
    }
  }, [])

  // Accordion states with smart auto-open for active routes
  const [platformOpen, setPlatformOpen] = useState(true)
  const [usersOpen, setUsersOpen] = useState(isUserRoute)
  const [operationsOpen, setOperationsOpen] = useState(isOperationsRoute)
  const [communicationOpen, setCommunicationOpen] = useState(isCommunicationRoute)
  const [reportsOpen, setReportsOpen] = useState(isReportsRoute)
  const [policiesOpen, setPoliciesOpen] = useState(isPoliciesRoute)
  const [settingsOpen, setSettingsOpen] = useState(isSettingsRoute)

  const closeAllGroups = () => {
    setPlatformOpen(false)
    setUsersOpen(false)
    setOperationsOpen(false)
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
    if (isCommunicationRoute) { closeAllGroups(); setCommunicationOpen(true); return; }
    if (isReportsRoute) { closeAllGroups(); setReportsOpen(true); return; }
    if (isPoliciesRoute) { closeAllGroups(); setPoliciesOpen(true); return; }
    if (isSettingsRoute) { closeAllGroups(); setSettingsOpen(true); return; }
  }, [currentRoute, isPlatformRoute, isUserRoute, isOperationsRoute, isCommunicationRoute, isReportsRoute, isPoliciesRoute, isSettingsRoute])

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
              <span>Platform Governance</span>
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
                    <div className="flex items-center gap-2.5">
                      <Building2 className={`w-3.5 h-3.5 shrink-0 ${isRouteActive('institutes') ? 'text-purple-600' : 'text-slate-400'}`} />
                      <span>All Campuses</span>
                    </div>
                    {campusesCount > 0 && (
                      <span className="text-[10px] font-bold px-1.5 py-0.2 rounded-full bg-slate-100 text-slate-600">
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
                    <div className="flex items-center gap-2.5">
                      <CheckSquare className={`w-3.5 h-3.5 shrink-0 ${isRouteActive('support-approvals') ? 'text-purple-600' : 'text-slate-400'}`} />
                      <span>Pending Approvals</span>
                    </div>
                    {pendingApprovalsCount > 0 && (
                      <span className="text-[10px] font-bold px-1.5 py-0.2 rounded-full bg-rose-500 text-white animate-pulse">
                        {pendingApprovalsCount}
                      </span>
                    )}
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
                <Users className="w-[18px] h-[18px] text-slate-400 group-hover:text-purple-600 transition-colors shrink-0" />
                {(!collapsed || isMobileOpen) && (
                  <span className="font-medium text-slate-600 group-hover:text-slate-900">
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
                    className={`w-full flex items-center justify-between text-left py-2 px-2.5 rounded-lg text-[13px] transition-all cursor-pointer ${
                      isRouteActive('users-all')
                        ? 'bg-[#f5eeff] text-purple-700 font-semibold'
                        : 'text-slate-500 hover:text-slate-900 hover:bg-slate-50'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <Users className={`w-3.5 h-3.5 shrink-0 ${isRouteActive('users-all') ? 'text-purple-600' : 'text-slate-400'}`} />
                      <span>All Users</span>
                    </div>
                    {usersCount > 0 && (
                      <span className="text-[10px] font-bold px-1.5 py-0.2 rounded-full bg-slate-100 text-slate-600">
                        {usersCount}
                      </span>
                    )}
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
                    className={`w-full flex items-center gap-2.5 text-left py-2 px-2.5 rounded-lg text-[13px] transition-all cursor-pointer ${
                      isRouteActive('security-center')
                        ? 'bg-[#f5eeff] text-purple-700 font-semibold'
                        : 'text-slate-500 hover:text-slate-900 hover:bg-slate-50'
                    }`}
                  >
                    <Lock className={`w-3.5 h-3.5 shrink-0 ${isRouteActive('security-center') ? 'text-purple-600' : 'text-slate-400'}`} />
                    <span>Security Center</span>
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* 4. Group: Operations & System Health */}
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

          {/* 5. Group: Communication Hub */}
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
                        title={item.label}
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

          {/* 6. Group: Reports & Analytics */}
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
                        title={item.label}
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

          {/* 7. Group: Policies & Guidelines */}
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
                        title={item.label}
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

          {/* 8. Group: Platform Settings */}
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
                        title={item.label}
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