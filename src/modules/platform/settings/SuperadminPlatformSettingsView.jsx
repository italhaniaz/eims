import React, { useState, useEffect } from 'react'
import { 
  Settings, 
  ShieldCheck, 
  AlertTriangle, 
  Save, 
  Server, 
  Clock, 
  RotateCcw,
  CheckCircle,
  HardDrive
} from 'lucide-react'
import { useToast } from '../../../context/ToastContext'
import { OperationsService } from '../../../services/operationsService'
import { SchoolInquiryService } from '../../../services/schoolInquiryService'

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
          <div className="pt-6 border-t border-slate-100">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
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
                  Configure admission gating policy for public school registrations and self-service campus sign-ups.
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

            <div className="p-4 sm:p-5 rounded-2xl bg-slate-50 border border-slate-200/90 flex flex-col md:flex-row md:items-center justify-between gap-4">
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

              <div className="flex items-center gap-3 shrink-0">
                <button
                  type="button"
                  onClick={handleToggleSchoolInquiry}
                  className={`relative inline-flex h-7 w-13 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-purple-600 focus:ring-offset-2 ${
                    schoolInquiryEnabled ? 'bg-purple-600' : 'bg-slate-300'
                  }`}
                  role="switch"
                  aria-checked={schoolInquiryEnabled}
                >
                  <span
                    aria-hidden="true"
                    className={`pointer-events-none inline-block h-6 w-6 transform rounded-full bg-white shadow-md ring-0 transition duration-200 ease-in-out ${
                      schoolInquiryEnabled ? 'translate-x-6' : 'translate-x-0'
                    }`}
                  />
                </button>
                <span className="text-xs font-bold text-slate-700 w-10">
                  {schoolInquiryEnabled ? 'ON' : 'OFF'}
                </span>
              </div>
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
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-100 text-xs text-slate-600">
            Current Release: <span className="font-bold text-purple-700">v3.4.0 (Enterprise LTS)</span> &bull; Engine build: 2026.10-R3
          </div>
        </div>
      )}
    </div>
  )
}

export default SuperadminPlatformSettingsView
