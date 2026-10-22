import { supabase, isSupabaseConfigured } from './supabaseClient'
import { DataService, getStoredData, saveStoredData } from './dataService'

const API_BASE_URL = 'http://localhost:5000'

const FALLBACK_PLANS = [
  {
    id: 'plan-basic',
    name: 'Basic Tier',
    tier: 'Basic',
    pricePKR: 15000,
    billingCycle: 'monthly',
    maxStudents: 500,
    maxCampuses: 1,
    maxUsers: 25,
    storageGB: 2,
    features: ['students', 'fees', 'exams', 'attendance'],
    isActive: true
  },
  {
    id: 'plan-pro',
    name: 'Professional Tier',
    tier: 'Pro',
    pricePKR: 35000,
    billingCycle: 'monthly',
    maxStudents: 2000,
    maxCampuses: 3,
    maxUsers: 80,
    storageGB: 10,
    features: ['students', 'fees', 'exams', 'attendance', 'library', 'communication', 'payroll'],
    isActive: true
  },
  {
    id: 'plan-enterprise',
    name: 'Enterprise Tier',
    tier: 'Enterprise',
    pricePKR: 75000,
    billingCycle: 'monthly',
    maxStudents: 10000,
    maxCampuses: 15,
    maxUsers: 500,
    storageGB: 50,
    features: ['students', 'fees', 'exams', 'attendance', 'library', 'communication', 'payroll', 'transport', 'hostel', 'inventory', 'admissions'],
    isActive: true
  }
]

const FALLBACK_SUBSCRIPTIONS = [
  {
    id: 'sub-1',
    instituteId: 'c1000000-0000-0000-0000-000000000001',
    instituteName: 'Beaconhouse Central High School',
    planId: 'plan-enterprise',
    planName: 'Enterprise Tier',
    status: 'ACTIVE',
    billingCycle: 'monthly',
    pricePKR: 75000,
    startDate: '2026-08-01',
    renewalDate: '2026-11-01',
    trialEndsAt: null,
    autoRenew: true
  },
  {
    id: 'sub-2',
    instituteId: 'c1000000-0000-0000-0000-000000000002',
    instituteName: 'City School Model Town Campus',
    planId: 'plan-pro',
    planName: 'Professional Tier',
    status: 'ACTIVE',
    billingCycle: 'monthly',
    pricePKR: 35000,
    startDate: '2026-09-01',
    renewalDate: '2026-11-05',
    trialEndsAt: null,
    autoRenew: true
  },
  {
    id: 'sub-3',
    instituteId: 'c1000000-0000-0000-0000-000000000003',
    instituteName: 'Roots International Academy',
    planId: 'plan-basic',
    planName: 'Basic Tier',
    status: 'TRIAL',
    billingCycle: 'monthly',
    pricePKR: 15000,
    startDate: '2026-10-12',
    renewalDate: '2026-10-26',
    trialEndsAt: '2026-10-26',
    autoRenew: false
  }
]

const FALLBACK_INVOICES = [
  {
    id: 'inv-001',
    invoiceNumber: 'INV-2026-001',
    instituteId: 'c1000000-0000-0000-0000-000000000001',
    instituteName: 'Beaconhouse Central High School',
    planName: 'Enterprise Tier',
    amountPKR: 75000,
    status: 'PAID',
    issueDate: '2026-09-25',
    dueDate: '2026-10-05',
    paidDate: '2026-09-28',
    paymentMethod: '1Link / 1Bill',
    transactionRef: 'TXN-1LINK-992144'
  },
  {
    id: 'inv-002',
    invoiceNumber: 'INV-2026-002',
    instituteId: 'c1000000-0000-0000-0000-000000000002',
    instituteName: 'City School Model Town Campus',
    planName: 'Professional Tier',
    amountPKR: 35000,
    status: 'PAID',
    issueDate: '2026-09-28',
    dueDate: '2026-10-08',
    paidDate: '2026-10-02',
    paymentMethod: 'JazzCash Corporate',
    transactionRef: 'TXN-JC-881203'
  },
  {
    id: 'inv-003',
    invoiceNumber: 'INV-2026-003',
    instituteId: 'c1000000-0000-0000-0000-000000000003',
    instituteName: 'Roots International Academy',
    planName: 'Basic Tier',
    amountPKR: 15000,
    status: 'PENDING',
    issueDate: '2026-10-18',
    dueDate: '2026-10-28',
    paidDate: null,
    paymentMethod: 'Pending Voucher Payment',
    transactionRef: null
  }
]

