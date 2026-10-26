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
  GraduationCap
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
        {/* Top Brand Header matching "ia Academy" style */}
        <div className="h-18 flex items-center justify-between px-5 border-b border-slate-100 shrink-0">
          <div className="flex items-center gap-2.5 overflow-hidden">
            <div className="w-8 h-8 rounded-full bg-purple-600/10 text-purple-600 flex items-center justify-center shrink-0 font-bold text-xs">
              <span className="font-extrabold tracking-tighter">ia</span>
            </div>
            {(!collapsed || isMobileOpen) && (
              <div className="flex items-baseline gap-1 truncate">
                <span className="text-base font-extrabold text-purple-600 font-heading">
                  ia
                </span>
                <span className="text-base font-bold text-slate-800 font-heading">
                  Academy
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

          {/* 2. Group: Campuses & Wings */}
          <div className="pt-2">
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
                    className={`w-full flex items-center gap-2.5 text-left py-2 px-2.5 rounded-lg text-[13px] transition-all cursor-pointer ${
                      isRouteActive('institutes')
                        ? 'bg-[#f5eeff] text-purple-700 font-semibold'
                        : 'text-slate-500 hover:text-slate-900 hover:bg-slate-50'
                    }`}
                  >
                    <Building2 className={`w-3.5 h-3.5 shrink-0 ${isRouteActive('institutes') ? 'text-purple-600' : 'text-slate-400'}`} />
                    <span>All Campuses</span>
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
              className="w-full flex items-center justify-between px-3 py-2 rounded-xl text-slate-500 hover:text-slate-800 hover:bg-slate-50/80 transition-colors cursor-pointer group"
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
                    className={`w-full flex items-center gap-2.5 text-left py-2 px-2.5 rounded-lg text-[13px] transition-all cursor-pointer ${
                      isRouteActive('security-center')
                        ? 'bg-[#f5eeff] text-purple-700 font-semibold'
                        : 'text-slate-500 hover:text-slate-900 hover:bg-slate-50'
                    }`}
                  >
                    <Lock className={`w-3.5 h-3.5 shrink-0 ${isRouteActive('security-center') ? 'text-purple-600' : 'text-slate-400'}`} />
                    <span>Security & Access</span>
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
                    <span>Directives</span>
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
