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
  CheckCircle2,
  ArrowRight,
  Shield
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

    const currentTiers = inst.enabledTiers || (
      inst.type === 'School' ? ['school'] :
      inst.type === 'College' ? ['college'] :
      inst.type === 'University' ? ['undergraduate'] : ['school']
    )
    const isCurrentlyEnabled = currentTiers.includes(wingKey)
    const nextVal = !isCurrentlyEnabled

    if (!nextVal && currentTiers.length <= 1) {
      toast.warning('An institute must have at least one active educational wing!')
      return
    }

    try {
      await PlatformService.toggleInstituteWing(instituteId, wingKey, nextVal)
      refreshData()
      const wingLabels = {
        school: 'School Wing (K-10 & Matric)',
        college: 'College Wing (11-12 & Intermediate)',
        undergraduate: 'University Wing (BS Degrees & Semesters)'
      }
      toast.success(
        `${wingLabels[wingKey] || wingKey} ${nextVal ? 'ENABLED' : 'DISABLED'} for "${inst.name}"!`
      )
    } catch (err) {
      toast.error(err.message || 'Failed to toggle educational wing')
    }
  }

  // Open Wings & Plan configuration modal
  const handleOpenWingsModal = (inst) => {
    setWingsTargetInstitute(inst)
    const currentTiers = inst.enabledTiers || (
      inst.type === 'School' ? ['school'] :
      inst.type === 'College' ? ['college'] :
      inst.type === 'University' ? ['undergraduate'] : ['school']
    )
    setWingsForm({
      enabledTiers: currentTiers,
      planTier: inst.planTier || 'School Plan',
      quotaStudents: inst.quotaStudents || 1500,
      quotaStorageMb: inst.quotaStorageMb || 2048
    })
  }

  // Toggle wing in the modal
  const handleToggleWingInForm = (wingKey) => {
    setWingsForm(prev => {
      const exists = prev.enabledTiers.includes(wingKey)
      let nextTiers
      if (exists) {
        if (prev.enabledTiers.length <= 1) {
          toast.warning('At least one wing must remain selected.')
          return prev
        }
        nextTiers = prev.enabledTiers.filter(w => w !== wingKey)
      } else {
        nextTiers = [...prev.enabledTiers, wingKey]
      }

      // Auto-determine plan tier based on selected wings
      let autoPlan = prev.planTier
      if (nextTiers.length > 1) autoPlan = 'Custom Hybrid Plan'
      else if (nextTiers.includes('school')) autoPlan = 'School Plan'
      else if (nextTiers.includes('college')) autoPlan = 'College Plan'
      else if (nextTiers.includes('undergraduate')) autoPlan = 'University Plan'

      return {
        ...prev,
        enabledTiers: nextTiers,
        planTier: autoPlan
      }
    })
  }

  // Save Wings & Plan
  const handleSaveWingsAndPlan = async (e) => {
    e.preventDefault()
    if (!wingsTargetInstitute) return

    try {
      await PlatformService.updateInstituteWingsAndPlan(wingsTargetInstitute.id, {
        enabledTiers: wingsForm.enabledTiers,
        planTier: wingsForm.planTier,
        planType: wingsForm.enabledTiers.length > 1 ? 'CUSTOM' : wingsForm.enabledTiers.includes('school') ? 'SCHOOL' : wingsForm.enabledTiers.includes('college') ? 'COLLEGE' : 'UNIVERSITY',
        type: wingsForm.enabledTiers.length > 1 ? 'Custom Group' : wingsForm.enabledTiers.includes('school') ? 'School' : wingsForm.enabledTiers.includes('college') ? 'College' : 'University'
      })

      await PlatformService.updateInstituteQuotas(wingsTargetInstitute.id, {
        quotaStudents: wingsForm.quotaStudents,
        quotaStorageMb: wingsForm.quotaStorageMb,
        quotaCampuses: wingsTargetInstitute.quotaCampuses || 3,
        quotaUsers: wingsTargetInstitute.quotaUsers || 50
      })

      refreshData()
      setWingsTargetInstitute(null)
      toast.success(`Educational wings & subscription plan updated for "${wingsTargetInstitute.name}"!`)
    } catch (err) {
      toast.error(err.message || 'Failed to save wing configurations')
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

      {/* Navigation Tabs: Educational Wings vs System Feature Modules */}
      <div className="border-b border-slate-200">
        <nav className="flex space-x-6">
          <button
            onClick={() => setActiveControlTab('wings')}
            className={`py-3 text-sm font-medium border-b-2 flex items-center gap-2 transition-colors cursor-pointer ${
              activeControlTab === 'wings'
                ? 'border-blue-600 text-blue-600 font-semibold'
                : 'border-transparent text-slate-500 hover:text-slate-700'
            }`}
          >
            <GraduationCap className="w-4 h-4 text-blue-600" />
            <span>Educational Wings Matrix (School • College • University)</span>
          </button>

          <button
            onClick={() => setActiveControlTab('features')}
            className={`py-3 text-sm font-medium border-b-2 flex items-center gap-2 transition-colors cursor-pointer ${
              activeControlTab === 'features'
                ? 'border-blue-600 text-blue-600 font-semibold'
                : 'border-transparent text-slate-500 hover:text-slate-700'
            }`}
          >
            <Sliders className="w-4 h-4 text-indigo-600" />
            <span>Feature Capabilities Matrix (10 Modules)</span>
          </button>
        </nav>
      </div>

      {/* TAB 1: EDUCATIONAL WINGS & TIER MATRIX (DEFAULT) */}
      {activeControlTab === 'wings' && (
        <div className="space-y-4">
          <div className="bg-gradient-to-r from-blue-50/80 via-indigo-50/50 to-white border border-blue-200/80 rounded-2xl p-4 flex flex-col md:flex-row items-start md:items-center justify-between gap-3 shadow-2xs">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-blue-600 text-white flex items-center justify-center shrink-0 shadow-xs">
                <School className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900">Institutional Educational Wings Governance</h3>
                <p className="text-xs text-slate-600 mt-0.5">
                  Toggle School, College, or University wings with 1 click. Changes dynamically update the Institute Admin portal, class creation levels, faculty assignments, and student admissions.
                </p>
              </div>
            </div>
          </div>

          {/* Wings Matrix Table */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-50/90 border-b border-slate-200 text-slate-600 font-bold uppercase tracking-wider text-[11px]">
                    <th className="py-3.5 px-4 min-w-[200px]">Institute / Campus</th>
                    <th className="py-3.5 px-3 min-w-[120px]">Subscription Plan</th>
                    <th className="py-3.5 px-3 text-center min-w-[130px]">🏫 School Wing</th>
                    <th className="py-3.5 px-3 text-center min-w-[130px]">🏛️ College Wing</th>
                    <th className="py-3.5 px-3 text-center min-w-[130px]">🎓 University Wing</th>
                    <th className="py-3.5 px-4 min-w-[240px]">Cascading Chain Impact</th>
                    <th className="py-3.5 px-3 text-right min-w-[130px]">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredInstitutes.length > 0 ? (
                    filteredInstitutes.map((inst) => {
                      const currentTiers = inst.enabledTiers || (
                        inst.type === 'School' ? ['school'] :
                        inst.type === 'College' ? ['college'] :
                        inst.type === 'University' ? ['undergraduate'] : ['school']
                      )
                      const isSchoolOn = currentTiers.includes('school')
                      const isCollegeOn = currentTiers.includes('college')
                      const isUniOn = currentTiers.includes('undergraduate')

                      return (
                        <tr key={inst.id} className="hover:bg-slate-50/60 transition-colors">
                          {/* Institute Column */}
                          <td className="py-3.5 px-4">
                            <div className="flex items-center gap-2.5">
                              <div 
                                className="w-8 h-8 rounded-lg flex items-center justify-center font-bold text-white shrink-0 shadow-2xs"
                                style={{ backgroundColor: inst.primaryColor || '#2563eb' }}
                              >
                                {isUniOn ? <GraduationCap className="w-4 h-4" /> :
                                 isCollegeOn ? <Building2 className="w-4 h-4" /> :
                                 <School className="w-4 h-4" />}
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
                            <span className="inline-flex px-2 py-0.5 rounded-md text-[11px] font-bold bg-blue-50 text-blue-700 border border-blue-200">
                              {inst.planTier || 'School Plan'}
                            </span>
                          </td>

                          {/* 1. School Wing Toggle */}
                          <td className="py-3.5 px-3 text-center">
                            <button
                              type="button"
                              onClick={() => handleToggleWing(inst.id, 'school')}
                              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer inline-flex items-center gap-1.5 shadow-2xs ${
                                isSchoolOn
                                  ? 'bg-blue-600 text-white hover:bg-blue-700 ring-2 ring-blue-500/20'
                                  : 'bg-slate-100 text-slate-400 hover:bg-slate-200 hover:text-slate-600'
                              }`}
                              title={isSchoolOn ? 'School Wing Active (Click to disable)' : 'School Wing Disabled (Click to activate)'}
                            >
                              {isSchoolOn ? <Check className="w-3.5 h-3.5" /> : <X className="w-3.5 h-3.5" />}
                              <span>{isSchoolOn ? 'Active' : 'Disabled'}</span>
                            </button>
                            <span className="block text-[9px] text-slate-400 mt-0.5 font-medium">K-10 & Matric</span>
                          </td>

                          {/* 2. College Wing Toggle */}
                          <td className="py-3.5 px-3 text-center">
                            <button
                              type="button"
                              onClick={() => handleToggleWing(inst.id, 'college')}
                              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer inline-flex items-center gap-1.5 shadow-2xs ${
                                isCollegeOn
                                  ? 'bg-indigo-600 text-white hover:bg-indigo-700 ring-2 ring-indigo-500/20'
                                  : 'bg-slate-100 text-slate-400 hover:bg-slate-200 hover:text-slate-600'
                              }`}
                              title={isCollegeOn ? 'College Wing Active (Click to disable)' : 'College Wing Disabled (Click to activate)'}
                            >
                              {isCollegeOn ? <Check className="w-3.5 h-3.5" /> : <X className="w-3.5 h-3.5" />}
                              <span>{isCollegeOn ? 'Active' : 'Disabled'}</span>
                            </button>
                            <span className="block text-[9px] text-slate-400 mt-0.5 font-medium">11-12 & Inter</span>
                          </td>

                          {/* 3. University Wing Toggle */}
                          <td className="py-3.5 px-3 text-center">
                            <button
                              type="button"
                              onClick={() => handleToggleWing(inst.id, 'undergraduate')}
                              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer inline-flex items-center gap-1.5 shadow-2xs ${
                                isUniOn
                                  ? 'bg-purple-600 text-white hover:bg-purple-700 ring-2 ring-purple-500/20'
                                  : 'bg-slate-100 text-slate-400 hover:bg-slate-200 hover:text-slate-600'
                              }`}
                              title={isUniOn ? 'University Wing Active (Click to disable)' : 'University Wing Disabled (Click to activate)'}
                            >
                              {isUniOn ? <Check className="w-3.5 h-3.5" /> : <X className="w-3.5 h-3.5" />}
                              <span>{isUniOn ? 'Active' : 'Disabled'}</span>
                            </button>
                            <span className="block text-[9px] text-slate-400 mt-0.5 font-medium">BS & Semesters</span>
                          </td>

                          {/* Cascading Chain Impact Info */}
                          <td className="py-3.5 px-4">
                            <div className="space-y-1 text-[11px]">
                              <div className="flex items-center gap-1 text-slate-700">
                                <span className="font-semibold text-slate-900">Admin Portal:</span>
                                <span>{currentTiers.length > 1 ? 'Multi-Wing Top Switcher' : isUniOn ? 'BS Degree Hub' : isCollegeOn ? 'Inter College Suite' : 'School Classes'}</span>
                              </div>
                              <div className="flex items-center gap-1 text-slate-500 text-[10px]">
                                <span>Faculty: {isCollegeOn ? 'College Lecturers' : isUniOn ? 'Professors' : 'School Teachers'}</span>
                                <span>•</span>
                                <span>Students: {isSchoolOn && isCollegeOn ? 'K-12 Pipeline' : isUniOn ? 'BS Undergrads' : isCollegeOn ? 'Inter 11-12' : 'Grades 1-10'}</span>
                              </div>
                            </div>
                          </td>

                          {/* Actions */}
                          <td className="py-3.5 px-3 text-right">
                            <button
                              type="button"
                              onClick={() => handleOpenWingsModal(inst)}
                              className="px-2.5 py-1.5 bg-slate-100 hover:bg-blue-50 text-slate-700 hover:text-blue-700 rounded-lg text-xs font-semibold border border-slate-200 transition-colors cursor-pointer"
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
            <div className="p-3 bg-blue-50 border border-blue-200 rounded-xl text-xs text-blue-900">
              Select which educational wings are licensed for <strong>{wingsTargetInstitute.name}</strong>. Unselected wings will be disabled across the portal.
            </div>

            {/* Checkboxes for 3 wings */}
            <div className="space-y-2.5">
              <label className="block text-xs font-bold text-slate-700 uppercase">Licensed Wings & Modules</label>
              
              <div 
                onClick={() => handleToggleWingInForm('school')}
                className={`p-3 rounded-xl border flex items-center justify-between cursor-pointer transition-all ${
                  wingsForm.enabledTiers.includes('school')
                    ? 'bg-blue-50/70 border-blue-300 ring-1 ring-blue-500/20'
                    : 'bg-white border-slate-200 hover:bg-slate-50'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center font-bold">
                    <School className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-900">School Wing</h4>
                    <p className="text-[11px] text-slate-500">Playgroup, Nursery, Primary, Middle & Matric (SSC / O-Levels)</p>
                  </div>
                </div>
                <input 
                  type="checkbox" 
                  checked={wingsForm.enabledTiers.includes('school')} 
                  onChange={() => {}} 
                  className="w-4 h-4 rounded text-blue-600 pointer-events-none"
                />
              </div>

              <div 
                onClick={() => handleToggleWingInForm('college')}
                className={`p-3 rounded-xl border flex items-center justify-between cursor-pointer transition-all ${
                  wingsForm.enabledTiers.includes('college')
                    ? 'bg-indigo-50/70 border-indigo-300 ring-1 ring-indigo-500/20'
                    : 'bg-white border-slate-200 hover:bg-slate-50'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold">
                    <Building2 className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-900">College Wing</h4>
                    <p className="text-[11px] text-slate-500">Intermediate (HSSC), F.Sc Pre-Med/Eng, ICS, FA, I.Com & A-Levels</p>
                  </div>
                </div>
                <input 
                  type="checkbox" 
                  checked={wingsForm.enabledTiers.includes('college')} 
                  onChange={() => {}} 
                  className="w-4 h-4 rounded text-indigo-600 pointer-events-none"
                />
              </div>

              <div 
                onClick={() => handleToggleWingInForm('undergraduate')}
                className={`p-3 rounded-xl border flex items-center justify-between cursor-pointer transition-all ${
                  wingsForm.enabledTiers.includes('undergraduate')
                    ? 'bg-purple-50/70 border-purple-300 ring-1 ring-purple-500/20'
                    : 'bg-white border-slate-200 hover:bg-slate-50'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-purple-100 text-purple-700 flex items-center justify-center font-bold">
                    <GraduationCap className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-900">University Wing</h4>
                    <p className="text-[11px] text-slate-500">4-Year Undergraduate BS Degrees, Semesters, CGPA & Credit Hours</p>
                  </div>
                </div>
                <input 
                  type="checkbox" 
                  checked={wingsForm.enabledTiers.includes('undergraduate')} 
                  onChange={() => {}} 
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
                <option value="School Plan">School Plan (₨ 25,000 / mo)</option>
                <option value="College Plan">College Plan (₨ 35,000 / mo)</option>
                <option value="University Plan">University Plan (₨ 55,000 / mo)</option>
                <option value="Custom Hybrid Plan">Custom Hybrid Plan (₨ 75,000 / mo)</option>
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
                className="px-5 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-sm cursor-pointer"
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
