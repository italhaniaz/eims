import React, { useState, useEffect } from 'react'
import { 
  LayoutDashboard, 
  GraduationCap, 
  Users, 
  BookOpen, 
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
  Building2, 
  Building,
  X, 
  UserCheck, 
  Bus, 
  BookMarked, 
  FileBadge, 
  Laptop, 
  Boxes, 
  Calendar, 
  BarChart3, 
  ShieldCheck, 
  ShieldAlert,
  Settings, 
  CreditCard, 
  Calculator,
  Sparkles,
  FileCheck,
  FlaskConical
} from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import { getInstituteTierConfig } from '../../utils/tierGating'

export const InstituteAdminSidebar = ({ 
  currentRoute, 
  onRouteChange, 
  currentInstitute,
  instituteName,
  isMobileOpen = false,
  onCloseMobile = () => {}
}) => {
  const { user, logout } = useAuth()
  const [collapsed, setCollapsed] = useState(false)

  // Granular Role-Based Scopes & Tier Gating
  const tierConfig = getInstituteTierConfig(currentInstitute)
  const isCollege = tierConfig.isCollegeOnly
  const userRole = user?.role || 'institute_admin'
  const isTeacher = userRole === 'teacher'
  const isAccountant = userRole === 'accountant'
  const isCampusAdmin = !isTeacher && !isAccountant

  // Route active state check
  const isRouteActive = (route) => currentRoute === route

  // Accordion active groups
  const isFacultyRoute = ['inst-teachers', 'inst-payroll'].includes(currentRoute)
  const isAcademicsRoute = ['inst-classes', 'inst-subjects', 'inst-timetable', 'inst-program-levels'].includes(currentRoute)
  const isFinanceRoute = ['inst-fees', 'inst-accounts'].includes(currentRoute)
  const isServicesRoute = isCollege 
    ? ['inst-hostel', 'inst-transport', 'inst-library', 'inst-labs'].includes(currentRoute)
    : ['inst-transport', 'inst-library', 'inst-inventory'].includes(currentRoute)
  const isUsersRoute = ['inst-users', 'inst-settings'].includes(currentRoute)

  const [facultyOpen, setFacultyOpen] = useState(isFacultyRoute)
  const [academicsOpen, setAcademicsOpen] = useState(isAcademicsRoute)
  const [financeOpen, setFinanceOpen] = useState(isFinanceRoute)
  const [servicesOpen, setServicesOpen] = useState(isServicesRoute)
  const [usersOpen, setUsersOpen] = useState(isUsersRoute)

  useEffect(() => {
    if (isFacultyRoute) setFacultyOpen(true)
    if (isAcademicsRoute) setAcademicsOpen(true)
    if (isFinanceRoute) setFinanceOpen(true)
    if (isServicesRoute) setServicesOpen(true)
    if (isUsersRoute) setUsersOpen(true)
  }, [currentRoute, isFacultyRoute, isAcademicsRoute, isFinanceRoute, isServicesRoute, isUsersRoute])

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
          className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-40 lg:hidden"
        />
      )}

      <aside 
        className={`
          fixed lg:static top-0 bottom-0 left-0 z-50
          ${isMobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
          ${collapsed ? 'lg:w-20' : 'w-64'} 
          h-full max-h-screen bg-white text-slate-700 flex flex-col 
          transition-all duration-300 shrink-0 border-r border-slate-100 shadow-[1px_0_15px_rgba(0,0,0,0.02)] select-none
        `}
      >
        {/* Top Header */}
        <div className="h-16 sm:h-20 min-h-[64px] sm:min-h-[80px] flex items-center justify-between px-4 sm:px-5 border-b border-slate-100 shrink-0">
          {(!collapsed || isMobileOpen) && (
            <div className="flex items-center gap-2.5 overflow-hidden">
              <div className="w-9 h-9 rounded-xl bg-[#f5eeff] text-purple-700 border border-purple-100 flex items-center justify-center shrink-0 font-bold text-xs shadow-2xs">
                {isCollege ? (
                  <Building2 className="w-4 h-4 text-purple-600" />
                ) : tierConfig.isUniversityOnly ? (
                  <GraduationCap className="w-4 h-4 text-purple-600" />
                ) : (
                  <School className="w-4 h-4 text-purple-600" />
                )}
              </div>
              <div className="flex flex-col truncate">
                <span className="text-sm font-extrabold text-slate-900 tracking-tight font-heading truncate">
                  {instituteName || (isCollege ? 'College Administration' : 'Campus Administration')}
                </span>
                <span className="text-[10px] text-purple-600 font-bold uppercase tracking-wider">
                  {user?.roleTitle || (isTeacher ? 'Faculty Portal' : isAccountant ? 'Accounts Officer' : isCollege ? 'College Principal' : 'School Principal')}
                </span>
              </div>
            </div>
          )}

          {/* Mobile Close Button */}
          <button 
            onClick={onCloseMobile}
            className="lg:hidden text-slate-400 hover:text-slate-700 p-1.5 rounded-lg hover:bg-slate-100 transition-colors ml-auto cursor-pointer"
            title="Close Menu"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Desktop Collapse Button */}
          <button 
            onClick={() => setCollapsed(!collapsed)}
            className="hidden lg:block text-slate-400 hover:text-slate-700 p-1.5 rounded-lg hover:bg-slate-100 transition-colors ml-auto cursor-pointer"
            title={collapsed ? "Expand Sidebar" : "Collapse Sidebar"}
          >
            {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
          </button>
        </div>

        {/* Navigation Menu */}
        <div className="flex-1 py-3 px-3 space-y-1 overflow-y-auto dark-scroll text-[13.5px]">

          {/* 1. Campus Dashboard (Both) */}
          <div className="relative">
            {isRouteActive('inst-dashboard') && (
              <div className="absolute left-0 top-1.5 bottom-1.5 w-1 bg-purple-600 rounded-full z-10"></div>
            )}
            <button
              onClick={() => handleNavClick('inst-dashboard')}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl transition-all text-left cursor-pointer group ${
                isRouteActive('inst-dashboard')
                  ? 'bg-[#f5eeff] text-purple-700 font-semibold shadow-2xs'
                  : 'text-slate-500 hover:text-slate-900 hover:bg-slate-50/80'
              }`}
            >
              <LayoutDashboard className={`w-[18px] h-[18px] shrink-0 transition-colors ${
                isRouteActive('inst-dashboard') ? 'text-purple-600' : 'text-slate-400 group-hover:text-purple-600'
              }`} />
              {(!collapsed || isMobileOpen) && <span>Campus Dashboard</span>}
            </button>
          </div>

          {/* Section Divider */}
          {(!collapsed || isMobileOpen) && (
            <div className="pt-2.5 pb-1 px-3 text-[10px] font-bold uppercase tracking-wider text-slate-400">
              <span>{isCollege ? 'College Operational Modules' : 'Operational Modules'}</span>
            </div>
          )}

          {/* ========================================================= */}
          {/* ================= COLLEGE ADMIN: 18 MODULES ============= */}
          {/* ========================================================= */}
          {isCollege ? (
            <>
              {/* 2. Admissions & Merit */}
              {isCampusAdmin && (
                <div className="relative">
                  {isRouteActive('inst-admissions') && (
                    <div className="absolute left-0 top-1.5 bottom-1.5 w-1 bg-purple-600 rounded-full z-10"></div>
                  )}
                  <button
                    onClick={() => handleNavClick('inst-admissions')}
                    className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl transition-all text-left cursor-pointer group ${
                      isRouteActive('inst-admissions')
                        ? 'bg-[#f5eeff] text-purple-700 font-semibold shadow-2xs'
                        : 'text-slate-500 hover:text-slate-900 hover:bg-slate-50/80'
                    }`}
                  >
                    <UserCheck className={`w-[18px] h-[18px] shrink-0 transition-colors ${
                      isRouteActive('inst-admissions') ? 'text-purple-600' : 'text-slate-400 group-hover:text-purple-600'
                    }`} />
                    {(!collapsed || isMobileOpen) && <span>Admissions & Merit</span>}
                  </button>
                </div>
              )}

              {/* 3. Students Directory */}
              {(!isAccountant || isCampusAdmin) && (
                <div className="relative">
                  {isRouteActive('inst-students') && (
                    <div className="absolute left-0 top-1.5 bottom-1.5 w-1 bg-purple-600 rounded-full z-10"></div>
                  )}
                  <button
                    onClick={() => handleNavClick('inst-students')}
                    className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl transition-all text-left cursor-pointer group ${
                      isRouteActive('inst-students')
                        ? 'bg-[#f5eeff] text-purple-700 font-semibold shadow-2xs'
                        : 'text-slate-500 hover:text-slate-900 hover:bg-slate-50/80'
                    }`}
                  >
                    <GraduationCap className={`w-[18px] h-[18px] shrink-0 transition-colors ${
                      isRouteActive('inst-students') ? 'text-purple-600' : 'text-slate-400 group-hover:text-purple-600'
                    }`} />
                    {(!collapsed || isMobileOpen) && <span>Students Directory</span>}
                  </button>
                </div>
              )}

              {/* 4. Faculty & Staff (Payroll ke sath) */}
              {isCampusAdmin && (
                <div>
                  <button
                    onClick={() => {
                      if (collapsed) setCollapsed(false)
                      setFacultyOpen(!facultyOpen)
                    }}
                    className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl transition-colors cursor-pointer group ${
                      isFacultyRoute 
                        ? 'text-purple-700 bg-[#f5eeff]/50 font-semibold' 
                        : 'text-slate-500 hover:text-slate-800 hover:bg-slate-50/80'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <Users className={`w-[18px] h-[18px] shrink-0 transition-colors ${
                        isFacultyRoute ? 'text-purple-600' : 'text-slate-400 group-hover:text-purple-600'
                      }`} />
                      {(!collapsed || isMobileOpen) && (
                        <div className="flex items-center gap-1.5">
                          <span>Faculty & Staff</span>
                          <span className="text-[10px] bg-purple-100 text-purple-700 font-bold px-1.5 py-0.2 rounded-md">
                            Payroll
                          </span>
                        </div>
                      )}
                    </div>
                    {(!collapsed || isMobileOpen) && (
                      facultyOpen ? <ChevronUp className="w-3.5 h-3.5 text-slate-400" /> : <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
                    )}
                  </button>

                  {(!collapsed || isMobileOpen) && facultyOpen && (
                    <div className="mt-1 pl-3.5 space-y-1 border-l-2 border-slate-100 ml-5">
                      {[
                        { route: 'inst-teachers', label: 'Faculty & Staff Roster', icon: Users },
                        { route: 'inst-payroll', label: 'Payroll & Compensation', icon: CreditCard }
                      ].map(item => {
                        const ItemIcon = item.icon
                        const active = isRouteActive(item.route)
                        return (
                          <div key={item.route} className="relative">
                            {active && (
                              <div className="absolute -left-[16px] top-1.5 bottom-1.5 w-1 bg-purple-600 rounded-full z-10"></div>
                            )}
                            <button
                              onClick={() => handleNavClick(item.route)}
                              className={`w-full flex items-center gap-2.5 text-left py-2 px-2.5 rounded-lg text-[13px] transition-all cursor-pointer ${
                                active
                                  ? 'bg-[#f5eeff] text-purple-700 font-semibold'
                                  : 'text-slate-500 hover:text-slate-900 hover:bg-slate-50'
                              }`}
                            >
                              <ItemIcon className={`w-3.5 h-3.5 shrink-0 ${active ? 'text-purple-600' : 'text-slate-400'}`} />
                              <span className="truncate">{item.label}</span>
                            </button>
                          </div>
                        )
                      })}
                    </div>
                  )}
                </div>
              )}

              {/* 5. Academics (Programs, Groups, Subjects, Timetable) */}
              {!isAccountant && (
                <div>
                  <button
                    onClick={() => {
                      if (collapsed) setCollapsed(false)
                      setAcademicsOpen(!academicsOpen)
                    }}
                    className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl transition-colors cursor-pointer group ${
                      isAcademicsRoute 
                        ? 'text-purple-700 bg-[#f5eeff]/50 font-semibold' 
                        : 'text-slate-500 hover:text-slate-800 hover:bg-slate-50/80'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <BookOpen className={`w-[18px] h-[18px] shrink-0 transition-colors ${
                        isAcademicsRoute ? 'text-purple-600' : 'text-slate-400 group-hover:text-purple-600'
                      }`} />
                      {(!collapsed || isMobileOpen) && <span>Academics</span>}
                    </div>
                    {(!collapsed || isMobileOpen) && (
                      academicsOpen ? <ChevronUp className="w-3.5 h-3.5 text-slate-400" /> : <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
                    )}
                  </button>

                  {(!collapsed || isMobileOpen) && academicsOpen && (
                    <div className="mt-1 pl-3.5 space-y-1 border-l-2 border-slate-100 ml-5">
                      {[
                        { route: 'inst-program-levels', label: 'Programs & Disciplines', icon: GraduationCap },
                        { route: 'inst-classes', label: 'College Sections & Groups', icon: BookOpen },
                        { route: 'inst-subjects', label: 'Curriculum & Course Subjects', icon: BookMarked },
                        { route: 'inst-timetable', label: 'College Timetable Schedule', icon: Clock }
                      ].map(item => {
                        const ItemIcon = item.icon
                        const active = isRouteActive(item.route)
                        return (
                          <div key={item.route} className="relative">
                            {active && (
                              <div className="absolute -left-[16px] top-1.5 bottom-1.5 w-1 bg-purple-600 rounded-full z-10"></div>
                            )}
                            <button
                              onClick={() => handleNavClick(item.route)}
                              className={`w-full flex items-center gap-2.5 text-left py-2 px-2.5 rounded-lg text-[13px] transition-all cursor-pointer ${
                                active
                                  ? 'bg-[#f5eeff] text-purple-700 font-semibold'
                                  : 'text-slate-500 hover:text-slate-900 hover:bg-slate-50'
                              }`}
                            >
                              <ItemIcon className={`w-3.5 h-3.5 shrink-0 ${active ? 'text-purple-600' : 'text-slate-400'}`} />
                              <span className="truncate">{item.label}</span>
                            </button>
                          </div>
                        )
                      })}
                    </div>
                  )}
                </div>
              )}

              {/* 6. Attendance Register */}
              {!isAccountant && (
                <div className="relative">
                  {isRouteActive('inst-attendance') && (
                    <div className="absolute left-0 top-1.5 bottom-1.5 w-1 bg-purple-600 rounded-full z-10"></div>
                  )}
                  <button
                    onClick={() => handleNavClick('inst-attendance')}
                    className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl transition-all text-left cursor-pointer group ${
                      isRouteActive('inst-attendance')
                        ? 'bg-[#f5eeff] text-purple-700 font-semibold shadow-2xs'
                        : 'text-slate-500 hover:text-slate-900 hover:bg-slate-50/80'
                    }`}
                  >
                    <CalendarCheck className={`w-[18px] h-[18px] shrink-0 transition-colors ${
                      isRouteActive('inst-attendance') ? 'text-purple-600' : 'text-slate-400 group-hover:text-purple-600'
                    }`} />
                    {(!collapsed || isMobileOpen) && <span>Attendance Register</span>}
                  </button>
                </div>
              )}

              {/* 7. Examinations & Results (Internal) */}
              {!isAccountant && (
                <div className="relative">
                  {isRouteActive('inst-exams') && (
                    <div className="absolute left-0 top-1.5 bottom-1.5 w-1 bg-purple-600 rounded-full z-10"></div>
                  )}
                  <button
                    onClick={() => handleNavClick('inst-exams')}
                    className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl transition-all text-left cursor-pointer group ${
                      isRouteActive('inst-exams')
                        ? 'bg-[#f5eeff] text-purple-700 font-semibold shadow-2xs'
                        : 'text-slate-500 hover:text-slate-900 hover:bg-slate-50/80'
                    }`}
                  >
                    <Award className={`w-[18px] h-[18px] shrink-0 transition-colors ${
                      isRouteActive('inst-exams') ? 'text-purple-600' : 'text-slate-400 group-hover:text-purple-600'
                    }`} />
                    {(!collapsed || isMobileOpen) && <span>Examinations & Results (Internal)</span>}
                  </button>
                </div>
              )}

              {/* 8. Board Registration & Exams */}
              {!isAccountant && (
                <div className="relative">
                  {isRouteActive('inst-board-exams') && (
                    <div className="absolute left-0 top-1.5 bottom-1.5 w-1 bg-purple-600 rounded-full z-10"></div>
                  )}
                  <button
                    onClick={() => handleNavClick('inst-board-exams')}
                    className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl transition-all text-left cursor-pointer group ${
                      isRouteActive('inst-board-exams')
                        ? 'bg-[#f5eeff] text-purple-700 font-semibold shadow-2xs'
                        : 'text-slate-500 hover:text-slate-900 hover:bg-slate-50/80'
                    }`}
                  >
                    <FileCheck className={`w-[18px] h-[18px] shrink-0 transition-colors ${
                      isRouteActive('inst-board-exams') ? 'text-purple-600' : 'text-slate-400 group-hover:text-purple-600'
                    }`} />
                    {(!collapsed || isMobileOpen) && <span>Board Registration & Exams</span>}
                  </button>
                </div>
              )}

              {/* 9. Fees & Finance (Accounts ke sath) */}
              {!isTeacher && (
                <div>
                  <button
                    onClick={() => {
                      if (collapsed) setCollapsed(false)
                      setFinanceOpen(!financeOpen)
                    }}
                    className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl transition-colors cursor-pointer group ${
                      isFinanceRoute 
                        ? 'text-purple-700 bg-[#f5eeff]/50 font-semibold' 
                        : 'text-slate-500 hover:text-slate-800 hover:bg-slate-50/80'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <Receipt className={`w-[18px] h-[18px] shrink-0 transition-colors ${
                        isFinanceRoute ? 'text-purple-600' : 'text-slate-400 group-hover:text-purple-600'
                      }`} />
                      {(!collapsed || isMobileOpen) && (
                        <div className="flex items-center gap-1.5">
                          <span>Fees & Finance</span>
                          <span className="text-[10px] bg-purple-100 text-purple-700 font-bold px-1.5 py-0.2 rounded-md">
                            Accounts
                          </span>
                        </div>
                      )}
                    </div>
                    {(!collapsed || isMobileOpen) && (
                      financeOpen ? <ChevronUp className="w-3.5 h-3.5 text-slate-400" /> : <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
                    )}
                  </button>

                  {(!collapsed || isMobileOpen) && financeOpen && (
                    <div className="mt-1 pl-3.5 space-y-1 border-l-2 border-slate-100 ml-5">
                      {[
                        { route: 'inst-fees', label: 'Fee Invoices & Challans', icon: Receipt },
                        { route: 'inst-accounts', label: 'College Accounts & Ledger', icon: Calculator }
                      ].map(item => {
                        const ItemIcon = item.icon
                        const active = isRouteActive(item.route)
                        return (
                          <div key={item.route} className="relative">
                            {active && (
                              <div className="absolute -left-[16px] top-1.5 bottom-1.5 w-1 bg-purple-600 rounded-full z-10"></div>
                            )}
                            <button
                              onClick={() => handleNavClick(item.route)}
                              className={`w-full flex items-center gap-2.5 text-left py-2 px-2.5 rounded-lg text-[13px] transition-all cursor-pointer ${
                                active
                                  ? 'bg-[#f5eeff] text-purple-700 font-semibold'
                                  : 'text-slate-500 hover:text-slate-900 hover:bg-slate-50'
                              }`}
                            >
                              <ItemIcon className={`w-3.5 h-3.5 shrink-0 ${active ? 'text-purple-600' : 'text-slate-400'}`} />
                              <span className="truncate">{item.label}</span>
                            </button>
                          </div>
                        )
                      })}
                    </div>
                  )}
                </div>
              )}

              {/* 10. Scholarships */}
              {!isTeacher && (
                <div className="relative">
                  {isRouteActive('inst-scholarships') && (
                    <div className="absolute left-0 top-1.5 bottom-1.5 w-1 bg-purple-600 rounded-full z-10"></div>
                  )}
                  <button
                    onClick={() => handleNavClick('inst-scholarships')}
                    className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl transition-all text-left cursor-pointer group ${
                      isRouteActive('inst-scholarships')
                        ? 'bg-[#f5eeff] text-purple-700 font-semibold shadow-2xs'
                        : 'text-slate-500 hover:text-slate-900 hover:bg-slate-50/80'
                    }`}
                  >
                    <Sparkles className={`w-[18px] h-[18px] shrink-0 transition-colors ${
                      isRouteActive('inst-scholarships') ? 'text-purple-600' : 'text-slate-400 group-hover:text-purple-600'
                    }`} />
                    {(!collapsed || isMobileOpen) && <span>Scholarships</span>}
                  </button>
                </div>
              )}

              {/* 11. Certificates (Provisional, Migration, CLC, DMC) */}
              {!isAccountant && (
                <div className="relative">
                  {isRouteActive('inst-certificates') && (
                    <div className="absolute left-0 top-1.5 bottom-1.5 w-1 bg-purple-600 rounded-full z-10"></div>
                  )}
                  <button
                    onClick={() => handleNavClick('inst-certificates')}
                    className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl transition-all text-left cursor-pointer group ${
                      isRouteActive('inst-certificates')
                        ? 'bg-[#f5eeff] text-purple-700 font-semibold shadow-2xs'
                        : 'text-slate-500 hover:text-slate-900 hover:bg-slate-50/80'
                    }`}
                  >
                    <FileBadge className={`w-[18px] h-[18px] shrink-0 transition-colors ${
                      isRouteActive('inst-certificates') ? 'text-purple-600' : 'text-slate-400 group-hover:text-purple-600'
                    }`} />
                    {(!collapsed || isMobileOpen) && <span>Certificates (Provisional, Migration, CLC, DMC)</span>}
                  </button>
                </div>
              )}

              {/* 12. Communication & Notices */}
              <div className="relative">
                {isRouteActive('inst-notices') && (
                  <div className="absolute left-0 top-1.5 bottom-1.5 w-1 bg-purple-600 rounded-full z-10"></div>
                )}
                <button
                  onClick={() => handleNavClick('inst-notices')}
                  className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl transition-all text-left cursor-pointer group ${
                    isRouteActive('inst-notices')
                      ? 'bg-[#f5eeff] text-purple-700 font-semibold shadow-2xs'
                      : 'text-slate-500 hover:text-slate-900 hover:bg-slate-50/80'
                  }`}
                >
                  <Megaphone className={`w-[18px] h-[18px] shrink-0 transition-colors ${
                    isRouteActive('inst-notices') ? 'text-purple-600' : 'text-slate-400 group-hover:text-purple-600'
                  }`} />
                  {(!collapsed || isMobileOpen) && <span>Communication & Notices</span>}
                </button>
              </div>

              {/* 13. Student Affairs & Discipline */}
              {!isAccountant && (
                <div className="relative">
                  {isRouteActive('inst-discipline') && (
                    <div className="absolute left-0 top-1.5 bottom-1.5 w-1 bg-purple-600 rounded-full z-10"></div>
                  )}
                  <button
                    onClick={() => handleNavClick('inst-discipline')}
                    className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl transition-all text-left cursor-pointer group ${
                      isRouteActive('inst-discipline')
                        ? 'bg-[#f5eeff] text-purple-700 font-semibold shadow-2xs'
                        : 'text-slate-500 hover:text-slate-900 hover:bg-slate-50/80'
                    }`}
                  >
                    <ShieldAlert className={`w-[18px] h-[18px] shrink-0 transition-colors ${
                      isRouteActive('inst-discipline') ? 'text-purple-600' : 'text-slate-400 group-hover:text-purple-600'
                    }`} />
                    {(!collapsed || isMobileOpen) && <span>Student Affairs & Discipline</span>}
                  </button>
                </div>
              )}

              {/* 14. Campus Services (Hostel, Transport, Library, Labs) */}
              {!isAccountant && (
                <div>
                  <button
                    onClick={() => {
                      if (collapsed) setCollapsed(false)
                      setServicesOpen(!servicesOpen)
                    }}
                    className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl transition-colors cursor-pointer group ${
                      isServicesRoute 
                        ? 'text-purple-700 bg-[#f5eeff]/50 font-semibold' 
                        : 'text-slate-500 hover:text-slate-800 hover:bg-slate-50/80'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <Building2 className={`w-[18px] h-[18px] shrink-0 transition-colors ${
                        isServicesRoute ? 'text-purple-600' : 'text-slate-400 group-hover:text-purple-600'
                      }`} />
                      {(!collapsed || isMobileOpen) && <span>Campus Services</span>}
                    </div>
                    {(!collapsed || isMobileOpen) && (
                      servicesOpen ? <ChevronUp className="w-3.5 h-3.5 text-slate-400" /> : <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
                    )}
                  </button>

                  {(!collapsed || isMobileOpen) && servicesOpen && (
                    <div className="mt-1 pl-3.5 space-y-1 border-l-2 border-slate-100 ml-5">
                      {[
                        { route: 'inst-hostel', label: 'Hostel & Boarding', icon: Building },
                        { route: 'inst-transport', label: 'College Transport', icon: Bus },
                        { route: 'inst-library', label: 'College Library', icon: BookMarked },
                        { route: 'inst-labs', label: 'Science & Computer Labs', icon: FlaskConical }
                      ].map(item => {
                        const ItemIcon = item.icon
                        const active = isRouteActive(item.route)
                        return (
                          <div key={item.route} className="relative">
                            {active && (
                              <div className="absolute -left-[16px] top-1.5 bottom-1.5 w-1 bg-purple-600 rounded-full z-10"></div>
                            )}
                            <button
                              onClick={() => handleNavClick(item.route)}
                              className={`w-full flex items-center gap-2.5 text-left py-2 px-2.5 rounded-lg text-[13px] transition-all cursor-pointer ${
                                active
                                  ? 'bg-[#f5eeff] text-purple-700 font-semibold'
                                  : 'text-slate-500 hover:text-slate-900 hover:bg-slate-50'
                              }`}
                            >
                              <ItemIcon className={`w-3.5 h-3.5 shrink-0 ${active ? 'text-purple-600' : 'text-slate-400'}`} />
                              <span className="truncate">{item.label}</span>
                            </button>
                          </div>
                        )
                      })}
                    </div>
                  )}
                </div>
              )}

              {/* 15. Learning & Resources */}
              <div className="relative">
                {isRouteActive('inst-learning') && (
                  <div className="absolute left-0 top-1.5 bottom-1.5 w-1 bg-purple-600 rounded-full z-10"></div>
                )}
                <button
                  onClick={() => handleNavClick('inst-learning')}
                  className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl transition-all text-left cursor-pointer group ${
                    isRouteActive('inst-learning')
                      ? 'bg-[#f5eeff] text-purple-700 font-semibold shadow-2xs'
                      : 'text-slate-500 hover:text-slate-900 hover:bg-slate-50/80'
                  }`}
                >
                  <Laptop className={`w-[18px] h-[18px] shrink-0 transition-colors ${
                    isRouteActive('inst-learning') ? 'text-purple-600' : 'text-slate-400 group-hover:text-purple-600'
                  }`} />
                  {(!collapsed || isMobileOpen) && <span>Learning & Resources</span>}
                </button>
              </div>

              {/* 16. Events & Calendar */}
              <div className="relative">
                {isRouteActive('inst-events') && (
                  <div className="absolute left-0 top-1.5 bottom-1.5 w-1 bg-purple-600 rounded-full z-10"></div>
                )}
                <button
                  onClick={() => handleNavClick('inst-events')}
                  className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl transition-all text-left cursor-pointer group ${
                    isRouteActive('inst-events')
                      ? 'bg-[#f5eeff] text-purple-700 font-semibold shadow-2xs'
                      : 'text-slate-500 hover:text-slate-900 hover:bg-slate-50/80'
                  }`}
                >
                  <Calendar className={`w-[18px] h-[18px] shrink-0 transition-colors ${
                    isRouteActive('inst-events') ? 'text-purple-600' : 'text-slate-400 group-hover:text-purple-600'
                  }`} />
                  {(!collapsed || isMobileOpen) && <span>Events & Calendar</span>}
                </button>
              </div>

              {/* 17. Reports & Analytics */}
              <div className="relative">
                {isRouteActive('inst-reports') && (
                  <div className="absolute left-0 top-1.5 bottom-1.5 w-1 bg-purple-600 rounded-full z-10"></div>
                )}
                <button
                  onClick={() => handleNavClick('inst-reports')}
                  className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl transition-all text-left cursor-pointer group ${
                    isRouteActive('inst-reports')
                      ? 'bg-[#f5eeff] text-purple-700 font-semibold shadow-2xs'
                      : 'text-slate-500 hover:text-slate-900 hover:bg-slate-50/80'
                  }`}
                >
                  <BarChart3 className={`w-[18px] h-[18px] shrink-0 transition-colors ${
                    isRouteActive('inst-reports') ? 'text-purple-600' : 'text-slate-400 group-hover:text-purple-600'
                  }`} />
                  {(!collapsed || isMobileOpen) && <span>Reports & Analytics</span>}
                </button>
              </div>

              {/* 18. Users, Roles & Settings */}
              {isCampusAdmin && (
                <div>
                  <button
                    onClick={() => {
                      if (collapsed) setCollapsed(false)
                      setUsersOpen(!usersOpen)
                    }}
                    className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl transition-colors cursor-pointer group ${
                      isUsersRoute 
                        ? 'text-purple-700 bg-[#f5eeff]/50 font-semibold' 
                        : 'text-slate-500 hover:text-slate-800 hover:bg-slate-50/80'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <ShieldCheck className={`w-[18px] h-[18px] shrink-0 transition-colors ${
                        isUsersRoute ? 'text-purple-600' : 'text-slate-400 group-hover:text-purple-600'
                      }`} />
                      {(!collapsed || isMobileOpen) && <span>Users, Roles & Settings</span>}
                    </div>
                    {(!collapsed || isMobileOpen) && (
                      usersOpen ? <ChevronUp className="w-3.5 h-3.5 text-slate-400" /> : <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
                    )}
                  </button>

                  {(!collapsed || isMobileOpen) && usersOpen && (
                    <div className="mt-1 pl-3.5 space-y-1 border-l-2 border-slate-100 ml-5">
                      {[
                        { route: 'inst-users', label: 'User Logins & Roles', icon: ShieldCheck },
                        { route: 'inst-settings', label: 'College System Settings', icon: Settings }
                      ].map(item => {
                        const ItemIcon = item.icon
                        const active = isRouteActive(item.route)
                        return (
                          <div key={item.route} className="relative">
                            {active && (
                              <div className="absolute -left-[16px] top-1.5 bottom-1.5 w-1 bg-purple-600 rounded-full z-10"></div>
                            )}
                            <button
                              onClick={() => handleNavClick(item.route)}
                              className={`w-full flex items-center gap-2.5 text-left py-2 px-2.5 rounded-lg text-[13px] transition-all cursor-pointer ${
                                active
                                  ? 'bg-[#f5eeff] text-purple-700 font-semibold'
                                  : 'text-slate-500 hover:text-slate-900 hover:bg-slate-50'
                              }`}
                            >
                              <ItemIcon className={`w-3.5 h-3.5 shrink-0 ${active ? 'text-purple-600' : 'text-slate-400'}`} />
                              <span className="truncate">{item.label}</span>
                            </button>
                          </div>
                        )
                      })}
                    </div>
                  )}
                </div>
              )}
            </>
          ) : (
            /* ========================================================= */
            /* ================= SCHOOL ADMIN: 15 MODULES ============== */
            /* ========================================================= */
            <>
              {/* 2. Admissions & Leads */}
              {isCampusAdmin && (
                <div className="relative">
                  {isRouteActive('inst-admissions') && (
                    <div className="absolute left-0 top-1.5 bottom-1.5 w-1 bg-purple-600 rounded-full z-10"></div>
                  )}
                  <button
                    onClick={() => handleNavClick('inst-admissions')}
                    className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl transition-all text-left cursor-pointer group ${
                      isRouteActive('inst-admissions')
                        ? 'bg-[#f5eeff] text-purple-700 font-semibold shadow-2xs'
                        : 'text-slate-500 hover:text-slate-900 hover:bg-slate-50/80'
                    }`}
                  >
                    <UserCheck className={`w-[18px] h-[18px] shrink-0 transition-colors ${
                      isRouteActive('inst-admissions') ? 'text-purple-600' : 'text-slate-400 group-hover:text-purple-600'
                    }`} />
                    {(!collapsed || isMobileOpen) && <span>Admissions & Leads</span>}
                  </button>
                </div>
              )}

              {/* 3. Students Directory */}
              {(!isAccountant || isCampusAdmin) && (
                <div className="relative">
                  {isRouteActive('inst-students') && (
                    <div className="absolute left-0 top-1.5 bottom-1.5 w-1 bg-purple-600 rounded-full z-10"></div>
                  )}
                  <button
                    onClick={() => handleNavClick('inst-students')}
                    className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl transition-all text-left cursor-pointer group ${
                      isRouteActive('inst-students')
                        ? 'bg-[#f5eeff] text-purple-700 font-semibold shadow-2xs'
                        : 'text-slate-500 hover:text-slate-900 hover:bg-slate-50/80'
                    }`}
                  >
                    <GraduationCap className={`w-[18px] h-[18px] shrink-0 transition-colors ${
                      isRouteActive('inst-students') ? 'text-purple-600' : 'text-slate-400 group-hover:text-purple-600'
                    }`} />
                    {(!collapsed || isMobileOpen) && <span>Students Directory</span>}
                  </button>
                </div>
              )}

              {/* 4. Staff & Faculty (Payroll ke sath) */}
              {isCampusAdmin && (
                <div>
                  <button
                    onClick={() => {
                      if (collapsed) setCollapsed(false)
                      setFacultyOpen(!facultyOpen)
                    }}
                    className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl transition-colors cursor-pointer group ${
                      isFacultyRoute 
                        ? 'text-purple-700 bg-[#f5eeff]/50 font-semibold' 
                        : 'text-slate-500 hover:text-slate-800 hover:bg-slate-50/80'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <Users className={`w-[18px] h-[18px] shrink-0 transition-colors ${
                        isFacultyRoute ? 'text-purple-600' : 'text-slate-400 group-hover:text-purple-600'
                      }`} />
                      {(!collapsed || isMobileOpen) && (
                        <div className="flex items-center gap-1.5">
                          <span>Staff & Faculty</span>
                          <span className="text-[10px] bg-purple-100 text-purple-700 font-bold px-1.5 py-0.2 rounded-md">
                            Payroll
                          </span>
                        </div>
                      )}
                    </div>
                    {(!collapsed || isMobileOpen) && (
                      facultyOpen ? <ChevronUp className="w-3.5 h-3.5 text-slate-400" /> : <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
                    )}
                  </button>

                  {(!collapsed || isMobileOpen) && facultyOpen && (
                    <div className="mt-1 pl-3.5 space-y-1 border-l-2 border-slate-100 ml-5">
                      {[
                        { route: 'inst-teachers', label: 'Faculty & Staff Roster', icon: Users },
                        { route: 'inst-payroll', label: 'Payroll & Compensation', icon: CreditCard }
                      ].map(item => {
                        const ItemIcon = item.icon
                        const active = isRouteActive(item.route)
                        return (
                          <div key={item.route} className="relative">
                            {active && (
                              <div className="absolute -left-[16px] top-1.5 bottom-1.5 w-1 bg-purple-600 rounded-full z-10"></div>
                            )}
                            <button
                              onClick={() => handleNavClick(item.route)}
                              className={`w-full flex items-center gap-2.5 text-left py-2 px-2.5 rounded-lg text-[13px] transition-all cursor-pointer ${
                                active
                                  ? 'bg-[#f5eeff] text-purple-700 font-semibold'
                                  : 'text-slate-500 hover:text-slate-900 hover:bg-slate-50'
                              }`}
                            >
                              <ItemIcon className={`w-3.5 h-3.5 shrink-0 ${active ? 'text-purple-600' : 'text-slate-400'}`} />
                              <span className="truncate">{item.label}</span>
                            </button>
                          </div>
                        )
                      })}
                    </div>
                  )}
                </div>
              )}

              {/* 5. Academics (Classes, Subjects, Timetable) */}
              {!isAccountant && (
                <div>
                  <button
                    onClick={() => {
                      if (collapsed) setCollapsed(false)
                      setAcademicsOpen(!academicsOpen)
                    }}
                    className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl transition-colors cursor-pointer group ${
                      isAcademicsRoute 
                        ? 'text-purple-700 bg-[#f5eeff]/50 font-semibold' 
                        : 'text-slate-500 hover:text-slate-800 hover:bg-slate-50/80'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <BookOpen className={`w-[18px] h-[18px] shrink-0 transition-colors ${
                        isAcademicsRoute ? 'text-purple-600' : 'text-slate-400 group-hover:text-purple-600'
                      }`} />
                      {(!collapsed || isMobileOpen) && <span>Academics</span>}
                    </div>
                    {(!collapsed || isMobileOpen) && (
                      academicsOpen ? <ChevronUp className="w-3.5 h-3.5 text-slate-400" /> : <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
                    )}
                  </button>

                  {(!collapsed || isMobileOpen) && academicsOpen && (
                    <div className="mt-1 pl-3.5 space-y-1 border-l-2 border-slate-100 ml-5">
                      {[
                        { route: 'inst-classes', label: 'Classes & Sections', icon: BookOpen },
                        { route: 'inst-subjects', label: 'Curriculum & Subjects', icon: BookMarked },
                        { route: 'inst-timetable', label: 'Class Timetable', icon: Clock }
                      ].map(item => {
                        const ItemIcon = item.icon
                        const active = isRouteActive(item.route)
                        return (
                          <div key={item.route} className="relative">
                            {active && (
                              <div className="absolute -left-[16px] top-1.5 bottom-1.5 w-1 bg-purple-600 rounded-full z-10"></div>
                            )}
                            <button
                              onClick={() => handleNavClick(item.route)}
                              className={`w-full flex items-center gap-2.5 text-left py-2 px-2.5 rounded-lg text-[13px] transition-all cursor-pointer ${
                                active
                                  ? 'bg-[#f5eeff] text-purple-700 font-semibold'
                                  : 'text-slate-500 hover:text-slate-900 hover:bg-slate-50'
                              }`}
                            >
                              <ItemIcon className={`w-3.5 h-3.5 shrink-0 ${active ? 'text-purple-600' : 'text-slate-400'}`} />
                              <span className="truncate">{item.label}</span>
                            </button>
                          </div>
                        )
                      })}
                    </div>
                  )}
                </div>
              )}

              {/* 6. Attendance Register */}
              {!isAccountant && (
                <div className="relative">
                  {isRouteActive('inst-attendance') && (
                    <div className="absolute left-0 top-1.5 bottom-1.5 w-1 bg-purple-600 rounded-full z-10"></div>
                  )}
                  <button
                    onClick={() => handleNavClick('inst-attendance')}
                    className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl transition-all text-left cursor-pointer group ${
                      isRouteActive('inst-attendance')
                        ? 'bg-[#f5eeff] text-purple-700 font-semibold shadow-2xs'
                        : 'text-slate-500 hover:text-slate-900 hover:bg-slate-50/80'
                    }`}
                  >
                    <CalendarCheck className={`w-[18px] h-[18px] shrink-0 transition-colors ${
                      isRouteActive('inst-attendance') ? 'text-purple-600' : 'text-slate-400 group-hover:text-purple-600'
                    }`} />
                    {(!collapsed || isMobileOpen) && <span>Attendance Register</span>}
                  </button>
                </div>
              )}

              {/* 7. Term Examinations & Marks */}
              {!isAccountant && (
                <div className="relative">
                  {isRouteActive('inst-exams') && (
                    <div className="absolute left-0 top-1.5 bottom-1.5 w-1 bg-purple-600 rounded-full z-10"></div>
                  )}
                  <button
                    onClick={() => handleNavClick('inst-exams')}
                    className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl transition-all text-left cursor-pointer group ${
                      isRouteActive('inst-exams')
                        ? 'bg-[#f5eeff] text-purple-700 font-semibold shadow-2xs'
                        : 'text-slate-500 hover:text-slate-900 hover:bg-slate-50/80'
                    }`}
                  >
                    <Award className={`w-[18px] h-[18px] shrink-0 transition-colors ${
                      isRouteActive('inst-exams') ? 'text-purple-600' : 'text-slate-400 group-hover:text-purple-600'
                    }`} />
                    {(!collapsed || isMobileOpen) && <span>Term Examinations & Marks</span>}
                  </button>
                </div>
              )}

              {/* 8. Fees & Finance (Accounts ke sath) */}
              {!isTeacher && (
                <div>
                  <button
                    onClick={() => {
                      if (collapsed) setCollapsed(false)
                      setFinanceOpen(!financeOpen)
                    }}
                    className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl transition-colors cursor-pointer group ${
                      isFinanceRoute 
                        ? 'text-purple-700 bg-[#f5eeff]/50 font-semibold' 
                        : 'text-slate-500 hover:text-slate-800 hover:bg-slate-50/80'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <Receipt className={`w-[18px] h-[18px] shrink-0 transition-colors ${
                        isFinanceRoute ? 'text-purple-600' : 'text-slate-400 group-hover:text-purple-600'
                      }`} />
                      {(!collapsed || isMobileOpen) && (
                        <div className="flex items-center gap-1.5">
                          <span>Fees & Finance</span>
                          <span className="text-[10px] bg-purple-100 text-purple-700 font-bold px-1.5 py-0.2 rounded-md">
                            Accounts
                          </span>
                        </div>
                      )}
                    </div>
                    {(!collapsed || isMobileOpen) && (
                      financeOpen ? <ChevronUp className="w-3.5 h-3.5 text-slate-400" /> : <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
                    )}
                  </button>

                  {(!collapsed || isMobileOpen) && financeOpen && (
                    <div className="mt-1 pl-3.5 space-y-1 border-l-2 border-slate-100 ml-5">
                      {[
                        { route: 'inst-fees', label: 'Fee Invoices & Challans', icon: Receipt },
                        { route: 'inst-accounts', label: 'Campus Accounts & Ledger', icon: Calculator }
                      ].map(item => {
                        const ItemIcon = item.icon
                        const active = isRouteActive(item.route)
                        return (
                          <div key={item.route} className="relative">
                            {active && (
                              <div className="absolute -left-[16px] top-1.5 bottom-1.5 w-1 bg-purple-600 rounded-full z-10"></div>
                            )}
                            <button
                              onClick={() => handleNavClick(item.route)}
                              className={`w-full flex items-center gap-2.5 text-left py-2 px-2.5 rounded-lg text-[13px] transition-all cursor-pointer ${
                                active
                                  ? 'bg-[#f5eeff] text-purple-700 font-semibold'
                                  : 'text-slate-500 hover:text-slate-900 hover:bg-slate-50'
                              }`}
                            >
                              <ItemIcon className={`w-3.5 h-3.5 shrink-0 ${active ? 'text-purple-600' : 'text-slate-400'}`} />
                              <span className="truncate">{item.label}</span>
                            </button>
                          </div>
                        )
                      })}
                    </div>
                  )}
                </div>
              )}

              {/* 9. Communication & Notices */}
              <div className="relative">
                {isRouteActive('inst-notices') && (
                  <div className="absolute left-0 top-1.5 bottom-1.5 w-1 bg-purple-600 rounded-full z-10"></div>
                )}
                <button
                  onClick={() => handleNavClick('inst-notices')}
                  className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl transition-all text-left cursor-pointer group ${
                    isRouteActive('inst-notices')
                      ? 'bg-[#f5eeff] text-purple-700 font-semibold shadow-2xs'
                      : 'text-slate-500 hover:text-slate-900 hover:bg-slate-50/80'
                  }`}
                >
                  <Megaphone className={`w-[18px] h-[18px] shrink-0 transition-colors ${
                    isRouteActive('inst-notices') ? 'text-purple-600' : 'text-slate-400 group-hover:text-purple-600'
                  }`} />
                  {(!collapsed || isMobileOpen) && <span>Communication & Notices</span>}
                </button>
              </div>

              {/* 10. Homework & Learning Resources */}
              <div className="relative">
                {isRouteActive('inst-learning') && (
                  <div className="absolute left-0 top-1.5 bottom-1.5 w-1 bg-purple-600 rounded-full z-10"></div>
                )}
                <button
                  onClick={() => handleNavClick('inst-learning')}
                  className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl transition-all text-left cursor-pointer group ${
                    isRouteActive('inst-learning')
                      ? 'bg-[#f5eeff] text-purple-700 font-semibold shadow-2xs'
                      : 'text-slate-500 hover:text-slate-900 hover:bg-slate-50/80'
                  }`}
                >
                  <Laptop className={`w-[18px] h-[18px] shrink-0 transition-colors ${
                    isRouteActive('inst-learning') ? 'text-purple-600' : 'text-slate-400 group-hover:text-purple-600'
                  }`} />
                  {(!collapsed || isMobileOpen) && <span>Homework & Learning Resources</span>}
                </button>
              </div>

              {/* 11. Campus Services (Transport, Library, Inventory) */}
              {!isAccountant && (
                <div>
                  <button
                    onClick={() => {
                      if (collapsed) setCollapsed(false)
                      setServicesOpen(!servicesOpen)
                    }}
                    className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl transition-colors cursor-pointer group ${
                      isServicesRoute 
                        ? 'text-purple-700 bg-[#f5eeff]/50 font-semibold' 
                        : 'text-slate-500 hover:text-slate-800 hover:bg-slate-50/80'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <Bus className={`w-[18px] h-[18px] shrink-0 transition-colors ${
                        isServicesRoute ? 'text-purple-600' : 'text-slate-400 group-hover:text-purple-600'
                      }`} />
                      {(!collapsed || isMobileOpen) && <span>Campus Services</span>}
                    </div>
                    {(!collapsed || isMobileOpen) && (
                      servicesOpen ? <ChevronUp className="w-3.5 h-3.5 text-slate-400" /> : <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
                    )}
                  </button>

                  {(!collapsed || isMobileOpen) && servicesOpen && (
                    <div className="mt-1 pl-3.5 space-y-1 border-l-2 border-slate-100 ml-5">
                      {[
                        { route: 'inst-transport', label: 'Transport & Fleet', icon: Bus },
                        { route: 'inst-library', label: 'Library & Books', icon: BookMarked },
                        { route: 'inst-inventory', label: 'Inventory & Assets', icon: Boxes }
                      ].map(item => {
                        const ItemIcon = item.icon
                        const active = isRouteActive(item.route)
                        return (
                          <div key={item.route} className="relative">
                            {active && (
                              <div className="absolute -left-[16px] top-1.5 bottom-1.5 w-1 bg-purple-600 rounded-full z-10"></div>
                            )}
                            <button
                              onClick={() => handleNavClick(item.route)}
                              className={`w-full flex items-center gap-2.5 text-left py-2 px-2.5 rounded-lg text-[13px] transition-all cursor-pointer ${
                                active
                                  ? 'bg-[#f5eeff] text-purple-700 font-semibold'
                                  : 'text-slate-500 hover:text-slate-900 hover:bg-slate-50'
                              }`}
                            >
                              <ItemIcon className={`w-3.5 h-3.5 shrink-0 ${active ? 'text-purple-600' : 'text-slate-400'}`} />
                              <span className="truncate">{item.label}</span>
                            </button>
                          </div>
                        )
                      })}
                    </div>
                  )}
                </div>
              )}

              {/* 12. School Leaving (SLC) & Certificates */}
              {!isAccountant && (
                <div className="relative">
                  {isRouteActive('inst-certificates') && (
                    <div className="absolute left-0 top-1.5 bottom-1.5 w-1 bg-purple-600 rounded-full z-10"></div>
                  )}
                  <button
                    onClick={() => handleNavClick('inst-certificates')}
                    className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl transition-all text-left cursor-pointer group ${
                      isRouteActive('inst-certificates')
                        ? 'bg-[#f5eeff] text-purple-700 font-semibold shadow-2xs'
                        : 'text-slate-500 hover:text-slate-900 hover:bg-slate-50/80'
                    }`}
                  >
                    <FileBadge className={`w-[18px] h-[18px] shrink-0 transition-colors ${
                      isRouteActive('inst-certificates') ? 'text-purple-600' : 'text-slate-400 group-hover:text-purple-600'
                    }`} />
                    {(!collapsed || isMobileOpen) && <span>School Leaving (SLC) & Certificates</span>}
                  </button>
                </div>
              )}

              {/* 13. Events & Calendar */}
              <div className="relative">
                {isRouteActive('inst-events') && (
                  <div className="absolute left-0 top-1.5 bottom-1.5 w-1 bg-purple-600 rounded-full z-10"></div>
                )}
                <button
                  onClick={() => handleNavClick('inst-events')}
                  className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl transition-all text-left cursor-pointer group ${
                    isRouteActive('inst-events')
                      ? 'bg-[#f5eeff] text-purple-700 font-semibold shadow-2xs'
                      : 'text-slate-500 hover:text-slate-900 hover:bg-slate-50/80'
                  }`}
                >
                  <Calendar className={`w-[18px] h-[18px] shrink-0 transition-colors ${
                    isRouteActive('inst-events') ? 'text-purple-600' : 'text-slate-400 group-hover:text-purple-600'
                  }`} />
                  {(!collapsed || isMobileOpen) && <span>Events & Calendar</span>}
                </button>
              </div>

              {/* 14. Reports & Analytics */}
              <div className="relative">
                {isRouteActive('inst-reports') && (
                  <div className="absolute left-0 top-1.5 bottom-1.5 w-1 bg-purple-600 rounded-full z-10"></div>
                )}
                <button
                  onClick={() => handleNavClick('inst-reports')}
                  className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl transition-all text-left cursor-pointer group ${
                    isRouteActive('inst-reports')
                      ? 'bg-[#f5eeff] text-purple-700 font-semibold shadow-2xs'
                      : 'text-slate-500 hover:text-slate-900 hover:bg-slate-50/80'
                  }`}
                >
                  <BarChart3 className={`w-[18px] h-[18px] shrink-0 transition-colors ${
                    isRouteActive('inst-reports') ? 'text-purple-600' : 'text-slate-400 group-hover:text-purple-600'
                  }`} />
                  {(!collapsed || isMobileOpen) && <span>Reports & Analytics</span>}
                </button>
              </div>

              {/* 15. Users, Roles & Settings */}
              {isCampusAdmin && (
                <div>
                  <button
                    onClick={() => {
                      if (collapsed) setCollapsed(false)
                      setUsersOpen(!usersOpen)
                    }}
                    className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl transition-colors cursor-pointer group ${
                      isUsersRoute 
                        ? 'text-purple-700 bg-[#f5eeff]/50 font-semibold' 
                        : 'text-slate-500 hover:text-slate-800 hover:bg-slate-50/80'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <ShieldCheck className={`w-[18px] h-[18px] shrink-0 transition-colors ${
                        isUsersRoute ? 'text-purple-600' : 'text-slate-400 group-hover:text-purple-600'
                      }`} />
                      {(!collapsed || isMobileOpen) && <span>Users, Roles & Settings</span>}
                    </div>
                    {(!collapsed || isMobileOpen) && (
                      usersOpen ? <ChevronUp className="w-3.5 h-3.5 text-slate-400" /> : <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
                    )}
                  </button>

                  {(!collapsed || isMobileOpen) && usersOpen && (
                    <div className="mt-1 pl-3.5 space-y-1 border-l-2 border-slate-100 ml-5">
                      {[
                        { route: 'inst-users', label: 'User Logins & Roles', icon: ShieldCheck },
                        { route: 'inst-settings', label: 'Campus System Settings', icon: Settings }
                      ].map(item => {
                        const ItemIcon = item.icon
                        const active = isRouteActive(item.route)
                        return (
                          <div key={item.route} className="relative">
                            {active && (
                              <div className="absolute -left-[16px] top-1.5 bottom-1.5 w-1 bg-purple-600 rounded-full z-10"></div>
                            )}
                            <button
                              onClick={() => handleNavClick(item.route)}
                              className={`w-full flex items-center gap-2.5 text-left py-2 px-2.5 rounded-lg text-[13px] transition-all cursor-pointer ${
                                active
                                  ? 'bg-[#f5eeff] text-purple-700 font-semibold'
                                  : 'text-slate-500 hover:text-slate-900 hover:bg-slate-50'
                              }`}
                            >
                              <ItemIcon className={`w-3.5 h-3.5 shrink-0 ${active ? 'text-purple-600' : 'text-slate-400'}`} />
                              <span className="truncate">{item.label}</span>
                            </button>
                          </div>
                        )
                      })}
                    </div>
                  )}
                </div>
              )}
            </>
          )}

        </div>

        {/* Clean Sign Out Footer */}
        <div className="p-3 border-t border-slate-100 bg-white">
          <button
            onClick={logout}
            className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-slate-500 hover:text-rose-600 hover:bg-rose-50 transition-colors text-xs font-semibold cursor-pointer"
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
