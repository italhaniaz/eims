import React, { useState } from 'react'
import { 
  BookMarked, 
  Video, 
  BookOpen, 
  Database, 
  Layers, 
  ShieldCheck, 
  Search, 
  Download, 
  Sparkles,
  ExternalLink,
  Laptop
} from 'lucide-react'
import { useToast } from '../../../context/ToastContext'

export const SuperadminLearningView = ({ activeTab = 'lms', onTabChange = () => {} }) => {
  const { toast } = useToast()
  const [currentTab, setCurrentTab] = useState(activeTab)
  const effectiveTab = currentTab || activeTab || 'lms'

  const handleTabSwitch = (tabKey) => {
    setCurrentTab(tabKey)
    onTabChange(tabKey)
  }

  const [integrations] = useState([
    { name: 'Zoom Education Suite', type: 'Video Conferencing API', status: 'Connected', licenseCount: '150 Host Pro Accounts', autoRecord: 'Enabled (Cloud)' },
    { name: 'Google Meet & Classroom', type: 'Google Workspace Education', status: 'Connected', licenseCount: 'Unlimited Students', autoRecord: 'Enabled (Drive)' },
    { name: 'Microsoft Teams for Education', type: 'Office 365 Tenant', status: 'Connected', licenseCount: '4,000 A1 Licenses', autoRecord: 'Enabled' }
  ])

  const tabsConfig = [
    { key: 'lms', label: 'LMS Policies & Proctoring', icon: Laptop },
    { key: 'classes', label: 'Online Class Integrations', icon: Video },
    { key: 'library', label: 'Library Policies & Central Catalog', icon: BookMarked },
    { key: 'digital', label: 'Digital Resources & Repositories', icon: Database }
  ]

  return (
    <div className="p-3 sm:p-6 md:p-8 space-y-6 max-w-7xl mx-auto">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-indigo-950 via-slate-900 to-purple-950 rounded-3xl p-6 sm:p-8 text-white shadow-xl relative overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md text-xs font-semibold text-indigo-200 border border-white/10 mb-2">
              <Laptop className="w-3.5 h-3.5 text-indigo-300" />
              <span>Super Administrator • Digital Learning & LMS Authority</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              Learning Systems & Educational Resources
            </h1>
            <p className="text-sm text-indigo-100 mt-1 max-w-2xl leading-relaxed">
              Global LMS policies, Zoom & Teams cloud integration, central ISBN catalog, and digital open-access libraries.
            </p>
          </div>
          <button 
            onClick={() => toast?.info?.('LMS quota configuration modal initialized')}
            className="px-4 py-2.5 rounded-xl bg-indigo-500 hover:bg-indigo-400 text-white font-bold text-xs sm:text-sm flex items-center gap-2 shadow-lg transition-all cursor-pointer self-start md:self-auto shrink-0"
          >
            <Database className="w-4 h-4" />
            <span>Configure LMS Storage Quotas</span>
          </button>
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
                    ? 'bg-indigo-700 text-white shadow-sm shadow-indigo-700/30' 
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

      {/* Tab 1: LMS Policies */}
      {effectiveTab === 'lms' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-2xs">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Assignment Max File Upload</span>
              <h3 className="text-xl font-bold text-slate-900 mt-1">50 MB / Submission</h3>
              <p className="text-xs text-slate-500 mt-1">Allowed formats: PDF, DOCX, PPTX, MP4, ZIP</p>
            </div>
            <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-2xs">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Automated Anti-Plagiarism</span>
              <h3 className="text-xl font-bold text-indigo-700 mt-1">Turnitin API Enabled</h3>
              <p className="text-xs text-slate-500 mt-1">20% similarity threshold for university thesis</p>
            </div>
            <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-2xs">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Online Quiz Proctoring</span>
              <h3 className="text-xl font-bold text-slate-900 mt-1">Browser Tab Lockout</h3>
              <p className="text-xs text-slate-500 mt-1">Auto-flags when candidate leaves exam tab</p>
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Online Class Integrations */}
      {effectiveTab === 'classes' && (
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-2xs overflow-hidden">
          <div className="p-5 border-b border-slate-100">
            <h3 className="font-bold text-slate-900">Enterprise Video Conferencing Bridges</h3>
            <p className="text-xs text-slate-500">Live lecture channels synchronized with daily campus timetables</p>
          </div>
          <div className="divide-y divide-slate-100">
            {integrations.map((ig, i) => (
              <div key={i} className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2">
                    <Video className="w-4 h-4 text-indigo-700" />
                    <span className="font-bold text-slate-900 text-sm">{ig.name}</span>
                    <span className="text-xs text-slate-500">({ig.type})</span>
                  </div>
                  <p className="text-xs text-slate-500 mt-1">Capacity: <b>{ig.licenseCount}</b> &bull; Cloud Backup: <b>{ig.autoRecord}</b></p>
                </div>
                <div className="text-right">
                  <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800">
                    {ig.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 3: Library & Tab 4: Digital */}
      {['library', 'digital'].includes(effectiveTab) && (
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-2xs p-6 space-y-4">
          <h3 className="font-bold text-slate-900 capitalize">{effectiveTab} Master Repositories</h3>
          <p className="text-xs text-slate-500">Universal ISBN lookup, Dewey Decimal classification, and high-speed PDF distribution.</p>
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-100 text-xs text-slate-600">
            Over 24,000 curriculum textbooks, research papers, and digitized past board papers accessible across all campuses.
          </div>
        </div>
      )}
    </div>
  )
}

export default SuperadminLearningView
