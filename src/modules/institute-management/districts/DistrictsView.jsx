import React, { useState } from 'react'
import { MapPin, Plus, Search, Edit2, Trash2, Building, Layers } from 'lucide-react'
import { useAppData } from '../../../context/AppDataContext'
import Modal from '../../../components/common/Modal'

export const DistrictsView = () => {
  const { districts, divisions, institutes, addItem, updateItem, deleteItem } = useAppData()
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedDivisionFilter, setSelectedDivisionFilter] = useState('ALL')
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingDistrict, setEditingDistrict] = useState(null)

  const [formData, setFormData] = useState({
    name: '',
    divisionId: '',
    divisionName: '',
    code: ''
  })

  const openAddModal = () => {
    setEditingDistrict(null)
    setFormData({
      name: '',
      divisionId: divisions[0]?.id || '',
      divisionName: divisions[0]?.name || '',
      code: `DIST-${Math.floor(10 + Math.random() * 90)}`
    })
    setIsModalOpen(true)
  }

  const openEditModal = (dist) => {
    setEditingDistrict(dist)
    setFormData({
      name: dist.name,
      divisionId: dist.divisionId || '',
      divisionName: dist.divisionName || '',
      code: dist.code || ''
    })
    setIsModalOpen(true)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!formData.name || !formData.code) return

    const selectedDiv = divisions.find(d => d.id === formData.divisionId)
    const payload = {
      ...formData,
      divisionName: selectedDiv ? selectedDiv.name : (formData.divisionName || 'General Division')
    }

    if (editingDistrict) {
      await updateItem('districts', editingDistrict.id, payload)
    } else {
      await addItem('districts', payload)
    }
    setIsModalOpen(false)
  }

  const handleDelete = async (id) => {
    if (window.confirm('Delete this district?')) {
      await deleteItem('districts', id)
    }
  }

  const filteredDistricts = districts.filter(dist => {
    const matchesSearch = dist.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (dist.code && dist.code.toLowerCase().includes(searchTerm.toLowerCase()))
    const matchesDiv = selectedDivisionFilter === 'ALL' || dist.divisionId === selectedDivisionFilter
    return matchesSearch && matchesDiv
  })

  return (
    <div className="p-6 md:p-8 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <MapPin className="w-5 h-5 text-blue-600" />
            <h1 className="text-xl font-bold text-slate-900 tracking-tight">Districts Management</h1>
          </div>
          <p className="text-xs text-slate-500 mt-1">Configure districts linked under administrative divisions</p>
        </div>

        <button
          onClick={openAddModal}
          className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium shadow-sm transition-all"
        >
          <Plus className="w-4 h-4" />
          <span>Add New District</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-100 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="relative flex-1 w-full max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search district name or code..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-sm rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
          />
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto">
          <span className="text-xs font-semibold text-slate-500 whitespace-nowrap">Filter Division:</span>
          <select
            value={selectedDivisionFilter}
            onChange={(e) => setSelectedDivisionFilter(e.target.value)}
            className="px-3 py-2 text-xs rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 bg-white"
          >
            <option value="ALL">All Divisions</option>
            {divisions.map(d => (
              <option key={d.id} value={d.id}>{d.name}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Districts Table */}
      <div className="bg-white rounded-xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 text-slate-500 text-xs uppercase font-semibold border-b border-slate-100">
              <tr>
                <th className="px-6 py-4">District Name</th>
                <th className="px-6 py-4">Code</th>
                <th className="px-6 py-4">Parent Division</th>
                <th className="px-6 py-4">Associated Institutes</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredDistricts.length > 0 ? (
                filteredDistricts.map((dist) => {
                  const linkedInstitutes = institutes.filter(i => i.districtId === dist.id || i.districtName === dist.name)
                  return (
                    <tr key={dist.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="px-6 py-4 font-semibold text-slate-800">
                        <div className="flex items-center gap-2">
                          <MapPin className="w-4 h-4 text-blue-500" />
                          <span>{dist.name}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="font-mono text-xs px-2 py-0.5 bg-slate-100 text-slate-600 rounded">
                          {dist.code}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-slate-600">
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-blue-50 text-blue-700 text-xs font-medium">
                          {dist.divisionName || 'General Division'}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-slate-600 text-xs font-medium">
                        <span className="text-slate-700 font-bold">{linkedInstitutes.length}</span> schools registered
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => openEditModal(dist)}
                            className="p-1.5 text-slate-400 hover:text-blue-600 rounded hover:bg-blue-50 transition-colors"
                            title="Edit"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(dist.id)}
                            className="p-1.5 text-slate-400 hover:text-rose-600 rounded hover:bg-rose-50 transition-colors"
                            title="Delete"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  )
                })
              ) : (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-slate-400">
                    <MapPin className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                    <p className="text-sm font-semibold text-slate-600">0 Districts Found</p>
                    <p className="text-xs text-slate-400 mt-1">Click the "Add New District" button to register a new district.</p>
                    <button
                      onClick={openAddModal}
                      className="mt-3 px-4 py-2 bg-blue-600 text-white rounded-lg text-xs font-semibold shadow hover:bg-blue-700"
                    >
                      Add First District Now
                    </button>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add / Edit District Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingDistrict ? 'Edit District' : 'Add New District'}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-600 uppercase mb-1">District Name</label>
            <input
              type="text"
              required
              placeholder="e.g. Kasur District"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-3.5 py-2.5 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-sm"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-600 uppercase mb-1">District Code</label>
            <input
              type="text"
              required
              placeholder="e.g. KSR-DIST"
              value={formData.code}
              onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
              className="w-full px-3.5 py-2.5 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-sm font-mono uppercase"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-600 uppercase mb-1">Parent Division</label>
            {divisions && divisions.length > 0 ? (
              <select
                value={formData.divisionId}
                onChange={(e) => setFormData({ ...formData, divisionId: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-sm bg-white"
              >
                {divisions.map(d => (
                  <option key={d.id} value={d.id}>{d.name} ({d.code})</option>
                ))}
              </select>
            ) : (
              <input
                type="text"
                placeholder="Division name..."
                value={formData.divisionName || ''}
                onChange={(e) => setFormData({ ...formData, divisionName: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-lg border border-slate-200 text-sm"
              />
            )}
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
              {editingDistrict ? 'Save Changes' : 'Create District'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  )
}

export default DistrictsView
