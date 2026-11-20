import React, { useState, useEffect, useMemo } from 'react'
import {
  Layers,
  Building2,
  Search,
  Filter,
  Check,
  X,
  ShieldCheck,
  ShieldAlert,
  AlertTriangle,
  RotateCcw,
  Download,
  Sparkles,
  Sliders,
  Users,
  Award,
  DollarSign,
  Clock,
  Calendar,
  BookOpen,
  Briefcase,
  Megaphone,
  BookMarked,
  Bus,
  Home,
  UserPlus,
  Package,
  FileBadge,
  LineChart,
  Lock,
  Unlock,
  ChevronRight,
  Info,
  CheckCircle2,
  ExternalLink,
  HelpCircle,
  Eye,
  Settings2
} from 'lucide-react'
import { useAppData } from '../../../context/AppDataContext'
import { useToast } from '../../../context/ToastContext'
import Modal from '../../../components/common/Modal'
import {
  AdminControlService,
  INSTITUTE_FEATURES_REGISTRY,
  ADMIN_PRIVILEGE_OVERRIDES_REGISTRY
} from '../../../services/adminControlService'

// Helper to map icon names to Lucide icons
const FEATURE_ICON_MAP = {
  Users: Users,
  DollarSign: DollarSign,
  Award: Award,
  Clock: Clock,
  Calendar: Calendar,
  BookOpen: BookOpen,
  Briefcase: Briefcase,
  Megaphone: Megaphone,
  BookMarked: BookMarked,
  Bus: Bus,
  Home: Home,
  UserPlus: UserPlus,
  Package: Package,
  FileBadge: FileBadge,
  LineChart: LineChart
}

