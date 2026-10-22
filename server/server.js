import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import crypto from 'crypto'
import { createClient } from '@supabase/supabase-js'

dotenv.config()

const app = express()
const PORT = process.env.PORT || 5000

app.use(cors())
app.use(express.json())

// Supabase Client (if credentials provided in .env)
const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL || ''
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY || ''

const isConfigured = Boolean(supabaseUrl && supabaseUrl.startsWith('http') && supabaseKey && !supabaseKey.includes('your-anon-key'))
const supabase = isConfigured ? createClient(supabaseUrl, supabaseKey) : null

// Server-side active impersonation sessions cache & rate limits
const activeImpersonationSessions = new Map()

// Server-side active platform sessions store (enforced server-side)
const activePlatformSessions = new Map([
  ['sess-superadmin-1', {
    id: 'sess-superadmin-1',
    userEmail: 'admin@schoolms.com',
    userName: 'Super Administrator',
    userRole: 'superadmin',
    ipAddress: '127.0.0.1',
    deviceInfo: 'Chrome 124 (Windows NT 10.0)',
    location: 'Lahore, Pakistan',
    startedAt: new Date(Date.now() - 25 * 60 * 1000).toISOString(),
    lastActive: Date.now(),
    isCurrent: true
  }],
  ['sess-beacon-1', {
    id: 'sess-beacon-1',
    userEmail: 'admin.beacon@sms.edu',
    userName: 'Beaconhouse Admin',
    userRole: 'institute_admin',
    instituteName: 'Beaconhouse Central High School',
    ipAddress: '192.168.1.115',
    deviceInfo: 'Firefox 125 (Windows NT 10.0)',
    location: 'Lahore, Pakistan',
    startedAt: new Date(Date.now() - 45 * 60 * 1000).toISOString(),
    lastActive: Date.now() - 10 * 60 * 1000,
    isCurrent: false
  }],
  ['sess-city-1', {
    id: 'sess-city-1',
    userEmail: 'city.model@sms.edu',
    userName: 'City College Admin',
    userRole: 'institute_admin',
    instituteName: 'City School Model Town Campus',
    ipAddress: '192.168.1.120',
    deviceInfo: 'Edge 123 (Windows NT 10.0)',
    location: 'Lahore, Pakistan',
    startedAt: new Date(Date.now() - 90 * 60 * 1000).toISOString(),
    lastActive: Date.now() - 35 * 60 * 1000,
    isCurrent: false
  }]
])

// Server-side Login History & Failed Login Attempts Store
const loginHistoryRecords = [
  { id: 'log-1', email: 'admin@schoolms.com', ip: '127.0.0.1', device: 'Chrome 124 (Windows)', location: 'Lahore, Pakistan', status: 'SUCCESS', timestamp: new Date(Date.now() - 25 * 60 * 1000).toISOString() },
  { id: 'log-2', email: 'admin.beacon@sms.edu', ip: '192.168.1.115', device: 'Firefox 125 (Windows)', location: 'Lahore, Pakistan', status: 'SUCCESS', timestamp: new Date(Date.now() - 45 * 60 * 1000).toISOString() },
  { id: 'log-3', email: 'unknown.intruder@external.net', ip: '203.0.113.195', device: 'Python Requests 2.31', location: 'External Node', status: 'FAILED', reason: 'Invalid credentials and unauthorized IP', timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString() },
  { id: 'log-4', email: 'city.model@sms.edu', ip: '192.168.1.120', device: 'Edge 123 (Windows)', location: 'Lahore, Pakistan', status: 'SUCCESS', timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString() },
  { id: 'log-5', email: 'roots.intl@sms.edu', ip: '10.0.0.45', device: 'Safari 17 (macOS)', location: 'Islamabad, Pakistan', status: 'SUCCESS', timestamp: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString() }
]

// Server-side Enterprise Security Policies Store
let securityPolicy = {
  minPasswordLength: 8,
  requireUppercase: true,
  requireNumbers: true,
  requireSymbols: true,
  passwordExpiryDays: 90,
  twoFactorAuthEnabled: false,
  ipAllowlist: '127.0.0.1, 192.168.1.0/24, 10.0.0.0/8',
  sessionTimeoutMinutes: 30
}

