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
  ArrowLeftRight,
  User,
  MessageSquare,
  Wallet
} from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import { preloadRoute } from '../../utils/modulePreloader'

export const canRoleAccessRoute = (role, routeId) => {
  const userRole = String(role || 'institute_admin').toLowerCase()
  if (userRole === 'superadmin' || userRole === 'institute_admin' || userRole === 'school_admin') {
    return true
  }
  return routeId === 'inst-dashboard'
}

const MENU_ITEMS = [
  { id: 'inst-dashboard', label: 'Dashboard', icon: LayoutDashboard },
  {
    id: 'grp-admissions',
    label: 'Admissions',
    icon: UserCheck,
    children: [
      { id: 'inst-admissions', label: 'Inquiries & Applications', icon: UserCheck },
      { id: 'inst-certificates', label: 'SLC & Certificates', icon: FileBadge }
    ]
  },
  {
    id: 'grp-students',
    label: 'Students',
    icon: GraduationCap,
    children: [
      { id: 'inst-students', label: 'Students Directory', icon: GraduationCap },
      { id: 'inst-learning', label: 'Homework & Learning', icon: Laptop }
    ]
  },
  {
    id: 'grp-attendance',
    label: 'Attendance',
    icon: CalendarCheck,
    children: [
      { id: 'inst-attendance', label: 'Daily Attendance Register', icon: CalendarCheck }
    ]
  },
  {
    id: 'grp-billing',
    label: 'Billing & Fees',
    icon: Receipt,
    children: [
      { id: 'inst-fees', label: 'Fee Invoices & Challans', icon: Receipt }
    ]
  },
  {
    id: 'grp-academics',
    label: 'Academics',
    icon: BookOpen,
    children: [
      { id: 'inst-classes', label: 'Classes & Sections', icon: BookOpen },
      { id: 'inst-subjects', label: 'Curriculum & Subjects', icon: BookMarked },
      { id: 'inst-timetable', label: 'Class Timetable', icon: Clock },
      { id: 'inst-program-levels', label: 'Grade Levels', icon: GraduationCap }
    ]
  },
  {
    id: 'grp-exams',
    label: 'Exams & Results',
    icon: Award,
    children: [
      { id: 'inst-exams', label: 'Examinations & Marks', icon: Award }
    ]
  },
  {
    id: 'grp-finance',
    label: 'Finance & Accounts',
    icon: Calculator,
    children: [
      { id: 'inst-accounts', label: 'Campus Accounts & Ledger', icon: Calculator }
    ]
  },
  {
    id: 'grp-staff',
    label: 'Staff & Payroll',
    icon: Users,
    children: [
      { id: 'inst-teachers', label: 'Faculty & Staff Roster', icon: Users },
      { id: 'inst-payroll', label: 'Payroll & Compensation', icon: CreditCard }
    ]
  },
  {
    id: 'grp-communication',
    label: 'Communication',
    icon: MessageSquare,
    children: [
      { id: 'inst-notices', label: 'Notices & Circulars', icon: Megaphone },
      { id: 'inst-events', label: 'Events & Calendar', icon: Calendar },
      { id: 'inst-communication', label: 'SMS & Email Gateway', icon: MessageSquare }
    ]
  },
  { id: 'inst-inventory', label: 'Inventory', icon: Boxes },
  { id: 'inst-library', label: 'Library', icon: BookMarked },
  {
    id: 'grp-transport-hostels',
    label: 'Transport & Hostels',
    icon: Bus,
    children: [
      { id: 'inst-transport', label: 'Transport & Fleet', icon: Bus },
      { id: 'inst-hostels', label: 'Hostels & Boarding', icon: Building2 }
    ]
  },
  { id: 'inst-reports', label: 'Reports', icon: BarChart3 },
  { id: 'inst-policies', label: 'Policies & Guidelines', icon: FileText },
  {
    id: 'grp-settings',
    label: 'Settings',
    icon: Settings,
    children: [
      { id: 'inst-settings', label: 'Campus System Settings', icon: Settings },
      { id: 'inst-users', label: 'Users & Roles', icon: ShieldCheck }
    ]
  },
  {
    id: 'grp-subscription',
    label: 'Subscription',
    icon: Wallet,
    children: [
      { id: 'inst-subscription', label: 'Plan & Billing', icon: CreditCard }
    ]
  },
  { id: 'inst-training', label: 'Training Videos', icon: PlayCircle },
  { id: 'inst-my-transactions', label: 'My Transactions', icon: ArrowLeftRight },
  { id: 'inst-my-account', label: 'My Account', icon: User }
]

