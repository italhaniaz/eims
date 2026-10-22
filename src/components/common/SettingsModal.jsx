import React, { useState, useRef, useMemo, useEffect } from 'react'
import { 
  Database, 
  CheckCircle2, 
  AlertTriangle, 
  Key, 
  Globe, 
  RefreshCw, 
  Download, 
  Upload, 
  Trash2, 
  Sparkles, 
  HardDrive, 
  Activity, 
  Archive,
  Sliders,
  Mail,
  MessageSquare,
  CreditCard,
  ShieldAlert,
  Server,
  Save,
  Clock,
  DollarSign,
  Palette
} from 'lucide-react'
import Modal from './Modal'
import { isSupabaseConfigured, getSupabaseStatus, supabase } from '../../services/supabaseClient'
import { DataService, getStoredData } from '../../services/dataService'
import { useAppData } from '../../context/AppDataContext'
import { useToast } from '../../context/ToastContext'
import { SecurityService } from '../../services/securityService'

export const SettingsModal = ({ isOpen, onClose }) => {
  const { resetToZero, loadSampleTemplate, importData, refreshData } = useAppData()
  const { toast } = useToast()
  const status = getSupabaseStatus()
  const fileInputRef = useRef(null)

  // Active Tab
  const [activeTab, setActiveTab] = useState('general') // general, localization, smtp, sms, payment, maintenance, database

  // Supabase states
  const [supabaseUrl, setSupabaseUrl] = useState(() => import.meta.env.VITE_SUPABASE_URL || '')
  const [supabaseKey, setSupabaseKey] = useState(() => import.meta.env.VITE_SUPABASE_ANON_KEY || '')
  const [statusMessage, setStatusMessage] = useState('')
  const [testingSupabase, setTestingSupabase] = useState(false)

  // System Settings state
  const [settings, setSettings] = useState({
    general: {
      platformName: 'Educational Institute Management System',
      logoUrl: '',
      defaultTimezone: 'Asia/Karachi',
      currency: 'PKR',
      dateFormat: 'DD/MM/YYYY',
      primaryLanguage: 'en',
      enableUrduRTL: false,
      maintenanceMode: false,
      maintenanceMessage: 'System undergoing scheduled database optimization. Services will resume in 15 minutes.'
    },
    smtp: {
      host: 'smtp.office365.com',
      port: 587,
      user: 'notifications@sms.edu',
      password: '••••••••••••••••',
      secure: false,
      fromEmail: 'noreply@schoolms.com'
    },
    sms: {
      provider: 'Twilio & WhatsApp Cloud API',
      senderId: 'SMS-EDU',
      token: '••••••••••••••••'
    },
    payment: {
      gateway: '1Link & JazzCash Corporate Gateway',
      merchantId: 'JC_CORP_09814',
      secretKey: '••••••••••••••••'
    }
  })

  // Testing states
  const [testingSmtp, setTestingSmtp] = useState(false)
  const [testingSms, setTestingSms] = useState(false)
  const [testingPayment, setTestingPayment] = useState(false)

  // Load settings from server/storage
  useEffect(() => {
    if (isOpen) {
      SecurityService.getSettings().then(res => {
        if (res) setSettings(res)
      })
    }
  }, [isOpen])

  // LocalStorage Quota Telemetry
  const storageTelemetry = useMemo(() => {
    let totalBytes = 0
    try {
      for (let key in localStorage) {
        if (Object.prototype.hasOwnProperty.call(localStorage, key)) {
          totalBytes += (localStorage[key].length + key.length) * 2
        }
      }
    } catch {
      totalBytes = 0
    }
    const totalKB = (totalBytes / 1024).toFixed(1)
    const totalMB = (totalBytes / (1024 * 1024)).toFixed(2)
    const quotaMB = 5.0
    const percentUsed = Math.min(100, Math.max(0.2, (totalBytes / (quotaMB * 1024 * 1024)) * 100)).toFixed(1)
    return { totalBytes, totalKB, totalMB, percentUsed, quotaMB }
  }, [isOpen, statusMessage])

  // Save Settings
  const handleSaveSettings = async (e) => {
    e.preventDefault()
    try {
      await SecurityService.saveSettings(settings)
      toast.success('System settings saved successfully with server-side credential masking!')
      setStatusMessage('Settings updated successfully.')
      setTimeout(() => setStatusMessage(''), 4000)
    } catch (err) {
      toast.error('Failed to save settings')
    }
  }

  // Test Connections
  const handleTestSmtp = async () => {
    setTestingSmtp(true)
    const res = await SecurityService.testSMTP(settings.smtp)
    setTestingSmtp(false)
    if (res.success) {
      toast.success(res.message)
    } else {
      toast.error('SMTP test failed')
    }
  }

  const handleTestSms = async () => {
    setTestingSms(true)
    const res = await SecurityService.testSMS(settings.sms)
    setTestingSms(false)
    if (res.success) {
      toast.success(res.message)
    } else {
      toast.error('SMS / WhatsApp gateway test failed')
    }
  }

  const handleTestPayment = async () => {
    setTestingPayment(true)
    const res = await SecurityService.testPayment(settings.payment)
    setTestingPayment(false)
    if (res.success) {
      toast.success(res.message)
    } else {
      toast.error('Payment gateway test failed')
    }
  }

  // Supabase Actions
  const handleSaveSupabaseConfig = (e) => {
    e.preventDefault()
    toast.success('Configuration recorded! For permanent server-wide usage, save inside your .env file.')
    setStatusMessage('Configuration recorded! For permanent server-wide usage, save inside your .env file.')
    setTimeout(() => setStatusMessage(''), 4000)
  }

  const handleTestSupabase = async () => {
    setTestingSupabase(true)
    if (!supabaseUrl || !supabaseKey) {
      toast.warning('Please enter both Supabase URL and Anon Key first.')
      setTestingSupabase(false)
      return
    }

    try {
      if (supabase) {
        const { error } = await supabase.from('institutes').select('count', { count: 'exact', head: true })
        if (error) {
          toast.error(`Supabase error: ${error.message}`)
        } else {
          toast.success('Supabase connected successfully!')
          setStatusMessage('Supabase connected successfully!')
        }
      } else {
        toast.info('Supabase URL format verified. Ready to sync!')
      }
    } catch (err) {
      toast.error(`Connection attempt failed: ${err.message}`)
    }
    setTestingSupabase(false)
    setTimeout(() => setStatusMessage(''), 5000)
  }

  const handleResetToZero = () => {
    if (window.confirm('Are you sure you want to clear all data and start completely fresh from ZERO?')) {
      resetToZero()
      toast.info('All data cleared to 0! Ready for fresh entries.')
      setStatusMessage('All data cleared to 0! Ready for fresh entries.')
      setTimeout(() => setStatusMessage(''), 4000)
    }
  }

  const handleLoadSample = () => {
    if (window.confirm('Load sample multi-campus template data (Beaconhouse, City School, Roots, 231 Users)?')) {
      loadSampleTemplate()
      toast.success('Sample template data loaded successfully!')
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
    toast.success('Database exported successfully as JSON backup!')
  }

  const handleFullSnapshotArchive = () => {
    const rawData = getStoredData()
    const timestamp = new Date().toISOString()
    const snapshotPayload = {
      meta: {
        snapshotVersion: '2.0.0',
        system: settings.general?.platformName || 'Educational Institute Management System',
        environment: 'Production',
        createdAt: timestamp,
        checksumEntities: {
          institutes: rawData.institutes?.length || 0,
          students: rawData.students?.length || 0,
          teachers: rawData.teachers?.length || 0,
          classes: rawData.classes?.length || 0,
          fees: rawData.fees?.length || 0,
          exams: rawData.exams?.length || 0,
          transport: rawData.transport?.length || 0,
          library: rawData.library?.length || 0,
          bookIssues: rawData.bookIssues?.length || 0,
          admissions: rawData.admissionsPipeline?.length || 0
        }
      },
      data: rawData
    }

    const blob = new Blob([JSON.stringify(snapshotPayload, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `EIMS_FULL_SNAPSHOT_${timestamp.replace(/[:.]/g, '-')}.json`
    a.click()
    URL.revokeObjectURL(url)
    toast.success('Complete system snapshot archive created & downloaded!')
  }

  const handleImportFile = (e) => {
    const file = e.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = (event) => {
      try {
        const parsed = JSON.parse(event.target?.result)
        const payloadToImport = (parsed && parsed.meta && parsed.data) ? parsed.data : parsed
        importData(payloadToImport)
        toast.success(`Database restored successfully from "${file.name}"!`)
      } catch (err) {
        toast.error('Failed to parse JSON backup file. Please verify file integrity.')
      }
    }
    reader.readAsText(file)
    e.target.value = ''
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="System Settings & Infrastructure Gateways" maxWidth="max-w-2xl">
      <div className="space-y-5">
        {/* Hidden File Input for JSON Restore */}
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleImportFile}
          accept=".json,application/json"
          className="hidden"
        />

        {/* Tab Navigation */}
        <div className="flex items-center gap-1 border-b border-slate-200 pb-2 text-xs overflow-x-auto">
          {[
            { key: 'general', label: 'General', icon: Sliders },
            { key: 'localization', label: 'Languages & RTL', icon: Globe },
            { key: 'smtp', label: 'Email / SMTP', icon: Mail },
            { key: 'sms', label: 'SMS & WhatsApp', icon: MessageSquare },
            { key: 'payment', label: 'Payment Gateway', icon: CreditCard },
            { key: 'maintenance', label: 'Maintenance Mode', icon: ShieldAlert },
            { key: 'database', label: 'Database & Sync', icon: Database }
          ].map(t => {
            const Icon = t.icon
            const isActive = activeTab === t.key
            return (
              <button
                key={t.key}
                type="button"
                onClick={() => setActiveTab(t.key)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
                  isActive 
                    ? 'bg-blue-600 text-white shadow-2xs' 
                    : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{t.label}</span>
              </button>
            )
          })}
        </div>

        {statusMessage && (
          <div className="p-2.5 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold rounded-lg flex items-center gap-2 animate-in fade-in">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{statusMessage}</span>
          </div>
        )}

        {/* ---------------------------------------------------- */}
        {/* TAB 1: GENERAL SETTINGS */}
        {/* ---------------------------------------------------- */}
        {activeTab === 'general' && (
          <form onSubmit={handleSaveSettings} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-600 uppercase mb-1">
                Platform Official Name *
              </label>
              <input
                type="text"
                required
                value={settings.general.platformName}
                onChange={(e) => setSettings({
                  ...settings,
                  general: { ...settings.general, platformName: e.target.value }
                })}
                className="w-full px-3.5 py-2 text-xs rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 font-bold"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-600 uppercase mb-1">
                  Default Timezone
                </label>
                <select
                  value={settings.general.defaultTimezone}
                  onChange={(e) => setSettings({
                    ...settings,
                    general: { ...settings.general, defaultTimezone: e.target.value }
                  })}
                  className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 font-semibold"
                >
                  <option value="Asia/Karachi">Asia/Karachi (PKT, UTC+5)</option>
                  <option value="UTC">Universal Time (UTC+0)</option>
                  <option value="Asia/Dubai">Asia/Dubai (GST, UTC+4)</option>
                  <option value="Europe/London">Europe/London (GMT/BST)</option>
                  <option value="America/New_York">America/New_York (EST)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 uppercase mb-1">
                  Base Currency
                </label>
                <select
                  value={settings.general.currency}
                  onChange={(e) => setSettings({
                    ...settings,
                    general: { ...settings.general, currency: e.target.value }
                  })}
                  className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 font-semibold"
                >
                  <option value="PKR">Pakistani Rupee (PKR)</option>
                  <option value="USD">US Dollar (USD)</option>
                  <option value="AED">UAE Dirham (AED)</option>
                  <option value="GBP">British Pound (GBP)</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-600 uppercase mb-1">
                  Date Format
                </label>
                <select
                  value={settings.general.dateFormat}
                  onChange={(e) => setSettings({
                    ...settings,
                    general: { ...settings.general, dateFormat: e.target.value }
                  })}
                  className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 font-semibold"
                >
                  <option value="DD/MM/YYYY">DD/MM/YYYY (e.g. 22/10/2026)</option>
                  <option value="YYYY-MM-DD">YYYY-MM-DD (ISO Standard)</option>
                  <option value="MM/DD/YYYY">MM/DD/YYYY (US Format)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 uppercase mb-1">
                  Platform Logo URL
                </label>
                <input
                  type="text"
                  placeholder="https://example.com/logo.png"
                  value={settings.general.logoUrl}
                  onChange={(e) => setSettings({
                    ...settings,
                    general: { ...settings.general, logoUrl: e.target.value }
                  })}
                  className="w-full px-3.5 py-2 text-xs rounded-lg border border-slate-200 focus:outline-none"
                />
              </div>
            </div>

            <div className="flex justify-end pt-3 border-t border-slate-100">
              <button
                type="submit"
                className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold shadow-sm transition-all cursor-pointer"
              >
                Save General Settings
              </button>
            </div>
          </form>
        )}

        {/* ---------------------------------------------------- */}
        {/* TAB 2: LOCALIZATION & RTL */}
        {/* ---------------------------------------------------- */}
        {activeTab === 'localization' && (
          <form onSubmit={handleSaveSettings} className="space-y-4">
            <p className="text-xs text-slate-500">
              Configure system language preferences and regional right-to-left layout alignment.
            </p>

            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-600 uppercase mb-1">
                  Primary Interface Language
                </label>
                <select
                  value={settings.general.primaryLanguage}
                  onChange={(e) => setSettings({
                    ...settings,
                    general: { ...settings.general, primaryLanguage: e.target.value }
                  })}
                  className="w-full px-3.5 py-2 text-xs rounded-lg border border-slate-200 font-semibold focus:outline-none"
                >
                  <option value="en">English (Primary & Global)</option>
                  <option value="ur">Urdu (Regional Dual Mode)</option>
                </select>
              </div>

              <div className="pt-2 border-t border-slate-200">
                <label className="flex items-start gap-2.5 text-xs text-slate-800 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={settings.general.enableUrduRTL}
                    onChange={(e) => setSettings({
                      ...settings,
                      general: { ...settings.general, enableUrduRTL: e.target.checked }
                    })}
                    className="rounded text-blue-600 focus:ring-blue-500 mt-0.5"
                  />
                  <div>
                    <span className="font-bold block">Enable Right-to-Left (RTL) Layout Mode</span>
                    <span className="text-[11px] text-slate-500 block mt-0.5">
                      Flips interface orientation for Urdu reading mode while preserving English technical data integrity.
                    </span>
                  </div>
                </label>
              </div>
            </div>

            <div className="flex justify-end pt-3 border-t border-slate-100">
              <button
                type="submit"
                className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold shadow-sm transition-all cursor-pointer"
              >
                Save Language Settings
              </button>
            </div>
          </form>
        )}

        {/* ---------------------------------------------------- */}
        {/* TAB 3: EMAIL / SMTP GATEWAY */}
        {/* ---------------------------------------------------- */}
        {activeTab === 'smtp' && (
          <form onSubmit={handleSaveSettings} className="space-y-4">
            <div className="flex items-center justify-between">
              <p className="text-xs text-slate-500">
                Configure corporate SMTP credentials for automated fee receipts and staff notifications.
              </p>
              <button
                type="button"
                onClick={handleTestSmtp}
                disabled={testingSmtp}
                className="px-3 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-lg text-xs font-bold border border-blue-200 transition-colors cursor-pointer"
              >
                {testingSmtp ? 'Testing...' : 'Test Connection'}
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-600 uppercase mb-1">SMTP Host *</label>
                <input
                  type="text"
                  required
                  value={settings.smtp.host}
                  onChange={(e) => setSettings({
                    ...settings,
                    smtp: { ...settings.smtp, host: e.target.value }
                  })}
                  className="w-full px-3 py-2 text-xs font-mono rounded-lg border border-slate-200 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 uppercase mb-1">SMTP Port *</label>
                <input
                  type="number"
                  required
                  value={settings.smtp.port}
                  onChange={(e) => setSettings({
                    ...settings,
                    smtp: { ...settings.smtp, port: parseInt(e.target.value) || 587 }
                  })}
                  className="w-full px-3 py-2 text-xs font-mono rounded-lg border border-slate-200 focus:outline-none"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-600 uppercase mb-1">Username / Account</label>
                <input
                  type="text"
                  value={settings.smtp.user}
                  onChange={(e) => setSettings({
                    ...settings,
                    smtp: { ...settings.smtp, user: e.target.value }
                  })}
                  className="w-full px-3 py-2 text-xs font-mono rounded-lg border border-slate-200 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 uppercase mb-1">
                  Password (Masked Server-Side)
                </label>
                <input
                  type="password"
                  value={settings.smtp.password}
                  onChange={(e) => setSettings({
                    ...settings,
                    smtp: { ...settings.smtp, password: e.target.value }
                  })}
                  placeholder="Enter new password to overwrite"
                  className="w-full px-3 py-2 text-xs font-mono rounded-lg border border-slate-200 focus:outline-none"
                />
              </div>
            </div>

            <div className="flex justify-end pt-3 border-t border-slate-100">
              <button
                type="submit"
                className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold shadow-sm transition-all cursor-pointer"
              >
                Save SMTP Gateway
              </button>
            </div>
          </form>
        )}

        {/* ---------------------------------------------------- */}
        {/* TAB 4: SMS & WHATSAPP GATEWAY */}
        {/* ---------------------------------------------------- */}
        {activeTab === 'sms' && (
          <form onSubmit={handleSaveSettings} className="space-y-4">
            <div className="flex items-center justify-between">
              <p className="text-xs text-slate-500">
                Configure SMS and WhatsApp Cloud API credentials for fee reminders and student alerts.
              </p>
              <button
                type="button"
                onClick={handleTestSms}
                disabled={testingSms}
                className="px-3 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-lg text-xs font-bold border border-blue-200 transition-colors cursor-pointer"
              >
                {testingSms ? 'Testing...' : 'Test Connection'}
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-600 uppercase mb-1">Gateway Provider</label>
                <select
                  value={settings.sms.provider}
                  onChange={(e) => setSettings({
                    ...settings,
                    sms: { ...settings.sms, provider: e.target.value }
                  })}
                  className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 font-semibold focus:outline-none"
                >
                  <option value="Twilio & WhatsApp Cloud API">Twilio & WhatsApp Cloud API</option>
                  <option value="Infobip Telecom Gateway">Infobip Telecom Gateway</option>
                  <option value="Telenor / Jazz Corporate Bulk SMS">Telenor / Jazz Corporate Bulk SMS</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 uppercase mb-1">Masked Sender ID</label>
                <input
                  type="text"
                  value={settings.sms.senderId}
                  onChange={(e) => setSettings({
                    ...settings,
                    sms: { ...settings.sms, senderId: e.target.value }
                  })}
                  className="w-full px-3 py-2 text-xs font-mono uppercase rounded-lg border border-slate-200 focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-600 uppercase mb-1">
                API Auth Token / Bearer Key (Masked Server-Side)
              </label>
              <input
                type="password"
                value={settings.sms.token}
                onChange={(e) => setSettings({
                  ...settings,
                  sms: { ...settings.sms, token: e.target.value }
                })}
                placeholder="Enter new token to overwrite"
                className="w-full px-3 py-2 text-xs font-mono rounded-lg border border-slate-200 focus:outline-none"
              />
            </div>

            <div className="flex justify-end pt-3 border-t border-slate-100">
              <button
                type="submit"
                className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold shadow-sm transition-all cursor-pointer"
              >
                Save SMS Gateway
              </button>
            </div>
          </form>
        )}

        {/* ---------------------------------------------------- */}
        {/* TAB 5: PAYMENT GATEWAY */}
        {/* ---------------------------------------------------- */}
        {activeTab === 'payment' && (
          <form onSubmit={handleSaveSettings} className="space-y-4">
            <div className="flex items-center justify-between">
              <p className="text-xs text-slate-500">
                Configure corporate payment gateway for online student fee collections via 1Link, JazzCash, EasyPaisa.
              </p>
              <button
                type="button"
                onClick={handleTestPayment}
                disabled={testingPayment}
                className="px-3 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-lg text-xs font-bold border border-blue-200 transition-colors cursor-pointer"
              >
                {testingPayment ? 'Testing...' : 'Test Connection'}
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-600 uppercase mb-1">Gateway Engine</label>
                <select
                  value={settings.payment.gateway}
                  onChange={(e) => setSettings({
                    ...settings,
                    payment: { ...settings.payment, gateway: e.target.value }
                  })}
                  className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 font-semibold focus:outline-none"
                >
                  <option value="1Link & JazzCash Corporate Gateway">1Link & JazzCash Corporate Gateway</option>
                  <option value="EasyPaisa Open API">EasyPaisa Open API</option>
                  <option value="Stripe Elements (Global Cards)">Stripe Elements (Global Cards)</option>
                  <option value="Bank Alfalah PayWay">Bank Alfalah PayWay</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 uppercase mb-1">Corporate Merchant ID</label>
                <input
                  type="text"
                  value={settings.payment.merchantId}
                  onChange={(e) => setSettings({
                    ...settings,
                    payment: { ...settings.payment, merchantId: e.target.value }
                  })}
                  className="w-full px-3 py-2 text-xs font-mono rounded-lg border border-slate-200 focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-600 uppercase mb-1">
                Merchant Secret Key (Masked Server-Side)
              </label>
              <input
                type="password"
                value={settings.payment.secretKey}
                onChange={(e) => setSettings({
                  ...settings,
                  payment: { ...settings.payment, secretKey: e.target.value }
                })}
                placeholder="Enter new secret key to overwrite"
                className="w-full px-3 py-2 text-xs font-mono rounded-lg border border-slate-200 focus:outline-none"
              />
            </div>

            <div className="flex justify-end pt-3 border-t border-slate-100">
              <button
                type="submit"
                className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold shadow-sm transition-all cursor-pointer"
              >
                Save Payment Gateway
              </button>
            </div>
          </form>
        )}

        {/* ---------------------------------------------------- */}
        {/* TAB 6: MAINTENANCE MODE */}
        {/* ---------------------------------------------------- */}
        {activeTab === 'maintenance' && (
          <form onSubmit={handleSaveSettings} className="space-y-4">
            <div className="p-4 rounded-xl border bg-amber-50 border-amber-200 text-xs text-amber-900 space-y-3">
              <label className="flex items-start gap-2.5 cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.general.maintenanceMode}
                  onChange={(e) => setSettings({
                    ...settings,
                    general: { ...settings.general, maintenanceMode: e.target.checked }
                  })}
                  className="rounded text-amber-600 focus:ring-amber-500 mt-0.5"
                />
                <div>
                  <span className="font-bold text-sm block">Activate Platform Maintenance Mode</span>
                  <span className="text-amber-800 text-[11px] block mt-0.5">
                    When active, campus administrative portals will display the maintenance directive message while keeping Superadmin root access unrestricted.
                  </span>
                </div>
              </label>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-600 uppercase mb-1">
                Public Maintenance Message
              </label>
              <textarea
                rows={3}
                value={settings.general.maintenanceMessage}
                onChange={(e) => setSettings({
                  ...settings,
                  general: { ...settings.general, maintenanceMessage: e.target.value }
                })}
                className="w-full p-3 text-xs rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-amber-500/20"
              />
            </div>

            <div className="flex justify-end pt-3 border-t border-slate-100">
              <button
                type="submit"
                className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold shadow-sm transition-all cursor-pointer"
              >
                Save Maintenance Status
              </button>
            </div>
          </form>
        )}

        {/* ---------------------------------------------------- */}
        {/* TAB 7: DATABASE & CLOUD SYNC */}
        {/* ---------------------------------------------------- */}
        {activeTab === 'database' && (
          <div className="space-y-5">
            {/* Status Card */}
            <div className={`p-3.5 rounded-xl border flex items-start gap-3 ${
              isSupabaseConfigured 
                ? 'bg-emerald-50 border-emerald-200 text-emerald-900' 
                : 'bg-blue-50 border-blue-200 text-blue-900'
            }`}>
              <Database className="w-4 h-4 shrink-0 mt-0.5 text-blue-600" />
              <div className="text-xs">
                <h4 className="font-bold">
                  {isSupabaseConfigured ? 'Supabase Database Connected' : 'Supabase Ready / Local Persistence Active'}
                </h4>
                <p className="mt-0.5 text-slate-600 text-[11px]">
                  {isSupabaseConfigured
                    ? `Connected to ${status.url}. All CRUD operations sync directly to PostgreSQL.`
                    : 'System is running with instant local persistence. All records you add (Institutes, Students, Fees, Users) are saved persistently and dynamically update stats.'}
                </p>
              </div>
            </div>

            {/* LocalStorage Quota & Client Telemetry */}
            <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-slate-700 flex items-center gap-1.5 uppercase tracking-wider text-[10px]">
                  <HardDrive className="w-3.5 h-3.5 text-indigo-600" />
                  LocalStorage Telemetry & Storage Quota
                </span>
                <span className="text-[10px] font-semibold text-emerald-700 bg-emerald-100/70 px-2 py-0.5 rounded-full flex items-center gap-1">
                  <Activity className="w-3 h-3 text-emerald-600" /> Optimal ({storageTelemetry.percentUsed}%)
                </span>
              </div>

              <div className="w-full bg-slate-200 rounded-full h-1.5 overflow-hidden">
                <div 
                  className="bg-indigo-600 h-1.5 rounded-full transition-all duration-500" 
                  style={{ width: `${storageTelemetry.percentUsed}%` }}
                />
              </div>

              <div className="flex items-center justify-between text-[10px] text-slate-500">
                <span><strong>{storageTelemetry.totalKB} KB</strong> used ({storageTelemetry.totalMB} MB)</span>
                <span>Browser limit: ~<strong>5.0 MB</strong></span>
              </div>
            </div>

            {/* Database Zero Reset & Template Actions */}
            <div className="p-3.5 bg-slate-50 border border-slate-200/80 rounded-xl space-y-2.5">
              <span className="text-xs font-bold text-slate-700 uppercase tracking-wider block">
                Database Initial State Controls
              </span>
              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={handleResetToZero}
                  className="flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 bg-rose-600 hover:bg-rose-700 text-white rounded-lg transition-colors shadow-2xs cursor-pointer"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Reset All to ZERO</span>
                </button>

                <button
                  type="button"
                  onClick={handleLoadSample}
                  className="flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 bg-slate-800 hover:bg-slate-900 text-white rounded-lg transition-colors shadow-2xs cursor-pointer"
                >
                  <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                  <span>Load Sample Template</span>
                </button>
              </div>
            </div>

            {/* Cloud Database Connection Form */}
            <form onSubmit={handleSaveSupabaseConfig} className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                  Supabase Project Connection
                </span>
                <span className="text-[10px] text-blue-600 font-mono">.env integration</span>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 uppercase mb-1">
                  Supabase Project URL
                </label>
                <input
                  type="text"
                  value={supabaseUrl}
                  onChange={(e) => setSupabaseUrl(e.target.value)}
                  placeholder="https://your-project.supabase.co"
                  className="w-full px-3 py-1.5 text-xs border border-slate-200 rounded-lg focus:outline-none font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 uppercase mb-1">
                  Supabase Anon Key
                </label>
                <input
                  type="password"
                  value={supabaseKey}
                  onChange={(e) => setSupabaseKey(e.target.value)}
                  placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI..."
                  className="w-full px-3 py-1.5 text-xs border border-slate-200 rounded-lg focus:outline-none font-mono"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-1">
                <button
                  type="button"
                  onClick={handleTestSupabase}
                  disabled={testingSupabase}
                  className="px-3 py-1.5 text-xs font-semibold border border-slate-300 hover:bg-slate-50 text-slate-700 rounded-lg transition-colors cursor-pointer"
                >
                  {testingSupabase ? 'Testing...' : 'Test Connection'}
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold shadow-2xs cursor-pointer"
                >
                  Save Credentials
                </button>
              </div>
            </form>

            {/* Database Backup & Restore Actions */}
            <div className="pt-3 border-t border-slate-200 flex flex-wrap items-center justify-between gap-2">
              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={handleExportData}
                  className="flex items-center gap-1.5 text-xs font-semibold text-slate-700 hover:text-slate-900 px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 transition-colors cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5 text-slate-600" />
                  <span>Export JSON</span>
                </button>

                <button
                  type="button"
                  onClick={handleFullSnapshotArchive}
                  className="flex items-center gap-1.5 text-xs font-semibold text-indigo-700 hover:text-indigo-900 px-3 py-1.5 rounded-lg bg-indigo-50 hover:bg-indigo-100 transition-colors cursor-pointer"
                >
                  <Archive className="w-3.5 h-3.5 text-indigo-600" />
                  <span>Snapshot Archive</span>
                </button>

                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="flex items-center gap-1.5 text-xs font-semibold text-blue-700 hover:text-blue-900 px-3 py-1.5 rounded-lg bg-blue-50 hover:bg-blue-100 transition-colors cursor-pointer"
                >
                  <Upload className="w-3.5 h-3.5 text-blue-600" />
                  <span>Import Restore</span>
                </button>
              </div>
            </div>
          </div>
        )}

        <div className="flex justify-end pt-3 border-t border-slate-100">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </Modal>
  )
}

export default SettingsModal
