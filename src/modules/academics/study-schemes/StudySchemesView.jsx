import React, { useState } from 'react'
import { FileText, Plus, Search, Edit2, Trash2, CheckCircle2 } from 'lucide-react'
import { useAppData } from '../../../context/AppDataContext'
import Modal from '../../../components/common/Modal'

export const StudySchemesView = () => {
  const { studySchemes, programs, academicYears, addItem, updateItem, deleteItem } = useAppData()
  const [searchTerm, setSearchTerm] = useState('')
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingScheme, setEditingScheme] = useState(null)

  const [formData, setFormData] = useState({
    name: '',
    programId: '',
    academicYearId: '',
    totalSemesters: 4,
    status: 'Active'
  })

  const openAddModal = () => {
    setEditingScheme(null)
    setFormData({
      name: '',
      programId: programs[0]?.id || '',
      academicYearId: academicYears[0]?.id || '',
      totalSemesters: 4,
      status: 'Active'
    })
    setIsModalOpen(true)
  }

  const openEditModal = (sc) => {
    setEditingScheme(sc)
    setFormData({
      name: sc.name,
      programId: sc.programId || '',
      academicYearId: sc.academicYearId || '',
      totalSemesters: sc.totalSemesters || 4,
      status: sc.status || 'Active'
    })
    setIsModalOpen(true)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!formData.name) return

    if (editingScheme) {
      await updateItem('studySchemes', editingScheme.id, formData)
    } else {
      await addItem('studySchemes', formData)
    }
    setIsModalOpen(false)
  }

  const handleDelete = async (id) => {
    if (window.confirm('Delete this study scheme?')) {
      await deleteItem('studySchemes', id)
    }
  }

  const filtered = studySchemes.filter(sc =>
    sc.name.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <div className="p-6 md:p-8 space-y-6 max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <FileText className="w-5 h-5 text-blue-600" />
            <h1 className="text-xl font-bold text-slate-900 tracking-tight">Study Schemes</h1>
          </div>
          <p className="text-xs text-slate-500 mt-1">Configure syllabus structures, semester plans, and credit distribution</p>
        </div>

        <button
          onClick={openAddModal}
          className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium shadow-sm transition-all"
        >
          <Plus className="w-4 h-4" />
          <span>Add Study Scheme</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filtered.map(sc => {
          const prog = programs.find(p => p.id === sc.programId)
          const year = academicYears.find(y => y.id === sc.academicYearId)
          return (
            <div key={sc.id} className="bg-white rounded-xl p-5 border border-slate-100 shadow-sm flex flex-col justify-between">
              <div>
                <div className="flex items-start justify-between">
                  <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-emerald-50 text-emerald-600 border border-emerald-100">
                    {sc.status || 'Active'}
                  </span>
                  <span className="text-xs font-semibold text-slate-500">{sc.totalSemesters || 4} Semesters</span>
                </div>
                <h3 className="text-base font-bold text-slate-800 mt-3">{sc.name}</h3>
                <div className="mt-4 pt-3 border-t border-slate-50 space-y-1.5 text-xs text-slate-600">
                  <p>Program: <strong className="text-slate-800">{prog?.name || 'Pre-Medical'}</strong></p>
                  <p>Academic Session: <strong className="text-blue-600">{year?.name || '2025 - 2026'}</strong></p>
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
                <button onClick={() => openEditModal(sc)} className="p-1.5 text-slate-400 hover:text-blue-600">
                  <Edit2 className="w-4 h-4" />
                </button>
                <button onClick={() => handleDelete(sc.id)} className="p-1.5 text-slate-400 hover:text-rose-600">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          )
        })}
      </div>

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingScheme ? 'Edit Study Scheme' : 'Add Study Scheme'}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-600 uppercase mb-1">Scheme Title</label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-3.5 py-2.5 rounded-lg border border-slate-200 text-sm"
              placeholder="e.g. ICS Computer Curriculum 2025-26"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-600 uppercase mb-1">Academic Session</label>
              <select
                value={formData.academicYearId}
                onChange={(e) => setFormData({ ...formData, academicYearId: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-lg border border-slate-200 text-sm bg-white"
              >
                {academicYears.map(y => (
                  <option key={y.id} value={y.id}>{y.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-600 uppercase mb-1">Program</label>
              <select
                value={formData.programId}
                onChange={(e) => setFormData({ ...formData, programId: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-lg border border-slate-200 text-sm bg-white"
              >
                {programs.map(p => (
                  <option key={p.id} value={p.id}>{p.name}</option>
                ))}
              </select>
            </div>
          </div>
          <div className="flex justify-end gap-3 pt-3 border-t">
            <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 text-sm text-slate-600">Cancel</button>
            <button type="submit" className="px-5 py-2 text-sm text-white bg-blue-600 rounded-lg">Save</button>
          </div>
        </form>
      </Modal>
    </div>
  )
}

export default StudySchemesView
