import React, { useState, useRef, useEffect } from 'react'
import { 
  Bell, 
  Settings, 
  User, 
  Menu, 
  LogOut, 
  Key, 
  Search,
  MessageSquare,
  Megaphone,
  Globe,
  School,
  CheckCircle2,
  Sparkles,
  ArrowRight
} from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import { useAppData } from '../../context/AppDataContext'
import ChangePasswordModal from '../common/ChangePasswordModal'
import CloudSyncBadge from '../common/CloudSyncBadge'
import AnnouncementService from '../../services/announcementService'

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
  const [showAnnouncementsMenu, setShowAnnouncementsMenu] = useState(false)
  const [clearedNotifications, setClearedNotifications] = useState(false)
  const [searchValue, setSearchValue] = useState('')
  const [pendingApprovals, setPendingApprovals] = useState([])

  // Live Announcements & Landing Banner state
  const [landingBanner, setLandingBanner] = useState(() => AnnouncementService.getLandingBannerConfig())
  const [announcementsList, setAnnouncementsList] = useState(() => AnnouncementService.getAllAnnouncements())
  
  const profileRef = useRef(null)
  const notifRef = useRef(null)
  const announcementsRef = useRef(null)

  // Load live pending approval requests from local storage
  useEffect(() => {
    const loadPendingApprovals = () => {
      try {
        const raw = localStorage.getItem('sms_approval_requests')
        if (raw) {
          const list = JSON.parse(raw)
          setPendingApprovals(list.filter(a => a.status === 'PENDING'))
        }
      } catch {}
    }
    loadPendingApprovals()
    window.addEventListener('sms_approval_created', loadPendingApprovals)
    window.addEventListener('sms_approvals_updated', loadPendingApprovals)
    window.addEventListener('storage', loadPendingApprovals)
    return () => {
      window.removeEventListener('sms_approval_created', loadPendingApprovals)
      window.removeEventListener('sms_approvals_updated', loadPendingApprovals)
      window.removeEventListener('storage', loadPendingApprovals)
    }
  }, [])

  // Sync announcements & landing banner live
  useEffect(() => {
    const handleAnnouncementsUpdate = () => {
      setLandingBanner(AnnouncementService.getLandingBannerConfig())
      setAnnouncementsList(AnnouncementService.getAllAnnouncements())
    }
    window.addEventListener('sms_announcements_updated', handleAnnouncementsUpdate)
    window.addEventListener('storage', handleAnnouncementsUpdate)
    return () => {
      window.removeEventListener('sms_announcements_updated', handleAnnouncementsUpdate)
      window.removeEventListener('storage', handleAnnouncementsUpdate)
    }
  }, [])

  // Real dynamic notification count
  const unreadCount = clearedNotifications 
    ? 0 
    : (pendingApprovals.length + notices.filter(n => n.pinned || n.category === 'Urgent').length + Math.min(recentActivity.length, 2))

  // Click outside to close dropdowns
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (profileRef.current && !profileRef.current.contains(e.target)) {
        setShowProfileMenu(false)
      }
      if (notifRef.current && !notifRef.current.contains(e.target)) {
        setShowNotifications(false)
      }
      if (announcementsRef.current && !announcementsRef.current.contains(e.target)) {
        setShowAnnouncementsMenu(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  // Quick 1-click toggle for landing page banner from navbar
  const handleToggleLandingBanner = (e) => {
    e.stopPropagation()
    const updated = AnnouncementService.toggleLandingBanner()
    setLandingBanner(updated)
  }

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

        {/* Wide Pill Search Bar */}
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
      <div className="flex items-center gap-2 sm:gap-3.5 shrink-0">
        {/* 1. Announcements & Broadcast Navbar Control */}
        <div className="relative" ref={announcementsRef}>
          <button
            onClick={() => setShowAnnouncementsMenu(!showAnnouncementsMenu)}
            className={`flex items-center gap-1.5 px-3 py-1.5 sm:py-2 rounded-xl text-xs font-bold transition-all cursor-pointer shadow-2xs ${
              showAnnouncementsMenu || currentRoute === 'announcements'
                ? 'bg-purple-600 text-white shadow-xs'
                : 'bg-[#f5eeff] hover:bg-[#ede0fe] text-purple-700 hover:text-purple-900 border border-purple-200/80'
            }`}
            title="Platform Announcements & Broadcast Control"
          >
            <Megaphone className={`w-3.5 h-3.5 ${showAnnouncementsMenu || currentRoute === 'announcements' ? 'text-white' : 'text-purple-600'}`} />
            <span className="hidden xs:inline">Announcements</span>
            {landingBanner?.isActive ? (
              <span className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full text-[10px] font-extrabold ${
                showAnnouncementsMenu || currentRoute === 'announcements'
                  ? 'bg-purple-700 text-purple-100'
                  : 'bg-emerald-100 text-emerald-700'
              }`}>
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                <span className="hidden md:inline">Live</span>
              </span>
            ) : (
              <span className={`inline-flex items-center px-1.5 py-0.5 rounded-full text-[10px] font-bold ${
                showAnnouncementsMenu || currentRoute === 'announcements'
                  ? 'bg-purple-700 text-purple-200'
                  : 'bg-slate-200 text-slate-600'
              }`}>
                Off
              </span>
            )}
          </button>

          {/* Quick Dropdown Control Panel */}
          {showAnnouncementsMenu && (
            <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white rounded-2xl shadow-xl border border-slate-100 py-3 px-4 z-50 animate-in fade-in zoom-in-95 space-y-3.5">
              <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
                <div>
                  <div className="flex items-center gap-1.5">
                    <Megaphone className="w-4 h-4 text-purple-600" />
                    <span className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                      Announcements Hub
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    Landing page banner & campus directives
                  </p>
                </div>
                <button
                  onClick={() => {
                    onRouteChange('announcements')
                    setShowAnnouncementsMenu(false)
                  }}
                  className="text-xs font-bold text-purple-600 hover:text-purple-800 cursor-pointer flex items-center gap-0.5"
                >
                  <span>Full Hub</span>
                  <ArrowRight className="w-3 h-3" />
                </button>
              </div>

              {/* Quick Landing Page Banner Switch Card */}
              <div className="bg-[#fcfaff] rounded-xl p-3 border border-purple-100 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-slate-800">
                    <Globe className="w-3.5 h-3.5 text-purple-600" />
                    <span>Landing Page Top Banner</span>
                  </div>
                  <button
                    type="button"
                    onClick={handleToggleLandingBanner}
                    className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all cursor-pointer ${
                      landingBanner?.isActive
                        ? 'bg-emerald-100 hover:bg-emerald-200 text-emerald-800 border border-emerald-300'
                        : 'bg-slate-200 hover:bg-slate-300 text-slate-700'
                    }`}
                  >
                    {landingBanner?.isActive ? '● Live (Turn Off)' : '○ Inactive (Turn On)'}
                  </button>
                </div>

                {/* Banner mini preview */}
                <div className="bg-[#f5eeff] border border-purple-200/90 rounded-lg p-2 text-[11.5px] text-purple-950 font-medium line-clamp-2">
                  <span className="font-bold text-purple-700 mr-1">
                    {landingBanner?.badgeText || 'New Release'}:
                  </span>
                  <span>{landingBanner?.message || '14-Day Free Evaluation Tier is now active for all educational institutions.'}</span>
                </div>
              </div>

              {/* Campus Directives Status */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-slate-700 flex items-center gap-1">
                    <School className="w-3.5 h-3.5 text-indigo-600" />
                    <span>Active Campus Directives</span>
                  </span>
                  <span className="text-[11px] font-bold text-slate-500">
                    {announcementsList.filter(a => a.target === 'institute_admin' || a.target === 'all').length} Active
                  </span>
                </div>

                <div className="divide-y divide-slate-50 max-h-36 overflow-y-auto pr-1">
                  {announcementsList
                    .filter(a => a.target === 'institute_admin' || a.target === 'all')
                    .slice(0, 3)
                    .map(item => (
                      <div key={item.id} className="py-1.5 text-xs flex items-center justify-between">
                        <div className="min-w-0 pr-2">
                          <p className="font-semibold text-slate-800 truncate">{item.title}</p>
                          <p className="text-[10.5px] text-slate-400 truncate">{item.targetCampus} • {item.priority} Priority</p>
                        </div>
                        <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded shrink-0 ${
                          item.priority === 'Urgent' ? 'bg-red-50 text-red-600' : 'bg-purple-50 text-purple-700'
                        }`}>
                          {item.priority}
                        </span>
                      </div>
                    ))}
                </div>
              </div>

              {/* Action Button */}
              <div className="pt-1 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => {
                    onRouteChange('announcements')
                    setShowAnnouncementsMenu(false)
                  }}
                  className="w-full py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs shadow-xs transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <Megaphone className="w-3.5 h-3.5" />
                  <span>Open Full Announcements Hub</span>
                </button>
              </div>
            </div>
          )}
        </div>

        {/* 2. Notification Bell */}
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
              <div className="divide-y divide-slate-50 max-h-72 overflow-y-auto">
                {/* Pending Institution Onboarding Petitions */}
                {pendingApprovals && pendingApprovals.length > 0 && (
                  <div className="bg-purple-50/60 p-2.5 border-b border-purple-100">
                    <div className="px-1.5 py-0.5 text-[10px] font-bold text-purple-900 uppercase tracking-wider flex items-center justify-between">
                      <span className="flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-purple-600 animate-pulse"></span>
                        <span>Pending Registrations ({pendingApprovals.length})</span>
                      </span>
                      <span className="text-[10px] text-purple-600 font-semibold">Action Required</span>
                    </div>
                    {pendingApprovals.slice(0, 3).map((appr) => (
                      <div
                        key={appr.id}
                        onClick={() => {
                          onRouteChange('support-approvals')
                          setShowNotifications(false)
                        }}
                        className="p-2 rounded-xl hover:bg-white transition-all cursor-pointer border border-transparent hover:border-purple-200 mt-1.5 shadow-2xs"
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] font-bold text-purple-700 bg-purple-100 px-1.5 py-0.2 rounded">
                            {appr.details?.planTier || 'New Plan'}
                          </span>
                          <span className="text-[10px] font-semibold text-purple-600">Review Petition &rarr;</span>
                        </div>
                        <p className="text-xs font-bold text-slate-900 mt-0.5 line-clamp-1">{appr.instituteName}</p>
                        <p className="text-[10.5px] text-slate-500 line-clamp-1">
                          Admin: {appr.details?.contactPerson || 'Principal'} • {appr.details?.city || 'Pakistan'}
                        </p>
                      </div>
                    ))}
                  </div>
                )}

                {recentActivity && recentActivity.length > 0 ? (
                  recentActivity.slice(0, 4).map((act, i) => (
                    <div key={act.id || i} className="px-4 py-2.5 hover:bg-slate-50 transition-colors">
                      <p className="text-xs font-medium text-slate-800 line-clamp-1">{act.text}</p>
                      <span className="text-[10px] text-slate-400 mt-0.5 inline-block">{act.time}</span>
                    </div>
                  ))
                ) : (!pendingApprovals || pendingApprovals.length === 0) && (
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

        {/* 3. Messages / Gateway Shortcut */}
        <button 
          onClick={() => onRouteChange('communication')}
          className="p-2.5 text-slate-400 hover:text-purple-600 hover:bg-purple-50/50 rounded-full transition-colors cursor-pointer"
          title="Messages & Communication"
        >
          <MessageSquare className="w-5 h-5" />
        </button>

        {/* 4. User Profile */}
        <div className="relative pl-1 sm:pl-2" ref={profileRef}>
          <button 
            onClick={() => setShowProfileMenu(!showProfileMenu)}
            className="flex items-center gap-2.5 p-1 rounded-full hover:bg-slate-50 transition-all cursor-pointer focus:outline-none group"
            title="User Profile & Settings"
          >
            <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-purple-600 to-indigo-500 text-white font-bold flex items-center justify-center text-xs ring-2 ring-purple-100 shadow-xs">
              <span>SA</span>
            </div>
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
                    onRouteChange('sa-students-all')
                    setShowProfileMenu(false)
                  }}
                  className="w-full text-left px-4 py-2.5 text-xs font-semibold text-slate-700 hover:bg-purple-50/50 flex items-center gap-2.5 transition-colors cursor-pointer"
                >
                  <User className="w-3.5 h-3.5 text-purple-600" />
                  <span>All Students Directory</span>
                </button>

                <button
                  onClick={() => {
                    onRouteChange('users-all')
                    setShowProfileMenu(false)
                  }}
                  className="w-full text-left px-4 py-2.5 text-xs font-semibold text-slate-700 hover:bg-purple-50/50 flex items-center gap-2.5 transition-colors cursor-pointer"
                >
                  <School className="w-3.5 h-3.5 text-purple-600" />
                  <span>Platform Users & Roles</span>
                </button>

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
                  <Settings className="w-3.5 h-3.5 text-purple-600" />
                  <span>Cloud Settings</span>
                </button>

                <button
                  onClick={() => {
                    onRouteChange('announcements')
                    setShowProfileMenu(false)
                  }}
                  className="w-full text-left px-4 py-2.5 text-xs font-semibold text-slate-700 hover:bg-purple-50/50 flex items-center gap-2.5 transition-colors cursor-pointer"
                >
                  <Megaphone className="w-3.5 h-3.5 text-purple-600" />
                  <span>Announcements Hub</span>
                </button>
              </div>

              <div className="border-t border-slate-100 pt-1 mt-1">
                <button
                  onClick={() => logout()}
                  className="w-full text-left px-4 py-2.5 text-xs font-semibold text-rose-600 hover:bg-rose-50 flex items-center gap-2.5 transition-colors cursor-pointer"
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
