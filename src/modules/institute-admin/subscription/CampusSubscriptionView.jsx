import React, { useState, useMemo } from 'react'
import {
  CreditCard,
  CheckCircle2,
  Users,
  GraduationCap,
  ShieldCheck,
  Sparkles,
  Calendar
} from 'lucide-react'
import { useAppData } from '../../../context/AppDataContext'
import { useToast } from '../../../context/ToastContext'

const SCHOOL_PLANS = [
  {
    id: 'starter-school',
    name: 'School Starter',
    priceMonthly: 6500,
    maxStudents: 350,
    maxStaff: 30,
    features: ['Admissions & Students Directory', 'Attendance & Fee Challans', 'Classes & Exam Results']
  },
  {
    id: 'growth-school',
    name: 'School Growth',
    priceMonthly: 12500,
    maxStudents: 1200,
    maxStaff: 90,
    features: ['Everything in Starter', 'Staff Payroll & Campus Accounts', 'Transport, Hostels & Inventory', 'Parent SMS & Notices']
  },
  {
    id: 'enterprise-school',
    name: 'School Enterprise',
    priceMonthly: 22000,
    maxStudents: 5000,
    maxStaff: 350,
    features: ['Unlimited Academic Modules', 'Priority Cloud Sync & Audit Logs', 'Dedicated Onboarding & Support']
  }
]

const getSubKey = (instId) => `eims_school_subscription_${instId || 'default'}`