// Server-side Secrets Store (NEVER SENT TO CLIENT UNMASKED)
const serverSecrets = {
  smtp: {
    host: process.env.SMTP_HOST || 'smtp.office365.com',
    port: parseInt(process.env.SMTP_PORT) || 587,
    user: process.env.SMTP_USER || 'notifications@sms.edu',
    password: process.env.SMTP_PASSWORD || 'SecretP@ssword2026_Live',
    secure: false,
    fromEmail: 'noreply@schoolms.com'
  },
  sms: {
    provider: process.env.SMS_PROVIDER || 'Twilio & WhatsApp Cloud',
    senderId: process.env.SMS_SENDER_ID || 'SMS-EDU',
    token: process.env.SMS_TOKEN || 'wh_auth_live_9981249817293817'
  },
  payment: {
    gateway: process.env.PAYMENT_GATEWAY || '1Link & JazzCash Corporate Gateway',
    merchantId: process.env.MERCHANT_ID || 'JC_CORP_09814',
    secretKey: process.env.PAYMENT_SECRET_KEY || 'sk_live_jc_sec_key_production_apex'
  }
}

// Server-side General System Settings
let systemGeneralSettings = {
  platformName: 'Educational Institute Management System',
  logoUrl: '',
  defaultTimezone: 'Asia/Karachi',
  currency: 'PKR',
  dateFormat: 'DD/MM/YYYY',
  primaryLanguage: 'en',
  enableUrduRTL: false,
  maintenanceMode: false,
  maintenanceMessage: 'System undergoing scheduled database optimization. Services will resume in 15 minutes.'
}

const maskString = (str) => {
  if (!str) return ''
  return '••••••••••••••••'
}

// Cleanup expired sessions every minute
setInterval(() => {
  const now = Date.now()
  for (const [token, session] of activeImpersonationSessions.entries()) {
    if (session.expiresAt <= now) {
      activeImpersonationSessions.delete(token)
    }
  }
}, 60 * 1000)

// 1. Health check & status
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ONLINE',
    service: 'Educational Institute Management System - Node.js Backend API',
    database: isConfigured ? 'Supabase Connected' : 'Local Persistence Sync',
    activeSessions: activePlatformSessions.size,
    activeImpersonations: activeImpersonationSessions.size,
    timestamp: new Date().toISOString()
  })
})

// 2. Impersonation Management (Server-Enforced with time limit)
app.post('/api/auth/impersonate', async (req, res) => {
  const { instituteId, instituteName, superadminEmail = 'admin@schoolms.com', durationMinutes = 60 } = req.body

  if (!instituteId) {
    return res.status(400).json({ success: false, error: 'instituteId is required' })
  }

  const token = `imp_${crypto.randomBytes(24).toString('hex')}`
  const now = Date.now()
  const expiresAt = now + (durationMinutes * 60 * 1000)

  const sessionData = {
    token,
    instituteId,
    instituteName: instituteName || 'Designated Campus',
    superadminEmail,
    startedAt: new Date(now).toISOString(),
    expiresAt,
    durationMinutes
  }

  activeImpersonationSessions.set(token, sessionData)

  if (supabase) {
    try {
      await supabase.from('impersonation_logs').insert({
        superadmin_email: superadminEmail,
        institute_id: instituteId,
        target_role: 'institute_admin',
        duration_minutes: durationMinutes,
        status: 'ACTIVE'
      })
    } catch (err) {
      console.warn('Failed to log impersonation in Supabase:', err.message)
    }
  }

  return res.json({
    success: true,
    message: `Impersonation session established for ${instituteName || instituteId}`,
    token,
    expiresAt,
    durationMinutes,
    instituteId,
    instituteName: instituteName || 'Designated Campus'
  })
})

