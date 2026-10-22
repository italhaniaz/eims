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
  ExternalLink,
  Key,
  Search
} from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import { useAppData } from '../../context/AppDataContext'
import { isSupabaseConfigured, getSupabaseStatus } from '../../services/supabaseClient'
import ChangePasswordModal from '../common/ChangePasswordModal'
import CloudSyncBadge from '../common/CloudSyncBadge'

export const SuperadminNavbar = ({ 
  currentRoute, 
  onRouteChange, 
  onOpenSettings,
  onOpenMobileMenu,
  onOpenCommandPalette
}) => {
  const { user, logout } = useAuth()
  const { notices = [], recentActivity = [] } = useAppData()
  const [showNotifications, setShowNotifications] = useState(false)
  const [showProfileMenu, setShowProfileMenu] = useState(false)
  const [showPasswordModal, setShowPasswordModal] = useState(false)
  const [clearedNotifications, setClearedNotifications] = useState(false)
  const supabaseInfo = getSupabaseStatus()
  
  const profileRef = useRef(null)
  const notifRef = useRef(null)

  // Real dynamic notification count based on urgent notices and recent activity events
  const unreadCount = clearedNotifications 
    ? 0 
    : (notices.filter(n => n.pinned || n.category === 'Urgent').length + Math.min(recentActivity.length, 2))

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
      case 'platform-modules': return 'Platform Control / Module Control Matrix'
      case 'institutes': return 'Platform Control / Institutes & Campuses'
      case 'departments': return 'Institute Structure / Departments'
      case 'examination-bodies': return 'Institute Structure / Examination Bodies'
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
      case 'users-all': return 'Users Management / All Users'
      case 'users-roles': return 'Users Management / Roles & Permissions'
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
          className="p-2 -ml-2 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100 lg:hidden transition-colors cursor-pointer"
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
        {/* Quick Spotlight Search Trigger */}
        <button
          onClick={onOpenCommandPalette}
          className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 text-xs text-slate-500 transition-colors shadow-2xs cursor-pointer"
          title="Spotlight Search (Ctrl + K)"
        >
          <Search className="w-3.5 h-3.5 text-slate-400" />
          <span className="text-[11px] font-medium">Search or jump to...</span>
          <kbd className="text-[9px] font-mono font-bold bg-white border border-slate-200 px-1.5 py-0.5 rounded text-slate-400 shadow-2xs">
            Ctrl K
          </kbd>
        </button>

        {/* Mobile Spotlight Search Trigger */}
        <button
          onClick={onOpenCommandPalette}
          className="sm:hidden p-2 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
          title="Search (Tap to open)"
          aria-label="Open search"
        >
          <Search className="w-4 h-4 text-slate-600" />
        </button>

        {/* Cloud & Offline Synchronization Status Badge */}
        <CloudSyncBadge onOpenSettings={onOpenSettings} />

        {/* Notification Bell with Dynamic Real Badge */}
        <div className="relative" ref={notifRef}>
          <button 
            onClick={() => setShowNotifications(!showNotifications)}
            className="relative p-2 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-50 transition-colors cursor-pointer"
            title="Notifications"
          >
            <Bell className="w-5 h-5 text-slate-400" />
            {unreadCount > 0 && (
              <span className="absolute top-1 right-1 w-4 h-4 bg-rose-500 text-white rounded-full text-[10px] font-bold flex items-center justify-center ring-2 ring-white">
                {unreadCount}
              </span>
            )}
          </button>

          {/* Notifications Dropdown */}
          {showNotifications && (
            <div className="absolute right-0 mt-2 w-80 bg-white rounded-xl shadow-xl border border-slate-100 py-2 z-50 animate-in fade-in zoom-in-95">
              <div className="px-4 py-2 border-b border-slate-100 flex items-center justify-between">
                <span className="text-xs font-bold text-slate-700 uppercase">System Notifications</span>
                <button 
                  onClick={() => setClearedNotifications(true)}
                  className="text-[11px] text-blue-600 hover:underline cursor-pointer font-medium"
                >
                  Mark all read
                </button>
              </div>
              <div className="divide-y divide-slate-50 max-h-64 overflow-y-auto">
                {recentActivity && recentActivity.length > 0 ? (
                  recentActivity.slice(0, 4).map((act, i) => (
                    <div key={act.id || i} className="px-4 py-2.5 hover:bg-slate-50 transition-colors">
                      <p className="text-xs font-medium text-slate-800 line-clamp-1">{act.text}</p>
                      <span className="text-[10px] text-slate-400 mt-0.5 inline-block">{act.time}</span>
                    </div>
                  ))
                ) : (
                  <div className="px-4 py-4 text-center text-xs text-slate-400">
                    No unread notifications.
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Settings Gear Icon */}
        <button 
          onClick={onOpenSettings}
          className="p-2 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-50 transition-colors cursor-pointer"
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
                    setShowProfileMenu(false)
                    setShowPasswordModal(true)
                  }}
                  className="w-full text-left px-4 py-2.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 flex items-center gap-2.5 transition-colors cursor-pointer"
                >
                  <Key className="w-3.5 h-3.5 text-blue-600" />
                  <span>Change Password & Security</span>
                </button>

                <button
                  onClick={() => {
                    onOpenSettings()
                    setShowProfileMenu(false)
                  }}
                  className="w-full text-left px-4 py-2.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 flex items-center gap-2.5 transition-colors cursor-pointer"
                >
                  <Settings className="w-3.5 h-3.5 text-slate-500" />
                  <span>System & Supabase Settings</span>
                </button>
              </div>

              <div className="pt-1 border-t border-slate-100">
                <button
                  onClick={logout}
                  className="w-full text-left px-4 py-2 text-xs font-semibold text-rose-600 hover:bg-rose-50 flex items-center gap-2 transition-colors cursor-pointer"
                >
                  <LogOut className="w-3.5 h-3.5 text-rose-500" />
                  <span>Sign Out</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Change Password Modal */}
      <ChangePasswordModal
        isOpen={showPasswordModal}
        onClose={() => setShowPasswordModal(false)}
      />
    </header>
  )
}

export default SuperadminNavbar
