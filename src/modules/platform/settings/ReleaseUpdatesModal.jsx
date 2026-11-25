import React, { useState, useEffect, useMemo } from 'react'
import { 
  X, 
  Eye, 
  Sun, 
  Moon, 
  Plus, 
  Search, 
  Filter, 
  Clock, 
  Calendar, 
  CheckCircle2, 
  Sparkles, 
  Tag, 
  RotateCcw,
  AlertCircle,
  FileText,
  User,
  ShieldCheck,
  ChevronDown,
  Layers
} from 'lucide-react'

const STORAGE_KEY = 'sms_platform_release_updates'

const INITIAL_UPDATES = [
  {
    id: 'upd-001',
    version: 'v3.4.0',
    build: '2026.10-R3',
    timestamp: '2026-11-25T02:45:00Z',
    date: 'Nov 25, 2026',
    time: '02:45 AM',
    shift: 'Night Shift',
    type: 'Changed',
    category: 'Platform Architecture',
    title: 'Platform Architecture & Settings Console Streamlining',
    description: 'Streamlined system governance console into three unified operational pillars: General Parameters, Compliance & Data Retention, and Maintenance Mode & Releases. Removed legacy tabs (backups, impersonation, branding, feature flags, and webhooks).',
    author: 'Super Administrator',
    isCustom: false
  },
  {
    id: 'upd-002',
    version: 'v3.4.0',
    build: '2026.10-R3',
    timestamp: '2026-11-24T22:30:00Z',
    date: 'Nov 24, 2026',
    time: '10:30 PM',
    shift: 'Night Shift',
    type: 'Changed',
    category: 'User Interface & Navigation',
    title: 'Dashboard Toolbar & Header Quick Action Modernization',
    description: 'Permanently removed legacy download CSV button, team governance control button, and global navbar theme switch for optimal administrative workflow.',
    author: 'Super Administrator',
    isCustom: false
  },
  {
    id: 'upd-003',
    version: 'v3.4.0',
    build: '2026.10-R3',
    timestamp: '2026-11-24T16:15:00Z',
    date: 'Nov 24, 2026',
    time: '04:15 PM',
    shift: 'Day Shift',
    type: 'Added',
    category: 'Campus Tenancy & Features',
    title: 'Campus-by-Campus Feature Matrix Active/Locked Modules Filtering',
    description: 'Implemented interactive campus selection for the platform feature matrix. Gating cards now dynamically reflect active and locked modules per individual school campus.',
    author: 'Platform Engineering',
    isCustom: false
  },
  {
    id: 'upd-004',
    version: 'v3.3.8',
    build: '2026.10-R2',
    timestamp: '2026-11-20T14:50:00Z',
    date: 'Nov 20, 2026',
    time: '02:50 PM',
    shift: 'Day Shift',
    type: 'Added',
    category: 'Campus Onboarding & Security',
    title: 'Public School Registration Inquiries Approval Gate',
    description: 'Deployed gated verification for self-service institutional sign-ups. Super Admin approval is strictly enforced before database tenant initialization.',
    author: 'Security Operations',
    isCustom: false
  },
  {
    id: 'upd-005',
    version: 'v3.3.5',
    build: '2026.10-R1',
    timestamp: '2026-11-18T03:15:00Z',
    date: 'Nov 18, 2026',
    time: '03:15 AM',
    shift: 'Night Shift',
    type: 'Changed',
    category: 'Data Governance & Storage',
    title: 'Automated Data Retention & Lifecycle Purge Engine',
    description: 'Configurable automated retention windows for audit trails (90 days), login logs (180 days), and database snapshots (365 days).',
    author: 'Platform Engineering',
    isCustom: false
  },
  {
    id: 'upd-006',
    version: 'v3.3.0',
    build: '2026.09-LTS',
    timestamp: '2026-11-15T10:00:00Z',
    date: 'Nov 15, 2026',
    time: '10:00 AM',
    shift: 'Day Shift',
    type: 'Added',
    category: 'Architecture Core',
    title: 'Multi-Tenant SaaS Educational Management Kernel Release',
    description: 'Base production release supporting multi-campus isolation, unified superadmin governance, student information system (SIS), and automated fee ledgering.',
    author: 'Core Engineering',
    isCustom: false
  }
]