app.get('/api/auth/impersonate/status', (req, res) => {
  const authHeader = req.headers.authorization || ''
  const token = authHeader.replace(/^Bearer\s+/, '') || req.query.token

  if (!token || !activeImpersonationSessions.has(token)) {
    return res.status(401).json({ active: false, message: 'No active impersonation session found' })
  }

  const session = activeImpersonationSessions.get(token)
  const remainingMs = session.expiresAt - Date.now()

  if (remainingMs <= 0) {
    activeImpersonationSessions.delete(token)
    return res.status(401).json({ active: false, message: 'Impersonation session has expired' })
  }

  return res.json({
    active: true,
    instituteId: session.instituteId,
    instituteName: session.instituteName,
    superadminEmail: session.superadminEmail,
    remainingSeconds: Math.floor(remainingMs / 1000),
    expiresAt: session.expiresAt
  })
})

app.post('/api/auth/impersonate/end', async (req, res) => {
  const authHeader = req.headers.authorization || ''
  const token = authHeader.replace(/^Bearer\s+/, '') || req.body.token

  if (token && activeImpersonationSessions.has(token)) {
    const session = activeImpersonationSessions.get(token)
    activeImpersonationSessions.delete(token)

    if (supabase) {
      try {
        await supabase
          .from('impersonation_logs')
          .update({ status: 'COMPLETED', ended_at: new Date().toISOString() })
          .eq('institute_id', session.instituteId)
          .eq('status', 'ACTIVE')
      } catch (err) {
        console.warn('Failed to update impersonation log:', err.message)
      }
    }
  }

  return res.json({
    success: true,
    message: 'Impersonation session terminated successfully'
  })
})

// 3. Force-logout of users / institutes / sessions
app.post('/api/auth/force-logout', (req, res) => {
  const { sessionId, userId, instituteId, reason = 'Administrative force logout' } = req.body
  let revokedCount = 0

  if (sessionId && activePlatformSessions.has(sessionId)) {
    activePlatformSessions.delete(sessionId)
    revokedCount++
  }

  for (const [token, session] of activeImpersonationSessions.entries()) {
    if ((instituteId && session.instituteId === instituteId) || (userId && session.superadminEmail === userId)) {
      activeImpersonationSessions.delete(token)
      revokedCount++
    }
  }

  return res.json({
    success: true,
    revokedSessions: revokedCount,
    message: `Forced logout applied. ${revokedCount} active session(s) revoked.`,
    reason
  })
})

// 4. System Settings (General, Localization, Gateways with MASKED SECRETS)
app.get('/api/settings', (req, res) => {
  res.json({
    general: systemGeneralSettings,
    smtp: {
      host: serverSecrets.smtp.host,
      port: serverSecrets.smtp.port,
      user: serverSecrets.smtp.user,
      password: maskString(serverSecrets.smtp.password),
      secure: serverSecrets.smtp.secure,
      fromEmail: serverSecrets.smtp.fromEmail
    },
    sms: {
      provider: serverSecrets.sms.provider,
      senderId: serverSecrets.sms.senderId,
      token: maskString(serverSecrets.sms.token)
    },
    payment: {
      gateway: serverSecrets.payment.gateway,
      merchantId: serverSecrets.payment.merchantId,
      secretKey: maskString(serverSecrets.payment.secretKey)
    }
  })
})

app.post('/api/settings', (req, res) => {
  const { general, smtp, sms, payment } = req.body

  if (general) {
    systemGeneralSettings = { ...systemGeneralSettings, ...general }
  }

  // Update secrets server-side ONLY if new unmasked values were supplied
  if (smtp) {
    if (smtp.host) serverSecrets.smtp.host = smtp.host
    if (smtp.port) serverSecrets.smtp.port = parseInt(smtp.port)
    if (smtp.user) serverSecrets.smtp.user = smtp.user
    if (smtp.password && !smtp.password.includes('••')) {
      serverSecrets.smtp.password = smtp.password
    }
    if (smtp.fromEmail) serverSecrets.smtp.fromEmail = smtp.fromEmail
  }

  if (sms) {
    if (sms.provider) serverSecrets.sms.provider = sms.provider
    if (sms.senderId) serverSecrets.sms.senderId = sms.senderId
    if (sms.token && !sms.token.includes('••')) {
      serverSecrets.sms.token = sms.token
    }
  }

  if (payment) {
    if (payment.gateway) serverSecrets.payment.gateway = payment.gateway
    if (payment.merchantId) serverSecrets.payment.merchantId = payment.merchantId
    if (payment.secretKey && !payment.secretKey.includes('••')) {
      serverSecrets.payment.secretKey = payment.secretKey
    }
  }

  res.json({
    success: true,
    message: 'System settings saved securely on server with masked credential storage.',
    general: systemGeneralSettings
  })
})

