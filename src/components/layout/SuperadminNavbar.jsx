import React, { useState, useRef, useEffect } from 'react'
import { 
  Bell, 
  Settings, 
  User, 
  Database, 
  ChevronRight,
  Menu,
  Sparkles,
  LogOut,
  ShieldCheck,
  CheckCircle2,
  ExternalLink
} from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import { isSupabaseConfigured, getSupabaseStatus } from '../../services/supabaseClient'

export const SuperadminNavbar = ({ 
  currentRoute, 
  onRouteChange, 
  onOpenSettings,
  onOpenMobileMenu 
}) => {
  const { user, logout, notificationCount, setNotificationCount } = useAuth()
  const [showNotifications, setShowNotifications] = useState(false)
  const [showProfileMenu, setShowProfileMenu] = useState(false)
  const supabaseInfo = getSupabaseStatus()
  
  const profileRef = useRef(null)
  const notifRef = useRef(null)

  // Click outside to close dropdowns
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (profileRef.current && !profileRef.current.contains(e.target)) {
        setShowProfileMenu(false)
      }
      if (notifRef.current && !notifRef.current.contains(e.target)) {
        setShowNotifications(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const getRouteTitle = () => {
    switch (currentRoute) {
      case 'dashboard': return 'Superadmin Overview'
      case 'users-all': return 'Users Management / All Users'
      case 'users-roles': return 'Users Management / Roles & Permissions'
      case 'institutes': return 'Institute Management / Institutes Directory'
      case 'departments': return 'Institute Management / Departments'
      case 'examination-bodies': return 'Institute Management / Examination Bodies'
      case 'academic-years': return 'Academics / Academic Years'
      case 'program-types': return 'Academics / Program Types'
      case 'programs': return 'Academics / Programs'
      case 'subjects': return 'Academics / Subjects'
      case 'study-schemes': return 'Academics / Study Schemes'
      case 'finance': return 'Enterprise / Financial Analytics & Intelligence'
      case 'transport': return 'Enterprise / Transport & Fleet Operations'
      case 'library': return 'Enterprise / Central Digital Library'
      case 'admissions-pipeline': return 'Enterprise / Admissions Pipeline & CRM'
      case 'communication': return 'Enterprise / SMS & WhatsApp Gateway'
      case 'audit-logs': return 'Enterprise / Security & System Audit Logs'
      case 'announcements': return 'Enterprise / Broadcast Directives'
      default: return 'Portal'
    }
  }

  return (
    <header className="h-16 bg-white border-b border-slate-100 px-4 md:px-6 flex items-center justify-between sticky top-0 z-30 shadow-[0_1px_3px_rgba(0,0,0,0.02)]">
      {/* Left: Mobile Hamburger & Breadcrumbs */}
      <div className="flex items-center gap-3">
        {/* Mobile Hamburger Button */}
        <button
          onClick={onOpenMobileMenu}
          className="p-2 -ml-2 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100 lg:hidden transition-colors"
          title="Open Menu"
        >
          <Menu className="w-5 h-5" />
        </button>

        <span className="hidden sm:inline-block text-xs font-semibold uppercase tracking-wider text-blue-600 bg-blue-50 px-2.5 py-1 rounded-md">
          Superadmin Portal
        </span>
        <ChevronRight className="hidden sm:inline-block w-3.5 h-3.5 text-slate-300" />
        <h1 className="text-sm font-semibold text-slate-700 capitalize truncate max-w-[200px] sm:max-w-none">
          {getRouteTitle()}
        </h1>
      </div>

      {/* Right Side Icons */}
      <div className="flex items-center gap-3 sm:gap-4">
        {/* Supabase Connection Status Pill */}
        <button 
          onClick={onOpenSettings}
          className="hidden md:flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium border transition-colors bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100"
          title="Click to view Supabase database settings"
        >
          <Database className={`w-3.5 h-3.5 ${isSupabaseConfigured ? 'text-emerald-500' : 'text-blue-500'}`} />
          <span>{isSupabaseConfigured ? 'Supabase Connected' : 'Supabase Ready'}</span>
          <span className={`w-1.5 h-1.5 rounded-full ${isSupabaseConfigured ? 'bg-emerald-500 animate-pulse' : 'bg-blue-400'}`}></span>
        </button>

        {/* Notification Bell with Red Badge "3" */}
        <div className="relative" ref={notifRef}>
          <button 
            onClick={() => setShowNotifications(!showNotifications)}
            className="relative p-2 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-50 transition-colors"
            title="Notifications"
          >
            <Bell className="w-5 h-5 text-slate-400" />
            {notificationCount > 0 && (
              <span className="absolute top-1 right-1 w-4 h-4 bg-rose-500 text-white rounded-full text-[10px] font-bold flex items-center justify-center ring-2 ring-white">
                {notificationCount}
              </span>
            )}
          </button>

          {/* Notifications Dropdown */}
          {showNotifications && (
            <div className="absolute right-0 mt-2 w-80 bg-white rounded-xl shadow-xl border border-slate-100 py-2 z-50 animate-in fade-in zoom-in-95">
              <div className="px-4 py-2 border-b border-slate-100 flex items-center justify-between">
                <span className="text-xs font-bold text-slate-700 uppercase">System Notifications</span>
                <button 
                  onClick={() => setNotificationCount(0)}
                  className="text-[11px] text-blue-600 hover:underline"
                >
                  Mark all read
                </button>
              </div>
              <div className="divide-y divide-slate-50 max-h-64 overflow-y-auto">
                <div className="px-4 py-3 hover:bg-slate-50 transition-colors cursor-pointer">
                  <p className="text-xs font-medium text-slate-800">New Institute Registered</p>
                  <p className="text-[11px] text-slate-500">Campus profile updated in system</p>
                  <span className="text-[10px] text-blue-500 font-semibold mt-1 inline-block">10m ago</span>
                </div>
                <div className="px-4 py-3 hover:bg-slate-50 transition-colors cursor-pointer">
                  <p className="text-xs font-medium text-slate-800">Supabase Sync Verified</p>
                  <p className="text-[11px] text-slate-500">All database models synchronized</p>
                  <span className="text-[10px] text-emerald-500 font-semibold mt-1 inline-block">45m ago</span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Settings Gear Icon */}
        <button 
          onClick={onOpenSettings}
          className="p-2 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-50 transition-colors"
          title="System Settings & Supabase Configuration"
        >
          <Settings className="w-5 h-5 text-slate-400" />
        </button>

        {/* User Profile Avatar with Executive Dropdown */}
        <div className="relative" ref={profileRef}>
          <button 
            onClick={() => setShowProfileMenu(!showProfileMenu)}
            className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-white cursor-pointer hover:ring-2 hover:ring-blue-300 transition-all shadow-sm focus:outline-none"
            title="Superadmin Profile"
          >
            <User className="w-4 h-4 text-white" />
          </button>

          {/* Profile Popover Menu */}
          {showProfileMenu && (
            <div className="absolute right-0 mt-2 w-64 bg-white rounded-2xl shadow-xl border border-slate-100 py-2 z-50 animate-in fade-in zoom-in-95">
              <div className="px-4 py-3 border-b border-slate-100">
                <p className="text-xs font-bold text-slate-900 leading-tight">Super Administrator</p>
                <p className="text-[11px] text-slate-400 font-mono mt-0.5 truncate">{user?.email || 'admin@schoolms.com'}</p>
                <span className="inline-block mt-2 text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-blue-50 text-blue-700">
                  Global Superadmin
                </span>
              </div>

              <div className="py-1">
                <button
                  onClick={() => {
                    onOpenSettings()
                    setShowProfileMenu(false)
                  }}
                  className="w-full text-left px-4 py-2.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 flex items-center gap-2.5 transition-colors"
                >
                  <Settings className="w-3.5 h-3.5 text-slate-500" />
                  <span>System & Supabase Settings</span>
                </button>
              </div>

              <div className="pt-1 border-t border-slate-100">
                <button
                  onClick={logout}
                  className="w-full text-left px-4 py-2 text-xs font-semibold text-rose-600 hover:bg-rose-50 flex items-center gap-2 transition-colors"
                >
                  <LogOut className="w-3.5 h-3.5 text-rose-500" />
                  <span>Sign Out</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  )
}

export default SuperadminNavbar
