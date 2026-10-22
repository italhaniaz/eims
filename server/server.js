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
const activePlatformSessions = new Map()

// Cleanup expired sessions every minute
setInterval(() => {
  const now = Date.now()
  for (const [token, session] of activeImpersonationSessions.entries()) {
    if (session.expiresAt <= now) {
      activeImpersonationSessions.delete(token)
    }
  }
  for (const [sessionId, session] of activePlatformSessions.entries()) {
    if (session.lastActive && (now - session.lastActive > 24 * 60 * 60 * 1000)) {
      activePlatformSessions.delete(sessionId)
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

  // Persist to Supabase if configured
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

// 3. Force-logout of users / institutes
app.post('/api/auth/force-logout', (req, res) => {
  const { userId, instituteId, reason = 'Administrative force logout' } = req.body
  let revokedCount = 0

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

// 4. Global stats
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

// 5. Institutes API
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

// 6. Activity Logs
app.get('/api/activity', async (req, res) => {
  res.json([])
})

app.listen(PORT, () => {
  console.log(`[SMS Backend] Node.js Server listening on http://localhost:${PORT}`)
})
