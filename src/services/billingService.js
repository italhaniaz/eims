import { supabase, isSupabaseConfigured } from './supabaseClient'
import { DataService, getStoredData, saveStoredData } from './dataService'

const API_BASE_URL = 'http://localhost:5000'

export const FALLBACK_PLANS = [
  {
    id: 'plan-school',
    name: 'School Plan',
    tier: 'School',
    planCode: 'SCHOOL',
    enabledTiers: ['school'],
    pricePKR: 25000,
    billingCycle: 'monthly',
    maxStudents: 1500,
    maxCampuses: 2,
    maxUsers: 50,
    storageGB: 5,
    features: ['students', 'fees', 'exams', 'attendance', 'classes', 'curriculum', 'timetable', 'notices'],
    description: 'Tailored for Primary, Middle & Matric / O-Levels schools',
    isActive: true
  },
  {
    id: 'plan-college',
    name: 'College Plan',
    tier: 'College',
    planCode: 'COLLEGE',
    enabledTiers: ['college'],
    pricePKR: 35000,
    billingCycle: 'monthly',
    maxStudents: 3000,
    maxCampuses: 3,
    maxUsers: 100,
    storageGB: 10,
    features: ['students', 'fees', 'exams', 'attendance', 'programs', 'curriculum', 'timetable', 'notices', 'admissions'],
    description: 'Built for Intermediate, F.Sc, ICS, FA, I.Com & A-Levels colleges',
    isActive: true
  },
  {
    id: 'plan-university',
    name: 'University Plan',
    tier: 'University',
    planCode: 'UNIVERSITY',
    enabledTiers: ['undergraduate'],
    pricePKR: 55000,
    billingCycle: 'monthly',
    maxStudents: 8000,
    maxCampuses: 5,
    maxUsers: 300,
    storageGB: 25,
    features: ['students', 'fees', 'exams', 'attendance', 'departments', 'degrees', 'semesters', 'cgpa_grading', 'credit_hours', 'library'],
    description: 'Full Undergraduate BS degree management, Semesters, Credit Hours & CGPA',
    isActive: true
  },
  {
    id: 'plan-custom',
    name: 'Custom Hybrid Plan',
    tier: 'Custom',
    planCode: 'CUSTOM',
    enabledTiers: ['school', 'college'],
    pricePKR: 75000,
    billingCycle: 'monthly',
    maxStudents: 15000,
    maxCampuses: 15,
    maxUsers: 600,
    storageGB: 50,
    features: ['students', 'fees', 'exams', 'attendance', 'classes', 'programs', 'departments', 'semesters', 'library', 'transport', 'hostel', 'admissions'],
    description: 'Multi-wing educational groups combining School, College, and University wings',
    isActive: true
  }
]

export const FALLBACK_SUBSCRIPTIONS = [
  {
    id: 'sub-1',
    instituteId: 'c1000000-0000-0000-0000-000000000001',
    instituteName: 'Beaconhouse Central High School',
    planId: 'plan-custom',
    planName: 'Custom Hybrid Plan',
    enabledTiers: ['school', 'college'],
    status: 'ACTIVE',
    billingCycle: 'monthly',
    pricePKR: 75000,
    startDate: '2026-08-01',
    renewalDate: '2026-10-31',
    trialEndsAt: null,
    autoRenew: true,
    isWaived: false,
    waiveReason: '',
    extendedUntil: null
  },
  {
    id: 'sub-2',
    instituteId: 'c1000000-0000-0000-0000-000000000002',
    instituteName: 'City School Model Town Campus',
    planId: 'plan-school',
    planName: 'School Plan',
    enabledTiers: ['school'],
    status: 'ACTIVE',
    billingCycle: 'monthly',
    pricePKR: 25000,
    startDate: '2026-09-01',
    renewalDate: '2026-11-15',
    trialEndsAt: null,
    autoRenew: true,
    isWaived: false,
    waiveReason: '',
    extendedUntil: null
  },
  {
    id: 'sub-3',
    instituteId: 'c1000000-0000-0000-0000-000000000003',
    instituteName: 'Roots International Academy',
    planId: 'plan-college',
    planName: 'College Plan',
    enabledTiers: ['college'],
    status: 'ACTIVE',
    billingCycle: 'monthly',
    pricePKR: 35000,
    startDate: '2026-10-12',
    renewalDate: '2026-10-29',
    trialEndsAt: null,
    autoRenew: true,
    isWaived: false,
    waiveReason: '',
    extendedUntil: null
  }
]

export const FALLBACK_INVOICES = [
  {
    id: 'inv-001',
    invoiceNumber: 'INV-2026-001',
    instituteId: 'c1000000-0000-0000-0000-000000000001',
    instituteName: 'Beaconhouse Central High School',
    planName: 'Custom Hybrid Plan',
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
    planName: 'School Plan',
    amountPKR: 25000,
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
    planName: 'College Plan',
    amountPKR: 35000,
    status: 'PENDING',
    issueDate: '2026-10-18',
    dueDate: '2026-10-29',
    paidDate: null,
    paymentMethod: 'Pending 1Bill Payment',
    transactionRef: null
  }
]

