import React, { useState, useEffect } from 'react'
import {
  Database,
  Download,
  Upload,
  RefreshCw,
  HardDrive,
  ShieldAlert,
  CheckCircle,
  FileSpreadsheet,
  Clock,
  Building,
  AlertTriangle,
  FileCheck,
  Search,
  Filter,
  Check,
  X,
  FileText
} from 'lucide-react'
import StatCard from '../../../components/common/StatCard'
import Modal from '../../../components/common/Modal'
import { OperationsService } from '../../../services/operationsService'
import { DataService, getStoredData } from '../../../services/dataService'

const BackupDataView = () => {
  const [activeTab, setActiveTab] = useState('backups') // 'backups', 'export-isolated', 'bulk-import', 'retention'
  const [backups, setBackups] = useState([])
  const [institutes, setInstitutes] = useState([])
  const [loading, setLoading] = useState(true)

  // Isolated Export State
  const [selectedInstituteId, setSelectedInstituteId] = useState('')

  // Bulk Import Validator State
  const [importType, setImportType] = useState('students')
  const [csvContent, setCsvContent] = useState('')
  const [validationResult, setValidationResult] = useState(null)

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

  const handleValidateCSV = () => {
    if (!csvContent.trim()) return
    const result = OperationsService.validateBulkImport(csvContent, importType)
    setValidationResult(result)
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
      await OperationsService.restoreBackup(restorePreview.data)
      setIsRestoreModalOpen(false)
      showToast('Database restored successfully from backup snapshot. Reloading state...')
      setTimeout(() => window.location.reload(), 1200)
    } catch (err) {
      alert('Restore failed: ' + err.message)
    } finally {
      setIsRestoring(false)
    }
  }

  const handleSaveRetention = async (e) => {
    e.preventDefault()
    await OperationsService.saveRetentionPolicy(retentionPolicy)
    showToast('Platform data retention policy thresholds updated.')
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
            Create system-wide JSON snapshots, validate and restore data state, export isolated campus databases, and establish lifecycle retention policies.
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
          onShowAll={() => setActiveTab('export')}
          onView={() => setActiveTab('export')}
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
          onShowAll={() => setActiveTab('retention')}
          onView={() => setActiveTab('retention')}
          viewTooltip="View Retention Policies"
          onAdd={() => setActiveTab('retention')}
          addTooltip="Configure Retention Policy"
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

          <button
            onClick={() => setActiveTab('bulk-import')}
            className={`py-2 px-4 rounded-xl flex items-center gap-2 transition-all cursor-pointer shrink-0 ${
              activeTab === 'bulk-import'
                ? 'bg-[#f5eeff] text-purple-700 font-bold shadow-2xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
            }`}
          >
            <FileSpreadsheet className="w-4 h-4" />
            <span>Bulk CSV Validator & Preview</span>
          </button>

          <button
            onClick={() => setActiveTab('retention')}
            className={`py-2 px-4 rounded-xl flex items-center gap-2 transition-all cursor-pointer shrink-0 ${
              activeTab === 'retention'
                ? 'bg-[#f5eeff] text-purple-700 font-bold shadow-2xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
            }`}
          >
            <Clock className="w-4 h-4" />
            <span>Retention Policy</span>
          </button>
        </nav>
      </div>

      {/* TAB 1: SYSTEM BACKUPS & RESTORE */}
      {activeTab === 'backups' && (
        <div className="space-y-6">
          {/* Upload & Restore Card */}
          <div className="bg-slate-50 border-2 border-dashed border-slate-300 rounded-2xl p-6 text-center">
            <Upload className="w-8 h-8 text-purple-600 mx-auto mb-2" />
            <h3 className="text-sm font-bold text-slate-900">Upload Platform Backup Snapshot to Restore</h3>
            <p className="text-xs text-slate-500 mt-1 max-w-md mx-auto">
              Select a valid JSON database snapshot file (.json). The system will execute structural validation and prompt for confirmation before restoring.
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
                <h3 className="text-sm sm:text-base font-bold text-slate-800">Available Platform Snapshots</h3>
                <p className="text-xs text-slate-400 mt-0.5">Historical full backups with SHA-256 integrity verification</p>
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
                  {backups.map((bkp) => (
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
                        {(bkp.sizeBytes / 1024 / 1024).toFixed(2)} MB
                      </td>
                      <td className="py-3.5 px-4 font-mono text-[11px] text-slate-500">
                        {bkp.checksum ? `${bkp.checksum.slice(0, 16)}...` : 'Verified'}
                      </td>
                      <td className="py-3.5 px-4 text-xs text-slate-500">
                        {new Date(bkp.createdAt).toLocaleDateString()}
                      </td>
                      <td className="py-3.5 px-4 text-center">
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                          <Check className="w-3 h-3" />
                          {bkp.status}
                        </span>
                      </td>
                    </tr>
                  ))}
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

      {/* TAB 3: BULK CSV VALIDATOR & PREVIEW */}
      {activeTab === 'bulk-import' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-6">
          <div>
            <h3 className="text-base font-bold text-slate-900">Bulk Import Schema Validator & Row Preview</h3>
            <p className="text-xs text-slate-500 mt-1">
              Paste raw CSV data to check against platform constraints, identify missing mandatory columns, and preview validation before importing.
            </p>
          </div>

          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <label className="text-xs font-semibold text-slate-700">Entity Type:</label>
              <select
                value={importType}
                onChange={(e) => {
                  setImportType(e.target.value)
                  setValidationResult(null)
                }}
                className="px-3 py-1.5 text-xs border border-slate-200 rounded-lg bg-white"
              >
                <option value="students">Students Roster</option>
                <option value="institutes">Institutes Directory</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Paste CSV Data (with headers: name, rollNumber, email, class...)
              </label>
              <textarea
                rows="6"
                value={csvContent}
                onChange={(e) => setCsvContent(e.target.value)}
                placeholder="name,rollNumber,email,gender\nAhmed Khan,STD-1001,ahmed@mail.com,Male\nAyesha Malik,,ayesha@mail.com,Female"
                className="w-full px-3 py-2 text-xs font-mono border border-slate-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:outline-none"
              />
            </div>

            <button
              onClick={handleValidateCSV}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-semibold text-xs shadow-sm transition-colors cursor-pointer"
            >
              <FileCheck className="w-4 h-4" />
              <span>Validate & Preview CSV</span>
            </button>

            {/* Validation Results Display */}
            {validationResult && (
              <div className="space-y-4 pt-4 border-t border-slate-100">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs">
                    <span className="text-slate-500 block">Total Rows:</span>
                    <span className="font-bold text-slate-900 text-sm">{validationResult.totalRows}</span>
                  </div>
                  <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-200 text-xs">
                    <span className="text-emerald-700 block">Valid Rows:</span>
                    <span className="font-bold text-emerald-800 text-sm">{validationResult.validCount}</span>
                  </div>
                  <div className="p-3 bg-rose-50 rounded-xl border border-rose-200 text-xs">
                    <span className="text-rose-700 block">Invalid Rows:</span>
                    <span className="font-bold text-rose-800 text-sm">{validationResult.invalidCount}</span>
                  </div>
                </div>

                {/* Preview Table */}
                <div className="border border-slate-200 rounded-xl overflow-hidden">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200">
                      <tr>
                        <th className="p-2.5">Row</th>
                        <th className="p-2.5">Data Content</th>
                        <th className="p-2.5 text-center">Status</th>
                        <th className="p-2.5">Validation Diagnostics</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {validationResult.preview.map((row) => (
                        <tr key={row.rowNumber} className={row.isValid ? 'hover:bg-slate-50' : 'bg-rose-50/40'}>
                          <td className="p-2.5 font-mono text-slate-500">#{row.rowNumber}</td>
                          <td className="p-2.5 font-mono text-slate-800">
                            {JSON.stringify(row.data).slice(0, 80)}...
                          </td>
                          <td className="p-2.5 text-center">
                            {row.isValid ? (
                              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                                VALID
                              </span>
                            ) : (
                              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-100 text-rose-800">
                                ERROR
                              </span>
                            )}
                          </td>
                          <td className="p-2.5 text-rose-600 text-xs">
                            {row.errors.join(', ') || 'No issues found'}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 4: RETENTION POLICY */}
      {activeTab === 'retention' && (
        <form onSubmit={handleSaveRetention} className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-6 max-w-2xl">
          <div>
            <h3 className="text-base font-bold text-slate-900">Platform Data Retention & Automated Purge Policy</h3>
            <p className="text-xs text-slate-500 mt-1">
              Configure data lifecycle windows for security audit trails, authentication logs, and backup snapshots.
            </p>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Audit Logs Retention (Days)
              </label>
              <input
                type="number"
                min="30"
                max="3650"
                value={retentionPolicy.auditLogsDays}
                onChange={(e) => setRetentionPolicy({ ...retentionPolicy, auditLogsDays: parseInt(e.target.value) || 90 })}
                className="w-full px-3 py-2 text-sm border border-slate-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Login History & Failed Attempts (Days)
              </label>
              <input
                type="number"
                min="30"
                max="3650"
                value={retentionPolicy.loginHistoryDays}
                onChange={(e) => setRetentionPolicy({ ...retentionPolicy, loginHistoryDays: parseInt(e.target.value) || 180 })}
                className="w-full px-3 py-2 text-sm border border-slate-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Backup Snapshots Retention (Days)
              </label>
              <input
                type="number"
                min="30"
                max="3650"
                value={retentionPolicy.backupSnapshotsDays}
                onChange={(e) => setRetentionPolicy({ ...retentionPolicy, backupSnapshotsDays: parseInt(e.target.value) || 365 })}
                className="w-full px-3 py-2 text-sm border border-slate-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:outline-none"
              />
            </div>

            <div className="flex items-center gap-2 pt-2">
              <input
                type="checkbox"
                id="autoPurge"
                checked={retentionPolicy.autoPurgeEnabled}
                onChange={(e) => setRetentionPolicy({ ...retentionPolicy, autoPurgeEnabled: e.target.checked })}
                className="rounded text-purple-600 focus:ring-purple-500"
              />
              <label htmlFor="autoPurge" className="text-xs font-medium text-slate-700">
                Enable Automated Nightly Purge of Expired Audit Records
              </label>
            </div>
          </div>

          <div className="pt-3 border-t border-slate-100 flex justify-end">
            <button
              type="submit"
              className="px-5 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-semibold text-xs sm:text-sm shadow-sm transition-colors cursor-pointer"
            >
              Save Retention Policy
            </button>
          </div>
        </form>
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