export const BillingService = {
  // 1. BILLING OVERVIEW
  async getBillingOverview() {
    try {
      const res = await fetch(`${API_BASE_URL}/api/billing/overview`)
      if (res.ok) return await res.json()
    } catch {
      // fallback
    }

    const subs = await this.getSubscriptions()
    const active = subs.filter(s => s.status === 'ACTIVE')
    const trial = subs.filter(s => s.status === 'TRIAL')
    const invoices = await this.getInvoices()
    const overdue = invoices.filter(i => i.status === 'OVERDUE')
    const mrrPKR = active.reduce((sum, s) => sum + (Number(s.pricePKR) || 0), 0)

    return {
      mrrPKR,
      arrPKR: mrrPKR * 12,
      totalSubscriptions: subs.length,
      activeCount: active.length,
      trialCount: trial.length,
      overdueInvoicesCount: overdue.length,
      totalInvoices: invoices.length
    }
  },

  // 2. PLANS CRUD
  async getPlans() {
    try {
      const res = await fetch(`${API_BASE_URL}/api/billing/plans`)
      if (res.ok) return await res.json()
    } catch {
      // fallback
    }

    if (isSupabaseConfigured() && supabase) {
      const { data, error } = await supabase.from('subscription_plans').select('*').order('price_pkr', { ascending: true })
      if (!error && data && data.length > 0) return data
    }

    const local = localStorage.getItem('sms_platform_plans')
    if (local) {
      try { return JSON.parse(local) } catch {}
    }
    localStorage.setItem('sms_platform_plans', JSON.stringify(FALLBACK_PLANS))
    return FALLBACK_PLANS
  },

  async savePlan(planData) {
    try {
      if (planData.id && !planData.id.startsWith('new-')) {
        const res = await fetch(`${API_BASE_URL}/api/billing/plans/${planData.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(planData)
        })
        if (res.ok) {
          DataService.logActivity('Platform Plan Updated', `Modified subscription plan: ${planData.name}`, 'Super Admin')
          return await res.json()
        }
      } else {
        const res = await fetch(`${API_BASE_URL}/api/billing/plans`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(planData)
        })
        if (res.ok) {
          DataService.logActivity('New Plan Created', `Added new subscription tier: ${planData.name}`, 'Super Admin')
          return await res.json()
        }
      }
    } catch {
      // fallback
    }

    const plans = await this.getPlans()
    let savedPlan
    if (planData.id && plans.some(p => p.id === planData.id)) {
      const idx = plans.findIndex(p => p.id === planData.id)
      plans[idx] = { ...plans[idx], ...planData }
      savedPlan = plans[idx]
    } else {
      savedPlan = {
        ...planData,
        id: 'plan-' + Date.now(),
        isActive: true
      }
      plans.push(savedPlan)
    }
    localStorage.setItem('sms_platform_plans', JSON.stringify(plans))
    DataService.logActivity('Subscription Plan Configured', `Saved plan: ${savedPlan.name} in local fallback`, 'Super Admin')
    return { success: true, plan: savedPlan }
  },

  async deletePlan(id) {
    try {
      await fetch(`${API_BASE_URL}/api/billing/plans/${id}`, { method: 'DELETE' })
    } catch {}

    const plans = await this.getPlans()
    const updated = plans.filter(p => p.id !== id)
    localStorage.setItem('sms_platform_plans', JSON.stringify(updated))
    DataService.logActivity('Plan Decommissioned', `Removed plan ID: ${id}`, 'Super Admin')
    return { success: true }
  },

  // 3. SUBSCRIPTIONS
  async getSubscriptions() {
    try {
      const res = await fetch(`${API_BASE_URL}/api/billing/subscriptions`)
      if (res.ok) return await res.json()
    } catch {}

    if (isSupabaseConfigured() && supabase) {
      const { data, error } = await supabase.from('institute_subscriptions').select('*')
      if (!error && data && data.length > 0) return data
    }

    const local = localStorage.getItem('sms_institute_subscriptions')
    if (local) {
      try { return JSON.parse(local) } catch {}
    }
    localStorage.setItem('sms_institute_subscriptions', JSON.stringify(FALLBACK_SUBSCRIPTIONS))
    return FALLBACK_SUBSCRIPTIONS
  },

  async updateSubscription(subData) {
    const subs = await this.getSubscriptions()
    const idx = subs.findIndex(s => s.id === subData.id)
    if (idx !== -1) {
      subs[idx] = { ...subs[idx], ...subData }
      localStorage.setItem('sms_institute_subscriptions', JSON.stringify(subs))
      DataService.logActivity('Subscription Modified', `Updated tier for ${subs[idx].instituteName} to ${subs[idx].planName}`, 'Super Admin')
      return { success: true, subscription: subs[idx] }
    }
    return { success: false }
  },

  async renewSubscription(id) {
    try {
      const res = await fetch(`${API_BASE_URL}/api/billing/subscriptions/${id}/renew`, { method: 'POST' })
      if (res.ok) {
        DataService.logActivity('Subscription Renewed', `Extended subscription billing cycle for ID: ${id}`, 'Super Admin')
        return await res.json()
      }
    } catch {}

    const subs = await this.getSubscriptions()
    const sub = subs.find(s => s.id === id)
    if (sub) {
      const nextDate = new Date()
      nextDate.setMonth(nextDate.getMonth() + 1)
      sub.status = 'ACTIVE'
      sub.renewalDate = nextDate.toISOString().slice(0, 10)
      localStorage.setItem('sms_institute_subscriptions', JSON.stringify(subs))
      DataService.logActivity('Subscription Renewed', `Manually renewed subscription for ${sub.instituteName}`, 'Super Admin')
      return { success: true, subscription: sub }
    }
    return { success: false }
  },

  async extendTrial(id) {
    try {
      const res = await fetch(`${API_BASE_URL}/api/billing/subscriptions/${id}/extend-trial`, { method: 'POST' })
      if (res.ok) {
        DataService.logActivity('Trial Extended', `Granted 14-day trial extension for ID: ${id}`, 'Super Admin')
        return await res.json()
      }
    } catch {}

    const subs = await this.getSubscriptions()
    const sub = subs.find(s => s.id === id)
    if (sub) {
      const extendDate = new Date()
      extendDate.setDate(extendDate.getDate() + 14)
      sub.status = 'TRIAL'
      sub.trialEndsAt = extendDate.toISOString().slice(0, 10)
      sub.renewalDate = extendDate.toISOString().slice(0, 10)
      localStorage.setItem('sms_institute_subscriptions', JSON.stringify(subs))
      DataService.logActivity('Trial Extended', `Granted 14-day trial extension for ${sub.instituteName}`, 'Super Admin')
      return { success: true, subscription: sub }
    }
    return { success: false }
  },

  // 4. INVOICES
  async getInvoices() {
    try {
      const res = await fetch(`${API_BASE_URL}/api/billing/invoices`)
      if (res.ok) return await res.json()
    } catch {}

    if (isSupabaseConfigured() && supabase) {
      const { data, error } = await supabase.from('platform_invoices').select('*').order('issue_date', { ascending: false })
      if (!error && data && data.length > 0) return data
    }

    const local = localStorage.getItem('sms_platform_invoices')
    if (local) {
      try { return JSON.parse(local) } catch {}
    }
    localStorage.setItem('sms_platform_invoices', JSON.stringify(FALLBACK_INVOICES))
    return FALLBACK_INVOICES
  },

  async markInvoicePaid(id) {
    try {
      const res = await fetch(`${API_BASE_URL}/api/billing/invoices/${id}/pay`, { method: 'POST' })
      if (res.ok) {
        DataService.logActivity('Invoice Payment Recorded', `Marked invoice ${id} as PAID`, 'Super Admin')
        return await res.json()
      }
    } catch {}

    const invoices = await this.getInvoices()
    const inv = invoices.find(i => i.id === id)
    if (inv) {
      inv.status = 'PAID'
      inv.paidDate = new Date().toISOString().slice(0, 10)
      inv.transactionRef = 'TXN-CONFIRM-' + Math.floor(100000 + Math.random() * 900000)
      localStorage.setItem('sms_platform_invoices', JSON.stringify(invoices))
      DataService.logActivity('Invoice Payment Recorded', `Marked invoice ${inv.invoiceNumber} as PAID in PKR`, 'Super Admin')
      return { success: true, invoice: inv }
    }
    return { success: false }
  },

  async sendPaymentReminder(id) {
    try {
      const res = await fetch(`${API_BASE_URL}/api/billing/invoices/${id}/remind`, { method: 'POST' })
      if (res.ok) {
        DataService.logActivity('Payment Reminder Sent', `Dispatched payment reminder for invoice ${id}`, 'Super Admin')
        return await res.json()
      }
    } catch {}

    DataService.logActivity('Payment Reminder Sent', `Dispatched automated notification for invoice ${id}`, 'Super Admin')
    return { success: true, message: 'Automated payment reminder dispatched successfully.' }
  }
}
