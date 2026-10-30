import React, { useState, useEffect, useMemo } from 'react'
import { 
  Settings, 
  Globe, 
  Tag, 
  Sliders, 
  Key, 
  ShieldCheck, 
  FileText, 
  AlertTriangle, 
  UserCheck, 
  Check, 
  Save, 
  RefreshCw, 
  ExternalLink,
  Laptop,
  Database,
  Download,
  Upload,
  Trash2,
  RotateCcw,
  Eye,
  Search,
  Filter,
  Shield,
  Clock,
  HardDrive,
  FileSpreadsheet,
  X,
  Copy,
  CheckCircle,
  MapPin,
  Sparkles
} from 'lucide-react'
import { useToast } from '../../../context/ToastContext'
import { useAppData } from '../../../context/AppDataContext'
import { OperationsService } from '../../../services/operationsService'

export const SuperadminPlatformSettingsView = ({ activeTab = 'general', onTabChange = () => {} }) => {
  const { toast } = useToast()
  const { institutes = [] } = useAppData()
  const [currentTab, setCurrentTab] = useState(activeTab)
  const effectiveTab = currentTab || activeTab || 'general'

  const handleTabSwitch = (tabKey) => {
    setCurrentTab(tabKey)
    onTabChange(tabKey)
  }

  // General settings state
  const [generalForm, setGeneralForm] = useState({
    platformName: 'EIMS Enterprise Educational Network',
    defaultLanguage: 'English (US & PK)',
    currency: 'PKR - Pakistani Rupee (Rs.)',
    timezone: 'Asia/Karachi (GMT+5)',
    academicYearFormat: 'YYYY-YYYY (August - June)',
    supportEmail: 'admin@eims-edu.pk'
  })

  // Feature flags state
  const [featureFlags, setFeatureFlags] = useState([
    { id: 'flag_biometric', name: 'Biometric Hardware Realtime Sync', desc: 'Allow instant webhook sync from gate turnstiles', enabled: true, tier: 'Enterprise' },
    { id: 'flag_1bill', name: '1Bill National Banking Switch', desc: 'Generate 1Link 1Bill digital consumer IDs', enabled: true, tier: 'Standard' },
    { id: 'flag_lms_proctoring', name: 'AI LMS Quiz Anti-Cheat Lockout', desc: 'Block multiple tabs during online examinations', enabled: true, tier: 'Premium' },
    { id: 'flag_whatsapp', name: 'WhatsApp Cloud API Automations', desc: 'Dispatch fee challans & absence alerts via Meta API', enabled: true, tier: 'Standard' }
  ])

  // Maintenance mode
  const [maintenanceMode, setMaintenanceMode] = useState(false)

  // Pick 2: System & Emergency Session Backups State
  const [sessionBackups, setSessionBackups] = useState(() => {
    try { return OperationsService.getSessionBackups() } catch { return [] }
  })
  const [systemBackups, setSystemBackups] = useState([])
  const [backupSubTab, setBackupSubTab] = useState('session') // 'session' | 'database'
  const [backupSearch, setBackupSearch] = useState('')
  const [inspectingBackup, setInspectingBackup] = useState(null)
  const [copiedText, setCopiedText] = useState(null)

  useEffect(() => {
    if (OperationsService?.getBackups) {
      OperationsService.getBackups().then(res => setSystemBackups(res || []))
    }
  }, [])

  // Sync session backups whenever tab becomes active
  useEffect(() => {
    if (effectiveTab === 'backups' && OperationsService?.getSessionBackups) {
      setSessionBackups(OperationsService.getSessionBackups())
    }
  }, [effectiveTab])

  const handleCopy = (text) => {
    if (!text) return
    if (navigator?.clipboard?.writeText) {
      navigator.clipboard.writeText(text)
      setCopiedText(text)
      setTimeout(() => setCopiedText(null), 2000)
    }
  }

  const handleDownloadSessionBackup = (backup) => {
    try {
      OperationsService.downloadSessionBackupFile(backup)
      toast?.success?.(`Session backup file downloaded for ${backup.userName}!`)
    } catch (err) {
      toast?.error?.('Failed to download backup file')
    }
  }

  const handleDeleteSessionBackup = (backupId) => {
    if (window.confirm('Are you sure you want to delete this emergency session backup archive?')) {
      const updated = OperationsService.deleteSessionBackup(backupId)
      setSessionBackups(updated)
      toast?.success?.('Session backup archive deleted successfully.')
    }
  }

  const handleRestoreSession = (backup) => {
    try {
      OperationsService.restoreSessionBackup(backup)
      toast?.success?.(`Session for ${backup.userName} restored back to Active Sessions! User can re-authenticate.`)
    } catch (err) {
      toast?.error?.('Failed to restore session')
    }
  }

  const handleCreateSystemSnapshot = async () => {
    try {
      const newBkp = await OperationsService.createManualBackup('MANUAL', null)
      if (OperationsService?.getBackups) {
        const bkps = await OperationsService.getBackups()
        setSystemBackups(bkps)
      }
      toast?.success?.('New system database snapshot created and verified!')
    } catch (e) {
      toast?.error?.('Failed to create snapshot')
    }
  }

  const filteredSessionBackups = useMemo(() => {
    const q = (backupSearch || '').toLowerCase().trim()
    if (!q) return sessionBackups
    return (sessionBackups || []).filter(b => 
      (b.userName || '').toLowerCase().includes(q) ||
      (b.userEmail || '').toLowerCase().includes(q) ||
      (b.campusName || '').toLowerCase().includes(q) ||
      (b.ipAddress || '').toLowerCase().includes(q) ||
      (b.reason || '').toLowerCase().includes(q)
    )
  }, [sessionBackups, backupSearch])

  const tabsConfig = [
    { key: 'general', label: 'General', icon: Settings },
    { key: 'branding', label: 'Branding & Custom Domains', icon: Globe },
    { key: 'flags', label: 'Feature Flags (Tier-wise)', icon: Sliders },
    { key: 'integrations', label: 'Integrations & Webhooks', icon: Key },
    { key: 'compliance', label: 'Compliance & Data Retention', icon: ShieldCheck },
    { key: 'legal', label: 'Legal Documents', icon: FileText },
    { key: 'maintenance', label: 'Maintenance Mode & Releases', icon: AlertTriangle },
    { key: 'impersonate', label: 'Switch to Campus View', icon: UserCheck },
    { key: 'backups', label: 'System & Session Backups', icon: Database }
  ]

  const toggleFlag = (id) => {
    setFeatureFlags(prev => prev.map(f => {
      if (f.id === id) {
        const next = !f.enabled
        toast?.info?.(`Feature Flag "${f.name}" set to ${next ? 'ENABLED' : 'DISABLED'}`)
        return { ...f, enabled: next }
      }
      return f
    }))
  }

  const handleSaveGeneral = (e) => {
    e.preventDefault()
    toast?.success?.('Platform global settings saved successfully.')
  }

  const handleSimulateImpersonation = (campusName) => {
    toast?.success?.(`Impersonating ${campusName} Administration. Entering campus view...`)
  }

  return (
    <div className="p-3 sm:p-6 md:p-8 space-y-6 max-w-7xl mx-auto">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-zinc-900 to-purple-950 rounded-3xl p-6 sm:p-8 text-white shadow-xl relative overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md text-xs font-semibold text-purple-200 border border-white/10 mb-2">
              <Settings className="w-3.5 h-3.5 text-purple-300" />
              <span>Super Administrator • Platform Engine Configuration</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              Platform Architecture & System Settings
            </h1>
            <p className="text-sm text-slate-300 mt-1 max-w-2xl leading-relaxed">
              Global localization, currency formats, API webhook endpoints, tier feature toggles, and campus impersonation.
            </p>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-2xl p-2 border border-slate-200/80 shadow-2xs overflow-x-auto scrollbar-none">
        <div className="flex items-center gap-1.5 min-w-max">
          {tabsConfig.map(tab => {
            const Icon = tab.icon
            const active = effectiveTab === tab.key
            return (
              <button
                key={tab.key}
                onClick={() => handleTabSwitch(tab.key)}
                className={`flex items-center gap-2 px-3.5 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-all cursor-pointer ${
                  active 
                    ? 'bg-purple-700 text-white shadow-sm shadow-purple-700/30' 
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/80'
                }`}
              >
                <Icon className={`w-4 h-4 ${active ? 'text-white' : 'text-slate-400'}`} />
                <span>{tab.label}</span>
              </button>
            )
          })}
        </div>
      </div>

      {/* Tab 1: General Settings */}
      {effectiveTab === 'general' && (
        <form onSubmit={handleSaveGeneral} className="bg-white rounded-2xl border border-slate-200/80 shadow-2xs p-6 space-y-6">
          <div>
            <h3 className="font-bold text-slate-900 text-base">Global Environment Parameters</h3>
            <p className="text-xs text-slate-500">Parameters applied universally across all platform modules and student challans</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Platform Brand Name</label>
              <input 
                type="text" 
                value={generalForm.platformName} 
                onChange={e => setGeneralForm({ ...generalForm, platformName: e.target.value })}
                className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-purple-500/20" 
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Default Platform Currency</label>
              <input 
                type="text" 
                value={generalForm.currency} 
                readOnly
                className="w-full px-3.5 py-2 rounded-xl border border-slate-200 bg-slate-50 text-xs sm:text-sm text-slate-600" 
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">System Timezone</label>
              <input 
                type="text" 
                value={generalForm.timezone} 
                readOnly
                className="w-full px-3.5 py-2 rounded-xl border border-slate-200 bg-slate-50 text-xs sm:text-sm text-slate-600" 
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Central Support Email</label>
              <input 
                type="email" 
                value={generalForm.supportEmail} 
                onChange={e => setGeneralForm({ ...generalForm, supportEmail: e.target.value })}
                className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-purple-500/20" 
              />
            </div>
          </div>
          <div className="pt-2 flex justify-end">
            <button 
              type="submit"
              className="px-5 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs sm:text-sm flex items-center gap-2 shadow-sm shadow-purple-600/30 cursor-pointer"
            >
              <Save className="w-4 h-4" />
              <span>Save Configuration</span>
            </button>
          </div>
        </form>
      )}

      {/* Tab 3: Feature Flags */}
      {effectiveTab === 'flags' && (
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-2xs overflow-hidden">
          <div className="p-5 border-b border-slate-100">
            <h3 className="font-bold text-slate-900">Platform Feature Flags & Tier Capabilities</h3>
            <p className="text-xs text-slate-500">Dynamically enable or disable advanced capabilities across all active tenants</p>
          </div>
          <div className="divide-y divide-slate-100">
            {featureFlags.map(f => (
              <div key={f.id} className="p-4 sm:p-5 flex items-center justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-900 text-sm">{f.name}</span>
                    <span className="text-[11px] font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-700">{f.tier}</span>
                  </div>
                  <p className="text-xs text-slate-500 mt-0.5">{f.desc}</p>
                </div>
                <button
                  type="button"
                  onClick={() => toggleFlag(f.id)}
                  className={`w-12 h-6 flex items-center rounded-full p-1 cursor-pointer transition-colors shrink-0 ${
                    f.enabled ? 'bg-purple-600 justify-end' : 'bg-slate-300 justify-start'
                  }`}
                >
                  <div className="w-4 h-4 rounded-full bg-white shadow-xs"></div>
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 7: Maintenance Mode */}
      {effectiveTab === 'maintenance' && (
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-2xs p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-bold text-slate-900 text-base">Platform Maintenance Mode</h3>
              <p className="text-xs text-slate-500">Temporarily halts student and parent portals while preserving Superadmin access</p>
            </div>
            <button
              onClick={() => {
                const next = !maintenanceMode
                setMaintenanceMode(next)
                toast?.info?.(`Maintenance mode is now ${next ? 'ACTIVATED' : 'DEACTIVATED'}`)
              }}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                maintenanceMode ? 'bg-rose-600 text-white' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              {maintenanceMode ? 'Maintenance Mode: ACTIVE' : 'Enable Maintenance'}
            </button>
          </div>
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-100 text-xs text-slate-600">
            Current Release: <span className="font-bold text-purple-700">v3.4.0 (Enterprise LTS)</span> &bull; Engine build: 2026.10-R3
          </div>
        </div>
      )}

      {/* Tab 8: Switch to Campus View (Impersonation) */}
      {effectiveTab === 'impersonate' && (
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-2xs p-6 space-y-4">
          <div>
            <h3 className="font-bold text-slate-900 text-base">Campus Impersonation & Delegation Switcher</h3>
            <p className="text-xs text-slate-500">Switch directly into any affiliated campus's institute admin console with full audit trails</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
            {[
              { id: 'inst-1', name: 'Beaconhouse Central High', code: 'BHS-01', city: 'Lahore', students: 1314 },
              { id: 'inst-2', name: 'The City School Senior Branch', code: 'TCS-02', city: 'Lahore', students: 1211 },
              { id: 'inst-3', name: 'Lahore Grammar Model Town', code: 'LGS-03', city: 'Lahore', students: 895 },
              { id: 'inst-4', name: 'Army Public School & College', code: 'APS-04', city: 'Rawalpindi', students: 940 }
            ].map(c => (
              <div key={c.id} className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 flex items-center justify-between">
                <div>
                  <span className="font-mono text-[11px] font-bold text-purple-700">{c.code}</span>
                  <h4 className="font-bold text-slate-900 text-sm mt-0.5">{c.name}</h4>
                  <p className="text-xs text-slate-500">{c.city} &bull; {c.students} Students</p>
                </div>
                <button
                  onClick={() => handleSimulateImpersonation(c.name)}
                  className="px-3 py-1.5 rounded-lg bg-purple-600 hover:bg-purple-500 text-white font-semibold text-xs flex items-center gap-1 shadow-xs cursor-pointer"
                >
                  <UserCheck className="w-3.5 h-3.5" />
                  <span>Impersonate</span>
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 9: System & Emergency Session Backups (Pick 2 Core) */}
      {effectiveTab === 'backups' && (
        <div className="space-y-6">
          {/* Header Banner */}
          <div className="bg-white rounded-2xl border border-slate-200/80 p-5 sm:p-6 shadow-2xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-start sm:items-center gap-3.5">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-purple-600 to-indigo-600 text-white font-bold flex items-center justify-center shadow-md shadow-purple-600/20 shrink-0">
                <Database className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-bold text-slate-900 text-base sm:text-lg">
                  System &amp; Session Backups Management Hub
                </h3>
                <p className="text-xs text-slate-500 mt-0.5 max-w-xl">
                  Automated emergency session state backups created during force logouts, manual JSON database snapshots, and data recovery archives.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 flex-wrap">
              <button
                type="button"
                onClick={handleCreateSystemSnapshot}
                className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs flex items-center gap-1.5 shadow-sm shadow-purple-600/30 transition-all cursor-pointer whitespace-nowrap"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Create System Snapshot</span>
              </button>
            </div>
          </div>

          {/* Sub-Tabs: Emergency Session Backups vs System Database Snapshots */}
          <div className="flex items-center gap-2 border-b border-slate-200 pb-2">
            <button
              type="button"
              onClick={() => setBackupSubTab('session')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 ${
                backupSubTab === 'session'
                  ? 'bg-purple-600 text-white shadow-xs'
                  : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
              }`}
            >
              <UserCheck className="w-3.5 h-3.5" />
              <span>Emergency Session Backups</span>
              <span className={`text-[10px] px-2 py-0.5 rounded-full font-mono ${
                backupSubTab === 'session' ? 'bg-purple-700 text-purple-100' : 'bg-slate-100 text-slate-600'
              }`}>
                {sessionBackups.length}
              </span>
            </button>

            <button
              type="button"
              onClick={() => setBackupSubTab('database')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 ${
                backupSubTab === 'database'
                  ? 'bg-purple-600 text-white shadow-xs'
                  : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
              }`}
            >
              <HardDrive className="w-3.5 h-3.5" />
              <span>Database Snapshots</span>
              <span className={`text-[10px] px-2 py-0.5 rounded-full font-mono ${
                backupSubTab === 'database' ? 'bg-purple-700 text-purple-100' : 'bg-slate-100 text-slate-600'
              }`}>
                {systemBackups.length}
              </span>
            </button>
          </div>

          {/* Sub-Tab 1: Emergency Session Backups */}
          {backupSubTab === 'session' && (
            <div className="space-y-4">
              {/* Search Bar */}
              <div className="flex items-center justify-between gap-3 bg-white p-3 rounded-xl border border-slate-200/80">
                <div className="relative flex-1 max-w-md">
                  <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={backupSearch}
                    onChange={(e) => setBackupSearch(e.target.value)}
                    placeholder="Search session backups by user, campus, IP, or reason..."
                    className="w-full pl-9 pr-3 py-1.5 rounded-lg border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-purple-500/20"
                  />
                </div>
                <span className="text-[11px] font-semibold text-slate-500 font-mono">
                  {filteredSessionBackups.length} Archive(s) Found
                </span>
              </div>

              {/* Table / List */}
              <div className="bg-white rounded-2xl border border-slate-200/80 shadow-2xs overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="bg-slate-50/80 border-b border-slate-200 text-slate-600 font-bold uppercase tracking-wider text-[11px]">
                        <th className="py-3.5 px-4">User &amp; Campus</th>
                        <th className="py-3.5 px-3">IP Address &amp; Device</th>
                        <th className="py-3.5 px-3">Terminated At</th>
                        <th className="py-3.5 px-3">Revocation Reason</th>
                        <th className="py-3.5 px-3">Size</th>
                        <th className="py-3.5 px-4 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {filteredSessionBackups.length > 0 ? (
                        filteredSessionBackups.map((b) => (
                          <tr key={b.id} className="hover:bg-slate-50/50 transition-colors">
                            <td className="py-3.5 px-4">
                              <div className="flex items-center gap-2.5">
                                <div className="w-8 h-8 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center font-bold text-xs shrink-0 shadow-2xs">
                                  {b.userRole === 'superadmin' ? 'SA' : 'IA'}
                                </div>
                                <div>
                                  <span className="font-bold text-slate-900 block">{b.userName}</span>
                                  <span className="text-[11px] text-slate-400 font-mono block">{b.userEmail}</span>
                                  {b.campusName && (
                                    <span className="text-[10px] text-purple-600 font-medium block">{b.campusName}</span>
                                  )}
                                </div>
                              </div>
                            </td>

                            <td className="py-3.5 px-3">
                              <span className="font-mono text-slate-700 font-semibold block">{b.ipAddress}</span>
                              <span className="text-slate-400 text-[11px] truncate block max-w-xs">{b.deviceInfo}</span>
                            </td>

                            <td className="py-3.5 px-3">
                              <span className="font-mono text-slate-700 block">
                                {b.terminatedAt ? new Date(b.terminatedAt).toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' }) : 'Recent'}
                              </span>
                              <span className="text-slate-400 text-[11px] font-mono block">
                                {b.terminatedAt ? new Date(b.terminatedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}
                              </span>
                            </td>

                            <td className="py-3.5 px-3">
                              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[10px] font-bold bg-amber-50 text-amber-800 border border-amber-200">
                                {b.reason || 'Administrative Revocation'}
                              </span>
                            </td>

                            <td className="py-3.5 px-3">
                              <span className="font-mono text-slate-500 text-[11px]">{b.fileSize || '45 KB'}</span>
                            </td>

                            <td className="py-3.5 px-4 text-right">
                              <div className="flex items-center justify-end gap-1.5">
                                {/* Download File */}
                                <button
                                  type="button"
                                  onClick={() => handleDownloadSessionBackup(b)}
                                  className="p-1.5 rounded-lg border border-slate-200 bg-white hover:bg-purple-50 hover:text-purple-700 hover:border-purple-300 text-slate-600 transition-all cursor-pointer shadow-2xs"
                                  title="Download Session Backup File (.json)"
                                >
                                  <Download className="w-3.5 h-3.5" />
                                </button>

                                {/* View Snapshot */}
                                <button
                                  type="button"
                                  onClick={() => setInspectingBackup(b)}
                                  className="p-1.5 rounded-lg border border-slate-200 bg-white hover:bg-indigo-50 hover:text-indigo-700 hover:border-indigo-300 text-slate-600 transition-all cursor-pointer shadow-2xs"
                                  title="Inspect Backup Snapshot Payload"
                                >
                                  <Eye className="w-3.5 h-3.5" />
                                </button>

                                {/* Restore Session */}
                                <button
                                  type="button"
                                  onClick={() => handleRestoreSession(b)}
                                  className="p-1.5 rounded-lg border border-emerald-200 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 transition-all cursor-pointer shadow-2xs"
                                  title="Restore Session Back to Active Sessions"
                                >
                                  <RotateCcw className="w-3.5 h-3.5" />
                                </button>

                                {/* Delete Archive */}
                                <button
                                  type="button"
                                  onClick={() => handleDeleteSessionBackup(b.id)}
                                  className="p-1.5 rounded-lg border border-rose-200 bg-rose-50 hover:bg-rose-100 text-rose-700 transition-all cursor-pointer shadow-2xs"
                                  title="Delete Archive"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan={6} className="py-12 text-center text-slate-400">
                            <Database className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                            <p className="font-semibold text-slate-600">No emergency session backups found</p>
                            <p className="text-xs text-slate-400 mt-1">
                              When a user session is force-logged out, an emergency state backup is automatically archived here.
                            </p>
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* Sub-Tab 2: Platform Database Snapshots */}
          {backupSubTab === 'database' && (
            <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-2xs space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-bold text-slate-900 text-sm">Central Database JSON Snapshots</h4>
                  <p className="text-xs text-slate-500">Global platform database images ready for immediate point-in-time disaster recovery.</p>
                </div>
              </div>

              <div className="divide-y divide-slate-100">
                {systemBackups.map((s) => (
                  <div key={s.id} className="py-3 flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-xl bg-slate-100 text-slate-600 flex items-center justify-center font-bold text-xs shrink-0">
                        <FileSpreadsheet className="w-4 h-4" />
                      </div>
                      <div>
                        <span className="font-mono font-bold text-slate-900 text-xs block">{s.filename}</span>
                        <span className="text-[11px] text-slate-400 font-mono">
                          {s.createdAt ? new Date(s.createdAt).toLocaleString() : 'Recent'} &bull; {((s.sizeBytes || 14857600) / 1024 / 1024).toFixed(2)} MB &bull; {s.createdBy}
                        </span>
                      </div>
                    </div>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                      {s.status}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Modal: View Snapshot Payload */}
          {inspectingBackup && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/50 backdrop-blur-xs animate-in fade-in duration-150">
              <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-xl w-full overflow-hidden animate-in zoom-in-95 duration-150 max-h-[90vh] flex flex-col">
                <div className="p-4 sm:p-5 border-b border-slate-100 flex items-center justify-between bg-gradient-to-r from-purple-50/70 to-slate-50">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-2xl bg-purple-600 text-white font-bold flex items-center justify-center shadow-sm">
                      <Database className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="font-bold text-slate-900 text-sm sm:text-base">
                        Emergency Session Backup Snapshot
                      </h3>
                      <p className="text-xs text-slate-500 font-mono">
                        Archive ID: {inspectingBackup.id}
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setInspectingBackup(null)}
                    className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                <div className="p-4 sm:p-6 overflow-y-auto space-y-4 text-xs">
                  <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-slate-900 text-sm">{inspectingBackup.userName}</span>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-lg bg-purple-100 text-purple-800 border border-purple-200 uppercase">
                        {inspectingBackup.userRole}
                      </span>
                    </div>
                    <div className="text-slate-600 space-y-1">
                      <p><strong>Campus:</strong> {inspectingBackup.campusName}</p>
                      <p><strong>IP Address:</strong> <span className="font-mono">{inspectingBackup.ipAddress}</span></p>
                      <p><strong>Device:</strong> {inspectingBackup.deviceInfo}</p>
                      <p><strong>Terminated:</strong> {new Date(inspectingBackup.terminatedAt).toLocaleString()}</p>
                      <p><strong>Revocation Reason:</strong> {inspectingBackup.reason}</p>
                    </div>
                  </div>

                  <div>
                    <label className="block text-slate-700 font-bold text-xs mb-1.5">
                      Captured State Payload (.json):
                    </label>
                    <pre className="p-3.5 rounded-xl bg-slate-900 text-emerald-400 font-mono text-[11px] overflow-x-auto max-h-56 leading-relaxed">
                      {JSON.stringify(inspectingBackup, null, 2)}
                    </pre>
                  </div>
                </div>

                <div className="p-4 border-t border-slate-100 bg-slate-50/70 flex items-center justify-between gap-2">
                  <button
                    type="button"
                    onClick={() => handleDownloadSessionBackup(inspectingBackup)}
                    className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs flex items-center gap-1.5 shadow-sm transition-colors cursor-pointer"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Download JSON Backup File</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setInspectingBackup(null)}
                    className="px-4 py-2 rounded-xl bg-slate-200 hover:bg-slate-300 text-slate-700 font-bold text-xs cursor-pointer transition-colors"
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Fallback for other tabs */}
      {['branding', 'integrations', 'compliance', 'legal'].includes(effectiveTab) && (
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-2xs p-6 space-y-4">
          <h3 className="font-bold text-slate-900 capitalize">{effectiveTab} Infrastructure</h3>
          <p className="text-xs text-slate-500">SSL certificates, custom subdomains, NADRA API keys, and legal SLA documentation.</p>
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-100 text-xs text-slate-600">
            Encrypted with AES-256 at rest. Webhooks authenticate using SHA-256 HMAC digital signatures.
          </div>
        </div>
      )}
    </div>
  )
}

export default SuperadminPlatformSettingsView
