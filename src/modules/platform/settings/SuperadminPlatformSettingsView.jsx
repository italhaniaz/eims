import React, { useState, useEffect, useMemo } from 'react'
import { 
  Settings, 
  ShieldCheck, 
  AlertTriangle, 
  Save, 
  Server, 
  Clock, 
  RotateCcw,
  CheckCircle,
  CheckCircle2,
  HardDrive,
  Eye,
  School,
  Building2,
  MapPin,
  User,
  Mail,
  Search,
  Database,
  Shield,
  Layers
} from 'lucide-react'
import { useToast } from '../../../context/ToastContext'
import { useAppData } from '../../../context/AppDataContext'
import { OperationsService } from '../../../services/operationsService'
import { SchoolInquiryService } from '../../../services/schoolInquiryService'
import ReleaseUpdatesModal from './ReleaseUpdatesModal'

const PLATFORM_UI_SETTINGS_KEY = 'sms_platform_ui_settings'

const DEFAULT_GENERAL_SETTINGS = {
  platformName: 'EIMS Enterprise Educational Network',
  defaultLanguage: 'English (US & PK)',
  currency: 'PKR - Pakistani Rupee (Rs.)',
  timezone: 'Asia/Karachi (GMT+5)',
  academicYearFormat: 'YYYY-YYYY (August - June)',
  supportEmail: 'admin@eims-edu.pk'
}

const DEFAULT_RETENTION_POLICY = {
  auditLogsDays: 90,
  loginHistoryDays: 180,
  backupSnapshotsDays: 365,
  archivedInstitutesDays: 730,
  autoPurgeEnabled: true
}

const readPlatformUiSettings = () => {
  try {
    const raw = localStorage.getItem(PLATFORM_UI_SETTINGS_KEY)
    return raw ? JSON.parse(raw) : {}
  } catch {
    return {}
  }
}

const writePlatformUiSettings = (partial) => {
  const next = { ...readPlatformUiSettings(), ...partial, updatedAt: new Date().toISOString() }
  localStorage.setItem(PLATFORM_UI_SETTINGS_KEY, JSON.stringify(next))
  return next
}

