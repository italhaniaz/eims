import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || ''
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || ''

// Check if valid URL & Key are provided
export const isSupabaseConfigured = 
  Boolean(supabaseUrl && supabaseUrl.startsWith('http') && supabaseAnonKey && !supabaseAnonKey.includes('your-anon-key'))

export const supabase = isSupabaseConfigured 
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null

export const getSupabaseStatus = () => {
  return {
    isConfigured: isSupabaseConfigured,
    url: supabaseUrl ? supabaseUrl.replace(/^(https?:\/\/[^/]+).*/, '$1') : 'Not Configured',
    status: isSupabaseConfigured ? 'Connected to Supabase' : 'Offline / Local Persistence Mode (Active)'
  }
}
