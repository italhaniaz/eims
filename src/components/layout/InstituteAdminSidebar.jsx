import React, { useState } from 'react'
import { 
  LayoutDashboard, 
  GraduationCap, 
  Users, 
  BookOpen, 
  Bookmark,
  CalendarCheck, 
  Receipt, 
  Award,
  Clock,
  Megaphone,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  ChevronUp,
  LogOut,
  School,
  X,
  UserCheck,
  Bus,
  BookMarked
} from 'lucide-react'
import { useAuth } from '../../context/AuthContext'

export const InstituteAdminSidebar = ({ 
  currentRoute, 
  onRouteChange, 
  instituteName,
  isMobileOpen = false,
  onCloseMobile = () => {}
}) => {
  const { user, logout } = useAuth()
  const [collapsed, setCollapsed] = useState(false)

  const isStudentRoute = ['inst-students', 'inst-admissions', 'inst-teachers', 'inst-classes'].includes(currentRoute)
  const isAcademicRoute = ['inst-timetable', 'inst-attendance', 'inst-exams', 'inst-subjects', 'inst-notices', 'inst-program-levels'].includes(currentRoute)
  const isServicesRoute = ['inst-fees', 'inst-transport', 'inst-library'].includes(currentRoute)

  const [studentOpen, setStudentOpen] = useState(isStudentRoute)
  const [academicOpen, setAcademicOpen] = useState(isAcademicRoute)
  const [servicesOpen, setServicesOpen] = useState(isServicesRoute)

  React.useEffect(() => {
    if (isStudentRoute) setStudentOpen(true)
    if (isAcademicRoute) setAcademicOpen(true)
    if (isServicesRoute) setServicesOpen(true)
  }, [currentRoute])

  const isRouteActive = (route) => currentRoute === route

  const handleNavClick = (id) => {
    onRouteChange(id)
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
          className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-40 lg:hidden"
        />
      )}

      <aside 
        className={`
          fixed lg:static top-0 bottom-0 left-0 z-50
          ${isMobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
          ${collapsed ? 'lg:w-20' : 'w-64'} 
          min-h-screen bg-[#111c30] text-slate-300 flex flex-col 
          transition-all duration-300 shrink-0 border-r border-[#1e2d4d] select-none
        `}
      >
        {/* Top Header */}
        <div className="h-16 flex items-center justify-between px-4 border-b border-[#1e2d4d] shrink-0">
          {(!collapsed || isMobileOpen) && (
            <div className="flex items-center gap-2.5 overflow-hidden">
              <div className="w-8 h-8 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
                <School className="w-4 h-4" />
              </div>
              <div className="flex flex-col truncate">
                <span className="text-xs font-bold text-white tracking-wide truncate">
                  {instituteName || 'Campus Administration'}
                </span>
                <span className="text-[10px] text-emerald-400 font-semibold uppercase tracking-wider">
                  Institute Admin
                </span>
              </div>
            </div>
          )}

          {/* Mobile Close Button */}
          <button 
            onClick={onCloseMobile}
            className="lg:hidden text-slate-400 hover:text-white p-1 rounded hover:bg-[#1d2a46] transition-colors ml-auto"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Desktop Collapse Button */}
          <button 
            onClick={() => setCollapsed(!collapsed)}
            className="hidden lg:block text-slate-400 hover:text-white p-1 rounded hover:bg-[#1d2a46] transition-colors ml-auto"
            title={collapsed ? "Expand Sidebar" : "Collapse Sidebar"}
          >
            {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
          </button>
        </div>

        {/* Navigation Menu */}
        <div className="flex-1 py-4 px-3 space-y-1 overflow-y-auto dark-scroll text-[13.5px]">
          {/* Dashboard */}
          <button
            onClick={() => handleNavClick('inst-dashboard')}
            className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-lg transition-all text-left ${
              isRouteActive('inst-dashboard')
                ? 'bg-emerald-600 text-white font-semibold shadow-md'
                : 'text-slate-300 hover:text-white hover:bg-[#1a2744]'
            }`}
          >
            <LayoutDashboard className={`w-[18px] h-[18px] shrink-0 ${isRouteActive('inst-dashboard') ? 'text-white' : 'text-slate-400'}`} />
            {(!collapsed || isMobileOpen) && <span>Campus Dashboard</span>}
          </button>

          {/* Group 1: Students & Faculty */}
          <div>
            <button
              onClick={() => {
                if (collapsed) setCollapsed(false)
                setStudentOpen(!studentOpen)
              }}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-lg transition-colors ${
                isStudentRoute 
                  ? 'text-white bg-[#1a2744]/70 font-medium' 
                  : 'text-slate-300 hover:text-white hover:bg-[#1a2744]'
              }`}
            >
              <div className="flex items-center gap-3">
                <GraduationCap className={`w-[18px] h-[18px] shrink-0 ${isStudentRoute ? 'text-emerald-400' : 'text-slate-400'}`} />
                {(!collapsed || isMobileOpen) && <span>Students & Faculty</span>}
              </div>
              {(!collapsed || isMobileOpen) && (
                studentOpen ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />
              )}
            </button>

            {(!collapsed || isMobileOpen) && studentOpen && (
              <div className="mt-1 pl-4 pr-1 space-y-0.5 border-l border-[#24365c] ml-5">
                <button
                  onClick={() => handleNavClick('inst-students')}
                  className={`w-full flex items-center gap-2.5 text-left py-2 px-2.5 rounded-md text-[13px] transition-colors ${
                    isRouteActive('inst-students') ? 'text-white font-medium bg-[#1e2f54]' : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <GraduationCap className="w-3.5 h-3.5 opacity-80 text-emerald-400 shrink-0" />
                  <span className="truncate">Student Admissions</span>
                </button>
                <button
                  onClick={() => handleNavClick('inst-admissions')}
                  className={`w-full flex items-center gap-2.5 text-left py-2 px-2.5 rounded-md text-[13px] transition-colors ${
                    isRouteActive('inst-admissions') ? 'text-white font-medium bg-[#1e2f54]' : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <UserCheck className="w-3.5 h-3.5 opacity-80 text-teal-400 shrink-0" />
                  <span className="truncate">Inquiries & Leads</span>
                </button>
                <button
                  onClick={() => handleNavClick('inst-teachers')}
                  className={`w-full flex items-center gap-2.5 text-left py-2 px-2.5 rounded-md text-[13px] transition-colors ${
                    isRouteActive('inst-teachers') ? 'text-white font-medium bg-[#1e2f54]' : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <Users className="w-3.5 h-3.5 opacity-80 text-blue-400 shrink-0" />
                  <span className="truncate">Faculty & Staff</span>
                </button>
                <button
                  onClick={() => handleNavClick('inst-classes')}
                  className={`w-full flex items-center gap-2.5 text-left py-2 px-2.5 rounded-md text-[13px] transition-colors ${
                    isRouteActive('inst-classes') ? 'text-white font-medium bg-[#1e2f54]' : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <BookOpen className="w-3.5 h-3.5 opacity-80 text-indigo-400 shrink-0" />
                  <span className="truncate">Classes & Sections</span>
                </button>
              </div>
            )}
          </div>

          {/* Group 2: Academics & Operations */}
          <div>
            <button
              onClick={() => {
                if (collapsed) setCollapsed(false)
                setAcademicOpen(!academicOpen)
              }}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-lg transition-colors ${
                isAcademicRoute 
                  ? 'text-white bg-[#1a2744]/70 font-medium' 
                  : 'text-slate-300 hover:text-white hover:bg-[#1a2744]'
              }`}
            >
              <div className="flex items-center gap-3">
                <CalendarCheck className={`w-[18px] h-[18px] shrink-0 ${isAcademicRoute ? 'text-emerald-400' : 'text-slate-400'}`} />
                {(!collapsed || isMobileOpen) && <span>Academics & Schedule</span>}
              </div>
              {(!collapsed || isMobileOpen) && (
                academicOpen ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />
              )}
            </button>

            {(!collapsed || isMobileOpen) && academicOpen && (
              <div className="mt-1 pl-4 pr-1 space-y-0.5 border-l border-[#24365c] ml-5">
                <button
                  onClick={() => handleNavClick('inst-timetable')}
                  className={`w-full flex items-center gap-2.5 text-left py-2 px-2.5 rounded-md text-[13px] transition-colors ${
                    isRouteActive('inst-timetable') ? 'text-white font-medium bg-[#1e2f54]' : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <Clock className="w-3.5 h-3.5 opacity-80 text-amber-400 shrink-0" />
                  <span className="truncate">Class Timetable</span>
                </button>
                <button
                  onClick={() => handleNavClick('inst-attendance')}
                  className={`w-full flex items-center gap-2.5 text-left py-2 px-2.5 rounded-md text-[13px] transition-colors ${
                    isRouteActive('inst-attendance') ? 'text-white font-medium bg-[#1e2f54]' : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <CalendarCheck className="w-3.5 h-3.5 opacity-80 text-emerald-400 shrink-0" />
                  <span className="truncate">Daily Attendance</span>
                </button>
                <button
                  onClick={() => handleNavClick('inst-exams')}
                  className={`w-full flex items-center gap-2.5 text-left py-2 px-2.5 rounded-md text-[13px] transition-colors ${
                    isRouteActive('inst-exams') ? 'text-white font-medium bg-[#1e2f54]' : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <Award className="w-3.5 h-3.5 opacity-80 text-rose-400 shrink-0" />
                  <span className="truncate">Examinations & Marks</span>
                </button>
                <button
                  onClick={() => handleNavClick('inst-subjects')}
                  className={`w-full flex items-center gap-2.5 text-left py-2 px-2.5 rounded-md text-[13px] transition-colors ${
                    isRouteActive('inst-subjects') ? 'text-white font-medium bg-[#1e2f54]' : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <Bookmark className="w-3.5 h-3.5 opacity-80 text-blue-400 shrink-0" />
                  <span className="truncate">Curriculum & Subjects</span>
                </button>
                <button
                  onClick={() => handleNavClick('inst-notices')}
                  className={`w-full flex items-center gap-2.5 text-left py-2 px-2.5 rounded-md text-[13px] transition-colors ${
                    isRouteActive('inst-notices') ? 'text-white font-medium bg-[#1e2f54]' : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <Megaphone className="w-3.5 h-3.5 opacity-80 text-purple-400 shrink-0" />
                  <span className="truncate">Campus Notice Board</span>
                </button>
                <button
                  onClick={() => handleNavClick('inst-program-levels')}
                  title="Academic Program Levels"
                  className={`w-full flex items-center gap-2.5 text-left py-2 px-2.5 rounded-md text-[13px] transition-colors ${
                    isRouteActive('inst-program-levels') ? 'text-white font-medium bg-[#1e2f54]' : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <GraduationCap className="w-3.5 h-3.5 opacity-80 text-blue-400 shrink-0" />
                  <span className="truncate" title="Academic Program Levels">Program Levels</span>
                </button>
              </div>
            )}
          </div>

          {/* Group 3: Services & Finance */}
          <div>
            <button
              onClick={() => {
                if (collapsed) setCollapsed(false)
                setServicesOpen(!servicesOpen)
              }}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-lg transition-colors ${
                isServicesRoute 
                  ? 'text-white bg-[#1a2744]/70 font-medium' 
                  : 'text-slate-300 hover:text-white hover:bg-[#1a2744]'
              }`}
            >
              <div className="flex items-center gap-3">
                <Receipt className={`w-[18px] h-[18px] shrink-0 ${isServicesRoute ? 'text-emerald-400' : 'text-slate-400'}`} />
                {(!collapsed || isMobileOpen) && <span>Services & Accounts</span>}
              </div>
              {(!collapsed || isMobileOpen) && (
                servicesOpen ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />
              )}
            </button>

            {(!collapsed || isMobileOpen) && servicesOpen && (
              <div className="mt-1 pl-4 pr-1 space-y-0.5 border-l border-[#24365c] ml-5">
                <button
                  onClick={() => handleNavClick('inst-fees')}
                  className={`w-full flex items-center gap-2.5 text-left py-2 px-2.5 rounded-md text-[13px] transition-colors ${
                    isRouteActive('inst-fees') ? 'text-white font-medium bg-[#1e2f54]' : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <Receipt className="w-3.5 h-3.5 opacity-80 text-emerald-400 shrink-0" />
                  <span className="truncate">Fee Management</span>
                </button>
                <button
                  onClick={() => handleNavClick('inst-transport')}
                  className={`w-full flex items-center gap-2.5 text-left py-2 px-2.5 rounded-md text-[13px] transition-colors ${
                    isRouteActive('inst-transport') ? 'text-white font-medium bg-[#1e2f54]' : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <Bus className="w-3.5 h-3.5 opacity-80 text-amber-400 shrink-0" />
                  <span className="truncate">Transport & Vans</span>
                </button>
                <button
                  onClick={() => handleNavClick('inst-library')}
                  className={`w-full flex items-center gap-2.5 text-left py-2 px-2.5 rounded-md text-[13px] transition-colors ${
                    isRouteActive('inst-library') ? 'text-white font-medium bg-[#1e2f54]' : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <BookMarked className="w-3.5 h-3.5 opacity-80 text-indigo-400 shrink-0" />
                  <span className="truncate">Library & Books</span>
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Clean Sign Out Footer (Active Mode Box Removed!) */}
        <div className="p-3 border-t border-[#1e2d4d] bg-[#0c1526]">
          <button
            onClick={logout}
            className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition-colors text-xs font-semibold"
          >
            <LogOut className="w-4 h-4 shrink-0" />
            {(!collapsed || isMobileOpen) && <span>Sign Out</span>}
          </button>
        </div>
      </aside>
    </>
  )
}

export default InstituteAdminSidebar
