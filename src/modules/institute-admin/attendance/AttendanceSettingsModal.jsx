import React, { useState } from 'react'
import { X, Settings, Calendar, Plus, Trash2, Check, ShieldCheck, Clock } from 'lucide-react'
import {
  getAttendanceSettings,
  saveAttendanceSettings,
  getAcademicHolidays,
  saveAcademicHoliday,
  deleteAcademicHoliday,
  formatDateDDMMYYYY
} from './attendanceService'

export const AttendanceSettingsModal = ({ isOpen, onClose, onSettingsUpdated }) => {
  if (!isOpen) return null

  const [settings, setSettings] = useState(() => getAttendanceSettings())
  const [holidays, setHolidays] = useState(() => getAcademicHolidays())
  const [activeSubTab, setActiveSubTab] = useState('general') // 'general' | 'holidays'

  // New Holiday form state
  const [newHolidayName, setNewHolidayName] = useState('')
  const [newHolidayDate, setNewHolidayDate] = useState('')
  const [newHolidayEndDate, setNewHolidayEndDate] = useState('')
  const [newHolidayType, setNewHolidayType] = useState('Gazetted')
  const [isRange, setIsRange] = useState(false)

  const allWeekdays = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']

  const handleToggleWeekday = (day) => {
    setSettings(prev => {
      const current = prev.workingDays || []
      const nextDays = current.includes(day)
        ? current.filter(d => d !== day)
        : [...current, day]
      return { ...prev, workingDays: nextDays }
    })
  }

  const handleSaveGeneralSettings = (e) => {
    e.preventDefault()
    const saved = saveAttendanceSettings(settings)
    onSettingsUpdated?.(saved)
    onClose()
  }

  const handleAddHoliday = (e) => {
    e.preventDefault()
    if (!newHolidayName || !newHolidayDate) return

    const holiday = {
      name: newHolidayName,
      type: newHolidayType,
      date: isRange ? null : newHolidayDate,
      startDate: isRange ? newHolidayDate : null,
      endDate: isRange ? (newHolidayEndDate || newHolidayDate) : null
    }

    const updated = saveAcademicHoliday(holiday)
    setHolidays(updated)
    setNewHolidayName('')
    setNewHolidayDate('')
    setNewHolidayEndDate('')
    setIsRange(false)
    onSettingsUpdated?.(settings)
  }

  const handleDeleteHoliday = (id) => {
    const updated = deleteAcademicHoliday(id)
    setHolidays(updated)
    onSettingsUpdated?.(settings)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-white rounded-2xl shadow-xl border border-slate-200 w-full max-w-xl overflow-hidden animate-in zoom-in-95 duration-150 flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/70">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-slate-100 text-slate-700 flex items-center justify-center border border-slate-200">
              <Settings className="w-5 h-5 text-slate-600" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-800">
                Attendance Rules & Holiday Settings
              </h3>
              <p className="text-xs text-slate-400">
                Configure defaulter thresholds, working days, and institutional holiday calendar
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Sub-tab Navigation */}
        <div className="flex border-b border-slate-200 px-5 pt-2 gap-4 text-xs font-bold text-slate-500 bg-slate-50/40">
          <button
            type="button"
            onClick={() => setActiveSubTab('general')}
            className={`pb-2.5 border-b-2 transition-all ${
              activeSubTab === 'general' ? 'border-emerald-600 text-emerald-800' : 'border-transparent hover:text-slate-900'
            }`}
          >
            General Rules & Thresholds
          </button>
          <button
            type="button"
            onClick={() => setActiveSubTab('holidays')}
            className={`pb-2.5 border-b-2 transition-all ${
              activeSubTab === 'holidays' ? 'border-emerald-600 text-emerald-800' : 'border-transparent hover:text-slate-900'
            }`}
          >
            Academic Holidays Calendar ({holidays.length})
          </button>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-5 text-xs">
          {activeSubTab === 'general' && (
            <form onSubmit={handleSaveGeneralSettings} className="space-y-5">
              {/* Defaulter Threshold % */}
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-2">
                <label className="block text-slate-800 font-bold">
                  Exam Eligibility / Defaulter Attendance Threshold (%)
                </label>
                <div className="flex items-center gap-3">
                  <input
                    type="number"
                    min={50}
                    max={100}
                    value={settings.defaulterThreshold}
                    onChange={(e) => setSettings({ ...settings, defaulterThreshold: parseInt(e.target.value, 10) || 75 })}
                    className="w-24 px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-sm font-bold font-mono focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                  />
                  <span className="text-slate-500 text-[11px]">
                    Students below this percentage will be flagged as Exam Defaulters.
                  </span>
                </div>
              </div>

              {/* Consecutive Absence Alert Threshold */}
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-2">
                <label className="block text-slate-800 font-bold">
                  Consecutive Absence Alert Threshold (Days)
                </label>
                <div className="flex items-center gap-3">
                  <input
                    type="number"
                    min={2}
                    max={10}
                    value={settings.consecutiveAbsenceThreshold}
                    onChange={(e) => setSettings({ ...settings, consecutiveAbsenceThreshold: parseInt(e.target.value, 10) || 3 })}
                    className="w-24 px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-sm font-bold font-mono focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                  />
                  <span className="text-slate-500 text-[11px]">
                    Triggers a high-priority warning flag on student roll call after continuous unexcused absences.
                  </span>
                </div>
              </div>

              {/* Short Leave Toggle */}
              <div className="flex items-center justify-between p-3.5 bg-slate-50 border border-slate-200 rounded-xl">
                <div>
                  <span className="font-bold text-slate-800 block">Enable Short Leave (SL) Status</span>
                  <span className="text-slate-400 text-[11px]">
                    Allows marking students who depart early (counts as 0.5 present credit)
                  </span>
                </div>
                <input
                  type="checkbox"
                  checked={settings.enableShortLeave}
                  onChange={(e) => setSettings({ ...settings, enableShortLeave: e.target.checked })}
                  className="w-4 h-4 accent-emerald-600 rounded cursor-pointer"
                />
              </div>

              {/* Working Days Selector */}
              <div className="space-y-2">
                <span className="font-bold text-slate-800 block">Designated Working Days</span>
                <div className="grid grid-cols-3 gap-2">
                  {allWeekdays.map(day => {
                    const isChecked = (settings.workingDays || []).includes(day)
                    return (
                      <label
                        key={day}
                        onClick={() => handleToggleWeekday(day)}
                        className={`p-2.5 rounded-xl border flex items-center gap-2 cursor-pointer transition-all ${
                          isChecked ? 'bg-emerald-50 border-emerald-300 text-emerald-900 font-bold' : 'bg-white border-slate-200 text-slate-600'
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => {}}
                          className="w-3.5 h-3.5 accent-emerald-600 rounded"
                        />
                        <span>{day}</span>
                      </label>
                    )
                  })}
                </div>
              </div>

              {/* Footer Save */}
              <div className="pt-2 border-t border-slate-100 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-xl font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl shadow-xs transition-colors"
                >
                  Save Settings
                </button>
              </div>
            </form>
          )}

          {activeSubTab === 'holidays' && (
            <div className="space-y-4">
              {/* Add New Holiday Form */}
              <form onSubmit={handleAddHoliday} className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl space-y-3">
                <span className="font-bold text-slate-800 block uppercase text-[10px]">Add Academic Holiday</span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <div>
                    <label className="text-[10px] text-slate-500 font-semibold block mb-0.5">Holiday Name</label>
                    <input
                      type="text"
                      placeholder="E.g., Eid ul Fitr, Kashmir Day"
                      value={newHolidayName}
                      onChange={(e) => setNewHolidayName(e.target.value)}
                      className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-semibold focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="text-[10px] text-slate-500 font-semibold block mb-0.5">Type</label>
                    <select
                      value={newHolidayType}
                      onChange={(e) => setNewHolidayType(e.target.value)}
                      className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-semibold focus:outline-none"
                    >
                      <option value="Gazetted">Gazetted Public Holiday</option>
                      <option value="Religious">Religious Festival</option>
                      <option value="Institutional">Institutional Holiday</option>
                      <option value="Emergency">Weather / Emergency Closure</option>
                    </select>
                  </div>
                </div>

                <div className="flex items-center gap-2 pt-1">
                  <label className="flex items-center gap-1.5 text-[11px] text-slate-600 cursor-pointer font-semibold">
                    <input
                      type="checkbox"
                      checked={isRange}
                      onChange={(e) => setIsRange(e.target.checked)}
                      className="w-3.5 h-3.5 accent-emerald-600 rounded"
                    />
                    <span>Date Range (Multiple days)</span>
                  </label>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <div>
                    <label className="text-[10px] text-slate-500 font-semibold block mb-0.5">
                      {isRange ? 'Start Date' : 'Date'}
                    </label>
                    <input
                      type="date"
                      value={newHolidayDate}
                      onChange={(e) => setNewHolidayDate(e.target.value)}
                      className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-bold font-mono focus:outline-none"
                    />
                  </div>

                  {isRange && (
                    <div>
                      <label className="text-[10px] text-slate-500 font-semibold block mb-0.5">End Date</label>
                      <input
                        type="date"
                        value={newHolidayEndDate}
                        onChange={(e) => setNewHolidayEndDate(e.target.value)}
                        className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-bold font-mono focus:outline-none"
                      />
                    </div>
                  )}
                </div>

                <div className="flex justify-end pt-1">
                  <button
                    type="submit"
                    disabled={!newHolidayName || !newHolidayDate}
                    className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-40 text-white font-bold rounded-lg transition-colors flex items-center gap-1"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add to Calendar</span>
                  </button>
                </div>
              </form>

              {/* Existing Holidays List */}
              <div className="space-y-2">
                <span className="font-bold text-slate-600 uppercase text-[10px] block">
                  Scheduled Holidays ({holidays.length})
                </span>

                {holidays.length === 0 ? (
                  <div className="p-6 text-center text-slate-400 bg-slate-50 rounded-xl border border-dashed border-slate-200">
                    No academic holidays added yet. Roll call will only observe regular weekly off-days.
                  </div>
                ) : (
                  <div className="space-y-1.5 max-h-48 overflow-y-auto">
                    {holidays.map(h => (
                      <div
                        key={h.id}
                        className="p-2.5 bg-white border border-slate-200 rounded-xl flex items-center justify-between gap-2 hover:bg-slate-50"
                      >
                        <div>
                          <strong className="block text-slate-800 text-xs">{h.name}</strong>
                          <span className="text-[11px] text-slate-400 font-mono">
                            {h.startDate && h.endDate
                              ? `${formatDateDDMMYYYY(h.startDate)} to ${formatDateDDMMYYYY(h.endDate)}`
                              : formatDateDDMMYYYY(h.date)}
                            {' '}• <span className="text-emerald-700 font-bold">{h.type}</span>
                          </span>
                        </div>

                        <button
                          type="button"
                          onClick={() => handleDeleteHoliday(h.id)}
                          className="p-1 text-slate-400 hover:text-rose-600 transition-colors"
                          title="Delete holiday"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default AttendanceSettingsModal
