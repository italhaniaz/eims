// src/modules/institute-admin/exams/ExamTermsModal.jsx
import React, { useState } from 'react'
import { 
  Calendar, 
  Plus, 
  Trash2, 
  Edit3, 
  CheckCircle2, 
  Clock, 
  FileCheck, 
  X, 
  AlertCircle,
  Award
} from 'lucide-react'
import Modal from '../../../components/common/Modal'

export const ExamTermsModal = ({ 
  isOpen, 
  onClose, 
  terms = [], 
  onSaveTerms, 
  sessionsList = ['2026-2027']
}) => {
  const [editingId, setEditingId] = useState(null)
  const [formData, setFormData] = useState({
    name: '',
    session: sessionsList[0] || '2026-2027',
    startDate: '',
    endDate: '',
    weightage: 100,
    passingPct: 33,
    status: 'Scheduled', // 'Scheduled' | 'In Progress' | 'Grading' | 'Published'
    description: ''
  })
  const [error, setError] = useState('')

  const handleReset = () => {
    setEditingId(null)
    setFormData({
      name: '',
      session: sessionsList[0] || '2026-2027',
      startDate: '',
      endDate: '',
      weightage: 100,
      passingPct: 33,
      status: 'Scheduled',
      description: ''
    })
    setError('')
  }

  const handleEdit = (term) => {
    setEditingId(term.id)
    setFormData({
      name: term.name || '',
      session: term.session || sessionsList[0] || '2026-2027',
      startDate: term.startDate || '',
      endDate: term.endDate || '',
      weightage: term.weightage !== undefined ? term.weightage : 100,
      passingPct: term.passingPct !== undefined ? term.passingPct : 33,
      status: term.status || 'Scheduled',
      description: term.description || ''
    })
    setError('')
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!formData.name.trim()) {
      setError('Please provide a title for the examination term.')
      return
    }

    if (editingId) {
      const updated = terms.map(t => t.id === editingId ? { ...t, ...formData } : t)
      onSaveTerms(updated)
    } else {
      const newTerm = {
        id: `term-${Date.now()}`,
        ...formData
      }
      onSaveTerms([...terms, newTerm])
    }
    handleReset()
  }

  const handleDelete = (id, name) => {
    if (window.confirm(`Are you sure you want to remove examination term "${name}"? Existing transcripts will keep their term string.`)) {
      const updated = terms.filter(t => t.id !== id)
      onSaveTerms(updated)
      if (editingId === id) handleReset()
    }
  }

  const handleQuickPreset = (presetName, defaultWeight) => {
    setFormData(prev => ({
      ...prev,
      name: `${presetName} ${prev.session || '2026-2027'}`,
      weightage: defaultWeight
    }))
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Examination Terms & Assessment Cycles"
      maxWidth="max-w-3xl"
    >
      <div className="space-y-6">
        {/* Term Creation / Edit Form */}
        <form onSubmit={handleSubmit} className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-indigo-700 flex items-center gap-1.5">
              <Award className="w-4 h-4" />
              {editingId ? 'Edit Examination Term' : 'Configure New Examination Term'}
            </span>

            {/* Quick Presets */}
            {!editingId && (
              <div className="flex items-center gap-1 text-[11px]">
                <span className="text-slate-400 mr-1 hidden sm:inline">Presets:</span>
                <button
                  type="button"
                  onClick={() => handleQuickPreset('Mid-Term Examination', 30)}
                  className="px-2 py-0.5 rounded bg-white hover:bg-slate-200 text-slate-700 border border-slate-200 text-[10px] font-semibold cursor-pointer"
                >
                  Mid-Term (30%)
                </button>
                <button
                  type="button"
                  onClick={() => handleQuickPreset('Annual Final Examination', 70)}
                  className="px-2 py-0.5 rounded bg-white hover:bg-slate-200 text-slate-700 border border-slate-200 text-[10px] font-semibold cursor-pointer"
                >
                  Final Annual (70%)
                </button>
                <button
                  type="button"
                  onClick={() => handleQuickPreset('Pre-Board Send-Up Test', 100)}
                  className="px-2 py-0.5 rounded bg-white hover:bg-slate-200 text-slate-700 border border-slate-200 text-[10px] font-semibold cursor-pointer"
                >
                  Send-Up (100%)
                </button>
              </div>
            )}
          </div>

          {error && (
            <div className="p-2.5 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-slate-600 uppercase mb-1">
                Term Title *
              </label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="e.g. Mid-Term Examination 2026-2027"
                className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-600 uppercase mb-1">
                Academic Session
              </label>
              <select
                value={formData.session}
                onChange={(e) => setFormData({ ...formData, session: e.target.value })}
                className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 bg-white font-mono"
              >
                {sessionsList.map(s => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
            <div>
              <label className="block text-[11px] font-semibold text-slate-600 uppercase mb-1">
                Start Date
              </label>
              <input
                type="date"
                value={formData.startDate}
                onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                className="w-full px-2.5 py-1.5 rounded-lg border border-slate-300 bg-white"
              />
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-600 uppercase mb-1">
                End Date
              </label>
              <input
                type="date"
                value={formData.endDate}
                onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                className="w-full px-2.5 py-1.5 rounded-lg border border-slate-300 bg-white"
              />
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-600 uppercase mb-1">
                Weightage % in Year
              </label>
              <input
                type="number"
                min="1"
                max="100"
                value={formData.weightage}
                onChange={(e) => setFormData({ ...formData, weightage: Number(e.target.value) })}
                className="w-full px-2.5 py-1.5 rounded-lg border border-slate-300 bg-white font-mono"
              />
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-600 uppercase mb-1">
                Status
              </label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                className="w-full px-2.5 py-1.5 rounded-lg border border-slate-300 bg-white font-semibold"
              >
                <option value="Scheduled">Scheduled</option>
                <option value="In Progress">In Progress</option>
                <option value="Grading">Grading</option>
                <option value="Published">Published (Locked)</option>
              </select>
            </div>
          </div>

          <div className="flex justify-end items-center gap-2 pt-2 border-t border-slate-200">
            {editingId && (
              <button
                type="button"
                onClick={handleReset}
                className="px-3 py-1.5 text-xs font-semibold text-slate-600 hover:bg-slate-200 rounded-lg cursor-pointer"
              >
                Cancel Edit
              </button>
            )}
            <button
              type="submit"
              className="px-4 py-1.5 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-sm flex items-center gap-1.5 cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>{editingId ? 'Update Exam Term' : 'Save New Term'}</span>
            </button>
          </div>
        </form>

        {/* Existing Terms Table */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700">
              Configured Examination Terms ({terms.length})
            </h4>
            <span className="text-[11px] text-slate-400 font-mono">
              Changes apply instantly across date sheets and transcripts
            </span>
          </div>

          <div className="border border-slate-200 rounded-xl overflow-hidden bg-white shadow-2xs">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-200">
                <tr>
                  <th className="p-3">Term Title</th>
                  <th className="p-3">Session</th>
                  <th className="p-3">Schedule</th>
                  <th className="p-3 text-center">Weight</th>
                  <th className="p-3 text-center">Status</th>
                  <th className="p-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {terms.length > 0 ? (
                  terms.map(term => (
                    <tr key={term.id} className="hover:bg-slate-50 transition-colors">
                      <td className="p-3 font-bold text-slate-800">
                        {term.name}
                        {term.description && (
                          <span className="block text-[10px] text-slate-400 font-normal">{term.description}</span>
                        )}
                      </td>
                      <td className="p-3 font-mono text-slate-600">{term.session}</td>
                      <td className="p-3 text-slate-500 font-mono text-[11px]">
                        {term.startDate ? `${term.startDate} to ${term.endDate || '...'}` : 'Dates TBA'}
                      </td>
                      <td className="p-3 text-center font-mono font-bold text-slate-700">
                        {term.weightage}%
                      </td>
                      <td className="p-3 text-center">
                        <span className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          term.status === 'Published' 
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            : term.status === 'In Progress'
                            ? 'bg-amber-50 text-amber-700 border border-amber-200'
                            : term.status === 'Grading'
                            ? 'bg-purple-50 text-purple-700 border border-purple-200'
                            : 'bg-slate-100 text-slate-600 border border-slate-200'
                        }`}>
                          {term.status}
                        </span>
                      </td>
                      <td className="p-3 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            type="button"
                            onClick={() => handleEdit(term)}
                            className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg cursor-pointer"
                            title="Edit Term"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDelete(term.id, term.name)}
                            className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg cursor-pointer"
                            title="Delete Term"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={6} className="p-8 text-center text-slate-400">
                      <Award className="w-7 h-7 mx-auto text-slate-300 mb-1" />
                      <p className="font-semibold text-slate-600 text-xs">No Examination Terms Configured Yet</p>
                      <p className="text-[11px] text-slate-400 mt-0.5">
                        Click on quick presets above (Mid-Term or Final Annual) or create your custom assessment cycle.
                      </p>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        <div className="flex justify-end pt-2 border-t border-slate-100">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg cursor-pointer"
          >
            Done
          </button>
        </div>
      </div>
    </Modal>
  )
}

export default ExamTermsModal
