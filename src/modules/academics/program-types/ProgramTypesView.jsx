import React, { useState } from 'react'
import { Layers, Plus, Search, Edit2, Trash2 } from 'lucide-react'
import { useAppData } from '../../../context/AppDataContext'
import Modal from '../../../components/common/Modal'

export const ProgramTypesView = () => {
  const { programTypes, addItem, updateItem, deleteItem } = useAppData()
  const [searchTerm, setSearchTerm] = useState('')
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingType, setEditingType] = useState(null)

  const [formData, setFormData] = useState({
    name: '',
    code: '',
    durationYears: 2,
    level: 'Secondary'
  })

  const openAddModal = () => {
    setEditingType(null)
    setFormData({ name: '', code: '', durationYears: 2, level: 'Secondary' })
    setIsModalOpen(true)
  }

  const openEditModal = (t) => {
    setEditingType(t)
    setFormData({
      name: t.name,
      code: t.code,
      durationYears: t.durationYears || 2,
      level: t.level || 'Secondary'
    })
    setIsModalOpen(true)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!formData.name || !formData.code) return

    if (editingType) {
      await updateItem('programTypes', editingType.id, formData)
    } else {
      await addItem('programTypes', formData)
    }
    setIsModalOpen(false)
  }

  const handleDelete = async (id) => {
    if (window.confirm('Delete this program type?')) {
      await deleteItem('programTypes', id)
    }
  }

  const filtered = programTypes.filter(t =>
    t.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    t.code.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <div className="p-6 md:p-8 space-y-6 max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Layers className="w-5 h-5 text-blue-600" />
            <h1 className="text-xl font-bold text-slate-900 tracking-tight">Program Types</h1>
          </div>
          <p className="text-xs text-slate-500 mt-1">Configure degree levels: Secondary, Higher Secondary, Cambridge O/A Levels</p>
        </div>

        <button
          onClick={openAddModal}
          className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium shadow-sm transition-all"
        >
          <Plus className="w-4 h-4" />
          <span>Add Program Type</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
        {filtered.map(t => (
          <div key={t.id} className="bg-white rounded-xl p-5 border border-slate-100 shadow-sm flex flex-col justify-between">
            <div>
              <span className="font-mono text-xs px-2 py-0.5 bg-blue-50 text-blue-700 font-bold rounded">
                {t.code}
              </span>
              <h3 className="text-base font-bold text-slate-800 mt-3">{t.name}</h3>
              <p className="text-xs text-slate-400 mt-1">Standard Duration: {t.durationYears} Years</p>
            </div>
            <div className="mt-4 pt-3 border-t border-slate-50 flex items-center justify-between">
              <span className="text-[11px] text-slate-500 uppercase font-medium">{t.level}</span>
              <div className="flex gap-1">
                <button onClick={() => openEditModal(t)} className="p-1 text-slate-400 hover:text-blue-600">
                  <Edit2 className="w-4 h-4" />
                </button>
                <button onClick={() => handleDelete(t.id)} className="p-1 text-slate-400 hover:text-rose-600">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingType ? 'Edit Program Type' : 'Add Program Type'}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-600 uppercase mb-1">Type Name</label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-3.5 py-2.5 rounded-lg border border-slate-200 text-sm"
              placeholder="e.g. Higher Secondary Certificate"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-600 uppercase mb-1">Code</label>
              <input
                type="text"
                required
                value={formData.code}
                onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                className="w-full px-3.5 py-2.5 rounded-lg border border-slate-200 text-sm font-mono uppercase"
                placeholder="e.g. HSSC"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-600 uppercase mb-1">Duration (Years)</label>
              <input
                type="number"
                min="1"
                max="5"
                value={formData.durationYears}
                onChange={(e) => setFormData({ ...formData, durationYears: Number(e.target.value) })}
                className="w-full px-3.5 py-2.5 rounded-lg border border-slate-200 text-sm"
              />
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

export default ProgramTypesView
