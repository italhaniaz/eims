import React, { useState, useEffect } from 'react'
import {
  Activity,
  Server,
  HardDrive,
  Cpu,
  AlertTriangle,
  CheckCircle,
  Clock,
  RefreshCw,
  Search,
  Filter,
  Trash2,
  Terminal,
  Zap,
  Globe,
  Database,
  ShieldCheck,
  X
} from 'lucide-react'
import StatCard from '../../../components/common/StatCard'
import Modal from '../../../components/common/Modal'
import { HealthService } from '../../../services/healthService'

const SystemHealthView = () => {
  const [activeTab, setActiveTab] = useState('overview') // 'overview', 'storage', 'errors'
  const [health, setHealth] = useState(null)
  const [storageData, setStorageData] = useState([])
  const [errorLogs, setErrorLogs] = useState([])
  const [loading, setLoading] = useState(true)

  // Error Log Filter & Search
  const [severityFilter, setSeverityFilter] = useState('ALL')
  const [errorSearch, setErrorSearch] = useState('')
  const [selectedError, setSelectedError] = useState(null)

  // Toast
  const [actionToast, setActionToast] = useState(null)

  useEffect(() => {
    loadHealthData()
  }, [])

  const handleRefresh = () => loadHealthData()

  const loadHealthData = async () => {
    setLoading(true)
    try {
      const [h, s, errs] = await Promise.all([
        HealthService.getHealthOverview(),
        HealthService.getStorageBreakdown(),
        HealthService.getErrorLogs()
      ])
      setHealth(h)
      setStorageData(s)
      setErrorLogs(errs)
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  const handleClearErrorLogs = async () => {
    await HealthService.clearErrorLogs()
    setErrorLogs([])
    showToast('Diagnostic error log stream purged.')
  }

  const showToast = (msg) => {
    setActionToast(msg)
    setTimeout(() => setActionToast(null), 3500)
  }

  const formatUptime = (seconds = 0) => {
    const d = Math.floor(seconds / (3600 * 24))
    const h = Math.floor((seconds % (3600 * 24)) / 3600)
    const m = Math.floor((seconds % 3600) / 60)
    return `${d > 0 ? `${d}d ` : ''}${h}h ${m}m`
  }

  const filteredErrors = errorLogs.filter(err => {
    const matchSev = severityFilter === 'ALL' || err.severity === severityFilter
    const matchSearch = err.message.toLowerCase().includes(errorSearch.toLowerCase()) ||
      err.source.toLowerCase().includes(errorSearch.toLowerCase())
    return matchSev && matchSearch
  })

  if (loading || !health) {
    return (
      <div className="p-6 md:p-8 space-y-6 max-w-7xl mx-auto flex items-center justify-center min-h-[400px]">
        <div className="text-center space-y-3">
          <div className="w-8 h-8 border-3 border-purple-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="text-sm font-medium text-slate-500">Querying Express cluster & database telemetry...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="p-4 sm:p-6 md:p-8 pb-16 space-y-6 max-w-[1400px] mx-auto">
      {/* Toast Notification */}
      {actionToast && (
        <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 px-4 py-3 rounded-xl flex items-center justify-between shadow-sm animate-in fade-in slide-in-from-top-2">
          <div className="flex items-center gap-2.5">
            <CheckCircle className="w-5 h-5 text-emerald-600 shrink-0" />
            <span className="text-sm font-medium">{actionToast}</span>
          </div>
          <button onClick={() => setActionToast(null)} className="text-xs text-emerald-700 underline font-medium cursor-pointer">
            Dismiss
          </button>
        </div>
      )}

      {/* Header Banner */}
      <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-4">
        <div className="min-w-0">
          <div className="flex items-center gap-2 mb-1.5">
            <span className="text-[11px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full bg-[#f5eeff] text-purple-700 border border-purple-100 inline-flex items-center gap-1.5">
              <Activity className="w-3.5 h-3.5 text-purple-600" />
              <span>Platform Telemetry & Infrastructure Health</span>
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight font-heading">
            System Health & Diagnostic Monitor
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1 max-w-2xl">
            Live Express server metrics, multi-campus storage quotas, API latency benchmarks, and diagnostic exception streaming.
          </p>
        </div>

        <button
          onClick={loadHealthData}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-semibold text-xs sm:text-sm shadow-xs transition-colors cursor-pointer self-start xl:self-auto active:scale-95 whitespace-nowrap"
        >
          <RefreshCw className="w-4 h-4 shrink-0" />
          <span>Refresh Telemetry</span>
        </button>
      </div>

      {/* KPI Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          icon={Server}
          title="Server Uptime"
          value={formatUptime(health.uptimeSeconds)}
          badge="99.98% SLA Availability"
          badgePositive={true}
          color="emerald"
          showActions={true}
          showAllText="Show all"
          onShowAll={() => setActiveTab('overview')}
          onView={() => setActiveTab('overview')}
          viewTooltip="Inspect Platform Server Metrics"
          onAdd={handleRefresh}
          addTooltip="Refresh Live Telemetry"
        />
        <StatCard
          icon={Zap}
          title="Average API Latency"
          value={`${health.avgLatencyMs} ms`}
          badge="Express router"
          badgePositive={true}
          color="blue"
          showActions={true}
          showAllText="Show all"
          onShowAll={() => setActiveTab('api')}
          onView={() => setActiveTab('api')}
          viewTooltip="View API Endpoint Performance"
          onAdd={handleRefresh}
          addTooltip="Refresh API Diagnostics"
        />
        <StatCard
          icon={Cpu}
          title="Memory Heap Usage"
          value={`${health.memoryUsedMB} MB`}
          badge={`Of ${health.memoryTotalMB} MB heap pool`}
          badgePositive={true}
          color="indigo"
          showActions={true}
          showAllText="Show all"
          onShowAll={() => setActiveTab('system')}
          onView={() => setActiveTab('system')}
          viewTooltip="Inspect Memory Allocation"
          onAdd={handleRefresh}
          addTooltip="Re-evaluate Memory Heap"
        />
        <StatCard
          icon={Globe}
          title="Total API Invocations"
          value={health.totalApiRequests.toLocaleString()}
          badge={`${health.totalErrorsCount} anomalous trace(s)`}
          badgePositive={health.totalErrorsCount === 0}
          color="amber"
          showActions={true}
          showAllText="Show all"
          onShowAll={() => setActiveTab('errors')}
          onView={() => setActiveTab('errors')}
          viewTooltip="Inspect Error Traces"
          onAdd={handleRefresh}
          addTooltip="Trigger Telemetry Refresh"
        />
      </div>

      {/* Navigation Tabs */}
      <div className="border-b border-slate-200">
        <nav className="flex space-x-6 overflow-x-auto text-sm font-medium">
          <button
            onClick={() => setActiveTab('overview')}
            className={`py-3 border-b-2 flex items-center gap-2 transition-colors cursor-pointer shrink-0 ${
              activeTab === 'overview'
                ? 'border-purple-600 text-purple-600 font-semibold'
                : 'border-transparent text-slate-500 hover:text-slate-700'
            }`}
          >
            <Activity className="w-4 h-4" />
            <span>Infrastructure Status</span>
          </button>

          <button
            onClick={() => setActiveTab('storage')}
            className={`py-3 border-b-2 flex items-center gap-2 transition-colors cursor-pointer shrink-0 ${
              activeTab === 'storage'
                ? 'border-purple-600 text-purple-600 font-semibold'
                : 'border-transparent text-slate-500 hover:text-slate-700'
            }`}
          >
            <HardDrive className="w-4 h-4" />
            <span>Storage per Institute</span>
          </button>

          <button
            onClick={() => setActiveTab('errors')}
            className={`py-3 border-b-2 flex items-center gap-2 transition-colors cursor-pointer shrink-0 ${
              activeTab === 'errors'
                ? 'border-purple-600 text-purple-600 font-semibold'
                : 'border-transparent text-slate-500 hover:text-slate-700'
            }`}
          >
            <Terminal className="w-4 h-4" />
            <span>Diagnostic Error Logs ({errorLogs.length})</span>
          </button>
        </nav>
      </div>

      {/* TAB 1: INFRASTRUCTURE STATUS */}
      {activeTab === 'overview' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Service Health Cards */}
          <div className="bg-white rounded-3xl border border-slate-100 shadow-[0_2px_15px_rgba(0,0,0,0.02)] shadow-sm p-6 space-y-4">
            <h3 className="text-base font-bold text-slate-900">Service Status Matrix</h3>
            
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-100">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-600 flex items-center justify-center font-bold">
                    <Database className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-xs font-bold text-slate-900 block">Database Storage Layer</span>
                    <span className="text-[11px] text-slate-400">{health.dbConnectionStatus}</span>
                  </div>
                </div>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                  OPERATIONAL
                </span>
              </div>

              <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-100">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-purple-100 text-purple-600 flex items-center justify-center font-bold">
                    <Server className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-xs font-bold text-slate-900 block">Express API Router</span>
                    <span className="text-[11px] text-slate-400">Node {health.serverNodeVersion} • Port 5000</span>
                  </div>
                </div>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                  OPERATIONAL
                </span>
              </div>

              <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-100">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-indigo-100 text-indigo-600 flex items-center justify-center font-bold">
                    <ShieldCheck className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-xs font-bold text-slate-900 block">Session & Auth Engine</span>
                    <span className="text-[11px] text-slate-400">{health.activeSessionsCount} active sessions maintained</span>
                  </div>
                </div>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                  OPERATIONAL
                </span>
              </div>
            </div>
          </div>

          {/* Node Specs & System Environment */}
          <div className="bg-white rounded-3xl border border-slate-100 shadow-[0_2px_15px_rgba(0,0,0,0.02)] shadow-sm p-6 space-y-4">
            <h3 className="text-base font-bold text-slate-900">Platform Environment Telemetry</h3>

            <div className="space-y-2.5 text-xs text-slate-600">
              <div className="flex justify-between py-2 border-b border-slate-100">
                <span className="text-slate-500">Host Cluster Node:</span>
                <span className="font-mono font-semibold text-slate-900">{health.platformHost}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-slate-100">
                <span className="text-slate-500">Node Runtime:</span>
                <span className="font-mono font-semibold text-slate-900">{health.serverNodeVersion}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-slate-100">
                <span className="text-slate-500">API Response Time:</span>
                <span className="font-semibold text-emerald-600">{health.avgLatencyMs} ms</span>
              </div>
              <div className="flex justify-between py-2 border-b border-slate-100">
                <span className="text-slate-500">Peak Memory Heap:</span>
                <span className="font-semibold text-slate-900">{health.memoryUsedMB} MB / {health.memoryTotalMB} MB</span>
              </div>
              <div className="flex justify-between py-2">
                <span className="text-slate-500">Error Exception Rate:</span>
                <span className="font-semibold text-slate-900">
                  {((health.totalErrorsCount / Math.max(1, health.totalApiRequests)) * 100).toFixed(2)}%
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: STORAGE PER INSTITUTE */}
      {activeTab === 'storage' && (
        <div className="bg-white rounded-3xl border border-slate-100 shadow-[0_2px_15px_rgba(0,0,0,0.02)] shadow-sm overflow-hidden">
          <div className="p-4 sm:p-5 border-b border-slate-100">
            <h3 className="text-base font-bold text-slate-900">Campus Cloud Storage Consumption</h3>
            <p className="text-xs text-slate-400 mt-0.5">Database tables, student documents, and fee receipts breakdown</p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs sm:text-sm">
              <thead className="bg-slate-50/80 text-slate-600 font-semibold border-b border-slate-100 uppercase text-[11px] tracking-wider">
                <tr>
                  <th className="py-3.5 px-4">Institute</th>
                  <th className="py-3.5 px-4 font-mono">Database Tables</th>
                  <th className="py-3.5 px-4 font-mono">Media & Documents</th>
                  <th className="py-3.5 px-4 font-mono">Total Consumption</th>
                  <th className="py-3.5 px-4">Quota Utilization</th>
                  <th className="py-3.5 px-4 text-center">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {storageData.map((item) => (
                  <tr key={item.instituteId} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-3.5 px-4 font-semibold text-slate-900">
                      {item.instituteName}
                    </td>
                    <td className="py-3.5 px-4 font-mono">{item.dbRecordsMB} MB</td>
                    <td className="py-3.5 px-4 font-mono">{item.mediaDocsMB} MB</td>
                    <td className="py-3.5 px-4 font-mono font-bold text-slate-900">
                      {item.totalUsedMB} MB
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="w-36">
                        <div className="flex justify-between text-xs font-semibold mb-1">
                          <span>{item.usagePercent}%</span>
                          <span className="text-slate-400 font-normal">{(item.quotaMB / 1024).toFixed(0)} GB Cap</span>
                        </div>
                        <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                          <div
                            className="bg-purple-600 h-full rounded-full"
                            style={{ width: `${Math.min(100, item.usagePercent * 10)}%` }}
                          />
                        </div>
                      </div>
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                        HEALTHY
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 3: DIAGNOSTIC ERROR LOGS */}
      {activeTab === 'errors' && (
        <div className="space-y-4">
          <div className="bg-white p-4 rounded-3xl border border-slate-100 shadow-[0_2px_15px_rgba(0,0,0,0.02)] shadow-sm flex flex-col md:flex-row items-center justify-between gap-3">
            <div className="flex flex-wrap items-center gap-2">
              {['ALL', 'CRITICAL', 'WARNING', 'INFO'].map((sev) => (
                <button
                  key={sev}
                  onClick={() => setSeverityFilter(sev)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-colors cursor-pointer ${
                    severityFilter === sev
                      ? 'bg-purple-600 text-white shadow-xs'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {sev}
                </button>
              ))}
            </div>

            <div className="flex items-center gap-3 w-full md:w-auto">
              <div className="relative w-full md:w-64">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search error messages..."
                  value={errorSearch}
                  onChange={(e) => setErrorSearch(e.target.value)}
                  className="w-full pl-9 pr-4 py-1.5 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:bg-white"
                />
              </div>

              <button
                onClick={handleClearErrorLogs}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-rose-50 hover:text-rose-600 text-slate-600 text-xs font-semibold transition-colors cursor-pointer shrink-0"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Clear Logs</span>
              </button>
            </div>
          </div>

          <div className="bg-white rounded-3xl border border-slate-100 shadow-[0_2px_15px_rgba(0,0,0,0.02)] shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs sm:text-sm">
                <thead className="bg-slate-50/80 text-slate-600 font-semibold border-b border-slate-100 uppercase text-[11px] tracking-wider">
                  <tr>
                    <th className="py-3.5 px-4 text-center">Severity</th>
                    <th className="py-3.5 px-4">Subsystem</th>
                    <th className="py-3.5 px-4">Diagnostic Trace Message</th>
                    <th className="py-3.5 px-4">Timestamp</th>
                    <th className="py-3.5 px-4 text-right">Details</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700">
                  {filteredErrors.length > 0 ? (
                    filteredErrors.map((err) => (
                      <tr key={err.id} className="hover:bg-slate-50/70 transition-colors">
                        <td className="py-3.5 px-4 text-center">
                          <span
                            className={`inline-flex px-2 py-0.5 rounded-full text-[10px] font-bold ${
                              err.severity === 'CRITICAL'
                                ? 'bg-rose-100 text-rose-800'
                                : err.severity === 'WARNING'
                                ? 'bg-amber-100 text-amber-800'
                                : 'bg-purple-100 text-purple-800'
                            }`}
                          >
                            {err.severity}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 font-semibold text-slate-900">{err.source}</td>
                        <td className="py-3.5 px-4 font-mono text-xs text-slate-700 max-w-md truncate">
                          {err.message}
                        </td>
                        <td className="py-3.5 px-4 text-xs text-slate-400">
                          {new Date(err.createdAt).toLocaleTimeString()}
                        </td>
                        <td className="py-3.5 px-4 text-right">
                          {err.stackTrace && (
                            <button
                              onClick={() => setSelectedError(err)}
                              className="text-xs text-purple-600 hover:underline font-semibold cursor-pointer"
                            >
                              Stack Trace
                            </button>
                          )}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="5" className="py-8 text-center text-xs text-slate-400">
                        No error events found matching current criteria.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* STACK TRACE MODAL */}
      <Modal
        isOpen={!!selectedError}
        onClose={() => setSelectedError(null)}
        title={`Stack Trace: ${selectedError?.source}`}
        maxWidth="max-w-2xl"
      >
        <div className="space-y-3">
          <p className="text-xs text-slate-600 font-semibold">{selectedError?.message}</p>
          <pre className="p-4 bg-slate-900 text-emerald-400 font-mono text-xs rounded-xl overflow-x-auto max-h-72 whitespace-pre-wrap">
            {selectedError?.stackTrace || 'No stack trace captured.'}
          </pre>
          <div className="flex justify-end pt-2">
            <button
              onClick={() => setSelectedError(null)}
              className="px-4 py-2 text-xs font-semibold rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 cursor-pointer"
            >
              Close Trace
            </button>
          </div>
        </div>
      </Modal>
    </div>
  )
}

export default SystemHealthView
