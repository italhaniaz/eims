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
  LogOut,
  School,
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
  Settings,
  CreditCard,
  Calculator,
  Building2,
  FileText,
  PlayCircle,
  User,
  MessageSquare,
  Wallet,
  Upload,
  UserPlus,
  History,
  AlertTriangle,
  SlidersHorizontal,
  Video,
  ClipboardList,
  Inbox,
  Bell,
  Phone,
  PackageCheck,
  RotateCcw,
  IdCard,
  TrendingUp,
  ArrowUpRight,
  TrendingDown
} from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import { useAppData } from '../../context/AppDataContext'
import { preloadRoute } from '../../utils/modulePreloader'

export const canRoleAccessRoute = (role, routeId) => {
  const userRole = String(role || 'institute_admin').toLowerCase()
  if (userRole === 'superadmin' || userRole === 'institute_admin' || userRole === 'school_admin') {
    return true
  }
  return routeId === 'inst-dashboard'
}

const buildMenuItems = (studentsCount) => [
  { id: 'inst-dashboard', label: 'Dashboard', icon: LayoutDashboard },
  {
    id: 'grp-admissions',
    label: 'Admissions',
    icon: UserCheck,
    children: [
      { id: 'inst-admissions', label: 'Admission Inquiries', icon: ClipboardList },
      { id: 'inst-admissions-online', label: 'Online Applications', icon: Laptop },
      { id: 'inst-admissions-enroll', label: 'Enroll Student', icon: UserPlus },
      { id: 'inst-admissions-import', label: 'Bulk Import', icon: Upload }
    ]
  },
  {
    id: 'grp-students',
    label: 'Students',
    icon: GraduationCap,
    children: [
      { id: 'inst-students', label: 'All Students', icon: Users, badge: studentsCount },
      { id: 'inst-students-guardians', label: 'Parents & Guardians', icon: Users },
      {
        id: 'grp-students-promotion',
        label: 'Promotion & Status',
        icon: ArrowUpRight,
        children: [
          { id: 'inst-students-promote', label: 'Promote Students', icon: TrendingUp },
          { id: 'inst-students-manage-promotions', label: 'Manage Promotions', icon: ClipboardList },
          { id: 'inst-students-graduated', label: 'Graduated', icon: GraduationCap },
          { id: 'inst-students-drop-leave', label: 'Drop / Leave', icon: LogOut }
        ]
      },
      { id: 'inst-reports-students', label: 'Performance Reports', icon: BarChart3 },
      { id: 'inst-students-idcards', label: 'ID Cards', icon: IdCard },
      { id: 'inst-certificates', label: 'Certificates', icon: FileBadge }
    ]
  },
  {
    id: 'grp-attendance',
    label: 'Attendance',
    icon: CalendarCheck,
    children: [
      { id: 'inst-attendance-my', label: 'My Attendance', icon: Clock },
      { id: 'inst-attendance', label: 'Mark Attendance', icon: CalendarCheck },
      {
        id: 'grp-attendance-reports',
        label: 'Reports',
        icon: BarChart3,
        children: [
          { id: 'inst-attendance-student-report', label: 'Student Attendance', icon: GraduationCap },
          { id: 'inst-attendance-staff-report', label: 'Staff Attendance', icon: Users },
          { id: 'inst-attendance-consecutive', label: 'Consecutive Absences', icon: AlertTriangle },
          { id: 'inst-attendance-low', label: 'Low Attendance', icon: TrendingDown },
          { id: 'inst-attendance-unmarked', label: 'Unmarked Classes', icon: ClipboardList }
        ]
      },
      { id: 'inst-attendance-settings', label: 'Attendance Settings', icon: Settings }
    ]
  },
  {
    id: 'grp-billing',
    label: 'Billing & Fees',
    icon: Receipt,
    children: [
      { id: 'inst-fees', label: 'Invoices', icon: Receipt },
      { id: 'inst-fees-history', label: 'Billing History', icon: History },
      { id: 'inst-fees-family', label: 'Family Vouchers', icon: Users },
      { id: 'inst-fees-approvals', label: 'Payment Approvals', icon: UserCheck },
      { id: 'inst-fees-outstanding', label: 'Outstanding Fees', icon: AlertTriangle },
      { id: 'inst-fees-fines', label: 'Fines', icon: Receipt },
      { id: 'inst-fees-setup', label: 'Student Fee Setup', icon: SlidersHorizontal },
      {
        id: 'grp-fees-settings',
        label: 'Fee Settings',
        icon: Settings,
        children: [
          { id: 'inst-fees-categories', label: 'Fee Categories', icon: ClipboardList },
          { id: 'inst-fees-payment-methods', label: 'Payment Methods', icon: CreditCard },
          { id: 'inst-fees-invoice-layout', label: 'Invoice Layout', icon: FileText }
        ]
      }
    ]
  },
  {
    id: 'grp-academics',
    label: 'Academics',
    icon: BookOpen,
    children: [
      { id: 'inst-classes', label: 'Classes & Sections', icon: BookOpen },
      { id: 'inst-subjects', label: 'Subjects', icon: BookMarked },
      { id: 'inst-timetable', label: 'Timetable', icon: Clock },
      { id: 'inst-assignments', label: 'Assignments', icon: ClipboardList },
      {
        id: 'grp-class-resources',
        label: 'Class Resources',
        icon: Laptop,
        children: [
          { id: 'inst-learning-handouts', label: 'Handouts', icon: FileText },
          { id: 'inst-learning-lectures', label: 'Recorded Lectures', icon: Video }
        ]
      },
      { id: 'inst-events', label: 'Academic Calendar', icon: Calendar },
      { id: 'inst-makeup-sessions', label: 'Make-up Sessions', icon: Clock }
    ]
  },
  {
    id: 'grp-exams',
    label: 'Exams & Results',
    icon: Award,
    children: [
      { id: 'inst-exams', label: 'Exams', icon: Award },
      { id: 'inst-exams-schedule', label: 'Exam Schedule', icon: Calendar },
      { id: 'inst-exams-assessments', label: 'Assessments', icon: ClipboardList },
      { id: 'inst-exams-marks', label: 'Marks Entry', icon: FileText },
      {
        id: 'grp-exams-results',
        label: 'Results',
        icon: BarChart3,
        children: [
          { id: 'inst-exams-result-summary', label: 'Result Summary', icon: BarChart3 },
          { id: 'inst-exams-report-cards', label: 'Report Cards', icon: FileBadge },
          { id: 'inst-exams-grades', label: 'Grades', icon: Award }
        ]
      },
      { id: 'inst-exams-settings', label: 'Exam Settings', icon: Settings }
    ]
  },
  {
    id: 'grp-finance',
    label: 'Finance & Accounts',
    icon: Calculator,
    children: [
      { id: 'inst-accounts', label: 'Financial Dashboard', icon: BarChart3 },
      { id: 'inst-accounts-collection', label: 'Fee Collection Report', icon: Receipt },
      { id: 'inst-accounts-income', label: 'Other Income', icon: TrendingUp },
      {
        id: 'grp-finance-expenses',
        label: 'Expenses',
        icon: TrendingDown,
        children: [
          { id: 'inst-accounts-expenses', label: 'All Expenses', icon: ClipboardList },
          { id: 'inst-accounts-categories', label: 'Expense Categories', icon: SlidersHorizontal }
        ]
      }
    ]
  },
  {
    id: 'grp-staff',
    label: 'Staff & Payroll',
    icon: Users,
    children: [
      { id: 'inst-teachers', label: 'All Staff', icon: Users },
      {
        id: 'grp-staff-payroll',
        label: 'Payroll',
        icon: CreditCard,
        children: [
          { id: 'inst-payroll', label: 'Salary Payments', icon: CreditCard },
          { id: 'inst-salary-setup', label: 'Salary Setup', icon: Settings }
        ]
      },
      { id: 'inst-staff-loans', label: 'Loans & Advances', icon: Wallet },
      { id: 'inst-staff-fines', label: 'Staff Fines', icon: AlertTriangle },
      {
        id: 'grp-staff-documents',
        label: 'Staff Documents',
        icon: FileText,
        children: [
          { id: 'inst-staff-docs', label: 'Documents', icon: FileText },
          { id: 'inst-staff-letters', label: 'Appointment Letters', icon: FileBadge },
          { id: 'inst-staff-idcards', label: 'ID Cards', icon: IdCard }
        ]
      },
      { id: 'inst-staff-reports', label: 'HR Reports', icon: BarChart3 }
    ]
  },
  {
    id: 'grp-communication',
    label: 'Communication',
    icon: MessageSquare,
    children: [
      { id: 'inst-communication-inbox', label: 'Inbox', icon: Inbox },
      { id: 'inst-notices', label: 'Announcements', icon: Megaphone },
      { id: 'inst-communication-notifications', label: 'Notifications', icon: Bell },
      { id: 'inst-communication-whatsapp', label: 'WhatsApp', icon: MessageSquare },
      { id: 'inst-communication-sms', label: 'SMS Settings', icon: Phone }
    ]
  },
  {
    id: 'grp-inventory',
    label: 'Inventory',
    icon: Boxes,
    children: [
      { id: 'inst-inventory-categories', label: 'Categories', icon: SlidersHorizontal },
      { id: 'inst-inventory', label: 'Items', icon: Boxes },
      { id: 'inst-inventory-receive', label: 'Receive Stock', icon: PackageCheck },
      { id: 'inst-inventory-issue', label: 'Issue to Students', icon: UserPlus },
      { id: 'inst-inventory-reports', label: 'Inventory Reports', icon: BarChart3 }
    ]
  },
  {
    id: 'grp-library',
    label: 'Library',
    icon: BookMarked,
    children: [
      { id: 'inst-library', label: 'Books', icon: BookOpen },
      { id: 'inst-library-issue', label: 'Issue & Return', icon: RotateCcw }
    ]
  },
  {
    id: 'grp-transport-hostels',
    label: 'Transport & Hostels',
    icon: Bus,
    children: [
      { id: 'inst-transport', label: 'Transport Routes', icon: Bus },
      { id: 'inst-hostels', label: 'Hostels & Dorms', icon: Building2 }
    ]
  },
  { id: 'inst-reports', label: 'Reports', icon: BarChart3 },
  {
    id: 'grp-settings',
    label: 'Settings',
    icon: Settings,
    children: [
      { id: 'inst-settings', label: 'Institute Profile', icon: Building2 },
      { id: 'inst-settings-locations', label: 'Locations', icon: Boxes },
      { id: 'inst-policies', label: 'Policies & Guidelines', icon: FileText },
      { id: 'inst-settings-activity', label: 'Activity Log', icon: ClipboardList },
      { id: 'inst-users', label: 'Users & Roles', icon: ShieldCheck }
    ]
  },
  { id: 'inst-my-account', label: 'My Account', icon: User }
]

