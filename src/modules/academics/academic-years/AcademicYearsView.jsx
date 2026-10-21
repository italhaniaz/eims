import React, { useState } from 'react'
import { Calendar, Plus, Search, Edit2, Trash2, CheckCircle2 } from 'lucide-react'
import { useAppData } from '../../../context/AppDataContext'
import Modal from '../../../components/common/Modal'

export const AcademicYearsView = () => {
  const { academicYears, addItem, updateItem, deleteItem } = useAppData()
  const [searchTerm, setSearchTerm] = useState('')
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingYear, setEditingYear] = useState(null)

  const [formData, setFormData] = useState({
    name: '',
    startDate: '',
    endDate: '',
    isCurrent: false,
    status: 'Active'
  })

  const openAddModal = () => {
    setEditingYear(null)
    setFormData({
      name: '',
      startDate: '2026-08-15',
      endDate: '2027-06-30',
      isCurrent: false,
      status: 'Active'
    })
    setIsModalOpen(true)
  }

  const openEditModal = (yr) => {
    setEditingYear(yr)
    setFormData({
      name: yr.name,
      startDate: yr.startDate || '',
      endDate: yr.endDate || '',
      isCurrent: yr.isCurrent || false,
      status: yr.status || 'Active'
    })
    setIsModalOpen(true)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!formData.name) return

    if (editingYear) {
      await updateItem('academicYears', editingYear.id, formData)
    } else {
      await addItem('academicYears', formData)
    }
    setIsModalOpen(false)
  }

  const handleDelete = async (id) => {
    if (window.confirm('Delete this academic year?')) {
      await deleteItem('academicYears', id)
    }
  }

  const filteredYears = academicYears.filter(y =>
    y.name.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <div className="p-6 md:p-8 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Calendar className="w-5 h-5 text-blue-600" />
            <h1 className="text-xl font-bold text-slate-900 tracking-tight">Academic Years</h1>
          </div>
          <p className="text-xs text-slate-500 mt-1">Configure active school sessions and academic calendars</p>
        </div>

        <button
          onClick={openAddModal}
          className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium shadow-sm transition-all"
        >
          <Plus className="w-4 h-4" />
          <span>Add Academic Year</span>
        </button>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex items-center justify-between">
          <div className="relative w-full max-w-md">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search academic session..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-sm rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
            />
          </div>
        </div>

        <table className="w-full text-left text-sm">
          <thead className="bg-slate-50 text-slate-500 text-xs uppercase font-semibold border-b border-slate-100">
            <tr>
              <th className="px-6 py-4">Academic Session</th>
              <th className="px-6 py-4">Start Date</th>
              <th className="px-6 py-4">End Date</th>
              <th className="px-6 py-4">Status</th>
              <th className="px-6 py-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filteredYears.map((yr) => (
              <tr key={yr.id} className="hover:bg-slate-50/70 transition-colors">
                <td className="px-6 py-4 font-bold text-slate-800 flex items-center gap-2.5">
                  <Calendar className="w-4 h-4 text-blue-500" />
                  <span>{yr.name}</span>
                  {yr.isCurrent && (
                    <span className="text-[10px] uppercase font-bold px-2 py-0.5 bg-blue-600 text-white rounded-full">
                      Current Active
                    </span>
                  )}
                </td>
                <td className="px-6 py-4 text-slate-600 font-mono text-xs">{yr.startDate}</td>
                <td className="px-6 py-4 text-slate-600 font-mono text-xs">{yr.endDate}</td>
                <td className="px-6 py-4">
                  <span className={`text-xs font-semibold px-2.5 py-0.5 rounded-full ${
                    yr.isCurrent 
                      ? 'bg-emerald-50 text-emerald-600 border border-emerald-100'
                      : 'bg-slate-100 text-slate-600'
                  }`}>
                    {yr.status || (yr.isCurrent ? 'Active' : 'Completed')}
                  </span>
                </td>
                <td className="px-6 py-4 text-right">
                  <div className="flex items-center justify-end gap-2">
                    <button
                      onClick={() => openEditModal(yr)}
                      className="p-1.5 text-slate-400 hover:text-blue-600 rounded hover:bg-blue-50 transition-colors"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(yr.id)}
                      className="p-1.5 text-slate-400 hover:text-rose-600 rounded hover:bg-rose-50 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingYear ? 'Edit Academic Year' : 'Add Academic Year'}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-600 uppercase mb-1">Session Name / Range</label>
            <input
              type="text"
              required
              placeholder="e.g. 2026 - 2027"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-3.5 py-2.5 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-sm"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-600 uppercase mb-1">Start Date</label>
              <input
                type="date"
                required
                value={formData.startDate}
                onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-600 uppercase mb-1">End Date</label>
              <input
                type="date"
                required
                value={formData.endDate}
                onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-sm"
              />
            </div>
          </div>

          <div className="flex items-center gap-2 pt-2">
            <input
              type="checkbox"
              id="isCurrentYear"
              checked={formData.isCurrent}
              onChange={(e) => setFormData({ ...formData, isCurrent: e.target.checked })}
              className="w-4 h-4 text-blue-600 rounded border-slate-300"
            />
            <label htmlFor="isCurrentYear" className="text-xs font-medium text-slate-700 cursor-pointer">
              Set as current active academic session
            </label>
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
              Save
            </button>
          </div>
        </form>
      </Modal>
    </div>
  )
}

export default AcademicYearsView
