import React, { useState, useEffect } from 'react'
import { 
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
  Lock
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
  
  const isPlatformRoute = ['institutes', 'platform-billing', 'platform-modules', 'cross-institute-analytics'].includes(currentRoute)
  const isUserRoute = ['users-all', 'users-roles', 'security-center'].includes(currentRoute)
  const isOperationsRoute = ['system-health', 'audit-logs', 'backup-data', 'communication', 'announcements', 'global-templates'].includes(currentRoute)

  // Accordion states with smart auto-open for active routes
  const [platformOpen, setPlatformOpen] = useState(true)
  const [usersOpen, setUsersOpen] = useState(isUserRoute)
  const [operationsOpen, setOperationsOpen] = useState(isOperationsRoute)

  // Auto-expand section when navigated
  useEffect(() => {
    if (isPlatformRoute) setPlatformOpen(true)
    if (isUserRoute) setUsersOpen(true)
    if (isOperationsRoute) setOperationsOpen(true)
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
        <div className="h-16 flex items-center justify-between px-4 border-b border-[#263353]/70 shrink-0">
          <div className="flex items-center gap-2.5 overflow-hidden">
            <div className="w-8 h-8 rounded-lg bg-blue-500/20 text-blue-400 flex items-center justify-center shrink-0">
              <Building2 className="w-4 h-4" />
            </div>
            {(!collapsed || isMobileOpen) && (
              <div className="flex flex-col truncate">
                <span className="text-xs font-bold text-white tracking-wide truncate">
                  EIMS Platform
                </span>
                <span className="text-[10px] text-blue-400 font-semibold uppercase tracking-wider">
                  Super Admin
                </span>
              </div>
            )}
          </div>
          
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

          {/* Group 1: Platform & Campuses */}
          <div className="pt-2">
            <button
              onClick={() => {
                if (collapsed) setCollapsed(false)
                setPlatformOpen(!platformOpen)
              }}
              className="w-full flex items-center justify-between px-3.5 py-2 rounded-lg text-slate-300 hover:text-white hover:bg-[#243150] transition-colors cursor-pointer"
            >
              <div className="flex items-center gap-3">
                <School className="w-[18px] h-[18px] text-blue-400 shrink-0" />
                {(!collapsed || isMobileOpen) && <span className="font-medium text-xs uppercase tracking-wider text-slate-400">Platform & Campuses</span>}
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
                  <Building2 className="w-3.5 h-3.5 opacity-80 text-blue-400" />
                  <span>Institutes & Campuses</span>
                </button>
                <button
                  onClick={() => handleNavClick('platform-billing')}
                  className={`w-full flex items-center gap-2.5 text-left py-2 px-2.5 rounded-md text-[13px] transition-colors cursor-pointer ${
                    isRouteActive('platform-billing') ? 'text-white font-medium bg-[#243150]' : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <CreditCard className="w-3.5 h-3.5 opacity-80 text-emerald-400" />
                  <span>Subscriptions & Billing</span>
                </button>
                <button
                  onClick={() => handleNavClick('platform-modules')}
                  className={`w-full flex items-center gap-2.5 text-left py-2 px-2.5 rounded-md text-[13px] transition-colors cursor-pointer ${
                    isRouteActive('platform-modules') ? 'text-white font-medium bg-[#243150]' : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <Sliders className="w-3.5 h-3.5 opacity-80 text-indigo-400" />
                  <span>Module Control Matrix</span>
                </button>
                <button
                  onClick={() => handleNavClick('cross-institute-analytics')}
                  className={`w-full flex items-center gap-2.5 text-left py-2 px-2.5 rounded-md text-[13px] transition-colors cursor-pointer ${
                    isRouteActive('cross-institute-analytics') ? 'text-white font-medium bg-[#243150]' : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <BarChart3 className="w-3.5 h-3.5 opacity-80 text-amber-400" />
                  <span>Cross-Campus Analytics</span>
                </button>
              </div>
            )}
          </div>

          {/* Group 2: Users & Security */}
          <div className="pt-2">
            <button
              onClick={() => {
                if (collapsed) setCollapsed(false)
                setUsersOpen(!usersOpen)
              }}
              className="w-full flex items-center justify-between px-3.5 py-2 rounded-lg text-slate-300 hover:text-white hover:bg-[#243150] transition-colors cursor-pointer"
            >
              <div className="flex items-center gap-3">
                <Users className="w-[18px] h-[18px] text-indigo-400 shrink-0" />
                {(!collapsed || isMobileOpen) && <span className="font-medium text-xs uppercase tracking-wider text-slate-400">Users & Security</span>}
              </div>
              {(!collapsed || isMobileOpen) && (
                usersOpen ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />
              )}
            </button>
            
            {(!collapsed || isMobileOpen) && usersOpen && (
              <div className="mt-1 pl-4 pr-1 space-y-0.5 border-l border-[#2e3d64] ml-5">
                <button
                  onClick={() => handleNavClick('users-all')}
                  className={`w-full flex items-center gap-2.5 text-left py-2 px-2.5 rounded-md text-[13px] transition-colors cursor-pointer ${
                    isRouteActive('users-all') ? 'text-white font-medium bg-[#243150]' : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <Users className="w-3.5 h-3.5 opacity-80 text-indigo-400" />
                  <span>All Platform Users</span>
                </button>
                <button
                  onClick={() => handleNavClick('users-roles')}
                  className={`w-full flex items-center gap-2.5 text-left py-2 px-2.5 rounded-md text-[13px] transition-colors cursor-pointer ${
                    isRouteActive('users-roles') ? 'text-white font-medium bg-[#243150]' : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <ShieldCheck className="w-3.5 h-3.5 opacity-80 text-emerald-400" />
                  <span>Roles & RBAC Matrix</span>
                </button>
                <button
                  onClick={() => handleNavClick('security-center')}
                  className={`w-full flex items-center gap-2.5 text-left py-2 px-2.5 rounded-md text-[13px] transition-colors cursor-pointer ${
                    isRouteActive('security-center') ? 'text-white font-medium bg-[#243150]' : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <Lock className="w-3.5 h-3.5 opacity-80 text-rose-400" />
                  <span>Security & Access Control</span>
                </button>
              </div>
            )}
          </div>

          {/* Group 3: Operations & System */}
          <div className="pt-2">
            <button
              onClick={() => {
                if (collapsed) setCollapsed(false)
                setOperationsOpen(!operationsOpen)
              }}
              className="w-full flex items-center justify-between px-3.5 py-2 rounded-lg text-slate-300 hover:text-white hover:bg-[#243150] transition-colors cursor-pointer"
            >
              <div className="flex items-center gap-3">
                <Database className="w-[18px] h-[18px] text-emerald-400 shrink-0" />
                {(!collapsed || isMobileOpen) && <span className="font-medium text-xs uppercase tracking-wider text-slate-400">Operations & Logs</span>}
              </div>
              {(!collapsed || isMobileOpen) && (
                operationsOpen ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />
              )}
            </button>

            {(!collapsed || isMobileOpen) && operationsOpen && (
              <div className="mt-1 pl-4 pr-1 space-y-0.5 border-l border-[#2e3d64] ml-5">
                <button
                  onClick={() => handleNavClick('system-health')}
                  className={`w-full flex items-center gap-2.5 text-left py-2 px-2.5 rounded-md text-[13px] transition-colors cursor-pointer ${
                    isRouteActive('system-health') ? 'text-white font-medium bg-[#243150]' : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <Activity className="w-3.5 h-3.5 opacity-80 text-teal-400" />
                  <span>System Health Monitor</span>
                </button>
                <button
                  onClick={() => handleNavClick('audit-logs')}
                  className={`w-full flex items-center gap-2.5 text-left py-2 px-2.5 rounded-md text-[13px] transition-colors cursor-pointer ${
                    isRouteActive('audit-logs') ? 'text-white font-medium bg-[#243150]' : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <ShieldCheck className="w-3.5 h-3.5 opacity-80 text-blue-400" />
                  <span>Audit & Security Logs</span>
                </button>
                <button
                  onClick={() => handleNavClick('backup-data')}
                  className={`w-full flex items-center gap-2.5 text-left py-2 px-2.5 rounded-md text-[13px] transition-colors cursor-pointer ${
                    isRouteActive('backup-data') ? 'text-white font-medium bg-[#243150]' : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <Database className="w-3.5 h-3.5 opacity-80 text-amber-400" />
                  <span>Backup & Data Operations</span>
                </button>
                <button
                  onClick={() => handleNavClick('communication')}
                  className={`w-full flex items-center gap-2.5 text-left py-2 px-2.5 rounded-md text-[13px] transition-colors cursor-pointer ${
                    isRouteActive('communication') ? 'text-white font-medium bg-[#243150]' : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <MessageSquare className="w-3.5 h-3.5 opacity-80 text-purple-400" />
                  <span>SMS & Gateway Alerts</span>
                </button>
                <button
                  onClick={() => handleNavClick('announcements')}
                  className={`w-full flex items-center gap-2.5 text-left py-2 px-2.5 rounded-md text-[13px] transition-colors cursor-pointer ${
                    isRouteActive('announcements') ? 'text-white font-medium bg-[#243150]' : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <Megaphone className="w-3.5 h-3.5 opacity-80 text-rose-400" />
                  <span>Broadcast Directives</span>
                </button>
                <button
                  onClick={() => handleNavClick('global-templates')}
                  className={`w-full flex items-center gap-2.5 text-left py-2 px-2.5 rounded-md text-[13px] transition-colors cursor-pointer ${
                    isRouteActive('global-templates') ? 'text-white font-medium bg-[#243150]' : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <FileSpreadsheet className="w-3.5 h-3.5 opacity-80 text-indigo-400" />
                  <span>Global Master Templates</span>
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