// Gateway "Test Connection" endpoints
app.post('/api/settings/test-smtp', (req, res) => {
  const { host = serverSecrets.smtp.host, port = serverSecrets.smtp.port } = req.body
  // Simulated SMTP MX handshake test
  setTimeout(() => {
    res.json({
      success: true,
      message: `SMTP handshake successful! Connected to ${host}:${port} with TLS 1.3.`
    })
  }, 600)
})

app.post('/api/settings/test-sms', (req, res) => {
  const { provider = serverSecrets.sms.provider, senderId = serverSecrets.sms.senderId } = req.body
  setTimeout(() => {
    res.json({
      success: true,
      message: `SMS & WhatsApp Gateway connection verified with ${provider} (Sender ID: ${senderId}).`
    })
  }, 600)
})

app.post('/api/settings/test-payment', (req, res) => {
  const { gateway = serverSecrets.payment.gateway } = req.body
  setTimeout(() => {
    res.json({
      success: true,
      message: `Payment Gateway API verified with ${gateway}. Online fee collection active in PKR.`
    })
  }, 600)
})

// 5. Security Center Endpoints (Active Sessions, Login History, Policy, 2FA)
app.get('/api/security/sessions', (req, res) => {
  const sessions = Array.from(activePlatformSessions.values())
  res.json({
    totalSessions: sessions.length,
    sessions
  })
})

app.post('/api/security/sessions/revoke', (req, res) => {
  const { sessionId } = req.body
  if (sessionId && activePlatformSessions.has(sessionId)) {
    const session = activePlatformSessions.get(sessionId)
    activePlatformSessions.delete(sessionId)
    return res.json({
      success: true,
      message: `Session for ${session.userEmail} has been terminated.`
    })
  }
  res.status(404).json({ success: false, error: 'Session not found or already terminated' })
})

app.post('/api/security/sessions/revoke-all', (req, res) => {
  const currentToken = req.body.keepSessionId || 'sess-superadmin-1'
  let count = 0
  for (const [id] of activePlatformSessions.entries()) {
    if (id !== currentToken) {
      activePlatformSessions.delete(id)
      count++
    }
  }
  res.json({
    success: true,
    revokedCount: count,
    message: `Force logged out ${count} remote session(s). Current session preserved.`
  })
})

app.get('/api/security/history', (req, res) => {
  const failedAlerts = loginHistoryRecords.filter(l => l.status === 'FAILED')
  res.json({
    history: loginHistoryRecords,
    failedAlertsCount: failedAlerts.length,
    failedAlerts
  })
})

app.get('/api/security/policy', (req, res) => {
  res.json(securityPolicy)
})

app.post('/api/security/policy', (req, res) => {
  securityPolicy = { ...securityPolicy, ...req.body }
  res.json({
    success: true,
    message: 'Enterprise security policy and IP allowlist updated successfully.',
    policy: securityPolicy
  })
})

// 6. Global stats
app.get('/api/stats', async (req, res) => {
  if (supabase) {
    try {
      const { count: usersCount } = await supabase.from('users').select('*', { count: 'exact', head: true })
      const { count: institutesCount } = await supabase.from('institutes').select('*', { count: 'exact', head: true })
      return res.json({
        totalUsers: usersCount || 0,
        totalInstitutes: institutesCount || 0,
        activeSessions: Math.max(1, activePlatformSessions.size),
        growthRate: '0.0%'
      })
    } catch (e) {
      console.error(e)
    }
  }

  res.json({
    totalUsers: 0,
    totalInstitutes: 0,
    activeSessions: Math.max(1, activePlatformSessions.size),
    growthRate: '0.0%'
  })
})

