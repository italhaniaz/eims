// src/modules/institute-admin/exams/ExamGradingSettingsModal.jsx
import React, { useState } from 'react'
import { 
  Settings, 
  Check, 
  RotateCcw, 
  Sliders, 
  ShieldCheck, 
  Award,
  HelpCircle
} from 'lucide-react'
import Modal from '../../../components/common/Modal'
import { 
  DEFAULT_PERCENTAGE_BANDS, 
  DEFAULT_GPA_BANDS, 
  DEFAULT_CAMBRIDGE_BANDS 
} from './examService'

export const ExamGradingSettingsModal = ({
  isOpen,
  onClose,
  settings,
  onSaveSettings
}) => {
  const [formData, setFormData] = useState(() => ({
    scaleType: settings?.scaleType || 'percentage',
    passingPercentage: settings?.passingPercentage !== undefined ? settings?.passingPercentage : 33,
    allowGraceMarks: settings?.allowGraceMarks !== undefined ? settings?.allowGraceMarks : true,
    maxGraceMarks: settings?.maxGraceMarks !== undefined ? settings?.maxGraceMarks : 3,
    showRankOnDMC: settings?.showRankOnDMC !== undefined ? settings?.showRankOnDMC : true,
    showAttendanceOnDMC: settings?.showAttendanceOnDMC !== undefined ? settings?.showAttendanceOnDMC : true,
    bands: settings?.bands || DEFAULT_PERCENTAGE_BANDS
  }))

  const handleScaleChange = (newScale) => {
    let newBands = DEFAULT_PERCENTAGE_BANDS
    if (newScale === 'gpa4') newBands = DEFAULT_GPA_BANDS
    if (newScale === 'cambridge') newBands = DEFAULT_CAMBRIDGE_BANDS

    setFormData(prev => ({
      ...prev,
      scaleType: newScale,
      bands: newBands
    }))
  }

  const handleResetDefaults = () => {
    if (window.confirm('Reset all grading scales and assessment policies to standard factory defaults?')) {
      setFormData({
        scaleType: 'percentage',
        passingPercentage: 33,
        allowGraceMarks: true,
        maxGraceMarks: 3,
        showRankOnDMC: true,
        showAttendanceOnDMC: true,
        bands: DEFAULT_PERCENTAGE_BANDS
      })
    }
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    onSaveSettings(formData)
    onClose()
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Examination Grading Scale & Policy Settings"
      maxWidth="max-w-2xl"
    >
      <form onSubmit={handleSubmit} className="space-y-5 text-xs">
        {/* Scale Type Selector */}
        <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-3">
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
            Active Grading Scale Standard
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
            <button
              type="button"
              onClick={() => handleScaleChange('percentage')}
              className={`p-3 rounded-lg border text-left transition-all cursor-pointer ${
                formData.scaleType === 'percentage'
                  ? 'bg-indigo-50 border-indigo-500 text-indigo-900 font-bold shadow-2xs'
                  : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-100'
              }`}
            >
              <span className="block font-bold">Standard Percentage</span>
              <span className="text-[10px] text-slate-500 font-normal">A+, A, B, C, D, E, F (33% Pass)</span>
            </button>

            <button
              type="button"
              onClick={() => handleScaleChange('gpa4')}
              className={`p-3 rounded-lg border text-left transition-all cursor-pointer ${
                formData.scaleType === 'gpa4'
                  ? 'bg-indigo-50 border-indigo-500 text-indigo-900 font-bold shadow-2xs'
                  : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-100'
              }`}
            >
              <span className="block font-bold">GPA 4.0 Scale</span>
              <span className="text-[10px] text-slate-500 font-normal">College / Higher Ed (A=4.0)</span>
            </button>

            <button
              type="button"
              onClick={() => handleScaleChange('cambridge')}
              className={`p-3 rounded-lg border text-left transition-all cursor-pointer ${
                formData.scaleType === 'cambridge'
                  ? 'bg-indigo-50 border-indigo-500 text-indigo-900 font-bold shadow-2xs'
                  : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-100'
              }`}
            >
              <span className="block font-bold">Cambridge O/A Level</span>
              <span className="text-[10px] text-slate-500 font-normal">A*, A, B, C, D, E, U</span>
            </button>
          </div>
        </div>

        {/* Passing Threshold & Moderation Limits */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="p-3.5 bg-white rounded-xl border border-slate-200 space-y-1.5">
            <label className="block font-bold text-slate-700">Minimum Passing Percentage (%)</label>
            <p className="text-[11px] text-slate-500">Students scoring below this percentage are marked as Failed.</p>
            <input
              type="number"
              min="20"
              max="60"
              value={formData.passingPercentage}
              onChange={(e) => setFormData({ ...formData, passingPercentage: Number(e.target.value) })}
              className="w-24 px-3 py-1.5 font-mono font-bold text-sm border border-slate-300 rounded-lg bg-white"
            />
          </div>

          <div className="p-3.5 bg-white rounded-xl border border-slate-200 space-y-1.5">
            <label className="block font-bold text-slate-700">Max Allowable Grace Marks</label>
            <p className="text-[11px] text-slate-500">Maximum marks an exam controller may grant to pass borderline failures.</p>
            <input
              type="number"
              min="0"
              max="5"
              value={formData.maxGraceMarks}
              onChange={(e) => setFormData({ ...formData, maxGraceMarks: Number(e.target.value) })}
              className="w-24 px-3 py-1.5 font-mono font-bold text-sm border border-slate-300 rounded-lg bg-white"
            />
          </div>
        </div>

        {/* Display Toggles for Transcripts & DMCs */}
        <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
          <span className="font-bold uppercase tracking-wider text-[11px] text-slate-600 block">
            Transcript (DMC) Print Configuration
          </span>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
            <label className="flex items-center gap-2 p-2 bg-white rounded-lg border border-slate-200 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.showRankOnDMC}
                onChange={(e) => setFormData({ ...formData, showRankOnDMC: e.target.checked })}
                className="rounded text-indigo-600 focus:ring-indigo-500"
              />
              <span className="font-medium text-slate-700">Display Class Position / Rank on DMC</span>
            </label>

            <label className="flex items-center gap-2 p-2 bg-white rounded-lg border border-slate-200 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.showAttendanceOnDMC}
                onChange={(e) => setFormData({ ...formData, showAttendanceOnDMC: e.target.checked })}
                className="rounded text-indigo-600 focus:ring-indigo-500"
              />
              <span className="font-medium text-slate-700">Display Attendance Regularity on DMC</span>
            </label>
          </div>
        </div>

        {/* Active Scale Preview Table */}
        <div className="space-y-1.5">
          <span className="font-bold text-slate-700 uppercase tracking-wider text-[11px] block">
            Active Grading Scale Bands Preview
          </span>
          <div className="border border-slate-200 rounded-xl overflow-hidden bg-white shadow-2xs">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 font-semibold border-b">
                <tr>
                  <th className="p-2 text-center">Grade</th>
                  <th className="p-2 text-center">Min Score</th>
                  <th className="p-2 text-center">Max Score</th>
                  {formData.scaleType === 'gpa4' && <th className="p-2 text-center">GPA</th>}
                  <th className="p-2">Descriptor</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-mono text-[11px]">
                {formData.bands.map((b, idx) => (
                  <tr key={idx} className="hover:bg-slate-50">
                    <td className="p-2 text-center font-bold text-indigo-700">{b.grade}</td>
                    <td className="p-2 text-center text-slate-600">{b.min}%</td>
                    <td className="p-2 text-center text-slate-600">{b.max}%</td>
                    {formData.scaleType === 'gpa4' && (
                      <td className="p-2 text-center font-bold text-slate-800">{b.gpa?.toFixed(1)}</td>
                    )}
                    <td className="p-2 text-slate-600 font-sans">{b.description}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-between pt-3 border-t border-slate-200">
          <button
            type="button"
            onClick={handleResetDefaults}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs text-rose-600 hover:bg-rose-50 rounded-lg cursor-pointer font-medium"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Restore Factory Defaults</span>
          </button>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex items-center gap-1.5 px-5 py-2 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-sm cursor-pointer"
            >
              <Check className="w-3.5 h-3.5" />
              <span>Save & Apply Settings</span>
            </button>
          </div>
        </div>
      </form>
    </Modal>
  )
}

export default ExamGradingSettingsModal
