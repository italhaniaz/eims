import React, { useState } from 'react'
import { FolderTree, Plus, Search, Edit2, Trash2, CheckCircle2, MapPin } from 'lucide-react'
import { useAppData } from '../../../context/AppDataContext'
import Modal from '../../../components/common/Modal'

export const DivisionsView = () => {
  const { divisions, districts, addItem, updateItem, deleteItem } = useAppData()
  const [searchTerm, setSearchTerm] = useState('')
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingDivision, setEditingDivision] = useState(null)
  
  const [formData, setFormData] = useState({
    name: '',
    code: '',
    description: ''
  })

  const openAddModal = () => {
    setEditingDivision(null)
    setFormData({ name: '', code: '', description: '' })
    setIsModalOpen(true)
  }

  const openEditModal = (div) => {
    setEditingDivision(div)
    setFormData({ name: div.name, code: div.code, description: div.description || '' })
    setIsModalOpen(true)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!formData.name || !formData.code) return

    if (editingDivision) {
      await updateItem('divisions', editingDivision.id, formData)
    } else {
      await addItem('divisions', formData)
    }
    setIsModalOpen(false)
  }

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to remove this division?')) {
      await deleteItem('divisions', id)
    }
  }

  const filteredDivisions = divisions.filter(div => 
    div.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    div.code.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <div className="p-6 md:p-8 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <FolderTree className="w-5 h-5 text-blue-600" />
            <h1 className="text-xl font-bold text-slate-900 tracking-tight">Administrative Divisions</h1>
          </div>
          <p className="text-xs text-slate-500 mt-1">Manage state and provincial educational divisions</p>
        </div>

        <button
          onClick={openAddModal}
          className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium shadow-sm transition-all"
        >
          <Plus className="w-4 h-4" />
          <span>Add New Division</span>
        </button>
      </div>

      {/* Search Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-100 shadow-sm flex items-center justify-between gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search division name or code..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-sm rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
          />
        </div>
        <span className="text-xs text-slate-400 font-medium">Total: {filteredDivisions.length} divisions</span>
      </div>

      {/* Grid of Divisions */}
      {filteredDivisions.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredDivisions.map((div) => {
            const divisionDistricts = districts.filter(d => d.divisionId === div.id || d.divisionName === div.name)
            return (
              <div 
                key={div.id} 
                className="bg-white rounded-xl p-5 border border-slate-100 shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start justify-between">
                    <div className="w-9 h-9 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center font-bold text-sm">
                      {div.code.slice(0, 3)}
                    </div>
                    <span className="text-xs font-mono px-2 py-0.5 bg-slate-100 text-slate-600 rounded">
                      {div.code}
                    </span>
                  </div>

                  <h3 className="text-base font-bold text-slate-800 mt-3">{div.name}</h3>
                  <p className="text-xs text-slate-500 mt-1 line-clamp-2">
                    {div.description || 'Administrative educational regional authority zone'}
                  </p>

                  <div className="mt-4 pt-3 border-t border-slate-50 flex items-center justify-between text-xs text-slate-500">
                    <span className="flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5 text-blue-500" />
                      {divisionDistricts.length} Districts linked
                    </span>
                    <span className="text-slate-400 text-[11px]">Active</span>
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
                  <button
                    onClick={() => openEditModal(div)}
                    className="p-1.5 text-slate-400 hover:text-blue-600 rounded hover:bg-blue-50 transition-colors"
                    title="Edit Division"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(div.id)}
                    className="p-1.5 text-slate-400 hover:text-rose-600 rounded hover:bg-rose-50 transition-colors"
                    title="Delete Division"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-slate-100 p-12 text-center shadow-sm">
          <FolderTree className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h3 className="text-base font-bold text-slate-700">0 Divisions Registered</h3>
          <p className="text-xs text-slate-400 max-w-sm mx-auto mt-1">
            No administrative divisions registered yet. Click "Add New Division" to register your first regional division.
          </p>
          <button
            onClick={openAddModal}
            className="mt-4 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold shadow transition-all inline-flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            <span>Create First Division</span>
          </button>
        </div>
      )}

      {/* Add / Edit Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingDivision ? 'Edit Division' : 'Add New Division'}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-600 uppercase mb-1">Division Name</label>
            <input
              type="text"
              required
              placeholder="e.g. Lahore Division"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-3.5 py-2.5 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-sm"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-600 uppercase mb-1">Division Code</label>
            <input
              type="text"
              required
              placeholder="e.g. LHR-DIV"
              value={formData.code}
              onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
              className="w-full px-3.5 py-2.5 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-sm font-mono uppercase"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-600 uppercase mb-1">Description / Notes</label>
            <textarea
              rows={3}
              placeholder="Administrative details..."
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full px-3.5 py-2.5 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-sm"
            />
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
              {editingDivision ? 'Save Changes' : 'Create Division'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  )
}

export default DivisionsView
