import React, { useState, useEffect, useMemo } from 'react'
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
  Filter, 
  Save, 
  Radio, 
  LogOut, 
  Activity,
  MapPin,
  Check
} from 'lucide-react'
import { useAppData } from '../../../context/AppDataContext'
import { useToast } from '../../../context/ToastContext'
import Modal from '../../../components/common/Modal'
import { SecurityService } from '../../../services/securityService'

export const SecurityCenterView = () => {
  const { auditLogs = [], refreshData } = useAppData()
  const { toast } = useToast()

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
  const [historyFilter, setHistoryFilter] = useState('ALL') // ALL, SUCCESS, FAILED
  const [terminatingId, setTerminatingId] = useState(null)

  const loadSecurityData = async () => {
    setLoading(true)
    try {
      const [sessionsData, historyData, policyData] = await Promise.all([
        SecurityService.getActiveSessions(),
        SecurityService.getLoginHistory(),
        SecurityService.getSecurityPolicy()
      ])
      setSessions(sessionsData || [])
      setLoginHistory(historyData?.history || [])
      setFailedAlerts(historyData?.failedAlerts || [])
      if (policyData) setPolicy(policyData)
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadSecurityData()
  }, [])

  // Force Logout Single Session
  const handleForceLogout = async (session) => {
    if (session.isCurrent) {
      toast.warning('Cannot force-logout your current active session from here. Use Sign Out.')
      return
    }

    if (window.confirm(`Force terminate active session for "${session.userEmail}" (${session.ipAddress})?`)) {
      setTerminatingId(session.id)
      try {
        await SecurityService.forceLogoutSession(session.id, session.userEmail)
        setSessions(prev => prev.filter(s => s.id !== session.id))
        refreshData()
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
        await SecurityService.forceLogoutAllOthers()
        setSessions(prev => prev.filter(s => s.isCurrent))
        refreshData()
        toast.success('All remote platform sessions have been forcibly terminated.')
      } catch (e) {
        toast.error('Failed to terminate remote sessions')
      }
    }
  }

  // Save Security Policies
  const handleSavePolicy = async (e) => {
    e.preventDefault()
    try {
      await SecurityService.saveSecurityPolicy(policy)
      refreshData()
      toast.success('Enterprise security policy, password rules, and 2FA settings saved successfully!')
    } catch (e) {
      toast.error('Failed to save security policy')
    }
  }

  // Filter login history
  const filteredHistory = useMemo(() => {
    return loginHistory.filter(item => {
      const matchesSearch = 
        item.email.toLowerCase().includes(historySearch.toLowerCase()) ||
        item.ip.toLowerCase().includes(historySearch.toLowerCase()) ||
        (item.location && item.location.toLowerCase().includes(historySearch.toLowerCase()))
      const matchesFilter = historyFilter === 'ALL' || item.status === historyFilter
      return matchesSearch && matchesFilter
    })
  }, [loginHistory, historySearch, historyFilter])

  return (
    <div className="p-4 sm:p-6 md:p-8 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-indigo-600" />
            <h1 className="text-xl font-bold text-slate-900 tracking-tight">Enterprise Security Center</h1>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Real-time session governance, server-enforced force logout, password policies, 2FA, and intrusion monitoring
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={loadSecurityData}
            className="flex items-center gap-1.5 px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-semibold border border-slate-200 transition-all cursor-pointer"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Refresh Telemetry</span>
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs flex items-center justify-between">
          <div>
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Live Active Sessions</span>
            <span className="text-xl font-bold text-slate-900 mt-1 block">{sessions.length}</span>
            <span className="text-[10px] text-emerald-600 font-semibold mt-0.5 inline-block">Real-time monitored</span>
          </div>
          <div className="w-9 h-9 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <Radio className="w-5 h-5 animate-pulse" />
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs flex items-center justify-between">
          <div>
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Failed Logins / Alerts</span>
            <span className={`text-xl font-bold mt-1 block ${failedAlerts.length > 0 ? 'text-rose-600' : 'text-slate-900'}`}>
              {failedAlerts.length}
            </span>
            <span className="text-[10px] text-slate-400 font-semibold mt-0.5 inline-block">Last 24 Hours</span>
          </div>
          <div className="w-9 h-9 rounded-lg bg-rose-50 text-rose-600 flex items-center justify-center">
            <AlertTriangle className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs flex items-center justify-between">
          <div>
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">2FA Multi-Factor</span>
            <span className="text-xl font-bold text-slate-900 mt-1 block">
              {policy.twoFactorAuthEnabled ? 'Enforced' : 'Optional'}
            </span>
            <span className="text-[10px] text-indigo-600 font-semibold mt-0.5 inline-block">Root Policy</span>
          </div>
          <div className="w-9 h-9 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
            <Lock className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs flex items-center justify-between">
          <div>
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Session Inactivity Timeout</span>
            <span className="text-xl font-bold text-slate-900 mt-1 block">{policy.sessionTimeoutMinutes} min</span>
            <span className="text-[10px] text-slate-400 font-semibold mt-0.5 inline-block">Auto-revocation rule</span>
          </div>
          <div className="w-9 h-9 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
            <Clock className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Failed Login Warning Banner (if alerts present) */}
      {failedAlerts.length > 0 && (
        <div className="p-4 bg-rose-50/90 border border-rose-200 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs text-rose-900 shadow-2xs animate-in fade-in">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-rose-600 text-white flex items-center justify-center shrink-0">
              <ShieldAlert className="w-4 h-4" />
            </div>
            <div>
              <p className="font-bold">Security Alert: {failedAlerts.length} Failed Authentication Attempt(s) Detected</p>
              <p className="text-rose-700 text-[11px] mt-0.5">
                Unauthorized access attempt from IP <strong className="font-mono">{failedAlerts[0]?.ip}</strong> was blocked.
              </p>
            </div>
          </div>
          <button
            onClick={() => setActiveTab('history')}
            className="px-3 py-1.5 bg-rose-600 hover:bg-rose-700 text-white rounded-lg font-bold text-xs shrink-0 cursor-pointer"
          >
            Review Audit Logs
          </button>
        </div>
      )}

      {/* Tabs Navigation */}
      <div className="flex items-center gap-1.5 border-b border-slate-200 pb-2 text-xs">
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
              onClick={() => setActiveTab(t.key)}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                isActive 
                  ? 'bg-blue-600 text-white shadow-sm' 
                  : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{t.label}</span>
            </button>
          )
        })}
      </div>

      {/* ---------------------------------------------------- */}
      {/* TAB 1: ACTIVE SESSIONS */}
      {/* ---------------------------------------------------- */}
      {activeTab === 'sessions' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 bg-white p-4 rounded-xl border border-slate-200">
            <div>
              <h3 className="text-sm font-bold text-slate-800">Concurrent Platform Sessions</h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Inspect live authenticated sessions across Superadmin and all campus administrators with server-enforced force logout.
              </p>
            </div>
            {sessions.filter(s => !s.isCurrent).length > 0 && (
              <button
                onClick={handleForceLogoutAll}
                className="px-3.5 py-2 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <UserX className="w-3.5 h-3.5 text-rose-600" />
                <span>Force Logout All Other Sessions</span>
              </button>
            )}
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold uppercase tracking-wider text-[11px]">
                    <th className="py-3.5 px-4">User & Campus Role</th>
                    <th className="py-3.5 px-3">IP Address</th>
                    <th className="py-3.5 px-3">Device & Browser</th>
                    <th className="py-3.5 px-3">Location</th>
                    <th className="py-3.5 px-3">Session Start</th>
                    <th className="py-3.5 px-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {sessions.map((s) => (
                    <tr key={s.id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-2.5">
                          <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold text-white shrink-0 ${
                            s.userRole === 'superadmin' ? 'bg-purple-600' : 'bg-blue-600'
                          }`}>
                            {s.userRole === 'superadmin' ? 'SA' : 'IA'}
                          </div>
                          <div>
                            <span className="font-bold text-slate-900 block">{s.userName || s.userEmail}</span>
                            <span className="text-[11px] text-slate-400 font-mono block">{s.userEmail}</span>
                            {s.instituteName && (
                              <span className="text-[10px] text-blue-600 font-medium block">{s.instituteName}</span>
                            )}
                          </div>
                        </div>
                      </td>

                      <td className="py-3.5 px-3">
                        <span className="font-mono text-xs font-semibold px-2 py-0.5 rounded bg-slate-100 text-slate-700">
                          {s.ipAddress}
                        </span>
                      </td>

                      <td className="py-3.5 px-3">
                        <span className="text-slate-700 font-medium line-clamp-1">{s.deviceInfo}</span>
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

                      <td className="py-3.5 px-3 text-right">
                        {s.isCurrent ? (
                          <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                            Current Session
                          </span>
                        ) : (
                          <button
                            onClick={() => handleForceLogout(s)}
                            disabled={terminatingId === s.id}
                            className="px-2.5 py-1 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 rounded-md text-xs font-bold transition-colors cursor-pointer"
                          >
                            <LogOut className="w-3 h-3 inline mr-1" />
                            <span>Force Logout</span>
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ---------------------------------------------------- */}
      {/* TAB 2: LOGIN HISTORY & AUDIT TRAIL */}
      {/* ---------------------------------------------------- */}
      {activeTab === 'history' && (
        <div className="space-y-4">
          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
            <div className="relative flex-1 max-w-md">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search by email, IP address, or location..."
                value={historySearch}
                onChange={(e) => setHistorySearch(e.target.value)}
                className="w-full pl-9 pr-4 py-2 text-xs rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
              />
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-400 font-medium">Filter Status:</span>
              <select
                value={historyFilter}
                onChange={(e) => setHistoryFilter(e.target.value)}
                className="px-2.5 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-700 font-medium focus:outline-none"
              >
                <option value="ALL">All Events</option>
                <option value="SUCCESS">Success Only</option>
                <option value="FAILED">Failed / Blocked Only</option>
              </select>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold uppercase tracking-wider text-[11px]">
                    <th className="py-3.5 px-4">Timestamp</th>
                    <th className="py-3.5 px-3">User Email</th>
                    <th className="py-3.5 px-3">IP Address</th>
                    <th className="py-3.5 px-3">Device / Client</th>
                    <th className="py-3.5 px-3">Location</th>
                    <th className="py-3.5 px-3 text-right">Result</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredHistory.map((item) => {
                    const isSuccess = item.status === 'SUCCESS'
                    return (
                      <tr key={item.id} className="hover:bg-slate-50/50 transition-colors">
                        <td className="py-3.5 px-4 font-mono text-slate-500">
                          {new Date(item.timestamp).toLocaleString()}
                        </td>
                        <td className="py-3.5 px-3 font-semibold text-slate-800">
                          {item.email}
                        </td>
                        <td className="py-3.5 px-3 font-mono text-slate-600">
                          {item.ip}
                        </td>
                        <td className="py-3.5 px-3 text-slate-600">
                          {item.device}
                        </td>
                        <td className="py-3.5 px-3 text-slate-600">
                          {item.location || 'Pakistan'}
                        </td>
                        <td className="py-3.5 px-3 text-right">
                          <span className={`inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full border ${
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
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ---------------------------------------------------- */}
      {/* TAB 3: ENTERPRISE PASSWORD POLICY & 2FA */}
      {/* ---------------------------------------------------- */}
      {activeTab === 'policy' && (
        <form onSubmit={handleSavePolicy} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-6">
          <div>
            <h3 className="text-sm font-bold text-slate-900">Enterprise Password Complexity & Expiration</h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Enforce cryptographic requirements for all Superadmin and campus administrator credentials.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-600 uppercase mb-1">
                  Minimum Password Length
                </label>
                <select
                  value={policy.minPasswordLength}
                  onChange={(e) => setPolicy({ ...policy, minPasswordLength: parseInt(e.target.value) })}
                  className="w-full px-3.5 py-2 text-xs rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 font-bold"
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
                  value={policy.passwordExpiryDays}
                  onChange={(e) => setPolicy({ ...policy, passwordExpiryDays: parseInt(e.target.value) })}
                  className="w-full px-3.5 py-2 text-xs rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 font-bold"
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
                  value={policy.sessionTimeoutMinutes}
                  onChange={(e) => setPolicy({ ...policy, sessionTimeoutMinutes: parseInt(e.target.value) })}
                  className="w-full px-3.5 py-2 text-xs rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 font-bold"
                >
                  <option value={15}>15 Minutes</option>
                  <option value={30}>30 Minutes (Recommended)</option>
                  <option value={60}>60 Minutes</option>
                  <option value={120}>120 Minutes</option>
                </select>
              </div>
            </div>

            <div className="space-y-3.5 p-4 bg-slate-50 rounded-xl border border-slate-200">
              <span className="text-xs font-bold text-slate-700 uppercase tracking-wide block">
                Complexity Rules & 2FA Guard
              </span>

              <label className="flex items-center gap-2.5 text-xs text-slate-700 cursor-pointer">
                <input
                  type="checkbox"
                  checked={policy.requireUppercase}
                  onChange={(e) => setPolicy({ ...policy, requireUppercase: e.target.checked })}
                  className="rounded text-blue-600 focus:ring-blue-500"
                />
                <span>Require at least one uppercase character (A-Z)</span>
              </label>

              <label className="flex items-center gap-2.5 text-xs text-slate-700 cursor-pointer">
                <input
                  type="checkbox"
                  checked={policy.requireNumbers}
                  onChange={(e) => setPolicy({ ...policy, requireNumbers: e.target.checked })}
                  className="rounded text-blue-600 focus:ring-blue-500"
                />
                <span>Require numeric characters (0-9)</span>
              </label>

              <label className="flex items-center gap-2.5 text-xs text-slate-700 cursor-pointer">
                <input
                  type="checkbox"
                  checked={policy.requireSymbols}
                  onChange={(e) => setPolicy({ ...policy, requireSymbols: e.target.checked })}
                  className="rounded text-blue-600 focus:ring-blue-500"
                />
                <span>Require special symbols (@, #, $, %, ^, &)</span>
              </label>

              <div className="pt-2 border-t border-slate-200">
                <label className="flex items-start gap-2.5 text-xs text-slate-800 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={policy.twoFactorAuthEnabled}
                    onChange={(e) => setPolicy({ ...policy, twoFactorAuthEnabled: e.target.checked })}
                    className="rounded text-indigo-600 focus:ring-indigo-500 mt-0.5"
                  />
                  <div>
                    <span className="font-bold text-indigo-900 block">Enforce Two-Factor Authentication (2FA)</span>
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
              className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold shadow-sm transition-all cursor-pointer"
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
        <form onSubmit={handleSavePolicy} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-5">
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
              value={policy.ipAllowlist}
              onChange={(e) => setPolicy({ ...policy, ipAllowlist: e.target.value })}
              placeholder="127.0.0.1, 192.168.1.0/24, 10.0.0.0/8"
              className="w-full p-3 text-xs font-mono rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
            />
          </div>

          <div className="flex justify-end pt-2 border-t border-slate-100">
            <button
              type="submit"
              className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold shadow-sm transition-all cursor-pointer"
            >
              Update IP Allowlist
            </button>
          </div>
        </form>
      )}
    </div>
  )
}

export default SecurityCenterView
