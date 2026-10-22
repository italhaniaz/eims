import React, { useState, useEffect, useMemo } from 'react'
import { 
  Sliders, 
  Check, 
  X, 
  Layers, 
  Building2, 
  Search, 
  Filter, 
  Sparkles, 
  ShieldCheck, 
  RefreshCw, 
  HardDrive, 
  Users, 
  School, 
  Edit3, 
  Save, 
  AlertCircle,
  GraduationCap
} from 'lucide-react'
import { useAppData } from '../../../context/AppDataContext'
import { useToast } from '../../../context/ToastContext'
import Modal from '../../../components/common/Modal'
import { PlatformService, PLATFORM_MODULES } from '../../../services/platformService'

export const ModulesControlView = () => {
  const { institutes = [], refreshData } = useAppData()
  const { toast } = useToast()

  const [matrixData, setMatrixData] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [typeFilter, setTypeFilter] = useState('ALL') // ALL, School, College, University

  // Bulk Apply state
  const [bulkModuleKey, setBulkModuleKey] = useState(PLATFORM_MODULES[0]?.key || 'students')
  const [bulkActionState, setBulkActionState] = useState(true) // true = enable, false = disable

  // Quota Edit Modal state
  const [quotaTargetInstitute, setQuotaTargetInstitute] = useState(null)
  const [quotaForm, setQuotaForm] = useState({
    quotaStudents: 1500,
    quotaUsers: 50,
    quotaCampuses: 3,
    quotaStorageMb: 2048
  })

  // Load matrix data
  const loadMatrix = async () => {
    setLoading(true)
    try {
      const data = await PlatformService.getAllInstitutesModulesMatrix(institutes)
      setMatrixData(data)
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadMatrix()
  }, [institutes.length])

  // Filter institutes
  const filteredInstitutes = useMemo(() => {
    return institutes.filter(inst => {
      const matchesSearch = 
        inst.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        inst.code.toLowerCase().includes(searchTerm.toLowerCase())
      const instType = inst.type || 'School'
      const matchesType = typeFilter === 'ALL' || instType.toLowerCase() === typeFilter.toLowerCase()
      return matchesSearch && matchesType
    })
  }, [institutes, searchTerm, typeFilter])

  // Helper to check if an institute has a module enabled
  const isModuleEnabled = (instituteId, moduleKey) => {
    const entry = matrixData.find(
      m => (m.instituteId === instituteId || m.institute_id === instituteId) &&
           (m.moduleKey === moduleKey || m.module_key === moduleKey)
    )
    return entry ? Boolean(entry.enabled) : true
  }

  // Toggle single module flag
  const handleToggleModule = async (instituteId, moduleKey) => {
    const currentVal = isModuleEnabled(instituteId, moduleKey)
    const nextVal = !currentVal

    // Optimistic UI update
    setMatrixData(prev => prev.map(m => {
      if ((m.instituteId === instituteId || m.institute_id === instituteId) &&
          (m.moduleKey === moduleKey || m.module_key === moduleKey)) {
        return { ...m, enabled: nextVal }
      }
      return m
    }))

    try {
      await PlatformService.toggleInstituteModule(instituteId, moduleKey, nextVal)
      toast.success(`Module "${PLATFORM_MODULES.find(p => p.key === moduleKey)?.name}" ${nextVal ? 'enabled' : 'disabled'}`)
    } catch (e) {
      toast.error('Failed to update feature flag')
      loadMatrix()
    }
  }

  // Bulk Apply handler
  const handleBulkApply = async () => {
    const moduleObj = PLATFORM_MODULES.find(m => m.key === bulkModuleKey)
    const instituteIds = filteredInstitutes.map(i => i.id)

    if (instituteIds.length === 0) {
      toast.warning('No matching institutes found to update.')
      return
    }

    try {
      await PlatformService.bulkApplyModuleStatus(bulkModuleKey, bulkActionState, instituteIds)
      await loadMatrix()
      toast.success(
        `Applied "${moduleObj?.name}" as ${bulkActionState ? 'ENABLED' : 'DISABLED'} for ${instituteIds.length} institutes!`
      )
    } catch (e) {
      toast.error('Bulk apply failed')
    }
  }

  // Open Quotas Modal
  const openQuotaModal = (inst) => {
    setQuotaTargetInstitute(inst)
    setQuotaForm({
      quotaStudents: inst.quotaStudents || 1500,
      quotaUsers: inst.quotaUsers || 50,
      quotaCampuses: inst.quotaCampuses || 3,
      quotaStorageMb: inst.quotaStorageMb || 2048
    })
  }

  // Save Quotas
  const handleSaveQuotas = async (e) => {
    e.preventDefault()
    if (!quotaTargetInstitute) return

    try {
      await PlatformService.updateInstituteQuotas(quotaTargetInstitute.id, quotaForm)
      refreshData()
      await loadMatrix()
      toast.success(`Quota limits updated for "${quotaTargetInstitute.name}"!`)
      setQuotaTargetInstitute(null)
    } catch (e) {
      toast.error('Failed to update quotas')
    }
  }

  // Summary Metrics
  const totalAllocatedStudents = institutes.reduce((acc, i) => acc + (i.quotaStudents || 1500), 0)
  const totalAllocatedStorageGB = Math.round(institutes.reduce((acc, i) => acc + (i.quotaStorageMb || 2048), 0) / 1024)

  return (
    <div className="p-4 sm:p-6 md:p-8 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Sliders className="w-5 h-5 text-blue-600" />
            <h1 className="text-xl font-bold text-slate-900 tracking-tight">Cross-Institute Module Control & Feature Flags</h1>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Centrally govern feature flags, software capabilities, and storage/student quotas per institute
          </p>
        </div>

        <button
          onClick={loadMatrix}
          className="flex items-center gap-1.5 px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-semibold border border-slate-200 transition-all cursor-pointer"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Refresh Matrix</span>
        </button>
      </div>

      {/* KPI Overview Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs flex items-center justify-between">
          <div>
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Institutes Governed</span>
            <span className="text-xl font-bold text-slate-900 mt-1 block">{institutes.length}</span>
          </div>
          <div className="w-9 h-9 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
            <Building2 className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs flex items-center justify-between">
          <div>
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Available Modules</span>
            <span className="text-xl font-bold text-slate-900 mt-1 block">{PLATFORM_MODULES.length} Systems</span>
          </div>
          <div className="w-9 h-9 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
            <Layers className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs flex items-center justify-between">
          <div>
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Total Student Capacity</span>
            <span className="text-xl font-bold text-slate-900 mt-1 block">{totalAllocatedStudents.toLocaleString()}</span>
          </div>
          <div className="w-9 h-9 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <Users className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs flex items-center justify-between">
          <div>
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Cloud Storage Pool</span>
            <span className="text-xl font-bold text-slate-900 mt-1 block">{totalAllocatedStorageGB} GB</span>
          </div>
          <div className="w-9 h-9 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center">
            <HardDrive className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Bulk Action Controls Bar */}
      <div className="bg-gradient-to-r from-blue-50/80 via-indigo-50/60 to-white border border-blue-200/80 rounded-2xl p-4 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 shadow-2xs">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-blue-600 text-white flex items-center justify-center shrink-0">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-xs font-bold text-slate-900">Bulk Feature Flag Execution</h3>
            <p className="text-[11px] text-slate-500">Enable or disable a specific module across all filtered institutes with 1 click</p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <select
            value={bulkModuleKey}
            onChange={(e) => setBulkModuleKey(e.target.value)}
            className="px-3 py-1.5 text-xs bg-white border border-slate-200 rounded-lg text-slate-700 font-semibold focus:outline-none"
          >
            {PLATFORM_MODULES.map(m => (
              <option key={m.key} value={m.key}>{m.name}</option>
            ))}
          </select>

          <select
            value={bulkActionState ? 'enable' : 'disable'}
            onChange={(e) => setBulkActionState(e.target.value === 'enable')}
            className="px-3 py-1.5 text-xs bg-white border border-slate-200 rounded-lg text-slate-700 font-semibold focus:outline-none"
          >
            <option value="enable">Enable (Activate)</option>
            <option value="disable">Disable (Lock)</option>
          </select>

          <button
            onClick={handleBulkApply}
            className="px-4 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-lg shadow-sm transition-all cursor-pointer"
          >
            Apply to Filtered ({filteredInstitutes.length})
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search institute name or code..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-xs rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
          />
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-400 font-medium">Filter Type:</span>
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="px-2.5 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-700 font-medium focus:outline-none"
          >
            <option value="ALL">All Institutes</option>
            <option value="School">School</option>
            <option value="College">College</option>
            <option value="University">University</option>
          </select>
        </div>
      </div>

      {/* Feature Flags Matrix Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-200 text-slate-600 font-bold uppercase tracking-wider text-[11px]">
                <th className="py-3.5 px-4 sticky left-0 bg-slate-50 z-10 min-w-[220px]">
                  Institute / Campus
                </th>
                <th className="py-3.5 px-3 text-center min-w-[90px]">Quotas</th>
                {PLATFORM_MODULES.map(m => (
                  <th key={m.key} className="py-3.5 px-2 text-center min-w-[85px] whitespace-nowrap" title={m.description}>
                    {m.name.split(' ')[0]}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredInstitutes.length > 0 ? (
                filteredInstitutes.map((inst) => {
                  const instType = inst.type || 'School'
                  return (
                    <tr key={inst.id} className="hover:bg-slate-50/50 transition-colors">
                      {/* Institute Column (Sticky) */}
                      <td className="py-3 px-4 sticky left-0 bg-white hover:bg-slate-50/50 z-10 border-r border-slate-100">
                        <div className="flex items-center gap-2.5">
                          <div 
                            className="w-7 h-7 rounded-lg flex items-center justify-center font-bold text-white shrink-0 shadow-2xs"
                            style={{ backgroundColor: inst.primaryColor || '#2563eb' }}
                          >
                            {instType === 'University' ? <GraduationCap className="w-4 h-4" /> :
                             instType === 'College' ? <Building2 className="w-4 h-4" /> :
                             <School className="w-4 h-4" />}
                          </div>
                          <div>
                            <span className="font-bold text-slate-800 line-clamp-1">{inst.name}</span>
                            <div className="flex items-center gap-1.5 text-[10px] text-slate-400 mt-0.5">
                              <span className="font-mono">{inst.code}</span>
                              <span>•</span>
                              <span>{instType}</span>
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Quotas Button Column */}
                      <td className="py-3 px-3 text-center border-r border-slate-100">
                        <button
                          onClick={() => openQuotaModal(inst)}
                          className="px-2 py-1 bg-slate-100 hover:bg-blue-50 text-slate-700 hover:text-blue-700 rounded-md font-bold text-[11px] transition-colors border border-slate-200"
                          title="Configure Max Students, Users, Storage"
                        >
                          <Edit3 className="w-3 h-3 inline mr-1" />
                          <span>Limits</span>
                        </button>
                      </td>

                      {/* 10 Module Toggles */}
                      {PLATFORM_MODULES.map(m => {
                        const enabled = isModuleEnabled(inst.id, m.key)
                        return (
                          <td key={m.key} className="py-3 px-2 text-center">
                            <button
                              onClick={() => handleToggleModule(inst.id, m.key)}
                              className={`w-7 h-7 rounded-lg transition-all inline-flex items-center justify-center cursor-pointer shadow-2xs ${
                                enabled
                                  ? 'bg-emerald-500 hover:bg-emerald-600 text-white shadow-emerald-500/20'
                                  : 'bg-slate-100 hover:bg-slate-200 text-slate-300'
                              }`}
                              title={`${m.name}: ${enabled ? 'Enabled (Click to disable)' : 'Disabled (Click to enable)'}`}
                            >
                              {enabled ? <Check className="w-4 h-4" /> : <X className="w-3.5 h-3.5 text-slate-400" />}
                            </button>
                          </td>
                        )
                      })}
                    </tr>
                  )
                })
              ) : (
                <tr>
                  <td colSpan={PLATFORM_MODULES.length + 2} className="py-12 text-center text-slate-400 text-xs">
                    No institutes found. Register campuses first.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Quotas Configuration Modal */}
      {quotaTargetInstitute && (
        <Modal
          isOpen={Boolean(quotaTargetInstitute)}
          onClose={() => setQuotaTargetInstitute(null)}
          title={`Quota Limits: ${quotaTargetInstitute.name}`}
        >
          <form onSubmit={handleSaveQuotas} className="space-y-4">
            <p className="text-xs text-slate-500">
              Configure maximum quota allocations, student intake capacities, and cloud storage for this campus.
            </p>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-600 uppercase mb-1">Max Enrolled Students</label>
                <input
                  type="number"
                  min="50"
                  step="50"
                  value={quotaForm.quotaStudents}
                  onChange={(e) => setQuotaForm({ ...quotaForm, quotaStudents: parseInt(e.target.value) || 0 })}
                  className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 font-bold"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 uppercase mb-1">Max User Accounts (Staff)</label>
                <input
                  type="number"
                  min="5"
                  step="5"
                  value={quotaForm.quotaUsers}
                  onChange={(e) => setQuotaForm({ ...quotaForm, quotaUsers: parseInt(e.target.value) || 0 })}
                  className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 font-bold"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-600 uppercase mb-1">Allowed Branch Campuses</label>
                <input
                  type="number"
                  min="1"
                  max="50"
                  value={quotaForm.quotaCampuses}
                  onChange={(e) => setQuotaForm({ ...quotaForm, quotaCampuses: parseInt(e.target.value) || 1 })}
                  className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 font-bold"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 uppercase mb-1">Cloud Storage Pool (MB)</label>
                <input
                  type="number"
                  min="512"
                  step="512"
                  value={quotaForm.quotaStorageMb}
                  onChange={(e) => setQuotaForm({ ...quotaForm, quotaStorageMb: parseInt(e.target.value) || 512 })}
                  className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 font-bold"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setQuotaTargetInstitute(null)}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-sm"
              >
                Save Quotas
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  )
}

export default ModulesControlView