export const CampusSubscriptionView = ({ currentInstitute, onRouteChange }) => {
  const { students = [], teachers = [] } = useAppData()
  const { toast } = useToast()
  const instId = currentInstitute?.id || 'default'

  const [subState, setSubState] = useState(() => {
    try {
      const saved = localStorage.getItem(getSubKey(instId))
      if (saved) return JSON.parse(saved)
    } catch (_) {}
    return {
      planId: 'growth-school',
      status: currentInstitute?.status || 'Active',
      billingCycle: 'Monthly',
      renewalDate: new Date(Date.now() + 30 * 86400000).toISOString().split('T')[0],
      pendingRequestPlan: null
    }
  })

  const instStudentsCount = useMemo(
    () => students.filter(s => !s.instituteId || s.instituteId === instId).length,
    [students, instId]
  )
  const instStaffCount = useMemo(
    () => teachers.filter(t => !t.instituteId || t.instituteId === instId).length,
    [teachers, instId]
  )

  const currentPlan = SCHOOL_PLANS.find(p => p.id === subState.planId) || SCHOOL_PLANS[1]

  const persistSub = (next) => {
    setSubState(next)
    try {
      localStorage.setItem(getSubKey(instId), JSON.stringify(next))
    } catch (_) {}
  }

  const handleRequestUpgrade = (plan) => {
    persistSub({
      ...subState,
      planId: plan.id,
      pendingRequestPlan: null,
      status: 'Active',
      updatedAt: new Date().toISOString()
    })
    toast.success(`School plan updated to ${plan.name}.`)
  }

  const studentUsagePct = Math.min(100, Math.round((instStudentsCount / currentPlan.maxStudents) * 100))
  const staffUsagePct = Math.min(100, Math.round((instStaffCount / currentPlan.maxStaff) * 100))

  return (
    <div className="p-4 sm:p-6 md:p-8 max-w-6xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-[var(--text)] font-heading flex items-center gap-2.5">
            <CreditCard className="w-6 h-6 text-emerald-600" />
            <span>Subscription &amp; Plan Management</span>
          </h1>
          <p className="text-xs sm:text-sm text-[var(--text-muted)] mt-1">
            Review active School Plan entitlements, capacity usage, and billing cycle for {currentInstitute?.name || 'this school'}.
          </p>
        </div>
        {onRouteChange && (
          <button
            type="button"
            onClick={() => onRouteChange('inst-my-transactions')}
            className="px-4 py-2 rounded-xl bg-[var(--surface)] border border-[var(--border)] text-xs font-semibold text-[var(--text)] hover:bg-slate-50 cursor-pointer self-start sm:self-auto"
          >
            View Billing Transactions
          </button>
        )}
      </div>

      {/* Active Plan Summary */}
      <div className="bg-[var(--surface)] border border-[var(--border)] rounded-2xl p-6 shadow-soft grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-4">
          <div className="flex flex-wrap items-center gap-2.5">
            <span className="px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 text-xs font-bold">
              {subState.status}
            </span>
            <span className="text-xs text-[var(--text-muted)] flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5" />
              Next Renewal: {subState.renewalDate}
            </span>
          </div>
          <div>
            <h2 className="text-2xl font-bold text-[var(--text)]">{currentPlan.name}</h2>
            <p className="text-sm text-[var(--text-muted)] mt-1">
              PKR {currentPlan.priceMonthly.toLocaleString()} / month • Single-School Dedicated Tenant
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/70">
              <div className="flex items-center justify-between text-xs font-semibold text-slate-700">
                <span className="flex items-center gap-1.5"><GraduationCap className="w-4 h-4 text-emerald-600" /> Students Quota</span>
                <span>{instStudentsCount} / {currentPlan.maxStudents}</span>
              </div>
              <div className="w-full h-2 rounded-full bg-slate-200 mt-2 overflow-hidden">
                <div className="h-full bg-emerald-600 rounded-full" style={{ width: `${studentUsagePct}%` }} />
              </div>
            </div>
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/70">
              <div className="flex items-center justify-between text-xs font-semibold text-slate-700">
                <span className="flex items-center gap-1.5"><Users className="w-4 h-4 text-indigo-600" /> Staff Accounts</span>
                <span>{instStaffCount} / {currentPlan.maxStaff}</span>
              </div>
              <div className="w-full h-2 rounded-full bg-slate-200 mt-2 overflow-hidden">
                <div className="h-full bg-indigo-600 rounded-full" style={{ width: `${staffUsagePct}%` }} />
              </div>
            </div>
          </div>
        </div>

        <div className="bg-emerald-50/70 border border-emerald-200 rounded-2xl p-5 space-y-3">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-emerald-800">
            <ShieldCheck className="w-4 h-4" />
            <span>Included Features</span>
          </div>
          <ul className="space-y-2 text-xs text-emerald-950">
            {currentPlan.features.map(f => (
              <li key={f} className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <span>{f}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Plans Comparison */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {SCHOOL_PLANS.map(plan => {
          const isCurrent = plan.id === currentPlan.id
          return (
            <div
              key={plan.id}
              className={`bg-[var(--surface)] rounded-2xl p-5 border shadow-soft flex flex-col justify-between gap-5 ${
                isCurrent ? 'border-emerald-600 ring-2 ring-emerald-500/15' : 'border-[var(--border)]'
              }`}
            >
              <div>
                <div className="flex items-center justify-between">
                  <h3 className="text-base font-bold text-[var(--text)]">{plan.name}</h3>
                  {isCurrent && (
                    <span className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 text-[10px] font-bold uppercase">
                      Active
                    </span>
                  )}
                </div>
                <p className="text-2xl font-extrabold text-[var(--text)] mt-2">
                  PKR {plan.priceMonthly.toLocaleString()}
                  <span className="text-xs font-medium text-[var(--text-muted)]"> / month</span>
                </p>
                <p className="text-xs text-[var(--text-muted)] mt-1">
                  Up to {plan.maxStudents.toLocaleString()} students • {plan.maxStaff} staff accounts
                </p>
                <ul className="mt-4 space-y-2 text-xs text-[var(--text)]">
                  {plan.features.map(f => (
                    <li key={f} className="flex items-start gap-2">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                      <span>{f}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <button
                type="button"
                disabled={isCurrent}
                onClick={() => handleRequestUpgrade(plan)}
                className={`w-full py-2.5 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors cursor-pointer ${
                  isCurrent
                    ? 'bg-slate-100 text-slate-500 cursor-default'
                    : 'bg-emerald-600 hover:bg-emerald-700 text-white'
                }`}
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>{isCurrent ? 'Current School Plan' : `Switch to ${plan.name}`}</span>
              </button>
            </div>
          )
        })}
      </div>
    </div>
  )
}

export default CampusSubscriptionView
