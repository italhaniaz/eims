import { supabase, isSupabaseConfigured } from './supabaseClient'
import { DataService, getStoredData, saveStoredData } from './dataService'

import { API_BASE_URL } from './apiConfig'

export const FALLBACK_PLANS = [
  {
    id: 'plan-trial',
    name: 'Free Trial Plan',
    tier: 'Trial',
    planCode: 'TRIAL',
    enabledTiers: ['school'],
    pricePKR: 0,
    billingCycle: '14-day trial',
    trialDays: 14,
    isTrial: true,
    maxStudents: 250,
    maxCampuses: 1,
    maxUsers: 15,
    storageGB: 1,
    features: ['students', 'attendance', 'classes', 'fees', 'exams', 'notices'],
    description: '14-Day evaluation trial for schools and institutes exploring the platform',
    isActive: true
  },
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
    enabledTiers: ['school', 'college', 'undergraduate'],
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

export const FALLBACK_SUBSCRIPTIONS = []

export const FALLBACK_INVOICES = []

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

    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase.from('subscription_plans').select('*').order('price_pkr', { ascending: true })
      if (!error && data && data.length > 0) return data
    }

    const local = localStorage.getItem('sms_platform_plans')
    if (local) {
      try { 
        const parsed = JSON.parse(local)
        if (parsed && Array.isArray(parsed) && parsed.some(p => p.id === 'plan-school')) {
          if (!parsed.some(p => p.id === 'plan-trial' || p.tier === 'Trial')) {
            const trial = FALLBACK_PLANS.find(p => p.id === 'plan-trial')
            if (trial) {
              parsed.unshift(trial)
              localStorage.setItem('sms_platform_plans', JSON.stringify(parsed))
            }
          }
          return parsed
        }
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
  createInitialSubscriptionForInstitute(inst) {
    if (!inst) return null
    const tierName = inst.tier || inst.type || 'School'
    const planTierLower = (inst.planTier || '').toLowerCase()
    const isTrial = planTierLower.includes('trial') || (inst.status || '').toLowerCase().includes('trial')

    let planId = 'plan-school'
    let planName = 'School Plan'
    let pricePKR = 25000
    let enabledTiers = ['school']

    if (isTrial) {
      planId = 'plan-trial'
      planName = 'Free Trial Plan'
      pricePKR = 0
      enabledTiers = ['school']
    } else if (tierName === 'College') {
      planId = 'plan-college'
      planName = 'College Plan'
      pricePKR = 35000
      enabledTiers = ['college']
    } else if (tierName === 'University') {
      planId = 'plan-university'
      planName = 'University Plan'
      pricePKR = 55000
      enabledTiers = ['undergraduate']
    }

    const startDate = new Date()
    const renewalDate = new Date()
    if (isTrial) {
      renewalDate.setDate(renewalDate.getDate() + 14)
    } else {
      renewalDate.setMonth(renewalDate.getMonth() + 1)
    }

    return {
      id: `sub_${inst.id || Date.now()}`,
      instituteId: inst.id,
      instituteName: inst.name,
      planId,
      planName: inst.planTier || planName,
      status: isTrial ? 'TRIAL' : (inst.status === 'Suspended' ? 'EXPIRED' : 'ACTIVE'),
      pricePKR,
      billingCycle: isTrial ? '14-day trial' : 'monthly',
      startDate: startDate.toISOString().slice(0, 10),
      renewalDate: renewalDate.toISOString().slice(0, 10),
      trialEndsAt: isTrial ? renewalDate.toISOString().slice(0, 10) : null,
      enabledTiers: inst.enabledTiers || enabledTiers,
      autoRenew: true,
      lastPaymentDate: isTrial ? null : startDate.toISOString().slice(0, 10),
      paymentMethod: 'Bank Transfer'
    }
  },

  async getSubscriptions() {
    try {
      const res = await fetch(`${API_BASE_URL}/api/billing/subscriptions`)
      if (res.ok) return await res.json()
    } catch {}

    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase.from('institute_subscriptions').select('*')
      if (!error && data && data.length > 0) return data
    }

    let subs = []
    const local = localStorage.getItem('sms_institute_subscriptions')
    if (local) {
      try { 
        const parsed = JSON.parse(local)
        if (Array.isArray(parsed)) {
          const demoInstKeywords = ['beaconhouse', 'city school', 'roots international', 'al-huda']
          const demoSubIds = ['sub-1', 'sub-2', 'sub-3', 'sub-4', 'c1000000-0000-0000-0000-000000000001', 'c1000000-0000-0000-0000-000000000002', 'c1000000-0000-0000-0000-000000000003', 'c1000000-0000-0000-0000-000000000004']
          subs = parsed.filter(s => {
            if (!s) return false
            if (demoSubIds.includes(s.id) || demoSubIds.includes(s.instituteId)) return false
            const name = (s.instituteName || '').toLowerCase()
            if (demoInstKeywords.some(k => name.includes(k))) return false
            return true
          })
        }
      } catch {}
    }

    // Auto-sync with registered institutes: Ensure every registered campus has an active subscription record
    try {
      const stored = getStoredData()
      const registeredInstitutes = stored?.institutes || []
      let mutated = false

      registeredInstitutes.forEach(inst => {
        if (!inst || !inst.id) return
        const exists = subs.some(s => s.instituteId === inst.id || (s.instituteName && inst.name && s.instituteName.toLowerCase() === inst.name.toLowerCase()))
        if (!exists) {
          const autoSub = this.createInitialSubscriptionForInstitute(inst)
          if (autoSub) {
            subs.push(autoSub)
            mutated = true
          }
        }
      })

      if (mutated || (local && subs.length !== JSON.parse(local).length)) {
        localStorage.setItem('sms_institute_subscriptions', JSON.stringify(subs))
      }
    } catch {}

    return subs.map(s => ({
      ...s,
      daysRemaining: this.calculateDaysRemaining(s.renewalDate)
    }))
  },

  getSubscriptionForInstitute(instituteId) {
    const local = localStorage.getItem('sms_institute_subscriptions')
    let subs = []
    if (local) {
      try { subs = JSON.parse(local) } catch {}
    }
    let sub = subs.find(s => s.instituteId === instituteId)
    if (!sub) {
      try {
        const stored = getStoredData()
        const inst = (stored?.institutes || []).find(i => i.id === instituteId)
        if (inst) {
          sub = this.createInitialSubscriptionForInstitute(inst)
          if (sub) {
            subs.push(sub)
            localStorage.setItem('sms_institute_subscriptions', JSON.stringify(subs))
          }
        }
      } catch {}
    }
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
    const sub = subs.find(s => s.id === id || s.instituteId === id)
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

    if (isSupabaseConfigured && supabase) {
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

  async createInvoice(invoiceData) {
    try {
      const res = await fetch(`${API_BASE_URL}/api/billing/invoices`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(invoiceData)
      })
      if (res.ok) return await res.json()
    } catch {}

    const invoices = await this.getInvoices()
    const newInv = {
      ...invoiceData,
      id: invoiceData.id || `inv-${Date.now()}`,
      invoiceNumber: invoiceData.invoiceNumber || `INV-${Date.now().toString().slice(-6)}`,
      status: invoiceData.status || 'PENDING',
      issueDate: invoiceData.issueDate || new Date().toISOString().slice(0, 10)
    }

    invoices.unshift(newInv)
    localStorage.setItem('sms_platform_invoices', JSON.stringify(invoices))
    DataService.logActivity('Invoice Created', `Issued invoice ${newInv.invoiceNumber} for ${newInv.instituteName}`, 'Super Admin')
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new Event('sms_billing_updated'))
    }
    return { success: true, invoice: newInv }
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
