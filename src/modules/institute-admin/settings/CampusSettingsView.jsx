import React, { useState, useEffect, useMemo } from 'react'
import {
  Settings,
  Save,
  Building2,
  Calendar,
  Palette,
  Moon,
  Sun,
  ShieldCheck,
  CheckCircle2,
  MapPin,
  Plus,
  Trash2,
  ListChecks,
  Search
} from 'lucide-react'
import { useAppData } from '../../../context/AppDataContext'
import { useTheme } from '../../../context/ThemeContext'
import { useToast } from '../../../context/ToastContext'

const getSettingsKey = (instId) => `eims_campus_preferences_${instId || 'default'}`
const getLocationsKey = (instId) => `eims_campus_locations_${instId || 'default'}`

export const CampusSettingsView = ({ currentInstitute, onRouteChange, initialTab = 'profile' }) => {
  const { updateItem, auditLogs = [] } = useAppData()
  const { isDark, toggleThemeMode, preset, applyPreset } = useTheme()
  const { toast } = useToast()

  const instId = currentInstitute?.id || 'default'
  const [activeTab, setActiveTab] = useState(initialTab || 'profile') // 'profile' | 'locations' | 'activity'

  useEffect(() => {
    if (initialTab) setActiveTab(initialTab)
  }, [initialTab])

  const [prefs, setPrefs] = useState(() => {
    try {
      const saved = localStorage.getItem(getSettingsKey(instId))
      if (saved) return JSON.parse(saved)
    } catch (_) {}
    return {
      schoolName: currentInstitute?.name || 'School Campus',
      schoolCode: currentInstitute?.code || 'SCH-001',
      phone: currentInstitute?.phone || '',
      address: currentInstitute?.address || '',
      affiliatedBoard: currentInstitute?.affiliatedBoard || 'BISE',
      academicSession: '2026-2027',
      feeDueDay: 10,
      lateFeePerDay: 50,
      minAttendancePct: 75,
      rtlUrduReady: false
    }
  })

  const [locations, setLocations] = useState(() => {
    try {
      const saved = localStorage.getItem(getLocationsKey(instId))
      if (saved) return JSON.parse(saved)
    } catch (_) {}
    return []
  })
  const [locForm, setLocForm] = useState({ name: '', type: 'Classroom Wing / Block', floor: 'Ground Floor', capacity: 40, notes: '' })
  const [logSearch, setLogSearch] = useState('')

  useEffect(() => {
    try {
      const saved = localStorage.getItem(getSettingsKey(instId))
      if (saved) {
        setPrefs(JSON.parse(saved))
      } else {
        setPrefs(prev => ({
          ...prev,
          schoolName: currentInstitute?.name || prev.schoolName,
          schoolCode: currentInstitute?.code || prev.schoolCode,
          phone: currentInstitute?.phone || '',
          address: currentInstitute?.address || '',
          affiliatedBoard: currentInstitute?.affiliatedBoard || 'BISE'
        }))
      }
      const savedLoc = localStorage.getItem(getLocationsKey(instId))
      setLocations(savedLoc ? JSON.parse(savedLoc) : [])
    } catch (_) {}
  }, [instId, currentInstitute?.name])

  const filteredLogs = useMemo(() => {
    const q = logSearch.trim().toLowerCase()
    return auditLogs
      .filter(l => !l.instituteId || l.instituteId === instId)
      .filter(l => {
        if (!q) return true
        return (
          (l.action || '').toLowerCase().includes(q) ||
          (l.details || l.description || '').toLowerCase().includes(q) ||
          (l.userName || l.actor || '').toLowerCase().includes(q)
        )
      })
  }, [auditLogs, instId, logSearch])

  const handleSave = (e) => {
    e.preventDefault()
    try {
      localStorage.setItem(getSettingsKey(instId), JSON.stringify(prefs))
      if (currentInstitute?.id && typeof updateItem === 'function') {
        updateItem('institutes', currentInstitute.id, {
          name: prefs.schoolName.trim(),
          phone: prefs.phone.trim(),
          address: prefs.address.trim(),
          affiliatedBoard: prefs.affiliatedBoard.trim()
        })
      }
      if (typeof document !== 'undefined') {
        document.documentElement.dir = prefs.rtlUrduReady ? 'rtl' : 'ltr'
      }
      toast.success('School system preferences saved successfully.')
    } catch (_) {
      toast.error('Failed to save preferences.')
    }
  }

  const handleAddLocation = (e) => {
    e.preventDefault()
    if (!locForm.name.trim()) return
    const next = [
      { id: `loc-${Date.now()}`, ...locForm, name: locForm.name.trim(), capacity: Number(locForm.capacity) || 30 },
      ...locations
    ]
    setLocations(next)
    try { localStorage.setItem(getLocationsKey(instId), JSON.stringify(next)) } catch (_) {}
    setLocForm({ name: '', type: 'Classroom Wing / Block', floor: 'Ground Floor', capacity: 40, notes: '' })
    toast.success('Campus location saved.')
  }

  const handleDeleteLocation = (id) => {
    const next = locations.filter(l => l.id !== id)
    setLocations(next)
    try { localStorage.setItem(getLocationsKey(instId), JSON.stringify(next)) } catch (_) {}
    toast.success('Location removed.')
  }

  return (
    <div className="p-4 sm:p-6 md:p-8 max-w-5xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-[var(--text)] font-heading flex items-center gap-2.5">
            <Settings className="w-6 h-6 text-emerald-600" />
            <span>School Settings</span>
          </h1>
          <p className="text-xs sm:text-sm text-[var(--text-muted)] mt-1">
            Manage institute profile, campus locations, and activity logs for {currentInstitute?.name || 'this school'}.
          </p>
        </div>
        {onRouteChange && (
          <button
            type="button"
            onClick={() => onRouteChange('inst-users')}
            className="px-4 py-2 rounded-xl bg-[var(--surface)] border border-[var(--border)] text-xs font-semibold text-[var(--text)] hover:bg-slate-50 flex items-center gap-2 cursor-pointer"
          >
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>Users &amp; Roles</span>
          </button>
        )}
      </div>

      {/* Settings Sub-Tabs */}
      <div className="bg-[var(--surface)] border border-[var(--border)] rounded-2xl p-1.5 flex flex-wrap gap-1 shadow-soft">
        {[
          { id: 'profile', label: 'Institute Profile', icon: Building2 },
          { id: 'locations', label: 'Locations', icon: MapPin },
          { id: 'activity', label: 'Activity Log', icon: ListChecks }
        ].map(t => {
          const Icon = t.icon
          return (
            <button
              key={t.id}
              type="button"
              onClick={() => setActiveTab(t.id)}
              className={`px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 cursor-pointer ${
                activeTab === t.id ? 'bg-emerald-600 text-white' : 'text-[var(--text-muted)] hover:bg-slate-100'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{t.label}</span>
            </button>
          )
        })}
      </div>

      {/* TAB 1: INSTITUTE PROFILE */}
      {activeTab === 'profile' && (
        <form onSubmit={handleSave} className="space-y-6">
          <div className="bg-[var(--surface)] border border-[var(--border)] rounded-2xl p-5 sm:p-6 shadow-soft space-y-4">
            <div className="flex items-center gap-2 text-sm font-bold text-[var(--text)]">
              <Building2 className="w-4 h-4 text-emerald-600" />
              <span>School Profile &amp; Affiliation</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-[var(--text)] mb-1">School Name</label>
                <input
                  type="text"
                  required
                  value={prefs.schoolName}
                  onChange={(e) => setPrefs({ ...prefs, schoolName: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[var(--border)] text-sm bg-[var(--surface)] text-[var(--text)]"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-[var(--text)] mb-1">Campus Code</label>
                <input
                  type="text"
                  value={prefs.schoolCode}
                  onChange={(e) => setPrefs({ ...prefs, schoolCode: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[var(--border)] text-sm bg-[var(--surface)] text-[var(--text)]"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-[var(--text)] mb-1">Affiliated Board</label>
                <input
                  type="text"
                  value={prefs.affiliatedBoard}
                  onChange={(e) => setPrefs({ ...prefs, affiliatedBoard: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[var(--border)] text-sm bg-[var(--surface)] text-[var(--text)]"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-[var(--text)] mb-1">Contact Phone</label>
                <input
                  type="text"
                  value={prefs.phone}
                  onChange={(e) => setPrefs({ ...prefs, phone: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[var(--border)] text-sm bg-[var(--surface)] text-[var(--text)]"
                />
              </div>
              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold text-[var(--text)] mb-1">Campus Address</label>
                <input
                  type="text"
                  value={prefs.address}
                  onChange={(e) => setPrefs({ ...prefs, address: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[var(--border)] text-sm bg-[var(--surface)] text-[var(--text)]"
                />
              </div>
            </div>
          </div>

          <div className="bg-[var(--surface)] border border-[var(--border)] rounded-2xl p-5 sm:p-6 shadow-soft space-y-4">
            <div className="flex items-center gap-2 text-sm font-bold text-[var(--text)]">
              <Calendar className="w-4 h-4 text-emerald-600" />
              <span>Academic Session &amp; Fee Defaults</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div>
                <label className="block text-xs font-semibold text-[var(--text)] mb-1">Active Session</label>
                <input
                  type="text"
                  value={prefs.academicSession}
                  onChange={(e) => setPrefs({ ...prefs, academicSession: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[var(--border)] text-sm bg-[var(--surface)] text-[var(--text)]"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-[var(--text)] mb-1">Monthly Fee Due Day</label>
                <input
                  type="number"
                  min="1"
                  max="28"
                  value={prefs.feeDueDay}
                  onChange={(e) => setPrefs({ ...prefs, feeDueDay: Number(e.target.value) })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[var(--border)] text-sm bg-[var(--surface)] text-[var(--text)]"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-[var(--text)] mb-1">Late Fee / Day (PKR)</label>
                <input
                  type="number"
                  min="0"
                  value={prefs.lateFeePerDay}
                  onChange={(e) => setPrefs({ ...prefs, lateFeePerDay: Number(e.target.value) })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[var(--border)] text-sm bg-[var(--surface)] text-[var(--text)]"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-[var(--text)] mb-1">Min Attendance (%)</label>
                <input
                  type="number"
                  min="50"
                  max="100"
                  value={prefs.minAttendancePct}
                  onChange={(e) => setPrefs({ ...prefs, minAttendancePct: Number(e.target.value) })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[var(--border)] text-sm bg-[var(--surface)] text-[var(--text)]"
                />
              </div>
            </div>
          </div>

          <div className="bg-[var(--surface)] border border-[var(--border)] rounded-2xl p-5 sm:p-6 shadow-soft space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-sm font-bold text-[var(--text)]">
                <Palette className="w-4 h-4 text-emerald-600" />
                <span>Theme &amp; Display Mode</span>
              </div>
              <button
                type="button"
                onClick={toggleThemeMode}
                className="px-3.5 py-2 rounded-xl border border-[var(--border)] text-xs font-semibold flex items-center gap-2 cursor-pointer"
              >
                {isDark ? <Sun className="w-4 h-4 text-amber-500" /> : <Moon className="w-4 h-4 text-indigo-600" />}
                <span>{isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}</span>
              </button>
            </div>
            <div className="flex flex-wrap items-center gap-2.5">
              {['school', 'indigo', 'custom'].map(p => (
                <button
                  key={p}
                  type="button"
                  onClick={() => applyPreset && applyPreset(p)}
                  className={`px-3.5 py-2 rounded-xl text-xs font-semibold border capitalize flex items-center gap-1.5 cursor-pointer ${
                    preset === p
                      ? 'border-emerald-600 bg-emerald-50 text-emerald-800'
                      : 'border-[var(--border)] text-[var(--text-muted)]'
                  }`}
                >
                  {preset === p && <CheckCircle2 className="w-3.5 h-3.5" />}
                  <span>{p} Palette</span>
                </button>
              ))}
            </div>
            <label className="flex items-center gap-2.5 text-xs font-medium text-[var(--text)] cursor-pointer pt-1">
              <input
                type="checkbox"
                checked={Boolean(prefs.rtlUrduReady)}
                onChange={(e) => setPrefs({ ...prefs, rtlUrduReady: e.target.checked })}
                className="rounded border-slate-300"
              />
              <span>Enable Right-to-Left (RTL / Urdu) Layout Direction</span>
            </label>
          </div>

          <div className="flex justify-end">
            <button
              type="submit"
              className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold flex items-center gap-2 transition-colors cursor-pointer"
            >
              <Save className="w-4 h-4" />
              <span>Save School Settings</span>
            </button>
          </div>
        </form>
      )}

      {/* TAB 2: LOCATIONS */}
      {activeTab === 'locations' && (
        <div className="space-y-4">
          <form onSubmit={handleAddLocation} className="bg-[var(--surface)] border border-[var(--border)] rounded-2xl p-5 shadow-soft grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 items-end text-xs">
            <div>
              <label className="block font-semibold text-[var(--text)] mb-1">Location / Block Name *</label>
              <input type="text" required placeholder="e.g. Junior Wing Room 4" value={locForm.name} onChange={(e) => setLocForm({ ...locForm, name: e.target.value })} className="w-full px-3 py-2 rounded-xl border border-[var(--border)] bg-[var(--surface)] text-[var(--text)]" />
            </div>
            <div>
              <label className="block font-semibold text-[var(--text)] mb-1">Type</label>
              <select value={locForm.type} onChange={(e) => setLocForm({ ...locForm, type: e.target.value })} className="w-full px-3 py-2 rounded-xl border border-[var(--border)] bg-[var(--surface)] text-[var(--text)]">
                <option>Classroom Wing / Block</option>
                <option>Science / Computer Lab</option>
                <option>Auditorium / Hall</option>
                <option>Admin Office / Branch</option>
              </select>
            </div>
            <div>
              <label className="block font-semibold text-[var(--text)] mb-1">Floor</label>
              <input type="text" value={locForm.floor} onChange={(e) => setLocForm({ ...locForm, floor: e.target.value })} className="w-full px-3 py-2 rounded-xl border border-[var(--border)] bg-[var(--surface)] text-[var(--text)]" />
            </div>
            <div>
              <label className="block font-semibold text-[var(--text)] mb-1">Seating Capacity</label>
              <input type="number" min="1" value={locForm.capacity} onChange={(e) => setLocForm({ ...locForm, capacity: e.target.value })} className="w-full px-3 py-2 rounded-xl border border-[var(--border)] bg-[var(--surface)] text-[var(--text)]" />
            </div>
            <button type="submit" className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold flex items-center justify-center gap-1.5 cursor-pointer">
              <Plus className="w-4 h-4" />
              <span>Add Location</span>
            </button>
          </form>

          <div className="bg-[var(--surface)] border border-[var(--border)] rounded-2xl overflow-hidden shadow-soft">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-[var(--border)] text-[11px] uppercase text-slate-500">
                <tr><th className="p-3.5">Location Name</th><th className="p-3.5">Type</th><th className="p-3.5">Floor</th><th className="p-3.5">Capacity</th><th className="p-3.5 text-right">Action</th></tr>
              </thead>
              <tbody className="divide-y divide-[var(--border)]">
                {locations.length === 0 ? (
                  <tr><td colSpan="5" className="p-8 text-center text-[var(--text-muted)]">No campus buildings or rooms added yet.</td></tr>
                ) : locations.map(loc => (
                  <tr key={loc.id} className="hover:bg-slate-50/60">
                    <td className="p-3.5 font-semibold text-[var(--text)]">{loc.name}</td>
                    <td className="p-3.5">{loc.type}</td>
                    <td className="p-3.5">{loc.floor}</td>
                    <td className="p-3.5 font-mono">{loc.capacity} Seats</td>
                    <td className="p-3.5 text-right">
                      <button type="button" onClick={() => handleDeleteLocation(loc.id)} className="p-1.5 text-slate-400 hover:text-rose-600 cursor-pointer" title="Delete Location">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 3: ACTIVITY LOG */}
      {activeTab === 'activity' && (
        <div className="bg-[var(--surface)] border border-[var(--border)] rounded-2xl p-5 shadow-soft space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 className="text-sm font-bold text-[var(--text)]">School Activity Log</h3>
              <p className="text-xs text-[var(--text-muted)]">Recent audit trail and administrative actions performed on this campus.</p>
            </div>
            <div className="relative">
              <Search className="w-4 h-4 text-[var(--text-muted)] absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search activity..."
                value={logSearch}
                onChange={(e) => setLogSearch(e.target.value)}
                className="pl-9 pr-3 py-2 rounded-xl border border-[var(--border)] bg-[var(--surface)] text-xs w-60"
              />
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-[var(--border)] text-[11px] uppercase text-slate-500">
                <tr><th className="p-3">Time</th><th className="p-3">Action</th><th className="p-3">Details</th><th className="p-3">Performed By</th></tr>
              </thead>
              <tbody className="divide-y divide-[var(--border)]">
                {filteredLogs.length === 0 ? (
                  <tr><td colSpan="4" className="p-8 text-center text-[var(--text-muted)]">No activity events recorded yet.</td></tr>
                ) : filteredLogs.map((log, i) => (
                  <tr key={log.id || i}>
                    <td className="p-3 font-mono text-[11px] text-[var(--text-muted)]">{String(log.timestamp || log.createdAt || '').slice(0, 19).replace('T', ' ') || 'Recent'}</td>
                    <td className="p-3 font-semibold text-emerald-700">{log.action || 'EVENT'}</td>
                    <td className="p-3 text-[var(--text)]">{log.details || log.description || '—'}</td>
                    <td className="p-3 text-[var(--text-muted)]">{log.userName || log.actor || 'Administrator'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}

export default CampusSettingsView