const collectAncestorGroupIds = (items, targetRoute, ancestors = []) => {
  for (const item of items) {
    if (item.id === targetRoute && !item.children) {
      return ancestors
    }
    if (item.children) {
      const found = collectAncestorGroupIds(item.children, targetRoute, [...ancestors, item.id])
      if (found) return found
    }
  }
  return null
}

const hasActiveDescendant = (item, targetRoute) => {
  if (!item.children) return item.id === targetRoute
  return item.children.some(child => hasActiveDescendant(child, targetRoute))
}

export const InstituteAdminSidebar = ({
  currentRoute,
  onRouteChange,
  currentInstitute,
  instituteName,
  isMobileOpen = false,
  onCloseMobile = () => {}
}) => {
  const { user, logout } = useAuth()
  const { students = [] } = useAppData()
  const [collapsed, setCollapsed] = useState(false)

  const instStudentsCount = useMemo(() => {
    const instId = currentInstitute?.id
    if (!instId) return students.length
    return students.filter(s => !s.instituteId || s.instituteId === instId).length
  }, [students, currentInstitute?.id])

  const menuItems = useMemo(() => buildMenuItems(instStudentsCount), [instStudentsCount])

  const userRole = user?.role || 'institute_admin'
  const canAccessRoute = (routeId) => canRoleAccessRoute(userRole, routeId)

  const [openGroups, setOpenGroups] = useState(() => {
    const ancestors = collectAncestorGroupIds(menuItems, currentRoute) || []
    return ancestors.reduce((acc, id) => ({ ...acc, [id]: true }), {})
  })

  useEffect(() => {
    const ancestors = collectAncestorGroupIds(menuItems, currentRoute)
    if (ancestors && ancestors.length > 0) {
      setOpenGroups(prev => {
        const next = { ...prev }
        ancestors.forEach(id => { next[id] = true })
        return next
      })
    }
  }, [currentRoute, menuItems])

  const handleNavClick = (id) => {
    preloadRoute(id)
    onRouteChange(id)
    if (isMobileOpen) {
      onCloseMobile()
    }
  }

  const toggleGroup = (groupId) => {
    if (collapsed) setCollapsed(false)
    setOpenGroups(prev => ({ ...prev, [groupId]: !prev[groupId] }))
  }

  const renderMenuNodes = (nodes, depth = 0) =>
    nodes.map(item => {
      const Icon = item.icon

      if (!item.children) {
        if (!canAccessRoute(item.id)) return null
        const active = currentRoute === item.id
        return (
          <div key={item.id} className="relative">
            {active && (
              <div
                className={`absolute ${depth === 0 ? 'left-0' : '-left-[14px]'} top-1.5 bottom-1.5 w-1 bg-emerald-600 rounded-full z-10`}
              />
            )}
            <button
              type="button"
              onClick={() => handleNavClick(item.id)}
              onMouseEnter={() => preloadRoute(item.id)}
              className={`w-full flex items-center justify-between gap-2 text-left transition-all cursor-pointer group ${
                depth === 0 ? 'px-3.5 py-2.5 rounded-xl' : 'px-2.5 py-2 rounded-lg text-[13px]'
              } ${
                active
                  ? 'bg-[#ecfdf5] text-emerald-800 font-semibold shadow-2xs'
                  : 'text-slate-500 hover:text-slate-900 hover:bg-slate-50/80'
              }`}
            >
              <span className="flex items-center gap-2.5 min-w-0">
                <Icon
                  className={`${depth === 0 ? 'w-[18px] h-[18px]' : 'w-3.5 h-3.5'} shrink-0 transition-colors ${
                    active ? 'text-emerald-600' : 'text-slate-400 group-hover:text-emerald-600'
                  }`}
                />
                {(!collapsed || isMobileOpen) && <span className="truncate">{item.label}</span>}
              </span>
              {(!collapsed || isMobileOpen) && typeof item.badge === 'number' && (
                <span className="px-2 py-0.5 rounded-full bg-sky-500 text-white text-[10px] font-bold font-mono shrink-0">
                  {item.badge}
                </span>
              )}
            </button>
          </div>
        )
      }

      const groupActive = hasActiveDescendant(item, currentRoute)
      const isOpen = Boolean(openGroups[item.id])

      return (
        <div key={item.id}>
          <button
            type="button"
            onClick={() => toggleGroup(item.id)}
            className={`w-full flex items-center justify-between transition-colors cursor-pointer group ${
              depth === 0 ? 'px-3.5 py-2.5 rounded-xl' : 'px-2.5 py-2 rounded-lg text-[13px]'
            } ${
              groupActive
                ? 'text-emerald-800 bg-[#ecfdf5]/60 font-semibold'
                : 'text-slate-500 hover:text-slate-900 hover:bg-slate-50/80'
            }`}
          >
            <div className="flex items-center gap-2.5 min-w-0">
              <Icon
                className={`${depth === 0 ? 'w-[18px] h-[18px]' : 'w-3.5 h-3.5'} shrink-0 transition-colors ${
                  groupActive ? 'text-emerald-600' : 'text-slate-400 group-hover:text-emerald-600'
                }`}
              />
              {(!collapsed || isMobileOpen) && <span className="truncate">{item.label}</span>}
            </div>
            {(!collapsed || isMobileOpen) && (
              <ChevronRight
                className={`w-3.5 h-3.5 text-slate-400 shrink-0 transition-transform ${
                  isOpen ? 'rotate-90 text-emerald-600' : ''
                }`}
              />
            )}
          </button>

          {(!collapsed || isMobileOpen) && isOpen && (
            <div className="mt-1 pl-3 space-y-1 border-l-2 border-slate-100 ml-4">
              {renderMenuNodes(item.children, depth + 1)}
            </div>
          )}
        </div>
      )
    })

  return (
    <>
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
          h-full max-h-screen sidebar-navy bg-[var(--sidebar-bg)] text-[var(--sidebar-text)] border-r border-[var(--sidebar-border)] flex flex-col
          transition-all duration-300 shrink-0 select-none
        `}
      >
        {/* Top Brand Header */}
        <div className="h-14 sm:h-16 min-h-[56px] sm:min-h-[64px] flex items-center justify-between px-4 sm:px-5 border-b border-slate-100 shrink-0">
          {(!collapsed || isMobileOpen) && (
            <div className="flex items-center gap-2.5 overflow-hidden">
              <div className="w-9 h-9 rounded-xl bg-[#ecfdf5] text-emerald-800 border border-emerald-100 flex items-center justify-center shrink-0 font-bold text-xs shadow-2xs">
                <School className="w-4 h-4 text-emerald-600" />
              </div>
              <div className="flex flex-col truncate">
                <span className="text-sm font-extrabold text-slate-900 tracking-tight font-heading truncate">
                  {instituteName || 'School Administration'}
                </span>
                <span className="text-[10px] text-emerald-600 font-bold uppercase tracking-wider">
                  {user?.roleTitle || 'School Principal'}
                </span>
              </div>
            </div>
          )}

          <button
            onClick={onCloseMobile}
            className="lg:hidden text-slate-400 hover:text-slate-700 p-1.5 rounded-lg hover:bg-slate-100 transition-colors ml-auto cursor-pointer"
            title="Close Menu"
          >
            <X className="w-5 h-5" />
          </button>

          <button
            onClick={() => setCollapsed(!collapsed)}
            className="hidden lg:block text-slate-400 hover:text-slate-700 p-1.5 rounded-lg hover:bg-slate-100 transition-colors ml-auto cursor-pointer"
            title={collapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
          >
            {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
          </button>
        </div>

        {/* Navigation Menu */}
        <nav className="flex-1 py-3 px-3 space-y-1 overflow-y-auto dark-scroll text-[13.5px]">
          {renderMenuNodes(menuItems, 0)}
        </nav>

        {/* Sign Out Footer */}
        <div className="p-3 border-t border-slate-100 bg-white">
          <button
            type="button"
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
