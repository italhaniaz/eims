import React, { useState, useRef, useEffect } from 'react'
import { 
  Bell, 
  Settings, 
  User, 
  School, 
  ChevronRight, 
  ChevronDown, 
  Menu, 
  LogOut, 
  ShieldCheck, 
  GraduationCap, 
  Building2, 
  Layers, 
  Key
} from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import { useAppData } from '../../context/AppDataContext'
import ChangePasswordModal from '../common/ChangePasswordModal'

export const InstituteAdminNavbar = ({ 
  currentRoute, 
  selectedInstitute, 
  onSelectInstitute, 
  onOpenSettings,
  onOpenMobileMenu,
  onOpenCommandPalette,
  onRouteChange
}) => {
  const { user, logout } = useAuth()
  const { 
    institutes, 
    activeWing = 'all',
    setActiveWing
  } = useAppData()

  const [dropdownOpen, setDropdownOpen] = useState(false)
  const [showProfileMenu, setShowProfileMenu] = useState(false)
  const [showPasswordModal, setShowPasswordModal] = useState(false)

  const profileRef = useRef(null)
  const campusRef = useRef(null)

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (profileRef.current && !profileRef.current.contains(e.target)) {
        setShowProfileMenu(false)
      }
      if (campusRef.current && !campusRef.current.contains(e.target)) {
        setDropdownOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const enabledTiers = selectedInstitute?.enabledTiers || (
    selectedInstitute?.type === 'School' ? ['school'] :
    selectedInstitute?.type === 'College' ? ['college'] :
    selectedInstitute?.type === 'University' ? ['undergraduate'] :
    ['school', 'college']
  )

  const availableWings = [
    { id: 'all', label: 'All Wings', icon: Layers, badge: 'Overview' },
    ...(enabledTiers.includes('school') ? [{ id: 'school', label: 'School Wing', icon: School, badge: 'K-10' }] : []),
    ...(enabledTiers.includes('college') ? [{ id: 'college', label: 'College Wing', icon: Building2, badge: '11-12' }] : []),
    ...(enabledTiers.includes('undergraduate') ? [{ id: 'undergraduate', label: 'Undergraduates', icon: GraduationCap, badge: 'BS' }] : [])
  ]

  const getRouteTitle = () => {
    switch (currentRoute) {
      case 'inst-dashboard': return 'Campus Overview'
      case 'inst-students': return 'Students & Admissions'
      case 'inst-teachers': return 'Faculty & Staff'
      case 'inst-classes': return 'Classes & Sections'
      case 'inst-timetable': return 'Class Timetable Schedule'
      case 'inst-attendance': return 'Daily Attendance'
      case 'inst-fees': return 'Fee Invoices & Payments'
      case 'inst-exams': return 'Examinations & Marks'
      case 'inst-subjects': return 'Academic Curriculum & Subjects'
      case 'inst-notices': return 'Campus Notice Board'
      case 'inst-admissions': return 'Inquiries & Leads'
      case 'inst-transport': return 'Campus Transport & Vans'
      case 'inst-library': return 'Campus Library & Book Issues'
      case 'inst-program-levels': return 'Academic Program Levels'
      default: return 'Campus Portal'
    }
  }

  return (
    <header className="h-16 sm:h-20 min-h-[64px] sm:min-h-[80px] bg-white border-b border-slate-100 px-3.5 sm:px-6 md:px-8 flex items-center justify-between sticky top-0 z-30 shrink-0 shadow-[0_1px_3px_rgba(0,0,0,0.02)]">
      {/* Left: Mobile Hamburger, Campus Switcher, & Route Title */}
      <div className="flex items-center gap-2 sm:gap-3 min-w-0">
        {/* Mobile Hamburger */}
        <button
          onClick={onOpenMobileMenu}
          className="p-1.5 -ml-1 sm:p-2 sm:-ml-2 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100 lg:hidden transition-colors"
          title="Open Menu"
        >
          <Menu className="w-5 h-5" />
        </button>

        {/* Campus Switcher (Only visible to Superadmin scoping/impersonating campuses) */}
        {user?.role === 'superadmin' && (
          <>
            <div className="relative" ref={campusRef}>
              <button
                onClick={() => setDropdownOpen(!dropdownOpen)}
                className="flex items-center gap-1.5 sm:gap-2 bg-[#f5eeff] text-purple-800 border border-purple-200/80 px-2.5 sm:px-3 py-1.5 rounded-lg text-xs font-semibold hover:bg-purple-100 transition-colors"
              >
                <School className="w-3.5 h-3.5 text-purple-600 shrink-0" />
                <span className="max-w-[100px] sm:max-w-[150px] truncate">{selectedInstitute?.name || 'Main Campus'}</span>
                <ChevronDown className="w-3.5 h-3.5 opacity-60 shrink-0" />
              </button>

              {dropdownOpen && (
                <div className="absolute left-0 mt-2 w-72 bg-white rounded-xl shadow-xl border border-slate-100 py-1.5 z-50 animate-in fade-in zoom-in-95">
                  <div className="px-3 py-1.5 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                    Select Active Campus
                  </div>
                  {institutes && institutes.length > 0 ? (
                    institutes.map((inst) => (
                      <button
                        key={inst.id}
                        onClick={() => {
                          onSelectInstitute(inst)
                          setDropdownOpen(false)
                        }}
                        className={`w-full text-left px-3 py-2 text-xs transition-colors flex items-center justify-between ${
                          selectedInstitute?.id === inst.id ? 'bg-[#f5eeff] text-purple-700 font-bold' : 'hover:bg-slate-50 text-slate-700'
                        }`}
                      >
                        <span className="truncate">{inst.name}</span>
                        <span className="font-mono text-[10px] text-slate-400">{inst.code}</span>
                      </button>
                    ))
                  ) : (
                    <div className="px-3 py-2 text-xs text-slate-400">No other institutes found</div>
                  )}
                </div>
              )}
            </div>
            {/* Vertical Divider */}
            <div className="h-5 w-px bg-slate-200 shrink-0" />
          </>
        )}

        <h1 className="text-sm sm:text-base font-bold text-slate-800 truncate max-w-[220px] sm:max-w-none">
          {getRouteTitle()}
        </h1>
      </div>

      {/* Center: Academic Wing Switcher (Multi-Tier Option A Architecture) */}
      {availableWings.length > 2 && (
        <div className="hidden lg:flex items-center bg-slate-100/90 p-1 rounded-xl border border-slate-200/80 shadow-2xs gap-1">
          {availableWings.map(wing => {
            const Icon = wing.icon
            const isActive = activeWing === wing.id
            return (
              <button
                key={wing.id}
                type="button"
                onClick={() => setActiveWing && setActiveWing(wing.id)}
                className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  isActive 
                    ? 'bg-white text-purple-700 shadow-xs border border-purple-200/70 ring-1 ring-purple-500/10' 
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
                }`}
                title={`Switch active view to ${wing.label}`}
              >
                <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-purple-600' : 'text-slate-500'}`} />
                <span>{wing.label}</span>
                {wing.badge && (
                  <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-semibold ${
                    isActive ? 'bg-[#f5eeff] text-purple-700' : 'bg-slate-200 text-slate-500'
                  }`}>
                    {wing.badge}
                  </span>
                )}
              </button>
            )
          })}
        </div>
      )}

      {/* Single Tier Campus Badge (when institute only has 1 tier enabled) */}
      {availableWings.length <= 2 && (
        <div className="hidden md:flex items-center gap-2 px-3 py-1 rounded-xl bg-slate-50 border border-slate-200/80 text-slate-700 text-xs font-semibold">
          {enabledTiers[0] === 'school' && <School className="w-4 h-4 text-purple-600" />}
          {enabledTiers[0] === 'college' && <Building2 className="w-4 h-4 text-purple-600" />}
          {enabledTiers[0] === 'undergraduate' && <GraduationCap className="w-4 h-4 text-purple-600" />}
          <span>{enabledTiers[0] === 'undergraduate' ? 'Undergraduates / University' : (enabledTiers[0] || 'Campus').toUpperCase()} Portal</span>
        </div>
      )}

      {/* Right: Settings and User Menu */}
      <div className="flex items-center gap-2 sm:gap-3">
        <button 
          onClick={onOpenSettings}
          className="p-2 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-50 transition-colors"
          title="System Settings"
        >
          <Settings className="w-5 h-5 text-slate-400" />
        </button>

        {/* User Profile Avatar with Popover */}
        <div className="relative" ref={profileRef}>
          <button 
            onClick={() => setShowProfileMenu(!showProfileMenu)}
            className="w-8 h-8 rounded-full bg-purple-600 flex items-center justify-center text-white cursor-pointer hover:ring-2 hover:ring-purple-300 transition-all shadow-sm focus:outline-none"
            title="Institute Admin Profile"
          >
            <User className="w-4 h-4 text-white" />
          </button>

          {showProfileMenu && (
            <div className="absolute right-0 mt-2 w-64 bg-white rounded-xl shadow-xl border border-slate-100 py-2 z-50 animate-in fade-in zoom-in-95">
              <div className="px-4 py-3 border-b border-slate-100">
                <p className="text-xs font-bold text-slate-800">{user?.name || 'Campus Administrator'}</p>
                <p className="text-[11px] text-slate-400 mt-0.5 truncate">{user?.email || 'admin@campus.edu'}</p>
                <div className="mt-2 inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-[#f5eeff] text-purple-700 border border-purple-200">
                  <ShieldCheck className="w-3 h-3 text-purple-600" />
                  <span>Campus Administrator</span>
                </div>
              </div>

              <div className="py-1">
                <button
                  onClick={() => {
                    setShowProfileMenu(false)
                    setShowPasswordModal(true)
                  }}
                  className="w-full text-left px-4 py-2 text-xs text-slate-700 hover:bg-slate-50 flex items-center gap-2 font-medium"
                >
                  <Key className="w-3.5 h-3.5 text-purple-600" />
                  <span>Change Password & Security</span>
                </button>

                <button
                  onClick={() => {
                    setShowProfileMenu(false)
                    onOpenSettings()
                  }}
                  className="w-full text-left px-4 py-2 text-xs text-slate-600 hover:bg-slate-50 flex items-center gap-2"
                >
                  <Settings className="w-3.5 h-3.5 text-slate-400" />
                  <span>System Settings</span>
                </button>
              </div>

              <div className="border-t border-slate-100 pt-1">
                <button
                  onClick={() => {
                    setShowProfileMenu(false)
                    logout()
                  }}
                  className="w-full text-left px-4 py-2 text-xs text-rose-600 hover:bg-rose-50 flex items-center gap-2 font-medium"
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

export default InstituteAdminNavbar