export const ReleaseUpdatesModal = ({ isOpen, onClose }) => {
  const [updates, setUpdates] = useState(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY)
      if (stored) return JSON.parse(stored)
    } catch {}
    return INITIAL_UPDATES
  })

  const [activeFilter, setActiveFilter] = useState('ALL') // 'ALL' | 'DAY' | 'NIGHT' | 'ADDED' | 'CHANGED'
  const [searchQuery, setSearchQuery] = useState('')
  const [isAddingNew, setIsAddingNew] = useState(false)

  // New Update Form State
  const getCurrentShift = () => {
    const hour = new Date().getHours()
    return hour >= 7 && hour < 19 ? 'Day Shift' : 'Night Shift'
  }

  const [newTitle, setNewTitle] = useState('')
  const [newCategory, setNewCategory] = useState('General Platform')
  const [newType, setNewType] = useState('Added') // 'Added' | 'Changed' | 'Fix'
  const [newShift, setNewShift] = useState(getCurrentShift)
  const [newDescription, setNewDescription] = useState('')

  // Sync to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updates))
    } catch {}
  }, [updates])

  // Filtered list
  const filteredUpdates = useMemo(() => {
    return updates.filter(item => {
      // Filter by shift/type
      if (activeFilter === 'DAY' && item.shift !== 'Day Shift') return false
      if (activeFilter === 'NIGHT' && item.shift !== 'Night Shift') return false
      if (activeFilter === 'ADDED' && item.type !== 'Added') return false
      if (activeFilter === 'CHANGED' && item.type !== 'Changed') return false

      // Filter by search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase()
        const matchTitle = (item.title || '').toLowerCase().includes(q)
        const matchDesc = (item.description || '').toLowerCase().includes(q)
        const matchCat = (item.category || '').toLowerCase().includes(q)
        const matchVer = (item.version || '').toLowerCase().includes(q)
        return matchTitle || matchDesc || matchCat || matchVer
      }

      return true
    })
  }, [updates, activeFilter, searchQuery])

  // Shift & Type counts
  const counts = useMemo(() => {
    const total = updates.length
    const added = updates.filter(u => u.type === 'Added').length
    const changed = updates.filter(u => u.type === 'Changed').length
    const day = updates.filter(u => u.shift === 'Day Shift').length
    const night = updates.filter(u => u.shift === 'Night Shift').length
    return { total, added, changed, day, night }
  }, [updates])

  const handleAddNewUpdate = (e) => {
    e.preventDefault()
    if (!newTitle.trim()) return

    const now = new Date()
    const newEntry = {
      id: `upd-${Date.now()}`,
      version: 'v3.4.0',
      build: '2026.10-R3',
      timestamp: now.toISOString(),
      date: now.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
      time: now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
      shift: newShift,
      type: newType,
      category: newCategory,
      title: newTitle.trim(),
      description: newDescription.trim() || 'Logged platform deployment update.',
      author: 'Super Administrator',
      isCustom: true
    }

    setUpdates([newEntry, ...updates])
    setNewTitle('')
    setNewDescription('')
    setIsAddingNew(false)
  }

  const handleDeleteUpdate = (id) => {
    setUpdates(prev => prev.filter(u => u.id !== id))
  }

  const handleResetToDefaults = () => {
    if (window.confirm('Reset update ledger back to factory default release notes?')) {
      setUpdates(INITIAL_UPDATES)
      localStorage.setItem(STORAGE_KEY, JSON.stringify(INITIAL_UPDATES))
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-slate-950/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-white rounded-3xl border border-slate-200/90 shadow-2xl max-w-3xl w-full overflow-hidden flex flex-col max-h-[92vh] animate-in zoom-in-95 duration-150">
        
        {/* Modal Header */}
        <div className="p-5 sm:p-6 border-b border-slate-100 bg-gradient-to-r from-purple-50 via-slate-50 to-indigo-50/60 flex items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-2xl bg-purple-600 text-white flex items-center justify-center shadow-md shadow-purple-600/20 shrink-0">
              <Eye className="w-6 h-6 stroke-[2.2]" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="font-extrabold text-slate-900 text-base sm:text-lg">
                  Platform Release Changelog &amp; Updates
                </h3>
                <span className="text-[11px] font-bold font-mono px-2 py-0.5 rounded-full bg-purple-100 text-purple-700 border border-purple-200">
                  v3.4.0 (Enterprise LTS)
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Audit ledger of added features, changes, and operational Day/Night deployment events.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-white border border-transparent hover:border-slate-200 transition-all cursor-pointer"
            aria-label="Close dialog"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Metrics Pill Row */}
        <div className="px-5 py-3 bg-slate-50 border-b border-slate-100 flex items-center gap-2 overflow-x-auto scrollbar-none text-xs">
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-white border border-slate-200 text-slate-700 font-bold shrink-0">
            <span>Total Logged:</span>
            <span className="font-mono text-purple-600">{counts.total}</span>
          </div>

          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-800 font-bold shrink-0">
            <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
            <span>+ Added:</span>
            <span className="font-mono">{counts.added}</span>
          </div>

          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-indigo-50 border border-indigo-200 text-indigo-800 font-bold shrink-0">
            <span className="w-2 h-2 rounded-full bg-indigo-500"></span>
            <span>~ Changed:</span>
            <span className="font-mono">{counts.changed}</span>
          </div>

          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-amber-50 border border-amber-200 text-amber-800 font-bold shrink-0">
            <Sun className="w-3.5 h-3.5 text-amber-500" />
            <span>Day Shift:</span>
            <span className="font-mono">{counts.day}</span>
          </div>

          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-800 border border-slate-700 text-purple-200 font-bold shrink-0">
            <Moon className="w-3.5 h-3.5 text-indigo-400" />
            <span>Night Shift:</span>
            <span className="font-mono text-white">{counts.night}</span>
          </div>

          <button
            type="button"
            onClick={handleResetToDefaults}
            className="ml-auto text-[11px] text-slate-400 hover:text-slate-600 font-medium flex items-center gap-1 transition-colors cursor-pointer shrink-0"
            title="Reset to default release notes"
          >
            <RotateCcw className="w-3 h-3" />
            <span>Restore Defaults</span>
          </button>
        </div>

        {/* Filter and Search Controls */}
        <div className="p-4 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white">
          <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none pb-1 sm:pb-0">
            {[
              { id: 'ALL', label: 'All Updates' },
              { id: 'DAY', label: '☀️ Day Shift' },
              { id: 'NIGHT', label: '🌙 Night Shift' },
              { id: 'ADDED', label: '+ Added' },
              { id: 'CHANGED', label: '~ Changed' }
            ].map(tab => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveFilter(tab.id)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                  activeFilter === tab.id
                    ? 'bg-purple-600 text-white shadow-xs'
                    : 'bg-slate-100 hover:bg-slate-200/80 text-slate-600'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-2">
            <div className="relative flex-1 sm:w-56">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search updates..."
                className="w-full pl-8 pr-3 py-1.5 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-purple-500/20"
              />
            </div>

            <button
              type="button"
              onClick={() => setIsAddingNew(!isAddingNew)}
              className="px-3 py-1.5 rounded-xl bg-purple-50 hover:bg-purple-100 text-purple-700 border border-purple-200 font-bold text-xs flex items-center gap-1 transition-all cursor-pointer shrink-0 active:scale-98"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>{isAddingNew ? 'Close Form' : 'Log Update'}</span>
            </button>
          </div>
        </div>

        {/* Expandable Form: Add New Update Entry */}
        {isAddingNew && (
          <form onSubmit={handleAddNewUpdate} className="p-4 bg-purple-50/50 border-b border-purple-100 space-y-3 animate-in slide-in-from-top-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-extrabold text-purple-900 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-purple-600" />
                Record Platform Update / Deployment Note
              </span>
              <span className="text-[11px] font-bold text-purple-700 bg-purple-100 px-2 py-0.5 rounded-md">
                Current Time: {getCurrentShift()} 
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">Update Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Added SMS gateway failover"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-purple-500/20"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">Change Type</label>
                <select
                  value={newType}
                  onChange={(e) => setNewType(e.target.value)}
                  className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-purple-500/20 cursor-pointer"
                >
                  <option value="Added">+ Added (New Capability)</option>
                  <option value="Changed">~ Changed (Update / Enhancement)</option>
                  <option value="Fix">🔒 Fix (Patch / Resolution)</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">Operational Shift</label>
                <select
                  value={newShift}
                  onChange={(e) => setNewShift(e.target.value)}
                  className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-purple-500/20 cursor-pointer"
                >
                  <option value="Day Shift">☀️ Day Shift (07:00 AM - 07:00 PM)</option>
                  <option value="Night Shift">🌙 Night Shift (07:00 PM - 07:00 AM)</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-700 mb-1">Detailed Description</label>
              <textarea
                rows={2}
                placeholder="Describe what components were added or changed and why..."
                value={newDescription}
                onChange={(e) => setNewDescription(e.target.value)}
                className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-purple-500/20"
              />
            </div>

            <div className="flex justify-end gap-2 pt-1">
              <button
                type="button"
                onClick={() => setIsAddingNew(false)}
                className="px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-600 hover:bg-slate-200 transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-1.5 rounded-lg bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs flex items-center gap-1 shadow-xs cursor-pointer active:scale-98"
              >
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Save to Changelog</span>
              </button>
            </div>
          </form>
        )}

        {/* Updates Timeline List */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-3.5 divide-y divide-slate-100">
          {filteredUpdates.length > 0 ? (
            filteredUpdates.map((item) => (
              <div key={item.id} className="pt-3.5 first:pt-0 space-y-2">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1.5">
                  <div className="flex items-center gap-2 flex-wrap">
                    {/* Shift Badge: Day or Night */}
                    {item.shift === 'Day Shift' ? (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md text-[11px] font-bold bg-amber-50 text-amber-800 border border-amber-200/80">
                        <Sun className="w-3 h-3 text-amber-500 shrink-0" />
                        <span>Day Shift</span>
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md text-[11px] font-bold bg-slate-800 text-purple-200 border border-slate-700">
                        <Moon className="w-3 h-3 text-indigo-400 shrink-0" />
                        <span>Night Shift</span>
                      </span>
                    )}

                    {/* Change Type Badge */}
                    {item.type === 'Added' ? (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                        <span>+ Added</span>
                      </span>
                    ) : item.type === 'Changed' ? (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-bold bg-indigo-50 text-indigo-700 border border-indigo-200">
                        <span>~ Changed</span>
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-bold bg-rose-50 text-rose-700 border border-rose-200">
                        <span>🔒 Fix</span>
                      </span>
                    )}

                    {/* Category */}
                    {item.category && (
                      <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider bg-slate-100 px-2 py-0.5 rounded">
                        {item.category}
                      </span>
                    )}
                  </div>

                  {/* Timestamp */}
                  <div className="flex items-center gap-2 text-[11px] text-slate-400 font-mono">
                    <span className="flex items-center gap-1 text-slate-600 font-medium">
                      <Calendar className="w-3 h-3 text-slate-400" />
                      {item.date}
                    </span>
                    <span>&bull;</span>
                    <span className="flex items-center gap-1 text-slate-600 font-medium">
                      <Clock className="w-3 h-3 text-slate-400" />
                      {item.time}
                    </span>
                  </div>
                </div>

                {/* Title & Description */}
                <div>
                  <h4 className="font-bold text-slate-900 text-sm">
                    {item.title}
                  </h4>
                  <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                    {item.description}
                  </p>
                </div>

                {/* Footer metadata */}
                <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1">
                  <span className="flex items-center gap-1">
                    <User className="w-3 h-3 text-slate-400" />
                    <span>Logged by: <strong className="text-slate-600 font-semibold">{item.author || 'Super Admin'}</strong></span>
                  </span>

                  {item.isCustom && (
                    <button
                      type="button"
                      onClick={() => handleDeleteUpdate(item.id)}
                      className="text-rose-500 hover:text-rose-700 text-[11px] font-bold cursor-pointer"
                    >
                      Delete Entry
                    </button>
                  )}
                </div>
              </div>
            ))
          ) : (
            <div className="py-12 text-center text-slate-400">
              <Eye className="w-9 h-9 text-slate-300 mx-auto mb-2" />
              <p className="font-bold text-slate-600 text-sm">No update entries match the selected filter</p>
              <p className="text-xs text-slate-400 mt-1">
                Try selecting "All Updates" or clear your search term.
              </p>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-4 border-t border-slate-100 bg-slate-50 flex items-center justify-between text-xs text-slate-500">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            <span>Real-time deployment audit stream connected.</span>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs cursor-pointer transition-all shadow-xs"
          >
            Close Changelog
          </button>
        </div>

      </div>
    </div>
  )
}

export default ReleaseUpdatesModal
