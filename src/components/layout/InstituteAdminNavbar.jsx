import React, { useState, useRef, useEffect } from 'react'
import { 
  School, 
  ChevronRight, 
  ChevronDown, 
  Menu, 
  LogOut, 
  ShieldCheck, 
  GraduationCap, 
  Building2, 
  Layers, 
  Settings, 
  User,
  Key,
  UserCheck,
  Eye,
  Check,
  Palette,
  Moon,
  Sun
} from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import { useAppData } from '../../context/AppDataContext'
import { useTheme } from '../../context/ThemeContext'
import ChangePasswordModal from '../common/ChangePasswordModal'
import { getInstituteTierConfig } from '../../utils/tierGating'

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
  const { user, logout } = useAuth()
  const { isDark, toggleThemeMode, preset, activeThemeConfig } = useTheme()
  const { 
    institutes, 
    activeWing = 'all',
    setActiveWing,
    isCloudSynced
  } = useAppData()

  const [dropdownOpen, setDropdownOpen] = useState(false)
  const [showProfileMenu, setShowProfileMenu] = useState(false)
  const [showPasswordModal, setShowPasswordModal] = useState(false)
  const [showPreviewMenu, setShowPreviewMenu] = useState(false)

  const profileRef = useRef(null)
  const campusRef = useRef(null)
  const previewRef = useRef(null)

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
      case 'inst-subscription': return 'Subscription & Plan'
      case 'inst-training': return 'Training Videos'
      case 'inst-my-transactions': return 'My Transactions'
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

      {/* Center: School Portal Badge */}
      <div className="hidden md:flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-emerald-50 border border-emerald-200/80 text-emerald-950 text-xs font-bold shadow-2xs">
        <School className="w-4 h-4 text-emerald-600" />
        <span>School Portal (K-10)</span>
      </div>

      {/* Sync Engine Status Indicator */}
      <div className="hidden xl:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-50 border border-slate-200/70 text-[11px] font-semibold text-slate-600">
        <span className={`w-2 h-2 rounded-full ${isCloudSynced ? 'bg-emerald-500 animate-pulse' : 'bg-emerald-600'}`}></span>
        <span>{isCloudSynced ? 'Cloud Live' : 'Edge Mode'}</span>
      </div>

      {/* Right: Theme Studio, Settings, and User Menu */}
      <div className="flex items-center gap-2 sm:gap-3">
        {/* Theme Studio & Preset Trigger */}
        <button
          type="button"
          onClick={onOpenThemeModal}
          className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-xs font-bold border border-[var(--border)] bg-[var(--surface)] text-[var(--text)] hover:border-[var(--primary)] shadow-2xs transition-all cursor-pointer"
          title="Theme Studio: Presets & Dark Mode"
        >
          <Palette className="w-3.5 h-3.5 text-[var(--primary)]" />
          <span className="hidden sm:inline capitalize font-bold">{preset}</span>
          <span 
            className="w-2.5 h-2.5 rounded-full shadow-2xs" 
            style={{ backgroundColor: activeThemeConfig?.primary || 'var(--primary)' }} 
          />
        </button>

        {/* Quick Dark Mode Toggle */}
        <button
          type="button"
          onClick={toggleThemeMode}
          className="p-2 text-[var(--text-muted)] hover:text-[var(--text)] rounded-xl hover:bg-[var(--primary-soft)] transition-colors cursor-pointer"
          title={isDark ? "Switch to Light Mode" : "Switch to Dark Mode"}
        >
          {isDark ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-indigo-600" />}
        </button>

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
            className="w-8 h-8 rounded-full bg-emerald-600 flex items-center justify-center text-white cursor-pointer hover:ring-2 hover:ring-emerald-300 transition-all shadow-sm focus:outline-none"
            title="Institute Admin Profile"
          >
            <User className="w-4 h-4 text-white" />
          </button>

          {showProfileMenu && (
            <div className="absolute right-0 mt-2 w-64 bg-white rounded-xl shadow-xl border border-slate-100 py-2 z-50 animate-in fade-in zoom-in-95">
              <div className="px-4 py-3 border-b border-slate-100">
                <p className="text-xs font-bold text-slate-800">{user?.name || tierConfig.roleBadge}</p>
                <p className="text-[11px] text-slate-400 mt-0.5 truncate">{user?.email || 'admin@campus.edu'}</p>
                <div className="mt-2 inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-[#ecfdf5] text-emerald-800 border border-emerald-200">
                  <ShieldCheck className="w-3 h-3 text-emerald-600" />
                  <span>{user?.roleTitle || tierConfig.roleBadge}</span>
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
                  <Key className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Change Password & Security</span>
                </button>

                <button
                  onClick={() => {
                    setShowProfileMenu(false)
                    onRouteChange && onRouteChange('inst-students')
                  }}
                  className="w-full text-left px-4 py-2 text-xs text-emerald-700 hover:bg-emerald-50 flex items-center gap-2 font-bold"
                >
                  <GraduationCap className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Manage Students Directory</span>
                </button>

                <button
                  onClick={() => {
                    setShowProfileMenu(false)
                    onRouteChange && onRouteChange('inst-teachers')
                  }}
                  className="w-full text-left px-4 py-2 text-xs text-slate-700 hover:bg-slate-50 flex items-center gap-2 font-medium"
                >
                  <UserCheck className="w-3.5 h-3.5 text-slate-500" />
                  <span>Teacher Operations & Matrix</span>
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
