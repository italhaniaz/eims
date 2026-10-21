import React, { useState } from 'react'
import { Network, Plus, Search, Edit2, Trash2, Building2, User } from 'lucide-react'
import { useAppData } from '../../../context/AppDataContext'
import Modal from '../../../components/common/Modal'

export const DepartmentsView = () => {
  const { departments, institutes, addItem, updateItem, deleteItem } = useAppData()
  const [searchTerm, setSearchTerm] = useState('')
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingDept, setEditingDept] = useState(null)

  const [formData, setFormData] = useState({
    name: '',
    code: '',
    instituteId: '',
    headName: '',
    studentsCount: 100
  })

  const openAddModal = () => {
    setEditingDept(null)
    setFormData({
      name: '',
      code: '',
      instituteId: institutes[0]?.id || '',
      headName: '',
      studentsCount: 100
    })
    setIsModalOpen(true)
  }

  const openEditModal = (dept) => {
    setEditingDept(dept)
    setFormData({
      name: dept.name,
      code: dept.code,
      instituteId: dept.instituteId || '',
      headName: dept.headName || '',
      studentsCount: dept.studentsCount || 100
    })
    setIsModalOpen(true)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!formData.name || !formData.code) return

    if (editingDept) {
      await updateItem('departments', editingDept.id, formData)
    } else {
      await addItem('departments', formData)
    }
    setIsModalOpen(false)
  }

  const handleDelete = async (id) => {
    if (window.confirm('Delete this department?')) {
      await deleteItem('departments', id)
    }
  }

  const filteredDepts = departments.filter(dept =>
    dept.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    dept.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (dept.headName && dept.headName.toLowerCase().includes(searchTerm.toLowerCase()))
  )

  return (
    <div className="p-6 md:p-8 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Network className="w-5 h-5 text-blue-600" />
            <h1 className="text-xl font-bold text-slate-900 tracking-tight">Academic Departments</h1>
          </div>
          <p className="text-xs text-slate-500 mt-1">Manage faculties, subjects divisions, and department heads</p>
        </div>

        <button
          onClick={openAddModal}
          className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium shadow-sm transition-all"
        >
          <Plus className="w-4 h-4" />
          <span>Add New Department</span>
        </button>
      </div>

      {/* Search */}
      <div className="bg-white p-4 rounded-xl border border-slate-100 shadow-sm flex items-center justify-between gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search department name or head..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-sm rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
          />
        </div>
        <span className="text-xs text-slate-400 font-medium">Total: {filteredDepts.length} departments</span>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredDepts.map((dept) => {
          const inst = institutes.find(i => i.id === dept.instituteId)
          return (
            <div key={dept.id} className="bg-white rounded-xl p-5 border border-slate-100 shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between">
              <div>
                <div className="flex items-start justify-between">
                  <div className="w-9 h-9 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold text-xs uppercase">
                    {dept.code}
                  </div>
                  <span className="text-xs font-mono px-2 py-0.5 bg-slate-100 text-slate-600 rounded">
                    {dept.code}
                  </span>
                </div>

                <h3 className="text-base font-bold text-slate-800 mt-3">{dept.name}</h3>

                <div className="mt-4 pt-3 border-t border-slate-50 space-y-2 text-xs text-slate-600">
                  <div className="flex items-center gap-2">
                    <User className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span>Head: <strong className="text-slate-700">{dept.headName || 'Not Assigned'}</strong></span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Building2 className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span className="truncate">{inst ? inst.name : 'Central High School'}</span>
                  </div>
                </div>
              </div>

              <div className="mt-5 pt-3 border-t border-slate-100 flex items-center justify-between">
                <span className="text-xs font-medium text-slate-500">
                  {dept.studentsCount || 250}+ Students
                </span>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => openEditModal(dept)}
                    className="p-1.5 text-slate-400 hover:text-blue-600 rounded hover:bg-blue-50 transition-colors"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(dept.id)}
                    className="p-1.5 text-slate-400 hover:text-rose-600 rounded hover:bg-rose-50 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {/* Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingDept ? 'Edit Department' : 'Add New Department'}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-600 uppercase mb-1">Department Name</label>
            <input
              type="text"
              required
              placeholder="e.g. Department of Computer Science"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-3.5 py-2.5 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-sm"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-600 uppercase mb-1">Code</label>
              <input
                type="text"
                required
                placeholder="e.g. DCS"
                value={formData.code}
                onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                className="w-full px-3.5 py-2.5 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-sm font-mono uppercase"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-600 uppercase mb-1">Head of Dept (HOD)</label>
              <input
                type="text"
                placeholder="e.g. Engr. Imran Khan"
                value={formData.headName}
                onChange={(e) => setFormData({ ...formData, headName: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-sm"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-600 uppercase mb-1">Affiliated Institute</label>
            <select
              value={formData.instituteId}
              onChange={(e) => setFormData({ ...formData, instituteId: e.target.value })}
              className="w-full px-3.5 py-2.5 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-sm bg-white"
            >
              {institutes.map(i => (
                <option key={i.id} value={i.id}>{i.name} ({i.code})</option>
              ))}
            </select>
          </div>

          <div className="flex justify-end gap-3 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-sm transition-colors"
            >
              {editingDept ? 'Save Changes' : 'Create Department'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  )
}

export default DepartmentsView
