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


  const availableWings = [
    ...(tierConfig.isMultiTier ? [{ id: 'all', label: 'All Wings', icon: Layers, badge: 'Overview' }] : []),
    ...(tierConfig.hasSchool ? [{ id: 'school', label: 'School Wing', icon: School, badge: 'K-10' }] : []),
    ...(tierConfig.hasCollege ? [{ id: 'college', label: 'College Wing', icon: Building2, badge: '11-12' }] : []),
    ...(tierConfig.hasUniversity ? [{ id: 'undergraduate', label: 'Undergraduates', icon: GraduationCap, badge: 'BS' }] : [])
  ]

  const getRouteTitle = () => {
    switch (currentRoute) {
      case 'inst-dashboard': return tierConfig?.isUniversityOnly ? 'Executive Dashboard' : 'Campus Dashboard'
      case 'inst-admissions': return (tierConfig?.isUniversityOnly || tierConfig?.isCollegeOnly) ? 'Admissions & Merit' : 'Admissions & Leads'
      case 'inst-students': return 'Students Directory'
      case 'inst-course-registration': return 'Course Registration & Enrollment'
      case 'inst-teachers': return tierConfig?.isUniversityOnly ? 'Faculty & HR Roster' : tierConfig?.isCollegeOnly ? 'Faculty & Staff Roster' : 'Staff & Faculty'
      case 'inst-payroll': return tierConfig?.isUniversityOnly ? 'HR Payroll & Compensation' : 'Staff Payroll & Compensation'
      case 'inst-classes': return tierConfig?.isUniversityOnly ? 'Degree Programs & Semesters' : tierConfig?.isCollegeOnly ? 'College Sections & Groups' : 'Classes & Sections'
      case 'inst-subjects': return tierConfig?.isUniversityOnly ? 'Course Catalog & Credit Hours' : tierConfig?.isCollegeOnly ? 'Curriculum & Course Subjects' : 'Academic Curriculum & Subjects'
      case 'inst-timetable': return tierConfig?.isUniversityOnly ? 'Lecture & Lab Timetable' : tierConfig?.isCollegeOnly ? 'College Timetable Schedule' : 'Class Timetable Schedule'
      case 'inst-program-levels': return (tierConfig?.isUniversityOnly || tierConfig?.isCollegeOnly) ? 'Academic Programs & Disciplines' : 'Academic Program Levels'
      case 'inst-attendance': return 'Attendance'
      case 'inst-exams': return tierConfig?.isUniversityOnly ? 'Examinations & Results (GPA / CGPA)' : tierConfig?.isCollegeOnly ? 'Examinations & Results (Internal)' : 'Term Examinations & Marks'
      case 'inst-board-exams': return 'Board Registration & Exams'
      case 'inst-fees': return 'Fees & Finance'
      case 'inst-accounts': return tierConfig?.isUniversityOnly ? 'Accounts, Budget & Procurement' : 'Campus Accounts & Financial Ledger'
      case 'inst-scholarships': return tierConfig?.isUniversityOnly ? 'Scholarships & Financial Aid' : 'Scholarships & Merit Awards'
      case 'inst-certificates': return tierConfig?.isUniversityOnly ? 'Transcripts, Degrees & Certificates' : tierConfig?.isCollegeOnly ? 'Certificates (Provisional, Migration, CLC, DMC)' : 'School Leaving (SLC) & Certificates'
      case 'inst-research-fyp': return 'Research, FYP & Thesis (MS / PhD)'
      case 'inst-notices': return 'Communication & Notices'
      case 'inst-discipline': return 'Student Affairs & Discipline'
      case 'inst-learning': return tierConfig?.isUniversityOnly ? 'Learning Management (LMS)' : tierConfig?.isCollegeOnly ? 'Learning & Resources' : 'Homework & Learning Resources'
      case 'inst-career-alumni': return 'Career, Placement & Alumni'
      case 'inst-transport': return 'Campus Transport & Fleet'
      case 'inst-library': return tierConfig?.isUniversityOnly ? 'Central University Library' : 'Campus Library & Book Issues'
      case 'inst-inventory': return 'Campus Inventory & Asset Management'
      case 'inst-hostel': return 'Campus Hostel & Boarding Services'
      case 'inst-labs': return tierConfig?.isUniversityOnly ? 'Computing & Research Laboratories' : 'Science & Computer Laboratories'
      case 'inst-campus-it': return 'IT Infrastructure & Networking'
      case 'inst-events': return tierConfig?.isUniversityOnly ? 'Events & Convocation' : 'Events & Calendar'
      case 'inst-reports': return tierConfig?.isUniversityOnly ? 'Reports & HEC / QEC Compliance' : 'Reports & Analytics'
      case 'inst-users': return tierConfig?.isUniversityOnly ? 'Users, Roles & Workflow Approvals' : 'Users, Roles & Access'
      case 'inst-settings': return tierConfig?.isUniversityOnly ? 'Settings & Security' : 'Campus System Settings'
      case 'inst-student-portal': return 'Student & Parent Portal (Live Preview)'
      default: return tierConfig?.portalTitle || 'Campus Portal'
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

      {/* Center: Academic Wing Switcher (Multi-Tier Option A Architecture) */}
      {tierConfig.isMultiTier && availableWings.length > 2 && (
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
      {!tierConfig.isMultiTier && (
        <div className="hidden md:flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-emerald-50 border border-emerald-200/80 text-emerald-950 text-xs font-bold shadow-2xs">
          {tierConfig.isSchoolOnly && <School className="w-4 h-4 text-emerald-600" />}
          {tierConfig.isCollegeOnly && <Building2 className="w-4 h-4 text-emerald-600" />}
          {tierConfig.isUniversityOnly && <GraduationCap className="w-4 h-4 text-emerald-600" />}
          <span>{tierConfig.portalTypeLabel}</span>
        </div>
      )}

      {/* Sync Engine Status Indicator */}
      <div className="hidden xl:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-50 border border-slate-200/70 text-[11px] font-semibold text-slate-600">
        <span className={`w-2 h-2 rounded-full ${isCloudSynced ? 'bg-emerald-500 animate-pulse' : 'bg-emerald-600'}`}></span>
        <span>{isCloudSynced ? 'Cloud Live' : 'Edge Mode'}</span>
      </div>

      {/* Right: Preview As Switcher, Settings, and User Menu */}
      <div className="flex items-center gap-2 sm:gap-3">
        {/* Discrete "Preview As" Role Switcher Dropdown */}
        <div className="relative" ref={previewRef}>
          <button
            type="button"
            onClick={() => setShowPreviewMenu(!showPreviewMenu)}
            className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer shadow-2xs border active:scale-95 ${
              currentRoute === 'inst-student-portal'
                ? 'bg-emerald-600 text-white border-emerald-600 shadow-emerald-600/20'
                : currentRoute === 'inst-teachers'
                ? 'bg-teal-600 text-white border-teal-600 shadow-teal-600/20'
                : 'bg-white hover:bg-emerald-50 text-slate-700 hover:text-emerald-800 border-slate-200 hover:border-emerald-300'
            }`}
            title="Preview system as Teacher or Student/Parent"
          >
            <Eye className={`w-3.5 h-3.5 ${currentRoute === 'inst-student-portal' || currentRoute === 'inst-teachers' ? 'text-white' : 'text-emerald-600'}`} />
            <span className="hidden sm:inline">
              {currentRoute === 'inst-student-portal'
                ? 'Student/Parent View'
                : currentRoute === 'inst-teachers'
                ? 'Teacher Desk'
                : 'Preview As'}
            </span>
            <ChevronDown className={`w-3 h-3 transition-transform ${showPreviewMenu ? 'rotate-180' : ''}`} />
          </button>

          {showPreviewMenu && (
            <div className="absolute right-0 mt-2 w-72 bg-white rounded-2xl shadow-xl border border-slate-100 py-2.5 z-50 animate-in fade-in zoom-in-95">
              <div className="px-4 py-2 border-b border-slate-100">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-extrabold uppercase tracking-wider text-slate-400">Portal Perspective</span>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                    Live Simulator
                  </span>
                </div>
                <p className="text-xs text-slate-500 mt-0.5">Switch viewing role without logging out</p>
              </div>

              <div className="p-1.5 space-y-1">
                {/* 1. Admin Master Desk */}
                <button
                  type="button"
                  onClick={() => {
                    setShowPreviewMenu(false)
                    onRouteChange && onRouteChange('inst-dashboard')
                  }}
                  className={`w-full text-left p-2.5 rounded-xl text-xs flex items-center justify-between transition-colors cursor-pointer ${
                    currentRoute !== 'inst-student-portal' && currentRoute !== 'inst-teachers'
                      ? 'bg-emerald-50 text-emerald-950 font-bold border border-emerald-200/80'
                      : 'text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-lg bg-emerald-100/70 text-emerald-800 flex items-center justify-center font-bold">
                      <Building2 className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="font-bold flex items-center gap-1.5">
                        <span>Admin Master Desk</span>
                        <span className="text-[9px] px-1.5 py-0.2 rounded bg-slate-200 text-slate-700">Full Access</span>
                      </div>
                      <p className="text-[11px] text-slate-400 font-normal">Classes, timetable, admissions & fees</p>
                    </div>
                  </div>
                  {currentRoute !== 'inst-student-portal' && currentRoute !== 'inst-teachers' && (
                    <Check className="w-4 h-4 text-emerald-600" />
                  )}
                </button>

                {/* 2. Teacher Desk */}
                <button
                  type="button"
                  onClick={() => {
                    setShowPreviewMenu(false)
                    onRouteChange && onRouteChange('inst-teachers')
                  }}
                  className={`w-full text-left p-2.5 rounded-xl text-xs flex items-center justify-between transition-colors cursor-pointer ${
                    currentRoute === 'inst-teachers'
                      ? 'bg-teal-50 text-teal-950 font-bold border border-teal-200/80'
                      : 'text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-lg bg-teal-100/70 text-teal-800 flex items-center justify-center font-bold">
                      <UserCheck className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="font-bold flex items-center gap-1.5">
                        <span>Teacher & Faculty Desk</span>
                        <span className="text-[9px] px-1.5 py-0.2 rounded bg-teal-100 text-teal-800">Faculty</span>
                      </div>
                      <p className="text-[11px] text-slate-400 font-normal">Attendance, diary & marks entry</p>
                    </div>
                  </div>
                  {currentRoute === 'inst-teachers' && (
                    <Check className="w-4 h-4 text-teal-600" />
                  )}
                </button>

                {/* 3. Student & Parent Portal */}
                <button
                  type="button"
                  onClick={() => {
                    setShowPreviewMenu(false)
                    onRouteChange && onRouteChange('inst-student-portal')
                  }}
                  className={`w-full text-left p-2.5 rounded-xl text-xs flex items-center justify-between transition-colors cursor-pointer ${
                    currentRoute === 'inst-student-portal'
                      ? 'bg-emerald-50 text-emerald-950 font-bold border border-emerald-200/80'
                      : 'text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-lg bg-emerald-100/70 text-emerald-800 flex items-center justify-center font-bold">
                      <GraduationCap className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="font-bold flex items-center gap-1.5">
                        <span>Student & Parent Portal</span>
                        <span className="text-[9px] px-1.5 py-0.2 rounded bg-emerald-100 text-emerald-800">Live View</span>
                      </div>
                      <p className="text-[11px] text-slate-400 font-normal">Bank fee challan, diary & report card</p>
                    </div>
                  </div>
                  {currentRoute === 'inst-student-portal' && (
                    <Check className="w-4 h-4 text-emerald-600" />
                  )}
                </button>
              </div>
            </div>
          )}
        </div>
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
                    onRouteChange && onRouteChange('inst-student-portal')
                  }}
                  className="w-full text-left px-4 py-2 text-xs text-emerald-700 hover:bg-emerald-50 flex items-center gap-2 font-bold"
                >
                  <GraduationCap className="w-3.5 h-3.5 text-emerald-600" />
                  <span>View Student & Parent Portal</span>
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
