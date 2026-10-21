import React, { useState } from 'react'
import { BookOpen, Plus, Search, Edit2, Trash2 } from 'lucide-react'
import { useAppData } from '../../../context/AppDataContext'
import Modal from '../../../components/common/Modal'

export const ProgramsView = () => {
  const { programs, programTypes, departments, addItem, updateItem, deleteItem } = useAppData()
  const [searchTerm, setSearchTerm] = useState('')
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingProg, setEditingProg] = useState(null)

  const [formData, setFormData] = useState({
    name: '',
    code: '',
    programTypeId: '',
    departmentId: '',
    duration: '2 Years'
  })

  const openAddModal = () => {
    setEditingProg(null)
    setFormData({
      name: '',
      code: '',
      programTypeId: programTypes[0]?.id || '',
      departmentId: departments[0]?.id || '',
      duration: '2 Years'
    })
    setIsModalOpen(true)
  }

  const openEditModal = (p) => {
    setEditingProg(p)
    setFormData({
      name: p.name,
      code: p.code,
      programTypeId: p.programTypeId || '',
      departmentId: p.departmentId || '',
      duration: p.duration || '2 Years'
    })
    setIsModalOpen(true)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!formData.name || !formData.code) return

    if (editingProg) {
      await updateItem('programs', editingProg.id, formData)
    } else {
      await addItem('programs', formData)
    }
    setIsModalOpen(false)
  }

  const handleDelete = async (id) => {
    if (window.confirm('Delete this academic program?')) {
      await deleteItem('programs', id)
    }
  }

  const filtered = programs.filter(p =>
    p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.code.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <div className="p-6 md:p-8 space-y-6 max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-blue-600" />
            <h1 className="text-xl font-bold text-slate-900 tracking-tight">Academic Programs</h1>
          </div>
          <p className="text-xs text-slate-500 mt-1">Manage curricular streams: Pre-Medical, Pre-Engineering, ICS, Commerce</p>
        </div>

        <button
          onClick={openAddModal}
          className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium shadow-sm transition-all"
        >
          <Plus className="w-4 h-4" />
          <span>Add New Program</span>
        </button>
      </div>

      <div className="bg-white rounded-xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex items-center justify-between">
          <div className="relative w-full max-w-md">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search programs..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-sm rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
            />
          </div>
        </div>

        <table className="w-full text-left text-sm">
          <thead className="bg-slate-50 text-slate-500 text-xs uppercase font-semibold border-b">
            <tr>
              <th className="px-6 py-4">Program Name</th>
              <th className="px-6 py-4">Code</th>
              <th className="px-6 py-4">Program Level</th>
              <th className="px-6 py-4">Duration</th>
              <th className="px-6 py-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filtered.map(p => {
              const type = programTypes.find(t => t.id === p.programTypeId)
              return (
                <tr key={p.id} className="hover:bg-slate-50/70">
                  <td className="px-6 py-4 font-bold text-slate-800">{p.name}</td>
                  <td className="px-6 py-4 font-mono text-xs text-slate-600">
                    <span className="px-2 py-0.5 bg-slate-100 rounded">{p.code}</span>
                  </td>
                  <td className="px-6 py-4 text-xs font-medium text-blue-600">{type?.name || 'Higher Secondary'}</td>
                  <td className="px-6 py-4 text-xs text-slate-600">{p.duration || '2 Years'}</td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button onClick={() => openEditModal(p)} className="p-1.5 text-slate-400 hover:text-blue-600">
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button onClick={() => handleDelete(p.id)} className="p-1.5 text-slate-400 hover:text-rose-600">
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
        title={editingProg ? 'Edit Program' : 'Add New Program'}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-600 uppercase mb-1">Program Title</label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-3.5 py-2.5 rounded-lg border border-slate-200 text-sm"
              placeholder="e.g. F.Sc Pre-Engineering"
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
                placeholder="e.g. FSC-PE"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-600 uppercase mb-1">Program Type</label>
              <select
                value={formData.programTypeId}
                onChange={(e) => setFormData({ ...formData, programTypeId: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-lg border border-slate-200 text-sm bg-white"
              >
                {programTypes.map(t => (
                  <option key={t.id} value={t.id}>{t.name}</option>
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

export default ProgramsView
