import React, { useState } from 'react'
import { 
  LayoutDashboard, 
  Users, 
  Building2, 
  GraduationCap, 
  ChevronDown, 
  ChevronUp, 
  ChevronLeft, 
  ChevronRight, 
  School, 
  Network, 
  FileCheck, 
  Calendar, 
  Layers, 
  BookOpen, 
  Bookmark, 
  FileText, 
  LogOut, 
  X, 
  Megaphone, 
  DollarSign, 
  Bus, 
  BookMarked, 
  UserCheck, 
  MessageSquare, 
  ShieldCheck, 
  Briefcase,
  Sliders,
  BarChart3,
  CreditCard,
  FileSpreadsheet,
  Database,
  Activity,
  LifeBuoy
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
  
  const isPlatformRoute = ['institutes', 'platform-modules', 'security-center', 'global-templates'].includes(currentRoute)
  const isAnalyticsRoute = ['cross-institute-analytics', 'platform-billing'].includes(currentRoute)
  const isUserRoute = ['users-all', 'users-roles'].includes(currentRoute)
  const isInstituteRoute = ['departments', 'examination-bodies'].includes(currentRoute)
  const isAcademicsRoute = ['academic-years', 'program-types', 'programs', 'subjects', 'study-schemes'].includes(currentRoute)
  const isOperationsRoute = ['backup-data', 'system-health', 'support-approvals'].includes(currentRoute)
  const isEnterpriseRoute = ['finance', 'transport', 'library', 'admissions-pipeline', 'communication', 'audit-logs', 'announcements'].includes(currentRoute)

  // Accordion states with smart auto-open for active routes
  const [platformOpen, setPlatformOpen] = useState(isPlatformRoute)
  const [analyticsOpen, setAnalyticsOpen] = useState(isAnalyticsRoute)
  const [usersOpen, setUsersOpen] = useState(isUserRoute)
  const [instituteOpen, setInstituteOpen] = useState(isInstituteRoute)
  const [academicsOpen, setAcademicsOpen] = useState(isAcademicsRoute)
  const [operationsOpen, setOperationsOpen] = useState(isOperationsRoute)
  const [enterpriseOpen, setEnterpriseOpen] = useState(isEnterpriseRoute)

  // Auto-expand section when navigated
  React.useEffect(() => {
    if (isPlatformRoute) setPlatformOpen(true)
    if (isAnalyticsRoute) setAnalyticsOpen(true)
    if (isUserRoute) setUsersOpen(true)
    if (isInstituteRoute) setInstituteOpen(true)
    if (isAcademicsRoute) setAcademicsOpen(true)
    if (isOperationsRoute) setOperationsOpen(true)
    if (isEnterpriseRoute) setEnterpriseOpen(true)
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
          className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-40 lg:hidden"
        />
      )}

      <aside 
        className={`
          fixed lg:static top-0 bottom-0 left-0 z-50
          ${isMobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
          ${collapsed ? 'lg:w-20' : 'w-64'} 
          min-h-screen bg-[#1a233a] text-slate-300 flex flex-col 
          transition-all duration-300 shrink-0 border-r border-[#263353] select-none
        `}
      >
        {/* Top Header */}
        <div className="h-16 flex items-center justify-between px-5 border-b border-[#263353]/70 shrink-0">
          {(!collapsed || isMobileOpen) && (
            <div className="flex flex-col">
              <span className="text-base font-bold text-white tracking-wide leading-tight">admin</span>
              <span className="text-xs text-slate-400 font-normal">Superadmin Central</span>
            </div>
          )}
          
          {/* Mobile Close Button */}
          <button 
            onClick={onCloseMobile}
            className="lg:hidden text-slate-400 hover:text-white p-1 rounded hover:bg-[#253252] transition-colors ml-auto cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Desktop Collapse Button */}
          <button 
            onClick={() => setCollapsed(!collapsed)}
            className="hidden lg:block text-slate-400 hover:text-white p-1 rounded hover:bg-[#253252] transition-colors ml-auto cursor-pointer"
            title={collapsed ? "Expand Sidebar" : "Collapse Sidebar"}
          >
            {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
          </button>
        </div>

        {/* Navigation Menu */}
        <div className="flex-1 py-4 px-3 space-y-1 overflow-y-auto dark-scroll text-[13.5px]">
          {/* Dashboard */}
          <button
            onClick={() => handleNavClick('dashboard')}
            className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-lg transition-all text-left cursor-pointer ${
              isRouteActive('dashboard')
                ? 'bg-white text-[#1a233a] font-semibold shadow-sm'
                : 'text-slate-300 hover:text-white hover:bg-[#243150]'
            }`}
          >
            <LayoutDashboard className={`w-[18px] h-[18px] shrink-0 ${isRouteActive('dashboard') ? 'text-[#1a233a]' : 'text-slate-400'}`} />
            {(!collapsed || isMobileOpen) && <span>Dashboard</span>}
          </button>

          {/* Platform Control Accordion */}
          <div>
            <button
              onClick={() => {
                if (collapsed) setCollapsed(false)
                setPlatformOpen(!platformOpen)
              }}
              className="w-full flex items-center justify-between px-3.5 py-2.5 rounded-lg text-slate-300 hover:text-white hover:bg-[#243150] transition-colors cursor-pointer"
            >
              <div className="flex items-center gap-3">
                <Sliders className="w-[18px] h-[18px] text-blue-400 shrink-0" />
                {(!collapsed || isMobileOpen) && <span>Platform Control</span>}
              </div>
              {(!collapsed || isMobileOpen) && (
                platformOpen ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />
              )}
            </button>

            {(!collapsed || isMobileOpen) && platformOpen && (
              <div className="mt-1 pl-4 pr-1 space-y-0.5 border-l border-[#2e3d64] ml-5">
                <button
                  onClick={() => handleNavClick('institutes')}
                  className={`w-full flex items-center gap-2.5 text-left py-2 px-2.5 rounded-md text-[13px] transition-colors cursor-pointer ${
                    isRouteActive('institutes') ? 'text-white font-medium bg-[#243150]' : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <School className="w-3.5 h-3.5 opacity-70" />
                  <span>Institutes & Campuses</span>
                </button>
                <button
                  onClick={() => handleNavClick('platform-modules')}
                  className={`w-full flex items-center gap-2.5 text-left py-2 px-2.5 rounded-md text-[13px] transition-colors cursor-pointer ${
                    isRouteActive('platform-modules') ? 'text-white font-medium bg-[#243150]' : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <Sliders className="w-3.5 h-3.5 opacity-70" />
                  <span>Module Control Matrix</span>
                </button>
                <button
                  onClick={() => handleNavClick('security-center')}
                  className={`w-full flex items-center gap-2.5 text-left py-2 px-2.5 rounded-md text-[13px] transition-colors cursor-pointer ${
                    isRouteActive('security-center') ? 'text-white font-medium bg-[#243150]' : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <ShieldCheck className="w-3.5 h-3.5 opacity-70" />
                  <span>Security Center</span>
                </button>
                <button
                  onClick={() => handleNavClick('global-templates')}
                  className={`w-full flex items-center gap-2.5 text-left py-2 px-2.5 rounded-md text-[13px] transition-colors cursor-pointer ${
                    isRouteActive('global-templates') ? 'text-white font-medium bg-[#243150]' : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <FileSpreadsheet className="w-3.5 h-3.5 opacity-70" />
                  <span>Global Master Templates</span>
                </button>
              </div>
            )}
          </div>

          {/* Analytics & Business Accordion */}
          <div>
            <button
              onClick={() => {
                if (collapsed) setCollapsed(false)
                setAnalyticsOpen(!analyticsOpen)
              }}
              className="w-full flex items-center justify-between px-3.5 py-2.5 rounded-lg text-slate-300 hover:text-white hover:bg-[#243150] transition-colors cursor-pointer"
            >
              <div className="flex items-center gap-3">
                <BarChart3 className="w-[18px] h-[18px] text-emerald-400 shrink-0" />
                {(!collapsed || isMobileOpen) && <span>Analytics & Business</span>}
              </div>
              {(!collapsed || isMobileOpen) && (
                analyticsOpen ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />
              )}
            </button>

            {(!collapsed || isMobileOpen) && analyticsOpen && (
              <div className="mt-1 pl-4 pr-1 space-y-0.5 border-l border-[#2e3d64] ml-5">
                <button
                  onClick={() => handleNavClick('cross-institute-analytics')}
                  className={`w-full flex items-center gap-2.5 text-left py-2 px-2.5 rounded-md text-[13px] transition-colors cursor-pointer ${
                    isRouteActive('cross-institute-analytics') ? 'text-white font-medium bg-[#243150]' : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <BarChart3 className="w-3.5 h-3.5 opacity-70" />
                  <span>Cross-Institute Analytics</span>
                </button>
                <button
                  onClick={() => handleNavClick('platform-billing')}
                  className={`w-full flex items-center gap-2.5 text-left py-2 px-2.5 rounded-md text-[13px] transition-colors cursor-pointer ${
                    isRouteActive('platform-billing') ? 'text-white font-medium bg-[#243150]' : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <CreditCard className="w-3.5 h-3.5 opacity-70" />
                  <span>Subscriptions & Billing</span>
                </button>
              </div>
            )}
          </div>

          {/* Users Management */}
          <div>
            <button
              onClick={() => {
                if (collapsed) setCollapsed(false)
                setUsersOpen(!usersOpen)
              }}
              className="w-full flex items-center justify-between px-3.5 py-2.5 rounded-lg text-slate-300 hover:text-white hover:bg-[#243150] transition-colors cursor-pointer"
            >
              <div className="flex items-center gap-3">
                <Users className="w-[18px] h-[18px] text-slate-400 shrink-0" />
                {(!collapsed || isMobileOpen) && <span>Users Management</span>}
              </div>
              {(!collapsed || isMobileOpen) && (
                usersOpen ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />
              )}
            </button>
            
            {(!collapsed || isMobileOpen) && usersOpen && (
              <div className="mt-1 pl-9 pr-1 space-y-1">
                <button
                  onClick={() => handleNavClick('users-all')}
                  className={`w-full text-left py-2 px-3 rounded-md text-[13px] transition-colors cursor-pointer ${
                    isRouteActive('users-all') ? 'text-white font-medium bg-[#243150]' : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  All Users
                </button>
                <button
                  onClick={() => handleNavClick('users-roles')}
                  className={`w-full text-left py-2 px-3 rounded-md text-[13px] transition-colors cursor-pointer ${
                    isRouteActive('users-roles') ? 'text-white font-medium bg-[#243150]' : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  Roles & Permissions
                </button>
              </div>
            )}
          </div>

          {/* Institute Management */}
          <div>
            <button
              onClick={() => {
                if (collapsed) setCollapsed(false)
                setInstituteOpen(!instituteOpen)
              }}
              className="w-full flex items-center justify-between px-3.5 py-2.5 rounded-lg text-slate-300 hover:text-white hover:bg-[#243150] transition-colors cursor-pointer"
            >
              <div className="flex items-center gap-3">
                <Building2 className="w-[18px] h-[18px] text-slate-400 shrink-0" />
                {(!collapsed || isMobileOpen) && <span>Institute Structure</span>}
              </div>
              {(!collapsed || isMobileOpen) && (
                instituteOpen ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />
              )}
            </button>

            {(!collapsed || isMobileOpen) && instituteOpen && (
              <div className="mt-1 pl-4 pr-1 space-y-0.5 border-l border-[#2e3d64] ml-5">
                <button
                  onClick={() => handleNavClick('departments')}
                  className={`w-full flex items-center gap-2.5 text-left py-2 px-2.5 rounded-md text-[13px] transition-colors cursor-pointer ${
                    isRouteActive('departments') ? 'text-white font-medium bg-[#243150]' : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <Network className="w-3.5 h-3.5 opacity-70" />
                  <span>Departments</span>
                </button>
                <button
                  onClick={() => handleNavClick('examination-bodies')}
                  className={`w-full flex items-center gap-2.5 text-left py-2 px-2.5 rounded-md text-[13px] transition-colors cursor-pointer ${
                    isRouteActive('examination-bodies') ? 'text-white font-medium bg-[#243150]' : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <FileCheck className="w-3.5 h-3.5 opacity-70" />
                  <span>Examination Bodies</span>
                </button>
              </div>
            )}
          </div>

          {/* Academics */}
          <div>
            <button
              onClick={() => {
                if (collapsed) setCollapsed(false)
                setAcademicsOpen(!academicsOpen)
              }}
              className="w-full flex items-center justify-between px-3.5 py-2.5 rounded-lg text-slate-300 hover:text-white hover:bg-[#243150] transition-colors cursor-pointer"
            >
              <div className="flex items-center gap-3">
                <GraduationCap className="w-[18px] h-[18px] text-slate-400 shrink-0" />
                {(!collapsed || isMobileOpen) && <span>Academics</span>}
              </div>
              {(!collapsed || isMobileOpen) && (
                academicsOpen ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />
              )}
            </button>

            {(!collapsed || isMobileOpen) && academicsOpen && (
              <div className="mt-1 pl-4 pr-1 space-y-0.5 border-l border-[#2e3d64] ml-5">
                <button
                  onClick={() => handleNavClick('academic-years')}
                  className={`w-full flex items-center gap-2.5 text-left py-2 px-2.5 rounded-md text-[13px] transition-colors cursor-pointer ${
                    isRouteActive('academic-years') ? 'text-white font-medium bg-[#243150]' : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <Calendar className="w-3.5 h-3.5 opacity-70" />
                  <span>Academic years</span>
                </button>
                <button
                  onClick={() => handleNavClick('program-types')}
                  className={`w-full flex items-center gap-2.5 text-left py-2 px-2.5 rounded-md text-[13px] transition-colors cursor-pointer ${
                    isRouteActive('program-types') ? 'text-white font-medium bg-[#243150]' : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <Layers className="w-3.5 h-3.5 opacity-70" />
                  <span>Program Types</span>
                </button>
                <button
                  onClick={() => handleNavClick('programs')}
                  className={`w-full flex items-center gap-2.5 text-left py-2 px-2.5 rounded-md text-[13px] transition-colors cursor-pointer ${
                    isRouteActive('programs') ? 'text-white font-medium bg-[#243150]' : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <BookOpen className="w-3.5 h-3.5 opacity-70" />
                  <span>Programs</span>
                </button>
                <button
                  onClick={() => handleNavClick('subjects')}
                  className={`w-full flex items-center gap-2.5 text-left py-2 px-2.5 rounded-md text-[13px] transition-colors cursor-pointer ${
                    isRouteActive('subjects') ? 'text-white font-medium bg-[#243150]' : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <Bookmark className="w-3.5 h-3.5 opacity-70" />
                  <span>Subjects</span>
                </button>
                <button
                  onClick={() => handleNavClick('study-schemes')}
                  className={`w-full flex items-center gap-2.5 text-left py-2 px-2.5 rounded-md text-[13px] transition-colors cursor-pointer ${
                    isRouteActive('study-schemes') ? 'text-white font-medium bg-[#243150]' : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <FileText className="w-3.5 h-3.5 opacity-70" />
                  <span>Study Schemes</span>
                </button>
              </div>
            )}
          </div>

          {/* Operations & Health Accordion */}
          <div>
            <button
              onClick={() => {
                if (collapsed) setCollapsed(false)
                setOperationsOpen(!operationsOpen)
              }}
              className="w-full flex items-center justify-between px-3.5 py-2.5 rounded-lg text-slate-300 hover:text-white hover:bg-[#243150] transition-colors cursor-pointer"
            >
              <div className="flex items-center gap-3">
                <Database className="w-[18px] h-[18px] text-cyan-400 shrink-0" />
                {(!collapsed || isMobileOpen) && <span>Operations & Health</span>}
              </div>
              {(!collapsed || isMobileOpen) && (
                operationsOpen ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />
              )}
            </button>

            {(!collapsed || isMobileOpen) && operationsOpen && (
              <div className="mt-1 pl-4 pr-1 space-y-0.5 border-l border-[#2e3d64] ml-5">
                <button
                  onClick={() => handleNavClick('backup-data')}
                  className={`w-full flex items-center gap-2.5 text-left py-2 px-2.5 rounded-md text-[13px] transition-colors cursor-pointer ${
                    isRouteActive('backup-data') ? 'text-white font-medium bg-[#243150]' : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <Database className="w-3.5 h-3.5 opacity-70" />
                  <span>Backup & Data Operations</span>
                </button>
                <button
                  onClick={() => handleNavClick('system-health')}
                  className={`w-full flex items-center gap-2.5 text-left py-2 px-2.5 rounded-md text-[13px] transition-colors cursor-pointer ${
                    isRouteActive('system-health') ? 'text-white font-medium bg-[#243150]' : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <Activity className="w-3.5 h-3.5 opacity-70" />
                  <span>System Health Monitor</span>
                </button>
                <button
                  onClick={() => handleNavClick('support-approvals')}
                  className={`w-full flex items-center gap-2.5 text-left py-2 px-2.5 rounded-md text-[13px] transition-colors cursor-pointer ${
                    isRouteActive('support-approvals') ? 'text-white font-medium bg-[#243150]' : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <LifeBuoy className="w-3.5 h-3.5 opacity-70" />
                  <span>Support & Approvals</span>
                </button>
              </div>
            )}
          </div>

          {/* Enterprise Operations Accordion Dropdown */}
          <div>
            <button
              onClick={() => {
                if (collapsed) setCollapsed(false)
                setEnterpriseOpen(!enterpriseOpen)
              }}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-lg transition-colors cursor-pointer ${
                isEnterpriseRoute 
                  ? 'text-white bg-[#243150]/70 font-medium' 
                  : 'text-slate-300 hover:text-white hover:bg-[#243150]'
              }`}
            >
              <div className="flex items-center gap-3">
                <Briefcase className={`w-[18px] h-[18px] shrink-0 ${isEnterpriseRoute ? 'text-blue-400' : 'text-slate-400'}`} />
                {(!collapsed || isMobileOpen) && <span>Enterprise Operations</span>}
              </div>
              {(!collapsed || isMobileOpen) && (
                enterpriseOpen ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />
              )}
            </button>

            {(!collapsed || isMobileOpen) && enterpriseOpen && (
              <div className="mt-1 pl-4 pr-1 space-y-0.5 border-l border-[#2e3d64] ml-5">
                <button
                  onClick={() => handleNavClick('finance')}
                  className={`w-full flex items-center gap-2.5 text-left py-2 px-2.5 rounded-md text-[13px] transition-colors cursor-pointer ${
                    isRouteActive('finance') ? 'text-white font-medium bg-[#243150]' : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <DollarSign className="w-3.5 h-3.5 opacity-80 text-emerald-400 shrink-0" />
                  <span className="truncate">Financial Analytics</span>
                </button>
                <button
                  onClick={() => handleNavClick('transport')}
                  className={`w-full flex items-center gap-2.5 text-left py-2 px-2.5 rounded-md text-[13px] transition-colors cursor-pointer ${
                    isRouteActive('transport') ? 'text-white font-medium bg-[#243150]' : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <Bus className="w-3.5 h-3.5 opacity-80 text-amber-400 shrink-0" />
                  <span className="truncate">Transport & Fleet</span>
                </button>
                <button
                  onClick={() => handleNavClick('library')}
                  className={`w-full flex items-center gap-2.5 text-left py-2 px-2.5 rounded-md text-[13px] transition-colors cursor-pointer ${
                    isRouteActive('library') ? 'text-white font-medium bg-[#243150]' : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <BookMarked className="w-3.5 h-3.5 opacity-80 text-indigo-400 shrink-0" />
                  <span className="truncate">Central Library</span>
                </button>
                <button
                  onClick={() => handleNavClick('admissions-pipeline')}
                  className={`w-full flex items-center gap-2.5 text-left py-2 px-2.5 rounded-md text-[13px] transition-colors cursor-pointer ${
                    isRouteActive('admissions-pipeline') ? 'text-white font-medium bg-[#243150]' : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <UserCheck className="w-3.5 h-3.5 opacity-80 text-teal-400 shrink-0" />
                  <span className="truncate">Admission Pipeline</span>
                </button>
                <button
                  onClick={() => handleNavClick('communication')}
                  className={`w-full flex items-center gap-2.5 text-left py-2 px-2.5 rounded-md text-[13px] transition-colors cursor-pointer ${
                    isRouteActive('communication') ? 'text-white font-medium bg-[#243150]' : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <MessageSquare className="w-3.5 h-3.5 opacity-80 text-purple-400 shrink-0" />
                  <span className="truncate">SMS / WhatsApp Alerts</span>
                </button>
                <button
                  onClick={() => handleNavClick('audit-logs')}
                  className={`w-full flex items-center gap-2.5 text-left py-2 px-2.5 rounded-md text-[13px] transition-colors cursor-pointer ${
                    isRouteActive('audit-logs') ? 'text-white font-medium bg-[#243150]' : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <ShieldCheck className="w-3.5 h-3.5 opacity-80 text-blue-400 shrink-0" />
                  <span className="truncate">Audit & Security Logs</span>
                </button>
                <button
                  onClick={() => handleNavClick('announcements')}
                  className={`w-full flex items-center gap-2.5 text-left py-2 px-2.5 rounded-md text-[13px] transition-colors cursor-pointer ${
                    isRouteActive('announcements') ? 'text-white font-medium bg-[#243150]' : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <Megaphone className="w-3.5 h-3.5 opacity-80 text-rose-400 shrink-0" />
                  <span className="truncate">Broadcast Directives</span>
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Clean Sign Out Footer */}
        <div className="p-3 border-t border-[#263353] bg-[#141b2d]">
          <button
            onClick={logout}
            className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition-colors text-xs font-semibold cursor-pointer"
          >
            <LogOut className="w-4 h-4 shrink-0" />
            {(!collapsed || isMobileOpen) && <span>Sign Out</span>}
          </button>
        </div>
      </aside>
    </>
  )
}

export default SuperadminSidebar
