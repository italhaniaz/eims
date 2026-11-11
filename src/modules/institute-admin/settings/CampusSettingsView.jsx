import React, { useState, useEffect } from 'react'
import {
  Settings,
  Save,
  Building2,
  Calendar,
  Palette,
  Moon,
  Sun,
  ShieldCheck,
  CheckCircle2
} from 'lucide-react'
import { useAppData } from '../../../context/AppDataContext'
import { useTheme } from '../../../context/ThemeContext'
import { useToast } from '../../../context/ToastContext'

const getSettingsKey = (instId) => `eims_campus_preferences_${instId || 'default'}`

export const CampusSettingsView = ({ currentInstitute, onRouteChange }) => {
  const { updateItem } = useAppData()
  const { isDark, toggleThemeMode, preset, applyPreset } = useTheme()
  const { toast } = useToast()

  const instId = currentInstitute?.id || 'default'

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
    } catch (_) {}
  }, [instId, currentInstitute?.name])

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
    } catch (err) {
      toast.error('Failed to save preferences.')
    }
  }

  return (
    <div className="p-4 sm:p-6 md:p-8 max-w-5xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-[var(--text)] font-heading flex items-center gap-2.5">
            <Settings className="w-6 h-6 text-emerald-600" />
            <span>Campus System Settings</span>
          </h1>
          <p className="text-xs sm:text-sm text-[var(--text-muted)] mt-1">
            Configure school profile, academic session defaults, billing rules, and interface theme for {currentInstitute?.name || 'this school'}.
          </p>
        </div>
        {onRouteChange && (
          <button
            type="button"
            onClick={() => onRouteChange('inst-users')}
            className="px-4 py-2 rounded-xl bg-[var(--surface)] border border-[var(--border)] text-xs font-semibold text-[var(--text)] hover:bg-slate-50 flex items-center gap-2 cursor-pointer"
          >
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>Manage Staff Logins &amp; Roles</span>
          </button>
        )}
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        {/* School Identity */}
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

        {/* Academic & Fee Defaults */}
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

        {/* Appearance & RTL */}
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
    </div>
  )
}

export default CampusSettingsView
