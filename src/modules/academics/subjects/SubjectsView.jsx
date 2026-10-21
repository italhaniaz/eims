import React, { useState } from 'react'
import { Bookmark, Plus, Search, Edit2, Trash2, BookOpen } from 'lucide-react'
import { useAppData } from '../../../context/AppDataContext'
import Modal from '../../../components/common/Modal'

export const SubjectsView = () => {
  const { subjects, programs, addItem, updateItem, deleteItem } = useAppData()
  const [searchTerm, setSearchTerm] = useState('')
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingSub, setEditingSub] = useState(null)

  const [formData, setFormData] = useState({
    name: '',
    code: '',
    credits: 4,
    programId: ''
  })

  const openAddModal = () => {
    setEditingSub(null)
    setFormData({
      name: '',
      code: '',
      credits: 4,
      programId: programs[0]?.id || ''
    })
    setIsModalOpen(true)
  }

  const openEditModal = (s) => {
    setEditingSub(s)
    setFormData({
      name: s.name,
      code: s.code,
      credits: s.credits || 4,
      programId: s.programId || ''
    })
    setIsModalOpen(true)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!formData.name || !formData.code) return

    if (editingSub) {
      await updateItem('subjects', editingSub.id, formData)
    } else {
      await addItem('subjects', formData)
    }
    setIsModalOpen(false)
  }

  const handleDelete = async (id) => {
    if (window.confirm('Delete this subject?')) {
      await deleteItem('subjects', id)
    }
  }

  const filtered = subjects.filter(s =>
    s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    s.code.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <div className="p-6 md:p-8 space-y-6 max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Bookmark className="w-5 h-5 text-blue-600" />
            <h1 className="text-xl font-bold text-slate-900 tracking-tight">Academic Subjects</h1>
          </div>
          <p className="text-xs text-slate-500 mt-1">Curriculum course directory, credit hours, and subject specifications</p>
        </div>

        <button
          onClick={openAddModal}
          className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium shadow-sm transition-all"
        >
          <Plus className="w-4 h-4" />
          <span>Add New Subject</span>
        </button>
      </div>

      <div className="bg-white rounded-xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex items-center justify-between">
          <div className="relative w-full max-w-md">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search subject by title or code..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-sm rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
            />
          </div>
        </div>

        <table className="w-full text-left text-sm">
          <thead className="bg-slate-50 text-slate-500 text-xs uppercase font-semibold border-b">
            <tr>
              <th className="px-6 py-4">Subject Title</th>
              <th className="px-6 py-4">Code</th>
              <th className="px-6 py-4">Credits</th>
              <th className="px-6 py-4">Program</th>
              <th className="px-6 py-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filtered.map(s => {
              const prog = programs.find(p => p.id === s.programId)
              return (
                <tr key={s.id} className="hover:bg-slate-50/70">
                  <td className="px-6 py-4 font-bold text-slate-800 flex items-center gap-2">
                    <Bookmark className="w-4 h-4 text-blue-500" />
                    <span>{s.name}</span>
                  </td>
                  <td className="px-6 py-4 font-mono text-xs text-slate-600">
                    <span className="px-2 py-0.5 bg-slate-100 rounded">{s.code}</span>
                  </td>
                  <td className="px-6 py-4 text-xs font-semibold text-slate-700">{s.credits} Cr.</td>
                  <td className="px-6 py-4 text-xs text-blue-600 font-medium">{prog?.name || 'All Programs'}</td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button onClick={() => openEditModal(s)} className="p-1.5 text-slate-400 hover:text-blue-600">
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button onClick={() => handleDelete(s.id)} className="p-1.5 text-slate-400 hover:text-rose-600">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingSub ? 'Edit Subject' : 'Add New Subject'}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-600 uppercase mb-1">Subject Name</label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-3.5 py-2.5 rounded-lg border border-slate-200 text-sm"
              placeholder="e.g. Physics (Mechanics & Waves)"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-600 uppercase mb-1">Subject Code</label>
              <input
                type="text"
                required
                value={formData.code}
                onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                className="w-full px-3.5 py-2.5 rounded-lg border border-slate-200 text-sm font-mono uppercase"
                placeholder="e.g. PHY-101"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-600 uppercase mb-1">Credits / Weightage</label>
              <input
                type="number"
                min="1"
                max="8"
                value={formData.credits}
                onChange={(e) => setFormData({ ...formData, credits: Number(e.target.value) })}
                className="w-full px-3.5 py-2.5 rounded-lg border border-slate-200 text-sm"
              />
            </div>
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-600 uppercase mb-1">Parent Program</label>
            <select
              value={formData.programId}
              onChange={(e) => setFormData({ ...formData, programId: e.target.value })}
              className="w-full px-3.5 py-2.5 rounded-lg border border-slate-200 text-sm bg-white"
            >
              {programs.map(p => (
                <option key={p.id} value={p.id}>{p.name} ({p.code})</option>
              ))}
            </select>
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

export default SubjectsView
