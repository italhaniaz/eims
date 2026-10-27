import React, { useState, useRef, useEffect } from 'react'
import { 
  Bell, 
  Settings, 
  User, 
  Menu, 
  LogOut, 
  Key, 
  Search,
  MessageSquare
} from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import { useAppData } from '../../context/AppDataContext'
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
  const [searchValue, setSearchValue] = useState('')
  
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

  return (
    <header className="h-16 sm:h-20 min-h-[64px] sm:min-h-[80px] bg-white border-b border-slate-100 px-3.5 sm:px-6 md:px-8 flex items-center justify-between sticky top-0 z-30 shrink-0 shadow-[0_1px_4px_rgba(0,0,0,0.02)]">
      {/* Left: Mobile Menu & Wide Pill Search Bar */}
      <div className="flex items-center gap-3 flex-1 max-w-xl">
        {/* Mobile Hamburger Button */}
        <button
          onClick={onOpenMobileMenu}
          className="p-2 -ml-2 rounded-xl text-slate-500 hover:text-slate-900 hover:bg-slate-100 lg:hidden transition-colors cursor-pointer shrink-0"
          title="Open Menu"
        >
          <Menu className="w-5 h-5" />
        </button>

        {/* Wide Pill Search Bar matching reference image */}
        <div 
          onClick={onOpenCommandPalette}
          className="relative w-full max-w-[210px] xs:max-w-[260px] sm:max-w-md group cursor-pointer"
        >
          <input
            type="text"
            readOnly
            value={searchValue}
            onClick={onOpenCommandPalette}
            placeholder="What do you want to find?"
            className="w-full pl-5 pr-11 py-2.5 rounded-full bg-[#f8fafc] hover:bg-slate-100/80 border border-slate-200/70 text-slate-800 placeholder-slate-400 text-xs sm:text-sm font-sans focus:outline-none transition-all cursor-pointer shadow-2xs"
          />
          <button 
            type="button"
            onClick={onOpenCommandPalette}
            className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-purple-600 hover:text-purple-700 transition-colors cursor-pointer"
            title="Search"
          >
            <Search className="w-4 h-4 stroke-[2.2]" />
          </button>
        </div>
      </div>

      {/* Right Side Icons & Profile Info */}
      <div className="flex items-center gap-2.5 sm:gap-4 shrink-0">
        {/* Cloud Sync Status */}
        <div className="hidden md:block">
          <CloudSyncBadge onOpenSettings={onOpenSettings} />
        </div>

        {/* Notification Bell */}
        <div className="relative" ref={notifRef}>
          <button 
            onClick={() => setShowNotifications(!showNotifications)}
            className="relative p-2.5 text-slate-400 hover:text-purple-600 hover:bg-purple-50/50 rounded-full transition-colors cursor-pointer"
            title="Notifications"
          >
            <Bell className="w-5 h-5" />
            {unreadCount > 0 && (
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-purple-600 rounded-full ring-2 ring-white"></span>
            )}
          </button>

          {/* Notifications Dropdown */}
          {showNotifications && (
            <div className="absolute right-0 mt-2 w-80 bg-white rounded-2xl shadow-xl border border-slate-100 py-2 z-50 animate-in fade-in zoom-in-95">
              <div className="px-4 py-2.5 border-b border-slate-100 flex items-center justify-between">
                <span className="text-xs font-bold text-slate-800 uppercase tracking-wider">Notifications</span>
                <button 
                  onClick={() => setClearedNotifications(true)}
                  className="text-[11px] text-purple-600 hover:text-purple-700 font-semibold cursor-pointer"
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
                  className="text-xs text-purple-600 hover:text-purple-800 font-semibold cursor-pointer w-full text-center"
                >
                  View Approvals & Requests →
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Messages / Gateway Shortcut */}
        <button 
          onClick={() => onRouteChange('communication')}
          className="p-2.5 text-slate-400 hover:text-purple-600 hover:bg-purple-50/50 rounded-full transition-colors cursor-pointer"
          title="Messages & Communication"
        >
          <MessageSquare className="w-5 h-5" />
        </button>

        {/* User Profile: Circular Avatar + Name + Role Side-by-Side */}
        <div className="relative pl-1 sm:pl-2" ref={profileRef}>
          <button 
            onClick={() => setShowProfileMenu(!showProfileMenu)}
            className="flex items-center gap-2.5 p-1 rounded-full hover:bg-slate-50 transition-all cursor-pointer focus:outline-none group"
            title="User Profile & Settings"
          >
            {/* Avatar Circle with Picture or Initials */}
            <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-purple-600 to-indigo-500 text-white font-bold flex items-center justify-center text-xs ring-2 ring-purple-100 shadow-xs">
              <span>SA</span>
            </div>
            {/* Name & Role Text */}
            <div className="hidden sm:flex flex-col text-left pr-1">
              <span className="text-xs font-bold text-slate-800 leading-tight group-hover:text-purple-700 transition-colors">
                Super Administrator
              </span>
              <span className="text-[10px] text-purple-600 font-bold uppercase tracking-wider">
                Super Admin
              </span>
            </div>
          </button>

          {/* Profile Popover Menu */}
          {showProfileMenu && (
            <div className="absolute right-0 mt-2 w-64 bg-white rounded-2xl shadow-xl border border-slate-100 py-2 z-50 animate-in fade-in zoom-in-95">
              <div className="px-4 py-3 border-b border-slate-100">
                <p className="text-xs font-bold text-slate-900">Super Administrator</p>
                <p className="text-[11px] text-slate-400 font-mono mt-0.5 truncate">{user?.email || 'admin@schoolms.com'}</p>
                <span className="inline-block mt-2 text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-purple-50 text-purple-700 border border-purple-100">
                  Global Admin
                </span>
              </div>

              <div className="py-1">
                <button
                  onClick={() => {
                    setShowProfileMenu(false)
                    setShowPasswordModal(true)
                  }}
                  className="w-full text-left px-4 py-2.5 text-xs font-semibold text-slate-700 hover:bg-purple-50/50 flex items-center gap-2.5 transition-colors cursor-pointer"
                >
                  <Key className="w-3.5 h-3.5 text-purple-600" />
                  <span>Change Password</span>
                </button>

                <button
                  onClick={() => {
                    onOpenSettings()
                    setShowProfileMenu(false)
                  }}
                  className="w-full text-left px-4 py-2.5 text-xs font-semibold text-slate-700 hover:bg-purple-50/50 flex items-center gap-2.5 transition-colors cursor-pointer"
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
