import React, { useState } from 'react'
import { 
  Settings, 
  Globe, 
  Tag, 
  Sliders, 
  Key, 
  ShieldCheck, 
  FileText, 
  AlertTriangle, 
  UserCheck, 
  Check, 
  Save, 
  RefreshCw, 
  ExternalLink,
  Laptop
} from 'lucide-react'
import { useToast } from '../../../context/ToastContext'
import { useAppData } from '../../../context/AppDataContext'

export const SuperadminPlatformSettingsView = ({ activeTab = 'general', onTabChange = () => {} }) => {
  const { toast } = useToast()
  const { institutes = [] } = useAppData()
  const [currentTab, setCurrentTab] = useState(activeTab)
  const effectiveTab = currentTab || activeTab || 'general'

  const handleTabSwitch = (tabKey) => {
    setCurrentTab(tabKey)
    onTabChange(tabKey)
  }

  // General settings state
  const [generalForm, setGeneralForm] = useState({
    platformName: 'EIMS Enterprise Educational Network',
    defaultLanguage: 'English (US & PK)',
    currency: 'PKR - Pakistani Rupee (Rs.)',
    timezone: 'Asia/Karachi (GMT+5)',
    academicYearFormat: 'YYYY-YYYY (August - June)',
    supportEmail: 'admin@eims-edu.pk'
  })

  // Feature flags state
  const [featureFlags, setFeatureFlags] = useState([
    { id: 'flag_biometric', name: 'Biometric Hardware Realtime Sync', desc: 'Allow instant webhook sync from gate turnstiles', enabled: true, tier: 'Enterprise' },
    { id: 'flag_1bill', name: '1Bill National Banking Switch', desc: 'Generate 1Link 1Bill digital consumer IDs', enabled: true, tier: 'Standard' },
    { id: 'flag_lms_proctoring', name: 'AI LMS Quiz Anti-Cheat Lockout', desc: 'Block multiple tabs during online examinations', enabled: true, tier: 'Premium' },
    { id: 'flag_whatsapp', name: 'WhatsApp Cloud API Automations', desc: 'Dispatch fee challans & absence alerts via Meta API', enabled: true, tier: 'Standard' }
  ])

  // Maintenance mode
  const [maintenanceMode, setMaintenanceMode] = useState(false)

  const tabsConfig = [
    { key: 'general', label: 'General', icon: Settings },
    { key: 'branding', label: 'Branding & Custom Domains', icon: Globe },
    { key: 'flags', label: 'Feature Flags (Tier-wise)', icon: Sliders },
    { key: 'integrations', label: 'Integrations & Webhooks', icon: Key },
    { key: 'compliance', label: 'Compliance & Data Retention', icon: ShieldCheck },
    { key: 'legal', label: 'Legal Documents', icon: FileText },
    { key: 'maintenance', label: 'Maintenance Mode & Releases', icon: AlertTriangle },
    { key: 'impersonate', label: 'Switch to Campus View', icon: UserCheck }
  ]

  const toggleFlag = (id) => {
    setFeatureFlags(prev => prev.map(f => {
      if (f.id === id) {
        const next = !f.enabled
        toast?.info?.(`Feature Flag "${f.name}" set to ${next ? 'ENABLED' : 'DISABLED'}`)
        return { ...f, enabled: next }
      }
      return f
    }))
  }

  const handleSaveGeneral = (e) => {
    e.preventDefault()
    toast?.success?.('Platform global settings saved successfully.')
  }

  const handleSimulateImpersonation = (campusName) => {
    toast?.success?.(`Impersonating ${campusName} Administration. Entering campus view...`)
  }

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
              Global localization, currency formats, API webhook endpoints, tier feature toggles, and campus impersonation.
            </p>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-2xl p-2 border border-slate-200/80 shadow-2xs overflow-x-auto scrollbar-none">
        <div className="flex items-center gap-1.5 min-w-max">
          {tabsConfig.map(tab => {
            const Icon = tab.icon
            const active = effectiveTab === tab.key
            return (
              <button
                key={tab.key}
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
          <div className="pt-2 flex justify-end">
            <button 
              type="submit"
              className="px-5 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs sm:text-sm flex items-center gap-2 shadow-sm shadow-purple-600/30 cursor-pointer"
            >
              <Save className="w-4 h-4" />
              <span>Save Configuration</span>
            </button>
          </div>
        </form>
      )}

      {/* Tab 3: Feature Flags */}
      {effectiveTab === 'flags' && (
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-2xs overflow-hidden">
          <div className="p-5 border-b border-slate-100">
            <h3 className="font-bold text-slate-900">Platform Feature Flags & Tier Capabilities</h3>
            <p className="text-xs text-slate-500">Dynamically enable or disable advanced capabilities across all active tenants</p>
          </div>
          <div className="divide-y divide-slate-100">
            {featureFlags.map(f => (
              <div key={f.id} className="p-4 sm:p-5 flex items-center justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-900 text-sm">{f.name}</span>
                    <span className="text-[11px] font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-700">{f.tier}</span>
                  </div>
                  <p className="text-xs text-slate-500 mt-0.5">{f.desc}</p>
                </div>
                <button
                  type="button"
                  onClick={() => toggleFlag(f.id)}
                  className={`w-12 h-6 flex items-center rounded-full p-1 cursor-pointer transition-colors shrink-0 ${
                    f.enabled ? 'bg-purple-600 justify-end' : 'bg-slate-300 justify-start'
                  }`}
                >
                  <div className="w-4 h-4 rounded-full bg-white shadow-xs"></div>
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 7: Maintenance Mode */}
      {effectiveTab === 'maintenance' && (
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-2xs p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-bold text-slate-900 text-base">Platform Maintenance Mode</h3>
              <p className="text-xs text-slate-500">Temporarily halts student and parent portals while preserving Superadmin access</p>
            </div>
            <button
              onClick={() => {
                const next = !maintenanceMode
                setMaintenanceMode(next)
                toast?.info?.(`Maintenance mode is now ${next ? 'ACTIVATED' : 'DEACTIVATED'}`)
              }}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                maintenanceMode ? 'bg-rose-600 text-white' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              {maintenanceMode ? 'Maintenance Mode: ACTIVE' : 'Enable Maintenance'}
            </button>
          </div>
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-100 text-xs text-slate-600">
            Current Release: <span className="font-bold text-purple-700">v3.4.0 (Enterprise LTS)</span> &bull; Engine build: 2026.10-R3
          </div>
        </div>
      )}

      {/* Tab 8: Switch to Campus View (Impersonation) */}
      {effectiveTab === 'impersonate' && (
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-2xs p-6 space-y-4">
          <div>
            <h3 className="font-bold text-slate-900 text-base">Campus Impersonation & Delegation Switcher</h3>
            <p className="text-xs text-slate-500">Switch directly into any affiliated campus's institute admin console with full audit trails</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
            {[
              { id: 'inst-1', name: 'Beaconhouse Central High', code: 'BHS-01', city: 'Lahore', students: 1314 },
              { id: 'inst-2', name: 'The City School Senior Branch', code: 'TCS-02', city: 'Lahore', students: 1211 },
              { id: 'inst-3', name: 'Lahore Grammar Model Town', code: 'LGS-03', city: 'Lahore', students: 895 },
              { id: 'inst-4', name: 'Army Public School & College', code: 'APS-04', city: 'Rawalpindi', students: 940 }
            ].map(c => (
              <div key={c.id} className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 flex items-center justify-between">
                <div>
                  <span className="font-mono text-[11px] font-bold text-purple-700">{c.code}</span>
                  <h4 className="font-bold text-slate-900 text-sm mt-0.5">{c.name}</h4>
                  <p className="text-xs text-slate-500">{c.city} &bull; {c.students} Students</p>
                </div>
                <button
                  onClick={() => handleSimulateImpersonation(c.name)}
                  className="px-3 py-1.5 rounded-lg bg-purple-600 hover:bg-purple-500 text-white font-semibold text-xs flex items-center gap-1 shadow-xs cursor-pointer"
                >
                  <UserCheck className="w-3.5 h-3.5" />
                  <span>Impersonate</span>
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Fallback for other tabs */}
      {['branding', 'integrations', 'compliance', 'legal'].includes(effectiveTab) && (
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-2xs p-6 space-y-4">
          <h3 className="font-bold text-slate-900 capitalize">{effectiveTab} Infrastructure</h3>
          <p className="text-xs text-slate-500">SSL certificates, custom subdomains, NADRA API keys, and legal SLA documentation.</p>
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-100 text-xs text-slate-600">
            Encrypted with AES-256 at rest. Webhooks authenticate using SHA-256 HMAC digital signatures.
          </div>
        </div>
      )}
    </div>
  )
}

export default SuperadminPlatformSettingsView
