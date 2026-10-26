import React, { useState, useRef, useEffect } from 'react'
import { 
  Bell, 
  Settings, 
  User, 
  ChevronRight,
  Menu,
  LogOut,
  ShieldCheck,
  Key,
  Search,
  LayoutDashboard,
  Building2,
  Sliders,
  BarChart3,
  CreditCard,
  Users as UsersIcon,
  Activity,
  Database,
  MessageSquare,
  Megaphone,
  FileSpreadsheet,
  Lock
} from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import { useAppData } from '../../context/AppDataContext'
import { getSupabaseStatus } from '../../services/supabaseClient'
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
  
  const profileRef = useRef(null)
  const notifRef = useRef(null)

  // Real dynamic notification count
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

  // Page title and icon mapping matching clean reference
  const getPageInfo = () => {
    switch (currentRoute) {
      case 'dashboard':
        return { title: 'Dashboard', icon: LayoutDashboard }
      case 'institutes':
        return { title: 'Campuses & Institutes', icon: Building2 }
      case 'platform-modules':
        return { title: 'Educational Wings Matrix', icon: Sliders }
      case 'platform-billing':
        return { title: 'Subscriptions & Billing', icon: CreditCard }
      case 'cross-institute-analytics':
        return { title: 'Cross-Campus Analytics', icon: BarChart3 }
      case 'users-all':
        return { title: 'All Platform Users', icon: UsersIcon }
      case 'users-roles':
        return { title: 'Roles & Permissions', icon: ShieldCheck }
      case 'security-center':
        return { title: 'Security & Access Control', icon: Lock }
      case 'system-health':
        return { title: 'System Health Monitor', icon: Activity }
      case 'audit-logs':
        return { title: 'Audit & Security Logs', icon: ShieldCheck }
      case 'backup-data':
        return { title: 'Backup & Data Operations', icon: Database }
      case 'communication':
        return { title: 'SMS & Gateway Alerts', icon: MessageSquare }
      case 'announcements':
        return { title: 'Broadcast Directives', icon: Megaphone }
      case 'global-templates':
        return { title: 'Global Master Templates', icon: FileSpreadsheet }
      default:
        return { title: 'Super Admin Portal', icon: LayoutDashboard }
    }
  }

  const { title, icon: PageIcon } = getPageInfo()

  return (
    <header className="h-16 bg-white border-b border-slate-200/80 px-4 md:px-7 flex items-center justify-between sticky top-0 z-30 shadow-[0_1px_3px_rgba(0,0,0,0.02)]">
      {/* Left: Mobile Hamburger & Clean Bold Page Title */}
      <div className="flex items-center gap-3">
        {/* Mobile Hamburger Button */}
        <button
          onClick={onOpenMobileMenu}
          className="p-2 -ml-2 rounded-xl text-slate-500 hover:text-slate-900 hover:bg-slate-100 lg:hidden transition-colors cursor-pointer"
          title="Open Menu"
        >
          <Menu className="w-5 h-5" />
        </button>

        {/* Clean Page Title with Icon */}
        <div className="flex items-center gap-2.5">
          <PageIcon className="w-5 h-5 text-violet-600 shrink-0" />
          <h1 className="text-base sm:text-lg font-bold text-slate-900 tracking-tight font-heading">
            {title}
          </h1>
        </div>
      </div>

      {/* Right Side Utilities */}
      <div className="flex items-center gap-2 sm:gap-3">
        {/* Quick Spotlight Search Trigger */}
        <button
          onClick={onOpenCommandPalette}
          className="hidden sm:flex items-center gap-2.5 px-3 py-1.5 rounded-xl border border-slate-200/80 bg-slate-50/80 hover:bg-slate-100 text-xs text-slate-400 hover:text-slate-600 transition-all cursor-pointer"
          title="Spotlight Search (Ctrl + K)"
        >
          <Search className="w-3.5 h-3.5 text-slate-400" />
          <span className="text-[11px] font-medium text-slate-500">Search or jump to...</span>
          <kbd className="text-[10px] font-mono font-semibold bg-white border border-slate-200 px-1.5 py-0.5 rounded text-slate-400 shadow-2xs">
            Ctrl K
          </kbd>
        </button>

        {/* Mobile Search Button */}
        <button
          onClick={onOpenCommandPalette}
          className="sm:hidden p-2 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
          title="Search"
        >
          <Search className="w-4 h-4 text-slate-600" />
        </button>

        {/* Cloud & Supabase Sync Status */}
        <CloudSyncBadge onOpenSettings={onOpenSettings} />

        {/* Notification Bell */}
        <div className="relative" ref={notifRef}>
          <button 
            onClick={() => setShowNotifications(!showNotifications)}
            className="relative p-2 text-slate-400 hover:text-slate-700 rounded-xl hover:bg-slate-50 transition-colors cursor-pointer"
            title="Notifications"
          >
            <Bell className="w-4.5 h-4.5 text-slate-500" />
            {unreadCount > 0 && (
              <span className="absolute top-1.5 right-1.5 w-4 h-4 bg-violet-600 text-white rounded-full text-[10px] font-bold flex items-center justify-center ring-2 ring-white">
                {unreadCount}
              </span>
            )}
          </button>

          {/* Notifications Dropdown */}
          {showNotifications && (
            <div className="absolute right-0 mt-2 w-80 bg-white rounded-2xl shadow-xl border border-slate-100 py-2 z-50 animate-in fade-in zoom-in-95">
              <div className="px-4 py-2.5 border-b border-slate-100 flex items-center justify-between">
                <span className="text-xs font-bold text-slate-800 uppercase tracking-wider">Notifications</span>
                <button 
                  onClick={() => setClearedNotifications(true)}
                  className="text-[11px] text-violet-600 hover:text-violet-700 font-semibold cursor-pointer"
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
                  <div className="px-4 py-6 text-center text-xs text-slate-400">
                    No unread notifications.
                  </div>
                )}
              </div>
              <div className="px-4 py-2 border-t border-slate-100 bg-slate-50/50">
                <button
                  onClick={() => {
                    onRouteChange('support-approvals')
                    setShowNotifications(false)
                  }}
                  className="text-xs text-violet-600 hover:text-violet-800 font-semibold cursor-pointer w-full text-center"
                >
                  View Approvals & Requests →
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Settings Gear */}
        <button 
          onClick={onOpenSettings}
          className="p-2 text-slate-400 hover:text-slate-700 rounded-xl hover:bg-slate-50 transition-colors cursor-pointer"
          title="System Settings"
        >
          <Settings className="w-4.5 h-4.5 text-slate-500" />
        </button>

        {/* Profile Avatar with Dropdown */}
        <div className="relative ml-1" ref={profileRef}>
          <button 
            onClick={() => setShowProfileMenu(!showProfileMenu)}
            className="w-9 h-9 rounded-full bg-gradient-to-tr from-violet-600 to-purple-500 text-white font-bold flex items-center justify-center text-xs cursor-pointer ring-2 ring-violet-200/80 hover:ring-violet-400 shadow-sm transition-all focus:outline-none"
            title="Super Admin Profile"
          >
            <span>SA</span>
          </button>

          {/* Profile Menu Popover */}
          {showProfileMenu && (
            <div className="absolute right-0 mt-2 w-64 bg-white rounded-2xl shadow-xl border border-slate-100 py-2 z-50 animate-in fade-in zoom-in-95">
              <div className="px-4 py-3 border-b border-slate-100">
                <p className="text-xs font-bold text-slate-900">Super Administrator</p>
                <p className="text-[11px] text-slate-400 font-mono mt-0.5 truncate">{user?.email || 'admin@schoolms.com'}</p>
                <span className="inline-block mt-2 text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-violet-50 text-violet-700 border border-violet-100">
                  Global Super Admin
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
                  <Key className="w-3.5 h-3.5 text-violet-600" />
                  <span>Change Password</span>
                </button>

                <button
                  onClick={() => {
                    onOpenSettings()
                    setShowProfileMenu(false)
                  }}
                  className="w-full text-left px-4 py-2.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 flex items-center gap-2.5 transition-colors cursor-pointer"
                >
                  <Settings className="w-3.5 h-3.5 text-slate-500" />
                  <span>Platform Settings</span>
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
