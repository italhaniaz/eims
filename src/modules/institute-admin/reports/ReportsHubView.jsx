import React from 'react'
import {
  ArrowLeft,
  FileText,
  UserPlus,
  CreditCard,
  Receipt,
  ArrowDownCircle,
  MessageSquare,
  TrendingUp,
  BarChart3,
  ArrowUpCircle,
  AlertTriangle,
  History,
  Calendar,
  Users,
  AlertCircle,
  UserX,
  CalendarX,
  ClipboardCheck,
  Boxes
} from 'lucide-react'

const REPORT_SECTIONS = [
  {
    title: 'Finance & Accounts',
    items: [
      { label: 'Financial Dashboard', route: 'inst-accounts', icon: BarChart3, color: 'text-sky-600' },
      { label: 'Fee Collection Report', route: 'inst-accounts-collection', icon: Receipt, color: 'text-emerald-600' },
      { label: 'Other Income', route: 'inst-accounts-income', icon: ArrowUpCircle, color: 'text-teal-600' },
      { label: 'Expenses', route: 'inst-accounts-expenses', icon: ArrowDownCircle, color: 'text-rose-600' }
    ]
  },
  {
    title: 'Billing & Fees',
    items: [
      { label: 'Outstanding Fees', route: 'inst-fees-outstanding', icon: AlertTriangle, color: 'text-amber-600' },
      { label: 'Billing History', route: 'inst-fees-history', icon: History, color: 'text-indigo-600' }
    ]
  },
  {
    title: 'Attendance',
    items: [
      { label: 'Student Attendance', route: 'inst-attendance-student-report', icon: Calendar, color: 'text-sky-600' },
      { label: 'Staff Attendance', route: 'inst-attendance-staff-report', icon: Users, color: 'text-emerald-600' },
      { label: 'Low Attendance', route: 'inst-attendance-low', icon: AlertCircle, color: 'text-amber-600' },
      { label: 'Consecutive Absences', route: 'inst-attendance-consecutive', icon: UserX, color: 'text-rose-600' },
      { label: 'Unmarked Classes', route: 'inst-attendance-unmarked', icon: CalendarX, color: 'text-slate-600' }
    ]
  },
  {
    title: 'Students & Results',
    items: [
      { label: 'Performance Reports', route: 'inst-reports-students', icon: TrendingUp, color: 'text-emerald-600' },
      { label: 'Result Summary', route: 'inst-exams-result-summary', icon: ClipboardCheck, color: 'text-indigo-600' },
      { label: 'Admission Inquiries', route: 'inst-admissions-inquiries', icon: UserPlus, color: 'text-sky-600' }
    ]
  },
  {
    title: 'Staff & Payroll',
    items: [
      { label: 'HR Reports', route: 'inst-staff-reports', icon: BarChart3, color: 'text-sky-600' },
      { label: 'Payroll', route: 'inst-payroll', icon: CreditCard, color: 'text-emerald-600' }
    ]
  },
  {
    title: 'Inventory',
    items: [
      { label: 'Inventory Reports', route: 'inst-inventory-reports', icon: Boxes, color: 'text-teal-600' },
      { label: 'Issue History', route: 'inst-inventory-issue', icon: History, color: 'text-indigo-600' }
    ]
  }
]

export const ReportsHubView = ({
  onRouteChange,
  onOpenQuickPayment,
  onOpenSendSms
}) => {
  return (
    <div className="space-y-5">
      {/* Page Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <FileText className="w-5 h-5 text-slate-600" />
            <h1 className="text-xl font-bold text-slate-900 tracking-tight">Reports</h1>
          </div>
          <button
            type="button"
            onClick={() => onRouteChange?.('inst-dashboard')}
            className="mt-0.5 inline-flex items-center gap-1 text-xs font-medium text-slate-500 hover:text-slate-800 transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back</span>
          </button>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => onRouteChange?.('inst-admissions-enroll')}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold shadow-sm transition-colors cursor-pointer"
          >
            <UserPlus className="w-3.5 h-3.5" />
            <span>New Enrollment</span>
          </button>
          <button
            type="button"
            onClick={() => onOpenQuickPayment?.()}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-orange-500 hover:bg-orange-600 text-white text-xs font-semibold shadow-sm transition-colors cursor-pointer"
          >
            <CreditCard className="w-3.5 h-3.5" />
            <span>Add Payment</span>
          </button>
          <button
            type="button"
            onClick={() => onRouteChange?.('inst-fees')}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold shadow-sm transition-colors cursor-pointer"
          >
            <Receipt className="w-3.5 h-3.5" />
            <span>Generate Invoice</span>
          </button>
          <button
            type="button"
            onClick={() => onRouteChange?.('inst-accounts-expenses')}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 text-xs font-semibold shadow-sm transition-colors cursor-pointer"
          >
            <ArrowDownCircle className="w-3.5 h-3.5" />
            <span>Manage Expense</span>
          </button>
          <button
            type="button"
            onClick={() => (onOpenSendSms ? onOpenSendSms() : onRouteChange?.('inst-communication-sms'))}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 text-xs font-semibold shadow-sm transition-colors cursor-pointer"
          >
            <MessageSquare className="w-3.5 h-3.5" />
            <span>Send SMS</span>
          </button>
        </div>
      </div>

      {/* Section Title */}
      <div>
        <div className="flex items-center gap-2 text-base font-bold text-slate-800">
          <TrendingUp className="w-4 h-4 text-slate-700" />
          <span>Reports</span>
        </div>
        <p className="text-xs text-slate-500 mt-0.5">
          Every report in one place. Each one also sits in its own menu.
        </p>
      </div>

      {/* 6 Category Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {REPORT_SECTIONS.map((section) => (
          <div
            key={section.title}
            className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden"
          >
            <div className="px-5 py-3.5 border-b border-slate-100">
              <h2 className="text-xs font-bold text-slate-800">{section.title}</h2>
            </div>
            <div className="p-3 space-y-1">
              {section.items.map((item) => {
                const Icon = item.icon
                return (
                  <button
                    key={item.route}
                    type="button"
                    onClick={() => onRouteChange?.(item.route)}
                    className="w-full px-2.5 py-2 rounded-lg hover:bg-slate-50 text-left flex items-center gap-2.5 text-xs font-medium text-slate-700 hover:text-slate-900 transition-colors cursor-pointer"
                  >
                    <Icon className={`w-3.5 h-3.5 shrink-0 ${item.color}`} />
                    <span>{item.label}</span>
                  </button>
                )
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default ReportsHubView