export const InstituteFeatureControlView = ({ onRouteChange }) => {
  const { institutes = [], refreshData, auditLogs = [] } = useAppData()
  const { toast } = useToast()

  // Active Main Tab: 'matrix' (Feature Matrix) | 'overrides' (Admin Overrides) | 'audit' (Feature Audit Log)
  const [activeTab, setActiveTab] = useState('matrix')

  // Search & Filter state
  const [searchTerm, setSearchTerm] = useState('')
  const [tierFilter, setTierFilter] = useState('ALL') // ALL, School, Enterprise, Trial
  const [categoryFilter, setCategoryFilter] = useState('ALL') // ALL, Core Academic, Finance, Operations, etc.

  // Matrix State (instituteId -> { [moduleKey]: boolean })
  const [matrixData, setMatrixData] = useState([])
  const [loading, setLoading] = useState(true)

  // Granular Admin Overrides Modal State
  const [selectedInstituteForOverrides, setSelectedInstituteForOverrides] = useState(null)
  const [currentAdminOverrides, setCurrentAdminOverrides] = useState({})
  const [isOverrideModalOpen, setIsOverrideModalOpen] = useState(false)
  const [isSavingOverrides, setIsSavingOverrides] = useState(false)

  // Global Preset Modal
  const [isPresetModalOpen, setIsPresetModalOpen] = useState(false)
  const [presetTargetCampusId, setPresetTargetCampusId] = useState('ALL')
  const [selectedPresetType, setSelectedPresetType] = useState('SCHOOL_STANDARD')

  // Load Matrix from Service
  const loadMatrix = () => {
    setLoading(true)
    try {
      const data = AdminControlService.getInstitutesFeatureMatrix(institutes)
      setMatrixData([...data])
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadMatrix()
    const handleSync = () => loadMatrix()
    window.addEventListener('sms_modules_updated', handleSync)
    window.addEventListener('sms_institutes_updated', handleSync)
    window.addEventListener('storage', handleSync)
    return () => {
      window.removeEventListener('sms_modules_updated', handleSync)
      window.removeEventListener('sms_institutes_updated', handleSync)
      window.removeEventListener('storage', handleSync)
    }
  }, [institutes])

  // Filtered Institutes
  const filteredInstitutes = useMemo(() => {
    return (institutes || []).filter(inst => {
      const term = searchTerm.toLowerCase().trim()
      const matchesSearch = !term ||
        (inst.name && inst.name.toLowerCase().includes(term)) ||
        (inst.code && inst.code.toLowerCase().includes(term)) ||
        (inst.city && inst.city.toLowerCase().includes(term)) ||
        (inst.principal && inst.principal.toLowerCase().includes(term))

      let matchesTier = true
      const planStr = (inst.planTier || inst.planType || 'School Plan').toLowerCase()
      if (tierFilter === 'School') {
        matchesTier = planStr.includes('school') && !planStr.includes('enterprise') && !planStr.includes('network')
      } else if (tierFilter === 'Enterprise') {
        matchesTier = planStr.includes('enterprise') || planStr.includes('network')
      } else if (tierFilter === 'Trial') {
        matchesTier = planStr.includes('trial')
      }

      return matchesSearch && matchesTier
    })
  }, [institutes, searchTerm, tierFilter])

  // Filtered Feature Columns
  const visibleFeatures = useMemo(() => {
    if (categoryFilter === 'ALL') return INSTITUTE_FEATURES_REGISTRY
    return INSTITUTE_FEATURES_REGISTRY.filter(f => f.category === categoryFilter)
  }, [categoryFilter])

  // Helper to check if an institute has a feature enabled in current state
  const isFeatureActive = (instituteId, featureKey) => {
    const entry = matrixData.find(
      m => (m.instituteId === instituteId || m.institute_id === instituteId) &&
           (m.moduleKey === featureKey || m.module_key === featureKey)
    )
    if (entry !== undefined && entry.enabled !== undefined) {
      return Boolean(entry.enabled)
    }
    const def = INSTITUTE_FEATURES_REGISTRY.find(f => f.key === featureKey)
    return Boolean(def?.defaultInSchool)
  }

  // Toggle Single Feature
  const handleToggleFeature = (instituteId, featureKey) => {
    const currentState = isFeatureActive(instituteId, featureKey)
    const nextState = !currentState

    // Prevent disabling core SIS if it's the only one
    if (featureKey === 'students' && !nextState) {
      const ok = window.confirm(
        'Warning: Disabling Student Information System (SIS) will restrict core enrollment across this school portal. Do you wish to continue?'
      )
      if (!ok) return
    }

    try {
      AdminControlService.toggleInstituteFeature(instituteId, featureKey, nextState, 'Super Administrator')
      // Optimistic update in local state
      setMatrixData(prev => {
        const copy = [...prev]
        const idx = copy.findIndex(
          m => (m.instituteId === instituteId || m.institute_id === instituteId) &&
               (m.moduleKey === featureKey || m.module_key === featureKey)
        )
        if (idx >= 0) {
          copy[idx] = { ...copy[idx], enabled: nextState }
        } else {
          copy.push({
            instituteId,
            moduleKey: featureKey,
            enabled: nextState
          })
        }
        return copy
      })

      const feat = INSTITUTE_FEATURES_REGISTRY.find(f => f.key === featureKey)
      const inst = institutes.find(i => i.id === instituteId)
      toast.success(`${feat?.name || featureKey} is now ${nextState ? 'ENABLED' : 'DISABLED'} for "${inst?.name || instituteId}"!`)
    } catch (err) {
      toast.error('Failed to toggle feature. Please try again.')
    }
  }

  // Open Granular Overrides Modal
  const handleOpenOverrides = (inst) => {
    setSelectedInstituteForOverrides(inst)
    const { overrides } = AdminControlService.getInstituteAdminOverrides(inst.id)
    setCurrentAdminOverrides({ ...overrides })
    setIsOverrideModalOpen(true)
  }

  // Toggle Override in Modal
  const handleToggleOverride = (overrideKey) => {
    setCurrentAdminOverrides(prev => ({
      ...prev,
      [overrideKey]: !prev[overrideKey]
    }))
  }

  // Save Overrides
  const handleSaveOverrides = () => {
    if (!selectedInstituteForOverrides) return
    setIsSavingOverrides(true)
    try {
      AdminControlService.saveInstituteAdminOverrides(
        selectedInstituteForOverrides.id,
        currentAdminOverrides,
        'Super Administrator'
      )
      toast.success(`Administrative privilege overrides saved for "${selectedInstituteForOverrides.name}"!`)
      setIsOverrideModalOpen(false)
    } catch (err) {
      toast.error('Failed to save overrides.')
    } finally {
      setIsSavingOverrides(false)
    }
  }

  // Apply Preset to Single Institute or All
  const handleApplyPreset = () => {
    try {
      if (presetTargetCampusId === 'ALL') {
        institutes.forEach(inst => {
          AdminControlService.applyFeaturePreset(inst.id, selectedPresetType, 'Super Administrator')
        })
        toast.success(`Preset "${selectedPresetType}" applied across all ${institutes.length} registered campuses!`)
      } else {
        AdminControlService.applyFeaturePreset(presetTargetCampusId, selectedPresetType, 'Super Administrator')
        const inst = institutes.find(i => i.id === presetTargetCampusId)
        toast.success(`Preset "${selectedPresetType}" applied to "${inst?.name || presetTargetCampusId}"!`)
      }
      loadMatrix()
      setIsPresetModalOpen(false)
    } catch (err) {
      toast.error('Failed to apply preset.')
    }
  }

  // Export Matrix to CSV
  const handleExportCSV = () => {
    const headers = ['Campus Name', 'Campus Code', 'City', 'Plan Tier', ...INSTITUTE_FEATURES_REGISTRY.map(f => f.name)]
    const rows = filteredInstitutes.map(inst => {
      const featStatuses = INSTITUTE_FEATURES_REGISTRY.map(f => isFeatureActive(inst.id, f.key) ? 'ENABLED' : 'DISABLED')
      return [
        `"${inst.name || ''}"`,
        `"${inst.code || ''}"`,
        `"${inst.city || ''}"`,
        `"${inst.planTier || 'School Plan'}"`,
        ...featStatuses
      ].join(',')
    })

    const csvContent = [headers.join(','), ...rows].join('\n')
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `Institute_Feature_Matrix_${new Date().toISOString().slice(0, 10)}.csv`
    link.click()
    URL.revokeObjectURL(url)
    toast.success('Feature matrix exported to CSV successfully!')
  }

  // Metric Computations
  const totalCampuses = institutes.length
  const totalFeaturesCount = INSTITUTE_FEATURES_REGISTRY.length
  const totalPossibleSwitches = totalCampuses * totalFeaturesCount
  const activeSwitchesCount = useMemo(() => {
    let count = 0
    institutes.forEach(i => {
      INSTITUTE_FEATURES_REGISTRY.forEach(f => {
        if (isFeatureActive(i.id, f.key)) count++
      })
    })
    return count
  }, [institutes, matrixData])

  const elevatedAdminsCount = useMemo(() => {
    let count = 0
    institutes.forEach(i => {
      const { elevatedCount } = AdminControlService.getInstituteAdminOverrides(i.id)
      if (elevatedCount > 0) count++
    })
    return count
  }, [institutes])

  return (
    <div className="p-4 sm:p-6 md:p-8 lg:p-8 pb-16 space-y-6 max-w-[1520px] mx-auto text-slate-800 dark:text-slate-100 transition-colors duration-200">
      {/* 1. TOP HEADER & BREADCRUMBS */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-5">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1">
            <span className="cursor-pointer hover:text-purple-600 dark:hover:text-purple-400" onClick={() => onRouteChange?.('dashboard')}>
              Platform Console
            </span>
            <ChevronRight className="w-3.5 h-3.5" />
            <span>Campuses &amp; Tenancy</span>
            <ChevronRight className="w-3.5 h-3.5" />
            <span className="text-purple-600 dark:text-purple-400 font-bold">Institute Feature Control</span>
          </div>
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-purple-600 to-indigo-600 text-white flex items-center justify-center shadow-lg shadow-purple-500/25">
              <Sliders className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight font-heading">
                Institute Feature Control &amp; Access Matrix
              </h1>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Centralized module matrix gating and elevated administrator permission overrides across all institutional campuses.
              </p>
            </div>
          </div>
        </div>

        {/* Global Action Buttons */}
        <div className="flex flex-wrap items-center gap-2.5">
          <button
            type="button"
            onClick={() => {
              setPresetTargetCampusId('ALL')
              setIsPresetModalOpen(true)
            }}
            className="px-3.5 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold shadow-md shadow-purple-600/20 transition-all flex items-center gap-2 cursor-pointer"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Apply Global Presets</span>
          </button>

          <button
            type="button"
            onClick={handleExportCSV}
            className="px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-bold border border-slate-200 dark:border-slate-700 transition-all flex items-center gap-1.5 cursor-pointer"
            title="Download complete matrix as CSV"
          >
            <Download className="w-3.5 h-3.5 text-slate-500" />
            <span>Export Matrix</span>
          </button>

          <button
            type="button"
            onClick={() => {
              loadMatrix()
              refreshData?.()
              toast.info('Feature matrix synchronized with latest campus telemetry.')
            }}
            className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700 transition-all cursor-pointer"
            title="Refresh Matrix"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* 2. STAT SUMMARY CARDS */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3.5">
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Campuses Governed</span>
            <div className="w-7 h-7 rounded-lg bg-purple-50 dark:bg-purple-950/50 text-purple-600 dark:text-purple-400 flex items-center justify-center">
              <Building2 className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-black text-slate-900 dark:text-white font-heading">{totalCampuses}</span>
            <span className="text-[10px] text-slate-400">campuses</span>
          </div>
          <p className="text-[11px] text-slate-400 mt-1">Multi-tenant school entities</p>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Active Modules</span>
            <div className="w-7 h-7 rounded-lg bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-black text-slate-900 dark:text-white font-heading">{activeSwitchesCount}</span>
            <span className="text-[10px] text-slate-400">/ {totalPossibleSwitches} live</span>
          </div>
          <p className="text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold mt-1">
            {totalPossibleSwitches > 0 ? Math.round((activeSwitchesCount / totalPossibleSwitches) * 100) : 100}% feature adoption
          </p>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Elevated Admins</span>
            <div className="w-7 h-7 rounded-lg bg-amber-50 dark:bg-amber-950/50 text-amber-600 dark:text-amber-400 flex items-center justify-center">
              <ShieldCheck className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-black text-slate-900 dark:text-white font-heading">{elevatedAdminsCount}</span>
            <span className="text-[10px] text-slate-400">campuses</span>
          </div>
          <p className="text-[11px] text-amber-600 dark:text-amber-400 font-semibold mt-1">
            Custom privilege overrides active
          </p>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Locked Modules</span>
            <div className="w-7 h-7 rounded-lg bg-rose-50 dark:bg-rose-950/50 text-rose-600 dark:text-rose-400 flex items-center justify-center">
              <Lock className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-black text-slate-900 dark:text-white font-heading">
              {Math.max(0, totalPossibleSwitches - activeSwitchesCount)}
            </span>
            <span className="text-[10px] text-slate-400">restricted</span>
          </div>
          <p className="text-[11px] text-slate-400 mt-1">Enforcing SaaS tier boundaries</p>
        </div>
      </div>

      {/* 3. PRIMARY NAVIGATION TABS */}
      <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setActiveTab('matrix')}
            className={`px-4 py-3 text-xs sm:text-sm font-bold border-b-2 transition-all flex items-center gap-2 cursor-pointer ${
              activeTab === 'matrix'
                ? 'border-purple-600 text-purple-600 dark:text-purple-400'
                : 'border-transparent text-slate-500 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Layers className="w-4 h-4" />
            <span>Campus Feature Matrix</span>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-purple-100 dark:bg-purple-900/50 text-purple-700 dark:text-purple-300">
              {filteredInstitutes.length}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('overrides')}
            className={`px-4 py-3 text-xs sm:text-sm font-bold border-b-2 transition-all flex items-center gap-2 cursor-pointer ${
              activeTab === 'overrides'
                ? 'border-purple-600 text-purple-600 dark:text-purple-400'
                : 'border-transparent text-slate-500 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <ShieldCheck className="w-4 h-4" />
            <span>Institute Admin Privileges</span>
            {elevatedAdminsCount > 0 && (
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 dark:bg-amber-900/50 text-amber-700 dark:text-amber-300">
                {elevatedAdminsCount} Elevated
              </span>
            )}
          </button>
        </div>

        <div className="hidden sm:flex items-center gap-1.5 text-xs text-slate-400">
          <Info className="w-3.5 h-3.5 text-purple-500" />
          <span>Real-time persistence enabled across tenant portals</span>
        </div>
      </div>

      {/* ------------------------------------------------------------- */}
      {/* TAB 1: CAMPUS FEATURE MATRIX */}
      {/* ------------------------------------------------------------- */}
      {activeTab === 'matrix' && (
        <div className="space-y-4">
          {/* Filter & Search Bar */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-3">
            <div className="flex-1 max-w-md relative">
              <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Search campus by name, code, or city..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-4 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-purple-500"
              />
              {searchTerm && (
                <button
                  type="button"
                  onClick={() => setSearchTerm('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            <div className="flex flex-wrap items-center gap-2">
              {/* Plan Tier Filter */}
              <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl text-xs font-semibold">
                {['ALL', 'School', 'Enterprise', 'Trial'].map(tier => (
                  <button
                    key={tier}
                    type="button"
                    onClick={() => setTierFilter(tier)}
                    className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer ${
                      tierFilter === tier
                        ? 'bg-white dark:bg-slate-900 text-purple-600 dark:text-purple-400 shadow-2xs font-bold'
                        : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                    }`}
                  >
                    {tier === 'ALL' ? 'All Plans' : tier}
                  </button>
                ))}
              </div>

              {/* Category Filter */}
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="px-3 py-1.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-200 focus:outline-none"
              >
                <option value="ALL">All Categories ({INSTITUTE_FEATURES_REGISTRY.length})</option>
                <option value="Core Academic">Core Academic</option>
                <option value="Finance">Finance</option>
                <option value="Operations">Operations</option>
                <option value="Messaging">Messaging</option>
                <option value="Logistics">Logistics</option>
                <option value="Resources">Resources</option>
                <option value="Intake">Intake</option>
              </select>
            </div>
          </div>

          {/* Matrix Table */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xs overflow-hidden">
            <div className="overflow-x-auto dark-scroll">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-50 dark:bg-slate-950/80 border-b border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider text-[10px]">
                    {/* Fixed Campus Column */}
                    <th className="py-3 px-4 min-w-[240px] sticky left-0 z-20 bg-slate-50 dark:bg-slate-950 shadow-sm">
                      Campus &amp; Plan Tier
                    </th>
                    {/* Feature Headers */}
                    {visibleFeatures.map(f => {
                      const Icon = FEATURE_ICON_MAP[f.icon] || Layers
                      return (
                        <th key={f.key} className="py-3 px-3 min-w-[125px] text-center border-l border-slate-100 dark:border-slate-800/60" title={f.description}>
                          <div className="flex flex-col items-center gap-1">
                            <Icon className="w-4 h-4 text-purple-500" />
                            <span className="whitespace-nowrap font-bold text-slate-700 dark:text-slate-200">
                              {f.name}
                            </span>
                            <span className="text-[9px] font-normal text-slate-400 capitalize">
                              {f.category}
                            </span>
                          </div>
                        </th>
                      )
                    })}
                    {/* Actions Column */}
                    <th className="py-3 px-4 min-w-[140px] text-right">
                      Actions
                    </th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 font-medium">
                  {filteredInstitutes.length === 0 ? (
                    <tr>
                      <td colSpan={visibleFeatures.length + 2} className="py-12 text-center text-slate-400">
                        <Building2 className="w-8 h-8 mx-auto mb-2 opacity-40 text-purple-400" />
                        <p className="font-bold">No campuses match your filter criteria.</p>
                        <p className="text-xs mt-1">Try resetting the search bar or plan filters.</p>
                      </td>
                    </tr>
                  ) : (
                    filteredInstitutes.map((inst) => {
                      const planTier = inst.planTier || inst.planType || 'School Plan'
                      const isTrial = planTier.toLowerCase().includes('trial')
                      const isEnterprise = planTier.toLowerCase().includes('enterprise') || planTier.toLowerCase().includes('network')
                      const { elevatedCount } = AdminControlService.getInstituteAdminOverrides(inst.id)

                      return (
                        <tr key={inst.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors group">
                          {/* Campus Info Sticky */}
                          <td className="py-3 px-4 sticky left-0 z-10 bg-white dark:bg-slate-900 group-hover:bg-slate-50/80 dark:group-hover:bg-slate-800/40 border-r border-slate-200 dark:border-slate-800 shadow-xs">
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 rounded-xl bg-purple-500/10 text-purple-600 dark:text-purple-400 flex items-center justify-center font-bold text-xs shrink-0">
                                {inst.code?.slice(0, 3) || 'SCH'}
                              </div>
                              <div className="min-w-0">
                                <div className="font-bold text-slate-900 dark:text-white truncate" title={inst.name}>
                                  {inst.name}
                                </div>
                                <div className="flex items-center gap-1.5 mt-0.5">
                                  <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold uppercase ${
                                    isEnterprise
                                      ? 'bg-purple-100 dark:bg-purple-950 text-purple-700 dark:text-purple-300'
                                      : isTrial
                                        ? 'bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-300'
                                        : 'bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300'
                                  }`}>
                                    {planTier}
                                  </span>
                                  <span className="text-[10px] text-slate-400 truncate">
                                    {inst.city || 'Punjab'}
                                  </span>
                                </div>
                              </div>
                            </div>
                          </td>

                          {/* Feature Cells with Instant Toggle */}
                          {visibleFeatures.map((feat) => {
                            const isEnabled = isFeatureActive(inst.id, feat.key)
                            return (
                              <td key={feat.key} className="py-3 px-3 text-center border-l border-slate-100 dark:border-slate-800/40">
                                <div className="flex flex-col items-center justify-center gap-1">
                                  <button
                                    type="button"
                                    onClick={() => handleToggleFeature(inst.id, feat.key)}
                                    title={`${isEnabled ? 'Disable' : 'Enable'} ${feat.name} for ${inst.name}`}
                                    className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                                      isEnabled
                                        ? 'bg-emerald-500'
                                        : 'bg-slate-200 dark:bg-slate-700'
                                    }`}
                                  >
                                    <span
                                      className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow-md ring-0 transition duration-200 ease-in-out ${
                                        isEnabled ? 'translate-x-4' : 'translate-x-0'
                                      }`}
                                    />
                                  </button>
                                  <span className={`text-[9px] font-bold tracking-tight ${
                                    isEnabled
                                      ? 'text-emerald-600 dark:text-emerald-400'
                                      : 'text-slate-400'
                                  }`}>
                                    {isEnabled ? 'Active' : 'Locked'}
                                  </span>
                                </div>
                              </td>
                            )
                          })}

                          {/* Row Actions */}
                          <td className="py-3 px-4 text-right whitespace-nowrap">
                            <div className="flex items-center justify-end gap-1.5">
                              <button
                                type="button"
                                onClick={() => handleOpenOverrides(inst)}
                                className={`px-2.5 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1 cursor-pointer ${
                                  elevatedCount > 0
                                    ? 'bg-amber-50 hover:bg-amber-100 dark:bg-amber-950/40 dark:hover:bg-amber-900/40 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800'
                                    : 'bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200'
                                }`}
                                title="Configure Granular Administrator Overrides"
                              >
                                <ShieldCheck className="w-3.5 h-3.5 text-amber-600" />
                                <span>{elevatedCount > 0 ? `${elevatedCount} Overrides` : 'Admin Access'}</span>
                              </button>
                            </div>
                          </td>
                        </tr>
                      )
                    })
                  )}
                </tbody>
              </table>
            </div>

            {/* Matrix Footer Legend */}
            <div className="bg-slate-50 dark:bg-slate-950/60 p-3.5 border-t border-slate-200 dark:border-slate-800 flex flex-wrap items-center justify-between gap-3 text-xs text-slate-500">
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
                  <span className="font-semibold text-slate-700 dark:text-slate-300">Feature Active:</span>
                  <span>Accessible to institute administrators &amp; students</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-slate-300 dark:bg-slate-700"></span>
                  <span className="font-semibold text-slate-700 dark:text-slate-300">Feature Locked:</span>
                  <span>Hidden and restricted on tenant portal</span>
                </div>
              </div>

              <div className="text-[11px] text-slate-400">
                Showing {filteredInstitutes.length} of {institutes.length} campuses
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* TAB 2: INSTITUTE ADMIN PRIVILEGES & OVERRIDES */}
      {/* ------------------------------------------------------------- */}
      {activeTab === 'overrides' && (
        <div className="space-y-4">
          <div className="bg-gradient-to-r from-purple-50 via-indigo-50 to-blue-50 dark:from-purple-950/30 dark:via-indigo-950/20 dark:to-blue-950/30 border border-purple-200/80 dark:border-purple-800/40 rounded-2xl p-4 sm:p-5 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div className="flex items-start gap-3.5">
              <div className="w-10 h-10 rounded-2xl bg-purple-600 text-white flex items-center justify-center shrink-0 shadow-md shadow-purple-600/30">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                  Granular Institute Administrator Authority Overrides
                </h3>
                <p className="text-xs text-slate-600 dark:text-slate-300 mt-0.5 leading-relaxed">
                  Super Admin has exclusive power to delegate high-trust operational privileges to individual school principals
                  (e.g., fee discount authority, record deletion, capacity override, PII export, emergency circulars) beyond the default campus subscription tier.
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => {
                if (institutes[0]) handleOpenOverrides(institutes[0])
              }}
              className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold transition-all shadow-sm shrink-0 cursor-pointer"
            >
              Configure First Campus
            </button>
          </div>

          {/* Roster of School Administrators */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {institutes.map(inst => {
              const { elevatedCount } = AdminControlService.getInstituteAdminOverrides(inst.id)
              const planTier = inst.planTier || 'School Plan'
              const isElevated = elevatedCount > 0

              return (
                <div
                  key={inst.id}
                  className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-xs hover:border-purple-300 dark:hover:border-purple-700 transition-all flex flex-col justify-between"
                >
                  <div className="space-y-3">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-2.5">
                        <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-purple-500 to-indigo-500 text-white font-black text-xs flex items-center justify-center shadow-xs">
                          {inst.name.slice(0, 2).toUpperCase()}
                        </div>
                        <div>
                          <h4 className="text-xs font-bold text-slate-900 dark:text-white leading-tight">
                            {inst.name}
                          </h4>
                          <span className="text-[10px] text-slate-400">Code: {inst.code}</span>
                        </div>
                      </div>

                      <span className={`px-2 py-0.5 rounded-full text-[9px] font-extrabold uppercase ${
                        isElevated
                          ? 'bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-200 border border-amber-300 dark:border-amber-800'
                          : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                      }`}>
                        {isElevated ? `${elevatedCount} Overrides` : 'Standard Tier'}
                      </span>
                    </div>

                    <div className="text-xs text-slate-600 dark:text-slate-300 space-y-1 bg-slate-50 dark:bg-slate-950 p-2.5 rounded-xl border border-slate-100 dark:border-slate-800">
                      <div className="flex justify-between">
                        <span className="text-slate-400 text-[11px]">Campus Admin:</span>
                        <span className="font-semibold">{inst.principal || 'Campus Principal'}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400 text-[11px]">Email:</span>
                        <span className="font-mono text-[10px]">{inst.email || 'admin@sms.edu'}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400 text-[11px]">SaaS Package:</span>
                        <span className="font-semibold text-purple-600 dark:text-purple-400">{planTier}</span>
                      </div>
                    </div>

                    <div className="space-y-1">
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                        Active Privileges Summary:
                      </span>
                      <div className="flex flex-wrap gap-1">
                        {isElevated ? (
                          <span className="text-[10px] font-semibold text-amber-700 dark:text-amber-300 bg-amber-50 dark:bg-amber-950/40 px-2 py-0.5 rounded">
                            ✨ Elevated administrative authority active
                          </span>
                        ) : (
                          <span className="text-[10px] text-slate-400 italic">
                            Strict standard subscription tier boundaries applied
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="pt-4 mt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                    <span className="text-[10px] text-slate-400">
                      ID: {inst.id}
                    </span>
                    <button
                      type="button"
                      onClick={() => handleOpenOverrides(inst)}
                      className="px-3 py-1.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold transition-all shadow-xs flex items-center gap-1.5 cursor-pointer"
                    >
                      <Settings2 className="w-3.5 h-3.5" />
                      <span>Manage Overrides</span>
                    </button>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* MODAL 1: GRANULAR ADMINISTRATOR OVERRIDES MODAL */}
      {/* ------------------------------------------------------------- */}
      {isOverrideModalOpen && selectedInstituteForOverrides && (
        <Modal
          isOpen={isOverrideModalOpen}
          onClose={() => setIsOverrideModalOpen(false)}
          title={`Administrative Privilege Overrides • ${selectedInstituteForOverrides.name}`}
          maxWidth="max-w-3xl"
        >
          <div className="space-y-5 text-xs">
            {/* Campus Header Info */}
            <div className="p-3.5 bg-purple-50 dark:bg-purple-950/40 border border-purple-200 dark:border-purple-800 rounded-2xl flex items-center justify-between">
              <div>
                <span className="text-[10px] font-bold text-purple-600 dark:text-purple-400 uppercase tracking-wider">
                  Target Campus
                </span>
                <h4 className="text-sm font-bold text-purple-950 dark:text-purple-100 mt-0.5">
                  {selectedInstituteForOverrides.name} ({selectedInstituteForOverrides.code})
                </h4>
                <p className="text-[11px] text-purple-800 dark:text-purple-300 mt-0.5">
                  Assigned Principal / Admin: <strong>{selectedInstituteForOverrides.principal || 'Institute Administrator'}</strong>
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    const allTrue = {}
                    ADMIN_PRIVILEGE_OVERRIDES_REGISTRY.forEach(o => { allTrue[o.key] = true })
                    setCurrentAdminOverrides(allTrue)
                  }}
                  className="px-2.5 py-1 rounded-lg bg-white dark:bg-slate-800 border border-purple-300 text-purple-700 dark:text-purple-300 font-bold text-[11px] cursor-pointer"
                >
                  Grant All
                </button>
                <button
                  type="button"
                  onClick={() => {
                    const allFalse = {}
                    ADMIN_PRIVILEGE_OVERRIDES_REGISTRY.forEach(o => { allFalse[o.key] = false })
                    setCurrentAdminOverrides(allFalse)
                  }}
                  className="px-2.5 py-1 rounded-lg bg-white dark:bg-slate-800 border border-slate-300 text-slate-700 dark:text-slate-300 font-bold text-[11px] cursor-pointer"
                >
                  Reset to Default
                </button>
              </div>
            </div>

            {/* List of 10 Override Cards */}
            <div className="space-y-2.5 max-h-[55vh] overflow-y-auto dark-scroll pr-1">
              {ADMIN_PRIVILEGE_OVERRIDES_REGISTRY.map(override => {
                const isChecked = Boolean(currentAdminOverrides[override.key])
                return (
                  <div
                    key={override.key}
                    onClick={() => handleToggleOverride(override.key)}
                    className={`p-3.5 rounded-xl border transition-all cursor-pointer flex items-start justify-between gap-3 ${
                      isChecked
                        ? 'bg-purple-50/60 dark:bg-purple-950/20 border-purple-300 dark:border-purple-800'
                        : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:bg-slate-50'
                    }`}
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-slate-900 dark:text-white text-xs">
                          {override.name}
                        </span>
                        <span className={`px-1.5 py-0.2 rounded text-[9px] font-extrabold uppercase ${
                          override.risk === 'High'
                            ? 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-200'
                            : override.risk === 'Medium'
                              ? 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-200'
                              : 'bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-200'
                        }`}>
                          {override.risk} Risk
                        </span>
                        <span className="text-[10px] text-slate-400 capitalize">
                          • {override.category}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">
                        {override.description}
                      </p>
                    </div>

                    <div className="shrink-0 mt-0.5">
                      <button
                        type="button"
                        className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                          isChecked ? 'bg-purple-600' : 'bg-slate-200 dark:bg-slate-700'
                        }`}
                      >
                        <span
                          className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow-md ring-0 transition duration-200 ease-in-out ${
                            isChecked ? 'translate-x-4' : 'translate-x-0'
                          }`}
                        />
                      </button>
                    </div>
                  </div>
                )
              })}
            </div>

            {/* Modal Footer Controls */}
            <div className="flex items-center justify-between pt-4 border-t border-slate-200 dark:border-slate-800">
              <span className="text-slate-500 text-[11px]">
                {Object.values(currentAdminOverrides).filter(Boolean).length} of {ADMIN_PRIVILEGE_OVERRIDES_REGISTRY.length} elevated privileges selected
              </span>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setIsOverrideModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-bold"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  disabled={isSavingOverrides}
                  onClick={handleSaveOverrides}
                  className="px-5 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold shadow-md shadow-purple-600/20 disabled:opacity-50 flex items-center gap-1.5 cursor-pointer"
                >
                  <Check className="w-3.5 h-3.5" />
                  <span>{isSavingOverrides ? 'Saving...' : 'Save Privileges'}</span>
                </button>
              </div>
            </div>
          </div>
        </Modal>
      )}

      {/* ------------------------------------------------------------- */}
      {/* MODAL 2: APPLY PRESETS MODAL */}
      {/* ------------------------------------------------------------- */}
      {isPresetModalOpen && (
        <Modal
          isOpen={isPresetModalOpen}
          onClose={() => setIsPresetModalOpen(false)}
          title="Apply Global Feature Matrix Preset"
          maxWidth="max-w-md"
        >
          <div className="space-y-4 text-xs">
            <p className="text-slate-500 dark:text-slate-400">
              Bulk configure module matrix settings by applying standard institutional operational profiles.
            </p>

            <div className="space-y-1.5">
              <label className="font-bold text-slate-700 dark:text-slate-300">Target Campus Scope</label>
              <select
                value={presetTargetCampusId}
                onChange={(e) => setPresetTargetCampusId(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white font-semibold focus:outline-none"
              >
                <option value="ALL">All Registered Campuses ({institutes.length} Schools)</option>
                {institutes.map(i => (
                  <option key={i.id} value={i.id}>{i.name} ({i.code})</option>
                ))}
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="font-bold text-slate-700 dark:text-slate-300">Preset Configuration Profile</label>
              <div className="space-y-2">
                {[
                  { id: 'SCHOOL_STANDARD', title: 'School Standard (Primary & Matric)', desc: 'Enables Core SIS, Fees, Exams, Attendance, Timetable, Curriculum, Notices & Certificates.' },
                  { id: 'ENTERPRISE_FULL', title: 'Enterprise Network Full Suite', desc: 'Enables all 15 modules including Transport, Hostels, Library, Assets, and HR Payroll.' },
                  { id: 'TRIAL_MINIMAL', title: '14-Day Trial Minimalist Core', desc: 'Enables only Core SIS, Challans, Exams, and Attendance. Locks advanced logistics.' },
                  { id: 'FINANCIAL_LOCKED', title: 'Academic Only (Lock Finance & Fees)', desc: 'Locks Fee Collection and Accounts modules during central financial audits.' },
                  { id: 'ALL_ENABLED', title: 'Full Access (Enable All 15 Modules)', desc: 'Enables every single platform module without restrictions.' }
                ].map(p => (
                  <div
                    key={p.id}
                    onClick={() => setSelectedPresetType(p.id)}
                    className={`p-3 rounded-xl border transition-all cursor-pointer ${
                      selectedPresetType === p.id
                        ? 'bg-purple-50 dark:bg-purple-950/40 border-purple-500 text-purple-900 dark:text-purple-100 font-bold'
                        : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:bg-slate-50'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs">{p.title}</span>
                      {selectedPresetType === p.id && <Check className="w-4 h-4 text-purple-600" />}
                    </div>
                    <p className="text-[10px] text-slate-400 font-normal mt-0.5">{p.desc}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-200 dark:border-slate-800">
              <button
                type="button"
                onClick={() => setIsPresetModalOpen(false)}
                className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-200 font-bold"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleApplyPreset}
                className="px-5 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold shadow-md shadow-purple-600/20 cursor-pointer"
              >
                Apply Preset Now
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  )
}

export default InstituteFeatureControlView
