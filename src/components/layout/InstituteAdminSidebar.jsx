import React, { useState, useEffect } from 'react'
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
  Building2, 
  X, 
  UserCheck, 
  Bus, 
  BookMarked,
  FileBadge,
  Laptop
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

  // Granular Role-Based Access Scopes & Tier Gating
  const tierConfig = getInstituteTierConfig(currentInstitute)
  const userRole = user?.role || 'institute_admin'
  const isTeacher = userRole === 'teacher'
  const isAccountant = userRole === 'accountant'
  const isCampusAdmin = !isTeacher && !isAccountant

  const isAcademicsRoute = ['inst-classes', 'inst-subjects', 'inst-timetable', 'inst-program-levels'].includes(currentRoute)
  const isServicesRoute = ['inst-transport', 'inst-library'].includes(currentRoute)
  const isLearningRoute = ['inst-learning', 'inst-notices'].includes(currentRoute)

  const [academicsOpen, setAcademicsOpen] = useState(isAcademicsRoute)
  const [servicesOpen, setServicesOpen] = useState(isServicesRoute)
  const [learningOpen, setLearningOpen] = useState(isLearningRoute)

  useEffect(() => {
    if (isAcademicsRoute) setAcademicsOpen(true)
    if (isServicesRoute) setServicesOpen(true)
    if (isLearningRoute) setLearningOpen(true)
  }, [currentRoute, isAcademicsRoute, isServicesRoute, isLearningRoute])

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
                {tierConfig.isUniversityOnly ? (
                  <GraduationCap className="w-4 h-4 text-purple-600" />
                ) : tierConfig.isCollegeOnly ? (
                  <Building2 className="w-4 h-4 text-purple-600" />
                ) : (
                  <School className="w-4 h-4 text-purple-600" />
                )}
              </div>
              <div className="flex flex-col truncate">
                <span className="text-sm font-extrabold text-slate-900 tracking-tight font-heading truncate">
                  {instituteName || 'Campus Administration'}
                </span>
                <span className="text-[10px] text-purple-600 font-bold uppercase tracking-wider">
                  {user?.roleTitle || (isTeacher ? 'Faculty Portal' : isAccountant ? 'Accounts Officer' : tierConfig.roleBadge)}
                </span>
              </div>
            </div>
          )}

          {/* Mobile Close Button */}
          <button 
            onClick={onCloseMobile}
            className="lg:hidden text-slate-400 hover:text-slate-700 p-1.5 rounded-lg hover:bg-slate-100 transition-colors ml-auto cursor-pointer"
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
        <div className="flex-1 py-4 px-3 space-y-1 overflow-y-auto dark-scroll text-[13.5px]">
          {/* Campus Dashboard */}
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
            <div className="pt-3 pb-1 px-3 text-[10px] font-bold uppercase tracking-wider text-slate-400">
              <span>Operational Modules</span>
            </div>
          )}

          {/* Module 1: Students Directory */}
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
                {(!collapsed || isMobileOpen) && <span>{tierConfig.isUniversityOnly ? 'Enrolled Students' : tierConfig.isCollegeOnly ? 'College Students' : 'Students Directory'}</span>}
              </button>
            </div>
          )}

          {/* Module 2: Admissions & Leads */}
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
                {(!collapsed || isMobileOpen) && <span>{tierConfig.isUniversityOnly ? 'Admissions & Intake' : tierConfig.isCollegeOnly ? 'Admissions & Merit Lists' : 'Admissions & Leads'}</span>}
              </button>
            </div>
          )}

          {/* Module 3: Staff & Faculty */}
          {isCampusAdmin && (
            <div className="relative">
              {isRouteActive('inst-teachers') && (
                <div className="absolute left-0 top-1.5 bottom-1.5 w-1 bg-purple-600 rounded-full z-10"></div>
              )}
              <button
                onClick={() => handleNavClick('inst-teachers')}
                className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl transition-all text-left cursor-pointer group ${
                  isRouteActive('inst-teachers')
                    ? 'bg-[#f5eeff] text-purple-700 font-semibold shadow-2xs'
                    : 'text-slate-500 hover:text-slate-900 hover:bg-slate-50/80'
                }`}
              >
                <Users className={`w-[18px] h-[18px] shrink-0 transition-colors ${
                  isRouteActive('inst-teachers') ? 'text-purple-600' : 'text-slate-400 group-hover:text-purple-600'
                }`} />
                {(!collapsed || isMobileOpen) && <span>{tierConfig.isUniversityOnly ? 'Professors & Faculty' : tierConfig.isCollegeOnly ? 'Lecturers & Faculty' : 'Staff & Faculty'}</span>}
              </button>
            </div>
          )}

          {/* Module 4: Examinations & Results */}
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
                {(!collapsed || isMobileOpen) && <span>{tierConfig.terminology.exams}</span>}
              </button>
            </div>
          )}

          {/* Module 5: Academics (Expandable) */}
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
                    { route: 'inst-classes', label: tierConfig.terminology.classes, icon: BookOpen },
                    { route: 'inst-subjects', label: tierConfig.terminology.curriculum, icon: Bookmark },
                    { route: 'inst-timetable', label: tierConfig.isUniversityOnly ? 'Lecture Timetable' : tierConfig.isCollegeOnly ? 'College Timetable' : 'Class Timetable', icon: Clock },
                    { route: 'inst-program-levels', label: tierConfig.isUniversityOnly ? 'Degree Matrix' : tierConfig.isCollegeOnly ? 'Program Streams' : 'Program Levels', icon: GraduationCap }
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

          {/* Module 6: Attendance Register */}
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
                {(!collapsed || isMobileOpen) && <span>{tierConfig.isUniversityOnly ? 'Course Attendance' : 'Attendance Register'}</span>}
              </button>
            </div>
          )}

          {/* Module 7: Fees & Finance */}
          {!isTeacher && (
            <div className="relative">
              {isRouteActive('inst-fees') && (
                <div className="absolute left-0 top-1.5 bottom-1.5 w-1 bg-purple-600 rounded-full z-10"></div>
              )}
              <button
                onClick={() => handleNavClick('inst-fees')}
                className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl transition-all text-left cursor-pointer group ${
                  isRouteActive('inst-fees')
                    ? 'bg-[#f5eeff] text-purple-700 font-semibold shadow-2xs'
                    : 'text-slate-500 hover:text-slate-900 hover:bg-slate-50/80'
                }`}
              >
                <Receipt className={`w-[18px] h-[18px] shrink-0 transition-colors ${
                  isRouteActive('inst-fees') ? 'text-purple-600' : 'text-slate-400 group-hover:text-purple-600'
                }`} />
                {(!collapsed || isMobileOpen) && <span>{tierConfig.isUniversityOnly ? 'Tuition Fees & Dues' : 'Fees & Finance'}</span>}
              </button>
            </div>
          )}

          {/* Module 8: Certificates */}
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
              {(!collapsed || isMobileOpen) && <span>{tierConfig.terminology.certificates}</span>}
            </button>
          </div>

          {/* Module 9: Campus Services (Expandable) */}
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
                  { route: 'inst-transport', label: 'Transport & Vans', icon: Bus },
                  { route: 'inst-library', label: 'Library & Books', icon: BookMarked }
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

          {/* Module 10: Learning & Resources (Expandable) */}
          <div>
            <button
              onClick={() => {
                if (collapsed) setCollapsed(false)
                setLearningOpen(!learningOpen)
              }}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl transition-colors cursor-pointer group ${
                isLearningRoute 
                  ? 'text-purple-700 bg-[#f5eeff]/50 font-semibold' 
                  : 'text-slate-500 hover:text-slate-800 hover:bg-slate-50/80'
              }`}
            >
              <div className="flex items-center gap-3">
                <Laptop className={`w-[18px] h-[18px] shrink-0 transition-colors ${
                  isLearningRoute ? 'text-purple-600' : 'text-slate-400 group-hover:text-purple-600'
                }`} />
                {(!collapsed || isMobileOpen) && <span>Learning & Resources</span>}
              </div>
              {(!collapsed || isMobileOpen) && (
                learningOpen ? <ChevronUp className="w-3.5 h-3.5 text-slate-400" /> : <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
              )}
            </button>

            {(!collapsed || isMobileOpen) && learningOpen && (
              <div className="mt-1 pl-3.5 space-y-1 border-l-2 border-slate-100 ml-5">
                {[
                  { route: 'inst-learning', label: 'Study Notes & LMS', icon: Laptop },
                  { route: 'inst-notices', label: 'Campus Notices', icon: Megaphone }
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
