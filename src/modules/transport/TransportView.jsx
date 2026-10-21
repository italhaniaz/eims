import React, { useState } from 'react'
import { Bus, Plus, Search, Edit2, Trash2, MapPin, Phone, Users, CheckCircle2 } from 'lucide-react'
import { useAppData } from '../../context/AppDataContext'
import Modal from '../../components/common/Modal'

export const TransportView = () => {
  const { transport, addItem, updateItem, deleteItem } = useAppData()
  const [searchTerm, setSearchTerm] = useState('')
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingBus, setEditingBus] = useState(null)

  const [formData, setFormData] = useState({
    vehicleNo: '',
    busName: '',
    driverName: '',
    driverPhone: '',
    capacity: 35,
    assignedStudents: 0,
    routePath: '',
    status: 'Active'
  })

  const openAddModal = () => {
    setEditingBus(null)
    setFormData({
      vehicleNo: `LEA-${Math.floor(1000 + Math.random() * 9000)}`,
      busName: `Bus #${transport.length + 1} (Main Campus Route)`,
      driverName: '',
      driverPhone: '',
      capacity: 35,
      assignedStudents: 0,
      routePath: 'Campus -> Model Town -> Gulberg',
      status: 'Active'
    })
    setIsModalOpen(true)
  }

  const openEditModal = (b) => {
    setEditingBus(b)
    setFormData({
      vehicleNo: b.vehicleNo,
      busName: b.busName,
      driverName: b.driverName,
      driverPhone: b.driverPhone || '',
      capacity: b.capacity || 35,
      assignedStudents: b.assignedStudents || 0,
      routePath: b.routePath || '',
      status: b.status || 'Active'
    })
    setIsModalOpen(true)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!formData.vehicleNo || !formData.driverName) return

    if (editingBus) {
      await updateItem('transport', editingBus.id, formData)
    } else {
      await addItem('transport', formData)
    }
    setIsModalOpen(false)
  }

  const handleDelete = async (id) => {
    if (window.confirm('Delete this transport vehicle record?')) {
      await deleteItem('transport', id)
    }
  }

  const filtered = transport.filter(b =>
    b.vehicleNo.toLowerCase().includes(searchTerm.toLowerCase()) ||
    b.busName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    b.driverName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (b.routePath && b.routePath.toLowerCase().includes(searchTerm.toLowerCase()))
  )

  return (
    <div className="p-4 sm:p-6 md:p-8 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Bus className="w-5 h-5 text-amber-500" />
            <h1 className="text-xl font-bold text-slate-900 tracking-tight">Transport & Fleet Management</h1>
          </div>
          <p className="text-xs text-slate-500 mt-1">Manage school vans, bus routes, driver contacts, and student transport rosters</p>
        </div>

        <button
          onClick={openAddModal}
          className="flex items-center gap-2 px-4 py-2.5 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold rounded-lg text-xs shadow-sm transition-all"
        >
          <Plus className="w-4 h-4" />
          <span>Add Transport Vehicle</span>
        </button>
      </div>

      {/* Search Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-100 shadow-sm flex items-center justify-between gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by vehicle no, route, or driver name..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-sm rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-amber-500/20"
          />
        </div>
        <span className="text-xs text-slate-400 font-medium">Total: {transport.length} vehicles</span>
      </div>

      {/* Grid of Buses */}
      {filtered.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filtered.map(b => (
            <div key={b.id} className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between">
              <div>
                <div className="flex items-start justify-between">
                  <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center font-bold">
                    <Bus className="w-5 h-5" />
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="font-mono text-xs font-bold px-2 py-0.5 bg-slate-100 rounded text-slate-700">
                      {b.vehicleNo}
                    </span>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-600">
                      {b.status || 'Active'}
                    </span>
                  </div>
                </div>

                <h3 className="text-base font-bold text-slate-900 mt-3">{b.busName}</h3>
                <p className="text-xs text-slate-500 mt-1 flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  <span className="truncate">{b.routePath || 'Campus Routine Route'}</span>
                </p>

                <div className="mt-4 pt-3 border-t border-slate-50 space-y-1.5 text-xs text-slate-600">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">Assigned Driver:</span>
                    <strong className="text-slate-800">{b.driverName}</strong>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">Driver Phone:</span>
                    <span className="font-mono font-medium text-slate-700">{b.driverPhone || '—'}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">Passenger Load:</span>
                    <span className="font-semibold text-slate-700">{b.assignedStudents || 0} / {b.capacity || 35} Seats</span>
                  </div>
                </div>

                <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden mt-3">
                  <div 
                    className="bg-amber-500 h-full rounded-full" 
                    style={{ width: `${Math.min(100, Math.round(((b.assignedStudents || 0) / (b.capacity || 35)) * 100))}%` }}
                  ></div>
                </div>
              </div>

              <div className="mt-5 pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
                <button onClick={() => openEditModal(b)} className="p-1.5 text-slate-400 hover:text-blue-600 rounded">
                  <Edit2 className="w-4 h-4" />
                </button>
                <button onClick={() => handleDelete(b.id)} className="p-1.5 text-slate-400 hover:text-rose-600 rounded">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-slate-100 p-12 text-center shadow-sm">
          <Bus className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h3 className="text-base font-bold text-slate-700">0 Transport Vehicles Registered</h3>
          <p className="text-xs text-slate-400 max-w-sm mx-auto mt-1">
            No transport buses or vans registered yet. Click "Add Transport Vehicle" to add vehicle routes and drivers.
          </p>
          <button
            onClick={openAddModal}
            className="mt-4 px-5 py-2.5 bg-amber-500 hover:bg-amber-600 text-slate-950 rounded-lg text-xs font-bold shadow inline-flex items-center gap-1.5"
          >
            <Plus className="w-4 h-4" />
            <span>Add First School Bus</span>
          </button>
        </div>
      )}

      {/* Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingBus ? 'Edit Transport Details' : 'Register New Transport Vehicle'}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-600 uppercase mb-1">Vehicle Plate / Registration</label>
              <input
                type="text"
                required
                placeholder="e.g. LEA-4890"
                value={formData.vehicleNo}
                onChange={(e) => setFormData({ ...formData, vehicleNo: e.target.value.toUpperCase() })}
                className="w-full px-3.5 py-2.5 rounded-lg border border-slate-200 text-sm font-mono uppercase"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-600 uppercase mb-1">Bus / Route Name</label>
              <input
                type="text"
                required
                placeholder="e.g. Bus #01 (Model Town Route)"
                value={formData.busName}
                onChange={(e) => setFormData({ ...formData, busName: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-lg border border-slate-200 text-sm"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-600 uppercase mb-1">Driver Full Name</label>
              <input
                type="text"
                required
                placeholder="e.g. Muhammad Rafiq"
                value={formData.driverName}
                onChange={(e) => setFormData({ ...formData, driverName: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-lg border border-slate-200 text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-600 uppercase mb-1">Driver Mobile Phone</label>
              <input
                type="text"
                placeholder="+92 301 5566778"
                value={formData.driverPhone}
                onChange={(e) => setFormData({ ...formData, driverPhone: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-lg border border-slate-200 text-sm"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-600 uppercase mb-1">Seating Capacity</label>
              <input
                type="number"
                value={formData.capacity}
                onChange={(e) => setFormData({ ...formData, capacity: Number(e.target.value) })}
                className="w-full px-3.5 py-2.5 rounded-lg border border-slate-200 text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-600 uppercase mb-1">Operating Status</label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-lg border border-slate-200 text-sm bg-white"
              >
                <option value="Active">Active / On Duty</option>
                <option value="Under Maintenance">Under Maintenance</option>
                <option value="Inactive">Inactive</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-600 uppercase mb-1">Route Path & Stops</label>
            <input
              type="text"
              placeholder="e.g. Main Campus -> Gulberg III -> Model Town Block C"
              value={formData.routePath}
              onChange={(e) => setFormData({ ...formData, routePath: e.target.value })}
              className="w-full px-3.5 py-2.5 rounded-lg border border-slate-200 text-sm"
            />
          </div>

          <div className="flex justify-end gap-3 pt-3 border-t">
            <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 text-sm text-slate-600">Cancel</button>
            <button type="submit" className="px-5 py-2 text-sm text-slate-950 font-bold bg-amber-500 hover:bg-amber-600 rounded-lg">Save Vehicle</button>
          </div>
        </form>
      </Modal>
    </div>
  )
}

export default TransportView
