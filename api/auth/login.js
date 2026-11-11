import crypto from 'crypto'
import { createClient } from '@supabase/supabase-js'
import { verifyLoginCredentials } from '../../server/authCore.js'

const getSupabaseClient = () => {
  const url = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL || ''
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY || ''
  if (url && url.startsWith('http') && key && !key.includes('your-anon-key')) {
    return createClient(url, key)
  }
  return null
}

/**
 * Vercel Serverless Function for POST /api/auth/login
 */
export default async function handler(req, res) {
  if (req.method === 'OPTIONS') {
    return res.status(200).end()
  }
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, error: 'Method not allowed.' })
  }

  const body = typeof req.body === 'string'
    ? (() => { try { return JSON.parse(req.body) } catch (_) { return {} } })()
    : (req.body || {})

  const result = await verifyLoginCredentials({
    email: body.email,
    password: body.password,
    supabase: getSupabaseClient()
  })

  if (!result.ok) {
    return res.status(result.status || 401).json({ success: false, error: result.error })
  }

  const sessionToken = `sess_${crypto.randomBytes(16).toString('hex')}`
  return res.status(200).json({
    success: true,
    token: sessionToken,
    user: result.user
  })
}