export const InstituteAdminSidebar = ({
  currentRoute,
  onRouteChange,
  instituteName,
  isMobileOpen = false,
  onCloseMobile = () => {}
}) => {
  const { user, logout } = useAuth()
  const [collapsed, setCollapsed] = useState(false)

  const userRole = user?.role || 'institute_admin'
  const canAccessRoute = (routeId) => canRoleAccessRoute(userRole, routeId)

  const findGroupForRoute = (routeId) =>
    MENU_ITEMS.find(item => item.children?.some(child => child.id === routeId))?.id || null

  const [openGroups, setOpenGroups] = useState(() => {
    const activeGroup = findGroupForRoute(currentRoute)
    return activeGroup ? { [activeGroup]: true } : {}
  })

  useEffect(() => {
    const activeGroup = findGroupForRoute(currentRoute)
    if (activeGroup) {
      setOpenGroups(prev => (prev[activeGroup] ? prev : { ...prev, [activeGroup]: true }))
    }
  }, [currentRoute])

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
          {MENU_ITEMS.map(item => {
            const Icon = item.icon

            if (!item.children) {
              if (!canAccessRoute(item.id)) return null
              const active = currentRoute === item.id
              return (
                <div key={item.id} className="relative">
                  {active && (
                    <div className="absolute left-0 top-1.5 bottom-1.5 w-1 bg-emerald-600 rounded-full z-10" />
                  )}
                  <button
                    type="button"
                    onClick={() => handleNavClick(item.id)}
                    onMouseEnter={() => preloadRoute(item.id)}
                    className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl transition-all text-left cursor-pointer group ${
                      active
                        ? 'bg-[#ecfdf5] text-emerald-800 font-semibold shadow-2xs'
                        : 'text-slate-500 hover:text-slate-900 hover:bg-slate-50/80'
                    }`}
                  >
                    <Icon
                      className={`w-[18px] h-[18px] shrink-0 transition-colors ${
                        active ? 'text-emerald-600' : 'text-slate-400 group-hover:text-emerald-600'
                      }`}
                    />
                    {(!collapsed || isMobileOpen) && <span className="truncate">{item.label}</span>}
                  </button>
                </div>
              )
            }

            const allowedChildren = item.children.filter(child => canAccessRoute(child.id))
            if (allowedChildren.length === 0) return null

            const isGroupActive = allowedChildren.some(child => child.id === currentRoute)
            const isOpen = Boolean(openGroups[item.id])

            return (
              <div key={item.id}>
                <button
                  type="button"
                  onClick={() => toggleGroup(item.id)}
                  className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl transition-colors cursor-pointer group ${
                    isGroupActive
                      ? 'text-emerald-800 bg-[#ecfdf5]/60 font-semibold'
                      : 'text-slate-500 hover:text-slate-900 hover:bg-slate-50/80'
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <Icon
                      className={`w-[18px] h-[18px] shrink-0 transition-colors ${
                        isGroupActive ? 'text-emerald-600' : 'text-slate-400 group-hover:text-emerald-600'
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
                  <div className="mt-1 pl-3.5 space-y-1 border-l-2 border-slate-100 ml-5">
                    {allowedChildren.map(child => {
                      const ChildIcon = child.icon
                      const active = currentRoute === child.id
                      return (
                        <div key={child.id} className="relative">
                          {active && (
                            <div className="absolute -left-[16px] top-1.5 bottom-1.5 w-1 bg-emerald-600 rounded-full z-10" />
                          )}
                          <button
                            type="button"
                            onClick={() => handleNavClick(child.id)}
                            onMouseEnter={() => preloadRoute(child.id)}
                            className={`w-full flex items-center gap-2.5 text-left py-2 px-2.5 rounded-lg text-[13px] transition-all cursor-pointer ${
                              active
                                ? 'bg-[#ecfdf5] text-emerald-800 font-semibold'
                                : 'text-slate-500 hover:text-slate-900 hover:bg-slate-50'
                            }`}
                          >
                            <ChildIcon
                              className={`w-3.5 h-3.5 shrink-0 ${active ? 'text-emerald-600' : 'text-slate-400'}`}
                            />
                            <span className="truncate">{child.label}</span>
                          </button>
                        </div>
                      )
                    })}
                  </div>
                )}
              </div>
            )
          })}
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
