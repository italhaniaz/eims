import React, { useState } from 'react'
import { 
  Building2, 
  Plus, 
  Search, 
  Edit2, 
  Trash2, 
  ExternalLink, 
  MapPin, 
  Mail, 
  Phone, 
  Eye, 
  School,
  Award,
  Users
} from 'lucide-react'
import { useAppData } from '../../../context/AppDataContext'
import Modal from '../../../components/common/Modal'

export const InstitutesView = () => {
  const { institutes, examinationBodies, addItem, updateItem, deleteItem } = useAppData()
  const [searchTerm, setSearchTerm] = useState('')
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingInstitute, setEditingInstitute] = useState(null)
  const [viewingDetails, setViewingDetails] = useState(null)

  const [formData, setFormData] = useState({
    name: '',
    code: '',
    city: '',
    province: 'Punjab',
    principal: '',
    email: '',
    phone: '',
    address: '',
    affiliatedBoard: 'BISE Lahore',
    status: 'Active'
  })

  const openAddModal = () => {
    setEditingInstitute(null)
    setFormData({
      name: '',
      code: `SCH-${Math.floor(100 + Math.random() * 900)}`,
      city: 'Lahore',
      province: 'Punjab',
      principal: '',
      email: '',
      phone: '',
      address: '',
      affiliatedBoard: examinationBodies[0]?.code || 'BISE Lahore',
      status: 'Active'
    })
    setIsModalOpen(true)
  }

  const openEditModal = (inst) => {
    setEditingInstitute(inst)
    setFormData({
      name: inst.name,
      code: inst.code,
      city: inst.city || inst.districtName || 'Lahore',
      province: inst.province || inst.divisionName || 'Punjab',
      principal: inst.principal || '',
      email: inst.email || '',
      phone: inst.phone || '',
      address: inst.address || '',
      affiliatedBoard: inst.affiliatedBoard || 'BISE Lahore',
      status: inst.status || 'Active'
    })
    setIsModalOpen(true)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!formData.name || !formData.code) return

    const payload = {
      ...formData,
      totalStudents: editingInstitute?.totalStudents || 0,
      totalTeachers: editingInstitute?.totalTeachers || 0
    }

    if (editingInstitute) {
      await updateItem('institutes', editingInstitute.id, payload)
    } else {
      await addItem('institutes', payload)
    }
    setIsModalOpen(false)
  }

  const handleDelete = async (id) => {
    if (window.confirm('Delete this registered institute?')) {
      await deleteItem('institutes', id)
    }
  }

  const filteredInstitutes = institutes.filter(inst =>
    inst.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    inst.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
    ((inst.city || inst.address) && (inst.city || inst.address).toLowerCase().includes(searchTerm.toLowerCase()))
  )

  return (
    <div className="p-4 sm:p-6 md:p-8 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Building2 className="w-5 h-5 text-blue-600" />
            <h1 className="text-xl font-bold text-slate-900 tracking-tight">Institutes Management</h1>
          </div>
          <p className="text-xs text-slate-500 mt-1">Register, configure, and oversee campuses and school branches</p>
        </div>

        <button
          onClick={openAddModal}
          className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-semibold shadow-sm transition-all"
        >
          <Plus className="w-4 h-4" />
          <span>Register New Institute</span>
        </button>
      </div>

      {/* Search Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-100 shadow-sm flex items-center justify-between gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search institute name, code, or city..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-sm rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
          />
        </div>
        <span className="text-xs text-slate-500 font-semibold bg-blue-50 text-blue-700 px-3 py-1.5 rounded-lg whitespace-nowrap">
          Total: {institutes.length}
        </span>
      </div>

      {/* Institutes Cards Grid */}
      {filteredInstitutes.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredInstitutes.map((inst) => (
            <div 
              key={inst.id} 
              className="bg-white rounded-2xl border border-slate-100 shadow-sm hover:shadow-lg transition-all flex flex-col justify-between overflow-hidden"
            >
              <div className="p-6">
                <div className="flex items-start justify-between">
                  <div className="w-11 h-11 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold text-base shadow-sm">
                    <School className="w-6 h-6" />
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="font-mono text-xs font-semibold px-2 py-0.5 bg-slate-100 text-slate-600 rounded">
                      {inst.code}
                    </span>
                    <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-600 border border-emerald-100">
                      {inst.status || 'Active'}
                    </span>
                  </div>
                </div>

                <h3 className="text-base font-bold text-slate-900 mt-4 leading-snug">{inst.name}</h3>
                <p className="text-xs text-slate-500 mt-1 flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  <span className="truncate">{inst.address || `${inst.city || 'City'}, ${inst.province || 'Punjab'}`}</span>
                </p>

                {/* Institute Quick Details */}
                <div className="mt-4 pt-4 border-t border-slate-100 space-y-2 text-xs text-slate-600">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">Head / Principal:</span>
                    <span className="font-medium text-slate-700">{inst.principal || 'In-Charge Principal'}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">Affiliation:</span>
                    <span className="font-medium text-purple-700 bg-purple-50 px-2 py-0.5 rounded text-[11px]">{inst.affiliatedBoard || 'Board Affiliated'}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">Official Email:</span>
                    <span className="font-medium text-blue-600 truncate max-w-[170px]">{inst.email || 'info@sms.edu'}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">Phone:</span>
                    <span className="font-medium text-slate-700">{inst.phone || '—'}</span>
                  </div>
                </div>

                {/* Stats badges */}
                <div className="mt-4 grid grid-cols-2 gap-2 pt-3 border-t border-slate-100">
                  <div className="bg-slate-50 p-2 rounded-lg text-center">
                    <span className="block text-[11px] text-slate-400">Students</span>
                    <span className="text-sm font-bold text-slate-800">{inst.totalStudents || 0}</span>
                  </div>
                  <div className="bg-slate-50 p-2 rounded-lg text-center">
                    <span className="block text-[11px] text-slate-400">Faculty</span>
                    <span className="text-sm font-bold text-slate-800">{inst.totalTeachers || 0}</span>
                  </div>
                </div>
              </div>

              {/* Card Actions */}
              <div className="p-4 bg-slate-50/70 border-t border-slate-100 flex items-center justify-between">
                <button
                  onClick={() => setViewingDetails(inst)}
                  className="flex items-center gap-1.5 text-xs font-semibold text-blue-600 hover:text-blue-800 transition-colors"
                  title="View campus details and profile"
                >
                  <Eye className="w-3.5 h-3.5" />
                  <span>View Campus Profile</span>
                </button>

                <div className="flex items-center gap-1">
                  <button
                    onClick={() => openEditModal(inst)}
                    className="p-1.5 text-slate-400 hover:text-blue-600 rounded hover:bg-white transition-colors"
                    title="Edit"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(inst.id)}
                    className="p-1.5 text-slate-400 hover:text-rose-600 rounded hover:bg-white transition-colors"
                    title="Delete"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-slate-100 p-12 text-center shadow-sm">
          <Building2 className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h3 className="text-base font-bold text-slate-700">0 Institutes Registered</h3>
          <p className="text-xs text-slate-400 max-w-sm mx-auto mt-1">
            No institutes registered yet. Click the button below to add your first school or campus.
          </p>
          <button
            onClick={openAddModal}
            className="mt-4 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold shadow transition-all inline-flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            <span>Register First Institute</span>
          </button>
        </div>
      )}

      {/* Add / Edit Institute Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingInstitute ? 'Edit Institute Information' : 'Register New Institute'}
        maxWidth="max-w-2xl"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-600 uppercase mb-1">Institute Full Name</label>
              <input
                type="text"
                required
                placeholder="e.g. Beaconhouse Central High School"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-600 uppercase mb-1">Code / Registration No</label>
              <input
                type="text"
                required
                placeholder="e.g. BHS-001"
                value={formData.code}
                onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                className="w-full px-3.5 py-2.5 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-sm font-mono uppercase"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-600 uppercase mb-1">City / Location</label>
              <input
                type="text"
                required
                placeholder="e.g. Lahore / Rawalpindi / Islamabad"
                value={formData.city}
                onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-600 uppercase mb-1">Province / State</label>
              <select
                value={formData.province}
                onChange={(e) => setFormData({ ...formData, province: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-sm bg-white"
              >
                <option value="Punjab">Punjab</option>
                <option value="Sindh">Sindh</option>
                <option value="Khyber Pakhtunkhwa">Khyber Pakhtunkhwa</option>
                <option value="Balochistan">Balochistan</option>
                <option value="Islamabad Capital">Islamabad Capital</option>
                <option value="Gilgit-Baltistan / AJK">Gilgit-Baltistan / AJK</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-600 uppercase mb-1">Principal / Campus In-Charge</label>
              <input
                type="text"
                placeholder="e.g. Dr. Shahida Parveen"
                value={formData.principal}
                onChange={(e) => setFormData({ ...formData, principal: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-600 uppercase mb-1">Affiliated Examination Board</label>
              <select
                value={formData.affiliatedBoard}
                onChange={(e) => setFormData({ ...formData, affiliatedBoard: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-sm bg-white"
              >
                <option value="BISE Lahore">BISE Lahore</option>
                <option value="BISE Rawalpindi">BISE Rawalpindi</option>
                <option value="FBISE Federal Board">FBISE Federal Board</option>
                <option value="Cambridge Assessment (CAIE)">Cambridge Assessment (CAIE)</option>
                <option value="International Baccalaureate (IB)">International Baccalaureate (IB)</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-600 uppercase mb-1">Official Email</label>
              <input
                type="email"
                placeholder="e.g. info@beaconhouse.edu"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-600 uppercase mb-1">Phone Number</label>
              <input
                type="text"
                placeholder="+92 42 35789012"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-sm"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-600 uppercase mb-1">Campus Full Street Address</label>
            <input
              type="text"
              placeholder="e.g. Gulberg III, Main Boulevard, Lahore"
              value={formData.address}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
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
              {editingInstitute ? 'Save Institute' : 'Register Institute'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Details Modal */}
      {viewingDetails && (
        <Modal
          isOpen={Boolean(viewingDetails)}
          onClose={() => setViewingDetails(null)}
          title={`Campus Details: ${viewingDetails.name}`}
        >
          <div className="space-y-4 text-xs">
            <div className="flex items-center justify-between pb-3 border-b">
              <span className="font-semibold text-slate-400 uppercase">Registration Code</span>
              <span className="font-mono text-sm font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded">{viewingDetails.code}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="font-semibold text-slate-400 uppercase">Head / Principal</span>
              <span className="font-bold text-slate-800 text-sm">{viewingDetails.principal || 'In-Charge Principal'}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="font-semibold text-slate-400 uppercase">Affiliated Board</span>
              <span className="font-bold text-purple-700">{viewingDetails.affiliatedBoard || 'Board Affiliated'}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="font-semibold text-slate-400 uppercase">City / Province</span>
              <span className="font-medium text-slate-700">{viewingDetails.city || 'City'}, {viewingDetails.province || 'Punjab'}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="font-semibold text-slate-400 uppercase">Official Email</span>
              <span className="font-medium text-blue-600">{viewingDetails.email || '—'}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="font-semibold text-slate-400 uppercase">Phone</span>
              <span className="font-medium text-slate-700">{viewingDetails.phone || '—'}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="font-semibold text-slate-400 uppercase">Campus Location</span>
              <span className="font-medium text-slate-700 max-w-[220px] text-right">{viewingDetails.address || 'Campus Location'}</span>
            </div>

            <div className="pt-4 border-t flex justify-end">
              <button
                onClick={() => setViewingDetails(null)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg font-semibold"
              >
                Close
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  )
}

export default InstitutesView
