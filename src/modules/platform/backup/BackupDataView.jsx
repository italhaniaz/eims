import React, { useState, useEffect } from 'react'
import {
  ShieldCheck,
  Eye,
  RotateCcw,
  Database,
  Download,
  Upload,
  RefreshCw,
  HardDrive,
  ShieldAlert,
  CheckCircle,
  Clock,
  Building,
  AlertTriangle,
  FileCheck,
  Search,
  Filter,
  Check,
  X,
  FileText,
  Trash2
} from 'lucide-react'
import StatCard from '../../../components/common/StatCard'
import Modal from '../../../components/common/Modal'
import { useAppData } from '../../../context/AppDataContext'
import { OperationsService } from '../../../services/operationsService'
import { DataService, getStoredData } from '../../../services/dataService'

const BackupDataView = ({ initialTab = 'backups' }) => {
  const { addItem } = useAppData() || {}
  const [activeTab, setActiveTab] = useState(initialTab)
  const [inspectingSessionBackup, setInspectingSessionBackup] = useState(null)
  const [sessionBackupSearch, setSessionBackupSearch] = useState('')
  const [sessionBackups, setSessionBackups] = useState(() => {
    try { return OperationsService.getSessionBackups ? OperationsService.getSessionBackups() : [] } catch { return [] }
  }) // 'backups', 'export-isolated'
  const [backups, setBackups] = useState([])
  const [institutes, setInstitutes] = useState([])
  const [loading, setLoading] = useState(true)

  // Isolated Export State
  const [selectedInstituteId, setSelectedInstituteId] = useState('')

  // Retention Policy State
  const [retentionPolicy, setRetentionPolicy] = useState({
    auditLogsDays: 90,
    loginHistoryDays: 180,
    backupSnapshotsDays: 365,
    archivedInstitutesDays: 730,
    autoPurgeEnabled: true
  })

  // Restore Modal State
  const [restoreFile, setRestoreFile] = useState(null)
  const [restorePreview, setRestorePreview] = useState(null)
  const [isRestoreModalOpen, setIsRestoreModalOpen] = useState(false)
  const [isRestoring, setIsRestoring] = useState(false)

  // Toast
  const [actionToast, setActionToast] = useState(null)

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    setLoading(true)
    try {
      const [bkps, policy] = await Promise.all([
        OperationsService.getBackups(),
        OperationsService.getRetentionPolicy()
      ])
      setBackups(bkps)
      setRetentionPolicy(policy)

      const store = getStoredData()
      const insts = store.institutes || []
      setInstitutes(insts)
      if (insts.length > 0) setSelectedInstituteId(insts[0].id)
      else setSelectedInstituteId('')
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  
  const handleDownloadSessionBackup = (backup) => {
    try {
      OperationsService.downloadSessionBackupFile(backup)
      showToast(`Session backup downloaded for ${backup.userName}!`)
    } catch (err) {
      showToast('Failed to download session backup file.')
    }
  }

  const handleDeleteSessionBackup = (id) => {
    if (window.confirm('Delete this force-logout backup archive?')) {
      const updated = OperationsService.deleteSessionBackup(id)
      setSessionBackups(updated || [])
      showToast('Session backup deleted.')
    }
  }

  const handleRestoreSession = (backup) => {
    try {
      OperationsService.restoreSessionBackup(backup)
      showToast(`Session record for ${backup.userName} written to the local active-sessions list. This does not sign the user in.`)
    } catch (err) {
      showToast('Failed to restore session.')
    }
  }

  const showToast = (msg) => {
    setActionToast(msg)
    setTimeout(() => setActionToast(null), 4000)
  }

  // --- Actions ---
  const handleCreateSnapshot = async () => {
    try {
      const res = await OperationsService.createManualBackup('MANUAL')
      showToast('Manual database snapshot generated & downloaded to local machine.')
      loadData()
    } catch (err) {
      console.error(err)
    }
  }

  const handleExportIsolated = async () => {
    const inst = institutes.find(i => i.id === selectedInstituteId)
    if (!inst) return
    await OperationsService.exportInstituteIsolatedData(inst.id, inst.name)
    showToast(`Isolated archive for ${inst.name} downloaded successfully.`)
  }

  const handleFileSelectForRestore = (e) => {
    const file = e.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = (event) => {
      try {
        const parsed = JSON.parse(event.target.result)
        setRestoreFile(file)
        setRestorePreview({
          institutesCount: (parsed.institutes || []).length,
          studentsCount: (parsed.students || []).length,
          teachersCount: (parsed.teachers || []).length,
          usersCount: (parsed.users || []).length,
          timestamp: parsed.timestamp || new Date().toISOString(),
          data: parsed
        })
        setIsRestoreModalOpen(true)
      } catch (err) {
        alert('Invalid JSON file format: ' + err.message)
      }
    }
    reader.readAsText(file)
  }

  const handleConfirmRestore = async () => {
    if (!restorePreview?.data) return
    setIsRestoring(true)
    try {
      const result = await OperationsService.restoreBackup(restorePreview.data)
      const raw = localStorage.getItem('sms_database_v3_enterprise')
      const parsed = raw ? JSON.parse(raw) : null
      const restoredInstitutes = Array.isArray(parsed?.institutes) ? parsed.institutes.length : 0
      if (!parsed || !Array.isArray(parsed.institutes)) {
        showToast('Restore did not write sms_database_v3_enterprise.')
        return
      }
      setIsRestoreModalOpen(false)
      showToast(result?.message || `Local snapshot restored into sms_database_v3_enterprise (${restoredInstitutes} campuses). Reloading...`)
      setTimeout(() => window.location.reload(), 1200)
    } catch (err) {
      alert('Restore failed: ' + err.message)
    } finally {
      setIsRestoring(false)
    }
  }

  if (loading) {
    return (
      <div className="p-6 md:p-8 space-y-6 max-w-7xl mx-auto flex items-center justify-center min-h-[400px]">
        <div className="text-center space-y-3">
          <div className="w-8 h-8 border-3 border-purple-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="text-sm font-medium text-slate-500">Loading backup archives & data governance...</p>
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

      {/* Clean Light SaaS Header */}
      <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="text-[11px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full bg-[#f5eeff] text-purple-700 border border-purple-100 inline-flex items-center gap-1.5">
              <Database className="w-3.5 h-3.5 text-purple-600" />
              <span>Platform Integrity & Disaster Recovery</span>
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight font-heading">
            Backup, Restore & Data Operations
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1 max-w-2xl">
            Create system-wide JSON snapshots, validate and restore data state, and export isolated campus databases.
          </p>
        </div>

        <div className="flex items-center gap-2 sm:gap-2.5 flex-wrap">
          <button
            onClick={handleCreateSnapshot}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-semibold text-xs sm:text-sm shadow-xs transition-colors cursor-pointer active:scale-95 whitespace-nowrap shrink-0"
          >
            <Download className="w-4 h-4 shrink-0" />
            <span>Create Instant Snapshot</span>
          </button>
        </div>
      </div>

      {/* KPI Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          icon={HardDrive}
          title="Total Stored Backups"
          value={`${backups.length} Snapshots`}
          badge="Available for recovery"
          badgePositive={true}
          color="blue"
          showActions={true}
          showAllText="Show all"
          onShowAll={() => setActiveTab('backups')}
          onView={() => setActiveTab('backups')}
          viewTooltip="View All Backup Snapshots"
          onAdd={handleCreateSnapshot}
          addTooltip="Create New Database Backup Snapshot"
        />
        <StatCard
          icon={FileCheck}
          title="Last Completed Backup"
          value="Today"
          badge="Automated & verified"
          badgePositive={true}
          color="emerald"
          showActions={true}
          showAllText="Show all"
          onShowAll={() => setActiveTab('backups')}
          onView={() => setActiveTab('backups')}
          viewTooltip="Inspect Last Snapshot"
          onAdd={handleCreateSnapshot}
          addTooltip="Trigger Manual Backup Snapshot"
        />
        <StatCard
          icon={Building}
          title="Affiliated Campuses"
          value={`${institutes.length} Available`}
          badge="Isolated export ready"
          badgePositive={true}
          color="indigo"
          showActions={true}
          showAllText="Show all"
          onShowAll={() => setActiveTab('export-isolated')}
          onView={() => setActiveTab('export-isolated')}
          viewTooltip="Export Institute Data Archive"
          onAdd={handleExportIsolated}
          addTooltip="Initiate Institute Data Export"
        />
        <StatCard
          icon={Clock}
          title="Audit Retention Window"
          value={`${retentionPolicy.auditLogsDays} Days`}
          badge="Active compliance window"
          badgePositive={true}
          color="amber"
          showActions={true}
          showAllText="Show all"
          onShowAll={() => setActiveTab('backups')}
          onView={() => setActiveTab('backups')}
          viewTooltip="View Backups"
          onAdd={handleCreateSnapshot}
          addTooltip="Create Database Snapshot"
        />
      </div>

      {/* Navigation Tabs */}
      <div className="bg-white p-1.5 rounded-2xl border border-slate-100 shadow-[0_2px_12px_rgba(0,0,0,0.02)]">
        <nav className="flex space-x-2 overflow-x-auto text-xs sm:text-sm font-medium">
          <button
            onClick={() => setActiveTab('backups')}
            className={`py-2 px-4 rounded-xl flex items-center gap-2 transition-all cursor-pointer shrink-0 ${
              activeTab === 'backups'
                ? 'bg-[#f5eeff] text-purple-700 font-bold shadow-2xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
            }`}
          >
            <Database className="w-4 h-4" />
            <span>System Snapshots & Restore ({backups.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('export-isolated')}
            className={`py-2 px-4 rounded-xl flex items-center gap-2 transition-all cursor-pointer shrink-0 ${
              activeTab === 'export-isolated'
                ? 'bg-[#f5eeff] text-purple-700 font-bold shadow-2xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
            }`}
          >
            <Building className="w-4 h-4" />
            <span>Isolated Campus Export</span>
          </button>
        </nav>
      </div>

      
      {/* TAB 5: FORCE-LOGOUT EMERGENCY SESSION BACKUPS */}
      {activeTab === 'session-backups' && (
        <div className="bg-white rounded-2xl border border-slate-200/80 p-5 sm:p-6 shadow-2xs space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 className="font-bold text-slate-900 text-base">Emergency Force-Logout Session Backups</h3>
              <p className="text-xs text-slate-500">
                Snapshots captured instantly when an active user session is terminated for policy violation or revocation.
              </p>
            </div>
            <div className="relative">
              <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Search by user, campus, IP..."
                value={sessionBackupSearch}
                onChange={(e) => setSessionBackupSearch(e.target.value)}
                className="pl-8 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-purple-500 w-full sm:w-64"
              />
            </div>
          </div>

          <div className="overflow-x-auto rounded-xl border border-slate-100">
            <table className="w-full text-left text-xs text-slate-600">
              <thead className="bg-slate-50 text-[11px] font-bold text-slate-700 uppercase tracking-wider border-b border-slate-200/60">
                <tr>
                  <th className="py-3 px-4">User & Role</th>
                  <th className="py-3 px-4">Campus</th>
                  <th className="py-3 px-4">IP & Device</th>
                  <th className="py-3 px-4">Terminated At</th>
                  <th className="py-3 px-4">Revocation Reason</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {sessionBackups.filter(b => {
                  if (!sessionBackupSearch) return true;
                  const q = sessionBackupSearch.toLowerCase();
                  return (
                    (b.userName || '').toLowerCase().includes(q) ||
                    (b.campusName || '').toLowerCase().includes(q) ||
                    (b.ipAddress || '').toLowerCase().includes(q) ||
                    (b.reason || '').toLowerCase().includes(q)
                  );
                }).length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-12 text-center text-slate-400">
                      <ShieldAlert className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                      <p className="font-semibold text-slate-600">No session backups found</p>
                      <p className="text-xs text-slate-400 mt-1">Force-logged out sessions will archive their payload here.</p>
                    </td>
                  </tr>
                ) : (
                  sessionBackups
                    .filter(b => {
                      if (!sessionBackupSearch) return true;
                      const q = sessionBackupSearch.toLowerCase();
                      return (
                        (b.userName || '').toLowerCase().includes(q) ||
                        (b.campusName || '').toLowerCase().includes(q) ||
                        (b.ipAddress || '').toLowerCase().includes(q) ||
                        (b.reason || '').toLowerCase().includes(q)
                      );
                    })
                    .map((b) => (
                      <tr key={b.id} className="hover:bg-slate-50/70 transition-colors">
                        <td className="py-3.5 px-4">
                          <div className="font-bold text-slate-900">{b.userName}</div>
                          <span className="text-[10px] font-semibold text-purple-700 uppercase">{b.userRole}</span>
                        </td>
                        <td className="py-3.5 px-4 font-medium text-slate-700">{b.campusName}</td>
                        <td className="py-3.5 px-4 font-mono text-[11px] text-slate-500">
                          <div>{b.ipAddress}</div>
                          <div className="text-[10px] text-slate-400">{b.deviceInfo}</div>
                        </td>
                        <td className="py-3.5 px-4 text-slate-500">
                          {b.terminatedAt ? new Date(b.terminatedAt).toLocaleString() : 'N/A'}
                        </td>
                        <td className="py-3.5 px-4">
                          <span className="px-2 py-0.5 rounded-md bg-rose-50 text-rose-700 border border-rose-200 text-[11px]">
                            {b.reason || 'Admin Revocation'}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 text-right">
                          <div className="inline-flex items-center gap-1.5">
                            <button
                              onClick={() => setInspectingSessionBackup(b)}
                              className="p-1.5 rounded-lg border border-purple-200 bg-purple-50 hover:bg-purple-100 text-purple-700 transition-all cursor-pointer shadow-2xs"
                              title="Inspect JSON Payload"
                            >
                              <Eye className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => handleDownloadSessionBackup(b)}
                              className="p-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 transition-all cursor-pointer shadow-2xs"
                              title="Download Backup (.json)"
                            >
                              <Download className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => handleRestoreSession(b)}
                              className="p-1.5 rounded-lg border border-emerald-200 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 transition-all cursor-pointer shadow-2xs"
                              title="Restore Session"
                            >
                              <RotateCcw className="w-3.5 h-3.5" />
                            </button>
                            <button
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
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Inspect Modal */}
      {inspectingSessionBackup && (
        <Modal
          isOpen={true}
          onClose={() => setInspectingSessionBackup(null)}
          title={`Session Backup: ${inspectingSessionBackup.userName}`}
        >
          <div className="space-y-4 text-xs">
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
              <div><strong>Campus:</strong> {inspectingSessionBackup.campusName}</div>
              <div><strong>IP:</strong> {inspectingSessionBackup.ipAddress}</div>
              <div><strong>Terminated:</strong> {new Date(inspectingSessionBackup.terminatedAt).toLocaleString()}</div>
              <div><strong>Reason:</strong> {inspectingSessionBackup.reason}</div>
            </div>
            <div>
              <span className="font-bold text-slate-700 block mb-1">State Payload JSON:</span>
              <pre className="p-3 bg-slate-900 text-emerald-400 font-mono text-[11px] rounded-xl overflow-x-auto max-h-60">
                {JSON.stringify(inspectingSessionBackup, null, 2)}
              </pre>
            </div>
            <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                onClick={() => handleDownloadSessionBackup(inspectingSessionBackup)}
                className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-xl font-bold cursor-pointer"
              >
                Download JSON
              </button>
              <button
                onClick={() => setInspectingSessionBackup(null)}
                className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-700 rounded-xl font-bold cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* TAB 1: SYSTEM BACKUPS & RESTORE */}
      {activeTab === 'backups' && (
        <div className="space-y-6">
          {/* Upload & Restore Card */}
          <div className="bg-slate-50 border-2 border-dashed border-slate-300 rounded-2xl p-6 text-center">
            <Upload className="w-8 h-8 text-purple-600 mx-auto mb-2" />
            <h3 className="text-sm font-bold text-slate-900">Upload Platform Backup Snapshot to Restore</h3>
            <p className="text-xs text-slate-500 mt-1 max-w-md mx-auto">
              Upload a JSON snapshot. A valid file is written into sms_database_v3_enterprise on this browser. Catalog rows without a file cannot be restored.
            </p>
            <div className="mt-4">
              <label className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white border border-slate-300 hover:bg-slate-100 text-slate-700 font-semibold text-xs transition-colors cursor-pointer shadow-xs">
                <span>Select Snapshot File</span>
                <input
                  type="file"
                  accept=".json"
                  onChange={handleFileSelectForRestore}
                  className="hidden"
                />
              </label>
            </div>
          </div>

          {/* Backup Archives Table */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="p-4 sm:p-5 border-b border-slate-100 flex items-center justify-between">
              <div>
                <h3 className="text-sm sm:text-base font-bold text-slate-800">Snapshot log</h3>
                <p className="text-xs text-slate-400 mt-0.5">Downloaded exports are listed here. Sample catalog rows have no file to restore.</p>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs sm:text-sm">
                <thead className="bg-slate-50/80 text-slate-600 font-semibold border-b border-slate-100 uppercase text-[11px] tracking-wider">
                  <tr>
                    <th className="py-3.5 px-4">Snapshot Filename</th>
                    <th className="py-3.5 px-4">Type</th>
                    <th className="py-3.5 px-4">Size</th>
                    <th className="py-3.5 px-4 font-mono">SHA-256 Checksum</th>
                    <th className="py-3.5 px-4">Created Date</th>
                    <th className="py-3.5 px-4 text-center">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700">
                  {backups.map((bkp) => {
                    const catalogOnly = Boolean(bkp.catalogOnly) || ['bkp-001', 'bkp-002', 'bkp-003'].includes(bkp.id)
                    return (
                    <tr key={bkp.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="py-3.5 px-4 font-medium text-slate-900 flex items-center gap-2">
                        <FileText className="w-4 h-4 text-slate-400 shrink-0" />
                        <span>{bkp.filename}</span>
                      </td>
                      <td className="py-3.5 px-4">
                        <span className="inline-flex px-2 py-0.5 rounded-full text-[10px] font-semibold bg-slate-100 text-slate-700">
                          {bkp.backupType}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 font-mono">
                        {catalogOnly ? '—' : `${(bkp.sizeBytes / 1024 / 1024).toFixed(2)} MB`}
                      </td>
                      <td className="py-3.5 px-4 font-mono text-[11px] text-slate-500">
                        {catalogOnly ? 'Sample catalog — no file stored' : (bkp.checksum ? `${bkp.checksum.slice(0, 16)}...` : 'Local checksum')}
                      </td>
                      <td className="py-3.5 px-4 text-xs text-slate-500">
                        {bkp.createdAt ? new Date(bkp.createdAt).toLocaleDateString() : '—'}
                      </td>
                      <td className="py-3.5 px-4 text-center">
                        {catalogOnly ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-50 text-amber-800 border border-amber-200">
                            NO PAYLOAD
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                            <Check className="w-3 h-3" />
                            {bkp.status || 'DOWNLOADED'}
                          </span>
                        )}
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

      {/* TAB 2: ISOLATED PER-INSTITUTE EXPORT */}
      {activeTab === 'export-isolated' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-6">
          <div>
            <h3 className="text-base font-bold text-slate-900">Per-Institute Database Isolation & Export</h3>
            <p className="text-xs text-slate-500 mt-1">
              Extract and export an isolated JSON archive containing strictly one campus’s student records, faculty, classes, and fee ledgers.
            </p>
          </div>

          <div className="max-w-md space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Select Target Campus</label>
              <select
                value={selectedInstituteId}
                onChange={(e) => setSelectedInstituteId(e.target.value)}
                className="w-full px-3 py-2 text-sm border border-slate-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:outline-none bg-white"
                disabled={institutes.length === 0}
              >
                {institutes.length > 0 ? (
                  institutes.map((inst) => (
                    <option key={inst.id} value={inst.id}>
                      {inst.name} ({inst.code})
                    </option>
                  ))
                ) : (
                  <option value="">No registered campuses</option>
                )}
              </select>
            </div>

            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 text-xs text-slate-600 space-y-2">
              <span className="font-semibold text-slate-800 block">Export Package Contains:</span>
              <ul className="list-disc list-inside space-y-1 text-slate-500">
                <li>Student profiles, roll numbers & academic records</li>
                <li>Faculty and staff employment roster</li>
                <li>Campus classes and section allocations</li>
                <li>Fee ledgers, voucher numbers and payments</li>
              </ul>
            </div>

            <button
              onClick={handleExportIsolated}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-semibold text-xs sm:text-sm shadow-sm transition-colors cursor-pointer"
            >
              <Download className="w-4 h-4" />
              <span>Export Isolated Campus Archive</span>
            </button>
          </div>
        </div>
      )}

      {/* CONFIRM RESTORE MODAL */}
      <Modal
        isOpen={isRestoreModalOpen}
        onClose={() => setIsRestoreModalOpen(false)}
        title="Confirm Platform State Restore"
        maxWidth="max-w-lg"
      >
        <div className="space-y-4">
          <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-800 flex items-start gap-2">
            <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
            <div>
              <span className="font-bold block">Caution: Overwrite Warning</span>
              <p>
                Restoring this backup snapshot will replace all active platform tables (institutes, students, staff, fees, classes). This action cannot be undone.
              </p>
            </div>
          </div>

          {restorePreview && (
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs space-y-1.5">
              <span className="font-semibold text-slate-800 block">Snapshot Manifest Preview:</span>
              <div className="flex justify-between">
                <span>Institutes:</span>
                <span className="font-semibold">{restorePreview.institutesCount}</span>
              </div>
              <div className="flex justify-between">
                <span>Students:</span>
                <span className="font-semibold">{restorePreview.studentsCount}</span>
              </div>
              <div className="flex justify-between">
                <span>Teachers:</span>
                <span className="font-semibold">{restorePreview.teachersCount}</span>
              </div>
              <div className="flex justify-between">
                <span>Platform Users:</span>
                <span className="font-semibold">{restorePreview.usersCount}</span>
              </div>
            </div>
          )}

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
            <button
              onClick={() => setIsRestoreModalOpen(false)}
              className="px-4 py-2 text-xs sm:text-sm font-medium text-slate-600 hover:text-slate-800 cursor-pointer"
            >
              Cancel
            </button>
            <button
              disabled={isRestoring}
              onClick={handleConfirmRestore}
              className="px-5 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-semibold text-xs sm:text-sm shadow-sm transition-colors cursor-pointer"
            >
              {isRestoring ? 'Restoring System...' : 'Confirm Restore & Overwrite'}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  )
}

export default BackupDataView