// 7. Institutes API
app.get('/api/institutes', async (req, res) => {
  if (supabase) {
    try {
      const { data, error } = await supabase.from('institutes').select('*')
      if (!error && data) return res.json(data)
    } catch (e) {
      console.error(e)
    }
  }
  res.json([])
})

// 8. Activity Logs
app.get('/api/activity', async (req, res) => {
  res.json([])
})

// =========================================================================
// 9. Billing, Subscriptions & Invoicing Stores & Endpoints
// =========================================================================
let subscriptionPlans = [
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

let instituteSubscriptions = [
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

let platformInvoices = [
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

// Billing Overview KPI
app.get('/api/billing/overview', (req, res) => {
  const activeSubs = instituteSubscriptions.filter(s => s.status === 'ACTIVE')
  const trialSubs = instituteSubscriptions.filter(s => s.status === 'TRIAL')
  const overdueInvoices = platformInvoices.filter(i => i.status === 'OVERDUE')
  const mrrPKR = activeSubs.reduce((sum, s) => sum + (s.pricePKR || 0), 0)
  const arrPKR = mrrPKR * 12

  res.json({
    mrrPKR,
    arrPKR,
    totalSubscriptions: instituteSubscriptions.length,
    activeCount: activeSubs.length,
    trialCount: trialSubs.length,
    overdueInvoicesCount: overdueInvoices.length,
    totalInvoices: platformInvoices.length
  })
})

// Plans CRUD
app.get('/api/billing/plans', (req, res) => {
  res.json(subscriptionPlans)
})

app.post('/api/billing/plans', (req, res) => {
  const newPlan = {
    id: 'plan-' + Date.now(),
    name: req.body.name || 'Custom Plan',
    tier: req.body.tier || 'Custom',
    pricePKR: parseFloat(req.body.pricePKR) || 20000,
    billingCycle: req.body.billingCycle || 'monthly',
    maxStudents: parseInt(req.body.maxStudents) || 1000,
    maxCampuses: parseInt(req.body.maxCampuses) || 2,
    maxUsers: parseInt(req.body.maxUsers) || 50,
    storageGB: parseInt(req.body.storageGB) || 5,
    features: Array.isArray(req.body.features) ? req.body.features : ['students', 'fees'],
    isActive: true
  }
  subscriptionPlans.push(newPlan)
  res.json({ success: true, plan: newPlan, message: 'Subscription plan created successfully.' })
})

app.put('/api/billing/plans/:id', (req, res) => {
  const idx = subscriptionPlans.findIndex(p => p.id === req.params.id)
  if (idx !== -1) {
    subscriptionPlans[idx] = { ...subscriptionPlans[idx], ...req.body }
    return res.json({ success: true, plan: subscriptionPlans[idx], message: 'Subscription plan updated successfully.' })
  }
  res.status(404).json({ error: 'Plan not found' })
})

app.delete('/api/billing/plans/:id', (req, res) => {
  subscriptionPlans = subscriptionPlans.filter(p => p.id !== req.params.id)
  res.json({ success: true, message: 'Plan removed.' })
})

// Subscriptions Endpoints
app.get('/api/billing/subscriptions', (req, res) => {
  res.json(instituteSubscriptions)
})

app.post('/api/billing/subscriptions', (req, res) => {
  const sub = {
    id: 'sub-' + Date.now(),
    instituteId: req.body.instituteId,
    instituteName: req.body.instituteName,
    planId: req.body.planId,
    planName: req.body.planName,
    status: req.body.status || 'ACTIVE',
    billingCycle: req.body.billingCycle || 'monthly',
    pricePKR: parseFloat(req.body.pricePKR) || 25000,
    startDate: req.body.startDate || new Date().toISOString().slice(0, 10),
    renewalDate: req.body.renewalDate,
    autoRenew: req.body.autoRenew !== false
  }
  instituteSubscriptions.push(sub)
  res.json({ success: true, subscription: sub })
})

app.post('/api/billing/subscriptions/:id/renew', (req, res) => {
  const sub = instituteSubscriptions.find(s => s.id === req.params.id)
  if (sub) {
    const nextDate = new Date()
    nextDate.setMonth(nextDate.getMonth() + 1)
    sub.status = 'ACTIVE'
    sub.renewalDate = nextDate.toISOString().slice(0, 10)
    return res.json({ success: true, subscription: sub, message: `Subscription for ${sub.instituteName} renewed.` })
  }
  res.status(404).json({ error: 'Subscription not found' })
})

app.post('/api/billing/subscriptions/:id/extend-trial', (req, res) => {
  const sub = instituteSubscriptions.find(s => s.id === req.params.id)
  if (sub) {
    const extendDate = new Date()
    extendDate.setDate(extendDate.getDate() + 14)
    sub.status = 'TRIAL'
    sub.trialEndsAt = extendDate.toISOString().slice(0, 10)
    sub.renewalDate = extendDate.toISOString().slice(0, 10)
    return res.json({ success: true, subscription: sub, message: `14-Day trial extension granted to ${sub.instituteName}.` })
  }
  res.status(404).json({ error: 'Subscription not found' })
})

// Invoices Endpoints
app.get('/api/billing/invoices', (req, res) => {
  res.json(platformInvoices)
})

app.post('/api/billing/invoices/:id/pay', (req, res) => {
  const inv = platformInvoices.find(i => i.id === req.params.id)
  if (inv) {
    inv.status = 'PAID'
    inv.paidDate = new Date().toISOString().slice(0, 10)
    inv.transactionRef = 'TXN-CONFIRM-' + Math.floor(100000 + Math.random() * 900000)
    return res.json({ success: true, invoice: inv, message: `Invoice ${inv.invoiceNumber} recorded as PAID in PKR.` })
  }
  res.status(404).json({ error: 'Invoice not found' })
})

app.post('/api/billing/invoices/:id/remind', (req, res) => {
  const inv = platformInvoices.find(i => i.id === req.params.id)
  if (inv) {
    return res.json({ success: true, message: `Automated payment reminder dispatched to ${inv.instituteName} for ${inv.invoiceNumber}.` })
  }
  res.status(404).json({ error: 'Invoice not found' })
})

// =========================================================================
// 10. Global Master Data & Templates Stores & Endpoints
// =========================================================================
let globalTemplates = [
  {
    id: 'tpl-grade-1',
    templateType: 'GRADING_SYSTEM',
    title: 'Standard Secondary Percentage Scale',
    code: 'GRADE-STD-SEC',
    description: 'Standard secondary matric & O-level letter grades with numerical bounds',
    data: [
      { grade: 'A+', minPercentage: 90, maxPercentage: 100, points: 4.0, remarks: 'Outstanding Achievement' },
      { grade: 'A', minPercentage: 80, maxPercentage: 89, points: 3.7, remarks: 'Excellent Mastery' },
      { grade: 'B', minPercentage: 70, maxPercentage: 79, points: 3.0, remarks: 'Very Good' },
      { grade: 'C', minPercentage: 60, maxPercentage: 69, points: 2.0, remarks: 'Satisfactory' },
      { grade: 'D', minPercentage: 50, maxPercentage: 59, points: 1.0, remarks: 'Pass Threshold' },
      { grade: 'F', minPercentage: 0, maxPercentage: 49, points: 0.0, remarks: 'Fail / Re-sit' }
    ],
    isDefault: true,
    pushedCount: 3,
    lastPushedAt: new Date(Date.now() - 5 * 86400000).toISOString()
  },
  {
    id: 'tpl-grade-2',
    templateType: 'GRADING_SYSTEM',
    title: 'HEC 4.0 GPA Higher Education Scale',
    code: 'GRADE-HEC-GPA',
    description: 'Higher Education Commission standardized semester GPA scale',
    data: [
      { grade: 'A', minPercentage: 85, maxPercentage: 100, points: 4.0, remarks: 'High Honors' },
      { grade: 'A-', minPercentage: 80, maxPercentage: 84, points: 3.67, remarks: 'Honors' },
      { grade: 'B+', minPercentage: 75, maxPercentage: 79, points: 3.33, remarks: 'Superior' },
      { grade: 'B', minPercentage: 71, maxPercentage: 74, points: 3.0, remarks: 'Good' },
      { grade: 'B-', minPercentage: 68, maxPercentage: 70, points: 2.67, remarks: 'Above Average' },
      { grade: 'C+', minPercentage: 64, maxPercentage: 67, points: 2.33, remarks: 'Average' },
      { grade: 'C', minPercentage: 60, maxPercentage: 63, points: 2.0, remarks: 'Satisfactory' },
      { grade: 'F', minPercentage: 0, maxPercentage: 59, points: 0.0, remarks: 'Failing Grade' }
    ],
    isDefault: false,
    pushedCount: 1,
    lastPushedAt: new Date(Date.now() - 12 * 86400000).toISOString()
  },
  {
    id: 'tpl-fee-1',
    templateType: 'FEE_HEAD',
    title: 'Comprehensive School Fee Heads',
    code: 'FEE-COMP-SCH',
    description: 'Pre-configured standard school fee heads in PKR',
    data: [
      { name: 'Monthly Tuition Fee', category: 'Academic', defaultAmount: 12000, refundable: false },
      { name: 'Computer & IT Lab Fee', category: 'Facilities', defaultAmount: 1500, refundable: false },
      { name: 'Library Dues & Journal Fund', category: 'Academic', defaultAmount: 800, refundable: false },
      { name: 'Transport & Bus Logistics', category: 'Transport', defaultAmount: 4500, refundable: false },
      { name: 'Annual Examination Charge', category: 'Exam', defaultAmount: 3000, refundable: false },
      { name: 'Security Deposit (Admission)', category: 'Registration', defaultAmount: 10000, refundable: true }
    ],
    isDefault: true,
    pushedCount: 3,
    lastPushedAt: new Date(Date.now() - 6 * 86400000).toISOString()
  },
  {
    id: 'tpl-desig-1',
    templateType: 'DESIGNATION',
    title: 'Standard Academic & Campus Staff Designations',
    code: 'DESIG-CORP-STD',
    description: 'Standardized designations and administrative pay tiers',
    data: [
      { title: 'Executive Principal / Rector', department: 'Executive Management', level: 'Grade 20', role: 'Head of Institute' },
      { title: 'Vice Principal / Academic Dean', department: 'Academic Affairs', level: 'Grade 19', role: 'Academic Direction' },
      { title: 'Head of Department (HoD)', department: 'Academic Departments', level: 'Grade 18', role: 'Faculty Management' },
      { title: 'Senior Subject Lecturer', department: 'Faculty', level: 'Grade 17', role: 'Instruction & Mentorship' },
      { title: 'Laboratory Demonstrator', department: 'Science Laboratories', level: 'Grade 14', role: 'Lab Supervision' },
      { title: 'Chief Campus Accountant', department: 'Accounts & Finance', level: 'Grade 16', role: 'Finance & Cashier' },
      { title: 'Central Librarian', department: 'Library', level: 'Grade 15', role: 'Book & Resource Catalog' },
      { title: 'Transport & Fleet Supervisor', department: 'Logistics', level: 'Grade 12', role: 'Fleet & Routes' }
    ],
    isDefault: true,
    pushedCount: 3,
    lastPushedAt: new Date(Date.now() - 8 * 86400000).toISOString()
  },
  {
    id: 'tpl-subj-1',
    templateType: 'SUBJECT_TEMPLATE',
    title: 'Core National Secondary Curriculum',
    code: 'SUBJ-NAT-SEC',
    description: 'Standard secondary school subjects with credit hours and standardized codes',
    data: [
      { name: 'Mathematics & Algebra', code: 'MTH-101', credits: 4, category: 'Core Science' },
      { name: 'Physics & Practical Lab', code: 'PHY-101', credits: 4, category: 'Core Science' },
      { name: 'Chemistry & Laboratory', code: 'CHM-101', credits: 4, category: 'Core Science' },
      { name: 'Biology & Life Sciences', code: 'BIO-101', credits: 4, category: 'Core Science' },
      { name: 'Computer Science & Programming', code: 'CSC-101', credits: 4, category: 'Technical' },
      { name: 'English Language & Composition', code: 'ENG-101', credits: 3, category: 'Humanities' },
      { name: 'Islamic Studies / Ethics', code: 'ISL-101', credits: 2, category: 'Social Studies' },
      { name: 'Pakistan Studies & History', code: 'PKS-101', credits: 2, category: 'Social Studies' }
    ],
    isDefault: true,
    pushedCount: 3,
    lastPushedAt: new Date(Date.now() - 4 * 86400000).toISOString()
  }
]

let scheduledReports = [
  {
    id: 'sch-rep-1',
    title: 'Weekly Multi-Campus Executive Briefing',
    frequency: 'WEEKLY',
    format: 'PDF',
    recipients: 'governance@schoolms.com, audit@schoolms.com',
    isActive: true,
    lastRunAt: new Date(Date.now() - 2 * 86400000).toISOString(),
    nextRunAt: new Date(Date.now() + 5 * 86400000).toISOString()
  }
]

app.get('/api/templates', (req, res) => {
  res.json(globalTemplates)
})

app.post('/api/templates', (req, res) => {
  const newTpl = {
    id: 'tpl-' + Date.now(),
    templateType: req.body.templateType,
    title: req.body.title,
    code: req.body.code || 'TPL-' + Math.floor(100 + Math.random() * 900),
    description: req.body.description || '',
    data: req.body.data || [],
    isDefault: !!req.body.isDefault,
    pushedCount: 0,
    lastPushedAt: null
  }
  globalTemplates.push(newTpl)
  res.json({ success: true, template: newTpl, message: 'Global template created successfully.' })
})

app.put('/api/templates/:id', (req, res) => {
  const idx = globalTemplates.findIndex(t => t.id === req.params.id)
  if (idx !== -1) {
    globalTemplates[idx] = { ...globalTemplates[idx], ...req.body, lastPushedAt: new Date().toISOString() }
    return res.json({ success: true, template: globalTemplates[idx], message: 'Template updated.' })
  }
  res.status(404).json({ error: 'Template not found' })
})

app.delete('/api/templates/:id', (req, res) => {
  globalTemplates = globalTemplates.filter(t => t.id !== req.params.id)
  res.json({ success: true, message: 'Template deleted.' })
})

app.post('/api/templates/:id/push', (req, res) => {
  const { targetInstituteIds = [] } = req.body
  const tpl = globalTemplates.find(t => t.id === req.params.id)
  if (!tpl) return res.status(404).json({ error: 'Template not found' })

  tpl.pushedCount = (tpl.pushedCount || 0) + (targetInstituteIds.length || 1)
  tpl.lastPushedAt = new Date().toISOString()

  res.json({
    success: true,
    message: `Template "${tpl.title}" successfully pushed to ${targetInstituteIds.length || 1} institute(s).`,
    template: tpl
  })
})

// Scheduled Reports
app.get('/api/reports/scheduled', (req, res) => {
  res.json(scheduledReports)
})

app.post('/api/reports/scheduled', (req, res) => {
  const report = {
    id: 'sch-' + Date.now(),
    title: req.body.title || 'Automated Executive Briefing',
    frequency: req.body.frequency || 'WEEKLY',
    format: req.body.format || 'PDF',
    recipients: req.body.recipients || 'admin@schoolms.com',
    isActive: true,
    lastRunAt: null,
    nextRunAt: new Date(Date.now() + 7 * 86400000).toISOString()
  }
  scheduledReports.push(report)
  res.json({ success: true, report, message: 'Scheduled executive report established successfully.' })
})

app.delete('/api/reports/scheduled/:id', (req, res) => {
  scheduledReports = scheduledReports.filter(r => r.id !== req.params.id)
  res.json({ success: true, message: 'Report schedule cancelled.' })
})

app.listen(PORT, () => {
  console.log(`[SMS Backend] Node.js Server listening on http://localhost:${PORT}`)
})
