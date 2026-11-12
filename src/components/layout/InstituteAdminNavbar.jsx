import React, { useState, useRef, useEffect } from 'react'
import { 
  School, 
  ChevronRight, 
  ChevronDown, 
  Menu, 
  LogOut, 
  ShieldCheck, 
  GraduationCap, 
  Settings, 
  User,
  Key,
  UserCheck,
  Palette,
  Moon,
  Sun,
  Search,
  Bell,
  Mail,
  Camera
} from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import { useAppData } from '../../context/AppDataContext'
import { useTheme } from '../../context/ThemeContext'
import { useToast } from '../../context/ToastContext'
import ChangePasswordModal from '../common/ChangePasswordModal'
import { getInstituteTierConfig } from '../../utils/tierGating'
import { getAdminDisplayName, compressAvatarImage } from '../../utils/profileUtils'

export const InstituteAdminNavbar = ({ 
  currentRoute, 
  selectedInstitute, 
  onSelectInstitute, 
  onOpenSettings,
  onOpenMobileMenu,
  onOpenCommandPalette,
  onRouteChange,
  onOpenThemeModal
}) => {
  const { user, logout, updateProfile } = useAuth()
  const { isDark, toggleThemeMode, preset, activeThemeConfig } = useTheme()
  const { toast } = useToast()
  const { 
    institutes
  } = useAppData()

  const [dropdownOpen, setDropdownOpen] = useState(false)
  const [showProfileMenu, setShowProfileMenu] = useState(false)
  const [showPasswordModal, setShowPasswordModal] = useState(false)
  const [showPreviewMenu, setShowPreviewMenu] = useState(false)

  const profileRef = useRef(null)
  const campusRef = useRef(null)
  const previewRef = useRef(null)
  const avatarInputRef = useRef(null)

  const displayName = getAdminDisplayName(user)

  const handleAvatarSelected = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    try {
      const dataUrl = await compressAvatarImage(file, 256)
      updateProfile({ avatar: dataUrl })
      toast?.success?.('Profile picture updated!')
    } catch (err) {
      toast?.error?.(err?.message || 'Unable to upload selected photo.')
    } finally {
      if (avatarInputRef.current) avatarInputRef.current.value = ''
    }
  }

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (profileRef.current && !profileRef.current.contains(e.target)) {
        setShowProfileMenu(false)
      }
      if (campusRef.current && !campusRef.current.contains(e.target)) {
        setDropdownOpen(false)
      }
      if (previewRef.current && !previewRef.current.contains(e.target)) {
        setShowPreviewMenu(false)
      }
    }
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        setShowProfileMenu(false)
        setDropdownOpen(false)
        setShowPreviewMenu(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    window.addEventListener('keydown', handleKeyDown)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [])

  const tierConfig = getInstituteTierConfig(selectedInstitute)

  const getRouteTitle = () => {
    switch (currentRoute) {
      case 'inst-dashboard': return 'Dashboard'
      case 'inst-admissions': return 'Admission Inquiries'
      case 'inst-admissions-online': return 'Online Applications'
      case 'inst-admissions-enroll': return 'Enroll Student'
      case 'inst-admissions-import': return 'Bulk Import Students'
      case 'inst-students': return 'All Students'
      case 'inst-students-guardians': return 'Parents & Guardians'
      case 'inst-students-promote': return 'Promote Students'
      case 'inst-students-manage-promotions': return 'Manage Promotions'
      case 'inst-students-graduated': return 'Graduated Students'
      case 'inst-students-drop-leave': return 'Drop / Leave Students'
      case 'inst-students-status': return 'Student Status & Transfers'
      case 'inst-students-idcards': return 'Student ID Cards'
      case 'inst-reports-students': return 'Student Performance Reports'
      case 'inst-teachers': return 'All Staff'
      case 'inst-payroll': return 'Payroll & Compensation'
      case 'inst-staff-loans': return 'Loans & Advances'
      case 'inst-staff-fines': return 'Staff Fines'
      case 'inst-staff-docs': return 'Staff Documents'
      case 'inst-staff-letters': return 'Appointment Letters'
      case 'inst-staff-idcards': return 'Staff ID Cards'
      case 'inst-staff-reports': return 'HR & Workload Reports'
      case 'inst-classes': return 'Classes & Sections'
      case 'inst-subjects': return 'Subjects'
      case 'inst-timetable': return 'Timetable'
      case 'inst-assignments': return 'Assignments'
      case 'inst-learning':
      case 'inst-learning-handouts': return 'Handouts & Class Resources'
      case 'inst-learning-lectures': return 'Recorded Lectures'
      case 'inst-makeup-sessions': return 'Make-up Sessions'
      case 'inst-program-levels': return 'School Grade Levels (K-10)'
      case 'inst-attendance': return 'Mark Attendance'
      case 'inst-attendance-my': return 'My Attendance'
      case 'inst-attendance-student-report': return 'Student Attendance Report'
      case 'inst-attendance-staff-report': return 'Staff Attendance Report'
      case 'inst-attendance-consecutive': return 'Consecutive Absences'
      case 'inst-attendance-low': return 'Low Attendance Defaulters'
      case 'inst-attendance-unmarked': return 'Unmarked Classes'
      case 'inst-attendance-settings': return 'Attendance Settings'
      case 'inst-exams': return 'Exams'
      case 'inst-exams-schedule': return 'Exam Schedule'
      case 'inst-exams-assessments': return 'Assessments'
      case 'inst-exams-marks': return 'Marks Entry'
      case 'inst-exams-result-summary': return 'Result Summary'
      case 'inst-exams-report-cards': return 'Report Cards'
      case 'inst-exams-grades': return 'Grades'
      case 'inst-exams-settings': return 'Exam Settings'
      case 'inst-fees': return 'Fee Invoices'
      case 'inst-fees-history': return 'Billing History'
      case 'inst-fees-family': return 'Family Vouchers'
      case 'inst-fees-approvals': return 'Payment Approvals'
      case 'inst-fees-outstanding': return 'Outstanding Fees'
      case 'inst-fees-fines': return 'Fines'
      case 'inst-fees-setup': return 'Student Fee Setup'
      case 'inst-fees-settings': return 'Fee Settings'
      case 'inst-fees-categories': return 'Fee Categories'
      case 'inst-fees-payment-methods': return 'Payment Methods'
      case 'inst-fees-invoice-layout': return 'Invoice Layout'
      case 'inst-accounts': return 'Financial Dashboard'
      case 'inst-accounts-collection': return 'Fee Collection Report'
      case 'inst-accounts-income': return 'Other Income'
      case 'inst-accounts-expenses': return 'All Expenses'
      case 'inst-accounts-categories': return 'Expense Categories'
      case 'inst-certificates': return 'Certificates'
      case 'inst-notices': return 'Announcements'
      case 'inst-communication':
      case 'inst-communication-inbox': return 'Communication Inbox'
      case 'inst-communication-notifications': return 'Notifications'
      case 'inst-communication-whatsapp': return 'WhatsApp Gateway'
      case 'inst-communication-sms': return 'SMS Settings'
      case 'inst-transport': return 'Transport Routes'
      case 'inst-hostels': return 'Hostels & Dorms'
      case 'inst-library': return 'Library Books'
      case 'inst-library-issue': return 'Issue & Return'
      case 'inst-inventory': return 'Inventory Items'
      case 'inst-inventory-categories': return 'Inventory Categories'
      case 'inst-inventory-receive': return 'Receive Stock'
      case 'inst-inventory-issue': return 'Issue to Students'
      case 'inst-inventory-reports': return 'Inventory Reports'
      case 'inst-events': return 'Academic Calendar & Events'
      case 'inst-reports': return 'Reports & Analytics'
      case 'inst-policies': return 'Policies & Guidelines'
      case 'inst-users': return 'Users & Roles'
      case 'inst-settings': return 'Institute Profile'
      case 'inst-settings-locations': return 'Campus Locations'
      case 'inst-settings-activity': return 'Activity Log'
      case 'inst-my-transactions': return 'My Transaction History'
      case 'inst-my-account': return 'My Account & Security'
      default: return tierConfig?.portalTitle || 'School Portal'
    }
  }

  return (
    <header className="h-14 sm:h-16 min-h-[56px] sm:min-h-[64px] bg-[var(--surface)] border-b border-[var(--border)] text-[var(--text)] px-3.5 sm:px-6 md:px-8 flex items-center justify-between sticky top-0 z-30 shrink-0 shadow-soft transition-colors duration-200">
      {/* Left: Mobile Hamburger, Campus Switcher, & Route Breadcrumb */}
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

        <ChevronRight className="hidden sm:inline-block w-3.5 h-3.5 text-slate-300 shrink-0" />
        <h1 className="text-sm font-semibold text-slate-800 truncate max-w-[220px] sm:max-w-none">
          {getRouteTitle()}
        </h1>
      </div>

      {/* Center: Quick Global Search Input (opens Command Palette) */}
      <div className="hidden md:flex flex-1 max-w-md mx-4">
        <button
          type="button"
          onClick={onOpenCommandPalette}
          className="w-full flex items-center justify-between gap-2.5 px-3.5 py-2 rounded-full bg-slate-50 border border-[var(--border)] text-xs text-[var(--text-muted)] hover:border-[var(--primary)] transition-colors cursor-pointer"
          title="Quick Search (Ctrl+K)"
        >
          <span className="truncate">Search name, roll, admission, registration no...</span>
          <Search className="w-3.5 h-3.5 shrink-0 text-slate-400" />
        </button>
      </div>

      {/* Right: Alerts, Theme, Settings, and Unknown User Profile */}
      <div className="flex items-center gap-1.5 sm:gap-2.5">
        <button
          type="button"
          onClick={() => onRouteChange && onRouteChange('inst-communication-notifications')}
          className="p-2 text-[var(--text-muted)] hover:text-[var(--text)] rounded-full hover:bg-slate-100 transition-colors cursor-pointer"
          title="Notifications"
        >
          <Bell className="w-4 h-4" />
        </button>

        <button
          type="button"
          onClick={() => onRouteChange && onRouteChange('inst-communication-inbox')}
          className="p-2 text-[var(--text-muted)] hover:text-[var(--text)] rounded-full hover:bg-slate-100 transition-colors cursor-pointer"
          title="Inbox & Messages"
        >
          <Mail className="w-4 h-4" />
        </button>

        {/* Quick Dark Mode Toggle */}
        <button
          type="button"
          onClick={toggleThemeMode}
          className="p-2 text-[var(--text-muted)] hover:text-[var(--text)] rounded-full hover:bg-[var(--primary-soft)] transition-colors cursor-pointer"
          title={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
        >
          {isDark ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-slate-500" />}
        </button>

        {/* Hidden Avatar Upload Input */}
        <input
          ref={avatarInputRef}
          type="file"
          accept="image/*"
          onChange={handleAvatarSelected}
          className="hidden"
        />

        {/* User Profile Pill with Avatar Picker & Dropdown */}
        <div className="relative" ref={profileRef}>
          <button
            type="button"
            onClick={() => setShowProfileMenu(!showProfileMenu)}
            className="flex items-center gap-2.5 pl-1.5 pr-2.5 py-1 rounded-full hover:bg-slate-100/80 border border-transparent hover:border-[var(--border)] transition-all cursor-pointer focus:outline-none"
            title="Admin Profile & Photo"
          >
            {user?.avatar ? (
              <img
                src={user.avatar}
                alt={displayName}
                className="w-8 h-8 rounded-full object-cover border border-slate-200 shrink-0"
              />
            ) : (
              <div className="w-8 h-8 rounded-full bg-slate-200 text-slate-600 flex items-center justify-center shrink-0 border border-slate-300">
                <User className="w-4 h-4" />
              </div>
            )}
            <div className="hidden sm:flex flex-col items-start text-left leading-tight">
              <span className="text-xs font-bold text-[var(--text)] truncate max-w-[120px]">{displayName}</span>
              <span className="mt-0.5 px-1.5 py-0.2 rounded bg-sky-100 text-sky-700 text-[9px] font-extrabold uppercase tracking-wider">
                ADMIN
              </span>
            </div>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400 hidden sm:block" />
          </button>

          {showProfileMenu && (
            <div className="absolute right-0 mt-2 w-64 bg-white rounded-xl shadow-xl border border-slate-100 py-2 z-50 animate-in fade-in zoom-in-95">
              <div className="px-4 py-3 border-b border-slate-100 flex items-center gap-3">
                {user?.avatar ? (
                  <img src={user.avatar} alt={displayName} className="w-10 h-10 rounded-full object-cover border border-slate-200 shrink-0" />
                ) : (
                  <div className="w-10 h-10 rounded-full bg-slate-100 text-slate-500 flex items-center justify-center shrink-0 border border-slate-200">
                    <User className="w-5 h-5" />
                  </div>
                )}
                <div className="min-w-0">
                  <p className="text-xs font-bold text-slate-800 truncate">{displayName}</p>
                  <p className="text-[11px] text-slate-400 truncate">{user?.email || 'admin@campus.edu'}</p>
                </div>
              </div>

              <div className="py-1">
                <button
                  type="button"
                  onClick={() => {
                    setShowProfileMenu(false)
                    avatarInputRef.current?.click()
                  }}
                  className="w-full text-left px-4 py-2 text-xs text-slate-700 hover:bg-slate-50 flex items-center gap-2 font-medium cursor-pointer"
                >
                  <Camera className="w-3.5 h-3.5 text-emerald-600" />
                  <span>{user?.avatar ? 'Change Profile Photo' : 'Select Profile Photo'}</span>
                </button>

                {user?.avatar && (
                  <button
                    type="button"
                    onClick={() => {
                      updateProfile({ avatar: null })
                      setShowProfileMenu(false)
                      toast?.info?.('Profile photo removed.')
                    }}
                    className="w-full text-left px-4 py-2 text-xs text-rose-600 hover:bg-rose-50 flex items-center gap-2 font-medium cursor-pointer"
                  >
                    <User className="w-3.5 h-3.5 text-rose-500" />
                    <span>Remove Profile Photo</span>
                  </button>
                )}

                <button
                  type="button"
                  onClick={() => {
                    setShowProfileMenu(false)
                    onRouteChange && onRouteChange('inst-my-account')
                  }}
                  className="w-full text-left px-4 py-2 text-xs text-slate-700 hover:bg-slate-50 flex items-center gap-2 font-medium cursor-pointer"
                >
                  <UserCheck className="w-3.5 h-3.5 text-slate-500" />
                  <span>My Account &amp; Name</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setShowProfileMenu(false)
                    setShowPasswordModal(true)
                  }}
                  className="w-full text-left px-4 py-2 text-xs text-slate-700 hover:bg-slate-50 flex items-center gap-2 font-medium cursor-pointer"
                >
                  <Key className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Change Password &amp; Security</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setShowProfileMenu(false)
                    onOpenThemeModal && onOpenThemeModal()
                  }}
                  className="w-full text-left px-4 py-2 text-xs text-slate-600 hover:bg-slate-50 flex items-center gap-2 cursor-pointer"
                >
                  <Palette className="w-3.5 h-3.5 text-indigo-500" />
                  <span>Theme Studio ({preset})</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setShowProfileMenu(false)
                    onOpenSettings()
                  }}
                  className="w-full text-left px-4 py-2 text-xs text-slate-600 hover:bg-slate-50 flex items-center gap-2 cursor-pointer"
                >
                  <Settings className="w-3.5 h-3.5 text-slate-400" />
                  <span>System Settings</span>
                </button>
              </div>

              <div className="border-t border-slate-100 pt-1">
                <button
                  type="button"
                  onClick={() => {
                    setShowProfileMenu(false)
                    logout()
                  }}
                  className="w-full text-left px-4 py-2 text-xs text-rose-600 hover:bg-rose-50 flex items-center gap-2 font-medium cursor-pointer"
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
