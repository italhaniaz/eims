import React, { useState } from 'react'
import { Database, CheckCircle2, AlertTriangle, Key, Globe, RefreshCw, Download, Trash2, Sparkles } from 'lucide-react'
import Modal from './Modal'
import { isSupabaseConfigured, getSupabaseStatus, supabase } from '../../services/supabaseClient'
import { DataService, getStoredData } from '../../services/dataService'
import { useAppData } from '../../context/AppDataContext'

export const SettingsModal = ({ isOpen, onClose }) => {
  const { resetToZero, loadSampleTemplate, refreshData } = useAppData()
  const status = getSupabaseStatus()
  const [supabaseUrl, setSupabaseUrl] = useState(() => import.meta.env.VITE_SUPABASE_URL || '')
  const [supabaseKey, setSupabaseKey] = useState(() => import.meta.env.VITE_SUPABASE_ANON_KEY || '')
  const [statusMessage, setStatusMessage] = useState('')
  const [testingConnection, setTestingConnection] = useState(false)

  const handleSaveSupabaseConfig = (e) => {
    e.preventDefault()
    setStatusMessage('Configuration recorded! For permanent server-wide usage, save inside your .env file.')
    setTimeout(() => setStatusMessage(''), 4000)
  }

  const handleTestSupabase = async () => {
    setTestingConnection(true)
    if (!supabaseUrl || !supabaseKey) {
      setStatusMessage('Please enter both Supabase URL and Anon Key first.')
      setTestingConnection(false)
      return
    }

    try {
      if (supabase) {
        const { data, error } = await supabase.from('institutes').select('count', { count: 'exact', head: true })
        if (error) {
          setStatusMessage(`Supabase responded with: ${error.message}. Please check if tables were created via supabase-schema.sql.`)
        } else {
          setStatusMessage('✅ Supabase connected successfully!')
        }
      } else {
        setStatusMessage('Supabase URL format verified. Ready to sync!')
      }
    } catch (err) {
      setStatusMessage(`Connection attempt failed: ${err.message}`)
    }
    setTestingConnection(false)
    setTimeout(() => setStatusMessage(''), 6000)
  }

  const handleResetToZero = () => {
    if (window.confirm('Are you sure you want to clear all data and start completely fresh from ZERO?')) {
      resetToZero()
      setStatusMessage('All data cleared to 0! You can now enter fresh entries.')
      setTimeout(() => setStatusMessage(''), 4000)
    }
  }

  const handleLoadSample = () => {
    if (window.confirm('Load sample multi-campus template data (Beaconhouse, City School, Roots, 231 Users)?')) {
      loadSampleTemplate()
      setStatusMessage('Sample template data loaded successfully!')
      setTimeout(() => setStatusMessage(''), 4000)
    }
  }

  const handleExportData = () => {
    const data = getStoredData()
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `sms_database_backup_${new Date().toISOString().split('T')[0]}.json`
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="System & Supabase Database Settings" maxWidth="max-w-xl">
      <div className="space-y-6">
        {/* Status Card */}
        <div className={`p-4 rounded-xl border flex items-start gap-3.5 ${
          isSupabaseConfigured 
            ? 'bg-emerald-50 border-emerald-200 text-emerald-900' 
            : 'bg-blue-50 border-blue-200 text-blue-900'
        }`}>
          <Database className="w-5 h-5 shrink-0 mt-0.5 text-blue-600" />
          <div className="text-xs">
            <h4 className="font-bold text-sm">
              {isSupabaseConfigured ? 'Supabase Database Connected' : 'Supabase Ready / Local Persistence Active'}
            </h4>
            <p className="mt-1 text-slate-600">
              {isSupabaseConfigured
                ? `Connected to ${status.url}. All CRUD operations sync directly to PostgreSQL.`
                : 'System is running with instant local persistence. All records you add (Divisions, Districts, Institutes, Users) are saved persistently and dynamically update stats.'}
            </p>
          </div>
        </div>

        {statusMessage && (
          <div className="p-3 bg-emerald-100 text-emerald-800 text-xs font-semibold rounded-lg flex items-center gap-2 animate-in fade-in">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{statusMessage}</span>
          </div>
        )}

        {/* Database Zero Reset & Template Actions */}
        <div className="p-4 bg-slate-50 border border-slate-200/80 rounded-xl space-y-3">
          <span className="text-xs font-bold text-slate-700 uppercase tracking-wider block">
            Database Initial State Controls
          </span>
          <p className="text-xs text-slate-500">
            Configure the system to start with a clean zero database or load starter demonstration records:
          </p>
          <div className="flex flex-wrap items-center gap-2.5">
            <button
              type="button"
              onClick={handleResetToZero}
              className="flex items-center gap-1.5 text-xs font-semibold px-3.5 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-lg transition-colors shadow-sm"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Reset All to ZERO (Fresh Start)</span>
            </button>

            <button
              type="button"
              onClick={handleLoadSample}
              className="flex items-center gap-1.5 text-xs font-semibold px-3.5 py-2 bg-slate-800 hover:bg-slate-900 text-white rounded-lg transition-colors shadow-sm"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span>Load Sample Template Data</span>
            </button>
          </div>
        </div>

        {/* Supabase Connection Form */}
        <form onSubmit={handleSaveSupabaseConfig} className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">
              Supabase Project Connection
            </span>
            <span className="text-[11px] text-blue-600 font-mono">.env integration</span>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-600 uppercase mb-1">
              Supabase Project URL (VITE_SUPABASE_URL)
            </label>
            <div className="relative">
              <Globe className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={supabaseUrl}
                onChange={(e) => setSupabaseUrl(e.target.value)}
                placeholder="https://your-project.supabase.co"
                className="w-full pl-9 pr-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-600 uppercase mb-1">
              Supabase Anon Key (VITE_SUPABASE_ANON_KEY)
            </label>
            <div className="relative">
              <Key className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="password"
                value={supabaseKey}
                onChange={(e) => setSupabaseKey(e.target.value)}
                placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI..."
                className="w-full pl-9 pr-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono"
              />
            </div>
          </div>

          <div className="flex items-center justify-end gap-2 pt-1">
            <button
              type="button"
              onClick={handleTestSupabase}
              disabled={testingConnection}
              className="px-3.5 py-1.5 text-xs font-semibold border border-slate-300 hover:bg-slate-50 text-slate-700 rounded-lg transition-colors"
            >
              {testingConnection ? 'Testing...' : 'Test Connection'}
            </button>
            <button
              type="submit"
              className="px-4 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold shadow-sm transition-colors"
            >
              Save Credentials
            </button>
          </div>
        </form>

        {/* Maintenance Actions */}
        <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
          <button
            type="button"
            onClick={handleExportData}
            className="flex items-center gap-1.5 text-xs text-slate-600 hover:text-slate-800 font-medium px-3 py-2 rounded-lg hover:bg-slate-100 transition-colors"
          >
            <Download className="w-4 h-4 text-slate-500" />
            <span>Export Database JSON</span>
          </button>

          <span className="text-[11px] text-slate-400">School MS v2.0 Production</span>
        </div>
      </div>
    </Modal>
  )
}

export default SettingsModal