export const SuperadminPlatformSettingsView = ({ activeTab = 'general', onTabChange = () => {} }) => {
  const { toast } = useToast()
  const { institutes = [] } = useAppData() || {}
  const [inquiries, setInquiries] = useState([])
  const [schoolSearchQuery, setSchoolSearchQuery] = useState('')
  const [schoolTabFilter, setSchoolTabFilter] = useState('ALL') // 'ALL' | 'ACTIVE' | 'INQUIRIES'
  const [showReleaseModal, setShowReleaseModal] = useState(false)

  // Fetch inquiries for registration audit cards
  useEffect(() => {
    let isMounted = true
    SchoolInquiryService.getInquiries('ALL').then(list => {
      if (isMounted && Array.isArray(list)) setInquiries(list)
    }).catch(() => {})
    return () => { isMounted = false }
  }, [])

  const pendingInquiries = useMemo(() => {
    return (inquiries || []).filter(i => (i.status || '').toUpperCase() === 'PENDING')
  }, [inquiries])

  const filteredSchoolList = useMemo(() => {
    const q = (schoolSearchQuery || '').toLowerCase().trim()
    return (institutes || []).filter(inst => {
      if (schoolTabFilter === 'ACTIVE' && (inst.status || 'Active').toLowerCase() !== 'active') return false
      if (!q) return true
      return (
        (inst.name || '').toLowerCase().includes(q) ||
        (inst.code || '').toLowerCase().includes(q) ||
        (inst.city || '').toLowerCase().includes(q) ||
        (inst.principal || '').toLowerCase().includes(q) ||
        (inst.planTier || '').toLowerCase().includes(q)
      )
    })
  }, [institutes, schoolSearchQuery, schoolTabFilter])

  const filteredInquiriesList = useMemo(() => {
    const q = (schoolSearchQuery || '').toLowerCase().trim()
    return (inquiries || []).filter(inq => {
      if (!q) return true
      return (
        (inq.schoolName || '').toLowerCase().includes(q) ||
        (inq.schoolCodePrefix || '').toLowerCase().includes(q) ||
        (inq.city || '').toLowerCase().includes(q) ||
        (inq.contactPerson || '').toLowerCase().includes(q) ||
        (inq.planTier || '').toLowerCase().includes(q)
      )
    })
  }, [inquiries, schoolSearchQuery])

  const validTabs = ['general', 'compliance', 'maintenance']
  const [currentTab, setCurrentTab] = useState(() => {
    return validTabs.includes(activeTab) ? activeTab : 'general'
  })

  useEffect(() => {
    if (activeTab && validTabs.includes(activeTab)) {
      setCurrentTab(activeTab)
    }
  }, [activeTab])

  const effectiveTab = validTabs.includes(currentTab) ? currentTab : 'general'

  const handleTabSwitch = (tabKey) => {
    setCurrentTab(tabKey)
    onTabChange(tabKey)
  }

  // 1. General settings state
  const [generalForm, setGeneralForm] = useState(() => ({
    ...DEFAULT_GENERAL_SETTINGS,
    ...(readPlatformUiSettings().general || {})
  }))

  // School Inquiries Setting (ON = approval required, OFF = direct registration)
  const [schoolInquiryEnabled, setSchoolInquiryEnabled] = useState(() => {
    return SchoolInquiryService.isSchoolInquiryEnabled()
  })

  const handleToggleSchoolInquiry = async () => {
    const nextState = !schoolInquiryEnabled
    setSchoolInquiryEnabled(nextState)
    await SchoolInquiryService.setSchoolInquirySetting(nextState)
    if (nextState) {
      toast?.success?.('School Inquiry Gate is now ON: Registrations require Super Admin review and approval before campus provisioning.')
    } else {
      toast?.info?.('School Inquiry Gate is now OFF: Schools register directly with instant tenant provisioning.')
    }
  }

  const handleSaveGeneral = async (e) => {
    e.preventDefault()
    try {
      writePlatformUiSettings({ general: generalForm, maintenanceMode })
      await SchoolInquiryService.setSchoolInquirySetting(schoolInquiryEnabled)
      toast?.success?.('Platform settings saved on this device.')
    } catch (err) {
      toast?.error?.('Failed to save settings: ' + err.message)
    }
  }

  // 2. Compliance & Data Retention state
  const [retentionPolicy, setRetentionPolicy] = useState(DEFAULT_RETENTION_POLICY)
  const [isSavingRetention, setIsSavingRetention] = useState(false)

  useEffect(() => {
    let isMounted = true
    OperationsService.getRetentionPolicy().then(policy => {
      if (isMounted && policy) {
        setRetentionPolicy({ ...DEFAULT_RETENTION_POLICY, ...policy })
      }
    }).catch(() => {})
    return () => { isMounted = false }
  }, [])

  const handleSaveRetention = async (e) => {
    e.preventDefault()
    setIsSavingRetention(true)
    try {
      await OperationsService.saveRetentionPolicy(retentionPolicy)
      toast?.success?.('Platform data retention and compliance policies updated successfully.')
    } catch (err) {
      toast?.error?.('Failed to save retention policy: ' + (err?.message || 'Unknown error'))
    } finally {
      setIsSavingRetention(false)
    }
  }

  const handleResetRetention = async () => {
    setRetentionPolicy(DEFAULT_RETENTION_POLICY)
    await OperationsService.saveRetentionPolicy(DEFAULT_RETENTION_POLICY)
    toast?.info?.('Retention policies restored to standard institutional defaults.')
  }

  // 3. Maintenance mode state
  const [maintenanceMode, setMaintenanceMode] = useState(() => Boolean(readPlatformUiSettings().maintenanceMode))

  const tabsConfig = [
    { key: 'general', label: 'General', icon: Settings },
    { key: 'compliance', label: 'Compliance & Data Retention', icon: ShieldCheck },
    { key: 'maintenance', label: 'Maintenance Mode & Releases', icon: AlertTriangle }
  ]

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
              Global environment parameters, admission inquiry policy, compliance retention rules, and maintenance controls.
            </p>
          </div>
        </div>
      </div>

      {/* Navigation Tabs Bar */}
      <div className="bg-white rounded-2xl p-2 border border-slate-200/80 shadow-2xs overflow-x-auto scrollbar-none">
        <div className="flex items-center gap-1.5 min-w-max">
          {tabsConfig.map(tab => {
            const Icon = tab.icon
            const active = effectiveTab === tab.key
            return (
              <button
                key={tab.key}
                type="button"
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

          {/* Security & Server: School Registration & Inquiries Policy */}
          <div className="pt-6 border-t border-slate-100 space-y-5">
            {/* Header & Mode Badge */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center shrink-0">
                    <Server className="w-4 h-4" />
                  </div>
                  <h4 className="font-bold text-slate-900 text-sm sm:text-base">
                    Security &amp; Server: School Registration &amp; Inquiries Policy
                  </h4>
                </div>
                <p className="text-xs text-slate-500 mt-1">
                  Configure admission gating policy for public school registrations and monitor provisioned campus tenants.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border ${
                  schoolInquiryEnabled 
                    ? 'bg-emerald-50 text-emerald-700 border-emerald-200' 
                    : 'bg-amber-50 text-amber-700 border-amber-200'
                }`}>
                  <span className={`w-2 h-2 rounded-full ${schoolInquiryEnabled ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500'}`}></span>
                  <span>{schoolInquiryEnabled ? 'Inquiry Gate ON' : 'Direct Sign-up OFF'}</span>
                </span>
              </div>
            </div>

            {/* Card 1: Policy Toggle Control Card */}
            <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-purple-50/60 via-slate-50 to-indigo-50/40 border border-slate-200/90 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-2xs">
              <div className="space-y-1.5 max-w-2xl">
                <div className="flex items-center gap-2 font-bold text-slate-900 text-sm">
                  <ShieldCheck className="w-4 h-4 text-purple-600" />
                  <span>Super Admin School Inquiries Approval Requirement</span>
                </div>
                <div className="text-xs text-slate-600 leading-relaxed">
                  {schoolInquiryEnabled ? (
                    <span className="text-slate-700 font-medium">
                      <strong>ON (Approval Required):</strong> Public school registrations are saved as inquiries with <code className="bg-amber-100 text-amber-900 px-1 py-0.5 rounded text-[11px] font-bold">Pending</code> status in the inquiries queue. No active institute, database tenant, or administrator account is provisioned until Super Admin explicitly reviews and approves the application.
                    </span>
                  ) : (
                    <span className="text-slate-700 font-medium">
                      <strong>OFF (Direct Registration):</strong> Schools are provisioned directly using the existing institute creation workflow. The campus, active tenant, and initial administrator account are created immediately without saving an inquiry.
                    </span>
                  )}
                </div>
                <div className="text-[11px] text-slate-400">
                  Setting is persisted in the database and enforced on the backend across all registration channels.
                </div>
              </div>

              <div className="flex items-center gap-3.5 shrink-0 self-start md:self-auto">
                <button
                  type="button"
                  onClick={handleToggleSchoolInquiry}
                  className={`relative inline-flex h-7 w-14 shrink-0 cursor-pointer rounded-full p-0.5 transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-purple-600 focus:ring-offset-2 ${
                    schoolInquiryEnabled ? 'bg-purple-600' : 'bg-slate-300'
                  }`}
                  role="switch"
                  aria-checked={schoolInquiryEnabled}
                >
                  <span
                    aria-hidden="true"
                    className={`pointer-events-none inline-block h-6 w-6 transform rounded-full bg-white shadow-md ring-0 transition-transform duration-200 ease-in-out ${
                      schoolInquiryEnabled ? 'translate-x-7' : 'translate-x-0'
                    }`}
                  />
                </button>
                <span className={`text-xs font-extrabold select-none min-w-[32px] ${
                  schoolInquiryEnabled ? 'text-purple-700' : 'text-slate-500'
                }`}>
                  {schoolInquiryEnabled ? 'ON' : 'OFF'}
                </span>
              </div>
            </div>

            {/* Card 2: Security & Server Metrics Summary Row */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="p-3.5 rounded-xl bg-white border border-slate-200/80 shadow-2xs">
                <div className="flex items-center gap-2 text-slate-500 text-xs mb-1">
                  <School className="w-3.5 h-3.5 text-purple-600" />
                  <span className="font-semibold">Governed Schools</span>
                </div>
                <div className="font-extrabold text-base sm:text-lg text-slate-900 font-mono">
                  {institutes.length} <span className="text-xs font-normal text-slate-500">Campuses</span>
                </div>
              </div>

              <div className="p-3.5 rounded-xl bg-white border border-slate-200/80 shadow-2xs">
                <div className="flex items-center gap-2 text-slate-500 text-xs mb-1">
                  <Clock className="w-3.5 h-3.5 text-amber-500" />
                  <span className="font-semibold">Inquiries Queue</span>
                </div>
                <div className="font-extrabold text-base sm:text-lg text-slate-900 font-mono">
                  {pendingInquiries.length} <span className="text-xs font-normal text-slate-500">Pending</span>
                </div>
              </div>

              <div className="p-3.5 rounded-xl bg-white border border-slate-200/80 shadow-2xs">
                <div className="flex items-center gap-2 text-slate-500 text-xs mb-1">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                  <span className="font-semibold">Gate Policy</span>
                </div>
                <div className="font-extrabold text-xs sm:text-sm text-slate-900 truncate">
                  {schoolInquiryEnabled ? 'Approval Required' : 'Instant Sign-up'}
                </div>
              </div>

              <div className="p-3.5 rounded-xl bg-white border border-slate-200/80 shadow-2xs">
                <div className="flex items-center gap-2 text-slate-500 text-xs mb-1">
                  <Database className="w-3.5 h-3.5 text-indigo-600" />
                  <span className="font-semibold">Tenant Isolation</span>
                </div>
                <div className="font-extrabold text-xs sm:text-sm text-slate-900 truncate">
                  100% Isolated DB
                </div>
              </div>
            </div>

            {/* Card 3: School Data Cards Grid */}
            <div className="space-y-3 pt-2">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h5 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                    <Building2 className="w-4 h-4 text-purple-600" />
                    <span>Governed School Campuses (Server Tenant Data)</span>
                  </h5>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    Live school entities and server database tenant profiles managed under platform registration security.
                  </p>
                </div>

                {/* Sub-Tabs & Quick Filter */}
                <div className="flex items-center gap-2 flex-wrap">
                  <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl text-xs font-bold">
                    <button
                      type="button"
                      onClick={() => setSchoolTabFilter('ALL')}
                      className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer ${
                        schoolTabFilter === 'ALL'
                          ? 'bg-white text-purple-700 shadow-2xs'
                          : 'text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      All ({institutes.length})
                    </button>
                    <button
                      type="button"
                      onClick={() => setSchoolTabFilter('ACTIVE')}
                      className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer ${
                        schoolTabFilter === 'ACTIVE'
                          ? 'bg-white text-purple-700 shadow-2xs'
                          : 'text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      Active
                    </button>
                    {inquiries.length > 0 && (
                      <button
                        type="button"
                        onClick={() => setSchoolTabFilter('INQUIRIES')}
                        className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer flex items-center gap-1 ${
                          schoolTabFilter === 'INQUIRIES'
                            ? 'bg-white text-purple-700 shadow-2xs'
                            : 'text-slate-600 hover:text-slate-900'
                        }`}
                      >
                        <span>Inquiries</span>
                        <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-amber-100 text-amber-800">
                          {pendingInquiries.length}
                        </span>
                      </button>
                    )}
                  </div>

                  {/* Search Input */}
                  <div className="relative w-full sm:w-48">
                    <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      value={schoolSearchQuery}
                      onChange={(e) => setSchoolSearchQuery(e.target.value)}
                      placeholder="Search schools..."
                      className="w-full pl-7 pr-2.5 py-1 text-xs rounded-xl border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-purple-500/20"
                    />
                  </div>
                </div>
              </div>

              {/* Grid of School Cards */}
              {schoolTabFilter !== 'INQUIRIES' ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
                  {filteredSchoolList.length > 0 ? (
                    filteredSchoolList.map((inst, idx) => {
                      const code = inst.code || `SCH-00${idx + 1}`
                      const name = inst.name || 'Unnamed Institution'
                      const city = inst.city || 'Campus Location'
                      const province = inst.province || 'Pakistan'
                      const principal = inst.principal || inst.adminName || 'Campus Principal'
                      const email = inst.email || inst.adminEmail || `admin@${code.toLowerCase()}.edu.pk`
                      const planTier = inst.planTier || inst.planType || 'School Plan'
                      const status = inst.status || 'Active'
                      const initials = (name || 'SC').replace(/[^a-zA-Z]/g, '').slice(0, 2).toUpperCase() || 'SC'

                      return (
                        <div 
                          key={inst.id || idx} 
                          className="bg-white rounded-2xl border border-slate-200/90 hover:border-purple-300 p-4 space-y-3 shadow-2xs hover:shadow-xs transition-all flex flex-col justify-between"
                        >
                          {/* Card Top: Avatar, Name & Code */}
                          <div className="flex items-start gap-3">
                            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-purple-600 to-indigo-600 text-white font-extrabold text-xs flex items-center justify-center shadow-xs shrink-0">
                              {initials}
                            </div>
                            <div className="min-w-0 flex-1">
                              <div className="flex items-center gap-1.5 flex-wrap">
                                <h5 className="font-extrabold text-slate-900 text-xs sm:text-sm truncate" title={name}>
                                  {name}
                                </h5>
                                <span className="font-mono text-[10px] font-bold px-1.5 py-0.5 rounded bg-purple-50 text-purple-700 border border-purple-200 shrink-0">
                                  {code}
                                </span>
                              </div>
                              <span className="text-[11px] text-slate-500 flex items-center gap-1 mt-0.5 truncate">
                                <MapPin className="w-3 h-3 text-slate-400 shrink-0" />
                                <span>{city}{province ? `, ${province}` : ''}</span>
                              </span>
                            </div>
                          </div>

                          {/* Card Data Fields */}
                          <div className="space-y-1.5 p-2.5 rounded-xl bg-slate-50/80 border border-slate-100 text-xs">
                            <div className="flex items-center justify-between text-slate-600">
                              <span className="text-slate-400 text-[11px] flex items-center gap-1">
                                <User className="w-3 h-3" /> Head:
                              </span>
                              <span className="font-semibold text-slate-800 truncate max-w-[150px]">{principal}</span>
                            </div>
                            <div className="flex items-center justify-between text-slate-600">
                              <span className="text-slate-400 text-[11px] flex items-center gap-1">
                                <Shield className="w-3 h-3" /> Tier:
                              </span>
                              <span className="font-bold text-purple-700 text-[11px]">{planTier}</span>
                            </div>
                            <div className="flex items-center justify-between text-slate-600">
                              <span className="text-slate-400 text-[11px] flex items-center gap-1">
                                <Mail className="w-3 h-3" /> Contact:
                              </span>
                              <span className="font-mono text-[11px] text-slate-600 truncate max-w-[150px]">{email}</span>
                            </div>
                          </div>

                          {/* Card Footer: Server Security State */}
                          <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px]">
                            <span className="inline-flex items-center gap-1 font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                              <span>Isolated Tenant DB</span>
                            </span>
                            <span className="text-slate-400 font-mono text-[10px]">
                              {schoolInquiryEnabled ? 'Inquiry Gated' : 'Direct Sign-up'}
                            </span>
                          </div>
                        </div>
                      )
                    })
                  ) : (
                    <div className="col-span-full py-8 text-center text-slate-400 bg-slate-50 rounded-2xl border border-dashed border-slate-200">
                      <School className="w-7 h-7 text-slate-300 mx-auto mb-1.5" />
                      <p className="font-bold text-slate-600 text-xs">No school records found</p>
                      <p className="text-[11px] text-slate-400">Try adjusting your search criteria</p>
                    </div>
                  )}
                </div>
              ) : (
                /* Inquiries School Cards */
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
                  {filteredInquiriesList.length > 0 ? (
                    filteredInquiriesList.map((inq, idx) => (
                      <div 
                        key={inq.id || idx}
                        className="bg-white rounded-2xl border border-slate-200/90 p-4 space-y-3 shadow-2xs flex flex-col justify-between"
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <h5 className="font-extrabold text-slate-900 text-xs sm:text-sm truncate">{inq.schoolName}</h5>
                            <span className="text-[11px] text-slate-500 flex items-center gap-1 mt-0.5">
                              <MapPin className="w-3 h-3 text-slate-400" />
                              <span>{inq.city}, {inq.province}</span>
                            </span>
                          </div>
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md border ${
                            inq.status?.toUpperCase() === 'PENDING'
                              ? 'bg-amber-50 text-amber-800 border-amber-200'
                              : inq.status?.toUpperCase() === 'APPROVED'
                              ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                              : 'bg-rose-50 text-rose-800 border-rose-200'
                          }`}>
                            {inq.status || 'Pending'}
                          </span>
                        </div>

                        <div className="space-y-1.5 p-2.5 rounded-xl bg-slate-50 text-xs">
                          <p className="text-slate-600"><strong>Contact:</strong> {inq.contactPerson}</p>
                          <p className="text-slate-600"><strong>Email:</strong> <span className="font-mono text-[11px]">{inq.email}</span></p>
                          <p className="text-slate-600"><strong>Plan:</strong> <span className="font-bold text-purple-700">{inq.planTier || 'Evaluation Tier'}</span></p>
                        </div>

                        <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
                          <span>Awaiting Super Admin Review</span>
                          <span className="font-mono text-[10px]">{inq.submissionDate ? new Date(inq.submissionDate).toLocaleDateString() : 'Recent'}</span>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="col-span-full py-8 text-center text-slate-400 bg-slate-50 rounded-2xl border border-dashed border-slate-200">
                      <Clock className="w-7 h-7 text-slate-300 mx-auto mb-1.5" />
                      <p className="font-bold text-slate-600 text-xs">No pending school inquiries</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          <div className="pt-2 flex justify-end">
            <button 
              type="submit"
              className="px-5 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs sm:text-sm flex items-center gap-2 shadow-sm shadow-purple-600/30 cursor-pointer transition-all"
            >
              <Save className="w-4 h-4" />
              <span>Save Configuration</span>
            </button>
          </div>
        </form>
      )}

      {/* Tab 2: Compliance & Data Retention */}
      {effectiveTab === 'compliance' && (
        <form onSubmit={handleSaveRetention} className="bg-white rounded-2xl border border-slate-200/80 shadow-2xs p-6 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
            <div>
              <h3 className="font-bold text-slate-900 text-base flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-purple-600" />
                <span>Platform Data Retention &amp; Compliance Policy</span>
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Configure data lifecycle windows, audit logging retention, and automated purge policies across platform tenants.
              </p>
            </div>
            <button
              type="button"
              onClick={handleResetRetention}
              className="px-3.5 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:text-slate-900 border border-slate-200 hover:bg-slate-50 transition-colors flex items-center gap-1.5 cursor-pointer self-start sm:self-auto"
            >
              <RotateCcw className="w-3.5 h-3.5 text-slate-500" />
              <span>Restore Defaults</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-purple-600" />
                <span>Audit Logs Retention Threshold (Days)</span>
              </label>
              <input 
                type="number" 
                min="30"
                max="3650"
                value={retentionPolicy.auditLogsDays}
                onChange={(e) => setRetentionPolicy({ ...retentionPolicy, auditLogsDays: parseInt(e.target.value) || 90 })}
                className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-purple-500/20" 
              />
              <span className="text-[11px] text-slate-400 mt-1 block">
                Activity trails, permission changes, and security events lifecycle. (Default: 90 days)
              </span>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-purple-600" />
                <span>Login History &amp; Session Logs Retention (Days)</span>
              </label>
              <input 
                type="number" 
                min="30"
                max="3650"
                value={retentionPolicy.loginHistoryDays}
                onChange={(e) => setRetentionPolicy({ ...retentionPolicy, loginHistoryDays: parseInt(e.target.value) || 180 })}
                className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-purple-500/20" 
              />
              <span className="text-[11px] text-slate-400 mt-1 block">
                IP addresses, device telemetry, and authentication logs window. (Default: 180 days)
              </span>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center gap-1.5">
                <HardDrive className="w-3.5 h-3.5 text-purple-600" />
                <span>Backup Snapshots Retention (Days)</span>
              </label>
              <input 
                type="number" 
                min="30"
                max="3650"
                value={retentionPolicy.backupSnapshotsDays}
                onChange={(e) => setRetentionPolicy({ ...retentionPolicy, backupSnapshotsDays: parseInt(e.target.value) || 365 })}
                className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-purple-500/20" 
              />
              <span className="text-[11px] text-slate-400 mt-1 block">
                Disaster recovery snapshots and local point-in-time archives. (Default: 365 days)
              </span>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center gap-1.5">
                <Server className="w-3.5 h-3.5 text-purple-600" />
                <span>Archived Institutes Retention (Days)</span>
              </label>
              <input 
                type="number" 
                min="90"
                max="3650"
                value={retentionPolicy.archivedInstitutesDays}
                onChange={(e) => setRetentionPolicy({ ...retentionPolicy, archivedInstitutesDays: parseInt(e.target.value) || 730 })}
                className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-purple-500/20" 
              />
              <span className="text-[11px] text-slate-400 mt-1 block">
                Off-boarded campus directories and historical ledger archives. (Default: 730 days)
              </span>
            </div>
          </div>

          {/* Automated Purge Switch */}
          <div className="pt-4 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-xl bg-slate-50 border border-slate-200/80">
            <div className="space-y-0.5">
              <span className="font-bold text-slate-900 text-xs sm:text-sm block">Automated Background Purge Policy</span>
              <span className="text-xs text-slate-500 block">
                Automatically archive or purge records that exceed the configured retention thresholds during periodic system maintenance.
              </span>
            </div>
            <button
              type="button"
              onClick={() => setRetentionPolicy({ ...retentionPolicy, autoPurgeEnabled: !retentionPolicy.autoPurgeEnabled })}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                retentionPolicy.autoPurgeEnabled
                  ? 'bg-purple-600 text-white shadow-xs'
                  : 'bg-slate-200 text-slate-700 hover:bg-slate-300'
              }`}
            >
              {retentionPolicy.autoPurgeEnabled ? 'Automated Purge: ACTIVE' : 'Automated Purge: DISABLED'}
            </button>
          </div>

          <div className="pt-2 flex justify-end">
            <button 
              type="submit"
              disabled={isSavingRetention}
              className="px-5 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 disabled:opacity-50 text-white font-bold text-xs sm:text-sm flex items-center gap-2 shadow-sm shadow-purple-600/30 cursor-pointer transition-all"
            >
              <Save className="w-4 h-4" />
              <span>{isSavingRetention ? 'Saving Policy...' : 'Save Compliance Policy'}</span>
            </button>
          </div>
        </form>
      )}

      {/* Tab 3: Maintenance Mode */}
      {effectiveTab === 'maintenance' && (
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-2xs p-6 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h3 className="font-bold text-slate-900 text-base">Platform Maintenance Mode</h3>
              <p className="text-xs text-slate-500 mt-0.5">Temporarily records a local maintenance flag. Student and parent portals stay available until a server gate reads it.</p>
            </div>
            <button
              type="button"
              onClick={() => {
                const next = !maintenanceMode
                setMaintenanceMode(next)
                writePlatformUiSettings({ maintenanceMode: next })
                toast?.info?.(next
                  ? 'Maintenance flag saved locally. Portals are not locked.'
                  : 'Maintenance flag cleared on this device.')
              }}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer self-start sm:self-auto ${
                maintenanceMode ? 'bg-rose-600 text-white shadow-sm' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              {maintenanceMode ? 'Local flag: ON' : 'Save maintenance flag'}
            </button>
          </div>
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/90 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-slate-600">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              <span>Current Release: <strong className="text-purple-700 font-bold">v3.4.0 (Enterprise LTS)</strong></span>
              <span className="text-slate-300">•</span>
              <span>Engine build: <code className="font-mono bg-slate-200/80 px-1.5 py-0.5 rounded text-[11px] text-slate-800 font-bold">2026.10-R3</code></span>
            </div>

            {/* Eye Button: View Updates (Add, Change, Day/Night Log) */}
            <button
              type="button"
              onClick={() => setShowReleaseModal(true)}
              className="px-3.5 py-2 rounded-xl bg-white hover:bg-purple-50 border border-slate-200 hover:border-purple-300 text-purple-700 font-bold text-xs flex items-center gap-2 shadow-2xs hover:shadow-xs transition-all cursor-pointer self-start sm:self-auto group active:scale-98"
              title="View Release Updates (Additions, Changes & Day/Night Changelog)"
            >
              <Eye className="w-4 h-4 text-purple-600 group-hover:scale-110 transition-transform" />
              <span>View Release Updates</span>
            </button>
          </div>
        </div>
      )}

      {/* Release Updates & Changelog Modal */}
      <ReleaseUpdatesModal 
        isOpen={showReleaseModal} 
        onClose={() => setShowReleaseModal(false)} 
      />
    </div>
  )
}

export default SuperadminPlatformSettingsView
