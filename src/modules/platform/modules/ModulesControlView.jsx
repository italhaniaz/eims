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
  GraduationCap,
  ChevronDown,
  CheckCircle2,
  ArrowRight,
  Shield
} from 'lucide-react'
import { useAppData } from '../../../context/AppDataContext'
import { useToast } from '../../../context/ToastContext'
import Modal from '../../../components/common/Modal'
import { PlatformService, PLATFORM_MODULES } from '../../../services/platformService'

export const ModulesControlView = () => {
  const { institutes = [], students = [], refreshData } = useAppData()
  const { toast } = useToast()

  const [matrixData, setMatrixData] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [typeFilter, setTypeFilter] = useState('ALL') // ALL, School, Enterprise

  // Bulk Apply state
  const [bulkModuleKey, setBulkModuleKey] = useState(PLATFORM_MODULES[0]?.key || 'students')
  const [bulkActionState, setBulkActionState] = useState(true) // true = enable, false = disable

  // Active Tab: 'wings' (Educational Wings) vs 'features' (System Modules)
  const [activeControlTab, setActiveControlTab] = useState('wings')

  // Wings Configuration Modal state
  const [wingsTargetInstitute, setWingsTargetInstitute] = useState(null)
  const [wingsForm, setWingsForm] = useState({
    enabledTiers: ['school'],
    planTier: 'School Plan',
    quotaStudents: 1500,
    quotaStorageMb: 2048
  })

  // Quick 1-click wing toggle from matrix table
  const handleToggleWing = async (instituteId, wingKey) => {
    const inst = institutes.find(i => i.id === instituteId)
    if (!inst) return

    const currentTiers = inst.enabledTiers || ['school']
    const isCurrentlyEnabled = currentTiers.includes(wingKey)
    const nextVal = !isCurrentlyEnabled

    if (!nextVal && currentTiers.length <= 1) {
      toast.warning('Every school must retain active School Wing licensing!')
      return
    }

    try {
      await PlatformService.toggleInstituteWing(instituteId, wingKey, nextVal)
      refreshData()
      toast.success(
        `School Wing (K-10 & Matric) ${nextVal ? 'ENABLED' : 'DISABLED'} for "${inst.name}"!`
      )
    } catch (err) {
      toast.error(err.message || 'Failed to toggle school wing')
    }
  }

  // Open Wings & Plan configuration modal
  const handleOpenWingsModal = (inst) => {
    setWingsTargetInstitute(inst)
    setWingsForm({
      enabledTiers: ['school'],
      planTier: inst.planTier || 'School Plan',
      quotaStudents: inst.quotaStudents || 1500,
      quotaStorageMb: inst.quotaStorageMb || 2048
    })
  }

  // Toggle wing in the modal
  const handleToggleWingInForm = () => {
    toast.info('School Wing is core and required for all school campuses.')
  }

  // Save Wings & Plan
  const handleSaveWingsAndPlan = async (e) => {
    e.preventDefault()
    if (!wingsTargetInstitute) return

    try {
      await PlatformService.updateInstituteWingsAndPlan(wingsTargetInstitute.id, {
        enabledTiers: ['school'],
        planTier: wingsForm.planTier,
        planType: wingsForm.planTier === 'Enterprise Network' ? 'ENTERPRISE' : wingsForm.planTier === 'Starter Trial' ? 'TRIAL' : 'SCHOOL',
        type: 'School'
      })

      await PlatformService.updateInstituteQuotas(wingsTargetInstitute.id, {
        quotaStudents: wingsForm.quotaStudents,
        quotaStorageMb: wingsForm.quotaStorageMb,
        quotaCampuses: wingsTargetInstitute.quotaCampuses || 3,
        quotaUsers: wingsTargetInstitute.quotaUsers || 50
      })

      refreshData()
      setWingsTargetInstitute(null)
      toast.success(`School plan & quotas updated for "${wingsTargetInstitute.name}"!`)
    } catch (err) {
      toast.error(err.message || 'Failed to save school configurations')
    }
  }

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
    const handleSync = () => loadMatrix()
    window.addEventListener('sms_institutes_updated', handleSync)
    window.addEventListener('sms_modules_updated', handleSync)
    window.addEventListener('storage', handleSync)
    return () => {
      window.removeEventListener('sms_institutes_updated', handleSync)
      window.removeEventListener('sms_modules_updated', handleSync)
      window.removeEventListener('storage', handleSync)
    }
  }, [institutes])

  // Dynamic counts for wing filter badges
  const { schoolCount, enterpriseCount } = useMemo(() => {
    let school = 0
    let enterprise = 0

    institutes.forEach(inst => {
      school++
      if ((inst.planTier || '').toLowerCase().includes('enterprise')) enterprise++
    })

    return { schoolCount: school, enterpriseCount: enterprise }
  }, [institutes])

  // Filter institutes
  const filteredInstitutes = useMemo(() => {
    return institutes.filter(inst => {
      const term = searchTerm.toLowerCase().trim()
      const matchesSearch = !term ||
        (inst.name && inst.name.toLowerCase().includes(term)) ||
        (inst.code && inst.code.toLowerCase().includes(term)) ||
        (inst.city && inst.city.toLowerCase().includes(term))

      let matchesWing = true
      const f = typeFilter.toLowerCase()
      if (f === 'enterprise') {
        matchesWing = (inst.planTier || '').toLowerCase().includes('enterprise')
      } else if (typeFilter !== 'ALL' && f !== 'school') {
        matchesWing = inst.type?.toLowerCase() === f
      }

      return matchesSearch && matchesWing
    })
  }, [institutes, searchTerm, typeFilter])

  // Helper to check if an institute has a module enabled
  const isModuleEnabled = (instituteId, moduleKey) => {
    const entry = matrixData.find(
      m => (m.instituteId === instituteId || m.institute_id === instituteId) &&
           (m.moduleKey === moduleKey || m.module_key === moduleKey)
    )
    if (entry !== undefined && entry.enabled !== undefined) {
      return Boolean(entry.enabled)
    }

    return ['students', 'fees', 'exams', 'library', 'admissions', 'timetable', 'curriculum'].includes(moduleKey)
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

    const actionText = bulkActionState ? 'ENABLE' : 'DISABLE'
    if (!bulkActionState && ['students', 'fees', 'exams', 'classes', 'academics'].includes(bulkModuleKey)) {
      if (!window.confirm(`CRITICAL SAFETY ALERT: "${moduleObj?.name || bulkModuleKey}" is a core academic module.\n\nDisabling it will hide primary student & operational features across ${instituteIds.length} campus branches.\n\nAre you sure you want to proceed?`)) {
        return
      }
    } else if (!window.confirm(`Are you sure you want to ${actionText} module "${moduleObj?.name || bulkModuleKey}" across ${instituteIds.length} institute(s)?`)) {
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

  // Dynamic Real Metrics (no dummy fallback data)
  const enrolledStudentsCount = students.length
  const totalAllocatedStudents = institutes.reduce((acc, i) => acc + (Number(i.quotaStudents) || 0), 0)
  const totalAllocatedStorageGB = Math.round(institutes.reduce((acc, i) => acc + (Number(i.quotaStorageMb) || 0), 0) / 1024)
  const activeCampusesCount = institutes.filter(i => (i.status || i.lifecycleStatus) === 'Active').length

  return (
    <div className="p-4 sm:p-6 md:p-8 pb-16 space-y-6 max-w-[1400px] mx-auto">
      {/* Clean Light SaaS Header */}
      <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-4">
        <div className="min-w-0">
          <div className="flex items-center gap-2 mb-1.5">
            <span className="text-[11px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full bg-[#f5eeff] text-purple-700 border border-purple-100 inline-flex items-center gap-1.5">
              <Sliders className="w-3.5 h-3.5 text-purple-600" />
              <span>Multi-Campus Architecture & Feature Governance</span>
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight font-heading">
            Educational Wings & Modules Matrix
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1 max-w-2xl">
            Centrally govern School module capabilities, subscription plans, and storage/student quotas across all registered school campuses.
          </p>
        </div>

        <button
          onClick={loadMatrix}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-white hover:bg-slate-50 text-slate-700 border border-slate-200/80 rounded-xl font-semibold text-xs sm:text-sm shadow-2xs transition-all cursor-pointer self-start xl:self-auto active:scale-95 whitespace-nowrap shrink-0"
        >
          <RefreshCw className="w-4 h-4 text-purple-600 shrink-0" />
          <span>Refresh Matrix</span>
        </button>
      </div>

      {/* Dynamic KPI Overview Grid (Real Data Sync) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs flex items-center justify-between">
          <div>
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Institutes Governed</span>
            <span className="text-xl font-bold text-slate-900 mt-0.5 block">{institutes.length} Campuses</span>
            <span className="text-[10px] text-emerald-600 font-semibold mt-0.5 inline-block">{activeCampusesCount} Active & Verified</span>
          </div>
          <div className="w-9 h-9 rounded-lg bg-[#f5eeff] text-purple-600 flex items-center justify-center">
            <Building2 className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs flex items-center justify-between">
          <div>
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Core Capabilities</span>
            <span className="text-xl font-bold text-slate-900 mt-0.5 block">{PLATFORM_MODULES.length} Systems</span>
            <span className="text-[10px] text-purple-600 font-semibold mt-0.5 inline-block">{matrixData.filter(m => m.enabled).length} Active Flags</span>
          </div>
          <div className="w-9 h-9 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
            <Layers className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs flex items-center justify-between">
          <div>
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Live Enrolled Students</span>
            <span className="text-xl font-bold text-slate-900 mt-0.5 block">{enrolledStudentsCount.toLocaleString()} Enrolled</span>
            <span className="text-[10px] text-slate-500 font-medium mt-0.5 inline-block">
              {totalAllocatedStudents > 0 ? `Quota: ${totalAllocatedStudents.toLocaleString()}` : 'Dynamic Scaling'}
            </span>
          </div>
          <div className="w-9 h-9 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <Users className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs flex items-center justify-between">
          <div>
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Allocated Cloud Storage</span>
            <span className="text-xl font-bold text-slate-900 mt-0.5 block">
              {totalAllocatedStorageGB > 0 ? `${totalAllocatedStorageGB} GB` : 'Dynamic Quota'}
            </span>
            <span className="text-[10px] text-slate-500 font-medium mt-0.5 inline-block">
              {institutes.length > 0 ? `${institutes.length} Cloud Nodes` : 'No Active Storage'}
            </span>
          </div>
          <div className="w-9 h-9 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center">
            <HardDrive className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Navigation Matrix Dropdown & Compact Wing Filter Bar */}
      <div className="bg-white p-2.5 rounded-2xl border border-slate-200/90 shadow-2xs flex flex-col md:flex-row md:items-center justify-between gap-3">
        {/* Matrix View Mode Dropdown */}
        <div className="flex items-center gap-2">
          <div className="relative inline-flex items-center">
            <div className="flex items-center gap-2.5 px-3 py-1.5 bg-gradient-to-r from-[#fbf8ff] to-white hover:bg-slate-50 border border-purple-200/90 rounded-xl shadow-2xs transition-all">
              {activeControlTab === 'wings' ? (
                <div className="w-7 h-7 rounded-lg bg-[#f5eeff] text-purple-700 flex items-center justify-center shrink-0">
                  <GraduationCap className="w-4 h-4 text-purple-600" />
                </div>
              ) : (
                <div className="w-7 h-7 rounded-lg bg-[#f5eeff] text-purple-700 flex items-center justify-center shrink-0">
                  <Sliders className="w-4 h-4 text-purple-600" />
                </div>
              )}
              <div className="flex flex-col text-left">
                <span className="text-[9px] font-bold text-purple-600 uppercase tracking-wider leading-none">Matrix Control View</span>
                <select
                  value={activeControlTab}
                  onChange={(e) => setActiveControlTab(e.target.value)}
                  aria-label="Select Matrix Control View"
                  className="bg-transparent text-xs sm:text-[13px] font-bold text-slate-900 focus:outline-none cursor-pointer pr-6 appearance-none mt-0.5"
                >
                  <option value="wings">School Licensing Matrix (K-10 & Matric)</option>
                  <option value="features">Feature Capabilities Matrix ({PLATFORM_MODULES.length} Core Modules)</option>
                </select>
              </div>
              <ChevronDown className="w-4 h-4 text-purple-600 pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2" />
            </div>
          </div>
        </div>

        {/* Compact Wing Filter & Search Controls */}
        <div className="flex items-center gap-2 self-start md:self-center shrink-0">
          {/* Quick Compact Search Box */}
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search campus or code..."
              className="pl-8 pr-7 py-1.5 bg-slate-50 hover:bg-slate-100/70 focus:bg-white text-xs text-slate-800 placeholder-slate-400 rounded-xl border border-slate-200/90 focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 transition-all w-36 sm:w-44 font-medium"
            />
            {searchTerm && (
              <button
                type="button"
                onClick={() => setSearchTerm('')}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <X className="w-3 h-3" />
              </button>
            )}
          </div>

          {/* Compact Sized Wing Filter Dropdown */}
          <div className="flex items-center gap-1.5 px-2.5 py-1.5 bg-slate-50 hover:bg-slate-100/70 border border-slate-200/90 rounded-xl transition-all shadow-2xs">
            <Filter className="w-3.5 h-3.5 text-purple-600 shrink-0" />
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              aria-label="Filter institutes by educational wing"
              className="bg-transparent text-xs font-bold text-slate-800 focus:outline-none cursor-pointer pr-1"
            >
              <option value="ALL">All Schools ({institutes.length})</option>
              <option value="school">School Standard ({schoolCount})</option>
              <option value="enterprise">Enterprise Network ({enterpriseCount})</option>
            </select>
          </div>

          {typeFilter !== 'ALL' && (
            <button
              type="button"
              onClick={() => setTypeFilter('ALL')}
              className="px-2 py-1 text-[11px] font-semibold text-purple-700 hover:text-purple-800 hover:bg-purple-50 rounded-lg transition-colors cursor-pointer"
              title="Reset Wing Filter"
            >
              Reset
            </button>
          )}
        </div>
      </div>

      {/* TAB 1: EDUCATIONAL WINGS & TIER MATRIX (DEFAULT) */}
      {activeControlTab === 'wings' && (
        <div className="space-y-4">
          <div className="bg-[#fcfaff] border border-purple-100 rounded-2xl p-4.5 flex flex-col md:flex-row items-start md:items-center justify-between gap-3 shadow-2xs">
            <div className="flex items-center gap-3.5">
              <div className="w-10 h-10 rounded-xl bg-[#f5eeff] text-purple-700 border border-purple-100 flex items-center justify-center shrink-0 shadow-2xs">
                <School className="w-5 h-5 text-purple-600" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900">School Wing & Plan Governance</h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Govern School Wing licensing and subscription tiers with 1 click. Changes dynamically update the School Admin portal, class creation levels, staff assignments, and admissions.
                </p>
              </div>
            </div>
          </div>

          {/* Wings Matrix Table */}
          <div className="bg-white rounded-3xl border border-slate-100 shadow-[0_2px_15px_rgba(0,0,0,0.02)] overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-50/90 border-b border-slate-200 text-slate-600 font-bold uppercase tracking-wider text-[11px]">
                    <th className="py-3.5 px-4 min-w-[200px] sticky left-0 bg-slate-50 z-20 shadow-[2px_0_5px_rgba(0,0,0,0.04)]">School / Campus</th>
                    <th className="py-3.5 px-3 min-w-[120px]">Subscription Plan</th>
                    <th className="py-3.5 px-3 text-center min-w-[130px]">🏫 School Wing</th>
                    <th className="py-3.5 px-4 min-w-[240px]">Portal Configuration</th>
                    <th className="py-3.5 px-3 text-right min-w-[130px]">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredInstitutes.length > 0 ? (
                    filteredInstitutes.map((inst) => {
                      const currentTiers = inst.enabledTiers || ['school']
                      const isSchoolOn = currentTiers.includes('school')

                      return (
                        <tr key={inst.id} className="hover:bg-slate-50/60 transition-colors">
                          {/* Institute Column */}
                          <td className="py-3.5 px-4 sticky left-0 bg-white z-10 shadow-[2px_0_5px_rgba(0,0,0,0.04)] border-r border-slate-100">
                            <div className="flex items-center gap-2.5">
                              <div className="w-9 h-9 rounded-xl flex items-center justify-center font-bold shrink-0 transition-colors shadow-2xs border bg-emerald-50 text-emerald-700 border-emerald-100">
                                <School className="w-4.5 h-4.5" />
                              </div>
                              <div>
                                <span className="font-bold text-slate-900 text-xs sm:text-sm">{inst.name}</span>
                                <div className="flex items-center gap-1.5 text-[10px] text-slate-400 mt-0.5">
                                  <span className="font-mono bg-slate-100 px-1.5 py-0.2 rounded font-semibold text-slate-600">{inst.code}</span>
                                  <span>•</span>
                                  <span>{inst.city || 'Central'}</span>
                                </div>
                              </div>
                            </div>
                          </td>

                          {/* Plan Badge */}
                          <td className="py-3.5 px-3">
                            <span className="inline-flex px-2.5 py-1 rounded-full text-xs font-bold bg-[#f5eeff] text-purple-700 border border-purple-100">
                              {inst.planTier || 'School Plan'}
                            </span>
                          </td>

                          {/* School Wing Toggle */}
                          <td className="py-3.5 px-3 text-center">
                            <button
                              type="button"
                              onClick={() => handleToggleWing(inst.id, 'school')}
                              className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer inline-flex items-center gap-1.5 shadow-xs ${
                                isSchoolOn
                                  ? 'bg-purple-600 hover:bg-purple-700 text-white shadow-purple-600/20 active:scale-95'
                                  : 'bg-slate-100/90 text-slate-400 hover:bg-slate-200/80 hover:text-slate-600'
                              }`}
                              title={isSchoolOn ? 'School Wing Active (Click to toggle)' : 'School Wing Disabled (Click to activate)'}
                            >
                              {isSchoolOn ? <Check className="w-3.5 h-3.5 stroke-[2.5]" /> : <X className="w-3.5 h-3.5" />}
                              <span>{isSchoolOn ? 'Active' : 'Disabled'}</span>
                            </button>
                            <span className="block text-[10px] text-slate-400 mt-1 font-medium">K-10 & Matric / O-Levels</span>
                          </td>

                          {/* Portal Configuration Info */}
                          <td className="py-3.5 px-4">
                            <div className="space-y-1 text-[11px]">
                              <div className="flex items-center gap-1 text-slate-700">
                                <span className="font-semibold text-slate-900">Admin Portal:</span>
                                <span>School Admin Dashboard</span>
                              </div>
                              <div className="flex items-center gap-1 text-slate-500 text-[10px]">
                                <span>Faculty: School Teachers</span>
                                <span>•</span>
                                <span>Students: Grades PG - 10</span>
                              </div>
                            </div>
                          </td>

                          {/* Actions */}
                          <td className="py-3.5 px-3 text-right">
                            <button
                              type="button"
                              onClick={() => handleOpenWingsModal(inst)}
                              className="px-3 py-1.5 bg-[#f5eeff] hover:bg-[#ede0fe] text-purple-700 font-semibold rounded-xl text-xs transition-colors border border-purple-200/50 cursor-pointer shadow-2xs"
                            >
                              Configure
                            </button>
                          </td>
                        </tr>
                      )
                    })
                  ) : (
                    <tr>
                      <td colSpan={7} className="py-12 text-center text-slate-400 text-xs">
                        No institutes match your search criteria.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: SYSTEM FEATURE CAPABILITIES MATRIX */}
      {activeControlTab === 'features' && (
        <div className="space-y-4">
      {/* Bulk Action Controls Bar */}
      <div className="bg-gradient-to-r from-[#f5eeff] via-indigo-50/60 to-white border border-purple-200/80 rounded-2xl p-4 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 shadow-2xs">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-purple-600 text-white flex items-center justify-center shrink-0">
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
            className="px-4 py-1.5 bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold rounded-lg shadow-sm transition-all cursor-pointer"
          >
            Apply to Filtered ({filteredInstitutes.length})
          </button>
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
                          <div className="w-8 h-8 rounded-xl bg-[#f5eeff] text-purple-700 border border-purple-100 flex items-center justify-center font-bold shrink-0 shadow-2xs">
                            <School className="w-4 h-4" />
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
                          className="px-2 py-1 bg-slate-100 hover:bg-purple-50 text-slate-700 hover:text-purple-700 rounded-md font-bold text-[11px] transition-colors border border-slate-200"
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
        </div>
      )}

      {/* WINGS & SUBSCRIPTION PLAN CONFIGURATION MODAL */}
      {wingsTargetInstitute && (
        <Modal
          isOpen={true}
          onClose={() => setWingsTargetInstitute(null)}
          title={`Configure Educational Wings: ${wingsTargetInstitute.name}`}
          maxWidth="max-w-lg"
        >
          <form onSubmit={handleSaveWingsAndPlan} className="space-y-4">
            <div className="p-3 bg-[#f5eeff] border border-purple-200 rounded-xl text-xs text-purple-900">
              Manage licensed School plan tier and quotas for <strong>{wingsTargetInstitute.name}</strong>.
            </div>

            <div className="space-y-2.5">
              <label className="block text-xs font-bold text-slate-700 uppercase">Licensed Scope</label>
              <div className="p-3 rounded-xl border bg-[#f5eeff]/70 border-purple-300 ring-1 ring-purple-500/20 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-purple-100 text-purple-700 flex items-center justify-center font-bold">
                    <School className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-900">School Wing (Core)</h4>
                    <p className="text-[11px] text-slate-500">Playgroup, Nursery, Primary, Middle & Matric (SSC / O-Levels)</p>
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={true}
                  readOnly
                  className="w-4 h-4 rounded text-purple-600 pointer-events-none"
                />
              </div>
            </div>

            {/* Subscription Plan Selector */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Assigned Subscription Plan</label>
              <select
                value={wingsForm.planTier}
                onChange={(e) => setWingsForm({ ...wingsForm, planTier: e.target.value })}
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 bg-white font-semibold"
              >
                <option value="School Plan">School Standard Plan (₨ 25,000 / mo)</option>
                <option value="Enterprise Network">Multi-Branch School Network (₨ 75,000 / mo)</option>
                <option value="Starter Trial">Starter Trial (30 Days Free)</option>
              </select>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setWingsTargetInstitute(null)}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2 text-xs font-bold text-white bg-purple-600 hover:bg-purple-700 rounded-lg shadow-sm cursor-pointer"
              >
                Save Wing Licenses
              </button>
            </div>
          </form>
        </Modal>
      )}

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
                  className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-purple-500/20 font-bold"
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
                  className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-purple-500/20 font-bold"
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
                  className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-purple-500/20 font-bold"
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
                  className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-purple-500/20 font-bold"
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
                className="px-5 py-2 text-xs font-bold text-white bg-purple-600 hover:bg-purple-700 rounded-lg shadow-sm"
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
