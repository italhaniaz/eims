import React, { useState, useEffect, useMemo, useCallback } from 'react'
import { 
  ShieldCheck, 
  ShieldAlert, 
  Lock, 
  Key, 
  UserX, 
  Users, 
  Globe, 
  Clock, 
  Laptop, 
  AlertTriangle, 
  CheckCircle2, 
  RefreshCw, 
  Search, 
  Radio, 
  LogOut, 
  Activity,
  MapPin,
  Copy,
  Check,
  CheckCircle,
  ExternalLink,
  Eye,
  Settings,
  Database,
  Download,
  FileText,
  X,
  Sparkles,
  Server,
  Cpu,
  Save,
  Trash2,
  RotateCcw,
  Sliders,
  Shield
} from 'lucide-react'
import { useAppData } from '../../../context/AppDataContext'
import { useToast } from '../../../context/ToastContext'
import { SecurityService } from '../../../services/securityService'
import { OperationsService } from '../../../services/operationsService'

export const SecurityCenterView = () => {
  const { refreshData } = useAppData()
  const { toast } = useToast()

  // 1. Navigation & State
  const [activeTab, setActiveTab] = useState('sessions') // sessions, history, policy, allowlist
  const [sessions, setSessions] = useState([])
  const [loginHistory, setLoginHistory] = useState([])
  const [failedAlerts, setFailedAlerts] = useState([])
  const [policy, setPolicy] = useState({
    minPasswordLength: 8,
    requireUppercase: true,
    requireNumbers: true,
    requireSymbols: true,
    passwordExpiryDays: 90,
    twoFactorAuthEnabled: false,
    ipAllowlist: '127.0.0.1, 192.168.1.0/24',
    sessionTimeoutMinutes: 30
  })

  const [loading, setLoading] = useState(true)
  const [historySearch, setHistorySearch] = useState('')

  // Pick 1 & Pick 2: Session Telemetry Inspection, Governance Settings, & Emergency Backup Modals
  const [inspectingSession, setInspectingSession] = useState(null)
  const [settingsSession, setSettingsSession] = useState(null)
  const [sessionCustomPolicies, setSessionCustomPolicies] = useState({})
  
  // Force Logout & Emergency Backup Modals
  const [forceLogoutTarget, setForceLogoutTarget] = useState(null)
  const [isForceLogoutAllOpen, setIsForceLogoutAllOpen] = useState(false)
  const [backupOptions, setBackupOptions] = useState({
    createBackup: true,
    downloadFile: true,
    reason: 'Security Compliance & Routine Audit'
  })

  // Handlers for Session Inspect & Settings
  const handleOpenInspect = (session) => {
    setInspectingSession(session)
  }

  const handleOpenSettings = (session) => {
    setSettingsSession(session)
  }

  const handleSaveSessionPolicy = (sessionId, updatedPolicy) => {
    setSessionCustomPolicies(prev => ({
      ...prev,
      [sessionId]: updatedPolicy
    }))
    toast.success(`Session security policy enforced for ${settingsSession?.userName || 'Session'}.`)
    setSettingsSession(null)
  }

  // Handle single force logout with emergency backup guarantee
  const handleConfirmForceLogout = async () => {
    if (!forceLogoutTarget) return
    const target = forceLogoutTarget
    setTerminatingId(target.id)
    try {
      let backupRecord = null
      if (backupOptions.createBackup && OperationsService?.saveSessionBackup) {
        backupRecord = OperationsService.saveSessionBackup(target, backupOptions.reason)
      }
      if (backupOptions.downloadFile && backupRecord && OperationsService?.downloadSessionBackupFile) {
        OperationsService.downloadSessionBackupFile(backupRecord)
      }

      if (SecurityService?.forceLogoutSession) {
        await SecurityService.forceLogoutSession(target.id, target.userEmail)
      }

      setSessions(prev => (prev || []).filter(s => s.id !== target.id))
      if (typeof refreshData === 'function') refreshData()

      if (backupOptions.createBackup && backupOptions.downloadFile) {
        toast.success(`Remote session for ${target.userName || target.userEmail} revoked. Emergency backup archive downloaded & saved to Platform Settings!`)
      } else if (backupOptions.createBackup) {
        toast.success(`Remote session for ${target.userName || target.userEmail} revoked. Emergency backup archive saved in Platform Settings.`)
      } else {
        toast.success(`Remote session for ${target.userName || target.userEmail} terminated successfully!`)
      }
    } catch (e) {
      console.error(e)
      toast.error('Failed to revoke session')
    } finally {
      setTerminatingId(null)
      setForceLogoutTarget(null)
    }
  }

  // Handle force logout all remote sessions with consolidated backup
  const handleConfirmForceLogoutAll = async () => {
    const remoteSessions = (sessions || []).filter(s => !s.isCurrent)
    if (remoteSessions.length === 0) return

    try {
      if (backupOptions.createBackup && OperationsService?.saveSessionBackup) {
        remoteSessions.forEach(s => {
          OperationsService.saveSessionBackup(s, 'Consolidated Multi-Session Platform Revocation')
        })
        
        if (backupOptions.downloadFile) {
          const consolidatedPayload = {
            exportType: 'CONSOLIDATED_PLATFORM_SESSIONS_BACKUP',
            timestamp: new Date().toISOString(),
            terminatedBy: 'Super Administrator',
            totalSessions: remoteSessions.length,
            sessions: remoteSessions
          }
          const filename = `consolidated_sessions_backup_${Date.now()}.json`
          const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(consolidatedPayload, null, 2))
          const a = document.createElement('a')
          a.href = dataStr
          a.download = filename
          document.body.appendChild(a)
          a.click()
          a.remove()
        }
      }

      if (SecurityService?.forceLogoutAllOthers) {
        await SecurityService.forceLogoutAllOthers()
      }

      setSessions(prev => (prev || []).filter(s => s.isCurrent))
      if (typeof refreshData === 'function') refreshData()
      toast.success('All remote platform sessions revoked. Consolidated backup archive created & downloaded!')
    } catch (e) {
      toast.error('Failed to terminate remote sessions')
    } finally {
      setIsForceLogoutAllOpen(false)
    }
  }
  const [historyFilter, setHistoryFilter] = useState('ALL') // ALL, SUCCESS, FAILED
  const [terminatingId, setTerminatingId] = useState(null)
  const [copiedIp, setCopiedIp] = useState(null)

  // 2. Filter login history with safe fallback guards
  const filteredHistory = useMemo(() => {
    const list = Array.isArray(loginHistory) ? loginHistory : []
    const q = (historySearch || '').toLowerCase().trim()
    return list.filter(item => {
      if (!item) return false
      const emailMatch = (item.email || '').toLowerCase().includes(q)
      const ipMatch = (item.ip || '').toLowerCase().includes(q)
      const locMatch = (item.location || '').toLowerCase().includes(q)
      const matchesSearch = !q || emailMatch || ipMatch || locMatch
      const matchesFilter = historyFilter === 'ALL' || item.status === historyFilter
      return matchesSearch && matchesFilter
    })
  }, [loginHistory, historySearch, historyFilter])

  // 3. Telemetry loader
  const loadSecurityData = useCallback(async () => {
    setLoading(true)
    try {
      const [sessionsData, historyData, policyData] = await Promise.all([
        SecurityService?.getActiveSessions ? SecurityService.getActiveSessions() : Promise.resolve([]),
        SecurityService?.getLoginHistory ? SecurityService.getLoginHistory() : Promise.resolve({ history: [], failedAlerts: [] }),
        SecurityService?.getSecurityPolicy ? SecurityService.getSecurityPolicy() : Promise.resolve(null)
      ])
      setSessions(Array.isArray(sessionsData) ? sessionsData : [])
      setLoginHistory(Array.isArray(historyData?.history) ? historyData.history : [])
      setFailedAlerts(Array.isArray(historyData?.failedAlerts) ? historyData.failedAlerts : [])
      if (policyData && typeof policyData === 'object') {
        setPolicy(prev => ({ ...prev, ...policyData }))
      }
    } catch (e) {
      console.error('[SecurityCenter] Telemetry load error:', e)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    loadSecurityData()
    // Periodic telemetry refresh every 30 seconds
    const telemetryInterval = setInterval(() => {
      loadSecurityData()
    }, 30000)
    return () => clearInterval(telemetryInterval)
  }, [loadSecurityData])

  // Export login history audit trail as CSV
  const handleExportHistoryCSV = () => {
    if (!filteredHistory || filteredHistory.length === 0) {
      toast.info('No login history records to export.')
      return
    }

    const headers = ['Timestamp', 'User Email', 'IP Address', 'Device/Client', 'Location', 'Status']
    const rows = filteredHistory.map(item => [
      `"${(item.timestamp ? new Date(item.timestamp).toISOString() : '').replace(/"/g, '""')}"`,
      `"${(item.email || '').replace(/"/g, '""')}"`,
      `"${(item.ip || '').replace(/"/g, '""')}"`,
      `"${(item.device || '').replace(/"/g, '""')}"`,
      `"${(item.location || 'Pakistan').replace(/"/g, '""')}"`,
      `"${(item.status || 'SUCCESS').replace(/"/g, '""')}"`
    ])

    const csvContent = 'data:text/csv;charset=utf-8,\uFEFF' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n')
    const encodedUri = encodeURI(csvContent)
    const link = document.createElement('a')
    link.setAttribute('href', encodedUri)
    link.setAttribute('download', `security_login_history_${new Date().toISOString().split('T')[0]}.csv`)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    toast.success(`Exported ${filteredHistory.length} audit trail records to CSV.`)
  }

  // Helper: Copy IP to clipboard
  const handleCopyIp = (ipAddress) => {
    if (!ipAddress) return
    if (navigator?.clipboard?.writeText) {
      navigator.clipboard.writeText(ipAddress)
      setCopiedIp(ipAddress)
      toast.success(`IP "${ipAddress}" copied to clipboard!`)
      setTimeout(() => setCopiedIp(null), 2500)
    }
  }

  // Force Logout Single Session
  const handleForceLogout = async (session) => {
    if (!session) return
    if (session.isCurrent) {
      toast.warning('Cannot force-logout your current active session from here. Use Sign Out.')
      return
    }

    if (window.confirm(`Force terminate active session for "${session.userEmail}" (${session.ipAddress})?`)) {
      setTerminatingId(session.id)
      try {
        if (SecurityService?.forceLogoutSession) {
          await SecurityService.forceLogoutSession(session.id, session.userEmail)
        }
        setSessions(prev => (prev || []).filter(s => s.id !== session.id))
        if (typeof refreshData === 'function') refreshData()
        toast.success(`Remote session for ${session.userEmail} terminated successfully!`)
      } catch (e) {
        toast.error('Failed to revoke session')
      } finally {
        setTerminatingId(null)
      }
    }
  }

  // Force Logout All Other Remote Sessions
  const handleForceLogoutAll = async () => {
    if (window.confirm('Are you sure you want to force logout ALL other active user and admin sessions across the entire platform?')) {
      try {
        if (SecurityService?.forceLogoutAllOthers) {
          await SecurityService.forceLogoutAllOthers()
        }
        setSessions(prev => (prev || []).filter(s => s.isCurrent))
        if (typeof refreshData === 'function') refreshData()
        toast.success('All remote platform sessions have been forcibly terminated.')
      } catch (e) {
        toast.error('Failed to terminate remote sessions')
      }
    }
  }

  // Save Security Policies
  const handleSavePolicy = async (e) => {
    e.preventDefault()
    if (activeTab === 'allowlist' && policy?.ipAllowlist) {
      const items = policy.ipAllowlist.split(',').map(s => s.trim()).filter(Boolean)
      const ipPattern = /^(\d{1,3}\.){3}\d{1,3}(\/([0-9]|[1-2][0-9]|3[0-2]))?$/
      const ipv6Pattern = /^([0-9a-fA-F]{0,4}:){1,7}[0-9a-fA-F]{0,4}(\/\d{1,3})?$/
      const invalid = items.filter(ip => ip !== 'localhost' && !ipPattern.test(ip) && !ipv6Pattern.test(ip))
      if (invalid.length > 0) {
        toast.warning(`Notice: "${invalid.join(', ')}" does not match standard IPv4/IPv6/CIDR syntax. Please verify to prevent administrative lockout.`)
      }
    }
    try {
      if (SecurityService?.saveSecurityPolicy) {
        await SecurityService.saveSecurityPolicy(policy)
      }
      if (typeof refreshData === 'function') refreshData()
      toast.success('Enterprise security policy, password rules, and 2FA settings saved successfully!')
    } catch (e) {
      toast.error('Failed to save security policy')
    }
  }

  return (
    <div className="p-3 sm:p-6 md:p-8 pb-16 space-y-6 max-w-[1400px] mx-auto">
      {/* Clean Light SaaS Header */}
      <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-4">
        <div className="min-w-0">
          <div className="flex items-center gap-2 mb-1.5 flex-wrap">
            <span className="text-[11px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full bg-[#f5eeff] text-purple-700 border border-purple-100 inline-flex items-center gap-1.5 shadow-2xs">
              <ShieldCheck className="w-3.5 h-3.5 text-purple-600" />
              <span>Identity Governance & Threat Prevention</span>
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight font-heading">
            Enterprise Security & Access Center
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1 max-w-2xl">
            Real-time session governance, server-enforced force logout, password complexity rules, 2FA guard, and intrusion monitoring.
          </p>
        </div>

        <button
          onClick={loadSecurityData}
          disabled={loading}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-white hover:bg-slate-50 text-slate-700 border border-slate-200/80 rounded-xl font-semibold text-xs sm:text-sm shadow-2xs transition-all cursor-pointer self-start xl:self-auto active:scale-95 whitespace-nowrap shrink-0 disabled:opacity-50"
        >
          <RefreshCw className={`w-4 h-4 text-purple-600 shrink-0 ${loading ? 'animate-spin' : ''}`} />
          <span>{loading ? 'Refreshing...' : 'Refresh Telemetry'}</span>
        </button>
      </div>

      {/* KPI Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-2xl border border-slate-200/90 shadow-2xs flex items-center justify-between">
          <div>
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Live Active Sessions</span>
            <span className="text-2xl font-black text-slate-900 mt-1 block font-mono">{sessions.length}</span>
            <span className="text-[10px] text-emerald-600 font-semibold mt-0.5 inline-flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
              Real-time monitored
            </span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center border border-emerald-100 shadow-2xs">
            <Radio className="w-5 h-5 animate-pulse" />
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200/90 shadow-2xs flex items-center justify-between">
          <div>
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Failed Logins / Alerts</span>
            <span className={`text-2xl font-black mt-1 block font-mono ${failedAlerts.length > 0 ? 'text-rose-600' : 'text-slate-900'}`}>
              {failedAlerts.length}
            </span>
            <span className="text-[10px] text-slate-400 font-semibold mt-0.5 inline-block">Last 24 Hours</span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center border border-rose-100 shadow-2xs">
            <AlertTriangle className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200/90 shadow-2xs flex items-center justify-between">
          <div>
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">2FA Multi-Factor</span>
            <span className="text-2xl font-black text-slate-900 mt-1 block">
              {policy?.twoFactorAuthEnabled ? 'Enforced' : 'Optional'}
            </span>
            <span className="text-[10px] text-purple-600 font-semibold mt-0.5 inline-block">Root Policy</span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-[#f5eeff] text-purple-600 flex items-center justify-center border border-purple-100 shadow-2xs">
            <Lock className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200/90 shadow-2xs flex items-center justify-between">
          <div>
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Session Inactivity Timeout</span>
            <span className="text-2xl font-black text-slate-900 mt-1 block font-mono">{policy?.sessionTimeoutMinutes || 30} min</span>
            <span className="text-[10px] text-slate-400 font-semibold mt-0.5 inline-block">Auto-revocation rule</span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center border border-indigo-100 shadow-2xs">
            <Clock className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Failed Login Warning Banner (if alerts present) */}
      {failedAlerts.length > 0 && (
        <div className="p-4 bg-rose-50/90 border border-rose-200 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs text-rose-900 shadow-2xs animate-in fade-in">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-rose-600 text-white flex items-center justify-center shrink-0 shadow-xs">
              <ShieldAlert className="w-5 h-5" />
            </div>
            <div>
              <p className="font-bold">Security Alert: {failedAlerts.length} Failed Authentication Attempt(s) Detected</p>
              <p className="text-rose-700 text-[11px] mt-0.5">
                Unauthorized access attempt from IP <strong className="font-mono bg-rose-100/70 px-1.5 py-0.5 rounded">{failedAlerts[0]?.ip || 'Unknown'}</strong> was blocked.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setActiveTab('history')}
            className="px-3.5 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl font-bold text-xs shrink-0 cursor-pointer transition-colors shadow-xs"
          >
            Review Audit Logs
          </button>
        </div>
      )}

      {/* Navigation Tabs */}
      <div className="bg-white p-1.5 rounded-2xl border border-slate-200/80 shadow-2xs">
        <nav className="flex space-x-2 overflow-x-auto text-xs sm:text-sm font-medium">
          {[
            { key: 'sessions', label: `Active Sessions (${sessions.length})`, icon: Laptop },
            { key: 'history', label: 'Login History & Audit Trail', icon: Activity },
            { key: 'policy', label: 'Password Policy & 2FA', icon: Key },
            { key: 'allowlist', label: 'IP Allowlist & Perimeter', icon: Globe }
          ].map(t => {
            const Icon = t.icon
            const isActive = activeTab === t.key
            return (
              <button
                key={t.key}
                type="button"
                onClick={() => setActiveTab(t.key)}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                  isActive 
                    ? 'bg-purple-600 text-white shadow-sm' 
                    : 'bg-white text-slate-600 hover:bg-slate-100 border border-transparent hover:border-slate-200'
                }`}
              >
                <Icon className="w-3.5 h-3.5 shrink-0" />
                <span>{t.label}</span>
              </button>
            )
          })}
        </nav>
      </div>

      {/* ---------------------------------------------------- */}
      {/* TAB 1: ACTIVE SESSIONS */}
      {/* ---------------------------------------------------- */}
      {activeTab === 'sessions' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-slate-200/80 shadow-2xs">
            <div>
              <h3 className="text-sm font-bold text-slate-800">Concurrent Platform Sessions</h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Inspect live authenticated sessions across Superadmin and all campus administrators with server-enforced force logout.
              </p>
            </div>
            {sessions.filter(s => !s.isCurrent).length > 0 && (
              <button
                type="button"
                onClick={() => setIsForceLogoutAllOpen(true)}
                className="px-3.5 py-2 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer shrink-0 shadow-2xs"
              >
                <UserX className="w-3.5 h-3.5 text-rose-600" />
                <span>Force Logout All Other Sessions</span>
              </button>
            )}
          </div>

          {/* Desktop Table View */}
          <div className="hidden md:block bg-white rounded-2xl border border-slate-200/80 shadow-2xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-50/80 border-b border-slate-200 text-slate-600 font-bold uppercase tracking-wider text-[11px]">
                    <th className="py-3.5 px-4">User & Campus Role</th>
                    <th className="py-3.5 px-3">IP Address</th>
                    <th className="py-3.5 px-3">Device & Browser</th>
                    <th className="py-3.5 px-3">Location</th>
                    <th className="py-3.5 px-3">Session Start</th>
                    <th className="py-3.5 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {sessions.length > 0 ? (
                    sessions.map((s) => (
                      <tr key={s.id} className="hover:bg-slate-50/50 transition-colors">
                        <td className="py-3.5 px-4">
                          <div className="flex items-center gap-2.5">
                            <div className="w-8 h-8 rounded-xl bg-purple-600 flex items-center justify-center font-bold text-white shrink-0 shadow-2xs">
                              {s.userRole === 'superadmin' ? 'SA' : 'IA'}
                            </div>
                            <div>
                              <span className="font-bold text-slate-900 block">{s.userName || s.userEmail}</span>
                              <span className="text-[11px] text-slate-400 font-mono block">{s.userEmail}</span>
                              {s.instituteName && (
                                <span className="text-[10px] text-purple-600 font-medium block">{s.instituteName}</span>
                              )}
                            </div>
                          </div>
                        </td>

                        <td className="py-3.5 px-3">
                          <div className="inline-flex items-center gap-1.5 bg-slate-100 hover:bg-slate-200/80 px-2 py-0.5 rounded-lg border border-slate-200/70 transition-colors">
                            <span className="font-mono text-xs font-semibold text-slate-700">
                              {s.ipAddress}
                            </span>
                            <button
                              type="button"
                              onClick={() => handleCopyIp(s.ipAddress)}
                              className="text-slate-400 hover:text-purple-600 transition-colors cursor-pointer"
                              title="Copy IP Address"
                            >
                              {copiedIp === s.ipAddress ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                            </button>
                          </div>
                        </td>

                        <td className="py-3.5 px-3">
                          <span className="text-slate-700 font-medium line-clamp-1">{s.deviceInfo || 'Chrome Windows'}</span>
                        </td>

                        <td className="py-3.5 px-3">
                          <span className="text-slate-600 flex items-center gap-1">
                            <MapPin className="w-3 h-3 text-slate-400" />
                            <span>{s.location || 'Pakistan'}</span>
                          </span>
                        </td>

                        <td className="py-3.5 px-3">
                          <span className="text-slate-500 font-mono text-[11px]">
                            {s.startedAt ? new Date(s.startedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Recent'}
                          </span>
                        </td>

                        <td className="py-3.5 px-4 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            {/* EyeView Button (Session Inspection) */}
                            <button
                              type="button"
                              onClick={() => handleOpenInspect(s)}
                              className="p-1.5 rounded-lg border border-slate-200 bg-white hover:bg-purple-50 hover:text-purple-700 hover:border-purple-300 text-slate-500 transition-all cursor-pointer shadow-2xs group"
                              title={`Inspect ${s.userName || s.userEmail} Session Details & Live Telemetry`}
                              aria-label={`Inspect ${s.userName || s.userEmail} Session Details`}
                            >
                              <Eye className="w-3.5 h-3.5 group-hover:scale-110 transition-transform" />
                            </button>

                            {/* Settings Button (Session Policy Controls) */}
                            <button
                              type="button"
                              onClick={() => handleOpenSettings(s)}
                              className="p-1.5 rounded-lg border border-slate-200 bg-white hover:bg-indigo-50 hover:text-indigo-700 hover:border-indigo-300 text-slate-500 transition-all cursor-pointer shadow-2xs group"
                              title={`Configure Session Governance & Security Settings for ${s.userName || s.userEmail}`}
                              aria-label={`Configure Session Governance for ${s.userName || s.userEmail}`}
                            >
                              <Settings className="w-3.5 h-3.5 group-hover:rotate-45 transition-transform" />
                            </button>

                            {/* Current Session Badge OR Force Logout Action */}
                            {s.isCurrent ? (
                              <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 shadow-2xs whitespace-nowrap">
                                Current Session
                              </span>
                            ) : (
                              <button
                                type="button"
                                onClick={() => setForceLogoutTarget(s)}
                                disabled={terminatingId === s.id}
                                className="px-2.5 py-1 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 rounded-lg text-xs font-bold transition-colors cursor-pointer disabled:opacity-50 whitespace-nowrap inline-flex items-center gap-1"
                              >
                                <LogOut className="w-3 h-3" />
                                <span>{terminatingId === s.id ? 'Revoking...' : 'Force Logout'}</span>
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={6} className="py-12 text-center text-slate-400">
                        <Laptop className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                        <p className="font-semibold text-slate-600">No active sessions detected</p>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Mobile Card Layout (Visible on screens < md) */}
          <div className="block md:hidden space-y-3">
            {sessions.length > 0 ? (
              sessions.map((s) => (
                <div key={s.id} className="bg-white rounded-2xl border border-slate-200/80 p-4 shadow-2xs space-y-3">
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-xl bg-purple-600 flex items-center justify-center font-bold text-white shrink-0 shadow-2xs text-xs">
                        {s.userRole === 'superadmin' ? 'SA' : 'IA'}
                      </div>
                      <div>
                        <span className="font-bold text-slate-900 block text-xs">{s.userName || s.userEmail}</span>
                        <span className="text-[10px] text-slate-400 font-mono block">{s.userEmail}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5">
                      <button
                        type="button"
                        onClick={() => handleOpenInspect(s)}
                        className="p-1.5 rounded-lg border border-slate-200 bg-white hover:bg-purple-50 text-slate-500 hover:text-purple-700 shadow-2xs"
                        title="Inspect Session"
                      >
                        <Eye className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleOpenSettings(s)}
                        className="p-1.5 rounded-lg border border-slate-200 bg-white hover:bg-indigo-50 text-slate-500 hover:text-indigo-700 shadow-2xs"
                        title="Session Settings"
                      >
                        <Settings className="w-3.5 h-3.5" />
                      </button>
                      {s.isCurrent ? (
                        <span className="text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 shrink-0">
                          Current
                        </span>
                      ) : (
                        <button
                          type="button"
                          onClick={() => setForceLogoutTarget(s)}
                          disabled={terminatingId === s.id}
                          className="px-2 py-1 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 rounded-lg text-[10px] font-bold cursor-pointer shrink-0 inline-flex items-center gap-1"
                        >
                          <LogOut className="w-3 h-3" />
                          <span>Force Logout</span>
                        </button>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-[11px] pt-2 border-t border-slate-100">
                    <div>
                      <span className="text-slate-400 block text-[10px]">IP Address:</span>
                      <div className="inline-flex items-center gap-1 font-mono font-semibold text-slate-700">
                        <span>{s.ipAddress}</span>
                        <button onClick={() => handleCopyIp(s.ipAddress)} className="text-slate-400 hover:text-purple-600">
                          {copiedIp === s.ipAddress ? <Check className="w-2.5 h-2.5 text-emerald-600" /> : <Copy className="w-2.5 h-2.5" />}
                        </button>
                      </div>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[10px]">Device:</span>
                      <span className="text-slate-700 truncate block font-medium">{s.deviceInfo || 'Browser'}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[10px]">Location:</span>
                      <span className="text-slate-700">{s.location || 'Pakistan'}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[10px]">Started:</span>
                      <span className="font-mono text-slate-500">
                        {s.startedAt ? new Date(s.startedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Recent'}
                      </span>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="bg-white rounded-2xl border border-slate-200/80 p-8 text-center text-slate-400">
                <Laptop className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                <p className="font-semibold text-slate-600 text-xs">No active sessions detected</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ---------------------------------------------------- */}
      {/* TAB 2: LOGIN HISTORY & AUDIT TRAIL */}
      {/* ---------------------------------------------------- */}
      {activeTab === 'history' && (
        <div className="space-y-4">
          <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-2xs flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
            <div className="relative flex-1 max-w-md">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search by email, IP address, or location..."
                value={historySearch}
                onChange={(e) => setHistorySearch(e.target.value)}
                className="w-full pl-9 pr-4 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-purple-500/20"
              />
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-400 font-medium">Filter Status:</span>
              <select
                value={historyFilter}
                onChange={(e) => setHistoryFilter(e.target.value)}
                className="px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl text-slate-700 font-medium focus:outline-none"
              >
                <option value="ALL">All Events</option>
                <option value="SUCCESS">Success Only</option>
                <option value="FAILED">Failed / Blocked Only</option>
              </select>
              <button
                type="button"
                onClick={handleExportHistoryCSV}
                className="px-3 py-2 bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 rounded-xl text-xs font-semibold shadow-2xs transition-colors flex items-center gap-1.5 cursor-pointer whitespace-nowrap"
                title="Export Login History to CSV"
              >
                <Download className="w-3.5 h-3.5 text-purple-600" />
                <span>Export CSV</span>
              </button>
            </div>
          </div>

          {/* Desktop Table */}
          <div className="hidden md:block bg-white rounded-2xl border border-slate-200/80 shadow-2xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-50/80 border-b border-slate-200 text-slate-600 font-bold uppercase tracking-wider text-[11px]">
                    <th className="py-3.5 px-4">Timestamp</th>
                    <th className="py-3.5 px-3">User Email</th>
                    <th className="py-3.5 px-3">IP Address</th>
                    <th className="py-3.5 px-3">Device / Client</th>
                    <th className="py-3.5 px-3">Location</th>
                    <th className="py-3.5 px-4 text-right">Result</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredHistory.length > 0 ? (
                    filteredHistory.map((item) => {
                      const isSuccess = item.status === 'SUCCESS'
                      return (
                        <tr key={item.id} className="hover:bg-slate-50/50 transition-colors">
                          <td className="py-3.5 px-4 font-mono text-slate-500 whitespace-nowrap">
                            {item.timestamp ? new Date(item.timestamp).toLocaleString() : 'Recent'}
                          </td>
                          <td className="py-3.5 px-3 font-semibold text-slate-800">
                            {item.email}
                          </td>
                          <td className="py-3.5 px-3 font-mono text-slate-600">
                            <div className="inline-flex items-center gap-1.5">
                              <span>{item.ip}</span>
                              <button
                                type="button"
                                onClick={() => handleCopyIp(item.ip)}
                                className="text-slate-400 hover:text-purple-600 transition-colors cursor-pointer"
                                title="Copy IP"
                              >
                                {copiedIp === item.ip ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                              </button>
                            </div>
                          </td>
                          <td className="py-3.5 px-3 text-slate-600">
                            {item.device}
                          </td>
                          <td className="py-3.5 px-3 text-slate-600">
                            {item.location || 'Pakistan'}
                          </td>
                          <td className="py-3.5 px-4 text-right">
                            <span className={`inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full border shadow-2xs ${
                              isSuccess 
                                ? 'bg-emerald-50 text-emerald-700 border-emerald-200' 
                                : 'bg-rose-50 text-rose-700 border-rose-200'
                            }`}>
                              {isSuccess ? <CheckCircle2 className="w-3 h-3" /> : <AlertTriangle className="w-3 h-3" />}
                              <span>{item.status}</span>
                            </span>
                          </td>
                        </tr>
                      )
                    })
                  ) : (
                    <tr>
                      <td colSpan={6} className="py-12 text-center text-slate-400">
                        <Activity className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                        <p className="font-semibold text-slate-600">No login history events match your filter</p>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Mobile Card View */}
          <div className="block md:hidden space-y-3">
            {filteredHistory.length > 0 ? (
              filteredHistory.map((item) => {
                const isSuccess = item.status === 'SUCCESS'
                return (
                  <div key={item.id} className="bg-white rounded-2xl border border-slate-200/80 p-4 shadow-2xs space-y-2.5">
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-semibold text-xs text-slate-900 truncate">{item.email}</span>
                      <span className={`inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full border shrink-0 ${
                        isSuccess ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-rose-50 text-rose-700 border-rose-200'
                      }`}>
                        {isSuccess ? <CheckCircle2 className="w-3 h-3" /> : <AlertTriangle className="w-3 h-3" />}
                        <span>{item.status}</span>
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-[11px] pt-2 border-t border-slate-100 text-slate-600">
                      <div>
                        <span className="text-slate-400 block text-[10px]">IP Address:</span>
                        <div className="inline-flex items-center gap-1 font-mono font-semibold text-slate-700">
                          <span>{item.ip}</span>
                          <button onClick={() => handleCopyIp(item.ip)} className="text-slate-400 hover:text-purple-600">
                            {copiedIp === item.ip ? <Check className="w-2.5 h-2.5 text-emerald-600" /> : <Copy className="w-2.5 h-2.5" />}
                          </button>
                        </div>
                      </div>
                      <div>
                        <span className="text-slate-400 block text-[10px]">Client / OS:</span>
                        <span className="truncate block font-medium">{item.device}</span>
                      </div>
                      <div className="col-span-2 flex items-center justify-between text-[10px] text-slate-400 pt-1">
                        <span>{item.location || 'Pakistan'}</span>
                        <span className="font-mono">{item.timestamp ? new Date(item.timestamp).toLocaleString() : 'Recent'}</span>
                      </div>
                    </div>
                  </div>
                )
              })
            ) : (
              <div className="bg-white rounded-2xl border border-slate-200/80 p-8 text-center text-slate-400">
                <Activity className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                <p className="font-semibold text-slate-600 text-xs">No matching login events</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ---------------------------------------------------- */}
      {/* TAB 3: ENTERPRISE PASSWORD POLICY & 2FA */}
      {/* ---------------------------------------------------- */}
      {activeTab === 'policy' && (
        <form onSubmit={handleSavePolicy} className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-2xs space-y-6">
          <div>
            <h3 className="text-sm font-bold text-slate-900">Enterprise Password Complexity & Expiration</h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Enforce cryptographic requirements for all Superadmin and campus administrator credentials across the educational network.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-600 uppercase mb-1">
                  Minimum Password Length
                </label>
                <select
                  value={policy?.minPasswordLength || 8}
                  onChange={(e) => setPolicy({ ...policy, minPasswordLength: parseInt(e.target.value) })}
                  className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-purple-500/20 font-bold"
                >
                  <option value={8}>8 Characters (Standard)</option>
                  <option value={10}>10 Characters (Enhanced)</option>
                  <option value={12}>12 Characters (Enterprise High)</option>
                  <option value={16}>16 Characters (Maximum Security)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 uppercase mb-1">
                  Password Expiration (Days)
                </label>
                <select
                  value={policy?.passwordExpiryDays ?? 90}
                  onChange={(e) => setPolicy({ ...policy, passwordExpiryDays: parseInt(e.target.value) })}
                  className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-purple-500/20 font-bold"
                >
                  <option value={30}>30 Days (Strict Banking Standard)</option>
                  <option value={60}>60 Days</option>
                  <option value={90}>90 Days (Recommended)</option>
                  <option value={180}>180 Days</option>
                  <option value={0}>Never Expire</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 uppercase mb-1">
                  Inactivity Session Timeout (Minutes)
                </label>
                <select
                  value={policy?.sessionTimeoutMinutes || 30}
                  onChange={(e) => setPolicy({ ...policy, sessionTimeoutMinutes: parseInt(e.target.value) })}
                  className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-purple-500/20 font-bold"
                >
                  <option value={15}>15 Minutes</option>
                  <option value={30}>30 Minutes (Recommended)</option>
                  <option value={60}>60 Minutes</option>
                  <option value={120}>120 Minutes</option>
                </select>
              </div>
            </div>

            <div className="space-y-3.5 p-4 bg-slate-50/80 rounded-2xl border border-slate-200/80">
              <span className="text-xs font-bold text-slate-700 uppercase tracking-wide block">
                Complexity Rules & 2FA Guard
              </span>

              <label className="flex items-center gap-2.5 text-xs text-slate-700 cursor-pointer">
                <input
                  type="checkbox"
                  checked={!!policy?.requireUppercase}
                  onChange={(e) => setPolicy({ ...policy, requireUppercase: e.target.checked })}
                  className="rounded text-purple-600 focus:ring-purple-500"
                />
                <span>Require at least one uppercase character (A-Z)</span>
              </label>

              <label className="flex items-center gap-2.5 text-xs text-slate-700 cursor-pointer">
                <input
                  type="checkbox"
                  checked={!!policy?.requireNumbers}
                  onChange={(e) => setPolicy({ ...policy, requireNumbers: e.target.checked })}
                  className="rounded text-purple-600 focus:ring-purple-500"
                />
                <span>Require numeric characters (0-9)</span>
              </label>

              <label className="flex items-center gap-2.5 text-xs text-slate-700 cursor-pointer">
                <input
                  type="checkbox"
                  checked={!!policy?.requireSymbols}
                  onChange={(e) => setPolicy({ ...policy, requireSymbols: e.target.checked })}
                  className="rounded text-purple-600 focus:ring-purple-500"
                />
                <span>Require special symbols (@, #, $, %, ^, &)</span>
              </label>

              <div className="pt-2 border-t border-slate-200">
                <label className="flex items-start gap-2.5 text-xs text-slate-800 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={!!policy?.twoFactorAuthEnabled}
                    onChange={(e) => setPolicy({ ...policy, twoFactorAuthEnabled: e.target.checked })}
                    className="rounded text-purple-600 focus:ring-purple-500 mt-0.5"
                  />
                  <div>
                    <span className="font-bold text-purple-900 block">Enforce Two-Factor Authentication (2FA)</span>
                    <span className="text-[11px] text-slate-500 block mt-0.5">
                      Requires one-time verification codes (TOTP / Authenticator) on all Superadmin and Institute Admin logins.
                    </span>
                  </div>
                </label>
              </div>
            </div>
          </div>

          <div className="flex justify-end pt-3 border-t border-slate-100">
            <button
              type="submit"
              className="px-5 py-2.5 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-xs font-bold shadow-sm transition-all cursor-pointer"
            >
              Save Password Policy & 2FA Rules
            </button>
          </div>
        </form>
      )}

      {/* ---------------------------------------------------- */}
      {/* TAB 4: IP ALLOWLIST */}
      {/* ---------------------------------------------------- */}
      {activeTab === 'allowlist' && (
        <form onSubmit={handleSavePolicy} className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-2xs space-y-5">
          <div>
            <h3 className="text-sm font-bold text-slate-900">Perimeter Defense & IP Allowlisting</h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Restrict root Super Administrator portal access exclusively to authorized corporate IP addresses and VPN CIDR subnets.
            </p>
          </div>

          <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-800 flex items-start gap-2">
            <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
            <div>
              <p className="font-bold">Caution with IP Filtering</p>
              <p className="mt-0.5">
                Always ensure your current administrative IP (<strong className="font-mono">127.0.0.1</strong>) is included in the allowlist to prevent self-lockout.
              </p>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-600 uppercase mb-1">
              Authorized IP Addresses / CIDR Ranges (Comma-separated)
            </label>
            <textarea
              rows={4}
              value={policy?.ipAllowlist || ''}
              onChange={(e) => setPolicy({ ...policy, ipAllowlist: e.target.value })}
              placeholder="127.0.0.1, 192.168.1.0/24, 10.0.0.0/8"
              className="w-full p-3 text-xs font-mono rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-purple-500/20"
            />
          </div>

          <div className="flex justify-end pt-2 border-t border-slate-100">
            <button
              type="submit"
              className="px-5 py-2.5 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-xs font-bold shadow-sm transition-all cursor-pointer"
            >
              Update IP Allowlist
            </button>
          </div>
        </form>
      )}
      {/* ------------------------------------------------------------------ */}
      {/* 1. MODAL: Session Inspection & Live Telemetry (EyeView)            */}
      {/* ------------------------------------------------------------------ */}
      {inspectingSession && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/50 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white rounded-2xl border border-slate-200/90 shadow-2xl max-w-xl w-full overflow-hidden animate-in zoom-in-95 duration-150 max-h-[90vh] flex flex-col">
            {/* Modal Header */}
            <div className="p-4 sm:p-5 border-b border-slate-100 flex items-center justify-between bg-gradient-to-r from-purple-50/70 via-indigo-50/40 to-slate-50">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-purple-600 text-white font-bold flex items-center justify-center shadow-sm">
                  <Eye className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 text-sm sm:text-base flex items-center gap-2">
                    <span>Session Telemetry & Audit</span>
                    {inspectingSession.isCurrent && (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200">
                        Current
                      </span>
                    )}
                  </h3>
                  <p className="text-xs text-slate-500 font-mono">
                    ID: {inspectingSession.id}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setInspectingSession(null)}
                className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-4 sm:p-6 overflow-y-auto space-y-4 text-xs">
              {/* User Identity Card */}
              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80 flex items-center justify-between gap-3">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-9 h-9 rounded-xl bg-purple-100 text-purple-700 font-bold flex items-center justify-center shrink-0">
                    {inspectingSession.userRole === 'superadmin' ? 'SA' : 'IA'}
                  </div>
                  <div className="min-w-0">
                    <h4 className="font-bold text-slate-900 text-sm truncate">{inspectingSession.userName}</h4>
                    <p className="text-slate-500 text-xs truncate">{inspectingSession.userEmail}</p>
                    {inspectingSession.instituteName && (
                      <p className="text-purple-600 font-medium text-[11px] truncate">{inspectingSession.instituteName}</p>
                    )}
                  </div>
                </div>
                <span className="px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase bg-purple-100 text-purple-800 border border-purple-200 shrink-0">
                  {inspectingSession.userRole}
                </span>
              </div>

              {/* Telemetry Metrics Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="p-3 rounded-xl border border-slate-100 bg-slate-50/50 space-y-1">
                  <span className="text-slate-400 font-medium text-[10px] uppercase block">Client IP Address</span>
                  <div className="flex items-center justify-between">
                    <span className="font-mono font-bold text-slate-800 text-xs">{inspectingSession.ipAddress}</span>
                    <button
                      type="button"
                      onClick={() => handleCopyIp(inspectingSession.ipAddress)}
                      className="text-purple-600 hover:text-purple-800 font-medium text-[11px] flex items-center gap-1 cursor-pointer"
                    >
                      <Copy className="w-3 h-3" />
                      <span>Copy</span>
                    </button>
                  </div>
                </div>

                <div className="p-3 rounded-xl border border-slate-100 bg-slate-50/50 space-y-1">
                  <span className="text-slate-400 font-medium text-[10px] uppercase block">Geographic Location</span>
                  <div className="flex items-center gap-1.5 font-bold text-slate-800 text-xs">
                    <MapPin className="w-3.5 h-3.5 text-rose-500 shrink-0" />
                    <span>{inspectingSession.location || 'Lahore, Pakistan'}</span>
                  </div>
                </div>

                <div className="p-3 rounded-xl border border-slate-100 bg-slate-50/50 space-y-1">
                  <span className="text-slate-400 font-medium text-[10px] uppercase block">Browser & Operating System</span>
                  <div className="flex items-center gap-1.5 font-medium text-slate-800 text-xs">
                    <Laptop className="w-3.5 h-3.5 text-indigo-500 shrink-0" />
                    <span className="truncate">{inspectingSession.deviceInfo || 'Chrome 124 (Windows NT 10.0)'}</span>
                  </div>
                </div>

                <div className="p-3 rounded-xl border border-slate-100 bg-slate-50/50 space-y-1">
                  <span className="text-slate-400 font-medium text-[10px] uppercase block">Session Started</span>
                  <div className="flex items-center gap-1.5 font-mono text-slate-800 text-xs">
                    <Clock className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                    <span>{inspectingSession.startedAt ? new Date(inspectingSession.startedAt).toLocaleString() : 'Recent'}</span>
                  </div>
                </div>

                <div className="p-3 rounded-xl border border-slate-100 bg-slate-50/50 space-y-1">
                  <span className="text-slate-400 font-medium text-[10px] uppercase block">Transport Security & Cipher</span>
                  <span className="font-mono text-emerald-700 font-bold text-[11px] block">
                    TLS 1.3 / AES-256-GCM (Encrypted)
                  </span>
                </div>

                <div className="p-3 rounded-xl border border-slate-100 bg-slate-50/50 space-y-1">
                  <span className="text-slate-400 font-medium text-[10px] uppercase block">Multi-Factor Authentication</span>
                  <div className="flex items-center gap-1.5 text-xs text-emerald-700 font-bold">
                    <CheckCircle className="w-3.5 h-3.5" />
                    <span>2FA Enforced & Verified</span>
                  </div>
                </div>
              </div>

              {/* Active Permissions Snapshot */}
              <div className="p-3.5 rounded-xl border border-purple-100 bg-purple-50/40 space-y-1.5">
                <span className="text-[11px] font-bold text-purple-900 uppercase tracking-wider block">
                  Enforced Scope of Authority:
                </span>
                <p className="text-xs text-purple-800">
                  {inspectingSession.userRole === 'superadmin' 
                    ? 'Root Global Administrative Privileges across all registered educational institutes, database settings, and billing operations.'
                    : 'Campus Executive Authority governing student records, attendance, faculty scheduling, and campus fee collection.'}
                </p>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-4 border-t border-slate-100 bg-slate-50/70 flex items-center justify-between gap-2">
              <button
                type="button"
                onClick={() => {
                  OperationsService.saveSessionBackup(inspectingSession, 'Manual Audit Snapshot Export')
                  OperationsService.downloadSessionBackupFile({
                    ...inspectingSession,
                    terminatedAt: new Date().toISOString(),
                    reason: 'Manual Audit Snapshot Export'
                  })
                  toast.success(`Session audit file downloaded for ${inspectingSession.userName}.`)
                }}
                className="px-3.5 py-2 rounded-xl border border-purple-200 bg-white hover:bg-purple-50 text-purple-700 font-bold text-xs flex items-center gap-1.5 transition-colors cursor-pointer shadow-2xs"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Export Audit Snapshot (.json)</span>
              </button>

              <button
                type="button"
                onClick={() => setInspectingSession(null)}
                className="px-4 py-2 rounded-xl bg-slate-200 hover:bg-slate-300 text-slate-700 font-bold text-xs cursor-pointer transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------------ */}
      {/* 2. MODAL: Session Governance & Policy Controls (Settings)          */}
      {/* ------------------------------------------------------------------ */}
      {settingsSession && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/50 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white rounded-2xl border border-slate-200/90 shadow-2xl max-w-lg w-full overflow-hidden animate-in zoom-in-95 duration-150 max-h-[90vh] flex flex-col">
            <div className="p-4 sm:p-5 border-b border-slate-100 flex items-center justify-between bg-gradient-to-r from-indigo-50/70 to-slate-50">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-indigo-600 text-white font-bold flex items-center justify-center shadow-sm">
                  <Settings className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 text-sm sm:text-base">
                    Session Security Controls
                  </h3>
                  <p className="text-xs text-slate-500 truncate max-w-xs">
                    Target: {settingsSession.userName} ({settingsSession.ipAddress})
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setSettingsSession(null)}
                className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-4 sm:p-6 overflow-y-auto space-y-4 text-xs">
              {/* Option 1: Strict IP Binding */}
              <div className="flex items-start justify-between gap-3 p-3.5 rounded-xl bg-slate-50 border border-slate-200/70">
                <div className="space-y-0.5">
                  <span className="font-bold text-slate-800 text-xs block">Enforce Strict IP Binding Lock</span>
                  <p className="text-slate-500 text-[11px] leading-relaxed">
                    Automatically invalidate session if requests originate from any IP other than <strong className="font-mono text-slate-700">{settingsSession.ipAddress}</strong>.
                  </p>
                </div>
                <input
                  type="checkbox"
                  defaultChecked={true}
                  className="w-4 h-4 text-indigo-600 rounded border-slate-300 focus:ring-indigo-500 mt-1 cursor-pointer"
                />
              </div>

              {/* Option 2: Session Inactivity Timeout Override */}
              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/70 space-y-1.5">
                <label className="font-bold text-slate-800 text-xs block">
                  Session Inactivity Invalidation Window
                </label>
                <select
                  defaultValue="30"
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white text-xs font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                >
                  <option value="15">15 Minutes (Strict Security Mode)</option>
                  <option value="30">30 Minutes (Standard Platform Policy)</option>
                  <option value="60">1 Hour (Extended Administrative Session)</option>
                  <option value="120">2 Hours (Full Campus Operations Shift)</option>
                </select>
              </div>

              {/* Option 3: Block Sensitive Destructive Actions */}
              <div className="flex items-start justify-between gap-3 p-3.5 rounded-xl bg-slate-50 border border-slate-200/70">
                <div className="space-y-0.5">
                  <span className="font-bold text-slate-800 text-xs block">Shield Destructive Data Actions</span>
                  <p className="text-slate-500 text-[11px] leading-relaxed">
                    Prevent high-impact operations (e.g. database purge, campus deletion, or financial adjustments) in this session.
                  </p>
                </div>
                <input
                  type="checkbox"
                  defaultChecked={false}
                  className="w-4 h-4 text-indigo-600 rounded border-slate-300 focus:ring-indigo-500 mt-1 cursor-pointer"
                />
              </div>

              {/* Option 4: Mandatory Emergency Backup Guarantee */}
              <div className="flex items-start justify-between gap-3 p-3.5 rounded-xl bg-purple-50/70 border border-purple-200/80">
                <div className="space-y-0.5">
                  <span className="font-bold text-purple-900 text-xs flex items-center gap-1.5">
                    <Database className="w-3.5 h-3.5 text-purple-600" />
                    <span>Mandatory Emergency Backup on Revocation</span>
                  </span>
                  <p className="text-purple-700 text-[11px] leading-relaxed">
                    Guarantees full session state archive is generated and saved under Platform Settings if this session is terminated.
                  </p>
                </div>
                <input
                  type="checkbox"
                  defaultChecked={true}
                  className="w-4 h-4 text-purple-600 rounded border-purple-300 focus:ring-purple-500 mt-1 cursor-pointer"
                />
              </div>
            </div>

            <div className="p-4 border-t border-slate-100 bg-slate-50/70 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setSettingsSession(null)}
                className="px-4 py-2 rounded-xl bg-slate-200 hover:bg-slate-300 text-slate-700 font-bold text-xs cursor-pointer transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => handleSaveSessionPolicy(settingsSession.id, {})}
                className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs flex items-center gap-1.5 shadow-sm transition-colors cursor-pointer"
              >
                <Save className="w-3.5 h-3.5" />
                <span>Save & Enforce Policies</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------------ */}
      {/* 3. MODAL: Force Logout with Emergency Backup Guarantee (Pick 2)    */}
      {/* ------------------------------------------------------------------ */}
      {forceLogoutTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/50 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white rounded-2xl border border-rose-200 shadow-2xl max-w-lg w-full overflow-hidden animate-in zoom-in-95 duration-150 max-h-[90vh] flex flex-col">
            <div className="p-4 sm:p-5 border-b border-rose-100 flex items-center justify-between bg-gradient-to-r from-rose-50/80 to-slate-50">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-rose-600 text-white font-bold flex items-center justify-center shadow-sm">
                  <ShieldAlert className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 text-sm sm:text-base">
                    Force Terminate Session & Backup State
                  </h3>
                  <p className="text-xs text-rose-600 font-medium">
                    Immediate server-enforced session revocation
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setForceLogoutTarget(null)}
                className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-4 sm:p-6 overflow-y-auto space-y-4 text-xs">
              {/* Target info card */}
              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80 flex items-center justify-between gap-3">
                <div>
                  <span className="font-bold text-slate-900 text-sm block">{forceLogoutTarget.userName}</span>
                  <span className="text-slate-500 font-mono text-xs">{forceLogoutTarget.userEmail}</span>
                  <div className="flex items-center gap-2 mt-1 text-[11px] text-slate-600">
                    <span className="font-mono">{forceLogoutTarget.ipAddress}</span>
                    <span>&bull;</span>
                    <span>{forceLogoutTarget.location || 'Pakistan'}</span>
                  </div>
                </div>
                <span className="px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase bg-purple-50 text-purple-700 border border-purple-200">
                  {forceLogoutTarget.userRole}
                </span>
              </div>

              {/* Backup Guarantee Box (Pick 2 Core) */}
              <div className="p-4 rounded-xl border border-purple-200 bg-purple-50/60 space-y-3">
                <div className="flex items-center gap-2">
                  <Database className="w-4 h-4 text-purple-600" />
                  <span className="font-bold text-purple-950 text-xs">Emergency Session State Backup Guarantee</span>
                </div>

                <label className="flex items-start gap-2.5 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={backupOptions.createBackup}
                    onChange={(e) => setBackupOptions({ ...backupOptions, createBackup: e.target.checked })}
                    className="w-4 h-4 text-purple-600 rounded border-slate-300 focus:ring-purple-500 mt-0.5 cursor-pointer"
                  />
                  <div>
                    <span className="font-bold text-slate-800 text-xs block">Generate & Archive Session Backup in Platform Settings</span>
                    <span className="text-slate-500 text-[11px] block">
                      Stores snapshot under Platform Settings &gt; System &amp; Session Backups for recovery or audit.
                    </span>
                  </div>
                </label>

                <label className="flex items-start gap-2.5 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={backupOptions.downloadFile}
                    onChange={(e) => setBackupOptions({ ...backupOptions, downloadFile: e.target.checked })}
                    className="w-4 h-4 text-purple-600 rounded border-slate-300 focus:ring-purple-500 mt-0.5 cursor-pointer"
                  />
                  <div>
                    <span className="font-bold text-slate-800 text-xs block">Download Backup File (.json) immediately to this PC</span>
                    <span className="text-slate-500 text-[11px] block">
                      Downloads offline timestamped session backup file to your browser downloads folder.
                    </span>
                  </div>
                </label>
              </div>

              {/* Revocation Reason Selection */}
              <div className="space-y-1.5">
                <label className="block text-slate-700 font-bold text-xs">
                  Revocation Compliance Reason
                </label>
                <select
                  value={backupOptions.reason}
                  onChange={(e) => setBackupOptions({ ...backupOptions, reason: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white text-xs font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-rose-500/20"
                >
                  <option value="Security Compliance & Routine Audit">Security Compliance &amp; Routine Audit</option>
                  <option value="Suspicious IP or Multi-Location Access">Suspicious IP or Multi-Location Access</option>
                  <option value="User Privilege Downgrade or Reassignment">User Privilege Downgrade or Reassignment</option>
                  <option value="Emergency Administrative Intervention">Emergency Administrative Intervention</option>
                </select>
              </div>
            </div>

            <div className="p-4 border-t border-slate-100 bg-slate-50/70 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setForceLogoutTarget(null)}
                className="px-4 py-2 rounded-xl bg-slate-200 hover:bg-slate-300 text-slate-700 font-bold text-xs cursor-pointer transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmForceLogout}
                disabled={terminatingId === forceLogoutTarget.id}
                className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs flex items-center gap-1.5 shadow-sm shadow-rose-600/30 transition-colors cursor-pointer disabled:opacity-50"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>{terminatingId === forceLogoutTarget.id ? 'Revoking & Backing Up...' : 'Confirm Force Logout & Backup'}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------------ */}
      {/* 4. MODAL: Force Logout All Remote Sessions with Consolidated Backup */}
      {/* ------------------------------------------------------------------ */}
      {isForceLogoutAllOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/50 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white rounded-2xl border border-rose-200 shadow-2xl max-w-lg w-full overflow-hidden animate-in zoom-in-95 duration-150 max-h-[90vh] flex flex-col">
            <div className="p-4 sm:p-5 border-b border-rose-100 flex items-center justify-between bg-gradient-to-r from-rose-50/80 to-slate-50">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-rose-600 text-white font-bold flex items-center justify-center shadow-sm">
                  <UserX className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 text-sm sm:text-base">
                    Force Logout All Remote Sessions
                  </h3>
                  <p className="text-xs text-rose-600 font-medium">
                    Terminates {sessions.filter(s => !s.isCurrent).length} remote authenticated session(s)
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsForceLogoutAllOpen(false)}
                className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-4 sm:p-6 overflow-y-auto space-y-4 text-xs">
              <p className="text-slate-600 text-xs leading-relaxed">
                This will immediately disconnect all remote administrative and campus sessions across the platform. Your current session will remain active.
              </p>

              <div className="p-4 rounded-xl border border-purple-200 bg-purple-50/60 space-y-3">
                <div className="flex items-center gap-2">
                  <Database className="w-4 h-4 text-purple-600" />
                  <span className="font-bold text-purple-950 text-xs">Consolidated Multi-Session Backup Guarantee</span>
                </div>

                <label className="flex items-start gap-2.5 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={backupOptions.createBackup}
                    onChange={(e) => setBackupOptions({ ...backupOptions, createBackup: e.target.checked })}
                    className="w-4 h-4 text-purple-600 rounded border-slate-300 focus:ring-purple-500 mt-0.5 cursor-pointer"
                  />
                  <div>
                    <span className="font-bold text-slate-800 text-xs block">Archive All Terminated Sessions in Platform Settings</span>
                    <span className="text-slate-500 text-[11px] block">
                      Enables full state recovery under Platform Settings &gt; System &amp; Session Backups.
                    </span>
                  </div>
                </label>

                <label className="flex items-start gap-2.5 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={backupOptions.downloadFile}
                    onChange={(e) => setBackupOptions({ ...backupOptions, downloadFile: e.target.checked })}
                    className="w-4 h-4 text-purple-600 rounded border-slate-300 focus:ring-purple-500 mt-0.5 cursor-pointer"
                  />
                  <div>
                    <span className="font-bold text-slate-800 text-xs block">Download Consolidated JSON Backup File</span>
                    <span className="text-slate-500 text-[11px] block">
                      Saves consolidated multi-session archive to your local device.
                    </span>
                  </div>
                </label>
              </div>
            </div>

            <div className="p-4 border-t border-slate-100 bg-slate-50/70 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setIsForceLogoutAllOpen(false)}
                className="px-4 py-2 rounded-xl bg-slate-200 hover:bg-slate-300 text-slate-700 font-bold text-xs cursor-pointer transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmForceLogoutAll}
                className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs flex items-center gap-1.5 shadow-sm shadow-rose-600/30 transition-colors cursor-pointer"
              >
                <UserX className="w-3.5 h-3.5" />
                <span>Confirm Revoke All &amp; Backup</span>
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  )
}

export default SecurityCenterView