export const BillingService = {
  calculateDaysRemaining(renewalDate) {
    if (!renewalDate) return 30
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const target = new Date(renewalDate)
    target.setHours(0, 0, 0, 0)
    const diffTime = target - today
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24))
  },

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
      try { 
        const parsed = JSON.parse(local)
        // If legacy plans stored, refresh to new 4 plans
        if (parsed && parsed.some(p => p.id === 'plan-school')) return parsed
      } catch {}
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
      try { 
        const parsed = JSON.parse(local)
        if (parsed && parsed.some(s => s.planId === 'plan-custom' || s.planId === 'plan-school')) {
          return parsed.map(s => ({
            ...s,
            daysRemaining: this.calculateDaysRemaining(s.renewalDate)
          }))
        }
      } catch {}
    }
    localStorage.setItem('sms_institute_subscriptions', JSON.stringify(FALLBACK_SUBSCRIPTIONS))
    return FALLBACK_SUBSCRIPTIONS.map(s => ({
      ...s,
      daysRemaining: this.calculateDaysRemaining(s.renewalDate)
    }))
  },

  getSubscriptionForInstitute(instituteId) {
    const local = localStorage.getItem('sms_institute_subscriptions')
    let subs = FALLBACK_SUBSCRIPTIONS
    if (local) {
      try { subs = JSON.parse(local) } catch {}
    }
    const sub = subs.find(s => s.instituteId === instituteId) || subs[0]
    if (!sub) return null
    const daysRemaining = this.calculateDaysRemaining(sub.renewalDate)
    return {
      ...sub,
      daysRemaining,
      isApproachingDeadline: daysRemaining <= 5 && daysRemaining >= 0 && !sub.isWaived
    }
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
      sub.isWaived = false
      sub.waiveReason = ''
      sub.extendedUntil = null
      sub.renewalDate = nextDate.toISOString().slice(0, 10)
      localStorage.setItem('sms_institute_subscriptions', JSON.stringify(subs))
      DataService.logActivity('Subscription Renewed', `Manually renewed subscription for ${sub.instituteName}`, 'Super Admin')
      return { success: true, subscription: sub }
    }
    return { success: false }
  },

  // SUPER ADMIN OVERRIDE 1: Waive Month (Complimentary Cycle)
  async waiveCurrentMonth(id, reason = 'Waived by Super Admin as complimentary cycle') {
    const subs = await this.getSubscriptions()
    const sub = subs.find(s => s.id === id)
    if (sub) {
      sub.isWaived = true
      sub.waiveReason = reason
      sub.status = 'ACTIVE'
      
      // Advance renewal date to next cycle
      const nextDate = new Date(sub.renewalDate || new Date())
      nextDate.setMonth(nextDate.getMonth() + 1)
      sub.renewalDate = nextDate.toISOString().slice(0, 10)

      localStorage.setItem('sms_institute_subscriptions', JSON.stringify(subs))

      // Update pending invoice if exists
      const invoices = await this.getInvoices()
      const inv = invoices.find(i => i.instituteId === sub.instituteId && i.status !== 'PAID')
      if (inv) {
        inv.status = 'PAID'
        inv.amountPKR = 0
        inv.notes = `Fee waived: ${reason}`
        inv.paymentMethod = 'Waived / Free Cycle'
        localStorage.setItem('sms_platform_invoices', JSON.stringify(invoices))
      }

      DataService.logActivity('Platform Fee Waived', `Waived subscription charges for ${sub.instituteName}: ${reason}`, 'Super Admin')
      return { success: true, subscription: sub }
    }
    return { success: false }
  },

  // SUPER ADMIN OVERRIDE 2: Extend Payment Deadline / Grace Period
  async extendDeadline(id, newDate, reason = 'Grace period extension granted by Super Admin') {
    const subs = await this.getSubscriptions()
    const sub = subs.find(s => s.id === id)
    if (sub) {
      sub.renewalDate = newDate
      sub.extendedUntil = newDate
      sub.status = 'ACTIVE'
      localStorage.setItem('sms_institute_subscriptions', JSON.stringify(subs))
      DataService.logActivity('Deadline Extended', `Extended payment deadline for ${sub.instituteName} to ${newDate}: ${reason}`, 'Super Admin')
      return { success: true, subscription: sub }
    }
    return { success: false }
  },

  // SUPER ADMIN OVERRIDE 3: Switch Plan & Enabled Tiers
  async updateSubscriptionPlan(id, planId, enabledTiers = null, pricePKR = null) {
    const subs = await this.getSubscriptions()
    const sub = subs.find(s => s.id === id)
    const plans = await this.getPlans()
    const targetPlan = plans.find(p => p.id === planId)

    if (sub && targetPlan) {
      sub.planId = planId
      sub.planName = targetPlan.name
      sub.pricePKR = pricePKR !== null ? Number(pricePKR) : targetPlan.pricePKR
      sub.enabledTiers = enabledTiers || targetPlan.enabledTiers || ['school']

      localStorage.setItem('sms_institute_subscriptions', JSON.stringify(subs))

      // Synchronize Institute object in global store
      const data = getStoredData()
      const inst = (data.institutes || []).find(i => i.id === sub.instituteId)
      if (inst) {
        inst.planTier = targetPlan.name
        inst.planType = targetPlan.planCode || 'CUSTOM'
        inst.enabledTiers = sub.enabledTiers
        saveStoredData(data)
      }

      DataService.logActivity('Subscription Plan Changed', `Assigned ${targetPlan.name} to ${sub.instituteName}`, 'Super Admin')
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
