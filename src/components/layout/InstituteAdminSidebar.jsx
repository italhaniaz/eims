import React, { useState, useEffect, useMemo } from 'react'
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
  Calculator,
  Sparkles,
  FileCheck,
  FlaskConical,
  Briefcase,
  ClipboardList,
  Server,
  Layers
} from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import { getInstituteTierConfig } from '../../utils/tierGating'
import { PlatformService } from '../../services/platformService'

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
  const [moduleVersion, setModuleVersion] = useState(0)

  // Listen to Superadmin module updates in real time
  useEffect(() => {
    const handleModuleSync = () => setModuleVersion(v => v + 1)
    window.addEventListener('sms_modules_updated', handleModuleSync)
    window.addEventListener('sms_institutes_updated', handleModuleSync)
    window.addEventListener('storage', handleModuleSync)
    return () => {
      window.removeEventListener('sms_modules_updated', handleModuleSync)
      window.removeEventListener('sms_institutes_updated', handleModuleSync)
      window.removeEventListener('storage', handleModuleSync)
    }
  }, [])

  // Resolve tier configuration for active campus
  const tierConfig = useMemo(() => {
    return getInstituteTierConfig(currentInstitute)
  }, [currentInstitute])

  const isSchool = tierConfig.isSchool
  const isCollege = tierConfig.isCollege
  const isUniversity = tierConfig.isUniversity
  const isMultiTier = tierConfig.isMultiTier
  const userRole = user?.role || 'institute_admin'

  // Sub-roles & permission gating
  const isAccountant = ['accountant', 'school_accountant', 'college_accountant', 'finance', 'uni_finance'].includes(userRole)
  const isTeacher = ['teacher', 'faculty', 'school_teacher', 'college_faculty', 'uni_faculty'].includes(userRole)
  const isHod = ['hod', 'college_hod', 'dean', 'uni_dean'].includes(userRole)
  const isRegistrar = ['registrar', 'uni_registrar'].includes(userRole)
  const isController = ['controller', 'uni_controller'].includes(userRole)
  const isFullAdmin = !isAccountant && !isTeacher && !isHod && !isRegistrar && !isController

  // Route access verification by role
  const canAccessRoute = (routeId) => {
    if (isFullAdmin) return true

    if (isAccountant) {
      return ['inst-dashboard', 'inst-fees', 'inst-accounts', 'inst-payroll', 'inst-scholarships', 'inst-reports'].includes(routeId)
    }

    if (isTeacher) {
      return ['inst-dashboard', 'inst-classes', 'inst-subjects', 'inst-timetable', 'inst-attendance', 'inst-exams', 'inst-learning', 'inst-teachers', 'inst-payroll', 'inst-research-fyp', 'inst-notices'].includes(routeId)
    }

    if (isHod) {
      return ['inst-dashboard', 'inst-students', 'inst-course-registration', 'inst-program-levels', 'inst-classes', 'inst-subjects', 'inst-timetable', 'inst-attendance', 'inst-exams', 'inst-board-exams', 'inst-teachers', 'inst-research-fyp', 'inst-discipline', 'inst-labs', 'inst-learning', 'inst-notices', 'inst-reports'].includes(routeId)
    }

    if (isRegistrar) {
      return ['inst-dashboard', 'inst-admissions', 'inst-students', 'inst-certificates', 'inst-discipline', 'inst-career-alumni', 'inst-events', 'inst-reports', 'inst-users', 'inst-notices'].includes(routeId)
    }

    if (isController) {
      return ['inst-dashboard', 'inst-course-registration', 'inst-exams', 'inst-certificates', 'inst-events', 'inst-reports', 'inst-notices'].includes(routeId)
    }

    return true
  }

  // Check if module is enabled by Superadmin
  const isModuleActive = (moduleKey) => {
    if (!moduleKey) return true
    return PlatformService.isModuleEnabled(currentInstitute?.id, moduleKey, true)
  }

  const isRouteActive = (route) => currentRoute === route

  const handleNavClick = (id) => {
    onRouteChange(id)
    if (isMobileOpen) {
      onCloseMobile()
    }
  }

  // Dynamic Navigation Sections based on Academic Tier and Superadmin Toggles
  const navSections = useMemo(() => {
    const sections = []

    // 1. Executive / Campus Dashboard
    sections.push({
      id: 'dashboard',
      title: null, // Standalone top button
      items: [
        {
          id: 'inst-dashboard',
          label: isUniversity ? 'Executive VC Dashboard' : isCollege ? 'Principal Dashboard' : 'Campus Dashboard',
          icon: LayoutDashboard,
          allowedTiers: ['school', 'college', 'university', 'custom']
        }
      ]
    })

    // 2. Academics & Admissions
    const academicItems = []
    
    // Admissions (Gated by 'admissions' module)
    academicItems.push({
      id: 'inst-admissions',
      moduleKey: 'admissions',
      label: isUniversity ? 'Intake & Merit Lists' : isCollege ? 'Admissions & Merit Lists' : 'Admissions & Inquiries',
      icon: UserCheck,
      allowedTiers: ['school', 'college', 'university', 'custom']
    })

    // Classes / Disciplines / Degree Programs
    academicItems.push({
      id: 'inst-classes',
      moduleKey: 'students',
      label: isUniversity ? 'Degree Programs & Cohorts' : isCollege ? 'Disciplines & Batches' : 'Classes & Sections',
      icon: BookOpen,
      allowedTiers: ['school', 'college', 'university', 'custom']
    })

    // University / Composite: Faculties & Departments
    if (isUniversity || isMultiTier) {
      academicItems.push({
        id: 'inst-program-levels',
        label: 'Faculties & Departments',
        icon: Layers,
        allowedTiers: ['university', 'custom']
      })
    }

    // Subjects / Course Catalog
    academicItems.push({
      id: 'inst-subjects',
      moduleKey: 'students',
      label: isUniversity ? 'Course Catalog & Credits' : isCollege ? 'Board Curriculum & Syllabi' : 'Subjects & Syllabus',
      icon: BookMarked,
      allowedTiers: ['school', 'college', 'university', 'custom']
    })

    // University Course Registration / Add-Drop
    if (isUniversity || isMultiTier) {
      academicItems.push({
        id: 'inst-course-registration',
        label: 'Course Add / Drop Portal',
        icon: Laptop,
        allowedTiers: ['university', 'custom']
      })
    }

    // Timetable / Routines
    academicItems.push({
      id: 'inst-timetable',
      moduleKey: 'students',
      label: isUniversity ? 'Lecture Hall Scheduling' : isCollege ? 'Lecture & Lab Routine' : 'Class Timetable Matrix',
      icon: Clock,
      allowedTiers: ['school', 'college', 'university', 'custom']
    })

    // University Research, FYP & MS Thesis (Gated by 'research' module)
    if (isUniversity || isMultiTier) {
      academicItems.push({
        id: 'inst-research-fyp',
        moduleKey: 'research',
        label: 'Research, FYP & Thesis',
        icon: Sparkles,
        allowedTiers: ['university', 'custom']
      })
    }

    // Learning / Diary / LMS
    academicItems.push({
      id: 'inst-learning',
      label: isUniversity ? 'LMS Course Portals' : isCollege ? 'Lecture Notes & Materials' : 'School Diary & Homework',
      icon: Laptop,
      allowedTiers: ['school', 'college', 'university', 'custom']
    })

    sections.push({
      id: 'academics',
      title: isUniversity ? 'Faculties & Academics' : isCollege ? 'College Academics' : 'School Academics',
      items: academicItems
    })

    // 3. Students & Staff
    sections.push({
      id: 'people',
      title: isUniversity ? 'Faculty & Students CMS' : isCollege ? 'Faculty & Students' : 'Students & Teachers',
      items: [
        {
          id: 'inst-students',
          moduleKey: 'students',
          label: isUniversity ? 'Undergraduates CMS' : isCollege ? 'College Students Directory' : 'Students Directory',
          icon: Users,
          allowedTiers: ['school', 'college', 'university', 'custom']
        },
        {
          id: 'inst-teachers',
          label: isUniversity ? 'Professors & Faculty' : isCollege ? 'Lecturers & College Faculty' : 'Teachers & School Staff',
          icon: Award,
          allowedTiers: ['school', 'college', 'university', 'custom']
        },
        {
          id: 'inst-certificates',
          label: isUniversity ? 'Transcripts & Degrees' : isCollege ? 'College Leaving (CLC)' : 'Leaving (SLC) & Character',
          icon: FileBadge,
          allowedTiers: ['school', 'college', 'university', 'custom']
        }
      ]
    })

    // 4. Examinations & Attendance
    const examItems = [
      {
        id: 'inst-attendance',
        label: isUniversity ? 'Course 75% Exam Gate' : isCollege ? 'Lecture Attendance (75% Gate)' : 'Daily Roll Call Register',
        icon: CalendarCheck,
        allowedTiers: ['school', 'college', 'university', 'custom']
      },
      {
        id: 'inst-exams',
        moduleKey: 'exams',
        label: isUniversity ? 'Semester 4.0 GPA Exams' : isCollege ? 'Send-ups & Term Mocks' : 'Term Exams & Position Cards',
        icon: FileCheck,
        allowedTiers: ['school', 'college', 'university', 'custom']
      }
    ]

    // College Board Exams (BISE Roll No Slips)
    if (isCollege || isMultiTier) {
      examItems.push({
        id: 'inst-board-exams',
        moduleKey: 'exams',
        label: 'BISE Board Slips & Registration',
        icon: ClipboardList,
        allowedTiers: ['college', 'custom']
      })
    }

    sections.push({
      id: 'exams',
      title: isUniversity ? 'Exams & 75% Attendance' : isCollege ? 'Examinations & Board' : 'Examinations & Attendance',
      items: examItems
    })

    // 5. Finance & Accounts
    const financeItems = [
      {
        id: 'inst-fees',
        moduleKey: 'fees',
        label: isUniversity ? 'Semester Tuition & 1-Bill' : isCollege ? 'Intermediate Fee Vouchers' : 'Monthly School Fee Challans',
        icon: Receipt,
        allowedTiers: ['school', 'college', 'university', 'custom']
      }
    ]

    // College & University Scholarships (Gated by 'scholarships' module)
    if (isCollege || isUniversity || isMultiTier) {
      financeItems.push({
        id: 'inst-scholarships',
        moduleKey: 'scholarships',
        label: isUniversity ? 'HEC & Merit Scholarships' : 'Merit Concessions & Aid',
        icon: Sparkles,
        allowedTiers: ['college', 'university', 'custom']
      })
    }

    financeItems.push(
      {
        id: 'inst-accounts',
        label: isUniversity ? 'Budget & Procurement' : 'Accounts Ledger & Cash',
        icon: Calculator,
        allowedTiers: ['school', 'college', 'university', 'custom']
      },
      {
        id: 'inst-payroll',
        moduleKey: 'payroll',
        label: isUniversity ? 'Faculty Payroll & Grants' : 'Staff Salaries & Payroll',
        icon: Briefcase,
        allowedTiers: ['school', 'college', 'university', 'custom']
      }
    )

    sections.push({
      id: 'finance',
      title: isUniversity ? 'Finance, Dues & Grants' : 'Finance & Accounts',
      items: financeItems
    })

    // 6. Campus Logistics & Facilities (Superadmin Gated Modules)
    const logisticItems = [
      {
        id: 'inst-transport',
        moduleKey: 'transport',
        label: isUniversity ? 'Campus Shuttle Transport' : isCollege ? 'College Buses & Routes' : 'School Vans & Transport',
        icon: Bus,
        allowedTiers: ['school', 'college', 'university', 'custom']
      },
      {
        id: 'inst-library',
        moduleKey: 'library',
        label: isUniversity ? 'Central Academic Library' : isCollege ? 'College Library' : 'School Library',
        icon: BookMarked,
        allowedTiers: ['school', 'college', 'university', 'custom']
      }
    ]

    // Hostel for College & University
    if (isCollege || isUniversity || isMultiTier) {
      logisticItems.push({
        id: 'inst-hostel',
        moduleKey: 'hostel',
        label: 'Hostel & Boarding Facility',
        icon: Building,
        allowedTiers: ['college', 'university', 'custom']
      })
    }

    // Science / Computer Labs for College & University
    if (isCollege || isUniversity || isMultiTier) {
      logisticItems.push({
        id: 'inst-labs',
        moduleKey: 'labs',
        label: isUniversity ? 'Advanced Research & AI Labs' : 'Science & Computer Labs',
        icon: FlaskConical,
        allowedTiers: ['college', 'university', 'custom']
      })
    }

    // Inventory
    logisticItems.push({
      id: 'inst-inventory',
      moduleKey: 'inventory',
      label: 'Campus Inventory & Assets',
      icon: Boxes,
      allowedTiers: ['school', 'college', 'university', 'custom']
    })

    // University Campus IT
    if (isUniversity || isMultiTier) {
      logisticItems.push({
        id: 'inst-campus-it',
        moduleKey: 'it',
        label: 'Campus IT & CMS Infrastructure',
        icon: Server,
        allowedTiers: ['university', 'custom']
      })
    }

    sections.push({
      id: 'logistics',
      title: isUniversity ? 'Campus Infrastructure' : 'Campus Facilities & Logistics',
      items: logisticItems
    })

    // 7. Communication & Governance
    const commItems = [
      {
        id: 'inst-notices',
        moduleKey: 'communication',
        label: isUniversity ? 'Syndicate & Senate Circulars' : isCollege ? 'College Circulars & Notices' : 'Circulars & SMS Broadcasts',
        icon: Megaphone,
        allowedTiers: ['school', 'college', 'university', 'custom']
      }
    ]

    if (isCollege || isUniversity || isMultiTier) {
      commItems.push({
        id: 'inst-discipline',
        label: isUniversity ? 'University Disciplinary Board' : 'Discipline & Proctorial',
        icon: ShieldAlert,
        allowedTiers: ['college', 'university', 'custom']
      })
    }

    if (isUniversity || isMultiTier) {
      commItems.push({
        id: 'inst-career-alumni',
        moduleKey: 'career',
        label: 'Placement & Alumni Network',
        icon: GraduationCap,
        allowedTiers: ['university', 'custom']
      })
    }

    commItems.push({
      id: 'inst-events',
      label: isUniversity ? 'Convocation & Academic Calendar' : isCollege ? 'Sports & College Events' : 'School Calendar & Events',
      icon: Calendar,
      allowedTiers: ['school', 'college', 'university', 'custom']
    })

    sections.push({
      id: 'communication',
      title: isUniversity ? 'Governance & Placement' : 'Campus Activities & Notices',
      items: commItems
    })

    // 8. Management & Reports
    sections.push({
      id: 'management',
      title: 'Management & Control',
      items: [
        {
          id: 'inst-reports',
          label: isUniversity ? 'HEC QEC & Analytics' : isCollege ? 'College Analytics & Reports' : 'School Reports & Analytics',
          icon: BarChart3,
          allowedTiers: ['school', 'college', 'university', 'custom']
        },
        {
          id: 'inst-users',
          label: 'Staff Logins & Role Access',
          icon: ShieldCheck,
          allowedTiers: ['school', 'college', 'university', 'custom'],
          adminOnly: true
        },
        {
          id: 'inst-settings',
          label: isUniversity ? 'University Charter & Settings' : isCollege ? 'College Profile & Settings' : 'School Profile & Settings',
          icon: Settings,
          allowedTiers: ['school', 'college', 'university', 'custom'],
          adminOnly: true
        }
      ]
    })

    return sections
  }, [isSchool, isCollege, isUniversity, isMultiTier, moduleVersion])

  // Filter sections and items based on role access and Superadmin module toggles
  const filteredSections = useMemo(() => {
    return navSections.map(sec => {
      const activeItems = sec.items.filter(item => {
        // 1. Role permission check
        if (!canAccessRoute(item.id)) return false
        if (item.adminOnly && !isFullAdmin) return false

        // 2. Superadmin module toggle check
        if (item.moduleKey && !isModuleActive(item.moduleKey)) {
          return false
        }

        return true
      })

      return {
        ...sec,
        items: activeItems
      }
    }).filter(sec => sec.items.length > 0)
  }, [navSections, isFullAdmin, isAccountant, isTeacher, isHod, isRegistrar, isController, moduleVersion])

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
              <div className={`w-9 h-9 rounded-xl border flex items-center justify-center shrink-0 font-bold text-xs shadow-2xs ${
                isUniversity 
                  ? 'bg-blue-50 text-blue-700 border-blue-100'
                  : isCollege 
                  ? 'bg-purple-50 text-purple-700 border-purple-100'
                  : 'bg-emerald-50 text-emerald-700 border-emerald-100'
              }`}>
                {isUniversity ? (
                  <GraduationCap className="w-4.5 h-4.5" />
                ) : isCollege ? (
                  <Building2 className="w-4.5 h-4.5" />
                ) : (
                  <School className="w-4.5 h-4.5" />
                )}
              </div>
              <div className="flex flex-col truncate">
                <span className="text-sm font-extrabold text-slate-900 tracking-tight font-heading truncate">
                  {instituteName || currentInstitute?.name || (isUniversity ? 'University Portal' : isCollege ? 'College Portal' : 'School Portal')}
                </span>
                <span className={`text-[10px] font-bold uppercase tracking-wider ${
                  isUniversity ? 'text-blue-600' : isCollege ? 'text-purple-600' : 'text-emerald-600'
                }`}>
                  {user?.roleTitle || (isTeacher ? 'Faculty Portal' : isAccountant ? 'Accounts Officer' : isUniversity ? 'Vice Chancellor / Dean' : isCollege ? 'College Principal' : 'School Principal')}
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

        {/* Dynamic Navigation Menu */}
        <div className="flex-1 py-3 px-3 space-y-4 overflow-y-auto dark-scroll text-[13.5px]">
          {filteredSections.map((sec, idx) => (
            <div key={sec.id || idx} className="space-y-1">
              {/* Section Header */}
              {sec.title && (!collapsed || isMobileOpen) && (
                <div className="pt-2 pb-1 px-3 text-[10.5px] font-extrabold uppercase tracking-wider text-slate-400">
                  {sec.title}
                </div>
              )}

              {/* Section Items */}
              {sec.items.map(item => {
                const ItemIcon = item.icon
                const active = isRouteActive(item.id)

                return (
                  <div key={item.id} className="relative">
                    {active && (
                      <div className="absolute left-0 top-1.5 bottom-1.5 w-1 bg-purple-600 rounded-full z-10" />
                    )}
                    <button
                      onClick={() => handleNavClick(item.id)}
                      className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl transition-all text-left cursor-pointer group ${
                        active
                          ? 'bg-[#f5eeff] text-purple-700 font-semibold shadow-2xs'
                          : 'text-slate-500 hover:text-slate-900 hover:bg-slate-50/80'
                      }`}
                      title={collapsed && !isMobileOpen ? item.label : undefined}
                    >
                      <ItemIcon className={`w-[18px] h-[18px] shrink-0 transition-colors ${
                        active ? 'text-purple-600' : 'text-slate-400 group-hover:text-purple-600'
                      }`} />
                      {(!collapsed || isMobileOpen) && (
                        <span className="truncate">{item.label}</span>
                      )}
                    </button>
                  </div>
                )
              })}
            </div>
          ))}
        </div>

        {/* Bottom User Card & Sign Out */}
        <div className="p-3 border-t border-slate-100 bg-white">
          <button
            onClick={logout}
            className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-slate-500 hover:text-rose-600 hover:bg-rose-50 transition-colors text-xs font-semibold cursor-pointer"
            title="Sign Out"
          >
            <LogOut className="w-4 h-4 shrink-0 text-slate-400 group-hover:text-rose-500" />
            {(!collapsed || isMobileOpen) && <span>Sign Out</span>}
          </button>
        </div>
      </aside>
    </>
  )
}

export default InstituteAdminSidebar
